// Entrées au défilement, discrètes et une seule fois : un léger glissé vers le haut, en cascade entre voisins.
// Rien n'est masqué sans script, ni sous « mouvement réduit » : la classe reveal-on n'est posée qu'une fois
// l'observateur en place, et la feuille de style n'anime que hors mouvement réduit.

import type { RefObject } from 'preact'
import { useEffect } from 'preact/hooks'

/**
 * @param items éléments révélés un à un, quand ils entrent à l'écran
 * @param groups conteneurs dont les enfants entrent ensemble, en cascade (pour une rangée qui défile
 *   à l'horizontale sur téléphone : ses panneaux hors champ ne doivent pas attendre d'être balayés)
 */
export function useReveal(ref: RefObject<HTMLElement>, items: string, groups: [container: string, children: string][] = []) {
  useEffect(() => {
    const root = ref.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const marked: HTMLElement[] = []
    const mark = (el: HTMLElement, i: number) => {
      el.style.setProperty('--reveal-i', String(Math.min(i, 5)))
      el.classList.add('is-reveal')
      marked.push(el)
    }
    // Ce qui est déjà à l'écran au chargement reste en place : rien ne s'efface pour réapparaître
    const below = (el: Element) => el.getBoundingClientRect().top >= innerHeight
    const singles = [...root.querySelectorAll<HTMLElement>(items)].filter(below)
    for (const el of singles) {
      // Rang parmi les voisins révélés, pour la cascade
      const siblings = el.parentElement ? [...el.parentElement.children].filter(c => singles.includes(c as HTMLElement)) : [el]
      mark(el, siblings.indexOf(el))
    }
    const members = new Map<Element, HTMLElement[]>()
    for (const [container, children] of groups) {
      for (const box of [...root.querySelectorAll(container)].filter(below)) {
        const kids = [...box.querySelectorAll<HTMLElement>(children)]
        kids.forEach(mark)
        members.set(box, kids)
      }
    }

    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          for (const el of members.get(e.target) ?? [e.target]) el.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    singles.forEach(el => io.observe(el))
    members.forEach((_, box) => io.observe(box))
    root.classList.add('reveal-on')
    return () => {
      io.disconnect()
      root.classList.remove('reveal-on')
      for (const el of marked) el.classList.remove('is-reveal', 'is-in')
    }
  }, [])
}
