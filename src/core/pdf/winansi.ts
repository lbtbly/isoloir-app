// Texte Unicode vers octets WinAnsi, le codage des polices standard du PDF (Helvetica, Helvetica-Bold).
//
// WinAnsi couvre l'ASCII, le Latin-1 (0xA0 à 0xFF) et 27 signes de 0x80 à 0x9F (€ … – — ‘ ’ “ ” œ Œ…) : tout le
// français. Le reste passe par une table de substitutions (espaces fines, signe moins, ≥, indices…), puis par un
// repli qui retire les diacritiques (ș → s, ă → a) ; ce qui ne passe toujours pas est omis et noté dans `lost`,
// que les tests exigent vide pour tous les textes des élections.
//
// Étapes de prepareText : NFC, substitutions et repli, puis espaces françaises (espace insécable devant
// « : ; ! ? » % » et après « « »). Le texte préparé reste une chaîne Unicode dont chaque caractère a un code
// WinAnsi : la coupure des lignes travaille dessus (elle ne coupe jamais sur U+00A0 ni sur U+2011).
// Aucune dépendance, aucun accès au DOM.

/** Espace insécable (code 0xA0, dessinée comme une espace) */
export const NBSP = '\u00a0'
/** Trait d'union insécable : gardé dans le texte préparé pour que la coupure l'ignore, écrit 0x2D */
export const NB_HYPHEN = '\u2011'

/** Codes 0x80 à 0x9F : caractère Unicode de chaque code (81, 8D, 8F, 90 et 9D n'en ont pas) */
const HIGH: Readonly<Record<number, number>> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c,
  0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a,
  0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
}
const TO_HIGH = new Map(Object.entries(HIGH).map(([code, u]) => [u, Number(code)]))

/** Code WinAnsi d'un point de code, ou undefined s'il n'en a pas (0xAD, césure conditionnelle, est exclue) */
export function winAnsiCode(cp: number): number | undefined {
  if (cp >= 0x20 && cp <= 0x7e) return cp
  if (cp >= 0xa0 && cp <= 0xff) return cp === 0xad ? undefined : cp
  if (cp === 0x2011) return 0x2d
  return TO_HIGH.get(cp)
}

/** Caractère Unicode d'un code WinAnsi (table inverse, pour relire un PDF) ; U+FFFD pour un code sans caractère */
export function winAnsiChar(code: number): string {
  if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) return String.fromCharCode(code)
  const u = HIGH[code]
  return u === undefined ? '\ufffd' : String.fromCharCode(u)
}

/** Substitutions faites avant l'encodage (annexe A du cahier des charges) */
const SUBSTITUTIONS: Readonly<Record<string, string>> = {
  // Espaces : les insécables restent insécables, les autres deviennent des espaces ordinaires
  '\u202f': NBSP,
  '\u2007': NBSP,
  '\u2000': ' ', '\u2001': ' ', '\u2002': ' ', '\u2003': ' ', '\u2004': ' ', '\u2005': ' ', '\u2006': ' ',
  '\u2008': ' ', '\u2009': ' ', '\u200a': ' ', '\u205f': ' ', '\u3000': ' ',
  '\t': ' ', '\n': ' ', '\r': ' ',
  // Tirets : signe moins et tiret numérique vers le demi-cadratin (0x96), barre horizontale vers le cadratin (0x97)
  '\u2212': '\u2013',
  '\u2010': '-',
  '\u2012': '\u2013',
  '\u2015': '\u2014',
  // Invisibles : la césure conditionnelle s'afficherait comme un trait d'union
  '\u00ad': '', '\u200b': '', '\u200c': '', '\u200d': '', '\u2060': '', '\ufeff': '',
  // Signes sans équivalent
  '≥': '>=',
  '≤': '<=',
  '→': '->',
  '←': '<-',
}

/** Sélecteurs de variante (après un émoji) : retirés sans être signalés, le caractère qui précède l'est déjà */
const isVariationSelector = (cp: number) => (cp >= 0xfe00 && cp <= 0xfe0f) || (cp >= 0xe0100 && cp <= 0xe01ef)

const encodable = (s: string) => {
  for (const ch of s) if (winAnsiCode(ch.codePointAt(0) as number) === undefined) return false
  return true
}

/** Repli : la lettre de base sans ses diacritiques (NFD), puis la forme de compatibilité (NFKD : ₂ → 2, ᵉ → e) */
function fold(ch: string): string | null {
  for (const form of ['NFD', 'NFKD'] as const) {
    const base = ch.normalize(form).replace(/\p{M}/gu, '')
    if (base && encodable(base)) return base
  }
  return null
}

/** Espaces françaises : l'espace ordinaire devant « : ; ! ? » % » et après « « » devient insécable */
export function frenchSpaces(s: string): string {
  return s.replace(/ +(?=[:;!?»%])/g, NBSP).replace(/« +/g, `«${NBSP}`)
}

/**
 * Prépare un texte pour le PDF : chaque caractère du résultat a un code WinAnsi.
 * Les caractères impossibles à écrire sont omis et ajoutés à `lost` (s'il est fourni).
 */
export function prepareText(s: string, lost?: string[]): string {
  let out = ''
  for (const ch of s.normalize('NFC')) {
    const cp = ch.codePointAt(0) as number
    if (winAnsiCode(cp) !== undefined) {
      out += ch
      continue
    }
    const sub = SUBSTITUTIONS[ch]
    if (sub !== undefined) {
      out += sub
      continue
    }
    if (isVariationSelector(cp)) continue
    const folded = fold(ch)
    if (folded !== null) out += folded
    else lost?.push(ch)
  }
  return frenchSpaces(out)
}

/** Codes WinAnsi d'un texte déjà préparé (un caractère sans code lève une erreur : texte non préparé) */
export function winAnsiCodes(prepared: string): number[] {
  const codes: number[] = []
  for (const ch of prepared) {
    const code = winAnsiCode(ch.codePointAt(0) as number)
    if (code === undefined) throw new Error(`caractère hors WinAnsi : U+${(ch.codePointAt(0) as number).toString(16)}`)
    codes.push(code)
  }
  return codes
}

/** Encode un texte quelconque : octets WinAnsi et caractères perdus */
export function encodeWinAnsi(s: string): { bytes: Uint8Array; lost: string[] } {
  const lost: string[] = []
  const bytes = Uint8Array.from(winAnsiCodes(prepareText(s, lost)))
  return { bytes, lost }
}

/** Relit des octets WinAnsi (table inverse) */
export function decodeWinAnsi(bytes: ArrayLike<number>): string {
  let out = ''
  for (let i = 0; i < bytes.length; i++) out += winAnsiChar(bytes[i] as number)
  return out
}

/**
 * Chaîne littérale PDF « (…) » en ASCII pur : ( ) \ échappés, octets hors de 0x20 à 0x7E écrits en octal
 * (é → \351). Aucun retour à la ligne n'y entre : le fichier s'assemble octet par octet sans risque.
 */
export function pdfLiteral(bytes: ArrayLike<number>): string {
  let out = '('
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i] as number
    if (b === 0x28 || b === 0x29 || b === 0x5c) out += '\\' + String.fromCharCode(b)
    else if (b < 0x20 || b > 0x7e) out += '\\' + b.toString(8).padStart(3, '0')
    else out += String.fromCharCode(b)
  }
  return out + ')'
}

/** Chaîne hexadécimale UTF-16BE avec indicateur d'ordre « <FEFF…> » (titre et créateur du document, /Info) */
export function pdfUtf16(s: string): string {
  let hex = 'FEFF'
  const t = s.normalize('NFC')
  for (let i = 0; i < t.length; i++) hex += t.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')
  return `<${hex}>`
}
