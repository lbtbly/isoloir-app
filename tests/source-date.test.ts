// Dates de source à l'affichage (décision du propriétaire du 2026-10-15) : une date stockée
// « 2026-10-15 (consultation) » s'affiche « consulté le 15 octobre 2026 », et les dates ISO d'un texte libre en
// toutes lettres, partout où une date de source est montrée (fiches candidats, comparateur, « Qui porte quoi »,
// fiches des questions, vidéos), sans toucher aux données. Le balayage final passe sur toutes les dates des
// élections et des séries vidéo (avec leurs éditions) : aucune ne doit rester en AAAA-MM-JJ ni en AAAA-MM à l'écran.
import { describe, expect, it } from 'vitest'
import { formatDate, formatDayRange, formatMoment, formatSourceDate } from '../src/ui/format'
import { elections } from '../src/elections/all'
import { VIDEO_SERIES } from '../src/ui/videos/series'
import { EDITIONS } from '../src/ui/videos/editions'

/** Une date telle qu'écrite par formatDate : espaces insécables entre le jour, le mois et l'année */
const nb = (s: string) => s.replace(/ /g, '\u00a0')

describe('formatDate', () => {
  it('écrit le jour, le mois en toutes lettres et l’année, sans coupure', () => {
    expect(formatDate('2026-10-15')).toBe(nb('15 octobre 2026'))
    expect(formatDate('2026-10')).toBe(nb('octobre 2026'))
    expect(formatDate('2026-10-15')).not.toMatch(/ /)
  })

  it('écrit « 1er » pour le premier jour du mois', () => {
    expect(formatDate('2025-01-01')).toBe(nb('1er janvier 2025'))
    expect(formatDate('2026-10-11')).toBe(nb('11 octobre 2026'))
    expect(formatDate('2026-10-21')).toBe(nb('21 octobre 2026'))
  })

  it('rend tel quel ce qui n’est pas une date', () => {
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('fin juin 2026')).toBe('fin juin 2026')
  })
})

describe('formatMoment et formatDayRange : la même règle', () => {
  it('« 1er » et sans coupure, comme formatDate (le PDF les mêle)', () => {
    // À l'heure de l'appareil : midi UTC tombe le même jour sous toutes les heures de France
    expect(formatMoment('2026-10-01T12:00:00.000Z')).toMatch(/^1er\u00a0octobre\u00a02026 à \d+\u00a0h\u00a000$/)
    expect(formatMoment('2026-10-15T12:00:00.000Z')).toMatch(/^15\u00a0octobre\u00a02026 à /)
    expect(formatDayRange('2027-05-01T08:00:00+02:00', '2027-05-02T20:00:00+02:00')).toBe(`1er et ${nb('2 mai')}`)
    expect(formatDayRange('2026-10-09T08:00:00+02:00', '2026-10-10T20:00:00+02:00')).toBe(`9 et ${nb('10 octobre')}`)
  })
})

describe('formatSourceDate', () => {
  it('écrit une date ISO comme formatDate', () => {
    expect(formatSourceDate('2026-10-02')).toBe(nb('2 octobre 2026'))
    expect(formatSourceDate('2026-10')).toBe(nb('octobre 2026'))
    expect(formatSourceDate(undefined)).toBe('')
    expect(formatSourceDate('  ')).toBe('')
  })

  it('écrit une date de consultation « consulté le … »', () => {
    expect(formatSourceDate('2026-10-15 (consultation)')).toBe(`consulté le ${nb('15 octobre 2026')}`)
    expect(formatSourceDate('2026-10-06 (consultation)')).toBe(`consulté le ${nb('6 octobre 2026')}`)
    expect(formatSourceDate('2026-10-01 (consultation)')).toBe(`consulté le ${nb('1er octobre 2026')}`)
    expect(formatSourceDate('2026-10-02 (consulté)')).toBe(`consulté le ${nb('2 octobre 2026')}`)
    expect(formatSourceDate('2026-10-02 (consultée)')).toBe(`consulté le ${nb('2 octobre 2026')}`)
    expect(formatSourceDate('2026-10 (consultation)')).toBe(`consulté en ${nb('octobre 2026')}`)
  })

  it('écrit en toutes lettres les dates ISO d’un texte libre, et garde le reste', () => {
    expect(formatSourceDate('consulté le 2026-10-06')).toBe(`consulté le ${nb('6 octobre 2026')}`)
    expect(formatSourceDate('consultée le 2026-10-07')).toBe(`consultée le ${nb('7 octobre 2026')}`)
    expect(formatSourceDate('© 2026, consulté le 2026-10-06')).toBe(`© 2026, consulté le ${nb('6 octobre 2026')}`)
    expect(formatSourceDate('en vigueur au 2026-10-08')).toBe(`en vigueur au ${nb('8 octobre 2026')}`)
    expect(formatSourceDate('non daté (consulté 2026-10-06)')).toBe(`non daté (consulté le ${nb('6 octobre 2026')})`)
    expect(formatSourceDate('2026 (consulté le 2026-10-02)')).toBe(`2026 (consulté le ${nb('2 octobre 2026')})`)
    expect(formatSourceDate('2025-01-01 (rapport du 9 juillet 2026)')).toBe(`${nb('1er janvier 2025')} (rapport du 9 juillet 2026)`)
    expect(formatSourceDate('2025-12 (présenté le 2026-01-07)')).toBe(`${nb('décembre 2025')} (présenté le ${nb('7 janvier 2026')})`)
    expect(formatSourceDate('2021-10 (page mise à jour en 2026)')).toBe(`${nb('octobre 2021')} (page mise à jour en 2026)`)
    // Un mois seul dans le texte (dossier_asselineau.json : « 2021-10 / 2022-02 »)
    expect(formatSourceDate('2021-10 / 2022-02')).toBe(`${nb('octobre 2021')} / ${nb('février 2022')}`)
    expect(formatSourceDate('page mise à jour en 2026-03')).toBe(`page mise à jour en ${nb('mars 2026')}`)
  })

  it('ne prend pour une date ni une période, ni une année seule, ni un numéro de loi, ni un texte déjà rédigé', () => {
    for (const s of [
      '2026',
      '2019-2020',
      '2021-2025 (publié le 9 mars 2026)',
      'Année scolaire 2023-2024',
      'moyenne 2008-2021',
      '2024-2030 ; projet de loi de finances pour 2027',
      'Loi n° 2026-791 du 16 août 2026',
      'loi n° 2021-11 du 8 janvier 2021',
      'Loi n°2021-11',
      'fin juin 2026 (2e trimestre)',
      'consulté le 7 octobre 2026',
      '1er juin 2026',
    ])
      expect(formatSourceDate(s)).toBe(s)
  })
})

/** Toutes les valeurs de champs « date » d'un objet, en profondeur */
function datesIn(value: unknown, out: string[] = [], seen = new Set<unknown>()): string[] {
  if (!value || typeof value !== 'object' || seen.has(value)) return out
  seen.add(value)
  for (const [k, v] of Object.entries(value)) {
    if (k === 'date' && typeof v === 'string') out.push(v)
    else datesIn(v, out, seen)
  }
  return out
}

describe('les dates des données, à l’affichage', () => {
  const dates = [...new Set(datesIn([elections, VIDEO_SERIES, EDITIONS]))]

  it('en trouve, dont des dates de consultation', () => {
    expect(dates.length).toBeGreaterThan(100)
    expect(dates.some(d => /\(consultation\)/.test(d))).toBe(true)
  })

  it('n’en laisse aucune en AAAA-MM-JJ ni en AAAA-MM, ni « (consultation) »', () => {
    const left = dates
      .map(d => [d, formatSourceDate(d)] as const)
      .filter(([, shown]) => /(^|[^\d-])\d{4}-(0[1-9]|1[0-2])(-\d{2})?(?![\d-])/.test(shown) || /\((consultation|consultée?)\)/.test(shown))
    expect(left).toEqual([])
  })
})
