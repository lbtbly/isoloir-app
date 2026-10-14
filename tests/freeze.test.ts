// Le gel des jours de vote (core/freeze.ts) : ses bornes à la minute près (début inclus, fin exclue, heure de Paris),
// le repli sur les tours quand l'élection ne fixe pas ses périodes, et les dates écrites en toutes lettres, identiques
// à celles des Mentions légales. Les bornes de la présidentielle sont figées ici : une retouche de freezeWindows faite
// pour les données se verrait aussitôt, puisqu'elle coupe aussi les images de partage.

import { describe, expect, it } from 'vitest'
import { freezePeriod, freezeSpans, freezeTexts, freezeWindow, frozenAt } from '../src/core/freeze'
import { election as primaire } from '../src/elections/choisir-2027/election'
import { election as presidentielle } from '../src/elections/presidentielle-2027/election'

const at = (iso: string) => new Date(iso)
const NB = '\u00a0'

describe('gel de la présidentielle 2027', () => {
  it('les deux périodes fixées par l’élection, inchangées', () => {
    expect(freezeSpans(presidentielle)).toEqual([
      { start: '2027-04-16T00:00:00+02:00', end: '2027-04-18T20:00:00+02:00' },
      { start: '2027-04-30T00:00:00+02:00', end: '2027-05-02T20:00:00+02:00' },
    ])
  })

  it('premier tour : début inclus, fin exclue', () => {
    expect(frozenAt(presidentielle, at('2027-04-15T23:59:59+02:00'))).toBeNull()
    expect(frozenAt(presidentielle, at('2027-04-16T00:00:00+02:00'))?.start).toBe('2027-04-16T00:00:00+02:00')
    expect(frozenAt(presidentielle, at('2027-04-18T19:59:59+02:00'))).not.toBeNull()
    expect(frozenAt(presidentielle, at('2027-04-18T20:00:00+02:00'))).toBeNull()
  })

  it('second tour : début inclus, fin exclue', () => {
    expect(frozenAt(presidentielle, at('2027-04-29T23:59:59+02:00'))).toBeNull()
    expect(frozenAt(presidentielle, at('2027-04-30T00:00:00+02:00'))?.end).toBe('2027-05-02T20:00:00+02:00')
    expect(frozenAt(presidentielle, at('2027-05-02T20:00:00+02:00'))).toBeNull()
  })

  it('aucun gel aujourd’hui ni entre les tours', () => {
    expect(frozenAt(presidentielle, at('2026-10-13T12:00:00+02:00'))).toBeNull()
    expect(frozenAt(presidentielle, at('2027-04-24T12:00:00+02:00'))).toBeNull()
  })

  it('les dates en toutes lettres, comme les Mentions légales', () => {
    expect(freezeTexts(presidentielle)).toEqual([
      `du vendredi${NB}16${NB}avril, 0${NB}h, au dimanche${NB}18${NB}avril, 20${NB}h`,
      `du vendredi${NB}30${NB}avril, 0${NB}h, au dimanche${NB}2${NB}mai, 20${NB}h`,
    ])
    expect(freezePeriod(presidentielle.freezeWindows![0]!)).toBe(freezeTexts(presidentielle)[0])
  })
})

describe('repli sur les tours (élection sans freezeWindows)', () => {
  it('de la veille du premier jour de vote, 0 h à Paris, à la clôture', () => {
    expect(primaire.freezeWindows).toBeUndefined()
    const [first] = freezeSpans(primaire)
    expect(new Date(first!.start).getTime()).toBe(at('2026-10-08T00:00:00+02:00').getTime())
    expect(first!.end).toBe('2026-10-10T20:00:00+02:00')
    expect(frozenAt(primaire, at('2026-10-07T23:59:59+02:00'))).toBeNull()
    expect(frozenAt(primaire, at('2026-10-08T00:00:00+02:00'))).not.toBeNull()
    expect(frozenAt(primaire, at('2026-10-10T20:00:00+02:00'))).toBeNull()
  })

  it('le texte de chaque tour', () => {
    expect(freezeTexts(primaire)[0]).toBe(`du jeudi${NB}8${NB}octobre, 0${NB}h, au samedi${NB}10${NB}octobre, 20${NB}h`)
    expect(freezeWindow(primaire.rounds[1]!)).toBe(`du jeudi${NB}15${NB}octobre, 0${NB}h, au samedi${NB}17${NB}octobre, 20${NB}h`)
  })

  it('« 1er » pour le premier du mois', () => {
    expect(freezePeriod({ start: '2027-05-01T00:00:00+02:00', end: '2027-05-01T20:00:00+02:00' })).toBe(
      `du samedi${NB}1er${NB}mai, 0${NB}h, au samedi${NB}1er${NB}mai, 20${NB}h`,
    )
  })
})
