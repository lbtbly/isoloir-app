import { describe, expect, it } from 'vitest'
import { buildExport, parseImport } from '../src/core/exportData'
import { currentAnswers, staleQuestions } from '../src/core/revisions'
import { computeResults } from '../src/core/score'
import { essentialComplete, freshState, migrateAnswers, sanitizeState } from '../src/core/storage'
import type { ElectionPack } from '../src/core/types'
import { pack } from './fixture'

describe('migrateAnswers', () => {
  it('retire les questions et approches disparues', () => {
    const out = migrateAnswers(
      { q1: { ratings: { q1a: 1, zz: 1 }, redLines: ['zz'] }, old: { ratings: { x: 1 }, redLines: [] } },
      pack.bank,
    )
    expect(out).toEqual({ q1: { ratings: { q1a: 1 }, redLines: [] } })
  })

  it('convertit les anciennes réponses à cases : cochée → d’accord, rayée → ligne rouge', () => {
    const out = migrateAnswers(
      {
        q1: { liked: ['q1a', 'zz'], rejected: ['q1a', 'q1b'] },
        q2: { liked: [], rejected: [], none: true },
        q3: { liked: [], rejected: [], skipped: true },
      },
      pack.bank,
    )
    expect(out).toEqual({
      q1: { ratings: { q1a: 1, q1b: -1 }, redLines: ['q1b'] },
      q2: { ratings: { q2a: -1, q2b: -1 }, redLines: [] },
      q3: { ratings: {}, redLines: [], skipped: true },
    })
  })

  it('ramène la réglette à cinq crans de la version de test au seul sens de l’avis', () => {
    const out = migrateAnswers({ q1: { ratings: { q1a: 2, q1b: -1, q1c: -2 }, redLines: ['q1c'] } }, pack.bank)
    expect(out).toEqual({ q1: { ratings: { q1a: 1, q1b: -1, q1c: -1 }, redLines: ['q1c'] } })
  })

  it('écarte les crans invalides, force « pas d’accord » sous une ligne rouge et garde la révision', () => {
    const out = migrateAnswers(
      { q1: { ratings: { q1a: 3, q1b: 1, q1c: 'x' }, redLines: ['q1b', 'q1b'], rev: 2 }, q2: { ratings: {}, redLines: [] } },
      pack.bank,
    )
    expect(out).toEqual({ q1: { ratings: { q1b: -1 }, redLines: ['q1b'], rev: 2 } })
  })
})

describe('sanitizeState', () => {
  it('garde tous les thèmes choisis pour l’approfondissement, au-delà de 12', () => {
    const topics = Array.from({ length: 21 }, (_, i) => ({ id: `t${i}`, label: `T${i}`, description: '' }))
    const big: ElectionPack = { ...pack, bank: { ...pack.bank, topics } }
    const state = sanitizeState({ ...freshState('test', '1'), deepTopics: [...topics.map(t => t.id), 'inconnu'] }, big)
    expect(state?.deepTopics).toEqual(topics.map(t => t.id))
  })

  it('date la fin du questionnaire rapide, et garde la date si une question y est ajoutée ensuite', () => {
    const essential = pack.bank.questions.filter(q => q.tier === 'essentiel')
    const all = Object.fromEntries(essential.map(q => [q.id, { ratings: {}, redLines: [], skipped: true }]))
    expect(essentialComplete(pack.bank, all)).toBe(true)
    // Sauvegarde antérieure au champ : la dernière modification en tient lieu
    const old = sanitizeState({ ...freshState('test', '1'), answers: all, updatedAt: '2026-10-03T10:00:00.000Z', essentialDoneAt: undefined }, pack)
    expect(old?.essentialDoneAt).toBe('2026-10-03T10:00:00.000Z')
    // Une question ajoutée : la feuille n'est plus complète, mais la date reste pour le signaler
    const added: ElectionPack = {
      ...pack,
      bank: { ...pack.bank, questions: [...pack.bank.questions, { ...essential[0]!, id: 'nouvelle', approaches: [{ id: 'na', text: 'A' }] }] },
    }
    const after = sanitizeState({ ...freshState('test', '1'), answers: all, essentialDoneAt: '2026-10-03T10:00:00.000Z' }, added)
    expect(essentialComplete(added.bank, after!.answers)).toBe(false)
    expect(after?.essentialDoneAt).toBe('2026-10-03T10:00:00.000Z')
    // Valeur douteuse : ignorée
    expect(sanitizeState({ ...freshState('test', '1'), essentialDoneAt: 'hier' }, pack)?.essentialDoneAt).toBeNull()
  })
})

describe('export / import', () => {
  const state = {
    ...freshState('test', '1'),
    answers: { q1: { ratings: { q1a: 1 as const, q1c: -1 as const }, redLines: ['q1c'] } },
    weights: { t2: 2 as const },
  }

  it("fait l'aller-retour sans perte", () => {
    const results = computeResults(pack, state.answers, state.weights, state.seed)
    const file = buildExport(pack, state, results, new Date('2026-10-03T10:00:00Z'))
    expect(file.readable[0]!.avis).toEqual([
      { approche: 'A', avis: 'D’accord', ligneRouge: false },
      { approche: 'C', avis: 'Pas d’accord', ligneRouge: true },
    ])
    const back = parseImport(JSON.stringify(file), pack)
    expect(back.ok).toBe(true)
    if (back.ok) {
      expect(back.state.answers).toEqual(state.answers)
      expect(back.state.weights).toEqual(state.weights)
      expect(back.state.seed).toBe(state.seed)
      expect(back.review).toBe(0)
    }
  })

  it('lit un double du format à cases', () => {
    const old = { application: 'Isoloir', format: 1, electionId: 'test', state: { electionId: 'test', answers: { q1: { liked: ['q1a'], rejected: ['q1c'] } } } }
    const back = parseImport(JSON.stringify(old), pack)
    expect(back.ok && back.state.answers).toEqual(state.answers)
  })

  it('ne compte comme ignorées que les réponses dont la question a disparu', () => {
    const file = {
      electionId: 'test',
      state: { ...freshState('test', '1'), answers: { q1: { ratings: { q1a: 1 }, redLines: [] }, q2: { ratings: {}, redLines: [] }, ancienne: { ratings: { x: 1 } } } },
    }
    const back = parseImport(JSON.stringify(file), pack)
    expect(back.ok && back.dropped).toBe(1)
  })

  it('refuse un fichier d’une version plus récente', () => {
    const back = parseImport(JSON.stringify({ format: 99, electionId: 'test', state: freshState('test', '1') }), pack)
    expect(back.ok).toBe(false)
  })

  it('refuse un fichier d’une autre élection ou illisible', () => {
    expect(parseImport('pas du json', pack).ok).toBe(false)
    expect(parseImport(JSON.stringify({ electionId: 'autre', state: {} }), pack).ok).toBe(false)
  })
})

describe('révisions des questions', () => {
  // q1 a changé sur le fond depuis la révision 1
  const revised = (tracking: boolean): ElectionPack => ({
    ...pack,
    election: { ...pack.election, revisionTracking: tracking },
    bank: { ...pack.bank, questions: pack.bank.questions.map(q => (q.id === 'q1' ? { ...q, rev: 2 } : q)) },
  })
  const answers = {
    q1: { ratings: { q1a: 1 as const }, redLines: [] },
    q2: { ratings: { q2a: -1 as const }, redLines: [] },
    q3: { ratings: { q3a: 1 as const }, redLines: [], rev: 1 },
  }

  it('suivi coupé (phase de test) : toutes les réponses restent valables', () => {
    expect(staleQuestions(revised(false), answers)).toEqual([])
    expect(currentAnswers(revised(false), answers)).toBe(answers)
  })

  it('suivi actif : une réponse d’une autre révision est mise de côté, à revoir', () => {
    const p = revised(true)
    expect(staleQuestions(p, answers).map(q => q.id)).toEqual(['q1'])
    expect(Object.keys(currentAnswers(p, answers))).toEqual(['q2', 'q3'])
    expect(staleQuestions(p, { ...answers, q1: { ...answers.q1, rev: 2 } })).toEqual([])
  })

  it('à l’import, compte les réponses à revoir sans les perdre', () => {
    const p = revised(true)
    const file = { electionId: 'test', state: { ...freshState('test', '1'), answers } }
    const back = parseImport(JSON.stringify(file), p)
    expect(back.ok).toBe(true)
    if (back.ok) {
      expect(back.review).toBe(1)
      expect(back.state.answers.q1).toEqual(answers.q1)
    }
    expect(sanitizeState(file.state, p)?.answers.q1).toEqual(answers.q1)
  })
})
