// Piste C, les planches de la série « Laïcité et mémoire » (src/ui/videos/series/laicite_republique.ts) : un
// dessin par passage, composé avec la bibliothèque commune (../dessin/) et quelques pictogrammes du thème dessinés
// ici au trait (MIENS). Les mots et les nombres viennent du script (mots mis en valeur, phrases dites, chiffre de la
// fiche) : si le texte change au point que la planche ne s'y retrouve plus, elle rend null et le passage prend le
// dessin générique de sa sorte d'image.
// Sujet sensible : aucun symbole religieux, aucun drapeau, aucune personne reconnaissable. L'État est un monument,
// les Églises une salle commune sans aucun signe ; un signe religieux ne se dessine jamais, seule l'interdiction se
// montre, par un panneau générique (un rond barré). Quelques étiquettes courtes et neutres sont écrites ici quand
// le passage ne les dit pas (« pour », « contre », les libellés des barres de la fiche) : elles sont reprises dans
// le « alt » du passage.

import { VIDEO_SERIES } from '../../series'
import { Art, Arrow, Ask, Fade, Ink, Marks, Txt, W, at, cls, cueOf, cuesOf, heard, num, plain, said, sentencesOf, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Question, Seg, Signature, Src, Sur100, lineOf, listAfterColon } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Rang, barres, colonnes, frise, type Barre } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const rond = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/* ——— Les pictogrammes du thème ——— */

interface Trait {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat du bleu bille */
  fill?: string
  thin?: number[]
  bold?: number[]
}

/** Dans un carré de 48 unités, comme ceux de pictos.tsx ; sans attribut, sans symbole */
const MIENS = {
  /** Une salle commune, toit à deux pans, deux fenêtres, une porte : aucun signe religieux (« les Églises ») */
  salle: {
    s: ['M2 44H46', 'M7 44V22L24 8L41 22V44', 'M19 44V33H29V44', 'M11 27h5v6h-5zM32 27h5v6h-5z'],
    fill: 'M7 44V22L24 8L41 22V44Z',
    thin: [3],
  },
  /** Une école, bâtiment public : un fronton et son horloge, une porte en arc, quatre fenêtres */
  ecole: {
    s: ['M2 44H46', 'M5 44V21H43V44', 'M12 21L24 12L36 21', rond(24, 17.6, 2.2), 'M20 44V35a4 4 0 0 1 8 0V44', 'M9 26h6v6h-6zM33 26h6v6h-6zM9 35h6v5h-6zM33 35h6v5h-6z'],
    fill: 'M5 44V21H12L24 12L36 21H43V44Z',
    thin: [3, 5],
  },
  /** Une coupe de compétition sportive, ses deux anses, son pied */
  coupe: {
    s: ['M14 6H34V16C34 24 29 29 24 29C19 29 14 24 14 16Z', 'M14 9H8C8 16 11 19 14 19M34 9H40C40 16 37 19 34 19', 'M24 29V36M16 44H32L30 36H18Z'],
    fill: 'M14 6H34V16C34 24 29 29 24 29C19 29 14 24 14 16Z',
  },
  /** Un hémicycle, vu de face : trois rangs de sièges et la tribune */
  hemicycle: {
    s: ['M2 44H46', 'M4 40A20 20 0 0 1 44 40', 'M11 40A13 13 0 0 1 37 40', 'M18 40A6 6 0 0 1 30 40', 'M21 44V40H27V44'],
    fill: 'M4 40A20 20 0 0 1 44 40Z',
    thin: [3],
  },
  /** Un panneau d'interdiction générique : un rond barré, sans rien dedans */
  interdit: { s: [rond(24, 24, 19), 'M10.6 10.6L37.4 37.4'], fill: rond(24, 24, 19), bold: [1] },
  /** Une boîte d'archives, son couvercle et sa poignée */
  archives: { s: ['M4 12H44V20H4Z', 'M7 20V44H41V20', 'M19 28h10'], fill: 'M7 20V44H41V20Z', thin: [2] },
  /** Une caisse que ramène une flèche : une restitution */
  restitution: {
    s: ['M4 26H28V44H4Z', 'M4 26L10 20H34L28 26M34 20V38L28 44', 'M42 40V14A8 8 0 0 0 26 14V16', 'M22.5 12.5L26 17L29.5 12.5'],
    fill: 'M4 26H28V44H4Z',
    thin: [1],
  },
  /** Un questionnaire : trois cases à cocher et leurs lignes */
  formulaire: {
    s: ['M10 4H38V44H10Z', 'M15 12h5v5h-5zM15 22h5v5h-5zM15 32h5v5h-5z', 'M24 14.5h10M24 24.5h10M24 34.5h8'],
    fill: 'M10 4H38V44H10Z',
    thin: [2],
  },
  /** Une vitrine de collection, deux étagères, sur ses pieds */
  vitrine: { s: ['M8 6H40V42H8Z', 'M8 18H40M8 30H40', 'M12 42v4M36 42v4'], fill: 'M8 6H40V42H8Z', thin: [1] },
  /** Un vase, objet de collection */
  vase: {
    s: ['M18 5H30', 'M20 5C20 11 12 15 12 27C12 37 17 44 24 44C31 44 36 37 36 27C36 15 28 11 28 5', 'M13 22H35'],
    fill: 'M20 5C20 11 12 15 12 27C12 37 17 44 24 44C31 44 36 37 36 27C36 15 28 11 28 5Z',
    thin: [2],
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
        <Ink key={i} d={path} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined} />
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
 *  vidéo) : un rond barré pour les signes religieux, une personne pour les discriminations, une caisse rendue pour
 *  les restitutions, un livre pour l'histoire, un document pour le principe */
function sujet(text: string): Nom {
  const t = text.toLowerCase()
  if (/signe/.test(t)) return 'interdit'
  if (/discrimin/.test(t)) return 'personne'
  if (/restitu/.test(t)) return 'restitution'
  if (/histoire|colonisation/.test(t)) return 'livre'
  return 'document'
}

/** Des pictogrammes légendés, chacun quand la voix le dit (comme Panel de mises.tsx, avec ceux du thème) */
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

/** Les approfondissements de la série, en sommaire numéroté (comme Sommaire de mises.tsx, avec les pictogrammes
 *  du thème) */
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

/** Le mot « laïque » sans définition : une page de la Constitution, l'article, le mot au bleu bille, et à la place
 *  de sa définition des lignes vides en pointillé, puis un point d'interrogation */
function sansDefinition(p: P, head: Cue | null | undefined) {
  const mot = said(p, /laïque/)
  const art = word(p, /article\s1er/)
  const manque = word(p, /ne définit pas|sans le définir/)
  if (!mot || !manque) return null
  return (
    <Seg>
      <Head lines={[lineOf(head)]} />
      <Art h={160}>
        <Ink d="M20 6H120L142 28V154H20Z" t0={100} dur={900} />
        <Ink d="M120 6V28H142" t0={700} dur={300} class="vc-thin" />
        {art ? <Txt x={34} y={44} text={art.text} anchor="start" size={15} tone="soft" t0={800} /> : null}
        <Txt x={34} y={78} text={`«\u00a0${mot}\u00a0»`} anchor="start" size={21} big tone="count" t0={1000} />
        {manque.shown ? (
          <>
            <Fade t0={100} class="vc-ghost">
              <path d="M34 102H128M34 120H128M34 138H100" />
            </Fade>
            <Ask x={190} y={36} h={86} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** L'État (un monument) et les Églises (une salle sans signe), et le double trait qui les sépare quand la voix le
 *  dit ; (y) : le haut des pictogrammes, (s) : leur taille */
function Separation({ p, y = 0, s = 64, t0 = 200 }: { p: P; y?: number; s?: number; t0?: number }) {
  const etat = said(p, /l’État/)
  const eglises = said(p, /les Églises/)
  const sep = word(p, /sépare/)
  const L = 70
  const R = 230
  return (
    <>
      <Picto n="monument" x={L - s / 2} y={y} size={s} t0={t0} />
      {etat ? <Txt x={L} y={y + s + 20} text={etat} size={15} t0={t0 + 400} /> : null}
      <Fig n="salle" x={R - s / 2} y={y} size={s} t0={t0 + 300} />
      {eglises ? <Txt x={R} y={y + s + 20} text={eglises} size={15} t0={t0 + 700} /> : null}
      {sep?.shown ? <Ink d={`M144 ${y + 2}V${y + s + 4}M156 ${y + 2}V${y + s + 4}`} t0={0} dur={600} class="vc-count vc-bold" /> : null}
    </>
  )
}

/** Le rond de l'Alsace-Moselle sur la carte de France placée en (x, y), de côté m */
const alsaceDot = (x: number, y: number, m: number) => {
  const k = m / 48
  return rond(x + 42.5 * k, y + 15 * k, 3.4 * k)
}

/** L'Alsace-Moselle sur la carte, et ce qui y est particulier : l'État y rémunère des ministres du culte (une
 *  pièce qui va du monument à une personne) ; (y) : le haut de la carte, (m) : sa taille */
function Alsace({ p, y = 0, m = 110, cue, t0 = 200 }: { p: P; y?: number; m?: number; cue: Cue | null | undefined; t0?: number }) {
  const paid = word(p, /des ministres du culte/)
  const right = 8 + (46 * m) / 48 + 14
  const wr = W - right - 4
  const yr = y + 0.42 * m
  return (
    <>
      <Picto n="carte_france" x={8} y={y} size={m} t0={t0} />
      {cue?.shown ? (
        <>
          <Fade t0={100} class="vc-count">
            <path class="vc-tint-count" d={alsaceDot(8, y, m)} />
            <path d={alsaceDot(8, y, m)} />
          </Fade>
          <Txt x={right} y={y + 0.3 * m} text={cue.text} anchor="start" size={16} tone="count" t0={200} />
        </>
      ) : null}
      {paid?.shown ? (
        <>
          <Picto n="monument" x={right} y={yr} size={40} t0={0} />
          <Picto n="piece" x={right + 56} y={yr - 4} size={20} tone="count" t0={300} w={0.8} />
          <Arrow x1={right + 46} y1={yr + 24} x2={right + wr - 50} y2={yr + 24} t0={400} head={6} />
          <Picto n="personne" x={right + wr - 44} y={yr} size={40} t0={700} />
          <Txt x={right + wr / 2} y={yr + 62} text={paid.text} max={14} size={14} t0={900} />
        </>
      ) : null}
    </>
  )
}

/** Les religions déclarées, chacune avec sa part dite (« 29 % se déclarent catholiques ») : dans ce passage, ou
 *  déjà dite plus tôt dans la vidéo (en gris, sans geste) */
const CULTES: [RegExp, string][] = [
  [/sans religion/, 'sans religion'],
  [/catholiques/, 'catholiques'],
  [/musulmans/, 'musulmans'],
  [/autre religion/, 'autre religion'],
]

/** Des barres horizontales à la même échelle, depuis zéro, chacune avec son libellé à gauche et sa valeur au bout
 *  (comme barres() de schemas.tsx, en plus serré : une ligne par barre) */
function rangees({ items, y = 0, row = 30, size = 18, labelW = 108, room = 58, t0 = 0 }: { items: Barre[]; y?: number; row?: number; size?: number; labelW?: number; room?: number; t0?: number }) {
  const x0 = labelW + 8
  const top = Math.max(...items.map(i => i.value)) || 1
  const scale = (W - x0 - room) / top
  const el = (
    <>
      {items.map((it, i) => {
        if (it.shown === false) return null
        const yy = y + i * row
        const x1 = x0 + it.value * scale
        const d = t0 + i * 300
        const k = it.tone && it.tone !== 'ghost' ? `vc-${it.tone}` : undefined
        return (
          <g key={i} class={k}>
            {it.label ? <Txt x={labelW} y={yy + size * 0.78} text={it.label} anchor="end" size={14} tone={it.tone === 'soft' ? 'soft' : undefined} t0={d} /> : null}
            <Fade t0={d + 300}>
              <rect class="vc-tint" x={x0} y={yy} width={x1 - x0} height={size} />
            </Fade>
            <Ink d={`M${x0} ${yy}H${x1}V${yy + size}H${x0}Z`} t0={d} dur={600} />
            {it.text ? <Txt x={x1 + 7} y={yy + size * 0.84} text={it.text} anchor="start" size={18} big tone={it.tone === 'soft' ? 'soft' : undefined} t0={d + 450} /> : null}
          </g>
        )
      })}
    </>
  )
  return { el, h: items.length * row - (row - size) }
}

/** Quatre barres à la même échelle, depuis zéro ; null si le script ne donne plus les quatre parts */
function religions(p: P, t0 = 200, row = 30, size = 18) {
  const here = plain(p.segment.say)
  const all = plain(p.script.segments.map(s => s.say).join(' '))
  const items: Barre[] = []
  for (const [re, label] of CULTES) {
    const r = new RegExp(`(\\d+) %[^,.%]*?${re.source}`)
    const mine = r.exec(here)
    const m = mine ?? r.exec(all)
    if (!m) return null
    items.push({ label, value: Number(m[1]), text: `${m[1]}\u00a0%`, tone: mine ? undefined : 'soft', shown: mine ? heard(p, m[0].slice(0, 6)) : true })
  }
  return rangees({ items, y: 2, row, size, t0 })
}

/** Une période comptée sur une frise (« de 1954 à 1966 ») : la frise, ses deux années, et la bande au bleu bille
 *  quand la voix dit la période */
function periode({ a, b, y, x0, x1, pad, shown, t0 = 300 }: { a: number; b: number; y: number; x0: number; x1: number; pad: number; shown: boolean; t0?: number }) {
  const f = frise({ y, from: a - pad, to: b + pad, x0, x1, ticks: [a, b], labels: [a, b], t0 })
  const xa = f.X(a)
  const xb = f.X(b)
  return (
    <>
      {f.el}
      {shown ? (
        <Fade t0={t0 + 500} class="vc-count">
          <rect class="vc-tint-count" x={xa} y={y - 7} width={xb - xa} height={14} />
          <path d={`M${xa} ${y - 7}H${xb}V${y + 7}H${xa}Z`} />
        </Fade>
      ) : null}
    </>
  )
}

/** Un hémicycle (le Parlement), un texte au milieu, un livre d'histoire : la loi et l'histoire */
function LoiEtHistoire({ p, doc, label }: { p: P; doc: 'ghost' | 'count'; label: Cue | null | undefined }) {
  const faits = said(p, /faits historiques/)
  const an = said(p, /l’Assemblée nationale/)
  return (
    <Art h={160}>
      <Fig n="hemicycle" x={4} y={26} size={92} t0={100} kept={doc === 'count'} />
      {an ? <Txt x={50} y={140} text={an} max={12} size={14} tone="soft" t0={300} kept={doc === 'count'} /> : null}
      <Arrow x1={100} y1={70} x2={118} y2={70} dash t0={600} kept={doc === 'count'} />
      <Picto n="document" x={120} y={30} size={64} tone={doc} t0={800} />
      {label?.shown ? <Txt x={152} y={118} text={label.text} max={12} size={15} tone="count" t0={200} /> : null}
      <Arrow x1={186} y1={70} x2={204} y2={70} dash t0={1000} kept={doc === 'count'} />
      <Picto n="livre" x={208} y={28} size={84} t0={1100} kept={doc === 'count'} />
      {faits ? <Txt x={250} y={140} text={faits} max={12} size={14} tone="soft" t0={1300} kept={doc === 'count'} /> : null}
    </Art>
  )
}

/* ——— Introduction ——— */

/** 01 « La République est laïque » : la page de la Constitution, le mot, et pas de définition */
const intro01: Board = p => sansDefinition(p, cueOf(p, 0))

/** 02 La loi de 1905 sépare les Églises et l'État ; en Alsace-Moselle, l'État rémunère des ministres du culte */
const intro02: Board = p => {
  const [loi, region] = cuesOf(p)
  if (!loi) return null
  return (
    <Seg>
      <Head lines={[lineOf(loi)]} />
      <Art h={222}>
        <Separation p={p} y={0} s={56} />
        <Alsace p={p} y={96} m={100} cue={region} t0={1200} />
      </Art>
    </Seg>
  )
}

/** 03 L'école publique (un rond barré à sa porte) ; les agents publics, au guichet, neutres */
const intro03: Board = p => {
  const ecole = word(p, /l’école publique/)
  const agents = word(p, /les agents publics/)
  const [signes] = cuesOf(p)
  if (!ecole || !agents) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Ink d="M8 112H292" t0={0} dur={600} class="vc-soft" />
        <Fig n="ecole" x={10} y={10} size={102} t0={100} />
        {signes?.shown ? (
          <>
            <Ink d="M134 112V88" t0={0} dur={300} class="vc-soft" />
            <Fig n="interdit" x={114} y={48} size={40} tone="count" t0={200} />
          </>
        ) : null}
        <Txt x={61} y={136} text={ecole.text} size={14} tone="soft" t0={500} />
        {agents.shown ? (
          <>
            <Picto n="personne" x={208} y={44} size={36} t0={0} />
            <Picto n="guichet" x={180} y={10} size={102} t0={200} />
            <Txt x={231} y={136} text={agents.text} size={14} tone="soft" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 51 % sans religion, 29 % catholiques, 10 % musulmans, 10 % d'une autre religion : quatre barres */
const intro04: Board = p => {
  const g = religions(p, 900)
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'autre sujet : la mémoire de la colonisation ; des archives, un livre d'histoire, un monument */
const intro05: Board = p => {
  const guerre = word(p, /la guerre d’Algérie/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={118}>
        <Fig n="archives" x={20} y={8} size={70} t0={200} />
        <Picto n="livre" x={115} y={8} size={70} t0={600} />
        <Picto n="monument" x={210} y={8} size={70} t0={1000} />
        {guerre?.shown ? <Txt x={W / 2} y={110} text={guerre.text} size={15} t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Depuis 2021, plusieurs décisions : un rapport officiel, l'ouverture d'archives, des lois de restitution */
const intro06: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length < 2) return null
  const pick = (t: string): Nom => (/rapport/.test(t) ? 'document' : /archives/.test(t) ? 'archives' : /restitution/.test(t) ? 'restitution' : 'document')
  const pitch = W / list.length
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={118}>
        {list.map((t, i) => {
          const cx = pitch * (i + 0.5)
          if (!heard(p, t.split(/\s/).slice(0, 2).join(' '))) return null
          return (
            <g key={t}>
              <Fig n={pick(t)} x={cx - 30} y={2} size={60} t0={0} />
              <Txt x={cx} y={88} text={t} max={12} size={14} t0={300} />
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 07 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Liste cols={2} items={qs.map(q => ({ n: sujet(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))} />
    </Seg>
  )
}

/** 08 Les sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Le principe ——— */

/** 01 « Qui décide de ce que ce mot veut dire ? » : le mot écrit dans une page, et la question */
const principe01: Board = p => {
  const mot = cueOf(p, 0)
  if (!mot) return null
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Ink d="M56 4H140L160 24V120H56Z" t0={100} dur={900} />
        <Ink d="M140 4V24H160" t0={700} dur={300} class="vc-thin" />
        {mot.shown ? <Txt x={108} y={70} text={mot.text} size={22} big tone="count" t0={300} /> : null}
        <Ask x={196} y={18} h={86} t0={1200} />
      </Art>
    </Seg>
  )
}

/** 02 L'article 1er de la Constitution emploie le mot sans le définir */
const principe02: Board = p => sansDefinition(p, cueOf(p, 1))

/** 03 La loi de 1905 sépare les Églises et l'État */
const principe03: Board = p => {
  const year = cueOf(p, 0)
  if (!year) return null
  return (
    <Seg>
      <Head lines={[lineOf(year)]} />
      <Art h={110}>
        <Separation p={p} y={4} s={70} />
      </Art>
    </Seg>
  )
}

/** 04 Des exceptions locales : en Alsace-Moselle, l'État rémunère des ministres du culte */
const principe04: Board = p => {
  const [exc, region] = cuesOf(p)
  if (!exc) return null
  return (
    <Seg>
      <Head lines={[lineOf(exc)]} />
      <Art h={140}>
        <Alsace p={p} y={4} m={120} cue={region} />
      </Art>
    </Seg>
  )
}

/** 05 En 2013, le Conseil constitutionnel : la Constitution ne remet pas en cause ces règles particulières. Une
 *  frise de 1905 à 2013, et la carte où l'Alsace-Moselle reste marquée */
const principe05: Board = p => {
  const [cc, cause] = cuesOf(p)
  const y13 = yearsOf(p.segment.say)[0]
  const loi = said(p, /\b1905\b/)
  const y05 = loi ? Number(loi) : null
  const regles = word(p, /ces règles particulières/)
  if (!cc || !y13) return null
  const f = frise({ y: 140, from: 1895, to: 2030, x0: 16, x1: 284, ticks: [1900, 1925, 1950, 1975, 2000, 2025], t0: 100, soft: true })
  return (
    <Seg>
      <Head lines={[lineOf(cc)]} />
      <Art h={168}>
        {cause?.shown ? (
          <>
            <Picto n="carte_france" x={36} y={0} size={84} kept />
            <Fade class="vc-count">
              <path class="vc-tint-count" d={alsaceDot(36, 0, 84)} />
              <path d={alsaceDot(36, 0, 84)} />
            </Fade>
            {regles ? <Txt x={136} y={34} text={regles.text} max={13} anchor="start" size={15} t0={300} /> : null}
          </>
        ) : null}
        {f.el}
        {y05 ? (
          <>
            <Picto n="document" x={f.X(y05) - 17} y={100} size={34} tone="soft" t0={300} />
            <Txt x={f.X(y05)} y={164} text={String(y05)} size={14} tone="soft" t0={400} />
          </>
        ) : null}
        <Picto n="drapeau" x={f.X(y13) - 11} y={140 - 43} size={46} tone="count" t0={600} />
        <Txt x={f.X(y13)} y={164} text={String(y13)} size={15} tone="count" t0={800} />
      </Art>
    </Seg>
  )
}

/** 06 L'Observatoire de la laïcité : une bande de 2007 à 2021 sur une frise, fermée d'une croix */
const principe06: Board = p => {
  const [cree, supp] = cuesOf(p)
  const obs = word(p, /Observatoire de la laïcité/)
  const [a, b] = yearsOf(p.segment.say)
  if (!cree || !supp || !obs || !a || !b || b <= a || b - a > 40) return null
  const f = frise({ y: 128, from: a - 2, to: b + 4, x0: 16, x1: 284, ticks: range(b - a + 7).map(k => a - 2 + k), t0: 100 })
  const xa = f.X(a)
  const xb = f.X(b)
  return (
    <Seg>
      <Art h={170}>
        <Txt x={W / 2} y={22} text={obs.text} size={17} t0={100} />
        {f.el}
        {cree.shown ? (
          <>
            <Fade t0={300} class="vc-count">
              <rect class="vc-tint-count" x={xa} y={82} width={xb - xa} height={30} />
            </Fade>
            <Ink d={`M${xa} 82H${xb}V112H${xa}Z`} t0={0} dur={900} class="vc-count" />
            <Txt x={xa} y={70} text={cree.text} anchor="start" size={15} t0={300} />
          </>
        ) : null}
        {supp.shown ? (
          <>
            <Ink d={`M${xb - 11} 86l22 22M${xb + 11} 86l-22 22`} t0={0} dur={400} class="vc-bold" />
            <Txt x={Math.min(xb + 24, 290)} y={160} text={supp.text} anchor="end" size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Le comité interministériel : une table, présidée par le Premier ministre ; au moins une fois par an */
const principe07: Board = p => {
  const [comite, freq] = cuesOf(p)
  const pm = word(p, /le Premier ministre/)
  if (!comite || !freq) return null
  const seats = [34, 69, 104, 139, 174]
  const k = 70 / 48
  return (
    <Seg>
      <Head lines={[lineOf(comite)]} />
      <Art h={140}>
        {seats.map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 15} y={36} size={30} t0={300 + i * 120} tone={i === 2 && pm?.shown ? 'count' : undefined} w={0.9} />
        ))}
        <Ink d="M14 88a90 18 0 1 0 180 0a90 18 0 1 0-180 0" t0={100} dur={800} />
        {pm?.shown ? <Txt x={104} y={132} text={pm.text} size={14} tone="count" t0={200} /> : null}
        <Picto n="calendrier" x={214} y={18} size={70} t0={900} />
        {freq.shown ? (
          <>
            <Ink d={rond(214 + 24 * k, 18 + 27 * k, 7)} t0={0} dur={500} class="vc-count" />
            <Txt x={249} y={108} text={freq.text} max={12} size={14} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 « Comment définir la laïcité, et que faire des exceptions locales ? » : la page sans définition, la carte */
const principe08: Board = p => (
  <Seg kind="ask">
    <Art h={102}>
      <Ink d="M14 4H74L90 20V98H14Z" t0={100} dur={700} />
      <Fade t0={700} class="vc-ghost">
        <path d="M26 40H80M26 58H80M26 76H64" />
      </Fade>
      <Picto n="carte_france" x={110} y={8} size={86} t0={500} />
      <Fade t0={1100} class="vc-count">
        <path class="vc-tint-count" d={alsaceDot(110, 8, 86)} />
        <path d={alsaceDot(110, 8, 86)} />
      </Fade>
      <Ask x={230} y={12} h={78} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Signes religieux ——— */

/** Trois lieux sur une même ligne : l'école, le guichet d'un service public, la coupe d'une compétition */
const LIEUX: Nom[] = ['ecole', 'guichet', 'coupe']

/** 01 « Où est-ce interdit, et pour qui ? » : trois lieux, chacun avec son point d'interrogation */
const signes01: Board = p => {
  const q = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Ink d="M8 80H292" t0={0} dur={600} class="vc-soft" />
        {LIEUX.map((n, i) => {
          const cx = 50 + i * 100
          return (
            <g key={n}>
              <Fig n={n} x={cx - 32} y={14} size={64} t0={200 + i * 300} />
              {q?.shown ? <Ask x={cx - 10} y={88} h={32} t0={i * 200} tone="soft" /> : null}
            </g>
          )
        })}
      </Art>
    </Seg>
  )
}

/** 02 À l'école publique : un rond barré à la porte ; les élèves */
const signes02: Board = p => {
  const [eleves, signes] = cuesOf(p)
  const ecole = word(p, /l’école publique/)
  if (!eleves || !signes) return null
  return (
    <Seg>
      <Head lines={[lineOf(signes)]} />
      <Art h={160}>
        <Ink d="M8 128H292" t0={0} dur={600} class="vc-soft" />
        <Fig n="ecole" x={8} y={18} size={112} t0={100} />
        {ecole ? <Txt x={64} y={152} text={ecole.text} size={14} tone="soft" t0={600} /> : null}
        {signes.shown ? (
          <>
            <Ink d="M146 128V98" t0={0} dur={300} class="vc-soft" />
            <Fig n="interdit" x={124} y={54} size={44} tone="count" t0={200} />
          </>
        ) : null}
        {eleves.shown ? (
          <>
            <Rang n={3} picto="personne" x={178} w={116} y={88} max={36} gap={4} t0={0} stagger={150} />
            <Txt x={236} y={152} text={eleves.text} size={14} tone="soft" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Les agents publics, au guichet, doivent rester neutres : une petite balance au fléau droit */
const signes03: Board = p => {
  const [agents, neutres] = cuesOf(p)
  if (!agents || !neutres) return null
  return (
    <Seg>
      <Head lines={[lineOf(neutres)]} />
      <Art h={150}>
        <Picto n="personne" x={70} y={52} size={44} t0={100} />
        <Picto n="guichet" x={30} y={0} size={124} t0={300} />
        {agents.shown ? <Txt x={92} y={144} text={agents.text} size={15} t0={200} /> : null}
        {neutres.shown ? (
          <g class="vc-count">
            <Ink d="M236 46V118M214 118H258" t0={0} dur={500} />
            <Ink d="M196 50H276" t0={300} dur={500} class="vc-bold" />
            <Ink d="M196 50L186 80H206ZM276 50L266 80H286Z" t0={600} dur={600} />
            <Ink d="M230 46L236 38L242 46" t0={500} dur={200} />
          </g>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le Sénat, 210 voix contre 81 : un hémicycle, deux barres à la même échelle, depuis zéro */
const signes04: Board = p => {
  const m = /(\d+) voix contre (\d+)/.exec(plain(p.segment.say))
  const senat = word(p, /le Sénat/)
  const vote = cueOf(p, 1)
  if (!m) return null
  const g = barres({
    items: [
      { label: 'pour', value: Number(m[1]), text: m[1], shown: !!vote?.shown },
      { label: 'contre', value: Number(m[2]), text: m[2], shown: !!vote?.shown },
    ],
    x: 112,
    w: 188,
    y: 0,
    size: 22,
    gap: 26,
    room: 50,
    labelSize: 14,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={Math.max(g.h + 6, 106)}>
        <Fig n="hemicycle" x={6} y={4} size={84} t0={100} />
        {senat ? <Txt x={48} y={100} text={senat.text} size={14} tone="soft" t0={500} /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le texte adopté au Sénat part vers l'Assemblée nationale, où il n'est pas adopté (en pointillé) */
const signes05: Board = p => {
  const an = word(p, /l’Assemblée nationale/)
  const non = cueOf(p, 0)
  const date = word(p, /au \d+\s\S+ \d{4}/)
  const senat = said(p, /le Sénat/)
  if (!an || !non) return null
  return (
    <Seg>
      <Head lines={[lineOf(non)]} />
      <Art h={172}>
        <Picto n="document" x={30} y={0} size={50} tone="count" t0={100} />
        <Fig n="hemicycle" x={10} y={52} size={80} t0={200} />
        {senat ? <Txt x={50} y={148} text={senat} size={14} tone="soft" t0={500} /> : null}
        <Arrow x1={96} y1={96} x2={200} y2={96} dash t0={700} />
        {date?.shown ? <Txt x={216} y={30} text={date.text} anchor="end" size={14} tone="soft" t0={200} /> : null}
        <Fig n="hemicycle" x={210} y={52} size={80} t0={900} />
        <Txt x={250} y={148} text={an.text} max={12} size={14} tone="soft" t0={1100} />
        {non.shown ? <Picto n="document" x={225} y={0} size={50} tone="ghost" /> : null}
      </Art>
    </Seg>
  )
}

/** 06 « Où placer la limite ? » : les trois lieux ; la limite en pointillé là où la vidéo la laisse (l'école et le
 *  guichet d'un côté, la coupe, dont le texte n'est pas adopté, de l'autre), qui peut aller d'un côté ou de l'autre */
const LIMITE = 152
const signes06: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ink d="M8 98H292" t0={0} dur={600} class="vc-soft" />
      {LIEUX.map((n, i) => (
        <Fig key={n} n={n} x={[8, 72, 178][i]!} y={44} size={54} t0={200 + i * 250} />
      ))}
      <Fade t0={1000} class="vc-count vc-dash">
        <path d={`M${LIMITE} 46V104`} />
      </Fade>
      <Arrow x1={LIMITE} y1={74} x2={LIMITE - 18} y2={74} t0={1300} tone="count" head={6} />
      <Arrow x1={LIMITE} y1={74} x2={LIMITE + 18} y2={74} t0={1300} tone="count" head={6} />
      <Ask x={LIMITE - 12.5} y={0} h={40} t0={1600} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Religions et discriminations ——— */

/** 01 « Combien de personnes se disent d'une religion, ou sans religion ? » : un questionnaire, une personne */
const discriminations01: Board = p => {
  const when = word(p, /en \d{4} et \d{4}/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={136}>
        <Fig n="formulaire" x={44} y={4} size={104} t0={200} />
        <Picto n="personne" x={176} y={30} size={74} t0={800} />
        {when?.shown ? <Txt x={W / 2} y={130} text={when.text} size={15} tone="soft" t0={100} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 51 % des 18-59 ans sans religion : cent carrés, cinquante et un comptés */
const discriminations02: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const cap = word(p, /des 18 à 59\sans se disent sans religion/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={Math.round(v)} caption={cap?.text ?? null} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 03 29 % catholiques, 10 % musulmans, 10 % d'une autre religion ; « sans religion », déjà dit, en gris */
const discriminations03: Board = p => {
  const g = religions(p, 100, 38, 22)
  if (!g) return null
  return (
    <Seg>
      <Art h={g.h + 4}>{g.el}</Art>
    </Seg>
  )
}

/** 04 Le voile : 18 % en 2008-2009, 26 % en 2019-2020, deux colonnes à la même échelle, depuis zéro */
const discriminations04: Board = p => {
  const [now, before] = cuesOf(p)
  const vn = num(now?.text)
  const vb = num(before?.text)
  const ys = yearsOf(p.segment.say)
  const d = p.segment.figure?.date
  if (!now || !before || !vn || !vb || ys.length < 2 || !d) return null
  const cols = colonnes({
    items: [
      { label: `${ys[0]}-${ys[1]}`, value: vb, text: before.text, shown: before.shown },
      { label: d, value: vn, text: now.text, shown: now.shown },
    ],
    y: 4,
    h: 126,
    x: 70,
    w: 160,
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

/** 05 7 % citent leur religion comme motif : cent carrés, sept comptés */
const discriminations05: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const cap = word(p, /citent leur religion comme motif/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={Math.round(v)} caption={cap?.text ?? null} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 30 % (origine Maroc ou Tunisie), 2 % (sans ascendance migratoire), et l'ensemble, 7 %, déjà dit, en gris :
 *  trois barres à la même échelle, depuis zéro (les libellés sont ceux du graphique de la fiche) */
const discriminations06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const v0 = num(said(p, /\d+\s%\scitent/))
  if (!a || !b || va === null || vb === null || v0 === null) return null
  const g = barres({
    items: [
      { label: 'ensemble des personnes', value: v0, text: `${v0}\u00a0%`, tone: 'soft' },
      { label: 'origine Maroc ou Tunisie', value: va, text: a.text, shown: a.shown },
      { label: 'sans ascendance migratoire', value: vb, text: b.text, shown: b.shown },
    ],
    y: 2,
    size: 20,
    gap: 28,
    room: 64,
    labelSize: 14,
    t0: 200,
  })
  return (
    <Seg>
      <Art h={g.h + 4}>{g.el}</Art>
    </Seg>
  )
}

/** 07 « Quelle place pour la lutte contre les discriminations ? » : une rangée de personnes semblables */
const discriminations07: Board = p => (
  <Seg kind="ask">
    <Art h={90}>
      <Rang n={5} picto="personne" x={0} w={214} y={22} max={40} gap={4} t0={200} />
      <Ask x={238} y={8} h={72} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Mémoire et restitutions ——— */

/** 01 Depuis 2021, plusieurs décisions : un fanion sur une frise, puis la question */
const memoire01: Board = p => {
  const y = yearsOf(p.segment.say)[0]
  const q = cueOf(p, 1)
  if (!y) return null
  const f = frise({ y: 84, from: y - 1, to: y + 6, x0: 16, x1: 230, ticks: range(8).map(k => y - 1 + k), t0: 100 })
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={116}>
        {f.el}
        <Picto n="drapeau" x={f.X(y) - 11} y={84 - 43} size={46} tone="count" t0={500} />
        <Txt x={f.X(y)} y={110} text={String(y)} size={15} tone="count" t0={700} />
        <Arrow x1={f.X(y) + 30} y1={58} x2={226} y2={58} dash t0={900} />
        {q?.shown ? <Ask x={244} y={26} h={64} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Une trentaine de préconisations : un historien, son rapport, remis au président de la République */
const memoire02: Board = p => (
  <Seg kind="fig">
    <Chiffre p={p} />
    <Art h={100}>
      <Picto n="personne" x={10} y={18} size={72} t0={200} />
      <Picto n="document" x={104} y={4} size={90} t0={600} />
      <Arrow x1={190} y1={52} x2={216} y2={52} t0={1200} />
      <Picto n="monument" x={222} y={14} size={72} t0={1400} />
    </Art>
    <Src p={p} />
  </Seg>
)

/** 03 Parmi les préconisations : une commission, des commémorations, une restitution, des archives */
const memoire03: Board = p => {
  const i = p.segment.say.search(/[\u00a0 ]:/)
  if (i < 0) return null
  const items = p.segment.say
    .slice(i + 2)
    .replace(/[.!?…]+$/, '')
    .split(/,\s+/)
    .map(s => s.trim())
    .filter(Boolean)
  if (items.length < 3) return null
  const pick = (t: string): Nom => (/commission/.test(t) ? 'personne' : /commémor/.test(t) ? 'monument' : /restitution/.test(t) ? 'restitution' : /archives/.test(t) ? 'archives' : 'document')
  return (
    <Seg>
      <Liste cols={2} items={items.map(t => ({ n: pick(t), text: t, shown: heard(p, t.split(/\s/).slice(0, 2).join(' ')) }))} />
    </Seg>
  )
}

/** 04 Des archives ouvertes en avance (une boîte, une clé) ; la période qu'elles couvrent, 1954 à 1966 */
const memoire04: Board = p => {
  const [avance, per] = cuesOf(p)
  const [a, b] = yearsOf(per?.text ?? '')
  if (!avance || !per || !a || !b || b <= a) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={106}>
        <Fig n="archives" x={8} y={18} size={80} t0={100} />
        {avance.shown ? <Picto n="cle" x={52} y={0} size={44} tone="count" t0={200} /> : null}
        {periode({ a, b, y: 72, x0: 122, x1: 290, pad: 4, shown: per.shown })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Une loi de 2022 : la responsabilité de la Nation envers les harkis et leurs familles ; une réparation */
const memoire05: Board = p => {
  const [resp, rep] = cuesOf(p)
  const qui = word(p, /les harkis et leurs familles/)
  const year = yearsOf(p.segment.say)[0]
  if (!resp || !qui) return null
  return (
    <Seg>
      <Head lines={[lineOf(resp)]} />
      <Art h={164}>
        <Picto n="document" x={6} y={8} size={84} t0={100} />
        {year ? <Txt x={48} y={112} text={String(year)} size={15} tone="soft" t0={400} /> : null}
        <Arrow x1={96} y1={50} x2={128} y2={50} t0={700} />
        {qui.shown ? (
          <>
            <Rang n={3} picto="personne" x={134} w={160} y={14} max={46} gap={6} t0={0} stagger={150} />
            <Txt x={214} y={84} text={qui.text} max={16} size={14} t0={400} />
          </>
        ) : null}
        {rep?.shown ? (
          <>
            <Picto n="pieces" x={134} y={112} size={44} tone="count" t0={0} />
            <Txt x={186} y={130} text={rep.text} max={12} anchor="start" size={14} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Des restes humains des collections publiques restituables : une vitrine, une caisse rendue ; une frise qui
 *  compte le temps après l'an 1500 */
const memoire06: Board = p => {
  const [rest, apres] = cuesOf(p)
  const coll = word(p, /des collections publiques/)
  const from = num(apres?.text)
  const law = yearsOf(p.segment.say)[0]
  if (!rest || !apres || !from || !law || law <= from) return null
  const f = frise({ y: 150, from: from - 60, to: law + 20, x0: 16, x1: 284, ticks: [from], labels: [from], t0: 200 })
  const xa = f.X(from)
  const xb = f.X(law)
  return (
    <Seg>
      <Art h={178}>
        <Fig n="vitrine" x={18} y={0} size={86} t0={100} />
        {coll ? <Txt x={61} y={110} text={coll.text} max={15} size={14} tone="soft" t0={500} /> : null}
        <Arrow x1={110} y1={44} x2={176} y2={44} dash t0={700} />
        {rest.shown ? <Fig n="restitution" x={186} y={2} size={84} tone="count" t0={200} /> : null}
        {f.el}
        {apres.shown ? (
          <>
            <Fade t0={200} class="vc-count">
              <rect class="vc-tint-count" x={xa} y={143} width={xb - xa} height={14} />
              <path d={`M${xa} 143H${xb}V157H${xa}Z`} />
            </Fade>
            <Txt x={(xa + xb) / 2 + 20} y={136} text={apres.text} size={15} tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Des biens culturels pris entre 1815 et 1972 : un vase et sa flèche de retour ; la période sur une frise */
const memoire07: Board = p => {
  const [per, rest] = cuesOf(p)
  const [a, b] = yearsOf(per?.text ?? '')
  if (!per || !a || !b || b <= a) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={108}>
        <Fig n="vase" x={6} y={14} size={84} t0={100} />
        {rest?.shown ? <Ink d="M96 40C112 8 76 0 66 12M66 12l1 9M66 12l9 -1" t0={0} dur={700} class="vc-count" /> : null}
        {periode({ a, b, y: 72, x0: 118, x1: 290, pad: 20, shown: per.shown })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Reconnaître, ouvrir, restituer : jusqu'où aller ? » : trois pictogrammes légendés, puis la question */
const memoire08: Board = p => {
  const verbs: [RegExp, Nom][] = [
    [/reconnaître/, 'document'],
    [/ouvrir/, 'archives'],
    [/restituer/, 'restitution'],
  ]
  const words = verbs.map(([re, n]) => ({ w: word(p, re), n }))
  if (words.some(x => !x.w)) return null
  return (
    <Seg kind="ask">
      <Art h={102}>
        {words.map(({ w, n }, i) => (
          <g key={n}>
            <Fig n={n} x={8 + i * 70} y={6} size={56} t0={200 + i * 300} />
            <Txt x={36 + i * 70} y={90} text={w!.text} size={14} t0={400 + i * 300} />
          </g>
        ))}
        <Arrow x1={214} y1={34} x2={236} y2={34} dash t0={1200} />
        <Ask x={246} y={4} h={60} t0={1400} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— La loi et l'histoire ——— */

/** 01 « Une loi peut-elle dire comment enseigner l'histoire ? » : un texte de loi, une flèche, un livre */
const histoire01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={116}>
      <Picto n="document" x={30} y={8} size={100} t0={100} />
      <Arrow x1={134} y1={58} x2={170} y2={58} dash t0={700} />
      <Picto n="livre" x={176} y={10} size={96} t0={900} />
    </Art>
  </Seg>
)

/** Le texte de loi dont une ligne, la disposition, est surlignée ; barrée quand elle est abrogée */
function Disposition({ abrogee, kept }: { abrogee: boolean; kept?: boolean }) {
  return (
    <>
      <Picto n="document" x={8} y={4} size={112} t0={100} kept={kept} />
      <Fade t0={700} kept={kept} class={abrogee ? 'vc-ghost' : 'vc-count'}>
        <rect class="vc-tint-count" x={40} y={58} width={58} height={18} />
        <path d="M40 58H98V76H40Z" />
      </Fade>
      {abrogee ? <Ink d="M34 67H104" t0={200} dur={500} class="vc-count vc-bold" /> : null}
    </>
  )
}

/** 02 La loi de 2005 demande aux programmes scolaires de reconnaître… : une ligne surlignée, vers le livre */
const histoire02: Board = p => {
  const [year, prog] = cuesOf(p)
  if (!year || !prog) return null
  return (
    <Seg>
      <Head lines={[lineOf(year)]} />
      <Art h={156}>
        <Disposition abrogee={false} />
        <Arrow x1={126} y1={66} x2={168} y2={66} t0={1100} />
        {prog.shown ? (
          <>
            <Picto n="livre" x={176} y={18} size={100} t0={0} />
            <Txt x={226} y={136} text={prog.text} max={12} size={14} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Abrogée en 2006 : la ligne est barrée ; entre la loi et les programmes, un trait en pointillé */
const histoire03: Board = p => {
  const [abrogee, releve] = cuesOf(p)
  if (!abrogee || !releve) return null
  return (
    <Seg>
      <Head lines={[lineOf(abrogee)]} />
      <Art h={156}>
        <Disposition abrogee={abrogee.shown} kept />
        <Picto n="livre" x={176} y={18} size={100} kept />
        {releve.shown ? (
          <>
            <Fade t0={0} class="vc-soft vc-dash">
              <path d="M148 10V116" />
            </Fade>
            <Txt x={W / 2} y={146} text={releve.text} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le rôle du Parlement n'est pas d'adopter des lois sur des faits historiques : le texte de loi en pointillé */
const histoire04: Board = p => {
  const role = cueOf(p, 0)
  if (!role) return null
  return (
    <Seg>
      <Head lines={[lineOf(role)]} />
      <LoiEtHistoire p={p} doc="ghost" label={null} />
    </Seg>
  )
}

/** 05 Les résolutions, un meilleur outil selon la mission : à la place de la loi, un texte au bleu bille */
const histoire05: Board = p => {
  const reso = cueOf(p, 0)
  if (!reso) return null
  return (
    <Seg>
      <Head lines={[lineOf(reso)]} />
      <LoiEtHistoire p={p} doc="count" label={null} />
    </Seg>
  )
}

/** 06 La France a reconnu plusieurs crimes : un document ; « sans présenter d'excuses officielles », écrit en gris */
const histoire06: Board = p => {
  const reconnu = cueOf(p, 0)
  const guerre = word(p, /la guerre d’Algérie/)
  const sans = word(p, /Sans présenter d’excuses officielles/)
  if (!reconnu) return null
  return (
    <Seg>
      <Head lines={[lineOf(reconnu)]} />
      <Art h={136}>
        <Picto n="document" x={20} y={4} size={100} t0={100} tone={reconnu.shown ? 'count' : undefined} />
        {guerre ? <Txt x={70} y={128} text={guerre.text} size={14} tone="soft" t0={500} /> : null}
        {sans?.shown ? <Txt x={214} y={50} text={sans.text} max={14} size={16} tone="soft" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Une commission mixte d'historiens : deux groupes semblables autour d'une table, un livre au milieu */
const histoire07: Board = p => {
  const com = cueOf(p, 0)
  const year = yearsOf(p.segment.say)[0]
  if (!com) return null
  const left = [44, 80, 116]
  const right = [184, 220, 256]
  return (
    <Seg>
      <Head lines={[lineOf(com)]} />
      <Art h={124}>
        {year ? <Txt x={W / 2} y={18} text={String(year)} size={15} tone="soft" t0={100} /> : null}
        {[...left, ...right].map((cx, i) => (
          <Picto key={cx} n="personne" x={cx - 16} y={34} size={32} t0={300 + i * 120} w={0.9} />
        ))}
        <Ink d="M30 92a120 18 0 1 0 240 0a120 18 0 1 0-240 0" t0={100} dur={800} />
        <Picto n="livre" x={132} y={74} size={36} t0={1200} />
      </Art>
    </Seg>
  )
}

/** 08 « Comment la France doit-elle aborder l'histoire de la colonisation ? » : un livre, et la question */
const histoire08: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Picto n="livre" x={60} y={6} size={90} t0={100} />
      <Ask x={180} y={8} h={84} t0={900} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const LAICITE_REPUBLIQUE: Record<string, Board> = {
  'laicite-intro-01': intro01,
  'laicite-intro-02': intro02,
  'laicite-intro-03': intro03,
  'laicite-intro-04': intro04,
  'laicite-intro-05': intro05,
  'laicite-intro-06': intro06,
  'laicite-intro-07': intro07,
  'laicite-intro-08': intro08,
  'laicite-principe-01': principe01,
  'laicite-principe-02': principe02,
  'laicite-principe-03': principe03,
  'laicite-principe-04': principe04,
  'laicite-principe-05': principe05,
  'laicite-principe-06': principe06,
  'laicite-principe-07': principe07,
  'laicite-principe-08': principe08,
  'laicite-signes-01': signes01,
  'laicite-signes-02': signes02,
  'laicite-signes-03': signes03,
  'laicite-signes-04': signes04,
  'laicite-signes-05': signes05,
  'laicite-signes-06': signes06,
  'laicite-discriminations-01': discriminations01,
  'laicite-discriminations-02': discriminations02,
  'laicite-discriminations-03': discriminations03,
  'laicite-discriminations-04': discriminations04,
  'laicite-discriminations-05': discriminations05,
  'laicite-discriminations-06': discriminations06,
  'laicite-discriminations-07': discriminations07,
  'laicite-memoire-01': memoire01,
  'laicite-memoire-02': memoire02,
  'laicite-memoire-03': memoire03,
  'laicite-memoire-04': memoire04,
  'laicite-memoire-05': memoire05,
  'laicite-memoire-06': memoire06,
  'laicite-memoire-07': memoire07,
  'laicite-memoire-08': memoire08,
  'laicite-histoire-01': histoire01,
  'laicite-histoire-02': histoire02,
  'laicite-histoire-03': histoire03,
  'laicite-histoire-04': histoire04,
  'laicite-histoire-05': histoire05,
  'laicite-histoire-06': histoire06,
  'laicite-histoire-07': histoire07,
  'laicite-histoire-08': histoire08,
}
