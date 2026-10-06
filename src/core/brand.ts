// Marque d'Isoloir : géométrie et couleurs du logo, source unique pour le composant <Logo>,
// les fichiers de public/ (tools/build-brand.mjs) et le dessin en Canvas 2D (image partagée).
//
// Le pictogramme : un isoloir vu de face (disque d'encre), un « i » en réserve (la personne : tête
// et corps) et le rideau tiré depuis son épaule, en éventail de quatre bandes pastel qui couvrent
// l'échiquier, du fût vers l'extérieur : vert, rouge, jaune, bleu. Au sol, à gauche, une ombre.
// Le mot « isoloir » est construit en géométrie (fûts, anneaux, courbes) : aucune police n'est requise.
//
// Repère : disque de rayon 100 centré sur l'origine, y vers le bas (comme en SVG). Les chemins se
// remplissent avec la règle par défaut (nonzero) : les trous tournent à l'envers. Ils servent tels
// quels en SVG et en Canvas 2D (Path2D).
// Ce module n'importe rien et n'emploie que des annotations de type effaçables : Node l'exécute tel quel.

type Pt = readonly [number, number]
type Cubic = readonly [Pt, Pt, Pt, Pt]

/** Les quatre pastels du rideau, dans l'ordre du drapé (du fût vers l'extérieur) */
export const PASTELS = {
  vert: '#95d4a9',
  rouge: '#f8a898',
  jaune: '#f9e6a2',
  bleu: '#9bc2f6',
} as const

/** Version grise : le même éventail en quatre gris, du plus soutenu (contre le fût) au plus clair.
 *  Le plus clair reste lisible contre un disque blanc, le plus soutenu contre un disque noir. */
export const GRIS = {
  vert: '#5c5e60',
  rouge: '#828386',
  jaune: '#a6a8aa',
  bleu: '#c9cacd',
} as const

/** Encre du disque et du mot (celle du site, --print) ; blanc pour la version sur fond sombre */
export const ENCRE = '#17191c'
export const BLANC = '#ffffff'
/** L'ombre est l'encre du disque en transparence : elle se lit sur fond clair comme sur fond sombre */
/** Encre de l'ombre : #17191c à 0,66 sur blanc donne le gris opaque de la planche (≈ #646566) */
export const OMBRE_OPACITE = 0.66

export type LogoLayout = 'stacked' | 'horizontal' | 'mark'
export type LogoTone = 'color' | 'grey'

/* ---------- Outils de tracé ---------- */

const fmt = (v: number) => String(Math.round(v * 100) / 100 || 0)

/** Écrit un chemin SVG ; s, dx et dy placent le dessin (échelle puis décalage) */
function trace(s = 1, dx = 0, dy = 0) {
  const out: string[] = []
  const p = (x: number, y: number) => `${fmt(x * s + dx)} ${fmt(y * s + dy)}`
  const t = {
    M: (x: number, y: number) => (out.push(`M${p(x, y)}`), t),
    L: (x: number, y: number) => (out.push(`L${p(x, y)}`), t),
    C: (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => (
      out.push(`C${p(x1, y1)} ${p(x2, y2)} ${p(x, y)}`), t
    ),
    /** Arc d'ellipse (rx = ry pour un cercle) ; drapeaux SVG : grand arc, sens horaire à l'écran */
    A: (rx: number, ry: number, large: 0 | 1, sweep: 0 | 1, x: number, y: number) => (
      out.push(`A${fmt(rx * s)} ${fmt(ry * s)} 0 ${large} ${sweep} ${p(x, y)}`), t
    ),
    Z: () => (out.push('Z'), t),
    /** Cercle complet : sweep 1 pour un plein, 0 pour un trou */
    circle: (cx: number, cy: number, r: number, sweep: 0 | 1 = 1) =>
      t.M(cx + r, cy).A(r, r, 0, sweep, cx - r, cy).A(r, r, 0, sweep, cx + r, cy).Z(),
    rect: (x: number, y: number, w: number, h: number) => t.M(x, y).L(x + w, y).L(x + w, y + h).L(x, y + h).Z(),
    curve: (c: Cubic) => t.C(c[1][0], c[1][1], c[2][0], c[2][1], c[3][0], c[3][1]),
    toString: () => out.join(''),
  }
  return t
}
type Trace = ReturnType<typeof trace>

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** Coupe une courbe de Bézier cubique en t (de Casteljau) */
function split(c: Cubic, t: number): [Cubic, Cubic] {
  const ab = lerp(c[0], c[1], t), bc = lerp(c[1], c[2], t), cd = lerp(c[2], c[3], t)
  const abc = lerp(ab, bc, t), bcd = lerp(bc, cd, t), m = lerp(abc, bcd, t)
  return [[c[0], ab, abc, m], [m, bcd, cd, c[3]]]
}

const pointAt = (c: Cubic, t: number): Pt => split(c, t)[0][3]
const reverse = (c: Cubic): Cubic => [c[3], c[2], c[1], c[0]]

/** Racine de f sur [a, b] par dichotomie (f(a) et f(b) de signes opposés) */
function root(f: (x: number) => number, a: number, b: number): number {
  const sa = Math.sign(f(a))
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2
    if (Math.sign(f(m)) === sa) a = m
    else b = m
  }
  return (a + b) / 2
}

/* ---------- Le pictogramme ---------- */

/** Rayon du disque : l'unité de tout le dessin */
const R = 100
/** Le « i » en réserve : fût (le corps) à épaule arrondie, point (la tête) sur l'axe du fût */
const STEM = { left: -32, right: 16, top: -32, shoulder: 14 }
const DOT = { x: (STEM.left + STEM.right) / 2, y: -60, r: 18 }
/** Sommet du rideau : le coin haut droit du fût */
const APEX: Pt = [STEM.right, STEM.top]
/** Pointe du rideau, hors du disque ; la ligne de base du mot horizontal s'y aligne */
const TIP: Pt = [150, 48]
/** Bord intérieur (contre le fût, à peine évasé en bas), bord extérieur et ourlet du rideau */
const INNER: Cubic = [APEX, [16, 40], [17, 90], [34, 100]]
const OUTER: Cubic = [APEX, [36, -14], [80, 30], TIP]
const HEM: Cubic = [[34, 100], [70, 102], [125, 85], TIP]
/** Ombre portée : ellipse aplatie qui passe par le pied gauche du fût */
const SHADOW = { cx: -44, rx: 92, ry: 14 }

/** Pied gauche du fût : là où son bord gauche sort du disque */
const FOOT: Pt = [STEM.left, Math.sqrt(R * R - STEM.left * STEM.left)]

// Limites des bandes : du sommet à un point de l'ourlet, presque droites, avec une part du creux du bord
// extérieur qui grandit vers l'extérieur (SAG) : l'éventail s'ouvre comme sur la planche.
const SAG = 0.35

/** Écart d'une poignée de la courbe à sa corde : le « creux » qu'on reporte sur les limites */
const chordDev = (c: Cubic, i: 1 | 2): Pt => {
  const q = lerp(c[0], c[3], i / 3)
  return [c[i][0] - q[0], c[i][1] - q[1]]
}

/** Limite du sommet jusqu'au point u de l'ourlet, avec la part s du creux du bord extérieur */
const ray = (u: number, s: number): Cubic => {
  const h = pointAt(HEM, u)
  const d1 = chordDev(OUTER, 1)
  const d2 = chordDev(OUTER, 2)
  const a = lerp(APEX, h, 1 / 3)
  const b = lerp(APEX, h, 2 / 3)
  return [APEX, [a[0] + d1[0] * s, a[1] + d1[1] * s], [b[0] + d2[0] * s, b[1] + d2[1] * s], h]
}

/** Aire d'un polygone (formule du lacet) */
function areaOf(pts: Pt[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!
    const q = pts[(i + 1) % pts.length]!
    a += p[0] * q[1] - q[0] * p[1]
  }
  return Math.abs(a) / 2
}

const sample = (c: Cubic, n = 120) => Array.from({ length: n }, (_, i) => pointAt(c, i / n))
/** Aire du rideau entre le fût et la limite b qui finit au point u de l'ourlet */
const cumArea = (u: number, b: Cubic) => areaOf([...sample(INNER), ...sample(split(HEM, u)[0]), ...sample(reverse(b))])
const TOTAL = areaOf([...sample(INNER), ...sample(HEM), ...sample(reverse(OUTER))])

/** Points de l'ourlet où finissent les bandes : quatre aires égales, aucune couleur favorisée */
const HEM_ENDS = [0, 1, 2, 3]
  .map(k => (k === 0 ? 0 : root(u => cumArea(u, ray(u, SAG * u)) - (TOTAL * k) / 4, 0.001, 0.999)))
  .concat([1])

// Limites des bandes : 0 = bord intérieur (le fût), 4 = bord extérieur
const BOUNDS: Cubic[] = HEM_ENDS.map((u, k) => (k === 0 ? INNER : k === 4 ? OUTER : ray(u, SAG * u)))

function discPath(t: Trace) {
  // L'échancrure du fût suit, à droite, la première limite de bandes : ce bord du disque reste caché
  // sous le vert, sans liseré sombre le long du fût.
  const cut = BOUNDS[1] as Cubic
  const [inside] = split(cut, root(v => Math.hypot(...pointAt(cut, v)) - R, 0, 1))
  const s = STEM.shoulder
  t.M(FOOT[0], FOOT[1])
    .L(STEM.left, STEM.top + s)
    .A(s, s, 0, 1, STEM.left + s, STEM.top)
    .L(APEX[0], APEX[1])
    .curve(inside)
    .A(R, R, 1, 0, FOOT[0], FOOT[1])
    .Z()
  return t.circle(DOT.x, DOT.y, DOT.r, 1)
}

/** Bande k cumulée, du bord intérieur à la limite k + 1 : peintes du bleu au vert, chacune recouvre
 *  la jointure de la suivante et aucun liseré d'anticrénelage n'apparaît entre deux couleurs. */
function drapePath(t: Trace, k: number) {
  const hem = k === 3 ? HEM : split(HEM, HEM_ENDS[k + 1] ?? 1)[0]
  return t.M(APEX[0], APEX[1]).curve(INNER).curve(hem).curve(reverse(BOUNDS[k + 1] as Cubic)).Z()
}

// Centre vertical de l'ombre : l'ellipse passe exactement par le pied du fût
const SHADOW_CY = FOOT[1] - SHADOW.ry * Math.sqrt(1 - ((FOOT[0] - SHADOW.cx) / SHADOW.rx) ** 2)

function shadowPath(t: Trace) {
  // Segment d'ellipse à gauche du fût : sa partie sous le disque est cachée, rien n'en paraît dans le fût
  return t.M(FOOT[0], FOOT[1]).A(SHADOW.rx, SHADOW.ry, 1, 1, FOOT[0], 2 * SHADOW_CY - FOOT[1]).Z()
}

/* ---------- Le mot « isoloir » ---------- */

// Unités du mot : hauteur d'x 100, ligne de base en y = 0, y vers le bas. Fûts de 28, anneaux de 29,
// traits horizontaux du s plus fins (21 à 24) : un gras géométrique régulier, comme sur la planche.
const XH = 100
const ASC = 150
const W = 28
/** Débord des formes rondes au-dessus et au-dessous de la hauteur d'x (compensation optique) */
const OVER = 2.5

type Glyph = { width: number; draw: (t: Trace, x: number) => void }

const glyphI: Glyph = {
  width: W,
  draw: (t, x) => {
    t.rect(x, -XH, W, XH)
    t.circle(x + W / 2, -132, 16)
  },
}

const glyphL: Glyph = { width: W, draw: (t, x) => t.rect(x, -ASC, W, ASC) }

// o : anneau parfaitement rond
const RING = { outer: XH / 2 + OVER, inner: 23.5 }
const glyphO: Glyph = {
  width: 2 * RING.outer,
  draw: (t, x) => {
    t.circle(x + RING.outer, -XH / 2, RING.outer, 1)
    t.circle(x + RING.outer, -XH / 2, RING.inner, 0)
  },
}

// r : fût droit, bras qui naît sous l'épaule (petite encoche), sommet plat et coupe verticale
const glyphR: Glyph = {
  width: 67,
  draw: (t, x) => {
    t.M(x, 0)
      .L(x, -XH)
      .L(x + W, -XH)
      .L(x + W, -86)
      .C(x + 30.5, -93.5, x + 37, -XH, x + 46, -XH)
      .L(x + 67, -XH)
      .L(x + 67, -74)
      .C(x + 44, -74, x + W, -66, x + W, -46)
      .L(x + W, 0)
      .Z()
  },
}

// s : deux panses (celle du bas plus large), échine franche presque horizontale, coupes à 45°.
// Le contour longe un côté du trait puis l'autre ; chaque extrême a une tangente horizontale ou verticale.
const glyphS: Glyph = {
  width: 80,
  draw: (t, x) => {
    const c = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) =>
      t.C(x + x1, y1, x + x2, y2, x + x3, y3)
    // Dessus, flanc gauche, dessous de l'échine, creux de la panse basse, puis coupe du bas
    t.M(x + 77.7, -90.5)
    c(69.8, -98, 55.8, -103, 40, -103)
    c(17.1, -103, 1.9, -91, 1.9, -73)
    c(1.9, -58, 14.9, -47.7, 27.9, -43.5)
    c(40.9, -39.3, 51.5, -36.4, 51.5, -29.4)
    c(51.5, -24.5, 46.5, -21, 39, -21)
    c(29.8, -21, 20.5, -25, 14.4, -30.5)
    t.L(x, -15)
    // Dessous, flanc droit, dessus de l'échine, creux de la panse haute, puis coupe du haut
    c(7.4, -6, 22.3, 2.5, 40, 2.5)
    c(63.2, 2.5, 80, -11.6, 80, -31)
    c(80, -46, 67, -58.2, 48.9, -63)
    c(37.8, -66.2, 28.8, -66, 28.8, -73)
    c(28.8, -78.5, 33.5, -81, 40.4, -81)
    c(47.4, -81, 54.9, -79.5, 60.9, -74)
    t.Z()
  },
}

/** Lettres et approches (blanc qui suit chaque lettre), réglées à l'œil : plus serré entre formes rondes */
const WORD: { glyph: Glyph; gap: number }[] = [
  { glyph: glyphI, gap: 12 },
  { glyph: glyphS, gap: 7 },
  { glyph: glyphO, gap: 11 },
  { glyph: glyphL, gap: 11 },
  { glyph: glyphO, gap: 10 },
  { glyph: glyphI, gap: 13 },
  { glyph: glyphR, gap: 0 },
]
const WORD_WIDTH = WORD.reduce((a, g) => a + g.glyph.width + g.gap, 0)

function wordPath(s: number, dx: number, dy: number) {
  const t = trace(s, dx, dy)
  let x = 0
  for (const { glyph, gap } of WORD) {
    glyph.draw(t, x)
    x += glyph.width + gap
  }
  return t.toString()
}

/* ---------- Dispositions ---------- */

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface LogoGeometry {
  /** Boîte serrée du dessin */
  bounds: Box
  /** La même avec la marge de sécurité (MARGIN), pour les fichiers autonomes */
  viewBox: Box
  /** Disque d'encre, le « i » en réserve */
  disc: string
  /** Bandes du rideau, cumulées, dans l'ordre du drapé [vert, rouge, jaune, bleu] ; à peindre du bleu au vert */
  drape: readonly [string, string, string, string]
  /** Ombre au sol, à remplir de l'encre à OMBRE_OPACITE */
  shadow: string
  /** Le mot, ou une chaîne vide pour le pictogramme seul */
  word: string
  /** Ligne de base du mot dans le repère du logo (y) ; pour le pictogramme seul, celle de l'horizontal */
  baseline: number
}

/** Marge de sécurité autour de chaque disposition, en unités du disque */
const MARGIN = 12

/** Étendue du pictogramme, ombre comprise */
const MARK_BOX = (() => {
  let bottom = SHADOW_CY + SHADOW.ry
  for (let i = 0; i <= 200; i++) bottom = Math.max(bottom, pointAt(HEM, i / 200)[1])
  return { left: SHADOW.cx - SHADOW.rx, right: TIP[0], top: -R, bottom }
})()

const markParts = {
  disc: discPath(trace()).toString(),
  drape: [0, 1, 2, 3].map(k => drapePath(trace(), k).toString()) as unknown as LogoGeometry['drape'],
  shadow: shadowPath(trace()).toString(),
}

function geometry(word: string, baseline: number, l: number, t: number, r: number, b: number): LogoGeometry {
  return {
    ...markParts,
    word,
    baseline,
    bounds: { x: l, y: t, width: r - l, height: b - t },
    viewBox: { x: l - MARGIN, y: t - MARGIN, width: r - l + 2 * MARGIN, height: b - t + 2 * MARGIN },
  }
}

// Empilé : le mot sous le pictogramme, séparé par un blanc franc (ni l'ourlet ni l'ombre ne l'approchent),
// centré sur la masse du disque et du rideau plutôt que sur le seul disque.
const STACK = { scale: 0.44, gap: 40, shift: 14 }
// Horizontal : le mot après la pointe du rideau, sa ligne de base à hauteur de la pointe ;
// sa hauteur d'x tombe ainsi au milieu du disque.
const HORIZ = { scale: 0.74, gap: 38 }

function stacked(): LogoGeometry {
  const s = STACK.scale
  const w = WORD_WIDTH * s
  const x = STACK.shift - w / 2
  const baseline = MARK_BOX.bottom + STACK.gap + ASC * s
  const { left, right, top } = MARK_BOX
  return geometry(wordPath(s, x, baseline), baseline, Math.min(left, x), top, Math.max(right, x + w), baseline + OVER * s)
}

function horizontal(): LogoGeometry {
  const s = HORIZ.scale
  const x = MARK_BOX.right + HORIZ.gap
  const { left, top, bottom } = MARK_BOX
  return geometry(wordPath(s, x, TIP[1]), TIP[1], left, top, x + WORD_WIDTH * s, bottom)
}

export const LOGO: Record<LogoLayout, LogoGeometry> = {
  stacked: stacked(),
  horizontal: horizontal(),
  mark: geometry('', TIP[1], MARK_BOX.left, MARK_BOX.top, MARK_BOX.right, MARK_BOX.bottom),
}

/** Écrit une boîte au format de l'attribut viewBox */
export const viewBoxOf = (b: Box) => `${fmt(b.x)} ${fmt(b.y)} ${fmt(b.width)} ${fmt(b.height)}`

/** Couleurs du rideau selon le ton, dans l'ordre du drapé */
export function drapeColors(tone: LogoTone): readonly [string, string, string, string] {
  const c = tone === 'grey' ? GRIS : PASTELS
  return [c.vert, c.rouge, c.jaune, c.bleu]
}

/** Ordre de peinture des bandes : de l'extérieur (bleu) vers le fût (vert) */
export const DRAPE_ORDER = [3, 2, 1, 0] as const

/** SVG autonome aux couleurs en dur (fichiers de public/) ; ink = BLANC pour la version sur fond sombre */
export function logoSvg(layout: LogoLayout, tone: LogoTone, ink: string = ENCRE, title = 'Isoloir'): string {
  const g = LOGO[layout]
  const colors = drapeColors(tone)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxOf(g.viewBox)}" role="img" aria-label="${title}">`,
    `<title>${title}</title>`,
    `<path fill="${ink}" fill-opacity="${OMBRE_OPACITE}" d="${g.shadow}"/>`,
    `<path fill="${ink}" d="${g.disc}"/>`,
    ...DRAPE_ORDER.map(k => `<path fill="${colors[k]}" d="${g.drape[k]}"/>`),
    g.word ? `<path fill="${ink}" d="${g.word}"/>` : '',
    '</svg>',
  ].join('')
}

export interface DrawLogoOptions {
  layout: LogoLayout
  tone?: LogoTone
  /** Encre du disque, du mot et de l'ombre (ENCRE par défaut) */
  ink?: string
  /** Coin haut gauche de la boîte serrée, en pixels */
  x: number
  y: number
  /** Hauteur voulue de la boîte serrée, ou sa largeur si elle est donnée */
  height?: number
  width?: number
  /** Couleurs du rideau dans l'ordre du drapé ; à défaut, celles du ton */
  drape?: readonly [string, string, string, string]
}

/** Part de la hauteur du logo sous la ligne de base du mot : pour poser un texte sur cette ligne */
export const belowBaseline = (g: LogoGeometry) => (g.bounds.y + g.bounds.height - g.baseline) / g.bounds.height

/** Dessine le logo en Canvas 2D ; renvoie la taille occupée (boîte serrée), en pixels */
export function drawLogo(ctx: CanvasRenderingContext2D, o: DrawLogoOptions): { width: number; height: number } {
  const g = LOGO[o.layout]
  const b = g.bounds
  const k = o.width ? o.width / b.width : (o.height ?? b.height) / b.height
  const ink = o.ink ?? ENCRE
  const colors = o.drape ?? drapeColors(o.tone ?? 'color')
  ctx.save()
  ctx.translate(o.x, o.y)
  ctx.scale(k, k)
  ctx.translate(-b.x, -b.y)
  ctx.fillStyle = ink
  ctx.globalAlpha = OMBRE_OPACITE
  ctx.fill(new Path2D(g.shadow))
  ctx.globalAlpha = 1
  ctx.fill(new Path2D(g.disc))
  for (const i of DRAPE_ORDER) {
    ctx.fillStyle = colors[i]
    ctx.fill(new Path2D(g.drape[i]))
  }
  if (g.word) {
    ctx.fillStyle = ink
    ctx.fill(new Path2D(g.word))
  }
  ctx.restore()
  return { width: b.width * k, height: b.height * k }
}
