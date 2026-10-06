// Moteur de score d'Isoloir. Fonctions pures, sans dépendance à l'interface.
//
// Méthode (publiée sur la page Méthode) : un vote évaluatif.
// - Avis de l'utilisateur sur chaque approche, u(a) : pas d'accord −1, sans avis 0, d'accord +1.
// - Profil du candidat, v(a) : +2 pour son approche principale, +1 pour une approche compatible,
//   −1 pour une approche qu'il rejette explicitement, 0 sinon.
// - Score d'une question : x = Σ v·u / Σ |v|, ramené entre 0 et 1 par s = (x + 1) / 2.
//   50 % est le neutre : aucun avis sur ce que porte le candidat.
// - Position inconnue : la question sort du dénominateur de CE candidat (jamais « neutre »).
// - Score par thème : moyenne des s_q ; score global : moyenne des thèmes pondérée.
// - Lissage vers 50 % quand peu de questions sont connues : (S·n + k·0,5) / (n + k), k = 2.
// - Lignes rouges : filtre visible, pas de pénalité. Les candidats qui portent une approche
//   jugée inacceptable sont classés après les autres, score inchangé.

import { hasOpinion } from './answers'
import { seededShuffle } from './rng'
import type {
  Answer,
  Answers,
  ApproachId,
  CandidateId,
  ElectionPack,
  Position,
  PositionTable,
  Question,
  QuestionId,
  TopicId,
  TopicWeights,
} from './types'

export const SMOOTHING_K = 2
export const CLOSE_GAP = 5
export const PARTIAL_COVERAGE = 0.7
export const METHOD_VERSION = '2.0'

/** Poids effectif d'une position : 0 si absente ou de confiance faible, plafonné à 1 pour une inférence */
export function effectiveWeight(p: Position | undefined): number {
  if (!p || p.confidence === 'low' || !p.weight) return 0
  return p.nature === 'inference' ? Math.min(p.weight, 1) : p.weight
}

function countsAsRejection(p: Position | undefined): boolean {
  return !!p && !!p.rejects && p.confidence !== 'low'
}

/** Profil d'un candidat sur une approche : son poids s'il la porte, −1 s'il la rejette explicitement, 0 sinon */
export function stance(p: Position | undefined): number {
  const w = effectiveWeight(p)
  if (w > 0) return w
  return countsAsRejection(p) ? -1 : 0
}

/**
 * Score d'une question pour un candidat, entre 0 et 1 (0,5 = neutre), ou null si sa position est inconnue.
 */
export function questionScore(
  question: Question,
  answer: Answer,
  table: Record<ApproachId, Position> | undefined,
): number | null {
  if (!hasOpinion(answer)) return null
  let num = 0
  let den = 0
  for (const a of question.approaches) {
    const p = table?.[a.id]
    const u = answer.ratings[a.id] ?? 0
    // Position probable mais non vérifiée sur une approche notée : on ne sait pas, on ne compte pas
    if (u !== 0 && p && p.confidence === 'low' && (p.weight || p.rejects)) return null
    const v = stance(p)
    num += v * u
    den += Math.abs(v)
  }
  return den > 0 ? (num / den + 1) / 2 : null
}

export type DealbreakerLevel = 'touche' | 'possible'

export interface DealbreakerHit {
  questionId: QuestionId
  approachId: ApproachId
  level: DealbreakerLevel
}

/** Un candidat « touche » une ligne rouge s'il porte l'approche que l'utilisateur juge inacceptable */
export function dealbreakerLevel(p: Position | undefined): DealbreakerLevel | null {
  if (!p || !p.weight) return null
  const firm = (p.nature === 'proposition' || p.nature === 'declaration') && p.confidence !== 'low'
  return firm ? 'touche' : 'possible'
}

/** Nombre d'avis qui vont dans le sens du candidat, et de ceux qui vont contre */
export interface AgreementTally {
  agree: number
  disagree: number
}

/**
 * D'où vient la proximité : les avis de l'utilisateur sur ce que porte le candidat, comptés un par un.
 * Mêmes questions que le score : notées, position connue (une question que questionScore rend inconnue
 * pour ce candidat ne compte pas). Seules comptent les approches notées « d'accord » ou « pas d'accord »
 * sur lesquelles le candidat a une position prise en compte (stance non nulle).
 * - main : ses approches principales (poids effectif 2) ; accords moins désaccords = simpleCount.
 * - other : ses autres positions, approches compatibles (poids 1, inférences comprises) et approches qu'il
 *   rejette. « Pas d'accord » sur une approche qu'il rejette va dans son sens : c'est un accord.
 */
export interface AgreementBreakdown {
  main: AgreementTally
  other: AgreementTally
}

/** Ajoute à la décomposition les avis d'une question dont la position du candidat est connue */
function tallyQuestion(
  breakdown: AgreementBreakdown,
  question: Question,
  answer: Answer,
  table: Record<ApproachId, Position> | undefined,
) {
  for (const a of question.approaches) {
    const u = answer.ratings[a.id] ?? 0
    const p = table?.[a.id]
    const v = stance(p)
    if (u === 0 || v === 0) continue
    const tally = effectiveWeight(p) === 2 ? breakdown.main : breakdown.other
    if (u * v > 0) tally.agree++
    else tally.disagree++
  }
}

export interface QuestionDetail {
  questionId: QuestionId
  topicId: TopicId
  score: number | null
  /** Part de la question dans le score brut du candidat, entre 0 et 1 (0 si inconnue) */
  contribution: number
}

export interface CandidateResult {
  candidateId: CandidateId
  /** Score affiché, lissé, entre 0 et 100, ou null si aucune position connue */
  score: number | null
  /** Score brut avant lissage, entre 0 et 100 */
  rawScore: number | null
  /** Nombre de questions notées où la position du candidat est connue */
  known: number
  /** Nombre de questions notées par l'utilisateur */
  answered: number
  partialData: boolean
  topicScores: Record<TopicId, number | null>
  questions: QuestionDetail[]
  dealbreakers: DealbreakerHit[]
  /** Méthode simplifiée : approches principales du candidat approuvées, moins celles désapprouvées */
  simpleCount: number
  /** Accords et désaccords sur ses approches principales et sur ses autres positions */
  breakdown: AgreementBreakdown
  compatible: boolean
  rank: number
  /** true si le candidat partage son rang avec un autre */
  tied: boolean
}

export interface WhyItem {
  questionId: QuestionId
  /** Contribution à l'écart entre les deux premiers, en points */
  delta: number
}

export interface Results {
  ranking: CandidateResult[]
  answered: number
  /** Nombre total de lignes rouges posées */
  redLineCount: number
  /** Écart entre les deux premiers compatibles inférieur à CLOSE_GAP points */
  close: boolean
  /** Le premier reste premier avec la méthode simplifiée */
  stable: boolean
  allIncompatible: boolean
  why: WhyItem[]
  weights: TopicWeights
}

function weightOf(weights: TopicWeights, topicId: TopicId): number {
  return weights[topicId] ?? 1
}

function scoreCandidate(
  pack: ElectionPack,
  answers: Answers,
  weights: TopicWeights,
  candidateId: CandidateId,
  positions: PositionTable,
): Omit<CandidateResult, 'rank' | 'tied' | 'compatible'> {
  const table = positions[candidateId]
  const perTopic = new Map<TopicId, number[]>()
  const questions: QuestionDetail[] = []
  const dealbreakers: DealbreakerHit[] = []
  let answered = 0
  let known = 0
  const breakdown: AgreementBreakdown = { main: { agree: 0, disagree: 0 }, other: { agree: 0, disagree: 0 } }

  for (const q of pack.bank.questions) {
    const answer = answers[q.id]
    if (!answer || answer.skipped) continue
    for (const approachId of answer.redLines) {
      const level = dealbreakerLevel(table?.[approachId])
      if (level) dealbreakers.push({ questionId: q.id, approachId, level })
    }
    if (!hasOpinion(answer)) continue
    answered++
    const s = questionScore(q, answer, table)
    questions.push({ questionId: q.id, topicId: q.topicId, score: s, contribution: 0 })
    if (s === null) continue
    known++
    const list = perTopic.get(q.topicId) ?? []
    list.push(s)
    perTopic.set(q.topicId, list)
    tallyQuestion(breakdown, q, answer, table)
  }

  const topicScores: Record<TopicId, number | null> = {}
  let num = 0
  let den = 0
  for (const t of pack.bank.topics) {
    const list = perTopic.get(t.id)
    if (!list || list.length === 0) {
      topicScores[t.id] = null
      continue
    }
    const mean = list.reduce((a, b) => a + b, 0) / list.length
    topicScores[t.id] = mean * 100
    const w = weightOf(weights, t.id)
    num += w * mean
    den += w
  }

  // Décomposition exacte du score brut : w_t / (W · n_t) · s_q pour chaque question connue
  for (const d of questions) {
    if (d.score === null || den === 0) continue
    const n = perTopic.get(d.topicId)?.length ?? 1
    d.contribution = (weightOf(weights, d.topicId) / (den * n)) * d.score
  }

  const raw = den > 0 ? num / den : null
  const smoothed = raw === null ? null : (raw * known + SMOOTHING_K * 0.5) / (known + SMOOTHING_K)
  return {
    candidateId,
    score: smoothed === null ? null : smoothed * 100,
    rawScore: raw === null ? null : raw * 100,
    known,
    answered,
    partialData: answered > 0 && known / answered < PARTIAL_COVERAGE,
    topicScores,
    questions,
    dealbreakers,
    // Toutes ses approches principales comptent (le plus souvent une seule par question)
    simpleCount: breakdown.main.agree - breakdown.main.disagree,
    breakdown,
  }
}

const firmHits = (r: Pick<CandidateResult, 'dealbreakers'>) =>
  r.dealbreakers.filter(d => d.level === 'touche').length

/** Même groupe de classement : compatibles entre eux, ou, si tous franchissent une ligne rouge, autant de fois */
const sameGroup = (a: CandidateResult, b: CandidateResult, allIncompatible: boolean) =>
  allIncompatible ? firmHits(a) === firmHits(b) : a.compatible === b.compatible

/**
 * Candidats que la méthode simplifiée départage : ceux du groupe du premier, dont la position est connue.
 * Sert au calcul de la stabilité et à son affichage.
 */
export function methodPeers(ranking: CandidateResult[], allIncompatible: boolean): CandidateResult[] {
  const first = ranking[0]
  if (!first || first.score === null) return []
  return ranking.filter(r => sameGroup(r, first, allIncompatible) && r.score !== null)
}

/** Arrondi d'affichage : deux candidats au même pourcentage entier sont ex aequo */
export const displayScore = (score: number | null) => (score === null ? null : Math.round(score))

/** Au dépouillement, un bâton vaut 5 points d'affinité : les bâtons racontent exactement le classement */
export const POINTS_PER_STROKE = 5
export const strokesFor = (score: number | null) => (score === null ? 0 : Math.round(score / POINTS_PER_STROKE))

/**
 * Calcule le classement complet. Tous les candidats sont toujours renvoyés.
 * Les ex aequo sont ordonnés au hasard (graine de l'utilisateur), jamais par l'ordre du code.
 */
export function computeResults(
  pack: ElectionPack,
  answers: Answers,
  weights: TopicWeights,
  seed: string,
  candidateIds: CandidateId[] = pack.candidates.map(c => c.id),
): Results {
  const base = candidateIds.map(id => scoreCandidate(pack, answers, weights, id, pack.positions))
  const shuffled = seededShuffle(base, `${seed}:ties`)
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

  const answered = ranking[0]?.answered ?? 0
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

  return { ranking, answered, redLineCount, close, stable, allIncompatible, why, weights }
}
