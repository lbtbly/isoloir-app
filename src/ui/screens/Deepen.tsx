import { go, link } from '../nav'
import { orderedQuestions } from '../../core/order'
import { isAnswered } from '../../core/answers'
import { effectiveWeight, type Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack } from '../../core/types'
import { deepenTouched, PROFILE_TITLE } from '../../core/resultsCopy'
import { axisOf } from '../../core/spectrum'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { InkTick } from '../components/Ink'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
  update: (patch: Partial<SessionState>) => void
  /** Le thème touché sur « Mon profil politique » (#/approfondir/<thème>), que ce geste a coché */
  topic?: string
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

export function Deepen({ pack, state, results, update, topic }: Props) {
  const { bank, election } = pack
  const suggestion = results.close ? tieBreakTopics(pack, results, new Set(Object.keys(state.answers))) : []
  // Les thèmes et leurs questions complémentaires encore sans réponse : une question répondue (au moins un avis) sort
  // de la liste, et un thème dont toutes les questions le sont n'y figure plus. Une question passée reste à faire.
  const open = (id: string) => !isAnswered(state.answers[id])
  const topics = bank.topics
    .map(t => {
      const qs = bank.questions.filter(q => q.topicId === t.id && q.tier === 'approfondi')
      return { t, left: qs.filter(q => open(q.id)).length, done: qs.filter(q => !open(q.id)).length }
    })
    .filter(x => x.left > 0)
  const chosen = state.deepTopics
  // Arrivé d'un thème touché sur « Mon profil politique » : sa ligne en tête de liste, même décochée ensuite (rien ne
  // saute sous le doigt) ; tant qu'il est coché, la phrase sous le titre dit ce qui l'est, et la feuille commence par lui
  const touched = topic ? topics.find(x => x.t.id === topic) : undefined
  const shown = touched ? [touched, ...topics.filter(x => x !== touched)] : topics
  const lead = touched && chosen.includes(touched.t.id) ? touched : undefined
  const fromProfile = !!topic && !!axisOf(election)
  const toggle = (id: string) =>
    update({ deepTopics: chosen.includes(id) ? chosen.filter(x => x !== id) : [...chosen, id] })
  const allIds = topics.map(x => x.t.id)
  const all = allIds.length > 0 && allIds.every(id => chosen.includes(id))

  // Le parcours garde toutes les questions des thèmes cochés (ses adresses /approfondi/N n'en dépendent pas) ; il
  // reprend à la première jamais vue, sinon à la première passée
  const list = orderedQuestions(bank, 'approfondi', state.seed, chosen)
  const left = list.filter(q => open(q.id)).length
  const unseen = list.findIndex(q => !state.answers[q.id])
  const firstOpen = unseen >= 0 ? unseen : list.findIndex(q => open(q.id))
  // Le thème touché d'abord : sa première question jamais vue, sinon sa première passée ; la feuille finit par les
  // questions jamais vues qui le précèdent (app.tsx)
  const own = lead ? list.filter(q => q.topicId === lead.t.id) : []
  const ownFirst = own.find(q => !state.answers[q.id]) ?? own.find(q => open(q.id))
  const from = ownFirst ? list.indexOf(ownFirst) : firstOpen
  const start = () => go(`/approfondi/${(from < 0 ? 0 : from) + 1}`)

  return (
    <div class="screen screen-sheet">
      <FormHeader title="Feuille complémentaire" right={election.shortName} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="q-prompt" tabIndex={-1}>
          Quels thèmes voulez-vous approfondir ?
        </h1>
        {lead ? (
          <p class="notice deepen-touched">
            {deepenTouched(lead.t.label, lead.left, topics.filter(x => x !== lead && chosen.includes(x.t.id)).length, left)}
          </p>
        ) : null}
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
        {topics.length === 0 ? (
          <p class="notice" role="status">
            Vous avez répondu à toutes les questions complémentaires. Vos réponses comptent déjà dans vos résultats.
          </p>
        ) : null}
        <ul class="approaches is-topics" aria-label="Thèmes à approfondir">
          {shown.map(({ t, left: n, done }) => {
            const on = chosen.includes(t.id)
            return (
              <li key={t.id} class={`approach${on ? ' is-liked' : ''}`}>
                <span class="approach-letter count" aria-hidden="true">
                  {n}
                </span>
                <button type="button" class="approach-main" aria-pressed={on} onClick={() => toggle(t.id)}>
                  <span class="approach-text">
                    <span class="topic-label">{t.label}</span>
                    <span class="topic-desc">
                      {n} question{n > 1 ? 's' : ''}
                      {done > 0 ? ` restante${n > 1 ? 's' : ''}` : ''}
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
        {topics.length > 1 ? (
          <p class="link-row">
            <button
              type="button"
              class="btn-text"
              onClick={() => update({ deepTopics: all ? chosen.filter(id => !allIds.includes(id)) : [...new Set([...chosen, ...allIds])] })}
            >
              {all ? 'Tout décocher' : 'Tout cocher'}
            </button>
          </p>
        ) : null}
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Navigation">
        <div class="action-bar-inner">
          {/* Arrivé de « Mon profil politique », on y revient */}
          <a class="btn-text" href={link(fromProfile ? '/profil' : '/resultats')}>
            <Icon name="arrow-left" />
            {fromProfile ? PROFILE_TITLE : 'Résultats'}
          </a>
          <span class="bar-note" aria-live="polite">
            {left ? `${left} question${left > 1 ? 's' : ''}` : ''}
          </span>
          <button type="button" class="btn-primary" disabled={left === 0} onClick={start}>
            {left < list.length ? 'Reprendre' : 'Commencer'}
            <Icon name="arrow-right" />
          </button>
        </div>
      </nav>
    </div>
  )
}
