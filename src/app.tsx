import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { isAnswered } from './core/answers'
import { firstStepSize, orderedQuestions } from './core/order'
import { currentAnswers, staleQuestions } from './core/revisions'
import { seededShuffle } from './core/rng'
import { computeResults } from './core/score'
import { parseLocation, resolvePlace, type Resolved, type Route } from './core/routes'
import { clearAll, essentialComplete, freshState, loadState, saveState, storageKey, type SessionState } from './core/storage'
import type { Answer, ElectionPack, Question } from './core/types'
import { ELECTIONS, RETIRED_PREFIXES, loadElection, loadedElection, type ElectionEntry } from './elections'
import { ElectionFrame } from './ui/components/ElectionFrame'
import { FormHeader } from './ui/components/FormHeader'
import { go, replace, setBase } from './ui/nav'
import { Sheet } from './ui/questionnaire/Sheet'
import { Deepen } from './ui/screens/Deepen'
import { Home } from './ui/screens/Home'
// La Méthode, la Confidentialité, les Mentions légales et « Partager » sont chargés à la demande (ui/screens/load.ts).
// Le style des notices reste dans la feuille de style de la page, à la place qu'y donnait l'import de la Méthode : rien
// ne change dans l'ordre des règles, ni à l'affichage d'une notice le temps qu'elle arrive
import './styles/legal.css'
// « Continuer sur un autre appareil » (chargé à la demande) : son style dans la feuille de la page, comme les notices
import './styles/transfer.css'
import { Priorities } from './ui/screens/Priorities'
import { Proximity } from './ui/screens/Proximity'
import { Results } from './ui/screens/Results'
import { CandidatePage, CandidatesIndex } from './ui/screens/Candidates'
import { legalScreen, methodScreen, prepareScreens, privacyScreen, shareScreen, transferScreen } from './ui/screens/load'
import { clearSelections } from './ui/compare/selection'
import { compareNow, loadCompare } from './ui/compare/load'
import { loadProfile, profileNow } from './ui/profile/load'
import { hasTable, setTableElection, tableLocked, tableScreen } from './ui/table/load'
import { useOnDemand, type OnDemand } from './ui/lazy'
import { axisOf } from './core/spectrum'
import { Topics } from './ui/screens/Topics'
import { Videos } from './ui/screens/Videos'
import { useOnline } from './ui/useOnline'
import { VideoHost } from './ui/videos/Host'
import { hasVideos, setVideoScope } from './ui/videos/load'
import './styles/shell.css'

/**
 * L'élection et la page de l'adresse courante. Une adresse à corriger (alias, ancienne page, ancien lien vers
 * un candidat masqué ou d'une élection archivée, adresse d'une élection retirée du site) l'est sur-le-champ, sans
 * nouvelle entrée d'historique : les écrans ne voient que l'adresse corrigée.
 */
export function locate(): Resolved<ElectionEntry> {
  const hash = window.location.hash
  const place = resolvePlace(parseLocation(hash), ELECTIONS, RETIRED_PREFIXES)
  if (place.redirect && place.redirect !== hash) history.replaceState(history.state, '', place.redirect)
  return place
}

/**
 * Le site : choisit l'élection d'après l'adresse, la charge si besoin (un fichier à part pour chacune), puis
 * la rend. Changer d'élection remonte tout l'écran (key) : la feuille, les réponses et les réglages de l'une ne
 * passent jamais à l'autre.
 */
export function App() {
  const [place, setPlace] = useState(() => locate())
  const [failed, setFailed] = useState<string | null>(null)
  const [, setReady] = useState(0)
  /** La dernière élection rendue : à l'arrivée sur une autre, le focus va à son titre */
  const shown = useRef<string | null>(null)

  useEffect(() => {
    const onHash = () => {
      // Seuls les chemins « #/… » sont des routes : une ancre interne ne change pas d'écran
      if (window.location.hash && !window.location.hash.startsWith('#/')) return
      setPlace(locate())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const { election: entry, route } = place
  // Les liens des écrans prennent le préfixe de l'élection affichée : fixé avant de les rendre
  setBase(entry.slug)
  const pack = loadedElection(entry.id)

  useEffect(() => {
    if (pack) return
    let alive = true
    setFailed(null)
    loadElection(entry).then(
      () => alive && setReady(n => n + 1),
      () => alive && setFailed(entry.id),
    )
    return () => {
      alive = false
    }
  }, [entry, pack])

  // Échec hors ligne : on réessaie de soi-même dès que le réseau revient
  useEffect(() => {
    if (!failed) return
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [failed])

  if (pack) {
    const focus = shown.current !== null && shown.current !== entry.id
    shown.current = entry.id
    // Les vidéos montrées sont celles de cette élection, sous ses thèmes : fixé avant de la rendre ; de même, l'entrée
    // « À table » du menu
    setVideoScope(pack)
    setTableElection(pack.election)
    return <ElectionApp key={entry.id} pack={pack} route={route} focusOnMount={focus} />
  }
  if (failed === entry.id) return <LoadFailed onRetry={retry} />
  return <Loading />
}

/**
 * Réessayer : la page se recharge. Le navigateur garde l'échec d'un import() pour la visite (un second import()
 * du même fichier échoue sans rien redemander) ; la feuille, elle, est enregistrée sur l'appareil.
 */
const retry = () => window.location.reload()

/** Pendant le chargement d'une élection : rien pendant un court instant (pas d'éclair), puis une ligne d'état */
function Loading({ what = 'des questions' }: { what?: string }) {
  return (
    <div class="screen shell-loading" aria-busy="true">
      <FormHeader />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <p class="lede" role="status">
          Chargement {what}…
        </p>
      </main>
    </div>
  )
}

/** L'élection n'a pas pu être chargée : hors ligne avant que la copie hors ligne ne soit en place, le plus souvent */
function LoadFailed({ onRetry, what = 'Les questions de cette élection' }: { onRetry: () => void; what?: string }) {
  const online = useOnline()
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => title.current?.focus({ preventScroll: true }), [])
  return (
    <div class="screen">
      <FormHeader />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1} ref={title}>
          {online ? 'Le chargement a échoué.' : 'Vous êtes hors ligne.'}
        </h1>
        <p class="lede">
          {online
            ? `${what} n’ont pas pu être téléchargées. Vérifiez votre connexion, puis réessayez.`
            : `${what} ne sont pas encore sur cet appareil. Rétablissez la connexion\u00a0: elles se téléchargent une fois, puis tout marche hors ligne.`}
        </p>
        <p>
          <button type="button" class="btn-primary" onClick={onRetry}>
            Réessayer
          </button>
        </p>
      </main>
    </div>
  )
}

const SKIPPED: Answer = { ratings: {}, redLines: [], skipped: true }

interface ElectionProps {
  pack: ElectionPack
  route: Route
  /** Arrivée depuis une autre élection : le focus va au titre de l'écran, comme à tout changement d'écran */
  focusOnMount: boolean
}

/** La route de la table, imposée tant qu'une table est en cours */
const TABLE_ROUTE: Route = { name: 'table' }

/** Une élection : sa feuille enregistrée, ses écrans et le lecteur vidéo */
function ElectionApp({ pack, route: asked, focusOnMount }: ElectionProps) {
  const { election, bank } = pack
  // « À table » en cours (ou interrompue par un rechargement) : aucune autre page ne s'affiche, même par une adresse
  // tapée ou un lien gardé ; l'adresse est remise sur la table juste après
  const route = tableLocked() && asked.name !== 'table' ? TABLE_ROUTE : asked
  useEffect(() => {
    if (route !== asked) replace('/a-table')
  }, [route, asked])
  const [state, setState] = useState<SessionState>(() => loadState(pack))
  const [saved, setSaved] = useState(true)
  const firstRender = useRef(!focusOnMount)
  const remote = useRef(false)

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
  // Les notices et « Partager », chargés à la demande : le pied de page et le dépouillement y mènent ; ils se
  // préparent quand le navigateur a un moment, pour s'ouvrir sans attendre
  useEffect(() => prepareScreens(), [])

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
  // Un écran chargé à la demande remplace l'écran d'attente : on rend de nouveau, pour que les mesures de l'en-tête
  // et de la barre du bas (ci-dessus) suivent leurs nouveaux éléments
  const [, setLoadedScreens] = useState(0)
  const [revisionTotal, setRevisionTotal] = useState(0)
  useEffect(() => {
    if (route.name === 'revision') setRevisionTotal(stale.length)
    // le total est figé à l'entrée dans la feuille de révision
  }, [route.name])
  const eraseAll = useCallback(() => {
    clearAll()
    // La sélection à comparer (en mémoire seulement) part avec le reste
    clearSelections()
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
          : route.name === 'compare'
            ? `compare:${route.ids.join(',')}`
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
  // Une élection sans vidéos (périmètre vide) n'a pas de page des vidéos : son adresse mène à l'accueil
  const noVideos = route.name === 'videos' && !hasVideos(pack)
  // Une élection sans axe de la grille des nuances (la primaire) n'a pas de page « Mon profil politique »
  const noProfile = route.name === 'profile' && !axisOf(election)
  // Une élection sans axe de la grille, ou archivée, n'a pas de table
  const noTable = route.name === 'table' && !hasTable(election)
  const missing = (!!list && list.length === 0) || (route.name === 'revision' && stale.length === 0) || noVideos || noProfile || noTable
  useEffect(() => {
    if (!missing) return
    if (route.name === 'sheet') replace(route.tier === 'essentiel' ? '/' : '/approfondir')
    if (route.name === 'revision' || route.name === 'profile') replace('/resultats')
    if (route.name === 'videos' || route.name === 'table') replace('/')
  }, [missing, route])

  // Le cadre de l'élection : son en-tête (bandeau d'archive) et son pied de page en lisent les phrases propres
  return (
    <ElectionFrame election={election}>
      <SkipLink />
      {renderRoute()}
      {/* Le lecteur vidéo, par-dessus l'écran courant (« Les sujets », une question, la page des vidéos) ; jamais pendant
          une table : son écouteur de l'historique rouvrirait une vidéo d'une entrée plus ancienne */}
      {route.name === 'table' ? null : <VideoHost pack={pack} start={route.name === 'videos' ? route.start : undefined} />}
    </ElectionFrame>
  )

  /**
   * Un écran chargé à la demande (ui/screens/load.ts), comme la comparaison : un écran d'attente le temps du
   * chargement ; arrivé par un lien (pas à l'ouverture de la page), le titre prend le focus une fois chargé
   */
  function onDemandScreen<M>(
    key: string,
    screen: OnDemand<M>,
    what: string,
    loading: string,
    render: (m: M) => preact.ComponentChildren,
  ) {
    return (
      <Lazy
        key={key}
        now={screen.now}
        load={screen.load}
        what={what}
        loading={loading}
        focusOnLoad={!firstRender.current}
        onLoaded={() => setLoadedScreens(n => n + 1)}
        render={render}
      />
    )
  }

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
              else if (essentialTier) go('/priorites')
              else {
                // Commencée par un thème touché sur « Mon profil politique » (Deepen.tsx), la feuille complémentaire
                // finit par les questions jamais vues qui le précèdent ; sinon, il n'y en a pas : le dépouillement
                const back = items.findIndex(x => x !== q && !state.answers[x.id])
                go(back < 0 ? '/resultats' : `${base}/${back + 1}`)
              }
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
      case 'profile':
        if (noProfile) return null
        // Chargée à la demande, comme la comparaison ; arrivée par un lien : le titre prend le focus une fois chargée
        return (
          <Lazy
            key="profile"
            now={profileNow}
            load={loadProfile}
            what="Les pages du profil politique"
            loading="du profil politique"
            focusOnLoad={!firstRender.current}
            onLoaded={() => setLoadedScreens(n => n + 1)}
            render={m => <m.Profile pack={pack} state={state} essential={essential} results={results} update={update} />}
          />
        )
      case 'deepen':
        return <Deepen pack={pack} state={state} results={results} update={update} topic={route.topic} />
      case 'share':
        return onDemandScreen('share', shareScreen, 'Les pages du partage', 'du partage', m => (
          <m.Share pack={pack} state={state} results={results} />
        ))
      case 'transfer':
        return onDemandScreen('transfer', transferScreen, 'La page pour un autre appareil', 'de la page', m => (
          <m.Transfer pack={pack} state={state} setState={setState} importing={!!route.import} />
        ))
      case 'method': {
        const anchor = route.anchor
        return onDemandScreen('method', methodScreen, 'Les pages de la méthode', 'de la méthode', m => (
          <m.Method pack={pack} anchor={anchor} />
        ))
      }
      case 'privacy':
        return onDemandScreen('privacy', privacyScreen, 'Les pages de la confidentialité', 'de la confidentialité', m => (
          <m.Privacy eraseAll={eraseAll} />
        ))
      case 'legal':
        return onDemandScreen('legal', legalScreen, 'Les mentions légales', 'des mentions légales', m => (
          <m.Legal pack={pack} seed={state.seed} />
        ))
      case 'candidates':
        return <CandidatesIndex pack={pack} state={state} />
      case 'candidate':
        return <CandidatePage pack={pack} candidateId={route.id} state={state} />
      case 'compare':
        // Arrivée par un lien (pas à l'ouverture de la page) : le titre prendra le focus une fois l'écran chargé
        return (
          <Lazy
            key="compare"
            now={compareNow}
            load={loadCompare}
            what="Les pages de la comparaison"
            loading="de la comparaison"
            focusOnLoad={!firstRender.current}
            onLoaded={() => setLoadedScreens(n => n + 1)}
            render={m => <m.Compare pack={pack} ids={route.ids} state={state} />}
          />
        )
      case 'topics':
        return <Topics pack={pack} state={state} essential={essential} anchor={route.anchor} />
      case 'videos':
        if (noVideos) return null
        return <Videos pack={pack} state={state} essential={essential} />
      case 'table':
        if (noTable) return null
        // La table ne reçoit que l'élection et le composant de la feuille : ni les réponses, ni de quoi les effacer
        return onDemandScreen('table', tableScreen, 'La table', 'de la table', m => <m.Table pack={pack} Sheet={Sheet} />)
      default:
        return (
          <Home pack={pack} state={state} essential={essential} stale={stale} results={results} setState={setState} eraseAll={eraseAll} saved={saved} />
        )
    }
  }
}

/**
 * Un écran chargé à la demande (la comparaison, ui/compare/load.ts ; « Mon profil politique », ui/profile/load.ts ; les
 * notices et « Partager », ui/screens/load.ts) : un écran d'attente le temps du chargement, puis l'écran ; arrivé par un
 * lien, le focus va alors à son titre, comme à tout changement d'écran. Un échec propose de réessayer. Chaque écran a sa
 * clé (key), pour ne pas reprendre le module d'un autre en passant de l'un à l'autre.
 */
function Lazy<M>({
  now,
  load,
  render,
  what,
  loading,
  focusOnLoad,
  onLoaded,
}: {
  now: () => M | null
  load: () => Promise<M>
  render: (m: M) => preact.ComponentChildren
  /** Sujet du message d'échec, au féminin pluriel : « Les pages de la comparaison » */
  what: string
  /** Complément de « Chargement… » : « de la comparaison » */
  loading: string
  focusOnLoad: boolean
  onLoaded: () => void
}) {
  const [mod, failed] = useOnDemand(now, load, () => {
    onLoaded()
    if (focusOnLoad) requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }))
  })
  if (mod) return <>{render(mod)}</>
  if (failed) return <LoadFailed onRetry={retry} what={what} />
  return <Loading what={loading} />
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
    case 'profile':
      return 'Mon profil politique'
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
    case 'compare':
      return 'Comparer les candidats'
    case 'topics':
      return 'Les sujets'
    case 'videos':
      return 'Les sujets en vidéo'
    case 'table':
      return 'À table'
    case 'transfer':
      return 'Transférer vos réponses'
    default:
      return 'Isoloir'
  }
}
