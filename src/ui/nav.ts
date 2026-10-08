// Les liens du site, relatifs à l'élection affichée : chaque écran écrit un chemin (« /resultats »), et
// l'adresse prend le préfixe de l'élection s'il y en a un (#/resultats pour l'élection par défaut,
// #/<slug>/resultats pour une autre). App fixe ce préfixe avant de rendre l'élection.
// Aucun lien n'est écrit en dur ailleurs (« #/… », go('/…')) : tout passe par ici.
// Ce module ne connaît que les adresses (core/routes.ts) : la feuille de pointage peut l'importer.

import { parseLocation, withBase } from '../core/routes'

let base = ''

/** Fixe l'élection des liens : son slug, '' pour l'élection par défaut */
export function setBase(slug: string): void {
  base = slug
}

/** Le slug de l'élection des liens */
export const getBase = (): string => base

/** L'adresse d'un chemin dans l'élection affichée : link('/resultats') → '#/resultats' ou '#/<slug>/resultats' */
export function link(path: string): string {
  return withBase(base, path)
}

/** L'adresse d'un chemin dans une autre élection (archives, lien d'une élection à l'autre) : linkIn('choisir-2027', '/') */
export function linkIn(slug: string, path: string): string {
  return withBase(slug, path)
}

/** Va à un chemin de l'élection affichée (nouvelle entrée d'historique) */
export function go(path: string): void {
  window.location.hash = link(path)
}

/** Remplace l'écran courant par un chemin de l'élection affichée, sans ajouter d'entrée à l'historique */
export function replace(path: string): void {
  window.location.replace(link(path))
}

/** Le chemin affiché, sans le préfixe d'élection (« /sujets/retraites-1 ») : pour marquer le lien de la page courante */
export function currentPath(): string {
  return typeof location === 'undefined' ? '/' : parseLocation(location.hash).path
}

/**
 * Réécrit l'adresse de l'écran courant sans en changer (ni hashchange, ni entrée d'historique, ni retour en haut
 * de page) : pour qu'une adresse partageable suive un réglage fait sur place (les candidats d'une comparaison)
 */
export function rewrite(path: string): void {
  history.replaceState(history.state, '', link(path))
}
