// Les mots de « Le détail, sujet par sujet » de « Mon profil politique » (ui/profile/ProfileDetail.tsx) : le tableau,
// et dans le détail d'une unité ses libellés fixes, l'affinité par candidat et les lignes rouges. Un module à part,
// chargé avec le tableau à sa première ouverture, jamais avec la page (décision du 17 octobre 2026 : faire place aux
// correctifs de la barre des domaines sans relever le plafond de 58 ko de la page). Ce qui dit la lecture (en-têtes des
// blocs, écart, façons, note) reste dans core/echiquierCopy.ts, avec les règles d'écriture, les mêmes ici ;
// tests/echiquier-copy.test.ts les vérifie sur les deux.

import { cap, fr, netWord, NO_MAIN, palier } from './echiquierCopy'
import type { Mark } from './echiquier'

/**
 * Nom d'une case pour les lecteurs d'écran : « Droite (grille du ministère de l’Intérieur) : proche, nettement plus
 * près »
 */
export const cellLabel = (blocLabel: string, affinity: number | null, mark: Mark) =>
  fr(`${blocLabel} (grille du ministère de l’Intérieur) : ${[palier(affinity), netWord(mark)].filter(Boolean).join(', ')}`)

// ——— Le tableau ———

export const TABLE_CAPTION = 'Vos réponses face aux candidats de chaque bloc de la grille, par thème'
export const TABLE_THEME = 'Thème'

// ——— Le détail d'une unité ———

export const DETAIL = 'Le détail'
export const ONE_KNOWN = '(un seul candidat connu)'
export const PER_CANDIDATE = 'Votre affinité avec chaque candidat'
export const UNKNOWN_POSITION = '(position inconnue)'
export const UNRANKED_FOR_YOU = '(hors classement pour vous)'
export const BY_QUESTION = 'Question par question'
export const RED_LINE_VIEW = 'Pas d’accord, ligne rouge'
/**
 * Sous une approche marquée ligne rouge (rayée) : qui la franchit, parmi les candidats de l'axe (hors classement compris),
 * dans l'ordre de la grille puis alphabétique ; ceux dont la position est déduite, ou de confiance basse, à part (la page
 * pose les noms)
 */
export const CROSSED_BY = fr('Franchie par :')
export const MAYBE_CROSSED_BY = fr('Pourrait être franchie par :')
/** Le détail d'un thème prioritaire (lot 2, A2) */
export const PRIORITY_DETAIL = fr('Votre priorité : ce thème compte double dans votre classement, pas dans cette lecture.')
export const MAIN_OF = fr('Approche principale de :')
export const BOTH_SIDES = 'Portée des deux côtés'
export const MAIN_OF_NONE = cap(NO_MAIN)
export const SEE_IN_PROXIMITY = 'Voir dans Qui porte quoi'
/** Accords sur des approches que ne porte en principal aucun candidat classé */
export const unplaced = (n: number, family: boolean) => {
  const many = n > 1
  return fr(
    `${many ? `${n} de vos accords` : 'Un de vos accords'} ${family ? 'sur ces thèmes' : 'sur ce thème'} ${
      many ? 'portent sur des approches qui ne sont' : 'porte sur une approche qui n’est'
    } l’${NO_MAIN} : ${many ? 'elles ne rapprochent' : 'elle ne rapproche'} d’aucun bloc en particulier.`,
  )
}
