// Page des candidats rangée selon une grille des nuances (election.spectrum) : chaque candidat a une nuance de la
// grille et un parti (Candidate.party), chaque bloc l'un des quatre pastels du site.
import { describe, expect, it } from 'vitest'
import { elections } from '../src/elections/all'
import { spectrumOrder } from '../src/ui/screens/Candidates'

for (const { election, candidates } of elections.filter(p => p.election.spectrum)) {
  const spectrum = election.spectrum!
  describe(`pack ${election.id} : ordre de l’échiquier`, () => {
    it('chaque candidat a une nuance de la grille et un parti, chaque bloc l’un des quatre pastels', () => {
      const codes = spectrum.nuances.map(n => n.code)
      const blocs = new Map(spectrum.blocs.map(b => [b.id, b.pastel]))
      for (const n of spectrum.nuances) expect(blocs.has(n.bloc), n.code).toBe(true)
      for (const b of spectrum.blocs) expect(['rouge', 'jaune', 'bleu', 'vert'], b.id).toContain(b.pastel)
      for (const c of candidates) {
        expect(codes, c.id).toContain(c.nuance)
        expect(c.party?.name, c.id).toBeTruthy()
      }
    })

    it('ordre : la grille, puis l’alphabet au sein d’une nuance', () => {
      const order = spectrumOrder(election, candidates)!
      expect(order.map(c => c.id).sort()).toEqual(candidates.map(c => c.id).sort())
      const codes = spectrum.nuances.map(n => n.code)
      for (let i = 1; i < order.length; i++) {
        const [a, b] = [order[i - 1]!, order[i]!]
        const d = codes.indexOf(a.nuance!) - codes.indexOf(b.nuance!)
        expect(d < 0 || (d === 0 && a.id < b.id), `${a.id} avant ${b.id}`).toBe(true)
      }
    })
  })
}
