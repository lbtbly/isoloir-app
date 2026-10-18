// « Faire les comptes » : un fichier à part du build, chargé à la demande (#/comptes), comme « À table » ; ses leviers
// sont un second fichier, chargé par l'écran seulement. Ce qui reste dans le code de chaque visite : savoir si
// l'élection a un jeu de budget.

import type { ElectionInfo } from '../../core/types'
import { onDemand } from '../lazy'
import { setBudgetShown } from './shown'

export type BudgetModule = typeof import('./Budget')

export const budgetScreen = onDemand<BudgetModule>(() => import('./Budget'))

/** Les élections qui ont des leviers (src/elections/<id>/budget.ts, généré par tools/build-budget.mjs) */
const WITH_BUDGET = new Set(['presidentielle-2027'])

/** Un jeu de budget pour cette élection : des leviers, hors archive */
export const hasBudget = (election: Pick<ElectionInfo, 'id' | 'archived'>): boolean => WITH_BUDGET.has(election.id) && !election.archived

/** Fixé par l'application avant de rendre l'élection (app.tsx), lu par le menu de l'en-tête et le pied (shown.ts) */
export function setBudgetElection(election: Pick<ElectionInfo, 'id' | 'archived'>) {
  setBudgetShown(hasBudget(election))
}
