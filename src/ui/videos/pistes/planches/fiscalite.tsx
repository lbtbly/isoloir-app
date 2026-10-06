// Piste C, les planches de la série « Impôts et budget » (src/ui/videos/series/fiscalite.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Mêmes
// règles que les séries « Retraites » et « Logement » : les mots et les nombres viennent du script (mots mis en
// valeur, phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus rend null, et
// le passage prend le dessin générique de sa sorte d'image. Quelques étiquettes courtes et neutres sont écrites
// ici quand le passage ne les dit pas (« dette », « dépenses », « prélèvements », « en part du PIB ») : elles
// nomment ce qui est dessiné, et l'« alt » du passage les reprend.

import type { JSX } from 'preact'
import { chartOf } from '../../model'
import { FISCALITE as SERIE } from '../../series/fiscalite'
import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, at, cueOf, cuesOf, heard, num, plain, said, sentencesOf, word, yearsOf, type Cue, type P } from '../dessin/encre'
import { Chiffre, Head, HeadCues, Panel, Question, Seg, Signature, Src, Sur100, lineOf, listAfterColon } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Cases, Cent, Disque, balance, barres, colonnes, effets, type Effet } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/* ——— Communs à la série ——— */

/** Un nombre d'un graphique de fiche, écrit à la française (548.8 → « 548,8 », 1714.2 → « 1 714,2 ») */
function fr(n: number): string {
  const [i, d] = String(n).split('.')
  const int = (i ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')
  return d ? `${int},${d}` : int
}

/** Une expression dite dans la vidéo (ce passage d'abord), et ses groupes, lus sur le texte aux espaces simples */
function grab(p: P, re: RegExp): RegExpExecArray | null {
  const text = said(p, re)
  return text ? re.exec(plain(text)) : null
}

/** Le premier mot en minuscule (« Sans elles » → « sans elles ») */
const low = (s: string | null | undefined) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : null)

/** Le pictogramme de chaque approfondissement, pour les questions de l'introduction et son sommaire */
const CHAPITRES: Record<string, PictoName> = {
  'impots-dette': 'pieces',
  'impots-fortune': 'immeuble',
  'impots-heritages': 'cle',
  'impots-capital': 'bourse',
  'impots-recettes': 'cible',
}

/** Le pictogramme d'une question de l'introduction, d'après ses mots */
const pictoQuestion = (q: string): PictoName =>
  /dette/.test(q) ? 'pieces' : /fortune/.test(q) ? 'immeuble' : /héritage/.test(q) ? 'cle' : /capital|bénéfice/.test(q) ? 'bourse' : /recette/.test(q) ? 'cible' : 'document'

/** Cent petits carrés en dix rangées, dont les « k » derniers comptés (bleu bille) quand « shown » */
function Grille({ x, y, k, shown, t0 = 0 }: { x: number; y: number; k: number; shown: boolean; t0?: number }) {
  const sq = (i: number) => `M${x + (i % 10) * 13} ${y + Math.floor(i / 10) * 13}h9v9h-9z`
  const plainD = range(shown ? 100 - k : 100).map(sq).join('')
  const countD = range(k).map(i => sq(100 - k + i)).join('')
  return (
    <>
      <Ink d={plainD} t0={t0} dur={800} class="vc-thin" />
      {shown && k > 0 ? (
        <Fade t0={t0 + 700} class="vc-count">
          <path class="vc-solid-count" d={countD} />
        </Fade>
      ) : null}
    </>
  )
}

/** Le côté d'une grille de cent carrés (Grille) */
const GRILLE = 9 * 13 + 9

/** Un cercle au trait, de centre (cx, cy) */
const rond = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`

/** Un signe égal au trait ; (cx, cy) : son centre */
const Egal = ({ cx, cy, t0 = 0 }: { cx: number; cy: number; t0?: number }) => (
  <Ink d={`M${cx - 9} ${cy - 4}h18M${cx - 9} ${cy + 4}h18`} t0={t0} dur={300} class="vc-bold" />
)

/** Une caisse au trait (une branche, un budget) : un bac et sa fente ; (x, y) : coin haut gauche */
const Caisse = ({ x, y, w, h, t0 = 0, tone, kept }: { x: number; y: number; w: number; h: number; t0?: number; tone?: 'count' | 'ghost'; kept?: boolean }) => {
  const d = `M${x} ${y}H${x + w}V${y + h}H${x}Z`
  const slot = `M${x + w * 0.3} ${y + 9}h${w * 0.4}`
  if (tone === 'ghost')
    return (
      <Fade t0={t0} class="vc-ghost">
        <path d={d + slot} />
      </Fade>
    )
  return (
    <g class={tone === 'count' ? 'vc-count' : undefined}>
      {tone === 'count' ? (
        <Fade t0={t0 + 300}>
          <path class="vc-tint-count" d={d} />
        </Fade>
      ) : null}
      <Ink d={d} t0={t0} dur={600} kept={kept} />
      <Ink d={slot} t0={t0 + 400} dur={200} kept={kept} class="vc-thin" />
    </g>
  )
}

/** Un montant et son pictogramme, sans échelle commune avec son voisin : le nombre en gros, l'unité, la légende */
function Fiche({ cx, picto, cue, label, sub, t0 = 0 }: { cx: number; picto: PictoName; cue: Cue; label: string | null; sub?: string | null; t0?: number }) {
  const m = /^(.*\d)[\s\u00a0\u202f]+(\D+)$/.exec(cue.text)
  const [n, unit] = m ? [m[1]!, m[2]!] : [cue.text, '']
  return (
    <g>
      <Picto n={picto} x={cx - 30} y={0} size={60} t0={t0} tone={cue.shown ? 'count' : undefined} />
      {cue.shown ? (
        <>
          <Txt x={cx} y={96} text={n} size={28} big tone="count" t0={200} />
          {unit ? <Txt x={cx} y={116} text={unit} size={15} t0={300} /> : null}
        </>
      ) : null}
      {label ? <Txt x={cx} y={142} text={label} size={14} max={18} t0={t0 + 300} /> : null}
      {sub ? <Txt x={cx} y={178} text={sub} size={14} max={18} tone="soft" t0={t0 + 500} /> : null}
    </g>
  )
}

/* ——— Introduction ——— */

/** 01 « Où va cet argent, et suffit-il ? » : vous, quelques pièces qui partent vers un bâtiment public */
const intro01: Board = p => (
  <Seg>
    <Head lines={cuesOf(p).map(c => lineOf(c, true))} />
    <Art h={156}>
      <Ink d="M10 150H290" t0={100} dur={700} class="vc-soft" />
      <Picto n="personne" x={14} y={64} size={84} t0={250} />
      {range(3).map(k => (
        <Picto key={k} n="piece" x={106 + k * 30} y={88 - k * 20} size={24} t0={900 + k * 200} tone="count" w={0.8} />
      ))}
      <Picto n="monument" x={194} y={52} size={96} t0={1300} />
      <Ask x={230} y={0} h={44} t0={2000} />
    </Art>
  </Seg>
)

/** 02 1 714,2 milliards de dépenses : les quatre postes de la fiche, à la même échelle, les prestations en tête */
const intro02: Board = p => {
  const chart = chartOf(p.segment)
  const [tot, prest] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || !tot || !prest) return null
  const g = barres({
    items: chart.items.map((it, i) => ({
      label: it.label,
      value: it.value,
      text: fr(it.value),
      tone: i === 0 && prest.shown ? ('count' as const) : undefined,
      shown: tot.shown,
    })),
    y: 2,
    size: 14,
    gap: 26,
    room: 62,
    labelSize: 14,
    t0: 300,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Dépenses et recettes en part du PIB, à la même échelle ; l'écart, le déficit, au bout des recettes */
const intro03: Board = p => {
  const [dep, rec, def] = cuesOf(p)
  const vd = num(dep?.text)
  const vr = num(rec?.text)
  const wd = word(p, /dépenses/)
  const wr = word(p, /recettes/)
  if (!dep || !rec || !def || !vd || !vr || vr >= vd) return null
  const top = 26
  const g = barres({
    items: [
      { label: wd?.text, value: vd, text: dep.text, shown: dep.shown },
      { label: wr?.text, value: vr, shown: rec.shown },
    ],
    y: top,
    size: 26,
    gap: 30,
    room: 84,
    t0: 100,
  })
  const [a, b] = g.geo
  if (!a || !b) return null
  return (
    <Seg kind="fig">
      <Art h={top + g.h + 50}>
        <Txt x={0} y={14} text="en part du PIB" anchor="start" size={14} tone="soft" />
        {g.el}
        {rec.shown ? <Txt x={a.x1 + 8} y={b.bottom - 26 * 0.18} text={rec.text} anchor="start" size={20} big t0={600} /> : null}
        {def.shown ? (
          <>
            <Fade class="vc-count" t0={100}>
              <rect class="vc-tint-count" x={b.x1} y={b.top} width={a.x1 - b.x1} height={b.bottom - b.top} />
            </Fade>
            <Fade class="vc-count vc-dash" t0={100}>
              <path d={`M${b.x1} ${b.top}H${a.x1}V${b.bottom}H${b.x1}`} />
            </Fade>
            <Brace x1={b.x1} y1={b.bottom + 6} x2={a.x1} y2={b.bottom + 6} tone="count" t0={300} />
            <Txt x={(b.x1 + a.x1) / 2} y={b.bottom + 38} text={def.text} size={16} tone="count" t0={500} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les prélèvements obligatoires, la plus grande part de la barre des recettes */
const intro04: Board = p => {
  const [po, pct] = cuesOf(p)
  const v = num(pct?.text)
  const rec = said(p, /Les recettes, \d+(?:,\d+)? %/)
  const vr = num(rec)
  if (!po || !pct || !v || !rec || !vr || v >= vr) return null
  const x0 = 6
  const k = 250 / vr
  const y = 34
  const xv = x0 + v * k
  return (
    <Seg kind="fig">
      <Chiffre p={p} label={false} />
      <Art h={150}>
        <Txt x={x0} y={20} text={rec} anchor="start" size={15} t0={100} />
        <Fade t0={400}>
          <rect class="vc-tint" x={x0} y={y} width={vr * k} height={30} />
        </Fade>
        <Ink d={`M${x0} ${y}H${x0 + vr * k}V${y + 30}H${x0}Z`} t0={200} dur={700} />
        {pct.shown ? (
          <>
            <Fade class="vc-count" t0={100}>
              <rect class="vc-tint-count" x={x0} y={y} width={v * k} height={30} />
              <path d={`M${xv} ${y}V${y + 30}`} />
            </Fade>
            <Brace x1={x0} y1={y + 36} x2={xv} y2={y + 36} tone="count" t0={300} />
            <Txt x={(x0 + xv) / 2} y={y + 74} text={pct.text} size={22} big tone="count" t0={500} />
          </>
        ) : null}
        {po.shown ? <Txt x={(x0 + xv) / 2} y={y + 98} text={po.text} size={15} max={26} tone="count" t0={300} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 119 % du PIB : un disque plein, une année de richesse produite, et la part d'un second disque */
const intro05: Board = p => {
  const [pct, plus] = cuesOf(p)
  const v = num(pct?.text)
  const pib = said(p, /PIB/)
  if (!pct || !v || v <= 100 || v >= 300) return null
  const full = Math.floor(v / 100)
  const rest = (v - full * 100) / 100
  const n = full + (rest > 0 ? 1 : 0)
  const r = 50
  const gap = 34
  const x0 = (W - (n * 2 * r + (n - 1) * gap)) / 2
  const cx = (i: number) => x0 + r + i * (2 * r + gap)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={2 * r + 52}>
        {range(n).map(i => (
          <g key={i}>
            {i < full ? (
              <>
                <Ink d={rond(cx(i), r + 2, r)} t0={200 + i * 500} dur={900} />
                {pct.shown ? (
                  <Fade t0={900 + i * 500} class="vc-count">
                    <path class="vc-tint-count" d={rond(cx(i), r + 2, r)} />
                    <path d={rond(cx(i), r + 2, r)} />
                  </Fade>
                ) : null}
              </>
            ) : (
              <Disque cx={cx(i)} cy={r + 2} r={r} part={rest} shown={pct.shown} t0={200 + i * 500} />
            )}
            {i > 0 ? <Txt x={cx(i) - r - gap / 2} y={r + 12} text="+" size={26} big tone="soft" t0={600} /> : null}
          </g>
        ))}
        {pib ? <Txt x={cx(0)} y={r + 10} text={pib} size={22} big t0={800} /> : null}
        {plus?.shown ? (
          <>
            <Brace x1={cx(0) - r} y1={2 * r + 10} x2={cx(n - 1) - r + 2 * r * rest} y2={2 * r + 10} tone="count" t0={200} />
            <Txt x={(cx(0) - r + cx(n - 1) - r + 2 * r * rest) / 2} y={2 * r + 46} text={plus.text} size={16} tone="count" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Les cinq questions du thème, chacune avec le pictogramme de sa vidéo, quand la voix la pose */
const intro06: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map(q => ({
          picto: pictoQuestion(q),
          text: q,
          shown: heard(p, q.split(' ').slice(0, 3).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** 07 Les cinq sujets des vidéos qui suivent : le sommaire de la série, chaque vidéo avec son pictogramme */
const intro07: Board = p => {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  if (!deep.length) return null
  const t0 = 200
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(t0 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyphe n={CHAPITRES[v.id] ?? 'document'} t0={p.still ? 0 : t0 + i * 450 + 150} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Déficit et dette ——— */

/** 01 On emprunte la différence ; année après année, les emprunts s'empilent : la dette */
const dette01: Board = p => {
  const [emp, dette] = cuesOf(p)
  const rec = word(p, /recettes/)
  const dep = word(p, /dépenses/)
  const base = 170
  return (
    <Seg>
      <Head lines={[lineOf(emp)]} />
      <Art h={196}>
        <Ink d={`M6 ${base}H294`} t0={0} dur={600} class="vc-soft" />
        <Fade t0={500}>
          <rect class="vc-tint" x={24} y={base - 96} width={52} height={96} />
          <rect class="vc-tint" x={92} y={base - 128} width={52} height={128} />
        </Fade>
        <Ink d={`M24 ${base}V${base - 96}H76V${base}`} t0={200} dur={600} />
        <Ink d={`M92 ${base}V${base - 128}H144V${base}`} t0={400} dur={600} />
        {rec ? <Txt x={50} y={base + 20} text={rec.text} size={14} t0={600} /> : null}
        {dep ? <Txt x={118} y={base + 20} text={dep.text} size={14} t0={700} /> : null}
        {emp?.shown ? (
          <>
            <Fade class="vc-count vc-dash" t0={0}>
              <path d={`M24 ${base - 96}V${base - 128}H76V${base - 96}`} />
            </Fade>
            <Arrow x1={82} y1={base - 116} x2={196} y2={base - 116} dash tone="count" t0={300} />
          </>
        ) : null}
        {range(5).map(i => {
          const y = base - 22 * (i + 1)
          const last = i === 4
          if (last && !emp?.shown) return null
          return (
            <g key={i} class={last ? 'vc-count' : undefined}>
              {last ? (
                <Fade t0={500}>
                  <rect class="vc-tint-count" x={206} y={y} width={72} height={22} />
                </Fade>
              ) : null}
              <Ink d={`M206 ${y}H278V${y + 22}H206Z`} t0={last ? 500 : 900 + i * 150} dur={300} kept={!last && p.still} />
            </g>
          )
        })}
        {dette?.shown ? <Txt x={242} y={base + 20} text={dette.text} size={15} tone="count" t0={200} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 64,7 milliards d'intérêts, 11,2 % de plus qu'en 2024 : deux colonnes de pièces à la même échelle */
const dette02: Board = p => {
  const [, pct] = cuesOf(p)
  const g = num(pct?.text)
  const ys = [...new Set(yearsOf(p.segment.say))].sort()
  if (!pct || !g || ys.length < 2) return null
  const [y0, y1] = ys as [number, number]
  const base = 132
  const H = 112
  const h0 = H / (1 + g / 100)
  const col = (x: number, h: number) => `M${x} ${base}V${base - h}H${x + 64}V${base}`
  const bands = (x: number, h: number) => range(Math.floor(h / 12)).map(k => `M${x} ${base - 12 * (k + 1)}h64`).join('')
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={base + 26}>
        <Ink d={`M20 ${base}H280`} t0={0} dur={500} class="vc-soft" />
        <Ink d={col(56, h0)} t0={200} dur={700} />
        <Ink d={bands(56, h0)} t0={600} dur={500} class="vc-thin vc-soft" />
        <Ink d={col(156, H)} t0={500} dur={700} />
        <Ink d={bands(156, H)} t0={900} dur={500} class="vc-thin vc-soft" />
        <Txt x={88} y={base + 22} text={String(y0)} size={15} tone="soft" t0={700} />
        <Txt x={188} y={base + 22} text={String(y1)} size={15} tone="soft" t0={1000} />
        {pct.shown ? (
          <>
            <Fade class="vc-dash vc-soft" t0={0}>
              <path d={`M120 ${base - h0}H226`} />
            </Fade>
            <Brace x1={226} y1={base - h0} x2={226} y2={base - H} side={1} tone="count" t0={200} />
            <Txt x={244} y={base - (h0 + H) / 2 + 7} text={`+${pct.text}`} size={18} big anchor="start" tone="count" t0={400} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Le déficit en part du PIB : 5,8 % en 2024, 5,1 % en 2025, deux colonnes depuis zéro */
const dette03: Board = p => {
  const cues = cuesOf(p)
  const years = yearsOf(p.segment.say)
  if (cues.length < 2 || years.length < cues.length) return null
  const cols = colonnes({
    items: cues.map((c, i) => ({ label: String(years[i]), value: num(c.text) ?? 0, text: c.text, shown: c.shown })),
    y: 0,
    h: 150,
    x: 80,
    w: 140,
    colW: 50,
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

/**
 * 04 et 05 La trajectoire du déficit, de 2024 à 2029 : les deux années passées (dites au passage 03), la limite
 * de 3 % à atteindre en 2029 (04), puis les prévisions du Gouvernement en pointillé et l'avis du Haut Conseil (05)
 */
function trajectoire(p: P, stage: 4 | 5): JSX.Element | null {
  const past = grab(p, /(\d+(?:,\d+)?) % du PIB en (\d{4}), (\d+(?:,\d+)?) % en (\d{4})/)
  const goal = grab(p, /sous (\d+(?:,\d+)?) % du PIB d’ici (\d{4})/)
  const prev = stage === 5 ? grab(p, /prévoit (\d+(?:,\d+)?) % en (\d{4}), puis (\d+(?:,\d+)?) % en (\d{4})/) : null
  if (!past || !goal || (stage === 5 && !prev)) return null
  const pts = [
    { y: Number(past[2]), v: num(past[1])!, text: `${past[1]}\u00a0%`, ghost: false },
    { y: Number(past[4]), v: num(past[3])!, text: `${past[3]}\u00a0%`, ghost: false },
    ...(prev
      ? [
          { y: Number(prev[2]), v: num(prev[1])!, text: `${prev[1]}\u00a0%`, ghost: true },
          { y: Number(prev[4]), v: num(prev[3])!, text: `${prev[3]}\u00a0%`, ghost: true },
        ]
      : []),
  ]
  const limit = num(goal[1])!
  const yGoal = Number(goal[2])
  const from = pts[0]!.y
  if (!(yGoal > from) || yGoal - from > 10) return null
  const [cLimit, cYear] = stage === 4 ? cuesOf(p) : [null, null]
  const quote = stage === 5 ? cueOf(p, 1) : null
  const prevShown = stage === 5 ? heard(p, `${prev![1]}\u00a0%`) : false
  const limitShown = stage === 4 ? !!cLimit?.shown : true
  const yearShown = stage === 4 ? !!cYear?.shown : true
  const x0 = 34
  const x1 = 270
  const X = (y: number) => x0 + ((y - from) / (yGoal - from)) * (x1 - x0)
  const base = 178
  const k = 120 / Math.max(...pts.map(q => q.v), limit)
  const cw = 28
  const yl = base - limit * k
  return (
    <Seg kind="fig">
      <Art h={base + 26}>
        <Ink d={`M10 ${base}H292`} t0={0} dur={600} class="vc-soft" kept={p.still} />
        {pts.map((q, i) => {
          if (q.ghost && !prevShown) return null
          const x = X(q.y) - cw / 2
          const box = `M${x} ${base}V${base - q.v * k}H${x + cw}V${base}`
          return (
            <g key={q.y}>
              {q.ghost ? (
                <Fade t0={200 + (i - 2) * 300} class="vc-ghost">
                  <path d={box} />
                </Fade>
              ) : (
                <>
                  <Fade t0={0} kept>
                    <rect class="vc-tint" x={x} y={base - q.v * k} width={cw} height={q.v * k} />
                  </Fade>
                  <Ink d={box} kept />
                </>
              )}
              <Txt x={X(q.y)} y={base - q.v * k - 8} text={q.text} size={15} big tone={q.ghost ? 'soft' : undefined} kept={!q.ghost} t0={400 + (i - 2) * 300} />
              <Txt x={X(q.y)} y={base + 20} text={String(q.y)} size={14} tone="soft" kept={!q.ghost} t0={300 + (i - 2) * 300} />
            </g>
          )
        })}
        {limitShown ? (
          <>
            <Fade class="vc-count vc-dash" t0={stage === 4 ? 100 : 0} kept={stage === 5}>
              <path d={`M10 ${yl}H292`} />
            </Fade>
            <Txt x={X(yGoal) - 16} y={yl + 22} text={`sous ${goal[1]}\u00a0%`} size={15} anchor="end" tone="count" kept={stage === 5} t0={300} />
          </>
        ) : null}
        {yearShown ? (
          <>
            <Picto n="drapeau" x={X(yGoal) - 10} y={yl - 44} size={44} tone="count" kept={stage === 5} t0={100} />
            <Txt x={X(yGoal)} y={base + 20} text={String(yGoal)} size={14} tone="count" kept={stage === 5} t0={200} />
          </>
        ) : null}
        {quote?.shown ? <Txt x={292} y={18} text={`«\u00a0${quote.text}\u00a0»`} size={15} max={16} anchor="end" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

const dette04: Board = p => trajectoire(p, 4)
const dette05: Board = p => trajectoire(p, 5)

/** 06 Réduire le déficit, ou emprunter davantage : pour la dette, les dépenses et les prélèvements, ce qui monte,
 *  ce qui baisse, ce qui ne bouge pas ; les deux colonnes à égalité */
const dette06: Board = p => {
  const [red, emp] = cuesOf(p)
  if (!red || !emp) return null
  const rows: { label: string; left: 'hausse' | 'baisse'; right: 'hausse' | 'baisse' | null }[] = [
    { label: 'dette', left: 'baisse', right: 'hausse' },
    { label: 'dépenses', left: 'baisse', right: null },
    { label: 'prélèvements', left: 'hausse', right: null },
  ]
  const y = (i: number) => 80 + i * 46
  return (
    <Seg>
      <Art h={206}>
        <Txt x={52} y={20} text={red.text} size={15} max={11} tone={red.shown ? 'count' : undefined} t0={0} />
        <Txt x={248} y={20} text={emp.text} size={15} max={11} tone={emp.shown ? 'count' : undefined} t0={0} />
        <Ink d="M104 8V200M196 8V200" t0={100} dur={500} class="vc-soft vc-thin" />
        {rows.map((r, i) => (
          <g key={r.label}>
            <Txt x={150} y={y(i) + 5} text={r.label} size={15} t0={300 + i * 150} />
            {red.shown ? <Picto n={r.left} x={36} y={y(i) - 16} size={32} tone="count" w={1.2} t0={i * 250} /> : null}
            {emp.shown ? (
              r.right ? (
                <Picto n={r.right} x={232} y={y(i) - 16} size={32} tone="count" w={1.2} t0={i * 250} />
              ) : (
                <Egal cx={248} cy={y(i)} t0={i * 250} />
              )
            ) : null}
          </g>
        ))}
        {red.shown ? <Txt x={52} y={y(1) + 28} text="ou" size={14} tone="soft" t0={400} /> : null}
      </Art>
    </Seg>
  )
}

/** 07 « Quelle stratégie, et à quel rythme ? » : la dette au début d'une frise d'années, un point d'interrogation */
const dette07: Board = p => (
  <Seg kind="ask">
    <Art h={110}>
      <Ink d="M14 92H226" t0={0} dur={800} />
      <Ink d={range(7).map(k => `M${74 + k * 24} 87v10`).join('')} t0={500} dur={400} class="vc-soft vc-thin" />
      <Picto n="pieces" x={4} y={26} size={64} t0={200} />
      <Arrow x1={78} y1={58} x2={222} y2={58} dash t0={900} />
      <Ask x={240} y={26} h={66} t0={1300} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Grandes fortunes ——— */

/** 01 Logement, épargne, placements : votre patrimoine ; à côté, un plus grand, en question */
const fortune01: Board = p => {
  const [, big] = cuesOf(p)
  const items: [RegExp, PictoName, number][] = [
    [/Logement/, 'maison', 33],
    [/épargne/, 'tirelire', 98],
    [/placements/, 'bourse', 164],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={140}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return (
            <g key={n}>
              <Picto n={n} x={cx - 26} y={14} size={52} t0={200 + i * 300} />
              {w ? <Txt x={cx} y={88} text={w.text.toLowerCase()} size={14} t0={400 + i * 300} /> : null}
            </g>
          )
        })}
        <Brace x1={6} y1={100} x2={196} y2={100} t0={1300} />
        <Picto n="immeuble" x={210} y={4} size={88} t0={1500} tone={big?.shown ? 'count' : undefined} />
      </Art>
    </Seg>
  )
}

/** 02 48 % du patrimoine aux 10 % les mieux dotés, dont 15 % aux 1 % : cent carrés, deux bleus */
const fortune02: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const ten = grab(p, /Les (\d+ %) de ménages (les mieux dotés)/)
  const one = grab(p, /Les (\d+ %) (les mieux dotés)/)
  if (!a || !b || !va || !vb || vb >= va || va > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <div class="vc-units">
        <div class="vc-units-grid">
          <Cent kind="carre" low={b.shown ? vb : 0} high={va} shown={a.shown} t0={200} />
        </div>
        <div>
          {a.shown ? (
            <p class="vc-units-cap vc-rise" style={at(900)}>
              <span class="vc-swatch" aria-hidden="true">
                <i class="is-range" />
                <i />
              </span>
              {ten ? `${a.text}\u00a0: les ${ten[1]!.replace(' ', '\u00a0')} ${ten[2]}` : a.text}
            </p>
          ) : null}
          {b.shown ? (
            <p class="vc-units-cap vc-rise" style={at(300)}>
              <span class="vc-swatch" aria-hidden="true">
                <i />
              </span>
              {one ? `${b.text}\u00a0: les ${one[1]!.replace(' ', '\u00a0')} ${one[2]}` : b.text}
            </p>
          ) : null}
        </div>
      </div>
      <Src p={p} />
    </Seg>
  )
}

/** 03 L'ISF en 2017, l'IFI en 2018 : leurs recettes, deux barres à la même échelle */
const fortune03: Board = p => {
  const chart = chartOf(p.segment)
  const [a, b] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || !a || !b) return null
  const g = barres({
    items: chart.items.map((it, i) => ({
      label: it.label,
      value: it.value,
      text: `${fr(it.value)}\u00a0${chart.unit ?? ''}`.trim(),
      shown: (i === 0 ? a : b).shown,
    })),
    y: 2,
    size: 28,
    gap: 34,
    room: 96,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 193 600 foyers ont reçu un avis d'IFI : de l'immobilier, des avis, et 2,3 milliards en tout */
const fortune04: Board = p => {
  const [, md] = cuesOf(p)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={118}>
        <Ink d="M6 104H170" t0={0} dur={500} class="vc-soft" />
        <Picto n="immeuble" x={10} y={18} size={86} t0={200} />
        <Picto n="maison" x={92} y={44} size={60} t0={500} />
        <Picto n="document" x={62} y={2} size={36} t0={900} w={0.9} />
        <Picto n="document" x={130} y={22} size={32} t0={1100} w={0.9} />
        <Arrow x1={176} y1={60} x2={206} y2={60} dash t0={1400} />
        {md?.shown ? (
          <>
            <Picto n="pieces" x={214} y={16} size={66} tone="count" t0={0} />
            <Txt x={247} y={108} text={md.text} size={15} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Départs et retours par an, sous l'ISF puis sous l'IFI : deux paires de barres à la même échelle */
const fortune05: Board = p => {
  const say = plain(p.segment.say)
  const m1 = /environ (\d+) départs par an, pour (\d+) retours/.exec(say)
  const m2 = /(\d+) départs, pour (\d+) retours/.exec(say)
  const g1 = word(p, /Sous l’ISF/)
  const g2 = word(p, /Sous l’IFI/)
  const dep = word(p, /départs/)
  const ret = word(p, /retours/)
  if (!m1 || !m2 || !g1 || !g2 || !dep || !ret) return null
  const vals = [Number(m1[1]), Number(m1[2]), Number(m2[1]), Number(m2[2])]
  const k = 168 / Math.max(...vals)
  const xb = 76
  const group = (top: number, g: Cue, a: number, b: number, shown: boolean, t0: number) => (
    <g>
      <Txt x={0} y={top} text={g.text} size={15} anchor="start" t0={t0} />
      {shown ? (
        <>
          {[
            { v: a, y: top + 10, label: dep.text, count: true },
            { v: b, y: top + 36, label: ret.text, count: false },
          ].map(r => (
            <g key={r.y} class={r.count ? 'vc-count' : undefined}>
              <Txt x={xb - 8} y={r.y + 14} text={r.label} size={14} anchor="end" tone={r.count ? undefined : 'soft'} t0={t0 + 100} />
              <Fade t0={t0 + 400}>
                <rect class={r.count ? 'vc-tint-count' : 'vc-tint'} x={xb} y={r.y} width={r.v * k} height={18} />
              </Fade>
              <Ink d={`M${xb} ${r.y}H${xb + r.v * k}V${r.y + 18}H${xb}Z`} t0={t0 + 200} dur={600} />
              <Txt x={xb + r.v * k + 6} y={r.y + 15} text={String(r.v)} size={16} big anchor="start" t0={t0 + 600} />
            </g>
          ))}
        </>
      ) : null}
    </g>
  )
  return (
    <Seg kind="fig">
      <Art h={170}>
        {group(16, g1, vals[0]!, vals[1]!, g1.shown, 0)}
        {group(102, g2, vals[2]!, vals[3]!, g2.shown, 0)}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 Deux analyses côte à côte : un enjeu budgétaire « de second ordre » ; des entreprises qui évoluent moins bien */
const fortune06: Board = p => {
  const [a, b] = cuesOf(p)
  const left = word(p, /l’enjeu budgétaire/)
  const right = word(p, /les entreprises dont l’actionnaire principal part/)
  if (!a || !b) return null
  return (
    <Seg>
      <Art h={180}>
        <Ink d="M150 4V176" t0={0} dur={500} class="vc-soft vc-thin" />
        {left ? <Txt x={75} y={18} text={left.text} size={14} max={18} tone="soft" t0={100} /> : null}
        {right ? <Txt x={225} y={18} text={right.text} size={14} max={18} tone="soft" t0={300} /> : null}
        <Picto n="pieces" x={44} y={64} size={62} t0={200} />
        <Picto n="mallette" x={184} y={64} size={62} t0={500} />
        {a.shown ? <Txt x={75} y={160} text={`«\u00a0${a.text}\u00a0»`} size={16} tone="count" t0={200} /> : null}
        {b.shown ? (
          <>
            <Picto n="baisse" x={250} y={74} size={34} tone="count" w={1.2} t0={0} />
            <Txt x={225} y={160} text={b.text} size={16} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 « Pour les uns, contribuer davantage ; pour d'autres, freiner l'investissement, ou pousser au départ » */
const fortune07: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="pieces" x={cx - 32} y={base - 50} size={50} t0={900} />
        <Picto n="hausse" x={cx + 14} y={base - 46} size={26} tone="count" w={1.2} t0={1200} />
      </>
    ),
    right: ['grue', 'valise'],
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

/** 08 « Comment imposer les plus grandes fortunes, et jusqu'où ? » : l'immeuble, une toise, la question */
const fortune08: Board = p => (
  <Seg kind="ask">
    <Art h={112}>
      <Ink d="M60 106V6" t0={100} dur={600} />
      <Ink d={range(9).map(k => `M60 ${96 - k * 11}h${k % 2 ? 6 : 10}`).join('')} t0={500} dur={500} class="vc-thin vc-soft" />
      <Picto n="immeuble" x={74} y={8} size={98} t0={300} />
      <Ask x={196} y={14} h={84} t0={1200} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Héritages ——— */

/** 01 Une clé passe d'une personne à une autre ; en chemin, une part revient à l'État */
const heritages01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={158}>
      <Picto n="personne" x={4} y={36} size={70} t0={100} />
      <Picto n="personne" x={226} y={36} size={70} t0={300} />
      <Picto n="cle" x={122} y={14} size={56} t0={700} />
      <Arrow x1={80} y1={66} x2={220} y2={66} dash t0={1000} />
      <Arrow x1={150} y1={72} x2={150} y2={104} tone="count" t0={1500} head={6} />
      <Picto n="piece" x={160} y={78} size={20} tone="count" w={0.8} t0={1600} />
      <Picto n="monument" x={124} y={106} size={52} t0={1800} />
    </Art>
  </Seg>
)

/** 02 16,1 milliards de droits de succession, 5,1 de droits sur les donations : deux barres à la même échelle */
const heritages02: Board = p => {
  const chart = chartOf(p.segment)
  const [a, b] = cuesOf(p)
  if (!chart || chart.kind !== 'compare' || !a || !b) return null
  const g = barres({
    items: chart.items.map((it, i) => ({
      label: it.label,
      value: it.value,
      text: `${fr(it.value)}\u00a0${chart.unit ?? ''}`.trim(),
      tone: i === 0 ? ('count' as const) : undefined,
      shown: (i === 0 ? a : b).shown,
    })),
    y: 2,
    size: 28,
    gap: 34,
    room: 100,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Sur 39 États, la France en tête : 39 cases en rang, la première comptée */
const heritages03: Board = p => {
  const [n39, most] = cuesOf(p)
  const n = num(n39?.text)
  const fr_ = said(p, /France/)
  if (!n39 || !n || n > 60) return null
  const cols = Math.ceil(n / 3)
  const size = 16
  const gap = 4
  const x = (W - (cols * (size + gap) - gap)) / 2
  const h = Math.ceil(n / cols) * (size + gap) - gap
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={h + 50}>
        <Cases n={n} cols={cols} x={x} y={4} size={size} gap={gap} count={most?.shown ? [0] : []} t0={200} stagger={20} />
        {most?.shown && fr_ ? (
          <>
            <Ink d={`M${x + size / 2} ${4 + h + 4}V${4 + h + 20}`} t0={200} dur={200} class="vc-count vc-thin" />
            <Txt x={x} y={4 + h + 38} text={fr_} size={15} anchor="start" tone="count" t0={300} />
          </>
        ) : null}
        {n39.shown ? <Txt x={W - x} y={4 + h + 38} text={n39.text} size={15} anchor="end" tone="soft" t0={400} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 24 % des successions en ligne directe effectivement taxées : cent carrés, vingt-quatre comptés */
const heritages04: Board = p => {
  const [pct, taxed] = cuesOf(p)
  const v = num(pct?.text)
  if (!pct || !taxed || !v || v > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={v} caption={`${pct.text} ${taxed.text}`} shown={pct.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 05 Au-delà d'un million d'euros : 15 % avec les exonérations, plus de 20 % sans elles, à la même échelle */
const heritages05: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const la = word(p, /avec les exonérations/)
  const lb = word(p, /Sans elles/)
  if (!a || !b || !va || !vb) return null
  const g = barres({
    items: [
      { label: la?.text, value: va, text: a.text, tone: 'count', shown: a.shown },
      { label: low(lb?.text) ?? undefined, value: vb, text: b.text, shown: b.shown },
    ],
    y: 2,
    size: 28,
    gap: 34,
    room: 132,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Art h={g.h + 6}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 06 « Pour les uns, la France taxe déjà plus qu'ailleurs ; pour d'autres, contribuer davantage » */
const heritages06: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => <Cases n={5} cols={5} x={cx - 41} y={base - 22} size={14} gap={4} count={[0]} t0={900} />,
    right: (cx, base) => (
      <>
        <Picto n="cle" x={cx - 36} y={base - 46} size={46} t0={1200} />
        <Picto n="hausse" x={cx + 12} y={base - 44} size={26} tone="count" w={1.2} t0={1500} />
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

/** 07 « Quelle place donner aux droits de succession ? » : la clé, et la question */
const heritages07: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Picto n="cle" x={52} y={4} size={96} t0={200} />
      <Ask x={190} y={10} h={84} t0={1000} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Capital et bénéfices ——— */

/** 01 Le salaire au barème progressif, un escalier de taux ; et les dividendes, en question */
const capital01: Board = p => {
  const [bar, div] = cuesOf(p)
  return (
    <Seg>
      <Art h={182}>
        <Ink d="M4 156H164" t0={0} dur={500} class="vc-soft" />
        <Ink d="M52 156V138H80V114H108V90H136V66H160V42" t0={200} dur={1200} />
        <Picto n="mallette" x={4} y={114} size={42} t0={600} />
        {bar?.shown ? <Txt x={84} y={178} text={bar.text} size={15} tone="count" t0={0} /> : null}
        <Picto n="pieces" x={186} y={78} size={62} t0={900} />
        <Ask x={256} y={64} h={64} t0={1400} />
        {div?.shown ? <Txt x={222} y={178} text={div.text} size={15} tone="count" t0={0} /> : null}
      </Art>
    </Seg>
  )
}

/** 02 Un taux unique en deux tronçons : 12,8 % d'impôt sur le revenu, 18,6 % de prélèvements sociaux */
const capital02: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const ir = word(p, /impôt sur le revenu/)
  const ps = word(p, /prélèvements sociaux/)
  const head = word(p, /un taux unique/)
  if (!a || !b || !va || !vb) return null
  const x0 = 8
  const k = 280 / (va + vb)
  const xa = x0 + va * k
  const xb = xa + vb * k
  const y = 40
  return (
    <Seg kind="fig">
      <Head lines={[head ? { text: head.text, shown: head.shown } : null]} />
      <Art h={140}>
        <Fade t0={400}>
          <rect class="vc-tint" x={x0} y={y} width={va * k} height={32} />
        </Fade>
        <Ink d={`M${x0} ${y}H${xa}V${y + 32}H${x0}Z`} t0={200} dur={600} />
        {a.shown ? <Txt x={(x0 + xa) / 2} y={y - 10} text={a.text} size={20} big t0={200} /> : null}
        {ir ? <Txt x={(x0 + xa) / 2} y={y + 54} text={ir.text} size={14} max={13} t0={400} /> : null}
        {b.shown ? (
          <>
            <Fade class="vc-count" t0={300}>
              <rect class="vc-tint-count" x={xa} y={y} width={vb * k} height={32} />
            </Fade>
            <Ink d={`M${xa} ${y}H${xb}V${y + 32}H${xa}`} t0={0} dur={600} class="vc-count" />
            <Txt x={(xa + xb) / 2} y={y - 10} text={b.text} size={20} big tone="count" t0={300} />
            {ps ? <Txt x={(xa + xb) / 2} y={y + 54} text={ps.text} size={14} max={13} tone="count" t0={500} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 1 % des foyers déclarent 96 % des dividendes : deux grilles de cent carrés */
const capital03: Board = p => {
  const [foy, pct] = cuesOf(p)
  const vf = num(foy?.text)
  const vp = num(pct?.text)
  const ft = word(p, /foyers fiscaux/)
  const dt = word(p, /des dividendes/)
  if (!foy || !pct || !vf || !vp || vf > 100 || vp > 100) return null
  const xa = 14
  const xb = W - 14 - GRILLE
  const y = 26
  return (
    <Seg kind="fig">
      <Art h={y + GRILLE + 40}>
        {ft ? <Txt x={xa + GRILLE / 2} y={16} text={ft.text} size={14} tone="soft" t0={100} /> : null}
        {dt ? <Txt x={xb + GRILLE / 2} y={16} text={dt.text} size={14} tone="soft" t0={300} /> : null}
        <Grille x={xa} y={y} k={Math.round(vf)} shown={foy.shown} t0={200} />
        <Grille x={xb} y={y} k={Math.round(vp)} shown={pct.shown} t0={500} />
        {foy.shown ? <Txt x={xa + GRILLE / 2} y={y + GRILLE + 30} text={foy.text} size={16} tone="count" t0={200} /> : null}
        {pct.shown ? <Txt x={xb + GRILLE / 2} y={y + GRILLE + 32} text={pct.text} size={22} big tone="count" t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les dividendes déclarés, environ 14 milliards avant la réforme, 23 après : deux colonnes depuis zéro (l'avis
 *  du comité qui suit reste dans les sous-titres) */
const capital04: Board = p => {
  const [a, b] = cuesOf(p)
  const f = p.segment.figure
  const m = f ? /\((\d{4}-\d{4})\), contre environ (\d+) Md€ \((\d{4}-\d{4})\)/.exec(plain(f.label)) : null
  const va = num(a?.text)
  const vb = num(b?.text)
  const title = word(p, /les dividendes déclarés/)
  const env = word(p, /environ/)
  if (!a || !b || !m || !va || !vb) return null
  const cols = colonnes({
    items: [
      { label: m[3]!, value: va, text: `${a.text}\u00a0Md€`, shown: a.shown },
      { label: m[1]!, value: vb, text: `${fr(vb)}\u00a0Md€`, tone: 'count', shown: b.shown },
    ],
    y: 24,
    h: 132,
    x: 70,
    w: 160,
    colW: 54,
    t0: 100,
  })
  const k = (132 - 34) / Math.max(va, vb)
  return (
    <Seg kind="fig">
      <Art h={24 + cols.h}>
        {title ? <Txt x={W / 2} y={14} text={title.text} size={15} t0={0} /> : null}
        {cols.el}
        {env && a.shown ? <Txt x={97} y={24 + 132 - va * k - 34} text={env.text} size={14} tone="soft" t0={500} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 Aucun effet détecté sur l'investissement ni les salaires ; des créations d'entreprises plus rapides */
const capital05: Board = p => {
  const [none, crea] = cuesOf(p)
  const inv = word(p, /l’investissement/)
  const sal = word(p, /les salaires/)
  if (!none || !crea) return null
  return (
    <Seg>
      <Art h={176}>
        <Ink d="M170 4V172" t0={0} dur={500} class="vc-soft vc-thin" />
        <Picto n="grue" x={0} y={2} size={44} t0={100} />
        <Picto n="billet" x={0} y={54} size={44} t0={400} />
        {inv ? <Txt x={50} y={30} text={inv.text} size={14} anchor="start" tone="soft" t0={300} /> : null}
        {sal ? <Txt x={50} y={82} text={sal.text} size={14} anchor="start" tone="soft" t0={600} /> : null}
        {none.shown ? (
          <>
            <Egal cx={84} cy={124} t0={0} />
            <Txt x={84} y={162} text={none.text} size={16} tone="count" t0={200} />
          </>
        ) : null}
        <Picto n="mallette" x={196} y={14} size={56} t0={700} />
        {crea.shown ? (
          <>
            <Picto n="hausse" x={254} y={22} size={34} tone="count" w={1.2} t0={0} />
            <Txt x={235} y={124} text={crea.text} size={16} max={14} tone="count" t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 L'impôt sur les sociétés : un quart des bénéfices au taux normal ; ce qu'il rapporte, et la contribution
 *  exceptionnelle des plus grandes, à la même échelle */
const capital06: Board = p => {
  const chart = chartOf(p.segment)
  const [rate, is, ce] = cuesOf(p)
  const v = num(rate?.text)
  const ben = word(p, /des bénéfices/)
  if (!chart || chart.kind !== 'compare' || !rate || !is || !ce || !v || v > 100) return null
  const items = [...chart.items].sort((x, y) => y.value - x.value)
  const g = barres({
    items: items.map((it, i) => ({
      label: it.label,
      value: it.value,
      text: `${fr(it.value)}\u00a0${chart.unit ?? ''}`.trim(),
      tone: i === 1 ? ('count' as const) : undefined,
      shown: (i === 0 ? is : ce).shown,
    })),
    y: 104,
    size: 22,
    gap: 30,
    room: 92,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Art h={104 + g.h + 4}>
        <Disque cx={50} cy={46} r={42} part={v / 100} shown={rate.shown} t0={100} />
        {rate.shown ? (
          <>
            <Txt x={108} y={44} text={rate.text} size={24} big anchor="start" tone="count" t0={300} />
            {ben ? <Txt x={108} y={66} text={ben.text} size={15} anchor="start" t0={400} /> : null}
          </>
        ) : null}
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 « Pour les uns, travail et capital imposés de la même façon ; pour d'autres, ne pas décourager l'épargne et
 *  l'investissement » */
const capital07: Board = p => {
  const [a, b] = cuesOf(p)
  const bal = balance({
    left: (cx, base) => (
      <>
        <Picto n="mallette" x={cx - 46} y={base - 38} size={36} t0={900} />
        <Egal cx={cx} cy={base - 20} t0={1200} />
        <Picto n="bourse" x={cx + 10} y={base - 38} size={36} t0={1100} />
      </>
    ),
    right: ['tirelire', 'grue'],
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

/** 08 « Comment imposer les revenus du capital et les bénéfices des entreprises ? » */
const capital08: Board = p => (
  <Seg kind="ask">
    <Art h={104}>
      <Picto n="bourse" x={24} y={12} size={80} t0={100} />
      <Picto n="mallette" x={112} y={20} size={70} t0={500} />
      <Ask x={214} y={10} h={84} t0={1100} />
    </Art>
    <Question p={p} />
  </Seg>
)

/* ——— Recettes nouvelles ——— */

/** 01 Un impôt rapporte davantage : une pièce de plus sur la pile ; où va-t-elle ? */
const recettes01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={150}>
      <Picto n="pieces" x={34} y={58} size={84} t0={100} />
      <Picto n="piece" x={58} y={42} size={36} tone="count" t0={700} />
      <Arrow x1={130} y1={92} x2={208} y2={40} dash t0={1100} />
      <Arrow x1={130} y1={98} x2={212} y2={98} dash t0={1250} />
      <Arrow x1={130} y1={104} x2={208} y2={146} dash t0={1400} />
      <Ask x={232} y={62} h={66} t0={1700} />
    </Art>
  </Seg>
)

/** 02 La règle d'universalité : toutes les recettes dans un même budget, qui finance toutes les dépenses */
const recettes02: Board = p => {
  const [budget] = cuesOf(p)
  const ys = [16, 58, 100, 142]
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={186}>
        {ys.map((y, i) => (
          <g key={y}>
            <Picto n="piece" x={4} y={y - 4} size={28} t0={100 + i * 120} />
            <Arrow x1={36} y1={y + 10} x2={104} y2={86} t0={500 + i * 120} dur={400} head={6} />
          </g>
        ))}
        <Caisse x={110} y={50} w={80} h={76} t0={300} tone={budget?.shown ? 'count' : undefined} />
        {budget?.shown ? <Txt x={150} y={152} text={budget.text} size={15} max={14} tone="count" t0={200} /> : null}
        {[10, 70, 130].map((y, i) => (
          <g key={y}>
            <Arrow x1={196} y1={88} x2={232} y2={y + 22} t0={1100 + i * 150} dur={400} head={6} />
            <Picto n="guichet" x={240} y={y} size={46} t0={1300 + i * 150} />
          </g>
        ))}
      </Art>
    </Seg>
  )
}

/** 03 Les branches de la Sécurité sociale, une caisse chacune ; 0,15 point de CSG passe de la dette sociale à
 *  l'autonomie */
const recettes03: Board = p => {
  const [, csg] = cuesOf(p)
  const first = sentencesOf(p.segment.say)[0] ?? ''
  const list = listAfterColon(first).slice(0, 5)
  const dette = word(p, /la dette sociale/)
  if (list.length < 2 || !csg) return null
  const n = list.length
  const w = 60
  const gap = (W - 8 - n * w) / (n - 1)
  const X = (i: number) => 4 + i * (w + gap)
  const yb = 94
  const last = n - 1
  return (
    <Seg kind="fig">
      <Art h={160}>
        {list.map((l, i) => (
          <g key={l}>
            <Caisse x={X(i)} y={yb} w={w} h={40} t0={100 + i * 200} tone={i === last && csg.shown ? 'count' : undefined} />
            <Txt x={X(i) + w / 2} y={yb + 60} text={l} size={14} tone={i === last && csg.shown ? 'count' : undefined} t0={300 + i * 200} />
          </g>
        ))}
        {csg.shown ? (
          <>
            <Caisse x={W - 4 - 92} y={2} w={92} h={34} tone="ghost" t0={0} />
            {dette ? <Txt x={W - 100} y={26} text={dette.text} size={14} anchor="end" tone="soft" t0={200} /> : null}
            <Arrow x1={W - 4 - 46} y1={40} x2={X(last) + w / 2} y2={yb - 6} tone="count" t0={400} />
            <Txt x={X(last) - 6} y={68} text={csg.text} size={15} anchor="end" tone="count" t0={600} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Trois usages d'une recette nouvelle : alléger d'autres prélèvements, financer une dépense, réduire le
 *  déficit */
const recettes04: Board = p => {
  const parts = listAfterColon(p.segment.say).map(s => s.replace(/^ou\s+/, ''))
  if (parts.length !== 3) return null
  const pictos: [PictoName, 'hausse' | 'baisse'][] = [
    ['document', 'baisse'],
    ['guichet', 'hausse'],
    ['pieces', 'baisse'],
  ]
  const list: Effet[] = parts.map((t, i) => ({ picto: pictos[i]![0], dir: pictos[i]![1], text: t, shown: heard(p, t.split(' ').slice(0, 2).join(' ')) }))
  const ef = effets({ items: list, x: 14, y: 4, w: 286, row: 64, t0: 100 })
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={ef.h + 8}>{ef.el}</Art>
    </Seg>
  )
}

/** 05 et 06 Deux ordres de grandeur côte à côte, chacun avec son pictogramme, sans échelle commune */
function deuxFiches(p: P, left: [PictoName, RegExp, RegExp | null], right: [PictoName, RegExp, RegExp | null]) {
  const [a, b] = cuesOf(p)
  if (!a || !b) return null
  const la = word(p, left[1])
  const lb = word(p, right[1])
  const sa = left[2] ? word(p, left[2]) : null
  const sb = right[2] ? word(p, right[2]) : null
  const h = sa || sb ? 196 : 164
  return (
    <Seg kind="fig">
      <Art h={h}>
        <Ink d={`M150 4V${h - 4}`} t0={0} dur={500} class="vc-soft vc-thin" />
        <Fiche cx={75} picto={left[0]} cue={a} label={low(la?.text)} sub={sa?.text} t0={100} />
        <Fiche cx={225} picto={right[0]} cue={b} label={low(lb?.text)} sub={sb?.text} t0={400} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

const recettes05: Board = p => deuxFiches(p, ['document', /les cotisations sociales/, null], ['fauteuil', /La branche autonomie/, null])
const recettes06: Board = p => deuxFiches(p, ['thermometre', /La transition climatique/, /par an à l’horizon \d{4}/], ['pieces', /La dette/, /d’intérêts en \d{4}/])

/** 07 « À quoi affecter en priorité une recette nouvelle ? » : la question au centre, les quatre pistes autour */
const recettes07: Board = p => {
  const corners: [PictoName, number, number][] = [
    ['document', 22, 4],
    ['fauteuil', 234, 4],
    ['thermometre', 22, 82],
    ['pieces', 234, 82],
  ]
  return (
    <Seg kind="ask">
      <Art h={130}>
        {corners.map(([n, x, y], i) => (
          <g key={n}>
            <Picto n={n} x={x} y={y} size={44} t0={300 + i * 200} />
            <Arrow x1={150 + (x < 150 ? -26 : 26)} y1={65} x2={x < 150 ? x + 50 : x - 6} y2={y + 22} dash t0={900 + i * 150} />
          </g>
        ))}
        <Ask x={135} y={26} h={70} t0={100} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Le registre ——— */

export const FISCALITE: Record<string, Board> = {
  'impots-intro-01': intro01,
  'impots-intro-02': intro02,
  'impots-intro-03': intro03,
  'impots-intro-04': intro04,
  'impots-intro-05': intro05,
  'impots-intro-06': intro06,
  'impots-intro-07': intro07,
  'impots-dette-01': dette01,
  'impots-dette-02': dette02,
  'impots-dette-03': dette03,
  'impots-dette-04': dette04,
  'impots-dette-05': dette05,
  'impots-dette-06': dette06,
  'impots-dette-07': dette07,
  'impots-fortune-01': fortune01,
  'impots-fortune-02': fortune02,
  'impots-fortune-03': fortune03,
  'impots-fortune-04': fortune04,
  'impots-fortune-05': fortune05,
  'impots-fortune-06': fortune06,
  'impots-fortune-07': fortune07,
  'impots-fortune-08': fortune08,
  'impots-heritages-01': heritages01,
  'impots-heritages-02': heritages02,
  'impots-heritages-03': heritages03,
  'impots-heritages-04': heritages04,
  'impots-heritages-05': heritages05,
  'impots-heritages-06': heritages06,
  'impots-heritages-07': heritages07,
  'impots-capital-01': capital01,
  'impots-capital-02': capital02,
  'impots-capital-03': capital03,
  'impots-capital-04': capital04,
  'impots-capital-05': capital05,
  'impots-capital-06': capital06,
  'impots-capital-07': capital07,
  'impots-capital-08': capital08,
  'impots-recettes-01': recettes01,
  'impots-recettes-02': recettes02,
  'impots-recettes-03': recettes03,
  'impots-recettes-04': recettes04,
  'impots-recettes-05': recettes05,
  'impots-recettes-06': recettes06,
  'impots-recettes-07': recettes07,
}
