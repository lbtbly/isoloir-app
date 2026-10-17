// Classement de la veille des candidats (contrat : tools/veille/CONTRACT.md §d.6) : applique EN CODE la règle de seuil
// d'un nouveau candidat (lib/classify.mjs) à la valeur de retour du workflow 8, gardée par persist.mjs dans
// <état local>/runs/<runId>/watch.json. Qualifiant : déclaration sans condition (agent ET vérificateur), parti
// comptant au moins un député, un sénateur ou un député européen élu en France (policy.mepCountsAsNational,
// interprétation à confirmer) ou fonction nationale actuelle ou passée (agent ET vérificateur), vérificateur adverse
// « confirmed », 2 sources de 2 éditeurs dont une primaire, ni dans config, ni en attente, ni refusé. Retrait :
// vérificateur « confirmed », 2 sources dont une primaire. Tout le reste : « à surveiller », avec sa raison.
//
// Usage : node <WT>/tools/veille/classify.mjs <watch-result.json> [--dry-run] [--now ISO] [--root <abs>]
//   <watch-result.json>  WATCH_RESULT (validé : 30 s'il n'est pas conforme)
//   --dry-run            rien n'est écrit ; sinon les « à surveiller » sont fondus dans <état local>/watch.json
//   --now                instant simulé (jour de Paris des plafonds de préparations) ; sinon le today du résultat
// Lit research/presidentielle-2027/config.json, election.ts (hidden), veille/state.json (watch, refused), veille/policy.json
// et <état local>/pending.json. Sortie : une ligne JSON, CLASSIFY_RESULT (qualifying, deferred, withdrawals,
// redeclarations, conditions, official, watch, unchanged, stillDeclaredFalse) plus watchNew (clés vues pour la
// première fois) et log ; rangée dans runs/<runId>/classify.json. Codes : 0, 2, 30, 31.
// Il faut Node 22.18+ (TypeScript sans compilation).

import { SCHEMAS, validate } from './schemas.mjs'
import { EXIT, exit, fail, loadElection, parseArgs, parseNow, paths, readJson, rootFrom, runMain, todayInParis, writeJson, assertNotMainFolder } from './lib/common.mjs'
import { classifyWatch } from './lib/classify.mjs'
import { listPending, loadPolicy, loadState, mergeWatchEntries } from './lib/state.mjs'

runMain(async () => {
  const o = parseArgs(process.argv.slice(2), { 'dry-run': { type: 'boolean' }, now: { type: 'string' }, root: { type: 'string' } })
  const file = o._[0]
  if (!file || o._.length > 1) fail(EXIT.USAGE, 'usage : classify.mjs <watch-result.json> [--dry-run] [--now ISO]')
  const root = rootFrom(o)
  const P = paths(root)
  const L = P.local
  if (!L) fail(EXIT.USAGE, `état local introuvable depuis ${root}`)
  let result
  try {
    result = readJson(file)
  } catch (e) {
    fail(EXIT.DATA, `${file} : ${e.message}`, { bundles: [] })
  }
  const errors = validate(SCHEMAS.WATCH_RESULT, result)
  if (errors.length) fail(EXIT.DATA, `WATCH_RESULT non conforme : ${errors.slice(0, 10).join(' ; ')}`, { bundles: [], errors: errors.slice(0, 10) })
  const config = readJson(P.config)
  const election = await loadElection(root)
  const state = loadState(root)
  const policy = loadPolicy(root)
  const today = o.now ? todayInParis(parseNow(o.now)) : result.today
  const local = readJson(L.watch, { format: 'isoloir-veille-watch-local/1', entries: [] })
  const out = classifyWatch(result, { config, election, state, pending: listPending(L.dir), localWatch: local.entries ?? [], policy, today })
  const { watchNew, log, ...core } = out
  const check = validate(SCHEMAS.CLASSIFY_RESULT, core)
  if (check.length) fail(EXIT.CODE, `classement non conforme : ${check.slice(0, 10).join(' ; ')}`)
  let written = null
  if (!o['dry-run'] && out.watch.length) {
    assertNotMainFolder(root)
    writeJson(L.watch, { format: 'isoloir-veille-watch-local/1', entries: mergeWatchEntries(local.entries ?? [], out.watch) })
    written = L.watch
  }
  for (const line of log) process.stderr.write(`${line}\n`)
  exit(EXIT.OK, { ...core, watchNew, log, today, mepCountsAsNational: policy.mepCountsAsNational, written }, { root })
})
