// « À table » : les sujets que la table peut tirer. Un vivier fixé par une règle publiée, jamais choisi à la main :
// pour chaque thème de la banque, la question du questionnaire rapide où le plus de candidats ont une position
// connue (la première de la banque à égalité), si au moins trois candidats sur quatre en ont une (le seuil du
// questionnaire rapide, checks.quick.minKnownShare) et si chacun des blocs de l'axe de la grille des nuances y porte
// une approche principale. Le vivier change avec les données ; les tests le listent pour que tout changement se voie.
// Ce module lit les positions : il n'est importé que par l'écran de la table (src/ui/table), jamais par les écrans
// anonymes (src/ui/questionnaire/table).

import { stanceMark } from '../carriers'
import { seededShuffle } from '../rng'
import { axisOf, blocOf } from '../spectrum'
import type { ElectionPack, Question } from '../types'

/** Le seuil de la règle quand l'élection n'en donne pas : trois candidats sur quatre */
const DEFAULT_SHARE = 0.75

/** Les questions qui passent la règle du vivier, une par thème au plus, dans l'ordre des thèmes de la banque */
export function tablePool(pack: Pick<ElectionPack, 'bank' | 'candidates' | 'positions' | 'election'>): Question[] {
  const { bank, candidates, positions, election } = pack
  const share = election.checks?.quick?.minKnownShare ?? DEFAULT_SHARE
  const need = Math.ceil(share * candidates.length - 1e-9)
  const axis = axisOf(election) ?? []
  const known = (q: Question) => candidates.filter(c => q.approaches.some(a => stanceMark(positions[c.id]?.[a.id]))).length
  const everyBloc = (q: Question) =>
    axis.every(b => candidates.some(c => blocOf(election, c) === b.bloc && q.approaches.some(a => stanceMark(positions[c.id]?.[a.id]) === 'main')))
  const pool: Question[] = []
  for (const topic of bank.topics) {
    const eligible = bank.questions.filter(q => q.topicId === topic.id && q.tier === 'essentiel' && q.explainer && known(q) >= need && everyBloc(q))
    if (!eligible.length) continue
    pool.push(eligible.reduce((best, q) => (known(q) > known(best) ? q : best)))
  }
  return pool
}

/** Les sujets tirés par défaut pour une séance : count questions du vivier, tirées avec la graine de la séance */
export function drawSubjects(pool: readonly Question[], seed: string, count: number): Question[] {
  return seededShuffle(pool, `${seed}:sujets`).slice(0, Math.min(count, pool.length))
}
