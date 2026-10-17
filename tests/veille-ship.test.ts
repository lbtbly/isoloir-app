// Publication de la veille automatique (tools/veille/{commit,ship,rederive}.mjs et lib/{git,ship}.mjs ; contrat :
// tools/veille/CONTRACT.md §d.10 à d.12) : le commit n'ajoute que les chemins du niveau, la mise en ligne refait les
// contrôles du moins cher au plus cher et traduit leurs codes (30 données, 31 code), fusionne sans rien réécrire (même
// arbre que HEAD, parents origin/main et HEAD), pousse sans jamais forcer, s'arrête au gel même après le push, déploie et
// contrôle la production ; la reprise rejoue l'exécution dans un worktree neuf. Tout se passe dans des dépôts git
// temporaires (un « origin » nu, aucun réseau) : npx, pnpm, vercel et curl sont de faux exécutables placés en tête du
// PATH (ISOLOIR_VEILLE_FAKE_BIN), les outils du dépôt et les scripts des autres constructeurs de faux scripts qui notent
// leurs appels et obéissent à un fichier de consignes.
import { spawnSync } from 'node:child_process'
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { CHANGE_CAUSES } from '../src/core/positionsHistory'
import { SCHEMAS, validate } from '../tools/veille/schemas.mjs'
import { CO_AUTHOR, EXIT, VeilleError } from '../tools/veille/lib/common.mjs'
import {
  CONTROL_PATHS, accordItemErrors, accordItemOf, assertSafePush, branchError, branchOfRun, mergeErrors, outsideTier, parsePorcelainZ,
  pathAllowed, pushArgs, pushRejected, withCoAuthor, worktreeBranchError,
} from '../tools/veille/lib/git.mjs'
import {
  DATA_TEST_FILES, HISTORY_CAUSES, accordDiffErrors, buildIncludeErrors, checkPlan, classifyVitest, configDiffErrors, decisionsErrors,
  electionDiffErrors, explainersErrors, failedFilesFromText, indexAssetOf, mapVeilleScript, mergePolicy, methodCopyDiffErrors, pickPort,
  portIsFree, preservesBase, prodCheck, referencedAssets,
} from '../tools/veille/lib/ship.mjs'
import { REPO_ROOT } from './helpers/workflow-harness'

const D = 'research/presidentielle-2027'
const S = 'src/elections/presidentielle-2027'
const RUN_ID = '2026-10-19-hebdo'
const SHA_A = 'a'.repeat(40)
const SLOW = { timeout: 60_000 }

/** Git isolé de la configuration de l'utilisateur (signature, crochets…), identité d'essai */
const GIT_ENV: Record<string, string> = {
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Essai',
  GIT_AUTHOR_EMAIL: 'essai@exemple.invalid',
  GIT_COMMITTER_NAME: 'Essai',
  GIT_COMMITTER_EMAIL: 'essai@exemple.invalid',
}
function git(cwd: string, ...args: string[]): string {
  const r = spawnSync('git', args, { cwd, env: { ...process.env, ...GIT_ENV }, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} : ${r.stderr}`)
  return r.stdout.trim()
}

const write = (file: string, text: string) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}
const writeJsonFile = (file: string, value: unknown) => write(file, `${JSON.stringify(value, null, 2)}\n`)
const readJsonFile = <T = Record<string, unknown>>(file: string) => JSON.parse(readFileSync(file, 'utf8')) as T

// ——— Faux outils ———

/**
 * Comportement d'un faux outil, choisi dans le fichier de consignes par « <nom>:<sous-commande>#<n> »,
 * « <nom>:<sous-commande> » puis « <nom> » : code de sortie, fichiers écrits (relatifs au dossier courant), commande
 * lancée en passant, rapport JSON de vitest, sortie.
 */
const FAKE_IMPL = `import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join } from 'node:path'
import { spawnSync } from 'node:child_process'
export function fake(name) {
  const argv = process.argv.slice(2)
  let sub = ''
  if (name === 'curl') sub = argv.includes('-w') ? 'status' : 'page'
  else if (argv[0] === '--step') sub = argv[1]
  else if (argv[0]) sub = argv[0].startsWith('--') ? argv[0] : basename(argv[0])
  const key = sub ? name + ':' + sub : name
  const log = process.env.FAKE_LOG
  const countFile = log + '.counts.json'
  const counts = existsSync(countFile) ? JSON.parse(readFileSync(countFile, 'utf8')) : {}
  const n = (counts[key] = (counts[key] ?? 0) + 1)
  writeFileSync(countFile, JSON.stringify(counts))
  appendFileSync(log, JSON.stringify({ name, sub, key, n, args: argv, cwd: process.cwd(), nowEnv: process.env.ISOLOIR_VEILLE_NOW ?? null }) + '\\n')
  const ctl = existsSync(process.env.FAKE_CTL) ? JSON.parse(readFileSync(process.env.FAKE_CTL, 'utf8')) : {}
  const b = ctl[key + '#' + n] ?? ctl[key] ?? ctl[name] ?? {}
  for (const [file, content] of Object.entries(b.writeFiles ?? {})) {
    const p = isAbsolute(file) ? file : join(process.cwd(), file)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, content)
  }
  if (b.run) spawnSync(b.run[0], b.run.slice(1), { stdio: 'ignore' })
  if (b.killParent) process.kill(process.ppid, 'SIGKILL')
  if (b.vitestReport) {
    const a = argv.find(x => x.startsWith('--outputFile'))
    writeFileSync(a.slice(a.indexOf('=') + 1), JSON.stringify(b.vitestReport))
  }
  if (b.stdoutFile) process.stdout.write(readFileSync(join(process.cwd(), b.stdoutFile), 'utf8'))
  if (b.stdout) process.stdout.write(b.stdout)
  if (b.stderr) process.stderr.write(b.stderr)
  process.exitCode = b.code ?? 0
}
`
/** Outils du dépôt et scripts des autres constructeurs, remplacés par de faux scripts dans le dépôt temporaire */
const FAKE_TOOLS: Record<string, string> = {
  'tools/veille/build.mjs': 'veille/build',
  'tools/veille/gate-time.mjs': 'veille/gate-time',
  'tools/veille/apply.mjs': 'veille/apply',
  'tools/veille/remeasure.mjs': 'veille/remeasure',
  'tools/veille/election-fields.mjs': 'veille/election-fields',
  'tools/veille/run.mjs': 'veille/run',
  'tools/pipeline-helpers.mjs': 'pipeline-helpers',
  'tools/positions-history.mjs': 'positions-history',
  'tools/build-pack.mjs': 'build-pack',
  'tools/audit-pack.mjs': 'audit-pack',
  'tools/e2e-offline.mjs': 'e2e-offline',
  'tools/merge-explainers.mjs': 'merge-explainers',
}
/** Les vrais scripts de ce lot que la reprise lance dans le worktree neuf (commit.mjs et ses bibliothèques) */
const REAL_COPIES = ['tools/veille/commit.mjs', 'tools/veille/lib/common.mjs', 'tools/veille/lib/git.mjs']

const HTML = '<!doctype html><script type="module" crossorigin src="/assets/index-AbC123.js"></script><link rel="stylesheet" href="/assets/index-Def456.css">'
const HAPPY: Record<string, unknown> = {
  'pnpm:build': { writeFiles: { 'dist/index.html': HTML, 'dist/assets/index-AbC123.js': '', 'dist/assets/index-Def456.css': '' } },
  'npx:vitest': { vitestReport: { numFailedTests: 0, testResults: [] } },
  'vercel:deploy': { stdout: 'https://isoloir-essai.vercel.app\n' },
  'curl:page': { stdoutFile: 'dist/index.html' },
  'curl:status': { stdout: '200' },
}

const OWNER_ENTRY = {
  questionId: 'sante-1', candidate: 'exemple', approachId: 'sante-1-a', weight: 1, rejects: false, nature: 'declaration',
  confidence: 'medium', summary: 'Position relevée par le propriétaire.', sources: [], verdict: 'confirmed', note: 'Décision du propriétaire.',
}
const VEILLE_ENTRY = {
  questionId: 'sante-1', candidate: 'exemple', approachId: 'sante-1-b', weight: 2, rejects: false, nature: 'declaration',
  confidence: 'high', summary: 'Résumé neutre d’une prise de position récente du candidat.',
  sources: [{ title: 'Entretien', url: 'https://exemple.org/entretien', date: '2026-10-16', publisher: 'Exemple' }],
  verdict: 'confirmed',
  note: 'Veille automatique du 19 octobre 2026 (2026-10-19-hebdo, changement abc). AVANT : inconnue. APRÈS : principale « … ». Cause : prise de position du 16 octobre 2026.',
  historyCause: 'prise-de-position', statedAt: '2026-10-16', veille: { runId: RUN_ID, claimKey: 'abc', at: '2026-10-19' },
}
/** Les trois constantes que remeasure.mjs recalcule, dans la forme de src/core/echiquierMethodCopy.ts */
const METHOD_COPY = `export const ECHIQUIER_CROSS = {
  deduced: { low: 5.7, lowWhere: 'à droite', high: 31.3, highWhere: 'à l’extrême gauche' },
}
export const ECHIQUIER_WEIGH = {
  compatibleShare: { low: 37.1, lowWhere: 'à droite', high: 52, highWhere: 'à gauche' },
}
export const ECHIQUIER_MANNER = {
  style: [72.7, 71.5, 72.1, 70.8, 72.9],
  styleQuick: [74.1, 71, 72.5, 71.6, 73.6],
}
`
const electionTs = (fields: Record<string, unknown> = {}) => `import type { ElectionInfo } from '../../core/types'

export const election: ElectionInfo = ${JSON.stringify({
  id: 'presidentielle-2027', name: 'Élection d’essai', dataVersion: '2026-10-15.2', dataFrozenAt: '2026-10-15',
  notes: ['Les positions ont été relevées.'], changelog: [], audit: { profiles: 3000, minShare: 1, maxShare: 2 },
  hidden: [], ranking: { excluded: { ids: [] }, axis: ['a'] }, forbiddenTerms: [], ...fields,
}, null, 2)}
`

interface Fx {
  tmp: string
  origin: string
  main: string
  wt: string
  local: string
  bin: string
  ctl: string
  log: string
  env: Record<string, string>
}
const fixtures: string[] = []
afterEach(() => {
  for (const dir of fixtures.splice(0)) rmSync(dir, { recursive: true, force: true })
})

/** Dépôt d'essai : origin nu, dépôt principal, worktree d'exécution veille-<runId> sur veille/<runId>, état local */
function makeFixture(): Fx {
  const tmp = realpathSync(mkdtempSync(join(tmpdir(), 'isoloir-ship-')))
  fixtures.push(tmp)
  const origin = join(tmp, 'origin.git')
  const main = join(tmp, 'depot')
  git(tmp, 'init', '-q', '--bare', '-b', 'main', origin)
  git(tmp, 'init', '-q', '-b', 'main', main)
  write(join(main, '.gitignore'), 'dist\nnode_modules\n.claude\n')
  writeJsonFile(join(main, D, 'config.json'), { contextDate: '2026-10-09', candidates: [{ id: 'exemple', name: 'Camille Exemple' }] })
  writeJsonFile(join(main, D, 'decisions.json'), { positions: [OWNER_ENTRY], addApproaches: [], edits: [] })
  writeJsonFile(join(main, D, 'bank.json'), { bank: { questions: [{ id: 'sante-1', approaches: [{ id: 'sante-1-a' }, { id: 'sante-1-b' }] }] }, positions: {} })
  writeJsonFile(join(main, D, 'explainers.json'), { explainers: [{ questionId: 'sante-1', summary: 'Texte publié.' }] })
  writeJsonFile(join(main, D, 'build.json'), { format: 'isoloir-build/1', expansions: [`${D}/expansion-merged.json`] })
  writeJsonFile(join(main, D, 'veille', 'policy.json'), { format: 'isoloir-veille-policy/1', ship: { checkDelaySeconds: 0, prodUrl: 'https://isoloir.exemple/' } })
  write(join(main, S, 'election.ts'), electionTs())
  write(join(main, S, 'transfer.ts'), "export const slots = {\n  questions: {\n    'sante-1': 0,\n  },\n}\n")
  write(join(main, S, 'candidates.ts'), 'export const candidates = []\n')
  write(join(main, 'src', 'autre.ts'), 'export const autre = 1\n')
  write(join(main, 'src', 'core', 'echiquierMethodCopy.ts'), METHOD_COPY)
  writeJsonFile(join(main, 'tests', 'fixtures', 'transfer-slots-presidentielle-2027.json'), { tag: 1, questions: { 'sante-1': 0 } })
  write(join(main, 'tools', 'fake-impl.mjs'), FAKE_IMPL)
  for (const [file, name] of Object.entries(FAKE_TOOLS)) {
    const rel = file.split('/').length > 2 ? '../fake-impl.mjs' : './fake-impl.mjs'
    write(join(main, file), `import { fake } from '${rel}'\nfake('${name}')\n`)
  }
  for (const file of REAL_COPIES) {
    mkdirSync(dirname(join(main, file)), { recursive: true })
    copyFileSync(join(REPO_ROOT, file), join(main, file))
  }
  git(main, 'add', '-A')
  git(main, 'commit', '-q', '-m', 'Départ')
  git(main, 'remote', 'add', 'origin', origin)
  git(main, 'push', '-q', 'origin', 'main')
  git(main, 'fetch', '-q', 'origin')
  const wt = join(main, '.claude', 'worktrees', `veille-${RUN_ID}`)
  git(main, 'worktree', 'add', '-q', '-b', `veille/${RUN_ID}`, wt, 'origin/main')

  const local = join(tmp, 'local')
  registerRun(local, wt, RUN_ID, { first: true })
  const bin = join(tmp, 'bin')
  write(join(tmp, 'bin-impl', 'fake-impl.mjs'), FAKE_IMPL)
  for (const name of ['npx', 'pnpm', 'vercel', 'curl']) {
    write(join(bin, name), `#!${process.execPath}\nimport(${JSON.stringify(pathToFileURL(join(tmp, 'bin-impl', 'fake-impl.mjs')).href)}).then(m => m.fake('${name}'))\n`)
    chmodSync(join(bin, name), 0o755)
  }
  const ctl = join(tmp, 'ctl.json')
  const log = join(tmp, 'calls.jsonl')
  writeJsonFile(ctl, HAPPY)
  const env: Record<string, string> = { ...(process.env as Record<string, string>), ...GIT_ENV, ISOLOIR_VEILLE_LOCAL: local, ISOLOIR_VEILLE_FAKE_BIN: bin, FAKE_CTL: ctl, FAKE_LOG: log }
  for (const k of ['ISOLOIR_VEILLE_ROOT', 'ISOLOIR_VEILLE_NOW', 'ISOLOIR_VEILLE_MAIN_ROOT', 'ISOLOIR_VEILLE_NO_RECORD', 'VEILLE_FAKE_BIN']) delete env[k]
  return { tmp, origin, main, wt, local, bin, ctl, log, env }
}

/** Verrou et run.json d'une exécution (le premier appel crée le verrou ; les suivants y ajoutent le worktree) */
function registerRun(local: string, wt: string, runId: string, o: { first?: boolean; essai?: boolean; kind?: string; mode?: string; branch?: string } = {}) {
  const { first = false, essai = false, kind = 'hebdo', branch = `veille/${runId}` } = o
  const mode = o.mode ?? (essai ? 'rapport' : 'publication')
  const lockFile = join(local, 'lock.json')
  const at = '2026-10-19T06:00:00+02:00'
  const lock = first || !existsSync(lockFile)
    ? { runId, kind, worktrees: [] as { path: string; runId: string }[], startedAt: at, heartbeatAt: at, phase: 'essai' }
    : readJsonFile<{ runId: string; worktrees: { path: string; runId: string }[] }>(lockFile)
  lock.worktrees.push({ path: wt, runId })
  writeJsonFile(lockFile, lock)
  writeJsonFile(join(local, 'runs', runId, 'run.json'), {
    format: 'isoloir-veille-run/1', runId, kind, essai, mode, worktree: wt, branch,
    baseCommit: git(wt, 'rev-parse', 'HEAD'), startedAt: at, today: /\d{4}-\d{2}-\d{2}$/.exec(runId)?.[0] ?? runId.slice(0, 10), status: 'en-cours',
  })
}

const ITEM_KIND: Record<string, string> = { C: 'candidat', R: 'retrait', H: 'hold', D: 'redeclaration', I: 'reintegration' }
/** Une attente du propriétaire (pending.json), accordée par défaut, créée par l'exécution hebdomadaire */
const pendingItem = (id: string, over: Record<string, unknown> = {}) => ({
  id, kind: ITEM_KIND[id[0]!] ?? 'hold', branch: null, worktree: null, createdAt: '2026-10-19T08:00:00+02:00', runId: RUN_ID,
  baseCommit: null, summary: 'Attente d’essai.', approveWith: `OK ${id}`, status: 'accordé', decidedAt: '2026-10-20T09:00:00+02:00', ...over,
})
const writePending = (fx: Fx, items: unknown[]) => writeJsonFile(join(fx.local, 'pending.json'), { format: 'isoloir-veille-pending/1', items })
/** Le worktree d'un accord (accord-<slug>, branche accord/<slug>) depuis origin/main, sous son propre verrou */
function makeAccord(fx: Fx, slug: string) {
  const runId = `accord-${slug}`
  git(fx.main, 'fetch', '-q', 'origin')
  const wt = join(fx.main, '.claude', 'worktrees', runId)
  git(fx.main, 'worktree', 'add', '-q', '-b', `accord/${slug}`, wt, 'origin/main')
  registerRun(fx.local, wt, runId, { first: true, kind: 'accord', branch: `accord/${slug}` })
  return { wt, runId }
}

/** Les changements de données d'une exécution, validés par commit.mjs (une entrée de veille, dataVersion, contextDate) */
function commitRunChanges(fx: Fx, { entry = VEILLE_ENTRY as Record<string, unknown>, election = { dataVersion: '2026-10-19.1' } as Record<string, unknown> } = {}) {
  writeJsonFile(join(fx.wt, D, 'decisions.json'), { positions: [OWNER_ENTRY, entry], addApproaches: [], edits: [] })
  write(join(fx.wt, S, 'election.ts'), electionTs(election))
  writeJsonFile(join(fx.wt, D, 'config.json'), { contextDate: '2026-10-19', candidates: [{ id: 'exemple', name: 'Camille Exemple' }] })
  const msg = join(fx.tmp, 'message.txt')
  write(msg, 'Veille automatique du 19 octobre 2026 : une position revue.\n')
  const r = runScript(fx, 'commit.mjs', ['--message-file', msg])
  expect(r.code).toBe(0)
  return r.out
}

interface Out {
  code: number
  ok: boolean
  reason?: string
  bundles?: string[]
  sha?: string | null
  empty?: boolean
  files?: string[]
  outside?: string[]
  merge?: string
  base?: string
  head?: string
  tree?: string
  dryRun?: boolean
  commands?: string[]
  failedCheck?: string
  failedTests?: string[]
  checks?: { id: string; code: number }[]
  lastShip?: Record<string, unknown> | null
  worktree?: string
  branch?: string
  steps?: { id: string; code: number }[]
  copied?: string[]
  pushed?: boolean
  [key: string]: unknown
}
/** Lance un script de ce lot (le vrai, depuis ce dépôt) sur le worktree d'essai : { code, out (ligne JSON), stderr } */
function runScript(fx: Fx, script: string, args: string[], { root = fx.wt } = {}) {
  const r = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'veille', script), ...args, '--root', root], { cwd: fx.tmp, env: fx.env, encoding: 'utf8' })
  const line = r.stdout.trim().split('\n').at(-1) ?? ''
  let out: Out
  try {
    out = JSON.parse(line) as Out
  } catch {
    throw new Error(`${script} : pas de ligne JSON (code ${r.status}) ; stdout : ${r.stdout} ; stderr : ${r.stderr}`)
  }
  return { code: r.status, out, stderr: r.stderr }
}
const ship = (fx: Fx, args: string[] = [], opts?: { root?: string }) => runScript(fx, 'ship.mjs', ['--port', '4391', ...args], opts)
const setCtl = (fx: Fx, patch: Record<string, unknown>) => writeJsonFile(fx.ctl, { ...readJsonFile<Record<string, unknown>>(fx.ctl), ...patch })
const calls = (fx: Fx) =>
  existsSync(fx.log) ? readFileSync(fx.log, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l) as { key: string; args: string[]; cwd: string; nowEnv?: string | null }) : []
const callKeys = (fx: Fx) => calls(fx).map(c => c.key).filter(k => k !== 'veille/run:heartbeat')
const originMain = (fx: Fx) => git(fx.origin, 'rev-parse', 'refs/heads/main')
/** Un autre clone pousse un commit sur origin/main (une autre session) */
function pushFromElsewhere(fx: Fx, { now = true } = {}) {
  const other = join(fx.tmp, 'autre')
  if (!existsSync(other)) git(fx.tmp, 'clone', '-q', fx.origin, other)
  write(join(other, 'README.md'), `Autre session ${Math.random()}\n`)
  git(other, 'add', '-A')
  git(other, 'commit', '-q', '-m', 'Travail d’une autre session')
  if (now) git(other, 'push', '-q', 'origin', 'HEAD:main')
  return other
}

const CHECK_ORDER = [
  'veille/build', 'pipeline-helpers:check-log', 'positions-history:check', 'build-pack:question-bank-output.json',
  'audit-pack:presidentielle-2027', 'npx:tsc', 'npx:eslint', 'npx:vitest', 'pnpm:build',
]

// ——————————————————————————————————————————————————————————————————————————————————————————————————————————

describe('lib/git : chemins permis, branches, message, push', () => {
  it('les chemins du niveau auto sont les données de la présidentielle, rien d’autre', () => {
    for (const p of [`${D}/decisions.json`, `${D}/veille/state.json`, `${D}/veille/runs/${RUN_ID}/changeset.json`, `${S}/bank.ts`, `${S}/election.ts`, `${S}/transfer.ts`, 'src/core/echiquierMethodCopy.ts', 'tests/fixtures/transfer-slots-presidentielle-2027.json']) {
      expect(pathAllowed(p, 'auto')).toBe(true)
    }
    for (const p of [`${S}/candidates.ts`, `${S}/media/x.jpg`, 'src/elections/index.ts', 'src/core/score.ts', 'tests/packs.test.ts', 'tools/veille/ship.mjs',
      'research/presidentielle-2027-bis/x.json', 'research/choisir-2027/bank.json', `${D}/../../src/core/score.ts`, `/${D}/x.json`, D, `${D}/`, 'package.json']) {
      expect(pathAllowed(p, 'auto')).toBe(false)
    }
  })

  it('le niveau accord ajoute candidates.ts, media/** et elections/index.ts, et aucun test', () => {
    for (const p of [`${S}/candidates.ts`, `${S}/media/portrait.jpg`, 'src/elections/index.ts', `${D}/config.json`]) expect(pathAllowed(p, 'accord')).toBe(true)
    for (const p of ['tests/hidden.test.ts', 'src/core/types.ts', `${S}/media`]) expect(pathAllowed(p, 'accord')).toBe(false)
  })

  it('lit git status -z, renommages compris, et nomme les deux chemins d’un renommage hors niveau', () => {
    const entries = parsePorcelainZ(` M ${D}/a.json\0R  ${D}/b.json\0src/autre.ts\0?? tests/x.test.ts\0`)
    expect(entries).toEqual([
      { xy: ' M', path: `${D}/a.json` },
      { xy: 'R ', path: `${D}/b.json`, orig: 'src/autre.ts' },
      { xy: '??', path: 'tests/x.test.ts' },
    ])
    expect(outsideTier(entries, 'auto')).toEqual(['src/autre.ts', 'tests/x.test.ts'])
  })

  it('seules veille/* et accord/* publient ; le niveau accord exige accord/*', () => {
    expect(branchError(`veille/${RUN_ID}`)).toBeNull()
    expect(branchError('accord/c-dupont-2026-10-20', 'accord')).toBeNull()
    expect(branchError('main')).toMatch(/veille\/\* et accord\/\*/)
    expect(branchError(null)).toMatch(/détachée/)
    expect(branchError(`veille/${RUN_ID}`, 'accord')).toMatch(/accord\/\*/)
    expect(() => branchError('veille/x', 'tout' as 'auto')).toThrow(VeilleError)
  })

  it('le message finit par la ligne Co-Authored-By, une seule fois', () => {
    expect(withCoAuthor('Veille du 19 octobre')).toBe(`Veille du 19 octobre\n\n${CO_AUTHOR}\n`)
    expect(withCoAuthor(`Veille\n\n${CO_AUTHOR}\n\n`)).toBe(`Veille\n\n${CO_AUTHOR}\n`)
    expect(withCoAuthor(`${CO_AUTHOR}\nVeille`).match(/Co-Authored-By/g)).toHaveLength(1)
    try {
      withCoAuthor(`\n${CO_AUTHOR}\n`)
      expect.unreachable()
    } catch (e) {
      expect((e as VeilleError).code).toBe(EXIT.USAGE)
    }
  })

  it('le seul push permis est « push -q origin <sha>:refs/heads/main » : jamais forcé, jamais ailleurs', () => {
    expect(pushArgs(SHA_A)).toEqual(['push', '-q', 'origin', `${SHA_A}:refs/heads/main`])
    const refused = [
      ['push', '--force', 'origin', `${SHA_A}:refs/heads/main`],
      ['push', '-f', 'origin', `${SHA_A}:refs/heads/main`],
      ['push', '-q', 'origin', `+${SHA_A}:refs/heads/main`],
      ['push', '--force-with-lease', 'origin', `${SHA_A}:refs/heads/main`],
      ['push', '-q', 'origin', `${SHA_A}:refs/heads/veille/x`],
      ['push', '-q', 'autre', `${SHA_A}:refs/heads/main`],
      ['push', '-q', 'origin', `${SHA_A}:refs/heads/main`, '--force'],
      ['push', '-q', '--mirror', 'origin'],
      ['push', '-q', 'origin', `:refs/heads/main`],
    ]
    for (const args of refused) {
      try {
        assertSafePush(args)
        expect.unreachable(args.join(' '))
      } catch (e) {
        expect((e as VeilleError).code, args.join(' ')).toBe(EXIT.CODE)
      }
    }
    expect(() => pushArgs('HEAD')).toThrow(VeilleError)
  })

  it('un refus du dépôt distant se distingue d’une panne', () => {
    expect(pushRejected(' ! [rejected]        x -> main (fetch first)\nerror: failed to push some refs')).toBe(true)
    expect(pushRejected(' ! [remote rejected] x -> main (pre-receive hook declined)')).toBe(true)
    expect(pushRejected('fatal: unable to access : Could not resolve host')).toBe(false)
  })

  it('une fusion doit garder l’arbre de HEAD et les parents origin/main, HEAD', () => {
    const ok = { mergeTree: 't1', headTree: 't1', parents: ['b', 'h'], base: 'b', head: 'h' }
    expect(mergeErrors(ok)).toEqual([])
    expect(mergeErrors({ ...ok, mergeTree: 't2' })[0]).toMatch(/arbre/)
    expect(mergeErrors({ ...ok, parents: ['h', 'b'] })[0]).toMatch(/parents/)
    expect(mergeErrors({ ...ok, parents: ['b'] })[0]).toMatch(/parents/)
  })
})

describe('lib/ship : contrôles, codes, gardes', () => {
  it('les causes permises sont celles de l’historique, sans « non-précisée »', () => {
    expect([...HISTORY_CAUSES].sort()).toEqual(CHANGE_CAUSES.filter(c => c !== 'non-précisée').sort())
  })

  it('la politique se fusionne sur un niveau, sans toucher aux valeurs par défaut', () => {
    const p = mergePolicy({ ship: { checkDelaySeconds: 0 } })
    expect(p.ship.checkDelaySeconds).toBe(0)
    expect(p.ship.vercelProject).toBe('isoloir')
    expect(p.ship.vercelScope).toBe('lbtbly')
    expect(mergePolicy({}).ship.checkDelaySeconds).toBe(20)
  })

  it('les contrôles vont du moins cher au plus cher, avec les commandes du contrat', () => {
    const plan = checkPlan({ node: 'node', port: 4371, vitestReport: '/tmp/v.json' })
    expect(plan.map(s => s.id)).toEqual(['build', 'check-log', 'history', 'primary', 'audit-pack', 'tsc', 'eslint', 'vitest', 'pnpm-build', 'e2e'])
    const by = Object.fromEntries(plan.map(s => [s.id, [s.cmd, ...s.args].join(' ')]))
    expect(by.build).toBe('node tools/veille/build.mjs')
    expect(by['check-log']).toBe(`node tools/pipeline-helpers.mjs check-log ${D}`)
    expect(by.history).toBe(`node tools/positions-history.mjs check ${D} ${S}`)
    expect(by.primary).toBe('node tools/build-pack.mjs research/choisir-2027/question-bank-output.json research/choisir-2027 src/elections/choisir-2027 research/choisir-2027/expansion-merged.json')
    expect(by['audit-pack']).toBe('node tools/audit-pack.mjs presidentielle-2027')
    expect(by.tsc).toBe('npx tsc --noEmit -p tsconfig.json')
    expect(by.eslint).toBe('npx eslint .')
    expect(by.vitest).toMatch(/^npx vitest run .*--outputFile\.json=\/tmp\/v\.json$/)
    expect(by['pnpm-build']).toBe('pnpm build')
    expect(by.e2e).toBe('node tools/e2e-offline.mjs 4371')
    expect(plan.some(s => s.args.some(a => a.includes('reset-revisions')))).toBe(false)
  })

  it('traduit les codes des outils : 1 = données (30), le reste = code (31)', () => {
    const plan = checkPlan({ port: 4371, vitestReport: '/tmp/v.json' })
    const map = (id: string) => {
      const step = plan.find(s => s.id === id)
      if (!step) throw new Error(`contrôle ${id} absent`)
      return step.map
    }
    const r = (code: number, stdout = '', stderr = '') => ({ code, stdout, stderr, signal: null })
    expect(map('check-log')(r(0))).toBeNull()
    expect(map('check-log')(r(1, 'orphan : x'))).toMatchObject({ code: 30, bundles: [] })
    expect(map('check-log')(r(2))).toMatchObject({ code: 31 })
    expect(map('history')(r(1))).toMatchObject({ code: 30 })
    expect(map('audit-pack')(r(1))).toMatchObject({ code: 30, bundles: [] })
    expect(map('audit-pack')(r(2))).toMatchObject({ code: 31 })
    for (const id of ['primary', 'tsc', 'eslint', 'pnpm-build', 'e2e']) expect(map(id)(r(1)), id).toMatchObject({ code: 31 })
    // build.mjs garde son propre code et ses paquets
    expect(map('build')(r(30, '{"script":"build","code":30,"ok":false,"reason":"build-pack","bundles":["candidat:exemple"]}'))).toEqual({ code: 30, reason: 'reconstruction : build-pack', bundles: ['candidat:exemple'] })
    expect(mapVeilleScript(r(2, '{"reason":"--reset-revisions est interdit"}'), 'x')).toMatchObject({ code: 2 })
    expect(mapVeilleScript(r(7), 'x')).toMatchObject({ code: 31 })
  })

  it('vitest : 30 si seuls des tests de données échouent, 31 sinon (video-editions compris)', () => {
    const report = (...names: string[]) => ({ testResults: names.map(n => ({ name: `/x/tests/${n}.test.ts`, status: 'failed', assertionResults: [] })) })
    expect(classifyVitest({ code: 0 })).toBeNull()
    expect(classifyVitest({ code: 1, report: report('packs', 'echiquier-weigh') })).toMatchObject({ code: 30, bundles: [], failedTests: ['packs', 'echiquier-weigh'] })
    expect(classifyVitest({ code: 1, report: report('packs', 'score') })).toMatchObject({ code: 31 })
    expect(classifyVitest({ code: 1, report: report('video-editions') })).toMatchObject({ code: 31 })
    expect(classifyVitest({ code: 1, report: { testResults: [] }, stdout: 'Error: config' })).toMatchObject({ code: 31 })
    const partial = { testResults: [{ name: '/x/tests/hidden.test.ts', status: 'passed', assertionResults: [{ status: 'failed' }] }] }
    expect(classifyVitest({ code: 1, report: partial })).toMatchObject({ code: 30 })
    // Sans rapport JSON : le texte de vitest
    expect(failedFilesFromText(' FAIL  tests/transfer-qr.test.ts > codes\n ❯ tests/home-back.test.ts (2 tests | 1 failed)')).toEqual(['transfer-qr', 'home-back'])
    expect(classifyVitest({ code: 1, stdout: ' FAIL  tests/transfer-qr.test.ts > codes' })).toMatchObject({ code: 30 })
    expect(DATA_TEST_FILES).toContain('echiquier-calibration')
    expect(DATA_TEST_FILES).not.toContain('video-editions')
  })

  it('lit l’asset d’entrée et les assets appelés par dist/index.html', () => {
    expect(indexAssetOf(HTML)).toBe('assets/index-AbC123.js')
    expect(indexAssetOf('<link rel="modulepreload" href="/assets/preact-1.js"><script src="/assets/index-Zz_9.js">')).toBe('assets/index-Zz_9.js')
    expect(indexAssetOf('<html></html>')).toBeNull()
    expect(referencedAssets(HTML)).toEqual(['assets/index-AbC123.js', 'assets/index-Def456.css'])
  })

  it('election.ts : au niveau auto, seules les clés de données changent ; au niveau accord, aussi hidden et ranking.excluded', () => {
    const base = { id: 'p', name: 'n', dataVersion: '1', notes: ['a'], hidden: [], ranking: { excluded: { ids: [] }, axis: ['a'] }, checks: { bank: { max: 110 } } }
    expect(electionDiffErrors(base, { ...base, dataVersion: '2', notes: ['b'], changelog: [{}], audit: { minShare: 3 }, dataFrozenAt: 'x' })).toEqual([])
    expect(electionDiffErrors(base, { ...base, name: 'autre' })[0]).toMatch(/« name »/)
    expect(electionDiffErrors(base, { ...base, checks: { bank: { max: 120 } } })[0]).toMatch(/« checks »/)
    expect(electionDiffErrors(base, { ...base, hidden: ['x'] })[0]).toMatch(/« hidden »/)
    expect(electionDiffErrors(base, { ...base, hidden: ['x'], ranking: { excluded: { ids: ['x'] }, axis: ['a'] } }, 'accord')).toEqual([])
    expect(electionDiffErrors(base, { ...base, ranking: { excluded: { ids: [] }, axis: ['b'] } }, 'accord')[0]).toMatch(/ranking/)
  })

  it('config.json : au niveau auto, seul contextDate change', () => {
    const base = { contextDate: '2026-10-09', quality: { bank: { max: 110 } } }
    expect(configDiffErrors(base, { ...base, contextDate: '2026-10-19' })).toEqual([])
    expect(configDiffErrors(base, { ...base, quality: { bank: { max: 120 } } })[0]).toMatch(/quality/)
    expect(configDiffErrors(base, { ...base, candidates: [] }, 'accord')).toEqual([])
  })

  it('decisions.json : chaque entrée changée dit AVANT et APRÈS, sa cause et sa date ; rien ne s’efface', () => {
    const base = { positions: [OWNER_ENTRY], addApproaches: [{ questionId: 'sante-1', id: 'sante-1-c', text: 't' }], edits: [] }
    const bank = { bank: { questions: [{ id: 'sante-1', approaches: [{ id: 'sante-1-a' }, { id: 'sante-1-b' }] }] } }
    const withEntry = (e: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ ...base, positions: [OWNER_ENTRY, e], ...extra })
    expect(decisionsErrors(base, withEntry(VEILLE_ENTRY), { baseBank: bank })).toEqual([])
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, note: 'Mise à jour.' }))[0]).toMatch(/AVANT et APRÈS/)
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, historyCause: 'non-précisée' }))[0]).toMatch(/historyCause/)
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, statedAt: undefined }))[0]).toMatch(/sans statedAt/)
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, historyCause: 'relecture' }))[0]).toMatch(/statedAt sans prise de position/)
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, approachId: 'sante-2-b' }))[0]).toMatch(/forme sante-1-\[a-p\]/)
    expect(decisionsErrors(base, withEntry({ ...VEILLE_ENTRY, approachId: 'sante-1-q' }))[0]).toMatch(/forme/)
    // Une entrée remplacée à sa place passe ; une entrée du propriétaire effacée, non
    const replaced = { ...OWNER_ENTRY, ...VEILLE_ENTRY, approachId: 'sante-1-a' }
    expect(decisionsErrors(base, { ...base, positions: [replaced] })).toEqual([])
    expect(decisionsErrors(base, { ...base, positions: [] })[0]).toMatch(/a disparu/)
    // Au niveau auto, aucune autre section ne change
    expect(decisionsErrors(base, { ...base, edits: [{ id: 'x' }] })[0]).toMatch(/« edits »/)
    expect(decisionsErrors(base, { ...base, edits: [{ id: 'x' }] }, { tier: 'accord' })).toEqual([])
    // Une approche ajoutée prend une lettre neuve
    const add = (id: string) => ({ ...base, addApproaches: [...base.addApproaches, { questionId: 'sante-1', id, text: 'u' }] })
    expect(decisionsErrors(base, add('sante-1-d'), { baseBank: bank })).toEqual([])
    expect(decisionsErrors(base, add('sante-1-b'), { baseBank: bank })[0]).toMatch(/déjà servi/)
    expect(decisionsErrors(base, add('sante-1-NEW1'), { baseBank: bank })[0]).toMatch(/forme/)
    expect(decisionsErrors(base, { ...base, addApproaches: [] })[0]).toMatch(/disparu de addApproaches/)
  })

  it('explications publiées intactes ; transfer-slots en ajout seul', () => {
    const base = { explainers: [{ questionId: 'q-1', summary: 'a' }] }
    expect(explainersErrors(base, { explainers: [...base.explainers, { questionId: 'q-x1', summary: 'n' }] })).toEqual([])
    expect(explainersErrors(base, { explainers: [{ questionId: 'q-1', summary: 'b' }] })[0]).toMatch(/a changé/)
    expect(explainersErrors(base, { explainers: [] })[0]).toMatch(/disparu/)
    expect(explainersErrors({ charts: [{ q: 1 }] }, { charts: [{ q: 1 }, { q: 2 }] }, 'explainer-charts.json')).toEqual([])
    expect(explainersErrors({ charts: [{ q: 1 }] }, { charts: [{ q: 2 }] }, 'explainer-charts.json')[0]).toMatch(/graphique/)
    const slots = { tag: 1, questions: { 'sante-1': 0 } }
    expect(preservesBase(slots, { tag: 1, questions: { 'sante-1': 0, 'sante-x1': 1 } })).toEqual([])
    expect(preservesBase(slots, { tag: 1, questions: { 'sante-1': 3 } })[0]).toMatch(/\$\.questions\.sante-1 a changé/)
    expect(preservesBase(slots, { tag: 1, questions: {} })[0]).toMatch(/disparu/)
  })

  it('contrôle de la production : le bon asset et des assets en 200, sinon trois essais espacés', async () => {
    type Call = { cmd: string; args: readonly string[] }
    const seen: Call[] = []
    const waits: number[] = []
    const runner = (served: string[], status = '200') => {
      let page = 0
      return (cmd: string, args: readonly string[]) => {
        seen.push({ cmd, args })
        if (args.includes('-w')) return { code: 0, stdout: status }
        return { code: 0, stdout: `<script src="/${served[Math.min(page++, served.length - 1)]}"></script>` }
      }
    }
    const base = { prodUrl: 'https://isoloir.exemple/', indexAsset: 'assets/index-New1.js', assets: ['assets/index-New1.js', 'assets/x.css'], attempts: 3, delayMs: 20000, wait: async (ms: number) => void waits.push(ms), stamp: () => 42 }
    const ok = await prodCheck({ ...base, runner: runner(['assets/index-New1.js']) })
    expect(ok.ok).toBe(true)
    expect(ok.tries).toHaveLength(1)
    expect(seen[0]?.args).toEqual(['-s', '--max-time', '30', '-A', 'IsoloirBot/1.0', 'https://isoloir.exemple/?v=42'])
    expect(seen.filter(c => c.args.includes('-w')).map(c => c.args.at(-1))).toEqual(['https://isoloir.exemple/assets/index-New1.js', 'https://isoloir.exemple/assets/x.css'])
    const late = await prodCheck({ ...base, runner: runner(['assets/index-Old.js', 'assets/index-New1.js']) })
    expect(late).toMatchObject({ ok: true })
    expect(late.tries).toHaveLength(2)
    waits.length = 0
    const stale = await prodCheck({ ...base, runner: runner(['assets/index-Old.js']) })
    expect(stale.ok).toBe(false)
    expect(stale.tries.map(t => t.served)).toEqual(['assets/index-Old.js', 'assets/index-Old.js', 'assets/index-Old.js'])
    expect(waits).toEqual([20000, 20000])
    const missing = await prodCheck({ ...base, runner: runner(['assets/index-New1.js'], '404') })
    expect(missing.ok).toBe(false)
    expect(missing.tries[0]?.missing).toEqual(['assets/index-New1.js (404)', 'assets/x.css (404)'])
  })

  it('port de l’e2e : repli sur 4373 puis 4375, jamais un port réservé', async () => {
    const free = (busy: number[]) => async (p: number) => !busy.includes(p)
    expect(await pickPort(4371, { isFree: free([]) })).toBe(4371)
    expect(await pickPort(4371, { isFree: free([4371]) })).toBe(4373)
    expect(await pickPort(4371, { isFree: free([4371, 4373]) })).toBe(4375)
    expect(await pickPort(4371, { isFree: free([4371, 4373, 4375]) })).toBeNull()
    expect(await pickPort(4361, { isFree: free([]) })).toBe(4373)
  })
})

describe('commit.mjs', () => {
  it('valide les seuls chemins du niveau, avec la ligne Co-Authored-By', SLOW, () => {
    const fx = makeFixture()
    const out = commitRunChanges(fx)
    expect(out.sha).toBe(git(fx.wt, 'rev-parse', 'HEAD'))
    expect([...(out.files ?? [])].sort()).toEqual([`${D}/config.json`, `${D}/decisions.json`, `${S}/election.ts`])
    const message = git(fx.wt, 'log', '-1', '--format=%B')
    expect(message.startsWith('Veille automatique du 19 octobre 2026')).toBe(true)
    expect(message.endsWith(CO_AUTHOR)).toBe(true)
    expect(git(fx.wt, 'status', '--porcelain')).toBe('')
    expect(existsSync(join(fx.local, 'runs', RUN_ID, 'commit.json'))).toBe(true)
  })

  it('refuse tout fichier hors des chemins (modifié ou non suivi) sans rien ajouter', SLOW, () => {
    const fx = makeFixture()
    const head = git(fx.wt, 'rev-parse', 'HEAD')
    writeJsonFile(join(fx.wt, D, 'decisions.json'), { positions: [OWNER_ENTRY, VEILLE_ENTRY], addApproaches: [], edits: [] })
    write(join(fx.wt, 'src', 'autre.ts'), 'export const autre = 2\n')
    write(join(fx.wt, 'tests', 'nouveau.test.ts'), '// essai\n')
    const msg = join(fx.tmp, 'm.txt')
    write(msg, 'Veille.\n')
    const r = runScript(fx, 'commit.mjs', ['--message-file', msg])
    expect(r.code).toBe(EXIT.CODE)
    expect(r.out.outside).toEqual(['src/autre.ts', 'tests/nouveau.test.ts'])
    expect(git(fx.wt, 'rev-parse', 'HEAD')).toBe(head)
    expect(git(fx.wt, 'diff', '--cached', '--name-only')).toBe('')
  })

  it('candidates.ts ne passe qu’au niveau accord : worktree accord-* sur sa branche accord/*, attente « accordé »', SLOW, () => {
    const fx = makeFixture()
    write(join(fx.wt, S, 'candidates.ts'), 'export const candidates = [1]\n')
    const msg = join(fx.tmp, 'm.txt')
    write(msg, 'Accord.\n')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg]).code).toBe(EXIT.CODE)
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord']).code).toBe(EXIT.USAGE)
    // Une branche accord/* créée dans un worktree veille-* ne vaut pas accord
    git(fx.wt, 'checkout', '-q', '-b', 'accord/c-autre-2026-10-20')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord']).out.reason).toMatch(/worktree accord-\*/)
    // Le worktree de l'accord, mais sans attente accordée : 2
    const { wt: awt, runId } = makeAccord(fx, 'c-exemple-2026-10-20')
    write(join(awt, S, 'candidates.ts'), 'export const candidates = [1]\n')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord'], { root: awt }).out.reason).toMatch(/absente de pending\.json/)
    writePending(fx, [pendingItem('C-exemple', { status: 'attente' })])
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord'], { root: awt }).out.reason).toMatch(/statut « attente »/)
    writePending(fx, [pendingItem('C-exemple', { runId })])
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord'], { root: awt }).out.reason).toMatch(/même exécution/)
    writePending(fx, [pendingItem('C-exemple')])
    const ok = runScript(fx, 'commit.mjs', ['--message-file', msg, '--tier', 'accord'], { root: awt })
    expect(ok.code, ok.stderr).toBe(0)
    expect(ok.out.files).toEqual([`${S}/candidates.ts`])
  })

  it('jamais les fichiers de contrôle du propriétaire (politique, verrous, référence D5, runbook) ; jamais une exécution quotidienne', SLOW, () => {
    const fx = makeFixture()
    const msg = join(fx.tmp, 'm.txt')
    write(msg, 'Veille.\n')
    const controls: [string, string][] = [[`${D}/veille/policy.json`, '{"format":"isoloir-veille-policy/1","softFreezeHours":0}\n'], [`${D}/veille/locks.json`, '{"format":"isoloir-veille-locks/1","locks":[]}\n'], [`${D}/veille/d5-baseline.json`, '{}\n'], [`${D}/VEILLE.md`, '# autre\n']]
    for (const [file, text] of controls) {
      write(join(fx.wt, file), text)
      const r = runScript(fx, 'commit.mjs', ['--message-file', msg])
      expect(r.code, file).toBe(EXIT.CODE)
      expect(r.out.outside, file).toEqual([file])
      git(fx.wt, 'checkout', '-q', '--', '.')
      git(fx.wt, 'clean', '-qfd')
    }
    registerRun(fx.local, fx.wt, RUN_ID, { first: true, kind: 'quotidien' })
    writeJsonFile(join(fx.wt, D, 'decisions.json'), { positions: [OWNER_ENTRY, VEILLE_ENTRY], addApproaches: [], edits: [] })
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg]).out.reason).toMatch(/quotidienne/)
  })

  it('rien à valider : sha null ; branche hors veille/* ou message absent : 2', SLOW, () => {
    const fx = makeFixture()
    const msg = join(fx.tmp, 'm.txt')
    write(msg, 'Veille.\n')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg]).out).toMatchObject({ code: 0, sha: null, empty: true })
    expect(runScript(fx, 'commit.mjs', ['--message-file', join(fx.tmp, 'absent.txt')]).code).toBe(EXIT.USAGE)
    expect(runScript(fx, 'commit.mjs', []).code).toBe(EXIT.USAGE)
    git(fx.wt, 'checkout', '-q', '-b', 'travail')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg]).code).toBe(EXIT.USAGE)
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg], { root: fx.main }).code).toBe(EXIT.USAGE)
  })
})

describe('ship.mjs : contrôles et départ', () => {
  it('--dry-run : tous les contrôles dans l’ordre, la fusion calculée (même arbre, parents origin/main et HEAD), rien de poussé', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    const before = originMain(fx)
    const r = ship(fx, ['--dry-run'])
    expect(r.code, r.stderr).toBe(0)
    expect(r.out.dryRun).toBe(true)
    const keys = callKeys(fx)
    const order = CHECK_ORDER.map(k => keys.findIndex(x => x === k || x.startsWith(`${k}:`)))
    expect(order.every(i => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
    const e2e = calls(fx).find(c => c.key.startsWith('e2e-offline'))
    expect(['4391', '4373', '4375']).toContain(e2e?.args[0])
    expect(keys.indexOf(`e2e-offline:${e2e?.args[0]}`)).toBeGreaterThan(keys.indexOf('pnpm:build'))
    // La fusion : arbre de HEAD, parents origin/main puis HEAD, message de fusion
    const M = r.out.merge as string
    expect(git(fx.wt, 'rev-parse', `${M}^{tree}`)).toBe(git(fx.wt, 'rev-parse', 'HEAD^{tree}'))
    expect(git(fx.wt, 'rev-list', '--parents', '-n', '1', M).split(' ').slice(1)).toEqual([before, git(fx.wt, 'rev-parse', 'HEAD')])
    expect(git(fx.wt, 'log', '-1', '--format=%B', M)).toBe(`Fusion de la branche veille/${RUN_ID}\n\n${CO_AUTHOR}`)
    expect(r.out.commands).toContain(`git push -q origin ${M}:refs/heads/main`)
    expect(r.out.commands?.some(c => c.endsWith('vercel deploy dist --project isoloir --scope lbtbly --prod --yes'))).toBe(true)
    // Rien de publié
    expect(originMain(fx)).toBe(before)
    expect(keys.some(k => k.startsWith('vercel') || k.startsWith('curl'))).toBe(false)
    expect(existsSync(join(fx.local, 'last-ship.json'))).toBe(false)
    expect(existsSync(join(fx.local, 'runs', RUN_ID, 'ship.json'))).toBe(true)
  })

  it('refuse de partir : essai sans --dry-run, STOP, PAUSE, arbre sale, port réservé, branche ou dossier', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    registerRun(fx.local, fx.wt, RUN_ID, { first: true, essai: true })
    expect(ship(fx).code).toBe(EXIT.USAGE)
    registerRun(fx.local, fx.wt, RUN_ID, { first: true })
    write(join(fx.local, 'STOP'), '')
    expect(ship(fx).code).toBe(EXIT.PAUSED)
    rmSync(join(fx.local, 'STOP'))
    write(join(fx.local, 'PAUSE'), 'raison\n')
    expect(ship(fx).code).toBe(EXIT.PAUSED)
    rmSync(join(fx.local, 'PAUSE'))
    for (const port of ['4320', '4347', '4361']) expect(runScript(fx, 'ship.mjs', ['--port', port, '--dry-run']).code).toBe(EXIT.USAGE)
    write(join(fx.wt, D, 'brouillon.json'), '{}\n')
    expect(ship(fx, ['--dry-run']).code).toBe(EXIT.USAGE)
    rmSync(join(fx.wt, D, 'brouillon.json'))
    expect(ship(fx, ['--dry-run'], { root: fx.main }).code).toBe(EXIT.USAGE)
    expect(ship(fx, ['--dry-run', '--tier', 'accord']).code).toBe(EXIT.USAGE)
    expect(ship(fx, ['--dry-run', '--reset-revisions']).code).toBe(EXIT.USAGE)
    expect(callKeys(fx).filter(k => !k.startsWith('veille/gate-time'))).toEqual([])
  })

  it('garde de fichiers : un fichier hors du niveau, une clé d’election.ts ou une note sans AVANT/APRÈS arrêtent tout avant les contrôles', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    write(join(fx.wt, 'src', 'autre.ts'), 'export const autre = 2\n')
    git(fx.wt, 'commit', '-q', '-am', 'Hors niveau')
    const r = ship(fx, ['--dry-run'])
    expect(r.code).toBe(EXIT.CODE)
    expect(r.out.outside).toEqual(['src/autre.ts'])
    expect(callKeys(fx).some(k => k.startsWith('veille/build'))).toBe(false)

    const fx2 = makeFixture()
    commitRunChanges(fx2, { election: { dataVersion: '2026-10-19.1', name: 'Autre nom' } })
    const r2 = ship(fx2, ['--dry-run'])
    expect(r2.code).toBe(EXIT.CODE)
    expect(r2.out.reason).toMatch(/« name »/)

    const fx3 = makeFixture()
    commitRunChanges(fx3, { entry: { ...VEILLE_ENTRY, note: 'Mise à jour sans le détail.' } })
    const r3 = ship(fx3, ['--dry-run'])
    expect(r3.code).toBe(EXIT.CODE)
    expect(r3.out.reason).toMatch(/AVANT et APRÈS/)
    expect(callKeys(fx3).some(k => k.startsWith('veille/build'))).toBe(false)
  })

  it('codes des contrôles : check-log 1 → 30, vitest de données → 30, tsc → 31, reconstruction qui change un fichier → 31', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    setCtl(fx, { 'pipeline-helpers:check-log': { code: 1, stdout: 'orphan : sante-1-b\n' } })
    const a = ship(fx, ['--dry-run'])
    expect(a.out).toMatchObject({ code: 30, failedCheck: 'check-log', bundles: [] })
    expect(callKeys(fx).some(k => k.startsWith('npx'))).toBe(false)

    writeJsonFile(fx.ctl, { ...HAPPY, 'npx:vitest': { code: 1, vitestReport: { testResults: [{ name: `${fx.wt}/tests/packs.test.ts`, status: 'failed', assertionResults: [] }] } } })
    expect(ship(fx, ['--dry-run']).out).toMatchObject({ code: 30, failedCheck: 'vitest', bundles: [], failedTests: ['packs'] })

    writeJsonFile(fx.ctl, { ...HAPPY, 'npx:vitest': { code: 1, vitestReport: { testResults: [{ name: `${fx.wt}/tests/video-editions.test.ts`, status: 'failed' }] } } })
    expect(ship(fx, ['--dry-run']).out).toMatchObject({ code: 31, failedCheck: 'vitest' })

    writeJsonFile(fx.ctl, { ...HAPPY, 'npx:tsc': { code: 2, stdout: 'error TS2322' } })
    expect(ship(fx, ['--dry-run']).out).toMatchObject({ code: 31, failedCheck: 'tsc' })

    writeJsonFile(fx.ctl, { ...HAPPY, 'veille/build': { writeFiles: { [`${S}/bank.ts`]: 'export const bank = 2\n' } } })
    const dirty = ship(fx, ['--dry-run'])
    expect(dirty.out).toMatchObject({ code: 31, failedCheck: 'build' })
    expect(dirty.out.reason).toMatch(/diff non vide/)
    git(fx.wt, 'checkout', '-q', '--', '.')
    git(fx.wt, 'clean', '-qfd')

    writeJsonFile(fx.ctl, { ...HAPPY, 'build-pack': { writeFiles: { 'src/elections/choisir-2027/bank.ts': 'x\n' } } })
    expect(ship(fx, ['--dry-run']).out).toMatchObject({ code: 31, failedCheck: 'primary' })
  })
})

describe('ship.mjs : fusion, push, déploiement', () => {
  it('publie : push de la fusion sur main, vercel deploy, contrôle de la production, last-ship.json', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    const head = git(fx.wt, 'rev-parse', 'HEAD')
    const r = ship(fx)
    expect(r.code, r.stderr).toBe(0)
    const M = originMain(fx)
    expect(r.out.merge).toBe(M)
    expect(git(fx.origin, 'rev-parse', `${M}^{tree}`)).toBe(git(fx.wt, 'rev-parse', 'HEAD^{tree}'))
    expect(git(fx.origin, 'rev-parse', `${M}^2`)).toBe(head)
    const deploy = calls(fx).find(c => c.key === 'vercel:deploy')
    expect(deploy?.args).toEqual(['deploy', 'dist', '--project', 'isoloir', '--scope', 'lbtbly', '--prod', '--yes'])
    expect(deploy?.cwd).toBe(fx.wt)
    const page = calls(fx).find(c => c.key === 'curl:page')
    expect(page?.args.slice(0, 5)).toEqual(['-s', '--max-time', '30', '-A', 'IsoloirBot/1.0'])
    expect(page?.args.at(-1)).toMatch(/^https:\/\/isoloir\.exemple\/\?v=\d+$/)
    const last = readJsonFile(join(fx.local, 'last-ship.json'))
    expect(validate(SCHEMAS.LAST_SHIP, last)).toEqual([])
    expect(last).toMatchObject({ sha: M, deployed: true, checked: true, indexAsset: 'assets/index-AbC123.js', dataVersion: '2026-10-19.1', runId: RUN_ID, deployUrl: 'https://isoloir-essai.vercel.app' })
    // La garde horaire passe trois fois : au départ, juste avant le push, avant le déploiement
    expect(callKeys(fx).filter(k => k.startsWith('veille/gate-time'))).toEqual(['veille/gate-time:push', 'veille/gate-time:push', 'veille/gate-time:deploy'])
  })

  it('origin/main a bougé avant la fusion : 10, rien de poussé ni déployé ; --simulate-moved force le même 10', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    pushFromElsewhere(fx)
    const theirs = originMain(fx)
    const r = ship(fx)
    expect(r.code).toBe(EXIT.MOVED)
    expect(originMain(fx)).toBe(theirs)
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)

    const fx2 = makeFixture()
    commitRunChanges(fx2)
    const before = originMain(fx2)
    const s = ship(fx2, ['--dry-run', '--simulate-moved'])
    expect(s.out).toMatchObject({ code: 10, simulated: true })
    expect(originMain(fx2)).toBe(before)
  })

  it('main bouge pendant les contrôles : le push simple est refusé (10) et n’écrase rien', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    const other = pushFromElsewhere(fx, { now: false })
    // La seconde garde horaire (juste avant le push) laisse une autre session pousser sur main
    setCtl(fx, { 'veille/gate-time:push#2': { run: ['git', '-C', other, 'push', '-q', 'origin', 'HEAD:main'] } })
    const r = ship(fx)
    expect(r.code).toBe(EXIT.MOVED)
    expect(r.out.reason).toMatch(/push refusé/)
    expect(originMain(fx)).toBe(git(other, 'rev-parse', 'HEAD'))
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)
  })

  it('gel au moment du déploiement : 11 après le push, rien de déployé, last-ship.json deployed: false', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    setCtl(fx, { 'veille/gate-time:deploy': { code: 11, stdout: '{"script":"gate-time","code":11,"ok":false,"reason":"gel du premier tour"}\n' } })
    const r = ship(fx)
    expect(r.code).toBe(EXIT.FROZEN)
    expect(r.out.reason).toMatch(/poussé, non déployé.*gel du premier tour/)
    expect(r.out.pushed).toBe(true)
    expect(originMain(fx)).toBe(r.out.merge)
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)
    expect(readJsonFile(join(fx.local, 'last-ship.json'))).toMatchObject({ sha: r.out.merge, deployed: false, checked: false })
  })

  it('gel dès le départ : 11 sans aucun contrôle', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    setCtl(fx, { 'veille/gate-time:push': { code: 11, stdout: '{"reason":"gel"}\n' } })
    expect(ship(fx, ['--dry-run', '--now', '2027-04-17T10:00:00+02:00']).code).toBe(EXIT.FROZEN)
    expect(calls(fx).find(c => c.key === 'veille/gate-time:push')?.args).toEqual(['--step', 'push', '--now', '2027-04-17T10:00:00+02:00'])
    expect(callKeys(fx)).toEqual(['veille/gate-time:push'])
  })

  it('vercel échoue : 40 avec la commande exacte ; la production ne suit pas : 41, PAUSE, aucun retour arrière', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    setCtl(fx, { 'vercel:deploy': { code: 1, stderr: 'Error: not authorized' } })
    const r = ship(fx)
    expect(r.code).toBe(EXIT.DEPLOY)
    expect(r.out.command).toBe(`cd ${fx.wt} && vercel deploy dist --project isoloir --scope lbtbly --prod --yes`)
    expect(readJsonFile(join(fx.local, 'last-ship.json'))).toMatchObject({ deployed: false, checked: false, sha: originMain(fx) })
    expect(existsSync(join(fx.local, 'PAUSE'))).toBe(false)

    const fx2 = makeFixture()
    commitRunChanges(fx2)
    setCtl(fx2, { 'curl:page': { stdout: '<script src="/assets/index-Ancien.js"></script>' } })
    const s = ship(fx2)
    expect(s.code).toBe(EXIT.PROD)
    expect(calls(fx2).filter(c => c.key === 'curl:page')).toHaveLength(3)
    expect(readJsonFile(join(fx2.local, 'last-ship.json'))).toMatchObject({ deployed: true, checked: false })
    const pause = readFileSync(join(fx2.local, 'PAUSE'), 'utf8')
    expect(pause).toMatch(/Aucun retour arrière automatique/)
    expect(pause).toMatch(/vercel deploy dist --project isoloir --scope lbtbly --prod --yes/)
    expect(calls(fx2).some(c => c.args.includes('rollback'))).toBe(false)
    // Tant que PAUSE existe, plus rien ne part
    expect(ship(fx2, ['--deploy-only']).code).toBe(EXIT.PAUSED)
  })

  it('--deploy-only : redéploie le commit poussé depuis un worktree neuf ; un autre arbre sur main donne 10', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    setCtl(fx, { 'vercel:deploy': { code: 1 } })
    expect(ship(fx).code).toBe(EXIT.DEPLOY)
    const pushed = originMain(fx)
    // La semaine suivante : worktree neuf sur origin/main, pnpm build, puis --deploy-only
    git(fx.main, 'fetch', '-q', 'origin')
    const nextId = '2026-10-26-hebdo'
    const wt2 = join(fx.main, '.claude', 'worktrees', `veille-${nextId}`)
    git(fx.main, 'worktree', 'add', '-q', '-b', `veille/${nextId}`, wt2, 'origin/main')
    registerRun(fx.local, wt2, nextId, { first: true })
    write(join(wt2, 'dist', 'index.html'), HTML)
    writeJsonFile(fx.ctl, HAPPY)
    rmSync(fx.log, { force: true })
    rmSync(`${fx.log}.counts.json`, { force: true })
    const r = ship(fx, ['--deploy-only'], { root: wt2 })
    expect(r.code, r.stderr).toBe(0)
    expect(callKeys(fx).filter(k => !k.startsWith('veille/gate-time'))).toEqual(['vercel:deploy', 'curl:page', 'curl:status', 'curl:status'])
    expect(readJsonFile(join(fx.local, 'last-ship.json'))).toMatchObject({ sha: pushed, deployed: true, checked: true })
    // dist construit depuis un autre arbre : refus ; main a pris un autre arbre : 10
    const last = readJsonFile(join(fx.local, 'last-ship.json'))
    writeJsonFile(join(fx.local, 'last-ship.json'), { ...last, deployed: false, distIndexSha1: '0'.repeat(40) })
    expect(ship(fx, ['--deploy-only'], { root: wt2 }).code).toBe(EXIT.CODE)
    writeJsonFile(join(fx.local, 'last-ship.json'), { ...last, deployed: false, tree: '1'.repeat(40) })
    expect(ship(fx, ['--deploy-only'], { root: wt2 }).code).toBe(EXIT.MOVED)
    pushFromElsewhere(fx)
    writeJsonFile(join(fx.local, 'last-ship.json'), { ...last, deployed: false })
    expect(ship(fx, ['--deploy-only'], { root: wt2 }).code).toBe(EXIT.MOVED)
  })

  it('rien au-delà de main : 0 sans push ni déploiement', SLOW, () => {
    const fx = makeFixture()
    const r = ship(fx)
    expect(r.out).toMatchObject({ code: 0, empty: true })
    expect(callKeys(fx).filter(k => !k.startsWith('veille/gate-time'))).toEqual([])
  })
})

describe('rederive.mjs', () => {
  /** Une exécution qui a commité, persisté son changeset et un fichier d'extension, puis vu main bouger */
  function movedRun() {
    const fx = makeFixture()
    write(join(fx.wt, D, 'expansion-output-3.json'), '{"essai":true}\n')
    writeJsonFile(join(fx.wt, D, 'veille', 'runs', RUN_ID, 'changeset.json'), { format: 'isoloir-veille-changeset/1', runId: RUN_ID, results: [] })
    commitRunChanges(fx)
    writeJsonFile(join(fx.local, 'runs', RUN_ID, 'changeset.json'), { format: 'isoloir-veille-changeset/1', runId: RUN_ID, results: [] })
    pushFromElsewhere(fx)
    expect(ship(fx).code).toBe(EXIT.MOVED)
    rmSync(fx.log, { force: true })
    rmSync(`${fx.log}.counts.json`, { force: true })
    return fx
  }

  it('rejoue l’exécution dans un worktree neuf depuis l’origin/main courant, avec ses propres scripts, jusqu’au commit', SLOW, () => {
    const fx = movedRun()
    const theirs = originMain(fx)
    setCtl(fx, { 'veille/apply:changeset.json': { writeFiles: { [`${D}/decisions.json`]: `${JSON.stringify({ positions: [OWNER_ENTRY, VEILLE_ENTRY], addApproaches: [], edits: [] }, null, 2)}\n` } } })
    const r = runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID, '--hold', 'candidat:autre'])
    expect(r.code, r.stderr).toBe(0)
    const wt2 = join(fx.main, '.claude', 'worktrees', `veille-${RUN_ID}-r1`)
    expect(r.out).toMatchObject({ worktree: wt2, branch: `veille/${RUN_ID}-r1`, attempt: 1, baseCommit: theirs })
    expect(git(wt2, 'branch', '--show-current')).toBe(`veille/${RUN_ID}-r1`)
    expect(git(wt2, 'rev-parse', 'HEAD^')).toBe(theirs)
    expect(r.out.sha).toBe(git(wt2, 'rev-parse', 'HEAD'))
    // Les étapes, dans l'ordre, lancées dans le worktree neuf
    const steps = calls(fx).filter(c => c.key !== 'veille/run:heartbeat')
    expect(steps.map(c => c.key)).toEqual(['pnpm:install', 'veille/apply:changeset.json', 'veille/build', 'veille/remeasure', 'veille/election-fields:--today', 'veille/run:report'])
    expect(steps.every(c => c.cwd === wt2)).toBe(true)
    expect(steps[0]?.args).toEqual(['install', '--frozen-lockfile', '--offline'])
    expect(steps[1]?.args).toEqual([join(fx.local, 'runs', RUN_ID, 'changeset.json'), '--hold', 'candidat:autre'])
    expect(steps[4]?.args.slice(0, 4)).toEqual(['--today', '2026-10-19', '--summary', join(fx.local, 'runs', RUN_ID, 'apply-report.json')])
    // Le commit : les données rejouées, le fichier d'extension et la trace de l'exécution recopiés, un message de reprise
    const files = git(wt2, 'show', '--name-only', '--format=', 'HEAD').split('\n').sort()
    expect(files).toEqual([`${D}/decisions.json`, `${D}/expansion-output-3.json`, `${D}/veille/runs/${RUN_ID}/changeset.json`])
    const message = git(wt2, 'log', '-1', '--format=%B')
    expect(message).toMatch(/^Veille automatique du 19 octobre 2026 : une position revue\.\n\nReprise n° 1 sur origin\/main /)
    expect(message.endsWith(CO_AUTHOR)).toBe(true)
    // Le worktree neuf travaille sous le verrou de l'exécution, et les retenus restent au changeset
    const lock = readJsonFile<{ worktrees: { path: string; runId: string }[] }>(join(fx.local, 'lock.json'))
    expect(lock.worktrees).toContainEqual({ path: wt2, runId: RUN_ID })
    expect(readJsonFile(join(fx.local, 'runs', RUN_ID, 'changeset.json')).holds).toEqual(['candidat:autre'])
    expect(readJsonFile(join(wt2, D, 'veille', 'runs', RUN_ID, 'changeset.json')).holds).toEqual(['candidat:autre'])
    expect(existsSync(join(fx.local, 'runs', RUN_ID, 'rederive-r1.json'))).toBe(true)
    // Le nouveau worktree se publie ensuite comme un autre
    writeJsonFile(fx.ctl, HAPPY)
    const s = ship(fx, ['--dry-run'], { root: wt2 })
    expect(s.code, s.stderr).toBe(0)
    expect(git(wt2, 'rev-list', '--parents', '-n', '1', s.out.merge as string).split(' ')[1]).toBe(theirs)
  })

  it('une étape rejouée en échec rend son code et ses paquets ; la reprise suivante prend r2', SLOW, () => {
    const fx = movedRun()
    setCtl(fx, { 'veille/remeasure': { code: 30, stdout: '{"script":"remeasure","code":30,"ok":false,"reason":"écart D5 élargi","bundles":["candidat:exemple"]}\n' } })
    const r = runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID])
    expect(r.out).toMatchObject({ code: 30, failedStep: 'remeasure', bundles: ['candidat:exemple'] })
    expect(r.out.reason).toMatch(/écart D5 élargi/)
    writeJsonFile(fx.ctl, HAPPY)
    const again = runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID, '--dry-run'])
    expect(again.out).toMatchObject({ code: 0, attempt: 2, branch: `veille/${RUN_ID}-r2` })
  })

  it('refuse sans le verrou de l’exécution (21), sans changeset (2), ou avec un paquet mal formé (2)', SLOW, () => {
    const fx = movedRun()
    const lockFile = join(fx.local, 'lock.json')
    const lock = readJsonFile(lockFile)
    writeJsonFile(lockFile, { ...lock, runId: '2026-10-20-quotidien', worktrees: [{ path: join(fx.tmp, 'ailleurs'), runId: '2026-10-20-quotidien' }] })
    expect(runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID]).code).toBe(EXIT.LOCKED)
    writeJsonFile(lockFile, lock)
    expect(runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID, '--hold', 'tout']).code).toBe(EXIT.USAGE)
    expect(runScript(fx, 'rederive.mjs', ['--run-id', 'pas un id']).code).toBe(EXIT.USAGE)
    rmSync(join(fx.local, 'runs', RUN_ID, 'changeset.json'))
    expect(runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID]).code).toBe(EXIT.USAGE)
    expect(existsSync(join(fx.main, '.claude', 'worktrees', `veille-${RUN_ID}-r1`))).toBe(false)
  })
})

describe('gardes de publication : contrôle, accord, horloge, sorties de route', () => {
  it('lib/git : fichiers de contrôle refusés partout ; worktree et branche ; attente d’accord ; branche de l’exécution', () => {
    expect([...CONTROL_PATHS].sort()).toEqual([`${D}/PIPELINE.md`, `${D}/VEILLE.md`, `${D}/veille/d5-baseline.json`, `${D}/veille/locks.json`, `${D}/veille/policy.json`])
    for (const p of CONTROL_PATHS) for (const t of ['auto', 'accord'] as const) expect(pathAllowed(p, t), `${p} ${t}`).toBe(false)
    expect(pathAllowed(`${D}/veille/state.json`, 'auto')).toBe(true)
    expect(worktreeBranchError('veille-2026-10-19-hebdo', 'veille/2026-10-19-hebdo')).toBeNull()
    expect(worktreeBranchError('veille-2026-10-19-hebdo', 'accord/c-dupont-2026-10-22')).toMatch(/accord-\*/)
    expect(worktreeBranchError('accord-c-dupont-2026-10-22', 'veille/x')).toMatch(/accord\/\*/)
    expect(accordItemOf('accord-c-dupont-2026-10-22')).toEqual({ id: 'C-dupont', kind: 'candidat', subject: 'dupont', date: '2026-10-22' })
    expect(accordItemOf('accord-h-2026-10-19-1-2026-10-22')).toMatchObject({ id: 'H-2026-10-19-1', kind: 'hold' })
    expect(accordItemOf('accord-r-lalanne-2026-10-22')).toMatchObject({ id: 'R-lalanne', kind: 'retrait' })
    expect(accordItemOf('2026-10-19-hebdo')).toBeNull()
    expect(accordItemOf('accord-z-x-2026-10-22')).toBeNull()
    const runId = 'accord-c-dupont-2026-10-22'
    expect(accordItemErrors(runId, [pendingItem('C-dupont')])).toEqual([])
    expect(accordItemErrors(runId, [])[0]).toMatch(/absente/)
    expect(accordItemErrors(runId, [pendingItem('C-dupont', { status: 'refusé' })])[0]).toMatch(/refusé/)
    expect(accordItemErrors(runId, [pendingItem('C-dupont', { decidedAt: '2026-10-19T07:00:00+02:00' })])[0]).toMatch(/décision/)
    expect(accordItemErrors(runId, [pendingItem('C-dupont', { runId })])[0]).toMatch(/même exécution/)
    expect(branchOfRun('veille/2026-10-19-hebdo', 'veille/2026-10-19-hebdo')).toBe(true)
    expect(branchOfRun('veille/2026-10-19-hebdo-r2', 'veille/2026-10-19-hebdo')).toBe(true)
    expect(branchOfRun('veille/2026-10-19-hebdo-rx', 'veille/2026-10-19-hebdo')).toBe(false)
    expect(branchOfRun('veille/candidat-dupont', 'veille/2026-10-19-hebdo')).toBe(false)
    expect(branchOfRun('veille/2026-10-19-hebdo', null)).toBe(false)
  })

  it('lib/ship : echiquierMethodCopy.ts par ses seuls nombres ; build.json include intact', () => {
    expect(methodCopyDiffErrors(METHOD_COPY, METHOD_COPY.replace('low: 37.1', 'low: 36.4').replace('style: [72.7,', 'style: [71.9,'))).toEqual([])
    expect(methodCopyDiffErrors(METHOD_COPY, METHOD_COPY.replace("lowWhere: 'à droite', high: 52", "lowWhere: 'au centre', high: 52"))[0]).toMatch(/1 correspondance|ailleurs/)
    expect(methodCopyDiffErrors(METHOD_COPY, METHOD_COPY.replace('style: [72.7,', "style: ['beaucoup',"))[0]).toMatch(/liste de nombres/)
    expect(methodCopyDiffErrors(METHOD_COPY, `${METHOD_COPY}export const AUTRE = 1\n`)[0]).toMatch(/ailleurs que dans les nombres/)
    expect(methodCopyDiffErrors(METHOD_COPY, METHOD_COPY.replace('  deduced:', '  deduit:'))[0]).toMatch(/0 correspondance/)
    expect(buildIncludeErrors({ include: ['faure'] }, { include: ['faure'], expansions: ['x'] })).toEqual([])
    expect(buildIncludeErrors({ include: ['faure', 'guedj'] }, { include: ['faure'] })[0]).toMatch(/include/)
  })

  it('lib/ship : un accord ne touche que l’attente accordée', () => {
    const cand = (id: string) => ({ id, name: `Camille ${id}` })
    const config = { contextDate: '2026-10-19', candidates: [cand('a'), cand('b')], forbiddenTerms: ['Parti A'], quality: { bank: { max: 110 } }, scoringExcluded: ['b'] }
    const election = { hidden: ['h'], forbiddenTerms: ['Parti A'], ranking: { excluded: { ids: ['b'], reason: 'r', since: 's', joined: {} }, axis: ['x'] } }
    const indexText = "x = { candidateIds: ['a', 'b'], hiddenCandidateIds: ['h'] }\ny = { candidateIds: ['p'] }\n"
    const base = { config, election, indexText }
    const C = accordItemOf('accord-c-dupont-2026-10-22')
    const newCand = {
      config: { ...config, contextDate: '2026-10-22', candidates: [...config.candidates, cand('dupont')], forbiddenTerms: ['Parti A', 'Parti D'], scoringExcluded: ['b', 'dupont'] },
      election: { ...election, forbiddenTerms: ['Parti A', 'Parti D'], ranking: { ...election.ranking, excluded: { ...election.ranking.excluded, ids: ['b', 'dupont'], joined: { dupont: '2026-10-22' } } } },
      indexText: indexText.replace("['a', 'b']", "['a', 'b', 'dupont']"),
    }
    const media = [{ status: 'A', path: `${S}/media/dupont.jpg` }, { status: 'M', path: `${S}/media/CREDITS.md` }, { status: 'A', path: `${S}/media/logos/parti-d.png` }]
    expect(accordDiffErrors({ item: C, base, head: newCand, media })).toEqual([])
    // Rien d'autre que l'attente : un autre candidat, un masqué démasqué, pendingPrimary, la liste d'un autre scrutin
    expect(accordDiffErrors({ item: C, base, head: { ...newCand, config: { ...newCand.config, candidates: [cand('a'), { ...cand('b'), pendingPrimary: true }, cand('dupont')] } } })[0]).toMatch(/autres que dupont/)
    expect(accordDiffErrors({ item: C, base, head: { ...newCand, election: { ...newCand.election, hidden: [] } } })[0]).toMatch(/hidden/)
    expect(accordDiffErrors({ item: C, base, head: { ...newCand, indexText: newCand.indexText.replace("['p']", "['p', 'q']") } })[0]).toMatch(/candidateIds/)
    expect(accordDiffErrors({ item: C, base, head: { ...newCand, config: { ...newCand.config, quality: { bank: { max: 120 } } } } })[0]).toMatch(/quality/)
    expect(accordDiffErrors({ item: C, base, head: newCand, media: [{ status: 'M', path: `${S}/media/a.jpg` }] })[0]).toMatch(/hors des fichiers/)
    expect(accordDiffErrors({ item: C, base, head: { ...newCand, config: { ...newCand.config, scoringExcluded: ['dupont'] } } })[0]).toMatch(/scoringExcluded/)
    // Un retrait : hidden gagne l'identifiant, et lui seul ; un retenu (H-) ne touche ni hidden ni la config des candidats
    const R = accordItemOf('accord-r-a-2026-10-22')
    const withdrawn = { config, election: { ...election, hidden: ['h', 'a'] }, indexText: indexText.replace("['a', 'b'], hiddenCandidateIds: ['h']", "['b'], hiddenCandidateIds: ['h', 'a']") }
    expect(accordDiffErrors({ item: R, base, head: withdrawn })).toEqual([])
    expect(accordDiffErrors({ item: R, base, head: { ...withdrawn, election: { ...election, hidden: ['h', 'a', 'b'] } } })[0]).toMatch(/hidden/)
    const H = accordItemOf('accord-h-2026-10-19-1-2026-10-22')
    expect(accordDiffErrors({ item: H, base, head: { ...base, config: { ...config, contextDate: '2026-10-22' } } })).toEqual([])
    expect(accordDiffErrors({ item: H, base, head: { ...base, election: { ...election, hidden: [] } } })[0]).toMatch(/hidden/)
    expect(accordDiffErrors({ item: H, base, head: { ...base, config: { ...config, candidates: [cand('a')] } } })[0]).toMatch(/autres que/)
    expect(accordDiffErrors({ item: null })[0]).toMatch(/attente/)
  })

  it('ship : un fichier de contrôle changé sur la branche (politique affaiblie) arrête tout, avant les contrôles', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    writeJsonFile(join(fx.wt, D, 'veille', 'policy.json'), { format: 'isoloir-veille-policy/1', softFreezeHours: 0, reportOnlyBetweenRounds: false })
    git(fx.wt, 'commit', '-q', '-am', 'Politique affaiblie')
    const r = ship(fx, ['--dry-run'])
    expect(r.code).toBe(EXIT.CODE)
    expect(r.out.outside).toEqual([`${D}/veille/policy.json`])
    expect(callKeys(fx).some(k => k.startsWith('veille/build'))).toBe(false)
  })

  it('ship : echiquierMethodCopy.ts ne passe que par les nombres des trois constantes', SLOW, () => {
    const fx = makeFixture()
    write(join(fx.wt, 'src', 'core', 'echiquierMethodCopy.ts'), METHOD_COPY.replace('low: 37.1', 'low: 36.4'))
    commitRunChanges(fx)
    expect(ship(fx, ['--dry-run']).code).toBe(0)
    const fx2 = makeFixture()
    write(join(fx2.wt, 'src', 'core', 'echiquierMethodCopy.ts'), METHOD_COPY.replace("highWhere: 'à gauche'", "highWhere: 'au centre'"))
    commitRunChanges(fx2)
    const r = ship(fx2, ['--dry-run'])
    expect(r.code).toBe(EXIT.CODE)
    expect(r.out.reason).toMatch(/echiquierMethodCopy/)
    expect(callKeys(fx2).some(k => k.startsWith('veille/build'))).toBe(false)
  })

  it('ship : STOP ou verrou perdu pendant les contrôles arrêtent avant le push ; STOP après le push, avant le déploiement', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    const before = originMain(fx)
    setCtl(fx, { 'e2e-offline': { writeFiles: { [join(fx.local, 'STOP')]: '' } } })
    const a = ship(fx)
    expect(a.code).toBe(EXIT.PAUSED)
    expect(originMain(fx)).toBe(before)
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)
    rmSync(join(fx.local, 'STOP'))
    // Une autre exécution a repris le verrou pendant l'e2e
    const other = { runId: '2026-10-20-quotidien', kind: 'quotidien', worktrees: [{ path: join(fx.tmp, 'ailleurs'), runId: '2026-10-20-quotidien' }], startedAt: '2026-10-20T07:00:00+02:00', heartbeatAt: '2026-10-20T07:00:00+02:00', phase: 'départ' }
    writeJsonFile(fx.ctl, { ...HAPPY, 'e2e-offline': { writeFiles: { [join(fx.local, 'lock.json')]: JSON.stringify(other) } } })
    const b = ship(fx)
    expect(b.code).toBe(EXIT.LOCKED)
    expect(originMain(fx)).toBe(before)
    // run.json marqué interrompu par une reprise : 21 aussi
    registerRun(fx.local, fx.wt, RUN_ID, { first: true })
    const runFile = join(fx.local, 'runs', RUN_ID, 'run.json')
    writeJsonFile(fx.ctl, { ...HAPPY, 'e2e-offline': { writeFiles: { [runFile]: JSON.stringify({ ...readJsonFile(runFile), status: 'interrompu' }) } } })
    expect(ship(fx).code).toBe(EXIT.LOCKED)
    expect(originMain(fx)).toBe(before)
    // STOP posé pendant la garde du déploiement (après le push) : 20, poussé, non déployé, last-ship.json deployed: false
    registerRun(fx.local, fx.wt, RUN_ID, { first: true })
    writeJsonFile(fx.ctl, { ...HAPPY, 'veille/gate-time:deploy': { writeFiles: { [join(fx.local, 'STOP')]: '' } } })
    const c = ship(fx)
    expect(c.code).toBe(EXIT.PAUSED)
    expect(c.out.pushed).toBe(true)
    expect(originMain(fx)).toBe(c.out.merge)
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)
    expect(readJsonFile(join(fx.local, 'last-ship.json'))).toMatchObject({ sha: c.out.merge, deployed: false, checked: false })
  })

  it('ship : heure simulée et crochets d’essai réservés à --dry-run et aux dépôts d’essai ; une vraie publication passe ses portes à l’horloge', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    expect(ship(fx, ['--now', '2027-04-10T10:00:00+02:00']).out.reason).toMatch(/réservée à --dry-run/)
    const withEnv = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'veille', 'ship.mjs'), '--port', '4391', '--root', fx.wt], { cwd: fx.tmp, env: { ...fx.env, ISOLOIR_VEILLE_NOW: '2027-04-10T10:00:00+02:00' }, encoding: 'utf8' })
    expect(withEnv.status).toBe(EXIT.USAGE)
    expect(callKeys(fx)).toEqual([])
    // Le vrai dépôt (origin distant) : ni faux exécutables ni état local déplacé
    git(fx.wt, 'remote', 'set-url', 'origin', 'https://example.invalid/isoloir.git')
    const real = ship(fx)
    expect(real.code).toBe(EXIT.USAGE)
    expect(real.out.reason).toMatch(/ISOLOIR_VEILLE_FAKE_BIN.*ISOLOIR_VEILLE_LOCAL|crochets/)
    git(fx.wt, 'remote', 'set-url', 'origin', fx.origin)
    // Publication réelle : gate-time sans --now et sans ISOLOIR_VEILLE_NOW
    expect(ship(fx).code).toBe(0)
    const gates = calls(fx).filter(c => c.key.startsWith('veille/gate-time'))
    expect(gates).toHaveLength(3)
    expect(gates.every(c => !c.args.includes('--now') && c.nowEnv === '')).toBe(true)
  })

  it('ship : seules les exécutions hebdomadaire et d’accord publient, en mode publication, depuis leur branche', SLOW, () => {
    for (const kind of ['candidat', 'retrait', 'quotidien']) {
      const fx = makeFixture()
      commitRunChanges(fx)
      registerRun(fx.local, fx.wt, RUN_ID, { first: true, kind })
      const r = ship(fx)
      expect(r.code, kind).toBe(EXIT.USAGE)
      expect(r.out.reason).toMatch(/ne publie pas/)
      expect(ship(fx, ['--dry-run']).code, `${kind} --dry-run`).toBe(0)
    }
    const fx = makeFixture()
    commitRunChanges(fx)
    registerRun(fx.local, fx.wt, RUN_ID, { first: true, mode: 'rapport' })
    expect(ship(fx).out.reason).toMatch(/mode rapport/)
    // Entre les deux tours (mode rapport) : la porte horaire répond d'abord 12
    setCtl(fx, { 'veille/gate-time:push': { code: 12, stdout: '{"reason":"entre-deux-tours"}\n' } })
    expect(ship(fx).code).toBe(EXIT.SOFT_FROZEN)
    // Essai : --dry-run permis
    writeJsonFile(fx.ctl, HAPPY)
    registerRun(fx.local, fx.wt, RUN_ID, { first: true, essai: true })
    expect(ship(fx, ['--dry-run']).code).toBe(0)
    // Une autre branche que celle de l'exécution (ou de ses reprises -r<N>)
    registerRun(fx.local, fx.wt, RUN_ID, { first: true, branch: 'veille/2026-10-12-hebdo' })
    expect(ship(fx, ['--dry-run']).out.reason).toMatch(/ni celle de l’exécution/)
  })

  it('ship : main réécrit (retour arrière forcé) pendant les contrôles : 10, rien de poussé', SLOW, () => {
    const fx = makeFixture()
    const R = originMain(fx)
    // X : un commit poussé ailleurs, hors du niveau, sur lequel part une exécution
    const other = join(fx.tmp, 'autre')
    git(fx.tmp, 'clone', '-q', fx.origin, other)
    write(join(other, 'src', 'code.ts'), 'export const x = 1\n')
    git(other, 'add', '-A')
    git(other, 'commit', '-q', '-m', 'X')
    git(other, 'push', '-q', 'origin', 'HEAD:main')
    git(fx.main, 'fetch', '-q', 'origin')
    const id = '2026-10-26-hebdo'
    const wt2 = join(fx.main, '.claude', 'worktrees', `veille-${id}`)
    git(fx.main, 'worktree', 'add', '-q', '-b', `veille/${id}`, wt2, 'origin/main')
    registerRun(fx.local, wt2, id, { first: true })
    writeJsonFile(join(wt2, D, 'decisions.json'), { positions: [OWNER_ENTRY, VEILLE_ENTRY], addApproaches: [], edits: [] })
    const msg = join(fx.tmp, 'm.txt')
    write(msg, 'Veille.\n')
    expect(runScript(fx, 'commit.mjs', ['--message-file', msg], { root: wt2 }).code).toBe(0)
    // Le propriétaire ramène main à R pendant l'e2e
    setCtl(fx, { 'e2e-offline': { run: ['git', '-C', other, 'push', '-q', '-f', 'origin', `${R}:refs/heads/main`] } })
    const r = ship(fx, [], { root: wt2 })
    expect(r.code).toBe(EXIT.MOVED)
    expect(r.out.reason).toMatch(/plus la base contrôlée/)
    expect(originMain(fx)).toBe(R)
    expect(callKeys(fx).some(k => k.startsWith('vercel'))).toBe(false)
  })

  it('ship tué pendant le déploiement : last-ship.json dit déjà le commit poussé, non déployé', SLOW, () => {
    const fx = makeFixture()
    commitRunChanges(fx)
    writeJsonFile(join(fx.local, 'last-ship.json'), { sha: 'b'.repeat(40), tree: 'c'.repeat(40), dataVersion: '2026-10-12.1', indexAsset: 'assets/index-Ancien.js', at: '2026-10-12T09:00:00+02:00', runId: '2026-10-12-hebdo', deployed: true, checked: true, deployUrl: null })
    setCtl(fx, { 'vercel:deploy': { killParent: true } })
    const r = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'veille', 'ship.mjs'), '--port', '4391', '--root', fx.wt], { cwd: fx.tmp, env: fx.env, encoding: 'utf8' })
    expect(r.signal).toBe('SIGKILL')
    const last = readJsonFile(join(fx.local, 'last-ship.json'))
    expect(last).toMatchObject({ sha: originMain(fx), deployed: false, checked: false, indexAsset: 'assets/index-AbC123.js', runId: RUN_ID })
    expect(validate(SCHEMAS.LAST_SHIP, last)).toEqual([])
  })

  it('port de l’e2e : un aperçu qui n’écoute que sur ::1 rend le port occupé', async () => {
    const { createServer } = await import('node:net')
    const server = createServer()
    const port = await new Promise<number | null>(resolve => {
      server.once('error', () => resolve(null))
      server.listen(0, '::1', () => resolve((server.address() as { port: number }).port))
    })
    if (port === null) return // pas d'IPv6 sur cette machine : rien à vérifier
    try {
      expect(await portIsFree(port)).toBe(false)
    } finally {
      await new Promise(resolve => server.close(resolve))
    }
  })
})

describe('rederive.mjs : question retenue, accord', () => {
  it('« question:<id> » retenu : ni apply --question, ni explication ; le reste se rejoue', SLOW, () => {
    const fx = makeFixture()
    const merged = { drafts: [{ questions: [{ id: 'sante-x9', topicId: 'sante', approaches: [] }] }] }
    writeJsonFile(join(fx.wt, D, 'expansion-merged-3.json'), merged)
    writeJsonFile(join(fx.wt, D, 'explainers-output-2026-10-19-hebdo.json'), { explainers: [{ questionId: 'sante-x9', summary: 'Texte.' }] })
    writeJsonFile(join(fx.wt, D, 'build.json'), { format: 'isoloir-build/1', expansions: [`${D}/expansion-merged.json`, `${D}/expansion-merged-3.json`] })
    writeJsonFile(join(fx.wt, D, 'veille', 'runs', RUN_ID, 'changeset.json'), { format: 'isoloir-veille-changeset/1', runId: RUN_ID, results: [] })
    commitRunChanges(fx)
    writeJsonFile(join(fx.local, 'runs', RUN_ID, 'changeset.json'), { format: 'isoloir-veille-changeset/1', runId: RUN_ID, results: [] })
    pushFromElsewhere(fx)
    const r = runScript(fx, 'rederive.mjs', ['--run-id', RUN_ID, '--hold', 'question:sante-x9'])
    expect(r.code, r.stderr).toBe(0)
    const keys = callKeys(fx)
    expect(keys.some(k => k === 'veille/apply:--question')).toBe(false)
    expect(keys.some(k => k.startsWith('merge-explainers'))).toBe(false)
    expect(keys).toContain('veille/apply:changeset.json')
    expect(r.out.questions).toEqual([{ file: `${D}/expansion-merged-3.json`, accepted: false, questionId: 'sante-x9', reasons: ['retenue (question:sante-x9)'] }])
    const wt2 = join(fx.main, '.claude', 'worktrees', `veille-${RUN_ID}-r1`)
    expect(readJsonFile<{ expansions: string[] }>(join(wt2, D, 'build.json')).expansions).toEqual([`${D}/expansion-merged.json`])
    expect(readJsonFile(join(fx.local, 'runs', RUN_ID, 'changeset.json')).holds).toEqual(['question:sante-x9'])
  })

  it('accord d’un retenu (H-…) : le changeset de l’accord vient de l’exécution source, avec approve et only', SLOW, () => {
    const fx = makeFixture()
    writeJsonFile(join(fx.local, 'runs', RUN_ID, 'changeset.json'), { format: 'isoloir-veille-changeset/1', runId: RUN_ID, electionId: 'presidentielle-2027', baseCommit: 'a'.repeat(40), today: '2026-10-19', since: { exemple: '2026-10-06' }, results: [], holds: ['candidat:autre'] })
    const { wt: awt, runId } = makeAccord(fx, 'h-2026-10-19-1-2026-10-22')
    // Sans attente accordée : 2, rien de créé
    expect(runScript(fx, 'rederive.mjs', ['--run-id', runId, '--from-run', RUN_ID], { root: awt }).code).toBe(EXIT.USAGE)
    expect(existsSync(join(fx.local, 'runs', runId, 'changeset.json'))).toBe(false)
    writePending(fx, [pendingItem('H-2026-10-19-1')])
    const r = runScript(fx, 'rederive.mjs', ['--run-id', runId, '--from-run', RUN_ID], { root: awt })
    expect(r.code, r.stderr).toBe(0)
    const cs = readJsonFile(join(fx.local, 'runs', runId, 'changeset.json'))
    expect(cs).toMatchObject({ runId, today: '2026-10-22', approve: ['H-2026-10-19-1'], only: ['H-2026-10-19-1'], holds: ['candidat:autre'], since: { exemple: '2026-10-06' } })
    expect(r.out).toMatchObject({ branch: `accord/h-2026-10-19-1-2026-10-22-r1` })
    expect(calls(fx).find(c => c.key === 'veille/apply:changeset.json')?.args[0]).toBe(join(fx.local, 'runs', runId, 'changeset.json'))
  })

  it('accord d’un candidat (C-…) : la préparation se rejoue sur l’origin/main courant, fusionnée à trois voies', SLOW, () => {
    const fx = makeFixture()
    // La préparation : un worktree veille-*-candidat-dupont, ses données et sa fiche, non validées
    const prepId = '2026-10-20-candidat-dupont'
    git(fx.main, 'fetch', '-q', 'origin')
    const base = originMain(fx)
    const prep = join(fx.main, '.claude', 'worktrees', `veille-${prepId}`)
    git(fx.main, 'worktree', 'add', '-q', '-b', 'veille/candidat-dupont', prep, 'origin/main')
    writeJsonFile(join(prep, D, 'config.json'), { contextDate: '2026-10-09', candidates: [{ id: 'exemple', name: 'Camille Exemple' }, { id: 'dupont', name: 'Dominique Dupont' }] })
    writeJsonFile(join(prep, D, 'dossier_dupont.json'), { id: 'dupont' })
    write(join(prep, S, 'candidates.ts'), 'export const candidates = [\'dupont\']\n')
    write(join(prep, 'src', 'autre.ts'), 'export const autre = 3\n')
    // Pendant ce temps, main a avancé sur config.json (une publication hebdomadaire) : à fusionner, pas un conflit
    const other = join(fx.tmp, 'autre')
    git(fx.tmp, 'clone', '-q', fx.origin, other)
    writeJsonFile(join(other, D, 'config.json'), { contextDate: '2026-10-21', candidates: [{ id: 'exemple', name: 'Camille Exemple' }] })
    git(other, 'commit', '-q', '-am', 'Publication')
    git(other, 'push', '-q', 'origin', 'HEAD:main')
    const { wt: awt, runId } = makeAccord(fx, 'c-dupont-2026-10-22')
    writePending(fx, [pendingItem('C-dupont', { runId: prepId, worktree: prep, baseCommit: base, branch: 'veille/candidat-dupont' })])
    const r = runScript(fx, 'rederive.mjs', ['--run-id', runId, '--from-run', prepId], { root: awt })
    expect(r.code, r.stderr).toBe(0)
    expect([...(r.out.replayed as string[])].sort()).toEqual([`${D}/config.json`, `${D}/dossier_dupont.json`, `${S}/candidates.ts`])
    const wt2 = join(fx.main, '.claude', 'worktrees', `${runId}-r1`)
    const cfg = readJsonFile<{ contextDate: string; candidates: { id: string }[] }>(join(wt2, D, 'config.json'))
    expect(cfg.contextDate).toBe('2026-10-21')
    expect(cfg.candidates.map(c => c.id)).toEqual(['exemple', 'dupont'])
    expect(readFileSync(join(wt2, 'src', 'autre.ts'), 'utf8')).toBe('export const autre = 1\n')
    expect(readJsonFile(join(fx.local, 'runs', runId, 'changeset.json'))).toMatchObject({ runId, results: [] })
    // Un conflit (le même fichier changé autrement des deux côtés, au même endroit) : 31
    const fx2 = makeFixture()
    git(fx2.main, 'fetch', '-q', 'origin')
    const base2 = originMain(fx2)
    const prep2 = join(fx2.main, '.claude', 'worktrees', `veille-${prepId}`)
    git(fx2.main, 'worktree', 'add', '-q', '-b', 'veille/candidat-dupont', prep2, 'origin/main')
    write(join(prep2, S, 'candidates.ts'), 'export const candidates = [\'dupont\']\n')
    const other2 = join(fx2.tmp, 'autre')
    git(fx2.tmp, 'clone', '-q', fx2.origin, other2)
    write(join(other2, S, 'candidates.ts'), 'export const candidates = [\'autre\']\n')
    git(other2, 'commit', '-q', '-am', 'Fiche')
    git(other2, 'push', '-q', 'origin', 'HEAD:main')
    const a2 = makeAccord(fx2, 'c-dupont-2026-10-22')
    writePending(fx2, [pendingItem('C-dupont', { runId: prepId, worktree: prep2, baseCommit: base2 })])
    const c = runScript(fx2, 'rederive.mjs', ['--run-id', a2.runId, '--from-run', prepId], { root: a2.wt })
    expect(c.code).toBe(EXIT.CODE)
    expect(c.out.reason).toMatch(/conflit/)
  })
})
