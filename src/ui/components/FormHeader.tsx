import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { APP_NAME } from '../../core/app'
import { currentPath, link } from '../nav'
import { budgetShown } from '../budget/shown'
import { tableShown } from '../table/shown'
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
  /**
   * Appel principal porté par l'en-tête (accueil) ; « short » remplace le libellé quand la place manque ; « quiet » le
   * met au trait noir, quand une autre action de la page porte l'aplat bleu (la carte « À revoir »)
   */
  action?: { href: string; label: string; short: string; quiet?: boolean }
}

/**
 * Le menu principal : les pages de consultation, ouvertes à tout moment, sans rien changer à la feuille. Chemins
 * dans l'élection affichée (link) ; « page » et « within » se lisent sur le chemin sans préfixe d'élection.
 */
const MENU = [
  // Chaque entrée a son pictogramme au trait (Icon.tsx), devant le nom, dans l'en-tête comme dans le panneau (demande du
  // propriétaire du 2026-10-15) ; décoratif, le nom reste celui du lien
  { path: '/sujets', label: 'Les sujets', icon: 'topics', hint: 'Le contexte chiffré de chaque question', page: /^\/sujets(\/|$)/, within: null },
  { path: '/videos', label: 'Les vidéos', icon: 'videos', hint: 'Chaque thème en courtes vidéos sous-titrées', page: /^\/videos(\/|$)/, within: null },
  // La comparaison est une page des candidats : leur entrée la marque, sans entrée de plus dans l'en-tête
  { path: '/candidats', label: 'Les candidats', icon: 'people', hint: 'Leur parcours, leurs positions sourcées, et les comparer', page: /^\/candidats\/?$/, within: /^\/(candidat|comparer)(\/|$)/ },
  // « À table » : voter à plusieurs sur un seul téléphone (demande du propriétaire du 14/10/2026)
  { path: '/a-table', label: 'À table', icon: 'table', hint: 'Voter à plusieurs, en secret, sur un seul téléphone', page: /^\/a-table\/?$/, within: null },
  // « Faire les comptes » : régler le budget 2027 et voir le déficit bouger (décision du propriétaire du 17/10/2026)
  { path: '/comptes', label: 'Faire les comptes', icon: 'comptes', hint: 'Régler le budget 2027 et voir le déficit bouger', page: /^\/comptes(\/|$)/, within: null },
]

/** Les entrées du menu pour l'élection affichée : « Les vidéos » seulement si elle en montre (videos/load.ts), « À table »
 *  seulement si elle a une table (table/shown.ts), « Faire les comptes » si elle a des leviers (budget/shown.ts) */
const menuItems = () =>
  MENU.filter(item => (item.path !== '/videos' || videosShown()) && (item.path !== '/a-table' || tableShown()) && (item.path !== '/comptes' || budgetShown()))

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
                <Icon name={item.icon} class="menu-panel-icon" />
                <span class="menu-panel-label">{item.label}</span>
                <span class="menu-panel-hint">{item.hint}</span>
                <Icon name="arrow-right" class="menu-panel-arrow" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/** Ce que l'en-tête essaie, dans l'ordre, jusqu'à ce que la rangée tienne : voir useFit */
// « short-bare » et « tight-bare » (18/10/2026, avec l'entrée « Faire les comptes ») : le libellé court ne suffit pas
// à 1024 px avec les pictogrammes ; ils retombent alors, avant que le logo ne se réduise au pictogramme seul
const FIT = ['long', 'bare', 'short', 'short-bare', 'tight', 'tight-bare'] as const

/**
 * L'en-tête tient sur une seule rangée, de la même hauteur sur toutes les pages : l'appel principal garde
 * son libellé long s'il tient ; sinon les pictogrammes du menu tombent d'abord (« bare » : l'appel compte plus que
 * les dessins, 2026-10-15), puis l'appel prend son libellé court ; si même le court ne tient pas (« Mon
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
                    <Icon name={item.icon} />
                    <span class="main-nav-label">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {locator ? <span class="form-locator">{locator}</span> : null}
          <MenuButton />
          {action ? (
            <a class={action.quiet ? 'btn-primary is-outline header-cta' : 'btn-primary header-cta'} href={action.href}>
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
