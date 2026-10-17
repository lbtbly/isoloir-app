// La barre collante de « Mon profil politique » (ui/profile/Chart.tsx) : sous l'en-tête du site, pendant qu'on parcourt
// le graphique, la rangée des domaines, et au téléphone, dessous, les sujets du domaine en cours (demande du propriétaire
// du 17 octobre 2026 : « naviguer domaine par domaine puis thème par thème »). Chaque rangée défile sur le côté ; le
// domaine et le sujet que l'on lit sont marqués (aria-current) et ramenés dans la vue de leur rangée à mesure que la page
// défile (IntersectionObserver, sur la ligne où s'arrête le focus : celle du scroll-padding) ; un toucher y mène et donne
// le focus à son titre, que le scroll-padding garde sous les éléments collants (WCAG 2.4.11). Au clavier : Tab entre dans
// chaque rangée par son élément en cours, les flèches gauche et droite, Début et Fin s'y déplacent (la tabulation suit
// le focus), bas et haut passent d'une rangée à l'autre ; le focus dans la barre collée ne fait jamais défiler la page
// (profile.css : scroll-margin des liens), et la page qui défile ne le perd pas. Neutre : les domaines dans l'ordre des
// familles, les sujets dans celui de leurs lignes, des noms seulement, ni groupe, ni lecture, ni couleur de bloc. Sur un
// écran trop court face au texte, la barre ne colle plus et défile avec la page (useStickyFilters, comme la barre de
// filtres de la fiche d'un candidat), l'axe collant ou le rappel des blocs comptés avec elle.

import { useEffect, useRef, useState } from 'preact/hooks'
import * as T from '../../core/echiquierCopy'
import { link } from '../nav'
import { useStickyFilters } from '../useStickyFilters'
import type { NavDomain } from './rows'

const smooth = (): ScrollBehavior => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth')

/**
 * Ramène un élément d'une rangée (son li ou son lien) au milieu de sa vue, sans faire défiler la page ; keep : pas dans
 * la rangée qui a le focus, où l'élément qui l'a reste en vue
 */
function center(item: Element | null | undefined, keep?: boolean) {
  const list = item?.closest('ul')
  if (list && !(keep && list.contains(document.activeElement)))
    list.scrollTo({ left: (item as HTMLElement).offsetLeft - (list.clientWidth - (item as HTMLElement).offsetWidth) / 2, behavior: smooth() })
}

/** Ce qui colle sous la barre (Chart.tsx, --axis-stick) : l'axe en grand écran, sinon le rappel des blocs, avec les colonnes */
function below() {
  const a = document.querySelector<HTMLElement>('.profile-chart .axis')!
  return getComputedStyle(a).position === 'sticky' ? a.offsetHeight : document.querySelector('.profile-chart .zones')?.getClientRects().length ? document.querySelector<HTMLElement>('.axis-mini')!.offsetHeight : 0
}

/** Les flèches dans une rangée ; bas et haut, vers l'élément de l'autre rangée qui porte sa tabulation */
function onKey(e: KeyboardEvent, other: HTMLElement | null, toOther: string) {
  const links = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('a')]
  const i = links.indexOf(document.activeElement as HTMLElement)
  const next =
    e.key === toOther
      ? other?.querySelector<HTMLElement>('[tabindex="0"]')
      : links[e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : -1]
  if (i < 0 || !next?.offsetParent) return
  e.preventDefault()
  // Le focus ne fait pas défiler la page ; la rangée, elle, ramène son élément au milieu de sa vue
  next.focus({ preventScroll: true })
  center(next)
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
  // L'élément qui a le focus dans la barre, [rangée, rang] : il porte la tabulation de sa rangée, à la place de
  // l'élément en cours, jusqu'à ce que le focus quitte la barre
  const [foc, setFoc] = useState<number[] | null>(null)
  // La barre colle, sauf sur un écran trop court face au texte : sa hauteur va dans --filters-h, que lisent le
  // scroll-padding de la page, le rappel des blocs et l'axe collant (profile.css)
  const loose = useStickyFilters(nav, undefined, below)
  // Pendant un défilement doux vers une destination de la barre, elle la garde marquée, sans passer par chaque domaine
  // traversé (à l'arrivée, ce que l'on lit est cette destination) ; le doigt posé sur la barre, elle ne défile pas
  // d'elle-même
  const lock = useRef(0)
  const busy = useRef(0)
  // Le focus était dans la rangée des sujets quand le domaine a changé : refaite, elle le rend à son sujet en cours
  const keep = useRef(false)
  const shown = useRef(cur)
  shown.current = cur

  // Ce que l'on lit : le domaine qui passe sous la ligne du focus (le scroll-padding de la page), et sa ligne qui y passe
  // ou, sur un intertitre, celle qui le suit ; entre deux domaines, celui du dessus
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
      // Entre deux domaines, celui du dessus (en descendant, celui que l'on quitte : rien ne change) ; au-dessus du
      // premier, le premier, comme à l'arrivée ; après un saut aussi
      const group = groups.find(x => hit.has(x)) ?? groups.findLast(x => x.getBoundingClientRect().top <= line) ?? groups[0]!
      const d = domains.findIndex(x => group.id === `fam-${x.id}`)
      if (d < 0) return
      const lines = [...group.querySelectorAll<HTMLElement>('.row-item')]
      const at = lines.find(x => x.getBoundingClientRect().bottom > line) ?? lines.at(-1)
      const s = Math.max(0, domains[d]!.subjects.findIndex(x => x.key === at?.dataset.key))
      keep.current = d !== shown.current.d && !!subjectList.current?.contains(document.activeElement)
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
      // Les lignes elles-mêmes aussi : un saut depuis le haut de la page jusqu'entre deux domaines ne croise ni domaine
      // ni ligne
      for (const x of [root, ...groups, ...items]) io.observe(x)
    }
    // Les hauteurs collantes ou la fenêtre changent (texte agrandi, téléphone tourné, détail ouvert) : la ligne avec
    // elles. Chacune est une variable posée sur <html> (--header-real, --filters-h, --axis-stick, --echq-head)
    const rebuild = () => {
      io?.disconnect()
      io = undefined
      requestAnimationFrame(build)
    }
    const mo = new MutationObserver(rebuild)
    mo.observe(document.documentElement, { attributeFilter: ['style'] })
    addEventListener('resize', rebuild)
    build()
    return () => {
      io?.disconnect()
      mo.disconnect()
      removeEventListener('resize', rebuild)
    }
  }, [domains, rows])

  // Le domaine et le sujet en cours, ramenés dans la vue de leur rangée (pas sous le doigt ; dans la rangée qui avait le
  // focus, dès qu'il la quitte) ; le focus de la rangée des sujets, refaite pour un autre domaine, à son sujet en cours
  useEffect(() => {
    if (performance.now() > busy.current) {
      center(domainList.current?.children[cur.d], true)
      center(subjectList.current?.children[cur.s], true)
    }
    if (keep.current && !nav.current?.contains(document.activeElement)) subjectList.current?.querySelector<HTMLElement>('[aria-current]')?.focus({ preventScroll: true })
    keep.current = false
  }, [cur, foc])

  // Les réponses changées dans un autre onglet peuvent ôter des domaines : le premier, le temps de relire
  const domain = domains[cur.d] ?? domains[0]!

  /** Mène au domaine d (s : null) ou à son sujet s : son titre reçoit le focus, sous les éléments collants */
  const go = (e: MouseEvent, d: number, s: number | null) => {
    if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const dom = domains[d]!
    const el = document.getElementById(s === null ? dom.focus : dom.subjects[s]!.focus)
    if (!el) return
    // Un domaine depuis son filet, comme sa toute première ligne ; un autre sujet sous l'intertitre de son groupe, tant que
    // sa ligne tient encore entière au-dessus de la barre du bas ; sinon, la ligne seule
    const group = el.closest<HTMLElement>('.fam-group')!
    const box = s === null || group.querySelector('.row') === el ? group : el.closest<HTMLElement>('.fam-part')!
    const pad = getComputedStyle(document.documentElement)
    const target = el.getBoundingClientRect().bottom - box.getBoundingClientRect().top < innerHeight - parseFloat(pad.scrollPaddingTop) - parseFloat(pad.scrollPaddingBottom) ? box : el
    lock.current = performance.now() + (smooth() === 'auto' ? 100 : 900)
    // La destination, elle, vient au milieu de sa rangée, même touchée au bord
    busy.current = 0
    setCur({ d, s: s ?? 0 })
    target.scrollIntoView({ block: 'start', behavior: smooth() })
    el.focus({ preventScroll: true })
  }

  /** L'élément i de la rangée r : on, l'élément en cours */
  const item = (r: number, i: number, label: string, on: boolean, click: (e: MouseEvent) => void) => (
    <a
      class="pn-link"
      href={link('/profil')}
      tabIndex={(foc?.[0] === r ? foc[1] === i : on) ? 0 : -1}
      aria-current={on ? 'location' : undefined}
      onClick={click}
      onFocus={() => setFoc([r, i])}
    >
      {label}
    </a>
  )
  return (
    <nav
      class={`profile-nav${loose ? ' is-loose' : ''}`}
      ref={nav}
      aria-label={T.NAV_LABEL}
      onPointerDown={() => (busy.current = performance.now() + 1500)}
      onFocusOut={e => nav.current?.contains(e.relatedTarget as Node) || setFoc(null)}
    >
      <ul class="pn-list" ref={domainList} aria-label={T.NAV_DOMAINS} onKeyDown={e => onKey(e, subjectList.current, 'ArrowDown')}>
        {domains.map((x, i) => (
          <li key={x.id}>{item(0, i, x.label, i === cur.d, e => go(e, i, null))}</li>
        ))}
      </ul>
      <ul class="pn-list pn-subjects" key={domain.id} ref={subjectList} aria-label={T.navSubjects(domain.label)} onKeyDown={e => onKey(e, domainList.current, 'ArrowUp')}>
        {domain.subjects.map((x, i) => (
          <li key={x.key}>{item(1, i, x.label, i === cur.s, e => go(e, cur.d, i))}</li>
        ))}
      </ul>
    </nav>
  )
}
