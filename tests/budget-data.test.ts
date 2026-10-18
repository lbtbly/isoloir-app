// « Faire les comptes » : les leviers générés (src/elections/presidentielle-2027/budget.ts, par tools/build-budget.mjs).
// Chaque fiche est sourcée et datée, se règle autant dans un sens que dans l'autre sans dépasser la plage, et ne nomme
// aucun candidat ni aucun parti ; les leviers sur la même base se répondent.

import { describe, expect, it } from 'vitest'
import { familyOrder, lineSize, reach, sameLine, topOfFamily } from '../src/core/budget/ledger'
import { budget } from '../src/elections/presidentielle-2027/budget'
import { candidates } from '../src/elections/presidentielle-2027/candidates'

const L = budget.levers
const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
const NAMES = [...new Set(candidates.flatMap(c => [c.name.split(' ').slice(1).join(' ') || c.name, c.party?.name ?? '']).filter(n => n.length > 3))].map(slug).filter(n => n.length >= 4)
const names = (text: string) => NAMES.filter(n => new RegExp(`(^|-)${n}(-|$)`).test(slug(text)))

describe('leviers', () => {
  it('le point de départ est le PLF 2027 déposé, sourcé', () => {
    expect(budget.baseline.deficitPct).toBe(5)
    expect(budget.baseline.gdp).toBeGreaterThan(3000)
    expect(budget.baseline.source.url).toMatch(/^https:\/\//)
  })

  it('chaque famille a au moins trois leviers, et des identifiants uniques', () => {
    for (const f of ['impots', 'depenses', 'sociale'] as const) expect(L.filter(l => l.family === f).length).toBeGreaterThanOrEqual(3)
    expect(new Set(L.map(l => l.id)).size).toBe(L.length)
  })

  it('chaque fiche est sourcée, datée et « consultée le »', () => {
    for (const l of L) {
      expect(l.sources.length, l.id).toBeGreaterThan(0)
      for (const s of l.sources) {
        expect(s.url, l.id).toMatch(/^https:\/\//)
        expect(s.accessedAt, l.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        expect(s.date, l.id).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/)
        expect(s.figure.length, l.id).toBeGreaterThan(0)
      }
    }
  })

  it('une fourchette dans l’ordre, une plage symétrique autour du PLF, des crans dedans, un pas qui y tombe juste', () => {
    for (const l of L) {
      if (l.kind === 'options') {
        expect(l.options!.filter(o => o.base).length, l.id).toBe(1)
        for (const o of l.options!) expect(o.lo, `${l.id} ${o.id}`).toBeLessThanOrEqual(o.hi)
        continue
      }
      expect(l.perUnit.lo, l.id).toBeGreaterThan(0)
      expect(l.perUnit.lo, l.id).toBeLessThanOrEqual(l.perUnit.hi)
      expect(l.notches, l.id).toContain(0)
      for (const n of l.notches) expect(Math.abs(n), l.id).toBeLessThanOrEqual(l.max + 1e-9)
      const sorted = [...l.notches].sort((a, b) => a - b)
      expect(sorted.map(n => -n + 0).reverse(), l.id).toEqual(sorted.map(n => n + 0))
      expect(Math.abs(l.max / l.step - Math.round(l.max / l.step)), l.id).toBeLessThan(1e-6)
    }
  })

  it('aucun texte ni aucune source ne nomme un candidat ou un parti', () => {
    for (const l of L) {
      const options = (l.options ?? []).map(o => `${o.label} ${o.note ?? ''}`).join(' ')
      expect(names(`${l.label} ${l.today} ${l.limits} ${l.laterNote ?? ''} ${l.unit.label} ${l.amount?.label ?? ''} ${options}`), l.id).toEqual([])
      for (const s of [...l.sources, ...(l.base ? [l.base.source] : [])]) expect(names(`${s.title} ${s.url} ${s.publisher} ${s.figure}`), `${l.id} ${s.url}`).toEqual([])
      if (l.base) expect(names(l.base.label), l.id).toEqual([])
    }
  })

  it('les leviers sur la même base se répondent, et existent', () => {
    const ids = new Set(L.map(l => l.id))
    for (const l of L)
      for (const o of l.exclusiveWith) {
        expect(ids.has(o), `${l.id} → ${o}`).toBe(true)
        expect(L.find(x => x.id === o)!.exclusiveWith, `${o} ← ${l.id}`).toContain(l.id)
      }
  })

  it('les recoupements partiels se répondent, existent, et ne sont jamais aussi exclusifs', () => {
    const ids = new Set(L.map(l => l.id))
    for (const l of L)
      for (const o of l.overlapsWith ?? []) {
        expect(ids.has(o), `${l.id} → ${o}`).toBe(true)
        expect(L.find(x => x.id === o)!.overlapsWith ?? [], `${o} ← ${l.id}`).toContain(l.id)
        expect(l.exclusiveWith, `${l.id} ~ ${o}`).not.toContain(o)
      }
  })

  it('chaque levier a la taille de sa ligne, sauf ceux que leurs sources ne chiffrent que par emploi', () => {
    for (const l of L) if (!l.base) expect(l.unit.label, l.id).toMatch(/emplois|appelés/)
  })

  it('les rayons : trois premiers par famille, trois lignes distinctes, de la plus grosse ligne à la plus petite', () => {
    for (const f of ['impots', 'depenses', 'sociale'] as const) {
      const top = topOfFamily(L, f)
      expect(top.length).toBe(3)
      for (const a of top) for (const b of top) if (a !== b) expect(a.exclusiveWith).not.toContain(b.id)
      for (const a of top) for (const b of top) if (a !== b) expect(sameLine(a, b), `${a.id} = ${b.id}`).toBe(false)
      const order = familyOrder(L, f)
      for (let i = 1; i < order.length; i++) {
        const [a, b] = [order[i - 1]!, order[i]!]
        expect(lineSize(a)).toBeGreaterThanOrEqual(lineSize(b))
        if (lineSize(a) === lineSize(b)) expect(reach(a)).toBeGreaterThanOrEqual(reach(b))
      }
    }
  })
})
