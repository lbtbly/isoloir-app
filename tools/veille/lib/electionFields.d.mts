// Types de tools/veille/lib/electionFields.mjs, pour les tests en TypeScript.

type Json = Record<string, any>

export const AI_SENTENCE: string
export function frenchSpacing(text: string): string
export function firstSentence(text: string): string
export function textProblems(text: string, o?: { hiddenRe?: RegExp | null; entry?: boolean }): string[]
export function nextDataVersion(current: string | null | undefined, today: string): string
export function deList(names: string[]): string
export function notesFirst(people: readonly { id: string; name: string; checkedAt: string }[]): string
export function affectsRanking(report: Json | null | undefined, newQuestion?: Json | null): boolean
export function changelogText(o: {
  report: Json | null
  questions: readonly Json[]
  topics?: readonly { id: string; label: string }[]
  nameOf: (id: string) => string
  newQuestion?: { id: string; prompt: string; topicId: string } | null
  constantsPatched?: string[]
  today: string
}): string
export function kindOfRun(runId: string): string
export function changelogComment(o: { runId: string; report: Json | null; today: string }): string
export function tsString(s: string): string
export function tsUnquote(lit: string): string
export function parseChangelog(text: string): { insertAt: number; entries: { date: string; start: number; end: number; auto: boolean }[] }
export function patchElection(text: string, o: {
  dataVersion?: string | null
  dataFrozenAt: string
  frozenComment: string
  note0: string
  entry?: { date: string; comment: string; text: string } | null
  afterOwner?: boolean
}): { text: string; index: number | null }
export function patchContextDate(text: string, today: string): string
