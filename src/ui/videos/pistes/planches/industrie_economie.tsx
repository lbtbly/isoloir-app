// Piste C, les planches de la série « Industrie et entreprises » (src/ui/videos/series/industrie_economie.ts) :
// un dessin par passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx,
// dessin/mises.tsx). Mêmes règles que les séries « Retraites » et « Logement » : les mots et les nombres viennent
// du script (mots mis en valeur, phrases dites, chiffre de la fiche) ; une planche qui ne s'y retrouve plus rend
// null, et le passage prend le dessin générique de sa sorte d'image.
// Quelques étiquettes courtes et neutres sont écrites ici quand le passage ne les dit pas (« exportations »,
// « en milliards d'euros », « UE ») : elles nomment ce qui est dessiné, et l'« alt » du passage les reprend.
// Les pictogrammes qui manquent à la bibliothèque (usine, conteneur, téléphone, vêtement, voiture, centrale,
// assiette, route) sont dessinés ici, au trait, sans attribut.

import { Art, Arrow, Ask, Brace, Fade, Ink, SP, Txt, W, at, cls, cueOf, cuesOf, heard, num, nums, ratioOf, said, sentenceWith, sentencesOf, word, yearsOf, type Cue, type P, type Tone } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Panel, Question, Seg, Signature, Src, Sur100, lineOf } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Barriere, Cases, Disque, Pause, Qui, Rang, Signe, balance, barres, casesH, colonnes, frise, partPoint } from '../dessin/schemas'
import { INDUSTRIE_ECONOMIE as SERIE } from '../../series/industrie_economie'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
/** Un mot du script en début de ligne d'étiquette : sans sa majuscule de début de phrase */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
/** Le nombre d'un mot mis en valeur, sans son unité dite (« 179,5 milliards » → « 179,5 ») */
const nombre = (s: string) => /\d[\d\u202f]*(?:,\d+)?/.exec(s)?.[0] ?? s

/* ——— Les pictogrammes propres à la série ——— */

interface Trace {
  /** Les traits, dans l'ordre où la main les trace */
  s: string[]
  /** La silhouette, pour l'aplat au bleu bille */
  fill?: string
  thin?: number[]
}

/** Dans un carré de 48 unités, comme ceux de la bibliothèque */
const MIENS = {
  usine: {
    s: ['M3 44H45', 'M7 44V25L17 17V25L27 17V25L36 17V44', 'M36 44V7H42V44', 'M12 32h6v5h-6zM23 32h6v5h-6z'],
    fill: 'M7 44V25L17 17V25L27 17V25L36 17V7H42V44Z',
    thin: [3],
  },
  conteneur: {
    s: ['M3 15H45V37H3Z', 'M9 18.5V33.5M15 18.5V33.5M21 18.5V33.5M27 18.5V33.5M33 18.5V33.5M39 18.5V33.5'],
    fill: 'M3 15H45V37H3Z',
    thin: [1],
  },
  telephone: {
    s: ['M17 4H31a4 4 0 0 1 4 4V40a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z', 'M13 10H35M13 36H35', 'M22 40h4'],
    thin: [1],
  },
  vetement: {
    s: ['M17 6L5 13L10 22L15 19V43H33V19L38 22L43 13L31 6', 'M17 6C19 11 29 11 31 6'],
    fill: 'M17 6L5 13L10 22L15 19V43H33V19L38 22L43 13L31 6C29 11 19 11 17 6Z',
  },
  voiture: {
    s: ['M8.5 33H4V26L11 24L17 15H31L38 24L44 26V33H39.5M17.5 33H30.5', circle(13, 33, 4.5), circle(35, 33, 4.5), 'M19 18.5H29.5L33.5 24H15Z'],
    thin: [3],
  },
  centrale: {
    s: ['M3 44H45', 'M7 44C11 33 11 20 8 8H24C21 20 21 33 25 44', 'M28 44V27H42V44', 'M32 33h6'],
    thin: [3],
  },
  electrique: {
    s: ['M9 4H39V44H9Z', 'M14 9H34V18H14Z', 'M26 23L18 34H24L21 42L31 30H25L28 23Z'],
    fill: 'M9 4H39V44H9Z',
    thin: [1],
  },
  assiette: { s: [circle(24, 25, 17), circle(24, 25, 10)], thin: [1] },
  route: { s: ['M12 45L20 4M36 45L28 4', 'M24 42v-6M24 30v-6M24 18v-5M24 8v-3'], thin: [1] },
} satisfies Record<string, Trace>

type MienName = keyof typeof MIENS
type AnyName = PictoName | MienName

const isMien = (n: AnyName): n is MienName => n in MIENS

/** Un pictogramme de la série, placé sur la feuille : il se dessine trait après trait, comme Picto */
function Mien({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1, step = 200 }: { n: MienName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number; step?: number }) {
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
        <Ink key={i} d={path} t0={t0 + i * step} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : undefined} />
      ))}
    </g>
  )
}

/** Un pictogramme, de la bibliothèque ou de la série */
function Any({ n, ...rest }: { n: AnyName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number }) {
  return isMien(n) ? <Mien n={n} {...rest} /> : <Picto n={n} {...rest} />
}

/** Un pictogramme seul dans son SVG, pour une liste en HTML (le sommaire) */
function Glyphe2({ n, t0 = 0 }: { n: AnyName; t0?: number }) {
  if (!isMien(n)) return <Glyphe n={n} t0={t0} />
  return (
    <svg class="vc-svg vc-glyphe" viewBox="-2 -2 52 52" aria-hidden="true">
      <Mien n={n} x={0} y={0} t0={t0} step={150} />
    </svg>
  )
}

/* ——— Communs à la série ——— */

/** Le pictogramme de chaque approfondissement, au sommaire de l'introduction */
const CHAPITRES: Record<string, AnyName> = {
  'industrie-etat': 'monument',
  'industrie-energie': 'electrique',
  'industrie-commerce': 'conteneur',
  'industrie-achats': 'document',
  'industrie-aides': 'pieces',
}

/** Le pied d'un pictogramme posé sur une ligne de sol : son « y » (le bas du dessin est à 44 ou 45 unités) */
const surSol = (ground: number, size: number, bottom = 44) => ground - (bottom * size) / 48

/**
 * Les échanges de biens : exportations et importations, deux barres à la même échelle depuis zéro ; l'écart, le
 * déficit, marqué d'une accolade. « exp » : les exportations (dites, ou lues dans le libellé du chiffre).
 */
function echanges(exp: number, expCue: Cue | null, gap: Cue) {
  const g = num(gap.text)
  if (!g || !exp) return null
  const imp = exp + g
  const x0 = 4
  const s = (W - 20 - x0) / imp
  const xe = x0 + exp * s
  const xi = x0 + imp * s
  const yE = 22
  const yI = 82
  const hB = 28
  const bar = (y: number, x1: number) => `M${x0} ${y}H${x1}V${y + hB}H${x0}Z`
  return (
    <Art h={160}>
      <Txt x={x0 + 2} y={yE - 8} text="exportations" anchor="start" size={15} t0={100} />
      <Fade t0={500}>
        <rect class="vc-tint" x={x0} y={yE} width={xe - x0} height={hB} />
      </Fade>
      <Ink d={bar(yE, xe)} t0={200} dur={700} />
      {expCue?.shown ? <Txt x={x0 + 10} y={yE + 20} text={expCue.text} anchor="start" size={16} t0={200} /> : null}
      <Txt x={x0 + 2} y={yI - 8} text="importations" anchor="start" size={15} t0={600} />
      <Fade t0={1000}>
        <rect class="vc-tint" x={x0} y={yI} width={xi - x0} height={hB} />
      </Fade>
      <Ink d={bar(yI, xi)} t0={700} dur={700} />
      <Fade t0={1300} class="vc-dash vc-soft">
        <path d={`M${xe} ${yE}V${yI + hB + 4}`} />
      </Fade>
      {gap.shown ? (
        <>
          <Brace x1={xe} y1={yI + hB + 6} x2={xi} y2={yI + hB + 6} tone="count" t0={100} />
          <Txt x={W - 2} y={yI + hB + 40} text={gap.text} anchor="end" size={18} big tone="count" t0={300} />
        </>
      ) : null}
    </Art>
  )
}

/** Une question finale : des pictogrammes, une ligne en pointillé, un point d'interrogation ; dessous, la question */
function finale(p: P, left: AnyName, right?: AnyName) {
  return (
    <Seg kind="ask">
      <Art h={110}>
        <Any n={left} x={6} y={14} size={84} t0={100} />
        <Arrow x1={98} y1={58} x2={right ? 150 : 222} y2={58} dash t0={800} />
        {right ? <Any n={right} x={156} y={14} size={84} t0={500} /> : null}
        <Ask x={right ? 250 : 232} y={20} h={64} t0={1200} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Une usine ouvre ici, une autre ferme là » : deux usines, l'une se dessine, l'autre s'efface ; la question */
const intro01: Board = p => {
  const [open, close] = cuesOf(p)
  const ground = 118
  return (
    <Seg>
      <Art h={150}>
        <Ink d={`M8 ${ground}H292`} t0={0} dur={600} class="vc-soft" />
        <Mien n="usine" x={22} y={surSol(ground, 96)} size={96} t0={150} tone={open?.shown ? 'count' : undefined} />
        <Mien n="usine" x={182} y={surSol(ground, 96)} size={96} t0={500} tone={close?.shown ? 'ghost' : undefined} />
        {open?.shown ? <Txt x={70} y={ground + 26} text={open.text} size={16} tone="count" /> : null}
        {close?.shown ? <Txt x={230} y={ground + 26} text={close.text} size={16} tone="soft" /> : null}
        <Ask x={138} y={44} h={48} t0={1200} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 02 Le solde d'usines : plus 88 en 2024, plus 19 en 2025, deux colonnes à la même échelle */
const intro02: Board = p => {
  const cues = cuesOf(p).slice(0, 2)
  const years = yearsOf(p.segment.say)
  if (cues.length < 2 || years.length < 2) return null
  const items = cues.map((c, i) => ({ year: years[i]!, value: num(c.text) ?? 0, cue: c })).sort((a, b) => a.year - b.year)
  if (items.some(i => i.value <= 0)) return null
  const cols = colonnes({
    items: items.map(i => ({ label: String(i.year), value: i.value, text: `+${nombre(i.cue.text)}`, shown: i.cue.shown })),
    x: 75,
    w: 150,
    y: 4,
    h: 140,
    colW: 50,
    t0: 300,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={4 + cols.h}>{cols.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 L'emploi industriel : 0,5 % de moins en un an, 1,7 % de plus que fin 2019, de part et d'autre de zéro */
const intro03: Board = p => {
  const [, down, up] = cuesOf(p)
  const vd = num(down?.text)
  const vu = num(up?.text)
  const since = word(p, /fin \d{4}/)
  if (!down || !up || !vd || !vu) return null
  const zero = 96
  const k = 36
  const cw = 56
  const xa = 62
  const xb = 182
  const hd = vd * k
  const hu = vu * k
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={176}>
        <Ink d={`M28 ${zero}H280`} t0={0} dur={600} class="vc-soft" />
        <Txt x={20} y={zero + 5} text="0" size={14} anchor="end" tone="soft" t0={200} />
        {down.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint-count" x={xa} y={zero} width={cw} height={hd} />
            </Fade>
            <Ink d={`M${xa} ${zero}V${zero + hd}H${xa + cw}V${zero}`} t0={0} dur={500} class="vc-count" />
            <Txt x={xa + cw / 2} y={zero + hd + 24} text={`−${down.text}`} size={18} big tone="count" t0={300} />
          </>
        ) : null}
        <Txt x={xa + cw / 2} y={170} text="sur un an" size={14} tone="soft" t0={300} />
        {up.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint-count" x={xb} y={zero - hu} width={cw} height={hu} />
            </Fade>
            <Ink d={`M${xb} ${zero}V${zero - hu}H${xb + cw}V${zero}`} t0={0} dur={500} class="vc-count" />
            <Txt x={xb + cw / 2} y={zero - hu - 9} text={`+${up.text}`} size={18} big tone="count" t0={300} />
          </>
        ) : null}
        {since ? <Txt x={xb + cw / 2} y={170} text={`depuis ${since.text}`} size={14} tone="soft" t0={500} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le déficit commercial : exportations et importations à la même échelle, l'écart marqué */
const intro04: Board = p => {
  const gap = cueOf(p, 1)
  const exp = num(/exportations[\s\u00a0]*:[\s\u00a0]*([\d\s\u202f,]+)/.exec(p.segment.figure?.label ?? '')?.[1])
  if (!gap || !exp) return null
  const art = echanges(exp, null, gap)
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 05 Subventions, crédits d'impôt, baisses de cotisations : trois formes d'aide, chacune quand la voix la dit */
const intro05: Board = p => {
  const items: [RegExp, PictoName, number][] = [
    [/des subventions/, 'pieces', 50],
    [/des crédits d’impôt|des crédits d'impôt/, 'document', 150],
    [/des baisses de cotisations/, 'baisse', 250],
  ]
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={110}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? <Signe key={n} n={n} cx={cx} y={2} size={52} label={w.text.replace(/^des[\s\u00a0]+/, '')} max={13} t0={i * 100} /> : null
        })}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 À l'échelle de l'Union européenne : les accords commerciaux, les règles sur les aides publiques */
const intro06: Board = p => {
  const ue = cueOf(p, 0)
  const acc = word(p, /accords commerciaux/)
  const reg = word(p, /règles sur les aides publiques/)
  return (
    <Seg>
      <Head lines={[lineOf(ue)]} />
      <Art h={186}>
        <Picto n="monument" x={116} y={0} size={68} t0={100} />
        {acc?.shown ? (
          <>
            <Arrow x1={124} y1={74} x2={88} y2={96} t0={0} />
            <Picto n="document" x={42} y={96} size={52} t0={200} />
            <Txt x={68} y={166} text={acc.text} max={14} size={15} t0={400} />
          </>
        ) : null}
        {reg?.shown ? (
          <>
            <Arrow x1={176} y1={74} x2={212} y2={96} t0={0} />
            <Picto n="document" x={206} y={96} size={52} t0={200} />
            <Txt x={232} y={166} text={reg.text} max={16} size={15} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Les trois questions du thème, chacune avec son pictogramme, quand la voix la pose */
const intro07: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  const pictos: PictoName[] = ['grue', 'carte_france', 'pieces']
  if (qs.length < 2) return null
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

/** 08 Les sujets des vidéos qui suivent : le sommaire de la série, chaque vidéo avec son pictogramme */
const intro08: Board = p => {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  const t0 = 200
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyphe2 n={CHAPITRES[v.id] ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— L'État actionnaire ——— */

/** 01 Un actionnaire particulier, l'État : un bâtiment à colonnes relié à une entreprise ; la question */
const etat01: Board = p => {
  const [part, etat] = cuesOf(p)
  const ground = 140
  return (
    <Seg>
      <Head lines={[lineOf(part)]} />
      <Art h={148}>
        <Ink d={`M8 ${ground}H292`} t0={0} dur={600} class="vc-soft" />
        <Picto n="monument" x={10} y={surSol(ground, 88)} size={88} t0={150} tone={etat?.shown ? 'count' : undefined} />
        {etat?.shown ? <Txt x={54} y={52} text={etat.text} size={16} tone="count" /> : null}
        <Picto n="immeuble" x={182} y={surSol(ground, 110, 45)} size={110} t0={500} />
        <Fade t0={1200} class="vc-dash">
          <path d="M104 104H186" />
        </Fade>
        <Ask x={132} y={52} h={40} t0={1600} />
      </Art>
    </Seg>
  )
}

/** 02 86 entités, 209,1 milliards : une grille de cases, une par entité */
const etat02: Board = p => {
  const cue = cueOf(p, 0)
  const n = num(cue?.text)
  if (!cue || !n || n > 200) return null
  const cols = 22
  const size = 10
  const gap = 3
  const x = (W - (cols * (size + gap) - gap)) / 2
  const h = casesH(n, cols, size, gap)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 34}>
        <Cases n={n} cols={cols} x={x} y={2} size={size} gap={gap} count={cue.shown ? range(n) : []} t0={300} stagger={8} solid />
        {cue.shown ? <Txt x={W / 2} y={h + 28} text={cue.text} size={16} tone="count" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Un an plus tôt, 179,5 milliards ; au 30 juin 2025, 209,1, dont 67,9 en sociétés cotées (bleu bille) */
const etat03: Board = p => {
  const [cot, before] = cuesOf(p)
  const vc = num(cot?.text)
  const vb = num(before?.text)
  const nowText = said(p, new RegExp(`209,1${SP}milliards`))
  const vn = num(nowText)
  const date = said(p, new RegExp(`30${SP}juin \\d{4}`))
  const prev = word(p, /Un an plus tôt/)
  if (!cot || !before || !vc || !vb || !nowText || !vn || vc >= vn) return null
  const g = barres({
    items: [
      { label: prev ? lower(prev.text) : undefined, value: vb, text: nombre(before.text), shown: before.shown },
      { label: date ?? undefined, value: vn, text: nombre(nowText) },
    ],
    y: 30,
    size: 28,
    gap: 34,
    room: 64,
    t0: 200,
  })
  const b = g.geo[1]!
  const xc = b.x0 + vc * g.scale
  return (
    <Seg>
      <Art h={30 + g.h + 40}>
        <Txt x={0} y={12} text="en milliards d’euros" size={14} anchor="start" tone="soft" />
        {g.el}
        {cot.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={b.x0} y={b.top} width={xc - b.x0} height={b.bottom - b.top} />
              <path d={`M${b.x0} ${b.top}H${xc}V${b.bottom}H${b.x0}Z`} />
            </Fade>
            <Brace x1={b.x0} y1={b.bottom + 4} x2={xc} y2={b.bottom + 4} tone="count" t0={200} />
            <Txt x={b.x0 + 2} y={b.bottom + 30} text={cot.text} size={16} anchor="start" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Les règles européennes : l'aide qui fausse la concurrence bute contre une barrière ; un chemin pour les
 *  exceptions */
const etat04: Board = p => {
  const [regles, interdites, exceptions] = cuesOf(p)
  const ground = 112
  return (
    <Seg>
      <Head lines={[lineOf(regles)]} />
      <Art h={190}>
        <Ink d={`M8 ${ground}H292`} t0={0} dur={600} class="vc-soft" />
        <Picto n="pieces" x={8} y={ground - 46} size={46} t0={200} />
        <Arrow x1={60} y1={ground - 24} x2={116} y2={ground - 24} t0={600} />
        <Barriere x={180} y={ground} s={1.3} t0={800} tone={interdites?.shown ? 'count' : undefined} />
        <Picto n="mallette" x={228} y={ground - 56} size={60} t0={1000} />
        {regles?.shown ? <Picto n="document" x={136} y={0} size={44} t0={0} /> : null}
        {interdites?.shown ? <Txt x={150} y={ground + 22} text={interdites.text} size={15} tone="count" /> : null}
        {exceptions?.shown ? (
          <>
            <Fade class="vc-dash vc-soft">
              <path d={`M64 ${ground + 30}C110 ${ground + 60} 200 ${ground + 60} 250 ${ground + 30}M250 ${ground + 30}l-2.5 9.5M250 ${ground + 30}l-9 3.6`} />
            </Fade>
            <Txt x={156} y={ground + 74} text={exceptions.text} size={15} tone="soft" />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Une prise de participation peut compter comme une aide si l'État n'agit pas comme un investisseur privé qui
 *  recherche une rentabilité à long terme : l'État et l'investisseur devant la même entreprise, la courbe de rentabilité */
const etat05: Board = p => {
  const [priv, rent] = cuesOf(p)
  const etat = said(p, /l’État|l'État/)
  const ground = 150
  return (
    <Seg>
      <Art h={194}>
        <Ink d={`M8 ${ground}H292`} t0={0} dur={600} class="vc-soft" />
        <Picto n="immeuble" x={118} y={surSol(ground, 64, 45)} size={64} t0={100} />
        <Picto n="monument" x={14} y={surSol(ground, 60)} size={60} t0={300} />
        {etat ? <Txt x={44} y={ground + 22} text={etat} size={15} t0={500} /> : null}
        <Arrow x1={80} y1={ground - 24} x2={114} y2={ground - 24} t0={700} head={6} />
        <Qui cx={256} base={ground} size={56} t0={500} label={priv?.text} shown={!!priv?.shown} max={12} />
        <Arrow x1={224} y1={ground - 24} x2={188} y2={ground - 24} t0={900} head={6} />
        {rent?.shown ? (
          <>
            <Ink d="M24 80C100 76 200 56 276 14" t0={0} dur={900} class="vc-count" />
            <Ink d="M276 14l-9.6 1.4M276 14l-4.4 8.6" t0={850} dur={200} class="vc-count" />
            <Txt x={20} y={26} text={rent.text} size={15} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 « Quelle place pour l'État dans le capital des entreprises ? » */
const etat06: Board = p => finale(p, 'monument', 'immeuble')

/* ——— Le prix de l'électricité ——— */

/** 01 « Chaque entreprise paie son électricité. Combien, en France ? » : un compteur, un fil, des pièces */
const energie01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={124}>
      <Mien n="electrique" x={10} y={10} size={100} t0={100} />
      <Ink d="M96 62C130 62 134 86 160 86" t0={700} dur={500} class="vc-thin" />
      <Picto n="pieces" x={160} y={42} size={72} t0={1000} />
      <Ask x={250} y={20} h={56} t0={1500} />
    </Art>
  </Seg>
)

/** 02 26,88 centimes le kilowattheure : le compteur, un kilowattheure qui se change en pièce */
const energie02: Board = p => {
  const cue = cueOf(p, 0)
  const kwh = word(p, /le kilowattheure/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={122}>
        <Mien n="electrique" x={20} y={0} size={84} t0={200} />
        {kwh ? <Txt x={62} y={104} text={kwh.text} size={14} tone="soft" t0={600} /> : null}
        <Arrow x1={110} y1={48} x2={158} y2={48} t0={900} />
        <Picto n="piece" x={170} y={12} size={68} t0={1100} tone={cue?.shown ? 'count' : undefined} />
        {cue?.shown ? <Txt x={204} y={112} text={cue.text} size={18} big tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 2019 et 2025 : la France et la moyenne de l'Union européenne, quatre colonnes à la même échelle */
const energie03: Board = p => {
  const [fr19, ue19, ue25] = cuesOf(p)
  const fr25 = said(p, /26,88/)
  const y19 = yearsOf(p.segment.say)[0]
  const y25 = yearsOf(p.segment.figure?.date ?? '')[0]
  const fr = said(p, /France/)
  if (!fr19 || !ue19 || !ue25 || !fr25 || !y19 || !y25 || !fr) return null
  const cols = [
    { x: 30, v: num(fr19.text), text: nombre(fr19.text), shown: fr19.shown, fr: true },
    { x: 76, v: num(ue19.text), text: nombre(ue19.text), shown: ue19.shown, fr: false },
    { x: 182, v: num(fr25), text: nombre(fr25), shown: true, fr: true },
    { x: 228, v: num(ue25.text), text: nombre(ue25.text), shown: ue25.shown, fr: false },
  ]
  if (cols.some(c => !c.v)) return null
  const top = Math.max(...cols.map(c => c.v!))
  const base = 152
  const H = 108
  const cw = 40
  return (
    <Seg kind="fig">
      <Art h={198}>
        <Txt x={W / 2} y={14} text="centimes le kilowattheure" size={14} tone="soft" />
        <Ink d={`M14 ${base}H286`} t0={0} dur={600} class="vc-soft" />
        {cols.map((c, i) => {
          if (!c.shown) return null
          const ht = (c.v! / top) * H
          return (
            <g key={i}>
              {c.fr ? (
                <Fade t0={300 + i * 150}>
                  <rect class="vc-tint" x={c.x} y={base - ht} width={cw} height={ht} />
                </Fade>
              ) : null}
              <Ink d={`M${c.x} ${base}V${base - ht}H${c.x + cw}V${base}`} t0={100 + i * 150} dur={600} />
              <Txt x={c.x + cw / 2} y={base - ht - 8} text={c.text} size={16} big t0={400 + i * 150} />
              <Txt x={c.x + cw / 2} y={base + 18} text={c.fr ? fr : 'UE'} size={14} t0={300 + i * 150} />
            </g>
          )
        })}
        <Txt x={73} y={base + 42} text={String(y19)} size={15} tone="soft" t0={200} />
        <Txt x={225} y={base + 42} text={String(y25)} size={15} tone="soft" t0={200} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Un accès régulé à l'électricité nucléaire jusqu'au 31 décembre 2025 ; depuis, le marché ou ses propres
 *  centrales */
const energie04: Board = p => {
  const [reg, date, marche] = cuesOf(p)
  const own = word(p, /leurs propres centrales/)
  const y = 70
  const xf = 150
  return (
    <Seg>
      <Art h={190}>
        <Mien n="centrale" x={2} y={y - 44} size={46} t0={100} />
        <Ink d={`M52 ${y}H${xf}`} t0={400} dur={700} />
        {reg?.shown ? <Txt x={90} y={y - 10} text={reg.text} size={15} t0={100} /> : null}
        {date?.shown ? (
          <>
            <Picto n="drapeau" x={xf - 11} y={y - 44} size={44} tone="count" />
            <Txt x={xf - 6} y={y + 26} text={date.text} size={15} anchor="end" tone="count" t0={200} />
          </>
        ) : null}
        {marche?.shown ? (
          <>
            <Ink d={`M${xf} ${y}C${xf + 30} ${y} ${xf + 26} 36 ${xf + 58} 36`} t0={0} dur={500} class="vc-thin" />
            <Picto n="bourse" x={214} y={10} size={52} t0={300} />
            <Txt x={240} y={80} text={marche.text} size={14} t0={400} />
          </>
        ) : null}
        {own?.shown ? (
          <>
            <Ink d={`M${xf} ${y}C${xf + 30} ${y} ${xf + 26} 120 ${xf + 58} 120`} t0={0} dur={500} class="vc-thin" />
            <Mien n="centrale" x={216} y={98} size={48} t0={300} />
            <Txt x={240} y={164} text={own.text} max={14} size={14} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 05 Le versement nucléaire universel : au-delà d'un seuil de revenus, les factures baissent */
const energie05: Board = p => {
  const [vnu, seuils] = cuesOf(p)
  const rev = word(p, /revenus nucléaires/)
  const fact = word(p, /les factures/)
  const base = 150
  const top = 24
  const th = 76
  const x0 = 40
  const cw = 56
  return (
    <Seg>
      <Head lines={[lineOf(vnu)]} />
      <Art h={192}>
        <Ink d={`M14 ${base}H286`} t0={0} dur={500} class="vc-soft" />
        <Ink d={`M${x0} ${base}V${top}H${x0 + cw}V${base}`} t0={100} dur={800} />
        {rev?.shown ? <Txt x={x0 + cw / 2} y={base + 20} text={rev.text} max={12} size={14} /> : null}
        {seuils?.shown ? (
          <>
            <Fade class="vc-count">
              <rect class="vc-tint-count" x={x0} y={top} width={cw} height={th - top} />
            </Fade>
            <Fade class="vc-count vc-dash">
              <path d={`M${x0 - 14} ${th}H${x0 + cw + 24}`} />
            </Fade>
            <Txt x={x0 + cw + 28} y={th + 5} text={seuils.text} size={15} anchor="start" tone="count" />
            <Arrow x1={x0 + cw + 6} y1={top + 18} x2={196} y2={top + 18} t0={300} tone="count" />
          </>
        ) : null}
        <Picto n="document" x={196} y={22} size={86} tone="ghost" />
        {fact?.shown ? <Picto n="document" x={212} y={46} size={56} t0={200} /> : null}
        {fact ? <Txt x={238} y={base + 20} text={fact.text} size={14} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 « Quelle place pour le prix de l'énergie dans une stratégie industrielle ? » */
const energie06: Board = p => finale(p, 'electrique', 'usine')

/* ——— Le commerce avec le reste du monde ——— */

/** 01 « Votre téléphone, vos vêtements, votre voiture : où ont-ils été fabriqués ? » */
const commerce01: Board = p => {
  const items: [RegExp, MienName, number][] = [
    [/Votre téléphone/, 'telephone', 50],
    [/vos vêtements/, 'vetement', 150],
    [/votre voiture/, 'voiture', 250],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={110}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? (
            <g key={n}>
              <Mien n={n} x={cx - 34} y={0} size={68} t0={i * 80} />
              <Txt x={cx} y={94} text={w.text.replace(/^(votre|vos)[\s\u00a0]+/i, '')} size={15} t0={300} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** 02 Exportations, importations, le déficit : deux barres à la même échelle, l'écart marqué */
const commerce02: Board = p => {
  const [expCue, gap] = cuesOf(p)
  const exp = num(expCue?.text)
  if (!expCue || !gap || !exp) return null
  const art = echanges(exp, expCue, gap)
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 03 13,5 % des emplois : plus de 13 sur 100, comptés */
const commerce03: Board = p => {
  const cue = cuesOf(p)[1]
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n !== 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={r.k} high={r.more ? r.k + 1 : r.k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les voitures électriques importées de Chine : des droits de 7,8 à 35,3 %, sur une réglette de 0 à 40 % */
const commerce04: Board = p => {
  const [droits, taux] = cuesOf(p)
  const [lo, hi] = nums(taux?.text ?? '')
  if (!taux || lo === undefined || hi === undefined || hi > 40) return null
  const [tLo = '', tHi = ''] = taux.text.split(/[\s\u00a0]à[\s\u00a0]/)
  const xa = 140
  const xb = 290
  const X = (v: number) => xa + (v / 40) * (xb - xa)
  const axis = 100
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={126}>
        <Ink d="M0 104H124" t0={0} dur={500} class="vc-soft" />
        <Mien n="voiture" x={0} y={34} size={72} t0={200} />
        <Barriere x={118} y={104} s={0.95} t0={700} />
        {droits?.shown ? <Txt x={215} y={20} text={droits.text} max={16} size={15} t0={0} /> : null}
        <Ink d={`M${xa} ${axis}H${xb}`} t0={300} dur={600} class="vc-soft" />
        <Ink d={[0, 10, 20, 30, 40].map(v => `M${X(v)} ${axis - 4}v8`).join('')} t0={600} dur={300} class="vc-soft vc-thin" />
        <Txt x={xa} y={axis + 22} text="0" size={14} tone="soft" t0={700} />
        <Txt x={xb} y={axis + 22} text={'40\u00a0%'} size={14} anchor="end" tone="soft" t0={700} />
        {taux.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={X(lo)} y={axis - 22} width={X(hi) - X(lo)} height={18} />
              <path d={`M${X(lo)} ${axis - 22}H${X(hi)}V${axis - 4}H${X(lo)}Z`} />
            </Fade>
            <Txt x={X(lo)} y={axis - 30} text={tLo} size={16} big tone="count" t0={200} />
            <Txt x={Math.min(X(hi), xb - 22)} y={axis - 30} text={tHi} size={16} big tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** La ligne du temps des passages sur l'accord avec le Mercosur : janvier à juin 2026, un repère par mois ;
 *  « debut » : ce qu'on écrit sous son début (« janvier », ou la date dite) */
function mois(kept: boolean, t0 = 0, debut?: Cue | null) {
  const f = frise({ y: 164, from: 0, to: 5, x0: 24, x1: 276, ticks: range(6), t0, kept })
  return {
    X: f.X,
    el: (
      <>
        {f.el}
        {debut ? (
          debut.shown ? <Txt x={14} y={188} text={debut.text} size={15} anchor="start" tone="count" t0={200} /> : null
        ) : (
          <Txt x={24} y={188} text="janvier" size={14} tone="soft" kept={kept} t0={t0 + 300} />
        )}
        <Txt x={276} y={188} text="juin" size={14} tone="soft" kept={kept} t0={t0 + 300} />
      </>
    ),
  }
}

/** 05 L'accord avec le Mercosur, appliqué à titre provisoire depuis le 1er mai 2026 */
const commerce05: Board = p => {
  const [merc, prov] = cuesOf(p)
  const ue = said(p, /Union européenne/)
  const d = word(p, new RegExp(`1er${SP}mai \\d{4}`))
  const f = mois(false, 600)
  const xm = f.X(4)
  return (
    <Seg>
      <Art h={194}>
        <Picto n="monument" x={8} y={4} size={60} t0={100} />
        {ue ? <Txt x={38} y={80} text={ue} max={10} size={14} t0={300} /> : null}
        <Picto n="monument" x={232} y={4} size={60} t0={300} />
        {merc?.shown ? <Txt x={262} y={80} text={merc.text} size={14} t0={0} /> : null}
        <Ink d="M72 38H116M184 38H228" t0={500} dur={400} class="vc-thin vc-soft" />
        <Picto n="document" x={122} y={6} size={56} t0={700} tone={prov?.shown ? 'count' : undefined} />
        {prov?.shown ? <Txt x={150} y={80} text={prov.text} size={14} tone="count" t0={0} /> : null}
        {f.el}
        {d?.shown ? (
          <>
            <Picto n="drapeau" x={xm - 11} y={164 - 43} size={46} tone="count" />
            <Txt x={xm - 8} y={140} text={d.text} size={15} anchor="end" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Le 21 janvier 2026, la Cour de justice de l'Union saisie ; au 27 avril, la ratification suspendue */
const commerce06: Board = p => {
  const [cour, susp] = cuesOf(p)
  const d1 = word(p, new RegExp(`21${SP}janvier \\d{4}`))
  const d2 = said(p, new RegExp(`1er${SP}mai \\d{4}`))
  const f = mois(true, 0, d1)
  const xj = f.X(20 / 31)
  const xm = f.X(4)
  return (
    <Seg>
      <Art h={194}>
        <Picto n="monument" x={8} y={4} size={60} t0={100} tone={cour?.shown ? 'count' : undefined} />
        {cour?.shown ? <Txt x={38} y={80} text={cour.text} max={10} size={14} tone="count" t0={0} /> : null}
        {cour?.shown ? <Arrow x1={74} y1={36} x2={160} y2={36} dash t0={300} /> : null}
        <Picto n="document" x={168} y={6} size={56} kept />
        {susp?.shown ? (
          <>
            <Pause x={214} y={52} r={15} t0={0} />
            <Txt x={196} y={88} text={susp.text} size={14} t0={300} />
          </>
        ) : null}
        {f.el}
        {d2 ? (
          <>
            <Picto n="drapeau" x={xm - 11} y={164 - 43} size={46} tone="soft" kept />
            <Txt x={xm + 20} y={114} text={d2} size={14} anchor="end" tone="soft" kept />
          </>
        ) : null}
        {d1?.shown ? <Picto n="drapeau" x={xj - 11} y={164 - 43} size={46} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 07 D'un côté, la France importe plus de biens qu'elle n'en exporte ; de l'autre, des emplois dépendent des
 *  exportations : une balance, fléau à l'horizontale */
const commerce07: Board = p => {
  const [imp, exp] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Mien n="conteneur" x={cx - 30} y={base - 46} size={60} t0={900} />
        <Mien n="conteneur" x={cx - 30} y={base - 73} size={60} t0={1100} />
      </>
    ),
    right: (cx, base) => (
      <>
        <Qui cx={cx - 18} base={base} size={36} t0={1200} />
        <Mien n="conteneur" x={cx + 2} y={base - 37} size={40} t0={1400} />
      </>
    ),
    labels: [imp?.text ?? null, exp?.text ?? null],
    shown: [!!imp?.shown, !!exp?.shown],
    t0: 100,
  })
  return (
    <Seg>
      <Art h={bal.h}>{bal.el}</Art>
    </Seg>
  )
}

/** 08 « Comment protéger la production face à la concurrence internationale ? » */
const commerce08: Board = p => finale(p, 'usine', 'conteneur')

/* ——— Les achats publics ——— */

/** 01 Une cantine, un hôpital, une route : trois pictogrammes, puis la question */
const achats01: Board = p => {
  const items: [RegExp, AnyName, number][] = [
    [/Une cantine/, 'assiette', 50],
    [/un hôpital/, 'soin', 150],
    [/une route/, 'route', 250],
  ]
  return (
    <Seg>
      <Art h={96}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? (
            <g key={n}>
              <Any n={n} x={cx - 28} y={0} size={56} t0={i * 80} />
              <Txt x={cx} y={84} text={lower(w.text)} size={15} t0={300} />
            </g>
          ) : null
        })}
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/** 02 170,7 milliards, 6 % du PIB : le disque de la richesse produite en un an, et la part des marchés publics */
const achats02: Board = p => {
  const [md, pct] = cuesOf(p)
  const part = (num(pct?.text) ?? 0) / 100
  if (!part) return null
  const richesse = word(p, /la richesse produite en un an/)
  const total = md ? said(p, new RegExp(`${md.text.replace(/[\s\u00a0]+/g, SP)}[^.,]*`)) : null
  const tip = partPoint(84, 84, 56, part)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Disque cx={84} cy={84} r={78} part={part} shown={!!pct?.shown} t0={300} />
        {said(p, /PIB/) ? <Txt x={84} y={112} text="PIB" size={24} big t0={900} /> : null}
        {total && md?.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L176 34`} t0={300} dur={400} class="vc-count vc-thin" />
            <Txt x={180} y={30} text={total} max={13} size={16} anchor="start" tone="count" t0={500} />
          </>
        ) : null}
        {richesse?.shown ? <Txt x={174} y={108} text={richesse.text} max={18} size={14} anchor="start" tone="soft" /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Tous contrats compris, près de 400 milliards : deux barres à la même échelle */
const achats03: Board = p => {
  const cue = cueOf(p, 0)
  const vAll = num(cue?.text)
  const partText = said(p, new RegExp(`170,7${SP}milliards`))
  const vPart = num(partText)
  const lPart = said(p, new RegExp(`marchés publics d’au moins 90${SP}000${SP}euros`))
  const lAll = word(p, /Tous contrats compris/)
  if (!cue || !vAll || !partText || !vPart || vPart >= vAll) return null
  const g = barres({
    items: [
      { label: lPart ?? undefined, value: vPart, text: nombre(partText) },
      { label: lAll ? lower(lAll.text) : undefined, value: vAll, text: cue.text.replace(/[\s\u00a0]+milliards.*$/, ''), shown: cue.shown, tone: 'count' },
    ],
    y: 30,
    size: 26,
    gap: 32,
    room: 112,
    t0: 200,
    labelSize: 14,
  })
  return (
    <Seg>
      <Art h={30 + g.h + 8}>
        <Txt x={0} y={12} text="en milliards d’euros" size={14} anchor="start" tone="soft" />
        {g.el}
      </Art>
    </Seg>
  )
}

/** 04 Le droit européen interdit de réserver un marché aux entreprises françaises ou locales : une barrière
 *  entre la carte et le marché */
const achats04: Board = p => {
  const cue = cueOf(p, 0)
  const loc = word(p, /entreprises françaises ou locales/)
  const S = 100 / 48
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={172}>
        <Picto n="carte_france" x={4} y={6} size={100} t0={100} />
        <Picto n="epingle" x={4 + 25 * S - 13} y={6 + 25 * S - 26} size={26} tone="count" t0={600} w={0.9} />
        {loc ? <Txt x={54} y={134} text={loc.text} max={16} size={14} t0={700} /> : null}
        <Picto n="document" x={204} y={18} size={88} t0={300} />
        {cue?.shown ? <Barriere x={188} y={106} s={1.2} t0={0} tone="count" /> : null}
      </Art>
    </Seg>
  )
}

/** 05 Écarter les entreprises de pays sans accord avec l'Union ; fixer des exigences environnementales et sociales */
const achats05: Board = p => {
  const [sans, exig] = cuesOf(p)
  const env = word(p, /environnementales/)
  const soc = word(p, /sociales/)
  return (
    <Seg>
      <Art h={176}>
        <Picto n="document" x={170} y={0} size={76} t0={100} />
        {sans?.shown ? (
          <>
            <Picto n="document" x={22} y={8} size={60} tone="ghost" />
            <Arrow x1={170} y1={40} x2={92} y2={40} dash t0={100} />
            <Txt x={52} y={90} text={sans.text} max={14} size={14} t0={300} />
          </>
        ) : null}
        {exig?.shown ? (
          <>
            <Picto n="arbre" x={2} y={124} size={42} t0={0} tone="count" />
            {env ? <Txt x={48} y={152} text={env.text} size={15} anchor="start" t0={200} /> : null}
            <Picto n="personne" x={190} y={126} size={40} t0={400} tone="count" />
            {soc ? <Txt x={234} y={152} text={soc.text} size={15} anchor="start" t0={600} /> : null}
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 La proposition de la Commission européenne : des produits « fabriqués dans l'UE » ou bas carbone */
const achats06: Board = p => {
  const [ue, bas] = cuesOf(p)
  const prop = word(p, /une proposition/)
  const tag = /UE/.exec(ue?.text ?? '')?.[0]
  return (
    <Seg>
      <Head lines={[ue ? { text: `«\u00a0${ue.text}\u00a0»`, shown: ue.shown, mark: ue } : null]} />
      <Art h={140}>
        <Picto n="monument" x={4} y={30} size={70} t0={100} />
        <Arrow x1={80} y1={64} x2={112} y2={64} t0={600} />
        <Picto n="document" x={110} y={14} size={90} tone="ghost" />
        {prop?.shown ? <Txt x={152} y={130} text={prop.text} size={14} tone="soft" /> : null}
        {ue?.shown && tag ? <Picto n="etiquette" x={218} y={8} size={64} text={tag} tone="count" t0={0} /> : null}
        {bas?.shown ? <Txt x={250} y={100} text={bas.text} size={15} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 Le texte doit être négocié par le Parlement européen et le Conseil de l'Union avant d'entrer en vigueur */
const achats07: Board = p => {
  const pe = word(p, /Parlement européen/)
  const co = word(p, /Conseil de l’Union|Conseil de l'Union/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={146}>
        <Picto n="document" x={118} y={10} size={64} tone="ghost" />
        <Picto n="monument" x={4} y={14} size={70} t0={100} />
        <Picto n="monument" x={226} y={14} size={70} t0={300} />
        {pe?.shown ? (
          <>
            <Arrow x1={78} y1={50} x2={118} y2={50} t0={0} />
            <Txt x={39} y={110} text={pe.text} max={10} size={14} t0={200} />
          </>
        ) : null}
        {co?.shown ? (
          <>
            <Arrow x1={222} y1={50} x2={182} y2={50} t0={0} />
            <Txt x={261} y={110} text={co.text} max={10} size={14} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 08 « Quelle place donner à l'origine des produits dans les achats publics ? » : le marché, une étiquette vierge */
const achats08: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Picto n="document" x={10} y={14} size={84} t0={100} />
      <Ink d="M86 40C110 40 116 50 132 54" t0={800} dur={300} class="vc-thin" />
      <Picto n="etiquette" x={128} y={26} size={64} t0={900} />
      <Ask x={232} y={20} h={64} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Les aides publiques aux entreprises ——— */

/** 01 Subventions, crédits d'impôt, baisses de cotisations, vers les entreprises : combien, au total ? */
const aides01: Board = p => {
  const items: [RegExp, PictoName, number][] = [
    [/Subventions/, 'pieces', 50],
    [/crédits d’impôt|crédits d'impôt/, 'document', 150],
    [/baisses de cotisations/, 'baisse', 250],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={182}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w?.shown ? (
            <g key={n}>
              <Picto n={n} x={cx - 24} y={0} size={48} t0={i * 80} />
              <Txt x={cx} y={66} text={lower(w.text)} max={12} size={14} t0={200} />
              <Arrow x1={cx + (150 - cx) * 0.1} y1={100} x2={150 + (cx - 150) * 0.22} y2={126} t0={400} head={6} />
            </g>
          ) : null
        })}
        <Picto n="mallette" x={122} y={124} size={56} t0={300} />
      </Art>
    </Seg>
  )
}

/** 02 Selon le ministre de l'Économie, 150 milliards, dont 80 d'allègements de cotisations sociales */
const aides02: Board = p => {
  const [dep, tot] = cuesOf(p)
  const vt = num(tot?.text)
  const part = word(p, /dont \d+ d’allègements de cotisations sociales|dont \d+ d'allègements de cotisations sociales/)
  const vp = num(part?.text)
  const who = word(p, /le ministre de l’Économie|le ministre de l'Économie/)
  if (!tot || !vt || !part || !vp || vp >= vt) return null
  const x0 = 10
  const x1 = 290
  const s = (x1 - x0) / vt
  const y = 60
  const hB = 34
  const xp = x0 + vp * s
  return (
    <Seg>
      <Head lines={[lineOf(dep)]} />
      <Art h={150}>
        {who?.shown ? <Txt x={x0} y={18} text={who.text} size={14} anchor="start" tone="soft" /> : null}
        {tot.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint" x={x0} y={y} width={x1 - x0} height={hB} />
            </Fade>
            <Ink d={`M${x0} ${y}H${x1}V${y + hB}H${x0}Z`} t0={0} dur={700} />
            <Txt x={x1} y={y - 10} text={tot.text} size={20} big anchor="end" t0={300} />
          </>
        ) : null}
        {part.shown ? (
          <>
            <Fade t0={0} class="vc-count">
              <rect class="vc-tint-count" x={x0} y={y} width={xp - x0} height={hB} />
              <path d={`M${x0} ${y}H${xp}V${y + hB}H${x0}Z`} />
            </Fade>
            <Brace x1={x0} y1={y + hB + 4} x2={xp} y2={y + hB + 4} tone="count" t0={200} />
            <Txt x={(x0 + xp) / 2} y={y + hB + 32} text={part.text.replace(/^dont[\s\u00a0]+/, '')} max={22} size={14} tone="count" t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 03 Trois estimations à la même échelle : 108 au sens strict, 150 selon le ministre, 211 selon la commission */
const aides03: Board = p => {
  const [big, strict] = cuesOf(p)
  const vb = num(big?.text)
  const vs = num(strict?.text)
  const minText = said(p, new RegExp(`150${SP}milliards`))
  const vm = num(minText)
  const lStrict = word(p, /au sens strict/)
  const lMin = said(p, /le ministre de l’Économie|le ministre de l'Économie/)
  const lCom = word(p, /La commission d’enquête du Sénat|La commission d'enquête du Sénat/)
  if (!big || !strict || !vb || !vs || !minText || !vm) return null
  const g = barres({
    items: [
      { label: lStrict?.text, value: vs, text: nombre(strict.text), shown: strict.shown },
      { label: lMin ?? undefined, value: vm, text: nombre(minText) },
      { label: lCom ? lower(lCom.text) : undefined, value: vb, text: nombre(big.text), shown: big.shown },
    ],
    y: 26,
    size: 22,
    gap: 28,
    room: 52,
    t0: 200,
    labelSize: 14,
  })
  return (
    <Seg kind="fig">
      <Art h={26 + g.h + 6}>
        <Txt x={0} y={12} text="en milliards d’euros" size={14} anchor="start" tone="soft" />
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les allègements généraux : 20,9 milliards en 2014, 77,3 en 2024 ; le changement de 2019 marqué entre les deux */
const aides04: Board = p => {
  const [now, then, partie] = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const vn = num(now?.text)
  const vt = num(then?.text)
  const [yNow, yThen, yMark] = years
  if (!now || !then || !vn || !vt || !yNow || !yThen || !yMark || yNow <= yThen) return null
  const x = 50
  const w = 210
  const colW = 46
  const cols = colonnes({
    items: [
      { label: String(yThen), value: vt, text: nombre(then.text), shown: then.shown },
      { label: String(yNow), value: vn, text: nombre(now.text), shown: now.shown },
    ],
    x,
    w,
    y: 0,
    h: 140,
    colW,
    t0: 200,
  })
  const xm = x + colW / 2 + ((yMark - yThen) / (yNow - yThen)) * (w - colW)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h + 4}>
        {cols.el}
        {partie?.shown ? (
          <>
            <Fade t0={0} class="vc-dash vc-count">
              <path d={`M${xm} 140V46`} />
            </Fade>
            <Txt x={xm} y={38} text={String(yMark)} size={15} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'effet sur l'emploi : positif au niveau du Smic selon les évaluations, plus incertain selon les études
 *  récentes ; deux colonnes de même taille */
const aides05: Board = p => {
  const [pos, inc] = cuesOf(p)
  const ev = word(p, /les évaluations/)
  const et = word(p, /Les études récentes/)
  return (
    <Seg>
      <Art h={176}>
        <Ink d="M150 6V170" t0={0} dur={500} class="vc-soft vc-thin" />
        {ev ? <Txt x={75} y={18} text={ev.text} size={15} tone="soft" t0={200} /> : null}
        {et ? <Txt x={225} y={18} text={lower(et.text)} size={15} tone="soft" t0={400} /> : null}
        <Picto n="mallette" x={36} y={42} size={64} t0={200} />
        <Picto n="mallette" x={186} y={42} size={64} t0={400} />
        {pos?.shown ? (
          <>
            <Picto n="hausse" x={100} y={40} size={36} tone="count" w={1.2} t0={0} />
            <Txt x={75} y={136} text={pos.text} max={14} size={15} t0={200} />
          </>
        ) : null}
        {inc?.shown ? (
          <>
            <Ask x={254} y={36} h={40} tone="count" t0={0} />
            <Txt x={225} y={136} text={inc.text} max={14} size={15} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Un million d'emplois détruits si tous les allègements étaient supprimés, selon une simulation ; des effets « jugés marginaux »
 *  pour les salaires intermédiaires : deux cadres de même taille */
const aides06: Board = p => {
  const [million, marg] = cuesOf(p)
  const all = word(p, /si ces allègements étaient tous supprimés/)
  const mid = word(p, /les salaires intermédiaires/)
  return (
    <Seg>
      <Art h={192}>
        <Fade t0={0} class="vc-soft vc-thin">
          <path d="M4 4H146V188H4ZM154 4H296V188H154Z" />
        </Fade>
        <Rang n={6} picto="personne" cols={3} x={14} w={122} y={16} max={30} gap={10} ghost={million?.shown ? range(6) : []} t0={200} />
        {million?.shown ? <Txt x={75} y={124} text={million.text} size={22} big tone="count" t0={200} /> : null}
        {all?.shown ? <Txt x={75} y={148} text={all.text} max={19} size={14} t0={0} /> : null}
        <Picto n="mallette" x={195} y={22} size={60} t0={300} />
        {marg?.shown ? (
          <>
            <Ink d="M182 98H268M182 91v14M268 91v14" t0={0} dur={600} class="vc-count" />
            <Txt x={225} y={124} text={marg.text} size={18} big tone="count" t0={200} />
          </>
        ) : null}
        {mid?.shown ? <Txt x={225} y={148} text={mid.text} max={17} size={14} t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** Les éléments d'une liste dite après « : », séparés par des virgules seulement (un élément peut contenir « et » :
 *  « maintenir l'emploi pendant le projet et cinq ans après ») */
const listeApres = (say: string) => {
  const i = say.search(/[\u00a0 ]:/)
  if (i < 0) return []
  return say
    .slice(i + 2)
    .replace(/[.!?…]+$/, '')
    .trim()
    .split(/,\s+/)
    .filter(Boolean)
}

/** 07 Des contreparties, selon les cas : ne pas délocaliser, ne pas verser de dividendes, maintenir l'emploi */
const aides07: Board = p => {
  const list = listeApres(p.segment.say).slice(0, 3)
  const pictos: PictoName[] = ['epingle', 'cadenas', 'mallette']
  if (list.length < 2) return null
  const row = 58
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={list.length * row - 8}>
        {list.map((l, i) =>
          heard(p, l) ? (
            <g key={l}>
              <Picto n={pictos[i] ?? 'document'} x={4} y={i * row} size={44} t0={0} />
              <Txt x={60} y={i * row + 20} text={l} max={28} size={15} anchor="start" t0={200} />
            </g>
          ) : null,
        )}
      </Art>
    </Seg>
  )
}

/** 08 Le déficit public : 5,8 % du PIB en 2024, 5,1 % en 2025, deux colonnes à la même échelle */
const aides08: Board = p => {
  const pct = cueOf(p, 1)
  const before = word(p, new RegExp(`\\d+,\\d+${SP}%${SP}en \\d{4}`))
  const vNow = num(pct?.text)
  const vBefore = num(before?.text)
  const years = yearsOf(p.segment.say)
  const pctBefore = before ? new RegExp(`\\d+,\\d+${SP}%`).exec(before.text)?.[0] : undefined
  if (!pct || !before || !vNow || !vBefore || !pctBefore || years.length < 2) return null
  const cols = colonnes({
    items: [
      { label: String(years[1]), value: vBefore, text: pctBefore, shown: before.shown },
      { label: String(years[0]), value: vNow, text: pct.text, shown: pct.shown },
    ],
    x: 75,
    w: 150,
    y: 4,
    h: 120,
    colW: 50,
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

/** 09 « Combien d'aides, pour quelles entreprises, et avec quelles contreparties ? » */
const aides09: Board = p => finale(p, 'pieces', 'mallette')

/* ——— Le registre ——— */

export const INDUSTRIE_ECONOMIE: Record<string, Board> = {
  'industrie-intro-01': intro01,
  'industrie-intro-02': intro02,
  'industrie-intro-03': intro03,
  'industrie-intro-04': intro04,
  'industrie-intro-05': intro05,
  'industrie-intro-06': intro06,
  'industrie-intro-07': intro07,
  'industrie-intro-08': intro08,
  'industrie-etat-01': etat01,
  'industrie-etat-02': etat02,
  'industrie-etat-03': etat03,
  'industrie-etat-04': etat04,
  'industrie-etat-05': etat05,
  'industrie-etat-06': etat06,
  'industrie-energie-01': energie01,
  'industrie-energie-02': energie02,
  'industrie-energie-03': energie03,
  'industrie-energie-04': energie04,
  'industrie-energie-05': energie05,
  'industrie-energie-06': energie06,
  'industrie-commerce-01': commerce01,
  'industrie-commerce-02': commerce02,
  'industrie-commerce-03': commerce03,
  'industrie-commerce-04': commerce04,
  'industrie-commerce-05': commerce05,
  'industrie-commerce-06': commerce06,
  'industrie-commerce-07': commerce07,
  'industrie-commerce-08': commerce08,
  'industrie-achats-01': achats01,
  'industrie-achats-02': achats02,
  'industrie-achats-03': achats03,
  'industrie-achats-04': achats04,
  'industrie-achats-05': achats05,
  'industrie-achats-06': achats06,
  'industrie-achats-07': achats07,
  'industrie-achats-08': achats08,
  'industrie-aides-01': aides01,
  'industrie-aides-02': aides02,
  'industrie-aides-03': aides03,
  'industrie-aides-04': aides04,
  'industrie-aides-05': aides05,
  'industrie-aides-06': aides06,
  'industrie-aides-07': aides07,
  'industrie-aides-08': aides08,
  'industrie-aides-09': aides09,
}
