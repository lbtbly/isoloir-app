// Barre de filtres collante (fiche d'un candidat, page des sujets) : sa hauteur est publiée dans
// --filters-h, pour que l'élément qui reçoit le focus ne passe jamais dessous (WCAG 2.4.11).
// Écran court face au texte (texte agrandi, téléphone couché) : si l'en-tête, la barre et la barre du bas
// prennent plus de la moitié de la hauteur, la barre ne colle plus. Elle défile avec la page et laisse la
// place à la lecture et au focus ; --filters-h tombe alors à zéro.

import type { RefObject } from 'preact'
import { useEffect, useState } from 'preact/hooks'

/** Part de la hauteur de l'écran que les barres fixes et collantes peuvent prendre ensemble */
const MAX_CHROME = 0.5

/** @returns vrai quand la barre ne colle plus (classe is-loose) */
export function useStickyFilters(ref: RefObject<HTMLElement>, key?: string): boolean {
  const [loose, setLoose] = useState(false)
  useEffect(() => {
    const bar = ref.current
    if (!bar || typeof ResizeObserver === 'undefined') return
    const root = document.documentElement
    const header = document.querySelector<HTMLElement>('.form-header')
    const actions = document.querySelector<HTMLElement>('.action-bar')
    // offsetHeight ne dépend pas de la position : décoller la barre ne relance pas la mesure
    const update = () => {
      const chrome = (header?.offsetHeight ?? 0) + bar.offsetHeight + (actions?.offsetHeight ?? 0)
      const off = chrome > window.innerHeight * MAX_CHROME
      setLoose(off)
      root.style.setProperty('--filters-h', off ? '0px' : `${bar.offsetHeight}px`)
    }
    const ro = new ResizeObserver(update)
    for (const el of [bar, header, actions]) if (el) ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--filters-h')
    }
  }, [key])
  return loose
}
