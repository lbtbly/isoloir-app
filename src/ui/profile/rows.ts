// Les lignes du graphique « Domaine par domaine » de « Mon profil politique » (ui/profile/Chart.tsx) : quels sujets, sous
// quel domaine, dans quel groupe, dans quel ordre. Un sujet, c'est un thème lu (deux questions au moins) ; quand aucun
// thème d'une famille ne se lit nettement, sa famille entière, comme la synthèse du calcul (core/echiquier.ts). Les
// familles (les « domaines » de la page) viennent dans l'ordre de pack.topicGroups, le même que partout ailleurs ; dans
// chacune, les lectures nettes, puis les écarts, puis les sujets sans tendance nette, puis les thèmes d'une seule
// question et ceux dont trop de blocs sont inconnus (variante a′, validée par le propriétaire le 15 octobre 2026). Rien
// n'est recalculé ici : on range les lectures. Puis ce que la page sait déjà de la feuille, posé sur les lignes sans rien
// changer aux lectures (lot 2) : les lignes rouges franchies, sous un bloc nettement plus près (les thèmes prioritaires
// suivent la règle du dépouillement, core/answers.ts : priorityTopics). Enfin la façon de répondre (lot 4), comptée sur
// les lignes et la feuille, sans aucun test.

import { hasOpinion } from '../../core/answers'
import type { Echiquier, UnitReading } from '../../core/echiquier'
import { MIN_WAYS, type NothingCause } from '../../core/echiquierCopy'
import type { DealbreakerHit, Results } from '../../core/score'
import type { Answers, CandidateId, Question, QuestionId, TopicGroup, TopicId } from '../../core/types'

/**
 * Les groupes d'un domaine, dans cet ordre : net, nettement plus près d'un seul côté du centre (ou du centre lui-même,
 * seul ou avec un côté) ; both, plus près de part et d'autre du centre, sans lui (acrossCentre) ; apart, seulement plus
 * loin d'au moins un bloc ; flat, rien de net ; thin, une seule question ; unknown, trop de blocs sans candidat connu
 */
export type RowGroupKind = 'net' | 'both' | 'apart' | 'flat' | 'thin' | 'unknown'
export const GROUP_ORDER: readonly RowGroupKind[] = ['net', 'both', 'apart', 'flat', 'thin', 'unknown']

export interface FamilyRows {
  /** Identifiant de la famille (pack.topicGroups) */
  id: string
  /** Son nom */
  label: string
  /** Un intertitre : faux pour une famille d'un seul thème, dont la ligne porte déjà le nom (comme le tableau du détail) */
  heading: boolean
  /** Ses groupes non vides, dans l'ordre de GROUP_ORDER */
  groups: { kind: RowGroupKind; rows: UnitReading[] }[]
}

export interface ChartRows {
  /** Les domaines qui ont au moins une ligne, dans l'ordre des familles */
  families: FamilyRows[]
  /** Les lectures nettes (net et both), dans l'ordre de la page : celui des domaines, puis de leurs groupes */
  read: UnitReading[]
  /** Seulement plus loin, dans l'ordre de la page */
  apart: UnitReading[]
  /** Rien de net, dans l'ordre de la page */
  flat: UnitReading[]
  /**
   * Thèmes sans lecture nette (une seule question, ou trop de blocs inconnus), dans l'ordre de la page ; family : la
   * famille lue à leur place
   */
  unread: { unit: UnitReading; family: string | null }[]
}

/** Une unité qui a été mise à l'épreuve : comparée aux autres façons de poser les mêmes avis */
export const tested = (u: UnitReading | undefined): u is UnitReading => !!u && (u.status === 'lecture' || u.status === 'ecarts' || u.status === 'aucun')

/**
 * Plus près de blocs de part et d'autre du centre de la grille, sans le centre lui-même : [0, 4], [1, 3], [0, 1, 3]…
 * Des blocs non voisins, donc ; mais [0, 2] ou [2, 4], qui touchent le centre, n'en sont pas : « ce n'est pas le
 * centre » y serait faux.
 */
export function acrossCentre(u: Pick<UnitReading, 'near' | 'cells'>): boolean {
  const mid = (u.cells.length - 1) / 2
  return u.near.some(b => b < mid) && u.near.some(b => b > mid) && !u.near.includes(mid)
}

/** Plus près des deux bouts de la grille à la fois : son premier bloc et son dernier */
export const atBothEnds = (u: Pick<UnitReading, 'near' | 'cells'>) => u.near[0] === 0 && u.near[u.near.length - 1] === u.cells.length - 1

/** La clé d'une unité, unique dans la page : « theme-logement », « famille-economie » */
export const unitKey = (u: Pick<UnitReading, 'kind' | 'id'>) => `${u.kind}-${u.id}`

/** Le groupe d'une ligne dans son domaine */
export function groupOf(u: UnitReading): RowGroupKind {
  switch (u.status) {
    case 'lecture':
      return acrossCentre(u) ? 'both' : 'net'
    case 'ecarts':
      return 'apart'
    case 'aucun':
      return 'flat'
    case 'une-question':
      return 'thin'
    case 'blocs-inconnus':
      return 'unknown'
  }
}

/**
 * Par famille : ses thèmes mis à l'épreuve ; puis la famille entière quand aucun de ses thèmes ne se rapproche
 * nettement d'un bloc et qu'elle-même dit quelque chose (ou qu'aucun thème n'a été mis à l'épreuve) ; puis ses thèmes
 * sans lecture, avec la famille lue à leur place s'il y en a une. Dans un domaine, chaque groupe garde l'ordre de la
 * banque, sauf les lectures nettes d'un seul côté, de la gauche vers la droite de la grille (premier bloc nettement
 * plus près, puis dernier, puis nombre de blocs nettement plus loin, puis nom), et les écarts, selon le premier bloc
 * nettement plus loin.
 */
export function chartRows(groups: readonly TopicGroup[], reading: Pick<Echiquier, 'themes' | 'families'>, label: (u: UnitReading) => string): ChartRows {
  const byTheme = new Map(reading.themes.map(r => [r.id, r]))
  const byFamily = new Map(reading.families.map(r => [r.id, r]))
  const byLabel = (a: UnitReading, b: UnitReading) => label(a).localeCompare(label(b), 'fr')
  const families: FamilyRows[] = []
  const out: ChartRows = { families, read: [], apart: [], flat: [], unread: [] }
  for (const g of groups) {
    const themes = g.topicIds.map(id => byTheme.get(id)).filter((r): r is UnitReading => !!r)
    const shown = themes.filter(tested)
    const rows = [...shown]
    const family = byFamily.get(g.id)
    let covered: string | null = null
    if (tested(family) && !shown.some(t => t.status === 'lecture') && (family.status !== 'aucun' || !shown.length)) {
      rows.push(family)
      covered = g.id
    }
    const unread = themes.filter(t => !tested(t))
    rows.push(...unread)
    if (!rows.length) continue
    const list = GROUP_ORDER.map(kind => ({ kind, rows: rows.filter(u => groupOf(u) === kind) })).filter(x => x.rows.length)
    for (const x of list) {
      if (x.kind === 'net') x.rows.sort((a, b) => a.near[0]! - b.near[0]! || a.near[a.near.length - 1]! - b.near[b.near.length - 1]! || a.far.length - b.far.length || byLabel(a, b))
      if (x.kind === 'apart') x.rows.sort((a, b) => a.far[0]! - b.far[0]!)
      if (x.kind === 'net' || x.kind === 'both') out.read.push(...x.rows)
      if (x.kind === 'apart') out.apart.push(...x.rows)
      if (x.kind === 'flat') out.flat.push(...x.rows)
      if (x.kind === 'thin' || x.kind === 'unknown') out.unread.push(...x.rows.map(unit => ({ unit, family: covered })))
    }
    families.push({ id: g.id, label: g.label, heading: g.topicIds.length > 1, groups: list })
  }
  return out
}

/**
 * Avis uniformes (l'état C9 de la page) : chaque question qui a un avis donne le même à toutes ses approches, si bien
 * qu'il n'y a qu'une façon de poser ces avis, la vôtre ; rien à comparer, sur aucun sujet. answers : celles qui comptent
 * (hors questions à revoir)
 */
export function uniformViews(questions: readonly Question[], answers: Answers): boolean {
  let any = false
  for (const q of questions) {
    const a = answers[q.id]
    if (!hasOpinion(a)) continue
    any = true
    const first = a.ratings[q.approaches[0]!.id] ?? 0
    if (!first || q.approaches.some(x => (a.ratings[x.id] ?? 0) !== first)) return false
  }
  return any
}

/**
 * L'état de la tête du graphique (l'affichage dédié, D1), testé dans cet ordre : aucun sujet mis à l'épreuve (C5 bis) ;
 * des avis uniformes (C9) ; rien de net nulle part (C5) ; seulement des écarts (C6) ; des lectures nettes (C0)
 */
export type HeadState = 'untestable' | 'uniform' | 'nothing' | 'apart' | 'read'

export interface Head {
  state: HeadState
  /** Avec C5 : ce qu'il dit de plus, seulement quand c'est vrai de tous les sujets mis à l'épreuve (core/echiquierCopy.ts) */
  cause: NothingCause
  /** La fiche « Pour lire plus de thèmes », ouverte sous le compte ; sinon après les domaines, repliée */
  deeperOnTop: boolean
}

/**
 * La tête du graphique, d'après ses lignes : uniform, chaque question répondue donne le même avis à toutes ses approches
 * (uniformViews) ; quickOnly, aucune question approfondie répondue ; hasDeeper, des thèmes à compléter. Rien de net
 * nulle part : au seul questionnaire rapide, quand la plupart des thèmes répondus n'ont qu'une question, la cause
 * certaine ; sinon, « trop peu de façons » si chaque sujet mis à l'épreuve en a moins de dix (une seule comprise), « ne
 * se distinguent pas assez » si chacun en a assez et qu'aucun bloc ne s'en écarte nettement (UnitReading.distinct) ;
 * sinon rien de plus. La fiche s'ouvre sous le compte au seul questionnaire rapide et quand rien n'est net nulle part
 */
export function headOf(
  rows: Pick<ChartRows, 'read' | 'apart' | 'flat'>,
  themes: readonly Pick<UnitReading, 'status'>[],
  o: { uniform: boolean; quickOnly: boolean; hasDeeper: boolean },
): Head {
  const tested = rows.read.length + rows.apart.length + rows.flat.length
  const state: HeadState = !tested ? 'untestable' : o.uniform ? 'uniform' : rows.read.length ? 'read' : rows.apart.length ? 'apart' : 'nothing'
  let cause: NothingCause = null
  if (state === 'nothing') {
    if (o.quickOnly && 2 * themes.filter(t => t.status === 'une-question').length > themes.length) cause = 'quick'
    else if (rows.flat.every(u => u.ways < MIN_WAYS)) cause = 'few'
    else if (rows.flat.every(u => u.ways >= MIN_WAYS && !u.distinct)) cause = 'alike'
  }
  return { state, cause, deeperOnTop: o.hasDeeper && (state === 'nothing' || (o.quickOnly && state !== 'untestable')) }
}

// ——— Votre façon de répondre (lot 4, A5) : un constat sur la feuille, qui ne crée ni ne change aucune lecture ———

/**
 * La phrase « Votre façon de répondre », après les domaines : near, du côté « proche » (vos « d'accord ») ; sinon du
 * côté « éloigné » (vos « pas d'accord ») ; k, les questions répondues qui ont plus d'avis de ce côté que de l'autre ;
 * n, les questions répondues
 */
export interface Manner {
  near: boolean
  k: number
  n: number
}

/**
 * Le côté de la phrase « Votre façon de répondre » (A5), compté sans aucun test : au moins 9 des cases mises à l'épreuve
 * sur 10 (celles des lignes lues nettement, des écarts et des sujets sans rien de net, un bloc connu) ont pour moyenne
 * des autres façons de poser les mêmes avis (BlocCell.chance, arrondie comme le détail) 39 % ou moins, au palier
 * « éloigné » ou « très éloigné », ou 60 % ou plus, au palier « proche » ou « très proche » (core/affinity.ts) ; et plus
 * de la moitié des questions répondues ont plus de « pas d'accord » que de « d'accord » (côté « éloigné »), ou l'inverse.
 * Sinon null. Jamais avec des avis uniformes (C9) : la page ne l'y demande pas, rien n'y est comparé. answers : celles
 * qui comptent (hors questions à revoir), comme la lecture
 */
export function mannerOf(rows: Pick<ChartRows, 'read' | 'apart' | 'flat'>, questions: readonly Question[], answers: Answers): Manner | null {
  let cells = 0
  let far = 0
  let near = 0
  for (const u of [...rows.read, ...rows.apart, ...rows.flat])
    for (const c of u.cells) {
      if (c.chance === null) continue
      cells++
      const m = Math.round(c.chance)
      if (m <= 39) far++
      else if (m >= 60) near++
    }
  let n = 0
  let no = 0
  let yes = 0
  for (const q of questions) {
    const a = answers[q.id]
    if (!hasOpinion(a)) continue
    n++
    // Les avis valent 1 (d'accord) ou −1 (pas d'accord) : leur somme dit lequel l'emporte sur la question
    const s = Object.values(a.ratings).reduce<number>((t, r) => t + r, 0)
    if (s < 0) no++
    else if (s > 0) yes++
  }
  if (!cells) return null
  if (10 * far >= 9 * cells && 2 * no > n) return { near: false, k: no, n }
  if (10 * near >= 9 * cells && 2 * yes > n) return { near: true, k: yes, n }
  return null
}

// ——— Lignes rouges et priorités (lot 2) : rien ne change la couleur, la lecture ni l'ordre des lignes ———

/**
 * Les lignes rouges que franchit chaque candidat de l'axe : celles du dépouillement (core/score.ts, dealbreakerLevel),
 * que la page reçoit déjà ; classés et hors classement (les non classés ne sont pas sur l'axe). Les mêmes réponses que
 * la lecture : celles qui comptent, hors questions à revoir
 */
export function hitsOf(results: Pick<Results, 'ranking' | 'unranked'>): Map<CandidateId, readonly DealbreakerHit[]> {
  return new Map([...results.ranking, ...results.unranked].map(r => [r.candidateId, r.dealbreakers]))
}

/**
 * Des candidats d'un même bloc qui franchissent, sur une ligne, autant de lignes rouges, de la même façon, sur les mêmes
 * thèmes
 */
export interface Crossing {
  /** Dans l'ordre de l'axe (core/echiquierPanel.ts : alphabétique au sein d'un bloc), comme ses candidats connus */
  ids: CandidateId[]
  /**
   * « touche » : ils franchissent ces lignes rouges (position prise et vérifiée) ; « possible » : ils pourraient les
   * franchir (position déduite, ou de confiance basse), quand ils n'en franchissent aucune sûrement
   */
  level: DealbreakerHit['level']
  /** Combien de lignes rouges de la ligne, à ce niveau */
  count: number
  /** Les thèmes de ces lignes rouges, dans l'ordre de la banque (celui des domaines et de leurs thèmes) */
  topics: TopicId[]
}

/**
 * La croix des lignes rouges (A1) : sous chaque bloc nettement plus près d'une ligne, ceux de ses candidats qui franchissent
 * une ligne rouge posée sur une question de la ligne, c'est-à-dire sur un de ses thèmes ; groupés quand ils en franchissent
 * autant, de la même façon, sur les mêmes thèmes. Un candidat qui en franchit sûrement n'est compté que pour celles-là (la
 * phrase reste vraie ; le détail dit le reste, approche par approche). Un tableau par bloc de l'axe, vide sous un bloc qui
 * n'est pas nettement plus près. Tous les candidats du bloc comptent, même inconnus sur la ligne : une position seulement
 * probable n'y compte pas, mais elle fait « pourrait franchir ». topicOf : le thème d'une question ; order : les thèmes
 * de la banque, dans son ordre (u.topicIds suit celui des réponses, pas celui de la page)
 */
export function crossingsOf(
  u: Pick<UnitReading, 'cells' | 'questions'>,
  panel: readonly (readonly CandidateId[])[],
  hits: ReadonlyMap<CandidateId, readonly DealbreakerHit[]>,
  topicOf: (q: QuestionId) => TopicId | undefined,
  order: readonly TopicId[],
): Crossing[][] {
  return u.cells.map((c, b) => {
    if (c.mark !== 'pres') return []
    const groups = new Map<string, Crossing>()
    for (const id of panel[b] ?? []) {
      const mine = (hits.get(id) ?? []).filter(h => u.questions.includes(h.questionId))
      const firm = mine.filter(h => h.level === 'touche')
      const counted = firm.length ? firm : mine
      if (!counted.length) continue
      const level = firm.length ? 'touche' : 'possible'
      const topics = order.filter(t => counted.some(h => topicOf(h.questionId) === t))
      const key = `${level}:${counted.length}:${topics.join(',')}`
      const g = groups.get(key)
      if (g) g.ids.push(id)
      else groups.set(key, { ids: [id], level, count: counted.length, topics })
    }
    return [...groups.values()]
  })
}

/**
 * La croix montre que des candidats d'un même bloc ne pensent pas pareil : sous au moins un bloc, elle en nomme certains,
 * pas tous. La note sur le bloc entier (BLOC_NOTE) s'efface alors, et seulement alors : une croix qui nomme tout son bloc
 * ne l'illustre pas
 */
export function splitsABloc(crossings: readonly (readonly Crossing[])[], panel: readonly (readonly CandidateId[])[]): boolean {
  return crossings.some((gs, b) => {
    const named = gs.reduce((n, g) => n + g.ids.length, 0)
    return named > 0 && named < (panel[b]?.length ?? 0)
  })
}

/**
 * Dans « Le détail », sous une approche marquée ligne rouge : qui la franchit, parmi les candidats de l'axe (hors
 * classement compris), dans l'ordre de la grille puis alphabétique ; firm, la position prise et vérifiée ; possible,
 * déduite ou de confiance basse
 */
export function crossedBy(
  questionId: QuestionId,
  approachId: string,
  panel: readonly (readonly CandidateId[])[],
  hits: ReadonlyMap<CandidateId, readonly DealbreakerHit[]>,
): { firm: CandidateId[]; possible: CandidateId[] } {
  const out = { firm: [] as CandidateId[], possible: [] as CandidateId[] }
  for (const id of panel.flat()) {
    const h = hits.get(id)?.find(x => x.questionId === questionId && x.approachId === approachId)
    if (h) out[h.level === 'touche' ? 'firm' : 'possible'].push(id)
  }
  return out
}
