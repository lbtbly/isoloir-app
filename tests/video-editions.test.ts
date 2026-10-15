// Éditions des séries vidéo (src/ui/videos/editions) : chaque correction vise une vidéo et un passage qui
// existent, les passages ajoutés portent le suffixe de l'édition, aucun identifiant n'est en double, les
// questions données en propre existent dans l'élection qui montre l'édition, et la série d'origine (l'archive de
// la primaire) reste intacte.
import { describe, expect, it } from 'vitest'
import { applyEdition, baseSegmentId } from '../src/ui/videos/editions/apply'
import { EDITIONS, EDITION_SUFFIXES } from '../src/ui/videos/editions'
import { SERIES_BY_TOPIC, VIDEO_SERIES } from '../src/ui/videos/series'
import { elections } from '../src/elections/all'

const before = JSON.stringify(VIDEO_SERIES)

describe('application d’une édition', () => {
  it('remplace les champs donnés, renomme un passage au texte dit changé, retire et insère', () => {
    const base = VIDEO_SERIES[0]!
    const v = base.videos[0]!
    const [s0, s1] = v.segments
    const edited = applyEdition(base, {
      id: 'essai',
      suffix: '-x',
      patches: {
        [base.topicId]: {
          videos: {
            [v.id]: {
              title: 'Titre',
              questionIds: ['q'],
              segments: { [s0!.id]: { say: 'Bonjour.' }, [s1!.id]: 'omit' },
              insert: [{ after: s0!.id, segment: { ...s0!, id: `${s0!.id}-nouveau-x`, say: 'Ajouté.' } }],
            },
          },
        },
      },
    })
    const ev = edited.videos.find(x => x.id === v.id)! as typeof v & { nativeQuestionIds?: true }
    expect(ev.title).toBe('Titre')
    expect(ev.questionIds).toEqual(['q'])
    expect(ev.nativeQuestionIds).toBe(true)
    expect(ev.segments[0]!.id).toBe(`${s0!.id}-x`)
    expect(ev.segments[1]!.id).toBe(`${s0!.id}-nouveau-x`)
    expect(ev.segments.some(s => s.id === s1!.id)).toBe(false)
    expect(baseSegmentId(`${s0!.id}-x`, ['-x'])).toBe(s0!.id)
    expect(JSON.stringify(VIDEO_SERIES)).toBe(before)
  })
})

for (const edition of Object.values(EDITIONS)) {
  const pack = elections.find(p => p.videoScope?.edition === edition.id)
  describe(`édition ${edition.id}`, () => {
    it('chaque correction vise une série, une vidéo et un passage qui existent', () => {
      for (const [topic, patch] of Object.entries(edition.patches)) {
        const base = SERIES_BY_TOPIC[topic]
        expect(base, topic).toBeTruthy()
        for (const [vid, vp] of Object.entries(patch.videos ?? {})) {
          const v = base!.videos.find(x => x.id === vid)
          expect(v, `${topic} / ${vid}`).toBeTruthy()
          const ids = new Set(v!.segments.map(s => s.id))
          for (const sid of Object.keys(vp.segments ?? {})) expect(ids.has(sid), `${vid} / ${sid}`).toBe(true)
          for (const ins of vp.insert ?? []) {
            if (ins.after !== null) expect(ids.has(ins.after), `${vid} : après ${ins.after}`).toBe(true)
            expect(ins.segment.id.endsWith(edition.suffix), ins.segment.id).toBe(true)
          }
        }
      }
    })

    it('aucun identifiant de passage en double, ni entre les séries ni avec l’origine', () => {
      const ids = VIDEO_SERIES.map(s => applyEdition(s, edition)).flatMap(s => s.videos.flatMap(v => v.segments.map(x => x.id)))
      expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
      expect(EDITION_SUFFIXES).toContain(edition.suffix)
    })

    it('les questions données en propre existent dans l’élection qui la montre', () => {
      expect(pack, 'une élection déclare cette édition').toBeTruthy()
      const known = new Set(pack!.bank.questions.map(q => q.id))
      for (const patch of Object.values(edition.patches))
        for (const [vid, vp] of Object.entries(patch.videos ?? {}))
          for (const q of vp.questionIds ?? []) expect(known.has(q), `${vid} : ${q}`).toBe(true)
    })
  })
}

// Décision du propriétaire du 2026-10-15 (suivi n° 3) : les passages d'une édition qui reprennent un chiffre de fiche
// « Comprendre l'enjeu » le gardent à la lettre (valeur, date, graphique, source), et leurs phrases disent ses
// nombres. Pas de règle générale : bien des passages -p27 portent des chiffres absents des fiches de leurs questions ;
// chaque paire est donc nommée ici, à compléter quand un autre passage est aligné sur une fiche.
const SYNCED: ReadonlyArray<{
  edition: string
  topic: string
  video: string
  /** Le passage qui porte le chiffre (figure, graphique) */
  figureSegment: string
  question: string
  figure: number
  /** Les passages dont les phrases (say) doivent dire chacun de ces nombres */
  says: Readonly<Record<string, readonly string[]>>
}> = [
  {
    edition: 'presidentielle-2027',
    topic: 'industrie_economie',
    video: 'industrie-etat',
    figureSegment: 'industrie-etat-02-p27',
    question: 'industrie_economie-3',
    figure: 0,
    says: {
      'industrie-etat-02-p27': ['87 entités', '229,6'],
      'industrie-etat-03-p27': ['77,6', '209,1'],
    },
  },
]

/** Espaces insécables ou fines ramenées à l'espace ordinaire, pour comparer les nombres */
const flat = (s: string | undefined) => (s ?? '').replace(/[\u00a0\u202f]/g, ' ')

describe('passages alignés sur une fiche « Comprendre l’enjeu »', () => {
  it.each(SYNCED)('$figureSegment reprend le chiffre n° $figure de $question', p => {
    const edition = EDITIONS[p.edition]!
    const pack = elections.find(x => x.videoScope?.edition === p.edition)!
    const series = applyEdition(SERIES_BY_TOPIC[p.topic]!, edition)
    const video = series.videos.find(v => v.id === p.video)!
    expect(video, p.video).toBeTruthy()
    const card = pack.bank.questions.find(q => q.id === p.question)?.explainer?.figures?.[p.figure]
    expect(card, `${p.question} : chiffre n° ${p.figure}`).toBeTruthy()
    const seg = video.segments.find(s => s.id === p.figureSegment)
    expect(seg?.figure, p.figureSegment).toBeTruthy()
    expect(flat(seg!.figure!.value)).toBe(flat(card!.value))
    expect(flat(seg!.figure!.date)).toBe(flat(card!.date))
    expect(seg!.chart).toEqual(card!.chart)
    expect(video.sources[seg!.figure!.sourceIndex]?.url).toBe(card!.source.url)
    // La valeur sans son unité (« 229,6 » de « 229,6 Md€ ») est dite par le passage du chiffre
    const bare = flat(card!.value).replace(/\s*[^\d\s,.]+$/, '')
    expect(flat(seg!.say)).toContain(bare)
    for (const [id, needles] of Object.entries(p.says)) {
      const s = video.segments.find(x => x.id === id)
      expect(s, id).toBeTruthy()
      for (const n of needles) expect(flat(s!.say), `${id} : « ${n} »`).toContain(n)
    }
  })
})
