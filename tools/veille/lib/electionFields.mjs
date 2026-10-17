// Cœur de tools/veille/election-fields.mjs (veille automatique d'Isoloir, constructeur B7 ; contrat :
// tools/veille/CONTRACT.md §d.9, annexes A2 et A3) : fonctions pures qui rédigent, d'après le rapport d'application,
// l'entrée du journal des données (changelog), la première note (notes[0]) et la date des positions (dataFrozenAt), les
// vérifient (première phrase, noms masqués, phrase sur l'IA, ni pourcentage ni score, espaces insécables), puis les
// écrivent dans le texte d'election.ts par remplacements exacts (une seule correspondance chacun, sinon 31 : le
// fichier, écrit à la main, a changé de forme). Aucune lecture de fichier ni horloge.
//
// Exports :
//   frenchSpacing(text)             espace insécable (U+00A0) avant : ; ? ! » et après «, comme les entrées existantes
//   firstSentence(text)             celle de src/ui/screens/HomeBack.tsx (accueil, « depuis votre dernier passage »)
//   textProblems(text, {hiddenRe, entry}) → [problèmes] (validateurs du contrat)
//   nextDataVersion(current, today) « AAAA-MM-JJ.N », N + 1 le même jour (au plus 31, codec.ts) ; 30 au-delà
//   notesFirst(people)              notes[0] (annexe A3) d'après [{ id, name, checkedAt }]
//   affectsRanking(report)          principale, renversement, approche ajoutée ou question ajoutée
//   changelogText(o) / changelogComment(o)   l'entrée du journal (annexe A2) et son commentaire
//   parseChangelog(text)            les entrées du journal dans le texte d'election.ts (date, auteur, position)
//   patchElection(text, o)          dataVersion, commentaire et dataFrozenAt, notes[0], entrée du journal
//   patchContextDate(text, today)   « contextDate » de config.json
//   tsString(s) / tsUnquote(lit)    littéral TypeScript entre apostrophes droites (U+00A0 écrite « \u00a0 »)

import { EXIT, fail, frenchDate } from './common.mjs'

const NBSP = '\u00a0'

/** Espaces insécables du français, comme dans election.ts : avant « : ; ? ! » », après « « » */
export const frenchSpacing = t => String(t)
  .replace(/[ \u00a0\u202f]*([;:?!»])/g, `${NBSP}$1`)
  .replace(/«[ \u00a0\u202f]*/g, `«${NBSP}`)
  .replace(/ {2,}/g, ' ')
  .trim()

/** La première phrase d'une entrée, comme l'accueil la montre (src/ui/screens/HomeBack.tsx, firstSentence) */
export const firstSentence = text => String(text).match(/^.+?[.!?](?=\s+\p{Lu}|$)/u)?.[0] ?? String(text)

export const AI_SENTENCE = 'vérifiées automatiquement par une IA contre leurs sources, sans relecture humaine une par une.'

/** Les validateurs du contrat (§d.9) ; entry : c'est une entrée du journal (première phrase, phrase sur l'IA, ni % ni score) */
export function textProblems(text, { hiddenRe = null, entry = false } = {}) {
  const out = []
  const t = String(text)
  if (hiddenRe?.test(t)) out.push('nomme un candidat masqué')
  if (/(^|[^\u00a0])[;:?!»]/u.test(t)) out.push('espace insécable manquante avant : ; ? ! ou »')
  if (/«(?!\u00a0)/u.test(t)) out.push('espace insécable manquante après «')
  if (entry) {
    const s = firstSentence(t)
    if (s.length <= 20 || !/[.!?]$/.test(s)) out.push(`première phrase trop courte ou sans ponctuation finale : « ${s} »`)
    if (!t.endsWith(AI_SENTENCE)) out.push('la phrase sur la vérification par une IA manque à la fin')
    if (/%/.test(t)) out.push('pourcentage')
    if (/\bscores?\b/i.test(t)) out.push('« score »')
  }
  return out
}

/** dataVersion suivante : « <today>.N+1 » si la version du jour existe, sinon « <today>.1 » ; N au plus 31 (codec.ts) */
export function nextDataVersion(current, today) {
  const m = /^(\d{4}-\d{2}-\d{2})\.(\d+)$/.exec(String(current ?? ''))
  const n = m && m[1] === today ? Number(m[2]) + 1 : 1
  if (n > 31) fail(EXIT.DATA, `dataVersion : ${today}.${n} dépasse 31 versions le même jour (src/core/transfer/codec.ts)`, { bundles: [] })
  return `${today}.${n}`
}

// ——— Textes ———

const elides = name => /^[AEIOUÉÈÊËÀÂÎÏÔÛÜ]/u.test(name)
const de = name => (elides(name) ? `d’${name}` : `de ${name}`)
/** « de A, de B et d’Édouard C » */
export function deList(names) {
  const xs = names.map(de)
  return xs.length > 1 ? `${xs.slice(0, -1).join(', ')} et ${xs.at(-1)}` : xs[0] ?? ''
}
const andList = names => (names.length > 1 ? `${names.slice(0, -1).join(', ')} et ${names.at(-1)}` : names[0] ?? '')

/**
 * notes[0] (annexe A3) : les candidats présentés regroupés par date de relevé, la plus récente d'abord ; le groupe le
 * plus nombreux (à égalité, le plus ancien) devient « les autres ». people : [{ id, name, checkedAt }]
 */
export function notesFirst(people) {
  const byDate = new Map()
  for (const p of people) {
    if (!byDate.has(p.checkedAt)) byDate.set(p.checkedAt, [])
    byDate.get(p.checkedAt).push(p.name)
  }
  const groups = [...byDate].map(([date, names]) => ({ date, names })).sort((a, b) => b.date.localeCompare(a.date))
  if (groups.length === 1) return frenchSpacing(`Les positions de tous les candidats présentés ont été relevées à nouveau le ${frenchDate(groups[0].date)}.`)
  const others = [...groups].sort((a, b) => b.names.length - a.names.length || a.date.localeCompare(b.date))[0]
  const listed = groups.filter(g => g !== others)
  const parts = listed.map((g, i) => (i === 0
    ? `Les positions ${deList(g.names)} ont été relevées à nouveau le ${frenchDate(g.date)}`
    : `celles ${deList(g.names)}, le ${frenchDate(g.date)}`))
  const oldest = groups.at(-1) === others
  parts.push(oldest ? `les autres n’ont pas été relevées à nouveau depuis le ${frenchDate(others.date)}` : `celles des autres candidats présentés, le ${frenchDate(others.date)}`)
  return frenchSpacing(`${parts.join(' ; ')}.`)
}

const isMain = p => p.kind !== 'addApproach' && (p.class === 'principale' || p.class === 'renversement')
/** L'entrée change-t-elle le classement ? (principale, renversement, approche ou question ajoutée) */
export const affectsRanking = (report, newQuestion = null) =>
  (report?.published ?? []).some(isMain) || (report?.approaches ?? []).length > 0 || !!newQuestion

/**
 * L'entrée du journal (annexe A2), en une chaîne aux espaces insécables : l'effet sur le classement d'abord, une
 * phrase par approche ajoutée (« votre réponse est à revoir »), la question ajoutée, la nouvelle mesure du profil, et
 * toujours en dernier la phrase sur la vérification par une IA. questions : [{ id, topicId, prompt }] (banque) ;
 * topics : [{ id, label }] ; nameOf(id) ; newQuestion : { id, prompt, topicId } | null ; constantsPatched : [noms]
 */
export function changelogText({ report, questions, topics = [], nameOf, newQuestion = null, constantsPatched = [], today }) {
  const qById = new Map((questions ?? []).map(q => [q.id, q]))
  const label = topicId => topics.find(t => t.id === topicId)?.label ?? topicId
  // Une question se cite par son énoncé, sauf s'il porte un pourcentage ou le mot « score » : alors par son thème
  const plain = q => q && !/%|\bscores?\b/i.test(q.prompt)
  const onQuestion = qid => {
    const q = qById.get(qid)
    return plain(q) ? `sur « ${q.prompt} »` : `sur une question du thème « ${label(q?.topicId ?? qid.replace(/-x?\d+$/, ''))} »`
  }
  const theQuestion = qid => {
    const q = qById.get(qid)
    return plain(q) ? `La question « ${q.prompt} »` : `Une question du thème « ${label(q?.topicId ?? qid.replace(/-x?\d+$/, ''))} »`
  }
  const published = report?.published ?? []
  const cands = [...new Set(published.map(p => p.candidateId))]
  const sentences = []
  if (cands.length) {
    const seen = new Set()
    const mains = published.filter(isMain).filter(p => {
      const k = `${p.candidateId}|${p.questionId}`
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    const who = cands.length === 1 ? nameOf(cands[0]) : `${cands.length} candidats`
    if (affectsRanking(report, newQuestion)) {
      const what = p => `${p.class === 'renversement' ? 'une position inversée' : 'un changement d’approche principale'}${cands.length === 1 ? '' : ` pour ${nameOf(p.candidateId)}`} ${onQuestion(p.questionId)}`
      sentences.push(mains.length ? `Positions revues pour ${who}, dont ${mains.map(what).join(' ; ')}.` : `Positions revues pour ${who}.`)
    } else {
      const names = cands.length === 1 ? who : `${who} (${andList(cands.map(nameOf))})`
      sentences.push(`Positions revues pour ${names} : résumés, sources ou positions compatibles mis à jour, approches principales inchangées.`)
    }
  }
  for (const a of report?.approaches ?? []) sentences.push(`${theQuestion(a.questionId)} gagne une approche : si vous y aviez répondu, votre réponse est à revoir.`)
  if (newQuestion) {
    sentences.push(plain(newQuestion)
      ? `Nouvelle question dans le questionnaire approfondi : « ${newQuestion.prompt} ».`
      : `Nouvelle question dans le questionnaire approfondi, sur le thème « ${label(newQuestion.topicId)} ».`)
  }
  if (constantsPatched.length) sentences.push('Les chiffres publiés sur la page « Mon profil politique » ont été mesurés à nouveau.')
  sentences.push(`Positions relevées le ${frenchDate(today)} et ${AI_SENTENCE}`)
  return frenchSpacing(sentences.join(' '))
}

/** Type d'exécution d'un runId, pour le chemin du rapport (rapports/<date>-<kind>.md) */
export const kindOfRun = runId => (String(runId).startsWith('accord-') ? 'accord' : /^\d{4}-\d{2}-\d{2}-(quotidien|hebdo|candidat|retrait)/.exec(String(runId))?.[1] ?? 'hebdo')

/** Le commentaire qui précède le texte de l'entrée (annexe A2) ; « // Veille automatique » marque nos entrées */
export function changelogComment({ runId, report, today }) {
  const c = report?.counts ?? {}
  const count = `${c.published ?? (report?.published ?? []).length} changements publiés, ${c.held ?? (report?.held ?? []).length} retenus, ${c.dropped ?? (report?.dropped ?? []).length} écartés`
  return `// Veille automatique (${runId}) : ${count} ; détail : research/presidentielle-2027/veille/rapports/${today}-${kindOfRun(runId)}.md`
}

// ——— Littéraux TypeScript ———

/** Littéral entre apostrophes droites, à la manière d'election.ts (U+00A0 écrite « \u00a0 ») */
export const tsString = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\u00a0/g, '\\u00a0').replace(/\n/g, '\\n')}'`
/** Le texte d'un littéral entre apostrophes droites (« \u00a0 », « \' », « \\ ») */
export const tsUnquote = lit => String(lit).replace(/\\u([0-9a-fA-F]{4})|\\(.)/g, (_, hex, ch) => (hex ? String.fromCharCode(parseInt(hex, 16)) : ch === 'n' ? '\n' : ch))

// ——— election.ts ———

function once(text, re, what) {
  const hits = [...String(text).matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`))]
  if (hits.length !== 1) fail(EXIT.CODE, `election.ts : ${hits.length} correspondance(s) pour ${what}, une seule attendue (le fichier a changé de forme)`)
  return hits[0]
}

/**
 * Les entrées du journal dans le texte d'election.ts, dans l'ordre : { date, start, end, auto } (auto : notre
 * commentaire « // Veille automatique »), et la position d'insertion en tête (insertAt)
 */
export function parseChangelog(text) {
  const head = once(text, /\n {2}changelog: \[\n/, '« changelog: [ »')
  const insertAt = head.index + head[0].length
  const entry = /( {4}\{\n {6}date: '(\d{4}-\d{2}-\d{2})',\n((?: {6}.*\n)*?) {4}\},\n)/y
  const entries = []
  let at = insertAt
  for (;;) {
    entry.lastIndex = at
    const m = entry.exec(text)
    if (!m) break
    entries.push({ date: m[2], start: at, end: at + m[1].length, auto: /^ {6}\/\/ Veille automatique/m.test(m[3]) })
    at += m[1].length
  }
  if (!text.startsWith('  ],', at)) fail(EXIT.CODE, 'election.ts : journal (changelog) de forme inattendue après la dernière entrée lue')
  return { insertAt, entries }
}

/**
 * Remplacements dans election.ts. o : { dataVersion?, dataFrozenAt, frozenComment, note0, entry?: { date, comment,
 * text }, afterOwner?: boolean, keepFrozen?: boolean } ; afterOwner : l'entrée va après les entrées du jour du
 * propriétaire (sinon en tête) ; keepFrozen : dataFrozenAt, son commentaire et notes[0] restent tels quels.
 * Rend { text, index } (index : la place de l'entrée dans le journal, ou null).
 */
export function patchElection(text, o) {
  let out = String(text)
  if (o.dataVersion) {
    once(out, /^ {2}dataVersion: '[^'\n]*',$/m, 'dataVersion')
    out = out.replace(/^( {2}dataVersion: ')[^'\n]*(',)$/m, `$1${o.dataVersion}$2`)
  }
  once(out, /\n {2}dataVersion: '[^'\n]*',\n(?: {2}\/\/[^\n]*\n)* {2}dataFrozenAt: '[^'\n]*',\n/, 'dataFrozenAt et son commentaire')
  if (!o.keepFrozen) out = out.replace(/(\n {2}dataVersion: '[^'\n]*',\n)(?: {2}\/\/[^\n]*\n)*( {2}dataFrozenAt: ')[^'\n]*(',\n)/, (_, a, b, c) => `${a}  ${o.frozenComment}\n${b}${o.dataFrozenAt}${c}`)
  once(out, /\n {2}notes: \[\n {4}'(?:[^'\\\n]|\\.)*',\n/, 'notes[0]')
  if (!o.keepFrozen) out = out.replace(/(\n {2}notes: \[\n {4})'(?:[^'\\\n]|\\.)*'(,\n)/, (_, a, b) => `${a}${tsString(o.note0)}${b}`)
  let index = null
  if (o.entry) {
    const { insertAt, entries } = parseChangelog(out)
    let at = insertAt
    index = 0
    if (o.afterOwner) {
      while (index < entries.length && entries[index].date === o.entry.date) at = entries[index++].end
    }
    const block = `    {\n      date: '${o.entry.date}',\n      ${o.entry.comment}\n      text: ${tsString(o.entry.text)},\n    },\n`
    out = out.slice(0, at) + block + out.slice(at)
  }
  return { text: out, index }
}

/** « contextDate » de config.json : seule cette valeur change (texte, une seule correspondance) */
export function patchContextDate(text, today) {
  const hits = [...String(text).matchAll(/("contextDate": ")\d{4}-\d{2}-\d{2}(")/g)]
  if (hits.length !== 1) fail(EXIT.CODE, `config.json : ${hits.length} « contextDate », un seul attendu`)
  return String(text).replace(/("contextDate": ")\d{4}-\d{2}-\d{2}(")/, `$1${today}$2`)
}
