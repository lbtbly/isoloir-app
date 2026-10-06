// La chronologie d'une vidéo : un passage après l'autre, au rythme de sa voix enregistrée ou, sans voix, d'une
// durée estimée (2,6 mots par seconde, ou la durée inscrite du fichier qui ne se lit pas).
//
// Avec la voix (audio.ts) : le fichier du passage se lit dans l'élément audio partagé. Une voix qui manque pour
// un passage : ce passage se lit en minuterie. Couper ou remettre le son en cours de route reprend au même
// endroit du passage. Le passage s'anime quand le son part (« playing »), le suivant vient quand il finit
// (« ended »). La progression est la position
// de lecture rapportée à la durée réelle du fichier ; le mot souligné en est déduit au prorata du texte.
// Pause : le fichier s'arrête où il en est, la reprise repart de là.
// Repli silencieux, sans message d'erreur : un fichier absent ou illisible, un son qui ne démarre pas (4 s) ou
// se bloque en route (6 s) fait passer le passage en minuterie ; deux échecs de suite, et la vidéo continue en
// sous-titres seuls. Si le navigateur refuse le son faute de geste, la vidéo se met en pause : toucher
// Lecture (un geste) la relance avec sa voix.

import { useEffect, useRef, useState } from 'preact/hooks'
import {
  GAP_MS,
  audioElement,
  audioRefused,
  claimAudio,
  loadAudio,
  markUnreadable,
  ownsAudio,
  preloadAudio,
  segmentMs,
  voiceOf,
  type SegmentVoice,
} from './audio'
import { holdMs, wordAt, wordsOf, type Word } from './model'
import type { VideoScript } from './types'

export interface NarrationState {
  /** Passage en cours */
  index: number
  /** Avancement dans le passage, de 0 à 1 */
  progress: number
  /** Mot en train d'être dit (index dans wordsOf(say)), -1 avant le premier */
  word: number
  /** Le passage a commencé : le son part, ou la minuterie tourne */
  started: boolean
  /** Dernier passage fini */
  ended: boolean
  /** Ce passage est dit par sa voix enregistrée (sinon : sous-titres seuls, au rythme estimé) */
  voiced: boolean
  /** La voix a échoué deux fois de suite : la suite de la vidéo se lit en sous-titres seuls */
  voiceFailed: boolean
  /** La voix de ce passage ne s'est pas chargée (réseau coupé, fichier introuvable) : il continue en sous-titres seuls */
  voiceTrouble: boolean
}

/** Pas de rafraîchissement de la progression (10 images par seconde : la barre glisse en CSS) */
const TICK = 100
/** Délai au-delà duquel un son qui n'a pas démarré est tenu pour muet */
const NO_START = 4000
/** Son lent à démarrer : l'image n'attend pas plus que cela */
const SLOW_START = 700
/** Son arrêté en route (réseau) depuis ce délai : le passage continue sans lui */
const STALL = 6000

/** Un passage de départ valide : entier, entre le premier et le dernier */
const startIndex = (script: VideoScript, from: number) =>
  Math.max(0, Math.min(script.segments.length - 1, Math.floor(Number.isFinite(from) ? from : 0)))

const initial: NarrationState = {
  index: 0,
  progress: 0,
  word: -1,
  started: false,
  ended: false,
  voiced: false,
  voiceFailed: false,
  voiceTrouble: false,
}

export class Narrator {
  private s: NarrationState = initial
  private running = false
  private voiceOn = false
  private timers: number[] = []
  private raf = 0
  private words: Word[]
  /** Course en cours : son mode, son numéro (les rappels d'une course finie sont ignorés) */
  private mode: 'audio' | 'timer' | null = null
  private run = 0
  private listen: AbortController | null = null
  /** Minuterie : départ, progression de départ, durée restante */
  private t0 = 0
  private p0 = 0
  private span = 1
  /** Son : il est parti (« playing » reçu) ; dernière position lue et quand elle a bougé */
  private sounding = false
  private lastTime = -1
  private lastMove = 0
  /** Ce passage passe en minuterie (sa voix vient d'échouer) */
  private timerOnce = false
  /** Pose de fin de passage en cours : le dernier mot mis en valeur reste lisible avant le passage suivant */
  private holding = false
  private failures = 0
  private lastEmit = 0

  constructor(
    private script: VideoScript,
    private onChange: (s: NarrationState) => void,
    /** Le navigateur refuse le son sans geste : la vidéo s'est mise en pause */
    private onBlocked: () => void = () => undefined,
    /** Passage où commencer (retour d'une fiche) */
    from = 0,
  ) {
    const i = startIndex(script, from)
    this.s = { ...initial, index: i }
    this.words = wordsOf(script.segments[i]!.say)
  }

  private set(patch: Partial<NarrationState>, force = true) {
    this.s = { ...this.s, ...patch }
    const now = performance.now()
    if (force || now - this.lastEmit >= TICK) {
      this.lastEmit = now
      this.onChange(this.s)
    }
  }

  private get segment() {
    return this.script.segments[this.s.index]!
  }

  /** Son voulu ou coupé. Le changer en cours de route reprend au même endroit du passage. */
  setVoice(on: boolean) {
    if (on === this.voiceOn) return
    this.halt()
    this.voiceOn = on
    if (on) {
      // Le son remis : la voix a de nouveau sa chance (le réseau a pu revenir), même si elle ne se chargeait pas
      this.failures = 0
      this.timerOnce = false
      if (this.s.voiceFailed || this.s.voiceTrouble) this.set({ voiceFailed: false, voiceTrouble: false })
    }
    if (this.running) this.go()
  }

  play() {
    if (this.running || this.s.ended) return
    this.running = true
    this.go()
  }

  pause() {
    if (!this.running) return
    this.running = false
    this.halt()
  }

  /** Va au début d'un passage ; la lecture continue si elle était en cours */
  seek(index: number) {
    this.halt()
    const i = Math.max(0, Math.min(this.script.segments.length - 1, index))
    this.words = wordsOf(this.script.segments[i]!.say)
    this.timerOnce = false
    this.holding = false
    this.set({ index: i, progress: 0, word: -1, started: false, ended: false, voiceTrouble: false })
    if (this.running) this.go()
  }

  dispose() {
    this.running = false
    this.halt()
  }

  /** Arrête la course en cours (son, minuteries), en gardant où l'on en est */
  private halt() {
    for (const t of this.timers) window.clearTimeout(t)
    this.timers = []
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = 0
    this.listen?.abort()
    this.listen = null
    if (this.mode === 'audio' && ownsAudio(this)) audioElement()?.pause()
    this.mode = null
    this.run += 1
  }

  private later(fn: () => void, ms: number) {
    this.timers.push(window.setTimeout(fn, ms))
  }

  private go() {
    if (!this.running || this.s.ended) return
    // Reprise pendant la pose de fin : on passe directement au passage suivant (le son du passage est fini)
    if (this.holding) {
      this.next()
      return
    }
    const voice = this.voiceOn && !this.s.voiceFailed && !this.timerOnce ? voiceOf(this.script.id, this.segment) : null
    const el = voice ? audioElement() : null
    if (voice && el) this.speak(voice, el)
    else this.tick()
  }

  /** Le passage dit par son fichier audio, depuis la progression atteinte */
  private speak(voice: SegmentVoice, a: HTMLAudioElement) {
    const run = this.run
    const live = () => run === this.run && ownsAudio(this)
    const ac = new AbortController()
    this.listen = ac
    this.mode = 'audio'
    claimAudio(this)
    loadAudio(voice.url)
    const from = this.s.progress
    this.sounding = false
    this.set({ started: false, voiced: true })
    const on = (type: string, fn: () => void) => a.addEventListener(type, () => live() && fn(), { signal: ac.signal })

    on('playing', () => {
      this.sounding = true
      if (this.s.voiceTrouble) this.set({ voiceTrouble: false })
      if (!this.s.started) this.set({ started: true })
      this.failures = 0
      this.lastTime = a.currentTime
      this.lastMove = performance.now()
      if (!this.raf) this.loop()
      // Le passage suivant se charge pendant que celui-ci se dit
      const next = this.script.segments[this.s.index + 1]
      const nextVoice = next && voiceOf(this.script.id, next)
      if (nextVoice) preloadAudio(nextVoice.url)
    })
    on('ended', () => this.next())
    // Fichier introuvable ou illisible. Hors ligne, aucun fichier ne viendra (ils ne sont pas dans la copie hors
    // ligne) : la note « sous-titres seuls » s'affiche tout de suite, et le fichier n'est pas tenu pour illisible
    // au retour du réseau
    const unreadable = () => {
      if (navigator.onLine === false) this.failures = Math.max(this.failures, 1)
      else markUnreadable(this.script.id, this.segment.id)
      this.trouble(this.s.started)
    }
    on('error', unreadable)

    const start = () => {
      if (!live()) return
      // Reprise au milieu du passage : à la même proportion de la durée réelle du fichier
      const d = a.duration
      if (from > 0 && Number.isFinite(d) && d > 0 && Math.abs(a.currentTime - from * d) > 0.25) a.currentTime = from * d
      else if (from === 0 && a.currentTime > 0.25 && !a.ended) a.currentTime = 0
      if (a.ended) a.currentTime = 0
      const p = a.play()
      p?.catch((e: unknown) => {
        if (!live()) return
        const name = e instanceof DOMException ? e.name : ''
        if (name === 'NotAllowedError') this.blocked()
        else if (name === 'NotSupportedError') unreadable()
        else if (name !== 'AbortError') this.trouble(this.s.started)
      })
    }
    // Reprise au milieu d'un fichier pas encore chargé : on attend sa durée pour se placer
    if (from > 0 && a.readyState < 1) on('loadedmetadata', start)
    else start()

    // Un son qui ne démarre pas : le passage continue en minuterie
    this.later(() => {
      if (live() && !this.sounding) this.trouble(false)
    }, NO_START)
    // L'image n'attend pas un son lent à démarrer ; les mots mis en valeur, eux, attendent qu'il les dise
    this.later(() => {
      if (live() && !this.s.started) this.set({ started: true })
    }, SLOW_START)
  }

  /** Le passage en sous-titres seuls, à son rythme, depuis la progression atteinte */
  private tick() {
    this.mode = 'timer'
    this.t0 = performance.now()
    this.p0 = this.s.progress
    this.span = segmentMs(this.script.id, this.segment) * (1 - this.p0)
    this.set({ started: true, voiced: false })
    this.loop()
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    const say = this.segment.say
    if (this.mode === 'audio') {
      const a = audioElement()
      if (!a || !ownsAudio(this)) return
      const d = a.duration
      const now = performance.now()
      if (a.currentTime !== this.lastTime) {
        this.lastTime = a.currentTime
        this.lastMove = now
      } else if (!a.paused && this.sounding && now - this.lastMove > STALL) {
        this.trouble(true)
        return
      }
      if (!Number.isFinite(d) || d <= 0) return
      const p = Math.min(1, a.currentTime / d)
      this.set({ progress: p, word: wordAt(this.words, p * say.length) }, false)
      return
    }
    if (this.mode !== 'timer') return
    const p = this.p0 + (1 - this.p0) * Math.min(1, (performance.now() - this.t0) / Math.max(1, this.span))
    if (p >= 1) {
      this.next()
      return
    }
    this.set({ progress: p, word: wordAt(this.words, p * say.length) }, false)
  }

  /** La voix n'a pas démarré, a échoué ou s'est bloquée : ce passage continue en minuterie (« keep » : d'où il en était) */
  private trouble(keep: boolean) {
    this.halt()
    this.failures += 1
    // La note « sous-titres seuls » paraît dès ce passage ; après deux échecs de suite, la vidéo renonce à la voix
    this.set(this.failures >= 2 ? { voiceTrouble: true, voiceFailed: true } : { voiceTrouble: true })
    this.timerOnce = true
    if (!keep) this.set({ progress: 0, word: -1 })
    this.go()
  }

  /** Le navigateur refuse de lancer le son sans geste : la vidéo se met en pause, au début du passage */
  private blocked() {
    audioRefused()
    this.halt()
    this.running = false
    this.set({ started: false, progress: 0, word: -1 })
    this.onBlocked()
  }

  private next() {
    this.halt()
    this.timerOnce = false
    // Le dernier mot mis en valeur vient tard : une pose, le passage reste à l'écran (dernier passage compris,
    // pour que l'écran de fin ne vienne pas aussitôt)
    const hold = this.holding ? 0 : holdMs(this.segment, segmentMs(this.script.id, this.segment))
    if (hold > 0) {
      this.holding = true
      this.set({ progress: 1, word: this.words.length })
      this.later(() => this.next(), hold)
      return
    }
    this.holding = false
    const last = this.script.segments.length - 1
    if (this.s.index < last) {
      const index = this.s.index + 1
      this.words = wordsOf(this.script.segments[index]!.say)
      this.set({ index, progress: 0, word: -1, started: false, voiceTrouble: false })
      this.later(() => this.go(), GAP_MS)
    } else {
      this.running = false
      this.set({ progress: 1, word: this.words.length, started: false, ended: true })
    }
  }
}

export interface Narration extends NarrationState {
  /** Va au début d'un passage */
  seek: (index: number) => void
  /** Reprend la vidéo au début */
  restart: () => void
}

/**
 * La chronologie d'une vidéo. « run » : la vidéo doit avancer (visible, lecture voulue, page affichée, aucun
 * panneau ouvert). « voiceOn » : le son est voulu (la voix n'est dite que si le fichier existe). « onBlocked » :
 * le navigateur a refusé le son sans geste, la vidéo attend un toucher sur Lecture. « from » : le passage où
 * commencer (retour d'une fiche), le premier sinon.
 */
export function useNarration(
  script: VideoScript,
  run: boolean,
  voiceOn: boolean,
  onBlocked: () => void,
  from = 0,
): Narration {
  const [state, setState] = useState<NarrationState>(() => ({ ...initial, index: startIndex(script, from) }))
  const blockedRef = useRef(onBlocked)
  blockedRef.current = onBlocked
  const ref = useRef<Narrator | null>(null)
  if (!ref.current) ref.current = new Narrator(script, setState, () => blockedRef.current(), from)
  const narrator = ref.current
  const running = useRef(run)
  running.current = run

  useEffect(() => {
    narrator.setVoice(voiceOn)
  }, [narrator, voiceOn])
  useEffect(() => {
    if (run) narrator.play()
    else narrator.pause()
  }, [narrator, run])
  useEffect(() => () => narrator.dispose(), [narrator])

  return {
    ...state,
    seek: index => {
      narrator.seek(index)
      if (running.current) narrator.play()
    },
    restart: () => {
      narrator.seek(0)
      if (running.current) narrator.play()
    },
  }
}
