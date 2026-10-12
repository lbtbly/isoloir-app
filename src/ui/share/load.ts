// L'image « Accords et désaccords » (core/agreeImage.ts) est un fichier à part du build, chargé quand on la choisit
// dans « Partager » : le code que télécharge chaque visite n'en contient rien. Elle reprend les aides de l'affiche
// (core/shareImage.ts), qui restent dans le code de la page. La copie hors ligne la contient comme tous les fichiers
// du site.

import { onDemand } from '../lazy'

export type AgreeModule = typeof import('../../core/agreeImage')

const agree = onDemand<AgreeModule>(() => import('../../core/agreeImage'))

/** Le module, s'il est déjà chargé */
export const agreeNow = agree.now
/** Charge le module (une fois) ; un échec (ancienne version en cache après un déploiement, réseau coupé) permet de réessayer */
export const loadAgree = agree.load
