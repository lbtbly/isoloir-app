// Ouvert dans l'application installée (l'icône de l'écran d'accueil, du Dock ou du menu Démarrer), et ce qu'elle voit des
// réponses : ce que l'accueil, le pied de page et l'import doivent savoir à chaque visite. Dans le code de chaque visite,
// d'où ce petit fichier à part : la page « Installer l'application » lit le reste de l'appareil (core/install.ts). Tout
// est lu sur place, dans navigator et matchMedia, sans rien envoyer ni rien garder.

/** Ce que l'appareil dit de lui-même */
export interface Probe {
  userAgent: string
  /** navigator.maxTouchPoints : un iPad en mode ordinateur s'annonce comme un Mac, mais il est tactile */
  maxTouchPoints: number
  /** Ouvert depuis l'icône : navigator.standalone (iPhone, iPad) ou display-mode: standalone */
  installed: boolean
  /** navigator.brave : Brave s'annonce comme Chrome */
  brave?: boolean
}

/** Les appareils d'Apple dont l'application installée a son propre espace, vide au départ */
export type AppleApart = 'iphone' | 'ipad' | 'mac'

/**
 * L'appareil d'Apple dont l'application installée ne voit pas les réponses du navigateur : iPhone et iPad (quel que soit
 * le navigateur qui l'a ajoutée, tous sur le moteur de Safari), Mac avec Safari (« Ajouter au Dock ») ; null ailleurs
 * (Android, Chrome et Edge : l'application lit les réponses du navigateur)
 */
export function appleApart(p: Probe): AppleApart | null {
  const ua = p.userAgent
  if (/\biPad\b/.test(ua) || (/\bMacintosh\b/.test(ua) && p.maxTouchPoints > 1)) return 'ipad'
  if (/\biPhone\b|\biPod\b/.test(ua)) return 'iphone'
  if (/\bMacintosh\b/.test(ua) && /\bAppleWebKit\//.test(ua) && !/\b(?:Chrome|Chromium|Firefox|Edg|OPR)\//.test(ua)) return 'mac'
  return null
}

/** Ce que dit cet appareil ; hors d'un navigateur (tests, Node), un appareil non reconnu */
export function probe(): Probe {
  if (typeof navigator === 'undefined') return { userAgent: '', maxTouchPoints: 0, installed: false }
  const nav = navigator as Navigator & { standalone?: boolean; brave?: unknown }
  let standalone = false
  try {
    standalone = typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches
  } catch {
    // matchMedia indisponible : reste navigator.standalone
  }
  return { userAgent: nav.userAgent ?? '', maxTouchPoints: nav.maxTouchPoints ?? 0, installed: nav.standalone === true || standalone, brave: !!nav.brave }
}

let seen: Probe | null = null

/** L'appareil de cette visite (lu une fois : ni l'appareil ni le mode d'ouverture ne changent en cours de visite) */
export const here = (): Probe => (seen ??= probe())

/** Ouvert dans l'application installée */
export const isInstalled = (): boolean => here().installed

/** Ouvert dans l'application installée qui a son propre espace (elle démarre vide) : l'appareil ; null sinon */
export const appApart = (): AppleApart | null => (here().installed ? appleApart(here()) : null)
