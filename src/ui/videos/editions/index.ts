// Les éditions des séries vidéo, par identifiant (ElectionPack.videoScope.edition). Une seule pour l'instant :
// la présidentielle 2027, qui reprend les séries de la primaire avec les corrections de la relecture d'équilibre
// politique (research/presidentielle-2027/VIDEOS-A-METTRE-A-JOUR.md).

import type { Edition } from './types'
import { PRESIDENTIELLE_2027 } from './presidentielle-2027'

export const EDITIONS: Readonly<Record<string, Edition>> = {
  [PRESIDENTIELLE_2027.id]: PRESIDENTIELLE_2027,
}

/** Les suffixes de toutes les éditions, pour retrouver la planche d'origine d'un passage corrigé */
export const EDITION_SUFFIXES = Object.values(EDITIONS).map(e => e.suffix)
