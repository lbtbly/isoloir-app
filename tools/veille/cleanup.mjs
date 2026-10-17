// Nettoyage des worktrees de la veille automatique (contrat : tools/veille/CONTRACT.md §d.14) : retire les worktrees
// <dépôt principal>/.claude/worktrees/veille-<runId> de plus de policy.cleanupDays (14) jours (date du runId) qui ne sont
// ni le courant, ni tenus par le verrou, ni cités par une attente « attente », ni parmi les 3 dernières exécutions en
// échec ; puis « git worktree prune » ; puis efface les branches locales veille/* ancêtres d'origin/main (aucun commit
// perdu), qui ne sont ni extraites dans un worktree ni citées par une attente. Ne touche JAMAIS aux autres worktrees
// (accord-*, wf_*, ceux des autres sessions, veille-auto…). « git worktree remove » sans --force : un worktree aux
// changements non validés reste, et le refus est rapporté ; seule exception, un worktree dont les seuls fichiers non
// validés sont la trace versionnée de son exécution (research/presidentielle-2027/veille/runs/<runId>/… et
// veille/rapports/<jour>-<kind>.md, déjà recopiés dans <état local>/runs/<runId>/ : c'est le cas de chaque exécution
// quotidienne, qui ne valide jamais rien) est retiré avec --force (forced: true).
//
// Usage : node <WT>/tools/veille/cleanup.mjs [--days N] [--dry-run] [--quiet] [--root <abs>] [--now ISO]
//   --days     âge minimal en jours (policy.cleanupDays par défaut)
//   --dry-run  le plan seulement, rien n'est retiré
//   --quiet    rien sur stderr (run.mjs finish le lance ainsi)
// À lancer depuis le worktree d'une exécution (veille-* ou accord-*). Sortie : une ligne JSON { days, removed, failed,
// kept, branchesDeleted, branchesKept, dryRun }. Codes : 0, 2 (pas un worktree d'exécution), 31 (git).
// Il faut Node 22.18+.

import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { EXIT, assertRunWorktree, exit, fail, git, gitOut, mainRoot, parseArgs, parseNow, paths, readJson, rootFrom, runMain, todayInParis } from './lib/common.mjs'
import { parsePorcelainZ, touchedPaths } from './lib/git.mjs'

const V = 'research/presidentielle-2027/veille'
/** Le worktree n'a-t-il, comme fichiers non validés, que la trace de son exécution (copiée dans l'état local) ? */
function onlyRunTrace(path, runId) {
  const r = git(['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: path })
  if (r.code !== 0) return false
  const dirty = touchedPaths(parsePorcelainZ(r.stdout))
  const kind = /^\d{4}-\d{2}-\d{2}-([a-z]+)/.exec(runId)?.[1] ?? ''
  const report = `${V}/rapports/${runId.slice(0, 10)}-${kind}.md`
  return dirty.length > 0 && dirty.every(p => p.startsWith(`${V}/runs/${runId}/`) || p === report)
}
import { parseWorktreeList, planCleanup, readLock, samePath } from './lib/lock.mjs'
import { listPending, loadPolicy } from './lib/state.mjs'

runMain(async () => {
  const o = parseArgs(process.argv.slice(2), { days: { type: 'number' }, 'dry-run': { type: 'boolean' }, quiet: { type: 'boolean' }, root: { type: 'string' }, now: { type: 'string' } })
  if (o._.length) fail(EXIT.USAGE, `argument inattendu : ${o._.join(' ')}`)
  const root = rootFrom(o)
  assertRunWorktree(root)
  const main = mainRoot(root)
  if (!main) fail(EXIT.USAGE, `${root} : dépôt principal introuvable`)
  const L = paths(root).local
  const policy = loadPolicy(root)
  const days = o.days ?? policy.cleanupDays ?? 14
  if (!(days >= 0)) fail(EXIT.USAGE, '--days : nombre positif attendu')
  const dry = o['dry-run']
  const say = o.quiet ? () => {} : msg => process.stderr.write(`${msg}\n`)

  const worktrees = parseWorktreeList(gitOut(['worktree', 'list', '--porcelain'], { cwd: root }))
  const pending = L ? listPending(L.dir) : []
  const runs = []
  if (L && existsSync(L.runs)) {
    for (const id of readdirSync(L.runs)) {
      const r = readJson(join(L.runs, id, 'run.json'), null)
      if (r) runs.push(r)
    }
  }
  const plan = planCleanup({ worktrees, mainRoot: main, current: root, lock: L ? readLock(L.lock) : null, pending, runs, today: todayInParis(parseNow(o.now)), days })

  const removed = []
  const failed = []
  for (const w of plan.remove) {
    if (dry) {
      removed.push({ ...w, dryRun: true })
      continue
    }
    let r = git(['worktree', 'remove', w.path], { cwd: root })
    let forced = false
    if (r.code !== 0 && onlyRunTrace(w.path, w.runId)) {
      r = git(['worktree', 'remove', '--force', w.path], { cwd: root })
      forced = true
    }
    if (r.code === 0) {
      removed.push(forced ? { ...w, forced } : w)
      say(`retiré${forced ? ' (seule la trace de son exécution restait, déjà dans l’état local)' : ''} : ${w.path}`)
    } else {
      failed.push({ ...w, reason: r.stderr.trim().slice(0, 300) })
      say(`non retiré : ${w.path} (${r.stderr.trim()})`)
    }
  }
  if (!dry) git(['worktree', 'prune'], { cwd: root })

  // Branches veille/* : seulement les ancêtres d'origin/main, ni extraites, ni citées par une attente
  const remaining = parseWorktreeList(git(['worktree', 'list', '--porcelain'], { cwd: root }).stdout)
  const cited = new Set(pending.filter(p => p.status === 'attente' && p.branch).map(p => p.branch))
  const branches = git(['for-each-ref', '--format=%(refname:short)', 'refs/heads/veille/'], { cwd: root }).stdout.split('\n').map(s => s.trim()).filter(Boolean)
  const hasOrigin = git(['rev-parse', '--verify', '--quiet', 'origin/main'], { cwd: root }).code === 0
  const branchesDeleted = []
  const branchesKept = []
  for (const b of branches) {
    const keep = reason => branchesKept.push({ branch: b, reason })
    if (remaining.some(w => w.branch === b && !(dry && plan.remove.some(x => samePath(x.path, w.path))))) { keep('extraite dans un worktree'); continue }
    if (cited.has(b)) { keep('citée par une attente'); continue }
    if (!hasOrigin) { keep('origin/main introuvable'); continue }
    if (git(['merge-base', '--is-ancestor', b, 'origin/main'], { cwd: root }).code !== 0) { keep('pas ancêtre d’origin/main'); continue }
    if (dry) { branchesDeleted.push({ branch: b, dryRun: true }); continue }
    const r = git(['branch', '-D', b], { cwd: root })
    if (r.code === 0) {
      branchesDeleted.push({ branch: b })
      say(`branche effacée : ${b}`)
    } else keep(r.stderr.trim().slice(0, 200))
  }
  exit(EXIT.OK, { days, dryRun: dry, removed, failed, kept: plan.keep, branchesDeleted, branchesKept }, { root })
})
