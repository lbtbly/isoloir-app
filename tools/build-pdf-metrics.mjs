// Largeurs des caractères pour le PDF du dépouillement : écrit src/core/pdf/metrics.ts.
//
// Le PDF emploie les polices standard Helvetica et Helvetica-Bold, non embarquées, en WinAnsiEncoding :
// pour couper les lignes et aligner les textes, il faut la largeur de chaque code WinAnsi (0x20 à 0xFF).
// Les fichiers AFM d'Adobe ne sont pas sur la machine et l'outil ne va pas les chercher sur le réseau :
// les largeurs sont lues dans Arial, présente sur tout Mac, dessinée pour être métriquement compatible
// avec Helvetica (mêmes chasses, caractère par caractère). Les lecteurs PDF remplacent d'ailleurs
// Helvetica par Arial, Liberation Sans ou Nimbus Sans, de mêmes chasses.
// Deux codes font exception : le point médian « · » (0xB7) et le macron « ¯ » (0xAF), plus larges dans
// Arial (333 et 552) que dans Helvetica (278 et 333, valeurs des AFM d'Adobe). Ils sont corrigés ici
// (OVERRIDES). Le point médian sert dans le rapport (« · données partielles »).
// Contrôle croisé, s'il est présent : l'Helvetica du système (/System/Library/Fonts/Helvetica.ttc), lue de
// la même façon ; l'outil affiche les codes où elle diffère de la table (l'euro y est plus large : 744).
//
// Lecture directe du TrueType, sans dépendance : tables head (unités par em), hhea et hmtx (chasses),
// cmap (format 4, Unicode BMP). Chasse en millièmes d'em, arrondie.
//
// Usage : node tools/build-pdf-metrics.mjs [Arial.ttf] [Arial Bold.ttf]
// (par défaut, les polices du système macOS). Lancé à la main, une fois : le fichier écrit est versionné.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

const REGULAR = process.argv[2] ?? '/System/Library/Fonts/Supplemental/Arial.ttf'
const BOLD = process.argv[3] ?? '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
const SYSTEM_HELVETICA = '/System/Library/Fonts/Helvetica.ttc'
const OUT = new URL('../src/core/pdf/metrics.ts', import.meta.url)

/** Codes 0x80 à 0x9F de WinAnsi (Windows-1252) ; les codes absents (81, 8D, 8F, 90, 9D) n'ont pas de caractère,
 *  pas plus que 0x7F (commande DEL) */
const CP1252 = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c,
  0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
}
const unicodeOf = code => (code === 0x7f ? undefined : code >= 0x80 && code <= 0x9f ? CP1252[code] : code)

/** Codes où Helvetica (AFM d'Adobe, et Helvetica du système) diffère d'Arial, pour les deux graisses */
const OVERRIDES = { 0xaf: 333, 0xb7: 278 }

/** Polices d'un fichier TrueType ou d'une collection (.ttc) : décalage de chaque table, par nom */
function fontsIn(b) {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength)
  const starts = b.toString('latin1', 0, 4) === 'ttcf'
    ? Array.from({ length: dv.getUint32(8) }, (_, i) => dv.getUint32(12 + 4 * i))
    : [0]
  return starts.map(start => {
    const tables = {}
    for (let i = 0; i < dv.getUint16(start + 4); i++) {
      const o = start + 12 + 16 * i
      tables[b.toString('latin1', o, o + 4)] = dv.getUint32(o + 8)
    }
    return { dv, b, tables }
  })
}

/** Nom complet (name ID 4) d'une police */
function fullName({ dv, b, tables }) {
  const t = tables.name
  if (t === undefined) return ''
  const strings = t + dv.getUint16(t + 4)
  for (let i = 0; i < dv.getUint16(t + 2); i++) {
    const r = t + 6 + 12 * i
    if (dv.getUint16(r + 6) !== 4) continue
    const platform = dv.getUint16(r)
    const len = dv.getUint16(r + 8)
    const o = strings + dv.getUint16(r + 10)
    if (platform === 3 || platform === 0) return Buffer.from(b.subarray(o, o + len)).swap16().toString('utf16le')
    if (platform === 1) return b.toString('latin1', o, o + len)
  }
  return ''
}

/** Chasses (millièmes d'em) des codes WinAnsi 0x20 à 0xFF ; 0 pour un code sans caractère */
function widthsOf({ dv, tables }, label) {
  for (const t of ['head', 'hhea', 'hmtx', 'cmap']) if (tables[t] === undefined) throw new Error(`${label} : table ${t} absente`)
  const unitsPerEm = dv.getUint16(tables.head + 18)
  const longMetrics = dv.getUint16(tables.hhea + 34)
  const advance = glyph => dv.getUint16(tables.hmtx + 4 * Math.min(glyph, longMetrics - 1))
  // Sous-table Unicode BMP de format 4 : plateforme Windows (3, 1) ou Unicode (0, 3)
  const cmap = tables.cmap
  let sub
  for (let i = 0; i < dv.getUint16(cmap + 2); i++) {
    const platform = dv.getUint16(cmap + 4 + 8 * i)
    const encoding = dv.getUint16(cmap + 6 + 8 * i)
    const at = cmap + dv.getUint32(cmap + 8 + 8 * i)
    if (((platform === 3 && encoding === 1) || (platform === 0 && encoding === 3)) && dv.getUint16(at) === 4) sub = at
  }
  if (sub === undefined) throw new Error(`${label} : pas de cmap Unicode de format 4`)
  const segX2 = dv.getUint16(sub + 6)
  const ends = sub + 14
  const starts = ends + segX2 + 2
  const deltas = starts + segX2
  const ranges = deltas + segX2
  const glyphOf = u => {
    for (let s = 0; s < segX2 / 2; s++) {
      if (u > dv.getUint16(ends + 2 * s)) continue
      const start = dv.getUint16(starts + 2 * s)
      if (u < start) return 0
      const delta = dv.getInt16(deltas + 2 * s)
      const range = dv.getUint16(ranges + 2 * s)
      if (!range) return (u + delta) & 0xffff
      const g = dv.getUint16(ranges + 2 * s + range + 2 * (u - start))
      return g ? (g + delta) & 0xffff : 0
    }
    return 0
  }
  const widths = []
  for (let code = 0x20; code <= 0xff; code++) {
    const u = unicodeOf(code)
    if (u === undefined) {
      widths.push(0)
      continue
    }
    const g = glyphOf(u)
    if (!g) throw new Error(`${label} : pas de glyphe pour U+${u.toString(16).padStart(4, '0')} (code ${code})`)
    widths.push(Math.round((advance(g) * 1000) / unitsPerEm))
  }
  return widths
}

const fromFile = file => {
  const [font] = fontsIn(readFileSync(file))
  return widthsOf(font, file)
}
const withOverrides = widths => widths.map((w, i) => OVERRIDES[i + 0x20] ?? w)

const regular = withOverrides(fromFile(REGULAR))
const bold = withOverrides(fromFile(BOLD))

// Repères d'Helvetica (AFM d'Adobe) : si la table s'en écarte, elle ne vaut rien
const CHECKS = [
  [regular, ' ', 278], [regular, 'a', 556], [regular, 'i', 222], [regular, 'm', 833], [regular, 'A', 667], [regular, 'W', 944],
  [regular, '%', 889], [regular, '0', 556], [regular, 'é', 556], [regular, 'ç', 500], [regular, '«', 556], [regular, '·', 278],
  [bold, 'i', 278], [bold, 'm', 889], [bold, 'A', 722], [bold, '?', 611], [bold, 'ç', 556], [bold, '0', 556], [bold, '·', 278],
]
for (const [table, ch, w] of CHECKS) {
  const got = table[ch.charCodeAt(0) - 0x20]
  if (got !== w) throw new Error(`largeur de « ${ch} » : ${got} au lieu de ${w} (Helvetica)`)
}

// Contrôle croisé avec l'Helvetica du système, s'il est là (information, pas d'échec)
if (existsSync(SYSTEM_HELVETICA)) {
  const fonts = fontsIn(readFileSync(SYSTEM_HELVETICA))
  for (const [name, table] of [['Helvetica', regular], ['Helvetica Bold', bold]]) {
    const font = fonts.find(f => fullName(f) === name)
    if (!font) continue
    const diff = widthsOf(font, name)
      .map((w, i) => (w !== table[i] && table[i] ? `0x${(i + 0x20).toString(16)} : ${w} (table : ${table[i]})` : ''))
      .filter(Boolean)
    console.log(`· ${name} du système : ${diff.length ? `diffère sur ${diff.join(', ')}` : 'identique'}`)
  }
}

const rows = list => {
  const out = []
  for (let i = 0; i < list.length; i += 16) out.push('  ' + list.slice(i, i + 16).join(', ') + ',')
  return out.join('\n')
}
const ts = `// Fichier généré par tools/build-pdf-metrics.mjs : ne pas modifier à la main.
//
// Chasses des codes WinAnsi 0x20 à 0xFF (224 valeurs) pour Helvetica et Helvetica-Bold, en millièmes d'em.
// Source : les polices Arial (${basename(REGULAR)}) et Arial Bold (${basename(BOLD)}) du système macOS, lues sur
// la machine, sans accès réseau. Arial est métriquement compatible avec Helvetica : mêmes chasses, caractère par
// caractère (contrôlé à la génération sur des repères des fichiers AFM d'Adobe), sauf le point médian (0xB7) et
// le macron (0xAF), ramenés aux valeurs d'Helvetica (278 et 333). Aucun crénage : l'opérateur Tj n'applique pas
// les paires de crénage. Un code sans caractère (0x7F, 0x81, 0x8D, 0x8F, 0x90, 0x9D) vaut 0.

/** Premier code de la table (l'espace) */
export const FIRST_CODE = 0x20

/** Helvetica (/F1) */
export const WIDTHS_REGULAR: readonly number[] = [
${rows(regular)}
]

/** Helvetica-Bold (/F2) */
export const WIDTHS_BOLD: readonly number[] = [
${rows(bold)}
]
`
writeFileSync(OUT, ts)
console.log(`✓ src/core/pdf/metrics.ts (${regular.length} + ${bold.length} chasses)`)
