// Piste C, les planches de la série « Défense » (src/ui/videos/series/defense.ts) : un dessin par passage,
// composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Les mots et
// les nombres viennent du script (mots mis en valeur, phrases dites, chiffre de la fiche) : si le texte change,
// le dessin suit ; s'il ne s'y retrouve plus (une planche rend null), le passage prend le dessin générique.
// Cinq pictogrammes manquaient à la bibliothèque : ils sont dessinés ici, au trait, sans arme ni emblème
// (un bouclier, deux maillons de chaîne, un atome, un traité scellé, un globe). Les pays sont des fanions sans
// couleur (« drapeau » de la bibliothèque) ; aucun drapeau national ; la seule carte est le contour de la France
// (« carte_france » de la bibliothèque).

import type { ComponentChildren } from 'preact'
import { DEFENSE as SERIE } from '../../series/defense'
import { Art, Arrow, Ask, Brace, Fade, Ink, Marks, Txt, W, at, cls, cueOf, cuesOf, fold, heard, num, plain, said, sentenceWith, sentencesOf, word, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Question, Seg, Signature, Src, Sur100 } from '../dessin/mises'
import { Picto, pictoFor, type PictoName } from '../dessin/pictos'
import { Cases, Qui, Rang, balance, barres, colonnes, frise, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Les pictogrammes de la série ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/** Une ellipse de centre (cx, cy), inclinée de « deg » degrés */
function ellipse(cx: number, cy: number, rx: number, ry: number, deg = 0) {
  const a = (deg * Math.PI) / 180
  const dx = rx * Math.cos(a)
  const dy = rx * Math.sin(a)
  const p1 = `${(cx - dx).toFixed(1)} ${(cy - dy).toFixed(1)}`
  const p2 = `${(cx + dx).toFixed(1)} ${(cy + dy).toFixed(1)}`
  return `M${p1}A${rx} ${ry} ${deg} 1 0 ${p2}A${rx} ${ry} ${deg} 1 0 ${p1}`
}

interface Trace {
  /** Les traits, dans l'ordre de la main */
  s: string[]
  /** La silhouette, pour l'aplat au bleu bille */
  fill?: string
  thin?: number[]
  bold?: number[]
}

const BOUCLIER = 'M24 4L42 10V24C42 34 34 41 24 45C14 41 6 34 6 24V10Z'

/** Dans un carré de 48 unités, comme ceux de la bibliothèque */
const MIENS = {
  /** La défense : un bouclier nu, sans emblème */
  bouclier: { s: [BOUCLIER, 'M24 10V39'], fill: BOUCLIER, thin: [1] },
  /** Les alliances : deux maillons de chaîne */
  maillons: { s: ['M11 16H23a8 8 0 0 1 0 16H11a8 8 0 0 1 0-16Z', 'M25 16H37a8 8 0 0 1 0 16H25a8 8 0 0 1 0-16Z'] },
  /** Le nucléaire : un atome (noyau et trois orbites), le symbole de la physique, pas d'une arme */
  atome: {
    s: [ellipse(24, 24, 20, 7.5, 0), ellipse(24, 24, 20, 7.5, 60), ellipse(24, 24, 20, 7.5, 120), circle(24, 24, 2.6)],
    fill: circle(24, 24, 20),
    bold: [3],
  },
  /** Un traité : une page écrite, scellée */
  traite: {
    s: ['M10 4H38V44H10Z', 'M16 12H32M16 18H32M16 24H27', circle(29, 34, 5), 'M26.5 38.5L24 45M31.5 38.5L34 45'],
    fill: 'M10 4H38V44H10Z',
    thin: [1, 3],
  },
  /** Le monde : un globe, méridien et parallèles */
  globe: {
    s: [circle(24, 24, 19), 'M24 5C14 13 14 35 24 43C34 35 34 13 24 5', 'M5 24H43', 'M8 14H40M8 34H40'],
    fill: circle(24, 24, 19),
    thin: [1, 2, 3],
  },
} satisfies Record<string, Trace>

type Mien = keyof typeof MIENS
type Nom = PictoName | Mien

const isMien = (n: Nom): n is Mien => Object.prototype.hasOwnProperty.call(MIENS, n)

/** Un pictogramme, de la bibliothèque ou de la série ; mêmes gestes, mêmes tons que Picto */
function Icone({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1, step = 200 }: { n: Nom; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number; step?: number }) {
  if (!isMien(n)) return <Picto n={n} x={x} y={y} size={size} t0={t0} kept={kept} tone={tone} w={w} step={step} />
  const d: Trace = MIENS[n]
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
        <Ink key={i} d={path} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined} />
      ))}
    </g>
  )
}

/** Un pictogramme seul dans son SVG, pour les listes en HTML (questions, sommaire) */
const Glyphe = ({ n, t0 = 0 }: { n: Nom; t0?: number }) => (
  <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
    <Icone n={n} x={0} y={0} t0={t0} step={150} />
  </svg>
)

/** Le pictogramme d'une question ou d'une vidéo de la série, d'après ses mots */
const nomDe = (s: string): Nom =>
  /dépens|budget/i.test(s) ? 'pieces' : /alli/i.test(s) ? 'maillons' : /désarm/i.test(s) ? 'traite' : /dissuasion|nucléaire/i.test(s) ? 'atome' : (pictoFor(s) ?? 'document')

/* ——— Outils de la série ——— */

const MOTS: Record<string, number> = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11,
  douze: 12, treize: 13, quatorze: 14, quinze: 15, seize: 16, 'dix-sept': 17, 'dix-huit': 18, 'dix-neuf': 19,
  vingt: 20,
}

/** Le premier nombre d'un texte, en chiffres ou en lettres (« Dix-neuf États », « Aucun des neuf États ») */
function nombre(s: string | null | undefined): number | null {
  if (!s) return null
  if (/\d/.test(s)) return num(s)
  for (const w of s.toLowerCase().split(/[\s\u00a0\u202f,.;:]+/)) if (MOTS[w] !== undefined) return MOTS[w]!
  return null
}

const ORDINAUX: Record<string, number> = { deuxième: 2, troisième: 3, quatrième: 4, cinquième: 5 }

/** Une pile de « k » pièces vue de côté, posée sur « base » ; (x) : son bord gauche */
function pile(x: number, base: number, k: number, w = 36) {
  const r = w / 2
  let d = ''
  for (let j = 0; j < k; j++) d += `M${x} ${base - 6 * (j + 1)}v6a${r} 5 0 0 0 ${w} 0v-6`
  const top = base - 6 * k
  return `${d}M${x} ${top}a${r} 5 0 1 0 ${w} 0a${r} 5 0 1 0 ${-w} 0`
}

/** Un groupe en pointillé (cercle de protection, page restée blanche) */
const Dash = ({ d, tone, t0 = 0, kept }: { d: string; tone?: Tone; t0?: number; kept?: boolean }) => (
  <Fade t0={t0} kept={kept} class={cls('vc-dash', tone && `vc-${tone}`)}>
    <path d={d} />
  </Fade>
)

/** Un passage « question » : un petit dessin, puis la question dite */
const Demande = ({ p, h, children }: { p: P; h: number; children: ComponentChildren }) => (
  <Seg kind="ask">
    <Art h={h}>{children}</Art>
    <Question p={p} />
  </Seg>
)

/**
 * Une grandeur à deux dates (« 2,22 % en 2026… 1,82 % en 2014 ») : les nombres mis en valeur, chacun avec
 * l'année dite dans le même ordre, rangés de la plus ancienne à la plus récente ; la plus récente au bleu bille
 */
function deuxDates(p: P) {
  const cues = cuesOf(p).filter(c => num(c.text) !== null)
  const years = yearsOf(p.segment.say)
  if (cues.length !== 2 || years.length !== 2) return null
  const items = cues
    .map((c, i) => ({ year: years[i]!, value: num(c.text)!, text: c.text, shown: c.shown }))
    .sort((a, b) => a.year - b.year)
  const cols = colonnes({
    items: items.map((it, i) => ({ label: String(it.year), value: it.value, text: it.text, shown: it.shown, tone: i === 1 ? ('count' as const) : undefined })),
    x: 70,
    w: 160,
    h: 128,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Des pourcentages sur cent unités (« à peu près 3 sur 100 », « environ 83 % ») : le chiffre, la grille, la
 *  phrase qui le dit, la source */
function surCent(p: P, kind: 'carre' | 'piece', cueIndex: number) {
  const cue = cueOf(p, cueIndex)
  const k = num(cue?.text)
  if (!cue || !k || k > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind={kind} low={Math.round(k)} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 Une armée, des alliés, l'arme nucléaire : trois pictogrammes, quand la voix les nomme ; puis la question */
const intro01: Board = p => {
  const cues = cuesOf(p)
  const trois: [Nom, number][] = [
    ['bouclier', 50],
    ['maillons', 150],
    ['atome', 250],
  ]
  if (cues.length < trois.length) return null
  return (
    <Seg kind="ask">
      <Art h={128}>
        {trois.map(([n, cx], i) => {
          const c = cues[i]!
          return c.shown ? (
            <g key={n}>
              <Icone n={n} x={cx - 32} y={4} size={64} t0={0} />
              <Txt x={cx} y={96} text={c.text} size={15} max={11} t0={250} />
            </g>
          ) : null
        })}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 02 Les dépenses militaires augmentent en Europe : trois piles de pièces, de plus en plus hautes */
const intro02: Board = p => {
  const cue = cueOf(p, 1)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={140}>
        <Ink d="M14 132H230" t0={0} dur={500} class="vc-soft" />
        {[4, 7, 10].map((k, i) => (
          <Ink key={k} d={pile(36 + i * 64, 132, k)} t0={200 + i * 300} dur={700} />
        ))}
        {cue?.shown ? <Icone n="hausse" x={236} y={24} size={56} tone="count" t0={100} w={1.2} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 2,22 % du PIB en 2026, 1,82 % en 2014 : deux colonnes depuis zéro */
const intro03: Board = p => deuxDates(p)

/** 04 L'OTAN, 32 pays : une attaque contre l'un vaut contre tous (les fanions passent au bleu) */
const intro04: Board = p => {
  const [pays, tous] = cuesOf(p)
  const n = nombre(pays?.text)
  if (!pays || !n || n > 40) return null
  const attaque = word(p, /Une attaque armée/)
  const cols = 8
  const top = 36
  const { cells, h } = rangCells({ n, cols, max: 26, gap: 8, y: top })
  const hit = Math.floor(cols / 2) - 1
  const target = cells[hit]!
  const count = tous?.shown ? range(n) : attaque?.shown ? [hit] : []
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={top + h + 4}>
        <Rang n={n} picto="drapeau" cols={cols} max={26} gap={8} y={top} count={count} t0={100} stagger={30} />
        {attaque?.shown ? <Arrow x1={target.x - 40} y1={4} x2={target.x + 4} y2={top - 2} dash t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 150 milliards prêtés par l'Union aux États : une pile de pièces, des flèches vers les États */
const intro05: Board = p => (
  <Seg kind="fig">
    <Chiffre p={p} />
    <Art h={124}>
      <Picto n="pieces" x={126} y={0} size={48} t0={300} />
      {[30, 90, 150, 210, 270].map((cx, i) => (
        <g key={cx}>
          <Arrow x1={150} y1={54} x2={cx} y2={82} dash t0={900 + i * 120} />
          <Picto n="monument" x={cx - 18} y={86} size={36} t0={1000 + i * 120} />
        </g>
      ))}
    </Art>
    <Src p={p} />
  </Seg>
)

/** 06 Le seul pays de l'Union doté de l'arme nucléaire : un atome, et les mots */
const intro06: Board = p => {
  const seul = cueOf(p, 0)
  const ue = word(p, /le seul pays de l’Union|le seul pays de l'Union/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={108}>
        <Icone n="atome" x={36} y={4} size={100} tone={seul?.shown ? 'count' : undefined} t0={300} />
        {ue?.shown ? <Txt x={160} y={48} text={ue.text} size={16} max={15} anchor="start" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  const cues = cuesOf(p)
  return (
    <Seg kind="ask">
      <ul class="vc-panel" style={{ '--cols': '2' }}>
        {qs.map((q, i) => {
          const shown = heard(p, q.split(' ').slice(0, 2).join(' '))
          return (
            <li key={i} class={cls('vc-panel-item', shown ? 'vc-rise' : 'vc-wait')}>
              {shown ? <Glyphe n={nomDe(q)} t0={150} /> : <span class="vc-glyphe" />}
              <span class="vc-panel-text">
                <Marks text={q} cues={cues} />
              </span>
            </li>
          )
        })}
      </ul>
    </Seg>
  )
}

/** 08 Les sujets des vidéos qui suivent : le sommaire de la série, avec ses pictogrammes */
const intro08: Board = p => {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  if (!deep.length) return null
  const t0 = 200
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyphe n={nomDe(`${v.short} ${v.title}`)} t0={p.still ? 0 : t0 + i * 450 + 150} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Budget ——— */

/** 01 Se défendre a un coût : une pile de pièces, un bouclier, la question */
const budget01: Board = p => (
  <Demande p={p} h={118}>
    <Ink d="M14 110H206" t0={0} dur={500} class="vc-soft" />
    <Ink d={pile(26, 110, 9)} t0={200} dur={800} />
    <Icone n="bouclier" x={96} y={14} size={96} t0={700} />
    <Ask x={230} y={20} h={78} t0={1400} />
  </Demande>
)

/** 02 La loi de programmation militaire, de 2024 à 2030 : un document au-dessus des années qu'il couvre */
const budget02: Board = p => {
  const years = yearsOf(p.segment.say)
  if (years.length < 2) return null
  const a = Math.min(...years)
  const b = Math.max(...years)
  if (b - a > 12) return null
  const f = frise({ y: 110, from: a, to: b, x0: 30, x1: 270, ticks: range(b - a + 1).map(k => a + k), labels: [a, b], t0: 300 })
  const span = word(p, /\d{4} à \d{4}/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={140}>
        <Picto n="document" x={122} y={0} size={58} t0={100} />
        <Brace x1={30} y1={92} x2={270} y2={92} side={-1} t0={900} tone={span?.shown ? 'count' : undefined} />
        {f.el}
      </Art>
    </Seg>
  )
}

/** 03 436 milliards de 2024 à 2030, dont 36 ajoutés : une barre du total, la part ajoutée à la même échelle */
const budget03: Board = p => {
  const [tot, add] = cuesOf(p)
  const vt = num(tot?.text)
  const va = num(add?.text)
  if (!tot || !add || !vt || !va || va >= vt) return null
  const span = word(p, /de \d{4} à \d{4}/)
  const added = word(p, /\d+[\s\u00a0]milliards ajoutés[^.]*/)
  const x0 = 10
  const x1 = 290
  const cut = x0 + ((x1 - x0) * (vt - va)) / vt
  const y0 = 20
  const y1 = 54
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={118}>
        <Fade t0={500}>
          <rect class="vc-tint" x={x0} y={y0} width={cut - x0} height={y1 - y0} />
        </Fade>
        <Ink d={`M${x0} ${y0}H${x1}V${y1}H${x0}Z`} t0={100} dur={800} />
        {span ? <Txt x={x0 + 10} y={y0 + 23} text={span.text} size={15} anchor="start" t0={700} /> : null}
        {add.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={cut} y={y0} width={x1 - cut} height={y1 - y0} />
              <path d={`M${cut} ${y0}V${y1}`} />
            </Fade>
            <Brace x1={cut} y1={y1 + 6} x2={x1} y2={y1 + 6} tone="count" t0={200} />
            {added ? <Txt x={x1} y={y1 + 42} text={added.text} size={15} max={22} anchor="end" tone="count" t0={400} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 L'objectif : 2,5 % du PIB en 2030, 3,5 % en 2035 (des objectifs : en pointillé) */
const budget04: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  if (cues.length !== 2 || years.length !== 2) return null
  const obj = word(p, /objectif/)
  const cols = colonnes({
    items: cues.map((c, i) => ({ label: String(years[i]), value: num(c.text) ?? 0, text: c.text, ghost: true, shown: c.shown })),
    x: 70,
    w: 160,
    y: 30,
    h: 140,
    t0: 100,
  })
  return (
    <Seg>
      <Art h={30 + cols.h}>
        {obj ? <Txt x={W / 2} y={18} text={obj.text} size={16} tone="soft" /> : null}
        {cols.el}
      </Art>
    </Seg>
  )
}

/** 05 Où en est-on : 2,22 % en 2026, 1,82 % en 2014 */
const budget05: Board = p => deuxDates(p)

/** 06 Les alliés européens et le Canada, 2,53 % : à la même échelle que la France en 2014 et en 2026 (les
 *  deux nombres du passage précédent) */
const budget06: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const prev = p.script.segments[p.index - 1]
  const pe = prev?.emphasis ?? []
  const py = yearsOf(prev?.say ?? '')
  const allies = word(p, /alliés européens et du Canada/)
  const fr = said(p, /France/)
  if (!cue || !v || pe.length !== 2 || py.length !== 2 || !fr) return null
  const before = pe
    .map((t, i) => ({ year: py[i]!, value: num(t) ?? 0, text: t }))
    .sort((a, b) => a.year - b.year)
    .map(it => ({ label: `${fr}, ${it.year}`, value: it.value, text: it.text }))
  const g = barres({
    items: [...before, { label: allies?.text, value: v, text: cue.text, tone: 'count', shown: cue.shown }],
    y: 4,
    size: 22,
    gap: 30,
    room: 84,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Le nouvel objectif de l'OTAN, 5 % en 2035, contre 2 % avant : deux colonnes depuis zéro */
const budget07: Board = p => {
  const [nouveau, ancien] = cuesOf(p)
  const m = /PIB en (\d{4})/.exec(plain(p.segment.say))
  const prec = word(p, /précédent/)
  const vn = num(nouveau?.text)
  const vo = num(ancien?.text)
  if (!nouveau || !ancien || !m || !vn || !vo || !prec) return null
  const cols = colonnes({
    items: [
      { label: prec.text, value: vo, text: ancien.text, shown: ancien.shown },
      { label: m[1]!, value: vn, text: nouveau.text, tone: 'count', shown: nouveau.shown },
    ],
    x: 70,
    w: 160,
    h: 140,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Dans ces 5 % : 3,5 % pour la défense elle-même, 1,5 % pour la résilience et l'innovation */
const budget08: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const tot = word(p, /ces \d+(?:,\d+)?[\s\u00a0]%/)
  const vt = num(tot?.text)
  if (!a || !b || !va || !vb || !vt || Math.abs(va + vb - vt) > 0.01) return null
  const la = word(p, /la défense elle-même/)
  const lb = word(p, /la résilience[^.]*sécurité/)
  const k = 150 / vt
  const base = 180
  const x0 = 34
  const x1 = 100
  const ya = base - va * k
  const yt = base - vt * k
  return (
    <Seg>
      <Art h={190}>
        <Ink d={`M14 ${base}H120`} t0={0} dur={400} class="vc-soft" />
        <Txt x={(x0 + x1) / 2} y={yt - 8} text={tot!.text.replace(/^ces[\s\u00a0]/, '')} size={20} big t0={100} />
        {a.shown ? (
          <Fade t0={0} class="vc-count">
            <rect class="vc-tint-count" x={x0} y={ya} width={x1 - x0} height={base - ya} />
          </Fade>
        ) : null}
        {b.shown ? (
          <Fade t0={0}>
            <rect class="vc-tint" x={x0} y={yt} width={x1 - x0} height={ya - yt} />
          </Fade>
        ) : null}
        <Ink d={`M${x0} ${base}V${yt}H${x1}V${base}`} t0={200} dur={700} />
        <Ink d={`M${x0} ${ya}H${x1}`} t0={600} dur={300} />
        {a.shown ? (
          <>
            <Txt x={116} y={(ya + base) / 2 - 2} text={a.text} size={20} big anchor="start" tone="count" t0={100} />
            {la ? <Txt x={116} y={(ya + base) / 2 + 18} text={la.text} size={14} max={22} anchor="start" t0={300} /> : null}
          </>
        ) : null}
        {b.shown ? (
          <>
            <Txt x={116} y={yt + 16} text={b.text} size={20} big anchor="start" t0={100} />
            {lb ? <Txt x={116} y={yt + 36} text={lb.text} size={14} max={24} anchor="start" t0={300} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 « Quel effort de défense, et à quel rythme ? » : des pièces, une frise d'années, la question */
const budget09: Board = p => (
  <Demande p={p} h={110}>
    <Ink d="M14 98H232" t0={0} dur={700} />
    <Ink d={range(7).map(k => `M${66 + k * 26} 93v10`).join('')} t0={400} dur={400} class="vc-soft vc-thin" />
    <Ink d={pile(12, 98, 7)} t0={200} dur={700} />
    <Arrow x1={62} y1={58} x2={226} y2={34} dash t0={900} />
    <Ask x={244} y={18} h={68} t0={1300} />
  </Demande>
)

/* ——— Alliances ——— */

/** 01 « Si un pays de l'OTAN est attaqué, que font les autres ? » : des fanions, l'un visé */
const all01: Board = p => (
  <Demande p={p} h={118}>
    <Ink d="M10 112H290" t0={0} dur={500} class="vc-soft" />
    {[40, 95, 150, 205, 260].map((cx, i) => (
      <Picto key={cx} n="drapeau" x={cx - 12} y={64} size={48} t0={150 + i * 120} tone={i === 2 ? undefined : 'soft'} />
    ))}
    <Arrow x1={104} y1={14} x2={140} y2={60} dash t0={900} />
    <Ask x={190} y={6} h={46} t0={1300} />
  </Demande>
)

/** 02 L'article 5 : une attaque contre un allié est considérée comme dirigée contre tous */
const all02: Board = p => {
  const [, tous] = cuesOf(p)
  const attaque = word(p, /une attaque armée contre un allié/)
  const n = 8
  const top = 40
  const { cells, h } = rangCells({ n, max: 30, gap: 6, y: top })
  const t = cells[2]!
  const first = cells[0]!
  const last = cells[n - 1]!
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={top + h + 30}>
        <Rang n={n} picto="drapeau" max={30} gap={6} y={top} count={tous?.shown ? range(n) : []} t0={100} stagger={60} />
        {attaque?.shown ? <Arrow x1={t.x - 36} y1={4} x2={t.x + 6} y2={top - 2} dash t0={0} /> : null}
        {tous?.shown ? <Brace x1={first.x} y1={top + h + 8} x2={last.x + last.size} y2={top + h + 8} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Chaque allié assiste le pays attaqué, par l'action qu'il juge nécessaire : des flèches de longueurs
 *  différentes vers le fanion du centre */
const all03: Board = p => {
  const cue = cueOf(p, 0)
  const cx = 150
  const cy = 94
  const parts = [0.62, 0.4, 0.55, 0.3, 0.6, 0.45, 0.5]
  const allies = parts.map((f, i) => {
    const a = (i / parts.length) * 2 * Math.PI - Math.PI / 2
    return { x: cx + 122 * Math.cos(a), y: cy + 70 * Math.sin(a), f }
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={184}>
        <Picto n="drapeau" x={cx - 14} y={cy - 22} size={44} t0={100} />
        {allies.map((al, i) => (
          <Picto key={i} n="drapeau" x={al.x - 12} y={al.y - 14} size={28} t0={300 + i * 90} w={0.9} />
        ))}
        {cue?.shown
          ? allies.map((al, i) => {
              const dx = cx - al.x
              const dy = cy - al.y
              const sx = al.x + dx * 0.16
              const sy = al.y + dy * 0.16
              return <Arrow key={i} x1={sx} y1={sy} x2={sx + dx * al.f} y2={sy + dy * al.f} t0={i * 120} tone="count" head={6} />
            })
          : null}
      </Art>
    </Seg>
  )
}

/** 04 1949, 1966, 2009 : l'appartenance à l'OTAN, continue ; la structure militaire intégrée, quittée puis
 *  rejointe ; le Groupe des plans nucléaires, à part */
const all04: Board = p => {
  const [c49, c66, c09] = cuesOf(p)
  const y49 = yearsOf(c49?.text ?? '')[0]
  const y66 = yearsOf(c66?.text ?? '')[0]
  const y09 = yearsOf(c09?.text ?? '')[0]
  if (!c49 || !c66 || !c09 || !y49 || !y66 || !y09) return null
  const from = y49 - 3
  const to = y09 + 6
  const X = (y: number) => 22 + ((y - from) / (to - from)) * 258
  const membre = word(p, /Membre de l’OTAN|Membre de l'OTAN/)
  const structure = word(p, /sa structure militaire intégrée/)
  const gpn = word(p, /le Groupe des plans nucléaires/)
  const yA = 44
  const yB = 98
  return (
    <Seg>
      <Art h={176}>
        <Picto n="drapeau" x={X(y49) - 10} y={yA - 40} size={40} t0={100} />
        <Ink d={`M${X(y49)} ${yA}H280`} t0={200} dur={900} />
        {membre ? <Txt x={X(y49) + 30} y={yA - 10} text={membre.text} size={16} anchor="start" t0={400} /> : null}
        {structure?.shown ? <Txt x={X(y49)} y={yB - 10} text={structure.text} size={15} anchor="start" t0={0} /> : null}
        <Ink d={`M${X(y49)} ${yB}H${X(y66)}`} t0={300} dur={500} />
        {c66.shown ? (
          <>
            <Dash d={`M${X(y66)} ${yB}H${X(y09)}`} tone="soft" t0={100} />
            <Txt x={X(y66)} y={yB + 24} text={c66.text} size={16} t0={200} />
          </>
        ) : null}
        <Txt x={X(y49)} y={yB + 24} text={c49.text} size={16} t0={500} />
        {c09.shown ? (
          <>
            <Ink d={`M${X(y09)} ${yB}H280`} t0={100} dur={400} class="vc-count" />
            <Txt x={Math.min(X(y09), 280 - 40)} y={yB + 24} text={c09.text} size={16} tone="count" t0={200} />
          </>
        ) : null}
        {gpn?.shown ? (
          <>
            <Icone n="atome" x={X(y49) + 4} y={132} size={40} tone="soft" t0={0} />
            <Txt x={X(y49) + 54} y={149} text={gpn.text} size={15} max={24} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 150 milliards prêtés par l'Union ; dix-neuf États ont présenté des plans */
const all05: Board = p => {
  const cue = cueOf(p, 1)
  const n = nombre(cue?.text)
  if (!cue || !n || n > 40) return null
  const { h } = rangCells({ n, cols: 10, max: 24, gap: 6 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={n} picto="drapeau" cols={10} max={24} gap={6} y={2} count={range(n)} shown={cue.shown} t0={200} stagger={40} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Des achats communs à au moins deux pays ; au moins 65 % du coût des composants venu d'Europe */
const all06: Board = p => {
  const [deux, pct] = cuesOf(p)
  const k = num(pct?.text)
  if (!deux || !pct || !k || k > 100) return null
  const cap = word(p, /au moins \d+[\s\u00a0]%[^,]*composants/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={52}>
        <Picto n="drapeau" x={8} y={4} size={44} tone={deux.shown ? 'count' : undefined} t0={100} />
        <Picto n="drapeau" x={64} y={4} size={44} tone={deux.shown ? 'count' : undefined} t0={300} />
        {deux.shown ? (
          <>
            <Ink d="M42 40H74" t0={0} dur={300} class="vc-count" />
            <Txt x={118} y={34} text={deux.text} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
      <Sur100 p={p} kind="carre" low={Math.round(k)} caption={cap?.text ?? null} shown={pct.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 07 58 % des importations d'armes des pays européens de l'OTAN viennent des États-Unis, 7,4 % de France */
const all07: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const us = said(p, /États-Unis/)
  const fr = said(p, /France/)
  if (!a || !b || !va || !vb || !us || !fr) return null
  const g = barres({
    items: [
      { label: us, value: va, text: a.text, shown: a.shown },
      { label: fr, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 30,
    room: 84,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 D'un commun accord dans l'OTAN, à l'unanimité dans la défense européenne : deux tables de même taille */
const all08: Board = p => {
  const [a, b] = cuesOf(p)
  const otan = said(p, /OTAN/)
  const ue = word(p, /la défense européenne/)
  const cy = 88
  const table = (cx: number, title: string | null, label: string | null, shown: boolean, d: number) => (
    <g>
      {title ? <Txt x={cx} y={16} text={title} size={15} tone="soft" t0={d} /> : null}
      <Ink d={circle(cx, cy, 28)} t0={d + 100} dur={700} />
      {range(6).map(i => {
        const ang = (i / 6) * 2 * Math.PI - Math.PI / 2 + Math.PI / 6
        return <Picto key={i} n="drapeau" x={cx + 48 * Math.cos(ang) - 10} y={cy + 44 * Math.sin(ang) - 12} size={24} t0={d + 300 + i * 80} w={0.8} />
      })}
      {shown && label ? <Txt x={cx} y={164} text={label} size={15} max={14} t0={0} /> : null}
    </g>
  )
  return (
    <Seg>
      <Art h={186}>
        {table(75, otan, a?.text ?? null, !!a?.shown, 100)}
        {table(225, ue?.text ?? null, b?.text ?? null, !!b?.shown, 500)}
      </Art>
    </Seg>
  )
}

/** 09 « Sur quoi faire reposer d'abord la sécurité de la France ? » */
const all09: Board = p => (
  <Demande p={p} h={112}>
    <Icone n="maillons" x={8} y={34} size={56} t0={600} />
    <Icone n="bouclier" x={86} y={6} size={96} t0={100} />
    <Picto n="drapeau" x={186} y={44} size={52} t0={900} />
    <Ask x={250} y={16} h={72} t0={1300} />
  </Demande>
)

/* ——— Dissuasion ——— */

/** 01 « À quoi sert-elle, et qui peut décider de l'employer ? » : un atome, la question */
const d01: Board = p => (
  <Demande p={p} h={112}>
    <Icone n="atome" x={66} y={4} size={104} t0={100} />
    <Ask x={200} y={16} h={80} t0={1100} />
  </Demande>
)

/** 02 La dissuasion : un cercle de protection autour des intérêts vitaux de la France */
const d02: Board = p => {
  const dis = cueOf(p, 1)
  const vit = word(p, /intérêts vitaux de la France/)
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={196}>
        <Picto n="carte_france" x={90} y={22} size={120} t0={100} />
        {dis?.shown ? <Dash d={circle(150, 82, 80)} tone="count" t0={100} /> : null}
        {vit?.shown ? <Txt x={W / 2} y={188} text={vit.text} size={15} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Seul le président de la République décide : une seule personne, une seule clé */
const d03: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={118}>
        <Ink d="M20 114H280" t0={0} dur={500} class="vc-soft" />
        <Qui cx={118} base={112} size={96} t0={100} />
        {cue?.shown ? <Picto n="cle" x={176} y={36} size={76} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 290 ogives sur environ 9 745 : à peu près 3 sur 100 */
const d04: Board = p => surCent(p, 'carre', 1)

/** 05 7,4 milliards : un peu plus de 11 euros sur 100 des crédits de la mission Défense */
const d05: Board = p => surCent(p, 'piece', 1)

/** 06 Le partage nucléaire de l'OTAN, sur des armes américaines ; des accords comparables souhaités avec la
 *  France et le Royaume-Uni */
const d06: Board = p => {
  const [partage, frUk] = cuesOf(p)
  const us = word(p, /des armes américaines/)
  const fanions = [150, 186, 222, 258]
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={192}>
        <Icone n="atome" x={14} y={6} size={72} t0={100} />
        {us?.shown ? <Txt x={50} y={98} text={us.text} size={14} max={12} t0={0} /> : null}
        {fanions.map((x, i) => (
          <Picto key={x} n="drapeau" x={x - 8} y={20} size={34} t0={400 + i * 100} />
        ))}
        {partage?.shown ? <Arrow x1={92} y1={42} x2={134} y2={42} t0={200} /> : null}
        {frUk?.shown ? (
          <>
            <Icone n="atome" x={150} y={92} size={54} tone="soft" t0={0} />
            <Icone n="atome" x={222} y={92} size={54} tone="soft" t0={200} />
            <Arrow x1={212} y1={92} x2={212} y2={64} dash t0={500} />
            <Txt x={212} y={170} text={frUk.text} size={15} max={16} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 La « dissuasion avancée » : autour de la France, un cercle plus large, ouvert à des pays partenaires */
const d07: Board = p => {
  const cue = cueOf(p, 0)
  const quand = word(p, /En \S+ \d{4}/)
  const quoted = cue ? new RegExp(`«[\\s\\u00a0]*${cue.text}[\\s\\u00a0]*»`).test(p.segment.say) : false
  return (
    <Seg>
      <Head lines={[cue ? { text: quoted ? `«\u00a0${cue.text}\u00a0»` : cue.text, shown: cue.shown, mark: cue } : null]} />
      <Art h={182}>
        <Picto n="carte_france" x={36} y={48} size={80} t0={100} />
        <Dash d={circle(76, 88, 50)} tone="soft" t0={400} />
        {[160, 194, 228, 262].map((x, i) => (
          <Picto key={x} n="drapeau" x={x - 10} y={66} size={34} t0={600 + i * 100} />
        ))}
        {cue?.shown ? <Dash d={ellipse(152, 86, 140, 70)} tone="count" t0={200} /> : null}
        {quand ? <Txt x={W / 2} y={178} text={quand.text} size={14} tone="soft" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 08 Participer aux exercices, accueillir des forces, sans partager la décision : trois lignes */
const d08: Board = p => {
  const rows: [RegExp, Nom, Tone | undefined][] = [
    [/participer aux exercices nucléaires/, 'drapeau', undefined],
    [/accueillir des forces stratégiques françaises/, 'atome', undefined],
    [/la décision d’emploi ne sera pas partagée|la décision d'emploi ne sera pas partagée/, 'cle', 'count'],
  ]
  const list = rows.map(([re, n, tone]) => ({ w: word(p, re), n, tone }))
  if (list.some(r => !r.w)) return null
  const row = 66
  return (
    <Seg>
      <Art h={list.length * row - 10}>
        {list.map((r, i) =>
          r.w!.shown ? (
            <g key={i}>
              <Icone n={r.n} x={4} y={i * row} size={50} tone={r.tone} t0={0} />
              <Txt x={68} y={i * row + 22} text={r.w!.text} size={16} max={25} anchor="start" t0={200} />
            </g>
          ) : null,
        )}
      </Art>
    </Seg>
  )
}

/** 09 Dix pays associés, dont huit membres de l'Union : dix fanions, huit au bleu bille */
const d09: Board = p => {
  const [dix, huit] = cuesOf(p)
  const n = nombre(dix?.text)
  const k = nombre(huit?.text)
  if (!n || !k || k > n || n > 20) return null
  const ue = word(p, /membres de l’Union européenne|membres de l'Union européenne/)
  const { h } = rangCells({ n, cols: 5, max: 40, gap: 16 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 34}>
        <Rang n={n} picto="drapeau" cols={5} max={40} gap={16} y={2} count={range(k)} shown={!!huit?.shown} t0={200} />
        {huit?.shown && ue ? (
          <>
            <Fade t0={300} class="vc-count">
              <rect class="vc-tint-count" x={58} y={h + 14} width={14} height={14} />
              <path d={`M58 ${h + 14}h14v14h-14z`} />
            </Fade>
            <Txt x={80} y={h + 26} text={ue.text} size={14} anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 10 Le nombre de têtes va augmenter, et ne sera plus rendu public : un compteur qui monte, puis se cache */
const d10: Board = p => {
  const [up, secret] = cuesOf(p)
  const n = 8
  const more = 2
  const added = range(more).map(i => n - more + i)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={118}>
        {secret?.shown ? (
          <Cases n={n} cols={n} x={14} y={58} size={26} gap={8} ghost={range(n)} t0={0} />
        ) : (
          <Cases n={up?.shown ? n : n - more} cols={n} x={14} y={58} size={26} gap={8} count={up?.shown ? added : []} t0={100} />
        )}
        {up?.shown ? <Picto n="hausse" x={226} y={2} size={50} tone="count" t0={0} w={1.2} /> : null}
        {secret?.shown ? (
          <>
            <Fade t0={0}>
              <rect class="vc-paper" x={120} y={36} width={52} height={60} />
            </Fade>
            <Picto n="cadenas" x={118} y={34} size={56} t0={100} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 11 « Quel rôle pour la dissuasion française en Europe ? » */
const d11: Board = p => (
  <Demande p={p} h={116}>
    <Picto n="carte_france" x={10} y={14} size={84} t0={100} />
    <Dash d={circle(52, 56, 52)} tone="soft" t0={500} />
    {[132, 168, 204].map((x, i) => (
      <Picto key={x} n="drapeau" x={x - 10} y={44} size={36} t0={700 + i * 100} />
    ))}
    <Ask x={240} y={18} h={72} t0={1300} />
  </Demande>
)

/* ——— Désarmement ——— */

/** 01 « Combien d'armes nucléaires compte le monde ? Et des traités les limitent-ils ? » */
const r01: Board = p => (
  <Demande p={p} h={110}>
    <Icone n="globe" x={22} y={6} size={96} t0={100} />
    <Icone n="traite" x={136} y={14} size={84} t0={800} />
    <Ask x={240} y={16} h={74} t0={1500} />
  </Demande>
)

/** 02 Environ 9 745 ogives, dont environ 83 % à la Russie et aux États-Unis */
const r02: Board = p => surCent(p, 'carre', 1)

/** 03 Le traité New Start a expiré en février 2026, sans traité pour le remplacer */
const r03: Board = p => {
  const [, expire] = cuesOf(p)
  const sans = word(p, /Sans traité/)
  const when = word(p, /en \S+ \d{4}/)
  if (!when) return null
  const xm = 166
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Ink d="M10 116H290" t0={0} dur={600} class="vc-soft" />
        <Ink d={`M${xm} 108v16`} t0={400} dur={200} />
        <Icone n="traite" x={46} y={24} size={88} tone={expire?.shown ? 'ghost' : undefined} t0={200} />
        {expire?.shown ? <Txt x={xm} y={144} text={when.text} size={15} tone="count" t0={100} /> : null}
        {sans?.shown ? <Dash d="M206 32h56v76h-56z" tone="soft" t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 La conférence d'examen du TNP, sans document final, pour la troisième fois : des pages restées blanches */
const r04: Board = p => {
  const [, fois] = cuesOf(p)
  const n = Object.entries(ORDINAUX).find(([w]) => fold(fois?.text ?? '').includes(w))?.[1]
  const date = word(p, /le \d+[\s\u00a0]\S+ \d{4}/)
  const tnp = said(p, /TNP/)
  if (!n || n > 5 || !date) return null
  const pitch = 240 / n
  const xs = range(n).map(i => 30 + i * pitch + (pitch - 56) / 2)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Ink d="M10 112H290" t0={0} dur={600} class="vc-soft" />
        {tnp ? <Txt x={30} y={20} text={tnp} size={15} anchor="start" tone="soft" t0={100} /> : null}
        {xs.map((x, i) =>
          i < n - 1 || fois?.shown ? <Dash key={i} d={`M${x} 32h56v72h-56z`} tone={i === n - 1 ? 'count' : 'soft'} t0={200 + i * 300} /> : null,
        )}
        <Txt x={xs[n - 1]! + 28} y={140} text={date.text.replace(/^le[\s\u00a0]/, '')} size={15} t0={600} />
      </Art>
    </Seg>
  )
}

/** 05 Un traité de l'ONU, 75 États engagés : soixante-quinze fanions */
const r05: Board = p => {
  const cue = cueOf(p, 1)
  const n = num(cue?.text)
  if (!cue || !n || n > 150) return null
  const cols = 15
  const { h } = rangCells({ n, cols, max: 16, gap: 3 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 6}>
        <Rang n={n} picto="drapeau" cols={cols} max={16} gap={3} y={2} count={range(n)} shown={cue.shown} t0={100} stagger={12} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Aucun des neuf États dotés n'en fait partie ; l'Autriche, l'Irlande et Malte l'ont ratifié */
const r06: Board = p => {
  const [aucun, trois] = cuesOf(p)
  const n = nombre(aucun?.text)
  const noms = (trois?.text ?? '').split(/,[\s\u00a0]*|[\s\u00a0]+et[\s\u00a0]+/).filter(Boolean)
  const traite = said(p, /traité/)
  if (!aucun || !n || n > 12 || noms.length < 2 || noms.length > 4) return null
  const cx = 92
  const cy = 92
  const g = 3
  return (
    <Seg>
      <Art h={198}>
        <Ink d={circle(cx, cy, 78)} t0={100} dur={900} />
        {traite ? <Txt x={cx} y={192} text={traite} size={14} tone="soft" t0={500} /> : null}
        {trois?.shown
          ? noms.map((nm, i) => (
              <g key={nm}>
                <Picto n="drapeau" x={44} y={40 + i * 36} size={30} tone="count" t0={i * 200} />
                <Txt x={80} y={62 + i * 36} text={nm} size={15} anchor="start" t0={150 + i * 200} />
              </g>
            ))
          : null}
        {aucun.shown
          ? range(n).map(i => (
              <Icone key={i} n="atome" x={190 + (i % g) * 34} y={24 + Math.floor(i / g) * 34} size={30} tone="soft" t0={i * 60} />
            ))
          : null}
        {aucun.shown ? <Txt x={240} y={146} text={aucun.text} size={15} max={12} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 En Europe, la dissuasion française ; dans le monde, interdire ces armes : une balance, plateaux égaux */
const r07: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Icone n="atome" x={cx - 46} y={base - 48} size={46} t0={900} />
        <Picto n="drapeau" x={cx + 4} y={base - 44} size={42} t0={1100} />
      </>
    ),
    right: (cx, base) => <Icone n="traite" x={cx - 27} y={base - 56} size={54} t0={1200} />,
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

/** 08 « Quelle place pour l'arme nucléaire française, en Europe et dans le monde ? » */
const r08: Board = p => (
  <Demande p={p} h={110}>
    <Icone n="globe" x={26} y={8} size={92} t0={100} />
    <Icone n="atome" x={138} y={10} size={88} t0={700} />
    <Ask x={244} y={18} h={70} t0={1300} />
  </Demande>
)

/* ——— Le registre ——— */

export const DEFENSE: Record<string, Board> = {
  'defense-intro-01': intro01,
  'defense-intro-02': intro02,
  'defense-intro-03': intro03,
  'defense-intro-04': intro04,
  'defense-intro-05': intro05,
  'defense-intro-06': intro06,
  'defense-intro-07': intro07,
  'defense-intro-08': intro08,
  'defense-budget-01': budget01,
  'defense-budget-02': budget02,
  'defense-budget-03': budget03,
  'defense-budget-04': budget04,
  'defense-budget-05': budget05,
  'defense-budget-06': budget06,
  'defense-budget-07': budget07,
  'defense-budget-08': budget08,
  'defense-budget-09': budget09,
  'defense-alliances-01': all01,
  'defense-alliances-02': all02,
  'defense-alliances-03': all03,
  'defense-alliances-04': all04,
  'defense-alliances-05': all05,
  'defense-alliances-06': all06,
  'defense-alliances-07': all07,
  'defense-alliances-08': all08,
  'defense-alliances-09': all09,
  'defense-dissuasion-01': d01,
  'defense-dissuasion-02': d02,
  'defense-dissuasion-03': d03,
  'defense-dissuasion-04': d04,
  'defense-dissuasion-05': d05,
  'defense-dissuasion-06': d06,
  'defense-dissuasion-07': d07,
  'defense-dissuasion-08': d08,
  'defense-dissuasion-09': d09,
  'defense-dissuasion-10': d10,
  'defense-dissuasion-11': d11,
  'defense-desarmement-01': r01,
  'defense-desarmement-02': r02,
  'defense-desarmement-03': r03,
  'defense-desarmement-04': r04,
  'defense-desarmement-05': r05,
  'defense-desarmement-06': r06,
  'defense-desarmement-07': r07,
  'defense-desarmement-08': r08,
}
