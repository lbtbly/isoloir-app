// Écrit research/<id>/reuse.json : la reprise d'une élection déjà construite (questions, approches et séries vidéo
// identiques), à partir des champs reuseOf que tools/workflows/2-question-bank.js met sur les questions et les
// approches reprises de la banque précédente. tools/build-pack.mjs lit ensuite ce fichier (format : son en-tête) :
// explications et positions déjà vérifiées reprises, et src/elections/<id>/videos.ts (export const videoScope).
//
// Usage : node tools/build-reuse.mjs research/<id> [sortie-banque.json…] [--from <élection>] [--reset-videos] [--dry-run]
//   sortie-banque.json : défaut research/<id>/question-bank-output.json ; d'autres fichiers au même format
//     (drafts[].questions[]) peuvent suivre, comme research/<id>/expansion-merged.json (sans reuseOf : ignoré).
//   --from : élection source ; défaut : le dossier research/<from>/ des reuseDossier de config.json.
//   --reset-videos : recalcule videoTopics même si reuse.json existe déjà.
//   --dry-run : affiche le résultat sans rien écrire.
//
// Lit research/<id>/config.json (topics[].reuse), research/<id>/decisions.json (reformulations, pour comparer
// les textes tels que build-pack les publiera), research/<from>/bank.json et src/ui/videos/series/*.ts.
//
// Contenu écrit : { from, questions: { <question ici>: <question source> }, approaches: { <approche ici>:
// <approche source> }, videoTopics: { <thème de série>: <thème ici> } }
// - questions : chaque question marquée reuseOf dont la source existe dans research/<from>/bank.json ;
// - approaches : chaque approche marquée reuseOf ; pour une question reprise, une approche non marquée est
//   appariée à l'approche de la question source dont le texte est le plus proche, si moins de 15 % du texte
//   diffère (seuil des révisions, FORM_THRESHOLD) et si cette approche source n'est pas déjà reliée ;
// - videoTopics : la série d'un thème qui existe ici sous le même identifiant et que config.topics marque
//   « reuse » ; une série dont le thème n'existe pas ici (« strategie » pour la présidentielle) n'est pas reprise.
//   Si reuse.json existe déjà, ses videoTopics sont gardés tels quels : ce sont les décisions du propriétaire
//   (séries écartées après tools/workflows/7-spectrum-review.js). --reset-videos les recalcule.
// Avertissements (rien n'est bloquant, build-pack contrôle à nouveau et journalise reuse-…) : source
// introuvable, approche reprise d'une autre question que la question reprise, deux questions d'ici pour une même
// source, texte trop modifié (build-pack refusera alors la reprise des positions de cette approche).
//
// Il faut Node 22.18+ (src/core/revisions.ts est importé tel quel, comme dans build-pack).

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FORM_THRESHOLD, editRatio, normalizeText } from '../src/core/revisions.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const USAGE = 'Usage : node tools/build-reuse.mjs research/<id> [sortie-banque.json…] [--from <élection>] [--reset-videos] [--dry-run]'
const argv = process.argv.slice(2)
let from = null
const positional = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--from' || a.startsWith('--from=')) from = a === '--from' ? argv[++i] : a.slice('--from='.length)
  else if (a === '--reset-videos' || a === '--dry-run') continue
  else if (a.startsWith('--')) throw new Error(`Option inconnue : ${a}\n${USAGE}`)
  else positional.push(a)
}
const resetVideos = argv.includes('--reset-videos')
const dryRun = argv.includes('--dry-run')
const [researchDir, ...outputs] = positional
if (!researchDir) throw new Error(USAGE)
const readJson = f => JSON.parse(readFileSync(f, 'utf8'))

const configFile = join(researchDir, 'config.json')
if (!existsSync(configFile)) throw new Error(`${configFile} manquant`)
const config = readJson(configFile)
const electionId = config.id ?? basename(resolve(researchDir))
const sourceOf = p => (String(p ?? '').match(/(?:^|\/)research\/([^/]+)\//) ?? [])[1] ?? null
from ??= (config.candidates ?? []).map(c => sourceOf(c.reuseDossier)).find(Boolean) ?? null
if (!from) throw new Error(`élection source inconnue : --from <élection> (aucun reuseDossier dans ${configFile})`)
if (from === electionId) throw new Error(`--from : ${from} est l'élection elle-même`)
const sourceFile = join(dirname(resolve(researchDir)), from, 'bank.json')
if (!existsSync(sourceFile)) throw new Error(`${sourceFile} introuvable (construire d'abord l'élection « ${from} »)`)
const source = readJson(sourceFile).bank
const sourceQ = new Map(source.questions.map(q => [q.id, q]))
const sourceQOfApproach = new Map(source.questions.flatMap(q => q.approaches.map(a => [a.id, q])))

// Textes tels que build-pack les publiera : reformulations de la relecture et des décisions, sauf refus
const decisionsFile = join(researchDir, 'decisions.json')
const decisions = existsSync(decisionsFile) ? readJson(decisionsFile) : {}
const files = outputs.length ? outputs : [join(researchDir, 'question-bank-output.json')]
const drafts = []
const edits = []
for (const f of files) {
  const raw = readJson(f)
  const wf = raw.result ?? raw
  drafts.push(...(wf.drafts ?? []))
  edits.push(...(wf.neutrality?.edits ?? []))
}
edits.push(...(decisions.edits ?? []))
const rejected = new Set(decisions.rejectEdits ?? [])
const finalText = new Map()
for (const e of edits) if (!rejected.has(`${e.id}:${e.field}`)) finalText.set(`${e.id}|${e.field}`, e.newText)
const textOf = (id, field, text) => finalText.get(`${id}|${field}`) ?? text
const distance = (a, b) => editRatio(normalizeText(a), normalizeText(b))
const pct = r => `${Math.round(r * 100)} %`

const warnings = []
const notes = []
const questions = {}
const approaches = {}
const hereOfSource = new Map()
let marked = 0
for (const q of drafts.flatMap(d => d.questions ?? [])) {
  const sq = q.reuseOf ? sourceQ.get(q.reuseOf) : null
  if (q.reuseOf && !sq) warnings.push(`${q.id} : question source ${from}:${q.reuseOf} introuvable, reprise ignorée`)
  if (sq) {
    if (hereOfSource.has(sq.id)) warnings.push(`${q.id} et ${hereOfSource.get(sq.id)} reprennent tous deux ${from}:${sq.id} (build-pack relie les vidéos à la première)`)
    else hereOfSource.set(sq.id, q.id)
    questions[q.id] = sq.id
    const d = distance(textOf(q.id, 'prompt', q.prompt), sq.prompt)
    if (d > FORM_THRESHOLD) notes.push(`${q.id} : énoncé modifié à ${pct(d)} par rapport à ${from}:${sq.id} (explication à relire : 4-explainers.js avec from)`)
  }
  const used = new Set()
  for (const a of q.approaches ?? []) {
    if (!a.reuseOf) continue
    marked++
    const saq = sourceQOfApproach.get(a.reuseOf)
    if (!saq) { warnings.push(`${a.id} : approche source ${from}:${a.reuseOf} introuvable, reprise ignorée`); continue }
    if (sq && saq.id !== sq.id) warnings.push(`${a.id} : reprend ${from}:${a.reuseOf}, d'une autre question que ${from}:${sq.id}`)
    if (!sq) warnings.push(`${a.id} : approche reprise sur une question non reprise (${q.id})`)
    const d = distance(textOf(a.id, 'text', a.text), saq.approaches.find(x => x.id === a.reuseOf).text)
    if (d > FORM_THRESHOLD) warnings.push(`${a.id} : ${pct(d)} du texte modifié par rapport à ${from}:${a.reuseOf} (build-pack refusera la reprise des positions)`)
    approaches[a.id] = a.reuseOf
    used.add(a.reuseOf)
  }
  // Approches non marquées d'une question reprise : appariement par le texte
  if (!sq) continue
  for (const a of q.approaches ?? []) {
    if (a.reuseOf) continue
    const text = textOf(a.id, 'text', a.text)
    let best = null
    for (const sa of sq.approaches) {
      if (used.has(sa.id)) continue
      const d = distance(text, sa.text)
      if (d <= FORM_THRESHOLD && (!best || d < best.d)) best = { id: sa.id, d }
    }
    if (!best) continue
    approaches[a.id] = best.id
    used.add(best.id)
    notes.push(`${a.id} ← ${from}:${best.id} apparié par le texte (${pct(best.d)} de différence)`)
  }
}

// Séries vidéo : celles des thèmes repris sous le même identifiant, sauf décision déjà consignée dans reuse.json
const reuseFile = join(researchDir, 'reuse.json')
const previous = existsSync(reuseFile) ? readJson(reuseFile) : null
const seriesDir = join(ROOT, 'src', 'ui', 'videos', 'series')
const series = readdirSync(seriesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts').map(f => f.slice(0, -3)).sort()
let videoTopics
if (previous?.videoTopics && !resetVideos) {
  videoTopics = previous.videoTopics
  notes.push(`videoTopics gardés de ${reuseFile} (${Object.keys(videoTopics).length} séries ; --reset-videos pour les recalculer)`)
} else {
  videoTopics = {}
  const topics = new Map((config.topics ?? []).map(t => [t.id, t]))
  for (const s of series) {
    const t = topics.get(s)
    if (t?.reuse) videoTopics[s] = s
    else notes.push(`série ${s} non reprise (${t ? 'thème marqué « reuse: false »' : 'thème absent de la configuration'})`)
  }
}
for (const [s, t] of Object.entries(videoTopics)) {
  if (!series.includes(s)) warnings.push(`videoTopics : série ${s} introuvable dans src/ui/videos/series/`)
  if (!(config.topics ?? []).some(x => x.id === t)) warnings.push(`videoTopics : thème ${t} (série ${s}) absent de la configuration`)
}

const out = { from, questions, approaches, videoTopics }
const nq = Object.keys(questions).length
const na = Object.keys(approaches).length
console.log(`${electionId} ← ${from} : ${nq} questions, ${na} approches (${marked} marquées reuseOf), ${Object.keys(videoTopics).length} séries vidéo`)
for (const n of notes) console.log(`  ${n}`)
for (const w of warnings) console.warn(`attention : ${w}`)
if (dryRun) console.log(JSON.stringify(out, null, 2))
else {
  writeFileSync(reuseFile, JSON.stringify(out, null, 2) + '\n')
  console.log(`écrit ${reuseFile}`)
}
