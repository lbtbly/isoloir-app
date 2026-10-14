import { describe, expect, it } from 'vitest'
import { firstSentence, newsSince, parisDay } from '../src/ui/screens/HomeBack'
import { election } from '../src/elections/presidentielle-2027/election'

const log = [
  { date: '2026-10-14', text: 'Nouvelle candidate. Le classement ne change pas.' },
  { date: '2026-10-14', text: 'Détail de la mise à jour du 14 octobre.' },
  { date: '2026-10-12', text: 'Nouvelle page. Le score ne change pas.' },
  { date: '2026-10-10', text: 'Retour des vidéos.' },
  { date: '2026-10-08', text: 'Première version en ligne.' },
]

describe('accueil de retour : ce qui est nouveau depuis vos réponses', () => {
  it('ne garde que les jours postérieurs aux réponses, une entrée par jour (la première écrite), les plus récents d’abord', () => {
    expect(newsSince(log, '2026-10-11T20:15:00.000Z').map(e => e.text)).toEqual([
      'Nouvelle candidate. Le classement ne change pas.',
      'Nouvelle page. Le score ne change pas.',
    ])
  })

  it('rien le jour même des réponses, ni sans date de réponses ; trois jours au plus', () => {
    expect(newsSince(log, '2026-10-14T08:00:00.000Z')).toEqual([])
    expect(newsSince(log, null)).toEqual([])
    expect(newsSince(log, 'pas une date')).toEqual([])
    expect(newsSince(log, '2026-10-01T08:00:00.000Z').map(e => e.date)).toEqual(['2026-10-14', '2026-10-12', '2026-10-10'])
  })

  it('le jour des réponses est celui de Paris, comme les dates du journal (minuit à 2 h, heure d’été)', () => {
    // 14 octobre à 1 h, heure de Paris : encore le 13 en UTC
    expect(parisDay('2026-10-13T23:00:00.000Z')).toBe('2026-10-14')
    expect(newsSince(log, '2026-10-13T23:00:00.000Z')).toEqual([])
    // 13 octobre à 23 h 30, heure de Paris : le 14 n'est pas encore là
    expect(parisDay('2026-10-13T21:30:00.000Z')).toBe('2026-10-13')
    expect(newsSince(log, '2026-10-13T21:30:00.000Z').map(e => e.date)).toEqual(['2026-10-14'])
    // Heure d'hiver : 1er janvier à 0 h 30 à Paris
    expect(parisDay('2026-12-31T23:30:00.000Z')).toBe('2027-01-01')
  })

  it('la première phrase d’une entrée, sans couper sur un nombre ni sur des guillemets', () => {
    expect(firstSentence('Nouvelle page. Le score ne change pas.')).toBe('Nouvelle page.')
    expect(firstSentence('La question «\u00a0Quelle dette\u00a0?\u00a0» change. Le reste non.')).toBe('La question «\u00a0Quelle dette\u00a0?\u00a0» change.')
    expect(firstSentence('La question « Quelle dette ? » change. Le reste non.')).toBe('La question « Quelle dette ? » change.')
    expect(firstSentence('Passe de 1.5 à 2. Le reste non.')).toBe('Passe de 1.5 à 2.')
    expect(firstSentence('Version 2.0. Rien ne change.')).toBe('Version 2.0.')
    expect(firstSentence('Une seule phrase sans point final')).toBe('Une seule phrase sans point final')
    for (const e of newsSince(election.changelog, '2026-10-01T08:00:00.000Z')) {
      const s = firstSentence(e.text)
      expect(s.length).toBeGreaterThan(20)
      expect(s.length).toBeLessThanOrEqual(e.text.length)
      expect(s).toMatch(/[.!?]$/)
    }
  })
})
