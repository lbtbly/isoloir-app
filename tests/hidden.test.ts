// Candidats masqués (election.hidden) : absents de tout ce que voient le site, les tests et les outils (le pack), mais
// gardés dans les données, pour pouvoir les montrer à nouveau d'une ligne.
import { describe, expect, it } from 'vitest'
import { parseLocation, resolvePlace } from '../src/core/routes'
import { ELECTIONS, RETIRED_PREFIXES } from '../src/elections'
import { elections } from '../src/elections/all'
import { candidates as rawCandidates } from '../src/elections/presidentielle-2027/candidates'
import { positions as rawPositions } from '../src/elections/presidentielle-2027/positions'

for (const pack of elections) {
  const hidden = pack.election.hidden ?? []
  describe(`pack ${pack.election.id} : candidats masqués`, () => {
    it('ni fiche, ni positions, ni non classés, ni registre', () => {
      const entry = ELECTIONS.find(e => e.id === pack.election.id)!
      for (const id of hidden) {
        expect(pack.candidates.some(c => c.id === id), id).toBe(false)
        expect(pack.positions[id], id).toBeUndefined()
        expect(pack.election.ranking?.excluded?.ids ?? [], id).not.toContain(id)
        expect(entry.candidateIds, id).not.toContain(id)
      }
      expect(new Set(hidden).size).toBe(hidden.length)
    })

    it('le registre en garde la même liste (hiddenCandidateIds), pour les anciens liens vers leur fiche', () => {
      const entry = ELECTIONS.find(e => e.id === pack.election.id)!
      expect([...(entry.hiddenCandidateIds ?? [])].sort()).toEqual([...hidden].sort())
    })

    it.each(hidden)('%s : un ancien lien vers sa fiche, avec ou sans préfixe retiré, mène à la page des candidats', id => {
      const entry = ELECTIONS.find(e => e.id === pack.election.id)!
      const base = entry.slug ? `#/${entry.slug}` : '#'
      const prefixes = entry.slug ? [entry.slug] : ['', ...RETIRED_PREFIXES]
      for (const p of prefixes) {
        const hash = p ? `#/${p}/candidat/${id}` : `#/candidat/${id}`
        const r = resolvePlace(parseLocation(hash), ELECTIONS, RETIRED_PREFIXES)
        expect(r.election, hash).toBe(entry)
        expect(r.route, hash).toEqual({ name: 'candidates' })
        expect(r.redirect, hash).toBe(`${base}/candidats`)
      }
    })

    it.runIf(hidden.length > 0)('un ancien lien de comparaison perd ses candidats masqués, sans avis « inconnu »', () => {
      const entry = ELECTIONS.find(e => e.id === pack.election.id)!
      const base = entry.slug ? `#/${entry.slug}` : '#'
      const shown = pack.candidates[0]!.id
      const cases: [string[], string[]][] = [
        [[shown, hidden[0]!], [shown]],
        [[...hidden], []],
        [[hidden[0]!, shown, ...hidden.slice(1)], [shown]],
      ]
      for (const [asked, kept] of cases) {
        const hash = `${base}/comparer/${asked.join(',')}`
        const r = resolvePlace(parseLocation(hash), ELECTIONS, RETIRED_PREFIXES)
        expect(r.election, hash).toBe(entry)
        expect(r.route, hash).toEqual({ name: 'compare', ids: kept })
        expect(r.redirect, hash).toBe(kept.length ? `${base}/comparer/${kept.join(',')}` : `${base}/comparer`)
      }
    })
  })
}

describe('présidentielle : aucun texte montré ne nomme un candidat masqué', () => {
  const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
  const hiddenIds = new Set(pack.election.hidden ?? [])
  // Nom complet et nom de famille, mot entier, avec sa casse (« Royal », pas « royalties »)
  const names = rawCandidates.filter(c => hiddenIds.has(c.id)).flatMap(c => [c.name, c.name.split(' ').slice(1).join(' ')])
  const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${names.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'u')
  const scan = (found: string[], where: string, text: string | undefined) => {
    if (text && re.test(text)) found.push(`${where} : ${text}`)
  }

  it('le test connaît leurs noms', () => {
    expect(names.length).toBe(2 * hiddenIds.size)
  })

  // Les titres des sources sont cités tels que la presse les a publiés : ils ne sont pas cherchés ici
  it('ni dans les résumés des positions des candidats montrés (fiche, comparaison, proximité)', () => {
    const found: string[] = []
    for (const [cid, row] of Object.entries(pack.positions)) for (const [aid, p] of Object.entries(row)) scan(found, `${cid} ${aid}`, p.summary)
    expect(found).toEqual([])
  })

  it('ni dans leurs fiches (fonction, mention de primaire, parcours)', () => {
    const found: string[] = []
    for (const c of pack.candidates) {
      scan(found, `${c.id} (fonction)`, c.role)
      scan(found, `${c.id} (primaire)`, c.primary)
      c.bio?.forEach((b, i) => scan(found, `${c.id} (parcours ${i + 1})`, b.text))
    }
    expect(found).toEqual([])
  })

  it('ni dans l’entrée la plus récente du journal, lue aussi en tête du dépouillement d’un visiteur qui revient', () => {
    const latest = pack.election.changelog.reduce<{ date: string; text: string } | undefined>((a, c) => (!a || c.date > a.date ? c : a), undefined)
    const found: string[] = []
    scan(found, `journal du ${latest?.date}`, latest?.text)
    expect(found).toEqual([])
  })
})

describe('présidentielle : candidats masqués gardés dans les données', () => {
  const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
  it.each(pack.election.hidden ?? [])('%s : sa fiche et ses positions restent dans candidates.ts et positions.ts', id => {
    expect(rawCandidates.some(c => c.id === id)).toBe(true)
    expect(Object.keys(rawPositions[id] ?? {}).length).toBeGreaterThan(0)
  })

  // Un fichier importé est publié et préchargé par le service worker : ni portrait, ni logo qui ne serve qu'aux masqués
  // (rien ne les montrerait, et les mentions légales ne les créditent pas). tools/check-dist.mjs contrôle aussi le build.
  it.each(pack.election.hidden ?? [])('%s : ni portrait, ni logo de parti qui ne serve qu’aux masqués', id => {
    const c = rawCandidates.find(x => x.id === id)!
    expect(c.photo, id).toBeUndefined()
    const logo = c.party?.logo?.src
    if (logo) expect(pack.candidates.some(s => s.party?.logo?.src === logo), `${id} : logo ${logo}`).toBe(true)
  })
})
