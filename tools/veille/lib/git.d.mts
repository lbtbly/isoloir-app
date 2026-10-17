// Types de tools/veille/lib/git.mjs, pour les tests en TypeScript.

import type { RunResult } from './common.mjs'

export type Tier = 'auto' | 'accord'
export const TIERS: readonly Tier[]
export const TIER_PATHS: Readonly<Record<Tier, readonly string[]>>
export const CONTROL_PATHS: readonly string[]

export interface StatusEntry {
  xy: string
  path: string
  orig?: string
}

export function pathAllowed(path: string, tier: Tier): boolean
export function parsePorcelainZ(text: string): StatusEntry[]
export function touchedPaths(entries: readonly StatusEntry[]): string[]
export function outsideTier(entriesOrPaths: readonly (StatusEntry | string)[], tier: Tier): string[]
export function branchError(branch: string | null, tier?: Tier): string | null
export function worktreeBranchError(name: string | null, branch: string | null): string | null
export interface AccordItem {
  id: string
  kind: 'candidat' | 'retrait' | 'hold' | 'redeclaration' | 'reintegration' | 'official' | 'fiche'
  subject: string
  date: string
}
export function accordItemOf(runId: string | null): AccordItem | null
export function accordItemErrors(runId: string, pendingItems?: readonly Record<string, unknown>[]): string[]
export function branchOfRun(branch: string | null, runBranch: string | null | undefined): boolean
export function withCoAuthor(message: string): string
export function mergeMessage(branch: string): string
export function assertSafePush(args: readonly string[]): string[]
export function pushArgs(sha: string): string[]
export function pushRejected(stderr: string): boolean
export function mergeErrors(m: { mergeTree: string | null; headTree: string; parents: readonly string[]; base: string; head: string }): string[]

export type Runner = (cmd: string, args: readonly string[], opts?: { cwd?: string; env?: Record<string, string>; input?: string }) => RunResult

export interface GitClient {
  cwd: string
  raw(args: readonly string[], opts?: { env?: Record<string, string>; input?: string }): RunResult
  out(args: readonly string[], opts?: { env?: Record<string, string>; input?: string }): string
  text(args: readonly string[], opts?: { env?: Record<string, string>; input?: string }): string
  sha(ref: string): string
  tree(ref: string): string
  isAncestor(a: string, b: string): boolean
  status(): StatusEntry[]
  diffNames(range: string): string[]
  stagedNames(): string[]
  numstat(range: string, path: string): { added: number; deleted: number; path: string }[]
  show(ref: string, path: string): string | null
  count(range: string): number
  parents(ref: string): string[]
  fetch(): string
}
export function makeGit(cwd: string, opts?: { runner?: Runner; env?: Record<string, string> }): GitClient
