// Les adresses du site, analysées sans rien charger : la partie « # » de l'URL, et rien d'autre.
// #/<chemin> mène à l'élection par défaut ; #/<préfixe>/<chemin> à une autre élection, désignée par son slug
// ou par un alias. Le préfixe est le premier segment quand ce n'est pas le nom d'une page.
// Ce module ne connaît pas les élections : le registre (src/elections/index.ts) lui passe leurs références.
// Il n'importe rien, pour que la feuille de pointage puisse s'en servir (via src/ui/nav.ts) sans rien
// recevoir des candidats.

import type { Tier } from './types'

export type Route =
  | { name: 'home' }
  | { name: 'sheet'; tier: Tier; index: number }
  | { name: 'revision' }
  | { name: 'priorities' }
  | { name: 'results' }
  | { name: 'proximity' }
  | { name: 'deepen' }
  | { name: 'share' }
  /** « anchor » : la rubrique à montrer à l'ouverture (#/methode/ia) */
  | { name: 'method'; anchor?: string }
  | { name: 'privacy' }
  | { name: 'legal' }
  | { name: 'candidates' }
  | { name: 'candidate'; id: string }
  /** Comparer des candidats entre eux (#/comparer/<id>,<id>…), dans l'ordre de l'adresse ; vide : le choix */
  | { name: 'compare'; ids: string[] }
  | { name: 'topics'; anchor?: string }
  /** « Les sujets en vidéo » ; « start » : la vidéo sur laquelle ouvrir le lecteur (#/videos/<vidéo>) */
  | { name: 'videos'; start?: string }
  /** Les élections passées, gardées en archive ; montrée seulement s'il y en a une */
  | { name: 'archives' }

/** Les noms de pages : un premier segment qui n'en est pas un est un préfixe d'élection */
const PAGES = new Set([
  'feuille',
  'approfondi',
  'revision',
  'priorites',
  'resultats',
  'proximite',
  'approfondir',
  'partager',
  'methode',
  'confidentialite',
  'mentions-legales',
  'candidats',
  'candidat',
  'comparer',
  'sujets',
  'videos',
  // Ancienne adresse de la page d'essai des vidéos, qui mène à la page des vidéos
  'essai-videos',
  'archives',
])

/** Forme d'un préfixe d'élection (slug ou alias) */
const PREFIX = /^[a-z0-9][a-z0-9-]*$/

/** Une adresse analysée */
export interface Place {
  /** Préfixe d'élection tel qu'écrit dans l'adresse (slug ou alias, à résoudre par le registre) ; '' sans préfixe */
  slug: string
  route: Route
  /** Le chemin sans le préfixe, tel qu'écrit : '/', '/resultats', '/candidat/royal' */
  path: string
}

const segments = (hash: string) => hash.replace(/^#?\/?/, '').split('/').filter(Boolean)

/** La page d'un chemin sans préfixe (« #/resultats », « /resultats » ou « resultats ») ; inconnue : l'accueil */
export function parseRoute(path: string): Route {
  const [head, arg] = segments(path)
  const n = Math.max(0, Number.parseInt(arg ?? '1', 10) - 1) || 0
  switch (head) {
    case 'feuille':
      return { name: 'sheet', tier: 'essentiel', index: n }
    case 'approfondi':
      return { name: 'sheet', tier: 'approfondi', index: n }
    case 'revision':
      return { name: 'revision' }
    case 'priorites':
      return { name: 'priorities' }
    case 'resultats':
      return { name: 'results' }
    case 'proximite':
      return { name: 'proximity' }
    case 'approfondir':
      return { name: 'deepen' }
    case 'partager':
      return { name: 'share' }
    case 'methode':
      return arg ? { name: 'method', anchor: arg } : { name: 'method' }
    case 'confidentialite':
      return { name: 'privacy' }
    case 'mentions-legales':
      return { name: 'legal' }
    case 'candidats':
      return { name: 'candidates' }
    case 'candidat':
      return arg ? { name: 'candidate', id: arg } : { name: 'candidates' }
    case 'comparer':
      return { name: 'compare', ids: compareIds(arg) }
    case 'sujets':
      return arg ? { name: 'topics', anchor: arg } : { name: 'topics' }
    // « essai-videos » : ancienne adresse de la page d'essai, corrigée en « videos » (canonicalPath)
    case 'videos':
    case 'essai-videos':
      return arg ? { name: 'videos', start: arg } : { name: 'videos' }
    case 'archives':
      return { name: 'archives' }
    default:
      return { name: 'home' }
  }
}

/**
 * Les candidats d'une adresse de comparaison (« faure,royal »), dans l'ordre, sans doublon ni vide. Rien n'est
 * validé ici (le registre ne charge pas les candidats) : l'écran écarte les inconnus et garde les premiers.
 */
export function compareIds(arg: string | undefined): string[] {
  if (!arg) return []
  let text = arg
  try {
    text = decodeURIComponent(arg)
  } catch {
    // une adresse mal encodée se lit telle quelle
  }
  return [...new Set(text.split(',').map(s => s.trim()).filter(Boolean))]
}

/** Le chemin d'une comparaison : comparePath(['faure', 'royal']) → '/comparer/faure,royal' ; vide : '/comparer' */
export function comparePath(ids: readonly string[]): string {
  return ids.length ? `/comparer/${ids.join(',')}` : '/comparer'
}

/** Analyse une adresse : son préfixe d'élection éventuel, sa page et son chemin sans préfixe */
export function parseLocation(hash: string): Place {
  const parts = segments(hash)
  const head = parts[0]
  if (head && !PAGES.has(head) && PREFIX.test(head)) {
    const rest = parts.slice(1)
    const path = `/${rest.join('/')}`
    return { slug: head, route: parseRoute(path), path }
  }
  const path = `/${parts.join('/')}`
  return { slug: '', route: parseRoute(path), path }
}

/** L'adresse d'un chemin dans une élection : withBase('', '/resultats') → '#/resultats' ; withBase('x', '/') → '#/x/' */
export function withBase(slug: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return slug ? `#/${slug}${p}` : `#${p}`
}

/** Le chemin à écrire pour un chemin lu : l'ancienne page d'essai des vidéos devient la page des vidéos */
export function canonicalPath(path: string): string {
  return path.replace(/^\/essai-videos(?=\/|$)/, '/videos')
}

/** Ce que le routage doit savoir d'une élection du registre, sans la charger */
export interface ElectionRef {
  id: string
  /** '' pour l'élection par défaut */
  slug: string
  /** Autres préfixes acceptés, corrigés en slug dans l'adresse */
  aliases?: readonly string[]
  archived: boolean
  candidateIds: readonly string[]
}

/** Une adresse résolue : l'élection à montrer, la page, et l'adresse à écrire à la place s'il faut la corriger */
export interface Resolved<E extends ElectionRef> {
  election: E
  route: Route
  /** Adresse corrigée, à écrire sans nouvelle entrée d'historique ; absente si l'adresse est déjà la bonne */
  redirect?: string
}

/**
 * Choisit l'élection et la page d'une adresse.
 * - Sans préfixe : l'élection par défaut. Un préfixe inconnu : l'accueil de l'élection par défaut, sans
 *   toucher à l'adresse (comme toute adresse inconnue).
 * - Un alias, l'identifiant de l'élection par défaut ou l'ancienne page d'essai des vidéos : l'adresse est
 *   corrigée (#/primaire/x → #/choisir-2027/x).
 * - Un ancien lien #/candidat/<id> vers un candidat que l'élection par défaut n'a pas, mais qu'une autre a
 *   (une élection archivée) : il mène à cette élection. De même pour #/comparer/<id>,<id> quand aucun de ses
 *   candidats n'est de l'élection par défaut et que tous sont d'une même autre élection.
 * - #/archives : seulement s'il y a une élection archivée ; sinon l'accueil.
 */
export function resolvePlace<E extends ElectionRef>(place: Place, elections: readonly E[]): Resolved<E> {
  const fallback = elections.find(e => e.slug === '')
  if (!fallback) throw new Error('Aucune élection par défaut (slug vide) dans le registre')
  let route = place.route
  if (route.name === 'archives' && !elections.some(e => e.archived)) route = { name: 'home' }
  if (!place.slug) {
    if (route.name === 'candidate' && !fallback.candidateIds.includes(route.id)) {
      const id = route.id
      const other = elections.find(e => e !== fallback && e.candidateIds.includes(id))
      if (other) return { election: other, route, redirect: withBase(other.slug, place.path) }
    }
    // De même pour une comparaison dont aucun candidat n'est de l'élection par défaut, mais tous d'une autre
    if (route.name === 'compare' && route.ids.length && !route.ids.some(id => fallback.candidateIds.includes(id))) {
      const ids = route.ids
      const other = elections.find(e => e !== fallback && ids.every(id => e.candidateIds.includes(id)))
      if (other) return { election: other, route, redirect: withBase(other.slug, place.path) }
    }
    const path = canonicalPath(place.path)
    return path === place.path ? { election: fallback, route } : { election: fallback, route, redirect: withBase('', path) }
  }
  const named = elections.find(e => e.slug === place.slug || e.id === place.slug || e.aliases?.includes(place.slug))
  if (!named) return { election: fallback, route: { name: 'home' } }
  const path = canonicalPath(place.path)
  if (named.slug === place.slug && path === place.path) return { election: named, route }
  return { election: named, route, redirect: withBase(named.slug, path) }
}
