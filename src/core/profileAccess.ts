// « Mon profil politique » : où en est la feuille pour la page, la même règle partout (l'accueil, le dépouillement et la
// page). La page s'affiche quand toutes les questions du questionnaire rapide ont été vues (répondues ou passées), comme
// le dépouillement complet, et qu'au moins une question a reçu un avis. Des comptes seulement, aucun calcul du profil :
// ce module est dans le code de toutes les visites, le calcul (core/echiquier.ts) est chargé avec la page.

import { hasOpinion } from './answers'
import type { Answers, Question } from './types'

/** vide : rien de vu ni d'avis ; en-cours : des questions rapides restent à voir ; sans-avis : tout vu, aucun avis ; pret */
export type ProfileAccessState = 'vide' | 'en-cours' | 'sans-avis' | 'pret'

export interface ProfileAccess {
  state: ProfileAccessState
  /** Questions du questionnaire rapide vues (répondues ou passées) */
  seen: number
  total: number
  /** Questions du questionnaire rapide qui restent à voir */
  left: number
  /** Où reprendre : la première question rapide pas encore vue, sinon la première de la feuille */
  href: string
  /**
   * Questions ajoutées au questionnaire rapide depuis qu'il a été fini une fois, avec au moins un avis qui compte : la
   * page s'est déjà affichée et revient une fois ces questions vues (l'accueil et la page d'attente disent « de
   * nouveau »). Fini sans aucun avis (tout passé), elle ne s'est jamais affichée : false, la phrase générale
   */
  added: boolean
}

/**
 * questions : toute la banque (un avis sur une question approfondie compte) ; essential : le questionnaire rapide, dans
 * l'ordre de la feuille ; answers : les réponses enregistrées (vues) ; current : celles qui comptent, hors questions à
 * revoir (core/revisions.ts), pour les avis
 */
export function profileAccess(
  questions: readonly Question[],
  essential: readonly Question[],
  answers: Answers,
  current: Answers = answers,
  essentialDoneAt?: string | null,
): ProfileAccess {
  const first = essential.findIndex(q => !answers[q.id])
  const total = essential.length
  const left = essential.filter(q => !answers[q.id]).length
  const seen = total - left
  const opinions = questions.some(q => hasOpinion(current[q.id]))
  const state: ProfileAccessState = left ? (seen || opinions ? 'en-cours' : 'vide') : opinions ? 'pret' : 'sans-avis'
  return { state, seen, total, left, href: `/feuille/${first < 0 ? 1 : first + 1}`, added: left > 0 && !!essentialDoneAt && opinions }
}
