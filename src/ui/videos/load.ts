// Chargement à la demande des vidéos : le catalogue (les séries et leurs durées, catalog.ts) puis le lecteur
// (Player.tsx et le dessin). Ni l'un ni l'autre n'alourdit le code que tout visiteur exécute à l'ouverture ; la
// copie hors ligne (service worker) les garde quand même, comme tous les fichiers du build : hors ligne, les
// vidéos s'ouvrent, en sous-titres seuls.
// Ce module, lui, est léger : la feuille de pointage l'importe sans rien recevoir des candidats.

import { useEffect, useState } from 'preact/hooks'

export type VideoCatalog = typeof import('./catalog')
export type PlayerModule = typeof import('./Player')

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
