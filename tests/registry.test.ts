// Registre des élections (src/elections/index.ts) : entrées légères et cohérentes avec leurs packs, une seule
// élection par défaut, aucun pack importé directement (chacun est un fichier à part du build), all.ts réservé
// aux tests et aux outils, et la primaire « Choisir 2027 » retirée du site (préfixes retirés, pack hors du site).
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseLocation } from '../src/core/routes'
import { ELECTIONS, RETIRED_PREFIXES, defaultEntry, entryById, loadElection, loadedElection } from '../src/elections'
import { elections } from '../src/elections/all'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

describe('registre des élections', () => {
  it('une seule élection par défaut (slug vide), des slugs, identifiants et alias uniques', () => {
    expect(ELECTIONS.filter(e => e.slug === '')).toHaveLength(1)
    expect(defaultEntry.slug).toBe('')
    // L'identifiant d'une élection peut lui servir de slug (« essai-20 ») ; d'une élection à l'autre, tout diffère
    const prefixes = ELECTIONS.flatMap(e => [...new Set([e.id, ...(e.slug ? [e.slug] : []), ...(e.aliases ?? [])])])
    expect(new Set(prefixes).size).toBe(prefixes.length)
    for (const p of prefixes) expect(p, p).toMatch(/^[a-z0-9][a-z0-9-]*$/)
  })

  it('l’élection par défaut n’est pas archivée', () => {
    expect(defaultEntry.archived).toBe(false)
  })

  it('chaque préfixe (slug, alias, identifiant) est lu comme un préfixe d’élection, jamais comme une page', () => {
    for (const e of ELECTIONS) {
      for (const p of [e.id, ...(e.slug ? [e.slug] : []), ...(e.aliases ?? [])]) {
        expect(parseLocation(`#/${p}/resultats`), p).toEqual({ slug: p, route: { name: 'results' }, path: '/resultats' })
      }
    }
  })

  it('un libellé, et une fin de vote lisible', () => {
    for (const e of ELECTIONS) {
      expect(e.label.trim().length, e.id).toBeGreaterThan(0)
      if (e.votingUntil) expect(Number.isNaN(Date.parse(e.votingUntil)), `${e.id} : ${e.votingUntil}`).toBe(false)
    }
  })

  it('chaque entrée correspond à un pack de all.ts : même identifiant, mêmes candidats', async () => {
    expect(ELECTIONS.map(e => e.id).sort()).toEqual(elections.map(p => p.election.id).sort())
    for (const entry of ELECTIONS) {
      const pack = await loadElection(entry)
      expect(pack.election.id).toBe(entry.id)
      expect([...entry.candidateIds].sort(), entry.id).toEqual(pack.candidates.map(c => c.id).sort())
      // Candidats masqués : la copie du registre (anciens liens vers leur fiche) est la liste du pack, et aucun
      // n'est parmi les candidats montrés
      expect([...(entry.hiddenCandidateIds ?? [])].sort(), entry.id).toEqual([...(pack.election.hidden ?? [])].sort())
      for (const id of entry.hiddenCandidateIds ?? []) expect(entry.candidateIds, `${entry.id} : ${id}`).not.toContain(id)
      expect(loadedElection(entry.id)).toBe(pack)
      expect(entryById(entry.id)).toBe(entry)
      expect(pack).toBe(elections.find(p => p.election.id === entry.id))
    }
  })

  it('ne charge chaque pack qu’à la demande : aucun import direct de ses données', () => {
    const src = readFileSync(join(ROOT, 'src/elections/index.ts'), 'utf8')
    const statics = [...src.matchAll(/^import\s+(type\s+)?[^'"]*from\s+['"]([^'"]+)['"]/gm)]
    for (const [, type, spec] of statics) expect(type || !spec!.startsWith('./'), `import statique de ${spec}`).toBeTruthy()
  })

  it('all.ts n’est importé par aucun module du site', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap(f => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []
      })
    const offenders = files(join(ROOT, 'src')).filter(f => /from\s+['"][^'"]*elections\/all['"]/.test(readFileSync(f, 'utf8')))
    expect(offenders.map(f => relative(ROOT, f))).toEqual([])
  })
})

describe('primaire « Choisir 2027 » retirée du site (12 octobre 2026)', () => {
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap(f => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? sources(p) : /\.tsx?$/.test(f) ? [p] : []
    })

  it('ni au registre, ni dans all.ts', () => {
    expect(ELECTIONS.map(e => e.id)).not.toContain('choisir-2027')
    expect(elections.map(p => p.election.id)).not.toContain('choisir-2027')
  })

  it('ses préfixes et celui de l’ancienne page des archives sont retirés, et ne servent à aucune élection', () => {
    expect([...RETIRED_PREFIXES].sort()).toEqual(['archives', 'choisir-2027', 'primaire'])
    const prefixes = new Set(ELECTIONS.flatMap(e => [e.id, e.slug, ...(e.aliases ?? [])]))
    for (const p of RETIRED_PREFIXES) {
      expect(prefixes.has(p), p).toBe(false)
      // Lu comme un préfixe d'élection, jamais comme une page
      expect(parseLocation(`#/${p}/resultats`), p).toEqual({ slug: p, route: { name: 'results' }, path: '/resultats' })
    }
  })

  it('son pack reste dans le dépôt, mais aucun module du site ne l’importe', () => {
    const own = join(ROOT, 'src/elections/choisir-2027')
    const offenders = sources(join(ROOT, 'src'))
      .filter(f => !f.startsWith(own))
      .filter(f => /(?:from\s+|import\(\s*)['"][^'"]*choisir-2027(?:\/[^'"]*)?['"]/.test(readFileSync(f, 'utf8')))
    expect(offenders.map(f => relative(ROOT, f))).toEqual([])
  })
})
