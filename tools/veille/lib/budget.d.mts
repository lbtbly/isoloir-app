// Types de tools/veille/lib/budget.mjs, pour les tests en TypeScript.

export interface SpendLine {
  at: string
  runId: string
  kind: string
  stage: string
  wfRunId: string | null
  tokens: number
  byCandidate?: Record<string, number>
}
export interface Usage {
  weeklyPercent: number | null
  fiveHourPercent: number | null
  monthlyPercent: number | null
  status: string
  read: string[]
  note: string | null
}
export interface Totals {
  day: number
  dayAll: number
  week: number
  month: number
}
export interface Limits {
  day: number
  week: number
  month: number
}
export interface BudgetPolicy {
  budgets?: Partial<{
    dailyTokens: number
    dailyWithPrepTokens: number
    weeklyTokens: number
    monthlyTokens: number
    monthlySoftShare: number
    usageStopPercent: number
    startEstimates: Record<string, number>
  }>
  caps?: Partial<{ programmePassesPerWeek: number }>
}
export interface BudgetDecision {
  code: 0 | 22
  reason: string | null
  spent: Totals
  limits: Limits
  estimate: number
  prepToday: boolean
  softMonthly: boolean
  advice: 'ranked-only' | null
  note: string | null
  usage: Pick<Usage, 'weeklyPercent' | 'fiveHourPercent' | 'monthlyPercent' | 'status' | 'read'> | null
  programmePasses: number
}

export const START_ESTIMATES: Readonly<Record<'quotidien' | 'hebdo' | 'candidat' | 'retrait' | 'accord', number>>
export const DAY_EXEMPT_KINDS: readonly string[]
export function readSpend(file: string): { lines: SpendLine[]; skipped: number }
export function spendLine(input: { now?: Date; runId: string; kind: string; stage: string; wfRunId?: string | null; tokens: number; byCandidate?: Record<string, number> | null }): SpendLine
export function spentTotals(lines: readonly SpendLine[], today: string): Totals
export function prepStartedOn(lines: readonly SpendLine[], today: string, kind?: string | null): boolean
export function limitsFor(policy?: BudgetPolicy, opts?: { prepToday?: boolean }): Limits
export function parseUsage(raw: unknown): Usage
export function checkBudget(input: {
  lines?: readonly SpendLine[]
  today: string
  kind?: string | null
  estimate?: number
  usage?: Usage | null
  policy?: BudgetPolicy
  stage?: string | null
  recording?: boolean
}): BudgetDecision
export function startEstimate(kind: string, policy?: BudgetPolicy): number
