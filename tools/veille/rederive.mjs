// Reprise d'une exécution de la veille automatique sur l'origin/main courant (contrat : tools/veille/CONTRACT.md §d.12) :
// après un 10 (main a bougé) ou un 30 (paquets à retenir), il crée un worktree NEUF depuis l'origin/main du moment,
// y rejoue ce que l'exécution a persisté (ses fichiers d'extension et d'explications, son changeset, ses retenus) avec
// les scripts de ce nouveau worktree, jusqu'au commit. Rien n'est poussé ici : la session lance ensuite ship.mjs depuis
// le nouveau worktree. apply.mjs étant idempotent, rejouer un changeset déjà vu ne change rien de plus.
//
// Usage : node <WT>/tools/veille/rederive.mjs --run-id <runId> [--hold <paquet>…] [--approve <H-…>…] [--only <H-…>…]
//                                             [--from-run <runId source>] [--attempt N] [--dry-run] [--now ISO]
//                                             [--root <abs>]
//   --run-id   l'exécution à rejouer (son changeset : <état local>/runs/<runId>/changeset.json, son run.json)
//   --hold     paquets à retenir (« candidat:<id> », « approche:<question> », « question:<id> », « cle:<claimKey> ») :
//              ajoutés au changeset (local et versionné), pour cette reprise et les suivantes ; « question:<id> » laisse
//              la question neuve hors de build.json, de transfer.ts, de la fixture et des explications (fichiers et
//              trace recopiés quand même)
//   --approve  retenus approuvés par le propriétaire (« OK H-… ») ; --only : seuls ces retenus sont appliqués
//   --from-run accord seulement (--run-id accord-<id>-<date>, worktree accord-*, après run start --kind accord) : crée le
//              changeset de l'accord s'il manque. Pour un retenu (H-…) : celui de l'exécution source, avec runId, today et
//              baseCommit de l'accord, approve et only = l'attente. Pour un candidat, un retrait ou une redéclaration
//              (C-, R-, D-) : un changeset vide, et la préparation rejouée depuis le worktree de l'attente (pending.json :
//              worktree, baseCommit) : chaque fichier changé du niveau accord, fusionné à trois voies avec l'origin/main
//              courant (git merge-file), conflit → 31. L'attente doit être « accordé » (2 sinon).
//   --attempt  numéro N de la reprise (par défaut le premier libre) ; au plus policy.retries.moved + retries.data
//   --dry-run  imprime le worktree, la branche et les étapes prévues, sans rien créer
//   --now      heure simulée, transmise aux étapes par ISOLOIR_VEILLE_NOW
// Étapes, dans le nouveau worktree <M>/.claude/worktrees/veille-<runId>-r<N> (branche veille/<runId>-r<N> ; pour un
// accord, <runId>-r<N> et accord/<…>-r<N>) :
//   git fetch -q origin ; git worktree add -b <branche> <chemin> <origin/main> ; inscription dans lock.worktrees avec le
//   runId rejoué (les sorties vont dans runs/<runId>/) ; pnpm install --frozen-lockfile --offline ;
//   copie des D/expansion-output-*.json, expansion-merged-*.json, explainers-output-*.json et de V/runs/<runId>/ ;
//   apply.mjs <changeset> ; apply.mjs --question pour chaque extension que l'exécution avait ajoutée à build.json ;
//   build.mjs si une question est acceptée ; merge-explainers --merge pour chaque sortie d'explications copiée ;
//   build.mjs ; remeasure.mjs ; election-fields.mjs --today <run.today> --summary <apply-report.json> ;
//   run.mjs report ; commit.mjs (message du commit de l'exécution, ou un message de veille).
// Sortie (une ligne JSON, rangée dans runs/<runId>/rederive-r<N>.json) : { runId, attempt, worktree, branch,
// baseCommit, sha, empty, steps, copied, questions }.
// Codes : 0 ; 2 (appel, pas de verrou, pas de changeset, reprises épuisées) ; 20 (STOP, PAUSE) ; 21 (verrou d'une autre
// exécution) ; 31 (git, pnpm, conflit de fichiers) ; sinon le code de l'étape rejouée, tel quel (30 avec ses paquets).

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative } from 'node:path'
import { RUN_ID, HOLD_ID } from './schemas.mjs'
import {
  EXIT, VeilleError, assertRunWorktree, exit, fail, frenchDate, git as gitIn, mainRoot, parseArgs, paths, readJson, rootFrom,
  run, runMain, tail, writeJson, writeText,
} from './lib/common.mjs'
import { accordItemErrors, accordItemOf, makeGit, pathAllowed } from './lib/git.mjs'
import { applyFakeBin, lastJsonLine, loadPolicy } from './lib/ship.mjs'

const D = 'research/presidentielle-2027'
const BUNDLE = /^(candidat|approche|question|cle):[a-z0-9_-]+$/
/** Fichiers de données d'une exécution, recopiés tels quels dans le nouveau worktree */
const RUN_DATA_FILE = /^(expansion-output|expansion-merged|explainers-output)-[A-Za-z0-9_.-]+\.json$/
const KNOWN_CODES = Object.values(EXIT)
const short = sha => String(sha ?? '').slice(0, 9)
const union = (a = [], b = []) => [...new Set([...(a ?? []), ...(b ?? [])])]

const SPEC = {
  root: { type: 'string' },
  'run-id': { type: 'string', required: true },
  hold: { type: 'list' },
  approve: { type: 'list' },
  only: { type: 'list' },
  attempt: { type: 'number' },
  'from-run': { type: 'string' },
  'dry-run': { type: 'boolean' },
  now: { type: 'string' },
}

const state = { runId: null, attempt: null, worktree: null, branch: null, steps: [] }
let tag

runMain(async () => {
  try {
    await main()
  } catch (e) {
    if (!(e instanceof VeilleError)) throw e
    process.stderr.write(`${e.message}\n`)
    exit(e.code, { ...state, reason: e.message, ...e.extra }, { tag })
  }
})

async function main() {
  const opts = parseArgs(process.argv.slice(2), SPEC)
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')}`)
  applyFakeBin()
  const root = rootFrom(opts)
  const runId = opts['run-id']
  state.runId = runId
  if (!new RegExp(RUN_ID).test(runId)) fail(EXIT.USAGE, `--run-id ${runId} : identifiant d’exécution invalide`)
  for (const h of opts.hold) if (!BUNDLE.test(h)) fail(EXIT.USAGE, `--hold ${h} : paquet candidat:<id>, approche:<question>, question:<id> ou cle:<claimKey> attendu`)
  for (const h of [...opts.approve, ...opts.only]) if (!new RegExp(HOLD_ID).test(h)) fail(EXIT.USAGE, `${h} : identifiant de retenu H-AAAA-MM-JJ-<n> attendu`)
  if (opts.attempt !== undefined && (!Number.isInteger(opts.attempt) || opts.attempt < 1)) fail(EXIT.USAGE, '--attempt : entier ≥ 1 attendu')

  // ——— Départ ———
  assertRunWorktree(root)
  const P = paths(root)
  const L = P.local
  if (!L) fail(EXIT.USAGE, 'état local introuvable (dépôt principal ou ISOLOIR_VEILLE_LOCAL)')
  const policy = loadPolicy(root)
  if (existsSync(L.stop)) fail(EXIT.PAUSED, `STOP présent (${L.stop})`)
  if (existsSync(L.pause)) fail(EXIT.PAUSED, `PAUSE présent (${L.pause}) : ${readFileSync(L.pause, 'utf8').split('\n')[0]}`)
  if (policy.paused) fail(EXIT.PAUSED, 'veille en pause (policy.json)')
  const lock = readJson(L.lock, null)
  if (!lock) fail(EXIT.USAGE, `aucun verrou (${L.lock}) : rederive ne tourne que sous le verrou de l’exécution (run.mjs start)`)
  const here = realpathSync(root)
  const mine = lock.runId === runId || (lock.worktrees ?? []).some(w => w?.path && existsSync(w.path) && realpathSync(w.path) === here)
  if (!mine) fail(EXIT.LOCKED, `le verrou appartient à l’exécution ${lock.runId}, pas à ${runId} ni à ce worktree`)
  const runDir = join(L.runs, runId)
  const runRecord = readJson(join(runDir, 'run.json'), null)
  if (runRecord?.format !== 'isoloir-veille-run/1' || !runRecord.today) fail(EXIT.USAGE, `${join(runDir, 'run.json')} absent, sans today ou d’un autre format`)
  const changesetFile = join(runDir, 'changeset.json')
  // Accord : le changeset de l'accord se tire de l'exécution source et de l'attente accordée
  const fromRun = opts['from-run'] ?? null
  const accordItem = runId.startsWith('accord-') ? accordItemOf(runId) : null
  let pendingItem = null
  if (fromRun) {
    if (!runId.startsWith('accord-')) fail(EXIT.USAGE, '--from-run : seulement pour un accord (--run-id accord-<id>-<date>)')
    if (!new RegExp(RUN_ID).test(fromRun) || fromRun.startsWith('accord-')) fail(EXIT.USAGE, `--from-run ${fromRun} : runId de l’exécution source attendu`)
    const pendingItems = readJson(L.pending, { items: [] })?.items ?? []
    const errors = accordItemErrors(runId, pendingItems)
    if (errors.length) fail(EXIT.USAGE, `accord : ${errors.join(' ; ')}`)
    pendingItem = pendingItems.find(x => x.id === accordItem.id)
    if (!existsSync(changesetFile)) {
      const sourceFile = join(L.runs, fromRun, 'changeset.json')
      let next
      if (accordItem.kind === 'hold') {
        if (!existsSync(sourceFile)) fail(EXIT.USAGE, `${sourceFile} absent : le retenu ${accordItem.id} n’a pas de changeset source`)
        const source = readJson(sourceFile)
        next = { ...source, runId, today: runRecord.today, baseCommit: runRecord.baseCommit, approve: union(source.approve, [accordItem.id]), only: union(source.only, [accordItem.id]) }
      } else {
        next = { format: 'isoloir-veille-changeset/1', runId, electionId: 'presidentielle-2027', baseCommit: runRecord.baseCommit, today: runRecord.today, since: {}, results: [] }
      }
      writeJson(changesetFile, next)
    }
  }
  if (!existsSync(changesetFile)) fail(EXIT.USAGE, `${changesetFile} absent : rien à rejouer`)
  let changeset
  try {
    changeset = readJson(changesetFile)
  } catch (e) {
    fail(EXIT.DATA, `changeset illisible : ${e.message}`, { bundles: [] })
  }

  const mainDir = mainRoot(root)
  if (!mainDir) fail(EXIT.USAGE, `${root} n’est pas dans un dépôt git`)
  const accord = runId.startsWith('accord-')
  const tier = accord ? 'accord' : 'auto'
  const g = makeGit(root)
  const naming = n => {
    const name = accord ? `${runId}-r${n}` : `veille-${runId}-r${n}`
    return { name, path: join(mainDir, '.claude', 'worktrees', name), branch: accord ? `accord/${runId.slice('accord-'.length)}-r${n}` : `veille/${runId}-r${n}` }
  }
  const taken = n => {
    const t = naming(n)
    return existsSync(t.path) || g.raw(['show-ref', '--verify', '--quiet', `refs/heads/${t.branch}`]).code === 0
  }
  const maxAttempts = (policy.retries?.moved ?? 2) + (policy.retries?.data ?? 3)
  let attempt = opts.attempt
  if (attempt === undefined) for (attempt = 1; taken(attempt) && attempt <= maxAttempts; attempt++);
  state.attempt = attempt
  tag = `r${attempt}`
  if (attempt > maxAttempts) fail(EXIT.USAGE, `reprise ${attempt} : au plus ${maxAttempts} reprises (policy.retries) ; on s’arrête et on notifie`)
  if (taken(attempt)) fail(EXIT.USAGE, `reprise ${attempt} : le worktree ou la branche existe déjà`)
  const { path: wt, branch } = naming(attempt)
  Object.assign(state, { worktree: wt, branch })

  const replayPrep = !!pendingItem && ['candidat', 'retrait', 'redeclaration'].includes(accordItem?.kind)
  const plan = ['fetch', 'worktree', 'lock', 'pnpm-install', 'copie', ...(replayPrep ? ['préparation'] : []), 'apply', 'questions', 'merge-explainers', 'build', 'remeasure', 'election-fields', 'report', 'commit']
  if (opts['dry-run']) exit(EXIT.OK, { ...state, dryRun: true, plan, holds: union(changeset.holds, opts.hold) }, { tag })

  // ——— Worktree neuf, depuis l'origin/main courant ———
  g.fetch()
  const base = g.sha('origin/main')
  state.baseCommit = base
  g.out(['worktree', 'add', '-q', '-b', branch, wt, base])
  state.steps.push({ id: 'worktree', code: 0 })
  lock.worktrees = [...(lock.worktrees ?? []).filter(w => w?.path !== wt), { path: wt, runId }]
  writeJson(L.lock, lock)
  const env = { ISOLOIR_VEILLE_ROOT: wt, ...(opts.now ? { ISOLOIR_VEILLE_NOW: opts.now } : {}) }

  const install = run('pnpm', ['install', '--frozen-lockfile', '--offline'], { cwd: wt })
  state.steps.push({ id: 'pnpm-install', code: install.code })
  if (install.code !== 0) fail(EXIT.CODE, `pnpm install --frozen-lockfile --offline : ${tail(`${install.stdout}\n${install.stderr}`.trim(), 6)}`, { failedStep: 'pnpm-install' })

  // ——— Fichiers de l'exécution ———
  const copied = []
  const copyIfNew = (from, to) => {
    if (existsSync(to)) {
      if (readFileSync(from).equals(readFileSync(to))) return false
      fail(EXIT.CODE, `conflit : ${relative(wt, to)} existe déjà sur origin/main avec un autre contenu`, { failedStep: 'copie' })
    }
    mkdirSync(dirname(to), { recursive: true })
    copyFileSync(from, to)
    copied.push(relative(wt, to))
    return true
  }
  const dataFiles = existsSync(join(root, D)) ? readdirSync(join(root, D)).filter(f => RUN_DATA_FILE.test(f)).sort() : []
  for (const f of dataFiles) copyIfNew(join(root, D, f), join(wt, D, f))
  const traceFrom = P.committedRun(runId)
  const traceTo = join(wt, relative(root, traceFrom))
  if (existsSync(traceFrom)) {
    for (const f of readdirSync(traceFrom, { recursive: true }).map(String).sort()) {
      if (statSync(join(traceFrom, f)).isFile()) copyIfNew(join(traceFrom, f), join(traceTo, f))
    }
  }
  state.steps.push({ id: 'copie', code: 0 })
  state.copied = copied
  if (replayPrep) {
    state.replayed = replayPreparation({ item: pendingItem, wt })
    state.steps.push({ id: 'préparation', code: 0 })
  }

  // Retenus, approbations et sous-ensemble : gardés dans le changeset (local et versionné) pour les reprises suivantes
  if (opts.hold.length || opts.approve.length || opts.only.length) {
    const next = { ...changeset }
    if (opts.hold.length) next.holds = union(changeset.holds, opts.hold)
    if (opts.approve.length) next.approve = union(changeset.approve, opts.approve)
    if (opts.only.length) next.only = union(changeset.only, opts.only)
    writeJson(changesetFile, next)
    if (existsSync(join(traceTo, 'changeset.json'))) writeJson(join(traceTo, 'changeset.json'), next)
  }

  // ——— Étapes, avec les scripts du nouveau worktree ———
  const script = name => join(wt, 'tools', 'veille', `${name}.mjs`)
  const step = (id, args, { onFail } = {}) => {
    process.stderr.write(`rederive : ${id}…\n`)
    const r = run(process.execPath, args, { cwd: wt, env })
    const out = lastJsonLine(r.stdout)
    state.steps.push({ id, code: r.code })
    if (r.code !== 0) {
      if (onFail) onFail(r, out)
      const code = KNOWN_CODES.includes(r.code) ? r.code : EXIT.CODE
      fail(code, `${id} : ${out?.reason ?? (tail(r.stderr, 6).trim() || `code ${r.code}`)}`, { failedStep: id, ...(code === EXIT.DATA ? { bundles: out?.bundles ?? [] } : {}) })
    }
    return out
  }
  const holdFlags = [
    ...(opts.hold.length ? ['--hold', opts.hold.join(',')] : []),
    ...(opts.approve.length ? ['--approve', opts.approve.join(',')] : []),
    ...(opts.only.length ? ['--only', opts.only.join(',')] : []),
  ]
  step('apply', [script('apply'), changesetFile, ...holdFlags])

  // Questions ajoutées par l'exécution : les extensions de son build.json absentes de celui d'origin/main ; une question
  // retenue (« question:<id> », changeset ou --hold) reste dehors : ni build.json, ni numéro de transfert, ni explication
  const heldQuestions = new Set(union(changeset.holds, opts.hold).filter(h => h.startsWith('question:')).map(h => h.slice('question:'.length)))
  const bankIds = new Set((readJson(join(wt, D, 'bank.json'), null)?.bank?.questions ?? []).map(q => q.id))
  const freshQuestionOf = file => {
    try {
      const m = readJson(file)
      return ((m?.result ?? m)?.drafts ?? []).flatMap(d => d.questions ?? []).map(q => q?.id).find(id => id && !bankIds.has(id)) ?? null
    } catch {
      return null
    }
  }
  const before = readJson(join(root, D, 'build.json'), null)?.expansions ?? []
  const current = readJson(join(wt, D, 'build.json'), null)?.expansions ?? []
  const questions = []
  for (const exp of before.filter(e => !current.includes(e))) {
    if (!existsSync(join(wt, exp))) fail(EXIT.CODE, `${exp} manque dans le nouveau worktree`, { failedStep: 'questions' })
    const qid = freshQuestionOf(join(wt, exp))
    if (qid && heldQuestions.has(qid)) {
      questions.push({ file: exp, accepted: false, questionId: qid, reasons: [`retenue (question:${qid})`] })
      continue
    }
    const out = step(`question ${basename(exp)}`, [script('apply'), '--question', join(wt, exp)])
    questions.push({ file: exp, accepted: !!out?.accepted, questionId: out?.questionId ?? null, reasons: out?.reasons ?? [] })
  }
  state.questions = questions
  const accepted = questions.filter(q => q.accepted)
  if (accepted.length) step('build (question)', [script('build')])
  const questionBundles = accepted.map(q => q.questionId && `question:${q.questionId}`).filter(Boolean)
  const explainedQuestions = file => {
    try {
      const v = readJson(file)
      return ((v?.result ?? v)?.explainers ?? []).map(e => e?.questionId).filter(Boolean)
    } catch {
      return []
    }
  }
  for (const f of copied.filter(p => /\/explainers-output-[^/]+\.json$/.test(p) && p.startsWith(`${D}/`))) {
    if (explainedQuestions(join(wt, f)).some(id => heldQuestions.has(id))) {
      state.steps.push({ id: `merge-explainers ${basename(f)}`, code: 0, skipped: 'question retenue' })
      continue
    }
    step(`merge-explainers ${basename(f)}`, [join(wt, 'tools', 'merge-explainers.mjs'), join(wt, f), D, '--config', `${D}/config.json`, '--merge'], {
      onFail: r => fail(EXIT.DATA, `merge-explainers ${basename(f)} : ${tail(`${r.stdout}\n${r.stderr}`.trim(), 6)}`, { failedStep: 'merge-explainers', bundles: questionBundles }),
    })
  }

  step('build', [script('build')])
  step('remeasure', [script('remeasure')])
  const remeasureOut = join(runDir, 'remeasure.json')
  step('election-fields', [
    script('election-fields'), '--today', runRecord.today, '--summary', join(runDir, 'apply-report.json'),
    ...(existsSync(remeasureOut) ? ['--remeasure', remeasureOut] : []),
  ])
  step('report', [script('run'), 'report'])

  // Le message du commit de l'exécution (s'il y en a un), sinon un message de veille ; commit.mjs ajoute Co-Authored-By
  const ahead = g.count('origin/main..HEAD')
  const original = ahead > 0
    ? g.text(['log', '-1', '--format=%B', 'HEAD']).split('\n').filter(l => !/^Reprise n° \d+ sur origin\/main /.test(l)).join('\n').trim()
    : `Veille automatique (${runId}) : positions relevées le ${frenchDate(runRecord.today)}`
  const tmp = mkdtempSync(join(tmpdir(), 'isoloir-rederive-'))
  let committed
  try {
    const msgFile = join(tmp, 'message.txt')
    writeText(msgFile, `${original}\n\nReprise n° ${attempt} sur origin/main ${short(base)} (tools/veille/rederive.mjs).\n`)
    committed = step('commit', [script('commit'), '--message-file', msgFile, '--tier', tier])
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
  exit(EXIT.OK, { ...state, sha: committed?.sha ?? null, empty: !committed?.sha }, { tag })
}

/**
 * Rejoue la préparation d'un candidat, d'un retrait ou d'une redéclaration (attente C-, R-, D-) dans le worktree neuf wt :
 * chaque fichier que le worktree de la préparation a changé depuis sa base (pending.json : worktree, baseCommit), suivi
 * ou non, et permis au niveau accord, est fusionné à trois voies avec l'origin/main courant (git merge-file) ; un
 * fichier binaire ou un conflit donne 31. Rend la liste des fichiers rejoués.
 */
function replayPreparation({ item, wt }) {
  const prep = item?.worktree
  const base = item?.baseCommit
  if (!prep || !existsSync(prep) || !base) fail(EXIT.USAGE, `attente ${item?.id} : worktree de la préparation (${prep ?? 'absent'}) ou base (${base ?? 'absente'}) introuvable`, { failedStep: 'préparation' })
  const lines = args => {
    const r = gitIn(args, { cwd: prep })
    if (r.code !== 0) fail(EXIT.CODE, `git ${args.join(' ')} (préparation) : ${tail(r.stderr, 4).trim()}`, { failedStep: 'préparation' })
    return r.stdout.split('\0').filter(Boolean)
  }
  const changed = [...new Set([...lines(['diff', '--name-only', '--no-renames', '-z', base]), ...lines(['ls-files', '--others', '--exclude-standard', '-z'])])].sort()
  const replayed = []
  const tmp = mkdtempSync(join(tmpdir(), 'isoloir-rederive-prep-'))
  try {
    for (const path of changed) {
      if (!pathAllowed(path, 'accord')) continue
      const theirsFile = join(prep, path)
      const theirs = existsSync(theirsFile) ? readFileSync(theirsFile) : null
      const shown = spawnSync('git', ['cat-file', 'blob', `${base}:${path}`], { cwd: prep, maxBuffer: 1 << 30 })
      const baseBuf = shown.status === 0 ? shown.stdout : null
      const curFile = join(wt, path)
      const current = existsSync(curFile) ? readFileSync(curFile) : null
      const eq = (a, b) => (a === null || b === null ? a === b : a.equals(b))
      if (eq(theirs, baseBuf) || eq(current, theirs)) continue
      if (eq(current, baseBuf)) {
        if (theirs === null) rmSync(curFile, { force: true })
        else {
          mkdirSync(dirname(curFile), { recursive: true })
          copyFileSync(theirsFile, curFile)
        }
        replayed.push(path)
        continue
      }
      const textual = [theirs, baseBuf, current].every(b => b !== null && !b.includes(0))
      if (!textual) fail(EXIT.CODE, `préparation de ${item.id} : ${path} a changé sur origin/main et dans la préparation (fichier binaire ou retiré) : conflit`, { failedStep: 'préparation' })
      const files = ['courant', 'base', 'preparation'].map(n => join(tmp, `${n}-${replayed.length}`))
      writeText(files[0], current.toString('utf8'))
      writeText(files[1], baseBuf.toString('utf8'))
      writeText(files[2], theirs.toString('utf8'))
      const merged = run('git', ['merge-file', '-p', ...files])
      if (merged.code !== 0) fail(EXIT.CODE, `préparation de ${item.id} : ${path} en conflit avec origin/main (git merge-file : ${merged.code})`, { failedStep: 'préparation' })
      writeText(curFile, merged.stdout)
      replayed.push(path)
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
  return replayed
}
