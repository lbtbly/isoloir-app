// La grille des nuances politiques d'une élection (election.spectrum) : l'ordre de la page des candidats, et l'axe de
// la page « Mon profil politique ». Petit et pur : chargé avec le code de toutes les visites (la page des candidats, le
// dépouillement et la Méthode s'en servent). Les candidats qui comptent sur l'axe (panelOf) sont avec le calcul de la
// page, chargé à la demande (core/echiquier.ts).

import type { Candidate, ElectionInfo, SpectrumAxisBloc } from './types'

/** L'axe de la page « Mon profil politique » ; null si l'élection n'en a pas (pas de page) */
export const axisOf = (election: Pick<ElectionInfo, 'spectrum'>): readonly SpectrumAxisBloc[] | null =>
  election.spectrum?.axis?.length ? election.spectrum.axis : null

/**
 * Ordre de la grille des nuances (election.spectrum), puis alphabétique au sein d'une même nuance ; null si l'élection
 * n'en a pas ou si un candidat n'y a pas de nuance (l'ordre reste alors tiré au hasard, pour tous)
 */
export function spectrumOrder(election: ElectionInfo, candidates: Candidate[]): Candidate[] | null {
  const codes = election.spectrum?.nuances.map(n => n.code)
  if (!codes || !candidates.every(c => c.nuance && codes.includes(c.nuance))) return null
  return [...candidates].sort((a, b) => codes.indexOf(a.nuance!) - codes.indexOf(b.nuance!) || a.id.localeCompare(b.id))
}
