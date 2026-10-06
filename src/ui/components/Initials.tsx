import type { Candidate } from '../../core/types'

/** Ce que le candidat pense d'une approche */
export type Mark = 'main' | 'secondary' | 'rejects'
/** Pour l'affichage, en plus : position non trouvée sur la question */
type Shown = Mark | 'unknown'

const MARK_LABEL: Record<Shown, string> = {
  main: 'approche principale',
  secondary: 'approche compatible',
  rejects: 'rejette cette approche',
  unknown: 'position inconnue',
}

/**
 * Initiales imprimées d'un candidat, dans le code de la réglette : vert plein pour l'approche principale,
 * vert pâle pour une approche compatible, orangé-brun barré pour un rejet, gris en pointillé pour une
 * position inconnue. La forme (plein, pâle, tirets barrés, pointillé) double toujours la couleur.
 */
export function Initials({ candidate, mark, withName }: { candidate: Candidate; mark?: Shown; withName?: boolean }) {
  return (
    <span class={`initials${mark ? ` is-${mark}` : ''}`} title={mark ? `${candidate.name} : ${MARK_LABEL[mark]}` : candidate.name}>
      <span class="initials-mark" aria-hidden="true">
        {candidate.initials}
      </span>
      {withName ? <span class="initials-name">{candidate.name}</span> : <span class="sr-only">{mark ? `${candidate.name}, ${MARK_LABEL[mark]}` : candidate.name}</span>}
    </span>
  )
}

/** Pastille d'exemple, pour les légendes : la marque seule, sans candidat */
export function InitialsSample({ mark }: { mark: Shown }) {
  return (
    <span class={`initials is-${mark}`} aria-hidden="true">
      <span class="initials-mark">AB</span>
    </span>
  )
}
