// Vidéos « Les sujets » : intégrité des séries (structure, identifiants, chiffres, sources, voix, neutralité,
// typographie, planches), repères de série, et chronologie sans voix (sous-titres seuls). Tout est vérifié de
// façon générique, pour chaque série présente ou à venir (une par fichier, src/ui/videos/series/<thème>.ts ;
// règles d'écriture : src/ui/videos/GUIDE-SERIES.md). Les voix enregistrées (chemins, empreinte, inventaire,
// voix unique) : voices.test.ts ; les planches dessinées : piste-c.test.ts.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { choisir2027 } from '../src/elections/choisir-2027'
import { audioPath, GAP_MS, segmentMs } from '../src/ui/videos/audio'
import { chartOf, durationLabel, holdMs, markerOf, wordsOf } from '../src/ui/videos/model'
import { Narrator, type NarrationState } from '../src/ui/videos/narration'
import { PLANCHES_BY_TOPIC } from '../src/ui/videos/pistes/planches'
import { SERIES_BY_TOPIC, VIDEO_SERIES } from '../src/ui/videos/series'

const { bank, candidates } = choisir2027
const groups = choisir2027.topicGroups ?? []
const videos = VIDEO_SERIES.flatMap(s => s.videos)
const segments = videos.flatMap(v => v.segments.map(s => ({ video: v, segment: s })))
const fold = (s: string) => s.toLowerCase().replace(/[\u00a0\u202f]/g, ' ')
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Passages au plus par série (GUIDE-SERIES.md) ; Retraites, validée avant la règle, garde ses 53 passages */
const MAX_PER_SERIES = 45
const VALIDATED_BEFORE_RULE: Record<string, number> = { retraites: 53 }

describe('séries de vidéos', () => {
  it('un fichier par thème de la banque ; chaque série écrite porte le thème de son fichier', () => {
    expect(Object.keys(SERIES_BY_TOPIC).sort()).toEqual(bank.topics.map(t => t.id).sort())
    for (const [topicId, s] of Object.entries(SERIES_BY_TOPIC)) if (s) expect(s.topicId, topicId).toBe(topicId)
  })

  it('séries rangées dans l’ordre des familles, puis des thèmes dans leur famille (groups.ts)', () => {
    const order = groups.flatMap(g => g.topicIds)
    expect(VIDEO_SERIES.map(s => s.topicId)).toEqual(order.filter(id => SERIES_BY_TOPIC[id]))
  })

  it('une série par thème, rangée dans la famille de son thème, l’introduction d’abord', () => {
    const topics = VIDEO_SERIES.map(s => s.topicId)
    expect(new Set(topics).size).toBe(topics.length)
    for (const s of VIDEO_SERIES) {
      const topic = bank.topics.find(t => t.id === s.topicId)
      expect(topic, s.topicId).toBeTruthy()
      expect(s.label, s.topicId).toBe(topic?.label)
      expect(groups.find(g => g.topicIds.includes(s.topicId))?.id, s.topicId).toBe(s.familyId)
      expect(s.videos[0]?.kind, s.topicId).toBe('intro')
      expect(s.videos[0]?.short, s.topicId).toBe('Introduction')
      expect(s.videos.slice(1).every(v => v.kind === 'deep'), s.topicId).toBe(true)
      expect(s.videos.length, s.topicId).toBeGreaterThan(1)
    }
  })

  it('6 à 12 passages par vidéo, 45 au plus par série ; titres de 45 signes au plus ; vouvoiement', () => {
    for (const s of VIDEO_SERIES) {
      const n = s.videos.reduce((t, v) => t + v.segments.length, 0)
      expect(n, `${s.topicId} : ${n} passages`).toBeLessThanOrEqual(VALIDATED_BEFORE_RULE[s.topicId] ?? MAX_PER_SERIES)
      for (const v of s.videos) {
        expect(v.segments.length, v.id).toBeGreaterThanOrEqual(6)
        expect(v.segments.length, v.id).toBeLessThanOrEqual(12)
        expect(v.title.trim().length, v.id).toBeGreaterThan(0)
        expect([...v.title].length, `${v.id} : « ${v.title} »`).toBeLessThanOrEqual(45)
        expect(v.short.trim().length, v.id).toBeGreaterThan(0)
        expect(v.register, v.id).toBe('vous')
      }
    }
  })

  it('identifiants uniques, sûrs pour un chemin de fichier : <thème>-<vidéo>, puis <vidéo>-01, -02…', () => {
    const ids = videos.map(v => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    const segIds = segments.map(x => x.segment.id)
    expect(new Set(segIds).size).toBe(segIds.length)
    for (const s of VIDEO_SERIES) {
      // Le préfixe de la série : celui de son introduction (« retraites-intro » → « retraites »)
      const intro = s.videos[0]!.id
      expect(intro, s.topicId).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*-intro$/)
      const prefix = intro.slice(0, -'-intro'.length)
      for (const v of s.videos) {
        expect(v.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
        expect(v.id.startsWith(`${prefix}-`), `${v.id} hors du préfixe « ${prefix} »`).toBe(true)
        v.segments.forEach((segment, i) => {
          expect(segment.id).toBe(`${v.id}-${String(i + 1).padStart(2, '0')}`)
          expect(audioPath('aigue', v.id, segment.id)).toBe(`videos/audio/aigue/${v.id}/${segment.id}.m4a`)
        })
      }
    }
    // Aucun préfixe d'une série n'en recouvre un autre (« sante » et « sante-mentale ») : chaque fichier audio
    // se rattache à une seule série
    const prefixes = VIDEO_SERIES.map(s => s.videos[0]!.id.slice(0, -'-intro'.length))
    for (const a of prefixes) for (const b of prefixes) if (a !== b) expect(b.startsWith(`${a}-`), `${a} / ${b}`).toBe(false)
  })

  it('chaque vidéo mène à des questions de son thème et cite des sources complètes', () => {
    for (const s of VIDEO_SERIES) {
      for (const v of s.videos) {
        expect(v.questionIds.length, v.id).toBeGreaterThan(0)
        for (const q of v.questionIds) {
          const question = bank.questions.find(x => x.id === q)
          expect(question, `${v.id} → ${q}`).toBeTruthy()
          expect(question?.topicId, `${v.id} → ${q}`).toBe(s.topicId)
        }
        expect(v.sources.length, v.id).toBeGreaterThan(0)
        for (const src of v.sources) {
          expect(src.url, v.id).toMatch(/^https:\/\/\S+$/)
          expect(src.title.trim().length, v.id).toBeGreaterThan(0)
        }
      }
    }
  })

  it('exhaustivité : chaque thème a sa série, chaque question au moins un approfondissement', () => {
    expect(bank.topics.filter(t => !SERIES_BY_TOPIC[t.id]).map(t => t.id)).toEqual([])
    const deep = new Set(videos.filter(v => v.kind === 'deep').flatMap(v => v.questionIds))
    expect(bank.questions.filter(q => !deep.has(q.id)).map(q => q.id)).toEqual([])
  })

  it('mots mis en valeur écrits comme dans le texte dit, chiffres rattachés à une source existante', () => {
    for (const { video, segment } of segments) {
      expect(segment.say.trim().length, segment.id).toBeGreaterThan(0)
      expect(segment.draw.trim().length, segment.id).toBeGreaterThan(0)
      expect((segment.emphasis ?? []).length, segment.id).toBeLessThanOrEqual(3)
      for (const e of segment.emphasis ?? []) {
        expect(e.trim().length, segment.id).toBeGreaterThan(0)
        expect(fold(segment.say).includes(fold(e)), `${segment.id} : « ${e} »`).toBe(true)
      }
      if (segment.figure) {
        const { sourceIndex, value, label } = segment.figure
        expect(Number.isInteger(sourceIndex) && sourceIndex >= 0, `${segment.id} : sourceIndex ${sourceIndex}`).toBe(true)
        expect(video.sources[sourceIndex], `${segment.id} : sourceIndex ${sourceIndex}`).toBeTruthy()
        expect(value.trim().length, segment.id).toBeGreaterThan(0)
        expect(label.trim().length, segment.id).toBeGreaterThan(0)
      }
      // Un graphique doit avoir une forme que la piste sait dessiner (sinon il serait ignoré sans bruit)
      if (segment.chart !== undefined) expect(chartOf(segment), `${segment.id} : chart`).not.toBeNull()
    }
  })

  it('voix : un « spoken » dès qu’un chiffre est écrit, sans chiffre ni espace insécable', () => {
    for (const { segment } of segments) {
      if (/\d/.test(segment.say)) expect(segment.spoken, `${segment.id} : chiffres sans « spoken »`).toBeTruthy()
      if (segment.spoken === undefined) continue
      const spoken = segment.spoken
      expect(spoken.trim(), segment.id).toBe(spoken)
      expect(spoken.length, segment.id).toBeGreaterThan(0)
      expect(/\d/.test(spoken), `${segment.id} : chiffre dans « ${spoken} »`).toBe(false)
      expect(/[\u00a0\u202f]| {2}/.test(spoken), `${segment.id} : espaces du « spoken »`).toBe(false)
    }
  })

  it('neutralité : aucun candidat, aucun parti, aucun appel à donner son avis dans ce qui est dit ou titré', () => {
    const names = candidates.flatMap(c => [c.name.split(' ').slice(1).join(' '), c.affiliation]).filter(n => n.length > 3).map(norm)
    for (const v of videos) {
      const texts = [v.title, v.short, ...v.segments.flatMap(s => [s.say, s.spoken ?? '', s.alt ?? '', s.figure?.label ?? ''])]
      for (const t of texts) {
        for (const n of names) expect(norm(t).includes(n), `${v.id} cite « ${n} »`).toBe(false)
        expect(/donnez votre avis|isoloir/i.test(t), `${v.id} : « ${t} »`).toBe(false)
        // Sigles de partis et d'alliances, en capitales (« PS », pas « ps » dans un mot)
        expect(/\b(PS|LFI|PCF|EELV|RN|LR|NFP|NUPES|Nupes|GRS|UDI|MoDem)\b/.test(t), `${v.id} : « ${t} »`).toBe(false)
      }
    }
  })

  it('typographie : pas d’espace ordinaire avant « ? ! : ; % », guillemets et apostrophes français', () => {
    for (const v of videos) {
      for (const t of [v.title, v.short]) {
        expect(/ [?!:;%]/.test(t), `${v.id} : ${t}`).toBe(false)
        expect(/["']/.test(t), `${v.id} : ${t}`).toBe(false)
      }
    }
    for (const { segment } of segments) {
      for (const t of [segment.say, segment.alt ?? '']) {
        expect(/ [?!:;%]/.test(t), `${segment.id} : ${t}`).toBe(false)
        expect(/["']/.test(t), `${segment.id} : ${t}`).toBe(false)
      }
    }
  })

  it('planches : chacune rattachée à un passage de la série de son thème', () => {
    expect(Object.keys(PLANCHES_BY_TOPIC).sort()).toEqual(Object.keys(SERIES_BY_TOPIC).sort())
    for (const [topicId, boards] of Object.entries(PLANCHES_BY_TOPIC)) {
      const ids = new Set(SERIES_BY_TOPIC[topicId]?.videos.flatMap(v => v.segments.map(s => s.id)) ?? [])
      expect(Object.keys(boards).filter(id => !ids.has(id)), topicId).toEqual([])
    }
  })
})

describe('repères de série', () => {
  const retraites = VIDEO_SERIES.find(s => s.topicId === 'retraites')!
  it('introduction, puis « n sur N — nom court »', () => {
    expect(markerOf(retraites, retraites.videos[0]!)).toBe('Retraites · Introduction')
    expect(markerOf(retraites, retraites.videos[1]!)).toBe('Retraites · 1\u00a0sur\u00a04\u00a0— Âge de départ')
  })
  it('durées parlées', () => {
    expect(durationLabel(43)).toBe('45\u00a0s')
    expect(durationLabel(71)).toBe('1\u00a0min 10\u00a0s')
    expect(durationLabel(120)).toBe('2\u00a0min')
    expect(durationLabel(361)).toBe('6\u00a0min')
  })
})

describe('chronologie sans voix', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('les passages se suivent au rythme estimé, le mot courant avance, la vidéo finit', () => {
    // Hors navigateur : la fenêtre et les images d'animation, sur les minuteries simulées
    const g = globalThis as unknown as {
      window?: unknown
      requestAnimationFrame?: (cb: (t: number) => void) => number
      cancelAnimationFrame?: (id: number) => void
    }
    const hadWindow = 'window' in g
    if (!hadWindow) {
      g.window = globalThis
      g.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16) as unknown as number
      g.cancelAnimationFrame = id => clearTimeout(id)
    }
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] })
    try {
      const video = videos[0]!
      const states: NarrationState[] = []
      const n = new Narrator(video, s => states.push(s))
      n.setVoice(true)
      n.play()
      const first = segmentMs(video.id, video.segments[0]!)
      vi.advanceTimersByTime(first / 2)
      const mid = states.at(-1)!
      expect(mid.index).toBe(0)
      expect(mid.voiced).toBe(false)
      expect(mid.word).toBeGreaterThan(0)
      expect(mid.word).toBeLessThan(wordsOf(video.segments[0]!.say).length)
      vi.advanceTimersByTime(first / 2 + GAP_MS + 50)
      expect(states.at(-1)!.index).toBe(1)
      // Pause : rien ne bouge
      n.pause()
      const held = states.at(-1)!
      vi.advanceTimersByTime(5000)
      expect(states.at(-1)).toEqual(held)
      n.play()
      // Avec la pose de fin des passages dont le dernier mot mis en valeur vient tard
      const total = video.segments.reduce((t, s) => t + segmentMs(video.id, s) + holdMs(s, segmentMs(video.id, s)) + GAP_MS, 0)
      vi.advanceTimersByTime(total + 1000)
      expect(states.at(-1)!.ended).toBe(true)
      expect(states.at(-1)!.index).toBe(video.segments.length - 1)
      n.dispose()
    } finally {
      if (!hadWindow) {
        delete g.window
        delete g.requestAnimationFrame
        delete g.cancelAnimationFrame
      }
    }
  })
})
