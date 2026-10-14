// « À table » : préparer la table. Combien de personnes (de 3 à 12, en bâtons d'émargement) et quels sujets (le
// vivier, tiré par règle ; deux tirés au hasard, de 2 à 4). Le récapitulatif compte les idées à lire, jamais les
// minutes. Reçoit les questions du vivier sans rien savoir des candidats.

import { MAX_PEOPLE, MIN_PEOPLE } from '../../../core/table/count'
import { setupSummary, TABLE_NAME } from '../../../core/table/copy'
import type { Question, Topic } from '../../../core/types'
import { AiLabel } from '../../components/AiLabel'
import { FormHeader } from '../../components/FormHeader'
import { Icon } from '../../components/Icon'
import { SiteFooter } from '../../components/SiteFooter'
import { Tally } from '../../components/Tally'

interface Props {
  people: number
  setPeople: (n: number) => void
  pool: readonly Question[]
  topics: ReadonlyMap<string, Topic>
  chosen: readonly string[]
  /** Coche ou décoche un sujet ; false quand c'est refusé (moins de 2 ou plus de 4 sujets) */
  toggle: (id: string) => boolean
  min: number
  max: number
  status: string
  onOpen: () => void
  onBack: () => void
}

export function Setup({ people, setPeople, pool, topics, chosen, toggle, min, max, status, onOpen, onBack }: Props) {
  const ideas = pool.filter(q => chosen.includes(q.id)).reduce((n, q) => n + q.approaches.length, 0)
  return (
    <div class="screen screen-table-setup">
      <FormHeader title={TABLE_NAME} />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Préparer la table
        </h1>

        <section aria-labelledby="combien">
          <h2 id="combien" class="q-prompt">
            Combien êtes-vous&nbsp;?
          </h2>
          <div class="table-count">
            <button type="button" aria-label="Une personne de moins" aria-disabled={people <= MIN_PEOPLE} onClick={() => people > MIN_PEOPLE && setPeople(people - 1)}>
              −
            </button>
            <span class="table-count-n" aria-hidden="true">
              {people}
            </span>
            <button type="button" aria-label="Une personne de plus" aria-disabled={people >= MAX_PEOPLE} onClick={() => people < MAX_PEOPLE && setPeople(people + 1)}>
              +
            </button>
            <Tally count={people} maxGroups={Infinity} label={`${people} personnes`} />
          </div>
          <p class="small">
            De {MIN_PEOPLE} à {MAX_PEOPLE} personnes. {people <= MIN_PEOPLE ? 'À trois, un vote se devine plus facilement\u00a0: à quatre ou plus, le secret tient mieux.' : 'En dessous de trois, le secret ne tiendrait pas.'}
          </p>
        </section>

        <section aria-labelledby="sujets" class="block">
          <h2 id="sujets">Les sujets</h2>
          <AiLabel kind="feuille" />
          <p>
            Deux sujets tirés au sort parmi {pool.length} thèmes. Changez-les si vous voulez&nbsp;: de {min} à {max}.
          </p>
          <ul class="table-subjects">
            {pool.map(q => {
              const on = chosen.includes(q.id)
              return (
                <li key={q.id}>
                  <label class={`table-subject${on ? ' is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={e => {
                        // Geste refusé : la case reprend aussitôt son état, le motif est annoncé
                        if (!toggle(q.id)) (e.currentTarget as HTMLInputElement).checked = on
                      }}
                    />
                    <span class="table-subject-topic">{topics.get(q.topicId)?.label}</span>
                    <span class="table-subject-prompt">{q.prompt}</span>
                    <span class="table-subject-meta">{q.approaches.length} idées</span>
                  </label>
                </li>
              )
            })}
          </ul>
          <p class="sr-only" role="status" aria-live="polite">
            {status}
          </p>
        </section>

        <p class="table-summary" role="status">
          {setupSummary(people, chosen.length, ideas)}
        </p>
        <p class="small">Avec un lecteur d’écran, mettez des écouteurs&nbsp;: il lit le bulletin à voix haute.</p>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Préparer la table">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={onBack}>
            <Icon name="arrow-left" />
            Retour
          </button>
          <span />
          <button type="button" class="btn-primary" onClick={onOpen}>
            Ouvrir l’urne
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
