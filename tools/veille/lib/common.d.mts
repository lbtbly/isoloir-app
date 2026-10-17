// Types de tools/veille/lib/common.mjs, pour les tests en TypeScript.

export const ELECTION_ID: 'presidentielle-2027'
export const END_AT: string
export const USER_AGENT: 'IsoloirBot/1.0'
export const PROD_URL: string
export const CO_AUTHOR: string
export const MANDATORY_INCLUDE: readonly string[]

export const EXIT: Readonly<{
  OK: 0
  USAGE: 2
  MOVED: 10
  FROZEN: 11
  SOFT_FROZEN: 12
  ENDED: 13
  PAUSED: 20
  LOCKED: 21
  BUDGET: 22
  DATA: 30
  CODE: 31
  DEPLOY: 40
  PROD: 41
}>
export type ExitCode = (typeof EXIT)[keyof typeof EXIT]

export class VeilleError extends Error {
  constructor(code: ExitCode, reason: string, extra?: Record<string, unknown>)
  code: ExitCode
  extra: Record<string, unknown>
}
export function fail(code: ExitCode, reason: string, extra?: Record<string, unknown>): never

export function worktreeRoot(): string
export function rootFrom(opts?: { root?: string }): string
export function mainRoot(dir?: string): string | null
export function localStateDir(dir?: string): string
export function researchDir(root?: string): string
export function electionSrc(root?: string): string
export function veilleDir(root?: string): string
export function claudeProjectsDir(): string

export interface LocalPaths {
  dir: string
  lock: string
  stop: string
  pause: string
  spend: string
  pending: string
  watch: string
  lastShip: string
  runs: string
  run: (runId: string) => string
}
export interface VeillePaths {
  root: string
  research: string
  src: string
  config: string
  decisions: string
  bank: string
  build: string
  history: string
  audit: string
  election: string
  transfer: string
  transferFixture: string
  methodCopy: string
  veille: string
  policy: string
  locks: string
  state: string
  ledger: string
  d5Baseline: string
  reports: string
  report: (date: string, kind: string) => string
  committedRun: (runId: string) => string
  local: LocalPaths | null
}
export function paths(root?: string): VeillePaths

export interface RunResult {
  code: number
  stdout: string
  stderr: string
  signal: string | null
}
export function run(cmd: string, args?: readonly string[], opts?: { cwd?: string; env?: Record<string, string>; input?: string; timeoutMs?: number; tee?: boolean }): RunResult
export function runNode(script: string, args?: readonly string[], opts?: { cwd?: string; env?: Record<string, string>; input?: string; timeoutMs?: number; tee?: boolean }): RunResult
export function tail(text: string, n?: number): string

export const CONTROL_FILES: Readonly<{ policy: string; locks: string; d5Baseline: string }>
export const CONTROL_REF: 'origin/main'
export function readControlText(root: string, rel: string, opts?: { ref?: string }): { text: string | null; ref: string | null; from: 'git' | 'fichier' }
export function readControlJson<T = unknown>(root: string, rel: string, fallback: T, opts?: { ref?: string }): T
export function isTestOrigin(root: string): boolean
export function git(args: readonly string[], opts?: { cwd?: string; env?: Record<string, string> }): RunResult
export function gitOut(args: readonly string[], opts?: { cwd?: string }): string
export function isLinkedWorktree(dir?: string): boolean
export function currentBranch(dir?: string): string | null
export function assertNotMainFolder(root?: string): void
export function assertRunWorktree(root?: string): string
export function runIdOfWorktree(dir: string): string
export function currentRunId(root?: string): string | null

export function readJson<T = unknown>(file: string, fallback?: T): T
export function sortKeysDeep<T>(v: T): T
export function stableJson(value: unknown, opts?: { sortKeys?: boolean }): string
export function writeJson(file: string, value: unknown, opts?: { sortKeys?: boolean }): void
export function writeText(file: string, text: string): void
export function appendJsonl(file: string, value: unknown): void
export function readJsonl<T = unknown>(file: string): T[]

export function exit(code: ExitCode, payload?: Record<string, unknown>, opts?: { tag?: string; root?: string }): never
export function runMain(main: () => unknown): void

export interface ArgSpec {
  type: 'string' | 'number' | 'boolean' | 'list'
  default?: unknown
  required?: boolean
  choices?: readonly string[]
}
export function parseArgs(argv: readonly string[], spec?: Record<string, ArgSpec>): { _: string[] } & Record<string, unknown>

export function parseNow(value?: string): Date
export function todayInParis(now?: Date): string
export function isoInParis(now?: Date): string
export function addDays(day: string, n: number): string
export function daysBetween(a: string, b: string): number
export function weekStart(day: string): string
export function frenchDate(day: string): string

export function sha1(text: string): string
export function normalizeName(s: string): string
export function candidateSlug(name: string, taken?: readonly string[]): string
export function sourceKey(url: string): string
export function canonical(v: unknown): string

export interface CandidateRef {
  id: string
  name: string
  party: string | null
  declaredAt: string | null
  note?: string
}
export function loadElection(root?: string): Promise<import('../../../src/core/types').ElectionInfo>
export function splitCandidates(
  config: { candidates: readonly { id: string; name: string; party?: string; declaredAt?: string; note?: string; pendingPrimary?: boolean }[] },
  election: { hidden?: readonly string[] } | null | undefined,
): { visible: CandidateRef[]; hidden: CandidateRef[]; visibleIds: string[]; hiddenIds: string[] }
