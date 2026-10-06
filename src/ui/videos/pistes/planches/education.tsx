// Piste C, les planches de la série « École et jeunesse » (src/ui/videos/series/education.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Mêmes
// règles que « Retraites » et « Logement » : les mots et les nombres viennent du script (mots mis en valeur,
// phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus rend null, et le
// passage prend le dessin générique de sa sorte d'image.
// Quatre pictogrammes propres au thème (une école, le tableau d'une classe, une toque d'étudiant, un crayon) sont
// dessinés ici, au trait, sans attribut, comme ceux de la bibliothèque. Quelques étiquettes courtes et neutres
// sont écrites en dur quand le passage ne les dit pas (« France », « OCDE », « privé », « public », « élèves »,
// « classes ») : elles nomment ce qui est dessiné, et l'« alt » du passage les reprend.

import { chartOf } from '../../model'
import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Brace, Fade, Ink, Marks, Txt, W, at, capital, cls, cueOf, cuesOf, heard, num, plain, ratioOf, sentenceWith, sentencesOf, word, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Note, Question, Seg, Signature, Src, lineOf } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Disque, Plafond, Rang, Signe, balance, barres, colonnes, effets, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Un nombre à la française, pour une graduation tirée du graphique de la fiche (« 21 », « 8,7 ») */
const fr = (n: number) => String(n).replace('.', ',')

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
  /** Une école, bâtiment public plutôt que maison : un toit plat, un fronton et son horloge, une porte en arc,
   *  quatre fenêtres ; le sol à 44 */
  ecole: {
    s: ['M2 44H46', 'M5 44V21H43V44', 'M12 21L24 12L36 21', rond(24, 17.6, 2.2), 'M20 44V35a4 4 0 0 1 8 0V44', 'M9 26h6v6h-6zM33 26h6v6h-6zM9 35h6v5h-6zM33 35h6v5h-6z'],
    fill: 'M5 44V21H12L24 12L36 21H43V44Z',
    thin: [3, 5],
  },
  /** Le tableau d'une classe, sur ses pieds, deux lignes écrites à la craie */
  tableau: { s: ['M5 6H43V32H5Z', 'M10 32L7 44M38 32L41 44', 'M11 14h14M11 21h20'], fill: 'M5 6H43V32H5Z', thin: [2] },
  /** Une toque d'étudiant : le chapeau carré, son cordon */
  toque: { s: ['M24 10L45 18L24 26L3 18Z', 'M12 22V32C12 37 36 37 36 32V22', 'M45 18V31'], fill: 'M24 10L45 18L24 26L3 18Z', thin: [2] },
  /** Un crayon, la mine en bas à gauche */
  crayon: { s: ['M10 38L34 14L40 20L16 44L8 46Z', 'M10 38L16 44', 'M30 18L36 24'], thin: [1, 2] },
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
 *  vidéo) : le tableau de la classe, le livre, l'école (bâtiment, sans signe d'argent ni de camp), la toque, la
 *  personne */
function sujet(text: string): Nom {
  const t = text.toLowerCase()
  if (/classe/.test(t)) return 'tableau'
  if (/apprend|apprentissage/.test(t)) return 'livre'
  if (/privé/.test(t)) return 'ecole'
  if (/universit|recherche|supérieur/.test(t)) return 'toque'
  if (/jeune/.test(t)) return 'personne'
  return 'document'
}

/** Les questions de l'introduction, chacune avec son pictogramme, quand la voix la pose (comme Panel de mises.tsx) */
function Liste({ items, cols = 2 }: { items: { n: Nom; text: string; shown: boolean }[]; cols?: number }) {
  return (
    <ul class="vc-panel" style={{ '--cols': String(cols) }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyph n={it.n} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={[]} />
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
          <Glyph n={sujet(v.short)} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/* ——— Communs à la série ——— */

interface Ligne {
  label: string
  value: number
  /** La valeur écrite au bout, telle que le script la dit */
  text: string
  tone?: Tone
  shown?: boolean
}

/** Des barres horizontales étiquetées à gauche (« France », « OCDE »), depuis zéro, à la même échelle dans le
 *  groupe (ou à l'échelle « max » commune à plusieurs groupes) ; un titre au-dessus du groupe */
function lignes({ items, y = 0, max, title, x0 = 64, room = 56, size = 18, step = 26, t0 = 0 }: { items: Ligne[]; y?: number; max?: number; title?: string | null; x0?: number; room?: number; size?: number; step?: number; t0?: number }) {
  const top = Math.max(...items.map(i => i.value), max ?? 0) || 1
  const scale = (W - x0 - room) / top
  const y0 = y + (title ? 22 : 0)
  const el = (
    <>
      {title ? <Txt x={2} y={y + 14} text={title} size={14} anchor="start" tone="soft" t0={t0} /> : null}
      {items.map((it, i) => {
        if (it.shown === false) return null
        const ty = y0 + i * step
        const len = it.value * scale
        const d = t0 + i * 300
        return (
          <g key={i} class={it.tone && it.tone !== 'ghost' ? `vc-${it.tone}` : undefined}>
            <Txt x={x0 - 8} y={ty + size * 0.78} text={it.label} size={14} anchor="end" t0={d} />
            <Fade t0={d + 300}>
              <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={x0} y={ty} width={len} height={size} />
            </Fade>
            <Ink d={`M${x0} ${ty}H${x0 + len}V${ty + size}H${x0}Z`} t0={d} dur={600} />
            <Txt x={x0 + len + 6} y={ty + size * 0.84} text={it.text} size={18} big anchor="start" tone={it.tone === 'count' ? 'count' : undefined} t0={d + 450} />
          </g>
        )
      })}
    </>
  )
  return { el, h: y0 - y + (items.length - 1) * step + size }
}

/** « À peu près 1 sur 7 » : une rangée de n personnes, k comptées au bleu bille, et la phrase dite */
function unSur(p: P, i: number, picto: PictoName) {
  const cue = cueOf(p, i)
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const max = r.n > 7 ? 32 : 36
  const { h } = rangCells({ n: r.n, max, gap: 5, y: 4 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 8}>
        <Rang n={r.n} picto={picto} max={max} gap={5} y={4} count={range(r.k)} shown={cue.shown} t0={300} stagger={110} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** Deux grandeurs à la même échelle, depuis zéro, chacune sous son étiquette dite ; le chiffre de la fiche en tête */
function deux(p: P, la: RegExp, lb: RegExp, room = 96) {
  const [a, b] = cuesOf(p).slice(-2)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: word(p, la)?.text, value: va, text: a.text, shown: a.shown },
      { label: word(p, lb)?.text, value: vb, text: b.text, shown: b.shown },
    ],
    y: 4,
    size: 26,
    gap: 26,
    room,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** Une question de fin : quelques pictogrammes, un point d'interrogation, puis la question dite */
function fin(p: P, list: { n: Nom; size?: number }[]) {
  let x = 6
  return (
    <Seg kind="ask">
      <Art h={100}>
        {list.map((it, i) => {
          const size = it.size ?? 64
          const el = <Fig key={i} n={it.n} x={x} y={92 - size} size={size} t0={100 + i * 300} />
          x += size + 8
          return el
        })}
        <Ask x={Math.max(x + 16, 214)} y={14} h={72} t0={300 + list.length * 300} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Combien sont-ils, et qu'apprennent-ils ? » : un tableau marqué d'un point d'interrogation, l'enseignant,
 *  deux rangées d'élèves à leurs tables */
const intro01: Board = p => {
  const seats = [42, 96, 150, 204, 258]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={168}>
        <Ink d="M62 6H212V68H62Z" t0={100} dur={800} />
        <Ink d="M70 74H204" t0={600} dur={300} class="vc-thin vc-soft" />
        <Ask x={123} y={13} h={46} t0={1700} />
        <Picto n="personne" x={228} y={20} size={50} t0={700} />
        {[92, 130].map((y, r) => (
          <g key={y}>
            {seats.map((cx, i) => (
              <Picto key={cx} n="personne" x={cx - 14} y={y} size={28} t0={1000 + r * 400 + i * 80} w={0.9} />
            ))}
            <Ink d={seats.map(cx => `M${cx - 20} ${y + 30}h40`).join('')} t0={1100 + r * 400} dur={500} class="vc-soft" />
          </g>
        ))}
      </Art>
    </Seg>
  )
}

/** 02 20,7 élèves par classe, 2,8 de moins qu'en 2015 : deux barres à la même échelle, l'écart marqué */
const intro02: Board = p => {
  const [now, gap] = cuesOf(p)
  const v = num(now?.text)
  const d = num(gap?.text)
  const [yNow, yThen] = yearsOf(p.segment.say)
  if (!now || !gap || !v || !d || !yNow || !yThen) return null
  const g = barres({
    items: [
      { label: String(yThen), value: v + d },
      { label: String(yNow), value: v, shown: now.shown },
    ],
    y: 4,
    size: 26,
    gap: 26,
    room: 50,
    t0: 200,
  })
  const [a, b] = g.geo
  if (!a || !b) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 52}>
        {g.el}
        {gap.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M${a.x1} ${a.bottom}V${b.bottom + 6}`} />
            </Fade>
            <Brace x1={b.x1} y1={b.bottom + 8} x2={a.x1} y2={b.bottom + 8} tone="count" t0={200} />
            <Txt x={a.x1} y={b.bottom + 44} text={gap.text} size={15} anchor="end" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 PISA : la part d'élèves sous le niveau de base monte d'une marche, de 2015 à 2025 (+12 points). Sans axe :
 *  on ne connaît que la hausse. */
const intro03: Board = p => {
  const cue = cueOf(p, 1)
  const n = num(cue?.text)
  const years = [...new Set(yearsOf(p.segment.say))].sort((x, y) => x - y)
  const part = word(p, /la part d’élèves sous le niveau de base/)
  if (!cue || !n || years.length < 2) return null
  const base = 104
  const top = base - n * 4
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        {part ? <Txt x={8} y={16} text={part.text} max={22} size={14} anchor="start" tone="soft" t0={300} /> : null}
        <Ink d={`M14 ${base}H150`} t0={400} dur={600} />
        <Txt x={82} y={base + 28} text={String(years[0])} size={14} tone="soft" t0={500} />
        {cue.shown ? (
          <>
            <Ink d={`M150 ${base}V${top}H286`} t0={100} dur={800} class="vc-count" />
            <Brace x1={158} y1={base} x2={158} y2={top} t0={700} tone="count" />
            <Txt x={178} y={(base + top) / 2 + 6} text={`+${cue.text}`} size={18} big anchor="start" tone="count" t0={900} />
            <Txt x={218} y={base + 28} text={String(years[years.length - 1])} size={14} tone="soft" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 13,6 % des écoliers dans le privé : à peu près 1 sur 7 */
const intro04: Board = p => unSur(p, 1, 'personne')

/** 05 26 % des étudiants dans le privé, plus d'un sur quatre : le disque des étudiants, la part comptée */
const intro05: Board = p => {
  const cue = cueOf(p, 1)
  const pct = num(p.segment.figure?.value)
  const prive = word(p, /dans le privé/)
  const qui = word(p, /\d[\d ]* étudiants/)
  if (!cue || !pct || pct >= 100) return null
  const part = pct / 100
  const tip = partPoint(80, 80, 52, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={160}>
        <Disque cx={80} cy={80} r={74} part={part} shown={cue.shown} t0={300} />
        {qui ? <Txt x={172} y={124} text={qui.text} max={12} size={15} anchor="start" tone="soft" t0={600} /> : null}
        {cue.shown && prive ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L168 42`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={172} y={40} text={prive.text} size={16} anchor="start" tone="count" t0={500} />
            <Txt x={172} y={62} text={cue.text} max={14} size={15} anchor="start" t0={700} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 13,3 % des 15 à 29 ans ni en emploi, ni en études, ni en formation : plus d'un jeune sur huit */
const intro06: Board = p => unSur(p, 1, 'personne')

/** 07 Les cinq questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Liste cols={2} items={qs.map(q => ({ n: sujet(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')) }))} />
    </Seg>
  )
}

/** 08 Les cinq sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Taille des classes ——— */

/** 01 L'école primaire perd des élèves : l'école, une file d'élèves dont les derniers s'effacent */
const classes01: Board = p => {
  const [lose, ask] = cuesOf(p)
  const who = word(p, /l’école primaire perd des élèves/)
  const ground = 132
  return (
    <Seg>
      <Head lines={[who ? { text: capital(who.text), shown: who.shown, mark: lose } : lineOf(lose), lineOf(ask, true)]} />
      <Art h={140}>
        <Ink d={`M6 ${ground}H294`} t0={0} dur={600} class="vc-soft" />
        <Fig n="ecole" x={8} y={ground - 44 * (112 / 48)} size={112} t0={100} />
        {range(5).map(i => (
          <Picto key={i} n="personne" x={136 + i * 31} y={ground - 30 * (45 / 48)} size={30} t0={700 + i * 120} tone={lose?.shown && i >= 3 ? 'ghost' : undefined} />
        ))}
        <Ask x={196} y={8} h={58} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 De 6,15 millions d'élèves en 2025 à 5,22 millions en 2035 : deux colonnes, la projection en pointillé */
const classes02: Board = p => {
  const [, a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const ys = yearsOf(p.segment.say)
  const ref = yearsOf(p.segment.figure?.date ?? '')[0] ?? ys[0]
  const [y0, y1] = ys
  if (!a || !b || !va || !vb || !y0 || !y1 || !ref) return null
  const cols = colonnes({
    items: [
      { label: String(y0), value: va, text: a.text, shown: a.shown, ghost: y0 > ref },
      { label: String(y1), value: vb, text: b.text, shown: b.shown, ghost: y1 > ref },
    ],
    x: 60,
    w: 180,
    y: 6,
    h: 130,
    colW: 52,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={6 + cols.h}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 21 élèves par classe en France, autant que la moyenne de l'OCDE, 19 dans 25 pays de l'UE : trois barres,
 *  depuis le graphique de la fiche */
const classes03: Board = p => {
  const c = chartOf(p.segment)
  const [first, last] = cuesOf(p)
  if (!c || c.kind === 'part' || !first || !last) return null
  const g = barres({
    items: c.items.map((it, i) => ({ label: it.label, value: it.value, text: fr(it.value), shown: i < c.items.length - 1 ? first.shown : last.shown })),
    y: 4,
    size: 20,
    gap: 28,
    room: 40,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le plafond de 24 élèves, respecté par 95 % des classes publiques de CP : vingt classes sous un plafond,
 *  dix-neuf dessous (comptées), une au-dessus. Les hauteurs sont un dessin, pas des données. */
const classes04: Board = p => {
  const [cap, pct] = cuesOf(p)
  const n = num(pct?.text)
  if (!cap || !pct || !n) return null
  const total = 20
  const under = (total * n) / 100
  const overs = [13, 6, 17, 2].slice(0, total - under)
  if (!Number.isInteger(under) || under >= total || overs.length !== total - under) return null
  const base = 128
  const ceil = 40
  // Des hauteurs de classe au hasard (un dessin, pas des données), sous le plafond ; celles qui le dépassent, au-dessus
  const HAUTS = [62, 78, 55, 70, 81, 58, 74, 66, 50, 77, 69, 60, 79, 64, 72, 57, 80, 67, 75, 53]
  const hts = range(total).map(i => (overs.includes(i) ? 104 : HAUTS[i]!))
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 6}>
        <Ink d={`M4 ${base}H296`} t0={0} dur={500} class="vc-soft" />
        <Plafond x0={4} x1={296} y={ceil} t0={200} />
        {cap.shown ? <Txt x={6} y={20} text={cap.text} size={14} anchor="start" t0={300} /> : null}
        {range(total).map(i => {
          const x = 12 + i * 14
          const h = hts[i]!
          const d = `M${x} ${base}V${base - h}h9V${base}`
          return pct.shown && !overs.includes(i) ? (
            <g key={i} class="vc-count">
              <Fade t0={500 + i * 40}>
                <rect class="vc-tint-count" x={x} y={base - h} width={9} height={h} />
              </Fade>
              <Ink d={d} t0={300 + i * 40} dur={300} />
            </g>
          ) : (
            <Ink key={i} d={d} t0={300 + i * 40} dur={300} />
          )
        })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le dédoublement : un CP d'éducation prioritaire renforcée, 21,7 élèves en 2015, 12,8 en 2025 */
const classes05: Board = p => {
  const [, now, then] = cuesOf(p)
  const vNow = num(now?.text)
  const vThen = num(then?.text)
  const [yNow, yThen] = yearsOf(p.segment.say).slice(-2)
  if (!now || !then || !vNow || !vThen || !yNow || !yThen) return null
  const g = barres({
    items: [
      { label: String(yThen), value: vThen, text: then.text, shown: then.shown },
      { label: String(yNow), value: vNow, text: now.text, shown: now.shown, tone: 'count' },
    ],
    y: 4,
    size: 26,
    gap: 26,
    room: 110,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 L'effet des classes dédoublées : plus de progrès jusqu'en fin de CE1 d'un côté, l'écart qui n'est plus significatif
 *  à l'entrée en sixième de l'autre ; plateaux égaux, fléau à l'horizontale */
const classes06: Board = p => {
  const [a, b] = cuesOf(p)
  const left = word(p, /jusqu’en fin de CE1/)
  const right = word(p, /à l’entrée en sixième/)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="livre" x={cx - 30} y={base - 44} size={44} t0={900} />
        <Picto n="hausse" x={cx + 12} y={base - 70} size={30} t0={1200} w={1.2} />
      </>
    ),
    right: (cx, base) => (
      <Ink d={`M${cx - 24} ${base - 4}V${base - 44}h18V${base - 4}M${cx + 6} ${base - 4}V${base - 44}h18V${base - 4}`} t0={1400} dur={700} />
    ),
    labels: [a?.text ?? null, b?.text ?? null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h + 52}>
        {bal.el}
        {left?.shown ? <Txt x={66} y={bal.h + 24} text={left.text} max={14} size={14} tone="soft" /> : null}
        {right?.shown ? <Txt x={W - 66} y={bal.h + 24} text={right.text} max={14} size={14} tone="soft" /> : null}
      </Art>
    </Seg>
  )
}

/** 07 En dix ans (2015-2025, la date de la fiche sous le dessin), élèves et classes : les écoles rurales et
 *  l'éducation prioritaire, depuis une même ligne zéro (vers le bas : en moins ; vers le haut : en plus), à la même
 *  échelle */
const classes07: Board = p => {
  const say = plain(p.segment.say)
  const m = /perdu ([\d,]+) % d’élèves,? (?:et )?([\d,]+) % de classes.*?([\d,]+) % d’élèves en moins, mais ([\d,]+) % de classes en plus/.exec(say)
  const rural = word(p, /écoles publiques rurales/)
  const prio = word(p, /éducation prioritaire/)
  const v = (m?.slice(1, 5) ?? []).map(num)
  const [e1, c1, e2, c2] = v
  if (!m || !rural || !prio || !e1 || !c1 || !e2 || !c2) return null
  const Z = 124
  const k = 2.6
  const H = 212
  const groups = [
    { cx: 75, label: rural.text, shown: heard(p, rural.text), vals: [-e1, -c1] },
    { cx: 225, label: prio.text, shown: prio.shown, vals: [-e2, c2] },
  ]
  return (
    <Seg>
      <Art h={H}>
        <Ink d={`M8 ${Z}H292`} t0={0} dur={600} class="vc-soft" />
        {groups.map((g, gi) =>
          g.shown ? (
            <g key={gi}>
              <Txt x={g.cx} y={16} text={g.label} max={16} size={15} t0={100} />
              {g.vals.map((val, j) => {
                const x = g.cx + (j ? 11 : -41)
                const len = Math.abs(val) * k
                const sign = val < 0 ? '−' : '+'
                const d = 300 + j * 300
                return (
                  <g key={j} class={j ? 'vc-count' : undefined}>
                    <Fade t0={d + 250}>
                      <rect class={j ? 'vc-tint-count' : 'vc-tint'} x={x} y={val < 0 ? Z : Z - len} width={30} height={len} />
                    </Fade>
                    <Ink d={`M${x} ${Z}V${val < 0 ? Z + len : Z - len}H${x + 30}V${Z}`} t0={d} dur={500} />
                    <Txt x={x + 15} y={val < 0 ? Z + len + 18 : Z - len - 8} text={`${sign}${fr(Math.abs(val))}\u00a0%`} size={14} tone={j ? 'count' : undefined} t0={d + 400} />
                    <Txt x={x + 15} y={H - 4} text={j ? 'classes' : 'élèves'} size={14} tone="soft" t0={d} />
                  </g>
                )
              })}
            </g>
          ) : null,
        )}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Quelle taille pour les classes ? » : le tableau, trois élèves, un point d'interrogation */
const classes08: Board = p =>
  fin(p, [{ n: 'tableau', size: 72 }, { n: 'personne', size: 40 }, { n: 'personne', size: 40 }, { n: 'personne', size: 40 }])

/* ——— Apprentissages ——— */

/** 01 Lire, écrire, compter : un livre, un crayon, une question */
const app01: Board = p => {
  const [a, b] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(a), lineOf(b, true)]} />
      <Art h={116}>
        <Picto n="livre" x={20} y={8} size={100} t0={200} />
        <Fig n="crayon" x={128} y={14} size={90} t0={800} />
        <Ask x={236} y={18} h={74} t0={1400} />
      </Art>
    </Seg>
  )
}

/** 02 TIMSS : 484 points en CM1, contre 524 dans les pays de l'UE participants ; deux barres depuis zéro */
const app02: Board = p => deux(p, /les écoliers français/, /pays de l’Union européenne participants/, 104)

/** 03 L'écart selon le milieu social : 532 contre 451, à la même échelle, l'écart de 81 points marqué */
const app03: Board = p => {
  const [, hi, lo] = cuesOf(p)
  const vh = num(hi?.text)
  const vl = num(lo?.text)
  if (!hi || !lo || !vh || !vl) return null
  const g = barres({
    items: [
      { label: word(p, /très favorisés/)?.text, value: vh, text: hi.text, shown: hi.shown },
      { label: word(p, /très défavorisés/)?.text, value: vl, text: lo.text, shown: lo.shown },
    ],
    y: 4,
    size: 26,
    gap: 26,
    room: 60,
    t0: 200,
  })
  const [a, b] = g.geo
  if (!a || !b) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 30}>
        {g.el}
        {hi.shown && lo.shown ? (
          <>
            <Fade t0={600} class="vc-dash vc-soft">
              <path d={`M${a.x1} ${a.bottom}V${b.top}`} />
            </Fade>
            <Brace x1={b.x1} y1={b.bottom + 6} x2={a.x1} y2={b.bottom + 6} tone="count" t0={800} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Moins de jours de classe (162 contre 183), mais plus d'heures (864 contre 804) : deux paires de barres,
 *  chacune à sa propre échelle depuis zéro */
const app04: Board = p => {
  const say = plain(p.segment.say)
  const m1 = /en prévoit (\d+) par an, contre (\d+)/.exec(say)
  const m2 = /: (\d+) par an en élémentaire, contre (\d+)/.exec(say)
  const [jours, heures] = cuesOf(p)
  if (!m1 || !m2 || !jours || !heures) return null
  const pair = (m: RegExpExecArray, title: string, y: number, shown: boolean) =>
    lignes({
      title,
      items: [
        { label: 'France', value: Number(m[1]), text: m[1]!, shown },
        { label: 'OCDE', value: Number(m[2]), text: m[2]!, shown },
      ],
      y,
      t0: 200,
    })
  const g1 = pair(m1, 'jours de classe par an', 0, jours.shown)
  const g2 = pair(m2, 'heures par an', g1.h + 18, heures.shown)
  return (
    <Seg>
      <Head lines={[lineOf(jours), lineOf(heures)]} />
      <Art h={g1.h + 18 + g2.h + 4}>
        {g1.el}
        {heures.shown ? g2.el : null}
      </Art>
    </Seg>
  )
}

/** 05 Les vacances : l'été (environ 8 semaines, 8,7 dans l'OCDE), le total (16, contre 13,5) ; à la même échelle */
const app05: Board = p => {
  const say = plain(p.segment.say)
  const [ete, tot] = cuesOf(p)
  const m1 = /OCDE, ([\d,]+)\./.exec(say)
  const m2 = /contre ([\d,]+)\.$/.exec(say)
  const ve = num(ete?.text)
  const vt = num(tot?.text)
  const oe = num(m1?.[1])
  const ot = num(m2?.[1])
  const lEte = word(p, /vacances d’été/)
  if (!ete || !tot || !ve || !vt || !oe || !ot || !m1 || !m2) return null
  const max = Math.max(ve, vt, oe, ot)
  const g1 = lignes({
    title: lEte?.text,
    items: [
      { label: 'France', value: ve, text: `≈\u00a0${fr(ve)}` },
      { label: 'OCDE', value: oe, text: m1[1]! },
    ],
    max,
    t0: 200,
  })
  const g2 = lignes({
    title: 'congés au total',
    items: [
      { label: 'France', value: vt, text: fr(vt), tone: 'count' },
      { label: 'OCDE', value: ot, text: m2[1]! },
    ],
    max,
    y: g1.h + 16,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g1.h + 16 + g2.h + 4}>
        {g1.el}
        {tot.shown ? g2.el : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 59 % du temps d'instruction au français et aux mathématiques, contre 41 % dans l'OCDE : deux disques */
const app06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb || va >= 100 || vb >= 100) return null
  const side = (cx: number, part: number, cue: typeof a, label: string, t0: number) => (
    <>
      <Disque cx={cx} cy={60} r={54} part={part} shown={cue.shown} t0={t0} />
      {cue.shown ? <Txt x={cx} y={144} text={cue.text} size={20} big tone="count" t0={300} /> : null}
      <Txt x={cx} y={164} text={label} size={14} tone="soft" t0={t0 + 300} />
    </>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        {side(78, va / 100, a, 'France', 200)}
        {b.shown ? side(222, vb / 100, b, 'OCDE', 0) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Sur quoi agir d'abord ? » : le temps (un sablier), les contenus (un livre), l'aide aux élèves (une
 *  personne) ; un point d'interrogation */
const app07: Board = p => fin(p, [{ n: 'sablier', size: 58 }, { n: 'livre', size: 58 }, { n: 'personne', size: 58 }])

/* ——— Enseignement privé sous contrat ——— */

/** 01 « Qui la finance, et qui décide des inscriptions ? » : l'école, des pièces d'un côté, un registre de l'autre */
const prive01: Board = p => {
  const [a, b] = cuesOf(p)
  const ground = 132
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={140}>
        <Ink d={`M6 ${ground}H294`} t0={0} dur={600} class="vc-soft" />
        <Fig n="ecole" x={96} y={ground - 44 * (108 / 48)} size={108} t0={100} />
        {a?.shown ? (
          <>
            <Picto n="pieces" x={14} y={ground - 60} size={56} t0={0} />
            <Ask x={30} y={20} h={38} t0={300} />
          </>
        ) : null}
        {b?.shown ? (
          <>
            <Picto n="document" x={228} y={ground - 60} size={56} t0={0} />
            <Ask x={246} y={20} h={38} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 L'État paie les enseignants ; mais l'école privée décide de ses inscriptions, hors de la carte scolaire, qui
 *  fixe l'école publique selon l'adresse */
const prive02: Board = p => {
  const [paie, insc, carte] = cuesOf(p)
  const houses: [number, number][] = [
    [34, 114],
    [92, 112],
    [34, 160],
    [94, 160],
  ]
  return (
    <Seg>
      <Art h={214}>
        <Picto n="monument" x={6} y={4} size={60} t0={100} />
        <Arrow x1={74} y1={36} x2={126} y2={36} t0={700} tone={paie?.shown ? 'count' : undefined} />
        {paie?.shown ? <Picto n="piece" x={90} y={12} size={20} tone="count" t0={200} w={0.8} /> : null}
        <Picto n="personne" x={134} y={10} size={52} t0={900} />
        {paie?.shown ? <Txt x={194} y={30} text={paie.text} max={14} size={14} anchor="start" t0={300} /> : null}
        <Fade t0={1200} class="vc-dash vc-soft">
          <path d="M6 88H294" />
        </Fade>
        <Fade t0={1400} class={cls('vc-dash', !carte?.shown && 'vc-soft', carte?.shown && 'vc-count')}>
          <path d={rond(72, 146, 44)} />
        </Fade>
        <Fig n="ecole" x={52} y={160 - 44 * (40 / 48)} size={40} t0={1500} />
        {houses.map(([x, y], i) => (
          <Picto key={i} n="maison" x={x} y={y} size={18} t0={1700 + i * 120} w={0.8} />
        ))}
        {carte?.shown ? <Txt x={72} y={208} text={carte.text} size={14} tone="count" t0={200} /> : null}
        <Fig n="ecole" x={196} y={176 - 44 * (52 / 48)} size={52} t0={1600} />
        <Picto n="document" x={250} y={132} size={34} t0={1900} tone={insc?.shown ? 'count' : undefined} />
        {insc?.shown ? <Txt x={232} y={208} text={insc.text} size={14} t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 L'État apporte 55 % du financement à l'école, 68 % au collège et au lycée : deux disques */
const prive03: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /à l’école/)
  const lb = word(p, /au collège et au lycée/)
  if (!a || !b || !va || !vb || va >= 100 || vb >= 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={164}>
        <Disque cx={75} cy={58} r={54} part={va / 100} shown={a.shown} t0={200} />
        <Disque cx={225} cy={58} r={54} part={vb / 100} shown={b.shown} t0={500} />
        {la ? <Txt x={75} y={136} text={la.text} max={14} size={15} t0={600} /> : null}
        {lb ? <Txt x={225} y={136} text={lb.text} max={14} size={15} t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 8 871 millions d'euros, 9,9 % du budget de l'enseignement scolaire : le disque du budget, la part comptée */
const prive04: Board = p => {
  const cue = cueOf(p, 1)
  const v = num(cue?.text)
  const whole = word(p, /du budget de l’enseignement scolaire/)
  if (!cue || !v || v >= 100) return null
  const part = v / 100
  const tip = partPoint(80, 76, 50, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={156}>
        <Disque cx={80} cy={76} r={72} part={part} shown={cue.shown} t0={300} />
        {cue.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L170 34`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={174} y={40} text={cue.text} size={22} big anchor="start" tone="count" t0={500} />
          </>
        ) : null}
        {whole ? <Txt x={174} y={72} text={whole.text} max={15} size={14} anchor="start" tone="soft" t0={800} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'origine sociale des collégiens, privé sous contrat et public : deux paires de barres à la même échelle */
const prive05: Board = p => {
  const say = plain(p.segment.say)
  const m1 = /(\d+) % des élèves du privé sous contrat sont de milieu favorisé ou très favorisé, contre (\d+) %/.exec(say)
  const m2 = /De milieu défavorisé : (\d+) %, contre (\d+) %/.exec(say)
  const [, def] = cuesOf(p)
  const t1 = word(p, /de milieu favorisé ou très favorisé/)
  const t2 = word(p, /De milieu défavorisé/)
  if (!m1 || !m2 || !def) return null
  const n = [m1[1], m1[2], m2[1], m2[2]].map(Number)
  const max = Math.max(...n)
  const pair = (m: RegExpExecArray, title: string | undefined, y: number, shown = true) =>
    lignes({
      title,
      items: [
        { label: 'privé', value: Number(m[1]), text: `${m[1]}\u00a0%`, shown },
        { label: 'public', value: Number(m[2]), text: `${m[2]}\u00a0%`, shown },
      ],
      max,
      y,
      t0: 200,
    })
  const g1 = pair(m1, t1?.text, 0)
  const g2 = pair(m2, t2?.text.toLowerCase(), g1.h + 16, def.shown)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g1.h + 16 + g2.h + 4}>
        {g1.el}
        {g2.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 « La recherche ne permet pas d'établir que le privé fait plus progresser ses élèves que le public, ni
 *  moins » : une balance à l'équilibre, une école de chaque côté ; dessous, la phrase dite */
const prive06: Board = p => {
  const pr = word(p, /le privé/)
  const pu = word(p, /le public/)
  const last = cuesOf(p)[2]
  const ecole = (cx: number, base: number, t0: number) => <Fig n="ecole" x={cx - 26} y={base - 44 * (52 / 48)} size={52} t0={t0} />
  const bal = balance({
    left: (cx, base) => ecole(cx, base, 900),
    right: (cx, base) => ecole(cx, base, 1300),
    labels: [pr?.text ?? null, pu?.text ?? null],
    shown: [true, true],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
      <Note p={p} text={last ? sentenceWith(p.segment.say, last.text) : null} />
    </Seg>
  )
}

/** 07 « Quelles règles pour le financement public du privé sous contrat ? » */
const prive07: Board = p => fin(p, [{ n: 'ecole', size: 84 }, { n: 'piece', size: 40 }])

/* ——— Université et recherche ——— */

/** 01 Après le bac : une toque, des pièces, une question */
const sup01: Board = p => {
  const [a, b] = cuesOf(p)
  return (
    <Seg>
      <Head lines={[lineOf(a), lineOf(b, true)]} />
      <Art h={110}>
        <Fig n="toque" x={20} y={4} size={110} t0={200} />
        <Picto n="pieces" x={148} y={34} size={70} t0={900} />
        <Ask x={240} y={18} h={72} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 Parcoursup : 97 % en bac général, 92 % en technologique, 83 % en professionnel, sur une échelle de 0 à 100 */
const sup02: Board = p => {
  const m = /(\d+) % en bac général, (\d+) % en technologique, (\d+) % en professionnel/.exec(plain(p.segment.say))
  const labels = [word(p, /bac général/), word(p, /technologique/), word(p, /professionnel/)]
  if (!m) return null
  const g = barres({
    items: [1, 2, 3].map((k, i) => {
      const l = labels[i]
      return { label: l ? (i ? `bac ${l.text}` : l.text) : undefined, value: Number(m[k]), text: `${m[k]}\u00a0%`, shown: !!l?.shown }
    }),
    y: 4,
    size: 20,
    gap: 26,
    room: 60,
    max: 100,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Depuis 2010, +76,1 % d'étudiants dans le privé, +19 % dans le public : deux barres ; dessous, 2025 */
const sup03: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const after = sentencesOf(p.segment.say).find(s => /^En \d{4}/.test(s))
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: 'privé', value: va, text: `+${a.text}`, shown: a.shown },
      { label: 'public', value: vb, text: `+${b.text}`, shown: b.shown },
    ],
    y: 4,
    size: 24,
    gap: 22,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Note p={p} text={after} />
      <Src p={p} />
    </Seg>
  )
}

/** 04 La dépense par étudiant à l'université : 12 870 € en 2010, 11 540 € en 2020, 12 460 € en 2024 */
const sup04: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  if (cues.length !== 3 || years.length !== 3) return null
  const items = cues
    .map((c, i) => ({ year: years[i]!, value: num(c.text) ?? 0, text: c.text.replace(/[\s\u00a0]euros$/, ''), shown: c.shown }))
    .sort((x, y) => x.year - y.year)
  if (items.some(i => !i.value)) return null
  const cols = colonnes({
    items: items.map(i => ({ label: String(i.year), value: i.value, text: i.text, shown: i.shown })),
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

/** 05 Les droits d'inscription : le chiffre de la fiche, puis deux étiquettes, 178 € en licence, 255 € en master */
const sup05: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const lic = word(p, /en licence/)
  const mas = word(p, /en master/)
  if (!a || !b || !va || !vb) return null
  const tag = (cx: number, v: number, label: string | undefined, shown: boolean, t0: number) => (
    <>
      <Picto n="etiquette" x={cx - 55} y={-18} size={110} t0={t0} text={`${fr(v)}\u00a0€`} tone={shown ? 'count' : undefined} />
      {label && shown ? <Txt x={cx} y={92} text={label} size={15} t0={300} /> : null}
    </>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={100}>
        {tag(78, va, lic?.text, a.shown, 200)}
        {tag(222, vb, mas?.text, b.shown, 700)}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 La recherche et développement, 2,18 % du PIB : une barre coupée en deux, les entreprises (1,44 point) et
 *  les administrations (0,74) */
const sup06: Board = p => {
  const [, ent, adm] = cuesOf(p)
  const ve = num(ent?.text)
  const va = num(adm?.text)
  const le = word(p, /Les entreprises/)
  const la = word(p, /les administrations/)
  if (!ent || !adm || !ve || !va) return null
  const L = 276
  const x0 = 12
  const xe = x0 + (L * ve) / (ve + va)
  const y = 18
  const hb = 30
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={128}>
        <Fade t0={500}>
          <rect class="vc-tint" x={x0} y={y} width={L} height={hb} />
        </Fade>
        <Ink d={`M${x0} ${y}H${x0 + L}V${y + hb}H${x0}Z`} t0={200} dur={800} />
        {ent.shown ? (
          <>
            <Ink d={`M${xe.toFixed(1)} ${y - 6}V${y + hb + 6}`} t0={0} dur={300} class="vc-bold" />
            {le ? <Txt x={(x0 + xe) / 2} y={y + hb + 26} text={le.text.toLowerCase()} max={16} size={15} t0={100} /> : null}
            <Txt x={(x0 + xe) / 2} y={y + hb + 70} text={ent.text} size={20} big t0={300} />
          </>
        ) : null}
        {adm.shown ? (
          <>
            {la ? <Txt x={(xe + x0 + L) / 2} y={y + hb + 26} text={la.text} max={12} size={15} t0={100} /> : null}
            <Txt x={(xe + x0 + L) / 2} y={y + hb + 70} text={adm.text} size={20} big t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 L'appel à projets de l'ANR : 1 737 projets retenus sur 7 665 éligibles, à la même échelle */
const sup07: Board = p => {
  const [, ret, elig] = cuesOf(p)
  const vr = num(ret?.text)
  const ve = num(elig?.text)
  if (!ret || !elig || !vr || !ve) return null
  const g = barres({
    items: [
      { label: 'projets éligibles', value: ve, text: elig.text, shown: ret.shown },
      { label: 'projets retenus', value: vr, text: ret.text.replace(/[\s\u00a0]projets$/, ''), tone: 'count', shown: ret.shown },
    ],
    y: 4,
    size: 24,
    gap: 22,
    room: 64,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 8}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Quelle priorité pour l'université et la recherche publique ? » */
const sup08: Board = p => fin(p, [{ n: 'toque', size: 80 }, { n: 'livre', size: 60 }])

/* ——— Jeunes ——— */

/** 01 Après l'école, avant un emploi stable : un chemin de l'école à une mallette, une personne au milieu */
const jeunes01: Board = p => {
  const ground = 112
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={120}>
        <Ink d={`M6 ${ground}H294`} t0={0} dur={600} class="vc-soft" />
        <Fig n="ecole" x={6} y={ground - 44 * (66 / 48)} size={66} t0={100} />
        <Arrow x1={80} y1={ground - 4} x2={224} y2={ground - 4} dash t0={700} />
        <Picto n="personne" x={124} y={ground - 54} size={52} t0={900} />
        <Ask x={168} y={2} h={46} t0={1500} />
        <Picto n="mallette" x={230} y={ground - 54} size={58} t0={1200} />
      </Art>
    </Seg>
  )
}

/** 02 Le taux de pauvreté : 18,6 % des 18 à 29 ans, 15,4 % de l'ensemble de la population */
const jeunes02: Board = p => deux(p, /18 à 29 ans/, /l’ensemble de la population/, 84)

/** 03 Le RSA avant 25 ans : les parents, deux ans de travail à temps plein ; les étudiants, sauf exceptions */
const jeunes03: Board = p => {
  const [avant] = cuesOf(p)
  const parents = word(p, /aux parents et futurs parents/)
  const travail = word(p, /deux ans à temps plein/)
  const etud = word(p, /Les étudiants n’y ont pas droit, sauf exceptions/)
  if (!parents || !travail || !etud) return null
  const ef = effets({
    items: [
      { picto: 'personne', text: parents.text, shown: parents.shown },
      { picto: 'mallette', text: travail.text, shown: travail.shown },
      { picto: 'livre', text: etud.text, shown: etud.shown },
    ],
    x: 8,
    w: 292,
    row: 64,
    t0: 200,
  })
  return (
    <Seg>
      <Head lines={[lineOf(avant)]} />
      <Art h={ef.h + 6}>{ef.el}</Art>
    </Seg>
  )
}

/** Deux pictogrammes légendés par des mots dits (la durée, le montant), le chiffre de la fiche en tête */
function deuxSignes(p: P, a: [PictoName, RegExp], b: [PictoName, RegExp]) {
  const la = word(p, a[1])
  const lb = word(p, b[1])
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Signe n={a[0]} cx={75} y={4} size={64} label={la?.text} shown={!!la?.shown} max={17} t0={200} />
        <Signe n={b[0]} cx={225} y={4} size={64} label={lb?.text} shown={!!lb?.shown} max={13} t0={700} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le contrat d'engagement jeune : 15 à 20 heures d'accompagnement par semaine, jusqu'à 566,17 € par mois */
const jeunes04: Board = p => deuxSignes(p, ['sablier', /15 à 20 heures d’accompagnement par semaine/], ['portemonnaie', /jusqu’à 566,17 euros par mois/])

/** 05 Le service civique : de 6 mois à 1 an, au moins 619,83 € par mois ; 149 878 jeunes en 2024 */
const jeunes05: Board = p => deuxSignes(p, ['calendrier', /de 6 mois à 1 an/], ['billet', /au moins 619,83 euros par mois/])

/** 06 Les boursiers sur critères sociaux : 2,6 % de moins en un an (un étudiant, une flèche qui descend), le barème
 *  d'éligibilité qui n'a pas été revalorisé (un barème au trait) ; chaque ligne quand la voix la dit */
const jeunes06: Board = p => {
  const moins = word(p, /\d+,\d+ % de moins en un an/)
  const bareme = word(p, /le barème d’éligibilité n’a pas été revalorisé/)
  if (!moins || !bareme) return null
  const ef = effets({
    items: [
      { picto: 'personne', dir: 'baisse', text: moins.text, shown: moins.shown },
      { picto: 'document', text: bareme.text, shown: bareme.shown },
    ],
    x: 8,
    w: 292,
    row: 64,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={ef.h + 6}>{ef.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Pour les jeunes, quelle mesure faire passer en premier ? » */
const jeunes07: Board = p => fin(p, [{ n: 'personne', size: 64 }, { n: 'mallette', size: 52 }, { n: 'livre', size: 52 }])

/* ——— Le registre ——— */

export const EDUCATION: Record<string, Board> = {
  'ecole-intro-01': intro01,
  'ecole-intro-02': intro02,
  'ecole-intro-03': intro03,
  'ecole-intro-04': intro04,
  'ecole-intro-05': intro05,
  'ecole-intro-06': intro06,
  'ecole-intro-07': intro07,
  'ecole-intro-08': intro08,
  'ecole-classes-01': classes01,
  'ecole-classes-02': classes02,
  'ecole-classes-03': classes03,
  'ecole-classes-04': classes04,
  'ecole-classes-05': classes05,
  'ecole-classes-06': classes06,
  'ecole-classes-07': classes07,
  'ecole-classes-08': classes08,
  'ecole-apprentissages-01': app01,
  'ecole-apprentissages-02': app02,
  'ecole-apprentissages-03': app03,
  'ecole-apprentissages-04': app04,
  'ecole-apprentissages-05': app05,
  'ecole-apprentissages-06': app06,
  'ecole-apprentissages-07': app07,
  'ecole-prive-01': prive01,
  'ecole-prive-02': prive02,
  'ecole-prive-03': prive03,
  'ecole-prive-04': prive04,
  'ecole-prive-05': prive05,
  'ecole-prive-06': prive06,
  'ecole-prive-07': prive07,
  'ecole-superieur-01': sup01,
  'ecole-superieur-02': sup02,
  'ecole-superieur-03': sup03,
  'ecole-superieur-04': sup04,
  'ecole-superieur-05': sup05,
  'ecole-superieur-06': sup06,
  'ecole-superieur-07': sup07,
  'ecole-superieur-08': sup08,
  'ecole-jeunes-01': jeunes01,
  'ecole-jeunes-02': jeunes02,
  'ecole-jeunes-03': jeunes03,
  'ecole-jeunes-04': jeunes04,
  'ecole-jeunes-05': jeunes05,
  'ecole-jeunes-06': jeunes06,
  'ecole-jeunes-07': jeunes07,
}
