// La sélection de candidats à comparer (le « plateau » des pages candidats), comme le panier d'un comparateur.
// Elle n'est enregistrée nulle part : elle vit en mémoire, le temps de la visite (un rechargement l'oublie), et
// dans l'adresse de la page de comparaison (#/comparer/<id>,<id>…), qui seule se partage. Rien n'est écrit dans
// le stockage du navigateur. Une sélection par élection : changer d'élection ne mélange pas les candidats.
// Ce module ne connaît que des identifiants : il n'importe ni candidats ni positions.

import { useEffect, useState } from 'preact/hooks'

/** Nombre de candidats comparés au plus : quatre colonnes tiennent encore sur une tablette, pas davantage */
export const MAX_COMPARED = 4

/** Le même nombre, en toutes lettres, pour les phrases (« de deux à quatre candidats ») */
export const MAX_COMPARED_WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six'][MAX_COMPARED] ?? String(MAX_COMPARED)

/** Ce qu'a fait une demande d'ajout ou de retrait */
export type ToggleResult = 'added' | 'removed' | 'full'

/**
 * Le dernier message du plateau : annoncé aux lecteurs d'écran (« Olivier Faure ajouté à la comparaison ») ;
 * « shown » le montre aussi à l'écran, quand il dit ce qu'il faut faire (cinquième candidat refusé).
 */
export interface Notice {
  text: string
  shown: boolean
}

const selections = new Map<string, readonly string[]>()
const notices = new Map<string, Notice>()
const listeners = new Set<() => void>()
const EMPTY: readonly string[] = []

const notify = () => listeners.forEach(f => f())

/** Les candidats choisis pour une élection, dans l'ordre du choix */
export function getSelection(electionId: string): readonly string[] {
  return selections.get(electionId) ?? EMPTY
}

/** Remplace la sélection (sans doublon, quatre au plus, dans l'ordre donné) */
export function setSelection(electionId: string, ids: readonly string[]): void {
  const next = [...new Set(ids)].slice(0, MAX_COMPARED)
  const now = getSelection(electionId)
  if (next.length === now.length && next.every((id, i) => id === now[i])) return
  if (next.length) selections.set(electionId, next)
  else selections.delete(electionId)
  notify()
}

/** Ajoute un candidat à la fin, ou le retire s'il y est ; refuse un cinquième */
export function toggleSelected(electionId: string, id: string): ToggleResult {
  const now = getSelection(electionId)
  if (now.includes(id)) {
    setSelection(
      electionId,
      now.filter(x => x !== id),
    )
    return 'removed'
  }
  if (now.length >= MAX_COMPARED) return 'full'
  setSelection(electionId, [...now, id])
  return 'added'
}

/** Pose le message du plateau d'une élection */
export function say(electionId: string, text: string, shown = false): void {
  notices.set(electionId, { text, shown })
  notify()
}

/** Le message du plateau d'une élection, s'il y en a un */
export function getNotice(electionId: string): Notice | null {
  return notices.get(electionId) ?? null
}

/** Oublie toutes les sélections et leurs messages (« Tout effacer ») */
export function clearSelections(): void {
  if (!selections.size && !notices.size) return
  selections.clear()
  notices.clear()
  notify()
}

/** S'abonne aux changements (renvoie de quoi se désabonner) */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** La sélection d'une élection, tenue à jour */
export function useSelection(electionId: string): readonly string[] {
  const [ids, setIds] = useState(() => getSelection(electionId))
  useEffect(() => {
    const sync = () => setIds(getSelection(electionId))
    sync()
    return subscribe(sync)
  }, [electionId])
  return ids
}

/** Le message du plateau d'une élection, tenu à jour */
export function useNotice(electionId: string): Notice | null {
  const [notice, setNotice] = useState(() => getNotice(electionId))
  useEffect(() => {
    const sync = () => setNotice(getNotice(electionId))
    sync()
    return subscribe(sync)
  }, [electionId])
  return notice
}
