// Bâtons de pointage : un trait par réponse, regroupés par cinq (quatre verticaux, un barré),
// comme sur les feuilles de dépouillement.
// - Dans la barre d'actions, seuls les trois derniers paquets restent dessinés, précédés du total
//   déjà compté, pour que la barre ne grandisse pas.
// - Au dépouillement (résultats), tous les paquets sont tracés l'un après l'autre.

interface TallyProps {
  count: number
  label: string
  /** Nombre maximal de paquets dessinés (les plus récents) */
  maxGroups?: number
  /** Tracer tous les bâtons à la suite, avec un décalage (dépouillement) */
  drawAll?: boolean
  /** Délai de départ du tracé, en millisecondes */
  delay?: number
  /** Bâtons en pointillé (candidat écarté par un refus) */
  muted?: boolean
  class?: string
}

function jitter(i: number, k: number): number {
  // Variation déterministe pour que chaque bâton ait l'air tracé à la main
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 1.4
}

export function Tally({ count, label, maxGroups = 3, drawAll = false, delay = 0, muted = false, class: c }: TallyProps) {
  const groups = Math.ceil(count / 5)
  const firstShown = Math.max(0, groups - maxGroups)
  const hidden = firstShown * 5
  return (
    <span class={['tally', muted ? 'is-muted' : '', c].filter(Boolean).join(' ')} role="img" aria-label={label}>
      {hidden > 0 ? (
        <span class="tally-carry" aria-hidden="true">
          {hidden}&#8239;+
        </span>
      ) : null}
      {Array.from({ length: groups - firstShown }, (_, j) => {
        const g = firstShown + j
        const inGroup = Math.min(5, count - g * 5)
        return (
          <svg key={g} class="tally-group" viewBox="0 0 30 26" aria-hidden="true">
            {Array.from({ length: inGroup }, (_, k) => {
              const i = g * 5 + k
              const drawn = drawAll || i === count - 1
              const d =
                k < 4
                  ? `M${4 + k * 6 + jitter(i, 1)} ${3 + jitter(i, 2)} L${4.4 + k * 6 + jitter(i, 3)} ${23 + jitter(i, 4)}`
                  : `M${0.8 + jitter(i, 5)} ${19.5 + jitter(i, 6)} L${28.5 + jitter(i, 7)} ${6 + jitter(i, 8)}`
              return (
                <path
                  key={k}
                  pathLength={1}
                  class={drawn ? 'ink-draw' : undefined}
                  style={drawAll ? { animationDelay: `${delay + i * 55}ms` } : undefined}
                  d={d}
                />
              )
            })}
          </svg>
        )
      })}
    </span>
  )
}
