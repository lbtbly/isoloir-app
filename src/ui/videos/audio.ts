// La voix des vidéos : des fichiers audio enregistrés d'avance, un par passage, servis avec le site.
//
// Une seule voix de synthèse (décision du propriétaire, le 5 octobre 2026 : la voix aiguë seule). Ses fichiers
// gardent le dossier où ils ont été générés, « aigue ». Chemin, sous public/ :
//   videos/audio/aigue/<vidéo>/<passage>.m4a
// par exemple public/videos/audio/aigue/retraites-intro/retraites-intro-01.m4a (AAC dans un conteneur MP4,
// que Safari, Chrome et Firefox lisent). La voix est générée à l'avance, hors ligne, sur l'ordinateur de
// l'éditeur (tools/voices/generate.py, modèle libre VoxCPM2) ; aucune synthèse vocale ne tourne sur l'appareil
// de la personne, ni sur un serveur.
//
// L'inventaire, audio-files.json, dit quels fichiers existent : sans lui, aucun fichier n'est demandé au
// serveur (pas d'erreur 404 en console tant que la voix n'est pas là). Il s'écrit en même temps que les
// fichiers, par l'outil qui les génère :
//   { "voices": { "aigue": { "<vidéo>": { "<passage>": { "file": "videos/audio/aigue/<vidéo>/<passage>.m4a",
//                                                       "duration": 4.21, "hash": "1a2b3c4d" } } } } }
// Seule la table « aigue » est lue ; une autre table, s'il en reste une, est ignorée.
// « file » : le chemin du fichier sous public/ (c'est aussi son adresse sous la base du site), qui doit être
// exactement audioPath() ; « duration » : sa durée en secondes (estimation avant chargement, et rythme si le
// fichier ne se lit pas) ; « hash » : textPrint() du texte enregistré, spokenOf() du passage (son « spoken »
// s'il en a un, sinon son « say »), sur la chaîne exacte de series.ts, insécables comprises. Un passage dont le
// texte a changé depuis garde ses sous-titres mais perd sa voix (elle dirait autre chose), jusqu'au prochain
// enregistrement : ce passage se lit en sous-titres seuls, au rythme estimé.
//
// Lecture : un seul élément <audio> pour tout le lecteur, débloqué une fois pendant un geste de la personne
// (Safari sur iPhone n'autorise le son qu'à cette condition, élément par élément). La synchronisation suit la
// position de lecture du fichier et sa durée réelle (narration.ts).
// Les fichiers ne sont pas dans la copie hors ligne (vite.config.ts ne garde que la racine de public/) : hors
// ligne, ils ne se chargent pas et la vidéo continue en sous-titres seuls.
//
// Le son coupé ou actif est un réglage du lecteur pour la visite (Host.tsx) : rien n'est retenu sur l'appareil.

import manifest from './audio-files.json'
import { estimateMs, holdMs } from './model'
import type { VideoScript, VideoSegment } from './types'

/* ——— La voix ——— */

/** Identifiant de la voix : le premier dossier de ses fichiers et la clé de sa table dans l'inventaire */
export type VoiceId = 'aigue'
/** La voix des vidéos */
export const VOICE: VoiceId = 'aigue'

/* ——— L'inventaire ——— */

/** Une ligne de l'inventaire : un fichier enregistré */
export interface AudioEntry {
  /** Chemin sous public/ : audioPath(voix, vidéo, passage) */
  file: string
  /** Durée du fichier, en secondes */
  duration: number
  /** Empreinte du texte enregistré : textPrint(spokenOf(passage)) */
  hash: string
}

/** Chemin du fichier d'un passage sous public/, et adresse sous la base du site */
export const audioPath = (voice: VoiceId, videoId: string, segmentId: string) =>
  `videos/audio/${voice}/${videoId}/${segmentId}.m4a`

/** Empreinte d'un texte dit : FNV-1a 32 bits de son UTF-8, en hexadécimal sur 8 signes (minuscules) */
export function textPrint(text: string): string {
  let h = 0x811c9dc5
  for (const b of new TextEncoder().encode(text)) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/** Le texte que dit la voix d'un passage : son « spoken » s'il en a un (non vide), sinon son « say » */
export const spokenOf = (segment: Pick<VideoSegment, 'say' | 'spoken'>): string =>
  typeof segment.spoken === 'string' && segment.spoken.trim() ? segment.spoken : segment.say

const prints = new Map<string, string>()
/** Empreinte du texte dit d'un passage, telle que l'inventaire doit l'avoir (mémorisée) */
export function segmentPrint(segment: Pick<VideoSegment, 'say' | 'spoken'>): string {
  const text = spokenOf(segment)
  let p = prints.get(text)
  if (!p) prints.set(text, (p = textPrint(text)))
  return p
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
/** Une propriété propre d'un objet JSON (jamais celles héritées, « constructor » ou « __proto__ ») */
const own = (o: unknown, key: string): unknown => (isRecord(o) && Object.hasOwn(o, key) ? o[key] : undefined)

/** La ligne de l'inventaire d'un passage, si elle a la bonne forme ; sinon rien */
export function inventoryEntry(inventory: unknown, videoId: string, segmentId: string): AudioEntry | null {
  const e = own(own(own(own(inventory, 'voices'), VOICE), videoId), segmentId)
  if (!isRecord(e)) return null
  const { file, duration, hash } = e
  if (typeof file !== 'string' || typeof hash !== 'string') return null
  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration <= 0) return null
  return { file, duration, hash }
}

/** Ce qu'on sait du fichier enregistré d'un passage */
export interface Recording {
  /** Chemin sous public/ */
  file: string
  /** Durée inscrite, en millisecondes */
  ms: number
}

/**
 * Le fichier enregistré d'un passage : inscrit à l'inventaire, à sa place (« file » égal à audioPath) et à jour
 * (« hash » égal à l'empreinte du texte dit actuel) ; sinon rien.
 */
export function recordingOf(
  videoId: string,
  segment: Pick<VideoSegment, 'id' | 'say' | 'spoken'>,
  inventory: unknown = manifest,
): Recording | null {
  const e = inventoryEntry(inventory, videoId, segment.id)
  const file = audioPath(VOICE, videoId, segment.id)
  if (!e || e.file !== file || e.hash !== segmentPrint(segment)) return null
  return { file, ms: Math.round(e.duration * 1000) }
}

/* ——— Ce que le lecteur en tire ——— */

/** Fichiers inscrits à l'inventaire mais illisibles pendant cette visite (absents, hors ligne, format refusé) */
const unreadable = new Set<string>()

export interface SegmentVoice {
  url: string
  /** Durée annoncée par l'inventaire, en millisecondes */
  ms: number
}

/** La voix enregistrée d'un passage, si elle existe, dit le texte actuel et n'a pas échoué ; sinon rien */
export function voiceOf(videoId: string, segment: VideoSegment): SegmentVoice | null {
  const r = recordingOf(videoId, segment)
  if (!r || unreadable.has(r.file)) return null
  return { url: `${import.meta.env.BASE_URL}${r.file}`, ms: r.ms }
}

/** Le fichier d'un passage n'a pas pu être lu : on ne le redemande plus pendant cette visite */
export const markUnreadable = (videoId: string, segmentId: string) => unreadable.add(audioPath(VOICE, videoId, segmentId))

/**
 * Durée d'un passage : celle du fichier enregistré s'il est inscrit (et à jour), sinon l'estimation du texte dit
 * (« 17,3 millions » se lit « dix-sept virgule trois millions »)
 */
export function segmentMs(videoId: string, segment: VideoSegment): number {
  return recordingOf(videoId, segment)?.ms ?? estimateMs(spokenOf(segment))
}

/** Souffle entre deux passages, en millisecondes */
export const GAP_MS = 160

/** Durée d'une vidéo entière, en secondes (avec la pose de fin des passages dont le dernier mot vient tard) */
export function videoSeconds(script: VideoScript): number {
  return Math.round(
    script.segments.reduce((ms, s) => {
      const d = segmentMs(script.id, s)
      return ms + d + holdMs(s, d) + GAP_MS
    }, 0) / 1000,
  )
}

/** Nombre de passages d'une vidéo qui ont leur voix */
export const voicedCount = (script: VideoScript) => script.segments.filter(s => voiceOf(script.id, s)).length

/* ——— L'élément audio, partagé par tout le lecteur ——— */

let element: HTMLAudioElement | null = null
let preloader: HTMLAudioElement | null = null
/** L'adresse chargée, telle qu'on l'a donnée (element.src est, lui, une adresse absolue) */
let loaded = ''
/** Qui joue : un seul conteur à la fois */
let owner: object | null = null
let unlocked = false

/** L'élément audio du lecteur, créé au premier besoin ; rien hors d'un navigateur */
export function audioElement(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (!element) {
    element = new Audio()
    element.preload = 'auto'
  }
  return element
}

/** Charge un fichier dans l'élément partagé, s'il n'y est pas déjà */
export function loadAudio(url: string) {
  const a = audioElement()
  if (!a || loaded === url) return
  loaded = url
  a.src = url
}

/** Prend la main sur l'élément partagé ; le conteur précédent n'a plus le droit d'y toucher */
export const claimAudio = (who: object) => {
  owner = who
}
export const ownsAudio = (who: object) => owner === who

/**
 * À appeler dans le geste même de la personne (toucher Lecture, ouvrir une vidéo, remettre le son) : lance puis
 * arrête aussitôt le fichier du passage à venir, ce qui autorise ensuite l'élément à parler sans geste (Safari
 * sur iPhone). Sans fichier à lire, rien à faire : le prochain geste réessaiera.
 */
export function unlockAudio(url: string | null | undefined) {
  if (unlocked || !url) return
  const a = audioElement()
  if (!a) return
  unlocked = true
  // Déjà en train de jouer : il l'était donc
  if (!a.paused) return
  loadAudio(url)
  const p = a.play()
  a.pause()
  p?.catch(() => undefined)
}

/** Le navigateur a refusé le son malgré tout : le prochain geste refera le déblocage */
export const audioRefused = () => {
  unlocked = false
}

/** Demande le fichier du passage suivant, sans le jouer : il sera prêt à temps */
export function preloadAudio(url: string) {
  if (typeof Audio === 'undefined' || url === loaded) return
  if (!preloader) {
    preloader = new Audio()
    preloader.preload = 'auto'
    preloader.muted = true
  }
  if (preloader.getAttribute('src') !== url) preloader.src = url
}

/** Fermeture du lecteur : la voix se tait et l'élément rend le fichier chargé */
export function stopAudio() {
  owner = null
  loaded = ''
  for (const a of [element, preloader]) {
    if (!a) continue
    a.pause()
    a.removeAttribute('src')
    a.load()
  }
}
