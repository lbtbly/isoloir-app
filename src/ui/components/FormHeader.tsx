import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { APP_NAME } from '../../core/app'
import { currentPath, link } from '../nav'
import { videosShown } from '../videos/load'
import '../../styles/brand.css'
import { Curtain } from './Airplane'
import { ArchiveBanner } from './ArchiveBanner'
import { Icon } from './Icon'
import { Logo } from './Logo'

interface Props {
  /**
   * Sur l'accueil, le nom du scrutin, imprimé à côté du logo quand la rangée a la place (brand.css). Sur
   * les autres pages, l'ancien nom de la page, qui n'est plus imprimé : la page le porte déjà.
   */
  title?: string
  /** Ancien libellé de droite, qui n'est plus imprimé : l'en-tête garde la même rangée partout */
  right?: preact.ComponentChildren
  /** Repère de progression de la feuille (thème + compteur), à droite : la seule partie propre à la page */
  locator?: preact.ComponentChildren
  home?: boolean
  /** Appel principal porté par l'en-tête (accueil) ; « short » remplace le libellé quand la place manque */
  action?: { href: string; label: string; short: string }
}

/**
 * Le menu principal : les pages de consultation, ouvertes à tout moment, sans rien changer à la feuille. Chemins
 * dans l'élection affichée (link) ; « page » et « within » se lisent sur le chemin sans préfixe d'élection.
 */
const MENU = [
  { path: '/sujets', label: 'Les sujets', hint: 'Le contexte chiffré de chaque question', page: /^\/sujets(\/|$)/, within: null },
  { path: '/videos', label: 'Les vidéos', hint: 'Chaque thème en courtes vidéos sous-titrées', page: /^\/videos(\/|$)/, within: null },
  // La comparaison est une page des candidats : leur entrée la marque, sans entrée de plus dans l'en-tête
  { path: '/candidats', label: 'Les candidats', hint: 'Leur parcours, leurs positions sourcées, et les comparer', page: /^\/candidats\/?$/, within: /^\/(candidat|comparer)(\/|$)/ },
]

/** Les entrées du menu pour l'élection affichée : « Les vidéos » seulement si elle en montre (videos/load.ts) */
const menuItems = () => MENU.filter(item => item.path !== '/videos' || videosShown())

/** Lien courant : « page » sur la page elle-même, « true » sur une de ses fiches (fiche d'un candidat) */
function currentOf(item: { page: RegExp; within: RegExp | null }): 'page' | 'true' | undefined {
  const path = currentPath()
  if (item.page.test(path)) return 'page'
  return item.within?.test(path) ? 'true' : undefined
}

/** Pictogramme du bouton : trois filets, une croix une fois ouvert */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg class="icon menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
    </svg>
  )
}

/**
 * Sur écran étroit, le menu tient dans un bouton qui ouvre un panneau sous l'en-tête. Le focus reste sur
 * le bouton à l'ouverture (le panneau le suit dans l'ordre de tabulation) ; Échap, un clic hors du menu,
 * un lien suivi ou une tabulation qui sort du menu le referment.
 */
function MenuButton() {
  const [open, setOpen] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const inside = nav.current?.contains(document.activeElement)
      setOpen(false)
      if (inside) button.current?.focus()
    }
    const onPointer = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <nav
      class="menu-nav"
      aria-label="Menu principal"
      ref={nav}
      onFocusOut={e => {
        if (open && !nav.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        type="button"
        class="menu-toggle"
        ref={button}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen(!open)}
      >
        <MenuIcon open={open} />
        <span class="menu-toggle-label">Menu</span>
      </button>
      <div class="menu-panel" id="menu-principal" hidden={!open}>
        <ul class="menu-panel-list">
          {menuItems().map(item => (
            <li key={item.path}>
              <a href={link(item.path)} aria-current={currentOf(item)} onClick={() => setOpen(false)}>
                <span class="menu-panel-label">{item.label}</span>
                <span class="menu-panel-hint">{item.hint}</span>
                <Icon name="arrow-right" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/** Ce que l'en-tête essaie, dans l'ordre, jusqu'à ce que la rangée tienne : voir useFit */
const FIT = ['long', 'short', 'tight'] as const

/**
 * L'en-tête tient sur une seule rangée, de la même hauteur sur toutes les pages : l'appel principal garde
 * son libellé long s'il tient, sinon il prend le court ; si même le court ne tient pas (« Mon
 * dépouillement » sur un téléphone de 320 px), le logo cède sa place au pictogramme seul plutôt que de
 * pousser l'appel sur une deuxième rangée. On mesure à chaque changement de largeur ou de corps de texte,
 * au chargement de la police et quand le libellé change (data-fit, lu par brand.css).
 */
function useFit(row: { current: HTMLDivElement | null }, label?: string, short?: string) {
  useLayoutEffect(() => {
    const el = row.current
    if (!el || !label) return
    const overflows = () => {
      const end = el.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(el).paddingRight)
      return [...el.children].some(child => child.getBoundingClientRect().right > end + 0.5)
    }
    const fit = () => {
      for (const step of FIT) {
        el.dataset.fit = step
        if (!overflows()) return
      }
    }
    fit()
    let alive = true
    void document.fonts?.ready.then(() => {
      if (alive) fit()
    })
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(fit)
    ro?.observe(el)
    return () => {
      alive = false
      ro?.disconnect()
      delete el.dataset.fit
    }
  }, [row, label, short])
}

/**
 * En-tête de formulaire pré-imprimé, fixé en haut de la feuille. La même rangée partout : le logo, le menu,
 * et selon la page le repère de la feuille ou, sur l'accueil, le nom du scrutin et l'appel principal. Le
 * nom de la page n'y figure pas : la page le porte déjà. Dans une élection archivée, le bandeau d'archive suit
 * l'en-tête, dans le flux de la page (il ne colle pas en haut).
 */
export function FormHeader({ title, locator, home, action }: Props) {
  const row = useRef<HTMLDivElement>(null)
  useFit(row, action?.label, action?.short)
  return (
    <>
      <header class="form-header">
        <div class="form-header-inner" ref={row}>
          {/* Le logo, et le pictogramme seul quand la place manque (brand.css) ; le nom est porté par le lien */}
          <a class="brand" href={link('/')} aria-label={home ? APP_NAME : `${APP_NAME}, retour à l’accueil`}>
            <Logo layout="horizontal" />
            <Logo layout="mark" />
          </a>
          {home && title ? <span class="form-scrutin">{title}</span> : null}
          {/* Sur grand écran, le menu en ligne après la marque ; ailleurs, le bouton « Menu » (une seule des deux
              navigations est affichée, l'autre est retirée de l'arbre d'accessibilité) */}
          <nav class="main-nav" aria-label="Menu principal">
            <ul>
              {menuItems().map(item => (
                <li key={item.path}>
                  <a href={link(item.path)} aria-current={currentOf(item)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {locator ? <span class="form-locator">{locator}</span> : null}
          <MenuButton />
          {action ? (
            <a class="btn-primary header-cta" href={action.href}>
              <span class="cta-long">{action.label}</span>
              <span class="cta-short">{action.short}</span>
              <Icon name="arrow-right" />
            </a>
          ) : null}
        </div>
        <Curtain />
      </header>
      <ArchiveBanner />
    </>
  )
}
