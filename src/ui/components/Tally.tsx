// Bâtons de pointage : un trait par réponse, regroupés par cinq (quatre verticaux, un barré),
// comme sur les feuilles de dépouillement.
// - Dans la barre d'actions, seuls les trois derniers paquets restent dessinés, précédés du total
//   déjà compté, pour que la barre ne grandisse pas.
// - Au dépouillement (résultats), tous les paquets sont tracés l'un après l'autre.
// Le tracé de chaque bâton vient de core/tally, que le dépouillement en PDF suit aussi.

import { tallyPath } from '../../core/tally'

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
  /** Aucun tracé, pas même le dernier bâton : un compte rappelé, que rien ne vient d'ajouter (accueil de retour) */
  still?: boolean
  class?: string
}

export function Tally({ count, label, maxGroups = 3, drawAll = false, delay = 0, muted = false, still = false, class: c }: TallyProps) {
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
              const drawn = !still && (drawAll || i === count - 1)
              return (
                <path
                  key={k}
                  pathLength={1}
                  class={drawn ? 'ink-draw' : undefined}
                  style={drawn && drawAll ? { animationDelay: `${delay + i * 55}ms` } : undefined}
                  d={tallyPath(i)}
                />
              )
            })}
          </svg>
        )
      })}
    </span>
  )
}
