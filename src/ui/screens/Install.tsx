// « Installer l'application » (#/installer) : Isoloir sur l'écran d'accueil (ou dans le Dock, le menu Démarrer), comme une
// application, sans magasin d'applications ni compte. La page lit sur place l'appareil et le navigateur (core/install.ts)
// et montre ses gestes, schémas au trait ; les autres appareils sont dans une liste repliée. Sur iPhone, iPad et le Safari
// du Mac, l'application a son propre espace, vide au départ : on copie d'abord le code de ses réponses (le code de
// transfert, core/transfer), dans le geste même du bouton (Safari l'exige), puis on le colle dans l'application
// (« Importer mes réponses », ui/screens/Transfer.tsx). Sur Android et avec Chrome ou Edge, l'application lit les réponses
// du navigateur ; le bouton « Installer Isoloir » ouvre la fenêtre d'installation du navigateur quand il l'a annoncée
// (ui/install/prompt.ts), jamais de lui-même. Sur ordinateur, un QR code ouvre cette page sur le téléphone : il porte son
// adresse, rien d'autre. Rien n'est envoyé ni gardé.
// Chargé à la demande (ui/screens/load.ts), avec le codeur des codes de transfert et sa feuille de style : le code de chaque
// visite n'en contient rien.

import type { RefObject } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { thisDevice, type Device, type DeviceKey } from '../../core/install'
import { CTA_START } from '../../core/resultsCopy'
import type { SessionState } from '../../core/storage'
import { groupCode } from '../../core/transfer/base32'
import { encodeTransfer } from '../../core/transfer/codec'
import type { ElectionPack } from '../../core/types'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { GUIDES, GUIDE_KEYS, MENU, SYMBOLS, deviceLine, noun, path, q, type Guide } from '../install/devices'
import { AndroidConfirm, AndroidMenu, AndroidMore, Apart, DeskBar, Ios18Share, Ios26Menu, Ios26More, IosAdd, IosHome, IosIcon, IosPaste, Shared } from '../install/Diagrams'
import { canInstall, install, installedNow, onInstall } from '../install/prompt'
import { link } from '../nav'
import '../../styles/install-page.css'

interface Props {
  pack: ElectionPack
  state: SessionState
}

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** « 22 réponses », « 1 réponse » */
const answersOf = (n: number) => `${n}\u00a0réponse${n > 1 ? 's' : ''}`

/** Un geste, son numéro dans la colonne de marge ; « where » : où il se fait (« Ici, dans Safari ») */
interface Gesture {
  where?: string
  body: preact.ComponentChildren
}

/** Les gestes, numérotés dans la colonne de marge (aux lecteurs d'écran, le numéro est celui de la liste) */
function Gestures({ items }: { items: Gesture[] }) {
  return (
    <ol class="install-steps">
      {items.map((g, i) => (
        <li key={i}>
          <span class="step-n" aria-hidden="true">
            {i + 1}
          </span>
          <div class="step-body">
            {g.where ? <span class="step-where">{g.where}</span> : null}
            {g.body}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Un symbole de menu (« ⋮ ») : montré entre guillemets, dit en mots aux lecteurs d'écran (devices.ts, SYMBOLS) */
const Sym = ({ s, strong }: { s: string; strong?: boolean }) => (
  <>
    <span aria-hidden="true">«&nbsp;{strong ? <strong>{s}</strong> : s}&nbsp;»</span>
    <span class="sr-only">{SYMBOLS[s]}</span>
  </>
)

/** Un mot de menu en gras, entre guillemets ; un symbole, dit en mots aux lecteurs d'écran */
const B = ({ children }: { children: string }) =>
  SYMBOLS[children] ? (
    <Sym s={children} strong />
  ) : (
    <>
      «&nbsp;<strong>{children}</strong>&nbsp;»
    </>
  )

/** Les symboles de menu entre guillemets, dans un texte de devices.ts */
const SYMBOL_IN_TEXT = new RegExp(`«\u00a0(${Object.keys(SYMBOLS).join('|')})\u00a0»`)

/** Un texte de devices.ts, ses symboles de menu dits en mots aux lecteurs d'écran */
const Spoken = ({ text }: { text: string }) => <>{text.split(SYMBOL_IN_TEXT).map((part, i) => (i % 2 ? <Sym key={i} s={part} /> : part))}</>

export function Install({ pack, state }: Props) {
  const device = thisDevice()
  const host = typeof location === 'undefined' ? '' : location.host
  const count = Object.keys(state.answers).length
  const started = count > 0
  // Le code de transfert de ces réponses, fabriqué d'avance : la copie doit se faire dans le geste même (Safari)
  const code = useMemo(() => {
    if (!started) return null
    try {
      return encodeTransfer(state, pack)
    } catch {
      return null
    }
  }, [pack, state, started])

  // L'annonce d'installation du navigateur, et l'installation faite pendant la visite ; « offered » : une annonce est
  // venue pendant la visite (la place du bouton reste, pour dire ce qu'il en est advenu)
  const [offer, setOffer] = useState(canInstall)
  const [offered, setOffered] = useState(canInstall)
  const [done, setDone] = useState(installedNow)
  useEffect(() => {
    const sync = () => {
      setOffer(canInstall())
      setOffered(o => o || canInstall())
      setDone(installedNow())
    }
    const stop = onInstall(sync)
    // Une annonce arrivée entre le premier affichage et cet abonnement
    sync()
    return stop
  }, [])

  const others = useRef<HTMLElement>(null)
  // « Autre appareil ? » : la liste, sans changer d'adresse (le site route par le « # »)
  const toOthers = () => {
    const el = others.current
    if (!el) return
    el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' })
    el.focus({ preventScroll: true })
  }

  const ctx: Ctx = { device, host, count, started, code, offer, offered, done }
  const known = device.key !== 'other'
  const line = deviceLine(device)
  const title = device.installed ? 'Isoloir est installé' : 'Installer l’application'

  return (
    <div class="screen screen-wide screen-install">
      <FormHeader title={title} right={pack.election.shortName} />
      <main class="sheet wide-sheet install" id="contenu" tabIndex={-1}>
        <div class="install-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            {/* La césure conditionnelle d'« appli-cation » ne sert qu'au texte très agrandi : sinon le mot se couperait n'importe où */}
            {device.installed ? title : 'Installer l’appli\u00adcation'}
          </h1>
          <p class="lede">{ledeOf(ctx)}</p>
          <div class="install-device">
            <p class="install-device-label">Cet appareil</p>
            <p class="install-device-value">
              {line.value}
              {line.sub ? <span class="install-device-sub">{line.sub}</span> : null}
            </p>
            {known && !device.installed ? (
              <button type="button" class="btn-text" onClick={toOthers}>
                Autre appareil&nbsp;?
              </button>
            ) : null}
          </div>
          {device.desktop && !device.installed ? <PhoneCard started={started} /> : null}
        </div>
        <div class="install-main">
          <Main ctx={ctx} />
          <Others
            sectionRef={others}
            keys={device.installed || !known ? GUIDE_KEYS : GUIDE_KEYS.filter(k => k !== device.key)}
            open={known ? null : 'other'}
            title={known || device.installed ? 'Sur un autre appareil' : 'Choisissez votre appareil'}
          />
        </div>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Installer l’application">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/')}>
            <Icon name="arrow-left" />
            Accueil
          </a>
        </div>
      </nav>
    </div>
  )
}

/** Ce que les parties de la page savent de la visite */
interface Ctx {
  device: Device
  host: string
  /** Le nombre de réponses gardées par ce navigateur */
  count: number
  started: boolean
  /** Le code de transfert de ces réponses ; null sans réponse (ou si le code n'a pas pu être fabriqué) */
  code: string | null
  /** Le navigateur a annoncé qu'il sait installer : le bouton « Installer Isoloir » */
  offer: boolean
  /** Une annonce est venue pendant la visite (servie ou non depuis) */
  offered: boolean
  /** Installé pendant cette visite */
  done: boolean
}

function ledeOf({ device, started }: Ctx): string {
  if (device.installed) {
    if (device.storage !== 'separe') return `Vous êtes dans l’application. Elle s’ouvre d’un ${device.desktop ? 'clic' : 'toucher'}, sans barre d’adresse.`
    // Sur iPhone et iPad, l'application a pu être ajoutée depuis Safari, Chrome, Edge ou Firefox : elle ne sait pas lequel
    const mac = device.os === 'mac'
    return started
      ? `Vous êtes dans l’application. Elle a son propre espace\u00a0: ce que vous y changez n’arrive pas dans ${mac ? 'Safari' : 'le navigateur'}.`
      : `Vous êtes dans l’application. Elle démarre vide\u00a0: sur ${mac ? 'Mac' : noun(device)}, elle ne voit pas les réponses ${mac ? 'de Safari' : 'du navigateur'}.`
  }
  if (device.key === 'inApp') return 'Cette fenêtre ne sait pas installer Isoloir\u00a0: ouvrez d’abord cette page dans votre navigateur, elle y montrera les gestes.'
  if (device.key === 'macFirefox') return 'Isoloir ouvert d’un clic, sans rien télécharger ni compte. Sur cet ordinateur, Firefox n’installe pas les sites\u00a0: voici le plus proche.'
  if (device.desktop) return 'Isoloir dans sa propre fenêtre, ouvert d’un clic. Rien à télécharger, aucun compte\u00a0: il s’installe depuis cette page.'
  if (device.os === 'iphone' || device.os === 'ipad')
    return 'Une icône Isoloir sur l’écran d’accueil, comme une application. Rien à télécharger ni à chercher dans l’App Store, aucun compte\u00a0: elle s’ajoute depuis cette page.'
  if (device.os === 'android')
    return 'Une icône Isoloir sur l’écran d’accueil, comme une application. Rien à télécharger ni à chercher dans le Play Store, aucun compte\u00a0: elle s’installe depuis cette page.'
  return 'Une icône Isoloir sur l’écran d’accueil, comme une application. Rien à télécharger, aucun compte\u00a0: elle s’ajoute depuis cette page.'
}

/** La partie propre à l'appareil */
function Main({ ctx }: { ctx: Ctx }) {
  const { device } = ctx
  if (device.installed) return <InApp ctx={ctx} />
  switch (device.key) {
    case 'ios26':
    case 'ios18':
    case 'iosOther':
      return <Ios ctx={ctx} />
    case 'andChrome':
    case 'andSamsung':
    case 'andFirefox':
    case 'deskChrome':
    case 'deskEdge':
      return <AndroidOrDesk ctx={ctx} />
    case 'macSafari':
      return <MacSafari ctx={ctx} />
    case 'winFirefox':
      return <WinFirefox ctx={ctx} />
    default:
      return <Plain ctx={ctx} guide={GUIDES[device.key]} />
  }
}

/** « Copier le code », dans le geste même ; refusé, le code en clair à sélectionner, ou la page de transfert */
function CopyBody({ ctx, next }: { ctx: Ctx; next: number }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'refused'>('idle')
  const { code, count, device } = ctx
  if (!code) {
    return (
      <>
        <p>Le code de vos réponses n’a pas pu être fabriqué ici. Passez par la page de transfert.</p>
        <a class="btn-text" href={link('/autre-appareil')}>
          <Icon name="qr" />
          {MENU.transfer}
        </a>
      </>
    )
  }
  const copy = () => {
    const clip = typeof navigator === 'undefined' ? undefined : navigator.clipboard
    if (!clip?.writeText) {
      setStatus('refused')
      return
    }
    // Appelé dans le geste : Safari refuse une copie faite plus tard
    clip.writeText(code).then(
      () => setStatus('copied'),
      () => setStatus('refused'),
    )
  }
  return (
    <>
      <p>
        {count > 1 ? `Copiez vos ${answersOf(count)}\u00a0: elles passeront` : 'Copiez votre réponse\u00a0: elle passera'} dans l’application par ce code.
      </p>
      <button type="button" class="btn-primary" onClick={copy}>
        <Icon name="copy" />
        {MENU.copyCode}
      </button>
      <p class="step-status" role="status">
        {status === 'copied' ? (
          <>
            <Icon name="check" />
            Code copié. Passez au geste {next}.
          </>
        ) : status === 'refused' ? (
          device.desktop ? (
            `${device.browser || 'Le navigateur'} n’a pas pu copier. Sélectionnez le code, puis copiez-le.`
          ) : (
            `${device.browser || 'Le navigateur'} n’a pas pu copier. Touchez longuement le code, puis ${q('Copier')}.`
          )
        ) : null}
      </p>
      {status === 'refused' ? (
        <>
          <p class="code-text" aria-label="Code de vos réponses">
            {groupCode(code).map((g, i) => (
              <span key={i} class="code-group">
                {g}
              </span>
            ))}
          </p>
          <a class="btn-text" href={link('/autre-appareil')}>
            <Icon name="qr" />
            Ou passez par {q(MENU.transfer)}
          </a>
        </>
      ) : null}
      <p class="step-note">
        {/* Le presse-papiers n'est pas qu'à Isoloir : le dire au geste même, pas seulement dans la notice de confidentialité */}
        Le code contient toutes vos réponses.{' '}
        {device.os === 'iphone' || device.os === 'ipad' || device.os === 'mac'
          ? 'Le presse-papiers peut passer sur vos autres appareils Apple, et d’autres applications peuvent le lire\u00a0: Isoloir le vide après l’import.'
          : 'D’autres applications peuvent lire le presse-papiers, et l’historique du presse-papiers de Windows, s’il est activé, en garde une copie\u00a0: Isoloir le vide après l’import.'}
      </p>
    </>
  )
}

/** Dans l'application à part : coller le code */
function PasteBody({ ctx }: { ctx: Ctx }) {
  const phone = !ctx.device.desktop
  // Hors des appareils d'Apple (Firefox sous Windows), l'import n'a pas de bouton « Coller le code » : son champ, au clavier
  if (ctx.device.storage !== 'separe') {
    return (
      <>
        <p>
          Cliquez <B>{MENU.importMine}</B>, en bas de page. Collez le code (Ctrl&nbsp;+&nbsp;V) dans <B>{MENU.typeCode}</B>, puis cliquez{' '}
          <B>{MENU.readCode}</B>.
        </p>
        <p>
          Vérifiez le nombre de réponses, puis cliquez <B>{MENU.importThese}</B>.
        </p>
      </>
    )
  }
  return (
    <>
      <p>
        {phone ? 'Touchez' : 'Cliquez'} <B>{MENU.importMine}</B>, puis <B>{MENU.pasteCode}</B>.
        {phone ? (
          <>
            {' '}
            Si l’{noun(ctx.device)} affiche {q(MENU.iosPaste)}, touchez-le.
          </>
        ) : null}
      </p>
      {phone ? <IosPaste /> : null}
      <p>
        Vérifiez le nombre de réponses, puis {phone ? 'touchez' : 'cliquez'} <B>{MENU.importThese}</B>.
      </p>
    </>
  )
}

/** Ensuite : répondre dans l'application ; effacer, si l'on veut, la copie du navigateur */
function After({ browser }: { browser: string }) {
  return (
    <>
      <p class="install-after">
        <Icon name="check" />
        Ensuite, répondez dans l’application&nbsp;: ce que vous changerez dans {browser} n’y arrivera pas.
      </p>
      <p class="small install-after-note">
        Vous pouvez effacer la copie restée dans {browser}&nbsp;: {q(MENU.erase)}, en bas de page.
      </p>
    </>
  )
}

/** Pourquoi copier d'abord : l'application a son propre espace */
function Why({ ctx, browser, children }: { ctx: Ctx; browser: string; children?: preact.ComponentChildren }) {
  const where = ctx.device.os === 'mac' ? 'sur ce Mac' : `sur cet ${noun(ctx.device)}`
  return (
    <section class="install-section" aria-labelledby="pourquoi-t">
      <h2 id="pourquoi-t" class="install-title">
        Pourquoi copier d’abord&nbsp;?
      </h2>
      <figure class="install-figure">
        <Apart where={where} count={answersOf(ctx.count)} browser={browser} />
      </figure>
      <p>
        {ctx.device.os === 'mac' ? 'Sur Mac' : `Sur ${noun(ctx.device)}`}, l’application a son propre espace, séparé de {browser}&nbsp;: elle
        démarre vide. C’est vous qui y faites passer vos réponses, une fois.
      </p>
      {children}
    </section>
  )
}

/** iPhone et iPad : Safari d'iOS 26 ou 18, ou un autre navigateur ; copier d'abord quand il y a des réponses */
function Ios({ ctx }: { ctx: Ctx }) {
  const { device, host, started } = ctx
  const ipad = device.os === 'ipad'
  const safari = device.key !== 'iosOther'
  const ios26 = device.key === 'ios26'
  const browser = device.browser || 'le navigateur'
  const name = noun(device)
  const copyFirst = started
  const items: Gesture[] = []
  if (copyFirst) items.push({ where: `Ici, dans ${browser}`, body: <CopyBody ctx={ctx} next={2} /> })
  // Le bouton Partager : derrière « ••• » sur l'iPhone d'iOS 26 (disposition « Compacte »), dans la barre du bas sur
  // celui d'iOS 18, en haut à droite sur iPad ; ailleurs, dans la barre d'adresse ou le menu
  if (safari && !ipad && ios26) {
    items.push({
      body: (
        <>
          <p>
            Touchez <B>{MENU.iosMore}</B>, à droite de l’adresse, en bas de l’écran.
          </p>
          <Ios26More host={host} />
          <p class="step-hint">
            Vous voyez déjà le bouton Partager (un carré et sa flèche)&nbsp;? Touchez-le et passez au geste {items.length + 3}.
          </p>
        </>
      ),
    })
    items.push({
      body: (
        <>
          <p>
            Touchez <B>{MENU.iosShare}</B>.
          </p>
          <Ios26Menu />
        </>
      ),
    })
  } else if (safari && !ipad) {
    items.push({
      body: (
        <>
          <p>
            Touchez le bouton <B>{MENU.iosShare}</B>, au milieu de la barre du bas.
          </p>
          <Ios18Share host={host} />
        </>
      ),
    })
  } else {
    items.push({
      body: (
        <>
          <p>
            Touchez le bouton Partager (un carré et sa flèche),{' '}
            {safari ? 'en haut à droite' : 'dans la barre d’adresse ou dans le menu'}. Pas en vue&nbsp;? Touchez <Sym s={MENU.iosMore} />, puis{' '}
            {q(MENU.iosShare)}.
          </p>
          {safari ? null : (
            <p class="step-hint">
              Pas de {q(MENU.iosHome)} au geste suivant&nbsp;? Ouvrez cette page dans Safari.
            </p>
          )}
        </>
      ),
    })
  }
  items.push({
    body: (
      <>
        <p>
          Touchez <B>{MENU.iosHome}</B>. Pas en vue&nbsp;? Faites défiler la liste.
        </p>
        <IosHome />
      </>
    ),
  })
  const addAt = items.length + 1
  items.push({
    body: ios26 ? (
      <>
        <p>
          Laissez <B>{MENU.iosWebApp}</B> activé, puis touchez <B>{MENU.iosAdd}</B>.
        </p>
        <IosAdd host={host} ios26 />
        <p class="step-hint">Ce réglage peut s’appeler {q(MENU.iosWebAppOther)}.</p>
      </>
    ) : safari ? (
      <>
        <p>
          Touchez <B>{MENU.iosAdd}</B>.
        </p>
        <IosAdd host={host} ios26={false} />
      </>
    ) : (
      <p>
        Touchez <B>{MENU.iosAdd}</B>, en haut à droite.
      </p>
    ),
  })
  items.push({
    where: 'Sur l’écran d’accueil',
    body: (
      <>
        <p>
          Touchez l’icône d’<strong>Isoloir</strong>. Si l’{name} est resté dans {browser}, revenez d’abord à l’écran d’accueil.
        </p>
        <IosIcon />
        <p class="step-note">Ouvrez-la une première fois avec du réseau&nbsp;: elle garde ensuite sa propre copie hors ligne.</p>
      </>
    ),
  })
  if (copyFirst) items.push({ where: 'Dans l’application', body: <PasteBody ctx={ctx} /> })

  return (
    <>
      <section class="install-section" aria-labelledby="ajout-t">
        <h2 id="ajout-t" class="install-title">
          Ajoutez Isoloir à l’écran d’accueil
        </h2>
        <p class="install-say">
          {copyFirst
            ? `Après ${q(MENU.iosAdd)}, l’${name} peut quitter ${browser}\u00a0: copiez d’abord vos réponses.`
            : 'Pas encore de réponses ici\u00a0: installez, puis répondez dans l’application. Rien à faire passer.'}
        </p>
        <Gestures items={items} />
        {copyFirst ? <After browser={browser} /> : null}
      </section>
      {copyFirst ? (
        <Why ctx={ctx} browser={device.browser || 'le navigateur'}>
          {ios26 ? (
            <details class="how-to">
              <summary>
                <Icon name="chevron" class="disclosure" />
                <span class="summary-label">Ne rien transférer&nbsp;?</span>
              </summary>
              <p>
                Au geste {addAt}, désactivez {q(MENU.iosWebApp)}&nbsp;: l’icône ouvrira Isoloir dans Safari, avec vos réponses. Un simple
                raccourci vers Safari, pas une application à part.
              </p>
            </details>
          ) : safari ? (
            <p class="small">Sur iOS 18 et avant, l’icône ouvre toujours l’application à part&nbsp;: pas de raccourci vers Safari.</p>
          ) : null}
        </Why>
      ) : null}
    </>
  )
}

/**
 * Le bouton du navigateur (Android, Chrome, Edge…), quand il a annoncé qu'il sait installer. Il reste en place tant que
 * la fenêtre du navigateur est ouverte ; ce qu'il en advient se dit dans un statut toujours présent (lu par les lecteurs
 * d'écran), et le focus y passe quand le bouton s'en va
 */
function Native({ ctx }: { ctx: Ctx }) {
  const [status, setStatus] = useState('')
  const [asking, setAsking] = useState(false)
  const said = useRef<HTMLParagraphElement>(null)
  /** Le bouton a servi : à son départ, le focus passe au message */
  const used = useRef(false)
  const { device, offer, done } = ctx
  const where = device.desktop ? 'le Dock, le menu Démarrer ou le lanceur d’applications' : 'l’écran d’accueil, ou la liste de vos applications'
  const installed = `Isoloir est installé. Ouvrez-le depuis ${where}.`
  const message = done ? installed : status
  // Dans le même rendu que le départ du bouton : le focus ne passe jamais par la page entière
  useLayoutEffect(() => {
    const active = document.activeElement
    if (message && used.current && (!active || active === document.body)) said.current?.focus()
  }, [message, offer])
  const browser = device.browser || 'Le navigateur'
  const go = () => {
    if (asking) return
    used.current = true
    setAsking(true)
    void install().then(outcome => {
      setAsking(false)
      if (outcome === 'accepted') setStatus(installed)
      else if (outcome === 'dismissed') setStatus('Installation annulée. Le menu du navigateur la propose aussi, ci-dessous.')
    })
  }
  return (
    <div class={offer || message ? 'install-native' : 'install-native is-empty'}>
      {offer && !done ? (
        <>
          {/* aria-disabled, pas disabled : le bouton garde le focus pendant que la fenêtre du navigateur est ouverte */}
          <button type="button" class="btn-primary" aria-disabled={asking || undefined} onClick={go}>
            <Icon name={device.desktop ? 'install-desktop' : 'install'} />
            Installer Isoloir
          </button>
          <p>
            {device.desktop
              ? `${browser} vous demande de confirmer. Isoloir s’ouvre ensuite dans sa fenêtre, depuis ${where}.`
              : `${device.os === 'android' ? 'Android' : browser} vous demande de confirmer. L’icône arrive sur ${where}.`}
          </p>
        </>
      ) : null}
      <div role="status">
        {message ? (
          <p ref={said} tabIndex={-1} class={message === installed ? 'install-after install-native-done' : 'install-native-status'}>
            {message === installed ? <Icon name="check" /> : null}
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Android (Chrome, Samsung Internet, Firefox), ordinateur avec Chrome ou Edge : l'application lit les mêmes réponses */
function AndroidOrDesk({ ctx }: { ctx: Ctx }) {
  const { device, host, offer, started, count } = ctx
  const key = device.key
  const browser = device.browser
  const desktop = device.desktop
  const items: Gesture[] = []
  if (key === 'andChrome') {
    items.push({
      body: (
        <>
          <p>
            Touchez <B>{MENU.androidMore}</B>, à côté de l’adresse (en haut ou en bas de l’écran).
          </p>
          <AndroidMore host={host} />
        </>
      ),
    })
    items.push({
      body: (
        <>
          <p>
            Touchez le choix avec <B>{MENU.androidWords[0]}</B> ou <B>{MENU.androidWords[1]}</B>. Son nom change selon la version de Chrome.
          </p>
          <AndroidMenu />
        </>
      ),
    })
    items.push({
      body: (
        <>
          <p>
            Touchez <B>{MENU.install}</B>.
          </p>
          <AndroidConfirm host={host} />
        </>
      ),
    })
  } else if (key === 'andSamsung') {
    items.push({
      body: (
        <p>
          Touchez <B>{MENU.samsungMenu}</B>, puis <B>{MENU.samsungAddTo}</B>.
        </p>
      ),
    })
    items.push({
      body: (
        <p>
          Touchez <B>{MENU.samsungHome}</B>, puis confirmez.
        </p>
      ),
    })
  } else if (key === 'andFirefox') {
    items.push({
      body: (
        <p>
          Touchez <B>{MENU.androidMore}</B>, puis le choix avec <B>{MENU.androidWords[0]}</B> ou <B>{MENU.androidWords[1]}</B>.
        </p>
      ),
    })
    items.push({ body: <p>Confirmez.</p> })
  } else if (key === 'deskChrome') {
    items.push({
      body: (
        <>
          <p>Cliquez l’icône d’installation, au bout de la barre d’adresse.</p>
          <DeskBar host={host} />
          <p class="step-hint">
            Pas d’icône&nbsp;? Menu <Spoken text={path(MENU.chromeDesk)} />.
          </p>
        </>
      ),
    })
    items.push({
      body: (
        <p>
          Cliquez <B>{MENU.install}</B>.
        </p>
      ),
    })
  } else {
    items.push({
      body: (
        <>
          <p>Cliquez l’icône d’installation, dans la barre d’adresse (trois carrés et un plus).</p>
          <p class="step-hint">
            Pas d’icône&nbsp;? Menu <Spoken text={path(MENU.edgeDesk)} />.
          </p>
        </>
      ),
    })
    items.push({
      body: (
        <p>
          Cliquez <B>{MENU.install}</B>.
        </p>
      ),
    })
  }
  const by = desktop ? 'Par la barre d’adresse' : `Par le menu de ${browser}`
  return (
    <>
      <section class="install-section" aria-labelledby="ajout-t">
        <h2 id="ajout-t" class="install-title">
          {desktop ? 'Installez Isoloir sur cet ordinateur' : 'Ajoutez Isoloir à l’écran d’accueil'}
        </h2>
        <Native ctx={ctx} />
        <p class="install-or">{offer ? `Ou ${by[0]!.toLowerCase()}${by.slice(1)}\u00a0:` : `${by}\u00a0:`}</p>
        <Gestures items={items} />
      </section>
      <section class="install-section" aria-labelledby="reponses-t">
        <h2 id="reponses-t" class="install-title">
          Vos réponses vous suivent
        </h2>
        <p class="install-say">
          L’application installée depuis {browser} lit les réponses gardées par {browser}.{' '}
          {started ? (
            <>
              Rien à transférer&nbsp;: vos <span class="tab">{count}</span>&nbsp;réponse{count > 1 ? 's' : ''} y {count > 1 ? 'sont' : 'est'}.
            </>
          ) : (
            'Rien à transférer.'
          )}
        </p>
        <figure class="install-figure">
          <Shared where={desktop ? 'sur cet ordinateur' : 'sur ce téléphone'} browser={browser} count={started ? answersOf(count) : 'vos réponses'} phone={!desktop} />
          <figcaption>Depuis un autre navigateur, l’application aurait les réponses de ce navigateur-là, pas celles de {browser}.</figcaption>
        </figure>
        {desktop ? null : (
          <a class="btn-text" href={link('/autre-appareil/importer')}>
            <Icon name="camera" />
            Vos réponses sont sur un autre appareil&nbsp;? Importez-les
          </a>
        )}
      </section>
    </>
  )
}

/** Mac, avec Safari : « Ajouter au Dock » crée une application à part ; copier d'abord */
function MacSafari({ ctx }: { ctx: Ctx }) {
  const { started } = ctx
  const items: Gesture[] = []
  if (started) items.push({ where: 'Ici, dans Safari', body: <CopyBody ctx={ctx} next={2} /> })
  items.push({
    body: (
      <p>
        Menu <B>{MENU.macFile}</B>, puis <B>{MENU.macDock}</B> (macOS Sonoma ou plus récent).
      </p>
    ),
  })
  items.push({
    body: (
      <p>
        Cliquez <B>{MENU.iosAdd}</B>. Isoloir s’ouvre ensuite dans sa fenêtre, depuis le Dock.
      </p>
    ),
  })
  if (started) items.push({ where: 'Dans l’application', body: <PasteBody ctx={ctx} /> })
  return (
    <>
      <section class="install-section" aria-labelledby="ajout-t">
        <h2 id="ajout-t" class="install-title">
          Ajoutez Isoloir au Dock
        </h2>
        <p class="install-say">
          {started
            ? 'Le Mac en fait une application à part, qui démarre vide\u00a0: copiez d’abord vos réponses.'
            : 'Pas encore de réponses ici\u00a0: installez, puis répondez dans l’application. Rien à faire passer.'}
        </p>
        <Gestures items={items} />
        {started ? <After browser="Safari" /> : null}
      </section>
      {started ? <Why ctx={ctx} browser="Safari" /> : null}
    </>
  )
}

/** Windows, avec Firefox : l'icône d'application de la barre d'adresse ; les réponses, à faire passer si elle est vide */
function WinFirefox({ ctx }: { ctx: Ctx }) {
  const { started } = ctx
  return (
    <section class="install-section" aria-labelledby="ajout-t">
      <h2 id="ajout-t" class="install-title">
        Installez Isoloir sur cet ordinateur
      </h2>
      <Gestures
        items={[
          { body: <p>Cliquez l’icône d’application, au bout de la barre d’adresse (Firefox 143 ou plus récent), puis confirmez.</p> },
          ...(started
            ? [
                { where: 'Si l’application s’ouvre vide, ici dans Firefox', body: <CopyBody ctx={ctx} next={3} /> },
                { where: 'Dans l’application', body: <PasteBody ctx={ctx} /> },
              ]
            : []),
        ]}
      />
    </section>
  )
}

/** Les autres cas : les mots de la liste, en grand ; le bouton du navigateur s'il sait installer */
function Plain({ ctx, guide }: { ctx: Ctx; guide: Guide }) {
  const { device, started } = ctx
  const key: DeviceKey = device.key
  if (key === 'other') {
    return ctx.offered || ctx.done ? (
      <section class="install-section" aria-labelledby="ajout-t">
        <h2 id="ajout-t" class="install-title">
          Ce navigateur sait installer Isoloir
        </h2>
        <Native ctx={ctx} />
      </section>
    ) : null
  }
  const title = key === 'inApp' ? 'Ouvrez d’abord votre navigateur' : key === 'macFirefox' ? 'Gardez Isoloir en marque-page' : guide.name
  return (
    <section class="install-section" aria-labelledby="ajout-t">
      <h2 id="ajout-t" class="install-title">
        {title}
      </h2>
      {guide.lead ? (
        <p class="install-say is-plain">
          <Spoken text={guide.lead} />
        </p>
      ) : null}
      {key === 'inApp' && started ? (
        <a class="btn-text" href={link('/autre-appareil')}>
          <Icon name="qr" />
          {MENU.transfer}
        </a>
      ) : null}
    </section>
  )
}

/** Dans l'application installée */
function InApp({ ctx }: { ctx: Ctx }) {
  const { device, host, started, count } = ctx
  const apart = device.storage === 'separe'
  const mac = device.os === 'mac'
  // Sur iPhone et iPad, l'application a pu être ajoutée depuis Safari, Chrome, Edge ou Firefox : elle ne sait pas lequel.
  // Sur Mac, seul Safari en fait une application à part
  const from = mac ? 'Safari' : 'le navigateur'
  // L'iPhone garde les réponses de l'application (stockage persistant) : on ne le dit que s'il le confirme
  const [kept, setKept] = useState(false)
  useEffect(() => {
    if (!apart) return
    let alive = true
    navigator.storage
      ?.persisted?.()
      .then(v => alive && setKept(v))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [apart])
  const name = mac ? 'Mac' : noun(device)
  const keptLine = kept ? (
    <p>
      Ici, dans l’application, {mac ? 'le Mac' : `l’${name}`} garde vos réponses&nbsp;; dans Safari, il peut les effacer si vous n’y
      revenez pas pendant un moment.
    </p>
  ) : null

  // Firefox sous Windows, ou un navigateur non reconnu : l'application peut démarrer vide comme lire les réponses du
  // navigateur ; ouverte sans réponse, comment les faire passer
  if (device.storage === 'inconnu' && !started) return <MaybeEmpty ctx={ctx} />

  if (!apart || started) {
    return (
      <section class="install-section" aria-labelledby="reponses-t">
        <h2 id="reponses-t" class="install-title">
          Vos réponses
        </h2>
        <p class="install-say">
          {started
            ? count > 1
              ? `Vos ${count}\u00a0réponses sont ici, sur cet appareil.`
              : 'Votre réponse est ici, sur cet appareil.'
            : 'Pas encore de réponses ici\u00a0: répondez dans l’application.'}{' '}
          {apart
            ? `Ce que vous changez ici n’arrive pas dans ${from}, ni l’inverse.`
            : device.storage === 'partage'
              ? `L’application et ${device.browser || 'le navigateur'} lisent les mêmes.`
              : ''}
        </p>
        {keptLine}
        {started ? null : (
          <p>
            <a class="btn-text" href={link('/feuille/1')}>
              {CTA_START}
              <Icon name="arrow-right" />
            </a>
          </p>
        )}
      </section>
    )
  }

  const phone = !mac
  return (
    <>
      <section class="install-section" aria-labelledby="reponses-t">
        <h2 id="reponses-t" class="install-title">
          Vos réponses sont restées dans {from}&nbsp;?
        </h2>
        <p class="install-say">Faites-les passer une fois, en deux gestes.</p>
        <Gestures
          items={[
            {
              where: `Dans ${from}`,
              body: (
                <>
                  <p>
                    {phone
                      ? 'Ouvrez le navigateur où vous aviez répondu (Safari, Chrome…)\u00a0: glissez vers le haut depuis le bas de l’écran, ou touchez son icône.'
                      : 'Revenez dans Safari.'}
                  </p>
                  <p>
                    En bas de la page d’Isoloir, {phone ? 'touchez' : 'cliquez'} <B>{MENU.installPage}</B>, puis <B>{MENU.copyCode}</B>.
                  </p>
                  <p class="step-hint">Onglet fermé&nbsp;? Tapez {host}.</p>
                </>
              ),
            },
            {
              where: 'Ici, dans l’application',
              body: (
                <>
                  <p>
                    Revenez ici, puis {phone ? 'touchez' : 'cliquez'} <B>{MENU.importMine}</B>&nbsp;: la page s’ouvre sur {q(MENU.pasteCode)}.
                  </p>
                  <a class="btn-primary" href={link('/autre-appareil/importer')}>
                    <Icon name="paste" />
                    {MENU.importMine}
                  </a>
                </>
              ),
            },
          ]}
        />
        <NotYet />
      </section>
      <section class="install-section" aria-labelledby="pourquoi-t">
        <h2 id="pourquoi-t" class="install-title">
          Pourquoi elle démarre vide
        </h2>
        <figure class="install-figure">
          <Apart where={mac ? 'sur ce Mac' : `sur cet ${name}`} count="vos réponses" browser={from} />
        </figure>
        <p>
          Sur {name}, l’application a son propre espace, séparé {mac ? 'de Safari' : 'du navigateur'}. Rien ne passe de l’un à l’autre sans
          vous.
        </p>
        {keptLine}
      </section>
    </>
  )
}

/** Pas encore de réponses : répondre ici, rien à faire passer */
function NotYet() {
  return (
    <>
      <p class="install-after">
        <Icon name="check" />
        Pas encore de réponses&nbsp;? Répondez ici, dans l’application&nbsp;: rien à faire passer.
      </p>
      <p class="install-after-link">
        <a class="btn-text" href={link('/feuille/1')}>
          {CTA_START}
          <Icon name="arrow-right" />
        </a>
      </p>
    </>
  )
}

/**
 * L'application installée depuis Firefox sous Windows, ou depuis un navigateur non reconnu, ouverte sans réponse : elle
 * démarre peut-être vide (on ne sait pas si elle voit les réponses du navigateur). Son import n'a pas de bouton « Coller
 * le code » : le code se colle dans son champ
 */
function MaybeEmpty({ ctx }: { ctx: Ctx }) {
  const { device, host } = ctx
  const browser = device.browser || 'le navigateur'
  const phone = !device.desktop
  const act = phone ? 'touchez' : 'cliquez'
  // Firefox sous Windows : « Copier le code » de cette page dans le navigateur ; ailleurs, celui de la page de transfert
  const page = device.key === 'winFirefox' ? MENU.installPage : MENU.transfer
  const keys = device.os === 'mac' ? '⌘\u00a0+\u00a0V' : 'Ctrl\u00a0+\u00a0V'
  return (
    <section class="install-section" aria-labelledby="reponses-t">
      <h2 id="reponses-t" class="install-title">
        Vos réponses sont restées dans {browser}&nbsp;?
      </h2>
      <p class="install-say">Pas encore de réponses ici. Si vous aviez répondu dans {browser}, faites-les passer une fois, en deux gestes.</p>
      <Gestures
        items={[
          {
            where: `Dans ${browser}`,
            body: (
              <>
                <p>
                  En bas de la page d’Isoloir, {act} <B>{page}</B>, puis <B>{MENU.copyCode}</B>.
                </p>
                <p class="step-hint">Onglet fermé&nbsp;? Tapez {host}.</p>
              </>
            ),
          },
          {
            where: 'Ici, dans l’application',
            body: (
              <>
                <p>
                  {phone ? 'Touchez' : 'Cliquez'} <B>{MENU.importMine}</B>. Collez le code dans <B>{MENU.typeCode}</B>{' '}
                  {phone ? `(touchez longuement le champ, puis ${q(MENU.iosPaste)})` : `(${keys})`}, puis {act} <B>{MENU.readCode}</B>.
                </p>
                <a class="btn-primary" href={link('/autre-appareil/importer')}>
                  <Icon name="paste" />
                  {MENU.importMine}
                </a>
              </>
            ),
          },
        ]}
      />
      <NotYet />
    </section>
  )
}

/** Sur ordinateur : un QR code qui ouvre cette page sur le téléphone. Il porte l'adresse publique de la page, rien d'autre */
function PhoneCard({ started }: { started: boolean }) {
  const [qr, setQr] = useState<{ d: string; side: number } | null>(null)
  useEffect(() => {
    let alive = true
    const url = `${location.origin}${location.pathname}${link('/installer')}`
    // La bibliothèque des QR codes, un fichier à part, la même que celle de la page de transfert ; le dessin, comme le sien
    // (core/transfer/qr.ts) : une rangée de modules sombres contigus par segment, marge de 2
    import('qr')
      .then(({ default: encodeQR }) => {
        if (!alive) return
        const rows = encodeQR(url, 'raw', { ecc: 'medium', border: 2 })
        let d = ''
        rows.forEach((row, y) => {
          for (let x = 0; x < row.length; x++) {
            if (!row[x]) continue
            const start = x
            while (row[x + 1]) x++
            d += `M${start} ${y}h${x + 1 - start}v1h${start - x - 1}z`
          }
        })
        setQr({ d, side: rows.length })
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  if (!qr) return null
  return (
    <div class="install-phone">
      <div class="qr-plate">
        <svg class="qr" viewBox={`0 0 ${qr.side} ${qr.side}`} role="img" aria-label="QR code de l’adresse de cette page">
          <path d={qr.d} />
        </svg>
      </div>
      <div>
        <p class="install-phone-title">Sur votre téléphone&nbsp;?</p>
        <p>Visez ce code avec l’appareil photo&nbsp;: il ouvre cette page, rien d’autre.</p>
        {started ? (
          <p>
            Pour y emporter vos réponses, ensuite, sur cet ordinateur&nbsp;: <a href={link('/autre-appareil')}>{MENU.transfer}</a>.
          </p>
        ) : null}
      </div>
    </div>
  )
}

/** Les autres appareils : des lignes repliables, rangées par famille ; chacune dit ce qui arrive aux réponses */
function Others({ sectionRef, keys, open, title }: { sectionRef: RefObject<HTMLElement>; keys: DeviceKey[]; open: DeviceKey | null; title: string }) {
  // Le nom de la famille, au-dessus de son premier appareil
  const firsts = new Set(keys.filter((k, i) => i === 0 || GUIDES[keys[i - 1]!].group !== GUIDES[k].group))
  return (
    <section class="install-section install-others-section" id="autres" tabIndex={-1} aria-labelledby="autres-t" ref={sectionRef}>
      <h2 id="autres-t" class="install-title">
        {title}
      </h2>
      <p class="install-say is-plain">Vos réponses restent dans le navigateur où vous avez répondu.</p>
      <ul class="install-others">
        {keys.flatMap(k => {
          const g = GUIDES[k]
          const head = firsts.has(k) ? (
            <li key={`g-${g.group}`} class="other-group" aria-hidden="true">
              {g.group}
            </li>
          ) : null
          return [
            head,
            <li key={k}>
              <details open={k === open}>
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="other-name">{g.name}</span>
                  <span class="other-state">{g.state}</span>
                </summary>
                <div class="other-body">
                  {g.lead ? (
                    <p>
                      <Spoken text={g.lead} />
                    </p>
                  ) : null}
                  {g.steps ? (
                    <ol>
                      {g.steps.map(s => (
                        <li key={s}>
                          <Spoken text={s} />
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {g.after?.map(s => (
                    <p key={s}>
                      <Spoken text={s} />
                    </p>
                  ))}
                </div>
              </details>
            </li>,
          ]
        })}
      </ul>
    </section>
  )
}
