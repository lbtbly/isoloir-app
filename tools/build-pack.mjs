// Construit les fichiers de données d'une élection à partir de la sortie du workflow
// « question-bank » (brouillons vérifiés + relecture de neutralité) et des décisions éditoriales.
//
// Usage : node tools/build-pack.mjs <workflow-output.json> <research-dir> <election-src-dir> [expansion.json…] [--reset-revisions]
//   research-dir/decisions.json (facultatif) : { tierChanges: [{questionId, newTier}], drops: [questionId],
//     edits: [{id, field, newText}], rejectEdits: [id:field], positions: [{questionId, candidate, approachId, remove?|...}],
//     step1: [questionId] (questions du premier dépouillement),
//     lastInStep: [questionId] (questions qui ferment toujours leur temps au lieu d'être placées au hasard) }
//   research-dir/explainers.json (facultatif) : { explainers: [{ questionId, summary, points, figures }] },
//     contexte détaillé et chiffres sourcés de chaque question, vérifiés contre leurs sources.
//   research-dir/explainer-charts.json (facultatif) : { charts: [{ questionId, index, chart }] }, petit graphique
//     du chiffre n° index d'une question (type FigureChart de src/core/types.ts) ; chaque nombre doit déjà
//     figurer dans la valeur ou le libellé du chiffre.
//   research-dir/revisions.json : registre des révisions de questions, tenu à jour à chaque construction.
//     --reset-revisions repart de la révision 1 pour toutes les questions (passage en production).

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { nextRevision, questionText } from '../src/core/revisions.ts'

const args = process.argv.slice(2)
const resetRevisions = args.includes('--reset-revisions')
const [outFile, researchDir, srcDir, ...extraFiles] = args.filter(a => !a.startsWith('--'))
const raw = JSON.parse(readFileSync(outFile, 'utf8'))
const wf = structuredClone(raw.result ?? raw)
// Sorties supplémentaires (extension de la banque) : brouillons, reformulations, compléments de positions
wf.gapFills = []
for (const f of extraFiles) {
  const extra = JSON.parse(readFileSync(f, 'utf8'))
  const x = extra.result ?? extra
  wf.drafts.push(...(x.drafts ?? []))
  wf.neutrality = { ...(wf.neutrality ?? {}), edits: [...(wf.neutrality?.edits ?? []), ...(x.neutrality?.edits ?? [])] }
  wf.gapFills.push(...(x.gapFills ?? []))
}
const decisions = existsSync(join(researchDir, 'decisions.json'))
  ? JSON.parse(readFileSync(join(researchDir, 'decisions.json'), 'utf8'))
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

const drafts = wf.drafts ?? []
const topics = []
const questions = []
const consensus = []
const positions = {}
const candIds = ['faure', 'glucksmann', 'guedj', 'maurel', 'royal']
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
for (const c of consensus) if (c.topicId === 'international_defense') c.topicId = 'proche_orient'
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
  (existsSync(explainerFile) ? JSON.parse(readFileSync(explainerFile, 'utf8')).explainers : []).map(e => [e.questionId, e]),
)
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
  for (const c of JSON.parse(readFileSync(chartFile, 'utf8')).charts ?? []) {
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
  if (!e) return null
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
    if (!candIds.includes(p.candidate)) continue
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
  bankQuestions.push({
    id: q.id,
    topicId: q.topicId,
    tier: q.tier,
    ...(q.tier === 'essentiel' && step1.size ? { step: step1.has(q.id) ? 1 : 2 } : {}),
    ...(lastInStep.has(q.id) ? { last: true } : {}),
    prompt: typo(q.prompt),
    ...(q.context ? { context: typo(q.context) } : {}),
    ...(explainerOf(q.id) ? { explainer: explainerOf(q.id) } : {}),
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
const registry = existsSync(revFile) && !resetRevisions ? JSON.parse(readFileSync(revFile, 'utf8')) : {}
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

writeFileSync(join(researchDir, 'bank.json'), JSON.stringify({ bank, positions }, null, 2))
const header = '// Fichier généré par tools/build-pack.mjs depuis research/choisir-2027 : ne pas modifier à la main.\n'
writeFileSync(join(srcDir, 'bank.ts'), `${header}import type { QuestionBank } from '../../core/types'\n\nexport const bank: QuestionBank = ${JSON.stringify(bank, null, 2)}\n`)
writeFileSync(join(srcDir, 'positions.ts'), `${header}import type { PositionTable } from '../../core/types'\n\nexport const positions: PositionTable = ${JSON.stringify(positions, null, 2)}\n`)
writeFileSync(join(researchDir, 'build-log.txt'), log.join('\n'))
const ess = bankQuestions.filter(q => q.tier === 'essentiel').length
console.log(`topics ${usedTopics.length}, questions ${bankQuestions.length} (essentiel ${ess}, approfondi ${bankQuestions.length - ess}), log ${log.length} lignes`)
