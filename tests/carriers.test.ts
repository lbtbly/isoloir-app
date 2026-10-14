// La lecture des positions partagée par « Qui porte quoi » et la révélation de la table (core/carriers.ts) : la même
// règle que le calcul (une position de confiance faible ne marque rien), chaque candidat montré quelque part, et le
// titre des points d'accord, qui ne doit pas promettre l'unanimité quand les textes disent « la plupart ».

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { holdersOf, stanceMark, unknownOf } from '../src/core/carriers'
import type { Position } from '../src/core/types'
import { elections } from '../src/elections/all'

const pos = (p: Partial<Position>): Position => ({ weight: 2, nature: 'proposition', confidence: 'high', summary: '', sources: [], ...p }) as Position

describe('stanceMark', () => {
  it('principale, compatible, rejet ; rien sans position ou de confiance faible', () => {
    expect(stanceMark(pos({ weight: 2 }))).toBe('main')
    expect(stanceMark(pos({ weight: 1 }))).toBe('secondary')
    expect(stanceMark(pos({ weight: undefined, rejects: true }))).toBe('rejects')
    expect(stanceMark(pos({ weight: 2, confidence: 'low' }))).toBeNull()
    expect(stanceMark(pos({ weight: undefined }))).toBeNull()
    expect(stanceMark(undefined)).toBeNull()
  })
})

for (const pack of elections) {
  describe(`porteurs : ${pack.election.id}`, () => {
    it('sur chaque question, chaque candidat porte ou rejette une approche, ou figure parmi les inconnus', () => {
      for (const q of pack.bank.questions) {
        const seen = new Set<string>()
        for (const a of q.approaches) for (const h of holdersOf(a, pack.candidates, pack.positions)) seen.add(h.c.id)
        const unknown = unknownOf(q, pack.candidates, pack.positions)
        for (const c of unknown) expect(seen.has(c.id), `${q.id} : ${c.id} à la fois porteur et inconnu`).toBe(false)
        expect(seen.size + unknown.length, q.id).toBe(pack.candidates.length)
      }
    })

    it('les porteurs gardent l’ordre des candidats reçu (mélangé par l’écran)', () => {
      const people = [...pack.candidates].reverse()
      const q = pack.bank.questions[0]!
      for (const a of q.approaches) {
        const ids = holdersOf(a, people, pack.positions).map(h => h.c.id)
        expect(ids).toEqual(people.map(c => c.id).filter(id => ids.includes(id)))
      }
    })

    it('le titre des points d’accord ne dit pas « tous » quand un point dit « la plupart »', () => {
      const partial = (pack.bank.consensus ?? []).some(c => /plupart|presque|quasi|majorit|qui se sont exprimés|minorité/i.test(c.text))
      const screen = readFileSync(resolve(__dirname, '../src/ui/screens/Proximity.tsx'), 'utf8')
      const title = /<h2 id="consensus-title">([^<]*)<\/h2>/.exec(screen)?.[1] ?? ''
      expect(title).not.toBe('')
      if (partial) expect(title).not.toMatch(/\btous\b/i)
    })
  })
}
