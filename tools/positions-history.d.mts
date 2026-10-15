// Types de tools/positions-history.mjs, pour les tests en TypeScript.

import type { ChangeCause, LabelQuestion, PositionsHistory } from '../src/core/positionsHistory'
import type { PositionTable } from '../src/core/types'

export const HISTORY_FILE: string

/** Raison et cause d'une position de la nouvelle table, telles que build-pack les donne */
export interface BuildReason {
  reason: string | null
  from: string | null
  cause?: ChangeCause | null
  statedAt?: string | null
}

export interface AppendResult {
  added: number
  updated: number
  removed: number
  /** Entrées estampillées de la dataVersion courante avant la consignation */
  stamped: number
  /** Libellés (énoncés, approches) changés ce jour-là */
  labels: number
  date: string
  /** Le rejeu ne redonne pas la nouvelle table */
  drift: boolean
  /** Le positions.ts d'avant ne correspondait pas à l'historique (BUILD --no-history ou fichier modifié) */
  diskDrift: boolean
}

/** Consigne les écarts d'une construction ; null si rien n'est fait (pas d'historique, dossier neuf ou d'une autre élection) */
export function appendFromBuild(o: {
  researchDir: string
  srcDir: string
  next: PositionTable
  decisions: unknown
  questionOf?: (approachId: string) => string | undefined
  revOf?: (questionId: string) => number | null | undefined
  reasonOf?: unknown
  bank?: readonly LabelQuestion[] | null
  date?: string
  previous?: PositionTable
}): AppendResult | null

export function loadHistory(researchDir: string, o?: { anyFormat?: boolean }): PositionsHistory | null
export function saveHistory(researchDir: string, history: PositionsHistory): void
export function parseGenerated(text: string): unknown
export function todayInParis(): string
