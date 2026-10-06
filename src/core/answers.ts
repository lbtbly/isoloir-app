// Réponses de l'utilisateur : un cran de réglette par approche (pas d'accord, sans avis, d'accord),
// et des lignes rouges. Une seule règle lie les deux : une ligne rouge est toujours notée « pas d'accord ».
// Module sans dépendance aux candidats : utilisé aussi par le questionnaire.

import type { Answer, ApproachId, Rating } from './types'

export const EMPTY_ANSWER: Answer = { ratings: {}, redLines: [] }

/** Les trois crans de la réglette, de gauche à droite */
export const SCALE: readonly (Rating | 0)[] = [-1, 0, 1]

export const RATING_LABELS: Record<Rating | 0, string> = {
  [-1]: 'Pas d’accord',
  0: 'Sans avis',
  1: 'D’accord',
}

export const ratingOf = (answer: Answer | undefined, id: ApproachId): Rating | 0 => answer?.ratings[id] ?? 0

/** Avis sur une approche : −1, 0 ou 1 */
export const opinion = (answer: Answer, id: ApproachId): number => ratingOf(answer, id)

/** La réponse exprime au moins un avis : elle compte dans le score */
export function hasOpinion(answer: Answer | undefined): answer is Answer {
  return !!answer && !answer.skipped && Object.keys(answer.ratings).length > 0
}

/** Question vue et répondue (au moins un avis), par opposition à passée ou jamais vue */
export const isAnswered = hasOpinion

/** Change le cran d'une approche. Quitter « pas d'accord » retire la ligne rouge. */
export function withRating(answer: Answer, id: ApproachId, rating: Rating | 0): Answer {
  const ratings = { ...answer.ratings }
  if (rating === 0) delete ratings[id]
  else ratings[id] = rating
  const redLines = rating === -1 ? answer.redLines : answer.redLines.filter(x => x !== id)
  return { ratings, redLines }
}

/** Pose ou retire une ligne rouge. La poser place la réglette sur « pas d'accord ». */
export function withRedLine(answer: Answer, id: ApproachId, on: boolean): Answer {
  if (!on) return { ratings: { ...answer.ratings }, redLines: answer.redLines.filter(x => x !== id) }
  return {
    ratings: { ...answer.ratings, [id]: -1 },
    redLines: answer.redLines.includes(id) ? answer.redLines : [...answer.redLines, id],
  }
}
