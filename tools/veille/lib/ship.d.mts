// Types de tools/veille/lib/ship.mjs, pour les tests en TypeScript.

import type { RunResult } from './common.mjs'

export const DATA_TEST_FILES: readonly string[]
export const FORBIDDEN_PORTS: readonly number[]
export const FALLBACK_PORTS: readonly number[]
export const HISTORY_CAUSES: readonly string[]
export const ELECTION_KEYS: Readonly<{ auto: readonly string[]; accord: readonly string[] }>
export const DECISIONS_SECTIONS_AUTO: readonly string[]
export const PRIMARY_DIFF: readonly string[]

export type Policy = Record<string, unknown> & { ship: { prodUrl: string; vercelProject: string; vercelScope: string; checkAttempts: number; checkDelaySeconds: number; port: number; accordPort: number } }
export function mergePolicy(fileValue?: Record<string, unknown>): Policy
export function loadPolicy(root: string): Policy
export function applyFakeBin(env?: Record<string, string | undefined>): string | null

export function lastJsonLine(stdout: string): Record<string, unknown> | null

export interface Failure {
  code: number
  reason: string
  bundles?: string[]
  failedTests?: string[]
}
export function mapVeilleScript(r: RunResult, label: string): Failure | null
export function testFileId(name: string): string
export function vitestFailedFiles(report: unknown): string[]
export function failedFilesFromText(text: string): string[]
export function classifyVitest(r: { code: number; report?: unknown; stdout?: string; stderr?: string }): Failure | null

export interface CheckStep {
  id: 'build' | 'check-log' | 'history' | 'primary' | 'audit-pack' | 'tsc' | 'eslint' | 'vitest' | 'pnpm-build' | 'e2e'
  label: string
  cmd: string
  args: string[]
  map(r: RunResult & { report?: unknown }): Failure | null
}
export function checkPlan(o: { node?: string; port: number; vitestReport: string }): CheckStep[]

export function indexAssetOf(html: string): string | null
export function referencedAssets(html: string): string[]

export function electionDiffErrors(base: unknown, head: unknown, tier?: 'auto' | 'accord'): string[]
export function configDiffErrors(base: unknown, head: unknown, tier?: 'auto' | 'accord'): string[]
export function multisetDiff<T>(base?: readonly T[], head?: readonly T[]): { added: T[]; removed: T[] }
export function decisionEntryErrors(e: unknown): string[]
export function decisionsErrors(base: unknown, head: unknown, opts?: { tier?: 'auto' | 'accord'; baseBank?: unknown }): string[]
export function bankApproachErrors(bank: unknown): string[]
export function explainersErrors(base: unknown, head: unknown, file?: string): string[]
export function preservesBase(base: unknown, head: unknown, path?: string): string[]

export function methodCopyDiffErrors(baseText: string | null, headText: string | null): string[]
export function buildIncludeErrors(base: unknown, head: unknown): string[]
export function accordDiffErrors(o: {
  item: { id: string; kind: string; subject: string } | null
  base?: { config?: unknown; election?: unknown; indexText?: string | null }
  head?: { config?: unknown; election?: unknown; indexText?: string | null }
  media?: readonly { status: string; path: string }[]
}): string[]

export function deployArgs(policy: Policy): string[]
export function deployCommandText(root: string, policy: Policy): string
export function deployUrlOf(stdout: string): string | null
export function sleep(ms: number): Promise<void>

export interface ProdTry {
  attempt: number
  served: string | null
  missing: string[]
}
export function prodCheck(o: {
  runner: (cmd: string, args: readonly string[], opts?: { cwd?: string }) => { code: number; stdout: string }
  cwd?: string
  prodUrl: string
  indexAsset: string
  assets?: readonly string[]
  attempts?: number
  delayMs?: number
  wait?: (ms: number) => Promise<void>
  stamp?: () => number
}): Promise<{ ok: boolean; tries: ProdTry[] }>

export interface LastShip {
  sha: string
  tree: string
  dataVersion: string
  indexAsset: string
  at: string
  runId: string
  deployed: boolean
  checked: boolean
  deployUrl: string | null
  distIndexSha1: string | null
  branch: string | null
}
export function lastShipRecord(o: Partial<LastShip> & { sha: string; tree: string; indexAsset: string; at: string; runId: string }): LastShip
export function pauseText(o: { at: string; runId: string; sha: string; indexAsset: string; tries?: readonly ProdTry[]; root: string; policy: Policy; pauseFile: string }): string

export function portIsFree(port: number): Promise<boolean>
export function pickPort(preferred: number, opts?: { isFree?: (port: number) => Promise<boolean> }): Promise<number | null>
