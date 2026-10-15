// Le rangement des lignes du graphique « Sujet par sujet » de « Mon profil politique » (src/ui/profile/rows.ts) : quels
// sujets, dans quelle section, dans quel ordre. Un sujet, c'est un thème lu ; à défaut, sa famille entière, comme la
// synthèse du calcul. Sur des lectures factices (l'ordre), puis sur l'élection réelle (rien de perdu, rien en double).
import { describe, expect, it } from 'vitest'
import type { BlocCell, Mark, UnitReading, UnitStatus } from '../src/core/echiquier'
import { readEchiquier } from '../src/core/echiquier'
import { hashString, mulberry32 } from '../src/core/rng'
import type { Answers, TopicGroup } from '../src/core/types'
import { elections } from '../src/elections/all'
import { acrossCentre, atBothEnds, chartRows, unitKey } from '../src/ui/profile/rows'

/** Une lecture factice : statut, blocs ▲ et ▽ sur un axe de cinq blocs */
function unit(kind: 'theme' | 'famille', id: string, status: UnitStatus, near: number[] = [], far: number[] = []): UnitReading {
  const cells: BlocCell[] = [0, 1, 2, 3, 4].map(b => ({
    bloc: `b${b}`,
    known: [],
    affinity: null,
    chance: null,
    p: null,
    mark: (near.includes(b) ? 'pres' : far.includes(b) ? 'loin' : 'rien') as Mark,
  }))
  const twoSided = near.some((b, i) => i > 0 && b !== near[i - 1]! + 1)
  return { kind, id, topicIds: [id], questions: ['q1', 'q2'], status, cells, near, far, twoSided, exact: true, arrangements: 10, ways: 10, perCandidate: {} }
}
const label = (u: UnitReading) => u.id
const keys = (us: UnitReading[]) => us.map(unitKey)

describe('le rangement des lignes', () => {
  it('lus d’un seul côté : de la gauche vers la droite (premier bloc ▲, dernier, nombre de ▽, nom)', () => {
    const groups: TopicGroup[] = [{ id: 'g', label: 'G', topicIds: ['europe', 'logement', 'defense', 'sante', 'retraites', 'immigration', 'ukraine'] }]
    const themes = [
      unit('theme', 'europe', 'lecture', [3, 4]),
      unit('theme', 'logement', 'lecture', [0, 1]),
      unit('theme', 'defense', 'lecture', [0], [1]),
      unit('theme', 'sante', 'lecture', [0]),
      unit('theme', 'retraites', 'lecture', [0]),
      unit('theme', 'immigration', 'lecture', [3]),
      unit('theme', 'ukraine', 'lecture', [3]),
    ]
    const r = chartRows(groups, { themes, families: [] }, label)
    expect(keys(r.main)).toEqual(['theme-retraites', 'theme-sante', 'theme-defense', 'theme-logement', 'theme-immigration', 'theme-ukraine', 'theme-europe'])
    expect(r.both).toEqual([])
  })

  it('les deux bouts à part ; seulement plus loin, selon le premier bloc ▽ ; rien de net dans l’ordre des familles', () => {
    const groups: TopicGroup[] = [
      { id: 'g1', label: 'G1', topicIds: ['a', 'b', 'c'] },
      { id: 'g2', label: 'G2', topicIds: ['d', 'e'] },
    ]
    const themes = [unit('theme', 'a', 'lecture', [0, 4]), unit('theme', 'b', 'ecarts', [], [3]), unit('theme', 'c', 'aucun'), unit('theme', 'd', 'ecarts', [], [1]), unit('theme', 'e', 'aucun')]
    const r = chartRows(groups, { themes, families: [] }, label)
    expect(keys(r.both)).toEqual(['theme-a'])
    expect(keys(r.apart)).toEqual(['theme-d', 'theme-b'])
    expect(keys(r.flat)).toEqual(['theme-c', 'theme-e'])
  })

  it('à part, seulement de part et d’autre du centre sans lui : un bloc ▲ qui touche le centre reste dans la liste', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    const groups: TopicGroup[] = [{ id: 'g', label: 'G', topicIds: ids }]
    const themes = [
      unit('theme', 'a', 'lecture', [0, 2]),
      unit('theme', 'b', 'lecture', [2, 4]),
      unit('theme', 'c', 'lecture', [0, 2, 3]),
      unit('theme', 'd', 'lecture', [1, 2, 3]),
      unit('theme', 'e', 'lecture', [1, 3]),
      unit('theme', 'f', 'lecture', [0, 3]),
      unit('theme', 'g', 'lecture', [0, 1, 4]),
      unit('theme', 'h', 'lecture', [0, 4]),
    ]
    const r = chartRows(groups, { themes, families: [] }, label)
    // [0, 2] et [2, 4] touchent le centre : « ce n'est pas le centre » y serait faux ; leurs barres restent séparées
    expect(keys(r.main)).toEqual(['theme-a', 'theme-c', 'theme-d', 'theme-b'])
    expect(keys(r.both)).toEqual(['theme-e', 'theme-f', 'theme-g', 'theme-h'])
    expect(themes.map(acrossCentre)).toEqual([false, false, false, false, true, true, true, true])
    // « Aux deux bouts » : l'extrême gauche et l'extrême droite à la fois, seulement
    expect(themes.map(atBothEnds)).toEqual([false, false, false, false, false, false, true, true])
  })

  it('la famille entière, seulement quand aucun de ses thèmes ne se rapproche nettement d’un bloc ; ses thèmes sans lecture la nomment', () => {
    const groups: TopicGroup[] = [
      { id: 'lue', label: 'Lue', topicIds: ['t1', 't2'] },
      { id: 'cachee', label: 'Cachée', topicIds: ['t3', 't4'] },
      { id: 'muette', label: 'Muette', topicIds: ['t5', 't6'] },
      { id: 'seule', label: 'Seule', topicIds: ['t7', 't8'] },
    ]
    const themes = [
      unit('theme', 't1', 'une-question'),
      unit('theme', 't2', 'une-question'),
      unit('theme', 't3', 'lecture', [1]),
      unit('theme', 't4', 'une-question'),
      unit('theme', 't5', 'aucun'),
      unit('theme', 't6', 'une-question'),
      unit('theme', 't7', 'une-question'),
      unit('theme', 't8', 'blocs-inconnus'),
    ]
    const families = [unit('famille', 'lue', 'lecture', [3]), unit('famille', 'cachee', 'lecture', [2]), unit('famille', 'muette', 'aucun'), unit('famille', 'seule', 'aucun')]
    const r = chartRows(groups, { themes, families }, label)
    // « lue » : aucun thème mis à l'épreuve, la famille porte la lecture ; « cachée » : un thème lu suffit
    expect(keys(r.main)).toEqual(['theme-t3', 'famille-lue'])
    // « muette » : un thème rien de net, la famille rien de net n'ajoute rien ; « seule » : aucun thème à l'épreuve
    expect(keys(r.flat)).toEqual(['theme-t5', 'famille-seule'])
    expect(r.unread.map(x => [x.unit.id, x.family])).toEqual([
      ['t1', 'lue'],
      ['t2', 'lue'],
      ['t4', null],
      ['t6', null],
      ['t7', 'seule'],
      ['t8', 'seule'],
    ])
  })

  it('sur l’élection réelle : chaque thème répondu une fois, et seulement dans sa section', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const groups = pack.topicGroups ?? []
    for (const [seed, quick] of [
      ['complet', false],
      ['rapide', true],
    ] as const) {
      const r = mulberry32(hashString(seed))
      const answers: Answers = {}
      for (const q of pack.bank.questions) {
        if (quick && q.tier !== 'essentiel') continue
        const ratings: Record<string, 1 | -1> = {}
        for (const a of q.approaches) {
          const x = Math.floor(r() * 3) - 1
          if (x) ratings[a.id] = x as 1 | -1
        }
        if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
      }
      const reading = readEchiquier(pack, answers)
      const rows = chartRows(groups, reading, u => u.id)
      const placed = [...rows.main, ...rows.both, ...rows.apart, ...rows.flat, ...rows.unread.map(x => x.unit)]
      const themes = placed.filter(u => u.kind === 'theme')
      expect(new Set(keys(placed)).size, seed).toBe(placed.length)
      expect(themes.length, seed).toBe(reading.themes.length)
      for (const u of rows.main) expect(u.status === 'lecture' && !acrossCentre(u)).toBe(true)
      for (const u of rows.both) expect(u.status === 'lecture' && u.twoSided && acrossCentre(u)).toBe(true)
      for (const u of rows.apart) expect(u.status).toBe('ecarts')
      for (const u of rows.flat) expect(u.status).toBe('aucun')
      for (const { unit: u } of rows.unread) expect(['une-question', 'blocs-inconnus']).toContain(u.status)
      // Les lectures du graphique sont celles de la synthèse du calcul
      expect(new Set(keys([...rows.main, ...rows.both]))).toEqual(new Set(reading.summary.flatMap(g => g.items.map(unitKey))))
    }
  })
})
