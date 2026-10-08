// Construit les fichiers de données d'une élection à partir de la sortie du workflow « question-bank »
// (brouillons vérifiés + relecture de neutralité), de ses extensions, des candidats ajoutés, de la reprise
// d'une élection antérieure et des décisions éditoriales.
//
// Usage : node tools/build-pack.mjs <workflow-output.json> <research-dir> <election-src-dir> [expansion.json…]
//                                   [--include <id>[,<id>…]] [--reset-revisions]
//   Primaire (archive, régénérée à l'identique) :
//     node tools/build-pack.mjs research/choisir-2027/question-bank-output.json research/choisir-2027 \
//       src/elections/choisir-2027 research/choisir-2027/expansion-merged.json
//   Présidentielle, le soir du second tour de la primaire :
//     node tools/build-pack.mjs <sortie-banque.json> research/presidentielle-2027 src/elections/presidentielle-2027 \
//       research/presidentielle-2027/expansion-merged.json --include <gagnant>
//
// Options :
//   --include <ids> : publie, en plus des candidats déclarés, ces candidats « pendingPrimary » de config.json
//     (« --include faure » ou « --include faure,royal »). Sans l'option, un candidat en attente est préparé
//     (ses positions sont calculées et rangées dans research-dir/bank.json sous « prepared ») mais n'est pas
//     écrit dans positions.ts : le soir du résultat, il ne reste qu'à reconstruire avec --include.
//   --reset-revisions : repart de la révision 1 pour toutes les questions (passage en production).
//
// Fichiers lus dans research-dir :
//   config.json (obligatoire) : configuration de l'élection, source unique des outils de données. build-pack en lit :
//     id (en-tête « généré depuis research/<id> » des fichiers produits ; à défaut, le nom du dossier) et
//     candidates: [{ id, pendingPrimary? }] : seuls ces candidats sont retenus, dans cet ordre (celui de positions.ts) ;
//     pendingPrimary : candidat en attente (gagnant d'une primaire pas encore connu), publié seulement avec --include.
//   decisions.json (facultatif) : { tierChanges: [{questionId, newTier}], drops: [questionId],
//     edits: [{id, field, newText}], rejectEdits: [id:field], positions: [{questionId, candidate, approachId, remove?|...}],
//     newTopics: [{id, label, description}], addApproaches: [{questionId, id, text, external?}],
//     dropApproaches: [approachId], movePositions: [{questionId, candidate, from, to}],
//     externalFlags: [{approachId, external}], topicChanges: [{questionId, topicId}],
//     consensusTopicChanges: [{from, to}] (thème d'un point d'accord renommé ou scindé, ex. international_defense
//       → proche_orient pour la primaire),
//     step1: [questionId] (questions du premier dépouillement),
//     lastInStep: [questionId] (questions qui ferment toujours leur temps au lieu d'être placées au hasard) }
//   explainers.json (facultatif) : { explainers: [{ questionId, summary, points, figures }] },
//     contexte détaillé et chiffres sourcés de chaque question, vérifiés contre leurs sources.
//   explainer-charts.json (facultatif) : { charts: [{ questionId, index, chart }] }, petit graphique
//     du chiffre n° index d'une question (type FigureChart de src/core/types.ts) ; chaque nombre doit déjà
//     figurer dans la valeur ou le libellé du chiffre.
//   revisions.json : registre des révisions de questions, tenu à jour à chaque construction.
//   reuse.json (facultatif) : reprise d'une élection antérieure dont research/<from>/bank.json est déjà construit.
//     Écrit par tools/build-reuse.mjs à partir des champs reuseOf de la sortie de 2-question-bank.js.
//     {
//       "from": "choisir-2027",                          (obligatoire : identifiant de l'élection source)
//       "questions": { "<idQuestionIci>": "<idQuestionSource>" },
//       "approaches": { "<idApprocheIci>": "<idApprocheSource>" },
//       "videoTopics": { "<thèmeDeSérie>": "<thèmeIci>" }
//     }
//     - questions : questions identiques. La question d'ici reprend l'explication de la source, graphiques compris,
//       quand explainers.json n'en donne pas (explainers.json reste prioritaire : une explication relue ou
//       réécrite s'y range). Un énoncé trop différent (plus de 15 % du texte, mesure de src/core/revisions.ts)
//       est signalé (reuse-question-reworded) sans bloquer.
//     - approaches : approches identiques. Les positions déjà vérifiées des candidats de la source qui sont aussi
//       candidats ici sont reprises (reuse-position dans le journal), à trois conditions : le texte de l'approche
//       n'a changé que sur la forme (sinon reuse-refused-text) ; le candidat n'a encore aucune position sur la
//       question d'ici (une position plus récente l'emporte : reuse-superseded) ; son approche principale sur la
//       question source est elle aussi reliée (sinon reuse-refused-main, pour ne pas le réduire à une
//       position secondaire). Ses positions secondaires ou rejets non reliés sont signalés (reuse-unmapped).
//     - videoTopics : séries vidéo existantes (src/ui/videos/series/<thème>.ts) montrées pour cette élection, sous
//       le thème d'ici. Une série absente de la liste n'est pas montrée.
//     La présence de reuse.json fait écrire election-src-dir/videos.ts :
//       export const videoScope = { topics: { <thèmeDeSérie>: <thèmeIci> }, questions: { <questionSource>: <questionIci> } }
//   add-candidate/<candidat>.json (facultatif, un fichier par candidat, produit par tools/workflows/6-add-candidate.js) :
//     positions d'un candidat placé sur la banque existante, déjà passées par la vérification contradictoire.
//     {
//       "candidate": "<candidat>",                        (facultatif ; sinon le nom du fichier ; doit figurer dans config.json)
//       "checkedAt": "AAAA-MM-JJ",                        (informatif)
//       "positions": {
//         "<idApproche>": {
//           "weight": 2,                                   (2 principale, 1 compatible ; absent ou 0 avec « rejects »)
//           "rejects": false,                              (rejet explicite de l'approche)
//           "nature": "proposition" | "declaration" | "inference",
//           "confidence": "high" | "medium" | "low",
//           "summary": "Résumé neutre et factuel de ce que dit le candidat.",
//           "sources": [{ "title": "…", "url": "https://…", "date": "AAAA-MM-JJ", "publisher": "…" }],
//           "verdict": "confirmed" | "adjusted" | "added" | "unverifiable" | "refuted",
//           "note": "Ce que la source dit réellement."      (informatif)
//         }
//       },
//       "unknown": ["<idQuestion>"]                        (facultatif, informatif : questions cherchées sans position)
//     }
//     Le format d'une position est celui du pack (Position de src/core/types.ts), plus verdict et note. « positions »
//     peut aussi être une liste [{ approachId, questionId?, …position }]. Le fichier peut être enveloppé dans
//     « result » (sortie brute du workflow) ; ses autres clés (fiche, portrait…) sont ignorées ici.
//     Mêmes règles que le fact-check de la banque : « refuted » est écarté (addcand-refuted) ; une position sans
//     verdict ou « unchecked » perd un cran de confiance (addcand-unchecked). Une approche inconnue est signalée
//     (addcand-miss). Le fichier ne complète que les questions où le candidat n'a encore aucune position
//     (addcand-known sinon).
//
// Priorité entre les sources d'une position, de la plus forte à la plus faible : decisions.json (positions),
// sortie du workflow et extensions, add-candidate/, reuse.json. Une question ne mêle jamais, pour un même
// candidat, les positions de deux sources parmi les trois dernières.
//
// Journal (build-log.txt), lignes propres aux reprises et aux ajouts : reuse-position, reuse-explainer,
// reuse-explainer-local (explication propre gardée), reuse-miss et reuse-question-miss (identifiant introuvable),
// reuse-dup, addcand…, unknown-candidate (position d'un candidat absent de config.json), prepared et include
// (candidats en attente), video-series-miss, video-topic-miss, video-question-dup, consensus-topic-miss.
//
// Fichiers écrits :
//   research-dir/bank.json ({ bank, positions, prepared? }), build-log.txt, revisions.json ;
//   election-src-dir/bank.ts, positions.ts, et videos.ts quand reuse.json existe.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { FORM_THRESHOLD, editRatio, nextRevision, normalizeText, questionText } from '../src/core/revisions.ts'

const USAGE = 'Usage : node tools/build-pack.mjs <workflow-output.json> <research-dir> <election-src-dir> [expansion.json…] [--include <id>[,<id>…]] [--reset-revisions]'
const argv = process.argv.slice(2)
let resetRevisions = false
let include = null
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--reset-revisions') resetRevisions = true
  else if (a === '--include' || a.startsWith('--include=')) {
    const v = a === '--include' ? argv[++i] : a.slice('--include='.length)
    if (!v || v.startsWith('--')) throw new Error(`--include : identifiants attendus (--include faure ou --include faure,royal)\n${USAGE}`)
    include = [...(include ?? []), ...v.split(',').map(s => s.trim()).filter(Boolean)]
  } else if (a.startsWith('--')) throw new Error(`Option inconnue : ${a}\n${USAGE}`)
  else positional.push(a)
}
const [outFile, researchDir, srcDir, ...extraFiles] = positional
if (!outFile || !researchDir || !srcDir) throw new Error(USAGE)
const readJson = f => JSON.parse(readFileSync(f, 'utf8'))

// Configuration de l'élection : identifiant et candidats
const configFile = join(researchDir, 'config.json')
if (!existsSync(configFile)) throw new Error(`${configFile} manquant : build-pack y lit l'identifiant de l'élection et ses candidats (candidates[].id)`)
const config = readJson(configFile)
if (!Array.isArray(config.candidates) || !config.candidates.length || !config.candidates.every(c => typeof c?.id === 'string' && c.id)) {
  throw new Error(`${configFile} : « candidates » doit être une liste non vide de { id, … }`)
}
const electionId = config.id ?? basename(resolve(researchDir))
const candIds = config.candidates.map(c => c.id)
if (new Set(candIds).size !== candIds.length) throw new Error(`${configFile} : identifiants de candidats en double`)
const pendingIds = new Set(config.candidates.filter(c => c.pendingPrimary).map(c => c.id))
for (const id of include ?? []) {
  if (!candIds.includes(id)) throw new Error(`--include : ${id} n'est pas un candidat de ${configFile}`)
  if (!pendingIds.has(id)) throw new Error(`--include : ${id} n'est pas un candidat en attente (pendingPrimary) : il est déjà publié`)
}
const published = candIds.filter(c => !pendingIds.has(c) || include?.includes(c))

const raw = readJson(outFile)
const wf = structuredClone(raw.result ?? raw)
// Sorties supplémentaires (extension de la banque) : brouillons, reformulations, compléments de positions
wf.gapFills = []
for (const f of extraFiles) {
  const extra = readJson(f)
  const x = extra.result ?? extra
  wf.drafts.push(...(x.drafts ?? []))
  wf.neutrality = { ...(wf.neutrality ?? {}), edits: [...(wf.neutrality?.edits ?? []), ...(x.neutrality?.edits ?? [])] }
  wf.gapFills.push(...(x.gapFills ?? []))
}
const decisions = existsSync(join(researchDir, 'decisions.json'))
  ? readJson(join(researchDir, 'decisions.json'))
  : {}
const log = []

// Typographie française : espaces fines insécables, apostrophes courbes, groupes de chiffres
export function typo(t) {
  if (typeof t !== 'string') return t
  return t
    .replace(/'/g, '’')
    .replace(/\s+([?!;])/g, ' $1')
    .replace(/(\S)([?!;])(?=\s|$)/g, '$1 $2')
    .replace(/\s+:/g, ' :')
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)\s*(€|%|Md€|M€|milliards|millions)/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
// Part de texte modifié entre deux formulations (casse, accents et typographie ignorés), comme pour les révisions
const textDistance = (a, b) => editRatio(normalizeText(typo(a)), normalizeText(typo(b)))
const pct = r => `${Math.round(r * 100)} %`

const drafts = wf.drafts ?? []
const topics = []
const questions = []
const consensus = []
const positions = {}
for (const c of candIds) positions[c] = {}

for (const d of drafts) {
  for (const t of d.topics) {
    if (!topics.find(x => x.id === t.id)) topics.push({ id: t.id, label: t.label, description: t.description })
  }
  for (const c of d.consensus ?? []) consensus.push({ topicId: c.topicId, text: c.text })
  for (const q of d.questions) questions.push(structuredClone(q))
}
for (const t of decisions.newTopics ?? []) if (!topics.find(x => x.id === t.id)) topics.push(t)
const qById = id => questions.find(q => q.id === id)
for (const a of decisions.addApproaches ?? []) {
  const q = qById(a.questionId)
  if (q && !q.approaches.some(x => x.id === a.id)) { q.approaches.push({ id: a.id, text: a.text, external: !!a.external }); log.push(`add-approach ${a.id}`) }
}

// Relecture de neutralité : on applique les reformulations (sens inchangé), sauf refus explicites
const rejected = new Set(decisions.rejectEdits ?? [])
const edits = [...(wf.neutrality?.edits ?? []), ...(decisions.edits ?? [])]
for (const e of edits) {
  if (rejected.has(`${e.id}:${e.field}`)) continue
  let applied = false
  for (const t of topics) if (t.id === e.id && (e.field === 'label' || e.field === 'description')) { t[e.field] = e.newText; applied = true }
  for (const q of questions) {
    if (q.id === e.id && (e.field === 'prompt' || e.field === 'context')) { q[e.field] = e.newText; applied = true }
    for (const a of q.approaches) if (a.id === e.id && e.field === 'text') { a.text = e.newText; applied = true }
  }
  log.push(`${applied ? 'edit' : 'edit-miss'} ${e.id}.${e.field}`)
}

// Compléments de positions sur des questions existantes (extension), vérifiés au fact-check
for (const g of wf.gapFills ?? []) {
  const q = qById(g.questionId)
  if (!q) { log.push(`gapfill-miss ${g.questionId}`); continue }
  if (q.positions.some(p => p.candidate === g.candidate && p.approachId === g.approachId)) continue
  q.positions.push(g)
  log.push(`gapfill ${g.questionId} ${g.candidate} ${g.approachId}`)
}

const questionOfApproach = qs => new Map(qs.flatMap(q => q.approaches.map(a => [a.id, q])))
// Le candidat a-t-il déjà, sur cette question, une position qui compte (approche portée ou rejetée) ?
const hasPosition = (q, c) => q.positions.some(p => p.candidate === c && (p.weight > 0 || p.rejects))

// Candidats ajoutés sur la banque existante (workflow 6-add-candidate) : research-dir/add-candidate/<candidat>.json
const addDir = join(researchDir, 'add-candidate')
if (existsSync(addDir)) {
  const qOf = questionOfApproach(questions)
  for (const f of readdirSync(addDir).filter(f => f.endsWith('.json')).sort()) {
    const content = readJson(join(addDir, f))
    const file = content.result ?? content
    const cand = file.candidate ?? basename(f, '.json')
    if (cand !== basename(f, '.json')) throw new Error(`add-candidate/${f} : le fichier porte sur ${cand}, il doit s'appeler ${cand}.json`)
    if (!candIds.includes(cand)) throw new Error(`add-candidate/${f} : ${cand} absent de ${configFile} (candidates[]) : l'y ajouter d'abord`)
    const entries = Array.isArray(file.positions)
      ? file.positions.map(p => [p.approachId, p])
      : Object.entries(file.positions ?? {})
    // Questions où le candidat a déjà une position venue d'une autre source : on n'y mêle pas ce fichier
    const known = new Set(questions.filter(q => hasPosition(q, cand)).map(q => q.id))
    for (const [approachId, p] of entries) {
      const q = qOf.get(approachId)
      if (!q || (p.questionId && p.questionId !== q.id)) { log.push(`addcand-miss ${cand} ${p.questionId ? `${p.questionId} ` : ''}${approachId}`); continue }
      if (known.has(q.id)) { log.push(`addcand-known ${q.id} ${cand} ${approachId}`); continue }
      if (p.verdict === 'refuted') { log.push(`addcand-refuted ${q.id} ${cand} ${approachId}`); continue }
      const unchecked = !p.verdict || p.verdict === 'unchecked'
      if (unchecked) log.push(`addcand-unchecked ${q.id} ${cand} ${approachId}`)
      const { questionId: _q, approachId: _a, candidate: _c, ...rest } = p
      q.positions.push({
        ...rest,
        candidate: cand,
        approachId,
        ...(unchecked ? { confidence: p.confidence === 'high' ? 'medium' : 'low', verdict: 'unchecked' } : {}),
      })
      log.push(`addcand ${q.id} ${cand} ${approachId}`)
    }
  }
}

// Reprise d'une élection antérieure (research-dir/reuse.json) : questions et approches identiques
const reuseFile = join(researchDir, 'reuse.json')
const reuse = existsSync(reuseFile) ? readJson(reuseFile) : null
let origin = null
if (reuse) {
  const from = reuse.from
  if (!from) throw new Error(`${reuseFile} : « from » (identifiant de l'élection source, research/<from>/bank.json) manquant`)
  const sourceFile = join(dirname(resolve(researchDir)), from, 'bank.json')
  if (!existsSync(sourceFile)) throw new Error(`reuse.json : ${sourceFile} introuvable (construire d'abord l'élection « ${from} »)`)
  const b = readJson(sourceFile)
  origin = { id: from, bank: b.bank, positions: b.positions, questionOf: questionOfApproach(b.bank.questions) }
}
if (reuse?.approaches) {
  const qOf = questionOfApproach(questions)
  const pairsByQuestion = new Map()
  for (const [here, there] of Object.entries(reuse.approaches)) {
    const q = qOf.get(here)
    const sq = origin.questionOf.get(there)
    if (!q) { log.push(`reuse-miss ${here}`); continue }
    if (!sq) { log.push(`reuse-miss ${origin.id}:${there}`); continue }
    const d = textDistance(q.approaches.find(a => a.id === here).text, sq.approaches.find(a => a.id === there).text)
    if (d > FORM_THRESHOLD) { log.push(`reuse-refused-text ${here} <- ${origin.id}:${there} (${pct(d)} du texte modifié)`); continue }
    if (!pairsByQuestion.has(q.id)) pairsByQuestion.set(q.id, new Map())
    const mapped = pairsByQuestion.get(q.id)
    if (mapped.has(there)) { log.push(`reuse-dup ${here} <- ${origin.id}:${there} (déjà repris pour ${mapped.get(there)})`); continue }
    mapped.set(there, here)
  }
  for (const q of questions) {
    const mapped = pairsByQuestion.get(q.id)
    if (!mapped) continue
    const sourceQuestions = [...new Set([...mapped.keys()].map(there => origin.questionOf.get(there)))]
    for (const c of candIds) {
      const row = origin.positions[c]
      if (!row) continue
      // Toutes ses positions sur la ou les questions source, reliées ou non
      const own = sourceQuestions.flatMap(sq => sq.approaches.filter(sa => row[sa.id]).map(sa => [sa.id, row[sa.id]]))
      if (!own.some(([there]) => mapped.has(there))) continue
      if (hasPosition(q, c)) { log.push(`reuse-superseded ${q.id} ${c}`); continue }
      const lostMain = own.find(([there, sp]) => sp.weight === 2 && !mapped.has(there))
      if (lostMain) { log.push(`reuse-refused-main ${q.id} ${c} ${origin.id}:${lostMain[0]}`); continue }
      for (const [there, sp] of own) {
        if (!mapped.has(there)) { log.push(`reuse-unmapped ${q.id} ${c} ${origin.id}:${there}`); continue }
        const here = mapped.get(there)
        q.positions.push({ ...structuredClone(sp), candidate: c, approachId: here, verdict: 'reused', note: `${origin.id}:${there}` })
        log.push(`reuse-position ${q.id} ${c} ${here} <- ${origin.id}:${there}`)
      }
    }
  }
}

// Décisions éditoriales issues de la critique de complétude
const dropA = new Set(decisions.dropApproaches ?? [])
for (const mv of decisions.movePositions ?? []) {
  const q = qById(mv.questionId)
  const p = q?.positions.find(x => x.candidate === mv.candidate && x.approachId === mv.from)
  if (p) { p.approachId = mv.to; log.push(`move ${mv.candidate} ${mv.from} -> ${mv.to}`) }
}
for (const q of questions) {
  q.approaches = q.approaches.filter(a => !dropA.has(a.id))
  q.positions = q.positions.filter(p => !dropA.has(p.approachId))
}
for (const f of decisions.externalFlags ?? []) {
  for (const q of questions) for (const a of q.approaches) if (a.id === f.approachId) a.external = f.external
}
for (const tc of decisions.topicChanges ?? []) {
  const q = qById(tc.questionId)
  if (q) { q.topicId = tc.topicId; log.push(`topic ${q.id} -> ${tc.topicId}`) }
}
// Points d'accord dont le thème a été renommé ou scindé (decisions.consensusTopicChanges)
for (const tc of decisions.consensusTopicChanges ?? []) {
  const hits = consensus.filter(c => c.topicId === tc.from)
  for (const c of hits) c.topicId = tc.to
  if (!hits.length) log.push(`consensus-topic-miss ${tc.from} -> ${tc.to}`)
}
const drops = new Set(decisions.drops ?? [])
for (const tc of decisions.tierChanges ?? []) {
  const q = questions.find(x => x.id === tc.questionId)
  if (q) { q.tier = tc.newTier; log.push(`tier ${q.id} -> ${tc.newTier}`) }
}
for (const pd of decisions.positions ?? []) {
  const q = questions.find(x => x.id === pd.questionId)
  if (!q) continue
  q.positions = q.positions.filter(p => !(p.candidate === pd.candidate && p.approachId === pd.approachId))
  if (!pd.remove) q.positions.push(pd)
  log.push(`position ${pd.remove ? 'removed' : 'set'} ${pd.questionId} ${pd.candidate} ${pd.approachId}`)
}

const step1 = new Set(decisions.step1 ?? [])
const lastInStep = new Set(decisions.lastInStep ?? [])
const explainerFile = join(researchDir, 'explainers.json')
const explainers = new Map(
  (existsSync(explainerFile) ? readJson(explainerFile).explainers : []).map(e => [e.questionId, e]),
)
// Explications reprises des questions identiques de l'élection source (déjà vérifiées, graphiques compris)
const reusedExplainers = new Map()
for (const [here, there] of Object.entries(reuse?.questions ?? {})) {
  const q = qById(here)
  const sq = origin.bank.questions.find(x => x.id === there)
  if (!q) { log.push(`reuse-question-miss ${here}`); continue }
  if (!sq) { log.push(`reuse-question-miss ${origin.id}:${there}`); continue }
  const d = textDistance(q.prompt, sq.prompt)
  if (d > FORM_THRESHOLD) log.push(`reuse-question-reworded ${here} <- ${origin.id}:${there} (${pct(d)} de l'énoncé modifié)`)
  if (sq.explainer) reusedExplainers.set(here, { from: there, explainer: sq.explainer })
}
// Graphiques des chiffres clés : contrôlés ici, la page les dessine sans autre vérification
const chartFile = join(researchDir, 'explainer-charts.json')
const charts = new Map()
// Un nombre dessiné doit être écrit dans la valeur ou le libellé du chiffre, entier, comme FigureChart le
// retrouve à l'affichage ; un grand nombre peut l'être en millions ou en milliards (« 2,76 millions »), un
// nombre négatif sans son signe (« baissé de 2,1 % »). Une base inventée (« 1 » face à « 4,3 fois ») échoue.
const flat = s => s.replace(/[\s\u00a0\u202f]+/g, ' ')
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const frNumber = (n, d) => flat(new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n))
const decimals = n => (String(n).split('.')[1] ?? '').length
function writtenIn(text, n) {
  const a = Math.abs(n)
  const forms = []
  for (let d = decimals(a); d <= decimals(a) + 2; d++) forms.push(escapeRe(frNumber(a, d)))
  for (const [k, word] of [[1e6, '(?:millions?|M)'], [1e9, '(?:milliards?|Md)']]) {
    const v = a / k
    if (v < 1) continue
    for (let d = 0; d <= 3; d++) if (Math.abs(Number(v.toFixed(d)) - v) < 1e-9) forms.push(`${escapeRe(frNumber(v, d))} ${word}`)
  }
  return forms.some(f => new RegExp(`(?<![\\d,])(?<!\\d )${f}(?!\\d|,\\d| \\d{3}(?!\\d))`).test(flat(text)))
}
if (existsSync(chartFile)) {
  const fail = (c, why) => { throw new Error(`explainer-charts : ${c.questionId}#${c.index} : ${why}`) }
  const finite = v => typeof v === 'number' && Number.isFinite(v)
  const text = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max
  for (const c of readJson(chartFile).charts ?? []) {
    const e = explainers.get(c.questionId)
    if (!e) fail(c, 'question sans contexte')
    if (!Number.isInteger(c.index) || c.index < 0 || c.index >= e.figures.length) fail(c, `index hors des ${e.figures.length} chiffres`)
    const key = `${c.questionId}#${c.index}`
    if (charts.has(key)) fail(c, 'graphique en double')
    const g = c.chart ?? {}
    if (g.unit !== undefined && !text(g.unit, 32)) fail(c, 'unité vide ou trop longue')
    let chart
    if (g.kind === 'part') {
      if (!finite(g.value) || !finite(g.total) || g.total <= 0 || g.value < 0 || g.value > g.total) fail(c, 'part : 0 ≤ value ≤ total, total > 0')
      if (g.whole !== undefined && !text(g.whole, 48)) fail(c, 'part : « whole » vide ou trop long')
      // Sans unité, le tout suit directement un nombre : « sur 179 branches suivies », pas « sur 179 des… »
      if (!g.unit && g.whole && /^(?:des|du|de)\s|^d[’']/.test(g.whole)) fail(c, `part sans unité : « ${g.whole} » ne doit pas commencer par un article`)
      chart = { kind: 'part', value: g.value, total: g.total, ...(g.unit ? { unit: typo(g.unit) } : {}), ...(g.whole ? { whole: typo(g.whole) } : {}) }
    } else if (g.kind === 'compare' || g.kind === 'series') {
      const [min, max] = g.kind === 'compare' ? [2, 4] : [2, 6]
      if (!Array.isArray(g.items) || g.items.length < min || g.items.length > max) fail(c, `${g.kind} : de ${min} à ${max} éléments`)
      for (const i of g.items) {
        if (!text(i.label, 32)) fail(c, `${g.kind} : étiquette vide ou de plus de 32 caractères (${i.label})`)
        if (!finite(i.value)) fail(c, `${g.kind} : valeur non finie pour « ${i.label} »`)
      }
      if (new Set(g.items.map(i => i.label)).size !== g.items.length) fail(c, `${g.kind} : étiquettes en double`)
      chart = { kind: g.kind, ...(g.unit ? { unit: typo(g.unit) } : {}), items: g.items.map(i => ({ label: typo(i.label), value: i.value })) }
    } else fail(c, `type inconnu (${g.kind})`)
    const figure = e.figures[c.index]
    // Le tout d'un pourcentage (100 %) n'a pas à être écrit
    const plotted = g.kind === 'part' ? [g.value, ...(g.unit === '%' && g.total === 100 ? [] : [g.total])] : g.items.map(i => i.value)
    const missing = plotted.filter(n => !writtenIn(`${figure.value} ${figure.label}`, n))
    if (missing.length) fail(c, `nombre absent de la valeur et du libellé du chiffre (${missing.join(', ')})`)
    charts.set(key, chart)
  }
  log.push(`charts ${charts.size}`)
}
const source = s => ({
  title: typo(s.title),
  url: s.url,
  ...(s.date ? { date: s.date } : {}),
  ...(s.publisher ? { publisher: typo(s.publisher) } : {}),
})
const explainerOf = id => {
  const e = explainers.get(id)
  if (!e) {
    // Pas d'explication propre : celle de la question identique de l'élection source, telle qu'elle y est publiée
    const r = reusedExplainers.get(id)
    if (!r) return null
    log.push(`reuse-explainer ${id} <- ${origin.id}:${r.from}`)
    return structuredClone(r.explainer)
  }
  if (reusedExplainers.has(id)) log.push(`reuse-explainer-local ${id}`)
  for (const s of [...e.figures.map(f => f.source), ...e.points.filter(p => p.source).map(p => p.source)]) {
    if (!/^https:\/\//.test(s.url)) throw new Error(`explainers : source non https pour ${id} (${s.url})`)
  }
  return {
    summary: typo(e.summary),
    points: e.points.map(p => ({ text: typo(p.text), ...(p.source ? { source: source(p.source) } : {}) })),
    figures: e.figures.map((f, i) => ({
      value: typo(f.value),
      label: typo(f.label),
      date: f.date,
      source: source(f.source),
      ...(charts.has(`${id}#${i}`) ? { chart: charts.get(`${id}#${i}`) } : {}),
    })),
  }
}
const bankQuestions = []
for (const q of questions) {
  if (drops.has(q.id)) { log.push(`drop ${q.id}`); continue }
  const ids = new Set(q.approaches.map(a => a.id))
  const perCand = {}
  for (const p of q.positions) {
    if (!ids.has(p.approachId)) { log.push(`orphan ${q.id} ${p.candidate} ${p.approachId}`); continue }
    if (!candIds.includes(p.candidate)) { log.push(`unknown-candidate ${q.id} ${p.candidate}`); continue }
    if (!(p.weight > 0) && !p.rejects) continue
    if (!p.sources?.length || !p.sources.every(s => /^https?:\/\//.test(s.url))) { log.push(`nosource ${q.id} ${p.candidate}`); continue }
    let weight = p.weight > 0 ? p.weight : undefined
    if (p.nature === 'inference' && weight === 2) weight = 1
    const list = (perCand[p.candidate] ??= [])
    if (weight === 2 && list.some(x => x.weight === 2)) { weight = 1; log.push(`downgrade-dup-main ${q.id} ${p.candidate}`) }
    if (weight === 1 && list.some(x => x.weight === 1)) { log.push(`dup-secondary-dropped ${q.id} ${p.candidate} ${p.approachId}`); continue }
    const entry = {
      ...(weight ? { weight } : {}),
      ...(p.rejects ? { rejects: true } : {}),
      nature: p.nature,
      confidence: p.confidence,
      summary: typo(p.summary),
      sources: p.sources.map(s => ({
        title: typo(s.title),
        url: s.url,
        ...(s.date ? { date: s.date } : {}),
        ...(s.publisher ? { publisher: typo(s.publisher) } : {}),
      })),
    }
    list.push(entry)
    positions[p.candidate][p.approachId] = entry
  }
  const explainer = explainerOf(q.id)
  bankQuestions.push({
    id: q.id,
    topicId: q.topicId,
    tier: q.tier,
    ...(q.tier === 'essentiel' && step1.size ? { step: step1.has(q.id) ? 1 : 2 } : {}),
    ...(lastInStep.has(q.id) ? { last: true } : {}),
    prompt: typo(q.prompt),
    ...(q.context ? { context: typo(q.context) } : {}),
    ...(explainer ? { explainer } : {}),
    approaches: q.approaches.map(a => ({ id: a.id, text: typo(a.text), ...(a.external ? { external: true } : {}) })),
  })
}

for (const id of step1) {
  const q = bankQuestions.find(x => x.id === id)
  if (!q || q.tier !== 'essentiel') throw new Error(`step1 : ${id} n'est pas une question du questionnaire rapide`)
}
for (const id of lastInStep) {
  if (!bankQuestions.some(x => x.id === id)) throw new Error(`lastInStep : ${id} n'est pas une question de la banque`)
}

// Révisions : un changement de fond (énoncé ou approches) incrémente la révision, une retouche de forme la garde
const revFile = join(researchDir, 'revisions.json')
const registry = existsSync(revFile) && !resetRevisions ? readJson(revFile) : {}
const deepChanges = []
for (const q of bankQuestions) {
  const { entry, change } = nextRevision(registry[q.id], questionText(q))
  if (registry[q.id] && change !== 'same') log.push(`revision-${change} ${q.id} -> ${entry.rev}.${entry.minor}`)
  if (registry[q.id] && change === 'fond') deepChanges.push(`${q.id} (révision ${entry.rev})`)
  registry[q.id] = entry
  const { id, topicId, tier, step, ...rest } = q
  Object.keys(q).forEach(k => delete q[k])
  Object.assign(q, { id, topicId, tier, ...(step ? { step } : {}), rev: entry.rev, ...rest })
}
writeFileSync(revFile, JSON.stringify(Object.fromEntries(Object.entries(registry).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n')
if (deepChanges.length) console.log(`Changements de fond, réponses à revoir si le suivi est actif : ${deepChanges.join(', ')}`)

const usedTopics = topics.filter(t => bankQuestions.some(q => q.topicId === t.id)).map(t => ({ ...t, label: typo(t.label), description: typo(t.description) }))
const bank = { topics: usedTopics, questions: bankQuestions, consensus: consensus.map(c => ({ ...c, text: typo(c.text) })) }

// Candidats publiés (positions.ts) et candidats en attente préparés (research-dir/bank.json, « prepared »)
const publishedPositions = Object.fromEntries(published.map(c => [c, positions[c]]))
const prepared = Object.fromEntries(candIds.filter(c => !published.includes(c)).map(c => [c, positions[c]]))
for (const [c, row] of Object.entries(prepared)) log.push(`prepared ${c} ${Object.keys(row).length} positions (non publié, --include ${c} pour le publier)`)
for (const c of include ?? []) log.push(`include ${c} ${Object.keys(positions[c]).length} positions`)

// Périmètre vidéo (reuse.json) : séries existantes réétiquetées pour cette élection
let videoScope = null
if (reuse) {
  videoScope = { topics: {}, questions: {} }
  const seriesDir = new URL('../src/ui/videos/series/', import.meta.url)
  for (const [serie, topicId] of Object.entries(reuse.videoTopics ?? {})) {
    if (!existsSync(new URL(`${serie}.ts`, seriesDir))) { log.push(`video-series-miss ${serie}`); continue }
    if (!usedTopics.some(t => t.id === topicId)) { log.push(`video-topic-miss ${serie} -> ${topicId}`); continue }
    videoScope.topics[serie] = topicId
  }
  for (const [here, there] of Object.entries(reuse.questions ?? {})) {
    if (!bankQuestions.some(q => q.id === here) || !origin.bank.questions.some(q => q.id === there)) continue
    if (videoScope.questions[there]) { log.push(`video-question-dup ${there} -> ${here} (gardée : ${videoScope.questions[there]})`); continue }
    videoScope.questions[there] = here
  }
}

mkdirSync(srcDir, { recursive: true })
writeFileSync(join(researchDir, 'bank.json'), JSON.stringify({ bank, positions: publishedPositions, ...(Object.keys(prepared).length ? { prepared } : {}) }, null, 2))
const header = `// Fichier généré par tools/build-pack.mjs depuis research/${electionId} : ne pas modifier à la main.\n`
writeFileSync(join(srcDir, 'bank.ts'), `${header}import type { QuestionBank } from '../../core/types'\n\nexport const bank: QuestionBank = ${JSON.stringify(bank, null, 2)}\n`)
writeFileSync(join(srcDir, 'positions.ts'), `${header}import type { PositionTable } from '../../core/types'\n\nexport const positions: PositionTable = ${JSON.stringify(publishedPositions, null, 2)}\n`)
if (videoScope) {
  writeFileSync(
    join(srcDir, 'videos.ts'),
    `${header}// Séries vidéo reprises de « ${origin.id} » (research/${electionId}/reuse.json) : thème de la série → thème d'ici,\n` +
      `// question de « ${origin.id} » → question identique d'ici. Une série absente de « topics » n'est pas montrée.\n\n` +
      `export const videoScope: { topics: Record<string, string>; questions: Record<string, string> } = ${JSON.stringify(videoScope, null, 2)}\n`,
  )
}
writeFileSync(join(researchDir, 'build-log.txt'), log.join('\n'))
const ess = bankQuestions.filter(q => q.tier === 'essentiel').length
console.log(`topics ${usedTopics.length}, questions ${bankQuestions.length} (essentiel ${ess}, approfondi ${bankQuestions.length - ess}), log ${log.length} lignes`)
if (Object.keys(prepared).length || include) {
  console.log(`candidats publiés ${published.length}${Object.keys(prepared).length ? `, préparés sans publication : ${Object.keys(prepared).join(', ')}` : ''}`)
}
if (videoScope) console.log(`vidéos : ${Object.keys(videoScope.topics).length} séries, ${Object.keys(videoScope.questions).length} questions reliées`)
