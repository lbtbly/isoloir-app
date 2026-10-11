// Moteur PDF du dépouillement (src/core/pdf) : encodage WinAnsi, échappement, largeurs, coupure des lignes,
// structure du fichier (en-tête, xref aux décalages exacts, trailer, /Info, /Lang), nombres et flux en ASCII,
// arcs du logo, mise en page par blocs, déterminisme. Le fichier est relu par tools/pdf-text.mjs, comme dans l'e2e.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { LOGO } from '../src/core/brand'
import { Flow, layoutProblems, type Block, type FlowLogEntry } from '../src/core/pdf/flow'
import { WIDTHS_BOLD, WIDTHS_REGULAR } from '../src/core/pdf/metrics'
import { arcToBeziers, cross, initials, logoForm, stamp, star, svgPathToCmds, tally, tallyWidth } from '../src/core/pdf/shapes'
import { inlineRows, truncate, wrapRuns, wrapText } from '../src/core/pdf/text'
import { decodeWinAnsi, encodeWinAnsi, frenchSpaces, NBSP, pdfLiteral, pdfUtf16, prepareText } from '../src/core/pdf/winansi'
import { measure, num, PAGE_H, PdfWriter, type PdfCanvas, type TextStyle } from '../src/core/pdf/writer'
import { tallyStroke } from '../src/core/tally'
import { readPdf } from '../tools/pdf-text.mjs'

const ROOT = join(import.meta.dirname, '..')
const R = (size: number, extra: Partial<TextStyle> = {}): TextStyle => ({ font: 'R', size, color: '#17191c', ...extra })
const Bd = (size: number, extra: Partial<TextStyle> = {}): TextStyle => ({ font: 'B', size, color: '#17191c', ...extra })
const latin1 = (b: Uint8Array) => Array.from(b, c => String.fromCharCode(c)).join('')

/** Un petit document de deux pages qui exerce tout l'écrivain */
function sample(created = new Date(2026, 9, 11, 21, 5, 0)): PdfWriter {
  const w = new PdfWriter({ title: 'Votre dépouillement · Présidentielle 2027', created })
  const p1 = w.addPage()
  const lg = p1.logo(42.52, 34, 20)
  p1.textRight(552.76, lg.baseline, 'Présidentielle 2027', R(9))
  p1.text(42.52, 114, 'Votre dépouillement', Bd(36, { tz: 80 }))
  p1.text(42.52, 140, '« Garde-fous » : l’État, l’œuvre, Œdipe, ça, déjà ! 50 % ? Oui ; 3 € – 4 € — fin…', R(9))
  p1.text(42.52, 154, 'Énoncé\u202f? Moins\u2212un, CO₂, ≥ 3, → suite, Ștefan.', R(9))
  stamp(p1, 424.76, 86, 'Positions arrêtées au', '09.10.2026', { color: '#17191c' })
  tally(p1, 400, 170, 17, { color: '#1f3bb3' })
  cross(p1, 50, 200, '#c90f1a')
  star(p1, 60, 196, 8, '#1f3bb3')
  initials(p1, 90, 200, 10, 'MLP', { ink: '#17191c', paper: '#ffffff', size: 7 })
  p1.textRotated(120, 260, 90, 'Nicolas Dupont-Aignan', Bd(7.5))
  p1.rect(150, 200, 20, 15, '#dcf7e1', { color: '#17191c', width: 0.6 })
  p1.circle(200, 210, 8, undefined, { color: '#4a4f57', width: 0.9 })
  p1.path([['M', 220, 200], ['L', 230, 210], ['C', 232, 212, 236, 212, 240, 200], ['Z']], '#9aa7dd')
  p1.link(42.52, 806, 80, 10, 'https://isoloir.vercel.app/#/methode')
  const p2 = w.addPage()
  p2.text(42.52, 100, 'Le classement (suite)', Bd(13, { tz: 85 }))
  for (let i = 0; i < w.pageCount; i++) w.page(i).textRight(552.76, 824.5, `page ${i + 1}/${w.pageCount}`, R(7))
  return w
}

describe('encodage WinAnsi', () => {
  it('relit à l’identique les caractères du français', () => {
    const s = 'éèàçœŒæÉ«»’…–—€êëîïôûùüÿÀÂÇÈÊÎÔÛÙ°·×‘“”„•™'
    const { bytes, lost } = encodeWinAnsi(s)
    expect(lost).toEqual([])
    expect(decodeWinAnsi(bytes)).toBe(s)
    expect(bytes.length).toBe([...s].length)
    // Avec espaces : celles qui jouxtent les guillemets et la ponctuation haute deviennent insécables
    const spaced = 'é è à ç œ Œ æ É « » ’ … – — €'
    expect(decodeWinAnsi(encodeWinAnsi(spaced).bytes)).toBe(frenchSpaces(spaced))
    expect(decodeWinAnsi(encodeWinAnsi(spaced).bytes)).toBe(`é è à ç œ Œ æ É «${NBSP}» ’ … – — €`)
  })

  it('substitue les caractères hors WinAnsi et signale ce qui se perd', () => {
    const code = (s: string) => Array.from(encodeWinAnsi(s).bytes)
    expect(code('\u202f')).toEqual([0xa0])
    expect(code('\u2007')).toEqual([0xa0])
    expect(code('\u2212')).toEqual([0x96])
    expect(code('a\u00adb')).toEqual([0x61, 0x62])
    expect(code('a\u200bb\ufeff')).toEqual([0x61, 0x62])
    expect(code('\u2011')).toEqual([0x2d])
    const roundTrip = (s: string) => decodeWinAnsi(encodeWinAnsi(s).bytes)
    expect(roundTrip('ț ș ă ď')).toBe('t s a d')
    expect(roundTrip('Ștefan Țiriac')).toBe('Stefan Tiriac')
    expect(roundTrip('≥ 3, ≤ 2')).toBe('>= 3, <= 2')
    expect(roundTrip('→ et ←')).toBe('-> et <-')
    expect(roundTrip('CO₂, 1ᵉʳ, ²')).toBe('CO2, 1er, ²')
    const emoji = encodeWinAnsi('Vote 🗳\ufe0f ici')
    expect(decodeWinAnsi(emoji.bytes)).toBe('Vote  ici')
    expect(emoji.lost).toEqual(['🗳'])
    expect(encodeWinAnsi('Préparé, sans perte : « oui ».').lost).toEqual([])
  })

  it('pose les espaces françaises', () => {
    expect(frenchSpaces('Archive : oui ; non ! quoi ? « mot » 50 %')).toBe(
      `Archive${NBSP}: oui${NBSP}; non${NBSP}! quoi${NBSP}? «${NBSP}mot${NBSP}» 50${NBSP}%`,
    )
    expect(frenchSpaces('https://isoloir.vercel.app/#/methode')).toBe('https://isoloir.vercel.app/#/methode')
    // Préparer deux fois ne change rien
    const once = prepareText('Énoncé\u202f? « Oui » : 50 % — ≥ 3')
    expect(prepareText(once)).toBe(once)
  })

  it('échappe les chaînes PDF en ASCII pur', () => {
    const lit = (s: string) => pdfLiteral(encodeWinAnsi(s).bytes)
    expect(lit('a(b)c\\d')).toBe('(a\\(b\\)c\\\\d)')
    expect(lit('é')).toBe('(\\351)')
    expect(lit('’')).toBe('(\\222)')
    expect(lit('ligne\nsuite\r')).toBe('(ligne suite )')
    for (const s of ['é(è)\\', 'Œuvre « x »', 'a\tb\nc']) {
      const out = lit(s)
      expect(/[\r\n]/.test(out)).toBe(false)
      expect([...out].every(c => c.charCodeAt(0) >= 0x20 && c.charCodeAt(0) < 0x7f)).toBe(true)
    }
    expect(pdfUtf16('Dé')).toBe('<FEFF00440065>'.replace('0065', '00E9'))
  })
})

describe('largeurs et mesure', () => {
  const w = (table: readonly number[], ch: string) => table[ch.charCodeAt(0) === 0x2019 ? 0x92 - 0x20 : ch.charCodeAt(0) - 0x20]
  const at = (table: readonly number[], code: number) => table[code - 0x20]

  it('reprend les chasses d’Helvetica', () => {
    expect(WIDTHS_REGULAR).toHaveLength(224)
    expect(WIDTHS_BOLD).toHaveLength(224)
    const reg: [string | number, number][] = [
      [' ', 278], ['a', 556], ['i', 222], ['m', 833], ['A', 667], ['W', 944], [0x92, 222], [0x85, 1000], [0x96, 556],
      [0x97, 1000], [0xab, 556], [0x9c, 944], [0x8c, 1000], ['%', 889], ['0', 556], ['9', 556], [0xe9, 556], [0xe7, 500], [0xb7, 278],
    ]
    for (const [c, v] of reg) expect(typeof c === 'number' ? at(WIDTHS_REGULAR, c) : w(WIDTHS_REGULAR, c)).toBe(v)
    const bold: [string | number, number][] = [['i', 278], ['m', 889], ['A', 722], [0x92, 278], ['?', 611], [0xe7, 556], ['0', 556], [0xb7, 278]]
    for (const [c, v] of bold) expect(typeof c === 'number' ? at(WIDTHS_BOLD, c) : w(WIDTHS_BOLD, c)).toBe(v)
  })

  it('mesure avec Tz et Tc, sans crénage', () => {
    expect(measure('MLP', Bd(7, { tz: 85 }))).toBeCloseTo(12.56, 2)
    expect(measure('Nicolas Dupont-Aignan', Bd(7.5))).toBeCloseTo(82.9, 1)
    expect(measure('100', Bd(8))).toBeCloseTo(13.34, 2)
    expect(measure('Bioéthique et droits des personnes LGBTQIA+', R(8))).toBeCloseTo(164.8, 1)
    expect(measure('Votre dépouillement', Bd(36, { tz: 80 }))).toBeCloseTo(276.9, 1)
    // Tc s'ajoute à chaque caractère, Tz s'applique au tout
    expect(measure('abc', R(10, { tc: 1 }))).toBeCloseTo(measure('abc', R(10)) + 3, 6)
    expect(measure('abc', R(10, { tz: 50, tc: 1 }))).toBeCloseTo((measure('abc', R(10)) + 3) / 2, 6)
    // Le texte est préparé avant d'être mesuré : U+202F mesure comme une espace
    expect(measure('a\u202f?', R(10))).toBeCloseTo(measure('a ?', R(10)), 6)
  })
})

describe('coupure des lignes', () => {
  const st = R(9)
  const text =
    'Les questions et les approches citées ont été rédigées par une IA (Claude, d’Anthropic) à partir des positions publiques des candidats : 50 % ne veut rien dire ici ; « vraiment » ?'

  it('ne dépasse jamais la largeur et ne coupe jamais sur une insécable', () => {
    for (const width of [60, 90, 140, 200, 333]) {
      const lines = wrapText(text, width, st)
      for (const l of lines) {
        expect(measure(l, st)).toBeLessThanOrEqual(width + 1e-6)
        expect(l.startsWith(NBSP) || l.endsWith(NBSP) || l.startsWith(' ') || l.endsWith(' ')).toBe(false)
        expect(/^[:;!?%»]/.test(l)).toBe(false)
      }
      // Les mots sont tous là, dans l'ordre
      expect(lines.join(' ').replace(/\u00a0/g, ' ')).toBe(prepareText(text).replace(/\u00a0/g, ' '))
      // Les paires liées par une insécable restent ensemble
      expect(lines.some(l => l.endsWith('50') || l.startsWith('%'))).toBe(false)
    }
  })

  it('coupe un mot trop long après « / », « . » ou « - », sinon entre deux caractères', () => {
    const url = 'isoloir.vercel.app/#/choisir-2027/methode/hors-classement'
    const lines = wrapText(url, 80, st)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join('')).toBe(url)
    for (const l of lines.slice(0, -1)) expect(/[/.-]$/.test(l)).toBe(true)
    for (const l of lines) expect(measure(l, st)).toBeLessThanOrEqual(80 + 1e-6)
    const word = 'Anticonstitutionnellementissimement'
    const cut = wrapText(word, 40, st)
    expect(cut.join('')).toBe(word)
    for (const l of cut) expect(measure(l, st)).toBeLessThanOrEqual(40 + 1e-6)
  })

  it('coupe des suites de styles et garde leurs styles', () => {
    const runs = [
      { text: 'En ne gardant que leurs approches principales, ', style: R(9) },
      { text: 'Raphaël Glucksmann', style: Bd(9) },
      { text: ' et ', style: R(9) },
      { text: 'Marine Le Pen', style: Bd(9) },
      { text: ' passent devant. Méthode : isoloir.vercel.app/#/methode', style: R(9), link: 'https://isoloir.vercel.app/#/methode' },
    ]
    const lines = wrapRuns(runs, 150, 90)
    expect(lines[0]!.width).toBeLessThanOrEqual(90 + 1e-6)
    for (const l of lines.slice(1)) expect(l.width).toBeLessThanOrEqual(150 + 1e-6)
    const all = lines.flatMap(l => l.pieces)
    expect(all.filter(p => p.style.font === 'B').map(p => p.text).join(' ')).toContain('Glucksmann')
    expect(all.some(p => p.link && p.text.includes('isoloir'))).toBe(true)
    // Les décalages se suivent sur chaque ligne
    for (const l of lines) {
      let x = 0
      for (const p of l.pieces) {
        expect(p.x).toBeCloseTo(x, 6)
        x += p.width
      }
    }
    // Espace insécable posée à la jonction de deux morceaux
    const joined = wrapRuns([{ text: 'Franchie par ', style: Bd(8) }, { text: ': Marine Le Pen', style: R(8) }], 500)
    expect(joined[0]!.pieces[0]!.text).toBe(`Franchie par${NBSP}`)
  })

  it('tronque avec « … » mesuré', () => {
    const st2 = Bd(10.5)
    const name = 'Nicolas Dupont-Aignan de la Grande Longueur'
    for (const width of [20, 50, 100, 150]) {
      const t = truncate(name, width, st2)
      expect(measure(t, st2)).toBeLessThanOrEqual(width + 1e-6)
      expect(t.endsWith('…')).toBe(true)
    }
    expect(truncate('Court', 100, st2)).toBe('Court')
    expect(truncate(name, 2, st2)).toBe('')
  })

  it('range les éléments insécables en rangées', () => {
    expect(inlineRows([30, 30, 30, 30], 110, 10)).toEqual([[0, 1, 2], [3]])
    expect(inlineRows([30, 30, 30, 30], 100, 10)).toEqual([[0, 1], [2, 3]])
    expect(inlineRows([30, 30, 30], 100, 10, 40)).toEqual([[0], [1, 2]])
    expect(inlineRows([150, 20], 100, 10)).toEqual([[0], [1]])
  })
})

describe('structure du fichier', () => {
  const bytes = sample().toBytes()
  const s = latin1(bytes)
  const doc = readPdf(bytes)

  it('a l’en-tête, la fin et la table xref d’un PDF 1.4', () => {
    expect(bytes.buffer).toBeInstanceOf(ArrayBuffer)
    expect(bytes.byteOffset).toBe(0)
    expect(bytes.byteLength).toBe(bytes.buffer.byteLength)
    expect(s.startsWith('%PDF-1.4\n%')).toBe(true)
    expect(Array.from(bytes.subarray(10, 14)).every(b => b > 127)).toBe(true)
    expect(s.endsWith('%%EOF\n')).toBe(true)
    const startxref = Number(/startxref\n(\d+)\n%%EOF\n$/.exec(s)![1])
    expect(s.slice(startxref, startxref + 5)).toBe('xref\n')
    const head = /^xref\n0 (\d+)\n/.exec(s.slice(startxref))!
    const size = Number(head[1])
    const table = s.slice(startxref + head[0].length, startxref + head[0].length + 20 * size)
    expect(table.slice(0, 20)).toBe('0000000000 65535 f \n')
    for (let n = 1; n < size; n++) {
      const entry = table.slice(20 * n, 20 * n + 20)
      expect(entry).toMatch(/^\d{10} 00000 n \n$/)
      const offset = Number(entry.slice(0, 10))
      expect(s.slice(offset, offset + `${n} 0 obj\n`.length)).toBe(`${n} 0 obj\n`)
    }
    expect(s.slice(startxref + head[0].length + 20 * size)).toMatch(new RegExp(`^trailer\\n<< /Size ${size} /Root 1 0 R /Info 5 0 R >>\\n`))
    expect(doc.version).toBe('1.4')
    expect(doc.size).toBe(size)
    expect(doc.objects.size).toBe(size - 1)
  })

  it('a un catalogue, des pages A4, un titre et une langue', () => {
    expect(doc.pages).toHaveLength(2)
    expect(doc.info.lang).toBe('fr-FR')
    expect(doc.info.title).toBe('Votre dépouillement · Présidentielle 2027')
    expect(doc.info.creator).toBe('Isoloir')
    expect(doc.info.creationDate).toMatch(/^D:20261011210500[+-]\d{2}'\d{2}'$/)
    expect(s).toContain('/ViewerPreferences << /DisplayDocTitle true >>')
    expect(s).toContain('/Title <FEFF')
    expect(doc.pages[0]!.mediaBox).toEqual([0, 0, 595.28, 841.89])
    expect(doc.pages[0]!.links).toEqual(['https://isoloir.vercel.app/#/methode'])
    expect(s).toContain('/BaseFont /Helvetica /Encoding /WinAnsiEncoding')
    expect(s).toContain('/BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding')
    // Un seul XObject pour le logo
    expect(s.match(/\/Subtype \/Form/g)).toHaveLength(1)
  })

  it('se relit : texte français intact, dans l’ordre, page par page', () => {
    const p1 = doc.pages[0]!.text
    expect(p1).toContain('Votre dépouillement')
    expect(p1).toContain(`«${NBSP}Garde-fous${NBSP}»${NBSP}: l’État, l’œuvre, Œdipe, ça, déjà${NBSP}! 50${NBSP}%${NBSP}? Oui${NBSP}; 3 € – 4 € — fin…`)
    expect(p1).toContain(`Énoncé${NBSP}? Moins–un, CO2, >= 3, -> suite, Stefan.`)
    expect(p1).toContain('POSITIONS ARRÊTÉES AU')
    expect(p1).toContain('09.10.2026')
    expect(p1).toContain('Nicolas Dupont-Aignan')
    expect(p1.indexOf('Présidentielle 2027')).toBeLessThan(p1.indexOf('Votre dépouillement'))
    expect(p1).toContain('page 1/2')
    expect(doc.pages[1]!.text).toContain('Le classement (suite)')
    expect(doc.pages[1]!.text).toContain('page 2/2')
  })

  it('marque les initiales du cercle comme artefact : dessinées, mais hors du texte relu', () => {
    const content = doc.pages[0]!.content
    expect(content).toMatch(/\/Artifact BMC\nBT [^\n]*\(MLP\) Tj ET\nEMC/)
    expect(doc.pages[0]!.text).not.toContain('MLP')
    // Un artefact n'enjambe jamais save() / restore()
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    const c = w.addPage()
    expect(() => c.artifact(() => c.save())).toThrow(/enjambe/)
  })

  it('n’écrit que de l’ASCII dans les flux et des nombres propres', () => {
    for (const p of doc.pages) {
      expect(p.contentAscii).toBe(true)
      expect(p.content).not.toMatch(/NaN|Infinity|\d[eE][-+]?\d/)
      expect(p.content).not.toMatch(/(^|[\s[])-0(?![.\d])/)
      // Aucun code WinAnsi sans caractère dans les chaînes
      for (const m of p.content.matchAll(/\\(\d{3})/g)) expect([0o201, 0o215, 0o217, 0o220, 0o235]).not.toContain(parseInt(m[1]!, 8))
    }
    for (const o of doc.objects.values()) if (o.stream) expect(Array.from(o.stream).every(b => b < 0x80)).toBe(true)
    // Tout le fichier est ASCII après les 15 octets d'en-tête
    expect(Array.from(bytes.subarray(15)).every(b => b < 0x80)).toBe(true)
  })

  it('refuse les nombres invalides et signale les caractères perdus', () => {
    expect(() => num(NaN)).toThrow()
    expect(() => num(Infinity)).toThrow()
    expect(num(-0)).toBe('0')
    expect(num(-0.001)).toBe('0')
    expect(num(1e-7)).toBe('0')
    expect(num(12.345)).toBe('12.35')
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    const c = w.addPage()
    expect(() => c.text(10, 10, 'x', R(Number.NaN))).toThrow()
    c.text(10, 20, 'Vote 🗳\ufe0f et ✓', R(9))
    expect(w.lost).toEqual(['🗳', '✓'])
    expect(() => c.restore()).toThrow()
    c.save()
    expect(() => w.toBytes()).toThrow(/save/)
  })

  it('est déterministe', () => {
    const a = sample().toBytes()
    const b = sample().toBytes()
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true)
    expect(Buffer.from(sample(new Date(2026, 9, 12)).toBytes()).equals(Buffer.from(a))).toBe(false)
  })

  it('tourne dans le bon sens', () => {
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    const c = w.addPage()
    c.textRotated(100, 200, 90, 'Haut', R(8))
    c.save()
    c.rotateAbout(50, 50, 4)
    c.restore()
    const content = readPdf(w.toBytes()).pages[0]!.content
    // +90° : se lit de bas en haut (cos 0, sin 1)
    expect(content).toContain(`0 1 -1 0 100 ${num(PAGE_H - 200)} Tm`)
    // +4° : sens inverse des aiguilles d'une montre dans le repère PDF (sin positif en b)
    expect(content).toMatch(/q\n0\.9976 0\.0698 -0\.0698 0\.9976 [\d.-]+ [\d.-]+ cm\nQ/)
  })
})

describe('arcs et logo', () => {
  /** Arcs « A » d'un chemin SVG absolu, avec leur point de départ */
  function arcsOf(d: string) {
    const t = d.match(/[A-Za-z]|[-+]?(?:\d+\.?\d*|\.\d+)/g)!
    const arcs: number[][] = []
    let i = 0, x = 0, y = 0, sx = 0, sy = 0
    const n = () => Number(t[i++])
    while (i < t.length) {
      const c = t[i++]
      if (c === 'M') { x = n(); y = n(); sx = x; sy = y }
      else if (c === 'L') { x = n(); y = n() }
      else if (c === 'C') { i += 4; x = n(); y = n() }
      else if (c === 'A') { const a = [x, y, n(), n(), n(), n(), n(), n(), n()]; arcs.push(a); x = a[7]!; y = a[8]! }
      else if (c === 'Z') { x = sx; y = sy }
    }
    return arcs
  }
  const bezier = (c: { x0: number; y0: number; x1: number; y1: number; x2: number; y2: number; x3: number; y3: number }, t: number) => {
    const u = 1 - t
    return [
      u * u * u * c.x0 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x3,
      u * u * u * c.y0 + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y3,
    ] as const
  }
  /** Distance (majorée) d'un point à l'ellipse : écart au point de même angle excentrique */
  const offEllipse = (a: ReturnType<typeof arcToBeziers>, [x, y]: readonly [number, number]) => {
    const dx = x - a.cx, dy = y - a.cy
    const u = (Math.cos(a.phi) * dx + Math.sin(a.phi) * dy) / a.rx
    const v = (-Math.sin(a.phi) * dx + Math.cos(a.phi) * dy) / a.ry
    const th = Math.atan2(v, u)
    const ex = a.rx * Math.cos(th), ey = a.ry * Math.sin(th)
    return Math.hypot(u * a.rx - ex, v * a.ry - ey)
  }
  function checkArc(x1: number, y1: number, rx: number, ry: number, phi: number, fa: number, fs: number, x2: number, y2: number) {
    const a = arcToBeziers(x1, y1, rx, ry, phi, fa, fs, x2, y2)
    expect(a.cubics.length).toBeGreaterThan(0)
    expect(a.cubics.length).toBeLessThanOrEqual(4)
    const first = a.cubics[0]!, last = a.cubics[a.cubics.length - 1]!
    expect(Math.hypot(first.x0 - x1, first.y0 - y1)).toBeLessThan(1e-6)
    expect(Math.hypot(last.x3 - x2, last.y3 - y2)).toBeLessThan(1e-6)
    a.cubics.forEach((c, k) => {
      if (k) expect(Math.hypot(c.x0 - a.cubics[k - 1]!.x3, c.y0 - a.cubics[k - 1]!.y3)).toBeLessThan(1e-9)
      expect(offEllipse(a, bezier(c, 0.5))).toBeLessThan(0.05)
      expect(offEllipse(a, bezier(c, 0.25))).toBeLessThan(0.05)
    })
    return a
  }

  it('convertit les arcs SVG en Bézier fidèles', () => {
    checkArc(100, 0, 100, 100, 0, 0, 1, -100, 0)
    checkArc(100, 0, 100, 100, 0, 0, 0, -100, 0)
    checkArc(0, 0, 50, 30, 0, 1, 1, 40, 20)
    checkArc(0, 0, 50, 30, 0, 0, 1, 40, 20)
    checkArc(0, 0, 50, 30, 30, 1, 0, 40, 20)
    // Rayons trop petits : agrandis (F.6.6)
    const grown = checkArc(0, 0, 1, 1, 0, 0, 1, 10, 0)
    expect(grown.rx).toBeCloseTo(5, 9)
    // L'ellipse aplatie de l'ombre du logo
    const shadow = arcsOf(LOGO.horizontal.shadow)
    expect(shadow).toHaveLength(1)
    expect(shadow[0]!.slice(2, 4)).toEqual([92, 14])
    checkArc(...(shadow[0] as [number, number, number, number, number, number, number, number, number]))
    // Tous les arcs du logo
    const g = LOGO.horizontal
    const all = [g.shadow, g.disc, ...g.drape, g.word].flatMap(arcsOf)
    expect(all.length).toBeGreaterThanOrEqual(17)
    for (const a of all) checkArc(...(a as [number, number, number, number, number, number, number, number, number]))
  })

  it('reprend le logo de brand.ts sans le redessiner', () => {
    const form = logoForm()
    expect(form.x).toBeCloseTo(-136, 6)
    expect(form.y).toBeCloseTo(-100, 6)
    expect(form.width).toBeCloseTo(697.7, 1)
    expect(form.height).toBeCloseTo(200.157, 2)
    expect(form.baselineRatio).toBeCloseTo(0.7394, 3)
    // Ombre, disque, rideau du bleu au vert, mot
    expect(form.parts.map(p => p.color)).toEqual(['#666769', '#17191c', '#9bc2f6', '#f9e6a2', '#f8a898', '#95d4a9', '#17191c'])
    const cmds = form.parts.flatMap(p => p.cmds)
    const moves = cmds.filter(c => c[0] === 'M').length
    const closes = cmds.filter(c => c[0] === 'Z').length
    expect(moves).toBe(18)
    expect(closes).toBe(18)
    // Chaque sous-chemin se ferme avant le suivant
    let open = false
    for (const c of cmds) {
      if (c[0] === 'M') {
        expect(open).toBe(false)
        open = true
      } else if (c[0] === 'Z') open = false
    }
    expect(() => svgPathToCmds('M0 0 l10 10')).toThrow()
    expect(() => svgPathToCmds('M0 0 H10')).toThrow()
  })

  it('écrit le logo une fois, en XObject retourné', () => {
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    w.addPage().logo(10, 10, 20)
    w.addPage().logo(10, 10, 20)
    const s = latin1(w.toBytes())
    expect(s.match(/\/Logo Do/g)).toHaveLength(2)
    expect(s.match(/\/Subtype \/Form/g)).toHaveLength(1)
    expect(s).toContain('/BBox [-136 -100 561.7 100.16] /Matrix [1 0 0 -1 0 0]')
    // Sans logo, pas de XObject
    const plain = new PdfWriter({ title: 't', created: new Date(0) })
    plain.addPage().text(10, 10, 'x', R(8))
    expect(latin1(plain.toBytes())).not.toContain('/XObject')
  })
})

describe('bâtons', () => {
  it('suivent le tracé de l’écran', () => {
    // Même formule que Tally.tsx
    const j = (i: number, k: number) => {
      const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
      return (x - Math.floor(x) - 0.5) * 1.4
    }
    expect(tallyStroke(0)).toEqual([4 + j(0, 1), 3 + j(0, 2), 4.4 + j(0, 3), 23 + j(0, 4)])
    expect(tallyStroke(9)).toEqual([0.8 + j(9, 5), 19.5 + j(9, 6), 28.5 + j(9, 7), 6 + j(9, 8)])
    expect(tallyWidth(0)).toBe(0)
    expect(tallyWidth(20)).toBeCloseTo(67.8, 6)
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    const c = w.addPage()
    for (let n = 0; n <= 20; n++) expect(tally(c, 10, 10 + n * 20, n, { color: '#1f3bb3' })).toBeCloseTo(tallyWidth(n), 6)
    const content = readPdf(w.toBytes()).pages[0]!.content
    expect(content.match(/ l S/g)).toHaveLength(210)
    expect(content).toContain('1.05 w 1 J')
  })
})

describe('mise en page par blocs', () => {
  function setup(bottom = 300, top = 50) {
    const w = new PdfWriter({ title: 't', created: new Date(0) })
    const flow = new Flow({ bottom, newPage: () => ({ canvas: w.addPage(), top }) })
    return { w, flow }
  }
  const block = (kind: string, height: number, extra: Partial<Block> = {}): Block => ({
    kind,
    height,
    draw: (c: PdfCanvas, y: number) => c.text(10, y + height - 2, `${kind} ${extra.id ?? ''}`, R(8)),
    ...extra,
  })

  it('passe en page suivante un bloc qui ne tient pas, sans l’espace qui le précède', () => {
    const { w, flow } = setup()
    flow.place(block('a', 100))
    flow.place(block('b', 100, { gap: 10 }))
    flow.place(block('c', 100, { gap: 10 }))
    flow.flush()
    expect(w.pageCount).toBe(2)
    expect(flow.log.map(e => [e.kind, e.page, e.y])).toEqual([['a', 0, 50], ['b', 0, 160], ['c', 1, 50]])
    // Pour le rapport, une page s'ouvre par un titre ou par « (suite) » : c, bloc nu, est signalé
    expect(layoutProblems(flow.log, 300)).toEqual(['c (page 2) ouvre sa page sans titre ni « (suite) »'])
  })

  it('ne laisse jamais un titre seul en bas de page', () => {
    const { flow } = setup()
    flow.place(block('a', 150))
    flow.place(block('h2', 30, { heading: true, keepWithNext: 2, gap: 10 }))
    flow.place(block('row', 30, { id: '1' }))
    flow.place(block('row', 30, { id: '2' }))
    flow.place(block('row', 30, { id: '3' }))
    flow.flush()
    // a (50 → 200), puis titre + 2 lignes = 100 pt : ne tient pas (200 + 10 + 90 > 300 ? 300 = 300 : tient)
    expect(flow.log.find(e => e.kind === 'h2')!.page).toBe(0)
    const { flow: f2 } = setup()
    f2.place(block('a', 160))
    f2.place(block('h2', 30, { heading: true, keepWithNext: 2, gap: 10 }))
    f2.place(block('row', 30, { id: '1' }))
    f2.place(block('row', 30, { id: '2' }))
    f2.flush()
    expect(f2.log.map(e => [e.kind, e.page])).toEqual([['a', 0], ['h2', 1], ['row', 1], ['row', 1]])
    expect(f2.log[1]!.y).toBe(50)
    expect(layoutProblems(f2.log, 300)).toEqual([])
  })

  it('ouvre les pages de suite par « (suite) » et l’en-tête répété', () => {
    const { w, flow } = setup()
    const head = () => block('grid-head', 20)
    const cont = () => [block('h3', 16, { heading: true, id: 'Par thème (suite)', draw: (c, y) => void c.text(10, y + 13, 'Par thème (suite)', Bd(13)) }), head()]
    flow.place(block('h2', 30, { heading: true, keepWithNext: 2 }))
    flow.place(head())
    for (let i = 0; i < 12; i++) flow.place(block('row', 40, { id: String(i), continued: cont }))
    flow.place(block('h2', 30, { heading: true, keepWithNext: 2, gap: 20 }))
    flow.place(block('para', 40))
    flow.flush()
    const pages = new Set(flow.log.map(e => e.page))
    expect(pages.size).toBeGreaterThan(2)
    for (let p = 1; p < w.pageCount; p++) {
      const first = flow.log.filter(e => e.page === p)
      if (first[0]!.inList || first[0]!.suite) expect(first.slice(0, 2).map(e => e.kind)).toEqual(['h3', 'grid-head'])
    }
    // Le second titre ouvre sa section sans « (suite) »
    const second = flow.log.filter(e => e.kind === 'h2')[1]!
    const before = flow.log[flow.log.indexOf(second) - 1]!
    if (before.page !== second.page) expect(before.suite).toBe(false)
    expect(layoutProblems(flow.log, 300)).toEqual([])
    const text = readPdf(w.toBytes()).pages.slice(1).map(p => p.text)
    for (const t of text.slice(0, -1)) expect(t).toContain('Par thème (suite)')
  })

  it('garde l’intercalaire avec la ligne qui suit', () => {
    const { flow } = setup()
    flow.place(block('a', 190))
    flow.place(block('divider', 24, { keepWithNext: 1, gap: 10 }))
    flow.place(block('row', 54))
    flow.flush()
    expect(flow.log.map(e => e.page)).toEqual([0, 1, 1])
  })

  it('referme la page quittée par son dernier bloc (closeOnBreak)', () => {
    const { w, flow } = setup()
    const closed: [number, number][] = []
    for (let i = 0; i < 5; i++) flow.place(block('row', 60, { id: String(i), closeOnBreak: (_c, bottom) => void closed.push([i, bottom]) }))
    flow.flush()
    // Quatre lignes de 60 pt (de 50 à 290) en page 1, la cinquième en page 2 : la quatrième referme la page 1
    expect(w.pageCount).toBe(2)
    expect(closed).toEqual([[3, 290]])
  })

  it('garde deux lignes de chaque côté d’une coupure de liste (première et avant-dernière solidaires de la suivante)', () => {
    const cont = () => [block('h3', 16, { heading: true, id: 'Liste (suite)' })]
    const list = (keep: (i: number) => number) => {
      const { flow } = setup()
      flow.place(block('h2', 30, { heading: true, keepWithNext: 2 }))
      for (let i = 0; i < 6; i++) flow.place(block('row', 40, { id: String(i), continued: cont, ...(keep(i) ? { keepWithNext: keep(i) } : {}) }))
      flow.flush()
      return flow.log
    }
    // Sans précaution : cinq lignes en page 1, la sixième seule sous « (suite) »
    expect(layoutProblems(list(() => 0), 300)).toEqual(['row seule en haut de la page 2, après « (suite) »'])
    const kept = list(i => (i === 0 || i === 4 ? 1 : 0))
    expect(layoutProblems(kept, 300)).toEqual([])
    expect(kept.filter(e => e.page === 1 && e.kind === 'row').map(e => e.id)).toEqual(['4', '5'])
  })

  it('signale une page ouverte sans titre et une ligne seule en bas de page', () => {
    const e = (page: number, y: number, kind: string, o: Partial<FlowLogEntry> = {}): FlowLogEntry => ({ page, y, h: 20, kind, heading: false, suite: false, inList: false, ...o })
    const item = { inList: true }
    expect(layoutProblems([e(0, 50, 'h3', { heading: true }), e(0, 80, 'bullet'), e(1, 50, 'bullet')], 300)).toEqual(['bullet (page 2) ouvre sa page sans titre ni « (suite) »'])
    expect(
      layoutProblems([e(0, 50, 'h2', { heading: true }), e(0, 80, 'head'), e(0, 100, 'row', item), e(1, 50, 'h3', { heading: true, suite: true }), e(1, 70, 'row', item), e(1, 90, 'row', item)], 300),
    ).toEqual(['row seule en bas de la page 1 avant « (suite) »'])
  })

  it('refuse un bloc plus haut qu’une page et signale les manquements', () => {
    const { flow } = setup()
    expect(() => flow.place(block('géant', 400))).toThrow(/plus haut/)
    expect(layoutProblems([{ page: 0, y: 280, h: 30, kind: 'x', heading: false, suite: false, inList: false }], 300)).toHaveLength(1)
    expect(layoutProblems([{ page: 0, y: 200, h: 20, kind: 'h3', heading: true, suite: false, inList: false }], 300)).toHaveLength(1)
  })
})

describe('code livré', () => {
  it('ne contient aucune API d’envoi réseau, même en commentaire', () => {
    const dir = join(ROOT, 'src/core/pdf')
    const forbidden = [/navigator\.sendBeacon/, /sendBeacon/, /RTCPeerConnection/, /WebSocket/, /XMLHttpRequest/, /EventSource/, /\bfetch\(/, /importScripts/]
    for (const f of readdirSync(dir).filter(f => f.endsWith('.ts'))) {
      const src = readFileSync(join(dir, f), 'utf8')
      for (const re of forbidden) expect(re.test(src), `${f} contient ${re}`).toBe(false)
    }
  })
})
