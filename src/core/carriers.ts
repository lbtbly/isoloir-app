// Qui porte une approche : la lecture des positions que partagent « Qui porte quoi » et la révélation de la table.
// Des fonctions pures, sans total ni score : pour chaque approche, les candidats qui la portent (principale ou
// compatible) ou la rejettent ; pour une question, ceux dont on ne connaît aucune position. Une position de confiance
// faible (« probable, non comptée ») ne marque rien, comme dans le calcul. Ce module n'importe que des types.

import type { Approach, Candidate, ElectionPack, Position, Question } from './types'

/** Ce que le candidat pense d'une approche */
export type Mark = 'main' | 'secondary' | 'rejects'

/** La marque d'une position : principale, compatible ou rejet ; null sans position, ou de confiance faible */
export function stanceMark(p: Position | undefined): Mark | null {
  if (!p || p.confidence === 'low') return null
  if (p.weight === 2) return 'main'
  if (p.weight === 1) return 'secondary'
  if (p.rejects) return 'rejects'
  return null
}

/** Les candidats qui ont une marque sur l'approche, dans l'ordre de people (déjà mélangé par l'écran) */
export function holdersOf(
  approach: Pick<Approach, 'id'>,
  people: readonly Candidate[],
  positions: ElectionPack['positions'],
): { c: Candidate; mark: Mark }[] {
  return people
    .map(c => ({ c, mark: stanceMark(positions[c.id]?.[approach.id]) }))
    .filter((x): x is { c: Candidate; mark: Mark } => x.mark !== null)
}

/** Les candidats sans aucune marque sur la question : « position non trouvée à ce jour » */
export function unknownOf(question: Pick<Question, 'approaches'>, people: readonly Candidate[], positions: ElectionPack['positions']): Candidate[] {
  return people.filter(c => !question.approaches.some(a => stanceMark(positions[c.id]?.[a.id])))
}
