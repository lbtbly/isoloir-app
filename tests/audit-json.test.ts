// La sortie --json des quatre audits de « Mon profil politique » (tools/audit-echiquier.mjs, audit-croix.mjs,
// audit-poids.mjs, audit-facon.mjs ; contrat de la veille, tools/veille/CONTRACT.md, c.10 AUDIT_JSON), que lit
// tools/veille/remeasure.mjs : une seule ligne JSON sur stdout, conforme au schéma ; measured a la forme de la constante
// publiée (ECHIQUIER_PUBLISHED, _CROSS, _WEIGH, _MANNER) et ne porte que les clés que le passage mesure ; les nombres
// tiennent entre eux comme l'exige la Méthode, et les parts tirées des seules données (deduced, compatibleShare, style)
// sont celles que recalcule tests/echiquier-copy.test.ts ; le rapport lisible, lui, ne change pas (il passe sur stderr).
// Les audits tournent en tout petit (2 clones bruités, 2 feuilles d'essai), sans rien comparer aux chiffres publiés :
// une mise à jour légitime des positions ne casse donc pas ce test (les chiffres sont l'affaire des tests de données).
import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { beforeAll, describe, expect, it } from 'vitest'
import { panelOf } from '../src/core/echiquierPanel'
import * as M from '../src/core/echiquierMethodCopy'
import { dealbreakerLevel, effectiveWeight } from '../src/core/score'
import type { ElectionPack } from '../src/core/types'
import { elections } from '../src/elections/all'
import { SCHEMAS, validate } from '../tools/veille/schemas.mjs'
import { isQuick, profilesFor } from './fixtures/echiquier-profiles'
import { REPO_ROOT } from './helpers/workflow-harness'

const pack = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
const AXIS = pack.election.spectrum!.axis!
const WHERE = AXIS.map(a => a.where)
const BLOCS = AXIS.map(a => a.bloc)
const NOISY = 2

/** Les constantes publiées, nombres et chaînes élargis (elles sont « as const ») */
type Wide<T> = T extends readonly (infer U)[] ? Wide<U>[] : T extends number ? number : T extends string ? string : T extends object ? { -readonly [K in keyof T]: Wide<T[K]> } : T
type Measured<T> = Wide<Omit<T, 'measured' | 'clones'>>
interface Audit<T> {
  tool: string
  electionId: string
  options: Record<string, unknown>
  measured: Partial<Measured<T>>
  extra: { verdicts: Record<string, string>; blocs: string[]; [k: string]: unknown }
}

interface Out {
  code: number
  stdout: string
  stderr: string
}
const exec = promisify(execFile)
async function audit(tool: string, args: string[]): Promise<Out> {
  try {
    const { stdout, stderr } = await exec(process.execPath, [join(REPO_ROOT, 'tools', `audit-${tool}.mjs`), ...args], { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 })
    return { code: 0, stdout, stderr }
  } catch (e) {
    const err = e as { code?: unknown; stdout?: string; stderr?: string }
    return { code: typeof err.code === 'number' ? err.code : -1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' }
  }
}

/** Les passages, lancés ensemble (quatre à la fois) avant les tests */
const RUNS = {
  echiquier: ['echiquier', ['--profiles', '2', '--noisy', '1', '--json']],
  echiquierHuman: ['echiquier', ['--profiles', '2', '--noisy', '1']],
  croix: ['croix', ['--noisy', String(NOISY), '--sheets', '0', '--json']],
  croixQuick: ['croix', ['--noisy', String(NOISY), '--sheets', '1', '--quick', '--json']],
  croixHuman: ['croix', ['--noisy', String(NOISY), '--sheets', '0']],
  poids: ['poids', ['--noisy', String(NOISY), '--json']],
  poidsQuick: ['poids', ['--noisy', String(NOISY), '--quick', '--json']],
  poidsHuman: ['poids', ['--noisy', String(NOISY)]],
  facon: ['facon', ['--noisy', String(NOISY), '--sheets', '0', '--json']],
  faconQuick: ['facon', ['--noisy', String(NOISY), '--sheets', '1', '--quick', '--json']],
  faconHuman: ['facon', ['--noisy', String(NOISY), '--sheets', '0']],
} as const satisfies Record<string, readonly [string, readonly string[]]>
type RunName = keyof typeof RUNS
const out = {} as Record<RunName, Out>

beforeAll(async () => {
  const names = Object.keys(RUNS) as RunName[]
  let next = 0
  const worker = async () => {
    while (next < names.length) {
      const name = names[next++]!
      const [tool, args] = RUNS[name]
      out[name] = await audit(tool, [...args])
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker))
}, 600_000)

/** La ligne JSON d'un passage : le code 0, une seule ligne sur stdout, conforme au schéma AUDIT_JSON */
function parsed<T>(name: RunName): Audit<T> {
  const o = out[name]
  expect(o.code, o.stderr.slice(-2000)).toBe(0)
  const lines = o.stdout.split('\n').filter(l => l.length)
  expect(lines, 'une seule ligne sur stdout').toHaveLength(1)
  const json = JSON.parse(lines[0]!) as Audit<T>
  expect(validate(SCHEMAS.AUDIT_JSON, json)).toEqual([])
  return json
}

/**
 * La forme de measured au regard de la constante publiée : chaque clé y existe ; un nombre est un nombre fini (ou null,
 * sans effectif), une chaîne une chaîne (ou null) ; un tableau n'est pas plus long ; un objet n'a que des clés publiées
 */
function shapeErrors(value: unknown, published: unknown, path: string): string[] {
  if (typeof published === 'number') return value === null || (typeof value === 'number' && Number.isFinite(value)) ? [] : [`${path} : ${JSON.stringify(value)}, nombre attendu`]
  if (typeof published === 'string') return value === null || typeof value === 'string' ? [] : [`${path} : ${JSON.stringify(value)}, chaîne attendue`]
  if (Array.isArray(published)) {
    if (!Array.isArray(value)) return [`${path} : tableau attendu`]
    if (value.length > published.length) return [`${path} : ${value.length} éléments, ${published.length} au plus`]
    return value.flatMap((v, i) => shapeErrors(v, published[i], `${path}[${i}]`))
  }
  if (published && typeof published === 'object') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [`${path} : objet attendu`]
    return Object.entries(value).flatMap(([k, v]) => (k in published ? shapeErrors(v, (published as Record<string, unknown>)[k], `${path}.${k}`) : [`${path}.${k} : clé absente de la constante`]))
  }
  return [`${path} : forme inconnue`]
}
/** Les clés de premier niveau de la constante, sans measured ni clones, moins celles d'un autre passage */
const keysOf = (constant: object, except: string[] = []) => Object.keys(constant).filter(k => !['measured', 'clones', ...except].includes(k)).sort()
/** Les mots du bloc d'une part, le premier en cas d'égalité */
const whereOf = (xs: readonly (number | null)[], x: number | null | undefined) => WHERE[xs.indexOf(x ?? null)]
/**
 * Le rapport lisible, sans ses durées (la dernière ligne, et le temps d'ouverture d'une fiche de audit-poids) ni les
 * avertissements de Node (qui vont sur stderr dans les deux cas)
 */
const report = (text: string) =>
  text
    .split('\n')
    .filter(l => !/^\d+ s$/.test(l) && !/^Ouverture d’une ligne de famille/.test(l) && !/^\(node:\d+\)|^\(Use `node --trace-warnings/.test(l))
    .join('\n')

describe('les quatre audits, avec --json', { timeout: 60_000 }, () => {
  it('le rapport lisible ne change pas : il passe tel quel sur stderr', () => {
    for (const [json, human] of [['echiquier', 'echiquierHuman'], ['croix', 'croixHuman'], ['poids', 'poidsHuman'], ['facon', 'faconHuman']] as const) {
      expect(out[human].code, human).toBe(0)
      expect(out[human].stdout.length, human).toBeGreaterThan(500)
      // Sans --json, aucune ligne JSON d'audit en plus sur stdout
      expect(out[human].stdout).not.toContain('"tool":"audit-')
      expect(report(out[json].stderr), json).toBe(report(out[human].stdout))
    }
  })

  it('une élection inconnue : code 2, rien sur stdout', async () => {
    const runs = await Promise.all(['echiquier', 'croix', 'poids', 'facon'].map(t => audit(t, ['inconnue', '--json', '--noisy', '1'])))
    for (const r of runs) {
      expect(r.code).toBe(2)
      expect(r.stdout).toBe('')
      expect(r.stderr).toContain('inconnue')
    }
  })
})

describe('audit-echiquier --json : ECHIQUIER_PUBLISHED et l’écart D5 avec et sans le candidat', { timeout: 60_000 }, () => {
  it('toutes les clés publiées, à un chiffre après la virgule au moins, et leurs arrondis', () => {
    const j = parsed<typeof M.ECHIQUIER_PUBLISHED>('echiquier')
    expect(j).toMatchObject({ tool: 'audit-echiquier', electionId: 'presidentielle-2027', options: { profiles: 2, noisy: 1, countMax: null } })
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_PUBLISHED))
    expect(shapeErrors(j.measured, M.ECHIQUIER_PUBLISHED, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_PUBLISHED>
    const rounded = j.extra.rounded as Measured<typeof M.ECHIQUIER_PUBLISHED>
    expect(Object.keys(rounded).sort()).toEqual(keysOf(M.ECHIQUIER_PUBLISHED))
    // Les parts en % à 0,1 près ; leurs arrondis, à l'entier comme la constante (sauf les moyennes et les rapports, à 0,1)
    for (const k of ['hitWithout', 'hitWithoutMin', 'hitWithoutMax', 'hitWith', 'hitWithMin', 'hitWithMax', 'wrongSideWithout'] as const) {
      expect(Math.round(m[k] * 10) / 10, k).toBe(m[k])
      expect(rounded[k], k).toBe(Math.round(m[k]))
    }
    for (const k of ['randomPerProfile', 'randomPerProfileMax', 'oneChoiceRatio', 'oneChoiceRatioQuick'] as const) expect(Math.abs(rounded[k] - m[k]), k).toBeLessThanOrEqual(0.05 + 1e-9)
    // Une part d'ensemble est une moyenne pondérée des blocs : entre la plus basse et la plus haute
    expect(m.hitWithMin).toBeLessThanOrEqual(m.hitWith)
    expect(m.hitWith).toBeLessThanOrEqual(m.hitWithMax)
    expect(m.hitWithoutMin).toBeLessThanOrEqual(m.hitWithout)
    expect(m.hitWithout).toBeLessThanOrEqual(m.hitWithoutMax)
    expect(m.randomThemes).toBeLessThanOrEqual(m.randomThemesMax)
    expect(m.randomPerProfile).toBeLessThanOrEqual(m.randomPerProfileMax)
  })

  it('extra.d5 : les blocs vrais, avec et sans le candidat, d’où viennent les bornes publiées ; le tableau D5 entier', () => {
    const j = parsed<typeof M.ECHIQUIER_PUBLISHED>('echiquier')
    const m = j.measured as Measured<typeof M.ECHIQUIER_PUBLISHED>
    expect(j.extra.blocs).toEqual(BLOCS)
    expect(j.extra.verdicts).toEqual({})
    type Row = { min: number; max: number; gap: number; gapLow: number; gapHigh: number; blocs: (number | null)[] }
    const d5 = j.extra.d5 as { with: Row; without: Row }
    for (const [row, min, max] of [[d5.with, m.hitWithMin, m.hitWithMax], [d5.without, m.hitWithoutMin, m.hitWithoutMax]] as const) {
      expect(row.blocs).toHaveLength(BLOCS.length)
      const ok = row.blocs.filter((x): x is number => x !== null)
      expect([row.min, row.max]).toEqual([min, max])
      expect([Math.min(...ok), Math.max(...ok)]).toEqual([min, max])
      // L'écart que D5 interdit d'élargir : hitWithMax − hitWithMin (et sans lui), à l'arrondi près
      expect(Math.abs(row.gap - (max - min))).toBeLessThanOrEqual(0.1 + 1e-9)
      expect(row.gapLow).toBeLessThanOrEqual(row.gap)
      expect(row.gap).toBeLessThanOrEqual(row.gapHigh)
    }
    const table = j.extra.table as Record<string, Row>
    const kinds = ['large', 'strict', 'noisy', 'quickLarge', 'quickNoisy']
    expect(Object.keys(table).sort()).toEqual(kinds.flatMap(k => ['themes', 'families'].flatMap(w => ['with', 'without'].map(x => `${k}.${w}.${x}`))).sort())
    expect(table['large.themes.with']).toEqual(d5.with)
    expect(table['large.themes.without']).toEqual(d5.without)
  })
})

describe('audit-croix --json : ECHIQUIER_CROSS', { timeout: 60_000 }, () => {
  /** La part des positions déduites, ou de confiance basse, bloc par bloc : le calcul de tests/echiquier-copy.test.ts */
  const deducedBlocs = () =>
    panelOf(pack).map(ids => {
      let n = 0
      let k = 0
      for (const id of ids)
        for (const pos of Object.values(pack.positions[id] ?? {})) {
          const level = dealbreakerLevel(pos)
          if (level) n++
          if (level === 'possible') k++
        }
      return Math.round((1000 * k) / n) / 10
    })
  const SCEN = ['random', 'neighbour', 'other'] as const
  const verdictKeys = (prefix: string) => [...SCEN, 'possibleBlocs', 'possibleTrue'].flatMap(k => [`${prefix}${k}.with`, `${prefix}${k}.without`])

  it('sans --quick : les clés de la banque seulement, et deduced, celle des données', () => {
    const j = parsed<typeof M.ECHIQUIER_CROSS>('croix')
    expect(j).toMatchObject({ tool: 'audit-croix', options: { noisy: NOISY, quick: false, sheets: 0 } })
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_CROSS, ['quick', 'possibleQuick', 'possibleBlocsQuick']))
    expect(shapeErrors(j.measured, M.ECHIQUIER_CROSS, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_CROSS>
    const shares = deducedBlocs()
    expect(j.extra.deducedBlocs).toEqual(shares)
    expect(m.deduced).toEqual({ low: Math.min(...shares), lowWhere: whereOf(shares, Math.min(...shares)), high: Math.max(...shares), highWhere: whereOf(shares, Math.max(...shares)) })
    expect(j.extra.blocs).toEqual(BLOCS)
    expect(j.extra.where).toEqual(WHERE)
    expect(j.extra.sheets).toBeUndefined()
  })

  it('les nombres tiennent entre eux : bornes, écart le plus large, « pourrait franchir » bloc par bloc', () => {
    const j = parsed<typeof M.ECHIQUIER_CROSS>('croix')
    const m = j.measured as Measured<typeof M.ECHIQUIER_CROSS>
    for (const k of SCEN) {
      expect(m[k].withMin, k).toBeLessThanOrEqual(m[k].withMax)
      expect(m[k].withoutMin, k).toBeLessThanOrEqual(m[k].withoutMax)
    }
    // gapMax : le plus large des six écarts (à l'arrondi près), comme le vérifie tests/echiquier-copy.test.ts
    const widest = Math.max(...SCEN.flatMap(k => [m[k].withMax - m[k].withMin, m[k].withoutMax - m[k].withoutMin]))
    expect(Math.abs(widest - m.gapMax)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(m.possible[0]).toBeLessThanOrEqual(m.possible[1]!)
    const byBloc = j.extra.possibleBlocsByBloc as { with: (number | null)[]; without: (number | null)[] }
    const okWith = byBloc.with.filter((x): x is number => x !== null)
    const okWithout = byBloc.without.filter((x): x is number => x !== null)
    expect(m.possibleBlocs).toEqual({
      low: Math.min(...okWith),
      lowWhere: whereOf(byBloc.with, Math.min(...okWith)),
      high: Math.max(...okWith),
      highWhere: whereOf(byBloc.with, Math.max(...okWith)),
      withoutLow: Math.min(...okWithout),
      withoutHigh: Math.max(...okWithout),
    })
    // Un verdict par écart D5 du passage, et ses chiffres aux mêmes clés
    expect(Object.keys(j.extra.verdicts).sort()).toEqual(verdictKeys('').sort())
    expect(Object.keys(j.extra.gaps as object).sort()).toEqual(verdictKeys('').sort())
    for (const [k, g] of Object.entries(j.extra.gaps as Record<string, { gap: number; low: number; high: number; reference: number }>)) {
      expect(g.low, k).toBeLessThanOrEqual(g.gap + 1e-9)
      expect(g.gap, k).toBeLessThanOrEqual(g.high + 1e-9)
      // La règle de verdict (passe : la borne haute sous la référence ; ne passe pas : la borne basse au-dessus)
      const v = j.extra.verdicts[k]
      if (v === 'passe') expect(g.high, k).toBeLessThanOrEqual(g.reference + 0.05)
      if (v === 'ne passe pas') expect(g.low, k).toBeGreaterThanOrEqual(g.reference - 0.05)
    }
    expect(m.reference).toEqual([(j.extra.gaps as Record<string, { reference: number }>)['random.with']!.reference, (j.extra.gaps as Record<string, { reference: number }>)['random.without']!.reference])
  })

  it('avec --quick : en plus les clés quick…, aux mêmes graines pour la banque', () => {
    const bank = parsed<typeof M.ECHIQUIER_CROSS>('croix')
    const j = parsed<typeof M.ECHIQUIER_CROSS>('croixQuick')
    expect(j.options).toEqual({ noisy: NOISY, quick: true, sheets: 1 })
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_CROSS))
    expect(shapeErrors(j.measured, M.ECHIQUIER_CROSS, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_CROSS>
    for (const k of keysOf(M.ECHIQUIER_CROSS, ['quick', 'possibleQuick', 'possibleBlocsQuick'])) expect(j.measured[k as keyof typeof j.measured], k).toEqual(bank.measured[k as keyof typeof bank.measured])
    // L'écart des deux scénarios qui passent, et celui du bloc voisin à part
    expect(Math.abs(Math.max(m.quick.random.withMax - m.quick.random.withMin, m.quick.random.withoutMax - m.quick.random.withoutMin, m.quick.other.withMax - m.quick.other.withMin, m.quick.other.withoutMax - m.quick.other.withoutMin) - m.quick.gapMax)).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(m.quick.neighbourGap).toHaveLength(2)
    expect(Object.keys(j.extra.verdicts).sort()).toEqual([...verdictKeys(''), ...verdictKeys('quick.')].sort())
    expect(j.extra.sheets).toEqual({ bank: expect.any(Number), quick: expect.any(Number) })
  })
})

describe('audit-poids --json : ECHIQUIER_WEIGH', { timeout: 60_000 }, () => {
  /** La part des approches compatibles parmi les positions, bloc par bloc : le calcul de tests/echiquier-copy.test.ts */
  const compatibleBlocs = () =>
    panelOf(pack).map(ids => {
      let one = 0
      let all = 0
      for (const id of ids)
        for (const pos of Object.values(pack.positions[id] ?? {})) {
          const e = effectiveWeight(pos)
          if (e) all++
          if (e === 1) one++
        }
      return Math.round((1000 * one) / all) / 10
    })
  const SUITES = ['shown', 'main', 'compatible', 'rejects', 'none']
  const verdictKeys = (prefix: string) => SUITES.flatMap(k => [`${prefix}${k}.with`, `${prefix}${k}.without`])

  it('sans --quick : les clés de la banque, et compatibleShare, celle des données', () => {
    const j = parsed<typeof M.ECHIQUIER_WEIGH>('poids')
    expect(j).toMatchObject({ tool: 'audit-poids', options: { noisy: NOISY, quick: false } })
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_WEIGH, ['quick']))
    expect(shapeErrors(j.measured, M.ECHIQUIER_WEIGH, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_WEIGH>
    const shares = compatibleBlocs()
    expect(j.extra.compatibleShareBlocs).toEqual(shares)
    expect(m.compatibleShare).toEqual({ low: Math.min(...shares), lowWhere: whereOf(shares, Math.min(...shares)), high: Math.max(...shares), highWhere: whereOf(shares, Math.max(...shares)) })
  })

  it('les quatre suites font toutes les fiches ; l’approche principale entre ses bornes, bloc vrai par bloc vrai', () => {
    const j = parsed<typeof M.ECHIQUIER_WEIGH>('poids')
    const m = j.measured as Measured<typeof M.ECHIQUIER_WEIGH>
    expect(Math.abs(m.main.all + m.compatible.all + m.rejects.all + m.none.all - 100)).toBeLessThan(0.3)
    expect(Math.abs(m.main.without + m.compatible.without + m.rejects.without + m.none.without - 100)).toBeLessThan(0.3)
    expect(m.main.low).toBeLessThanOrEqual(m.main.all)
    expect(m.main.all).toBeLessThanOrEqual(m.main.high)
    expect(m.main.withoutLow).toBeLessThanOrEqual(m.main.without)
    expect(m.main.without).toBeLessThanOrEqual(m.main.withoutHigh)
    const byBloc = j.extra.suitesByBloc as Record<string, { with: (number | null)[]; without: (number | null)[] }>
    expect(Object.keys(byBloc).sort()).toEqual(['compatible', 'main', 'none', 'rejects'])
    expect(m.main.lowWhere).toBe(whereOf(byBloc.main!.with, m.main.low))
    expect(m.main.highWhere).toBe(whereOf(byBloc.main!.with, m.main.high))
    // mainGap : l'écart de l'approche principale avec le candidat, à l'arrondi près
    expect(Math.abs(m.mainGap - (m.main.high - m.main.low))).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(m.cited[0]).toBeLessThanOrEqual(m.cited[1]!)
    expect(Object.keys(j.extra.verdicts).sort()).toEqual(verdictKeys('').sort())
    expect(Object.keys(j.extra.gaps as object).sort()).toEqual(verdictKeys('').sort())
  })

  it('avec --quick : en plus quick, et la banque aux mêmes graines', () => {
    const bank = parsed<typeof M.ECHIQUIER_WEIGH>('poids')
    const j = parsed<typeof M.ECHIQUIER_WEIGH>('poidsQuick')
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_WEIGH))
    expect(shapeErrors(j.measured, M.ECHIQUIER_WEIGH, 'measured')).toEqual([])
    const { quick, ...rest } = j.measured as Measured<typeof M.ECHIQUIER_WEIGH>
    expect(rest).toEqual(bank.measured)
    expect(quick.mainLow).toBeLessThanOrEqual(quick.main)
    expect(quick.main).toBeLessThanOrEqual(quick.mainHigh)
    expect(quick.compatibleLow).toBeLessThanOrEqual(quick.compatible)
    expect(quick.compatible).toBeLessThanOrEqual(quick.compatibleHigh)
    expect(Object.keys(j.extra.verdicts).sort()).toEqual([...verdictKeys(''), ...verdictKeys('quick.')].sort())
    expect((j.extra.compatibleShareQuickBlocs as unknown[]).length).toBe(BLOCS.length)
  })
})

describe('audit-facon --json : ECHIQUIER_MANNER', { timeout: 60_000 }, () => {
  /** La part des « pas d'accord » parmi les avis des clones bruités, bloc par bloc : le calcul de tests/echiquier-copy.test.ts */
  const styleOf = (quick: boolean) => {
    const P = profilesFor(pack)
    const acc = AXIS.map(() => ({ no: 0, all: 0 }))
    for (const cid of P.ranked)
      for (let s = 0; s < NOISY; s++)
        for (const a of Object.values(P.toAnswers(P.noisy(P.cloneLarge(cid, quick ? isQuick : undefined), `${quick ? 'nq' : 'n'}:${cid}:${s}`)))) {
          const v = Object.values(a.ratings)
          acc[P.blocOf(cid)]!.all += v.length
          acc[P.blocOf(cid)]!.no += v.filter(r => r < 0).length
        }
    return acc.map(x => Math.round((1000 * x.no) / x.all) / 10)
  }
  /** « à gauche », « à gauche ou à droite » : les blocs à égalité */
  const listOf = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ou ${xs.at(-1)}` : xs[0])
  type Shown = Measured<typeof M.ECHIQUIER_MANNER>['bank']
  const checkShown = (s: Shown, what: string) => {
    expect(s.blocs, what).toHaveLength(BLOCS.length)
    expect(s.withoutBlocs, what).toHaveLength(BLOCS.length)
    const lo = Math.min(...s.blocs)
    const hi = Math.max(...s.blocs)
    expect(s.lowWhere, what).toBe(listOf(s.blocs.flatMap((x, b) => (x === lo ? [WHERE[b]!] : []))))
    expect(s.highWhere, what).toBe(WHERE[s.blocs.indexOf(hi)])
    expect(lo, what).toBeLessThanOrEqual(s.all + 0.05)
    expect(s.all, what).toBeLessThanOrEqual(hi + 0.05)
  }

  it('sans --quick ni feuilles : la banque seulement, et style, celle des clones', () => {
    const j = parsed<typeof M.ECHIQUIER_MANNER>('facon')
    expect(j).toMatchObject({ tool: 'audit-facon', options: { noisy: NOISY, sheets: 0, quick: false } })
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_MANNER, ['agreeOnly', 'quick', 'quickGap', 'quickReference', 'styleQuick']))
    expect(shapeErrors(j.measured, M.ECHIQUIER_MANNER, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_MANNER>
    expect(m.style).toEqual(styleOf(false))
    checkShown(m.bank, 'banque')
    expect(Math.abs(m.gap[0]! - (Math.max(...m.bank.blocs) - Math.min(...m.bank.blocs)))).toBeLessThanOrEqual(0.1 + 1e-9)
    expect(m.byShare).toEqual({ cut: 75, bank: [expect.any(Number), expect.any(Number)] })
    // within : [le plus haut, le plus bas], feuilles sur NOISY clones ; la banque seule
    expect(m.within).toHaveLength(1)
    expect(m.within[0]![0]).toBeGreaterThanOrEqual(m.within[0]![1]!)
    expect(m.within[0]![0]).toBeLessThanOrEqual(NOISY)
    expect(Object.keys(j.extra.verdicts).sort()).toEqual(['bank.with', 'bank.without'])
    expect(j.extra.sheets).toBeUndefined()
  })

  it('avec --quick et des feuilles : agreeOnly, quick, styleQuick, et la banque aux mêmes graines', () => {
    const bank = parsed<typeof M.ECHIQUIER_MANNER>('facon')
    const j = parsed<typeof M.ECHIQUIER_MANNER>('faconQuick')
    expect(Object.keys(j.measured).sort()).toEqual(keysOf(M.ECHIQUIER_MANNER))
    expect(shapeErrors(j.measured, M.ECHIQUIER_MANNER, 'measured')).toEqual([])
    const m = j.measured as Measured<typeof M.ECHIQUIER_MANNER>
    const b = bank.measured as Measured<typeof M.ECHIQUIER_MANNER>
    for (const k of ['bank', 'gap', 'reference', 'style'] as const) expect(m[k], k).toEqual(b[k])
    expect(m.styleQuick).toEqual(styleOf(true))
    checkShown(m.quick, 'rapide')
    expect(m.agreeOnly).toHaveLength(2)
    expect(m.byShare.bank).toEqual(b.byShare.bank)
    expect(m.byShare.quick).toHaveLength(2)
    expect(m.within).toHaveLength(2)
    expect(m.within[0]).toEqual(b.within[0])
    expect(Object.keys(j.extra.verdicts).sort()).toEqual(['bank.with', 'bank.without', 'quick.with', 'quick.without'])
    expect(Object.keys(j.extra.sheets as object).length).toBeGreaterThan(0)
  })
})
