// Piste C, les schémas : une grammaire de dessins paramétrables, communs à tous les thèmes. Chacun dessine
// sur la feuille de 300 de large (encre.tsx) à partir de quelques nombres et mots tirés du script.
//
//   Rang       n pictogrammes, dont certains comptés (bleu bille) ou manquants (pointillé) : « 1 sur 7 »
//   Cent       cent unités en dix rangées, dont certaines comptées ou retirées : « 30 euros sur 100 »
//   barres     grandeurs comparées à la même échelle, à l'horizontale, depuis zéro
//   colonnes   une grandeur à plusieurs dates, depuis zéro ; une projection en pointillé
//   Disque     une part d'un tout
//   frise      une ligne du temps ou des âges, graduée, où l'on pose barrière, drapeau, pause…
//   balance    deux plateaux de même taille, fléau à l'horizontale : les deux côtés d'un débat
//   manettes   des curseurs, un par levier ; celui dont on parle bouge, au bleu bille
//   effets     ce qu'entraîne un choix : un pictogramme, un sens (hausse, baisse), une phrase
//   Cases      une grille de cases (trimestres, risques, jours), certaines comptées ou effacées
//
// Grammaire commune : l'encre d'imprimerie dessine, le gris de lecture habille (axes, repères), le bleu bille
// compte ce dont parle le passage, le pointillé dit ce qui manque, a disparu ou n'est que projeté. Rien n'est
// grossi d'un côté d'une comparaison : les grandeurs partent de zéro, à la même échelle, et un écart qu'on ne
// peut pas dessiner à l'échelle se signale (coupure d'axe) au lieu d'être exagéré.

import type { ComponentChildren, JSX } from 'preact'
import { Fade, Ink, Txt, W, at, type Tone } from './encre'
import { Picto, type PictoName } from './pictos'

/* ——— Rang ——— */

export interface RangOpts {
  n: number
  /** Le même pictogramme pour tous, ou un par place */
  picto: PictoName | ((i: number) => PictoName)
  /** Places comptées (bleu bille), quand « shown » */
  count?: number[]
  /** Places manquantes (pointillé) */
  ghost?: number[]
  /** Aplat léger dans les pictogrammes non comptés (fenêtres allumées) */
  filled?: boolean
  /** Le compte est fait (la voix l'a dit) */
  shown?: boolean
  x?: number
  y?: number
  w?: number
  /** Côté maximal d'un pictogramme, écart, colonnes */
  max?: number
  gap?: number
  cols?: number
  t0?: number
  stagger?: number
  kept?: boolean
}

export interface Cell {
  x: number
  y: number
  size: number
}

/** Les places d'un rang : rangées centrées, de gauche à droite */
export function rangCells({ n, x = 0, y = 0, w = W, max = 56, gap = 10, cols }: Omit<RangOpts, 'picto'>): { cells: Cell[]; h: number } {
  const c = Math.max(1, cols ?? Math.min(n, 10))
  const size = Math.min(max, (w - gap * (c - 1)) / c)
  const rows = Math.ceil(n / c)
  const cells = Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / c)
    const inRow = Math.min(c, n - row * c)
    const rowW = inRow * size + (inRow - 1) * gap
    return { x: x + (w - rowW) / 2 + (i - row * c) * (size + gap), y: y + row * (size + gap), size }
  })
  return { cells, h: rows * size + (rows - 1) * gap }
}

export function Rang(o: RangOpts) {
  const { cells } = rangCells(o)
  const { count = [], ghost = [], shown = true, t0 = 0, stagger = 90, kept } = o
  return (
    <>
      {cells.map((c, i) => {
        const n = typeof o.picto === 'function' ? o.picto(i) : o.picto
        const counted = shown && count.includes(i)
        return (
          <Picto
            key={i}
            n={n}
            x={c.x}
            y={c.y}
            size={c.size}
            t0={t0 + i * stagger}
            kept={kept}
            step={Math.min(160, 60 + c.size * 2)}
            tone={ghost.includes(i) ? 'ghost' : counted ? 'count' : undefined}
            filled={o.filled && !counted && !ghost.includes(i)}
            w={c.size < 30 ? 0.8 : 1}
          />
        )
      })}
    </>
  )
}

/* ——— Cent ——— */

export type UnitKind = 'piece' | 'maison' | 'carre' | 'porte'

function unitShape(kind: UnitKind, i: number) {
  const cx = 6 + (i % 10) * 12
  const cy = 6 + Math.floor(i / 10) * 12
  if (kind === 'piece') return `M${cx + 4.4} ${cy}a4.4 4.4 0 1 1-8.8 0a4.4 4.4 0 1 1 8.8 0`
  if (kind === 'maison') return `M${cx - 4.4} ${cy + 4.6}V${cy - 0.4}L${cx} ${cy - 4.8}L${cx + 4.4} ${cy - 0.4}V${cy + 4.6}Z`
  if (kind === 'porte') return `M${cx - 3.6} ${cy + 4.8}V${cy - 4.8}H${cx + 3.6}V${cy + 4.8}`
  return `M${cx - 4.2} ${cy - 4.2}h8.4v8.4h-8.4z`
}

/**
 * Cent unités en dix rangées. Les « high » dernières se comptent : les « low » dernières au bleu plein (sûr),
 * les autres au bleu clair (jusqu'à) ; ou, en mode « retrait », elles se retirent en pointillé.
 */
export function Cent({ kind, low, high = low, mode = 'count', shown = true, t0 = 0 }: { kind: UnitKind; low: number; high?: number; mode?: 'count' | 'retrait'; shown?: boolean; t0?: number }) {
  const last = 100 - high
  const sure = 100 - low
  const pick = (from: number, to: number) => Array.from({ length: Math.max(0, to - from) }, (_, k) => unitShape(kind, from + k)).join('')
  const rows = Array.from({ length: 10 }, (_, r) => pick(r * 10, Math.min((r + 1) * 10, shown ? last : 100)))
  return (
    <svg class="vc-svg" viewBox="-1 -1 122 122" aria-hidden="true">
      {rows.map((d, r) => (d ? <Ink key={r} d={d} t0={t0 + r * 70} dur={420} class="vc-unit" /> : null))}
      {shown ? (
        mode === 'retrait' ? (
          <Fade t0={t0 + 900} class="vc-ghost">
            <path d={pick(last, 100)} />
          </Fade>
        ) : (
          <Fade t0={t0 + 900}>
            {sure > last ? <path class="vc-unit-range" d={pick(last, sure)} /> : null}
            <path class="vc-unit-sure" d={pick(sure, 100)} />
          </Fade>
        )
      ) : null}
    </svg>
  )
}

/* ——— Barres ——— */

export interface Barre {
  /** Ce que mesure la barre, écrit au-dessus */
  label?: string
  value: number
  /** La valeur écrite au bout, telle que le script la dit */
  text?: string
  tone?: Tone
  /** Une rallonge hachurée, jusqu'à cette valeur (« en comptant la réversion ») */
  ext?: number
  /** La fin de la barre, à partir de cette valeur, en pointillé (ce qui sort, ce qui manque) */
  ghostFrom?: number
  /** La barre est là (la voix en a parlé) */
  shown?: boolean
}

export interface BarGeo {
  x0: number
  x1: number
  top: number
  bottom: number
}

/** Barres horizontales à la même échelle, depuis zéro ; « room » : place laissée à droite pour la valeur */
export function barres({
  items, x = 0, y = 0, w = W, max, size = 24, gap = 34, room = 84, t0 = 0, kept, labelSize = 15,
}: { items: Barre[]; x?: number; y?: number; w?: number; max?: number; size?: number; gap?: number; room?: number; t0?: number; kept?: boolean; labelSize?: number }) {
  const top = Math.max(...items.map(i => Math.max(i.value, i.ext ?? 0)), max ?? 0) || 1
  const scale = (w - room) / top
  const step = size + gap
  const geo: BarGeo[] = items.map((it, i) => {
    const b = y + i * step + (it.label ? labelSize + 6 : 0)
    return { x0: x, x1: x + it.value * scale, top: b, bottom: b + size }
  })
  const el = (
    <>
      {items.map((it, i) => {
        const g = geo[i]!
        if (it.shown === false) return null
        const d = t0 + i * 350
        const ghostX = it.ghostFrom !== undefined ? x + it.ghostFrom * scale : null
        // Le contour plein ; ouvert à droite quand la fin de la barre est en pointillé
        const solid = ghostX !== null ? `M${ghostX} ${g.top}H${g.x0}V${g.bottom}H${ghostX}` : `M${g.x0} ${g.top}H${g.x1}V${g.bottom}H${g.x0}Z`
        return (
          <g key={i} class={it.tone && it.tone !== 'ghost' ? `vc-${it.tone}` : undefined}>
            {it.label ? <Txt x={x + 6} y={g.top - 7} text={it.label} anchor="start" size={labelSize} t0={d} kept={kept} /> : null}
            <Fade t0={d + 300} kept={kept}>
              <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={g.x0} y={g.top} width={Math.max(0, (ghostX ?? g.x1) - g.x0)} height={size} />
            </Fade>
            <Ink d={solid} t0={d} dur={650} kept={kept} />
            {ghostX !== null ? (
              <Fade t0={d + 400} kept={kept} class="vc-ghost">
                <path d={`M${ghostX} ${g.top}H${g.x1}V${g.bottom}H${ghostX}V${g.top}`} />
              </Fade>
            ) : null}
            {it.ext !== undefined && it.ext > it.value ? (
              <Fade t0={0} kept={kept} class="vc-count">
                <rect class="vc-tint-count" x={g.x1} y={g.top} width={(it.ext - it.value) * scale} height={size} />
                <path d={`M${g.x1} ${g.top}H${x + it.ext * scale}V${g.bottom}H${g.x1}`} />
              </Fade>
            ) : null}
            {it.text ? (
              <Txt x={x + Math.max(it.value, it.ext ?? 0) * scale + 8} y={g.bottom - size * 0.18} text={it.text} anchor="start" size={20} big t0={d + 500} kept={kept} />
            ) : null}
          </g>
        )
      })}
    </>
  )
  return { el, geo, h: items.length * step - gap + (items[0]?.label ? labelSize + 6 : 0), scale }
}

/* ——— Colonnes ——— */

export interface Colonne {
  /** Sous la colonne : l'année */
  label: string
  value: number
  /** Au-dessus : la valeur telle que dite */
  text: string
  /** Projection : en pointillé */
  ghost?: boolean
  tone?: Tone
  shown?: boolean
}

/** Une grandeur à plusieurs dates : colonnes depuis zéro, la valeur au-dessus, la date dessous */
export function colonnes({ items, x = 30, w = 240, y = 0, h = 140, max, colW = 46, t0 = 0, kept }: { items: Colonne[]; x?: number; w?: number; y?: number; h?: number; max?: number; colW?: number; t0?: number; kept?: boolean }) {
  const base = y + h
  const top = Math.max(...items.map(i => i.value), max ?? 0) || 1
  const scale = (h - 34) / top
  const pitch = items.length > 1 ? (w - colW) / (items.length - 1) : 0
  const el = (
    <>
      <Ink d={`M${x - 14} ${base}H${x + w + 14}`} t0={t0} dur={500} kept={kept} class="vc-soft" />
      {items.map((it, i) => {
        if (it.shown === false) return null
        const cx = x + i * pitch
        const ht = it.value * scale
        const d = t0 + 200 + i * 300
        const box = `M${cx} ${base}V${base - ht}H${cx + colW}V${base}`
        return (
          <g key={i} class={it.tone ? `vc-${it.tone}` : undefined}>
            {it.ghost ? (
              <Fade t0={d} kept={kept} class="vc-ghost">
                <path d={box} />
              </Fade>
            ) : (
              <>
                <Fade t0={d + 250} kept={kept}>
                  <rect class={it.tone === 'count' ? 'vc-tint-count' : 'vc-tint'} x={cx} y={base - ht} width={colW} height={ht} />
                </Fade>
                <Ink d={box} t0={d} dur={600} kept={kept} />
              </>
            )}
            <Txt x={cx + colW / 2} y={base - ht - 9} text={it.text} size={22} big t0={d + 400} kept={kept} />
            <Txt x={cx + colW / 2} y={base + 21} text={it.label} size={15} t0={d + 200} kept={kept} tone="soft" />
          </g>
        )
      })}
    </>
  )
  return { el, h: h + 28 }
}

/* ——— Disque ——— */

/** Un disque, et sa part comptée au bleu bille depuis midi, dans le sens des aiguilles d'une montre */
export function Disque({ cx, cy, r, part, shown = true, t0 = 0, kept }: { cx: number; cy: number; r: number; part: number; shown?: boolean; t0?: number; kept?: boolean }) {
  const a = Math.min(0.9999, Math.max(0, part)) * 2 * Math.PI
  const ex = cx + r * Math.sin(a)
  const ey = cy - r * Math.cos(a)
  const slice = `M${cx} ${cy}V${cy - r}A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}Z`
  return (
    <>
      <Ink d={`M${cx} ${cy - r}a${r} ${r} 0 1 1 0 ${2 * r}a${r} ${r} 0 1 1 0 ${-2 * r}`} t0={t0} dur={900} kept={kept} />
      {shown ? (
        <Fade t0={kept ? 0 : t0 + 700} class="vc-count">
          <path class="vc-tint-count" d={slice} />
          <path d={slice} />
        </Fade>
      ) : null}
    </>
  )
}

/** Où pointe le milieu de la part d'un disque (pour y accrocher une étiquette) */
export function partPoint(cx: number, cy: number, r: number, part: number) {
  const a = part * Math.PI
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

/* ——— Frise ——— */

/** Une ligne du temps (ou des âges), de « from » à « to », graduée aux valeurs « ticks » */
export function frise({ x0 = 16, x1 = W - 16, y, from, to, ticks = [], labels = [], t0 = 0, kept, soft = false }: { x0?: number; x1?: number; y: number; from: number; to: number; ticks?: number[]; labels?: number[]; t0?: number; kept?: boolean; soft?: boolean }) {
  const X = (v: number) => x0 + ((v - from) / (to - from || 1)) * (x1 - x0)
  const el = (
    <>
      <Ink d={`M${x0} ${y}H${x1}`} t0={t0} dur={700} kept={kept} class={soft ? 'vc-soft' : undefined} />
      {ticks.length ? <Ink d={ticks.map(v => `M${X(v).toFixed(1)} ${y - 5}v10`).join('')} t0={t0 + 400} dur={400} kept={kept} class="vc-soft vc-thin" /> : null}
      {labels.map(v => (
        <Txt key={v} x={X(v)} y={y + 24} text={String(v)} size={14} tone="soft" t0={t0 + 500} kept={kept} />
      ))}
    </>
  )
  return { el, X }
}

/** Une barrière levante, baissée, posée sur une ligne ; (x, y) : le pied du poteau, le bras vers la gauche */
export function Barriere({ x, y, s = 1, t0 = 0, kept, tone }: { x: number; y: number; s?: number; t0?: number; kept?: boolean; tone?: Tone }) {
  return <Picto n="barriere" x={x - 38 * s} y={y - 45 * s} size={48 * s} t0={t0} kept={kept} tone={tone} />
}

/** Le signe « pause », posé comme un tampon rond ; (x, y) : son centre */
export function Pause({ x, y, r = 19, t0 = 0, kept }: { x: number; y: number; r?: number; t0?: number; kept?: boolean }) {
  const ring = `M${x + r} ${y}a${r} ${r} 0 1 1-${2 * r} 0a${r} ${r} 0 1 1 ${2 * r} 0`
  const b = r * 0.29
  const hh = r * 0.42
  return (
    <>
      <Fade t0={t0} kept={kept}>
        <path class="vc-paper" d={ring} />
      </Fade>
      <Ink d={ring} t0={t0} dur={600} kept={kept} />
      <Ink d={`M${x - b} ${y - hh}v${2 * hh}M${x + b} ${y - hh}v${2 * hh}`} t0={t0 + 500} dur={300} kept={kept} class="vc-bold" />
    </>
  )
}

/** Un plafond, au sens du dessin d'architecte : un trait fort hachuré dessus ; en pointillé s'il est à fixer */
export function Plafond({ x0, x1, y, t0 = 0, kept, dash, tone }: { x0: number; x1: number; y: number; t0?: number; kept?: boolean; dash?: boolean; tone?: Tone }) {
  let hatch = ''
  for (let x = x0 + 4; x <= x1 - 9; x += 13) hatch += `M${x} ${y}l9-10`
  return (
    <g class={tone ? `vc-${tone}` : undefined}>
      {dash ? (
        <Fade t0={t0} kept={kept} class="vc-dash">
          <path d={`M${x0} ${y}H${x1}`} />
        </Fade>
      ) : (
        <Ink d={`M${x0} ${y}H${x1}`} t0={t0} dur={700} kept={kept} class="vc-bold" />
      )}
      <Ink d={hatch} t0={t0 + 450} dur={500} kept={kept} class="vc-thin" />
    </g>
  )
}

/* ——— Balance ——— */

type Plateau = PictoName[] | ((cx: number, base: number) => JSX.Element)

/**
 * Une balance : deux plateaux de même taille, le fléau à l'horizontale (le dessin ne tranche pas). Sur chaque
 * plateau, des pictogrammes (ou un petit dessin), et dessous son étiquette, quand la voix la dit.
 */
export function balance({ y = 0, left, right, labels = [null, null], shown = [true, true], t0 = 0, kept }: { y?: number; left: Plateau; right: Plateau; labels?: [string | null, string | null]; shown?: [boolean, boolean]; t0?: number; kept?: boolean }) {
  const beam = y + 22
  const plate = y + 104
  const side = (cx: number, items: Plateau, i: 0 | 1) => {
    const d = t0 + 700 + i * 500
    const base = plate - 1
    const content =
      typeof items === 'function'
        ? items(cx, base)
        : items.map((n, k) => {
            const size = items.length > 1 ? 40 : 48
            const x = cx - (items.length * size + (items.length - 1) * 4) / 2 + k * (size + 4)
            return <Picto key={k} n={n} x={x} y={base - size} size={size} t0={d + k * 300} kept={kept} />
          })
    return (
      <g>
        <Ink d={`M${cx} ${beam}L${cx - 42} ${plate}M${cx} ${beam}L${cx + 42} ${plate}`} t0={t0 + 400} dur={500} kept={kept} class="vc-thin vc-soft" />
        <Ink d={`M${cx - 46} ${plate}Q${cx} ${plate + 20} ${cx + 46} ${plate}Z`} t0={t0 + 550} dur={500} kept={kept} />
        {shown[i] ? content : null}
        {labels[i] && shown[i] ? <Txt x={cx} y={plate + 40} text={labels[i]!} max={15} size={15} t0={kept ? 0 : d + 300} /> : null}
      </g>
    )
  }
  const lines = Math.max(...labels.map(l => (l ? Math.ceil(l.length / 15) : 0)))
  const el = (
    <>
      <Ink d={`M${W / 2} ${beam}V${y + 168}M${W / 2 - 30} ${y + 168}H${W / 2 + 30}`} t0={t0} dur={500} kept={kept} />
      <Ink d={`M66 ${beam}H${W - 66}`} t0={t0 + 250} dur={500} kept={kept} class="vc-bold" />
      <Ink d={`M${W / 2 - 7} ${beam - 3}L${W / 2} ${beam - 13}L${W / 2 + 7} ${beam - 3}Z`} t0={t0 + 300} dur={300} kept={kept} />
      {side(66, left, 0)}
      {side(W - 66, right, 1)}
    </>
  )
  return { el, h: Math.max(176, 128 + lines * 18) }
}

/* ——— Manettes ——— */

export interface Manette {
  label?: string
  picto?: PictoName
  /** Position du curseur, de 0 (en bas) à 1 (en haut) */
  pos: number
  /** Le curseur bouge jusque-là (au bleu bille) */
  to?: number
  shown?: boolean
}

/** Des leviers côte à côte : un pictogramme, une glissière, un curseur, une étiquette */
export function manettes({ items, x = 0, y = 0, w = W, h = 90, size = 40, t0 = 0, kept, labelMax = 12 }: { items: Manette[]; x?: number; y?: number; w?: number; h?: number; size?: number; t0?: number; kept?: boolean; labelMax?: number }) {
  const pitch = w / items.length
  const ys = y + (items.some(i => i.picto) ? size + 12 : 0)
  const ye = ys + h
  const el = (
    <>
      {items.map((it, i) => {
        if (it.shown === false) return null
        const cx = x + pitch * (i + 0.5)
        const d = t0 + i * 250
        const yk = (p: number) => ye - 8 - p * (h - 16)
        const moving = it.to !== undefined
        const knob = (p: number) => `M${cx - 14} ${yk(p) - 6}h28v12h-28z`
        return (
          <g key={i}>
            {it.picto ? <Picto n={it.picto} x={cx - size / 2} y={y} size={size} t0={d} kept={kept} tone={moving ? 'count' : undefined} /> : null}
            <Ink d={`M${cx} ${ys}V${ye}`} t0={d + 200} dur={450} kept={kept} class="vc-soft" />
            <Ink d={`M${cx - 6} ${ys}h12M${cx - 6} ${ye}h12`} t0={d + 300} dur={250} kept={kept} class="vc-soft vc-thin" />
            {moving ? (
              <g class="vc-count">
                <g class="vc-slide-y" style={{ '--from': `${yk(it.pos) - yk(it.to!)}px`, ...at(kept ? 0 : d + 500, 1100) }}>
                  <path class="vc-tint-count" d={knob(it.to!)} />
                  <path d={knob(it.to!)} />
                </g>
              </g>
            ) : (
              <Fade t0={d + 450} kept={kept}>
                <path class="vc-paper" d={knob(it.pos)} />
                <path d={knob(it.pos)} />
              </Fade>
            )}
            {it.label ? <Txt x={cx} y={ye + 20} text={it.label} max={labelMax} size={14} t0={d + 400} kept={kept} /> : null}
          </g>
        )
      })}
    </>
  )
  const lines = Math.max(1, ...items.map(i => (i.label ? Math.ceil(i.label.length / labelMax) : 0)))
  return { el, h: ye - y + 8 + lines * 17 }
}

/* ——— Effets ——— */

export interface Effet {
  picto: PictoName
  dir?: 'hausse' | 'baisse'
  text: string
  shown?: boolean
}

/** Ce qu'entraîne un choix, une ligne par effet : le pictogramme, son sens, la phrase dite */
export function effets({ items, x = 0, y = 0, w = W, row = 70, t0 = 0, kept }: { items: Effet[]; x?: number; y?: number; w?: number; row?: number; t0?: number; kept?: boolean }) {
  const max = Math.max(8, Math.floor((w - 82) / 7.6))
  const el = (
    <>
      {items.map((it, i) => {
        if (it.shown === false) return null
        const top = y + i * row
        const d = kept ? 0 : t0 + i * 300
        return (
          <g key={i}>
            <Picto n={it.picto} x={x} y={top} size={46} t0={d} kept={kept} />
            {it.dir ? <Picto n={it.dir} x={x + 44} y={top + 12} size={24} t0={d + 400} kept={kept} tone="count" w={1.2} /> : null}
            <Txt x={x + 78} y={top + 22} text={it.text} max={max} size={15} anchor="start" t0={d + 300} kept={kept} />
          </g>
        )
      })}
    </>
  )
  return { el, h: items.length * row - 12 }
}

/* ——— Cases ——— */

/** Une grille de cases (trimestres, risques, jours) : certaines comptées (bleu bille), d'autres effacées */
export function Cases({ n, cols, x = 0, y = 0, size = 16, gap = 4, count = [], ghost = [], t0 = 0, kept, stagger = 25, solid }: { n: number; cols: number; x?: number; y?: number; size?: number; gap?: number; count?: number[]; ghost?: number[]; t0?: number; kept?: boolean; stagger?: number; solid?: boolean }) {
  const at0 = (i: number) => ({ x: x + (i % cols) * (size + gap), y: y + Math.floor(i / cols) * (size + gap) })
  const sq = (i: number) => {
    const p = at0(i)
    return `M${p.x} ${p.y}h${size}v${size}h${-size}z`
  }
  const plain = Array.from({ length: n }, (_, i) => i).filter(i => !count.includes(i) && !ghost.includes(i))
  const rows = new Map<number, number[]>()
  for (const i of plain) rows.set(Math.floor(i / cols), [...(rows.get(Math.floor(i / cols)) ?? []), i])
  return (
    <>
      {[...rows.entries()].map(([r, list]) => (
        <Ink key={r} d={list.map(sq).join('')} t0={t0 + r * cols * stagger} dur={420} kept={kept} class="vc-thin" />
      ))}
      {ghost.length ? (
        <Fade t0={t0} kept={kept} class="vc-ghost">
          <path d={ghost.map(sq).join('')} />
        </Fade>
      ) : null}
      {count.length ? (
        <Fade t0={kept ? 0 : t0 + 200} class="vc-count">
          {/* De petites cases serrées : un aplat plein, sans contour, pour qu'elles restent distinctes */}
          <path class={solid ? 'vc-solid-count' : 'vc-tint-count'} d={count.map(sq).join('')} />
          {solid ? null : <path d={count.map(sq).join('')} />}
        </Fade>
      ) : null}
    </>
  )
}

/** Hauteur d'une grille de cases */
export const casesH = (n: number, cols: number, size = 16, gap = 4) => Math.ceil(n / cols) * (size + gap) - gap

/* ——— Petits dessins ——— */

/** Une personne qui a son étiquette dessous ; (cx, base) : le milieu de sa base */
export function Qui({ cx, base, size = 48, label, t0 = 0, kept, tone, shown = true, max = 12 }: { cx: number; base: number; size?: number; label?: string | null; t0?: number; kept?: boolean; tone?: Tone; shown?: boolean; max?: number }) {
  return (
    <>
      <Picto n="personne" x={cx - size / 2} y={base - size} size={size} t0={t0} kept={kept} tone={tone} />
      {label && shown ? <Txt x={cx} y={base + 19} text={label} size={15} max={max} t0={kept ? 0 : t0 + 300} /> : null}
    </>
  )
}

/** Un pictogramme qui a son étiquette dessous ; (cx, y) : le milieu de son haut */
export function Signe({ n, cx, y, size = 56, label, t0 = 0, kept, tone, shown = true, max = 14, text, filled }: { n: PictoName; cx: number; y: number; size?: number; label?: string | null; t0?: number; kept?: boolean; tone?: Tone; shown?: boolean; max?: number; text?: string; filled?: boolean }) {
  return (
    <>
      <Picto n={n} x={cx - size / 2} y={y} size={size} t0={t0} kept={kept} tone={tone} text={text} filled={filled} />
      {label && shown ? <Txt x={cx} y={y + size + 19} text={label} size={15} max={max} t0={kept ? 0 : t0 + 350} /> : null}
    </>
  )
}

/** Un groupe placé ailleurs sur la feuille */
export function Move({ x = 0, y = 0, children }: { x?: number; y?: number; children: ComponentChildren }) {
  return <g transform={`translate(${x} ${y})`}>{children}</g>
}
