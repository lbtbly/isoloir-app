import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { isAnswered } from './core/answers'
import { firstStepSize, orderedQuestions } from './core/order'
import { currentAnswers, staleQuestions } from './core/revisions'
import { seededShuffle } from './core/rng'
import { computeResults } from './core/score'
import { clearAll, essentialComplete, freshState, loadState, saveState, storageKey, type SessionState } from './core/storage'
import type { Answer, Question, Tier } from './core/types'
import { defaultElection } from './elections'
import { Sheet } from './ui/questionnaire/Sheet'
import { Deepen } from './ui/screens/Deepen'
import { Home } from './ui/screens/Home'
import { Method } from './ui/screens/Method'
import { Priorities } from './ui/screens/Priorities'
import { Privacy } from './ui/screens/Privacy'
import { Legal } from './ui/screens/Legal'
import { Proximity } from './ui/screens/Proximity'
import { Results } from './ui/screens/Results'
import { Share } from './ui/screens/Share'
import { CandidatePage, CandidatesIndex } from './ui/screens/Candidates'
import { Topics } from './ui/screens/Topics'
import { Videos } from './ui/screens/Videos'
import { VideoHost } from './ui/videos/Host'

export type Route =
  | { name: 'home' }
  | { name: 'sheet'; tier: Tier; index: number }
  | { name: 'revision' }
  | { name: 'priorities' }
  | { name: 'results' }
  | { name: 'proximity' }
  | { name: 'deepen' }
  | { name: 'share' }
  /** « anchor » : la rubrique à montrer à l'ouverture (#/methode/ia) */
  | { name: 'method'; anchor?: string }
  | { name: 'privacy' }
  | { name: 'legal' }
  | { name: 'candidates' }
  | { name: 'candidate'; id: string }
  | { name: 'topics'; anchor?: string }
  /** « Les sujets en vidéo » ; « start » : la vidéo sur laquelle ouvrir le lecteur (#/videos/<vidéo>) */
  | { name: 'videos'; start?: string }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const [head, arg] = parts
  const n = Math.max(0, Number.parseInt(arg ?? '1', 10) - 1) || 0
  switch (head) {
    case 'feuille':
      return { name: 'sheet', tier: 'essentiel', index: n }
    case 'approfondi':
      return { name: 'sheet', tier: 'approfondi', index: n }
    case 'revision':
      return { name: 'revision' }
    case 'priorites':
      return { name: 'priorities' }
    case 'resultats':
      return { name: 'results' }
    case 'proximite':
      return { name: 'proximity' }
    case 'approfondir':
      return { name: 'deepen' }
    case 'partager':
      return { name: 'share' }
    case 'methode':
      return arg ? { name: 'method', anchor: arg } : { name: 'method' }
    case 'confidentialite':
      return { name: 'privacy' }
    case 'mentions-legales':
      return { name: 'legal' }
    case 'candidats':
      return { name: 'candidates' }
    case 'candidat':
      return arg ? { name: 'candidate', id: arg } : { name: 'candidates' }
    case 'sujets':
      return arg ? { name: 'topics', anchor: arg } : { name: 'topics' }
    // « essai-videos » : ancienne adresse de la page d'essai, qui mène à la page des vidéos (l'adresse est
    // corrigée par App)
    case 'videos':
    case 'essai-videos':
      return arg ? { name: 'videos', start: arg } : { name: 'videos' }
    default:
      return { name: 'home' }
  }
}

export const go = (path: string) => {
  window.location.hash = path
}

/** Remplace l'écran courant sans ajouter d'entrée à l'historique */
export const replace = (path: string) => {
  window.location.replace(`#${path}`)
}

const SKIPPED: Answer = { ratings: {}, redLines: [], skipped: true }

export function App() {
  const pack = defaultElection
  const { election, bank } = pack
  const [state, setState] = useState<SessionState>(() => loadState(pack))
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  const [saved, setSaved] = useState(true)
  const firstRender = useRef(true)
  const remote = useRef(false)
  // Ancienne adresse de la page d'essai des vidéos (#/essai-videos) : corrigée sur place, sans nouvelle entrée
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#/essai-videos')) history.replaceState(history.state, '', hash.replace('#/essai-videos', '#/videos'))
  }, [route])

  useEffect(() => {
    const onHash = () => {
      // Seuls les chemins « #/… » sont des routes : une ancre interne ne change pas d'écran
      if (window.location.hash && !window.location.hash.startsWith('#/')) return
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Un autre onglet a modifié ou effacé la feuille : on suit, sans réécrire un état périmé
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== storageKey(election.id)) return
      remote.current = true
      setState(loadState(pack))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [election.id, pack])

  useEffect(() => {
    if (remote.current) {
      remote.current = false
      return
    }
    setSaved(saveState(state))
  }, [state])

  // Hauteur réelle de la barre d'actions (zoom texte, zone sûre) pour ne rien masquer en bas de feuille
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.action-bar')
    if (!bar || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() =>
      document.documentElement.style.setProperty('--bar-real', `${bar.offsetHeight}px`),
    )
    ro.observe(bar)
    return () => ro.disconnect()
  })
  // Idem pour l'en-tête fixe, sous lequel se calent les barres de filtres collantes
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.form-header')
    if (!header || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() =>
      document.documentElement.style.setProperty('--header-real', `${header.offsetHeight}px`),
    )
    ro.observe(header)
    return () => ro.disconnect()
  })

  const essential = useMemo(() => orderedQuestions(bank, 'essentiel', state.seed), [bank, state.seed])
  const deep = useMemo(
    () => orderedQuestions(bank, 'approfondi', state.seed, state.deepTopics),
    [bank, state.seed, state.deepTopics],
  )
  // Réponses à revoir (question changée sur le fond) : retirées du calcul en attendant
  const stale = useMemo(() => staleQuestions(pack, state.answers), [pack, state.answers])
  const results = useMemo(
    () => computeResults(pack, currentAnswers(pack, state.answers), state.weights, state.seed),
    [pack, state.answers, state.weights, state.seed],
  )

  const update = useCallback((patch: Partial<SessionState>) => setState(s => ({ ...s, ...patch })), [])
  const tracking = !!election.revisionTracking
  /** Enregistre une réponse. Suivi actif : elle porte la révision de la question, sauf en relecture avant validation. */
  const setAnswer = useCallback(
    (q: Question, answer: Answer, stamp = true) =>
      setState(s => {
        const next: Answer = { ...answer }
        delete next.rev
        const rev = tracking ? (stamp ? (q.rev ?? 1) : s.answers[q.id]?.rev) : undefined
        if (rev) next.rev = rev
        const answers = { ...s.answers, [q.id]: next }
        // Date de la réponse qui complète le questionnaire rapide, ou le complète de nouveau après l'ajout d'une question
        const completes = essentialComplete(bank, answers) && !(s.essentialDoneAt && essentialComplete(bank, s.answers))
        const essentialDoneAt = completes ? new Date().toISOString() : s.essentialDoneAt
        return { ...s, answers, essentialDoneAt }
      }),
    [tracking, bank],
  )
  const [revisionTotal, setRevisionTotal] = useState(0)
  useEffect(() => {
    if (route.name === 'revision') setRevisionTotal(stale.length)
    // le total est figé à l'entrée dans la feuille de révision
  }, [route.name])
  const eraseAll = useCallback(() => {
    clearAll()
    setState(freshState(election.id, election.dataVersion))
    go('/')
  }, [election.id, election.dataVersion])

  const routeKey =
    route.name === 'sheet'
      ? `${route.name}:${route.tier}:${route.index}`
      : route.name === 'revision'
        ? `revision:${stale[0]?.id ?? ''}`
        : route.name === 'candidate'
          ? `candidate:${route.id}`
          : route.name
  useEffect(() => {
    const who = route.name === 'candidate' ? pack.candidates.find(c => c.id === route.id)?.name : null
    document.title =
      route.name === 'home' ? `Isoloir · ${election.shortName}` : `${who ?? titleFor(route)} · Isoloir`
    // À chaque changement d'écran ou de question, le focus va au titre (annoncé par les lecteurs d'écran)
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
    // routeKey résume la route : inutile de dépendre de l'objet route lui-même
  }, [routeKey, election.shortName, pack.candidates])

  // Question hors bornes ou liste vide : redirection sans entrée d'historique supplémentaire
  const list = route.name === 'sheet' ? (route.tier === 'essentiel' ? essential : deep) : null
  const missing = (!!list && list.length === 0) || (route.name === 'revision' && stale.length === 0)
  useEffect(() => {
    if (!missing) return
    if (route.name === 'sheet') replace(route.tier === 'essentiel' ? '/' : '/approfondir')
    if (route.name === 'revision') replace('/resultats')
  }, [missing, route])

  return (
    <>
      <SkipLink />
      {renderRoute()}
      {/* Le lecteur vidéo, par-dessus l'écran courant (« Les sujets », une question, la page des vidéos) */}
      <VideoHost pack={pack} start={route.name === 'videos' ? route.start : undefined} />
    </>
  )

  function renderRoute() {
    switch (route.name) {
      case 'sheet': {
        const items = list ?? []
        const q = items[Math.min(route.index, items.length - 1)]
        if (!q) return null
        const index = items.indexOf(q)
        const essentialTier = route.tier === 'essentiel'
        const base = essentialTier ? '/feuille' : '/approfondi'
        const answered = items.filter(x => isAnswered(state.answers[x.id])).length
        // Premier dépouillement : la feuille compte d'abord sur 8, et s'arrête au résultat provisoire
        const step1 = essentialTier ? firstStepSize(items) : 0
        const inStep1 = index < step1
        const step2Seen = items.slice(step1).some(x => state.answers[x.id])
        return (
          <Sheet
            title={essentialTier ? 'Feuille de pointage' : 'Feuille complémentaire'}
            question={q}
            approaches={seededShuffle(q.approaches, `${state.seed}:${q.id}`)}
            topic={bank.topics.find(t => t.id === q.topicId)}
            index={index}
            total={inStep1 ? step1 : items.length}
            answered={answered}
            answer={state.answers[q.id]}
            hint={index === 0}
            onChange={a => setAnswer(q, a)}
            onBack={() => go(index === 0 ? (essentialTier ? '/' : '/approfondir') : `${base}/${index}`)}
            onNext={() => {
              if (!isAnswered(state.answers[q.id])) setAnswer(q, SKIPPED)
              if (step1 > 0 && index + 1 === step1 && !step2Seen) go('/resultats')
              else if (index + 1 < items.length) go(`${base}/${index + 2}`)
              else go(essentialTier ? '/priorites' : '/resultats')
            }}
          />
        )
      }
      case 'revision': {
        const q = stale[0]
        if (!q) return null
        const total = Math.max(revisionTotal, stale.length)
        const answer = state.answers[q.id]
        return (
          <Sheet
            title="Feuille de révision"
            question={q}
            approaches={seededShuffle(q.approaches, `${state.seed}:${q.id}`)}
            topic={bank.topics.find(t => t.id === q.topicId)}
            index={total - stale.length}
            total={total}
            answered={total - stale.length}
            answer={answer}
            notice={
              <p class="notice revision-notice">
                Cette question a changé depuis votre réponse. Relisez-la, ajustez votre avis si besoin, puis validez.
              </p>
            }
            nextLabel="Valider"
            onChange={a => setAnswer(q, a, false)}
            onBack={() => go('/resultats')}
            onNext={() => setAnswer(q, answer && isAnswered(answer) ? answer : SKIPPED)}
          />
        )
      }
      case 'priorities':
        return <Priorities pack={pack} state={state} update={update} essential={essential} />
      case 'results':
        return (
          <Results pack={pack} state={state} results={results} update={update} eraseAll={eraseAll} essential={essential} stale={stale} saved={saved} />
        )
      case 'proximity':
        return <Proximity pack={pack} state={state} results={results} />
      case 'deepen':
        return <Deepen pack={pack} state={state} results={results} update={update} />
      case 'share':
        return <Share pack={pack} state={state} results={results} />
      case 'method':
        return <Method pack={pack} anchor={route.anchor} />
      case 'privacy':
        return <Privacy eraseAll={eraseAll} />
      case 'legal':
        return <Legal pack={pack} seed={state.seed} />
      case 'candidates':
        return <CandidatesIndex pack={pack} state={state} />
      case 'candidate':
        return <CandidatePage pack={pack} candidateId={route.id} state={state} />
      case 'topics':
        return <Topics pack={pack} state={state} essential={essential} anchor={route.anchor} />
      case 'videos':
        return <Videos pack={pack} state={state} essential={essential} />
      default:
        return (
          <Home pack={pack} state={state} essential={essential} stale={stale} setState={setState} eraseAll={eraseAll} saved={saved} />
        )
    }
  }
}

/** Lien d'évitement : déplace le focus sans toucher au routage par « # » */
function SkipLink() {
  return (
    <a
      class="skip"
      href="#contenu"
      onClick={e => {
        e.preventDefault()
        document.getElementById('contenu')?.focus()
      }}
    >
      Aller au contenu
    </a>
  )
}

function titleFor(route: Route): string {
  switch (route.name) {
    case 'sheet':
      return `Question ${route.index + 1}`
    case 'revision':
      return 'Révision'
    case 'priorities':
      return 'Vos priorités'
    case 'results':
      return 'Votre dépouillement'
    case 'proximity':
      return 'Qui porte quoi'
    case 'deepen':
      return 'Approfondir'
    case 'share':
      return 'Partager'
    case 'method':
      return 'Méthode'
    case 'privacy':
      return 'Confidentialité'
    case 'legal':
      return 'Mentions légales'
    case 'candidates':
      return 'Les candidats'
    case 'candidate':
      return 'Candidat'
    case 'topics':
      return 'Les sujets'
    case 'videos':
      return 'Les sujets en vidéo'
    default:
      return 'Isoloir'
  }
}
