// Piste C, l'encre : les gestes communs à tous les dessins. Un trait qui se trace une fois (Ink), un groupe
// qui apparaît (Fade), un texte du dessin sur une ou plusieurs lignes (Txt), le cadre d'un dessin (Art), et
// la lecture des textes du script : mots mis en valeur et l'instant où la voix les dit, nombres écrits à la
// française, rapports (« 1 sur 7 »), fractions (« deux tiers »), années.
//
// Toutes les mesures d'un dessin sont en unités d'une feuille de 300 de large (Art) : le trait d'encre y fait
// 2,2 unités, les textes 14 à 17, quelle que soit l'échelle d'un pictogramme (variable --k, voir videos-c.css).
// Chaque geste va « de l'état de départ vers l'état normal » : sans animation (mouvement réduit, affiche
// d'une vidéo voisine), on voit le dessin fini.

import type { ComponentChildren } from 'preact'
import { cueAt } from '../../model'
import type { PisteSegmentProps } from '../../types'

export type P = PisteSegmentProps

/** Largeur de la feuille d'un dessin, en unités */
export const W = 300

/* ——— Outils ——— */

/** Départ (--d) et durée (--t) d'un geste, en millisecondes */
export const at = (d: number, t?: number) => (t === undefined ? { '--d': `${d}ms` } : { '--d': `${d}ms`, '--t': `${t}ms` })

export const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ') || undefined

/** Pour chercher un mot dans un texte : casse et espaces insécables ignorées, longueur conservée */
export const fold = (s: string) => s.toLowerCase().replace(/[\u00a0\u202f]/g, ' ')

/** Espaces de toutes sortes, dans une expression régulière */
export const SP = '[\\s\\u00a0\\u202f]+'

/** Les phrases d'un texte dit */
export const sentencesOf = (s: string) =>
  (s.match(/[^.!?…]*[.!?…]+|[^.!?…]+$/g) ?? [s]).map(x => x.trim()).filter(Boolean)

/** La phrase dite qui porte un mot (« Suspendue, pas annulée. ») */
export const sentenceWith = (say: string, cue: string | undefined) =>
  (cue && sentencesOf(say).find(s => fold(s).includes(fold(cue)))) || null

/** Le plus long mot d'un texte (espaces ordinaires) : la taille du gros caractère en dépend */
export const longest = (s: string) => Math.max(1, ...s.split(/[ \t\n]+/).map(w => w.length))

export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* ——— Ce que dit la voix ——— */

/** La voix a atteint ce mot (ou presque) ; tout est là en image fixe */
export const heard = (p: P, text: string | null | undefined) =>
  p.still || !text || p.progress + 0.03 >= cueAt(p.segment.say, text)

/** Un mot mis en valeur, et s'il est déjà dit */
export interface Cue {
  text: string
  shown: boolean
}

export const cuesOf = (p: P): Cue[] => (p.segment.emphasis ?? []).map(text => ({ text, shown: heard(p, text) }))

/** Le i-ème mot mis en valeur, ou rien */
export const cueOf = (p: P, i: number): Cue | null => cuesOf(p)[i] ?? null

/** Les espaces insécables comptent comme des espaces ordinaires pour chercher (même longueur, mêmes positions) */
export const plain = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ')

/** Cherche une expression dans un texte, espaces insécables comprises ; rend le passage tel qu'il est écrit */
function find(text: string, re: RegExp): string | null {
  const m = re.exec(plain(text))
  return m ? text.slice(m.index, m.index + m[0].length) : null
}

/** Un mot ou une expression du script : dans ce passage d'abord, sinon ailleurs dans la vidéo. Rien si absent. */
export function said(p: P, re: RegExp): string | null {
  for (const s of [p.segment, ...p.script.segments]) {
    const m = find(s.say, re)
    if (m) return m
  }
  return null
}

/** Un mot de ce passage seulement, tel qu'il est écrit, et s'il est déjà dit */
export function word(p: P, re: RegExp): Cue | null {
  const m = find(p.segment.say, re)
  return m ? { text: m, shown: heard(p, m) } : null
}

/* ——— Les nombres du script ——— */

/** Petits nombres écrits en lettres */
const WORDS: Record<string, number> = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11,
  douze: 12, treize: 13, vingt: 20, cent: 100,
}

/** Un nombre écrit à la française (« 17,3 », « 1 705 », « −5,1 », « quatre ») ; null sinon */
export function num(s: string | null | undefined): number | null {
  if (!s) return null
  const w = WORDS[s.trim().toLowerCase()]
  if (w !== undefined) return w
  const m = /([−-])?\s?(\d{1,3}(?:[\s\u00a0\u202f]\d{3})+|\d+)(?:,(\d+))?/.exec(s)
  if (!m) return null
  const n = Number(`${m[2]!.replace(/[\s\u00a0\u202f]/g, '')}.${m[3] ?? '0'}`)
  return m[1] ? -n : n
}

/** Tous les nombres d'un texte, dans l'ordre */
export function nums(s: string): number[] {
  return [...s.matchAll(/[−-]?\d{1,3}(?:[\u00a0\u202f]\d{3})+(?:,\d+)?|[−-]?\d+(?:,\d+)?/g)].map(m => num(m[0])!)
}

const NUMBER = `(?:\\d+(?:,\\d+)?|${Object.keys(WORDS).join('|')})`

/** Un rapport dit : « un euro sur quatre », « 1 demande sur 7 », « plus de 7 sur 10 », « 7 logements sur 100 » */
export function ratioOf(text: string | null | undefined): { k: number; n: number; more: boolean } | null {
  if (!text) return null
  const m = new RegExp(`(plus${SP}d[eu’']${SP}?)?\\b(${NUMBER})${SP}(?:[^\\s\\d]+${SP}){0,3}?sur${SP}(${NUMBER})\\b`, 'i').exec(text)
  if (!m) return null
  const k = num(m[2])
  const n = num(m[3])
  return k !== null && n !== null && k > 0 && n > k ? { k, n, more: !!m[1] } : null
}

/** Une fraction dite : « la moitié », « un tiers », « deux tiers », « un quart » */
export function fractionOf(text: string | null | undefined): number | null {
  if (!text) return null
  const t = fold(text)
  if (/moitié/.test(t)) return 1 / 2
  if (/deux tiers/.test(t)) return 2 / 3
  if (/\btiers\b/.test(t)) return 1 / 3
  if (/trois quarts/.test(t)) return 3 / 4
  if (/\bquart\b/.test(t)) return 1 / 4
  return null
}

/** Les années citées dans un texte (« en 2025 », « dès 1969 ») */
export const yearsOf = (s: string) => [...s.matchAll(/\b(1[89]\d\d|20\d\d)\b/g)].map(m => Number(m[1]))

/* ——— Marques à l'encre dans le texte ——— */

/** Un texte dont les mots mis en valeur se soulignent (un trait d'encre tiré sous le mot, ligne par ligne)
 *  quand la voix les atteint */
export function Marks({ text, cues }: { text: string; cues: Cue[] }) {
  const found = cues
    .map(c => ({ ...c, at: fold(text).indexOf(fold(c.text)) }))
    .filter(c => c.at >= 0)
    .sort((a, b) => a.at - b.at)
  const out: ComponentChildren[] = []
  let last = 0
  for (const c of found) {
    if (c.at < last) continue
    out.push(text.slice(last, c.at))
    out.push(
      <span key={c.at} class={cls('vc-mk', c.shown && 'is-on')}>
        {text.slice(c.at, c.at + c.text.length)}
      </span>,
    )
    last = c.at + c.text.length
  }
  out.push(text.slice(last))
  return <>{out}</>
}

/* ——— Les gestes du dessin ——— */

/** Tons d'un trait : l'encre d'imprimerie par défaut ; le gris de lecture pour le décor ; le bleu bille pour
 *  ce qui se compte ; le fantôme (pointillé gris) pour ce qui manque, a été, ou n'est que projeté */
export type Tone = 'soft' | 'count' | 'ghost'

interface InkProps {
  d: string
  t0?: number
  dur?: number
  /** Déjà au tableau (repris d'un passage précédent, ou en pointillé) : tracé d'avance */
  kept?: boolean
  class?: string
}

/** Un trait d'encre qui se dessine une fois (pathLength 1), ou déjà là */
export function Ink({ d, t0 = 0, dur, kept = false, class: c }: InkProps) {
  if (kept) return <path class={c} d={d} />
  return <path class={cls('vc-draw', c)} pathLength={1} d={d} style={at(t0, dur)} />
}

/** Un groupe qui arrive en fondu (texte, aplats), ou déjà là */
export function Fade({ t0 = 0, kept = false, class: c, children }: { t0?: number; kept?: boolean; class?: string; children: ComponentChildren }) {
  return kept ? <g class={c}>{children}</g> : <g class={cls('vc-fade', c)} style={at(t0)}>{children}</g>
}

/** Le dessin d'un passage : une feuille de 300 de large, haute de « h », qui garde ses proportions dans la
 *  place qu'on lui laisse (sa hauteur naturelle à pleine largeur, réduite si la scène manque de hauteur) */
export function Art({ h, y = 0, class: c, children }: { h: number; y?: number; class?: string; children: ComponentChildren }) {
  return (
    <div class={cls('vc-art', c)} style={{ '--r': String(h / W) }}>
      <svg class="vc-svg" viewBox={`0 ${y} ${W} ${h}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {children}
      </svg>
    </div>
  )
}

/** Coupe un texte en lignes d'au plus « max » signes (les espaces insécables tiennent) */
export function wrap(text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const w of text.split(/[ \n]+/)) {
    if (line && line.length + 1 + w.length > max) {
      lines.push(line)
      line = w
    } else line = line ? `${line} ${w}` : w
  }
  if (line) lines.push(line)
  return lines
}

interface TxtProps {
  x: number
  y: number
  text: string
  /** Corps, en unités de la feuille */
  size?: number
  /** Largeur en signes avant de passer à la ligne */
  max?: number
  anchor?: 'start' | 'middle' | 'end'
  /** Le texte remonte de ses lignes en plus : « y » est alors la ligne de base de la dernière */
  up?: boolean
  tone?: 'soft' | 'count'
  big?: boolean
  t0?: number
  kept?: boolean
  /** Un liseré couleur papier sous les lettres, quand le mot est posé sur un trait */
  halo?: boolean
}

/** Un texte du dessin, sur une ou plusieurs lignes ; « y » est la ligne de base de la première */
export function Txt({ x, y, text, size = 15, max, anchor = 'middle', up, tone, big, t0 = 0, kept, halo }: TxtProps) {
  const lines = max ? wrap(text, max) : text.split('\n')
  const lh = size * (big ? 1 : 1.14)
  const y0 = up ? y - (lines.length - 1) * lh : y
  return (
    <Fade t0={t0} kept={kept}>
      <text
        class={cls(big ? 'vc-t-big' : 'vc-t', tone && `vc-t-${tone}`, halo && 'vc-t-halo')}
        x={x}
        y={y0}
        text-anchor={anchor}
        font-size={size}
      >
        {lines.map((l, i) => (
          <tspan key={i} x={x} dy={i ? lh : 0}>
            {l}
          </tspan>
        ))}
      </text>
    </Fade>
  )
}

/** Flèche au trait, de (x1, y1) à (x2, y2) ; en tirets si « dash » */
export function Arrow({
  x1, y1, x2, y2, t0 = 0, dur = 500, kept, dash, tone, head = 8,
}: { x1: number; y1: number; x2: number; y2: number; t0?: number; dur?: number; kept?: boolean; dash?: boolean; tone?: Tone; head?: number }) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len]
  const tip = (a: number) => {
    const c = Math.cos(a)
    const s = Math.sin(a)
    return `M${x2} ${y2}l${(-(ux * c - uy * s) * head).toFixed(1)} ${(-(uy * c + ux * s) * head).toFixed(1)}`
  }
  const k = tone ? `vc-${tone}` : undefined
  if (dash) {
    const pt = (q: number) => `${(x1 + ux * q).toFixed(1)} ${(y1 + uy * q).toFixed(1)}`
    let d = ''
    for (let q = 0; q < len - 8; q += 9) d += `M${pt(q)}L${pt(Math.min(q + 4.5, len))}`
    return (
      <Fade t0={t0} kept={kept} class={k}>
        <path d={`${d}M${pt(len - 4)}L${x2} ${y2}${tip(0.55)}${tip(-0.55)}`} />
      </Fade>
    )
  }
  return (
    <g class={k}>
      <Ink d={`M${x1} ${y1}L${x2} ${y2}`} t0={t0} dur={dur} kept={kept} />
      <Ink d={`${tip(0.55)}${tip(-0.55)}`} t0={t0 + dur - 80} dur={200} kept={kept} />
    </g>
  )
}

/** Accolade au trait, de (x1, y1) à (x2, y2), pointe du côté « side » (1 : à droite d'un trait vertical ou
 *  sous un trait horizontal ; -1 : de l'autre côté) */
export function Brace({ x1, y1, x2, y2, side = 1, t0 = 0, kept, tone }: { x1: number; y1: number; x2: number; y2: number; side?: 1 | -1; t0?: number; kept?: boolean; tone?: Tone }) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len]
  // Normale du côté de la pointe
  const [nx, ny] = [-uy * side, ux * side]
  const a = Math.min(7, len / 4)
  const P = (along: number, out: number) => `${(x1 + ux * along + nx * out).toFixed(1)} ${(y1 + uy * along + ny * out).toFixed(1)}`
  const m = len / 2
  const d = `M${P(0, 0)}Q${P(0, a)} ${P(a, a)}L${P(m - a, a)}Q${P(m, a)} ${P(m, 2 * a)}Q${P(m, a)} ${P(m + a, a)}L${P(len - a, a)}Q${P(len, a)} ${P(len, 0)}`
  return <Ink d={d} t0={t0} dur={600} kept={kept} class={tone ? `vc-${tone}` : undefined} />
}

/** Point d'interrogation à la main, haut de « h » ; (x, y) : son coin haut gauche */
export function Ask({ x, y, h, t0 = 0, kept, tone }: { x: number; y: number; h: number; t0?: number; kept?: boolean; tone?: Tone }) {
  const s = h / 32
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ '--k': String(1 / s) }} class={tone ? `vc-${tone}` : undefined}>
      <Ink d="M2 9C2 4 6 1 10 1C15 1 18 4 18 8.5C18 13.5 10 14.5 10 21.5V23" t0={t0} dur={600} kept={kept} class="vc-bold" />
      <Ink d="M10 30.1v.6" t0={t0 + 560} dur={80} kept={kept} class="vc-dot" />
    </g>
  )
}
