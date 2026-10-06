import { describe, expect, it } from 'vitest'
import { classifyChange, nextRevision, type QuestionText } from '../src/core/revisions'

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
