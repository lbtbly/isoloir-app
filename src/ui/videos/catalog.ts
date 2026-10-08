// Le catalogue des vidéos, chargé à la demande (load.ts) : les séries de l'élection affichée (celle que fixe
// setVideoScope, réétiquetée par scope.ts) et ce qu'en tirent les pages du site sans ouvrir le lecteur (durées,
// vidéos d'un thème ou d'une question), et le déblocage du son dans le geste qui ouvre une vidéo. Le lecteur
// lui-même (Player.tsx et le dessin) est un autre morceau, chargé à part : une page qui ne fait que proposer une
// vidéo n'a pas à le télécharger d'abord.

import { unlockAudio, videoSeconds, voiceOf, voicedCount } from './audio'
import { videoElection, type VideoElection } from './load'
import { deepVideosOf, findVideo, seriesInFeedOrder, seriesOfTopic } from './model'
import { scopeSeries } from './scope'
import { VIDEO_SERIES } from './series'
import type { VideoScript, VideoSeries } from './types'

let scoped: { election: VideoElection; series: VideoSeries[] } | null = null

/**
 * Les séries de l'élection affichée, rangées et réétiquetées pour elle (scope.ts) ; aucune tant qu'aucune
 * élection n'est fixée. Calculées une fois par élection.
 */
export function videoSeries(): VideoSeries[] {
  const election = videoElection()
  if (!election) return []
  if (scoped?.election !== election) {
    const { bank } = election
    const groups = election.topicGroups ?? bank.topics.map(t => ({ id: t.id, topicIds: [t.id] }))
    scoped = { election, series: scopeSeries(VIDEO_SERIES, election.videoScope, groups, bank) }
  }
  return scoped.series
}

/** La série d'un thème, si elle a des vidéos */
export const topicSeries = (topicId: string) => seriesOfTopic(videoSeries(), topicId)

/** Les approfondissements qui éclairent une question */
export const questionVideos = (questionId: string) => deepVideosOf(videoSeries(), questionId)

/** Une vidéo par son identifiant */
export const videoById = (id: string | null | undefined) => findVideo(videoSeries(), id)

/** Les séries dans l'ordre du fil (familles de thèmes) */
export const feedSeries = (groups: readonly { topicIds: readonly string[] }[]) => seriesInFeedOrder(videoSeries(), groups)

/** Durée d'une vidéo, en secondes */
export const videoDuration = (v: VideoScript) => videoSeconds(v)

/** Durée d'une série entière, en secondes */
export const seriesDuration = (s: VideoSeries) => s.videos.reduce((t, v) => t + videoSeconds(v), 0)

/** Au moins une vidéo a sa voix enregistrée */
export const anyVoice = () => videoSeries().some(s => s.videos.some(v => voicedCount(v) > 0))

/**
 * Dans le geste même qui ouvre une vidéo (toucher, clic, Entrée) : autorise le son de son premier passage
 * (Safari sur iPhone n'autorise le son qu'à cette condition)
 */
export function unlockVideo(id: string) {
  const ref = findVideo(videoSeries(), id)
  const first = ref?.video.segments[0]
  if (ref && first) unlockAudio(voiceOf(ref.video.id, first)?.url)
}
