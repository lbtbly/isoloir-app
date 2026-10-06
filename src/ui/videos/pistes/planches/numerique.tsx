// Piste C, les planches de la série « Numérique » (src/ui/videos/series/numerique.ts) : un dessin par passage,
// composé avec la bibliothèque commune (../dessin/), comme retraites.tsx et logement.tsx. Les mots et les nombres
// viennent du script (mots mis en valeur, phrases dites, chiffre et graphique de la fiche) : si le texte change,
// le dessin suit ; s'il ne s'y retrouve plus (une planche rend null), le passage prend le dessin générique.
// Quelques pictogrammes manquaient à la bibliothèque commune (téléphone, puce d'IA, bulle, écran de vidéo,
// journal, globe, armoire de serveurs…) : ils sont dessinés ici, au trait, sans attribut ni logo.

import type { ComponentChildren } from 'preact'
import { chartOf } from '../../model'
import { NUMERIQUE as SERIE } from '../../series/numerique'
import { Art, Arrow, Ask, Brace, Fade, Ink, Marks, Txt, W, at, cls, cueOf, cuesOf, fractionOf, heard, num, plain, ratioOf, sentencesOf, word, wrap, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, HeadCues, Libelle, Question, Seg, Signature, Src, Sur100, listAfterColon } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Rang, balance, barres, colonnes, frise, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Espace insécable, pour composer un nombre et son unité */
const NB = String.fromCharCode(0xa0)

/** Un nombre à la française (18.16 → « 18,16 ») */
const fr = (n: number) => String(n).replace('.', ',')

/* ——— Les pictogrammes de la série ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

interface Def {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat */
  fill?: string
  thin?: number[]
  bold?: number[]
}

const PHONE = 'M15 3H33a3 3 0 0 1 3 3V42a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z'
const TABLET = 'M7 8H41a3 3 0 0 1 3 3V37a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3Z'

/** Pictogrammes au trait, dans un carré de 48 unités, comme ceux de la bibliothèque commune */
const DESSINS = {
  /** Un téléphone : la coque, le haut et le bas de l'écran, le bouton */
  telephone: { s: [PHONE, 'M12 9H36M12 38H36', 'M22 41.5h4'], fill: PHONE, thin: [1], bold: [2] },
  /** Une tablette dont l'écran montre une vidéo */
  tablette: { s: [TABLET, 'M9 12H39V36H9Z', 'M21 18.5L29.5 24L21 29.5Z'], fill: TABLET, thin: [1] },
  /** Une puce électronique : l'intelligence artificielle, sans visage ni robot */
  puce: {
    s: ['M14 14H34V34H14Z', 'M19 8v6M24 8v6M29 8v6M19 34v6M24 34v6M29 34v6M8 19h6M8 24h6M8 29h6M34 19h6M34 24h6M34 29h6', 'M20 20h8v8h-8z'],
    fill: 'M14 14H34V34H14Z',
    thin: [2],
  },
  /** Une usine : les toits en dents de scie et la cheminée, deux fenêtres */
  usine: {
    s: ['M4 44V26L15 19V26L26 19V26L34 20V6H41V44Z', 'M10 32H17V38H10ZM22 32H29V38H22Z'],
    fill: 'M4 44V26L15 19V26L26 19V26L34 20V6H41V44Z',
    thin: [1],
  },
  /** Une bulle de message, deux lignes de texte */
  bulle: { s: ['M5 8H43V32H22L13 41V32H5Z', 'M12 16H36M12 24H28'], fill: 'M5 8H43V32H22L13 41V32H5Z', thin: [1] },
  /** Un écran de vidéo et son bouton de lecture */
  video: { s: ['M4 10H44V38H4Z', 'M20 17L31 24L20 31Z'], fill: 'M4 10H44V38H4Z' },
  /** Un journal : la page, la photo, les colonnes */
  journal: { s: ['M7 6H41V42H7Z', 'M12 11H36V19H12Z', 'M12 25H22M12 30H22M12 35H22M26 25H36M26 30H36M26 35H36'], fill: 'M7 6H41V42H7Z', thin: [2] },
  /** Un globe : le cercle, les parallèles, un méridien */
  globe: { s: [circle(24, 24, 19), 'M5 24H43M9 14H39M9 34H39', 'M24 5C13 13 13 35 24 43C35 35 35 13 24 5'], fill: circle(24, 24, 19), thin: [1, 2] },
  /** Une armoire de serveurs : un centre de calcul */
  serveur: {
    s: ['M9 4H39V44H9Z', 'M9 17H39M9 31H39', 'M14 10.5h.5M14 24h.5M14 37.5h.5', 'M21 10.5H34M21 24H34M21 37.5H34'],
    fill: 'M9 4H39V44H9Z',
    thin: [1, 3],
    bold: [2],
  },
  /** Un poste de télévision et son antenne */
  tele: { s: ['M5 13H43V39H5Z', 'M17 5L24 13L31 5', 'M16 44H32'], fill: 'M5 13H43V39H5Z' },
  /** Une cloche : les notifications */
  cloche: { s: ['M13 34V22a11 11 0 0 1 22 0V34', 'M8 34H40', 'M20 38.5a4 4 0 0 0 8 0'], fill: 'M13 34V22a11 11 0 0 1 22 0V34Z', bold: [1] },
  /** Des vignettes qui défilent, et la flèche qui descend sans fin */
  defilement: { s: ['M6 5H30V15H6ZM6 19H30V29H6ZM6 33H30V43H6Z', 'M39 6V42', 'M34 37L39 42L44 37'], thin: [0] },
  /** Un bouton de lecture */
  lecture: { s: [circle(24, 24, 19), 'M20 15.5L32 24L20 32.5Z'], fill: circle(24, 24, 19) },
} satisfies Record<string, Def>

type DessinName = keyof typeof DESSINS
type Any = PictoName | DessinName

const isDessin = (n: Any): n is DessinName => n in DESSINS

/** Un pictogramme de la série, placé sur la feuille, qui se dessine trait après trait */
function Dessin({ n, x, y, size = 48, t0 = 0, kept, tone, filled, step = 200, w = 1 }: { n: DessinName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; filled?: boolean; step?: number; w?: number }) {
  const d: Def = DESSINS[n]
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

/** Un pictogramme, de la bibliothèque commune ou de la série */
function Fig(props: { n: Any; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; filled?: boolean; w?: number; text?: string }) {
  const { n, text, ...rest } = props
  return isDessin(n) ? <Dessin n={n} {...rest} /> : <Picto n={n} text={text} {...rest} />
}

/** Un pictogramme seul, dans son propre SVG (listes en HTML) */
function Glyphe({ n, t0 = 0 }: { n: Any; t0?: number }) {
  return (
    <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
      <Fig n={n} x={0} y={0} t0={t0} />
    </svg>
  )
}

/** Un pictogramme et son étiquette dessous ; (cx, y) : le milieu de son haut */
function Legende({ n, cx, y, size = 56, label, shown = true, t0 = 0, tone, max = 14, kept }: { n: Any; cx: number; y: number; size?: number; label?: string | null; shown?: boolean; t0?: number; tone?: Tone; max?: number; kept?: boolean }) {
  return (
    <>
      <Fig n={n} x={cx - size / 2} y={y} size={size} t0={t0} tone={tone} kept={kept} />
      {label && shown ? <Txt x={cx} y={y + size + 19} text={label} size={15} max={max} t0={kept ? 0 : t0 + 350} /> : null}
    </>
  )
}

/** Une planche de pictogrammes légendés (les questions d'une introduction), chacun quand la voix le dit */
function Planche({ items, cols = 2 }: { items: { n: Any; text: string; shown: boolean; cues?: Cue[] }[]; cols?: number }) {
  return (
    <ul class="vc-panel" style={{ '--cols': String(cols) }}>
      {items.map((it, i) => (
        <li key={i} class={cls('vc-panel-item', it.shown ? 'vc-rise' : 'vc-wait')}>
          {it.shown ? <Glyphe n={it.n} t0={150} /> : <span class="vc-glyphe" />}
          <span class="vc-panel-text">
            <Marks text={it.text} cues={it.cues ?? []} />
          </span>
        </li>
      ))}
    </ul>
  )
}

/** Le pictogramme de chaque approfondissement, pour le sommaire de l'introduction */
const CHAPITRES: Record<string, Any> = {
  'numerique-ia': 'puce',
  'numerique-ecrans': 'tablette',
  'numerique-plateformes': 'telephone',
  'numerique-medias': 'journal',
}

/** Les approfondissements de la série, en sommaire numéroté, avec les pictogrammes de la série */
function Chapitres({ p, t0 = 200 }: { p: P; t0?: number }) {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  if (!deep.length) return null
  return (
    <ol class="vc-chap">
      {deep.map((v, i) => (
        <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
          <span class="vc-chap-n">{i + 1}</span>
          <Glyphe n={CHAPITRES[v.id] ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
          <span class="vc-chap-t">{v.short}</span>
        </li>
      ))}
    </ol>
  )
}

/** Le pictogramme d'une question de l'introduction, d'après ses mots */
const pictoQuestion = (q: string): Any =>
  /\bIA\b|intelligence/.test(q) ? 'puce' : /enfant|écran/.test(q) ? 'parapluie' : /plateforme/.test(q) ? 'telephone' : /information|médias|presse/.test(q) ? 'journal' : 'document'

/* ——— Communs à la série ——— */

interface Jauge {
  label?: string | null
  value: number
  text: string
  tone?: Tone
  shown: boolean
}

/**
 * Des parts sur cent, à la même échelle : chaque barre part de zéro, le reste jusqu'à 100 en pointillé gris
 * (la place du tout, sans graduation), la valeur dite au bout de la part, sur un liseré papier
 */
function jauges(items: Jauge[], { y = 0, size = 26, gap = 30, x0 = 0, x1 = 240, total = 100, t0 = 0 }: { y?: number; size?: number; gap?: number; x0?: number; x1?: number; total?: number; t0?: number } = {}) {
  const scale = (x1 - x0) / total
  const lab = items.some(i => i.label) ? 21 : 0
  const step = size + gap + lab
  const el = (
    <>
      {items.map((it, i) => {
        const top = y + i * step + lab
        const xe = x0 + Math.min(total, it.value) * scale
        const d = t0 + i * 350
        return (
          <g key={i}>
            {it.label ? <Txt x={x0 + 2} y={top - 7} text={it.label} anchor="start" size={15} t0={d} /> : null}
            <Fade t0={d} class="vc-ghost">
              <path d={`M${x0} ${top}H${x1}V${top + size}H${x0}Z`} />
            </Fade>
            {it.shown ? (
              <g class={it.tone ? `vc-${it.tone}` : undefined}>
                <Fade t0={d + 300}>
                  <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={x0} y={top} width={xe - x0} height={size} />
                </Fade>
                <Ink d={`M${x0} ${top}H${xe}V${top + size}H${x0}Z`} t0={d} dur={650} />
                <Txt x={xe + 7} y={top + size * 0.78} text={it.text} anchor="start" size={20} big halo tone={it.tone === 'count' ? 'count' : undefined} t0={d + 500} />
              </g>
            ) : null}
          </g>
        )
      })}
    </>
  )
  return { el, h: items.length * step - gap }
}

/** Les éléments dits avant « : » (« Industrie, construction, commerce, services ») */
function listBeforeColon(say: string): string[] {
  const i = say.search(/\s:/)
  if (i < 0) return []
  return say
    .slice(0, i)
    .split(/,\s+|\s+et\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

/** Une durée dite « 2 h 33 » en minutes */
const minutes = (s: string | null | undefined) => {
  const m = /(\d+)\s*h\s*(\d+)/.exec(s ?? '')
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

/** Les mois, pour poser une date dite sur une frise */
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/** « février 2025 » → 2025,1 (début du mois) ; « fin 2025 » → 2025,95 ; « début 2025 » → 2025,05 */
function dateOf(s: string | null | undefined): number | null {
  if (!s) return null
  const year = yearsOf(s)[0]
  if (!year) return null
  const t = plain(s).toLowerCase()
  const m = MOIS.findIndex(n => t.includes(n))
  if (m >= 0) return year + (m + 0.1) / 12
  if (/\bfin\b/.test(t)) return year + 0.95
  if (/début/.test(t)) return year + 0.05
  return year + 0.5
}

/** Un seuil franchi (« au-delà de 45 millions d'utilisateurs par mois ») : deux piles d'utilisateurs posées sur
 *  leur téléphone, l'une sous le seuil en pointillé, l'autre au-dessus, qui reçoit le document des règles */
function seuil(p: P) {
  const [cue, strict] = cuesOf(p)
  if (!cue || !num(cue.text)) return null
  const base = 168
  const line = 64
  const pile = (cx: number, n: number, t0: number, tone?: Tone) =>
    range(n).map(k => <Picto key={k} n="personne" x={cx - 11} y={base - 46 - (k + 1) * 21} size={22} t0={t0 + k * 120} w={0.8} tone={tone} />)
  const commission = word(p, /La Commission européenne/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 6}>
        <Ink d={`M10 ${base}H290`} t0={0} dur={500} class="vc-soft" />
        <Dessin n="telephone" x={56} y={base - 44} size={44} t0={150} />
        <Dessin n="telephone" x={136} y={base - 44} size={44} t0={300} />
        {pile(78, 2, 400)}
        {pile(158, 5, 500, cue.shown ? 'count' : undefined)}
        {cue.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d={`M10 ${line}H290`} />
            </Fade>
            <Txt x={12} y={line - 9} text={cue.text} anchor="start" size={17} big tone="count" t0={150} />
          </>
        ) : null}
        {strict?.shown ? (
          <>
            <Arrow x1={184} y1={40} x2={210} y2={40} t0={0} />
            <Picto n="document" x={214} y={12} size={56} tone="count" t0={200} />
            <Txt x={242} y={92} text={strict.text} max={12} size={14} t0={500} />
          </>
        ) : null}
        {commission?.shown ? <Picto n="monument" x={240} y={124} size={40} t0={0} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/**
 * Des lignes « pictogramme, puis ce qui est dit » (une phrase, et sa suite plus petite), chacune quand la voix
 * l'atteint ; la hauteur de chaque ligne suit le nombre de lignes du texte, coupé à « max » signes
 */
function lignes(rows: { n: Any; lines: (Cue | null)[] }[], { size = 46, gap = 18 }: { size?: number; gap?: number } = {}) {
  const M1 = 21
  const M2 = 27
  let y = 0
  const out: ComponentChildren[] = []
  rows.forEach((r, i) => {
    const [a, b] = r.lines
    const n1 = a ? wrap(a.text, M1).length : 1
    const n2 = b ? wrap(b.text, M2).length : 0
    const textH = n1 * 17 * 1.14 + (n2 ? 6 + n2 * 14 * 1.14 : 0)
    const rowH = Math.max(size, textH + 2)
    const top = y
    if (a?.shown) {
      out.push(
        <g key={i}>
          <Fig n={r.n} x={2} y={top + (rowH - size) / 2} size={size} t0={0} />
          <Txt x={size + 18} y={top + 14} text={a.text} max={M1} size={17} anchor="start" t0={200} />
          {b?.shown ? <Txt x={size + 18} y={top + 14 + n1 * 17 * 1.14 + 4} text={b.text} max={M2} size={14} anchor="start" t0={350} /> : null}
        </g>,
      )
    }
    y += rowH + gap
  })
  return { el: <>{out}</>, h: y - gap }
}

/* ——— Introduction ——— */

/** 01 « Qui fixe les règles de ces outils ? » : un téléphone, la puce qui écrit, les vidéos qui défilent */
const intro01: Board = p => {
  const ia = word(p, /intelligence artificielle/)
  const vid = word(p, /vidéos qui défilent/)
  const ask = cueOf(p, 0)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={168}>
        <Dessin n="telephone" x={6} y={2} size={162} t0={100} />
        {ia?.shown ? (
          <>
            <Dessin n="puce" x={70} y={34} size={44} tone="count" t0={0} />
            <Arrow x1={118} y1={52} x2={158} y2={36} t0={400} />
            <Dessin n="bulle" x={160} y={0} size={66} t0={600} />
          </>
        ) : null}
        {vid?.shown ? (
          <>
            <Fade class="vc-ghost">
              <path d="M70 128H114M70 82V128M114 82V128" />
            </Fade>
            <g class="vc-slide-y" style={{ '--from': '26px', ...at(0, 1400) }}>
              <Dessin n="video" x={70} y={78} size={44} t0={0} />
            </g>
            <Arrow x1={140} y1={78} x2={140} y2={128} dash t0={300} />
          </>
        ) : null}
        {ask?.shown ? <Ask x={226} y={84} h={66} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 37,5 % des 16-74 ans ont utilisé une IA générative : la France et l'Union européenne, sur cent */
const intro02: Board = p => {
  const c = chartOf(p.segment)
  const cue = cueOf(p, 0)
  if (!c || c.kind !== 'compare' || !cue) return null
  const g = jauges(
    c.items.map((it, i) => ({ label: it.label, value: it.value, text: i === 0 ? cue.text : `${fr(it.value)}${NB}%`, tone: i === 0 ? ('count' as const) : undefined, shown: i === 0 ? cue.shown : true })),
    { y: 2, x1: 230, t0: 200 },
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Elle se diffuse dans les entreprises comme dans la vie quotidienne ; ses effets sur l'emploi, mal connus */
const intro03: Board = p => {
  const ent = word(p, /les entreprises/)
  const vie = word(p, /la vie quotidienne/)
  const emp = word(p, /l’emploi|l'emploi/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={176}>
        <Dessin n="puce" x={126} y={0} size={48} t0={100} tone="count" />
        {ent?.shown ? (
          <>
            <Arrow x1={124} y1={30} x2={82} y2={52} dash t0={0} />
            <Legende n="immeuble" cx={50} y={56} size={58} label={ent.text} t0={200} max={12} />
          </>
        ) : null}
        {vie?.shown ? (
          <>
            <Arrow x1={150} y1={50} x2={150} y2={62} dash t0={0} />
            <Legende n="maison" cx={150} y={64} size={50} label={vie.text} t0={200} max={12} />
          </>
        ) : null}
        {emp?.shown ? (
          <>
            <Arrow x1={176} y1={30} x2={218} y2={52} dash t0={0} />
            <Legende n="mallette" cx={250} y={56} size={58} label={emp.text} t0={200} max={12} />
            <Ask x={270} y={20} h={34} t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Un quart des 9-11 ans ont accès aux réseaux sociaux, quand il faut 13 ans pour s'y inscrire : quatre
 *  enfants au-dessus de leurs âges, dont un compté ; une barrière sur la ligne des âges */
const intro04: Board = p => {
  const [q, age] = cuesOf(p)
  const frac = fractionOf(q?.text)
  const ages = /(\d+) à (\d+)/.exec(plain(p.segment.say))
  const lim = num(age?.text)
  if (!q || !age || !frac || !ages || !lim) return null
  const a0 = Number(ages[1])
  const a1 = Number(ages[2])
  const n = Math.round(1 / frac)
  const y = 132
  const f = frise({ y, from: 2, to: 16, x0: 16, x1: 284, ticks: range(15).map(k => 2 + k), labels: [3, a0, a1, 15], t0: 100 })
  const mid = f.X((a0 + a1) / 2)
  const { cells, h } = rangCells({ n, x: mid - 64, w: 128, y: 20, max: 26, gap: 8 })
  const lx = f.X(lim)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={y + 30}>
        <Rang n={n} picto="personne" x={mid - 64} w={128} y={20} max={26} gap={8} count={[0]} shown={q.shown} t0={300} stagger={150} />
        <Fade t0={900} class="vc-dash vc-soft">
          <path d={`M${cells[0]!.x} ${20 + h + 8}L${f.X(a0)} ${y - 12}M${cells[cells.length - 1]!.x + cells[0]!.size} ${20 + h + 8}L${f.X(a1)} ${y - 12}`} />
        </Fade>
        <Brace x1={f.X(a0)} y1={y - 8} x2={f.X(a1)} y2={y - 8} side={-1} t0={1000} tone="count" />
        {f.el}
        {age.shown ? (
          <>
            <Barriere x={lx} y={y} s={0.9} t0={0} />
            <Txt x={lx + 8} y={y - 48} text={age.text} anchor="start" size={18} big t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Au-delà de 45 millions d'utilisateurs par mois, les règles les plus strictes */
const intro05: Board = p => seuil(p)

/** 06 Les quatre questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro06: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Planche cols={2} items={qs.map(q => ({ n: pictoQuestion(q), text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))} />
    </Seg>
  )
}

/** 07 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro07: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Intelligence artificielle ——— */

/** Le pictogramme d'un secteur, d'après son nom */
const secteur = (s: string): Any =>
  /industrie/i.test(s) ? 'usine' : /construction|bâtiment/i.test(s) ? 'grue' : /commerce/i.test(s) ? 'etiquette' : /service/i.test(s) ? 'mallette' : 'immeuble'

/** 01 « Industrie, construction, commerce, services : l'IA arrive dans les entreprises » : la puce, et une
 *  flèche vers chaque secteur, quand la voix le nomme */
const ia01: Board = p => {
  const list = listBeforeColon(p.segment.say).slice(0, 4)
  if (list.length < 2) return null
  const row = 38
  const h = list.length * row + 4
  const cy = h / 2
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={h}>
        <Dessin n="puce" x={8} y={cy - 42} size={84} t0={100} tone="count" />
        {list.map((t, i) => {
          const yc = 2 + i * row + row / 2
          return heard(p, t) ? (
            <g key={t}>
              <Arrow x1={96} y1={cy} x2={136} y2={yc} t0={0} head={6} />
              <Fig n={secteur(t)} x={142} y={yc - 16} size={32} t0={150} />
              <Txt x={184} y={yc + 6} text={t.toLowerCase()} anchor="start" size={16} t0={350} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 02 Les entreprises d'au moins 10 personnes qui utilisent l'IA : France 2024, France 2025, Union européenne
 *  2025, à la même échelle (le graphique de la fiche) */
const ia02: Board = p => {
  const c = chartOf(p.segment)
  const [a, b] = cuesOf(p)
  if (!c || c.kind !== 'compare' || !a || !b || c.items.length < 3) return null
  const texts = [a.text, b.text]
  const g = barres({
    items: c.items.map((it, i) => ({
      label: it.label,
      value: it.value,
      text: texts[i] ?? `${fr(it.value)}${NB}%`,
      tone: i === 1 ? ('count' as const) : i === 2 ? ('soft' as const) : undefined,
      shown: i === 0 ? a.shown : i === 1 ? b.shown : b.shown,
    })),
    y: 2,
    size: 22,
    gap: 30,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Les emplois exposés à l'IA générative dans les pays à revenu élevé, sur cent ; pour comparer, les pays à
 *  faible revenu (le graphique de la fiche ; la seconde valeur est dans « alt ») */
const ia03: Board = p => {
  const c = chartOf(p.segment)
  const a = cueOf(p, 0)
  const va = num(a?.text)
  if (!c || c.kind !== 'compare' || !a || va === null) return null
  const g = jauges(
    c.items.slice(0, 2).map((it, i) => ({
      label: it.label,
      value: it.value,
      text: i === 0 ? a.text : `${fr(it.value)}${NB}%`,
      tone: i === 0 ? ('count' as const) : undefined,
      shown: a.shown,
    })),
    { y: 2, x1: 230, t0: 200 },
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Des tâches qui exigent une intervention humaine ; l'effet probable, une transformation des emplois : la
 *  personne se relie aux tâches du métier, puis la puce s'y relie à son tour (aucune tâche comptée : la fiche
 *  ne dit pas combien) */
const ia04: Board = p => {
  const [humain, transfo] = cuesOf(p)
  const taches = word(p, /des tâches/)
  const x0 = 78
  const cell = (i: number) => x0 + i * 25
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="mallette" x={110} y={0} size={80} t0={100} />
        <Cases n={6} cols={6} x={x0} y={100} size={19} gap={6} t0={400} />
        {taches ? <Txt x={150} y={142} text={taches.text} size={14} tone="soft" t0={700} /> : null}
        {humain?.shown ? (
          <>
            <Picto n="personne" x={236} y={56} size={58} t0={0} />
            <Arrow x1={232} y1={92} x2={cell(5) + 22} y2={106} t0={300} head={6} />
          </>
        ) : null}
        {transfo?.shown ? (
          <>
            <Dessin n="puce" x={6} y={52} size={56} t0={0} tone="count" />
            <Arrow x1={60} y1={92} x2={x0 - 4} y2={106} t0={400} head={6} tone="count" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Les recettes de la protection sociale : cotisations sociales, contributions publiques (le graphique de la
 *  fiche), en parts d'un même disque */
const ia05: Board = p => {
  const c = chartOf(p.segment)
  const [a, b] = cuesOf(p)
  if (!c || c.kind !== 'compare' || c.items.length < 2 || !a || !b) return null
  const [ca, cb] = c.items as [{ label: string; value: number }, { label: string; value: number }]
  const cx = 150
  const cy = 64
  const r = 60
  const pt = (f: number) => {
    const t = Math.min(0.9999, f) * 2 * Math.PI
    return `${(cx + r * Math.sin(t)).toFixed(1)} ${(cy - r * Math.cos(t)).toFixed(1)}`
  }
  const fa = ca.value / 100
  const fb = (ca.value + cb.value) / 100
  const sliceB = `M${cx} ${cy}L${pt(fa)}A${r} ${r} 0 ${fb - fa > 0.5 ? 1 : 0} 1 ${pt(fb)}Z`
  const sliceA = `M${cx} ${cy}V${cy - r}A${r} ${r} 0 ${fa > 0.5 ? 1 : 0} 1 ${pt(fa)}Z`
  const legend = (y: number, cue: Cue, label: string, count: boolean) =>
    cue.shown ? (
      <g class={count ? 'vc-count' : undefined}>
        <Fade t0={0}>
          <rect class={count ? 'vc-tint-count' : 'vc-tint'} x={28} y={y - 13} width={16} height={16} />
          <path d={`M28 ${y - 13}h16v16h-16z`} />
        </Fade>
        <Txt x={54} y={y} text={label} anchor="start" size={15} t0={100} />
        <Txt x={290} y={y + 1} text={cue.text} anchor="end" size={19} big tone={count ? 'count' : undefined} t0={200} />
      </g>
    ) : null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={190}>
        <Ink d={`M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`} t0={100} dur={900} />
        {a.shown ? (
          <Fade t0={500} class="vc-count">
            <path class="vc-tint-count" d={sliceA} />
            <path d={sliceA} />
          </Fade>
        ) : null}
        {b.shown ? (
          <Fade t0={200}>
            <path class="vc-tint" d={sliceB} />
            <path d={sliceB} />
          </Fade>
        ) : null}
        {legend(156, a, ca.label, true)}
        {legend(182, b, cb.label, false)}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Un règlement européen, quatre niveaux de risque : le document, et une pyramide de quatre étages */
const ia06: Board = p => {
  const cue = cueOf(p, 0)
  const n = num(/(\S+)\s+niveaux/.exec(cue?.text ?? '')?.[1])
  const risque = word(p, /risque/)
  if (!cue || !n || n > 6) return null
  const base = 140
  const top = 18
  const hb = (base - top) / n
  const half = (k: number) => 90 - (k * 72) / n
  const cx = 186
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="document" x={2} y={30} size={88} t0={100} />
        {range(n).map(k => {
          const yb = base - k * hb
          const yt = yb - hb
          const d = `M${cx - half(k)} ${yb}L${cx - half(k + 1)} ${yt}H${cx + half(k + 1)}L${cx + half(k)} ${yb}Z`
          return cue.shown || k === 0 ? (
            <g key={k}>
              {k === n - 1 ? (
                <Fade t0={600 + k * 250} class="vc-count">
                  <path class="vc-tint-count" d={d} />
                </Fade>
              ) : null}
              <Ink d={d} t0={300 + k * 250} dur={500} class={k === n - 1 ? 'vc-count' : undefined} />
            </g>
          ) : null
        })}
        {risque && cue.shown ? (
          <>
            <Arrow x1={290} y1={base} x2={290} y2={top + 4} t0={1400} tone="soft" head={7} />
            <Txt x={284} y={top - 4} text={risque.text} anchor="end" size={14} tone="soft" t0={1500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Le calendrier du règlement : deux étapes franchies (février et août 2025), une à venir (décembre 2027).
 *  Frise à l'échelle ; la première date s'écrit sous la ligne, les deux autres au-dessus, pour ne pas se toucher */
const ia07: Board = p => {
  const cues = cuesOf(p)
  const things = [word(p, /interdites/), word(p, /grands modèles/), word(p, /haut risque/)]
  const dates = cues.map(c => dateOf(c.text))
  if (cues.length < 3 || dates.some(d => d === null)) return null
  const from = Math.floor(Math.min(...(dates as number[])))
  const to = Math.ceil(Math.max(...(dates as number[])))
  const y = 100
  const f = frise({ y, from, to, x0: 24, x1: 276, ticks: range(to - from + 1).map(k => from + k), t0: 100 })
  const now = yearsOf(p.script.sources.find(s => /IA/.test(s.title))?.date ?? '')[0] ?? from + 1
  // Où écrire la date et ce qui s'applique : sous la ligne pour la première, au-dessus pour les autres
  const rows = [
    { date: y + 26, thing: y + 45, anchor: 'start' as const },
    { date: y - 46, thing: y - 66, anchor: 'start' as const },
    { date: y - 46, thing: y - 66, anchor: 'end' as const },
  ]
  return (
    <Seg>
      <Art h={y + 54}>
        {f.el}
        {cues.map((c, i) => {
          const x = f.X(dates[i]!)
          const future = dates[i]! > now + 0.9
          const r = rows[i]!
          const tx = r.anchor === 'start' ? x - 3 : x + 3
          return c.shown ? (
            <g key={c.text}>
              <Picto n="drapeau" x={x - 9} y={y - 36} size={38} tone={future ? 'ghost' : 'count'} t0={0} />
              <Txt x={tx} y={r.date} text={c.text} anchor={r.anchor} size={16} big tone={future ? undefined : 'count'} t0={200} />
              {things[i] ? <Txt x={tx} y={r.thing} text={things[i]!.text} anchor={r.anchor} size={14} t0={400} /> : null}
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 08 Une convention du Conseil de l'Europe, négociée aussi avec d'autres États ; signée par l'Union en 2024 */
const ia08: Board = p => {
  const names = [word(p, /le Canada/), word(p, /les États-Unis/), word(p, /le Japon/)]
  const signed = cueOf(p, 1)
  const place: [number, number, 'start' | 'end'][] = [
    [100, 40, 'end'],
    [100, 76, 'end'],
    [196, 30, 'start'],
  ]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Dessin n="globe" x={104} y={20} size={88} t0={100} />
        {names.map((nm, i) =>
          nm?.shown ? <Txt key={i} x={place[i]![0]} y={place[i]![1]} text={nm.text.replace(/^(le|les)\s/, '')} anchor={place[i]![2]} size={15} t0={100} /> : null,
        )}
        {signed?.shown ? (
          <>
            <Picto n="document" x={206} y={64} size={66} t0={0} tone="count" />
            <Ink d="M210 142c8-10 14-10 18-2s10 8 16-2 12-8 18 0" t0={500} dur={600} class="vc-count" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 Le premier traité international contraignant sur l'IA : droits humains, démocratie, État de droit */
const ia09: Board = p => {
  const dh = word(p, /les droits humains/)
  const demo = word(p, /la démocratie/)
  const edd = word(p, /l’État de droit|l'État de droit/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        {dh?.shown ? <Legende n="personne" cx={50} y={14} size={56} label={dh.text} max={11} t0={0} /> : null}
        {demo?.shown ? (
          <>
            {[124, 150, 176].map((cx, i) => (
              <Picto key={cx} n="personne" x={cx - 14} y={i === 1 ? 22 : 34} size={28} t0={i * 150} w={0.9} />
            ))}
            <Ink d="M114 70H186" t0={500} dur={400} class="vc-soft" />
            <Txt x={150} y={89} text={demo.text} size={15} max={14} t0={300} />
          </>
        ) : null}
        {edd?.shown ? <Legende n="monument" cx={250} y={14} size={56} label={edd.text} max={11} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 10 InvestAI : 200 milliards d'euros à mobiliser ; un dixième, 20 milliards, pour quatre giga-fabriques */
const ia10: Board = p => {
  const [all, part] = cuesOf(p)
  const va = num(all?.text)
  const vb = num(part?.text)
  const nFab = num(/(\S+)\s+«?\s*giga/.exec(plain(p.segment.say))?.[1])
  const giga = word(p, /giga-fabriques/)
  if (!all || !part || !va || !vb || !nFab || nFab > 6) return null
  const n = Math.round(va / vb)
  if (n < 2 || n > 12 || Math.abs(n * vb - va) > 0.001) return null
  const row = rangCells({ n, x: 6, w: 288, y: 46, max: 24, gap: 4 })
  const first = row.cells[0]!
  const last = row.cells[row.cells.length - 1]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={160}>
        {all.shown ? (
          <>
            <Brace x1={first.x} y1={40} x2={last.x + last.size} y2={40} side={-1} t0={600} />
            <Txt x={W / 2} y={16} text={all.text} size={16} t0={800} />
          </>
        ) : null}
        <Rang n={n} picto="pieces" x={6} w={288} y={46} max={24} gap={4} count={[0]} shown={part.shown} t0={100} stagger={60} />
        {part.shown ? (
          <>
            <Arrow x1={first.x + first.size / 2} y1={76} x2={first.x + first.size / 2} y2={100} t0={200} tone="count" head={6} />
            <Txt x={first.x + first.size + 8} y={94} text={part.text} anchor="start" size={15} tone="count" t0={300} />
            {range(nFab).map(k => (
              <Dessin key={k} n="serveur" x={6 + k * 44} y={108} size={44} t0={500 + k * 200} tone="count" />
            ))}
            {giga ? <Txt x={6 + nFab * 44 + 8} y={136} text={giga.text} anchor="start" size={14} t0={1300} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 11 « Face à l'IA, quelle priorité, et à quelle échelle ? » : la puce au centre de cercles de plus en plus
 *  larges */
const ia11: Board = p => (
  <Seg kind="ask">
    <Art h={124}>
      {[24, 42, 60].map((r, i) => (
        <Fade key={r} t0={300 + i * 250} class="vc-dash vc-soft">
          <path d={circle(110, 62, r)} />
        </Fade>
      ))}
      <Dessin n="puce" x={92} y={44} size={36} t0={100} tone="count" />
      <Ask x={210} y={22} h={72} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Enfants et écrans ——— */

/** 01 « Comment les protéger ? » : un enfant devant une tablette, un parapluie au-dessus */
const ecrans01: Board = p => {
  const ask = cueOf(p, 0)
  const ecran = word(p, /les écrans/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={150}>
        <Picto n="personne" x={34} y={84} size={58} t0={100} />
        {ecran?.shown ? <Dessin n="tablette" x={110} y={50} size={100} t0={0} /> : null}
        {ask?.shown ? (
          <>
            <Picto n="parapluie" x={20} y={8} size={86} tone="count" t0={0} />
            <Ask x={236} y={40} h={60} t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Le temps d'écran par jour, sur le temps de loisirs : les 9-11 ans et les 3-5 ans, à la même échelle */
const ecrans02: Board = p => {
  const [a, b] = cuesOf(p)
  const ma = minutes(a?.text)
  const mb = minutes(b?.text)
  const ages = [...plain(p.segment.say).matchAll(/(\d+) à (\d+) ans/g)].map(m => m[0])
  if (!a || !b || !ma || !mb || ages.length < 2) return null
  const g = barres({
    items: [
      { label: ages[0], value: ma, text: a.text, tone: 'count', shown: a.shown },
      { label: ages[1], value: mb, text: b.text, shown: b.shown },
    ],
    y: 2,
    size: 26,
    gap: 26,
    room: 84,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Il faut 13 ans pour s'inscrire ; 25 % des 9-11 ans y avaient accès (et, si le texte le dit, une part de
 *  plus : « 30 % des filles de cet âge ») */
const ecrans03: Board = p => {
  const [lim, a, b] = cuesOf(p)
  const ages = /(\d+) à (\d+) ans/.exec(plain(p.segment.say))?.[0]
  const filles = word(p, /des filles de cet âge/)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!lim || !a || !va || !ages) return null
  const items: Jauge[] = [{ label: ages, value: va, text: a.text, tone: 'count', shown: a.shown }]
  if (b && vb) items.push({ label: filles?.text.replace(/^des\s/, '') ?? null, value: vb, text: b.text, tone: 'count', shown: b.shown })
  const g = jauges(items, { y: 64, x1: 230, size: 24, gap: 22, t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={64 + g.h + 4}>
        <Ink d="M4 44H130" t0={0} dur={400} class="vc-soft" />
        <Barriere x={54} y={44} s={0.95} t0={100} />
        {lim.shown ? <Txt x={66} y={34} text={lim.text} anchor="start" size={20} big t0={300} /> : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 9 parents sur 10 limitent le temps d'écran ; le contrôle fréquent des contenus, lui, baisse avec l'âge :
 *  dix parents, dont neuf comptés, puis une flèche qui descend (aucune part dessinée : le texte n'en dit pas) */
const ecrans04: Board = p => {
  const [r, baisse] = cuesOf(p)
  const ratio = ratioOf(r?.text)
  const ctrl = word(p, /Le contrôle fréquent des contenus|Le contrôle des contenus/)
  if (!r || !ratio || ratio.n > 12) return null
  const row = rangCells({ n: ratio.n, y: 2, max: 26, gap: 4 })
  const head = 2 + row.h + 30
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={head + 58}>
        <Rang n={ratio.n} picto="personne" y={2} max={26} gap={4} count={range(ratio.k)} shown={r.shown} t0={100} stagger={60} />
        {ctrl?.shown ? <Txt x={2} y={head} text={ctrl.text} anchor="start" size={15} tone="soft" t0={0} /> : null}
        {baisse?.shown ? (
          <>
            <Picto n="baisse" x={2} y={head + 10} size={46} tone="count" t0={0} />
            <Txt x={58} y={head + 42} text={baisse.text} anchor="start" size={18} big tone="count" t0={250} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Les signes proches de l'addiction aux réseaux sociaux : 7 % en 2018, 11 % en 2022 */
const ecrans05: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  if (cues.length < 2 || years.length < 2) return null
  const items = cues
    .slice(0, 2)
    .map((c, i) => ({ c, year: years[i]!, v: num(c.text) ?? 0 }))
    .sort((x, y) => x.year - y.year)
  const last = items[items.length - 1]!.year
  const cols = colonnes({
    items: items.map(it => ({ label: String(it.year), value: it.v, text: it.c.text, tone: it.year === last ? ('count' as const) : undefined, shown: it.c.shown })),
    x: 70,
    w: 160,
    y: 4,
    h: 108,
    colW: 52,
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

/** 06 L'Anses relève des risques, surtout pour la santé mentale des adolescents : son expertise, une flèche, un
 *  adolescent, et le cœur compté quand la voix dit « la santé mentale » */
const ecrans06: Board = p => {
  const sante = cueOf(p, 0)
  const ado = word(p, /des adolescents/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={136}>
        <Picto n="document" x={10} y={22} size={92} t0={100} />
        <Arrow x1={112} y1={68} x2={160} y2={68} t0={500} />
        <Picto n="personne" x={168} y={28} size={80} t0={700} />
        {sante?.shown ? <Picto n="coeur" x={246} y={18} size={40} tone="count" t0={0} /> : null}
        {ado?.shown ? <Txt x={208} y={130} text={ado.text.replace(/^des\s/, '')} size={15} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Ce que recommande l'Anses : agir d'abord sur la conception des réseaux ; faire respecter la limite de
 *  13 ans, avec une vérification fiable de l'âge ; et aussi l'éducation au numérique et l'accompagnement parental
 *  (une ligne par idée dite) */
const ecrans07: Board = p => {
  const rows: { n: Any; lines: (Cue | null)[] }[] = [
    { n: 'telephone', lines: [word(p, /agir d’abord sur la conception des réseaux|agir d'abord sur la conception des réseaux/), null] },
    { n: 'barriere', lines: [word(p, /faire respecter la limite de \d+ ans/), word(p, /du droit européen/)] },
    { n: 'loupe', lines: [word(p, /une vérification fiable de l’âge|une vérification fiable de l'âge/), null] },
    { n: 'livre', lines: [word(p, /l’éducation au numérique|l'éducation au numérique/), word(p, /l’accompagnement parental|l'accompagnement parental/)] },
  ]
  const dites = rows.filter(r => r.lines[0])
  if (dites.length < 2) return null
  const l = lignes(dites, { size: 40, gap: 12 })
  return (
    <Seg>
      <Art h={l.h + 4}>{l.el}</Art>
    </Seg>
  )
}

/** 08 La loi de juillet 2026 interdisait les réseaux sociaux avant 15 ans ; en août, le Conseil
 *  constitutionnel a censuré cette interdiction */
const ecrans08: Board = p => {
  const [ban, cens] = cuesOf(p)
  const juillet = word(p, /juillet \d{4}/)
  const aout = word(p, /En août/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Picto n="document" x={20} y={4} size={110} t0={100} tone={cens?.shown ? 'ghost' : undefined} />
        {juillet ? <Txt x={75} y={140} text={juillet.text} size={15} tone="soft" t0={500} /> : null}
        {aout?.shown ? (
          <>
            <Picto n="monument" x={190} y={18} size={92} t0={0} />
            <Txt x={236} y={140} text={aout.text.replace(/^En\s/, '')} size={15} tone="soft" t0={200} />
          </>
        ) : null}
        {cens?.shown ? (
          <>
            <Ink d="M30 112L124 22" t0={0} dur={500} class="vc-bold" />
            <Arrow x1={184} y1={64} x2={140} y2={64} dash t0={200} />
          </>
        ) : null}
        {ban && !cens?.shown ? <Txt x={75} y={74} text={ban.text.replace(/^avant\s/, '')} size={18} big t0={600} /> : null}
      </Art>
    </Seg>
  )
}

/** 09 Les motifs : protéger les mineurs peut justifier une limite ; mais tous les réseaux visés, sans que les
 *  parents puissent l'adapter, et chacun, même majeur, devait prouver son âge, sans garanties légales pour sa vie
 *  privée */
const ecrans09: Board = p => {
  const [mineurs, tous, majeur] = cuesOf(p)
  const l = lignes([
    { n: 'parapluie', lines: [mineurs ?? null, word(p, /peut justifier une limite|limiter leur accès/)] },
    { n: 'telephone', lines: [tous ?? null, word(p, /sans que les parents puissent l[’']adapter|les parents ne pouvaient ni la lever ni l[’']adapter/)] },
    { n: 'carte', lines: [majeur ?? null, word(p, /devait prouver son âge, sans garanties[^.]*vie privée/) ?? word(p, /devait prouver son âge/)] },
  ])
  return (
    <Seg>
      <Art h={l.h + 4}>{l.el}</Art>
    </Seg>
  )
}

/** 10 Protéger les mineurs d'un côté, liberté d'expression et vie privée de l'autre : une balance, fléau à
 *  l'horizontale */
const ecrans10: Board = p => {
  const left = word(p, /Protéger les mineurs/)
  const right = word(p, /liberté d’expression et vie privée|liberté d'expression et vie privée/)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="parapluie" x={cx - 30} y={base - 84} size={60} t0={900} />
        <Picto n="personne" x={cx - 15} y={base - 32} size={30} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <>
        <Dessin n="bulle" x={cx - 40} y={base - 50} size={46} t0={1200} />
        <Picto n="cadenas" x={cx + 2} y={base - 42} size={40} t0={1400} />
      </>
    ),
    labels: [left?.text ?? null, right?.text ?? null],
    shown: [!!left?.shown, !!right?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 11 « Qui doit agir, et comment : les parents, l'école, les plateformes, la loi ? » */
const ecrans11: Board = p => {
  const who: Any[] = ['personne', 'livre', 'telephone', 'document']
  return (
    <Seg kind="ask">
      <Art h={96}>
        {who.map((n, i) => (
          <Fig key={n} n={n} x={4 + i * 56} y={22} size={50} t0={100 + i * 250} />
        ))}
        <Ask x={244} y={8} h={72} t0={1200} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Grandes plateformes ——— */

/** 01 Réseaux sociaux, sites de vente, moteurs de recherche : qui les encadre ? */
const plat01: Board = p => {
  const kinds = listBeforeColon(p.segment.say).slice(0, 3)
  const pics: Any[] = ['bulle', 'etiquette', 'loupe']
  if (kinds.length < 3) return null
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        {kinds.map((k, i) => (heard(p, k) ? <Legende key={k} n={pics[i]!} cx={50 + i * 100} y={4} size={62} label={k.toLowerCase()} max={12} t0={0} /> : null))}
      </Art>
    </Seg>
  )
}

/** 02 Au-delà de 45 millions d'utilisateurs par mois, une « très grande » plateforme, et les obligations les plus
 *  strictes */
const plat02: Board = p => seuil(p)

/** 03 Le règlement sur les services numériques : la Commission le fait appliquer, par des sanctions et des
 *  engagements négociés */
const plat03: Board = p => {
  const [sanc, eng] = cuesOf(p)
  const com = word(p, /La Commission européenne/)
  const reg = word(p, /le règlement européen sur les services numériques/)
  return (
    <Seg>
      <Art h={228}>
        {reg ? <Txt x={W / 2} y={16} text={reg.text} max={30} size={16} t0={100} /> : null}
        <Picto n="monument" x={92} y={44} size={68} t0={300} />
        {com?.shown ? <Txt x={168} y={72} text={com.text} max={14} size={14} tone="soft" anchor="start" t0={0} /> : null}
        {sanc?.shown ? (
          <>
            <Arrow x1={100} y1={118} x2={66} y2={138} t0={0} />
            <Legende n="pieces" cx={50} y={140} size={40} label={sanc.text} t0={200} />
          </>
        ) : null}
        {eng?.shown ? (
          <>
            <Arrow x1={152} y1={118} x2={214} y2={138} t0={0} />
            <Legende n="document" cx={238} y={140} size={40} label={eng.text} max={16} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Trois amendes, à la même échelle : 120 millions d'euros à X, 200 à Temu, 550 à AliExpress */
const plat04: Board = p => {
  const list = [...plain(p.segment.say).matchAll(/([Àà]) ([^,;]+), (\d+) millions/g)].map(m => ({ name: m[2]!, v: Number(m[3]), text: `${m[3]} millions`, at: `${m[1]} ${m[2]}` }))
  if (list.length < 2) return null
  const g = barres({
    items: list.map(it => ({ label: it.name, value: it.v, text: it.text.replace(' ', NB), tone: 'count' as const, shown: heard(p, it.at) })),
    y: 2,
    size: 22,
    gap: 30,
    room: 124,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Le plafond d'une amende : 6 % du chiffre d'affaires annuel mondial, sur cent pièces */
const plat05: Board = p => {
  const cue = cueOf(p, 0)
  const v = num(cue?.text)
  const ca = word(p, /du chiffre d’affaires annuel mondial|du chiffre d'affaires annuel mondial/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Sur100 p={p} kind="piece" low={v} caption={ca ? `${cue.text} ${ca.text}` : null} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 Des engagements de TikTok sur la publicité (décembre 2025), un plan d'action de X (juillet 2026) */
const plat06: Board = p => {
  const [a, b] = cuesOf(p)
  const da = word(p, /(?:fin|décembre) \d{4}/)
  const db = word(p, /juillet \d{4}/)
  const na = word(p, /TikTok/)
  const nb = word(p, /de X\b/)
  const ya = dateOf(da?.text)
  const yb = dateOf(db?.text)
  if (!a || !b || !ya || !yb) return null
  // Marges courtes : les deux dates, écrites sous la frise, restent écartées l'une de l'autre
  const from = ya - 0.3
  const to = yb + 0.3
  const y = 104
  const f = frise({ y, from, to, x0: 20, x1: 280, t0: 100 })
  const mark = (x: number, cue: Cue, date: Cue | null, name: string | undefined) =>
    cue.shown ? (
      <g>
        <Picto n="document" x={x - 26} y={y - 60} size={52} t0={0} tone="count" />
        <Ink d={`M${x} ${y - 6}v12`} t0={200} dur={200} class="vc-count" />
        {date ? <Txt x={x} y={y + 24} text={date.text} size={15} t0={300} /> : null}
        {name ? <Txt x={x} y={y + 44} text={name} size={15} tone="soft" t0={400} /> : null}
      </g>
    ) : null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={y + 52}>
        {f.el}
        {mark(f.X(ya), a, da, na?.text)}
        {mark(f.X(yb), b, db, nb?.text.replace(/^de\s/, ''))}
      </Art>
    </Seg>
  )
}

/** Le pictogramme d'un trait de conception, d'après son nom */
const conception = (s: string): Any => (/défilement/.test(s) ? 'defilement' : /lecture/.test(s) ? 'lecture' : /notification/.test(s) ? 'cloche' : /recommandation/.test(s) ? 'cible' : 'telephone')

/** 07 La conception « addictive » de TikTok, relevée à titre préliminaire par la Commission : un téléphone où les
 *  vidéos défilent, et ce qui est en cause, une ligne par trait, quand la voix le dit */
const plat07: Board = p => {
  const list = listAfterColon(p.segment.say).slice(0, 4)
  if (list.length < 2) return null
  const row = 44
  const lines = list.map(t => wrap(t, 20).length)
  const ys = lines.map((_, i) => 4 + i * row)
  const h = ys[ys.length - 1]! + Math.max(34, lines[lines.length - 1]! * 16 + 6)
  const ph = 132
  const py = (h - ph) / 2
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={h}>
        <Dessin n="telephone" x={-14} y={py} size={ph} t0={100} />
        <g class="vc-slide-y" style={{ '--from': '22px', ...at(300, 1600) }}>
          <Dessin n="video" x={22} y={py + 30} size={34} t0={300} />
          <Dessin n="video" x={22} y={py + 62} size={34} t0={500} />
        </g>
        <Arrow x1={64} y1={py + 34} x2={64} y2={py + 96} dash t0={900} head={6} />
        {list.map((t, i) => {
          const shown = heard(p, t.split(' ')[0])
          const y = ys[i]!
          return shown ? (
            <g key={t}>
              <Fig n={conception(t)} x={96} y={y} size={32} t0={0} />
              <Txt x={138} y={y + 15} text={t} max={20} size={14} anchor="start" t0={200} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 08 « Comment faire respecter ces règles, et faut-il en ajouter ? » : le document, une loupe, la question */
const plat08: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="document" x={40} y={4} size={96} t0={100} />
      <Picto n="loupe" x={92} y={40} size={64} t0={700} tone="count" />
      <Ask x={210} y={14} h={76} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Information et médias ——— */

/** 01 Une fausse information se recopie de téléphone en téléphone avant une élection ; peut-on l'arrêter ? */
const med01: Board = p => {
  const [fausse] = cuesOf(p)
  const elect = word(p, /une élection/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={120}>
        <Dessin n="bulle" x={4} y={4} size={58} t0={100} tone={fausse?.shown ? 'count' : undefined} />
        {[0, 1].map(k => (
          <g key={k}>
            <Arrow x1={58 + k * 70} y1={44} x2={86 + k * 70} y2={52} dash t0={600 + k * 400} />
            <Dessin n="bulle" x={84 + k * 70} y={28} size={50 - k * 4} t0={700 + k * 400} />
          </g>
        ))}
        {elect?.shown ? (
          <>
            <Picto n="calendrier" x={232} y={28} size={60} t0={0} />
            <Txt x={262} y={112} text={elect.text} size={14} tone="soft" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 Trois mois avant le mois d'une élection générale, un juge saisi en urgence peut faire cesser la
 *  diffusion : trois mois comptés, le mois de l'élection, le juge */
const med02: Board = p => {
  const [mois, juge] = cuesOf(p)
  const elect = word(p, /une élection générale/)
  const n = num(/(\S+)\s+mois\s+qui/.exec(plain(p.segment.say))?.[1])
  if (!mois || !n || n > 6) return null
  const size = 40
  const gap = 8
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={130}>
        <Cases n={n + 1} cols={n + 1} x={6} y={24} size={size} gap={gap} count={mois.shown ? range(n) : []} t0={100} />
        {mois.shown ? <Brace x1={6} y1={24 + size + 6} x2={6 + n * (size + gap) - gap} y2={24 + size + 6} t0={300} tone="count" /> : null}
        {elect?.shown ? (
          <>
            <Picto n="drapeau" x={6 + n * (size + gap) + 2} y={22} size={40} t0={0} />
            <Txt x={6 + n * (size + gap) + size / 2} y={110} text={elect.text.replace(/^une\s/, '')} max={10} size={14} t0={200} />
          </>
        ) : null}
        {juge?.shown ? <Picto n="monument" x={232} y={16} size={62} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** Une coche au trait */
const coche = (x: number, y: number, t0: number) => <Ink d={`M${x} ${y}l6 7l12-15`} t0={t0} dur={300} class="vc-count vc-bold" />

/** 03 Le Conseil constitutionnel l'a admis, si le caractère inexact ou trompeur est « manifeste », comme le
 *  risque pour le scrutin : deux conditions cochées du même mot */
const med03: Board = p => {
  const cue = cueOf(p, 0)
  const a = word(p, /le caractère inexact ou trompeur/)
  const b = word(p, /le risque pour le scrutin/)
  if (!cue) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={136}>
        {a?.shown ? (
          <>
            <Dessin n="bulle" x={2} y={2} size={50} t0={0} />
            <Picto n="loupe" x={22} y={18} size={34} t0={200} />
            <Txt x={70} y={24} text={a.text} max={20} size={15} anchor="start" t0={300} />
            {cue.shown ? coche(260, 26, 600) : null}
          </>
        ) : null}
        {b?.shown ? (
          <>
            <Picto n="calendrier" x={4} y={76} size={48} t0={0} />
            <Txt x={70} y={98} text={b.text} max={20} size={15} anchor="start" t0={300} />
            {coche(260, 100, 500)}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le droit voisin : un article passe du journal à la plateforme, une rémunération repart à l'éditeur */
const med04: Board = p => {
  const [voisin] = cuesOf(p)
  const plat = word(p, /Les plateformes/)
  const edit = word(p, /les éditeurs et les agences/)
  const remu = cueOf(p, 1)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Dessin n="journal" x={6} y={18} size={78} t0={100} />
        <Dessin n="telephone" x={196} y={6} size={104} t0={300} />
        {voisin?.shown || plat?.shown ? (
          <>
            <Arrow x1={92} y1={40} x2={208} y2={40} t0={0} />
            <Picto n="document" x={136} y={14} size={30} t0={200} />
          </>
        ) : null}
        {remu?.shown ? (
          <>
            <Arrow x1={208} y1={84} x2={92} y2={84} t0={0} tone="count" />
            {[0, 1].map(k => (
              <Picto key={k} n="piece" x={134 + k * 18} y={64} size={18} t0={200 + k * 120} tone="count" w={0.8} />
            ))}
          </>
        ) : null}
        {edit?.shown ? <Txt x={45} y={118} text={edit.text} max={14} size={14} t0={0} /> : null}
        {plat ? <Txt x={248} y={134} text={plat.text.toLowerCase()} size={14} t0={600} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Les accords avec Meta ont expiré fin 2024 et début 2025 ; en juillet 2026, l'Autorité de la concurrence
 *  ordonne de reprendre des négociations de bonne foi : sur une frise à l'échelle, les deux accords en pointillé, puis
 *  l'Autorité, et la flèche qui renvoie à la table de négociation */
const med05: Board = p => {
  const [auto, foi] = cuesOf(p)
  const acc = word(p, /accords avec Meta/)
  const fin = word(p, /fin \d{4}/)
  const jul = word(p, /juillet \d{4}/)
  const yFin = dateOf(fin?.text)
  const yJul = dateOf(jul?.text)
  if (!yFin || !yJul) return null
  const from = Math.floor(yFin)
  const to = Math.ceil(yJul)
  const y = 120
  const f = frise({ y, from, to, x0: 20, x1: 280, ticks: range(to - from + 1).map(k => from + k), t0: 100 })
  const xd = f.X(yFin + 0.06)
  const xm = f.X(yJul)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={y + 32}>
        {f.el}
        {acc?.shown ? (
          <>
            <Picto n="document" x={xd - 44} y={y - 46} size={40} tone="ghost" />
            <Picto n="document" x={xd} y={y - 46} size={40} tone="ghost" />
            <Txt x={xd} y={y + 24} text={acc.text} size={14} t0={200} />
          </>
        ) : null}
        {auto?.shown ? (
          <>
            <Picto n="monument" x={xm - 28} y={y - 58} size={56} t0={0} />
            {jul ? <Txt x={xm} y={y + 24} text={jul.text} size={14} t0={300} /> : null}
          </>
        ) : null}
        {foi?.shown ? (
          <>
            <Arrow x1={xm - 24} y1={y - 66} x2={xd + 20} y2={y - 66} dash t0={0} tone="count" />
            <Txt x={(xm + xd) / 2} y={y - 76} text={foi.text} size={14} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 20 % du chiffre d'affaires en France pour la production d'œuvres : une pièce sur cinq file vers l'écran */
const med06: Board = p => {
  const [pct, prod] = cuesOf(p)
  const v = num(pct?.text)
  const ca = word(p, /leur chiffre d’affaires en France|leur chiffre d'affaires en France/)
  if (!pct || !v) return null
  const n = Math.round(100 / v)
  if (n < 2 || n > 10 || Math.abs(n * v - 100) > 0.001) return null
  const row = rangCells({ n, x: 0, w: 196, y: 26, max: 32, gap: 8 })
  const lastCell = row.cells[row.cells.length - 1]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        <Rang n={n} picto="piece" x={0} w={196} y={26} max={32} gap={8} count={[n - 1]} shown={pct.shown} t0={100} stagger={150} />
        {ca ? <Txt x={98} y={26 + row.h + 26} text={ca.text} max={22} size={14} tone="soft" t0={600} /> : null}
        {pct.shown ? <Arrow x1={lastCell.x + lastCell.size + 4} y1={42} x2={222} y2={42} t0={600} tone="count" /> : null}
        {prod?.shown ? (
          <>
            <Dessin n="video" x={226} y={10} size={64} t0={0} />
            <Txt x={258} y={88} text={prod.text} max={12} size={14} t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Personne ne peut détenir plus de 49 % du capital d'une chaîne nationale de la TNT qui dépasse 8 %
 *  d'audience : une barre de cent, comptée jusqu'au plafond */
const med07: Board = p => {
  const [cap, aud] = cuesOf(p)
  const v = num(cap?.text)
  const qui = word(p, /Personne ne peut|Une même personne/)
  const audience = word(p, /qui dépasse \d+\s%\sd’audience|qui dépasse \d+\s%\sd'audience/)
  if (!cap || !v || v > 100) return null
  const x0 = 96
  const x1 = 290
  const xs = x0 + ((x1 - x0) * v) / 100
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={130}>
        <Dessin n="tele" x={4} y={14} size={74} t0={100} />
        {aud?.shown && audience ? <Txt x={41} y={108} text={audience.text.replace(/^qui\s/, '')} max={11} size={14} t0={0} /> : null}
        <Fade t0={300} class="vc-ghost">
          <path d={`M${x0} 64H${x1}V90H${x0}Z`} />
        </Fade>
        {qui?.shown ? <Picto n="personne" x={(x0 + xs) / 2 - 18} y={18} size={36} t0={0} tone="count" /> : null}
        {cap.shown ? (
          <>
            <g class="vc-count">
              <Fade t0={300}>
                <rect class="vc-tint-count" x={x0} y={64} width={xs - x0} height={26} />
              </Fade>
              <Ink d={`M${x0} 64H${xs}V90H${x0}Z`} t0={0} dur={600} />
            </g>
            <Ink d={`M${xs} 54V100`} t0={500} dur={300} class="vc-bold" />
            <Txt x={xs + 6} y={118} text={cap.text} anchor="start" size={18} big tone="count" t0={700} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Quelles règles pour l'information, la presse et la création, et faut-il les changer ? » */
const med08: Board = p => {
  const what: DessinName[] = ['journal', 'video', 'telephone']
  return (
    <Seg kind="ask">
      <Art h={96}>
        {what.map((n, i) => (
          <Dessin key={n} n={n} x={10 + i * 66} y={20} size={58} t0={100 + i * 250} />
        ))}
        <Ask x={232} y={8} h={72} t0={1100} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Le registre ——— */

export const NUMERIQUE: Record<string, Board> = {
  'numerique-intro-01': intro01,
  'numerique-intro-02': intro02,
  'numerique-intro-03': intro03,
  'numerique-intro-04': intro04,
  'numerique-intro-05': intro05,
  'numerique-intro-06': intro06,
  'numerique-intro-07': intro07,
  'numerique-ia-01': ia01,
  'numerique-ia-02': ia02,
  'numerique-ia-03': ia03,
  'numerique-ia-04': ia04,
  'numerique-ia-05': ia05,
  'numerique-ia-06': ia06,
  'numerique-ia-07': ia07,
  'numerique-ia-08': ia08,
  'numerique-ia-09': ia09,
  'numerique-ia-10': ia10,
  'numerique-ia-11': ia11,
  'numerique-ecrans-01': ecrans01,
  'numerique-ecrans-02': ecrans02,
  'numerique-ecrans-03': ecrans03,
  'numerique-ecrans-04': ecrans04,
  'numerique-ecrans-05': ecrans05,
  'numerique-ecrans-06': ecrans06,
  'numerique-ecrans-07': ecrans07,
  'numerique-ecrans-08': ecrans08,
  'numerique-ecrans-09': ecrans09,
  'numerique-ecrans-10': ecrans10,
  'numerique-ecrans-11': ecrans11,
  'numerique-plateformes-01': plat01,
  'numerique-plateformes-02': plat02,
  'numerique-plateformes-03': plat03,
  'numerique-plateformes-04': plat04,
  'numerique-plateformes-05': plat05,
  'numerique-plateformes-06': plat06,
  'numerique-plateformes-07': plat07,
  'numerique-plateformes-08': plat08,
  'numerique-medias-01': med01,
  'numerique-medias-02': med02,
  'numerique-medias-03': med03,
  'numerique-medias-04': med04,
  'numerique-medias-05': med05,
  'numerique-medias-06': med06,
  'numerique-medias-07': med07,
  'numerique-medias-08': med08,
}
