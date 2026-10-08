// Comparaison de candidats entre eux (src/core/compare.ts) : relation sur une question, verdict d'un thème,
// vue d'ensemble d'une paire, résumé d'un groupe. Cas construits à la main, propriétés, et la primaire réelle.
import { describe, expect, it } from 'vitest'
import {
  compareGroup,
  compareQuestion,
  compareRow,
  compareTable,
  ROW_KINDS,
  rowKindOf,
  DEFAULT_THRESHOLDS,
  overallPair,
  pairsOf,
  relation,
  RELATIONS,
  summarizeTopic,
  topicRelation,
  TOPIC_VERDICTS,
  verdictOf,
  type CompareData,
  type Relation,
  type RelationCounts,
  type RowKind,
  type TopicVerdict,
} from '../src/core/compare'
import type { Position, Question } from '../src/core/types'
import { elections } from '../src/elections/all'
import { pos, rej } from './fixture'

const question = (id: string, topicId: string, approaches: string[]): Question => ({
  id,
  topicId,
  tier: 'essentiel',
  prompt: id,
  approaches: approaches.map(a => ({ id: a, text: a })),
})
const Q = question('q', 't', ['x', 'y', 'z', 'w'])
const low = (p: Position): Position => ({ ...p, confidence: 'low' })
const inference = (p: Position): Position => ({ ...p, nature: 'inference' })
type Table = Record<string, Position>
const cmp = (a: Table, b: Table, q: Question = Q) => compareQuestion('a', 'b', q, { a, b })
const rel = (a: Table, b: Table, q: Question = Q) => relation('a', 'b', q, { a, b })

describe('relation sur une question', () => {
  it("'same' : même approche principale, quelles que soient les approches compatibles", () => {
    expect(cmp({ x: pos(2) }, { x: pos(2) })).toMatchObject({ relation: 'same', sameLevel: 'main', agreements: ['x'], conflicts: [] })
    expect(rel({ x: pos(2), y: pos(1) }, { x: pos(2), z: pos(1) })).toBe('same')
  })

  it("'close' : l'approche principale de l'un est compatible chez l'autre, dans un sens ou dans l'autre", () => {
    expect(rel({ x: pos(2) }, { z: pos(2), x: pos(1) })).toBe('close')
    expect(rel({ z: pos(2), x: pos(1) }, { x: pos(2) })).toBe('close')
    expect(rel({ x: pos(2), z: pos(1) }, { z: pos(2), x: pos(1) })).toBe('close')
    expect(cmp({ x: pos(2) }, { z: pos(2), x: pos(1) }).sameLevel).toBeUndefined()
  })

  it("'opposed' : l'un rejette explicitement l'approche principale de l'autre, ou les deux se rejettent", () => {
    expect(cmp({ x: pos(2) }, { z: pos(2), x: rej() })).toMatchObject({ relation: 'opposed', conflicts: ['x'] })
    expect(cmp({ x: pos(2), z: rej() }, { z: pos(2), x: rej() })).toMatchObject({ relation: 'opposed', conflicts: ['x', 'z'] })
    // Le rejet l'emporte sur un lien de compatibilité dans l'autre sens
    expect(rel({ x: pos(2), z: pos(1) }, { z: pos(2), x: rej() })).toBe('opposed')
  })

  it("'different' : approches principales différentes, sans lien connu", () => {
    expect(cmp({ x: pos(2) }, { z: pos(2) })).toMatchObject({ relation: 'different', agreements: [], conflicts: [] })
  })

  it("'unknown' : au moins un des deux sans position exploitable", () => {
    expect(cmp({}, { x: pos(2) })).toMatchObject({ relation: 'unknown', uncertain: false })
    expect(cmp({ x: pos(2) }, {})).toMatchObject({ relation: 'unknown', uncertain: false })
    expect(compareQuestion('a', 'absent', Q, { a: { x: pos(2) } })).toMatchObject({ relation: 'unknown', uncertain: false })
    // Seulement une position de confiance basse : à confirmer
    expect(cmp({ x: low(pos(2)) }, { x: pos(2) })).toMatchObject({ relation: 'unknown', uncertain: true })
    // Une position sur une approche d'une autre question ne compte pas
    expect(rel({ autre: pos(2) }, { x: pos(2) })).toBe('unknown')
  })

  describe('cas limites', () => {
    it("approche compatible commune sans principale commune : 'different', le terrain commun reste visible", () => {
      expect(cmp({ x: pos(2), y: pos(1) }, { z: pos(2), y: pos(1) })).toMatchObject({ relation: 'different', agreements: ['y'] })
      // De même pour un rejet commun
      expect(cmp({ x: pos(2), w: rej() }, { z: pos(2), w: rej() })).toMatchObject({ relation: 'different', agreements: ['w'] })
    })

    it("rejet d'une approche seulement compatible chez l'autre : pas une opposition, mais un conflit signalé", () => {
      expect(cmp({ x: pos(2), y: pos(1) }, { z: pos(2), y: rej() })).toMatchObject({ relation: 'different', conflicts: ['y'] })
      expect(cmp({ x: pos(2), y: pos(1) }, { x: pos(2), y: rej() })).toMatchObject({ relation: 'same', agreements: ['x'], conflicts: ['y'] })
    })

    it("plusieurs approches principales : le rejet de l'une l'emporte sur une principale commune", () => {
      expect(cmp({ x: pos(2), y: pos(2) }, { x: pos(2), y: rej() })).toMatchObject({ relation: 'opposed', agreements: ['x'], conflicts: ['y'] })
      expect(rel({ x: pos(2), y: pos(2) }, { y: pos(2) })).toBe('same')
    })

    it('sans approche principale, les approches compatibles sont les approches de tête', () => {
      expect(cmp({ y: pos(1) }, { y: pos(1) })).toMatchObject({ relation: 'same', sameLevel: 'compatible' })
      expect(rel({ y: pos(1) }, { y: pos(2) })).toBe('close')
      expect(rel({ y: pos(1) }, { x: pos(2), y: pos(1) })).toBe('close')
      expect(rel({ y: pos(1) }, { x: pos(2) })).toBe('different')
      // Rejeter la seule approche que l'autre soutient est une opposition
      expect(rel({ y: pos(1) }, { x: pos(2), y: rej() })).toBe('opposed')
    })

    it('sans approche soutenue, les rejets sont les approches de tête', () => {
      expect(cmp({ w: rej() }, { w: rej() })).toMatchObject({ relation: 'same', sameLevel: 'rejection' })
      expect(rel({ w: rej() }, { x: pos(2), w: rej() })).toBe('close')
      expect(rel({ w: rej() }, { w: pos(2) })).toBe('opposed')
      expect(rel({ w: rej() }, { w: pos(1) })).toBe('opposed')
      expect(rel({ w: rej() }, { x: pos(2) })).toBe('different')
      expect(rel({ w: rej() }, { z: rej() })).toBe('different')
    })

    it('une inférence ne fait pas une approche principale (même lecture que le score)', () => {
      const c = cmp({ x: inference(pos(2)) }, { x: pos(2) })
      expect(c.relation).toBe('close')
      expect(c.a).toMatchObject({ main: [], compatible: ['x'], lead: ['x'], leadLevel: 'compatible' })
    })

    it('une question sans approche : inconnue, sans erreur', () => {
      expect(cmp({ x: pos(2) }, { x: pos(2) }, question('vide', 't', []))).toMatchObject({ relation: 'unknown', uncertain: false })
    })
  })

  describe('positions à confirmer (confiance basse)', () => {
    it("ne changent rien quand la relation tient quelle que soit leur issue", () => {
      expect(rel({ x: pos(2), y: low(pos(1)) }, { x: pos(2) })).toBe('same')
      expect(rel({ x: pos(2), y: low(pos(1)) }, { z: pos(2) })).toBe('different')
      // Principale probable d, compatible sûre e : face à une principale e, c'est « close » dans les deux cas
      expect(rel({ d: low(pos(2)), e: pos(1) }, { e: pos(2) }, question('q5', 't', ['d', 'e']))).toBe('close')
    })

    it("rendent la relation inconnue (à confirmer) dès qu'elle en dépend", () => {
      expect(cmp({ x: pos(2), y: low(pos(1)) }, { y: pos(2) })).toMatchObject({ relation: 'unknown', uncertain: true })
      expect(cmp({ x: pos(2), w: low(rej()) }, { w: pos(2) })).toMatchObject({ relation: 'unknown', uncertain: true })
      expect(cmp({ d: low(pos(2)), e: pos(1) }, { d: pos(2) }, question('q5', 't', ['d', 'e']))).toMatchObject({ relation: 'unknown', uncertain: true })
      // Des deux côtés à la fois
      expect(cmp({ x: low(pos(2)) }, { x: low(pos(2)) })).toMatchObject({ relation: 'unknown', uncertain: true })
    })

    it('sont listées à part, jamais dans les approches tenues', () => {
      const c = cmp({ x: pos(2), y: low(pos(1)), w: low(rej()) }, { x: pos(2) })
      expect(c.a).toMatchObject({ main: ['x'], compatible: [], rejects: [], unconfirmed: ['y', 'w'] })
      expect(c.agreements).toEqual(['x'])
    })
  })
})

describe('relation : propriétés, sur toutes les combinaisons de trois approches', () => {
  const Q3 = question('q3', 't', ['x', 'y', 'z'])
  const states: (Position | undefined)[] = [undefined, pos(2), pos(1), rej(), low(pos(2)), low(rej()), inference(pos(2))]
  const tables: Table[] = []
  for (const sx of states) for (const sy of states) for (const sz of states) {
    const t: Table = {}
    if (sx) t.x = sx
    if (sy) t.y = sy
    if (sz) t.z = sz
    tables.push(t)
  }
  const confirmed = (t: Table) => Object.values(t).some(p => p.confidence !== 'low')
  const hasLow = (t: Table) => Object.values(t).some(p => p.confidence === 'low')

  // Les écarts sont collectés puis vérifiés d'un coup : 117 649 paires, un « expect » chacune serait lent
  const label = (t: Table) => JSON.stringify(Object.fromEntries(Object.entries(t).map(([k, p]) => [k, `${p.weight ?? 'rejet'}/${p.confidence}/${p.nature}`])))

  it('symétrie : relation(a, b) = relation(b, a), et le même détail', () => {
    const broken: string[] = []
    for (const ta of tables) {
      for (const tb of tables) {
        const ab = compareQuestion('a', 'b', Q3, { a: ta, b: tb })
        const ba = compareQuestion('b', 'a', Q3, { a: ta, b: tb })
        const same =
          ab.relation === ba.relation &&
          ab.uncertain === ba.uncertain &&
          ab.sameLevel === ba.sameLevel &&
          JSON.stringify([ab.agreements, ab.conflicts, ab.a, ab.b]) === JSON.stringify([ba.agreements, ba.conflicts, ba.b, ba.a])
        if (!same) broken.push(`${label(ta)} ↔ ${label(tb)}`)
      }
    }
    expect(broken).toEqual([])
  })

  it("un candidat comparé à lui-même est 'same' ou 'unknown'", () => {
    for (const t of tables) {
      const r = relation('a', 'a', Q3, { a: t })
      expect(['same', 'unknown']).toContain(r)
      if (confirmed(t) && !hasLow(t)) expect(r).toBe('same')
      if (!confirmed(t)) expect(r).toBe('unknown')
    }
  })

  it('cohérences : relation connue, opposition seulement sur un rejet, inconnue seulement faute de position confirmée', () => {
    const broken: string[] = []
    for (const ta of tables) {
      for (const tb of tables) {
        const c = cmp(ta, tb, Q3)
        const sure = !hasLow(ta) && !hasLow(tb)
        const fails = [
          !RELATIONS.includes(c.relation) && 'relation hors liste',
          (c.sameLevel !== undefined) !== (c.relation === 'same') && 'sameLevel',
          c.relation === 'opposed' && c.conflicts.length === 0 && 'opposition sans conflit',
          sure && c.uncertain && 'à confirmer sans position de confiance basse',
          c.uncertain && c.relation !== 'unknown' && 'à confirmer mais connue',
          c.relation === 'unknown' && !c.uncertain && confirmed(ta) && confirmed(tb) && 'inconnue malgré deux positions confirmées',
          sure && confirmed(ta) && confirmed(tb) && c.relation === 'unknown' && 'inconnue sans raison',
        ].filter(Boolean)
        if (fails.length) broken.push(`${label(ta)} ↔ ${label(tb)} : ${fails.join(', ')}`)
      }
    }
    expect(broken).toEqual([])
  })

  it('robuste à une question sans approche principale : une relation connue dès que les deux ont une position', () => {
    const noMain = tables.filter(t => Object.values(t).every(p => p.weight !== 2 || p.nature === 'inference'))
    for (const ta of noMain) {
      for (const tb of noMain) {
        const c = cmp(ta, tb, Q3)
        expect(c.a.main).toEqual([])
        if (confirmed(ta) && confirmed(tb) && !hasLow(ta) && !hasLow(tb)) expect(c.relation).not.toBe('unknown')
      }
    }
  })
})

const counts = (c: Partial<RelationCounts>): RelationCounts => ({ same: 0, close: 0, different: 0, opposed: 0, unknown: 0, ...c })

describe('verdict d’un thème', () => {
  it('« inconnu » : aucune question connue des deux', () => {
    expect(verdictOf(counts({}))).toBe('inconnu')
    expect(verdictOf(counts({ unknown: 4 }))).toBe('inconnu')
  })
  it('« proches » : une majorité d’accords (même approche ou compatibles), aucune opposition', () => {
    expect(verdictOf(counts({ same: 2, different: 1 }))).toBe('proches')
    expect(verdictOf(counts({ close: 1 }))).toBe('proches')
    expect(verdictOf(counts({ same: 1, close: 1, different: 1 }))).toBe('proches')
  })
  it('« opposés » : au moins la moitié en opposition et plus que d’accords, ou une opposition sans aucun accord', () => {
    expect(verdictOf(counts({ opposed: 1 }))).toBe('opposes')
    expect(verdictOf(counts({ opposed: 2, same: 1 }))).toBe('opposes')
    expect(verdictOf(counts({ opposed: 2, different: 2 }))).toBe('opposes')
    expect(verdictOf(counts({ opposed: 1, different: 4 }))).toBe('opposes')
  })
  it('« différents » : surtout des approches différentes, sans opposition', () => {
    expect(verdictOf(counts({ different: 1 }))).toBe('differents')
    expect(verdictOf(counts({ same: 1, different: 2 }))).toBe('differents')
  })
  it('« partagés » : un mélange', () => {
    expect(verdictOf(counts({ same: 1, different: 1 }))).toBe('partages')
    expect(verdictOf(counts({ close: 2, different: 2 }))).toBe('partages')
    // Proches sur l'essentiel mais un rejet explicite : jamais « proches »
    expect(verdictOf(counts({ same: 3, opposed: 1 }))).toBe('partages')
    // À égalité entre accords et oppositions, on ne tranche pas pour le désaccord
    expect(verdictOf(counts({ same: 1, opposed: 1 }))).toBe('partages')
    expect(verdictOf(counts({ same: 1, different: 3, opposed: 1 }))).toBe('partages')
  })
  it('les questions inconnues ne pèsent pas', () => {
    expect(verdictOf(counts({ same: 2, unknown: 10 }))).toBe('proches')
    expect(verdictOf(counts({ opposed: 1, unknown: 10 }))).toBe('opposes')
  })
  it('les seuils sont réglables', () => {
    expect(verdictOf(counts({ same: 1 }), { ...DEFAULT_THRESHOLDS, minKnown: 2 })).toBe('inconnu')
    expect(verdictOf(counts({ opposed: 1, different: 4 }), { ...DEFAULT_THRESHOLDS, opposedWithoutAgreement: false })).toBe('partages')
    expect(verdictOf(counts({ same: 3, opposed: 1 }), { ...DEFAULT_THRESHOLDS, nearMaxOpposed: 1 })).toBe('proches')
    expect(verdictOf(counts({ same: 2, different: 1 }), { ...DEFAULT_THRESHOLDS, nearShare: 0.7 })).toBe('partages')
    expect(verdictOf(counts({ opposed: 2, same: 1, different: 3 }))).toBe('partages')
    expect(verdictOf(counts({ opposed: 2, same: 1, different: 3 }), { ...DEFAULT_THRESHOLDS, opposedShare: 0.3 })).toBe('opposes')
    expect(verdictOf(counts({ same: 1, different: 2 }), { ...DEFAULT_THRESHOLDS, differentShare: 0.7 })).toBe('partages')
  })
  it('propriétés, sur tous les comptes de 0 à 4', () => {
    const range = [0, 1, 2, 3, 4]
    for (const same of range) for (const close of range) for (const different of range) for (const opposed of range) {
      const c = counts({ same, close, different, opposed })
      const v = verdictOf(c)
      const agree = same + close
      const known = agree + different + opposed
      expect(TOPIC_VERDICTS).toContain(v)
      expect(v === 'inconnu').toBe(known === 0)
      if (v === 'opposes') expect(opposed).toBeGreaterThan(0)
      if (v === 'proches') expect(opposed === 0 && agree > known / 2).toBe(true)
      if (v === 'differents') expect(opposed === 0 && different > known / 2).toBe(true)
      // Stable : des questions inconnues en plus ne changent rien
      expect(verdictOf({ ...c, unknown: 7 })).toBe(v)
      // Monotone : une opposition de plus n'en fait jamais des « proches »
      if (v !== 'proches') expect(verdictOf({ ...c, opposed: opposed + 1 })).not.toBe('proches')
    }
  })
})

// A et B très proches sur le thème 1, radicalement opposés sur le thème 2 ; C ailleurs, D inconnu.
const data: CompareData = {
  bank: {
    topics: [
      { id: 't1', label: 'Thème 1', description: '' },
      { id: 't2', label: 'Thème 2', description: '' },
      { id: 't3', label: 'Thème 3', description: '' },
    ],
    questions: [
      question('q1', 't1', ['q1a', 'q1b', 'q1c']),
      question('q2', 't1', ['q2a', 'q2b', 'q2c']),
      question('q3', 't2', ['q3a', 'q3b', 'q3c']),
      question('q4', 't2', ['q4a', 'q4b', 'q4c']),
      question('q5', 't3', ['q5a', 'q5b', 'q5c']),
    ],
  },
  positions: {
    a: { q1a: pos(2), q2a: pos(2), q3a: pos(2), q4a: pos(2), q4c: rej(), q5a: pos(2) },
    b: { q1a: pos(2), q2b: pos(2), q2a: pos(1), q3b: pos(2), q3a: rej(), q4c: pos(2), q5b: pos(2) },
    c: { q1c: pos(2), q2c: pos(2), q3a: pos(2), q4a: pos(1), q4b: pos(2), q5c: pos(2) },
    d: {},
  },
}

describe('topicRelation', () => {
  it('distingue un thème où deux candidats sont proches d’un thème où ils sont opposés', () => {
    const t1 = topicRelation('a', 'b', 't1', data)
    const t2 = topicRelation('a', 'b', 't2', data)
    expect(t1).toMatchObject({ verdict: 'proches', counts: counts({ same: 1, close: 1 }), known: 2, total: 2, uncertain: 0 })
    expect(t2).toMatchObject({ verdict: 'opposes', counts: counts({ opposed: 2 }), known: 2, total: 2 })
    expect(t1.questions.map(q => q.questionId)).toEqual(['q1', 'q2'])
    expect(t2.questions.map(q => q.relation)).toEqual(['opposed', 'opposed'])
  })
  it('symétrique, et inconnu pour un candidat sans position ou un thème absent', () => {
    for (const t of ['t1', 't2', 't3']) {
      expect(topicRelation('b', 'a', t, data).verdict).toBe(topicRelation('a', 'b', t, data).verdict)
      expect(topicRelation('a', 'd', t, data)).toMatchObject({ verdict: 'inconnu', known: 0 })
    }
    expect(topicRelation('a', 'b', 'absent', data)).toMatchObject({ verdict: 'inconnu', known: 0, total: 0, questions: [] })
  })
})

describe('overallPair', () => {
  it('compte chaque question pour une, sans pondération', () => {
    const o = overallPair('a', 'b', data)
    expect(o).toMatchObject({ a: 'a', b: 'b', counts: counts({ same: 1, close: 1, opposed: 2, different: 1 }), known: 5, total: 5, uncertain: 0 })
    expect(o.agreeShare).toBeCloseTo(2 / 5)
    expect(o.opposedShare).toBeCloseTo(2 / 5)
    expect(o.differentShare).toBeCloseTo(1 / 5)
    expect(o.topics).toEqual({ proches: 1, partages: 0, differents: 1, opposes: 1, inconnu: 0 })
  })
  it('parts nulles quand rien n’est connu des deux', () => {
    const o = overallPair('a', 'd', data)
    expect(o).toMatchObject({ known: 0, agreeShare: null, opposedShare: null, differentShare: null })
    expect(o.topics.inconnu).toBe(3)
  })
})

describe('groupe de 3 ou 4 candidats', () => {
  it('paires dans l’ordre choisi par la personne, sans doublon ; thèmes dans l’ordre de la banque', () => {
    const g = compareGroup(['c', 'a', 'b', 'a'], data)
    expect(g.candidates).toEqual(['c', 'a', 'b'])
    expect(g.topics.map(t => t.topicId)).toEqual(['t1', 't2', 't3'])
    expect(g.topics[0]!.pairs.map(p => `${p.a}-${p.b}`)).toEqual(['c-a', 'c-b', 'a-b'])
    expect(g.overall.map(p => `${p.a}-${p.b}`)).toEqual(['c-a', 'c-b', 'a-b'])
    expect(pairsOf(['w', 'x', 'y', 'z']).map(p => p.a + p.b)).toEqual(['wx', 'wy', 'wz', 'xy', 'xz', 'yz'])
  })

  it('l’ordre des candidats ne change aucun verdict ni aucun résumé', () => {
    const g1 = compareGroup(['a', 'b', 'c'], data)
    const g2 = compareGroup(['c', 'b', 'a'], data)
    const key = (a: string, b: string) => [a, b].sort().join('-')
    for (let i = 0; i < g1.topics.length; i++) {
      const v1 = Object.fromEntries(g1.topics[i]!.pairs.map(p => [key(p.a, p.b), p.comparison.verdict]))
      const v2 = Object.fromEntries(g2.topics[i]!.pairs.map(p => [key(p.a, p.b), p.comparison.verdict]))
      expect(v2).toEqual(v1)
      expect(g2.topics[i]!.summary.kind).toBe(g1.topics[i]!.summary.kind)
      expect(g2.topics[i]!.summary.apart).toBe(g1.topics[i]!.summary.apart)
    }
  })

  it('résume chaque thème en données : écart radical, inconnu, complétude', () => {
    const g = compareGroup(['a', 'b', 'c'], data)
    const [t1, t2, t3] = g.topics
    // t1 : a-b proches, a-c et b-c différents
    expect(t1!.summary).toMatchObject({ kind: 'contrastes', near: [{ a: 'a', b: 'b' }], opposed: [], apart: null, complete: true, knownPairs: 3, totalPairs: 3 })
    // t2 : a-b opposés ; c proche de a (q3), opposé à b (b rejette q3a, principale de c)
    expect(t2!.summary.kind).toBe('ecart-radical')
    expect(t2!.summary.opposed).toEqual([{ a: 'a', b: 'b' }, { a: 'b', b: 'c' }])
    expect(t2!.summary.apart).toBe('b')
    expect(t3!.summary.kind).toBe('tous-differents')
    const withD = compareGroup(['a', 'b', 'd'], data)
    expect(withD.topics[0]!.summary).toMatchObject({ kind: 'tous-proches', complete: false, knownPairs: 1, unknown: [{ a: 'a', b: 'd' }, { a: 'b', b: 'd' }] })
    expect(compareGroup(['d', 'a'], data).topics.every(t => t.summary.kind === 'inconnu')).toBe(true)
  })

  it('summarizeTopic : le candidat à l’écart n’existe qu’à partir de 3, opposé à chacun des autres', () => {
    const v = (a: string, b: string, verdict: TopicVerdict) => ({ a, b, verdict })
    const four = ['w', 'x', 'y', 'z']
    // z opposé à tous, les autres proches entre eux
    const apartZ = [v('w', 'x', 'proches'), v('w', 'y', 'proches'), v('w', 'z', 'opposes'), v('x', 'y', 'proches'), v('x', 'z', 'opposes'), v('y', 'z', 'opposes')]
    expect(summarizeTopic(apartZ, four)).toMatchObject({ kind: 'ecart-radical', apart: 'z' })
    // Deux écarts sans candidat commun : personne à l'écart
    const twoGaps = [v('w', 'x', 'opposes'), v('w', 'y', 'proches'), v('w', 'z', 'partages'), v('x', 'y', 'partages'), v('x', 'z', 'proches'), v('y', 'z', 'opposes')]
    expect(summarizeTopic(twoGaps, four)).toMatchObject({ kind: 'ecart-radical', apart: null, opposed: [{ a: 'w', b: 'x' }, { a: 'y', b: 'z' }] })
    // Une paire inconnue empêche d'être « à l'écart » de tous
    const partial = [v('w', 'x', 'proches'), v('w', 'y', 'opposes'), v('x', 'y', 'inconnu')]
    expect(summarizeTopic(partial, ['w', 'x', 'y'])).toMatchObject({ kind: 'ecart-radical', apart: null, complete: false })
    expect(summarizeTopic([v('w', 'x', 'opposes')], ['w', 'x'])).toMatchObject({ kind: 'ecart-radical', apart: null })
    expect(summarizeTopic([v('w', 'x', 'partages'), v('w', 'y', 'proches'), v('x', 'y', 'proches')], ['w', 'x', 'y']).kind).toBe('contrastes')
  })
})

describe('tableau : une ligne par question, une case par candidat', () => {
  const Q4 = question('q4', 't', ['x', 'y', 'z', 'w'])
  const row = (tables: Table[], q: Question = Q4) => {
    const ids = tables.map((_, i) => `c${i}`)
    return compareRow(ids, q, Object.fromEntries(tables.map((t, i) => [`c${i}`, t])))
  }

  it('lecture de la ligne à partir des paires : opposition d’abord, puis inconnue, même, compatibles, différentes, partagées', () => {
    expect(rowKindOf(['same', 'opposed', 'unknown'])).toBe('opposed')
    expect(rowKindOf(['unknown', 'unknown'])).toBe('unknown')
    expect(rowKindOf([])).toBe('unknown')
    expect(rowKindOf(['same', 'same', 'unknown'])).toBe('same')
    expect(rowKindOf(['same', 'close', 'close'])).toBe('close')
    expect(rowKindOf(['different', 'different', 'unknown'])).toBe('different')
    expect(rowKindOf(['same', 'different', 'different'])).toBe('mixed')
    expect(rowKindOf(['close', 'different', 'different'])).toBe('mixed')
  })

  it('à deux, la lecture de la ligne est la relation de la paire', () => {
    const states: (Position | undefined)[] = [undefined, pos(2), pos(1), rej(), low(pos(2))]
    const tables: Table[] = []
    for (const sx of states) for (const sy of states) {
      const t: Table = {}
      if (sx) t.x = sx
      if (sy) t.y = sy
      tables.push(t)
    }
    const expected: Record<Relation, RowKind> = { same: 'same', close: 'close', different: 'different', opposed: 'opposed', unknown: 'unknown' }
    for (const ta of tables) for (const tb of tables) {
      const r = row([ta, tb])
      expect(r.kind).toBe(expected[rel(ta, tb, Q4)])
      expect(r.complete).toBe(r.pairs[0]!.relation !== 'unknown')
    }
  })

  it('repères : les candidats qui tiennent la même approche partagent un groupe, numéroté dans l’ordre des colonnes', () => {
    // A A B : un groupe, les deux premiers
    let r = row([{ x: pos(2) }, { x: pos(2) }, { y: pos(2) }])
    expect(r.cells.map(c => c.group)).toEqual([0, 0, null])
    expect(r.cells[0]!.sameAs).toEqual(['c1'])
    expect(r.cells[2]!.sameAs).toEqual([])
    expect(r.kind).toBe('mixed')
    // B A B : le groupe prend le rang de sa première colonne
    r = row([{ y: pos(2) }, { x: pos(2) }, { y: pos(2) }])
    expect(r.cells.map(c => c.group)).toEqual([0, null, 0])
    // A A B B : deux groupes
    r = row([{ x: pos(2) }, { x: pos(2) }, { y: pos(2) }, { y: pos(2) }])
    expect(r.cells.map(c => c.group)).toEqual([0, 0, 1, 1])
    // Tous la même : un seul groupe, ligne « même approche »
    r = row([{ x: pos(2) }, { x: pos(2), z: pos(1) }, { x: pos(2) }])
    expect(r.cells.map(c => c.group)).toEqual([0, 0, 0])
    expect(r).toMatchObject({ kind: 'same', complete: true })
    // Chacun la sienne : aucun repère
    r = row([{ x: pos(2) }, { y: pos(2) }, { z: pos(2) }])
    expect(r.cells.map(c => c.group)).toEqual([null, null, null])
    expect(r.kind).toBe('different')
  })

  it('opposition : la case de celui qui rejette nomme l’autre et l’approche rejetée', () => {
    const r = row([{ x: pos(2) }, { y: pos(2), x: rej() }, { x: pos(2) }])
    expect(r.kind).toBe('opposed')
    expect(r.cells[1]!.rejects).toEqual([
      { candidate: 'c0', approaches: ['x'] },
      { candidate: 'c2', approaches: ['x'] },
    ])
    expect(r.cells[0]!.rejects).toEqual([])
    expect(r.cells.map(c => c.group)).toEqual([0, null, 0])
    // Rejeter une approche seulement compatible chez l'autre n'est pas une opposition : rien n'est annoncé
    const soft = row([{ x: pos(2), y: pos(1) }, { z: pos(2), y: rej() }])
    expect(soft.kind).toBe('different')
    expect(soft.cells[1]!.rejects).toEqual([])
  })

  it('compatible : la case de celui qui juge compatible l’approche de l’autre le dit', () => {
    const r = row([{ x: pos(2) }, { y: pos(2), x: pos(1) }])
    expect(r.kind).toBe('close')
    expect(r.cells[1]!.compatibleWith).toEqual([{ candidate: 'c0', approaches: ['x'] }])
    expect(r.cells[0]!.compatibleWith).toEqual([])
    // Sans approche principale chez l'autre, et personne ne la portant en principale : une approche compatible commune,
    // dite « aussi compatible », pas « l'approche de » l'autre (qui ne la porte pas)
    const lead = row([{ x: pos(1) }, { y: pos(2), x: pos(1) }])
    expect(lead.kind).toBe('close')
    expect(lead.cells[1]!.compatibleWith).toEqual([])
    expect(lead.cells[1]!.alsoCompatible).toEqual([{ candidate: 'c0', approaches: ['x'] }])
    // Un rejet partagé avec qui ne fait que rejeter
    const also = row([{ w: rej() }, { y: pos(2), w: rej() }])
    expect(also.kind).toBe('close')
    expect(also.cells[1]!.alsoRejects).toEqual([{ candidate: 'c0', approaches: ['w'] }])
  })

  it('compatible, même quand l’autre rejette son approche : l’ouverture de chacun se lit de son côté', () => {
    // c0 porte x et rejette y ; c1 porte y et juge x compatible : la paire est une opposition, et c1 reste ouvert à x
    const r = row([{ x: pos(2), y: rej() }, { y: pos(2), x: pos(1) }, { x: pos(2) }])
    expect(r.kind).toBe('opposed')
    expect(r.pairs[0]!.relation).toBe('opposed')
    expect(r.cells[1]!.compatibleWith).toEqual([
      { candidate: 'c0', approaches: ['x'] },
      { candidate: 'c2', approaches: ['x'] },
    ])
    expect(r.cells[0]!.rejects).toEqual([{ candidate: 'c1', approaches: ['y'] }])
    // Le revers : la case de celui dont l'approche est rejetée nomme qui la rejette
    expect(r.cells[1]!.rejectedBy).toEqual([{ candidate: 'c0', approaches: ['y'] }])
    expect(r.cells[0]!.rejectedBy).toEqual([])
    expect(r.cells[2]!.rejectedBy).toEqual([])
  })

  it('sans approche principale : on juge compatible l’approche de qui la porte, et seulement de lui', () => {
    // c0 porte x et juge y compatible ; c1 porte y ; c2 juge seulement y compatible
    const r = row([{ x: pos(2), y: pos(1) }, { y: pos(2) }, { y: pos(1) }])
    expect(r.cells[0]!.compatibleWith).toEqual([{ candidate: 'c1', approaches: ['y'] }])
    expect(r.cells[0]!.alsoCompatible).toEqual([])
    expect(r.cells[2]!.compatibleWith).toEqual([{ candidate: 'c1', approaches: ['y'] }])
    expect(r.cells[2]!.stance).toMatchObject({ leadLevel: 'compatible', lead: ['y'] })
    // Une relation à confirmer (c1 rejette peut-être x) : le lien de compatibilité, confirmé, reste dit ; le rejet
    // probable, lui, ne l'est pas
    const pending = row([{ x: pos(2), y: pos(1) }, { y: pos(2), x: low(rej()) }])
    expect(pending.kind).toBe('unknown')
    expect(pending.cells[0]!.compatibleWith).toEqual([{ candidate: 'c1', approaches: ['y'] }])
    expect(pending.cells[1]!.rejects).toEqual([])
    expect(pending.cells[0]!.rejectedBy).toEqual([])
    // Une position seulement probable ne fait aucun lien
    const probable = row([{ x: pos(2), y: pos(1) }, { y: low(pos(2)) }])
    expect(probable.cells[0]!.compatibleWith).toEqual([])
  })

  it('position inconnue : jamais devinée, la lecture ne vaut que parmi les positions connues', () => {
    const r = row([{ x: pos(2) }, {}, { x: pos(2) }])
    expect(r.cells.map(c => c.known)).toEqual([true, false, true])
    expect(r).toMatchObject({ kind: 'same', complete: false })
    expect(r.cells[1]!.group).toBeNull()
    expect(row([{ x: pos(2) }, {}, {}])).toMatchObject({ kind: 'unknown', complete: false })
    // Une position probable seulement : à confirmer, et la case la garde à part
    const pending = row([{ x: pos(2) }, { x: low(pos(2)) }])
    expect(pending.kind).toBe('unknown')
    expect(pending.cells[1]).toMatchObject({ known: false, uncertain: true })
    expect(pending.cells[1]!.stance.unconfirmed).toEqual(['x'])
  })

  it('l’ordre des colonnes ne change ni la lecture ni ce que dit chaque case', () => {
    const tables: Table[] = [{ x: pos(2) }, { y: pos(2), x: rej() }, { x: pos(2), z: pos(1) }, { z: pos(2), x: pos(1) }]
    const base = row(tables)
    const ids = ['c0', 'c1', 'c2', 'c3']
    const positions = Object.fromEntries(tables.map((t, i) => [`c${i}`, t]))
    for (const order of [[3, 2, 1, 0], [1, 3, 0, 2], [2, 0, 3, 1]]) {
      const r = compareRow(order.map(i => ids[i]!), Q4, positions)
      expect(r.kind).toBe(base.kind)
      for (const cell of r.cells) {
        const ref = base.cells.find(c => c.candidate === cell.candidate)!
        expect(new Set(cell.sameAs)).toEqual(new Set(ref.sameAs))
        expect(cell.group === null).toBe(ref.group === null)
        expect(new Set(cell.rejects.map(l => l.candidate))).toEqual(new Set(ref.rejects.map(l => l.candidate)))
        expect(new Set(cell.compatibleWith.map(l => l.candidate))).toEqual(new Set(ref.compatibleWith.map(l => l.candidate)))
        expect(new Set(cell.rejectedBy.map(l => l.candidate))).toEqual(new Set(ref.rejectedBy.map(l => l.candidate)))
        expect(cell.stance).toEqual(ref.stance)
      }
    }
  })

  for (const pack of elections) {
    it(`${pack.election.id} : un thème par thème de la banque, une ligne par question, des comptes cohérents`, () => {
      const ids = pack.candidates.map(c => c.id).slice(0, 4)
      const t = compareTable(ids, pack)
      expect(t.candidates).toEqual(ids)
      expect(t.topics.map(x => x.topicId)).toEqual(pack.bank.topics.map(x => x.id))
      expect(t.total).toBe(pack.bank.questions.length)
      expect(ROW_KINDS.reduce((n, k) => n + t.counts[k], 0)).toBe(t.total)
      for (const topic of t.topics) {
        expect(topic.rows.map(r => r.questionId)).toEqual(pack.bank.questions.filter(q => q.topicId === topic.topicId).map(q => q.id))
        for (const r of topic.rows) {
          expect(r.cells.map(c => c.candidate)).toEqual(ids)
          expect(r.pairs).toHaveLength(6)
          // Un repère n'est jamais seul, et ne touche qu'une position connue
          for (const c of r.cells) {
            if (c.group !== null) expect(r.cells.filter(o => o.group === c.group).length).toBeGreaterThan(1)
            if (!c.known) expect([c.group, c.rejects.length, c.rejectedBy.length, c.compatibleWith.length, c.alsoCompatible.length]).toEqual([null, 0, 0, 0, 0])
            // Chaque rejet a son revers dans la case de celui dont l'approche est rejetée
            for (const l of c.rejects) expect(r.cells.find(o => o.candidate === l.candidate)!.rejectedBy).toContainEqual({ candidate: c.candidate, approaches: l.approaches })
            for (const l of c.rejectedBy) expect(r.cells.find(o => o.candidate === l.candidate)!.rejects).toContainEqual({ candidate: c.candidate, approaches: l.approaches })
            // « Juge compatible l'approche de X » : X la porte en principale
            for (const l of c.compatibleWith) for (const a of l.approaches) expect(r.cells.find(o => o.candidate === l.candidate)!.stance.main).toContain(a)
          }
          expect(r.kind === 'opposed').toBe(r.cells.some(c => c.rejects.length > 0))
        }
      }
      // La vue d'ensemble : chaque paire compte de la même façon des deux côtés
      for (const o of t.overview) {
        expect(o.known).toBeLessThanOrEqual(t.total)
        for (const s of o.same) {
          const back = t.overview.find(x => x.candidate === s.candidate)!.same.find(x => x.candidate === o.candidate)!
          expect(back.count).toBe(s.count)
        }
      }
      // À deux, la lecture de chaque ligne est la relation de la paire
      const [a, b] = ids
      const pair = compareTable([a!, b!], pack)
      for (const topic of pair.topics) for (const r of topic.rows) expect(r.kind).toBe(relation(a!, b!, pack.bank.questions.find(q => q.id === r.questionId)!, pack.positions))
    })
  }
})

describe('primaire réelle : cohérence de la comparaison', () => {
  for (const pack of elections) {
    it(`${pack.election.id} : comptes cohérents pour chaque paire, chaque thème, chaque question`, () => {
      const ids = pack.candidates.map(c => c.id)
      const total = pack.bank.questions.length
      for (const { a, b } of pairsOf(ids)) {
        const o = overallPair(a, b, pack)
        const sum = RELATIONS.reduce((n, r) => n + o.counts[r], 0)
        expect(sum).toBe(total)
        expect(o.total).toBe(total)
        expect(o.known).toBe(total - o.counts.unknown)
        expect(o.uncertain).toBeLessThanOrEqual(o.counts.unknown)
        if (o.known > 0) expect(o.agreeShare! + o.differentShare! + o.opposedShare!).toBeCloseTo(1)
        expect(TOPIC_VERDICTS.reduce((n, v) => n + o.topics[v], 0)).toBe(pack.bank.topics.length)
        expect(overallPair(b, a, pack).counts).toEqual(o.counts)
      }

      const group = ids.slice(0, 4)
      const g = compareGroup(group, pack)
      expect(g.candidates).toEqual(group)
      expect(g.topics).toHaveLength(pack.bank.topics.length)
      for (const [i, p] of g.overall.entries()) {
        // La somme des thèmes redonne la vue d'ensemble
        const fromTopics = g.topics.reduce(
          (acc, t) => {
            const c = t.pairs[i]!.comparison
            for (const r of RELATIONS) acc[r] += c.counts[r]
            return acc
          },
          counts({}),
        )
        expect(fromTopics).toEqual(p.counts)
      }
      for (const t of g.topics) {
        expect(t.pairs).toHaveLength(6)
        expect(t.summary.totalPairs).toBe(6)
        expect(t.summary.knownPairs + t.summary.unknown.length).toBe(6)
        for (const p of t.pairs) {
          const c = p.comparison
          expect(c.total).toBe(pack.bank.questions.filter(q => q.topicId === t.topicId).length)
          expect(c.known).toBe(c.total - c.counts.unknown)
          for (const q of c.questions) {
            expect(q.topicId).toBe(t.topicId)
            expect(q.sameLevel !== undefined).toBe(q.relation === 'same')
            const r: Relation = relation(p.b, p.a, pack.bank.questions.find(x => x.id === q.questionId)!, pack.positions)
            expect(r).toBe(q.relation)
          }
        }
      }
    })
  }
})
