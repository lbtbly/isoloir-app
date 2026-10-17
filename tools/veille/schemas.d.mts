// Types de tools/veille/schemas.mjs, pour les tests en TypeScript. Les schémas sont des objets JSON Schema (sous-ensemble
// décrit en tête de schemas.mjs) ; validate() rend la liste des erreurs, vide si la valeur est conforme.

export type Schema = Record<string, unknown>

export const CANDIDATE_ID: string
export const QUESTION_ID: string
export const APPROACH_ID: string
export const APPROACH_PLACEHOLDER: string
export const SOURCE_DATE: string
export const RUN_ID: string
export const HOLD_ID: string
export const PENDING_ID: string

export const POSITION_PUBLISHED: Schema
export const POSITION_NEW: Schema
export const POLICY: Schema
export const STATE: Schema
export const LOCKS: Schema
export const LEDGER: Schema
export const WATCH_EVENT: Schema
export const WATCH_RESULT: Schema
export const CHANGE: Schema
export const REFRESH_RESULT: Schema
export const CHANGESET: Schema
export const APPLY_REPORT: Schema
export const PENDING_ITEM: Schema
export const PENDING_FILE: Schema
export const LOCK: Schema
export const RUN: Schema
export const SPEND_LINE: Schema
export const LAST_SHIP: Schema
export const BUILD_CONFIG: Schema
export const CLASSIFY_RESULT: Schema
export const AUDIT_JSON: Schema
export const EXIT_PAYLOAD: Schema

export const CHANGE_CLASSES: readonly ('forme' | 'secondaire' | 'principale' | 'renversement' | 'nouvelle-approche')[]
export const HOLD_REASONS: readonly string[]
export const DROP_REASONS: readonly string[]

export const SCHEMAS: Readonly<{
  POSITION_PUBLISHED: Schema
  POSITION_NEW: Schema
  POLICY: Schema
  STATE: Schema
  LOCKS: Schema
  LEDGER: Schema
  WATCH_EVENT: Schema
  WATCH_RESULT: Schema
  CHANGE: Schema
  REFRESH_RESULT: Schema
  CHANGESET: Schema
  APPLY_REPORT: Schema
  PENDING_ITEM: Schema
  PENDING_FILE: Schema
  LOCK: Schema
  RUN: Schema
  SPEND_LINE: Schema
  LAST_SHIP: Schema
  BUILD_CONFIG: Schema
  CLASSIFY_RESULT: Schema
  AUDIT_JSON: Schema
  EXIT_PAYLOAD: Schema
}>

export interface Policy {
  format: 'isoloir-veille-policy/1'
  electionId: 'presidentielle-2027'
  paused: boolean
  pausedReason: string | null
  softFreezeHours: number
  hebdoHorizonHours: number
  endAt: string
  freezeFrom: 'election.freezeWindows'
  extraFreezeWindows: readonly { start: string; end: string; reason?: string }[]
  reportOnlyBetweenRounds: boolean
  budgets: {
    dailyTokens: number
    dailyWithPrepTokens: number
    weeklyTokens: number
    monthlyTokens: number
    monthlySoftShare: number
    usageStopPercent: number
  }
  caps: {
    changesPerRun: number
    changesPerCandidate: number
    newApproachesPerRun: number
    approachCooldownDays: number
    newQuestionsPerRun: number
    bankMax: number
    prepsPerDay: number
    prepsPerWeek: number
    programmePassesPerWeek: number
    verifyPacket: number
  }
  rotation: { unknownDeepPerCandidate: number; overlapDays: number; watchLookbackDays: number }
  holdReversals: boolean
  mepCountsAsNational: boolean
  newQuestion: {
    minCandidates: number
    minCandidateBlocs: number
    minKnown: number
    minBlocs: number
    maxMainShare: number
    approachesMin: number
    approachesMax: number
    tier: 'approfondi'
  }
  lock: { staleHeartbeatHours: number; maxAgeHours: number }
  retries: { moved: number; data: number }
  minSearches: { watch: number; triage: number }
  holdExpiryDays: number
  reminderHours: number
  cleanupDays: number
  remeasure: { profiles: number; noisy: number }
  ship: {
    port: number
    accordPort: number
    prodUrl: string
    vercelProject: string
    vercelScope: string
    checkAttempts: number
    checkDelaySeconds: number
  }
}
export const DEFAULT_POLICY: Readonly<Policy>

export function validate(schema: Schema, value: unknown, path?: string): string[]
export function assertValid<T>(schema: Schema, value: T, what?: string): T
export function checkChange(change: unknown, path?: string): string[]
