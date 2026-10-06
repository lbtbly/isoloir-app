// Les vidéos dans le site : adresses (#/videos, #/videos/<vidéo>, l'ancienne #/essai-videos), catalogue lu dans
// les séries sans rien d'écrit en dur (série d'un thème, approfondissements d'une question, ordre du fil),
// historique du lecteur (la vidéo et le passage à rouvrir au retour d'une fiche), entrée du menu.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseHash } from '../src/app'
import { choisir2027 } from '../src/elections/choisir-2027'
import { feedSeries, questionVideos, topicSeries, videoById } from '../src/ui/videos/catalog'
import { LECTEUR, isPlayerEntry, savedPlayer } from '../src/ui/videos/history'
import { deepVideosOf, findVideo, seriesInFeedOrder, seriesOfTopic } from '../src/ui/videos/model'
import { VIDEO_SERIES } from '../src/ui/videos/series'
import type { VideoScript, VideoSeries } from '../src/ui/videos/types'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const { bank } = choisir2027
const groups = choisir2027.topicGroups ?? []

describe('adresses', () => {
  it('#/videos, et #/videos/<vidéo> pour ouvrir le lecteur sur une vidéo', () => {
    expect(parseHash('#/videos')).toEqual({ name: 'videos' })
    expect(parseHash('#/videos/retraites-age')).toEqual({ name: 'videos', start: 'retraites-age' })
  })

  it('l’ancienne page d’essai mène à la page des vidéos', () => {
    expect(parseHash('#/essai-videos')).toEqual({ name: 'videos' })
    expect(parseHash('#/essai-videos/logement-intro')).toEqual({ name: 'videos', start: 'logement-intro' })
  })

  it('le menu principal mène à la page des vidéos', () => {
    const header = readFileSync(join(ROOT, 'src/ui/components/FormHeader.tsx'), 'utf8')
    expect(header).toMatch(/href: '#\/videos'/)
  })
})

describe('catalogue, sur des séries d’exemple', () => {
  const video = (id: string, kind: 'intro' | 'deep', questionIds: string[]): VideoScript => ({
    id,
    kind,
    questionIds,
    title: id,
    short: id,
    register: 'vous',
    segments: [],
    sources: [],
  })
  const a: VideoSeries = {
    topicId: 'a',
    familyId: 'f2',
    label: 'A',
    videos: [video('a-intro', 'intro', ['a-1', 'a-2']), video('a-x', 'deep', ['a-1']), video('a-y', 'deep', ['a-1', 'a-2'])],
  }
  const b: VideoSeries = { topicId: 'b', familyId: 'f1', label: 'B', videos: [video('b-intro', 'intro', ['b-1']), video('b-x', 'deep', ['b-1'])] }
  const empty: VideoSeries = { topicId: 'c', familyId: 'f1', label: 'C', videos: [] }
  const all = [a, b, empty]

  it('la série d’un thème, seulement si elle a des vidéos', () => {
    expect(seriesOfTopic(all, 'a')).toBe(a)
    expect(seriesOfTopic(all, 'c')).toBeNull()
    expect(seriesOfTopic(all, 'z')).toBeNull()
  })

  it('les approfondissements d’une question, jamais l’introduction', () => {
    expect(deepVideosOf(all, 'a-1').map(r => r.video.id)).toEqual(['a-x', 'a-y'])
    expect(deepVideosOf(all, 'a-2').map(r => r.video.id)).toEqual(['a-y'])
    expect(deepVideosOf(all, 'z-1')).toEqual([])
  })

  it('une vidéo par son identifiant, avec sa série', () => {
    expect(findVideo(all, 'b-x')).toEqual({ series: b, video: b.videos[1] })
    expect(findVideo(all, 'nope')).toBeNull()
    expect(findVideo(all, undefined)).toBeNull()
  })

  it('l’ordre du fil : famille après famille, puis l’ordre des thèmes ; une série hors des familles n’y est pas', () => {
    const order = seriesInFeedOrder(all, [{ topicIds: ['c', 'b'] }, { topicIds: ['a'] }])
    expect(order.map(s => s.topicId)).toEqual(['b', 'a'])
    expect(seriesInFeedOrder(all, [{ topicIds: ['b'] }]).map(s => s.topicId)).toEqual(['b'])
  })
})

describe('catalogue des séries réelles', () => {
  it('chaque série écrite est trouvée par son thème, et chaque vidéo par son identifiant', () => {
    for (const s of VIDEO_SERIES) {
      expect(topicSeries(s.topicId), s.topicId).toBe(s)
      for (const v of s.videos) expect(videoById(v.id)?.video, v.id).toBe(v)
    }
  })

  it('chaque question éclairée par un approfondissement le retrouve', () => {
    for (const s of VIDEO_SERIES) {
      for (const v of s.videos.filter(x => x.kind === 'deep')) {
        for (const q of v.questionIds) {
          expect(bank.questions.some(x => x.id === q), `${v.id} → ${q}`).toBe(true)
          expect(questionVideos(q).map(r => r.video.id), q).toContain(v.id)
        }
      }
    }
  })

  it('le fil contient toutes les séries écrites, dans l’ordre des familles', () => {
    const feed = feedSeries(groups)
    expect(feed.length).toBe(VIDEO_SERIES.length)
    const rank = (topicId: string) => groups.findIndex(g => g.topicIds.includes(topicId))
    for (let i = 1; i < feed.length; i++) expect(rank(feed[i]!.topicId)).toBeGreaterThanOrEqual(rank(feed[i - 1]!.topicId))
  })
})

describe('historique du lecteur', () => {
  it('une entrée du lecteur, et la vidéo à rouvrir quand on l’a quittée par un lien', () => {
    expect(isPlayerEntry({ [LECTEUR]: true })).toBe(true)
    expect(isPlayerEntry(null)).toBe(false)
    expect(isPlayerEntry({ autre: true })).toBe(false)
    expect(savedPlayer({ [LECTEUR]: true })).toBeNull()
    expect(savedPlayer({ [LECTEUR]: true, vpVideo: 'retraites-age', vpSegment: 3 })).toEqual({ id: 'retraites-age', segment: 3 })
    // Un passage douteux repart du premier ; une entrée qui n'est pas celle du lecteur ne rouvre rien
    expect(savedPlayer({ [LECTEUR]: true, vpVideo: 'retraites-age', vpSegment: 'x' })).toEqual({ id: 'retraites-age', segment: 0 })
    expect(savedPlayer({ [LECTEUR]: true, vpVideo: 'retraites-age', vpSegment: -2 })).toEqual({ id: 'retraites-age', segment: 0 })
    expect(savedPlayer({ vpVideo: 'retraites-age' })).toBeNull()
    expect(savedPlayer({ [LECTEUR]: true, vpVideo: '' })).toBeNull()
  })
})
