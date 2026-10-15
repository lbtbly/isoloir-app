// Historique des positions : chaque changement de la table des positions d'une élection (positions.ts), candidat
// par candidat, daté, avec l'avant, l'après, la raison et les sources. Demande du propriétaire du 2026-10-15 :
// pouvoir retracer chaque changement, et dresser plus tard une « carte des changements » de position par candidat
// (pas d'interface sur le site pour l'instant).
//
// Le fichier vit dans research/<élection>/positions-history.json (format ci-dessous, version 2). Il est rempli
// rétroactivement depuis l'historique git de positions.ts, puis tenu à jour à chaque BUILD par tools/build-pack.mjs
// (tools/positions-history.mjs ; mode d'emploi dans research/presidentielle-2027/PIPELINE.md, étape 14).
//
// Une entrée = une position (un candidat sur une approche) qui change un jour donné. Plusieurs constructions le
// même jour se fondent en une seule entrée : l'avant reste celui du début de la journée, l'après est le dernier
// état ; une entrée revenue à son avant disparaît. Rejouer les entrées dans l'ordre, depuis une table vide, redonne
// la table publiée (replay) : l'avant de chaque entrée est l'après de la précédente sur la même position.
//
// Chaque entrée dit aussi sa cause (cause) : une prise de position nouvelle du candidat n'est pas une relecture de
// notre part, ni l'arrivée d'une approche ou d'un candidat dans la banque. Une carte des changements tirée de ces
// champs ne doit montrer comme « changement du candidat » que les causes de CANDIDATE_CAUSES (décision du propriétaire
// du 2026-10-15 : même traitement pour tous, aucun candidat ne doit paraître changer d'avis quand seule notre lecture
// change). Les libellés des questions et des approches sont gardés, datés, dans labels : une approche reformulée plus
// tard garde, pour les anciennes entrées, le texte publié ce jour-là (labelAt).
//
// Ce module sert aussi au build (tools/positions-history.mjs et tools/build-pack.mjs, via l'exécution TypeScript
// de Node) : il ne doit importer que des types.

import type { CandidateId, Position, PositionTable } from './types'

/** Version du format de positions-history.json (2 depuis le 2026-10-15 : cause, statedAt et labels) */
export const HISTORY_FORMAT = 2

/**
 * Nature d'un changement, plusieurs possibles sur une même entrée :
 * - ajout, retrait : la position apparaît ou disparaît (inconnue avant ou après) ;
 * - poids : principale (2), compatible (1) ou rejet, l'un vers l'autre ;
 * - résumé, confiance, nature (proposition, déclaration, inférence), sources : la position reste la même.
 */
export type ChangeKind = 'ajout' | 'retrait' | 'poids' | 'résumé' | 'confiance' | 'nature' | 'sources'
export const CHANGE_KINDS: readonly ChangeKind[] = ['ajout', 'retrait', 'poids', 'résumé', 'confiance', 'nature', 'sources']

/**
 * fond : la position elle-même change (ajout, retrait, poids) ; forme : seule sa justification change (résumé,
 * confiance, nature, sources). Même vocabulaire que les révisions de questions (src/core/revisions.ts).
 */
export type ChangeLevel = 'fond' | 'forme'

/** Place du candidat sur l'approche, avant et après : le « sens » du changement pour la carte */
export type Stance = 'principale' | 'compatible' | 'rejet' | 'inconnue'

/**
 * Qui a consigné l'entrée : rétroactif-git (tools/positions-history.mjs rebuild, depuis l'historique git de
 * positions.ts) ou build-pack (à chaque BUILD, avant d'écrire positions.ts).
 */
export type HistoryOrigin = 'rétroactif-git' | 'build-pack'

/**
 * Pourquoi la position change, en champ structuré (la raison détaillée reste dans reason) :
 * - prise-de-position : le candidat a dit ou publié quelque chose de nouveau (date dans statedAt) ;
 * - relecture : notre lecture ou notre rédaction change (vérification, correction, complément), pas le candidat ;
 * - première-publication : premier positions.ts publié de l'élection ;
 * - nouveau-candidat, candidat-retiré : le candidat entre dans la table ou en sort ;
 * - nouvelle-approche, approche-retirée, question-retirée : la banque change, pas le candidat ;
 * - non-précisée : rien ne le dit (ni decisions.json ni inférence) ; « check » les compte.
 */
export type ChangeCause =
  | 'prise-de-position'
  | 'relecture'
  | 'première-publication'
  | 'nouveau-candidat'
  | 'candidat-retiré'
  | 'nouvelle-approche'
  | 'approche-retirée'
  | 'question-retirée'
  | 'non-précisée'
export const CHANGE_CAUSES: readonly ChangeCause[] = [
  'prise-de-position', 'relecture', 'première-publication', 'nouveau-candidat', 'candidat-retiré', 'nouvelle-approche',
  'approche-retirée', 'question-retirée', 'non-précisée',
]
/** Seules causes qui disent que le candidat lui-même a changé : ce qu'une carte des changements peut lui attribuer */
export const CANDIDATE_CAUSES: readonly ChangeCause[] = ['prise-de-position']

export interface PositionChange {
  /** Identifiant stable : « AAAA-MM-JJ:candidat:approche », suivi de « :2 », « :3 »… si la clé revient le même jour */
  id: string
  /** Jour du changement, AAAA-MM-JJ (jour du commit pour le rétroactif, jour du BUILD ensuite) */
  date: string
  candidateId: CandidateId
  questionId: string
  approachId: string
  /** Révision de la question ce jour-là (revisions.json), si connue */
  rev: number | null
  kinds: ChangeKind[]
  change: ChangeLevel
  stance: { before: Stance; after: Stance }
  /** Pourquoi la position change (voir ChangeCause) */
  cause: ChangeCause
  /**
   * Date de la prise de position du candidat (AAAA-MM-JJ ou AAAA-MM), quand la cause est prise-de-position : tirée de
   * decisions.json (statedAt), sinon de la source datée la plus récente de l'après. null sinon.
   */
  statedAt: string | null
  /**
   * Version des données publiées (election.ts, dataVersion) avant et après le changement. « after » reste null
   * tant que dataVersion n'a pas changé après le BUILD : il est renseigné au BUILD suivant ou par
   * « node tools/positions-history.mjs stamp ».
   */
  dataVersion: { before: string | null; after: string | null }
  origin: HistoryOrigin
  /** Commit qui a publié le changement (rétroactif seulement), abrégé */
  commit: string | null
  /** Pourquoi : note de decisions.json, note de vérification, message de commit… null si rien n'est consigné */
  reason: string | null
  /** D'où vient la raison : decisions.json, add-candidate/<id>.json, banque, extension, reuse.json, commit… */
  reasonFrom: string | null
  /** Position avant et après, telles que publiées dans positions.ts ; null = inconnue */
  before: Position | null
  after: Position | null
}

export interface RetroactiveCommit {
  commit: string
  date: string
  subject: string
  dataVersion: string | null
}

/** Version d'un libellé : texte publié à partir du jour from (null : retiré de la banque ce jour-là) */
export interface LabelVersion {
  from: string
  /** Révision de la question ce jour-là, si connue */
  rev: number | null
  text: string | null
}

export interface HistoryLabels {
  /** Énoncé de chaque question, versions dans l'ordre */
  questions: Record<string, LabelVersion[]>
  /** Texte de chaque approche, versions dans l'ordre */
  approaches: Record<string, LabelVersion[]>
}

export interface PositionsHistory {
  _note?: string
  format: number
  electionId: string
  /** Remplissage rétroactif : dernier commit pris en compte et commits relus, dans l'ordre */
  retroactive: { until: string; commits: RetroactiveCommit[] } | null
  labels: HistoryLabels
  entries: PositionChange[]
}

/** Écriture canonique (clés triées) : deux positions égales s'écrivent pareil, quel que soit l'ordre des clés */
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    return `{${Object.keys(o).filter(k => o[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonical(o[k])}`).join(',')}}`
  }
  return JSON.stringify(v)
}
export const samePosition = (a: Position | null | undefined, b: Position | null | undefined) => canonical(a ?? null) === canonical(b ?? null)

export function stanceOf(p: Position | null | undefined): Stance {
  if (!p) return 'inconnue'
  if (p.weight === 2) return 'principale'
  if (p.weight === 1) return 'compatible'
  if (p.rejects) return 'rejet'
  return 'inconnue'
}

/** Natures du changement entre deux états d'une position ; liste vide si rien ne change */
export function changeKinds(before: Position | null | undefined, after: Position | null | undefined): ChangeKind[] {
  if (samePosition(before, after)) return []
  if (!before) return ['ajout']
  if (!after) return ['retrait']
  const kinds: ChangeKind[] = []
  if ((before.weight ?? 0) !== (after.weight ?? 0) || !!before.rejects !== !!after.rejects) kinds.push('poids')
  if (before.summary !== after.summary) kinds.push('résumé')
  if (before.confidence !== after.confidence) kinds.push('confiance')
  if (before.nature !== after.nature) kinds.push('nature')
  if (canonical(before.sources) !== canonical(after.sources)) kinds.push('sources')
  // Champ inattendu (aucun aujourd'hui) : compté comme une retouche de sources plutôt que perdu
  if (!kinds.length) kinds.push('sources')
  return kinds
}

export const changeLevel = (kinds: readonly ChangeKind[]): ChangeLevel =>
  kinds.some(k => k === 'ajout' || k === 'retrait' || k === 'poids') ? 'fond' : 'forme'

/** Question d'une approche par défaut : l'identifiant d'approche est « <question>-<lettre> » */
export const questionOfApproach = (approachId: string) => approachId.replace(/-[^-]+$/, '')

export interface RecordOptions {
  date: string
  origin: HistoryOrigin
  previous: PositionTable
  next: PositionTable
  commit?: string | null
  dataVersion?: { before: string | null; after: string | null }
  questionOf?: (approachId: string) => string | undefined
  revOf?: (questionId: string) => number | null | undefined
  /**
   * Raison et cause d'un changement : note de la position, de la décision… (reason null si rien n'est consigné ;
   * cause absente : celle d'une entrée déjà ouverte ce jour-là, sinon non-précisée)
   */
  reasonOf?: (c: { candidateId: string; approachId: string; questionId: string; kinds: ChangeKind[]; before: Position | null; after: Position | null }) =>
    { reason: string | null; from: string | null; cause?: ChangeCause | null; statedAt?: string | null } | null | undefined
}

/** Source datée la plus récente d'une position (AAAA-MM-JJ ou AAAA-MM), pour la date d'une prise de position */
export function latestSourceDate(p: Position | null | undefined): string | null {
  const dates = (p?.sources ?? []).map(s => s.date).filter((d): d is string => !!d && /^\d{4}-\d{2}(-\d{2})?$/.test(d))
  return dates.length ? dates.sort().at(-1)! : null
}
const statedAtFor = (cause: ChangeCause, explicit: string | null | undefined, after: Position | null) =>
  explicit ?? (cause === 'prise-de-position' ? latestSourceDate(after) : null)

/** Toutes les positions (candidat, approche) qui diffèrent entre deux tables, dans un ordre stable */
export function changedKeys(previous: PositionTable, next: PositionTable): [CandidateId, string][] {
  const out: [CandidateId, string][] = []
  const cands = [...new Set([...Object.keys(next), ...Object.keys(previous)])]
  for (const c of cands) {
    const a = previous[c] ?? {}
    const b = next[c] ?? {}
    for (const ap of [...new Set([...Object.keys(b), ...Object.keys(a)])].sort()) {
      if (!samePosition(a[ap], b[ap])) out.push([c, ap])
    }
  }
  return out
}

const keyOf = (e: Pick<PositionChange, 'candidateId' | 'approachId'>) => `${e.candidateId}:${e.approachId}`

/**
 * Consigne les changements entre deux tables, à la date donnée. Une position déjà changée ce jour-là par la même
 * origine (et pas encore estampillée d'une nouvelle dataVersion) est fondue dans son entrée ; revenue à son avant,
 * l'entrée disparaît. Relancer avec les mêmes tables ne change rien (idempotence).
 * Retourne le nombre d'entrées ajoutées, mises à jour et retirées.
 */
export function recordChanges(history: PositionsHistory, o: RecordOptions): { added: number; updated: number; removed: number } {
  const stats = { added: 0, updated: 0, removed: 0 }
  for (const [candidateId, approachId] of changedKeys(o.previous, o.next)) {
    const before = o.previous[candidateId]?.[approachId] ?? null
    const after = o.next[candidateId]?.[approachId] ?? null
    const questionId = o.questionOf?.(approachId) ?? questionOfApproach(approachId)
    const rev = o.revOf?.(questionId) ?? null
    const open = history.entries.findLast(e =>
      e.date === o.date && e.origin === o.origin && keyOf(e) === `${candidateId}:${approachId}` && e.dataVersion.after === null)
    if (open) {
      const kinds = changeKinds(open.before, after)
      if (!kinds.length) {
        history.entries.splice(history.entries.indexOf(open), 1)
        stats.removed++
        continue
      }
      const why = o.reasonOf?.({ candidateId, approachId, questionId, kinds, before: open.before, after })
      const cause = why?.cause ?? open.cause
      Object.assign(open, {
        questionId,
        rev: rev ?? open.rev,
        kinds,
        change: changeLevel(kinds),
        stance: { before: stanceOf(open.before), after: stanceOf(after) },
        cause,
        statedAt: statedAtFor(cause, why?.statedAt ?? (why?.cause ? null : open.statedAt), after),
        commit: o.commit ?? open.commit,
        reason: why?.reason ?? open.reason,
        reasonFrom: why?.reason ? why.from : open.reasonFrom,
        after: after ? structuredClone(after) : null,
      })
      stats.updated++
      continue
    }
    const kinds = changeKinds(before, after)
    const why = o.reasonOf?.({ candidateId, approachId, questionId, kinds, before, after })
    const cause = why?.cause ?? 'non-précisée'
    const base = `${o.date}:${candidateId}:${approachId}`
    const taken = new Set(history.entries.map(e => e.id))
    let id = base
    for (let n = 2; taken.has(id); n++) id = `${base}:${n}`
    history.entries.push({
      id,
      date: o.date,
      candidateId,
      questionId,
      approachId,
      rev,
      kinds,
      change: changeLevel(kinds),
      stance: { before: stanceOf(before), after: stanceOf(after) },
      cause,
      statedAt: statedAtFor(cause, why?.statedAt, after),
      dataVersion: { before: o.dataVersion?.before ?? null, after: o.dataVersion?.after ?? null },
      origin: o.origin,
      commit: o.commit ?? null,
      reason: why?.reason ?? null,
      reasonFrom: why?.reason ? why.from : null,
      before: before ? structuredClone(before) : null,
      after: after ? structuredClone(after) : null,
    })
    stats.added++
  }
  return stats
}

/** Renseigne la dataVersion d'arrivée des entrées en attente, une fois la version des données changée */
export function stampDataVersion(history: PositionsHistory, current: string | null): number {
  if (!current) return 0
  let n = 0
  for (const e of history.entries) {
    if (e.dataVersion.after === null && e.dataVersion.before !== current) {
      e.dataVersion.after = current
      n++
    }
  }
  return n
}

/** Table obtenue en rejouant les entrées depuis une table vide (jusqu'à une date incluse, si donnée) */
export function replay(entries: readonly PositionChange[], until?: string): PositionTable {
  const table: PositionTable = {}
  for (const e of entries) {
    if (until && e.date > until) break
    if (e.after) (table[e.candidateId] ??= {})[e.approachId] = structuredClone(e.after)
    else if (table[e.candidateId]) {
      delete table[e.candidateId]![e.approachId]
      if (!Object.keys(table[e.candidateId]!).length) delete table[e.candidateId]
    }
  }
  return table
}

/** Table au début d'un jour : rejeu des seules entrées des jours précédents */
export const replayBefore = (entries: readonly PositionChange[], date: string): PositionTable =>
  replay(entries.filter(e => e.date < date))

/** Historique vide (format courant) */
export const emptyHistory = (electionId: string): PositionsHistory =>
  ({ format: HISTORY_FORMAT, electionId, retroactive: null, labels: { questions: {}, approaches: {} }, entries: [] })

/** Question telle que publiée dans bank.ts, pour les libellés */
export interface LabelQuestion {
  id: string
  rev?: number | null
  prompt: string
  approaches: readonly { id: string; text: string }[]
}

// Pose la version du jour d'un libellé : remplace celle du même jour, et n'en laisse aucune si elle redonne la
// précédente. Retourne vrai si le libellé change.
function setLabel(list: LabelVersion[], v: LabelVersion): boolean {
  const last = list.at(-1)
  if (last && last.from === v.from) {
    list.pop()
    const prev = list.at(-1)
    if (prev ? prev.text !== v.text : v.text !== null) list.push(v)
    return last.text !== v.text || last.rev !== v.rev
  }
  if (last ? last.text === v.text : v.text === null) return false
  list.push(v)
  return true
}

/**
 * Consigne les libellés publiés à une date : énoncés et textes d'approches qui apparaissent ou changent, et ceux qui
 * disparaissent de la banque (text null). Relancer le même jour remplace la version du jour (idempotence).
 * Retourne le nombre de libellés changés.
 */
export function recordLabels(history: PositionsHistory, date: string, questions: readonly LabelQuestion[]): number {
  const labels = (history.labels ??= { questions: {}, approaches: {} })
  let n = 0
  const seenQ = new Set<string>()
  const seenA = new Set<string>()
  for (const q of questions) {
    seenQ.add(q.id)
    const rev = q.rev ?? null
    if (setLabel((labels.questions[q.id] ??= []), { from: date, rev, text: q.prompt })) n++
    for (const a of q.approaches) {
      seenA.add(a.id)
      if (setLabel((labels.approaches[a.id] ??= []), { from: date, rev, text: a.text })) n++
    }
  }
  for (const [kind, seen] of [['questions', seenQ], ['approaches', seenA]] as const) {
    for (const [id, list] of Object.entries(labels[kind])) {
      if (!seen.has(id) && list.at(-1)?.text != null && setLabel(list, { from: date, rev: list.at(-1)!.rev, text: null })) n++
      if (!list.length) delete labels[kind][id]
    }
  }
  return n
}

/** Libellé publié à une date (fin de journée) : énoncé d'une question ou texte d'une approche ; null s'il n'existait pas */
export function labelAt(history: Pick<PositionsHistory, 'labels'>, kind: 'question' | 'approach', id: string, date: string): string | null {
  const list = (kind === 'question' ? history.labels?.questions : history.labels?.approaches)?.[id] ?? []
  let text: string | null = null
  for (const v of list) {
    if (v.from > date) break
    text = v.text
  }
  return text
}

/** L'approche existait-elle dans la banque publiée avant ce jour ? (pour reconnaître une nouvelle approche) */
export const approachKnownBefore = (history: Pick<PositionsHistory, 'labels'>, approachId: string, date: string): boolean =>
  (history.labels?.approaches?.[approachId] ?? []).some(v => v.from < date && v.text !== null)

/** Table sans ses candidats vides, pour comparer à un rejeu */
export function withoutEmptyRows(table: PositionTable): PositionTable {
  return Object.fromEntries(Object.entries(table).filter(([, row]) => Object.keys(row).length))
}

/** Incohérences de la chaîne : l'avant d'une entrée doit être l'état laissé par les précédentes */
export function chainErrors(entries: readonly PositionChange[]): string[] {
  const state = new Map<string, Position | null>()
  const errors: string[] = []
  let lastDate = ''
  for (const e of entries) {
    if (e.date < lastDate) errors.push(`${e.id} : date antérieure à l'entrée précédente (${lastDate})`)
    lastDate = e.date
    const k = keyOf(e)
    if (!samePosition(state.get(k) ?? null, e.before)) errors.push(`${e.id} : l'avant ne correspond pas à l'état précédent`)
    if (!changeKinds(e.before, e.after).length) errors.push(`${e.id} : aucun changement`)
    state.set(k, e.after)
  }
  return errors
}

/**
 * Regroupement pour la future carte des changements : candidat → question → entrées dans l'ordre des dates.
 * Le sens de chaque changement se lit dans stance (avant → après), sa portée dans change (fond ou forme) et sa cause
 * dans cause : seules les causes de CANDIDATE_CAUSES disent que le candidat a changé ; filtrer sur elles (ou les
 * distinguer à l'image) avant d'attribuer un changement au candidat.
 */
export function byCandidate(entries: readonly PositionChange[]): Record<CandidateId, Record<string, PositionChange[]>> {
  const out: Record<CandidateId, Record<string, PositionChange[]>> = {}
  for (const e of entries) ((out[e.candidateId] ??= {})[e.questionId] ??= []).push(e)
  return out
}

/** Ordre de rangement des entrées : par date, puis dans l'ordre où elles ont été consignées */
export function sortEntries(entries: PositionChange[]): PositionChange[] {
  return entries
    .map((e, i) => [e, i] as const)
    .sort(([a, i], [b, j]) => (a.date < b.date ? -1 : a.date > b.date ? 1 : i - j))
    .map(([e]) => e)
}
