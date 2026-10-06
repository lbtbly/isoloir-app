// Marques à la main : réservées aux gestes de l'utilisateur (repère entouré, croix, coches, bâtons).
// Chaque trait se dessine une fois (pathLength=1 + stroke-dashoffset), instantanément si le
// mouvement réduit est demandé.

interface InkProps {
  class?: string
  /** Animer le tracé (seulement au moment du geste) */
  draw?: boolean
}

const cls = (base: string, draw?: boolean, extra?: string) =>
  [base, draw ? 'ink-draw' : '', extra ?? ''].filter(Boolean).join(' ')

export function InkTick({ draw, class: c }: InkProps) {
  return (
    <svg class={cls('ink ink-tick', draw, c)} viewBox="0 0 24 24" aria-hidden="true">
      <path pathLength={1} d="M4.2 12.9c2 1.3 3.7 3.1 5 5.5 2.3-5.7 5.9-10.2 10.7-13.8" />
    </svg>
  )
}

export function InkCross({ draw, class: c }: InkProps) {
  return (
    <svg class={cls('ink ink-cross', draw, c)} viewBox="0 0 24 24" aria-hidden="true">
      <path pathLength={1} d="M5.3 5.6c4.6 4.5 8.8 8.8 13.3 13.3" />
      <path pathLength={1} class="ink-second" d="M18.6 5.1c-4.4 4.8-8.6 9.1-13.2 13.6" />
    </svg>
  )
}

/** Boucle au stylo autour du cran choisi (ou d'un mot) : ovale lâche, le trait dépasse son départ */
export function InkLoop({ draw, class: c }: InkProps) {
  return (
    <svg
      class={cls('ink ink-loop', draw, c)}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <path
        pathLength={1}
        d="M30.6 9.8C26.4 5.3 16.2 4.6 10.3 9.1 4.2 13.8 4 24.6 9.7 30.3c6 6 17.3 5.3 22.3-1.2 4.4-5.7 3.3-14.6-2.4-19.4-3.8-3.2-9.3-4.1-13.9-3.2"
      />
    </svg>
  )
}
