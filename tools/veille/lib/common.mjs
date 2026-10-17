// Outils communs de la veille automatique (tools/veille/*.mjs ; contrat : tools/veille/CONTRACT.md) : chemins (worktree
// de l'exécution, dépôt principal, état local), lecture et écriture JSON stables, lancement de commandes à sortie
// captée, sortie normalisée (une ligne JSON sur stdout et un code de sortie de la table commune), lecture des options,
// dates à Paris, empreintes. Aucun appel au réseau ni à une IA ; rien n'est écrit hors des chemins qu'on lui donne.
//
// Usage :
//   import { runMain, parseArgs, exit, fail, EXIT, paths, readJson, writeJson, run, todayInParis } from './lib/common.mjs'
//   runMain(async () => {
//     const opts = parseArgs(process.argv.slice(2), { 'dry-run': { type: 'boolean' }, port: { type: 'number', required: true } })
//     …
//     exit(EXIT.OK, { written: [] })
//   })
//
// Chemins :
//   worktreeRoot()  la racine du checkout qui CONTIENT ce fichier (le worktree de l'exécution quand le script est lancé
//                   par son chemin absolu <WT>/tools/veille/x.mjs), jamais le dossier courant ; ISOLOIR_VEILLE_ROOT ou
//                   --root (rootFrom) la remplacent, pour les tests.
//   mainRoot(dir)   la racine du dépôt PRINCIPAL : le parent de « git rev-parse --git-common-dir » ; null hors de git.
//                   ISOLOIR_VEILLE_MAIN_ROOT la remplace.
//   localStateDir() l'état local, jamais versionné : <mainRoot>/.claude/veille ; ISOLOIR_VEILLE_LOCAL le remplace.
// Variables d'environnement réservées aux tests : ISOLOIR_VEILLE_ROOT, ISOLOIR_VEILLE_MAIN_ROOT, ISOLOIR_VEILLE_LOCAL,
// ISOLOIR_VEILLE_PROJECTS (dossier des projets Claude, pour persist), ISOLOIR_VEILLE_NOW (heure simulée, ISO 8601).
// Il faut Node 22.18+.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// ——— Constantes ———

export const ELECTION_ID = 'presidentielle-2027'
/** Fin de la veille : clôture du second tour */
export const END_AT = '2027-05-02T20:00:00+02:00'
/** User-Agent de toute requête faite par un script ou un agent : jamais d'adresse e-mail ni de nom */
export const USER_AGENT = 'IsoloirBot/1.0'
export const PROD_URL = 'https://isoloir.vercel.app/'
/** Dernière ligne de chaque message de commit (commit.mjs l'ajoute si elle manque) */
export const CO_AUTHOR = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'
/** Candidats en attente de la primaire, masqués : toujours dans le BUILD (--include), jamais nommés */
export const MANDATORY_INCLUDE = Object.freeze(['faure', 'guedj', 'maurel', 'royal'])

/** La table unique des codes de sortie (CONTRACT.md §b) */
export const EXIT = Object.freeze({
  OK: 0,
  USAGE: 2,
  MOVED: 10,
  FROZEN: 11,
  SOFT_FROZEN: 12,
  ENDED: 13,
  PAUSED: 20,
  LOCKED: 21,
  BUDGET: 22,
  DATA: 30,
  CODE: 31,
  DEPLOY: 40,
  PROD: 41,
})
const KNOWN_CODES = new Set(Object.values(EXIT))

/** Erreur qui porte un code de la table ; runMain la transforme en sortie normalisée */
export class VeilleError extends Error {
  constructor(code, reason, extra = {}) {
    super(reason)
    this.code = code
    this.extra = extra
  }
}
/** Lève une VeilleError : fail(EXIT.DATA, 'raison', { bundles: ['candidat:polony'] }) */
export function fail(code, reason, extra = {}) {
  throw new VeilleError(code, reason, extra)
}

// ——— Chemins ———

/** Racine du checkout qui contient ce fichier (tools/veille/lib/common.mjs → trois niveaux plus haut) */
export function worktreeRoot() {
  return fileURLToPath(new URL('../../../', import.meta.url)).replace(/\/+$/, '')
}
/** Racine de travail d'un script : --root, sinon ISOLOIR_VEILLE_ROOT, sinon le checkout du script */
export function rootFrom(opts = {}) {
  return resolve(opts.root ?? process.env.ISOLOIR_VEILLE_ROOT ?? worktreeRoot())
}
/** Racine du dépôt principal (parent du dossier git commun), ou null hors de git */
export function mainRoot(dir = worktreeRoot()) {
  if (process.env.ISOLOIR_VEILLE_MAIN_ROOT) return resolve(process.env.ISOLOIR_VEILLE_MAIN_ROOT)
  const r = run('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: dir })
  if (r.code !== 0) return null
  return dirname(realpathSync(r.stdout.trim()))
}
/** État local de la veille, jamais versionné : <mainRoot>/.claude/veille (ISOLOIR_VEILLE_LOCAL pour les tests) */
export function localStateDir(dir = worktreeRoot()) {
  if (process.env.ISOLOIR_VEILLE_LOCAL) return resolve(process.env.ISOLOIR_VEILLE_LOCAL)
  const main = mainRoot(dir)
  if (!main) fail(EXIT.USAGE, `état local introuvable : ${dir} n'est pas dans un dépôt git (ISOLOIR_VEILLE_LOCAL pour un essai)`)
  return join(main, '.claude', 'veille')
}
export const researchDir = (root = rootFrom()) => join(root, 'research', ELECTION_ID)
export const electionSrc = (root = rootFrom()) => join(root, 'src', 'elections', ELECTION_ID)
/** État versionné de la veille : research/presidentielle-2027/veille */
export const veilleDir = (root = rootFrom()) => join(researchDir(root), 'veille')
/** Dossier des projets Claude Code, où l'outil Workflow range wf_<runId>.json (ISOLOIR_VEILLE_PROJECTS pour les tests) */
export const claudeProjectsDir = () => resolve(process.env.ISOLOIR_VEILLE_PROJECTS ?? join(homedir(), '.claude', 'projects'))

/** Tous les chemins, versionnés (dans root) et locaux (dans localStateDir) */
export function paths(root = rootFrom()) {
  const D = researchDir(root)
  const V = veilleDir(root)
  const S = electionSrc(root)
  let L = null
  try {
    L = localStateDir(root)
  } catch {
    L = null
  }
  const local = L && {
    dir: L,
    lock: join(L, 'lock.json'),
    stop: join(L, 'STOP'),
    pause: join(L, 'PAUSE'),
    spend: join(L, 'spend.jsonl'),
    pending: join(L, 'pending.json'),
    watch: join(L, 'watch.json'),
    lastShip: join(L, 'last-ship.json'),
    runs: join(L, 'runs'),
    run: runId => join(L, 'runs', runId),
  }
  return {
    root,
    research: D,
    src: S,
    config: join(D, 'config.json'),
    decisions: join(D, 'decisions.json'),
    bank: join(D, 'bank.json'),
    build: join(D, 'build.json'),
    history: join(D, 'positions-history.json'),
    audit: join(D, 'audit.json'),
    election: join(S, 'election.ts'),
    transfer: join(S, 'transfer.ts'),
    transferFixture: join(root, 'tests', 'fixtures', `transfer-slots-${ELECTION_ID}.json`),
    methodCopy: join(root, 'src', 'core', 'echiquierMethodCopy.ts'),
    veille: V,
    policy: join(V, 'policy.json'),
    locks: join(V, 'locks.json'),
    state: join(V, 'state.json'),
    ledger: join(V, 'ledger.json'),
    d5Baseline: join(V, 'd5-baseline.json'),
    reports: join(V, 'rapports'),
    report: (date, kind) => join(V, 'rapports', `${date}-${kind}.md`),
    committedRun: runId => join(V, 'runs', runId),
    local,
  }
}

// ——— Fichiers de contrôle du propriétaire ———

/**
 * Fichiers que seul le propriétaire écrit, par ses propres commits sur main : la politique, les verrous de paires et la
 * référence D5. La veille les lit à origin/main (readControlText), jamais dans l'arbre de travail d'une exécution, et ne
 * les valide ni ne les publie jamais (CONTROL_PATHS de lib/git.mjs) : une exécution ne peut ni affaiblir ses portes, ni
 * lever un verrou, ni réécrire la référence qui la juge.
 */
export const CONTROL_FILES = Object.freeze({
  policy: `research/${ELECTION_ID}/veille/policy.json`,
  locks: `research/${ELECTION_ID}/veille/locks.json`,
  d5Baseline: `research/${ELECTION_ID}/veille/d5-baseline.json`,
})
/** Référence d'où se lisent les fichiers de contrôle : le suivi local d'origin/main (avancé par chaque fetch) */
export const CONTROL_REF = 'origin/main'

/**
 * Texte d'un fichier de contrôle (rel : relatif à la racine du dépôt) à la référence de contrôle. Rend { text (null si
 * le fichier n'y existe pas : valeurs par défaut), ref, from: 'git' | 'fichier' }. Seulement hors de git, ou sans
 * origin/main (essais hors dépôt), le fichier se lit tel quel dans root (from: 'fichier') ; une modification locale d'un
 * worktree d'exécution n'a donc aucun effet.
 */
export function readControlText(root, rel, { ref = CONTROL_REF } = {}) {
  const has = git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: root })
  if (has.code === 0) {
    const r = git(['show', `${ref}:./${rel}`], { cwd: root })
    return { text: r.code === 0 ? r.stdout : null, ref, from: 'git' }
  }
  const file = join(root, rel)
  return { text: existsSync(file) ? readFileSync(file, 'utf8') : null, ref: null, from: 'fichier' }
}
/** Contenu JSON d'un fichier de contrôle (readControlText) ; fallback s'il n'existe pas ; Error si illisible */
export function readControlJson(root, rel, fallback, opts) {
  const { text, ref } = readControlText(root, rel, opts)
  if (text == null) return fallback
  try {
    return JSON.parse(text)
  } catch (e) {
    throw new Error(`${rel}${ref ? ` (${ref})` : ''} : JSON illisible (${e.message})`)
  }
}

/**
 * Le dépôt d'origine est-il un dépôt d'essai (adresse locale : chemin absolu, file://, ou aucun « origin ») ? Une vraie
 * publication pousse toujours vers le dépôt GitHub : les crochets d'essai (heure simulée, faux exécutables, état local
 * déplacé) ne sont permis qu'avec un dépôt d'essai, ce qu'aucune option de ligne de commande ne peut simuler.
 */
export function isTestOrigin(root) {
  const r = git(['remote', 'get-url', 'origin'], { cwd: root })
  if (r.code !== 0) return true
  const url = r.stdout.trim()
  return url.startsWith('/') || /^file:\/\//i.test(url)
}

// ——— git ———

/** git <args> dans cwd, sortie captée (ne lève jamais) */
export const git = (args, { cwd = rootFrom(), env } = {}) => run('git', args, { cwd, env })
/** Sortie de git, nettoyée ; lève une VeilleError 31 si git échoue */
export function gitOut(args, { cwd = rootFrom() } = {}) {
  const r = git(args, { cwd })
  if (r.code !== 0) fail(EXIT.CODE, `git ${args.join(' ')} : ${r.stderr.trim() || `code ${r.code}`}`)
  return r.stdout.trim()
}
/** Ce dossier est-il un worktree lié (et non le checkout principal) ? false hors de git */
export function isLinkedWorktree(dir = rootFrom()) {
  const a = git(['rev-parse', '--path-format=absolute', '--git-dir'], { cwd: dir })
  const b = git(['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: dir })
  if (a.code !== 0 || b.code !== 0) return false
  return realpathSync(a.stdout.trim()) !== realpathSync(b.stdout.trim())
}
/** Branche courante, ou null (HEAD détachée, hors de git) */
export function currentBranch(dir = rootFrom()) {
  const r = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], { cwd: dir })
  return r.code === 0 ? r.stdout.trim() : null
}
/**
 * Refuse d'écrire dans le dossier principal du dépôt (d'autres sessions s'en servent) : sortie 2 si root est le checkout
 * principal d'un dépôt git. Un dossier hors de git (essai, test) passe. Les scripts qui touchent git ou publient
 * exigent en plus un worktree lié nommé veille-* ou accord-* (assertRunWorktree).
 */
export function assertNotMainFolder(root = rootFrom()) {
  const top = git(['rev-parse', '--show-toplevel'], { cwd: root })
  if (top.code !== 0) return
  if (!isLinkedWorktree(root)) fail(EXIT.USAGE, `${root} est le dossier principal du dépôt : la veille ne travaille que dans son propre worktree (.claude/worktrees/veille-*)`)
}
/** Le worktree d'une exécution : lié, nommé veille-* ou accord-* ; sortie 2 sinon */
export function assertRunWorktree(root = rootFrom()) {
  if (!isLinkedWorktree(root)) fail(EXIT.USAGE, `${root} n'est pas un worktree lié`)
  const name = basename(realpathSync(gitOut(['rev-parse', '--show-toplevel'], { cwd: root })))
  if (!/^(veille|accord)-[a-z0-9-]+$/.test(name)) fail(EXIT.USAGE, `${name} : le worktree d'une exécution s'appelle veille-<runId> ou accord-<id>-<date>`)
  return name
}
/** Identifiant d'exécution tiré du nom du worktree : « veille-2026-10-19-hebdo » → « 2026-10-19-hebdo » ; accord-… gardé tel quel */
export const runIdOfWorktree = dir => basename(dir).replace(/^veille-/, '')

/**
 * L'exécution à laquelle ce worktree appartient, d'après le verrou local (lock.json : worktrees [{ path, runId }]) ;
 * null s'il n'y en a pas. Permet à chaque script de ranger sa sortie dans runs/<runId>/ sans option --run-id.
 */
export function currentRunId(root = rootFrom()) {
  try {
    const L = localStateDir(root)
    const lock = readJson(join(L, 'lock.json'), null)
    if (!lock) return null
    const here = realpathSync(root)
    const hit = (lock.worktrees ?? []).find(w => w?.path && existsSync(w.path) && realpathSync(w.path) === here)
    return hit?.runId ?? null
  } catch {
    return null
  }
}

// ——— JSON ———

/** Contenu JSON d'un fichier ; fallback (s'il est donné, même null) quand le fichier n'existe pas */
export function readJson(file, fallback) {
  if (!existsSync(file)) {
    if (arguments.length > 1) return fallback
    throw new Error(`${file} introuvable`)
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    throw new Error(`${file} : JSON illisible (${e.message})`)
  }
}
/** Valeur avec ses clés d'objets triées, en profondeur (les listes gardent leur ordre) */
export function sortKeysDeep(v) {
  if (Array.isArray(v)) return v.map(sortKeysDeep)
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeysDeep(v[k])]))
  return v
}
/** Texte JSON du dépôt : 2 espaces, saut de ligne final ; sortKeys seulement là où le fichier est trié (ledger.json) */
export const stableJson = (value, { sortKeys = false } = {}) => JSON.stringify(sortKeys ? sortKeysDeep(value) : value, null, 2) + '\n'
/** Écrit file atomiquement (fichier temporaire puis renommage), dossiers créés au besoin */
export function writeJson(file, value, opts = {}) {
  writeText(file, stableJson(value, opts))
}
export function writeText(file, text) {
  mkdirSync(dirname(file), { recursive: true })
  const tmp = `${file}.tmp-${process.pid}`
  writeFileSync(tmp, text)
  renameSync(tmp, file)
}
export function appendJsonl(file, value) {
  mkdirSync(dirname(file), { recursive: true })
  appendFileSync(file, JSON.stringify(value) + '\n')
}
export function readJsonl(file) {
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
}

// ——— Commandes ———

/**
 * Lance cmd args, sortie captée ; ne lève jamais. { code, stdout, stderr, signal } ; code 1 si tué par un signal ou
 * si la commande est introuvable. tee : recopie aussi stdout et stderr sur stderr (suivi des longues commandes).
 */
export function run(cmd, args = [], { cwd, env, input, timeoutMs, tee = false } = {}) {
  const r = spawnSync(cmd, args, {
    cwd,
    env: env ? { ...process.env, ...env } : process.env,
    input,
    encoding: 'utf8',
    maxBuffer: 1 << 30,
    timeout: timeoutMs,
  })
  const out = { code: r.status ?? 1, stdout: r.stdout ?? '', stderr: (r.stderr ?? '') + (r.error ? `\n${r.error.message}` : ''), signal: r.signal ?? null }
  if (tee) process.stderr.write(out.stdout + out.stderr)
  return out
}
/** node <script> args, avec le même Node que celui qui tourne */
export const runNode = (script, args = [], opts = {}) => run(process.execPath, [script, ...args], opts)
/** Dernières lignes d'une sortie, pour une raison d'échec lisible */
export const tail = (text, n = 20) => String(text ?? '').trimEnd().split('\n').slice(-n).join('\n')

// ——— Sortie normalisée ———

const scriptName = () => basename(process.argv[1] ?? 'veille', '.mjs')

/**
 * Imprime UNE ligne JSON sur stdout ({ script, code, ok, …payload }) et quitte avec code. Si une exécution est en
 * cours dans ce worktree (currentRunId), la même valeur est rangée dans <état local>/runs/<runId>/<script>[-<tag>].json
 * et ajoutée à runs/<runId>/journal.jsonl. Un code hors de la table devient 31.
 */
export function exit(code, payload = {}, { tag, root } = {}) {
  const c = KNOWN_CODES.has(code) ? code : EXIT.CODE
  const value = { script: scriptName(), code: c, ok: c === EXIT.OK, ...payload }
  try {
    const runId = payload.runId ?? currentRunId(root ?? rootFrom())
    if (runId && process.env.ISOLOIR_VEILLE_NO_RECORD !== '1') {
      const dir = join(localStateDir(root ?? rootFrom()), 'runs', runId)
      writeJson(join(dir, `${value.script}${tag ? `-${tag}` : ''}.json`), value)
      appendJsonl(join(dir, 'journal.jsonl'), { at: new Date().toISOString(), script: value.script, tag: tag ?? null, code: c })
    }
  } catch {
    // la sortie compte plus que sa copie
  }
  process.stdout.write(JSON.stringify(value) + '\n')
  process.exit(c)
}

/**
 * Enveloppe du programme principal : une erreur d'usage sort en 2, une VeilleError avec son code (raison en français
 * sur stderr et dans la ligne JSON), toute autre erreur en 31 (défaut de code : on s'arrête).
 */
export function runMain(main) {
  Promise.resolve()
    .then(main)
    .then(() => exit(EXIT.OK, {}))
    .catch(e => {
      if (e instanceof VeilleError) {
        process.stderr.write(`${e.message}\n`)
        exit(e.code, { reason: e.message, ...e.extra })
      }
      process.stderr.write(`${e?.stack ?? e}\n`)
      exit(EXIT.CODE, { reason: `erreur inattendue : ${e?.message ?? e}` })
    })
}

// ——— Options ———

/**
 * Lit argv selon spec : { nom: { type: 'string' | 'number' | 'boolean' | 'list', default?, required?, choices? } }.
 * « --nom valeur » et « --nom=valeur » ; une liste se répète (--hold a --hold b) ou se sépare par des virgules ;
 * le reste va dans « _ ». Option inconnue, valeur manquante ou hors choix : VeilleError 2. Toute mention de
 * --reset-revisions est refusée, quel que soit le script.
 */
export function parseArgs(argv, spec = {}) {
  const out = { _: [] }
  for (const [name, s] of Object.entries(spec)) {
    if (s.default !== undefined) out[name] = Array.isArray(s.default) ? [...s.default] : s.default
    else if (s.type === 'boolean') out[name] = false
    else if (s.type === 'list') out[name] = []
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (String(a).includes('reset-revisions')) fail(EXIT.USAGE, '--reset-revisions est interdit (PIPELINE.md, étape 11)')
    if (a === '--') { out._.push(...argv.slice(i + 1)); break }
    if (!a.startsWith('--')) { out._.push(a); continue }
    const eq = a.indexOf('=')
    const name = a.slice(2, eq < 0 ? undefined : eq)
    const s = spec[name]
    if (!s) fail(EXIT.USAGE, `option inconnue : --${name}`)
    let value
    if (s.type === 'boolean') {
      value = eq < 0 ? true : !/^(0|false|non)$/i.test(a.slice(eq + 1))
    } else {
      value = eq < 0 ? argv[++i] : a.slice(eq + 1)
      if (value === undefined || (eq < 0 && String(value).startsWith('--'))) fail(EXIT.USAGE, `--${name} : valeur attendue`)
    }
    if (s.type === 'number') {
      const n = Number(value)
      if (!Number.isFinite(n)) fail(EXIT.USAGE, `--${name} : nombre attendu, pas « ${value} »`)
      value = n
    }
    if (s.type === 'list') {
      const items = String(value).split(',').map(x => x.trim()).filter(Boolean)
      for (const x of items) if (s.choices && !s.choices.includes(x)) fail(EXIT.USAGE, `--${name} : « ${x} » hors de ${s.choices.join(' | ')}`)
      out[name] = [...(out[name] ?? []), ...items]
      continue
    }
    if (s.choices && !s.choices.includes(value)) fail(EXIT.USAGE, `--${name} : « ${value} » hors de ${s.choices.join(' | ')}`)
    out[name] = value
  }
  for (const [name, s] of Object.entries(spec)) if (s.required && (out[name] === undefined || out[name] === '')) fail(EXIT.USAGE, `--${name} obligatoire`)
  return out
}

// ——— Dates ———

/**
 * L'instant de référence : --now (ISO 8601 avec fuseau), sinon ISOLOIR_VEILLE_NOW, sinon l'horloge. Sortie 2 si la
 * valeur n'a pas de fuseau ou ne se lit pas.
 */
export function parseNow(value = process.env.ISOLOIR_VEILLE_NOW) {
  if (value == null || value === '') return new Date()
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(value) || Number.isNaN(Date.parse(value))) {
    fail(EXIT.USAGE, `--now : date-heure ISO 8601 avec fuseau attendue (2026-10-19T06:00:00+02:00), pas « ${value} »`)
  }
  return new Date(value)
}
/** Jour à Paris, AAAA-MM-JJ (même calcul que tools/positions-history.mjs, avec l'instant en paramètre) */
export const todayInParis = (now = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(now)
/** Heure de Paris de l'instant, « 2026-10-19T06:00:00+02:00 » */
export function isoInParis(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).map(p => [p.type, p.value]))
  const local = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second)
  const offset = Math.round((local - Math.floor(now.getTime() / 1000) * 1000) / 60000)
  const sign = offset >= 0 ? '+' : '-'
  const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
  const mm = String(Math.abs(offset) % 60).padStart(2, '0')
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${hh}:${mm}`
}
/** AAAA-MM-JJ décalé de n jours (calendrier, sans fuseau) */
export function addDays(day, n) {
  const d = new Date(`${day}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
/** Nombre de jours de a à b (AAAA-MM-JJ) */
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000)
/** Lundi de la semaine (ISO) du jour donné, AAAA-MM-JJ : la clé du budget hebdomadaire */
export function weekStart(day) {
  const dow = new Date(`${day}T12:00:00Z`).getUTCDay()
  return addDays(day, -((dow + 6) % 7))
}
/** « 19 octobre 2026 », « 1er mai 2027 » */
export function frenchDate(day) {
  const d = new Date(`${day}T12:00:00Z`)
  const text = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d)
  return text.replace(/^1 /, '1er ')
}

// ——— Textes et empreintes ———

export const sha1 = text => createHash('sha1').update(String(text)).digest('hex')
/** Sans accents, en minuscules, espaces et tirets réduits : pour comparer des noms */
export const normalizeName = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[\s '’-]+/g, ' ').trim()
/**
 * Identifiant d'un nouveau candidat, à la manière de config.json : les mots du nom après le premier prénom, sans accents
 * ni séparateurs (« Nicolas Dupont-Aignan » → dupontaignan, « Marine Le Pen » → lepen) ; un chiffre s'ajoute s'il est pris.
 */
export function candidateSlug(name, taken = []) {
  const words = String(name).trim().split(/\s+/)
  const base = normalizeName(words.length > 1 ? words.slice(1).join(' ') : words[0]).replace(/[^a-z0-9]/g, '') || 'candidat'
  let slug = base
  for (let n = 2; taken.includes(slug); n++) slug = `${base}${n}`
  return slug
}
/**
 * Clé d'une source pour reconnaître la même page : hôte en minuscules sans www. ni m., sans paramètres utm_*, sans
 * fragment ni / final. « https://www.Lemonde.fr/a/?utm_source=x#t » → « lemonde.fr/a »
 */
export function sourceKey(url) {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace(/^(www|m|amp)\./, '')
    const params = [...u.searchParams.entries()].filter(([k]) => !/^utm_/i.test(k) && k !== 'amp').sort(([a], [b]) => a.localeCompare(b))
    const query = params.length ? `?${new URLSearchParams(params).toString()}` : ''
    const path = u.pathname.replace(/\/amp\/?$/, '/').replace(/\/+$/, '')
    return `${host}${path}${query}`
  } catch {
    return String(url).trim().toLowerCase()
  }
}
/** Texte JSON aux clés triées, pour comparer deux valeurs */
export const canonical = v => JSON.stringify(sortKeysDeep(v))

// ——— Élection et candidats ———

/** Réglages de l'élection (src/elections/presidentielle-2027/election.ts, qui n'importe que des types) */
export async function loadElection(root = rootFrom()) {
  const file = join(electionSrc(root), 'election.ts')
  const m = await import(`${pathToFileURL(file).href}?t=${Date.now()}`)
  return m.election
}
/**
 * Candidats de config.json, répartis : visible (présentés : ni pendingPrimary ni election.hidden, dans l'ordre de
 * config.json), hidden (masqués : election.hidden et pendingPrimary), ids de chacun.
 */
export function splitCandidates(config, election) {
  const hiddenIds = new Set([...(election?.hidden ?? []), ...config.candidates.filter(c => c.pendingPrimary).map(c => c.id)])
  const pick = c => ({ id: c.id, name: c.name, party: c.party ?? null, declaredAt: c.declaredAt ?? null, ...(c.note ? { note: c.note } : {}) })
  const visible = config.candidates.filter(c => !hiddenIds.has(c.id)).map(pick)
  const hidden = config.candidates.filter(c => hiddenIds.has(c.id)).map(pick)
  return { visible, hidden, visibleIds: visible.map(c => c.id), hiddenIds: hidden.map(c => c.id) }
}
