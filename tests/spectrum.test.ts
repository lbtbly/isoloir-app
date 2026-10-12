// Page des candidats rangée selon une grille des nuances (election.spectrum) : chaque candidat a une nuance de la
// grille et un parti (Candidate.party), chaque bloc l'un des quatre pastels du site. L'axe de la page « Mon profil
// politique » (spectrum.axis) : des blocs de la grille, sans doublon, dans son ordre.
import { describe, expect, it } from 'vitest'
import { elections } from '../src/elections/all'
import { excludedIds } from '../src/core/score'
import { panelOf } from '../src/core/echiquier'
import { axisOf, spectrumOrder } from '../src/core/spectrum'

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

    it('l’axe de « Mon profil politique » : des blocs de la grille, sans doublon, dans son ordre, avec leurs formes', () => {
      const axis = axisOf(election)
      if (!axis) return
      const order = spectrum.blocs.map(b => b.id)
      const ids = axis.map(a => a.bloc)
      for (const id of ids) expect(order, id).toContain(id)
      expect(new Set(ids).size).toBe(ids.length)
      expect(ids).toEqual([...ids].sort((a, b) => order.indexOf(a) - order.indexOf(b)))
      for (const a of axis) for (const k of ['short', 'where', 'from', 'to'] as const) expect(a[k].trim(), `${a.bloc} ${k}`).not.toBe('')
    })

    it('les couleurs des blocs de l’axe sur la page des candidats : rouge à gauche, jaune au centre, bleu à droite, jamais le vert', () => {
      // « Mon profil politique » n'en prend aucune : ses cases suivent l'échelle d'affinité (décision du 12 octobre 2026)
      const axis = axisOf(election)
      if (!axis) return
      const tints = axis.map(a => spectrum.blocs.find(b => b.id === a.bloc)!.pastel)
      const mid = (axis.length - 1) / 2
      tints.forEach((t, b) => expect(t, axis[b]!.bloc).toBe(b < mid ? 'rouge' : b > mid ? 'bleu' : 'jaune'))
    })

    it('les candidats de l’axe : ni non classés, ni hors axe, chacun une fois, dans l’ordre alphabétique de son bloc', () => {
      const axis = axisOf(election)
      if (!axis) return
      const panel = panelOf({ election, candidates })
      const out = new Set(excludedIds({ election }))
      const flat = panel.flat()
      expect(new Set(flat).size).toBe(flat.length)
      for (const id of flat) expect(out.has(id), id).toBe(false)
      panel.forEach((ids, b) => {
        expect(ids).toEqual([...ids].sort())
        for (const id of ids) {
          const nuance = candidates.find(c => c.id === id)!.nuance
          expect(spectrum.nuances.find(n => n.code === nuance)?.bloc, id).toBe(axis[b]!.bloc)
        }
      })
      // Tous les candidats classés dont le bloc est sur l'axe y sont
      const onAxis = new Set(axis.map(a => a.bloc))
      const expected = candidates.filter(c => !out.has(c.id) && onAxis.has(spectrum.nuances.find(n => n.code === c.nuance)?.bloc ?? '')).map(c => c.id)
      expect([...flat].sort()).toEqual(expected.sort())
    })
  })
}
