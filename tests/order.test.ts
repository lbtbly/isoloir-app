import { describe, expect, it } from 'vitest'
import { firstStepSize, orderedQuestions } from '../src/core/order'
import { elections } from '../src/elections'

for (const pack of elections) {
  const { bank } = pack
  const seeds = Array.from({ length: 200 }, (_, i) => i.toString(16).padStart(16, '0'))

  describe(`pack ${pack.election.id} : ordre des questions`, () => {
    it('pose d’abord les questions du premier dépouillement, puis celles de l’affinage', () => {
      for (const seed of seeds.slice(0, 20)) {
        const list = orderedQuestions(bank, 'essentiel', seed)
        const n = firstStepSize(list)
        expect(list).toHaveLength(bank.questions.filter(q => q.tier === 'essentiel').length)
        expect(list.slice(0, n).every(q => q.step === 1)).toBe(true)
        expect(list.slice(n).every(q => q.step === 2)).toBe(true)
      }
    })

    it('une question « last » ferme toujours son temps, quel que soit le tirage', () => {
      const closing = bank.questions.filter(q => q.last)
      for (const seed of seeds) {
        const list = orderedQuestions(bank, 'essentiel', seed)
        const n = firstStepSize(list)
        for (const q of closing.filter(x => x.tier === 'essentiel')) {
          const blockEnd = q.step === 1 ? n - 1 : list.length - 1
          expect(list.indexOf(q), `${q.id} avec la graine ${seed}`).toBe(blockEnd)
        }
      }
    })

    it('les autres questions gardent un ordre tiré au hasard', () => {
      const firsts = new Set(seeds.map(seed => orderedQuestions(bank, 'essentiel', seed)[0]!.id))
      expect(firsts.size).toBeGreaterThan(3)
      for (const q of bank.questions.filter(x => x.last)) expect(firsts.has(q.id)).toBe(false)
    })
  })
}

describe('choisir-2027 : la question sur LFI clôt le premier dépouillement', () => {
  it('est la 8e et dernière question du premier temps', () => {
    const pack = elections.find(p => p.election.id === 'choisir-2027')!
    for (const seed of ['0123456789abcdef', 'ffffffffffffffff', '00000000deadbeef']) {
      const list = orderedQuestions(pack.bank, 'essentiel', seed)
      expect(list[7]!.id).toBe('strategie-1')
      expect(firstStepSize(list)).toBe(8)
    }
  })
})
