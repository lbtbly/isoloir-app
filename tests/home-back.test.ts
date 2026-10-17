import { describe, expect, it } from 'vitest'
import { firstSentence, newsSince, parisDay } from '../src/ui/screens/HomeBack'
import type { ChangelogEntry } from '../src/core/types'
import { elections } from '../src/elections/all'

const item = (n: number, date: string, effect: ChangelogEntry['effect']): ChangelogEntry => ({ n, date, title: `Entrée ${n}`, text: `Entrée ${n}.`, effect })

// Dans un ordre quelconque : le tri est celui de newsSince
const log = [
  item(6, '2026-10-14', 'sans-effet'),
  item(5, '2026-10-14', 'peut-changer'),
  item(4, '2026-10-12', 'sans-effet'),
  item(3, '2026-10-12', 'peut-changer'),
  item(2, '2026-10-10', 'sans-effet'),
  item(1, '2026-10-08', 'première-version'),
]

describe('accueil de retour : ce qui est nouveau depuis vos réponses', () => {
  it('les entrées postérieures aux réponses : celles qui peuvent changer le classement, les plus récentes d’abord', () => {
    const news = newsSince(log, '2026-10-11T20:15:00.000Z')
    expect(news.shown.map(e => e.n)).toEqual([5, 3])
    expect(news.total).toBe(4)
    // Aucune qui puisse changer le classement : les plus récentes
    expect(newsSince([log[0]!, log[2]!, log[4]!], '2026-10-01T08:00:00.000Z').shown.map(e => e.n)).toEqual([6, 4, 2])
  })

  it('rien le jour même des réponses, ni sans date de réponses ; trois au plus, et leur nombre en tout', () => {
    expect(newsSince(log, '2026-10-14T08:00:00.000Z')).toEqual({ shown: [], total: 0 })
    expect(newsSince(log, null)).toEqual({ shown: [], total: 0 })
    expect(newsSince(log, 'pas une date')).toEqual({ shown: [], total: 0 })
    const all = newsSince([...log, item(7, '2026-10-15', 'peut-changer'), item(8, '2026-10-15', 'peut-changer')], '2026-10-01T08:00:00.000Z')
    expect(all.shown.map(e => e.n)).toEqual([8, 7, 5])
    expect(all.total).toBe(8)
  })

  it('le jour des réponses est celui de Paris, comme les dates du journal (minuit à 2 h, heure d’été)', () => {
    // 14 octobre à 1 h, heure de Paris : encore le 13 en UTC
    expect(parisDay('2026-10-13T23:00:00.000Z')).toBe('2026-10-14')
    expect(newsSince(log, '2026-10-13T23:00:00.000Z').total).toBe(0)
    // 13 octobre à 23 h 30, heure de Paris : le 14 n'est pas encore là
    expect(parisDay('2026-10-13T21:30:00.000Z')).toBe('2026-10-13')
    expect(newsSince(log, '2026-10-13T21:30:00.000Z').shown.map(e => e.n)).toEqual([5])
    // Heure d'hiver : 1er janvier à 0 h 30 à Paris
    expect(parisDay('2026-12-31T23:30:00.000Z')).toBe('2027-01-01')
  })

  it('les vraies entrées : un titre pour chacune, et l’effet de celles qui viennent en tête', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const news = newsSince(pack.election.changelog, '2026-10-11T08:00:00.000Z')
    expect(news.shown.length).toBe(3)
    for (const e of news.shown) {
      expect(e.effect).toBe('peut-changer')
      expect(e.title?.length).toBeGreaterThan(10)
    }
  })

  it('la première phrase d’une entrée, sans couper sur un nombre ni sur des guillemets', () => {
    expect(firstSentence('Nouvelle page. Le score ne change pas.')).toBe('Nouvelle page.')
    expect(firstSentence('La question «\u00a0Quelle dette\u00a0?\u00a0» change. Le reste non.')).toBe('La question «\u00a0Quelle dette\u00a0?\u00a0» change.')
    expect(firstSentence('La question « Quelle dette ? » change. Le reste non.')).toBe('La question « Quelle dette ? » change.')
    expect(firstSentence('Passe de 1.5 à 2. Le reste non.')).toBe('Passe de 1.5 à 2.')
    expect(firstSentence('Version 2.0. Rien ne change.')).toBe('Version 2.0.')
    expect(firstSentence('Une seule phrase sans point final')).toBe('Une seule phrase sans point final')
  })
})
