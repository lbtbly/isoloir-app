// Page des candidats rangée selon une grille des nuances (election.spectrum) et cartes à la couleur des partis
// (Candidate.party) : chaque candidat a une nuance de la grille et un parti, la couleur de famille est celle de son
// bloc, et le texte de chaque carte reste lisible (contraste AA).
import { describe, expect, it } from 'vitest'
import { cardColors, contrast } from '../src/core/color'
import { elections } from '../src/elections/all'
import { spectrumOrder } from '../src/ui/screens/Candidates'

describe('couleurs de carte', () => {
  it('texte encre ou blanc, contraste d’au moins 4,5:1, couleur assombrie au besoin', () => {
    for (const c of ['#fff100', '#ee1a26', '#f70059', '#0370ed', '#5abb48', '#8c8c8c', '#000000', '#ffffff']) {
      const { bg, fg } = cardColors(c)
      expect(contrast(bg, fg), c).toBeGreaterThanOrEqual(4.5)
    }
    expect(cardColors('#fff100').bg).toBe('#fff100')
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5)
  })
})

for (const { election, candidates } of elections.filter(p => p.election.spectrum)) {
  const spectrum = election.spectrum!
  describe(`pack ${election.id} : ordre de l’échiquier`, () => {
    it('chaque candidat a une nuance de la grille et un parti à une couleur lisible', () => {
      const codes = spectrum.nuances.map(n => n.code)
      const blocs = new Map(spectrum.blocs.map(b => [b.id, b.color]))
      for (const n of spectrum.nuances) expect(blocs.has(n.bloc), n.code).toBe(true)
      for (const c of candidates) {
        expect(codes, c.id).toContain(c.nuance)
        expect(c.party, c.id).toBeDefined()
        const p = c.party!
        expect(p.color, c.id).toMatch(/^#[0-9a-f]{6}$/)
        if (p.colorFrom === 'famille') {
          const bloc = spectrum.nuances.find(n => n.code === c.nuance)!.bloc
          expect(p.color, `${c.id} : couleur de sa famille`).toBe(blocs.get(bloc))
        }
        const { bg, fg } = cardColors(p.color)
        expect(contrast(bg, fg), c.id).toBeGreaterThanOrEqual(4.5)
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
