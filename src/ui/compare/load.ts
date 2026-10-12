// L'écran de comparaison (et le calcul qui le nourrit, core/compare.ts) est un fichier à part du build, chargé à la
// première visite de #/comparer : le code que télécharge chaque visite n'en contient rien. Il se prépare quand le
// navigateur a un moment, sur les pages qui y mènent (les candidats, le dépouillement), pour s'ouvrir sans attendre.
// La copie hors ligne le contient comme tous les fichiers du site.

import { onDemand } from '../lazy'

export type CompareModule = typeof import('../screens/Compare')

const compare = onDemand<CompareModule>(() => import('../screens/Compare'))

/** L'écran, s'il est déjà chargé */
export const compareNow = compare.now
/** Charge l'écran (une fois) ; un échec (ancienne version en cache, réseau coupé avant la copie hors ligne) permet de réessayer */
export const loadCompare = compare.load
/** Prépare l'écran quand le navigateur a un moment */
export const prepareCompare = compare.prepare
