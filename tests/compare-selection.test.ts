// La sélection à comparer (plateau des pages candidats, src/ui/compare/selection.ts) : quatre au plus, sans doublon,
// une par élection, en mémoire seulement (rien dans le stockage du navigateur).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import {
  clearSelections,
  getNotice,
  getSelection,
  MAX_COMPARED,
  MAX_COMPARED_WORDS,
  say,
  setSelection,
  subscribe,
  toggleSelected,
} from '../src/ui/compare/selection'

afterEach(() => clearSelections())

describe('sélection à comparer', () => {
  it('ajoute à la fin, retire, et refuse un cinquième', () => {
    expect(toggleSelected('e', 'a')).toBe('added')
    expect(toggleSelected('e', 'b')).toBe('added')
    expect(getSelection('e')).toEqual(['a', 'b'])
    expect(toggleSelected('e', 'a')).toBe('removed')
    expect(getSelection('e')).toEqual(['b'])
    for (const id of ['c', 'd', 'f']) toggleSelected('e', id)
    expect(getSelection('e')).toHaveLength(MAX_COMPARED)
    expect(toggleSelected('e', 'g')).toBe('full')
    expect(getSelection('e')).toEqual(['b', 'c', 'd', 'f'])
    // Retirer reste possible quand le plateau est plein
    expect(toggleSelected('e', 'c')).toBe('removed')
    expect(getSelection('e')).toEqual(['b', 'd', 'f'])
  })

  it('remplacer : sans doublon, dans l’ordre donné, quatre au plus', () => {
    setSelection('e', ['b', 'a', 'b', 'c', 'd', 'e', 'f'])
    expect(getSelection('e')).toEqual(['b', 'a', 'c', 'd'])
    setSelection('e', [])
    expect(getSelection('e')).toEqual([])
  })

  it('une sélection par élection', () => {
    toggleSelected('primaire', 'a')
    toggleSelected('presidentielle', 'z')
    expect(getSelection('primaire')).toEqual(['a'])
    expect(getSelection('presidentielle')).toEqual(['z'])
  })

  it('prévient ses abonnés, seulement quand quelque chose change', () => {
    let calls = 0
    const off = subscribe(() => calls++)
    setSelection('e', ['a', 'b'])
    setSelection('e', ['a', 'b'])
    expect(calls).toBe(1)
    toggleSelected('e', 'c')
    expect(calls).toBe(2)
    off()
    toggleSelected('e', 'd')
    expect(calls).toBe(2)
  })

  it('« Tout effacer » oublie sélections et messages', () => {
    toggleSelected('e', 'a')
    say('e', 'Ajout', false)
    expect(getNotice('e')).toEqual({ text: 'Ajout', shown: false })
    clearSelections()
    expect(getSelection('e')).toEqual([])
    expect(getNotice('e')).toBeNull()
  })

  it('le maximum s’écrit aussi en toutes lettres', () => {
    expect(MAX_COMPARED_WORDS).toBe('quatre')
  })

  it('rien n’est écrit dans le stockage du navigateur : la sélection vit en mémoire et dans l’adresse', () => {
    const root = fileURLToPath(new URL('../src/ui/compare/', import.meta.url))
    for (const f of ['selection.ts', 'Tray.tsx', 'Relation.tsx']) {
      expect(readFileSync(root + f, 'utf8'), f).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/)
    }
    const screen = readFileSync(fileURLToPath(new URL('../src/ui/screens/Compare.tsx', import.meta.url)), 'utf8')
    expect(screen).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/)
  })
})
