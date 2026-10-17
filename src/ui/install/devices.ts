// Les mots des menus de chaque navigateur, tels que la page « Installer l'application » les cite (ui/screens/Install.tsx),
// et la liste « Sur un autre appareil ». Tous ici : quand iOS, Android ou Chrome renomment un choix de menu, une ligne
// suffit. Relevés le 17 octobre 2026 dans les notices des éditeurs et la presse ; ceux qui n'ont pas été vus sur un vrai
// appareil restent prudents (« le choix avec… », « s'il est là ») ou donnent les deux noms connus.

import type { Device, DeviceKey } from '../../core/install'

/** Un mot de menu, entre guillemets français et espaces insécables */
export const q = (s: string): string => `«\u00a0${s}\u00a0»`

/** Les choix de menu cités, un par ligne */
export const MENU = {
  // iPhone et iPad, Safari d'iOS 26 (disposition « Compacte », celle par défaut) et d'iOS 18
  iosMore: '•••',
  iosShare: 'Partager',
  iosHome: 'Sur l’écran d’accueil',
  // iOS 26 : le réglage de la fenêtre d'ajout, activé par défaut ; son nom français n'est pas encore relevé sur un iPhone
  iosWebApp: 'Ouvrir en tant qu’app web',
  iosWebAppOther: 'Ouvrir comme web app',
  iosAdd: 'Ajouter',
  // Dans l'application : la page d'import, puis la bulle de l'iPhone
  importMine: 'Importer mes réponses',
  pasteCode: 'Coller le code',
  iosPaste: 'Coller',
  importThese: 'Importer ces réponses',
  // Android : Chrome 150 a renommé le choix (« Install and create shortcut », libellé français à relever) : on le
  // désigne par ses mots stables
  androidMore: '⋮',
  androidWords: ['Installer', 'écran d’accueil'],
  install: 'Installer',
  samsungMenu: '≡',
  samsungAddTo: 'Ajouter la page à',
  samsungHome: 'Écran d’accueil',
  // Ordinateur
  chromeDesk: ['⋮', 'Caster, enregistrer et partager', 'Installer la page en tant qu’application…'],
  edgeDesk: ['…', 'Applications', 'Installer ce site en tant qu’application'],
  macFile: 'Fichier',
  macDock: 'Ajouter au Dock…',
  // Les fenêtres d'Instagram, Facebook, TikTok…
  inAppOpen: 'Ouvrir dans le navigateur',
  // Les pages d'Isoloir que les gestes citent
  installPage: 'Installer l’application',
  copyCode: 'Copier le code',
  transfer: 'Transférer mes réponses',
  erase: 'Tout effacer',
} as const

/** « ⋮ », « Caster… », « Installer… » : un chemin de menu */
export const path = (steps: readonly string[]): string => steps.map(q).join(', ')

/** Ce que deviennent les réponses, dit en mots (jamais par une couleur) */
const APART = 'Vos réponses\u00a0: à faire passer une fois'
const FOLLOW = 'Vos réponses suivent'

/** Les gestes du navigateur pour faire passer les réponses dans l'application à part */
const COPY_FIRST = `Ici, dans le navigateur\u00a0: ${q(MENU.installPage)} en bas de page, puis ${q(MENU.copyCode)}.`
const PASTE_IN_APP = `Dans l’application\u00a0: ${q(MENU.importMine)}, puis ${q(MENU.pasteCode)}.`

export interface Guide {
  group: 'iPhone et iPad' | 'Android' | 'Ordinateur' | 'Autres cas'
  name: string
  /** Ce que deviennent les réponses */
  state: string
  /** Un paragraphe avant les gestes */
  lead?: string
  steps?: string[]
  /** Des paragraphes après les gestes */
  after?: string[]
}

/** Chaque appareil, rangé par famille ; l'ordre est celui de la liste */
export const GUIDES: Record<DeviceKey, Guide> = {
  ios26: {
    group: 'iPhone et iPad',
    name: 'iPhone ou iPad, avec Safari (iOS 26)',
    state: APART,
    steps: [
      COPY_FIRST,
      `${q(MENU.iosMore)} (ou le bouton Partager, s’il est en vue), ${q(MENU.iosShare)}, ${q(MENU.iosHome)}, puis ${q(MENU.iosAdd)}.`,
      PASTE_IN_APP,
    ],
    after: ['Sur iPad, Partager est en haut à droite.'],
  },
  ios18: {
    group: 'iPhone et iPad',
    name: 'iPhone ou iPad, avec Safari (iOS 18 ou avant)',
    state: APART,
    steps: [
      COPY_FIRST,
      `Le bouton Partager (un carré et sa flèche, en bas sur iPhone, en haut à droite sur iPad), ${q(MENU.iosHome)}, puis ${q(MENU.iosAdd)}.`,
      PASTE_IN_APP,
    ],
  },
  iosOther: {
    group: 'iPhone et iPad',
    name: 'iPhone ou iPad, avec Chrome, Edge ou Firefox',
    state: APART,
    steps: [COPY_FIRST, `Le bouton Partager (un carré et sa flèche), dans la barre d’adresse ou dans le menu, ${q(MENU.iosHome)}, puis ${q(MENU.iosAdd)}.`, PASTE_IN_APP],
  },
  andChrome: {
    group: 'Android',
    name: 'Android, avec Chrome',
    state: FOLLOW,
    lead: `Le bouton ${q('Installer Isoloir')} s’affiche sur cette page. Sinon\u00a0:`,
    steps: [`${q(MENU.androidMore)}, à côté de l’adresse (en haut ou en bas).`, `Le choix avec ${MENU.androidWords.map(q).join(' ou ')}, puis ${q(MENU.install)}.`],
    after: ['L’application lit les réponses gardées par Chrome\u00a0: rien à transférer.'],
  },
  andSamsung: {
    group: 'Android',
    name: 'Android, avec Samsung Internet',
    state: FOLLOW,
    lead: `Le bouton ${q('Installer Isoloir')} s’affiche sur cette page. Sinon\u00a0: ${path([MENU.samsungMenu, MENU.samsungAddTo])}, puis ${q(MENU.samsungHome)}.`,
    after: ['L’application lit les réponses gardées par Samsung Internet\u00a0: rien à transférer.'],
  },
  andFirefox: {
    group: 'Android',
    name: 'Android, avec Firefox',
    state: FOLLOW,
    lead: `${q(MENU.androidMore)}, puis le choix avec ${MENU.androidWords.map(q).join(' ou ')}, et confirmez.`,
    after: ['L’application lit les réponses gardées par Firefox\u00a0: rien à transférer.'],
  },
  deskChrome: {
    group: 'Ordinateur',
    name: 'Ordinateur, avec Chrome',
    state: FOLLOW,
    lead: `Le bouton ${q('Installer Isoloir')} s’affiche sur cette page. Sinon\u00a0:`,
    steps: [`L’icône au bout de la barre d’adresse (un écran et une flèche), ou ${path(MENU.chromeDesk)}.`, `${q(MENU.install)}.`],
  },
  deskEdge: {
    group: 'Ordinateur',
    name: 'Ordinateur, avec Edge',
    state: FOLLOW,
    lead: `Le bouton ${q('Installer Isoloir')} s’affiche sur cette page. Sinon\u00a0:`,
    steps: [`L’icône dans la barre d’adresse (trois carrés et un plus), ou ${path(MENU.edgeDesk)}.`, `${q(MENU.install)}.`],
  },
  macSafari: {
    group: 'Ordinateur',
    name: 'Mac, avec Safari',
    state: APART,
    steps: [COPY_FIRST, `Menu ${q(MENU.macFile)}, ${q(MENU.macDock)}, puis ${q(MENU.iosAdd)} (macOS Sonoma ou plus récent).`, PASTE_IN_APP],
  },
  winFirefox: {
    group: 'Ordinateur',
    name: 'Windows, avec Firefox',
    state: 'Vos réponses\u00a0: à faire passer si elle est vide',
    lead: `L’icône d’application au bout de la barre d’adresse (Firefox 143 ou plus récent). Si l’application s’ouvre vide\u00a0: dans Firefox, ${q(MENU.installPage)} puis ${q(MENU.copyCode)}\u00a0; dans l’application, ${q(MENU.importMine)}, puis ${q(MENU.pasteCode)}.`,
  },
  macFirefox: {
    group: 'Ordinateur',
    name: 'Mac ou Linux, avec Firefox',
    state: 'Pas d’application\u00a0: un marque-page',
    lead: 'Firefox n’y installe pas les sites. Ajoutez Isoloir à vos marque-pages (⌘ + D sur Mac, Ctrl + D sous Linux)\u00a0: vos réponses restent dans Firefox.',
  },
  inApp: {
    group: 'Autres cas',
    name: 'Ouvert depuis Instagram, Facebook, TikTok…',
    state: 'Ouvrez d’abord votre navigateur',
    lead: `Ces applications ouvrent les liens dans leur propre fenêtre, qui ne sait pas installer. Touchez ${q(MENU.iosMore)}, puis ${q(MENU.inAppOpen)}, et suivez les gestes de ce navigateur. Les réponses données dans cette fenêtre y restent\u00a0: transférez-les.`,
  },
  other: {
    group: 'Autres cas',
    name: 'Autre navigateur (Brave, Opera, DuckDuckGo…)',
    state: `Cherchez ${q(MENU.install)} dans son menu`,
    lead: `Si ce navigateur sait installer, le bouton ${q('Installer Isoloir')} s’affiche sur cette page. Sinon, cherchez ${MENU.androidWords.map(q).join(' ou ')} dans son menu. Si l’application s’ouvre vide, faites passer vos réponses une fois.`,
  },
}

/** Les appareils de la liste, dans son ordre */
export const GUIDE_KEYS = Object.keys(GUIDES) as DeviceKey[]

/** L'appareil, comme la page le nomme (iPhone, iPad, Mac…) */
export function noun(d: Device): string {
  switch (d.os) {
    case 'iphone':
      return 'iPhone'
    case 'ipad':
      return 'iPad'
    case 'mac':
      return 'Mac'
    case 'android':
      return 'téléphone'
    default:
      return 'ordinateur'
  }
}

/** « Cet appareil » : son nom, et ce qui le précise (la version du système) */
export function deviceLine(d: Device): { value: string; sub?: string } {
  const browser = d.browser
  if (d.installed) {
    const where = d.os === 'iphone' ? 'iPhone' : d.os === 'ipad' ? 'iPad' : d.os === 'mac' ? 'Mac' : d.os === 'android' ? 'Android' : 'Ordinateur'
    return { value: `${where}, dans l’application` }
  }
  switch (d.key) {
    case 'ios26':
    case 'ios18':
      return { value: `${noun(d)}, avec Safari`, sub: d.version ? `${d.os === 'ipad' ? 'iPadOS' : 'iOS'} ${d.version}` : undefined }
    case 'iosOther':
      return { value: browser ? `${noun(d)}, avec ${browser}` : noun(d) }
    case 'andChrome':
    case 'andSamsung':
    case 'andFirefox':
      return { value: `Android, avec ${browser}` }
    case 'deskChrome':
    case 'deskEdge':
      return { value: d.os === 'mac' ? `Mac, avec ${browser}` : `Ordinateur, avec ${browser}` }
    case 'macSafari':
      return { value: 'Mac, avec Safari' }
    case 'winFirefox':
      return { value: 'Windows, avec Firefox' }
    case 'macFirefox':
      return { value: d.os === 'mac' ? 'Mac, avec Firefox' : 'Linux, avec Firefox' }
    case 'inApp':
      return { value: browser ? `Ouvert dans ${browser}` : 'Ouvert dans une application' }
    default:
      return { value: 'Non reconnu', sub: 'Choisissez le vôtre ci-dessous.' }
  }
}
