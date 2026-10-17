// Convertit la sortie du workflow « bank-expansion » (tools/workflows/3-bank-expansion.js) en un fichier au format de
// « question-bank », lu par tools/build-pack.mjs comme extension : applique le fact-check (refuted → supprimé,
// adjusted → corrigé, sans vérification → confiance baissée d'un cran et verdict « unchecked ») et écarte les questions
// que le critique signale comme doublons.
//
// Usage : node tools/merge-expansion.mjs <expansion-output.json> <out.json> [--no-gapfills]
//   <expansion-output.json> : le fichier du workflow (…/workflows/wf_<runId>.json, clé result) ou sa valeur de retour
//   <out.json>              : le fichier écrit, { result: { drafts: [{ group: 'expansion', topics, questions, … }],
//                             neutrality: { edits }, gapFills } }
//   --no-gapfills           : la nouvelle question de la veille automatique (3-bank-expansion subjectsOnly ;
//                             tools/veille/CONTRACT.md, §f) : gapFills vide, et seules restent les reformulations
//                             (neutrality.edits) d'une question gardée ou de ses approches ; les compléments n'ont ni
//                             historyCause ni statedAt (positions-history les dirait « non-précisée »), et une
//                             reformulation ailleurs changerait une question ou un thème publiés sans décision. Chaque
//                             élément écarté est noté au journal
// Sorties : <out.json> ; sur stdout, « questions N, gapFills M », puis le journal (une ligne par élément écarté,
// corrigé ou non vérifié). Code 2 : appel mal formé (fichier manquant, option inconnue).
import { readFileSync, writeFileSync } from 'node:fs'

const argv = process.argv.slice(2)
const FLAGS = ['--no-gapfills']
const unknown = argv.filter(a => a.startsWith('--') && !FLAGS.includes(a))
const [inFile, outFile, ...more] = argv.filter(a => !a.startsWith('--'))
if (unknown.length || !inFile || !outFile || more.length) {
  console.error(`${unknown.length ? `Option inconnue : ${unknown.join(', ')}. ` : ''}Usage : node tools/merge-expansion.mjs <expansion-output.json> <out.json> [--no-gapfills]`)
  process.exit(2)
}
const NO_GAPFILLS = argv.includes('--no-gapfills')
const raw = JSON.parse(readFileSync(inFile, 'utf8'))
const wf = raw.result ?? raw
const design = wf.design
const log = []
const key = p => `${p.questionId}|${p.candidate}|${p.approachId}`
const checks = new Map((wf.checks ?? []).map(c => [key(c), c]))

function apply(p) {
  const c = checks.get(key(p))
  if (!c) { log.push(`unchecked ${key(p)}`); return { ...p, confidence: p.confidence === 'high' ? 'medium' : 'low', verdict: 'unchecked' } }
  if (c.verdict === 'refuted') { log.push(`refuted ${key(p)} : ${c.note}`); return null }
  return { candidate: c.candidate, approachId: c.approachId, weight: c.weight, rejects: c.rejects, nature: c.nature, confidence: c.confidence, summary: c.summary, sources: c.sources, verdict: c.verdict, note: c.note }
}

const dupIds = new Set((wf.neutrality?.duplicates ?? []).map(d => d.newId))
const questions = []
for (const q of design.questions) {
  if (dupIds.has(q.id)) { log.push(`duplicate dropped ${q.id}`); continue }
  const positions = q.positions.map(p => apply({ ...p, questionId: q.id })).filter(Boolean)
  questions.push({ ...q, positions })
}
let gapFills
let edits = wf.neutrality?.edits ?? []
if (NO_GAPFILLS) {
  // Ni compléments, ni reformulations hors des questions gardées et de leurs approches
  gapFills = []
  for (const p of design.gapFills ?? []) log.push(`gapfill écarté (--no-gapfills) ${key(p)}`)
  const ownIds = new Set(questions.flatMap(q => [q.id, ...q.approaches.map(a => a.id)]))
  const kept = edits.filter(e => ownIds.has(e.id))
  for (const e of edits) if (!ownIds.has(e.id)) log.push(`reformulation écartée (--no-gapfills) ${e.id}.${e.field}`)
  log.push(`--no-gapfills : ${(design.gapFills ?? []).length} complément(s) et ${edits.length - kept.length} reformulation(s) hors des nouvelles questions écartés`)
  edits = kept
} else {
  gapFills = (design.gapFills ?? []).map(p => {
    const r = apply(p)
    return r ? { ...r, questionId: p.questionId } : null
  }).filter(Boolean)
}

writeFileSync(outFile, JSON.stringify({
  result: {
    drafts: [{ group: 'expansion', topics: design.newTopics ?? [], questions, consensus: [], dropped: [] }],
    neutrality: { edits },
    gapFills,
  },
}, null, 2))
console.log(`questions ${questions.length}, gapFills ${gapFills.length}`)
console.log(log.join('\n'))
