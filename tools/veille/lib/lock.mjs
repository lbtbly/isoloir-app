// Verrou et worktrees des exécutions de la veille automatique (contrat : tools/veille/CONTRACT.md §a.2, §c.10 LOCK,
// §d.3, §d.14) : une seule exécution à la fois, dans <dépôt principal>/.claude/veille/lock.json ; battement de cœur ;
// reprise d'un verrou périmé, notée ; worktrees lancés sous le même verrou (préparations, rederive) ; et le plan de
// nettoyage des vieux worktrees veille-* (cleanup.mjs), calculé sans rien toucher.
//
// Verrou (schéma LOCK de schemas.mjs) : { runId, kind, worktrees: [{ path, runId }], startedAt, heartbeatAt, phase, pid,
// takenOverFrom }. Créé de façon atomique (openSync 'wx'). Périmé quand heartbeatAt a plus de
// policy.lock.staleHeartbeatHours (4 h) ou startedAt plus de policy.lock.maxAgeHours (24 h) : il est alors repris,
// l'ancien gardé à côté (lock.json.repris) et son runId noté dans takenOverFrom ; deux reprises simultanées ne gagnent
// jamais toutes les deux (l'ancien verrou s'écarte sous un nom propre au concurrent, puis se compare à celui qu'il a lu).
// Le premier worktree de la liste est celui de l'exécution ; un worktree de rederive s'y ajoute avec le runId de
// l'exécution et libère tout le verrou à la fin ; une préparation (run start --parent) y ajoute le sien, avec son
// propre runId, et ne libère que sa ligne.
//
// Nettoyage (planCleanup) : seuls les worktrees <principal>/.claude/worktrees/veille-<runId> dont le runId suit le motif
// RUN_ID (« veille-auto » n'en est pas un) ; jamais accord-*, wf_* ni ceux des autres sessions ; jamais le courant, ni
// un worktree tenu par le verrou, cité par une attente « attente », ou parmi les 3 derniers en échec ; seulement après
// cleanupDays jours (date du runId). Les branches veille/* ne s'effacent qu'ancêtres d'origin/main (vérifié par le
// script, pas ici).
//
// Usage :
//   import { acquireLock, heartbeatLock, releaseLock, inspectLock, planCleanup } from './lib/lock.mjs'

import { closeSync, existsSync, linkSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, unlinkSync, writeSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { RUN_ID } from '../schemas.mjs'
import { EXIT, VeilleError, daysBetween, isoInParis, stableJson, todayInParis, writeJson } from './common.mjs'

const HOUR_MS = 3600 * 1000

/** Chemin réel s'il existe, sinon chemin absolu : pour comparer deux worktrees */
export function realPath(p) {
  try {
    return realpathSync(p)
  } catch {
    return resolve(p)
  }
}
export const samePath = (a, b) => !!a && !!b && realPath(a) === realPath(b)

/** Le verrou, ou null s'il n'existe pas ; un fichier illisible compte comme un verrou périmé (raison donnée) */
export function readLock(file) {
  if (!existsSync(file)) return null
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return { runId: null, kind: null, worktrees: [], startedAt: null, heartbeatAt: null, phase: 'illisible', unreadable: true }
  }
}

/** Raison pour laquelle le verrou est périmé à cet instant, ou null s'il est frais */
export function staleness(lock, now, policy = {}) {
  if (!lock) return null
  if (lock.unreadable) return 'verrou illisible'
  const staleH = policy.lock?.staleHeartbeatHours ?? 4
  const maxH = policy.lock?.maxAgeHours ?? 24
  const t = now.getTime()
  const beat = Date.parse(lock.heartbeatAt ?? '')
  const start = Date.parse(lock.startedAt ?? '')
  if (Number.isNaN(beat) || Number.isNaN(start)) return 'dates du verrou illisibles'
  if (t - start > maxH * HOUR_MS) return `verrou pris il y a ${((t - start) / HOUR_MS).toFixed(1)} h (plus de ${maxH} h)`
  if (t - beat > staleH * HOUR_MS) return `dernier battement il y a ${((t - beat) / HOUR_MS).toFixed(1)} h (plus de ${staleH} h)`
  return null
}

/** La ligne { path, runId } du verrou pour ce worktree, ou null */
export const lockEntryOf = (lock, worktree) => (lock?.worktrees ?? []).find(w => samePath(w.path, worktree)) ?? null

/** État du verrou vu d'un worktree : { lock, stale, entry, primary, free } (free : on peut le prendre ou le reprendre) */
export function inspectLock(file, { now, policy, worktree } = {}) {
  const lock = readLock(file)
  const stale = staleness(lock, now ?? new Date(), policy)
  const entry = lockEntryOf(lock, worktree)
  const primary = !!lock && !!entry && samePath(lock.worktrees?.[0]?.path, worktree)
  return { lock, stale, entry, primary, free: !lock || !!stale }
}

const held = lock => `verrou tenu par ${lock.runId ?? '?'} (${lock.kind ?? '?'}, phase « ${lock.phase ?? ''} », battement ${lock.heartbeatAt ?? '?'})`

function createExclusive(file, lock) {
  // Au tout premier départ, le dossier de l'état local (<M>/.claude/veille/) n'existe pas encore
  mkdirSync(dirname(file), { recursive: true })
  let fd
  try {
    fd = openSync(file, 'wx')
  } catch (e) {
    if (e?.code === 'EEXIST') return false
    throw e
  }
  try {
    writeSync(fd, stableJson(lock))
  } finally {
    closeSync(fd)
  }
  return true
}

/**
 * Prend le verrou pour runId dans worktree. Rend { lock, takenOverFrom, staleReason, reentered, joined }.
 *  - libre : création atomique ;
 *  - tenu par la même exécution dans le même worktree : reprise sans perte (reentered), battement mis à jour ;
 *  - parent donné : le verrou doit être celui du parent (ou le compter parmi ses worktrees) et frais ; la ligne
 *    { path: worktree, runId } s'y ajoute (joined) ;
 *  - périmé : repris (l'ancien est gardé dans <file>.repris), takenOverFrom = son runId ;
 *  - sinon : VeilleError 21.
 */
export function acquireLock(file, { runId, kind, worktree, now = new Date(), policy = {}, parent = null, phase = 'départ', pid = process.pid }) {
  const at = isoInParis(now)
  const path = realPath(worktree)
  const fresh = { runId, kind, worktrees: [{ path, runId }], startedAt: at, heartbeatAt: at, phase, pid, takenOverFrom: null }
  const current = readLock(file)
  if (parent) {
    if (!current) throw new VeilleError(EXIT.LOCKED, `aucun verrou : l'exécution parente ${parent} ne tient pas le verrou`)
    const parentHolds = current.runId === parent || (current.worktrees ?? []).some(w => w.runId === parent)
    if (!parentHolds) throw new VeilleError(EXIT.LOCKED, `${held(current)}, pas par l'exécution parente ${parent}`)
    const stale = staleness(current, now, policy)
    if (stale) throw new VeilleError(EXIT.LOCKED, `verrou de l'exécution parente ${parent} périmé (${stale}) : la préparation ne peut pas s'y joindre`)
    const lock = { ...current, heartbeatAt: at, phase: `${kind} ${runId}` }
    const already = lockEntryOf(current, path)
    if (!already) lock.worktrees = [...(current.worktrees ?? []), { path, runId }]
    writeJson(file, lock)
    return { lock, takenOverFrom: null, staleReason: null, reentered: !!already, joined: true }
  }
  if (!current) {
    if (createExclusive(file, fresh)) return { lock: fresh, takenOverFrom: null, staleReason: null, reentered: false, joined: false }
    throw new VeilleError(EXIT.LOCKED, `${held(readLock(file) ?? {})} (pris à l'instant par une autre exécution)`)
  }
  const first = current.worktrees?.[0]
  if (current.runId === runId && first && samePath(first.path, path)) {
    const lock = { ...current, kind, heartbeatAt: at, phase, pid }
    writeJson(file, lock)
    return { lock, takenOverFrom: null, staleReason: null, reentered: true, joined: false }
  }
  const stale = staleness(current, now, policy)
  if (!stale) throw new VeilleError(EXIT.LOCKED, held(current))
  // Reprise : on écarte le verrou sous un nom propre à ce concurrent, puis on vérifie que c'est bien le verrou périmé
  // qu'on a lu (un autre a pu le reprendre entre la lecture et le renommage) ; sinon on le remet et on sort en 21
  const taken = `${file}.repris.${runId}.${pid}`
  try {
    renameSync(file, taken)
  } catch (e) {
    if (e?.code === 'ENOENT') throw new VeilleError(EXIT.LOCKED, `${held(readLock(file) ?? {})} (repris à l'instant par une autre exécution)`)
    throw e
  }
  const moved = readLock(taken)
  const same = current.unreadable ? !!moved?.unreadable
    : !!moved && moved.runId === current.runId && moved.startedAt === current.startedAt && moved.heartbeatAt === current.heartbeatAt
  if (!same) {
    // Ce n'était plus le verrou périmé : le remettre (linkSync échoue en EEXIST si un tiers a déjà recréé lock.json)
    try {
      linkSync(taken, file)
    } catch (e) {
      if (e?.code !== 'EEXIST') throw e
    }
    try {
      unlinkSync(taken)
    } catch {
      // trace sans importance
    }
    throw new VeilleError(EXIT.LOCKED, `${held(moved ?? {})} (repris à l'instant par une autre exécution)`)
  }
  renameSync(taken, `${file}.repris`)
  const lock = { ...fresh, takenOverFrom: current.runId ?? 'inconnu' }
  if (!createExclusive(file, lock)) throw new VeilleError(EXIT.LOCKED, `${held(readLock(file) ?? {})} (repris à l'instant par une autre exécution)`)
  return { lock, takenOverFrom: lock.takenOverFrom, staleReason: stale, reentered: false, joined: false }
}

/** Battement de cœur : heartbeatAt (et phase) ; VeilleError 21 si le verrou n'est pas à ce worktree */
export function heartbeatLock(file, { worktree, now = new Date(), phase } = {}) {
  const lock = readLock(file)
  if (!lock) throw new VeilleError(EXIT.LOCKED, 'aucun verrou : cette exécution ne le tient plus')
  if (!lockEntryOf(lock, worktree)) throw new VeilleError(EXIT.LOCKED, `${held(lock)}, pas par ce worktree (${worktree})`)
  const next = { ...lock, heartbeatAt: isoInParis(now), ...(phase != null ? { phase } : {}) }
  writeJson(file, next)
  return next
}

/**
 * Libère le verrou de ce worktree : tout le verrou si c'est un worktree de l'exécution elle-même (le premier, ou un
 * worktree de rederive, inscrit avec le runId de l'exécution qu'il rejoue) ; sa seule ligne si c'est une préparation
 * lancée sous le verrou (run start --parent, inscrite avec son propre runId). Rend { released: 'tout' | 'ligne' | false,
 * lock } ; ne lève jamais.
 */
export function releaseLock(file, { worktree } = {}) {
  const lock = readLock(file)
  if (!lock) return { released: false, lock: null }
  const entry = lockEntryOf(lock, worktree)
  if (!entry) return { released: false, lock }
  const ownRun = samePath(lock.worktrees[0]?.path, worktree) || (!!lock.runId && entry.runId === lock.runId)
  if (ownRun) {
    try {
      renameSync(file, `${file}.libere`)
    } catch {
      return { released: false, lock }
    }
    return { released: 'tout', lock: null }
  }
  const next = { ...lock, worktrees: lock.worktrees.filter(w => !samePath(w.path, worktree)) }
  writeJson(file, next)
  return { released: 'ligne', lock: next }
}

// ——— Nettoyage des worktrees ———

/**
 * Lit la sortie de « git worktree list --porcelain » : [{ path, head, branch (sans refs/heads/), detached, locked,
 * prunable, bare }]
 */
export function parseWorktreeList(text) {
  const out = []
  let cur = null
  for (const line of String(text ?? '').split('\n')) {
    if (line.startsWith('worktree ')) {
      cur = { path: line.slice(9), head: null, branch: null, detached: false, locked: false, prunable: false, bare: false }
      out.push(cur)
    } else if (cur && line.startsWith('HEAD ')) cur.head = line.slice(5)
    else if (cur && line.startsWith('branch ')) cur.branch = line.slice(7).replace(/^refs\/heads\//, '')
    else if (cur && line === 'detached') cur.detached = true
    else if (cur && line === 'bare') cur.bare = true
    else if (cur && line.startsWith('locked')) cur.locked = true
    else if (cur && line.startsWith('prunable')) cur.prunable = true
  }
  return out
}

const RUN_ID_RE = new RegExp(RUN_ID)

/**
 * Plan du nettoyage, sans rien toucher. Entrées :
 *   worktrees   parseWorktreeList(…)
 *   mainRoot    racine du dépôt principal (les worktrees de la veille sont dans <mainRoot>/.claude/worktrees/)
 *   current     worktree de l'exécution courante (jamais retiré)
 *   lock        verrou courant (ses worktrees sont gardés)
 *   pending     attentes (PENDING_ITEM) : celles au statut « attente » gardent leur worktree, leur branche, leur runId
 *   runs        RUN des exécutions passées (L/runs/*\/run.json) : les 3 dernières en échec gardent leur worktree
 *   today       AAAA-MM-JJ ; days : âge minimal en jours (policy.cleanupDays)
 * Rend { remove: [{ path, runId, branch, ageDays }], keep: [{ path, runId, reason }] } : seuls les worktrees veille-*.
 */
export function planCleanup({ worktrees = [], mainRoot, current = null, lock = null, pending = [], runs = [], today, days = 14 }) {
  const base = realPath(resolve(mainRoot, '.claude', 'worktrees'))
  const waiting = pending.filter(p => p.status === 'attente')
  const failed = runs
    .filter(r => r?.status === 'échec' && r.worktree)
    .sort((a, b) => String(b.startedAt ?? '').localeCompare(String(a.startedAt ?? '')))
    .slice(0, 3)
  const remove = []
  const keep = []
  for (const w of worktrees) {
    const name = basename(w.path)
    if (!name.startsWith('veille-') || realPath(dirname(w.path)) !== base) continue
    const runId = name.slice('veille-'.length)
    const k = reason => keep.push({ path: w.path, runId, reason })
    if (!RUN_ID_RE.test(runId) || runId.startsWith('accord-')) { k('pas un worktree d’exécution (nom hors du motif)'); continue }
    if (w.branch && !w.branch.startsWith('veille/')) { k(`branche ${w.branch} hors de veille/*`); continue }
    if (current && samePath(w.path, current)) { k('worktree courant'); continue }
    if ((lock?.worktrees ?? []).some(x => samePath(x.path, w.path))) { k('tenu par le verrou'); continue }
    const cited = waiting.find(p => (p.worktree && samePath(p.worktree, w.path)) || (p.branch && w.branch && p.branch === w.branch) || p.runId === runId)
    if (cited) { k(`cité par l'attente ${cited.id}`); continue }
    if (failed.some(r => samePath(r.worktree, w.path))) { k('parmi les 3 dernières exécutions en échec'); continue }
    if (w.locked) { k('worktree verrouillé par git'); continue }
    const day = runId.slice(0, 10)
    const age = daysBetween(day, today ?? todayInParis())
    if (!(age > days)) { k(`récent (${age} j, seuil ${days} j)`); continue }
    remove.push({ path: w.path, runId, branch: w.branch, ageDays: age })
  }
  return { remove, keep }
}
