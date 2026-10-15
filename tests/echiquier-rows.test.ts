// Le rangement des lignes du graphique « Domaine par domaine » de « Mon profil politique » (src/ui/profile/rows.ts) :
// quels sujets, sous quel domaine, dans quel groupe, dans quel ordre (variante a′, décision du propriétaire du 15
// octobre 2026). Un sujet, c'est un thème lu ; à défaut, sa famille entière, comme la synthèse du calcul. Sur des
// lectures factices (l'ordre), puis sur l'élection réelle (rien de perdu, rien en double) ; les avis uniformes ; l'état
// de la tête du graphique (l'affichage dédié, D1), qui ne dit une cause que quand elle est vraie ; enfin les lignes rouges
// et les priorités (lot 2), posées sur les lignes sans rien changer aux lectures.
import { describe, expect, it } from 'vitest'
import { hasOpinion } from '../src/core/answers'
import type { BlocCell, Mark, UnitReading, UnitStatus } from '../src/core/echiquier'
import { panelOf, readEchiquier } from '../src/core/echiquier'
import { hashString, mulberry32 } from '../src/core/rng'
import { computeResults, type DealbreakerHit } from '../src/core/score'
import type { Answers, TopicGroup } from '../src/core/types'
import { elections } from '../src/elections/all'
import { nothingAnywhere } from '../src/core/echiquierCopy'
import {
  acrossCentre,
  atBothEnds,
  chartRows,
  crossedBy,
  crossingsOf,
  GROUP_ORDER,
  groupOf,
  headOf,
  hitsOf,
  priorityTopics,
  uniformViews,
  unitKey,
  type ChartRows,
} from '../src/ui/profile/rows'
import { profilesFor } from './fixtures/echiquier-profiles'

/**
 * Une lecture factice : statut, blocs ▲ et ▽ sur un axe de cinq blocs ; ways, ses façons de poser les mêmes avis ;
 * distinct, un bloc nettement à l'écart des autres façons (toujours d'une lecture ou d'écarts)
 */
function unit(
  kind: 'theme' | 'famille',
  id: string,
  status: UnitStatus,
  near: number[] = [],
  far: number[] = [],
  ways = 10,
  distinct = status === 'lecture' || status === 'ecarts',
): UnitReading {
  const cells: BlocCell[] = [0, 1, 2, 3, 4].map(b => ({
    bloc: `b${b}`,
    known: [],
    affinity: null,
    chance: null,
    p: null,
    alike: null,
    mark: (near.includes(b) ? 'pres' : far.includes(b) ? 'loin' : 'rien') as Mark,
  }))
  const twoSided = near.some((b, i) => i > 0 && b !== near[i - 1]! + 1)
  return { kind, id, topicIds: [id], questions: ['q1', 'q2'], status, cells, near, far, twoSided, distinct, exact: true, arrangements: ways, ways, perCandidate: {} }
}
const label = (u: UnitReading) => u.id
const keys = (us: UnitReading[]) => us.map(unitKey)
/** Les groupes d'un domaine, en clés : { net: [...], flat: [...] } */
const groupsOf = (r: ChartRows, id: string) => Object.fromEntries(r.families.find(f => f.id === id)!.groups.map(g => [g.kind, keys(g.rows)]))

describe('le rangement des lignes, domaine par domaine', () => {
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
    expect(keys(r.read)).toEqual(['theme-retraites', 'theme-sante', 'theme-defense', 'theme-logement', 'theme-immigration', 'theme-ukraine', 'theme-europe'])
    expect(groupsOf(r, 'g')).toEqual({ net: keys(r.read) })
  })

  it('les domaines dans l’ordre des familles ; dans chacun, net, des deux côtés, plus loin, rien de net, une question, blocs inconnus', () => {
    const groups: TopicGroup[] = [
      { id: 'g1', label: 'G1', topicIds: ['a', 'b', 'c', 'h', 'i'] },
      { id: 'g2', label: 'G2', topicIds: ['d', 'e', 'f', 'g'] },
      { id: 'vide', label: 'Vide', topicIds: ['z'] },
      { id: 'seul', label: 'Seul', topicIds: ['s'] },
    ]
    const themes = [
      unit('theme', 'a', 'lecture', [0, 4]),
      unit('theme', 'b', 'ecarts', [], [3]),
      unit('theme', 'c', 'aucun'),
      unit('theme', 'h', 'une-question'),
      unit('theme', 'i', 'lecture', [2]),
      unit('theme', 'd', 'ecarts', [], [1]),
      unit('theme', 'e', 'aucun'),
      unit('theme', 'f', 'blocs-inconnus'),
      unit('theme', 'g', 'ecarts', [], [0]),
      unit('theme', 's', 'aucun'),
    ]
    const r = chartRows(groups, { themes, families: [] }, label)
    // Un domaine sans réponse n'a pas de place ; un domaine d'un seul thème n'a pas d'intertitre
    expect(r.families.map(f => [f.id, f.heading])).toEqual([
      ['g1', true],
      ['g2', true],
      ['seul', false],
    ])
    expect(groupsOf(r, 'g1')).toEqual({ net: ['theme-i'], both: ['theme-a'], apart: ['theme-b'], flat: ['theme-c'], thin: ['theme-h'] })
    // Plus loin, selon le premier bloc ▽
    expect(groupsOf(r, 'g2')).toEqual({ apart: ['theme-g', 'theme-d'], flat: ['theme-e'], unknown: ['theme-f'] })
    for (const f of r.families) expect(f.groups.map(g => GROUP_ORDER.indexOf(g.kind))).toEqual(f.groups.map(g => GROUP_ORDER.indexOf(g.kind)).sort((x, y) => x - y))
    // Les listes de la page, dans son ordre : celui des domaines, puis de leurs groupes
    expect(keys(r.read)).toEqual(['theme-i', 'theme-a'])
    expect(keys(r.apart)).toEqual(['theme-b', 'theme-g', 'theme-d'])
    expect(keys(r.flat)).toEqual(['theme-c', 'theme-e', 'theme-s'])
    expect(r.unread.map(x => unitKey(x.unit))).toEqual(['theme-h', 'theme-f'])
  })

  it('à part, seulement de part et d’autre du centre sans lui : un bloc ▲ qui touche le centre reste avec les autres', () => {
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
    // [0, 2] et [2, 4] touchent le centre : « ce n'est pas le centre » y serait faux ; leurs lignes restent avec les autres
    expect(groupsOf(r, 'g')).toEqual({ net: ['theme-a', 'theme-c', 'theme-d', 'theme-b'], both: ['theme-e', 'theme-f', 'theme-g', 'theme-h'] })
    expect(themes.map(acrossCentre)).toEqual([false, false, false, false, true, true, true, true])
    expect(themes.map(groupOf)).toEqual(['net', 'net', 'net', 'net', 'both', 'both', 'both', 'both'])
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
    // « lue » : aucun thème mis à l'épreuve, la famille porte la lecture, sous son domaine ; « cachée » : un thème lu suffit
    expect(groupsOf(r, 'lue')).toEqual({ net: ['famille-lue'], thin: ['theme-t1', 'theme-t2'] })
    expect(groupsOf(r, 'cachee')).toEqual({ net: ['theme-t3'], thin: ['theme-t4'] })
    // « muette » : un thème rien de net, la famille rien de net n'ajoute rien ; « seule » : aucun thème à l'épreuve
    expect(groupsOf(r, 'muette')).toEqual({ flat: ['theme-t5'], thin: ['theme-t6'] })
    expect(groupsOf(r, 'seule')).toEqual({ flat: ['famille-seule'], thin: ['theme-t7'], unknown: ['theme-t8'] })
    expect(keys(r.read)).toEqual(['famille-lue', 'theme-t3'])
    expect(r.unread.map(x => [x.unit.id, x.family])).toEqual([
      ['t1', 'lue'],
      ['t2', 'lue'],
      ['t4', null],
      ['t6', null],
      ['t7', 'seule'],
      ['t8', 'seule'],
    ])
  })

  it('sur l’élection réelle : chaque thème répondu une fois, sous son domaine et dans son groupe', () => {
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
      const placed = rows.families.flatMap(f => f.groups.flatMap(g => g.rows))
      const themes = placed.filter(u => u.kind === 'theme')
      expect(new Set(keys(placed)).size, seed).toBe(placed.length)
      expect(themes.length, seed).toBe(reading.themes.length)
      // Les domaines, dans l'ordre des familles ; chaque ligne sous le sien, dans le groupe de sa lecture
      expect(rows.families.map(f => f.id), seed).toEqual(groups.filter(g => rows.families.some(f => f.id === g.id)).map(g => g.id))
      for (const f of rows.families) {
        const g = groups.find(x => x.id === f.id)!
        for (const { kind, rows: list } of f.groups) for (const u of list) {
          expect(u.kind === 'famille' ? u.id : g.topicIds.includes(u.id), `${seed} ${unitKey(u)}`).toBe(u.kind === 'famille' ? f.id : true)
          expect(groupOf(u), `${seed} ${unitKey(u)}`).toBe(kind)
        }
      }
      // Les lectures du graphique sont celles de la synthèse du calcul
      expect(new Set(keys(rows.read))).toEqual(new Set(reading.summary.flatMap(g => g.items.map(unitKey))))
      for (const u of rows.apart) expect(u.status).toBe('ecarts')
      for (const u of rows.flat) expect(u.status).toBe('aucun')
      for (const { unit: u } of rows.unread) expect(['une-question', 'blocs-inconnus']).toContain(u.status)
    }
  })
})

describe('avis uniformes', () => {
  const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
  const all = (v: 1 | -1): Answers => Object.fromEntries(pack.bank.questions.map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, v])), redLines: [] }]))

  it('le même avis à toutes les approches de chaque question répondue ; une seule façon de les poser partout', () => {
    for (const v of [1, -1] as const) {
      expect(uniformViews(pack.bank.questions, all(v))).toBe(true)
      const e = readEchiquier(pack, all(v))
      expect([...e.themes, ...e.families].every(u => u.ways === 1 && u.status === 'aucun')).toBe(true)
    }
    // Une seule question où les avis diffèrent, ou un « sans avis » parmi des « d'accord » : ce n'est plus uniforme
    const mixed = all(1)
    const q = pack.bank.questions[0]!
    mixed[q.id] = { ratings: { ...mixed[q.id]!.ratings, [q.approaches[1]!.id]: -1 }, redLines: [] }
    expect(uniformViews(pack.bank.questions, mixed)).toBe(false)
    const blank = all(1)
    const rest = { ...blank[q.id]!.ratings }
    delete rest[q.approaches[0]!.id]
    blank[q.id] = { ratings: rest, redLines: [] }
    expect(uniformViews(pack.bank.questions, blank)).toBe(false)
    // Aucun avis : rien d'uniforme à dire
    expect(uniformViews(pack.bank.questions, {})).toBe(false)
  })
})

describe('la tête du graphique : l’état de l’affichage dédié, et ce qu’il dit de plus seulement quand c’est vrai', () => {
  const rowsOf = (read: UnitReading[], apart: UnitReading[], flat: UnitReading[]) => ({ read, apart, flat })
  const lu = unit('theme', 'a', 'lecture', [1])
  const loin = unit('theme', 'b', 'ecarts', [], [3])
  const rien = (ways = 252, distinct = false) => unit('theme', 'c', 'aucun', [], [], ways, distinct)
  const off = { uniform: false, quickOnly: false, hasDeeper: false }

  it('dans cet ordre : aucun sujet à l’épreuve, avis uniformes, des lectures nettes, seulement des écarts, rien de net', () => {
    expect(headOf(rowsOf([], [], []), [], { ...off, uniform: true }).state).toBe('untestable')
    expect(headOf(rowsOf([lu], [], [rien(1)]), [], { ...off, uniform: true }).state).toBe('uniform')
    expect(headOf(rowsOf([lu], [loin], [rien()]), [], off).state).toBe('read')
    expect(headOf(rowsOf([], [loin], [rien()]), [], off).state).toBe('apart')
    expect(headOf(rowsOf([], [], [rien()]), [], off).state).toBe('nothing')
    // Une cause, seulement avec C5
    for (const h of [headOf(rowsOf([lu], [], [rien(1)]), [], off), headOf(rowsOf([], [loin], [rien(1)]), [], off)]) expect(h.cause).toBeNull()
  })

  it('rien de net nulle part : la cause certaine au rapide, sinon « trop peu de façons » ou « ne se distinguent pas » quand c’est vrai de chaque sujet', () => {
    const half = [unit('theme', 'x', 'une-question'), unit('theme', 'y', 'une-question'), rien()]
    expect(headOf(rowsOf([], [], [rien()]), half, { ...off, quickOnly: true }).cause).toBe('quick')
    // Au rapide, mais la moitié des thèmes au plus sur une seule question : pas cette cause
    expect(headOf(rowsOf([], [], [rien()]), half.slice(1), { ...off, quickOnly: true }).cause).toBe('alike')
    expect(headOf(rowsOf([], [], [rien(), rien(10)]), [], off).cause).toBe('alike')
    expect(headOf(rowsOf([], [], [rien(1), rien(6), rien(9)]), [], off).cause).toBe('few')
    // Un bloc nettement à l'écart des autres façons, trop près de 50 % ; ou des sujets de chaque sorte : rien de plus
    expect(headOf(rowsOf([], [], [rien(), rien(252, true)]), [], off).cause).toBeNull()
    expect(headOf(rowsOf([], [], [rien(), rien(1)]), [], off).cause).toBeNull()
  })

  it('la fiche « Pour lire plus de thèmes » s’ouvre sous le compte au seul questionnaire rapide et quand rien n’est net nulle part', () => {
    const on = { ...off, hasDeeper: true }
    expect(headOf(rowsOf([], [], [rien()]), [], on).deeperOnTop).toBe(true)
    expect(headOf(rowsOf([lu], [], []), [], { ...on, quickOnly: true }).deeperOnTop).toBe(true)
    expect(headOf(rowsOf([lu], [], []), [], on).deeperOnTop).toBe(false)
    expect(headOf(rowsOf([], [loin], []), [], on).deeperOnTop).toBe(false)
    expect(headOf(rowsOf([], [], []), [], { ...on, quickOnly: true }).deeperOnTop).toBe(false)
    expect(headOf(rowsOf([], [], [rien()]), [], off).deeperOnTop).toBe(false)
  })

  it('sur l’élection réelle : une seule façon sur le seul sujet mis à l’épreuve, des avis mêlés ailleurs (contre-vérification du 15 octobre 2026)', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const quick = pack.bank.questions.filter(q => q.tier === 'essentiel')
    const justice = quick.filter(q => q.topicId === 'securite_justice')
    expect(justice.length).toBeGreaterThanOrEqual(2)
    const family = (topicId: string) => pack.topicGroups!.find(g => g.topicIds.includes(topicId))!.id
    const other = quick.find(q => family(q.topicId) !== family('securite_justice'))!
    const answers: Answers = Object.fromEntries(justice.map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, 1 as const])), redLines: [] }]))
    answers[other.id] = { ratings: { [other.approaches[0]!.id]: 1, [other.approaches[1]!.id]: -1 }, redLines: [] }
    const reading = readEchiquier(pack, answers)
    const rows = chartRows(pack.topicGroups!, reading, u => u.id)
    expect(uniformViews(pack.bank.questions, answers)).toBe(false)
    expect(keys(rows.flat)).toEqual(['theme-securite_justice'])
    expect(rows.flat[0]!.ways).toBe(1)
    const head = headOf(rows, reading.themes, { uniform: false, quickOnly: true, hasDeeper: true })
    expect(head).toEqual({ state: 'nothing', cause: 'few', deeperOnTop: true })
    // La tête ne dit plus « ne se distinguent pas assez des autres façons » au-dessus d'une ligne qui dit « rien à comparer »
    expect(nothingAnywhere(head.cause).join('')).not.toMatch(/distinguent/)
  })
})

describe('lignes rouges et priorités (lot 2) : posées sur les lignes, sans rien changer aux lectures', () => {
  const hit = (questionId: string, approachId: string, level: DealbreakerHit['level'] = 'touche'): DealbreakerHit => ({ questionId, approachId, level })
  const panel = [['arthaud', 'kazib', 'labib'], ['glucksmann'], ['attal'], ['retailleau'], ['lepen', 'zemmour']]
  const topicOf = (q: string) => ({ q1: 'retraites', q2: 'retraites', q3: 'logement', q9: 'europe' })[q]

  it('la croix : sous un bloc nettement plus près seulement, pour une ligne rouge posée sur une question de la ligne', () => {
    const u = { ...unit('theme', 'retraites', 'lecture', [0], [4]), topicIds: ['retraites'], questions: ['q1', 'q2'] }
    const hits = new Map([
      ['labib', [hit('q1', 'a')]],
      ['arthaud', [hit('q2', 'b')]],
      // Une ligne rouge ailleurs que sur la ligne : rien
      ['kazib', [hit('q9', 'c')]],
      // Sous un bloc nettement plus loin, ou sans lecture nette : rien
      ['lepen', [hit('q1', 'a')]],
      ['glucksmann', [hit('q1', 'a')]],
    ])
    const c = crossingsOf(u, panel, hits, topicOf)
    expect(c.map(g => g.length)).toEqual([1, 0, 0, 0, 0])
    // Les noms dans l'ordre de l'axe (alphabétique au sein du bloc), groupés : autant de lignes rouges, de la même façon
    expect(c[0]).toEqual([{ ids: ['arthaud', 'labib'], level: 'touche', count: 1, topics: ['retraites'] }])
  })

  it('« pourrait franchir », deux lignes rouges, les deux à la fois : un groupe chacun ; une ligne de famille dit les thèmes', () => {
    const u = { ...unit('famille', 'social', 'lecture', [0, 4]), topicIds: ['retraites', 'logement'], questions: ['q1', 'q2', 'q3'] }
    const hits = new Map([
      ['arthaud', [hit('q1', 'a', 'possible')]],
      ['kazib', [hit('q1', 'a'), hit('q2', 'b')]],
      ['labib', [hit('q3', 'd', 'possible'), hit('q1', 'a')]],
      ['zemmour', [hit('q3', 'd')]],
      ['lepen', [hit('q3', 'd')]],
    ])
    const c = crossingsOf(u, panel, hits, topicOf)
    expect(c[0]).toEqual([
      { ids: ['arthaud'], level: 'possible', count: 1, topics: ['retraites'] },
      { ids: ['kazib'], level: 'touche', count: 2, topics: ['retraites'] },
      // Une ligne rouge sûrement franchie : seules celles-là comptent (le détail dit le reste)
      { ids: ['labib'], level: 'touche', count: 1, topics: ['retraites'] },
    ])
    // Les thèmes dans l'ordre de la banque, pas celui des lignes rouges
    const both = crossingsOf(u, panel, new Map([['kazib', [hit('q3', 'd'), hit('q1', 'a')]]]), topicOf)
    expect(both[0]).toEqual([{ ids: ['kazib'], level: 'touche', count: 2, topics: ['retraites', 'logement'] }])
    expect(c[4]).toEqual([{ ids: ['lepen', 'zemmour'], level: 'touche', count: 1, topics: ['logement'] }])
  })

  it('le détail : qui franchit une ligne rouge, dans l’ordre de la grille puis alphabétique ; la position déduite à part', () => {
    const hits = new Map([
      ['zemmour', [hit('q1', 'a')]],
      ['retailleau', [hit('q1', 'a', 'possible')]],
      ['arthaud', [hit('q1', 'a'), hit('q1', 'b')]],
      ['kazib', [hit('q1', 'b')]],
    ])
    expect(crossedBy('q1', 'a', panel, hits)).toEqual({ firm: ['arthaud', 'zemmour'], possible: ['retailleau'] })
    expect(crossedBy('q1', 'b', panel, hits)).toEqual({ firm: ['arthaud', 'kazib'], possible: [] })
    expect(crossedBy('q2', 'a', panel, hits)).toEqual({ firm: [], possible: [] })
  })

  it('prioritaire : poids 2 et au moins un avis, dans la feuille enregistrée, comme au dépouillement', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const q1 = pack.bank.questions[0]
    const other = pack.bank.questions.find(q => q.topicId !== q1!.topicId)!
    const answers: Answers = {
      [q1!.id]: { ratings: { [q1!.approaches[0]!.id]: 1 }, redLines: [] },
      [other.id]: { ratings: {}, redLines: [], skipped: true },
    }
    const weights = { [q1!.topicId]: 2, [other.topicId]: 2 } as const
    expect([...priorityTopics(pack.bank.questions, answers, weights)]).toEqual([q1!.topicId])
    // Sans avis : le poids ne compte pas (la page des priorités ne le permet pas) ; poids 1 : rien
    expect(priorityTopics(pack.bank.questions, {}, weights).size).toBe(0)
    expect(priorityTopics(pack.bank.questions, answers, { [q1!.topicId]: 1 }).size).toBe(0)
    // La règle du dépouillement (ui/screens/Results.tsx) : les thèmes répondus de poids 2
    const answered = new Set(pack.bank.questions.filter(q => hasOpinion(answers[q.id])).map(q => q.topicId))
    expect(new Set(pack.bank.topics.filter(t => answered.has(t.id) && weights[t.id as keyof typeof weights] === 2).map(t => t.id))).toEqual(priorityTopics(pack.bank.questions, answers, weights))
  })

  it('sur l’élection réelle : la croix ne change ni la lecture ni l’ordre ; chaque nom cité franchit une ligne rouge de la ligne', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const P = profilesFor(pack)
    const groups = pack.topicGroups!
    const topic = new Map(pack.bank.questions.map(q => [q.id, q.topicId]))
    let crosses = 0
    for (const cid of ['melenchon', 'glucksmann', 'retailleau', 'lepen']) {
      for (let s = 0; s < 3; s++) {
        const base = P.toAnswers(P.noisy(P.cloneLarge(cid), `n:${cid}:${s}`))
        // Toutes les approches « pas d'accord » portées par un candidat de l'axe deviennent des lignes rouges
        const red: Answers = Object.fromEntries(
          Object.entries(base).map(([q, a]) => [q, { ...a, redLines: Object.keys(a.ratings).filter(x => a.ratings[x] === -1 && panelOf(pack).flat().some(id => (pack.positions[id]?.[x]?.weight ?? 0) > 0)) }]),
        )
        const before = readEchiquier(pack, base)
        const after = readEchiquier(pack, red)
        // Une ligne rouge compte déjà comme un « pas d'accord » : la lecture et le rangement sont les mêmes
        expect(after).toEqual(before)
        const rows = chartRows(groups, after, u => u.id)
        expect(keys(chartRows(groups, before, u => u.id).read)).toEqual(keys(rows.read))
        const hits = hitsOf(computeResults(pack, red, {}, 'croix'))
        for (const u of rows.read) {
          crossingsOf(u, P.panel, hits, q => topic.get(q)).forEach((gs, b) => {
            if (gs.length) expect(u.cells[b]!.mark).toBe('pres')
            for (const g of gs)
              for (const id of g.ids) {
                crosses++
                expect(P.panel[b]).toContain(id)
                const mine = hits.get(id)!.filter(h => u.questions.includes(h.questionId))
                const firm = mine.filter(h => h.level === 'touche').length
                expect([g.level, g.count]).toEqual(firm ? ['touche', firm] : ['possible', mine.length])
                for (const h of mine) expect(red[h.questionId]!.redLines).toContain(h.approachId)
              }
          })
        }
      }
    }
    expect(crosses).toBeGreaterThan(0)
  })
})
