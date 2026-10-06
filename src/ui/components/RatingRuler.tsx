// Réglette d'avis : trois crans imprimés sur un filet, « pas d'accord », « sans avis », « d'accord ».
// Ce sont de vrais boutons radio (flèches du clavier, lecteurs d'écran), habillés en réglette.
// Le repère tracé à la main prend la couleur de son cran sur l'échelle des résultats, et le mot
// du cran s'écrit dessous : la couleur n'est jamais le seul indice. « Sans avis » est un cran comme
// les autres : entouré de gris, son mot écrit dessous, dès l'état de départ.
// Toucher à nouveau le cran choisi le remet « sans avis ».

import { RATING_LABELS, SCALE } from '../../core/answers'
import type { Rating } from '../../core/types'
import { Icon } from './Icon'
import { InkLoop } from './Ink'

/**
 * Ton de chaque cran, pris sur l'échelle d'affinité des résultats. « Pas d'accord » prend l'orangé
 * de « Éloigné » : le rouge reste réservé à la ligne rouge.
 */
export const TONE: Record<Rating | 0, string> = {
  [-1]: 'eloigne',
  0: 'mitige',
  1: 'tres-proche',
}

interface RulerProps {
  /** Nom du groupe de boutons radio, unique dans la page */
  name: string
  /** Nom accessible du groupe : « Votre avis sur l'approche B » */
  label: string
  /** Identifiant du texte de l'approche, annoncé avec chaque cran */
  describedBy?: string
  value: Rating | 0
  onChange: (value: Rating | 0) => void
  /** Tracer le repère (seulement au moment du geste) */
  draw?: boolean
}

export function RatingRuler({ name, label, describedBy, value, onChange, draw }: RulerProps) {
  return (
    <div class="ruler" role="radiogroup" aria-label={label}>
      {SCALE.map(v => {
        const on = v === value
        return (
          <label key={v} class={`cran${on ? ' is-on' : ''}${v === 0 ? ' is-zero' : ''}`} data-tone={TONE[v]}>
            <input
              type="radio"
              name={name}
              value={v}
              checked={on}
              aria-describedby={describedBy}
              onChange={() => onChange(v)}
              onClick={() => {
                if (on && v !== 0) onChange(0)
              }}
            />
            <span class="sr-only">{RATING_LABELS[v]}</span>
            <span class="tick" aria-hidden="true" />
            {on ? <InkLoop draw={draw} class="cran-mark" /> : null}
          </label>
        )
      })}
      <span
        class={`ruler-value${value === -1 ? ' at-start' : value === 1 ? ' at-end' : ''}`}
        style={{ '--at': SCALE.indexOf(value) } as never}
        data-tone={TONE[value]}
        aria-hidden="true"
      >
        {RATING_LABELS[value]}
      </span>
    </div>
  )
}

/** En-tête de colonnes, au-dessus des lignes : les trois crans et la case « ligne rouge » */
export function RulerLegend() {
  return (
    <div class="approach-head" aria-hidden="true">
      <span class="ruler-legend">
        {SCALE.map(v => (
          <span key={v} data-tone={TONE[v]}>
            {RATING_LABELS[v]}
          </span>
        ))}
      </span>
      <span class="col-reject">
        <Icon name="cross" class="is-red" />
        <span class="col-label">Ligne rouge</span>
      </span>
    </div>
  )
}

/**
 * Petite réglette en lecture seule, pour la révélation : votre cran (« Sans avis » compris), et votre
 * ligne rouge. `lead` précède le mot pour les lecteurs d'écran (« Votre avis : »).
 */
export function RatingMark({ value, redLine, lead }: { value: Rating | 0; redLine: boolean; lead?: string }) {
  return (
    <span class={`rating-mark${redLine ? ' is-red-line' : ''}`} data-tone={TONE[value]}>
      <span class="mini-ruler" aria-hidden="true">
        {SCALE.map(v => (
          <span key={v} class={v === value ? 'is-on' : ''} />
        ))}
      </span>
      <span class="rating-mark-label">
        {lead ? <span class="sr-only">{lead}</span> : null}
        {redLine ? 'Ligne rouge' : RATING_LABELS[value]}
      </span>
    </span>
  )
}
