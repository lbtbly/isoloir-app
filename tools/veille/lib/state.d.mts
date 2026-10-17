// Types de tools/veille/lib/state.mjs, pour les tests en TypeScript.

import type { Policy } from '../schemas.mjs'

export interface CandidateState {
  checkedAt: string
  rotationCursor: number
  lastRunId: string | null
  programmeSeen: string | null
}
export interface WatchEntry {
  key: string
  name: string
  party?: string | null
  reason: string
  detail?: string
  firstSeen: string
  lastSeen: string
  sources?: { url: string; title: string; publisher: string; date: string | null; primary: boolean }[]
}
export interface VeilleState {
  format: 'isoloir-veille-state/1'
  electionId: 'presidentielle-2027'
  candidates: Record<string, CandidateState>
  watch: WatchEntry[]
  refused: { key: string; name: string; decidedAt: string; note?: string }[]
  expected: { id: string; label: string; from: string | null; status: 'attendu' | 'publié'; url: string | null }[]
  lastRuns: Record<string, { runId: string; at: string; dataVersion?: string | null }>
}
export interface PendingItem {
  id: string
  kind: string
  branch: string | null
  worktree?: string | null
  createdAt: string
  runId: string
  baseCommit?: string | null
  summary: string
  approveWith: string
  status: 'attente' | 'accordé' | 'refusé' | 'caduc'
  remindedAt?: string[]
  decidedAt?: string | null
  details?: Record<string, unknown>
  note?: string
}
export interface BankLike {
  bank?: { questions: readonly BankQuestion[] }
  questions?: readonly BankQuestion[]
  positions?: Record<string, Record<string, unknown>>
}
export interface BankQuestion {
  id: string
  tier?: string
  approaches: readonly { id: string }[]
}

export function mergePolicy(file?: Record<string, unknown>): Policy
export function loadPolicy(root: string): Policy
export function loadLocks(root: string): { format: string; locks: { candidateId: string; questionId?: string; approachId?: string; reason: string; since: string; until?: string | null }[] }
export function activeLocks<T extends { since: string; until?: string | null }>(locks: { locks?: readonly T[] } | null | undefined, today: string): T[]

export const EXPECTED_SEED: readonly VeilleState['expected'][number][]
export function seedState(visibleIds: readonly string[], opts?: { checkedAt?: string; exceptions?: Record<string, string> }): VeilleState
export function loadState(root: string): VeilleState
export function saveState(root: string, state: VeilleState): void
export function advanceCheckedAt(state: VeilleState, ids: readonly string[], today: string, runId: string | null): VeilleState
export function stanceOf(p: unknown): number
export function isKnownOn(table: Record<string, unknown> | undefined, question: BankQuestion): boolean
export function unknownQuestions(bank: BankLike, candidateId: string): BankQuestion[]
export function rotationFor(state: Pick<VeilleState, 'candidates'> | null | undefined, bank: BankLike | null, candidateId: string, policy?: { rotation?: { unknownDeepPerCandidate?: number } }): { questions: string[]; nextCursor: number }
export function advanceRotation(state: VeilleState, used?: Record<string, number>): VeilleState
export function mergeWatchEntries(existing?: readonly WatchEntry[], incoming?: readonly WatchEntry[]): WatchEntry[]
export function mergeWatch(state: VeilleState, entries?: readonly WatchEntry[]): VeilleState
export function mergeRefused(state: VeilleState, pendingItems?: readonly PendingItem[]): VeilleState

export const PENDING_KINDS: Readonly<Record<string, string>>
export function pendingKindOf(id: string): string | null
export function readPendingFile(localDir: string): { format: 'isoloir-veille-pending/1'; items: PendingItem[] }
export function normalizePendingItem(raw: unknown, defaults?: Partial<PendingItem>): PendingItem
export function addPending(localDir: string, raw: unknown, defaults?: Partial<PendingItem>): { added: boolean; item: PendingItem; existing: boolean }
export function listPending(localDir: string, opts?: { status?: string }): PendingItem[]
export function resolvePending(localDir: string, id: string, status: 'accordé' | 'refusé' | 'caduc', opts?: { note?: string | null; now?: Date }): PendingItem
export function dueReminders(items: readonly PendingItem[], now?: Date, policy?: { reminderHours?: number }): PendingItem[]
export function remindPending(localDir: string, opts?: { now?: Date; policy?: { reminderHours?: number }; dryRun?: boolean }): PendingItem[]

export function redactHidden(text: string, hidden?: readonly { id: string; name: string }[]): string
export function renderReport(input: Record<string, unknown> & { runId?: string }): string
