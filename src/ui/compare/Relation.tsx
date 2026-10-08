// Le vocabulaire visuel de la comparaison : la lecture de chaque ligne du tableau (une question, tous les candidats
// comparés) a un signe imprimé, un ton et un mot. Le mot est toujours là : le signe et le ton ne portent jamais
// seuls l'information. Quatre mots, pas plus, et les états inconnus : « Même approche », « Points communs »,
// « Approches différentes », « Opposition ». « Points communs » couvre les lignes où certains se rejoignent (même
// approche, ou approche jugée compatible) sans que tous tiennent la même : le détail est dit en toutes lettres dans
// la ligne, jamais par un code.
// Les tons viennent de l'échelle de la feuille, dans le sens de la réglette : vert plein quand tous tiennent la même
// approche, vert pâle pour des points communs, gris quand elles diffèrent, orangé-brun plein quand l'un rejette ce
// qu'un autre propose (jamais le rouge, réservé aux lignes rouges de l'électeur), pointillé gris inconnu. Ces tons ne
// qualifient qu'une relation : la position de chacun s'imprime en noir, et aucune couleur n'est attachée à un candidat.
// Ces mots décrivent des positions publiées, l'une par rapport à l'autre : jamais un jugement, ni rien sur l'électeur.

import type { QuestionRow, RowCell, RowKind, RowLink } from '../../core/compare'
import type { CandidateId } from '../../core/types'
import { Icon } from '../components/Icon'

/** Ton d'une marque : plein vert, pâle vert, écart, opposition, inconnu */
export type Tone = 'near' | 'close' | 'apart' | 'opposed' | 'unknown'

export interface Look {
  tone: Tone
  glyph: string
  label: string
}

const COMMON: Look = { tone: 'close', glyph: 'rel-close', label: 'Points communs' }

/** Lecture d'une ligne : une question, pour tous les candidats comparés */
export const ROW: Record<RowKind, Look> = {
  same: { tone: 'near', glyph: 'rel-same', label: 'Même approche' },
  close: COMMON,
  mixed: COMMON,
  different: { tone: 'apart', glyph: 'rel-different', label: 'Approches différentes' },
  opposed: { tone: 'opposed', glyph: 'rel-opposed', label: 'Opposition' },
  unknown: { tone: 'unknown', glyph: 'rel-unknown', label: 'Positions inconnues' },
}

/** Les lectures de la légende, dans l'ordre (« Points communs » une seule fois) */
export const LEGEND: readonly RowKind[] = ['same', 'close', 'different', 'opposed', 'unknown']

/** Ce que veut dire chaque lecture, pour la légende */
export const ROW_HELP: Record<RowKind, string> = {
  same: 'tous tiennent la même approche.',
  close: 'certains se rejoignent (la même approche, ou une approche jugée compatible), sans que tous tiennent la même. La ligne dit qui, en toutes lettres.',
  mixed: 'certains se rejoignent (la même approche, ou une approche jugée compatible), sans que tous tiennent la même. La ligne dit qui, en toutes lettres.',
  different: 'chacun met en avant une approche différente, sans rejeter celle des autres.',
  opposed: 'rejet explicite\u00a0: l’un rejette l’approche qu’un autre propose. La ligne dit qui rejette l’approche de qui.',
  unknown: 'moins de deux positions connues sur la question, ou une position probable encore à confirmer\u00a0; rien n’est deviné.',
}

/**
 * Libellé de la lecture d'une ligne ; une ligne inconnue dit pourquoi : une seule position connue, ou des positions
 * connues dont la relation attend la confirmation d'une position probable
 */
export function rowLabel(row: QuestionRow): string {
  if (row.kind !== 'unknown') return ROW[row.kind].label
  const known = row.cells.filter(c => c.known).length
  return known >= 2 ? 'À confirmer' : known === 1 ? 'Une seule position connue' : ROW.unknown.label
}

/**
 * Ce que dit une ligne, en phrases (l'interface les écrit en toutes lettres, noms compris, sans code) :
 * - 'rejects'          « Faure, Royal et Maurel rejettent l'approche de Glucksmann » ;
 * - 'same'             « Faure et Maurel portent la même approche (A) » (pas quand tous la portent : la marque le dit) ;
 * - 'compatible'       « Faure et Royal jugent compatible l'approche de Glucksmann » ;
 * - 'also-compatible'  « Faure juge aussi compatible l'approche citée par Royal » (que personne ne porte en principale) ;
 * - 'also-rejects'     « Maurel rejette aussi ce que rejette Royal ».
 * who : les sujets de la phrase ; whom : ceux dont on parle ; tous dans l'ordre des colonnes.
 */
export type SayKind = 'rejects' | 'same' | 'compatible' | 'also-compatible' | 'also-rejects'

export interface Say {
  kind: SayKind
  who: CandidateId[]
  whom: CandidateId[]
  /** Pour 'same' : le rang du repère (A, B…) */
  group?: number
}

/** Les phrases d'une ligne, oppositions d'abord ; une phrase par approche en jeu, sans doublon */
export function rowSays(row: QuestionRow): Say[] {
  const ids = row.cells.map(c => c.candidate)
  const inOrder = (set: ReadonlySet<CandidateId>) => ids.filter(id => set.has(id))
  const collect = (kind: SayKind, links: (c: RowCell) => RowLink[]): Say[] => {
    const per = new Map<string, { who: Set<CandidateId>; whom: Set<CandidateId> }>()
    for (const c of row.cells)
      for (const l of links(c))
        for (const a of l.approaches) {
          const e = per.get(a) ?? { who: new Set(), whom: new Set() }
          e.who.add(c.candidate)
          e.whom.add(l.candidate)
          per.set(a, e)
        }
    const seen = new Set<string>()
    const out: Say[] = []
    for (const e of per.values()) {
      const say = { kind, who: inOrder(e.who), whom: inOrder(e.whom) }
      const key = `${say.who.join(',')}>${say.whom.join(',')}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(say)
    }
    return out
  }
  const groups: Say[] = []
  if (row.kind !== 'same') {
    const by = new Map<number, CandidateId[]>()
    for (const c of row.cells) if (c.group !== null) by.set(c.group, [...(by.get(c.group) ?? []), c.candidate])
    for (const [group, who] of [...by].sort((x, y) => x[0] - y[0])) groups.push({ kind: 'same', who, whom: [], group })
  }
  return [
    ...collect('rejects', c => c.rejects),
    ...groups,
    ...collect('compatible', c => c.compatibleWith),
    ...collect('also-compatible', c => c.alsoCompatible),
    ...collect('also-rejects', c => c.alsoRejects),
  ]
}

/** Une marque : signe, ton et mot, en petit rectangle imprimé (angles droits) */
export function Mark({ look, label, small, class: c }: { look: Look; label?: string; small?: boolean; class?: string }) {
  return (
    <span class={['rel', `tone-${look.tone}`, small ? 'is-small' : '', c ?? ''].filter(Boolean).join(' ')}>
      <Icon name={look.glyph} />
      <span class="rel-word">{label ?? look.label}</span>
    </span>
  )
}
