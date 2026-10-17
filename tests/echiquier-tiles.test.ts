// Les couleurs « pâle sauf net » des cases de « Mon profil politique » (décision du propriétaire du 17 octobre 2026) : la
// classe d'une case (src/ui/profile/Chart.tsx, tileClass) la rend pleine sur une lecture nette seulement, atténuée
// ailleurs ; une case nette « mitigé » prend la couleur de son sens. Sur des lectures factices, puis sur les feuilles
// d'essai de l'élection réelle (aucun calcul n'est touché : la classe suit la lecture). La feuille de style ne rend une
// case pleine que par .tile.is-net (src/styles/app.css).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { AFFINITY_BANDS, affinityBand } from '../src/core/affinity'
import type { Mark } from '../src/core/echiquier'
import { readEchiquier } from '../src/core/echiquier'
import { elections } from '../src/elections/all'
import { tileClass } from '../src/ui/profile/Chart'
import { profilesFor } from './fixtures/echiquier-profiles'

const MARKS: Mark[] = ['pres', 'loin', 'rien', 'inconnu']
/** Une affinité au milieu de chaque palier */
const MID = { 'tres-eloigne': 10, eloigne: 30, mitige: 50, proche: 70, 'tres-proche': 90 } as const

describe('les cases « pâle sauf net »', () => {
  it('atténuée par défaut ; pleine sur une lecture nette ; « mitigé » net, la couleur de son sens', () => {
    for (const b of AFFINITY_BANDS) {
      const a = MID[b.key]
      expect(tileClass(a), b.key).toBe(`tile aff-${b.key}`)
      expect(tileClass(a, 'rien'), b.key).toBe(`tile aff-${b.key}`)
      expect(tileClass(a, 'inconnu'), b.key).toBe(`tile aff-${b.key}`)
      for (const m of ['pres', 'loin'] as const) expect(tileClass(a, m), `${b.key} ${m}`).toBe(`tile aff-${b.key} is-net${b.key === 'mitige' ? ` is-sens-${m}` : ''}`)
    }
    // Sans candidat connu : « ? inconnu », jamais pleine
    for (const m of MARKS) expect(tileClass(null, m)).toBe('tile is-inconnu')
  })

  it('sur des feuilles réelles : une case pleine pour chaque lecture nette, et elle seule', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const P = profilesFor(pack)
    let net = 0
    let mitigeNet = 0
    // Des clones bruités de candidats de chaque bord ; celui d'Attal (graine n:attal:11, celle de la maquette) porte une
    // case nette « mitigé » (Dette et dépenses publiques, la droite nettement plus près, à 57 %)
    const seeds: [string, string][] = [['attal', 'n:attal:11'], ...[P.ranked[0]!, P.ranked[Math.floor(P.ranked.length / 2)]!, P.ranked.at(-1)!].map((id, i): [string, string] => [id, `tiles:${id}:${i}`])]
    for (const [id, seed] of seeds) {
      const e = readEchiquier(pack, P.toAnswers(P.noisy(P.cloneLarge(id), seed)))
      for (const u of [...e.themes, ...e.families])
        for (const c of u.cells) {
          const cls = tileClass(c.affinity, c.mark).split(' ')
          const isNet = c.affinity !== null && (c.mark === 'pres' || c.mark === 'loin')
          expect(cls.includes('is-net'), `${u.id} ${c.bloc} ${c.mark}`).toBe(isNet)
          if (isNet) net++
          if (isNet && affinityBand(c.affinity)!.key === 'mitige') {
            mitigeNet++
            expect(cls, `${u.id} ${c.bloc}`).toContain(`is-sens-${c.mark}`)
          } else expect(cls.some(x => x.startsWith('is-sens-')), `${u.id} ${c.bloc}`).toBe(false)
        }
    }
    expect(net).toBeGreaterThan(0)
    expect(mitigeNet).toBeGreaterThan(0)
  })

  it('la feuille de style ne rend une case pleine que par is-net : aucune règle par palier', () => {
    const css = readFileSync(join(fileURLToPath(new URL('..', import.meta.url)), 'src/styles/app.css'), 'utf8')
    expect(css).not.toMatch(/\.tile\.aff-/)
    expect(css).toMatch(/\.tile\.is-net \{\s*--tile: var\(--aff\);\s*--tile-ink: var\(--on-print\);/)
    expect(css).toMatch(/\.tile\.is-net\.is-sens-pres \{\s*--tile: var\(--aff-proche\);/)
    expect(css).toMatch(/\.tile\.is-net\.is-sens-loin \{\s*--tile: var\(--aff-eloigne\);/)
    // Atténuée par défaut : la teinte du palier, le mot à son encre
    expect(css).toMatch(/\.tile \{\s*--tile: var\(--aff-tint, var\(--aff-mitige-tint\)\);\s*--tile-ink: var\(--aff-ink, var\(--aff-mitige-ink\)\);/)
  })
})
