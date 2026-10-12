// La lecture des réponses sur l'échiquier (core/echiquier.ts), pour la page « Mon profil politique » : le cœur exact
// (mêmes affinités que le score, réponses neutres jamais lues, déterminisme, candidats de l'axe), les invariances,
// l'ordre des statuts, la forme d'une lecture, le compte des placements, le calcul par étapes et la synthèse. Sur une
// petite élection factice (tests/fixtures/echiquier.ts) ; la calibration sur l'élection réelle est dans
// tests/echiquier-calibration.test.ts.
import { describe, expect, it } from 'vitest'
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
  type UnitReading,
} from '../src/core/echiquier'
import { withRedLine } from '../src/core/answers'
import { hashString, mulberry32 } from '../src/core/rng'
import { computeResults } from '../src/core/score'
import type { Answers, ElectionPack } from '../src/core/types'
import { elections } from '../src/elections/all'
import { answersOf, cloneOf, echiquierPack as pack } from './fixtures/echiquier'

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

  it('I2 : inverser toutes les notes d’une unité comptée en entier échange exactement ▲ et ▽', () => {
    const swap: Record<Mark, Mark> = { pres: 'loin', loin: 'pres', rien: 'rien', inconnu: 'inconnu' }
    const horseshoe = { q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] }
    const profiles = [horseshoe, ...['i2:1', 'i2:2', 'i2:3', 'i2:4', 'i2:5'].map(s => {
      const answers = randomAnswers(s)
      return Object.fromEntries(pack.bank.questions.map(q => [q.id, q.approaches.map(a => answers[q.id]?.ratings[a.id] ?? 0)]))
    })]
    let checked = 0
    for (const by of profiles) {
      const inverse = Object.fromEntries(Object.entries(by).map(([id, v]) => [id, v.map(x => -x)]))
      const a = readEchiquier(fresh(), answersOf(by))
      const b = readEchiquier(fresh(), answersOf(inverse))
      for (const u of a.themes.filter(t => t.exact)) {
        const v = unit(b, 'theme', u.id)
        expect(marks(v), u.id).toEqual(marks(u).map(m => swap[m]))
        checked++
      }
    }
    expect(checked).toBeGreaterThan(5)
    // Le fer à cheval : ▲ aux deux extrêmes, puis ▽ aux deux extrêmes
    const th = unit(readEchiquier(fresh(), answersOf(horseshoe)), 'theme', 'th')
    expect(th.near).toEqual([0, 4])
    expect(unit(readEchiquier(fresh(), answersOf(Object.fromEntries(Object.entries(horseshoe).map(([k, v]) => [k, v.map(x => -x)])))), 'theme', 'th').far).toEqual([0, 4])
  })

  it('I2 bis : sur l’élection réelle, l’inversion échange aussi ▲ et ▽ quand les placements sont tirés au sort', () => {
    // La graine des tirages prend les avis au signe près : des avis tous inversés reçoivent les mêmes tirages
    const real = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
    const swap: Record<Mark, Mark> = { pres: 'loin', loin: 'pres', rien: 'rien', inconnu: 'inconnu' }
    let drawn = 0
    for (const seed of ['i2b:1', 'i2b:2', 'i2b:3']) {
      const rand = mulberry32(hashString(seed))
      const by = Object.fromEntries(real.bank.questions.map(q => [q.id, q.approaches.map(() => Math.floor(rand() * 3) - 1)]))
      const inverse = Object.fromEntries(Object.entries(by).map(([id, v]) => [id, v.map(x => -x)]))
      const a = readEchiquier(fresh(real), answersOf(by, real), { draws: 199 })
      const b = readEchiquier(fresh(real), answersOf(inverse, real), { draws: 199 })
      for (const u of units(a)) {
        const v = unit(b, u.kind, u.id)
        expect(marks(v), `${seed} ${u.kind} ${u.id}`).toEqual(marks(u).map(m => swap[m]))
        if (!u.exact && u.arrangements) drawn++
      }
    }
    expect(drawn).toBeGreaterThan(20)
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

  it('tous les placements sous EXACT_MAX, des tirages au-dessus ; la graine ne dépend que de l’élection, de l’unité, des questions et des avis', () => {
    const answers = answersOf({ q1: [-1, -1, 0], q2: [0, 1, 0, -1], q3: [0, 1, -1], q4: [0, 1, 1], q6: [-1, 1, 0] })
    const reading = readEchiquier(fresh(), answers)
    // Thème A un : 3 × 12 placements, comptés un à un
    const ta1 = unit(reading, 'theme', 'ta1')
    expect(ta1.exact).toBe(true)
    expect(ta1.arrangements).toBe(36)
    // Famille A : 3 × 12 × 6 × 3 × 6 = 3 888 placements, au-delà de 1 000 : 999 tirages
    const fa = unit(reading, 'famille', 'fa')
    expect(fa.exact).toBe(false)
    expect(fa.arrangements).toBe(ECHIQUIER.DRAWS)
    // Mêmes avis, autres réponses ailleurs (thème B) : la famille A est tirée de la même façon
    const other = readEchiquier(fresh(), { ...answers, ...answersOf({ q5: [1, 0, 0, -1], q7: [0, 1, -1] }) })
    expect(unit(other, 'famille', 'fa').cells).toEqual(fa.cells)
    // Une autre élection (autre identifiant), mêmes avis : d'autres tirages
    const elsewhere: ElectionPack = { ...pack, election: { ...pack.election, id: 'autre-essai' } }
    const p1 = fa.cells.map(c => c.p)
    const p2 = unit(readEchiquier(elsewhere, answers), 'famille', 'fa').cells.map(c => c.p)
    expect(p2).not.toEqual(p1)
  })

  it('la p-valeur des tirages compte le placement observé ; celle du compte exact, la part des placements', () => {
    const reading = readEchiquier(fresh(), answersOf({ q8: [1, -1, -1, -1], q9: [1, -1, -1, -1], q10: [1, -1, -1, -1] }))
    const th = unit(reading, 'theme', 'th')
    // Quatre placements sur 64 atteignent le maximum : l'observé et les trois autres « même approche partout »
    expect(th.cells[0]!.p).toBeCloseTo(4 / 64, 12)
    expect(th.cells[0]!.chance).toBeCloseTo(25, 9)
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
})
