// « Faire les comptes » relié aux réponses : les marques et le pré-réglage (décision du 18 octobre 2026)
import { describe, expect, it } from 'vitest'
import { estimatedEffect, leverChange, totals } from '../src/core/budget/ledger'
import { presets, readLevers } from '../src/core/budget/links'
import type { Lever, LeverLink } from '../src/core/budget/types'
import type { Answers } from '../src/core/types'

const linear = (id: string, extra: Partial<Lever> = {}) =>
  ({ id, family: 'impots', label: id, today: '', kind: 'linear', direction: 'recette', unit: { label: '1 point', short: 'pt' }, perUnit: { lo: 10, hi: 12 }, max: 1, step: 0.1, notches: [-1, -0.5, 0, 0.5, 1], baseLabel: 'PLF', exclusiveWith: [], operatorCaveat: false, limits: '', sources: [], ...extra }) as unknown as Lever
const options = (id: string) =>
  ({ ...linear(id), kind: 'options', options: [{ id: 'plf', label: 'PLF', lo: 0, hi: 0, base: true }, { id: 'ans-62', label: '62 ans', lo: 1, hi: 2 }] }) as unknown as Lever
const link = (approach: string, lever: string, dir: 1 | -1, setting: number | string = 'dir'): LeverLink => ({ approach, question: approach.replace(/-[a-z]+$/, ''), lever, dir, setting, fit: setting === 'dir' ? 'direction' : 'exact' })

describe('réponses reliées aux leviers', () => {
  const levers = [linear('tva'), linear('ir'), options('age')]
  const links = [link('q1-a', 'tva', 1, 2), link('q1-b', 'tva', -1), link('q2-a', 'ir', 1, 1), link('q2-b', 'ir', 1, 0.5), link('q3-a', 'age', -1, 'ans-62')]

  it('marque chaque réponse donnée, et rien sans avis', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': 1 }, redLines: [] } }
    const r = readLevers(levers, links, answers)
    expect(Object.keys(r)).toEqual(['tva'])
    expect(r.tva!.marks).toEqual([{ approach: 'q1-a', question: 'q1', stance: 'agree', dir: 1, setting: 2 }])
  })

  it('pré-règle dans le sens approuvé, sans dépasser la borne, au plus modéré des réglages approuvés', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': 1, 'q1-b': -1 }, redLines: [] }, q2: { ratings: { 'q2-a': 1, 'q2-b': 1 }, redLines: [] }, q3: { ratings: { 'q3-a': 1 }, redLines: [] } }
    const p = presets(readLevers(levers, links, answers))
    // +2 points voulus, la plage chiffrée s'arrête à +1 (sans estimation au-delà) ; +1 et +0,5 approuvés : le plus modéré
    expect(p).toEqual({ tva: 1, ir: 0.5, age: 'ans-62' })
  })

  it('un levier à réglages pré-réglé par le sens seul prend le réglage le plus proche du PLF dans ce sens', () => {
    const age = { ...options('age'), options: [{ id: 'plf', label: 'PLF', lo: 0, hi: 0, base: true }, { id: 'ans-62', label: '62 ans', lo: 1, hi: 2 }, { id: 'ans-60', label: '60 ans', lo: 4, hi: 6 }, { id: 'ans-65', label: '65 ans', lo: -3, hi: -2 }] } as unknown as Lever
    const answers: Answers = { q9: { ratings: { 'q9-a': 1 }, redLines: [] } }
    expect(presets(readLevers([age], [link('q9-a', 'age', 1)], answers))).toEqual({ age: 'ans-62' })
    expect(presets(readLevers([age], [link('q9-a', 'age', -1)], answers))).toEqual({ age: 'ans-65' })
  })

  it('deux leviers sur la même base ne sont pas pré-réglés ensemble : la fiche le dit, aucun ordre ne choisit', () => {
    const a = linear('def', { exclusiveWith: ['sn'] })
    const b = linear('sn', { exclusiveWith: ['def'] })
    const answers: Answers = { q1: { ratings: { 'q1-a': 1 }, redLines: [] }, q2: { ratings: { 'q2-a': 1 }, redLines: [] } }
    const r = readLevers([a, b], [link('q1-a', 'def', 1), link('q2-a', 'sn', 1)], answers)
    expect(presets(r)).toEqual({})
    expect(r.def!.sameBase).toEqual(['sn'])
    expect(r.sn!.sameBase).toEqual(['def'])
  })

  it('une approche aux seuls liens partiels pré-règle d’un cran le levier de la plus grosse ligne, et marque les autres', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': 1 }, redLines: [] } }
    const big = linear('ir', { base: { value: 100, label: '', source: { title: '', publisher: '', url: '' } } })
    const small = linear('ifi', { base: { value: 3, label: '', source: { title: '', publisher: '', url: '' } } })
    const ls: LeverLink[] = [{ ...link('q1-a', 'ifi', 1, 2), fit: 'partial' }, { ...link('q1-a', 'ir', 1, 2), fit: 'partial' }]
    const r = readLevers([big, small], ls, answers)
    expect(r.ir!.marks[0]!.main).toBe(true)
    expect(r.ifi!.marks[0]!.partial).toBe(true)
    // D'un cran (le sens seul), pas de la taille dite par le lien partiel
    expect(presets(r)).toEqual({ ir: 0.5 })
  })

  it('une approche qui a un lien exact ou de sens ne promeut aucun lien partiel', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': 1 }, redLines: [] } }
    const ls: LeverLink[] = [link('q1-a', 'tva', 1, 1), { ...link('q1-a', 'ir', 1), fit: 'partial' }]
    expect(presets(readLevers([linear('tva'), linear('ir')], ls, answers))).toEqual({ tva: 1 })
  })

  it('un réglage qui retombe sur le PLF ne pré-règle rien', () => {
    const answers: Answers = { q2: { ratings: { 'q2-b': 1 }, redLines: [] } }
    expect(presets(readLevers([linear('ir', { step: 1, notches: [-1, 0, 1] })], [link('q2-b', 'ir', 1, 0.4)], answers))).toEqual({})
  })

  it('des réponses contraires, ou une ligne rouge dans le sens approuvé : marque, pas de pré-réglage', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': 1, 'q1-b': 1 }, redLines: [] }, q2: { ratings: { 'q2-a': 1, 'q2-b': -1 }, redLines: ['q2-b'] } }
    const r = readLevers(levers, links, answers)
    expect(r.tva!.split).toBe(true)
    expect(r.tva!.preset).toBeUndefined()
    expect(r.ir!.split).toBe(true)
    expect(r.ir!.marks.map(m => m.stance)).toEqual(['agree', 'red'])
  })

  it('un désaccord ou une ligne rouge seuls ne règlent rien', () => {
    const answers: Answers = { q1: { ratings: { 'q1-a': -1 }, redLines: ['q1-a'] } }
    expect(presets(readLevers(levers, links, answers))).toEqual({})
  })
})

describe('au-delà de la plage chiffrée', () => {
  const l = linear('tva', { stretch: { max: 4, perUnit: { lo: 6, hi: 11 }, why: '' } })

  it('ajoute l’effet estimé de chaque unité en plus, et le compte à part', () => {
    expect(leverChange(l, 1)).toEqual({ lo: 10, hi: 12 })
    expect(leverChange(l, 3)).toEqual({ lo: 10 + 2 * 6, hi: 12 + 2 * 11 })
    expect(leverChange(l, -3)).toEqual({ lo: -(12 + 2 * 11), hi: -(10 + 2 * 6) })
    expect(estimatedEffect(l, 1)).toEqual({ lo: 0, hi: 0 })
    expect(estimatedEffect(l, 3)).toEqual({ lo: 12, hi: 22 })
    expect(totals([l], { tva: 3 }).estimated).toEqual({ lo: 12, hi: 22 })
  })

  it('un levier estimé compte tout entier dans la part estimée', () => {
    const e = linear('zucman', { estimate: { method: 'assiette × taux' } })
    expect(estimatedEffect(e, 0.5)).toEqual({ lo: 5, hi: 6 })
  })
})
