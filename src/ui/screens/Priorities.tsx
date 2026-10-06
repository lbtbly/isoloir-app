import { useState } from 'preact/hooks'
import { go } from '../../app'
import { hasOpinion } from '../../core/answers'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question, TopicWeights } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { InkTick } from '../components/Ink'

export const MAX_PRIORITIES = 3

interface Props {
  pack: ElectionPack
  state: SessionState
  update: (patch: Partial<SessionState>) => void
  essential: Question[]
}

export function Priorities({ pack, state, update, essential }: Props) {
  // Seuls les thèmes où vous avez donné un avis peuvent peser : les autres seraient sans effet
  const answeredTopics = new Set(pack.bank.questions.filter(q => hasOpinion(state.answers[q.id])).map(q => q.topicId))
  const topics = pack.bank.topics.filter(t => answeredTopics.has(t.id))
  const chosen = topics.filter(t => state.weights[t.id] === 2).map(t => t.id)
  const [touched, setTouched] = useState<string | null>(null)
  const [refused, setRefused] = useState(false)

  const toggle = (id: string) => {
    const on = chosen.includes(id)
    if (!on && chosen.length >= MAX_PRIORITIES) {
      setRefused(true)
      return
    }
    setRefused(false)
    setTouched(id)
    const weights: TopicWeights = { ...state.weights }
    if (on) delete weights[id]
    else weights[id] = 2
    update({ weights })
  }

  const full = chosen.length >= MAX_PRIORITIES
  const lastQuestion = Math.max(1, essential.length)

  return (
    <div class="screen screen-sheet">
      <FormHeader title="Feuille de pointage" right={<span class="locator-topic">Priorités</span>} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="q-prompt" tabIndex={-1}>
          Quels sujets comptent le plus pour vous ?
        </h1>
        <p class="q-context">
          Choisissez jusqu’à {MAX_PRIORITIES} thèmes : ils compteront double dans le calcul. Sans choix, tous les thèmes
          pèsent autant. Vous pourrez changer d’avis depuis les résultats.
        </p>
        <p class={`q-hint${refused ? ' is-alert' : ''}`} role="status" aria-live="polite">
          {refused
            ? `Déjà ${MAX_PRIORITIES} thèmes choisis : décochez-en un pour en choisir un autre.`
            : `${chosen.length} thème${chosen.length > 1 ? 's' : ''} choisi${chosen.length > 1 ? 's' : ''} sur ${MAX_PRIORITIES} possibles.`}
        </p>
        {topics.length === 0 ? (
          <p>Donnez d’abord votre avis dans la feuille : les priorités ne portent que sur les thèmes où vous avez répondu.</p>
        ) : (
          <ul class="approaches is-topics" aria-label="Thèmes">
            {topics.map(t => {
              const on = chosen.includes(t.id)
              const disabled = !on && full
              return (
                <li key={t.id} class={`approach${on ? ' is-liked' : ''}`}>
                  <span class="approach-letter" aria-hidden="true">
                    {on ? '×2' : ''}
                  </span>
                  <button
                    type="button"
                    class="approach-main"
                    aria-pressed={on}
                    aria-disabled={disabled}
                    onClick={() => toggle(t.id)}
                  >
                    <span class="approach-text">
                      <span class="topic-label">{t.label}</span>
                      <span class="topic-desc">{t.description}</span>
                    </span>
                    <span class="box" aria-hidden="true">
                      {on ? <InkTick draw={touched === t.id} /> : null}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Navigation">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={() => go(`/feuille/${lastQuestion}`)}>
            <Icon name="arrow-left" />
            Feuille
          </button>
          <span />
          <button type="button" class="btn-primary" onClick={() => go('/resultats')}>
            Dépouiller
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
