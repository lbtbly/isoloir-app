// Types de tools/veille/lib/time.mjs, pour les tests en TypeScript.

export interface Span {
  start: string
  end: string
}
export interface FreezeSpanOut extends Span {
  origin?: 'élection' | 'politique'
  reason?: string
}
export interface GatePolicy {
  endAt?: string
  softFreezeHours?: number
  hebdoHorizonHours?: number
  reportOnlyBetweenRounds?: boolean
  extraFreezeWindows?: readonly { start: string; end: string; reason?: string }[]
}
export type GateStep = 'start' | 'push' | 'deploy'
export interface GateResult {
  code: 0 | 11 | 12 | 13
  reason: string | null
  step: GateStep
  kind: string | null
  now: string
  until: string
  hours: number
  mode: 'publication' | 'rapport'
  freeze: FreezeSpanOut | null
  softFreeze: Span | null
  betweenRounds: Span | null
  nextFreeze: FreezeSpanOut | null
  endAt: string
}

export const GATE_STEPS: readonly GateStep[]
export function allFreezeSpans(electionSpans?: readonly Span[], policy?: GatePolicy): FreezeSpanOut[]
export function softFreezeSpans(spans: readonly Span[], hours: number): (Span & { before: Span })[]
export function betweenRoundsSpan(electionSpans?: readonly Span[]): Span | null
export function gateTime(input: { step: GateStep; now: Date; hours?: number; kind?: string | null; electionSpans?: readonly Span[]; policy?: GatePolicy }): GateResult
export function startHorizon(kind: string | null | undefined, policy?: GatePolicy): number
export function loadElectionFreezeSpans(root: string): Promise<{ election: unknown; spans: Span[] }>
