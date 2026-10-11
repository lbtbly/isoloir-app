// Dessins du PDF : bâtons de pointage, croix, étoile, info, cercle d'initiales, pastille, carré d'identité,
// tampon tourné, et le logo d'Isoloir converti depuis src/core/brand.ts (on ne le redessine pas).
//
// Tout se dessine en points, coordonnées « haut-gauche », à travers PdfCanvas. Les couleurs sont passées par
// l'appelant (le rapport tient sa palette) ; seul le logo prend les siennes dans brand.ts.

import { belowBaseline, DRAPE_ORDER, drapeColors, ENCRE, LOGO, OMBRE_OPACITE } from '../brand'
import { tallyStroke } from '../tally'
import type { PathCmd, PdfCanvas, Stroke } from './writer'

/* ---------- Chemins SVG vers commandes PDF ---------- */

export interface Cubic {
  /** Départ (le point courant), deux poignées, arrivée */
  x0: number
  y0: number
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
}

export interface ArcCubics {
  /** Centre et rayons de l'ellipse (rayons corrigés s'ils étaient trop petits), rotation d'axe en radians */
  cx: number
  cy: number
  rx: number
  ry: number
  phi: number
  /** Segments de 90° au plus ; vide si l'arc est nul */
  cubics: Cubic[]
}

/**
 * Arc elliptique SVG « A rx ry φ grand-arc sens x y » depuis (x1, y1), en courbes de Bézier cubiques.
 * Conversion des extrémités vers le centre (SVG 1.1, annexe F.6.5), rayons agrandis s'ils ne suffisent pas
 * (F.6.6), puis découpe en segments de 90° au plus, chacun approché avec le facteur 4/3 × tan(Δ/4).
 */
export function arcToBeziers(
  x1: number,
  y1: number,
  rxIn: number,
  ryIn: number,
  phiDeg: number,
  large: number,
  sweep: number,
  x2: number,
  y2: number,
): ArcCubics {
  const phi = (phiDeg * Math.PI) / 180
  let rx = Math.abs(rxIn)
  let ry = Math.abs(ryIn)
  if (x1 === x2 && y1 === y2) return { cx: x1, cy: y1, rx, ry, phi, cubics: [] }
  if (!rx || !ry) {
    // Rayon nul : un segment droit (F.6.2)
    return { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, rx, ry, phi, cubics: [{ x0: x1, y0: y1, x1, y1, x2, y2, x3: x2, y3: y2 }] }
  }
  const cosP = Math.cos(phi)
  const sinP = Math.sin(phi)
  const dx = (x1 - x2) / 2
  const dy = (y1 - y2) / 2
  const xp = cosP * dx + sinP * dy
  const yp = -sinP * dx + cosP * dy
  const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry)
  if (lambda > 1) {
    rx *= Math.sqrt(lambda)
    ry *= Math.sqrt(lambda)
  }
  const numerator = rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp
  const denominator = rx * rx * yp * yp + ry * ry * xp * xp
  let co = Math.sqrt(Math.max(0, numerator / denominator))
  if (Boolean(large) === Boolean(sweep)) co = -co
  const cxp = (co * rx * yp) / ry
  const cyp = (-co * ry * xp) / rx
  const cx = cosP * cxp - sinP * cyp + (x1 + x2) / 2
  const cy = sinP * cxp + cosP * cyp + (y1 + y2) / 2
  const angle = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const ux = (xp - cxp) / rx
  const uy = (yp - cyp) / ry
  const vx = (-xp - cxp) / rx
  const vy = (-yp - cyp) / ry
  const theta = angle(1, 0, ux, uy)
  let delta = angle(ux, uy, vx, vy)
  if (!sweep && delta > 0) delta -= 2 * Math.PI
  if (sweep && delta < 0) delta += 2 * Math.PI
  const count = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2) - 1e-9))
  const step = delta / count
  const k = (4 / 3) * Math.tan(step / 4)
  const point = (t: number): [number, number] => [
    cx + rx * Math.cos(t) * cosP - ry * Math.sin(t) * sinP,
    cy + rx * Math.cos(t) * sinP + ry * Math.sin(t) * cosP,
  ]
  const tangent = (t: number): [number, number] => [
    -rx * Math.sin(t) * cosP - ry * Math.cos(t) * sinP,
    -rx * Math.sin(t) * sinP + ry * Math.cos(t) * cosP,
  ]
  const cubics: Cubic[] = []
  for (let i = 0; i < count; i++) {
    const a = theta + i * step
    const b = a + step
    const [x0, y0] = point(a)
    const [x3, y3] = point(b)
    const [da0, da1] = tangent(a)
    const [db0, db1] = tangent(b)
    cubics.push({ x0, y0, x1: x0 + k * da0, y1: y0 + k * da1, x2: x3 - k * db0, y2: y3 - k * db1, x3, y3 })
  }
  return { cx, cy, rx, ry, phi, cubics }
}

/**
 * Chemin SVG aux commandes absolues M, L, C, A et Z (celles de brand.ts) vers des commandes M, L, C, Z.
 * Toute autre commande (relative, H, V, S, Q…) lève une erreur : on ne devine pas.
 */
export function svgPathToCmds(d: string): PathCmd[] {
  const tokens = d.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? []
  const out: PathCmd[] = []
  let i = 0
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  const n = () => {
    const t = tokens[i++]
    const v = t === undefined ? NaN : Number(t)
    if (!Number.isFinite(v)) throw new Error(`chemin SVG illisible près de « ${t ?? 'fin'} »`)
    return v
  }
  while (i < tokens.length) {
    const c = tokens[i++]
    switch (c) {
      case 'M':
        x = n()
        y = n()
        startX = x
        startY = y
        out.push(['M', x, y])
        break
      case 'L':
        x = n()
        y = n()
        out.push(['L', x, y])
        break
      case 'C': {
        const v = [n(), n(), n(), n(), n(), n()] as const
        out.push(['C', v[0], v[1], v[2], v[3], v[4], v[5]])
        x = v[4]
        y = v[5]
        break
      }
      case 'A': {
        const [rx, ry, phi, large, sweep, ex, ey] = [n(), n(), n(), n(), n(), n(), n()]
        for (const b of arcToBeziers(x, y, rx, ry, phi, large, sweep, ex, ey).cubics) out.push(['C', b.x1, b.y1, b.x2, b.y2, b.x3, b.y3])
        x = ex
        y = ey
        break
      }
      case 'Z':
        out.push(['Z'])
        x = startX
        y = startY
        break
      default:
        throw new Error(`commande SVG non prise en charge : ${c}`)
    }
  }
  return out
}

/* ---------- Logo ---------- */

export interface LogoForm {
  /** Boîte serrée du logo horizontal, dans son repère (y vers le bas) */
  x: number
  y: number
  width: number
  height: number
  /** Ligne de base du mot, en part de la hauteur depuis le haut */
  baselineRatio: number
  /** Formes à remplir dans l'ordre de peinture, dans le repère du logo */
  parts: { color: string; cmds: PathCmd[] }[]
}

/** Couleur opaque d'une encre posée à une opacité donnée sur du blanc */
function overWhite(hex: string, alpha: number): string {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return ['#', ...c.map(v => Math.round(255 - alpha * (255 - v)).toString(16).padStart(2, '0'))].join('')
}

let logoCache: LogoForm | null = null

/**
 * Le logo horizontal de brand.ts, prêt pour un XObject : ombre (encre à OMBRE_OPACITE, précalculée sur blanc :
 * pas de transparence), disque, rideau du bleu au vert (DRAPE_ORDER), mot. Remplissage nonzero : les trous
 * tournent déjà à l'envers dans brand.ts.
 */
export function logoForm(): LogoForm {
  if (logoCache) return logoCache
  const g = LOGO.horizontal
  const colors = drapeColors('color')
  const parts = [
    { color: overWhite(ENCRE, OMBRE_OPACITE), cmds: svgPathToCmds(g.shadow) },
    { color: ENCRE, cmds: svgPathToCmds(g.disc) },
    ...DRAPE_ORDER.map(k => ({ color: colors[k], cmds: svgPathToCmds(g.drape[k]) })),
    { color: ENCRE, cmds: svgPathToCmds(g.word) },
  ]
  logoCache = { ...g.bounds, baselineRatio: 1 - belowBaseline(g), parts }
  return logoCache
}

/* ---------- Bâtons de pointage ---------- */

export interface TallyOptions {
  color: string
  /** Points par unité de la boîte du paquet : 0,5 (paquet de 15 × 13 pt) */
  scale?: number
  /** Blanc entre deux paquets, en points */
  gap?: number
  /** Épaisseur du trait, en points (2,1 unités × 0,5) */
  width?: number
}

/** Largeur occupée par `count` bâtons */
export function tallyWidth(count: number, { scale = 0.5, gap = 2.6 }: Pick<TallyOptions, 'scale' | 'gap'> = {}): number {
  const groups = Math.ceil(Math.max(0, count) / 5)
  return groups ? groups * 30 * scale + (groups - 1) * gap : 0
}

/** Bâtons par paquets de cinq (quatre droits, un barré), coin haut gauche en (x, top), avec le tracé de l'écran
 *  (core/tally.ts) ; renvoie la largeur */
export function tally(c: PdfCanvas, x: number, top: number, count: number, o: TallyOptions): number {
  const scale = o.scale ?? 0.5
  const gap = o.gap ?? 2.6
  const stroke: Stroke = { color: o.color, width: o.width ?? 1.05, cap: 'round' }
  for (let i = 0; i < count; i++) {
    const gx = x + Math.floor(i / 5) * (30 * scale + gap)
    const [x1, y1, x2, y2] = tallyStroke(i)
    c.line(gx + x1 * scale, top + y1 * scale, gx + x2 * scale, top + y2 * scale, stroke)
  }
  return tallyWidth(count, { scale, gap })
}

/** Mini-bâton de la ligne de lecture : 8 pt de haut, haut penché de 0,56 pt vers la droite (rotate(4deg)) */
export function miniTally(c: PdfCanvas, x: number, top: number, color: string, height = 8): void {
  c.line(x + height * 0.07, top, x, top + height, { color, width: 1.4, cap: 'round' })
}

/* ---------- Icônes ---------- */

/** Croix (icône « cross ») centrée en (cx, cy) */
export function cross(c: PdfCanvas, cx: number, cy: number, color: string, half = 2.6, width = 1.1): void {
  const s: Stroke = { color, width, cap: 'round' }
  c.line(cx - half, cy - half, cx + half, cy + half, s)
  c.line(cx + half, cy - half, cx - half, cy + half, s)
}

/** Sommets de l'étoile (icône « star »), sur 24 unités */
const STAR: readonly (readonly [number, number])[] = [
  [12, 3.6], [14.55, 8.8], [20.25, 9.63], [16.12, 13.65], [17.1, 19.33],
  [12, 16.65], [6.9, 19.33], [7.88, 13.65], [3.75, 9.63], [9.45, 8.8],
]

/** Étoile pleine dans un carré de `size` points (celui de l'icône, marges comprises) dont le coin haut gauche est (x, top) */
export function star(c: PdfCanvas, x: number, top: number, size: number, color: string): void {
  const s = size / 24
  c.path([...STAR.map(([a, b], i): PathCmd => [i ? 'L' : 'M', x + a * s, top + b * s]), ['Z']], color)
}

/** Icône « info » centrée en (cx, cy) : cercle au trait et « i », proportions de l'icône (rayon 9 sur 24) */
export function info(c: PdfCanvas, cx: number, cy: number, color: string, r = 4.5, width = 0.9): void {
  const s = r / 9
  c.circle(cx, cy, r, undefined, { color, width })
  const stroke: Stroke = { color, width, cap: 'round' }
  c.line(cx, cy - 1 * s, cx, cy + 5 * s, stroke)
  c.line(cx, cy - 4.5 * s, cx, cy - 4 * s, stroke)
}

/** Pastille de palier : carré plein, coin haut gauche en (x, top) */
export function swatch(c: PdfCanvas, x: number, top: number, color: string, size = 6.5): void {
  c.rect(x, top, size, size, color)
}

export interface InitialsOptions {
  /** Encre du cercle et des lettres */
  ink: string
  /** Fond du cercle */
  paper: string
  /** Corps des initiales (0,7 × r par défaut) */
  size?: number
  /** Épaisseur du cercle */
  width?: number
}

/** Cercle d'initiales (à la place d'un portrait) : trois lettres passent en Tz 85. Décoratif comme le portrait de la
 *  page : les lettres sont un artefact, hors du texte copié (le nom suit en toutes lettres) */
export function initials(c: PdfCanvas, cx: number, cy: number, r: number, letters: string, o: InitialsOptions): void {
  const size = o.size ?? r * 0.7
  c.circle(cx, cy, r, o.paper, { color: o.ink, width: o.width ?? 1.1 })
  c.artifact(() => void c.textCenter(cx, cy + 0.36 * size, letters, { font: 'B', size, color: o.ink, tz: [...letters].length >= 3 ? 85 : 100 }))
}

export interface TileOptions {
  ink: string
  paper: string
  /** Inclinaison, en degrés (sens inverse des aiguilles d'une montre) */
  angle?: number
  /** Corps et échelle horizontale des initiales */
  size?: number
  tz?: number
  width?: number
}

/** Carré d'identité de l'affiche : initiales dans un carré incliné, coin haut gauche (avant rotation) en (x, y) ;
 *  les lettres sont un artefact, comme celles des cercles */
export function identityTile(c: PdfCanvas, x: number, y: number, side: number, letters: string, o: TileOptions): void {
  const cx = x + side / 2
  const cy = y + side / 2
  const size = o.size ?? 26
  c.save()
  c.rotateAbout(cx, cy, o.angle ?? 2)
  c.rect(x, y, side, side, o.paper, { color: o.ink, width: o.width ?? 1.5 })
  c.artifact(() => void c.textCenter(cx, cy + 0.36 * size, letters, { font: 'B', size, color: o.ink, tz: o.tz ?? 72 }))
  c.restore()
}

export interface StampOptions {
  color: string
  width?: number
  height?: number
  /** Inclinaison, en degrés : +4 (CSS rotate(-4deg), le repère PDF ayant y vers le haut) */
  angle?: number
}

/** Tampon daté : cadre tourné autour de son centre, étiquette en capitales espacées puis valeur */
export function stamp(c: PdfCanvas, x: number, y: number, label: string, value: string, o: StampOptions): void {
  const w = o.width ?? 128
  const h = o.height ?? 44
  c.save()
  c.rotateAbout(x + w / 2, y + h / 2, o.angle ?? 4)
  c.rect(x, y, w, h, undefined, { color: o.color, width: 1.5 })
  c.text(x + 10, y + 15, label.toLocaleUpperCase('fr-FR'), { font: 'B', size: 6.5, color: o.color, tc: 0.33 })
  c.text(x + 10, y + 36, value, { font: 'B', size: 18, color: o.color, tz: 80 })
  c.restore()
}
