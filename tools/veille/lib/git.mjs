// Opérations git de la veille automatique (commit.mjs, ship.mjs, rederive.mjs ; contrat : tools/veille/CONTRACT.md
// §d.10 à d.12) : chemins permis par niveau (auto, accord), lecture de « git status -z », règle des branches, message de
// commit terminé par la ligne Co-Authored-By, et le seul push permis — « git push -q origin <sha>:refs/heads/main »,
// jamais forcé, jamais vers une autre référence. Le lanceur de commandes est injectable (makeGit(cwd, { runner })) :
// les tests passent un faux, ou des dépôts temporaires avec un « origin » nu. Aucun appel au réseau ni à une IA ici.
//
// Usage :
//   import { makeGit, pathAllowed, outsideTier, branchError, withCoAuthor, pushArgs } from './lib/git.mjs'
//   const g = makeGit(root)
//   const dirty = outsideTier(g.status(), 'auto')          // [] si tout est dans les chemins du niveau
//   const r = g.raw(pushArgs(sha))                          // ['push', '-q', 'origin', '<sha>:refs/heads/main']
//
// Niveaux (CONTRACT.md d.10) :
//   auto    research/presidentielle-2027/** ; src/elections/presidentielle-2027/{bank,positions,videos,election,transfer}.ts ;
//           src/core/echiquierMethodCopy.ts ; tests/fixtures/transfer-slots-presidentielle-2027.json
//   accord  auto, plus src/elections/presidentielle-2027/candidates.ts, src/elections/presidentielle-2027/media/** et
//           src/elections/index.ts (aucun test) ; seulement sur une branche accord/* (accord du propriétaire)
//   jamais, à aucun niveau (CONTROL_PATHS) : les fichiers de contrôle du propriétaire, research/presidentielle-2027/
//           {VEILLE.md, PIPELINE.md, veille/policy.json, veille/locks.json, veille/d5-baseline.json} : le runbook,
//           l'accord permanent, la politique, les verrous de paires et la référence D5 ne changent que par un commit du
//           propriétaire, jamais par une exécution qui les validerait elle-même
// Erreurs : VeilleError 2 (niveau inconnu, message vide), 31 (git échoue, push non conforme).

import { CO_AUTHOR, EXIT, fail, run, tail } from './common.mjs'

const D = 'research/presidentielle-2027'
const S = 'src/elections/presidentielle-2027'

export const TIERS = Object.freeze(['auto', 'accord'])

const AUTO_PATHS = Object.freeze([
  `${D}/**`,
  `${S}/bank.ts`,
  `${S}/positions.ts`,
  `${S}/videos.ts`,
  `${S}/election.ts`,
  `${S}/transfer.ts`,
  'src/core/echiquierMethodCopy.ts',
  'tests/fixtures/transfer-slots-presidentielle-2027.json',
])
/**
 * Fichiers de contrôle du propriétaire : refusés à tous les niveaux, même sous research/presidentielle-2027/** ; la
 * veille les lit à origin/main (readControlText de lib/common.mjs) et ne les valide ni ne les publie jamais
 */
export const CONTROL_PATHS = Object.freeze([
  `${D}/VEILLE.md`,
  `${D}/PIPELINE.md`,
  `${D}/veille/policy.json`,
  `${D}/veille/locks.json`,
  `${D}/veille/d5-baseline.json`,
])
/** Chemins que chaque niveau peut valider et publier : un chemin exact, ou un dossier entier (« …/** ») */
export const TIER_PATHS = Object.freeze({
  auto: AUTO_PATHS,
  accord: Object.freeze([...AUTO_PATHS, `${S}/candidates.ts`, `${S}/media/**`, 'src/elections/index.ts']),
})

const tierList = tier => {
  const list = TIER_PATHS[tier]
  if (!list) fail(EXIT.USAGE, `niveau inconnu : ${tier} (auto | accord)`)
  return list
}

/** Le chemin (relatif à la racine du dépôt, séparé par /) est-il permis au niveau donné ? Jamais un chemin absolu ni « .. » */
export function pathAllowed(path, tier) {
  const list = tierList(tier)
  const p = String(path ?? '').replace(/^\.\//, '')
  if (!p || p.startsWith('/') || p.split('/').some(seg => seg === '..' || seg === '')) return false
  if (CONTROL_PATHS.includes(p)) return false
  return list.some(entry => (entry.endsWith('/**') ? p.startsWith(entry.slice(0, -2)) && p.length > entry.length - 2 : p === entry))
}

/**
 * Entrées de « git status --porcelain=v1 -z » : [{ xy, path, orig? }]. Un renommage ou une copie (R, C) donne l'ancien
 * chemin dans orig (il suit le nouveau dans la sortie -z).
 */
export function parsePorcelainZ(text) {
  const parts = String(text ?? '').split('\0')
  const out = []
  for (let i = 0; i < parts.length; i++) {
    const e = parts[i]
    if (!e) continue
    if (e.length < 4 || e[2] !== ' ') fail(EXIT.CODE, `git status : entrée illisible « ${e} »`)
    const item = { xy: e.slice(0, 2), path: e.slice(3) }
    if (/[RC]/.test(item.xy)) item.orig = parts[++i]
    out.push(item)
  }
  return out
}

/** Tous les chemins touchés par des entrées de status (nouveaux et anciens), sans doublon, dans l'ordre */
export const touchedPaths = entries => [...new Set(entries.flatMap(e => (e.orig ? [e.path, e.orig] : [e.path])))]

/** Chemins touchés hors du niveau (entrées de status, ou simple liste de chemins) */
export function outsideTier(entriesOrPaths, tier) {
  tierList(tier)
  const list = entriesOrPaths.map(e => (typeof e === 'string' ? { path: e } : e))
  return touchedPaths(list).filter(p => !pathAllowed(p, tier))
}

/**
 * Règle des branches : seules veille/* et accord/* valident et publient ; le niveau accord (candidat, retrait, médias)
 * exige une branche accord/*, née d'un « OK » du propriétaire. Rend la raison du refus, ou null.
 */
export function branchError(branch, tier = 'auto') {
  tierList(tier)
  if (!branch) return 'HEAD détachée : il faut la branche de l’exécution (veille/* ou accord/*)'
  if (!/^(veille|accord)\/[a-z0-9][a-z0-9-]*$/.test(branch)) return `branche ${branch} : seules les branches veille/* et accord/* valident et publient`
  if (tier === 'accord' && !branch.startsWith('accord/')) return `le niveau accord exige une branche accord/* (accord du propriétaire), pas ${branch}`
  return null
}

/**
 * Le worktree et sa branche vont-ils ensemble ? Un worktree veille-* travaille sur une branche veille/*, un worktree
 * accord-* (créé après le « OK » du propriétaire) sur une branche accord/* : une branche accord/* créée dans un worktree
 * veille-* ne vaut pas accord. Rend la raison du refus, ou null.
 */
export function worktreeBranchError(name, branch) {
  const n = String(name ?? '')
  const b = String(branch ?? '')
  if (n.startsWith('accord-') && !b.startsWith('accord/')) return `le worktree ${n} est celui d’un accord : sa branche doit être accord/*, pas ${b || 'une HEAD détachée'}`
  if (n.startsWith('veille-') && b.startsWith('accord/')) return `branche ${b} dans le worktree ${n} : une branche accord/* ne vit que dans un worktree accord-* (accord du propriétaire)`
  return null
}

const ITEM_KINDS = Object.freeze({ c: 'candidat', r: 'retrait', h: 'hold', d: 'redeclaration', i: 'reintegration', o: 'official', f: 'fiche' })
/**
 * L'attente du propriétaire qu'applique une exécution d'accord, lue dans son runId « accord-<id en minuscules>-AAAA-MM-JJ » :
 * accord-c-dupont-2026-10-22 → { id: 'C-dupont', kind: 'candidat', subject: 'dupont' } ; accord-h-2026-10-19-1-2026-10-22
 * → { id: 'H-2026-10-19-1', kind: 'hold' }. null si le runId n'a pas cette forme.
 */
export function accordItemOf(runId) {
  const m = /^accord-([a-z])-([a-z0-9][a-z0-9-]*?)-(\d{4}-\d{2}-\d{2})$/.exec(String(runId ?? ''))
  if (!m || !ITEM_KINDS[m[1]]) return null
  return { id: `${m[1].toUpperCase()}-${m[2]}`, kind: ITEM_KINDS[m[1]], subject: m[2], date: m[3] }
}

/**
 * L'accord tient-il ? L'attente nommée par le runId existe dans pending.json, au statut « accordé », décidée après sa
 * création, et vient d'une exécution antérieure (pas de celle-ci). Rend les écarts ([] si tout tient). Le statut
 * « accordé » s'écrit par run.mjs pending resolve, qui n'est lancé qu'après la réponse du propriétaire (runbook).
 */
export function accordItemErrors(runId, pendingItems = []) {
  const item = accordItemOf(runId)
  if (!item) return [`${runId} : une exécution d’accord s’appelle accord-<id de l’attente en minuscules>-AAAA-MM-JJ (accord-c-dupont-2026-10-22)`]
  const p = (pendingItems ?? []).find(x => x?.id === item.id)
  if (!p) return [`attente ${item.id} absente de pending.json : aucun accord du propriétaire à appliquer`]
  const errors = []
  if (p.status !== 'accordé') errors.push(`attente ${item.id} au statut « ${p.status} » : seul « accordé » s’applique`)
  if (!p.decidedAt || !(Date.parse(p.decidedAt) > Date.parse(p.createdAt))) errors.push(`attente ${item.id} : décision absente, ou pas postérieure à sa création`)
  if (p.runId === runId) errors.push(`attente ${item.id} créée par cette même exécution (${runId}) : un accord vient d’une exécution antérieure`)
  return errors
}

/** La branche courante est-elle celle de l'exécution (run.json branch), ou l'une de ses reprises (« <branche>-r<N> ») ? */
export function branchOfRun(branch, runBranch) {
  if (!branch || !runBranch) return false
  if (branch === runBranch) return true
  return branch.startsWith(`${runBranch}-r`) && /^\d+$/.test(branch.slice(runBranch.length + 2))
}

/**
 * Message de commit terminé par la ligne CO_AUTHOR (ajoutée si elle manque, jamais en double), précédée d'une ligne
 * vide ; saut de ligne final. Message vide : VeilleError 2.
 */
export function withCoAuthor(message) {
  const lines = String(message ?? '').replace(/\r\n?/g, '\n').split('\n').filter(l => l.trim() !== CO_AUTHOR)
  while (lines.length && !lines.at(-1).trim()) lines.pop()
  while (lines.length && !lines[0].trim()) lines.shift()
  if (!lines.length) fail(EXIT.USAGE, 'message de commit vide')
  return `${lines.join('\n')}\n\n${CO_AUTHOR}\n`
}

/** Message de la fusion publiée sur main (ship.mjs) : « Fusion de la branche <branche> » et CO_AUTHOR */
export const mergeMessage = branch => withCoAuthor(`Fusion de la branche ${branch}`)

const SHA40 = /^[0-9a-f]{40}$/
/**
 * Refuse tout push autre que « push -q origin <sha de 40 caractères>:refs/heads/main » : ni --force (sous aucune forme),
 * ni « + » devant la référence, ni --mirror, --delete, --all, --tags, ni une autre référence ou un autre dépôt.
 * VeilleError 31 sinon (un défaut de code : la veille ne fabrique jamais un tel appel).
 */
export function assertSafePush(args) {
  const a = [...(args ?? [])]
  const ok = a.length === 4 && a[0] === 'push' && a[1] === '-q' && a[2] === 'origin' && /^[0-9a-f]{40}:refs\/heads\/main$/.test(a[3])
  if (!ok) fail(EXIT.CODE, `push refusé : seul « git push -q origin <sha>:refs/heads/main » est permis, jamais forcé (reçu : git ${a.join(' ')})`)
  return a
}
/** Arguments du seul push permis */
export function pushArgs(sha) {
  if (!SHA40.test(String(sha))) fail(EXIT.CODE, `push : empreinte de commit attendue (40 caractères), pas « ${sha} »`)
  return assertSafePush(['push', '-q', 'origin', `${sha}:refs/heads/main`])
}
/** Le push a-t-il été refusé par le dépôt distant (non fast-forward, référence plus récente, crochet) ? Sinon : panne */
export const pushRejected = stderr => /\[(remote )?rejected\]|non-fast-forward|fetch first|stale info|hook declined/i.test(String(stderr ?? ''))

/**
 * Contrôle d'une fusion calculée par commit-tree : même arbre que HEAD, parents exactement [origin/main, HEAD].
 * Rend la liste des écarts ([] si tout va bien).
 */
export function mergeErrors({ mergeTree, headTree, parents, base, head }) {
  const errors = []
  if (!mergeTree || mergeTree !== headTree) errors.push(`l’arbre de la fusion (${mergeTree}) n’est pas celui de HEAD (${headTree})`)
  if (!Array.isArray(parents) || parents.length !== 2 || parents[0] !== base || parents[1] !== head) {
    errors.push(`parents de la fusion : ${(parents ?? []).join(' ')} au lieu de ${base} ${head}`)
  }
  return errors
}

/**
 * Petit client git sur un dossier, au lanceur injectable (runner(cmd, args, opts) → { code, stdout, stderr }, comme
 * run de common.mjs). out() lève une VeilleError 31 si git échoue ; raw() rend le résultat tel quel.
 */
export function makeGit(cwd, { runner = run, env } = {}) {
  const raw = (args, opts = {}) => runner('git', args, { cwd, env: opts.env ? { ...(env ?? {}), ...opts.env } : env, input: opts.input })
  const check = (args, r) => {
    if (r.code !== 0) fail(EXIT.CODE, `git ${args.join(' ')} : ${tail(r.stderr, 6).trim() || `code ${r.code}`}`)
    return r.stdout
  }
  const text = (args, opts) => check(args, raw(args, opts))
  const out = (args, opts) => text(args, opts).trim()
  return {
    cwd,
    raw,
    out,
    text,
    /** Empreinte du commit d'une référence */
    sha: ref => out(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]),
    /** Empreinte de l'arbre d'une référence */
    tree: ref => out(['rev-parse', '--verify', '--quiet', `${ref}^{tree}`]),
    /** a est-il ancêtre de b ? (VeilleError 31 si git ne sait pas répondre) */
    isAncestor(a, b) {
      const r = raw(['merge-base', '--is-ancestor', a, b])
      if (r.code === 0) return true
      if (r.code === 1) return false
      return fail(EXIT.CODE, `git merge-base --is-ancestor ${a} ${b} : ${tail(r.stderr, 6).trim() || `code ${r.code}`}`)
    },
    /** Entrées de status, fichiers non suivis compris (un par un) */
    status: () => parsePorcelainZ(text(['status', '--porcelain=v1', '-z', '--untracked-files=all'])),
    /** Fichiers différents sur un intervalle (« origin/main...HEAD »), renommages vus comme retrait + ajout */
    diffNames: range => text(['diff', '--name-only', '--no-renames', '-z', range]).split('\0').filter(Boolean),
    /** Fichiers indexés (prêts à valider) */
    stagedNames: () => text(['diff', '--cached', '--name-only', '--no-renames', '-z']).split('\0').filter(Boolean),
    /** Lignes ajoutées et retirées d'un fichier sur un intervalle */
    numstat(range, path) {
      return out(['diff', '--numstat', '--no-renames', range, '--', path])
        .split('\n')
        .filter(Boolean)
        .map(l => {
          const [added, deleted, file] = l.split('\t')
          return { added: Number(added), deleted: Number(deleted), path: file }
        })
    },
    /** Contenu d'un fichier à une référence, ou null s'il n'y existe pas */
    show(ref, path) {
      const r = raw(['show', `${ref}:${path}`])
      return r.code === 0 ? r.stdout : null
    },
    /** Nombre de commits de l'intervalle (« origin/main..HEAD ») */
    count: range => Number(out(['rev-list', '--count', range])),
    /** Parents d'un commit, dans l'ordre */
    parents: ref => out(['rev-list', '--parents', '-n', '1', ref]).split(' ').slice(1),
    fetch: () => out(['fetch', '-q', 'origin']),
  }
}
