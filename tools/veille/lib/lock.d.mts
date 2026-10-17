// Types de tools/veille/lib/lock.mjs, pour les tests en TypeScript.

export interface LockEntry {
  path: string
  runId: string
}
export interface Lock {
  runId: string | null
  kind: string | null
  worktrees: LockEntry[]
  startedAt: string | null
  heartbeatAt: string | null
  phase: string
  pid?: number
  takenOverFrom?: string | null
  unreadable?: boolean
}
export interface LockPolicy {
  lock?: { staleHeartbeatHours?: number; maxAgeHours?: number }
}

export function realPath(p: string): string
export function samePath(a: string | null | undefined, b: string | null | undefined): boolean
export function readLock(file: string): Lock | null
export function staleness(lock: Lock | null, now: Date, policy?: LockPolicy): string | null
export function lockEntryOf(lock: Lock | null, worktree: string): LockEntry | null
export function inspectLock(file: string, opts?: { now?: Date; policy?: LockPolicy; worktree?: string }): { lock: Lock | null; stale: string | null; entry: LockEntry | null; primary: boolean; free: boolean }
export function acquireLock(
  file: string,
  opts: { runId: string; kind: string; worktree: string; now?: Date; policy?: LockPolicy; parent?: string | null; phase?: string; pid?: number },
): { lock: Lock; takenOverFrom: string | null; staleReason: string | null; reentered: boolean; joined: boolean }
export function heartbeatLock(file: string, opts?: { worktree?: string; now?: Date; phase?: string }): Lock
export function releaseLock(file: string, opts?: { worktree?: string }): { released: 'tout' | 'ligne' | false; lock: Lock | null }

export interface WorktreeInfo {
  path: string
  head: string | null
  branch: string | null
  detached: boolean
  locked: boolean
  prunable: boolean
  bare: boolean
}
export function parseWorktreeList(text: string): WorktreeInfo[]
export function planCleanup(input: {
  worktrees?: readonly WorktreeInfo[]
  mainRoot: string
  current?: string | null
  lock?: Lock | null
  pending?: readonly { id: string; status: string; worktree?: string | null; branch?: string | null; runId?: string }[]
  runs?: readonly { status?: string; worktree?: string; startedAt?: string }[]
  today?: string
  days?: number
}): {
  remove: { path: string; runId: string; branch: string | null; ageDays: number }[]
  keep: { path: string; runId: string; reason: string }[]
}
