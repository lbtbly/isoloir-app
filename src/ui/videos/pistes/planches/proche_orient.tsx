// Piste C, les planches de la série « Israël et Gaza » (src/ui/videos/series/proche_orient.ts) : un dessin par
// passage, composé avec la bibliothèque commune (../dessin/). Les mots et les nombres viennent du script (mots mis
// en valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin suit ; s'il ne s'y retrouve
// plus, la planche rend null et le passage prend le dessin générique de sa sorte d'image.
//
// Sujet où les mots eux-mêmes sont disputés : le dessin n'ajoute rien au texte. Ni carte, ni drapeau, ni
// emblème, ni arme, ni scène de violence ; aucune personne réelle (une silhouette n'est qu'une tête et des
// épaules, toutes identiques). Les deux bilans ont la même mise en page, chacun avec sa source ; les deux côtés
// d'une comparaison ont la même taille et la même place. Le bleu bille compte ce dont parle le passage, il ne
// désigne jamais un camp. Trois pictogrammes manquent à la bibliothèque commune : ils sont dessinés ici, au
// trait (une balance de justice, un globe pour l'ONU, une caisse de marchandises).
// Quelques étiquettes courtes et neutres sont écrites en dur (les numéros des cinq catégories d'actes) : elles
// sont reprises dans l'« alt » du passage.

import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Fade, Ink, SP, Txt, W, at, cls, cueOf, cuesOf, heard, num, said, sentencesOf, word, wrap, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Panel, Question, Seg, Signature, Src, listAfterColon } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Cases, Disque, Rang, Signe, frise, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const circle = (cx: number, cy: number, r: number) =>
  `M${(cx + r).toFixed(1)} ${cy.toFixed(1)}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/* ——— Trois pictogrammes de la série, au trait, dans un carré de 48 unités ——— */

interface Trace {
  s: string[]
  thin?: number[]
  bold?: number[]
}

const TRACES = {
  /** Une balance de justice : le pied, le fléau à l'horizontale, les fils, les plateaux */
  balance: {
    s: ['M24 7V42M15 43H33', 'M7 12H41', 'M7 12L2 27M7 12L12 27M41 12L36 27M41 12L46 27', 'M1 27Q7 34 13 27ZM35 27Q41 34 47 27Z'],
    thin: [2],
  },
  /** Un globe : le cercle, l'équateur, un méridien, deux parallèles (pas l'emblème de l'ONU) */
  globe: { s: [circle(24, 24, 19), 'M5 24H43', 'M24 5C13 13 13 35 24 43C35 35 35 13 24 5', 'M8.5 14H39.5M8.5 34H39.5'], thin: [3] },
  /** Une caisse de marchandises, vue de biais */
  caisse: { s: ['M6 16L24 8L42 16V36L24 44L6 36Z', 'M6 16L24 24L42 16M24 24V44', 'M15 12L33 20V26'], thin: [2] },
} satisfies Record<string, Trace>

type Trait = keyof typeof TRACES
type Mark = PictoName | Trait

const isTrait = (n: Mark): n is Trait => n in TRACES

/** Un pictogramme de la bibliothèque commune, ou l'un des trois de la série ; (x, y) : coin haut gauche */
function Dessin({ n, x, y, size = 48, t0 = 0, kept, tone, step = 200 }: { n: Mark; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; step?: number }) {
  if (!isTrait(n)) return <Picto n={n} x={x} y={y} size={size} t0={t0} kept={kept} tone={tone} step={step} />
  const d: Trace = TRACES[n]
  const s = size / 48
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(1 / s) }}>
      {d.s.map((path, i) => (
        <Ink
          key={i}
          d={path}
          t0={t0 + i * step}
          dur={i === 0 ? 520 : 380}
          kept={still}
          class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined}
        />
      ))}
    </g>
  )
}

/** Un pictogramme seul dans son SVG, pour une liste en HTML (le sommaire) */
const Glyph = ({ n, t0 }: { n: Mark; t0: number }) => (
  <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
    <Dessin n={n} x={0} y={0} t0={t0} step={150} />
  </svg>
)

/* ——— Communs à la série ——— */

const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** Une date dite (« 7 octobre 2023 ») en années décimales, pour la poser sur une frise ; null sinon */
function dateOf(s: string | null | undefined): number | null {
  if (!s) return null
  const m = new RegExp(`(\\d{1,2})(?:er)?${SP}(${MOIS.join('|')})${SP}(\\d{4})`).exec(s)
  if (!m) return null
  return Number(m[3]) + (MOIS.indexOf(m[2]!) + (Number(m[1]) - 1) / 31) / 12
}

/** Une fiche au trait (un mot du droit) : le cadre, le mot en tête, trois lignes d'écriture */
function Fiche({ x, y, w = 88, h = 120, title, t0 = 0, kept, tone }: { x: number; y: number; w?: number; h?: number; title: string; t0?: number; kept?: boolean; tone?: Tone }) {
  const lines = wrap(title, 11).length
  const top = y + 22 + lines * 17
  const rule = range(3)
    .map(k => top + k * 12)
    .filter(ly => ly < y + h - 8)
    .map(ly => `M${x + 12} ${ly}H${x + w - 12}`)
    .join('')
  return (
    <g class={tone ? `vc-${tone}` : undefined}>
      <Ink d={`M${x} ${y}H${x + w}V${y + h}H${x}Z`} t0={t0} dur={600} kept={kept} />
      <Txt x={x + w / 2} y={y + 24} text={title} max={11} size={15} t0={t0 + 300} kept={kept} tone={tone === 'count' ? 'count' : undefined} />
      {rule ? <Ink d={rule} t0={t0 + 500} dur={400} kept={kept} class="vc-thin vc-soft" /> : null}
    </g>
  )
}

/** Les trois mots du droit, dans l'ordre de la vidéo « mots » (le premier en minuscule, comme les autres) */
function motsDuDroit(p: P): [string, string, string] | null {
  const g = said(p, /génocide/i)
  const h = said(p, /crimes contre l’humanité/)
  const c = said(p, /crimes de guerre/)
  return g && h && c ? [g.toLowerCase(), h, c] : null
}

/** Trois fiches côte à côte, une par mot ; « shown » : celles que la voix a dites */
function fiches(words: [string, string, string], o: { y: number; h: number; shown?: boolean[]; t0?: number; kept?: boolean; tone?: (Tone | undefined)[] }) {
  return words.map((w, i) =>
    o.shown && !o.shown[i] ? null : (
      <Fiche key={w} x={8 + i * 98} y={o.y} h={o.h} title={w} t0={(o.t0 ?? 0) + (o.kept ? 0 : i * 250)} kept={o.kept} tone={o.tone?.[i]} />
    ),
  )
}

/** Un document qui porte un bilan, et le nom de sa source à côté (« Selon les autorités israéliennes ») */
function bilan(p: P, re: RegExp) {
  const src = word(p, re)
  if (!src || !p.segment.figure) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={72}>
        <Picto n="document" x={58} y={4} size={62} t0={500} />
        <Txt x={128} y={32} text={src.text} max={20} size={15} anchor="start" t0={900} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** L'Union européenne et Israël, deux cadres de même taille reliés par une flèche double ; au-dessus, une caisse
 *  de marchandises (les échanges) ; dessous, le document de l'accord */
function lien(p: P, { y = 0, t0 = 0, kept, goods, accord, named }: { y?: number; t0?: number; kept?: boolean; goods?: boolean; accord?: boolean; named?: boolean }) {
  const ue = said(p, /Union européenne/)
  const il = said(p, /Israël/)
  if (!ue || !il) return null
  const box = (x: number) => `M${x} ${y}H${x + 100}V${y + 60}H${x}Z`
  const name = accord && named ? said(p, /accord d’association/) : null
  return {
    h: y + (accord ? 112 : 66),
    el: (
      <>
        <Ink d={box(6)} t0={t0} dur={700} kept={kept} />
        <Txt x={56} y={y + 26} text={ue} max={10} size={15} t0={t0 + 300} kept={kept} />
        <Ink d={box(194)} t0={t0 + 300} dur={700} kept={kept} />
        <Txt x={244} y={y + 35} text={il} size={15} t0={t0 + 600} kept={kept} />
        <Arrow x1={114} y1={y + 32} x2={186} y2={y + 32} t0={t0 + 800} kept={kept} head={7} />
        <Arrow x1={186} y1={y + 32} x2={114} y2={y + 32} t0={t0 + 900} kept={kept} head={7} />
        {goods ? <Dessin n="caisse" x={135} y={y - 2} size={30} t0={t0 + 1100} kept={kept} /> : null}
        {accord ? (
          <>
            <Picto n="document" x={130} y={y + 42} size={40} t0={t0 + 1200} kept={kept} />
            {name ? <Txt x={W / 2} y={y + 106} text={name} size={14} t0={t0 + 1500} kept={kept} /> : null}
          </>
        ) : null}
      </>
    ),
  }
}

/* ——— Le Conseil de sécurité : quinze sièges en fer à cheval, les cinq permanents au milieu, tracés plus fort ——— */

const CONSEIL = { cx: W / 2, cy: 118, R: 106, n: 15, r: 9 }
const PERMANENTS = [5, 6, 7, 8, 9]
/** Le siège dont le vote contre a bloqué le texte : un des permanents, sans nom */
const CONTRE = 7

function siege(i: number) {
  const a = Math.PI + ((i + 0.5) * Math.PI) / CONSEIL.n
  return { x: CONSEIL.cx + CONSEIL.R * Math.cos(a), y: CONSEIL.cy + CONSEIL.R * Math.sin(a) }
}

function Sieges({ count = [], tint = [], cross = [], t0 = 0, kept, soft }: { count?: number[]; tint?: number[]; cross?: number[]; t0?: number; kept?: boolean; soft?: boolean }) {
  return (
    <g class={soft ? 'vc-soft' : undefined}>
      {range(CONSEIL.n).map(i => {
        const { x, y } = siege(i)
        const d = circle(x, y, CONSEIL.r)
        const counted = count.includes(i)
        return (
          <g key={i} class={counted ? 'vc-count' : undefined}>
            {counted || tint.includes(i) ? (
              <Fade t0={kept ? 0 : t0 + 400 + i * 40}>
                <path class={counted ? 'vc-tint-count' : 'vc-tint'} d={d} />
              </Fade>
            ) : null}
            <Ink d={d} t0={t0 + i * 40} dur={300} kept={kept} class={PERMANENTS.includes(i) ? 'vc-bold' : 'vc-thin'} />
            {cross.includes(i) ? <Ink d={`M${(x - 5).toFixed(1)} ${(y - 5).toFixed(1)}l10 10m0-10l-10 10`} t0={kept ? 0 : t0 + 300} dur={300} class="vc-count vc-bold" /> : null}
          </g>
        )
      })}
    </g>
  )
}

/** Hauteur du dessin des sièges, base comprise */
const SIEGES_H = CONSEIL.cy + 6

/* ——— Introduction ——— */

/** 01 « La guerre à Gaza a suivi l'attaque du 7 octobre 2023 » : une frise des années, un fanion à la date, une
 *  flèche en pointillé jusqu'à aujourd'hui ; « Quelle position ? » */
const intro01: Board = p => {
  const date = cueOf(p, 0)
  const t = dateOf(date?.text)
  if (!date || !t) return null
  const y0 = Math.floor(t)
  const f = frise({ y: 74, from: y0, to: y0 + 4, x0: 16, x1: 246, ticks: range(5).map(k => y0 + k), labels: range(4).map(k => y0 + k), t0: 200 })
  const x = f.X(t)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={104}>
        {f.el}
        {date.shown ? <Picto n="drapeau" x={x - 11} y={74 - 44} size={46} tone="count" t0={300} /> : null}
        <Arrow x1={x + 18} y1={52} x2={f.X(y0 + 3.75)} y2={52} dash t0={1200} />
        <Ask x={254} y={22} h={52} t0={1700} />
      </Art>
    </Seg>
  )
}

/** 02 Plus de 1 200 personnes tuées en Israël, selon les autorités israéliennes */
const intro02: Board = p => bilan(p, /Selon les autorités israéliennes/)

/** 03 73 922 Palestiniens tués dans la bande de Gaza, selon le ministère de la Santé de Gaza : même mise en page */
const intro03: Board = p => bilan(p, /Selon le ministère de la Santé de Gaza/)

/** 04 L'ONU reprend les deux bilans, chacun attribué à sa source : deux documents de même taille, un même dossier */
const intro04: Board = p => {
  const a = said(p, /autorités israéliennes/)
  const b = said(p, /ministère de la Santé de Gaza/)
  const onu = word(p, /ONU/)
  const cue = cueOf(p, 0)
  if (!a || !b || !onu) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={200}>
        <Picto n="document" x={34} y={0} size={56} t0={100} tone={cue?.shown ? 'count' : undefined} />
        <Txt x={62} y={76} text={a} max={16} size={14} t0={300} />
        <Picto n="document" x={210} y={0} size={56} t0={400} tone={cue?.shown ? 'count' : undefined} />
        <Txt x={238} y={76} text={b} max={16} size={14} t0={600} />
        {onu.shown ? (
          <>
            <Arrow x1={70} y1={112} x2={128} y2={146} t0={0} />
            <Arrow x1={230} y1={112} x2={172} y2={146} t0={150} />
            <Dessin n="globe" x={126} y={136} size={48} t0={400} />
            <Txt x={W / 2} y={198} text={onu.text} size={15} t0={700} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Deux juridictions : la Cour internationale de justice juge les États (un édifice), la Cour pénale
 *  internationale poursuit des personnes (une silhouette) ; une même balance au-dessus */
const intro05: Board = p => {
  const [etats, personnes] = cuesOf(p)
  const cij = word(p, /La Cour internationale de justice/)
  const cpi = word(p, /La Cour pénale internationale/)
  if (!etats || !personnes || !cij || !cpi) return null
  return (
    <Seg>
      <Art h={212}>
        <Dessin n="balance" x={126} y={0} size={48} t0={100} />
        <Ink d="M150 60V206" t0={300} dur={500} class="vc-thin vc-soft" />
        {cij.shown ? <Txt x={75} y={66} text={cij.text} max={15} size={14} tone="soft" t0={0} /> : null}
        {cpi.shown ? <Txt x={225} y={66} text={cpi.text} max={15} size={14} tone="soft" t0={0} /> : null}
        {etats.shown ? (
          <>
            <Picto n="monument" x={49} y={118} size={52} t0={100} tone="count" />
            <Txt x={75} y={194} text={etats.text} max={15} size={15} t0={400} />
          </>
        ) : null}
        {personnes.shown ? (
          <>
            <Picto n="personne" x={199} y={118} size={52} t0={100} tone="count" />
            <Txt x={225} y={194} text={personnes.text} max={15} size={15} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 L'Union européenne, premier partenaire commercial d'Israël ; l'accord d'association encadre leurs échanges */
const intro06: Board = p => {
  const [partenaire, accord] = cuesOf(p)
  const g = lien(p, { y: 8, t0: 200, goods: !!partenaire?.shown, accord: !!accord?.shown })
  if (!g) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={8 + 86}>{g.el}</Art>
    </Seg>
  )
}

/** 07 Les deux questions du thème : le livre du droit (le mot), le cadran (les moyens de pression) */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length !== 2) return null
  const pictos: PictoName[] = ['livre', 'cadran']
  return (
    <Seg kind="ask">
      <Panel
        cols={1}
        items={qs.map((q, i) => ({
          picto: pictos[i]!,
          text: q.replace(/^Et\s/, ''),
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** Le pictogramme de chaque approfondissement, au sommaire */
const GLYPHES: [RegExp, Mark][] = [
  [/-mots$/, 'livre'],
  [/-justice$/, 'balance'],
  [/-accord$/, 'caisse'],
  [/-colonisation$/, 'maison'],
  [/-onu$/, 'globe'],
]

/** 08 Les cinq vidéos qui suivent : le sommaire de la série, chacune avec son pictogramme */
const intro08: Board = p => {
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (!deep.length) return null
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(200 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyph n={GLYPHES.find(([re]) => re.test(v.id))?.[1] ?? 'document'} t0={p.still ? 0 : 350 + i * 450} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Les mots du droit ——— */

/** 01 Trois mots, trois fiches de même taille, chacune quand la voix dit son mot */
const mots01: Board = p => {
  const cues = cuesOf(p)
  if (cues.length !== 3) return null
  const words = cues.map((c, i) => (i === 0 ? c.text.toLowerCase() : c.text)) as [string, string, string]
  return (
    <Seg>
      <Art h={170}>
        {heard(p, 'Que veulent') ? <Ask x={136} y={0} h={34} t0={0} /> : null}
        {fiches(words, { y: 44, h: 122, shown: cues.map(c => c.shown), t0: 100 })}
      </Art>
    </Seg>
  )
}

/** 02 La convention de 1948 : deux éléments, des actes précis + une intention */
const mots02: Board = p => {
  const [actes, intention] = cuesOf(p)
  const year = yearsOf(p.segment.say)[0]
  if (!actes || !intention || !year) return null
  const box = (x: number) => `M${x} 112H${x + 124}V156H${x}Z`
  return (
    <Seg>
      <Art h={162}>
        <Picto n="document" x={116} y={0} size={68} t0={100} />
        <Txt x={192} y={44} text={String(year)} size={22} big anchor="start" t0={600} />
        <Arrow x1={128} y1={78} x2={88} y2={106} t0={900} head={7} />
        <Arrow x1={172} y1={78} x2={212} y2={106} t0={1000} head={7} />
        {actes.shown ? (
          <g class="vc-count">
            <Ink d={box(14)} t0={0} dur={500} />
            <Txt x={76} y={139} text={actes.text} size={15} tone="count" t0={200} />
          </g>
        ) : null}
        {intention.shown ? (
          <>
            <Txt x={W / 2} y={141} text="+" size={22} big t0={0} />
            <g class="vc-count">
              <Ink d={box(162)} t0={0} dur={500} />
              <Txt x={224} y={139} text={intention.text} size={15} tone="count" t0={200} />
            </g>
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Les cinq catégories d'actes : cinq cases numérotées, chacune avec l'acte dit */
const mots03: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length !== 5) return null
  let y = 0
  const rows = list.map(text => {
    const lines = wrap(text, 30).length
    const row = { text, y, lines }
    y += Math.max(30, lines * 17 + 13)
    return row
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={y}>
        {rows.map((r, i) => {
          const shown = heard(p, r.text.split(' ')[0])
          return (
            <g key={i}>
              <Ink d={`M10 ${r.y}h22v22h-22z`} t0={100 + i * 120} dur={400} class={shown ? 'vc-count' : undefined} />
              <Txt x={21} y={r.y + 16} text={String(i + 1)} size={14} t0={200 + i * 120} tone={shown ? 'count' : undefined} />
              {shown ? <Txt x={44} y={r.y + 16} text={r.text} max={30} size={15} anchor="start" t0={0} /> : null}
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 04 L'intention de détruire un groupe : un cercle en pointillé autour de silhouettes ; les quatre sortes de groupe */
const mots04: Board = p => {
  const m = /groupe ([^.]+)\.?$/.exec(p.segment.say)
  const kinds = m ? m[1]!.split(/,\s+|\s+ou\s+/).map(s => s.trim()).filter(Boolean) : []
  if (kinds.length < 2 || kinds.length > 4) return null
  const people: [number, number][] = [
    [96, 22],
    [134, 14],
    [172, 22],
    [78, 60],
    [116, 54],
    [154, 54],
    [192, 60],
  ]
  const pitch = W / kinds.length
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Fade t0={100} class="vc-dash vc-soft">
          <path d="M150 4C226 4 252 40 252 62C252 92 214 116 150 116C86 116 48 92 48 62C48 40 74 4 150 4Z" />
        </Fade>
        {people.map(([x, y], i) => (
          <Picto key={i} n="personne" x={x} y={y} size={32} t0={300 + i * 90} w={0.9} />
        ))}
        {kinds.map((k, i) => (heard(p, k) ? <Txt key={k} x={pitch * (i + 0.5)} y={140} text={k} size={15} t0={0} /> : null))}
      </Art>
    </Seg>
  )
}

/** Le tableau des trois mots : les actes (une icône), puis l'intention de détruire un groupe (cochée pour le
 *  génocide, en pointillé pour les deux autres). « step » : 2, les deux premières colonnes ; 3, les trois. */
function tableau(p: P, step: 2 | 3) {
  const words = motsDuDroit(p)
  const [mot, sans] = cuesOf(p)
  const intent = said(p, /l’intention de détruire/)
  if (!words || !mot || !intent) return null
  const cx = [52, 150, 248]
  const isNew = (i: number) => i === step - 1
  const shownCol = (i: number) => !isNew(i) || mot.shown
  const ghostShown = (i: number) => (isNew(i) ? !!(sans?.shown ?? mot.shown) : true)
  const tick = (x: number) => `M${x - 7} 136l5 5 10-11`
  return (
    <Seg>
      <Art h={182}>
        <Ink d="M101 2V98M199 2V98M101 124V164M199 124V164" t0={0} dur={500} class="vc-thin vc-soft" />
        {words.slice(0, step).map((w, i) =>
          shownCol(i) ? (
            <Txt key={w} x={cx[i]!} y={18} text={w} max={14} size={14} t0={isNew(i) ? 100 : 0} kept={!isNew(i)} tone={isNew(i) ? 'count' : undefined} />
          ) : null,
        )}
        {/* Les actes : les cinq catégories ; des civils ; le livre des règles du conflit */}
        <Cases n={5} cols={5} x={14} y={70} size={12} gap={4} kept />
        {step >= 2 && shownCol(1) ? (
          <>
            <Picto n="personne" x={112} y={58} size={26} kept={!isNew(1)} t0={300} w={0.9} />
            <Picto n="personne" x={137} y={58} size={26} kept={!isNew(1)} t0={400} w={0.9} />
            <Picto n="personne" x={162} y={58} size={26} kept={!isNew(1)} t0={500} w={0.9} />
          </>
        ) : null}
        {step >= 3 && shownCol(2) ? <Picto n="livre" x={226} y={52} size={44} t0={300} /> : null}
        {/* L'intention de détruire un groupe */}
        <Txt x={W / 2} y={116} text={intent} size={14} tone="soft" kept />
        <g class="vc-count">
          <Fade kept>
            <rect class="vc-tint-count" x={cx[0]! - 15} y={126} width={30} height={24} />
          </Fade>
          <Ink d={`M${cx[0]! - 15} 126h30v24h-30z`} kept />
          <Ink d={tick(cx[0]!)} kept class="vc-bold" />
        </g>
        {range(step - 1).map(k => {
          const i = k + 1
          return ghostShown(i) && shownCol(i) ? (
            <Fade key={i} t0={isNew(i) ? 0 : 0} kept={!isNew(i)} class="vc-ghost">
              <path d={`M${cx[i]! - 15} 126h30v24h-30z`} />
            </Fade>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 05 Les crimes contre l'humanité : une attaque contre des civils, sans exiger l'intention */
const mots05: Board = p => tableau(p, 2)

/** 06 Les crimes de guerre : les règles d'un conflit armé ; eux non plus n'exigent pas l'intention */
const mots06: Board = p => tableau(p, 3)

/** 07 « Doit-elle employer l'un de ces mots, et lequel ? » : les trois fiches, un point d'interrogation */
const mots07: Board = p => {
  const words = motsDuDroit(p)
  if (!words) return null
  return (
    <Seg kind="ask">
      <Art h={136}>
        <Ask x={136} y={0} h={36} t0={900} />
        {fiches(words, { y: 44, h: 88, kept: true })}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Ce qu'examinent les instances internationales ——— */

/** Les trois instances, en rang : deux cours (des édifices), une commission d'enquête (une loupe) */
function instances(y: number, size: number, xs: number[], t0 = 0, kept?: boolean) {
  const n: Mark[] = ['monument', 'monument', 'loupe']
  return n.map((k, i) => <Dessin key={i} n={k} x={xs[i]!} y={y} size={size} t0={t0 + i * 250} kept={kept} />)
}

/** 01 « Qui peut dire ? » : trois instances de même taille, sous un point d'interrogation */
const just01: Board = p => (
  <Seg>
    <HeadCues p={p} />
    <Art h={124}>
      <Ask x={136} y={0} h={40} t0={100} />
      {instances(54, 64, [24, 118, 212], 500)}
    </Art>
  </Seg>
)

/** 02 La Cour internationale de justice juge les États ; le 29 décembre 2023, la requête de l'Afrique du Sud */
const just02: Board = p => {
  const sa = word(p, /l’Afrique du Sud/)
  const req = word(p, /une requête pour génocide/)
  const vise = word(p, /visant Israël/)
  if (!sa || !req) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={132}>
        <Picto n="monument" x={192} y={12} size={84} t0={100} />
        {sa.shown ? (
          <>
            <Picto n="document" x={24} y={22} size={60} t0={0} tone="count" />
            <Txt x={54} y={112} text={sa.text} size={14} t0={200} />
          </>
        ) : null}
        {req.shown ? (
          <>
            <Txt x={140} y={22} text={req.text.replace(/^une\s/, '')} max={12} size={14} t0={0} />
            <Arrow x1={96} y1={64} x2={184} y2={64} t0={200} />
          </>
        ) : null}
        {/* « visant Israël » qualifie la requête : sous la flèche, pas sous l'édifice de la Cour */}
        {vise?.shown ? <Txt x={140} y={90} text={vise.text} size={14} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** La frise de la procédure devant la Cour, 2024 à 2026, et la position d'une date dite */
const friseCij = (t0: number, kept?: boolean) => frise({ y: 124, from: 2024, to: 2027, x0: 16, x1: 284, ticks: [2024, 2025, 2026, 2027], labels: [2024, 2025, 2026], t0, kept })

/** 03 Le 26 janvier 2024, des mesures d'urgence, qui ne tranchent pas : un fanion sur la frise, la balance à
 *  l'horizontale */
const just03: Board = p => {
  const [urgence, tranche] = cuesOf(p)
  const t = dateOf(p.segment.say)
  const d = word(p, /26[\s\u00a0]janvier 2024/)
  if (!urgence || !t) return null
  const f = friseCij(100)
  const x = f.X(t)
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={152}>
        {f.el}
        <Picto n="drapeau" x={x - 11} y={124 - 44} size={46} tone="count" t0={400} />
        {d ? <Txt x={x - 4} y={54} text={d.text} size={14} anchor="start" tone="soft" t0={600} /> : null}
        {urgence.shown ? <Txt x={x - 4} y={72} text={urgence.text} size={15} anchor="start" tone="count" t0={0} /> : null}
        {tranche?.shown ? <Dessin n="balance" x={206} y={0} size={70} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Le 21 mai 2026, les délais d'une nouvelle série d'écrits des deux États : deux piles ; l'examen se poursuit */
const just04: Board = p => {
  const [date, suite] = cuesOf(p)
  const t = dateOf(date?.text)
  const first = dateOf(said(p, /26[\s\u00a0]janvier 2024/))
  if (!date || !t) return null
  const f = friseCij(0, true)
  const x = f.X(t)
  const pile = (x0: number) => [0, 1, 2].map(k => <Picto key={k} n="document" x={x0 + k * 5} y={52 - k * 6} size={36} kept={k < 2} t0={300} w={0.9} />)
  return (
    <Seg>
      {/* « se poursuit » s'écrit au bout de la flèche : le titre ne garde que la date */}
      <HeadCues p={p} only={[0]} />
      <Art h={152}>
        {f.el}
        {first ? <Picto n="drapeau" x={f.X(first) - 11} y={124 - 44} size={46} tone="ghost" /> : null}
        {heard(p, 'série') ? (
          <>
            {pile(70)}
            {pile(126)}
          </>
        ) : null}
        {date.shown ? <Picto n="drapeau" x={x - 11} y={124 - 44} size={46} tone="count" t0={0} /> : null}
        {suite?.shown ? (
          <>
            <Arrow x1={x + 22} y1={60} x2={292} y2={60} dash t0={0} />
            <Txt x={292} y={46} text={suite.text} size={15} anchor="end" tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 La Cour pénale internationale poursuit des personnes : trois mandats, trois silhouettes identiques */
const just05: Board = p => {
  const [personnes, mandats] = cuesOf(p)
  const a = word(p, /des dirigeants israéliens/)
  const b = word(p, /le chef de la branche armée du Hamas/)
  if (!personnes || !mandats || !a || !b) return null
  const qui = (x: number, d: number) => (
    <g key={x}>
      {mandats.shown ? <Picto n="document" x={x + 7} y={0} size={36} tone="count" t0={d} /> : null}
      <Picto n="personne" x={x} y={52} size={50} t0={100 + d} />
    </g>
  )
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={196}>
        {qui(26, 0)}
        {qui(88, 150)}
        <Ink d="M170 8V186" t0={400} dur={500} class="vc-thin vc-soft" />
        {qui(209, 300)}
        {a.shown ? <Txt x={88} y={130} text={a.text} max={16} size={15} t0={0} /> : null}
        {b.shown ? <Txt x={234} y={130} text={b.text} max={16} size={15} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Visés pour crimes de guerre et crimes contre l'humanité présumés : les trois mandats, la date */
const just06: Board = p => {
  const from = word(p, /à partir du 7[\s\u00a0]octobre 2023/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={92}>
        {[88, 128, 168].map((x, i) => (
          <Picto key={x} n="document" x={x} y={0} size={44} kept tone="count" w={0.9} t0={i * 100} />
        ))}
        {from?.shown ? <Txt x={W / 2} y={82} text={from.text} size={15} tone="soft" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Une commission d'enquête de l'ONU : des experts, une loupe sur un rapport ; ce n'est pas un tribunal (un
 *  édifice en pointillé) */
const just07: Board = p => {
  const [commission, tribunal] = cuesOf(p)
  const experts = word(p, /des experts/)
  if (!commission || !tribunal) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={132}>
        {[8, 44, 80].map((x, i) => (
          <Picto key={x} n="personne" x={x} y={66} size={34} t0={100 + i * 120} />
        ))}
        <Picto n="document" x={30} y={0} size={56} t0={500} />
        <Picto n="loupe" x={58} y={6} size={48} t0={800} tone="count" />
        {experts?.shown ? <Txt x={61} y={126} text={experts.text} size={14} t0={0} /> : null}
        <Ink d="M150 8V126" t0={300} dur={500} class="vc-thin vc-soft" />
        {tribunal.shown ? (
          <>
            <Picto n="monument" x={192} y={20} size={72} tone="ghost" />
            <Txt x={228} y={126} text={tribunal.text} size={14} tone="soft" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 Selon la commission, 4 des 5 catégories d'actes ; Israël rejette ce rapport : deux moitiés égales */
const just08: Board = p => {
  const [quatre, reponse] = cuesOf(p)
  const m = /(\d+)[\s\u00a0]+des[\s\u00a0]+(\d+)/.exec(quatre?.text ?? '')
  const israel = word(p, /Israël rejette ce rapport/)
  const selon = said(p, /commission d’enquête/)
  if (!quatre || !m || !reponse || !israel) return null
  const k = Number(m[1])
  const n = Number(m[2])
  if (!(k > 0 && k < n && n <= 6)) return null
  const size = 22
  const gap = 5
  const x0 = (146 - n * size - (n - 1) * gap) / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={116}>
        <Cases n={n} cols={n} x={x0} y={8} size={size} gap={gap} count={quatre.shown ? range(k) : []} t0={200} />
        {selon && quatre.shown ? <Txt x={73} y={54} text={`selon la ${selon}`} max={18} size={14} t0={300} /> : null}
        <Ink d="M150 0V112" t0={300} dur={400} class="vc-thin vc-soft" />
        {israel.shown ? (
          <>
            <Picto n="document" x={208} y={0} size={36} t0={0} />
            <Txt x={226} y={54} text={israel.text} max={20} size={14} t0={200} />
          </>
        ) : null}
        {reponse.shown ? <Txt x={226} y={92} text={`«\u00a0${reponse.text}\u00a0»`} max={14} size={15} t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 « Quelle position pour la France ? » : les trois instances en rang, un point d'interrogation */
const just09: Board = p => (
  <Seg kind="ask">
    <Art h={92}>
      {instances(24, 56, [8, 76, 144], 100, true)}
      <Ask x={226} y={8} h={70} t0={800} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— L'accord entre l'Union européenne et Israël ——— */

/** 01 L'accord d'association : deux cadres reliés, le document de l'accord ; « qui peut le changer ? » */
const acc01: Board = p => {
  const g = lien(p, { y: 8, t0: 200, goods: true, accord: !!cueOf(p, 0)?.shown })
  if (!g) return null
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={8 + 86}>{g.el}</Art>
    </Seg>
  )
}

/** 02 31,7 % du commerce de biens d'Israël ; près de 0,8 % de celui de l'Union : deux disques de même taille,
 *  chacun tout le commerce de l'un, avec la part de l'autre */
const acc02: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const il = said(p, /Israël/)
  const ue = said(p, /Union européenne/)
  const biens = word(p, /commerce de biens/)
  if (!a || !b || !va || !vb || !il || !ue) return null
  const r = 46
  const L = { cx: 76, cy: 66 }
  const R = { cx: 224, cy: 66 }
  const tipA = partPoint(L.cx, L.cy, r, va / 100)
  const tipB = partPoint(R.cx, R.cy, r, vb / 100)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={164}>
        <Disque cx={L.cx} cy={L.cy} r={r} part={va / 100} shown={a.shown} t0={200} />
        <Disque cx={R.cx} cy={R.cy} r={r} part={vb / 100} shown={b.shown} t0={500} />
        {a.shown ? (
          <>
            <Ink d={`M${tipA.x.toFixed(1)} ${tipA.y.toFixed(1)}L130 20`} t0={300} dur={300} class="vc-count vc-thin" />
            <Txt x={132} y={18} text={a.text} size={18} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
        {b.shown ? (
          <>
            <Ink d={`M${tipB.x.toFixed(1)} ${tipB.y.toFixed(1)}L250 8`} t0={300} dur={300} class="vc-count vc-thin" />
            <Txt x={254} y={16} text={b.text} size={18} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
        <Txt x={L.cx} y={136} text={il} size={15} t0={300} />
        <Txt x={R.cx} y={136} text={ue} size={15} t0={600} />
        {biens ? <Txt x={W / 2} y={158} text={biens.text} size={14} tone="soft" t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 L'article 2 : le respect des droits de l'homme, « élément essentiel » ; en juin 2025, une loupe passe dessus */
const acc03: Board = p => {
  const [essentiel, viole] = cuesOf(p)
  const art2 = word(p, /article[\s\u00a0]2/)
  const juin = word(p, /En juin 2025/)
  const reexamen = word(p, /un réexamen européen/)
  if (!essentiel || !art2) return null
  const lines = [30, 44, 58, 104, 118, 132, 146].map(y => `M32 ${y}H122`).join('')
  return (
    <Seg>
      <Head lines={[{ text: `«\u00a0${essentiel.text}\u00a0»`, shown: essentiel.shown, mark: essentiel }]} />
      <Art h={164}>
        <Ink d="M20 4H118L136 22V160H20Z" t0={100} dur={900} />
        <Ink d="M118 4V22H136" t0={600} dur={300} />
        <Ink d={lines} t0={700} dur={500} class="vc-thin vc-soft" />
        <Fade t0={900} class="vc-count">
          <rect class="vc-tint-count" x={28} y={70} width={100} height={22} />
        </Fade>
        <Txt x={36} y={86} text={art2.text} size={14} anchor="start" tone="count" t0={1000} />
        {viole?.shown ? (
          <>
            <Picto n="loupe" x={100} y={44} size={62} tone="count" t0={0} />
            {juin ? <Txt x={168} y={90} text={juin.text} size={16} anchor="start" t0={200} /> : null}
            {reexamen ? <Txt x={168} y={110} text={reexamen.text} max={16} size={14} anchor="start" tone="soft" t0={400} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 La proposition de la Commission : les produits israéliens perdraient leur accès préférentiel (l'étiquette
 *  passe en pointillé : ce n'est qu'une proposition) */
const acc04: Board = p => {
  const acces = cueOf(p, 0)
  const produits = word(p, /les produits israéliens/)
  const marche = word(p, /marché européen/)
  if (!acces || !produits || !marche) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Dessin n="caisse" x={14} y={26} size={66} t0={100} />
        <Arrow x1={88} y1={60} x2={196} y2={60} t0={500} />
        <Picto n="etiquette" x={114} y={6} size={56} tone={acces.shown ? 'ghost' : undefined} t0={800} />
        <Picto n="guichet" x={204} y={10} size={84} t0={700} />
        {produits.shown ? <Txt x={47} y={112} text={produits.text} max={14} size={14} t0={0} /> : null}
        {marche.shown ? <Txt x={246} y={112} text={marche.text} size={14} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Des sanctions proposées des deux côtés : un document au milieu, deux silhouettes de chaque côté */
const acc05: Board = p => {
  const a = word(p, /des ministres et des colons israéliens/)
  const b = word(p, /des membres du bureau politique du Hamas/)
  if (!a || !b) return null
  const groupe = (x: number, shown: boolean, d: number) =>
    shown ? (
      <>
        <Picto n="personne" x={x} y={64} size={42} t0={d} />
        <Picto n="personne" x={x + 46} y={64} size={42} t0={d + 120} />
      </>
    ) : null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={168}>
        <Picto n="document" x={126} y={0} size={48} t0={100} tone="count" />
        <Arrow x1={130} y1={44} x2={96} y2={64} dash t0={500} />
        <Arrow x1={170} y1={44} x2={204} y2={64} dash t0={500} />
        {groupe(22, a.shown, 0)}
        {groupe(190, b.shown, 0)}
        {a.shown ? <Txt x={66} y={128} text={a.text} max={18} size={14} t0={200} /> : null}
        {b.shown ? <Txt x={234} y={128} text={b.text} max={18} size={14} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** Une grille de vingt-sept voix, une contre ; dessous, la décision qui passe, ou une barrière qui l'arrête */
function vingtSept(x: number, label: string, passe: boolean, t0: number) {
  const size = 11
  const gap = 3
  const w = 9 * size + 8 * gap
  const cx = x + w / 2
  return (
    <g>
      <Txt x={cx} y={16} text={label} size={15} tone="count" t0={t0} />
      <Cases n={27} cols={9} x={x} y={28} size={size} gap={gap} count={[26]} t0={t0 + 100} stagger={10} />
      <Ink d={`M${x + 8 * (size + gap) + 2} ${28 + 2 * (size + gap) + 2}l7 7m0-7l-7 7`} t0={t0 + 500} dur={300} class="vc-count vc-bold" />
      <Arrow x1={cx} y1={74} x2={cx} y2={passe ? 108 : 94} t0={t0 + 700} head={7} />
      {passe ? (
        <Picto n="document" x={cx - 22} y={110} size={44} t0={t0 + 900} />
      ) : (
        <>
          <Ink d={`M${cx - 26} 100H${cx + 26}`} t0={t0 + 900} dur={300} class="vc-count vc-bold" />
          <Picto n="document" x={cx - 22} y={110} size={44} tone="ghost" />
        </>
      )}
    </g>
  )
}

/** 06 Deux règles de décision : à la majorité qualifiée, une voix contre ne bloque pas ; à l'unanimité, si */
const acc06: Board = p => {
  const [qualifiee, unanimite] = cuesOf(p)
  const lead = word(p, /Deux règles de décision/)
  if (!qualifiee || !unanimite || !said(p, /Vingt-Sept/)) return null
  return (
    <Seg>
      <Head lines={[lead ? { text: lead.text, shown: lead.shown } : null]} />
      <Art h={160}>
        {qualifiee.shown ? vingtSept(10, qualifiee.text, true, 0) : null}
        <Ink d="M150 4V156" t0={200} dur={400} class="vc-thin vc-soft" />
        {unanimite.shown ? vingtSept(166, unanimite.text, false, 0) : null}
      </Art>
    </Seg>
  )
}

/** 07 Une suspension de l'accord proposée (le signe « pause » en pointillé) ; le 21 avril 2026, pas d'unanimité */
const acc07: Board = p => {
  const [suspendre, unanimes] = cuesOf(p)
  const date = word(p, /21[\s\u00a0]avril 2026/)
  const ministres = word(p, /les ministres/)
  if (!suspendre || !unanimes) return null
  const ring = circle(80, 60, 24)
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={130}>
        <Picto n="document" x={32} y={6} size={96} t0={100} />
        {suspendre.shown ? (
          <>
            <Fade t0={0}>
              <path class="vc-paper" d={ring} />
            </Fade>
            <Fade t0={0} class="vc-ghost">
              <path d={`${ring}M73 50v20M87 50v20`} />
            </Fade>
            <Txt x={80} y={124} text={suspendre.text} size={14} tone="soft" t0={200} />
          </>
        ) : null}
        <Ink d="M156 6V124" t0={300} dur={400} class="vc-thin vc-soft" />
        {date?.shown ? <Txt x={228} y={22} text={date.text} size={16} t0={0} /> : null}
        {ministres?.shown ? (
          <>
            {[178, 212, 246].map((x, i) => (
              <Picto key={x} n="personne" x={x} y={40} size={32} t0={i * 120} />
            ))}
            <Txt x={228} y={98} text={ministres.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 « Faut-il se servir de cet accord pour faire pression ? » : les deux cadres reliés, un point d'interrogation */
const acc08: Board = p => {
  const g = lien(p, { y: 44, kept: true, accord: true, named: true })
  if (!g) return null
  return (
    <Seg kind="ask">
      <Art h={g.h}>
        <Ask x={136} y={0} h={38} t0={300} />
        {g.el}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— La colonisation en Cisjordanie ——— */

/** Une ligne de collines, et où y poser une maison */
const COLLINES = 'M4 100C30 76 58 64 92 80C124 58 160 44 198 64C226 50 262 52 296 74'
const SUR_COLLINE: [number, number][] = [
  [52, 74],
  [134, 60],
  [178, 54],
  [244, 56],
]

/** 01 Des implantations, appelées avant-postes : de petites maisons se posent sur des collines */
const col01: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={108}>
        <Ink d={COLLINES} t0={100} dur={900} />
        <Ink d="M4 104H296" t0={300} dur={600} class="vc-soft vc-thin" />
        {cue?.shown
          ? SUR_COLLINE.map(([x, y], i) => <Picto key={x} n="maison" x={x - 11} y={y - 22} size={22} t0={i * 200} w={0.9} />)
          : null}
      </Art>
    </Seg>
  )
}

/** 02 84 nouveaux avant-postes en douze mois : 84 petites maisons, en rangées */
const col02: Board = p => {
  const n = num(p.segment.figure?.value)
  if (!n || n > 120) return null
  const opts = { n, cols: 14, max: 17, gap: 4 }
  const { h } = rangCells(opts)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 4}>
        <Rang {...opts} picto="maison" y={2} t0={500} stagger={14} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Le 19 juillet 2024, un avis consultatif, non contraignant, de la Cour internationale de justice */
const col03: Board = p => {
  const [avis, non] = cuesOf(p)
  const date = word(p, /19[\s\u00a0]juillet 2024/)
  if (!avis || !non) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={110}>
        <Picto n="monument" x={14} y={10} size={84} t0={100} />
        {date ? <Txt x={147} y={26} text={date.text} max={10} size={14} tone="soft" t0={500} /> : null}
        <Arrow x1={106} y1={64} x2={182} y2={64} t0={700} />
        {avis.shown ? <Picto n="document" x={190} y={6} size={92} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Selon la Cour : Israël doit cesser toute nouvelle colonisation ; les États ne doivent ni la reconnaître ni
 *  aider à la maintenir */
const col04: Board = p => {
  const lead = word(p, /Selon la Cour/)
  const a = word(p, /Israël doit cesser toute nouvelle colonisation/)
  const b = word(p, /les États ne doivent[^.]*/)
  if (!a || !b) return null
  const linesA = wrap(a.text, 30).length
  const yb = Math.max(64, 18 + linesA * 17 + 22)
  const linesB = wrap(b.text, 30).length
  return (
    <Seg>
      <Head lines={[lead ? { text: lead.text, shown: lead.shown } : null]} />
      <Art h={yb + Math.max(50, linesB * 17 + 8)}>
        {a.shown ? (
          <>
            <Picto n="maison" x={2} y={0} size={46} tone="ghost" />
            <Txt x={62} y={18} text={a.text} max={30} size={15} anchor="start" t0={200} />
          </>
        ) : null}
        {b.shown ? (
          <>
            <Picto n="monument" x={2} y={yb} size={46} t0={0} />
            <Txt x={62} y={yb + 18} text={b.text} max={30} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Israël a rejeté l'avis, « fondamentalement erroné » : le document renvoyé par une flèche courbe */
const col05: Board = p => {
  const cue = cueOf(p, 0)
  const il = word(p, /Israël/)
  if (!cue || !il) return null
  return (
    <Seg>
      <Head lines={[{ text: `«\u00a0${cue.text}\u00a0»`, shown: cue.shown, mark: cue }]} />
      <Art h={108}>
        <Picto n="document" x={30} y={10} size={84} t0={100} />
        <Ink d="M246 56C226 10 168 6 128 34" t0={600} dur={700} />
        <Ink d="M128 34l3.6-9.4M128 34l10.2 0.6" t0={1250} dur={200} />
        <Txt x={250} y={84} text={il.text} size={16} t0={400} />
      </Art>
    </Seg>
  )
}

/** 06 4 entités et 3 personnes sanctionnées : quatre bâtiments, trois silhouettes, en rang */
const col06: Board = p => {
  const cue = cueOf(p, 0)
  const m = /(\d+)\D+?(\d+)/.exec(p.segment.figure?.value ?? '')
  if (!cue || !m) return null
  const e = Number(m[1])
  const n = Number(m[2])
  if (e + n > 8) return null
  const size = 34
  const gap = 4
  const split = 14
  const total = (e + n) * size + (e + n - 2) * gap + split
  const x0 = (W - total) / 2
  const xs = range(e + n).map(i => x0 + i * (size + gap) + (i >= e ? split - gap : 0))
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={size + 6}>
        {xs.map((x, i) => (
          <Picto key={i} n={i < e ? 'immeuble' : 'personne'} x={x} y={3} size={size} t0={400 + i * 150} tone={cue.shown ? 'count' : undefined} />
        ))}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Quelles mesures, et visant qui : le pays, ses dirigeants, ou les acteurs de la colonisation ? » */
const col07: Board = p => {
  const list = listAfterColon(p.segment.say).map(s => s.replace(/^ou\s+/, ''))
  if (list.length !== 3) return null
  const pictos: PictoName[] = ['monument', 'personne', 'maison']
  const cx = [54, 150, 244]
  return (
    <Seg kind="ask">
      <Art h={128}>
        {list.map((l, i) => (
          <Signe key={l} n={pictos[i]!} cx={cx[i]!} y={4} size={56} label={l} max={16} shown={heard(p, l)} t0={100 + i * 250} />
        ))}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Le Conseil de sécurité de l'ONU ——— */

/** 01 Le Conseil vote des résolutions ; toutes les voix n'y ont pas le même poids : cinq sièges tracés plus fort */
const onu01: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={SIEGES_H}>
        <Sieges t0={100} count={cue?.shown ? PERMANENTS : []} />
        <Picto n="document" x={W / 2 - 22} y={58} size={44} t0={900} />
      </Art>
    </Seg>
  )
}

/** 02 Cinq membres permanents ; l'opposition d'un seul bloque : sa croix, et la résolution en pointillé */
const onu02: Board = p => {
  const [cinq, seul] = cuesOf(p)
  if (!cinq || !seul) return null
  return (
    <Seg>
      <HeadCues p={p} only={[2]} />
      <Art h={SIEGES_H}>
        <Sieges kept count={cinq.shown ? PERMANENTS : []} cross={seul.shown ? [CONTRE] : []} />
        <Picto n="document" x={W / 2 - 22} y={58} size={44} kept tone={seul.shown ? 'ghost' : undefined} />
      </Art>
    </Seg>
  )
}

/** 03 Le 18 septembre 2025, un projet de résolution qui exige un cessez-le-feu immédiat : un document au milieu */
const onu03: Board = p => {
  const [date, texte] = cuesOf(p)
  if (!date) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={SIEGES_H}>
        <Sieges kept soft />
        <Picto n="document" x={W / 2 - 24} y={54} size={48} t0={200} tone={texte?.shown ? 'count' : undefined} />
      </Art>
    </Seg>
  )
}

/** 04 14 voix contre 1, rejeté : quatorze sièges pour (un aplat), un siège permanent contre (sa croix), le texte en
 *  pointillé */
const onu04: Board = p => {
  const [vote, rejete] = cuesOf(p)
  const m = /(\d+)\D+(\d+)/.exec(vote?.text ?? '')
  if (!vote || !m || Number(m[1]) + Number(m[2]) !== CONSEIL.n || Number(m[2]) !== 1) return null
  const pour = range(CONSEIL.n).filter(i => i !== CONTRE)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={SIEGES_H}>
        <Sieges kept tint={vote.shown ? pour : []} cross={vote.shown ? [CONTRE] : []} />
        <Picto n="document" x={W / 2 - 22} y={58} size={44} kept tone={rejete?.shown ? 'ghost' : undefined} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Chaque outil a sa règle : l'Union européenne (vingt-sept voix, majorité qualifiée ou unanimité) ; l'ONU (cinq
 *  sièges permanents, absence de veto). Deux colonnes égales. */
const onu05: Board = p => {
  const [qualifiee, unanimite, veto] = cuesOf(p)
  const ue = word(p, /l’Union européenne/)
  const onu = word(p, /ONU/)
  if (!qualifiee || !unanimite || !veto || !ue || !onu) return null
  const arc = (i: number) => {
    const a = Math.PI + ((i + 0.5) * Math.PI) / 5
    return { x: 225 + 46 * Math.cos(a), y: 82 + 46 * Math.sin(a) }
  }
  return (
    <Seg>
      <Art h={166}>
        {ue.shown ? (
          <>
            <Txt x={75} y={16} text={ue.text.replace(/^l’/, '')} size={15} tone="soft" t0={0} />
            <Cases n={27} cols={9} x={14} y={30} size={11} gap={3} t0={100} stagger={10} />
          </>
        ) : null}
        {qualifiee.shown ? <Txt x={75} y={104} text={qualifiee.text} size={15} tone="count" t0={0} /> : null}
        {unanimite.shown ? <Txt x={75} y={126} text={`ou ${unanimite.text}`} size={15} tone="count" t0={0} /> : null}
        <Ink d="M150 4V162" t0={200} dur={400} class="vc-thin vc-soft" />
        {onu.shown ? (
          <>
            <Txt x={225} y={16} text={onu.text} size={15} tone="soft" t0={0} />
            {range(5).map(i => {
              const s = arc(i)
              return <Ink key={i} d={circle(s.x, s.y, 9)} t0={100 + i * 80} dur={300} class="vc-bold" />
            })}
          </>
        ) : null}
        {veto.shown ? <Txt x={225} y={104} text={veto.text} max={14} size={15} tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 « Quelle place donner au Conseil de sécurité ? » : les sièges, un point d'interrogation au milieu */
const onu06: Board = p => (
  <Seg kind="ask">
    <Art h={SIEGES_H}>
      <Sieges kept />
      <Ask x={W / 2 - 18} y={44} h={60} t0={600} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const PROCHE_ORIENT: Record<string, Board> = {
  'proche-orient-intro-01': intro01,
  'proche-orient-intro-02': intro02,
  'proche-orient-intro-03': intro03,
  'proche-orient-intro-04': intro04,
  'proche-orient-intro-05': intro05,
  'proche-orient-intro-06': intro06,
  'proche-orient-intro-07': intro07,
  'proche-orient-intro-08': intro08,
  'proche-orient-mots-01': mots01,
  'proche-orient-mots-02': mots02,
  'proche-orient-mots-03': mots03,
  'proche-orient-mots-04': mots04,
  'proche-orient-mots-05': mots05,
  'proche-orient-mots-06': mots06,
  'proche-orient-mots-07': mots07,
  'proche-orient-justice-01': just01,
  'proche-orient-justice-02': just02,
  'proche-orient-justice-03': just03,
  'proche-orient-justice-04': just04,
  'proche-orient-justice-05': just05,
  'proche-orient-justice-06': just06,
  'proche-orient-justice-07': just07,
  'proche-orient-justice-08': just08,
  'proche-orient-justice-09': just09,
  'proche-orient-accord-01': acc01,
  'proche-orient-accord-02': acc02,
  'proche-orient-accord-03': acc03,
  'proche-orient-accord-04': acc04,
  'proche-orient-accord-05': acc05,
  'proche-orient-accord-06': acc06,
  'proche-orient-accord-07': acc07,
  'proche-orient-accord-08': acc08,
  'proche-orient-colonisation-01': col01,
  'proche-orient-colonisation-02': col02,
  'proche-orient-colonisation-03': col03,
  'proche-orient-colonisation-04': col04,
  'proche-orient-colonisation-05': col05,
  'proche-orient-colonisation-06': col06,
  'proche-orient-colonisation-07': col07,
  'proche-orient-onu-01': onu01,
  'proche-orient-onu-02': onu02,
  'proche-orient-onu-03': onu03,
  'proche-orient-onu-04': onu04,
  'proche-orient-onu-05': onu05,
  'proche-orient-onu-06': onu06,
}
