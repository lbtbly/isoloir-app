// Convertit la sortie du workflow « bank-expansion » en un fichier au format de « question-bank »,
// en appliquant le fact-check (refuted → supprimé, adjusted → corrigé) et en écartant les doublons.
// Usage : node tools/merge-expansion.mjs <expansion-output.json> <out.json>
import { readFileSync, writeFileSync } from 'node:fs'

const [inFile, outFile] = process.argv.slice(2)
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
const gapFills = (design.gapFills ?? []).map(p => {
  const r = apply(p)
  return r ? { ...r, questionId: p.questionId } : null
}).filter(Boolean)

writeFileSync(outFile, JSON.stringify({
  result: {
    drafts: [{ group: 'expansion', topics: design.newTopics ?? [], questions, consensus: [], dropped: [] }],
    neutrality: { edits: wf.neutrality?.edits ?? [] },
    gapFills,
  },
}, null, 2))
console.log(`questions ${questions.length}, gapFills ${gapFills.length}`)
console.log(log.join('\n'))
