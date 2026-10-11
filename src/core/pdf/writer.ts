// Écrivain PDF maison, sans dépendance : PDF 1.4, pages A4, polices standard Helvetica et Helvetica-Bold
// (non embarquées, WinAnsiEncoding), dessin vectoriel, flux non compressés, sortie déterministe.
//
// Repère : on dessine en points, « haut-gauche » (y vers le bas, comme à l'écran) ; l'écrivain convertit
// y → PAGE_H - y au moment d'écrire. Tout le fichier est de l'ASCII, sauf les 4 octets binaires de l'en-tête :
// le texte est écrit en octal (\351 pour « é »), le titre en UTF-16BE hexadécimal. Le fichier s'assemble donc
// octet par octet et les décalages de la table xref sont exacts.
//
// Chargé à la demande seulement (import() du rapport) : rien ici n'entre dans le JS initial.

import { FIRST_CODE, WIDTHS_BOLD, WIDTHS_REGULAR } from './metrics'
import { logoForm } from './shapes'
import { pdfLiteral, pdfUtf16, prepareText, winAnsiCode, winAnsiCodes } from './winansi'

/** A4 portrait, en points */
export const PAGE_W = 595.28
export const PAGE_H = 841.89

/** Helvetica (/F1) et Helvetica-Bold (/F2) */
export type FontKey = 'R' | 'B'

export interface TextStyle {
  font: FontKey
  /** Corps, en points */
  size: number
  /** Couleur « #rrggbb » */
  color: string
  /** Échelle horizontale en % (opérateur Tz) : 100 par défaut */
  tz?: number
  /** Espacement des caractères en points (opérateur Tc) : 0 par défaut */
  tc?: number
}

export interface Stroke {
  color: string
  width: number
  /** Bouts des traits : carrés coupés (butt, par défaut) ou ronds */
  cap?: 'butt' | 'round'
}

/** Commandes de tracé absolues, en coordonnées « haut-gauche » */
export type PathCmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number]
  | ['Z']

export interface PdfCanvas {
  /** Texte sur une ligne, à gauche en x ; renvoie sa largeur */
  text(x: number, baseline: number, s: string, st: TextStyle): number
  /** Texte aligné à droite sur xRight ; renvoie sa largeur */
  textRight(xRight: number, baseline: number, s: string, st: TextStyle): number
  /** Texte centré sur xCenter ; renvoie sa largeur */
  textCenter(xCenter: number, baseline: number, s: string, st: TextStyle): number
  /** Texte tourné autour de son origine (x, baseline) ; angle positif : sens inverse des aiguilles d'une montre
   *  (+90° : se lit de bas en haut). Renvoie sa largeur. */
  textRotated(x: number, baseline: number, angleDeg: number, s: string, st: TextStyle): number
  rect(x: number, y: number, w: number, h: number, fill?: string, stroke?: Stroke): void
  line(x1: number, y1: number, x2: number, y2: number, stroke: Stroke): void
  /** Tracé fermé ou non ; remplissage par la règle nonzero */
  path(cmds: PathCmd[], fill?: string, stroke?: Stroke): void
  circle(cx: number, cy: number, r: number, fill?: string, stroke?: Stroke): void
  save(): void
  restore(): void
  /** Tourne ce qui suit autour de (cx, cy) ; angle positif : sens inverse des aiguilles d'une montre.
   *  À appeler entre save() et restore(). */
  rotateAbout(cx: number, cy: number, angleDeg: number): void
  /** Logo horizontal d'Isoloir (XObject partagé), coin haut gauche de sa boîte serrée en (x, top) ;
   *  renvoie sa largeur et la ligne de base du mot (pour y poser un texte) */
  logo(x: number, top: number, height: number): { width: number; baseline: number }
  /** Zone cliquable vers une adresse (annotation /URI), en coordonnées de page (hors rotation) */
  link(x: number, y: number, w: number, h: number, uri: string): void
  /** Dessin décoratif (initiales d'un cercle) : marqué comme artefact (/Artifact BMC … EMC), il sort du texte que
   *  copient et lisent les lecteurs qui respectent ce marquage. Ne doit pas enjamber save() / restore(). */
  artifact(draw: () => void): void
}

/* ---------- Nombres, couleurs, tracés ---------- */

/** Nombre écrit dans un flux : arrondi à 2 décimales, jamais d'exposant, jamais « -0 », jamais NaN */
export function num(v: number): string {
  if (!Number.isFinite(v)) throw new Error(`nombre invalide dans le PDF : ${v}`)
  if (Math.abs(v) >= 1e7) throw new Error(`nombre hors d'échelle dans le PDF : ${v}`)
  const r = Math.round(v * 100) / 100
  return r === 0 ? '0' : String(r)
}

/** Coefficient de matrice (rotation, échelle) : 4 décimales, sans quoi un angle de 2° sortirait à 1,7° */
export function coef(v: number): string {
  if (!Number.isFinite(v)) throw new Error(`coefficient invalide dans le PDF : ${v}`)
  const r = Math.round(v * 1e4) / 1e4
  return r === 0 ? '0' : String(r)
}

/** « #rrggbb » → « r g b » (composantes de 0 à 1, 3 décimales) */
export function rgb(hex: string): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!m) throw new Error(`couleur invalide : ${hex}`)
  return [m[1], m[2], m[3]].map(h => (parseInt(h as string, 16) / 255).toFixed(3)).join(' ')
}

/** Opérateurs PDF d'un tracé ; flip : coordonnées « haut-gauche » converties (sinon écrites telles quelles) */
function pathOps(cmds: readonly PathCmd[], flip: boolean): string {
  const Y = (y: number) => num(flip ? PAGE_H - y : y)
  const out: string[] = []
  for (const c of cmds) {
    switch (c[0]) {
      case 'M':
        out.push(`${num(c[1])} ${Y(c[2])} m`)
        break
      case 'L':
        out.push(`${num(c[1])} ${Y(c[2])} l`)
        break
      case 'C':
        out.push(`${num(c[1])} ${Y(c[2])} ${num(c[3])} ${Y(c[4])} ${num(c[5])} ${Y(c[6])} c`)
        break
      case 'Z':
        out.push('h')
        break
    }
  }
  return out.join(' ')
}

/** Cosinus et sinus d'un angle en degrés, arrondis comme ils seront écrits */
function rotation(angleDeg: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180
  return [Math.round(Math.cos(a) * 1e4) / 1e4, Math.round(Math.sin(a) * 1e4) / 1e4]
}

const strokeOps = (s: Stroke) => `${num(s.width)} w ${s.cap === 'round' ? 1 : 0} J ${rgb(s.color)} RG`

/** Opérateur de peinture : plein et trait (B), plein (f), trait (S), rien (n) */
const paintOp = (fill?: string, stroke?: Stroke) => (fill && stroke ? 'B' : fill ? 'f' : stroke ? 'S' : 'n')

/* ---------- Mesure ---------- */

/** Chasse d'un code WinAnsi en millièmes d'em */
export function advance(code: number, font: FontKey): number {
  const w = (font === 'B' ? WIDTHS_BOLD : WIDTHS_REGULAR)[code - FIRST_CODE]
  if (w === undefined) throw new Error(`code hors table : ${code}`)
  return w
}

/** Largeur d'un caractère déjà préparé, en points, dans un style : (w × corps / 1000 + Tc) × Tz / 100 */
export function charWidth(ch: string, st: TextStyle): number {
  const code = winAnsiCode(ch.codePointAt(0) as number)
  if (code === undefined) throw new Error(`caractère hors WinAnsi : ${ch}`)
  return ((advance(code, st.font) * st.size) / 1000 + (st.tc ?? 0)) * ((st.tz ?? 100) / 100)
}

/** Largeur d'un texte déjà préparé (prepareText), sans crénage */
export function measurePrepared(prepared: string, st: TextStyle): number {
  let units = 0
  let count = 0
  for (const code of winAnsiCodes(prepared)) {
    units += advance(code, st.font)
    count++
  }
  return ((units * st.size) / 1000 + count * (st.tc ?? 0)) * ((st.tz ?? 100) / 100)
}

/** Largeur d'un texte en points : largeur = Σ (w[c] × corps / 1000 + Tc) × Tz / 100 */
export function measure(s: string, st: TextStyle): number {
  return measurePrepared(prepareText(s), st)
}

/* ---------- Page ---------- */

interface Annotation {
  rect: [number, number, number, number]
  uri: string
}

class Page implements PdfCanvas {
  readonly ops: string[] = []
  readonly annots: Annotation[] = []
  usesLogo = false
  private depth = 0
  private readonly lost: string[]

  constructor(lost: string[]) {
    this.lost = lost
  }

  /** Écrit un texte préparé avec la matrice de texte donnée */
  private show(prepared: string, st: TextStyle, matrix: string): void {
    if (!prepared) return
    const font = st.font === 'B' ? 'F2' : 'F1'
    const codes = winAnsiCodes(prepared)
    this.ops.push(
      `BT /${font} ${num(st.size)} Tf ${num(st.tc ?? 0)} Tc ${num(st.tz ?? 100)} Tz ${rgb(st.color)} rg ${matrix} Tm ${pdfLiteral(codes)} Tj ET`,
    )
  }

  private place(x: number, baseline: number, s: string, st: TextStyle, align: 0 | 0.5 | 1): number {
    const p = prepareText(s, this.lost)
    const w = measurePrepared(p, st)
    this.show(p, st, `1 0 0 1 ${num(x - w * align)} ${num(PAGE_H - baseline)}`)
    return w
  }

  text(x: number, baseline: number, s: string, st: TextStyle): number {
    return this.place(x, baseline, s, st, 0)
  }

  textRight(xRight: number, baseline: number, s: string, st: TextStyle): number {
    return this.place(xRight, baseline, s, st, 1)
  }

  textCenter(xCenter: number, baseline: number, s: string, st: TextStyle): number {
    return this.place(xCenter, baseline, s, st, 0.5)
  }

  textRotated(x: number, baseline: number, angleDeg: number, s: string, st: TextStyle): number {
    const p = prepareText(s, this.lost)
    const [cos, sin] = rotation(angleDeg)
    this.show(p, st, `${coef(cos)} ${coef(sin)} ${coef(-sin)} ${coef(cos)} ${num(x)} ${num(PAGE_H - baseline)}`)
    return measurePrepared(p, st)
  }

  rect(x: number, y: number, w: number, h: number, fill?: string, stroke?: Stroke): void {
    if (!fill && !stroke) return
    const ops: string[] = []
    if (fill) ops.push(`${rgb(fill)} rg`)
    if (stroke) ops.push(strokeOps(stroke))
    ops.push(`${num(x)} ${num(PAGE_H - y - h)} ${num(w)} ${num(h)} re ${paintOp(fill, stroke)}`)
    this.ops.push(ops.join(' '))
  }

  line(x1: number, y1: number, x2: number, y2: number, stroke: Stroke): void {
    this.ops.push(`${strokeOps(stroke)} ${num(x1)} ${num(PAGE_H - y1)} m ${num(x2)} ${num(PAGE_H - y2)} l S`)
  }

  path(cmds: PathCmd[], fill?: string, stroke?: Stroke): void {
    if (!cmds.length || (!fill && !stroke)) return
    const ops: string[] = []
    if (fill) ops.push(`${rgb(fill)} rg`)
    if (stroke) ops.push(strokeOps(stroke))
    ops.push(pathOps(cmds, true), paintOp(fill, stroke))
    this.ops.push(ops.join(' '))
  }

  circle(cx: number, cy: number, r: number, fill?: string, stroke?: Stroke): void {
    const k = 0.5523 * r
    this.path(
      [
        ['M', cx + r, cy],
        ['C', cx + r, cy + k, cx + k, cy + r, cx, cy + r],
        ['C', cx - k, cy + r, cx - r, cy + k, cx - r, cy],
        ['C', cx - r, cy - k, cx - k, cy - r, cx, cy - r],
        ['C', cx + k, cy - r, cx + r, cy - k, cx + r, cy],
        ['Z'],
      ],
      fill,
      stroke,
    )
  }

  save(): void {
    this.depth++
    this.ops.push('q')
  }

  restore(): void {
    if (this.depth === 0) throw new Error('restore() sans save()')
    this.depth--
    this.ops.push('Q')
  }

  rotateAbout(cx: number, cy: number, angleDeg: number): void {
    if (this.depth === 0) throw new Error('rotateAbout() hors de save() / restore()')
    // Rotation autour du point P (repère PDF) : translation de P à l'origine, rotation, retour en P ;
    // la translation est calculée avec les coefficients tels qu'ils sont écrits
    const [cos, sin] = rotation(angleDeg)
    const px = cx
    const py = PAGE_H - cy
    const tx = px - cos * px + sin * py
    const ty = py - sin * px - cos * py
    this.ops.push(`${coef(cos)} ${coef(sin)} ${coef(-sin)} ${coef(cos)} ${num(tx)} ${num(ty)} cm`)
  }

  logo(x: number, top: number, height: number): { width: number; baseline: number } {
    const form = logoForm()
    const k = height / form.height
    const tx = x - k * form.x
    const ty = PAGE_H - top + k * form.y
    this.ops.push(`q ${coef(k)} 0 0 ${coef(k)} ${num(tx)} ${num(ty)} cm /Logo Do Q`)
    this.usesLogo = true
    return { width: form.width * k, baseline: top + form.baselineRatio * height }
  }

  link(x: number, y: number, w: number, h: number, uri: string): void {
    this.annots.push({ rect: [x, PAGE_H - y - h, x + w, PAGE_H - y], uri })
  }

  artifact(draw: () => void): void {
    const depth = this.depth
    this.ops.push('/Artifact BMC')
    draw()
    if (this.depth !== depth) throw new Error('artefact qui enjambe save() / restore()')
    this.ops.push('EMC')
  }

  /** Contenu du flux ; lève une erreur si save() et restore() ne se répondent pas */
  content(): string {
    if (this.depth !== 0) throw new Error('save() sans restore() sur une page')
    return this.ops.join('\n')
  }
}

/* ---------- Document ---------- */

export interface PdfInfo {
  /** Titre affiché par les lecteurs (/Title, DisplayDocTitle) */
  title: string
  /** Moment de fabrication (/CreationDate), sur l'horloge et le fuseau de l'appareil */
  created: Date
  /** Langue du document (/Lang) : fr-FR par défaut */
  lang?: string
  /** /Creator et /Producer : « Isoloir » par défaut */
  creator?: string
}

/** Date PDF « D:AAAAMMJJHHmmSS+HH'mm' », heure locale et décalage de l'appareil */
export function pdfDate(d: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  const offset = -d.getTimezoneOffset()
  const sign = offset < 0 ? '-' : '+'
  const abs = Math.abs(offset)
  return (
    `D:${p(d.getFullYear(), 4)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}` +
    `${sign}${p(Math.floor(abs / 60))}'${p(abs % 60)}'`
  )
}

/** Adresse d'une annotation : ASCII imprimable seulement (le reste en %XX), parenthèses échappées */
function uriLiteral(uri: string): string {
  const ascii = uri.replace(/[^\x21-\x7e]/gu, c => encodeURIComponent(c))
  return pdfLiteral(Array.from(ascii, c => c.charCodeAt(0)))
}

const HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a] // %PDF-1.4\n%âãÏÓ\n

export class PdfWriter {
  private readonly info: PdfInfo
  private readonly pages: Page[] = []
  private readonly lostChars: string[] = []

  constructor(info: PdfInfo) {
    this.info = info
  }

  addPage(): PdfCanvas {
    const page = new Page(this.lostChars)
    this.pages.push(page)
    return page
  }

  get pageCount(): number {
    return this.pages.length
  }

  /** Page i (à partir de 0) : pour poser les pieds de page une fois le total connu */
  page(i: number): PdfCanvas {
    const page = this.pages[i]
    if (!page) throw new Error(`page ${i} absente (${this.pages.length} pages)`)
    return page
  }

  /** Caractères omis faute de code WinAnsi, chacun une fois, dans l'ordre d'apparition */
  get lost(): string[] {
    return [...new Set(this.lostChars)]
  }

  toBytes(): Uint8Array<ArrayBuffer> {
    if (!this.pages.length) throw new Error('document sans page')
    const objects: string[] = []
    const add = (body: string) => objects.push(body)
    const usesLogo = this.pages.some(p => p.usesLogo)
    const stream = (dict: string, body: string) => `<< ${dict}/Length ${body.length} >>\nstream\n${body}\nendstream`

    // 1 Catalog, 2 Pages, 3 et 4 polices, 5 Info, 6 logo (s'il sert), puis chaque page, son flux et ses liens
    const firstPage = usesLogo ? 7 : 6
    const pageRefs: number[] = []
    let next = firstPage
    for (const p of this.pages) {
      pageRefs.push(next)
      next += 2 + p.annots.length
    }
    const creator = pdfUtf16(this.info.creator ?? 'Isoloir')
    add(
      `<< /Type /Catalog /Pages 2 0 R /Lang ${pdfLiteral(Array.from(this.info.lang ?? 'fr-FR', c => c.charCodeAt(0)))} ` +
        '/ViewerPreferences << /DisplayDocTitle true >> /PageLayout /OneColumn >>',
    )
    add(`<< /Type /Pages /Kids [${pageRefs.map(r => `${r} 0 R`).join(' ')}] /Count ${this.pages.length} >>`)
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')
    add(
      `<< /Title ${pdfUtf16(this.info.title)} /Creator ${creator} /Producer ${creator} ` +
        `/CreationDate ${pdfLiteral(Array.from(pdfDate(this.info.created), c => c.charCodeAt(0)))} >>`,
    )
    if (usesLogo) {
      const form = logoForm()
      const body = form.parts.map(part => `${rgb(part.color)} rg ${pathOps(part.cmds, false)} f`).join('\n')
      // Boîte arrondie vers l'extérieur, au centième (sans grossir pour une erreur d'arrondi binaire)
      const down = (v: number) => Math.floor(v * 100 + 1e-6) / 100
      const up = (v: number) => Math.ceil(v * 100 - 1e-6) / 100
      const bbox = [down(form.x), down(form.y), up(form.x + form.width), up(form.y + form.height)]
      add(stream(`/Type /XObject /Subtype /Form /FormType 1 /BBox [${bbox.map(num).join(' ')}] /Matrix [1 0 0 -1 0 0] /Resources << >> `, body))
    }
    const resources =
      '/Resources << /Font << /F1 3 0 R /F2 4 0 R >> ' + (usesLogo ? '/XObject << /Logo 6 0 R >> ' : '') + '/ProcSet [/PDF /Text] >>'
    this.pages.forEach((p, i) => {
      const ref = pageRefs[i] as number
      const annots = p.annots.map((_, k) => `${ref + 2 + k} 0 R`)
      add(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${num(PAGE_W)} ${num(PAGE_H)}] ${resources} /Contents ${ref + 1} 0 R` +
          (annots.length ? ` /Annots [${annots.join(' ')}]` : '') +
          ' >>',
      )
      add(stream('', p.content()))
      for (const a of p.annots) {
        add(
          `<< /Type /Annot /Subtype /Link /Rect [${a.rect.map(num).join(' ')}] /Border [0 0 0] ` +
            `/A << /S /URI /URI ${uriLiteral(a.uri)} >> >>`,
        )
      }
    })

    // Assemblage : tout est ASCII après l'en-tête, un caractère = un octet
    let body = ''
    const offsets: number[] = []
    objects.forEach((o, i) => {
      offsets.push(HEADER.length + body.length)
      body += `${i + 1} 0 obj\n${o}\nendobj\n`
    })
    const xref = HEADER.length + body.length
    body +=
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
      offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('') +
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF\n`

    const bytes = new Uint8Array(new ArrayBuffer(HEADER.length + body.length))
    bytes.set(HEADER)
    for (let i = 0; i < body.length; i++) {
      const c = body.charCodeAt(i)
      if (c > 0x7e) throw new Error(`octet non ASCII dans le corps du PDF, position ${i}`)
      bytes[HEADER.length + i] = c
    }
    return bytes
  }
}
