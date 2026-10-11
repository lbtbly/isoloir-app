// Piste C : chaque passage des séries a sa planche, et elle se retrouve dans son script (elle ne rend pas null,
// ce qui ferait tomber le passage sur le dessin générique). Une planche ne doit jamais lever d'erreur, à aucun
// instant du passage. Les séries sont vérifiées telles qu'écrites et telles que les montre chaque édition
// (editions/) : un passage corrigé y prend la planche de son identifiant suffixé, sinon celle du passage
// d'origine (sa planche propre d'abord, si l'édition n'en corrige que le dessin), comme dans pistes/C.tsx.

import { describe, expect, it } from 'vitest'
import { markerOf, partOf } from '../src/ui/videos/model'
import { EDITIONS, EDITION_SUFFIXES } from '../src/ui/videos/editions'
import { applyEdition, boardKeys } from '../src/ui/videos/editions/apply'
import { PLANCHES, generique } from '../src/ui/videos/pistes/planches'
import { VIDEO_SERIES } from '../src/ui/videos/series'
import type { PisteSegmentProps } from '../src/ui/videos/types'

const versions = [VIDEO_SERIES, ...Object.values(EDITIONS).map(e => VIDEO_SERIES.map(s => applyEdition(s, e)))]
const passages = versions.flat().flatMap(series =>
  series.videos.flatMap(script =>
    script.segments.map((segment, index): PisteSegmentProps => {
      const { part, of } = partOf(series, script)
      return {
        script,
        segment,
        index,
        playing: false,
        still: true,
        progress: 1,
        word: -1,
        meta: { topic: series.label, family: series.familyId, part, of, marker: markerOf(series, script), prompt: '' },
        context: 'site',
      }
    }),
  ),
)

const boardOf = (p: PisteSegmentProps) => boardKeys(p.segment, EDITION_SUFFIXES).map(k => PLANCHES[k]).find(Boolean)

describe('piste C', () => {
  it('a une planche par passage, et aucune planche orpheline', () => {
    const ids = new Set(passages.flatMap(p => [p.segment.id, p.segment.board ?? p.segment.id]))
    expect(passages.filter(p => !boardOf(p)).map(p => p.segment.id)).toEqual([])
    expect(Object.keys(PLANCHES).filter(id => !ids.has(id))).toEqual([])
  })

  it('chaque planche se retrouve dans son script (image fixe : tout est dit)', () => {
    const lost = passages.filter(p => boardOf(p)?.(p) === null).map(p => p.segment.id)
    expect(lost).toEqual([])
  })

  it('aucune planche ne lève d’erreur, du début à la fin du passage', () => {
    for (const p of passages) {
      for (const progress of [0, 0.3, 0.6, 1]) {
        expect(() => boardOf(p)?.({ ...p, still: false, playing: true, progress }), p.segment.id).not.toThrow()
      }
    }
  })

  it('le dessin générique sait dessiner chaque passage', () => {
    for (const p of passages) expect(() => generique(p)).not.toThrow()
  })
})
