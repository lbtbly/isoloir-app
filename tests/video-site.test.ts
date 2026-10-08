// Les vidéos dans le site : adresses (#/videos, #/videos/<vidéo>, l'ancienne #/essai-videos), catalogue lu dans
// les séries sans rien d'écrit en dur (série d'un thème, approfondissements d'une question, ordre du fil), séries
// propres à chaque élection (scopeSeries, et le catalogue qui suit l'élection affichée), historique du lecteur
// (la vidéo et le passage à rouvrir au retour d'une fiche), entrée du menu.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parseRoute } from '../src/core/routes'
import type { ElectionPack } from '../src/core/types'
import { elections } from '../src/elections/all'
import { feedSeries, questionVideos, topicSeries, videoById, videoSeries } from '../src/ui/videos/catalog'
import { LECTEUR, isPlayerEntry, savedPlayer } from '../src/ui/videos/history'
import { setVideoScope, videoElection } from '../src/ui/videos/load'
import { deepVideosOf, findVideo, seriesInFeedOrder, seriesOfTopic } from '../src/ui/videos/model'
import { scopeSeries, type ScopeBank } from '../src/ui/videos/scope'
import { VIDEO_SERIES } from '../src/ui/videos/series'
import type { VideoScript, VideoSeries } from '../src/ui/videos/types'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Les familles de thèmes d'une élection, comme les lisent les pages et le catalogue */
const groupsOf = (pack: ElectionPack) => pack.topicGroups ?? pack.bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))

describe('adresses', () => {
  it('#/videos, et #/videos/<vidéo> pour ouvrir le lecteur sur une vidéo', () => {
    expect(parseRoute('#/videos')).toEqual({ name: 'videos' })
    expect(parseRoute('#/videos/retraites-age')).toEqual({ name: 'videos', start: 'retraites-age' })
  })

  it('l’ancienne page d’essai mène à la page des vidéos', () => {
    expect(parseRoute('#/essai-videos')).toEqual({ name: 'videos' })
    expect(parseRoute('#/essai-videos/logement-intro')).toEqual({ name: 'videos', start: 'logement-intro' })
  })

  it('le menu principal mène à la page des vidéos', () => {
    const header = readFileSync(join(ROOT, 'src/ui/components/FormHeader.tsx'), 'utf8')
    expect(header).toMatch(/path: '\/videos'/)
    expect(header).toMatch(/href=\{link\(item\.path\)\}/)
  })
})

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

describe('catalogue, sur des séries d’exemple', () => {
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

describe('séries d’une élection (scopeSeries), sur un petit périmètre factice', () => {
  // Séries écrites pour une élection source : thèmes « a », « b », « strategie », questions « a-1 »…
  const a: VideoSeries = {
    topicId: 'a',
    familyId: 'source-f1',
    label: 'Nom source A',
    videos: [
      video('a-intro', 'intro', ['a-2', 'a-1']),
      video('a-x', 'deep', ['a-1', 'a-1b']),
      video('a-y', 'deep', ['a-3']),
      video('a-z', 'deep', ['a-4']),
    ],
  }
  const b: VideoSeries = { topicId: 'b', familyId: 'source-f2', label: 'Nom source B', videos: [video('b-intro', 'intro', ['b-1']), video('b-x', 'deep', ['b-1'])] }
  const strategie: VideoSeries = { topicId: 'strategie', familyId: 'source-f2', label: 'Alliances', videos: [video('strategie-intro', 'intro', ['s-1'])] }
  const all = [a, b, strategie]
  const snapshot = JSON.stringify(all)
  // L'élection d'ici : ses thèmes « A » et « B », ses questions, ses familles (B avant A)
  const fiche = { title: 'fiche' }
  const here: ScopeBank = {
    topics: [
      { id: 'A', label: 'Thème A' },
      { id: 'B', label: 'Thème B' },
      { id: 'S', label: 'Thème sans série' },
    ],
    questions: [
      { id: 'A-0', topicId: 'A' },
      { id: 'A-first', topicId: 'A', explainer: fiche },
      { id: 'A-1', topicId: 'A', explainer: fiche },
      { id: 'A-2', topicId: 'A' },
      { id: 'B-1', topicId: 'B', explainer: fiche },
      { id: 'S-1', topicId: 'S', explainer: fiche },
    ],
  }
  const groups = [
    { id: 'g-b', topicIds: ['S', 'B'] },
    { id: 'g-a', topicIds: ['A'] },
  ]
  const scope = {
    topics: { a: 'A', b: 'B' },
    // « a-1b » mène à la même question que « a-1 » ; « a-4 » à une question absente de la banque ; « a-3 » à rien
    questions: { 'a-1': 'A-1', 'a-1b': 'A-1', 'a-2': 'A-2', 'a-4': 'A-disparue', 'b-1': 'B-1', 's-1': 'S-1' },
  }
  const scoped = scopeSeries(all, scope, groups, here)
  const byId = (id: string) => scoped.flatMap(s => s.videos).find(v => v.id === id)

  it('un thème absent du périmètre n’est pas montré ; les autres, dans l’ordre des familles d’ici', () => {
    expect(scoped.map(s => s.topicId)).toEqual(['B', 'A'])
    expect(byId('strategie-intro')).toBeUndefined()
  })

  it('thème, famille et nom de la série sont ceux de l’élection', () => {
    expect(scoped.map(s => [s.topicId, s.familyId, s.label])).toEqual([
      ['B', 'g-b', 'Thème B'],
      ['A', 'g-a', 'Thème A'],
    ])
  })

  it('les questions sont traduites, sans doublon ; celles sans équivalent dans la banque sont retirées', () => {
    expect(byId('a-intro')?.questionIds).toEqual(['A-2', 'A-1'])
    expect(byId('a-x')?.questionIds).toEqual(['A-1'])
    expect(byId('a-y')?.questionIds).toEqual([])
    expect(byId('a-z')?.questionIds).toEqual([])
    expect(byId('b-x')?.questionIds).toEqual(['B-1'])
  })

  it('« Voir la fiche » : la première question traduite qui a sa fiche, sinon la première fiche du thème', () => {
    // « A-2 » n'a pas de fiche : la suivante
    expect(byId('a-intro')?.fiche).toBe('A-1')
    expect(byId('a-x')?.fiche).toBe('A-1')
    // Aucune question traduite : la première fiche du thème, dans l'ordre de la banque (« A-0 » n'en a pas)
    expect(byId('a-y')?.fiche).toBe('A-first')
    expect(byId('a-z')?.fiche).toBe('A-first')
    expect(byId('b-intro')?.fiche).toBe('B-1')
  })

  it('les vidéos et leurs passages gardent leurs identifiants ; les séries écrites restent intactes', () => {
    expect(scoped.flatMap(s => s.videos.map(v => v.id))).toEqual(['b-intro', 'b-x', 'a-intro', 'a-x', 'a-y', 'a-z'])
    expect(byId('a-x')?.segments).toBe(a.videos[1]!.segments)
    expect(JSON.stringify(all)).toBe(snapshot)
  })

  it('un thème du périmètre absent de la banque n’est pas montré ; deux séries sous un même thème : la première', () => {
    expect(scopeSeries(all, { topics: { a: 'Z', b: 'B' }, questions: {} }, groups, here).map(s => s.topicId)).toEqual(['B'])
    const twice = scopeSeries(all, { topics: { a: 'A', b: 'A' }, questions: {} }, groups, here)
    expect(twice.map(s => s.videos[0]!.id)).toEqual(['a-intro'])
  })

  it('sans périmètre, les identifiants restent tels quels : seuls les thèmes de la banque sont montrés', () => {
    const same: ScopeBank = {
      topics: [
        { id: 'a', label: 'Thème a' },
        { id: 'b', label: 'Thème b' },
      ],
      questions: [
        { id: 'a-1', topicId: 'a', explainer: fiche },
        { id: 'a-2', topicId: 'a', explainer: fiche },
        { id: 'b-1', topicId: 'b', explainer: fiche },
      ],
    }
    const out = scopeSeries(all, undefined, [{ id: 'f', topicIds: ['a', 'b'] }], same)
    expect(out.map(s => [s.topicId, s.familyId, s.label])).toEqual([
      ['a', 'f', 'Thème a'],
      ['b', 'f', 'Thème b'],
    ])
    expect(out[0]!.videos.map(v => [v.questionIds, v.fiche])).toEqual([
      [['a-2', 'a-1'], 'a-2'],
      [['a-1'], 'a-1'],
      [[], 'a-1'],
      [[], 'a-1'],
    ])
  })
})

describe.each(elections.map(p => [p.election.id, p] as const))('catalogue de l’élection %s', (_id, pack) => {
  const groups = groupsOf(pack)
  const series = () => {
    setVideoScope(pack)
    return videoSeries()
  }

  it('les séries du catalogue sont celles de l’élection (scopeSeries), calculées une fois', () => {
    const shown = series()
    expect(shown).toEqual(scopeSeries(VIDEO_SERIES, pack.videoScope, groups, pack.bank))
    expect(videoSeries()).toBe(shown)
  })

  it('chaque série est trouvée par son thème, et chaque vidéo par son identifiant', () => {
    for (const s of series()) {
      expect(topicSeries(s.topicId), s.topicId).toBe(s)
      for (const v of s.videos) expect(videoById(v.id)?.video, v.id).toBe(v)
    }
  })

  it('chaque question éclairée par un approfondissement le retrouve', () => {
    for (const s of series()) {
      for (const v of s.videos.filter(x => x.kind === 'deep')) {
        for (const q of v.questionIds) {
          expect(pack.bank.questions.some(x => x.id === q), `${v.id} → ${q}`).toBe(true)
          expect(questionVideos(q).map(r => r.video.id), q).toContain(v.id)
        }
      }
    }
  })

  it('le fil contient toutes les séries de l’élection, dans l’ordre des familles', () => {
    const all = series()
    const feed = feedSeries(groups)
    expect(feed.length).toBe(all.length)
    const rank = (topicId: string) => groups.findIndex(g => g.topicIds.includes(topicId))
    for (let i = 1; i < feed.length; i++) expect(rank(feed[i]!.topicId)).toBeGreaterThanOrEqual(rank(feed[i - 1]!.topicId))
  })
})

describe('le catalogue suit l’élection affichée', () => {
  it('une élection qui ne reprend qu’une série ne montre qu’elle, sous ses questions à elle', () => {
    const source = elections.find(p => p.election.id === 'choisir-2027')!
    const retraites = source.bank.questions.filter(q => q.topicId === 'retraites').map(q => q.id)
    const [first, ...rest] = retraites
    // Une élection factice : la banque de la primaire, la seule série « retraites », une seule question reliée
    const other: ElectionPack = { ...source, videoScope: { topics: { retraites: 'retraites' }, questions: { [first!]: first! } } }
    setVideoScope(other)
    expect(videoSeries().map(s => s.topicId)).toEqual(['retraites'])
    expect(topicSeries('fiscalite')).toBeNull()
    expect(videoById('fiscalite-intro')).toBeNull()
    expect(questionVideos(first!).length).toBeGreaterThan(0)
    for (const q of rest) expect(questionVideos(q), q).toEqual([])
    // Retour à la primaire : toutes ses séries
    setVideoScope(source)
    expect(videoSeries().length).toBe(VIDEO_SERIES.length)
    expect(topicSeries('fiscalite')?.topicId).toBe('fiscalite')
  })

  it('le module que lit la feuille de pointage ne garde de l’élection ni ses candidats ni leurs positions', () => {
    const source = elections.find(p => p.election.id === 'choisir-2027')!
    setVideoScope(source)
    const kept = videoElection()!
    expect(Object.keys(kept).sort()).toEqual(['bank', 'topicGroups', 'videoScope'])
    expect(kept).not.toHaveProperty('positions')
    expect(kept).not.toHaveProperty('candidates')
    // Même élection, même objet : les séries ne sont pas recalculées à chaque rendu
    const shown = videoSeries()
    setVideoScope(source)
    expect(videoElection()).toBe(kept)
    expect(videoSeries()).toBe(shown)
  })

  it('aucun module des vidéos n’importe une élection : chacune leur est passée par setVideoScope', () => {
    const dir = resolve(ROOT, 'src/ui/videos')
    const files = (d: string): string[] =>
      readdirSync(d).flatMap(f => {
        const p = join(d, f)
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []
      })
    const offenders = files(dir).flatMap(file =>
      [...readFileSync(file, 'utf8').matchAll(/from\s+['"](\.[^'"]+)['"]/g)]
        .map(m => resolve(dirname(file), m[1]!))
        .filter(target => /[\\/]elections([\\/]|$)/.test(target))
        .map(target => `${file} → ${target}`),
    )
    expect(offenders).toEqual([])
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
