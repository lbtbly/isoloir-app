// « Faire les comptes » : le calcul (core/budget/ledger.ts) et l'écriture des nombres (core/budget/copy.ts). Des
// fourchettes toujours dans l'ordre, des effets qui suivent le réglage, deux leviers sur la même base jamais comptés
// ensemble, et des nombres affichés qui contiennent toujours ce qui est calculé.

import { describe, expect, it } from 'vitest'
import { md, mdPublished, pct, settingLabel } from '../src/core/budget/copy'
import { applySetting, balanceEffect, clampValue, deficitRange, goalGap, topOfFamily, totals, type Settings } from '../src/core/budget/ledger'
import type { Lever } from '../src/core/budget/types'
import { mulberry32 } from '../src/core/rng'

const base = { deficitPct: 5, gdp: 3135 }
const L = (over: Partial<Lever> & Pick<Lever, 'id'>): Lever => ({
  family: 'impots',
  label: over.id,
  today: '',
  kind: 'linear',
  direction: 'recette',
  unit: { label: '1 point', short: 'pt' },
  perUnit: { lo: 1, hi: 2 },
  max: 1,
  step: 0.1,
  notches: [-1, -0.5, 0, 0.5, 1],
  baseLabel: 'PLF',
  exclusiveWith: [],
  operatorCaveat: false,
  limits: '',
  sources: [],
  ...over,
})
const LEVERS: Lever[] = [
  L({ id: 'tva-tous', perUnit: { lo: 11, hi: 13.7 }, exclusiveWith: ['tva-normal'] }),
  L({ id: 'tva-normal', perUnit: { lo: 7.5, hi: 8.9 }, exclusiveWith: ['tva-tous'] }),
  L({ id: 'csg', perUnit: { lo: 12.3, hi: 18 } }),
  L({ id: 'defense', family: 'depenses', direction: 'depense', unit: { label: '0,1 point de PIB', short: 'pt' }, perUnit: { lo: 3, hi: 3.1 }, max: 3, step: 1, notches: [-3, -1, 0, 1, 3] }),
  L({ id: 'chomage', family: 'sociale', direction: 'depense', unit: { label: '1 %', short: '%' }, perUnit: { lo: 0.387, hi: 0.387 }, max: 20, step: 1, notches: [-20, -10, 0, 10, 20] }),
  L({
    id: 'age',
    family: 'sociale',
    direction: 'depense',
    kind: 'options',
    options: [
      { id: '62', label: '62 ans', lo: 1.2, hi: 1.4 },
      { id: 'suspension', label: 'Suspension', lo: 0, hi: 0, base: true },
      { id: '64', label: '64 ans dès 2027', lo: -0.9, hi: -0.7 },
    ],
  }),
]

function random(seed: number): Settings {
  const r = mulberry32(seed)
  const s: Record<string, number | string> = {}
  for (const l of LEVERS) {
    if (r() < 0.4) continue
    if (l.kind === 'options') s[l.id] = l.options![Math.floor(r() * l.options!.length)]!.id
    else s[l.id] = clampValue(l, (r() * 2 - 1) * l.max)
  }
  return s
}

describe('calcul', () => {
  it('les fourchettes restent dans l’ordre, pour le solde comme pour le déficit', () => {
    for (let k = 0; k < 1000; k++) {
      const t = totals(LEVERS, random(k))
      expect(t.all.lo).toBeLessThanOrEqual(t.all.hi + 1e-9)
      const d = deficitRange(base, t.all)
      expect(d.lo).toBeLessThanOrEqual(d.hi + 1e-9)
      for (const f of Object.values(t.byFamily)) expect(f.lo).toBeLessThanOrEqual(f.hi + 1e-9)
    }
  })

  it('une recette en plus réduit le déficit, une dépense en plus le creuse ; l’effet suit le réglage', () => {
    const [tva] = LEVERS
    const def = LEVERS[3]!
    expect(balanceEffect(tva!, 1)).toEqual({ lo: 11, hi: 13.7 })
    expect(balanceEffect(tva!, -0.5)).toEqual({ lo: -6.85, hi: -5.5 })
    expect(balanceEffect(def, -1)).toEqual({ lo: 3, hi: 3.1 })
    let prev = -Infinity
    for (let v = -1; v <= 1.0001; v += 0.1) {
      const e = balanceEffect(tva!, clampValue(tva!, v))
      expect(e.lo).toBeGreaterThanOrEqual(prev - 1e-9)
      prev = e.lo
    }
  })

  it('le PLF est le point de départ : rien de réglé, rien de changé', () => {
    const t = totals(LEVERS, { age: 'suspension', csg: 0 })
    expect(t.count).toBe(0)
    expect(deficitRange(base, t.all)).toEqual({ lo: 5, hi: 5 })
  })

  it('un levier se règle dans sa plage, au pas du curseur, jamais au-delà', () => {
    const tva = LEVERS[0]!
    expect(clampValue(tva, 1.7)).toBe(1)
    expect(clampValue(tva, -0.34)).toBe(-0.3)
    expect(clampValue(tva, 0.6000000001)).toBe(0.6)
  })

  it('deux leviers sur la même base ne comptent jamais ensemble : le second remet le premier au PLF', () => {
    const a = applySetting(LEVERS, {}, 'tva-tous', 1)
    const b = applySetting(LEVERS, a.settings, 'tva-normal', 0.5)
    expect(b.settings).toEqual({ 'tva-normal': 0.5 })
    expect(b.reset).toEqual(['tva-tous'])
    expect(applySetting(LEVERS, b.settings, 'tva-normal', 0).settings).toEqual({})
  })

  it('l’objectif : atteint selon toutes les sources, une partie, ou pas encore', () => {
    const need = ((5 - 3) * 3135) / 100
    expect(goalGap(base, { lo: need + 1, hi: need + 2 }, 3).state).toBe('reached')
    expect(goalGap(base, { lo: need - 1, hi: need + 2 }, 3).state).toBe('partly')
    expect(goalGap(base, { lo: 10, hi: 12 }, 3)).toEqual({ state: 'missing', missing: { lo: need - 12, hi: need - 10 } })
    expect(goalGap(base, { lo: 10, hi: 12 }, null).state).toBe('none')
  })

  it('les 3 premiers d’un rayon : le plus grand effet atteignable, sans deux leviers sur la même base', () => {
    expect(topOfFamily(LEVERS, 'impots').map(l => l.id)).toEqual(['csg', 'tva-tous'])
    expect(topOfFamily(LEVERS, 'sociale').map(l => l.id)).toEqual(['chomage', 'age'])
  })
})

describe('écriture des nombres', () => {
  it('un montant publié s’arrondit au plus près, pas vers l’extérieur : c’est le chiffre de la source', () => {
    expect(mdPublished({ lo: 58.516, hi: 58.516 })).toBe('58,5\u202fMd€')
    expect(mdPublished({ lo: 1.315, hi: 1.315 })).toBe('1,3\u202fMd€')
    expect(mdPublished({ lo: 0.3, hi: 0.4 })).toBe('0,30 à 0,40\u202fMd€')
    expect(md({ lo: 58.516, hi: 58.516 })).toBe('58,6\u202fMd€')
  })

  it('arrondie vers l’extérieur : le nombre affiché contient le nombre calculé', () => {
    const r = mulberry32(3)
    for (let k = 0; k < 500; k++) {
      const a = (r() - 0.5) * 100
      const b = a + r() * 20
      const text = md({ lo: a, hi: b }).replace(/\u202f/g, ' ')
      const nums = [...text.matchAll(/[−-]?\d+(?:,\d+)?/g)].map(m => Number(m[0].replace('−', '-').replace(',', '.')))
      expect(nums[0]!).toBeLessThanOrEqual(a + 0.05)
      expect(nums.at(-1)!).toBeGreaterThanOrEqual(b - 0.05)
    }
    expect(pct({ lo: 4.201, hi: 4.324 })).toBe('4,2 à 4,4\u202f%')
    expect(md({ lo: 11, hi: 13.7 }, { sign: true })).toBe('+11,0 à +13,7\u202fMd€')
    expect(md({ lo: -3.1, hi: -3 }, { sign: true })).toBe('−3,1 à −3,0\u202fMd€')
  })

  it('les réglages en clair, avec leur unité', () => {
    expect(settingLabel(LEVERS[0]!, 0.6)).toBe('+0,6 point')
    expect(settingLabel(LEVERS[0]!, -1)).toBe('−1 point')
    expect(settingLabel(LEVERS[4]!, -10)).toBe('−10\u202f%')
    expect(settingLabel(LEVERS[3]!, -1)).toBe('−0,1 point de PIB')
    expect(settingLabel(L({ id: 'x', unit: { label: '10 000 emplois', short: 'emplois' } }), -3)).toBe('−30\u202f000 emplois')
  })
})
