// Référence figée : computeResults tel qu'il était avant le score indicatif des non classés (décision du propriétaire
// du 14 octobre 2026), recopié à l'identique depuis src/core/score.ts (commit 90e5379), sauf son nom et son type de
// retour (Results sans excludedResults). Les fonctions qu'il appelle sont celles du moteur, inchangées. Sert à
// tests/excluded-indicative.test.ts : le classement d'aujourd'hui doit lui être identique pour toute réponse.
// Un changement voulu de la méthode (METHOD_VERSION) rend cette référence caduque : la mettre à jour ou la retirer.
import { hasOpinion } from '../../src/core/answers'
import { seededShuffle } from '../../src/core/rng'
import {
  CLOSE_GAP,
  displayScore,
  excludedIds,
  isRanked,
  methodPeers,
  minCoverageShare,
  scoreCandidate,
  type CandidateResult,
  type Results,
  type UnrankedResult,
  type WhyItem,
} from '../../src/core/score'
import type { Answers, CandidateId, ElectionPack, TopicWeights } from '../../src/core/types'

export type ResultsBefore = Omit<Results, 'excludedResults'>

const firmHits = (r: Pick<CandidateResult, 'dealbreakers'>) =>
  r.dealbreakers.filter(d => d.level === 'touche').length

const sameGroup = (a: CandidateResult, b: CandidateResult, allIncompatible: boolean) =>
  allIncompatible ? firmHits(a) === firmHits(b) : a.compatible === b.compatible

export function computeResultsBefore(
  pack: ElectionPack,
  answers: Answers,
  weights: TopicWeights,
  seed: string,
  candidateIds: CandidateId[] = pack.candidates.map(c => c.id),
): ResultsBefore {
  // Non classés : écartés avant tout calcul. Sans décision, la liste est la même, dans le même ordre : le tirage des
  // ex aequo, donc le classement de la primaire, ne change pas
  const out = new Set(excludedIds(pack))
  const excluded = seededShuffle(candidateIds.filter(id => out.has(id)), `${seed}:excluded`)
  const base = candidateIds.filter(id => !out.has(id)).map(id => scoreCandidate(pack, answers, weights, id, pack.positions))
  const minShare = minCoverageShare(pack)
  // Sans règle, « shuffled » garde tous les candidats, dans le même ordre : le classement de la primaire ne change pas
  const all = seededShuffle(base, `${seed}:ties`)
  const shuffled = all.filter(r => isRanked(r, minShare))
  const unranked: UnrankedResult[] = all.filter(r => !isRanked(r, minShare)).map(r => ({ ...r, compatible: firmHits(r) === 0 }))
  const allIncompatible = shuffled.length > 0 && shuffled.every(r => firmHits(r) > 0)

  const sortKey = (r: (typeof base)[number]) => [
    allIncompatible ? firmHits(r) : firmHits(r) > 0 ? 1 : 0,
    -(displayScore(r.score) ?? -1),
  ]
  const sorted = shuffled.slice().sort((a, b) => {
    const ka = sortKey(a)
    const kb = sortKey(b)
    for (let i = 0; i < ka.length; i++) {
      const d = (ka[i] as number) - (kb[i] as number)
      if (d !== 0) return d
    }
    return 0
  })

  const ranking: CandidateResult[] = []
  sorted.forEach((r, i) => {
    const prev = ranking[i - 1]
    const same =
      prev &&
      sortKey(r).every((v, k) => v === sortKey(sorted[i - 1] as (typeof base)[number])[k])
    const rank = same && prev ? prev.rank : i + 1
    if (same && prev) prev.tied = true
    ranking.push({ ...r, compatible: firmHits(r) === 0, rank, tied: !!same })
  })

  // Le même pour tous les candidats ; pris avant le partage, pour le cas où aucun n'est classé (ni même calculé)
  const answered = base[0]?.answered ?? pack.bank.questions.filter(q => hasOpinion(answers[q.id])).length
  const redLineCount = Object.values(answers).reduce((n, a) => n + (a.skipped ? 0 : a.redLines.length), 0)

  const [first, second] = ranking
  const d1 = first ? displayScore(first.score) : null
  const d2 = second ? displayScore(second.score) : null
  const close =
    !!first && !!second && sameGroup(first, second, allIncompatible) && d1 !== null && d2 !== null && Math.abs(d1 - d2) < CLOSE_GAP

  // Stabilité : le groupe de tête l'emporte-t-il aussi avec la méthode simplifiée, parmi les candidats de sa
  // classe dont la position est connue ? Le compte simplifié peut être négatif (désaccords) : pas de plancher à 0.
  let stable = true
  const peers = methodPeers(ranking, allIncompatible)
  if (first && peers.length) {
    const maxSimple = Math.max(...peers.map(r => r.simpleCount))
    const leaders = peers.filter(r => r.rank === first.rank)
    stable = leaders.some(r => r.simpleCount === maxSimple)
  }

  const why: WhyItem[] = []
  if (first && second && first.score !== null && second.score !== null) {
    const c2 = new Map(second.questions.map(q => [q.questionId, q.contribution]))
    for (const q1 of first.questions) {
      const delta = (q1.contribution - (c2.get(q1.questionId) ?? 0)) * 100
      if (delta > 0.05) why.push({ questionId: q1.questionId, delta })
    }
    why.sort((a, b) => b.delta - a.delta)
    why.splice(3)
  }

  return {
    ranking,
    excluded,
    unranked,
    drawOrder: shuffled.map(r => r.candidateId),
    minCoverageShare: minShare,
    answered,
    redLineCount,
    close,
    stable,
    allIncompatible,
    why,
    weights,
  }
}
