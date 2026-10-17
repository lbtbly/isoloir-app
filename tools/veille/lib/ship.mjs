// Logique de la mise en ligne de la veille automatique (ship.mjs ; contrat : tools/veille/CONTRACT.md §b et §d.11) :
// la liste des contrôles, du moins cher au plus cher, et la traduction de leurs codes dans la table de la veille (30 :
// données refusées, 31 : code ou outil) ; les gardes de fichiers sur ce qui part en production (election.ts, config.json,
// decisions.json, explications, transfer.ts et sa fixture, approches de la banque, echiquierMethodCopy.ts par les seuls
// nombres de ses trois constantes recalculées, build.json include, et au niveau accord l'écart borné à l'attente
// accordée : accordDiffErrors) ; la politique lue à origin/main (loadPolicy) ; le contrôle de la production après
// le déploiement (asset index-*.js servi = celui de dist/index.html, nouveaux assets en 200, 3 essais) ; les textes de
// last-ship.json et de PAUSE. Fonctions pures, sauf prodCheck (lanceur et attente injectables) et portIsFree (réseau
// local seulement, 127.0.0.1 et ::1). Aucun appel à une IA.
//
// Usage :
//   import { checkPlan, classifyVitest, electionDiffErrors, decisionsErrors, prodCheck } from './lib/ship.mjs'
//   for (const step of checkPlan({ node: process.execPath, port: 4371, vitestReport: '/tmp/vitest.json' })) {
//     const r = run(step.cmd, step.args, { cwd: root })
//     const failure = step.map(r)          // null, ou { code: 30 | 31 | …, reason, bundles? }
//   }
//
// Tests de données (§b, liste figée) : un échec de vitest dans ces seuls fichiers donne 30, tout autre échec 31
// (video-editions compris : il faut réenregistrer une voix).

import { createServer } from 'node:net'
import { basename, delimiter } from 'node:path'
import { DEFAULT_POLICY } from '../schemas.mjs'
import { CONTROL_FILES, EXIT, USER_AGENT, canonical, readControlJson, tail } from './common.mjs'

const D = 'research/presidentielle-2027'
const S = 'src/elections/presidentielle-2027'

/** Fichiers de tests de données (tests/<nom>.test.ts) : leur échec seul donne 30 (CONTRACT.md §b) */
export const DATA_TEST_FILES = Object.freeze([
  'packs', 'hidden', 'table', 'spectrum',
  'echiquier', 'echiquier-weigh', 'echiquier-copy', 'echiquier-calibration',
  'positions-history', 'excluded-indicative',
  'transfer', 'transfer-qr',
  'home-back', 'source-date',
])
/** Ports des autres sessions (aperçu, essais du propriétaire, intégration) : jamais pris par la veille */
export const FORBIDDEN_PORTS = Object.freeze([4320, 4347, 4361])
/** Ports de repli de l'e2e, dans l'ordre, quand le port demandé est pris */
export const FALLBACK_PORTS = Object.freeze([4373, 4375])
/**
 * Causes permises dans une entrée de decisions.json : CHANGE_CAUSES de src/core/positionsHistory.ts, sans
 * « non-précisée » (une entrée de la veille dit toujours sa cause ; tests/veille-ship.test.ts vérifie l'accord des listes)
 */
export const HISTORY_CAUSES = Object.freeze([
  'prise-de-position', 'relecture', 'première-publication', 'nouveau-candidat', 'candidat-retiré', 'nouvelle-approche',
  'approche-retirée', 'question-retirée',
])
/** Clés d'election.ts que la veille peut changer, par niveau (au niveau accord, ranking ne change que par excluded) */
export const ELECTION_KEYS = Object.freeze({
  auto: Object.freeze(['dataVersion', 'dataFrozenAt', 'notes', 'changelog', 'audit']),
  accord: Object.freeze(['dataVersion', 'dataFrozenAt', 'notes', 'changelog', 'audit', 'hidden', 'forbiddenTerms']),
})
/** Sections de decisions.json que la veille change au niveau auto (apply.mjs : positions et addApproaches seulement) */
export const DECISIONS_SECTIONS_AUTO = Object.freeze(['positions', 'addApproaches'])
const KNOWN_CODES = Object.freeze(Object.values(EXIT))
const STATED = /^\d{4}-\d{2}(-\d{2})?$/
const MAX_APPROACHES = 9

// ——— Politique ———

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Politique effective : DEFAULT_POLICY, puis le fichier, fusion profonde sur un niveau (CONTRACT.md c.1) */
export function mergePolicy(fileValue = {}) {
  const out = {}
  for (const [k, v] of Object.entries(DEFAULT_POLICY)) out[k] = isPlainObject(v) ? { ...v } : Array.isArray(v) ? [...v] : v
  for (const [k, v] of Object.entries(fileValue ?? {})) out[k] = isPlainObject(v) && isPlainObject(out[k]) ? { ...out[k], ...v } : v
  return out
}
/**
 * Politique de root : research/presidentielle-2027/veille/policy.json lu à origin/main (readControlText de
 * lib/common.mjs), jamais la copie de l'arbre de travail de l'exécution ; absent : les valeurs par défaut
 */
export const loadPolicy = root => mergePolicy(readControlJson(root, CONTROL_FILES.policy, {}))

/** Préfixe PATH du dossier de faux exécutables (ISOLOIR_VEILLE_FAKE_BIN, ou VEILLE_FAKE_BIN) : tests seulement */
export function applyFakeBin(env = process.env) {
  const dir = env.ISOLOIR_VEILLE_FAKE_BIN || env.VEILLE_FAKE_BIN
  if (dir) env.PATH = `${dir}${delimiter}${env.PATH ?? ''}`
  return dir || null
}

// ——— Sorties des outils ———

/** Dernière ligne JSON d'une sortie (la ligne de sortie d'un script de la veille), ou null */
export function lastJsonLine(stdout) {
  const lines = String(stdout ?? '').trim().split('\n').reverse()
  for (const l of lines) {
    const t = l.trim()
    if (!t.startsWith('{')) continue
    try {
      return JSON.parse(t)
    } catch {
      // ligne suivante
    }
  }
  return null
}

const lastLines = (r, n = 12) => tail(`${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim(), n).trim()

/** Code d'un script de la veille (build.mjs, gate-time.mjs…) : repris tel quel s'il est dans la table, sinon 31 */
export function mapVeilleScript(r, label) {
  if (r.code === 0) return null
  const out = lastJsonLine(r.stdout)
  const code = KNOWN_CODES.includes(r.code) && r.code !== EXIT.OK ? r.code : EXIT.CODE
  const reason = `${label} : ${out?.reason ?? (lastLines(r) || `code ${r.code}`)}`
  return code === EXIT.DATA ? { code, reason, bundles: Array.isArray(out?.bundles) ? out.bundles : [] } : { code, reason }
}
/** Outil de données existant : code 1 = donnée refusée (30), tout autre échec = outil en panne (31) */
const mapDataTool = label => r => {
  if (r.code === 0) return null
  if (r.code === 1) return { code: EXIT.DATA, reason: `${label} : ${lastLines(r) || 'code 1'}`, bundles: [] }
  return { code: EXIT.CODE, reason: `${label} : code ${r.code}${r.signal ? ` (${r.signal})` : ''} ; ${lastLines(r)}` }
}
/** Outil de code : tout échec donne 31 */
const mapCodeTool = label => r => (r.code === 0 ? null : { code: EXIT.CODE, reason: `${label} : code ${r.code}${r.signal ? ` (${r.signal})` : ''} ; ${lastLines(r)}` })

/** Nom court d'un fichier de test : « /…/tests/echiquier-weigh.test.ts » → « echiquier-weigh » */
export const testFileId = name => basename(String(name ?? '')).replace(/\.(test|spec)\.[cm]?[jt]sx?$/, '')

/** Fichiers en échec d'un rapport JSON de vitest (testResults[].status, ou une assertion en échec) */
export function vitestFailedFiles(report) {
  const files = (report?.testResults ?? [])
    .filter(t => t?.status === 'failed' || (t?.assertionResults ?? []).some(a => a?.status === 'failed'))
    .map(t => testFileId(t.name))
  return [...new Set(files)].filter(Boolean)
}
/** Repli sur le texte de vitest (« FAIL  tests/x.test.ts », « ❯ tests/x.test.ts ») quand le rapport JSON manque */
export function failedFilesFromText(text) {
  const out = new Set()
  for (const m of String(text ?? '').matchAll(/(?:FAIL|❯|×)\s+((?:\S*\/)?tests\/[^\s>:]+\.test\.[cm]?[jt]sx?)/g)) out.add(testFileId(m[1]))
  return [...out]
}
/**
 * Verdict de vitest (CONTRACT.md §b) : 0 = rien ; des échecs dans les seuls tests de données = 30 (bundles: [],
 * bissection par candidat) ; tout autre échec, ou un échec sans fichier identifiable = 31.
 */
export function classifyVitest({ code, report, stdout = '', stderr = '' }) {
  if (code === 0) return null
  let files = report ? vitestFailedFiles(report) : []
  if (!files.length) files = failedFilesFromText(`${stdout}\n${stderr}`)
  if (!files.length) return { code: EXIT.CODE, reason: `vitest : échec sans fichier de test identifiable (code ${code}) ; ${tail(`${stdout}\n${stderr}`.trim(), 8)}`, failedTests: [] }
  const outside = files.filter(f => !DATA_TEST_FILES.includes(f))
  if (outside.length) return { code: EXIT.CODE, reason: `vitest : échec hors des tests de données (${outside.join(', ')})`, failedTests: files }
  return { code: EXIT.DATA, reason: `vitest : échec dans les tests de données (${files.join(', ')})`, bundles: [], failedTests: files }
}

/**
 * Les contrôles de ship, du moins cher au plus cher (CONTRACT.md d.11 ; PIPELINE.md, garde-fou de la primaire).
 * Chacun : { id, label, cmd, args, map(résultat) → null | { code, reason, bundles? } }. « primary » est suivi par
 * ship d'un « git diff --quiet » sur PRIMARY_DIFF ; après chaque contrôle, ship exige un arbre propre (31 sinon).
 */
export function checkPlan({ node = process.execPath, port, vitestReport }) {
  const vitest = {
    id: 'vitest',
    label: 'npx vitest run',
    cmd: 'npx',
    args: ['vitest', 'run', '--reporter=default', '--reporter=json', `--outputFile.json=${vitestReport}`],
    map: r => classifyVitest({ code: r.code, report: r.report, stdout: r.stdout, stderr: r.stderr }),
  }
  return [
    { id: 'build', label: 'reconstruction (tools/veille/build.mjs)', cmd: node, args: ['tools/veille/build.mjs'], map: r => mapVeilleScript(r, 'reconstruction') },
    { id: 'check-log', label: 'pipeline-helpers check-log', cmd: node, args: ['tools/pipeline-helpers.mjs', 'check-log', D], map: mapDataTool('check-log') },
    { id: 'history', label: 'positions-history check', cmd: node, args: ['tools/positions-history.mjs', 'check', D, S], map: mapDataTool('positions-history check') },
    {
      id: 'primary',
      label: 'reconstruction de la primaire',
      cmd: node,
      args: ['tools/build-pack.mjs', 'research/choisir-2027/question-bank-output.json', 'research/choisir-2027', 'src/elections/choisir-2027', 'research/choisir-2027/expansion-merged.json'],
      map: mapCodeTool('reconstruction de la primaire'),
    },
    {
      id: 'audit-pack',
      label: 'audit-pack',
      cmd: node,
      args: ['tools/audit-pack.mjs', 'presidentielle-2027'],
      map: r => (r.code === 0 ? null : r.code === 1 ? { code: EXIT.DATA, reason: `audit-pack : contrôles durs en échec ; ${lastLines(r)}`, bundles: [] } : mapCodeTool('audit-pack')(r)),
    },
    { id: 'tsc', label: 'npx tsc --noEmit', cmd: 'npx', args: ['tsc', '--noEmit', '-p', 'tsconfig.json'], map: mapCodeTool('tsc') },
    { id: 'eslint', label: 'npx eslint .', cmd: 'npx', args: ['eslint', '.'], map: mapCodeTool('eslint') },
    vitest,
    { id: 'pnpm-build', label: 'pnpm build (check-dist compris)', cmd: 'pnpm', args: ['build'], map: mapCodeTool('pnpm build') },
    { id: 'e2e', label: `e2e hors ligne (port ${port})`, cmd: node, args: ['tools/e2e-offline.mjs', String(port)], map: mapCodeTool('e2e-offline') },
  ]
}
/** Ce que la reconstruction de la primaire ne doit jamais changer (PIPELINE.md, garde-fou de la primaire) */
export const PRIMARY_DIFF = Object.freeze(['src/elections/choisir-2027', 'research/choisir-2027/bank.json'])

// ——— dist/index.html ———

/** L'asset d'entrée « assets/index-*.js » d'une page (dist/index.html, ou la page servie), ou null */
export function indexAssetOf(html) {
  const text = String(html ?? '')
  const tagged = text.match(/<script[^>]*\bsrc="\/?(assets\/index-[A-Za-z0-9_-]+\.js)"/)
  if (tagged) return tagged[1]
  return text.match(/assets\/index-[A-Za-z0-9_-]+\.js/)?.[0] ?? null
}
/** Les assets que la page appelle (src, href), sans doublon : ceux qui doivent répondre 200 après le déploiement */
export function referencedAssets(html) {
  const out = new Set()
  for (const m of String(html ?? '').matchAll(/\b(?:src|href)="\/?(assets\/[^"?#]+)/g)) out.add(m[1])
  return [...out]
}

// ——— Gardes de fichiers ———

/** Les deux valeurs sont-elles égales, clés triées ? */
const same = (a, b) => canonical(a ?? null) === canonical(b ?? null)

/**
 * election.ts : seules changent les clés du niveau (ELECTION_KEYS) ; au niveau accord, ranking ne change que par
 * ranking.excluded. Les commentaires ne se voient pas ici (objets chargés). Rend les écarts.
 */
export function electionDiffErrors(base, head, tier = 'auto') {
  const allowed = ELECTION_KEYS[tier]
  if (!allowed) return [`niveau inconnu : ${tier}`]
  const errors = []
  for (const k of [...new Set([...Object.keys(base ?? {}), ...Object.keys(head ?? {})])]) {
    if (same(base?.[k], head?.[k]) || allowed.includes(k)) continue
    if (k === 'ranking' && tier === 'accord') {
      const strip = r => (isPlainObject(r) ? { ...r, excluded: null } : r)
      if (same(strip(base?.ranking), strip(head?.ranking))) continue
      errors.push('election.ts : ranking a changé ailleurs que dans ranking.excluded')
      continue
    }
    errors.push(`election.ts : « ${k} » a changé (au niveau ${tier}, seules changent ${allowed.join(', ')}${tier === 'accord' ? ', ranking.excluded' : ''})`)
  }
  return errors
}

/** config.json : au niveau auto, seul contextDate change ; au niveau accord, rien n'est contrôlé ici */
export function configDiffErrors(base, head, tier = 'auto') {
  if (tier === 'accord') return []
  const errors = []
  for (const k of [...new Set([...Object.keys(base ?? {}), ...Object.keys(head ?? {})])]) {
    if (k !== 'contextDate' && !same(base?.[k], head?.[k])) errors.push(`config.json : « ${k} » a changé (au niveau auto, seul contextDate change)`)
  }
  return errors
}

/** Différence de deux listes vues comme des multiensembles (égalité clés triées) : { added, removed } */
export function multisetDiff(base = [], head = []) {
  const counts = new Map()
  for (const e of base) counts.set(canonical(e), (counts.get(canonical(e)) ?? 0) + 1)
  const added = []
  for (const e of head) {
    const k = canonical(e)
    if ((counts.get(k) ?? 0) > 0) counts.set(k, counts.get(k) - 1)
    else added.push(e)
  }
  const removed = []
  for (const e of base) {
    const k = canonical(e)
    if ((counts.get(k) ?? 0) > 0) {
      removed.push(e)
      counts.set(k, counts.get(k) - 1)
    }
  }
  return { added, removed }
}

const escapeRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** « <questionId>-<lettre a à p> » (tests/transfer.test.ts) */
const approachOf = q => new RegExp(`^${escapeRe(q)}-[a-p]$`)

/** Écarts d'une entrée de positions de decisions.json, ajoutée ou changée (invariants de CONTRACT.md d.11) */
export function decisionEntryErrors(e) {
  const where = `decisions.json, ${e?.candidate ?? '?'} / ${e?.approachId ?? '?'}`
  const errors = []
  if (typeof e?.questionId !== 'string' || !approachOf(e.questionId).test(String(e?.approachId ?? ''))) {
    errors.push(`${where} : l’approche n’est pas de la forme ${e?.questionId ?? '<question>'}-[a-p]`)
  }
  if (typeof e?.note !== 'string' || !e.note.includes('AVANT') || !e.note.includes('APRÈS')) errors.push(`${where} : la note ne dit pas AVANT et APRÈS`)
  if (!HISTORY_CAUSES.includes(e?.historyCause)) errors.push(`${where} : historyCause inconnue ou absente (${e?.historyCause ?? 'aucune'})`)
  const stated = e?.statedAt != null
  if (e?.historyCause === 'prise-de-position' && !(stated && STATED.test(String(e.statedAt)))) errors.push(`${where} : prise de position sans statedAt (AAAA-MM-JJ)`)
  if (e?.historyCause !== 'prise-de-position' && stated) errors.push(`${where} : statedAt sans prise de position (cause ${e?.historyCause ?? 'aucune'})`)
  return errors
}

/** Identifiants d'approches déjà employés : banque publiée, addApproaches, dropApproaches (une lettre ne revient jamais) */
function usedApproachIds(decisions, bank) {
  const used = new Set()
  for (const q of bank?.bank?.questions ?? []) for (const a of q.approaches ?? []) used.add(a.id)
  for (const a of decisions?.addApproaches ?? []) used.add(a.id)
  for (const d of decisions?.dropApproaches ?? []) for (const v of Object.values(d ?? {})) if (typeof v === 'string' && /-[a-p]$/.test(v)) used.add(v)
  return used
}

/**
 * decisions.json de origin/main (base) contre celui de HEAD : entrées de positions ajoutées ou changées conformes,
 * aucune entrée effacée (une entrée se remplace à sa place), approches ajoutées de forme <q>-[a-p] et de lettre neuve,
 * et au niveau auto, aucune autre section changée.
 */
export function decisionsErrors(base, head, { tier = 'auto', baseBank = null } = {}) {
  const errors = []
  if (tier === 'auto') {
    for (const k of [...new Set([...Object.keys(base ?? {}), ...Object.keys(head ?? {})])]) {
      if (!DECISIONS_SECTIONS_AUTO.includes(k) && !same(base?.[k], head?.[k])) errors.push(`decisions.json : la section « ${k} » a changé (au niveau auto, seules positions et addApproaches changent)`)
    }
  }
  const keyOf = e => `${e?.candidate}|${e?.approachId}`
  const pos = multisetDiff(base?.positions ?? [], head?.positions ?? [])
  const replaced = new Set(pos.added.map(keyOf))
  for (const r of pos.removed) if (!replaced.has(keyOf(r))) errors.push(`decisions.json : l’entrée ${keyOf(r).replace('|', ' / ')} a disparu (une entrée se remplace à sa place, elle ne s’efface pas)`)
  for (const e of pos.added) errors.push(...decisionEntryErrors(e))
  const aa = multisetDiff(base?.addApproaches ?? [], head?.addApproaches ?? [])
  for (const r of aa.removed) errors.push(`decisions.json : l’approche ajoutée ${r?.id} a disparu de addApproaches`)
  const used = usedApproachIds(base, baseBank)
  for (const a of aa.added) {
    if (typeof a?.questionId !== 'string' || !approachOf(a.questionId).test(String(a?.id ?? ''))) errors.push(`addApproaches : ${a?.id} n’est pas de la forme ${a?.questionId ?? '<question>'}-[a-p]`)
    else if (used.has(a.id)) errors.push(`addApproaches : la lettre de ${a.id} a déjà servi (une lettre n’est jamais réutilisée)`)
  }
  return errors
}

/** bank.json : au plus 9 approches par question, d'identifiants <q>-[a-p] */
export function bankApproachErrors(bank) {
  const errors = []
  for (const q of bank?.bank?.questions ?? []) {
    const list = q.approaches ?? []
    if (list.length > MAX_APPROACHES) errors.push(`bank.json : ${q.id} a ${list.length} approches (au plus ${MAX_APPROACHES})`)
    for (const a of list) if (!approachOf(q.id).test(String(a.id))) errors.push(`bank.json : approche ${a.id} hors de la forme ${q.id}-[a-p]`)
  }
  return errors
}

/** explainers.json et explainer-charts.json : aucune explication ni aucun graphique publiés ne changent (vidéos) */
export function explainersErrors(base, head, file = 'explainers.json') {
  const errors = []
  if (Array.isArray(base?.explainers)) {
    const h = new Map((head?.explainers ?? []).map(x => [x?.questionId, x]))
    for (const x of base.explainers) {
      if (!h.has(x?.questionId)) errors.push(`${file} : l’explication de ${x?.questionId} a disparu`)
      else if (!same(x, h.get(x.questionId))) errors.push(`${file} : l’explication de ${x.questionId} a changé (une explication publiée ne se retouche pas : vidéos)`)
    }
  }
  if (Array.isArray(base?.charts)) {
    const { removed } = multisetDiff(base.charts, head?.charts ?? [])
    if (removed.length) errors.push(`${file} : ${removed.length} graphique(s) publié(s) changé(s) ou retiré(s)`)
  }
  return errors
}

/** Toute valeur de base se retrouve dans head (head peut ajouter des clés) : transfer-slots, ajout seul */
export function preservesBase(base, head, path = '$') {
  if (isPlainObject(base) && isPlainObject(head)) {
    const errors = []
    for (const k of Object.keys(base)) {
      if (!(k in head)) errors.push(`${path}.${k} a disparu`)
      else errors.push(...preservesBase(base[k], head[k], `${path}.${k}`))
    }
    return errors
  }
  return same(base, head) ? [] : [`${path} a changé (${JSON.stringify(base)} → ${JSON.stringify(head)})`]
}

/**
 * Les trois constantes exactes que remeasure.mjs recalcule dans src/core/echiquierMethodCopy.ts (mêmes motifs que
 * patchExactConstants de lib/remeasure.mjs) : seuls leurs nombres peuvent changer
 */
const NUM = '\\d+(?:\\.\\d+)?'
const METHOD_CONSTANTS = Object.freeze([
  { name: 'ECHIQUIER_WEIGH.compatibleShare', re: `(\\n {2}compatibleShare: \\{ low: )(${NUM})(, lowWhere: '[^']*', high: )(${NUM})(, highWhere: '[^']*' \\})`, pair: true },
  { name: 'ECHIQUIER_CROSS.deduced', re: `(\\n {2}deduced: \\{ low: )(${NUM})(, lowWhere: '[^']*', high: )(${NUM})(, highWhere: '[^']*' \\})`, pair: true },
  { name: 'ECHIQUIER_MANNER.style', re: '(\\n {2}style: \\[)([^\\]\\n]*)(\\],)', pair: false },
  { name: 'ECHIQUIER_MANNER.styleQuick', re: '(\\n {2}styleQuick: \\[)([^\\]\\n]*)(\\],)', pair: false },
])
const NUMBER_LIST = new RegExp(`^\\s*${NUM}(\\s*,\\s*${NUM})*\\s*$`)

/**
 * echiquierMethodCopy.ts de la base contre celui de HEAD : une fois les valeurs des trois constantes masquées, les deux
 * textes sont identiques, et chaque valeur nouvelle est un nombre (CONTRACT.md d.8 et d.11). Rend les écarts.
 */
export function methodCopyDiffErrors(baseText, headText) {
  const errors = []
  const mask = (text, which) => {
    let out = String(text ?? '')
    for (const c of METHOD_CONSTANTS) {
      const re = new RegExp(c.re, 'g')
      const hits = [...out.matchAll(re)]
      if (hits.length !== 1) {
        errors.push(`echiquierMethodCopy.ts (${which}) : ${hits.length} correspondance(s) pour ${c.name}, une seule attendue`)
        continue
      }
      if (!c.pair && !NUMBER_LIST.test(hits[0][2])) errors.push(`echiquierMethodCopy.ts (${which}) : ${c.name} n’est pas une liste de nombres (« ${hits[0][2]} »)`)
      out = out.replace(re, (...m) => (c.pair ? `${m[1]}#${m[3]}#${m[5]}` : `${m[1]}#${m[3]}`))
    }
    return out
  }
  const base = mask(baseText, 'base')
  const head = mask(headText, 'HEAD')
  if (!errors.length && base !== head) errors.push('echiquierMethodCopy.ts : le texte a changé ailleurs que dans les nombres des trois constantes recalculées (compatibleShare, deduced, style, styleQuick)')
  return errors
}

/** build.json : la liste include (les masqués de la primaire, toujours construits) ne change jamais par la veille */
export function buildIncludeErrors(base, head) {
  return same(base?.include ?? null, head?.include ?? null) ? [] : ['build.json : include a changé (--include faure,guedj,maurel,royal, règle permanente)']
}

const setOf = list => new Set((Array.isArray(list) ? list : []).map(String))
/** Écart de deux listes vues comme des ensembles : { added, removed } */
const setDiff = (a, b) => {
  const A = setOf(a)
  const B = setOf(b)
  return { added: [...B].filter(x => !A.has(x)), removed: [...A].filter(x => !B.has(x)) }
}
/** La liste n'a changé que par l'ajout (gain) ou le retrait (loss) de l'identifiant id, ou pas du tout */
const onlyBy = (a, b, id, { gain = false, loss = false } = {}) => {
  const { added, removed } = setDiff(a, b)
  return added.every(x => gain && x === id) && removed.every(x => loss && x === id)
}
/** Les listes candidateIds et hiddenCandidateIds de src/elections/index.ts, dans l'ordre, et le texte qui les entoure */
function registryLists(text) {
  const lists = []
  const masked = String(text ?? '').replace(/\b(candidateIds|hiddenCandidateIds): \[([^\]]*)\]/g, (_, key, body) => {
    lists.push({ key, ids: [...body.matchAll(/'([^']+)'/g)].map(m => m[1]) })
    return `${key}: [#]`
  })
  return { masked, lists }
}

/**
 * Au niveau accord, l'écart d'origin/main à HEAD ne touche que l'attente accordée (CONTRACT.md d.11, accord du
 * propriétaire) : item = accordItemOf(runId) ; base et head = { config, election, indexText } ; media = [{ status, path }]
 * (git diff --name-status sous S/media). Règles :
 *   C-<id> (nouveau candidat) : config.json gagne la seule entrée <id> (le reste à l'identique, contextDate à part) ;
 *     election.hidden inchangé ; forbiddenTerms ne fait que gagner (2 termes au plus) ; ranking.excluded ne change que
 *     par <id> (ids, joined) ; index.ts : candidateIds gagne <id>, rien d'autre ; media : portrait <id>.*, logos ajoutés,
 *     CREDITS.md ;
 *   R-<id> (retrait) : seule l'entrée <id> de config.json peut changer ; election.hidden gagne <id> ; ranking.excluded ne
 *     change que par <id> ; index.ts : <id> passe de candidateIds à hiddenCandidateIds ; media inchangé ;
 *   D-<id> (redéclaration d'un masqué) : l'inverse de R- ;
 *   I-<id> (réintégration) : ranking.excluded perd <id>, rien d'autre ;
 *   H-…, F-…, O-… : rien de plus qu'au niveau auto (config.json par contextDate, election.ts par ses clés de données).
 * Rend les écarts.
 */
export function accordDiffErrors({ item, base = {}, head = {}, media = [] }) {
  if (!item) return ['accord : attente introuvable dans le runId']
  const errors = []
  const id = item.subject
  const kind = item.kind
  // config.json
  const bc = base.config ?? {}
  const hc = head.config ?? {}
  for (const k of [...new Set([...Object.keys(bc), ...Object.keys(hc)])]) {
    if (['contextDate', 'candidates', 'forbiddenTerms', 'scoringExcluded'].includes(k)) continue
    if (!same(bc[k], hc[k])) errors.push(`config.json : « ${k} » a changé (accord ${item.id})`)
  }
  const others = list => (list ?? []).filter(c => c?.id !== id)
  if (!same(others(bc.candidates), others(hc.candidates))) errors.push(`config.json : des candidats autres que ${id} ont changé (accord ${item.id})`)
  const inBase = (bc.candidates ?? []).some(c => c?.id === id)
  const inHead = (hc.candidates ?? []).some(c => c?.id === id)
  if (kind === 'candidat' && (inBase || !inHead)) errors.push(`config.json : l’accord ${item.id} ajoute l’entrée ${id}, absente d’origin/main`)
  if (['retrait', 'redeclaration'].includes(kind) && !inHead) errors.push(`config.json : l’entrée ${id} a disparu (accord ${item.id})`)
  if (!['candidat', 'retrait', 'redeclaration'].includes(kind) && !same((bc.candidates ?? []).find(c => c?.id === id) ?? null, (hc.candidates ?? []).find(c => c?.id === id) ?? null)) {
    errors.push(`config.json : l’entrée ${id} a changé (accord ${item.id})`)
  }
  // election.ts (les clés sont déjà limitées par electionDiffErrors au niveau accord)
  const be = base.election ?? {}
  const he = head.election ?? {}
  const hiddenOk = kind === 'retrait' ? onlyBy(be.hidden, he.hidden, id, { gain: true })
    : kind === 'redeclaration' ? onlyBy(be.hidden, he.hidden, id, { loss: true })
      : onlyBy(be.hidden, he.hidden, id)
  if (!hiddenOk) errors.push(`election.ts : hidden change autrement que par ${id} (accord ${item.id})`)
  for (const [where, b, h] of [['election.ts', be.forbiddenTerms, he.forbiddenTerms], ['config.json', bc.forbiddenTerms, hc.forbiddenTerms]]) {
    const { added, removed } = setDiff(b, h)
    if (removed.length || (kind !== 'candidat' && added.length) || added.length > 2) errors.push(`${where} : forbiddenTerms ${removed.length ? `perd ${removed.join(', ')}` : `gagne ${added.join(', ')}`} (accord ${item.id} : seul un nouveau candidat ajoute au plus deux termes)`)
  }
  const bx = be.ranking?.excluded ?? {}
  const hx = he.ranking?.excluded ?? {}
  // Les non-classés (ranking.excluded.ids, et leur copie scoringExcluded de config.json) : par l'identifiant seul
  const excludedBy = (a, b) => (kind === 'candidat' ? onlyBy(a, b, id, { gain: true })
    : kind === 'reintegration' ? onlyBy(a, b, id, { loss: true })
      : ['retrait', 'redeclaration'].includes(kind) ? onlyBy(a, b, id, { gain: true, loss: true })
        : onlyBy(a, b, id))
  const excludedOk = excludedBy(bx.ids, hx.ids)
    && onlyBy(Object.keys(bx.joined ?? {}), Object.keys(hx.joined ?? {}), id, { gain: kind === 'candidat', loss: kind === 'reintegration' })
    && same({ ...bx, ids: null, joined: null }, { ...hx, ids: null, joined: null })
  if (!excludedOk) errors.push(`election.ts : ranking.excluded change autrement que par ${id} (accord ${item.id})`)
  if (!excludedBy(bc.scoringExcluded, hc.scoringExcluded)) errors.push(`config.json : scoringExcluded change autrement que par ${id} (accord ${item.id})`)
  // src/elections/index.ts
  if (base.indexText != null || head.indexText != null) {
    const bi = registryLists(base.indexText)
    const hi = registryLists(head.indexText)
    if (bi.masked !== hi.masked || bi.lists.length !== hi.lists.length) errors.push(`src/elections/index.ts : changé ailleurs que dans candidateIds et hiddenCandidateIds (accord ${item.id})`)
    else {
      bi.lists.forEach((l, i) => {
        const h = hi.lists[i]
        const visibleGain = kind === 'candidat' || kind === 'redeclaration'
        const ok = l.key === 'candidateIds'
          ? onlyBy(l.ids, h.ids, id, { gain: visibleGain, loss: kind === 'retrait' })
          : onlyBy(l.ids, h.ids, id, { gain: kind === 'retrait', loss: kind === 'redeclaration' })
        if (!ok) errors.push(`src/elections/index.ts : ${l.key} change autrement que par ${id} (accord ${item.id})`)
      })
    }
  }
  // media/**
  for (const m of media) {
    const file = String(m.path ?? '').split('/').slice(4).join('/')
    const ok = kind === 'candidat' && (file === 'CREDITS.md' || new RegExp(`^${escapeRe(id)}\\.(jpe?g|png|webp|svg)$`).test(file) || (file.startsWith('logos/') && m.status === 'A'))
    if (!ok) errors.push(`${m.path} (${m.status}) : hors des fichiers de l’accord ${item.id}`)
  }
  return errors
}

// ——— Déploiement et contrôle de la production ———

/** vercel deploy dist --project <p> --scope <s> --prod --yes */
export const deployArgs = policy => ['deploy', 'dist', '--project', policy.ship.vercelProject, '--scope', policy.ship.vercelScope, '--prod', '--yes']
/** La commande exacte à donner au propriétaire */
export const deployCommandText = (root, policy) => `cd ${root} && vercel ${deployArgs(policy).join(' ')}`
/** Adresse du déploiement imprimée par vercel (la dernière https://…), ou null */
export const deployUrlOf = stdout => [...String(stdout ?? '').matchAll(/https:\/\/[^\s"'<>]+/g)].map(m => m[0]).at(-1) ?? null

/** Pause de quelques millisecondes (injectable dans prodCheck) */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Contrôle de la production (CONTRACT.md d.11, étape 8) : jusqu'à attempts essais à delayMs d'écart, chacun
 * « curl -s -A IsoloirBot/1.0 <prodUrl>?v=<horodatage> » ; l'asset index-*.js servi doit être indexAsset, puis chaque
 * asset de assets doit répondre 200. runner(cmd, args, opts) → { code, stdout } (run de common.mjs, ou un faux).
 * Rend { ok, tries: [{ attempt, served, missing }] }.
 */
export async function prodCheck({ runner, cwd, prodUrl, indexAsset, assets = [], attempts = 3, delayMs = 20000, wait = sleep, stamp = () => Date.now() }) {
  const tries = []
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const page = runner('curl', ['-s', '--max-time', '30', '-A', USER_AGENT, `${prodUrl}?v=${stamp()}`], { cwd })
    const served = page.code === 0 ? indexAssetOf(page.stdout) : null
    const missing = []
    if (served && served === indexAsset) {
      for (const a of assets) {
        const r = runner('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '30', '-A', USER_AGENT, new URL(a, prodUrl).href], { cwd })
        const status = String(r.stdout ?? '').trim()
        if (r.code !== 0 || status !== '200') missing.push(`${a} (${status || `curl ${r.code}`})`)
      }
      if (!missing.length) {
        tries.push({ attempt, served, missing })
        return { ok: true, tries }
      }
    }
    tries.push({ attempt, served, missing })
    if (attempt < attempts) await wait(delayMs)
  }
  return { ok: false, tries }
}

/** Valeur de last-ship.json (schéma LAST_SHIP, plus distIndexSha1 et branch pour --deploy-only) */
export function lastShipRecord({ sha, tree, dataVersion, indexAsset, at, runId, deployed, checked, deployUrl = null, distIndexSha1 = null, branch = null }) {
  return { sha, tree, dataVersion: String(dataVersion ?? 'inconnue'), indexAsset, at, runId, deployed: !!deployed, checked: !!checked, deployUrl, distIndexSha1, branch }
}

/** Texte de PAUSE après un 41 : la raison, l'état, et les commandes que le propriétaire peut lancer (rien d'automatique) */
export function pauseText({ at, runId, sha, indexAsset, tries = [], root, policy, pauseFile }) {
  const served = tries.map(t => `essai ${t.attempt} : ${t.served ?? 'aucun asset lu'}${t.missing?.length ? ` ; manquants : ${t.missing.join(', ')}` : ''}`)
  return [
    `PAUSE créée par tools/veille/ship.mjs le ${at} (exécution ${runId}, commit ${sha}).`,
    `Raison : la production (${policy.ship.prodUrl}) ne sert pas l’asset attendu ${indexAsset} après ${tries.length} essai(s) (code 41).`,
    ...served.map(s => `  - ${s}`),
    'Aucun retour arrière automatique : le propriétaire décide.',
    `  - redéployer le même dist : ${deployCommandText(root, policy)}`,
    `  - revenir au déploiement précédent : vercel rollback --scope ${policy.ship.vercelScope}`,
    `Toute exécution de la veille sort en 20 tant que ce fichier existe : l’effacer (${pauseFile}) pour la relancer.`,
    '',
  ].join('\n')
}

// ——— Port de l'e2e ———

/** Le port se lie-t-il sur cette adresse ? Une adresse absente de la machine (pas d'IPv6) compte comme libre */
const tryBind = (port, host) => new Promise(resolve => {
  const server = createServer()
  server.once('error', e => resolve(e?.code === 'EADDRNOTAVAIL' || e?.code === 'EAFNOSUPPORT'))
  server.listen(port, host, () => server.close(() => resolve(true)))
})
/**
 * Le port est-il libre sur 127.0.0.1 ET sur ::1 ? vite preview, sans --host, n'écoute que sur ::1 (localhost) : un
 * aperçu orphelin d'un autre worktree y passerait inaperçu, et l'e2e testerait son dist à lui
 */
export async function portIsFree(port) {
  return (await tryBind(port, '127.0.0.1')) && (await tryBind(port, '::1'))
}
/** Premier port libre parmi le port demandé, puis 4373 et 4375 ; jamais 4320, 4347 ni 4361 ; null si aucun */
export async function pickPort(preferred, { isFree = portIsFree } = {}) {
  for (const p of [...new Set([preferred, ...FALLBACK_PORTS])]) {
    if (!Number.isInteger(p) || FORBIDDEN_PORTS.includes(p)) continue
    if (await isFree(p)) return p
  }
  return null
}
