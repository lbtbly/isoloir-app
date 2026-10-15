// La lecture des réponses sur l'échiquier (core/echiquier.ts), pour la page « Mon profil politique » : le cœur exact
// (mêmes affinités que le score, réponses neutres jamais lues, déterminisme, candidats de l'axe), les invariances,
// l'ordre des statuts, la forme d'une lecture, le compte des façons de poser les avis et la synthèse ; puis « compter,
// sinon calculer » : le compte complet face à une force brute écrite à part, la borne calculée jamais plus généreuse que
// lui, le bloc constant, les seuils atteints tout juste, la grille affinée, l'inversion des avis, le déterminisme et le
// temps des pages les plus lourdes sur l'élection réelle, et rien de tiré au sort ; enfin le calcul par étapes (la main
// rendue par tranches, les minuteries de la page qui passent). Sur une petite élection factice
// (tests/fixtures/echiquier.ts) ; la calibration sur l'élection réelle est dans tests/echiquier-calibration.test.ts.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import {
  approvedCarriers,
  ECHIQUIER,
  echiquierCached,
  panelOf,
  readEchiquier,
  readEchiquierAsync,
  segments,
  type Echiquier,
  type Mark,
  type ReadOptions,
  type UnitReading,
} from '../src/core/echiquier'
import { withRedLine } from '../src/core/answers'
import { hashString, mulberry32 } from '../src/core/rng'
import { computeResults, questionScore, stance } from '../src/core/score'
import type { Answer, Answers, ElectionPack, Position, Question } from '../src/core/types'
import { elections } from '../src/elections/all'
import { answersOf, cloneOf, echiquierPack as pack } from './fixtures/echiquier'
import { profilesFor } from './fixtures/echiquier-profiles'

/** Une copie du pack : un autre objet, donc ni précalcul ni cache partagés (un vrai second calcul) */
const fresh = (p: ElectionPack = pack): ElectionPack => ({ ...p })

/** Des avis tirés au hasard (⅓ d'accord, ⅓ pas d'accord, ⅓ sans avis), graine fixe */
function randomAnswers(seed: string, p: ElectionPack = pack): Answers {
  const rand = mulberry32(hashString(seed))
  const by: Record<string, number[]> = {}
  for (const q of p.bank.questions) by[q.id] = q.approaches.map(() => Math.floor(rand() * 3) - 1)
  return answersOf(by, p)
}

const units = (e: Echiquier) => [...e.themes, ...e.families]
const marks = (u: UnitReading): Mark[] => u.cells.map(c => c.mark)
const unit = (e: Echiquier, kind: 'theme' | 'famille', id: string) => units(e).find(u => u.kind === kind && u.id === id)!

const SWAP: Record<Mark, Mark> = { pres: 'loin', loin: 'pres', rien: 'rien', inconnu: 'inconnu' }
/**
 * Des avis tous inversés (b) face aux avis (a), unité testée par unité testée : ▲ et ▽ échangés, les mêmes p, le même
 * régime et le même nombre de façons, l'affinité et sa moyenne retournées (100 moins elles-mêmes). Rend le nombre
 * d'unités vérifiées
 */
function swapped(a: Echiquier, b: Echiquier): number {
  let n = 0
  for (const u of units(a)) {
    if (!u.arrangements) continue
    const v = unit(b, u.kind, u.id)
    const where = `${u.kind} ${u.id}`
    expect(marks(v), where).toEqual(marks(u).map(m => SWAP[m]))
    expect(v.cells.map(c => c.p), where).toEqual(u.cells.map(c => c.p))
    expect([v.exact, v.arrangements], where).toEqual([u.exact, u.arrangements])
    u.cells.forEach((c, i) => {
      if (c.chance !== null) expect(Math.abs(v.cells[i]!.chance! - (100 - c.chance)), where).toBeLessThan(1e-9)
      if (c.affinity !== null) expect(Math.abs(v.cells[i]!.affinity! - (100 - c.affinity)), where).toBeLessThan(1e-9)
    })
    n++
  }
  return n
}

describe('le cœur', () => {
  it('C1 : l’affinité d’un thème est exactement celle de « Par thème » (topicScores), pour chaque candidat de l’axe', () => {
    const profiles = [cloneOf('e1'), cloneOf('c1'), cloneOf('x1'), randomAnswers('c1:1'), randomAnswers('c1:2'), randomAnswers('c1:3')]
    for (const answers of profiles) {
      const reading = readEchiquier(fresh(), answers)
      const results = computeResults(pack, answers, {}, 'graine')
      const all = [...results.ranking, ...results.unranked]
      for (const t of reading.themes) {
        for (const [id, mine] of Object.entries(t.perCandidate)) {
          const ts = all.find(r => r.candidateId === id)!.topicScores[t.id] ?? null
          if (ts === null) expect(mine, `${t.id} ${id}`).toBeNull()
          else expect(Math.abs(ts - mine!), `${t.id} ${id}`).toBeLessThan(1e-9)
        }
      }
    }
  })

  it('C2 : tout approuver, tout désapprouver, tout « sans avis » : aucune lecture, aucun écart, synthèse vide', () => {
    for (const v of [1, -1, 0]) {
      const by = Object.fromEntries(pack.bank.questions.map(q => [q.id, q.approaches.map(() => v)]))
      const reading = readEchiquier(fresh(), answersOf(by))
      for (const u of units(reading)) expect(['lecture', 'ecarts'], `${v} ${u.id}`).not.toContain(u.status)
      expect(reading.summary).toEqual([])
      if (v === 0) expect(reading.themes).toEqual([])
    }
  })

  it('C3 : la même réponse lue deux fois, ou avec les clés de « ratings » dans un autre ordre, donne la même lecture', () => {
    for (const seed of ['c3:1', 'c3:2', 'c3:3']) {
      const answers = randomAnswers(seed)
      const reversed: Answers = Object.fromEntries(
        Object.entries(answers)
          .reverse()
          .map(([id, a]) => [id, { ...a, ratings: Object.fromEntries(Object.entries(a.ratings).reverse()) }]),
      )
      const a = readEchiquier(fresh(), answers)
      expect(readEchiquier(fresh(), answers)).toEqual(a)
      expect(readEchiquier(fresh(), reversed)).toEqual(a)
    }
  })

  it('C4 : sur l’axe, ni les non classés ni les candidats hors axe (bloc « Autres »)', () => {
    const panel = panelOf(pack)
    expect(panel).toEqual([['e1'], ['g1'], ['c1'], ['d1'], ['x1']])
    const flat = panel.flat()
    for (const id of pack.election.ranking!.excluded!.ids) expect(flat).not.toContain(id)
    expect(flat).not.toContain('v1')
    // Ni dans les affinités par candidat
    const reading = readEchiquier(fresh(), randomAnswers('c4'))
    for (const u of units(reading)) expect(Object.keys(u.perCandidate).sort()).toEqual([...flat].sort())
  })
})

describe('invariances', () => {
  it('I1 : doubler un candidat (mêmes positions, même bloc) ne change aucune marque', () => {
    const doubled: ElectionPack = {
      ...pack,
      candidates: [...pack.candidates, { id: 'e2', name: 'Edith Deux', initials: 'ED', affiliation: 'X', role: 'r', nuance: 'EXG' }],
      positions: { ...pack.positions, e2: pack.positions.e1! },
    }
    expect(panelOf(doubled)[0]).toEqual(['e1', 'e2'])
    for (const answers of [cloneOf('e1'), cloneOf('g1'), randomAnswers('i1:1'), randomAnswers('i1:2'), randomAnswers('i1:3')]) {
      const a = readEchiquier(fresh(), answers)
      const b = readEchiquier(doubled, answers)
      expect(units(b).map(marks)).toEqual(units(a).map(marks))
      expect(units(b).map(u => u.status)).toEqual(units(a).map(u => u.status))
    }
  })

  it('I2 : inverser toutes les notes échange exactement ▲ et ▽, compte complet comme borne calculée ; même p, moyenne retournée', () => {
    const horseshoe = { q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] }
    const profiles = [horseshoe, ...['i2:1', 'i2:2', 'i2:3', 'i2:4', 'i2:5'].map(s => {
      const answers = randomAnswers(s)
      return Object.fromEntries(pack.bank.questions.map(q => [q.id, q.approaches.map(a => answers[q.id]?.ratings[a.id] ?? 0)]))
    })]
    for (const opts of [{}, { countMax: 0 }]) {
      let checked = 0
      for (const by of profiles) {
        const inverse = Object.fromEntries(Object.entries(by).map(([id, v]) => [id, v.map(x => -x)]))
        checked += swapped(readEchiquier(fresh(), answersOf(by), opts), readEchiquier(fresh(), answersOf(inverse), opts))
      }
      expect(checked).toBeGreaterThan(5)
    }
    // Le fer à cheval : ▲ aux deux extrêmes, puis ▽ aux deux extrêmes
    const th = unit(readEchiquier(fresh(), answersOf(horseshoe)), 'theme', 'th')
    expect(th.near).toEqual([0, 4])
    expect(unit(readEchiquier(fresh(), answersOf(Object.fromEntries(Object.entries(horseshoe).map(([k, v]) => [k, v.map(x => -x)])))), 'theme', 'th').far).toEqual([0, 4])
  })

  it('I2 bis : sur l’élection réelle, l’inversion échange aussi ▲ et ▽, au-delà de COUNT_MAX façons comme en deçà', () => {
    // Le calcul prend les avis au signe près : des avis tous inversés font le même calcul, au même régime (N ne change pas)
    const real = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
    const counted = { exact: 0, bound: 0 }
    for (const seed of ['i2b:1', 'i2b:2', 'i2b:3']) {
      const rand = mulberry32(hashString(seed))
      const by = Object.fromEntries(real.bank.questions.map(q => [q.id, q.approaches.map(() => Math.floor(rand() * 3) - 1)]))
      const inverse = Object.fromEntries(Object.entries(by).map(([id, v]) => [id, v.map(x => -x)]))
      const a = readEchiquier(fresh(real), answersOf(by, real))
      swapped(a, readEchiquier(fresh(real), answersOf(inverse, real)))
      for (const u of units(a)) if (u.arrangements) counted[u.exact ? 'exact' : 'bound']++
    }
    expect(counted.exact).toBeGreaterThan(20)
    expect(counted.bound).toBeGreaterThan(20)
  })

  it('I3 : ajouter ou retirer des lignes rouges sur des approches déjà « pas d’accord » ne change rien', () => {
    const answers = randomAnswers('i3')
    const red: Answers = {}
    for (const [id, a] of Object.entries(answers)) {
      let next = a
      for (const [approach, v] of Object.entries(a.ratings)) if (v === -1) next = withRedLine(next, approach, true)
      red[id] = next
    }
    expect(Object.values(red).some(a => a.redLines.length)).toBe(true)
    expect(readEchiquier(fresh(), red)).toEqual(readEchiquier(fresh(), answers))
  })

  it('I4 : ni les priorités, ni les finalistes, ni la graine de la personne n’entrent dans la lecture', () => {
    const answers = randomAnswers('i4')
    const finalists: ElectionPack = { ...pack, election: { ...pack.election, finalists: ['e1', 'x1'] } }
    expect(readEchiquier(finalists, answers)).toEqual(readEchiquier(fresh(), answers))
    // La lecture ne reçoit que les réponses : ni poids, ni graine (signature), comme topicScores qui n'en dépend pas
    expect(readEchiquier.length).toBeLessThanOrEqual(3)
    const a = computeResults(pack, answers, {}, 'une-graine')
    const b = computeResults(pack, answers, { ta1: 2, tb: 0.5 }, 'une-autre')
    for (const r of a.ranking) expect(b.ranking.find(x => x.candidateId === r.candidateId)!.topicScores).toEqual(r.topicScores)
  })

  it('I5 : une seule question répondue sur un thème : « une-question », jamais de marque', () => {
    const reading = readEchiquier(fresh(), answersOf({ q1: [1, -1, -1], q5: [1, 0, -1, 0] }))
    for (const id of ['ta1', 'tb']) {
      const t = unit(reading, 'theme', id)
      expect(t.status).toBe('une-question')
      expect(t.near).toEqual([])
      expect(t.far).toEqual([])
      expect(t.cells.some(c => c.mark === 'pres' || c.mark === 'loin')).toBe(false)
      expect(t.arrangements).toBe(0)
    }
    expect(reading.noReading).toEqual(['ta1', 'tb'])
  })

  it('I6 : deux blocs inconnus : « blocs-inconnus », testé avant « une-question »', () => {
    const t = unit(readEchiquier(fresh(), answersOf({ q6: [1, -1, 0] })), 'theme', 'tc')
    expect(t.status).toBe('blocs-inconnus')
    expect(t.cells.filter(c => c.mark === 'inconnu').map(c => c.bloc)).toEqual(['droite', 'extreme-droite'])
  })

  it('I7 : la synthèse ne retient une famille que si aucun de ses thèmes ne se lit seul', () => {
    // Clone de g1 : deux thèmes lus, la famille A aussi, mais seuls ses thèmes vont à la synthèse
    const g = readEchiquier(fresh(), cloneOf('g1'))
    expect(unit(g, 'famille', 'fa').status).toBe('lecture')
    expect(g.summary.flatMap(s => s.items)).not.toContainEqual({ kind: 'famille', id: 'fa' })
    expect(g.summary.flatMap(s => s.items)).toContainEqual({ kind: 'theme', id: 'ta1' })
    // Clone de e1 : aucun thème de la famille A ne se lit seul, la famille entière, oui
    const e = readEchiquier(fresh(), cloneOf('e1'))
    expect(e.themes.filter(t => ['ta1', 'ta2', 'tc'].includes(t.id)).every(t => t.status !== 'lecture')).toBe(true)
    expect(e.summary.flatMap(s => s.items)).toContainEqual({ kind: 'famille', id: 'fa' })
  })
})

describe('statuts, forme, placements', () => {
  it('un thème sans réponse n’a pas de ligne ; une famille ne s’affiche qu’avec deux thèmes répondus', () => {
    const reading = readEchiquier(fresh(), answersOf({ q1: [1, -1, 0], q2: [1, 0, -1, 0] }))
    expect(reading.themes.map(t => t.id)).toEqual(['ta1'])
    expect(reading.families).toEqual([])
    expect(reading.unanswered).toEqual(['ta2', 'tc', 'tb', 'th'])
    const two = readEchiquier(fresh(), answersOf({ q1: [1, -1, 0], q3: [1, 0, -1] }))
    expect(two.families.map(f => f.id)).toEqual(['fa'])
    expect(two.families[0]!.topicIds).toEqual(['ta1', 'ta2'])
  })

  it('un seul bloc inconnu : la lecture se fait sur les quatre autres', () => {
    // q5b noté : la position de d1 sur q5 est de confiance basse, q5 devient inconnue pour lui ; il n'a rien sur q7
    const reading = readEchiquier(fresh(), answersOf({ q5: [1, 1, -1, -1], q7: [1, 0, 0] }))
    const t = unit(reading, 'theme', 'tb')
    expect(t.cells.map(c => c.mark === 'inconnu')).toEqual([false, false, false, true, false])
    expect(['aucun', 'ecarts', 'lecture']).toContain(t.status)
  })

  it('forme : d’un côté, ou des deux bords ; un bloc inconnu au milieu coupe la suite', () => {
    expect(segments([0, 1])).toEqual([[0, 1]])
    expect(segments([0, 4])).toEqual([[0], [4]])
    expect(segments([1, 3])).toEqual([[1], [3]])
    expect(segments([0, 1, 2, 4])).toEqual([[0, 1, 2], [4]])
    const two = unit(readEchiquier(fresh(), answersOf({ q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] })), 'theme', 'th')
    expect(two.status).toBe('lecture')
    expect(two.twoSided).toBe(true)
    const one = unit(readEchiquier(fresh(), cloneOf('g1')), 'theme', 'ta1')
    expect(one.near).toEqual([1])
    expect(one.twoSided).toBe(false)
  })

  it('compter jusqu’à COUNT_MAX façons, calculer au-delà ; N exact, et ce que la page peut en dire ; rien ne dépend d’autre chose que des avis', () => {
    const answers = answersOf({ q1: [-1, -1, 0], q2: [0, 1, 0, -1], q3: [0, 1, -1], q4: [0, 1, 1], q6: [-1, 1, 0] })
    const reading = readEchiquier(fresh(), answers)
    // Thème A un : 3 × 12 façons, comptées une à une
    const ta1 = unit(reading, 'theme', 'ta1')
    expect([ta1.exact, ta1.arrangements, ta1.ways]).toEqual([true, 36, 36])
    // Famille A : 3 × 12 × 6 × 3 × 6 = 3 888 façons, sous COUNT_MAX : comptées aussi
    const fa = unit(reading, 'famille', 'fa')
    expect([fa.exact, fa.arrangements, fa.ways]).toEqual([true, 3888, 3888])
    // Au-delà du seuil (ici abaissé à 1 000) : la borne calculée ; N reste exact, et la page peut le dire
    const bound = unit(readEchiquier(fresh(), answers, { countMax: 1000 }), 'famille', 'fa')
    expect([bound.exact, bound.arrangements, bound.ways]).toEqual([false, 3888, 3888])
    // Mêmes avis, autres réponses ailleurs (thème B) : la famille A se lit de la même façon
    const other = readEchiquier(fresh(), { ...answers, ...answersOf({ q5: [1, 0, 0, -1], q7: [0, 1, -1] }) })
    expect(unit(other, 'famille', 'fa').cells).toEqual(fa.cells)
    // Une autre élection (autre identifiant), mêmes avis, mêmes positions : la même lecture, rien n'est tiré au sort
    const elsewhere: ElectionPack = { ...pack, election: { ...pack.election, id: 'autre-essai' } }
    expect(unit(readEchiquier(elsewhere, answers), 'famille', 'fa').cells).toEqual(fa.cells)
    expect(unit(readEchiquier(elsewhere, answers, { countMax: 1000 }), 'famille', 'fa').cells).toEqual(bound.cells)
    // Sur l'élection réelle, une famille répondue sur toute la banque : bien plus de cent mille façons
    const real = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
    const big = readEchiquier(real, randomAnswers('placements', real)).families
    expect(big.length).toBeGreaterThan(3)
    for (const f of big) {
      expect(f.arrangements, f.id).toBeGreaterThan(ECHIQUIER.COUNT_MAX)
      expect([f.exact, f.ways], f.id).toEqual([false, Number.POSITIVE_INFINITY])
    }
  })

  it('la p-valeur du compte complet : la part des façons, l’observée comprise ; la borne n’est jamais plus petite', () => {
    const answers = answersOf({ q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] })
    const th = unit(readEchiquier(fresh(), answers), 'theme', 'th')
    // Quatre façons sur 64 atteignent le maximum : l'observée et les trois autres « même approche partout »
    expect(th.cells[0]!.p).toBeCloseTo(4 / 64, 12)
    expect(th.cells[0]!.chance).toBeCloseTo(25, 9)
    const bound = unit(readEchiquier(fresh(), answers, { countMax: 0 }), 'theme', 'th')
    expect(bound.exact).toBe(false)
    bound.cells.forEach((c, b) => {
      expect(c.p!, c.bloc).toBeGreaterThanOrEqual(th.cells[b]!.p! - 1e-12)
      expect(c.chance!, c.bloc).toBeCloseTo(th.cells[b]!.chance!, 9)
    })
  })

  it('la synthèse : groupée par blocs ▲, rangée selon l’axe, les deux bords en dernier', () => {
    const answers = { ...cloneOf('g1', pack, q => q.topicId !== 'th'), ...answersOf({ q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] }) }
    const reading = readEchiquier(fresh(), answers)
    expect(reading.summary.map(s => s.near)).toEqual([[1], [0, 4]])
    expect(reading.summary[0]!.items).toEqual([
      { kind: 'theme', id: 'ta1' },
      { kind: 'theme', id: 'tb' },
    ])
    expect(reading.summary[1]).toEqual({ near: [0, 4], twoSided: true, items: [{ kind: 'theme', id: 'th' }] })
  })

  it('« rapide seul » : aucune question approfondie répondue', () => {
    expect(readEchiquier(fresh(), cloneOf('e1', pack, q => q.tier === 'essentiel')).quickOnly).toBe(true)
    expect(readEchiquier(fresh(), cloneOf('e1')).quickOnly).toBe(false)
  })

  it('qui porte ce que vous approuvez : les candidats de l’axe, par bloc, jamais un non classé ni un hors axe', () => {
    const q1 = pack.bank.questions.find(q => q.id === 'q1')!
    expect(approvedCarriers(pack, q1, answersOf({ q1: [1, 1, -1] }).q1)).toEqual([['e1'], ['g1'], ['c1'], [], []])
    expect(approvedCarriers(pack, q1, answersOf({ q1: [-1, 0, -1] }).q1)).toEqual([[], [], [], [], []])
  })
})

// ——— Compter, sinon calculer ———

const SRC = [{ title: 'Source de test', url: 'https://example.org/test', date: '2026-09-01' }]
const pos = (weight: 1 | 2, confidence: Position['confidence'] = 'high', nature: Position['nature'] = 'proposition'): Position => ({ weight, nature, confidence, summary: 'test', sources: SRC })
const rej = (confidence: Position['confidence'] = 'high'): Position => ({ rejects: true, nature: 'declaration', confidence, summary: 'rejet', sources: SRC })

/**
 * La petite élection, avec des blocs de deux candidats : g2 à gauche et d2 à droite ont des positions de confiance
 * basse, portées ou rejetées (selon la façon de poser les avis, ils sont connus ou non sur la question), une inférence
 * et des rejets ; c2 au centre n'est connu que sur trois questions (ailleurs, un seul candidat connu dans son bloc)
 */
const wide: ElectionPack = {
  ...pack,
  candidates: [
    ...pack.candidates,
    { id: 'g2', name: 'Gaston Deux', initials: 'GD', affiliation: 'X', role: 'r', nuance: 'SOC' },
    { id: 'c2', name: 'Céline Deux', initials: 'CD', affiliation: 'X', role: 'r', nuance: 'REN' },
    { id: 'd2', name: 'Damien Deux', initials: 'DD', affiliation: 'X', role: 'r', nuance: 'LR' },
  ],
  positions: {
    ...pack.positions,
    g2: { q1a: pos(2), q1b: pos(1, 'low'), q2b: pos(2), q2d: rej('low'), q3a: pos(1, 'low'), q3b: pos(2), q4a: rej(), q4b: pos(2, 'high', 'inference'), q5a: pos(2), q5b: pos(1, 'low'), q6b: pos(2), q7a: pos(2, 'low'), q7b: pos(1), q8b: pos(2), q9a: pos(1, 'low'), q9b: pos(2), q10b: pos(2, 'medium') },
    c2: { q1b: pos(2), q2c: pos(1), q8c: pos(2) },
    d2: { q1a: rej(), q1c: pos(2), q2c: pos(1, 'low'), q2d: pos(2), q3c: pos(2), q4a: rej(), q4c: pos(2, 'low'), q5c: pos(2), q5d: rej('low'), q6c: pos(2), q7c: pos(2), q8d: pos(2), q9c: rej('low'), q9d: pos(1), q10d: pos(2) },
  },
}

/** Toutes les façons distinctes de poser des avis entre des approches (force brute) */
function permutations(v: readonly number[]): number[][] {
  if (v.length <= 1) return [v.slice()]
  const out = new Map<string, number[]>()
  v.forEach((x, i) => {
    for (const rest of permutations([...v.slice(0, i), ...v.slice(i + 1)])) out.set([x, ...rest].join(','), [x, ...rest])
  })
  return [...out.values()]
}

/**
 * Le max-T d'une unité par force brute, écrit à part du calcul de la page : chaque façon de poser les avis, une à une,
 * scorée par questionScore (core/score.ts) ; affinité par thème puis par famille, moyenne par bloc des candidats
 * connus ; moyenne, écart-type et p de chaque bloc connu. Rend aussi N
 */
function bruteForce(p: ElectionPack, answers: Answers, u: UnitReading, without: readonly string[] = []) {
  const panel = panelOf(p).map(ids => ids.filter(id => !without.includes(id)))
  const qs = u.questions.map(id => p.bank.questions.find(q => q.id === id)!)
  const avis = (q: Question) => q.approaches.map(a => answers[q.id]?.ratings[a.id] ?? 0)
  const ways = qs.map(q => permutations(avis(q)))
  const answer = (q: Question, v: readonly number[]): Answer => ({ ratings: Object.fromEntries(q.approaches.flatMap((a, i) => (v[i] ? [[a.id, v[i] as 1 | -1]] : []))), redLines: [] })
  const mean = (l: readonly number[]) => l.reduce((a, b) => a + b, 0) / l.length
  const blocsOf = (vs: readonly (readonly number[])[]) =>
    panel.map(ids => {
      const affs = ids.flatMap(id => {
        const byTopic = new Map<string, number[]>()
        qs.forEach((q, j) => {
          const s = questionScore(q, answer(q, vs[j]!), p.positions[id])
          if (s !== null) byTopic.set(q.topicId, [...(byTopic.get(q.topicId) ?? []), s])
        })
        return byTopic.size ? [100 * mean([...byTopic.values()].map(mean))] : []
      })
      return affs.length ? mean(affs) : NaN
    })
  const all: number[][] = []
  const idx = qs.map(() => 0)
  for (;;) {
    all.push(blocsOf(idx.map((i, j) => ways[j]![i]!)))
    let j = qs.length - 1
    while (j >= 0 && ++idx[j]! === ways[j]!.length) idx[j--] = 0
    if (j < 0) break
  }
  const observed = blocsOf(qs.map(avis))
  const known = observed.flatMap((v, b) => (Number.isNaN(v) ? [] : [b]))
  const mu: number[] = []
  const sd: number[] = []
  for (const b of known) {
    const vs = all.map(r => r[b]!).filter(v => !Number.isNaN(v))
    mu[b] = mean(vs)
    sd[b] = Math.sqrt(mean(vs.map(v => (v - mu[b]!) ** 2)))
  }
  const z = (b: number, v: number) => (sd[b]! > 1e-9 && !Number.isNaN(v) ? (v - mu[b]!) / sd[b]! : 0)
  const T = all.map(r => Math.max(0, ...known.map(b => Math.abs(z(b, r[b]!)))))
  const pOf = known.map(b => T.filter(t => t >= Math.abs(z(b, observed[b]!)) - 1e-9).length / all.length)
  return { N: all.length, known, mu, p: Object.fromEntries(known.map((b, k) => [b, pOf[k]!])) as Record<number, number> }
}

/**
 * Sur cette question, la connaissance d'un candidat de l'axe dépend de la façon de poser les avis : une position de
 * confiance basse (portée ou rejetée) et une autre qui compte, et des avis mêlés de « sans avis »
 */
function lowVaries(p: ElectionPack, answers: Answers, id: string): boolean {
  const q = p.bank.questions.find(x => x.id === id)!
  const v = q.approaches.map(a => answers[id]?.ratings[a.id] ?? 0)
  if (!v.some(x => x === 0) || !v.some(x => x !== 0)) return false
  return panelOf(p)
    .flat()
    .some(c => {
      const t = p.positions[c] ?? {}
      return q.approaches.some(a => t[a.id]?.confidence === 'low' && (t[a.id]!.weight || t[a.id]!.rejects)) && q.approaches.some(a => stance(t[a.id]) !== 0)
    })
}

/** Les marques ▲ ▽ de la borne calculée sont parmi celles du compte complet, et ses p jamais plus petits */
function notMoreThanExact(bound: UnitReading, exact: UnitReading, where: string): void {
  bound.cells.forEach((c, b) => {
    const e = exact.cells[b]!
    if (c.p === null) return
    expect(c.p, `${where} ${c.bloc}`).toBeGreaterThanOrEqual(e.p! - 1e-12)
    expect(Math.abs(c.chance! - e.chance!), `${where} ${c.bloc}`).toBeLessThan(1e-9)
    if (c.mark === 'pres' || c.mark === 'loin') expect(e.mark, `${where} ${c.bloc}`).toBe(c.mark)
  })
}

const real = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack

describe('compter, sinon calculer', () => {
  it('le compte complet égale la force brute : confiance basse, blocs de deux candidats, un seul candidat connu', () => {
    const profiles: [Answers, string[]][] = [
      ...Array.from({ length: 10 }, (_, i): [Answers, string[]] => [randomAnswers(`brute:${i}`, wide), []]),
      ...['g2', 'd2', 'c2', 'e1'].map((id): [Answers, string[]] => [cloneOf(id, wide), []]),
      [randomAnswers('brute:sans', wide), ['g1']],
      [cloneOf('g2', wide), ['g2']],
    ]
    let checked = 0
    let oneKnown = 0
    let varying = 0
    for (const [answers, without] of profiles) {
      const opts: ReadOptions = without.length ? { without } : {}
      const reading = readEchiquier(fresh(wide), answers, opts)
      for (const u of units(reading)) {
        if (!u.arrangements || u.arrangements > 20_000) continue
        const brute = bruteForce(wide, answers, u, without)
        const where = `${u.kind} ${u.id}`
        expect(u.exact, where).toBe(true)
        expect(u.arrangements, where).toBe(brute.N)
        expect(u.ways, where).toBe(brute.N)
        for (const b of brute.known) {
          expect(Math.abs(u.cells[b]!.p! - brute.p[b]!), `${where} bloc ${b}`).toBeLessThan(1e-12)
          expect(Math.abs(u.cells[b]!.chance! - brute.mu[b]!), `${where} bloc ${b}`).toBeLessThan(1e-9)
        }
        if (u.cells.some((c, b) => c.known.length === 1 && panelOf(wide)[b]!.length === 2)) oneKnown++
        if (u.questions.some(id => lowVaries(wide, answers, id))) varying++
        checked++
      }
    }
    expect(checked).toBeGreaterThan(60)
    expect(oneKnown).toBeGreaterThan(10)
    expect(varying).toBeGreaterThan(40)
  })

  it('moins de dix façons : aucune marque, la façon observée pèse déjà plus d’une sur dix (p ≥ 1 / N)', () => {
    let small = 0
    for (let i = 0; i < 30; i++) {
      for (const u of units(readEchiquier(fresh(wide), randomAnswers(`peu:${i}`, wide)))) {
        if (!u.arrangements || u.ways >= 10) continue
        expect(u.near.length + u.far.length, `${u.kind} ${u.id}`).toBe(0)
        for (const c of u.cells) if (c.p !== null) expect(c.p).toBeGreaterThanOrEqual(1 / u.ways - 1e-12)
        small++
      }
    }
    // Des avis tous les mêmes sur chaque question : une seule façon, la vôtre
    const same = unit(readEchiquier(fresh(), answersOf({ q8: [1, 1, 1, 1], q9: [-1, -1, -1, -1] })), 'theme', 'th')
    expect([same.ways, same.status]).toEqual([1, 'aucun'])
    expect(small).toBeGreaterThan(0)
  })

  it('la borne calculée (au-delà de COUNT_MAX) ne lit jamais plus que le compte complet, sur la petite élection', () => {
    let compared = 0
    for (let i = 0; i < 12; i++) {
      const answers = randomAnswers(`borne:${i}`, wide)
      const exact = readEchiquier(fresh(wide), answers)
      const bound = readEchiquier(fresh(wide), answers, { countMax: 0 })
      for (const u of units(exact)) {
        if (!u.arrangements) continue
        notMoreThanExact(unit(bound, u.kind, u.id), u, `${i} ${u.kind} ${u.id}`)
        compared++
      }
    }
    expect(compared).toBeGreaterThan(50)
  })

  it('un bloc constant n’efface pas les lectures des autres blocs', () => {
    // c1 n'est connu que sur q1, où tous les avis sont « d'accord » : une seule façon, son affinité ne varie pas
    const flat: ElectionPack = { ...pack, positions: { ...pack.positions, c1: { q1b: pos(2) } } }
    const answers = answersOf({ q1: [1, 1, 1], q2: [1, 0, -1, 0], q3: [1, 0, -1], q4: [1, 0, -1], q6: [1, -1, 0] }, flat)
    const exact = unit(readEchiquier(fresh(flat), answers), 'famille', 'fa')
    const bound = unit(readEchiquier(fresh(flat), answers, { countMax: 0 }), 'famille', 'fa')
    expect([exact.exact, bound.exact, bound.arrangements]).toEqual([true, false, 2592])
    for (const u of [exact, bound]) {
      const centre = u.cells[2]!
      expect(centre.p).toBe(1)
      expect(Math.abs(centre.chance! - centre.affinity!)).toBeLessThan(1e-9)
      expect(u.near).toEqual([0])
    }
    notMoreThanExact(bound, exact, 'fa')
  })

  it('un écart de 5 points et une affinité de 55 % atteints tout juste comptent, et l’inversion échange encore ▲ et ▽', () => {
    // Cas construit par la contre-vérification du 15 octobre 2026 : un candidat par bloc ; e1 pèse 2, 2, 2, 1, 1, 1, 1
    // sur sept approches, les autres 1 partout (score constant). « D'accord » sur la première approche, « pas d'accord »
    // sur la quatrième : affinité 55 % tout juste, moyenne des autres façons 50 tout juste, p sous 0,10. La règle dit
    // « au moins » : ▲, et ▽ une fois les avis inversés, au compte complet (thème T0, 42³ façons) comme à la borne
    // (famille, 42⁵ façons), malgré l'arrondi des nombres à virgule
    const ids = ['e1', 'g1', 'c1', 'd1', 'x1']
    const questions: Question[] = Array.from({ length: 5 }, (_, i) => ({
      id: `s${i}`,
      topicId: i < 3 ? 't0' : 't1',
      tier: 'essentiel',
      prompt: `Question s${i}`,
      approaches: Array.from({ length: 7 }, (_, a) => ({ id: `s${i}_${a}`, text: `Approche ${a}` })),
    }))
    const tie: ElectionPack = {
      ...pack,
      candidates: pack.candidates.filter(c => ids.includes(c.id)),
      bank: { topics: ['t0', 't1'].map(id => ({ id, label: id.toUpperCase(), description: '' })), questions },
      topicGroups: [{ id: 'f', label: 'F', topicIds: ['t0', 't1'] }],
      positions: Object.fromEntries(ids.map(id => [id, Object.fromEntries(questions.flatMap(q => q.approaches.map((a, i) => [a.id, pos(id === 'e1' && i < 3 ? 2 : 1)])))])),
    }
    const avis = Object.fromEntries(questions.map(q => [q.id, [1, 0, 0, -1, 0, 0, 0]]))
    const inverse = Object.fromEntries(questions.map(q => [q.id, [-1, 0, 0, 1, 0, 0, 0]]))
    const a = readEchiquier(fresh(tie), answersOf(avis, tie))
    const b = readEchiquier(fresh(tie), answersOf(inverse, tie))
    expect(swapped(a, b)).toBe(3)
    for (const [reading, mark, affinity] of [[a, 'pres', 55], [b, 'loin', 45]] as const) {
      const t0 = unit(reading, 'theme', 't0')
      const f = unit(reading, 'famille', 'f')
      expect([t0.exact, t0.arrangements, f.exact, f.arrangements]).toEqual([true, 42 ** 3, false, 42 ** 5])
      for (const u of [t0, f]) {
        const c = u.cells[0]!
        expect(c.mark, `${u.kind} ${u.id}`).toBe(mark)
        expect(c.p!).toBeLessThanOrEqual(ECHIQUIER.ALPHA)
        expect(Math.abs(c.affinity! - affinity)).toBeLessThan(1e-9)
        expect(Math.abs(c.chance! - 50)).toBeLessThan(1e-9)
        // Les autres blocs ont un score constant : jamais de marque
        expect(u.cells.slice(1).map(x => x.mark)).toEqual(['rien', 'rien', 'rien', 'rien'])
      }
    }
  })

  it('la grille affinée (un bloc qui varie à peine) resserre la borne, qui reste prudente', () => {
    // Trouvé par la contre-vérification du 15 octobre 2026 : sur la famille Économie, l'extrême droite n'est connue que par
    // des questions « tout d'accord », sauf retraites-3. Son affinité varie à peine (écart-type 0,5 point) et l'arrondi de
    // sa loi au centième, borné à 0,034 point, en dépasse le vingtième : sa loi se refait sur une grille plus fine (mesuré
    // par une copie instrumentée du calcul ; elle ne prend que quatre valeurs, et sa borne n'en change pas). 972 000
    // façons, au-delà de COUNT_MAX, que l'on peut encore compter une à une pour comparer
    const by: Record<string, number[]> = {
      'travail_salaires-2': [1, 1, -1, -1, 0, 0],
      'travail_salaires-3': [1, 1, -1, -1, 0, 0],
      'travail_salaires-4': [1, 1, -1, -1, 0],
      'retraites-3': [1, 0, 0, 0],
    }
    const economie = real.topicGroups!.find(g => g.id === 'economie')!.topicIds
    for (const q of real.bank.questions) if (economie.includes(q.topicId)) by[q.id] ??= q.approaches.map(() => 1)
    const answers = answersOf(by, real)
    const family = (opts: ReadOptions) => unit(readEchiquier(fresh(real), answers, opts), 'famille', 'economie')
    const full = family({ countMax: 1e7 })
    const fine = family({})
    const coarse = family({ refine: false })
    expect([full.exact, fine.exact, coarse.exact, fine.arrangements]).toEqual([true, false, false, 972_000])
    notMoreThanExact(fine, full, 'grille affinée')
    notMoreThanExact(coarse, full, 'sans affiner')
    // Sur une grille d'un demi-point, l'arrondi dépasse le vingtième de l'écart-type de chaque bloc : toutes les lois
    // s'affinent, la borne se resserre nettement, et reste prudente
    const half = family({ grid: 0.5 })
    const halfCoarse = family({ grid: 0.5, refine: false })
    notMoreThanExact(half, full, 'grille d’un demi-point, affinée')
    notMoreThanExact(halfCoarse, full, 'grille d’un demi-point')
    half.cells.forEach((c, b) => expect(c.p!, c.bloc).toBeLessThanOrEqual(halfCoarse.cells[b]!.p! + 1e-12))
    expect(half.cells.some((c, b) => c.p! < halfCoarse.cells[b]!.p! - 0.05)).toBe(true)
  })

  it('sur l’élection réelle, la borne ne lit jamais plus que le compte complet, là où l’on peut comparer', () => {
    const P = profilesFor(real)
    const profiles = [
      ...['arthaud', 'glucksmann', 'philippe', 'retailleau', 'lepen'].flatMap(id => [0, 1].map(s => P.toAnswers(P.noisy(P.cloneLarge(id), `borne:${id}:${s}`)))),
      ...Array.from({ length: 6 }, (_, i) => P.toAnswers(P.randomProfile(`borne:audit:${i}`, 'audit'))),
      ...Array.from({ length: 4 }, (_, i) => P.toAnswers(P.randomProfile(`borne:ucd:${i}`, 'un-choix-doux'))),
    ]
    let compared = 0
    for (const answers of profiles) {
      const exact = readEchiquier(real, answers)
      const bound = readEchiquier(real, answers, { countMax: 0 })
      for (const u of units(exact)) {
        if (!u.exact) continue
        notMoreThanExact(unit(bound, u.kind, u.id), u, `${u.kind} ${u.id}`)
        compared++
      }
    }
    expect(compared).toBeGreaterThan(200)
  })

  it('déterminisme sur l’élection réelle : deux calculs, un autre ordre, une unité lue seule, par étapes', async () => {
    const P = profilesFor(real)
    for (const answers of [P.toAnswers(P.noisy(P.cloneLarge('melenchon'), 'det:1')), randomAnswers('det:2', real)]) {
      const a = readEchiquier(fresh(real), answers)
      expect(readEchiquier(fresh(real), answers)).toEqual(a)
      const reversed: Answers = Object.fromEntries(Object.entries(answers).reverse())
      expect(readEchiquier(fresh(real), reversed)).toEqual(a)
      expect(await readEchiquierAsync(fresh(real), answers)).toEqual(a)
      // Une unité ne dépend que de ses propres réponses
      for (const u of [...a.themes.slice(0, 6), ...a.families]) {
        const alone = Object.fromEntries(Object.entries(answers).filter(([id]) => u.questions.includes(id)))
        expect(unit(readEchiquier(fresh(real), alone), u.kind, u.id), `${u.kind} ${u.id}`).toEqual(u)
      }
    }
  })

  it('les motifs de confiance basse restent peu nombreux (le calcul en fait autant de lois)', () => {
    // Un candidat dont la connaissance d'une question dépend de la façon de poser les avis : une position de confiance
    // basse, portée ou rejetée, et une autre qui compte. Le 15 octobre 2026 : 17 en tout, au plus 2 par bloc et 4 par
    // unité (4 et 16 motifs) ; bornes à 3 et 5 (8 et 32 motifs). Au-delà, le calcul reste juste mais plus long : mesurer
    // le temps de la page la plus lourde avant de relever ces bornes
    const panel = panelOf(real)
    const varies = (id: string, q: Question) => {
      const t = real.positions[id] ?? {}
      return q.approaches.some(a => t[a.id]?.confidence === 'low' && (t[a.id]!.weight || t[a.id]!.rejects)) && q.approaches.some(a => stance(t[a.id]) !== 0)
    }
    const unitsOf = [...real.bank.topics.map(t => [t.id]), ...(real.topicGroups ?? []).filter(g => g.topicIds.length > 1).map(g => g.topicIds)]
    for (const topics of unitsOf) {
      const qs = real.bank.questions.filter(q => topics.includes(q.topicId))
      const perBloc = panel.map(ids => qs.reduce((n, q) => n + ids.filter(id => varies(id, q)).length, 0))
      expect(Math.max(...perBloc), topics.join(',')).toBeLessThanOrEqual(3)
      expect(perBloc.reduce((a, b) => a + b, 0), topics.join(',')).toBeLessThanOrEqual(5)
    }
  })

  it('rien de tiré au sort : core/echiquier.ts n’importe pas core/rng, ni aucun générateur', () => {
    const src = readFileSync(fileURLToPath(new URL('../src/core/echiquier.ts', import.meta.url)), 'utf8')
    const imports = [...src.matchAll(/from '([^']+)'/g)].map(m => m[1])
    expect(imports.sort()).toEqual(['./answers', './score', './spectrum', './types'])
    expect(src).not.toMatch(/\brng\b|Math\.random|getRandomValues|mulberry32|hashString|seededShuffle|newSeed/)
  })

  it('les pages les plus lourdes se lisent en moins d’un cinquième de seconde ici, moins d’une seconde sur un téléphone lent (× 5)', () => {
    // Deux pages : tout noté sur la banque entière, d'accord, pas d'accord et sans avis en rotation (chaque famille dépasse
    // de loin COUNT_MAX façons, ses lois se calculent) ; et chaque thème au plus près de COUNT_MAX (compté en entier), le
    // premier thème de chaque famille au signe inversé (la famille se lit dans l'autre sens que la plupart de ses thèmes :
    // les placements se calculent dans les deux), la plus lourde trouvée par la contre-vérification du 15 octobre 2026,
    // environ 1,2 fois la première. Le temps se rapporte à une boucle d'étalonnage mesurée dans le même passage (une
    // machine chargée par d'autres calculs ralentit l'une et l'autre) : le 15 octobre 2026, sur Mac peu chargé, la
    // boucle prend 25 ms et les deux pages environ 50 et 65 ms ; le budget, 200 ms ici, est donc de huit fois la boucle.
    // Le meilleur de cinq essais, sur un pack neuf (sans cache), en alternance
    const rotation = answersOf(Object.fromEntries(real.bank.questions.map((q, qi) => [q.id, q.approaches.map((_, i) => [1, -1, 0][(qi + i) % 3]!)])), real)
    const counted = answersOf(underCountMax(real), real)
    const page = (answers: Answers) => {
      const p = fresh(real)
      readEchiquier(p, {})
      const t0 = performance.now()
      readEchiquier(p, answers)
      return performance.now() - t0
    }
    const best = { calibration: Infinity, rotation: Infinity, counted: Infinity }
    for (let i = 0; i < 5; i++) {
      best.calibration = Math.min(best.calibration, calibration())
      best.rotation = Math.min(best.rotation, page(rotation))
      best.counted = Math.min(best.counted, page(counted))
    }
    const budget = 8 * best.calibration
    expect(best.rotation, JSON.stringify(best)).toBeLessThan(budget)
    expect(best.counted, JSON.stringify(best)).toBeLessThan(budget)
  })
})

/**
 * Une boucle d'étalonnage, du même genre que le calcul (des sommes de produits sur des tableaux de nombres, comme une
 * convolution) et d'un coût fixe : sa durée, en ms
 */
function calibration(): number {
  const d = Float64Array.from({ length: 4096 }, (_, i) => (i % 97) / 97)
  const out = new Float64Array(d.length + 64)
  const t0 = performance.now()
  for (let r = 0; r < 185; r++)
    for (let s = 0; s < 64; s++) {
      const w = (r + s) / 1e4
      for (let i = 0; i < d.length; i++) out[i + s]! += d[i]! * w
    }
  const ms = performance.now() - t0
  expect(out[100]).toBeGreaterThan(0)
  return ms
}

/**
 * Chaque thème de la banque au plus près de COUNT_MAX façons, sans le dépasser (compté en entier, d'un seul tenant) : par
 * programmation dynamique sur le produit, question par question, en répondant au plus de questions possible ; les avis
 * en rotation. Puis, dans chaque famille, son premier thème au signe inversé, les autres non
 */
function underCountMax(p: ElectionPack): Record<string, number[]> {
  const C = (n: number, k: number) => {
    let x = 1
    for (let i = 1; i <= k; i++) x = (x * (n - k + i)) / i
    return Math.round(x)
  }
  const by: Record<string, number[]> = {}
  for (const t of p.bank.topics) {
    const qs = p.bank.questions.filter(q => q.topicId === t.id)
    // Par produit atteint, les comptes (d'accord, pas d'accord) choisis question par question, null : passée
    type Path = ([number, number] | null)[]
    let states = new Map<number, Path>([[1, []]])
    for (const q of qs) {
      const n = q.approaches.length
      const next = new Map<number, Path>()
      const keep = (M: number, choice: Path) => {
        const prev = next.get(M)
        if (!prev || choice.filter(Boolean).length > prev.filter(Boolean).length) next.set(M, choice)
      }
      for (const [N, path] of states) {
        keep(N, [...path, null])
        for (let a = 0; a <= n; a++)
          for (let b = 0; a + b <= n; b++) {
            const M = N * C(n, a) * C(n - a, b)
            if (a + b && M <= ECHIQUIER.COUNT_MAX) keep(M, [...path, [a, b]])
          }
      }
      states = next
    }
    const path = states.get(Math.max(...states.keys()))!
    qs.forEach((q, j) => {
      const c = path[j]
      if (!c) return
      const v = [...Array<number>(c[0]).fill(1), ...Array<number>(c[1]).fill(-1), ...Array<number>(q.approaches.length - c[0] - c[1]).fill(0)]
      by[q.id] = v.map((_, i) => v[(i + j) % v.length]!)
    })
  }
  for (const g of p.topicGroups ?? [])
    g.topicIds.forEach((t, ti) => {
      const qs = p.bank.questions.filter(q => q.topicId === t && by[q.id])
      const first = qs.length ? by[qs[0]!.id]!.find(x => x !== 0) : undefined
      if (first !== undefined && first !== (ti === 0 ? -1 : 1)) for (const q of qs) by[q.id] = by[q.id]!.map(x => -x)
    })
  return by
}

describe('calcul par étapes', () => {
  it('readEchiquierAsync donne la même lecture que readEchiquier, et la garde en mémoire', async () => {
    for (const seed of ['a:1', 'a:2']) {
      const answers = randomAnswers(seed)
      const p = fresh()
      expect(echiquierCached(p, answers)).toBeNull()
      const r = await readEchiquierAsync(p, answers)
      expect(r).toEqual(readEchiquier(fresh(), answers))
      expect(echiquierCached(p, answers)).toBe(r)
    }
  })

  it('un signal interrompu arrête le calcul', async () => {
    const ctrl = new AbortController()
    ctrl.abort()
    await expect(readEchiquierAsync(fresh(), randomAnswers('abort'), ctrl.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  /**
   * Le calcul par étapes sous une horloge réglée (step ms de plus à chaque lecture de performance.now) et un
   * scheduler.yield dont la reprise est immédiate (une promesse résolue : elle passe devant toutes les minuteries, comme
   * sous Chromium) ; une minuterie de la page est posée juste avant. Rend la lecture, les reprises de main de chaque
   * sorte et l'ordre de la minuterie et de la fin du calcul
   */
  async function underClock(step: number, answers: Answers, p: ElectionPack = pack) {
    const g = globalThis as { scheduler?: unknown }
    const had = 'scheduler' in g
    const saved = g.scheduler
    let t = 0
    const clock = vi.spyOn(performance, 'now').mockImplementation(() => (t += step))
    const timer = vi.spyOn(globalThis, 'setTimeout')
    const counts = { yields: 0, timers: 0 }
    g.scheduler = { yield: () => (counts.yields++, Promise.resolve()) }
    const order: string[] = []
    try {
      setTimeout(() => order.push('minuterie'), 0)
      const before = timer.mock.calls.length
      const reading = await readEchiquierAsync(fresh(p), answers)
      counts.timers = timer.mock.calls.length - before
      order.push('lecture')
      await new Promise(resolve => setTimeout(resolve, 0))
      return { reading, counts, order }
    } finally {
      clock.mockRestore()
      timer.mockRestore()
      if (had) g.scheduler = saved
      else delete g.scheduler
    }
  }

  it('la main se rend dès que le calcul a duré quelques millisecondes d’un seul tenant, pas à chaque étape', async () => {
    // Horloge arrêtée : le calcul ne dure jamais assez, aucune reprise de main (aucun délai de minuterie à payer à chaque
    // étape quand scheduler.yield manque) ; la même lecture
    const still = await underClock(0, randomAnswers('tranches'))
    expect(still.counts).toEqual({ yields: 0, timers: 0 })
    expect(still.reading).toEqual(readEchiquier(fresh(), randomAnswers('tranches')))
    // 20 ms à chaque lecture de l'horloge : la main se rend après chaque étape (ici, chaque thème et chaque famille), et
    // par une minuterie au moins une fois sur trois (au plus tous les 50 ms)
    const busy = await underClock(20, randomAnswers('tranches'))
    const units = still.reading.themes.length + still.reading.families.length
    expect(busy.reading).toEqual(still.reading)
    expect(units).toBeGreaterThan(5)
    expect(busy.counts.yields + busy.counts.timers).toBe(units)
    expect(busy.counts.timers).toBeGreaterThanOrEqual(units / 3)
  })

  it('les minuteries de la page passent pendant le calcul, même quand scheduler.yield les ferait attendre', async () => {
    // Sous Chromium, sans une reprise par une minuterie de temps en temps, celle du statut « Lecture en cours » (Profile.tsx,
    // au-delà de 300 ms) ne partait qu'à la fin du calcul : le statut ne paraissait jamais (contre-vérification du 15
    // octobre 2026, processeur bridé)
    const { order } = await underClock(20, randomAnswers('minuterie'))
    expect(order).toEqual(['minuterie', 'lecture'])
  })

  it('un thème compté en entier rend aussi la main en cours de compte (toutes les 20 000 façons)', async () => {
    // Le thème de la banque qui a le plus de façons sans dépasser COUNT_MAX, seul répondu : une seule unité, plusieurs étapes
    const all = underCountMax(real)
    const alone = (t: string) => answersOf(Object.fromEntries(Object.entries(all).filter(([id]) => real.bank.questions.find(q => q.id === id)!.topicId === t)), real)
    const [heaviest] = real.bank.topics
      .map(t => ({ t: t.id, n: readEchiquier(fresh(real), alone(t.id)).themes[0]?.arrangements ?? 0 }))
      .sort((a, b) => b.n - a.n)
    expect(heaviest!.n).toBeGreaterThan(80_000)
    expect(heaviest!.n).toBeLessThanOrEqual(ECHIQUIER.COUNT_MAX)
    const { reading, counts } = await underClock(20, alone(heaviest!.t), real)
    expect([reading.themes.length, reading.families.length, reading.themes[0]!.exact]).toEqual([1, 0, true])
    expect(counts.yields + counts.timers).toBeGreaterThan(1)
    expect(reading).toEqual(readEchiquier(fresh(real), alone(heaviest!.t)))
  })
})
