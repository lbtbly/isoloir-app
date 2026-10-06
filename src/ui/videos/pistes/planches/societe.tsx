// Piste C, les planches de la série « Culture » (src/ui/videos/series/societe.ts) : un dessin par passage, composé
// avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Les mots et les nombres
// viennent du script (mots mis en valeur, phrases dites, chiffre de la fiche) : si le texte change, le dessin
// suit ; s'il ne s'y retrouve plus (une planche rend null), le passage prend le dessin générique de sa sorte
// d'image. Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les dit pas (« ont utilisé
// leur pass », « 0 ») : elles nomment ce qui est dessiné, sans rien ajouter au propos, et sont reprises dans l'alt.
// Cinq pictogrammes manquaient à la bibliothèque (écran, radio, scène, pellicule, horloge) : ils sont dessinés
// ici, au trait, sans attribut.

import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, cls, cuesOf, heard, num, plain, ratioOf, said, sentencesOf, sentenceWith, word, wrap, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Note, Panel, Question, Seg, Signature, Sommaire, Src, Sur100, lineOf, listAfterColon } from '../dessin/mises'
import { Picto, type PictoName } from '../dessin/pictos'
import { Move, Qui, Rang, balance, barres, manettes, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Pictogrammes de la série ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`

/** Dans un carré de 48 unités, traits dans l'ordre de la main ; « thin » et « bold » : index des traits fins et
 *  appuyés ; « fill » : la silhouette, pour l'aplat au bleu bille */
const DESSINS = {
  ecran: { s: ['M4 9H44V37H4Z', 'M24 37V44M18 44H30'], fill: 'M4 9H44V37H4Z' },
  antenne: { s: ['M4 15H44V40H4Z', 'M24 40V46M18 46H30', 'M17 3L24 15L31 3'], fill: 'M4 15H44V40H4Z', thin: [2] },
  radio: { s: ['M4 17H44V43H4Z', circle(15, 30, 7.5), 'M28 25h11M28 30h11M28 35h11', 'M9 17L36 5'], fill: 'M4 17H44V43H4Z', thin: [2] },
  scene: {
    s: ['M3 37H45L42 44H6Z', 'M6 37V4H42V37', 'M6 4Q12 10 18 4Q24 10 30 4Q36 10 42 4', 'M6 8C14 12 17 24 12 37M42 8C34 12 31 24 36 37', 'M9 13C12 20 12 29 9 37M39 13C36 20 36 29 39 37'],
    thin: [2, 4],
  },
  pellicule: {
    s: ['M10 3H38V45H10Z', 'M17 9H31V22H17ZM17 26H31V39H17Z', [6, 13, 20, 27, 34, 41].map(y => `M13.5 ${y}v1.5M34.5 ${y}v1.5`).join('')],
    fill: 'M10 3H38V45H10Z',
    thin: [1],
    bold: [2],
  },
  horloge: { s: [circle(24, 24, 19), 'M24 8v3M40 24h-3M24 40v-3M8 24h3', 'M24 24V13M24 24L32 29'], thin: [1], bold: [2] },
} satisfies Record<string, { s: string[]; fill?: string; thin?: number[]; bold?: number[] }>

type Dessin = keyof typeof DESSINS
type Trait = PictoName | Dessin

const isDessin = (n: Trait): n is Dessin => n in DESSINS

/** Un pictogramme de la série, placé comme Picto : (x, y) coin haut gauche, « size » côté en unités de la feuille */
function Pic({ n, x, y, size = 48, t0 = 0, kept, tone }: { n: Trait; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone }) {
  if (!isDessin(n)) return <Picto n={n} x={x} y={y} size={size} t0={t0} kept={kept} tone={tone} />
  const d: { s: string[]; fill?: string; thin?: number[]; bold?: number[] } = DESSINS[n]
  const still = kept || tone === 'ghost'
  return (
    <g class={cls('vc-p', tone && `vc-${tone}`)} transform={`translate(${x} ${y}) scale(${size / 48})`} style={{ '--k': String(48 / size) }}>
      {d.fill && tone === 'count' ? (
        <Fade t0={t0 + 250} kept={still}>
          <path class="vc-tint-count" d={d.fill} />
        </Fade>
      ) : null}
      {d.s.map((path, i) => (
        <Ink key={i} d={path} t0={t0 + i * 180} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : d.bold?.includes(i) ? 'vc-bold' : undefined} />
      ))}
    </g>
  )
}

/* ——— Communs à la série ——— */

/** Les quatre outils de l'État, dans l'ordre des vidéos : les pictogrammes du sommaire de la série */
const OUTILS: PictoName[] = ['pieces', 'tirelire', 'document', 'sablier']

/** Toutes les occurrences d'une expression dans le passage (drapeau g), telles qu'écrites, et si elles sont dites */
function allOf(p: P, re: RegExp): Cue[] {
  const s = p.segment.say
  return [...plain(s).matchAll(re)].map(m => {
    const at = m.index ?? 0
    const text = s.slice(at, at + m[0].length)
    return { text, shown: heard(p, text) }
  })
}

/** Un montant dit en milliards ou en millions, en milliards */
const milliards = (s: string | null | undefined) => {
  const v = num(s)
  return v === null || !s ? null : /million/.test(s) ? v / 1000 : v
}

/** Un trait au sol, sous les objets d'un dessin */
const Sol = ({ y, t0 = 100 }: { y: number; t0?: number }) => <Ink d={`M8 ${y}H292`} t0={t0} dur={700} class="vc-soft" />

/** Les deux enveloppes votées pour 2026, à la même échelle, depuis zéro : la mission « Culture », puis
 *  l'audiovisuel public ; « focus » : celle dont parle le passage, au bleu bille */
function enveloppes(p: P, a: Cue | null, b: Cue | null, focus: 1 | null) {
  const va = milliards(a?.text)
  const vb = milliards(b?.text)
  const la = said(p, /mission « Culture »/)
  const lb = said(p, /audiovisuel public/)
  if (!a || !b || !va || !vb || !la || !lb) return null
  return barres({
    items: [
      { label: la, value: va, text: a.text, shown: a.shown },
      { label: lb, value: vb, text: b.text, shown: b.shown, tone: focus === 1 ? 'count' : undefined },
    ],
    y: 2,
    size: 26,
    gap: 28,
    room: 136,
    t0: 200,
  })
}

/** Jauges de 0 à 100 % : le cadre au gris, la part remplie au bleu bille, la valeur à droite du cadre */
function jauges({ items, x, w, y = 0, t0 = 0, max = 26 }: { items: { label: string | null; value: number; text: string; shown: boolean }[]; x: number; w: number; y?: number; t0?: number; max?: number }) {
  let top = y
  const rows = items.map((it, i) => {
    const lines = it.label ? wrap(it.label, max).length : 0
    const g0 = top + lines * 16 + (lines ? 6 : 0)
    const end = x + (w * Math.min(100, it.value)) / 100
    const d = t0 + i * 400
    const row = (
      <g key={i}>
        {it.label ? <Txt x={x} y={top + 12} text={it.label} max={max} size={14} anchor="start" t0={d} /> : null}
        <Ink d={`M${x} ${g0}H${x + w}V${g0 + 20}H${x}Z`} t0={d} dur={600} class="vc-soft vc-thin" />
        {it.shown ? (
          <>
            <Fade t0={d + 400} class="vc-count">
              <rect class="vc-tint-count" x={x} y={g0} width={end - x} height={20} />
              <path d={`M${x} ${g0}H${end}V${g0 + 20}H${x}Z`} />
            </Fade>
            <Txt x={x + w + 8} y={g0 + 16} text={it.text} size={17} big anchor="start" tone="count" t0={d + 600} />
          </>
        ) : null}
      </g>
    )
    top = g0 + 20 + 14
    return row
  })
  return { el: <>{rows}</>, h: top - 14 - y }
}

/** Un calendrier mène à la loi de finances, qui fixe le ou les montants (piles de pièces) */
function annuel(p: P, piles: 1 | 2, what: RegExp) {
  const cue = cuesOf(p)[0]
  const lf = word(p, /la loi de finances/)
  const label = word(p, what)
  return (
    <Seg>
      <Head lines={[lineOf(cue)]} />
      <Art h={124}>
        <Picto n="calendrier" x={6} y={18} size={70} t0={200} />
        <Arrow x1={84} y1={54} x2={110} y2={54} t0={800} />
        <Picto n="document" x={112} y={12} size={78} t0={1000} />
        {lf ? <Txt x={151} y={114} text={lf.text} size={14} t0={1300} /> : null}
        <Arrow x1={194} y1={54} x2={218} y2={54} t0={1500} />
        {piles === 2 ? (
          <>
            <Picto n="pieces" x={222} y={30} size={36} t0={1700} />
            <Picto n="pieces" x={258} y={30} size={36} t0={1900} />
          </>
        ) : (
          <Picto n="pieces" x={226} y={22} size={58} t0={1700} />
        )}
        {label?.shown ? <Txt x={257} y={96} text={label.text} max={10} size={14} /> : null}
      </Art>
    </Seg>
  )
}

/** La barre de l'audiovisuel public pour 2026, partagée à l'échelle : France Télévisions, Radio France, le reste */
function barreAV(p: P, step: 'total' | 'parts' | 'reste') {
  const total = milliards(said(p, /\d+,\d+ milliards(?= d’euros)/))
  const ftText = said(p, /\d+,\d+ milliards(?= vont)/)
  const rfText = said(p, /\d+ millions(?= à Radio)/)
  const ft = milliards(ftText)
  const rf = milliards(rfText)
  const ftName = said(p, /France Télévisions/)
  const rfName = said(p, /Radio France/)
  if (!total || (step !== 'total' && (!ft || !rf || !ftName || !rfName || ft + rf >= total))) return null
  const x0 = 10
  const w = 280
  const k = w / total
  const top = 40
  const bot = 76
  const xa = x0 + (ft ?? 0) * k
  const xb = xa + (rf ?? 0) * k
  const [cFt, cRf] = step === 'parts' ? cuesOf(p) : [null, null]
  const showFt = step === 'reste' || !!cFt?.shown
  const showRf = step === 'reste' || !!cRf?.shown
  const kept = step === 'reste'
  const seg = (a: number, b: number, tone: 'count' | 'soft', t0: number) => (
    <Fade t0={t0} kept={kept} class={tone === 'count' ? 'vc-count' : undefined}>
      <rect class={tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={a} y={top} width={b - a} height={bot - top} />
      <path d={`M${b} ${top}V${bot}`} />
    </Fade>
  )
  return {
    xb,
    bot,
    el: (
      <>
        <Ink d={`M${x0} ${top}H${x0 + w}V${bot}H${x0}Z`} t0={100} dur={900} kept={kept} />
        {step === 'total' ? (
          <Fade t0={700}>
            <rect class="vc-tint" x={x0} y={top} width={w} height={bot - top} />
          </Fade>
        ) : null}
        {showFt ? seg(x0, xa, step === 'parts' ? 'count' : 'soft', 100) : null}
        {showRf ? seg(xa, xb, step === 'parts' ? 'count' : 'soft', 100) : null}
        {showFt && ftName ? <Txt x={(x0 + xa) / 2} y={top - 10} text={ftName} size={14} tone={step === 'reste' ? 'soft' : undefined} t0={200} kept={kept} /> : null}
        {showRf && rfName ? <Txt x={(xa + xb) / 2} y={top - 10} text={rfName} size={14} tone={step === 'reste' ? 'soft' : undefined} t0={200} kept={kept} /> : null}
        {cFt?.shown ? <Txt x={(x0 + xa) / 2} y={bot + 26} text={cFt.text} size={18} big tone="count" t0={400} /> : null}
        {cRf?.shown ? <Txt x={(xa + xb) / 2} y={bot + 26} text={cRf.text} size={18} big tone="count" t0={400} /> : null}
      </>
    ),
  }
}

/* ——— Introduction ——— */

/** 01 « Quel rôle l'État joue-t-il dans la culture ? » : un écran, une radio, un livre, en question */
const intro01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={150}>
      <Sol y={144} />
      <Pic n="ecran" x={6} y={67} size={84} t0={250} />
      <Pic n="radio" x={102} y={89} size={62} t0={700} />
      <Picto n="livre" x={176} y={93} size={58} t0={1100} />
      <Ask x={252} y={30} h={58} t0={1600} />
    </Art>
  </Seg>
)

/** 02 Les outils de l'État, chacun sous son pictogramme, quand la voix le nomme */
const intro02: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length !== OUTILS.length) return null
  return (
    <Seg>
      <HeadCues p={p} />
      <Panel cols={2} items={list.map((t, i) => ({ picto: OUTILS[i]!, text: t, shown: heard(p, t.split(' ').slice(0, 3).join(' ')) }))} />
    </Seg>
  )
}

/** 03 Les deux enveloppes votées pour 2026 : la mission « Culture » et l'audiovisuel public, à la même échelle */
const intro03: Board = p => {
  const [a, b] = cuesOf(p)
  const g = enveloppes(p, a ?? null, b ?? null, null)
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le pass Culture : 50 euros à 17 ans, 150 euros à 18 ans, à la même échelle */
const intro04: Board = p => {
  const [a, b] = cuesOf(p)
  const ages = allOf(p, /à \d+ ans/g)
  const va = num(a?.text)
  const vb = num(b?.text)
  const name = word(p, /le pass Culture/)
  if (!a || !b || !va || !vb || ages.length < 2) return null
  const g = barres({
    items: [
      { label: ages[0]!.text, value: va, text: a.text, shown: a.shown, tone: 'count' },
      { label: ages[1]!.text, value: vb, text: b.text, shown: b.shown, tone: 'count' },
    ],
    y: 2,
    size: 26,
    gap: 28,
    room: 110,
    t0: 100,
  })
  return (
    <Seg>
      <Head lines={[name ? { text: name.text, shown: name.shown } : null]} />
      <Art h={g.h + 6}>{g.el}</Art>
    </Seg>
  )
}

/** 05 Les quotas : un écran, et deux jauges sur 100, remplies à 60 et à 40 */
const intro05: Board = p => {
  const [q, a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!q || !a || !b || !va || !vb) return null
  const temps = word(p, /sur le temps de diffusion des œuvres/)
  const j = jauges({
    items: [
      { label: word(p, /œuvres européennes/)?.text ?? null, value: va, text: a.text, shown: a.shown },
      { label: word(p, /œuvres conçues d’abord en français/)?.text ?? null, value: vb, text: b.text, shown: b.shown },
    ],
    x: 100,
    w: 150,
    y: 4,
    t0: 400,
    max: 22,
  })
  return (
    <Seg>
      <Head lines={[lineOf(q)]} />
      <Art h={j.h + 40}>
        <Pic n="ecran" x={0} y={14} size={86} t0={100} />
        {j.el}
        {temps?.shown ? <Txt x={W / 2} y={j.h + 34} text={temps.text} size={14} tone="soft" /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Le désaccord porte sur les priorités : quatre manettes, une par outil, toutes au milieu */
const intro06: Board = p => {
  const labels = [said(p, /budget/), said(p, /audiovisuel public/), said(p, /pass Culture/), said(p, /quotas/)]
  const lev = manettes({
    items: OUTILS.map((n, i) => ({ picto: n, label: labels[i] ?? undefined, pos: 0.5 })),
    y: 2,
    h: 70,
    size: 40,
    t0: 200,
    labelMax: 11,
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={lev.h + 4}>{lev.el}</Art>
    </Seg>
  )
}

/** 07 Les quatre questions du thème, chacune sous le pictogramme de sa vidéo, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length !== OUTILS.length) return null
  return (
    <Seg kind="ask">
      <Panel cols={2} items={qs.map((q, i) => ({ picto: OUTILS[i]!, text: q, shown: heard(p, q.split(' ').slice(0, 2).join(' ')), cues: cuesOf(p) }))} />
    </Seg>
  )
}

/** 08 Les quatre sujets des vidéos qui suivent : le sommaire de la série */
const intro08: Board = p => (
  <Seg kind="end">
    <Sommaire p={p} />
    <Signature p={p} />
  </Seg>
)

/* ——— Budget ——— */

/** 01 Un monument à entretenir, un spectacle à créer : et l'argent de l'État, combien ? */
const budget01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={150}>
      <Sol y={144} />
      <Picto n="monument" x={10} y={67} size={84} t0={200} />
      <Picto n="pieces" x={120} y={99} size={50} t0={1000} />
      <Ask x={130} y={26} h={56} t0={1600} />
      <Pic n="scene" x={202} y={65} size={88} t0={600} />
    </Art>
  </Seg>
)

/** 02 3,745 milliards pour la mission « Culture » : la loi de finances (sa date est sous le chiffre, avec la
 *  source), et la pile de pièces qu'elle accorde */
const budget02: Board = p => {
  const cue = cuesOf(p)[0]
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={96}>
        <Picto n="document" x={40} y={4} size={80} t0={300} />
        <Arrow x1={136} y1={46} x2={178} y2={46} t0={900} />
        <Picto n="pieces" x={188} y={2} size={88} tone={cue?.shown ? 'count' : undefined} t0={1100} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Quatre grands postes : le patrimoine, la création, la transmission des savoirs, le soutien du ministère */
const POSTES: [RegExp, Trait][] = [
  [/patrimoine/, 'monument'],
  [/création/, 'scene'],
  [/savoirs/, 'livre'],
  [/ministère/, 'immeuble'],
]

const budget03: Board = p => {
  const list = listAfterColon(p.segment.say)
  if (list.length !== 4) return null
  const size = 50
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={194}>
        {list.map((t, i) => {
          const cx = i % 2 ? 225 : 75
          const top = Math.floor(i / 2) * 100
          const n = POSTES.find(([re]) => re.test(t))?.[1] ?? 'document'
          return heard(p, t.split(' ').slice(0, 2).join(' ')) ? (
            <g key={t}>
              <Pic n={n} x={cx - size / 2} y={top} size={size} t0={0} />
              <Txt x={cx} y={top + size + 18} text={t} max={18} size={14} t0={300} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 04 L'audiovisuel public, financé à part : les deux enveloppes à la même échelle, la sienne au bleu bille */
const budget04: Board = p => {
  const culture = said(p, /\d+,\d+ milliards(?= d’euros pour la mission)/)
  const b = cuesOf(p)[1] ?? null
  const g = enveloppes(p, culture ? { text: culture, shown: true } : null, b, 1)
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Fixés chaque année par le Parlement, dans la loi de finances : les deux montants */
const budget05: Board = p => annuel(p, 2, /deux montants/)

/** 06 « Combien pour la culture, et pour quelles priorités ? » */
const budget06: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="pieces" x={34} y={30} size={72} t0={100} />
      <Picto n="monument" x={122} y={14} size={84} t0={500} />
      <Ask x={234} y={18} h={76} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Audiovisuel public ——— */

/** 01 Plus de redevance télé (son avis en pointillé) : qui finance les chaînes et les radios publiques ? */
const av01: Board = p => {
  const red = word(p, /redevance télé/)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={150}>
        <Sol y={144} />
        <Pic n="ecran" x={2} y={69} size={82} t0={200} />
        <Pic n="radio" x={90} y={92} size={58} t0={600} />
        <Picto n="document" x={178} y={42} size={60} tone="ghost" />
        {red ? <Txt x={208} y={128} text={red.text} size={14} tone="soft" t0={900} /> : null}
        <Ask x={256} y={24} h={56} t0={1500} />
      </Art>
    </Seg>
  )
}

/** 02 Une part de la TVA va à l'audiovisuel public : une pièce quitte la pile, vers l'écran et la radio */
const av02: Board = p => {
  const cue = cuesOf(p)[0]
  const tva = word(p, /TVA/)
  const av = word(p, /l’audiovisuel public/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={140}>
        <Picto n="etiquette" x={0} y={0} size={96} t0={100} text={tva?.text} />
        <Picto n="pieces" x={22} y={78} size={56} t0={600} />
        {cue?.shown ? (
          <>
            <Picto n="piece" x={98} y={64} size={30} tone="count" t0={200} />
            <Arrow x1={134} y1={79} x2={176} y2={79} tone="count" t0={500} />
          </>
        ) : null}
        <Pic n="ecran" x={184} y={34} size={62} t0={900} />
        <Pic n="radio" x={250} y={53} size={42} t0={1100} />
        {av?.shown ? <Txt x={238} y={114} text={av.text} max={13} size={14} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 « Ce financement » (la part de la TVA, du passage précédent) rendu durable par une loi organique : l'étiquette
 *  de la TVA reliée à l'écran et à la radio, le texte de la loi posé sur le lien quand la voix le nomme, sa date
 *  dessous */
const av03: Board = p => {
  const [loi, date] = cuesOf(p)
  const tva = said(p, /TVA/)
  if (!loi || !date || !tva) return null
  return (
    <Seg>
      <Head lines={[lineOf(loi)]} />
      <Art h={136}>
        <Picto n="etiquette" x={0} y={8} size={80} t0={100} text={tva} />
        <Arrow x1={82} y1={52} x2={106} y2={52} t0={500} />
        <Arrow x1={164} y1={52} x2={186} y2={52} t0={700} />
        <Pic n="ecran" x={188} y={22} size={60} t0={800} />
        <Pic n="radio" x={252} y={42} size={42} t0={1000} />
        {loi.shown ? <Picto n="document" x={108} y={22} size={56} tone="count" t0={200} /> : null}
        {date.shown ? <Txt x={136} y={124} text={date.text} size={18} big tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 04 Trois marches : les lois ordinaires, la loi organique (au bleu bille), la Constitution */
const av04: Board = p => {
  const ord = word(p, /lois ordinaires/)
  const org = word(p, /loi organique/)
  const cst = word(p, /Constitution/)
  if (!ord || !org || !cst) return null
  const base = 176
  return (
    <Seg>
      <Art h={182}>
        <Ink d={`M8 ${base}H292`} t0={0} dur={500} class="vc-soft" />
        <Fade t0={500} class="vc-count">
          <rect class="vc-tint-count" x={104} y={96} width={92} height={base - 96} />
        </Fade>
        <Ink d={`M12 ${base}V136H104V96H196V56H288V${base}`} t0={200} dur={1200} />
        <Ink d={`M104 ${base}V136M196 ${base}V96`} t0={900} dur={500} class="vc-thin vc-soft" />
        <Txt x={150} y={86} text={org.text} size={15} tone="count" t0={400} />
        {ord.shown ? <Txt x={58} y={110} text={ord.text} max={10} size={15} up /> : null}
        {cst.shown ? <Txt x={242} y={46} text={cst.text} size={15} /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Le montant, fixé chaque année par le Parlement, dans la loi de finances */
const av05: Board = p => annuel(p, 1, /le montant/)

/** 06 3,863 milliards pour 2026 : une longue barre, l'enveloppe de l'audiovisuel public */
const av06: Board = p => {
  const g = barreAV(p, 'total')
  if (!g) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={140}>
        <Move y={-30}>{g.el}</Move>
        <Pic n="ecran" x={98} y={58} size={56} t0={1000} />
        <Pic n="radio" x={164} y={68} size={44} t0={1200} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Sur ce total, France Télévisions et Radio France : la barre se partage, à l'échelle */
const av07: Board = p => {
  const g = barreAV(p, 'parts')
  if (!g) return null
  return (
    <Seg>
      <Art h={g.bot + 34}>{g.el}</Art>
    </Seg>
  )
}

/** 08 Le reste : Arte France, France Médias Monde, l'INA et TV5 Monde, sous le dernier morceau de la barre */
const av08: Board = p => {
  const cue = cuesOf(p)[0]
  const g = barreAV(p, 'reste')
  const tail = /va à (.+?)\.?$/.exec(p.segment.say)?.[1]
  const names = tail ? tail.split(/, | et /).map(s => s.trim()).filter(Boolean) : []
  if (!g || !cue || names.length < 2) return null
  const shown = cue.shown
  return (
    <Seg>
      <Head lines={[lineOf(cue)]} />
      <Art h={g.bot + 22 + names.length * 20}>
        {g.el}
        {shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={g.xb} y={40} width={290 - g.xb} height={g.bot - 40} />
            </Fade>
            <Brace x1={g.xb} y1={g.bot + 6} x2={290} y2={g.bot + 6} tone="count" t0={200} />
            {names.map((n, i) => (
              <Txt key={n} x={290} y={g.bot + 40 + i * 20} text={n} size={15} anchor="end" t0={400 + i * 250} />
            ))}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 09 « Comment financer l'audiovisuel public, et à quelle hauteur ? » */
const av09: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Sol y={100} t0={0} />
      <Pic n="ecran" x={24} y={23} size={88} t0={100} />
      <Pic n="radio" x={122} y={46} size={60} t0={500} />
      <Ask x={232} y={16} h={76} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Pass Culture ——— */

/** 01 Vous avez 17 ans, un crédit vous attend : une personne, la carte du pass, en question */
const pass01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={140}>
      <Sol y={136} />
      <Qui cx={70} base={134} size={92} t0={200} />
      <Picto n="carte" x={128} y={42} size={84} tone="count" t0={800} />
      <Ask x={240} y={26} h={70} t0={1500} />
    </Art>
  </Seg>
)

/** 02 50 euros à 17 ans, 150 euros à 18 ans, à la même échelle ; à utiliser en 3 ans (un sablier) */
const pass02: Board = p => {
  const [a, b, delay] = cuesOf(p)
  const ages = allOf(p, /à \d+ ans/g)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb || ages.length < 2) return null
  const g = barres({
    items: [
      { label: ages[0]!.text, value: va, text: a.text, shown: a.shown, tone: 'count' },
      { label: ages[1]!.text, value: vb, text: b.text, shown: b.shown, tone: 'count' },
    ],
    y: 2,
    size: 26,
    gap: 28,
    room: 110,
    t0: 100,
  })
  return (
    <Seg>
      <Art h={g.h + 66}>
        {g.el}
        {delay?.shown ? (
          <>
            <Picto n="sablier" x={92} y={g.h + 20} size={44} t0={0} />
            <Txt x={144} y={g.h + 50} text={delay.text} size={18} big anchor="start" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Un bonus de 50 euros annoncé : une troisième barre, à la même échelle, en pointillé */
const pass03: Board = p => {
  const cue = cuesOf(p)[0]
  const a = said(p, /\d+ euros(?= à \d+ ans, puis)/)
  const b = said(p, /\d+ euros(?= à \d+ ans, à utiliser)/)
  const la = said(p, /à \d+ ans(?=, puis)/)
  const lb = said(p, /à \d+ ans(?=, à utiliser)/)
  const bonus = word(p, /\d+ euros/)
  const what = word(p, /Un bonus/)
  const [va, vb, vc] = [num(a), num(b), num(bonus?.text)]
  if (!cue || !a || !b || !bonus || !va || !vb || !vc) return null
  const g = barres({
    items: [
      { label: la ?? undefined, value: va, text: a, tone: 'soft' },
      { label: lb ?? undefined, value: vb, text: b, tone: 'soft' },
      { label: what?.text, value: vc, text: bonus.text, ghostFrom: 0, shown: cue.shown },
    ],
    y: 2,
    size: 22,
    gap: 24,
    room: 110,
    kept: true,
  })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
    </Seg>
  )
}

/** 04 La part collective : les enseignants, et leurs élèves, de la 6e à la terminale */
const pass04: Board = p => {
  const ens = word(p, /les enseignants/)
  const span = word(p, /de la 6e à la terminale/)
  const row = rangCells({ n: 5, x: 116, w: 180, y: 58, max: 32, gap: 5 })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={150}>
        <Sol y={96} t0={0} />
        <Qui cx={56} base={94} size={66} t0={200} label={ens?.text} shown={!!ens?.shown} max={12} />
        {span?.shown ? (
          <>
            <Rang n={5} picto="personne" x={116} w={180} y={58} max={32} gap={5} t0={0} stagger={120} />
            <Brace x1={row.cells[0]!.x} y1={106} x2={296} y2={106} t0={0} />
            <Txt x={206} y={142} text={span.text} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 72 % des élèves concernés : cent cases, dont 72 au bleu bille */
const pass05: Board = p => {
  const [pct, r] = cuesOf(p)
  const v = num(pct?.text)
  if (!pct || !r || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={Math.round(v)} caption={sentenceWith(p.segment.say, r.text)} shown={pct.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 06 75 % des jeunes avaient utilisé leur crédit : trois sur quatre */
const pass06: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 10) return null
  const { h } = rangCells({ n: r.n, max: 56, gap: 22 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 4}>
        <Rang n={r.n} picto="personne" y={2} max={56} gap={22} count={range(r.k)} shown={cue.shown} t0={300} stagger={180} />
      </Art>
      <Note p={p} text={sentenceWith(p.segment.say, cue.text)} />
      <Src p={p} />
    </Seg>
  )
}

/** 07 Un peu plus de 250 euros dépensés, sur les 300 : une jauge graduée jusqu'au crédit */
const pass07: Board = p => {
  const cue = cuesOf(p)[0]
  const tot = num(word(p, /les \d+/)?.text)
  const v = num(cue?.text)
  if (!cue || !tot || !v || v >= tot) return null
  const x0 = 14
  const w = 272
  const end = x0 + (v * w) / tot
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={96}>
        <Ink d={`M${x0} 20H${x0 + w}V54H${x0}Z`} t0={100} dur={900} />
        <Ink d={range(Math.floor(tot / 50) - 1).map(k => `M${x0 + ((k + 1) * 50 * w) / tot} 54v-6`).join('')} t0={600} dur={400} class="vc-thin vc-soft" />
        <Txt x={x0} y={78} text="0" size={14} tone="soft" t0={300} />
        <Txt x={x0 + w} y={78} text={String(tot)} size={14} tone="soft" t0={400} />
        {cue.shown ? (
          <>
            <Fade t0={300} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={20} width={end - x0} height={34} />
              <path d={`M${end} 20V54`} />
            </Fade>
            <Arrow x1={end + 3} y1={37} x2={end + 17} y2={37} tone="count" t0={800} head={5} />
            <Txt x={end} y={78} text={String(v)} size={17} big tone="count" t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 Les autres : 16 % de non-inscrits, 9 % d'inscrits sans l'utiliser ; à la même échelle que les 75 % */
const pass08: Board = p => {
  const [a, b] = cuesOf(p)
  const used = said(p, /\d+ %(?= des jeunes)/)
  const la = word(p, /ne s’étaient pas inscrits/)
  const lb = word(p, /s’étaient inscrits sans l’utiliser/)
  const [vu, va, vb] = [num(used), num(a?.text), num(b?.text)]
  if (!a || !b || !used || !vu || !va || !vb) return null
  const g = barres({
    items: [
      { label: 'ont utilisé leur pass', value: vu, text: used, tone: 'soft' },
      { label: la?.text, value: va, text: a.text, shown: a.shown, tone: 'count' },
      { label: lb?.text, value: vb, text: b.text, shown: b.shown, tone: 'count' },
    ],
    y: 2,
    size: 22,
    gap: 28,
    room: 72,
    t0: 100,
  })
  return (
    <Seg>
      <Art h={g.h + 6}>{g.el}</Art>
    </Seg>
  )
}

/** 09 D'un côté le crédit individuel, de l'autre la part collective : deux plateaux égaux, fléau horizontal */
const pass09: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="personne" x={cx - 40} y={base - 46} size={46} t0={900} />
        <Picto n="carte" x={cx + 2} y={base - 44} size={40} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <>
        {[-24, 0, 24].map((dx, i) => (
          <Picto key={dx} n="personne" x={cx + dx - 12} y={base - 26} size={24} t0={1300 + i * 150} />
        ))}
      </>
    ),
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

/** 10 « Quelle place donner à chacune de ces deux parts ? » : la carte, la rangée d'élèves, en question */
const pass10: Board = p => (
  <Seg kind="ask">
    <Art h={100}>
      <Picto n="carte" x={10} y={14} size={80} t0={100} />
      {[0, 1, 2].map(i => (
        <Picto key={i} n="personne" x={106 + i * 36} y={38} size={34} t0={500 + i * 150} />
      ))}
      <Ask x={236} y={12} h={72} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Quotas ——— */

/** 01 « La chaîne choisit-elle librement ? » : un écran, et la question */
const quotas01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={124}>
      <Pic n="ecran" x={40} y={2} size={120} t0={200} />
      <Ask x={210} y={24} h={76} t0={1200} />
    </Art>
  </Seg>
)

/** 02 Des quotas, des parts minimales du temps de diffusion : l'écran et le sablier du temps */
const quotas02: Board = p => {
  const temps = word(p, /temps de diffusion des œuvres/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={132}>
        <Pic n="ecran" x={14} y={10} size={104} t0={100} />
        <Picto n="sablier" x={180} y={4} size={80} t0={700} />
        {temps?.shown ? <Txt x={220} y={106} text={temps.text} max={18} size={14} /> : null}
      </Art>
    </Seg>
  )
}

/** 03 Au moins 60 % pour des œuvres européennes : cent cases, dont 60 au bleu bille */
const quotas03: Board = p => {
  const cue = cuesOf(p)[0]
  const v = num(cue?.text)
  const eu = word(p, /des œuvres européennes/)
  if (!cue || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={Math.round(v)} caption={eu?.text ?? null} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 04 Et au moins 40 % d'expression originale française : les deux quotas à la même échelle, sur 100 */
const quotas04: Board = p => {
  const cue = cuesOf(p)[0]
  const prev = said(p, /\d+ %(?= du temps)/)
  const eu = said(p, /œuvres européennes/)
  const fr = word(p, /expression originale française/)
  const [vp, v] = [num(prev), num(cue?.text)]
  if (!cue || !prev || !vp || !v) return null
  const g = barres({
    items: [
      { label: eu ?? undefined, value: vp, text: prev, tone: 'soft' },
      { label: fr?.text, value: v, text: cue.text, shown: cue.shown, tone: 'count' },
    ],
    max: 100,
    y: 2,
    size: 24,
    gap: 26,
    room: 70,
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

/** 05 Les chaînes hertziennes (reçues par l'antenne) : aussi aux heures de grande écoute, une horloge */
const quotas05: Board = p => {
  const h = word(p, /hertziennes/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={138}>
        <Pic n="antenne" x={16} y={0} size={108} t0={100} />
        {h ? <Txt x={70} y={130} text={h.text} size={14} tone="soft" t0={900} /> : null}
        <Pic n="horloge" x={176} y={10} size={98} t0={800} />
      </Art>
    </Seg>
  )
}

/** 06 Pour les films, des proportions comparables : une pellicule, et les deux jauges, 60 et 40 sur 100 */
const quotas06: Board = p => {
  const pcts = allOf(p, /\d+ %/g)
  const [a, b] = pcts
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb) return null
  const j = jauges({
    items: [
      { label: said(p, /œuvres européennes/), value: va, text: a.text, shown: a.shown },
      { label: said(p, /conçues d’abord en français/), value: vb, text: b.text, shown: b.shown },
    ],
    x: 96,
    w: 150,
    y: 4,
    t0: 500,
    max: 22,
  })
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={Math.max(j.h + 8, 96)}>
        <Pic n="pellicule" x={0} y={4} size={88} t0={100} />
        {j.el}
      </Art>
    </Seg>
  )
}

/** 07 « Quelle part de l'écran pour les œuvres européennes et françaises ? » */
const quotas07: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Pic n="ecran" x={40} y={4} size={110} t0={100} />
      <Ask x={210} y={16} h={76} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Le registre ——— */

export const SOCIETE: Record<string, Board> = {
  'culture-intro-01': intro01,
  'culture-intro-02': intro02,
  'culture-intro-03': intro03,
  'culture-intro-04': intro04,
  'culture-intro-05': intro05,
  'culture-intro-06': intro06,
  'culture-intro-07': intro07,
  'culture-intro-08': intro08,
  'culture-budget-01': budget01,
  'culture-budget-02': budget02,
  'culture-budget-03': budget03,
  'culture-budget-04': budget04,
  'culture-budget-05': budget05,
  'culture-budget-06': budget06,
  'culture-audiovisuel-01': av01,
  'culture-audiovisuel-02': av02,
  'culture-audiovisuel-03': av03,
  'culture-audiovisuel-04': av04,
  'culture-audiovisuel-05': av05,
  'culture-audiovisuel-06': av06,
  'culture-audiovisuel-07': av07,
  'culture-audiovisuel-08': av08,
  'culture-audiovisuel-09': av09,
  'culture-pass-01': pass01,
  'culture-pass-02': pass02,
  'culture-pass-03': pass03,
  'culture-pass-04': pass04,
  'culture-pass-05': pass05,
  'culture-pass-06': pass06,
  'culture-pass-07': pass07,
  'culture-pass-08': pass08,
  'culture-pass-09': pass09,
  'culture-pass-10': pass10,
  'culture-quotas-01': quotas01,
  'culture-quotas-02': quotas02,
  'culture-quotas-03': quotas03,
  'culture-quotas-04': quotas04,
  'culture-quotas-05': quotas05,
  'culture-quotas-06': quotas06,
  'culture-quotas-07': quotas07,
}
