// Cœur de tools/veille/apply.mjs (veille automatique d'Isoloir, constructeur B7 ; contrat : tools/veille/CONTRACT.md
// §c.4, §c.8, §d.7, annexe A1) : fonctions pures qui décident, changement par changement, ce qui se publie, ce qui est
// retenu pour le propriétaire et ce qui est écarté, puis rendent les nouvelles valeurs de decisions.json, ledger.json et
// state.json (le script de ligne de commande les écrit). Aucune lecture de fichier, aucune horloge, aucun réseau : tout
// arrive en paramètre (banque publiée, décisions, config, élection, candidats, historique, politique, verrous, registre,
// état, attentes locales).
//
// Exports principaux :
//   applyChangeset(input) → { report, decisions, ledger, state, pending, decisionsChanged }
//     input : { changeset, bankJson, decisions, config, election, candidates (parseCandidatesTs), history,
//               policy, locks, ledger, state, pending (attentes locales), localWatch, holds, approve, only,
//               today, now (ISO avec fuseau, pour createdAt), dryRun, stateOps (fonctions de lib/state.mjs, B6) }
//   acceptQuestion(input) → { accepted, reasons, questionId, slot, build, transferText, fixture, ledger }
//     forme 2 d'apply.mjs (--question) : acceptation d'une nouvelle question tirée d'une extension fusionnée.
// Utilitaires exportés pour les autres scripts de B7 et les tests : typo, publishedForm, claimKeyOf, classOf,
// parseCandidatesTs, hiddenNamesRegex, forbiddenHits, nextLetter, buildNote, mergePolicy, serializeLike,
// addTransferSlot, transferSlotsOf, knownCount.
//
// Ordre d'examen d'un changement (CONTRACT §c.8, avec l'écart n° 13 du §g : la clé déjà publiée et l'absence d'effet se
// lisent avant l'« avant mal lu », pour qu'une application répétée après un BUILD reste sans effet) :
//   1 invalide · 2 hors-cible · 3 retenu-par-le-run · 4 sujet de question · 5 réfutée · 6 confiance-basse ·
//   7 inférence-de-fond · 8 source-invalide · 9 nom-masqué · 10 terme-interdit · 11 date-future · 12 requalification ·
//   15 déjà-publiée · 14 sans-effet · 13 avant-mal-lu · 16 verrou · 17 entrée-du-propriétaire · seuils de la classe ;
//   puis les règles des approches ajoutées (une approche déjà en ligne rend sa lettre aux positions posées sur son
//   identifiant provisoire), l'atomicité de chaque (candidat, question) (un changement de fond retenu ou écarté retient
//   tout le reste de la question pour ce candidat ; l'accord d'un changement vaut pour toute la question), l'état final
//   par (candidat, question), les plafonds, la réintégration. Un candidat présenté absent de state.json y entre
//   (seeded), sans relevé prétendu.

import { checkChange, DEFAULT_POLICY, SCHEMAS, validate } from '../schemas.mjs'
import { canonical, daysBetween, frenchDate, normalizeName, sha1, sourceKey } from './common.mjs'
import { latestSourceDate, stanceOf } from '../../../src/core/positionsHistory.ts'

// ——— Politique ———

const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v)

/** policy.json fusionné sur DEFAULT_POLICY, sur un niveau (CONTRACT §c.1) */
export function mergePolicy(file = {}) {
  const out = structuredClone(DEFAULT_POLICY)
  for (const [k, v] of Object.entries(file ?? {})) out[k] = isPlainObject(v) && isPlainObject(out[k]) ? { ...out[k], ...v } : v
  return out
}

// ——— Typographie (copie de typo() de tools/build-pack.mjs L179-193, sans importer build-pack, qui construit à l'import) ———

export function typo(t) {
  if (typeof t !== 'string') return t
  return t
    .replace(/'/g, '’')
    .replace(/\s+([?!;])/g, ' $1')
    .replace(/(\S)([?!;])(?=\s|$)/g, '$1 $2')
    .replace(/\s+:/g, ' :')
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)[\s ](\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d)\s*(€|%|Md€|M€|milliards|millions)/g, '$1 $2')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** La position telle que build-pack la publierait (positions.ts, bank.json) : poids, rejet, typographie */
export function publishedForm(p) {
  if (!p) return null
  let weight = p.weight > 0 ? p.weight : undefined
  if (p.nature === 'inference' && weight === 2) weight = 1
  if (!weight && !p.rejects) return null
  return {
    ...(weight ? { weight } : {}),
    ...(p.rejects ? { rejects: true } : {}),
    nature: p.nature,
    confidence: p.confidence,
    summary: typo(p.summary),
    sources: (p.sources ?? []).map(s => ({
      title: typo(s.title),
      url: s.url,
      ...(s.date ? { date: s.date } : {}),
      ...(s.publisher ? { publisher: typo(s.publisher) } : {}),
    })),
  }
}

// ——— Identifiants, clés ———

const PLACEHOLDER_RE = /^([a-z][a-z_]*-x?[0-9]+)-NEW[0-9]+$/
export const isPlaceholder = id => typeof id === 'string' && PLACEHOLDER_RE.test(id)
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * claimKey (CONTRACT §c.4) : sur le changement tel que reçu. approachText : le texte de l'approche proposée quand
 * l'approche est provisoire (addApproach, ou set sur « <q>-NEW<k> »).
 */
export function claimKeyOf(change, approachText = null) {
  const provisional = change.kind === 'addApproach' || isPlaceholder(change.approachId)
  const text = change.kind === 'addApproach' ? change.proposedApproachText : approachText
  const approachRef = provisional ? `new:${normalizeName(text ?? '')}` : (change.approachId ?? '')
  const after = change.after ?? null
  const keys = [...new Set(((change.after ?? change.before)?.sources ?? []).map(s => sourceKey(s.url)))].sort().join(',')
  return sha1([
    change.candidateId, change.statedAt ?? '', change.kind, change.questionId ?? '', approachRef,
    String(after?.weight ?? 0), after?.rejects ? '1' : '0', keys,
  ].join('|'))
}

/** Classe d'un changement (CONTRACT §c.8), d'après stanceOf de src/core/positionsHistory.ts, avant = position publiée */
export function classOf(change, published) {
  if (change.kind === 'addApproach' || isPlaceholder(change.approachId)) return 'nouvelle-approche'
  const b = stanceOf(published ?? null)
  const a = stanceOf(change.kind === 'remove' ? null : change.after)
  if (a === b) return 'forme'
  const reversal = (b === 'rejet' && (a === 'principale' || a === 'compatible')) || ((b === 'principale' || b === 'compatible') && a === 'rejet')
  if (reversal) return 'renversement'
  if (a === 'principale' || b === 'principale') return 'principale'
  return 'secondaire'
}
const CLASS_RANK = { forme: 0, secondaire: 1, principale: 2, renversement: 3, 'nouvelle-approche': 4 }

// ——— Candidats, noms masqués, termes interdits ———

const unquote = s => s.replace(/\\(.)/g, '$1')
/**
 * Fiches de src/elections/<id>/candidates.ts lues comme du texte (le fichier importe des images) : { id, name,
 * initials, nuance } par fiche, dans l'ordre du fichier. Les champs sont ceux de la première indentation d'une fiche.
 */
export function parseCandidatesTs(text) {
  const out = []
  let cur = null
  for (const line of String(text).split('\n')) {
    const m = /^ {4}(id|name|initials|nuance): '((?:[^'\\]|\\.)*)',?\s*$/.exec(line)
    if (!m) continue
    if (m[1] === 'id') {
      cur = { id: unquote(m[2]), name: null, initials: null, nuance: null }
      out.push(cur)
    } else if (cur && cur[m[1]] === null) cur[m[1]] = unquote(m[2])
  }
  return out
}

/**
 * Nom complet et nom de famille des candidats masqués, mot entier et avec la casse (même recherche que
 * tests/hidden.test.ts) ; null s'il n'y a personne à chercher
 */
export function hiddenNamesRegex(hiddenIds, people) {
  const ids = new Set(hiddenIds ?? [])
  const names = (people ?? []).filter(c => ids.has(c.id) && c.name).flatMap(c => [c.name, c.name.split(' ').slice(1).join(' ')]).filter(Boolean)
  if (!names.length) return null
  return new RegExp(`(?<![\\p{L}\\p{N}])(${names.map(escapeRe).join('|')})(?![\\p{L}\\p{N}])`, 'u')
}

/** Termes interdits et noms des candidats dans un texte d'approche : même recherche que forbiddenHits de 6-add-candidate */
export function forbiddenHits(text, config) {
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const terms = [
    ...(config?.forbiddenTerms ?? []),
    ...(config?.candidates ?? []).flatMap(c => [c.name, String(c.name ?? '').split(' ').slice(1).join(' ')]).filter(t => t && t.length > 2),
  ]
  const t = norm(text ?? '')
  return terms.filter(term => new RegExp(`(^|[^a-z0-9])${escapeRe(norm(term))}($|[^a-z0-9])`).test(t))
}

// ——— Sources ———

// Wikipédia et Wikidata, agrégateurs, comparateurs de programmes (dont les sites Isoloir eux-mêmes) : jamais une source
const BAD_HOST = /(^|\.)(wikipedia\.org|wikidata\.org|wikiwand\.com|wikimedia\.org|news\.google\.[a-z.]+|msn\.com|flipboard\.com|yahoo\.com|voxe\.org|elyze\.app|isoloir2027\.fr|isoloir\.vercel\.app)$/i
const SOURCE_DATE_RE = /^[0-9]{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?( \(consultation\))?$/
function badSource(s) {
  let u
  try {
    u = new URL(s.url)
  } catch {
    return 'adresse illisible'
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'adresse non http(s)'
  if (BAD_HOST.test(u.hostname)) return `${u.hostname} : encyclopédie, agrégateur ou comparateur`
  if (/comparat/i.test(u.hostname) || /comparat/i.test(u.pathname)) return `${u.hostname}${u.pathname} : comparateur`
  if (s.date && !SOURCE_DATE_RE.test(s.date)) return `date « ${s.date} » hors motif`
  return null
}
/** Date d'une source, pour comparer : « (consultation) » retiré ; un mois compte pour son dernier jour */
const dayOf = d => {
  const m = /^(\d{4}-\d{2})(-\d{2})?/.exec(String(d ?? ''))
  if (!m) return null
  return m[2] ? `${m[1]}${m[2]}` : `${m[1]}-31`
}
/** Une source neuve : une adresse absente de before, ou une date de publication (pas de consultation) plus récente */
function hasNewSource(after, before) {
  const keys = new Set((before?.sources ?? []).map(s => sourceKey(s.url)))
  const latest = latestSourceDate(before)
  return (after?.sources ?? []).some(s => {
    if (!keys.has(sourceKey(s.url))) return true
    if (!s.date || /consultation/.test(s.date)) return false
    return latest === null || s.date.slice(0, 10) > latest
  })
}

// ——— Lettres, emplacements de transfert ———

/**
 * Lettre suivante de la plus haute jamais employée sur la question (banque, addApproaches, dropApproaches, libellés de
 * positions-history.json) ; null au-delà de « p »
 */
export function nextLetter(questionId, { bankQuestion, decisions, history, taken = [] }) {
  const re = new RegExp(`^${escapeRe(questionId)}-([a-p])$`)
  const ids = [
    ...(bankQuestion?.approaches ?? []).map(a => a.id),
    ...(decisions?.addApproaches ?? []).filter(a => a.questionId === questionId).map(a => a.id),
    // dropApproaches : des identifiants (build-pack) ; une entrée objet compte par ses valeurs
    ...(decisions?.dropApproaches ?? []).flatMap(d => (typeof d === 'string' ? [d] : Object.values(d ?? {}).filter(v => typeof v === 'string'))),
    ...Object.keys(history?.labels?.approaches ?? {}),
    ...taken,
  ]
  let hi = -1
  for (const id of ids) {
    const m = re.exec(id)
    if (m) hi = Math.max(hi, m[1].charCodeAt(0) - 97)
  }
  const next = hi + 1
  return next > 15 ? null : `${questionId}-${String.fromCharCode(97 + next)}`
}

/** Numéros de la table questions de transfer.ts (texte), dans l'ordre : [[questionId, n]…] ; null si la forme change */
export function transferSlotsOf(text) {
  const m = /\n {2}questions: \{\n([\s\S]*?)\n {2}\},\n {2}topics:/.exec(text)
  if (!m) return null
  return [...m[1].matchAll(/^ {4}'([^']+)': (\d+),$/gm)].map(x => [x[1], Number(x[2])])
}
/** Ajoute « '<q>': <n>, » à la fin de la table questions de transfer.ts ; lève si la forme du fichier a changé */
export function addTransferSlot(text, questionId, slot) {
  const re = /(\n {2}questions: \{\n[\s\S]*?)(\n {2}\},\n {2}topics:)/g
  const hits = [...text.matchAll(re)]
  if (hits.length !== 1) throw new Error('transfer.ts : table « questions » introuvable ou en double')
  if (new RegExp(`^ {4}'${escapeRe(questionId)}':`, 'm').test(text)) throw new Error(`transfer.ts : ${questionId} a déjà un numéro`)
  return text.replace(re, (_, head, tail) => `${head}\n    '${questionId}': ${slot},${tail}`)
}

/** Texte JSON dans la forme du fichier d'origine (2 espaces ; saut de ligne final seulement s'il y en avait un) */
export const serializeLike = (original, value) => JSON.stringify(value, null, 2) + (String(original ?? '').endsWith('\n') ? '\n' : '')

// ——— Couverture (même traitement pour tous) ———

/** stance ≠ 0 de src/core/score.ts : une approche portée (poids effectif > 0) ou rejetée, confiance autre que basse */
const counts = p => !!p && p.confidence !== 'low' && ((p.weight ?? 0) > 0 || !!p.rejects)
/** knownQuestions de src/core/score.ts, sur une ligne de positions : questions où au moins une approche compte */
export function knownCount(questions, row) {
  return questions.filter(q => q.approaches.some(a => counts(row?.[a.id]))).length
}
const knownOn = (q, row) => q.approaches.some(a => counts(row?.[a.id]))

// ——— Note de decisions.json (annexe A1) ———

const STANCE_WORD = { principale: 'principale', compatible: 'compatible', rejet: 'rejet', inconnue: 'inconnue' }
const VERDICT_WORD = { confirmed: 'confirmée', adjusted: 'ajustée', unverifiable: 'invérifiable', refuted: 'réfutée' }
const CONFIDENCE_WORD = { high: 'haute', medium: 'moyenne', low: 'basse' }
const noFinalStop = s => String(s ?? '').trim().replace(/[\s.;:!]+$/u, '')
const sourcesText = p => (p.sources ?? []).map(s => [s.publisher, s.date].filter(Boolean).join(' ')).filter(Boolean).join(' ; ')
const describe = p => `${STANCE_WORD[stanceOf(p)]} « ${noFinalStop(p.summary)} » (confiance ${CONFIDENCE_WORD[p.confidence] ?? p.confidence} ; sources : ${sourcesText(p) || 'aucune'})`

/** La note d'une entrée de decisions.json écrite par la veille (annexe A1), en une seule chaîne */
export function buildNote({ change, published, today, runId, claimKey, requalifiedFrom = null }) {
  const after = change.kind === 'remove' ? null : change.after
  const cause = change.cause === 'prise-de-position'
    ? `prise de position du ${frenchDate(change.statedAt)}`
    : change.cause === 'nouvelle-approche' ? 'nouvelle approche' : 'relecture'
  const requalified = requalifiedFrom
    ? ` (proposée comme prise de position du ${frenchDate(requalifiedFrom.statedAt)}, antérieure au ${frenchDate(requalifiedFrom.since)}, début de la période relue : requalifiée en relecture)`
    : ''
  const verdict = VERDICT_WORD[change.verifier?.verdict] ?? change.verifier?.verdict ?? 'non vérifiée'
  const blind = change.blindRecode?.agrees ? ' ; recodage à l’aveugle : d’accord' : ''
  const notes = noFinalStop(change.verifier?.notes)
  return [
    `Veille automatique du ${frenchDate(today)} (${runId}, changement ${claimKey.slice(0, 8)}) : ${noFinalStop(change.rationale)}.`,
    published ? `AVANT (publié jusqu’au ${frenchDate(today)}) : ${describe(published)}.` : 'AVANT : inconnue.',
    after ? `APRÈS : ${describe(after)}.` : 'APRÈS : retirée.',
    `Cause : ${cause}${requalified}.`,
    `Vérification : ${verdict}${notes ? ` — ${notes}` : ''}${blind}.`,
    'Vérifié automatiquement par une IA contre ses sources, sans relecture humaine.',
  ].join(' ')
}

// ——— Application d'un changeset (forme 1) ———

const HOLD_NOT_APPROVABLE = new Set(['verrou', 'avant-mal-lu', 'état-final-invalide'])
const groupKey = (cid, qid) => `${cid}|${qid}`

/**
 * Applique les règles du contrat (§c.8) à un changeset. Rend le rapport APPLY_REPORT, les nouvelles valeurs de
 * decisions (objet), du registre et de l'état, et les attentes à créer (retenus, réintégrations).
 */
export function applyChangeset(input) {
  const {
    changeset, bankJson, decisions, config, election, candidates = [], history = null,
    policy: policyIn = DEFAULT_POLICY, locks = { locks: [] }, ledger: ledgerIn = null, state: stateIn = null,
    pending = [], localWatch = [], holds = [], approve = [], only = [], today, now = null, dryRun = false, stateOps = null,
  } = input
  const policy = mergePolicy(policyIn)
  const runId = changeset.runId
  const ledger = structuredClone(ledgerIn ?? { format: 'isoloir-veille-ledger/1', claims: {}, approaches: [], questions: [] })
  ledger.claims ??= {}
  ledger.approaches ??= []
  ledger.questions ??= []

  // ——— Contexte ———
  const questions = bankJson.bank.questions
  const qById = new Map(questions.map(q => [q.id, q]))
  const published = bankJson.positions ?? {}
  const hiddenIds = new Set([...(election?.hidden ?? []), ...config.candidates.filter(c => c.pendingPrimary).map(c => c.id)])
  const configIds = new Set(config.candidates.map(c => c.id))
  const withdrawing = new Set(pending.filter(p => p.kind === 'retrait' && p.status === 'attente').map(p => p.details?.candidateId ?? p.id.replace(/^R-/, '')))
  const visible = config.candidates.filter(c => !hiddenIds.has(c.id)).map(c => c.id)
  const nameOf = id => config.candidates.find(c => c.id === id)?.name ?? candidates.find(c => c.id === id)?.name ?? id
  const hiddenRe = hiddenNamesRegex([...hiddenIds], candidates.length ? candidates : config.candidates)
  const blocOfNuance = new Map((election?.spectrum?.nuances ?? []).map(n => [n.code, n.bloc]))
  const blocOf = id => blocOfNuance.get(candidates.find(c => c.id === id)?.nuance) ?? null
  const holdBundles = new Set([...(changeset.holds ?? []), ...holds])
  const approved = new Set([...(changeset.approve ?? []), ...approve, ...(changeset.only ?? []), ...only])
  const onlySet = new Set([...(changeset.only ?? []), ...only])
  const ownerEntry = new Map()
  for (const e of decisions.positions ?? []) if (!('veille' in e)) ownerEntry.set(`${e.candidate}|${e.approachId}`, e)
  const pendingHoldByKey = new Map(pending.filter(p => p.kind === 'hold' && p.details?.claimKey).map(p => [p.details.claimKey, p.id]))

  // ——— Les changements, avec leur contexte ———
  const items = []
  const subjects = []
  const checkedSet = new Set()
  const placeholderText = new Map()
  ;(changeset.results ?? []).forEach((result, ri) => {
    for (const pa of result.proposedApproaches ?? []) placeholderText.set(`${ri}|${pa.placeholder}`, pa.text)
    for (const cand of result.candidates ?? []) for (const ch of cand.changes ?? []) {
      if (ch?.kind === 'addApproach' && ch.approachId) placeholderText.set(`${ri}|${ch.approachId}`, ch.proposedApproachText)
    }
    for (const s of result.newQuestionSubjects ?? []) subjects.push(s)
    for (const cand of result.candidates ?? []) {
      // checkedAt n'avance que pour un relevé mené au bout : tri complet, et ni le budget ni un lot perdu n'ont coupé le
      // codage (le workflow 9 remet alors triageCompleted à faux ; budgetCut est gardé ici en second rempart)
      if (cand.triageCompleted && !cand.budgetCut && configIds.has(cand.candidateId) && !hiddenIds.has(cand.candidateId) && !withdrawing.has(cand.candidateId)) checkedSet.add(cand.candidateId)
      for (const change of cand.changes ?? []) {
        items.push({
          change,
          ri,
          mode: result.mode,
          since: changeset.since?.[change?.candidateId] ?? cand.since,
        })
      }
    }
  })

  const report = { published: [], held: [], dropped: [] }
  const drop = (it, reason, detail) => Object.assign(it, { status: 'dropped', reason, detail: detail ?? null })
  const hold = (it, reason, detail) => Object.assign(it, { status: 'held', reason, detail: detail ?? null })
  // Retenue, sauf accord du propriétaire (« OK H-… ») ; verrou, avant mal lu et état final invalide ne se lèvent jamais ainsi
  const holdUnlessApproved = (it, reason, detail) => {
    if (!HOLD_NOT_APPROVABLE.has(reason) && it.approved) return false
    hold(it, reason, detail)
    return true
  }

  // Clé, texte d'approche et accord de chaque changement ; l'accord d'une approche ajoutée vaut pour tout son paquet
  for (const it of items) {
    const c = it.change
    it.status = 'ok'
    it.cause = c?.cause
    it.statedAt = c?.statedAt ?? null
    it.approachId = c?.approachId ?? null
    it.text = c?.kind === 'addApproach' ? c.proposedApproachText : isPlaceholder(c?.approachId) ? placeholderText.get(`${it.ri}|${c.approachId}`) ?? null : null
    try {
      it.key = c && typeof c === 'object' && c.kind !== 'newQuestionSubject' ? claimKeyOf(c, it.text) : null
    } catch {
      it.key = null
    }
    it.holdRef = it.key ? ledger.claims[it.key]?.holdId ?? pendingHoldByKey.get(it.key) ?? null : null
    it.approved = !!it.holdRef && approved.has(it.holdRef)
  }
  const addOf = it => items.find(a => a.change?.kind === 'addApproach' && a.ri === it.ri && a.change.approachId === it.change?.approachId && a.change.questionId === it.change?.questionId)
  for (const it of items) {
    if (it.change?.kind === 'addApproach' || !isPlaceholder(it.change?.approachId)) continue
    const add = addOf(it)
    if (add?.approved) it.approved = true
    it.inOnly = onlySet.has(it.holdRef) || (!!add && onlySet.has(add.holdRef))
  }
  // L'état complet d'une (candidat, question) se publie d'un bloc : l'accord d'un de ses changements (« OK H-… », « only »)
  // vaut pour tous les autres
  const byGroup = new Map()
  for (const it of items) {
    const c = it.change
    if (!c || typeof c !== 'object' || c.kind === 'addApproach' || c.kind === 'newQuestionSubject' || typeof c.candidateId !== 'string' || typeof c.questionId !== 'string') continue
    const k = groupKey(c.candidateId, c.questionId)
    if (!byGroup.has(k)) byGroup.set(k, [])
    byGroup.get(k).push(it)
  }
  for (const group of byGroup.values()) {
    if (group.some(it => it.approved)) for (const it of group) it.approved = true
    if (group.some(it => it.inOnly || onlySet.has(it.holdRef))) for (const it of group) it.inOnly = true
  }
  // Accord d'un retenu (« only ») : seuls ces changements sont examinés, le reste du changeset est ignoré
  let ignored = 0
  if (onlySet.size) {
    for (const it of items) {
      if (onlySet.has(it.holdRef) || it.inOnly) continue
      it.status = 'ignored'
      ignored++
    }
  }

  // ——— Règles 1 à 17, changement par changement ———
  for (const it of items) {
    if (it.status === 'ignored') continue
    const c = it.change
    // 1. conforme à CHANGE et à checkChange
    const errors = [...validate(SCHEMAS.CHANGE, c), ...(c && typeof c === 'object' ? checkChange(c) : [])]
    if (errors.length) { drop(it, 'invalide', errors.slice(0, 5).join(' ; ')); continue }
    if (isPlaceholder(c.approachId) && c.kind === 'set' && !it.text) { drop(it, 'invalide', `approche provisoire ${c.approachId} sans addApproach dans le même lancement`); continue }
    if (c.kind !== 'newQuestionSubject' && !qById.has(c.questionId)) { drop(it, 'invalide', `question ${c.questionId} absente de la banque`); continue }
    if (c.kind !== 'newQuestionSubject' && !isPlaceholder(c.approachId) && !qById.get(c.questionId).approaches.some(a => a.id === c.approachId)) {
      drop(it, 'invalide', `approche ${c.approachId} absente de la banque`)
      continue
    }
    // 2. hors cible
    const cid = c.candidateId
    if (!configIds.has(cid) || hiddenIds.has(cid) || withdrawing.has(cid)) {
      drop(it, 'hors-cible', !configIds.has(cid) ? 'absent de config.json' : hiddenIds.has(cid) ? 'candidat masqué' : 'retrait en attente')
      continue
    }
    // 3. paquet retenu par l'orchestrateur
    const bundles = [`candidat:${cid}`, `cle:${it.key}`, ...(c.kind === 'addApproach' || isPlaceholder(c.approachId) ? [`approche:${c.questionId}`] : [])]
    const heldBundle = bundles.find(b => holdBundles.has(b))
    if (heldBundle && holdUnlessApproved(it, 'retenu-par-le-run', heldBundle)) continue
    // 4. sujet de nouvelle question : pas une position
    if (c.kind === 'newQuestionSubject') { it.status = 'subject'; continue }
    // 5 à 11
    if (c.verifier.verdict === 'refuted') { drop(it, 'réfutée', c.verifier.notes); continue }
    if (c.after?.confidence === 'low') { drop(it, 'confiance-basse'); continue }
    const pub = isPlaceholder(c.approachId) ? null : published[cid]?.[c.approachId] ?? null
    it.published = pub
    if (c.after?.nature === 'inference' && stanceOf(pub) !== stanceOf(c.after)) { drop(it, 'inférence-de-fond', `${stanceOf(pub)} → ${stanceOf(c.after)}`); continue }
    const bad = (c.after?.sources ?? []).map(badSource).find(Boolean)
    if (bad) { drop(it, 'source-invalide', bad); continue }
    const masked = [c.after?.summary, c.proposedApproachText].find(t => t && hiddenRe?.test(t))
    if (masked) { drop(it, 'nom-masqué'); continue }
    const hits = c.kind === 'addApproach' ? forbiddenHits(c.proposedApproachText, config) : []
    if (hits.length) { drop(it, 'terme-interdit', hits.join(', ')); continue }
    if (c.statedAt && c.statedAt > today) { drop(it, 'date-future', c.statedAt); continue }
    // 12. une prise de position d'avant la période relue est une relecture
    if (c.cause === 'prise-de-position' && it.since && c.statedAt < it.since) {
      it.requalifiedFrom = { statedAt: c.statedAt, since: it.since }
      it.cause = 'relecture'
      it.statedAt = null
    }
    // 15. déjà publiée (lue avant 14 et 13 : écart n° 13 du contrat)
    if (ledger.claims[it.key]?.status === 'published') { drop(it, 'déjà-publiée'); continue }
    const lockOf = () => (locks?.locks ?? []).find(l => l.candidateId === cid && (l.questionId === '*' || l.questionId === c.questionId || l.approachId === c.approachId)
      && (!l.since || l.since <= today) && (l.until == null || l.until >= today))
    if (c.kind === 'addApproach') {
      it.class = 'nouvelle-approche'
      const lock = lockOf()
      if (lock) { hold(it, 'verrou', `${lock.reason} depuis le ${lock.since}`); continue }
      if (c.verifier.verdict === 'unverifiable') drop(it, 'source-invérifiable')
      continue
    }
    const afterForm = c.kind === 'remove' ? null : publishedForm(c.after)
    if (canonical(afterForm) === canonical(pub)) { drop(it, 'sans-effet', c.kind === 'remove' ? 'position déjà absente' : 'position déjà publiée'); continue }
    if (canonical(c.before ?? null) !== canonical(pub)) { hold(it, 'avant-mal-lu', 'le « before » reçu diffère de la position publiée (bank.json)'); continue }
    // 16. verrou
    const lock = lockOf()
    if (lock) { hold(it, 'verrou', `${lock.reason} depuis le ${lock.since}`); continue }
    // 17. entrée du propriétaire
    const owner = ownerEntry.get(`${cid}|${c.approachId}`)
    if (owner) {
      const dates = [owner.statedAt, ...(owner.sources ?? []).map(s => s.date)].map(dayOf).filter(Boolean).sort()
      const ownerDay = dates.at(-1) ?? null
      const newer = it.cause === 'prise-de-position' && ownerDay !== null && it.statedAt > ownerDay
      if (!newer && holdUnlessApproved(it, 'entrée-du-propriétaire', `entrée du propriétaire (dernière date ${ownerDay ?? 'inconnue'}) : seule une prise de position plus récente la remplace`)) continue
    }
    // Classe et seuils
    it.class = classOf(c, pub)
    const q = qById.get(c.questionId)
    const verdict = c.verifier.verdict
    if (it.class === 'forme' || it.class === 'secondaire' || it.class === 'nouvelle-approche') {
      if (verdict === 'unverifiable') { drop(it, 'source-invérifiable'); continue }
      if (it.class === 'forme' && !hasNewSource(c.after, pub)) { drop(it, 'résumé-sans-source-neuve'); continue }
      continue
    }
    if (verdict === 'unverifiable') { if (holdUnlessApproved(it, 'source-invérifiable')) continue }
    const essential = q.tier === 'essentiel' || q.step === 1
    const high = c.kind === 'remove' || c.after?.confidence === 'high'
    const proof = essential ? c.evidence.primarySource : c.evidence.primarySource || c.evidence.independentOutlets >= 2
    if (!high || !proof) {
      const why = !high ? 'confiance haute exigée' : essential ? 'source primaire exigée (questionnaire rapide)' : 'source primaire ou deux éditeurs indépendants exigés'
      if (holdUnlessApproved(it, 'preuve-insuffisante', why)) continue
    }
    if (!c.blindRecode) { if (holdUnlessApproved(it, 'recodage-absent')) continue }
    else if (!c.blindRecode.agrees) { if (holdUnlessApproved(it, 'recodage-en-désaccord')) continue }
    if (it.class === 'renversement') {
      const dated = it.cause === 'prise-de-position' && it.statedAt && (!it.since || it.statedAt >= it.since)
      const confirmed = verdict === 'confirmed' || verdict === 'adjusted'
      if ((!dated || !confirmed) && holdUnlessApproved(it, 'preuve-insuffisante', 'renversement : une prise de position datée de la période relue, confirmée, est exigée')) continue
      if (policy.holdReversals && holdUnlessApproved(it, 'renversement')) continue
    }
  }

  // ——— Approches ajoutées ———
  const live = it => it.status === 'ok'
  const adds = items.filter(it => live(it) && it.change.kind === 'addApproach')
  const approachesAdded = []
  const takenLetters = []
  for (const it of adds) {
    const c = it.change
    const q = qById.get(c.questionId)
    const sameRun = approachesAdded.filter(a => a.questionId === c.questionId)
    const recentLedger = ledger.approaches.some(a => a.questionId === c.questionId && daysBetween(a.addedAt, today) < policy.caps.approachCooldownDays)
    const labels = history?.labels?.approaches ?? {}
    const qFirst = (history?.labels?.questions?.[c.questionId] ?? [])[0]?.from ?? null
    const recentLabel = Object.entries(labels).some(([id, versions]) => id.startsWith(`${c.questionId}-`) && versions[0]?.from && qFirst
      && versions[0].from > qFirst && daysBetween(versions[0].from, today) < policy.caps.approachCooldownDays)
    const letter = nextLetter(c.questionId, { bankQuestion: q, decisions, history, taken: takenLetters })
    if (q.approaches.length >= 9) { if (holdUnlessApproved(it, 'approches-max', `${q.approaches.length} approches`)) continue }
    if (!letter) { if (holdUnlessApproved(it, 'lettre-épuisée')) continue }
    if ((sameRun.length || recentLedger || recentLabel) && holdUnlessApproved(it, 'approche-délai', `une approche ajoutée à ${c.questionId} il y a moins de ${policy.caps.approachCooldownDays} jours`)) continue
    if (approachesAdded.length >= policy.caps.newApproachesPerRun && holdUnlessApproved(it, 'plafond-approches', `au plus ${policy.caps.newApproachesPerRun} par exécution`)) continue
    if (!letter) { drop(it, 'invalide', 'aucune lettre libre'); continue }
    takenLetters.push(letter)
    it.approachId = letter
    approachesAdded.push({ questionId: c.questionId, placeholder: c.approachId, approachId: letter, text: c.proposedApproachText, item: it })
  }
  // Positions posées sur une approche provisoire : leur lettre, ou le sort de l'approche (paquet lié)
  const linkGroups = (it, status) => {
    for (const other of items) {
      if (other === it || other.status !== 'ok' || other.change.kind === 'addApproach') continue
      if (other.change.candidateId === it.change.candidateId && other.change.questionId === it.change.questionId) {
        if (status === 'held') hold(other, 'paquet-lié', `même question que ${it.change.approachId}`)
        else drop(other, 'paquet-lié', `même question que ${it.change.approachId}`)
      }
    }
  }
  for (const it of items) {
    if (it.status !== 'ok' || !isPlaceholder(it.change.approachId) || it.change.kind === 'addApproach') continue
    const add = addOf(it)
    const done = approachesAdded.find(a => a.item === add)
    if (done) { it.approachId = done.approachId; continue }
    // Approche ajoutée par une application antérieure et déjà en ligne (accord « OK H-… » rejoué après le BUILD) : la
    // position se pose sur sa lettre, au lieu de tomber avec un ajout qui n'a plus lieu d'être
    const q = qById.get(it.change.questionId)
    const inBank = id => !!id && q.approaches.some(a => a.id === id)
    const fromLedger = add?.key && ledger.claims[add.key]?.status === 'published' ? ledger.claims[add.key].approachId : null
    const fromDecisions = (decisions.addApproaches ?? []).find(a => a.questionId === it.change.questionId && normalizeName(a.text ?? '') === normalizeName(it.text ?? ''))?.id ?? null
    const liveId = [fromLedger, fromDecisions].find(inBank)
    if (liveId) {
      it.approachId = liveId
      const pubNow = published[it.change.candidateId]?.[liveId] ?? null
      it.published = pubNow
      if (canonical(publishedForm(it.change.after)) === canonical(pubNow)) drop(it, 'sans-effet', `position déjà publiée sur ${liveId}`)
      else if (pubNow) hold(it, 'avant-mal-lu', `une position est déjà publiée sur ${liveId}, l’approche ajoutée : le « before » nul ne la reflète pas`)
      continue
    }
    const status = add?.status === 'held' ? 'held' : 'dropped'
    if (status === 'held') hold(it, 'paquet-lié', `approche ${it.change.approachId} retenue`)
    else drop(it, 'paquet-lié', `approche ${it.change.approachId} écartée`)
    linkGroups(it, status)
  }

  // ——— Atomicité : l'état complet d'une (candidat, question) se publie d'un bloc ———
  // Un changement de fond retenu ou écarté retient tout le reste de sa (candidat, question) : jamais une ancienne
  // principale retirée ou rétrogradée sans la nouvelle, jamais un état partiel. Ne comptent pas : les écarts sans
  // conséquence (sans-effet, déjà-publiée, résumé-sans-source-neuve) et les changements de forme.
  const BENIGN_DROPS = new Set(['sans-effet', 'déjà-publiée', 'résumé-sans-source-neuve'])
  const classOfItem = it => {
    if (it.class) return it.class
    const c = it.change
    if (!c || typeof c !== 'object' || !qById.has(c.questionId)) return null
    try {
      return classOf(c, isPlaceholder(c.approachId) ? null : published[c.candidateId]?.[c.approachId] ?? null)
    } catch {
      return null
    }
  }
  for (const group of byGroup.values()) {
    const failed = group.find(it => (it.status === 'held' || (it.status === 'dropped' && !BENIGN_DROPS.has(it.reason))) && classOfItem(it) !== 'forme')
    if (!failed) continue
    for (const it of group) {
      if (it === failed || it.status !== 'ok') continue
      hold(it, 'paquet-lié', `même question que ${failed.change?.approachId ?? failed.change?.questionId} (${failed.status === 'held' ? 'retenu' : 'écarté'} : ${failed.reason}) : l’état complet de la question se publie d’un bloc`)
    }
  }

  // ——— Ensemble : état final par (candidat, question) ———
  const groupsOf = () => {
    const m = new Map()
    for (const it of items) {
      if (it.status !== 'ok' || it.change.kind === 'addApproach') continue
      const k = groupKey(it.change.candidateId, it.change.questionId)
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(it)
    }
    return m
  }
  const rowAfter = (cid, extra = items) => {
    const row = { ...(published[cid] ?? {}) }
    for (const it of extra) {
      if (it.status !== 'ok' || it.change.kind === 'addApproach' || it.change.candidateId !== cid) continue
      if (it.change.kind === 'remove') delete row[it.approachId]
      else row[it.approachId] = publishedForm(it.change.after)
    }
    return row
  }
  const holdGroup = (group, reason, detail) => {
    for (const it of group) if (it.status === 'ok' && !(it.approved && !HOLD_NOT_APPROVABLE.has(reason))) hold(it, reason, detail)
  }
  for (const [k, group] of groupsOf()) {
    const [cid, qid] = k.split('|')
    const q = qById.get(qid)
    const row = rowAfter(cid)
    const ids = [...q.approaches.map(a => a.id), ...approachesAdded.filter(a => a.questionId === qid).map(a => a.approachId)]
    const ws = ids.map(id => row[id]).filter(Boolean)
    const mains = ws.filter(p => p.weight === 2).length
    const seconds = ws.filter(p => p.weight === 1).length
    if (mains > 1 || seconds > 1) holdGroup(group, 'état-final-invalide', `${mains} principale(s), ${seconds} compatible(s) sur ${qid}`)
  }

  // ——— Plafonds ———
  const inApproachBundle = it => it.change.kind === 'addApproach' || isPlaceholder(it.change.approachId)
  const countable = it => it.status === 'ok' && it.class !== 'forme' && it.mode !== 'programme' && !inApproachBundle(it)
  const order = [...items].filter(countable).sort((a, b) =>
    (CLASS_RANK[a.class] - CLASS_RANK[b.class]) || String(b.statedAt ?? '').localeCompare(String(a.statedAt ?? '')) || a.key.localeCompare(b.key))
  const perCand = new Map()
  let total = 0
  const decided = new Set()
  const groups = groupsOf()
  for (const it of order) {
    const k = groupKey(it.change.candidateId, it.change.questionId)
    if (decided.has(k)) continue
    decided.add(k)
    const group = groups.get(k) ?? [it]
    const n = group.filter(countable).length
    const mine = perCand.get(it.change.candidateId) ?? 0
    const free = group.every(x => x.approved)
    if (!free && mine + n > policy.caps.changesPerCandidate) { holdGroup(group, 'plafond-candidat', `au plus ${policy.caps.changesPerCandidate} par candidat`); continue }
    if (!free && total + n > policy.caps.changesPerRun) { holdGroup(group, 'plafond-run', `au plus ${policy.caps.changesPerRun} par exécution`); continue }
    perCand.set(it.change.candidateId, mine + n)
    total += n
  }

  // ——— Même traitement pour tous (packs.test.ts, non classés moins connus que tout candidat classé) ———
  const newPending = []
  const excludedVisible = (election?.ranking?.excluded?.ids ?? []).filter(id => !hiddenIds.has(id) && visible.includes(id))
  const ranked = visible.filter(id => !excludedVisible.includes(id))
  const allQuestions = questions
  if (excludedVisible.length && ranked.length) {
    const known = () => Object.fromEntries(visible.map(id => [id, knownCount(allQuestions, rowAfter(id))]))
    let k = known()
    const minRanked = () => Math.min(...ranked.map(id => k[id]))
    const raisers = new Map()
    for (const id of excludedVisible) {
      if (k[id] < minRanked()) continue
      const before = published[id] ?? {}
      const after = rowAfter(id)
      const raising = [...groupsOf()].filter(([gk]) => gk.startsWith(`${id}|`)).filter(([gk]) => {
        const q = qById.get(gk.split('|')[1])
        return !knownOn(q, before) && knownOn(q, after)
      })
      raisers.set(id, { known: k[id], rankedMin: minRanked() })
      for (const [, group] of raising) holdGroup(group, 'réintégration', `${nameOf(id)}, non classé, serait connu sur ${k[id]} questions, autant qu’un candidat classé (${minRanked()})`)
    }
    k = known()
    const maxExcluded = Math.max(...excludedVisible.map(id => k[id]))
    for (const id of ranked) {
      if (k[id] > maxExcluded) continue
      const before = published[id] ?? {}
      const after = rowAfter(id)
      for (const [gk, group] of groupsOf()) {
        if (!gk.startsWith(`${id}|`)) continue
        const q = qById.get(gk.split('|')[1])
        if (knownOn(q, before) && !knownOn(q, after)) holdGroup(group, 'réintégration', `couverture de ${nameOf(id)}, classé, qui descendrait au niveau d’un non classé (${maxExcluded})`)
      }
    }
    for (const [id, nums] of raisers) {
      const pid = `I-${id}`
      if (pending.some(p => p.id === pid && p.status === 'attente')) continue
      newPending.push({
        id: pid,
        kind: 'reintegration',
        branch: null,
        worktree: null,
        createdAt: now ?? `${today}T00:00:00+00:00`,
        runId,
        baseCommit: changeset.baseCommit ?? null,
        summary: `${nameOf(id)}, non classé, serait connu sur ${nums.known} questions sur ${allQuestions.length}, autant ou plus que le moins connu des candidats classés (${nums.rankedMin}) : sa réintégration au classement est à décider.`,
        approveWith: `OK ${pid}`,
        status: 'attente',
        details: { candidateId: id, known: nums.known, rankedMin: nums.rankedMin, total: allQuestions.length },
      })
    }
  }

  // ——— Une approche ajoutée sans aucune position publiée n'entre pas ———
  for (const a of [...approachesAdded]) {
    const on = items.filter(it => it.change?.kind !== 'addApproach' && isPlaceholder(it.change?.approachId) && addOf(it) === a.item)
    if (on.some(live)) continue
    const anyHeld = on.some(it => it.status === 'held')
    if (anyHeld) hold(a.item, 'paquet-lié', 'aucune position publiée sur l’approche ajoutée')
    else drop(a.item, 'paquet-lié', 'aucune position publiée sur l’approche ajoutée')
    approachesAdded.splice(approachesAdded.indexOf(a), 1)
  }

  // ——— Identifiants des retenus ———
  const prefix = `H-${today}-`
  const usedN = [...Object.values(ledger.claims).map(c => c.holdId), ...pending.map(p => p.id)]
    .filter(id => typeof id === 'string' && id.startsWith(prefix)).map(id => Number(id.slice(prefix.length))).filter(Number.isFinite)
  let n = usedN.length ? Math.max(...usedN) : 0
  const heldItems = items.filter(it => it.status === 'held')
  for (const it of [...heldItems].sort((a, b) => String(a.key).localeCompare(String(b.key)))) {
    it.holdId = ledger.claims[it.key]?.holdId ?? pendingHoldByKey.get(it.key) ?? `${prefix}${++n}`
  }

  // ——— Rapport, registre, décisions ———
  const newDecisions = structuredClone(decisions)
  newDecisions.positions ??= []
  let decisionsChanged = false
  const reported = it => ({
    claimKey: it.key,
    candidateId: it.change.candidateId,
    questionId: it.change.questionId,
    approachId: it.approachId,
    kind: it.change.kind,
    class: it.class ?? classOf(it.change, it.published),
    cause: it.cause,
    statedAt: it.statedAt,
    before: it.published ?? null,
    after: it.change.after ?? null,
    ...(it.text ? { text: it.text } : {}),
    ...(it.requalifiedFrom ? { requalified: true } : {}),
  })
  const bundles = {}
  const addBundle = (name, key) => {
    const list = (bundles[name] ??= [])
    if (!list.includes(key)) list.push(key)
  }
  for (const it of items) {
    if (it.status === 'subject' || it.status === 'ignored') continue
    const c = it.change
    if (it.status === 'dropped') {
      report.dropped.push({ reason: it.reason, ...(it.detail ? { detail: it.detail } : {}), claimKey: it.key, change: c ?? {} })
    } else if (it.status === 'held') {
      report.held.push({ id: it.holdId, reason: it.reason, ...(it.detail ? { detail: it.detail } : {}), claimKey: it.key, change: c })
    } else if (it.status === 'ok') {
      report.published.push(reported(it))
      addBundle(`candidat:${c.candidateId}`, it.key)
      if (inApproachBundle(it)) addBundle(`approche:${c.questionId}`, it.key)
      if (c.kind === 'addApproach') {
        newDecisions.addApproaches ??= []
        if (!newDecisions.addApproaches.some(a => a.id === it.approachId)) newDecisions.addApproaches.push({ questionId: c.questionId, id: it.approachId, text: c.proposedApproachText })
        ledger.approaches.push({ questionId: c.questionId, approachId: it.approachId, addedAt: today, runId })
        decisionsChanged = true
      } else {
        const note = buildNote({ change: { ...c, cause: it.cause, statedAt: it.statedAt }, published: it.published, today, runId, claimKey: it.key, requalifiedFrom: it.requalifiedFrom ?? null })
        const veille = { runId, claimKey: it.key, at: today }
        const entry = c.kind === 'remove'
          ? { questionId: c.questionId, candidate: c.candidateId, approachId: it.approachId, remove: true, note, historyCause: it.cause, ...(it.cause === 'prise-de-position' ? { statedAt: it.statedAt } : {}), veille }
          : {
              questionId: c.questionId, candidate: c.candidateId, approachId: it.approachId,
              weight: c.after.weight ?? 0, rejects: !!c.after.rejects, nature: c.after.nature, confidence: c.after.confidence,
              summary: c.after.summary, sources: c.after.sources, verdict: c.verifier.verdict, note, historyCause: it.cause,
              ...(it.cause === 'prise-de-position' ? { statedAt: it.statedAt } : {}), veille,
            }
        const at = newDecisions.positions.findIndex(e => e.candidate === c.candidateId && e.approachId === it.approachId)
        if (at >= 0) newDecisions.positions[at] = entry
        else newDecisions.positions.push(entry)
        decisionsChanged = true
      }
    }
    // Registre
    if (it.key && c && it.reason !== 'invalide' && ['set', 'remove', 'addApproach'].includes(c.kind)) {
      const prev = ledger.claims[it.key]
      if (prev?.status === 'published') { prev.lastSeen = today; continue }
      const status = it.status === 'ok' ? 'published' : it.status
      ledger.claims[it.key] = {
        candidateId: c.candidateId,
        questionId: c.questionId ?? null,
        approachId: it.approachId ?? null,
        kind: c.kind,
        ...(it.cause ? { cause: it.cause } : {}),
        statedAt: it.statedAt ?? null,
        status,
        reason: status === 'published' ? null : it.reason,
        holdId: it.holdId ?? prev?.holdId ?? null,
        runId,
        firstSeen: prev?.firstSeen ?? today,
        lastSeen: today,
        publishedIn: status === 'published' ? runId : prev?.publishedIn ?? null,
        sourceKeys: [...new Set(((c.after ?? c.before)?.sources ?? []).map(s => sourceKey(s.url)))].sort(),
      }
    }
  }

  // ——— Attentes des retenus (« OK H-… ») ———
  for (const h of report.held) {
    if (pending.some(p => p.id === h.id)) continue
    const c = h.change
    const q = qById.get(c.questionId)
    newPending.push({
      id: h.id,
      kind: 'hold',
      branch: null,
      worktree: null,
      createdAt: now ?? `${today}T00:00:00+00:00`,
      runId,
      baseCommit: changeset.baseCommit ?? null,
      summary: `${nameOf(c.candidateId)}, ${q ? `« ${q.prompt} »` : c.questionId}${c.approachId ? ` (${c.approachId})` : ''} : retenu (${h.reason}${h.detail ? `, ${h.detail}` : ''}).`,
      approveWith: `OK ${h.id}`,
      status: 'attente',
      details: { claimKey: h.claimKey, reason: h.reason, candidateId: c.candidateId, questionId: c.questionId ?? null, approachId: c.approachId ?? null },
    })
  }

  // ——— Nouvelle question : le sujet retenu ———
  const { newQuestion, newQuestionRejected } = chooseNewQuestion({ subjects, config, visible, blocOf, bankSize: questions.length, policy })

  // ——— État ———
  // Un candidat dont l'orchestrateur retient tout le paquet (après un code 30) n'avance pas : sa période sera relue.
  // L'accord d'un retenu (« only ») ne relit personne.
  const checked = onlySet.size ? [] : [...checkedSet].filter(id => visible.includes(id) && !holdBundles.has(`candidat:${id}`))
  let state = stateIn ? structuredClone(stateIn) : null
  const seeded = []
  if (state && stateOps) {
    // Un candidat présenté absent de l'état (ajouté à la main sur main, ou par un accord) y entre, sans relevé prétendu :
    // sa date d'entrée au classement, sinon de déclaration, sinon le dernier relevé publié ; today seulement s'il est relevé
    state.candidates ??= {}
    const isDay = d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today
    for (const id of visible) {
      if (state.candidates[id]) continue
      const day = [election?.ranking?.excluded?.joined?.[id], config.candidates.find(c => c.id === id)?.declaredAt, election?.dataFrozenAt, config.contextDate].find(isDay) ?? today
      state.candidates[id] = { checkedAt: day, rotationCursor: 0, lastRunId: null, programmeSeen: null }
      seeded.push(id)
    }
    const bankForState = { ...bankJson, questions: bankJson.bank.questions, topics: bankJson.bank.topics }
    const used = Object.fromEntries(checked.map(id => [id, stateOps.rotationFor(stateIn, bankForState, id, policy).nextCursor]))
    state = stateOps.advanceCheckedAt(state, checked, today, runId)
    state = stateOps.advanceRotation(state, used)
    state = stateOps.mergeWatch(state, localWatch)
    state = stateOps.mergeRefused(state, pending)
    const kind = runId.startsWith('accord-') ? 'accord' : 'hebdo'
    state.lastRuns = { ...(state.lastRuns ?? {}), [kind]: { runId, at: today, dataVersion: null } }
  }

  const fullReport = {
    format: 'isoloir-veille-apply/1',
    runId,
    today,
    dryRun,
    published: report.published,
    held: report.held,
    dropped: report.dropped,
    approaches: approachesAdded.map(({ questionId, placeholder, approachId, text }) => ({ questionId, placeholder, approachId, text })),
    checked,
    ...(seeded.length ? { seeded } : {}),
    newQuestion,
    newQuestionRejected,
    bundles,
    counts: {
      examined: items.length - ignored,
      published: report.published.length,
      held: report.held.length,
      dropped: report.dropped.length,
      approaches: approachesAdded.length,
      ignored,
    },
    files: [],
  }
  return { report: fullReport, decisions: newDecisions, decisionsChanged, ledger, state, pending: newPending }
}

/** Choix du sujet d'une nouvelle question (CONTRACT §c.8, fin) */
export function chooseNewQuestion({ subjects, config, visible, blocOf, bankSize, policy }) {
  const topics = new Set((config.topics ?? []).map(t => t.id))
  const merged = new Map()
  for (const s of subjects) {
    const k = `${s.topicId}|${normalizeName(s.subject)}`
    if (!merged.has(k)) merged.set(k, { ...s, candidates: [...(s.candidates ?? [])] })
    else merged.get(k).candidates.push(...(s.candidates ?? []))
  }
  const eligible = []
  const rejected = []
  ;[...merged.values()].forEach((s, i) => {
    const sourced = [...new Set(s.candidates.filter(c => visible.includes(c.candidateId) && (c.confidence === 'high' || c.confidence === 'medium') && c.sources?.length).map(c => c.candidateId))]
    const blocs = [...new Set(sourced.map(blocOf).filter(Boolean))]
    if (!topics.has(s.topicId)) rejected.push({ subject: s.subject, reason: `thème ${s.topicId} absent de config.json` })
    else if (sourced.length < (policy.newQuestion?.minCandidates ?? 2) || blocs.length < (policy.newQuestion?.minCandidateBlocs ?? 2)) {
      rejected.push({ subject: s.subject, reason: `${sourced.length} candidat(s) sourcé(s) de ${blocs.length} bloc(s) : il en faut ${policy.newQuestion?.minCandidates ?? 2} de ${policy.newQuestion?.minCandidateBlocs ?? 2} blocs` })
    } else if (bankSize + 1 > policy.caps.bankMax) rejected.push({ subject: s.subject, reason: `banque pleine (${bankSize} questions, au plus ${policy.caps.bankMax})` })
    else eligible.push({ s, sourced, blocs, i })
  })
  eligible.sort((a, b) => b.sourced.length - a.sourced.length || b.blocs.length - a.blocs.length || a.i - b.i)
  const keep = eligible.slice(0, policy.caps.newQuestionsPerRun)
  for (const e of eligible.slice(policy.caps.newQuestionsPerRun)) rejected.push({ subject: e.s.subject, reason: `au plus ${policy.caps.newQuestionsPerRun} nouvelle(s) question(s) par exécution` })
  const pick = keep[0]
  return {
    newQuestion: pick ? { topicId: pick.s.topicId, subject: pick.s.subject, proposal: pick.s.proposal, candidates: pick.sourced, blocs: pick.blocs } : null,
    newQuestionRejected: rejected,
  }
}

// ——— Forme 2 : acceptation d'une nouvelle question (--question) ———

/**
 * Accepte ou refuse la question neuve d'une extension fusionnée (merge-expansion --no-gapfills), selon CONTRACT §d.7.
 * Rend les nouvelles valeurs de build.json, transfer.ts (texte), de la fixture des numéros et du registre si elle est
 * acceptée ; sinon les raisons.
 */
export function acceptQuestion({ merged, mergedPath, bankJson, config, election, candidates = [], policy: policyIn, build, transferText, fixture, ledger: ledgerIn, history, today, runId }) {
  const policy = mergePolicy(policyIn)
  const wf = merged?.result ?? merged
  const reasons = []
  const drafts = wf?.drafts ?? []
  const qs = drafts.flatMap(d => d.questions ?? [])
  const bankQs = bankJson.bank.questions
  const bankIds = new Set(bankQs.map(q => q.id))
  const fresh = qs.filter(q => !bankIds.has(q.id))
  const q = fresh.length === 1 && qs.length === 1 ? fresh[0] : null
  if (!q) reasons.push(`une seule question neuve attendue (${qs.length} question(s), dont ${fresh.length} neuve(s))`)
  const questionId = q?.id ?? fresh[0]?.id ?? null
  const slots = transferSlotsOf(transferText ?? '')
  if (!slots) reasons.push('transfer.ts : table « questions » introuvable')
  if (q) {
    if (!new RegExp(`^${escapeRe(q.topicId ?? '')}-x[0-9]+$`).test(q.id)) reasons.push(`identifiant ${q.id} : « <thème>-x<n> » attendu`)
    const bankTopics = new Set(bankJson.bank.topics.map(t => t.id))
    if (!bankTopics.has(q.topicId)) reasons.push(`thème ${q.topicId} absent de la banque`)
    for (const t of drafts.flatMap(d => d.topics ?? [])) if (!bankTopics.has(t.id)) reasons.push(`thème nouveau ${t.id} : non permis`)
    if (slots?.some(([id]) => id === q.id) || fixture?.questions?.[q.id] !== undefined) reasons.push(`${q.id} a déjà un numéro de transfert (jamais réutilisé)`)
    if (history?.labels?.questions?.[q.id] || (ledgerIn?.questions ?? []).some(x => x.questionId === q.id)) reasons.push(`${q.id} a déjà existé (positions-history.json) : identifiant jamais réutilisé`)
    if (q.tier !== policy.newQuestion.tier) reasons.push(`tier ${q.tier} : ${policy.newQuestion.tier} attendu`)
    const aps = q.approaches ?? []
    if (aps.length < policy.newQuestion.approachesMin || aps.length > policy.newQuestion.approachesMax) reasons.push(`${aps.length} approches : de ${policy.newQuestion.approachesMin} à ${policy.newQuestion.approachesMax}`)
    const badIds = aps.filter(a => !new RegExp(`^${escapeRe(q.id)}-[a-p]$`).test(a.id)).map(a => a.id)
    if (badIds.length) reasons.push(`identifiants d’approche hors motif : ${badIds.join(', ')}`)
    const hiddenIds = new Set([...(election?.hidden ?? []), ...config.candidates.filter(c => c.pendingPrimary).map(c => c.id)])
    const visible = new Set(config.candidates.filter(c => !hiddenIds.has(c.id)).map(c => c.id))
    const blocOfNuance = new Map((election?.spectrum?.nuances ?? []).map(x => [x.code, x.bloc]))
    const blocOf = id => blocOfNuance.get(candidates.find(c => c.id === id)?.nuance) ?? null
    const apIds = new Set(aps.map(a => a.id))
    const ok = (q.positions ?? []).filter(p => visible.has(p.candidate) && apIds.has(p.approachId) && p.verdict !== 'refuted'
      && (p.confidence === 'high' || p.confidence === 'medium') && ((p.weight ?? 0) > 0 || p.rejects))
    const known = [...new Set(ok.map(p => p.candidate))]
    const blocs = [...new Set(known.map(blocOf).filter(Boolean))]
    if (known.length < policy.newQuestion.minKnown) reasons.push(`${known.length} candidats présentés connus : au moins ${policy.newQuestion.minKnown}`)
    if (blocs.length < policy.newQuestion.minBlocs) reasons.push(`${blocs.length} bloc(s) : au moins ${policy.newQuestion.minBlocs}`)
    const mains = ok.filter(p => p.weight === 2 && p.nature !== 'inference')
    const perAp = new Map()
    for (const p of mains) perAp.set(p.approachId, (perAp.get(p.approachId) ?? 0) + 1)
    const top = Math.max(0, ...perAp.values())
    if (perAp.size < 2) reasons.push(`${perAp.size} approche(s) principale(s) distincte(s) : au moins 2`)
    else if (top / mains.length > policy.newQuestion.maxMainShare + 1e-9) reasons.push(`l’approche la plus suivie réunit ${top} positions principales sur ${mains.length} : au plus ${Math.round(policy.newQuestion.maxMainShare * 100)} sur 100`)
    const hiddenRe = hiddenNamesRegex([...hiddenIds], candidates.length ? candidates : config.candidates)
    for (const [where, text] of [['énoncé', q.prompt], ['contexte', q.context], ...aps.map(a => [a.id, a.text])]) {
      if (!text) continue
      const hits = forbiddenHits(text, config)
      if (hits.length) reasons.push(`${where} : terme interdit ou nom (${hits.join(', ')})`)
      if (hiddenRe?.test(text)) reasons.push(`${where} : nom d’un candidat masqué`)
    }
    // Les résumés que le site montrera (positions des candidats présentés que build-pack garde : poids ou rejet, quelle
    // que soit la confiance) ne nomment aucun masqué (tests/hidden.test.ts)
    for (const p of (q.positions ?? []).filter(p => visible.has(p.candidate) && ((p.weight ?? 0) > 0 || p.rejects))) {
      if (p.summary && hiddenRe?.test(p.summary)) reasons.push(`résumé de ${p.candidate} (${p.approachId}) : nom d’un candidat masqué`)
    }
    if ((wf.gapFills ?? []).length) reasons.push(`${wf.gapFills.length} compléments de positions (gapFills) : merge-expansion --no-gapfills attendu`)
    const own = new Set([q.id, ...apIds])
    const stray = (wf.neutrality?.edits ?? []).filter(e => !own.has(e.id)).map(e => e.id)
    if (stray.length) reasons.push(`reformulations hors de la question neuve : ${stray.join(', ')}`)
    if (bankQs.length + 1 > policy.caps.bankMax) reasons.push(`banque pleine (${bankQs.length} questions, au plus ${policy.caps.bankMax})`)
  }
  const rel = mergedPath
  if (q && !/^research\/presidentielle-2027\/expansion-merged(-[0-9]+)?\.json$/.test(rel ?? '')) reasons.push(`${rel} : research/presidentielle-2027/expansion-merged-<n>.json attendu`)
  if (reasons.length) return { accepted: false, reasons, questionId, slot: null }
  const max = Math.max(-1, ...slots.map(([, n]) => n), ...Object.values(fixture?.questions ?? {}).map(Number))
  const slot = max + 1
  const ledger = structuredClone(ledgerIn ?? { format: 'isoloir-veille-ledger/1', claims: {}, approaches: [], questions: [] })
  ledger.questions ??= []
  ledger.questions.push({ questionId: q.id, addedAt: today, runId, transferSlot: slot })
  const newFixture = structuredClone(fixture ?? { tag: 1, questions: {}, topics: {} })
  newFixture.questions[q.id] = slot
  const newBuild = structuredClone(build)
  if (!newBuild.expansions.includes(rel)) newBuild.expansions.push(rel)
  return { accepted: true, reasons: [], questionId: q.id, slot, build: newBuild, transferText: addTransferSlot(transferText, q.id, slot), fixture: newFixture, ledger }
}
