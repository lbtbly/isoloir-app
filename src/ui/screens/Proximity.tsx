// « Qui porte quoi » : la révélation. Pour chaque question pointée, vos marques à l'encre
// face aux positions imprimées des candidats, avec leurs sources. Une légende visible sépare les deux :
// votre avis à gauche, ce que chaque candidat pense de l'approche à droite (pas s'il pense comme vous).

import { useEffect, useMemo, useState } from 'preact/hooks'
import { ratingOf } from '../../core/answers'
import { seededShuffle } from '../../core/rng'
import type { Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { Answer, Candidate, ElectionPack, Position, Question } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { Initials, InitialsSample, type Mark } from '../components/Initials'
import { RatingMark } from '../components/RatingRuler'
import { formatDate, hostOf } from '../format'
import { isMany } from '../many'
import { link } from '../nav'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
}

const NATURE: Record<Position['nature'], string> = {
  proposition: 'proposition',
  declaration: 'déclaration',
  inference: 'déduction (vote ou texte signé)',
}

function markOf(p: Position | undefined): Mark | null {
  if (!p || p.confidence === 'low') return null
  if (p.weight === 2) return 'main'
  if (p.weight === 1) return 'secondary'
  if (p.rejects) return 'rejects'
  return null
}

export function Proximity({ pack, state }: Props) {
  const { bank, candidates, positions, election } = pack
  // Ordre des candidats mélangé par session : aucun ordre fixe ne favorise personne
  const people = useMemo(() => seededShuffle(candidates, `${state.seed}:people`), [candidates, state.seed])
  const answeredQuestions = bank.questions.filter(q => {
    const a = state.answers[q.id]
    return a && !a.skipped
  })
  const topicLabel = new Map(bank.topics.map(t => [t.id, t.label]))
  const [filter, setFilter] = useState<'answered' | 'all'>('answered')
  // Une question pas encore vue reste anonyme : on ne révèle que les questions vues, répondues ou passées
  const seenQuestions = bank.questions.filter(q => state.answers[q.id])
  const unseenEssential = bank.questions.filter(q => q.tier === 'essentiel' && !state.answers[q.id]).length
  const shown = filter === 'answered' ? answeredQuestions : seenQuestions

  useEffect(() => {
    let focus: string | null
    try {
      focus = sessionStorage.getItem('isoloir-focus')
      sessionStorage.removeItem('isoloir-focus')
    } catch {
      focus = null
    }
    if (focus) {
      document.getElementById(`q-${focus}`)?.scrollIntoView({ block: 'start' })
      document.getElementById(`t-${focus}`)?.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div class="screen screen-proximity">
      <FormHeader title="Qui porte quoi" right={election.shortName} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Qui porte quoi
        </h1>
        <p class="lede">Vos avis, face aux positions des candidats, question par question et sources à l’appui.</p>
        {/* Les positions se lisent ici d'emblée (les pastilles), avant tout panneau de sources : la mention vient
            en tête de page */}
        <AiLabel kind="positions" class="proximity-ai" />

        <RevealLegend />

        {/* Une vingtaine de candidats : la liste passe en colonnes */}
        <dl class={`key${isMany(people.length) ? ' is-many' : ''}`}>
          {people.map(c => (
            <div key={c.id}>
              <dt>
                <Initials candidate={c} />
              </dt>
              <dd>
                <a href={link(`/candidat/${c.id}`)}>{c.name}</a>
              </dd>
            </div>
          ))}
        </dl>

        <div class="segmented" role="group" aria-label="Questions affichées">
          <button type="button" aria-pressed={filter === 'answered'} onClick={() => setFilter('answered')}>
            Mes réponses
          </button>
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Toutes les questions vues
          </button>
        </div>
        {unseenEssential > 0 ? (
          <p class="small">
            Les {unseenEssential} question{unseenEssential > 1 ? 's' : ''} que vous n’avez pas encore vue
            {unseenEssential > 1 ? 's' : ''} rest{unseenEssential > 1 ? 'ent' : 'e'} anonyme{unseenEssential > 1 ? 's' : ''}&nbsp;: qui
            porte quoi ne s’affiche qu’après votre réponse.
          </p>
        ) : null}

        {shown.length === 0 ? <p>Aucune question pointée pour l’instant.</p> : null}

        <div class="reveal-list">
          {bank.topics
            .filter(t => shown.some(q => q.topicId === t.id))
            .map(t => (
              <section key={t.id} class="reveal-topic" aria-labelledby={`topic-${t.id}`}>
                <h2 id={`topic-${t.id}`}>{t.label}</h2>
                {shown
                  .filter(q => q.topicId === t.id)
                  .map(q => (
                    <RevealQuestion
                      key={q.id}
                      question={q}
                      people={people}
                      positions={positions}
                      answer={state.answers[q.id]}
                    />
                  ))}
              </section>
            ))}
        </div>

        {bank.consensus?.length ? (
          <section class="block" aria-labelledby="consensus-title">
            <h2 id="consensus-title">Ce sur quoi tous les candidats s’accordent</h2>
            <p class="small">Ces points ne départagent personne : ils ne sont pas notés.</p>
            <AiLabel kind="texte" more="lien" />
            <ul class="consensus">
              {bank.consensus.map((c, i) => (
                <li key={i}>
                  <span class="consensus-topic">{topicLabel.get(c.topicId)}</span>
                  {c.text}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/resultats')}>
            <Icon name="arrow-left" />
            Résultats
          </a>
          <span />
          <a class="btn-primary" href={link('/approfondir')}>
            Approfondir
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}

function RevealQuestion(props: {
  question: Question
  people: Candidate[]
  positions: ElectionPack['positions']
  answer: Answer | undefined
}) {
  const { question, people, positions, answer } = props
  const [open, setOpen] = useState(false)
  const unknown = people.filter(c => !question.approaches.some(a => markOf(positions[c.id]?.[a.id])))

  return (
    <article class="reveal" id={`q-${question.id}`} aria-labelledby={`t-${question.id}`}>
      <h3 class="reveal-prompt" id={`t-${question.id}`} tabIndex={-1}>
        {question.prompt}
      </h3>
      {/* En-têtes de colonnes, sur grand écran : chaque ligne se lit de gauche à droite */}
      <p class="reveal-head" aria-hidden="true">
        <span>Vous</span>
        <span>Approche</span>
        <span>Candidats</span>
      </p>
      <ul class="reveal-approaches">
        {question.approaches.map(a => {
          const value = answer && !answer.skipped ? ratingOf(answer, a.id) : 0
          const redLine = !!answer?.redLines.includes(a.id)
          const holders = people
            .map(c => ({ c, mark: markOf(positions[c.id]?.[a.id]) }))
            .filter((x): x is { c: Candidate; mark: Mark } => x.mark !== null)
          return (
            <li key={a.id} class={`reveal-row${redLine ? ' is-rejected' : ''}`}>
              <RatingMark value={value} redLine={redLine} lead={'Votre avis\u00a0: '} />
              <span class="reveal-text">{a.text}</span>
              <span class="reveal-holders">
                <span class="sr-only">Candidats&nbsp;: </span>
                {holders.length ? (
                  holders.map(h => <Initials key={h.c.id} candidate={h.c} mark={h.mark} />)
                ) : (
                  <span class="nobody">{a.external ? 'Aucun des candidats' : 'Personne'}</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
      {unknown.length ? (
        <p class="reveal-unknown">
          <span>Position non trouvée à ce jour&nbsp;:</span>
          {unknown.map(c => (
            <Initials key={c.id} candidate={c} mark="unknown" withName />
          ))}
        </p>
      ) : null}
      <button type="button" class="btn-text sources-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Masquer les positions et sources' : 'Voir les positions et sources'}
      </button>
      {open ? (
        <div class="sources">
          <AiLabel kind="resumes" more="lien" class="sources-ai" />
          <dl class="sources-list">
            {people.map(c => {
              const entries = question.approaches
                .map(a => ({ a, p: positions[c.id]?.[a.id] }))
                .filter((x): x is { a: Question['approaches'][number]; p: Position } => !!x.p)
              if (!entries.length) return null
              return (
                <div key={c.id} class="source-person">
                  <dt>{c.name}</dt>
                  {entries.map(({ a, p }) => (
                    <dd key={a.id}>
                      <p class="source-approach">
                        <span class="source-mark">{p.weight === 2 ? 'Approche principale' : p.weight === 1 ? 'Approche compatible' : 'Rejette'}</span>{' '}
                        <q>{a.text}</q>
                      </p>
                      <p>
                        {p.summary}{' '}
                        <span class="source-kind">
                          ({NATURE[p.nature]}
                          {p.confidence === 'low' ? ', position probable, non comptée' : p.confidence === 'medium' ? ', formulation moins nette' : ''})
                        </span>
                      </p>
                      <ul class="source-links">
                        {p.sources.map(s => (
                          <li key={s.url}>
                            <ExternalLink href={s.url}>{s.title}</ExternalLink>{' '}
                            <span class="source-meta">
                              {s.publisher ?? hostOf(s.url)}
                              {s.date ? `, ${formatDate(s.date)}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  ))}
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}
    </article>
  )
}

/** Légende visible (sans infobulle) : votre avis d'un côté, ce qu'en pensent les candidats de l'autre */
function RevealLegend() {
  return (
    <section class="reveal-legend" aria-labelledby="legend-title">
      <h2 id="legend-title" class="sr-only">
        Comment lire chaque ligne
      </h2>
      <div class="legend-col">
        <h3 class="legend-head">Votre avis</h3>
        <p class="legend-desc">À gauche de chaque approche, le repère de votre feuille.</p>
        <ul class="legend-items is-you">
          <li>
            <RatingMark value={1} redLine={false} />
          </li>
          <li>
            <RatingMark value={0} redLine={false} />
          </li>
          <li>
            <RatingMark value={-1} redLine={false} />
          </li>
          <li>
            <RatingMark value={-1} redLine />
          </li>
        </ul>
      </div>
      <div class="legend-col">
        <h3 class="legend-head">Ce qu’en pensent les candidats</h3>
        <p class="legend-desc">Une pastille par candidat, avec ses initiales.</p>
        <ul class="legend-items is-them">
          <li>
            <InitialsSample mark="main" />
            Approche principale
          </li>
          <li>
            <InitialsSample mark="secondary" />
            Approche compatible
          </li>
          <li>
            <InitialsSample mark="rejects" />
            Rejette l’approche
          </li>
          <li>
            <InitialsSample mark="unknown" />
            Position inconnue
          </li>
        </ul>
      </div>
      <p class="legend-warning">
        <Icon name="info" />
        <span>
          Les pastilles disent ce que chaque candidat pense de l’approche, pas s’il pense comme vous. Vert&nbsp;: pour
          l’approche&nbsp;; orangé&nbsp;: contre, de votre côté comme du leur.
        </span>
      </p>
    </section>
  )
}
