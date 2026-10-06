// « Les candidats » : qui se présente, leur parcours, leur site de campagne, puis chacune de leurs
// positions, thème par thème, avec ses sources. Objectif de transparence : tout ce que le calcul
// utilise est consultable ici. Le questionnaire, lui, reste anonyme.
// Même grammaire que l'accueil : un héros, puis des fiches bristol en colonnes, toute la largeur.

import { useMemo, useRef, useState } from 'preact/hooks'
import { ratingOf } from '../../core/answers'
import { seededShuffle } from '../../core/rng'
import type { SessionState } from '../../core/storage'
import type { Answers, Candidate, ElectionPack, Position, Question, Source, Topic, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { Initials, type Mark } from '../components/Initials'
import { Portrait } from '../components/Portrait'
import { RatingMark } from '../components/RatingRuler'
import { formatDate, hostOf } from '../format'
import { useMasonry } from '../useMasonry'
import { useStickyFilters } from '../useStickyFilters'

const NATURE: Record<Position['nature'], string> = {
  proposition: 'proposition',
  declaration: 'déclaration',
  inference: 'déduction (vote ou texte signé)',
}

const markOf = (p: Position): Mark => (p.weight === 2 ? 'main' : p.weight === 1 ? 'secondary' : 'rejects')
const STANCE: Record<Mark, string> = { main: 'Approche principale', secondary: 'Approche compatible', rejects: 'Rejette' }

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul class="source-links">
      {sources.map(s => (
        <li key={s.url}>
          <ExternalLink href={s.url}>{s.title}</ExternalLink>{' '}
          <span class="source-meta">
            {s.publisher ?? hostOf(s.url)}
            {s.date ? `, ${formatDate(s.date)}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}

interface IndexProps {
  pack: ElectionPack
  state: SessionState
}

export function CandidatesIndex({ pack, state }: IndexProps) {
  const { election, candidates, positions } = pack
  // Ordre tiré au hasard par personne, comme partout où les candidats ne sont pas classés
  const people = useMemo(() => seededShuffle(candidates, `${state.seed}:people`), [candidates, state.seed])
  const counts = useMemo(
    () => new Map(candidates.map(c => [c.id, Object.keys(positions[c.id] ?? {}).length])),
    [candidates, positions],
  )
  return (
    <div class="screen screen-wide">
      <FormHeader title="Les candidats" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class="wide-hero">
          <h1 class="display" tabIndex={-1}>
            Les candidats
          </h1>
          <div>
            <p class="lede">
              {candidates.length} candidats se présentent à la {election.name.replace(/^Primaire/, 'primaire')}. Pour
              chacun : son parcours, son site de campagne, et chacune de ses positions avec ses sources.
            </p>
            <p class="small">
              Pour un résultat sans a priori, répondez d’abord au questionnaire : les approches y sont présentées sans
              nom. Les candidats sont présentés ici dans un ordre tiré au hasard.
            </p>
          </div>
        </div>
        <ul class="people-panels" aria-label="Candidats, dans un ordre tiré au hasard">
          {people.map(c => (
            <li key={c.id} class="people-panel">
              <a class="people-panel-link" href={`#/candidat/${c.id}`}>
                <Portrait candidate={c} size="strip" />
                <span class="people-panel-name">{c.name}</span>
                <span class="people-panel-role">{c.role}</span>
                <span class="people-panel-meta">{c.affiliation}</span>
                <span class="people-panel-count">
                  <span class="count-figure">{counts.get(c.id)}</span> positions sourcées
                </span>
                <span class="people-panel-go">
                  Voir sa fiche
                  <Icon name="arrow-right" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href="#/">
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </a>
          <span />
          <a class="btn-primary" href="#/feuille/1">
            Commencer la feuille
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}

interface PageProps {
  pack: ElectionPack
  candidateId: string
  state: SessionState
}

/** Une fiche : un thème, ses questions où la position est connue, puis celles où elle ne l'est pas */
interface Card {
  topic: Topic
  group: TopicGroup
  /** Couleur du bristol : elle suit l'ordre du paquet et ne dit rien de la famille */
  tint: number
  known: Question[]
  unknown: Question[]
}

const TINTS = 4

export function CandidatePage({ pack, candidateId, state }: PageProps) {
  const { election, candidates, bank, positions } = pack
  const c = candidates.find(x => x.id === candidateId)
  const table = useMemo(() => (c ? (positions[c.id] ?? {}) : {}), [c, positions])
  const groups = useMemo(
    () => pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
    [pack.topicGroups, bank.topics],
  )
  // Une fiche par thème, rangées par famille : la numérotation suit cet ordre
  const cards = useMemo(() => {
    const out: Card[] = []
    groups.forEach(group => {
      for (const id of group.topicIds) {
        const topic = bank.topics.find(t => t.id === id)
        const qs = bank.questions.filter(q => q.topicId === id)
        if (!topic || !qs.length) continue
        const has = (q: Question) => q.approaches.some(a => table[a.id])
        out.push({ topic, group, tint: out.length % TINTS, known: qs.filter(has), unknown: qs.filter(q => !has(q)) })
      }
    })
    return out
  }, [groups, bank, table])

  const [filter, setFilter] = useState<string | null>(null)
  const [mine, setMine] = useState(false)
  const shown = filter ? cards.filter(x => x.group.id === filter) : cards
  // Le bouton « Mes réponses » n'apparaît que si des réponses sont enregistrées sur cet appareil
  const hasAnswers = cards.some(x => x.known.some(q => state.answers[q.id]))
  const grid = useRef<HTMLDivElement>(null)
  const section = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  // Barre collante : sa hauteur pour le focus, et si elle colle encore (écran court face au texte)
  const loose = useStickyFilters(bar, c?.id)
  // Nouvelle répartition quand la liste change ou que vos réponses s'affichent (les hauteurs changent toutes)
  useMasonry(grid, `${filter ?? '*'}:${candidateId}:${mine}`)

  if (!c) {
    return (
      <div class="screen screen-wide">
        <FormHeader title="Les candidats" right={election.shortName} />
        <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
          <h1 class="display is-medium" tabIndex={-1}>
            Candidat introuvable
          </h1>
          <p>
            <a href="#/candidats">Voir les candidats</a>
          </p>
        </main>
        <SiteFooter />
      </div>
    )
  }
  const total = Object.keys(table).length
  const knownQuestions = cards.reduce((n, x) => n + x.known.length, 0)
  const themes = cards.filter(x => x.known.length).length
  /** Change de famille ; si la barre colle déjà en haut, on remonte au début des fiches */
  const pick = (id: string | null) => {
    setFilter(id)
    const top = section.current?.getBoundingClientRect().top ?? 0
    if (top < 0)
      section.current?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
  }
  const current = filter ? groups.find(g => g.id === filter) : null

  return (
    <div class="screen screen-wide">
      <FormHeader title="Les candidats" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class="fiche-hero">
          <div class="fiche-id">
            <Portrait candidate={c} size="id" />
            <div class="fiche-name">
              <h1 class="display" tabIndex={-1}>
                {c.name}
              </h1>
              <p class="fiche-role">{c.role}</p>
              <p class="fiche-affiliation">{c.affiliation}</p>
              <p class="fiche-links">
                {c.campaignUrl ? <ExternalLink href={c.campaignUrl}>Site de campagne</ExternalLink> : null}
                {c.website ? <ExternalLink href={c.website}>Page sur le site de la primaire</ExternalLink> : null}
              </p>
            </div>
          </div>
          {c.bio?.length ? (
            <section class="fiche-bio on-copy" aria-labelledby="bio-title">
              <h2 id="bio-title">Parcours</h2>
              {/* En tête du parcours, pas à son pied : la mention précède le texte qu'elle signale */}
              <AiLabel kind="parcours" more="lien" class="bio-ai" />
              <ol class="timeline">
                {c.bio.map((b, i) => (
                  <li key={b.text}>
                    <span class="timeline-when">{i > 0 && c.bio![i - 1]!.when === b.when ? '' : b.when}</span>
                    <span class="timeline-text">
                      {b.text}{' '}
                      <span class="source-meta">
                        <ExternalLink href={b.source.url}>{b.source.publisher ?? hostOf(b.source.url)}</ExternalLink>
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
        {c.photo ? (
          <p class="small credit">
            Photo&nbsp;: {c.photo.credit} (
            {c.photo.license ? (
              <>
                <ExternalLink href={c.photo.license.url}>licence</ExternalLink>,{' '}
              </>
            ) : null}
            <ExternalLink href={c.photo.rightsUrl}>source</ExternalLink>,{' '}
            <a href="#/mentions-legales">crédits</a>)
          </p>
        ) : null}

        <section class="fiche-positions" aria-labelledby="positions-title" ref={section}>
          <div class="positions-head">
            <h2 id="positions-title" class="section-title">
              Ses positions
            </h2>
            <p class="positions-count">
              <span class="count-figure">{total}</span> positions sourcées sur {knownQuestions} questions, dans {themes}{' '}
              thèmes. Ce sont exactement celles qu’utilise le calcul ; une position douteuse est retirée plutôt que
              supposée.
            </p>
            <AiLabel kind="positions" class="positions-ai" />
          </div>
          {/* Barre collante : les familles de thèmes, et vos réponses à côté des siennes. Sur téléphone, un menu
              déroulant remplace les pastilles. */}
          <div class={`fiche-filters${loose ? ' is-loose' : ''}`} ref={bar}>
            <label class="filter-select">
              <span class="sr-only">Filtrer les fiches par famille de thèmes</span>
              <select value={filter ?? ''} onChange={e => pick(e.currentTarget.value || null)}>
                <option value="">Tout ({cards.length} fiches)</option>
                {groups.map(g => {
                  const n = cards.filter(x => x.group.id === g.id).length
                  return n ? (
                    <option key={g.id} value={g.id}>
                      {g.label} ({n})
                    </option>
                  ) : null
                })}
              </select>
              <Icon name="chevron" class="select-chevron" />
            </label>
            <ul class="filter-chips" aria-label="Filtrer les fiches par famille de thèmes">
              <li>
                <button type="button" class="filter-chip is-all" aria-pressed={!filter} onClick={() => pick(null)}>
                  Tout
                  <span class="chip-n">
                    <span class="sr-only">, </span>
                    {cards.length}
                    <span class="sr-only"> fiches</span>
                  </span>
                </button>
              </li>
              {groups.map(g => {
                const n = cards.filter(x => x.group.id === g.id).length
                return n ? (
                  <li key={g.id}>
                    <button
                      type="button"
                      class="filter-chip"
                      aria-pressed={filter === g.id}
                      onClick={() => pick(filter === g.id ? null : g.id)}
                    >
                      {g.label}
                      <span class="chip-n">
                        <span class="sr-only">, </span>
                        {n}
                        <span class="sr-only"> fiche{n > 1 ? 's' : ''}</span>
                      </span>
                    </button>
                  </li>
                ) : null
              })}
            </ul>
            {hasAnswers ? (
              <button type="button" role="switch" aria-checked={mine} class="mine-toggle" onClick={() => setMine(!mine)}>
                <span class="switch-track" aria-hidden="true">
                  <span class="switch-knob" />
                </span>
                Mes réponses
              </button>
            ) : null}
          </div>
          <p class="sr-only" role="status">
            {current ? `${shown.length} fiche${shown.length > 1 ? 's' : ''} : ${current.label}` : ''}
          </p>
          <div class="bristol-grid" ref={grid}>
            {shown.map(card => (
              <BristolCard key={card.topic.id} card={card} candidate={c} table={table} answers={mine ? state.answers : null} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href="#/candidats">
            <Icon name="arrow-left" />
            <span class="btn-label">Les candidats</span>
          </a>
          <span />
          <a class="btn-primary" href="#/feuille/1">
            Commencer la feuille
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}

/** Une fiche bristol : un thème, ses positions, et le talon des questions encore sans réponse connue */
function BristolCard({
  card,
  candidate,
  table,
  answers,
}: {
  card: Card
  candidate: Candidate
  table: Record<string, Position>
  /** Vos réponses, quand vous choisissez de les afficher */
  answers: Answers | null
}) {
  const { topic, group, tint, known, unknown } = card
  return (
    <section class={`bristol tint-${tint}`} id={`ct-${topic.id}`} aria-labelledby={`ct-h-${topic.id}`}>
      <header class="bristol-head">
        <h3 id={`ct-h-${topic.id}`} class="bristol-title">
          {topic.label}
          <span class="sr-only"> ({group.label})</span>
        </h3>
      </header>
      {known.map(q => (
        <PositionRow key={q.id} candidate={candidate} question={q} table={table} answers={answers} />
      ))}
      {unknown.length ? (
        <div class="bristol-stub">
          <Icon name="scissors" class="stub-scissors" />
          <p class="stub-head">
            À compléter : position non trouvée à ce jour sur {unknown.length}
            {`\u00a0question${unknown.length > 1 ? 's' : ''}`}
          </p>
          <ul class="stub-list">
            {unknown.map(q => (
              <li key={q.id}>{q.prompt}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

/** Une question : l'approche défendue en clair, marquée par les initiales ; le détail et les sources dans un encart */
function PositionRow({
  candidate,
  question,
  table,
  answers,
}: {
  candidate: Candidate
  question: Question
  table: Record<string, Position>
  answers: Answers | null
}) {
  const entries = question.approaches
    .map(a => ({ a, p: table[a.id] }))
    .filter((x): x is { a: Question['approaches'][number]; p: Position } => !!x.p)
    // L'approche principale d'abord, puis la compatible, puis les rejets
    .sort((x, y) => ['main', 'secondary', 'rejects'].indexOf(markOf(x.p)) - ['main', 'secondary', 'rejects'].indexOf(markOf(y.p)))
  const yours = answers ? answers[question.id] : undefined
  const sourceCount = new Set(entries.flatMap(({ p }) => p.sources.map(s => s.url))).size
  return (
    <article class="position-row">
      <h4 class="position-q">{question.prompt}</h4>
      {answers && (!yours || yours.skipped) ? (
        <p class="you-none">{yours ? 'Vous avez passé cette question.' : 'Vous n’avez pas encore répondu à cette question.'}</p>
      ) : null}
      <ul class="position-stances">
        {entries.map(({ a, p }) => (
          <li key={a.id} class={`stance is-${markOf(p)}`}>
            <Initials candidate={candidate} mark={markOf(p)} />
            <span class="stance-text">
              <span class="stance-label">{STANCE[markOf(p)]}</span> {a.text}
              {p.confidence === 'low' ? <span class="stance-note"> (position probable, non comptée)</span> : null}
              {yours && !yours.skipped ? (
                <span class="stance-you">
                  <span class="you-label">Vous</span>
                  <RatingMark value={ratingOf(yours, a.id)} redLine={yours.redLines.includes(a.id)} />
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <details class="card-sources">
        <summary>
          <Icon name="chevron" class="disclosure" />
          <span class="summary-label">
            Détail et {sourceCount > 1 ? `${sourceCount} sources` : 'source'}
          </span>
        </summary>
        <div class="encart">
          {/* En tête de l'encart : les résumés qui suivent sont rédigés par IA */}
          <AiLabel kind="resumes" more="lien" class="encart-ai" />
          {entries.map(({ a, p }) => (
            <div key={a.id} class="position-detail">
              <p class="detail-kicker">{STANCE[markOf(p)]}</p>
              <p>
                {p.summary}{' '}
                <span class="source-kind">
                  ({NATURE[p.nature]}
                  {p.confidence === 'medium' ? ', formulation moins nette' : ''})
                </span>
              </p>
              <SourceList sources={p.sources} />
            </div>
          ))}
        </div>
      </details>
    </article>
  )
}
