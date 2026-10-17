// Validation (git commit) d'une exécution de la veille automatique (contrat : tools/veille/CONTRACT.md §d.10) : sur la
// branche veille/* ou accord/* du worktree de l'exécution, il ajoute SEULEMENT les chemins permis par le niveau, puis
// valide avec le message français donné, terminé par la ligne Co-Authored-By. Un fichier modifié, effacé, renommé ou
// non suivi hors de ces chemins arrête tout, avant le moindre « git add » (garde de fichiers) : la veille ne publie que
// des données, jamais du code ni des tests.
//
// Usage : node <WT>/tools/veille/commit.mjs --message-file <f> [--tier auto|accord] [--dry-run] [--root <abs>]
//   --message-file  le message, en français ; la ligne « Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com> »
//                   est ajoutée à la fin si elle manque (jamais en double)
//   --tier          auto (par défaut) : research/presidentielle-2027/**, src/elections/presidentielle-2027/{bank,
//                   positions,videos,election,transfer}.ts, src/core/echiquierMethodCopy.ts,
//                   tests/fixtures/transfer-slots-presidentielle-2027.json ;
//                   accord : en plus src/elections/presidentielle-2027/candidates.ts, src/elections/presidentielle-2027/
//                   media/** et src/elections/index.ts, sur une branche accord/* seulement (accord du propriétaire)
//   --dry-run       la garde et la liste des fichiers, sans rien ajouter ni valider
// Jamais, à aucun niveau : les fichiers de contrôle du propriétaire (research/presidentielle-2027/{VEILLE.md,
// PIPELINE.md, veille/policy.json, veille/locks.json, veille/d5-baseline.json}, CONTROL_PATHS de lib/git.mjs).
// Refus : une exécution quotidienne (elle ne valide rien) ; un worktree veille-* sur une branche accord/*, ou l'inverse ;
// au niveau accord, une exécution dont l'attente (runId accord-<id>-<date>) n'est pas « accordé » dans pending.json.
// Sortie (une ligne JSON) : { sha, files, tier, branch } ; rien à valider : { sha: null, empty: true, files: [] }.
// Codes : 0 ; 2 (pas un worktree d'exécution, mauvaise branche, exécution quotidienne, accord absent, message absent ou
// vide) ; 31 (fichier hors des chemins du niveau, git en échec).

import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EXIT, assertRunWorktree, currentBranch, currentRunId, exit, fail, parseArgs, paths, readJson, rootFrom, runIdOfWorktree, runMain, writeText } from './lib/common.mjs'
import { accordItemErrors, branchError, makeGit, outsideTier, touchedPaths, withCoAuthor, worktreeBranchError } from './lib/git.mjs'

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    root: { type: 'string' },
    'message-file': { type: 'string', required: true },
    tier: { type: 'string', choices: ['auto', 'accord'], default: 'auto' },
    'dry-run': { type: 'boolean' },
  })
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')}`)
  const root = rootFrom(opts)
  const tier = opts.tier
  const name = assertRunWorktree(root)
  const branch = currentBranch(root)
  const bad = branchError(branch, tier) ?? worktreeBranchError(name, branch)
  if (bad) fail(EXIT.USAGE, bad)
  const runId = currentRunId(root) ?? runIdOfWorktree(root)
  const L = paths(root).local
  const runRecord = L ? readJson(join(L.runs, runId, 'run.json'), null) : null
  // L'exécution quotidienne ne valide ni ne pousse jamais rien (CONTRACT.md a.3)
  if (runRecord?.kind === 'quotidien' || /^\d{4}-\d{2}-\d{2}-quotidien(-|$)/.test(runId)) fail(EXIT.USAGE, `exécution quotidienne ${runId} : elle ne valide rien (CONTRACT.md a.3)`)
  if (tier === 'accord') {
    const errors = accordItemErrors(runId, L ? readJson(L.pending, { items: [] })?.items ?? [] : [])
    if (errors.length) fail(EXIT.USAGE, `accord : ${errors.join(' ; ')}`)
  }
  const msgPath = opts['message-file']
  if (!existsSync(msgPath)) fail(EXIT.USAGE, `--message-file : ${msgPath} introuvable`)
  const message = withCoAuthor(readFileSync(msgPath, 'utf8'))

  const g = makeGit(root)
  const entries = g.status()
  const outside = outsideTier(entries, tier)
  if (outside.length) {
    fail(EXIT.CODE, `garde de fichiers : ${outside.length} fichier(s) hors des chemins du niveau ${tier}, rien n’est validé : ${outside.slice(0, 10).join(', ')}`, {
      runId, branch, tier, outside,
    })
  }
  const files = touchedPaths(entries)
  if (!files.length) exit(EXIT.OK, { runId, sha: null, empty: true, files: [], tier, branch })
  if (opts['dry-run']) exit(EXIT.OK, { runId, dryRun: true, sha: null, files, tier, branch })

  // Chemins pris à la lettre (aucun motif), effacements compris ; puis contrôle de l'index avant de valider
  const literal = { GIT_LITERAL_PATHSPECS: '1' }
  g.out(['add', '-A', '--pathspec-from-file=-', '--pathspec-file-nul'], { env: literal, input: files.join('\0') })
  const staged = g.stagedNames()
  const strays = outsideTier(staged, tier)
  if (strays.length) {
    g.raw(['reset', '-q', '--', ...strays], { env: literal })
    fail(EXIT.CODE, `garde de fichiers : l’index porte des fichiers hors du niveau ${tier} : ${strays.slice(0, 10).join(', ')}`, { runId, branch, tier, outside: strays })
  }
  if (!staged.length) exit(EXIT.OK, { runId, sha: null, empty: true, files: [], tier, branch })

  const tmp = mkdtempSync(join(tmpdir(), 'isoloir-commit-'))
  try {
    const msgFile = join(tmp, 'message.txt')
    writeText(msgFile, message)
    g.out(['commit', '-q', '-F', msgFile])
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
  exit(EXIT.OK, { runId, sha: g.sha('HEAD'), files: staged, tier, branch })
})
