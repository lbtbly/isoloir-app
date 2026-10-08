// Chargement à la demande des vidéos : le catalogue (les séries et leurs durées, catalog.ts) puis le lecteur
// (Player.tsx et le dessin). Ni l'un ni l'autre n'alourdit le code que tout visiteur exécute à l'ouverture ; la
// copie hors ligne (service worker) les garde quand même, comme tous les fichiers du build : hors ligne, les
// vidéos s'ouvrent, en sous-titres seuls.
// Ce module, lui, est léger : la feuille de pointage l'importe sans rien recevoir des candidats.
// Il tient aussi l'élection affichée, fixée par l'application avant de la rendre (setVideoScope, app.tsx) : le
// catalogue en montre les séries, sous ses thèmes et ses questions. Il reçoit l'élection, il n'en importe aucune.

import { useEffect, useState } from 'preact/hooks'
import type { ElectionPack } from '../../core/types'

export type VideoCatalog = typeof import('./catalog')
export type PlayerModule = typeof import('./Player')

/** Ce que le catalogue lit de l'élection affichée : sa banque, ses familles de thèmes et son périmètre vidéo */
export type VideoElection = Pick<ElectionPack, 'bank' | 'topicGroups' | 'videoScope'>

let election: VideoElection | null = null

/**
 * Fixe l'élection affichée, avant de la rendre (app.tsx) : les pages et le lecteur montrent ses séries, sous ses
 * thèmes (scope.ts). Changer d'élection change les séries du catalogue, déjà chargé ou non.
 * Seuls la banque, les familles et le périmètre vidéo sont gardés, jamais le pack entier : ce module est importé
 * par la feuille de pointage, qui ne doit pouvoir atteindre ni les candidats ni leurs positions. Même élection,
 * même objet : le catalogue ne recalcule pas ses séries à chaque rendu.
 */
export function setVideoScope(pack: VideoElection) {
  const { bank, topicGroups, videoScope } = pack
  if (election && election.bank === bank && election.topicGroups === topicGroups && election.videoScope === videoScope) return
  election = { bank, topicGroups, videoScope }
}

/** L'élection affichée, si elle est fixée */
export const videoElection = (): VideoElection | null => election

/**
 * Une élection montre-t-elle des vidéos ? Sans périmètre (primaire), toutes les séries ; avec un périmètre vide
 * (présidentielle, en attendant la mise à jour des séries), aucune : ni page, ni entrée de menu, ni lien.
 */
export const hasVideos = (pack: Pick<ElectionPack, 'videoScope'>): boolean =>
  !pack.videoScope || Object.keys(pack.videoScope.topics).length > 0

/** L'élection affichée montre-t-elle des vidéos ? (oui tant qu'elle n'est pas fixée) */
export const videosShown = (): boolean => !election || hasVideos(election)

let catalog: VideoCatalog | null = null
let catalogLoad: Promise<VideoCatalog> | null = null
let player: PlayerModule | null = null
let playerLoad: Promise<PlayerModule> | null = null

/** Le catalogue, s'il est déjà chargé */
export const catalogNow = () => catalog
/** Le lecteur, s'il est déjà chargé */
export const playerNow = () => player

/** Charge le catalogue (une fois) ; un échec (fichier introuvable, ancienne version en cache) permet de réessayer */
export function loadCatalog(): Promise<VideoCatalog> {
  catalogLoad ??= import('./catalog').then(
    m => (catalog = m),
    e => {
      catalogLoad = null
      throw e
    },
  )
  return catalogLoad
}

/** Charge le lecteur (une fois) ; même repli que le catalogue */
export function loadPlayer(): Promise<PlayerModule> {
  playerLoad ??= import('./Player').then(
    m => (player = m),
    e => {
      playerLoad = null
      throw e
    },
  )
  return playerLoad
}

/** Le lecteur se prépare quand le navigateur a un moment, pour qu'une vidéo s'ouvre sans attendre */
function preparePlayer() {
  if (player || playerLoad) return
  const later = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  const go = () => void loadPlayer().catch(() => undefined)
  if (later) later(go, { timeout: 3000 })
  else setTimeout(go, 1200)
}

/**
 * Le catalogue des vidéos pour une page qui en propose : rien au premier affichage, puis le catalogue une fois
 * chargé (les liens vers les vidéos apparaissent alors). Il prépare aussi le lecteur, en arrière-plan.
 */
export function useVideoCatalog(): VideoCatalog | null {
  const [c, setC] = useState<VideoCatalog | null>(catalog)
  useEffect(() => {
    if (c) {
      preparePlayer()
      return
    }
    let alive = true
    loadCatalog()
      .then(m => {
        if (!alive) return
        setC(m)
        preparePlayer()
      })
      .catch(() => {
        /* pas de catalogue : la page reste sans lien vers les vidéos */
      })
    return () => {
      alive = false
    }
  }, [c])
  return c
}
