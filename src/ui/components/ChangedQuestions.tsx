// Les questions changées sur le fond depuis la réponse (suivi des révisions) : une carte, sur l'accueil et en tête du
// dépouillement, qui se voit d'un coup d'œil (demande du propriétaire du 14/10/2026). Le nombre en grand et le tampon
// « À revoir » ; ce qui s'est passé, en une phrase ; les questions elles-mêmes, par leur thème et leur énoncé ; et le
// bouton qui mène à la feuille de révision. Pas de boucle au stylo autour du nombre : la boucle est la marque d'un avis.

import type { Question, Topic } from '../../core/types'
import '../../styles/home-back.css'
import { link } from '../nav'
import { Icon } from './Icon'

/** Au-delà, « et N autres » : la carte reste courte sur téléphone */
const SHOWN = 3

export function ChangedQuestions({
  questions,
  topics,
  class: c,
}: {
  questions: readonly Question[]
  topics: ReadonlyMap<string, Topic>
  class?: string
}) {
  const n = questions.length
  if (!n) return null
  const many = n > 1
  const rest = n - SHOWN
  return (
    <section class={c ? `changed ${c}` : 'changed'} aria-labelledby="changed-title">
      <div class="changed-head">
        <p class="changed-count" aria-hidden="true">
          {n}
        </p>
        <div class="changed-heading">
          <span class="stamp changed-stamp" aria-hidden="true">
            <span class="stamp-label">À revoir</span>
          </span>
          {/* Le nombre est dit à part, en grand : le titre le reprend pour les lecteurs d'écran seulement */}
          <h2 id="changed-title" class="changed-title">
            <span class="sr-only">{many ? `${n} ` : 'Une '}</span>
            {many ? 'questions ont changé' : 'question a changé'} depuis vos réponses
          </h2>
        </div>
      </div>
      <p class="changed-why">
        {many ? 'Leur énoncé ou leurs approches ont été revus.' : 'Son énoncé ou ses approches ont été revus.'} Votre
        dépouillement est calculé sans {many ? 'elles' : 'elle'} en attendant&nbsp;: {many ? 'revoyez-les' : 'revoyez-la'}{' '}
        pour {many ? 'qu’elles comptent' : 'qu’elle compte'} de nouveau.
      </p>
      <ul class="changed-list">
        {questions.slice(0, SHOWN).map(q => (
          <li key={q.id}>
            <span class="changed-topic">{topics.get(q.topicId)?.label}</span>
            <span class="changed-prompt">{q.prompt}</span>
          </li>
        ))}
        {rest > 0 ? <li class="changed-more">et {rest > 1 ? `${rest} autres` : 'une autre'}</li> : null}
      </ul>
      <a class="btn-primary changed-cta" href={link('/revision')}>
        {many ? `Revoir les ${n} questions` : 'Revoir la question'}
        <Icon name="arrow-right" />
      </a>
    </section>
  )
}
