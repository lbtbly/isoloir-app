// Types de tools/veille/lib/apply.mjs, pour les tests en TypeScript.

import type { Policy } from '../schemas.mjs'

type Json = Record<string, any>

export interface CandidateCard {
  id: string
  name: string | null
  initials: string | null
  nuance: string | null
}

export interface StateOps {
  advanceCheckedAt(state: Json, ids: string[], today: string, runId: string): Json
  rotationFor(state: Json, bank: Json, candidateId: string, policy: Json): { questions: string[]; nextCursor: number }
  advanceRotation(state: Json, used: Record<string, number>): Json
  mergeWatch(state: Json, entries: Json[]): Json
  mergeRefused(state: Json, pendingItems: Json[]): Json
}

export interface ApplyInput {
  changeset: Json
  bankJson: Json
  decisions: Json
  config: Json
  election: Json | null
  candidates?: CandidateCard[]
  history?: Json | null
  policy?: Json
  locks?: Json
  ledger?: Json | null
  state?: Json | null
  pending?: Json[]
  localWatch?: Json[]
  holds?: string[]
  approve?: string[]
  only?: string[]
  today: string
  now?: string | null
  dryRun?: boolean
  stateOps?: StateOps | null
}

export interface ApplyOutput {
  report: Json
  decisions: Json
  decisionsChanged: boolean
  ledger: Json
  state: Json | null
  pending: Json[]
}

export function mergePolicy(file?: Json): Policy
export function typo(t: string): string
export function publishedForm(p: Json | null | undefined): Json | null
export function isPlaceholder(id: unknown): boolean
export function claimKeyOf(change: Json, approachText?: string | null): string
export function classOf(change: Json, published: Json | null | undefined): 'forme' | 'secondaire' | 'principale' | 'renversement' | 'nouvelle-approche'
export function parseCandidatesTs(text: string): CandidateCard[]
export function hiddenNamesRegex(hiddenIds: readonly string[] | null | undefined, people: readonly { id: string; name: string | null }[] | null | undefined): RegExp | null
export function forbiddenHits(text: string | null | undefined, config: Json): string[]
export function nextLetter(questionId: string, o: { bankQuestion?: Json | null; decisions?: Json | null; history?: Json | null; taken?: string[] }): string | null
export function transferSlotsOf(text: string): [string, number][] | null
export function addTransferSlot(text: string, questionId: string, slot: number): string
export function serializeLike(original: string | null | undefined, value: unknown): string
export function knownCount(questions: readonly Json[], row: Json | null | undefined): number
export function buildNote(o: { change: Json; published: Json | null; today: string; runId: string; claimKey: string; requalifiedFrom?: { statedAt: string; since: string } | null }): string
export function applyChangeset(input: ApplyInput): ApplyOutput
export function chooseNewQuestion(o: { subjects: Json[]; config: Json; visible: string[]; blocOf: (id: string) => string | null; bankSize: number; policy: Json }): { newQuestion: Json | null; newQuestionRejected: Json[] }
export function acceptQuestion(o: {
  merged: Json
  mergedPath: string
  bankJson: Json
  config: Json
  election: Json | null
  candidates?: CandidateCard[]
  policy?: Json
  build: Json
  transferText: string
  fixture: Json
  ledger?: Json | null
  history?: Json | null
  today: string
  runId: string
}): { accepted: boolean; reasons: string[]; questionId: string | null; slot: number | null; build?: Json; transferText?: string; fixture?: Json; ledger?: Json }
