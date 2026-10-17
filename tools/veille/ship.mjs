// Mise en ligne d'une exécution de la veille automatique (tâche « isoloir-veille-positions », décision du propriétaire
// du 2026-10-17 ; contrat : tools/veille/CONTRACT.md §d.11) : depuis le worktree de l'exécution, sur sa branche veille/*
// ou accord/* déjà validée par commit.mjs, il refait tous les contrôles du moins cher au plus cher, fusionne la branche
// dans main sans rien réécrire (commit-tree, même arbre que HEAD), pousse sans jamais forcer, déploie le dist/ contrôlé
// sur Vercel et vérifie que la production sert bien le nouvel asset. Rien d'autre ne publie : la session n'appelle ni
// git push, ni vercel.
//
// Usage : node <WT>/tools/veille/ship.mjs --port N [--tier auto|accord] [--dry-run] [--deploy-only] [--simulate-moved]
//                                         [--now ISO] [--root <abs>]
//   --port N          port de l'e2e (4371 pour l'hebdomadaire, 4372 pour un accord ; par défaut policy.ship) ; repli
//                     sur 4373 puis 4375 s'il est pris ; jamais 4320, 4347 ni 4361 (sortie 2)
//   --tier            auto (par défaut) : données seulement ; accord : en plus candidates.ts, media/**, elections/index.ts,
//                     election.hidden / ranking.excluded / forbiddenTerms, sur une branche accord/* d'un worktree accord-*
//                     seulement, et pour la seule attente accordée que nomme le runId (accord-<id>-<date>)
//   --dry-run         tous les contrôles, la fusion M calculée et vérifiée, les gardes horaires évaluées ; ni push ni
//                     déploiement : les commandes sont imprimées (exigé quand run.json dit essai: true ou mode rapport)
//   --deploy-only     ni contrôle ni push : redéploie le commit déjà poussé (après un 40, un 41 ou un gel au déploiement),
//                     si origin/main^{tree} = HEAD^{tree} = last-ship.json tree et que dist/index.html a l'empreinte notée
//   --simulate-moved  force la sortie 10 à l'étape de l'ancêtre (essai de la reprise par rederive)
//   --now             heure simulée, transmise à gate-time.mjs : avec --dry-run seulement (sinon 2, comme
//                     ISOLOIR_VEILLE_NOW) ; une vraie publication passe toujours ses portes horaires à l'horloge
//   --root            racine de travail (tests seulement ; sinon le checkout de ce script)
//
// Départ : hors --dry-run, ni heure simulée ni crochet d'essai (ISOLOIR_VEILLE_FAKE_BIN, VEILLE_FAKE_BIN,
// ISOLOIR_VEILLE_LOCAL, ISOLOIR_VEILLE_MAIN_ROOT) sauf vers un dépôt d'essai (origin local) (2) ; worktree d'exécution
// (veille-* ou accord-*, branche du même préfixe) ; ni STOP, ni PAUSE, ni policy.paused (20) ; branche veille/* ou
// accord/* (2), celle de run.json ou l'une de ses reprises « -r<N> » (2) ; runs/<runId>/run.json présent, essai →
// --dry-run (2) ; hors --dry-run, kind hebdo ou accord seulement (les exécutions quotidienne, de préparation et de
// retrait ne publient jamais) (2) ; niveau accord si et seulement si kind accord (2), avec l'attente accordée (2) ;
// gate-time --step push (11, 12, 13) ; hors --dry-run, run.json mode publication (2) ; arbre propre (2) ; garde de
// fichiers sur origin/main...HEAD : chemins du niveau (jamais les fichiers de contrôle du propriétaire : VEILLE.md,
// PIPELINE.md, policy.json, locks.json, d5-baseline.json), election.ts (seules ses clés de données), config.json
// (contextDate au niveau auto ; l'attente accordée seule au niveau accord), entrées changées de decisions.json (note
// AVANT/APRÈS, historyCause connue, statedAt si et seulement si prise-de-position, approches <q>-[a-p], lettres neuves),
// au plus 9 approches par question, explications publiées intactes, transfer.ts et sa fixture en ajout seul,
// echiquierMethodCopy.ts par les seuls nombres des trois constantes recalculées, build.json include inchangé (31).
// La politique (policy.json) se lit à origin/main, jamais dans l'arbre de travail.
// Avant chaque contrôle, la fusion, le push et le déploiement (stillOurs) : STOP, PAUSE et policy.paused relus (20), le
// verrou encore tenu par ce worktree, battement compris (21), run.json toujours « en-cours » (21).
// Contrôles (après chacun, l'arbre doit rester propre, sinon 31) :
//   1 node tools/veille/build.mjs (son code)   2 pipeline-helpers check-log (30)   3 positions-history check (30)
//   4 reconstruction de la primaire + git diff --quiet src/elections/choisir-2027 research/choisir-2027/bank.json (31)
//   5 audit-pack presidentielle-2027 (1 → 30, 2 → 31)   6 npx tsc --noEmit, npx eslint . (31), npx vitest run (30 si
//   seuls des tests de données échouent, 31 sinon)   7 pnpm build (31)   8 node tools/e2e-offline.mjs <port> (31)
// Fusion et mise en ligne : git fetch ; origin/main toujours la base contrôlée par la garde (10 : main a bougé ou a été
// réécrit) et ancêtre de HEAD (10) ; M = commit-tree HEAD^{tree} -p origin/main -p HEAD (« Fusion de la branche
// <branche> » + Co-Authored-By) ; M^{tree} = HEAD^{tree} (31) ; gate-time --step push ; git push -q origin
// M:refs/heads/main (refus → 10) ; last-ship.json tout de suite (deployed: false) ; origin/main = M (31) ; gate-time
// --step deploy (11, 12, 13 : poussé, non déployé) ; vercel deploy dist --project isoloir --scope lbtbly --prod --yes (40) ;
// contrôle de la production, 3 essais à 20 s (41 : PAUSE créée, aucun retour arrière automatique).
// Sorties : une ligne JSON ({ runId, branch, tier, checks, merge, tree, indexAsset, deployUrl, prod, lastShip, pushed… }) ;
// <état local>/last-ship.json dès que le push a réussi (deployed / checked à false tant que le déploiement n'est pas
// contrôlé : après 11-13, 20, 21, 40, 41 ou un arrêt brutal) ; PAUSE sur 41.
// Codes : 0, 2, 10, 11, 12, 13, 20, 21, 30, 31, 40, 41 (CONTRACT.md §b). Tests : faux exécutables par
// ISOLOIR_VEILLE_FAKE_BIN (ou VEILLE_FAKE_BIN), placé en tête du PATH (npx, pnpm, vercel, curl), dépôt d'essai seulement.

import { createHash } from 'node:crypto'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { SCHEMAS, validate } from './schemas.mjs'
import {
  EXIT, VeilleError, assertRunWorktree, currentBranch, currentRunId, exit, fail, isTestOrigin, isoInParis, parseArgs, parseNow,
  paths, readJson, rootFrom, run, runIdOfWorktree, runMain, tail, writeJson, writeText,
} from './lib/common.mjs'
import {
  accordItemErrors, accordItemOf, branchError, branchOfRun, makeGit, mergeErrors, mergeMessage, outsideTier, pushArgs, pushRejected,
  touchedPaths, worktreeBranchError,
} from './lib/git.mjs'
import { heartbeatLock } from './lib/lock.mjs'
import {
  FORBIDDEN_PORTS, PRIMARY_DIFF, accordDiffErrors, applyFakeBin, bankApproachErrors, buildIncludeErrors, checkPlan, configDiffErrors,
  decisionsErrors, deployArgs, deployCommandText, deployUrlOf, electionDiffErrors, explainersErrors, indexAssetOf, lastJsonLine,
  lastShipRecord, loadPolicy, methodCopyDiffErrors, pauseText, pickPort, preservesBase, prodCheck, referencedAssets,
} from './lib/ship.mjs'

const D = 'research/presidentielle-2027'
const S = 'src/elections/presidentielle-2027'
const FIXTURE = 'tests/fixtures/transfer-slots-presidentielle-2027.json'
const METHOD_COPY = 'src/core/echiquierMethodCopy.ts'
/** Crochets d'essai : jamais pour une vraie publication, sauf vers un dépôt d'essai (origin local) */
const TEST_HOOKS = ['ISOLOIR_VEILLE_FAKE_BIN', 'VEILLE_FAKE_BIN', 'ISOLOIR_VEILLE_LOCAL', 'ISOLOIR_VEILLE_MAIN_ROOT']
/** Durée maximale d'un contrôle (vitest et l'e2e prennent des minutes, jamais des heures) */
const CHECK_TIMEOUT_MS = 3 * 3600 * 1000
const DEPLOY_TIMEOUT_MS = 30 * 60 * 1000
const short = sha => String(sha ?? '').slice(0, 9)

const SPEC = {
  root: { type: 'string' },
  port: { type: 'number' },
  tier: { type: 'string', choices: ['auto', 'accord'], default: 'auto' },
  'dry-run': { type: 'boolean' },
  'deploy-only': { type: 'boolean' },
  'simulate-moved': { type: 'boolean' },
  now: { type: 'string' },
}

/** Ce que porte toute sortie, réussie ou non : l'exécution, la branche et les contrôles déjà passés */
const state = { runId: null, branch: null, tier: null, dryRun: false, deployOnly: false, checks: [] }
const payload = (extra = {}) => ({ ...state, ...extra })
let opts = null

runMain(async () => {
  try {
    opts = parseArgs(process.argv.slice(2), SPEC)
    Object.assign(state, { tier: opts.tier, dryRun: opts['dry-run'], deployOnly: opts['deploy-only'] })
    await main()
  } catch (e) {
    if (e instanceof VeilleError) throw new VeilleError(e.code, e.message, payload(e.extra))
    throw e
  }
})

async function main() {
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')}`)
  const root = rootFrom(opts)
  const tier = opts.tier
  const dryRun = opts['dry-run']
  // Une vraie publication passe ses portes horaires à l'horloge, avec les vrais outils et le vrai état local
  if (!dryRun && (opts.now || process.env.ISOLOIR_VEILLE_NOW)) fail(EXIT.USAGE, '--now / ISOLOIR_VEILLE_NOW : heure simulée réservée à --dry-run')
  if (!dryRun) {
    const hooks = TEST_HOOKS.filter(k => process.env[k])
    if (hooks.length && !isTestOrigin(root)) fail(EXIT.USAGE, `${hooks.join(', ')} : crochets d’essai, refusés pour une publication vers le vrai dépôt`)
  }
  applyFakeBin()
  const now = parseNow(opts.now)
  const childEnv = { ISOLOIR_VEILLE_ROOT: root }
  const tmp = mkdtempSync(join(tmpdir(), 'isoloir-ship-'))
  process.on('exit', () => rmSync(tmp, { recursive: true, force: true }))

  // ——— Départ ———
  const worktreeName = assertRunWorktree(root)
  const P = paths(root)
  const L = P.local
  if (!L) fail(EXIT.USAGE, 'état local introuvable (dépôt principal ou ISOLOIR_VEILLE_LOCAL)')
  const assertNotStopped = () => {
    if (existsSync(L.stop)) fail(EXIT.PAUSED, `STOP présent (${L.stop}) : rien ne se publie`)
    if (existsSync(L.pause)) fail(EXIT.PAUSED, `PAUSE présent (${L.pause}) : ${readFileSync(L.pause, 'utf8').split('\n')[0]}`)
    const p = loadPolicy(root)
    if (p.paused) fail(EXIT.PAUSED, `veille en pause (policy.json d’origin/main${p.pausedReason ? ` : ${p.pausedReason}` : ''})`)
    return p
  }
  const policy = assertNotStopped()

  const branch = currentBranch(root)
  state.branch = branch
  const bad = branchError(branch, tier) ?? worktreeBranchError(worktreeName, branch)
  if (bad) fail(EXIT.USAGE, bad)
  const runId = currentRunId(root) ?? runIdOfWorktree(root)
  state.runId = runId
  const runFile = join(L.runs, runId, 'run.json')
  const runRecord = readJson(runFile, null)
  if (!runRecord) fail(EXIT.USAGE, `aucune exécution en cours dans ce worktree (${runFile} absent : run.mjs start d’abord)`)
  if (runRecord.format !== 'isoloir-veille-run/1') fail(EXIT.USAGE, `${runFile} n’est pas un enregistrement d’exécution (format ${runRecord.format ?? 'absent'}) : on ne sait pas s’il s’agit d’un essai`)
  if (runRecord.essai && !dryRun) fail(EXIT.USAGE, 'exécution d’essai (run.json essai: true) : ship seulement avec --dry-run')
  // Seules les exécutions hebdomadaires et les accords publient (CONTRACT.md a.3)
  if (!dryRun && !['hebdo', 'accord'].includes(runRecord.kind)) fail(EXIT.USAGE, `exécution ${runRecord.kind ?? 'inconnue'} : elle ne publie pas (CONTRACT.md a.3), ship seulement avec --dry-run`)
  if ((runRecord.kind === 'accord') !== (tier === 'accord')) fail(EXIT.USAGE, `exécution ${runRecord.kind} au niveau ${tier} : le niveau accord va avec une exécution d’accord, et seulement elle`)
  if (!branchOfRun(branch, runRecord.branch)) fail(EXIT.USAGE, `branche ${branch} : ni celle de l’exécution (${runRecord.branch ?? 'aucune'}) ni l’une de ses reprises (-r<N>)`)
  const accordItem = tier === 'accord' ? accordItemOf(runId) : null
  if (tier === 'accord') {
    const errors = accordItemErrors(runId, readJson(L.pending, { items: [] })?.items ?? [])
    if (errors.length) fail(EXIT.USAGE, `accord : ${errors.join(' ; ')}`)
  }

  const port = opts.port ?? (tier === 'accord' ? policy.ship.accordPort : policy.ship.port)
  if (!Number.isInteger(port) || port < 1024 || port > 65535 || FORBIDDEN_PORTS.includes(port)) {
    fail(EXIT.USAGE, `--port ${port} : port réservé ou invalide (jamais ${FORBIDDEN_PORTS.join(', ')})`)
  }

  const g = makeGit(root)
  /** gate-time.mjs du worktree : { code, reason, out } (code 0 = passage permis) ; l'heure simulée seulement en --dry-run */
  const gate = step => {
    const script = join(root, 'tools', 'veille', 'gate-time.mjs')
    if (!existsSync(script)) fail(EXIT.CODE, `garde horaire introuvable (${script}) : rien ne se publie sans elle`)
    const simulated = dryRun && opts.now ? ['--now', opts.now] : []
    const r = run(process.execPath, [script, '--step', step, ...simulated], { cwd: root, env: { ...childEnv, ...(dryRun ? {} : { ISOLOIR_VEILLE_NOW: '' }) } })
    const out = lastJsonLine(r.stdout)
    if (r.code === 0) return { code: 0, out }
    const reason = `gate-time --step ${step} : ${out?.reason ?? (tail(r.stderr, 4).trim() || `code ${r.code}`)}`
    if ([EXIT.FROZEN, EXIT.SOFT_FROZEN, EXIT.ENDED, EXIT.PAUSED].includes(r.code)) return { code: r.code, reason, out }
    return fail(EXIT.CODE, `${reason} (code ${r.code} inattendu)`)
  }
  const startGate = gate('push')
  if (startGate.code) fail(startGate.code, startGate.reason, { gate: startGate.out })
  // Entre les deux tours (ou en essai), run.json dit « rapport » : la porte horaire a déjà répondu 12 s'il le fallait
  if (!dryRun && runRecord.mode !== 'publication') fail(EXIT.USAGE, `run.json mode ${runRecord.mode ?? 'absent'} : ship seulement avec --dry-run`)

  const dirty = g.status()
  if (dirty.length) fail(EXIT.USAGE, `arbre non propre (${touchedPaths(dirty).slice(0, 8).join(', ')}) : commit.mjs d’abord`)

  /**
   * Toujours la même exécution, et toujours permise ? Relu avant chaque contrôle, la fusion, le push et le déploiement,
   * dans ce processus (jamais sur la foi d'un sous-processus) : STOP, PAUSE, policy.paused (20) ; le verrou encore tenu
   * par ce worktree, battement compris (21) ; run.json toujours « en-cours » (21 : une autre exécution l'a repris).
   */
  const stillOurs = phase => {
    assertNotStopped()
    heartbeatLock(L.lock, { worktree: root, now: new Date(), phase: `ship : ${phase}` })
    const rec = readJson(runFile, null)
    if (rec?.status !== 'en-cours') fail(EXIT.LOCKED, `run.json de ${runId} au statut « ${rec?.status ?? 'absent'} » : cette exécution a été reprise ou close, rien ne se publie`)
  }

  // ——— Outils ———
  let tsCounter = 0
  const loadElectionAt = async ref => {
    const text = g.show(ref, `${S}/election.ts`)
    if (text == null) return null
    const file = join(tmp, `election-${++tsCounter}.ts`)
    writeFileSync(file, text)
    try {
      return (await import(pathToFileURL(file).href)).election ?? null
    } catch (e) {
      return fail(EXIT.CODE, `election.ts (${ref}) ne se charge pas : ${e.message}`)
    }
  }
  const jsonAt = (ref, path) => {
    const text = g.show(ref, path)
    if (text == null) return null
    try {
      return JSON.parse(text)
    } catch (e) {
      return fail(EXIT.CODE, `${path} (${ref}) : JSON illisible (${e.message})`)
    }
  }
  const readDist = () => {
    const file = join(root, 'dist', 'index.html')
    if (!existsSync(file)) return null
    const html = readFileSync(file, 'utf8')
    return { html, sha1: createHash('sha1').update(html).digest('hex'), indexAsset: indexAssetOf(html), assets: referencedAssets(html) }
  }
  const writeLastShip = fields => {
    const rec = lastShipRecord({ runId, branch, at: isoInParis(now), ...fields })
    const errors = validate(SCHEMAS.LAST_SHIP, rec)
    if (errors.length) process.stderr.write(`last-ship.json non conforme : ${errors.join(' ; ')}\n`)
    writeJson(L.lastShip, rec)
    return rec
  }

  /** Étapes 6 à 9 : garde horaire du déploiement, vercel, contrôle de la production, last-ship.json */
  const deploy = async ({ sha, tree, dist, dataVersion, pushed = false, lastShip: pushedRecord = null }) => {
    const base = { sha, tree, dataVersion, indexAsset: dist.indexAsset, distIndexSha1: dist.sha1 }
    const command = deployCommandText(root, policy)
    const deployGate = gate('deploy')
    if (deployGate.code) {
      const lastShip = dryRun ? null : writeLastShip({ ...base, deployed: false, checked: false })
      fail(deployGate.code, `${dryRun ? '' : 'poussé, non déployé : '}${deployGate.reason}`, { merge: sha, pushed: !dryRun && !opts['deploy-only'], gate: deployGate.out, command, lastShip })
    }
    if (dryRun) {
      exit(EXIT.OK, payload({
        merge: sha, tree, indexAsset: dist.indexAsset,
        commands: [
          ...(opts['deploy-only'] ? [] : [`git push -q origin ${sha}:refs/heads/main`]),
          `node ${join(root, 'tools', 'veille', 'gate-time.mjs')} --step deploy`,
          command,
          `curl -s -A IsoloirBot/1.0 "${policy.ship.prodUrl}?v=<horodatage>"`,
        ],
      }))
    }
    try {
      stillOurs('déploiement')
    } catch (e) {
      if (e instanceof VeilleError) e.extra = { ...e.extra, merge: sha, pushed, command, lastShip: pushedRecord ?? readJson(L.lastShip, null) }
      throw e
    }
    process.stderr.write(`ship : vercel ${deployArgs(policy).join(' ')}\n`)
    const v = run('vercel', deployArgs(policy), { cwd: root, timeoutMs: DEPLOY_TIMEOUT_MS })
    const deployUrl = deployUrlOf(v.stdout)
    if (v.code !== 0) {
      const lastShip = writeLastShip({ ...base, deployed: false, checked: false, deployUrl })
      fail(EXIT.DEPLOY, `vercel deploy a échoué (code ${v.code}) : ${tail(`${v.stdout}\n${v.stderr}`.trim(), 6)}`, { merge: sha, pushed, command, lastShip })
    }
    const check = await prodCheck({
      runner: run, cwd: root, prodUrl: policy.ship.prodUrl, indexAsset: dist.indexAsset, assets: dist.assets,
      attempts: policy.ship.checkAttempts, delayMs: policy.ship.checkDelaySeconds * 1000,
    })
    if (!check.ok) {
      const lastShip = writeLastShip({ ...base, deployed: true, checked: false, deployUrl })
      writeText(L.pause, pauseText({ at: isoInParis(now), runId, sha, indexAsset: dist.indexAsset, tries: check.tries, root, policy, pauseFile: L.pause }))
      fail(EXIT.PROD, `la production ne sert pas ${dist.indexAsset} après ${check.tries.length} essai(s) : PAUSE créée, aucun retour arrière automatique`, {
        merge: sha, pushed, deployUrl, prod: check.tries, command, pause: L.pause, lastShip,
      })
    }
    const lastShip = writeLastShip({ ...base, deployed: true, checked: true, deployUrl })
    exit(EXIT.OK, payload({ merge: sha, tree, indexAsset: dist.indexAsset, deployUrl, prod: check.tries, pushed, lastShip }))
  }

  // ——— --deploy-only : le commit est déjà sur main ———
  if (opts['deploy-only']) {
    const headTree = g.tree('HEAD')
    g.fetch()
    if (opts['simulate-moved']) fail(EXIT.MOVED, 'origin/main a bougé (simulation : --simulate-moved)', { simulated: true })
    const originTree = g.tree('origin/main')
    if (originTree !== headTree) fail(EXIT.MOVED, `origin/main (arbre ${short(originTree)}) n’a pas l’arbre de HEAD (${short(headTree)}) : worktree neuf depuis origin/main d’abord`)
    const last = readJson(L.lastShip, null)
    if (!last) fail(EXIT.USAGE, `aucun ${L.lastShip} : --deploy-only ne sert qu’après un push non déployé (40, 41, gel)`)
    if (last.tree !== headTree) fail(EXIT.MOVED, `last-ship.json porte l’arbre ${short(last.tree)}, origin/main celui de ${short(headTree)} : une autre publication est passée, rien n’est redéployé`)
    const dist = readDist()
    if (!dist) fail(EXIT.USAGE, 'dist/index.html absent : pnpm build d’abord')
    const fingerprint = last.distIndexSha1 ? dist.sha1 === last.distIndexSha1 : dist.indexAsset === last.indexAsset
    if (!fingerprint || !dist.indexAsset) fail(EXIT.CODE, `dist/ n’est pas celui du commit poussé (${dist.indexAsset ?? 'aucun asset'} au lieu de ${last.indexAsset}) : pnpm build depuis cet arbre`)
    return deploy({ sha: g.sha('origin/main'), tree: headTree, dist, dataVersion: last.dataVersion, lastShip: last })
  }

  if (g.count('origin/main..HEAD') === 0) exit(EXIT.OK, payload({ empty: true, reason: 'rien à publier : HEAD est déjà dans origin/main' }))

  // ——— Garde de fichiers, sur la base qu'on retiendra jusqu'au push (guardBase) ———
  const guardBase = g.out(['merge-base', 'origin/main', 'HEAD'])
  {
    const names = g.diffNames('origin/main...HEAD')
    const outside = outsideTier(names, tier)
    if (outside.length) fail(EXIT.CODE, `garde de fichiers : hors des chemins du niveau ${tier} : ${outside.slice(0, 10).join(', ')}`, { outside })
    const mb = guardBase
    const has = p => names.includes(p)
    const errors = []
    const baseElection = has(`${S}/election.ts`) || tier === 'accord' ? await loadElectionAt(mb) : null
    const headElection = has(`${S}/election.ts`) || tier === 'accord' ? await loadElectionAt('HEAD') : null
    if (has(`${S}/election.ts`)) errors.push(...electionDiffErrors(baseElection, headElection, tier))
    if (has(`${D}/config.json`) && tier === 'auto') errors.push(...configDiffErrors(jsonAt(mb, `${D}/config.json`), jsonAt('HEAD', `${D}/config.json`), tier))
    if (tier === 'accord') {
      const media = g.text(['diff', '--name-status', '--no-renames', `${mb}..HEAD`, '--', `${S}/media`]).split('\n').filter(Boolean).map(l => {
        const [status, ...rest] = l.split('\t')
        return { status: status.slice(0, 1), path: rest.join('\t') }
      })
      errors.push(...accordDiffErrors({
        item: accordItem,
        base: { config: jsonAt(mb, `${D}/config.json`), election: baseElection, indexText: g.show(mb, 'src/elections/index.ts') },
        head: { config: jsonAt('HEAD', `${D}/config.json`), election: headElection, indexText: g.show('HEAD', 'src/elections/index.ts') },
        media,
      }))
    }
    if (has(`${D}/decisions.json`)) {
      errors.push(...decisionsErrors(jsonAt(mb, `${D}/decisions.json`), jsonAt('HEAD', `${D}/decisions.json`), { tier, baseBank: jsonAt(mb, `${D}/bank.json`) }))
    }
    if (has(`${D}/bank.json`)) errors.push(...bankApproachErrors(jsonAt('HEAD', `${D}/bank.json`)))
    for (const f of ['explainers.json', 'explainer-charts.json']) {
      if (has(`${D}/${f}`)) errors.push(...explainersErrors(jsonAt(mb, `${D}/${f}`), jsonAt('HEAD', `${D}/${f}`), f))
    }
    if (has(`${S}/transfer.ts`) && g.numstat(`${mb}..HEAD`, `${S}/transfer.ts`).some(x => x.deleted > 0)) errors.push('transfer.ts : des lignes ont été retirées ou changées (ajout seul)')
    if (has(FIXTURE)) errors.push(...preservesBase(jsonAt(mb, FIXTURE), jsonAt('HEAD', FIXTURE)).map(e => `transfer-slots : ${e}`))
    if (has(METHOD_COPY)) errors.push(...methodCopyDiffErrors(g.show(mb, METHOD_COPY), g.show('HEAD', METHOD_COPY)))
    if (has(`${D}/build.json`)) errors.push(...buildIncludeErrors(jsonAt(mb, `${D}/build.json`), jsonAt('HEAD', `${D}/build.json`)))
    if (errors.length) fail(EXIT.CODE, `garde de fichiers : ${errors.slice(0, 8).join(' ; ')}`, { guard: errors })
  }

  // ——— Contrôles, du moins cher au plus cher ———
  const vitestReport = join(tmp, 'vitest.json')
  const plan = checkPlan({ node: process.execPath, port, vitestReport })
  for (const [i, planned] of plan.entries()) {
    let step = planned
    if (step.id === 'e2e') {
      const free = await pickPort(port)
      if (!free) fail(EXIT.CODE, `aucun port libre pour l’e2e (${port}, 4373, 4375)`, { failedCheck: 'e2e' })
      step = checkPlan({ node: process.execPath, port: free, vitestReport }).find(s => s.id === 'e2e')
    }
    stillOurs(step.label)
    process.stderr.write(`ship : contrôle ${i + 1}/${plan.length}, ${step.label}…\n`)
    const t0 = Date.now()
    if (step.id === 'vitest') rmSync(vitestReport, { force: true })
    const r = run(step.cmd, step.args, { cwd: root, env: step.id === 'build' ? childEnv : undefined, timeoutMs: CHECK_TIMEOUT_MS })
    if (step.id === 'vitest') {
      try {
        r.report = readJson(vitestReport, null)
      } catch {
        r.report = null
      }
    }
    const failure = step.map(r)
    state.checks.push({ id: step.id, code: failure?.code ?? 0, seconds: Math.round((Date.now() - t0) / 1000) })
    if (failure) {
      fail(failure.code, failure.reason, {
        failedCheck: step.id,
        ...(failure.code === EXIT.DATA ? { bundles: failure.bundles ?? [] } : {}),
        ...(failure.failedTests ? { failedTests: failure.failedTests } : {}),
      })
    }
    if (step.id === 'primary' && g.raw(['diff', '--quiet', '--', ...PRIMARY_DIFF]).code !== 0) {
      fail(EXIT.CODE, `la primaire ne se reconstruit pas à l’identique (${PRIMARY_DIFF.join(', ')})`, { failedCheck: step.id })
    }
    const after = g.status()
    if (after.length) {
      const what = step.id === 'build' ? 'reconstruction des fichiers générés : diff non vide' : `« ${step.label} » a modifié le dépôt`
      fail(EXIT.CODE, `${what} (${touchedPaths(after).slice(0, 10).join(', ')})`, { failedCheck: step.id })
    }
  }
  const dist = readDist()
  if (!dist?.indexAsset) fail(EXIT.CODE, 'dist/index.html absent ou sans asset assets/index-*.js après pnpm build')

  // ——— Fusion ———
  stillOurs('fusion')
  g.fetch()
  if (opts['simulate-moved']) fail(EXIT.MOVED, 'origin/main a bougé (simulation : --simulate-moved)', { simulated: true })
  const base = g.sha('origin/main')
  // La garde a contrôlé guardBase..HEAD : un origin/main réécrit (retour arrière forcé) ou avancé n'est plus cette base
  if (base !== guardBase) fail(EXIT.MOVED, `origin/main (${short(base)}) n’est plus la base contrôlée par la garde (${short(guardBase)}) : main a bougé ou a été réécrit ; rederive depuis l’origin/main courant`, { base, guardBase })
  if (!g.isAncestor(base, 'HEAD')) fail(EXIT.MOVED, `origin/main (${short(base)}) a bougé : il n’est plus ancêtre de HEAD ; rederive depuis l’origin/main courant`, { base })
  const head = g.sha('HEAD')
  const headTree = g.tree('HEAD')
  const msgFile = join(tmp, 'fusion.txt')
  writeText(msgFile, mergeMessage(branch))
  const merge = g.out(['commit-tree', headTree, '-p', base, '-p', head, '-F', msgFile])
  const mergeProblems = mergeErrors({ mergeTree: g.tree(merge), headTree, parents: g.parents(merge), base, head })
  if (mergeProblems.length) fail(EXIT.CODE, `fusion refusée : ${mergeProblems.join(' ; ')}`, { merge })
  state.merge = merge
  state.base = base
  state.head = head
  const dataVersion = (await loadElectionAt('HEAD'))?.dataVersion ?? 'inconnue'

  // La seconde garde horaire, juste avant le push : les contrôles ont pu durer des heures
  const pushGate = gate('push')
  if (pushGate.code) fail(pushGate.code, `${pushGate.reason} (après les contrôles, avant le push)`, { gate: pushGate.out })
  if (dryRun) return deploy({ sha: merge, tree: headTree, dist, dataVersion })

  stillOurs('push')
  const pushed = g.raw(pushArgs(merge))
  if (pushed.code !== 0) {
    const why = tail(pushed.stderr, 6).trim()
    if (pushRejected(pushed.stderr)) fail(EXIT.MOVED, `push refusé par origin (main a bougé pendant les contrôles) : ${why}`, { merge })
    fail(EXIT.CODE, `git push a échoué : ${why || `code ${pushed.code}`}`, { merge })
  }
  // Le push a réussi : la trace d'abord (deployed: false), pour qu'un arrêt brutal d'ici au déploiement se reprenne
  const pushedRecord = writeLastShip({ sha: merge, tree: headTree, dataVersion, indexAsset: dist.indexAsset, distIndexSha1: dist.sha1, deployed: false, checked: false })
  try {
    g.fetch()
    const published = g.sha('origin/main')
    if (published !== merge) {
      fail(EXIT.CODE, `après le push, origin/main vaut ${short(published)} et non la fusion ${short(merge)} : une autre session a poussé ; rien n’est déployé`, { merge, pushed: true, lastShip: pushedRecord })
    }
    return await deploy({ sha: merge, tree: headTree, dist, dataVersion, pushed: true, lastShip: pushedRecord })
  } catch (e) {
    if (e instanceof VeilleError) e.extra = { merge, pushed: true, lastShip: pushedRecord, ...e.extra }
    throw e
  }
}
