import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { go, link } from '../nav'
import { firstStepSize } from '../../core/order'
import { isAnswered } from '../../core/answers'
import { MAX_IMPORT_BYTES, parseImport } from '../../core/exportData'
import { profileAccess } from '../../core/profileAccess'
import { PROFILE_SEE, profileHome, profileWhen } from '../../core/resultsCopy'
import { currentAnswers } from '../../core/revisions'
import { axisOf } from '../../core/spectrum'
import type { Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question, Round } from '../../core/types'
import { AI_METHOD_PATH } from '../components/AiLabel'
import { AirplaneSection } from '../components/Airplane'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { ConfirmErase } from '../components/ConfirmErase'
import { ExternalLink } from '../components/ExternalLink'
import { ProfileBand, ProfilePeek } from '../components/ProfileEntry'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { Journey } from '../components/Journey'
import { HomeFooter } from '../components/SiteFooter'
import { FilmPlayer } from '../film/Player'
import { ctaNote as ctaNoteOf } from '../film/script'
import { BlindDiagram, FlowDiagram, MethodDiagram } from '../components/Diagrams'
import { Stamp } from '../components/Stamp'
import { seededShuffle } from '../../core/rng'
import { formatDayRange, formatMoment } from '../format'
import { useReveal } from '../useReveal'
import { prepareProfile } from '../profile/load'
import { hasTable } from '../table/load'
import { isMany } from '../many'
import { WelcomeBack } from './HomeBack'

const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })

/** Les jours d'un tour : « 9 et 10 octobre » sur deux jours, « 18 avril » (ou « 1er mai ») sur un seul */
function roundDays(round: Round): string {
  const end = DAY_MONTH.format(new Date(round.end))
  if (DAY_MONTH.format(new Date(round.start)) !== end) return formatDayRange(round.start, round.end)
  return end.replace(/^1 /, '1er ')
}

interface Props {
  pack: ElectionPack
  state: SessionState
  essential: Question[]
  /** Questions changées sur le fond depuis la réponse, à revoir */
  stale: Question[]
  /** Le dépouillement (src/app.tsx) : son affiche en tête de l'accueil, une fois les questions essentielles vues */
  results: Results
  setState: (s: SessionState) => void
  eraseAll: () => void
  /** false si le navigateur refuse d'enregistrer la progression */
  saved: boolean
}

export function Home({ pack, state, essential, stale, results, setState, eraseAll, saved }: Props) {
  const { election } = pack
  const file = useRef<HTMLInputElement>(null)
  // « Reprendre depuis un fichier » : le focus y revient quand l'action qu'on vient de quitter disparaît (effacement
  // confirmé, import annulé), plutôt que de tomber sur la page
  const importButton = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLElement>(null)
  // Sous le héros, chaque bloc entre à l'écran d'un léger glissé ; les trois panneaux du parcours ensemble
  useReveal(
    sheet,
    '.home-proof, .home-profile, .section-title, .airplane-grid > *, .g-item, .people-lede, .people-strip > li',
    [['.journey', '.journey-panel']],
  )
  const [importError, setImportError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ state: SessionState; note: string } | null>(null)
  const [erased, setErased] = useState(false)

  const seen = essential.filter(q => state.answers[q.id]).length
  const answered = essential.filter(q => isAnswered(state.answers[q.id])).length
  const done = seen === essential.length && essential.length > 0
  const firstOpen = essential.findIndex(q => !state.answers[q.id])
  const started = seen > 0
  const step1 = firstStepSize(essential)
  const step1Done = step1 > 0 && essential.slice(0, step1).every(q => state.answers[q.id])
  // Questionnaire déjà complété une fois, puis rouvert par l'ajout de questions : on le dit, et on y mène
  const added = !done && state.essentialDoneAt ? essential.length - seen : 0
  // Un dépouillement existe (questionnaire rapide terminé, au moins un avis compté) : l'accueil de retour en tête, le
  // film plus bas (demande du propriétaire du 14/10/2026). Tout passé, ou tout à revoir : l'accueil d'avant, qui le dit
  const back = done && results.answered > 0

  // « Mon profil politique » (élections dont la grille a un axe) : la même règle que la page et le dépouillement
  const axis = axisOf(election)
  const current = useMemo(() => currentAnswers(pack, state.answers), [pack, state.answers])
  const access = axis ? profileAccess(pack.bank.questions, essential, state.answers, current, state.essentialDoneAt) : null
  const ready = access?.state === 'pret'
  // Prête : la page se prépare quand le navigateur a un moment, pour s'ouvrir sans attendre ; jamais avant
  useEffect(() => {
    if (ready) prepareProfile()
  }, [ready])

  const apply = (next: SessionState) => {
    setPending(null)
    setState(next)
    go('/resultats')
  }

  const onImport = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    const f = input.files?.[0]
    input.value = ''
    if (!f) return
    if (f.size > MAX_IMPORT_BYTES) {
      setImportError('Ce fichier est trop volumineux pour être un double d’Isoloir.')
      return
    }
    const res = parseImport(await f.text(), pack)
    if (!res.ok) {
      setImportError(res.error)
      return
    }
    setImportError(null)
    const notes = [
      res.fromVersion ? 'Ce fichier date d’une version antérieure des données.' : '',
      res.dropped ? `${res.dropped} réponse${res.dropped > 1 ? 's' : ''} ne correspond${res.dropped > 1 ? 'ent' : ''} plus à une question et ser${res.dropped > 1 ? 'ont' : 'a'} ignorée${res.dropped > 1 ? 's' : ''}.` : '',
      res.review ? `${res.review} question${res.review > 1 ? 's ont' : ' a'} changé depuis : ${res.review > 1 ? 'elles seront' : 'elle sera'} à revoir.` : '',
    ].filter(Boolean)
    if (started || notes.length) setPending({ state: res.state, note: notes.join(' ') })
    else apply(res.state)
  }

  const stats = useMemo(() => {
    let entries = 0
    const sources = new Set<string>()
    for (const c of pack.candidates)
      for (const pos of Object.values(pack.positions[c.id] ?? {})) {
        entries++
        pos.sources.forEach(x => sources.add(x.url))
      }
    return { entries, sources: sources.size, questions: pack.bank.questions.length }
  }, [pack])
  const audit = election.audit
  const topicsById = useMemo(() => new Map(pack.bank.topics.map(t => [t.id, t])), [pack.bank.topics])
  // Ordre tiré au hasard par personne, comme partout où les candidats ne sont pas classés
  const people = useMemo(() => seededShuffle(pack.candidates, `${state.seed}:people`), [pack.candidates, state.seed])
  const startHref = done ? link('/resultats') : link(`/feuille/${(firstOpen < 0 ? 0 : firstOpen) + 1}`)
  const startLabel = done
    ? 'Voir mon dépouillement'
    : added
      ? `Répondre ${added > 1 ? `aux ${added} nouvelles questions` : 'à la nouvelle question'}`
      : started
        ? 'Reprendre la feuille'
        : 'Commencer la feuille'


  /** Sous le film : la liste de confiance et le tampon daté */
  const proof = (
    <div class="home-proof">
      <ul class="trust">
        <li>
          <Icon name="check" />
          Approches sans nom pendant les questions
        </li>
        <li>
          <Icon name="check" />
          {stats.entries} positions sourcées
        </li>
        <li>
          <Icon name="lock" />
          <span>
            Vos réponses restent chez vous&nbsp;: <a href="#fermez">vérifiez-le en mode avion</a>
          </span>
        </li>
        {/* Première exposition : questions, fiches et résumés sont rédigés par une IA, et on le dit d'emblée.
            Les césures conditionnelles d'« automa-tique-ment » ne servent qu'au texte très agrandi sur téléphone */}
        <li class="trust-ai">
          <Icon name="info" />
          <span>
            Textes rédigés par IA, vérifiés automa&shy;tique&shy;ment&nbsp;: <a href={link(AI_METHOD_PATH)}>en savoir plus</a>
          </span>
        </li>
      </ul>
      <div class="hero-stamp">
        <Stamp label="Positions arrêtées au" date={election.dataFrozenAt} />
      </div>
    </div>
  )

  // Son entrée : le bandeau une fois la page prête ; avant, l'aperçu fictif et quand elle s'affiche. Sous l'état de la
  // feuille pour qui a commencé ; pour un nouveau visiteur, après la liste de confiance, au premier défilement
  const profileEntry =
    !access || !axis ? null : ready ? (
      <ProfileBand cls="home-profile is-ready" title={PROFILE_SEE} text={profileHome(axis)} axis={axis} />
    ) : (
      <ProfilePeek text={profileHome(axis)} when={profileWhen(access.total, access.left, access.state === 'sans-avis')} />
    )
  const profileFirst = !!access && access.state !== 'vide'

  // La note sous l'appel final du film : la promesse au premier passage ; ensuite, l'état de la feuille
  // est dit sous le film, pour tout le monde et à tout moment
  const ctaNote = started ? '' : ctaNoteOf(pack.bank)
  const shortLabel = done ? 'Mon dépouillement' : added ? 'Répondre' : started ? 'Reprendre' : 'Commencer'

  return (
    <div class="screen screen-home">
      {/* Une seule barre : l'en-tête porte l'appel principal, toujours visible */}
      {/* Des questions à revoir : leur carte porte le seul aplat bleu de la vue, l'appel de l'en-tête passe au trait */}
      <FormHeader title={election.shortName} home action={{ href: startHref, label: startLabel, short: shortLabel, quiet: stale.length > 0 }} />
      <main class="sheet home-sheet" id="contenu" tabIndex={-1} ref={sheet}>
        {back ? (
          <WelcomeBack
            pack={pack}
            state={state}
            results={results}
            stale={stale}
            essentialCount={essential.length}
            profileReady={ready}
            profile={ready ? profileEntry : null}
          />
        ) : (
          <>
            <h1 class="sr-only" tabIndex={-1}>
              Isoloir : pointez les idées qui vous ressemblent
            </h1>
            {/* Le héros : le film du principe, sur un exemple fictif */}
            <section class="home-film" aria-label="Comment marche Isoloir, en cinq scènes">
              <FilmPlayer cta={{ href: startHref, label: startLabel, note: ctaNote }} />
            </section>
          </>
        )}

        {/* Où en est la feuille, sous le film (le questionnaire complet, c'est l'accueil de retour qui le dit) */}
        {!back && started ? (
          <div class="home-status">
            {done && state.essentialDoneAt ? (
              <p class="progress-note done-note">
                Vous avez répondu aux {essential.length} questions le{' '}
                <time dateTime={state.essentialDoneAt}>{formatMoment(state.essentialDoneAt)}</time>.{' '}
                <a href={link('/resultats')}>Voir mon dépouillement</a>
              </p>
            ) : added ? (
              <p class="notice" role="status">
                {added > 1 ? `${added} questions ont été ajoutées` : 'Une question a été ajoutée'} au questionnaire depuis vos
                réponses du <time dateTime={state.essentialDoneAt!}>{formatMoment(state.essentialDoneAt)}</time>. Vos autres
                réponses sont gardées ; votre dépouillement reste visible en attendant.{' '}
                <a href={link('/resultats')}>Voir mon dépouillement</a>
              </p>
            ) : started ? (
              <p class="progress-note">
                {/* Les questions vues, répondues ou passées : le compte de la tendance et de l'aperçu de « Mon profil
                    politique », juste dessous (17 restent quand 5 sur 22 sont vues) */}
                Feuille en cours : {seen} question{seen > 1 ? 's' : ''} sur {essential.length}
                {seen > answered ? `, dont ${seen - answered} passée${seen - answered > 1 ? 's' : ''}` : ''}.
                {step1Done && !done ? (
                  <>
                    {' '}
                    <a href={link('/resultats')}>Voir la tendance</a>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : null}
        {!back ? <ChangedQuestions questions={stale} topics={topicsById} /> : null}
        {back ? (
          <>
            {/* Le film, pour qui veut revoir le principe ; la page prête, son bandeau est sous l'affiche (HomeBack). Le
                titre n'est pas un intertitre : chaque scène du film en porte un, au même niveau, sous le h1 de la page */}
            <section class="home-film is-back" aria-labelledby="film-title">
              <p id="film-title" class="section-title">
                Comment marche Isoloir
              </p>
              <FilmPlayer cta={{ href: startHref, label: startLabel, note: '' }} />
            </section>
            {ready ? null : profileEntry}
            {proof}
          </>
        ) : (
          <>
            {profileFirst ? profileEntry : null}
            {proof}
            {profileFirst ? null : profileEntry}
          </>
        )}

        <Journey />

        <AirplaneSection />

        <section class="guarantees" aria-labelledby="g-title">
          <h2 id="g-title" class="section-title">
            Pourquoi vous pouvez vous y fier
          </h2>
          <div class="g-grid">
            <article class="g-item" aria-labelledby="g1">
              <h3 id="g1">Sans biais</h3>
              <BlindDiagram />
              <ul class="g-facts">
                <li>L’ordre des approches et des thèmes est tiré au hasard pour chacun.</li>
                <li>Chaque formulation est vérifiée automatiquement pour ne trahir aucun candidat.</li>
                {audit ? (
                  <li>
                    Testé sur {audit.profiles.toLocaleString('fr-FR')} profils au hasard : chaque candidat
                    {election.ranking?.excluded ? ' (hors les non classés)' : null} arrive premier dans {audit.minShare} à{' '}
                    {audit.maxShare} % des cas.
                  </li>
                ) : null}
              </ul>
              <a class="g-link" href={link('/methode')}>
                La méthode de calcul
              </a>
            </article>
            <article class="g-item" aria-labelledby="g2">
              <h3 id="g2">Des positions sourcées</h3>
              <MethodDiagram />
              <ul class="g-facts">
                <li>
                  {stats.entries} positions, {stats.sources} sources publiques, {stats.questions} questions.
                </li>
                <li>Chaque position est résumée par une IA, puis vérifiée automatiquement contre sa source.</li>
                <li>Une position douteuse devient « inconnue » : jamais de supposition.</li>
                <li>Chaque source est consultable après le dépouillement.</li>
              </ul>
              <a class="g-link" href={link('/methode')}>
                Méthode et sources
              </a>
            </article>
            <article class="g-item" aria-labelledby="g3">
              <h3 id="g3">Confidentialité par construction</h3>
              <FlowDiagram />
              <ul class="g-facts">
                <li>Ni compte, ni cookie, ni mesure d’audience, ni serveur qui reçoive vos réponses.</li>
                <li>
                  Isoloir n’envoie jamais vos opinions politiques, que le RGPD protège tout particulièrement&nbsp;: elles
                  restent sur votre appareil.
                </li>
                <li>Vous seul décidez de télécharger ou de partager votre résultat.</li>
              </ul>
              <a class="g-link" href={link('/confidentialite')}>
                Comment c’est garanti
              </a>
            </article>
          </div>
        </section>

        <section class="home-people" aria-labelledby="people-title">
          <h2 id="people-title" class="section-title">
            Les candidats
          </h2>
          <p class="people-lede">
            Leur parcours, leur site de campagne et chacune de leurs positions, avec ses sources. Pour un résultat sans a
            priori, répondez d’abord : les approches du questionnaire sont présentées sans nom.
          </p>
          {/* Une vingtaine de candidats : petits portraits, plus de colonnes, et toujours tous, dans le même ordre tiré au hasard */}
          <ul
            class={`people-strip${isMany(people.length) ? ' is-many' : ''}`}
            aria-label="Candidats, dans un ordre tiré au hasard"
          >
            {people.map(c => (
              <li key={c.id}>
                <a href={link(`/candidat/${c.id}`)} class="people-card">
                  {c.photo ? (
                    <img class="portrait is-strip" src={c.photo.src} alt="" loading="lazy" />
                  ) : (
                    <span class="portrait is-strip is-initials" aria-hidden="true">
                      {c.initials}
                    </span>
                  )}
                  <span class="people-name">{c.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <a class="g-link" href={link('/candidats')}>
            Tous les candidats et leurs positions
          </a>
        </section>
      </main>
      {/* Le pied de l'accueil, pleine largeur sur fond d'encre (demande du propriétaire du 2026-10-15) : les actions sur
          la feuille, « À table », et la mention et les notices du pied commun */}
      <HomeFooter
        table={hasTable(election)}
        lede={
          !saved
            ? undefined
            : started
              ? 'Elle reste sur cet appareil. Pour la reprendre ailleurs, téléchargez son double depuis le dépouillement.'
              : 'Commencée sur un autre appareil\u00a0? Reprenez-la depuis son double, le fichier téléchargé au dépouillement.'
        }
        actions={
          <>
            {done ? (
              <li>
                <a class="btn-text" href={link(`/feuille/1`)}>
                  <Icon name="reread" />
                  Relire la feuille
                </a>
              </li>
            ) : null}
            <li>
              <button type="button" class="btn-text" ref={importButton} onClick={() => file.current?.click()}>
                <Icon name="upload" />
                Reprendre depuis un fichier
              </button>
              {/* Hors de l'arbre d'accessibilité : le bouton ci-dessus porte l'action, le champ n'en est que l'outil */}
              <input
                ref={file}
                type="file"
                accept="application/json,.json"
                class="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={onImport}
              />
            </li>
            {started ? (
              <li>
                <ConfirmErase
                  onErase={() => {
                    eraseAll()
                    // Tout effacer, c'est aussi oublier un import en attente
                    setPending(null)
                    setImportError(null)
                    setErased(true)
                    requestAnimationFrame(() => importButton.current?.focus())
                  }}
                />
              </li>
            ) : null}
          </>
        }
        notes={
          <>
            {pending ? (
              <div class="notice" role="alert">
                <p>
                  {started ? 'Remplacer la feuille en cours par celle du fichier\u00a0? ' : ''}
                  {pending.note}
                </p>
                <span class="confirm">
                  <button type="button" class="btn-text is-danger" onClick={() => apply(pending.state)}>
                    {started ? 'Remplacer ma feuille' : 'Continuer'}
                  </button>
                  <button
                    type="button"
                    class="btn-text"
                    onClick={() => {
                      setPending(null)
                      importButton.current?.focus()
                    }}
                  >
                    Annuler
                  </button>
                </span>
              </div>
            ) : null}
            {/* Toujours présente, pour que l'annonce soit lue ; l'avis s'efface dès qu'une feuille recommence */}
            <div role="status">{erased && !started ? <p class="notice">Vos réponses ont été effacées de cet appareil.</p> : null}</div>
            {importError ? (
              <p class="error" role="alert">
                {importError}
              </p>
            ) : null}
            {!saved ? (
              <p class="notice" role="status">
                Ce navigateur n’enregistre pas votre progression (navigation privée ou stockage bloqué). Vous pourrez
                télécharger votre double depuis les résultats.
              </p>
            ) : null}
          </>
        }
      >
        {election.rounds.length ? (
          <p>
            Vote&nbsp;:{' '}
            {election.rounds.map((r, i) => (
              <span key={r.label}>
                {i > 0 ? '\u00a0; ' : ''}
                {r.label} {roundDays(r)}
              </span>
            ))}
            {election.officialUrl ? (
              <>
                . Conditions sur{' '}
                <ExternalLink href={election.officialUrl}>{election.officialUrl.replace(/^https?:\/\//, '')}</ExternalLink>
              </>
            ) : null}
            .
          </p>
        ) : null}
      </HomeFooter>
    </div>
  )
}
