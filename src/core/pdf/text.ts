// Mise en lignes du texte du PDF : coupure aux espaces (texte simple ou suites de styles), troncature avec « … »
// mesurée, rangées d'éléments en ligne (étoile + thème, pastille + palier).
//
// La coupure se fait seulement sur l'espace ordinaire U+0020, après prepareText (espaces françaises posées) :
// jamais sur l'espace insécable (U+00A0, où finit aussi U+202F) ni sur le trait d'union insécable. Un mot plus
// large que la colonne (une adresse) se coupe après « / », « . » ou « - », sinon entre deux caractères, sans
// jamais commencer une ligne par « : ; ! ? % » ) , . ».

import { NBSP, prepareText } from './winansi'
import { charWidth, measurePrepared, type PdfCanvas, type TextStyle } from './writer'

/** Un morceau de texte dans un style ; link : adresse à rendre cliquable */
export interface Run {
  text: string
  style: TextStyle
  link?: string
}

/** Un morceau posé sur une ligne : texte préparé, décalage depuis le début de la ligne, largeur */
export interface Piece {
  text: string
  style: TextStyle
  link?: string
  x: number
  width: number
}

export interface RunLine {
  pieces: Piece[]
  width: number
}

interface Glyph {
  ch: string
  run: number
  w: number
}

/** Ne commence jamais une ligne */
const NO_START = new Set([':', ';', '!', '?', '%', '»', ')', ',', '.', NBSP])
/** Ne finit jamais une ligne coupée entre deux caractères */
const NO_END = new Set(['«', '(', NBSP])
/** Coupure permise après ces signes, dans un mot trop long */
const SOFT = new Set(['/', '.', '-'])

/** Prépare les morceaux et règle les espaces françaises à leurs jonctions */
function prepareRuns(runs: readonly Run[], lost?: string[]): string[] {
  const texts = runs.map(r => prepareText(r.text, lost))
  for (let i = 0; i + 1 < texts.length; i++) {
    const a = texts[i] as string
    const b = texts[i + 1] as string
    if (/ +$/.test(a) && /^[:;!?»%]/.test(b)) texts[i] = a.replace(/ +$/, NBSP)
    if (/«$/.test(a) && /^ +/.test(b)) texts[i + 1] = b.replace(/^ +/, NBSP)
  }
  return texts
}

/** Fin de la ligne qui commence en `start` et déborde en `over` (la largeur jusqu'à over - 1 tient) */
function breakAt(glyphs: Glyph[], start: number, over: number): number {
  // Une espace avant le débordement : on coupe sur la dernière
  for (let j = over; j > start; j--) if (glyphs[j]?.ch === ' ') return j
  // Mot trop long : après « / », « . » ou « - »
  for (let j = over; j > start + 1; j--) {
    if (SOFT.has((glyphs[j - 1] as Glyph).ch) && !NO_START.has(glyphs[j]?.ch ?? '')) return j
  }
  // Sinon entre deux caractères, sans laisser une ponctuation en tête de ligne
  let j = over
  while (j > start + 1 && (NO_START.has((glyphs[j] as Glyph).ch) || NO_END.has((glyphs[j - 1] as Glyph).ch))) j--
  return j
}

/**
 * Coupe des suites de styles en lignes d'au plus `width` points. `firstWidth` : largeur de la première ligne
 * si elle diffère (texte qui suit un intitulé sur la même ligne).
 */
export function wrapRuns(runs: readonly Run[], width: number, firstWidth = width, lost?: string[]): RunLine[] {
  const texts = prepareRuns(runs, lost)
  const glyphs: Glyph[] = []
  texts.forEach((t, run) => {
    const st = (runs[run] as Run).style
    for (const ch of t) glyphs.push({ ch, run, w: charWidth(ch, st) })
  })
  const lines: RunLine[] = []
  let i = 0
  while (i < glyphs.length) {
    while (i < glyphs.length && (glyphs[i] as Glyph).ch === ' ') i++
    if (i >= glyphs.length) break
    const max = lines.length ? width : firstWidth
    let used = 0
    let j = i
    while (j < glyphs.length && used + (glyphs[j] as Glyph).w <= max + 1e-6) used += (glyphs[j++] as Glyph).w
    // Au moins un caractère par ligne, même plus large que la colonne
    const end = j >= glyphs.length ? glyphs.length : j === i ? i + 1 : breakAt(glyphs, i, j)
    let last = end
    while (last > i && (glyphs[last - 1] as Glyph).ch === ' ') last--
    lines.push(toLine(glyphs.slice(i, last), runs))
    i = end
  }
  return lines
}

/** Regroupe les caractères d'une ligne par morceau d'origine */
function toLine(glyphs: readonly Glyph[], runs: readonly Run[]): RunLine {
  const pieces: Piece[] = []
  let x = 0
  let current = -1
  for (const g of glyphs) {
    const last = pieces[pieces.length - 1]
    if (last && g.run === current) {
      last.text += g.ch
      last.width += g.w
    } else {
      const r = runs[g.run] as Run
      pieces.push(r.link ? { text: g.ch, style: r.style, link: r.link, x, width: g.w } : { text: g.ch, style: r.style, x, width: g.w })
      current = g.run
    }
    x += g.w
  }
  return { pieces, width: x }
}

/** Coupe un texte d'un seul style en lignes (textes préparés) */
export function wrapText(s: string, width: number, st: TextStyle, lost?: string[]): string[] {
  return wrapRuns([{ text: s, style: st }], width, width, lost).map(l => l.pieces.map(p => p.text).join(''))
}

/** Tronque un texte sur une ligne : on retire des caractères jusqu'à ce que « texte… » tienne (texte préparé) */
export function truncate(s: string, width: number, st: TextStyle): string {
  const p = prepareText(s)
  if (measurePrepared(p, st) <= width + 1e-6) return p
  const chars = [...p]
  const ellipsis = measurePrepared('…', st)
  let used = 0
  let n = 0
  while (n < chars.length && used + charWidth(chars[n] as string, st) + ellipsis <= width + 1e-6) used += charWidth(chars[n++] as string, st)
  const kept = chars.slice(0, n).join('').replace(/[\s\u00a0,;:·–—-]+$/u, '')
  return kept ? `${kept}…` : ellipsis <= width + 1e-6 ? '…' : ''
}

/** Pose des lignes d'un seul style ; renvoie la ligne de base de la dernière */
export function drawLines(c: PdfCanvas, x: number, baseline: number, lines: readonly string[], st: TextStyle, leading: number): number {
  lines.forEach((l, i) => c.text(x, baseline + i * leading, l, st))
  return baseline + Math.max(0, lines.length - 1) * leading
}

/** Pose une ligne de suites de styles ; les morceaux qui portent une adresse deviennent cliquables */
export function drawRunLine(c: PdfCanvas, x: number, baseline: number, line: RunLine): void {
  for (const p of line.pieces) {
    c.text(x + p.x, baseline, p.text, p.style)
    if (p.link) c.link(x + p.x, baseline - p.style.size * 0.8, p.width, p.style.size * 1.05, p.link)
  }
}

/** Pose des lignes de suites de styles ; firstX : départ de la première ligne si elle suit un intitulé */
export function drawRunLines(c: PdfCanvas, x: number, baseline: number, lines: readonly RunLine[], leading: number, firstX = x): number {
  lines.forEach((l, i) => drawRunLine(c, i ? x : firstX, baseline + i * leading, l))
  return baseline + Math.max(0, lines.length - 1) * leading
}

/**
 * Range des éléments insécables (étoile + thème, pastille + palier) en rangées d'au plus `width` points,
 * `gap` points entre deux éléments d'une rangée ; renvoie les indices de chaque rangée.
 */
export function inlineRows(widths: readonly number[], width: number, gap: number, firstWidth = width): number[][] {
  const rows: number[][] = []
  let row: number[] = []
  let used = 0
  widths.forEach((w, i) => {
    const max = rows.length ? width : firstWidth
    if (row.length && used + gap + w > max + 1e-6) {
      rows.push(row)
      row = []
      used = 0
    }
    used += (row.length ? gap : 0) + w
    row.push(i)
  })
  if (row.length) rows.push(row)
  return rows
}
