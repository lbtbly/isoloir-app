// Lecteur du film, héros de l'accueil : lecture et pause, chapitres, « Revoir » à la fin. Sous mouvement
// réduit, pas de lecture automatique : chaque chapitre montre son image fixe (l'état final de la scène),
// et « Lire le film animé » reste à la main de la personne.
// La chronologie tient dans un minuteur par scène ; les gestes, eux, sont des animations CSS que la
// pause fige (animation-play-state). Le film se suspend quand la page est masquée ou hors de l'écran.

import { useEffect, useRef, useState } from 'preact/hooks'
import '../../styles/film.css'
import { SceneFrame, type Cta } from './Scenes'
import { SCENES, fr } from './script'

const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pictogrammes du lecteur, au trait comme les autres */
const GLYPHS = {
  play: 'M7.5 5.2v13.6L18.5 12z',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  replay: 'M4.6 12a7.4 7.4 0 1 0 2.2-5.2M4.6 4.3v3.4H8',
}

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg class="icon film-glyph" viewBox="0 0 24 24" aria-hidden="true">
      <path d={GLYPHS[name]} />
    </svg>
  )
}

export function FilmPlayer({ cta }: { cta: Cta }) {
  const [still, setStill] = useState(reducedMotion)
  const [scene, setScene] = useState(0)
  /** Incrémenté à chaque reprise d'une scène depuis son début : la scène est remontée, ses gestes repartent */
  const [run, setRun] = useState(0)
  /** Ce que veut la personne : lecture ou pause */
  const [playing, setPlaying] = useState(() => !reducedMotion())
  const [ended, setEnded] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const [said, setSaid] = useState('')
  /** Les changements de scène ne s'annoncent qu'une fois que la personne a lancé la lecture ou choisi un chapitre */
  const engaged = useRef(false)
  const stage = useRef<HTMLDivElement>(null)
  const clock = useRef({ key: '', left: 0 })

  const running = !still && playing && !ended && !pageHidden && !offscreen
  const key = `${scene}:${run}`

  const announce = (i: number) => {
    const s = SCENES[i]!
    const text = fr(`Scène ${i + 1} sur ${SCENES.length} : ${s.title} ${s.text}`)
    // Même texte deux fois de suite : une espace en plus pour qu'il soit relu
    setSaid(prev => (prev === text ? `${text}\u00a0` : text))
  }

  // Chronologie : le reste de la scène est conservé pendant une pause
  useEffect(() => {
    if (clock.current.key !== key) clock.current = { key, left: SCENES[scene]!.ms }
    if (!running) return
    const t0 = performance.now()
    const id = window.setTimeout(() => {
      clock.current.left = 0
      if (scene < SCENES.length - 1) {
        setScene(scene + 1)
        if (engaged.current) announce(scene + 1)
      } else {
        setEnded(true)
      }
    }, clock.current.left)
    return () => {
      window.clearTimeout(id)
      if (clock.current.key === key) clock.current.left = Math.max(0, clock.current.left - (performance.now() - t0))
    }
    // announce ne lit que des constantes et des setters
  }, [key, running])

  // Page masquée : pause automatique, reprise au retour
  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Film sorti de l'écran (page défilée) : même chose. Avec un texte très agrandi, le film devient plus
  // haut que l'écran : il compte comme visible dès qu'il en occupe la moitié, même si c'est moins d'un quart de lui
  useEffect(() => {
    const el = stage.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        const screen = e.rootBounds?.height ?? window.innerHeight
        setOffscreen(e.intersectionRatio < 0.25 && e.intersectionRect.height < screen / 2)
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [still])

  // Mouvement réduit demandé en cours de route : on passe aux images fixes
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      if (!mq.matches) return
      setStill(true)
      setPlaying(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  /** Images fixes : on passe d'un chapitre à l'autre sans rien animer */
  const showStill = (i: number) => {
    engaged.current = true
    setScene(i)
    setEnded(false)
    announce(i)
  }

  /** Reprend le film au début d'une scène et le lit */
  const playFrom = (i: number) => {
    engaged.current = true
    setStill(false)
    setScene(i)
    setRun(r => r + 1)
    setEnded(false)
    setPlaying(true)
    announce(i)
  }

  const toggle = () => {
    if (ended) return playFrom(0)
    if (playing) return setPlaying(false)
    engaged.current = true
    setPlaying(true)
    announce(scene)
  }

  const label = still ? 'Lire le film' : ended ? 'Revoir' : playing ? 'Pause' : 'Lecture'
  return (
    <>
      <div class={`film${running ? '' : ' is-paused'}${ended ? ' is-ended' : ''}${still ? ' is-still' : ''}`}>
        <div class="film-stage" id="film-stage" ref={stage}>
          {SCENES.map((_, i) => (
            <SceneFrame
              key={i === scene && !still ? `play-${i}-${run}` : `still-${i}`}
              index={i}
              mode={i === scene && !still ? 'play' : 'still'}
              off={i !== scene}
              cta={cta}
            />
          ))}
        </div>
        <div class="film-controls">
          <button type="button" class="film-play" aria-controls="film-stage" onClick={still ? () => playFrom(scene) : toggle}>
            <Glyph name={still ? 'play' : ended ? 'replay' : playing ? 'pause' : 'play'} />
            <span class="film-play-label">{label}</span>
          </button>
          <ol class="film-chapters" aria-label="Chapitres">
            {SCENES.map((s, i) => {
              const state = ended || i < scene ? ' is-done' : i === scene ? ' is-on' : ''
              return (
                <li key={s.chapter}>
                  <button
                    type="button"
                    class={`film-chapter${state}`}
                    aria-current={i === scene && !ended ? 'step' : undefined}
                    aria-controls="film-stage"
                    onClick={() => (still ? showStill(i) : playFrom(i))}
                  >
                    <span class="film-chapter-n">{i + 1}</span>
                    <span class="film-chapter-t">{s.chapter}</span>
                    {i === scene && !ended && !still ? (
                      <span key={key} class="film-chapter-run" style={{ '--dur': `${s.ms}ms` }} aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
        <p class="film-fiction">{fr('Exemple fictif : ces candidats n’existent pas, et les pourcentages sont illustratifs.')}</p>
      </div>
      <p class="sr-only" aria-live="polite">
        {said}
      </p>
    </>
  )
}
