// Cœur de la veille automatique (tools/veille/CONTRACT.md §a, §c, §d.3-d.6, §d.13-d.14) : la porte horaire (gel des
// jours de vote, gel souple, entre-deux-tours, fin de la veille), le verrou et sa reprise, le budget (get_usage et
// dépense locale), l'état versionné et ses graines, la rotation des questions inconnues, les attentes du propriétaire,
// le rapport, le classement des candidats (règle de seuil appliquée en code), la conservation des workflows, le contrôle
// de la production et le nettoyage des worktrees. Les scripts tournent dans des dépôts git temporaires, avec un état
// local, un dossier de projets Claude et une racine principale temporaires : rien ne touche l'état réel, aucun réseau.
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { freezeSpans } from '../src/core/freeze'
import { knownQuestions } from '../src/core/score'
import { election } from '../src/elections/presidentielle-2027/election'
import { DEFAULT_POLICY, SCHEMAS, validate } from '../tools/veille/schemas.mjs'
import { splitCandidates } from '../tools/veille/lib/common.mjs'
import { allFreezeSpans, betweenRoundsSpan, gateTime } from '../tools/veille/lib/time.mjs'
import { acquireLock, heartbeatLock, inspectLock, parseWorktreeList, planCleanup, readLock, releaseLock, staleness, type Lock } from '../tools/veille/lib/lock.mjs'
import { checkBudget, parseUsage, readSpend, spentTotals, type SpendLine } from '../tools/veille/lib/budget.mjs'
import {
  addPending, advanceCheckedAt, advanceRotation, dueReminders, isKnownOn, listPending, loadPolicy, mergePolicy, mergeRefused, mergeWatch,
  redactHidden, remindPending, renderReport, resolvePending, rotationFor, seedState, type PendingItem, type VeilleState, type WatchEntry,
} from '../tools/veille/lib/state.mjs'
import { classifyWatch, thresholdOf } from '../tools/veille/lib/classify.mjs'
import {
  addToChangeset, checkAddCandidate, findWorkflowFiles, firstFreeNumber, indexAssetOf, planResearchCopy, prodCheck, recoverFromJournal, tokensByCandidate,
} from '../tools/veille/lib/persist.mjs'
import { REPO_ROOT } from './helpers/workflow-harness'

// ——— Outils des tests ———

const SCRATCH: string[] = []
const tmp = (tag = 'core') => {
  const d = realpathSync(mkdtempSync(join(tmpdir(), `isoloir-veille-${tag}-`)))
  SCRATCH.push(d)
  return d
}
afterAll(() => {
  for (const d of SCRATCH) rmSync(d, { recursive: true, force: true })
})

const readJ = (f: string) => JSON.parse(readFileSync(f, 'utf8'))
const writeJ = (f: string, v: unknown) => {
  mkdirSync(join(f, '..'), { recursive: true })
  writeFileSync(f, JSON.stringify(v, null, 2) + '\n')
}
const D = 'research/presidentielle-2027'
const config = readJ(join(REPO_ROOT, D, 'config.json'))
const bankJson = readJ(join(REPO_ROOT, D, 'bank.json'))
const watchExample = readJ(join(REPO_ROOT, 'tests/fixtures/veille/watch-result.example.json'))
const refreshExample = readJ(join(REPO_ROOT, 'tests/fixtures/veille/refresh-result.example.json'))
const split = splitCandidates(config, election)
/** La graine du contrat (§a.1), indépendante de l'état versionné, qui avance à chaque publication */
const seed0 = () => seedState(split.visibleIds) as VeilleState
const spans = freezeSpans(election)
const at = (iso: string) => new Date(iso)
const policy = mergePolicy({})

type Json = Record<string, unknown> & { reason?: string }
interface Cli {
  code: number
  json: Json
  stderr: string
}
/** Lance un script de tools/veille avec un environnement d'essai (état local, projets, racine principale) */
function cli(script: string, args: string[], env: Record<string, string | undefined> = {}): Cli {
  const base: Record<string, string | undefined> = { ...process.env }
  for (const k of Object.keys(base)) if (k.startsWith('ISOLOIR_VEILLE_')) delete base[k]
  const r = spawnSync(process.execPath, [join(REPO_ROOT, 'tools', 'veille', script), ...args], { env: { ...base, ...env } as NodeJS.ProcessEnv, encoding: 'utf8' })
  const last = (r.stdout ?? '').trim().split('\n').at(-1) ?? ''
  let json: Json
  try {
    json = JSON.parse(last)
  } catch {
    json = { unparsed: r.stdout }
  }
  return { code: r.status ?? -1, json, stderr: r.stderr ?? '' }
}

const GIT = ['-c', 'user.name=Essai', '-c', 'user.email=essai@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'init.defaultBranch=main']
function sh(cwd: string, ...args: string[]) {
  const r = spawnSync('git', [...GIT, ...args], { cwd, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} : ${r.stderr}`)
  return r.stdout.trim()
}

/**
 * Un dépôt principal temporaire avec ce qu'il faut pour run.mjs (config, banque, election.ts, graines de la veille), un
 * origin/main simulé (update-ref), et des worktrees .claude/worktrees/veille-<runId>.
 */
function makeRepo({ policy: policyFile = DEFAULT_POLICY as unknown, remote = null as string | null } = {}) {
  const M = tmp('depot')
  for (const f of [`${D}/config.json`, `${D}/bank.json`, 'src/elections/presidentielle-2027/election.ts']) {
    mkdirSync(join(M, f, '..'), { recursive: true })
    cpSync(join(REPO_ROOT, f), join(M, f))
  }
  // Graines du contrat (et non l'état versionné, qui avance à chaque publication) : les attentes restent fixes
  writeJ(join(M, D, 'veille', 'policy.json'), policyFile)
  writeJ(join(M, D, 'veille', 'locks.json'), { format: 'isoloir-veille-locks/1', locks: [] })
  writeJ(join(M, D, 'veille', 'state.json'), seed0())
  sh(M, 'init', '-q')
  sh(M, 'add', '-A')
  sh(M, 'commit', '-q', '-m', 'graine')
  sh(M, 'update-ref', 'refs/remotes/origin/main', 'HEAD')
  if (remote) sh(M, 'remote', 'add', 'origin', remote)
  const worktree = (name: string, branch: string | null = null) => {
    const p = join(M, '.claude', 'worktrees', name)
    if (branch) sh(M, 'worktree', 'add', '-q', '-b', branch, p, 'origin/main')
    else sh(M, 'worktree', 'add', '-q', '--detach', p, 'origin/main')
    return p
  }
  return { M, head: sh(M, 'rev-parse', 'HEAD'), worktree }
}
/** Environnement d'un essai : état local et projets Claude neufs, racine principale donnée */
const envFor = (M: string, extra: Record<string, string> = {}) => ({ ISOLOIR_VEILLE_LOCAL: tmp('local'), ISOLOIR_VEILLE_PROJECTS: tmp('projets'), ISOLOIR_VEILLE_MAIN_ROOT: M, ...extra })

// ——— Porte horaire ———

describe('porte horaire (lib/time.mjs) : gel, gel souple, entre-deux-tours, fin', () => {
  const gate = (step: 'start' | 'push' | 'deploy', now: string, kind: string | null = null, hours = kind === 'hebdo' ? 8 : 0, p = policy) =>
    gateTime({ step, now: at(now), hours, kind, electionSpans: spans, policy: p })

  it('les gels viennent d’election.freezeWindows, et l’entre-deux-tours va de la fin du premier au début du second', () => {
    expect(spans).toEqual([
      { start: '2027-04-16T00:00:00+02:00', end: '2027-04-18T20:00:00+02:00' },
      { start: '2027-04-30T00:00:00+02:00', end: '2027-05-02T20:00:00+02:00' },
    ])
    expect(betweenRoundsSpan(spans)).toEqual({ start: '2027-04-18T20:00:00+02:00', end: '2027-04-30T00:00:00+02:00' })
  })

  it('dans les deux gels, rien ne part : 11, à toutes les étapes ; début inclus, fin exclue', () => {
    expect(gate('start', '2027-04-16T10:00:00+02:00', 'quotidien').code).toBe(11)
    expect(gate('push', '2027-04-17T12:00:00+02:00').code).toBe(11)
    expect(gate('deploy', '2027-05-01T12:00:00+02:00').code).toBe(11)
    expect(gate('push', '2027-04-30T00:00:00+02:00').code).toBe(11)
    expect(gate('push', '2027-04-15T23:59:59+02:00').code).toBe(12)
    const r = gate('push', '2027-05-02T19:59:00+02:00')
    expect(r.code).toBe(11)
    expect(r.freeze).toMatchObject({ start: '2027-04-30T00:00:00+02:00', origin: 'élection' })
    // À la clôture du premier tour, le gel finit : on est entre les deux tours
    expect(gate('push', '2027-04-18T20:00:00+02:00')).toMatchObject({ code: 12, mode: 'rapport' })
  })

  it('gel souple : lundi 12 avril 6 h + 8 h passe ; le 14 avril à 1 h, non ; le quotidien seul y part', () => {
    const monday = gate('start', '2027-04-12T06:00:00+02:00', 'hebdo')
    expect(monday).toMatchObject({ code: 0, mode: 'publication', freeze: null, softFreeze: null, until: '2027-04-12T14:00:00+02:00' })
    expect(monday.nextFreeze?.start).toBe('2027-04-16T00:00:00+02:00')
    const late = gate('start', '2027-04-14T01:00:00+02:00', 'hebdo')
    expect(late.code).toBe(12)
    expect(late.softFreeze).toEqual({ start: '2027-04-14T00:00:00+02:00', end: '2027-04-16T00:00:00+02:00' })
    expect(late.reason).toContain('gel souple')
    expect(gate('start', '2027-04-14T01:00:00+02:00', 'quotidien')).toMatchObject({ code: 0, softFreeze: { start: '2027-04-14T00:00:00+02:00' } })
    expect(gate('start', '2027-04-14T01:00:00+02:00', 'candidat').code).toBe(12)
    expect(gate('push', '2027-04-13T23:59:59+02:00').code).toBe(0)
    expect(gate('push', '2027-04-14T00:00:00+02:00').code).toBe(12)
  })

  it('l’horizon compte : un départ dont [now, now + 8 h] touche le gel souple est refusé, même s’il part avant', () => {
    expect(gate('start', '2027-04-13T15:59:00+02:00', 'hebdo').code).toBe(0)
    expect(gate('start', '2027-04-13T16:00:00+02:00', 'hebdo').code).toBe(12)
    expect(gate('start', '2027-04-13T18:00:00+02:00', 'hebdo').code).toBe(12)
    // Second tour : le lundi 26 avril passe (rapport seulement), le 28 avril à 1 h est dans le gel souple
    expect(gate('start', '2027-04-26T06:00:00+02:00', 'hebdo')).toMatchObject({ code: 0, mode: 'rapport' })
    expect(gate('start', '2027-04-28T01:00:00+02:00', 'hebdo').code).toBe(12)
  })

  it('entre les deux tours : rapport seulement, push et deploy refusés ; sans reportOnlyBetweenRounds, ils passent', () => {
    const push = gate('push', '2027-04-20T10:00:00+02:00')
    expect(push).toMatchObject({ code: 12, mode: 'rapport' })
    expect(push.reason).toContain('entre-deux-tours')
    expect(gate('deploy', '2027-04-20T10:00:00+02:00').code).toBe(12)
    expect(gate('start', '2027-04-20T10:00:00+02:00', 'hebdo')).toMatchObject({ code: 0, mode: 'rapport' })
    const open = mergePolicy({ reportOnlyBetweenRounds: false })
    expect(gate('push', '2027-04-20T10:00:00+02:00', null, 0, open)).toMatchObject({ code: 0, mode: 'publication' })
  })

  it('après la fin de la veille (2027-05-02 20 h) : 13, à toutes les étapes', () => {
    for (const step of ['start', 'push', 'deploy'] as const) {
      expect(gate(step, '2027-05-02T20:00:00+02:00', step === 'start' ? 'quotidien' : null).code).toBe(13)
      expect(gate(step, '2027-05-03T07:00:00+02:00', step === 'start' ? 'quotidien' : null).code).toBe(13)
    }
    expect(gate('start', '2027-05-03T07:00:00+02:00', 'quotidien').reason).toContain('fin de la veille')
  })

  it('gels ajoutés par la politique, gel souple réglable (0 h : aucun)', () => {
    const extra = mergePolicy({ extraFreezeWindows: [{ start: '2026-11-02T00:00:00+01:00', end: '2026-11-03T00:00:00+01:00', reason: 'essai' }] })
    expect(allFreezeSpans(spans, extra)).toHaveLength(3)
    const r = gate('push', '2026-11-02T10:00:00+01:00', null, 0, extra)
    expect(r).toMatchObject({ code: 11, freeze: { origin: 'politique', reason: 'essai' } })
    expect(gate('push', '2026-10-31T10:00:00+01:00', null, 0, extra).code).toBe(12)
    const noSoft = mergePolicy({ softFreezeHours: 0 })
    expect(gate('start', '2027-04-14T01:00:00+02:00', 'hebdo', 8, noSoft).code).toBe(0)
  })

  it('aujourd’hui (octobre 2026) : tout passe, en publication', () => {
    expect(gate('start', '2026-10-19T06:00:00+02:00', 'hebdo')).toMatchObject({ code: 0, mode: 'publication', betweenRounds: null })
    expect(gate('push', '2026-10-19T12:00:00+02:00').code).toBe(0)
  })
})

describe('gate-time.mjs (ligne de commande)', () => {
  const env = () => ({ ISOLOIR_VEILLE_LOCAL: tmp('local') })
  it('codes de sortie et ligne JSON unique', () => {
    const r = cli('gate-time.mjs', ['--step', 'start', '--kind', 'hebdo', '--now', '2027-04-12T06:00:00+02:00', '--root', REPO_ROOT], env())
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ script: 'gate-time', ok: true, hours: 8, mode: 'publication' })
    expect(r.json.reason).toBeUndefined()
    const frozen = cli('gate-time.mjs', ['--step', 'deploy', '--now', '2027-04-17T09:00:00+02:00', '--root', REPO_ROOT], env())
    expect(frozen.code).toBe(11)
    expect(frozen.json).toMatchObject({ ok: false, code: 11, freeze: { start: '2027-04-16T00:00:00+02:00' } })
    expect(cli('gate-time.mjs', ['--step', 'push', '--now', '2027-04-14T09:00:00+02:00', '--root', REPO_ROOT], env()).code).toBe(12)
    expect(cli('gate-time.mjs', ['--step', 'push', '--now', '2027-05-04T09:00:00+02:00', '--root', REPO_ROOT], env()).code).toBe(13)
    expect(cli('gate-time.mjs', ['--step', 'merge', '--root', REPO_ROOT], env()).code).toBe(2)
    expect(cli('gate-time.mjs', ['--step', 'push', '--now', '2027-04-14 09:00', '--root', REPO_ROOT], env()).code).toBe(2)
    expect(cli('gate-time.mjs', ['--step', 'push', '--reset-revisions', '--root', REPO_ROOT], env()).code).toBe(2)
  }, 30000)
})

// ——— Verrou ———

describe('verrou (lib/lock.mjs)', () => {
  const setup = () => {
    const L = tmp('verrou')
    return { file: join(L, 'lock.json'), a: tmp('wt-a'), b: tmp('wt-b'), c: tmp('wt-c') }
  }
  const now = at('2026-10-19T06:00:00+02:00')
  const code = (f: () => unknown) => {
    try {
      f()
      return 0
    } catch (e) {
      return (e as { code?: number }).code
    }
  }

  it('premier départ : le dossier de l\'état local est créé avec le verrou', () => {
    const { a } = setup()
    const file = join(tmp('verrou-neuf'), 'veille', 'lock.json')
    expect(existsSync(join(file, '..'))).toBe(false)
    expect(acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: a, now, policy })).toMatchObject({ takenOverFrom: null })
    expect(validate(SCHEMAS.LOCK, readLock(file))).toEqual([])
  })

  it('création atomique ; une autre exécution sort en 21 ; la même reprend sans perte', () => {
    const { file, a, b } = setup()
    const first = acquireLock(file, { runId: '2026-10-19-hebdo', kind: 'hebdo', worktree: a, now, policy })
    expect(first).toMatchObject({ takenOverFrom: null, reentered: false })
    expect(validate(SCHEMAS.LOCK, readLock(file))).toEqual([])
    expect(code(() => acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: b, now, policy }))).toBe(21)
    const again = acquireLock(file, { runId: '2026-10-19-hebdo', kind: 'hebdo', worktree: a, now: at('2026-10-19T07:00:00+02:00'), policy })
    expect(again.reentered).toBe(true)
    expect(again.lock.startedAt).toBe(first.lock.startedAt)
    expect(again.lock.heartbeatAt).toBe('2026-10-19T07:00:00+02:00')
  })

  it('périmé : battement de plus de 4 h, ou verrou de plus de 24 h ; repris, l’ancien gardé et noté', () => {
    const { file, a, b } = setup()
    acquireLock(file, { runId: '2026-10-18-quotidien', kind: 'quotidien', worktree: a, now: at('2026-10-18T07:00:00+02:00'), policy })
    const old = readLock(file) as Lock
    expect(staleness(old, at('2026-10-18T10:59:00+02:00'), policy)).toBeNull()
    expect(staleness(old, at('2026-10-18T11:01:00+02:00'), policy)).toContain('battement')
    // Battement frais mais plus de 24 h depuis le départ
    expect(staleness({ ...old, heartbeatAt: '2026-10-19T07:30:00+02:00' }, at('2026-10-19T07:31:00+02:00'), policy)).toContain('24 h')
    const taken = acquireLock(file, { runId: '2026-10-19-hebdo', kind: 'hebdo', worktree: b, now, policy })
    expect(taken.takenOverFrom).toBe('2026-10-18-quotidien')
    expect(taken.staleReason).toContain('battement')
    expect(readLock(file)).toMatchObject({ runId: '2026-10-19-hebdo', takenOverFrom: '2026-10-18-quotidien' })
    expect(readJ(`${file}.repris`).runId).toBe('2026-10-18-quotidien')
    // Un verrou illisible compte comme périmé
    writeFileSync(file, '{ abîmé')
    expect(inspectLock(file, { now, policy, worktree: b })).toMatchObject({ free: true, stale: 'verrou illisible' })
    expect(acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: b, now, policy }).takenOverFrom).toBe('inconnu')
  })

  it('préparation sous le même verrou (--parent) ; battement par worktree ; libération ligne par ligne', () => {
    const { file, a, b, c } = setup()
    acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: a, now, policy })
    expect(code(() => acquireLock(file, { runId: '2026-10-19-candidat-dupont', kind: 'candidat', worktree: b, now, policy, parent: '2026-10-18-quotidien' }))).toBe(21)
    const child = acquireLock(file, { runId: '2026-10-19-candidat-dupont', kind: 'candidat', worktree: b, now, policy, parent: '2026-10-19-quotidien' })
    expect(child.joined).toBe(true)
    expect(child.lock.worktrees.map(w => w.runId)).toEqual(['2026-10-19-quotidien', '2026-10-19-candidat-dupont'])
    expect(heartbeatLock(file, { worktree: b, now: at('2026-10-19T08:00:00+02:00'), phase: 'recherche' })).toMatchObject({ phase: 'recherche' })
    expect(code(() => heartbeatLock(file, { worktree: c, now }))).toBe(21)
    expect(releaseLock(file, { worktree: c }).released).toBe(false)
    expect(releaseLock(file, { worktree: b }).released).toBe('ligne')
    expect(readLock(file)?.worktrees).toHaveLength(1)
    expect(releaseLock(file, { worktree: a }).released).toBe('tout')
    expect(readLock(file)).toBeNull()
    expect(code(() => acquireLock(file, { runId: '2026-10-19-candidat-x', kind: 'candidat', worktree: b, now, policy, parent: '2026-10-19-quotidien' }))).toBe(21)
  })

  it('deux reprises simultanées d’un verrou périmé : une seule gagne, l’autre sort en 21', async () => {
    const { file, a, b, c } = setup()
    acquireLock(file, { runId: '2026-10-18-quotidien', kind: 'quotidien', worktree: a, now: at('2026-10-18T07:00:00+02:00'), policy })
    const fs = (await import('node:fs')).default
    const { syncBuiltinESMExports } = await import('node:module')
    const orig = fs.renameSync
    let raced = false
    // B a lu le verrou périmé ; juste avant qu'il l'écarte, A le reprend tout entier
    const patched = ((from: string, to: string) => {
      if (!raced && String(to).includes('.repris.2026-10-19-quotidien.')) {
        raced = true
        fs.renameSync = orig
        syncBuiltinESMExports()
        try {
          acquireLock(file, { runId: '2026-10-19-hebdo', kind: 'hebdo', worktree: c, now, policy })
        } finally {
          fs.renameSync = patched
          syncBuiltinESMExports()
        }
      }
      return orig(from, to)
    }) as typeof fs.renameSync
    fs.renameSync = patched
    syncBuiltinESMExports()
    try {
      expect(code(() => acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: b, now, policy }))).toBe(21)
    } finally {
      fs.renameSync = orig
      syncBuiltinESMExports()
    }
    expect(raced).toBe(true)
    expect(readLock(file)).toMatchObject({ runId: '2026-10-19-hebdo', takenOverFrom: '2026-10-18-quotidien' })
    expect(readJ(`${file}.repris`).runId).toBe('2026-10-18-quotidien')
    expect(code(() => heartbeatLock(file, { worktree: c, now }))).toBe(0)
  })

  it('un worktree de rederive (inscrit avec le runId de l’exécution) libère tout le verrou ; une préparation, sa seule ligne', () => {
    const { file, a, b } = setup()
    acquireLock(file, { runId: '2026-10-19-hebdo', kind: 'hebdo', worktree: a, now, policy })
    const lock = readLock(file) as Lock
    writeJ(file, { ...lock, worktrees: [...lock.worktrees, { path: b, runId: '2026-10-19-hebdo' }] })
    expect(heartbeatLock(file, { worktree: b, now, phase: 'ship' })).toMatchObject({ phase: 'ship' })
    expect(releaseLock(file, { worktree: b }).released).toBe('tout')
    expect(readLock(file)).toBeNull()
  })

  it('une préparation ne se joint pas à un verrou périmé', () => {
    const { file, a, b } = setup()
    acquireLock(file, { runId: '2026-10-19-quotidien', kind: 'quotidien', worktree: a, now, policy })
    expect(code(() => acquireLock(file, { runId: '2026-10-19-candidat-x', kind: 'candidat', worktree: b, now: at('2026-10-19T12:00:00+02:00'), policy, parent: '2026-10-19-quotidien' }))).toBe(21)
  })
})

// ——— Budget ———

describe('budget (lib/budget.mjs)', () => {
  const GET_USAGE = {
    plan: {
      status: 'ok',
      plan: 'Max',
      windows: [
        { label: '5-hour limit', percentUsed: 36, resetsAt: '2026-10-17T13:09:59.944Z', resetsIn: '1h 47m' },
        { label: 'Weekly · all models', percentUsed: 14, resetsAt: '2026-10-23T13:59:59.944Z' },
        { label: 'Weekly · Opus 5', percentUsed: 41, resetsAt: '2026-10-23T14:00:00.000Z' },
      ],
      extraUsage: { enabled: false, percentUsed: 100, spent: '11.66', monthlyLimit: '10.00', currency: 'EUR' },
    },
    context: { session: 'self', status: 'ok', tokensUsed: 286312, percentUsed: 29 },
  }
  const line = (atIso: string, tokens: number, kind = 'quotidien', stage = 'watch'): SpendLine => ({ at: atIso, runId: `${atIso.slice(0, 10)}-${kind}`, kind, stage, wfRunId: null, tokens })

  it('usage du forfait : sortie brute de get_usage (fenêtres, usage supplémentaire désactivé ignoré) ou forme plate', () => {
    const u = parseUsage(JSON.stringify(GET_USAGE))
    expect(u).toMatchObject({ fiveHourPercent: 36, weeklyPercent: 41, monthlyPercent: null, status: 'ok' })
    const on = structuredClone(GET_USAGE)
    on.plan.extraUsage.enabled = true
    expect(parseUsage(on).monthlyPercent).toBe(100)
    expect(parseUsage({ weeklyPercent: '86 %', fiveHourPercent: 3 })).toMatchObject({ weeklyPercent: 86, fiveHourPercent: 3 })
    expect(parseUsage({ plan: { status: 'unavailable', note: 'réessayer' } })).toMatchObject({ weeklyPercent: null, status: 'unavailable' })
    expect(parseUsage({ windows: [{ name: 'weekly', utilization: 0.9 }] }).weeklyPercent).toBeCloseTo(90)
    expect(() => parseUsage('{ pas du json')).toThrow()
  })

  it('arrêt à usageStopPercent (85 %) sur n’importe quelle fenêtre lue ; « indisponible » ne bloque pas', () => {
    const decide = (usage: ReturnType<typeof parseUsage>) => checkBudget({ lines: [], today: '2026-10-19', kind: 'quotidien', estimate: 0, usage, policy }).code
    expect(decide(parseUsage({ weeklyPercent: 84 }))).toBe(0)
    expect(decide(parseUsage({ weeklyPercent: 85 }))).toBe(22)
    expect(decide(parseUsage({ fiveHourPercent: 97 }))).toBe(22)
    const r = checkBudget({ lines: [], today: '2026-10-19', kind: 'quotidien', usage: parseUsage({ plan: { status: 'unavailable' } }), policy })
    expect(r.code).toBe(0)
    expect(r.note).toContain('indisponible')
  })

  it('jour, semaine (lundi-dimanche) et mois comptés à Paris', () => {
    const lines = [
      line('2026-10-19T01:30:00+02:00', 100), // lundi 19, Paris
      line('2026-10-18T23:30:00Z', 10), // lundi 19 à 1 h 30 à Paris
      line('2026-10-18T21:00:00Z', 1000), // dimanche 18 à 23 h à Paris : semaine précédente
      line('2026-10-01T09:00:00+02:00', 5000, 'hebdo', 'refresh:candidates'),
      line('2026-09-30T09:00:00+02:00', 70000),
    ]
    expect(spentTotals(lines, '2026-10-19')).toEqual({ day: 110, dayAll: 110, week: 110, month: 6110 })
    expect(spentTotals([line('2026-10-19T09:00:00+02:00', 5, 'hebdo')], '2026-10-19')).toEqual({ day: 0, dayAll: 5, week: 5, month: 5 })
  })

  it('refus quand dépense + estimation dépasse une limite ; le jour ne vaut pas pour l’hebdomadaire', () => {
    const today = '2026-10-21'
    const daily = [line('2026-10-21T07:10:00+02:00', 700000)]
    expect(checkBudget({ lines: daily, today, kind: 'quotidien', estimate: 100000, policy }).code).toBe(0)
    const over = checkBudget({ lines: daily, today, kind: 'quotidien', estimate: 100001, policy })
    expect(over.code).toBe(22)
    expect(over.reason).toContain('jour')
    // Une préparation ce jour-là porte la limite du jour à 3 000 000
    const prep = [...daily, line('2026-10-21T08:00:00+02:00', 10, 'candidat', 'research')]
    expect(checkBudget({ lines: prep, today, kind: 'candidat', estimate: 2000000, policy })).toMatchObject({ code: 0, prepToday: true, limits: { day: 3000000 } })
    // L'hebdomadaire dépense plus que la limite du jour, mais pas plus que la semaine
    const weekly = [line('2026-10-19T06:30:00+02:00', 9000000, 'hebdo', 'refresh:candidates')]
    expect(checkBudget({ lines: weekly, today: '2026-10-19', kind: 'hebdo', estimate: 2000000, policy }).code).toBe(0)
    const week = checkBudget({ lines: weekly, today: '2026-10-19', kind: 'hebdo', estimate: 3000001, policy })
    expect(week.code).toBe(22)
    expect(week.reason).toContain('semaine du 2026-10-19')
  })

  it('mois : refus au-delà de 45 M ; au-delà de 80 %, avis « candidats classés seulement »', () => {
    const month = [line('2026-10-05T06:30:00+02:00', 36000000, 'hebdo')]
    const soft = checkBudget({ lines: month, today: '2026-10-19', kind: 'hebdo', estimate: 1000000, policy })
    expect(soft).toMatchObject({ code: 0, softMonthly: true, advice: 'ranked-only' })
    expect(soft.note).toContain('classés')
    expect(checkBudget({ lines: [line('2026-10-05T06:30:00+02:00', 35999999, 'hebdo')], today: '2026-10-19', kind: 'hebdo', policy }).softMonthly).toBe(false)
    const hard = checkBudget({ lines: [line('2026-10-05T06:30:00+02:00', 44000000, 'hebdo')], today: '2026-10-19', kind: 'hebdo', estimate: 1000001, policy })
    expect(hard.code).toBe(22)
    expect(hard.reason).toContain('mois 2026-10')
  })

  it('passages « programme » : au plus 2 par semaine ; une ligne qui s’enregistre n’est pas refusée pour cela', () => {
    const two = [line('2026-10-19T09:00:00+02:00', 10, 'hebdo', 'refresh:programme'), line('2026-10-20T09:00:00+02:00', 10, 'hebdo', 'refresh:programme')]
    expect(checkBudget({ lines: two.slice(0, 1), today: '2026-10-21', kind: 'hebdo', stage: 'refresh:programme', policy }).code).toBe(0)
    const r = checkBudget({ lines: two, today: '2026-10-21', kind: 'hebdo', stage: 'refresh:programme', policy })
    expect(r).toMatchObject({ code: 22, programmePasses: 2 })
    expect(checkBudget({ lines: two, today: '2026-10-21', kind: 'hebdo', stage: 'refresh:programme', recording: true, policy }).code).toBe(0)
    // La semaine suivante, le compteur repart
    expect(checkBudget({ lines: two, today: '2026-10-26', kind: 'hebdo', stage: 'refresh:programme', policy }).code).toBe(0)
  })

  it('spend.jsonl : une ligne abîmée est sautée, pas comptée', () => {
    const f = join(tmp('spend'), 'spend.jsonl')
    writeFileSync(f, `${JSON.stringify(line('2026-10-19T09:00:00+02:00', 7))}\n{ abîmée\n\n${JSON.stringify({ at: 'x' })}\n`)
    expect(readSpend(f)).toMatchObject({ skipped: 2 })
    expect(readSpend(f).lines).toHaveLength(1)
  })
})

// ——— État versionné, rotation, attentes, rapport ———

describe('état versionné (lib/state.mjs) et graines', () => {
  const V = join(REPO_ROOT, D, 'veille')

  it('graines du contrat (seedState) ; fichiers versionnés valides, quel que soit le nombre de publications passées', () => {
    // La graine du contrat (§a.1)
    const g = seed0()
    expect(Object.keys(g.candidates)).toEqual(split.visibleIds)
    for (const [id, c] of Object.entries(g.candidates)) {
      expect(c, id).toEqual({ checkedAt: id === 'polony' ? '2026-10-14' : '2026-10-09', rotationCursor: 0, lastRunId: null, programmeSeen: null })
    }
    expect(g).toMatchObject({ watch: [], refused: [], lastRuns: {} })
    expect(g.expected.map(e => e.id)).toEqual(['liste-officielle', 'lepen-eligibilite', 'zemmour-officialisation', 'bertrand-officialisation', 'resultats-t1', 'resultats-t2'])
    expect(g.expected.every(e => e.status === 'attendu')).toBe(true)
    expect(g.expected.find(e => e.id === 'liste-officielle')?.from).toBe('2027-03-12')
    expect(g.expected.find(e => e.id === 'resultats-t2')?.from).toBe('2027-05-02')
    // Les fichiers versionnés : des invariants seulement (ils avancent à chaque publication, et le propriétaire édite
    // policy.json et locks.json)
    expect(() => loadPolicy(REPO_ROOT)).not.toThrow()
    expect(validate(SCHEMAS.POLICY, mergePolicy(readJ(join(V, 'policy.json'))))).toEqual([])
    expect(validate(SCHEMAS.LOCKS, readJ(join(V, 'locks.json')))).toEqual([])
    const s = readJ(join(V, 'state.json')) as VeilleState
    expect(validate(SCHEMAS.STATE, s)).toEqual([])
    for (const id of split.visibleIds) expect(s.candidates[id], id).toBeDefined()
    for (const id of split.hiddenIds) expect(s.candidates[id], id).toBeUndefined()
    for (const [id, c] of Object.entries(s.candidates)) {
      expect(c.checkedAt >= (id === 'polony' ? '2026-10-14' : '2026-10-09'), id).toBe(true)
      expect(c.lastRunId === null || typeof c.lastRunId === 'string').toBe(true)
    }
    for (const k of Object.keys(s.lastRuns ?? {})) expect(['hebdo', 'accord']).toContain(k)
    for (const id of ['liste-officielle', 'lepen-eligibilite', 'zemmour-officialisation', 'bertrand-officialisation', 'resultats-t1', 'resultats-t2']) {
      expect(s.expected.map(e => e.id), id).toContain(id)
    }
  })

  it('politique : fusion profonde sur un niveau ; un fichier non conforme sort en 2', () => {
    const p = mergePolicy({ budgets: { dailyTokens: 1 }, paused: true })
    expect(p.budgets).toMatchObject({ dailyTokens: 1, weeklyTokens: 12000000, monthlySoftShare: 0.8 })
    expect(p.paused).toBe(true)
    expect(p.caps.bankMax).toBe(110)
    const root = tmp('politique')
    writeJ(join(root, D, 'veille', 'policy.json'), { softFreezeHours: -1 })
    let c = 0
    try {
      loadPolicy(root)
    } catch (e) {
      c = (e as { code: number }).code
    }
    expect(c).toBe(2)
    expect(loadPolicy(tmp('sans-politique')).softFreezeHours).toBe(48)
  })

  it('« inconnue » se compte comme knownQuestions de src/core/score.ts, pour chaque candidat', () => {
    const qs = bankJson.bank.questions as { id: string; tier: string; approaches: { id: string }[] }[]
    for (const id of Object.keys(bankJson.positions)) {
      const mine = qs.filter(q => isKnownOn(bankJson.positions[id], q)).length
      expect(mine, id).toBe(knownQuestions({ bank: bankJson.bank, positions: bankJson.positions } as unknown as Parameters<typeof knownQuestions>[0], id))
    }
  })

  it('rotation : toutes les essentielles inconnues, puis 10 approfondies inconnues à partir du curseur, en bouclant', () => {
    const bank = {
      bank: {
        questions: [
          { id: 'a-1', tier: 'essentiel', approaches: [{ id: 'a-1-a' }] },
          { id: 'a-2', tier: 'essentiel', approaches: [{ id: 'a-2-a' }] },
          ...Array.from({ length: 6 }, (_, i) => ({ id: `d-${i + 1}`, tier: 'approfondi', approaches: [{ id: `d-${i + 1}-a` }, { id: `d-${i + 1}-b` }] })),
        ],
      },
      positions: {
        x: {
          'a-1-a': { weight: 2, nature: 'proposition', confidence: 'high', summary: '', sources: [] },
          'd-2-b': { rejects: true, nature: 'declaration', confidence: 'medium', summary: '', sources: [] },
          // Une position de confiance basse ne compte pas : d-4 reste inconnue
          'd-4-a': { weight: 2, nature: 'proposition', confidence: 'low', summary: '', sources: [] },
        },
      },
    }
    const pol = { rotation: { unknownDeepPerCandidate: 3 } }
    const state = (cursor: number) => ({ candidates: { x: { checkedAt: '2026-10-09', rotationCursor: cursor, lastRunId: null, programmeSeen: null } } })
    expect(rotationFor(state(0), bank, 'x', pol)).toEqual({ questions: ['a-2', 'd-1', 'd-3', 'd-4'], nextCursor: 4 })
    expect(rotationFor(state(4), bank, 'x', pol)).toEqual({ questions: ['a-2', 'd-5', 'd-6', 'd-1'], nextCursor: 1 })
    // Curseur hors de la liste : ramené dans la liste
    expect(rotationFor(state(10), bank, 'x', pol).questions).toEqual(['a-2', 'd-5', 'd-6', 'd-1'])
    // Candidat sans entrée : curseur 0 ; tout connu : rien, curseur inchangé
    expect(rotationFor({ candidates: {} }, bank, 'x', pol).nextCursor).toBe(4)
    const y = { candidates: { y: { checkedAt: '2026-10-09', rotationCursor: 2, lastRunId: null, programmeSeen: null } } }
    expect(rotationFor(y, bank, 'y', { rotation: { unknownDeepPerCandidate: 0 } })).toEqual({ questions: ['a-1', 'a-2'], nextCursor: 2 })
    const allKnown = { ...bank, positions: { z: Object.fromEntries(bank.bank.questions.map(q => [q.approaches[0]!.id, { weight: 1, nature: 'proposition', confidence: 'medium', summary: '', sources: [] }])) } }
    expect(rotationFor({ candidates: { z: { ...y.candidates.y } } }, allKnown, 'z', pol)).toEqual({ questions: [], nextCursor: 2 })
  })

  it('rotation sur la vraie banque : deux semaines de suite ne reprennent pas les mêmes approfondies', () => {
    const seed = seed0()
    const first = rotationFor(seed, bankJson, 'polony', policy)
    const essentials = (bankJson.bank.questions as { id: string; tier: string; approaches: { id: string }[] }[]).filter(q => q.tier === 'essentiel' && !isKnownOn(bankJson.positions.polony, q)).map(q => q.id)
    expect(first.questions.slice(0, essentials.length)).toEqual(essentials)
    const deep1 = first.questions.slice(essentials.length)
    expect(deep1).toHaveLength(10)
    const next = advanceRotation(seed, { polony: first.nextCursor })
    const deep2 = rotationFor(next, bankJson, 'polony', policy).questions.slice(essentials.length)
    expect(deep2.filter(q => deep1.includes(q))).toEqual([])
  })

  it('checkedAt n’avance que vers l’avant ; un candidat absent est ajouté ; les autres ne bougent pas', () => {
    const seed = seed0()
    const s = advanceCheckedAt(seed, ['attal', 'nouveau'], '2026-10-19', '2026-10-19-hebdo')
    expect(s.candidates.attal).toMatchObject({ checkedAt: '2026-10-19', lastRunId: '2026-10-19-hebdo' })
    expect(s.candidates.nouveau).toEqual({ checkedAt: '2026-10-19', rotationCursor: 0, lastRunId: '2026-10-19-hebdo', programmeSeen: null })
    expect(s.candidates.lepen?.checkedAt).toBe('2026-10-09')
    expect(advanceCheckedAt(s, ['attal'], '2026-10-12', 'x').candidates.attal?.checkedAt).toBe('2026-10-19')
    expect(seed.candidates.attal?.checkedAt).toBe('2026-10-09')
  })

  it('« à surveiller » fondus par clé ; refusés fondus depuis les attentes « candidat » refusées', () => {
    const seed = seed0()
    const src = (u: string) => ({ url: u, title: 'Article', publisher: 'Journal', date: '2026-10-18', primary: false })
    const a: WatchEntry = { key: 'dupont', name: 'Jean Dupont', party: null, reason: 'seuil', firstSeen: '2026-10-10', lastSeen: '2026-10-10', sources: [src('https://a.fr/x')] }
    const b: WatchEntry = { ...a, reason: 'sources', firstSeen: '2026-10-18', lastSeen: '2026-10-18', sources: [src('https://www.a.fr/x/'), src('https://b.fr/y')] }
    const s = mergeWatch(mergeWatch(seed, [a]), [b])
    expect(s.watch).toHaveLength(1)
    expect(s.watch[0]).toMatchObject({ reason: 'sources', firstSeen: '2026-10-10', lastSeen: '2026-10-18' })
    expect(s.watch[0]?.sources).toHaveLength(2)
    const item = (id: string, status: PendingItem['status'], kind = 'candidat'): PendingItem => ({ id, kind, branch: null, createdAt: '2026-10-19T07:00:00+02:00', runId: '2026-10-19-quotidien', summary: 'Jean Dupont, déclaré.', approveWith: `OK ${id}`, status, decidedAt: '2026-10-20T09:00:00+02:00', details: { name: 'Jean Dupont' } })
    const r = mergeRefused(seed, [item('C-dupont', 'refusé'), item('C-autre', 'attente'), item('R-lalanne', 'refusé', 'retrait')])
    expect(r.refused).toEqual([{ key: 'dupont', name: 'Jean Dupont', decidedAt: '2026-10-20' }])
    expect(mergeRefused(r, [item('C-dupont', 'refusé')]).refused).toHaveLength(1)
    expect(validate(SCHEMAS.STATE, r)).toEqual([])
  })
})

describe('attentes du propriétaire (pending.json)', () => {
  const now = at('2026-10-19T07:00:00+02:00')
  const base = { createdAt: '2026-10-19T07:00:00+02:00', runId: '2026-10-19-quotidien' }
  const code = (f: () => unknown) => {
    try {
      f()
      return 0
    } catch (e) {
      return (e as { code?: number }).code
    }
  }

  it('ajout idempotent par id ; une attente « caduc » est remplacée ; type, préfixe et « OK <id> » vérifiés', () => {
    const L = tmp('attentes')
    expect(addPending(L, { id: 'C-dupont', summary: 'Jean Dupont, déclaré sans condition.' }, base)).toMatchObject({ added: true, item: { kind: 'candidat', status: 'attente', approveWith: 'OK C-dupont' } })
    expect(addPending(L, { id: 'C-dupont', summary: 'autre texte' }, base)).toMatchObject({ added: false, existing: true, item: { summary: 'Jean Dupont, déclaré sans condition.' } })
    expect(listPending(L)).toHaveLength(1)
    resolvePending(L, 'C-dupont', 'caduc', { now })
    expect(addPending(L, { id: 'C-dupont', summary: 'de nouveau' }, base)).toMatchObject({ added: true, existing: true })
    expect(listPending(L, { status: 'attente' })).toHaveLength(1)
    expect(code(() => addPending(L, { id: 'C-x', kind: 'retrait', summary: 'mauvais type' }, base))).toBe(2)
    expect(code(() => addPending(L, { id: 'H-2026-10-19-1', approveWith: 'OK tout', summary: 'retenu' }, base))).toBe(2)
    expect(code(() => addPending(L, { id: 'Z-1', summary: 'préfixe inconnu' }, base))).toBe(2)
    expect(code(() => addPending(L, { id: 'R-lalanne', summary: 'retrait' }, { createdAt: base.createdAt }))).toBe(2)
    expect(code(() => resolvePending(L, 'C-absent', 'accordé'))).toBe(2)
    expect(validate(SCHEMAS.PENDING_FILE, readJ(join(L, 'pending.json')))).toEqual([])
  })

  it('rappels : après 48 h, puis pas avant 48 h de plus', () => {
    const L = tmp('rappels')
    addPending(L, { id: 'R-lalanne', summary: 'Retrait de Francis Lalanne à confirmer.' }, base)
    expect(dueReminders(listPending(L), at('2026-10-21T06:59:00+02:00'), policy)).toHaveLength(0)
    expect(remindPending(L, { now: at('2026-10-21T07:00:00+02:00'), policy })).toHaveLength(1)
    expect(remindPending(L, { now: at('2026-10-22T07:00:00+02:00'), policy })).toHaveLength(0)
    expect(remindPending(L, { now: at('2026-10-23T07:00:00+02:00'), policy, dryRun: true })).toHaveLength(1)
    expect(listPending(L)[0]?.remindedAt).toEqual(['2026-10-21T07:00:00+02:00'])
  })
})

describe('rapport (annexe A4) et noms masqués', () => {
  it('aucun candidat masqué nommé dans la copie versionnée, avec ou sans accents, en mot entier', () => {
    const t = redactHidden('Ségolène Royal, Segolene ROYAL, Royal, royalement, Jérôme Guedj, guedj ; Maurel.', split.hidden)
    expect(t).toBe('[candidat masqué], [candidat masqué], [candidat masqué], royalement, [candidat masqué], [candidat masqué] ; [candidat masqué].')
    // Les candidats présentés restent nommés
    expect(redactHidden('Gabriel Attal et Natacha Polony.', split.hidden)).toBe('Gabriel Attal et Natacha Polony.')
  })

  it('les sections dans l’ordre, retenus avec « OK H-… », interprétation des députés européens signalée', () => {
    const names = Object.fromEntries(config.candidates.map((c: { id: string; name: string }) => [c.id, c.name]))
    const text = renderReport({
      runId: '2026-10-19-hebdo',
      run: { runId: '2026-10-19-hebdo', kind: 'hebdo', today: '2026-10-19', status: 'ok', baseCommit: '9d6eb73551535a45', branch: 'veille/2026-10-19-hebdo' },
      applyReport: {
        published: [{ claimKey: 'a'.repeat(40), candidateId: 'attal', questionId: 'retraites-1', approachId: 'retraites-1-b', kind: 'set', class: 'principale', cause: 'prise-de-position', statedAt: '2026-10-14', before: null, after: { weight: 2, nature: 'proposition', confidence: 'high', summary: 'Il propose de reporter l’âge de départ.', sources: [{ title: 'Programme', url: 'https://exemple.fr/p', date: '2026-10-14', publisher: 'Site de campagne' }] } }],
        held: [{ id: 'H-2026-10-19-1', reason: 'recodage-en-désaccord', change: { candidateId: 'lepen', approachId: 'sante-1-a' } }],
        dropped: [{ reason: 'sans-effet', change: {} }, { reason: 'sans-effet', change: {} }, { reason: 'réfutée', change: {} }],
      },
      classify: { qualifying: [], deferred: [], withdrawals: [], redeclarations: [{ ref: 'e2', candidateId: 'royal' }], conditions: [], official: [], watch: [], unchanged: [], stillDeclaredFalse: [] },
      ship: { code: 0, merge: 'abcdef1234567', indexAsset: 'assets/index-Ab12.js', lastShip: { sha: 'abcdef1234567', dataVersion: '2026-10-19.1', deployed: true, checked: true } },
      journal: [{ at: '2026-10-19T09:00:00+02:00', script: 'ship', tag: null, code: 30 }],
      outputs: { ship: { code: 30, reason: 'audit-pack en échec' } },
      pending: [{ id: 'H-2026-10-19-1', kind: 'hold', createdAt: '2026-10-19T09:00:00+02:00', summary: 'Recodage en désaccord.', approveWith: 'OK H-2026-10-19-1', status: 'attente' }],
      spend: { lines: [{ stage: 'refresh:candidates', tokens: 1234567, byCandidate: { attal: 1000 } }], totals: { day: 0, week: 1234567, month: 1234567 }, limits: { day: 800000, week: 12000000, month: 45000000 } },
      policy,
      names,
    })
    const heads = [...text.matchAll(/^## (.+)$/gm)].map(m => m[1])
    expect(heads).toEqual(['En ligne', 'Publié', 'Retenu', 'Écarté', 'Candidats', 'Attentes du propriétaire', 'Chiffres du profil', 'Jetons', 'Incidents'])
    expect(text).toContain('Données 2026-10-19.1 en ligne : commit `abcdef1`')
    expect(text).toContain('**Gabriel Attal**')
    expect(text).toContain('prise de position du 14 octobre 2026')
    expect(text).toContain('Pour publier : « OK H-2026-10-19-1 »')
    expect(text).toContain('- sans-effet : 2')
    expect(text).toContain('députés européens')
    expect(text).toContain('Gabriel Attal 1 000')
    expect(text).toContain('code 30 (audit-pack en échec)')
    expect(text).toContain('Ségolène Royal')
    expect(redactHidden(text, split.hidden)).not.toMatch(/Ségolène|Royal/)
    expect(renderReport({ runId: '2026-10-19-quotidien', run: { kind: 'quotidien', today: '2026-10-19', status: 'rien' }, policy })).toContain('Rien de neuf.')
    expect(renderReport({ runId: 'x', start: { code: 11, kind: 'hebdo', today: '2027-04-16', reason: 'gel : du 16 au 18' }, policy })).toContain('Reporté (gel) : gel : du 16 au 18.')
  })
})

// ——— Classement ———

describe('classement des candidats (lib/classify.mjs) : la règle de seuil en code', () => {
  type Ev = (typeof watchExample.events)[number]
  const decl: Ev = watchExample.events[0]
  const ev = (patch: (e: Ev) => void) => {
    const e = structuredClone(decl)
    patch(e)
    return e
  }
  const run = (events: Ev[], ctx: Partial<Parameters<typeof classifyWatch>[1]> = {}, stillDeclared: unknown[] = []) =>
    classifyWatch({ ...watchExample, events, stillDeclared }, { config, election, state: { watch: [], refused: [] }, pending: [], policy, today: '2026-10-19', ...ctx })
  const reasonOf = (events: Ev[], ctx = {}) => run(events, ctx).watch[0]?.reason ?? (run(events, ctx).qualifying.length ? 'qualifiant' : 'rien')
  const noOffice = { current: [], former: [] }
  const zero = { deputies: 0, senators: 0, meps: 0, url: null, asOf: null }

  it('l’exemple qualifie : sans condition, député passé, parti avec élus, 3 éditeurs dont une source primaire', () => {
    const out = run([decl])
    expect(out.qualifying).toHaveLength(1)
    expect(out.qualifying[0]).toMatchObject({ ref: 'e1', slug: 'exemple', name: 'Camille Exemple', party: 'Parti fictif' })
    expect(out.qualifying[0]?.reasons.join(' | ')).toContain('3 députés, 0 sénateur, 1 député européen')
    expect(out.qualifying[0]?.reasons.join(' | ')).toContain('fonction nationale passée : député')
    expect(out.qualifying[0]?.reasons.join(' | ')).toContain('3 sources de 3 éditeurs, dont 1 primaire(s)')
    const { watchNew: _n, log: _l, ...core } = out
    expect(_n).toEqual([])
    expect(_l).toEqual([])
    expect(validate(SCHEMAS.CLASSIFY_RESULT, core)).toEqual([])
  })

  it('matrice : chaque condition manquante renvoie « à surveiller », avec sa raison', () => {
    expect(reasonOf([ev(e => { e.checker = null })])).toBe('non-confirmé')
    expect(reasonOf([ev(e => { e.checker.verdict = 'uncertain' })])).toBe('non-confirmé')
    expect(reasonOf([ev(e => { e.checker.verdict = 'refuted' })])).toBe('déclaration-contestée')
    expect(reasonOf([ev(e => { e.unconditional = false; e.condition = 'si la primaire le désigne' })])).toBe('condition')
    expect(reasonOf([ev(e => { e.checker.unconditional = null })])).toBe('condition')
    // Seuil : ni élus ni fonction, côté agent ; ou côté vérificateur seulement
    expect(reasonOf([ev(e => { e.partyNationalElected = zero; e.nationalOffice = noOffice })])).toBe('seuil')
    expect(reasonOf([ev(e => { e.checker.partyNationalElected = zero; e.checker.nationalOffice = noOffice })])).toBe('seuil')
    expect(reasonOf([ev(e => { delete e.checker.partyNationalElected; delete e.checker.nationalOffice })])).toBe('seuil')
    // Sources : un seul éditeur ; deux éditeurs sans source primaire
    expect(reasonOf([ev(e => { e.sources = [e.sources[0]!]; e.checker.sources = [] })])).toBe('sources')
    expect(reasonOf([ev(e => { for (const s of [...e.sources, ...e.checker.sources!]) s.primary = false })])).toBe('sources')
  })

  it('seuil : fonction nationale seule suffit ; députés européens seuls selon policy.mepCountsAsNational', () => {
    const officeOnly = ev(e => {
      e.partyNationalElected = null
      e.checker.partyNationalElected = null
      e.nationalOffice = e.checker.nationalOffice = { current: [], former: [{ office: 'gouvernement', from: '2017-05-17', to: '2018-10-16', url: 'https://exemple.fr/gouv' }] }
    })
    expect(run([officeOnly]).qualifying).toHaveLength(1)
    const mepOnly = ev(e => {
      e.partyNationalElected = e.checker.partyNationalElected = { deputies: 0, senators: 0, meps: 2, url: 'https://parti.exemple.fr/elus', asOf: null }
      e.nationalOffice = e.checker.nationalOffice = noOffice
    })
    const out = run([mepOnly])
    expect(out.qualifying).toHaveLength(1)
    expect(out.qualifying[0]?.reasons.join(' ')).toContain('interprétation à confirmer')
    expect(reasonOf([mepOnly], { policy: mergePolicy({ mepCountsAsNational: false }) })).toBe('seuil')
    expect(thresholdOf({ deputies: 0, senators: 1, meps: 0, url: 'https://senat.fr/groupe' }, null)).toMatchObject({ met: true, mepOnly: false })
    expect(thresholdOf(null, null)).toMatchObject({ met: false, via: [] })
  })

  it('seuil : rien ne compte sans l’adresse qui le prouve (comptes d’élus, fonctions)', () => {
    expect(thresholdOf({ deputies: 0, senators: 1, meps: 0 }, null)).toMatchObject({ met: false, unproved: ['élus nationaux du parti sans adresse'] })
    expect(thresholdOf({ deputies: 0, senators: 1, meps: 0, url: null }, null).met).toBe(false)
    expect(thresholdOf(null, { current: [{ office: 'député', url: null }], former: [] })).toMatchObject({ met: false, unproved: ['1 fonction nationale sans adresse'] })
    expect(thresholdOf(null, { current: [{ office: 'député', url: 'https://assemblee-nationale.fr/x' }], former: [] }).met).toBe(true)
    const unproved = ev(e => {
      e.partyNationalElected = e.checker.partyNationalElected = { deputies: 1, senators: 0, meps: 0, url: null, asOf: null }
      e.nationalOffice = e.checker.nationalOffice = { current: [{ office: 'député', from: null, to: null, url: null }], former: [] }
    })
    expect(reasonOf([unproved])).toBe('seuil')
    expect(run([unproved]).watch[0]?.detail).toMatch(/sans adresse/)
  })

  it('sources : une page relue comme presse par le vérificateur n’est pas primaire, même si l’agent le disait', () => {
    const misread = ev(e => {
      const page = { ...e.sources[0]!, primary: true }
      e.sources = [page, { ...e.sources[1]!, primary: false }]
      for (const s of e.sources.slice(1)) s.primary = false
      e.checker.sources = [{ ...page, url: `${page.url}${page.url.includes('?') ? '&' : '?'}utm_source=x`, primary: false }]
    })
    expect(reasonOf([misread])).toBe('sources')
    const withdrawal = ev(e => {
      e.kind = 'withdrawal'
      e.person = { name: 'Natacha Polony', knownId: 'polony' }
      const page = { ...e.sources[0]!, primary: true }
      e.sources = [page, { ...e.sources[1]!, primary: false }]
      e.checker.sources = [{ ...page, primary: false }]
    })
    expect(run([withdrawal]).watch[0]).toMatchObject({ key: 'polony', reason: 'retrait-incertain' })
  })

  it('déjà connu, en attente, refusé : jamais une seconde préparation', () => {
    const polony = ev(e => { e.person.name = 'Natacha  POLONY' })
    expect(run([polony])).toMatchObject({ qualifying: [], watch: [], unchanged: ['e1'] })
    const waiting = { id: 'C-exemple', kind: 'candidat', branch: 'veille/candidat-exemple', createdAt: '2026-10-18T07:00:00+02:00', runId: '2026-10-18-quotidien', summary: 's', approveWith: 'OK C-exemple', status: 'attente' as const }
    expect(reasonOf([decl], { pending: [waiting] })).toBe('déjà-en-attente')
    const refused = run([decl], { state: { watch: [], refused: [{ key: 'exemple', name: 'Camille Exemple' }] } })
    expect(refused).toMatchObject({ qualifying: [], watch: [], unchanged: ['e1'] })
    expect(run([decl], { pending: [{ ...waiting, status: 'refusé' }] }).qualifying).toEqual([])
  })

  it('une même personne rapportée deux fois ne compte qu’une fois ; un identifiant commence toujours par une lettre', () => {
    const twice = run([decl, ev(e => { e.ref = 'e2' })])
    expect(twice.qualifying.map(q => q.ref)).toEqual(['e1'])
    expect(twice).toMatchObject({ deferred: [], watch: [], unchanged: ['e2'] })
    expect(twice.log[0]).toContain('doublon de e1')
    const hidden2 = run([ev(e => { e.kind = 'redeclaration'; e.person = { name: 'Ségolène Royal', knownId: 'royal' } }), ev(e => { e.ref = 'e2'; e.kind = 'redeclaration'; e.person = { name: 'Ségolène Royal', knownId: 'royal' } })])
    expect(hidden2.redeclarations).toHaveLength(1)
    const digit = run([ev(e => { e.person.name = 'Jean 2027' })])
    expect(digit.qualifying[0]?.slug).toMatch(/^[a-z][a-z0-9]*$/)
  })

  it('plafonds : une préparation par jour, deux par semaine ; au-delà, différée et « à surveiller »', () => {
    const second = ev(e => { e.ref = 'e2'; e.person.name = 'Dominique Autre' })
    const both = run([decl, second])
    expect(both.qualifying.map(q => q.slug)).toEqual(['exemple'])
    expect(both.deferred).toEqual([{ ref: 'e2', slug: 'autre', reason: 'déjà 1 préparation(s) aujourd’hui (plafond 1)' }])
    expect(both.watch.map(w => [w.key, w.reason])).toEqual([['autre', 'plafond-préparations']])
    const p = (id: string, day: string) => ({ id, kind: 'candidat', branch: null, createdAt: `${day}T07:00:00+02:00`, runId: `${day}-quotidien`, summary: 's', approveWith: `OK ${id}`, status: 'accordé' as const })
    expect(run([decl], { pending: [p('C-a', '2026-10-19')] }).deferred).toHaveLength(1)
    expect(run([decl], { pending: [p('C-a', '2026-10-18')] }).qualifying).toHaveLength(1)
    // Lundi 19 : la semaine a commencé ce jour-là ; deux préparations le 20 et le 21 bloquent le 22
    expect(run([decl], { pending: [p('C-a', '2026-10-20'), p('C-b', '2026-10-21')], today: '2026-10-22' }).deferred[0]?.reason).toContain('cette semaine')
    expect(run([decl], { pending: [p('C-a', '2026-10-17'), p('C-b', '2026-10-18')], today: '2026-10-19' }).qualifying).toHaveLength(1)
  })

  it('retraits : confirmé avec 2 éditeurs dont une source primaire ; sinon « retrait-incertain » ; jamais pour un masqué', () => {
    const w = ev(e => {
      e.kind = 'withdrawal'
      e.person = { name: 'Francis Lalanne', knownId: 'lalanne' }
    })
    expect(run([w]).withdrawals).toMatchObject([{ ref: 'e1', candidateId: 'lalanne' }])
    const unsure = run([ev(e => { e.kind = 'withdrawal'; e.person = { name: 'Francis Lalanne', knownId: 'lalanne' }; e.checker.verdict = 'uncertain' })])
    expect(unsure.withdrawals).toEqual([])
    expect(unsure.watch).toMatchObject([{ key: 'lalanne', name: 'Francis Lalanne', reason: 'retrait-incertain' }])
    const pendingR = { id: 'R-lalanne', kind: 'retrait', branch: null, createdAt: '2026-10-18T07:00:00+02:00', runId: '2026-10-18-quotidien', summary: 's', approveWith: 'OK R-lalanne', status: 'attente' as const }
    expect(run([w], { pending: [pendingR] })).toMatchObject({ withdrawals: [], unchanged: ['e1'] })
    const hiddenOut = run([ev(e => { e.kind = 'withdrawal'; e.person = { name: 'Olivier Faure', knownId: 'faure' } })])
    expect(hiddenOut).toMatchObject({ withdrawals: [], watch: [], unchanged: ['e1'] })
  })

  it('un masqué qui se déclare : redéclaration (par identifiant ou par nom), jamais « à surveiller »', () => {
    const byId = ev(e => { e.kind = 'redeclaration'; e.person = { name: 'Ségolène Royal', knownId: 'royal' } })
    const byName = ev(e => { e.ref = 'e2'; e.person = { name: 'Jérôme GUEDJ', knownId: null }; e.checker = null })
    const out = run([byId, byName])
    expect(out.redeclarations.map(r => r.candidateId)).toEqual(['royal', 'guedj'])
    expect(out.watch).toEqual([])
    expect(out.qualifying).toEqual([])
    // Réfutée par le vérificateur adverse : aucune attente D-<id>, jamais « à surveiller », notée au journal
    const refuted = run([ev(e => { e.kind = 'redeclaration'; e.person = { name: 'Ségolène Royal', knownId: 'royal' }; e.checker.verdict = 'refuted' })])
    expect(refuted).toMatchObject({ redeclarations: [], watch: [], qualifying: [], unchanged: ['e1'] })
    expect(refuted.log.join(' ')).toContain('réfutée')
  })

  it('conditions, événements officiels, signes de non-candidature', () => {
    const cond = ev(e => { e.kind = 'condition'; e.person = { name: 'Xavier Bertrand', knownId: 'bertrand' }; e.conditionChange = 'ajoutée' })
    const lifted = ev(e => { e.ref = 'e2'; e.kind = 'condition'; e.conditionChange = 'levée' })
    const off = ev(e => { e.ref = 'e3'; e.kind = 'official'; e.person = { name: 'Conseil constitutionnel', knownId: null }; e.official = { type: 'liste-officielle', detail: 'Liste publiée.' } })
    const out = run([cond, lifted, off], {}, [{ candidateId: 'zemmour', declared: false }, { candidateId: 'attal', declared: true }, { candidateId: 'faure', declared: false }])
    expect(out.conditions).toMatchObject([{ ref: 'e1', candidateId: 'bertrand', conditionChange: 'ajoutée' }])
    expect(out.qualifying.map(q => q.ref)).toEqual(['e2'])
    expect(out.official).toMatchObject([{ ref: 'e3', type: 'liste-officielle', detail: 'Liste publiée.' }])
    expect(out.stillDeclaredFalse).toEqual(['zemmour'])
  })

  it('« à surveiller » : la première date vue est gardée, seules les nouvelles clés sont dans watchNew', () => {
    const weak = ev(e => { e.partyNationalElected = zero; e.nationalOffice = noOffice })
    const known: WatchEntry = { key: 'exemple', name: 'Camille Exemple', party: 'Parti fictif', reason: 'seuil', firstSeen: '2026-10-12', lastSeen: '2026-10-12' }
    const out = run([weak], { state: { watch: [known], refused: [] } })
    expect(out.watch[0]).toMatchObject({ firstSeen: '2026-10-12', lastSeen: '2026-10-19' })
    expect(out.watchNew).toEqual([])
    expect(run([weak]).watchNew).toEqual(['exemple'])
  })
})

describe('classify.mjs (ligne de commande)', () => {
  const rootWith = () => {
    const root = tmp('classify')
    for (const f of [`${D}/config.json`, 'src/elections/presidentielle-2027/election.ts']) {
      mkdirSync(join(root, f, '..'), { recursive: true })
      cpSync(join(REPO_ROOT, f), join(root, f))
    }
    writeJ(join(root, D, 'veille', 'state.json'), seed0())
    writeJ(join(root, D, 'veille', 'policy.json'), DEFAULT_POLICY)
    return root
  }
  it('classe, fond les « à surveiller » dans watch.json local (sauf --dry-run), refuse un résultat non conforme (30)', () => {
    const root = rootWith()
    const L = tmp('local')
    const file = join(root, 'watch.json')
    const weak = structuredClone(watchExample)
    weak.events.push({ ...structuredClone(weak.events[0]), ref: 'e2', person: { name: 'Dominique Autre', knownId: null }, checker: null })
    writeJ(file, weak)
    const dry = cli('classify.mjs', [file, '--dry-run', '--root', root], { ISOLOIR_VEILLE_LOCAL: L })
    expect(dry.code).toBe(0)
    expect(dry.json).toMatchObject({ written: null, qualifying: [{ slug: 'exemple' }], watch: [{ key: 'autre', reason: 'non-confirmé' }] })
    expect(existsSync(join(L, 'watch.json'))).toBe(false)
    const real = cli('classify.mjs', [file, '--root', root], { ISOLOIR_VEILLE_LOCAL: L })
    expect(real.code).toBe(0)
    expect(readJ(join(L, 'watch.json'))).toMatchObject({ format: 'isoloir-veille-watch-local/1', entries: [{ key: 'autre', firstSeen: '2026-10-19' }] })
    const bad = structuredClone(watchExample)
    bad.events[0].kind = 'rumeur'
    writeJ(file, bad)
    const refused = cli('classify.mjs', [file, '--root', root], { ISOLOIR_VEILLE_LOCAL: L })
    expect(refused.code).toBe(30)
    expect(refused.json.bundles).toEqual([])
    expect(cli('classify.mjs', ['--root', root], { ISOLOIR_VEILLE_LOCAL: L }).code).toBe(2)
  }, 30000)
})

// ——— Conservation des workflows ———

describe('conservation des workflows (lib/persist.mjs)', () => {
  it('fichiers de résultat et journaux retrouvés dans tous les projets et toutes les sessions', () => {
    const P = tmp('projets')
    writeJ(join(P, 'projet-a', 'session-1', 'workflows', 'wf_abc-123.json'), { runId: 'wf_abc-123' })
    writeFileSync(join(mkdirOf(join(P, 'projet-b', 'session-2', 'subagents', 'workflows', 'wf_abc-123')), 'journal.jsonl'), '')
    writeJ(join(P, 'projet-b', 'session-3', 'workflows', 'wf_autre.json'), {})
    const found = findWorkflowFiles(P, 'abc-123')
    expect(found.results).toEqual([join(P, 'projet-a', 'session-1', 'workflows', 'wf_abc-123.json')])
    expect(found.journals).toEqual([join(P, 'projet-b', 'session-2', 'subagents', 'workflows', 'wf_abc-123', 'journal.jsonl')])
    expect(findWorkflowFiles(join(P, 'absent'), 'abc-123')).toEqual({ results: [], journals: [] })
  })

  it('jetons par candidat d’après les libellés des agents connus', () => {
    const wf = { workflowProgress: [
      { type: 'workflow_phase', title: 'Tri' },
      { type: 'workflow_agent', label: 'tri:attal', tokens: 100 },
      { type: 'workflow_agent', label: 'verif:attal-2', tokens: 50 },
      { type: 'workflow_agent', label: 'aveugle:lepen:sante-1', tokens: 7 },
      { type: 'workflow_agent', label: 'preparation', tokens: 1000 },
      { type: 'workflow_agent', label: 'tri:inconnu', tokens: 9 },
    ] }
    expect(tokensByCandidate(wf, ['attal', 'lepen'])).toEqual({ attal: 150, lepen: 7 })
  })

  it('changeset : créé puis complété dans l’ordre, un même lancement jamais deux fois', () => {
    const r1 = refreshExample
    const a = addToChangeset(null, { runId: '2026-10-19-hebdo', baseCommit: '9d6eb73', today: '2026-10-19', sinceMap: { exemple: '2026-10-06' }, result: r1, wfRunId: 'wf_1' })
    expect(a.added).toBe(true)
    expect(validate(SCHEMAS.CHANGESET, a.changeset)).toEqual([])
    expect(a.changeset).toMatchObject({ since: { exemple: '2026-10-06' }, holds: [], approve: [], wfRunIds: ['wf_1'] })
    const b = addToChangeset(a.changeset, { runId: '2026-10-19-hebdo', baseCommit: '9d6eb73', today: '2026-10-19', result: r1, wfRunId: 'wf_1' })
    expect(b.added).toBe(false)
    expect(b.changeset.results).toHaveLength(1)
    const c = addToChangeset(b.changeset, { runId: '2026-10-19-hebdo', baseCommit: '9d6eb73', today: '2026-10-19', result: { ...r1, mode: 'programme' }, wfRunId: 'wf_2' })
    expect(c.changeset.results).toHaveLength(2)
    expect(c.changeset.wfRunIds).toEqual(['wf_1', 'wf_2'])
  })

  it('reprise d’un journal : résultats finis gardés, agents sans résultat listés, lignes abîmées comptées', () => {
    const lines = [
      { type: 'launched' },
      { type: 'started', key: 'k1', agentId: 'a1', label: 'tri:attal', phase: 'Tri' },
      { type: 'started', key: 'k2', agentId: 'a2', label: 'tri:lepen', phase: 'Tri' },
      { type: 'result', key: 'k1', agentId: 'a1', result: { candidate: 'attal', findings: 2 } },
    ].map(l => JSON.stringify(l))
    const rec = recoverFromJournal([...lines, '{ coupé'].join('\n'))
    expect(rec).toMatchObject({ started: 2, finished: 1, missing: ['tri:lepen'], badLines: 1 })
    expect(rec.agents[0]).toMatchObject({ label: 'tri:attal', phase: 'Tri', result: { findings: 2 } })
  })

  it('6-add-candidate : erreur et sortie partielle (onlyGroups) refusées ; recherche : jamais d’écrasement d’un fichier différent', () => {
    const ok = { args: {}, result: { format: 'isoloir-add-candidate/1', candidate: 'dupont', positions: [] } }
    expect(checkAddCandidate(ok)).toMatchObject({ ok: true, id: 'dupont' })
    expect(checkAddCandidate({ ...ok, args: { onlyGroups: ['economie'] } })).toMatchObject({ ok: false, partial: true })
    expect(checkAddCandidate({ ...ok, result: { ...ok.result, error: ['banque absente'] } }).ok).toBe(false)
    expect(checkAddCandidate({ ...ok, result: { ...ok.result, error: [] } }).ok).toBe(true)
    expect(checkAddCandidate(ok, 'durand').ok).toBe(false)
    const plan = planResearchCopy(
      [{ name: 'dossier_a.json', text: '{"x":1,"y":2}' }, { name: 'dossier_b.json', text: '{"x":1}' }, { name: 'dossier_c.json', text: '{"x":1}' }],
      n => ({ 'dossier_b.json': '{\n  "x": 1\n}', 'dossier_c.json': '{"x":2}' })[n] ?? null,
    )
    expect(plan).toEqual({ write: [{ name: 'dossier_a.json', text: '{"x":1,"y":2}' }], same: ['dossier_b.json'], conflicts: ['dossier_c.json'] })
    expect(firstFreeNumber(['expansion-output.json', 'expansion-output-2.json', 'expansion-output-3.json', 'expansion-output-5.json'])).toBe(4)
    expect(firstFreeNumber([])).toBe(3)
  })
})

function mkdirOf(d: string) {
  mkdirSync(d, { recursive: true })
  return d
}

describe('persist.mjs (ligne de commande, projets Claude simulés)', () => {
  /** Une racine (hors de git), une exécution en cours sous verrou, un dossier de projets Claude */
  const setup = () => {
    const root = tmp('persist')
    mkdirSync(join(root, D), { recursive: true })
    cpSync(join(REPO_ROOT, D, 'config.json'), join(root, D, 'config.json'))
    const L = tmp('local')
    const projects = tmp('projets')
    const runId = '2026-10-19-hebdo'
    writeJ(join(L, 'lock.json'), { runId, kind: 'hebdo', worktrees: [{ path: root, runId }], startedAt: '2026-10-19T06:00:00+02:00', heartbeatAt: '2026-10-19T06:00:00+02:00', phase: 'essai', pid: 1, takenOverFrom: null })
    writeJ(join(L, 'runs', runId, 'run.json'), { format: 'isoloir-veille-run/1', runId, kind: 'hebdo', worktree: root, branch: 'veille/2026-10-19-hebdo', baseCommit: '9d6eb73', startedAt: '2026-10-19T06:00:00+02:00', today: '2026-10-19', status: 'en-cours', since: { exemple: '2026-10-06' }, workflows: [] })
    const session = join(projects, '-Users-essai', 'session-1')
    const wf = (id: string, result: unknown, extra: Record<string, unknown> = {}) =>
      writeJ(join(session, 'workflows', `${id}.json`), { runId: id, status: 'completed', result, totalTokens: 123456, workflowProgress: [{ type: 'workflow_agent', label: 'tri:attal', tokens: 1000 }], args: {}, ...extra })
    const journal = (id: string, lines: unknown[]) => writeFileSync(join(mkdirOf(join(session, 'subagents', 'workflows', id)), 'journal.jsonl'), lines.map(l => JSON.stringify(l)).join('\n') + '\n')
    const env = { ISOLOIR_VEILLE_LOCAL: L, ISOLOIR_VEILLE_PROJECTS: projects }
    const persist = (args: string[]) => cli('persist.mjs', [...args, '--root', root, '--now', '2026-10-19T08:00:00+02:00'], env)
    return { root, L, runId, wf, journal, persist, runDir: join(L, 'runs', runId) }
  }

  it('watch : copie, dépense notée une seule fois, valeur rangée localement et dans la trace versionnée', () => {
    const s = setup()
    s.wf('wf_w1', watchExample)
    const r = s.persist(['--run', 'w1', '--kind', 'watch'])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ wfRunId: 'wf_w1', stage: 'watch', tokens: 123456, byCandidate: { attal: 1000 }, spendRecorded: true, events: 1 })
    expect(readJ(join(s.runDir, 'watch.json'))).toEqual(watchExample)
    expect(readJ(join(s.root, D, 'veille', 'runs', s.runId, 'watch.json'))).toEqual(watchExample)
    expect(existsSync(join(s.runDir, 'wf', 'wf_w1.json'))).toBe(true)
    expect(s.persist(['--run', 'wf_w1', '--kind', 'watch']).json.spendRecorded).toBe(false)
    const spend = readSpend(join(s.L, 'spend.jsonl')).lines
    expect(spend).toHaveLength(1)
    expect(validate(SCHEMAS.SPEND_LINE, spend[0])).toEqual([])
    expect(readJ(join(s.runDir, 'run.json')).workflows).toMatchObject([{ wfRunId: 'wf_w1', kind: 'watch', tokens: 123456 }])
    // La sortie de persist est rangée sous persist-watch.json, run.json reste le RUN
    expect(readJ(join(s.runDir, 'persist-watch.json'))).toMatchObject({ script: 'persist', code: 0 })
    expect(readJ(join(s.runDir, 'run.json')).format).toBe('isoloir-veille-run/1')
  }, 30000)

  it('refresh : refresh-<n>.json et changeset (local et versionné), ajout dans l’ordre, sans doublon', () => {
    const s = setup()
    s.wf('wf_r1', refreshExample)
    s.wf('wf_r2', { ...refreshExample, mode: 'programme' })
    expect(s.persist(['--run', 'wf_r1', '--kind', 'refresh']).json).toMatchObject({ file: 'refresh-1.json', changesetResults: 1, stage: 'refresh:candidates' })
    expect(s.persist(['--run', 'wf_r2', '--kind', 'refresh']).json).toMatchObject({ file: 'refresh-2.json', changesetResults: 2, stage: 'refresh:programme' })
    expect(s.persist(['--run', 'wf_r1', '--kind', 'refresh']).json).toMatchObject({ file: 'refresh-1.json', changesetResults: 2, added: false })
    const cs = readJ(join(s.runDir, 'changeset.json'))
    expect(validate(SCHEMAS.CHANGESET, cs)).toEqual([])
    expect(cs).toMatchObject({ runId: s.runId, baseCommit: '9d6eb73', today: '2026-10-19', since: { exemple: '2026-10-06' }, wfRunIds: ['wf_r1', 'wf_r2'] })
    expect(readJ(join(s.root, D, 'veille', 'runs', s.runId, 'changeset.json'))).toEqual(cs)
  }, 30000)

  it('refus : valeur non conforme (30, 10 erreurs au plus), workflow en échec (30, dépense quand même notée), lancement introuvable', () => {
    const s = setup()
    const bad = structuredClone(refreshExample)
    bad.candidates[0].changes[0].kind = 'déplacer'
    s.wf('wf_bad', bad)
    const r = s.persist(['--run', 'wf_bad', '--kind', 'refresh'])
    expect(r.code).toBe(30)
    expect(r.json.bundles).toEqual([])
    expect(r.json.reason).toContain('REFRESH_RESULT non conforme')
    expect(existsSync(join(s.runDir, 'changeset.json'))).toBe(false)
    s.wf('wf_err', null, { status: 'failed', error: 'agent mort' })
    const e = s.persist(['--run', 'wf_err', '--kind', 'watch'])
    expect(e.code).toBe(30)
    expect(e.json.reason).toContain('agent mort')
    expect(readSpend(join(s.L, 'spend.jsonl')).lines.map(l => l.wfRunId)).toContain('wf_err')
    expect(s.persist(['--run', 'wf_absent', '--kind', 'watch']).code).toBe(30)
    expect(s.persist(['--run', 'wf_absent', '--kind', 'inconnu']).code).toBe(2)
    // Veille aveugle (workflow 8 en erreur : ses deux chercheurs morts) : 30 avec ses raisons, rien d'écrit
    s.wf('wf_aveugle', { format: 'isoloir-veille-watch/1', electionId: 'presidentielle-2027', error: ['les deux chercheurs sont morts : veille aveugle'] })
    const blind = s.persist(['--run', 'wf_aveugle', '--kind', 'watch'])
    expect(blind.code).toBe(30)
    expect(blind.json).toMatchObject({ bundles: [], errors: ['les deux chercheurs sont morts : veille aveugle'] })
    expect(blind.json.reason).toContain('veille aveugle')
    expect(existsSync(join(s.runDir, 'watch.json'))).toBe(false)
    // Sans exécution en cours : 2
    expect(cli('persist.mjs', ['--run', 'wf_bad', '--kind', 'watch', '--root', tmp('nue')], { ISOLOIR_VEILLE_LOCAL: tmp('local') }).code).toBe(2)
  }, 30000)

  it('addcandidate : sortie complète écrite ; sortie partielle refusée, gardée localement, fichier complet intact', () => {
    const s = setup()
    const full = { format: 'isoloir-add-candidate/1', electionId: 'presidentielle-2027', candidate: 'dupont', positions: [{ q: 1 }], questions: [] }
    s.wf('wf_a1', full)
    expect(s.persist(['--run', 'wf_a1', '--kind', 'addcandidate', '--candidate', 'dupont']).code).toBe(0)
    const dest = join(s.root, D, 'add-candidate', 'dupont.json')
    expect(readJ(dest)).toEqual(full)
    s.wf('wf_a2', { ...full, positions: [] }, { args: { onlyGroups: ['economie'] } })
    const r = s.persist(['--run', 'wf_a2', '--kind', 'addcandidate', '--candidate', 'dupont'])
    expect(r.code).toBe(30)
    expect(r.json).toMatchObject({ partial: true, bundles: ['candidat:dupont'] })
    expect(readJ(dest)).toEqual(full)
    expect(existsSync(join(s.runDir, 'addcandidate-partiel-dupont.json'))).toBe(true)
  }, 30000)

  it('research : extract-journal, puis copie des dossiers ; un dossier existant différent n’est jamais écrasé', () => {
    const s = setup()
    s.wf('wf_s1', { counts: 1 })
    s.journal('wf_s1', [
      { type: 'started', key: 'k1', agentId: 'a1', label: 'dossier:dupont' },
      { type: 'result', key: 'k1', agentId: 'a1', result: { candidate: 'dupont', claims: [1] } },
      { type: 'started', key: 'k2', agentId: 'a2', label: 'facts-check' },
      { type: 'result', key: 'k2', agentId: 'a2', result: { calendar: 'x' } },
    ])
    const r = s.persist(['--run', 'wf_s1', '--kind', 'research', '--candidate', 'dupont'])
    expect(r.code).toBe(0)
    expect(r.json.written).toEqual(['dossier_dupont.json'])
    expect(readJ(join(s.root, D, 'dossier_dupont.json'))).toEqual({ candidate: 'dupont', claims: [1] })
    expect(existsSync(join(s.root, D, 'facts-check.json'))).toBe(false)
    // Même contenu : rien à faire ; contenu différent : refus, fichier intact
    expect(s.persist(['--run', 'wf_s1', '--kind', 'research', '--candidate', 'dupont']).json.unchanged).toEqual(['dossier_dupont.json'])
    s.wf('wf_s2', { counts: 1 })
    s.journal('wf_s2', [{ type: 'started', key: 'k1', label: 'dossier:dupont' }, { type: 'result', key: 'k1', result: { candidate: 'dupont', claims: [2] } }])
    const c = s.persist(['--run', 'wf_s2', '--kind', 'research', '--candidate', 'dupont'])
    expect(c.code).toBe(30)
    expect(c.json.conflicts).toEqual(['dossier_dupont.json'])
    expect(readJ(join(s.root, D, 'dossier_dupont.json'))).toEqual({ candidate: 'dupont', claims: [1] })
  }, 30000)

  it('--recover : sans fichier de résultat, les agents finis sont repris du journal, run.json « interrompu » ; rien à reprendre : 30', () => {
    const s = setup()
    s.journal('wf_cut', [
      { type: 'started', key: 'k1', agentId: 'a1', label: 'tri:attal', phase: 'Tri' },
      { type: 'result', key: 'k1', agentId: 'a1', result: { triage: 'ok' } },
      { type: 'started', key: 'k2', agentId: 'a2', label: 'tri:lepen', phase: 'Tri' },
    ])
    expect(s.persist(['--run', 'wf_cut', '--kind', 'refresh']).code).toBe(30)
    const r = s.persist(['--run', 'wf_cut', '--kind', 'refresh', '--recover'])
    expect(r.code).toBe(0)
    expect(r.json).toMatchObject({ recovered: 1, started: 2, missing: ['tri:lepen'] })
    expect(readJ(join(s.runDir, 'recovered-wf_cut.json')).agents[0]).toMatchObject({ label: 'tri:attal', result: { triage: 'ok' } })
    expect(readJ(join(s.runDir, 'run.json'))).toMatchObject({ status: 'interrompu', workflows: [{ wfRunId: 'wf_cut', recovered: true }] })
    s.journal('wf_vide', [{ type: 'started', key: 'k1', label: 'tri:attal' }])
    expect(s.persist(['--run', 'wf_vide', '--kind', 'refresh', '--recover']).code).toBe(30)
  }, 30000)
})

// ——— run.mjs dans un dépôt git temporaire ———

describe('run.mjs (dépôt git temporaire, worktrees veille-*)', () => {
  const repo = makeRepo()
  const hebdo = repo.worktree('veille-2026-10-19-hebdo', 'veille/2026-10-19-hebdo')
  const quotidien = repo.worktree('veille-2026-10-19-quotidien')
  const run = (wt: string, args: string[], env: Record<string, string>) => cli('run.mjs', [...args, '--root', wt], env)
  const MON = '2026-10-19T06:00:00+02:00'

  it('start hebdo : verrou, run.json, exclusion git, cibles et arguments des workflows ; un second départ sort en 21', () => {
    const env = envFor(repo.M)
    const r = run(hebdo, ['start', '--kind', 'hebdo', '--now', MON], env)
    expect(r.code, r.stderr).toBe(0)
    expect(r.json).toMatchObject({ runId: '2026-10-19-hebdo', kind: 'hebdo', mode: 'publication', today: '2026-10-19', baseCommit: repo.head, branch: 'veille/2026-10-19-hebdo', essai: false, interrupted: null })
    const targets = r.json.targets as { id: string; since: string; rotation: string[] }[]
    expect(targets.map(t => t.id)).toEqual(split.visibleIds)
    expect(targets.find(t => t.id === 'attal')?.since).toBe('2026-10-06')
    expect(targets.find(t => t.id === 'polony')?.since).toBe('2026-10-11')
    expect(targets.find(t => t.id === 'polony')?.rotation).toEqual(rotationFor(seed0(), bankJson, 'polony', policy).questions)
    const wa = r.json.workflowArgs as { watch: Record<string, unknown>; refresh: Record<string, unknown> }
    // Première veille : depuis le contextDate de config.json s'il est plus ancien que today − 3 jours
    const firstSince = [config.contextDate, '2026-10-16'].sort()[0]
    expect(wa.watch).toMatchObject({ root: hebdo, today: '2026-10-19', contextDate: '2026-10-19', since: firstSince, minSearches: 10, mepCountsAsNational: true, maxChecks: 8 })
    expect((wa.watch.hidden as { id: string }[]).map(h => h.id)).toEqual(split.hiddenIds)
    expect(wa.refresh).toMatchObject({ mode: 'candidates', hiddenIds: split.hiddenIds, packetSize: 60, maxProposals: 2, minSearches: 8, questions: [] })
    const L = env.ISOLOIR_VEILLE_LOCAL
    expect(validate(SCHEMAS.LOCK, readJ(join(L, 'lock.json')))).toEqual([])
    const runJson = readJ(join(L, 'runs', '2026-10-19-hebdo', 'run.json'))
    expect(validate(SCHEMAS.RUN, runJson)).toEqual([])
    expect(runJson).toMatchObject({ status: 'en-cours', baseCommit: repo.head, since: { attal: '2026-10-06' } })
    expect(readJ(join(L, 'runs', '2026-10-19-hebdo', 'run-start.json'))).toMatchObject({ command: 'start', code: 0 })
    expect(readFileSync(join(repo.M, '.git', 'info', 'exclude'), 'utf8').split('\n').filter(l => l === '/.claude/veille/')).toHaveLength(1)
    // Un autre worktree ne part pas tant que le verrou est frais
    const other = run(quotidien, ['start', '--kind', 'quotidien', '--now', '2026-10-19T07:00:00+02:00'], env)
    expect(other.code).toBe(21)
    expect(other.json).toMatchObject({ holder: '2026-10-19-hebdo', runId: '2026-10-19-quotidien' })
    // Battement, dépense, fin : verrou libéré, nettoyage lancé sans erreur
    expect(run(hebdo, ['heartbeat', '--phase', 'veille', '--now', '2026-10-19T07:00:00+02:00'], env).json).toMatchObject({ code: 0, phase: 'veille' })
    expect(run(quotidien, ['heartbeat'], env).code).toBe(21)
    const b = run(hebdo, ['budget', '--tokens', '500000', '--stage', 'watch', '--estimate', '1000', '--now', '2026-10-19T07:30:00+02:00'], env)
    expect(b.json).toMatchObject({ code: 0, kind: 'hebdo', recorded: { tokens: 500000, stage: 'watch', runId: '2026-10-19-hebdo' }, spent: { day: 0, week: 500000 } })
    const f = run(hebdo, ['finish', '--status', 'ok', '--now', '2026-10-19T09:00:00+02:00'], env)
    expect(f.json).toMatchObject({ code: 0, lockReleased: 'tout', cleanup: { code: 0 } })
    expect(existsSync(join(L, 'lock.json'))).toBe(false)
    expect(readJ(join(L, 'runs', '2026-10-19-hebdo', 'run.json'))).toMatchObject({ status: 'ok', finishedAt: '2026-10-19T09:00:00+02:00' })
    // run.json n'est jamais écrasé par une sortie de run.mjs
    expect(readJ(join(L, 'runs', '2026-10-19-hebdo', 'run-finish.json'))).toMatchObject({ command: 'finish' })
    expect(run(quotidien, ['start', '--kind', 'quotidien', '--now', '2026-10-19T09:30:00+02:00'], env).code).toBe(0)
  }, 60000)

  it('refus dans l’ordre du contrat : worktree et kind (2), STOP, PAUSE, policy.paused (20), fin (13), gel (11), gel souple (12) ; aucun verrou pris', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    expect(run(hebdo, ['start', '--kind', 'quotidien', '--now', MON], env).code).toBe(2)
    expect(run(repo.M, ['start', '--kind', 'hebdo', '--now', MON], env).code).toBe(2)
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', '2026-10-19'], env).code).toBe(2)
    writeFileSync(join(L, 'STOP'), '')
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', '2027-05-10T06:00:00+02:00'], env).code).toBe(20)
    rmSync(join(L, 'STOP'))
    writeFileSync(join(L, 'PAUSE'), 'déploiement à vérifier')
    const paused = run(hebdo, ['start', '--kind', 'hebdo', '--now', MON], env)
    expect(paused.code).toBe(20)
    expect(paused.json.reason).toContain('déploiement à vérifier')
    rmSync(join(L, 'PAUSE'))
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', '2027-05-10T06:00:00+02:00'], env).code).toBe(13)
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', '2027-04-17T06:00:00+02:00'], env).code).toBe(11)
    const soft = run(hebdo, ['start', '--kind', 'hebdo', '--now', '2027-04-14T06:00:00+02:00'], env)
    expect(soft.code).toBe(12)
    expect(soft.json.gate).toMatchObject({ softFreeze: { start: '2027-04-14T00:00:00+02:00' } })
    expect(existsSync(join(L, 'lock.json'))).toBe(false)
    expect(existsSync(join(L, 'runs', '2026-10-19-hebdo', 'run.json'))).toBe(false)
    // policy.paused, posé par le propriétaire sur main (origin/main) : 20
    const pausedRepo = makeRepo({ policy: { ...DEFAULT_POLICY, paused: true, pausedReason: 'vacances' } })
    const wt = pausedRepo.worktree('veille-2026-10-26-hebdo', 'veille/2026-10-26-hebdo')
    const p = run(wt, ['start', '--kind', 'hebdo', '--now', '2026-10-26T06:00:00+01:00'], envFor(pausedRepo.M))
    expect(p.code).toBe(20)
    expect(p.json.reason).toContain('vacances')
  }, 60000)

  it('la politique se lit à origin/main : une copie affaiblie dans le worktree de l’exécution ne change aucune porte', () => {
    const env = envFor(repo.M)
    const wt = repo.worktree('veille-2026-11-30-hebdo', 'veille/2026-11-30-hebdo')
    const pol = join(wt, D, 'veille', 'policy.json')
    writeJ(pol, { ...readJ(pol), paused: false, softFreezeHours: 0, endAt: '2027-12-31T00:00:00+01:00', reportOnlyBetweenRounds: false })
    // gel souple (2027-04-14), fin de la veille (2027-05-10), entre-deux-tours (push du 2027-04-22) : comme sans la copie
    expect(run(wt, ['start', '--kind', 'hebdo', '--now', '2027-04-14T06:00:00+02:00'], env).code).toBe(12)
    expect(run(wt, ['start', '--kind', 'hebdo', '--now', '2027-05-10T06:00:00+02:00'], env).code).toBe(13)
    const gate = (step: string, now: string) => cli('gate-time.mjs', ['--step', step, '--now', now, '--root', wt], env)
    expect(gate('push', '2027-04-15T12:00:00+02:00').code).toBe(12)
    expect(gate('deploy', '2027-05-05T12:00:00+02:00').code).toBe(13)
    expect(gate('push', '2027-04-22T12:00:00+02:00').code).toBe(12)
  }, 60000)

  // Une heure simulée ne fait que resserrer la porte, hors dépôt d'essai : l'horloge réelle est passée aussi. On gèle
  // l'instant réel (extraFreezeWindows de la politique d'origin/main) et on simule un instant libre.
  it.skipIf(Date.now() > Date.parse('2027-03-01T00:00:00+01:00'))('run start : --now ne desserre jamais la porte de l’horloge réelle (origin distant)', () => {
    const t = Date.now()
    const window = { start: new Date(t - 3600e3).toISOString(), end: new Date(t + 3600e3).toISOString(), reason: 'essai' }
    const real = makeRepo({ policy: { ...DEFAULT_POLICY, extraFreezeWindows: [window] }, remote: 'https://example.invalid/isoloir.git' })
    const wt = real.worktree('veille-2026-11-16-quotidien')
    const free = new Date(t + 3 * 86400e3).toISOString().replace(/\.\d+Z$/, 'Z')
    const r = run(wt, ['start', '--kind', 'quotidien', '--now', free], envFor(real.M))
    expect(r.code).toBe(11)
    expect(r.json.reason).toMatch(/à l’horloge/)
    // Dépôt d'essai (pas d'origin distant) : l'heure simulée seule compte
    const test = makeRepo({ policy: { ...DEFAULT_POLICY, extraFreezeWindows: [window] } })
    const wt2 = test.worktree('veille-2026-11-16-quotidien')
    expect(run(wt2, ['start', '--kind', 'quotidien', '--now', free], envFor(test.M)).code).toBe(0)
  }, 60000)

  it('verrou périmé repris (noté), exécution précédente du même kind marquée interrompue', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    const old = '2026-10-12-hebdo'
    writeJ(join(L, 'lock.json'), { runId: old, kind: 'hebdo', worktrees: [{ path: join(repo.M, '.claude', 'worktrees', `veille-${old}`), runId: old }], startedAt: '2026-10-19T00:30:00+02:00', heartbeatAt: '2026-10-19T01:00:00+02:00', phase: 'codage', pid: 1, takenOverFrom: null })
    writeJ(join(L, 'runs', old, 'run.json'), { format: 'isoloir-veille-run/1', runId: old, kind: 'hebdo', worktree: '/x', branch: null, baseCommit: repo.head, startedAt: '2026-10-12T06:00:00+02:00', today: '2026-10-12', status: 'en-cours' })
    // Battement d'il y a 3 h : frais, 21
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', '2026-10-19T04:00:00+02:00'], env).code).toBe(21)
    const r = run(hebdo, ['start', '--kind', 'hebdo', '--now', MON], env)
    expect(r.code, r.stderr).toBe(0)
    expect(r.json.lock).toMatchObject({ takenOverFrom: old })
    expect(r.stderr).toContain(`verrou repris de ${old}`)
    expect(r.json.interrupted).toMatchObject({ runId: old, status: 'interrompu' })
    expect(readJ(join(L, 'runs', old, 'run.json')).status).toBe('interrompu')
    expect(readJ(join(L, 'lock.json.repris')).runId).toBe(old)
    expect(readJ(join(L, 'runs', '2026-10-19-hebdo', 'run.json')).takenOverFrom).toBe(old)
    run(hebdo, ['abort', '--reason', 'essai', '--now', MON], env)
    expect(readJ(join(L, 'runs', '2026-10-19-hebdo', 'run.json'))).toMatchObject({ status: 'échec', note: 'abandon : essai' })
  }, 60000)

  it('budget au départ : semaine pleine (22, sans verrou), mois au-delà de 80 % (classés seulement), usage du forfait (22)', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    const spend = (lines: SpendLine[]) => writeFileSync(join(L, 'spend.jsonl'), lines.map(l => JSON.stringify(l)).join('\n') + '\n')
    spend([{ at: '2026-10-19T00:30:00+02:00', runId: '2026-10-18-quotidien', kind: 'quotidien', stage: 'watch', wfRunId: null, tokens: 11500000 }])
    const full = run(hebdo, ['start', '--kind', 'hebdo', '--now', MON], env)
    expect(full.code).toBe(22)
    expect(full.json.reason).toContain('semaine')
    expect(existsSync(join(L, 'lock.json'))).toBe(false)
    spend([{ at: '2026-10-05T06:30:00+02:00', runId: '2026-10-05-hebdo', kind: 'hebdo', stage: 'refresh:candidates', wfRunId: null, tokens: 37000000 }])
    const usage = JSON.stringify({ plan: { status: 'ok', windows: [{ label: 'Weekly · all models', percentUsed: 90 }] } })
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', MON, '--usage', usage], env).code).toBe(22)
    expect(run(hebdo, ['start', '--kind', 'hebdo', '--now', MON, '--usage', '{ pas du json'], env).code).toBe(2)
    const soft = run(hebdo, ['start', '--kind', 'hebdo', '--now', MON], env)
    expect(soft.code).toBe(0)
    expect(soft.json.budget).toMatchObject({ softMonthly: true, advice: 'ranked-only' })
    const ids = (soft.json.targets as { id: string }[]).map(t => t.id)
    for (const x of election.ranking?.excluded?.ids ?? []) expect(ids).not.toContain(x)
    expect(ids).toContain('attal')
    // Après le départ : budget --stage refresh:programme refusé à la troisième fois de la semaine ; STOP → 20
    const prog = (n: number) => ({ at: `2026-10-19T0${n}:00:00+02:00`, runId: '2026-10-19-hebdo', kind: 'hebdo', stage: 'refresh:programme', wfRunId: null, tokens: 1 })
    spend([prog(7), prog(8)])
    expect(run(hebdo, ['budget', '--stage', 'refresh:programme', '--estimate', '2000000', '--now', '2026-10-19T09:00:00+02:00'], env).code).toBe(22)
    writeFileSync(join(L, 'STOP'), '')
    expect(run(hebdo, ['budget', '--estimate', '1', '--now', '2026-10-19T09:00:00+02:00'], env).code).toBe(20)
    expect(run(hebdo, ['heartbeat', '--now', '2026-10-19T09:00:00+02:00'], env).code).toBe(20)
    rmSync(join(L, 'STOP'))
    run(hebdo, ['finish', '--status', 'budget', '--no-cleanup'], env)
  }, 60000)

  it('fenêtre de la veille des candidats : depuis la dernière veille menée au bout, bornée à 21 jours', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    const past = (id: string, today: string, status = 'rien', classify = true) => {
      writeJ(join(L, 'runs', id, 'run.json'), { format: 'isoloir-veille-run/1', runId: id, kind: 'quotidien', worktree: '/x', branch: null, baseCommit: repo.head, startedAt: `${today}T07:00:00+02:00`, today, status })
      writeJ(join(L, 'runs', id, 'watch.json'), { format: 'isoloir-veille-watch/1', electionId: 'presidentielle-2027', today, since: today, events: [] })
      if (classify) writeJ(join(L, 'runs', id, 'classify.json'), { script: 'classify', code: 0 })
    }
    past('2026-10-12-quotidien', '2026-10-12')
    past('2026-10-13-quotidien', '2026-10-13', 'échec')
    past('2026-10-14-quotidien', '2026-10-14', 'ok', false)
    const wt = repo.worktree('veille-2026-10-20-quotidien')
    const r = run(wt, ['start', '--kind', 'quotidien', '--now', '2026-10-20T07:00:00+02:00'], env)
    expect(r.code, r.stderr).toBe(0)
    // Six jours sans veille menée au bout (échec le 13, classement absent le 14) : on repart du 12
    expect((r.json.workflowArgs as { watch: { since: string } }).watch.since).toBe('2026-10-12')
    expect(r.json.watchWindow).toMatchObject({ since: '2026-10-12', lastWatch: '2026-10-12', floor: '2026-09-29' })
    run(wt, ['finish', '--status', 'rien', '--no-cleanup'], env)
    // Une veille d'il y a deux mois : la fenêtre s'arrête à 21 jours
    const env2 = envFor(repo.M)
    writeJ(join(env2.ISOLOIR_VEILLE_LOCAL, 'runs', '2026-08-20-quotidien', 'run.json'), { format: 'isoloir-veille-run/1', runId: '2026-08-20-quotidien', kind: 'quotidien', worktree: '/x', branch: null, baseCommit: repo.head, startedAt: '2026-08-20T07:00:00+02:00', today: '2026-08-20', status: 'rien' })
    writeJ(join(env2.ISOLOIR_VEILLE_LOCAL, 'runs', '2026-08-20-quotidien', 'watch.json'), { format: 'isoloir-veille-watch/1' })
    writeJ(join(env2.ISOLOIR_VEILLE_LOCAL, 'runs', '2026-08-20-quotidien', 'classify.json'), {})
    const far = run(wt, ['start', '--kind', 'quotidien', '--now', '2026-10-20T07:00:00+02:00'], env2)
    expect((far.json.workflowArgs as { watch: { since: string } }).watch.since).toBe('2026-09-29')
    run(wt, ['finish', '--status', 'rien', '--no-cleanup'], env2)
  }, 60000)

  it('retrait en attente : le candidat sort des cibles ; préparation sous le verrou du quotidien (--parent)', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    expect(run(quotidien, ['start', '--kind', 'quotidien', '--now', '2026-10-20T07:00:00+02:00'], env).code).toBe(0)
    const added = run(quotidien, ['pending', 'add', '--json', JSON.stringify({ id: 'R-lalanne', summary: 'Retrait de Francis Lalanne, confirmé par deux sources.' }), '--now', '2026-10-20T07:10:00+02:00'], env)
    expect(added.json).toMatchObject({ code: 0, added: true, item: { runId: '2026-10-19-quotidien', approveWith: 'OK R-lalanne', kind: 'retrait', baseCommit: repo.head } })
    expect(run(quotidien, ['pending', 'add', '--json', '{ abîmé'], env).code).toBe(2)
    const prep = repo.worktree('veille-2026-10-20-candidat-dupont', 'veille/candidat-dupont')
    const child = run(prep, ['start', '--kind', 'candidat', '--parent', '2026-10-19-quotidien', '--subject', 'dupont', '--now', '2026-10-20T07:20:00+02:00'], env)
    expect(child.code, child.stderr).toBe(0)
    expect(child.json.lock).toMatchObject({ joined: true })
    expect(readJ(join(L, 'lock.json')).worktrees.map((w: { runId: string }) => w.runId)).toEqual(['2026-10-19-quotidien', '2026-10-20-candidat-dupont'])
    expect(run(prep, ['finish', '--status', 'attente', '--no-cleanup'], env).json).toMatchObject({ lockReleased: 'ligne' })
    expect(readJ(join(L, 'lock.json')).worktrees).toHaveLength(1)
    expect(run(quotidien, ['finish', '--status', 'attente', '--no-cleanup'], env).json).toMatchObject({ lockReleased: 'tout' })
    const wt = repo.worktree('veille-2026-11-02-hebdo', 'veille/2026-11-02-hebdo')
    const r = run(wt, ['start', '--kind', 'hebdo', '--now', '2026-11-02T06:00:00+01:00'], env)
    expect(r.code, r.stderr).toBe(0)
    expect((r.json.targets as { id: string }[]).map(t => t.id)).not.toContain('lalanne')
    expect((r.json.pending as { id: string }[]).map(p => p.id)).toEqual(['R-lalanne'])
    expect((r.json.workflowArgs as { watch: { pending: unknown[] } }).watch.pending).toEqual([{ id: 'R-lalanne', kind: 'retrait', summary: 'Retrait de Francis Lalanne, confirmé par deux sources.' }])
    // Attentes : liste, décision, rappel
    expect(run(wt, ['pending', 'list', '--status', 'attente'], env).json.items).toHaveLength(1)
    expect(run(wt, ['pending', 'remind', '--now', '2026-11-02T07:00:00+01:00'], env).json.due).toHaveLength(1)
    expect(run(wt, ['pending', 'resolve', 'R-lalanne', '--status', 'refusé', '--note', 'pas encore', '--now', '2026-11-02T08:00:00+01:00'], env).json).toMatchObject({ item: { status: 'refusé', note: 'pas encore' } })
    expect(run(wt, ['pending', 'resolve', 'R-absent', '--status', 'accordé'], env).code).toBe(2)
    run(wt, ['finish', '--status', 'rien', '--no-cleanup'], env)
  }, 60000)

  it('report : rapport local complet ; copie versionnée sans nom masqué ; --final : copie locale seulement', () => {
    const env = envFor(repo.M)
    const L = env.ISOLOIR_VEILLE_LOCAL
    const wt = repo.worktree('veille-2026-11-09-hebdo', 'veille/2026-11-09-hebdo')
    expect(run(wt, ['start', '--kind', 'hebdo', '--now', '2026-11-09T06:00:00+01:00'], env).code).toBe(0)
    const dir = join(L, 'runs', '2026-11-09-hebdo')
    writeJ(join(dir, 'classify.json'), { script: 'classify', code: 0, ok: true, qualifying: [], deferred: [], withdrawals: [], redeclarations: [{ ref: 'e1', candidateId: 'royal' }], conditions: [], official: [], watch: [], unchanged: [], stillDeclaredFalse: [] })
    const r = run(wt, ['report', '--now', '2026-11-09T09:00:00+01:00'], env)
    expect(r.code, r.stderr).toBe(0)
    const local = readFileSync(join(dir, 'rapport.md'), 'utf8')
    const versioned = readFileSync(join(wt, D, 'veille', 'rapports', '2026-11-09-hebdo.md'), 'utf8')
    expect(local).toContain('Ségolène Royal')
    expect(versioned).not.toMatch(/Ségolène|Royal/)
    expect(versioned).toContain('## Candidats')
    rmSync(join(wt, D, 'veille', 'rapports'), { recursive: true })
    expect(run(wt, ['report', '--final'], env).json.files).toHaveLength(1)
    expect(existsSync(join(wt, D, 'veille', 'rapports'))).toBe(false)
    expect(run(wt, ['status'], env).json).toMatchObject({ code: 0, runId: '2026-11-09-hebdo', stop: false, lock: { runId: '2026-11-09-hebdo', here: true, stale: null } })
    expect(run(wt, ['nimporte'], env).code).toBe(2)
    run(wt, ['finish', '--status', 'ok', '--no-cleanup'], env)
  }, 60000)
})

// ——— Production ———

describe('contrôle de la production (prod-check)', () => {
  const html = (asset: string) => `<!doctype html><html><head><script type="module" crossorigin src="./assets/${asset}"></script><link rel="modulepreload" href="./assets/preact-x.js"></head></html>`
  const lastShip = { sha: 'abcdef1234567', tree: 'abcdef1', dataVersion: '2026-10-19.1', indexAsset: 'assets/index-Ab_12.js', at: '2026-10-19T12:00:00+02:00', runId: '2026-10-19-hebdo', deployed: true, checked: true }

  it('l’asset index-*.js se lit dans la page', () => {
    expect(indexAssetOf(html('index-Ab_12.js'))).toBe('assets/index-Ab_12.js')
    expect(indexAssetOf('<script src="/assets/index-Z9.js" type="module"></script>')).toBe('assets/index-Z9.js')
    expect(indexAssetOf('<p>rien</p>')).toBeNull()
  })

  it('sans last-ship.json : rien à comparer, aucune lecture ; sinon jusqu’à 3 essais, puis 41', async () => {
    let calls = 0
    const fetchText = async () => {
      calls++
      return ''
    }
    expect(await prodCheck({ lastShip: null, fetchText, prodUrl: 'https://isoloir.vercel.app/' })).toMatchObject({ code: 0, known: false })
    expect(calls).toBe(0)
    const urls: string[] = []
    const answers = [html('index-old.js'), html('index-Ab_12.js')]
    const fetchLater = async (u: string) => {
      urls.push(u)
      return answers.shift() ?? ''
    }
    const later = await prodCheck({ lastShip, prodUrl: 'https://isoloir.vercel.app/', now: at('2026-10-19T12:00:00+02:00'), attempts: 3, fetchText: fetchLater })
    expect(later).toMatchObject({ code: 0, attempts: 2, served: 'assets/index-Ab_12.js' })
    expect(urls[0]).toBe(`https://isoloir.vercel.app/?v=${at('2026-10-19T12:00:00+02:00').getTime()}`)
    const wrong = await prodCheck({ lastShip, prodUrl: 'https://isoloir.vercel.app/', attempts: 3, fetchText: async () => html('index-old.js') })
    expect(wrong).toMatchObject({ code: 41, attempts: 3, served: 'assets/index-old.js' })
    expect(wrong.reason).toContain('abcdef1')
    const down = await prodCheck({ lastShip, prodUrl: 'https://isoloir.vercel.app/', attempts: 2, fetchText: async () => { throw new Error('ECONNRESET') } })
    expect(down).toMatchObject({ code: 41, served: null })
    expect(down.reason).toContain('lecture impossible')
    const undeployed = await prodCheck({ lastShip: { ...lastShip, deployed: false }, prodUrl: 'https://isoloir.vercel.app/', attempts: 1, fetchText: async () => html('index-old.js') })
    expect(undeployed.reason).toContain('--deploy-only')
  })

  it('publication hors veille : main a avancé depuis le dernier envoi (déployé, contrôlé) : 0 et une note ; sinon 41', async () => {
    const prodUrl = 'https://isoloir.vercel.app/'
    const other = async () => html('index-autre.js')
    const ahead = { head: 'f'.repeat(40), isAncestor: (sha: string) => sha === lastShip.sha }
    const ok = await prodCheck({ lastShip, prodUrl, attempts: 1, fetchText: other, mainInfo: ahead })
    expect(ok).toMatchObject({ code: 0, outside: true, served: 'assets/index-autre.js', expected: 'assets/index-Ab_12.js' })
    expect(ok.note).toMatch(/publication hors veille.*index-autre/)
    const still = await prodCheck({ lastShip, prodUrl, attempts: 1, fetchText: other, mainInfo: { head: lastShip.sha, isAncestor: () => true } })
    expect(still.code).toBe(41)
    expect(still.reason).toMatch(/sans fusion dans main/)
    for (const mainInfo of [{ head: 'f'.repeat(40), isAncestor: () => false }, { head: 'f'.repeat(40), isAncestor: () => null }, null]) {
      expect((await prodCheck({ lastShip, prodUrl, attempts: 1, fetchText: other, mainInfo })).code).toBe(41)
    }
    expect((await prodCheck({ lastShip: { ...lastShip, deployed: false }, prodUrl, attempts: 1, fetchText: other, mainInfo: ahead })).code).toBe(41)
    expect((await prodCheck({ lastShip: { ...lastShip, checked: false }, prodUrl, attempts: 1, fetchText: other, mainInfo: ahead })).code).toBe(41)
    expect((await prodCheck({ lastShip, prodUrl, attempts: 1, fetchText: async () => { throw new Error('ECONNRESET') }, mainInfo: ahead })).code).toBe(41)
  })

  it('prod-check.mjs : page simulée (aucun réseau)', () => {
    const root = tmp('prod')
    const L = tmp('local')
    const page = join(root, 'index.html')
    writeFileSync(page, html('index-Ab_12.js'))
    expect(cli('prod-check.mjs', ['--root', root], { ISOLOIR_VEILLE_LOCAL: L, ISOLOIR_VEILLE_PROD_HTML: page }).json).toMatchObject({ code: 0, known: false })
    writeJ(join(L, 'last-ship.json'), lastShip)
    expect(cli('prod-check.mjs', ['--root', root], { ISOLOIR_VEILLE_LOCAL: L, ISOLOIR_VEILLE_PROD_HTML: page }).json).toMatchObject({ code: 0, known: true, served: 'assets/index-Ab_12.js' })
    writeFileSync(page, html('index-autre.js'))
    const r = cli('prod-check.mjs', ['--root', root, '--attempts', '2'], { ISOLOIR_VEILLE_LOCAL: L, ISOLOIR_VEILLE_PROD_HTML: page })
    expect(r.code).toBe(41)
    expect(r.json).toMatchObject({ expected: 'assets/index-Ab_12.js', served: 'assets/index-autre.js', attempts: 2 })
    expect(cli('prod-check.mjs', ['--root', root, '--attempts', '0'], { ISOLOIR_VEILLE_LOCAL: L, ISOLOIR_VEILLE_PROD_HTML: page }).code).toBe(2)
  }, 30000)
})

// ——— Nettoyage ———

describe('nettoyage des worktrees (cleanup)', () => {
  it('plan : seuls les veille-<runId> anciens et libres ; jamais veille-auto, accord-*, ni ceux des autres sessions', () => {
    const M = tmp('plan')
    const W = (name: string, branch: string | null = null, extra: Partial<ReturnType<typeof parseWorktreeList>[number]> = {}) => ({ path: join(M, '.claude', 'worktrees', name), head: 'x', branch, detached: !branch, locked: false, prunable: false, bare: false, ...extra })
    const worktrees = [
      { path: M, head: 'x', branch: 'main', detached: false, locked: false, prunable: false, bare: false },
      W('veille-auto', 'veille-auto'),
      W('accord-c-dupont-2026-09-01', 'accord/c-dupont-2026-09-01'),
      W('differenciation', 'revision-nouvelles'),
      W('veille-2026-09-01-quotidien'),
      W('veille-2026-09-07-hebdo', 'veille/2026-09-07-hebdo'),
      W('veille-2026-09-08-candidat-dupont', 'veille/candidat-dupont'),
      W('veille-2026-09-09-quotidien'),
      W('veille-2026-09-10-quotidien'),
      W('veille-2026-09-11-quotidien', null, { locked: true }),
      W('veille-2026-10-10-quotidien'),
      W('veille-2026-09-12-hebdo', 'main-bis'),
      W('veille-2026-10-19-hebdo', 'veille/2026-10-19-hebdo'),
      { path: join(tmp('ailleurs'), 'veille-2026-09-01-hebdo'), head: 'x', branch: null, detached: true, locked: false, prunable: false, bare: false },
    ]
    const plan = planCleanup({
      worktrees,
      mainRoot: M,
      current: join(M, '.claude', 'worktrees', 'veille-2026-10-19-hebdo'),
      lock: { runId: 'x', kind: 'hebdo', worktrees: [{ path: join(M, '.claude', 'worktrees', 'veille-2026-09-10-quotidien'), runId: '2026-09-10-quotidien' }], startedAt: null, heartbeatAt: null, phase: '' },
      pending: [{ id: 'C-dupont', status: 'attente', branch: 'veille/candidat-dupont', runId: '2026-09-08-candidat-dupont' }],
      runs: [{ status: 'échec', worktree: join(M, '.claude', 'worktrees', 'veille-2026-09-09-quotidien'), startedAt: '2026-09-09T07:00:00+02:00' }],
      today: '2026-10-19',
      days: 14,
    })
    expect(plan.remove.map(r => r.runId)).toEqual(['2026-09-01-quotidien', '2026-09-07-hebdo'])
    const kept = Object.fromEntries(plan.keep.map(k => [k.runId, k.reason]))
    expect(kept).toMatchObject({
      auto: expect.stringContaining('motif'),
      '2026-09-08-candidat-dupont': 'cité par l\'attente C-dupont',
      '2026-09-09-quotidien': 'parmi les 3 dernières exécutions en échec',
      '2026-09-10-quotidien': 'tenu par le verrou',
      '2026-09-11-quotidien': 'worktree verrouillé par git',
      '2026-10-10-quotidien': expect.stringContaining('récent'),
      '2026-09-12-hebdo': expect.stringContaining('hors de veille/*'),
      '2026-10-19-hebdo': 'worktree courant',
    })
    const all = [...plan.remove.map(r => r.path), ...plan.keep.map(k => k.path)]
    for (const name of ['accord-c-dupont-2026-09-01', 'differenciation']) expect(all.some(p => p.endsWith(name))).toBe(false)
    expect(all.some(p => p.includes('ailleurs'))).toBe(false)
  })

  it('cleanup.mjs : un worktree quotidien qui ne garde que la trace de son exécution est retiré (--force) ; un autre fichier le garde', () => {
    const repo = makeRepo()
    const current = repo.worktree('veille-2026-10-19-hebdo', 'veille/2026-10-19-hebdo')
    const daily = repo.worktree('veille-2026-09-05-quotidien')
    writeJ(join(daily, D, 'veille', 'runs', '2026-09-05-quotidien', 'watch.json'), { format: 'isoloir-veille-watch/1' })
    mkdirSync(join(daily, D, 'veille', 'rapports'), { recursive: true })
    writeFileSync(join(daily, D, 'veille', 'rapports', '2026-09-05-quotidien.md'), '# Rapport\n')
    const mixed = repo.worktree('veille-2026-09-06-quotidien')
    writeJ(join(mixed, D, 'veille', 'runs', '2026-09-06-quotidien', 'watch.json'), {})
    writeFileSync(join(mixed, D, 'config.json'), '{}\n')
    const r = cli('cleanup.mjs', ['--root', current, '--now', '2026-10-19T09:00:00+02:00'], envFor(repo.M))
    expect(r.code, r.stderr).toBe(0)
    expect(existsSync(daily)).toBe(false)
    expect((r.json.removed as { path: string; forced?: boolean }[]).find(x => x.path === realpathSync(join(repo.M, '.claude', 'worktrees')) + '/veille-2026-09-05-quotidien')).toMatchObject({ forced: true })
    expect(existsSync(join(mixed, D, 'config.json'))).toBe(true)
    expect((r.json.failed as { path: string }[]).map(f => f.path)).toEqual([realpathSync(mixed)])
  }, 60000)

  it('git worktree list --porcelain se lit', () => {
    const text = 'worktree /a\nHEAD 1\nbranch refs/heads/main\n\nworktree /a/.claude/worktrees/veille-x\nHEAD 2\ndetached\nlocked raison\n\n'
    expect(parseWorktreeList(text)).toEqual([
      { path: '/a', head: '1', branch: 'main', detached: false, locked: false, prunable: false, bare: false },
      { path: '/a/.claude/worktrees/veille-x', head: '2', branch: null, detached: true, locked: true, prunable: false, bare: false },
    ])
  })

  it('cleanup.mjs : retire l’ancien worktree, garde les autres, efface la seule branche veille/* déjà dans origin/main', () => {
    const repo = makeRepo()
    const current = repo.worktree('veille-2026-10-19-hebdo', 'veille/2026-10-19-hebdo')
    const old = repo.worktree('veille-2026-09-01-quotidien')
    const recent = repo.worktree('veille-2026-10-18-quotidien')
    const accord = repo.worktree('accord-c-dupont-2026-09-01', 'accord/c-dupont-2026-09-01')
    const otherSession = repo.worktree('differenciation', 'revision-nouvelles')
    const dirty = repo.worktree('veille-2026-09-02-quotidien')
    writeFileSync(join(dirty, 'brouillon.txt'), 'non validé')
    sh(repo.M, 'branch', 'veille/2026-09-03-hebdo', 'origin/main')
    sh(repo.M, 'branch', 'veille/2026-09-04-hebdo', 'origin/main')
    sh(otherSession, 'checkout', '-q', 'veille/2026-09-04-hebdo')
    sh(otherSession, 'commit', '-q', '--allow-empty', '-m', 'travail propre')
    sh(otherSession, 'checkout', '-q', 'revision-nouvelles')
    const env = envFor(repo.M)
    const dry = cli('cleanup.mjs', ['--root', current, '--now', '2026-10-19T09:00:00+02:00', '--dry-run'], env)
    expect(dry.code, dry.stderr).toBe(0)
    expect((dry.json.removed as { path: string }[]).map(r => r.path).sort()).toEqual([realpathSync(old), realpathSync(dirty)].sort())
    expect(existsSync(old)).toBe(true)
    const r = cli('cleanup.mjs', ['--root', current, '--now', '2026-10-19T09:00:00+02:00'], env)
    expect(r.code, r.stderr).toBe(0)
    expect(existsSync(old)).toBe(false)
    // Un worktree aux changements non validés n'est jamais retiré de force
    expect(existsSync(join(dirty, 'brouillon.txt'))).toBe(true)
    expect((r.json.failed as { path: string }[]).map(f => f.path)).toEqual([realpathSync(dirty)])
    for (const p of [current, recent, accord, otherSession]) expect(existsSync(p), p).toBe(true)
    expect(r.json.branchesDeleted).toEqual([{ branch: 'veille/2026-09-03-hebdo' }])
    const kept = Object.fromEntries((r.json.branchesKept as { branch: string; reason: string }[]).map(b => [b.branch, b.reason]))
    expect(kept['veille/2026-09-04-hebdo']).toContain('pas ancêtre')
    expect(kept['veille/2026-10-19-hebdo']).toContain('extraite')
    // Hors d'un worktree d'exécution : 2
    expect(cli('cleanup.mjs', ['--root', otherSession], env).code).toBe(2)
    // L'âge est celui de la date du runId, pas celui du dossier : un dossier récent mais vieilli reste
    utimesSync(recent, new Date('2026-01-01'), new Date('2026-01-01'))
    const again = cli('cleanup.mjs', ['--root', current, '--now', '2026-10-19T09:00:00+02:00', '--dry-run'], env)
    expect((again.json.removed as { path: string }[]).map(x => x.path)).toEqual([realpathSync(dirty)])
  }, 60000)
})
