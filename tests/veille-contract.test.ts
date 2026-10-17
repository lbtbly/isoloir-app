// Contrat partagé de la veille automatique (tools/veille/CONTRACT.md) : les schémas et leur validateur
// (tools/veille/schemas.mjs), les règles croisées d'un changement, et les outils communs (tools/veille/lib/common.mjs).
// Les exemples de tests/fixtures/veille/ sont fictifs (candidat « exemple ») : ils servent de modèle aux autres tests.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_POLICY, SCHEMAS, checkChange, validate,
} from '../tools/veille/schemas.mjs'
import {
  EXIT, addDays, candidateSlug, daysBetween, frenchDate, isoInParis, normalizeName, parseArgs, sha1, sortKeysDeep, sourceKey,
  splitCandidates, stableJson, todayInParis, weekStart,
} from '../tools/veille/lib/common.mjs'
import { election } from '../src/elections/presidentielle-2027/election'
import { REPO_ROOT } from './helpers/workflow-harness'

const read = (p: string) => JSON.parse(readFileSync(join(REPO_ROOT, p), 'utf8'))
const refresh = read('tests/fixtures/veille/refresh-result.example.json')
const watch = read('tests/fixtures/veille/watch-result.example.json')

describe('schémas', () => {
  it('la politique par défaut est conforme', () => {
    expect(validate(SCHEMAS.POLICY, DEFAULT_POLICY)).toEqual([])
    expect(DEFAULT_POLICY.caps.bankMax).toBe(110)
    expect(Object.isFrozen(DEFAULT_POLICY.caps)).toBe(true)
  })

  it('les exemples de valeurs de retour des workflows 8 et 9 sont conformes', () => {
    expect(validate(SCHEMAS.WATCH_RESULT, watch)).toEqual([])
    expect(validate(SCHEMAS.REFRESH_RESULT, refresh)).toEqual([])
    for (const c of refresh.candidates) for (const ch of c.changes) expect(checkChange(ch)).toEqual([])
  })

  it('toute position publiée de la banque est un « before » valable', () => {
    const bank = read('research/presidentielle-2027/bank.json')
    const errors: string[] = []
    for (const [cid, table] of Object.entries(bank.positions as Record<string, Record<string, unknown>>))
      for (const [aid, p] of Object.entries(table)) errors.push(...validate(SCHEMAS.POSITION_PUBLISHED, p, `${cid}.${aid}`))
    expect(errors).toEqual([])
  })

  it('erreurs lisibles, avec leur chemin', () => {
    const bad = structuredClone(refresh)
    bad.candidates[0].changes[0].kind = 'déplacer'
    bad.candidates[0].changes[0].evidence.shortQuote = 'un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze'
    bad.candidates[0].changes[0].after.sources[0].date = 'consulté le 15 octobre'
    bad.candidates[0].extra = 1
    const errors = validate(SCHEMAS.REFRESH_RESULT, bad)
    expect(errors.some(e => e.startsWith('$.candidates[0].changes[0].kind : '))).toBe(true)
    expect(errors.some(e => e.includes('plus de 14 mots'))).toBe(true)
    expect(errors.some(e => e.startsWith('$.candidates[0].changes[0].after : ne correspond'))).toBe(true)
    // Les objets d'un candidat admettent des clés en plus ; un changement, non
    expect(errors.some(e => e.includes('« extra »'))).toBe(false)
    bad.candidates[0].changes[0].extra = 1
    expect(validate(SCHEMAS.REFRESH_RESULT, bad).some(e => e.includes('clé inattendue « extra »'))).toBe(true)
  })

  it('formats : date, date-heure avec fuseau, adresse', () => {
    expect(validate({ type: 'string', format: 'date' }, '2026-02-30')).toHaveLength(1)
    expect(validate({ type: 'string', format: 'date-time' }, '2026-10-19T06:00:00')).toHaveLength(1)
    expect(validate({ type: 'string', format: 'date-time' }, '2026-10-19T06:00:00+02:00')).toEqual([])
    expect(validate({ type: 'string', format: 'uri' }, 'javascript:alert(1)')).toHaveLength(1)
    expect(validate({ type: ['string', 'null'], format: 'date' }, null)).toEqual([])
  })

  it('règles croisées d’un changement', () => {
    const set = refresh.candidates[0].changes[0]
    expect(checkChange({ ...set, statedAt: null })).toContain('$ : prise-de-position sans statedAt')
    expect(checkChange({ ...set, cause: 'relecture' })).toContain('$ : statedAt réservé à prise-de-position')
    expect(checkChange({ ...set, kind: 'remove' }).join(' ')).toContain('remove avec un « after »')
    expect(checkChange({ ...set, approachId: 'sante-1-b' }).join(' ')).toContain('sans approche de la question retraites-1')
    expect(checkChange({ ...set, after: { ...set.after, nature: 'inference' } })).toContain('$ : une inférence ne dépasse pas le poids 1')
    const add = refresh.candidates[0].changes[1]
    expect(checkChange({ ...add, approachId: 'sante-1-j' }).join(' ')).toContain('identifiant provisoire')
  })
})

describe('outils communs', () => {
  it('codes de sortie : la table du contrat', () => {
    expect(EXIT).toEqual({ OK: 0, USAGE: 2, MOVED: 10, FROZEN: 11, SOFT_FROZEN: 12, ENDED: 13, PAUSED: 20, LOCKED: 21, BUDGET: 22, DATA: 30, CODE: 31, DEPLOY: 40, PROD: 41 })
  })

  it('options : valeurs, listes, booléens ; option inconnue et --reset-revisions refusées (code 2)', () => {
    const spec = { port: { type: 'number' as const, required: true }, hold: { type: 'list' as const }, 'dry-run': { type: 'boolean' as const }, kind: { type: 'string' as const, choices: ['quotidien', 'hebdo'] } }
    expect(parseArgs(['--port=4371', '--hold', 'a,b', '--hold', 'c', '--dry-run', 'f.json', '--kind', 'hebdo'], spec)).toEqual({ _: ['f.json'], port: 4371, hold: ['a', 'b', 'c'], 'dry-run': true, kind: 'hebdo' })
    const code = (argv: string[]) => {
      try {
        parseArgs(argv, spec)
        return 0
      } catch (e) {
        return (e as { code?: number }).code
      }
    }
    expect(code(['--port', '1', '--inconnue'])).toBe(2)
    expect(code([])).toBe(2)
    expect(code(['--port', '1', '--kind', 'mensuel'])).toBe(2)
    expect(code(['--port', '1', 'x', '--reset-revisions'])).toBe(2)
  })

  it('dates à Paris', () => {
    expect(todayInParis(new Date('2026-10-18T23:30:00Z'))).toBe('2026-10-19')
    expect(isoInParis(new Date('2026-10-19T04:00:00Z'))).toBe('2026-10-19T06:00:00+02:00')
    expect(isoInParis(new Date('2027-01-05T10:00:00Z'))).toBe('2027-01-05T11:00:00+01:00')
    expect(addDays('2026-10-01', -3)).toBe('2026-09-28')
    expect(daysBetween('2026-10-09', '2026-10-19')).toBe(10)
    expect(weekStart('2026-10-25')).toBe('2026-10-19')
    expect(weekStart('2026-10-19')).toBe('2026-10-19')
    expect(frenchDate('2027-05-01')).toBe('1er mai 2027')
    expect(frenchDate('2026-10-19')).toBe('19 octobre 2026')
  })

  it('noms, identifiants, sources et empreintes', () => {
    expect(normalizeName('  Jean-Luc  Mélenchon ')).toBe('jean luc melenchon')
    expect(candidateSlug('Nicolas Dupont-Aignan')).toBe('dupontaignan')
    expect(candidateSlug('Marine Le Pen')).toBe('lepen')
    expect(candidateSlug('Édouard Philippe', ['philippe'])).toBe('philippe2')
    expect(sourceKey('https://www.Lemonde.fr/a/?utm_source=x&b=2#t')).toBe('lemonde.fr/a?b=2')
    expect(sourceKey('https://m.lefigaro.fr/x/amp/')).toBe('lefigaro.fr/x')
    expect(sha1('retailleau|2026-10-12|x')).toMatch(/^[0-9a-f]{40}$/)
    expect(stableJson({ b: 1, a: { d: 1, c: 2 } }, { sortKeys: true })).toBe('{\n  "a": {\n    "c": 2,\n    "d": 1\n  },\n  "b": 1\n}\n')
    expect(Object.keys(sortKeysDeep({ b: 1, a: 2 }))).toEqual(['a', 'b'])
  })

  it('candidats présentés et masqués, d’après config.json et election.hidden (attentes tirées des données)', () => {
    const config = read('research/presidentielle-2027/config.json')
    const s = splitCandidates(config, election)
    const hidden = new Set([...(election.hidden ?? []), ...config.candidates.filter((c: { pendingPrimary?: boolean }) => c.pendingPrimary).map((c: { id: string }) => c.id)])
    expect(s.hiddenIds).toEqual(config.candidates.map((c: { id: string }) => c.id).filter((id: string) => hidden.has(id)))
    expect(s.visibleIds.length).toBe(config.candidates.length - s.hiddenIds.length)
    expect(s.visibleIds).toContain('glucksmann')
    expect(s.hiddenIds).toEqual(expect.arrayContaining(['faure', 'guedj', 'maurel', 'royal']))
    // La logique elle-même, sur une petite configuration : masqués par election.hidden ou pendingPrimary, ordre de config
    const small = splitCandidates({ candidates: [{ id: 'a', name: 'A A' }, { id: 'b', name: 'B B', pendingPrimary: true }, { id: 'c', name: 'C C' }] }, { hidden: ['c'] })
    expect(small).toMatchObject({ visibleIds: ['a'], hiddenIds: ['b', 'c'] })
  })
})
