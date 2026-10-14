// « Mon profil politique » : quand la page s'affiche (core/profileAccess.ts, la même règle sur l'accueil, le dépouillement
// et la page) et quels thèmes la fiche « Pour lire plus de thèmes » nomme (core/echiquier.ts, deeperTopics).
import { describe, expect, it } from 'vitest'
import { deeperTopics } from '../src/core/echiquier'
import { orderedQuestions } from '../src/core/order'
import { profileAccess } from '../src/core/profileAccess'
import type { Answer, Answers, ElectionPack, Question } from '../src/core/types'
import { elections } from '../src/elections/all'

const pack = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
const { bank } = pack
const essential = orderedQuestions(bank, 'essentiel', '0123456789abcdef')
const deep = bank.questions.filter(q => q.tier !== 'essentiel')
const agree = (q: Question): Answer => ({ ratings: { [q.approaches[0]!.id]: 1 }, redLines: [] })
const skip: Answer = { ratings: {}, redLines: [], skipped: true }
const sheet = (list: readonly Question[], answer: (q: Question, i: number) => Answer = agree): Answers =>
  Object.fromEntries(list.map((q, i) => [q.id, answer(q, i)]))
const access = (answers: Answers, current: Answers = answers, doneAt: string | null = null) =>
  profileAccess(bank.questions, essential, answers, current, doneAt)

describe('profileAccess : la page s’affiche au bout du questionnaire rapide, avec au moins un avis', () => {
  it('feuille vierge : vide, première question', () => {
    expect(access({})).toEqual({ state: 'vide', seen: 0, total: essential.length, left: essential.length, href: '/feuille/1', added: false })
  })

  it('en cours, questions passées comprises : il reste à voir, et l’on reprend à la première non vue', () => {
    const answers = sheet(essential.slice(0, 7), (q, i) => (i < 2 ? skip : agree(q)))
    const a = access(answers)
    expect(a).toMatchObject({ state: 'en-cours', seen: 7, left: essential.length - 7, href: '/feuille/8', added: false })
    // Une question sautée plus loin : on reprend au premier trou, pas après la dernière vue
    const gap = sheet([...essential.slice(0, 3), ...essential.slice(4, 9)])
    expect(access(gap).href).toBe('/feuille/4')
  })

  it('tendance (premier temps fini) : toujours en cours', () => {
    const step1 = essential.filter(q => q.step === 1).length || 10
    expect(access(sheet(essential.slice(0, step1))).state).toBe('en-cours')
  })

  it('tout vu sans aucun avis : sans-avis, et l’on relit la feuille depuis le début', () => {
    expect(access(sheet(essential, () => skip))).toMatchObject({ state: 'sans-avis', seen: essential.length, left: 0, href: '/feuille/1' })
  })

  it('tout vu avec un avis : prête ; un avis sur une question approfondie suffit', () => {
    expect(access(sheet(essential)).state).toBe('pret')
    const deepOnly = { ...sheet(essential, () => skip), [deep[0]!.id]: agree(deep[0]!) }
    expect(access(deepOnly).state).toBe('pret')
  })

  it('questions ajoutées depuis un questionnaire fini : en cours, et dit comme tel', () => {
    const answers = sheet(essential.slice(0, -1))
    expect(access(answers, answers, '2026-10-12T10:00:00.000Z')).toMatchObject({ state: 'en-cours', left: 1, added: true, href: `/feuille/${essential.length}` })
    // Sans date de fin, rien d'ajouté
    expect(access(answers).added).toBe(false)
  })

  it('les avis comptés sont ceux qui comptent : tous sur des questions à revoir, la page attend', () => {
    expect(access(sheet(essential), {}).state).toBe('sans-avis')
  })
})

describe('deeperTopics : les thèmes à compléter pour être lus seuls', () => {
  const topicsWithDeep = new Set(deep.map(q => q.topicId))

  it('au questionnaire rapide seul : les thèmes d’une seule question et ceux sans réponse, s’il reste à approfondir', () => {
    const answers = sheet(essential)
    const { thin, none } = deeperTopics(pack, answers, answers)
    const count = (t: string) => essential.filter(q => q.topicId === t).length
    const expectedThin = bank.topics.filter(t => count(t.id) === 1 && topicsWithDeep.has(t.id)).map(t => t.id)
    const expectedNone = bank.topics.filter(t => count(t.id) === 0 && topicsWithDeep.has(t.id)).map(t => t.id)
    expect(thin).toEqual(expectedThin)
    expect(none).toEqual(expectedNone)
    // Les chiffres de l'étude, sur la présidentielle : 16 thèmes sur une seule question, 5 sans réponse
    expect([thin.length, none.length]).toEqual([16, 5])
  })

  it('tout approfondi : plus rien à compléter', () => {
    const answers = sheet(bank.questions)
    expect(deeperTopics(pack, answers, answers)).toEqual({ thin: [], none: [] })
  })

  it('questions approfondies passées : le thème reste listé (la page Approfondir les garde à faire)', () => {
    const answers = sheet([...essential, ...deep], q => (q.tier === 'essentiel' ? agree(q) : skip))
    const { thin, none } = deeperTopics(pack, answers, answers)
    expect(thin.length + none.length).toBe(21)
  })
})
