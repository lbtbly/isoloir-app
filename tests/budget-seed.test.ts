// « Faire les comptes » : l'amorce du budget (core/budget/seed.ts). Seul un « d'accord » hors ligne rouge amorce ;
// deux idées qui s'excluent sont à trancher, jamais choisies ; un même réglage ne compte qu'une fois ; mêmes réponses,
// même amorce.

import { describe, expect, it } from 'vitest'
import { seedBudget } from '../src/core/budget/seed'
import type { BudgetEntry, BudgetMap } from '../src/core/budget/types'
import { mulberry32 } from '../src/core/rng'
import type { Answers, Question } from '../src/core/types'

const q = (id: string, n: number) => ({ id, approaches: Array.from({ length: n }, (_, i) => ({ id: `${id}-${'abcdefgh'[i]}` })) }) as unknown as Question
const QS = [q('retraites-1', 3), q('fiscalite-1', 2), q('travail-1', 2), q('travail-2', 2)]

const e = (over: Partial<BudgetEntry>): BudgetEntry => ({ status: 'chiffrable', lever: null, setting: null, deficit: 'creuse', sign: 'depense+', kind: null, excludes: [], ...over })
const MAP: BudgetMap = {
  'retraites-1-a': e({ lever: 'age', setting: '60 ans', kind: 'exclusif', excludes: ['retraites-1-b', 'retraites-1-c'] }),
  'retraites-1-b': e({ lever: 'age', setting: '62 ans', kind: 'exclusif', excludes: ['retraites-1-a', 'retraites-1-c'] }),
  'retraites-1-c': e({ lever: 'age', setting: '65 ans', kind: 'exclusif', deficit: 'reduit', sign: 'depense-', excludes: ['retraites-1-a', 'retraites-1-b'] }),
  'fiscalite-1-a': e({ status: 'a-regler', lever: 'ir-tranche-haute', sign: 'recette+', deficit: 'reduit', kind: 'reglable' }),
  'fiscalite-1-b': e({ status: 'non-chiffre', deficit: 'incertain', sign: 'incertain' }),
  'travail-1-a': e({ lever: 'heures-sup', setting: 'exoneration', sign: 'recette-' }),
  'travail-1-b': e({ status: 'a-regler', lever: 'ir-tranche-haute', sign: 'recette-', deficit: 'creuse', kind: 'reglable' }),
  'travail-2-a': e({ lever: 'heures-sup', setting: 'exoneration', sign: 'recette-' }),
  'travail-2-b': e({ status: 'sans-effet', deficit: 'aucun', sign: 'aucun' }),
}

const agree = (...ids: string[]): Answers => {
  const out: Answers = {}
  for (const id of ids) {
    const qid = id.slice(0, id.lastIndexOf('-'))
    out[qid] ??= { ratings: {}, redLines: [] }
    out[qid].ratings[id] = 1
  }
  return out
}

describe('amorce', () => {
  it("seul un « d'accord » hors ligne rouge amorce", () => {
    expect(seedBudget(QS, {}, MAP)).toEqual({ priced: [], open: [], unpriced: [], conflicts: [] })
    const none: Answers = { 'retraites-1': { ratings: { 'retraites-1-a': -1, 'retraites-1-b': -1 }, redLines: ['retraites-1-b'] } }
    expect(seedBudget(QS, none, MAP).priced).toEqual([])
    const red: Answers = { 'retraites-1': { ratings: { 'retraites-1-a': 1 }, redLines: ['retraites-1-a'] } }
    expect(seedBudget(QS, red, MAP).priced).toEqual([])
    expect(seedBudget(QS, agree('retraites-1-b'), MAP).priced.map(l => l.setting)).toEqual(['62 ans'])
  })

  it("deux idées qui s'excluent sont à trancher, sans choix à la place de la personne", () => {
    const s = seedBudget(QS, agree('retraites-1-a', 'retraites-1-c'), MAP)
    expect(s.priced).toEqual([])
    expect(s.conflicts).toEqual([{ questionId: 'retraites-1', lever: 'age', approachIds: ['retraites-1-a', 'retraites-1-c'] }])
  })

  it('un même réglage venu de deux questions ne compte qu’une fois', () => {
    const s = seedBudget(QS, agree('travail-1-a', 'travail-2-a'), MAP)
    expect(s.priced).toHaveLength(1)
    expect(s.priced[0]!.approachIds).toEqual(['travail-1-a', 'travail-2-a'])
  })

  it('un levier à régler poussé dans les deux sens est à trancher ; sans effet ne crée rien', () => {
    const s = seedBudget(QS, agree('fiscalite-1-a', 'travail-1-b', 'travail-2-b', 'fiscalite-1-b'), MAP)
    expect(s.open).toEqual([])
    expect(s.conflicts).toEqual([{ questionId: null, lever: 'ir-tranche-haute', approachIds: ['fiscalite-1-a', 'travail-1-b'] }])
    expect(s.unpriced.map(l => l.approachIds)).toEqual([['fiscalite-1-b']])
  })

  it('mêmes réponses, même amorce ; les réponses ne sont pas modifiées', () => {
    const rand = mulberry32(7)
    const ids = Object.keys(MAP)
    for (let k = 0; k < 200; k++) {
      const answers = agree(...ids.filter(() => rand() < 0.4))
      const before = JSON.stringify(answers)
      expect(seedBudget(QS, answers, MAP)).toEqual(seedBudget(QS, answers, MAP))
      expect(JSON.stringify(answers)).toBe(before)
    }
  })
})
