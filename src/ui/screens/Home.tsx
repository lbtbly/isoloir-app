import { useEffect, useMemo, useRef } from 'preact/hooks'
import { link } from '../nav'
import { firstStepSize } from '../../core/order'
import { isAnswered } from '../../core/answers'
import { profileAccess } from '../../core/profileAccess'
import { PEEK_GO, PROFILE_READY, PROFILE_SEE, profileHome, profileWhen } from '../../core/resultsCopy'
import { currentAnswers } from '../../core/revisions'
import { axisOf } from '../../core/spectrum'
import type { Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { AI_METHOD_PATH } from '../components/AiLabel'
import { AirplaneSection } from '../components/Airplane'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { ProfilePeek } from '../components/ProfileEntry'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { Journey } from '../components/Journey'
import { SiteFooter } from '../components/SiteFooter'
import { FilmPlayer } from '../film/Player'
import { ctaNote as ctaNoteOf } from '../film/script'
import { BlindDiagram, FlowDiagram, MethodDiagram } from '../components/Diagrams'
import { Stamp } from '../components/Stamp'
import { seededShuffle } from '../../core/rng'
import { formatMoment } from '../format'
import { useReveal } from '../useReveal'
import { prepareProfile } from '../profile/load'
import { isMany } from '../many'
import { AppWelcome, useAppWelcome } from '../install/Welcome'
import { WelcomeBack } from './HomeBack'

interface Props {
  pack: ElectionPack
  state: SessionState
  essential: Question[]
  /** Questions changées sur le fond depuis la réponse, à revoir */
  stale: Question[]
  /** Le dépouillement (src/app.tsx) : son affiche en tête de l'accueil, une fois les questions essentielles vues */
  results: Results
}

export function Home({ pack, state, essential, stale, results }: Props) {
  const { election } = pack
  const sheet = useRef<HTMLElement>(null)
  // Sous le héros, chaque bloc entre à l'écran d'un léger glissé ; les trois panneaux du parcours ensemble
  useReveal(
    sheet,
    '.home-proof, .home-profile, .section-title, .airplane-grid > *, .g-item, .people-lede, .people-strip > li',
    [['.journey', '.journey-panel']],
  )

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

  // Son entrée : le même cadre à tous les états (demande du propriétaire du 17/10/2026), la grille fictive et ce que
  // montre la page ; avant la page, quand elle s'affiche et « Voir où j’en suis et un exemple » ; prête, « Le vôtre est
  // prêt » et « Voir mon profil politique ». Dès la première réponse, la mention au-dessus de la grille : ce ne sont pas
  // ses réponses. Questions ajoutées : « de nouveau » seulement si la page s'est déjà affichée (au moins un avis). Sous
  // l'affiche de l'accueil de retour ; sous l'état de la feuille pour qui a commencé ; pour un nouveau visiteur, après la
  // liste de confiance, au premier défilement
  const mine = !!access && access.state !== 'vide'
  const profileEntry =
    !access || !axis ? null : (
      <ProfilePeek
        ready={ready}
        text={profileHome(axis)}
        when={ready ? PROFILE_READY : profileWhen(access.total, access.left, access.state === 'sans-avis', access.added)}
        mine={mine}
        go={ready ? PROFILE_SEE : PEEK_GO}
      />
    )

  // La note sous l'appel final du film : la promesse au premier passage ; ensuite, l'état de la feuille
  // est dit sous le film, pour tout le monde et à tout moment
  const ctaNote = started ? '' : ctaNoteOf(pack.bank)
  const shortLabel = done ? 'Mon dépouillement' : added ? 'Répondre' : started ? 'Reprendre' : 'Commencer'
  // L'application installée ouverte vide, là où elle a son propre espace : l'avis « Vous aviez répondu dans Safari ? »
  const [welcome, closeWelcome] = useAppWelcome(Object.keys(state.answers).length === 0)

  return (
    <div class="screen screen-home">
      {/* Une seule barre : l'en-tête porte l'appel principal, toujours visible */}
      {/* Des questions à revoir, ou l'avis de l'application ouverte vide : leur carte porte le seul aplat bleu de la vue,
          l'appel de l'en-tête passe au trait */}
      <FormHeader title={election.shortName} home action={{ href: startHref, label: startLabel, short: shortLabel, quiet: stale.length > 0 || welcome }} />
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
            {welcome ? <AppWelcome onClose={closeWelcome} /> : null}
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
            {/* Le film, pour qui veut revoir le principe ; la page prête, son cadre est sous l'affiche (HomeBack). Le
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
            {mine ? profileEntry : null}
            {proof}
            {mine ? null : profileEntry}
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
      <SiteFooter />
    </div>
  )
}
