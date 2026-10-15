// Les lignes du graphique « Domaine par domaine » de « Mon profil politique » (ui/profile/Chart.tsx) : quels sujets, sous
// quel domaine, dans quel groupe, dans quel ordre. Un sujet, c'est un thème lu (deux questions au moins) ; quand aucun
// thème d'une famille ne se lit nettement, sa famille entière, comme la synthèse du calcul (core/echiquier.ts). Les
// familles (les « domaines » de la page) viennent dans l'ordre de pack.topicGroups, le même que partout ailleurs ; dans
// chacune, les lectures nettes, puis les écarts, puis les sujets sans tendance nette, puis les thèmes d'une seule
// question et ceux dont trop de blocs sont inconnus (variante a′, validée par le propriétaire le 15 octobre 2026). Rien
// n'est recalculé ici : on range les lectures.

import { hasOpinion } from '../../core/answers'
import type { Echiquier, UnitReading } from '../../core/echiquier'
import type { Answers, Question, TopicGroup } from '../../core/types'

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
