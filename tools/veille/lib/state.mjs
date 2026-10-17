// État de la veille automatique (contrat : tools/veille/CONTRACT.md §a.1, §c.1-c.3, §c.9, §f « Fonctions de
// lib/state.mjs », annexe A4) : la politique (policy.json, fusionnée avec DEFAULT_POLICY), les verrous de paires
// (locks.json), l'état versionné (state.json : checkedAt et curseur de rotation par candidat, « à surveiller »,
// refusés, événements attendus, dernières exécutions publiées), la rotation des questions inconnues, les attentes du
// propriétaire (<dépôt principal>/.claude/veille/pending.json) et le rapport de l'exécution, en français.
//
// Fonctions pures, sauf loadState, saveState, loadPolicy, loadLocks, addPending, listPending, resolvePending et
// remindPending, qui lisent ou écrivent un fichier qu'on leur désigne. state.json n'avance que dans le commit publié :
// c'est apply.mjs qui appelle advanceCheckedAt, advanceRotation, mergeWatch et mergeRefused, puis saveState.
//
// Rotation (rotationFor) : toutes les questions « essentiel » inconnues du candidat, puis les
// rotation.unknownDeepPerCandidate (10) questions « approfondi » inconnues suivantes, en partant de rotationCursor dans
// la liste de toutes les questions « approfondi » de la banque (dans son ordre, en bouclant). « Inconnue » : aucune
// approche portée (poids effectif > 0) ni rejetée avec une confiance autre que « low » (knownQuestions et stance de
// src/core/score.ts, recopiés ici : score.ts importe sans extension, Node ne le charge pas tel quel). nextCursor est
// placé juste après la dernière question prise.
//
// Rapport (renderReport, annexe A4) : En ligne, Publié, Retenu, Écarté, Candidats, Attentes, Chiffres du profil, Jetons,
// Incidents. La copie versionnée passe par redactHidden : aucun candidat masqué n'y est nommé.

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { DEFAULT_POLICY, SCHEMAS, validate } from '../schemas.mjs'
import { CONTROL_FILES, EXIT, VeilleError, frenchDate, isoInParis, paths, readControlJson, readJson, sourceKey, writeJson } from './common.mjs'

// ——— Politique et verrous de paires ———

const isPlain = v => !!v && typeof v === 'object' && !Array.isArray(v)

/** {...DEFAULT_POLICY, ...fichier}, fusion profonde sur un niveau (une clé absente prend sa valeur par défaut) */
export function mergePolicy(file = {}) {
  const out = structuredClone(DEFAULT_POLICY)
  for (const [k, v] of Object.entries(file ?? {})) out[k] = isPlain(v) && isPlain(out[k]) ? { ...out[k], ...v } : v
  return out
}

/**
 * La politique de root (V/policy.json lu à origin/main, readControlText de lib/common.mjs : jamais la copie de l'arbre de
 * travail, qu'une exécution pourrait affaiblir ; absente = valeurs par défaut) ; non conforme : VeilleError 2
 */
export function loadPolicy(root) {
  let raw
  try {
    raw = readControlJson(root, CONTROL_FILES.policy, {})
  } catch (e) {
    throw new VeilleError(EXIT.USAGE, `policy.json illisible : ${e.message}`)
  }
  const policy = mergePolicy(raw)
  const errors = validate(SCHEMAS.POLICY, policy)
  if (errors.length) throw new VeilleError(EXIT.USAGE, `policy.json non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  return policy
}

/** Les verrous de paires (V/locks.json lu à origin/main comme la politique ; absent = aucun) ; non conforme : VeilleError 2 */
export function loadLocks(root) {
  let locks
  try {
    locks = readControlJson(root, CONTROL_FILES.locks, { format: 'isoloir-veille-locks/1', locks: [] })
  } catch (e) {
    throw new VeilleError(EXIT.USAGE, `locks.json illisible : ${e.message}`)
  }
  const errors = validate(SCHEMAS.LOCKS, locks)
  if (errors.length) throw new VeilleError(EXIT.USAGE, `locks.json non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  return locks
}

/** Les verrous encore valables ce jour-là (until null ou ≥ today) */
export const activeLocks = (locks, today) => (locks?.locks ?? []).filter(l => l.since <= today && (l.until == null || l.until >= today))

// ——— État versionné ———

/** Événements officiels attendus de la graine (CONTRACT §a.1) */
export const EXPECTED_SEED = Object.freeze([
  { id: 'liste-officielle', label: 'Liste officielle du Conseil constitutionnel', from: '2027-03-12', status: 'attendu', url: null },
  { id: 'lepen-eligibilite', label: 'Décision sur l’éligibilité de Marine Le Pen', from: null, status: 'attendu', url: null },
  { id: 'zemmour-officialisation', label: 'Déclaration formelle de la candidature d’Éric Zemmour', from: null, status: 'attendu', url: null },
  { id: 'bertrand-officialisation', label: 'Déclaration formelle de la candidature de Xavier Bertrand', from: null, status: 'attendu', url: null },
  { id: 'resultats-t1', label: 'Résultats du premier tour', from: '2027-04-18', status: 'attendu', url: null },
  { id: 'resultats-t2', label: 'Résultats du second tour', from: '2027-05-02', status: 'attendu', url: null },
])
/** Graine : checkedAt de chaque candidat présenté au 9 octobre 2026, sauf ceux de exceptions ({ polony: '2026-10-14' }) */
export function seedState(visibleIds, { checkedAt = '2026-10-09', exceptions = { polony: '2026-10-14' } } = {}) {
  return {
    format: 'isoloir-veille-state/1',
    electionId: 'presidentielle-2027',
    candidates: Object.fromEntries(visibleIds.map(id => [id, { checkedAt: exceptions[id] ?? checkedAt, rotationCursor: 0, lastRunId: null, programmeSeen: null }])),
    watch: [],
    refused: [],
    expected: EXPECTED_SEED.map(e => ({ ...e })),
    lastRuns: {},
  }
}

/** L'état versionné de root (V/state.json) ; absent ou non conforme : VeilleError 2 */
export function loadState(root) {
  const file = paths(root).state
  if (!existsSync(file)) throw new VeilleError(EXIT.USAGE, `${file} absent : la graine de state.json manque`)
  const state = readJson(file)
  const errors = validate(SCHEMAS.STATE, state)
  if (errors.length) throw new VeilleError(EXIT.USAGE, `state.json non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  return state
}
/** Écrit l'état (validé d'abord : VeilleError 31 s'il n'est pas conforme, rien n'est écrit) */
export function saveState(root, state) {
  const errors = validate(SCHEMAS.STATE, state)
  if (errors.length) throw new VeilleError(EXIT.CODE, `état non conforme, non écrit : ${errors.slice(0, 10).join(' ; ')}`)
  writeJson(paths(root).state, state)
}

/** checkedAt à today (jamais en arrière) et lastRunId pour ces candidats ; un candidat absent est ajouté (curseur 0) */
export function advanceCheckedAt(state, ids, today, runId) {
  const next = structuredClone(state)
  for (const id of ids ?? []) {
    const cur = next.candidates[id]
    if (!cur) next.candidates[id] = { checkedAt: today, rotationCursor: 0, lastRunId: runId ?? null, programmeSeen: null }
    else next.candidates[id] = { ...cur, checkedAt: cur.checkedAt > today ? cur.checkedAt : today, lastRunId: runId ?? cur.lastRunId ?? null }
  }
  return next
}

const bankQuestions = bank => bank?.bank?.questions ?? bank?.questions ?? []
const bankPositions = bank => bank?.positions ?? {}

/** Poids effectif et rejet comptés comme src/core/score.ts (stance) : ≠ 0 = la position compte */
export function stanceOf(p) {
  if (!p || p.confidence === 'low') return 0
  if (p.weight) return p.nature === 'inference' ? Math.min(p.weight, 1) : p.weight
  return p.rejects ? -1 : 0
}
/** Le candidat est-il connu sur cette question ? (knownQuestions de src/core/score.ts) */
export const isKnownOn = (table, question) => (question?.approaches ?? []).some(a => stanceOf(table?.[a.id]) !== 0)

/** Questions de la banque où le candidat est inconnu, dans l'ordre de la banque */
export function unknownQuestions(bank, candidateId) {
  const table = bankPositions(bank)[candidateId] ?? {}
  return bankQuestions(bank).filter(q => !isKnownOn(table, q))
}

/** Rotation du candidat : { questions, nextCursor } (voir l'en-tête) */
export function rotationFor(state, bank, candidateId, policy = DEFAULT_POLICY) {
  const n = policy.rotation?.unknownDeepPerCandidate ?? 10
  const table = bankPositions(bank)[candidateId] ?? {}
  const qs = bankQuestions(bank)
  const essentials = qs.filter(q => q.tier === 'essentiel' && !isKnownOn(table, q)).map(q => q.id)
  const deep = qs.filter(q => q.tier === 'approfondi')
  const cursor0 = state?.candidates?.[candidateId]?.rotationCursor ?? 0
  if (!deep.length) return { questions: essentials, nextCursor: cursor0 }
  const cursor = ((cursor0 % deep.length) + deep.length) % deep.length
  const taken = []
  let last = -1
  for (let i = 0; i < deep.length && taken.length < n; i++) {
    const idx = (cursor + i) % deep.length
    if (!isKnownOn(table, deep[idx])) {
      taken.push(deep[idx].id)
      last = idx
    }
  }
  return { questions: [...essentials, ...taken], nextCursor: last < 0 ? cursor : (last + 1) % deep.length }
}

/** Avance les curseurs : used = { <candidat>: nextCursor } (de rotationFor) ; un candidat absent de l'état est ignoré */
export function advanceRotation(state, used = {}) {
  const next = structuredClone(state)
  for (const [id, cursor] of Object.entries(used)) {
    if (next.candidates[id] && Number.isInteger(cursor) && cursor >= 0) next.candidates[id] = { ...next.candidates[id], rotationCursor: cursor }
  }
  return next
}

/** Fusion de deux listes « à surveiller » par clé : firstSeen au plus tôt, lastSeen au plus tard, le reste du plus récent */
export function mergeWatchEntries(existing = [], incoming = []) {
  const out = existing.map(e => ({ ...e }))
  for (const e of incoming) {
    const i = out.findIndex(x => x.key === e.key)
    if (i < 0) {
      out.push({ ...e })
      continue
    }
    const old = out[i]
    const newer = (e.lastSeen ?? '') >= (old.lastSeen ?? '') ? e : old
    const urls = new Set()
    const sources = [...(newer.sources ?? []), ...((newer === e ? old : e).sources ?? [])].filter(s => {
      const k = sourceKey(s.url)
      if (urls.has(k)) return false
      urls.add(k)
      return true
    })
    out[i] = {
      ...old,
      ...newer,
      firstSeen: [old.firstSeen, e.firstSeen].filter(Boolean).sort()[0],
      lastSeen: [old.lastSeen, e.lastSeen].filter(Boolean).sort().at(-1),
      ...(sources.length ? { sources } : {}),
    }
  }
  return out
}
/** state.watch fondu avec ces entrées (L/watch.json ou classify) */
export function mergeWatch(state, entries = []) {
  return { ...structuredClone(state), watch: mergeWatchEntries(state.watch ?? [], entries) }
}
/** Les attentes « candidat » refusées par le propriétaire, fondues dans state.refused (clé = slug, sans « C- ») */
export function mergeRefused(state, pendingItems = []) {
  const next = structuredClone(state)
  for (const p of pendingItems) {
    if (p.kind !== 'candidat' || p.status !== 'refusé' || !/^C-/.test(p.id)) continue
    const key = p.id.slice(2)
    if (next.refused.some(r => r.key === key)) continue
    const decided = String(p.decidedAt ?? p.createdAt ?? '').slice(0, 10)
    next.refused.push({ key, name: p.details?.name ?? p.summary, decidedAt: decided, ...(p.note ? { note: p.note } : {}) })
  }
  return next
}

// ——— Attentes du propriétaire (L/pending.json) ———

/** Préfixe d'un identifiant d'attente → son type (CONTRACT §c.9) */
export const PENDING_KINDS = Object.freeze({ C: 'candidat', R: 'retrait', H: 'hold', D: 'redeclaration', I: 'reintegration', O: 'official', F: 'fiche', Q: 'question' })
export const pendingKindOf = id => PENDING_KINDS[String(id ?? '').split('-')[0]] ?? null

const pendingFile = localDir => join(localDir, 'pending.json')
const emptyPending = () => ({ format: 'isoloir-veille-pending/1', items: [] })

/** Contenu de pending.json (absent = vide) ; non conforme : VeilleError 31 (fichier abîmé, à regarder) */
export function readPendingFile(localDir) {
  const v = readJson(pendingFile(localDir), emptyPending())
  const errors = validate(SCHEMAS.PENDING_FILE, v)
  if (errors.length) throw new VeilleError(EXIT.CODE, `pending.json non conforme : ${errors.slice(0, 5).join(' ; ')}`)
  return v
}

/**
 * Complète une attente (createdAt, status « attente », approveWith « OK <id> », kind tiré du préfixe) et la valide :
 * VeilleError 2 si elle n'est pas conforme, si son type ne va pas avec son préfixe, ou si approveWith n'est pas « OK <id> ».
 */
export function normalizePendingItem(raw, defaults = {}) {
  if (!isPlain(raw)) throw new VeilleError(EXIT.USAGE, 'attente : objet JSON attendu')
  const kind = raw.kind ?? pendingKindOf(raw.id)
  const item = {
    id: raw.id,
    kind,
    branch: raw.branch ?? defaults.branch ?? null,
    worktree: raw.worktree ?? defaults.worktree ?? null,
    createdAt: raw.createdAt ?? defaults.createdAt,
    runId: raw.runId ?? defaults.runId,
    baseCommit: raw.baseCommit ?? defaults.baseCommit ?? null,
    summary: raw.summary,
    approveWith: raw.approveWith ?? `OK ${raw.id}`,
    status: raw.status ?? 'attente',
    remindedAt: raw.remindedAt ?? [],
    decidedAt: raw.decidedAt ?? null,
    details: raw.details ?? {},
    ...(raw.note ? { note: raw.note } : {}),
  }
  const errors = validate(SCHEMAS.PENDING_ITEM, item)
  if (pendingKindOf(item.id) !== item.kind) errors.push(`$.kind : « ${item.kind} » ne va pas avec l'identifiant ${item.id} (${pendingKindOf(item.id) ?? 'préfixe inconnu'})`)
  if (item.approveWith !== `OK ${item.id}`) errors.push(`$.approveWith : « OK ${item.id} » attendu`)
  if (errors.length) throw new VeilleError(EXIT.USAGE, `attente non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  return item
}

/**
 * Ajoute une attente, de façon idempotente par id : une attente existante (au statut « attente », « accordé » ou
 * « refusé ») n'est jamais recréée ; une attente « caduc » est remplacée. Rend { added, item, existing }.
 */
export function addPending(localDir, raw, defaults = {}) {
  const item = normalizePendingItem(raw, defaults)
  const file = readPendingFile(localDir)
  const i = file.items.findIndex(x => x.id === item.id)
  if (i >= 0 && file.items[i].status !== 'caduc') return { added: false, item: file.items[i], existing: true }
  if (i >= 0) file.items.splice(i, 1)
  file.items.push(item)
  writeJson(pendingFile(localDir), file)
  return { added: true, item, existing: i >= 0 }
}

/** Les attentes, filtrées par statut si on le donne */
export function listPending(localDir, { status } = {}) {
  const items = readPendingFile(localDir).items
  return status ? items.filter(i => i.status === status) : items
}

/** Décision du propriétaire : statut accordé | refusé | caduc, decidedAt, note ; VeilleError 2 si l'attente n'existe pas */
export function resolvePending(localDir, id, status, { note = null, now = new Date() } = {}) {
  if (!['accordé', 'refusé', 'caduc'].includes(status)) throw new VeilleError(EXIT.USAGE, `statut « ${status} » : accordé | refusé | caduc`)
  const file = readPendingFile(localDir)
  const item = file.items.find(x => x.id === id)
  if (!item) throw new VeilleError(EXIT.USAGE, `aucune attente ${id}`)
  item.status = status
  item.decidedAt = isoInParis(now)
  if (note) item.note = note
  writeJson(pendingFile(localDir), file)
  return item
}

/** Attentes « attente » de plus de reminderHours sans rappel depuis reminderHours ; pure */
export function dueReminders(items, now = new Date(), policy = DEFAULT_POLICY) {
  const h = (policy.reminderHours ?? 48) * 3600 * 1000
  const t = now.getTime()
  return items.filter(i => {
    if (i.status !== 'attente') return false
    if (t - Date.parse(i.createdAt) < h) return false
    const last = (i.remindedAt ?? []).map(Date.parse).filter(Number.isFinite).sort((a, b) => b - a)[0]
    return last == null || t - last >= h
  })
}
/** Rappels dus, notés dans remindedAt (sauf dryRun) ; rend les attentes à rappeler */
export function remindPending(localDir, { now = new Date(), policy = DEFAULT_POLICY, dryRun = false } = {}) {
  const file = readPendingFile(localDir)
  const due = dueReminders(file.items, now, policy)
  if (!dryRun && due.length) {
    const at = isoInParis(now)
    for (const i of due) i.remindedAt = [...(i.remindedAt ?? []), at]
    writeJson(pendingFile(localDir), file)
  }
  return due
}

// ——— Rapport (annexe A4) ———

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const stripAccents = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/**
 * Le texte sans aucun nom de candidat masqué : nom complet, nom de famille (les mots après le prénom) et identifiant,
 * avec ou sans accents, sans tenir compte de la casse, en mot entier (comme tests/hidden.test.ts) ; remplacés par
 * « [candidat masqué] ».
 */
export function redactHidden(text, hidden = []) {
  let out = String(text ?? '')
  const forms = new Set()
  for (const h of hidden) {
    const words = String(h.name ?? '').trim().split(/\s+/).filter(Boolean)
    for (const f of [h.name, words.slice(1).join(' '), h.id]) {
      if (!f || f.length < 3) continue
      forms.add(f)
      forms.add(stripAccents(f))
    }
  }
  // Les plus longues d'abord : « Ségolène Royal » avant « Royal »
  for (const f of [...forms].sort((a, b) => b.length - a.length)) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(f)}(?![\\p{L}\\p{N}])`, 'giu'), '[candidat masqué]')
  }
  return out
}

const KIND_LABEL = { quotidien: 'veille quotidienne des candidats', hebdo: 'relevé hebdomadaire des positions', candidat: 'préparation d’un candidat', retrait: 'préparation d’un retrait', accord: 'accord du propriétaire' }
const STATUS_LABEL = { 'en-cours': 'en cours', ok: 'terminée', rien: 'rien de neuf', partiel: 'partielle', gel: 'reportée (gel)', budget: 'arrêtée (budget)', échec: 'en échec', attente: 'en attente du propriétaire', interrompu: 'interrompue' }
const CAUSE_LABEL = { 'prise-de-position': 'prise de position', relecture: 'relecture', 'nouvelle-approche': 'nouvelle approche' }

const n0 = n => new Intl.NumberFormat('fr-FR').format(Math.round(Number(n) || 0)).replace(/ /g, ' ')
const stanceLabel = p => (!p ? 'inconnue' : p.weight === 2 ? 'principale' : p.weight === 1 ? 'compatible' : p.rejects ? 'rejet' : 'sans poids')
const sourcesText = srcs => (srcs ?? []).map(s => `${s.publisher ?? s.title ?? 'source'}${s.date ? ` (${s.date})` : ''} <${s.url}>`).join(' ; ')
const positionText = p => (p ? `${stanceLabel(p)} « ${p.summary} »` : 'inconnue')

/**
 * Le rapport en Markdown. Entrées (toutes facultatives sauf runId) :
 *   run (RUN), start (sortie de run start), applyReport (APPLY_REPORT), classify (CLASSIFY_RESULT), watch
 *   (WATCH_RESULT), remeasure ({ auditPatched, constantsPatched, drift, verdicts }), ship (sortie de ship.mjs),
 *   lastShip (LAST_SHIP), gate (sortie de gate-time), journal (lignes de journal.jsonl), outputs ({ <fichier>: sortie }
 *   pour les raisons des incidents), pending (attentes en cours), spend ({ lines de cette exécution, totals, limits }),
 *   policy, names ({ <id>: nom }).
 */
export function renderReport(input) {
  const { run = null, start = null, applyReport = null, classify = null, watch = null, remeasure = null, ship = null, lastShip = null, gate = null,
    journal = [], outputs = {}, pending = [], spend = null, policy = DEFAULT_POLICY, names = {} } = input
  const runId = input.runId ?? run?.runId ?? start?.runId
  const kind = run?.kind ?? start?.kind ?? null
  const today = run?.today ?? start?.today ?? null
  const name = id => names[id] ?? id
  const L = []
  L.push(`# Veille du ${today ? frenchDate(today) : '?'} : ${KIND_LABEL[kind] ?? kind ?? 'exécution'}`)
  L.push('')
  L.push(`Exécution \`${runId}\`${run?.essai || start?.essai ? ' (essai : rien ne se publie)' : ''}, statut : ${STATUS_LABEL[run?.status] ?? run?.status ?? 'non démarrée'}${run?.note ? ` (${run.note})` : ''}.`)
  if (run?.baseCommit) L.push(`Départ d’origin/main \`${String(run.baseCommit).slice(0, 7)}\`${run.branch ? `, branche \`${run.branch}\`` : ''}.`)

  // 1. En ligne
  L.push('', '## En ligne', '')
  // ship.mjs : { merge, tree, indexAsset, deployUrl, lastShip: LAST_SHIP, dryRun, empty } ; last-ship.json local à défaut
  const shipped = ship && ship.code === 0 && !ship.dryRun && !ship.empty && (ship.lastShip?.deployed ?? ship.deployed ?? true)
  const ls = lastShip && lastShip.runId === runId ? lastShip : null
  const frozen = run?.status === 'gel' || [11, 12].includes(start?.code) || [11, 12].includes(gate?.code) || [11, 12].includes(ship?.code)
  const published = applyReport?.published ?? []
  if (shipped || ls?.deployed) {
    const s = shipped ? { ...ship, ...(ship.lastShip ?? {}), sha: ship.lastShip?.sha ?? ship.merge ?? ship.sha } : ls
    L.push(`Données ${s.dataVersion ?? '?'} en ligne : commit \`${String(s.sha ?? '?').slice(0, 7)}\`, asset \`${s.indexAsset ?? '?'}\`${s.checked === false ? ' (contrôle de la production en échec)' : ''}.`)
  } else if (frozen) {
    const why = [start, gate, ship].find(x => [11, 12].includes(x?.code))?.reason ?? run?.note ?? 'période de gel'
    L.push(`Reporté (gel) : ${why}.`)
  } else if (ship && ship.code !== 0) {
    L.push(`Non publié : la mise en ligne s’est arrêtée (code ${ship.code}${ship.reason ? ` : ${ship.reason}` : ''}).`)
  } else if (ship?.dryRun) {
    L.push('Non publié : essai à blanc (ship --dry-run), tous les contrôles passés.')
  } else if (!published.length && !(classify?.qualifying?.length || classify?.withdrawals?.length)) {
    L.push('Rien de neuf.')
  } else {
    L.push('Rien n’est mis en ligne par cette exécution.')
  }

  // 2. Publié
  L.push('', '## Publié', '')
  if (!published.length) L.push('Aucun changement de position.')
  const byCand = new Map()
  for (const c of published) byCand.set(c.candidateId, [...(byCand.get(c.candidateId) ?? []), c])
  for (const [cid, list] of byCand) {
    L.push(`- **${name(cid)}**`)
    for (const c of list) {
      const cause = `${CAUSE_LABEL[c.cause] ?? c.cause}${c.statedAt ? ` du ${frenchDate(c.statedAt)}` : ''}`
      const where = c.kind === 'addApproach' ? `approche ajoutée ${c.approachId}${c.text ? ` « ${c.text} »` : ''}` : `${c.approachId ?? c.questionId}`
      const srcs = sourcesText((c.after ?? c.before)?.sources)
      L.push(`  - ${where} (${c.class}) : ${positionText(c.before)} → ${c.kind === 'remove' ? 'retirée' : positionText(c.after)} ; cause : ${cause}${srcs ? ` ; sources : ${srcs}` : ''}`)
    }
  }

  // 3. Retenu
  L.push('', '## Retenu', '')
  const held = applyReport?.held ?? []
  if (!held.length) L.push('Rien n’est retenu.')
  for (const h of held) {
    const c = h.change ?? {}
    L.push(`- **${h.id}** : ${name(c.candidateId)}, ${c.approachId ?? c.questionId ?? '?'} ; raison : ${h.reason}${h.detail ? ` (${h.detail})` : ''}. Pour publier : « OK ${h.id} ».`)
  }

  // 4. Écarté
  L.push('', '## Écarté', '')
  const dropped = applyReport?.dropped ?? []
  if (!dropped.length) L.push('Rien n’est écarté.')
  const counts = {}
  for (const d of dropped) counts[d.reason] = (counts[d.reason] ?? 0) + 1
  for (const [r, n] of Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) L.push(`- ${r} : ${n}`)

  // 5. Candidats
  L.push('', '## Candidats', '')
  if (!classify) L.push('Pas de veille des candidats dans cette exécution.')
  else {
    const line = (label, items, fmt) => {
      if (items?.length) {
        L.push(`- ${label} :`)
        for (const x of items) L.push(`  - ${fmt(x)}`)
      }
    }
    line('Qualifiants (préparation sur une branche, puis « OK C-<id> »)', classify.qualifying, q => `${q.name} (\`${q.slug}\`${q.party ? `, ${q.party}` : ''}) : ${(q.reasons ?? []).join(' ; ')}`)
    line('Différés (plafond des préparations)', classify.deferred, d => `\`${d.slug}\` : ${d.reason}`)
    line('Retraits confirmés (préparation du masquage, puis « OK R-<id> »)', classify.withdrawals, w => `${name(w.candidateId)} : ${sourcesText(w.sources)}`)
    line('Candidatures d’un candidat masqué (attente D-<id>)', classify.redeclarations, r => `${name(r.candidateId)} (${r.ref})`)
    line('Conditions levées ou ajoutées', classify.conditions, c => `${name(c.candidateId ?? '?')} : ${c.conditionChange ?? ''} ${c.summary ?? ''}`.trim())
    line('Événements officiels', classify.official, o => `${o.type ?? 'événement'} : ${o.detail ?? o.summary ?? o.ref}`)
    line('Signes de non-candidature, sans retrait sourcé', classify.stillDeclaredFalse, id => name(id))
    const fresh = new Set(classify.watchNew ?? [])
    line('À surveiller', classify.watch, w => `${w.name}${w.party ? ` (${w.party})` : ''} : ${w.reason}${w.detail ? `, ${w.detail}` : ''}${fresh.has(w.key) ? ' (nouveau)' : ''}`)
    if (!['qualifying', 'deferred', 'withdrawals', 'redeclarations', 'conditions', 'official', 'stillDeclaredFalse', 'watch'].some(k => classify[k]?.length)) L.push('Aucun changement dans la liste des candidats.')
  }
  const expected = (watch?.expectedChecked ?? []).filter(e => e.status === 'publié')
  for (const e of expected) L.push(`- Événement attendu publié : ${e.id}${e.url ? ` <${e.url}>` : ''}`)
  if (policy?.mepCountsAsNational) L.push('', 'Interprétation à confirmer par le propriétaire : les députés européens élus en France comptent comme des élus nationaux pour le seuil d’un nouveau candidat (policy.mepCountsAsNational).')

  // 6. Attentes
  L.push('', '## Attentes du propriétaire', '')
  const waiting = pending.filter(p => p.status === 'attente')
  if (!waiting.length) L.push('Aucune attente.')
  for (const p of waiting) L.push(`- **${p.id}** (${p.kind}, depuis le ${frenchDate(String(p.createdAt).slice(0, 10))}) : ${p.summary} Réponse : « ${p.approveWith} ».`)

  // 7. Chiffres du profil
  L.push('', '## Chiffres du profil', '')
  if (!remeasure) L.push('Pas de nouvelle mesure dans cette exécution.')
  else {
    if (remeasure.code != null && remeasure.code !== 0) L.push(`Mesure arrêtée (code ${remeasure.code}${remeasure.reason ? ` : ${remeasure.reason}` : ''}).`)
    L.push(remeasure.auditPatched ? 'Bornes d’audit de election.ts mesurées à nouveau.' : 'Bornes d’audit inchangées.')
    L.push(remeasure.constantsPatched?.length ? `Constantes remplacées : ${remeasure.constantsPatched.join(', ')}.` : 'Aucune constante publiée remplacée.')
    const drift = remeasure.drift ?? []
    if (drift.length) {
      L.push('', '| Clé | Publié | Mesuré |', '|---|---|---|')
      for (const d of drift) L.push(`| ${d.key} | ${d.published} | ${d.measured} |`)
    }
    const verdicts = Object.entries(remeasure.verdicts ?? {})
    if (verdicts.length) L.push('', `Verdicts D5 : ${verdicts.map(([k, v]) => `${k} ${v}`).join(' ; ')}.`)
  }

  // 8. Jetons
  L.push('', '## Jetons', '')
  const lines = spend?.lines ?? []
  if (!lines.length) L.push('Aucune dépense enregistrée pour cette exécution.')
  else {
    const byStage = {}
    const byCandidate = {}
    for (const l of lines) {
      byStage[l.stage] = (byStage[l.stage] ?? 0) + (Number(l.tokens) || 0)
      for (const [c, t] of Object.entries(l.byCandidate ?? {})) byCandidate[c] = (byCandidate[c] ?? 0) + t
    }
    L.push(`Par étape : ${Object.entries(byStage).map(([s, t]) => `${s} ${n0(t)}`).join(' ; ')}.`)
    const cands = Object.entries(byCandidate).sort((a, b) => b[1] - a[1])
    if (cands.length) L.push(`Par candidat : ${cands.map(([c, t]) => `${name(c)} ${n0(t)}`).join(' ; ')}.`)
  }
  if (spend?.totals && spend?.limits) {
    const t = spend.totals
    const l = spend.limits
    L.push(`Budget : jour ${n0(t.day)} / ${n0(l.day)} ; semaine ${n0(t.week)} / ${n0(l.week)} ; mois ${n0(t.month)} / ${n0(l.month)}.`)
  }
  if (start?.budget?.softMonthly) L.push('Plus de 80 % du budget du mois : seuls les candidats classés ont été relevés.')

  // 9. Incidents
  L.push('', '## Incidents', '')
  const incidents = journal.filter(j => j.code !== 0)
  if (!incidents.length) L.push('Aucun.')
  for (const j of incidents) {
    const out = outputs[`${j.script}${j.tag ? `-${j.tag}` : ''}`]
    const reason = out && out.code === j.code ? out.reason : null
    L.push(`- ${j.at ?? ''} ${j.script}${j.tag ? ` ${j.tag}` : ''} : code ${j.code}${reason ? ` (${reason})` : ''}`)
  }
  L.push('')
  return L.join('\n')
}
