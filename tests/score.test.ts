import { describe, expect, it } from 'vitest'
import { withRating, withRedLine } from '../src/core/answers'
import {
  computeResults,
  dealbreakerLevel,
  effectiveWeight,
  excludedIds,
  isExcluded,
  isRanked,
  knownQuestions,
  questionScore,
  type Results,
} from '../src/core/score'
import { mulberry32, seededShuffle } from '../src/core/rng'
import type { Answer, Answers, ElectionPack, Question, Rating } from '../src/core/types'
import { EXCLUDED, manyCandidates } from './fixtures/many-candidates'
import { pack, pos, rej } from './fixture'

const q = (id: string) => pack.bank.questions.find(x => x.id === id)!
const ans = (ratings: Record<string, Rating>, redLines: string[] = []): Answer => ({ ratings, redLines })
const rank = (answers: Answers, weights = {}) =>
  computeResults(pack, answers, weights, 'seed').ranking.map(r => r.candidateId)

describe('questionScore : vote évaluatif', () => {
  it('approuver les approches du candidat le rapproche, en proportion de leur poids', () => {
    // a porte q3a (principale, 2) et q3b (compatible, 1) : x = Σ v·u / Σ |v|, s = (x + 1) / 2
    expect(questionScore(q('q3'), ans({ q3a: 1 }), pack.positions.a)).toBeCloseTo(5 / 6)
    expect(questionScore(q('q3'), ans({ q3b: 1 }), pack.positions.a)).toBeCloseTo(2 / 3)
    expect(questionScore(q('q3'), ans({ q3a: 1, q3b: 1 }), pack.positions.a)).toBe(1)
  })
  it('être en désaccord avec ses approches l’éloigne symétriquement', () => {
    expect(questionScore(q('q3'), ans({ q3a: -1 }), pack.positions.a)).toBeCloseTo(1 / 6)
    expect(questionScore(q('q3'), ans({ q3a: -1, q3b: -1 }), pack.positions.a)).toBe(0)
    expect(questionScore(q('q3'), ans({ q3a: 1, q3b: -1 }), pack.positions.a)).toBeCloseTo(2 / 3)
  })
  it('un avis sur une approche que le candidat ne porte pas reste neutre pour lui', () => {
    expect(questionScore(q('q3'), ans({ q3c: 1 }), pack.positions.a)).toBe(0.5)
    expect(questionScore(q('q3'), ans({ q3c: -1 }), pack.positions.a)).toBe(0.5)
  })
  it('compte le rejet explicite du candidat comme un profil négatif', () => {
    // b porte q3b (2) et rejette q3a (−1)
    expect(questionScore(q('q3'), ans({ q3a: 1 }), pack.positions.b)).toBeCloseTo(1 / 3)
    expect(questionScore(q('q3'), ans({ q3a: -1 }), pack.positions.b)).toBeCloseTo(2 / 3)
    expect(questionScore(q('q1'), ans({ q1a: 1 }), { q1a: rej() })).toBe(0)
    expect(questionScore(q('q1'), ans({ q1a: -1 }), { q1a: rej() })).toBe(1)
  })
  it('inverser tous les avis donne le score complémentaire', () => {
    const answers = [ans({ q3a: 1, q3c: -1 }), ans({ q3b: 1 }), ans({ q3a: -1, q3b: 1, q3c: 1 })]
    for (const a of answers) {
      const inverse = ans(Object.fromEntries(Object.entries(a.ratings).map(([k, v]) => [k, -v as Rating])))
      for (const c of ['a', 'b']) {
        const s = questionScore(q('q3'), a, pack.positions[c])!
        expect(questionScore(q('q3'), inverse, pack.positions[c])).toBeCloseTo(1 - s)
      }
    }
  })
  it('renvoie null quand la position est inconnue, la question passée ou sans avis', () => {
    expect(questionScore(q('q3'), ans({ q3a: 1 }), pack.positions.c)).toBeNull()
    expect(questionScore(q('q1'), { ...ans({ q1a: 1 }), skipped: true }, pack.positions.a)).toBeNull()
    expect(questionScore(q('q1'), ans({}), pack.positions.a)).toBeNull()
  })
  it("une position probable (confiance faible) sur une approche notée rend la question inconnue pour ce candidat", () => {
    const table = { q1a: pos(2, { confidence: 'low' }), q1b: pos(2) }
    expect(questionScore(q('q1'), ans({ q1a: 1 }), table)).toBeNull()
    expect(questionScore(q('q1'), ans({ q1b: 1 }), table)).toBe(1)
  })
})

describe('réglette et ligne rouge', () => {
  it('une ligne rouge place la réglette sur « pas d’accord » ; changer de cran la retire', () => {
    const a = withRedLine(ans({ q1a: 1 }), 'q1a', true)
    expect(a).toEqual({ ratings: { q1a: -1 }, redLines: ['q1a'] })
    expect(withRating(a, 'q1a', 0)).toEqual({ ratings: {}, redLines: [] })
    expect(withRating(a, 'q1a', 1)).toEqual({ ratings: { q1a: 1 }, redLines: [] })
    expect(withRating(a, 'q1a', -1)).toEqual(a)
    expect(withRedLine(a, 'q1a', false)).toEqual({ ratings: { q1a: -1 }, redLines: [] })
  })
})

describe('effectiveWeight', () => {
  it('écarte la confiance faible et plafonne les inférences', () => {
    expect(effectiveWeight(pos(2, { confidence: 'low' }))).toBe(0)
    expect(effectiveWeight(pos(2, { nature: 'inference' }))).toBe(1)
    expect(effectiveWeight(undefined)).toBe(0)
  })
})

describe('computeResults', () => {
  it('auto-cohérence : approuver les approches principales de chaque candidat le classe premier', () => {
    for (const c of pack.candidates) {
      const answers: Answers = {}
      for (const question of pack.bank.questions) {
        const main = question.approaches.filter(a => pack.positions[c.id]?.[a.id]?.weight === 2)
        if (main.length) answers[question.id] = ans(Object.fromEntries(main.map(a => [a.id, 1])))
      }
      expect(rank(answers)[0]).toBe(c.id)
    }
  })

  it('noter tout au même cran donne une égalité parfaite, hors rejets explicites', () => {
    // b rejette explicitement q3a : seule q3 le distingue quand tout est approuvé
    const noRejection = pack.bank.questions.filter(x => x.id !== 'q3')
    for (const level of [1, -1] as Rating[]) {
      const answers: Answers = Object.fromEntries(
        noRejection.map(x => [x.id, ans(Object.fromEntries(x.approaches.map(a => [a.id, level])))]),
      )
      const r = computeResults(pack, answers, {}, 'seed')
      expect(new Set(r.ranking.map(x => Math.round(x.rawScore!))).size).toBe(1)
      expect(r.ranking.every(x => x.rank === 1 && x.tied)).toBe(true)
    }
  })

  it('ne rien noter ne produit aucun score', () => {
    const r = computeResults(pack, {}, {}, 'seed')
    expect(r.answered).toBe(0)
    expect(r.ranking.every(x => x.score === null)).toBe(true)
    expect(r.ranking).toHaveLength(3)
  })

  it('classe après les autres un candidat qui franchit une ligne rouge, sans changer son score', () => {
    const answers: Answers = { q1: ans({ q1a: 1, q1b: -1 }, ['q1b']) }
    const r = computeResults(pack, answers, {}, 'seed')
    const b = r.ranking.find(x => x.candidateId === 'b')!
    expect(b.compatible).toBe(false)
    expect(b.dealbreakers).toEqual([{ questionId: 'q1', approachId: 'q1b', level: 'touche' }])
    expect(r.ranking.at(-1)!.candidateId).toBe('b')
    expect(r.redLineCount).toBe(1)
    const sameRatings = computeResults(pack, { q1: ans({ q1a: 1, q1b: -1 }) }, {}, 'seed')
    expect(sameRatings.ranking.find(x => x.candidateId === 'b')!.score).toBe(b.score)
  })

  it('signale une ligne rouge seulement « possible » pour une inférence', () => {
    expect(dealbreakerLevel(pos(1, { nature: 'inference' }))).toBe('possible')
    expect(dealbreakerLevel(pos(2))).toBe('touche')
  })

  it('exclut la question inconnue du dénominateur du seul candidat concerné et affiche la couverture', () => {
    const answers: Answers = { q1: ans({ q1c: 1 }), q3: ans({ q3a: 1 }) }
    const c = computeResults(pack, answers, {}, 'seed').ranking.find(x => x.candidateId === 'c')!
    expect(c.answered).toBe(2)
    expect(c.known).toBe(1)
    expect(c.partialData).toBe(true)
    expect(c.rawScore).toBe(100)
    // lissage : (1·1 + 2·0,5) / (1 + 2) = 66,7 %
    expect(c.score).toBeCloseTo(66.67, 1)
  })

  it('pondère par thème, pas par nombre de questions', () => {
    const answers: Answers = { q1: ans({ q1a: 1 }), q2: ans({ q2a: 1 }), q3: ans({ q3b: 1 }) }
    const neutral = computeResults(pack, answers, {}, 'seed')
    const boosted = computeResults(pack, answers, { t2: 2 }, 'seed')
    const b0 = neutral.ranking.find(x => x.candidateId === 'b')!.rawScore!
    const b1 = boosted.ranking.find(x => x.candidateId === 'b')!.rawScore!
    expect(b1).toBeGreaterThan(b0)
  })

  it('renvoie toujours tous les candidats et ordonne les ex aequo par la graine, pas par le code', () => {
    const answers: Answers = Object.fromEntries(
      pack.bank.questions
        .filter(x => x.id !== 'q3')
        .map(x => [x.id, ans(Object.fromEntries(x.approaches.map(a => [a.id, 1])))]),
    )
    const orders = new Set(
      ['s1', 's2', 's3', 's4', 's5', 's6'].map(s => computeResults(pack, answers, {}, s).ranking.map(r => r.candidateId).join()),
    )
    expect(orders.size).toBeGreaterThan(1)
  })

  it('les contributions par question reconstituent exactement le score brut', () => {
    const answers: Answers = { q1: ans({ q1a: 1, q1c: -1 }), q2: ans({ q2b: 1 }), q3: ans({ q3b: 1, q3a: -1 }) }
    const r = computeResults(pack, answers, { t2: 2 }, 'seed')
    for (const c of r.ranking) {
      const sum = c.questions.reduce((s, x) => s + x.contribution, 0) * 100
      expect(sum).toBeCloseTo(c.rawScore ?? 0, 6)
    }
    const [a, b] = r.ranking
    const total = r.why.reduce((s, w) => s + w.delta, 0)
    expect(total).toBeLessThanOrEqual((a!.rawScore ?? 0) - (b!.rawScore ?? 0) + 100)
  })

  it('recalcule tout sur le sous-ensemble des finalistes', () => {
    const answers: Answers = { q1: ans({ q1b: 1 }), q2: ans({ q2b: 1 }) }
    const r = computeResults(pack, answers, {}, 'seed', ['a', 'c'])
    expect(r.ranking.map(x => x.candidateId).sort()).toEqual(['a', 'c'])
    expect(r.ranking[0]!.rank).toBe(1)
  })

  it('« stable » reste vrai quand tous les comptes simplifiés sont négatifs et que le premier a le meilleur', () => {
    // Que des désaccords : a, c et b ont des comptes simplifiés −1, −1 et −2 ; a reste premier
    const answers: Answers = { q1: ans({ q1a: -1, q1b: -1, q1c: -1 }), q2: ans({ q2b: -1 }) }
    const r = computeResults(pack, answers, {}, 'seed')
    expect(r.ranking[0]!.candidateId).toBe('a')
    expect(r.ranking.every(x => x.simpleCount < 0)).toBe(true)
    expect(r.stable).toBe(true)
  })

  it('« stable » ignore un candidat dont aucune position n’est connue', () => {
    // c est inconnu sur q3 (score nul, compte simplifié 0) : il ne peut pas « arriver en tête »
    const r = computeResults(pack, { q3: ans({ q3a: -1, q3b: -1 }) }, {}, 'seed')
    expect(r.ranking.find(x => x.candidateId === 'c')!.score).toBeNull()
    expect(r.stable).toBe(true)
  })

  it('« stable » ignore les candidats relégués par une ligne rouge', () => {
    // b porte q1b, ligne rouge de l'utilisateur : b est relégué, il ne doit pas rendre le résultat « instable »
    const answers: Answers = { q1: ans({ q1a: 1, q1b: -1 }, ['q1b']), q2: ans({ q2b: 1 }), q3: ans({ q3b: 1 }) }
    const r = computeResults(pack, answers, {}, 'seed')
    expect(r.ranking.at(-1)!.candidateId).toBe('b')
    expect(r.stable).toBe(true)
  })
})

describe('décomposition de l’accord', () => {
  const breakdownOf = (answers: Answers, id: string, p = pack) =>
    computeResults(p, answers, {}, 'seed').ranking.find(x => x.candidateId === id)!.breakdown
  const zero = { main: { agree: 0, disagree: 0 }, other: { agree: 0, disagree: 0 } }

  it('compte à part ses approches principales et ses autres positions', () => {
    // a : q3a principale (d'accord), q3b compatible (pas d'accord) ; q3c n'est portée par personne
    const answers: Answers = { q3: ans({ q3a: 1, q3b: -1, q3c: 1 }) }
    expect(breakdownOf(answers, 'a')).toEqual({ main: { agree: 1, disagree: 0 }, other: { agree: 0, disagree: 1 } })
    // b : q3b principale (pas d'accord), q3a qu'il rejette (d'accord) : deux désaccords
    expect(breakdownOf(answers, 'b')).toEqual({ main: { agree: 0, disagree: 1 }, other: { agree: 0, disagree: 1 } })
  })

  it('« pas d’accord » sur une approche que le candidat rejette est un accord', () => {
    expect(breakdownOf({ q3: ans({ q3a: -1 }) }, 'b')).toEqual({ main: { agree: 0, disagree: 0 }, other: { agree: 1, disagree: 0 } })
  })

  it('ignore « sans avis » et les approches sur lesquelles le candidat n’a pas de position', () => {
    // b porte q1b (principale) et q1a (compatible) ; seule q1a est notée
    expect(breakdownOf({ q1: ans({ q1a: 1 }) }, 'b')).toEqual({ main: { agree: 0, disagree: 0 }, other: { agree: 1, disagree: 0 } })
    expect(breakdownOf({ q1: ans({ q1c: 1 }) }, 'a')).toEqual(zero)
  })

  it('exclut les positions inconnues, les questions passées et les positions probables', () => {
    // c est inconnu sur q3 : la question ne compte pas pour lui
    expect(breakdownOf({ q3: ans({ q3a: 1, q3b: 1 }) }, 'c')).toEqual(zero)
    expect(breakdownOf({ q1: { ...ans({ q1a: 1 }), skipped: true } }, 'a')).toEqual(zero)
    // Une position probable sur une approche notée rend toute la question inconnue pour ce candidat, comme au score
    const probable = { ...pack, positions: { ...pack.positions, a: { ...pack.positions.a, q1b: pos(1, { confidence: 'low' }) } } }
    const answers: Answers = { q1: ans({ q1a: 1, q1b: 1 }), q2: ans({ q2a: 1 }) }
    expect(breakdownOf(answers, 'a', probable)).toEqual({ main: { agree: 1, disagree: 0 }, other: { agree: 0, disagree: 0 } })
  })

  it('une inférence compte parmi les autres positions, même déclarée principale', () => {
    const inferred = { ...pack, positions: { ...pack.positions, a: { ...pack.positions.a, q2a: pos(2, { nature: 'inference' }) } } }
    expect(breakdownOf({ q2: ans({ q2a: 1 }) }, 'a', inferred)).toEqual({ main: { agree: 0, disagree: 0 }, other: { agree: 1, disagree: 0 } })
  })

  it('accords principaux moins désaccords principaux donnent le compte simplifié', () => {
    const levels: (Rating | 0)[] = [1, -1, 0]
    for (let n = 0; n < 60; n++) {
      const answers: Answers = {}
      for (const question of pack.bank.questions) {
        const ratings: Record<string, Rating> = {}
        question.approaches.forEach((a, k) => {
          const level = levels[(n * 7 + k * 3 + question.id.length * n) % 3]!
          if (level) ratings[a.id] = level
        })
        answers[question.id] = ans(ratings)
      }
      for (const r of computeResults(pack, answers, {}, 'seed').ranking) {
        // Référence indépendante : le signe de l'avis sur l'approche principale, question connue par question connue
        let reference = 0
        for (const question of pack.bank.questions) {
          const table = pack.positions[r.candidateId]
          if (questionScore(question, answers[question.id]!, table) === null) continue
          const main = question.approaches.find(a => effectiveWeight(table?.[a.id]) === 2)
          if (main) reference += Math.sign(answers[question.id]!.ratings[main.id] ?? 0)
        }
        expect(r.breakdown.main.agree - r.breakdown.main.disagree).toBe(r.simpleCount)
        expect(r.simpleCount).toBe(reference)
      }
    }
  })

  it('compte toutes les approches principales d’une question, s’il y en a plusieurs', () => {
    const two = { ...pack, positions: { ...pack.positions, a: { q1a: pos(2), q1b: pos(2) } } }
    const r = computeResults(two, { q1: ans({ q1a: 1, q1b: 1 }) }, {}, 'seed').ranking.find(x => x.candidateId === 'a')!
    expect(r.breakdown.main).toEqual({ agree: 2, disagree: 0 })
    expect(r.simpleCount).toBe(2)
  })
})

describe('seededShuffle', () => {
  it('est stable pour une même graine', () => {
    const items = [1, 2, 3, 4, 5, 6, 7]
    expect(seededShuffle(items, 'x')).toEqual(seededShuffle(items, 'x'))
    expect(seededShuffle(items, 'x').sort()).toEqual(items)
  })
})

describe('hors classement (règle election.ranking)', () => {
  /** Le pack de test avec la règle ; c n'est connu que sur q1 (a et b sur les trois questions) */
  const narrow: ElectionPack = {
    ...pack,
    election: { ...pack.election, ranking: { minCoverageShare: 0.5 } },
    positions: { ...pack.positions, c: { q1c: pos(2) } },
  }
  const noRule: ElectionPack = { ...narrow, election: { ...narrow.election, ranking: undefined } }
  const all3: Answers = { q1: ans({ q1c: 1 }), q2: ans({ q2a: 1 }), q3: ans({ q3a: 1 }) }

  it('isRanked : au moins la part demandée des questions comptées, à l’égalité près ; sans règle ou sans réponse, classé', () => {
    expect(isRanked({ known: 3, answered: 6 }, 0.5)).toBe(true)
    expect(isRanked({ known: 2, answered: 5 }, 0.5)).toBe(false)
    expect(isRanked({ known: 7, answered: 10 }, 0.7)).toBe(true)
    expect(isRanked({ known: 6, answered: 10 }, 0.7)).toBe(false)
    expect(isRanked({ known: 0, answered: 0 }, 0.5)).toBe(true)
    expect(isRanked({ known: 1, answered: 10 }, null)).toBe(true)
  })

  it('connu sur moins de la moitié des questions comptées : hors classement, score gardé à titre indicatif', () => {
    const r = computeResults(narrow, all3, {}, 'seed')
    expect(r.minCoverageShare).toBe(0.5)
    expect(r.ranking.map(x => x.candidateId).sort()).toEqual(['a', 'b'])
    expect(r.ranking.map(x => x.rank)).toEqual([1, 2])
    expect(r.unranked.map(x => x.candidateId)).toEqual(['c'])
    const c = r.unranked[0]!
    expect(c.known).toBe(1)
    expect(c.answered).toBe(3)
    expect(c.coverage).toBeCloseTo(1 / 3)
    expect('rank' in c || 'tied' in c).toBe(false)
    // Le même score que sans la règle : seule sa place change
    const without = computeResults(noRule, all3, {}, 'seed')
    expect(without.unranked).toEqual([])
    expect(without.minCoverageShare).toBeNull()
    expect(c.score).toBe(without.ranking.find(x => x.candidateId === 'c')!.score)
    expect(r.answered).toBe(3)
  })

  it('pile à la moitié : classé ; les questions passées et sans avis ne comptent pas', () => {
    const half = computeResults(narrow, { q1: ans({ q1c: 1 }), q3: ans({ q3a: 1 }) }, {}, 'seed')
    expect(half.unranked).toEqual([])
    expect(half.ranking.find(x => x.candidateId === 'c')!.coverage).toBe(0.5)
    const skipped = computeResults(narrow, { q1: ans({ q1c: 1 }), q2: { ...ans({ q2a: 1 }), skipped: true }, q3: ans({}) }, {}, 'seed')
    expect(skipped.answered).toBe(1)
    expect(skipped.unranked).toEqual([])
  })

  it('sans réponse, tous classés (rien à départager)', () => {
    const r = computeResults(narrow, {}, {}, 'seed')
    expect(r.unranked).toEqual([])
    expect(r.ranking).toHaveLength(3)
  })

  it('ex aequo, écart et stabilité entre classés seulement, même face à un score indicatif plus haut', () => {
    // a et b portent les mêmes approches : toujours ex aequo. c, connu sur q1 seulement, y est d'accord avec vous.
    const twins: ElectionPack = {
      ...narrow,
      positions: { a: { q1a: pos(2), q2a: pos(2), q3a: pos(2) }, b: { q1a: pos(2), q2a: pos(2), q3a: pos(2) }, c: { q1c: pos(2) } },
    }
    const answers: Answers = { q1: ans({ q1c: 1 }), q2: ans({ q2a: -1 }), q3: ans({ q3a: 1 }) }
    const r = computeResults(twins, answers, {}, 'seed')
    expect(r.ranking.map(x => [x.rank, x.tied])).toEqual([
      [1, true],
      [1, true],
    ])
    expect(r.unranked[0]!.score!).toBeGreaterThan(r.ranking[0]!.score!)
    expect(r.close).toBe(true)
    expect(r.stable).toBe(true)
    // Sans la règle, c passerait premier, seul
    const ranked = computeResults({ ...twins, election: noRule.election }, answers, {}, 'seed').ranking
    expect(ranked[0]).toMatchObject({ candidateId: 'c', rank: 1, tied: false })
  })

  it('finalistes : la règle s’applique entre eux ; « ce qui les sépare » et l’écart ne portent que sur les classés', () => {
    const r = computeResults(narrow, all3, {}, 'seed', ['a', 'c'])
    expect(r.ranking.map(x => x.candidateId)).toEqual(['a'])
    expect(r.ranking[0]!.rank).toBe(1)
    expect(r.unranked.map(x => x.candidateId)).toEqual(['c'])
    expect(r.close).toBe(false)
    expect(r.why).toEqual([])
    const both = computeResults(narrow, all3, {}, 'seed', ['a', 'b'])
    expect(both.unranked).toEqual([])
    expect(both.ranking.map(x => x.rank)).toEqual([1, 2])
  })

  it('lignes rouges : signalées hors classement aussi ; « tous concernés » se juge entre classés', () => {
    // Ligne rouge sur q1c, que porte c (hors classement)
    const onC = computeResults(narrow, { ...all3, q1: ans({ q1c: -1 }, ['q1c']) }, {}, 'seed')
    expect(onC.unranked[0]).toMatchObject({ candidateId: 'c', compatible: false })
    expect(onC.allIncompatible).toBe(false)
    expect(onC.ranking.every(x => x.compatible)).toBe(true)
    // Ligne rouge sur une approche que portent a et b (classés), pas c : tous les classés sont concernés
    const twins: ElectionPack = {
      ...narrow,
      positions: { a: { q1a: pos(2), q2a: pos(2), q3a: pos(2) }, b: { q1a: pos(1), q2b: pos(2), q3b: pos(2) }, c: { q1c: pos(2) } },
    }
    const r = computeResults(twins, { q1: ans({ q1a: -1, q1c: 1 }, ['q1a']), q2: ans({ q2a: 1 }), q3: ans({ q3a: 1 }) }, {}, 'seed')
    expect(r.unranked).toMatchObject([{ candidateId: 'c', compatible: true }])
    expect(r.allIncompatible).toBe(true)
    expect(r.redLineCount).toBe(1)
  })

  it('priorités : les thèmes prioritaires changent les scores, jamais qui est classé', () => {
    const plain = computeResults(narrow, all3, {}, 'seed')
    const weighted = computeResults(narrow, all3, { t2: 2 }, 'seed')
    expect(weighted.unranked.map(x => x.candidateId)).toEqual(plain.unranked.map(x => x.candidateId))
    expect(weighted.ranking.map(x => x.candidateId).sort()).toEqual(plain.ranking.map(x => x.candidateId).sort())
  })

  describe('élection nombreuse (20 candidats fictifs), profils au hasard', () => {
    const { bank } = manyCandidates
    const noRule20: ElectionPack = { ...manyCandidates, election: { ...manyCandidates.election, ranking: undefined } }
    const rand = mulberry32(2026)
    const pick = (qs: Question[], share: number) => qs.filter(() => rand() < share)
    const randomAnswers = (qs: Question[]): Answers =>
      Object.fromEntries(
        qs.map(q => [
          q.id,
          ans(Object.fromEntries(q.approaches.filter(() => rand() < 0.5).map(a => [a.id, (rand() < 0.5 ? 1 : -1) as Rating]))),
        ]),
      )
    const profiles = Array.from({ length: 60 }, (_, i) =>
      randomAnswers(
        i % 3 === 0
          ? bank.questions.filter(q => q.step === 1)
          : i % 3 === 1
            ? bank.questions.filter(q => q.tier === 'essentiel')
            : pick(bank.questions.filter(q => q.tier === 'approfondi'), 0.1),
      ),
    )
    /** Ce que le classement dit de chacun : rang et ex aequo */
    const places = (r: Results) => Object.fromEntries(r.ranking.map(x => [x.candidateId, [x.rank, x.tied]]))

    it('le classement avec la règle est celui des seuls classés, calculé sans la règle', () => {
      let withUnranked = 0
      profiles.forEach((answers, i) => {
        const r = computeResults(manyCandidates, answers, {}, `p${i}`)
        if (r.unranked.length) withUnranked++
        // Partage exact, à la part près
        for (const x of r.ranking) expect(x.coverage).toBeGreaterThanOrEqual(0.5)
        for (const x of r.unranked) expect(x.coverage).toBeLessThan(0.5)
        // Les non classés de l'essai ne sont jamais calculés : ni au classement ni hors classement
        expect([...r.excluded].sort()).toEqual([...EXCLUDED].sort())
        expect(r.ranking.length + r.unranked.length + r.excluded.length).toBe(20)
        const ids = r.ranking.map(x => x.candidateId)
        const ref = computeResults(noRule20, answers, {}, `p${i}`, ids)
        expect(places(r), `profil ${i}`).toEqual(places(ref))
        expect(r.close, `profil ${i}`).toBe(ref.close)
        expect(r.stable, `profil ${i}`).toBe(ref.stable)
        expect(r.allIncompatible).toBe(ref.allIncompatible)
        // Rangs de 1 à n, sans trou laissé par un candidat hors classement
        const ranks = r.ranking.map(x => x.rank)
        expect(ranks[0] ?? 1).toBe(1)
        ranks.forEach((k, j) => expect(k === j + 1 || (j > 0 && k === ranks[j - 1])).toBe(true))
        // Scores identiques avec et sans la règle, pour tous les candidats
        const scores = new Map(computeResults(noRule20, answers, {}, `p${i}`).ranking.map(x => [x.candidateId, x.score]))
        for (const x of [...r.ranking, ...r.unranked]) expect(x.score).toBe(scores.get(x.candidateId))
      })
      // Le test n'est pas vide : la cause unique et des candidats peu connus sortent souvent du classement
      expect(withUnranked).toBeGreaterThan(20)
    })
  })
})

describe('non classés (election.ranking.excluded)', () => {
  const exclusion = { ids: ['c'], reason: 'positions connues sur trop peu de questions', since: '2026-10-07' }
  /** Le pack de test, c non classé (sans règle de couverture) */
  const withOut: ElectionPack = { ...pack, election: { ...pack.election, ranking: { excluded: exclusion } } }
  const all3: Answers = { q1: ans({ q1a: 1, q1c: 1 }), q2: ans({ q2a: 1 }), q3: ans({ q3b: 1 }) }

  it('excludedIds, isExcluded : la liste de l’élection, vide sans décision', () => {
    expect(excludedIds(withOut)).toEqual(['c'])
    expect(isExcluded(withOut, 'c')).toBe(true)
    expect(isExcluded(withOut, 'a')).toBe(false)
    expect(excludedIds(pack)).toEqual([])
  })

  it('ni score ni rang : jamais au classement ni hors classement, listé à part', () => {
    const r = computeResults(withOut, all3, {}, 'seed')
    expect(r.ranking.map(x => x.candidateId).sort()).toEqual(['a', 'b'])
    expect(r.unranked).toEqual([])
    expect(r.excluded).toEqual(['c'])
    expect(r.answered).toBe(3)
    // Sans décision, personne n'est à part
    expect(computeResults(pack, all3, {}, 'seed').excluded).toEqual([])
  })

  it('le classement des autres est exactement celui calculé sans eux : rangs, ex aequo, écart, stabilité, ce qui les sépare', () => {
    const answers = [all3, { q1: ans({ q1c: 1 }), q2: ans({ q2a: -1 }) }, { q3: ans({ q3a: 1, q3b: -1 }) }, {}]
    answers.forEach((a, i) => {
      const r = computeResults(withOut, a, { t2: 2 }, `s${i}`)
      const ref = computeResults(pack, a, { t2: 2 }, `s${i}`, ['a', 'b'])
      const { excluded, ...rest } = r
      const { excluded: none, ...expected } = ref
      expect(excluded).toEqual(['c'])
      expect(none).toEqual([])
      expect(rest, `profil ${i}`).toEqual(expected)
    })
  })

  it('lignes rouges : celles d’un non classé ne comptent nulle part ; « tous concernés » se juge entre classés', () => {
    // Ligne rouge sur q1c, que seul c porte
    const onC = computeResults(withOut, { ...all3, q1: ans({ q1c: -1 }, ['q1c']) }, {}, 'seed')
    expect(onC.ranking.every(x => x.compatible && !x.dealbreakers.length)).toBe(true)
    expect(onC.allIncompatible).toBe(false)
    // Ligne rouge sur q2a, que portent a (principale) et c (compatible) : seul a est concerné, b reste devant
    const onA = computeResults(withOut, { q1: ans({ q1a: 1 }), q2: ans({ q2a: -1 }, ['q2a']) }, {}, 'seed')
    expect(onA.ranking.map(x => [x.candidateId, x.compatible])).toEqual([
      ['b', true],
      ['a', false],
    ])
    expect(onA.allIncompatible).toBe(false)
  })

  it('avec la règle de couverture : un non classé n’est jamais hors classement, la règle vaut pour les autres', () => {
    const both: ElectionPack = {
      ...pack,
      election: { ...pack.election, ranking: { minCoverageShare: 0.5, excluded: { ...exclusion, ids: ['a'] } } },
      positions: { ...pack.positions, c: { q1c: pos(2) } },
    }
    const r = computeResults(both, { q1: ans({ q1c: 1 }), q2: ans({ q2a: 1 }), q3: ans({ q3a: 1 }) }, {}, 'seed')
    expect(r.excluded).toEqual(['a'])
    expect(r.ranking.map(x => x.candidateId)).toEqual(['b'])
    expect(r.unranked.map(x => x.candidateId)).toEqual(['c'])
    expect(r.minCoverageShare).toBe(0.5)
  })

  it('finalistes : seuls les non classés parmi les candidats demandés sont listés', () => {
    expect(computeResults(withOut, all3, {}, 'seed', ['a', 'c'])).toMatchObject({ excluded: ['c'], ranking: [{ candidateId: 'a', rank: 1 }] })
    expect(computeResults(withOut, all3, {}, 'seed', ['a', 'b']).excluded).toEqual([])
  })

  it('sans réponse : listés quand même, rien n’est calculé ; tous non classés : aucun classement', () => {
    const r = computeResults(withOut, {}, {}, 'seed')
    expect(r.excluded).toEqual(['c'])
    expect(r.answered).toBe(0)
    const none = computeResults({ ...pack, election: { ...pack.election, ranking: { excluded: { ...exclusion, ids: ['a', 'b', 'c'] } } } }, all3, {}, 'seed')
    expect(none.ranking).toEqual([])
    expect(none.answered).toBe(3)
    expect(none.excluded.slice().sort()).toEqual(['a', 'b', 'c'])
  })

  it('dans un ordre tiré au hasard (graine), jamais celui du code', () => {
    const many: ElectionPack = { ...pack, election: { ...pack.election, ranking: { excluded: { ...exclusion, ids: ['a', 'b', 'c'] } } } }
    const orders = new Set(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map(s => computeResults(many, all3, {}, s).excluded.join()))
    expect(orders.size).toBeGreaterThan(1)
    expect(computeResults(many, all3, {}, 's1').excluded).toEqual(computeResults(many, all3, {}, 's1').excluded)
  })

  it('knownQuestions : questions où le calcul retient une position (portée ou rejetée), sans les positions probables', () => {
    expect(knownQuestions(pack, 'a')).toBe(3)
    expect(knownQuestions(pack, 'c')).toBe(2)
    // Un rejet explicite suffit ; une position seulement probable ne compte pas
    expect(knownQuestions({ ...pack, positions: { x: { q1a: rej(), q2a: pos(2, { confidence: 'low' }) } } }, 'x')).toBe(1)
    expect(knownQuestions(pack, 'inconnu')).toBe(0)
  })
})
