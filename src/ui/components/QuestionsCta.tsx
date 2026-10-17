// L'appel aux questions des barres du bas (« Les sujets », « Les vidéos », « Les candidats », la fiche d'un candidat,
// « Comparer »), comme celui de l'accueil : « Répondre aux questions », puis « Reprendre mes réponses » vers la première
// question pas encore vue, puis « Voir mon dépouillement » une fois le questionnaire rapide fini (libellés :
// core/resultsCopy.ts). Texte très agrandi (barre de moins de 19rem, app.css) : « Répondre » ou « Reprendre » seul,
// comme dans l'en-tête de l'accueil, plutôt qu'un bouton de trois lignes ; le libellé entier reste le nom du lien.

import { CTA_RESUME, CTA_START } from '../../core/resultsCopy'
import type { Answers, Question } from '../../core/types'
import { link } from '../nav'
import { Icon } from './Icon'

interface Props {
  /** Questions du questionnaire rapide, dans l'ordre de la personne */
  essential: Question[]
  answers: Answers
}

export function QuestionsCta({ essential, answers }: Props) {
  const seen = essential.filter(q => answers[q.id]).length
  if (essential.length > 0 && seen === essential.length) {
    return (
      <a class="btn-primary" href={link('/resultats')}>
        Voir mon dépouillement
        <Icon name="arrow-right" />
      </a>
    )
  }
  const firstOpen = essential.findIndex(q => !answers[q.id])
  return (
    <a class="btn-primary bar-cta" href={link(`/feuille/${(firstOpen < 0 ? 0 : firstOpen) + 1}`)}>
      <span class="bar-cta-long">{seen ? CTA_RESUME : CTA_START}</span>
      <span class="bar-cta-short" aria-hidden="true">
        {seen ? 'Reprendre' : 'Répondre'}
      </span>
      <Icon name="arrow-right" />
    </a>
  )
}
