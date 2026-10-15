import { describe, expect, it } from 'vitest'
import { classifyChange, freshApproaches, nextRevision, type QuestionText } from '../src/core/revisions'
import type { Answer, Question } from '../src/core/types'

const base: QuestionText = {
  prompt: 'Comment organiser la semaine des écoliers ?',
  approaches: {
    a: 'Passer à quatre jours et demi de classe',
    b: 'Garder la semaine de quatre jours',
    c: 'Laisser chaque commune décider',
  },
}
const edit = (patch: Partial<QuestionText['approaches']>, prompt = base.prompt): QuestionText => ({
  prompt,
  approaches: { ...base.approaches, ...patch } as Record<string, string>,
})

describe('classement forme / fond', () => {
  it('ignore la typographie : apostrophes, espaces insécables, casse, accents', () => {
    expect(classifyChange(base, edit({}, 'Comment organiser la semaine des ecoliers ?'))).toBe('same')
    expect(classifyChange(base, edit({ c: 'Laisser chaque commune décider ' }))).toBe('same')
  })

  it('une coquille corrigée est une retouche de forme : la réponse reste valable', () => {
    expect(classifyChange(base, edit({ a: 'Passer à quatre jours et demie de classe' }))).toBe('forme')
    expect(classifyChange(base, edit({ b: 'Garder la semaine des quatre jours' }))).toBe('forme')
  })

  it('une reformulation qui change le sens est un changement de fond', () => {
    expect(classifyChange(base, edit({ b: 'Revenir à une semaine de cinq jours partout' }))).toBe('fond')
    expect(classifyChange(base, edit({}, 'Faut-il allonger les vacances d’été ?'))).toBe('fond')
  })

  it('une approche ajoutée ou retirée est un changement de fond', () => {
    expect(classifyChange(base, edit({ d: 'Supprimer le mercredi libre' }))).toBe('fond')
    const two = Object.fromEntries(Object.entries(base.approaches).filter(([id]) => id !== 'c'))
    expect(classifyChange(base, { prompt: base.prompt, approaches: two })).toBe('fond')
  })
})

describe('registre des révisions', () => {
  it('commence à 1, garde la révision sur une retouche, l’incrémente sur un changement de fond', () => {
    const r1 = nextRevision(undefined, base).entry
    expect(r1.rev).toBe(1)
    const same = nextRevision(r1, base)
    expect(same.change).toBe('same')
    const form = nextRevision(r1, edit({ a: 'Passer à quatre jours et demie de classe' }))
    expect(form.entry).toMatchObject({ rev: 1, minor: 1 })
    const deep = nextRevision(form.entry, edit({ d: 'Supprimer le mercredi libre' }))
    expect(deep.entry).toMatchObject({ rev: 2, minor: 0 })
  })

  it('des retouches successives finissent par compter comme un changement de fond', () => {
    let entry = nextRevision(undefined, base).entry
    const steps = [
      'Garder la semaine des quatre jours',
      'Garder une semaine des quatre jours',
      'Conserver une semaine des quatre jours',
    ]
    const changes = steps.map(b => {
      const r = nextRevision(entry, edit({ b }))
      entry = r.entry
      return r.change
    })
    // Chaque retouche est petite, mais l'écart au texte de référence grandit jusqu'au changement de fond
    expect(changes).toEqual(['forme', 'forme', 'fond'])
    expect(entry.rev).toBe(2)
  })
})

describe('approches nouvelles depuis la réponse', () => {
  it('le registre date l’arrivée d’une approche ajoutée, la garde aux révisions suivantes, l’oublie si elle part', () => {
    const r1 = nextRevision(undefined, base).entry
    expect(r1.since).toBeUndefined()
    const r2 = nextRevision(r1, edit({ d: 'Laisser chaque école décider avec les parents' })).entry
    expect(r2.rev).toBe(2)
    expect(r2.since).toEqual({ d: 2 })
    // Une retouche de forme ne change rien ; un nouveau changement de fond garde l'arrivée de d et date celle de e
    const r2b = nextRevision(r2, edit({ d: 'Laisser chaque école décider avec les parents ' })).entry
    expect(r2b.since).toEqual({ d: 2 })
    const r3 = nextRevision(r2b, edit({ d: 'Laisser chaque école décider avec les parents', e: 'Raccourcir les vacances d’été' })).entry
    expect(r3.rev).toBe(3)
    expect(r3.since).toEqual({ d: 2, e: 3 })
    // d retirée : son arrivée disparaît
    const r4 = nextRevision(r3, { prompt: base.prompt, approaches: { ...base.approaches, e: 'Raccourcir les vacances d’été' } }).entry
    expect(r4.since).toEqual({ e: 3 })
  })

  it('les approches arrivées après la révision de la réponse, seulement pour une réponse à revoir', () => {
    const q = {
      id: 'q',
      topicId: 't',
      tier: 'essentiel',
      rev: 3,
      prompt: base.prompt,
      approaches: [
        { id: 'a', text: 'A' },
        { id: 'd', text: 'D', since: 2 },
        { id: 'e', text: 'E', since: 3 },
      ],
    } as unknown as Question
    const answer = (rev?: number): Answer => ({ ratings: { a: 1 }, redLines: [], ...(rev ? { rev } : {}) })
    expect([...freshApproaches(q, answer(1), true)]).toEqual(['d', 'e'])
    expect([...freshApproaches(q, undefined, true)]).toEqual([])
    expect([...freshApproaches(q, answer(2), true)]).toEqual(['e'])
    expect([...freshApproaches(q, answer(3), true)]).toEqual([])
    // Sans suivi des révisions, rien n'est à revoir
    expect([...freshApproaches(q, answer(1), false)]).toEqual([])
    // Une question passée sur une ancienne révision : ses approches nouvelles aussi
    expect([...freshApproaches(q, { ratings: {}, redLines: [], skipped: true }, true)]).toEqual(['d', 'e'])
  })

  it('les deux approches arrivées le 14 octobre 2026 sont datées dans la banque', async () => {
    const { bank } = await import('../src/elections/presidentielle-2027/bank')
    const since = bank.questions.flatMap(q => q.approaches.filter(a => a.since).map(a => `${a.id}:${a.since}:${q.rev}`))
    expect(since.sort()).toEqual(['europe-3-f:2:2', 'finances_publiques-1-h:2:2'])
  })
})
