// Piste C, les planches de la série « Santé et grand âge » (src/ui/videos/series/sante.ts) : un dessin par
// passage, composé avec la bibliothèque commune (dessin/pictos.tsx, dessin/schemas.tsx, dessin/mises.tsx). Mêmes
// règles que « Retraites » et « Logement » : les mots et les nombres viennent du script (mots mis en valeur,
// phrases dites, chiffre et graphique de la fiche) ; une planche qui ne s'y retrouve plus rend null, et le
// passage prend le dessin générique de sa sorte d'image.
// Les pictogrammes qui manquent à la bibliothèque (lunettes, dent, seringue, pomme, gélule, usine, hôpital,
// paquet) sont dessinés ici, au trait, sans attribut. Quelques étiquettes courtes et neutres nomment ce qui est
// dessiné quand le passage ne les dit pas : elles sont reprises dans l'« alt » du passage.

import type { JSX } from 'preact'
import { chartOf } from '../../model'
import { SANTE as SERIE } from '../../series/sante'
import { Art, Arrow, Ask, Brace, Fade, Ink, Txt, W, at, capital, cls, cueOf, cuesOf, heard, num, plain, ratioOf, said, sentenceWith, sentencesOf, word, wrap, yearsOf, type P, type Tone } from '../dessin/encre'
import { Chiffre, HeadCues, Note, Panel, Question, Seg, Signature, Src, Sur100 } from '../dessin/mises'
import { Glyphe, Picto, type PictoName } from '../dessin/pictos'
import { Disque, Pause, Plafond, Rang, balance, barres, colonnes, effets, frise, partPoint, rangCells } from '../dessin/schemas'
import type { Board } from './types'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Un texte du script sans son article ni sa conjonction de tête (« la Sécurité sociale » → « Sécurité sociale ») */
const sans = (s: string) => s.replace(/^(et |la |le |les |une |un |des |du |de la |de l’|l’)/i, '')

/* ——— Pictogrammes de la série (carré de 48 unités, traits dans l'ordre de la main) ——— */

const circle = (cx: number, cy: number, r: number) => `M${cx + r} ${cy}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
const DENT = 'M15 7C8 7 5 13 6.5 20C8 27 11 30 12 38C13 45 18 45 19 38C20 33 21.5 30 24 30C26.5 30 28 33 29 38C30 45 35 45 36 38C37 30 40 27 41.5 20C43 13 40 7 33 7C29 7 27 9.5 24 9.5C21 9.5 19 7 15 7Z'
const POMME = 'M24 15C19 10 7 11 7 23C7 35 15 45 24 41C33 45 41 35 41 23C41 11 29 10 24 15Z'
const GELULE = 'M16 15H32A9 9 0 0 1 32 33H16A9 9 0 0 1 16 15Z'

interface Dessin {
  s: string[]
  fill?: string
  thin?: number[]
}

const DESSINS = {
  lunettes: { s: [circle(13, 27, 9), circle(35, 27, 9), 'M22 26Q24 23 26 26', 'M4.5 24L2 15M43.5 24L46 15'], thin: [3] },
  dent: { s: [DENT], fill: DENT },
  seringue: { s: ['M10 19H34V31H10Z', 'M34 25H42M42 19V31', 'M10 25H3', 'M16 19v5M22 19v5M28 19v5'], fill: 'M10 19H34V31H10Z', thin: [3] },
  pomme: { s: [POMME, 'M24 15C24 11 25 7 28 4', 'M26 10C29 6 34 6 37 8C34 12 29 12 26 10Z'], fill: POMME, thin: [2] },
  gelule: { s: [GELULE, 'M24 15V33'], fill: GELULE },
  usine: { s: ['M2 44H46', 'M5 44V26L15 20V26L25 20V26L35 20V44', 'M35 44V8H42V44', 'M10 32h5v5h-5zM21 32h5v5h-5z'], thin: [3] },
  hopital: { s: ['M2 45H46', 'M7 45V12H41V45', 'M19 45V35H29V45', 'M24 17V29M18 23H30'], fill: 'M7 45V12H41V45Z' },
  paquet: { s: ['M9 14H39V45H9Z', 'M9 14L14 5H34L39 14'], fill: 'M9 14H39V45H9Z' },
} satisfies Record<string, Dessin>

type DessinName = keyof typeof DESSINS

/** Un pictogramme de la série, placé comme Picto : (x, y) coin haut gauche, « size » son côté */
function Trait({ n, x, y, size = 48, t0 = 0, kept, tone, w = 1 }: { n: DessinName; x: number; y: number; size?: number; t0?: number; kept?: boolean; tone?: Tone; w?: number }) {
  const d: Dessin = DESSINS[n]
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
        <Ink key={i} d={path} t0={t0 + i * 200} dur={i === 0 ? 520 : 380} kept={still} class={d.thin?.includes(i) ? 'vc-thin' : undefined} />
      ))}
    </g>
  )
}

/** Un pictogramme de la série avec son étiquette dessous ; (cx, y) : le milieu de son haut */
function Legende({ n, cx, y, size = 56, label, shown = true, t0 = 0, tone, max = 12 }: { n: PictoName | DessinName; cx: number; y: number; size?: number; label?: string | null; shown?: boolean; t0?: number; tone?: Tone; max?: number }) {
  if (!shown) return null
  return (
    <>
      {n in DESSINS ? (
        <Trait n={n as DessinName} x={cx - size / 2} y={y} size={size} t0={t0} tone={tone} />
      ) : (
        <Picto n={n as PictoName} x={cx - size / 2} y={y} size={size} t0={t0} tone={tone} />
      )}
      {label ? <Txt x={cx} y={y + size + 18} text={label} max={max} size={14} t0={t0 + 300} /> : null}
    </>
  )
}

/* ——— Schémas de la série ——— */

interface Ligne {
  label: string
  value: number
  text: string
  shown: boolean
  tone?: Tone
}

/** Des grandeurs à la même échelle, depuis zéro, une par ligne : l'étiquette à gauche, la barre, la valeur */
function lignes({ items, max, y = 0, x0 = 132, pitch = 34, size = 20, room = 52, t0 = 0 }: { items: Ligne[]; max: number; y?: number; x0?: number; pitch?: number; size?: number; room?: number; t0?: number }) {
  const scale = (W - x0 - room) / max
  const el = (
    <>
      <Ink d={`M${x0} ${y - 6}V${y + (items.length - 1) * pitch + size + 6}`} t0={t0} dur={400} class="vc-soft" />
      {items.map((it, i) => {
        const top = y + i * pitch
        const d = t0 + 200 + i * 300
        const w = Math.max(1.5, it.value * scale)
        return (
          <g key={i}>
            <Txt x={x0 - 8} y={top + size * 0.74} text={it.label} anchor="end" size={14} t0={d} />
            {it.shown ? (
              <g class={it.tone === 'count' ? 'vc-count' : undefined}>
                <Fade t0={d + 300}>
                  <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={x0} y={top} width={w} height={size} />
                </Fade>
                <Ink d={`M${x0} ${top}H${x0 + w}V${top + size}H${x0}`} t0={d} dur={600} />
                <Txt x={x0 + w + 7} y={top + size * 0.8} text={it.text} anchor="start" size={18} big t0={d + 400} />
              </g>
            ) : null}
          </g>
        )
      })}
    </>
  )
  return { el, h: y + (items.length - 1) * pitch + size + 8 }
}

/** Des grandeurs à la même échelle, depuis zéro, l'étiquette au-dessus de chaque barre (étiquettes longues) */
function rangees({ items, max, y = 0, size = 18, gap = 14, room = 60, labelMax = 34, t0 = 0 }: { items: Ligne[]; max: number; y?: number; size?: number; gap?: number; room?: number; labelMax?: number; t0?: number }) {
  const x0 = 4
  const scale = (W - x0 - room) / max
  let cy = y
  const rows = items.map(it => {
    const lines = wrap(it.label, labelMax).length
    const top = cy + lines * 16 + 4
    cy = top + size + gap
    return { it, top }
  })
  const el = (
    <>
      {rows.map(({ it, top }, i) => {
        const d = t0 + i * 350
        const w = Math.max(1.5, it.value * scale)
        return (
          <g key={i}>
            <Txt x={x0} y={top - 7} text={it.label} max={labelMax} up anchor="start" size={14} t0={d} />
            {it.shown ? (
              <g class={it.tone === 'count' ? 'vc-count' : undefined}>
                <Fade t0={d + 300}>
                  <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={x0} y={top} width={w} height={size} />
                </Fade>
                <Ink d={`M${x0} ${top}H${x0 + w}V${top + size}H${x0}Z`} t0={d} dur={600} />
                <Txt x={x0 + w + 8} y={top + size * 0.8} text={it.text} anchor="start" size={18} big t0={d + 400} />
              </g>
            ) : null}
          </g>
        )
      })}
    </>
  )
  return { el, h: cy - gap }
}

/** Cent cases en dix rangées ; « part » d'entre elles comptées depuis la fin, la dernière en partie (3,4 : trois
 *  cases pleines et quatre dixièmes d'une autre) */
function Grille({ x, y, part, shown, t0 = 0, cell = 8, gap = 2.4 }: { x: number; y: number; part: number; shown: boolean; t0?: number; cell?: number; gap?: number }) {
  const pos = (i: number) => [x + (i % 10) * (cell + gap), y + Math.floor(i / 10) * (cell + gap)] as const
  const sq = (i: number) => {
    const [a, b] = pos(i)
    return `M${a.toFixed(1)} ${b.toFixed(1)}h${cell}v${cell}h${-cell}z`
  }
  const full = Math.min(100, Math.floor(part))
  const frac = part - full
  const counted = range(full).map(k => 99 - k)
  let d = counted.map(sq).join('')
  if (frac > 0.01 && full < 100) {
    const [a, b] = pos(99 - full)
    const fw = cell * frac
    d += `M${(a + cell - fw).toFixed(1)} ${b.toFixed(1)}h${fw.toFixed(1)}v${cell}h${(-fw).toFixed(1)}z`
  }
  return (
    <>
      <Ink d={range(100).map(sq).join('')} t0={t0} dur={800} class="vc-thin vc-soft" />
      {shown ? (
        <Fade t0={t0 + 700} class="vc-count">
          <path class="vc-solid-count" d={d} />
        </Fade>
      ) : null}
    </>
  )
}

/** Hauteur d'une grille de cent cases */
const grilleH = (cell = 8, gap = 2.4) => 10 * cell + 9 * gap

/* ——— Communs ——— */

/** Sans médecin traitant : « plus d'un adulte sur 10 », dix silhouettes, chacune avec sa croix de soin ; celle
 *  qui n'a pas de médecin passe au bleu bille, sa croix en pointillé */
function sansMedecin(p: P) {
  const cue = cuesOf(p).find(c => ratioOf(c.text))
  const r = ratioOf(cue?.text)
  if (!cue || !r || r.n > 12) return null
  const cols = r.n > 6 ? Math.ceil(r.n / 2) : r.n
  const top = 20
  const { cells, h } = rangCells({ n: r.n, cols, max: 40, gap: 24, y: top })
  const missing = range(r.k).map(i => r.n - 1 - i)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={top + h + 4}>
        <Rang n={r.n} picto="personne" cols={cols} max={40} gap={24} y={top} count={missing} shown={cue.shown} t0={300} stagger={90} />
        {cells.map((c, i) => (
          <Picto key={i} n="soin" x={c.x + c.size / 2 - 8} y={c.y - 19} size={16} tone={cue.shown && missing.includes(i) ? 'ghost' : undefined} t0={700 + i * 90} w={0.8} />
        ))}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Un disque (un tout), sa part comptée au bleu bille, et ce qu'elle désigne écrit à droite, relié à la part */
function part(pct: { text: string; shown: boolean } | null | undefined, legend: (string | null | undefined)[], extra?: JSX.Element | null) {
  const v = (num(pct?.text) ?? 0) / 100
  if (!pct || !v) return null
  const tip = partPoint(84, 84, 56, v)
  const lines = legend.filter((l): l is string => !!l)
  return (
    <Art h={170}>
      <Disque cx={84} cy={84} r={78} part={v} shown={pct.shown} t0={300} />
      {pct.shown && lines.length ? (
        <>
          <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L178 ${tip.y < 60 ? 30 : 112}`} t0={600} dur={400} class="vc-count vc-thin" />
          {lines.map((l, i) => (
            <Txt key={i} x={182} y={(tip.y < 60 ? 34 : 116) + i * 22} text={l} max={14} size={15} anchor="start" tone="count" t0={800 + i * 300} />
          ))}
        </>
      ) : null}
      {extra}
    </Art>
  )
}

/** Une question finale : des pictogrammes en rang, un point d'interrogation, puis la question dite */
function finale(p: P, list: (PictoName | DessinName)[]) {
  const gap = 12
  const size = Math.min(54, (W - 70 - gap * list.length) / list.length)
  return (
    <Seg kind="ask">
      <Art h={96}>
        {list.map((n, i) =>
          n in DESSINS ? (
            <Trait key={n} n={n as DessinName} x={6 + i * (size + gap)} y={24} size={size} t0={100 + i * 300} />
          ) : (
            <Picto key={n} n={n as PictoName} x={6 + i * (size + gap)} y={24} size={size} t0={100 + i * 300} />
          ),
        )}
        <Ask x={12 + list.length * (size + gap)} y={12} h={72} t0={300 + list.length * 300} />
      </Art>
      <Question p={p} />
    </Seg>
  )
}

/* ——— Introduction ——— */

/** 01 « Qui vous soigne, et qui paie ? » : vous, malade ; une croix de soin et un porte-monnaie en question */
const intro01: Board = p => {
  const [a, b] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={156}>
        <Ink d="M10 150H290" t0={100} dur={700} class="vc-soft" />
        <Picto n="personne" x={14} y={66} size={86} t0={250} />
        <Picto n="thermometre" x={88} y={96} size={52} t0={700} />
        {a?.shown ? (
          <>
            <Arrow x1={140} y1={92} x2={170} y2={50} dash t0={0} />
            <Picto n="soin" x={176} y={8} size={50} t0={200} />
          </>
        ) : null}
        {b?.shown ? (
          <>
            <Arrow x1={146} y1={120} x2={176} y2={120} dash t0={0} />
            <Picto n="portemonnaie" x={180} y={92} size={54} t0={200} />
          </>
        ) : null}
        <Ask x={250} y={40} h={72} t0={1400} />
      </Art>
    </Seg>
  )
}

/** 02 6,3 millions sans médecin traitant : plus d'un adulte sur 10 */
const intro02: Board = p => sansMedecin(p)

/** 03 Ce qui reste à payer : 9,7 % des dépenses de santé, la part payée par vous, 495 euros par habitant */
const intro03: Board = p => {
  const [pct, eur] = cuesOf(p)
  const vous = word(p, /par vous/)
  const hab = word(p, /\d+[\s\u00a0]euros par habitant/)
  const art = part(pct, [vous?.text, eur?.shown ? hab?.text : null])
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 04 Le grand âge : 31,1 milliards d'argent public ; un fauteuil, une pile de pièces */
const intro04: Board = p => {
  const cue = cueOf(p, 0)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        <Ink d="M10 120H290" t0={0} dur={600} class="vc-soft" />
        <Picto n="fauteuil" x={40} y={16} size={104} t0={200} />
        <Picto n="pieces" x={176} y={38} size={80} t0={900} tone={cue?.shown ? 'count' : undefined} />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 La prévention : 9,2 milliards, sans compter une partie faite en consultation (une croix en pointillé) */
const intro05: Board = p => {
  const cue = cueOf(p, 0)
  const cons = word(p, /en consultation/)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={134}>
        <Ink d="M10 130H290" t0={0} dur={600} class="vc-soft" />
        <Picto n="parapluie" x={14} y={0} size={96} t0={200} />
        <Picto n="personne" x={60} y={86} size={44} t0={700} />
        <Picto n="pieces" x={126} y={52} size={70} t0={1000} tone={cue?.shown ? 'count' : undefined} />
        {cons?.shown ? (
          <>
            <Picto n="soin" x={228} y={38} size={44} tone="ghost" />
            <Txt x={250} y={104} text={cons.text} max={12} size={14} tone="soft" />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** Les quatre questions du thème, chacune avec son pictogramme (dans l'ordre des vidéos) */
const QUESTIONS: PictoName[] = ['soin', 'portemonnaie', 'fauteuil', 'parapluie']

/** 06 Les quatre questions, chacune quand la voix la pose */
const intro06: Board = p => {
  const qs = sentencesOf(p.segment.say).filter(s => /\?$/.test(s))
  if (qs.length < 2) return null
  return (
    <Seg kind="ask">
      <Panel
        cols={2}
        items={qs.map((q, i) => ({
          picto: QUESTIONS[i] ?? 'document',
          text: q,
          shown: heard(p, q.split(' ').slice(0, 2).join(' ')),
          cues: cuesOf(p),
        }))}
      />
    </Seg>
  )
}

/** Le pictogramme de chaque approfondissement, pour le sommaire (le même que sa question dans l'introduction) */
const CHAPITRES: Record<string, PictoName> = {
  'sante-acces': 'soin',
  'sante-remboursements': 'portemonnaie',
  'sante-age': 'fauteuil',
  'sante-prevention': 'parapluie',
}

/** 07 Le sommaire de la série : comme Sommaire (mises.tsx), avec les pictogrammes des questions de l'introduction */
const intro07: Board = p => {
  const deep = SERIE.videos.filter(v => v.kind === 'deep')
  if (!deep.length) return null
  return (
    <Seg kind="end">
      <ol class="vc-chap">
        {deep.map((v, i) => (
          <li key={v.id} class="vc-chap-item vc-rise" style={at(200 + i * 450)}>
            <span class="vc-chap-n">{i + 1}</span>
            <Glyphe n={CHAPITRES[v.id] ?? 'document'} t0={p.still ? 0 : 350 + i * 450} />
            <span class="vc-chap-t">{v.short}</span>
          </li>
        ))}
      </ol>
      <Signature p={p} />
    </Seg>
  )
}

/* ——— Accès aux soins ——— */

/** 01 Chercher un médecin traitant près de chez vous : vous, un chemin, la porte d'un cabinet, une question */
const acces01: Board = p => (
  <Seg>
    <HeadCues p={p} ask />
    <Art h={152}>
      <Ink d="M8 148H292" t0={100} dur={700} class="vc-soft" />
      <Picto n="personne" x={10} y={70} size={76} t0={250} />
      <Arrow x1={92} y1={116} x2={148} y2={116} dash t0={900} />
      <Picto n="porte" x={154} y={52} size={96} t0={1100} />
      <Picto n="soin" x={188} y={22} size={28} t0={1500} w={0.9} />
      <Ask x={254} y={48} h={66} t0={1900} />
    </Art>
  </Seg>
)

/** 02 6,3 millions sans médecin traitant : plus d'un adulte sur 10 */
const acces02: Board = p => sansMedecin(p)

/** 03 L'accès aux généralistes : 4,3 fois plus pour les mieux pourvus que pour les moins pourvus, à la même échelle */
const acces03: Board = p => {
  const cue = cueOf(p, 0)
  const k = num(cue?.text)
  const hi = word(p, /les mieux pourvus/)
  const lo = word(p, /les moins pourvus/)
  if (!cue || !k || !hi || !lo) return null
  const n = cue.text.split(/[\s\u00a0]/)[0]!
  const g = barres({
    items: [
      { label: hi.text, value: k, text: `×\u00a0${n}`, shown: cue.shown, tone: 'count' },
      { label: lo.text, value: 1, text: '×\u00a01', shown: lo.shown },
    ],
    y: 4,
    size: 26,
    gap: 30,
    room: 72,
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

/** 04 Les premières installations : 2 130 en 2024, 2 810 en 2025 ; là où les médecins manquent le plus, la phrase */
const acces04: Board = p => {
  const [a, b, c] = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const va = num(a?.text)
  const vb = num(b?.text)
  if (!a || !b || !va || !vb || years.length < 2) return null
  const items = [
    { label: String(years[0]), value: va, text: a.text, shown: a.shown },
    { label: String(years[1]), value: vb, text: b.text, shown: b.shown },
  ].sort((x, y) => Number(x.label) - Number(y.label))
  const cols = colonnes({ items, x: 64, w: 172, y: 0, h: 118, t0: 100 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h}>{cols.el}</Art>
      {c ? <Note p={p} text={sentenceWith(p.segment.say, c.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** Une zone (un territoire) : son nom en tête, sa porte de cabinet, le sol */
function zone(cx: number, label: string | null | undefined, t0: number) {
  return (
    <>
      {label ? <Txt x={cx} y={16} text={label} max={18} size={14} tone="soft" t0={t0} /> : null}
      <Ink d={`M${cx - 68} 124H${cx + 68}`} t0={t0} dur={500} class="vc-soft" />
      <Picto n="porte" x={cx - 30} y={64} size={62} t0={t0 + 200} />
      <Picto n="soin" x={cx - 9} y={44} size={18} t0={t0 + 500} w={0.8} />
    </>
  )
}

/** 05 L'autorisation de s'installer (texte de l'Assemblée) : de droit là où les médecins manquent ; ailleurs, au
 *  départ d'un médecin */
const acces05: Board = p => {
  const [, droit, depart] = cuesOf(p)
  const manque = word(p, /là où les médecins manquent/)
  const ailleurs = word(p, /ailleurs/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={184}>
        <Fade class="vc-dash vc-soft">
          <path d="M150 4V178" />
        </Fade>
        {zone(75, manque?.text, 100)}
        {zone(225, ailleurs?.text, 300)}
        {droit?.shown ? (
          <>
            <Picto n="personne" x={8} y={86} size={40} tone="count" t0={0} />
            <Arrow x1={30} y1={140} x2={52} y2={140} tone="count" t0={200} />
            <Txt x={75} y={170} text={droit.text} size={16} tone="count" t0={300} />
          </>
        ) : null}
        {depart?.shown ? (
          <>
            <Picto n="personne" x={258} y={86} size={40} tone="ghost" />
            <Arrow x1={266} y1={140} x2={292} y2={140} dash t0={100} />
            <Picto n="personne" x={156} y={86} size={40} tone="count" t0={300} />
            <Arrow x1={162} y1={140} x2={186} y2={140} tone="count" t0={500} />
            <Txt x={225} y={164} text={depart.text} max={14} size={15} tone="count" t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 L'engagement (texte de la commission du Sénat) : qui s'installe là où les médecins sont nombreux exerce aussi,
 *  à temps partiel, là où ils manquent */
const acces06: Board = p => {
  const [, partiel] = cuesOf(p)
  const nombreux = word(p, /là où les médecins sont nombreux/)
  const manquent = word(p, /là où ils manquent/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={196}>
        <Fade class="vc-dash vc-soft">
          <path d="M150 4V126" />
        </Fade>
        {nombreux ? <Txt x={75} y={16} text={nombreux.text} max={18} size={14} tone="soft" t0={100} /> : null}
        {manquent ? <Txt x={225} y={16} text={manquent.text} max={18} size={14} tone="soft" t0={300} /> : null}
        <Ink d="M8 120H142M158 120H292" t0={200} dur={600} class="vc-soft" />
        {[14, 52, 90].map((x, i) => (
          <Picto key={x} n="personne" x={x} y={78} size={44} t0={400 + i * 150} tone={i === 2 && partiel?.shown ? 'count' : undefined} />
        ))}
        <Picto n="personne" x={203} y={78} size={44} tone="ghost" />
        {partiel?.shown ? (
          <>
            <Fade class="vc-count vc-dash">
              <path d="M118 74C140 34 200 34 222 70M222 70l-1.5-9.5M222 70l-9 -3.4" />
            </Fade>
            <Picto n="calendrier" x={203} y={130} size={44} tone="count" t0={300} />
            <Txt x={225} y={192} text={partiel.text} size={15} tone="count" t0={500} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 07 Les deux versions du texte, à égalité sur une balance : l'autorisation, l'engagement ; l'examen suspendu */
const acces07: Board = p => {
  const [susp, a, b] = cuesOf(p)
  const bal = balance({
    left: ['cle'],
    right: ['document'],
    labels: [a ? capital(a.text) : null, b ? capital(b.text) : null],
    shown: [!!a?.shown, !!b?.shown],
    t0: 200,
  })
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={bal.h}>
        {bal.el}
        {susp?.shown ? <Pause x={W / 2} y={128} r={17} t0={400} /> : null}
      </Art>
    </Seg>
  )
}

/** 08 L'hôpital public : 59,2 % de ce que verse l'Assurance maladie dépend de l'activité, un tarif par séjour ou acte */
const acces08: Board = p => {
  const [pct, tarif] = cuesOf(p)
  const hop = word(p, /hôpitaux publics/)
  const v = (num(pct?.text) ?? 0) / 100
  if (!pct || !v) return null
  const tip = partPoint(84, 84, 56, v)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={170}>
        <Disque cx={84} cy={84} r={78} part={v} shown={pct.shown} t0={300} />
        <Trait n="hopital" x={208} y={0} size={56} t0={600} />
        {hop ? <Txt x={236} y={76} text={hop.text} size={14} tone="soft" t0={900} /> : null}
        {tarif?.shown ? (
          <>
            <Ink d={`M${tip.x.toFixed(1)} ${tip.y.toFixed(1)}L178 112`} t0={0} dur={400} class="vc-count vc-thin" />
            <Txt x={182} y={116} text={tarif.text} max={14} size={15} anchor="start" tone="count" t0={200} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Les ruptures de médicaments : une gélule, l'autre en pointillé ; les deux causes, une usine et une hausse */
const acces09: Board = p => {
  const [n, prod, ventes] = cuesOf(p)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        <Trait n="gelule" x={-4} y={14} size={62} t0={200} />
        <Trait n="gelule" x={34} y={50} size={62} t0={500} tone={n?.shown ? 'ghost' : undefined} />
        <Legende n="usine" cx={162} y={4} size={60} label={prod?.text} shown={!!prod?.shown} />
        <Legende n="hausse" cx={252} y={4} size={60} label={ventes?.text} shown={!!ventes?.shown} tone="count" />
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 10 « Médecins, hôpital, médicaments : quelle priorité ? » */
const acces10: Board = p => finale(p, ['soin', 'hopital', 'gelule'])

/* ——— Remboursements ——— */

/** 01 Une consultation, des lunettes, des soins dentaires : qui paie la facture ? */
const remb01: Board = p => {
  const items: [RegExp, PictoName | DessinName, number][] = [
    [/Une consultation/, 'soin', 46],
    [/des lunettes/, 'lunettes', 128],
    [/des soins dentaires/, 'dent', 210],
  ]
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={118}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w ? <Legende key={n} n={n} cx={cx} y={6} size={56} label={sans(w.text)} shown={w.shown} t0={i * 80} /> : null
        })}
        <Ask x={256} y={8} h={60} t0={600} />
      </Art>
    </Seg>
  )
}

/** Les trois payeurs, dans l'ordre où la voix les dit */
const PAYEURS: PictoName[] = ['monument', 'parapluie', 'personne']

/** 02 Payés à trois : la Sécurité sociale, une complémentaire santé, et vous ; trois flèches de même taille */
const remb02: Board = p => {
  const cues = cuesOf(p)
  if (cues.length < 3) return null
  return (
    <Seg>
      <Art h={206}>
        <Picto n="document" x={122} y={0} size={56} t0={100} />
        {cues.map((c, i) => {
          const cx = 50 + i * 100
          return c.shown ? (
            <g key={i}>
              <Arrow x1={150} y1={62} x2={cx} y2={96} t0={0} dur={400} />
              <Legende n={PAYEURS[i]!} cx={cx} y={100} size={52} label={sans(c.text)} t0={200} />
            </g>
          ) : null
        })}
      </Art>
    </Seg>
  )
}

/** Les « n % de… » d'un passage, dans l'ordre : la valeur dite, et ce qu'elle mesure */
function pourcents(p: P, re: RegExp) {
  const say = plain(p.segment.say)
  return [...say.matchAll(re)].map(m => ({
    value: num(m[1]) ?? 0,
    text: p.segment.say.slice(m.index!, m.index! + m[1]!.length + 2),
    label: m[2]!.trim(),
    shown: heard(p, m[1]),
  }))
}

/** 03 Les complémentaires : 12,3 % des dépenses de santé, mais 69 % de l'optique, 48 % des appareils auditifs, 46 %
 *  du dentaire ; quatre barres sur 100 */
const remb03: Board = p => {
  const list = pourcents(p, /(\d+(?:,\d+)?) % (?:de l’|des |du |de la |de )([^,.:]+)/g)
  if (list.length < 2) return null
  const g = lignes({ items: list.map((l, i) => ({ ...l, tone: i === 0 ? 'count' : undefined })), max: 100, y: 6, x0: 134, pitch: 32, size: 18, room: 46, t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Ce que paient les ménages : 9,7 % en France, 14,8 % en moyenne dans l'Union européenne ; deux disques égaux */
const remb04: Board = p => {
  const [fr, eur, ue] = cuesOf(p)
  const a = num(fr?.text)
  const b = num(ue?.text)
  const lf = word(p, /France/)
  const lu = word(p, /Union européenne/)
  const hab = word(p, /\d+[\s\u00a0]euros par habitant/)
  if (!fr || !ue || !a || !b) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={196}>
        <Disque cx={75} cy={62} r={58} part={a / 100} shown={fr.shown} t0={200} />
        <Disque cx={225} cy={62} r={58} part={b / 100} shown={ue.shown} t0={600} />
        {fr.shown ? <Txt x={75} y={146} text={fr.text} size={20} big tone="count" t0={300} /> : null}
        {ue.shown ? <Txt x={225} y={146} text={ue.text} size={20} big tone="count" t0={300} /> : null}
        {lf ? <Txt x={75} y={166} text={lf.text} size={14} tone="soft" t0={400} /> : null}
        {lu?.shown ? <Txt x={225} y={166} text={lu.text} size={14} tone="soft" t0={0} /> : null}
        {eur?.shown && hab ? <Txt x={75} y={188} text={hab.text} size={14} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 05 L'employeur privé paie au moins la moitié de la complémentaire de ses salariés */
const remb05: Board = p => {
  const cue = cueOf(p, 0)
  const emp = word(p, /employeur/)
  const sal = word(p, /salariés/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={170}>
        <Picto n="parapluie" x={122} y={0} size={56} t0={100} />
        <Disque cx={150} cy={106} r={40} part={0.5} shown={!!cue?.shown} t0={400} />
        <Picto n="personne" x={14} y={80} size={56} t0={700} />
        {sal ? <Txt x={42} y={160} text={sal.text} size={15} t0={900} /> : null}
        <Picto n="mallette" x={228} y={82} size={54} t0={900} />
        {emp ? <Txt x={255} y={160} text={emp.text} size={15} t0={1100} /> : null}
        {cue?.shown ? <Arrow x1={196} y1={106} x2={222} y2={106} tone="count" t0={300} /> : null}
      </Art>
    </Seg>
  )
}

/** 06 Les contrats en 2023 : d'entreprise ou de la fonction publique, individuels, complémentaire santé solidaire ;
 *  trois barres sur 100 */
const remb06: Board = p => {
  const list = pourcents(p, /(\d+(?:,\d+)?) % (?:de la population avait )?([^,.]+)/g).map(l => ({ ...l, label: capital(sans(l.label)) }))
  if (list.length < 2) return null
  const g = rangees({ items: list, max: 100, y: 0, size: 18, gap: 12, room: 64, labelMax: 30, t0: 200 })
  return (
    <Seg>
      <Art h={g.h + 4}>{g.el}</Art>
    </Seg>
  )
}

/** 07 Sans complémentaire : 3,4 % de la population, 7 % des personnes sous le seuil de pauvreté ; deux grilles */
const remb07: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const pop = word(p, /de la population/)
  const pauv = word(p, /sous le seuil de pauvreté/)
  if (!a || !b || !va || !vb) return null
  const gh = grilleH()
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={30 + gh + 46}>
        <Txt x={75} y={20} text={a.text} size={20} big tone="count" t0={100} />
        {b.shown ? <Txt x={225} y={20} text={b.text} size={20} big tone="count" t0={100} /> : null}
        <Grille x={24} y={28} part={va} shown={a.shown} t0={200} />
        <Grille x={174} y={28} part={vb} shown={b.shown} t0={500} />
        {pop ? <Txt x={75} y={28 + gh + 20} text={sans(pop.text)} max={16} size={14} t0={300} /> : null}
        {pauv?.shown ? <Txt x={225} y={28 + gh + 20} text={pauv.text} max={16} size={14} t0={200} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Les frais de gestion : 17,6 milliards, dont 9,2 pour les complémentaires, 7,2 pour la Sécurité sociale ; une
 *  barre à l'échelle, le reste (ministère et agences) en pointillé */
const remb08: Board = p => {
  const [tot, a, b] = cuesOf(p)
  const vt = num(tot?.text)
  const va = num(a?.text)
  const vb = num(b?.text)
  const comp = said(p, /les complémentaires/)
  const secu = said(p, /la Sécurité sociale/)
  if (!tot || !a || !b || !vt || !va || !vb || va + vb > vt) return null
  const x0 = 12
  const L = 276
  const k = L / vt
  const xa = x0 + va * k
  const xb = xa + vb * k
  const top = 46
  const h = 34
  const box = (x1: number, x2: number) => `M${x1.toFixed(1)} ${top}H${x2.toFixed(1)}V${top + h}H${x1.toFixed(1)}Z`
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        {tot.shown ? (
          <>
            <Brace x1={x0} y1={top - 6} x2={x0 + L} y2={top - 6} side={-1} t0={0} />
            <Txt x={W / 2} y={18} text={tot.text} size={18} big t0={300} />
          </>
        ) : null}
        <Fade class="vc-ghost">
          <path d={box(xb, x0 + L)} />
        </Fade>
        {a.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint" x={x0} y={top} width={xa - x0} height={h} />
            </Fade>
            <Ink d={box(x0, xa)} t0={0} dur={600} />
            <Txt x={(x0 + xa) / 2} y={top + 24} text={num(a.text)!.toLocaleString('fr-FR')} size={20} big t0={400} />
            {comp ? <Txt x={(x0 + xa) / 2} y={top + h + 22} text={sans(comp)} size={14} t0={500} /> : null}
          </>
        ) : null}
        {b.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint" x={xa} y={top} width={xb - xa} height={h} />
            </Fade>
            <Ink d={box(xa, xb)} t0={0} dur={600} />
            <Txt x={(xa + xb) / 2} y={top + 24} text={num(b.text)!.toLocaleString('fr-FR')} size={20} big t0={400} />
            {secu ? <Txt x={(xa + xb) / 2} y={top + h + 22} text={sans(secu)} max={10} size={14} t0={500} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 Le scénario étudié en 2022 : vers la Sécurité sociale glissent le reste du tarif (la part qu'elle laisse
 *  aujourd'hui), puis l'optique, le dentaire, l'audition */
const remb09: Board = p => {
  const [, tarif] = cuesOf(p)
  const secu = word(p, /[Ll]a Sécurité sociale/)
  const soins = word(p, /optique/)
  return (
    <Seg>
      <HeadCues p={p} only={[0]} />
      <Art h={166}>
        <Legende n="monument" cx={58} y={30} size={80} label={secu ? sans(secu.text) : null} max={10} t0={100} />
        {tarif?.shown ? (
          <>
            <Picto n="piece" x={198} y={4} size={44} tone="count" t0={0} />
            <Txt x={220} y={66} text={tarif.text} max={18} size={14} tone="count" t0={200} />
            <Arrow x1={190} y1={30} x2={118} y2={56} tone="count" t0={400} />
          </>
        ) : null}
        {soins?.shown ? (
          <>
            <Trait n="lunettes" x={150} y={102} size={42} t0={0} />
            <Trait n="dent" x={200} y={102} size={42} t0={200} />
            <Picto n="bruit" x={248} y={102} size={42} t0={400} />
            <Arrow x1={144} y1={124} x2={118} y2={108} t0={600} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 10 Selon ce chiffrage : des dépenses publiques en plus, des frais de gestion en moins ; deux effets de même taille */
const remb10: Board = p => {
  const [a, b] = cuesOf(p)
  const pub = word(p, /\d+(?:,\d+)?[\s\u00a0]milliards d’euros de dépenses publiques en plus/)
  const ges = word(p, /\d+(?:,\d+)?[\s\u00a0]milliards de frais de gestion en moins/)
  if (!pub || !ges) return null
  const ef = effets({
    items: [
      { picto: 'pieces', dir: 'hausse', text: pub.text, shown: !!a?.shown },
      { picto: 'document', dir: 'baisse', text: ges.text, shown: !!b?.shown },
    ],
    x: 6,
    y: 4,
    w: 294,
    row: 70,
    t0: 200,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={ef.h + 10}>{ef.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 11 « Qui doit payer quoi ? » : les trois payeurs en rang (Sécurité sociale, complémentaire, vous), la question */
const remb11: Board = p => finale(p, PAYEURS)

/* ——— Grand âge ——— */

/** 01 Où accompagner un proche âgé : chez lui, ou en établissement ? */
const age01: Board = p => {
  const [home, inst] = cuesOf(p)
  return (
    <Seg>
      <HeadCues p={p} ask />
      <Art h={124}>
        <Ink d="M8 118H292" t0={0} dur={600} class="vc-soft" />
        <Picto n="fauteuil" x={116} y={50} size={68} t0={200} />
        {home?.shown ? (
          <>
            <Arrow x1={112} y1={86} x2={88} y2={86} dash t0={0} />
            <Picto n="maison" x={8} y={44} size={76} t0={200} />
          </>
        ) : null}
        {inst?.shown ? (
          <>
            <Arrow x1={188} y1={86} x2={212} y2={86} dash t0={0} />
            <Picto n="immeuble" x={216} y={44} size={76} t0={200} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 02 L'allocation personnalisée d'autonomie : 7,4 % des 60 ans ou plus la touchent */
const age02: Board = p => {
  const cue = cueOf(p, 0)
  const who = word(p, /des \d+[\s\u00a0]ans ou plus/)
  const art = part(
    cue,
    [who?.text],
    <Picto n="fauteuil" x={206} y={84} size={70} t0={900} />,
  )
  if (!art) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      {art}
      <Src p={p} />
    </Seg>
  )
}

/** 03 Les places en Ehpad : une barre à l'échelle, le public (près de la moitié), le privé non lucratif, le privé
 *  lucratif (valeurs du graphique de la fiche) */
const age03: Board = p => {
  const [, moitie] = cuesOf(p)
  const chart = chartOf(p.segment)
  if (!chart || chart.kind !== 'compare' || !moitie) return null
  const total = chart.items.reduce((s, i) => s + i.value, 0)
  const x0 = 10
  const L = 280
  const top = 44
  const h = 34
  let x = x0
  const segs = chart.items.map(it => {
    const s = { x1: x, x2: x + (it.value / total) * L, label: it.label }
    x = s.x2
    return s
  })
  const box = (a: number, b: number) => `M${a.toFixed(1)} ${top}H${b.toFixed(1)}V${top + h}H${a.toFixed(1)}Z`
  const first = segs[0]!
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={136}>
        {segs.map((s, i) => (
          <g key={i} class={i === 0 && moitie.shown ? 'vc-count' : undefined}>
            <Fade t0={300 + i * 250}>
              <rect class={i === 0 && moitie.shown ? 'vc-tint-count' : 'vc-tint'} x={s.x1} y={top} width={s.x2 - s.x1} height={h} />
            </Fade>
            <Ink d={box(s.x1, s.x2)} t0={100 + i * 250} dur={500} />
          </g>
        ))}
        {segs.map((s, i) => (
          <Txt key={i} x={(s.x1 + s.x2) / 2} y={top + h + 20} text={s.label} max={10} size={14} t0={500 + i * 250} />
        ))}
        {moitie.shown ? (
          <>
            <Brace x1={first.x1} y1={top - 6} x2={first.x2} y2={top - 6} side={-1} tone="count" t0={0} />
            <Txt x={(first.x1 + first.x2) / 2} y={18} text={moitie.text} size={16} tone="count" t0={300} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 04 Les résidents : 85 % en perte d'autonomie, comptés sur 100 */
const age04: Board = p => {
  const cue = cuesOf(p).find(c => /^\d+[\s\u00a0]%$/.test(c.text))
  const k = num(cue?.text)
  if (!cue || !k || k > 100) return null
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Sur100 p={p} kind="carre" low={k} caption={sentenceWith(p.segment.say, cue.text)} shown={cue.shown} />
      <Src p={p} />
    </Seg>
  )
}

/** 05 Deux explications possibles, à égalité : le « virage domiciliaire » ; un recul de la perte d'autonomie */
const age05: Board = p => {
  const [virage, recul] = cuesOf(p)
  const ou = word(p, /Ou d’un/)
  const quoted = virage && new RegExp(`«[\\s\\u00a0]*${virage.text}`).test(p.segment.say)
  return (
    <Seg>
      <Art h={162}>
        {virage?.shown ? (
          <>
            <Picto n="maison" x={36} y={10} size={78} t0={0} />
            <Txt x={75} y={124} text={quoted ? `«\u00a0${virage.text}\u00a0»` : virage.text} max={14} size={15} t0={300} />
          </>
        ) : null}
        {ou?.shown ? <Txt x={W / 2} y={62} text="ou" size={18} tone="soft" /> : null}
        {recul?.shown ? (
          <>
            <Picto n="personne" x={184} y={18} size={64} t0={0} />
            <Picto n="baisse" x={246} y={26} size={44} t0={300} w={1.2} />
            <Txt x={225} y={124} text={recul.text} max={18} size={15} t0={400} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 06 Les aides des départements : 56 % au domicile, 44 % à l'accueil en établissement ; une barre à l'échelle */
const age06: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const dom = word(p, /au domicile/)
  const eta = word(p, /en établissement/)
  if (!a || !b || !va || !vb) return null
  const x0 = 10
  const L = 280
  const xs = x0 + (va / (va + vb)) * L
  const top = 76
  const h = 34
  const box = (x1: number, x2: number) => `M${x1.toFixed(1)} ${top}H${x2.toFixed(1)}V${top + h}H${x1.toFixed(1)}Z`
  const ca = (x0 + xs) / 2
  const cb = (xs + x0 + L) / 2
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={160}>
        <Picto n="maison" x={ca - 32} y={4} size={64} t0={100} />
        <Picto n="immeuble" x={cb - 32} y={4} size={64} t0={300} />
        {a.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint" x={x0} y={top} width={xs - x0} height={h} />
            </Fade>
            <Ink d={box(x0, xs)} t0={0} dur={600} />
            <Txt x={ca} y={top + 25} text={a.text} size={20} big t0={400} />
            {dom ? <Txt x={ca} y={top + h + 22} text={dom.text} size={14} t0={500} /> : null}
          </>
        ) : null}
        {b.shown ? (
          <>
            <Fade t0={300}>
              <rect class="vc-tint" x={xs} y={top} width={x0 + L - xs} height={h} />
            </Fade>
            <Ink d={box(xs, x0 + L)} t0={0} dur={600} />
            <Txt x={cb} y={top + 25} text={b.text} size={20} big t0={400} />
            {eta ? <Txt x={cb} y={top + h + 22} text={eta.text} size={14} t0={500} /> : null}
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 07 Le personnel des Ehpad pour 100 places : 66 équivalents temps plein, dont 29 au chevet ; repère des 100 places */
const age07: Board = p => {
  const [a, b] = cuesOf(p)
  const va = num(a?.text)
  const vb = num(b?.text)
  const cent = word(p, /pour \d+[\s\u00a0]places/)
  const max = num(cent?.text)
  const tous = word(p, /tous métiers confondus/)
  const chevet = word(p, /au chevet/)
  if (!a || !b || !va || !vb || !cent || !max || va > max) return null
  const g = barres({
    items: [
      { label: tous?.text, value: va, text: String(va), shown: a.shown },
      { label: chevet?.text, value: vb, text: String(vb), shown: b.shown, tone: 'count' },
    ],
    max,
    y: 30,
    size: 24,
    gap: 30,
    room: 40,
    t0: 200,
  })
  const x100 = max * g.scale
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={30 + g.h + 8}>
        <Fade class="vc-dash vc-soft">
          <path d={`M${x100} 24V${30 + g.h + 6}`} />
        </Fade>
        <Txt x={x100 + 4} y={16} text={cent.text} anchor="end" size={14} tone="soft" t0={100} />
        {g.el}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 Les 31,1 milliards d'argent public : 79 % Sécurité sociale, 16 % départements, 5 % État ; trois barres sur 100 */
const age08: Board = p => {
  const list = pourcents(p, /(\d+(?:,\d+)?) % (?:viennent )?(?:de la |de l’|des |du |de )([^,.]+)/g)
  if (list.length < 2) return null
  const g = lignes({ items: list.map(l => ({ ...l, label: capital(l.label) })), max: 100, y: 6, x0: 124, pitch: 36, size: 22, room: 54, t0: 200 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={g.h + 4}>{g.el}</Art>
      <Src p={p} />
    </Seg>
  )
}

/** 09 « Où accompagner, avec combien de soignants, et quel financement ? » */
const age09: Board = p => finale(p, ['maison', 'immeuble', 'personne', 'pieces'])

/* ——— Prévention ——— */

/** 01 Mieux manger, respirer un air sain, se faire vacciner : trois pictogrammes, quand la voix les dit */
const prev01: Board = p => {
  const items: [RegExp, PictoName | DessinName, number][] = [
    [/Mieux manger/, 'pomme', 50],
    [/respirer un air sain/, 'fenetre', 150],
    [/se faire vacciner/, 'seringue', 250],
  ]
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={124}>
        {items.map(([re, n, cx], i) => {
          const w = word(p, re)
          return w ? <Legende key={n} n={n} cx={cx} y={4} size={60} label={w.text.toLowerCase()} shown={w.shown} t0={i * 80} /> : null
        })}
      </Art>
    </Seg>
  )
}

/** 02 9,2 milliards de prévention, 6,8 % de plus en un an, du fait de la vaccination */
const prev02: Board = p => {
  const [md, pct] = cuesOf(p)
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={118}>
        <Ink d="M8 114H292" t0={0} dur={600} class="vc-soft" />
        <Picto n="parapluie" x={4} y={0} size={88} t0={200} />
        <Picto n="pieces" x={96} y={46} size={64} t0={700} tone={md?.shown ? 'count' : undefined} />
        {pct?.shown ? (
          <>
            <Trait n="seringue" x={168} y={50} size={60} t0={0} />
            <Picto n="hausse" x={246} y={40} size={32} tone="count" t0={300} w={1.2} />
            <Txt x={262} y={98} text={`+${pct.text}`} size={20} big tone="count" t0={500} />
          </>
        ) : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 03 Le budget de l'assurance maladie, voté pour un an, chaque automne : trois années, un texte voté au début de
 *  chacune, un plafond à ne pas dépasser */
const prev03: Board = p => {
  const [an, automne] = cuesOf(p)
  const plafond = word(p, /à ne pas dépasser/)
  const f = frise({ y: 128, from: 0, to: 3, x0: 12, x1: 288, ticks: [0, 1, 2, 3], t0: 100, soft: true })
  return (
    <Seg>
      <HeadCues p={p} only={[1]} />
      <Art h={172}>
        {f.el}
        {[0, 1, 2].map(k => (
          <g key={k}>
            {plafond?.shown ? <Plafond x0={f.X(k) + 8} x1={f.X(k + 1) - 8} y={56} t0={k * 200} /> : null}
            {automne?.shown ? <Picto n="document" x={f.X(k) + 4} y={76} size={44} tone="count" t0={200 + k * 250} /> : null}
          </g>
        ))}
        {plafond?.shown ? <Txt x={W / 2} y={30} text={plafond.text} size={14} tone="soft" t0={300} /> : null}
        {an?.shown ? (
          <>
            <Brace x1={f.X(0)} y1={136} x2={f.X(1)} y2={136} t0={0} />
            <Txt x={(f.X(0) + f.X(1)) / 2} y={166} text={an.text} size={15} t0={300} />
          </>
        ) : null}
      </Art>
    </Seg>
  )
}

/** 04 Le Nutri-Score, de A à E, affiché à titre volontaire : un paquet qui le porte, un autre où il manque */
const prev04: Board = p => {
  const m = /de ([A-Z]) à ([A-Z])/.exec(p.segment.say)
  if (!m) return null
  const from = m[1]!.charCodeAt(0)
  const to = m[2]!.charCodeAt(0)
  if (to <= from || to - from > 6) return null
  const letters = range(to - from + 1).map(i => String.fromCharCode(from + i))
  const [scale, vol] = cuesOf(p)
  const cell = 19
  const echelle = (x: number, y: number, ghost: boolean, t0: number) => {
    const d = letters.map((_, i) => `M${x + i * cell} ${y}h${cell}v${cell + 4}h${-cell}z`).join('')
    return ghost ? (
      <Fade t0={t0} class="vc-ghost">
        <path class="vc-paper" d={d} />
        <path d={d} />
      </Fade>
    ) : (
      <>
        <Fade t0={t0}>
          <path class="vc-paper" d={d} />
        </Fade>
        <Ink d={d} t0={t0} dur={600} class="vc-thin" />
        {letters.map((l, i) => (
          <Txt key={l} x={x + i * cell + cell / 2} y={y + 17} text={l} size={15} t0={t0 + 300 + i * 100} />
        ))}
      </>
    )
  }
  const w = letters.length * cell
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={128}>
        <Ink d="M8 124H292" t0={0} dur={600} class="vc-soft" />
        <Trait n="paquet" x={30} y={0} size={128} t0={100} />
        <Trait n="paquet" x={160} y={0} size={128} t0={400} />
        {scale?.shown ? echelle(94 - w / 2, 76, false, 200) : null}
        {vol?.shown ? echelle(224 - w / 2, 76, true, 200) : null}
      </Art>
    </Seg>
  )
}

/** 05 1 377 entreprises engagées en juin 2024, contre 1 197 un an plus tôt ; la part de leurs marques, en phrase */
const prev05: Board = p => {
  const [now, before, pct] = cuesOf(p)
  const vNow = num(now?.text)
  const vBefore = num(before?.text)
  const tNow = word(p, /juin \d{4}/)
  const tBefore = word(p, /un an plus tôt/)
  if (!now || !before || !vNow || !vBefore || !tNow || !tBefore) return null
  const cols = colonnes({
    items: [
      { label: tBefore.text, value: vBefore, text: before.text, shown: before.shown },
      { label: tNow.text, value: vNow, text: now.text.replace(/[\s\u00a0]entreprises$/, ''), shown: now.shown },
    ],
    x: 64,
    w: 172,
    y: 0,
    h: 112,
    t0: 100,
  })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={cols.h}>{cols.el}</Art>
      {pct ? <Note p={p} text={sentenceWith(p.segment.say, pct.text)} /> : null}
      <Src p={p} />
    </Seg>
  )
}

/** 06 L'air intérieur des crèches et des écoles : l'aération évaluée chaque année (un capteur de CO₂), un plan
 *  d'actions */
const prev06: Board = p => {
  const [an, plan] = cuesOf(p)
  const co2 = word(p, /CO₂/)
  return (
    <Seg>
      <HeadCues p={p} />
      <Art h={170}>
        <Picto n="immeuble" x={0} y={40} size={100} t0={100} />
        {co2?.shown ? (
          <>
            <Ink d="M100 74H176V114H100Z" t0={0} dur={500} />
            <Ink d="M106 80H170V108H106Z" t0={300} dur={400} class="vc-thin vc-soft" />
            <Txt x={138} y={101} text={co2.text} size={18} big t0={500} />
            <Ink d="M88 94H100" t0={600} dur={200} class="vc-thin" />
          </>
        ) : null}
        {/* Les mots (« chaque année », « un plan d'actions ») sont déjà écrits en tête : ici, leurs seuls dessins */}
        <Legende n="calendrier" cx={236} y={14} size={56} shown={!!an?.shown} tone="count" />
        <Legende n="document" cx={236} y={96} size={56} shown={!!plan?.shown} />
      </Art>
    </Seg>
  )
}

/** 07 Près de 19 milliards par an : une estimation publiée en 2014, sur des données de 2003 à 2005 */
const prev07: Board = p => {
  const [, data] = cuesOf(p)
  const years = yearsOf(p.segment.say)
  const etude = word(p, /étude exploratoire/)
  const [y1, y2] = yearsOf(data?.text ?? '')
  const pub = years.find(y => y !== y1 && y !== y2)
  if (!data || !y1 || !y2 || !pub) return null
  const from = Math.min(y1, pub) - 1
  const to = Math.max(y2, pub) + 1
  const f = frise({ y: 92, from, to, x0: 16, x1: 284, ticks: range(to - from + 1).map(k => from + k), labels: [y1, y2, pub], t0: 100 })
  return (
    <Seg kind="fig">
      <Chiffre p={p} />
      <Art h={124}>
        {f.el}
        {data.shown ? (
          <Fade t0={0} class="vc-count">
            <rect class="vc-tint-count" x={f.X(y1)} y={74} width={f.X(y2) - f.X(y1)} height={18} />
            <path d={`M${f.X(y1)} 74H${f.X(y2)}V92H${f.X(y1)}Z`} />
          </Fade>
        ) : null}
        {data.shown ? <Txt x={f.X(y1)} y={62} text={data.text} size={15} anchor="start" tone="count" t0={200} /> : null}
        <Picto n="drapeau" x={f.X(pub) - 11} y={92 - 43} size={46} t0={500} />
        {etude ? <Txt x={f.X(pub) + 12} y={34} text={etude.text} size={14} anchor="end" t0={700} /> : null}
      </Art>
      <Src p={p} />
    </Seg>
  )
}

/** 08 « Budgets, alimentation, air intérieur : quelle priorité pour la prévention ? » */
const prev08: Board = p => finale(p, ['calendrier', 'pomme', 'fenetre'])

/* ——— Le registre ——— */

export const SANTE: Record<string, Board> = {
  'sante-intro-01': intro01,
  'sante-intro-02': intro02,
  'sante-intro-03': intro03,
  'sante-intro-04': intro04,
  'sante-intro-05': intro05,
  'sante-intro-06': intro06,
  'sante-intro-07': intro07,
  'sante-acces-01': acces01,
  'sante-acces-02': acces02,
  'sante-acces-03': acces03,
  'sante-acces-04': acces04,
  'sante-acces-05': acces05,
  'sante-acces-06': acces06,
  'sante-acces-07': acces07,
  'sante-acces-08': acces08,
  'sante-acces-09': acces09,
  'sante-acces-10': acces10,
  'sante-remboursements-01': remb01,
  'sante-remboursements-02': remb02,
  'sante-remboursements-03': remb03,
  'sante-remboursements-04': remb04,
  'sante-remboursements-05': remb05,
  'sante-remboursements-06': remb06,
  'sante-remboursements-07': remb07,
  'sante-remboursements-08': remb08,
  'sante-remboursements-09': remb09,
  'sante-remboursements-10': remb10,
  'sante-remboursements-11': remb11,
  'sante-age-01': age01,
  'sante-age-02': age02,
  'sante-age-03': age03,
  'sante-age-04': age04,
  'sante-age-05': age05,
  'sante-age-06': age06,
  'sante-age-07': age07,
  'sante-age-08': age08,
  'sante-age-09': age09,
  'sante-prevention-01': prev01,
  'sante-prevention-02': prev02,
  'sante-prevention-03': prev03,
  'sante-prevention-04': prev04,
  'sante-prevention-05': prev05,
  'sante-prevention-06': prev06,
  'sante-prevention-07': prev07,
  'sante-prevention-08': prev08,
}
