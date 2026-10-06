// Ordre des questions pour chaque personne : les thèmes dans un ordre tiré au hasard (graine de
// l'utilisateur), stable d'une visite à l'autre. Module sans dépendance à l'interface ni aux candidats.

import { seededShuffle } from './rng'
import type { Question, QuestionBank, Tier } from './types'

/** Une question marquée « last » ferme son bloc, sans changer l'ordre des autres */
const closing = (questions: Question[]) => [...questions.filter(q => !q.last), ...questions.filter(q => q.last)]

/**
 * Questions d'un niveau, thèmes dans l'ordre aléatoire propre à l'utilisateur.
 * Questionnaire rapide : les questions du premier dépouillement d'abord, puis celles de l'affinage.
 */
export function orderedQuestions(bank: QuestionBank, tier: Tier, seed: string, topics?: string[]): Question[] {
  const topicOrder = seededShuffle(
    bank.topics.map(t => t.id),
    `${seed}:topics`,
  )
  const list = topicOrder.flatMap(tid =>
    bank.questions.filter(q => q.topicId === tid && q.tier === tier && (!topics || topics.includes(tid))),
  )
  if (tier !== 'essentiel') return closing(list)
  return [...closing(list.filter(q => q.step !== 2)), ...closing(list.filter(q => q.step === 2))]
}

/** Nombre de questions du premier dépouillement (0 si l'élection n'en prévoit pas) */
export const firstStepSize = (essential: Question[]) => essential.filter(q => q.step === 1).length
