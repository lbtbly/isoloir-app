// BUILD canonique de la présidentielle (veille automatique ; contrat : tools/veille/CONTRACT.md, §c.10 BUILD_CONFIG et
// §d.2) : la seule façon de reconstruire le pack. Les arguments de tools/build-pack.mjs ne s'écrivent plus à la main
// ni dans une commande copiée : ils viennent tous de research/presidentielle-2027/build.json (sortie du workflow 2,
// dossiers, extensions dans l'ordre, candidats à inclure). Une extension nouvelle s'ajoute à ce fichier (apply.mjs
// --question), si bien qu'aucune session ne peut la perdre en relançant une ancienne commande (PIPELINE.md, étape 0).
// Aucun appel au réseau ni à une IA.
//
// Usage : node <WT>/tools/veille/build.mjs [--no-history] [--dry-run] [--root <abs>]
//   --no-history : BUILD d'essai, rien n'est consigné dans positions-history.json (build-pack --no-history) et le
//                  contrôle de l'historique est sauté (historyCheck « skipped »).
//   --dry-run    : vérifie build.json et config.json comme pour un vrai BUILD, puis imprime la commande exacte
//                  ({command:[…], checks:[[…]…]}) sans rien lancer ni écrire.
//   --root       : la racine du dépôt (tests) ; par défaut le checkout qui contient ce script, jamais le dossier
//                  courant. Toute option inconnue, tout argument et toute mention de --reset-revisions : sortie 2.
//
// Contrôles avant de lancer quoi que ce soit (sortie 30, bundles [], si l'un échoue) :
//   - build.json existe, se lit et suit BUILD_CONFIG (tools/veille/schemas.mjs) ;
//   - chaque identifiant de « include » est un candidat de config.json, et l'ensemble est exactement celui des
//     candidats pendingPrimary (masqués, gardés dans positions.ts : tests/hidden.test.ts) ;
//   - la sortie du workflow et chaque extension existent.
// Puis, depuis la racine (refus du dossier principal du dépôt : sortie 2) :
//   node tools/build-pack.mjs <workflowOutput> <researchDir> <srcDir> <expansions…> --include <include,…> [--no-history]
//   node tools/pipeline-helpers.mjs check-log <researchDir>
//   node tools/positions-history.mjs check <researchDir> <srcDir>        (sauf --no-history)
// La sortie de build-pack est recopiée sur stderr, pour suivre la construction.
//
// Sortie (une ligne JSON, lib/common.mjs) : {command, checkLog:{lost:[lignes], watch:[lignes]}, historyCheck:'ok'|
// 'skipped'} ; lost : les lignes « PERTE » de check-log (donnée perdue), watch : ses lignes « À VOIR ».
// Codes : 0 ; 2 (appel mal formé, dossier principal) ; 30 (build.json ou config refusés, échec de build-pack, perte au
// check-log, historique incohérent : la fin de leur sortie est dans « reason », bundles []) ; 31 (erreur inattendue).
// Il faut Node 22.18+ (build-pack importe du TypeScript).

import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ELECTION_ID, EXIT, assertNotMainFolder, exit, fail, parseArgs, readJson, rootFrom, runNode, runMain, tail } from './lib/common.mjs'
import { SCHEMAS, validate } from './schemas.mjs'

const D = `research/${ELECTION_ID}`
const dataFail = reason => fail(EXIT.DATA, reason, { bundles: [] })

/** build.json lu et vérifié (schéma, include = pendingPrimary de config.json, fichiers présents) ; sortie 30 sinon */
function loadBuildConfig(root) {
  const file = join(root, D, 'build.json')
  if (!existsSync(file)) dataFail(`${D}/build.json introuvable : c'est la seule source des arguments du BUILD`)
  let cfg
  try {
    cfg = readJson(file)
  } catch (e) {
    dataFail(e.message)
  }
  const errors = validate(SCHEMAS.BUILD_CONFIG, cfg)
  if (errors.length) dataFail(`${D}/build.json non conforme : ${errors.join(' ; ')}`)

  const configFile = join(root, D, 'config.json')
  let config
  try {
    config = readJson(configFile)
  } catch (e) {
    dataFail(e.message)
  }
  const candidates = Array.isArray(config?.candidates) ? config.candidates : []
  const ids = new Set(candidates.map(c => c.id))
  const absent = cfg.include.filter(id => !ids.has(id))
  if (absent.length) dataFail(`build.json, include : ${absent.join(', ')} absent${absent.length > 1 ? 's' : ''} de ${D}/config.json`)
  const pending = candidates.filter(c => c.pendingPrimary).map(c => c.id)
  const included = new Set(cfg.include)
  const notPending = cfg.include.filter(id => !pending.includes(id))
  const missing = pending.filter(id => !included.has(id))
  if (notPending.length || missing.length) {
    dataFail([
      'build.json, include : il faut exactement les candidats pendingPrimary de config.json',
      notPending.length ? `en trop (déjà publiés) : ${notPending.join(', ')}` : null,
      missing.length ? `manquants (ils sortiraient de positions.ts) : ${missing.join(', ')}` : null,
    ].filter(Boolean).join(' ; '))
  }

  const inputs = [cfg.workflowOutput, ...cfg.expansions]
  const gone = inputs.filter(f => !existsSync(join(root, f)))
  if (gone.length) dataFail(`fichier${gone.length > 1 ? 's' : ''} du BUILD introuvable${gone.length > 1 ? 's' : ''} : ${gone.join(', ')}`)
  return cfg
}

/** Les commandes du BUILD, chemins relatifs à la racine, « node » en tête (lancées avec le Node qui tourne) */
function planFor(cfg, { noHistory }) {
  const command = ['node', 'tools/build-pack.mjs', cfg.workflowOutput, cfg.researchDir, cfg.srcDir, ...cfg.expansions]
  if (cfg.include.length) command.push('--include', cfg.include.join(','))
  if (noHistory) command.push('--no-history')
  const checks = [['node', 'tools/pipeline-helpers.mjs', 'check-log', cfg.researchDir]]
  if (!noHistory) checks.push(['node', 'tools/positions-history.mjs', 'check', cfg.researchDir, cfg.srcDir])
  return { command, checks }
}

const launch = (argv, root, opts = {}) => runNode(argv[1], argv.slice(2), { cwd: root, ...opts })
const failure = (what, r) => `${what} a échoué (code ${r.code}${r.signal ? `, ${r.signal}` : ''}) :\n${tail(`${r.stdout}\n${r.stderr}`, 20)}`

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    'no-history': { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    root: { type: 'string' },
  })
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')} (build.mjs ne prend que --no-history, --dry-run et --root ; ses arguments sont dans ${D}/build.json)`)
  const root = rootFrom(opts)
  const cfg = loadBuildConfig(root)
  const { command, checks } = planFor(cfg, { noHistory: opts['no-history'] })
  if (opts['dry-run']) exit(EXIT.OK, { command, checks, root })

  assertNotMainFolder(root)

  const built = launch(command, root, { tee: true })
  if (built.code !== 0) dataFail(failure('build-pack', built))

  const log = launch(checks[0], root)
  const lines = log.stdout.split('\n')
  const lost = lines.filter(l => l.startsWith('PERTE ')).map(l => l.replace(/^PERTE\s+/, ''))
  const watch = lines.filter(l => l.startsWith('À VOIR ')).map(l => l.replace(/^À VOIR\s+/, ''))
  if (log.code !== 0) dataFail(lost.length ? `check-log : ${lost.length} perte(s) de donnée : ${lost.join(' | ')}` : failure('check-log', log))

  let historyCheck = 'skipped'
  if (checks[1]) {
    const h = launch(checks[1], root)
    if (h.code !== 0) dataFail(failure('positions-history check', h))
    historyCheck = 'ok'
  }
  exit(EXIT.OK, { command, checkLog: { lost, watch }, historyCheck })
})
