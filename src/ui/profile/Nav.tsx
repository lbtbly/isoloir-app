// La barre collante de « Mon profil politique » (ui/profile/Chart.tsx) : sous l'en-tête du site, pendant qu'on parcourt
// le graphique, la rangée des domaines, et au téléphone, dessous, les sujets du domaine en cours (demande du propriétaire
// du 17 octobre 2026 : « naviguer domaine par domaine puis thème par thème »). Chaque rangée défile sur le côté ; le
// domaine et le sujet que l'on lit sont marqués (aria-current) et ramenés dans la vue de leur rangée à mesure que la page
// défile (IntersectionObserver, sur la ligne où s'arrête le focus : celle du scroll-padding) ; un toucher y mène et donne
// le focus à son titre, que le scroll-padding garde sous les éléments collants (WCAG 2.4.11). Au clavier : Tab entre dans
// chaque rangée par son élément en cours, les flèches gauche et droite, Début et Fin s'y déplacent, bas et haut passent
// d'une rangée à l'autre. Neutre : les domaines dans l'ordre des familles, les sujets dans celui de leurs lignes, des
// noms seulement, ni groupe, ni lecture, ni couleur de bloc. Sur un écran trop court face au texte, la barre ne colle
// plus et défile avec la page (useStickyFilters, comme la barre de filtres de la fiche d'un candidat).

import { useEffect, useRef, useState } from 'preact/hooks'
import * as T from '../../core/echiquierCopy'
import { link } from '../nav'
import { useStickyFilters } from '../useStickyFilters'
import type { NavDomain } from './rows'

const smooth = (): ScrollBehavior => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

/** Ramène l'élément i d'une rangée au milieu de sa vue, sans faire défiler la page */
function center(list: HTMLElement | null, i: number) {
  const item = list?.children[i] as HTMLElement | undefined
  if (list && item) list.scrollTo({ left: item.offsetLeft - (list.clientWidth - item.offsetWidth) / 2, behavior: smooth() })
}

/** Les flèches dans une rangée ; bas et haut, vers l'élément en cours de l'autre rangée */
function onKey(e: KeyboardEvent, other: HTMLElement | null, toOther: string) {
  const links = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('a')]
  const i = links.indexOf(document.activeElement as HTMLElement)
  const next =
    e.key === toOther
      ? other?.querySelector<HTMLElement>('[tabindex="0"]')
      : links[e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -1]
  if (i < 0 || !next?.offsetParent) return
  e.preventDefault()
  next.focus()
}

interface Props {
  domains: NavDomain[]
  /** Les lignes du graphique : ses domaines (.fam-group) et ses lignes (.row-item, data-key), que la barre suit */
  rows: { current: HTMLElement | null }
}

export function Nav({ domains, rows }: Props) {
  const nav = useRef<HTMLElement>(null)
  const domainList = useRef<HTMLUListElement>(null)
  const subjectList = useRef<HTMLUListElement>(null)
  // Ce que l'on lit : un domaine, un de ses sujets
  const [cur, setCur] = useState({ d: 0, s: 0 })
  // La barre colle, sauf sur un écran trop court face au texte : sa hauteur va dans --filters-h, que lisent le
  // scroll-padding de la page, le rappel des blocs et l'axe collant (profile.css)
  const loose = useStickyFilters(nav)
  // Pendant un défilement doux vers une destination de la barre, elle la garde marquée, sans passer par chaque domaine
  // traversé (à l'arrivée, ce que l'on lit est cette destination) ; le doigt posé sur la barre, elle ne défile pas
  // d'elle-même
  const lock = useRef(0)
  const busy = useRef(0)

  // Ce que l'on lit : le domaine qui passe sous la ligne du focus (le scroll-padding de la page), et sa ligne qui y passe
  // ou, sur un intertitre, celle qui le suit ; entre deux domaines, rien ne change
  useEffect(() => {
    const root = rows.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const groups = [...root.querySelectorAll<HTMLElement>('.fam-group')]
    const items = [...root.querySelectorAll<HTMLElement>('.row-item')]
    const hit = new Set<Element>()
    let io: IntersectionObserver | undefined
    let line = 0
    const pick = () => {
      if (performance.now() < lock.current) return
      const group = groups.find(x => hit.has(x))
      const d = domains.findIndex(x => group?.id === `fam-${x.id}`)
      if (d < 0) return
      const lines = [...group!.querySelectorAll<HTMLElement>('.row-item')]
      const at = lines.find(x => x.getBoundingClientRect().bottom > line) ?? lines.at(-1)
      const s = Math.max(0, domains[d]!.subjects.findIndex(x => x.key === at?.dataset.key))
      setCur(c => (c.d === d && c.s === s ? c : { d, s }))
    }
    const build = () => {
      const l = Math.round(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 2
      if (io && l === line) return
      line = l
      io?.disconnect()
      hit.clear()
      io = new IntersectionObserver(
        entries => {
          for (const e of entries) hit[e.isIntersecting ? 'add' : 'delete'](e.target)
          pick()
        },
        { rootMargin: `${-l}px 0px ${Math.min(0, l + 2 - innerHeight)}px 0px` },
      )
      for (const x of [...groups, ...items]) io.observe(x)
    }
    // Les hauteurs collantes ou la fenêtre changent (texte agrandi, téléphone tourné) : la ligne avec elles
    const rebuild = () => {
      io?.disconnect()
      io = undefined
      requestAnimationFrame(build)
    }
    const ro = new ResizeObserver(rebuild)
    for (const x of [nav.current, document.querySelector('.form-header'), document.querySelector('.axis-mini'), document.querySelector('.profile-chart .axis')]) if (x) ro.observe(x)
    addEventListener('resize', rebuild)
    build()
    return () => {
      io?.disconnect()
      ro.disconnect()
      removeEventListener('resize', rebuild)
    }
  }, [domains, rows])

  // Le domaine et le sujet en cours, ramenés dans la vue de leur rangée (pas sous le doigt)
  useEffect(() => {
    if (performance.now() < busy.current) return
    center(domainList.current, cur.d)
    center(subjectList.current, cur.s)
  }, [cur])

  // Les réponses changées dans un autre onglet peuvent ôter des domaines : le premier, le temps de relire
  const domain = domains[cur.d] ?? domains[0]!

  /** Mène au domaine d (s : null) ou à son sujet s : son titre reçoit le focus, sous les éléments collants */
  const go = (e: MouseEvent, d: number, s: number | null) => {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const dom = domains[d]!
    const el = document.getElementById(s === null ? dom.focus : dom.subjects[s]!.focus)
    if (!el) return
    // Un domaine depuis son filet ; un sujet avec l'intertitre de son groupe quand il en est la première ligne, et avec
    // celui de son domaine quand il en est la toute première
    const first = (box: HTMLElement | null) => (box?.querySelector('.row') === el ? box : null)
    const target = s === null ? el.closest<HTMLElement>('.fam-group') : (first(el.closest('.fam-group')) ?? first(el.closest('.fam-part')))
    lock.current = performance.now() + (smooth() === 'auto' ? 100 : 900)
    // La destination, elle, vient au milieu de sa rangée, même touchée au bord
    busy.current = 0
    setCur({ d, s: s ?? 0 })
    ;(target ?? el).scrollIntoView({ block: 'start', behavior: smooth() })
    el.focus({ preventScroll: true })
  }

  const item = (label: string, on: boolean, click: (e: MouseEvent) => void) => (
    <a class="pn-link" href={link('/profil')} tabIndex={on ? 0 : -1} aria-current={on ? 'location' : undefined} onClick={click}>
      {label}
    </a>
  )
  return (
    <nav class={`profile-nav${loose ? ' is-loose' : ''}`} ref={nav} aria-label={T.NAV_LABEL} onPointerDown={() => (busy.current = performance.now() + 1500)}>
      <ul class="pn-list" ref={domainList} aria-label={T.NAV_DOMAINS} onKeyDown={e => onKey(e, subjectList.current, 'ArrowDown')}>
        {domains.map((x, i) => (
          <li key={x.id}>{item(x.label, i === cur.d, e => go(e, i, null))}</li>
        ))}
      </ul>
      <ul class="pn-list pn-subjects" key={domain.id} ref={subjectList} aria-label={T.navSubjects(domain.label)} onKeyDown={e => onKey(e, domainList.current, 'ArrowUp')}>
        {domain.subjects.map((x, i) => (
          <li key={x.key}>{item(x.label, i === cur.s, e => go(e, cur.d, i))}</li>
        ))}
      </ul>
    </nav>
  )
}
