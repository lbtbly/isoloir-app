// Mentions légales : éditeur et directeur de la publication, contact, hébergeur, droit de réponse et
// corrections, conditions d'utilisation, crédits, licences, liens externes. Le fond s'appuie sur
// research/juridique/inventaire-2026-10-04.md ; l'identité et le contact viennent de src/core/legal.ts.
import { useMemo } from 'preact/hooks'
import { go, link } from '../nav'
import { APP_NAME } from '../../core/app'
import { DELAI_VERIFICATION, EDITEUR, HEBERGEUR, MISE_A_JOUR } from '../../core/legal'
import { THIRD_PARTY } from '../../core/notices'
import { seededShuffle } from '../../core/rng'
import type { ElectionPack } from '../../core/types'
import { AI_METHOD_PATH } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { ContactLink, Fill, SectionLink, SectionTitle, Toc } from '../components/LegalBits'
import { formatDate } from '../format'

const SECTIONS = [
  { id: 'ml-editeur', label: 'Éditeur' },
  { id: 'ml-contact', label: 'Contact' },
  { id: 'ml-hebergement', label: 'Hébergement' },
  { id: 'ml-reponse', label: 'Droit de réponse et corrections' },
  { id: 'ml-conditions', label: 'Conditions d’utilisation' },
  { id: 'ml-credits', label: 'Crédits' },
  { id: 'ml-licences', label: 'Licences' },
  { id: 'ml-liens', label: 'Liens externes' },
]
const n = (id: string) => SECTIONS.findIndex(s => s.id === id) + 1

const LCEN = 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614'
const DECRET_REPONSE = 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000428279'
const MIT = 'https://opensource.org/license/mit'
const CC_BY_4 = 'https://creativecommons.org/licenses/by/4.0/deed.fr'

const DAY_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const HOUR = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Paris' })

/** Jour de Paris, « samedi 1er mai », sans coupure */
function dayOf(d: Date): string {
  return DAY_LONG.format(d)
    .replace(/^(\S+ )1 /, (_, weekday: string) => `${weekday}1er `)
    .replace(/ /g, '\u00a0')
}

/** Heure de Paris, « 20 h » */
function hourOf(d: Date): string {
  return `${HOUR.formatToParts(d).find(p => p.type === 'hour')?.value ?? ''}\u00a0h`
}

/**
 * Gel des données pour un tour de scrutin : de la veille du premier jour de vote, 0 h, à la clôture.
 * « du jeudi 8 octobre, 0 h, au samedi 10 octobre, 20 h »
 */
export function freezeWindow(round: { start: string; end: string }): string {
  const eve = new Date(new Date(round.start).getTime() - 24 * 3600 * 1000)
  const end = new Date(round.end)
  return `du ${dayOf(eve)}, 0\u00a0h, au ${dayOf(end)}, ${hourOf(end)}`
}

/** Une période de gel donnée telle quelle par l'élection (freezeWindows) : « du vendredi 16 avril, 0 h, au dimanche 18 avril, 20 h » */
export function freezePeriod(period: { start: string; end: string }): string {
  const start = new Date(period.start)
  const end = new Date(period.end)
  return `du ${dayOf(start)}, ${hourOf(start)}, au ${dayOf(end)}, ${hourOf(end)}`
}

/** « CC BY-SA 4.0 » ne se coupe pas en fin de ligne */
function keepLicenseTogether(text: string) {
  return text.split(/(CC BY(?:-SA)? \d\.\d)/).map((part, i) => (i % 2 ? <span class="nowrap">{part}</span> : part))
}

/** Ligne de titre ou de filet d'un texte de licence (« PREAMBLE », « ------ ») : elle garde sa propre ligne */
const isLicenseHeading = (line: string) => /^-+$/.test(line.trim()) || (line.length <= 30 && /[A-Z]{3}/.test(line) && !/[a-z.,;:]/.test(line))

/**
 * Texte de licence pour l'écran, sans rien changer aux mots : le fichier d'origine passe à la ligne tous
 * les 70 signes environ, ce qui hache la lecture dès que la colonne est plus étroite. Ces retours deviennent
 * des espaces ; les lignes vides, les titres en capitales et les filets restent à leur place.
 */
function reflowLicense(text: string): string {
  return text
    .split(/\n{2,}/)
    .map(block =>
      block
        .split('\n')
        .reduce((acc, line, i, lines) => (i === 0 ? line : `${acc}${isLicenseHeading(lines[i - 1] ?? '') || isLicenseHeading(line) ? '\n' : ' '}${line}`), ''),
    )
    .join('\n\n')
}

export function Legal({ pack, seed }: { pack: ElectionPack; seed: string }) {
  const { election, candidates } = pack
  // Les candidats, comme partout où ils ne sont pas classés, dans un ordre tiré au hasard pour chacun
  const people = useMemo(() => seededShuffle(candidates, `${seed}:credits`).filter(c => c.photo), [candidates, seed])
  // Périodes de gel : celles que l'élection fixe elle-même (vote outre-mer la veille, par exemple), sinon de la
  // veille de chaque tour, 0 h, à sa clôture
  const frozen = election.freezeWindows?.length ? election.freezeWindows.map(freezePeriod) : election.rounds.map(freezeWindow)
  const site = election.copy.officialSite

  return (
    <div class="screen screen-read legal-page">
      <FormHeader title="Notice" right="Mentions légales" />
      <main class="sheet prose has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Mentions légales
        </h1>
        <p class="lede">
          Qui publie {APP_NAME}, comment le joindre, comment faire corriger une erreur, et à quelles conditions vous
          utilisez le site.
        </p>
        <Toc items={SECTIONS} />

        <section class="legal-block" aria-labelledby="ml-editeur">
          <SectionTitle id="ml-editeur" n={n('ml-editeur')}>
            Éditeur et directeur de la publication
          </SectionTitle>
          <p>
            {/* Les phrases qui reçoivent un texte de l'élection sont d'un seul tenant (un seul nœud de texte, comme
                avant le passage à plusieurs élections) : la mise en page de la primaire reste la même au pixel près */}
            {APP_NAME}
            {` est édité par un citoyen, à titre personnel, ${election.copy.independence.legal}, et sans financement. L’éditeur est aussi le directeur de la publication.`}
          </p>
          <dl class="legal-fields">
            <div>
              <dt>Éditeur et directeur de la publication</dt>
              <dd>
                <Fill value={EDITEUR.nom} />
              </dd>
            </div>
            <div>
              <dt>Adresse</dt>
              <dd>
                <Fill value={EDITEUR.adresse} />
              </dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>
                <Fill value={EDITEUR.telephone} />
              </dd>
            </div>
            <div>
              <dt>Courriel</dt>
              <dd>
                <ContactLink subject={APP_NAME} />
              </dd>
            </div>
          </dl>
        </section>

        <section class="legal-block" aria-labelledby="ml-contact">
          <SectionTitle id="ml-contact" n={n('ml-contact')}>
            Contact
          </SectionTitle>
          <p>
            Une seule adresse pour signaler une erreur, demander une correction, exercer un droit de réponse ou vos
            droits sur vos données, ou faire une remarque sur l’accessibilité&nbsp;: <ContactLink subject={APP_NAME} />.
          </p>
          <p>
            {APP_NAME} n’a ni formulaire ni serveur qui reçoive des messages&nbsp;: le lien ouvre votre propre
            messagerie, et rien ne part sans que vous l’envoyiez.
          </p>
        </section>

        <section class="legal-block" aria-labelledby="ml-hebergement">
          <SectionTitle id="ml-hebergement" n={n('ml-hebergement')}>
            Hébergement
          </SectionTitle>
          <dl class="legal-fields">
            <div>
              <dt>Hébergeur</dt>
              <dd>{HEBERGEUR.nom}</dd>
            </div>
            <div>
              <dt>Adresse</dt>
              <dd>{HEBERGEUR.adresse}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>
                <span class="nowrap">{HEBERGEUR.telephone}</span>{' '}
                <span class="legal-aside">
                  (le seul numéro que Vercel publie&nbsp;: celui de son agent pour les réclamations de droit d’auteur)
                </span>
              </dd>
            </div>
            <div>
              <dt>Courriel</dt>
              <dd>{HEBERGEUR.courriel}</dd>
            </div>
          </dl>
          <p>
            Ce que l’hébergeur voit de votre visite est décrit dans la{' '}
            <a href={link('/confidentialite')}>notice de confidentialité</a>.
          </p>
        </section>

        <section class="legal-block" aria-labelledby="ml-reponse">
          <SectionTitle id="ml-reponse" n={n('ml-reponse')}>
            Droit de réponse et corrections
          </SectionTitle>
          <p>{APP_NAME} nomme des personnes en pleine élection&nbsp;: une erreur doit pouvoir être corrigée vite.</p>
          <ul>
            <li>
              <strong>Signaler.</strong> Écrivez à <ContactLink subject={`${APP_NAME} : signaler une erreur`} /> en
              indiquant la page, la question ou la position concernée et, si possible, une source.
            </li>
            <li>
              <strong>Vérification.</strong> Chaque signalement est lu et vérifié contre les sources dans les{' '}
              {DELAI_VERIFICATION.replace(/ /g, '\u00a0')}.
            </li>
            <li>
              <strong>Correction.</strong> Une erreur avérée est corrigée. En cas de doute, la position devient
              «&nbsp;inconnue&nbsp;»&nbsp;: elle sort du calcul plutôt que de rester supposée.
            </li>
            <li>
              <strong>Trace.</strong> Chaque correction est datée dans le journal des données, en bas de la page{' '}
              <a href={link('/methode')}>Méthode et sources</a>.
            </li>
          </ul>

          <h3>Correction ou droit de réponse</h3>
          <p>
            <strong>Une correction est volontaire.</strong> {APP_NAME} remplace l’information inexacte, sans autre
            formalité.
          </p>
          <p>
            <strong>Le droit de réponse est un droit prévu par la loi.</strong> Toute personne nommée ou désignée sur le
            site peut faire publier sa réponse, gratuitement, même sans erreur à corriger.
          </p>
          <ul>
            <li>La demande est faite dans les 3&nbsp;mois qui suivent la mise en ligne du texte contesté.</li>
            <li>
              Elle est adressée au directeur de la publication (l’éditeur), à l’adresse de la{' '}
              <SectionLink id="ml-editeur">rubrique&nbsp;{n('ml-editeur')}</SectionLink>, par lettre recommandée avec
              avis de réception, ou par tout autre moyen qui garantit l’identité de la personne et prouve la réception.
            </li>
            <li>
              Elle indique où se trouve le texte contesté (page, date, auteur s’il est nommé), cite les passages en
              cause et donne le texte de la réponse. La réponse est écrite&nbsp;; elle n’est pas plus longue que le
              texte qui l’a provoquée, et compte 200&nbsp;lignes au plus.
            </li>
            <li>
              La demande peut préciser qu’elle devient sans objet si le passage est supprimé ou rectifié. Dans ce cas,
              une suppression ou une rectification faite dans les 3&nbsp;jours remplace la publication de la réponse.
            </li>
            <li>
              La réponse est publiée dans les 3&nbsp;jours qui suivent la réception de la demande, à la suite du texte
              contesté ou accessible depuis lui, dans un encadré «&nbsp;Droit de réponse&nbsp;». Elle reste en ligne
              aussi longtemps que ce texte, et au moins un jour.
            </li>
          </ul>
          <p class="small">
            Textes&nbsp;: <ExternalLink href={LCEN}>loi n° 2004-575 du 21 juin 2004, art. 1-1</ExternalLink>&nbsp;;{' '}
            <ExternalLink href={DECRET_REPONSE}>décret n° 2007-1527 du 24 octobre 2007</ExternalLink>. Rien n’empêche
            d’écrire d’abord à l’adresse de contact&nbsp;: une erreur se corrige sans attendre.
          </p>

          <h3>Pendant les jours de vote</h3>
          {frozen.length ? (
            <p>
              Les données sont gelées{' '}
              {frozen.map((period, i) => (
                <span key={period}>
                  {i > 0 ? (i === frozen.length - 1 ? ', puis ' : ', ') : ''}
                  {period}
                </span>
              ))}
              . Pendant ces périodes, aucune nouvelle position et aucun changement de fond ne sont publiés. Seules
              passent la correction d’une erreur avérée et la publication d’un droit de réponse.
            </p>
          ) : (
            <p>
              Pendant les jours de vote, aucune nouvelle position et aucun changement de fond ne sont publiés. Seules
              passent la correction d’une erreur avérée et la publication d’un droit de réponse.
            </p>
          )}
        </section>

        <section class="legal-block" aria-labelledby="ml-conditions">
          <SectionTitle id="ml-conditions" n={n('ml-conditions')}>
            Conditions d’utilisation
          </SectionTitle>
          <ul>
            <li>
              <strong>Objet.</strong> {APP_NAME} vous aide à situer vos idées par rapport aux positions publiques des
              candidats d’une élection. Il est gratuit, sans compte et sans publicité. Il reste en ligne après le vote et
              sera mis à jour pour les élections suivantes.
            </li>
            <li>
              <strong>Un résultat indicatif.</strong> Le résultat dépend des questions retenues et de la{' '}
              <a href={link('/methode')}>méthode publiée</a>. Ce n’est ni une consigne de vote, ni un conseil. {APP_NAME}{' '}
              n’est pas un sondage&nbsp;: il ne recueille les réponses de personne et ne publie aucun résultat d’ensemble.
            </li>
            <li>
              <strong>Des sources publiques datées.</strong> Chaque position s’appuie sur des sources publiques, datées
              et citées. Une erreur reste possible, et une position a pu évoluer depuis&nbsp;: signalez-la (voir{' '}
              <SectionLink id="ml-reponse">Droit de réponse et corrections</SectionLink>).
            </li>
            <li>
              <strong>Vos fichiers restent à vous.</strong> Le calcul se fait sur votre appareil. Le double (JSON) et
              l’affiche (JPG) y sont fabriqués&nbsp;: vous seul décidez de les garder, de les envoyer ou de les supprimer.
            </li>
            <li>
              <strong>Sites liés.</strong> Les liens mènent à des sites qui ont leurs propres conditions&nbsp;;{' '}
              {APP_NAME} n’en contrôle pas le contenu.
            </li>
            <li>
              <strong>Droit applicable.</strong> Ces conditions relèvent du droit français.
            </li>
          </ul>
          <p class="small">Conditions mises à jour le {formatDate(MISE_A_JOUR)}.</p>
        </section>

        <section class="legal-block" aria-labelledby="ml-credits">
          <SectionTitle id="ml-credits" n={n('ml-credits')}>
            Crédits
          </SectionTitle>
          <p>
            {`Les portraits des candidats sont des photos sous licence libre, ou dont la réutilisation est autorisée, recadrées en carré et réduites. Les photos des sites de campagne${site ? ` et ${site.photos}` : ''} ne sont pas reprises.`}
          </p>
          <ul class="credits">
            {people.map(c => {
              const p = c.photo!
              return (
                <li key={c.id}>
                  <img class="portrait is-small credit-photo" src={p.src} alt="" loading="lazy" />
                  <div class="credit-body">
                    <p class="credit-name">{c.name}</p>
                    <p class="credit-line">{keepLicenseTogether(p.credit.replace(/, recadrée$/, ''))}.</p>
                    {p.title ? (
                      <p class="credit-line">
                        {/* Le nom du fichier fait partie du lien : cinq liens « Wikimedia Commons » seraient
                            indiscernables dans la liste des liens d'un lecteur d'écran */}
                        Fichier d’origine&nbsp;:{' '}
                        <ExternalLink href={p.rightsUrl} class="file-link">{`«\u00a0${p.title}\u00a0» sur Wikimedia Commons`}</ExternalLink>
                      </p>
                    ) : (
                      <p class="credit-line">
                        Image d’origine&nbsp;: <ExternalLink href={p.rightsUrl}>page de l’image</ExternalLink>
                      </p>
                    )}
                    {p.license ? (
                      <p class="credit-line">
                        {p.license.name.startsWith('CC') ? 'Licence' : 'Conditions'}&nbsp;:{' '}
                        {/* « CC BY-SA 2.0 » ne se coupe pas au trait d'union */}
                        <ExternalLink href={p.license.url} class={p.license.name.startsWith('CC') ? 'nowrap' : undefined}>
                          {p.license.name}
                        </ExternalLink>
                      </p>
                    ) : null}
                    {p.changes ? (
                      <p class="credit-line">
                        Modification&nbsp;: {p.changes}
                        {p.shareAlike
                          ? '\u00a0; cette version recadrée est diffusée sous la même licence.'
                          : p.license && !p.license.name.startsWith('CC')
                            ? '\u00a0; l’image entière est sur la page source.'
                            : '.'}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
            <li class="is-text">
              <div class="credit-body">
                <p class="credit-name">Logo d’{APP_NAME}</p>
                <p class="credit-line">
                  © <Fill value={EDITEUR.nom} />, tous droits réservés. Il n’est couvert par aucune des licences
                  ci-dessous.
                </p>
              </div>
            </li>
            <li class="is-text">
              <div class="credit-body">
                <p class="credit-name">Fabrication</p>
                <p class="credit-line">
                  Une intelligence artificielle (Claude, d’Anthropic) a écrit le code et rédigé les textes à partir des
                  sources citées&nbsp;: questions et approches, fiches de contexte, résumés des positions, parcours des
                  candidats, textes des vidéos. Ces textes, parcours mis à part, ont été vérifiés automatiquement contre
                  leurs sources, par une IA elle aussi&nbsp;; ils ne sont pas relus un par un par une personne, et
                  chacun porte une mention qui le signale là où il apparaît. Une erreur se signale comme
                  indiqué à la <SectionLink id="ml-reponse">rubrique&nbsp;{n('ml-reponse')}</SectionLink>. Aucune IA ne
                  tourne pendant la visite. Le détail est dans la rubrique <a href={link(AI_METHOD_PATH)}>Usage de l’IA</a> de
                  la notice Méthode et sources.
                </p>
              </div>
            </li>
            <li class="is-text">
              <div class="credit-body">
                <p class="credit-name">Chiffres et citations</p>
                <p class="credit-line">
                  Chaque chiffre de contexte et chaque position citent leur source (éditeur, date, lien) là où ils
                  apparaissent. Ils restent soumis aux conditions de leurs auteurs.
                </p>
              </div>
            </li>
          </ul>
          {candidates.some(c => c.party?.logo) ? (
            <p>
              Les logos des partis, sur la page des candidats, sont des marques de leurs titulaires, reproduites à la
              seule fin d’identifier chaque parti ; leur provenance (Wikimedia Commons, Wikipédia ou le site du parti)
              est détaillée dans le dépôt du code (<span class="nowrap">media/CREDITS.md</span>).
            </p>
          ) : null}
        </section>

        <section class="legal-block" aria-labelledby="ml-licences">
          <SectionTitle id="ml-licences" n={n('ml-licences')}>
            Licences
          </SectionTitle>
          <p>Le dépôt du code d’{APP_NAME} est encore privé. Quand il sera rendu public&nbsp;:</p>
          <ul>
            <li>
              le code sera diffusé sous <ExternalLink href={MIT}>licence MIT</ExternalLink>&nbsp;;
            </li>
            <li>
              les contenus propres au site (questions, approches, positions rédigées, fiches de contexte rédigées) le
              seront sous <ExternalLink href={CC_BY_4}>licence Creative Commons Attribution 4.0 (CC&nbsp;BY&nbsp;4.0)</ExternalLink>.
            </li>
          </ul>
          <p>
            Ces licences ne couvrent pas le logo (tous droits réservés), les logos des partis (marques de leurs titulaires), les photos (leurs propres licences, voir{' '}
            <SectionLink id="ml-credits">Crédits</SectionLink>), les citations et données publiques reprises des sources
            (leurs propres conditions), ni Preact et la police Archivo (leurs licences, ci-dessous). En attendant, le
            code exécuté par votre navigateur peut être inspecté.
          </p>

          <h3>Composants tiers</h3>
          <ul class="third-party">
            {THIRD_PARTY.map(t => (
              <li key={t.name}>
                <p class="credit-name">{t.name}</p>
                <p class="credit-line">{t.role.charAt(0).toUpperCase() + t.role.slice(1)}.</p>
                <p class="credit-line">
                  Licence&nbsp;: <ExternalLink href={t.licenseUrl}>{t.license}</ExternalLink>
                </p>
                <p class="credit-line">
                  <span class="file-name">{t.copyright}</span>
                </p>
                <p class="credit-line">
                  <ExternalLink href={t.projectUrl}>{`Dépôt du projet ${t.name}`}</ExternalLink>
                </p>
                <details class="license-details">
                  <summary>
                    <Icon name="chevron" class="disclosure" />
                    <span class="summary-label">Texte complet de la licence (en anglais)</span>
                  </summary>
                  <pre class="license-text" lang="en">
                    {reflowLicense(t.text)}
                  </pre>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section class="legal-block" aria-labelledby="ml-liens">
          <SectionTitle id="ml-liens" n={n('ml-liens')}>
            Liens externes
          </SectionTitle>
          <p>
            {`Les liens vers les sources${site ? `, les sites des candidats et ${site.links}` : ' et les sites des candidats'} s’ouvrent dans un nouvel onglet, sans transmettre l’adresse de la page d’origine. Ces sites ont leurs propres conditions et leurs propres règles de confidentialité\u00a0; `}
            {APP_NAME} n’en contrôle pas le contenu.
          </p>
          {/* Une élection organisée par des partis (une primaire) : son nom et son site sont les leurs */}
          {election.organizers.length || election.officialUrl ? (
            <p>
              {APP_NAME} cite le nom de l’élection, {election.name.charAt(0).toLowerCase() + election.name.slice(1)}
              {election.officialUrl ? (
                <>
                  , et son site officiel,{' '}
                  <ExternalLink href={election.officialUrl}>{election.officialUrl.replace(/^https?:\/\//, '')}</ExternalLink>
                  ,
                </>
              ) : null}{' '}
              {`pour ${election.officialUrl ? 'les' : 'la'} désigner.${election.organizers.length ? ' Il n’a aucun lien avec ses organisateurs.' : ''}`}
            </p>
          ) : null}
        </section>

        <p class="small legal-date">
          Page mise à jour le {formatDate(MISE_A_JOUR)}. Voir aussi la <a href={link('/confidentialite')}>notice de
          confidentialité</a> et <a href={link('/methode')}>la méthode</a>.
        </p>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Retour">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={() => go('/')}>
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
