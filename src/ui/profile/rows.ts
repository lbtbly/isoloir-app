// Les lignes du graphique « Sujet par sujet » de « Mon profil politique » (ui/profile/Chart.tsx) : quels sujets, dans
// quelle section, dans quel ordre. Un sujet, c'est un thème lu (deux questions au moins) ; quand aucun thème d'une
// famille ne se lit nettement, sa famille entière, comme la synthèse du calcul (core/echiquier.ts). Rien n'est
// recalculé ici : on range les lectures.

import type { Echiquier, UnitReading } from '../../core/echiquier'
import type { TopicGroup } from '../../core/types'

export interface ChartRows {
  /**
   * Nettement plus près d'un seul côté du centre (ou du centre lui-même, seul ou avec un côté) : de la gauche vers la
   * droite de la grille (premier bloc nettement plus près, puis dernier, puis nombre de blocs nettement plus loin, puis
   * nom).
   */
  main: UnitReading[]
  /** Plus près de part et d'autre du centre, sans lui : leur section à part, sans moyenne (acrossCentre) */
  both: UnitReading[]
  /** Seulement plus loin d'au moins un bloc, rangés selon le premier */
  apart: UnitReading[]
  /** Rien de net, dans l'ordre des familles : visibles, en couleurs, sous leur intertitre */
  flat: UnitReading[]
  /**
   * Thèmes sans lecture nette (une seule question, ou trop de blocs inconnus), dans l'ordre des familles ; family : la
   * famille lue à leur place
   */
  unread: { unit: UnitReading; family: string | null }[]
}

/** Une unité qui a été mise à l'épreuve du hasard */
const tested = (u: UnitReading | undefined): u is UnitReading => !!u && (u.status === 'lecture' || u.status === 'ecarts' || u.status === 'aucun')

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

/**
 * Par famille : ses thèmes mis à l'épreuve ; puis la famille entière quand aucun de ses thèmes ne se rapproche
 * nettement d'un bloc et qu'elle-même dit quelque chose (ou qu'aucun thème n'a été mis à l'épreuve). Les thèmes sans
 * lecture vont dans leur pli, avec la famille lue à leur place s'il y en a une.
 */
export function chartRows(groups: readonly TopicGroup[], reading: Pick<Echiquier, 'themes' | 'families'>, label: (u: UnitReading) => string): ChartRows {
  const byTheme = new Map(reading.themes.map(r => [r.id, r]))
  const byFamily = new Map(reading.families.map(r => [r.id, r]))
  const rows: UnitReading[] = []
  const unread: ChartRows['unread'] = []
  for (const g of groups) {
    const themes = g.topicIds.map(id => byTheme.get(id)).filter((r): r is UnitReading => !!r)
    const shown = themes.filter(tested)
    rows.push(...shown)
    const family = byFamily.get(g.id)
    let covered: string | null = null
    if (tested(family) && !shown.some(t => t.status === 'lecture') && (family.status !== 'aucun' || !shown.length)) {
      rows.push(family)
      covered = g.id
    }
    for (const t of themes) if (!tested(t)) unread.push({ unit: t, family: covered })
  }
  const byLabel = (a: UnitReading, b: UnitReading) => label(a).localeCompare(label(b), 'fr')
  return {
    main: rows
      .filter(u => u.status === 'lecture' && !acrossCentre(u))
      .sort((a, b) => a.near[0]! - b.near[0]! || a.near[a.near.length - 1]! - b.near[b.near.length - 1]! || a.far.length - b.far.length || byLabel(a, b)),
    both: rows.filter(u => u.status === 'lecture' && acrossCentre(u)),
    apart: rows.filter(u => u.status === 'ecarts').sort((a, b) => a.far[0]! - b.far[0]!),
    flat: rows.filter(u => u.status === 'aucun'),
    unread,
  }
}
