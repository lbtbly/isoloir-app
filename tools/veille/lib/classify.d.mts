// Types de tools/veille/lib/classify.mjs, pour les tests en TypeScript.

export interface WatchSource {
  url: string
  title: string
  publisher: string
  date: string | null
  primary: boolean
}
export interface WatchEntryOut {
  key: string
  name: string
  party: string | null
  reason: string
  detail?: string
  firstSeen: string
  lastSeen: string
  sources: WatchSource[]
}
/** Une entrée « à surveiller » déjà connue (state.watch, watch.json local) */
export interface WatchEntryIn {
  key: string
  name: string
  party?: string | null
  reason: string
  detail?: string
  firstSeen: string
  lastSeen: string
  sources?: readonly WatchSource[]
}
export interface ClassifyOutput {
  qualifying: { ref: string; slug: string; name: string; party: string | null; reasons: string[]; sources: WatchSource[] }[]
  deferred: { ref: string; slug: string; reason: string }[]
  withdrawals: { ref: string; candidateId: string; sources: WatchSource[]; date: string | null }[]
  redeclarations: { ref: string; candidateId: string; date: string | null }[]
  conditions: { ref: string; candidateId: string; conditionChange: string | null; summary: string }[]
  official: { ref: string; type: string; detail: string; date: string | null }[]
  watch: WatchEntryOut[]
  unchanged: string[]
  stillDeclaredFalse: string[]
  watchNew: string[]
  log: string[]
}
export function slugOf(name: string, taken?: readonly string[]): string
export function thresholdOf(pne: unknown, office: unknown, policy?: { mepCountsAsNational?: boolean }): { met: boolean; via: string[]; mepOnly: boolean; unproved: string[] }
export function sourcesOf(event: unknown): { sources: WatchSource[]; publishers: number; primary: number; ok: boolean }
export function classifyWatch(
  result: unknown,
  ctx: {
    config: { candidates: readonly { id: string; name: string; party?: string; pendingPrimary?: boolean }[] }
    election: { hidden?: readonly string[] } | null
    state?: { watch?: readonly WatchEntryIn[]; refused?: readonly { key: string; name: string }[] }
    pending?: readonly { id: string; status: string; createdAt: string; details?: { name?: string } }[]
    localWatch?: readonly WatchEntryIn[]
    policy?: unknown
    today?: string
  },
): ClassifyOutput
