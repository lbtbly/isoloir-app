// Piste C, les planches de la série « Écologie, énergie et transports » (src/ui/videos/series/ecologie_energie.ts) :
// un dessin par passage, composé avec la bibliothèque commune (dessin/encre.tsx, mises.tsx, pictos.tsx,
// schemas.tsx). Mêmes règles que « Retraites » et « Logement » : les mots et les nombres viennent du script (mots
// mis en valeur, phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus rend null,
// et le passage prend le dessin générique de sa sorte d'image. Quelques étiquettes courtes et neutres sont écrites
// ici quand le passage ne les dit pas (« avant », « dépenses », « emprunt », « prélèvements ») : elles nomment ce
// qui est dessiné, et l'« alt » du passage les reprend.
// Les pictogrammes propres au thème (pompe, ampoule, centrale, éolienne, train…) sont dessinés ici, au trait,
// dans un carré de 48 unités, sans attribut (GUIDE-SERIES.md § 10.6).

import { chartOf } from '../../model'
import { ECOLOGIE_ENERGIE as SERIE } from '../../series/ecologie_energie'
import { Art, Arrow, Ask, Brace, Fade, Ink, Marks, Txt, W, at, cls, cueOf, cuesOf, heard, num, plain, sentencesOf, said, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, HeadCues, Question, Seg, Signature, Src } from '../dessin/mises'
import { Picto, VILLES } from '../dessin/pictos'
import { Cases, Plafond, Rang, balance, barres, colonnes, frise, manettes } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Espace insécable et fine insécable (composées ici, pas tapées) */
const NB = String.fromCharCode(0xa0)
const FINE = String.fromCharCode(0x202f)

/** Un nombre d'un graphique de fiche, écrit à la française (5764 → « 5 764 », 30.4 → « 30,4 », −14 → « −14 ») */
function fr(n: number): string {
  const [i, d] = String(Math.abs(n)).split('.')
  const int = (i ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, FINE)
  return `${n < 0 ? '−' : ''}${d ? `${int},${d}` : int}`
}

/** « 2,37 euros » → « 2,37 € », « 94 dollars » → « 94 $ » */
const court = (s: string) => s.replace(/\s+euros?$/, `${NB}€`).replace(/\s+dollars?$/, `${NB}$`)

/** Première lettre en minuscule (un mot pris en tête de phrase, posé comme étiquette) */
const bas = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/* ——— Les pictogrammes du thème ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

interface Trace {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat */
  fill?: string
  thin?: number[]
  bold?: number[]
}

const DESSINS = {
  pompe: {
    s: ['M9 44V8a3 3 0 0 1 3-3H26a3 3 0 0 1 3 3V44', 'M5 44H33', 'M13 10H25V19H13Z', 'M29 16H34a3 3 0 0 1 3 3V34a3 3 0 0 0 6 0V17L39 12'],
    fill: 'M9 44V8a3 3 0 0 1 3-3H26a3 3 0 0 1 3 3V44Z',
    thin: [2],
  },
  ampoule: {
    s: ['M17 33C11 29 8 24 8 18a16 16 0 0 1 32 0C40 24 37 29 31 33V37H17Z', 'M18 41H30M20 45H28', 'M20 27L24 21L28 27'],
    fill: 'M17 33C11 29 8 24 8 18a16 16 0 0 1 32 0C40 24 37 29 31 33V37H17Z',
    thin: [2],
  },
  centrale: {
    s: ['M11 44C15 34 15 19 12 9H34C31 19 31 34 35 44', 'M4 44H44', 'M16 6q2-3 4 0q2-3 4 0q2-3 4 0'],
    fill: 'M11 44C15 34 15 19 12 9H34C31 19 31 34 35 44Z',
    thin: [2],
  },
  eolienne: { s: ['M22.5 46L23.5 20M25.5 46L24.5 20', 'M24 18V3M24 18L37 25.5M24 18L11 25.5', 'M16 46H32'] },
  soleil: { s: [circle(24, 24, 9), 'M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4'], fill: circle(24, 24, 9), thin: [1] },
  goutte: {
    s: ['M24 4C24 4 10 21 10 30a14 14 0 0 0 28 0C38 21 24 4 24 4Z', 'M17 31a7 7 0 0 0 5 6'],
    fill: 'M24 4C24 4 10 21 10 30a14 14 0 0 0 28 0C38 21 24 4 24 4Z',
    thin: [1],
  },
  robinet: { s: ['M3 10H9V28H3', 'M9 15H29a9 9 0 0 1 9 9V28H30V25a3 3 0 0 0-3-3H9', 'M19 15V9M13 9H25', 'M34 34C34 34 31 38 31 40.5a3 3 0 0 0 6 0C37 38 34 34 34 34Z'], thin: [3] },
  voiture: {
    s: ['M4 34V26L11 16H35L44 26V34Z', 'M14 19H32L37 26H10Z', `${circle(14, 35, 5)}${circle(34, 35, 5)}`],
    fill: 'M4 34V26L11 16H35L44 26V34Z',
    thin: [1],
  },
  avion: {
    s: ['M6 24C6 22.4 7.4 21.5 9 21.5H39C43 21.5 46 23 46 24S43 26.5 39 26.5H9C7.4 26.5 6 25.6 6 24Z', 'M20 21.5L13 6H18L30 21.5M20 26.5L13 42H18L30 26.5', 'M9 21.5L5 13H8.5L13.5 21.5M9 26.5L5 35H8.5L13.5 26.5'],
    fill: 'M6 24C6 22.4 7.4 21.5 9 21.5H39C43 21.5 46 23 46 24S43 26.5 39 26.5H9C7.4 26.5 6 25.6 6 24Z',
    thin: [2],
  },
  train: {
    s: ['M10 38V11a6 6 0 0 1 6-6H32a6 6 0 0 1 6 6V38Z', 'M14 11H34V22H14Z', 'M16 31h.5M31.5 31h.5', 'M15 38L10 46M33 38L38 46M6 46H42'],
    fill: 'M10 38V11a6 6 0 0 1 6-6H32a6 6 0 0 1 6 6V38Z',
    thin: [1],
    bold: [2],
  },
  baril: {
    s: ['M12 9C12 5 36 5 36 9V40C36 44 12 44 12 40Z', 'M12 9C12 13 36 13 36 9', 'M12 21C12 25 36 25 36 21M12 31C12 35 36 35 36 31'],
    fill: 'M12 9C12 5 36 5 36 9V40C36 44 12 44 12 40Z',
    thin: [2],
  },
  usine: {
    s: ['M4 44V26L14 20V26L24 20V26L32 21V8H40V44', 'M2 44H46', 'M10 33h4M20 33h4'],
    fill: 'M4 44V26L14 20V26L24 20V26L32 21V8H40V44Z',
    thin: [2],
  },
  route: { s: ['M14 46L21 4M34 46L27 4', 'M24 42v-6M24 30v-5M24 19v-4M24 10v-3'], thin: [1] },
  retenue: { s: ['M2 14L12 40H36L46 14', 'M7 26H41'], fill: 'M7 26H41L36 40H12Z', thin: [1] },
  champ: { s: ['M2 42H46', 'M10 42V30M10 35l-5-4M10 33l5-4M24 42V28M24 33l-5-4M24 31l5-4M38 42V30M38 35l-5-4M38 33l5-4'] },
  flocon: { s: ['M24 4V44M6.7 14L41.3 34M6.7 34L41.3 14', 'M20 8l4 4 4-4M20 40l4-4 4 4'], thin: [1] },
} satisfies Record<string, Trace>

type DessinName = keyof typeof DESSINS

/** Un pictogramme du thème, comme Picto (dessin/pictos.tsx) : (x, y) coin haut gauche, « size » son côté */
function Dessin({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1, filled, step = 200 }: { n: DessinName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number; filled?: boolean; step?: number }) {
  const d: Trace = DESSINS[n]
  const s = size / 48
  const still = kept || tone === 'ghost'
  const tint = d.fill && (filled || tone === 'count')
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(w / s) }}>
      {tint ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class={tone === 'count' ? 'vc-tint-count' : 'vc-tint'} d={d.fill} />
        </Fade>
      ) : null}
      {d.s.map((path, i) => (
        <Ink key={i} d={path} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined} />
      ))}
    </g>
  )
}

/** Un pictogramme du thème seul, dans son propre SVG (listes en HTML) */
const Glyphe = ({ n, t0 = 0 }: { n: DessinName; t0?: number }) => (
  <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
    <Dessin n={n} x={0} y={0} t0={t0} step={150} />
  </svg>
)

/** Le pictogramme de chaque approfondissement, et d'une question qui en parle */
const GLYPHES: [RegExp, DessinName][] = [
  [/carburant/, 'pompe'],
  [/électricité/, 'ampoule'],
  [/émissions|climat/, 'usine'],
  [/déplacer|transports/, 'train'],
  [/eau|chaleur|canicule/, 'goutte'],
]
const glypheOf = (s: string): DessinName => GLYPHES.find(([re]) => re.test(s.toLowerCase()))?.[1] ?? 'goutte'

/** Les questions d'une introduction, chacune sous son pictogramme, quand la voix la pose (comme Panel) */
function Questions({ items }: { items: { n: DessinName; text: string; shown: boolean; cues: Cue[] }[] }) {
  return (
    <ul class="vc-panel" style={{ '--cols': '2' }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyphe n={it.n} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={it.cues} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Les approfondissements de la série, en sommaire numéroté, avec les pictogrammes du thème (comme Sommaire) */
function Sommaire({ p, t0 = 200 }: { p: P; t0?: number }) {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyphe n={glypheOf(`${v.short} ${v.title}`)} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/**
 * Une hausse, à la même échelle depuis zéro : en haut, la barre d'avant, prolongée en pointillé de ce qu'elle a
 * gagné (la hausse, écrite au-dessus) ; en bas, la barre d'après, sa valeur au bout
 */
function Hausse({ before, after, beforeLabel, afterLabel, afterText, deltaText, showAfter, showDelta, room = 84 }: { before: number; after: number; beforeLabel?: string | null; afterLabel?: string | null; afterText: string; deltaText: string; showAfter: boolean; showDelta: boolean; room?: number }) {
  const x0 = 6
  const k = (W - x0 - room) / after
  const xb = x0 + before * k
  const xa = x0 + after * k
  return (
    <>
      {showDelta ? (
        <>
          {beforeLabel ? <Txt x={x0} y={17} text={beforeLabel} anchor="start" size={15} tone="soft" t0={0} /> : null}
          <Fade t0={200}>
            <rect class="vc-tint" x={x0} y={24} width={xb - x0} height={28} />
          </Fade>
          <Ink d={`M${x0} 24H${xb.toFixed(1)}V52H${x0}Z`} t0={0} dur={600} />
          <Fade t0={600} class="vc-count vc-dash">
            <path d={`M${xb.toFixed(1)} 24H${xa.toFixed(1)}V52H${xb.toFixed(1)}`} />
          </Fade>
          <Txt x={(xb + xa) / 2} y={17} text={deltaText} size={20} big tone="count" t0={800} />
        </>
      ) : null}
      {afterLabel ? <Txt x={x0} y={85} text={afterLabel} anchor="start" size={15} tone="soft" t0={100} /> : null}
      {showAfter ? (
        <>
          <Fade t0={500}>
            <rect class="vc-tint" x={x0} y={92} width={xa - x0} height={28} />
          </Fade>
          <Ink d={`M${x0} 92H${xa.toFixed(1)}V120H${x0}Z`} t0={200} dur={700} />
          <Txt x={xa + 8} y={113} text={afterText} anchor="start" size={20} big t0={700} />
        </>
      ) : null}
    </>
  )
}

/** Une grille de cent cases, dont « k » comptées (les dernières, comme Cent) ; (x, y) : son coin haut gauche */
function Grille({ x, y, k, shown, t0 = 0 }: { x: number; y: number; k: number; shown: boolean; t0?: number }) {
  const sq = (i: number) => `M${x + (i % 10) * 11.4} ${y + Math.floor(i / 10) * 11.4}h9v9h-9z`
  const from = 100 - Math.round(k)
  const plainCells = range(shown ? from : 100)
  return (
    <>
      {range(10).map(r => {
        const d = plainCells.filter(i => Math.floor(i / 10) === r).map(sq).join('')
        return d ? <Ink key={r} d={d} t0={t0 + r * 60} dur={400} class="vc-thin" /> : null
      })}
      {shown ? (
        <Fade t0={t0 + 700} class="vc-count">
          <path class="vc-solid-count" d={range(100 - from).map(i => sq(from + i)).join('')} />
        </Fade>
      ) : null}
    </>
  )
}

/* ——— Introduction ——— */

/** 01 Le plein, l'électricité, un été de canicule : trois pictogrammes, chacun quand la voix le dit */
const intro01: Board = p => {
  const items: [RegExp, number][] = [
    [/le plein/, 52],
    [/l’électricité|l'électricité/, 150],
    [/un été de canicule/, 248],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={132}>
        {items.map(([re, cx], i) => {
          const w = word(p, re)
          if (!w?.shown) return null
          return (
            <g key={cx}>
              {i === 0 ? <Dessin n="pompe" x={cx - 32} y={6} size={64} t0={0} /> : null}
              {i === 1 ? <Dessin n="ampoule" x={cx - 32} y={6} size={64} t0={0} /> : null}
              {i === 2 ? (
                <>
                  <Picto n="thermometre" x={cx - 40} y={10} size={60} t0={0} />
                  <Dessin n="soleil" x={cx + 2} y={0} size={40} t0={500} />
                </>
              ) : null}
              <Txt x={cx} y={94} text={w.text} max={11} size={15} t0={300} />
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 02 2,37 euros le litre de gazole, 46,6 % de plus qu'un an plus tôt : la barre d'avant, prolongée de la hausse */
const intro02: Board = p => {
  const [price, pct] = cuesOf(p)
  const v = num(price?.text)
  const k = num(pct?.text)
  if (!price || !pct || !v || !k) return null
  const date = word(p, /Le \d+ \S+ \d{4}/)
  const before = word(p, /un an plus tôt/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={126}>
        <Hausse
          before={v / (1 + k / 100)}
          after={v}
          beforeLabel={before?.text}
          afterLabel={date ? bas(date.text) : null}
          afterText={court(price.text)}
          deltaText={`+${pct.text}`}
          showAfter={price.shown}
          showDelta={pct.shown}
          room={80}
        />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 La production d'électricité, en une barre de 100 : 68,1 % de nucléaire (compté), puis 27 % de renouvelables */
const intro03: Board = p => {
  const [nuc, ren] = cuesOf(p)
  const a = num(nuc?.text) ?? 0
  const b = num(ren?.text) ?? 0
  const wn = said(p, /nucléaire/)
  const wr = said(p, /renouvelables/)
  if (!nuc || !ren || !a || !b || a + b > 100) return null
  const x0 = 8
  const k = 284 / 100
  const xa = x0 + a * k
  const xb = xa + b * k
  const y0 = 52
  const y1 = 92
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={126}>
        <Ink d={`M${x0} ${y0}H${x0 + 100 * k}V${y1}H${x0}Z`} t0={100} dur={900} />
        {nuc.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={y0} width={a * k} height={y1 - y0} />
              <path d={`M${xa.toFixed(1)} ${y0}V${y1}`} />
            </Fade>
            <Txt x={(x0 + xa) / 2} y={y0 - 14} text={nuc.text} size={22} big tone="count" t0={300} />
            {wn ? <Txt x={(x0 + xa) / 2} y={y1 + 24} text={wn} size={15} t0={400} /> : null}
          </>
        ) : null}
        {ren.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-tint" x={xa} y={y0} width={b * k} height={y1 - y0} />
              <path d={`M${xb.toFixed(1)} ${y0}V${y1}`} />
            </Fade>
            <Txt x={(xa + xb) / 2} y={y0 - 14} text={ren.text} size={22} big t0={300} />
            {wr ? <Txt x={(xa + xb) / 2} y={y1 + 24} text={wr} size={15} t0={400} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 359 millions de tonnes ; la baisse ralentit : −3 % en 2024, −2,1 % en 2025, deux colonnes qui descendent */
const intro04: Board = p => {
  const found = [...plain(p.segment.say).matchAll(/(−[\d,]+) % en (\d{4})/g)]
  if (found.length < 2) return null
  const vals = found.map(m => Math.abs(num(m[1]) ?? 0))
  const top = Math.max(...vals)
  if (!top) return null
  const base = 26
  const k = 92 / top
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 92 + 34}>
        <Ink d={`M20 ${base}H280`} t0={0} dur={500} class="vc-soft" />
        {found.map((m, i) => {
          const cx = 100 + i * 100
          const h = vals[i]! * k
          if (!heard(p, m[0])) return null
          return (
            <g key={m[2]}>
              <Txt x={cx} y={base - 8} text={m[2]!} size={15} tone="soft" t0={0} />
              <Fade t0={200} class="vc-count">
                <rect class="vc-tint-count" x={cx - 28} y={base} width={56} height={h} />
              </Fade>
              <g class="vc-count">
                <Ink d={`M${cx - 28} ${base}V${base + h}H${cx + 28}V${base}`} t0={0} dur={600} />
              </g>
              <Txt x={cx} y={base + h + 26} text={`${m[1]}${NB}%`} size={20} big tone="count" t0={500} />
            </g>
          )
        })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Les cinq questions du thème, chacune sous son pictogramme, quand la voix la pose */
const intro05: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 3) return null
  return (
    <Seg kind="ask">
      <Questions items={qs.map(q => ({ n: glypheOf(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))} />
    </Seg>
  )
}

/** 06 Les sujets des vidéos qui suivent : le sommaire de la série */
const intro06: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Carburants ——— */

/** 01 « Quelle part pour le carburant, quelle part pour les taxes ? » : une pompe, un litre partagé en deux */
const carburants01: Board = p => {
  const [carb, taxes] = cuesOf(p)
  const g = 149
  return (
    <Seg>
      <Art h={160}>
        <Ink d={`M8 ${g}H212`} t0={0} dur={500} class="vc-soft" />
        <Dessin n="pompe" x={12} y={g - 133} size={145} t0={100} />
        <Ink d={`M168 ${g}V40H220V${g}`} t0={900} dur={700} />
        <Fade t0={1300} class="vc-dash vc-soft">
          <path d="M168 94H220" />
        </Fade>
        {carb?.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-tint" x={168} y={94} width={52} height={g - 94} />
            </Fade>
            <Txt x={228} y={118} text={carb.text} max={10} size={15} anchor="start" t0={100} />
          </>
        ) : null}
        {taxes?.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={168} y={40} width={52} height={54} />
            </Fade>
            <Txt x={228} y={66} text={taxes.text} max={10} size={15} anchor="start" tone="count" t0={100} />
          </>
        ) : null}
        <Ask x={182} y={0} h={34} t0={1700} />
      </Art>
    </Seg>
  )
}

/** 02 Le prix à la pompe = le carburant hors taxes + l'accise (60,75 centimes) + la TVA (20 %), calculée aussi sur
 *  l'accise */
const carburants02: Board = p => {
  const total = word(p, /[Ll]e prix à la pompe/)
  const ht = word(p, /hors taxes/)
  const acc = word(p, /accise/)
  const tva = word(p, /TVA/)
  const amount = word(p, /[\d,]+ centimes/)
  const rate = word(p, /\d+ %/)
  const also = word(p, /s’applique aussi|s'applique aussi/)
  const n = num(amount?.text)
  if (!ht || !acc || !tva || !n) return null
  const boxes = [4, 108, 212]
  const box = (x: number) => `M${x} 44H${x + 84}V114H${x}Z`
  const accShown = !!acc.shown
  const tvaShown = !!tva.shown
  return (
    <Seg>
      <Art h={156}>
        {total ? <Txt x={W / 2} y={16} text={total.text} size={15} t0={0} /> : null}
        <Brace x1={6} y1={24} x2={294} y2={24} side={1} t0={300} />
        <Ink d={box(boxes[0]!)} t0={500} dur={600} />
        <Txt x={46} y={84} text={ht.text} max={10} size={15} t0={700} />
        {accShown ? (
          <>
            <Txt x={98} y={86} text="+" size={22} big tone="soft" t0={0} />
            <Fade t0={300} class="vc-count">
              <rect class="vc-tint-count" x={108} y={44} width={84} height={70} />
            </Fade>
            <Ink d={box(boxes[1]!)} t0={0} dur={600} />
            <Txt x={150} y={66} text={acc.text} size={15} t0={300} />
            {amount?.shown ? (
              <>
                <Txt x={150} y={92} text={fr(n)} size={20} big tone="count" t0={0} />
                <Txt x={150} y={108} text={amount.text.replace(/^[\d,\s]+/, '')} size={13} t0={100} />
              </>
            ) : null}
          </>
        ) : null}
        {tvaShown ? (
          <>
            <Txt x={202} y={86} text="+" size={22} big tone="soft" t0={0} />
            <Fade t0={300} class="vc-count">
              <rect class="vc-tint-count" x={212} y={44} width={84} height={70} />
            </Fade>
            <Ink d={box(boxes[2]!)} t0={0} dur={600} />
            <Txt x={254} y={66} text={tva.text} size={15} t0={300} />
            {rate?.shown ? <Txt x={254} y={96} text={rate.text} size={20} big tone="count" t0={0} /> : null}
          </>
        ) : null}
        {also?.shown ? (
          <g class="vc-count">
            <Ink d="M254 120C246 146 160 146 152 122" t0={0} dur={600} />
            <Ink d="M152 122l-1.6 8.6M152 122l7 5.4" t0={500} dur={200} />
          </g>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Le litre de gazole à l'échelle : le produit raffiné, le reste hors taxes, puis les taxes (le reste du prix) */
const carburants03: Board = p => {
  const chart = chartOf(p.segment)
  const [ht, raf, rest] = cuesOf(p)
  const taxes = word(p, /Les taxes/)
  if (!chart || chart.kind !== 'compare' || chart.items.length < 3 || !ht || !raf) return null
  const [pump, noTax, refined] = chart.items.map(i => i.value)
  if (!pump || !noTax || !refined || noTax >= pump || refined >= noTax) return null
  const x0 = 8
  const s = 284 / pump
  const X = (v: number) => x0 + v * s
  const y0 = 58
  const y1 = 92
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={168}>
        <Ink d={`M${x0} ${y0}H${X(pump)}V${y1}H${x0}Z`} t0={100} dur={800} />
        {ht.shown ? (
          <>
            <Ink d={`M${X(noTax).toFixed(1)} ${y0 - 4}V${y1 + 4}`} t0={0} dur={300} />
            <Brace x1={x0} y1={y0 - 6} x2={X(noTax)} y2={y0 - 6} side={-1} t0={200} />
            <Txt x={(x0 + X(noTax)) / 2} y={y0 - 26} text={ht.text} size={17} tone="count" t0={400} />
            {heard(p, 'Hors taxes') ? <Txt x={(x0 + X(noTax)) / 2} y={y0 - 44} text="hors taxes" size={14} tone="soft" t0={300} /> : null}
          </>
        ) : null}
        {raf.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-tint" x={x0} y={y0} width={refined * s} height={y1 - y0} />
            </Fade>
            <Ink d={`M${X(refined).toFixed(1)} ${y0}V${y1}`} t0={0} dur={300} class="vc-thin" />
            <Brace x1={x0} y1={y1 + 6} x2={X(refined)} y2={y1 + 6} side={1} t0={200} />
            <Txt x={(x0 + X(refined)) / 2} y={y1 + 38} text={raf.text} size={18} big t0={300} />
            {word(p, /produit raffiné/) ? <Txt x={(x0 + X(refined)) / 2} y={y1 + 56} text={word(p, /produit raffiné/)!.text} size={14} t0={400} /> : null}
          </>
        ) : null}
        {taxes?.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={X(noTax)} y={y0} width={(pump - noTax) * s} height={y1 - y0} />
            </Fade>
            <Brace x1={X(noTax)} y1={y1 + 6} x2={X(pump)} y2={y1 + 6} side={1} t0={200} tone="count" />
            <Txt x={(X(noTax) + X(pump)) / 2} y={y1 + 36} text={bas(taxes.text)} size={16} tone="count" t0={300} />
            {rest?.shown ? <Txt x={(X(noTax) + X(pump)) / 2} y={y1 + 54} text={rest.text} max={12} size={14} t0={0} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le Brent : 94 dollars de mars à mi-septembre, 33 de plus qu'au début de l'année ; un baril */
const carburants04: Board = p => {
  const [price, plus] = cuesOf(p)
  const v = num(price?.text)
  const d = num(plus?.text)
  if (!price || !plus || !v || !d || d >= v) return null
  const start = word(p, /au début de l’année|au début de l'année/)
  const span = word(p, /de mars à mi-septembre/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={126}>
        <Dessin n="baril" x={254} y={-2} size={40} t0={100} />
        <Hausse
          before={v - d}
          after={v}
          beforeLabel={start?.text}
          afterLabel={span?.text}
          afterText={court(price.text)}
          deltaText={`+${d}${NB}$`}
          showAfter={price.shown}
          showDelta={plus.shown}
          room={80}
        />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 La marge brute de raffinage, 37,26 $ par baril en septembre 2026, 23,17 en moyenne sur 2026 : les deux barres
 *  du graphique de la fiche, à la même échelle */
const carburants05: Board = p => {
  const chart = chartOf(p.segment)
  const [sept, avg] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || chart.items.length !== 2 || !sept || !avg) return null
  const [a, b] = chart.items
  const g = barres({
    items: [
      { label: a!.label, value: a!.value, text: court(sept.text), tone: 'count', shown: sept.shown },
      { label: b!.label, value: b!.value, text: `${avg.text}${NB}$`, shown: avg.shown },
    ],
    y: 4,
    size: 28,
    gap: 32,
    room: 96,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le poids n'est pas le même pour tous : l'ensemble des ménages avec voiture, puis les intercommunalités rurales
 *  et urbaines, à la même échelle */
const carburants06: Board = p => {
  const [all, rur, urb] = cuesOf(p)
  const va = num(all?.text)
  const vr = num(rur?.text)
  const vu = num(urb?.text)
  const wa = word(p, /ménages avec voiture/)
  const wr = word(p, /intercommunalités rurales/)
  const wu = word(p, /urbaines/)
  if (!all || !rur || !urb || !va || !vr || !vu) return null
  const g = barres({
    items: [
      { label: wa?.text, value: va, text: all.text, shown: all.shown },
      { label: wr?.text, value: vr, text: rur.text, shown: rur.shown },
      { label: wu?.text, value: vu, text: urb.text, shown: urb.shown },
    ],
    y: 2,
    size: 22,
    gap: 30,
    room: 90,
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

/** 07 « Quelle réponse, et pour qui ? » : la pompe du début, une question */
const carburants07: Board = p => (
  <Seg kind="ask">
    <Art h={120}>
      <Ink d="M40 116H200" t0={0} dur={500} class="vc-soft" />
      <Dessin n="pompe" x={64} y={-4} size={130} t0={100} />
      <Ask x={196} y={14} h={72} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Électricité ——— */

/** 01 « Qui a produit cette électricité, et comment son prix est-il fixé ? » : l'ampoule, les producteurs, le prix */
const electricite01: Board = p => {
  const [who, price] = cuesOf(p)
  return (
    <Seg>
      <Art h={190}>
        <Dessin n="ampoule" x={118} y={0} size={64} t0={100} tone={who?.shown ? 'count' : undefined} />
        <Ink d="M150 64V84M64 84H244M64 84V100M244 84V104" t0={700} dur={700} class="vc-thin" />
        <Dessin n="centrale" x={10} y={104} size={56} t0={1100} />
        <Dessin n="eolienne" x={66} y={100} size={58} t0={1300} />
        <Picto n="etiquette" x={214} y={104} size={60} t0={1500} text="?" />
        {who?.shown ? <Txt x={66} y={184} text={who.text} size={15} t0={0} /> : null}
        {price?.shown ? <Txt x={244} y={184} text={price.text} size={15} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 68,1 % de nucléaire en 2025, entre 63 et 77 % sur dix ans : une réglette de 0 à 100, la plage, un drapeau */
const electricite02: Board = p => {
  const [cue, span] = cuesOf(p)
  const v = num(cue?.text)
  const m = /entre (\d+) et (\d+)/.exec(plain(span?.text ?? ''))
  if (!cue || !v || !m) return null
  const lo = Number(m[1])
  const hi = Number(m[2])
  const f = frise({ y: 104, from: 0, to: 100, x0: 16, x1: 284, ticks: [0, 25, 50, 75, 100], labels: [0, 50, 100], t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={152}>
        <Dessin n="centrale" x={8} y={4} size={50} t0={100} />
        {f.el}
        {span?.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-tint" x={f.X(lo)} y={92} width={f.X(hi) - f.X(lo)} height={24} />
              <path class="vc-soft" d={`M${f.X(lo).toFixed(1)} 92V116M${f.X(hi).toFixed(1)} 92V116`} />
            </Fade>
            <Txt x={(f.X(lo) + f.X(hi)) / 2} y={148} text={span.text} size={15} t0={200} />
          </>
        ) : null}
        {cue.shown ? (
          <>
            <Picto n="drapeau" x={f.X(v) - 12} y={104 - 45} size={47} tone="count" t0={100} />
            <Txt x={f.X(v) + 26} y={70} text={cue.text} size={20} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Six EPR2 : 51,7 milliards au chiffrage de 2022, 67,4 à celui de fin 2023, 30 % de plus */
const electricite03: Board = p => {
  const chart = chartOf(p.segment)
  const [cost, pct] = cuesOf(p)
  if (!chart || chart.kind !== 'series' || chart.items.length !== 2 || !cost || !pct) return null
  const [a, b] = chart.items
  if (!a || !b || b.value <= a.value) return null
  const h = 130
  const base = 8 + h
  const scale = (h - 34) / b.value
  const cols = colonnes({
    items: [
      { label: a.label.replace(/^Chiffrage\s+/, ''), value: a.value, text: fr(a.value), shown: true },
      { label: b.label.replace(/^Chiffrage\s+/, ''), value: b.value, text: fr(b.value), tone: 'count', shown: cost.shown },
    ],
    x: 50,
    w: 170,
    colW: 54,
    y: 8,
    h,
    t0: 200,
  })
  const xb = 50 + (170 - 54) + 54
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={8 + cols.h}>
        {cols.el}
        {pct.shown ? (
          <>
            <Fade t0={0} class="vc-dash vc-soft">
              <path d={`M104 ${(base - a.value * scale).toFixed(1)}H${xb + 4}`} />
            </Fade>
            <Brace x1={xb + 6} y1={base - a.value * scale} x2={xb + 6} y2={base - b.value * scale} side={-1} t0={200} tone="count" />
            <Txt x={xb + 22} y={base - ((a.value + b.value) / 2) * scale + 7} text={`+${pct.text}`} size={20} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le solaire, 30,4 GW fin 2025, plus que l'hydraulique, 25,7 GW : les deux barres du graphique de la fiche */
const electricite04: Board = p => {
  const chart = chartOf(p.segment)
  const sol = cuesOf(p)[1]
  if (!chart || chart.kind !== 'compare' || chart.items.length !== 2 || !sol) return null
  const unit = chart.unit
  const g = barres({
    items: chart.items.map((it, i) => ({ label: it.label, value: it.value, text: `${fr(it.value)}${NB}${unit}`, tone: i === 0 && sol.shown ? ('count' as const) : undefined, shown: i === 0 ? sol.shown : heard(p, 'désormais') })),
    y: 4,
    size: 28,
    gap: 32,
    room: 96,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le nucléaire d'un côté, les renouvelables de l'autre : une balance au fléau horizontal */
const electricite05: Board = p => {
  const [nuc, ren] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => <Dessin n="centrale" x={cx - 30} y={base - 55} size={60} t0={900} />,
    right: (cx, base) => (
      <>
        <Dessin n="eolienne" x={cx - 42} y={base - 58} size={58} t0={1200} />
        <Dessin n="soleil" x={cx + 4} y={base - 46} size={40} t0={1500} />
      </>
    ),
    labels: [nuc?.text ?? null, ren?.text ?? null],
    shown: [!!nuc?.shown, !!ren?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** Les offres d'un marché de gros, rangées de la moins chère à la plus chère (un dessin, pas des données) */
const OFFRES: [number, number][] = [
  [40, 14],
  [34, 22],
  [30, 32],
  [34, 46],
  [30, 64],
  [28, 92],
  [30, 118],
]
/** Les offres retenues pour couvrir la demande */
const RETENUES = 5

/** 06 Tous les producteurs reçoivent le prix de la dernière offre retenue : un escalier d'offres, la demande, le prix */
const electricite06: Board = p => {
  const [same, price] = cuesOf(p)
  const demand = word(p, /la demande/)
  const base = 150
  const x0 = 16
  let x = x0
  const blocks = OFFRES.map(([w, h], i) => {
    const b = { x, w, h, kept: i < RETENUES }
    x += w
    return b
  })
  const last = blocks[RETENUES - 1]!
  const xd = last.x + last.w
  const yp = base - last.h
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={158}>
        <Ink d={`M${x0 - 6} ${base}H${x + 10}`} t0={0} dur={500} class="vc-soft" />
        {blocks.map((b, i) =>
          b.kept ? (
            <g key={i}>
              <Fade t0={300 + i * 150}>
                <rect class="vc-tint" x={b.x} y={base - b.h} width={b.w} height={b.h} />
              </Fade>
              <Ink d={`M${b.x} ${base}V${base - b.h}H${b.x + b.w}V${base}`} t0={150 + i * 150} dur={350} />
            </g>
          ) : (
            <Fade key={i} t0={1100} class="vc-ghost">
              <path d={`M${b.x} ${base}V${base - b.h}H${b.x + b.w}V${base}`} />
            </Fade>
          ),
        )}
        {demand?.shown ? (
          <>
            <Fade t0={0} class="vc-dash">
              <path d={`M${xd} 8V${base}`} />
            </Fade>
            <Txt x={xd + 6} y={22} text={demand.text} size={14} anchor="start" t0={200} />
          </>
        ) : null}
        {same?.shown ? (
          <g class="vc-count">
            <Ink d={`M${x0} ${yp}H${xd}`} t0={0} dur={700} class="vc-bold" />
            <Txt x={x0} y={yp - 10} text={same.text} size={15} anchor="start" tone="count" t0={400} />
          </g>
        ) : null}
        {price?.shown ? <Txt x={xd - 4} y={yp - 10} text={court(price.text)} size={18} big anchor="end" tone="count" t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Le gaz a pu fixer le prix environ 30 % du temps ; ses centrales, environ 3 % de la production : deux grilles */
const electricite07: Board = p => {
  const [t, prod] = cuesOf(p)
  const vt = num(t?.text)
  const vp = num(prod?.text)
  const wt = word(p, /du temps/)
  const wp = word(p, /de l’électricité|de l'électricité/)
  if (!t || !prod || !vt || !vp || vt > 100 || vp > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={174}>
        <Grille x={20} y={4} k={vt} shown={t.shown} t0={100} />
        <Grille x={168} y={4} k={vp} shown={prod.shown} t0={300} />
        {t.shown ? <Txt x={71} y={142} text={t.text} size={20} big tone="count" t0={300} /> : null}
        {t.shown && wt ? <Txt x={71} y={162} text={wt.text} size={14} t0={400} /> : null}
        {prod.shown ? <Txt x={219} y={142} text={prod.text} size={20} big tone="count" t0={300} /> : null}
        {prod.shown && wp ? <Txt x={219} y={162} text={wp.text} size={14} t0={400} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Une réforme européenne de 2024, puis « Quelle électricité produire, et comment en fixer le prix ? » :
 *  l'ampoule, une étiquette vierge ; la question (et son point d'interrogation) quand la voix la pose */
const electricite08: Board = p => {
  const asked = sentencesOf(p.segment.say).filter(s => /\?$/.test(s)).join(' ')
  if (!asked) return null
  const shown = heard(p, asked.split(' ').slice(0, 2).join(' '))
  return (
    <Seg kind="ask">
      <Art h={110}>
        <Dessin n="ampoule" x={54} y={4} size={100} t0={100} />
        <Picto n="etiquette" x={146} y={34} size={60} t0={800} />
        {shown ? <Ask x={222} y={14} h={70} t0={300} /> : null}
      </Art>
      <p class={cls('vc-prompt', shown ? 'vc-rise' : 'vc-wait')} style={at(300)}>
        <Marks text={asked} cues={cuesOf(p)} />
      </p>
    </Seg>
  )
}

/* ——— Émissions et financement ——— */

/** 01 Une trajectoire de baisse : où en est-elle, et comment la financer ? */
const climat01: Board = p => {
  const fin = cueOf(p, 1)
  const t = 0.34
  const dot = { x: 24 + t * 236, y: 30 + t * 92 }
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={150}>
        <Ink d="M14 6V140H290" t0={0} dur={700} class="vc-soft" />
        <Fade t0={500} class="vc-dash">
          <path d="M24 30L260 122" />
        </Fade>
        <Fade t0={1100} class="vc-count">
          <circle class="vc-tint-count" cx={dot.x} cy={dot.y} r={6} />
          <circle cx={dot.x} cy={dot.y} r={6} />
        </Fade>
        <Ask x={dot.x - 8} y={dot.y - 54} h={40} t0={1300} />
        {fin?.shown ? <Picto n="tirelire" x={236} y={78} size={54} t0={0} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Les budgets carbone : un plafond sur cinq ans, de 2024 à 2028 */
const climat02: Board = p => {
  const [bud] = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const five = word(p, /sur cinq ans/)
  const y0 = years[0]
  const y1 = years[1]
  if (!y0 || !y1 || y1 <= y0 || y1 - y0 > 8) return null
  const f = frise({ y: 110, from: y0 - 0.5, to: y1 + 0.5, x0: 20, x1: 280, ticks: range(y1 - y0 + 1).map(k => y0 + k), labels: range(y1 - y0 + 1).map(k => y0 + k), t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={150}>
        {f.el}
        {bud?.shown ? (
          <>
            <Plafond x0={20} x1={280} y={44} t0={0} tone="count" />
            <Fade t0={500} class="vc-dash vc-soft">
              <path d="M20 44V110M280 44V110" />
            </Fade>
            <Txt x={20} y={22} text={bud.text} size={15} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
        {five?.shown ? <Txt x={W / 2} y={84} text={five.text} size={15} tone="soft" t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Plus de 4 % de baisse par an de 2026 à 2028 pour tenir le budget, au moins le double de 2025 (−2,1 %) : deux barres */
const climat03: Board = p => {
  const [need] = cuesOf(p)
  const was = word(p, /−[\d,]+ %/)
  const vn = num(need?.text)
  const vw = Math.abs(num(was?.text) ?? 0)
  const span = word(p, /de \d{4} à \d{4}/)
  const ref = word(p, /rythme de \d{4}/)
  if (!need || !was || !vn || !vw) return null
  const g = barres({
    items: [
      { label: span?.text, value: vn * 1.15, ghostFrom: vn, text: need.text, tone: 'count', shown: need.shown },
      { label: ref?.text, value: vw, text: was.text, shown: was.shown },
    ],
    y: 4,
    size: 28,
    gap: 32,
    room: 112,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 10}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le marché européen du carbone : un quota par tonne ; −14 % pour les émissions qui y sont soumises, −0,4 % pour
 *  les autres */
const climat04: Board = p => {
  const chart = chartOf(p.segment)
  const [quota, fall] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || chart.items.length !== 2 || !fall) return null
  const g = barres({
    items: chart.items.map((it, i) => ({ label: it.label, value: Math.abs(it.value), text: `${fr(it.value)}${NB}%`, tone: i === 0 ? ('count' as const) : undefined, shown: fall.shown })),
    y: 70,
    size: 24,
    gap: 30,
    room: 70,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={70 + g.h + 8}>
        <Dessin n="usine" x={20} y={0} size={56} t0={100} />
        {quota?.shown ? (
          <>
            <Arrow x1={86} y1={30} x2={140} y2={30} t0={0} />
            <Picto n="document" x={148} y={4} size={48} tone="count" t0={200} />
            <Txt x={204} y={36} text={quota.text} size={15} anchor="start" tone="count" t0={500} />
          </>
        ) : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Les investissements pour le climat : +50 % en dix ans, −5 % en 2024, presque le double attendu d'ici 2030 */
const climat05: Board = p => {
  const up = word(p, /\d+ % en dix ans/)
  const down = word(p, /\d+ % en \d{4}/)
  const twice = word(p, /presque doubler d’ici \d{4}|presque doubler d'ici \d{4}/)
  const u = num(up?.text)
  const dn = num(down?.text)
  if (!up || !down || !twice || !u || !dn) return null
  // Hauteurs depuis zéro : 100 au départ, +u %, −dn %, puis presque le double (un dessin : 1,9 fois)
  const v1 = 100 * (1 + u / 100)
  const v2 = v1 * (1 - dn / 100)
  const v3 = v2 * 1.9
  const base = 172
  const k = 150 / v3
  const Y = (v: number) => (base - v * k).toFixed(1)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={182}>
        <Ink d={`M14 ${base}H292`} t0={0} dur={500} class="vc-soft" />
        {up.shown ? (
          <>
            <Ink d={`M20 ${Y(100)}L176 ${Y(v1)}`} t0={0} dur={900} />
            <Txt x={98} y={Number(Y((100 + v1) / 2)) + 30} text={`+${up.text}`} size={15} t0={600} />
          </>
        ) : null}
        {down.shown ? (
          <>
            <g class="vc-count">
              <Ink d={`M176 ${Y(v1)}L204 ${Y(v2)}`} t0={0} dur={400} class="vc-bold" />
            </g>
            <Txt x={204} y={Number(Y(v2)) + 28} text={`−${down.text}`} size={15} tone="count" t0={300} />
          </>
        ) : null}
        {twice.shown ? (
          <>
            <Arrow x1={204} y1={Number(Y(v2))} x2={288} y2={Number(Y(v3))} dash t0={0} />
            <Txt x={228} y={24} text={twice.text} max={16} size={14} anchor="end" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Plus de 2 points de PIB en 2030 ; trois leviers cités : dépenses, emprunt, prélèvements */
const climat06: Board = p => {
  const lev = cueOf(p, 1)
  const m = manettes({
    items: [
      { picto: 'pieces', label: 'dépenses', pos: 0.5, shown: !!lev?.shown },
      { picto: 'billet', label: 'emprunt', pos: 0.5, shown: heard(p, 'emprunter') },
      { picto: 'document', label: 'prélèvements', pos: 0.5, shown: heard(p, 'relever') },
    ],
    y: 2,
    h: 56,
    size: 40,
    t0: 0,
    labelMax: 13,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={m.h + 4}>{m.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 La dette publique : 115,7 % du PIB fin 2025, puis les prévisions (pointillé) */
const climat07: Board = p => {
  const chart = chartOf(p.segment)
  const cue = cueOf(p, 0)
  if (!chart || chart.kind !== 'series' || chart.items.length < 2 || !cue) return null
  const cols = colonnes({
    items: chart.items.map((it, i) => ({
      label: String(yearsOf(it.label)[0] ?? it.label),
      value: it.value,
      text: `${fr(it.value)}${NB}%`,
      ghost: /prévision/.test(it.label),
      tone: i === 0 ? ('count' as const) : undefined,
      shown: i === 0 ? cue.shown : true,
    })),
    x: 30,
    w: 240,
    colW: 50,
    y: 4,
    h: 140,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={4 + cols.h}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Quel principe pour guider la transition, et comment la financer ? » : la trajectoire, la tirelire */
const climat08: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ink d="M14 6V104H226" t0={0} dur={600} class="vc-soft" />
      <Fade t0={300} class="vc-dash">
        <path d="M22 22L170 86" />
      </Fade>
      <Picto n="tirelire" x={168} y={52} size={52} t0={700} />
      <Ask x={244} y={20} h={64} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Transports ——— */

/** Les trois façons de se déplacer de l'accroche des transports, chacune dessinée quand la voix la dit */
const MODES: [RegExp, DessinName, number][] = [
  [/voiture/, 'voiture', 52],
  [/train/, 'train', 150],
  [/avion/, 'avion', 248],
]

/** 01 « Voiture, train ou avion ? » : trois pictogrammes, chacun quand la voix le dit ; puis, quand elle parle du
 *  premier secteur émetteur, les émissions des transports à la même échelle, la voiture comptée à « 55 % » */
const transports01: Board = p => {
  const chart = chartOf(p.segment)
  const [sector, share] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || chart.items.length < 2 || !sector || !share) return null
  const top = 76
  const count = !!share.shown
  const g = barres({
    items: chart.items.map((it, i) => ({ label: it.label, value: it.value, text: `${fr(it.value)}${NB}%`, tone: i === 0 && count ? ('count' as const) : undefined, shown: !!sector.shown })),
    y: top,
    size: 14,
    gap: 24,
    room: 60,
    labelSize: 14,
    t0: 200,
  })
  return (
    <Seg>
      <Art h={top + g.h + 6}>
        {MODES.map(([re, n, cx], i) => {
          const w = word(p, re)
          if (!w?.shown) return null
          return <Dessin key={n} n={n} x={cx - 30} y={2} size={60} t0={0} tone={i === 0 && count ? 'count' : undefined} />
        })}
        {sector.shown ? <Ink d={`M6 ${top - 8}H294`} t0={0} dur={500} class="vc-soft" /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 02 La moitié la plus modeste des ménages peut louer une voiture électrique, 100 à 200 euros par mois ; l'aide */
const transports02: Board = p => {
  const [half, rent, aid] = cuesOf(p)
  const month = word(p, /par mois/)
  const aidLine = word(p, /aidées chacune d’environ|aidées chacune d'environ/)
  return (
    <Seg>
      <Art h={176}>
        <Rang n={10} picto="personne" cols={10} max={24} gap={5} y={2} count={range(5)} shown={!!half?.shown} t0={100} stagger={60} />
        {half?.shown ? (
          <>
            <Brace x1={14} y1={32} x2={147} y2={32} side={1} tone="count" t0={300} />
            <Txt x={80} y={62} text={half.text} max={16} size={14} tone="count" t0={500} />
          </>
        ) : null}
        <Dessin n="voiture" x={170} y={30} size={96} t0={600} />
        {rent?.shown ? (
          <>
            <Txt x={218} y={140} text={rent.text} size={16} tone="count" t0={0} />
            {month ? <Txt x={218} y={158} text={month.text} size={14} tone="soft" t0={200} /> : null}
          </>
        ) : null}
        {aid?.shown ? (
          <>
            {aidLine ? <Txt x={14} y={128} text={aidLine.text} max={15} size={14} anchor="start" up t0={0} /> : null}
            <Txt x={14} y={150} text={aid.text} size={20} big anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Le train : 118 milliards de passagers-kilomètres, 4 % de plus ; un passager-kilomètre, une personne sur un
 *  kilomètre */
const transports03: Board = p => {
  const pct = cueOf(p, 1)
  const km = word(p, /sur un kilomètre/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Dessin n="train" x={6} y={6} size={104} t0={100} />
        {pct?.shown ? (
          <>
            <Picto n="hausse" x={116} y={24} size={34} tone="count" t0={0} w={1.2} />
            <Txt x={150} y={52} text={`+${pct.text}`} size={20} big anchor="start" tone="count" t0={200} />
          </>
        ) : null}
        {km?.shown ? (
          <>
            <Picto n="personne" x={124} y={70} size={34} t0={0} />
            <Arrow x1={164} y1={92} x2={290} y2={92} t0={200} />
            <Ink d="M164 86v12" t0={100} dur={200} class="vc-thin" />
            <Txt x={227} y={118} text={km.text} size={14} t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 15 lots sur plus de 50 attribués après mise en concurrence : une grille de cinquante cases */
const transports04: Board = p => {
  const [lots, of] = cuesOf(p)
  const k = num(lots?.text)
  const n = num(of?.text)
  if (!lots || !of || !k || !n || k >= n || n > 80) return null
  const cols = 10
  const size = 20
  const gap = 6
  const wGrid = cols * size + (cols - 1) * gap
  const x = (W - wGrid) / 2
  const rows = Math.ceil(n / cols)
  const hGrid = rows * (size + gap) - gap
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={hGrid + 40}>
        <Cases n={n} cols={cols} x={x} y={4} size={size} gap={gap} count={lots.shown ? range(k) : []} t0={200} stagger={12} />
        {lots.shown ? <Txt x={x} y={hGrid + 30} text={lots.text} size={16} anchor="start" tone="count" t0={300} /> : null}
        {of.shown ? <Txt x={x + wGrid} y={hGrid + 30} text={of.text} size={15} anchor="end" tone="soft" t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les villes reliées à Paris (Orly et Charles-de-Gaulle) par les vols intérieurs concernés, sur la carte de France */
const LIAISONS: [number, number][] = [
  VILLES.Nantes!,
  VILLES.Lyon!,
  VILLES.Bordeaux!,
  VILLES.Strasbourg!,
  VILLES.Lille!,
  [13.3, 17.7], // Rennes
  [31.8, 12], // Reims
]

/** 05 Un vol intérieur peut être interdit si le train fait le trajet en moins de 2 h 30 : huit liaisons */
const transports05: Board = p => {
  const [time, eight] = cuesOf(p)
  const S = 172 / 48
  const X = (u: number) => 6 + u * S
  const Y = (u: number) => 6 + u * S
  const [px, py] = VILLES.Paris!
  return (
    <Seg>
      <Art h={186}>
        <Picto n="carte_france" x={6} y={6} size={172} t0={100} />
        {LIAISONS.map(([x, y], i) => (
          <Fade key={i} t0={eight?.shown ? i * 100 : 1200} class={eight?.shown ? 'vc-count' : 'vc-ghost'}>
            <path d={`M${X(px).toFixed(1)} ${Y(py).toFixed(1)}L${X(x).toFixed(1)} ${Y(y).toFixed(1)}`} />
            <circle class={eight?.shown ? 'vc-tint-count' : undefined} cx={X(x)} cy={Y(y)} r={4.5} />
          </Fade>
        ))}
        <Fade t0={1000} class="vc-count">
          <circle class="vc-tint-count" cx={X(px)} cy={Y(py)} r={6} />
          <circle cx={X(px)} cy={Y(py)} r={6} />
        </Fade>
        <Dessin n="train" x={208} y={20} size={64} t0={500} />
        {time?.shown ? <Txt x={240} y={116} text={time.text} max={9} size={16} tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Les contrats historiques des autoroutes finissent entre 2031 et 2036 ; le réseau revient alors à l'État */
const transports06: Board = p => {
  const [span, state] = cuesOf(p)
  const years = yearsOf(span?.text ?? '')
  const etat = word(p, /l’État|l'État/)
  const a = years[0]
  const b = years[1]
  if (!span || !a || !b || b <= a) return null
  const from = a - 5
  const to = b + 2
  const f = frise({ y: 132, from, to, x0: 16, x1: 284, ticks: range(to - from + 1).map(k => from + k), t0: 200 })
  return (
    <Seg>
      <Art h={170}>
        <Dessin n="route" x={36} y={10} size={84} t0={100} />
        {state?.shown ? (
          <>
            <Arrow x1={118} y1={52} x2={176} y2={52} dash t0={0} />
            <Picto n="monument" x={186} y={10} size={84} tone="count" t0={200} />
            {etat ? <Txt x={228} y={108} text={etat.text} size={15} tone="count" t0={600} /> : null}
          </>
        ) : null}
        {f.el}
        {span.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={f.X(a)} y={122} width={f.X(b) - f.X(a)} height={20} />
              <path d={`M${f.X(a).toFixed(1)} 122H${f.X(b).toFixed(1)}V142H${f.X(a).toFixed(1)}Z`} />
            </Fade>
            <Txt x={f.X(a)} y={164} text={String(a)} size={15} tone="count" t0={200} />
            <Txt x={f.X(b)} y={164} text={String(b)} size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Les comptes 2024 des sociétés d'autoroutes : résultat net, investissements, impôt sur les sociétés, à la même
 *  échelle (le chiffre d'affaires, qui n'est pas dit, n'est pas dessiné) */
const transports07: Board = p => {
  const chart = chartOf(p.segment)
  const cues = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || cues.length < 3) return null
  const items = chart.items.filter(it => !/chiffre d’affaires|chiffre d'affaires/i.test(it.label))
  if (items.length !== cues.length) return null
  const g = barres({
    items: items.map((it, i) => ({ label: it.label, value: it.value, text: `${fr(it.value)}${NB}Md€`, shown: cues[i]!.shown })),
    y: 2,
    size: 22,
    gap: 30,
    room: 92,
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

/** 08 « Quelles priorités pour se déplacer ? » : une voiture et un train sur une même ligne, une question */
const transports08: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ink d="M10 100H230" t0={0} dur={600} class="vc-soft" />
      <Dessin n="voiture" x={16} y={36} size={76} t0={200} />
      <Dessin n="train" x={118} y={18} size={84} t0={600} />
      <Ask x={246} y={20} h={66} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Chaleur et eau ——— */

/** 01 L'été 2026, le plus chaud mesuré depuis 1900 : +3,6 °C ; comment s'y adapter ? */
const adaptation01: Board = p => {
  const gap = word(p, /[\d,]+ °C/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={130}>
        <Dessin n="soleil" x={148} y={0} size={56} t0={700} />
        <Picto n="thermometre" x={70} y={6} size={120} t0={100} />
        {gap?.shown ? <Txt x={166} y={104} text={`+${gap.text}`} size={24} big anchor="start" tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 53 jours de vague de chaleur (33 en 2022) ; 27 jours de danger très élevé de feux (13 en 2025) : deux paires de
 *  barres, à la même échelle, en jours */
const adaptation02: Board = p => {
  const [heat, fire] = cuesOf(p)
  const vh = num(heat?.text)
  const vf = num(fire?.text)
  const say = plain(p.segment.say)
  const h0 = /contre (\d+) en (\d{4})\./.exec(say)
  const f0 = /contre (\d+) en (\d{4})\.$/.exec(say)
  const year = yearsOf(p.segment.figure?.date ?? '')[0]
  const wh = word(p, /vague de chaleur/)
  const wf = word(p, /feux de forêt/)
  if (!heat || !fire || !vh || !vf || !h0 || !f0 || !year) return null
  const x0 = 50
  const k = (W - x0 - 96) / Math.max(vh, Number(h0[1]), vf, Number(f0[1]))
  const bar = (y: number, v: number, label: string, text: string, tone?: Tone) => (
    <g class={tone ? `vc-${tone}` : undefined}>
      <Txt x={x0 - 8} y={y + 16} text={label} size={14} anchor="end" tone="soft" t0={0} />
      <Fade t0={250}>
        <rect class={tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={x0} y={y} width={v * k} height={22} />
      </Fade>
      <Ink d={`M${x0} ${y}H${(x0 + v * k).toFixed(1)}V${y + 22}H${x0}Z`} t0={0} dur={600} />
      <Txt x={x0 + v * k + 8} y={y + 18} text={text} size={18} big anchor="start" t0={400} />
    </g>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        {wh ? <Txt x={x0} y={14} text={wh.text} size={14} anchor="start" t0={0} /> : null}
        {heat.shown ? bar(22, vh, String(year), heat.text, 'count') : null}
        {heard(p, `contre ${h0[1]}`) ? bar(52, Number(h0[1]), h0[2]!, h0[1]!) : null}
        {fire.shown ? (
          <>
            {wf ? <Txt x={x0} y={104} text={wf.text} size={14} anchor="start" t0={0} /> : null}
            {bar(112, vf, String(year), fire.text, 'count')}
          </>
        ) : null}
        {heard(p, `contre ${f0[1]}`) && fire.shown ? bar(142, Number(f0[1]), f0[2]!, f0[1]!) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Les décès en excès pendant les trois canicules de l'été : trois barres du graphique de la fiche, sans autre
 *  dessin */
const adaptation03: Board = p => {
  const chart = chartOf(p.segment)
  const cues = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || chart.items.length !== cues.length) return null
  const g = barres({
    items: chart.items.map((it, i) => ({ label: it.label, value: it.value, text: fr(it.value), shown: cues[i]!.shown })),
    y: 2,
    size: 22,
    gap: 30,
    room: 76,
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

/** 04 Le régime « Cat-Nat » : une maison sous un parapluie ; la surprime, environ 25 puis 40 euros par an */
const adaptation04: Board = p => {
  const [catnat, rate] = cuesOf(p)
  const say = plain(p.segment.say)
  const now = /environ (\d+) euros/.exec(say)
  const before = /au lieu de (\d+)/.exec(say)
  const year = yearsOf(p.segment.say)[0]
  const perYear = word(p, /par an/)
  if (!now || !before || !year) return null
  const vn = Number(now[1])
  const vb = Number(before[1])
  const shown = heard(p, now[0])
  const g = barres({
    items: [
      { label: `avant ${year}`, value: vb, text: `${vb}${NB}€`, shown },
      { label: String(year), value: vn, text: `${vn}${NB}€`, tone: 'count', shown },
    ],
    x: 124,
    w: 176,
    y: 26,
    size: 24,
    gap: 30,
    room: 54,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={150}>
        <Picto n="parapluie" x={14} y={0} size={86} t0={300} tone={catnat?.shown ? 'count' : undefined} />
        <Picto n="maison" x={26} y={66} size={70} t0={100} />
        {catnat?.shown ? <Txt x={57} y={146} text={catnat.text} size={15} tone="count" t0={0} /> : null}
        {rate?.shown ? g.el : null}
        {rate?.shown && perYear ? <Txt x={124} y={26 + g.h + 20} text={perYear.text} size={14} anchor="start" tone="soft" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 De juin à août, environ 60 % de l'eau consommée, 15 % du volume des cours d'eau : les douze mois, puis les
 *  deux barres du graphique de la fiche */
const adaptation05: Board = p => {
  const chart = chartOf(p.segment)
  const [cons, flow] = cuesOf(p)
  const months = word(p, /De juin à août|de juin à août/)
  if (!chart || chart.kind !== 'compare' || chart.items.length !== 2 || !cons || !flow) return null
  const cell = 20
  const gap = 3
  const x = (W - (12 * cell + 11 * gap)) / 2
  const g = barres({
    items: [
      { label: chart.items[0]!.label, value: chart.items[0]!.value, text: cons.text, tone: 'count', shown: cons.shown },
      { label: chart.items[1]!.label, value: chart.items[1]!.value, text: flow.text, shown: flow.shown },
    ],
    y: 64,
    size: 22,
    gap: 30,
    room: 120,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={64 + g.h + 6}>
        <Cases n={12} cols={12} x={x} y={4} size={cell} gap={gap} count={months?.shown ? [5, 6, 7] : []} t0={100} stagger={30} />
        {months?.shown ? <Txt x={x + 5 * (cell + gap) + (3 * cell + 2 * gap) / 2} y={46} text={bas(months.text)} size={14} tone="count" t0={300} /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 L'agriculture, 58 % de l'eau ; des retenues la stockent l'hiver au lieu de la prélever l'été ; mais l'eau
 *  d'hiver sera très variable d'une année à l'autre */
const adaptation06: Board = p => {
  const [agri, swap, vary] = cuesOf(p)
  const winter = word(p, /l’hiver|l'hiver/)
  const summer = word(p, /l’été|l'été/)
  const label = word(p, /L’agriculture|L'agriculture/)
  return (
    <Seg>
      <Art h={188}>
        {agri?.shown ? (
          <>
            <Txt x={W / 2} y={26} text={agri.text} size={22} big tone="count" t0={0} />
            {label ? <Txt x={W / 2} y={46} text={bas(label.text)} size={14} t0={200} /> : null}
          </>
        ) : null}
        <Dessin n="flocon" x={36} y={2} size={36} t0={300} tone="soft" />
        <Dessin n="retenue" x={6} y={56} size={110} t0={500} filled />
        {winter?.shown ? <Txt x={61} y={180} text={winter.text} size={15} t0={0} /> : null}
        <Dessin n="soleil" x={226} y={2} size={40} t0={900} tone="soft" />
        <Dessin n="champ" x={184} y={60} size={110} t0={1100} />
        {summer?.shown ? <Txt x={239} y={180} text={summer.text} size={15} t0={0} /> : null}
        {swap?.shown ? <Arrow x1={118} y1={112} x2={186} y2={112} tone="count" t0={0} /> : null}
        {vary?.shown ? (
          <Fade t0={0} class="vc-count vc-dash">
            <path d="M24 98H98M28 108H94M33 120H89" />
          </Fade>
        ) : null}
        {vary?.shown ? <Txt x={61} y={74} text={vary.text} size={15} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Au robinet, en régie ou confiée à un opérateur : 48 % de la population desservie en régie */
const adaptation07: Board = p => {
  const [regie, pct] = cuesOf(p)
  const v = num(pct?.text)
  const op = word(p, /un opérateur/)
  const pop = word(p, /de la population/)
  if (!regie || !pct || !v || v >= 100) return null
  const x0 = 86
  const x1 = 294
  const xs = x0 + ((x1 - x0) * v) / 100
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={112}>
        <Dessin n="robinet" x={4} y={14} size={72} t0={100} />
        <Ink d={`M${x0} 30H${x1}V62H${x0}Z`} t0={300} dur={700} />
        {regie.shown ? (
          <>
            <Txt x={x0} y={20} text={regie.text} size={15} anchor="start" t0={0} />
            {op ? <Txt x={x1} y={20} text={op.text} size={15} anchor="end" tone="soft" t0={200} /> : null}
            <Ink d={`M${xs.toFixed(1)} 26V66`} t0={0} dur={300} />
          </>
        ) : null}
        {pct.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={30} width={xs - x0} height={32} />
            </Fade>
            <Txt x={(x0 + xs) / 2} y={88} text={pct.text} size={20} big tone="count" t0={200} />
            {pop ? <Txt x={(x0 + x1) / 2} y={108} text={pop.text} size={14} tone="soft" t0={400} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Comment protéger la population, et comment gérer l'eau ? » : le thermomètre, une goutte, la question */
const adaptation08: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="thermometre" x={34} y={4} size={100} t0={100} />
      <Dessin n="goutte" x={124} y={20} size={80} t0={600} />
      <Ask x={222} y={18} h={70} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const ECOLOGIE_ENERGIE: Record<string, Board> = {
  'ecologie-intro-01': intro01,
  'ecologie-intro-02': intro02,
  'ecologie-intro-03': intro03,
  'ecologie-intro-04': intro04,
  'ecologie-intro-05': intro05,
  'ecologie-intro-06': intro06,
  'ecologie-carburants-01': carburants01,
  'ecologie-carburants-02': carburants02,
  'ecologie-carburants-03': carburants03,
  'ecologie-carburants-04': carburants04,
  'ecologie-carburants-05': carburants05,
  'ecologie-carburants-06': carburants06,
  'ecologie-carburants-07': carburants07,
  'ecologie-electricite-01': electricite01,
  'ecologie-electricite-02': electricite02,
  'ecologie-electricite-03': electricite03,
  'ecologie-electricite-04': electricite04,
  'ecologie-electricite-05': electricite05,
  'ecologie-electricite-06': electricite06,
  'ecologie-electricite-07': electricite07,
  'ecologie-electricite-08': electricite08,
  'ecologie-climat-01': climat01,
  'ecologie-climat-02': climat02,
  'ecologie-climat-03': climat03,
  'ecologie-climat-04': climat04,
  'ecologie-climat-05': climat05,
  'ecologie-climat-06': climat06,
  'ecologie-climat-07': climat07,
  'ecologie-climat-08': climat08,
  'ecologie-transports-01': transports01,
  'ecologie-transports-02': transports02,
  'ecologie-transports-03': transports03,
  'ecologie-transports-04': transports04,
  'ecologie-transports-05': transports05,
  'ecologie-transports-06': transports06,
  'ecologie-transports-07': transports07,
  'ecologie-transports-08': transports08,
  'ecologie-adaptation-01': adaptation01,
  'ecologie-adaptation-02': adaptation02,
  'ecologie-adaptation-03': adaptation03,
  'ecologie-adaptation-04': adaptation04,
  'ecologie-adaptation-05': adaptation05,
  'ecologie-adaptation-06': adaptation06,
  'ecologie-adaptation-07': adaptation07,
  'ecologie-adaptation-08': adaptation08,
}
