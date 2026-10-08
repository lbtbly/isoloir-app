// Ordre des questions, pour chaque élection de src/elections/all.ts : le premier dépouillement d'abord, les
// questions « last » à la fin de leur temps, le reste au hasard. Puis ce qui n'appartient qu'à la primaire.
import { describe, expect, it } from 'vitest'
import { firstStepSize, orderedQuestions } from '../src/core/order'
import { elections } from '../src/elections/all'

const seeds = Array.from({ length: 200 }, (_, i) => i.toString(16).padStart(16, '0'))

for (const pack of elections) {
  const { bank, election } = pack
  const essential = bank.questions.filter(q => q.tier === 'essentiel')
  const step1 = essential.filter(q => q.step === 1)

  describe(`pack ${election.id} : ordre des questions`, () => {
    it('pose d’abord les questions du premier dépouillement, puis celles de l’affinage', () => {
      for (const seed of seeds.slice(0, 20)) {
        const list = orderedQuestions(bank, 'essentiel', seed)
        const n = firstStepSize(list)
        expect(list).toHaveLength(essential.length)
        expect(n).toBe(step1.length)
        if (election.quick) expect(n).toBe(election.quick.step1)
        if (!n) continue
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

    it('au plus une question « last » par temps (sinon leur ordre ne serait plus garanti)', () => {
      const last = essential.filter(q => q.last)
      expect(last.filter(q => q.step === 1).length).toBeLessThanOrEqual(1)
      expect(last.filter(q => q.step !== 1).length).toBeLessThanOrEqual(1)
    })

    it('les autres questions gardent un ordre tiré au hasard', () => {
      const firsts = new Set(seeds.map(seed => orderedQuestions(bank, 'essentiel', seed)[0]!.id))
      expect(firsts.size).toBeGreaterThan(3)
      for (const q of bank.questions.filter(x => x.last)) expect(firsts.has(q.id)).toBe(false)
    })
  })
}

// Propre à la primaire : la question sur les alliances avec LFI ferme le premier dépouillement (demande du
// 3 octobre 2026, research/choisir-2027/decisions.json, lastInStep)
const primaire = elections.find(p => p.election.id === 'choisir-2027')
describe.runIf(!!primaire)('choisir-2027 : la question sur LFI clôt le premier dépouillement', () => {
  it('est la 8e et dernière question du premier temps', () => {
    for (const seed of ['0123456789abcdef', 'ffffffffffffffff', '00000000deadbeef']) {
      const list = orderedQuestions(primaire!.bank, 'essentiel', seed)
      expect(list[7]!.id).toBe('strategie-1')
      expect(firstStepSize(list)).toBe(8)
    }
  })
})
