import { describe, expect, it } from 'vitest'
import { buildExport, parseImport } from '../src/core/exportData'
import { currentAnswers, staleQuestions } from '../src/core/revisions'
import { computeResults } from '../src/core/score'
import { essentialComplete, freshState, inputsKey, migrateAnswers, sanitizeState } from '../src/core/storage'
import { updateMoves } from '../src/core/resultsCopy'
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

describe('mise à jour des données entre deux visites', () => {
  // Décision du propriétaire du 17 octobre 2026 : l'avis du dépouillement dit ce qui a bougé pour la personne, d'après le
  // classement de sa dernière visite d'avant la mise à jour (beforeUpdate), figé jusqu'à « Compris » ; le repère des
  // « +3 pts depuis votre dernier passage » (lastSeenRanking) suit, lui, chaque visite
  const ranking = pack.candidates.map((c, i) => ({ candidateId: c.id, score: 60 - i }))
  const answers = { q1: { ratings: { q1a: 1 as const }, redLines: [] } }
  const weights = { t1: 2 as const }
  const at = '2026-10-12T10:00:00.000Z'
  /** Une visite des résultats sur ces réponses, en version 0 */
  const visited = (o: object = {}) => ({ ...freshState('test', '0'), answers, weights, lastSeenRanking: ranking, lastSeenBasis: { inputs: inputsKey(answers, weights), at }, ...o })

  it('l’empreinte des réponses et des priorités : la même quel que soit l’ordre des clés, autre dès qu’un avis change', () => {
    const k = inputsKey({ q1: { ratings: { q1a: 1, q1b: -1 }, redLines: ['q1b', 'q1c'] } }, { t1: 2, t2: 0.5 })
    expect(k).toMatch(/^[0-9a-f]{8}$/)
    expect(inputsKey({ q1: { redLines: ['q1c', 'q1b'], ratings: { q1b: -1, q1a: 1 } } }, { t2: 0.5, t1: 2 })).toBe(k)
    expect(inputsKey({ q1: { ratings: { q1a: 1, q1b: 1 }, redLines: ['q1b', 'q1c'] } }, { t1: 2, t2: 0.5 })).not.toBe(k)
    expect(inputsKey({ q1: { ratings: { q1a: 1, q1b: -1 }, redLines: ['q1b', 'q1c'] } }, { t1: 2 })).not.toBe(k)
  })

  it('le classement de la visite d’avant est gardé à part, avec l’instant de la visite, et la version d’avant est notée', () => {
    const state = sanitizeState(visited(), pack)
    expect(state?.dataVersion).toBe('1')
    expect(state?.dataUpdatedFrom).toBe('0')
    expect(state?.lastSeenRanking).toEqual(ranking)
    expect(state?.beforeUpdate).toEqual({ ranking, inputs: inputsKey(state!.answers, state!.weights), at, left: 0 })
    // Mêmes réponses, mêmes priorités : l'avis dit ce qui a bougé
    expect(updateMoves(state!.beforeUpdate!.ranking, ranking, state!.beforeUpdate!.left)).toBe('Pour vous\u00a0: rien n’a bougé, même ordre, mêmes scores.')
  })

  it('des réponses changées entre la visite et la mise à jour : l’avis ne dit rien de précis', () => {
    const state = sanitizeState(visited({ answers: { ...answers, q2: { ratings: { q2a: 1 }, redLines: [] } } }), pack)
    expect(state?.beforeUpdate?.ranking).toEqual(ranking)
    expect(state?.beforeUpdate?.inputs).toBeNull()
    // Sans empreinte (sauvegarde d'avant le 17 octobre 2026) : de même
    expect(sanitizeState(visited({ lastSeenBasis: undefined }), pack)?.beforeUpdate?.inputs).toBeNull()
  })

  it('deux mises à jour avant « Compris » : la plus ancienne version et le plus ancien classement restent ceux du dernier passage', () => {
    const first = sanitizeState(visited({ dataVersion: '0' }), { ...pack, election: { ...pack.election, dataVersion: '0.5' } })!
    // Une visite après la première mise à jour : le repère suit, l'avis garde le classement d'avant
    const later = ranking.map(r => ({ ...r, score: r.score + 1 }))
    const state = sanitizeState({ ...first, lastSeenRanking: later, lastSeenBasis: { inputs: inputsKey(first.answers, first.weights), at: '2026-10-14T10:00:00.000Z' } }, pack)
    expect(state?.dataUpdatedFrom).toBe('0')
    expect(state?.lastSeenRanking).toEqual(later)
    expect(state?.beforeUpdate).toEqual({ ranking, inputs: inputsKey(state!.answers, state!.weights), at, left: 0 })
    // Même version, avis refermé (« Compris ») : rien à dire, rien de gardé
    const closed = sanitizeState({ ...state, dataUpdatedFrom: null, beforeUpdate: null }, pack)
    expect(closed?.dataUpdatedFrom).toBeNull()
    expect(closed?.beforeUpdate).toBeNull()
    // Une valeur douteuse : ignorée
    expect(sanitizeState({ ...state, beforeUpdate: { ranking: 'x', left: -1 } }, pack)?.beforeUpdate).toBeNull()
  })

  it('un candidat qui ne fait plus partie du classement (masqué, retiré ou devenu non classé) est compté parmi ceux qui l’ont quitté', () => {
    // a et b : les deux en tête à la visite ; depuis, a n'est plus présenté et b n'est plus classé
    const now: ElectionPack = {
      ...pack,
      candidates: pack.candidates.filter(c => c.id !== 'a'),
      election: { ...pack.election, ranking: { minCoverageShare: 0.5, excluded: { ids: ['b'], reason: 'test', since: '2026-10-01' } } },
    }
    const state = sanitizeState(visited(), now)!
    expect(state.lastSeenRanking).toEqual([{ candidateId: 'c', score: 58 }])
    expect(state.beforeUpdate).toMatchObject({ ranking: [{ candidateId: 'c', score: 58 }], left: 2 })
    // L'avis ne dit pas « rien n'a bougé » : les deux sont comptés
    expect(updateMoves(state.beforeUpdate!.ranking, [{ candidateId: 'c', score: 58 }], state.beforeUpdate!.left)).toBe(
      'Pour vous\u00a0: même ordre pour les autres\u00a0; 2\u00a0candidats l’ont quitté.',
    )
    // Une seconde mise à jour avant « Compris » : le compte s'ajoute
    const again = sanitizeState({ ...state, dataVersion: '0.9' }, { ...now, candidates: now.candidates.filter(c => c.id !== 'c') })!
    expect(again.beforeUpdate).toMatchObject({ ranking: [], left: 3 })
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
