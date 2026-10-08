import { go, link } from '../nav'
import { orderedQuestions } from '../../core/order'
import { isAnswered } from '../../core/answers'
import { effectiveWeight, type Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { InkTick } from '../components/Ink'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
  update: (patch: Partial<SessionState>) => void
}

/** Thèmes où les deux premiers ont le plus d'approches principales différentes dans l'approfondissement */
function tieBreakTopics(pack: ElectionPack, results: Results, answered: Set<string>): string[] {
  const [a, b] = results.ranking
  if (!a || !b || a.score === null || b.score === null) return []
  const main = (cid: string, ids: string[]) => ids.find(id => effectiveWeight(pack.positions[cid]?.[id]) === 2)
  const counts = new Map<string, number>()
  for (const q of pack.bank.questions) {
    if (q.tier !== 'approfondi' || answered.has(q.id)) continue
    const ids = q.approaches.map(x => x.id)
    const ma = main(a.candidateId, ids)
    const mb = main(b.candidateId, ids)
    if (ma && mb && ma !== mb) counts.set(q.topicId, (counts.get(q.topicId) ?? 0) + 1)
  }
  return [...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([t]) => t)
}

export function Deepen({ pack, state, results, update }: Props) {
  const { bank, election } = pack
  const suggestion = results.close ? tieBreakTopics(pack, results, new Set(Object.keys(state.answers))) : []
  const topics = bank.topics
    .map(t => {
      const qs = bank.questions.filter(q => q.topicId === t.id && q.tier === 'approfondi')
      return { t, total: qs.length, done: qs.filter(q => state.answers[q.id]).length }
    })
    .filter(x => x.total > 0)
  const chosen = state.deepTopics
  const toggle = (id: string) =>
    update({ deepTopics: chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen, id] })
  const allIds = topics.map(x => x.t.id)
  const all = allIds.every(id => chosen.includes(id))

  const list = orderedQuestions(bank, 'approfondi', state.seed, chosen)
  const firstOpen = list.findIndex(q => !state.answers[q.id])
  const start = () => go(`/approfondi/${(firstOpen < 0 ? 0 : firstOpen) + 1}`)
  const remaining = list.filter(q => !isAnswered(state.answers[q.id]) && !state.answers[q.id]?.skipped).length

  return (
    <div class="screen screen-sheet">
      <FormHeader title="Feuille complémentaire" right={election.shortName} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="q-prompt" tabIndex={-1}>
          Quels thèmes voulez-vous approfondir ?
        </h1>
        <p class="q-context">
          Un thème déjà présent garde son poids : l’approfondir affine son score sans lui donner plus d’importance. Un
          thème absent du questionnaire rapide s’ajoute au calcul avec le même poids que les autres. Les questions
          complémentaires comptent plus de positions inconnues.
        </p>
        {suggestion.length ? (
          <p class="suggestion">
            Vos deux premiers sont au coude à coude. Les thèmes qui les départagent le plus :{' '}
            {suggestion.map(id => bank.topics.find(t => t.id === id)?.label).join(', ')}.{' '}
            <button
              type="button"
              class="btn-text"
              onClick={() => update({ deepTopics: [...new Set([...state.deepTopics, ...suggestion])] })}
            >
              Cocher ces thèmes
            </button>
          </p>
        ) : null}
        <ul class="approaches is-topics" aria-label="Thèmes à approfondir">
          {topics.map(({ t, total, done }) => {
            const on = chosen.includes(t.id)
            return (
              <li key={t.id} class={`approach${on ? ' is-liked' : ''}`}>
                <span class="approach-letter count" aria-hidden="true">
                  {total}
                </span>
                <button type="button" class="approach-main" aria-pressed={on} onClick={() => toggle(t.id)}>
                  <span class="approach-text">
                    <span class="topic-label">{t.label}</span>
                    <span class="topic-desc">
                      {total} question{total > 1 ? 's' : ''}
                      {done > 0 ? `, ${done} déjà vue${done > 1 ? 's' : ''}` : ''}
                    </span>
                  </span>
                  <span class="box" aria-hidden="true">
                    {on ? <InkTick /> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p class="link-row">
          <button type="button" class="btn-text" onClick={() => update({ deepTopics: all ? [] : allIds })}>
            {all ? 'Tout décocher' : 'Tout cocher'}
          </button>
        </p>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Navigation">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/resultats')}>
            <Icon name="arrow-left" />
            Résultats
          </a>
          <span class="bar-note" aria-live="polite">
            {list.length ? `${list.length} question${list.length > 1 ? 's' : ''}` : ''}
          </span>
          <button type="button" class="btn-primary" disabled={list.length === 0} onClick={start}>
            {remaining < list.length && remaining > 0 ? 'Reprendre' : 'Commencer'}
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
