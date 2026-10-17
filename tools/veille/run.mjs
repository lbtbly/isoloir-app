// Départ, battement, budget, fin, attentes et rapport d'une exécution de la veille automatique (contrat :
// tools/veille/CONTRACT.md §a.2, §c.9, §c.10, §d.3, annexe A4). La session planifiée le lance par son chemin absolu,
// depuis le worktree de l'exécution (<dépôt principal>/.claude/worktrees/veille-<runId>) ; l'état local (verrou,
// dépense, attentes, traces) est dans <dépôt principal>/.claude/veille/, jamais versionné.
//
// Usage :
//   node <WT>/tools/veille/run.mjs start --kind quotidien|hebdo|candidat|retrait|accord [--parent <runId>]
//        [--subject <slug|id>] [--essai] [--estimate N] [--usage '<json de get_usage>'] [--now ISO]
//   node <WT>/tools/veille/run.mjs heartbeat [--phase <texte>]
//   node <WT>/tools/veille/run.mjs budget [--tokens N --stage <nom>] [--estimate N] [--usage '<json>'] [--kind …]
//   node <WT>/tools/veille/run.mjs finish --status ok|rien|partiel|gel|budget|échec|attente [--note <texte>] [--no-cleanup]
//   node <WT>/tools/veille/run.mjs status
//   node <WT>/tools/veille/run.mjs abort [--reason <texte>]
//   node <WT>/tools/veille/run.mjs pending add --json '<PENDING_ITEM>' | resolve <id> --status accordé|refusé|caduc
//        [--note <texte>] | list [--status attente] | remind [--dry-run]
//   node <WT>/tools/veille/run.mjs report [--final]
// Options communes : --root <abs> (tests), --now <ISO avec fuseau>.
//
// start vérifie, dans cet ordre : worktree d'exécution nommé veille-<runId> (ou accord-…) dont le runId va avec --kind,
// sur une branche du même préfixe ; pour un accord, l'attente qu'il nomme (accord-<id>-<date>) au statut « accordé »
// dans pending.json (2) ; STOP, PAUSE ou policy.paused (20) ; fin de la veille (13) ; porte horaire de l'étape start,
// horizon de 8 h pour hebdo, gel souple permis au seul quotidien (11, 12) ; une heure simulée (--now,
// ISOLOIR_VEILLE_NOW) ne fait que resserrer la porte : hors dépôt d'essai, la porte est aussi passée à l'horloge ;
// verrou (21 ; périmé : repris, noté) ; budget avec l'estimation de départ du kind (22). La politique se lit à
// origin/main (lib/state.mjs, loadPolicy).
// Fenêtre de la veille des candidats (workflowArgs.watch.since) : la plus ancienne de today − watchLookbackDays et du
// jour de la dernière veille menée au bout (runs/<id>/watch.json et classify.json, exécution ni en échec ni
// interrompue), bornée par today − watchMaxLookbackDays (21) : un jour sans exécution (application fermée, budget,
// gel, verrou) se rattrape au passage suivant. Puis il écrit lock.json, runs/<runId>/run.json (baseCommit = origin/main) et la ligne
// « /.claude/veille/ » de .git/info/exclude, et imprime ce que la session passe aux workflows 8 et 9 (workflowArgs).
// heartbeat et budget sortent aussi en 20 sur STOP ou PAUSE : la session s'arrête à l'étape suivante.
// Estimations de départ (jetons) : quotidien 400 000, hebdo 1 000 000, candidat 2 500 000, retrait 500 000,
// accord 200 000 (policy.budgets.startEstimates les remplace ; --estimate aussi).
// --usage : la sortie de l'outil get_usage telle quelle, ou { weeklyPercent, fiveHourPercent, monthlyPercent }
// (champs lus : lib/budget.mjs, parseUsage).
//
// Sortie : une ligne JSON par appel ({ script: 'run', command, code, ok, runId, … }), rangée dans
// <état local>/runs/<runId>/run-<commande>.json. Codes : 0, 2, 11, 12, 13, 20, 21, 22, 31 (CONTRACT §b).
// Il faut Node 22.18+ (TypeScript sans compilation).

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RUN_ID, SCHEMAS, validate } from './schemas.mjs'
import {
  EXIT, VeilleError, addDays, appendJsonl, assertNotMainFolder, assertRunWorktree, currentBranch, currentRunId, exit, fail, git,
  gitOut, isTestOrigin, isoInParis, parseArgs, parseNow, paths, readJson, readJsonl, rootFrom, runIdOfWorktree, runMain, runNode,
  splitCandidates, todayInParis, writeJson, writeText,
} from './lib/common.mjs'
import { accordItemErrors, worktreeBranchError } from './lib/git.mjs'
import { checkBudget, parseUsage, prepStartedOn, readSpend, spendLine, spentTotals, limitsFor, startEstimate } from './lib/budget.mjs'
import { acquireLock, heartbeatLock, inspectLock, readLock, releaseLock } from './lib/lock.mjs'
import {
  addPending, listPending, loadPolicy, loadState, mergeWatchEntries, redactHidden, remindPending, renderReport, resolvePending, rotationFor,
} from './lib/state.mjs'
import { gateTime, loadElectionFreezeSpans, startHorizon } from './lib/time.mjs'

const KINDS = ['quotidien', 'hebdo', 'candidat', 'retrait', 'accord']
const FINISH = ['ok', 'rien', 'partiel', 'gel', 'budget', 'échec', 'attente']
const RUN_ID_RE = new RegExp(RUN_ID)
const EXCLUDE_LINE = '/.claude/veille/'
const COMMON = { root: { type: 'string' }, now: { type: 'string' } }

const argv = process.argv.slice(2)
const command = argv[0] ?? ''
let ctxRoot
let ctxRunId = null

/** Sortie normalisée, rangée sous run-<commande>.json (jamais run.json, qui est le RUN de l'exécution) */
const out = (code, payload = {}) =>
  exit(code, { command, ...(ctxRunId && payload.runId === undefined ? { runId: ctxRunId } : {}), ...payload }, { tag: command || 'usage', root: ctxRoot })

/** Le kind qu'annonce un runId : « 2026-10-19-hebdo » → hebdo ; « accord-… » → accord */
const kindOfRunId = id => (String(id).startsWith('accord-') ? 'accord' : /^\d{4}-\d{2}-\d{2}-(quotidien|hebdo|candidat|retrait)(-|$)/.exec(id)?.[1] ?? null)

/** L'exécution de ce worktree : celle du verrou, sinon celle que dit son nom (veille-<runId>) */
function runIdHere(root) {
  const fromLock = currentRunId(root)
  if (fromLock) return fromLock
  const top = git(['rev-parse', '--show-toplevel'], { cwd: root })
  const id = runIdOfWorktree(top.code === 0 ? top.stdout.trim() : root)
  return RUN_ID_RE.test(id) ? id : null
}

function localOf(root) {
  const L = paths(root).local
  if (!L) fail(EXIT.USAGE, `état local introuvable depuis ${root} (ISOLOIR_VEILLE_LOCAL pour un essai)`)
  return L
}

/** STOP, PAUSE ou policy.paused : VeilleError 20 */
function assertNotPaused(L, policy) {
  if (existsSync(L.stop)) fail(EXIT.PAUSED, `STOP présent (${L.stop}) : la veille est arrêtée par le propriétaire`)
  if (existsSync(L.pause)) {
    const why = readFileSync(L.pause, 'utf8').trim()
    fail(EXIT.PAUSED, `PAUSE présent (${L.pause})${why ? ` : ${why.slice(0, 400)}` : ''} ; à effacer par le propriétaire`)
  }
  if (policy.paused) fail(EXIT.PAUSED, `policy.paused${policy.pausedReason ? ` : ${policy.pausedReason}` : ''}`)
}

const runFile = (L, runId) => join(L.run(runId), 'run.json')

/** Toutes les exécutions connues localement (runs/<id>/run.json), illisibles écartées */
function allRuns(L) {
  if (!existsSync(L.runs)) return []
  const runs = []
  for (const id of readdirSync(L.runs)) {
    const f = runFile(L, id)
    if (!existsSync(f)) continue
    try {
      runs.push(readJson(f))
    } catch {
      // une trace abîmée ne bloque pas le départ
    }
  }
  return runs
}

/** Ajoute « /.claude/veille/ » à <dossier git commun>/info/exclude, une seule fois ; rend le fichier, ou null hors de git */
function ensureExcluded(root) {
  let common = null
  const env = process.env.ISOLOIR_VEILLE_MAIN_ROOT
  if (env && existsSync(join(env, '.git')) && statSync(join(env, '.git')).isDirectory()) common = join(env, '.git')
  if (!common) {
    const r = git(['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: root })
    if (r.code !== 0) return null
    common = r.stdout.trim()
  }
  const file = join(common, 'info', 'exclude')
  const text = existsSync(file) ? readFileSync(file, 'utf8') : ''
  if (text.split('\n').some(l => l.trim() === EXCLUDE_LINE)) return file
  writeText(file, `${text}${text && !text.endsWith('\n') ? '\n' : ''}${EXCLUDE_LINE}\n`)
  return file
}

function usageOf(text) {
  if (text == null) return null
  try {
    return parseUsage(text)
  } catch (e) {
    fail(EXIT.USAGE, `--usage : JSON illisible (${e.message})`)
  }
}

// ——— start ———

async function start(args) {
  const o = parseArgs(args, {
    ...COMMON,
    kind: { type: 'string', required: true, choices: KINDS },
    parent: { type: 'string' },
    subject: { type: 'string' },
    essai: { type: 'boolean' },
    estimate: { type: 'number' },
    usage: { type: 'string' },
  })
  const root = rootFrom(o)
  ctxRoot = root
  const name = assertRunWorktree(root)
  const runId = runIdOfWorktree(name)
  ctxRunId = RUN_ID_RE.test(runId) ? runId : null
  if (!ctxRunId) fail(EXIT.USAGE, `${name} : le runId « ${runId} » ne suit pas le motif des exécutions (AAAA-MM-JJ-<kind>…, accord-…)`)
  if (kindOfRunId(runId) !== o.kind) fail(EXIT.USAGE, `--kind ${o.kind}, mais le worktree ${name} annonce ${kindOfRunId(runId) ?? 'autre chose'}`)
  if (o.parent && !RUN_ID_RE.test(o.parent)) fail(EXIT.USAGE, `--parent : « ${o.parent} » n'est pas un runId`)
  const wtBranchError = worktreeBranchError(name, currentBranch(root))
  if (wtBranchError) fail(EXIT.USAGE, wtBranchError)
  const L = localOf(root)
  const P = paths(root)
  if (o.kind === 'accord') {
    const errors = accordItemErrors(runId, listPending(L.dir))
    if (errors.length) fail(EXIT.USAGE, `accord : ${errors.join(' ; ')}`)
  }
  const policy = loadPolicy(root)
  const now = parseNow(o.now)
  const simulated = !!(o.now || process.env.ISOLOIR_VEILLE_NOW)
  const today = todayInParis(now)
  const kind = o.kind

  // 2. STOP, PAUSE, policy.paused
  assertNotPaused(L, policy)
  // 3-4. fin de la veille, gel, gel souple ; une heure simulée ne peut que resserrer la porte (hors dépôt d'essai)
  const { election, spans } = await loadElectionFreezeSpans(root)
  let gate = gateTime({ step: 'start', now, hours: startHorizon(kind, policy), kind, electionSpans: spans, policy })
  if (gate.code === EXIT.OK && simulated && !isTestOrigin(root)) {
    const real = gateTime({ step: 'start', now: new Date(), hours: startHorizon(kind, policy), kind, electionSpans: spans, policy })
    if (real.code !== EXIT.OK) gate = { ...real, reason: `${real.reason} (porte passée aussi à l’horloge : une heure simulée ne fait que la resserrer)` }
  }
  if (gate.code !== EXIT.OK) {
    process.stderr.write(`${gate.reason}\n`)
    out(gate.code, { runId, kind, reason: gate.reason, gate })
  }
  // 5. verrou (vérifié avant le budget ; pris seulement quand tout est prêt)
  const insp = inspectLock(L.lock, { now, policy, worktree: root })
  if (!o.parent && insp.lock && !insp.stale && !(insp.primary && insp.lock.runId === runId)) {
    fail(EXIT.LOCKED, `verrou tenu par ${insp.lock.runId} (${insp.lock.kind}, phase « ${insp.lock.phase} », battement ${insp.lock.heartbeatAt})`, { holder: insp.lock.runId })
  }
  // 6. budget
  const { lines } = readSpend(L.spend)
  const usage = usageOf(o.usage)
  const budget = checkBudget({ lines, today, kind, estimate: o.estimate ?? startEstimate(kind, policy), usage, policy })
  if (budget.code !== EXIT.OK) fail(EXIT.BUDGET, budget.reason, { budget })

  // Tout ce qui peut échouer se lit avant de prendre le verrou
  const baseCommit = gitOut(['rev-parse', 'origin/main'], { cwd: root })
  const branch = currentBranch(root)
  const config = readJson(P.config)
  const state = loadState(root)
  const bank = kind === 'hebdo' ? readJson(P.bank) : null
  const split = splitCandidates(config, election)
  const pendingAll = listPending(L.dir)
  const pending = pendingAll.filter(p => p.status === 'attente')
  const localWatch = readJson(L.watch, { entries: [] })?.entries ?? []

  const acq = acquireLock(L.lock, { runId, kind, worktree: root, now, policy, parent: o.parent ?? null, phase: 'départ' })
  if (acq.takenOverFrom) process.stderr.write(`verrou repris de ${acq.takenOverFrom} : ${acq.staleReason}\n`)
  const exclude = ensureExcluded(root)

  // Exécution interrompue du même kind (en cours sans verrou, ou marquée interrompue)
  let interrupted = null
  for (const r of allRuns(L).filter(r => r.kind === kind && r.runId !== runId && ['en-cours', 'interrompu'].includes(r.status)).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))) {
    if (r.status === 'en-cours') {
      r.status = 'interrompu'
      r.note = [r.note, `interrompue : ${runId} a pris le verrou le ${isoInParis(now)}`].filter(Boolean).join(' ; ')
      writeJson(runFile(L, r.runId), r)
    }
    interrupted ??= r
  }

  // Cibles du relevé hebdomadaire : les présentés, moins les retraits en attente ; classés seulement en budget souple
  const pendingWithdrawals = new Set(pending.filter(p => p.kind === 'retrait').map(p => p.id.slice(2)))
  const excluded = new Set(election?.ranking?.excluded?.ids ?? [])
  let targetIds = kind === 'hebdo' ? split.visibleIds.filter(id => !pendingWithdrawals.has(id)) : []
  if (budget.softMonthly) targetIds = targetIds.filter(id => !excluded.has(id))
  const overlap = policy.rotation?.overlapDays ?? 3
  const targets = targetIds.map(id => {
    const checked = state.candidates?.[id]?.checkedAt ?? config.contextDate ?? today
    const since = [addDays(checked, -overlap), today].sort()[0]
    return { id, since, rotation: rotationFor(state, bank, id, policy).questions }
  })
  const watch = mergeWatchEntries(state.watch ?? [], localWatch)
  const expected = (state.expected ?? []).filter(e => e.status === 'attendu')
  const essai = !!o.essai
  const mode = ['hebdo', 'accord'].includes(kind) && !essai && gate.mode === 'publication' ? 'publication' : 'rapport'

  const previous = readJson(runFile(L, runId), null)
  const run = {
    format: 'isoloir-veille-run/1',
    runId,
    kind,
    parent: o.parent ?? null,
    essai,
    mode,
    worktree: root,
    branch,
    baseCommit,
    startedAt: previous?.startedAt ?? isoInParis(now),
    ...(previous ? { restartedAt: isoInParis(now) } : {}),
    finishedAt: null,
    today,
    status: 'en-cours',
    ...(o.subject ? { subject: o.subject } : {}),
    since: Object.fromEntries(targets.map(t => [t.id, t.since])),
    workflows: previous?.workflows ?? [],
    ...(acq.takenOverFrom ? { takenOverFrom: acq.takenOverFrom } : {}),
  }
  const errors = validate(SCHEMAS.RUN, run)
  if (errors.length) fail(EXIT.CODE, `run.json non conforme : ${errors.slice(0, 5).join(' ; ')}`)
  writeJson(runFile(L, runId), run)

  // Fenêtre de la veille des candidats : depuis la dernière veille menée au bout, si elle est plus ancienne que le recouvrement
  const lookback = policy.rotation?.watchLookbackDays ?? 3
  const floor = addDays(today, -(policy.rotation?.watchMaxLookbackDays ?? 21))
  const lastWatch = lastWatchDay(L, runId)
  const watchSince = [[addDays(today, -lookback), lastWatch ?? config.contextDate ?? today].sort()[0], floor].sort().at(-1)
  const watchArgs = {
    root,
    today,
    contextDate: today,
    since: [watchSince, today].sort()[0],
    visible: split.visible,
    hidden: split.hidden.map(({ id, name: n, party }) => ({ id, name: n, party })),
    watch: watch.map(w => ({ key: w.key, name: w.name, party: w.party ?? null, reason: w.reason, firstSeen: w.firstSeen })),
    pending: pending.map(p => ({ id: p.id, kind: p.kind, summary: p.summary })),
    expected: expected.map(e => ({ id: e.id, label: e.label, ...(e.from ? { from: e.from } : {}) })),
    minSearches: policy.minSearches?.watch ?? 10,
    mepCountsAsNational: policy.mepCountsAsNational,
    ...(Number.isInteger(policy.caps?.watchChecks) ? { maxChecks: policy.caps.watchChecks } : {}),
  }
  const refreshArgs = {
    root,
    today,
    contextDate: today,
    mode: 'candidates',
    targets,
    hiddenIds: split.hiddenIds,
    questions: [],
    packetSize: policy.caps?.verifyPacket ?? 60,
    maxProposals: policy.caps?.newApproachesPerRun ?? 2,
    minSearches: policy.minSearches?.triage ?? 8,
  }
  out(EXIT.OK, {
    runId,
    kind,
    essai,
    mode,
    today,
    now: isoInParis(now),
    worktree: root,
    branch,
    baseCommit,
    configPath: P.config,
    visible: split.visible,
    hidden: split.hidden,
    targets,
    watch,
    pending,
    expected,
    interrupted,
    lock: { takenOverFrom: acq.takenOverFrom, staleReason: acq.staleReason, reentered: acq.reentered, joined: acq.joined },
    gate: { mode: gate.mode, softFreeze: gate.softFreeze, nextFreeze: gate.nextFreeze, betweenRounds: gate.betweenRounds },
    budget: { spent: budget.spent, limits: budget.limits, estimate: budget.estimate, softMonthly: budget.softMonthly, advice: budget.advice, note: budget.note, usage: budget.usage },
    exclude,
    watchWindow: { since: watchArgs.since, lastWatch, floor, lookbackDays: lookback },
    workflowArgs: { watch: watchArgs, refresh: refreshArgs },
  })
}

/**
 * Le jour (today) de la dernière veille des candidats menée au bout par une autre exécution : runs/<id>/watch.json
 * (WATCH_RESULT sans erreur, rangé par persist.mjs) et classify.json présents, exécution quotidienne ou hebdomadaire ni
 * en échec ni interrompue ; null s'il n'y en a pas.
 */
function lastWatchDay(L, runId) {
  let best = null
  for (const r of allRuns(L)) {
    if (r.runId === runId || !['quotidien', 'hebdo'].includes(r.kind) || ['échec', 'interrompu'].includes(r.status) || !r.today) continue
    const dir = L.run(r.runId)
    let watch = null
    try {
      watch = readJson(join(dir, 'watch.json'), null)
    } catch {
      watch = null
    }
    if (!watch || watch.error || watch.format !== 'isoloir-veille-watch/1' || !existsSync(join(dir, 'classify.json'))) continue
    if (!best || r.today > best) best = r.today
  }
  return best
}

// ——— heartbeat, budget ———

async function heartbeat(args) {
  const o = parseArgs(args, { ...COMMON, phase: { type: 'string' } })
  const root = rootFrom(o)
  ctxRoot = root
  ctxRunId = runIdHere(root)
  const L = localOf(root)
  const policy = loadPolicy(root)
  const lock = heartbeatLock(L.lock, { worktree: root, now: parseNow(o.now), phase: o.phase })
  assertNotPaused(L, policy)
  out(EXIT.OK, { heartbeatAt: lock.heartbeatAt, phase: lock.phase, holder: lock.runId })
}

async function budget(args) {
  const o = parseArgs(args, {
    ...COMMON,
    tokens: { type: 'number' },
    stage: { type: 'string' },
    estimate: { type: 'number' },
    usage: { type: 'string' },
    kind: { type: 'string', choices: KINDS },
    'wf-run': { type: 'string' },
  })
  const root = rootFrom(o)
  ctxRoot = root
  const runId = runIdHere(root)
  ctxRunId = runId
  const L = localOf(root)
  const policy = loadPolicy(root)
  const now = parseNow(o.now)
  const today = todayInParis(now)
  const run = runId ? readJson(runFile(L, runId), null) : null
  const kind = o.kind ?? run?.kind ?? readLock(L.lock)?.kind ?? (runId ? kindOfRunId(runId) : null)
  const usage = usageOf(o.usage)
  let recorded = null
  if (o.tokens != null) {
    if (!o.stage) fail(EXIT.USAGE, '--tokens demande --stage')
    if (!runId || !kind) fail(EXIT.USAGE, 'aucune exécution en cours dans ce worktree : impossible de noter la dépense')
    if (o.tokens < 0) fail(EXIT.USAGE, '--tokens : nombre positif attendu')
    assertNotMainFolder(root)
    recorded = spendLine({ now, runId, kind, stage: o.stage, wfRunId: o['wf-run'] ?? null, tokens: o.tokens })
    const errors = validate(SCHEMAS.SPEND_LINE, recorded)
    if (errors.length) fail(EXIT.USAGE, `ligne de dépense non conforme : ${errors.join(' ; ')}`)
    appendJsonl(L.spend, recorded)
  }
  const { lines, skipped } = readSpend(L.spend)
  const b = checkBudget({ lines, today, kind, estimate: o.estimate ?? 0, usage, policy, stage: o.stage ?? null, recording: o.tokens != null })
  assertNotPaused(L, policy)
  const { code, reason, ...rest } = b
  if (reason) process.stderr.write(`${reason}\n`)
  out(code, { kind, recorded, skippedLines: skipped, ...rest, ...(reason ? { reason } : {}) })
}

// ——— finish, abort, status ———

function closeRun(L, runId, root, status, note, now) {
  const f = runFile(L, runId)
  const run = readJson(f, null)
  if (run) {
    run.status = status
    run.finishedAt = isoInParis(now)
    if (note) run.note = [run.note, note].filter(Boolean).join(' ; ')
    writeJson(f, run)
  }
  const rel = releaseLock(L.lock, { worktree: root })
  return { run, released: rel.released }
}

async function finish(args) {
  const o = parseArgs(args, { ...COMMON, status: { type: 'string', required: true, choices: FINISH }, note: { type: 'string' }, 'no-cleanup': { type: 'boolean' } })
  const root = rootFrom(o)
  ctxRoot = root
  const runId = runIdHere(root)
  ctxRunId = runId
  if (!runId) fail(EXIT.USAGE, 'aucune exécution reconnue dans ce worktree')
  assertNotMainFolder(root)
  const L = localOf(root)
  const now = parseNow(o.now)
  const { run, released } = closeRun(L, runId, root, o.status, o.note, now)
  let cleanup = null
  if (!o['no-cleanup']) {
    const script = join(dirname(fileURLToPath(import.meta.url)), 'cleanup.mjs')
    const r = runNode(script, ['--quiet', '--root', root, ...(o.now ? ['--now', o.now] : [])], { env: { ISOLOIR_VEILLE_NO_RECORD: '1' } })
    try {
      cleanup = JSON.parse(r.stdout.trim().split('\n').at(-1))
    } catch {
      cleanup = { code: r.code, reason: r.stderr.trim().slice(-400) }
    }
  }
  out(EXIT.OK, { runId, status: o.status, runFound: !!run, lockReleased: released, cleanup })
}

async function abort(args) {
  const o = parseArgs(args, { ...COMMON, reason: { type: 'string' } })
  const root = rootFrom(o)
  ctxRoot = root
  const runId = runIdHere(root)
  ctxRunId = runId
  if (!runId) fail(EXIT.USAGE, 'aucune exécution reconnue dans ce worktree')
  assertNotMainFolder(root)
  const L = localOf(root)
  const { run, released } = closeRun(L, runId, root, 'échec', o.reason ? `abandon : ${o.reason}` : 'abandon', parseNow(o.now))
  out(EXIT.OK, { runId, status: 'échec', runFound: !!run, lockReleased: released })
}

async function status(args) {
  const o = parseArgs(args, COMMON)
  const root = rootFrom(o)
  ctxRoot = root
  const runId = runIdHere(root)
  ctxRunId = runId
  const L = localOf(root)
  const policy = loadPolicy(root)
  const now = parseNow(o.now)
  const insp = inspectLock(L.lock, { now, policy, worktree: root })
  const pending = listPending(L.dir)
  out(EXIT.OK, {
    runId,
    lock: insp.lock ? { ...insp.lock, stale: insp.stale, here: !!insp.entry } : null,
    run: runId ? readJson(runFile(L, runId), null) : null,
    stop: existsSync(L.stop),
    pause: existsSync(L.pause) ? readFileSync(L.pause, 'utf8').trim() || true : false,
    paused: !!policy.paused,
    pending: { attente: pending.filter(p => p.status === 'attente').length, total: pending.length },
    lastShip: readJson(L.lastShip, null),
  })
}

// ——— pending ———

async function pendingCmd(args) {
  const sub = args[0]
  const rest = args.slice(1)
  const ctx = o => {
    const root = rootFrom(o)
    ctxRoot = root
    ctxRunId = runIdHere(root)
    return { root, L: localOf(root), now: parseNow(o.now) }
  }
  if (sub === 'add') {
    const o = parseArgs(rest, { ...COMMON, json: { type: 'string', required: true } })
    const { root, L, now } = ctx(o)
    assertNotMainFolder(root)
    let raw
    try {
      raw = JSON.parse(o.json)
    } catch (e) {
      fail(EXIT.USAGE, `--json : JSON illisible (${e.message})`)
    }
    const run = ctxRunId ? readJson(runFile(L, ctxRunId), null) : null
    const r = addPending(L.dir, raw, { createdAt: isoInParis(now), runId: ctxRunId ?? undefined, branch: currentBranch(root), worktree: root, baseCommit: run?.baseCommit ?? null })
    out(EXIT.OK, r)
  }
  if (sub === 'resolve') {
    const o = parseArgs(rest, { ...COMMON, status: { type: 'string', required: true, choices: ['accordé', 'refusé', 'caduc'] }, note: { type: 'string' } })
    const id = o._[0]
    if (!id) fail(EXIT.USAGE, 'pending resolve <id> --status …')
    const { root, L, now } = ctx(o)
    assertNotMainFolder(root)
    out(EXIT.OK, { item: resolvePending(L.dir, id, o.status, { note: o.note ?? null, now }) })
  }
  if (sub === 'list') {
    const o = parseArgs(rest, { ...COMMON, status: { type: 'string', choices: ['attente', 'accordé', 'refusé', 'caduc'] } })
    const { L } = ctx(o)
    out(EXIT.OK, { items: listPending(L.dir, { status: o.status }) })
  }
  if (sub === 'remind') {
    const o = parseArgs(rest, { ...COMMON, 'dry-run': { type: 'boolean' } })
    const { root, L, now } = ctx(o)
    if (!o['dry-run']) assertNotMainFolder(root)
    const due = remindPending(L.dir, { now, policy: loadPolicy(root), dryRun: o['dry-run'] })
    out(EXIT.OK, { due })
  }
  fail(EXIT.USAGE, `pending ${sub ?? ''} : add | resolve | list | remind`)
}

// ——— report ———

async function report(args) {
  const o = parseArgs(args, { ...COMMON, final: { type: 'boolean' } })
  const root = rootFrom(o)
  ctxRoot = root
  const runId = runIdHere(root)
  ctxRunId = runId
  if (!runId) fail(EXIT.USAGE, 'aucune exécution reconnue dans ce worktree')
  const L = localOf(root)
  const P = paths(root)
  const policy = loadPolicy(root)
  const dir = L.run(runId)
  const outputs = {}
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
      try {
        outputs[basename(f, '.json')] = readJson(join(dir, f))
      } catch {
        // une sortie illisible ne bloque pas le rapport
      }
    }
  }
  const run = outputs.run?.format === 'isoloir-veille-run/1' ? outputs.run : null
  const start = outputs['run-start'] ?? null
  const today = run?.today ?? start?.today ?? todayInParis(parseNow(o.now))
  const kind = run?.kind ?? start?.kind ?? kindOfRunId(runId)
  const config = readJson(P.config)
  const { election } = await loadElectionFreezeSpans(root)
  const split = splitCandidates(config, election)
  const { lines } = readSpend(L.spend)
  const mine = lines.filter(l => l.runId === runId)
  const text = renderReport({
    runId,
    run,
    start,
    applyReport: outputs['apply-report'] ?? outputs.apply ?? null,
    classify: outputs.classify ?? null,
    watch: outputs.watch ?? null,
    remeasure: outputs.remeasure ?? null,
    ship: outputs.ship ?? null,
    lastShip: readJson(L.lastShip, null),
    gate: outputs['gate-time-push'] ?? outputs['gate-time-deploy'] ?? null,
    journal: readJsonl(join(dir, 'journal.jsonl')),
    outputs,
    pending: listPending(L.dir, { status: 'attente' }),
    spend: { lines: mine, totals: spentTotals(lines, today), limits: limitsFor(policy, { prepToday: prepStartedOn(lines, today, kind) }) },
    policy,
    names: Object.fromEntries(config.candidates.map(c => [c.id, c.name])),
  })
  const files = []
  writeText(join(dir, 'rapport.md'), text)
  files.push(join(dir, 'rapport.md'))
  if (!o.final) {
    assertNotMainFolder(root)
    const v = P.report(today, kind)
    writeText(v, redactHidden(text, split.hidden))
    files.push(v)
  }
  out(EXIT.OK, { runId, files })
}

// ——— Aiguillage ———

async function main() {
  switch (command) {
    case 'start': return start(argv.slice(1))
    case 'heartbeat': return heartbeat(argv.slice(1))
    case 'budget': return budget(argv.slice(1))
    case 'finish': return finish(argv.slice(1))
    case 'status': return status(argv.slice(1))
    case 'abort': return abort(argv.slice(1))
    case 'pending': return pendingCmd(argv.slice(1))
    case 'report': return report(argv.slice(1))
    default: fail(EXIT.USAGE, `commande « ${command} » : start | heartbeat | budget | finish | status | abort | pending | report`)
  }
}

runMain(async () => {
  try {
    await main()
  } catch (e) {
    if (e instanceof VeilleError) {
      process.stderr.write(`${e.message}\n`)
      out(e.code, { reason: e.message, ...e.extra })
    }
    process.stderr.write(`${e?.stack ?? e}\n`)
    out(EXIT.CODE, { reason: `erreur inattendue : ${e?.message ?? e}` })
  }
})
