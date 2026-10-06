import { describe, expect, it } from 'vitest'
import { withRating, withRedLine } from '../src/core/answers'
import { computeResults, dealbreakerLevel, effectiveWeight, questionScore } from '../src/core/score'
import { seededShuffle } from '../src/core/rng'
import type { Answer, Answers, Rating } from '../src/core/types'
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
