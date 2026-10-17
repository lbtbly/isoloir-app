// Champs d'election.ts qui suivent une publication de la veille automatique d'Isoloir (constructeur B7 ; contrat :
// tools/veille/CONTRACT.md §d.9, annexes A2 et A3) : dataVersion, dataFrozenAt et son commentaire, la première note
// (notes[0], qui dit candidat par candidat quand les positions ont été relevées), l'entrée du journal des données
// (changelog : l'effet sur le classement d'abord, « votre réponse est à revoir » par approche ajoutée, la phrase sur la
// vérification par une IA en dernier ; ni score, ni pourcentage, ni nom masqué), et « contextDate » de config.json.
// election.ts est écrit à la main : chaque champ se remplace par une correspondance exacte, unique, et rien d'autre ne
// bouge. Aucun appel au réseau ni à une IA.
//
// Usage : node <WT>/tools/veille/election-fields.mjs --today AAAA-MM-JJ --summary <apply-report.json> [--copy-only]
//                                                    [--remeasure <remeasure.json>] [--dry-run] [--root <abs>] [--now <ISO>]
//   --today     : le jour de l'exécution (Paris), celui du changeset
//   --summary   : l'APPLY_REPORT de l'exécution (apply.mjs) ; facultatif avec --copy-only
//   --copy-only : semaine sans changement de données : seuls dataFrozenAt, son commentaire, notes[0] et contextDate
//                 changent (ni dataVersion ni entrée de journal) ; sortie 30 si bank.ts ou positions.ts ont changé
//   --remeasure : la sortie de remeasure.mjs ; une constante remplacée ajoute « Les chiffres publiés sur la page « Mon
//                 profil politique » ont été mesurés à nouveau. »
//   --dry-run   : tout est rédigé, vérifié et imprimé, rien n'est écrit ni lancé
// Changement de données : « git diff --quiet HEAD -- S/bank.ts S/positions.ts » échoue. Alors dataVersion devient
// <today>.N+1 (ou <today>.1), au plus 31 le même jour (src/core/transfer/codec.ts), et l'entrée du journal s'insère en
// tête ; sauf si l'entrée en tête est du propriétaire, du même jour, et que la nôtre ne change pas le classement (ni
// approche principale, ni renversement, ni approche ou question ajoutée) : elle va alors juste après les entrées du jour.
// dataFrozenAt : le plus récent des checkedAt des candidats présentés (research/presidentielle-2027/veille/state.json,
// déjà avancé par apply.mjs) ; jamais en arrière : plus ancien que la valeur publiée, dataFrozenAt, son commentaire et
// notes[0] restent tels quels (frozenKept). Puis, si dataVersion change : node tools/positions-history.mjs stamp D S (PIPELINE.md :
// BUILD, puis la version, puis stamp).
//
// Sortie (une ligne JSON) : {dataChanged, dataVersion, dataFrozenAt, frozenKept, notes0, changelog: {text, index} | null,
// contextDate, stamped, files}.
// Un candidat présenté absent de state.json (jamais relevé par la veille) compte au dernier relevé publié
// (election.dataFrozenAt, avertissement sur stderr), jamais à today.
// Codes : 0 ; 2 (appel mal formé, dossier principal) ; 30 (validateur en échec, plus de 31 versions le même jour,
// données changées avec --copy-only, état sans date et election.ts sans dataFrozenAt, stamp en échec ; bundles []) ; 31 (forme
// inattendue d'election.ts ou de config.json, git indisponible, erreur inattendue).
// Il faut Node 22.18+ (lit election.ts sans compilation).

import { existsSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import {
  ELECTION_ID, EXIT, assertNotMainFolder, exit, fail, git, loadElection, parseArgs, parseNow, paths, readJson, rootFrom,
  runMain, runNode, splitCandidates, tail, writeText,
} from './lib/common.mjs'
import { hiddenNamesRegex, parseCandidatesTs } from './lib/apply.mjs'
import {
  affectsRanking, changelogComment, changelogText, nextDataVersion, notesFirst, parseChangelog, patchContextDate, patchElection,
  textProblems,
} from './lib/electionFields.mjs'

const D = `research/${ELECTION_ID}`
const S = `src/elections/${ELECTION_ID}`
const dataFail = reason => fail(EXIT.DATA, reason, { bundles: [] })

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    today: { type: 'string', required: true },
    summary: { type: 'string' },
    'copy-only': { type: 'boolean' },
    remeasure: { type: 'string' },
    'dry-run': { type: 'boolean' },
    root: { type: 'string' },
    now: { type: 'string' },
  })
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.today)) fail(EXIT.USAGE, `--today : AAAA-MM-JJ attendu, pas « ${opts.today} »`)
  const copyOnly = opts['copy-only']
  if (!copyOnly && !opts.summary) fail(EXIT.USAGE, '--summary <apply-report.json> obligatoire (sauf --copy-only)')
  parseNow(opts.now)
  const root = rootFrom(opts)
  const P = paths(root)
  const dryRun = opts['dry-run']
  const today = opts.today
  if (!dryRun) assertNotMainFolder(root)

  // Les données ont-elles changé depuis le dernier commit ?
  const diff = git(['diff', '--quiet', 'HEAD', '--', `${S}/bank.ts`, `${S}/positions.ts`], { cwd: root })
  if (diff.code !== 0 && diff.code !== 1) fail(EXIT.CODE, `git diff : ${tail(diff.stderr, 5) || `code ${diff.code}`}`)
  const dataChanged = diff.code === 1
  if (copyOnly && dataChanged) dataFail('--copy-only, mais bank.ts ou positions.ts ont changé : une semaine avec des données nouvelles a sa dataVersion et son entrée de journal')

  const readOr30 = (file, what) => {
    try {
      return readJson(file)
    } catch (e) {
      return dataFail(`${what} illisible : ${e.message}`)
    }
  }
  const report = opts.summary ? readOr30(opts.summary, 'rapport d’application') : null
  const remeasured = opts.remeasure ? readOr30(opts.remeasure, 'sortie de remeasure') : null
  const config = readOr30(P.config, 'config.json')
  const configText = readFileSync(P.config, 'utf8')
  const electionText = readFileSync(P.election, 'utf8')
  let election
  try {
    election = await loadElection(root)
  } catch (e) {
    fail(EXIT.CODE, `election.ts ne se charge pas : ${e.message}`)
  }
  const state = existsSync(P.state) ? readOr30(P.state, 'state.json') : dataFail('state.json absent : apply.mjs l’écrit avant')
  const cards = existsSync(join(P.src, 'candidates.ts')) ? parseCandidatesTs(readFileSync(join(P.src, 'candidates.ts'), 'utf8')) : []
  const { visible, hiddenIds } = splitCandidates(config, election)
  const hiddenRe = hiddenNamesRegex(hiddenIds, cards.length ? cards : config.candidates)

  // Le journal lu dans le texte doit être celui que l'élection charge
  const parsed = parseChangelog(electionText)
  if (parsed.entries.map(e => e.date).join(',') !== election.changelog.map(e => e.date).join(',')) fail(EXIT.CODE, 'election.ts : le journal lu dans le texte ne correspond pas à celui de l’élection')

  // dataFrozenAt et notes[0]
  // Un candidat présenté absent de state.json (apply.mjs l'y ajoute ; ce repli sert aux étapes qui ne passent pas par
  // lui) n'a jamais été relevé par la veille : il compte au dernier relevé publié (dataFrozenAt), jamais à today
  const people = visible.map(c => ({ id: c.id, name: c.name, checkedAt: state.candidates?.[c.id]?.checkedAt ?? null }))
  const missing = people.filter(p => !p.checkedAt).map(p => p.id)
  if (missing.length) {
    const fallback = election.dataFrozenAt ?? null
    if (!fallback) dataFail(`state.json : pas de checkedAt pour ${missing.join(', ')}, et election.ts n’a pas de dataFrozenAt`)
    process.stderr.write(`election-fields : ${missing.join(', ')} absent(s) de state.json : compté(s) au dernier relevé publié (${fallback})\n`)
    for (const p of people) if (!p.checkedAt) p.checkedAt = fallback
  }
  const measuredFrozenAt = people.map(p => p.checkedAt).sort().at(-1)
  // Jamais en arrière : un relevé publié à la main plus récent que l'état (le 15 octobre 2026, par exemple) garde sa
  // date et sa note tant qu'aucun relevé de la veille ne le dépasse
  const keepFrozen = !!election.dataFrozenAt && measuredFrozenAt < election.dataFrozenAt
  const dataFrozenAt = keepFrozen ? election.dataFrozenAt : measuredFrozenAt
  const note0 = keepFrozen ? election.notes[0] : notesFirst(people)
  const frozenComment = `// Le plus récent des relevés des candidats présentés (${D}/veille/state.json, checkedAt), écrit par la veille automatique le ${today} : la première note les donne candidat par candidat`

  // dataVersion et entrée du journal
  let dataVersion = null
  let entry = null
  let afterOwner = false
  if (dataChanged) {
    dataVersion = nextDataVersion(election.dataVersion, today)
    const bankJson = readOr30(P.bank, 'bank.json')
    const ledger = existsSync(P.ledger) ? readOr30(P.ledger, 'ledger.json') : null
    const added = (ledger?.questions ?? []).filter(q => q.runId === report?.runId).map(q => bankJson.bank.questions.find(x => x.id === q.questionId)).find(Boolean)
    const newQuestion = added ? { id: added.id, prompt: added.prompt, topicId: added.topicId } : null
    const nameOf = id => config.candidates.find(c => c.id === id)?.name ?? id
    const text = changelogText({
      report, questions: bankJson.bank.questions, topics: bankJson.bank.topics, nameOf, newQuestion,
      constantsPatched: remeasured?.constantsPatched ?? [], today,
    })
    entry = { date: today, comment: changelogComment({ runId: report?.runId ?? 'hors-exécution', report, today }), text }
    const first = parsed.entries[0]
    afterOwner = !!first && first.date === today && !first.auto && !affectsRanking(report, newQuestion)
  }

  // Validateurs
  const problems = [
    ...(keepFrozen ? [] : textProblems(note0, { hiddenRe }).map(p => `notes[0] : ${p}`)),
    ...(entry ? textProblems(entry.text, { hiddenRe, entry: true }).map(p => `journal : ${p}`) : []),
  ]
  if (problems.length) dataFail(problems.join(' ; '))

  const patched = patchElection(electionText, { dataVersion, dataFrozenAt, frozenComment, note0, entry, afterOwner, keepFrozen })
  const newConfigText = patchContextDate(configText, today)
  const files = []
  let stamped = false
  if (!dryRun) {
    if (patched.text !== electionText) {
      writeText(P.election, patched.text)
      files.push(relative(root, P.election))
    }
    if (newConfigText !== configText) {
      writeText(P.config, newConfigText)
      files.push(relative(root, P.config))
    }
    if (dataVersion && dataVersion !== election.dataVersion) {
      const r = runNode(join(root, 'tools', 'positions-history.mjs'), ['stamp', D, S], { cwd: root })
      if (r.code !== 0) dataFail(`positions-history stamp : ${tail(r.stderr || r.stdout, 10)}`)
      stamped = true
      files.push(`${D}/positions-history.json`)
    }
  }
  process.stderr.write(`election-fields : ${dataVersion ? `dataVersion ${election.dataVersion} → ${dataVersion}, ` : ''}dataFrozenAt ${dataFrozenAt}${entry ? `, entrée du journal à l’indice ${patched.index}` : ''}${dryRun ? ' (essai, rien écrit)' : ''}\n`)
  exit(EXIT.OK, {
    dataChanged,
    dataVersion: dataVersion ?? election.dataVersion,
    dataFrozenAt,
    frozenKept: keepFrozen,
    notes0: note0,
    changelog: entry ? { text: entry.text, index: patched.index } : null,
    contextDate: today,
    stamped,
    files,
  }, { root, ...(dryRun ? { tag: 'essai' } : {}) })
})
