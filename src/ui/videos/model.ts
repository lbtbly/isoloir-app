// Outils communs du lecteur et de la piste : mots d'un sous-titre, durées estimées, position d'un mot mis en
// valeur, graphique vérifié, place d'une vidéo dans sa série et son repère.

import type { FigureChart } from '../../core/types'
import type { VideoScript, VideoSegment, VideoSeries } from './types'

/** Typographie française : espace insécable avant « : ; ! ? % » et à l'intérieur des guillemets */
export const fr = (s: string) =>
  s
    .replace(/ ([:;!?»%€])/g, '\u00a0$1')
    .replace(/« /g, '«\u00a0')
    // Un nombre ne se sépare pas de son unité ni de ce qui le précède de près (« 1,8 milliard », « 62 ans »)
    .replace(/(\d) (ans|milliards?|millions?|mois|territoires|%)/g, '$1\u00a0$2')

/** Débit de lecture visé, en mots par seconde : il sert aux durées estimées sans voix enregistrée */
export const WORDS_PER_SECOND = 2.6

export interface Word {
  text: string
  /** Position du premier signe dans le texte */
  start: number
  end: number
}

/**
 * Les mots d'un texte, séparés par les espaces ordinaires seulement : une espace insécable garde la
 * ponctuation avec son mot (« partir ? »), comme à l'écran.
 */
export function wordsOf(text: string): Word[] {
  return [...text.matchAll(/[^ \t\n]+/g)].map(m => ({ text: m[0], start: m.index, end: m.index + m[0].length }))
}

/** Index du mot qui contient (ou précède) le signe « char » ; -1 avant le premier */
export function wordAt(words: Word[], char: number): number {
  let found = -1
  for (let i = 0; i < words.length; i++) {
    if (words[i]!.start <= char) found = i
    else break
  }
  return found
}

/** Durée estimée d'un texte dit à voix haute, en millisecondes : 2,6 mots par seconde et un souffle par phrase */
export function estimateMs(text: string): number {
  const words = wordsOf(text).length
  const stops = (text.match(/[.!?…:;]/g) ?? []).length
  return Math.max(1500, Math.round((words / WORDS_PER_SECOND) * 1000 + stops * 260))
}

const fold = (s: string) => s.toLowerCase().replace(/[\u00a0\u202f]/g, ' ')

/**
 * Où tombe un mot mis en valeur dans ce qui est dit, de 0 (début) à 1 (fin) : la piste peut le faire
 * apparaître quand la voix l'atteint. 0 si le mot n'est pas dans le « say ».
 */
export function cueAt(say: string, cue: string): number {
  const at = fold(say).indexOf(fold(cue))
  return at <= 0 ? 0 : at / say.length
}

/** Le graphique d'un segment, s'il a la forme d'un FigureChart (part, compare ou series) ; sinon rien */
export function chartOf(segment: VideoSegment): FigureChart | null {
  const c = segment.chart as Partial<Record<string, unknown>> | null | undefined
  if (!c || typeof c !== 'object') return null
  const items = (x: unknown) =>
    Array.isArray(x) && x.length >= 2 && x.every(i => !!i && typeof i.label === 'string' && typeof i.value === 'number')
  if (c.kind === 'part' && typeof c.value === 'number' && typeof c.total === 'number') return c as unknown as FigureChart
  if ((c.kind === 'compare' || c.kind === 'series') && items(c.items)) return c as unknown as FigureChart
  return null
}

/**
 * Pose minimale entre le début d'écriture du dernier mot mis en valeur et le passage suivant : 150 ms d'attente,
 * 760 ms d'écriture (.vc-write), et de quoi le lire
 */
export const POSE_MS = 2000

/**
 * Silence à ajouter en fin de passage (ms), pour que son dernier mot mis en valeur reste lisible quand la voix le
 * dit tard ; 0 sinon. Rien n'apparaît avant d'être dit : on prolonge la fin, on n'avance pas le mot.
 * « ms » : la durée du passage (segmentMs d'audio.ts).
 */
export function holdMs(segment: VideoSegment, ms: number): number {
  const last = Math.max(0, ...(segment.emphasis ?? []).map(e => cueAt(segment.say, e)))
  if (!last) return 0
  // Le mot s'écrit dès que la progression atteint sa place moins 0,03 (heard() de la piste)
  return Math.max(0, Math.round(POSE_MS - ms * (1 - Math.max(0, last - 0.03))))
}

/** Place d'une vidéo dans sa série : 0 pour l'introduction, 1 à « of » pour les approfondissements */
export function partOf(series: VideoSeries, video: VideoScript): { part: number; of: number } {
  const deep = series.videos.filter(v => v.kind === 'deep')
  return { part: video.kind === 'intro' ? 0 : deep.indexOf(video) + 1, of: deep.length }
}

/** Place dans la série, sans le nom de la série : « Introduction », « 1 sur 4 — Âge de départ » */
export function placeOf(series: VideoSeries, video: VideoScript): string {
  const { part, of } = partOf(series, video)
  return part === 0 ? video.short : `${part}\u00a0sur\u00a0${of}\u00a0— ${video.short}`
}

/** Repère d'une vidéo : « Retraites · Introduction », « Retraites · 1 sur 4 — Âge de départ » */
export const markerOf = (series: VideoSeries, video: VideoScript) => `${series.label} · ${placeOf(series, video)}`

/** Une durée parlée, arrondie : « 45 s », « 1 min 10 s », « 6 min » (au-delà de 5 minutes, à la minute) */
export function durationLabel(seconds: number): string {
  const s = Math.max(5, Math.round(seconds / 5) * 5)
  if (s < 60) return `${s}\u00a0s`
  if (s >= 300) return `${Math.round(s / 60)}\u00a0min`
  const rest = s % 60
  return rest ? `${Math.floor(s / 60)}\u00a0min ${rest}\u00a0s` : `${s / 60}\u00a0min`
}

/* ——— Le catalogue : quelles vidéos pour un thème, pour une question ———
   Lu par les pages du site (« Les sujets », « Les sujets en vidéo », une question de la feuille) : rien n'y est
   écrit en dur, tout vient des séries (VIDEO_SERIES). */

/** Une vidéo, avec sa série */
export interface VideoRef {
  series: VideoSeries
  video: VideoScript
}

/** La série d'un thème, si elle a au moins une vidéo */
export const seriesOfTopic = (all: VideoSeries[], topicId: string): VideoSeries | null =>
  all.find(s => s.topicId === topicId && s.videos.length > 0) ?? null

/** Une vidéo des séries, par son identifiant */
export function findVideo(all: VideoSeries[], id: string | null | undefined): VideoRef | null {
  if (!id) return null
  for (const series of all) {
    const video = series.videos.find(v => v.id === id)
    if (video) return { series, video }
  }
  return null
}

/** Les approfondissements qui éclairent une question (leurs questionIds), dans l'ordre des séries */
export const deepVideosOf = (all: VideoSeries[], questionId: string): VideoRef[] =>
  all.flatMap(series =>
    series.videos.filter(v => v.kind === 'deep' && v.questionIds.includes(questionId)).map(video => ({ series, video })),
  )

/**
 * Les séries dans l'ordre du fil du lecteur : famille après famille (ordre éditorial), et dans une famille,
 * l'ordre de ses thèmes. Une série dont le thème n'est dans aucune famille n'est pas dans le fil.
 */
export const seriesInFeedOrder = (all: VideoSeries[], groups: readonly { topicIds: readonly string[] }[]): VideoSeries[] =>
  groups.flatMap(g => g.topicIds.map(id => seriesOfTopic(all, id)).filter((s): s is VideoSeries => !!s))
