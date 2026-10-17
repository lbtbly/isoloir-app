// Types de tools/veille/lib/persist.mjs, pour les tests en TypeScript.

export function normalizeWfId(id: string): string
export function findWorkflowFiles(projectsDir: string, wfRunId: string): { results: string[]; journals: string[] }
export function stageOf(kind: string, result?: { mode?: string } | null): string
export function tokensByCandidate(wf: unknown, candidateIds?: readonly string[]): Record<string, number>
export function workflowFailure(wf: unknown): string | null

export interface Changeset {
  format: 'isoloir-veille-changeset/1'
  runId: string
  electionId: 'presidentielle-2027'
  baseCommit: string
  today: string
  since: Record<string, string>
  results: unknown[]
  holds: string[]
  approve: string[]
  only?: string[]
  wfRunIds: string[]
}
export function addToChangeset(
  existing: Changeset | null,
  input: { runId: string; baseCommit: string; today: string; sinceMap?: Record<string, string>; result: { candidates?: { candidateId: string; since: string }[] }; wfRunId: string },
): { changeset: Changeset; added: boolean }

export interface RecoveredAgent {
  key: string
  agentId: string | null
  label: string | null
  phase: string | null
  result: unknown
}
export function recoverFromJournal(text: string): { agents: RecoveredAgent[]; started: number; finished: number; missing: string[]; badLines: number }

export function researchFileWanted(name: string, candidate?: string | null): boolean
export function planResearchCopy(
  files: readonly { name: string; text: string }[],
  existing: (name: string) => string | null,
): { write: { name: string; text: string }[]; same: string[]; conflicts: string[] }
export function checkAddCandidate(wf: unknown, expected?: string | null): { ok: boolean; reason: string | null; partial: boolean; id: string | null }
export function firstFreeNumber(names: readonly string[], prefix?: string, start?: number): number

export function indexAssetOf(html: string): string | null
export interface ProdCheckResult {
  code: 0 | 41
  known: boolean
  expected: string | null
  served: string | null
  attempts: number
  url: string | null
  reason: string | null
  note: string | null
  outside?: boolean
}
export function prodCheck(input: {
  lastShip: { indexAsset: string; sha: string; deployed?: boolean; checked?: boolean } | null
  fetchText: (url: string) => Promise<string>
  prodUrl: string
  now?: Date
  attempts?: number
  delayMs?: number
  sleep?: (ms: number) => Promise<void>
  mainInfo?: { head: string; isAncestor: (sha: string) => boolean | null } | null
}): Promise<ProdCheckResult>
export function readTextOrNull(file: string): string | null
