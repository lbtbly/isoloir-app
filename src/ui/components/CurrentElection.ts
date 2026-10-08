// L'élection affichée, pour ce qui est commun à tous les écrans (l'en-tête et son bandeau d'archive, le pied de
// page) : ses phrases propres (copy) et, si c'est une archive, de quoi le dire. ElectionFrame la fournit (app.tsx).
// Ce module n'importe que des types et preact : la feuille de pointage, qui affiche l'en-tête et le pied de page,
// n'y reçoit rien des candidats ni de leurs positions (le registre des élections est lu par ElectionFrame).

import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { ElectionInfo } from '../../core/types'

/** Une élection gardée en archive, telle que la présente son bandeau */
export interface ArchiveState {
  /** Fin du vote, ISO 8601 : jusque-là, le bandeau dit que le vote est en cours */
  votingUntil?: string
  /** Le nom de l'élection du site (registre : label), vers laquelle mène le bandeau */
  currentLabel: string
}

export interface CurrentElection {
  election: ElectionInfo
  /** Élection archivée : ce qu'en dit le bandeau ; null pour l'élection du site */
  archive: ArchiveState | null
  /** Le site garde au moins une élection en archive : le pied de page mène à la page des archives */
  hasArchives: boolean
}

export const CurrentElectionContext = createContext<CurrentElection | null>(null)

/** L'élection affichée ; null hors d'une élection (écran de chargement) */
export function useCurrentElection(): CurrentElection | null {
  return useContext(CurrentElectionContext)
}

/** Le vote est-il en cours ? Jusqu'à « until » (ISO 8601) ; sans date, non */
export function isVoting(until: string | undefined, now = Date.now()): boolean {
  const end = until ? Date.parse(until) : Number.NaN
  return !Number.isNaN(end) && now < end
}

/**
 * Le nom d'une élection du registre (label : « Primaire « Choisir 2027 » », « Présidentielle 2027 ») en cours de
 * phrase, après une préposition : withArticle('pour', label) → « pour la primaire « Choisir 2027 » ». Les noms
 * d'élection du registre sont au féminin (« la primaire », « la présidentielle ») ; devant une voyelle, l'article
 * s'élide (« pour l’élection… ») ; un nom au pluriel (« Législatives 2027 ») prend « les », contracté après « à ».
 */
export function withArticle(preposition: 'à' | 'pour' | 'de', label: string): string {
  const name = label.charAt(0).toLowerCase() + label.slice(1)
  const first = name.split(/\s/)[0] ?? ''
  if (/[sx]$/.test(first)) return `${preposition === 'à' ? 'aux' : preposition === 'de' ? 'des' : 'pour les'} ${name}`
  const article = /^[aeiouyàâéèêëîïôûü]/i.test(name) ? 'l’' : 'la '
  return `${preposition} ${article}${name}`
}
