import type { ComponentChildren } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { go } from '../../app'
import { affinityBand, AFFINITY_BANDS, bandRange } from '../../core/affinity'
import { hasOpinion } from '../../core/answers'
import { buildExport, downloadBlob, exportFileName } from '../../core/exportData'
import { currentAnswers } from '../../core/revisions'
import {
  CLOSE_GAP,
  computeResults,
  displayScore,
  methodPeers,
  POINTS_PER_STROKE,
  strokesFor,
  type AgreementTally,
  type CandidateResult,
  type Results as ResultsData,
} from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { Candidate, ElectionPack, Question, TopicId, TopicWeights } from '../../core/types'
import { ConfirmErase } from '../components/ConfirmErase'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { Portrait } from '../components/Portrait'
import { Tally } from '../components/Tally'
import { percent } from '../format'
import { useOnline } from '../useOnline'
import { MAX_PRIORITIES } from './Priorities'

interface Props {
  pack: ElectionPack
  state: SessionState
  results: ResultsData
  update: (patch: Partial<SessionState>) => void
  eraseAll: () => void
  essential: Question[]
  /** Questions changées sur le fond depuis la réponse, à revoir */
  stale: Question[]
  /** false si le navigateur refuse d'enregistrer la progression */
  saved: boolean
}

/** Au-delà de ce nombre de lignes rouges, on rappelle l'effet d'exclusion */
const MANY_RED_LINES = 5

type Snapshot = SessionState['lastSeenRanking']

/** Dernier geste sur une étoile, pour l'annoncer à côté de l'endroit où il a eu lieu */
type PriorityNote =
  | { where: 'top' | 'grid'; refused: true; topicId: TopicId }
  | { where: 'top' | 'grid'; refused?: false; topicId: TopicId; on: boolean; leaders: string[] }

const snapshot = (results: ResultsData): NonNullable<Snapshot> =>
  results.ranking.map(r => ({ candidateId: r.candidateId, score: displayScore(r.score) }))

/** « A », « A et B », « A, B et C » */
const joinNames = (names: string[]) =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} et ${names.at(-1)}`

/** Mène à une partie de la page sans changer d'écran (le routage passe par le fragment « #/… ») */
const jumpTo = (id: string) => (e: Event) => {
  e.preventDefault()
  const target = document.getElementById(id)
  if (!target) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' })
  target.focus({ preventScroll: true })
}

export function Results({ pack, state, results: allResults, update, eraseAll, essential, stale, saved }: Props) {
  const online = useOnline()
  const { election, candidates, bank } = pack
  const byId = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const approachText = useMemo(() => {
    const m = new Map<string, string>()
    for (const q of bank.questions) for (const a of q.approaches) m.set(a.id, a.text)
    return m
  }, [bank])
  const questionById = useMemo(() => new Map(bank.questions.map(q => [q.id, q])), [bank])

  const [finalistsOnly, setFinalistsOnly] = useState(false)
  // Classement vu à la visite précédente : les changements restent marqués jusqu'à être vus
  const [previous] = useState(state.lastSeenRanking)
  const list = useRef<HTMLOListElement>(null)

  // Entre finalistes, tout est recalculé : rangs, écart, stabilité, « ce qui sépare »
  const finalistResults = useMemo(
    () =>
      finalistsOnly && election.finalists
        ? computeResults(pack, currentAnswers(pack, state.answers), state.weights, state.seed, election.finalists)
        : null,
    [finalistsOnly, election.finalists, pack, state.answers, state.weights, state.seed],
  )
  const results = finalistResults ?? allResults
  const ranking = results.ranking
  const compatible = ranking.filter(r => r.compatible || results.allIncompatible)
  const incompatible = results.allIncompatible ? [] : ranking.filter(r => !r.compatible)
  const [first, second] = ranking

  // Mémorise le classement affiché pour signaler les changements la prochaine fois, y compris après un
  // changement de priorités fait sur cette page
  useEffect(() => {
    const now = snapshot(allResults)
    const seen = state.lastSeenRanking
    const same =
      seen && seen.length === now.length && seen.every((p, i) => p.candidateId === now[i]?.candidateId && p.score === now[i]?.score)
    if (!same && allResults.answered > 0) update({ lastSeenRanking: now })
  }, [allResults])

  useLayoutEffect(() => {
    const results = allResults
    // Les lignes qui ont changé de rang glissent depuis leur ancienne place
    if (!previous || !list.current) return
    const rows = Array.from(list.current.querySelectorAll<HTMLElement>('[data-candidate]'))
    const tops = new Map(rows.map(r => [r.dataset.candidate!, r.offsetTop]))
    const prevOrder = previous.map(p => p.candidateId)
    for (const row of rows) {
      const prevIndex = prevOrder.indexOf(row.dataset.candidate!)
      const prevRow = rows.find(r => r.dataset.candidate === results.ranking[prevIndex]?.candidateId)
      if (prevIndex < 0 || !prevRow) continue
      const delta = (tops.get(prevRow.dataset.candidate!) ?? 0) - row.offsetTop
      if (delta === 0) continue
      row.animate(
        [{ transform: `translateY(${delta}px)` }, { transform: 'translateY(0)' }],
        { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      )
    }
    // volontairement exécuté une seule fois, au premier affichage
  }, [])

  // Repère des écarts affichés : le classement de la visite précédente, puis celui d'avant le dernier
  // changement de priorités fait ici
  const [baseline, setBaseline] = useState<{ ranking: Snapshot; since: 'visit' | 'weights' }>({ ranking: previous, since: 'visit' })
  const change = (r: CandidateResult) => {
    if (!baseline.ranking) return null
    const p = baseline.ranking.find(x => x.candidateId === r.candidateId)
    const now = displayScore(r.score)
    if (!p || p.score === null || now === null || p.score === now) return null
    const d = now - p.score
    const since = baseline.since === 'visit' ? 'depuis votre dernier passage' : 'avec ce changement de priorités'
    return `${d > 0 ? '+' : '−'}${Math.abs(d)} pt${Math.abs(d) > 1 ? 's' : ''} ${since}`
  }

  // Priorités : seuls les thèmes où vous avez donné un avis peuvent peser, comme sur la page des priorités
  const answeredTopics = new Set(bank.questions.filter(q => hasOpinion(state.answers[q.id])).map(q => q.topicId))
  const chosen = bank.topics.filter(t => answeredTopics.has(t.id) && state.weights[t.id] === 2).map(t => t.id)
  const full = chosen.length >= MAX_PRIORITIES
  // Thèmes de la ligne « Vos priorités » : ceux choisis, plus ceux retirés depuis cette ligne, qui y restent
  // (étoile vide) pour garder leur place et le focus jusqu'au prochain passage
  const [shownTopics, setShownTopics] = useState<TopicId[]>(chosen)
  const [note, setNote] = useState<PriorityNote | null>(null)
  const leaderIds = (r: ResultsData) => {
    const top = r.ranking[0]
    return top && top.score !== null ? r.ranking.filter(x => x.rank === top.rank).map(x => x.candidateId) : []
  }

  const togglePriority = (topicId: TopicId, where: 'top' | 'grid') => {
    const on = state.weights[topicId] === 2
    if (!on && full) {
      setNote({ where, refused: true, topicId })
      return
    }
    const weights: TopicWeights = { ...state.weights }
    if (on) delete weights[topicId]
    else weights[topicId] = 2
    setBaseline({ ranking: snapshot(results), since: 'weights' })
    setNote({ where, topicId, on: !on, leaders: leaderIds(results) })
    // Une pastille retirée d'en haut y reste (le focus aussi) ; depuis la grille, la ligne suit simplement
    if (!on && !shownTopics.includes(topicId)) setShownTopics([...shownTopics, topicId])
    if (on && where === 'grid') setShownTopics(shownTopics.filter(id => id !== topicId))
    update({ weights })
  }

  // Ce que l'étoile a changé, dit en clair : le poids du thème, puis qui est en tête
  const noteText = (() => {
    if (!note) return ''
    if (note.refused) return `Déjà ${MAX_PRIORITIES}\u00a0thèmes prioritaires\u00a0: retirez une étoile pour en choisir un autre.`
    const label = bank.topics.find(t => t.id === note.topicId)?.label ?? ''
    const weight = `Le thème «\u00a0${label}\u00a0» ${note.on ? 'compte double' : 'ne compte plus double'}.`
    const now = leaderIds(results)
    if (!now.length) return weight
    const kept = now.length === note.leaders.length && now.every(id => note.leaders.includes(id))
    const verb = kept ? (now.length > 1 ? 'restent' : 'reste') : now.length > 1 ? 'passent' : 'passe'
    return `${weight} ${joinNames(now.map(id => byId.get(id)?.name ?? ''))} ${verb} en tête${now.length > 1 ? ', ex aequo' : ''}.`
  })()

  const downloadDouble = () => {
    const file = buildExport(pack, state, results)
    downloadBlob(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }), exportFileName(pack))
  }
  const rawShown = (r: CandidateResult) =>
    r.rawScore !== null && r.score !== null && Math.abs(Math.round(r.rawScore) - Math.round(r.score)) >= 1

  const deepCount = bank.questions.filter(q => q.tier === 'approfondi').length
  const answeredDeep = bank.questions.filter(q => q.tier === 'approfondi' && state.answers[q.id] && !state.answers[q.id]!.skipped).length
  const shown = bank.topics.filter(t => shownTopics.includes(t.id) && answeredTopics.has(t.id))
  // Première tendance : tant que des questions du questionnaire rapide n'ont pas été vues, le résultat est
  // provisoire. Il ne doit pas ressembler à un verdict : ni affiche du plus proche, ni pourcentage, ni détail
  // par thème ; l'appel à continuer passe devant.
  const unseen = essential.filter(q => !state.answers[q.id])
  const provisional = unseen.length > 0
  const refineHref = `/feuille/${essential.indexOf(unseen[0]!) + 1}`
  const remaining = `${unseen.length}\u00a0question${unseen.length > 1 ? 's' : ''}`

  const row = (r: CandidateResult, i: number) => {
    const c = byId.get(r.candidateId)!
    const moved = change(r)
    const band = affinityBand(r.score)
    const touched = r.dealbreakers.length
    return (
      <li key={r.candidateId} class={`board-row${r.compatible ? '' : ' is-flagged'}`} data-candidate={r.candidateId}>
        <span class="board-rank">
          <span aria-hidden="true">{r.rank}</span>
          <span class="sr-only">
            Rang {r.rank}
            {r.tied ? ', ex aequo' : ''},
          </span>
          {r.tied ? (
            <span class="pv-tie" aria-hidden="true">
              ex æquo
            </span>
          ) : null}
        </span>
        <Portrait candidate={c} size="row" decorative />
        <div class="board-who">
          <a class="board-name" href={`#/candidat/${c.id}`}>
            {c.name}
          </a>
          <span class="board-party">{c.affiliation}</span>
        </div>
        <div class="board-tally">
          <Tally
            count={strokesFor(r.score)}
            maxGroups={Infinity}
            drawAll
            delay={i * 320 + 150}
            muted={!r.compatible && !results.allIncompatible}
            label={
              provisional
                ? `${strokesFor(r.score)} bâtons de ${POINTS_PER_STROKE} points`
                : `${displayScore(r.score) ?? 0}\u00a0% d’affinité, soit ${strokesFor(r.score)} bâtons de ${POINTS_PER_STROKE} points`
            }
          />
        </div>
        <div class="board-score">
          {provisional ? null : (
            <span class={`board-pct${band ? ` aff-${band.key}` : ''}`}>
              {percent(r.score)}
              {r.score !== null ? <span class="pv-unit">%</span> : null}
            </span>
          )}
          {band ? <span class={`board-band aff-${band.key}`}>{band.label}</span> : null}
        </div>
        <p class="board-meta">
          {r.answered > 0 ? `Connu sur ${r.known} de vos ${r.answered} réponses` : 'Aucune réponse notée'}
          {r.partialData ? ' · données partielles' : ''}
          {!provisional && rawShown(r) ? ` · ${Math.round(r.rawScore!)}\u00a0% avant lissage` : ''}
          {!provisional && moved ? <span class="pv-moved"> · {moved}</span> : null}
        </p>
        {touched ? (
          <details class="board-flags">
            <summary>
              <Icon name="cross" class="flag-mark" />
              {r.dealbreakers.some(d => d.level === 'touche')
                ? `Franchit ${touched > 1 ? `${touched} de vos lignes rouges` : 'une de vos lignes rouges'}`
                : `Pourrait franchir ${touched > 1 ? `${touched} de vos lignes rouges` : 'une de vos lignes rouges'}`}
            </summary>
            <ul>
              {r.dealbreakers.map(d => (
                <li key={d.approachId}>
                  {d.level === 'touche' ? '' : 'Peut-être : '}
                  <q>{approachText.get(d.approachId)}</q>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </li>
    )
  }

  if (results.answered === 0) {
    return (
      <div class="screen">
        <FormHeader title="Résultats" right={election.shortName} />
        <main class="sheet has-margin" id="contenu" tabIndex={-1}>
          <h1 class="display is-medium" tabIndex={-1}>
            Rien à dépouiller pour l’instant.
          </h1>
          <p class="lede">
            Le dépouillement compte vos avis. Placez au moins un repère sur une approche pour obtenir un résultat.
          </p>
          <p>
            <a class="btn-primary" href="#/feuille/1">
              Remplir la feuille
              <Icon name="arrow-right" />
            </a>
          </p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const topicRows = bank.topics.filter(t => ranking.some(r => r.topicScores[t.id] !== null && r.topicScores[t.id] !== undefined))
  const notes = [
    results.allIncompatible ? <>Aucun candidat ne respecte toutes vos lignes rouges : ils sont classés du moins au plus concerné.</> : null,
    results.close && first && second ? (
      provisional ? (
        <>
          {byId.get(first.candidateId)?.name} et {byId.get(second.candidateId)?.name} sont au coude-à-coude&nbsp;: les
          questions suivantes peuvent les départager.
        </>
      ) : (
        <>
          {byId.get(first.candidateId)?.name} et {byId.get(second.candidateId)?.name} sont à moins de {CLOSE_GAP} points : l’écart
          n’est pas significatif. <a href="#/approfondir">Approfondir pour les départager</a>
        </>
      )
    ) : null,
    // En tendance, la suite du questionnaire peut tout changer : pas de détail de méthode
    !results.stable && !provisional ? (
      <>
        Résultat sensible à la façon de compter&nbsp;:{' '}
        <a href="#agree-title" onClick={jumpTo('agree-title')}>
          voir qui passe devant en ne gardant que les approches principales
        </a>
      </>
    ) : null,
    results.redLineCount > MANY_RED_LINES ? (
      <>
        {results.redLineCount} lignes rouges : le classement dépend surtout de ces refus.
      </>
    ) : null,
  ].filter(Boolean)

  // Les suites, en panneaux : la première est l'action principale de la barre du bas. Tant que le résultat
  // est provisoire, seul « Qui porte quoi » est proposé : l'action principale est de continuer.
  const whoHolds = {
    href: '#/proximite',
    icon: 'list',
    title: 'Qui porte quoi',
    desc: provisional
      ? `Vos ${essential.length - unseen.length} premières questions, face aux positions des candidats, sources à l’appui.`
      : 'Vos avis face aux positions des candidats, question par question, sources à l’appui.',
  }
  const next = [
    whoHolds,
    { href: '#/partager', icon: 'share', title: 'Partager l’image', desc: 'Votre affiche en JPG, fabriquée sur cet appareil.' },
    {
      href: '#/approfondir',
      icon: 'deepen',
      title: 'Approfondir',
      desc:
        answeredDeep > 0
          ? `${answeredDeep} question${answeredDeep > 1 ? 's' : ''} de plus déjà pointée${answeredDeep > 1 ? 's' : ''} : d’autres thèmes à creuser.`
          : `Jusqu’à ${deepCount} questions de plus, par thème.`,
    },
    { href: '#/candidats', icon: 'arrow-right', title: 'Les candidats', desc: 'Parcours, site de campagne et toutes leurs positions.' },
  ]

  return (
    <div class="screen screen-wide screen-results">
      <FormHeader title="Résultats" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class={`results-hero${provisional ? ' is-trend' : ''}`}>
          <div class="results-intro">
            <div class="results-head">
              <h1 class="display" tabIndex={-1}>
                {provisional ? 'Une première tendance' : 'Votre dépouillement'}
              </h1>
              {provisional ? (
                <span class="stamp is-provisional">
                  <span class="stamp-label">Résultat</span>
                  <span class="stamp-date">provisoire</span>
                </span>
              ) : null}
            </div>
            {provisional ? null : (
              <p class="lede">
                Sur {results.answered} réponse{results.answered > 1 ? 's' : ''}.
              </p>
            )}
            {provisional ? null : (
              <div class="prio" role="group" aria-labelledby="prio-title">
                <p class="prio-head">
                  <span id="prio-title" class="prio-title">
                    Vos priorités
                  </span>
                  <span class="prio-none">
                    {chosen.length ? 'comptent double dans le calcul' : 'aucune\u00a0: tous les thèmes comptent autant.'}
                  </span>
                </p>
                {shown.length ? (
                  <ul class="prio-chips">
                    {shown.map(t => (
                      <li key={t.id}>
                        <StarToggle
                          class="star-chip"
                          on={state.weights[t.id] === 2}
                          label={t.label}
                          blocked={state.weights[t.id] !== 2 && full}
                          onClick={() => togglePriority(t.id, 'top')}
                        >
                          {t.label}
                        </StarToggle>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p class="prio-links">
                  <a href="#topics-title" onClick={jumpTo('topics-title')}>
                    {chosen.length ? 'Changer' : 'Choisir'} dans «&nbsp;Par thème&nbsp;»
                  </a>
                  <a href="#/priorites">Tous les thèmes</a>
                </p>
                <p class="prio-status" role="status">
                  {note?.where === 'top' ? noteText : ''}
                </p>
              </div>
            )}
            {stale.length > 0 ? (
              <p class="notice" role="status">
                {stale.length} question{stale.length > 1 ? 's ont' : ' a'} changé depuis vos réponses : le résultat est
                calculé sans {stale.length > 1 ? 'elles' : 'elle'} en attendant.{' '}
                <a href="#/revision">{stale.length > 1 ? 'Les revoir' : 'La revoir'}</a>
              </p>
            ) : null}
            {state.dataUpdatedFrom ? (
              <p class="notice" role="status">
                Les données ont été mises à jour depuis votre dernier passage (
                {election.changelog.at(-1)?.text ?? `version ${election.dataVersion}`}). Votre résultat a pu changer.{' '}
                <button type="button" class="btn-text" onClick={() => update({ dataUpdatedFrom: null })}>
                  Compris
                </button>
              </p>
            ) : null}
            {!saved ? (
              <p class="notice" role="status">
                Ce navigateur n’enregistre pas votre progression : téléchargez votre double en bas de page pour la garder.
              </p>
            ) : null}
            {provisional ? null : <Reading neutral />}
          </div>
          {provisional ? (
            <Trend seen={essential.length - unseen.length} total={essential.length} left={unseen.length} href={`#${refineHref}`} />
          ) : (
            <Leader ranking={ranking} results={results} byId={byId} />
          )}
        </div>

        <section class={`board${provisional ? ' is-trend' : ''}`} aria-labelledby="board-title">
          <div class="board-head">
            <h2 id="board-title" class="section-title">
              {provisional ? 'La tendance pour l’instant' : 'Le classement'}
            </h2>
            {election.finalists ? (
              <label class="switch">
                <input type="checkbox" checked={finalistsOnly} onChange={e => setFinalistsOnly((e.currentTarget as HTMLInputElement).checked)} />
                Seulement les qualifiés pour le 2nd tour
              </label>
            ) : null}
          </div>
          {provisional ? <Reading /> : null}
          <ol class="board-list" ref={list} aria-label={provisional ? 'Tendance par affinité' : 'Classement par affinité'}>
            {compatible.map(row)}
            {incompatible.length ? (
              <li class="pv-divider">
                <Icon name="cross" class="flag-mark" />
                <span>Franchissent au moins une de vos lignes rouges</span>
              </li>
            ) : null}
            {incompatible.map((r, i) => row(r, compatible.length + i))}
          </ol>
          <ul class="syn-scale" aria-label="Échelle de lecture">
            {AFFINITY_BANDS.map(b => (
              <li key={b.key} class={`aff-${b.key}`}>
                <span class="swatch" aria-hidden="true" />
                {b.label}
                {provisional ? null : <span class="syn-range"> {bandRange(b)}</span>}
              </li>
            ))}
          </ul>
          {notes.length ? (
            <ul class="callouts">
              {notes.map((n, i) => (
                <li key={i}>
                  <Icon name="info" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {provisional ? null : <Agreement results={results} byId={byId} />}

        {provisional ? null : (
          <div class="results-split">
            <section class="block topics-block" aria-labelledby="topics-title">
              <h2 id="topics-title" class="section-title" tabIndex={-1}>
                Par thème
              </h2>
              <p class="small star-legend">
                <Icon name="star" class="star-icon is-on" />
                <span class="sr-only">Étoile pleine</span>&nbsp;: thème prioritaire, compte double ({MAX_PRIORITIES}&nbsp;au
                plus{chosen.length ? `, ${chosen.length}\u00a0choisi${chosen.length > 1 ? 's' : ''}` : ''}). Appuyez sur
                l’étoile d’un thème pour le choisir ou le retirer.
              </p>
              {/* Au-dessus de la grille : le message se lit près des étoiles, pas une page plus bas */}
              <p class="prio-status" role="status">
                {note?.where === 'grid' ? noteText : ''}
              </p>
              <div class="grid-scroll">
                <table class="pv-grid">
                  <thead>
                    <tr>
                      <th scope="col">Thème</th>
                      {ranking.map(r => {
                        const c = byId.get(r.candidateId)!
                        return (
                          <th scope="col" key={r.candidateId}>
                            <span class="grid-who" aria-hidden="true">
                              <Portrait candidate={c} size="small" decorative />
                              {c.initials}
                            </span>
                            <span class="sr-only">{c.name}</span>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {topicRows.map(t => (
                      <tr key={t.id} class={state.weights[t.id] === 2 ? 'is-priority' : undefined}>
                        {/* L'en-tête de ligne porte le seul nom du thème : le nom de l'étoile (« : prioritaire »)
                            serait sinon répété à chaque cellule, même pour un thème qui ne l'est pas */}
                        <th scope="row" aria-labelledby={`topic-row-${t.id}`}>
                          <span class="topic-head">
                            <StarToggle
                              class="star-toggle"
                              on={state.weights[t.id] === 2}
                              label={t.label}
                              blocked={state.weights[t.id] !== 2 && full}
                              onClick={() => togglePriority(t.id, 'grid')}
                            />
                            <span id={`topic-row-${t.id}`}>{t.label}</span>
                          </span>
                          {/* Refus d'une quatrième étoile : dit aussi sur la ligne touchée, pour qu'on le voie
                              même loin du message de la grille (déjà annoncé par celui-ci) */}
                          {note?.where === 'grid' && note.refused && note.topicId === t.id ? (
                            <span class="star-refused" aria-hidden="true">
                              {`Déjà ${MAX_PRIORITIES}\u00a0priorités\u00a0: retirez une étoile d’abord.`}
                            </span>
                          ) : null}
                        </th>
                        {ranking.map(r => {
                          const v = r.topicScores[t.id] ?? null
                          const b = affinityBand(v)
                          return (
                            <td key={r.candidateId} class={b ? `aff-cell aff-${b.key}` : undefined}>
                              {percent(v)}
                              {b ? <span class="sr-only"> ({b.label})</span> : null}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p class="small">Un tiret : aucune position connue sur vos réponses de ce thème.</p>
            </section>

            {results.why.length && first && second ? (
              <section class="block why-block" aria-labelledby="why-title">
                <h2 id="why-title" class="section-title">
                  Ce qui les sépare
                </h2>
                <p class="why-pair">
                  <span class="why-faces">
                    <Portrait candidate={byId.get(first.candidateId)!} size="small" decorative />
                    <Portrait candidate={byId.get(second.candidateId)!} size="small" decorative />
                  </span>
                  <span>
                    {byId.get(first.candidateId)?.name} <span class="why-vs">et</span> {byId.get(second.candidateId)?.name}
                  </span>
                </p>
                <ol class="why-list">
                  {results.why.map((w, i) => (
                    <li key={w.questionId}>
                      <a href="#/proximite" onClick={() => sessionStorageSafeSet('isoloir-focus', w.questionId)}>
                        <span class="why-n" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span>{questionById.get(w.questionId)?.prompt}</span>
                        <Icon name="arrow-right" />
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        )}

        <section class={`next-block${provisional ? ' is-trend' : ''}`} aria-labelledby="next-title">
          <h2 id="next-title" class="section-title">
            {provisional ? 'Sans attendre' : 'Et maintenant'}
          </h2>
          <ul class="next-panels">
            {(provisional ? [whoHolds] : next).map((n, i) => (
              <li key={n.href} class={i === 0 && !provisional ? 'on-copy' : ''}>
                <a href={n.href} class="next-panel">
                  <Icon name={n.icon} class="next-icon" />
                  <span class="next-title">{n.title}</span>
                  <span class="next-desc">{n.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div class="results-foot">
          <section class="caveats" aria-labelledby="caveats-title">
            <h2 id="caveats-title">À garder en tête</h2>
            <ul>
              <li>Pas une consigne de vote : le résultat dépend des sujets retenus et de la méthode.</li>
              <li>
                Positions arrêtées au {election.dataFrozenAt.split('-').reverse().join('/')}. Une position inconnue sort du
                calcul ; un candidat connu sur peu de vos réponses est ramené vers 50 %.
              </li>
              <li>L’outil ignore la personnalité, l’expérience et la capacité à rassembler.</li>
            </ul>
            <p class="small">
              <a href="#/methode">Méthode et sources</a>
            </p>
          </section>
          <section class="your-data" aria-labelledby="data-title">
            <h2 id="data-title">Vos données</h2>
            <div class="link-row">
              <button type="button" class="btn-text" onClick={downloadDouble}>
                <Icon name="download" />
                Télécharger mon double (JSON)
              </button>
              <ConfirmErase onErase={eraseAll} />
            </div>
            <p class="small">
              Le double contient vos réponses en clair ; une fois téléchargé, « Tout effacer » ne le supprime pas.
            </p>
            {!online ? (
              <p class="notice is-closed" role="status">
                Isoloir fermé : vous êtes hors ligne. Avant de rallumer le réseau, vous pouvez tout effacer de cet appareil.
              </p>
            ) : null}
          </section>
        </div>
      </main>
      <SiteFooter />

      {/* Barre du bas : l'action principale, et deux raccourcis toujours visibles */}
      <nav class="action-bar results-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text bar-home" href="#/">
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </a>
          <div class="bar-shortcuts">
            {/* Pas d'affiche à partager tant que ce n'est qu'une tendance */}
            {provisional ? null : (
              <a class="bar-mini" href="#/partager">
                <Icon name="share" />
                <span>Partager</span>
              </a>
            )}
            {provisional ? (
              <a class="bar-mini" href="#/proximite">
                <Icon name="list" />
                <span>Qui porte quoi</span>
              </a>
            ) : (
              <a class="bar-mini" href="#/approfondir">
                <Icon name="deepen" />
                <span>Approfondir</span>
              </a>
            )}
          </div>
          {provisional ? (
            <button type="button" class="btn-primary" onClick={() => go(refineHref)}>
              <span>
                Continuer<span class="btn-label">&nbsp;: {remaining}</span>
              </span>
              <Icon name="arrow-right" />
            </button>
          ) : (
            <button type="button" class="btn-primary" onClick={() => go('/proximite')}>
              Qui porte quoi
              <Icon name="arrow-right" />
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}

/** Comment lire les bâtons (et, pour le résultat complet, les pourcentages) */
function Reading({ neutral }: { neutral?: boolean }) {
  return (
    <p class="results-reading">
      {neutral ? <span>50&nbsp;%&nbsp;: neutre</span> : null}
      <span>
        <span class="mini-tally" aria-hidden="true" />1 bâton = {POINTS_PER_STROKE} points
      </span>
      <a href="#/methode">La méthode</a>
    </p>
  )
}

/** Où vous en êtes : les questions du questionnaire rapide en bâtons, et l'appel à continuer, bien visible */
function Trend({ seen, total, left, href }: { seen: number; total: number; left: number; href: string }) {
  return (
    <section class="trend" aria-labelledby="trend-title">
      <h2 id="trend-title" class="trend-title">
        <span class="trend-where">Où vous en êtes</span>{' '}
        <span class="trend-count">
          <span class="trend-figure">{seen}</span> question{seen > 1 ? 's' : ''} sur {total}
        </span>
      </h2>
      <ProgressTally done={seen} total={total} />
      <p class="trend-text">
        C’est un début&nbsp;:{' '}
        {left > 1 ? `les ${left} questions suivantes peuvent` : 'la question suivante peut'} encore changer l’ordre.
      </p>
      <a class="btn-primary is-wide trend-cta" href={href}>
        Continuer&nbsp;: {left} question{left > 1 ? 's' : ''}
        <Icon name="arrow-right" />
      </a>
    </section>
  )
}

/** Variation déterministe, pour que chaque bâton pointé ait l'air tracé à la main */
function jitter(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 1.4
}

/**
 * Les questions du questionnaire rapide en bâtons, par cinq : pointées au bleu bille (le cinquième barre
 * le paquet), à venir en crans pointillés imprimés. Décoratif : le titre dit déjà le compte.
 */
function ProgressTally({ done, total }: { done: number; total: number }) {
  const groups = Math.ceil(total / 5)
  return (
    <svg class="trend-tally" viewBox={`0 0 ${groups * 36 - 6} 26`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const x = Math.floor(i / 5) * 36
        const k = i % 5
        if (i >= done) return <path key={i} d={`M${x + 3 + k * 6} 4 V22`} class="is-todo" />
        const d =
          k < 4
            ? `M${x + 4 + k * 6 + jitter(i, 1)} ${3 + jitter(i, 2)} L${x + 4.4 + k * 6 + jitter(i, 3)} ${23 + jitter(i, 4)}`
            : `M${x + 0.8 + jitter(i, 5)} ${19.5 + jitter(i, 6)} L${x + 28.5 + jitter(i, 7)} ${6 + jitter(i, 8)}`
        return <path key={i} d={d} class="is-done" />
      })}
    </svg>
  )
}

function sessionStorageSafeSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // sans stockage, on arrive simplement en haut de la page
  }
}

/** L'affiche du plus proche : portrait, pourcentage sur l'échelle, bâtons ; l'égalité et les lignes rouges dites en clair */
function Leader({
  ranking,
  results,
  byId,
}: {
  ranking: CandidateResult[]
  results: ResultsData
  byId: Map<string, Candidate>
}) {
  const [first, second] = ranking
  if (!first || first.score === null) return null
  const c = byId.get(first.candidateId)!
  const b = affinityBand(first.score)
  const crossing = ranking.filter(r => !r.compatible).length
  return (
    <section class="leader on-copy" aria-labelledby="leader-title">
      <Portrait candidate={c} size="id" decorative />
      <div class="leader-body">
        <h2 id="leader-title" class="leader-title">
          <span class="leader-lead">
            {results.allIncompatible ? 'Le moins concerné par vos lignes rouges' : 'Le plus proche de vos idées'}
          </span>
          <a class="leader-name" href={`#/candidat/${c.id}`}>
            {c.name}
          </a>
        </h2>
        <p class="leader-score">
          <span class={`leader-pct${b ? ` aff-${b.key}` : ''}`}>
            {displayScore(first.score)}
            <span class="pv-unit">%</span>
          </span>
          {b ? <span class={`leader-band aff-${b.key}`}>{b.label}</span> : null}
        </p>
        <Tally count={strokesFor(first.score)} maxGroups={Infinity} drawAll delay={300} label="" />
        {results.close && second ? (
          <p class="leader-note">
            {byId.get(second.candidateId)?.name} suit à moins de {CLOSE_GAP} points : l’écart n’est pas significatif.
          </p>
        ) : null}
        {crossing > 0 && !results.allIncompatible ? (
          <p class="leader-note">
            <Icon name="cross" class="flag-mark" />
            {crossing} candidat{crossing > 1 ? 's franchissent' : ' franchit'} au moins une de vos lignes rouges.
          </p>
        ) : null}
      </div>
    </section>
  )
}

/** Étoile d'un thème : bouton bascule, pleine (bille) quand le thème est prioritaire et compte double */
function StarToggle({
  on,
  label,
  blocked,
  onClick,
  class: c,
  children,
}: {
  on: boolean
  label: string
  /** Déjà le maximum de thèmes prioritaires : l'étoile reste active pour dire pourquoi rien ne change */
  blocked: boolean
  onClick: () => void
  class: string
  children?: ComponentChildren
}) {
  return (
    <button
      type="button"
      class={c}
      aria-pressed={on}
      aria-disabled={blocked || undefined}
      aria-label={`${label}\u00a0: prioritaire`}
      onClick={onClick}
    >
      <Icon name="star" class={`star-icon${on ? ' is-on' : ''}`} />
      {children}
    </button>
  )
}

const count = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`

/**
 * D'où vient la proximité : pour chaque candidat, vos accords (vert, à droite de l'axe) et vos désaccords
 * (orangé-brun, à gauche) sur ses approches principales, puis sur ses autres positions. Toutes les barres
 * partagent la même échelle et chaque nombre est écrit.
 */
function Agreement({ results, byId }: { results: ResultsData; byId: Map<string, Candidate> }) {
  const tallies = results.ranking.flatMap(r => [r.breakdown.main, r.breakdown.other])
  const max = Math.max(1, ...tallies.flatMap(t => [t.agree, t.disagree]))
  const heads = ['Ses approches principales', 'Ses autres positions']
  return (
    <section class="agree" aria-labelledby="agree-title">
      <h2 id="agree-title" class="section-title" tabIndex={-1}>
        Accords et désaccords
      </h2>
      {results.stable ? null : <MethodSwap results={results} byId={byId} />}
      <p class="agree-lede">
        Vos avis sur ce que porte chaque candidat, comptés un par un. Un accord&nbsp;: «&nbsp;D’accord&nbsp;» sur
        une approche qu’il défend, ou «&nbsp;Pas d’accord&nbsp;» sur une approche qu’il rejette. Ses approches
        principales comptent double dans le score&nbsp;; ses autres positions sont ses approches compatibles et
        ses rejets.
      </p>
      <div class="agree-head" aria-hidden="true">
        {heads.map(h => (
          <span class="agree-col" key={h}>
            <span class="agree-col-title">{h}</span>
            <span class="agree-scale">
              <span class="is-against">désaccords</span>
              <span class="is-for">accords</span>
            </span>
          </span>
        ))}
      </div>
      <ol class="agree-list">
        {results.ranking.map(r => {
          const c = byId.get(r.candidateId)!
          const flagged = !r.compatible && !results.allIncompatible
          return (
            <li key={r.candidateId} class={`agree-item${flagged ? ' is-flagged' : ''}`}>
              <p class="agree-who">
                <span class="agree-rank">{r.rank}</span>
                <Portrait candidate={c} size="small" decorative />
                <span class="agree-name">
                  {c.name}
                  {flagged ? <span class="sr-only"> (franchit une de vos lignes rouges)</span> : null}
                </span>
                {r.score !== null ? <span class="agree-score">{displayScore(r.score)}&nbsp;%</span> : null}
              </p>
              {r.score === null ? (
                <p class="agree-none">Aucune position connue sur vos réponses.</p>
              ) : (
                <>
                  <AgreeBar label={heads[0]!} short="Principales" tally={r.breakdown.main} max={max} />
                  <AgreeBar label={heads[1]!} short="Autres" tally={r.breakdown.other} max={max} />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/** Une barre divergente : désaccords à gauche de l'axe, accords à droite, nombres écrits au bout */
function AgreeBar({ label, short, tally, max }: { label: string; short: string; tally: AgreementTally; max: number }) {
  return (
    <div class="agree-row">
      <span class="agree-label" aria-hidden="true">
        {short}
      </span>
      <span class="sr-only">
        {label}&nbsp;: {count(tally.agree, 'accord')}, {count(tally.disagree, 'désaccord')}
      </span>
      <span class="agree-bar" aria-hidden="true">
        <span class="agree-side is-against">
          <span class={`agree-n${tally.disagree ? '' : ' is-zero'}`}>{tally.disagree}</span>
          <span class="agree-fill" style={{ '--f': String(tally.disagree / max) }} />
        </span>
        <span class="agree-side is-for">
          <span class="agree-fill" style={{ '--f': String(tally.agree / max) }} />
          <span class={`agree-n${tally.agree ? '' : ' is-zero'}`}>{tally.agree}</span>
        </span>
      </span>
    </div>
  )
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

/**
 * Résultat sensible à la méthode : le classement complet et celui des seules approches principales, côte à
 * côte, chaque candidat relié à sa place dans l'autre. Les traits suivent la position réelle des lignes
 * (noms sur deux lignes, texte agrandi) ; très étroit, les deux listes s'empilent sans traits.
 */
function MethodSwap({ results, byId }: { results: ResultsData; byId: Map<string, Candidate> }) {
  const peers = methodPeers(results.ranking, results.allIncompatible)
  // Tri stable : à compte égal, l'ordre du classement complet
  const simple = peers.slice().sort((a, b) => b.simpleCount - a.simpleCount)
  const cols = useRef<HTMLDivElement>(null)
  const [links, setLinks] = useState<{ id: string; y1: number; y2: number }[]>([])
  const order = `${peers.map(r => r.candidateId).join()}|${simple.map(r => r.candidateId).join()}`

  useLayoutEffect(() => {
    const el = cols.current
    if (!el) return
    const measure = () => {
      const svg = el.querySelector('.swap-links')
      if (!svg) return
      const top = svg.getBoundingClientRect().top
      const middles = (side: string) =>
        new Map(
          Array.from(el.querySelectorAll<HTMLElement>(`.${side} [data-id]`)).map(li => {
            const b = li.getBoundingClientRect()
            return [li.dataset.id!, b.top + b.height / 2 - top] as const
          }),
        )
      const left = middles('is-full')
      const right = middles('is-simple')
      setLinks(Array.from(left, ([id, y1]) => ({ id, y1, y2: right.get(id) ?? y1 })))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [order])

  const top = peers[0]
  if (!top) return null
  const best = Math.max(...peers.map(r => r.simpleCount))
  const leaders = peers.filter(r => r.rank === top.rank)
  const ahead = peers.filter(r => r.simpleCount === best)
  const marked = new Set([...leaders, ...ahead].map(r => r.candidateId))
  const name = (r: CandidateResult) => byId.get(r.candidateId)?.name ?? ''
  const simpleRank = (r: CandidateResult) => 1 + peers.filter(x => x.simpleCount > r.simpleCount).length

  return (
    <div class="swap" role="group" aria-labelledby="swap-title">
      <h3 id="swap-title" class="swap-title">
        Un résultat qui dépend de la façon de compter
      </h3>
      <p class="swap-text">
        Le score complet tient compte de toutes leurs positions. En ne gardant que leurs approches principales, vos
        accords moins vos désaccords, <strong>{joinNames(ahead.map(name))}</strong>{' '}
        {ahead.length > 1 ? 'passent' : 'passe'} devant <strong>{joinNames(leaders.map(name))}</strong>.
      </p>
      <div class="swap-cols" ref={cols}>
        <div class="swap-col is-full">
          <p class="swap-head" id="swap-full">
            Score complet
          </p>
          <ol class="swap-list" aria-labelledby="swap-full">
            {peers.map(r => (
              <li key={r.candidateId} data-id={r.candidateId} class={marked.has(r.candidateId) ? 'is-marked' : undefined}>
                <span class="swap-rank">{r.rank}</span>
                <span class="swap-name">{name(r)}</span>
                <span class="swap-value">{displayScore(r.score)}&nbsp;%</span>
              </li>
            ))}
          </ol>
        </div>
        <span class="swap-gutter" aria-hidden="true">
          <svg class="swap-links">
            {links.map(l => (
              <line key={l.id} x1="0" x2="100%" y1={l.y1} y2={l.y2} class={marked.has(l.id) ? 'is-marked' : undefined} />
            ))}
          </svg>
        </span>
        <div class="swap-col is-simple">
          <p class="swap-head" id="swap-simple">
            Approches principales seulement
          </p>
          <ol class="swap-list" aria-labelledby="swap-simple">
            {simple.map(r => (
              <li key={r.candidateId} data-id={r.candidateId} class={marked.has(r.candidateId) ? 'is-marked' : undefined}>
                <span class="swap-rank">{simpleRank(r)}</span>
                <span class="swap-name">{name(r)}</span>
                <span class="swap-value">
                  {signed(r.simpleCount)}
                  <span class="sr-only"> (accords moins désaccords)</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
