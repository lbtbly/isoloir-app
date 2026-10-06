// Grille « maçonnerie » : les cartes se suivent à la verticale dans chaque colonne, sans attendre la fin
// d'une rangée, donc sans grands blancs. L'ordre du DOM (clavier, lecteurs d'écran) reste l'ordre de lecture :
// chaque carte va simplement dans la colonne la moins haute. La répartition n'est refaite que si le nombre de
// colonnes ou la liste changent ; déplier un encart allonge la carte sans la faire changer de colonne.

import type { RefObject } from 'preact'
import { useLayoutEffect } from 'preact/hooks'

/** Hauteur d'une rangée de la grille, en px (grid-auto-rows dans la feuille de style) */
const ROW = 4
/** Écart de hauteur toléré entre colonnes avant de préférer la plus à droite, en px */
const TOLERANCE = 96

export function useMasonry(ref: RefObject<HTMLElement>, key: string) {
  useLayoutEffect(() => {
    const grid = ref.current
    if (!grid || typeof ResizeObserver === 'undefined') return
    const items = () => [...grid.children] as HTMLElement[]
    let cols = 0
    let assigned = false

    const layout = () => {
      const style = getComputedStyle(grid)
      const n = style.gridTemplateColumns.split(' ').filter(Boolean).length
      // L'écart vertical entre cartes reprend l'écart entre colonnes
      const gap = parseFloat(style.columnGap) || 0
      const list = items()
      const heights = list.map(el => el.getBoundingClientRect().height)
      if (n !== cols || !assigned) {
        cols = n
        assigned = true
        const colH = new Array<number>(n).fill(0)
        list.forEach((el, i) => {
          // La colonne la plus à gauche parmi les moins hautes (à 6rem près) : à hauteur voisine, on lit de
          // gauche à droite plutôt que de sauter d'une colonne à l'autre pour quelques pixels
          const min = Math.min(...colH)
          const c = colH.findIndex(h => h <= min + TOLERANCE)
          el.style.gridColumn = n > 1 ? String(c + 1) : ''
          colH[c]! += heights[i]! + gap
        })
      }
      list.forEach((el, i) => {
        el.style.gridRowEnd = `span ${Math.max(1, Math.ceil((heights[i]! + gap) / ROW))}`
      })
    }

    grid.classList.add('is-masonry')
    const ro = new ResizeObserver(layout)
    ro.observe(grid)
    for (const el of items()) ro.observe(el)
    layout()
    // Les polices chargées changent les hauteurs : on répartit de nouveau une fois, avant toute interaction
    let live = true
    document.fonts?.ready.then(() => {
      if (!live) return
      assigned = false
      layout()
    })
    return () => {
      live = false
      ro.disconnect()
      grid.classList.remove('is-masonry')
      for (const el of items()) {
        el.style.gridColumn = ''
        el.style.gridRowEnd = ''
      }
    }
  }, [key])
}
