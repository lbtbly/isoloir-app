import type { ComponentChildren } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { getBase, go, link } from '../nav'
import { affinityBand, AFFINITY_BANDS, bandRange } from '../../core/affinity'
import { priorityTopics, topicsWithOpinion } from '../../core/answers'
import { buildExport, downloadBlob, exportFileName } from '../../core/exportData'
import { currentAnswers } from '../../core/revisions'
import { comparePath } from '../../core/routes'
import { prepareCompare } from '../compare/load'
import { loadReport, prepareReport, reportNow } from '../report/load'
import { prepareProfile } from '../profile/load'
import { hasTable } from '../table/load'
import { frozenAt } from '../../core/freeze'
import { axisOf } from '../../core/spectrum'
import {
  AGREE_HEADS,
  AGREE_LEDE,
  AGREE_NONE,
  allIncompatibleNote,
  answeredLede,
  bankKnownLine,
  caveats,
  count,
  CROSSING_DIVIDER,
  emptyRanking,
  excludedLede,
  excludedTitle,
  excludedWhy,
  FINALISTS_ONLY,
  GRID_DASH,
  gridAllLine,
  indicativeScore,
  joinNames,
  knownLine,
  LINK_METHOD,
  LINK_RULE,
  LINK_SOURCES,
  MANY_RED_LINES,
  manyRedLinesNote,
  PROFILE_GRID_LINK,
  PROFILE_PANEL,
  PROFILE_TITLE,
  profileHome,
  priorityHead,
  READING_NEUTRAL,
  READING_STROKE,
  redLineSummary,
  rowMeta,
  signed,
  starLegend,
  SWAP_HEADS,
  swapText,
  TIE_MARK,
  TITLE_AGREE,
  TITLE_BOARD,
  TITLE_CAVEATS,
  TITLE_DONE,
  TITLE_PRIORITIES,
  TITLE_SWAP,
  TITLE_TOPICS,
  TITLE_WHY,
  trendNext,
  unrankedLede,
  unrankedTitle,
  UNSTABLE_NOTE,
} from '../../core/resultsCopy'
import {
  CLOSE_GAP,
  computeResults,
  displayScore,
  excludedShown,
  indicativeShown,
  knownQuestions,
  methodPeers,
  POINTS_PER_STROKE,
  strokesFor,
  type AgreementTally,
  type CandidateResult,
  type Results as ResultsData,
  type UnrankedResult,
} from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { Candidate, ElectionPack, Question, TopicId, TopicWeights } from '../../core/types'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { ConfirmErase } from '../components/ConfirmErase'
import { Leader } from '../components/Leader'
import { isVoting, useCurrentElection } from '../components/CurrentElection'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { Portrait } from '../components/Portrait'
import { ProgressTally } from '../components/ProgressTally'
import { ProfileBand } from '../components/ProfileEntry'
import { Tally } from '../components/Tally'
import { percent } from '../format'
import { isMany } from '../many'
import { useOnline } from '../useOnline'
import { MAX_PRIORITIES } from './Priorities'
import { InstallLink } from '../install/InstallLink'

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

/** Élection nombreuse : la grille par thème montre d'abord ce nombre de candidats, les premiers du classement */
const GRID_FIRST = 5

/**
 * L'entrée la plus récente du journal des données, quel que soit son ordre (la primaire le tient dans l'ordre
 * chronologique, la présidentielle du plus récent au plus ancien) ; à date égale, la première écrite
 */
export const latestChange = <T extends { date: string }>(log: readonly T[]): T | undefined =>
  log.reduce<T | undefined>((a, c) => (!a || c.date > a.date ? c : a), undefined)

type Snapshot = SessionState['lastSeenRanking']

/** Un panneau de « Et maintenant » ; ink : à l'encre, sans le pastel de sa place */
interface NextPanel {
  href: string
  icon: string
  title: string
  desc: string
  ink?: boolean
}

/** Dernier geste sur une étoile, pour l'annoncer à côté de l'endroit où il a eu lieu */
type PriorityNote =
  | { where: 'top' | 'grid'; refused: true; topicId: TopicId }
  | { where: 'top' | 'grid'; refused?: false; topicId: TopicId; on: boolean; leaders: string[] }

const snapshot = (results: ResultsData): NonNullable<Snapshot> =>
  results.ranking.map(r => ({ candidateId: r.candidateId, score: displayScore(r.score) }))

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
  const current = useCurrentElection()
  const { election, candidates, bank } = pack
  const byId = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const topicsById = useMemo(() => new Map(bank.topics.map(t => [t.id, t])), [bank.topics])
  const approachText = useMemo(() => {
    const m = new Map<string, string>()
    for (const q of bank.questions) for (const a of q.approaches) m.set(a.id, a.text)
    return m
  }, [bank])
  const questionById = useMemo(() => new Map(bank.questions.map(q => [q.id, q])), [bank])

  // « Comparer mes premiers » s'ouvre d'ici : l'écran de comparaison se prépare dès que le navigateur a un moment
  useEffect(() => prepareCompare(), [])
  const [finalistsOnly, setFinalistsOnly] = useState(false)
  // Grille par thème d'une élection nombreuse : tous les candidats, à la demande
  const [allColumns, setAllColumns] = useState(false)
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
  // Le dépouillement en PDF : où en est sa fabrication, effacé quand le résultat change (réponses, priorités,
  // qualifiés ; app.tsx ne le recalcule qu'alors)
  const [pdfStatus, setPdfStatus] = useState('')
  useEffect(() => setPdfStatus(''), [results])
  const ranking = results.ranking
  // Hors classement (élections qui l'activent) : connus sur trop peu de vos réponses, montrés sous le classement
  const unranked = results.unranked
  // Des candidats hors du classement (hors classement ou non classés) : les phrases disent « classés »
  const someOff = unranked.length > 0 || results.excluded.length > 0
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

  // Priorités : seuls les thèmes où vous avez donné un avis peuvent peser, la règle de la page des priorités
  // (core/answers.ts, la même dans « Mon profil politique »)
  const answeredTopics = topicsWithOpinion(bank, state.answers)
  const chosen = priorityTopics(bank, state.answers, state.weights)
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
  // Le PDF se fabrique ici, sur l'appareil, d'ordinaire sans attendre (module préparé) : le téléchargement reste
  // dans le geste de l'utilisateur. L'adresse du fichier est gardée une minute (Safari sur iPhone)
  const downloadReport = async () => {
    try {
      const m = reportNow() ?? (setPdfStatus('Préparation du PDF…'), await loadReport())
      const now = new Date()
      const bytes = m.buildReportPdf({
        pack,
        state,
        results,
        finalistsOnly: !!finalistResults,
        staleCount: stale.length,
        archive: current?.archive
          ? { voting: isVoting(current.archive.votingUntil, now.getTime()), currentLabel: current.archive.currentLabel }
          : null,
        slug: getBase(),
        maxPriorities: MAX_PRIORITIES,
        now,
      })
      downloadBlob(new Blob([bytes], { type: 'application/pdf' }), m.reportFileName(pack, now), 60_000)
      setPdfStatus(
        'PDF fabriqué sur cet appareil. S’il n’apparaît pas dans vos téléchargements, ce navigateur ne permet peut-être pas d’enregistrer de fichier.',
      )
    } catch {
      setPdfStatus('Le PDF n’a pas pu être fabriqué. Rechargez la page, puis réessayez.')
    }
  }
  const deepCount = bank.questions.filter(q => q.tier === 'approfondi').length
  const answeredDeep = bank.questions.filter(q => q.tier === 'approfondi' && state.answers[q.id] && !state.answers[q.id]!.skipped).length
  const shown = bank.topics.filter(t => shownTopics.includes(t.id) && answeredTopics.has(t.id))
  // Première tendance : tant que des questions du questionnaire rapide n'ont pas été vues, le résultat est
  // provisoire. Il ne doit pas ressembler à un verdict : ni affiche du plus proche, ni pourcentage, ni détail
  // par thème ; l'appel à continuer passe devant.
  const unseen = essential.filter(q => !state.answers[q.id])
  const provisional = unseen.length > 0
  // « Mon profil politique » (élections dont la grille a un axe) : au résultat complet, le bandeau sous l'affiche, le
  // panneau en 2e place de « Et maintenant » et le lien sous « Par thème » ; pendant la tendance, une ligne de la fiche
  // « Où vous en êtes » mène à sa page d'attente
  const axis = axisOf(election)
  const profile = !provisional && !!axis
  // Le dépouillement en PDF, et « Mon profil politique », se préparent dès que le résultat est complet (jamais
  // pendant la tendance)
  useEffect(() => {
    if (provisional) return
    prepareReport()
    if (profile) prepareProfile()
  }, [provisional, profile])
  const refineHref = `/feuille/${essential.indexOf(unseen[0]!) + 1}`
  // Des questions à revoir : leur carte porte le seul aplat bleu de la vue, l'action de la barre et l'appel de la
  // tendance passent au trait noir (2026-10-15)
  const quiet = stale.length > 0
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
              {TIE_MARK}
            </span>
          ) : null}
        </span>
        <Portrait candidate={c} size="row" decorative />
        <div class="board-who">
          <a class="board-name" href={link(`/candidat/${c.id}`)}>
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
          {rowMeta(r, !provisional)}
          {!provisional && moved ? <span class="pv-moved"> · {moved}</span> : null}
        </p>
        {touched ? (
          <details class="board-flags">
            <summary>
              <Icon name="cross" class="flag-mark" />
              {redLineSummary(r.dealbreakers)}
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
            <a class="btn-primary" href={link('/feuille/1')}>
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
  // Une vingtaine de colonnes ne se lit plus : d'abord les premiers de votre classement, tous sur demande
  const manyColumns = isMany(ranking.length)
  const gridAll = manyColumns && allColumns
  const columns = manyColumns && !allColumns ? ranking.slice(0, GRID_FIRST) : ranking
  const notes = [
    results.allIncompatible ? <>{allIncompatibleNote(someOff)}</> : null,
    results.close && first && second ? (
      provisional ? (
        <>
          {byId.get(first.candidateId)?.name} et {byId.get(second.candidateId)?.name} sont au coude-à-coude&nbsp;: les
          questions suivantes peuvent les départager.
        </>
      ) : (
        <>
          {byId.get(first.candidateId)?.name} et {byId.get(second.candidateId)?.name} sont à moins de {CLOSE_GAP} points : l’écart
          n’est pas significatif. <a href={link('/approfondir')}>Approfondir pour les départager</a>
        </>
      )
    ) : null,
    // En tendance, la suite du questionnaire peut tout changer : pas de détail de méthode
    !results.stable && !provisional ? (
      <>
        {UNSTABLE_NOTE}&nbsp;:{' '}
        <a href="#agree-title" onClick={jumpTo('agree-title')}>
          voir qui passe devant en ne gardant que les approches principales
        </a>
      </>
    ) : null,
    results.redLineCount > MANY_RED_LINES ? <>{manyRedLinesNote(results.redLineCount)}</> : null,
  ].filter(Boolean)

  // Les suites, en panneaux : la première est l'action principale de la barre du bas. Tant que le résultat
  // est provisoire, seul « Qui porte quoi » est proposé : l'action principale est de continuer.
  const whoHolds: NextPanel = {
    href: link('/proximite'),
    icon: 'list',
    title: 'Qui porte quoi',
    desc: provisional
      ? `Vos ${essential.length - unseen.length} premières questions, face aux positions des candidats, sources à l’appui.`
      : 'Vos avis face aux positions des candidats, question par question, sources à l’appui.',
  }
  const next: NextPanel[] = [
    whoHolds,
    // Deuxième, juste après « Qui porte quoi » (décision du propriétaire du 12 octobre 2026). À l'encre, sans pastel : le
    // pastel de sa place (le bleu, celui de la droite sur les cartes des candidats et sur la page) y prendrait un sens
    ...(profile ? [{ href: link('/profil'), icon: 'axis', title: PROFILE_TITLE, desc: PROFILE_PANEL, ink: true }] : []),
    // « À table » : juste après le profil, sur le pastel de sa place ; à l'encre quand il passerait deuxième (le bleu
    // de cette place est celui de la droite sur les cartes des candidats)
    ...(hasTable(election)
      ? [
          {
            href: link('/a-table'),
            icon: 'table',
            title: 'À table',
            desc: 'De 3 à 12 personnes, un seul téléphone\u00a0: chacun vote en secret, puis vous lisez ensemble ce qui vous réunit.',
            ink: !profile,
          },
        ]
      : []),
    {
      href: link('/partager'),
      icon: 'share',
      title: 'Partager l’image',
      // Pendant le gel des jours de vote, aucune image n'est fabriquée (core/freeze.ts) : la tuile le dit
      desc: frozenAt(election) ? 'Pas d’image pendant le gel des jours de vote.' : 'Votre affiche en JPG, fabriquée sur cet appareil.',
    },
    {
      href: link('/approfondir'),
      icon: 'deepen',
      title: 'Approfondir',
      desc:
        answeredDeep > 0
          ? `${answeredDeep} question${answeredDeep > 1 ? 's' : ''} de plus déjà pointée${answeredDeep > 1 ? 's' : ''} : d’autres thèmes à creuser.`
          : `Jusqu’à ${deepCount} questions de plus, par thème.`,
    },
    // À l'encre : avec la tuile « À table », sa place tomberait sur un pastel qui prendrait un sens sur une page de candidats
    { href: link('/candidats'), icon: 'arrow-right', title: 'Les candidats', desc: 'Parcours, site de campagne et toutes leurs positions.', ink: true },
  ]

  return (
    <div class="screen screen-wide screen-results">
      <FormHeader title="Résultats" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class={`results-hero${provisional ? ' is-trend' : ''}`}>
          <div class="results-intro">
            <div class="results-head">
              <h1 class="display" tabIndex={-1}>
                {provisional ? 'Une première tendance' : TITLE_DONE}
              </h1>
              {provisional ? (
                <span class="stamp is-provisional">
                  <span class="stamp-label">Résultat</span>
                  <span class="stamp-date">provisoire</span>
                </span>
              ) : null}
            </div>
            {provisional ? null : (
              <p class="lede">{answeredLede(results.answered)}</p>
            )}
            {/* Les questions à revoir : sous la phrase d'introduction, avant les priorités, pour se voir dès le premier écran */}
            <ChangedQuestions questions={stale} topics={topicsById} />
            {provisional ? null : (
              <div class="prio" role="group" aria-labelledby="prio-title">
                <p class="prio-head">
                  <span id="prio-title" class="prio-title">
                    {TITLE_PRIORITIES}
                  </span>
                  <span class="prio-none">{priorityHead(chosen.length)}</span>
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
                  <a href={link('/priorites')}>Tous les thèmes</a>
                </p>
                <p class="prio-status" role="status">
                  {note?.where === 'top' ? noteText : ''}
                </p>
              </div>
            )}
            {state.dataUpdatedFrom ? (
              <p class="notice" role="status">
                Les données ont été mises à jour depuis votre dernier passage (
                {/* Le texte du journal finit par un point : retiré ici, avant la parenthèse fermante */}
                {latestChange(election.changelog)?.text.replace(/\.$/, '') ?? `version ${election.dataVersion}`}). Votre résultat a pu
                changer.{' '}
                <button type="button" class="btn-text" onClick={() => update({ dataUpdatedFrom: null })}>
                  Compris
                </button>
              </p>
            ) : null}
            {!saved ? (
              <p class="notice" role="status">
                Ce navigateur n’enregistre pas votre progression : transférez vos réponses, en bas de page, pour les garder.
              </p>
            ) : null}
            {provisional ? null : <Reading neutral />}
          </div>
          {provisional ? (
            <Trend seen={essential.length - unseen.length} total={essential.length} left={unseen.length} href={link(refineHref)} profile={!!axis} quiet={quiet} />
          ) : (
            <div class="results-side">
              <Leader ranking={ranking} results={results} byId={byId} />
              {/* Au téléphone, entre l'affiche et le classement ; en grand écran, sous l'affiche, dans sa colonne */}
              {profile && axis ? <ProfileBand cls="results-profile" title={PROFILE_TITLE} text={profileHome(axis)} axis={axis} /> : null}
            </div>
          )}
        </div>

        <section class={`board${provisional ? ' is-trend' : ''}`} aria-labelledby="board-title">
          <div class="board-head">
            <h2 id="board-title" class="section-title">
              {provisional ? 'La tendance pour l’instant' : TITLE_BOARD}
            </h2>
            {election.finalists ? (
              <label class="switch">
                <input type="checkbox" checked={finalistsOnly} onChange={e => setFinalistsOnly((e.currentTarget as HTMLInputElement).checked)} />
                {FINALISTS_ONLY}
              </label>
            ) : null}
          </div>
          {provisional ? <Reading /> : null}
          {ranking.length ? (
            <ol class="board-list" ref={list} aria-label={provisional ? 'Tendance par affinité' : 'Classement par affinité'}>
              {compatible.map(row)}
              {incompatible.length ? (
                <li class="pv-divider">
                  <Icon name="cross" class="flag-mark" />
                  <span>{CROSSING_DIVIDER}</span>
                </li>
              ) : null}
              {incompatible.map((r, i) => row(r, compatible.length + i))}
            </ol>
          ) : (
            // Règle « hors classement » : aucun candidat n'est assez connu sur ces réponses pour être classé
            <p class="board-empty">{emptyRanking(results.minCoverageShare)}</p>
          )}
          {ranking.length ? (
            <ul class="syn-scale" aria-label="Échelle de lecture">
              {AFFINITY_BANDS.map(b => (
                <li key={b.key} class={`aff-${b.key}`}>
                  <span class="swatch" aria-hidden="true" />
                  {b.label}
                  {provisional ? null : <span class="syn-range"> {bandRange(b)}</span>}
                </li>
              ))}
            </ul>
          ) : null}
          {/* Raccourci vers la comparaison : leurs positions côte à côte, thème par thème (pas pendant la tendance,
              dont l'ordre n'est pas encore un résultat) */}
          {provisional || ranking.length < 2 ? null : (
            <p class="board-compare">
              <a class="btn-text" href={link(comparePath(ranking.slice(0, 2).map(r => r.candidateId)))}>
                <Icon name="compare" />
                Comparer mes 2 premiers
              </a>
              {ranking.length > 2 ? (
                <a class="btn-text" href={link(comparePath(ranking.slice(0, 3).map(r => r.candidateId)))}>
                  <Icon name="compare" />
                  Comparer mes 3 premiers
                </a>
              ) : null}
            </p>
          )}
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

        <Unranked items={unranked} minShare={results.minCoverageShare} provisional={provisional} byId={byId} />

        {/* Non classés de l'élection : toujours nommés, même pendant la tendance, sans rang ; hors tendance, leur score
            indicatif (décision du propriétaire du 14 octobre 2026), à partir de 5 réponses où leur position est connue
            (décision du propriétaire du 2026-10-15) */}
        <Excluded pack={pack} items={results.excludedResults} provisional={provisional} byId={byId} />

        {provisional || !ranking.length ? null : <Agreement results={results} byId={byId} />}

        {provisional || !ranking.length ? null : (
          <div class={`results-split${gridAll ? ' is-grid-all' : ''}`}>
            <section class="block topics-block" aria-labelledby="topics-title">
              <h2 id="topics-title" class="section-title" tabIndex={-1}>
                {TITLE_TOPICS}
              </h2>
              <p class="small star-legend">
                <Icon name="star" class="star-icon is-on" />
                <span class="sr-only">Étoile pleine</span>
                {starLegend(chosen.length, MAX_PRIORITIES)} Appuyez sur l’étoile d’un thème pour le choisir ou le retirer.
              </p>
              {/* Au-dessus de la grille : le message se lit près des étoiles, pas une page plus bas */}
              <p class="prio-status" role="status">
                {note?.where === 'grid' ? noteText : ''}
              </p>
              {manyColumns ? (
                <p class="grid-columns">
                  <span>
                    {gridAll
                      ? gridAllLine(ranking.length, someOff)
                      : `Les ${GRID_FIRST}\u00a0premiers de votre classement.`}
                  </span>{' '}
                  <button type="button" class="btn-text" aria-controls="topic-grid" onClick={() => setAllColumns(!allColumns)}>
                    {gridAll
                      ? `Revenir aux ${GRID_FIRST}\u00a0premiers`
                      : `Comparer les ${ranking.length}\u00a0candidats${someOff ? ' classés' : ''}`}
                  </button>
                </p>
              ) : null}
              {/* Tous les candidats : la grille défile ; au clavier aussi, d'où la zone focalisable et nommée */}
              <div
                class={`grid-scroll${gridAll ? ' is-all' : ''}`}
                {...(gridAll
                  ? { role: 'region', 'aria-label': `Par thème, tous les candidats${someOff ? ' classés' : ''}`, tabIndex: 0 }
                  : {})}
              >
                <table class="pv-grid" id="topic-grid">
                  <thead>
                    <tr>
                      <th scope="col">Thème</th>
                      {columns.map(r => {
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
                        {columns.map(r => {
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
              <p class="small">{GRID_DASH}</p>
              {profile ? (
                <p class="small">
                  <a href={link('/profil')}>{PROFILE_GRID_LINK}</a>
                </p>
              ) : null}
            </section>

            {results.why.length && first && second ? (
              <section class="block why-block" aria-labelledby="why-title">
                <h2 id="why-title" class="section-title">
                  {TITLE_WHY}
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
                      <a href={link('/proximite')} onClick={() => sessionStorageSafeSet('isoloir-focus', w.questionId)}>
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
              <li key={n.href} class={i === 0 && !provisional ? 'on-copy' : n.ink ? 'is-ink' : ''}>
                <a href={n.href} class="next-panel">
                  <Icon name={n.icon} class="next-icon" />
                  <span class="next-title">{n.title}</span>
                  <span class="next-desc">{n.desc}</span>
                </a>
              </li>
            ))}
          </ul>
          {provisional ? null : <InstallLink />}
        </section>

        <div class="results-foot">
          <section class="caveats" aria-labelledby="caveats-title">
            <h2 id="caveats-title">{TITLE_CAVEATS}</h2>
            <ul>
              {caveats(election, results.minCoverageShare).map(c => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p class="small">
              <a href={link('/methode')}>{LINK_SOURCES}</a>
            </p>
          </section>
          <section class="your-data" aria-labelledby="data-title">
            <h2 id="data-title">Vos données</h2>
            <div class="link-row">
              <a class="btn-text" href={link('/autre-appareil')}>
                <Icon name="qr" />
                Transférer mes réponses
              </a>
              {/* Pas de PDF pendant la tendance : comme l'affiche, le dépouillement attend le résultat complet */}
              {provisional ? null : (
                <button type="button" class="btn-text" onClick={() => void downloadReport()}>
                  <Icon name="download" />
                  Télécharger mon dépouillement (PDF)
                </button>
              )}
              <button type="button" class="btn-text" onClick={downloadDouble}>
                <Icon name="download" />
                Télécharger mon double (JSON)
              </button>
              <ConfirmErase onErase={eraseAll} />
            </div>
            {provisional ? null : (
              <p class="small report-status" role="status">
                {pdfStatus}
              </p>
            )}
            <p class="small">
              {provisional
                ? 'Le double et le code de transfert contiennent vos réponses en clair ; leurs copies, « Tout effacer » ne les supprime pas.'
                : 'Le PDF montre votre résultat, vos priorités et vos lignes rouges ; le double et le code de transfert contiennent toutes vos réponses. Leurs copies, « Tout effacer » ne les supprime pas.'}
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
          <a class="btn-text bar-home" href={link('/')}>
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </a>
          <div class="bar-shortcuts">
            {/* Pas d'affiche à partager tant que ce n'est qu'une tendance */}
            {provisional ? null : (
              <a class="bar-mini" href={link('/partager')}>
                <Icon name="share" />
                <span>Partager</span>
              </a>
            )}
            {provisional ? (
              <a class="bar-mini" href={link('/proximite')}>
                <Icon name="list" />
                <span>Qui porte quoi</span>
              </a>
            ) : (
              <a class="bar-mini" href={link('/approfondir')}>
                <Icon name="deepen" />
                <span>Approfondir</span>
              </a>
            )}
          </div>
          {provisional ? (
            <button type="button" class={quiet ? 'btn-primary is-outline' : 'btn-primary'} onClick={() => go(refineHref)}>
              <span>
                Continuer<span class="btn-label">&nbsp;: {remaining}</span>
              </span>
              <Icon name="arrow-right" />
            </button>
          ) : (
            <button type="button" class={quiet ? 'btn-primary is-outline' : 'btn-primary'} onClick={() => go('/proximite')}>
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
      {neutral ? <span>{READING_NEUTRAL}</span> : null}
      <span>
        <span class="mini-tally" aria-hidden="true" />
        {READING_STROKE}
      </span>
      <a href={link('/methode')}>{LINK_METHOD}</a>
    </p>
  )
}

/**
 * Où vous en êtes : les questions du questionnaire rapide en bâtons, et l'appel à continuer, bien visible ; profile : ce
 * qui vient au bout, dont « Mon profil politique », vers sa page d'attente
 */
function Trend({
  seen,
  total,
  left,
  href,
  profile,
  quiet,
}: {
  seen: number
  total: number
  left: number
  href: string
  profile: boolean
  /** Au trait noir : la carte « À revoir » porte l'aplat bleu de la vue */
  quiet: boolean
}) {
  const next = trendNext(total)
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
      <a class={quiet ? 'btn-primary is-outline is-wide trend-cta' : 'btn-primary is-wide trend-cta'} href={href}>
        Continuer&nbsp;: {left} question{left > 1 ? 's' : ''}
        <Icon name="arrow-right" />
      </a>
      {profile ? (
        <p class="trend-next">
          {next[0]}
          <a href={link('/profil')}>{next[1]}</a>
          {next[2]}
        </p>
      ) : null}
    </section>
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
/**
 * Hors classement (élections qui l'activent) : les candidats connus sur trop peu de vos réponses, sous le classement,
 * dans un ordre tiré au hasard. Ni rang, ni bâtons, ni couleur de palier : seulement la couverture, et le score dit
 * indicatif (aucun pourcentage pendant la tendance). Le nom mène à la fiche, comme au classement.
 */
function Unranked({
  items,
  minShare,
  provisional,
  byId,
}: {
  items: UnrankedResult[]
  minShare: number | null
  provisional: boolean
  byId: Map<string, Candidate>
}) {
  if (!items.length || minShare === null) return null
  return (
    <section class="unranked" aria-labelledby="unranked-title">
      <h2 id="unranked-title" class="unranked-title">
        {unrankedTitle(items.length)}
      </h2>
      <p class="unranked-lede">
        {unrankedLede(items.length, minShare, provisional)}{' '}
        <a href={link('/methode/hors-classement')}>{LINK_RULE}</a>
      </p>
      <ul class="unranked-list">
        {items.map(r => {
          const c = byId.get(r.candidateId)!
          const touched = r.dealbreakers.length
          const flagged = !r.compatible
          const shown = indicativeShown(r, provisional)
          return (
            <li key={r.candidateId} class={`unranked-item${flagged ? ' is-flagged' : ''}`}>
              <Portrait candidate={c} size="small" decorative />
              <div class="unranked-who">
                <a class="unranked-name" href={link(`/candidat/${c.id}`)}>
                  {c.name}
                </a>
                <span class="unranked-party">{c.affiliation}</span>
              </div>
              <p class="unranked-meta">
                <span>{knownLine(r.known, r.answered)}</span>
                {/* Les éléments sont séparés à l'écran par l'espacement ; à la lecture vocale, par une virgule */}
                {shown !== null ? (
                  <span class="unranked-score">
                    <span class="sr-only">, </span>
                    {indicativeScore(shown)}
                  </span>
                ) : provisional ? null : (
                  <span class="unranked-score-slot" aria-hidden="true" />
                )}
                {touched ? (
                  <span class="unranked-flag">
                    <span class="sr-only">, </span>
                    <Icon name="cross" class="flag-mark" />
                    {redLineSummary(r.dealbreakers)}
                  </span>
                ) : null}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/**
 * Non classés (election.ranking.excluded) : sortis du classement par décision, positions connues sur trop peu de
 * questions. Toujours nommés sous le classement, dans un ordre tiré au hasard, sur le modèle du hors classement : sur
 * combien de questions de la banque, puis de vos réponses, leur position est connue ; hors tendance, un score
 * indicatif, pour information seulement (décision du propriétaire du 14 octobre 2026), calculé sur leurs seules
 * positions connues, montré seulement si leur position est connue sur au moins EXCLUDED_MIN_KNOWN de vos réponses
 * (décision du propriétaire du 2026-10-15 ; sinon, seulement « Connu sur X de vos N réponses », sa place gardée
 * vide en large pour que les colonnes restent alignées) ; une ligne rouge franchie, dite en clair pour qu'un score ne
 * la cache jamais. Ni rang, ni bâtons, ni couleur de palier. Le nom mène à la fiche, comme au classement.
 */
function Excluded({
  pack,
  items,
  provisional,
  byId,
}: {
  pack: ElectionPack
  items: UnrankedResult[]
  provisional: boolean
  byId: Map<string, Candidate>
}) {
  const known = useMemo(() => new Map(items.map(r => [r.candidateId, knownQuestions(pack, r.candidateId)])), [pack, items])
  if (!items.length) return null
  const total = pack.bank.questions.length
  return (
    <section class="unranked excluded" aria-labelledby="excluded-title">
      <h2 id="excluded-title" class="unranked-title">
        {excludedTitle(items.length)}
        <span class="excluded-why">{excludedWhy(items.length)}</span>
      </h2>
      <p class="unranked-lede">
        {excludedLede(items.length, provisional)}{' '}
        <a href={link('/methode/non-classes')}>{LINK_RULE}</a>
      </p>
      <ul class="unranked-list">
        {items.map(r => {
          const c = byId.get(r.candidateId)!
          const touched = r.dealbreakers.length
          const flagged = !r.compatible
          const shown = excludedShown(r, provisional)
          return (
            <li key={r.candidateId} class={`unranked-item${flagged ? ' is-flagged' : ''}`}>
              <Portrait candidate={c} size="small" decorative />
              <div class="unranked-who">
                <a class="unranked-name" href={link(`/candidat/${c.id}`)}>
                  {c.name}
                </a>
                <span class="unranked-party">{c.affiliation}</span>
              </div>
              <p class="unranked-meta">
                <span>{bankKnownLine(known.get(r.candidateId)!, total)}</span>
                {/* Les éléments sont séparés à l'écran par l'espacement ; à la lecture vocale, par une virgule */}
                <span>
                  <span class="sr-only">, </span>
                  {knownLine(r.known, r.answered)}
                </span>
                {shown !== null ? (
                  <span class="unranked-score">
                    <span class="sr-only">, </span>
                    {indicativeScore(shown)}
                  </span>
                ) : provisional ? null : (
                  <span class="unranked-score-slot" aria-hidden="true" />
                )}
                {touched ? (
                  <span class="unranked-flag">
                    <span class="sr-only">, </span>
                    <Icon name="cross" class="flag-mark" />
                    {redLineSummary(r.dealbreakers)}
                  </span>
                ) : null}
              </p>
            </li>
          )
        })}
      </ul>
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

/**
 * D'où vient la proximité : pour chaque candidat, vos accords (vert, à droite de l'axe) et vos désaccords
 * (orangé-brun, à gauche) sur ses approches principales, puis sur ses autres positions. Toutes les barres
 * partagent la même échelle et chaque nombre est écrit.
 */
function Agreement({ results, byId }: { results: ResultsData; byId: Map<string, Candidate> }) {
  const tallies = results.ranking.flatMap(r => [r.breakdown.main, r.breakdown.other])
  const max = Math.max(1, ...tallies.flatMap(t => [t.agree, t.disagree]))
  return (
    <section class="agree" aria-labelledby="agree-title">
      <h2 id="agree-title" class="section-title" tabIndex={-1}>
        {TITLE_AGREE}
      </h2>
      {results.stable ? null : <MethodSwap results={results} byId={byId} />}
      <p class="agree-lede">{AGREE_LEDE}</p>
      <div class="agree-head" aria-hidden="true">
        {AGREE_HEADS.map(h => (
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
                <p class="agree-none">{AGREE_NONE}</p>
              ) : (
                <>
                  <AgreeBar label={AGREE_HEADS[0]} short="Principales" tally={r.breakdown.main} max={max} />
                  <AgreeBar label={AGREE_HEADS[1]} short="Autres" tally={r.breakdown.other} max={max} />
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
        {TITLE_SWAP}
      </h3>
      <p class="swap-text">
        {swapText(ahead.map(name), leaders.map(name)).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
      </p>
      <div class="swap-cols" ref={cols}>
        <div class="swap-col is-full">
          <p class="swap-head" id="swap-full">
            {SWAP_HEADS[0]}
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
            {SWAP_HEADS[1]}
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
