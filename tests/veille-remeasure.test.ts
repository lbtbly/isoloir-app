// Nouvelle mesure des chiffres publiés (tools/veille/remeasure.mjs et lib/remeasure.mjs, contrat
// tools/veille/CONTRACT.md §d.8) : la ligne « audit » d'election.ts, les trois constantes exactes de la Méthode
// recalculées comme les tests (tests/echiquier-copy.test.ts), et la porte D5 (calibration, écarts jamais élargis,
// verdicts). Les essais de la ligne de commande tournent sur une copie temporaire du code et des données, avec des
// audits factices (tools/audit-*.mjs remplacés dans la copie) : aucun audit réel n'est lancé, rien du worktree ne change.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import * as M from '../src/core/echiquierMethodCopy'
import { panelOf } from '../src/core/echiquierPanel'
import { dealbreakerLevel, effectiveWeight } from '../src/core/score'
import { elections } from '../src/elections/all'
import { parseCandidatesTs } from '../tools/veille/lib/apply.mjs'
import {
  auditBounds, calibrationDrift, currentVerdicts, exactShares, failedHardChecks, gapDrift, indexRules, namedCandidates,
  patchAuditLine, patchExactConstants, readAuditLine, verdictDrift,
} from '../tools/veille/lib/remeasure.mjs'
import { isQuick, profilesFor } from './fixtures/echiquier-profiles'
import { REPO_ROOT } from './helpers/workflow-harness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- valeurs JSON lues ou fabriquées sans type propre
type Json = Record<string, any>
const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
const electionText = readFileSync(join(REPO_ROOT, 'src/elections/presidentielle-2027/election.ts'), 'utf8')
const methodText = readFileSync(join(REPO_ROOT, 'src/core/echiquierMethodCopy.ts'), 'utf8')
const cards = parseCandidatesTs(readFileSync(join(REPO_ROOT, 'src/elections/presidentielle-2027/candidates.ts'), 'utf8'))
const published = { PUBLISHED: M.ECHIQUIER_PUBLISHED, CROSS: M.ECHIQUIER_CROSS, WEIGH: M.ECHIQUIER_WEIGH, MANNER: M.ECHIQUIER_MANNER }
const shares = exactShares({ pack, panelOf, effectiveWeight, dealbreakerLevel, profilesFor, isQuick, mannerClones: M.ECHIQUIER_MANNER.clones })
const code31 = (f: () => unknown) => {
  try {
    f()
  } catch (err) {
    const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
    return e.code
  }
  return null
}
const changedLines = (a: string, b: string) => {
  const x = a.split('\n')
  const y = b.split('\n')
  expect(y.length).toBe(x.length)
  return y.map((l, i) => [x[i], l]).filter(([p, q]) => p !== q)
}

// Sorties --json factices, aux chiffres publiés (forme c.10 AUDIT_JSON)
const PUB: Json = Object.fromEntries(Object.entries(M.ECHIQUIER_PUBLISHED).filter(([k]) => k !== 'measured'))
function canned(): Record<string, Json> {
  const j = (tool: string, measured: Json, verdicts: Json = {}) => ({ tool, electionId: 'presidentielle-2027', options: {}, measured, extra: { verdicts, blocs: [] } })
  return {
    'audit-echiquier': j('audit-echiquier', { ...PUB }),
    'audit-croix': j('audit-croix', { gapMax: M.ECHIQUIER_CROSS.gapMax }, { 'random.with': 'passe', 'neighbour.with': 'non établi' }),
    'audit-croix-quick': j('audit-croix', { gapMax: M.ECHIQUIER_CROSS.gapMax, quick: { gapMax: M.ECHIQUIER_CROSS.quick.gapMax, neighbourGap: [...M.ECHIQUIER_CROSS.quick.neighbourGap] } }, { 'random.with': 'passe', 'quick.random.with': 'passe' }),
    'audit-poids': j('audit-poids', { mainGap: M.ECHIQUIER_WEIGH.mainGap }, { 'main.with': 'non établi' }),
    'audit-poids-quick': j('audit-poids', { mainGap: M.ECHIQUIER_WEIGH.mainGap, quick: {} }, { 'quick.main.with': 'non établi' }),
    'audit-facon': j('audit-facon', { gap: [...M.ECHIQUIER_MANNER.gap] }, { 'bank.with': 'non établi' }),
    'audit-facon-quick': j('audit-facon', { gap: [...M.ECHIQUIER_MANNER.gap], quickGap: [...M.ECHIQUIER_MANNER.quickGap] }, { 'quick.with': 'non établi' }),
  }
}
const auditsOf = (c: Record<string, Json>) => ({
  echiquier: c['audit-echiquier'], croix: c['audit-croix'], croixQuick: c['audit-croix-quick'], poids: c['audit-poids'],
  poidsQuick: c['audit-poids-quick'], facon: c['audit-facon'], faconQuick: c['audit-facon-quick'],
})

describe('lib/remeasure : la ligne « audit » d’election.ts', () => {
  it('se lit, se remplace seule, et refuse une forme inattendue (31)', () => {
    expect(readAuditLine(electionText)).toEqual({ profiles: 3000, minShare: pack.election.audit!.minShare, maxShare: pack.election.audit!.maxShare })
    const out = patchAuditLine(electionText, { profiles: 3000, minShare: 3, maxShare: 10 })
    expect(changedLines(electionText, out)).toEqual([[`  audit: { profiles: 3000, minShare: ${pack.election.audit!.minShare}, maxShare: ${pack.election.audit!.maxShare} },`, '  audit: { profiles: 3000, minShare: 3, maxShare: 10 },']])
    expect(code31(() => readAuditLine('export const x = 1'))).toBe(31)
    expect(code31(() => readAuditLine(`${electionText}\n  audit: { profiles: 3000, minShare: 4, maxShare: 9 },\n`))).toBe(31)
  })

  it('les parts du questionnaire rapide, arrondies comme audit-pack (audit-displayed)', () => {
    expect(auditBounds({ profiles: 3000, shares: { quick: { a: 4.4, b: 9.49, c: 6 } } })).toEqual({ profiles: 3000, minShare: 4, maxShare: 9 })
    expect(auditBounds({ profiles: 3000, shares: { quick: { a: 2.5, b: 10.5 } } })).toEqual({ profiles: 3000, minShare: 3, maxShare: 11 })
    expect(code31(() => auditBounds({ shares: {} }))).toBe(31)
  })

  it('les candidats nommés par un contrôle en échec (initiales ou identifiant)', () => {
    const audit = { checks: [{ id: 'quick-candidate', hard: true, ok: false, detail: 'GA 15/22, NA 14/22' }, { id: 'excluded-least', hard: true, ok: false, detail: 'polony 61/100' }, { id: 'bank-few-mains', hard: false, ok: false, detail: 'ÉP' }] }
    const hard = failedHardChecks(audit)
    expect(hard.map(c => c.id)).toEqual(['quick-candidate', 'excluded-least'])
    expect(namedCandidates(hard, cards).sort()).toEqual(['arthaud', 'attal', 'polony'])
    expect(namedCandidates([{ detail: 'écart 7' }], cards)).toEqual([])
  })
})

describe('lib/remeasure : les trois constantes exactes', () => {
  it('le calcul des tests redonne exactement les chiffres publiés, et leurs règles d’indice tiennent', () => {
    expect([Math.min(...shares.compatibleShare), Math.max(...shares.compatibleShare)]).toEqual([M.ECHIQUIER_WEIGH.compatibleShare.low, M.ECHIQUIER_WEIGH.compatibleShare.high])
    expect([Math.min(...shares.deduced), Math.max(...shares.deduced)]).toEqual([M.ECHIQUIER_CROSS.deduced.low, M.ECHIQUIER_CROSS.deduced.high])
    expect(shares.style).toEqual([...M.ECHIQUIER_MANNER.style])
    expect(shares.styleQuick).toEqual([...M.ECHIQUIER_MANNER.styleQuick])
    expect(indexRules(shares).every(r => r.ok)).toBe(true)
    expect(patchExactConstants(methodText, shares, published)).toEqual({ text: methodText, patched: [] })
  })

  it('règles d’indice cassées : la plus basse ou la plus haute ailleurs, les deux plus hautes hors des extrêmes', () => {
    const broken = indexRules({ compatibleShare: [40, 52, 41, 42, 37], deduced: [31, 22, 9, 5, 30], style: [72, 73, 71, 70, 71], styleQuick: [74, 71, 72, 71, 73] })
    expect(broken.map(r => [r.constant, r.ok, r.indices])).toEqual([
      ['ECHIQUIER_WEIGH.compatibleShare', false, [4, 1]],
      ['ECHIQUIER_CROSS.deduced', true, [3, 0]],
      ['ECHIQUIER_MANNER.style', false, [0, 1]],
      ['ECHIQUIER_MANNER.styleQuick', true, [0, 4]],
    ])
  })

  it('seuls les nombres qui bougent sont remplacés, une ligne chacun ; libellés et autres constantes intacts', () => {
    const moved = { ...shares, compatibleShare: shares.compatibleShare.map((x, i) => (i === 3 ? 36.4 : x)), style: shares.style.map((x, i) => (i === 0 ? 73 : x)) }
    const r = patchExactConstants(methodText, moved, published)
    expect(r.patched).toEqual(['ECHIQUIER_WEIGH.compatibleShare', 'ECHIQUIER_MANNER.style'])
    expect(changedLines(methodText, r.text)).toEqual([
      ["  compatibleShare: { low: 37.1, lowWhere: 'à droite', high: 52, highWhere: 'à gauche' },", "  compatibleShare: { low: 36.4, lowWhere: 'à droite', high: 52, highWhere: 'à gauche' },"],
      ['  style: [72.7, 71.5, 72.1, 70.8, 72.9],', '  style: [73, 71.5, 72.1, 70.8, 72.9],'],
    ])
    expect(code31(() => patchExactConstants(methodText.replace('  styleQuick: [', '  styleQuick2: ['), moved, published))).toBe(31)
  })
})

describe('lib/remeasure : porte D5', () => {
  it('calibration : à 5 points (1 pour l’autre côté, 0,5 pour les moyennes et les rapports) de ECHIQUIER_PUBLISHED', () => {
    expect(calibrationDrift(PUB, M.ECHIQUIER_PUBLISHED).filter(d => d.over)).toEqual([])
    const over = calibrationDrift({ ...PUB, hitWithout: PUB.hitWithout + 5.2, wrongSideWithout: PUB.wrongSideWithout + 0.9, oneChoiceRatio: PUB.oneChoiceRatio + 0.6 }, M.ECHIQUIER_PUBLISHED).filter(d => d.over)
    expect(over.map(d => d.key)).toEqual(['ECHIQUIER_PUBLISHED.hitWithout', 'ECHIQUIER_PUBLISHED.oneChoiceRatio'])
    expect(code31(() => calibrationDrift({ hitWithout: 71 }, M.ECHIQUIER_PUBLISHED))).toBe(31)
  })

  it('écarts : jamais élargis, à l’arrondi publié', () => {
    const c = canned()
    expect(gapDrift(auditsOf(c), published).filter(g => g.widened)).toEqual([])
    // 92,4 − 43,6 s'arrondit à 92 − 44 = 48, l'écart publié ; 92,6 − 43,6 donne 49
    c['audit-echiquier']!.measured = { ...PUB, hitWithoutMax: 92.4, hitWithoutMin: 43.6 }
    expect(gapDrift(auditsOf(c), published).filter(g => g.widened)).toEqual([])
    c['audit-echiquier']!.measured.hitWithoutMax = 92.6
    c['audit-croix']!.measured.gapMax = M.ECHIQUIER_CROSS.gapMax + 0.04
    c['audit-facon-quick']!.measured.quickGap = [M.ECHIQUIER_MANNER.quickGap[0], M.ECHIQUIER_MANNER.quickGap[1] + 0.3]
    expect(gapDrift(auditsOf(c), published).filter(g => g.widened).map(g => g.key)).toEqual(['ECHIQUIER_PUBLISHED.hitWithoutMax−hitWithoutMin', 'ECHIQUIER_MANNER.quickGap[1]'])
    delete c['audit-poids']!.measured.mainGap
    expect(code31(() => gapDrift(auditsOf(c), published))).toBe(31)
  })

  it('verdicts « <outil>.<clé> » ; « passe » qui se perd et « non établi » qui ne passe plus sont des dégradations', () => {
    const v = currentVerdicts(auditsOf(canned()))
    expect(v).toEqual({
      'audit-croix.random.with': 'passe', 'audit-croix.neighbour.with': 'non établi', 'audit-croix.quick.random.with': 'passe',
      'audit-poids.main.with': 'non établi', 'audit-poids.quick.main.with': 'non établi', 'audit-facon.bank.with': 'non établi', 'audit-facon.quick.with': 'non établi',
    })
    expect(verdictDrift(v, v)).toEqual([])
    expect(verdictDrift({ ...v, 'audit-croix.random.with': 'non établi', 'audit-poids.main.with': 'ne passe pas', 'audit-facon.bank.with': 'passe' }, v)).toEqual([
      { key: 'audit-croix.random.with', baseline: 'passe', now: 'non établi' },
      { key: 'audit-poids.main.with', baseline: 'non établi', now: 'ne passe pas' },
    ])
    expect(code31(() => verdictDrift({}, { 'audit-croix.random.with': 'passe' }))).toBe(31)
  })
})

describe('remeasure.mjs, ligne de commande (copie temporaire, audits factices)', () => {
  let base: string
  const RUN = '2026-10-19-hebdo'
  const tsFile = (root: string) => join(root, 'src/elections/presidentielle-2027/election.ts')
  const mcFile = (root: string) => join(root, 'src/core/echiquierMethodCopy.ts')
  const fakeAuditPack = `
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
appendFileSync(join(ROOT, 'fake/calls.log'), 'audit-pack ' + argv.join(' ') + '\\n')
const fake = JSON.parse(readFileSync(join(ROOT, 'fake/audit-pack.json'), 'utf8'))
if (fake.loadError) process.exit(2)
const i = argv.indexOf('--research')
const research = i >= 0 ? argv[i + 1] : join(ROOT, 'research/presidentielle-2027')
const m = /audit: \\{ profiles: (\\d+), minShare: (\\d+), maxShare: (\\d+) \\}/.exec(readFileSync(join(ROOT, 'src/elections/presidentielle-2027/election.ts'), 'utf8'))
const vals = Object.values(fake.quick)
const lo = Math.round(Math.min(...vals)), hi = Math.round(Math.max(...vals))
const checks = [{ id: 'structure-ids', hard: true, ok: true }, ...fake.failing.map(f => ({ ...f, hard: true, ok: false })), { id: 'audit-displayed', hard: true, ok: lo === +m[2] && hi === +m[3], detail: 'mesuré : ' + lo + ' à ' + hi + ' %' }]
writeFileSync(join(research, 'audit.json'), JSON.stringify({ profiles: 3000, shares: { quick: fake.quick }, checks }, null, 2) + '\\n')
process.exit(checks.some(c => c.hard && !c.ok) ? 1 : 0)
`
  const fakeAudit = (tool: string) => `
import { appendFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
appendFileSync(join(ROOT, 'fake/calls.log'), '${tool} ' + argv.join(' ') + '\\n')
const name = '${tool}' + (argv.includes('--quick') ? '-quick' : '')
process.stdout.write(readFileSync(join(ROOT, 'fake', name + '.json'), 'utf8').trim() + '\\n')
`
  beforeAll(() => {
    base = mkdtempSync(join(tmpdir(), 'isoloir-remeasure-'))
    cpSync(join(REPO_ROOT, 'src'), join(base, 'src'), { recursive: true, filter: f => !/\/media(\/|$)/.test(f) })
    mkdirSync(join(base, 'tests/fixtures'), { recursive: true })
    cpSync(join(REPO_ROOT, 'tests/fixtures/echiquier-profiles.ts'), join(base, 'tests/fixtures/echiquier-profiles.ts'))
    mkdirSync(join(base, 'research/presidentielle-2027/veille'), { recursive: true })
    cpSync(join(REPO_ROOT, 'research/presidentielle-2027/config.json'), join(base, 'research/presidentielle-2027/config.json'))
    mkdirSync(join(base, 'tools'), { recursive: true })
    writeFileSync(join(base, 'tools/audit-pack.mjs'), fakeAuditPack)
    for (const t of ['audit-echiquier', 'audit-croix', 'audit-poids', 'audit-facon']) writeFileSync(join(base, `tools/${t}.mjs`), fakeAudit(t))
    // Une exécution en cours dans cette copie, dont l'application a touché Gabriel Attal
    mkdirSync(join(base, `local/runs/${RUN}`), { recursive: true })
    writeFileSync(join(base, 'local/lock.json'), JSON.stringify({ runId: RUN, kind: 'hebdo', worktrees: [{ path: base, runId: RUN }], startedAt: '2026-10-19T06:00:00+02:00', heartbeatAt: '2026-10-19T06:00:00+02:00', phase: 'essai' }))
    writeFileSync(join(base, `local/runs/${RUN}/apply-report.json`), JSON.stringify({ bundles: { 'candidat:attal': ['a'.repeat(40)] } }))
  })
  afterAll(() => rmSync(base, { recursive: true, force: true }))
  beforeEach(() => {
    writeFileSync(tsFile(base), electionText)
    writeFileSync(mcFile(base), methodText)
    rmSync(join(base, 'fake'), { recursive: true, force: true })
    rmSync(join(base, 'research/presidentielle-2027/audit.json'), { force: true })
    // La référence D5 publiée (origin/main ; ici une copie hors de git, lue telle quelle) : les verdicts du jeu factice
    writeBaseline(currentVerdicts(auditsOf(canned())))
    mkdirSync(join(base, 'fake'))
    writeFileSync(join(base, 'fake/calls.log'), '')
    setFake({ quick: { attal: pack.election.audit!.minShare + 0.2, lepen: pack.election.audit!.maxShare - 0.2 }, failing: [] })
    for (const [k, v] of Object.entries(canned())) setAudit(k, v)
  })
  const baselineFile = () => join(base, 'research/presidentielle-2027/veille/d5-baseline.json')
  const writeBaseline = (verdicts: Json) => writeFileSync(baselineFile(), JSON.stringify({ format: 'isoloir-veille-d5/1', measuredAt: '2026-10-17', verdicts }))
  const setFake = (v: Json) => writeFileSync(join(base, 'fake/audit-pack.json'), JSON.stringify(v))
  const setAudit = (k: string, v: Json) => writeFileSync(join(base, `fake/${k}.json`), JSON.stringify(v))
  const calls = () => readFileSync(join(base, 'fake/calls.log'), 'utf8').trim().split('\n')
  /** local : l'état local (par défaut celui d'une exécution en cours dans cette copie) ; « libre » : aucun verrou */
  const cli = (args: string[] = [], { local = join(base, 'local') } = {}) => {
    try {
      const out = execFileSync(process.execPath, [join(REPO_ROOT, 'tools/veille/remeasure.mjs'), ...args, '--root', base, '--now', '2026-10-19T09:00:00+02:00'], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ISOLOIR_VEILLE_LOCAL: local, ISOLOIR_VEILLE_NO_RECORD: '1' },
      })
      return { code: 0, json: JSON.parse(out.trim().split('\n').at(-1)!) }
    } catch (err) {
      const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
      return { code: e.status as number, json: JSON.parse(String(e.stdout).trim().split('\n').at(-1) || '{}'), stderr: String(e.stderr) }
    }
  }

  it('rien ne bouge : audit-pack deux fois, les sept audits D5, aucun fichier du code modifié', () => {
    const r = cli()
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ auditPatched: false, constantsPatched: [], baseline: 'lue' })
    expect(r.json.files).toEqual(['research/presidentielle-2027/audit.json'])
    expect(readFileSync(tsFile(base), 'utf8')).toBe(electionText)
    expect(readFileSync(mcFile(base), 'utf8')).toBe(methodText)
    expect(calls()).toEqual([
      'audit-pack presidentielle-2027 --quiet',
      'audit-pack presidentielle-2027 --quiet',
      'audit-echiquier --profiles 1000 --noisy 60 --json',
      'audit-croix --noisy 60 --json',
      'audit-croix --noisy 60 --quick --json',
      'audit-poids --noisy 60 --json',
      'audit-poids --noisy 60 --quick --json',
      'audit-facon --noisy 60 --json',
      'audit-facon --noisy 60 --quick --json',
    ])
    expect(r.json.drift.find((d: Json) => d.key === 'ECHIQUIER_CROSS.gapMax')).toEqual({ key: 'ECHIQUIER_CROSS.gapMax', published: M.ECHIQUIER_CROSS.gapMax, measured: M.ECHIQUIER_CROSS.gapMax })
  })

  it('les parts de l’accueil bougent : la seule ligne « audit » est reportée, la seconde passe réussit', () => {
    setFake({ quick: { attal: 2.6, lepen: 10.4, roussel: 6 }, failing: [] })
    const r = cli()
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ auditPatched: true, audit: { profiles: 3000, minShare: 3, maxShare: 10 } })
    expect(changedLines(electionText, readFileSync(tsFile(base), 'utf8')).map(([, b]) => b)).toEqual(['  audit: { profiles: 3000, minShare: 3, maxShare: 10 },'])
    expect(r.json.files).toContain('src/elections/presidentielle-2027/election.ts')
  })

  it('--dry-run : les mêmes mesures, rien n’est écrit (audit-pack écrit dans un dossier temporaire)', () => {
    setFake({ quick: { attal: 2.6, lepen: 10.4 }, failing: [] })
    writeFileSync(mcFile(base), methodText.replace('compatibleShare: { low: 37.1', 'compatibleShare: { low: 30'))
    const r = cli(['--dry-run'])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ auditPatched: true, constantsPatched: ['ECHIQUIER_WEIGH.compatibleShare'], files: [] })
    expect(readFileSync(tsFile(base), 'utf8')).toBe(electionText)
    expect(readFileSync(mcFile(base), 'utf8')).toContain('compatibleShare: { low: 30')
    expect(existsSync(join(base, 'research/presidentielle-2027/audit.json'))).toBe(false)
    expect(calls().filter(c => c.startsWith('audit-pack'))).toHaveLength(1)
    expect(calls()[0]).toMatch(/--research \S+isoloir-remeasure-/)
  })

  it('un contrôle dur en échec à la seconde passe : 30, paquet du candidat de l’exécution qu’il nomme', () => {
    setFake({ quick: { attal: 4.2, lepen: 8.8 }, failing: [{ id: 'quick-candidate', detail: 'GA 15/22, NA 14/22' }] })
    const r = cli()
    expect(r.code).toBe(30)
    expect(r.json.bundles).toEqual(['candidat:attal'])
    expect(r.json.reason).toMatch(/quick-candidate/)
    setFake({ quick: { attal: 4.2, lepen: 8.8 }, failing: [{ id: 'distinction', detail: 'NA-AK' }] })
    expect(cli().json.bundles).toEqual([])
  })

  it('les constantes exactes revenues à la mesure : remplacées nombre par nombre', () => {
    writeFileSync(mcFile(base), methodText.replace('compatibleShare: { low: 37.1', 'compatibleShare: { low: 30').replace('style: [72.7,', 'style: [70,'))
    const r = cli()
    expect(r.code).toBe(0)
    expect(r.json.constantsPatched).toEqual(['ECHIQUIER_WEIGH.compatibleShare', 'ECHIQUIER_MANNER.style'])
    expect(readFileSync(mcFile(base), 'utf8')).toBe(methodText)
  })

  it('calibration hors tolérance, écart élargi : 30, avec la raison et la table des écarts', () => {
    const c = canned()
    setAudit('audit-echiquier', { ...c['audit-echiquier'], measured: { ...PUB, hitWithout: PUB.hitWithout + 6 } })
    let r = cli()
    expect(r.code).toBe(30)
    expect(r.json.reason).toMatch(/calibration : ECHIQUIER_PUBLISHED\.hitWithout/)
    expect(r.json.bundles).toEqual([])
    setAudit('audit-echiquier', c['audit-echiquier']!)
    setAudit('audit-croix', { ...c['audit-croix'], measured: { gapMax: M.ECHIQUIER_CROSS.gapMax + 0.2 } })
    r = cli()
    expect(r.code).toBe(30)
    expect(r.json.reason).toMatch(/écart D5 élargi : ECHIQUIER_CROSS\.gapMax/)
  })

  it('--write-baseline écrit les verdicts (hors exécution) ; un verdict qui se dégrade ensuite donne 30', () => {
    rmSync(baselineFile())
    const free = mkdtempSync(join(tmpdir(), 'isoloir-remeasure-libre-'))
    const w = cli(['--write-baseline'], { local: free })
    expect(w.code).toBe(0)
    expect(w.json.baseline).toBe('écrite')
    const baseline = JSON.parse(readFileSync(join(base, 'research/presidentielle-2027/veille/d5-baseline.json'), 'utf8'))
    expect(baseline).toMatchObject({ format: 'isoloir-veille-d5/1', measuredAt: '2026-10-19' })
    expect(baseline.verdicts['audit-croix.random.with']).toBe('passe')
    expect(cli().json.baseline).toBe('lue')
    const c = canned()
    setAudit('audit-croix', { ...c['audit-croix'], extra: { verdicts: { 'random.with': 'non établi', 'neighbour.with': 'non établi' } } })
    const r = cli()
    expect(r.code).toBe(30)
    expect(r.json.reason).toMatch(/verdict D5 : audit-croix\.random\.with passe de « passe » à « non établi »/)
    rmSync(free, { recursive: true, force: true })
  })

  it('dans une exécution (verrou) : --write-baseline refusé (2), référence absente refusée (31) ; hors exécution, « absente »', () => {
    const before = readFileSync(baselineFile(), 'utf8')
    const w = cli(['--write-baseline'])
    expect(w.code).toBe(2)
    expect(w.json.reason).toMatch(/intégration/)
    expect(readFileSync(baselineFile(), 'utf8')).toBe(before)
    expect(calls().filter(Boolean)).toEqual([])
    rmSync(baselineFile())
    const missing = cli()
    expect(missing.code).toBe(31)
    expect(missing.json.reason).toMatch(/d5-baseline\.json absent/)
    const free = mkdtempSync(join(tmpdir(), 'isoloir-remeasure-libre-'))
    expect(cli([], { local: free }).json).toMatchObject({ code: 0, baseline: 'absente' })
    rmSync(free, { recursive: true, force: true })
  })

  it('31 : audit-pack ne charge pas le pack, ou une sortie --json incomplète', () => {
    setFake({ loadError: true })
    expect(cli().code).toBe(31)
    setFake({ quick: { attal: 4.2, lepen: 8.8 }, failing: [] })
    const c = canned()
    setAudit('audit-poids', { ...c['audit-poids'], measured: {} })
    expect(cli().code).toBe(31)
    writeFileSync(join(base, 'fake/audit-facon.json'), 'pas du json')
    setAudit('audit-poids', c['audit-poids']!)
    expect(cli().code).toBe(31)
  })
})
