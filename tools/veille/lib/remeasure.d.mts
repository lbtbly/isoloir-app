// Types de tools/veille/lib/remeasure.mjs, pour les tests en TypeScript.

type Json = Record<string, any>

export interface AuditBounds {
  profiles: number
  minShare: number
  maxShare: number
}
export interface Shares {
  compatibleShare: number[]
  deduced: number[]
  style: number[]
  styleQuick: number[]
  panel: string[][]
}
export interface IndexRule {
  constant: string
  ok: boolean
  indices: number[]
  expected: number[]
}

export function auditBounds(audit: Json): AuditBounds
export function readAuditLine(text: string): AuditBounds
export function patchAuditLine(text: string, bounds: AuditBounds): string
export function failedHardChecks(audit: Json): Json[]
export function namedCandidates(checks: readonly Json[], cards: readonly { id: string; initials: string | null }[]): string[]
export function exactShares(site: {
  pack: any
  panelOf: (pack: any) => string[][]
  effectiveWeight: (p: any) => number
  dealbreakerLevel: (p: any) => unknown
  profilesFor: (pack: any) => any
  isQuick: (q: any) => boolean
  mannerClones: number
}): Shares
export function indexRules(shares: Pick<Shares, 'compatibleShare' | 'deduced' | 'style' | 'styleQuick'>): IndexRule[]
export function patchExactConstants(text: string, shares: Pick<Shares, 'compatibleShare' | 'deduced' | 'style' | 'styleQuick'>, published: { WEIGH: Json; CROSS: Json; MANNER: Json }): { text: string; patched: string[] }
export const CALIBRATION_TOLERANCE: Readonly<Record<string, number>>
export function calibrationDrift(measured: Json, published: Json): { key: string; published: number; measured: number; tolerance: number; over: boolean }[]
export function gapDrift(audits: Json, published: { PUBLISHED: Json; CROSS: Json; WEIGH: Json; MANNER: Json }): { key: string; published: number; measured: number; widened: boolean }[]
export function currentVerdicts(audits: Json): Record<string, string>
export function verdictDrift(current: Record<string, string>, baseline: Record<string, string> | null | undefined): { key: string; baseline: string; now: string }[]
