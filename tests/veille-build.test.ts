// BUILD canonique de la présidentielle (tools/veille/build.mjs et research/presidentielle-2027/build.json ; contrat de
// la veille, tools/veille/CONTRACT.md §c.10 et §d.2) : build.json reproduit exactement la commande de la version en
// ligne (PIPELINE.md, étape 0), il suit son schéma et inclut les candidats en attente ; build.mjs refuse
// --reset-revisions, toute option inconnue et tout build.json douteux avant de rien lancer ; il enchaîne build-pack,
// check-log et l'historique, et traduit leurs échecs en 30. Aucun vrai BUILD ici : --dry-run sur le dépôt, ou une
// racine d'essai dont les trois outils sont des doublures qui notent leurs arguments.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { MANDATORY_INCLUDE } from '../tools/veille/lib/common.mjs'
import { SCHEMAS, validate } from '../tools/veille/schemas.mjs'
import { REPO_ROOT } from './helpers/workflow-harness'

const ROOT = REPO_ROOT.replace(/\/+$/, '')
const SCRIPT = join(ROOT, 'tools', 'veille', 'build.mjs')
const D = 'research/presidentielle-2027'
const S = 'src/elections/presidentielle-2027'
const readJsonFile = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const buildJson = readJsonFile(join(ROOT, D, 'build.json'))
const config: { candidates: { id: string; pendingPrimary?: boolean }[] } = readJsonFile(join(ROOT, D, 'config.json'))

const scratchDirs: string[] = []
const scratch = () => {
  const dir = mkdtempSync(join(tmpdir(), 'isoloir-veille-build-'))
  scratchDirs.push(dir)
  return dir
}
afterAll(() => {
  for (const d of scratchDirs) rmSync(d, { recursive: true, force: true })
})
const LOCAL = scratch()

interface Out {
  code: number | null
  json: Record<string, unknown> & { script: string; code: number; ok: boolean; reason?: string; bundles?: string[] }
  stdout: string
  stderr: string
}
function build(args: string[], env: Record<string, string> = {}): Out {
  // Garde-fou : sans --dry-run, seulement sur une racine d'essai (jamais le vrai BUILD du dépôt)
  const at = args.indexOf('--root')
  const onScratch = at >= 0 && String(args[at + 1] ?? '').startsWith(tmpdir())
  const refusedByParse = args.some(a => a.includes('reset-revisions')) || (args.length === 1 && args[0] === '--root')
  if (!args.includes('--dry-run') && !onScratch && !refusedByParse) throw new Error(`build.mjs sans --dry-run hors d'une racine d'essai : ${args.join(' ')}`)
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: tmpdir(),
    env: { ...process.env, ISOLOIR_VEILLE_LOCAL: LOCAL, ISOLOIR_VEILLE_NO_RECORD: '1', ...env },
    encoding: 'utf8',
  })
  const outLines = r.stdout.split('\n').filter(Boolean)
  expect(outLines, `une seule ligne JSON sur stdout :\n${r.stdout}\n${r.stderr}`).toHaveLength(1)
  return { code: r.status, json: JSON.parse(outLines[0]!), stdout: r.stdout, stderr: r.stderr }
}
/** La commande que build.json décrit (ses extensions comprises : apply.mjs --question en ajoute à la fin) */
const expectedCommand = (b = buildJson) => ['node', 'tools/build-pack.mjs', b.workflowOutput, b.researchDir, b.srcDir, ...b.expansions, '--include', b.include.join(',')]
/** Toujours --dry-run sur le dépôt : ce test ne lance jamais le vrai BUILD */
const dryRun = (...args: string[]) => build(['--dry-run', ...args])

/** La commande brute de la version en ligne, telle que PIPELINE.md la donne en explication (étape 0) */
function pipelineCommand(): string[] {
  const text = readFileSync(join(ROOT, D, 'PIPELINE.md'), 'utf8')
  const step0 = text.slice(0, text.indexOf('\n## 1.'))
  const found = step0.split('\n').filter(l => l.startsWith('node tools/build-pack.mjs $D/question-bank-output.json'))
  expect(found, 'PIPELINE.md, étape 0 : une seule commande build-pack de la présidentielle').toHaveLength(1)
  return found[0]!.replaceAll('$D', D).trim().split(/\s+/)
}

describe('build.json : la seule source du BUILD', () => {
  it('suit BUILD_CONFIG et porte sa note en français', () => {
    expect(validate(SCHEMAS.BUILD_CONFIG, buildJson)).toEqual([])
    expect(buildJson._note).toMatch(/Seule commande BUILD/)
    expect(buildJson._note).toMatch(/node tools\/veille\/build\.mjs/)
  })

  it('include = les candidats pendingPrimary de config.json, les quatre masqués de la primaire', () => {
    const pending = config.candidates.filter(c => c.pendingPrimary).map(c => c.id)
    expect([...buildJson.include].sort()).toEqual([...pending].sort())
    expect(buildJson.include).toEqual([...MANDATORY_INCLUDE])
  })

  it('les extensions historiques d’abord, puis celles qu’ajoute la veille ; chacune une fois, et elles existent', () => {
    expect(buildJson.expansions.slice(0, 2)).toEqual([`${D}/expansion-merged.json`, `${D}/expansion-merged-2.json`])
    expect(new Set(buildJson.expansions).size).toBe(buildJson.expansions.length)
    for (const f of buildJson.expansions) expect(f).toMatch(/^research\/presidentielle-2027\/expansion-merged(-\d+)?\.json$/)
    for (const f of [buildJson.workflowOutput, ...buildJson.expansions]) expect(existsSync(join(ROOT, f)), f).toBe(true)
  })

  it('--dry-run redonne exactement la commande de la version en ligne (PIPELINE.md, étape 0)', () => {
    const out = dryRun()
    expect(out.code).toBe(0)
    expect(out.json).toMatchObject({ script: 'build', code: 0, ok: true, root: ROOT })
    expect(out.json.command).toEqual(expectedCommand())
    // Le préfixe historique de PIPELINE.md (étape 0 : les deux premières extensions), puis --include toujours en dernier
    const command = out.json.command as string[]
    expect(command.slice(0, 7)).toEqual(pipelineCommand().slice(0, 7))
    expect(command.slice(0, 7)).toEqual(['node', 'tools/build-pack.mjs', `${D}/question-bank-output.json`, D, S, `${D}/expansion-merged.json`, `${D}/expansion-merged-2.json`])
    expect(command.slice(-2)).toEqual(['--include', 'faure,guedj,maurel,royal'])
    expect(out.json.checks).toEqual([
      ['node', 'tools/pipeline-helpers.mjs', 'check-log', D],
      ['node', 'tools/positions-history.mjs', 'check', D, S],
    ])
  })

  it('--dry-run --no-history : build-pack --no-history, et pas de contrôle de l’historique', () => {
    const out = dryRun('--no-history')
    expect(out.code).toBe(0)
    expect(out.json.command).toEqual([...expectedCommand(), '--no-history'])
    expect(out.json.checks).toEqual([['node', 'tools/pipeline-helpers.mjs', 'check-log', D]])
  })

  it('PIPELINE.md donne build.mjs comme commande BUILD', () => {
    const text = readFileSync(join(ROOT, D, 'PIPELINE.md'), 'utf8')
    const step0 = text.slice(0, text.indexOf('\n## 1.'))
    expect(step0).toMatch(/^node tools\/veille\/build\.mjs\s/m)
    expect(step0).toContain('$D/build.json')
  })
})

describe('build.mjs refuse les appels mal formés (sortie 2), avant de rien lancer', () => {
  it.each([
    [['--reset-revisions'], /reset-revisions est interdit/],
    [['--dry-run', '--reset-revisions'], /reset-revisions est interdit/],
    [['--dry-run', '--reset-revisions=false'], /reset-revisions est interdit/],
    [['--dry-run', 'reset-revisions'], /reset-revisions est interdit/],
    [['--dry-run', '--include', 'faure'], /option inconnue : --include/],
    [['--dry-run', '--expansion', 'x.json'], /option inconnue : --expansion/],
    [['--dry-run', `${D}/expansion-merged-3.json`], /argument inattendu/],
    [['--root'], /--root : valeur attendue/],
  ])('%j', (args, reason) => {
    const out = build(args)
    expect(out.code).toBe(2)
    expect(out.json).toMatchObject({ script: 'build', code: 2, ok: false })
    expect(out.json.reason).toMatch(reason)
    expect(out.stderr).toMatch(reason)
  })
})

// ——— Racine d'essai : build.json, config.json, fichiers d'entrée vides, et trois doublures d'outils ———

const STUB = (tool: string, body: string) => `import { appendFileSync } from 'node:fs'
appendFileSync(new URL('../calls.jsonl', import.meta.url), JSON.stringify({ tool: ${JSON.stringify(tool)}, argv: process.argv.slice(2), cwd: process.cwd() }) + '\\n')
${body}
`
interface FakeOptions {
  build?: Record<string, unknown> | null
  rawBuild?: string
  candidates?: { id: string; name: string; pendingPrimary?: boolean }[]
  missing?: string[]
}
function fakeRoot(opts: FakeOptions = {}) {
  const root = scratch()
  mkdirSync(join(root, D), { recursive: true })
  mkdirSync(join(root, 'tools'), { recursive: true })
  const cfg = opts.build === undefined ? structuredClone(buildJson) : opts.build
  if (opts.rawBuild !== undefined) writeFileSync(join(root, D, 'build.json'), opts.rawBuild)
  else if (cfg) writeFileSync(join(root, D, 'build.json'), JSON.stringify(cfg, null, 2))
  writeFileSync(join(root, D, 'config.json'), JSON.stringify({
    id: 'presidentielle-2027',
    candidates: opts.candidates ?? [
      { id: 'philippe', name: 'Édouard Philippe' },
      ...MANDATORY_INCLUDE.map(id => ({ id, name: id, pendingPrimary: true })),
      { id: 'glucksmann', name: 'Raphaël Glucksmann' },
    ],
  }))
  for (const f of [buildJson.workflowOutput, ...buildJson.expansions]) {
    if (!(opts.missing ?? []).includes(f)) writeFileSync(join(root, f), '{}')
  }
  writeFileSync(join(root, 'tools', 'build-pack.mjs'), STUB('build-pack', `console.log('construction simulée')
console.error('journal de construction simulé')
process.exitCode = Number(process.env.STUB_BUILD_CODE ?? 0)`))
  writeFileSync(join(root, 'tools', 'pipeline-helpers.mjs'), STUB('check-log', `if (process.env.STUB_CHECKLOG === 'perte') {
  console.log('PERTE  orphan retraites-1 retraites-1-z')
  console.log('À VOIR addcand-known polony retraites-1')
  console.log('1351 lignes ; 1 perte(s) de donnée, 1 ligne(s) à examiner')
  process.exitCode = 1
} else if (process.env.STUB_CHECKLOG === 'absent') {
  console.error('build-log.txt introuvable')
  process.exitCode = 2
} else {
  console.log('À VOIR addcand-known polony retraites-1')
  console.log('À VOIR reuse-question-reworded europe-3 <- choisir-2027:europe-3 (48 % de l’énoncé modifié)')
  console.log('1351 lignes ; 0 perte(s) de donnée, 2 ligne(s) à examiner')
}`))
  writeFileSync(join(root, 'tools', 'positions-history.mjs'), STUB('positions-history', `if (process.env.STUB_HISTORY_CODE === '1') console.error('chaîne incohérente : polony:retraites-1-a')
process.exitCode = Number(process.env.STUB_HISTORY_CODE ?? 0)`))
  return root
}
const callsOf = (root: string): { tool: string; argv: string[]; cwd: string }[] => {
  const file = join(root, 'calls.jsonl')
  return existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : []
}
const expectData = (out: Out, reason: RegExp) => {
  expect(out.code).toBe(30)
  expect(out.json).toMatchObject({ script: 'build', code: 30, ok: false, bundles: [] })
  expect(out.json.reason).toMatch(reason)
}

describe('build.mjs refuse un build.json ou une config douteux (sortie 30, bundles [])', () => {
  it('build.json absent', () => {
    const root = fakeRoot({ build: null })
    expectData(build(['--dry-run', '--root', root]), /build\.json introuvable/)
  })

  it('build.json illisible', () => {
    const root = fakeRoot({ rawBuild: '{ "format": ' })
    expectData(build(['--dry-run', '--root', root]), /JSON illisible/)
  })

  it.each([
    ['un format inconnu', { format: 'isoloir-build/2' }, /format/],
    ['une extension hors du dossier de recherche', { expansions: ['../ailleurs/expansion-merged.json'] }, /expansions/],
    ['une extension en double', { expansions: [`${D}/expansion-merged.json`, `${D}/expansion-merged.json`] }, /expansions/],
    ['une clé inconnue', { resetRevisions: true }, /resetRevisions/],
    ['un autre dossier de sortie', { srcDir: 'src/elections/choisir-2027' }, /srcDir/],
    ['un identifiant de candidat mal formé', { include: ['Faure'] }, /include/],
  ])('non conforme à BUILD_CONFIG : %s', (_label, patch, reason) => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), ...patch } })
    const out = build(['--dry-run', '--root', root])
    expectData(out, /build\.json non conforme/)
    expect(out.json.reason).toMatch(reason)
  })

  it('un include absent de config.json', () => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), include: [...MANDATORY_INCLUDE, 'inconnu'] } })
    expectData(build(['--dry-run', '--root', root]), /include : inconnu absent de research\/presidentielle-2027\/config\.json/)
  })

  it('un candidat pendingPrimary oublié : il sortirait de positions.ts', () => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), include: ['faure', 'guedj', 'maurel'] } })
    expectData(build(['--dry-run', '--root', root]), /manquants .*: royal/)
  })

  it('un candidat déjà publié dans include', () => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), include: [...MANDATORY_INCLUDE, 'glucksmann'] } })
    expectData(build(['--dry-run', '--root', root]), /en trop .*: glucksmann/)
  })

  it('include vide alors que des candidats sont en attente', () => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), include: [] } })
    expectData(build(['--dry-run', '--root', root]), /manquants .*faure, guedj, maurel, royal/)
  })

  it('une extension introuvable', () => {
    const root = fakeRoot({ missing: [`${D}/expansion-merged-2.json`] })
    expectData(build(['--dry-run', '--root', root]), /introuvable : research\/presidentielle-2027\/expansion-merged-2\.json/)
  })

  it('aucun outil n’est lancé quand build.json est refusé, même sans --dry-run', () => {
    const root = fakeRoot({ build: { ...structuredClone(buildJson), include: ['faure'] } })
    expectData(build(['--root', root]), /include/)
    expect(callsOf(root)).toEqual([])
  })

  it('une extension ajoutée en fin de build.json passe dans la commande, à sa place', () => {
    let k = buildJson.expansions.length + 1
    while (buildJson.expansions.includes(`${D}/expansion-merged-${k}.json`)) k++
    const extra = `${D}/expansion-merged-${k}.json`
    const root = fakeRoot({ build: { ...structuredClone(buildJson), expansions: [...buildJson.expansions, extra] } })
    writeFileSync(join(root, extra), '{}')
    const out = build(['--dry-run', '--root', root])
    expect(out.code).toBe(0)
    const cmd = out.json.command as string[]
    expect(cmd.slice(5, 5 + buildJson.expansions.length + 1)).toEqual([...buildJson.expansions, extra])
    expect(cmd.slice(-2)).toEqual(['--include', 'faure,guedj,maurel,royal'])
  })
})

describe('build.mjs enchaîne build-pack, check-log et l’historique (doublures)', () => {
  it('réussite : les trois outils, dans l’ordre, depuis la racine, avec les arguments de build.json', () => {
    const root = fakeRoot()
    const out = build(['--root', root])
    expect(out.code, out.stderr).toBe(0)
    const command = out.json.command as string[]
    expect(command).toEqual(expectedCommand())
    expect(out.json.checkLog).toEqual({
      lost: [],
      watch: ['addcand-known polony retraites-1', 'reuse-question-reworded europe-3 <- choisir-2027:europe-3 (48 % de l’énoncé modifié)'],
    })
    expect(out.json.historyCheck).toBe('ok')
    const calls = callsOf(root)
    expect(calls.map(c => c.tool)).toEqual(['build-pack', 'check-log', 'positions-history'])
    expect(calls[0]!.argv).toEqual(command.slice(2))
    expect(calls[1]!.argv).toEqual(['check-log', D])
    expect(calls[2]!.argv).toEqual(['check', D, S])
    for (const c of calls) expect(realpathSync(c.cwd)).toBe(realpathSync(root))
    // La sortie de build-pack est recopiée sur stderr, jamais sur stdout (une seule ligne JSON)
    expect(out.stderr).toContain('construction simulée')
    expect(out.stdout).not.toContain('construction simulée')
  })

  it('--no-history : build-pack le reçoit, l’historique n’est pas contrôlé', () => {
    const root = fakeRoot()
    const out = build(['--no-history', '--root', root])
    expect(out.code, out.stderr).toBe(0)
    expect(out.json.historyCheck).toBe('skipped')
    const calls = callsOf(root)
    expect(calls.map(c => c.tool)).toEqual(['build-pack', 'check-log'])
    expect(calls[0]!.argv.at(-1)).toBe('--no-history')
  })

  it('échec de build-pack : 30, la fin de sa sortie dans reason, rien ne suit', () => {
    const root = fakeRoot()
    const out = build(['--root', root], { STUB_BUILD_CODE: '1' })
    expectData(out, /build-pack a échoué \(code 1\)/)
    expect(out.json.reason).toContain('journal de construction simulé')
    expect(callsOf(root).map(c => c.tool)).toEqual(['build-pack'])
  })

  it('perte de donnée au check-log : 30, la ligne perdue dans reason, l’historique n’est pas lancé', () => {
    const root = fakeRoot()
    const out = build(['--root', root], { STUB_CHECKLOG: 'perte' })
    expectData(out, /check-log : 1 perte\(s\) de donnée : orphan retraites-1 retraites-1-z/)
    expect(callsOf(root).map(c => c.tool)).toEqual(['build-pack', 'check-log'])
  })

  it('check-log impossible (journal absent) : 30', () => {
    const root = fakeRoot()
    expectData(build(['--root', root], { STUB_CHECKLOG: 'absent' }), /check-log a échoué \(code 2\)[\s\S]*build-log\.txt introuvable/)
  })

  it('historique incohérent : 30', () => {
    const root = fakeRoot()
    expectData(build(['--root', root], { STUB_HISTORY_CODE: '1' }), /positions-history check a échoué \(code 1\)[\s\S]*chaîne incohérente/)
  })

  it('refuse de construire dans le dossier principal d’un dépôt git (sortie 2), sans rien lancer', () => {
    const root = fakeRoot()
    const init = spawnSync('git', ['init', '-q', root], { encoding: 'utf8' })
    expect(init.status).toBe(0)
    const out = build(['--root', root])
    expect(out.code).toBe(2)
    expect(out.json.reason).toMatch(/dossier principal du dépôt/)
    expect(callsOf(root)).toEqual([])
    // --dry-run n'écrit rien : il reste permis
    expect(build(['--dry-run', '--root', root]).code).toBe(0)
  })
})
