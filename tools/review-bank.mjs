// Affiche une vue de relecture de la sortie du workflow question-bank.
// Usage : node tools/review-bank.mjs <workflow-output.json> [--edits] [--critic] [--checks]
import { readFileSync } from 'node:fs'
const [file, ...flags] = process.argv.slice(2)
const raw = JSON.parse(readFileSync(file, 'utf8'))
const wf = raw.result ?? raw
const I = { faure: 'OF', glucksmann: 'RG', guedj: 'JG', maurel: 'EM', royal: 'SR' }
const has = f => flags.includes(f)

if (!flags.length || has('--bank')) {
  for (const d of wf.drafts) {
    console.log(`\n=== ${d.group} === topics: ${d.topics.map(t => `${t.id}=${t.label}`).join(' | ')}`)
    for (const q of d.questions) {
      const known = new Set(q.positions.filter(p => p.confidence !== 'low' && (p.weight > 0 || p.rejects)).map(p => p.candidate))
      const unknown = Object.keys(I).filter(c => !known.has(c)).map(c => I[c])
      console.log(`\n[${q.tier === 'essentiel' ? 'ESS' : 'app'}] ${q.id} — ${q.prompt}${unknown.length ? `   (inconnus: ${unknown.join(',')})` : ''}`)
      if (q.context) console.log(`      ctx: ${q.context}`)
      for (const a of q.approaches) {
        const h = q.positions.filter(p => p.approachId === a.id).map(p => `${I[p.candidate]}${p.rejects ? '✕' : p.weight}${p.confidence === 'low' ? '?' : ''}${p.verdict && p.verdict !== 'confirmed' ? `[${p.verdict}]` : ''}`)
        console.log(`   ${a.id.split('-').pop()}${a.external ? '*' : ' '} ${a.text}  → ${h.join(' ') || '—'}`)
      }
    }
    if (d.consensus?.length) console.log(`  consensus: ${d.consensus.map(c => c.text).join(' / ')}`)
    if (d.dropped?.length) console.log(`  dropped: ${d.dropped.map(c => `${c.what} (${c.why})`).join(' / ')}`)
  }
  console.log('\nSTATS', JSON.stringify(wf.stats))
}
if (has('--edits')) for (const e of wf.neutrality?.edits ?? []) console.log(`${e.id}.${e.field}: ${e.newText}\n   ↳ ${e.reason}`)
if (has('--edits')) for (const r of wf.neutrality?.recognizable ?? []) console.log(`RECO ${r.approachId} (${r.guessedCandidate ?? '?'}): ${r.why}`)
if (has('--critic')) {
  console.log(wf.critic?.summary)
  for (const i of wf.critic?.issues ?? []) console.log(`[${i.severity}] ${i.questionId ?? ''} ${i.issue}\n   → ${i.fix}`)
  for (const t of wf.critic?.tierChanges ?? []) console.log(`TIER ${t.questionId} → ${t.newTier}: ${t.why}`)
  for (const t of wf.critic?.drops ?? []) console.log(`DROP ${t.questionId}: ${t.why}`)
}
if (has('--checks')) {
  for (const d of wf.drafts) {
    for (const q of d.questions) for (const p of q.positions) if (p.verdict && p.verdict !== 'confirmed') console.log(`${p.verdict} ${q.id} ${I[p.candidate]} ${p.approachId}: ${p.note ?? ''}`)
    for (const i of d.question_issues ?? []) console.log(`ISSUE ${i.questionId}: ${i.issue}`)
  }
  console.log((wf.logs ?? []).join('\n'))
}
