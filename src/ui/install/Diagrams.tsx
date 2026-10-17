// Les schémas des gestes de « Installer l'application » (ui/screens/Install.tsx), au trait comme ceux du site
// (components/Diagrams.tsx) : l'écran du téléphone à l'encre d'imprimerie, rien de rempli que le papier ; le geste à
// faire au bleu bille, un cadre autour du bouton, sa flèche et son mot (« touchez ») ; ce qui n'existe pas barré de rouge.
// Tous dessinés sur 280 unités de large et montrés à 280 px au plus : à l'échelle 1:1 dès 375 px d'écran (libellé de
// 14 px, légende de 12 px) ; plus étroits, ils rétrécissent avec leur colonne. Chaque mot dessiné est aussi écrit dans
// la phrase du geste.

import type { ComponentChildren } from 'preact'
import { Arrow } from '../components/Diagrams'

const W = 280
/** Le mot du geste, centré dans la colonne de droite (x 228 à 280) ; sa flèche part de 278 */
const WORD_X = 253

/** Un schéma de geste, avec son titre et sa description accessibles */
function Step({ id, title, desc, h, children, wide }: { id: string; title: string; desc: string; h: number; children: ComponentChildren; wide?: boolean }) {
  return (
    <svg class={wide ? 'diagram' : 'diagram step-dg'} viewBox={`0 0 ${W} ${h}`} role="img" aria-labelledby={`${id}-t ${id}-d`}>
      <title id={`${id}-t`}>{title}</title>
      <desc id={`${id}-d`}>{desc}</desc>
      {children}
    </svg>
  )
}

/** Le geste : un cadre bille autour du bouton, la flèche bille et son mot (une ou deux lignes) au-dessus */
function Tap({ x, y, w, h, word = 'touchez', ay = y + h / 2 }: { x: number; y: number; w: number; h: number; word?: string | string[]; ay?: number }) {
  const words = Array.isArray(word) ? word : [word]
  const top = ay - 8 - (words.length - 1) * 14
  return (
    <>
      <rect class="dg-tap" x={x} y={y} width={w} height={h} />
      <Arrow x1={278} y1={ay} x2={x + w + 5} y2={ay} tone="ink" />
      {words.map((t, i) => (
        <text key={t} class="dg-small dg-ink-text" x={WORD_X} y={top + i * 14} text-anchor="middle">
          {t}
        </text>
      ))}
    </>
  )
}

/** Une pointe de flèche seule, au bout d'un trait déjà tracé */
function Head({ x, y, angle }: { x: number; y: number; angle: number }) {
  const p = (s: number) => `${(x - 7 * Math.cos(angle + s)).toFixed(2)},${(y - 7 * Math.sin(angle + s)).toFixed(2)}`
  return (
    <g class="dg-ink">
      <polyline points={`${p(-0.45)} ${x},${y} ${p(0.45)}`} />
    </g>
  )
}

const Soft = ({ x1, y, x2 }: { x1: number; y: number; x2: number }) => <line class="dg-soft" x1={x1} y1={y} x2={x2} y2={y} />
const Hair = ({ x1, y, x2 }: { x1: number; y: number; x2: number }) => <line class="dg-hair" x1={x1} y1={y} x2={x2} y2={y} />

/** Trois points, ceux de « ••• » ou, debout, de « ⋮ » : pleins, comme des lettres */
function Dots({ cx, cy, r = 1.8, gap = 6, vertical = false }: { cx: number; cy: number; r?: number; gap?: number; vertical?: boolean }) {
  return (
    <>
      {[-gap, 0, gap].map(d => (
        <circle key={d} class="dg-dot" cx={vertical ? cx : cx + d} cy={vertical ? cy + d : cy} r={r} />
      ))}
    </>
  )
}

/** L'icône d'Isoloir, rognée à ses coins arrondis (en papier carbone, la tuile blanche ne dépasse pas) */
function AppIcon({ id, x, y, s }: { id: string; x: number; y: number; s: number }) {
  const r = Math.round(s * 2.2) / 10
  return (
    <>
      <clipPath id={`${id}-icon`}>
        <rect x={x} y={y} width={s} height={s} rx={r} />
      </clipPath>
      <image href="./apple-touch-icon.png" x={x} y={y} width={s} height={s} clip-path={`url(#${id}-icon)`} />
      <rect class="dg-icon-frame" x={x} y={y} width={s} height={s} rx={r} />
    </>
  )
}

/** Le bouton Partager d'iOS : un carré ouvert et sa flèche */
const ShareGlyph = ({ x, y }: { x: number; y: number }) => <path class="dg-glyph" d={`M${x} ${y + 9}v11h14V${y + 9}M${x + 7} ${y + 15}V${y}M${x + 3} ${y + 4}l4-4 4 4`} />

/** Un bas d'écran de téléphone, ouvert en haut (y0 → y1) */
const PhoneBottom = ({ y0, y1, r = 22 }: { y0: number; y1: number; r?: number }) => (
  <path class="dg-box dg-strong dg-open" d={`M3 ${y0}V${y1 - r}a${r} ${r} 0 0 0 ${r} ${r}H${225 - r}a${r} ${r} 0 0 0 ${r}-${r}V${y0}`} />
)

/** Un haut d'écran, ouvert en bas */
const PhoneTop = ({ y0, y1, r = 18 }: { y0: number; y1: number; r?: number }) => (
  <path class="dg-box dg-strong dg-open" d={`M3 ${y1}V${y0 + r}a${r} ${r} 0 0 1 ${r}-${r}H${225 - r}a${r} ${r} 0 0 1 ${r} ${r}V${y1}`} />
)

/** iPhone, Safari d'iOS 26, disposition « Compacte » (réglage par défaut) : en bas, retour, adresse, « ••• » */
export function Ios26More({ host }: { host: string }) {
  return (
    <Step id="dg-more" title="Le bouton plus de Safari" desc={`En bas de l’écran de Safari : le bouton retour, l’adresse ${host}, puis le bouton à trois points, à toucher.`} h={96}>
      <Soft x1={20} y={12} x2={150} />
      <Soft x1={20} y={26} x2={110} />
      <PhoneBottom y0={0} y1={92} />
      <circle class="dg-box" cx="29" cy="54" r="14" />
      <g class="dg-print">
        <polyline points="32,47 25,54 32,61" />
      </g>
      <rect class="dg-box" x="50" y="40" width="124" height="28" rx="14" />
      <text class="dg-small" x="112" y="58.5" text-anchor="middle">
        {host}
      </text>
      <circle class="dg-box" cx="196" cy="54" r="14" />
      <Dots cx={196} cy={54} />
      <Tap x={178} y={36} w={36} h={36} />
    </Step>
  )
}

/** Le menu qui s'ouvre au-dessus de la barre : « Partager » en tête */
export function Ios26Menu() {
  return (
    <Step id="dg-menu" title="Le menu de Safari" desc="Le menu ouvert au-dessus de la barre : la ligne Partager, avec son carré et sa flèche, à toucher." h={128}>
      <rect class="dg-box dg-strong" x="34" y="4" width="180" height="92" rx="14" />
      <ShareGlyph x={50} y={11} />
      <text class="dg-label" x="74" y="28">
        Partager
      </text>
      <Hair x1={34} y={42} x2={214} />
      <Soft x1={50} y={56} x2={170} />
      <Hair x1={34} y={70} x2={214} />
      <Soft x1={50} y={84} x2={150} />
      <PhoneBottom y0={102} y1={128} r={18} />
      <circle class="dg-box" cx="196" cy="112" r="9" />
      <Dots cx={196} cy={112} r={1.3} gap={4} />
      <Tap x={38} y={8} w={172} h={30} />
    </Step>
  )
}

/** Le menu de partage (iOS 18 et 26) : « Sur l'écran d'accueil », plus bas dans la liste */
export function IosHome() {
  return (
    <Step
      id="dg-home"
      title="Le menu de partage"
      desc="Le menu de partage : en haut des applications, dessous une liste où se trouve la ligne Sur l’écran d’accueil, avec un carré marqué d’un plus, à toucher."
      h={150}
    >
      <PhoneTop y0={4} y1={150} r={16} />
      {[18, 62, 106, 150].map(x => (
        <rect key={x} class="dg-ghost" x={x} y="18" width="30" height="30" rx="8" />
      ))}
      <rect class="dg-box" x="14" y="62" width="198" height="82" rx="10" />
      <Soft x1={28} y={76} x2={130} />
      <Hair x1={14} y={89} x2={212} />
      <text class="dg-label" x="28" y="108">
        Sur l’écran d’accueil
      </text>
      <rect class="dg-glyph" x="186" y="96" width="14" height="14" rx="3" />
      <path class="dg-glyph" d="M193 99.5v7M189.5 103h7" />
      <Hair x1={14} y={117} x2={212} />
      <Soft x1={28} y={131} x2={110} />
      <Tap x={18} y={92} w={190} h={22} />
    </Step>
  )
}

/** La fenêtre d'ajout : « Annuler », « Ajouter », l'icône et son nom ; sur iOS 26, le réglage activé (à laisser) */
export function IosAdd({ host, ios26 }: { host: string; ios26: boolean }) {
  const h = ios26 ? 170 : 124
  return (
    <Step
      id={ios26 ? 'dg-add26' : 'dg-add18'}
      title="Ajouter à l’écran d’accueil"
      desc={
        ios26
          ? 'La fenêtre d’ajout : Annuler et Ajouter en haut, l’icône d’Isoloir et son nom, puis le réglage Ouvrir en tant qu’app web, activé, à laisser ainsi. Le bouton Ajouter, en haut à droite, est à toucher.'
          : `La fenêtre d’ajout : Annuler et Ajouter en haut, l’icône d’Isoloir, son nom et son adresse. Le bouton Ajouter, en haut à droite, est à toucher.`
      }
      h={h}
    >
      <PhoneTop y0={4} y1={h} r={16} />
      <text class="dg-label" x="16" y="30">
        Annuler
      </text>
      <text class="dg-label dg-bold" x="210" y="30" text-anchor="end">
        Ajouter
      </text>
      <Hair x1={3} y={44} x2={225} />
      <AppIcon id={ios26 ? 'dg-add26' : 'dg-add18'} x={16} y={56} s={40} />
      <rect class="dg-box" x="66" y="60" width="146" height="30" />
      <text class="dg-label" x="76" y="80">
        Isoloir
      </text>
      {ios26 ? (
        <>
          <Hair x1={3} y={106} x2={225} />
          <text class="dg-label" x="14" y="131">
            Ouvrir en tant qu’app web
          </text>
          {/* L'interrupteur au trait (celui d'iOS est vert : ici, le mot « activé » le dit) */}
          <rect class="dg-box dg-strong" x="184" y="116" width="32" height="20" rx="10" />
          <circle class="dg-box dg-strong" cx="206" cy="126" r="6.5" />
          <text class="dg-small dg-ink-text" x="200" y="154" text-anchor="middle">
            activé
          </text>
        </>
      ) : (
        <text class="dg-small" x="66" y="110">
          {host}
        </text>
      )}
      <Tap x={156} y={14} w={60} h={26} />
    </Step>
  )
}

/** L'écran d'accueil : l'icône d'Isoloir parmi les autres */
export function IosIcon() {
  return (
    <Step id="dg-icon" title="L’écran d’accueil" desc="L’écran d’accueil : parmi les icônes, celle d’Isoloir, à toucher." h={126}>
      <PhoneTop y0={4} y1={126} r={18} />
      {[20, 72, 124, 176].map(x => (
        <rect key={x} class="dg-ghost" x={x} y="18" width="32" height="32" rx="8" />
      ))}
      {[20, 72].map(x => (
        <rect key={x} class="dg-ghost" x={x} y="66" width="32" height="32" rx="8" />
      ))}
      <AppIcon id="dg-icon" x={124} y={66} s={32} />
      <text class="dg-small" x="140" y="115" text-anchor="middle">
        Isoloir
      </text>
      <Tap x={116} y={60} w={48} h={62} />
    </Step>
  )
}

/** Dans l'application : « Coller le code », puis la bulle « Coller » que l'iPhone peut afficher */
export function IosPaste() {
  return (
    <Step id="dg-paste" title="Coller le code" desc="Le bouton Coller le code ; au-dessus, la bulle Coller que l’appareil peut afficher, à toucher." h={100}>
      <path class="dg-box dg-strong" d="M30 4H86a8 8 0 0 1 8 8V24a8 8 0 0 1-8 8H66l-8 8-8-8H30a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8z" />
      <text class="dg-label" x="58" y="23" text-anchor="middle">
        Coller
      </text>
      <rect class="dg-box dg-strong" x="3" y="50" width="180" height="44" />
      <path class="dg-glyph" d="M20 62h7v3h-7zM20 63.5h-3.5V82h14V63.5H27" />
      <text class="dg-label dg-bold" x="40" y="77">
        Coller le code
      </text>
      <Tap x={17} y={0} w={82} h={43} word={['puis', 'touchez']} ay={18} />
    </Step>
  )
}

/** iPhone, Safari d'iOS 18 : la barre d'outils du bas, le bouton Partager au milieu */
export function Ios18Share({ host }: { host: string }) {
  return (
    <Step
      id="dg-share18"
      title="La barre de Safari"
      desc={`En bas de l’écran de Safari : l’adresse ${host}, puis la barre d’outils, avec au milieu le bouton Partager, un carré et sa flèche, à toucher.`}
      h={134}
    >
      <Soft x1={20} y={10} x2={150} />
      <PhoneBottom y0={0} y1={100} />
      <rect class="dg-box" x="16" y="22" width="194" height="28" rx="9" />
      <text class="dg-small" x="113" y="40.5" text-anchor="middle">
        {host}
      </text>
      <g class="dg-print">
        <polyline points="34,64 27,71 34,78" />
      </g>
      <path class="dg-glyph-soft" d="M66 64l7 7-7 7" />
      <ShareGlyph x={106} y={61} />
      <path class="dg-glyph" d="M148 64.5h13v14h-13zM154.5 64.5v14" />
      <path class="dg-glyph" d="M186 66.5h11v11h-11zM189 63.5h11v11" />
      <rect class="dg-tap" x="97" y="56" width="32" height="32" />
      <Arrow x1={113} y1={130} x2={113} y2={93} tone="ink" />
      <text class="dg-small dg-ink-text" x="122" y="125">
        touchez
      </text>
    </Step>
  )
}

/** Android, Chrome : « ⋮ » à côté de l'adresse (dessinée en haut ; elle peut être en bas) */
export function AndroidMore({ host }: { host: string }) {
  return (
    <Step id="dg-amore" title="Le menu de Chrome" desc={`Dans la barre de Chrome : l’adresse ${host}, puis le bouton à trois points verticaux, à toucher.`} h={92}>
      <PhoneTop y0={4} y1={92} r={18} />
      <rect class="dg-box" x="16" y="20" width="150" height="28" rx="14" />
      <text class="dg-small" x="91" y="38.5" text-anchor="middle">
        {host}
      </text>
      <rect class="dg-ghost" x="176" y="26" width="16" height="16" rx="3" />
      <Dots cx={208} cy={34} r={1.9} gap={7} vertical />
      <Soft x1={20} y={70} x2={180} />
      <Soft x1={20} y={84} x2={130} />
      <Tap x={196} y={16} w={24} h={36} />
    </Step>
  )
}

/** Le menu ouvert : le choix au nom variable (« Installer… », « … écran d'accueil ») */
export function AndroidMenu() {
  return (
    <Step id="dg-amenu" title="Le menu ouvert de Chrome" desc="Le menu ouvert : la ligne qui contient Installer ou écran d’accueil, à toucher." h={124}>
      <rect class="dg-box dg-strong" x="14" y="4" width="204" height="114" rx="6" />
      <Soft x1={30} y={19} x2={160} />
      <Hair x1={14} y={32} x2={218} />
      <Soft x1={30} y={45} x2={140} />
      <Hair x1={14} y={58} x2={218} />
      <path class="dg-glyph" d="M33 64h9a1.5 1.5 0 0 1 1.5 1.5v14A1.5 1.5 0 0 1 42 81h-9a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 33 64zM37.5 67.5v7M35 72l2.5 2.5 2.5-2.5" />
      <text class="dg-label" x="54" y="77">
        Installer…
      </text>
      <Hair x1={14} y={88} x2={218} />
      <Soft x1={30} y={103} x2={120} />
      <Tap x={18} y={61} w={196} h={24} />
    </Step>
  )
}

/** La fenêtre de confirmation d'Android */
export function AndroidConfirm({ host }: { host: string }) {
  return (
    <Step
      id="dg-aconfirm"
      title="Installer l’application"
      desc="La fenêtre de confirmation : l’icône d’Isoloir, son nom et son adresse, puis Annuler et Installer. Le bouton Installer est à toucher."
      h={116}
    >
      <rect class="dg-box dg-strong" x="4" y="4" width="216" height="108" rx="14" />
      <AppIcon id="dg-aconfirm" x={18} y={20} s={32} />
      <text class="dg-label dg-bold" x="62" y="33">
        Isoloir
      </text>
      <text class="dg-small" x="62" y="50">
        {host}
      </text>
      <text class="dg-label" x="112" y="93" text-anchor="end">
        Annuler
      </text>
      <rect class="dg-box dg-strong" x="126" y="74" width="80" height="28" rx="14" />
      <text class="dg-label dg-bold" x="166" y="93" text-anchor="middle">
        Installer
      </text>
      <Tap x={120} y={68} w={92} h={40} />
    </Step>
  )
}

/** Ordinateur, Chrome : l'icône d'installation au bout de la barre d'adresse */
export function DeskBar({ host }: { host: string }) {
  return (
    <Step id="dg-desk" title="La barre d’adresse de Chrome" desc={`La barre d’adresse : ${host}, et à son bout l’icône d’installation, un écran et une flèche, à cliquer.`} h={60}>
      <rect class="dg-box dg-strong" x="3" y="10" width="220" height="40" rx="20" />
      <text class="dg-label" x="22" y="35">
        {host}
      </text>
      <path class="dg-glyph" d="M182 21h20v13h-20zM188 39h8M192 34v5M192 24v6.5M189 27.5l3 3 3-3" />
      <Tap x={174} y={15} w={36} h={30} word="cliquez" />
    </Step>
  )
}

/** Le navigateur et l'application, côte à côte : rien de partagé ; le code fait le tour par vos doigts, une fois */
export function Apart({ where, count, browser }: { where: string; count: string; browser: string }) {
  // « le navigateur » (l'application d'un iPhone ne sait pas lequel l'a ajoutée), en tête de phrase et de sa boîte
  const label = browser.charAt(0).toUpperCase() + browser.slice(1)
  return (
    <Step
      id="dg-apart"
      wide
      title={`${label} et l’application, sur le même appareil`}
      desc={`Deux espaces séparés sur le même appareil : ${browser} garde vos réponses ; l’application installée démarre vide. Rien n’est partagé entre les deux. Le code de vos réponses passe une fois de l’un à l’autre, par vous : copier dans ${browser}, coller dans l’application.`}
      h={180}
    >
      <rect class="dg-box dg-strong" x="3" y="22" width="106" height="72" />
      <text class="dg-label dg-bold" x="12" y="42">
        {label}
      </text>
      <rect class="dg-box dg-ink-box" x="11" y="54" width="90" height="28" />
      <text class="dg-small dg-ink-text" x="56" y="72" text-anchor="middle">
        {count}
      </text>
      <rect class="dg-box dg-strong" x="171" y="22" width="106" height="72" />
      <text class="dg-label dg-bold" x="179" y="42">
        L’application
      </text>
      <rect class="dg-dash" x="179" y="54" width="90" height="28" />
      <text class="dg-small" x="224" y="72" text-anchor="middle">
        vide au départ
      </text>
      <g class="dg-red dg-thick">
        <line x1="133" y1="34" x2="147" y2="48" />
        <line x1="147" y1="34" x2="133" y2="48" />
      </g>
      <text class="dg-small dg-red-text" x="140" y="68" text-anchor="middle">
        rien de
      </text>
      <text class="dg-small dg-red-text" x="140" y="81" text-anchor="middle">
        partagé
      </text>
      <g class="dg-ink">
        <polyline points="56,98 56,134 224,134 224,100" />
      </g>
      <Head x={224} y={99} angle={-Math.PI / 2} />
      <text class="dg-small dg-ink-text" x="63" y="120">
        copier
      </text>
      <text class="dg-small dg-ink-text" x="217" y="120" text-anchor="end">
        coller
      </text>
      <text class="dg-small dg-ink-text" x="140" y="152" text-anchor="middle">
        le code, une fois, par vous
      </text>
      <text class="dg-small" x="140" y="174" text-anchor="middle">
        {where}
      </text>
    </Step>
  )
}

/** Le navigateur et l'application lisent les mêmes réponses (Android ; Chrome ou Edge sur ordinateur) */
export function Shared({ where, browser, count, phone }: { where: string; browser: string; count: string; phone: boolean }) {
  return (
    <Step
      id="dg-shared"
      wide
      title={`${browser} et l’application lisent les mêmes réponses`}
      desc={`${where[0]!.toUpperCase() + where.slice(1)}, ${browser} et l’application installée depuis ${browser} lisent les mêmes réponses, gardées sur l’appareil : rien à transférer.`}
      h={184}
    >
      <rect class="dg-box dg-strong" x="3" y="4" width="274" height="150" rx={phone ? 22 : 3} />
      <rect class="dg-box" x="20" y="20" width="108" height="40" />
      <text class="dg-label dg-bold" x="74" y="45" text-anchor="middle">
        {browser}
      </text>
      <rect class="dg-box" x="152" y="20" width="108" height="40" />
      <text class="dg-label dg-bold" x="206" y="45" text-anchor="middle">
        L’application
      </text>
      <Arrow x1={74} y1={62} x2={112} y2={100} tone="ink" />
      <Arrow x1={206} y1={62} x2={168} y2={100} tone="ink" />
      <text class="dg-small" x="140" y="84" text-anchor="middle">
        les mêmes
      </text>
      <rect class="dg-box dg-ink-box" x="70" y="104" width="140" height="32" />
      <text class="dg-label dg-ink-text" x="140" y="125" text-anchor="middle">
        {count}
      </text>
      <text class="dg-small" x="140" y="176" text-anchor="middle">
        {where}
      </text>
    </Step>
  )
}
