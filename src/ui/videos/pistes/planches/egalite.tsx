// Piste C, les planches de la série « Égalité femmes-hommes » (src/ui/videos/series/egalite.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/), comme retraites.tsx et logement.tsx. Les mots et les
// nombres viennent du script (mots mis en valeur, phrases dites, chiffre et graphique de la fiche) : si le texte
// change, le dessin suit ; s'il ne s'y retrouve plus (une planche rend null), le passage prend le dessin
// générique de sa sorte d'image. Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les
// dit pas (« projet de loi ») : elles nomment ce qui est dessiné, et l'« alt » du passage les reprend.
// Femmes et hommes sont toujours dessinés par le même pictogramme, sans attribut : seuls les mots les distinguent.
// Trois pictogrammes manquaient à la bibliothèque : le berceau (une naissance, un jeune enfant), l'établissement
// d'accueil (une crèche) et la jauge (un indicateur d'écart) ; ils sont dessinés ici.

import { chartOf } from '../../model'
import { EGALITE as SERIE } from '../../series/egalite'
import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, at, cls, cuesOf, heard, num, said, sentencesOf, word, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Libelle, Panel, Question, Seg, Signature, Src, Sur100, lineOf } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Cases, Signe, balance, barres, colonnes, frise, type Barre } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)


/* ——— Pictogrammes de la série ——— */

interface Trait {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat au bleu bille */
  fill?: string
  thin?: number[]
  bold?: number[]
}

/** Un berceau au trait : la capote, la nacelle, les pieds sur leurs arceaux */
const BERCEAU: Trait = {
  s: ['M7 24H41C41 33 34 38 24 38C14 38 7 33 7 24Z', 'M9 24C9 13 15 7 25 7V24', 'M14 37L11 43M34 37L37 43M5 41C15 46 33 46 43 41'],
  fill: 'M7 24H41C41 33 34 38 24 38C14 38 7 33 7 24Z',
}

/** Un établissement d'accueil : un bâtiment bas, une porte, deux fenêtres */
const ETABLISSEMENT: Trait = {
  s: ['M7 44V20H41V44', 'M4 20L12 9H36L44 20', 'M20 44V33H28V44', 'M11 25h6v6h-6zM31 25h6v6h-6z', 'M3 44H45'],
  fill: 'M7 44V20H41V44Z',
  thin: [3],
}

/** Une jauge : une petite fiche et deux barres comparées */
const JAUGE: Trait = {
  s: ['M7 4H41V44H7Z', 'M13 36H35', 'M19 35V17M29 35V13'],
  fill: 'M7 4H41V44H7Z',
  thin: [1],
  bold: [2],
}

interface PictoAt {
  x: number
  y: number
  /** Côté, en unités de la feuille */
  size?: number
  t0?: number
  kept?: boolean
  tone?: Tone
}

/** Un pictogramme de la série, placé sur la feuille (même grammaire que Picto : trait après trait, aplat au bleu) */
function Trace({ d, x, y, size = 48, t0 = 0, kept, tone }: PictoAt & { d: Trait }) {
  const s = size / 48
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(1 / s) }}>
      {d.fill && tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class="vc-tint-count" d={d.fill} />
        </Fade>
      ) : null}
      {d.s.map((path, i) => (
        <Ink key={i} d={path} t0={t0 + i * 200} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined} />
      ))}
    </g>
  )
}

const Berceau = (o: PictoAt) => <Trace d={BERCEAU} {...o} />
const Etablissement = (o: PictoAt) => <Trace d={ETABLISSEMENT} {...o} />
const Jauge = (o: PictoAt) => <Trace d={JAUGE} {...o} />

/** Une rangée de jauges, une par indicateur ; rend sa largeur */
function Jauges({ n, x, y, size = 24, gap = 4, t0 = 0, tone, kept }: { n: number; x: number; y: number; size?: number; gap?: number; t0?: number; tone?: Tone; kept?: boolean }) {
  return (
    <>
      {range(n).map(i => (
        <Jauge key={i} x={x + i * (size + gap)} y={y} size={size} t0={t0 + i * 120} tone={tone} kept={kept} />
      ))}
    </>
  )
}

/** Une case au trait (un mois, un jour), pleine ou en pointillé */
function Boite({ x, y, w, h, t0 = 0, dash, tone, kept }: { x: number; y: number; w: number; h: number; t0?: number; dash?: boolean; tone?: Tone; kept?: boolean }) {
  const d = `M${x} ${y}h${w}v${h}h${-w}z`
  if (dash) {
    return (
      <Fade t0={t0} kept={kept} class={cls('vc-dash', tone && `vc-${tone}`)}>
        <path d={d} />
      </Fade>
    )
  }
  return (
    <g class={tone ? `vc-${tone}` : undefined}>
      {tone === 'count' ? (
        <Fade t0={t0 + 200} kept={kept}>
          <path class="vc-tint-count" d={d} />
        </Fade>
      ) : null}
      <Ink d={d} t0={t0} dur={500} kept={kept} />
    </g>
  )
}

/* ——— Communs à la série ——— */

/** Le revenu salarial moyen des femmes et des hommes : le graphique de la fiche, porté par ce passage ou par un
 *  passage de la vidéo */
function revenus(p: P) {
  const c = chartOf(p.segment) ?? p.script.segments.map(chartOf).find(x => x?.unit === '€') ?? null
  if (!c || c.kind !== 'compare' || c.items.length !== 2 || c.unit !== '€') return null
  return c.items
}

/** Les deux revenus, à la même échelle depuis zéro ; « gap » : l'écart entre leurs bouts, au bleu bille */
function revenusArt(p: P, { texts, shown = [true, true], kept, gap }: { texts?: (string | undefined)[]; shown?: boolean[]; kept?: boolean; gap?: boolean }) {
  const items = revenus(p)
  if (!items) return null
  const g = barres({
    items: items.map((it, i) => ({ label: it.label.toLowerCase(), value: it.value, text: texts?.[i], shown: shown[i] })),
    y: 8,
    size: 28,
    gap: 34,
    room: 104,
    t0: 200,
    kept,
  })
  const [f, h] = g.geo
  if (!f || !h) return null
  return (
    <Art h={8 + g.h + 6}>
      {g.el}
      {gap ? (
        <>
          <Fade kept={kept} t0={0} class="vc-dash vc-soft">
            <path d={`M${h.x1} ${f.top - 10}V${h.bottom}`} />
          </Fade>
          <Brace x1={f.x1 + 2} y1={f.bottom + 6} x2={h.x1} y2={f.bottom + 6} tone="count" t0={300} />
        </>
      ) : null}
    </Art>
  )
}

/** Les écarts de salaire de la vidéo, du plus large au plus étroit : la clé dans le libellé de la fiche, et les mots
 *  qui le nomment dans ce que dit la vidéo */
const ECARTS: [RegExp, RegExp][] = [
  [/revenu salarial/, /revenu salarial/],
  [/même emploi/, /même emploi/],
]

/** Les écarts déjà montrés par la vidéo, jusqu'à ce passage compris */
function ecarts(p: P) {
  const out: { k: number; v: number; text: string; label: string | null; current: boolean }[] = []
  for (const s of p.script.segments.slice(0, p.index + 1)) {
    const f = s.figure
    if (!f || !/^Écart/.test(f.label) || !/%/.test(f.value)) continue
    const k = ECARTS.findIndex(([re]) => re.test(f.label))
    const v = num(f.value)
    if (k < 0 || v === null || out.some(o => o.k === k)) continue
    out.push({ k, v, text: f.value, label: said(p, ECARTS[k]![1]), current: s.id === p.segment.id })
  }
  return out.sort((a, b) => a.k - b.k)
}

/** Des barres l'une sous l'autre, à la même échelle depuis zéro (barres() de la bibliothèque, une à une) : celles
 *  des passages précédents déjà au tableau (« kept »), celle du passage tracée quand la voix la dit */
function pile(items: (Barre & { kept?: boolean })[], { y = 4, size = 22, gap = 26, room = 120 }: { y?: number; size?: number; gap?: number; room?: number } = {}) {
  const max = Math.max(...items.map(i => i.value))
  let top = y
  const els = items.map((it, i) => {
    const g = barres({ items: [it], y: top, size, gap, max, room, t0: 100, kept: it.kept })
    top += g.h + gap
    return <g key={i}>{g.el}</g>
  })
  return { el: <>{els}</>, h: top - gap }
}

/** Les écarts posés l'un sous l'autre, à la même échelle depuis zéro ; celui du passage au bleu bille, quand la
 *  voix le dit */
function paliers(p: P) {
  const list = ecarts(p)
  const cur = list.find(e => e.current)
  const cue = cuesOf(p).find(c => c.text === cur?.text)
  if (list.length < 2 || !cur || !cue) return null
  const g = pile(
    list.map(e => ({ label: e.label ?? undefined, value: e.v, text: e.text, tone: e.current ? 'count' : undefined, shown: e.current ? cue.shown : true, kept: !e.current })),
    { size: 20, gap: 24, room: 122 },
  )
  return <Art h={g.h + 4}>{g.el}</Art>
}

/** La part des moins de 3 ans gardés surtout par leurs parents : cent cases, le compte au bleu bille */
const garde56: Board = p => {
  const cue = cuesOf(p)[0]
  const k = num(cue?.text)
  const caption = word(p, /gardés surtout par leurs parents/)
  if (!cue || !k || k > 100 || !/%/.test(cue.text)) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={k} caption={caption?.text ?? null} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** Un toit et deux murs : la maison où l'on partage les tâches ; (x, y) : coin haut gauche, w × h */
const toit = (x: number, y: number, w: number, h: number) => `M${x} ${y + 30}L${x + w / 2} ${y}L${x + w} ${y + 30}M${x + 10} ${y + 24}V${y + h}H${x + w - 10}V${y + 24}`

/** Une petite frise d'années pour les textes sur l'égalité salariale : 2019, 2023, 2026 */
function textes(upto: number) {
  const f = frise({ y: 124, from: 2018, to: 2027, x0: 20, x1: 280, ticks: range(10).map(k => 2018 + k), t0: 0, kept: upto > 2023 })
  const doc = (year: number, label: string | null, tone: Tone | undefined, t0: number, kept?: boolean) => (
    <g>
      <Picto n="document" x={f.X(year) - 26} y={56} size={52} t0={t0} kept={kept} tone={tone} />
      {label ? <Txt x={f.X(year)} y={40} text={label} size={15} t0={t0 + 300} kept={kept} /> : null}
      <Ink d={`M${f.X(year)} 112V118`} t0={t0} dur={200} kept={kept} class="vc-soft" />
      <Txt x={f.X(year)} y={150} text={String(year)} size={16} big tone={tone === 'count' ? 'count' : 'soft'} t0={t0 + 200} kept={kept} />
    </g>
  )
  return { f, doc }
}

/* ——— Introduction ——— */

/** 01 « Les femmes gagnent-elles autant que les hommes ? » : deux personnages identiques, chacun son enveloppe */
const intro01: Board = p => {
  const fe = word(p, /les femmes/)
  const ho = word(p, /les hommes/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={140}>
        <Ink d="M8 100H292" t0={0} dur={600} class="vc-soft" />
        <Picto n="personne" x={30} y={32} size={66} t0={200} />
        <Picto n="enveloppe" x={96} y={56} size={44} t0={700} />
        <Picto n="personne" x={170} y={32} size={66} t0={400} />
        <Picto n="enveloppe" x={236} y={56} size={44} t0={900} />
        <Ask x={140} y={0} h={36} t0={1300} />
        {fe?.shown ? <Txt x={84} y={126} text={fe.text} size={16} /> : null}
        {ho?.shown ? <Txt x={224} y={126} text={ho.text} size={16} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 21,8 % : les revenus salariaux moyens, à la même échelle, l'écart entre leurs bouts */
const intro02: Board = p => {
  const cue = cuesOf(p)[0]
  const art = revenusArt(p, { gap: !!cue?.shown })
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 03 À même emploi, 3,6 % : sous l'écart du revenu salarial, l'écart à emploi égal, à la même échelle */
const intro03: Board = p => {
  const art = paliers(p)
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le temps de travail (un sablier), les emplois (une mallette) ; puis le partage des tâches, dans la maison */
const intro04: Board = p => {
  const [temps, emplois, taches] = cuesOf(p)
  if (!temps || !emplois || !taches) return null
  return (
    <Seg>
      <Art h={236}>
        <Signe n="sablier" cx={70} y={0} size={56} label={temps.text} shown={temps.shown} t0={200} max={16} />
        <Txt x={W / 2} y={38} text="+" size={28} big tone="soft" t0={600} />
        <Signe n="mallette" cx={230} y={0} size={56} label={emplois.text} shown={emplois.shown} t0={700} max={16} />
        {taches.shown ? (
          <>
            <Ink d={toit(76, 112, 148, 92)} t0={0} dur={900} />
            <Picto n="personne" x={98} y={162} size={42} t0={400} />
            <Picto n="personne" x={160} y={162} size={42} t0={600} />
            <Arrow x1={146} y1={160} x2={128} y2={160} t0={900} head={6} tone="count" />
            <Arrow x1={154} y1={160} x2={172} y2={160} t0={900} head={6} tone="count" />
            <Txt x={W / 2} y={228} text={taches.text} size={16} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 56 % des moins de 3 ans gardés surtout par leurs parents */
const intro05: Board = garde56

/** Les jours d'un congé dit (« 16 semaines », « 25 jours ») */
const jours = (c: Cue | undefined) => {
  const n = num(c?.text)
  if (!c || !n) return null
  return /semaine/.test(c.text) ? n * 7 : /jour/.test(c.text) ? n : null
}

/** 06 Congé de maternité, congé de paternité : deux barres à la même échelle, une graduation par semaine */
const intro06: Board = p => {
  const [m, pa] = cuesOf(p)
  const dm = jours(m)
  const dp = jours(pa)
  const mat = word(p, /maternité/)
  const pat = word(p, /paternité/)
  const head = word(p, /naissance d’un premier enfant|naissance d'un premier enfant/)
  if (!m || !pa || !dm || !dp) return null
  const g = barres({
    items: [
      { label: mat?.text, value: dm, text: m.text, shown: m.shown },
      { label: pat?.text, value: dp, text: pa.text, shown: pa.shown },
    ],
    y: 44,
    size: 26,
    gap: 30,
    room: 118,
    t0: 100,
  })
  const weeks = (i: number, v: number) => {
    const b = g.geo[i]!
    return range(Math.floor(v / 7 - 0.01))
      .map(k => `M${(b.x0 + (k + 1) * 7 * g.scale).toFixed(1)} ${b.top}v26`)
      .join('')
  }
  return (
    <Seg>
      <Art h={44 + g.h + 6}>
        <Berceau x={0} y={0} size={30} t0={0} />
        {head ? <Txt x={36} y={21} text={head.text} size={15} anchor="start" tone="soft" t0={200} /> : null}
        {g.el}
        {m.shown ? <Ink d={weeks(0, dm)} t0={700} dur={700} class="vc-thin vc-soft" /> : null}
        {pa.shown ? <Ink d={weeks(1, dp)} t0={1000} dur={400} class="vc-thin vc-soft" /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Chaque parent, 1 ou 2 mois s'il le souhaite : deux personnages, chacun deux cases de mois, la seconde en
 *  pointillé */
const intro07: Board = p => {
  const [each, months] = cuesOf(p)
  const wish = word(p, /s’il le souhaite|s'il le souhaite/)
  if (!each || !months) return null
  const parent = (cx: number, d: number) => (
    <>
      <Picto n="personne" x={cx - 26} y={0} size={52} t0={d} />
      {months.shown ? (
        <>
          <Boite x={cx - 42} y={64} w={38} h={30} t0={d} />
          <Boite x={cx + 4} y={64} w={38} h={30} t0={d + 300} dash />
        </>
      ) : null}
    </>
  )
  return (
    <Seg>
      <Head lines={[lineOf(each)]} />
      <Art h={150}>
        {parent(80, 200)}
        {parent(220, 400)}
        {months.shown ? <Txt x={W / 2} y={124} text={months.text} size={20} big tone="count" t0={200} /> : null}
        {wish?.shown ? <Txt x={W / 2} y={146} text={wish.text} size={15} tone="soft" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 08 Le projet de loi : sept indicateurs d'écart de salaire, à déclarer dès 50 salariés */
const intro08: Board = p => {
  const [ind, sal] = cuesOf(p)
  const n = num(ind?.text)
  const loi = word(p, /projet de loi/)
  const date = word(p, /\d+[\s\u00a0]septembre \d{4}/)
  const des = word(p, /dès \d+[\s\u00a0]salariés/)
  if (!ind || !n || n > 9) return null
  const size = 24
  const gap = 4
  const x0 = 290 - n * size - (n - 1) * gap
  return (
    <Seg>
      <Art h={170}>
        <Picto n="document" x={6} y={4} size={60} t0={100} />
        {loi ? <Txt x={4} y={86} text={loi.text} size={15} anchor="start" t0={400} /> : null}
        {date ? <Txt x={4} y={104} text={date.text} size={14} anchor="start" tone="soft" t0={500} /> : null}
        {ind.shown ? (
          <>
            <Arrow x1={72} y1={34} x2={x0 - 6} y2={34} t0={0} />
            <Jauges n={n} x={x0} y={22} size={size} gap={gap} t0={200} tone="count" />
            <Txt x={x0 + (n * size + (n - 1) * gap) / 2} y={76} text={ind.text} size={18} big tone="count" t0={500} />
          </>
        ) : null}
        {sal?.shown ? (
          <>
            <Etablissement x={128} y={112} size={50} t0={0} />
            <Txt x={184} y={146} text={des?.text ?? sal.text} size={14} anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** Les pictogrammes des quatre approfondissements, dans l'ordre de la série */
const CHAPITRES: Record<string, PictoName> = {
  'egalite-salaires': 'billet',
  'egalite-conges': 'calendrier',
  'egalite-garde': 'maison',
  'egalite-transparence': 'loupe',
}

/** 09 Les quatre questions du thème, chacune avec le pictogramme de sa vidéo, quand la voix la pose */
const intro09: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  const pics = SERIE.videos.filter(v => v.kind === 'deep').map(v => CHAPITRES[v.id] ?? 'document')
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map((q, i) => ({
          picto: pics[i] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** Le sommaire de la série (comme Sommaire de mises.tsx), avec le pictogramme de chaque approfondissement */
function Chapitres({ p, t0 = 200 }: { p: P; t0?: number }) {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
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

/** 10 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro10: Board = p => (
  <Seg kind="end">
    <Chapitres p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Écart de salaire ——— */

/** 01 « Selon ce que l'on compare, le chiffre change » : un mètre, deux mesures de longueurs différentes (sans
 *  échelle : ce ne sont pas les chiffres de la vidéo) */
const sal01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={120}>
      <Picto n="metre" x={4} y={24} size={80} t0={100} />
      <Ink d="M98 44H246" t0={700} dur={600} class="vc-bold" />
      <Ink d="M98 82H158" t0={1100} dur={400} class="vc-bold" />
      <Ink d="M98 26V100" t0={500} dur={400} class="vc-soft vc-thin" />
      <Ask x={258} y={34} h={56} t0={1800} />
    </Art>
  </Seg>
)

/** 02 Le revenu salarial moyen : 22 060 € pour les femmes, 28 220 € pour les hommes, à la même échelle */
const sal02: Board = p => {
  const [a, b] = cuesOf(p)
  const v = p.segment.figure?.value.split(' contre ')
  if (!a || !b || v?.length !== 2) return null
  const art = revenusArt(p, { texts: v, shown: [a.shown, b.shown] })
  if (!art) return null
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 03 Soit 21,8 % : les deux barres restent, l'écart entre leurs bouts au bleu bille */
const sal03: Board = p => {
  const cue = cuesOf(p)[0]
  const art = revenusArt(p, { kept: true, gap: !!cue?.shown })
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 04 Une part de l'écart tient au temps de travail ; à temps partiel, le salaire de l'année est plus bas : un
 *  sablier (le temps partiel), une flèche, une enveloppe de salaire et une flèche vers le bas, sans aucune grandeur */
const sal04: Board = p => {
  const [temps, partiel] = cuesOf(p)
  const an = word(p, /salaire de l’année|salaire de l'année/)
  if (!temps || !partiel) return null
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={136}>
        <Signe n="sablier" cx={62} y={8} size={70} label={partiel.text} shown={partiel.shown} t0={100} max={14} />
        {partiel.shown ? (
          <>
            <Arrow x1={108} y1={44} x2={148} y2={44} t0={300} />
            <Picto n="enveloppe" x={156} y={10} size={70} t0={500} />
            <Picto n="baisse" x={234} y={14} size={60} t0={900} />
            {an?.shown ? <Txt x={204} y={97} text={an.text} size={15} max={12} t0={1100} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Les emplois occupés : une rangée de postes ; femmes et hommes n'y sont pas toujours aux mêmes places */
const sal05: Board = p => {
  const fe = said(p, /femmes/)
  const ho = said(p, /hommes/)
  const cue = cuesOf(p)[0]
  const n = 5
  const size = 46
  const gap = 10
  const x0 = (W - n * size - (n - 1) * gap) / 2
  const cx = (i: number) => x0 + i * (size + gap) + size / 2
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={110}>
        {range(n).map(i => (
          <Picto key={i} n="mallette" x={x0 + i * (size + gap)} y={46} size={size} t0={100 + i * 120} tone="soft" />
        ))}
        {cue?.shown ? (
          <>
            <Picto n="personne" x={cx(1) - 17} y={4} size={34} t0={200} />
            <Picto n="personne" x={cx(3) - 17} y={4} size={34} t0={400} />
            {fe ? <Txt x={cx(1)} y={108} text={fe} size={15} t0={500} /> : null}
            {ho ? <Txt x={cx(3)} y={108} text={ho} size={15} t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 À même emploi, 3,6 % : les deux écarts de la vidéo empilés, à la même échelle */
const sal06: Board = intro03

/** 07 D'un côté, le temps de travail et les emplois ; de l'autre, un écart qui reste à emploi égal */
const sal07: Board = p => {
  const [a, b] = cuesOf(p)
  // À emploi égal : deux barres presque égales, ce qui manque à la plus courte en pointillé
  const reste = (cx: number, base: number) => (
    <>
      <Ink d={`M${cx - 34} ${base - 36}H${cx + 26}`} t0={1300} dur={400} class="vc-bold" />
      <Ink d={`M${cx - 34} ${base - 18}H${cx + 34}`} t0={1500} dur={400} class="vc-bold" />
      <Fade t0={1900} class="vc-dash vc-count">
        <path d={`M${cx + 28} ${base - 36}H${cx + 34}M${cx + 34} ${base - 44}V${base - 10}`} />
      </Fade>
    </>
  )
  const bal = balance({ left: ['sablier', 'mallette'], right: reste, labels: [a?.text ?? null, b?.text ?? null], shown: [!!a?.shown, !!b?.shown], t0: 100 })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 08 Le temps de travail renvoie aux tâches familiales et à la garde des enfants : du sablier à la maison */
const sal08: Board = p => (
  <Seg>
    <HeadCues p={p} />
    <Art h={130}>
      <Picto n="sablier" x={0} y={44} size={56} t0={100} />
      <Arrow x1={62} y1={72} x2={96} y2={72} t0={600} />
      <Ink d={toit(104, 4, 186, 122)} t0={800} dur={900} />
      <Picto n="personne" x={126} y={84} size={40} t0={1300} />
      <Berceau x={178} y={88} size={36} t0={1500} />
      <Picto n="personne" x={226} y={84} size={40} t0={1700} />
    </Art>
  </Seg>
)

/** 09 « Quelle priorité, au travail et dans la famille ? » : une mallette, une maison, la question entre les deux */
const sal09: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Picto n="mallette" x={30} y={14} size={78} t0={100} />
      <Ask x={134} y={4} h={84} t0={700} />
      <Picto n="maison" x={192} y={10} size={82} t0={400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Congés autour de la naissance ——— */

/** 01 « Combien de temps chaque parent peut-il s'arrêter ? » : un berceau entre deux personnages, un calendrier */
const con01: Board = p => (
  <Seg kind="ask">
    <Art h={140}>
      <Ink d="M8 136H292" t0={0} dur={600} class="vc-soft" />
      <Picto n="personne" x={18} y={68} size={68} t0={200} />
      <Berceau x={112} y={62} size={76} t0={500} />
      <Picto n="personne" x={214} y={68} size={68} t0={300} />
      <Picto n="calendrier" x={112} y={0} size={58} t0={900} />
      <Ask x={176} y={4} h={48} t0={1400} />
    </Art>
    <Question p={p} />
  </Seg>
)

/** 02 16 semaines de congé de maternité : seize cases, la naissance entre la sixième et la septième */
const con02: Board = p => {
  const [tot, av, ap] = cuesOf(p)
  const n = num(tot?.text)
  const a = num(av?.text)
  const b = num(ap?.text)
  if (!tot || !av || !ap || !n || !a || !b || a + b !== n || n > 20) return null
  const size = 15
  const gap = 3
  const w = n * size + (n - 1) * gap
  const x0 = (W - w) / 2
  const xb = x0 + a * (size + gap) - gap / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={112}>
        <Berceau x={xb - 18} y={0} size={36} t0={200} tone="count" />
        <Ink d={`M${xb} 38V70`} t0={600} dur={300} class="vc-count" />
        <Cases n={n} cols={n} x={x0} y={46} size={size} gap={gap} t0={300} />
        {av.shown ? (
          <>
            <Brace x1={x0} y1={68} x2={xb - 3} y2={68} t0={0} />
            <Txt x={(x0 + xb) / 2} y={104} text={av.text} size={16} t0={300} />
          </>
        ) : null}
        {ap.shown ? (
          <>
            <Brace x1={xb + 3} y1={68} x2={x0 + w} y2={68} t0={0} />
            <Txt x={(xb + x0 + w) / 2} y={104} text={ap.text} size={16} t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Au moins 8 semaines obligatoires, dont 6 après l'accouchement : huit cases comptées, une accolade sur six */
const con03: Board = p => {
  const [tot, after] = cuesOf(p)
  const n = num(tot?.text)
  const k = num(after?.text)
  const least = word(p, /Au moins \d+[\s\u00a0]semaines/)
  const must = word(p, /obligatoires/)
  if (!tot || !after || !least || !must || !n || !k || k > n || n > 12) return null
  const size = 26
  const gap = 6
  const w = n * size + (n - 1) * gap
  const x0 = (W - w) / 2
  const xs = x0 + (n - k) * (size + gap)
  return (
    <Seg>
      <Head lines={[{ text: least.text, shown: least.shown, mark: tot }, { text: must.text, shown: must.shown }]} />
      <Art h={100}>
        <Cases n={n} cols={n} x={x0} y={8} size={size} gap={gap} count={tot.shown ? range(n) : []} t0={200} />
        {after.shown ? (
          <>
            <Brace x1={xs} y1={size + 16} x2={x0 + w} y2={size + 16} tone="count" t0={0} />
            <Txt x={(xs + x0 + w) / 2} y={size + 56} text={after.text} size={16} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 25 jours de congé de paternité et d'accueil de l'enfant : une case par jour, rangées par semaines */
const con04: Board = p => {
  const cue = cuesOf(p)[0]
  const n = num(cue?.text)
  if (!cue || !n || n > 42) return null
  const size = 22
  const gap = 5
  const cols = 7
  const w = cols * size + (cols - 1) * gap
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={Math.ceil(n / cols) * (size + gap) - gap + 8}>
        <Cases n={n} cols={cols} x={(W - w) / 2} y={4} size={size} gap={gap} t0={300} stagger={18} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Les 3 jours ouvrables du congé de naissance, puis les 25 jours, dont les 4 premiers obligatoires */
const con05: Board = p => {
  const [obl, ouv] = cuesOf(p)
  const k = num(obl?.text)
  const d = num(ouv?.text)
  // Les jours du congé de paternité : le chiffre de la fiche, montré au passage précédent
  const n = num(p.script.segments.map(s => s.figure?.value).find(v => v && /jours/.test(v)))
  const naissance = word(p, /congé de naissance/)
  if (!obl || !ouv || !k || !d || !n || k > n || d > 6 || n > 42) return null
  const size = 18
  const gap = 4
  const cols = 7
  const gx = 290 - cols * size - (cols - 1) * gap
  return (
    <Seg>
      <Art h={156}>
        {ouv.shown ? (
          <>
            <Cases n={d} cols={d} x={12} y={34} size={size} gap={gap} t0={0} />
            <Txt x={12 + (d * size + (d - 1) * gap) / 2} y={78} text={ouv.text} max={10} size={15} t0={300} />
            {naissance ? <Txt x={12 + (d * size + (d - 1) * gap) / 2} y={116} text={naissance.text} max={10} size={14} tone="soft" t0={400} /> : null}
            <Arrow x1={92} y1={43} x2={gx - 8} y2={43} t0={500} />
          </>
        ) : null}
        <Cases n={n} cols={cols} x={gx} y={10} size={size} gap={gap} count={obl.shown ? range(k) : []} t0={200} stagger={15} />
        {obl.shown ? <Txt x={gx + (cols * size + (cols - 1) * gap) / 2} y={120} text={obl.text} max={14} size={16} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Depuis le 1er juillet 2026, un congé supplémentaire de naissance, pour les enfants nés depuis le 1er janvier */
const con06: Board = p => {
  const cue = cuesOf(p)[0]
  const jan = word(p, /1er[\s\u00a0]janvier \d{4}/)
  const jul = word(p, /1er[\s\u00a0]juillet \d{4}/)
  if (!jan || !jul) return null
  const f = frise({ y: 86, from: 0, to: 12, x0: 24, x1: 276, ticks: range(13), t0: 100 })
  return (
    <Seg>
      <Head lines={[lineOf(cue)]} />
      <Art h={136}>
        {f.el}
        {jul.shown ? (
          <>
            <Picto n="drapeau" x={f.X(6) - 12} y={86 - 46} size={46} t0={0} tone="count" />
            <Txt x={f.X(6) + 4} y={30} text={jul.text} size={15} anchor="start" t0={300} />
          </>
        ) : null}
        {jan.shown ? (
          <>
            <Berceau x={f.X(0) - 4} y={46} size={34} t0={0} tone="count" />
            <Arrow x1={f.X(0) + 36} y1={70} x2={f.X(3)} y2={70} dash tone="count" t0={300} />
            <Txt x={f.X(0) - 8} y={116} text={jan.text} size={15} anchor="start" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 1 ou 2 mois ; le premier indemnisé à 70 % du salaire net, le second à 60 % : deux colonnes sous la ligne du
 *  salaire net */
const con07: Board = p => {
  const [, a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const first = word(p, /premier mois/)
  const second = word(p, /le second/)
  const net = word(p, /salaire net/)
  if (!a || !b || !va || !vb || va > 100 || vb > 100) return null
  const h = 140
  const cols = colonnes({
    items: [
      { label: first?.text ?? '1', value: va, text: a.text, tone: 'count', shown: a.shown },
      { label: second?.text ?? '2', value: vb, text: b.text, tone: 'count', shown: b.shown },
    ],
    x: 70,
    w: 160,
    y: 4,
    h,
    max: 100,
    colW: 56,
    t0: 100,
  })
  const top = 4 + h - (h - 34)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={4 + cols.h + 4}>
        <Fade t0={0} class="vc-dash vc-soft">
          <path d={`M40 ${top}H260`} />
        </Fade>
        {net ? <Txt x={262} y={top - 8} text={net.text} size={14} anchor="end" tone="soft" t0={200} /> : null}
        {cols.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 D'un côté, des congés en partie obligatoires ; de l'autre, des congés que chaque parent choisit */
const con08: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({ left: ['document'], right: ['personne'], labels: [a?.text ?? null, b?.text ?? null], shown: [!!a?.shown, !!b?.shown], t0: 100 })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 09 « Comment partager les congés, et qui en décide ? » : le berceau entre deux calendriers */
const con09: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Picto n="calendrier" x={14} y={30} size={64} t0={300} />
      <Berceau x={110} y={30} size={74} t0={100} />
      <Picto n="calendrier" x={222} y={30} size={64} t0={500} />
      <Ask x={176} y={0} h={40} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Garde des jeunes enfants ——— */

/** 01 « Du lundi au vendredi, qui le garde ? » : cinq cases de jours, un berceau, la question */
const gar01: Board = p => {
  const week = word(p, /Du lundi au vendredi/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={136}>
        <Cases n={5} cols={5} x={46} y={8} size={34} gap={8} t0={100} />
        {week ? <Txt x={W / 2} y={66} text={week.text} size={15} tone="soft" t0={400} /> : null}
        <Berceau x={92} y={74} size={62} t0={700} />
        <Ask x={176} y={78} h={52} t0={1300} />
      </Art>
    </Seg>
  )
}

/** 02 56 % gardés surtout par leurs parents */
const gar02: Board = garde56

/** 03 Et 18 % surtout en crèche : deux barres à la même échelle, les parents puis la crèche */
const gar03: Board = p => {
  const cue = cuesOf(p)[0]
  const v = num(cue?.text)
  const par = p.script.segments.find(s => s.figure && /leurs parents/.test(s.say))
  const vp = num(par?.figure?.value)
  const lp = said(p, /leurs parents/)
  const lc = word(p, /en crèche/)
  if (!cue || !v || !vp || !par?.figure) return null
  const g = pile(
    [
      { label: lp ?? undefined, value: vp, text: par.figure.value, kept: true },
      { label: lc?.text, value: v, text: cue.text, tone: 'count', shown: cue.shown },
    ],
    { size: 26, gap: 28, room: 80 },
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Au premier choix des familles : par leurs parents, 56 % puis 36 % ; en crèche, 18 % puis 35 %. Les quatre
 *  barres à la même échelle depuis zéro ; le premier choix, qui n'a pas eu lieu, en pointillé */
const gar04: Board = p => {
  const [choix, a, b] = cuesOf(p)
  const vp = num(p.script.segments.find(s => s.figure && /leurs parents/.test(s.say))?.figure?.value)
  const vc = num(p.script.segments.find(s => s.figure && /en crèche/.test(s.say))?.figure?.value)
  const va = num(a?.text)
  const vb = num(b?.text)
  const lp = word(p, /par leurs parents/)
  const lc = word(p, /en crèche ou en établissement/)
  const year = (p.segment.figure?.date ?? '').slice(0, 4)
  if (!choix || !a || !b || !vp || !vc || !va || !vb || !year) return null
  const x0 = 10
  const room = 70
  const scale = (W - x0 - room) / Math.max(vp, vc, va, vb)
  const bar = (y: number, v: number, text: string, ghost: boolean, shown: boolean, t0: number, kept?: boolean) => {
    const d = `M${x0} ${y}H${x0 + v * scale}V${y + 22}H${x0}Z`
    return shown ? (
      <g>
        {ghost ? (
          <Fade t0={t0} kept={kept} class="vc-ghost">
            <path d={d} />
          </Fade>
        ) : (
          <>
            <Fade t0={t0 + 300} kept={kept}>
              <rect class="vc-tint" x={x0} y={y} width={v * scale} height={22} />
            </Fade>
            <Ink d={d} t0={t0} dur={600} kept={kept} />
          </>
        )}
        <Txt x={x0 + v * scale + 8} y={y + 18} text={text} size={18} big anchor="start" tone={ghost ? 'count' : undefined} t0={t0 + 300} kept={kept} />
      </g>
    ) : null
  }
  const vpText = p.script.segments.find(s => s.figure && /leurs parents/.test(s.say))?.figure?.value ?? ''
  const vcText = p.script.segments.find(s => s.figure && /en crèche/.test(s.say))?.figure?.value ?? ''
  return (
    <Seg kind="fig">
      <Libelle p={p} />
      <Art h={196}>
        {lp ? <Txt x={x0} y={16} text={lp.text} size={15} anchor="start" kept /> : null}
        {bar(24, vp, vpText, false, true, 0, true)}
        {bar(52, va, a.text, true, a.shown, 0)}
        {lc ? <Txt x={x0} y={100} text={lc.text} size={15} anchor="start" kept /> : null}
        {bar(108, vc, vcText, false, true, 0, true)}
        {bar(136, vb, b.text, true, b.shown, 0)}
        <Ink d={`M${x0} 176h22v12h-22z`} kept class="vc-thin" />
        <Txt x={x0 + 28} y={187} text={year} size={14} anchor="start" tone="soft" kept />
        {choix.shown ? (
          <>
            <Fade t0={0} class="vc-ghost">
              <path d={`M${x0 + 90} 176h22v12h-22z`} />
            </Fade>
            <Txt x={x0 + 118} y={187} text={choix.text} size={14} anchor="start" tone="soft" t0={100} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Une grande partie de l'écart de salaire tient au temps de travail (et aux emplois) ; d'où la question de la
 *  garde des enfants : berceau, sablier, deux barres inégales */
const gar05: Board = p => {
  const [temps, garde] = cuesOf(p)
  const ecart = word(p, /l’écart de salaire|l'écart de salaire/)
  if (!temps || !garde) return null
  return (
    <Seg>
      <Art h={140}>
        {garde.shown ? (
          <>
            <Berceau x={18} y={22} size={64} t0={0} />
            <Txt x={50} y={104} text={garde.text} max={10} size={15} t0={300} />
            <Arrow x1={88} y1={54} x2={112} y2={54} t0={500} />
          </>
        ) : null}
        <Signe n="sablier" cx={150} y={21} size={64} label={temps.text} shown={temps.shown} t0={100} max={10} />
        {ecart?.shown ? (
          <>
            <Arrow x1={188} y1={54} x2={212} y2={54} t0={0} />
            <Ink d="M222 40H286M222 66H270" t0={200} dur={500} class="vc-bold" />
            <Txt x={254} y={104} text={ecart.text} max={10} size={15} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 « Qui garde les jeunes enfants, et qui l'organise ? » : la maison et l'établissement d'accueil, un berceau */
const gar06: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="maison" x={8} y={30} size={74} t0={100} />
      <Berceau x={118} y={52} size={60} t0={500} />
      <Etablissement x={214} y={30} size={74} t0={300} />
      <Ask x={138} y={0} h={44} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Transparence des salaires ——— */

/** 01 « Payés pareil ? Comment le savoir ? » : deux personnages, deux enveloppes fermées, une loupe */
const tra01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={120}>
      <Picto n="personne" x={8} y={30} size={60} t0={100} />
      <Picto n="enveloppe" x={70} y={58} size={46} t0={500} />
      <Picto n="personne" x={176} y={30} size={60} t0={300} />
      <Picto n="enveloppe" x={238} y={58} size={46} t0={700} />
      <Picto n="loupe" x={118} y={10} size={64} t0={1100} tone="count" />
    </Art>
  </Seg>
)

/** 02 À même emploi et même temps de travail, 3,6 % : deux barres presque égales, l'écart montré du doigt */
const tra02: Board = p => {
  const cue = cuesOf(p)[0]
  const gap = num(cue?.text)
  const fe = word(p, /une femme/)
  const ho = word(p, /un homme/)
  const ec = word(p, /l’écart de salaire|l'écart de salaire/)
  if (!cue || !gap || gap >= 50) return null
  const x0 = 10
  const full = 200
  const short = full * (1 - gap / 100)
  const bar = (y: number, len: number, t0: number) => (
    <>
      <Fade t0={t0 + 300}>
        <rect class="vc-tint" x={x0} y={y} width={len} height={26} />
      </Fade>
      <Ink d={`M${x0} ${y}H${x0 + len}V${y + 26}H${x0}Z`} t0={t0} dur={700} />
    </>
  )
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        {fe ? <Txt x={x0 + 6} y={34} text={fe.text} size={15} anchor="start" t0={100} /> : null}
        {bar(42, short, 100)}
        {ho ? <Txt x={x0 + 6} y={96} text={ho.text} size={15} anchor="start" t0={400} /> : null}
        {bar(104, full, 400)}
        {cue.shown ? (
          <>
            <Fade class="vc-dash vc-count">
              <path d={`M${x0 + full} 30V130`} />
            </Fade>
            <Arrow x1={x0 + full + 52} y1={40} x2={x0 + short + 5} y2={52} tone="count" t0={200} />
            {ec ? <Txt x={296} y={30} text={ec.text} max={10} size={14} anchor="end" tone="count" t0={300} up /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Un index depuis 2019, une directive européenne en 2023 : deux documents sur une frise */
const tra03: Board = p => {
  const [y1, y2] = cuesOf(p)
  const a = num(y1?.text)
  const b = num(y2?.text)
  const idx = word(p, /index/)
  const dir = word(p, /directive/)
  if (!y1 || !y2 || !a || !b || a < 2018 || b > 2027) return null
  const { f, doc } = textes(2023)
  return (
    <Seg>
      <Art h={160}>
        {f.el}
        {y1.shown ? doc(a, idx?.text ?? null, undefined, 0) : null}
        {y2.shown ? doc(b, dir?.text ?? null, undefined, 0) : null}
      </Art>
    </Seg>
  )
}

/** 04 Un projet de loi présenté le 10 septembre 2026 : un troisième document sur la frise, relié à la directive */
const tra04: Board = p => {
  const cue = cuesOf(p)[0]
  const year = Number(/\d{4}/.exec(cue?.text ?? '')?.[0])
  const prev = p.script.segments.slice(0, p.index).flatMap(s => s.emphasis ?? []).map(Number).filter(n => n >= 2018 && n <= 2027)
  const idx = said(p, /index/)
  const dir = said(p, /directive/)
  const loi = word(p, /projet de loi/)
  if (!cue || !year || prev.length < 2 || year > 2027) return null
  const { f, doc } = textes(year)
  return (
    <Seg>
      <Head lines={[lineOf(cue)]} />
      <Art h={160}>
        {f.el}
        {doc(prev[0]!, idx, undefined, 0, true)}
        {doc(prev[1]!, dir, undefined, 0, true)}
        {cue.shown ? (
          <>
            <Arrow x1={f.X(prev[1]!) + 30} y1={82} x2={f.X(year) - 32} y2={82} t0={0} dash />
            {doc(year, loi?.text ?? null, 'count', 200)}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Remplacer l'index par 7 indicateurs, à déclarer dès 50 salariés : l'index en pointillé, sept jauges, un
 *  établissement */
const tra05: Board = p => {
  const [ind, sal] = cuesOf(p)
  const n = num(ind?.text)
  const idx = word(p, /l’index|l'index/)
  const des = word(p, /dès \d+[\s\u00a0]salariés/)
  if (!ind || !n || n > 9) return null
  const size = 24
  const gap = 4
  const x0 = 290 - n * size - (n - 1) * gap
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Picto n="document" x={6} y={0} size={56} t0={0} tone={ind.shown ? 'ghost' : undefined} />
        {idx ? <Txt x={34} y={74} text={idx.text} size={14} tone="soft" t0={200} /> : null}
        {ind.shown ? (
          <>
            <Arrow x1={70} y1={28} x2={x0 - 8} y2={28} t0={100} />
            <Jauges n={n} x={x0} y={16} size={size} gap={gap} t0={400} tone="count" />
          </>
        ) : null}
        {sal?.shown ? (
          <>
            <Etablissement x={70} y={84} size={52} t0={0} />
            <Txt x={130} y={118} text={des?.text ?? sal.text} size={16} anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Le droit de connaître la rémunération moyenne des femmes et des hommes de sa catégorie : une fiche à deux
 *  lignes, sans montant, sous une loupe */
const tra06: Board = p => {
  const fe = word(p, /femmes/)
  const ho = word(p, /hommes/)
  const cue = cuesOf(p)[0]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Picto n="personne" x={0} y={50} size={64} t0={100} />
        <Ink d="M96 8H272V120H96Z" t0={400} dur={800} />
        {fe ? <Txt x={110} y={52} text={fe.text} size={15} anchor="start" t0={900} /> : null}
        {ho ? <Txt x={110} y={92} text={ho.text} size={15} anchor="start" t0={1100} /> : null}
        <Fade t0={1200} class="vc-dash vc-soft">
          <path d="M180 48H258M180 88H258" />
        </Fade>
        {cue?.shown ? <Picto n="loupe" x={196} y={36} size={70} t0={0} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 07 « Jusqu'où mesurer les écarts, et qui doit les connaître ? » : la loupe sur la rangée de jauges */
const tra07: Board = p => {
  const n = num(said(p, /\d+[\s\u00a0]indicateurs/)) ?? 7
  const size = 24
  const gap = 4
  const w = n * size + (n - 1) * gap
  return (
    <Seg kind="ask">
      <Art h={100}>
        <Jauges n={n} x={14} y={50} size={size} gap={gap} t0={100} />
        <Picto n="loupe" x={14 + w / 2 - 44} y={14} size={70} t0={900} tone="count" />
        <Ask x={14 + w + 20} y={20} h={66} t0={1300} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Le registre ——— */

export const EGALITE: Record<string, Board> = {
  'egalite-intro-01': intro01,
  'egalite-intro-02': intro02,
  'egalite-intro-03': intro03,
  'egalite-intro-04': intro04,
  'egalite-intro-05': intro05,
  'egalite-intro-06': intro06,
  'egalite-intro-07': intro07,
  'egalite-intro-08': intro08,
  'egalite-intro-09': intro09,
  'egalite-intro-10': intro10,
  'egalite-salaires-01': sal01,
  'egalite-salaires-02': sal02,
  'egalite-salaires-03': sal03,
  'egalite-salaires-04': sal04,
  'egalite-salaires-05': sal05,
  'egalite-salaires-06': sal06,
  'egalite-salaires-07': sal07,
  'egalite-salaires-08': sal08,
  'egalite-salaires-09': sal09,
  'egalite-conges-01': con01,
  'egalite-conges-02': con02,
  'egalite-conges-03': con03,
  'egalite-conges-04': con04,
  'egalite-conges-05': con05,
  'egalite-conges-06': con06,
  'egalite-conges-07': con07,
  'egalite-conges-08': con08,
  'egalite-conges-09': con09,
  'egalite-garde-01': gar01,
  'egalite-garde-02': gar02,
  'egalite-garde-03': gar03,
  'egalite-garde-04': gar04,
  'egalite-garde-05': gar05,
  'egalite-garde-06': gar06,
  'egalite-transparence-01': tra01,
  'egalite-transparence-02': tra02,
  'egalite-transparence-03': tra03,
  'egalite-transparence-04': tra04,
  'egalite-transparence-05': tra05,
  'egalite-transparence-06': tra06,
  'egalite-transparence-07': tra07,
}
