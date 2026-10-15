// Historique des positions d'une élection : research/<id>/positions-history.json. Demande du propriétaire du
// 2026-10-15 : garder chaque changement de position, candidat par candidat, pour pouvoir le retracer et dresser
// plus tard une « carte des changements » par candidat. Aucun appel au réseau ni à une IA ; seul git est lu.
//
// Usage : node tools/positions-history.mjs <commande> <research-dir> <election-src-dir> [options]
//   rebuild [--until <commit>]
//       Remplissage rétroactif depuis l'historique git de <election-src-dir>/positions.ts (git show <commit>:…, sans
//       rien extraire dans l'arbre) : une entrée par position changée à chaque commit qui a touché le fichier, jusqu'à
//       <commit> inclus (premier lancement : --until obligatoire ; ensuite, la valeur gardée dans le fichier). Le
//       commit d'avant donne l'état de départ (aucun fichier : table vide, tout est « ajout »). Raisons, de la plus
//       précise à la plus générale : raison consignée ici (RETRO_REASONS), note de la position dans decisions.json si
//       l'entrée y est nouvelle ou changée par ce commit, note de vérification de add-candidate/<id>.json pour un
//       ajout, raison générale du commit, sinon son titre. Causes : RETRO_CAUSES pour une position nommée, sinon
//       inférence (première publication, candidat ou approche qui entre ou sort), sinon la cause du commit
//       (RETRO_CAUSES, default). Les libellés (énoncés, approches) de chaque commit sont versionnés dans labels.
//       Les entrées tenues par build-pack (origin « build-pack ») sont gardées à la suite ; les entrées rétroactives
//       sont réécrites (une raison complétée à la main sur l'une d'elles serait perdue : la consigner plutôt dans
//       RETRO_REASONS). Un fichier au format 1 est mis au format 2 : cause et statedAt des entrées build-pack tirés de
//       decisions.json (historyCause, statedAt), libellés du jour tirés de bank.ts.
//   append [--from <rev>]
//       Consigne, à la date du jour, les écarts entre l'état que l'historique connaît (son rejeu) et positions.ts de
//       l'arbre de travail, raisons et causes tirées de decisions.json. Pour rattraper un BUILD lancé avec
//       --no-history ; sinon, c'est build-pack qui l'appelle (appendFromBuild ci-dessous), avant d'écrire
//       positions.ts. --from <rev> compare plutôt au positions.ts de ce commit (à n'utiliser que si le rejeu est faux).
//   stamp
//       Renseigne dataVersion.after des entrées en attente avec la dataVersion de <election-src-dir>/election.ts,
//       quand elle a changé depuis le BUILD (build-pack le fait aussi à chaque BUILD).
//   check
//       Contrôles (code 1 en cas d'échec) : chaîne cohérente (l'avant de chaque entrée = l'après de la précédente sur
//       la même position), natures et causes connues, rejeu complet = positions.ts ; puis décompte par date, par
//       nature et par cause, entrées sans raison et causes non précisées.
//
// Raisons et causes tenues dans research-dir/decisions.json (lu à chaque BUILD) :
//   - positions[] : « note » (la raison), et facultatifs « historyCause » (une cause de ChangeCause, par exemple
//     « prise-de-position » ou « relecture ») et « statedAt » (date de la prise de position, AAAA-MM-JJ) ;
//   - historyNotes : { "<candidat>:<approche>" | "<candidat>:*" | "question:<question>" : { note, cause?, statedAt? } },
//     pour un changement sans note propre : retrait d'un candidat (étape 12), question retirée (drops), etc. ;
//   - drops : une question retirée prend la note historyNotes["question:<id>"], sinon « _drops_note ».
//
// Format (version 2, types et règles dans src/core/positionsHistory.ts, mode d'emploi dans PIPELINE.md, étape 14) :
//   {
//     "_note": "…",
//     "format": 2,
//     "electionId": "presidentielle-2027",
//     "retroactive": { "until": "<commit>", "commits": [{ "commit", "date", "subject", "dataVersion" }] },
//     "labels": {                                        (libellés publiés, versionnés : labelAt)
//       "questions": { "<question>": [{ "from": "AAAA-MM-JJ", "rev", "text" | null }] },
//       "approaches": { "<approche>": [{ "from", "rev", "text" | null }] }
//     },
//     "entries": [{
//       "id": "AAAA-MM-JJ:<candidat>:<approche>",        (stable ; « :2 »… si la clé revient le même jour)
//       "date": "AAAA-MM-JJ", "candidateId", "questionId", "approachId", "rev": <révision de la question> | null,
//       "kinds": ["ajout" | "retrait" | "poids" | "résumé" | "confiance" | "nature" | "sources", …],
//       "change": "fond" | "forme",                       (fond : ajout, retrait ou poids ; forme : le reste)
//       "stance": { "before", "after" },                  (« principale » | « compatible » | « rejet » | « inconnue »)
//       "cause": "prise-de-position" | "relecture" | "première-publication" | "nouveau-candidat" | "candidat-retiré"
//                | "nouvelle-approche" | "approche-retirée" | "question-retirée" | "non-précisée",
//       "statedAt": "AAAA-MM-JJ" | null,                  (date de la prise de position du candidat)
//       "dataVersion": { "before", "after" },             (after null : en attente de la prochaine dataVersion)
//       "origin": "rétroactif-git" | "build-pack", "commit": "<abrégé>" | null,
//       "reason": "…" | null, "reasonFrom": "decisions.json" | "add-candidate/<id>.json" | "banque" | … | null,
//       "before": <Position> | null, "after": <Position> | null   (telles que dans positions.ts ; null = inconnue)
//     }]
//   }
// Les entrées sont rangées par date. Les candidats masqués (election.hidden) et non classés y figurent comme les
// autres : l'historique suit positions.ts, qui les garde. Un candidat retiré de positions.ts (BUILD sans son
// --include) y laisse des « retrait » ; reconstruire le même jour avec --include les annule (entrées fondues).

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  CHANGE_CAUSES, CHANGE_KINDS, HISTORY_FORMAT, approachKnownBefore, canonical, chainErrors, emptyHistory, latestSourceDate,
  recordChanges, recordLabels, replay, replayBefore, sortEntries, stampDataVersion, withoutEmptyRows,
} from '../src/core/positionsHistory.ts'

export const HISTORY_FILE = 'positions-history.json'
const NOTE = 'Historique des positions, candidat par candidat (décision du propriétaire du 2026-10-15). Format et règles : '
  + 'src/core/positionsHistory.ts et tools/positions-history.mjs ; mode d’emploi : PIPELINE.md, étape 14. Tenu par '
  + 'tools/build-pack.mjs à chaque BUILD et par tools/positions-history.mjs : ne pas modifier à la main.'

// Raisons consignées pour le rétroactif quand ni decisions.json ni les notes de vérification ne disent pourquoi :
// commit abrégé → { default?, '<candidat>:<approche>' ou '<candidat>:*' }.
const RETRO_REASONS = {
  '5bbbdd5': {
    default: 'Première publication des positions de la présidentielle 2027 (positions vérifiées par la chaîne de données).',
  },
  'a9c9e61': {
    'glucksmann:*': 'Résumé réécrit sans nommer Ségolène Royal, masquée après la désignation de Raphaël Glucksmann à la primaire '
      + '(PIPELINE.md, étape 12) ; position inchangée.',
  },
}
// Causes consignées pour le rétroactif (même forme). Une cause nommée ('<candidat>:<approche>' ou '<candidat>:*')
// l'emporte sur l'inférence (première publication, candidat ou approche qui entre ou sort) ; « default » ne vaut que
// si l'inférence ne dit rien. Relu le 15 octobre 2026 : aucun des changements du 9 au 14 octobre ne vient d'une
// prise de position nouvelle d'un candidat ; ce sont des relectures (recherche ciblée, vérification contradictoire,
// réécriture), des nouveaux candidats ou des approches ajoutées à la banque.
const RETRO_CAUSES = {
  '63ef2b6': { default: 'relecture' },
  'a9c9e61': { default: 'relecture' },
  '3912fda': { default: 'relecture' },
}

const readJson = f => JSON.parse(readFileSync(f, 'utf8'))
// Contenu d'un fichier généré par build-pack (« export const x: Type = {…} ») : l'objet JSON qui suit le signe =
export function parseGenerated(text) {
  const m = /export const \w+: \w+ = /.exec(text)
  if (!m) throw new Error('fichier généré illisible (export const … = {…} attendu)')
  return JSON.parse(text.slice(m.index + m[0].length))
}
const dataVersionIn = text => /dataVersion:\s*['"]([^'"]+)['"]/.exec(text ?? '')?.[1] ?? null
// Jour courant à Paris, AAAA-MM-JJ
export const todayInParis = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(new Date())

// anyFormat : rebuild seul lit un format antérieur, pour le mettre au format courant
export function loadHistory(researchDir, { anyFormat = false } = {}) {
  const f = join(researchDir, HISTORY_FILE)
  if (!existsSync(f)) return null
  const h = readJson(f)
  if (h.format !== HISTORY_FORMAT && !anyFormat) {
    throw new Error(`${f} : format ${h.format}, attendu ${HISTORY_FORMAT} (node tools/positions-history.mjs rebuild le met à jour)`)
  }
  return h
}
// Ordre des clés d'une entrée, fixe d'un format à l'autre
const ENTRY_KEYS = ['id', 'date', 'candidateId', 'questionId', 'approachId', 'rev', 'kinds', 'change', 'stance', 'cause', 'statedAt',
  'dataVersion', 'origin', 'commit', 'reason', 'reasonFrom', 'before', 'after']
const ordered = e => Object.fromEntries(ENTRY_KEYS.map(k => [k, e[k] ?? null]))
export function saveHistory(researchDir, history) {
  history.entries = sortEntries(history.entries).map(ordered)
  const { electionId, retroactive, labels, entries } = history
  writeFileSync(
    join(researchDir, HISTORY_FILE),
    JSON.stringify({ _note: NOTE, format: HISTORY_FORMAT, electionId, retroactive, labels: labels ?? { questions: {}, approaches: {} }, entries }, null, 2) + '\n',
  )
}

// Raisons et causes tenues dans decisions.json : retraits décidés (positions avec remove), questions retirées
// (drops), approches retirées (dropApproaches), notes d'historique (historyNotes)
export function decisionReasons(decisions) {
  const removed = new Map()
  for (const d of decisions?.positions ?? []) {
    if (d.remove) removed.set(`${d.candidate}|${d.approachId}`, { note: d.note ?? null, cause: d.historyCause ?? null, statedAt: d.statedAt ?? null })
  }
  const dropped = new Set(decisions?.dropApproaches ?? [])
  const droppedQuestions = new Set(decisions?.drops ?? [])
  const notes = decisions?.historyNotes ?? {}
  const asNote = v => (v == null ? null : typeof v === 'string' ? { note: v } : v)
  // Note d'historique la plus précise : la position, le candidat, la question
  const noteFor = (candidateId, approachId, questionId) =>
    asNote(notes[`${candidateId}:${approachId}`]) ?? asNote(notes[`${candidateId}:*`]) ?? asNote(notes[`question:${questionId}`])
  return { removed, dropped, droppedQuestions, dropsNote: decisions?._drops_note ?? null, noteFor }
}

/**
 * Appelé par build-pack avant d'écrire positions.ts : consigne les écarts entre l'état que l'historique connaît (son
 * rejeu, ou `previous` s'il est donné) et la table qui va être écrite. Rien n'est fait sans research-dir/
 * positions-history.json (la primaire n'en a pas), sans positions.ts existant (construction dans un dossier neuf, par
 * exemple l'audit des hypothèses de victoire), ni dans un dossier qui ne porte pas le nom de l'élection.
 * reasonOf(candidat, approche) → { reason, from, cause?, statedAt? } | null pour une position de la nouvelle table ;
 * bank : questions publiées (id, rev, prompt, approaches), pour les libellés et pour reconnaître une nouvelle approche.
 */
export function appendFromBuild({ researchDir, srcDir, next, decisions, questionOf, revOf, reasonOf, bank = null, date = todayInParis(), previous }) {
  const history = loadHistory(researchDir)
  const posFile = join(srcDir, 'positions.ts')
  if (!history) return null
  if (!existsSync(posFile)) return null
  if (basename(resolve(srcDir)) !== history.electionId) {
    console.warn(`historique des positions : ${srcDir} n'est pas le dossier de ${history.electionId}, rien n'est consigné`)
    return null
  }
  const known = withoutEmptyRows(replay(sortEntries([...history.entries])))
  // positions.ts différent de l'historique avant la construction : BUILD --no-history ou fichier modifié ; les écarts
  // sont comptés depuis l'historique, qui fait foi
  const diskDrift = canonical(withoutEmptyRows(parseGenerated(readFileSync(posFile, 'utf8')))) !== canonical(known)
  previous ??= known
  const electionFile = join(srcDir, 'election.ts')
  const current = existsSync(electionFile) ? dataVersionIn(readFileSync(electionFile, 'utf8')) : null
  const stamped = stampDataVersion(history, current)
  const { removed, dropped, droppedQuestions, dropsNote, noteFor } = decisionReasons(decisions)
  const startOfDay = replayBefore(history.entries, date)
  const firstPublication = !history.entries.some(e => e.date < date)
  const hasLabels = Object.values(history.labels?.approaches ?? {}).some(l => l.some(v => v.from < date))
  const inBank = new Set((bank ?? []).flatMap(q => q.approaches.map(a => a.id)))
  const questionsInBank = new Set((bank ?? []).map(q => q.id))
  const inferCause = ({ candidateId, approachId, questionId, after }) => {
    if (firstPublication) return 'première-publication'
    if (after && !startOfDay[candidateId]) return 'nouveau-candidat'
    if (!after && !next[candidateId]) return 'candidat-retiré'
    if (after && bank && hasLabels && !approachKnownBefore(history, approachId, date)) return 'nouvelle-approche'
    if (!after && bank && !inBank.has(approachId)) return questionsInBank.has(questionId) ? 'approche-retirée' : 'question-retirée'
    return null
  }
  const stats = recordChanges(history, {
    date,
    origin: 'build-pack',
    previous,
    next,
    dataVersion: { before: current, after: null },
    questionOf,
    revOf,
    reasonOf: c => {
      const { candidateId, approachId, questionId, after } = c
      const note = noteFor(candidateId, approachId, questionId)
      let own = null
      if (after) own = reasonOf?.(candidateId, approachId) ?? null
      else {
        const k = `${candidateId}|${approachId}`
        if (removed.has(k)) own = { reason: removed.get(k).note, from: 'decisions.json', cause: removed.get(k).cause, statedAt: removed.get(k).statedAt }
        else if (droppedQuestions.has(questionId) && !note && dropsNote) own = { reason: `Question retirée (decisions.drops) : ${dropsNote}`, from: 'decisions.json' }
        else if (dropped.has(approachId) && !note) own = { reason: 'Approche retirée de la question (dropApproaches).', from: 'decisions.json' }
      }
      const reason = own?.reason ?? note?.note ?? null
      return {
        reason,
        from: own?.reason ? own.from : note?.note ? 'decisions.json (historyNotes)' : null,
        cause: own?.cause ?? note?.cause ?? inferCause(c),
        statedAt: own?.statedAt ?? note?.statedAt ?? null,
      }
    },
  })
  const labels = bank ? recordLabels(history, date, bank) : 0
  const replayed = withoutEmptyRows(replay(sortEntries([...history.entries])))
  const drift = canonical(replayed) !== canonical(withoutEmptyRows(next))
  saveHistory(researchDir, history)
  return { ...stats, stamped, labels, date, drift, diskDrift }
}

// --- Ligne de commande ---

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30 })
}
function gitShow(root, rev, path) {
  try {
    return execFileSync('git', ['show', `${rev}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    return null
  }
}
// Chemin d'un fichier relatif à la racine du dépôt, liens symboliques résolus (git donne une racine résolue)
const repoPath = (root, p) => relative(realpathSync(root), join(realpathSync(dirname(resolve(p))), basename(p))).split('\\').join('/')
const parsedOr = (text, fallback) => (text == null ? fallback : parseGenerated(text))
const jsonOr = (text, fallback) => (text == null ? fallback : JSON.parse(text))

function bankIndex(bank) {
  const q = new Map()
  const rev = new Map()
  for (const question of bank?.questions ?? []) {
    rev.set(question.id, question.rev ?? null)
    for (const a of question.approaches) q.set(a.id, question.id)
  }
  return { q, rev, questions: bank?.questions ?? null }
}
const decisionsByKey = d => new Map((d?.positions ?? []).map(p => [`${p.candidate}|${p.approachId}`, p]))
function addCandidateByKey(root, rev, addPath) {
  const out = new Map()
  const listing = (() => {
    try {
      return execFileSync('git', ['ls-tree', '--name-only', `${rev}:${addPath}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
        .split('\n').filter(f => f.endsWith('.json'))
    } catch {
      return []
    }
  })()
  for (const f of listing) {
    const content = jsonOr(gitShow(root, rev, `${addPath}/${f}`), null)
    const file = content?.result ?? content
    if (!file) continue
    const cand = file.candidate ?? f.replace(/\.json$/, '')
    const entries = Array.isArray(file.positions) ? file.positions.map(p => [p.approachId, p]) : Object.entries(file.positions ?? {})
    for (const [ap, p] of entries) out.set(`${cand}|${ap}`, { ...p, file: f })
  }
  return out
}

function rebuild(root, researchDir, srcDir, untilArg) {
  const existing = loadHistory(researchDir, { anyFormat: true })
  const until = untilArg ?? existing?.retroactive?.until
  if (!until) throw new Error('rebuild : --until <commit> obligatoire au premier lancement (dernier commit à relire)')
  const rel = p => repoPath(root, p)
  const posPath = rel(join(srcDir, 'positions.ts'))
  const bankPath = rel(join(srcDir, 'bank.ts'))
  const electionPath = rel(join(srcDir, 'election.ts'))
  const decisionsPath = rel(join(researchDir, 'decisions.json'))
  const addPath = rel(join(researchDir, 'add-candidate'))
  const config = readJson(join(researchDir, 'config.json'))
  const commits = git(root, ['rev-list', '--reverse', until, '--', posPath]).split('\n').filter(Boolean)
  if (!commits.length) throw new Error(`rebuild : aucun commit ne touche ${posPath} jusqu'à ${until}`)
  const history = { ...emptyHistory(config.id), retroactive: { until: git(root, ['rev-parse', '--short', until]).trim(), commits: [] } }
  let state = {}
  for (const full of commits) {
    const short = git(root, ['rev-parse', '--short', full]).trim()
    const [date, subject] = git(root, ['log', '-1', '--format=%ad%n%s', '--date=short', full]).split('\n')
    const parent = `${full}^`
    const table = parsedOr(gitShow(root, full, posPath), {})
    const parentTable = parsedOr(gitShow(root, parent, posPath), {})
    if (canonical(parentTable) !== canonical(state)) {
      console.warn(`rebuild : ${short} ne part pas de l'état du commit relu précédent (historique non linéaire) ; écarts comptés depuis ce dernier`)
    }
    const bank = bankIndex(parsedOr(gitShow(root, full, bankPath), null))
    const parentBank = bankIndex(parsedOr(gitShow(root, parent, bankPath), null))
    const dvBefore = dataVersionIn(gitShow(root, parent, electionPath))
    const dvAfter = dataVersionIn(gitShow(root, full, electionPath))
    const dec = decisionsByKey(jsonOr(gitShow(root, full, decisionsPath), null))
    const decBefore = decisionsByKey(jsonOr(gitShow(root, parent, decisionsPath), null))
    const add = addCandidateByKey(root, full, addPath)
    const addBefore = addCandidateByKey(root, parent, addPath)
    const local = RETRO_REASONS[short] ?? {}
    const causes = RETRO_CAUSES[short] ?? {}
    const firstPublication = !Object.keys(state).length
    const inferCause = ({ candidateId, approachId, after }) => {
      if (firstPublication) return 'première-publication'
      if (after && !state[candidateId]) return 'nouveau-candidat'
      if (!after && !table[candidateId]) return 'candidat-retiré'
      if (after && parentBank.questions && !parentBank.q.has(approachId)) return 'nouvelle-approche'
      if (!after && bank.questions && !bank.q.has(approachId)) return parentBank.q.get(approachId) && bank.rev.has(parentBank.q.get(approachId)) ? 'approche-retirée' : 'question-retirée'
      return null
    }
    const causeOf = c => causes[`${c.candidateId}:${c.approachId}`] ?? causes[`${c.candidateId}:*`] ?? inferCause(c) ?? causes.default ?? 'non-précisée'
    const reasonOf = c => {
      const { candidateId, approachId, kinds } = c
      const k = `${candidateId}|${approachId}`
      const cause = causeOf(c)
      const own = local[`${candidateId}:${approachId}`] ?? local[`${candidateId}:*`]
      if (own) return { reason: own, from: 'tools/positions-history.mjs', cause }
      const d = dec.get(k)
      if (d?.note && canonical(d) !== canonical(decBefore.get(k) ?? null)) return { reason: d.note, from: 'decisions.json', cause: d.historyCause ?? cause, statedAt: d.statedAt ?? null }
      const a = add.get(k)
      if (kinds.includes('ajout') && a?.note && canonical(a) !== canonical(addBefore.get(k) ?? null)) {
        return { reason: a.note, from: `add-candidate/${a.file}`, cause }
      }
      if (local.default) return { reason: local.default, from: 'tools/positions-history.mjs', cause }
      return { reason: subject, from: 'commit', cause }
    }
    const stats = recordChanges(history, {
      date,
      origin: 'rétroactif-git',
      previous: state,
      next: table,
      commit: short,
      dataVersion: { before: dvBefore, after: dvAfter },
      questionOf: ap => bank.q.get(ap) ?? parentBank.q.get(ap),
      revOf: qid => bank.rev.get(qid) ?? parentBank.rev.get(qid) ?? null,
      reasonOf,
    })
    if (bank.questions) recordLabels(history, date, bank.questions)
    history.retroactive.commits.push({ commit: short, date, subject, dataVersion: dvAfter })
    console.log(`${short} ${date} : ${stats.added} entrées (${subject})`)
    state = table
  }
  // Entrées tenues par build-pack, gardées à la suite. Format 1 (sans cause) : cause et statedAt tirés de la position
  // de decisions.json (historyCause, statedAt) ou de historyNotes, sinon non-précisée ; libellés du dernier jour
  // tirés de bank.ts (aucun BUILD n'avait encore consigné de libellé).
  const kept = (existing?.entries ?? []).filter(e => e.origin !== 'rétroactif-git')
  if (kept.length) {
    const decisions = existsSync(join(researchDir, 'decisions.json')) ? readJson(join(researchDir, 'decisions.json')) : {}
    const dec = decisionsByKey(decisions)
    const { noteFor } = decisionReasons(decisions)
    let upgraded = 0
    for (const e of kept) {
      if (e.cause) continue
      const d = dec.get(`${e.candidateId}|${e.approachId}`)
      const n = noteFor(e.candidateId, e.approachId, e.questionId)
      e.cause = d?.historyCause ?? n?.cause ?? 'non-précisée'
      e.statedAt = d?.statedAt ?? n?.statedAt ?? (e.cause === 'prise-de-position' ? latestSourceDate(e.after) : null)
      upgraded++
    }
    history.entries.push(...kept)
    const labelsOf = existing?.labels
    if (labelsOf && Object.keys(labelsOf.questions ?? {}).length) {
      // Libellés tenus par build-pack depuis : ceux des jours postérieurs au rétroactif sont gardés
      const last = history.retroactive.commits.at(-1).date
      for (const kind of ['questions', 'approaches']) {
        for (const [id, list] of Object.entries(labelsOf[kind] ?? {})) {
          for (const v of list) if (v.from > last) (history.labels[kind][id] ??= []).push(v)
        }
      }
    } else {
      const bankFile = join(srcDir, 'bank.ts')
      if (existsSync(bankFile)) recordLabels(history, kept.map(e => e.date).sort().at(-1), parseGenerated(readFileSync(bankFile, 'utf8')).questions)
    }
    console.log(`${kept.length} entrées tenues par build-pack gardées${upgraded ? ` (${upgraded} mises au format ${HISTORY_FORMAT})` : ''}`)
  }
  saveHistory(researchDir, history)
  return history
}

// root : fonction (git n'est lu qu'avec --from)
function append(root, researchDir, srcDir, from) {
  const history = loadHistory(researchDir)
  if (!history) throw new Error(`append : ${join(researchDir, HISTORY_FILE)} absent (lancer rebuild d'abord)`)
  const previous = from ? parsedOr(gitShow(root(), from, repoPath(root(), join(srcDir, 'positions.ts'))), {}) : undefined
  const next = parseGenerated(readFileSync(join(srcDir, 'positions.ts'), 'utf8'))
  const decisions = existsSync(join(researchDir, 'decisions.json')) ? readJson(join(researchDir, 'decisions.json')) : {}
  const bankFile = parseGenerated(readFileSync(join(srcDir, 'bank.ts'), 'utf8'))
  const bank = bankIndex(bankFile)
  const dec = decisionsByKey(decisions)
  return appendFromBuild({
    researchDir,
    srcDir,
    previous,
    next,
    decisions,
    bank: bankFile.questions,
    questionOf: ap => bank.q.get(ap),
    revOf: qid => bank.rev.get(qid) ?? null,
    reasonOf: (c, ap) => {
      const d = dec.get(`${c}|${ap}`)
      return d && !d.remove ? { reason: d.note ?? null, from: 'decisions.json', cause: d.historyCause ?? null, statedAt: d.statedAt ?? null } : null
    },
  })
}

function check(researchDir, srcDir) {
  const history = loadHistory(researchDir)
  if (!history) throw new Error(`check : ${join(researchDir, HISTORY_FILE)} absent`)
  const errors = chainErrors(history.entries)
  for (const e of history.entries) {
    for (const k of e.kinds) if (!CHANGE_KINDS.includes(k)) errors.push(`${e.id} : nature inconnue ${k}`)
    if (!CHANGE_CAUSES.includes(e.cause)) errors.push(`${e.id} : cause inconnue ${e.cause}`)
  }
  const current = withoutEmptyRows(parseGenerated(readFileSync(join(srcDir, 'positions.ts'), 'utf8')))
  if (canonical(withoutEmptyRows(replay(history.entries))) !== canonical(current)) errors.push('le rejeu complet ne redonne pas positions.ts')
  const byDate = new Map()
  for (const e of history.entries) {
    const row = byDate.get(e.date) ?? { total: 0, fond: 0, forme: 0, kinds: {}, causes: {}, origins: new Set(), candidates: new Set() }
    row.total++
    row[e.change]++
    for (const k of e.kinds) row.kinds[k] = (row.kinds[k] ?? 0) + 1
    row.causes[e.cause] = (row.causes[e.cause] ?? 0) + 1
    row.origins.add(e.origin)
    row.candidates.add(e.candidateId)
    byDate.set(e.date, row)
  }
  console.log(`${history.entries.length} entrées, ${new Set(history.entries.map(e => e.candidateId)).size} candidats`)
  for (const [date, r] of byDate) {
    const kinds = Object.entries(r.kinds).map(([k, n]) => `${k} ${n}`).join(', ')
    const causes = Object.entries(r.causes).map(([k, n]) => `${k} ${n}`).join(', ')
    console.log(`${date} : ${r.total} (fond ${r.fond}, forme ${r.forme}) — ${kinds} — causes : ${causes} — ${r.candidates.size} candidats — ${[...r.origins].join(', ')}`)
  }
  const pending = history.entries.filter(e => e.dataVersion.after === null).length
  if (pending) console.log(`${pending} entrées en attente d'une nouvelle dataVersion (stamp après l'avoir changée dans election.ts)`)
  const noReason = history.entries.filter(e => !e.reason).length
  if (noReason) console.log(`${noReason} entrées sans raison consignée (note dans decisions.json : positions ou historyNotes)`)
  const vague = history.entries.filter(e => e.cause === 'non-précisée').length
  if (vague) console.log(`${vague} entrées de cause non précisée (historyCause dans decisions.json, ou historyNotes)`)
  for (const e of errors.slice(0, 20)) console.error(`ERREUR ${e}`)
  if (errors.length > 20) console.error(`… ${errors.length - 20} autres`)
  return errors.length ? 1 : 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const USAGE = 'Usage : node tools/positions-history.mjs rebuild|append|stamp|check <research-dir> <election-src-dir> [--until <commit>] [--from <rev>]'
  const [command, ...rest] = process.argv.slice(2)
  const opts = {}
  const positional = []
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--until' || rest[i] === '--from') opts[rest[i].slice(2)] = rest[++i]
    else if (rest[i].startsWith('--')) throw new Error(`Option inconnue : ${rest[i]}\n${USAGE}`)
    else positional.push(rest[i])
  }
  const [researchDir, srcDir] = positional
  if (!researchDir || !srcDir) throw new Error(USAGE)
  const root = () => git(resolve(researchDir), ['rev-parse', '--show-toplevel']).trim()
  if (command === 'rebuild') {
    rebuild(root(), researchDir, srcDir, opts.until)
    process.exitCode = check(researchDir, srcDir)
  } else if (command === 'append') {
    const r = append(root, researchDir, srcDir, opts.from)
    if (!r) throw new Error(`append : rien n'est consigné (voir l'avertissement ci-dessus)`)
    console.log(`historique ${r.date} : ${r.added} ajoutées, ${r.updated} fondues, ${r.removed} annulées, ${r.stamped} estampillées`)
    process.exitCode = check(researchDir, srcDir)
  } else if (command === 'stamp') {
    const history = loadHistory(researchDir)
    if (!history) throw new Error(`stamp : ${join(researchDir, HISTORY_FILE)} absent`)
    const n = stampDataVersion(history, dataVersionIn(readFileSync(join(srcDir, 'election.ts'), 'utf8')))
    saveHistory(researchDir, history)
    console.log(`${n} entrées estampillées`)
  } else if (command === 'check') {
    process.exitCode = check(researchDir, srcDir)
  } else throw new Error(USAGE)
}
