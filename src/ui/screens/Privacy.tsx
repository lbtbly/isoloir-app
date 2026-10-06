// Notice de confidentialité : d'abord la preuve en schémas (vos réponses restent sur l'appareil), puis la
// notice point par point (RGPD, art. 13 et 14) selon le plan de research/juridique/inventaire-2026-10-04.md, § 4.
import { go } from '../../app'
import { APP_NAME } from '../../core/app'
import { CONTACT_MESSAGERIE, EDITEUR, HEBERGEUR, MISE_A_JOUR } from '../../core/legal'
import { STORAGE_PREFIX } from '../../core/storage'
import { ConfirmErase } from '../components/ConfirmErase'
import { AirplaneDiagram, FlowDiagram, LockDiagram } from '../components/Diagrams'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { ContactLink, Fill, SectionLink, SectionTitle, Toc } from '../components/LegalBits'
import { formatDate } from '../format'

const KEPT = [
  {
    icon: 'lock',
    what: 'Votre progression',
    where: 'Dans ce navigateur, sur cet appareil',
    until: 'Jusqu’à « Tout effacer »',
  },
  {
    icon: 'download',
    what: 'Votre double (JSON)',
    where: 'Là où vous l’enregistrez',
    until: 'Vous seul le gérez, y compris s’il se synchronise avec un cloud',
  },
  {
    icon: 'plane',
    what: 'Une copie de l’application',
    where: 'Dans ce navigateur, pour marcher hors ligne',
    until: 'Elle ne contient aucune réponse ; votre navigateur la remplace à chaque nouvelle version',
  },
  {
    icon: 'share',
    what: 'Votre affiche (JPG)',
    where: 'Là où vous l’envoyez',
    until: 'Elle montre des pourcentages, pas vos réponses, mais elle dit de qui vous êtes proche : partagez-la en connaissance de cause',
  },
]

const SECTIONS = [
  { id: 'pf-1', label: 'Où vont vos réponses' },
  { id: 'pf-2', label: 'Le verrou de sécurité' },
  { id: 'pf-3', label: 'La preuve par le mode avion' },
  { id: 'pf-4', label: 'Ce qui reste, et où' },
  { id: 'pf-5', label: 'Qui est responsable' },
  { id: 'pf-6', label: 'Ce que voit l’hébergeur' },
  { id: 'pf-7', label: 'Les candidats' },
  { id: 'pf-8', label: 'Vos messages' },
  { id: 'pf-9', label: 'Vos droits' },
]

const CNIL_2025_024 = 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051448685'
const CNIL_PLAINTE = 'https://www.cnil.fr/fr/plaintes'

export function Privacy({ eraseAll }: { eraseAll: () => void }) {
  return (
    <div class="screen screen-read legal-page">
      <FormHeader title="Notice" right="Confidentialité" />
      <main class="sheet prose has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Ce qui se passe dans l’isoloir reste dans l’isoloir
        </h1>
        <p class="lede">
          {APP_NAME} n’envoie jamais vos réponses&nbsp;: elles restent sur votre appareil, sauf si vous en exportez
          vous-même une copie. {APP_NAME} ne collecte rien lui-même&nbsp;: pas de compte, pas de cookie, pas de mesure
          d’audience. Comme pour toute page web, l’hébergeur voit votre adresse IP, les pages demandées et votre
          navigateur. Trois schémas pour le comprendre, une preuve à faire vous-même, puis la notice point par point.
        </p>
        <Toc items={SECTIONS} />

        <section class="figure-block" aria-labelledby="pf-1">
          <SectionTitle id="pf-1" n={1}>
            Où vont vos réponses
          </SectionTitle>
          <FlowDiagram />
          <p class="caption">
            Tout le calcul se fait sur votre appareil. L’hébergeur du site vous envoie l’application une fois, comme
            n’importe quelle page web&nbsp;; il ne reçoit jamais vos réponses.
          </p>
        </section>

        <section class="figure-block" aria-labelledby="pf-2">
          <SectionTitle id="pf-2" n={2}>
            Le verrou de sécurité
          </SectionTitle>
          <LockDiagram />
          <p class="caption">
            Le code n’envoie vos réponses nulle part. En plus, la page déclare un verrou (Content-Security-Policy) qui
            lui interdit tout envoi en arrière-plan et tout chargement depuis un autre site.
          </p>
        </section>

        <section class="figure-block" aria-labelledby="pf-3">
          <SectionTitle id="pf-3" n={3}>
            La preuve par le mode avion
          </SectionTitle>
          <AirplaneDiagram />
          <p class="caption">
            Une fois la page chargée, coupez le réseau&nbsp;: la feuille, le dépouillement, l’image et le double marchent
            toujours, jusqu’au résultat. Sans réseau, rien ne peut sortir de l’appareil. Vous pouvez tout effacer avant
            de le rallumer.
          </p>
        </section>

        <section class="figure-block" aria-labelledby="pf-4">
          <SectionTitle id="pf-4" n={4}>
            Ce qui reste, et où
          </SectionTitle>
          <ul class="kept">
            {KEPT.map(k => (
              <li key={k.what}>
                <Icon name={k.icon} class="kept-icon" />
                <span class="kept-what">{k.what}</span>
                <span class="kept-where">{k.where}</span>
                <span class="kept-until">{k.until.replace(/ ([:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')}</span>
              </li>
            ))}
          </ul>
          <p>
            Dans le navigateur, cela tient en trois endroits. Le stockage local (<code>localStorage</code>) garde la
            progression, sous une clé «&nbsp;<code>{STORAGE_PREFIX}…</code>&nbsp;» par élection, et une clé
            «&nbsp;<code>…:illisible</code>&nbsp;» si une sauvegarde abîmée a dû être mise de côté. Le stockage de
            session (<code>sessionStorage</code>) retient «&nbsp;<code>isoloir-focus</code>&nbsp;» le temps d’un clic,
            pour ouvrir «&nbsp;Qui porte quoi&nbsp;» sur la bonne question, puis l’efface. Le cache du navigateur
            (Cache Storage) garde la copie hors ligne.
          </p>
          <p>
            Ces stockages servent seulement au service que vous demandez&nbsp;: reprendre votre feuille là où vous
            l’avez laissée, et ouvrir le site sans réseau. Rien n’en est
            transmis, ni au site ni à un tiers. La loi
            dispense ce type de stockage de votre consentement (loi Informatique et Libertés, art.&nbsp;82)&nbsp;: d’où
            l’absence de bandeau. Le bouton ci-dessous efface la progression et le stockage de session&nbsp;; les
            réglages de votre navigateur («&nbsp;effacer les données du site&nbsp;») retirent aussi la copie hors ligne.
          </p>
          <p>
            <ConfirmErase onErase={eraseAll} label="Effacer la progression de ce navigateur" />
          </p>
        </section>

        <details class="tech">
          <summary>
            <Icon name="chevron" class="disclosure" />
            <span class="summary-label">Le détail technique</span>
          </summary>
          <ul>
            <li>
              Le site est un ensemble de fichiers statiques. Après le chargement, le navigateur ne demande au réseau
              que des fichiers du site (images, voix des vidéos que vous regardez, copie hors ligne, nouvelle
              version)&nbsp;: jamais rien qui contienne vos réponses.
            </li>
            <li>
              Verrou déclaré&nbsp;: <code>default-src 'none'</code>, <code>connect-src 'none'</code>,{' '}
              <code>script-src 'self'</code>, <code>worker-src 'self'</code>. Il couvre les envois en arrière-plan&nbsp;; il ne couvre pas une navigation vers
              une autre page, ce que le code ne fait jamais avec vos réponses.
            </li>
            <li>Les polices sont servies par le site lui-même&nbsp;: aucun service tiers n’est contacté.</li>
            <li>
              Pour marcher hors ligne, un service worker garde une copie des fichiers du site dans votre navigateur. Il
              ne fait que copier et servir ces fichiers&nbsp;: il ne voit pas vos réponses et n’envoie aucune donnée. Le
              build vérifie qu’il ne contient aucune adresse et ne relaie que les demandes de fichiers du site.
            </li>
            <li>
              La progression n’est écrite qu’à partir de votre première réponse. Avec plusieurs onglets ouverts,
              l’effacement s’applique à tous.
            </li>
            <li>
              Les liens vers les sources ouvrent les sites des médias et des candidats dans un nouvel onglet, sans leur
              transmettre l’adresse d’origine. Ces sites ont leurs propres règles de confidentialité.
            </li>
          </ul>
        </details>

        <section class="legal-block" aria-labelledby="pf-5">
          <SectionTitle id="pf-5" n={5}>
            Qui est responsable
          </SectionTitle>
          <p>
            L’éditeur d’{APP_NAME}, <Fill value={EDITEUR.nom} />, est responsable des données personnelles que le site
            traite&nbsp;: les journaux de l’hébergeur, les informations publiques sur les candidats et sur les
            personnes citées dans leur parcours ou dans les sources, et les messages que vous lui écrivez. Pour le
            joindre&nbsp;: <ContactLink subject={`${APP_NAME} : données personnelles`} />. Son adresse postale figure
            dans les <a href="#/mentions-legales">mentions légales</a>.
          </p>
          <p>
            <strong>Vos réponses ne sont pas concernées.</strong> Elles restent sur votre appareil et l’éditeur n’y a
            jamais accès&nbsp;: vous les traitez vous-même, pour votre seul compte. Dans ce cas, selon la CNIL, celui qui
            fournit l’outil n’est ni responsable du traitement ni sous-traitant, et ce choix de conception est une bonne
            pratique (
            <ExternalLink href={CNIL_2025_024}>délibération n° 2025-024 du 27 mars 2025</ExternalLink>, §&nbsp;3.3, écrite
            pour les applications mobiles).
          </p>
          <p>
            Pour que cela reste vrai, {APP_NAME} n’a ni mesure d’audience ni remontée d’erreurs, et vos réponses
            n’apparaissent jamais dans l’adresse des pages demandées à l’hébergeur.
          </p>
        </section>

        <section class="legal-block" aria-labelledby="pf-6">
          <SectionTitle id="pf-6" n={6}>
            Ce que voit l’hébergeur
          </SectionTitle>
          <p>
            Pour vous envoyer le site, l’hébergeur, {HEBERGEUR.nom}, tient comme pour toute page web un journal des
            connexions&nbsp;: votre adresse IP et le pays qui s’en déduit, la date et l’heure, les fichiers demandés et
            votre navigateur. Vos réponses n’y figurent jamais.
          </p>
          <dl class="legal-fields">
            <div>
              <dt>Pourquoi</dt>
              <dd>Vous envoyer le site et le protéger des pannes et des abus.</dd>
            </div>
            <div>
              <dt>Base légale</dt>
              <dd>
                L’intérêt légitime de l’éditeur à publier un site qui fonctionne et résiste aux attaques (RGPD,
                art.&nbsp;6, 1, f).
              </dd>
            </div>
            <div>
              <dt>Est-ce obligatoire&nbsp;?</dt>
              <dd>
                Votre navigateur envoie ces informations à chaque visite, comme sur tout site&nbsp;: sans elles, la page
                ne peut pas vous parvenir.
              </dd>
            </div>
            <div>
              <dt>Qui le reçoit</dt>
              <dd>
                {HEBERGEUR.nom}, qui héberge le site (coordonnées dans les{' '}
                <a href="#/mentions-legales">mentions légales</a>). Vercel traite aussi ces données pour son propre
                compte, comme responsable de traitement, selon{' '}
                <ExternalLink href={HEBERGEUR.confidentialite}>sa notice de confidentialité</ExternalLink>.
              </dd>
            </div>
            <div>
              <dt>Hors de l’Union européenne</dt>
              <dd>
                Les journaux peuvent être traités aux États-Unis. Ce transfert est couvert par le cadre de protection
                des données UE–États-Unis (Data Privacy Framework, décision (UE) 2023/1795), auquel Vercel adhère.
              </dd>
            </div>
            <div>
              <dt>Combien de temps</dt>
              <dd>
                Avec l’offre gratuite «&nbsp;Hobby&nbsp;», l’éditeur peut voir dans le tableau de bord de l’hébergeur
                le détail des requêtes pendant 1&nbsp;heure, et le trafic regroupé par adresse IP, page, navigateur ou
                pays pendant 24&nbsp;heures au plus. Il n’en exporte rien. Vercel ne publie pas la durée pendant laquelle
                il garde ces données lui-même&nbsp;: voir sa notice.
              </dd>
            </div>
            <div>
              <dt>Cookie de sécurité</dt>
              <dd>
                {APP_NAME} ne dépose aucun cookie. Face à un trafic anormal, Vercel peut soumettre une visite à une
                vérification automatique, qui dépose alors un cookie technique de sécurité.
              </dd>
            </div>
            <div>
              <dt>Rien d’autre</dt>
              <dd>
                Aucune option de mesure d’audience, de suivi des performances ou d’export des journaux n’est activée
                chez l’hébergeur.
              </dd>
            </div>
          </dl>
        </section>

        <section class="legal-block" aria-labelledby="pf-7">
          <SectionTitle id="pf-7" n={7}>
            Les candidats
          </SectionTitle>
          <p>
            {APP_NAME} publie des informations publiques sur les candidats&nbsp;: les positions qu’il leur attribue,
            avec leurs sources, leur parcours et leur portrait.
          </p>
          <dl class="legal-fields">
            <div>
              <dt>Pourquoi</dt>
              <dd>Informer les électeurs et leur permettre de comparer des idées.</dd>
            </div>
            <div>
              <dt>Base légale</dt>
              <dd>
                L’intérêt légitime d’informer le public pendant une élection (RGPD, art.&nbsp;6, 1, f). Les positions
                politiques citées sont des opinions que les candidats ont manifestement rendues publiques (RGPD,
                art.&nbsp;9, 2, e).
              </dd>
            </div>
            <div>
              <dt>D’où elles viennent</dt>
              <dd>
                De sources publiques, citées à chaque position&nbsp;: professions de foi, programmes, débats, interviews,
                votes. Les portraits sont sous licence libre ou à réutilisation autorisée (voir la rubrique
                «&nbsp;Crédits&nbsp;» des <a href="#/mentions-legales">mentions légales</a>).
              </dd>
            </div>
            <div>
              <dt>Qui les voit</dt>
              <dd>
                Tous les visiteurs, puisqu’elles sont publiées sur le site, et l’hébergeur, {HEBERGEUR.nom} (voir la{' '}
                <SectionLink id="pf-6">rubrique&nbsp;6</SectionLink> pour le transfert hors de l’Union européenne).
              </dd>
            </div>
            <div>
              <dt>Combien de temps</dt>
              <dd>Tant que le site présente cette élection&nbsp;; il reste en ligne après le vote.</dd>
            </div>
            <div>
              <dt>Rectification et opposition</dt>
              <dd>
                Un candidat ou son équipe peut demander à tout moment qu’une information soit corrigée, ou s’opposer à
                son traitement, en écrivant à <ContactLink subject={`${APP_NAME} : candidat`} />. Une position douteuse
                devient «&nbsp;inconnue&nbsp;», et un portrait peut être remplacé par des initiales.
              </dd>
            </div>
          </dl>
          <p>
            Les autres personnes nommées sur le site, dans un parcours ou dans le titre d’une source, ont les mêmes
            droits.
          </p>
        </section>

        <section class="legal-block" aria-labelledby="pf-8">
          <SectionTitle id="pf-8" n={8}>
            Vos messages
          </SectionTitle>
          <p>
            Si vous écrivez à <ContactLink subject={APP_NAME} />, votre message et votre adresse ne servent qu’à vous
            répondre, à corriger le site ou à publier un droit de réponse.
          </p>
          <dl class="legal-fields">
            <div>
              <dt>Base légale</dt>
              <dd>
                L’intérêt légitime de répondre et de tenir le site exact&nbsp;; pour un droit de réponse, l’obligation
                légale de le publier (RGPD, art.&nbsp;6, 1, c et f).
              </dd>
            </div>
            <div>
              <dt>Qui le lit</dt>
              <dd>
                L’éditeur seul. Votre message est conservé dans sa messagerie, chez <Fill value={CONTACT_MESSAGERIE} />
                . Rien n’est publié, sauf le texte d’un droit de réponse, publié par définition.
              </dd>
            </div>
            <div>
              <dt>Combien de temps</dt>
              <dd>Le temps de traiter votre demande, puis 6&nbsp;mois, avant suppression.</dd>
            </div>
          </dl>
        </section>

        <section class="legal-block" aria-labelledby="pf-9">
          <SectionTitle id="pf-9" n={9}>
            Vos droits
          </SectionTitle>
          <p>
            Sur les journaux de connexion, les informations publiées sur une personne et vos messages, vous pouvez
            demander l’accès, la rectification ou l’effacement, demander la limitation du traitement ou vous y opposer
            (RGPD, art.&nbsp;15 à 18 et 21). Écrivez à <ContactLink subject={`${APP_NAME} : exercer mes droits`} />&nbsp;: la réponse
            vous parvient dans un délai d’un mois.
          </p>
          <p>
            Vos réponses, elles, ne sont qu’entre vos mains&nbsp;: vous les effacez vous-même, avec le bouton
            «&nbsp;Effacer la progression&nbsp;» ci-dessus ou dans les réglages de votre navigateur.
          </p>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser{' '}
            <ExternalLink href={CNIL_PLAINTE}>une réclamation à la CNIL</ExternalLink>.
          </p>
        </section>

        <p class="small legal-date">Notice mise à jour le {formatDate(MISE_A_JOUR)}.</p>
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
