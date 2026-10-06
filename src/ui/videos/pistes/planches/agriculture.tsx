// Piste C, les planches de la série « Agriculture et alimentation » (src/ui/videos/series/agriculture.ts) : un
// dessin par passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx,
// dessin/mises.tsx). Les mots et les nombres viennent du script (mots mis en valeur, phrases dites, chiffre de la
// fiche) : si le texte change, le dessin suit ; s'il ne s'y retrouve plus (une planche rend null), le passage
// prend le dessin générique de sa sorte d'image.
// Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les dit pas (« exportations »,
// « importations », « surface », « aide ») : elles nomment ce qui est dessiné et sont reprises dans l'« alt ».
// Six pictogrammes propres au thème sont dessinés ici, au trait, dans un carré de 48 unités (grange, épi,
// panier, chariot, usine, assiette, cargo, sac) : ni personne, ni marque, ni symbole.

import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Fade, Ink, Txt, W, at, cls, cueOf, cuesOf, fractionOf, heard, num, plain, ratioOf, said, sentencesOf, word, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, HeadCues, Panel, Question, Seg, Signature, Src } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Cases, Plafond, barres, colonnes, frise, rangCells, type Barre } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Les pictogrammes du thème ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
const grain = (y: number, side: 1 | -1) =>
  `M24 ${y}C${24 + side * 5} ${y - 1} ${24 + side * 8} ${y - 5} ${24 + side * 8} ${y - 10}C${24 + side * 3} ${y - 9} 24 ${y - 5} 24 ${y}`

interface Def {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat d'un pictogramme compté */
  fill?: string
  thin?: number[]
}

const GRANGE = 'M5 44V21L24 7L43 21V44Z'
const USINE = 'M4 44V22L15 29V22L26 29V22L34 27V6H41V44Z'

const MES = {
  /** Une ferme : une grange, sa porte à croisillons, sa lucarne */
  grange: { s: [GRANGE, 'M17 44V30H31V44', 'M17 30L31 44M31 30L17 44', 'M20.5 15.5h7v6h-7z'], fill: GRANGE, thin: [2, 3] },
  /** Un épi : la tige, les grains de chaque côté, la pointe */
  epi: { s: ['M24 46V10', [17, 25, 33].map(y => grain(y, -1)).join(''), [17, 25, 33].map(y => grain(y, 1)).join(''), 'M24 10C21.5 7.5 21.5 4 24 1.5C26.5 4 26.5 7.5 24 10'] },
  /** Un panier de courses */
  panier: { s: ['M4 20H44L39 43H9Z', 'M13 20C13 7 35 7 35 20', 'M15 26l2 11M24 26v11M33 26l-2 11'], fill: 'M4 20H44L39 43H9Z', thin: [2] },
  /** Un chariot de magasin */
  chariot: { s: ['M2 8H9L14 31H38L43 14H11', `${circle(17, 39, 3.2)}${circle(35, 39, 3.2)}`, 'M12.6 22.5H40.4'], thin: [2] },
  /** Une usine (l'industrie agroalimentaire) */
  usine: { s: [USINE, 'M9 36h5v4h-5zM19 36h5v4h-5zM29 36h5v4h-5z'], fill: USINE, thin: [1] },
  /** Une assiette, sa fourchette et son couteau */
  assiette: { s: [circle(25, 26, 14), circle(25, 26, 8.5), 'M6 10V42M3 10V17A3 3 0 0 0 9 17V10', 'M44 10C40.5 14 40.5 21 44 24V42'], fill: circle(25, 26, 14), thin: [1] },
  /** Un cargo chargé de conteneurs, sur l'eau */
  cargo: { s: ['M3 30H45L39 41H9Z', 'M9 30V22H21V30M21 30V22H33V30', 'M15 22V14H27V22', 'M2 46c4-2.5 8 2.5 12 0s8-2.5 12 0s8 2.5 12 0s8-2.5 10 0'], thin: [3] },
  /** Un sac (ce que la ferme achète pour produire) */
  sac: { s: ['M11 17Q7 31 10 44H38Q41 31 37 17Z', 'M11 17L16 9H32L37 17', 'M17 9Q24 5 31 9'], fill: 'M11 17Q7 31 10 44H38Q41 31 37 17Z', thin: [2] },
} satisfies Record<string, Def>

type Nom = keyof typeof MES

/** Un pictogramme du thème ou de la bibliothèque, placé sur la feuille ; (x, y) : coin haut gauche */
function Ico({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1, step = 200, text }: { n: Nom | PictoName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number; step?: number; text?: string }) {
  if (!(n in MES)) return <Picto n={n as PictoName} x={x} y={y} size={size} t0={t0} kept={kept} tone={tone} w={w} step={step} text={text} />
  const d: Def = MES[n as Nom]
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

/** Un pictogramme seul, dans son SVG (listes en HTML : le sommaire) */
const IcoGlyphe = ({ n, t0 = 0 }: { n: Nom | PictoName; t0?: number }) => (
  <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
    <Ico n={n} x={0} y={0} t0={t0} step={150} />
  </svg>
)

/* ——— Communs à la série ——— */

/** Une petite assiette, deux cercles (pour une rangée de jours) ; (cx, cy) : son centre */
const Plat = ({ cx, cy, r, t0 = 0 }: { cx: number; cy: number; r: number; t0?: number }) => (
  <Fade t0={t0} class="vc-count">
    <path class="vc-tint-count" d={circle(cx, cy, r)} />
    <path d={`${circle(cx, cy, r)}${circle(cx, cy, r * 0.55)}`} />
  </Fade>
)

/** Un mot dit ailleurs dans la vidéo, sans son article (« l’agriculture française » → « agriculture française ») */
const bare = (s: string | null | undefined) => (s ? s.replace(/^(?:l[’']|les?\s|la\s|des\s|du\s|une?\s)/i, '') : null)

/** La hauteur réelle d'un jeu de barres (dernière barre), quand toutes n'ont pas d'étiquette */
const barsH = (g: ReturnType<typeof barres>) => Math.max(...g.geo.map(b => b.bottom))

/** Les exploitants agricoles et l'ensemble de la population sous le seuil de pauvreté, à la même échelle */
function pauvrete(p: P) {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const expl = said(p, /exploitants agricoles/)
  const pop = said(p, /l’ensemble de la population/)
  if (!a || !b || !va || !vb || !expl || !pop) return null
  const g = barres({
    items: [
      { label: expl, value: va, text: a.text, tone: 'count', shown: a.shown },
      { label: pop, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 26,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Exportations et importations presque égales : deux colonnes à la même échelle ; l'écart, trop fin pour se
 *  voir, est montré du doigt plutôt que grossi */
function commerce(p: P) {
  const gap = cuesOf(p).find(c => /millions/.test(c.text))
  const presque = word(p, /presque autant/)
  if (!gap) return null
  const base = 168
  const H = 120
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + 64}V${base}`
  const bands = (x: number, h: number) => range(Math.floor(h / 12)).map(k => `M${x} ${base - 12 * (k + 1)}h64`).join('')
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 28}>
        <Ink d={`M16 ${base}H284`} t0={0} dur={500} class="vc-soft" />
        <Ink d={col(62, H)} t0={200} dur={700} />
        <Ink d={bands(62, H)} t0={600} dur={500} class="vc-thin vc-soft" />
        <Ink d={col(174, H - 1)} t0={500} dur={700} />
        <Ink d={bands(174, H - 1)} t0={900} dur={500} class="vc-thin vc-soft" />
        <Txt x={94} y={base + 22} text="exportations" size={15} t0={700} />
        <Txt x={206} y={base + 22} text="importations" size={15} t0={1000} />
        {presque?.shown ? <Txt x={W / 2} y={base - H / 2 + 10} text="≈" size={30} big tone="soft" t0={200} /> : null}
        {gap.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M52 ${base - H}H248`} />
            </Fade>
            <Arrow x1={W / 2} y1={base - H - 22} x2={W / 2 - 18} y2={base - H - 4} tone="count" t0={200} />
            <Txt x={W / 2} y={base - H - 28} text={gap.text} size={16} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Une barre de 100 euros en pointillé, et sous elle les parts dites, à la même échelle (« sur 100 euros ») */
function cent(p: P, rows: Barre[]) {
  const total = said(p, /100[\s\u00a0]euros/)
  if (!total) return null
  const g = barres({
    items: [{ value: 100, text: total, ghostFrom: 0 }, ...rows],
    y: 4,
    size: 20,
    gap: 30,
    room: 104,
    labelSize: 14,
    t0: 100,
  })
  return { el: g.el, h: barsH(g) + 6 }
}

/** Les cinq aides directes de la PAC, à la même échelle : « n » premières, « kept » déjà au tableau */
const AIDES: RegExp[] = [/aide de base au revenu/, /écorégime/, /certaines productions/, /fermes plus petites/, /jeunes agriculteurs/]

function aides(p: P, n: number, kept: number) {
  // Les montants, dans l'ordre où la vidéo les dit (passages 03 et 04)
  const says = p.script.segments.filter(s => AIDES.some(re => re.test(plain(s.say))) && /\d/.test(s.say)).map(s => plain(s.say))
  const values = says.flatMap(s => [...s.matchAll(/(\d+,\d+)/g)].map(m => m[1]!))
  const labels = AIDES.map(re => said(p, re))
  if (values.length < AIDES.length || labels.some(l => !l)) return null
  const max = num(values[0])!
  const unit = said(p, /milliards d’euros/)
  const g = barres({
    items: range(n).map(i => ({
      label: labels[i]!,
      value: num(values[i])!,
      text: values[i]!,
      tone: i >= kept ? ('count' as const) : undefined,
      shown: i < kept || heard(p, values[i]!),
    })),
    max,
    y: 24,
    size: 16,
    gap: 28,
    room: 56,
    labelSize: 14,
    t0: 100,
    kept: false,
  })
  return (
    <Seg>
      <Art h={barsH(g) + 6}>
        {unit ? <Txt x={300} y={14} text={unit} size={14} anchor="end" tone="soft" kept /> : null}
        {g.el}
      </Art>
    </Seg>
  )
}

/** Le sommaire de la série, chaque vidéo avec le pictogramme de son sujet */
const ICONES: Record<string, Nom | PictoName> = {
  'agriculture-revenu': 'portemonnaie',
  'agriculture-prix': 'chariot',
  'agriculture-aides': 'terrain',
  'agriculture-importations': 'cargo',
  'agriculture-alimentation': 'assiette',
}

function Sommaire({ p, t0 = 200 }: { p: P; t0?: number }) {
  const series = VIDEO_SERIES.find(s => s.videos.some(v => v.id === p.script.id))
  const deep = series?.videos.filter(v => v.kind === 'deep') ?? []
  if (!deep.length) return null
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <IcoGlyphe n={ICONES[v.id] ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/* ——— Introduction ——— */

/** 01 « ici ou ailleurs » : une ferme et un cargo mènent au panier ; « comment en vivent-ils ? » au-dessus de la
 *  personne qui produit */
const intro01: Board = p => {
  const [ici, vivre] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={166}>
        <Ink d="M8 160H292" t0={0} dur={600} class="vc-soft" />
        <Ico n="grange" x={10} y={70} size={90} t0={150} />
        <Picto n="personne" x={104} y={114} size={42} t0={700} />
        <Arrow x1={152} y1={132} x2={204} y2={132} dash t0={1000} />
        <Ico n="panier" x={210} y={88} size={72} t0={1200} />
        {ici?.shown ? (
          <>
            <Ico n="cargo" x={226} y={4} size={48} t0={100} />
            <Arrow x1={250} y1={56} x2={250} y2={92} dash t0={500} />
          </>
        ) : null}
        {vivre?.shown ? <Ask x={114} y={60} h={44} t0={100} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Une ferme sur dix fait 200 hectares ou plus, et exploite un tiers des terres : dix granges, une comptée ; une
 *  bande de terres en trois parts égales, une comptée */
const intro02: Board = p => {
  const [one, third] = cuesOf(p)
  const r = ratioOf(one?.text)
  const frac = fractionOf(third?.text)
  if (!one || !r || r.n > 12 || !third || !frac) return null
  const cols = r.n > 6 ? Math.ceil(r.n / 2) : r.n
  const { cells, h } = rangCells({ n: r.n, cols, max: 40, gap: 14, y: 0 })
  // Les fermes comptées : les premières de la dernière rangée, juste au-dessus de la part comptée des terres
  const counted = range(r.k).map(k => cols * (Math.ceil(r.n / cols) - 1) + k)
  const parts = Math.round(1 / frac)
  const x0 = 8
  const x1 = 292
  const pw = (x1 - x0) / parts
  const top = h + 22
  const bot = top + 46
  let furrows = ''
  for (let x = x0 + 8; x < x1; x += 10) furrows += `M${x} ${bot - 4}L${x + 7} ${top + 4}`
  const first = cells[counted[0]!] ?? cells[0]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={bot + 6}>
        {cells.map((c, i) => (
          <Ico key={i} n="grange" x={c.x} y={c.y} size={c.size} t0={200 + i * 60} step={60} tone={one.shown && counted.includes(i) ? 'count' : undefined} w={0.9} />
        ))}
        <Ink d={`M${x0} ${top}H${x1}V${bot}H${x0}Z`} t0={600} dur={700} />
        <Ink d={furrows} t0={900} dur={600} class="vc-thin vc-soft" />
        <Ink d={range(parts - 1).map(k => `M${x0 + pw * (k + 1)} ${top}V${bot}`).join('')} t0={1200} dur={300} class="vc-soft" />
        {third.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={top} width={pw} height={bot - top} />
              <path d={`M${x0} ${top}H${x0 + pw}V${bot}H${x0}Z`} />
            </Fade>
            <Ink d={`M${first.x + first.size / 2} ${first.y + first.size + 2}L${x0 + pw / 2} ${top - 2}`} t0={300} dur={300} class="vc-count vc-thin" />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 La pauvreté : exploitants agricoles et ensemble de la population, à la même échelle */
const intro03: Board = p => pauvrete(p)

/** 04 Exportations et importations presque égales ; l'écart en sa faveur montré du doigt */
const intro04: Board = p => commerce(p)

/** 05 « tous les deux jours » : une rangée de jours, une assiette un jour sur deux */
const intro05: Board = p => {
  const cue = cuesOf(p).find(c => /deux jours/.test(c.text))
  if (!cue) return null
  const size = 30
  const gap = 5
  const n = 8
  const x0 = (W - n * size - (n - 1) * gap) / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={size + 6}>
        <Cases n={n} cols={n} x={x0} y={2} size={size} gap={gap} t0={300} />
        {cue.shown
          ? range(n / 2).map(k => <Plat key={k} cx={x0 + 2 * k * (size + gap) + size / 2} cy={2 + size / 2} r={size / 2 - 5} t0={200 + k * 200} />)
          : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 La PAC, en grande partie selon la surface : un champ en parcelles égales, une pièce sur chacune */
const intro06: Board = p => {
  const surf = cuesOf(p).find(c => /surface/.test(c.text))
  if (!surf) return null
  const cols = 8
  const rows = 3
  const s = 30
  const g = 4
  const x0 = (W - cols * s - (cols - 1) * g) / 2
  const cells = range(cols * rows).map(i => ({ x: x0 + (i % cols) * (s + g), y: 2 + Math.floor(i / cols) * (s + g) }))
  const h = rows * s + (rows - 1) * g
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 30}>
        <Ink d={cells.map(c => `M${c.x} ${c.y}h${s}v${s}h${-s}z`).join('')} t0={300} dur={900} class="vc-thin" />
        {surf.shown
          ? cells.map((c, i) => <Picto key={i} n="piece" x={c.x + 6} y={c.y + 6} size={s - 12} t0={100 + i * 40} step={40} tone="count" w={0.7} />)
          : null}
        {surf.shown ? <Txt x={W / 2} y={h + 24} text={surf.text} size={15} t0={900} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les deux questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  const pictos: PictoName[] = ['portemonnaie', 'collines']
  return (
    <Seg kind="ask">
      <Panel
        cols={1}
        items={qs.map((q, i) => ({
          picto: pictos[i] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 08 Les sujets vus de plus près dans les vidéos suivantes : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Revenu ——— */

/** 01 Des prix qui montent ou baissent, des récoltes plus ou moins bonnes : une ligne en dents de scie au fil
 *  des années */
const revenu01: Board = p => {
  const prix = word(p, /Des prix/)
  const rec = word(p, /des récoltes/)
  const an = word(p, /d’une année à l’autre/)
  const pts = [
    [20, 168],
    [58, 140],
    [96, 176],
    [134, 128],
    [172, 162],
    [210, 124],
    [248, 170],
    [282, 146],
  ]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={200}>
        {prix?.shown ? (
          <>
            <Picto n="etiquette" x={18} y={4} size={64} t0={0} />
            <Picto n="hausse" x={86} y={8} size={24} tone="count" t0={400} w={1.2} />
            <Picto n="baisse" x={86} y={40} size={24} tone="count" t0={600} w={1.2} />
            <Txt x={50} y={88} text={prix.text.toLowerCase()} size={15} t0={300} />
          </>
        ) : null}
        {rec?.shown ? (
          <>
            <Ico n="epi" x={170} y={4} size={64} t0={0} />
            <Ico n="epi" x={226} y={22} size={46} t0={300} tone="ghost" />
            <Txt x={224} y={88} text={rec.text} size={15} t0={300} />
          </>
        ) : null}
        <Ink d="M10 190H290" t0={200} dur={600} class="vc-soft" />
        <Ink d={range(8).map(k => `M${20 + k * 37.4} 186v8`).join('')} t0={500} dur={400} class="vc-soft vc-thin" />
        {an?.shown ? <Ink d={`M${pts.map(([x, y]) => `${x} ${y}`).join('L')}`} t0={0} dur={1400} class="vc-count" /> : null}
      </Art>
    </Seg>
  )
}

/** 02 La valeur ajoutée par emploi : ce que produit l'agriculture, moins ce qu'elle achète pour produire, plus les
 *  aides qu'elle reçoit, divisé par le nombre d'emplois — une opération posée à la main */
const revenu02: Board = p => {
  const prod = word(p, /ce que produit l’agriculture/)
  const achat = word(p, /ce qu’elle achète pour produire/)
  const aides = word(p, /les aides qu’elle reçoit/)
  const emplois = word(p, /le nombre d’emplois/)
  if (!prod || !achat || !aides || !emplois) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={204}>
        {prod.shown ? (
          <>
            <Ico n="grange" x={28} y={0} size={44} t0={0} />
            <Txt x={100} y={20} text={prod.text} max={24} size={15} anchor="start" t0={300} />
          </>
        ) : null}
        {achat.shown ? (
          <>
            <Txt x={10} y={83} text="−" size={26} big anchor="start" t0={0} />
            <Ico n="sac" x={30} y={52} size={42} t0={100} />
            <Txt x={100} y={72} text={achat.text} max={24} size={15} anchor="start" t0={300} />
          </>
        ) : null}
        {aides.shown ? (
          <>
            <Txt x={10} y={135} text="+" size={26} big anchor="start" t0={0} />
            <Picto n="pieces" x={30} y={106} size={42} t0={100} />
            <Txt x={100} y={131} text={aides.text} max={24} size={15} anchor="start" t0={300} />
          </>
        ) : null}
        {emplois.shown ? (
          <>
            <Ink d="M10 160H290" t0={0} dur={500} class="vc-bold" />
            {[0, 1, 2].map(k => (
              <Picto key={k} n="personne" x={14 + k * 24} y={170} size={28} t0={300 + k * 120} w={0.8} />
            ))}
            <Txt x={100} y={192} text={emplois.text} max={24} size={15} anchor="start" t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 La valeur ajoutée par emploi, hors inflation : −12 % en 2024, +10,4 % en 2025, à la même échelle depuis la
 *  ligne de zéro */
const revenu03: Board = p => {
  const [down, up] = cuesOf(p)
  const vd = num(down?.text)
  const vu = num(up?.text)
  const [y1, y2] = yearsOf(p.segment.say)
  if (!down || !up || !vd || !vu || !y1 || !y2) return null
  const k = 4.5
  const zero = 78
  const hd = vd * k
  const hu = vu * k
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={zero + hd + 34}>
        <Ink d={`M20 ${zero}H280`} t0={0} dur={500} class="vc-soft" />
        {down.shown ? (
          <>
            <Fade t0={500}>
              <rect class="vc-tint" x={70} y={zero} width={60} height={hd} />
            </Fade>
            <Ink d={`M70 ${zero}V${zero + hd}H130V${zero}`} t0={200} dur={700} />
            <Txt x={100} y={zero - 10} text={String(y1)} size={15} tone="soft" t0={300} />
            <Txt x={100} y={zero + hd + 26} text={`−${down.text}`} size={20} big t0={700} />
          </>
        ) : null}
        {up.shown ? (
          <>
            <Fade t0={500}>
              <rect class="vc-tint" x={170} y={zero - hu} width={60} height={hu} />
            </Fade>
            <Ink d={`M170 ${zero}V${zero - hu}H230V${zero}`} t0={200} dur={700} />
            <Txt x={200} y={zero + 22} text={String(y2)} size={15} tone="soft" t0={300} />
            <Txt x={200} y={zero - hu - 10} text={`+${up.text}`} size={20} big t0={700} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 La pauvreté : exploitants agricoles et ensemble de la population, à la même échelle */
const revenu04: Board = p => pauvrete(p)

/** 05 Le même niveau de vie moyen, plus dispersé : cultures et élevage à la même échelle, la moyenne en pointillé */
const revenu05: Board = p => {
  const [moy, cult, elev] = cuesOf(p)
  const vm = num(moy?.text)
  const vc = num(cult?.text)
  const ve = num(elev?.text)
  const nv = word(p, /niveau de vie moyen/)
  const lc = word(p, /les cultures/)
  const le = word(p, /l’élevage/)
  if (!moy || !cult || !elev || !vm || !vc || !ve || !lc || !le) return null
  const g = barres({
    items: [
      { label: lc.text, value: vc, shown: cult.shown },
      { label: le.text, value: ve, shown: elev.shown },
    ],
    y: 58,
    size: 26,
    gap: 28,
    room: 128,
    t0: 100,
  })
  const xm = vm * g.scale
  const bottom = barsH(g)
  const vals = [cult, elev]
  return (
    <Seg>
      <Art h={bottom + 8}>
        <Ink d={`M0 52V${bottom + 4}`} t0={0} dur={400} class="vc-soft" />
        {moy.shown ? (
          <>
            <Fade t0={200} class="vc-dash">
              <path d={`M${xm} 40V${bottom + 4}`} />
            </Fade>
            {nv ? <Txt x={xm} y={14} text={nv.text} size={14} tone="soft" t0={300} /> : null}
            <Txt x={xm} y={34} text={moy.text} size={17} big t0={400} />
          </>
        ) : null}
        {g.el}
        {g.geo.map((b, i) =>
          vals[i]!.shown ? (
            <Txt key={i} x={Math.max(b.x1, xm) + 8} y={b.bottom - 5} text={vals[i]!.text} size={20} big anchor="start" t0={600 + i * 350} />
          ) : null,
        )}
      </Art>
    </Seg>
  )
}

/** 06 « comment améliorer le revenu des agriculteurs ? » : la ferme et le porte-monnaie, en question */
const revenu06: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ico n="grange" x={20} y={6} size={92} t0={100} />
      <Picto n="portemonnaie" x={128} y={34} size={64} t0={700} />
      <Ask x={224} y={18} h={72} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Partage des prix ——— */

/** 01 100 euros pour se nourrir, au magasin ou au restaurant : combien en revient à la ferme ? */
const prix01: Board = p => {
  const [eur, combien] = cuesOf(p)
  const v = num(eur?.text)
  if (!eur || !v) return null
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Ico n="chariot" x={6} y={0} size={54} t0={100} />
        <Ico n="assiette" x={6} y={64} size={54} t0={300} />
        <Arrow x1={64} y1={30} x2={98} y2={52} dash t0={700} />
        <Arrow x1={64} y1={92} x2={98} y2={74} dash t0={800} />
        <Picto n="billet" x={102} y={18} size={88} t0={500} text={String(v)} />
        {combien?.shown ? (
          <>
            <Arrow x1={194} y1={64} x2={226} y2={64} dash t0={0} />
            <Ico n="grange" x={230} y={34} size={62} t0={200} />
            <Ask x={250} y={0} h={34} t0={700} tone="count" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 6,4 euros pour l'agriculture : sous une barre de 100 euros en pointillé, la sienne, à la même échelle */
const prix02: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const agri = bare(said(p, /l’agriculture française/))
  if (!cue || !v || !agri) return null
  const c = cent(p, [{ label: agri, value: v, text: cue.text, tone: 'count', shown: cue.shown }])
  if (!c) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={c.h}>{c.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les parts de l'agriculture, de l'industrie et du commerce, sous la barre de 100 euros */
function parts(p: P) {
  const agriText = said(p, /6,4[\s\u00a0]euros/)
  const agri = bare(said(p, /l’agriculture française/))
  const iaa = said(p, /industries agroalimentaires/)
  const com = said(p, /commerce/)
  const iaaText = said(p, /9,4[\s\u00a0]euros/)
  const comText = said(p, /18,8[\s\u00a0]euros/)
  return { agriText, agri, iaa, com, iaaText, comText }
}

/** 03 Les industries agroalimentaires, 9,4 euros ; le commerce, 18,8 euros */
const prix03: Board = p => {
  const [a, b] = cuesOf(p)
  const t = parts(p)
  if (!a || !b || !t.agri || !t.agriText || !t.iaa || !t.com) return null
  const c = cent(p, [
    { label: t.agri, value: num(t.agriText)!, text: t.agriText },
    { label: t.iaa, value: num(a.text)!, text: a.text, tone: 'count', shown: a.shown },
    { label: t.com, value: num(b.text)!, text: b.text, tone: 'count', shown: b.shown },
  ])
  if (!c) return null
  return (
    <Seg>
      <Art h={c.h}>{c.el}</Art>
    </Seg>
  )
}

/** 04 Intrants compris, 13,2 euros : la barre de l'agriculture s'allonge ; et 2021, l'année des confinements */
const prix04: Board = p => {
  const [ext, conf] = cuesOf(p)
  const t = parts(p)
  const ve = num(ext?.text)
  const year = yearsOf(p.segment.say)[0]
  const com = word(p, /le commerce alimentaire/)
  if (!ext || !ve || !t.agri || !t.agriText) return null
  const c = cent(p, [{ label: t.agri, value: num(t.agriText)!, ext: ext.shown ? ve : undefined, text: ext.shown ? ext.text : t.agriText }])
  if (!c) return null
  const y = c.h + 14
  return (
    <Seg>
      <Art h={y + 74}>
        {c.el}
        {conf?.shown ? (
          <>
            <Ink d={`M10 ${y}H290`} t0={0} dur={400} class="vc-soft vc-thin" />
            {year ? <Txt x={14} y={y + 40} text={String(year)} size={20} big anchor="start" t0={100} /> : null}
            <Picto n="maison" x={84} y={y + 10} size={50} t0={200} />
            <Arrow x1={140} y1={y + 36} x2={168} y2={y + 36} t0={600} />
            <Ico n="chariot" x={174} y={y + 10} size={50} t0={800} />
            <Picto n="hausse" x={228} y={y + 14} size={26} tone="count" t0={1200} w={1.2} />
            {com ? <Txt x={W / 2} y={y + 72} text={com.text} size={14} tone="soft" t0={1000} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 La marge brute des rayons frais : 29,4 euros sur 100 euros de ventes, à la même échelle */
const prix05: Board = p => {
  const [brute, nom] = cuesOf(p)
  const ventes = word(p, /100[\s\u00a0]euros de ventes/)
  const v = num(brute?.text)
  if (!brute || !nom || !ventes || !v) return null
  const total = word(p, /100[\s\u00a0]euros/)
  const g = barres({
    items: [
      { label: word(p, /ventes/)?.text, value: 100, text: total?.text },
      { label: nom.text, value: v, text: brute.text, tone: 'count', shown: brute.shown },
    ],
    y: 52,
    size: 24,
    gap: 32,
    room: 104,
    t0: 200,
  })
  return (
    <Seg>
      <Art h={barsH(g) + 6}>
        <Ico n="chariot" x={2} y={0} size={42} t0={0} />
        <Txt x={52} y={30} text={said(p, /les grandes surfaces/) ?? ''} size={15} anchor="start" tone="soft" t0={200} />
        {g.el}
      </Art>
    </Seg>
  )
}

/** 06 La marge nette : 1,1 euro, à la même échelle que les ventes et la marge brute */
const prix06: Board = p => {
  const [nette, nom] = cuesOf(p)
  const v = num(nette?.text)
  const brute = said(p, /29,4[\s\u00a0]euros/)
  const total = said(p, /100[\s\u00a0]euros/)
  const lb = said(p, /la marge brute/)
  if (!nette || !nom || !v || !brute || !total || !lb) return null
  const g = barres({
    items: [
      { label: said(p, /ventes/) ?? undefined, value: 100, text: total },
      { label: lb, value: num(brute)!, text: brute },
      { label: nom.text, value: v, text: nette.text, tone: 'count', shown: nette.shown },
    ],
    y: 2,
    size: 18,
    gap: 28,
    room: 104,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={barsH(g) + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les lois EGalim : les coûts de production entrent dans le contrat ; sous le prix, un plancher qui n'est
 *  pas garanti (pointillé) */
const prix07: Board = p => {
  const [couts, min] = cuesOf(p)
  const loi = word(p, /lois EGalim/)
  if (!couts || !min) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={184}>
        <Picto n="document" x={4} y={0} size={70} t0={100} />
        {loi ? <Txt x={39} y={86} text={loi.text} size={14} tone="soft" t0={500} /> : null}
        <Arrow x1={74} y1={38} x2={110} y2={38} t0={700} />
        <Picto n="document" x={112} y={0} size={70} t0={900} />
        {couts.shown ? (
          <>
            <Picto n="pieces" x={168} y={30} size={40} tone="count" t0={0} />
            <Txt x={214} y={44} text={couts.text} max={12} size={14} anchor="start" t0={300} />
          </>
        ) : null}
        {min.shown ? (
          <>
            <Picto n="etiquette" x={96} y={96} size={64} t0={0} />
            <Fade t0={500} class="vc-ghost">
              <path d="M30 160H250" />
            </Fade>
            <Txt x={W / 2} y={180} text={min.text} size={15} tone="soft" t0={700} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 EGalim 2 : un contrat écrit entre la ferme et l'acheteur, et une révision automatique du prix */
const prix08: Board = p => {
  const [contrat, revision] = cuesOf(p)
  if (!contrat || !revision) return null
  return (
    <Seg>
      <Art h={196}>
        <Ico n="grange" x={4} y={14} size={64} t0={100} />
        <Ico n="usine" x={232} y={14} size={64} t0={300} />
        {contrat.shown ? (
          <>
            <Arrow x1={72} y1={50} x2={108} y2={50} t0={0} />
            <Picto n="document" x={114} y={6} size={72} tone="count" t0={200} />
            <Arrow x1={190} y1={50} x2={226} y2={50} t0={600} />
            <Txt x={150} y={102} text={contrat.text} size={15} t0={500} />
          </>
        ) : null}
        {revision.shown ? (
          <>
            <Picto n="etiquette" x={88} y={114} size={56} t0={0} />
            <Picto n="alternance" x={150} y={114} size={56} tone="count" t0={300} />
            <Txt x={150} y={190} text={revision.text} size={15} t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Le tunnel de prix : une borne basse, une borne haute, et le prix qui évolue entre elles */
const prix09: Board = p => {
  const haute = word(p, /une borne haute/)
  const basse = word(p, /une borne basse/)
  const prixEvolue = word(p, /le prix évolue/)
  const bov = word(p, /la viande bovine/)
  if (!haute || !basse) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={158}>
        {bov ? <Txt x={290} y={14} text={bov.text} size={14} anchor="end" tone="soft" t0={100} /> : null}
        <Ink d="M14 150H286" t0={0} dur={500} class="vc-soft" />
        {haute.shown || basse.shown ? (
          <Fade t0={0}>
            <rect class="vc-tint" x={14} y={40} width={272} height={74} />
          </Fade>
        ) : null}
        {basse.shown ? (
          <>
            <Fade t0={0} class="vc-dash">
              <path d="M14 114H286" />
            </Fade>
            <Txt x={18} y={136} text={basse.text} size={14} anchor="start" t0={200} />
          </>
        ) : null}
        {haute.shown ? (
          <>
            <Fade t0={0} class="vc-dash">
              <path d="M14 40H286" />
            </Fade>
            <Txt x={18} y={32} text={haute.text} size={14} anchor="start" t0={200} />
          </>
        ) : null}
        {prixEvolue?.shown ? (
          <Ink d="M14 84C44 64 66 58 92 68S138 104 164 96S210 52 238 60S272 92 286 82" t0={0} dur={1400} class="vc-count vc-bold" />
        ) : null}
      </Art>
    </Seg>
  )
}

/** 10 Entre industriels et distributeurs, la part agricole du prix n'est pas négociable : l'épi sous cadenas */
const prix10: Board = p => {
  const ind = word(p, /industriels/)
  const dist = word(p, /distributeurs/)
  const cue = cueOf(p, 0)
  if (!ind || !dist || !cue) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={142}>
        <Ico n="usine" x={4} y={34} size={64} t0={100} />
        <Txt x={4} y={128} text={ind.text} size={15} anchor="start" t0={400} />
        <Ico n="chariot" x={232} y={34} size={64} t0={300} />
        <Txt x={296} y={128} text={dist.text} size={15} anchor="end" t0={600} />
        <Arrow x1={74} y1={74} x2={100} y2={74} t0={700} />
        <Arrow x1={226} y1={74} x2={200} y2={74} t0={800} />
        <Picto n="etiquette" x={100} y={26} size={100} t0={900} />
        <Ink d="M146 51V99" t0={1500} dur={300} class="vc-thin" />
        <Ico n="epi" x={110} y={56} size={36} tone="count" t0={1600} />
        {cue.shown ? <Picto n="cadenas" x={110} y={0} size={34} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 11 « de la ferme au magasin, quelle part pour chacun ? » : la ferme, l'usine, le magasin, en file */
const prix11: Board = p => (
  <Seg kind="ask">
    <Art h={92}>
      <Ico n="grange" x={0} y={14} size={60} t0={100} />
      <Arrow x1={62} y1={50} x2={82} y2={50} t0={500} />
      <Ico n="usine" x={84} y={14} size={60} t0={600} />
      <Arrow x1={146} y1={50} x2={166} y2={50} t0={1000} />
      <Ico n="chariot" x={168} y={14} size={60} t0={1100} />
      <Ask x={250} y={10} h={66} t0={1600} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Aides européennes ——— */

/** 01 La PAC, et ses aides réparties entre des fermes de tailles différentes */
const aides01: Board = p => {
  const pac = word(p, /PAC/)
  const rep = cuesOf(p)[1]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={152}>
        <Picto n="document" x={116} y={0} size={68} t0={100} tone={pac?.shown ? 'count' : undefined} />
        <Ink d="M10 150H290" t0={300} dur={600} class="vc-soft" />
        <Ico n="grange" x={22} y={114} size={36} t0={500} />
        <Ico n="grange" x={124} y={100} size={52} t0={700} />
        <Ico n="grange" x={214} y={80} size={74} t0={900} />
        {rep?.shown ? (
          <>
            <Arrow x1={130} y1={70} x2={50} y2={108} dash t0={0} />
            <Arrow x1={150} y1={72} x2={150} y2={96} dash t0={150} />
            <Arrow x1={170} y1={70} x2={240} y2={84} dash t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 45,5 milliards d'aides pour la France, dont 34,2 de paiements directs : le disque et sa part */
const aides02: Board = p => {
  const [tot, dir] = cuesOf(p)
  const vt = num(tot?.text)
  const vd = num(dir?.text)
  const aidesW = word(p, /d’aides/)
  const pd = word(p, /paiements directs/)
  if (!tot || !dir || !vt || !vd || vd >= vt) return null
  const part = vd / vt
  const cx = 82
  const cy = 82
  const r = 76
  const a = part * Math.PI
  const tip = { x: cx + 56 * Math.sin(a), y: cy - 56 * Math.cos(a) }
  const slice = `M${cx} ${cy}V${cy - r}A${r} ${r} 0 ${part > 0.5 ? 1 : 0} 1 ${(cx + r * Math.sin(2 * a)).toFixed(1)} ${(cy - r * Math.cos(2 * a)).toFixed(1)}Z`
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={164}>
        <Ink d={`M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`} t0={200} dur={900} />
        {tot.shown ? (
          <>
            <Txt x={172} y={30} text={tot.text} size={16} anchor="start" tone="soft" t0={300} />
            {aidesW ? <Txt x={172} y={48} text={aidesW.text} size={15} anchor="start" tone="soft" t0={400} /> : null}
          </>
        ) : null}
        {dir.shown ? (
          <>
            <Fade t0={100} class="vc-count">
              <path class="vc-tint-count" d={slice} />
              <path d={slice} />
            </Fade>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L168 112`} t0={500} dur={300} class="vc-count vc-thin" />
            <Txt x={172} y={116} text={dir.text} size={16} anchor="start" tone="count" t0={600} />
            {pd ? <Txt x={172} y={134} text={pd.text} size={15} anchor="start" tone="count" t0={700} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 L'aide de base au revenu et l'écorégime, à la même échelle */
const aides03: Board = p => aides(p, 2, 0)

/** 04 Les cinq aides directes, à la même échelle : les trois dernières s'ajoutent sous les deux premières */
const aides04: Board = p => aides(p, 5, 2)

/** 05 La PAC de 2023 à 2027, la suivante de 2028 à 2034 en pointillé (en négociation), la proposition de 2025 */
const aides05: Board = p => {
  const [nego, md] = cuesOf(p)
  const now = said(p, /De 2023 à 2027/)
  const next = word(p, /de 2028 à 2034/)
  const prop = word(p, /juillet 2025/)
  const ys = [...(now ?? '').matchAll(/\d{4}/g), ...(next?.text ?? '').matchAll(/\d{4}/g)].map(m => Number(m[0]))
  if (!nego || !md || !next || ys.length < 4) return null
  const [a0, a1, b0, b1] = ys as [number, number, number, number]
  const f = frise({ y: 104, from: a0 - 1, to: b1 + 1, x0: 10, x1: 290, ticks: range(b1 - a0 + 3).map(k => a0 - 1 + k), labels: [a0, b0, b1], t0: 100 })
  const xa = f.X(a0)
  const xa1 = f.X(a1 + 1) - 3
  const xb = f.X(b0)
  const xb1 = f.X(b1 + 1) - 3
  const py = prop ? yearsOf(prop.text)[0] : undefined
  return (
    <Seg>
      <Art h={160}>
        {f.el}
        <Fade t0={400}>
          <rect class="vc-tint" x={xa} y={40} width={xa1 - xa} height={24} />
        </Fade>
        <Ink d={`M${xa} 40H${xa1}V64H${xa}Z`} t0={300} dur={700} />
        {now ? <Txt x={(xa + xa1) / 2} y={30} text={now} size={14} t0={600} /> : null}
        {next.shown ? (
          <>
            <Fade t0={0} class="vc-ghost">
              <path d={`M${xb} 40H${xb1}V64H${xb}Z`} />
            </Fade>
            <Txt x={(xb + xb1) / 2} y={30} text={next.text} size={14} t0={200} />
          </>
        ) : null}
        {nego.shown ? <Txt x={(xb + xb1) / 2} y={84} text={nego.text} size={14} tone="soft" t0={300} /> : null}
        {md.shown ? <Txt x={(xb + xb1) / 2} y={57} text={md.text} size={14} tone="count" t0={200} /> : null}
        {prop?.shown && py ? (
          <>
            <Picto n="drapeau" x={f.X(py) - 10} y={70} size={36} tone="count" t0={0} />
            <Txt x={f.X(py)} y={152} text={prop.text} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Une aide dégressive et plafonnée pour les grandes exploitations, une priorité aux petites fermes : un
 *  schéma sans chiffres, l'aide selon la surface */
const aides06: Board = p => {
  const [deg, petites] = cuesOf(p)
  if (!deg || !petites) return null
  const ox = 34
  const oy = 150
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={206}>
        <Ink d={`M${ox} 8V${oy}H290`} t0={0} dur={700} class="vc-soft" />
        <Txt x={ox + 6} y={20} text="aide" size={14} anchor="start" tone="soft" t0={300} />
        <Ico n="grange" x={ox + 8} y={oy + 14} size={24} t0={300} tone={petites.shown ? 'count' : undefined} />
        <Ico n="grange" x={ox + 98} y={oy + 8} size={34} t0={450} />
        <Ico n="grange" x={ox + 196} y={oy + 2} size={44} t0={600} />
        <Txt x={290} y={oy + 2 - 8} text="surface" size={14} anchor="end" tone="soft" t0={600} />
        <Ink d={`M${ox} ${oy}C${ox + 60} 90 ${ox + 120} 66 ${ox + 176} 58H282`} t0={600} dur={1300} class="vc-count" />
        {deg.shown ? <Plafond x0={ox + 168} x1={290} y={55} t0={300} /> : null}
        {petites.shown ? <Picto n="personne" x={ox + 36} y={oy + 12} size={24} tone="count" t0={200} w={0.8} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 « à qui verser ces aides, et selon quels critères ? » : des pièces devant trois fermes */
const aides07: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Picto n="pieces" x={4} y={34} size={60} t0={100} />
      <Ico n="grange" x={80} y={60} size={40} t0={500} />
      <Ico n="grange" x={124} y={42} size={60} t0={700} />
      <Ico n="grange" x={186} y={22} size={82} t0={900} />
      <Ask x={262} y={4} h={56} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Importations ——— */

/** 01 Des produits venus d'autres pays dans l'assiette : mêmes règles ? */
const imp01: Board = p => {
  const [ailleurs, regles] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={128}>
        <Ico n="assiette" x={152} y={14} size={96} t0={100} />
        {ailleurs?.shown ? (
          <>
            <Ico n="cargo" x={0} y={30} size={92} t0={0} />
            <Arrow x1={100} y1={74} x2={144} y2={74} dash t0={600} />
          </>
        ) : null}
        {regles?.shown ? <Ask x={262} y={10} h={56} t0={100} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 02 200 millions d'euros d'excédent : exportations et importations presque égales */
const imp02: Board = p => commerce(p)

/** 03 Les normes sanitaires de l'Union : le cargo passe sous la loupe avant l'assiette ; deux exemples */
const imp03: Board = p => {
  const pest = word(p, /limites de résidus de pesticides/)
  const horm = word(p, /l’interdiction des viandes aux hormones/)
  if (!pest || !horm) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Ico n="cargo" x={4} y={10} size={70} t0={100} />
        <Arrow x1={82} y1={50} x2={110} y2={50} dash t0={500} />
        <Picto n="loupe" x={114} y={8} size={66} tone="count" t0={700} />
        <Arrow x1={190} y1={50} x2={218} y2={50} dash t0={1100} />
        <Ico n="assiette" x={224} y={12} size={64} t0={1300} />
        {pest.shown ? (
          <>
            <Ink d="M12 112h.5" t0={0} dur={100} class="vc-count vc-dot" />
            <Txt x={24} y={117} text={pest.text} size={15} anchor="start" t0={100} />
          </>
        ) : null}
        {horm.shown ? (
          <>
            <Ink d="M12 140h.5" t0={0} dur={100} class="vc-count vc-dot" />
            <Txt x={24} y={145} text={horm.text} size={15} anchor="start" t0={100} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Mêmes normes sanitaires, normes de production qui peuvent différer ; une jauge des résidus sous la limite */
const imp04: Board = p => {
  const [prod, limite] = cuesOf(p)
  const san = said(p, /normes sanitaires/)
  const res = word(p, /les résidus/)
  if (!prod || !limite || !san) return null
  return (
    <Seg>
      <Art h={190}>
        <Ink d="M150 4V96" t0={0} dur={400} class="vc-soft vc-thin" />
        <Txt x={75} y={16} text={san} size={15} tone="soft" t0={100} />
        <Picto n="document" x={26} y={30} size={46} t0={200} />
        <Txt x={75} y={64} text="=" size={22} big t0={500} />
        <Picto n="document" x={78} y={30} size={46} t0={400} />
        {prod.shown ? (
          <>
            <Txt x={225} y={16} text={prod.text} size={15} tone="count" t0={0} />
            <Picto n="document" x={176} y={30} size={46} t0={100} />
            <Txt x={225} y={64} text="≠" size={22} big tone="count" t0={400} />
            <Picto n="document" x={228} y={30} size={46} tone="count" t0={300} />
          </>
        ) : null}
        {limite.shown ? (
          <>
            {res ? <Txt x={30} y={124} text={res.text} size={14} anchor="start" tone="soft" t0={0} /> : null}
            <Ink d="M30 132H270V152H30Z" t0={0} dur={600} />
            <Fade t0={400} class="vc-count">
              <rect class="vc-tint-count" x={30} y={132} width={150} height={20} />
            </Fade>
            <Ink d="M216 124V160" t0={500} dur={300} class="vc-bold" />
            <Txt x={W / 2} y={182} text={limite.text} size={15} tone="count" t0={700} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 L'accord entre l'Union et le Mercosur, à titre provisoire (pointillé), depuis le 1er mai 2026 */
const imp05: Board = p => {
  const ue = word(p, /l’Union/)
  const mer = word(p, /le Mercosur/)
  const date = word(p, /1er[\s\u00a0]mai[\s\u00a0]\d{4}/)
  const prov = cueOf(p, 0)
  if (!ue || !mer || !date || !prov) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Picto n="drapeau" x={26} y={4} size={58} t0={100} />
        <Txt x={52} y={82} text={ue.text} size={15} t0={300} />
        {mer.shown ? (
          <>
            <Picto n="drapeau" x={212} y={4} size={58} t0={0} />
            <Txt x={240} y={82} text={mer.text} size={15} t0={200} />
            <Arrow x1={150} y1={22} x2={96} y2={22} t0={400} />
            <Arrow x1={150} y1={22} x2={204} y2={22} t0={400} />
          </>
        ) : null}
        <Picto n="document" x={122} y={34} size={56} t0={600} tone={prov.shown ? 'ghost' : undefined} />
        {date.shown ? (
          <>
            <Picto n="calendrier" x={68} y={100} size={40} t0={0} />
            <Txt x={116} y={128} text={date.text} size={18} big anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 L'origine sur l'étiquette : obligatoire pour certains produits, cochés quand la voix les dit ; pour les
 *  autres, une étiquette en pointillé */
const imp06: Board = p => {
  const [orig, tromper] = cuesOf(p)
  const first = sentencesOf(p.segment.say)[0] ?? ''
  const i = first.search(/[\u00a0 ]:/)
  const list = i < 0 ? [] : first.slice(i + 2).replace(/[.!?…]+$/, '').trim().split(/,\s+/)
  const mot = word(p, /origine/)
  if (!orig || !tromper || list.length < 3 || !mot) return null
  const row = Math.min(24, 120 / list.length)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={190}>
        <Picto n="etiquette" x={0} y={-6} size={116} t0={100} text={mot.text} />
        {list.map((l, k) => {
          const shown = heard(p, l.split(/[\s\u00a0]/).slice(0, 2).join(' '))
          return shown ? (
            <g key={l}>
              <Ink d={`M128 ${16 + k * row}l4 4l8-9`} t0={0} dur={300} class="vc-count" />
              <Txt x={146} y={20 + k * row} text={l} size={15} anchor="start" t0={100} />
            </g>
          ) : null
        })}
        {tromper.shown ? (
          <>
            <Picto n="etiquette" x={0} y={124} size={64} tone="ghost" text="?" />
            <Txt x={78} y={162} text={tromper.text} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 « quelles règles pour les produits importés, et quelle information sur l'étiquette ? » */
const imp07: Board = p => {
  return (
    <Seg kind="ask">
      <Art h={100}>
        <Ico n="cargo" x={4} y={14} size={80} t0={100} />
        <Picto n="etiquette" x={104} y={10} size={84} t0={600} />
        <Ask x={232} y={14} h={68} t0={1200} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Accès à l'alimentation ——— */

/** 01 Un repas avec viande, poisson ou équivalent végétarien, tous les deux jours : tout le monde le peut-il ? */
const alim01: Board = p => {
  const [deux] = cuesOf(p)
  const size = 26
  const gap = 8
  const n = 8
  const x0 = (W - n * size - (n - 1) * gap) / 2
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={140}>
        <Ico n="assiette" x={104} y={0} size={92} t0={100} />
        <Cases n={n} cols={n} x={x0} y={108} size={size} gap={gap} t0={700} />
        {deux?.shown ? range(n / 2).map(k => <Plat key={k} cx={x0 + 2 * k * (size + gap) + size / 2} cy={108 + size / 2} r={size / 2 - 4} t0={k * 200} />) : null}
      </Art>
    </Seg>
  )
}

/** 02 Plus d'une personne sur dix : dix personnes, une comptée */
const alim02: Board = p => {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const cols = Math.ceil(r.n / 2)
  const { cells, h } = rangCells({ n: r.n, cols, max: 40, gap: 12, y: 2 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 32}>
        {cells.map((c, i) => (
          <Picto key={i} n="personne" x={c.x} y={c.y} size={c.size} t0={200 + i * 80} tone={cue.shown && i < r.k ? 'count' : undefined} />
        ))}
        {cue.shown ? <Txt x={W / 2} y={h + 28} text={cue.text} size={15} tone="count" t0={600} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 7,3 % en 2020, 11,2 % début 2025, à la même échelle ; ce sont les personnes qui le déclarent */
const alim03: Board = p => {
  const [then, selves] = cuesOf(p)
  const year = yearsOf(p.segment.say)[0]
  const nowLabel = said(p, /Début 2025/)
  const nowText = said(p, /11,2[\s\u00a0]%/)
  const vt = num(then?.text)
  const vn = num(nowText)
  if (!then || !year || !nowLabel || !nowText || !vt || !vn) return null
  const cols = colonnes({
    items: [
      { label: String(year), value: vt, text: then.text, tone: 'count', shown: then.shown },
      { label: nowLabel, value: vn, text: nowText },
    ],
    x: 26,
    w: 150,
    y: 4,
    h: 150,
    t0: 100,
  })
  return (
    <Seg>
      <Art h={cols.h + 8}>
        {cols.el}
        {selves?.shown ? (
          <>
            <Picto n="personne" x={214} y={60} size={46} t0={0} />
            <Picto n="document" x={248} y={84} size={44} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le taux réduit de TVA des aliments : un panier, son étiquette et son taux */
const alim04: Board = p => {
  const [red, taux] = cuesOf(p)
  const tva = word(p, /TVA/)
  if (!red || !taux) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={132}>
        <Ico n="panier" x={20} y={14} size={104} t0={100} />
        <Ink d="M126 50C140 38 150 36 164 40" t0={700} dur={300} class="vc-thin" />
        <Picto n="etiquette" x={148} y={0} size={124} t0={900} tone={taux.shown ? 'count' : undefined} text={taux.shown ? taux.text : undefined} />
        {tva ? <Txt x={210} y={124} text={tva.text} size={15} tone="soft" t0={1300} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Des exceptions mises de côté ; les plats à consommer tout de suite et les repas sur place, à 10 % */
const alim05: Board = p => {
  const [exclus, dix] = cuesOf(p)
  const m = /comme (.+?)\./.exec(plain(p.segment.say))
  const list = m ? m[1]!.split(/,\s+|\s+ou\s+/) : []
  const reduit = said(p, /5,5[\s\u00a0]%/)
  const plats = word(p, /les plats préparés à consommer tout de suite/)
  const place = word(p, /les repas servis sur place/)
  if (!exclus || !dix || list.length < 2 || !reduit) return null
  return (
    <Seg>
      <Art h={206}>
        <Ico n="panier" x={0} y={18} size={64} t0={100} kept />
        <Picto n="etiquette" x={56} y={2} size={92} text={reduit} kept />
        {exclus.shown ? (
          <>
            <Arrow x1={150} y1={46} x2={172} y2={46} dash t0={0} />
            {list.map((l, k) => (
              <Txt key={l} x={178} y={24 + k * 22} text={l} max={15} size={14} anchor="start" tone="soft" t0={200 + k * 200} />
            ))}
          </>
        ) : null}
        <Ink d="M10 100H290" t0={0} dur={400} class="vc-soft vc-thin" />
        {dix.shown || plats?.shown ? (
          <>
            <Ico n="assiette" x={0} y={118} size={64} t0={0} />
            <Picto n="etiquette" x={56} y={104} size={92} tone="count" t0={300} text={dix.shown ? dix.text : undefined} />
            {plats ? <Txt x={156} y={130} text={plats.text} max={24} size={14} anchor="start" t0={200} /> : null}
            {place ? <Txt x={156} y={176} text={place.text} max={18} size={14} anchor="start" t0={400} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 « comment permettre à chacun de bien se nourrir, et à quel prix ? » */
const alim06: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Ico n="assiette" x={8} y={6} size={88} t0={100} />
      <Ico n="panier" x={110} y={8} size={86} t0={600} />
      <Ask x={228} y={14} h={70} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const AGRICULTURE: Record<string, Board> = {
  'agriculture-intro-01': intro01,
  'agriculture-intro-02': intro02,
  'agriculture-intro-03': intro03,
  'agriculture-intro-04': intro04,
  'agriculture-intro-05': intro05,
  'agriculture-intro-06': intro06,
  'agriculture-intro-07': intro07,
  'agriculture-intro-08': intro08,
  'agriculture-revenu-01': revenu01,
  'agriculture-revenu-02': revenu02,
  'agriculture-revenu-03': revenu03,
  'agriculture-revenu-04': revenu04,
  'agriculture-revenu-05': revenu05,
  'agriculture-revenu-06': revenu06,
  'agriculture-prix-01': prix01,
  'agriculture-prix-02': prix02,
  'agriculture-prix-03': prix03,
  'agriculture-prix-04': prix04,
  'agriculture-prix-05': prix05,
  'agriculture-prix-06': prix06,
  'agriculture-prix-07': prix07,
  'agriculture-prix-08': prix08,
  'agriculture-prix-09': prix09,
  'agriculture-prix-10': prix10,
  'agriculture-prix-11': prix11,
  'agriculture-aides-01': aides01,
  'agriculture-aides-02': aides02,
  'agriculture-aides-03': aides03,
  'agriculture-aides-04': aides04,
  'agriculture-aides-05': aides05,
  'agriculture-aides-06': aides06,
  'agriculture-aides-07': aides07,
  'agriculture-importations-01': imp01,
  'agriculture-importations-02': imp02,
  'agriculture-importations-03': imp03,
  'agriculture-importations-04': imp04,
  'agriculture-importations-05': imp05,
  'agriculture-importations-06': imp06,
  'agriculture-importations-07': imp07,
  'agriculture-alimentation-01': alim01,
  'agriculture-alimentation-02': alim02,
  'agriculture-alimentation-03': alim03,
  'agriculture-alimentation-04': alim04,
  'agriculture-alimentation-05': alim05,
  'agriculture-alimentation-06': alim06,
}
