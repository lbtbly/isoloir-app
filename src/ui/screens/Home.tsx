import { useMemo, useRef, useState } from 'preact/hooks'
import { go } from '../../app'
import { firstStepSize } from '../../core/order'
import { isAnswered } from '../../core/answers'
import { MAX_IMPORT_BYTES, parseImport } from '../../core/exportData'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { AI_METHOD_HREF } from '../components/AiLabel'
import { AirplaneSection } from '../components/Airplane'
import { ConfirmErase } from '../components/ConfirmErase'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { Journey } from '../components/Journey'
import { SiteFooter } from '../components/SiteFooter'
import { FilmPlayer } from '../film/Player'
import { CTA_NOTE } from '../film/script'
import { BlindDiagram, FlowDiagram, MethodDiagram } from '../components/Diagrams'
import { Stamp } from '../components/Stamp'
import { seededShuffle } from '../../core/rng'
import { formatDayRange, formatMoment } from '../format'
import { useReveal } from '../useReveal'

interface Props {
  pack: ElectionPack
  state: SessionState
  essential: Question[]
  /** Questions changées sur le fond depuis la réponse, à revoir */
  stale: Question[]
  setState: (s: SessionState) => void
  eraseAll: () => void
  /** false si le navigateur refuse d'enregistrer la progression */
  saved: boolean
}

export function Home({ pack, state, essential, stale, setState, eraseAll, saved }: Props) {
  const { election } = pack
  const file = useRef<HTMLInputElement>(null)
  const sheet = useRef<HTMLElement>(null)
  // Sous le héros, chaque bloc entre à l'écran d'un léger glissé ; les trois panneaux du parcours ensemble
  useReveal(
    sheet,
    '.home-proof, .section-title, .airplane-grid > *, .g-item, .people-lede, .people-strip > li',
    [['.journey', '.journey-panel']],
  )
  const [importError, setImportError] = useState<string | null>(null)
  const [pending, setPending] = useState<{ state: SessionState; note: string } | null>(null)

  const seen = essential.filter(q => state.answers[q.id]).length
  const answered = essential.filter(q => isAnswered(state.answers[q.id])).length
  const done = seen === essential.length && essential.length > 0
  const firstOpen = essential.findIndex(q => !state.answers[q.id])
  const started = seen > 0
  const step1 = firstStepSize(essential)
  const step1Done = step1 > 0 && essential.slice(0, step1).every(q => state.answers[q.id])
  // Questionnaire déjà complété une fois, puis rouvert par l'ajout de questions : on le dit, et on y mène
  const added = !done && state.essentialDoneAt ? essential.length - seen : 0

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
  // Ordre tiré au hasard par personne, comme partout où les candidats ne sont pas classés
  const people = useMemo(() => seededShuffle(pack.candidates, `${state.seed}:people`), [pack.candidates, state.seed])
  const startHref = done ? '#/resultats' : `#/feuille/${(firstOpen < 0 ? 0 : firstOpen) + 1}`
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
            Textes rédigés par IA, vérifiés automa&shy;tique&shy;ment&nbsp;: <a href={AI_METHOD_HREF}>en savoir plus</a>
          </span>
        </li>
      </ul>
      <div class="hero-stamp">
        <Stamp label="Positions arrêtées au" date={election.dataFrozenAt} />
      </div>
    </div>
  )

  // La note sous l'appel final du film : la promesse au premier passage ; ensuite, l'état de la feuille
  // est dit sous le film, pour tout le monde et à tout moment
  const ctaNote = started ? '' : CTA_NOTE
  const shortLabel = done ? 'Mon dépouillement' : added ? 'Répondre' : started ? 'Reprendre' : 'Commencer'

  return (
    <div class="screen screen-home">
      {/* Une seule barre : l'en-tête porte l'appel principal, toujours visible */}
      <FormHeader title={election.shortName} home action={{ href: startHref, label: startLabel, short: shortLabel }} />
      <main class="sheet home-sheet" id="contenu" tabIndex={-1} ref={sheet}>
        <h1 class="sr-only" tabIndex={-1}>
          Isoloir : pointez les idées qui vous ressemblent
        </h1>
        {/* Le héros : le film du principe, sur un exemple fictif */}
        <section class="home-film" aria-label="Comment marche Isoloir, en cinq scènes">
          <FilmPlayer cta={{ href: startHref, label: startLabel, note: ctaNote }} />
        </section>

        {started || stale.length > 0 ? (
          <div class="home-status">
            {done && state.essentialDoneAt ? (
              <p class="progress-note done-note">
                Vous avez répondu aux {essential.length} questions le{' '}
                <time dateTime={state.essentialDoneAt}>{formatMoment(state.essentialDoneAt)}</time>.{' '}
                <a href="#/resultats">Voir mon dépouillement</a>
              </p>
            ) : added ? (
              <p class="notice" role="status">
                {added > 1 ? `${added} questions ont été ajoutées` : 'Une question a été ajoutée'} au questionnaire depuis vos
                réponses du <time dateTime={state.essentialDoneAt!}>{formatMoment(state.essentialDoneAt)}</time>. Vos autres
                réponses sont gardées ; votre dépouillement reste visible en attendant.{' '}
                <a href="#/resultats">Voir mon dépouillement</a>
              </p>
            ) : started ? (
              <p class="progress-note">
                Feuille en cours : {answered} réponse{answered > 1 ? 's' : ''} sur {essential.length} questions.
                {step1Done && !done ? (
                  <>
                    {' '}
                    <a href="#/resultats">Voir la tendance</a>
                  </>
                ) : null}
              </p>
            ) : null}
            {stale.length > 0 ? (
              <p class="notice" role="status">
                {stale.length} question{stale.length > 1 ? 's ont' : ' a'} changé depuis vos réponses.{' '}
                <a href="#/revision">{stale.length > 1 ? 'Les revoir' : 'La revoir'}</a>
              </p>
            ) : null}
          </div>
        ) : null}
        {proof}

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
                    Testé sur {audit.profiles.toLocaleString('fr-FR')} profils au hasard : chaque candidat arrive premier dans{' '}
                    {audit.minShare} à {audit.maxShare} % des cas.
                  </li>
                ) : null}
              </ul>
              <a class="g-link" href="#/methode">
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
              <a class="g-link" href="#/methode">
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
              <a class="g-link" href="#/confidentialite">
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
          <ul class="people-strip" aria-label="Candidats, dans un ordre tiré au hasard">
            {people.map(c => (
              <li key={c.id}>
                <a href={`#/candidat/${c.id}`} class="people-card">
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
          <a class="g-link" href="#/candidats">
            Tous les candidats et leurs positions
          </a>
        </section>

        <section class="home-more" aria-label="Autres actions">
          <div class="link-row">
            {done ? (
              <a class="btn-text" href={`#/feuille/1`}>
                Relire la feuille
              </a>
            ) : null}
            <button type="button" class="btn-text" onClick={() => file.current?.click()}>
              <Icon name="upload" />
              Reprendre depuis un fichier
            </button>
            <input ref={file} type="file" accept="application/json,.json" class="sr-only" tabIndex={-1} onChange={onImport} />
            {started ? <ConfirmErase onErase={eraseAll} /> : null}
          </div>
          {pending ? (
            <div class="notice" role="alert">
              <p>
                {started ? 'Remplacer la feuille en cours par celle du fichier ? ' : ''}
                {pending.note}
              </p>
              <span class="confirm">
                <button type="button" class="btn-text is-danger" onClick={() => apply(pending.state)}>
                  {started ? 'Remplacer ma feuille' : 'Continuer'}
                </button>
                <button type="button" class="btn-text" onClick={() => setPending(null)}>
                  Annuler
                </button>
              </span>
            </div>
          ) : null}
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
        </section>
      </main>
      <SiteFooter>
        {election.rounds.length ? (
          <p>
            Vote&nbsp;:{' '}
            {election.rounds.map((r, i) => (
              <span key={r.label}>
                {i > 0 ? '\u00a0; ' : ''}
                {r.label} {formatDayRange(r.start, r.end)}
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
      </SiteFooter>
    </div>
  )
}
