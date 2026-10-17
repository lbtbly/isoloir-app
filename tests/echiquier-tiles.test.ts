// Les couleurs « pâle sauf net » des cases de « Mon profil politique » (décision du propriétaire du 17 octobre 2026) : la
// classe d'une case (src/ui/profile/Chart.tsx, tileClass) la rend pleine sur une lecture nette seulement, atténuée
// ailleurs ; une case nette « mitigé » prend la couleur de son sens. Sur des lectures factices, puis sur les feuilles
// d'essai de l'élection réelle (aucun calcul n'est touché : la classe suit la lecture). La feuille de style ne rend une
// case pleine que par .tile.is-net (src/styles/app.css). La paire « Pleine / Atténuée » de la légende (KeyPair) : dans
// l'axe au téléphone, juste sous lui à l'ordinateur, hors de ce qui colle, et sous l'exemple de la page d'attente.
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

/** Le bloc d'une règle @ (ses accolades équilibrées), depuis l'indice de son en-tête */
const blockAt = (css: string, at: number) => {
  let depth = 0
  for (let i = css.indexOf('{', at); i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1)
  }
  throw new Error('bloc non fermé')
}

describe('la paire « Pleine / Atténuée » (décisions du propriétaire du 17 octobre 2026)', () => {
  const ROOT = fileURLToPath(new URL('..', import.meta.url))
  const read = (f: string) => readFileSync(join(ROOT, f), 'utf8')
  const chart = read('src/ui/profile/Chart.tsx')
  const profile = read('src/ui/screens/Profile.tsx')
  const css = read('src/styles/profile.css')

  it('un seul composant, à trois places : la légende de l’axe, juste sous l’axe, sous l’exemple de la page d’attente', () => {
    expect(chart.match(/<ul class="key-scale key-pair">/g)).toHaveLength(1)
    // Dans la légende, entre les paliers et sa phrase (le téléphone) ; juste après l'axe, hors de lui (l'ordinateur)
    expect(chart).toMatch(/<\/ul>\s*(\{\/\*[^]*?\*\/\}\s*)?<KeyPair \/>\s*<p class="key-text">/)
    expect(chart).toMatch(/<\/ol>\s*<\/div>\s*(\{\/\*[^]*?\*\/\}\s*)?<KeyPair \/>\s*<\/>/)
    expect(chart.match(/<KeyPair \/>/g)).toHaveLength(2)
    // Sous la grille fictive, avant la phrase des couleurs
    expect(profile).toMatch(/<\/div>\s*<KeyPair \/>\s*<p class="ex-key">/)
    expect(profile.match(/<KeyPair \/>/g)).toHaveLength(1)
  })

  it('une seule paire visible : dans l’axe au téléphone, sous lui, hors de ce qui colle, à l’ordinateur', () => {
    const wide = [...css.matchAll(/@container plot \(min-width: 50rem\) \{/g)].map(m => blockAt(css, m.index!))
    const sticky = wide.find(b => /\.axis \{\s*position: sticky;/.test(b))
    expect(sticky).toBeDefined()
    // À l'ordinateur : celle de la légende masquée, celle d'après l'axe affichée ; plus rien dans une troisième rangée
    // de la grille de l'axe collant
    expect(sticky).toMatch(/\.chart-key > \.key-pair \{\s*display: none;\s*\}/)
    expect(sticky).toMatch(/\.axis \+ \.key-pair \{\s*display: flex;/)
    expect(sticky).not.toMatch(/grid-row: 3/)
    // Hors de toute requête : celle d'après l'axe masquée (le téléphone garde celle de la légende)
    const outside = wide.reduce((s, b) => s.replace(b, ''), css)
    expect(outside).toMatch(/\.axis \+ \.key-pair \{\s*display: none;\s*\}/)
    expect(outside).not.toMatch(/\.chart-key > \.key-pair \{\s*display: none;/)
  })
})
