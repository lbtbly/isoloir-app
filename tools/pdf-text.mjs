// Mini-lecteur PDF en JS pur, pour les tests (Vitest) et l'e2e : il relit les fichiers de l'écrivain maison
// (src/core/pdf/writer.ts) et en vérifie la structure au passage.
//
// readPdf(bytes) lève une erreur si l'en-tête, la table xref (entrées de 20 octets, décalages qui tombent sur
// « N 0 obj »), le trailer ou la longueur d'un flux (/Length qui mène exactement à « \nendstream ») sont faux.
// Il suit /Root → /Pages → /Kids, lit le flux de chaque page, découpe les opérateurs de texte (Tf, Tm, Td, TD,
// T*, Tz, Tc, Tj, TJ, ' et ") et décode les octets par la table WinAnsi inverse. Le texte d'une page passe à la
// ligne quand l'ordonnée change ; sur une même ligne, une espace sépare deux textes qui ne se touchent pas
// (l'avance de chaque texte est calculée avec les chasses de src/core/pdf/metrics.ts). Le texte marqué comme
// artefact (/Artifact BMC … EMC : les initiales décoratives des cercles) est sauté, comme le font les lecteurs qui
// respectent ce marquage.
// Ce n'est pas un lecteur général : pas de flux compressés, pas de xref en flux, pas de polices embarquées.
import { FIRST_CODE, WIDTHS_BOLD, WIDTHS_REGULAR } from '../src/core/pdf/metrics.ts'

/** Codes 0x80 à 0x9F de WinAnsi */
const HIGH = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c,
  0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
}
/** Octets WinAnsi vers texte Unicode */
export function decodeWinAnsi(bytes) {
  let out = ''
  for (const b of bytes) {
    if ((b >= 0x20 && b <= 0x7e) || (b >= 0xa0 && b <= 0xff)) out += String.fromCharCode(b)
    else out += HIGH[b] === undefined ? '\ufffd' : String.fromCharCode(HIGH[b])
  }
  return out
}

/* ---------- Objets PDF ---------- */

const WHITE = new Set([0x00, 0x09, 0x0a, 0x0c, 0x0d, 0x20])
const DELIM = new Set('()<>[]{}/%'.split('').map(c => c.charCodeAt(0)))

/** Lecteur d'objets sur une chaîne « latin1 » (un caractère par octet) */
class Parser {
  constructor(s, pos = 0) {
    this.s = s
    this.pos = pos
  }
  skip() {
    for (;;) {
      while (this.pos < this.s.length && WHITE.has(this.s.charCodeAt(this.pos))) this.pos++
      if (this.s[this.pos] !== '%') return
      while (this.pos < this.s.length && this.s[this.pos] !== '\n' && this.s[this.pos] !== '\r') this.pos++
    }
  }
  word() {
    const start = this.pos
    while (this.pos < this.s.length) {
      const c = this.s.charCodeAt(this.pos)
      if (WHITE.has(c) || DELIM.has(c)) break
      this.pos++
    }
    return this.s.slice(start, this.pos)
  }
  /** Chaîne littérale « (…) » : octets décodés des échappements */
  literal() {
    this.pos++ // (
    const bytes = []
    let depth = 1
    while (this.pos < this.s.length) {
      const c = this.s[this.pos++]
      if (c === '\\') {
        const d = this.s[this.pos++]
        if (/[0-7]/.test(d)) {
          let oct = d
          while (oct.length < 3 && /[0-7]/.test(this.s[this.pos])) oct += this.s[this.pos++]
          bytes.push(parseInt(oct, 8) & 0xff)
        } else if (d === 'n') bytes.push(0x0a)
        else if (d === 'r') bytes.push(0x0d)
        else if (d === 't') bytes.push(0x09)
        else if (d === 'b') bytes.push(0x08)
        else if (d === 'f') bytes.push(0x0c)
        else if (d === '\r' || d === '\n') {
          if (d === '\r' && this.s[this.pos] === '\n') this.pos++
        } else bytes.push(d.charCodeAt(0))
        continue
      }
      if (c === '(') depth++
      if (c === ')' && --depth === 0) break
      bytes.push(c.charCodeAt(0))
    }
    return { bytes }
  }
  hex() {
    this.pos++ // <
    const end = this.s.indexOf('>', this.pos)
    const h = this.s.slice(this.pos, end).replace(/\s+/g, '')
    this.pos = end + 1
    const bytes = []
    for (let i = 0; i < h.length; i += 2) bytes.push(parseInt(h.slice(i, i + 2).padEnd(2, '0'), 16))
    return { bytes, hex: true }
  }
  /** Un objet : dictionnaire, tableau, nom, nombre, chaîne, référence « n g R », booléen, null */
  value() {
    this.skip()
    const c = this.s[this.pos]
    if (c === '<' && this.s[this.pos + 1] === '<') {
      this.pos += 2
      const dict = {}
      for (;;) {
        this.skip()
        if (this.s.startsWith('>>', this.pos)) {
          this.pos += 2
          return { dict }
        }
        const key = this.value()
        if (!key || key.name === undefined) throw new Error(`clé de dictionnaire invalide à ${this.pos}`)
        dict[key.name] = this.value()
      }
    }
    if (c === '<') return this.hex()
    if (c === '(') return this.literal()
    if (c === '[') {
      this.pos++
      const arr = []
      for (;;) {
        this.skip()
        if (this.s[this.pos] === ']') {
          this.pos++
          return arr
        }
        arr.push(this.value())
      }
    }
    if (c === '/') {
      this.pos++
      return { name: this.word() }
    }
    const w = this.word()
    if (w === '') throw new Error(`objet illisible à ${this.pos} : « ${this.s.slice(this.pos, this.pos + 20)} »`)
    if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(w)) {
      // Référence « n g R » ?
      const save = this.pos
      this.skip()
      const g = this.word()
      this.skip()
      if (/^\d+$/.test(w) && /^\d+$/.test(g) && this.s[this.pos] === 'R' && !/[A-Za-z0-9]/.test(this.s[this.pos + 1] ?? '')) {
        this.pos++
        return { ref: Number(w) }
      }
      this.pos = save
      return Number(w)
    }
    if (w === 'true') return true
    if (w === 'false') return false
    if (w === 'null') return null
    return { op: w }
  }
}

const latin1 = bytes => {
  let s = ''
  for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)))
  return s
}

/** Texte d'une chaîne /Info : UTF-16BE avec indicateur, sinon octets lus en Latin-1 */
function infoString(v) {
  if (!v || !v.bytes) return undefined
  const b = v.bytes
  if (b[0] === 0xfe && b[1] === 0xff) {
    let s = ''
    for (let i = 2; i + 1 < b.length; i += 2) s += String.fromCharCode((b[i] << 8) | b[i + 1])
    return s
  }
  return String.fromCharCode(...b)
}

/* ---------- Texte d'un flux de contenu ---------- */

const widthsFor = baseFont => (/Bold/.test(baseFont ?? '') ? WIDTHS_BOLD : WIDTHS_REGULAR)

function extractText(content, fonts) {
  const p = new Parser(content)
  const stack = []
  const lines = []
  let line = ''
  let lastY = null
  let lastEnd = null
  let font = null
  let size = 0
  let tz = 100
  let tc = 0
  let leading = 0
  let tm = [1, 0, 0, 1, 0, 0]
  let lm = [1, 0, 0, 1, 0, 0]
  /** Séquences de contenu marqué ouvertes (true : artefact), et combien d'artefacts englobent le texte courant */
  const marks = []
  let artifact = 0
  const newLine = () => {
    if (line) lines.push(line)
    line = ''
  }
  const show = bytes => {
    const text = decodeWinAnsi(bytes)
    const [a, b, c, d, x, y] = tm
    const rotated = Math.abs(b) > 1e-6 || Math.abs(c) > 1e-6 || a < 0 || d < 0
    let w = 0
    const table = widthsFor(fonts[font])
    for (const code of bytes) w += ((table[code - FIRST_CODE] ?? 0) * size) / 1000 + tc
    w *= tz / 100
    if (artifact > 0) {
      tm = [a, b, c, d, x + w * a, y + w * b]
      return
    }
    if (rotated) {
      newLine()
      lines.push(text)
      lastY = null
      lastEnd = null
    } else {
      if (lastY === null || Math.abs(y - lastY) > 0.5) newLine()
      else if (lastEnd !== null && Math.abs(x - lastEnd) > 0.5 && !/\s$/.test(line) && !/^\s/.test(text)) line += ' '
      line += text
      lastY = y
      lastEnd = x + w * a
    }
    tm = [a, b, c, d, x + w * a, y + w * b]
  }
  const translate = (tx, ty) => {
    const [a, b, c, d, e, f] = lm
    lm = [a, b, c, d, e + tx * a + ty * c, f + tx * b + ty * d]
    tm = [...lm]
  }
  while (p.pos < content.length) {
    p.skip()
    if (p.pos >= content.length) break
    const v = p.value()
    if (!v || v.op === undefined) {
      stack.push(v)
      continue
    }
    const args = stack.splice(0)
    switch (v.op) {
      case 'BT':
        tm = [1, 0, 0, 1, 0, 0]
        lm = [1, 0, 0, 1, 0, 0]
        break
      case 'Tf':
        font = args[0]?.name ?? null
        size = Number(args[1]) || 0
        break
      case 'Tz':
        tz = Number(args[0])
        break
      case 'Tc':
        tc = Number(args[0])
        break
      case 'TL':
        leading = Number(args[0])
        break
      case 'Tm':
        lm = args.slice(0, 6).map(Number)
        tm = [...lm]
        break
      case 'Td':
        translate(Number(args[0]), Number(args[1]))
        break
      case 'TD':
        leading = -Number(args[1])
        translate(Number(args[0]), Number(args[1]))
        break
      case 'T*':
        translate(0, -leading)
        break
      case 'Tj':
        if (args[0]?.bytes) show(args[0].bytes)
        break
      case "'":
        translate(0, -leading)
        if (args[0]?.bytes) show(args[0].bytes)
        break
      case '"':
        translate(0, -leading)
        if (args[2]?.bytes) show(args[2].bytes)
        break
      case 'BMC':
      case 'BDC':
        marks.push(args[0]?.name === 'Artifact')
        if (args[0]?.name === 'Artifact') artifact++
        break
      case 'EMC':
        if (marks.pop()) artifact--
        break
      case 'TJ':
        for (const item of args[0] ?? []) {
          if (item?.bytes) show(item.bytes)
          else if (typeof item === 'number') {
            const dx = ((-item / 1000) * size * tz) / 100
            tm = [tm[0], tm[1], tm[2], tm[3], tm[4] + dx * tm[0], tm[5] + dx * tm[1]]
          }
        }
        break
      default:
        break
    }
  }
  newLine()
  return lines.join('\n')
}

/* ---------- Document ---------- */

/**
 * Lit un PDF de l'écrivain maison.
 * @param {Uint8Array} input
 */
export function readPdf(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  const s = latin1(bytes)
  const head = /^%PDF-(\d\.\d)\n%/.exec(s)
  if (!head) throw new Error('en-tête %PDF-1.x absent')
  const binary = bytes.subarray(10, 14)
  if (binary.length !== 4 || [...binary].some(b => b < 128) || bytes[14] !== 0x0a) throw new Error('commentaire binaire de l’en-tête absent')
  if (!s.endsWith('%%EOF\n')) throw new Error('le fichier ne finit pas par %%EOF')
  const tail = /startxref\n(\d+)\n%%EOF\n$/.exec(s)
  if (!tail) throw new Error('startxref absent')
  const xrefOffset = Number(tail[1])
  if (!s.startsWith('xref\n', xrefOffset)) throw new Error(`startxref (${xrefOffset}) ne pointe pas sur « xref »`)
  const sub = /^xref\n0 (\d+)\n/.exec(s.slice(xrefOffset, xrefOffset + 40))
  if (!sub) throw new Error('table xref illisible')
  const size = Number(sub[1])
  const first = xrefOffset + sub[0].length
  const entries = []
  for (let i = 0; i < size; i++) {
    const e = s.slice(first + 20 * i, first + 20 * i + 20)
    const m = /^(\d{10}) (\d{5}) ([nf]) \n$/.exec(e)
    if (!m) throw new Error(`entrée ${i} de la xref invalide : ${JSON.stringify(e)}`)
    if (i === 0 && (m[3] !== 'f' || m[2] !== '65535')) throw new Error('entrée 0 de la xref invalide')
    if (i > 0 && m[3] !== 'n') throw new Error(`objet ${i} absent de la xref (trou)`)
    entries.push(Number(m[1]))
  }
  const trailerAt = first + 20 * size
  if (!s.startsWith('trailer', trailerAt)) throw new Error('trailer absent après la xref')
  const tp = new Parser(s, trailerAt + 'trailer'.length)
  const trailer = tp.value().dict
  if (trailer.Size !== size) throw new Error(`/Size ${trailer.Size} ≠ ${size} entrées`)

  const objects = new Map()
  for (let n = 1; n < size; n++) {
    const off = entries[n]
    const label = `${n} 0 obj`
    if (!s.startsWith(label, off) || !WHITE.has(s.charCodeAt(off + label.length))) throw new Error(`la xref de l’objet ${n} (${off}) ne tombe pas sur « ${label} »`)
    if (off > 0 && s[off - 1] !== '\n') throw new Error(`objet ${n} : pas en début de ligne`)
    const p = new Parser(s, off + label.length)
    const value = p.value()
    p.skip()
    let stream = null
    if (s.startsWith('stream', p.pos)) {
      let start = p.pos + 'stream'.length
      if (s[start] === '\r') start++
      if (s[start] !== '\n') throw new Error(`objet ${n} : « stream » sans fin de ligne`)
      start++
      const length = value?.dict?.Length
      if (typeof length !== 'number') throw new Error(`objet ${n} : /Length absent ou indirect`)
      if (!s.startsWith('\nendstream', start + length)) throw new Error(`objet ${n} : /Length ${length} ne mène pas à « \\nendstream »`)
      stream = bytes.subarray(start, start + length)
      p.pos = start + length + '\nendstream'.length
      p.skip()
    }
    if (!s.startsWith('endobj', p.pos)) throw new Error(`objet ${n} : « endobj » absent`)
    objects.set(n, { offset: off, value, stream })
  }

  const get = v => (v && v.ref !== undefined ? objects.get(v.ref)?.value : v)
  const root = get(trailer.Root)?.dict
  if (!root || root.Type?.name !== 'Catalog') throw new Error('catalogue (/Root) absent')
  const infoDict = get(trailer.Info)?.dict ?? {}

  // Pages, dans l'ordre de /Kids (arbre parcouru en profondeur)
  const pageDicts = []
  const walk = node => {
    const d = get(node)?.dict
    if (!d) throw new Error('nœud de pages illisible')
    if (d.Type?.name === 'Pages') for (const k of d.Kids ?? []) walk(k)
    else if (d.Type?.name === 'Page') pageDicts.push(d)
    else throw new Error(`nœud de type ${d.Type?.name}`)
  }
  walk(root.Pages)
  const count = get(root.Pages)?.dict?.Count
  if (count !== pageDicts.length) throw new Error(`/Count ${count} ≠ ${pageDicts.length} pages`)

  const pages = pageDicts.map(d => {
    const refs = Array.isArray(d.Contents) ? d.Contents : [d.Contents]
    const chunks = refs.map(r => objects.get(r?.ref)?.stream).filter(Boolean)
    const contentBytes = chunks.length === 1 ? chunks[0] : Uint8Array.from(chunks.flatMap(c => [...c, 0x0a]))
    const content = latin1(contentBytes)
    const fontRes = get(get(d.Resources)?.dict?.Font)?.dict ?? {}
    const fonts = {}
    for (const [name, ref] of Object.entries(fontRes)) fonts[name] = get(ref)?.dict?.BaseFont?.name
    const links = (get(d.Annots) ?? []).map(a => get(a)?.dict).filter(a => a?.Subtype?.name === 'Link').map(a => {
      const uri = get(a.A)?.dict?.URI
      return uri?.bytes ? String.fromCharCode(...uri.bytes) : undefined
    }).filter(Boolean)
    return {
      text: extractText(content, fonts),
      content,
      contentAscii: [...contentBytes].every(b => b < 0x80),
      links,
      mediaBox: get(d.MediaBox),
    }
  })

  return {
    version: head[1],
    size,
    xrefOffset,
    /** Décalage de chaque objet (index = numéro d'objet ; 0 pour l'entrée libre) */
    offsets: entries,
    objects,
    trailer,
    catalog: root,
    pages,
    info: {
      title: infoString(infoDict.Title),
      creator: infoString(infoDict.Creator),
      producer: infoString(infoDict.Producer),
      creationDate: infoString(infoDict.CreationDate),
      lang: root.Lang?.bytes ? String.fromCharCode(...root.Lang.bytes) : undefined,
    },
  }
}
