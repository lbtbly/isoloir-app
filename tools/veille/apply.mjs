// Application des changements de la veille automatique d'Isoloir (constructeur B7 ; contrat : tools/veille/CONTRACT.md
// §c.4, §c.7, §c.8, §d.7, annexe A1). Forme 1 : un CHANGESET (les valeurs de retour du workflow 9, rangées par
// persist.mjs) devient des entrées de research/presidentielle-2027/decisions.json, selon les règles de publication du
// plan approuvé (publié, retenu pour le propriétaire, écarté), avec un registre idempotent (veille/ledger.json, clé
// claimKey = sha1 du candidat, de la date, du type, de la question, de l'approche, du poids, du rejet et des sources).
// Forme 2 : l'acceptation déterministe d'une nouvelle question (extension fusionnée par merge-expansion --no-gapfills).
// Aucun appel au réseau ni à une IA ; ne lance ni build-pack ni git.
//
// Usage :
//   node <WT>/tools/veille/apply.mjs <changeset.json> [--dry-run] [--hold <paquet>…] [--approve <H-…>…] [--only <H-…>…]
//   node <WT>/tools/veille/apply.mjs --question <D/expansion-merged-N.json> [--dry-run]
//   Options communes : --root <abs> (tests ; par défaut le checkout du script), --now <ISO avec fuseau> (heure simulée).
//   --hold     : paquets retenus en plus de changeset.holds (« candidat:<id> », « approche:<question> », « cle:<claimKey> »)
//   --approve  : retenus approuvés par le propriétaire (« OK H-… ») en plus de changeset.approve : ils passent outre leur
//                raison, sauf verrou, avant mal lu et état final invalide ; toutes les autres règles restent
//   --only     : seuls ces retenus sont examinés (accord d'un retenu ; ils valent accord), le reste est ignoré
//   --dry-run  : tout est calculé et imprimé, rien n'est écrit (ni decisions.json, ni registre, ni état, ni attentes)
//
// Forme 1, lit : D/bank.json (vérité du « before »), D/decisions.json, D/config.json, S/election.ts (hidden,
// ranking.excluded, spectrum), S/candidates.ts (noms et nuances, lus comme du texte), D/positions-history.json
// (libellés des approches), V/policy.json et V/locks.json (lus à origin/main : fichiers de contrôle du propriétaire,
// jamais la copie de l'arbre de travail), V/ledger.json, V/state.json, L/pending.json, L/watch.json.
// Écrit (sauf --dry-run) : D/decisions.json (même mise en forme, entrées remplacées à leur place ou ajoutées en fin,
// clé « veille » {runId, claimKey, at}), V/ledger.json (clés triées), V/state.json (checkedAt, rotation, « à surveiller »,
// refusés, lastRuns, par lib/state.mjs de B6), L/runs/<runId>/apply-report.json et V/runs/<runId>/apply-report.json, et
// une attente par retenu (« OK H-… ») ou par réintégration (« OK I-<id> ») dans L/pending.json.
// Sortie : l'APPLY_REPORT complet (une ligne JSON). Une application répétée du même changeset ne change rien.
//
// Forme 2, accepte la question neuve seulement si toutes les conditions du contrat (§d.7) tiennent ; écrit alors
// D/build.json (extension en fin de « expansions »), S/transfer.ts (« '<q>': <max+1>, » en fin de table, ajout seul),
// tests/fixtures/transfer-slots-presidentielle-2027.json (même paire) et V/ledger.json (questions). Sortie 0 dans les
// deux cas : {accepted, reasons[], questionId, slot, files}.
//
// Codes : 0 ; 2 (appel mal formé, dossier principal du dépôt, état local introuvable) ; 30 (changeset, registre,
// verrous ou extension illisibles ou non conformes ; bundles []) ; 31 (forme inattendue d'un fichier, erreur inattendue).
// Il faut Node 22.18+ (lit du TypeScript sans compilation).

import { existsSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import {
  CONTROL_FILES, EXIT, assertNotMainFolder, canonical, currentRunId, exit, fail, isoInParis, loadElection, parseArgs, parseNow,
  paths, readControlJson, readJson, rootFrom, runMain, stableJson, todayInParis, writeJson, writeText,
} from './lib/common.mjs'
import { acceptQuestion, applyChangeset, parseCandidatesTs, serializeLike } from './lib/apply.mjs'
import { SCHEMAS, validate } from './schemas.mjs'

const dataFail = (reason, extra = {}) => fail(EXIT.DATA, reason, { bundles: [], ...extra })
function readJsonOr30(file, what, fallback) {
  try {
    return arguments.length > 2 ? readJson(file, fallback) : readJson(file)
  } catch (e) {
    return dataFail(`${what} illisible : ${e.message}`)
  }
}
const relFrom = (root, file) => relative(root, file).split('\\').join('/')
/** Fichier de contrôle du propriétaire, lu à origin/main (readControlJson) ; illisible : 30 */
function controlOr30(root, rel, what, fallback) {
  try {
    return readControlJson(root, rel, fallback)
  } catch (e) {
    return dataFail(`${what} illisible : ${e.message}`)
  }
}

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    'dry-run': { type: 'boolean' },
    hold: { type: 'list' },
    approve: { type: 'list' },
    only: { type: 'list' },
    question: { type: 'string' },
    root: { type: 'string' },
    now: { type: 'string' },
  })
  const root = rootFrom(opts)
  const P = paths(root)
  const now = parseNow(opts.now)
  const dryRun = opts['dry-run']
  for (const h of opts.hold) if (!/^(candidat|approche|question|cle):[a-z0-9_-]+$/.test(h)) fail(EXIT.USAGE, `--hold : paquet « ${h} » hors de candidat:|approche:|question:|cle:`)
  for (const h of [...opts.approve, ...opts.only]) if (!/^H-\d{4}-\d{2}-\d{2}-\d+$/.test(h)) fail(EXIT.USAGE, `« ${h} » : identifiant de retenu H-AAAA-MM-JJ-<n> attendu`)
  if (opts.question !== undefined) {
    if (opts._.length || opts.hold.length || opts.approve.length || opts.only.length) fail(EXIT.USAGE, '--question se lance seul (avec --dry-run au plus)')
    return questionForm({ root, P, now, dryRun, file: resolve(root, opts.question) })
  }
  if (opts._.length !== 1) fail(EXIT.USAGE, 'usage : apply.mjs <changeset.json> [--dry-run] [--hold …] [--approve …] [--only …]')
  return changesetForm({ root, P, now, dryRun, opts, file: resolve(opts._[0]) })
})

/** Ce que lisent les deux formes */
async function common(root, P) {
  const bankJson = readJsonOr30(P.bank, 'bank.json')
  const config = readJsonOr30(P.config, 'config.json')
  let election
  try {
    election = await loadElection(root)
  } catch (e) {
    fail(EXIT.CODE, `election.ts ne se charge pas : ${e.message}`)
  }
  const candFile = join(P.src, 'candidates.ts')
  const candidates = existsSync(candFile) ? parseCandidatesTs(readFileSync(candFile, 'utf8')) : []
  const history = readJsonOr30(P.history, 'positions-history.json', null)
  const policy = controlOr30(root, CONTROL_FILES.policy, 'policy.json', {})
  const ledger = readJsonOr30(P.ledger, 'ledger.json', null)
  if (ledger) {
    const errors = validate(SCHEMAS.LEDGER, ledger)
    if (errors.length) dataFail(`ledger.json non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  }
  return { bankJson, config, election, candidates, history, policy, ledger }
}

async function changesetForm({ root, P, now, dryRun, opts, file }) {
  const changeset = readJsonOr30(file, 'changeset')
  const errors = validate(SCHEMAS.CHANGESET, changeset)
  if (errors.length) dataFail(`changeset non conforme : ${errors.slice(0, 10).join(' ; ')}`)
  const { bankJson, config, election, candidates, history, policy, ledger } = await common(root, P)
  const decisionsText = existsSync(P.decisions) ? readFileSync(P.decisions, 'utf8') : '{}'
  let decisions
  try {
    decisions = JSON.parse(decisionsText)
  } catch (e) {
    dataFail(`decisions.json illisible : ${e.message}`)
  }
  const locks = controlOr30(root, CONTROL_FILES.locks, 'locks.json', { format: 'isoloir-veille-locks/1', locks: [] })
  const lockErrors = validate(SCHEMAS.LOCKS, locks)
  if (lockErrors.length) dataFail(`locks.json non conforme : ${lockErrors.slice(0, 10).join(' ; ')}`)

  // État et attentes : lib/state.mjs (B6), chargé ici seulement (les bibliothèques ne s'importent pas d'un constructeur à l'autre)
  let S
  try {
    S = await import('./lib/state.mjs')
  } catch (e) {
    fail(EXIT.CODE, `lib/state.mjs introuvable ou en erreur : ${e.message}`)
  }
  const L = P.local
  if (!L && !dryRun) fail(EXIT.USAGE, 'état local introuvable (hors de git : ISOLOIR_VEILLE_LOCAL)')
  const pending = L ? S.listPending(L.dir, {}) : []
  const localWatch = L ? readJsonOr30(L.watch, 'watch.json local', { entries: [] }).entries ?? [] : []
  const state = existsSync(P.state) ? S.loadState(root) : null

  const out = applyChangeset({
    changeset, bankJson, decisions, config, election, candidates, history, policy, locks, ledger, state, pending, localWatch,
    holds: opts.hold, approve: opts.approve, only: opts.only, today: changeset.today, now: isoInParis(now), dryRun,
    stateOps: S,
  })
  const report = out.report
  const reportErrors = validate(SCHEMAS.APPLY_REPORT, report)
  if (reportErrors.length) fail(EXIT.CODE, `APPLY_REPORT non conforme : ${reportErrors.slice(0, 10).join(' ; ')}`)
  const ledgerErrors = validate(SCHEMAS.LEDGER, out.ledger)
  if (ledgerErrors.length) fail(EXIT.CODE, `registre non conforme : ${ledgerErrors.slice(0, 10).join(' ; ')}`)

  if (!dryRun) {
    assertNotMainFolder(root)
    const files = []
    const write = (f, text, previous) => {
      if (previous === text) return
      writeText(f, text)
      files.push(relFrom(root, f))
    }
    if (out.decisionsChanged) write(P.decisions, serializeLike(decisionsText, out.decisions), decisionsText)
    const ledgerText = stableJson(out.ledger, { sortKeys: true })
    const ledgerBefore = existsSync(P.ledger) ? readFileSync(P.ledger, 'utf8') : null
    if (ledgerBefore !== null || Object.keys(out.ledger.claims).length || out.ledger.approaches.length) write(P.ledger, ledgerText, ledgerBefore)
    if (out.state && canonical(out.state) !== canonical(state)) {
      S.saveState(root, out.state)
      files.push(relFrom(root, P.state))
    }
    for (const item of out.pending) S.addPending(L.dir, item)
    const committed = join(P.committedRun(report.runId), 'apply-report.json')
    files.push(relFrom(root, committed))
    report.files = files
    writeJson(committed, report)
    writeJson(join(L.run(report.runId), 'apply-report.json'), report)
  }
  for (const h of report.held) process.stderr.write(`retenu ${h.id} (${h.reason}) : ${h.change.candidateId} ${h.change.approachId ?? h.change.questionId}\n`)
  process.stderr.write(`apply : ${report.counts.published} publiés, ${report.counts.held} retenus, ${report.counts.dropped} écartés${dryRun ? ' (essai, rien écrit)' : ''}\n`)
  // Un essai se range à part (apply-essai.json) : il n'écrase jamais la trace d'une vraie application
  exit(EXIT.OK, report, { root, ...(dryRun ? { tag: 'essai' } : {}) })
}

async function questionForm({ root, P, now, dryRun, file }) {
  const merged = readJsonOr30(file, 'extension fusionnée')
  const { bankJson, config, election, candidates, history, policy, ledger } = await common(root, P)
  const buildText = existsSync(P.build) ? readFileSync(P.build, 'utf8') : null
  if (buildText === null) dataFail('build.json introuvable')
  let build
  try {
    build = JSON.parse(buildText)
  } catch (e) {
    dataFail(`build.json illisible : ${e.message}`)
  }
  const transferText = readFileSync(P.transfer, 'utf8')
  const fixtureText = readFileSync(P.transferFixture, 'utf8')
  const fixture = JSON.parse(fixtureText)
  const today = todayInParis(now)
  const runId = currentRunId(root) ?? 'hors-exécution'
  const r = acceptQuestion({
    merged, mergedPath: relFrom(root, file), bankJson, config, election, candidates, policy, build, transferText, fixture,
    ledger, history, today, runId,
  })
  const files = []
  if (r.accepted && !dryRun) {
    assertNotMainFolder(root)
    const buildErrors = validate(SCHEMAS.BUILD_CONFIG, r.build)
    if (buildErrors.length) fail(EXIT.CODE, `build.json deviendrait non conforme : ${buildErrors.join(' ; ')}`)
    writeText(P.build, serializeLike(buildText, r.build))
    writeText(P.transfer, r.transferText)
    writeText(P.transferFixture, serializeLike(fixtureText, r.fixture))
    writeJson(P.ledger, r.ledger, { sortKeys: true })
    files.push(...[P.build, P.transfer, P.transferFixture, P.ledger].map(f => relFrom(root, f)))
  }
  process.stderr.write(r.accepted ? `question ${r.questionId} acceptée, numéro ${r.slot}${dryRun ? ' (essai, rien écrit)' : ''}\n` : `question refusée : ${r.reasons.join(' ; ')}\n`)
  exit(EXIT.OK, { accepted: r.accepted, reasons: r.reasons, questionId: r.questionId, slot: r.slot, files }, { root, tag: dryRun ? 'question-essai' : 'question' })
}
