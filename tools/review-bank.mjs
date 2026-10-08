// Affiche une vue de relecture de la sortie du workflow question-bank.
// Usage : node tools/review-bank.mjs <workflow-output.json> [--election <id>] [--bank] [--edits] [--critic] [--checks]
//   --proposals : points soumis au propriétaire par 2-question-bank.js et 3-bank-expansion.js (étape 1 proposée,
//   règles chiffrées, sujets absents, reformulations de thèmes, approches manquantes, attributions contestées,
//   doublons) ; marche aussi sur la sortie brute de 3-bank-expansion.js (expansion-output.json).
// Élection : --election, sinon déduite du chemin (research/<id>/…), sinon la primaire « Choisir 2027 ».
// Initiales des candidats : research/<id>/config.json, sinon src/elections/<id>/candidates.ts, sinon celles
// de la primaire. Les candidats en attente de la primaire (pendingPrimary) ne sont comptés parmi les
// « inconnus » que s'ils ont déjà une position dans la sortie.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const ei = argv.findIndex(a => a === '--election' || a.startsWith('--election='))
let electionId = null
if (ei >= 0) electionId = argv[ei].includes('=') ? argv[ei].split('=')[1] : argv[ei + 1]
const rest = argv.filter((a, i) => ei < 0 || (i !== ei && !(i === ei + 1 && !argv[ei].includes('='))))
const [file, ...flags] = rest
const raw = JSON.parse(readFileSync(file, 'utf8'))
const wf = raw.result ?? raw
electionId ??= resolve(file).match(/[\\/]research[\\/]([^\\/]+)[\\/]/)?.[1] ?? 'choisir-2027'
const I = candidateInitials(electionId)
const has = f => flags.includes(f)

function candidateInitials(id) {
  const used = new Set((wf.drafts ?? []).flatMap(d => (d.questions ?? []).flatMap(q => (q.positions ?? []).map(p => p.candidate))))
  const config = join(ROOT, 'research', id, 'config.json')
  if (existsSync(config)) {
    const C = JSON.parse(readFileSync(config, 'utf8'))
    return Object.fromEntries(C.candidates.filter(c => !c.pendingPrimary || used.has(c.id)).map(c => [c.id, c.initials]))
  }
  const ts = join(ROOT, 'src', 'elections', id, 'candidates.ts')
  if (existsSync(ts)) {
    const src = readFileSync(ts, 'utf8')
    const re = /["']?\bid["']?\s*:\s*(['"])([^'"]+)\1[\s\S]*?["']?\binitials["']?\s*:\s*(['"])([^'"]+)\3/g
    const found = Object.fromEntries([...src.matchAll(re)].map(m => [m[2], m[4]]))
    if (Object.keys(found).length) return found
  }
  return { faure: 'OF', glucksmann: 'RG', guedj: 'JG', maurel: 'EM', royal: 'SR' }
}

if (!flags.length || has('--bank')) {
  for (const d of wf.drafts) {
    console.log(`\n=== ${d.group} === topics: ${d.topics.map(t => `${t.id}=${t.label}`).join(' | ')}`)
    for (const q of d.questions) {
      const known = new Set(q.positions.filter(p => p.confidence !== 'low' && (p.weight > 0 || p.rejects)).map(p => p.candidate))
      const unknown = Object.keys(I).filter(c => !known.has(c)).map(c => I[c])
      console.log(`\n[${q.tier === 'essentiel' ? 'ESS' : 'app'}] ${q.id} — ${q.prompt}${unknown.length ? `   (inconnus: ${unknown.join(',')})` : ''}`)
      if (q.context) console.log(`      ctx: ${q.context}`)
      for (const a of q.approaches) {
        const h = q.positions.filter(p => p.approachId === a.id).map(p => `${I[p.candidate] ?? p.candidate}${p.rejects ? '✕' : p.weight}${p.confidence === 'low' ? '?' : ''}${p.verdict && p.verdict !== 'confirmed' ? `[${p.verdict}]` : ''}`)
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
    for (const q of d.questions) for (const p of q.positions) if (p.verdict && p.verdict !== 'confirmed') console.log(`${p.verdict} ${q.id} ${I[p.candidate] ?? p.candidate} ${p.approachId}: ${p.note ?? ''}`)
    for (const i of d.question_issues ?? []) console.log(`ISSUE ${i.questionId}: ${i.issue}`)
  }
  console.log((wf.logs ?? []).join('\n'))
}
if (has('--proposals')) {
  const c = wf.critic ?? {}
  const st = wf.stats ?? {}
  if (st.rules) console.log(`RÈGLES ${JSON.stringify(st.rules)}`)
  if (st.step1Proposal) console.log(`ÉTAPE 1 calculée${st.step1Proposal.ok ? '' : ' (NON conforme)'} : ${st.step1Proposal.questionIds.join(', ')}${st.step1Proposal.candidatesUnder?.length ? ` ; sous le seuil : ${st.step1Proposal.candidatesUnder.join(', ')}` : ''}`)
  if (c.step1) console.log(`ÉTAPE 1 du critique : ${c.step1.questionIds.join(', ')}\n   ↳ ${c.step1.why}`)
  for (const t of c.tierChanges ?? []) console.log(`TIER ${t.questionId} → ${t.newTier}: ${t.why}`)
  for (const t of c.drops ?? []) console.log(`DROP ${t.questionId}: ${t.why}`)
  for (const d of c.duplicates ?? []) console.log(`DOUBLON ${d.newId} ≈ ${d.existingId}: ${d.why}`)
  for (const u of c.candidatesUnder ?? []) console.log(`SOUS LE SEUIL ${I[u.candidate] ?? u.candidate} (${u.scope}) : ${u.known}/${u.required}`)
  for (const pr of c.undistinguishedPairs ?? []) console.log(`PAIRE NON DISTINGUÉE ${pr}`)
  for (const m of c.missingSubjects ?? []) console.log(`SUJET ABSENT ${m.subject} (${(m.candidatesWithPositions ?? []).join(', ')}) : ${m.why}\n   → ${m.proposal}`)
  const pr = wf.neutrality?.proposals ?? {}
  for (const e of pr.topicEdits ?? []) console.log(`THÈME ${e.id}.${e.field}: ${e.newText}\n   ↳ ${e.reason}`)
  for (const m of pr.missingApproaches ?? []) console.log(`APPROCHE MANQUANTE (${m.by}) ${m.questionId}: ${m.text}\n   ↳ ${m.why}`)
  for (const g of pr.topicGaps ?? []) console.log(`SUJET (${g.by}) ${g.subject}${g.topicId ? ` [${g.topicId}]` : ''}: ${g.why}`)
  for (const i of pr.positionIssues ?? []) console.log(`ATTRIBUTION (${i.by}) ${i.questionId} ${i.candidate ?? ''} ${i.approachId ?? ''}: ${i.issue}`)
}
