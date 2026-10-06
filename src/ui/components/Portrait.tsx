import type { Candidate } from '../../core/types'

/** Portrait du candidat (photo sous licence libre), ou ses initiales imprimées faute de photo autorisée */
export function Portrait({ candidate, size, decorative }: { candidate: Candidate; size: 'small' | 'strip' | 'id' | 'row'; decorative?: boolean }) {
  if (candidate.photo) {
    return (
      <img class={`portrait is-${size}`} src={candidate.photo.src} alt={decorative ? '' : candidate.photo.alt} loading="lazy" />
    )
  }
  return (
    <span class={`portrait is-${size} is-initials`} aria-hidden="true">
      {candidate.initials}
    </span>
  )
}
