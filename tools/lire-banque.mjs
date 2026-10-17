// Lecture de la banque pour les agents des workflows (6-add-candidate, 9-refresh-positions ; contrat de la veille :
// tools/veille/CONTRACT.md, §d.1) : des extraits exacts et compacts de research/<id>/bank.json, sans charger la banque
// entière dans leur contexte. Remplace les « node -e » que 6-add-candidate donnait à ses agents : c'est la SEULE
// commande que la veille automatique autorise aux agents. En lecture seule : n'écrit rien, nulle part (ni fichier, ni
// état local de la veille), n'appelle ni le réseau ni une IA. Sortie déterministe : même banque, même sortie.
//
// Usage : node <root>/tools/lire-banque.mjs <commande> … [--bank <bank.json>] [--root <abs>]
//   questions <id>[,<id>…] [<id>…]
//       Une ligne JSON par question demandée, dans l'ordre de la banque : {id,topicId,tier,step,prompt,context,
//       approaches} (step et context omis s'ils manquent). Identique octet pour octet à l'ancien showQuestions de
//       6-add-candidate. Une question absente de la banque : sortie 2.
//   preflight <candidateId> [--files <f>…]
//       Un objet : {problems, files:[{path,exists}], questions:[{id,topicId,tier,step (0 si absent),approaches:[ids],
//       external:[ids]}], candidatesInBank, alreadyCoded}. Identique à l'ancien PREFLIGHT_CMD de 6-add-candidate.
//       --files prend tous les chemins qui le suivent, jusqu'à l'option suivante. Banque absente : problems =
//       [« banque absente : <f> »], sans questions, et sortie 0. Un candidat absent de la banque est permis (il
//       est en train d'y entrer) : alreadyCoded vaut 0.
//   candidat <candidateId> [--questions <id>[,<id>…]]
//       Une ligne JSON par question de la banque (ou des seules questions de --questions, qui allège la sortie d'un
//       agent qui recode quelques questions) : {id, topicId, tier, step?, prompt, approaches:[{id,text}],
//       positions:{<approche>: position publiée, telle quelle}, latestSourceDate:{<approche>: date|null}}. Les agents
//       recopient « before » d'ici. latestSourceDate : la date de source la plus récente de la position, au sens de
//       latestSourceDate de src/core/positionsHistory.ts (AAAA-MM-JJ, ou AAAA-MM quand la source n'a qu'un mois ; les
//       dates en texte libre ne comptent pas), celle qu'applique tools/veille/apply.mjs.
//   question-all <questionId>
//       Un objet : {id, topicId, tier, prompt, context?, approaches, candidates:[{candidateId, name,
//       positions:{<approche>:{weight?,rejects?,nature,confidence,summary}}}]}, pour les SEULS candidats présentés,
//       dans l'ordre de config.json (ni election.hidden, ni pendingPrimary ; positions {} quand rien n'est connu) :
//       le contexte d'égalité de traitement. Lit aussi config.json (à côté de la banque) et, pour election.hidden,
//       <root>/src/elections/<config.id>/election.ts (import TypeScript direct, seulement pour cette commande).
//   unknown <candidateId> [--tier essentiel|approfondi]
//       Un objet : {candidateId, unknown:[{id, topicId, tier, step?}]} : les questions que knownQuestions de
//       src/core/score.ts ne compte pas pour ce candidat (aucune approche portée ni rejetée avec une confiance autre
//       que low), dans l'ordre de la banque.
// Options :
//   --bank  la banque à lire (défaut : <root>/research/presidentielle-2027/bank.json) ; config.json est lu à côté.
//   --root  la racine du dépôt (défaut : le checkout qui contient ce fichier ; ISOLOIR_VEILLE_ROOT), pour les tests.
// Candidat absent de la banque (positions, prepared) : sortie 2 pour candidat et unknown ; un masqué reste lisible.
// Codes de sortie : 0, ou 2 (appel mal formé, option inconnue, --reset-revisions, banque ou question introuvable) ;
// une erreur imprime une ligne JSON {"script":"lire-banque","code":2,"ok":false,"reason":…} sur stdout et sa raison
// en français sur stderr. Il faut Node 22.18+ (TypeScript sans compilation, pour question-all).

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ELECTION_ID, EXIT, VeilleError, fail, parseArgs, rootFrom } from './veille/lib/common.mjs'

const COMMANDS = ['questions', 'preflight', 'candidat', 'question-all', 'unknown']
const CANDIDATE_ID = /^[a-z][a-z0-9]*$/
/** Options permises, commande par commande (--files est lu à part : il prend plusieurs chemins) */
const SPECS = {
  questions: {},
  preflight: {},
  candidat: { questions: { type: 'list' } },
  'question-all': {},
  unknown: { tier: { type: 'string', choices: ['essentiel', 'approfondi'] } },
}

// ——— Règles du site, recopiées (tests/lire-banque.test.ts les compare au code de src/core) ———

/** effectiveWeight de src/core/score.ts : poids qui compte, 0 pour une confiance low, 1 au plus pour une inférence */
const effectiveWeight = p => (!p || p.confidence === 'low' || !p.weight ? 0 : p.nature === 'inference' ? Math.min(p.weight, 1) : p.weight)
/** stance de src/core/score.ts : le poids s'il porte l'approche, −1 s'il la rejette explicitement, 0 sinon */
function stance(p) {
  const w = effectiveWeight(p)
  if (w > 0) return w
  return p && p.rejects && p.confidence !== 'low' ? -1 : 0
}
/** latestSourceDate de src/core/positionsHistory.ts : la date de source AAAA-MM-JJ ou AAAA-MM la plus récente */
function latestSourceDate(p) {
  const dates = (p?.sources ?? []).map(s => s.date).filter(d => !!d && /^\d{4}-\d{2}(-\d{2})?$/.test(d))
  return dates.length ? dates.sort().at(-1) : null
}

// ——— Lecture ———

function readJsonFile(file, what) {
  if (!existsSync(file)) fail(EXIT.USAGE, `${what} absente : ${file}`)
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    fail(EXIT.USAGE, `${file} : JSON illisible (${e.message})`)
  }
}
function readBank(file) {
  const j = readJsonFile(file, 'banque')
  if (!Array.isArray(j?.bank?.questions) || !j.positions || typeof j.positions !== 'object') fail(EXIT.USAGE, `${file} : ce n'est pas une banque construite ({ bank: { questions }, positions })`)
  return j
}
/** La table de positions d'un candidat (positions, sinon prepared), ou null s'il n'est pas dans la banque */
const tableOf = (j, c) => j.positions[c] ?? (j.prepared ?? {})[c] ?? null
function candidateTable(j, c, bankFile) {
  const t = tableOf(j, c)
  if (!t) fail(EXIT.USAGE, `candidat inconnu de la banque : ${c} (${bankFile})`)
  return t
}
function questionById(j, id, bankFile) {
  const q = j.bank.questions.find(x => x.id === id)
  if (!q) fail(EXIT.USAGE, `question inconnue de la banque : ${id} (${bankFile})`)
  return q
}
const withStep = q => (q.step === undefined ? {} : { step: q.step })

// ——— Commandes ———

/** Ancien showQuestions : une ligne par question demandée, dans l'ordre de la banque */
function questions(j, ids, bankFile) {
  if (!ids.length) fail(EXIT.USAGE, 'questions : au moins un identifiant de question attendu (questions <id>[,<id>…])')
  const known = new Set(j.bank.questions.map(q => q.id))
  const missing = ids.filter(id => !known.has(id))
  if (missing.length) fail(EXIT.USAGE, `question inconnue de la banque : ${missing.join(', ')} (${bankFile})`)
  const s = new Set(ids)
  return j.bank.questions
    .filter(q => s.has(q.id))
    .map(q => JSON.stringify({ id: q.id, topicId: q.topicId, tier: q.tier, step: q.step, prompt: q.prompt, context: q.context, approaches: q.approaches }))
}

/** Ancien PREFLIGHT_CMD : même objet, mêmes clés, même ordre */
function preflight(bankFile, c, files) {
  const o = { problems: [], files: files.map(p => ({ path: p, exists: existsSync(p) })) }
  if (!existsSync(bankFile)) {
    o.problems.push('banque absente : ' + bankFile)
    return JSON.stringify(o)
  }
  const j = readBank(bankFile)
  o.questions = j.bank.questions.map(q => ({
    id: q.id, topicId: q.topicId, tier: q.tier, step: q.step || 0,
    approaches: q.approaches.map(a => a.id), external: q.approaches.filter(a => a.external).map(a => a.id),
  }))
  o.candidatesInBank = [...Object.keys(j.positions), ...Object.keys(j.prepared || {})]
  o.alreadyCoded = Object.keys(j.positions[c] || (j.prepared || {})[c] || {}).length
  return JSON.stringify(o)
}

/** Une ligne par question : approches, positions publiées telles quelles, date de source la plus récente */
function candidat(j, c, only, bankFile) {
  const table = candidateTable(j, c, bankFile)
  const known = new Set(j.bank.questions.map(q => q.id))
  const missing = only.filter(id => !known.has(id))
  if (missing.length) fail(EXIT.USAGE, `question inconnue de la banque : ${missing.join(', ')} (${bankFile})`)
  const wanted = only.length ? new Set(only) : null
  return j.bank.questions.filter(q => !wanted || wanted.has(q.id)).map(q => {
    const held = q.approaches.filter(a => table[a.id] !== undefined)
    return JSON.stringify({
      id: q.id, topicId: q.topicId, tier: q.tier, ...withStep(q), prompt: q.prompt,
      approaches: q.approaches.map(a => ({ id: a.id, text: a.text })),
      positions: Object.fromEntries(held.map(a => [a.id, table[a.id]])),
      latestSourceDate: Object.fromEntries(held.map(a => [a.id, latestSourceDate(table[a.id])])),
    })
  })
}

/** Candidats masqués : election.hidden (election.ts de la racine) et pendingPrimary de config.json */
async function hiddenIds(root, config) {
  const ids = new Set(config.candidates.filter(c => c.pendingPrimary).map(c => c.id))
  const file = join(root, 'src', 'elections', String(config.id ?? ELECTION_ID), 'election.ts')
  if (existsSync(file)) {
    let election
    try {
      election = (await import(pathToFileURL(file).href)).election
    } catch (e) {
      fail(EXIT.USAGE, `${file} illisible : ${e.message}`)
    }
    for (const id of election?.hidden ?? []) ids.add(id)
  }
  return ids
}

/** La question et les positions de chaque candidat présenté : le contexte d'égalité de traitement */
async function questionAll(j, qid, bankFile, root) {
  const q = questionById(j, qid, bankFile)
  const configFile = join(dirname(bankFile), 'config.json')
  const config = readJsonFile(configFile, 'configuration')
  if (!Array.isArray(config.candidates)) fail(EXIT.USAGE, `${configFile} : candidates attendu`)
  const hidden = await hiddenIds(root, config)
  const brief = p => ({
    ...(p.weight === undefined ? {} : { weight: p.weight }),
    ...(p.rejects === undefined ? {} : { rejects: p.rejects }),
    nature: p.nature, confidence: p.confidence, summary: p.summary,
  })
  const candidates = config.candidates.filter(c => !hidden.has(c.id)).map(c => {
    const table = tableOf(j, c.id) ?? {}
    const held = q.approaches.filter(a => table[a.id] !== undefined)
    return { candidateId: c.id, name: c.name, positions: Object.fromEntries(held.map(a => [a.id, brief(table[a.id])])) }
  })
  return JSON.stringify({
    id: q.id, topicId: q.topicId, tier: q.tier, prompt: q.prompt, ...(q.context === undefined ? {} : { context: q.context }),
    approaches: q.approaches, candidates,
  })
}

/** Les questions que knownQuestions ne compte pas pour ce candidat */
function unknown(j, c, tier, bankFile) {
  const table = candidateTable(j, c, bankFile)
  const list = j.bank.questions
    .filter(q => !tier || q.tier === tier)
    .filter(q => !q.approaches.some(a => stance(table[a.id]) !== 0))
    .map(q => ({ id: q.id, topicId: q.topicId, tier: q.tier, ...withStep(q) }))
  return JSON.stringify({ candidateId: c, unknown: list })
}

// ——— Ligne de commande ———

/** --files <f>… : tous les arguments qui suivent, jusqu'à la prochaine option (un chemin peut contenir une virgule) */
function takeFiles(argv) {
  const rest = []
  const files = []
  let seen = false
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--files') {
      seen = true
      while (i + 1 < argv.length && !String(argv[i + 1]).startsWith('--')) files.push(argv[++i])
    } else if (String(a).startsWith('--files=')) {
      seen = true
      files.push(a.slice('--files='.length))
    } else rest.push(a)
  }
  return { rest, files, seen }
}

function candidateArg(command, args) {
  const [c, ...extra] = args
  if (!c) fail(EXIT.USAGE, `${command} : identifiant de candidat attendu (${command} <candidateId>)`)
  if (!CANDIDATE_ID.test(c)) fail(EXIT.USAGE, `${command} : identifiant de candidat invalide : « ${c} »`)
  if (extra.length) fail(EXIT.USAGE, `${command} : argument inattendu : ${extra.join(' ')}`)
  return c
}

async function main(argv) {
  for (const a of argv) if (String(a).includes('reset-revisions')) fail(EXIT.USAGE, '--reset-revisions est interdit (PIPELINE.md, étape 11)')
  const [command, ...tail] = argv
  if (!COMMANDS.includes(command)) fail(EXIT.USAGE, `commande attendue : ${COMMANDS.join(' | ')}${command ? ` (pas « ${command} »)` : ''}`)
  const { rest, files, seen } = takeFiles(tail)
  if (seen && command !== 'preflight') fail(EXIT.USAGE, `option inconnue pour ${command} : --files`)
  const opts = parseArgs(rest, { ...SPECS[command], bank: { type: 'string' }, root: { type: 'string' } })
  const root = rootFrom(opts)
  const bankFile = opts.bank ?? join(root, 'research', ELECTION_ID, 'bank.json')
  switch (command) {
    case 'questions': {
      const ids = opts._.flatMap(x => String(x).split(',')).map(x => x.trim()).filter(Boolean)
      return questions(readBank(bankFile), ids, bankFile)
    }
    case 'preflight':
      return [preflight(bankFile, candidateArg(command, opts._), files)]
    case 'candidat':
      return candidat(readBank(bankFile), candidateArg(command, opts._), opts.questions, bankFile)
    case 'question-all': {
      const [qid, ...extra] = opts._
      if (!qid) fail(EXIT.USAGE, 'question-all : identifiant de question attendu (question-all <questionId>)')
      if (extra.length) fail(EXIT.USAGE, `question-all : argument inattendu : ${extra.join(' ')}`)
      return [await questionAll(readBank(bankFile), qid, bankFile, root)]
    }
    case 'unknown':
      return [unknown(readBank(bankFile), candidateArg(command, opts._), opts.tier ?? null, bankFile)]
  }
  return []
}

// Pas de process.exit : la sortie (jusqu'à quelques centaines de ko) doit se vider entière dans un tube. Un lecteur
// qui ferme le tube avant la fin (« | head ») n'est pas une erreur.
process.stdout.on('error', e => {
  if (e?.code !== 'EPIPE') throw e
})
main(process.argv.slice(2))
  .then(lines => {
    if (lines.length) process.stdout.write(lines.join('\n') + '\n')
  })
  .catch(e => {
    const reason = e instanceof VeilleError ? e.message : `erreur inattendue : ${e?.message ?? e}`
    process.stderr.write(`${reason}\n`)
    process.stdout.write(JSON.stringify({ script: 'lire-banque', code: EXIT.USAGE, ok: false, reason }) + '\n')
    process.exitCode = EXIT.USAGE
  })
