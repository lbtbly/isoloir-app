// Piste C, les planches de la série « Sécurité et justice » (src/ui/videos/series/securite_justice.ts) : un dessin
// par passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx).
// Mêmes règles que « Retraites » et « Logement » : les mots et les nombres viennent du script (mots mis en valeur,
// phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus rend null, et le passage
// prend le dessin générique de sa sorte d'image.
// Six pictogrammes propres au thème (un bouclier pour la police, une voiture, une caméra, un matelas, une fenêtre
// de cellule, un lycée) sont dessinés ici, au trait, sans attribut, comme ceux de la bibliothèque : aucune arme,
// aucun uniforme, aucune scène de violence ; une personne n'est qu'une tête et des épaules. Les deux côtés d'un
// débat sont sur des plateaux égaux. Quelques étiquettes courtes et neutres viennent du graphique de la fiche
// (« Confiants ou rassurés », « Ensemble des peines et mesures ») : l'« alt » du passage les reprend.

import { chartOf } from '../../model'
import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Brace, Fade, Ink, Marks, Txt, W, at, cls, cueOf, cuesOf, heard, num, ratioOf, sentenceWith, sentencesOf, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, HeadCues, Question, Seg, Signature, Src, Sur100 } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Disque, Rang, balance, barres, colonnes, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Un nombre du graphique de la fiche, écrit à la française (« 559 444 », « 11,3 ») */
const fr = (n: number) => {
  const [i, d] = String(n).split('.')
  const int = i!.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')
  return d ? `${int},${d}` : int
}

/** Le nombre d'un mot mis en valeur, tel qu'il est écrit (« 90 020 détenus » → « 90 020 ») */
const numOf = (s: string) => /[−-]?\d{1,3}(?:[\u202f\u00a0 ]\d{3})*(?:,\d+)?/.exec(s)?.[0] ?? s

/* ——— Les pictogrammes du thème ——— */

const rond = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

interface Trait {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat du bleu bille */
  fill?: string
  thin?: number[]
}

/** Dans un carré de 48 unités, comme ceux de pictos.tsx */
const MIENS = {
  /** Un bouclier, signe de la police et de la sécurité : un écu nu, son liseré intérieur */
  bouclier: {
    s: ['M24 4L42 10V24C42 34 34 41 24 45C14 41 6 34 6 24V10Z', 'M24 10L36 14V24C36 31 31 36 24 39C17 36 12 31 12 24V14Z'],
    fill: 'M24 4L42 10V24C42 34 34 41 24 45C14 41 6 34 6 24V10Z',
    thin: [1],
  },
  /** Une voiture de profil, vers la droite : la caisse, les vitres, deux roues */
  voiture: {
    s: ['M3 34V27L9 23L16 14H32L39 23L45 26V34Z', 'M18 17H24V23H13ZM27 17H31L36 23H27Z', `${rond(13, 34, 5)}${rond(35, 34, 5)}`],
    fill: 'M3 34V27L9 23L16 14H32L39 23L45 26V34Z',
    thin: [1],
  },
  /** Une caméra fixée au mur : la potence, le boîtier, l'objectif */
  camera: {
    s: ['M5 12V34M5 23H13', 'M13 16H36V30H13Z', 'M36 19L44 16V30L36 27'],
    fill: 'M13 16H36V30H13Z',
  },
  /** Un matelas posé au sol, un oreiller */
  matelas: {
    s: ['M2 42H46', 'M5 42V34Q5 31 8 31H40Q43 31 43 34V42', 'M9 31V28Q9 26 11 26H19Q21 26 21 28V31', 'M14 37H38'],
    fill: 'M5 42V34Q5 31 8 31H40Q43 31 43 34V42Z',
    thin: [3],
  },
  /** La fenêtre d'une cellule : un cadre et ses barreaux */
  cellule: {
    s: ['M8 6H40V42H8Z', 'M16 6V42M24 6V42M32 6V42', 'M8 24H40'],
    fill: 'M8 6H40V42H8Z',
    thin: [2],
  },
  /** Un lycée, bâtiment public : un fronton, une porte, quatre fenêtres ; le sol à 44 */
  lycee: {
    s: ['M2 44H46', 'M6 44V20H42V44', 'M9 20L24 10L39 20', 'M20 44V34H28V44', 'M10 25h6v5h-6zM32 25h6v5h-6zM10 35h6v5h-6zM32 35h6v5h-6z'],
    fill: 'M6 44V20H9L24 10L39 20H42V44Z',
    thin: [4],
  },
} satisfies Record<string, Trait>

type Mien = keyof typeof MIENS
type Nom = PictoName | Mien

const isMien = (n: Nom): n is Mien => n in MIENS

/** Un pictogramme de la bibliothèque, ou du thème, placé sur la feuille ; (x, y) : coin haut gauche */
function Fig({ n, x, y, size = 48, t0 = 0, kept, tone, step = 200, w = 1 }: { n: Nom; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; step?: number; w?: number }) {
  if (!isMien(n)) return <Picto n={n} x={x} y={y} size={size} t0={t0} kept={kept} tone={tone} step={step} w={w} />
  const d: Trait = MIENS[n]
  const s = size / 48
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(w / s) }}>
      {d.fill && tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class="vc-tint-count" d={d.fill} />
        </Fade>
      ) : null}
      {d.s.map((path, i) => (
        <Ink key={i} d={path} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : undefined} />
      ))}
    </g>
  )
}

/** Un pictogramme seul, dans son propre SVG (listes en HTML) */
const Glyph = ({ n, t0 = 0 }: { n: Nom; t0?: number }) => (
  <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
    <Fig n={n} x={0} y={0} t0={t0} step={150} />
  </svg>
)

/** Le pictogramme d'un sujet de la série, d'après ses mots (une question de l'introduction, le nom court d'une
 *  vidéo) : le bouclier de la police, les billets du trafic, le palais de justice, le lycée */
function sujet(text: string): Nom {
  const t = text.toLowerCase()
  if (/lycée/.test(t)) return 'lycee'
  if (/police|polici/.test(t)) return 'bouclier'
  if (/drogue|trafic|cannabis/.test(t)) return 'billet'
  if (/justice|pénal|prison|peine/.test(t)) return 'monument'
  return 'document'
}

/** Les questions de l'introduction, chacune avec son pictogramme, quand la voix la pose (comme Panel de mises.tsx) */
function Liste({ items, cols = 2 }: { items: { n: Nom; text: string; shown: boolean; cues?: Cue[] }[]; cols?: number }) {
  return (
    <ul class="vc-panel" style={{ '--cols': String(cols) }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyph n={it.n} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={it.cues ?? []} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Les approfondissements de la série, en sommaire numéroté (comme Sommaire de mises.tsx, avec les
 *  pictogrammes du thème) */
function Chapitres({ p, t0 = 200 }: { p: P; t0?: number }) {
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (!deep.length) return null
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyph n={sujet(`${v.short} ${v.title}`)} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/* ——— Communs à la série ——— */

/** Une pile de trois billets, chacun sur un cache couleur papier ; (x, y) : coin haut gauche du billet du dessus */
function Billets({ x, y, size = 72, t0 = 0, tone }: { x: number; y: number; size?: number; t0?: number; tone?: Tone }) {
  const s = size / 48
  return (
    <>
      {[2, 1, 0].map(k => {
        const bx = x - k * 6
        const by = y + k * 12
        return (
          <g key={k}>
            <Fade t0={t0 + (2 - k) * 250}>
              <path class="vc-paper" d={`M${bx + 3 * s} ${by + 12 * s}h${42 * s}v${24 * s}h${-42 * s}z`} />
            </Fade>
            <Picto n="billet" x={bx} y={by} size={size} t0={t0 + (2 - k) * 250} tone={k === 0 ? tone : undefined} />
          </g>
        )
      })}
    </>
  )
}

/** Le chiffre d'affaires du trafic (« au moins 3,5 milliards d'euros par an ») : une pile de billets sur un
 *  plancher hachuré (« au moins »), et le calendrier (« par an ») */
function trafic(p: P) {
  const cue = cueOf(p, 0)
  const min = word(p, /au moins/)
  const an = word(p, /par an/)
  if (!cue) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={134}>
        <Billets x={46} y={30} t0={200} />
        <Ink d="M14 107H150" t0={900} dur={500} class="vc-bold" />
        <Ink d={range(10).map(k => `M${20 + k * 13} 107l-7 9`).join('')} t0={1300} dur={400} class="vc-thin vc-soft" />
        {min?.shown ? <Txt x={14} y={132} text={min.text} anchor="start" size={15} tone="count" t0={200} /> : null}
        <Picto n="calendrier" x={196} y={30} size={66} t0={1200} />
        {an?.shown ? <Txt x={229} y={118} text={an.text} size={15} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Deux grandeurs à la même échelle, depuis zéro, les étiquettes tirées du passage */
function deux(p: P, labels: [RegExp, RegExp], o: { room?: number; tone?: [Tone | undefined, Tone | undefined] } = {}) {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, labels[0])
  const lb = word(p, labels[1])
  if (!a || !b || !va || !vb) return null
  return barres({
    items: [
      { label: la?.text, value: va, text: a.text, shown: a.shown, tone: o.tone?.[0] },
      { label: lb?.text, value: vb, text: b.text, shown: b.shown, tone: o.tone?.[1] },
    ],
    y: 2,
    size: 24,
    gap: 26,
    room: o.room ?? 84,
    t0: 100,
  })
}

/** Les deux côtés d'un débat : une balance au fléau horizontal, deux plateaux de même taille, chacun avec ses
 *  deux pictogrammes, son étiquette quand la voix la dit */
function debat(p: P, left: [Nom, Nom], right: [Nom, Nom]) {
  const [a, b] = cuesOf(p)
  const pair = ([n1, n2]: [Nom, Nom], d: number) => (cx: number, base: number) => (
    <>
      <Fig n={n1} x={cx - 44} y={base - 44} size={42} t0={d} />
      <Fig n={n2} x={cx + 2} y={base - 44} size={42} t0={d + 250} />
    </>
  )
  const bal = balance({
    left: pair(left, 900),
    right: pair(right, 1400),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** La question de fin : le pictogramme du sujet, un point d'interrogation, puis la question dite */
const fin = (n: Nom) => (p: P) => (
  <Seg kind="ask">
    <Art h={110}>
      <Fig n={n} x={56} y={8} size={94} t0={100} />
      <Ask x={184} y={14} h={80} t0={800} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Introduction ——— */

/** 01 « vous sentez-vous en confiance, ou sur vos gardes ? » : vous, en face le bouclier de la police */
const intro01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={150}>
      <Ink d="M10 146H290" t0={100} dur={700} class="vc-soft" />
      <Picto n="personne" x={18} y={58} size={88} t0={250} />
      <Fig n="bouclier" x={200} y={54} size={84} t0={700} />
      <Ask x={132} y={50} h={60} t0={1500} />
    </Art>
  </Seg>
)

/** 02 50 % confiants, 28 % indifférents, 22 % méfiants : trois barres à la même échelle, libellés de la fiche */
const intro02: Board = p => {
  const c = chartOf(p.segment)
  const cues = cuesOf(p)
  if (!c || c.kind !== 'compare' || c.items.length !== cues.length || c.items.some((it, i) => num(cues[i]!.text) !== it.value)) return null
  const g = barres({
    items: c.items.map((it, i) => ({ label: it.label, value: it.value, text: cues[i]!.text, shown: cues[i]!.shown })),
    y: 2,
    size: 18,
    gap: 20,
    room: 78,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 472 956 victimes, plus de la moitié dans le cadre familial : un disque, la part familiale comptée */
const intro03: Board = p => {
  const c = chartOf(p.segment)
  const half = cueOf(p, 1)
  const fam = word(p, /dans le cadre familial/)
  if (!c || c.kind !== 'compare' || c.items.length < 2 || !half) return null
  const part = c.items[1]!.value / c.items[0]!.value
  const tip = partPoint(80, 78, 50, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={158}>
        <Disque cx={80} cy={78} r={74} part={part} shown={half.shown} t0={300} />
        {half.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L174 70`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={178} y={62} text={half.text} max={11} size={16} anchor="start" tone="count" t0={500} />
            {fam ? <Txt x={178} y={104} text={fam.text} max={14} size={14} anchor="start" t0={700} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Ces chiffres ne comptent que les faits enregistrés : une plainte, un signalement, l'initiative des forces de
 *  l'ordre entrent dans un registre */
const intro04: Board = p => {
  const ways: [RegExp, Nom][] = [
    [/une plainte/, 'document'],
    [/un signalement/, 'enveloppe'],
    [/à l’initiative des forces de l’ordre/, 'loupe'],
  ]
  const list = ways.map(([re, n]) => ({ w: word(p, re), n }))
  if (list.some(l => !l.w)) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={172}>
        {list.map(({ w, n }, i) => {
          const y = 6 + i * 56
          return w!.shown ? (
            <g key={n}>
              <Fig n={n} x={0} y={y} size={38} t0={0} />
              <Txt x={46} y={y + 17} text={w!.text} max={17} size={14} anchor="start" t0={200} />
              <Arrow x1={182} y1={y + 19} x2={212} y2={86} t0={400} tone="count" />
            </g>
          ) : null
        })}
        <Picto n="livre" x={214} y={44} size={84} t0={200} />
      </Art>
    </Seg>
  )
}

/** 05 Le trafic de drogues : au moins 3,5 milliards d'euros par an */
const intro05: Board = p => trafic(p)

/** 06 90 020 détenus pour 63 348 places : deux barres à la même échelle, ce qui dépasse les places compté */
const intro06: Board = p => {
  const [det, pl] = cuesOf(p)
  const vd = num(det?.text)
  const vp = num(pl?.text)
  const ld = word(p, /détenus/)
  const lp = word(p, /places/)
  if (!det || !pl || !vd || !vp || vd <= vp) return null
  const g = barres({
    items: [
      { label: lp?.text, value: vp, text: numOf(pl.text), shown: pl.shown },
      { label: ld?.text, value: vd, text: numOf(det.text), shown: det.shown },
    ],
    y: 2,
    size: 26,
    gap: 26,
    room: 84,
    t0: 100,
  })
  const [a, b] = g.geo
  const both = det.shown && pl.shown
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 12}>
        {g.el}
        {both ? (
          <>
            <Fade t0={900} class="vc-count">
              <rect class="vc-tint-count" x={a!.x1} y={b!.top} width={b!.x1 - a!.x1} height={b!.bottom - b!.top} />
            </Fade>
            <Fade t0={900} class="vc-dash vc-soft">
              <path d={`M${a!.x1} ${a!.top - 2}V${b!.bottom + 8}`} />
            </Fade>
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Liste items={qs.map(q => ({ n: sujet(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))} />
    </Seg>
  )
}

/** 08 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— La police ——— */

/** 01 Patrouillent, contrôlent, interviennent : trois pictogrammes, quand la voix les dit ; puis les deux
 *  questions */
const police01: Board = p => {
  const items: [RegExp, Nom, number][] = [
    [/patrouillent/, 'voiture', 50],
    [/contrôlent/, 'carte', 150],
    [/interviennent/, 'bouclier', 250],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={116}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? (
            <g key={n}>
              <Fig n={n} x={cx - 32} y={4} size={64} t0={i * 80} />
              <Txt x={cx} y={94} text={w.text} size={15} t0={300} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 02 Les effectifs visés de 2023 à 2027 : la police et la gendarmerie, deux barres à la même échelle */
const police02: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const pol = word(p, /la police/)
  const gen = word(p, /la gendarmerie/)
  const years = word(p, /de \d{4} à \d{4}/)
  if (!a || !b || !va || !vb) return null
  const top = years ? 26 : 2
  const g = barres({
    items: [
      { label: pol?.text, value: va, text: `+${numOf(a.text)}`, shown: a.shown },
      { label: gen?.text, value: vb, text: `+${numOf(b.text)}`, shown: b.shown },
    ],
    y: top,
    size: 24,
    gap: 26,
    room: 92,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={top + g.h + 6}>
        {years ? <Txt x={0} y={15} text={years.text} anchor="start" size={14} tone="soft" /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Cinq cas fixés par la loi depuis 2017 : le texte, daté, et ses cinq cases */
const police03: Board = p => {
  const cas = cueOf(p, 0)
  const n = num(cas?.text?.split(/\s/)[0])
  const year = yearsOf(p.segment.say)[0]
  if (!cas || !n || n > 8) return null
  const size = 34
  const gap = 12
  const x = (W - n * size - (n - 1) * gap) / 2
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={156}>
        <Picto n="document" x={104} y={0} size={92} t0={100} />
        {year ? <Txt x={204} y={56} text={String(year)} size={20} big anchor="start" tone="soft" t0={600} /> : null}
        <Cases n={n} cols={n} x={x} y={112} size={size} gap={gap} count={cas.shown ? range(n) : []} t0={500} stagger={60} />
      </Art>
    </Seg>
  )
}

/** 04 Un conducteur qui refuse de s'arrêter : la voiture passe la ligne d'arrêt ; dessous, les deux conditions,
 *  chacune cochée quand la voix la dit */
const police04: Board = p => {
  const c1 = word(p, /qu’on ne puisse pas immobiliser le véhicule autrement/)
  const c2 = word(p, /porter atteinte à la vie ou à l’intégrité physique des agents ou d’autrui/)
  const refus = cueOf(p, 0)
  if (!c1 || !c2 || !refus) return null
  const rows: [Cue, number][] = [
    [c1, 104],
    [c2, 150],
  ]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={200}>
        <Ink d="M6 74H294" t0={0} dur={600} class="vc-soft" />
        <Fade t0={300} class="vc-dash">
          <path d="M150 14V84" />
        </Fade>
        {refus.shown ? (
          <>
            <g class="vc-slide" style={{ '--from': '-110px', ...at(200, 1400) }}>
              <Fig n="voiture" x={176} y={10} size={72} kept />
            </g>
            <Arrow x1={60} y1={34} x2={140} y2={34} dash t0={1200} />
          </>
        ) : (
          <Fig n="voiture" x={66} y={10} size={72} t0={100} />
        )}
        {rows.map(([c, y], i) =>
          c.shown ? (
            <g key={i}>
              <Ink d={`M6 ${y - 12}h14v14h-14z`} t0={0} dur={300} />
              <Ink d={`M9 ${y - 5}l4 4l8-11`} t0={300} dur={300} class="vc-count vc-bold" />
              <Txt x={30} y={y} text={c.text} max={32} size={14} anchor="start" t0={150} />
            </g>
          ) : null,
        )}
      </Art>
    </Seg>
  )
}

/** 05 Les contrôles d'identité : 16 % en 2016, 26 % en 2024, deux colonnes depuis zéro */
const police05: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const what = word(p, /contrôlées au moins une fois en cinq ans/)
  if (cues.length !== 2 || years.length !== 2) return null
  const cols = colonnes({
    items: cues.map((c, i) => ({ label: String(years[i]), value: num(c.text) ?? 0, text: c.text, tone: i === 1 ? ('count' as const) : undefined, shown: c.shown })),
    y: 30,
    h: 140,
    x: 72,
    w: 156,
    colW: 52,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Art h={30 + cols.h}>
        {what ? <Txt x={W / 2} y={16} text={what.text} size={15} /> : null}
        {cols.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 « 4 fois plus de risque d'avoir été contrôlés » : une carte d'identité pour le reste de la population,
 *  quatre pour l'autre groupe ; les personnes sont toutes dessinées de la même façon */
const police06: Board = p => {
  const cue = cueOf(p, 0)
  const k = num(cue?.text)
  const reste = word(p, /le reste de la population/)
  const groupe = word(p, /les jeunes hommes perçus comme noirs, arabes ou maghrébins/)
  if (!cue || !k || k > 4 || !reste || !groupe) return null
  const row = (y: number, n: number, tone: Tone | undefined, d: number, show: boolean) => (
    <>
      <Picto n="personne" x={0} y={y} size={46} t0={d} />
      {show ? range(n).map(i => <Picto key={i} n="carte" x={58 + i * 58} y={y - 2} size={52} tone={tone} t0={d + 250 + i * 200} />) : null}
    </>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Txt x={0} y={13} text={reste.text} anchor="start" size={14} tone="soft" />
        {row(22, 1, undefined, 100, true)}
        <Txt x={0} y={90} text={groupe.text} anchor="start" max={40} size={14} tone="soft" />
        {row(122, k, 'count', 300, cue.shown)}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les caméras à l'école : le plan d'un établissement ; une caméra filme l'entrée et les lieux de passage ; la
 *  cour, la classe et la cantine restent hors champ (caméras en pointillé) */
const police07: Board = p => {
  const entrees = word(p, /les entrées, les sorties/)
  const passage = word(p, /les lieux de passage/)
  const rooms: [RegExp, number][] = [
    [/cour/, 55],
    [/classe/, 150],
    [/cantine/, 245],
  ]
  const off = cueOf(p, 1)
  const names = rooms.map(([re, cx]) => ({ w: word(p, re), cx }))
  if (!entrees || !passage || !off || names.some(n => !n.w)) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={196}>
        <Ink d="M10 6H290V150H170M130 150H10Z" t0={0} dur={900} />
        <Ink d="M10 82H290M100 6V82M200 6V82" t0={500} dur={600} class="vc-thin" />
        {names.map(({ w, cx }) => (
          <g key={cx}>
            <Txt x={cx} y={30} text={w!.text} size={15} t0={700} />
            {off.shown ? (
              <>
                <Fig n="camera" x={cx - 21} y={30} size={42} tone="soft" t0={0} />
                <Ink d={`M${cx - 18} ${68}L${cx + 20} ${38}`} t0={500} dur={300} class="vc-bold" />
              </>
            ) : null}
          </g>
        ))}
        {entrees.shown ? (
          <>
            <Fig n="camera" x={176} y={88} size={40} tone="count" t0={0} />
            <Txt x={150} y={176} text={entrees.text} size={14} t0={300} />
          </>
        ) : null}
        {passage.shown ? <Txt x={20} y={124} text={passage.text} anchor="start" size={14} tone="soft" t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 08 Les moyens d'un côté (bouclier, caméra), les pratiques de l'autre (contrôle d'identité, règle) */
const police08: Board = p => debat(p, ['bouclier', 'camera'], ['carte', 'document'])

/** 09 « Quelle priorité pour la police et la sécurité du quotidien ? » */
const police09: Board = fin('bouclier')

/* ——— Le trafic de drogue ——— */

/** 01 Le cannabis est interdit ; il se vend pourtant : la loi, une flèche vers des billets, la question */
const drogues01: Board = p => {
  const q = cueOf(p, 1)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={110}>
        <Picto n="document" x={0} y={8} size={88} t0={100} />
        <Arrow x1={92} y1={52} x2={132} y2={52} dash t0={700} />
        <Billets x={146} y={10} size={74} t0={900} />
        {q?.shown ? <Ask x={252} y={20} h={66} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Au moins 3,5 milliards d'euros par an */
const drogues02: Board = p => trafic(p)

/** 03 10,8 % des 18 à 64 ans, un peu plus d'un sur dix : la part dans un disque, d'après le graphique de la fiche */
const drogues03: Board = p => {
  const c = chartOf(p.segment)
  const pct = cueOf(p, 0)
  const ratio = cueOf(p, 1)
  const who = word(p, /des 18 à 64 ans/)
  if (!c || c.kind !== 'part' || !pct || !c.total) return null
  const part = c.value / c.total
  const tip = partPoint(80, 78, 56, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={158}>
        <Disque cx={80} cy={78} r={74} part={part} shown={pct.shown} t0={300} />
        {ratio?.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L176 30`} t0={200} dur={400} class="vc-count vc-thin" />
            <Txt x={180} y={36} text={ratio.text} size={18} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
        {who ? <Txt x={180} y={96} text={who.text} max={12} size={15} anchor="start" t0={700} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 À 17 ans, 29,9 % en 2022, 20 points de moins qu'en 2002 : deux colonnes à la même échelle depuis zéro, la
 *  hauteur de 2002 tirée de l'écart dit ; l'écart marqué d'une accolade */
const drogues04: Board = p => {
  const [v, gap] = cuesOf(p)
  const val = num(v?.text)
  const dv = num(gap?.text)
  const years = yearsOf(p.segment.say)
  const y1 = years[0]
  const y0 = years[years.length - 1]
  const age = word(p, /À 17 ans/)
  const what = word(p, /avaient déjà fumé du cannabis/)
  if (!v || !gap || !val || !dv || !y0 || !y1 || y0 >= y1) return null
  const base = 178
  const k = 2.2
  const h1 = val * k
  const h0 = (val + dv) * k
  const cw = 56
  const xa = 40
  const xb = 196
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + cw}V${base}`
  return (
    <Seg>
      <Art h={206}>
        {age ? <Txt x={0} y={16} text={age.text} anchor="start" size={15} /> : null}
        {what ? <Txt x={age ? 70 : 0} y={16} text={what.text} anchor="start" size={15} tone="soft" /> : null}
        <Ink d={`M14 ${base}H286`} t0={0} dur={500} class="vc-soft" />
        <Ink d={col(xa, h0)} t0={200} dur={700} />
        <Txt x={xa + cw / 2} y={base + 21} text={String(y0)} size={15} tone="soft" t0={300} />
        <Fade t0={900} class="vc-count">
          <rect class="vc-tint-count" x={xb} y={base - h1} width={cw} height={h1} />
        </Fade>
        <g class="vc-count">
          <Ink d={col(xb, h1)} t0={600} dur={700} />
        </g>
        <Txt x={xb + cw / 2} y={base - h1 - 9} text={v.text} size={22} big tone="count" t0={1000} />
        <Txt x={xb + cw / 2} y={base + 21} text={String(y1)} size={15} tone="soft" t0={700} />
        {gap.shown ? (
          <>
            <Fade t0={0} class="vc-dash vc-soft">
              <path d={`M${xa + cw} ${base - h0}H${xb + cw}`} />
            </Fade>
            <Brace x1={xb - 14} y1={base - h0} x2={xb - 14} y2={base - h1} side={1} tone="count" t0={200} />
            <Txt x={(xa + cw + xb - 30) / 2} y={base - (h0 + h1) / 2 - 2} text={gap.text} max={10} size={14} tone="count" t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Un délit (un texte de loi, la peine maximale) ; une amende forfaitaire (un billet) qui met fin aux
 *  poursuites */
const drogues05: Board = p => {
  const [delit, af] = cuesOf(p)
  const peine = word(p, /jusqu’à un an de prison et [\d ]+euros d’amende/)
  const fin_ = word(p, /peut mettre fin aux poursuites/)
  if (!delit || !af) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={156}>
        <Picto n="document" x={47} y={0} size={56} t0={200} />
        {delit.shown ? <Txt x={75} y={78} text={delit.text} size={16} t0={0} /> : null}
        {peine?.shown ? <Txt x={75} y={100} text={peine.text} max={18} size={14} tone="soft" t0={200} /> : null}
        <Ink d="M150 6V150" t0={300} dur={500} class="vc-soft vc-thin" />
        {af.shown ? (
          <>
            <Picto n="billet" x={190} y={-6} size={70} t0={0} />
            <Txt x={225} y={78} text={af.text} max={14} size={15} t0={300} />
          </>
        ) : null}
        {fin_?.shown ? <Txt x={225} y={118} text={fin_.text} max={18} size={14} tone="soft" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 La loi de 2025 : un parquet spécialisé (le palais de justice), le gel des avoirs (les pièces sous cadenas) */
const drogues06: Board = p => {
  const [proc, gel] = cuesOf(p)
  const year = yearsOf(p.segment.say)[0]
  const k = 44 / 48
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        <Picto n="document" x={0} y={14} size={64} t0={100} />
        {year ? <Txt x={32} y={100} text={String(year)} size={16} tone="soft" t0={400} /> : null}
        <Arrow x1={68} y1={46} x2={96} y2={46} t0={600} />
        <Picto n="monument" x={100} y={4} size={84} t0={800} tone={proc?.shown ? 'count' : undefined} />
        {gel?.shown ? (
          <>
            <Arrow x1={192} y1={46} x2={212} y2={46} t0={0} />
            <Picto n="pieces" x={212} y={8} size={64} t0={150} />
            <Fade t0={500}>
              <path class="vc-paper" d={`M${244 + 10 * k} ${46 + 22 * k}h${28 * k}v${22 * k}h${-28 * k}z`} />
            </Fade>
            <Picto n="cadenas" x={244} y={46} size={44} tone="count" t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 117 millions d'euros saisis, 14 % de toutes les saisies : cent pièces, quatorze comptées */
const drogues07: Board = p => {
  const pct = cueOf(p, 1)
  const n = num(pct?.text)
  if (!pct || !n || n > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="piece" low={Math.round(n)} caption={sentenceWith(p.segment.say, pct.text)} cues={[pct]} shown={pct.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 08 Moins de jeunes ont essayé le cannabis ; le trafic rapporte des milliards : deux plateaux égaux */
const drogues08: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="personne" x={cx - 42} y={base - 46} size={46} t0={900} />
        <Picto n="baisse" x={cx + 8} y={base - 44} size={36} w={1.2} t0={1200} />
      </>
    ),
    right: (cx, base) => <Picto n="billet" x={cx - 32} y={base - 47} size={64} t0={1400} />,
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 09 « Comment affaiblir les réseaux du trafic de drogue ? » : des billets reliés en réseau, la question */
const drogues09: Board = p => {
  const nodes: [number, number][] = [
    [30, 20],
    [26, 92],
    [118, 14],
    [130, 98],
  ]
  return (
    <Seg kind="ask">
      <Art h={110}>
        <Ink d={nodes.map(([x, y]) => `M78 56L${x} ${y}`).join('')} t0={600} dur={600} class="vc-thin vc-soft" />
        {nodes.map(([x, y], i) => (
          <Ink key={i} d={rond(x, y, 7)} t0={900 + i * 120} dur={300} />
        ))}
        <Fade t0={100}>
          <path class="vc-paper" d="M54 44h48v24h-48z" />
        </Fade>
        <Picto n="billet" x={54} y={32} size={48} t0={100} />
        <Ask x={190} y={14} h={80} t0={1300} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— La justice pénale ——— */

/** 01 « Quelle peine reçoit-elle ? » : le palais de justice, une personne, la question */
const justice01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={124}>
      <Ink d="M8 120H292" t0={0} dur={700} class="vc-soft" />
      <Picto n="monument" x={4} y={14} size={100} t0={200} />
      <Arrow x1={112} y1={70} x2={148} y2={70} t0={900} />
      <Picto n="personne" x={152} y={40} size={80} t0={1100} />
      <Ask x={248} y={34} h={70} t0={1600} />
    </Art>
  </Seg>
)

/** 02 121 057 peines de prison au moins en partie ferme, un peu plus d'une sur cinq : cinq jugements, un compté */
const justice02: Board = p => {
  const cue = cueOf(p, 1)
  const r = ratioOf(cue?.text)
  const note = word(p, /un peu plus d’une sur cinq/)
  if (!cue || !r || r.n > 10) return null
  const { h } = rangCells({ n: r.n, max: 50, gap: 12, y: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 40}>
        <Rang n={r.n} picto="document" max={50} gap={12} y={4} count={range(r.k)} shown={cue.shown} t0={200} stagger={150} />
        {cue.shown && note ? <Txt x={W / 2} y={h + 32} text={note.text} size={16} tone="count" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 14 488 travaux d'intérêt général : les trois grandeurs du graphique de la fiche, à la même échelle */
const justice03: Board = p => {
  const c = chartOf(p.segment)
  const cue = cueOf(p, 0)
  if (!c || c.kind !== 'compare' || !cue) return null
  const last = c.items.length - 1
  const g = barres({
    items: c.items.map((it, i) => ({ label: it.label, value: it.value, text: fr(it.value), tone: i === last ? ('count' as const) : undefined, shown: i === last ? cue.shown : true })),
    y: 2,
    size: 16,
    gap: 22,
    room: 86,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 142,1 détenus pour 100 places ; un an plus tôt, 134,7 : deux colonnes depuis zéro au-dessus du trait
 *  des 100 places */
const justice04: Board = p => {
  const [now, before] = cuesOf(p)
  const vn = num(now?.text)
  const vb = num(before?.text)
  const cent = word(p, /100 places/)
  const ref = num(cent?.text)
  const avant = word(p, /un an plus tôt/i)
  const date = word(p, /1er septembre \d{4}/)
  const title = word(p, /détenus pour 100 places/)
  if (!now || !before || !vn || !vb || !ref) return null
  const base = 170
  const k = 0.9
  const cw = 56
  const xa = 50
  const xb = 130
  const x0 = 30
  const x1 = 200
  const col = (x: number, v: number) => `M${x} ${base}V${base - v * k}H${x + cw}V${base}`
  return (
    <Seg kind="fig">
      <Art h={208}>
        {title ? <Txt x={W / 2} y={15} text={title.text} size={15} /> : null}
        <Ink d={`M${x0} ${base}H${x1}`} t0={0} dur={500} class="vc-soft" />
        {before.shown ? (
          <>
            <Ink d={col(xa, vb)} t0={0} dur={600} />
            <Txt x={xa + cw / 2} y={base - vb * k - 8} text={before.text} size={20} big t0={300} />
          </>
        ) : null}
        <Fade t0={600} class="vc-count">
          <rect class="vc-tint-count" x={xb} y={base - vn * k} width={cw} height={vn * k} />
        </Fade>
        <g class="vc-count">
          <Ink d={col(xb, vn)} t0={200} dur={600} />
        </g>
        <Txt x={xb + cw / 2} y={base - vn * k - 8} text={now.text} size={20} big tone="count" t0={600} />
        <Fade t0={900} class="vc-dash vc-soft">
          <path d={`M${x0} ${base - ref * k}H${x1}`} />
        </Fade>
        {cent ? <Txt x={x1 + 4} y={base - ref * k + 5} text={cent.text} anchor="start" size={13} tone="soft" t0={1000} /> : null}
        {avant ? <Txt x={xa + cw / 2} y={base + 18} text={avant.text.charAt(0).toLowerCase() + avant.text.slice(1)} max={8} size={13} tone="soft" t0={300} /> : null}
        {date ? <Txt x={xb + cw / 2} y={base + 18} text={date.text} max={13} size={13} tone="soft" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le plan de 15 000 places, réalisé à 36,1 % : la barre du plan en pointillé, la part construite en trait
 *  plein, au bleu bille (et les places nettes, si le passage les dit) */
const justice05: Board = p => {
  const [plan, pct] = cuesOf(p)
  const total = num(plan?.text)
  const part = num(pct?.text)
  const nettes = word(p, /\d[\d ]*places nettes/)
  const annonce = word(p, /annoncé en \d{4}/)
  if (!plan || !pct || !total || !part || part > 100) return null
  const x0 = 6
  const x1 = 294
  const y = 46
  const hh = 34
  const xp = x0 + ((x1 - x0) * part) / 100
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={nettes ? 122 : 92}>
        {annonce ? <Txt x={x0} y={16} text={annonce.text} anchor="start" size={14} tone="soft" /> : null}
        <Txt x={x1} y={36} text={plan.text} anchor="end" size={15} t0={200} />
        <Fade t0={100} class="vc-dash">
          <path d={`M${x0} ${y}H${x1}V${y + hh}H${x0}Z`} />
        </Fade>
        {pct.shown ? (
          <>
            <Fade t0={500} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={y} width={xp - x0} height={hh} />
            </Fade>
            <g class="vc-count">
              <Ink d={`M${x0} ${y}H${xp}V${y + hh}H${x0}Z`} t0={0} dur={700} />
            </g>
            {nettes ? <Txt x={x0} y={y + hh + 24} text={nettes.text} anchor="start" size={15} tone="count" t0={600} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 11,3 juges pour 100 000 habitants, contre 17,6 pour la médiane européenne ; 1 500 magistrats de plus prévus */
const justice06: Board = p => {
  const g = deux(p, [/la France/, /la médiane européenne/], { room: 70 })
  const plus = word(p, /\d[\d ]*magistrats de plus/)
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + (plus ? 46 : 6)}>
        {g.el}
        {plus?.shown ? (
          <>
            <Picto n="hausse" x={0} y={g.h + 14} size={28} tone="count" w={1.2} t0={0} />
            <Txt x={32} y={g.h + 36} text={plus.text} anchor="start" size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 La récidive légale : une première peine, cinq années, le même délit ; dessous, la peine maximale doublée */
const justice07: Board = p => {
  const [rec, dbl] = cuesOf(p)
  const cinq = word(p, /cinq ans/)
  const meme = word(p, /le même délit/)
  const prev = word(p, /une précédente peine/)
  const max = word(p, /La peine maximale encourue/)
  if (!rec || !dbl || !cinq) return null
  const y = 64
  const ticks = range(6).map(i => 70 + i * 40)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={190}>
        <Ink d={`M6 ${y}H294`} t0={0} dur={700} class="vc-soft" />
        <Fade t0={200}>
          <rect class="vc-tint" x={8} y={y - 10} width={62} height={20} />
        </Fade>
        <Ink d={`M8 ${y - 10}h62v20h-62z`} t0={200} dur={500} />
        {prev ? <Txt x={6} y={y - 20} text={prev.text} anchor="start" size={14} tone="soft" t0={300} /> : null}
        <Ink d={ticks.map(x => `M${x} ${y - 5}v10`).join('')} t0={600} dur={400} class="vc-soft vc-thin" />
        <Brace x1={70} y1={y + 12} x2={270} y2={y + 12} t0={900} />
        <Txt x={170} y={y + 46} text={cinq.text} size={15} t0={1100} />
        {meme?.shown ? (
          <>
            <Picto n="drapeau" x={180} y={y - 44} size={44} tone="count" t0={0} />
            <Txt x={228} y={y - 24} text={meme.text} anchor="start" max={9} size={14} tone="count" t0={300} />
          </>
        ) : null}
        {max ? <Txt x={6} y={y + 84} text={max.text} anchor="start" size={14} t0={1300} /> : null}
        <Ink d={`M8 ${y + 94}h110v20h-110z`} t0={1400} dur={500} />
        {dbl.shown ? (
          <>
            <Fade t0={200} class="vc-count">
              <rect class="vc-tint-count" x={118} y={y + 94} width={110} height={20} />
              <path d={`M118 ${y + 94}h110v20h-110`} />
            </Fade>
            <Txt x={236} y={y + 109} text={dbl.text} anchor="start" size={15} tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 20,4 % en récidive légale ; 24,1 % déjà condamnés sans l'être : deux barres à la même échelle */
const justice08: Board = p => {
  const g = deux(p, [/en récidive légale/, /avaient déjà été condamnées/], { room: 84 })
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Des prisons surpeuplées (cellule, matelas) ; la récidive légale (un jugement, deux flèches qui tournent en
 *  rond) : deux plateaux égaux */
const justice09: Board = p => debat(p, ['cellule', 'matelas'], ['document', 'repetition'])

/** 10 « Quelle orientation pour la justice pénale ? » */
const justice10: Board = fin('monument')

/* ——— Les blocages de lycées ——— */

/** 01 Des lycées bloqués : le lycée, une barrière devant sa porte ; la question */
const lycees01: Board = p => {
  const q = cueOf(p, 1)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={126}>
        <Ink d="M6 122H294" t0={0} dur={700} class="vc-soft" />
        <Fig n="lycee" x={8} y={122 - (44 * 104) / 48} size={104} t0={200} />
        <Barriere x={182} y={122} s={1.4} t0={1200} />
        {q?.shown ? <Ask x={232} y={26} h={70} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 2 261 051 élèves au lycée : le lycée, et une foule qui se remplit */
const lycees02: Board = p => {
  const crowd = rangCells({ n: 24, cols: 8, x: 104, w: 196, max: 22, gap: 3 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={Math.max(96, crowd.h + 10)}>
        <Fig n="lycee" x={0} y={4} size={92} t0={100} />
        <Rang n={24} picto="personne" cols={8} x={104} w={196} max={22} gap={3} y={14} t0={600} stagger={40} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 91 % se sentent bien dans leur lycée, 59 % stressés par les examens : deux barres à la même échelle */
const lycees03: Board = p => {
  const g = deux(p, [/se sentir bien, ou tout à fait bien/, /plutôt ou très stressés/], { room: 70 })
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 La liberté d'information et d'expression (une pancarte), les activités d'enseignement (un livre) : entre
 *  les deux, la limite que fixe la loi */
const lycees04: Board = p => {
  const [lib, ens] = cuesOf(p)
  if (!lib || !ens) return null
  return (
    <Seg>
      <Art h={168}>
        <Picto n="pancarte" x={30} y={0} size={92} t0={100} />
        {lib.shown ? <Txt x={75} y={116} text={lib.text} max={15} size={15} t0={300} /> : null}
        <Fade t0={900} class="vc-dash vc-soft">
          <path d="M150 4V160" />
        </Fade>
        {ens.shown ? (
          <>
            <Picto n="livre" x={184} y={6} size={84} t0={0} />
            <Txt x={226} y={116} text={ens.text} max={13} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 La Convention des droits de l'enfant : la liberté de réunion pacifique (trois personnes réunies) ; seule la
 *  loi peut la restreindre (un cadre en pointillé autour d'elles, et le texte de loi) */
const lycees05: Board = p => {
  const [reunion, loi] = cuesOf(p)
  const age = word(p, /moins de 18 ans/)
  if (!reunion || !loi) return null
  return (
    <Seg>
      <Art h={168}>
        <Picto n="document" x={0} y={8} size={72} t0={100} />
        {age ? <Txt x={36} y={104} text={age.text} max={9} size={14} tone="soft" t0={500} /> : null}
        {reunion.shown ? (
          <>
            {[112, 152, 192].map((x, i) => (
              <Picto key={x} n="personne" x={x} y={30} size={46} t0={i * 150} />
            ))}
            <Txt x={174} y={104} text={reunion.text} max={20} size={14} t0={500} />
          </>
        ) : null}
        {loi.shown ? (
          <>
            <Fade t0={0} class="vc-dash">
              <path d="M100 16H248V84H100Z" />
            </Fade>
            <Picto n="document" x={252} y={10} size={44} t0={200} />
            <Txt x={274} y={74} text={loi.text} max={8} size={14} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Le conseil des délégués pour la vie lycéenne : dix élèves autour d'une table, le chef d'établissement au bout */
const lycees06: Board = p => {
  const dix = cueOf(p, 0)
  const n = num(dix?.text?.split(/\s/)[0])
  const chef = word(p, /Le chef d’établissement/)
  if (!dix || !n || n % 2 || n > 12) return null
  const half = n / 2
  const xs = range(half).map(i => 104 + i * 40)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={166}>
        <Ink d={`M86 64H${xs[half - 1]! + 28}V88H86Z`} t0={100} dur={700} />
        {xs.map((x, i) => (
          <Picto key={`a${i}`} n="personne" x={x - 2} y={22} size={36} t0={400 + i * 90} tone={dix.shown ? 'count' : undefined} />
        ))}
        {xs.map((x, i) => (
          <Picto key={`b${i}`} n="personne" x={x - 2} y={92} size={36} t0={850 + i * 90} tone={dix.shown ? 'count' : undefined} />
        ))}
        {chef ? (
          <>
            <Picto n="personne" x={18} y={52} size={46} t0={1300} />
            {chef.shown ? <Txt x={0} y={156} text={chef.text} anchor="start" size={14} t0={0} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Entrer sans autorisation pour troubler l'ordre : un an de prison et 7 500 euros au plus ; une amende
 *  forfaitaire de 500 euros */
const lycees07: Board = p => {
  const af = word(p, /amende forfaitaire de 500 euros/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={118}>
        <Ink d="M4 104H170" t0={0} dur={600} class="vc-soft" />
        <Fig n="lycee" x={4} y={12} size={92} t0={100} />
        <Picto n="personne" x={124} y={52} size={46} t0={700} />
        <Arrow x1={126} y1={86} x2={78} y2={92} dash t0={1100} />
        {af?.shown ? (
          <>
            <Picto n="billet" x={198} y={-4} size={74} t0={0} />
            <Txt x={235} y={78} text={af.text} max={14} size={14} t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Des violences commises en marge (le bouclier) ; l'expression et les revendications (une pancarte) : deux
 *  plateaux égaux */
const lycees08: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => <Fig n="bouclier" x={cx - 26} y={base - 54} size={52} t0={900} />,
    right: (cx, base) => <Picto n="pancarte" x={cx - 28} y={base - 58} size={56} t0={1400} />,
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 09 « Comment répondre aux blocages de lycées ? » */
const lycees09: Board = fin('lycee')

/* ——— Le registre ——— */

export const SECURITE_JUSTICE: Record<string, Board> = {
  'securite-intro-01': intro01,
  'securite-intro-02': intro02,
  'securite-intro-03': intro03,
  'securite-intro-04': intro04,
  'securite-intro-05': intro05,
  'securite-intro-06': intro06,
  'securite-intro-07': intro07,
  'securite-intro-08': intro08,
  'securite-police-01': police01,
  'securite-police-02': police02,
  'securite-police-03': police03,
  'securite-police-04': police04,
  'securite-police-05': police05,
  'securite-police-06': police06,
  'securite-police-07': police07,
  'securite-police-08': police08,
  'securite-police-09': police09,
  'securite-drogues-01': drogues01,
  'securite-drogues-02': drogues02,
  'securite-drogues-03': drogues03,
  'securite-drogues-04': drogues04,
  'securite-drogues-05': drogues05,
  'securite-drogues-06': drogues06,
  'securite-drogues-07': drogues07,
  'securite-drogues-08': drogues08,
  'securite-drogues-09': drogues09,
  'securite-justice-01': justice01,
  'securite-justice-02': justice02,
  'securite-justice-03': justice03,
  'securite-justice-04': justice04,
  'securite-justice-05': justice05,
  'securite-justice-06': justice06,
  'securite-justice-07': justice07,
  'securite-justice-08': justice08,
  'securite-justice-09': justice09,
  'securite-justice-10': justice10,
  'securite-lycees-01': lycees01,
  'securite-lycees-02': lycees02,
  'securite-lycees-03': lycees03,
  'securite-lycees-04': lycees04,
  'securite-lycees-05': lycees05,
  'securite-lycees-06': lycees06,
  'securite-lycees-07': lycees07,
  'securite-lycees-08': lycees08,
  'securite-lycees-09': lycees09,
}
