// Budget de la veille automatique (contrat : tools/veille/CONTRACT.md §c.1 budgets, §c.10 SPEND_LINE, §d.3 budget) :
// la dépense locale en jetons (<dépôt principal>/.claude/veille/spend.jsonl, une ligne SPEND_LINE par workflow, écrite
// par persist.mjs avec le totalTokens du fichier de workflow, ou par run.mjs budget --tokens), comptée par jour, par
// semaine (lundi-dimanche) et par mois, à Paris ; l'usage du forfait tel que l'outil get_usage le donne ; et la
// décision : l'étape suivante passe, ou sort en 22.
//
// Règles :
//   jour      policy.budgets.dailyTokens (800 000), ou dailyWithPrepTokens (3 000 000) le jour où une préparation de
//             candidat a commencé. Il compte les exécutions autres qu'hebdomadaires (quotidien, candidat, retrait,
//             accord) et ne s'applique pas à une exécution hebdo, qui dépense en un jour ce que la semaine lui donne
//             (interprétation : sinon la première étape du lundi dépasserait déjà 800 000).
//   semaine   weeklyTokens (12 000 000), toutes exécutions ; mois : monthlyTokens (45 000 000), toutes exécutions.
//   refus     dépense + estimation de l'étape > limite → 22. Usage du forfait ≥ usageStopPercent (85) sur l'une des
//             fenêtres lues → 22.
//   souple    dépense du mois ≥ monthlySoftShare (0,8) × monthlyTokens → avis « ranked-only » : l'exécution
//             hebdomadaire ne cible plus que les candidats classés, et le rapport le dit (pas un refus).
//   programme --stage refresh:programme sans --tokens : 22 si la semaine compte déjà caps.programmePassesPerWeek (2)
//             lignes de cette étape.
//
// Usage du forfait (parseUsage), tolérant à la forme, champs lus :
//   - forme plate, que la session peut recopier : { weeklyPercent, fiveHourPercent, monthlyPercent } (nombres, ou
//     chaînes « 36 % ») ;
//   - sortie brute de get_usage : { plan: { status, windows: [{ label, percentUsed }], extraUsage: { enabled,
//     percentUsed } } } (ou { windows } seul). Une fenêtre dont le libellé contient « 5-hour » / « 5 h » / « five »
//     donne fiveHourPercent ; « week » / « hebdo » / « semaine » (lu en premier) donne weeklyPercent (la plus haute
//     des fenêtres hebdomadaires, toutes et par modèle) ; « month » / « mois » donne monthlyPercent. L'usage supplémentaire
//     (extraUsage) ne compte que s'il est activé (enabled: true), comme monthlyPercent. Pourcentage lu dans
//     percentUsed, percent, percentage, usedPercent, used_percent, ou utilization (0-1, ×100).
//   - plan.status autre que « ok » (« unavailable », « not_applicable ») : aucun pourcentage, une note, pas de refus.
//
// Usage :
//   import { checkBudget, parseUsage, spentTotals } from './lib/budget.mjs'

import { existsSync, readFileSync } from 'node:fs'
import { EXIT, isoInParis, todayInParis, weekStart } from './common.mjs'

/** Estimation par défaut de l'étape de départ (run start), par kind ; policy.budgets.startEstimates la remplace */
export const START_ESTIMATES = Object.freeze({ quotidien: 400000, hebdo: 1000000, candidat: 2500000, retrait: 500000, accord: 200000 })
/** Kinds dont la dépense ne compte pas dans le budget du jour */
export const DAY_EXEMPT_KINDS = Object.freeze(['hebdo'])

const fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n)).replace(/ /g, ' ')

/** Lignes de spend.jsonl ; une ligne illisible est sautée (comptée dans skipped) */
export function readSpend(file) {
  if (!existsSync(file)) return { lines: [], skipped: 0 }
  const lines = []
  let skipped = 0
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    if (!raw.trim()) continue
    try {
      const l = JSON.parse(raw)
      if (l && typeof l === 'object' && Number.isFinite(Number(l.tokens)) && l.at) lines.push(l)
      else skipped++
    } catch {
      skipped++
    }
  }
  return { lines, skipped }
}

/** Une ligne SPEND_LINE */
export function spendLine({ now = new Date(), runId, kind, stage, wfRunId = null, tokens, byCandidate = null }) {
  const line = { at: isoInParis(now), runId, kind, stage, wfRunId, tokens: Math.max(0, Math.round(Number(tokens) || 0)) }
  if (byCandidate && Object.keys(byCandidate).length) line.byCandidate = byCandidate
  return line
}

/** Dépense du jour (sans les kinds exemptés), de la semaine et du mois de today, à Paris ; plus le jour toutes exécutions */
export function spentTotals(lines, today) {
  const week = weekStart(today)
  const month = today.slice(0, 7)
  const out = { day: 0, dayAll: 0, week: 0, month: 0 }
  for (const l of lines) {
    const t = Number(l.tokens) || 0
    const d = todayInParis(new Date(l.at))
    if (d === today) {
      out.dayAll += t
      if (!DAY_EXEMPT_KINDS.includes(l.kind)) out.day += t
    }
    if (weekStart(d) === week) out.week += t
    if (d.slice(0, 7) === month) out.month += t
  }
  return out
}

/** Une préparation de candidat a-t-elle commencé ce jour-là ? (kind courant, ou une ligne « candidat » du jour) */
export const prepStartedOn = (lines, today, kind = null) => kind === 'candidat' || lines.some(l => l.kind === 'candidat' && todayInParis(new Date(l.at)) === today)

/** Limites du jour, de la semaine et du mois */
export function limitsFor(policy = {}, { prepToday = false } = {}) {
  const b = policy.budgets ?? {}
  return {
    day: prepToday ? b.dailyWithPrepTokens ?? 3000000 : b.dailyTokens ?? 800000,
    week: b.weeklyTokens ?? 12000000,
    month: b.monthlyTokens ?? 45000000,
  }
}

const num = v => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const m = /-?\d+(?:[.,]\d+)?/.exec(v)
    if (m) return Number(m[0].replace(',', '.'))
  }
  return null
}
function percentOf(o) {
  if (o == null) return null
  if (typeof o !== 'object') return num(o)
  for (const k of ['percentUsed', 'percent', 'percentage', 'usedPercent', 'used_percent']) {
    const v = num(o[k])
    if (v != null) return v
  }
  const u = num(o.utilization)
  if (u != null) return u <= 1 ? u * 100 : u
  return null
}
const maxOf = (a, b) => (a == null ? b : b == null ? a : Math.max(a, b))

/**
 * Pourcentages d'usage du forfait, tirés de ce que la session passe (texte JSON ou objet ; voir l'en-tête).
 * Rend { weeklyPercent, fiveHourPercent, monthlyPercent, status, read: [« fenêtre : n % »], note }. Lève une Error
 * si le texte n'est pas du JSON.
 */
export function parseUsage(raw) {
  const out = { weeklyPercent: null, fiveHourPercent: null, monthlyPercent: null, status: 'ok', read: [], note: null }
  if (raw == null || raw === '') return { ...out, status: 'absent' }
  const v = typeof raw === 'string' ? JSON.parse(raw) : raw
  if (!v || typeof v !== 'object') return { ...out, status: 'illisible', note: 'usage illisible : objet attendu' }
  for (const [k, key] of [['weeklyPercent', 'weeklyPercent'], ['fiveHourPercent', 'fiveHourPercent'], ['monthlyPercent', 'monthlyPercent']]) {
    const n = num(v[key])
    if (n != null) {
      out[k] = n
      out.read.push(`${key} : ${n} %`)
    }
  }
  const plan = v.plan && typeof v.plan === 'object' ? v.plan : v.windows ? v : null
  if (plan) {
    if (plan.status && plan.status !== 'ok') {
      out.status = String(plan.status)
      out.note = `usage du forfait indisponible (${plan.status}${plan.note ? ` : ${plan.note}` : ''}) : seule la dépense locale compte`
    }
    for (const w of Array.isArray(plan.windows) ? plan.windows : []) {
      const p = percentOf(w)
      const label = String(w?.label ?? w?.name ?? '')
      if (p == null) continue
      // Les fenêtres hebdomadaires d'abord : un nom de modèle (« Weekly · Opus 5 … ») ne doit pas passer pour la fenêtre de 5 h
      if (/week|hebdo|semaine/i.test(label)) out.weeklyPercent = maxOf(out.weeklyPercent, p)
      else if (/5[\s-]*h|five|cinq/i.test(label)) out.fiveHourPercent = maxOf(out.fiveHourPercent, p)
      else if (/month|mois/i.test(label)) out.monthlyPercent = maxOf(out.monthlyPercent, p)
      else continue
      out.read.push(`${label} : ${p} %`)
    }
    const extra = plan.extraUsage ?? plan.extra_usage
    if (extra && typeof extra === 'object' && extra.enabled === true) {
      const p = percentOf(extra)
      if (p != null) {
        out.monthlyPercent = maxOf(out.monthlyPercent, p)
        out.read.push(`usage supplémentaire : ${p} %`)
      }
    }
  }
  return out
}

/**
 * Décision du budget pour l'étape suivante. Entrées : lines (spend.jsonl), today, kind (kind de l'exécution), estimate
 * (jetons prévus pour l'étape), usage (parseUsage), policy, stage (« refresh:programme » vérifie le plafond des
 * passages), recording (une ligne vient d'être ajoutée : pas de contrôle du plafond des passages).
 * Rend { code: 0 | 22, reason, spent, limits, estimate, softMonthly, advice, note, usage, programmePasses }.
 */
export function checkBudget({ lines = [], today, kind = null, estimate = 0, usage = null, policy = {}, stage = null, recording = false }) {
  const prepToday = prepStartedOn(lines, today, kind)
  const spent = spentTotals(lines, today)
  const limits = limitsFor(policy, { prepToday })
  const est = Math.max(0, Number(estimate) || 0)
  const b = policy.budgets ?? {}
  const share = b.monthlySoftShare ?? 0.8
  const softMonthly = spent.month >= share * limits.month
  const week = weekStart(today)
  const programmePasses = lines.filter(l => l.stage === 'refresh:programme' && weekStart(todayInParis(new Date(l.at))) === week).length
  const notes = []
  if (softMonthly) notes.push(`mois à ${fmt(spent.month)} jetons sur ${fmt(limits.month)} (au-delà de ${Math.round(share * 100)} %) : candidats classés seulement`)
  if (prepToday) notes.push('jour de préparation : limite du jour portée à dailyWithPrepTokens')
  if (usage?.note) notes.push(usage.note)
  const base = {
    code: EXIT.OK,
    reason: null,
    spent,
    limits,
    estimate: est,
    prepToday,
    softMonthly,
    advice: softMonthly ? 'ranked-only' : null,
    note: notes.join(' ; ') || null,
    usage: usage ? { weeklyPercent: usage.weeklyPercent, fiveHourPercent: usage.fiveHourPercent, monthlyPercent: usage.monthlyPercent, status: usage.status, read: usage.read } : null,
    programmePasses,
  }
  const refuse = reason => ({ ...base, code: EXIT.BUDGET, reason })
  const stop = b.usageStopPercent ?? 85
  if (usage) {
    for (const [k, label] of [['weeklyPercent', 'hebdomadaire'], ['fiveHourPercent', 'sur 5 h'], ['monthlyPercent', 'mensuel (usage supplémentaire)']]) {
      if (usage[k] != null && usage[k] >= stop) return refuse(`usage ${label} du forfait à ${usage[k]} % (arrêt à ${stop} %)`)
    }
  }
  if (stage === 'refresh:programme' && !recording) {
    const cap = policy.caps?.programmePassesPerWeek ?? 2
    if (programmePasses >= cap) return refuse(`déjà ${programmePasses} passage(s) « programme » cette semaine (plafond ${cap})`)
  }
  if (!DAY_EXEMPT_KINDS.includes(kind) && spent.day + est > limits.day) {
    return refuse(`jour : ${fmt(spent.day)} dépensés + ${fmt(est)} prévus > ${fmt(limits.day)}`)
  }
  if (spent.week + est > limits.week) return refuse(`semaine du ${week} : ${fmt(spent.week)} dépensés + ${fmt(est)} prévus > ${fmt(limits.week)}`)
  if (spent.month + est > limits.month) return refuse(`mois ${today.slice(0, 7)} : ${fmt(spent.month)} dépensés + ${fmt(est)} prévus > ${fmt(limits.month)}`)
  return base
}

/** Estimation de départ d'un kind (policy.budgets.startEstimates, sinon START_ESTIMATES) */
export const startEstimate = (kind, policy = {}) => Number(policy.budgets?.startEstimates?.[kind] ?? START_ESTIMATES[kind] ?? 0)
