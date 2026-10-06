// Informations légales (src/core/legal.ts) : emplacements à compléter, lien de contact, licence.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { REPORT_URL } from '../src/core/app'
import { CONTACT_EMAIL, EDITEUR, contactHref, isPlaceholder } from '../src/core/legal'

describe('informations légales', () => {
  it('reconnaît une valeur à compléter, espaces insécables compris', () => {
    expect(isPlaceholder('[à compléter : prénom et nom]')).toBe(true)
    expect(isPlaceholder('[à compléter : téléphone]')).toBe(true)
    expect(isPlaceholder('   ')).toBe(true)
    expect(isPlaceholder('Jeanne Martin')).toBe(false)
  })

  it('n’active le lien de contact qu’une fois l’adresse renseignée', () => {
    if (isPlaceholder(CONTACT_EMAIL)) {
      expect(contactHref('Isoloir')).toBeNull()
      expect(REPORT_URL).toBe('')
    } else {
      expect(contactHref('Isoloir : signaler')).toBe(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Isoloir : signaler')}`)
      expect(REPORT_URL.startsWith(`mailto:${CONTACT_EMAIL}`)).toBe(true)
    }
  })

  it('LICENSE porte le nom de l’éditeur, ou l’emplacement tant qu’il manque', () => {
    const license = readFileSync('LICENSE', 'utf8')
    expect(license).toMatch(/^MIT License\n\nCopyright \(c\) 2026 /)
    // La casse peut différer (« BOULEY » à l'écran, « Bouley » dans LICENSE) : seul le nom compte
    expect(license.toLowerCase()).toContain((isPlaceholder(EDITEUR.nom) ? '[à compléter : prénom et nom]' : EDITEUR.nom).toLowerCase())
  })
})
