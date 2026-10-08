// Comparaison de candidats entre eux. Fonctions pures, sans dépendance à l'interface ni aux réponses :
// c'est une lecture des positions publiées, pas un score d'affinité. Aucune pondération par la personne,
// aucun classement : les candidats sont pris dans l'ordre où on les donne.
//
// Lecture d'une position, la même que le moteur de score (stance, src/core/score.ts) :
// - approche principale : poids effectif 2 (une inférence est plafonnée à 1, elle compte comme compatible) ;
// - approche compatible : poids effectif 1 ;
// - rejet explicite ;
// - confiance basse : mise de côté (voir « Positions à confirmer » plus bas).
//
// Approches de tête d'un candidat sur une question : ses approches principales ; à défaut, ses approches
// compatibles ; à défaut, ses rejets. C'est ce qu'il met en avant ; une position connue en a toujours.
//
// Relation entre deux candidats sur une question, la première règle qui s'applique l'emporte :
// 1. 'unknown'   au moins l'un des deux n'a aucune position confirmée sur la question ;
// 2. 'opposed'   l'un rejette explicitement une approche de tête (portée, non rejetée) de l'autre ;
// 3. 'same'      même approche de tête, au même niveau (le plus souvent : même approche principale) ;
// 4. 'close'     une approche de tête de l'un est tenue par l'autre dans le même sens, à un autre niveau
//                (l'approche principale de l'un est compatible chez l'autre, dans un sens ou dans l'autre) ;
// 5. 'different' sinon : approches de tête différentes, sans lien connu.
// Chaque règle est symétrique : relation(a, b) = relation(b, a). Un candidat comparé à lui-même est
// 'same', ou 'unknown' faute de position confirmée.
//
// Cas limites, tranchés et testés (tests/compare.test.ts) :
// - Approche compatible commune sans approche principale commune (A : X principale, Y compatible ;
//   B : Z principale, Y compatible) : 'different'. Ce que chacun propose diffère ; un terrain secondaire
//   commun n'est pas une proximité. Il figure dans « agreements ». De même pour un rejet commun.
// - Rejet d'une approche seulement compatible chez l'autre (A : X principale ; B : Z principale, rejette Y,
//   que A juge compatible) : pas d'opposition, la relation se lit sur le reste ('different' ici, 'same' si
//   les principales coïncident). Le rejet figure dans « conflicts ». Si l'autre n'a pas d'approche principale,
//   ses approches compatibles sont ses approches de tête : les rejeter est alors une opposition.
// - Plusieurs approches principales (absent des données de la primaire) : si l'un rejette l'une des
//   principales de l'autre, 'opposed' l'emporte sur une principale commune ; le rejet explicite est le fait
//   le plus important à montrer, et la principale commune reste dans « agreements ».
// - Un seul des deux connu : 'unknown'. Une position inconnue n'est jamais devinée ni lue comme neutre.
// - Candidat sans approche principale (seulement compatible, ou seulement des rejets) : ses approches de
//   tête sont ses approches compatibles, ou ses rejets. Deux candidats qui ne font que rejeter la même
//   approche sont 'same' (niveau 'rejection') ; un rejet partagé avec un candidat qui, lui, propose autre
//   chose est 'close'.
// - Question sans approche : 'unknown'.
//
// Positions à confirmer (confiance basse) : on ne s'en sert jamais pour conclure. La relation est calculée
// pour chaque façon dont ces positions pourraient se révéler (écartées, ou confirmées telles quelles) ; si
// toutes donnent la même relation, c'est la relation ; sinon elle est 'unknown', avec uncertain = true
// (« position à confirmer »). C'est la règle du moteur de score transposée : une position probable compte
// comme inconnue dès qu'elle touche ce qu'on compare, et seulement alors.

import { stance } from './score'
import type { ApproachId, CandidateId, ElectionPack, Position, PositionTable, Question, TopicId } from './types'

/** Les données d'une élection dont la comparaison a besoin */
export type CompareData = Pick<ElectionPack, 'bank' | 'positions'>

/** Relation entre deux candidats sur une question */
export type Relation = 'same' | 'close' | 'different' | 'opposed' | 'unknown'

/** Toutes les relations, de la plus proche à la plus éloignée, l'inconnue à la fin */
export const RELATIONS: readonly Relation[] = ['same', 'close', 'different', 'opposed', 'unknown']

/** Niveau d'une position : approche principale, compatible, ou rejet explicite */
export type StanceLevel = 'main' | 'compatible' | 'rejection'

/** Ce qu'un candidat tient sur une question, positions confirmées seulement, dans l'ordre des approches */
export interface CandidateStance {
  main: ApproachId[]
  compatible: ApproachId[]
  rejects: ApproachId[]
  /** Approches de tête : principales, à défaut compatibles, à défaut rejetées */
  lead: ApproachId[]
  /** Niveau des approches de tête, null si aucune position confirmée */
  leadLevel: StanceLevel | null
  /** Positions de confiance basse, mises de côté (à confirmer) */
  unconfirmed: ApproachId[]
}

export interface QuestionComparison {
  questionId: string
  topicId: TopicId
  relation: Relation
  /** Relation inconnue parce qu'elle dépend d'une position à confirmer (confiance basse) */
  uncertain: boolean
  a: CandidateStance
  b: CandidateStance
  /** Pour 'same' : le niveau de l'approche de tête commune */
  sameLevel?: StanceLevel
  /** Approches que les deux tiennent dans le même sens (portées par les deux, ou rejetées par les deux) */
  agreements: ApproachId[]
  /** Approches portées par l'un et rejetées par l'autre, qu'elles fassent ou non l'opposition */
  conflicts: ApproachId[]
}

// ——— Une question ———

/** Profil d'un candidat : approche → +2, +1 ou −1 (seulement les positions prises en compte) */
type Profile = Map<ApproachId, number>

/** Au-delà, on n'énumère pas les façons de confirmer : la relation est dite inconnue */
const MAX_UNCONFIRMED = 8

const isUnconfirmed = (p: Position | undefined) => !!p && p.confidence === 'low' && (!!p.weight || !!p.rejects)

/** Profil sur la question ; les positions de confiance basse ne comptent que si « confirmed » les contient */
function profileOf(question: Question, table: Record<ApproachId, Position> | undefined, confirmed: ReadonlySet<ApproachId>): Profile {
  const out: Profile = new Map()
  for (const a of question.approaches) {
    const p = table?.[a.id]
    if (!p) continue
    const s = stance(p.confidence === 'low' && confirmed.has(a.id) ? { ...p, confidence: 'medium' } : p)
    if (s !== 0) out.set(a.id, s)
  }
  return out
}

const LEVELS: [number, StanceLevel][] = [
  [2, 'main'],
  [1, 'compatible'],
  [-1, 'rejection'],
]

function leadOf(profile: Profile): { level: StanceLevel | null; sign: number; ids: ApproachId[] } {
  for (const [v, level] of LEVELS) {
    const ids = [...profile].filter(([, s]) => s === v).map(([id]) => id)
    if (ids.length) return { level, sign: Math.sign(v), ids }
  }
  return { level: null, sign: 0, ids: [] }
}

/** Relation entre deux profils, sans position à confirmer */
function classify(pa: Profile, pb: Profile): { relation: Relation; sameLevel?: StanceLevel } {
  if (pa.size === 0 || pb.size === 0) return { relation: 'unknown' }
  const la = leadOf(pa)
  const lb = leadOf(pb)
  // L'un rejette une approche que l'autre porte en tête
  const rejectsLead = (lead: typeof la, other: Profile) => lead.sign > 0 && lead.ids.some(id => (other.get(id) ?? 0) < 0)
  if (rejectsLead(la, pb) || rejectsLead(lb, pa)) return { relation: 'opposed' }
  if (la.level === lb.level && la.ids.some(id => lb.ids.includes(id))) return { relation: 'same', sameLevel: la.level! }
  // L'autre tient une approche de tête dans le même sens, à un autre niveau
  const holds = (lead: typeof la, other: Profile) => lead.ids.some(id => Math.sign(other.get(id) ?? 0) === lead.sign)
  if (holds(la, pb) || holds(lb, pa)) return { relation: 'close' }
  return { relation: 'different' }
}

function stanceOf(question: Question, profile: Profile, table: Record<ApproachId, Position> | undefined): CandidateStance {
  const lead = leadOf(profile)
  const pick = (v: number) => [...profile].filter(([, s]) => s === v).map(([id]) => id)
  return {
    main: pick(2),
    compatible: pick(1),
    rejects: pick(-1),
    lead: lead.ids,
    leadLevel: lead.level,
    unconfirmed: question.approaches.filter(a => isUnconfirmed(table?.[a.id])).map(a => a.id),
  }
}

const NONE: ReadonlySet<ApproachId> = new Set()

/** Comparaison détaillée de deux candidats sur une question */
export function compareQuestion(a: CandidateId, b: CandidateId, question: Question, positions: PositionTable): QuestionComparison {
  const ta = positions[a]
  const tb = positions[b]
  const pa = profileOf(question, ta, NONE)
  const pb = profileOf(question, tb, NONE)
  const base = classify(pa, pb)

  // Positions à confirmer, d'un côté comme de l'autre : la relation doit tenir quelle que soit leur issue
  const pending = [
    ...question.approaches.filter(x => isUnconfirmed(ta?.[x.id])).map(x => ({ side: 0, id: x.id })),
    ...question.approaches.filter(x => isUnconfirmed(tb?.[x.id])).map(x => ({ side: 1, id: x.id })),
  ]
  let relation = base.relation
  let uncertain = false
  if (pending.length > MAX_UNCONFIRMED) {
    relation = 'unknown'
    uncertain = true
  } else {
    for (let mask = 1; mask < 1 << pending.length && !uncertain; mask++) {
      const ca = new Set<ApproachId>()
      const cb = new Set<ApproachId>()
      pending.forEach((x, i) => {
        if (mask & (1 << i)) (x.side === 0 ? ca : cb).add(x.id)
      })
      if (classify(profileOf(question, ta, ca), profileOf(question, tb, cb)).relation !== base.relation) {
        relation = 'unknown'
        uncertain = true
      }
    }
  }

  const agreements: ApproachId[] = []
  const conflicts: ApproachId[] = []
  for (const x of question.approaches) {
    const sa = Math.sign(pa.get(x.id) ?? 0)
    const sb = Math.sign(pb.get(x.id) ?? 0)
    if (sa === 0 || sb === 0) continue
    if (sa === sb) agreements.push(x.id)
    else conflicts.push(x.id)
  }

  return {
    questionId: question.id,
    topicId: question.topicId,
    relation,
    uncertain,
    a: stanceOf(question, pa, ta),
    b: stanceOf(question, pb, tb),
    ...(relation === 'same' && base.sameLevel ? { sameLevel: base.sameLevel } : {}),
    agreements,
    conflicts,
  }
}

/** Relation entre deux candidats sur une question (voir l'en-tête du module) */
export function relation(a: CandidateId, b: CandidateId, question: Question, positions: PositionTable): Relation {
  return compareQuestion(a, b, question, positions).relation
}

// ——— Un thème ———

/** Verdict d'une paire sur un thème */
export type TopicVerdict = 'proches' | 'partages' | 'differents' | 'opposes' | 'inconnu'

/** Tous les verdicts, du plus proche au plus éloigné, l'inconnu à la fin */
export const TOPIC_VERDICTS: readonly TopicVerdict[] = ['proches', 'partages', 'differents', 'opposes', 'inconnu']

/**
 * Seuils du verdict d'un thème. Les parts se calculent sur les questions connues des deux (les questions
 * inconnues n'entrent pas au dénominateur : elles ne tirent le verdict ni vers l'accord ni vers le désaccord).
 * accords = 'same' + 'close'.
 */
export interface VerdictThresholds {
  /** En dessous de ce nombre de questions connues des deux : « inconnu » */
  minKnown: number
  /** « opposés » si la part des 'opposed' atteint ce seuil (≥) et dépasse celle des accords */
  opposedShare: number
  /** « opposés » aussi dès qu'il y a une opposition et aucun accord */
  opposedWithoutAgreement: boolean
  /** « proches » si la part des accords dépasse ce seuil (>) … */
  nearShare: number
  /** … avec au plus ce nombre d'oppositions */
  nearMaxOpposed: number
  /** « différents » si la part des 'different' dépasse ce seuil (>), sans aucune opposition */
  differentShare: number
}

/**
 * Seuils par défaut, et pourquoi :
 * - minKnown 1 : un verdict dès une question comparable, la couverture (known / total) l'accompagne
 *   toujours ; plus haut, les thèmes d'une seule question (trois dans la primaire) seraient toujours muets.
 * - nearShare 0,5 strict et nearMaxOpposed 0 : « proches » demande une majorité d'accords et aucun rejet
 *   explicite. Un rejet n'est jamais noyé sous « proches » : proches sur une question et opposés sur une
 *   autre donne « partagés », ce que la personne doit voir.
 * - opposedShare 0,5 inclus, et plus d'oppositions que d'accords : au moins la moitié des questions
 *   comparables portent un rejet explicite, signal rare et fort (un rejet sur huit positions dans la
 *   primaire). À égalité entre accords et oppositions (une question de chaque), le thème est « partagés » :
 *   on ne tranche pas pour le désaccord.
 * - opposedWithoutAgreement : un rejet explicite et aucun point d'accord connu, c'est une opposition, même
 *   si les autres questions sont seulement « différentes ».
 * - differentShare 0,5 strict, sans opposition : surtout des approches différentes, sans rejet.
 * - Le reste est « partagés » : un mélange.
 */
export const DEFAULT_THRESHOLDS: VerdictThresholds = {
  minKnown: 1,
  opposedShare: 0.5,
  opposedWithoutAgreement: true,
  nearShare: 0.5,
  nearMaxOpposed: 0,
  differentShare: 0.5,
}

export type RelationCounts = Record<Relation, number>

const emptyCounts = (): RelationCounts => ({ same: 0, close: 0, different: 0, opposed: 0, unknown: 0 })

/** Verdict à partir des comptes par relation */
export function verdictOf(counts: RelationCounts, thresholds: VerdictThresholds = DEFAULT_THRESHOLDS): TopicVerdict {
  const agree = counts.same + counts.close
  const known = agree + counts.different + counts.opposed
  if (known === 0 || known < thresholds.minKnown) return 'inconnu'
  const opp = counts.opposed
  if (opp / known >= thresholds.opposedShare && opp > agree) return 'opposes'
  if (thresholds.opposedWithoutAgreement && opp > 0 && agree === 0) return 'opposes'
  if (agree / known > thresholds.nearShare && opp <= thresholds.nearMaxOpposed) return 'proches'
  if (counts.different / known > thresholds.differentShare && opp === 0) return 'differents'
  return 'partages'
}

export interface TopicComparison {
  topicId: TopicId
  verdict: TopicVerdict
  /** Nombre de questions par relation */
  counts: RelationCounts
  /** Parmi les 'unknown', celles qui dépendent d'une position à confirmer */
  uncertain: number
  /** Questions connues des deux */
  known: number
  /** Questions du thème */
  total: number
  /** Le détail, dans l'ordre de la banque */
  questions: QuestionComparison[]
}

function tally(list: QuestionComparison[]): { counts: RelationCounts; uncertain: number; known: number } {
  const counts = emptyCounts()
  let uncertain = 0
  for (const q of list) {
    counts[q.relation]++
    if (q.uncertain) uncertain++
  }
  return { counts, uncertain, known: list.length - counts.unknown }
}

/** Comparaison de deux candidats sur un thème */
export function topicRelation(
  a: CandidateId,
  b: CandidateId,
  topicId: TopicId,
  data: CompareData,
  thresholds: VerdictThresholds = DEFAULT_THRESHOLDS,
): TopicComparison {
  const questions = data.bank.questions.filter(q => q.topicId === topicId).map(q => compareQuestion(a, b, q, data.positions))
  const { counts, uncertain, known } = tally(questions)
  return { topicId, verdict: verdictOf(counts, thresholds), counts, uncertain, known, total: questions.length, questions }
}

// ——— Toute la banque ———

export interface PairOverall {
  a: CandidateId
  b: CandidateId
  counts: RelationCounts
  uncertain: number
  known: number
  total: number
  /** Part des questions connues des deux en 'same' ou 'close', entre 0 et 1 ; null si aucune */
  agreeShare: number | null
  /** Part en 'different' */
  differentShare: number | null
  /** Part en 'opposed' */
  opposedShare: number | null
  /** Nombre de thèmes par verdict */
  topics: Record<TopicVerdict, number>
}

/**
 * Vue d'ensemble d'une paire, sur toutes les questions de la banque, chacune comptant pour une : aucune
 * pondération par la personne. Ce n'est pas un score d'affinité, et rien n'en fait un classement.
 */
export function overallPair(
  a: CandidateId,
  b: CandidateId,
  data: CompareData,
  thresholds: VerdictThresholds = DEFAULT_THRESHOLDS,
): PairOverall {
  const list = data.bank.questions.map(q => compareQuestion(a, b, q, data.positions))
  const { counts, uncertain, known } = tally(list)
  const share = (n: number) => (known ? n / known : null)
  const topics: Record<TopicVerdict, number> = { proches: 0, partages: 0, differents: 0, opposes: 0, inconnu: 0 }
  for (const t of data.bank.topics) {
    const { counts: c } = tally(list.filter(q => q.topicId === t.id))
    topics[verdictOf(c, thresholds)]++
  }
  return {
    a,
    b,
    counts,
    uncertain,
    known,
    total: list.length,
    agreeShare: share(counts.same + counts.close),
    differentShare: share(counts.different),
    opposedShare: share(counts.opposed),
    topics,
  }
}

// ——— Trois ou quatre candidats ———

export interface CandidatePair {
  a: CandidateId
  b: CandidateId
}

/**
 * Lecture d'un thème pour tout le groupe, en données (le texte est l'affaire de l'interface) :
 * - 'inconnu'          aucune paire connue ;
 * - 'ecart-radical'    au moins une paire « opposés » (voir opposed et apart) ;
 * - 'tous-proches'     toutes les paires connues sont « proches » ;
 * - 'tous-differents'  toutes les paires connues sont « différents » ;
 * - 'contrastes'       un mélange, sans opposition.
 * « Toutes les paires connues » : quand complete est faux, certaines paires sont inconnues, et l'interface
 * doit le dire (« parmi les positions connues »).
 */
export type GroupSummaryKind = 'inconnu' | 'ecart-radical' | 'tous-proches' | 'tous-differents' | 'contrastes'

export interface GroupTopicSummary {
  kind: GroupSummaryKind
  /** Paires « opposés », dans l'ordre des paires */
  opposed: CandidatePair[]
  /** Paires « proches » */
  near: CandidatePair[]
  /** Paires « inconnu » */
  unknown: CandidatePair[]
  /** Candidat opposé à chacun des autres, quand les autres ne s'opposent pas entre eux (3 candidats ou plus) */
  apart: CandidateId | null
  knownPairs: number
  totalPairs: number
  /** Toutes les paires sont connues */
  complete: boolean
}

export interface PairTopic extends CandidatePair {
  comparison: TopicComparison
}

export interface GroupTopicComparison {
  topicId: TopicId
  /** Chaque paire, dans l'ordre des candidats : (1, 2), (1, 3), …, (2, 3), … */
  pairs: PairTopic[]
  summary: GroupTopicSummary
}

export interface GroupComparison {
  /** Les candidats, dans l'ordre choisi par la personne, sans doublon */
  candidates: CandidateId[]
  /** Un élément par thème, dans l'ordre de la banque */
  topics: GroupTopicComparison[]
  /** Vue d'ensemble de chaque paire, dans le même ordre */
  overall: PairOverall[]
}

/** Les paires d'une liste, dans son ordre */
export function pairsOf(ids: readonly CandidateId[]): CandidatePair[] {
  const out: CandidatePair[] = []
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) out.push({ a: ids[i]!, b: ids[j]! })
  return out
}

/** Résumé d'un thème à partir des verdicts de chaque paire */
export function summarizeTopic(pairs: readonly (CandidatePair & { verdict: TopicVerdict })[], candidates: readonly CandidateId[]): GroupTopicSummary {
  const only = (v: TopicVerdict) => pairs.filter(p => p.verdict === v).map(({ a, b }) => ({ a, b }))
  const opposed = only('opposes')
  const near = only('proches')
  const unknown = only('inconnu')
  const knownPairs = pairs.length - unknown.length
  const known = pairs.filter(p => p.verdict !== 'inconnu')

  let apart: CandidateId | null = null
  if (candidates.length >= 3 && opposed.length) {
    for (const c of candidates) {
      const mine = pairs.filter(p => p.a === c || p.b === c)
      if (mine.every(p => p.verdict === 'opposes') && opposed.every(p => p.a === c || p.b === c)) apart = c
    }
  }

  const kind: GroupSummaryKind =
    knownPairs === 0
      ? 'inconnu'
      : opposed.length
        ? 'ecart-radical'
        : known.every(p => p.verdict === 'proches')
          ? 'tous-proches'
          : known.every(p => p.verdict === 'differents')
            ? 'tous-differents'
            : 'contrastes'

  return { kind, opposed, near, unknown, apart, knownPairs, totalPairs: pairs.length, complete: unknown.length === 0 }
}

/**
 * Comparaison d'un groupe de candidats (pensée pour 2 à 4, valable au-delà) : la matrice des paires par
 * thème, le résumé de chaque thème, et la vue d'ensemble de chaque paire.
 */
export function compareGroup(ids: readonly CandidateId[], data: CompareData, thresholds: VerdictThresholds = DEFAULT_THRESHOLDS): GroupComparison {
  const candidates = [...new Set(ids)]
  const pairs = pairsOf(candidates)
  const topics = data.bank.topics.map(t => {
    const list: PairTopic[] = pairs.map(p => ({ ...p, comparison: topicRelation(p.a, p.b, t.id, data, thresholds) }))
    return {
      topicId: t.id,
      pairs: list,
      summary: summarizeTopic(
        list.map(p => ({ a: p.a, b: p.b, verdict: p.comparison.verdict })),
        candidates,
      ),
    }
  })
  return { candidates, topics, overall: pairs.map(p => overallPair(p.a, p.b, data, thresholds)) }
}

// ——— Le tableau : une ligne par question, une case par candidat ———
//
// Ce que lit le tableau de comparaison, en données : pour chaque question, ce que tient chaque candidat (ses
// approches de tête), les candidats qui tiennent la même approche (un repère commun), ce que chacun juge
// compatible ou rejette chez les autres (et qui rejette son approche), et une lecture de la ligne entière. Tout se
// déduit des positions confirmées et des relations deux à deux (compareQuestion) : la ligne n'invente rien que les
// paires ne disent. Seules les positions confirmées font un lien.

/**
 * Lecture d'une ligne (une question), pour tout le groupe ; la première règle qui s'applique l'emporte :
 * - 'opposed'    au moins une paire 'opposed' : l'un rejette explicitement ce qu'un autre propose ;
 * - 'unknown'    aucune paire connue (moins de deux positions connues, ou relations à confirmer) ;
 * - 'same'       toutes les paires connues sont 'same' : la même approche de tête ;
 * - 'close'      toutes les paires connues sont 'same' ou 'close', au moins une 'close' ;
 * - 'different'  aucune paire connue n'est 'same' ni 'close' ;
 * - 'mixed'      le reste : certains se rejoignent, d'autres non (trois candidats ou plus).
 * À deux, c'est la relation de la paire. « complete » dit si toutes les paires sont connues : sinon, la lecture
 * ne vaut que parmi les positions connues, et l'interface doit le dire.
 */
export type RowKind = 'same' | 'close' | 'mixed' | 'different' | 'opposed' | 'unknown'

/** Toutes les lectures d'une ligne, de la plus proche à la plus éloignée, l'inconnue à la fin */
export const ROW_KINDS: readonly RowKind[] = ['same', 'close', 'mixed', 'different', 'opposed', 'unknown']

/** Un lien d'une case vers un autre candidat : les approches de tête de cet autre qui sont en jeu */
export interface RowLink {
  candidate: CandidateId
  approaches: ApproachId[]
}

/** La case d'un candidat sur une question */
export interface RowCell {
  candidate: CandidateId
  /** Ce qu'il tient, positions confirmées seulement */
  stance: CandidateStance
  /** Au moins une position confirmée */
  known: boolean
  /**
   * Repère commun : rang (0, 1…) du groupe des candidats qui tiennent la même approche de tête au même niveau
   * (relation 'same'), dans l'ordre des colonnes ; null si aucun autre candidat ne la tient
   */
  group: number | null
  /** Les autres candidats du même groupe, dans l'ordre des colonnes */
  sameAs: CandidateId[]
  /**
   * Approches principales d'un autre que ce candidat juge compatibles. Le lien se lit de son côté, quelle que soit la
   * relation de la paire : un candidat peut juger compatible l'approche d'un autre qui, lui, rejette la sienne (la
   * paire est alors 'opposed', et l'ouverture de ce candidat reste dite). Seulement les approches principales de
   * l'autre : une approche que l'autre juge seulement compatible n'est pas « son approche » (voir alsoCompatible).
   */
  compatibleWith: RowLink[]
  /**
   * Approches qu'un autre, sans approche principale, juge compatibles, et que ce candidat juge compatibles lui aussi
   * tout en proposant autre chose ; seulement quand aucun candidat de la ligne n'en fait son approche principale
   * (sinon, chacun dit simplement juger compatible l'approche de celui qui la porte)
   */
  alsoCompatible: RowLink[]
  /** Approches de tête d'un autre que ce candidat rejette explicitement (paire 'opposed', de son côté) */
  rejects: RowLink[]
  /** Le revers de rejects : les autres qui rejettent explicitement une approche de tête de ce candidat, et laquelle */
  rejectedBy: RowLink[]
  /** Rejets d'un autre, qui ne fait que rejeter, que ce candidat partage tout en proposant autre chose (paire 'close') */
  alsoRejects: RowLink[]
  /** Une relation avec un autre candidat dépend d'une position à confirmer (confiance basse) */
  uncertain: boolean
}

export interface QuestionRow {
  questionId: string
  topicId: TopicId
  kind: RowKind
  /** Toutes les paires sont connues : la lecture vaut pour tous */
  complete: boolean
  /** Une case par candidat, dans l'ordre choisi */
  cells: RowCell[]
  /** Chaque paire, dans l'ordre des candidats : (1, 2), (1, 3), …, (2, 3), … */
  pairs: QuestionComparison[]
}

/** Lecture d'une ligne à partir des relations de ses paires */
export function rowKindOf(relations: readonly Relation[]): RowKind {
  const known = relations.filter(r => r !== 'unknown')
  if (known.includes('opposed')) return 'opposed'
  if (!known.length) return 'unknown'
  if (known.every(r => r === 'same')) return 'same'
  if (known.every(r => r === 'same' || r === 'close')) return 'close'
  if (!known.some(r => r === 'same' || r === 'close')) return 'different'
  return 'mixed'
}

/** Une question, pour tout le groupe (candidats dans l'ordre donné, sans doublon) */
export function compareRow(ids: readonly CandidateId[], question: Question, positions: PositionTable): QuestionRow {
  const candidates = [...new Set(ids)]
  const pairs = pairsOf(candidates).map(p => compareQuestion(p.a, p.b, question, positions))
  const at = (a: number, b: number) => {
    const [i, j] = a < b ? [a, b] : [b, a]
    // Rang de la paire (i, j) dans l'ordre de pairsOf
    let k = 0
    for (let x = 0; x < i; x++) k += candidates.length - 1 - x
    return pairs[k + (j - i - 1)]!
  }
  const stanceAt = (i: number): CandidateStance => {
    if (candidates.length < 2) return compareQuestion(candidates[i]!, candidates[i]!, question, positions).a
    const other = i === 0 ? 1 : 0
    const p = at(i, other)
    return i < other ? p.a : p.b
  }

  // Groupes : les candidats reliés par une relation 'same' (composantes connexes, dans l'ordre des colonnes)
  const root = candidates.map((_, i) => i)
  const find = (i: number): number => (root[i] === i ? i : (root[i] = find(root[i]!)))
  for (let i = 0; i < candidates.length; i++)
    for (let j = i + 1; j < candidates.length; j++) if (at(i, j).relation === 'same') root[find(j)] = find(i)
  const members = new Map<number, number[]>()
  candidates.forEach((_, i) => members.set(find(i), [...(members.get(find(i)) ?? []), i]))
  const shared = [...members.values()].filter(m => m.length > 1).sort((x, y) => x[0]! - y[0]!)

  // Les approches dont au moins un candidat de la ligne fait son approche principale
  const stances = candidates.map((_, i) => stanceAt(i))
  const heldAsMain = new Set(stances.flatMap(s => s.main))
  const supports = (s: CandidateStance) => s.leadLevel === 'main' || s.leadLevel === 'compatible'

  const cells: RowCell[] = candidates.map((candidate, i) => {
    const stance = stances[i]!
    const compatibleWith: RowLink[] = []
    const alsoCompatible: RowLink[] = []
    const rejects: RowLink[] = []
    const rejectedBy: RowLink[] = []
    const alsoRejects: RowLink[] = []
    let uncertain = false
    candidates.forEach((other, j) => {
      if (j === i) return
      const p = at(i, j)
      if (p.uncertain) uncertain = true
      const theirs = stances[j]!
      if (p.relation === 'opposed') {
        if (supports(theirs)) {
          const approaches = theirs.lead.filter(id => stance.rejects.includes(id))
          if (approaches.length) rejects.push({ candidate: other, approaches })
        }
        if (supports(stance)) {
          const approaches = stance.lead.filter(id => theirs.rejects.includes(id))
          if (approaches.length) rejectedBy.push({ candidate: other, approaches })
        }
      }
      // Indépendant de la relation de la paire : l'ouverture d'un candidat se dit même quand l'autre rejette la sienne,
      // ou quand leur relation attend une position à confirmer (seules les positions confirmées font le lien)
      const compatible = theirs.main.filter(id => stance.compatible.includes(id))
      if (compatible.length) compatibleWith.push({ candidate: other, approaches: compatible })
      if (p.relation === 'close' && theirs.leadLevel === 'compatible' && stance.leadLevel === 'main') {
        const approaches = theirs.lead.filter(id => stance.compatible.includes(id) && !heldAsMain.has(id))
        if (approaches.length) alsoCompatible.push({ candidate: other, approaches })
      }
      if (p.relation === 'close' && theirs.leadLevel === 'rejection' && stance.leadLevel !== 'rejection') {
        const approaches = theirs.lead.filter(id => stance.rejects.includes(id))
        if (approaches.length) alsoRejects.push({ candidate: other, approaches })
      }
    })
    const g = shared.findIndex(m => m.includes(i))
    return {
      candidate,
      stance,
      known: stance.leadLevel !== null,
      group: g < 0 ? null : g,
      sameAs: g < 0 ? [] : shared[g]!.filter(j => j !== i).map(j => candidates[j]!),
      compatibleWith,
      alsoCompatible,
      rejects,
      rejectedBy,
      alsoRejects,
      uncertain,
    }
  })

  return {
    questionId: question.id,
    topicId: question.topicId,
    kind: rowKindOf(pairs.map(p => p.relation)),
    complete: pairs.every(p => p.relation !== 'unknown'),
    cells,
    pairs,
  }
}

export type RowCounts = Record<RowKind, number>

const emptyRowCounts = (): RowCounts => ({ same: 0, close: 0, mixed: 0, different: 0, opposed: 0, unknown: 0 })

export interface TopicTable {
  topicId: TopicId
  /** Une ligne par question du thème, dans l'ordre de la banque */
  rows: QuestionRow[]
  counts: RowCounts
}

/** Ce qu'on sait d'un candidat sur toute la banque, pour la vue d'ensemble (chaque question compte pour une) */
export interface CandidateOverview {
  candidate: CandidateId
  /** Questions où sa position est connue (au moins une position confirmée) */
  known: number
  /** Pour chaque autre candidat, dans l'ordre des colonnes : questions où ils tiennent la même approche */
  same: { candidate: CandidateId; count: number }[]
  /** Pour chaque autre candidat : questions où il rejette explicitement ce que l'autre propose */
  rejects: { candidate: CandidateId; count: number }[]
}

export interface CompareTable {
  /** Les candidats, dans l'ordre choisi, sans doublon */
  candidates: CandidateId[]
  /** Un élément par thème, dans l'ordre de la banque */
  topics: TopicTable[]
  /** Lectures de toutes les lignes */
  counts: RowCounts
  /** Questions de la banque */
  total: number
  /** Une vue d'ensemble par candidat, dans l'ordre des colonnes */
  overview: CandidateOverview[]
}

/**
 * Le tableau de comparaison d'un groupe de candidats (pensé pour 2 à 4) : chaque question de la banque, une case
 * par candidat. Aucune pondération, aucun classement : les candidats restent dans l'ordre donné.
 */
export function compareTable(ids: readonly CandidateId[], data: CompareData): CompareTable {
  const candidates = [...new Set(ids)]
  const counts = emptyRowCounts()
  const overview: CandidateOverview[] = candidates.map(c => ({
    candidate: c,
    known: 0,
    same: candidates.filter(o => o !== c).map(o => ({ candidate: o, count: 0 })),
    rejects: candidates.filter(o => o !== c).map(o => ({ candidate: o, count: 0 })),
  }))
  const topics = data.bank.topics.map(t => {
    const rows = data.bank.questions.filter(q => q.topicId === t.id).map(q => compareRow(candidates, q, data.positions))
    const local = emptyRowCounts()
    for (const r of rows) {
      local[r.kind]++
      counts[r.kind]++
      r.cells.forEach((cell, i) => {
        const o = overview[i]!
        if (cell.known) o.known++
        for (const s of o.same) if (cell.sameAs.includes(s.candidate)) s.count++
        for (const x of o.rejects) if (cell.rejects.some(l => l.candidate === x.candidate)) x.count++
      })
    }
    return { topicId: t.id, rows, counts: local }
  })
  return { candidates, topics, counts, total: data.bank.questions.length, overview }
}
