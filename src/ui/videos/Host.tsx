// L'hôte du lecteur vidéo, monté une fois par l'application (app.tsx), à côté de l'écran courant. N'importe quelle
// page ouvre une vidéo par openVideo(), dans le geste de la personne : le lecteur s'ouvre par-dessus la page
// (dialog modal), qui reste montée telle quelle dessous (une réponse en cours n'est pas perdue), et la fermeture
// rend le focus à ce qui l'avait ouvert.
// Il tient aussi le réglage du son (actif par défaut), pour la visite seulement : rien n'est retenu sur
// l'appareil.
// Historique (history.ts) : le lecteur ajoute une entrée à la même adresse ; le quitter par un lien inscrit la
// vidéo et le passage dans cette entrée, et « retour » la rouvre là où on l'avait laissée, par-dessus la même
// page. Une adresse directe, #/videos/<vidéo>, ouvre la page « Les sujets en vidéo » avec le lecteur sur cette
// vidéo (l'adresse redevient #/videos, l'entrée du lecteur vient par-dessus : « retour » ou × mènent à la page).
// Le lecteur et le catalogue se chargent à la demande (load.ts).

import { useEffect, useRef, useState } from 'preact/hooks'
import type { ElectionPack } from '../../core/types'
import { LECTEUR, isPlayerEntry, savePlayer, savedPlayer } from './history'
import { catalogNow, loadCatalog, loadPlayer, type PlayerModule, type VideoCatalog } from './load'

type Open = (id: string, from: HTMLElement | null) => void
let handler: Open | null = null

/** Adresse de la page « Les sujets en vidéo » */
export const VIDEOS_PAGE = '#/videos'

/**
 * Ouvre le lecteur sur une vidéo, par-dessus la page. À appeler dans le geste de la personne (le son s'y
 * débloque). « from » : l'élément qui reprend le focus à la fermeture (sinon, celui qui porte data-video).
 */
export function openVideo(id: string, from: HTMLElement | null = null) {
  handler?.(id, from)
}

interface Opened {
  id: string
  /** L'entrée d'historique courante est déjà celle du lecteur (retour d'une fiche, adresse directe) */
  resume: boolean
  /** Passage où reprendre */
  segment: number
  /** Compteur d'ouverture : une réouverture est un nouveau lecteur */
  n: number
}

interface Loaded {
  Player: PlayerModule['VideoPlayer']
  catalog: VideoCatalog
}

let opening = 0

export function VideoHost({ pack, start }: { pack: ElectionPack; start?: string }) {
  const { bank } = pack
  const groups = pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))
  // Arrivée sur une entrée du lecteur qu'on avait quittée par un lien (page rechargée entre-temps) : il se rouvre
  const [opened, setOpened] = useState<Opened | null>(() => {
    const saved = typeof history === 'undefined' ? null : savedPlayer()
    return saved ? { id: saved.id, resume: true, segment: saved.segment, n: ++opening } : null
  })
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [soundOn, setSoundOn] = useState(true)
  const from = useRef<HTMLElement | null>(null)
  // L'adresse de la page sous le lecteur : le focus ne lui est rendu que si l'on y est encore
  const where = useRef(typeof location === 'undefined' ? '' : location.hash)
  // « Retour » vers une entrée quittée par un lien, arrivé alors que le lecteur précédent se fermait encore (retour
  // très rapide) : il se rouvre dès qu'il est fermé
  const reopen = useRef<{ id: string; segment: number } | null>(null)
  const now = useRef({ opened, soundOn })
  now.current = { opened, soundOn }

  // Les pages ouvrent le lecteur par openVideo()
  useEffect(() => {
    const fn: Open = (id, el) => {
      if (now.current.opened) return
      const catalog = catalogNow()
      if (catalog && !catalog.videoById(id)) return
      // Dans le geste même : Safari sur iPhone n'autorise le son qu'à cette condition
      if (now.current.soundOn) catalog?.unlockVideo(id)
      from.current = el
      where.current = location.hash
      setOpened({ id, resume: false, segment: 0, n: ++opening })
    }
    handler = fn
    return () => {
      if (handler === fn) handler = null
    }
  }, [])

  // « Retour » vers une entrée du lecteur quittée par un lien : il se rouvre là où on l'avait laissé.
  // On suit un lien depuis le lecteur (l'entrée courante n'est plus la sienne) : il se ferme, sans rendre le focus
  // (la nouvelle page le donne à son titre).
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const saved = savedPlayer(e.state)
      if (now.current.opened) {
        reopen.current = saved
        return
      }
      if (!saved) return
      from.current = null
      where.current = location.hash
      setOpened({ id: saved.id, resume: true, segment: saved.segment, n: ++opening })
    }
    const onHash = () => {
      if (!now.current.opened || isPlayerEntry()) return
      from.current = null
      reopen.current = null
      setOpened(null)
    }
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  // Adresse directe d'une vidéo (#/videos/<vidéo>) : la page dessous, le lecteur par-dessus
  useEffect(() => {
    if (!start) return
    let alive = true
    loadCatalog()
      .then(c => {
        if (!alive || now.current.opened) return
        history.replaceState(null, '', VIDEOS_PAGE)
        if (!c.videoById(start)) return
        history.pushState({ [LECTEUR]: true, vpVideo: start, vpSegment: 0 }, '', VIDEOS_PAGE)
        from.current = null
        where.current = location.hash
        setOpened({ id: start, resume: true, segment: 0, n: ++opening })
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [start])

  // Le lecteur et le catalogue, chargés à la première ouverture (souvent déjà prêts : load.ts les prépare)
  useEffect(() => {
    if (!opened || loaded) return
    let alive = true
    Promise.all([loadPlayer(), loadCatalog()])
      .then(([p, catalog]) => {
        if (alive) setLoaded({ Player: p.VideoPlayer, catalog })
      })
      .catch(() => {
        // Hors ligne sans copie du lecteur (ancienne version en cache) : rien ne s'ouvre
        if (alive) setOpened(null)
      })
    return () => {
      alive = false
    }
  }, [opened, loaded])

  // Une vidéo qui n'existe plus (entrée d'historique ancienne, série retirée) : rien à ouvrir
  const missing = !!opened && !!loaded && !loaded.catalog.videoById(opened.id)
  useEffect(() => {
    if (missing) setOpened(null)
  }, [missing])

  if (!opened || !loaded || missing) return null
  const { Player, catalog } = loaded

  const close = () => {
    const id = opened.id
    const again = reopen.current
    reopen.current = null
    if (again && savedPlayer()?.id === again.id) {
      setOpened({ id: again.id, resume: true, segment: again.segment, n: ++opening })
      return
    }
    setOpened(null)
    // Parti vers une autre page (un lien du lecteur) : c'est elle qui place le focus, sur son titre
    if (location.hash !== where.current) return
    requestAnimationFrame(() => {
      const el = from.current
      from.current = null
      const back =
        (el?.isConnected ? el : null) ??
        document.querySelector<HTMLElement>(`[data-video="${CSS.escape(id)}"]`) ??
        document.querySelector<HTMLElement>('main h1')
      back?.focus()
    })
  }

  return (
    <Player
      key={opened.n}
      series={catalog.VIDEO_SERIES}
      bank={bank}
      groups={groups}
      start={opened.id}
      context="site"
      resume={opened.resume}
      startSegment={opened.resume ? opened.segment : undefined}
      voiceOn={soundOn}
      onVoiceChange={setSoundOn}
      onLeave={savePlayer}
      onClose={close}
    />
  )
}
