// La page « Mon profil politique » (et le calcul qui la nourrit, core/echiquier.ts, avec ses mots, core/echiquierCopy.ts)
// est un fichier à part du build, chargé à la première visite de #/profil : le code que télécharge chaque visite n'en
// contient rien. Il se prépare quand le navigateur a un moment, sur le dépouillement complet et sur l'accueil une fois la
// page prête, pour s'ouvrir sans attendre ; avant, ses entrées (l'aperçu de l'accueil, la ligne de la tendance) mènent à
// sa page d'attente, chargée au clic. Sa rubrique de la Méthode (ui/profile/MethodSection.tsx, ses mots dans
// core/echiquierMethodCopy.ts) est un autre fichier à part, chargé par la Méthode à son affichage : elle n'emporte ni la
// page ni son calcul. La copie hors ligne contient l'un et l'autre comme tous les fichiers du site.

import { onDemand } from '../lazy'

export type ProfileModule = typeof import('../screens/Profile')
export type ProfileMethodModule = typeof import('./MethodSection')

const profile = onDemand<ProfileModule>(() => import('../screens/Profile'))
const method = onDemand<ProfileMethodModule>(() => import('./MethodSection'))

/** La page, si elle est déjà chargée */
export const profileNow = profile.now
/** Charge la page (une fois) ; un échec (ancienne version en cache, réseau coupé avant la copie hors ligne) permet de réessayer */
export const loadProfile = profile.load
/** Prépare la page quand le navigateur a un moment */
export const prepareProfile = profile.prepare

/** La rubrique de la Méthode, si elle est déjà chargée */
export const profileMethodNow = method.now
/** Charge la rubrique (une fois) ; un échec, comme pour la page, permet de réessayer */
export const loadProfileMethod = method.load
