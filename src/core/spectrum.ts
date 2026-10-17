// La grille des nuances politiques d'une élection (election.spectrum) : l'ordre de la page des candidats, et l'axe de
// la page « Mon profil politique ». Petit et pur : chargé avec le code de toutes les visites (la page des candidats, le
// dépouillement et la Méthode s'en servent). Les candidats qui comptent sur l'axe (panelOf) sont à part
// (core/echiquierPanel.ts), avec le calcul de la page et sa rubrique de la Méthode, chargés à la demande.

import type { Candidate, ElectionInfo, SpectrumAxisBloc } from './types'

/** L'axe de la page « Mon profil politique » ; null si l'élection n'en a pas (pas de page) */
export const axisOf = (election: Pick<ElectionInfo, 'spectrum'>): readonly SpectrumAxisBloc[] | null =>
  election.spectrum?.axis?.length ? election.spectrum.axis : null

/**
 * Le bloc de la grille d'un candidat (celui de sa nuance) ; null s'il n'a pas de nuance de la grille. Ici plutôt
 * qu'avec le calcul de « Mon profil politique » (core/echiquier.ts, chargé à la demande), pour que d'autres fichiers
 * chargés à la demande s'en servent sans partager ce calcul
 */
export const blocOf = (election: Pick<ElectionInfo, 'spectrum'>, candidate: Pick<Candidate, 'nuance'>): string | null =>
  election.spectrum?.nuances.find(n => n.code === candidate.nuance)?.bloc ?? null

/**
 * Ordre de la grille des nuances (election.spectrum), puis alphabétique au sein d'une même nuance ; null si l'élection
 * n'en a pas ou si un candidat n'y a pas de nuance (l'ordre reste alors tiré au hasard, pour tous)
 */
export function spectrumOrder(election: ElectionInfo, candidates: Candidate[]): Candidate[] | null {
  const codes = election.spectrum?.nuances.map(n => n.code)
  if (!codes || !candidates.every(c => c.nuance && codes.includes(c.nuance))) return null
  return [...candidates].sort((a, b) => codes.indexOf(a.nuance!) - codes.indexOf(b.nuance!) || a.id.localeCompare(b.id))
}
