// « À table » : le dépouillement d'une table (core/table/count.ts). Les totaux ne gardent que des compteurs, la
// table d'une question, ce sont ses bulletins exprimés, rien n'est montré sous K_MIN bulletins, et aucun nombre exact
// n'est écrit aux deux bouts. Les verdicts suivent les règles publiées.

import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/core/rng'
import { addBallot, emptyTotals, K_MIN, shown, summarize, verdictOf, type TableBallot, type Totals } from '../src/core/table/count'
import type { Answer, Question, Rating } from '../src/core/types'
import { elections } from '../src/elections/all'

const pack = elections[0]!
const questions = pack.bank.questions.filter(q => q.tier === 'essentiel').slice(0, 3)

/** Une réponse : avis par approche (index → avis), lignes rouges par index */
function answer(q: Question, ratings: Record<number, Rating>, red: number[] = []): Answer {
  const r: Answer['ratings'] = {}
  for (const [i, v] of Object.entries(ratings)) r[q.approaches[Number(i)]!.id] = v
  for (const i of red) r[q.approaches[i]!.id] = -1
  return { ratings: r, redLines: red.map(i => q.approaches[i]!.id) }
}

function table(ballots: TableBallot[]): Totals {
  return ballots.reduce((t, b) => addBallot(t, questions, b), emptyTotals(questions))
}

describe('totaux', () => {
  it('un bulletin sans avis sur une question la passe ; avec avis, il est exprimé', () => {
    const [q] = questions
    const t = table([{ [q!.id]: answer(q!, { 0: 1 }) }, { [q!.id]: { ratings: {}, redLines: [] } }, {}])
    expect(t[q!.id]!.expressed).toBe(1)
    expect(t[q!.id]!.passed).toBe(2)
  })

  it('une ligne rouge compte en « pas d’accord » et en ligne rouge', () => {
    const [q] = questions
    const t = table([{ [q!.id]: answer(q!, {}, [2]) }])
    const c = t[q!.id]!.byApproach[q!.approaches[2]!.id]!
    expect(c).toEqual({ agree: 0, neutral: 0, disagree: 1, redLines: 1 })
  })

  it('sur 1 000 tables tirées au hasard, les comptes de chaque idée font le nombre de bulletins exprimés', () => {
    const rnd = mulberry32(2027)
    for (let k = 0; k < 1000; k++) {
      const people = 4 + Math.floor(rnd() * 9)
      const ballots: TableBallot[] = Array.from({ length: people }, () =>
        Object.fromEntries(
          questions.map(q => {
            if (rnd() < 0.2) return [q.id, undefined]
            const ratings: Record<number, Rating> = {}
            q.approaches.forEach((_, i) => {
              const x = rnd()
              if (x < 0.3) ratings[i] = 1
              else if (x < 0.6) ratings[i] = -1
            })
            return [q.id, answer(q, ratings, rnd() < 0.15 ? [Math.floor(rnd() * q.approaches.length)] : [])]
          }),
        ),
      )
      const t = table(ballots)
      for (const q of questions) {
        const qt = t[q.id]!
        expect(qt.expressed + qt.passed).toBe(people)
        for (const a of q.approaches) {
          const c = qt.byApproach[a.id]!
          expect(c.agree + c.neutral + c.disagree).toBe(qt.expressed)
          expect(c.redLines).toBeLessThanOrEqual(c.disagree)
        }
      }
    }
  })
})

describe('secret à petit effectif', () => {
  it('aucun nombre exact aux deux bouts, de 4 à 12 bulletins exprimés', () => {
    for (let n = 4; n <= 12; n++)
      for (let c = 0; c <= n; c++) {
        const s = shown(c, n)
        if (c <= 1) expect(s).toEqual({ words: 'peu' })
        else if (c >= n - 1) expect(s).toEqual({ words: 'presque-tous' })
        else expect(s).toEqual({ exact: c })
      }
  })

  it(`une question de moins de ${K_MIN} bulletins exprimés n’est pas dépouillée`, () => {
    const [q] = questions
    const few = table(Array.from({ length: K_MIN - 1 }, () => ({ [q!.id]: answer(q!, { 0: 1 }) })))
    const s = summarize(few, questions, 'graine')
    expect(s.hidden).toContain(q!.id)
    expect([...s.ideas, ...s.quiet].some(i => i.questionId === q!.id)).toBe(false)
    const enough = table(Array.from({ length: K_MIN }, () => ({ [q!.id]: answer(q!, { 0: 1 }) })))
    expect(summarize(enough, questions, 'graine').hidden).not.toContain(q!.id)
  })

  it('l’ordre de lecture ne distingue pas l’unanimité de « toute la table ou presque »', () => {
    const [q] = questions
    // 6 bulletins : idée 0 d'accord à 6, idée 1 d'accord à 5 ; même mot, même force
    const ballots: TableBallot[] = Array.from({ length: 6 }, (_, i) => ({ [q!.id]: answer(q!, (i < 5 ? { 0: 1, 1: 1 } : { 0: 1 }) as Record<number, Rating>) }))
    const s = summarize(table(ballots), [q!], 'graine')
    const [x, y] = s.ideas.filter(i => i.verdict === 'reunit')
    expect(x!.strength).toBe(y!.strength)
    // L'ordre entre les deux dépend de la graine, pas des comptes cachés
    const orders = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(g => summarize(table(ballots), [q!], g).ideas[0]!.approachId))
    expect(orders.size).toBe(2)
  })
})

describe('verdicts', () => {
  it('suivent les règles publiées', () => {
    const t = (agree: number, disagree: number, n: number) => ({ agree, disagree, neutral: n - agree - disagree, redLines: 0 })
    expect(verdictOf(t(4, 1, 6), 6)).toBe('reunit')
    expect(verdictOf(t(3, 1, 6), 6)).toBe('aucun')
    expect(verdictOf(t(4, 2, 6), 6)).toBe('divise')
    expect(verdictOf(t(1, 4, 6), 6)).toBe('refuse')
    expect(verdictOf(t(2, 4, 6), 6)).toBe('divise')
    expect(verdictOf(t(0, 0, 4), 4)).toBe('aucun')
    expect(verdictOf(t(3, 0, 4), 4)).toBe('reunit')
  })

  it('l’ordre de lecture : ce qui réunit, puis ce que la table refuse, puis ce qui divise', () => {
    const [q] = questions
    const ballots: TableBallot[] = [
      { [q!.id]: answer(q!, { 0: 1, 1: -1, 2: 1 }) },
      { [q!.id]: answer(q!, { 0: 1, 1: -1, 2: -1 }) },
      { [q!.id]: answer(q!, { 0: 1, 1: -1, 2: 1 }) },
      { [q!.id]: answer(q!, { 0: 1, 1: -1, 2: -1 }) },
    ]
    const s = summarize(table(ballots), [q!], 'graine')
    expect(s.ideas.map(i => i.verdict)).toEqual(['reunit', 'refuse', 'divise'])
    expect(s.ideas.map(i => i.approachId)).toEqual([0, 1, 2].map(i => q!.approaches[i]!.id))
  })
})

describe('vivier des sujets', () => {
  it('une question du questionnaire rapide par thème au plus, qui respecte la règle', async () => {
    const { tablePool } = await import('../src/core/table/subjects')
    const { stanceMark } = await import('../src/core/carriers')
    const pool = tablePool(pack)
    console.info(`À table, vivier de ${pack.election.id} : ${pool.length} sujets : ${pool.map(q => q.id).join(', ')}`)
    expect(pool.length).toBeGreaterThanOrEqual(4)
    expect(new Set(pool.map(q => q.topicId)).size).toBe(pool.length)
    const need = Math.ceil((pack.election.checks?.quick?.minKnownShare ?? 0.75) * pack.candidates.length - 1e-9)
    for (const q of pool) {
      expect(q.tier).toBe('essentiel')
      const known = pack.candidates.filter(c => q.approaches.some(a => stanceMark(pack.positions[c.id]?.[a.id]))).length
      expect(known, q.id).toBeGreaterThanOrEqual(need)
    }
  })

  it('le tirage par défaut est reproductible avec la graine et donne des sujets distincts', async () => {
    const { drawSubjects, tablePool } = await import('../src/core/table/subjects')
    const pool = tablePool(pack)
    const a = drawSubjects(pool, 'séance', 2)
    expect(a.map(q => q.id)).toEqual(drawSubjects(pool, 'séance', 2).map(q => q.id))
    expect(new Set(a.map(q => q.id)).size).toBe(2)
  })
})
