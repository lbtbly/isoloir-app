// La page « Mon profil politique » (et le calcul qui la nourrit, core/echiquier.ts, avec ses mots, core/echiquierCopy.ts)
// est un fichier à part du build, chargé à la première visite de #/profil ou de la rubrique de la Méthode : le code que
// télécharge chaque visite n'en contient rien. Il se prépare quand le navigateur a un moment, sur le dépouillement
// complet, pour s'ouvrir sans attendre. La copie hors ligne le contient comme tous les fichiers du site.

import { onDemand } from '../lazy'

export type ProfileModule = typeof import('../screens/Profile')

const profile = onDemand<ProfileModule>(() => import('../screens/Profile'))

/** La page, si elle est déjà chargée */
export const profileNow = profile.now
/** Charge la page (une fois) ; un échec (ancienne version en cache, réseau coupé avant la copie hors ligne) permet de réessayer */
export const loadProfile = profile.load
/** Prépare la page quand le navigateur a un moment */
export const prepareProfile = profile.prepare
