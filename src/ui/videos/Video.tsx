// Une vidéo du fil : barres de progression par passage (comme des stories), repère de série (qui ouvre le
// sommaire) et titre, la scène dessinée par la piste, les sous-titres, puis les commandes (pause, son, sources,
// fiche). La commande « Son » est un bouton bascule (enfoncé : son actif), qui coupe ou remet la voix de toutes
// les vidéos ; sans voix enregistrée pour la vidéo, il n'y a rien à couper. Seule la vidéo visible est active :
// les autres sont inertes (ni focus, ni lecteur d'écran) et montrent leur affiche.

import { useEffect, useMemo } from 'preact/hooks'
import { APP_NAME, APP_URL } from '../../core/app'
import { AiLabel } from '../components/AiLabel'
import { unlockAudio, voiceOf, voicedCount } from './audio'
import { Captions } from './Captions'
import { Glyph } from './Glyph'
import { useNarration } from './narration'
import type { Piste, VideoContext, VideoMeta, VideoScript } from './types'

export interface VideoApi {
  /** Pause, lecture, ou « Revoir » à la fin */
  toggle: () => void
  /** Passage en cours (pour le retrouver au retour d'une fiche) */
  index: number
}

interface Props {
  script: VideoScript
  piste: Piste
  meta: VideoMeta
  /** Où la vidéo est regardée : sur le site, aucun appel à donner son avis en fin de vidéo */
  context: VideoContext
  /** La vidéo visible du fil */
  active: boolean
  /** Assez proche de la vidéo visible pour qu'on dessine sa scène (sinon, papier blanc) */
  near: boolean
  /** La vidéo doit avancer : visible, lecture voulue, page affichée, aucun panneau ouvert */
  run: boolean
  /** Ce que veut la personne : lecture ou pause */
  playing: boolean
  /** Mouvement réduit : images fixes */
  still: boolean
  /** Son voulu par la personne */
  voiceOn: boolean
  /** Ce que l'entrée suivante du fil propose, pour l'invite de fin */
  next: { kicker: string; label: string } | null
  /** Choisie dans le sommaire ou les catégories (compteur, chaque choix compte) : une vidéo finie repart de son
   *  premier passage ; 0 : pas de choix */
  rewind: number
  /** Passage où commencer (retour d'une fiche), sinon le premier */
  from?: number
  /** Position dans le fil, pour les lecteurs d'écran */
  position: string
  onPlay: (on: boolean) => void
  /** Coupe ou remet le son (pour toutes les vidéos) */
  onSound: () => void
  onSources: () => void
  onSummary: () => void
  onNext: () => void
  /** On quitte le lecteur par « Voir la fiche » : le passage en cours, pour y revenir */
  onLeave?: (segment: number) => void
  /** Le lecteur garde la main sur la vidéo visible (raccourcis) ; « false » la lui reprend */
  bind: (api: VideoApi, on: boolean) => void
}

export function Video(p: Props) {
  const { script, piste, meta, context, active, near, still } = p
  // Le navigateur refuse le son sans geste : la vidéo se met en pause, un toucher sur Lecture la relance
  const n = useNarration(script, p.run, p.voiceOn, () => p.onPlay(false), p.from)
  // Une vidéo quittée garde sa place : elle reprend là où elle en était
  const index = n.index
  const segment = script.segments[index]!
  const total = script.segments.length
  // Passages qui ont leur voix enregistrée ; sans aucun, il n'y a pas de son à couper
  const voiced = useMemo(() => voicedCount(script), [script])
  // Le son est actif : voulu, et la vidéo a une voix
  const soundOn = p.voiceOn && voiced > 0

  /** Dans le geste même : autorise le son du passage à venir (Safari sur iPhone) */
  const unlock = () => {
    if (p.voiceOn) unlockAudio(voiceOf(script.id, n.ended ? script.segments[0]! : segment)?.url)
  }
  const toggle = () => {
    unlock()
    if (n.ended) {
      n.restart()
      p.onPlay(true)
    } else p.onPlay(!p.playing)
  }
  useEffect(() => {
    if (!active) return
    const api = { toggle, index }
    p.bind(api, true)
    return () => p.bind(api, false)
  })
  // Choisie dans un panneau alors qu'elle était finie : elle repart du début (une vidéo en cours garde sa place)
  useEffect(() => {
    if (p.rewind && n.ended) n.restart()
  }, [p.rewind])

  // La scène ne bouge que si la lecture avance vraiment : avec la voix, à partir de son premier son
  const moving = active && p.run && n.started && !n.ended
  const poster = !active
  const pistePlaying = moving && !still
  // Mise en pause par la personne : un repère de lecture au centre ; l'image reste nette pour être lue
  const held = active && !p.playing && !n.ended
  const props = {
    script,
    segment,
    index,
    playing: pistePlaying,
    still: still || poster,
    progress: n.progress,
    word: n.word,
    meta,
    context,
  }
  const scene = near ? <piste.Segment key={`${script.id}:${index}`} {...props} /> : null
  const Frame = piste.Frame
  const label = n.ended ? 'Revoir' : p.playing ? 'Pause' : 'Lecture'
  const id = `vp-${script.id}`
  // Note sous les sous-titres : pourquoi on n'entend rien, quand la voix est voulue
  const note = !p.voiceOn
    ? null
    : n.voiceFailed || n.voiceTrouble
      ? 'La voix ne se charge pas\u00a0: '
      : voiced === 0
        ? 'Voix à venir\u00a0: '
        : null

  return (
    <article class={`vp-video ${piste.className}`} id={id} aria-labelledby={`${id}-t`} tabIndex={-1} inert={!active}>
      <div class="vp-bars" aria-hidden="true">
        {script.segments.map((s, i) => (
          <span key={s.id} class="vp-bar">
            <span
              class="vp-bar-fill"
              style={{ '--p': String(i < index || n.ended ? 1 : i === index ? n.progress : 0) }}
            />
          </span>
        ))}
      </div>
      <header class="vp-head">
        {/* Le repère de la série ouvre son sommaire, en un toucher */}
        <button type="button" class="vp-mark" aria-haspopup="dialog" aria-keyshortcuts="S" onClick={p.onSummary}>
          <Glyph name="playlist" />
          <span class="vp-mark-text">
            {meta.marker}
            <span class="sr-only">, sommaire de la série</span>
          </span>
        </button>
        <h2 class="vp-title" id={`${id}-t`}>
          {script.title}
        </h2>
        {/* Visible pendant toute la lecture, sous le titre : ni sur le dessin, ni sur les sous-titres */}
        {/* « voix de synthèse » dès que la voix est enregistrée pour cette vidéo */}
        <AiLabel kind="video" more="seule" voice={voiced > 0} class="vp-ai" />
        <p class="sr-only">{`${p.position}, passage ${index + 1} sur ${total}`}</p>
      </header>
      <div class="vp-stage-wrap">
        <div
          class={`vp-stage${pistePlaying ? '' : ' is-paused'}${still || poster ? ' is-still' : ''}${held ? ' is-held' : ''}`}
          aria-hidden="true"
          onClick={() => active && toggle()}
        >
          {Frame && near ? (
            <Frame script={script} index={index} playing={pistePlaying} still={still || poster} meta={meta} context={context}>
              {scene}
            </Frame>
          ) : (
            scene
          )}
          {held ? (
            <span class="vp-paused">
              <Glyph name="play" />
            </span>
          ) : null}
        </div>
      </div>
      {/* Fin de vidéo : l'invite prend la place des sous-titres (dans le flux, elle ne couvre ni le dessin, ni le
          titre, ni le repère de série) ; le dernier passage vient d'être dit, et il est écrit sur le dessin */}
      <div class={`vp-captions${active && n.ended ? ' is-end' : ''}`}>
        {active && n.ended ? (
          <div class="vp-end">
            {/* Hors du site seulement (lien partagé, intégration) : l'invitation à donner son avis. Sur le site,
                la personne y est déjà : rien. */}
            {context === 'share' ? (
              <a class="vp-end-cta" href={`${APP_URL}/`} target="_blank" rel="noopener noreferrer">
                {`Donnez votre avis dans ${APP_NAME}`}
                <Glyph name="next" />
                <span class="sr-only"> (nouvel onglet)</span>
              </a>
            ) : null}
            {p.next ? (
              <button type="button" class="vp-end-next" onClick={p.onNext}>
                <span class="vp-end-kicker">{p.next.kicker}</span>
                <span class="vp-end-label">{p.next.label}</span>
                <Glyph name="down" />
              </button>
            ) : null}
            <button type="button" class="vp-end-again" onClick={toggle}>
              <Glyph name="replay" />
              Revoir
            </button>
          </div>
        ) : (
          <>
            {note && active ? (
              <p class="vp-voice-note">
                {note}
                <span class="nowrap">sous-titres seuls.</span>
              </p>
            ) : null}
            <div class="vp-cap-stack">
              {/* Gabarit invisible : chaque passage de la vidéo, empilé dans la même cellule ; le plus long fixe la
                  hauteur des sous-titres, et la scène ne change plus de taille d'un passage à l'autre */}
              {script.segments.map(s => (
                <div key={s.id} class="vp-cap-sizer" aria-hidden="true">
                  <Captions text={s.say} word={-1} settled />
                </div>
              ))}
              <Captions text={segment.say} word={n.word} settled={n.word < 0 && !(active && p.playing)} />
            </div>
          </>
        )}
      </div>
      <div class="vp-controls">
        <button type="button" class="vp-ctl" aria-keyshortcuts="Space" onClick={toggle}>
          <Glyph name={n.ended ? 'replay' : p.playing ? 'pause' : 'play'} />
          <span class="vp-ctl-label">{label}</span>
        </button>
        {/* Son actif ou coupé : un bouton bascule au libellé fixe, l'état dit par « enfoncé » et par le pictogramme
            (haut-parleur, ou haut-parleur barré). Sans voix enregistrée pour cette vidéo, rien à couper. M
            (Player.tsx) fait de même au clavier. Le réglage n'est retenu que pour la visite. */}
        <button
          type="button"
          class="vp-ctl"
          aria-pressed={soundOn}
          aria-keyshortcuts="M"
          disabled={voiced === 0}
          onClick={p.onSound}
        >
          <Glyph name={soundOn ? 'voice' : 'mute'} />
          <span class="vp-ctl-label">Son</span>
        </button>
        <button type="button" class="vp-ctl" aria-haspopup="dialog" onClick={p.onSources}>
          <Glyph name="sources" />
          <span class="vp-ctl-label">Sources</span>
        </button>
        <a class="vp-ctl" href={`#/sujets/${script.questionIds[0] ?? ''}`} onClick={() => p.onLeave?.(index)}>
          <Glyph name="fiche" />
          <span class="vp-ctl-label">Voir la fiche</span>
        </a>
      </div>
    </article>
  )
}
