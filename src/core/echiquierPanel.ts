// Les candidats qui comptent sur l'axe de « Mon profil politique » (panelOf) : pour le calcul de la page
// (core/echiquier.ts, qui le reprend) et pour sa rubrique de la Méthode (ui/profile/MethodSection.tsx). À part du
// calcul, pour que la rubrique, chargée à la demande par la Méthode, s'en serve sans emporter la page (comme blocOf,
// core/spectrum.ts) ; mais pas avec la grille, dans le code de toutes les visites, qui n'en a pas l'usage.

import { excludedIds } from './score'
import { axisOf, blocOf } from './spectrum'
import type { CandidateId, ElectionPack } from './types'

/**
 * Les candidats qui comptent sur l'axe, bloc par bloc dans l'ordre de l'axe : ceux que le score calcule (ni masqués,
 * déjà retirés du pack, ni non classés), dont le bloc est sur l'axe ; dans l'ordre alphabétique de leur identifiant au
 * sein d'un bloc, comme sur la page des candidats. Le même pour tout le monde : les candidats hors classement d'une
 * personne y restent. Sans axe : vide.
 */
export function panelOf(pack: Pick<ElectionPack, 'election' | 'candidates'>): CandidateId[][] {
  const axis = axisOf(pack.election)
  if (!axis) return []
  const out = new Set(excludedIds(pack))
  const scored = pack.candidates.filter(c => !out.has(c.id))
  return axis.map(a =>
    scored
      .filter(c => blocOf(pack.election, c) === a.bloc)
      .map(c => c.id)
      .sort((x, y) => x.localeCompare(y)),
  )
}
