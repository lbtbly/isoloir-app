// Applique une édition (types.ts) à une série : fonction pure. Une correction qui ne trouve pas sa vidéo ou son
// passage est ignorée ici ; les tests (tests/video-editions.test.ts) refusent qu'il en existe.

import type { VideoSegment, VideoSeries } from '../types'
import type { EditedScript, Edition, SegmentPatch } from './types'

/** Le passage corrigé : nouvel identifiant (donc sa propre voix) si son texte dit change ; sinon il garde son
 *  identifiant et sa voix, et peut avoir sa propre planche, rangée sous « <id><suffixe> » (champ board) */
function patchSegment(segment: VideoSegment, patch: Exclude<SegmentPatch, 'omit'>, suffix: string): VideoSegment {
  const voiced = patch.say !== undefined || patch.spoken !== undefined
  return voiced ? { ...segment, ...patch, id: `${segment.id}${suffix}` } : { ...segment, ...patch, board: `${segment.id}${suffix}` }
}

/** Identifiant d'origine d'un passage (sans le suffixe d'une édition) : celui de sa planche de dessin */
export const baseSegmentId = (id: string, suffixes: readonly string[]) => {
  for (const s of suffixes) if (id.endsWith(s)) return id.slice(0, -s.length)
  return id
}

/** Les clés où chercher la planche d'un passage, dans l'ordre : planche propre à l'édition (board), passage
 *  (son identifiant, suffixé s'il est corrigé), passage d'origine */
export const boardKeys = (segment: VideoSegment, suffixes: readonly string[]): string[] =>
  [...new Set([segment.board, segment.id, baseSegmentId(segment.id, suffixes)].filter((k): k is string => !!k))]

export function applyEdition(series: VideoSeries, edition: Edition | undefined): VideoSeries {
  const patch = edition?.patches[series.topicId]
  if (!edition || !patch?.videos) return series
  const videos: EditedScript[] = []
  for (const video of series.videos) {
    const vp = patch.videos[video.id]
    if (!vp) {
      videos.push(video)
      continue
    }
    if (vp.omit) continue
    const segments: VideoSegment[] = []
    const inserts = vp.insert ?? []
    for (const ins of inserts.filter(i => i.after === null)) segments.push(ins.segment)
    for (const seg of video.segments) {
      const sp = vp.segments?.[seg.id]
      if (sp !== 'omit') segments.push(sp ? patchSegment(seg, sp, edition.suffix) : seg)
      for (const ins of inserts.filter(i => i.after === seg.id)) segments.push(ins.segment)
    }
    videos.push({
      ...video,
      ...(vp.title !== undefined ? { title: vp.title } : {}),
      ...(vp.short !== undefined ? { short: vp.short } : {}),
      ...(vp.sources !== undefined ? { sources: vp.sources } : {}),
      segments,
      ...(vp.questionIds ? { questionIds: vp.questionIds, nativeQuestionIds: true as const } : {}),
    })
  }
  return { ...series, videos }
}
