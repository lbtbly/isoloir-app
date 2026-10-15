// Les écrans qu'on ouvre rarement (les trois notices : la Méthode, la Confidentialité, les Mentions légales ; et
// « Partager », avec les aides de l'affiche, core/shareImage.ts) sont chacun un fichier à part du build, chargé à la
// première visite de son adresse, comme la comparaison (ui/compare/load.ts) et « Mon profil politique »
// (ui/profile/load.ts) : le code que télécharge chaque visite n'en contient rien. Le pied de page mène aux notices de
// partout, le dépouillement à « Partager » : ils se préparent quand le navigateur a un moment, une fois la page
// affichée (app.tsx), pour s'ouvrir sans attendre ; une adresse qui mène directement à l'un d'eux le charge avant le
// premier affichage, en même temps que les données de l'élection (main.tsx). Leurs styles restent dans la feuille de
// style de la page (app.tsx). La copie hors ligne les contient comme tous les fichiers du site. Hors ligne sans elle,
// rien ne se prépare (ui/lazy.ts) : un échec d'import() vaut pour toute la visite, « Réessayer » recharge la page.
//
// « Les candidats » et « Les sujets », entrées du menu de l'en-tête, restent dans le code de la page : chargés à part,
// ils feraient sortir du fichier de la page des pièces qu'ils partagent avec elle (l'étiquette IA, les icônes, le
// logo), et le style de l'étiquette IA passerait avant la feuille de style de la page (mesuré le 14 octobre 2026).

import type { Route } from '../../core/routes'
import { loadCompare } from '../compare/load'
import { onDemand } from '../lazy'
import { loadProfile } from '../profile/load'

/** La Méthode (la notice) */
export const methodScreen = onDemand<typeof import('./Method')>(() => import('./Method'))
/** La Confidentialité */
export const privacyScreen = onDemand<typeof import('./Privacy')>(() => import('./Privacy'))
/** Les Mentions légales */
export const legalScreen = onDemand<typeof import('./Legal')>(() => import('./Legal'))
/** « Partager » */
export const shareScreen = onDemand<typeof import('./Share')>(() => import('./Share'))
/** « Continuer sur un autre appareil » (codes de reprise, QR code, caméra) : jamais préparé d'avance, rarement ouvert */
export const transferScreen = onDemand<typeof import('./Transfer')>(() => import('./Transfer'))

/** Prépare ces écrans quand le navigateur a un moment */
export function prepareScreens() {
  for (const screen of [methodScreen, shareScreen, privacyScreen, legalScreen]) screen.prepare()
}

/** Le chargement de l'écran d'une adresse, s'il est un fichier à part (ceux-ci, la comparaison, le profil) ; null sinon */
export function screenLoader(route: Route): (() => Promise<unknown>) | null {
  switch (route.name) {
    case 'method':
      return methodScreen.load
    case 'privacy':
      return privacyScreen.load
    case 'legal':
      return legalScreen.load
    case 'share':
      return shareScreen.load
    case 'transfer':
      return transferScreen.load
    case 'compare':
      return loadCompare
    case 'profile':
      return loadProfile
    default:
      return null
  }
}
