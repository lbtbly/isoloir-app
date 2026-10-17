// Ce que la veille automatique garde de ses workflows et de la production (contrat : tools/veille/CONTRACT.md §a.2,
// §c.7 CHANGESET, §d.5 persist, §d.13 prod-check) : retrouver le fichier de résultat d'un lancement de l'outil Workflow
// (<projets Claude>/*/<session>/workflows/wf_<id>.json) et son journal d'agents
// (<projets Claude>/*/<session>/subagents/workflows/wf_<id>/journal.jsonl), en tirer la dépense (totalTokens, et par
// candidat d'après les libellés des agents), construire ou compléter le CHANGESET de apply.mjs, reprendre les
// résultats d'agents d'un journal quand le fichier de résultat manque (exécution coupée), copier les dossiers d'une
// recherche sans jamais écraser un fichier différent, refuser une sortie partielle de 6-add-candidate, et comparer
// l'asset servi en production à last-ship.json.
//
// Fonctions pures, sauf findWorkflowFiles (lit des dossiers), readText* et prodCheck (lecture injectable). Aucun
// appel réseau ici : prodCheck reçoit sa fonction de lecture (fetchText), que prod-check.mjs fournit avec le
// User-Agent « IsoloirBot/1.0 ».

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { canonical } from './common.mjs'

// ——— Fichiers de workflow ———

/** « 27a7ffea-14b » → « wf_27a7ffea-14b » (le préfixe est facultatif à l'appel) */
export const normalizeWfId = id => (String(id).startsWith('wf_') ? String(id) : `wf_${id}`)

const dirs = d => {
  try {
    return readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => join(d, e.name))
  } catch {
    return []
  }
}

/**
 * Tous les fichiers de résultat et journaux de ce lancement, dans tous les projets et toutes les sessions :
 * { results: [chemins], journals: [chemins] }, du plus récent au plus ancien.
 */
export function findWorkflowFiles(projectsDir, wfRunId) {
  const id = normalizeWfId(wfRunId)
  const results = []
  const journals = []
  for (const project of dirs(projectsDir)) {
    for (const session of dirs(project)) {
      const r = join(session, 'workflows', `${id}.json`)
      const j = join(session, 'subagents', 'workflows', id, 'journal.jsonl')
      if (existsSync(r)) results.push(r)
      if (existsSync(j)) journals.push(j)
    }
  }
  const byMtime = (a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs
  return { results: results.sort(byMtime), journals: journals.sort(byMtime) }
}

/** Étape de dépense (SPEND_LINE.stage) d'un lancement de ce type */
export function stageOf(kind, result = null) {
  if (kind === 'refresh') return `refresh:${result?.mode ?? 'candidates'}`
  return kind
}

/**
 * Jetons par candidat, d'après les agents de workflowProgress : le candidat est le segment qui suit le premier « : »
 * du libellé (« tri:attal », « verif:attal-2 », « aveugle:attal:sante-1 »), s'il est dans candidateIds.
 */
export function tokensByCandidate(wf, candidateIds = []) {
  const ids = new Set(candidateIds)
  const out = {}
  for (const a of wf?.workflowProgress ?? []) {
    if (a?.type !== 'workflow_agent' || !Number.isFinite(Number(a.tokens))) continue
    const m = /^[^:]+:([a-z][a-z0-9]*)/.exec(String(a.label ?? ''))
    if (!m || !ids.has(m[1])) continue
    out[m[1]] = (out[m[1]] ?? 0) + Number(a.tokens)
  }
  return out
}

/** Un lancement qui a échoué : statut autre que « completed », erreur, ou aucun résultat ; null s'il a réussi */
export function workflowFailure(wf) {
  if (!wf || typeof wf !== 'object') return 'fichier de workflow illisible'
  if (wf.error) return `workflow en erreur : ${String(wf.error).slice(0, 300)}`
  if (wf.status && wf.status !== 'completed') return `workflow au statut « ${wf.status} »`
  if (wf.result == null) return 'workflow sans valeur de retour'
  return null
}

// ——— CHANGESET (entrée de apply.mjs) ———

/**
 * Le changeset complété par une valeur de retour du workflow 9 : créé au premier appel, puis results ajoutés dans
 * l'ordre ; un même lancement (wfRunId) n'est jamais ajouté deux fois (wfRunIds, à côté de results). since vient de
 * run start (sinceMap), et à défaut de la valeur de retour.
 */
export function addToChangeset(existing, { runId, baseCommit, today, sinceMap = {}, result, wfRunId }) {
  const cs = existing
    ? structuredClone(existing)
    : { format: 'isoloir-veille-changeset/1', runId, electionId: 'presidentielle-2027', baseCommit, today, since: {}, results: [], holds: [], approve: [], wfRunIds: [] }
  cs.wfRunIds ??= []
  const already = cs.wfRunIds.includes(wfRunId)
  if (!already) {
    cs.results.push(result)
    cs.wfRunIds.push(wfRunId)
  }
  for (const c of result?.candidates ?? []) {
    if (cs.since[c.candidateId]) continue
    cs.since[c.candidateId] = sinceMap[c.candidateId] ?? c.since
  }
  return { changeset: cs, added: !already }
}

// ——— Reprise d'un journal (exécution coupée) ———

/**
 * Résultats d'agents d'un journal.jsonl : { agents: [{ key, agentId, label, phase, result }], started, finished,
 * missing: [libellés lancés sans résultat], badLines }.
 */
export function recoverFromJournal(text) {
  const started = new Map()
  const results = []
  let badLines = 0
  for (const raw of String(text ?? '').split('\n')) {
    if (!raw.trim()) continue
    let e
    try {
      e = JSON.parse(raw)
    } catch {
      badLines++
      continue
    }
    if (e?.type === 'started' && e.key) started.set(e.key, { label: e.label ?? null, phase: e.phase ?? null, agentId: e.agentId ?? null })
    if (e?.type === 'result' && e.key && e.result != null) results.push(e)
  }
  const done = new Set()
  const agents = []
  for (const r of results) {
    if (done.has(r.key)) continue
    done.add(r.key)
    const s = started.get(r.key) ?? {}
    agents.push({ key: r.key, agentId: r.agentId ?? s.agentId ?? null, label: s.label ?? null, phase: s.phase ?? null, result: r.result })
  }
  const missing = [...started.entries()].filter(([k]) => !done.has(k)).map(([, s]) => s.label ?? '?')
  return { agents, started: started.size, finished: agents.length, missing, badLines }
}

// ——— Recherche (1-research) et ajout de candidat (6-add-candidate) ———

/** Nom de fichier d'extract-journal retenu pour D : dossier_<id>.json, refresh_<id>.json (de ce candidat si donné) */
export function researchFileWanted(name, candidate = null) {
  const m = /^(dossier|refresh)_([a-z][a-z0-9]*)\.json$/.exec(name)
  if (!m) return false
  return !candidate || m[2] === candidate
}

/**
 * Plan de copie des fichiers extraits vers D : { write: [{ name, text }], same: [names], conflicts: [names] }.
 * existing(name) rend le texte du fichier de D, ou null s'il n'existe pas. Deux JSON égaux (clés triées) sont « same ».
 */
export function planResearchCopy(files, existing) {
  const write = []
  const same = []
  const conflicts = []
  for (const f of files) {
    const old = existing(f.name)
    if (old == null) {
      write.push(f)
      continue
    }
    let equal = old === f.text
    if (!equal) {
      try {
        equal = canonical(JSON.parse(old)) === canonical(JSON.parse(f.text))
      } catch {
        equal = false
      }
    }
    if (equal) same.push(f.name)
    else conflicts.push(f.name)
  }
  return { write, same, conflicts }
}

/**
 * Une valeur de retour de 6-add-candidate peut-elle aller dans D/add-candidate/<id>.json ? { ok, reason, partial, id }.
 * Refus : result.error (liste non vide ou texte), format inattendu, sortie partielle (args.onlyGroups non vide : elle
 * ne couvre que ces familles, et ne doit jamais remplacer un fichier complet), candidat différent de celui attendu.
 */
export function checkAddCandidate(wf, expected = null) {
  const r = wf?.result
  const id = r?.candidate ?? null
  const partial = Array.isArray(wf?.args?.onlyGroups) && wf.args.onlyGroups.length > 0
  const err = r?.error
  if (err && (!Array.isArray(err) || err.length)) return { ok: false, partial, id, reason: `6-add-candidate en erreur : ${Array.isArray(err) ? err.join(' ; ') : String(err)}`.slice(0, 500) }
  if (r?.format !== 'isoloir-add-candidate/1') return { ok: false, partial, id, reason: `format « ${r?.format ?? '?'} », attendu isoloir-add-candidate/1` }
  if (!id || !/^[a-z][a-z0-9]*$/.test(id)) return { ok: false, partial, id, reason: 'identifiant du candidat absent de la sortie' }
  if (expected && id !== expected) return { ok: false, partial, id, reason: `sortie pour ${id}, attendue pour ${expected}` }
  if (partial) return { ok: false, partial, id, reason: `sortie partielle (onlyGroups : ${wf.args.onlyGroups.join(', ')}) : jamais écrite à la place d'un fichier complet` }
  return { ok: true, partial, id, reason: null }
}

/** Premier numéro libre ≥ start pour expansion-output-<N>.json, parmi les noms donnés */
export function firstFreeNumber(names, prefix = 'expansion-output-', start = 3) {
  const used = new Set(names.map(n => new RegExp(`^${prefix}(\\d+)\\.json$`).exec(n)?.[1]).filter(Boolean).map(Number))
  let n = start
  while (used.has(n)) n++
  return n
}

// ——— Production ———

/** L'asset « assets/index-*.js » d'une page HTML (src="./assets/…", "/assets/…" ou "assets/…"), ou null */
export function indexAssetOf(html) {
  const m = /<script\b[^>]*\bsrc=["'](?:\.?\/)?(assets\/index-[A-Za-z0-9_-]+\.js)["']/i.exec(String(html ?? ''))
    ?? /["'(](?:\.?\/)?(assets\/index-[A-Za-z0-9_-]+\.js)["')]/.exec(String(html ?? ''))
  return m?.[1] ?? null
}

/**
 * Contrôle de la production : l'asset servi est-il celui de last-ship.json ? Lit `${prodUrl}?v=<horodatage>` avec
 * fetchText(url) (injectable ; rend le texte ou lève), jusqu'à attempts fois, en attendant delayMs entre deux essais.
 * mainInfo (injectable) : { head : origin/main, isAncestor(sha) → true | false | null } ; quand la production sert un
 * autre asset que le dernier envoi, bien déployé et contrôlé, et qu'origin/main a avancé depuis ce dernier envoi (une
 * autre session a publié depuis main), c'est une publication hors veille : 0, outside: true, et une note. Tout autre
 * écart reste 41 (page illisible, envoi non déployé, prod changée sans fusion dans main, git muet).
 * Rend { code: 0 | 41, known, outside?, expected, served, attempts, url, reason, note }.
 */
export async function prodCheck({ lastShip, fetchText, prodUrl, now = new Date(), attempts = 3, delayMs = 0, sleep = ms => new Promise(r => setTimeout(r, ms)), mainInfo = null }) {
  if (!lastShip) return { code: 0, known: false, expected: null, served: null, attempts: 0, url: null, reason: null, note: 'pas encore de last-ship.json : rien à comparer' }
  const url = `${prodUrl}${prodUrl.includes('?') ? '&' : '?'}v=${now.getTime()}`
  const expected = lastShip.indexAsset
  let served = null
  let lastError = null
  let tries = 0
  for (let i = 0; i < Math.max(1, attempts); i++) {
    tries++
    try {
      served = indexAssetOf(await fetchText(url))
      lastError = served ? null : 'asset index-*.js introuvable dans la page'
    } catch (e) {
      served = null
      lastError = `lecture impossible : ${e?.message ?? e}`
    }
    if (served === expected) break
    if (i < attempts - 1 && delayMs > 0) await sleep(delayMs)
  }
  const pending = lastShip.deployed === false ? ' ; le dernier envoi n’a pas été déployé (deployed: false) : ship --deploy-only à la prochaine exécution hebdomadaire' : ''
  if (served === expected) {
    return { code: 0, known: true, expected, served, attempts: tries, url, reason: null, note: lastShip.deployed === false ? 'la production sert l’asset du dernier envoi, pourtant noté non déployé' : null }
  }
  const advanced = !!served && !lastError && lastShip.deployed !== false && lastShip.checked !== false
    && !!mainInfo?.head && mainInfo.head !== lastShip.sha && mainInfo.isAncestor?.(lastShip.sha) === true
  if (advanced) {
    return {
      code: 0, known: true, outside: true, expected, served, attempts: tries, url, reason: null,
      note: `publication hors veille : origin/main (${String(mainInfo.head).slice(0, 7)}) a avancé depuis le dernier envoi (${String(lastShip.sha).slice(0, 7)}) ; la production sert ${served}`,
    }
  }
  const why = lastError ?? `la production sert ${served}, le dernier envoi est ${expected} (commit ${String(lastShip.sha).slice(0, 7)})${mainInfo?.head && mainInfo.head === lastShip.sha ? ' : la production a changé sans fusion dans main' : ''}`
  return { code: 41, known: true, expected, served, attempts: tries, url, reason: `${why}${pending}`, note: null }
}

/** Texte d'un fichier, ou null s'il n'existe pas */
export const readTextOrNull = file => (existsSync(file) ? readFileSync(file, 'utf8') : null)
