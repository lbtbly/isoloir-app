// Le pied de page, le même sur tous les écrans (demande du propriétaire du 2026-10-15) : pleine largeur, sur fond
// d'encre d'imprimerie, la feuille en négatif. En tête, le logo et les dates du vote ; dessous, des colonnes titrées :
// « Vos réponses » (les actions sur les réponses de cet appareil, fournies par l'application : FootContext.ts),
// « À table » (s'il y en a une), « Qui fait Isoloir » (la mention d'indépendance et d'usage de l'IA, les notices).
// Un seul composant pour tous les écrans : le changer ici le change partout. Seule la table en cours ne l'affiche pas
// (son pied fermé, ui/questionnaire/Sheet.tsx). Il suit le contenu, hors du <main> : c'est le pied de la page (repère
// « contentinfo »), au-dessus de la place réservée à la barre d'actions fixe. La mention et les dates sont celles de
// l'élection affichée (CurrentElection), reçue du cadre de l'élection : aucun écran n'a rien à lui passer.
import { useRef, useState } from 'preact/hooks'
import type { Round } from '../../core/types'
import { formatDayRange } from '../format'
import { currentPath, link } from '../nav'
import { axisOf } from '../../core/spectrum'
import { isInstalled } from '../../core/installed'
import { AI_METHOD_PATH } from './AiLabel'
import { ConfirmErase } from './ConfirmErase'
import { useCurrentElection } from './CurrentElection'
import { ExternalLink } from './ExternalLink'
import { useFootSheet } from './FootContext'
import { budgetShown } from '../budget/shown'
import { Icon } from './Icon'
import { Logo } from './Logo'
import '../../styles/footer.css'

/**
 * Les notices, dans l'ordre de lecture : comment l'outil est fait, ce qui y change, ce qu'il garde, qui le publie.
 * Chemins dans l'élection affichée ; « page » se lit sur le chemin sans préfixe d'élection.
 */
const LINKS = [
  { path: '/methode', label: 'Méthode et sources', page: /^\/methode(\/|$)/ },
  // Le journal des données, sorti de la Méthode le 17 octobre 2026 (décision du propriétaire)
  { path: '/journal', label: 'Journal des données', page: /^\/journal(\/|$)/ },
  { path: '/confidentialite', label: 'Confidentialité', page: /^\/confidentialite\/?$/ },
  { path: '/mentions-legales', label: 'Mentions légales', page: /^\/mentions-legales\/?$/ },
]

/** Hors d'une élection (aucun écran ne l'affiche ainsi aujourd'hui) : la mention sans organisateurs */
const INDEPENDENCE = 'sans lien avec les partis ni avec les candidats'

/** La mention d'indépendance et d'usage de l'IA */
function Independence() {
  const current = useCurrentElection()
  const independence = current?.election.copy.independence.footer ?? INDEPENDENCE
  return (
    <p>
      {/* Une seule chaîne jusqu'au lien : un seul nœud de texte, mis en page comme avant (même crénage) */}
      {`Outil indépendant, édité par un citoyen, ${independence}. Ses textes sont rédigés par une IA à partir des sources citées et vérifiés automatiquement\u00a0; ils ne sont pas relus un par un par une personne (`}
      <a href={link(AI_METHOD_PATH)}>usage de l’IA</a>). Le résultat est indicatif&nbsp;: ce n’est pas une consigne
      de vote.
    </p>
  )
}

/** Les liens vers les notices ; celle où l'on est est marquée */
function Notices() {
  const path = currentPath()
  return (
    <ul class="site-foot-links">
      {LINKS.map(item => (
        <li key={item.path}>
          <a href={link(item.path)} aria-current={item.page.test(path) ? 'page' : undefined}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

const DAY_MONTH = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })

/** Les jours d'un tour : « 9 et 10 octobre » sur deux jours, « 18 avril » (ou « 1er mai ») sur un seul */
function roundDays(round: Round): string {
  const end = DAY_MONTH.format(new Date(round.end))
  if (DAY_MONTH.format(new Date(round.start)) !== end) return formatDayRange(round.start, round.end)
  return end.replace(/^1 /, '1er ')
}

/** Les dates du vote et la page officielle qui en donne les conditions */
function Vote() {
  const election = useCurrentElection()?.election
  if (!election?.rounds.length) return null
  return (
    <div class="home-foot-vote">
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
    </div>
  )
}

/**
 * « Vos réponses » : relire, transférer ou importer ses réponses, reprendre depuis un fichier (le double, une image de
 * QR code ou un code), tout effacer ; avec, dessous, ce que ces actions ont à dire (import en attente, erreur,
 * effacement fait, stockage refusé). Les actions viennent de l'application (FootContext.ts)
 */
function SheetColumn() {
  const sheet = useFootSheet()
  const file = useRef<HTMLInputElement>(null)
  // « Reprendre depuis un fichier » : le focus y revient quand l'action qu'on vient de quitter disparaît (effacement
  // confirmé, import annulé), plutôt que de tomber sur la page
  const importButton = useRef<HTMLButtonElement>(null)
  const [pending, setPending] = useState<{ note: string; take: () => void } | null>(null)
  const [error, setError] = useState<string | null>(null)
  if (!sheet) return null
  const { started, done, saved, erased } = sheet

  const onImport = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement
    const f = input.files?.[0]
    input.value = ''
    if (!f) return
    const res = await sheet.read(f)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setError(null)
    if (started || res.notes.length) setPending({ note: res.notes.join(' '), take: res.take })
    else res.take()
  }

  const lede = !saved
    ? undefined
    : started
      ? 'Elles restent sur cet appareil. Pour les retrouver ailleurs, transférez-les.'
      : 'Vous avez commencé sur un autre appareil\u00a0? Importez vos réponses.'

  return (
    <section class="home-foot-col" aria-labelledby="foot-sheet">
      <h2 id="foot-sheet" class="home-foot-title">
        Vos réponses
      </h2>
      {lede ? <p class="home-foot-text">{lede}</p> : null}
      <ul class="home-foot-actions">
        {done ? (
          <li>
            <a class="btn-text" href={link(`/feuille/1`)}>
              <Icon name="reread" />
              Relire mes réponses
            </a>
          </li>
        ) : null}
        {started ? (
          <li>
            <a class="btn-text" href={link('/autre-appareil')}>
              <Icon name="qr" />
              Transférer mes réponses
            </a>
          </li>
        ) : null}
        <li>
          <a class="btn-text" href={link('/autre-appareil/importer')}>
            <Icon name="camera" />
            Importer mes réponses
          </a>
        </li>
        {/* « Installer l'application » : partout, sauf dans l'application installée */}
        {isInstalled() ? null : (
          <li>
            <a class="btn-text foot-install" href={link('/installer')} aria-current={/^\/installer\/?$/.test(currentPath()) ? 'page' : undefined}>
              <Icon name="install" />
              Installer l’application
            </a>
          </li>
        )}
        <li>
          <button type="button" class="btn-text" ref={importButton} onClick={() => file.current?.click()}>
            <Icon name="upload" />
            Reprendre depuis un fichier
          </button>
          {/* Hors de l'arbre d'accessibilité : le bouton ci-dessus porte l'action, le champ n'en est que l'outil */}
          <input
            ref={file}
            type="file"
            accept="application/json,.json,image/*,.png,.jpg,.jpeg,.webp,.heic,text/plain,.txt"
            class="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={e => void onImport(e)}
          />
        </li>
        {started ? (
          <li>
            <ConfirmErase
              onErase={() => {
                // Tout effacer, c'est aussi oublier un import en attente
                setPending(null)
                setError(null)
                sheet.erase()
                requestAnimationFrame(() => importButton.current?.focus())
              }}
            />
          </li>
        ) : null}
      </ul>
      {pending ? (
        <div class="notice" role="alert">
          <p>
            {started ? 'Remplacer vos réponses par celles du fichier\u00a0? ' : ''}
            {pending.note}
          </p>
          <span class="confirm">
            <button
              type="button"
              class="btn-text is-danger"
              onClick={() => {
                setPending(null)
                pending.take()
              }}
            >
              {started ? 'Remplacer mes réponses' : 'Continuer'}
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
      {error ? (
        <p class="error" role="alert">
          {error}
        </p>
      ) : null}
      {!saved ? (
        <p class="notice" role="status">
          Ce navigateur n’enregistre pas votre progression (navigation privée ou stockage bloqué). Transférez vos réponses
          pour les garder.
        </p>
      ) : null}
    </section>
  )
}

/**
 * Le pied de page de tous les écrans. La rangée du haut suit la grille des colonnes : les dates du vote s'alignent sur
 * la dernière
 */
export function SiteFooter() {
  const election = useCurrentElection()?.election
  const table = !!election && !!axisOf(election) && !election.archived
  const comptes = budgetShown()
  return (
    <footer class="site-foot home-foot">
      <div class={['home-foot-inner', table ? 'has-table' : '', comptes ? 'has-comptes' : ''].filter(Boolean).join(' ')}>
        <div class="home-foot-top">
          <Logo layout="horizontal" />
          <Vote />
        </div>
        <div class="home-foot-cols">
          <SheetColumn />
          {table ? (
            <section class="home-foot-col" aria-labelledby="foot-table">
              <h2 id="foot-table" class="home-foot-title">
                À table
              </h2>
              <p class="home-foot-text">Voter à plusieurs, en secret, sur un seul téléphone.</p>
              <ul class="home-foot-actions">
                <li>
                  <a class="btn-text" href={link('/a-table')}>
                    <Icon name="table" />
                    À plusieurs, autour d’une table
                  </a>
                </li>
              </ul>
            </section>
          ) : null}
          {comptes ? (
            <section class="home-foot-col" aria-labelledby="foot-comptes">
              <h2 id="foot-comptes" class="home-foot-title">
                Faire les comptes
              </h2>
              <p class="home-foot-text">Régler le budget 2027 et voir le déficit bouger, levier par levier.</p>
              <ul class="home-foot-actions">
                <li>
                  <a class="btn-text" href={link('/comptes')}>
                    <Icon name="comptes" />
                    Votre budget 2027
                  </a>
                </li>
              </ul>
            </section>
          ) : null}
          <section class="home-foot-col is-about" aria-labelledby="foot-about">
            <h2 id="foot-about" class="home-foot-title">
              Qui fait Isoloir
            </h2>
            <div class="site-foot-text">
              <Independence />
            </div>
            <Notices />
          </section>
        </div>
      </div>
    </footer>
  )
}
