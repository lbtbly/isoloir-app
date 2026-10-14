import { tallyPath } from '../../core/tally'

/**
 * Les questions du questionnaire rapide en bâtons, par cinq : pointées au bleu bille (le cinquième barre le paquet), à
 * venir en crans pointillés imprimés. Décoratif : le titre dit déjà le compte. La fiche « Où vous en êtes » de la
 * tendance (ui/screens/Results.tsx) et la page d'attente de « Mon profil politique » (ui/screens/Profile.tsx)
 */
export function ProgressTally({ done, total }: { done: number; total: number }) {
  const groups = Math.ceil(total / 5)
  return (
    <svg class="trend-tally" viewBox={`0 0 ${groups * 36 - 6} 26`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const x = Math.floor(i / 5) * 36
        const k = i % 5
        if (i >= done) return <path key={i} d={`M${x + 3 + k * 6} 4 V22`} class="is-todo" />
        return <path key={i} d={tallyPath(i, x)} class="is-done" />
      })}
    </svg>
  )
}
