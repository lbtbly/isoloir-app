// Le texte des codes de reprise : base 32 de Crockford (chiffres et majuscules sans I, L, O ni U), lisible, sans
// confusion entre 0 et O ni entre 1 et I ou L, et tout entier dans l'alphabet du mode « alphanumérique » des QR codes.
// Une somme de contrôle CRC-32 termine chaque code : une faute de frappe est refusée, jamais lue comme une autre feuille.

export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

export function toBase32(bytes: Uint8Array): string {
  let out = ''
  let acc = 0
  let n = 0
  for (const b of bytes) {
    acc = (acc << 8) | b
    n += 8
    while (n >= 5) {
      out += ALPHABET[(acc >> (n - 5)) & 31]
      n -= 5
    }
    acc &= (1 << n) - 1
  }
  if (n > 0) out += ALPHABET[(acc << (5 - n)) & 31]
  return out
}

/** Les octets d'un texte déjà normalisé ; null si un caractère n'est pas de l'alphabet ou si le remplissage n'est pas nul */
export function fromBase32(text: string): Uint8Array | null {
  const out = new Uint8Array(Math.floor((text.length * 5) / 8))
  let acc = 0
  let n = 0
  let i = 0
  for (const ch of text) {
    const v = ALPHABET.indexOf(ch)
    if (v < 0) return null
    acc = (acc << 5) | v
    n += 5
    if (n >= 8) {
      out[i++] = (acc >> (n - 8)) & 255
      n -= 8
    }
    acc &= (1 << n) - 1
  }
  // Les bits de remplissage du dernier caractère sont nuls dans un code bien formé
  return acc === 0 ? out : null
}

/**
 * Remet en forme un code saisi ou collé : majuscules, sans espaces, tirets ni points ; O lu comme 0, I et L comme 1
 * (règle de Crockford). U, absent de l'alphabet, reste et sera refusé.
 */
export function normalizeCode(text: string): string {
  return text
    .toUpperCase()
    .replace(/[\s\-–—_.·]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
}

/** Le code par groupes de `size` caractères, pour l'écrire ou le dicter */
export function groupCode(code: string, size = 4): string[] {
  const out: string[] = []
  for (let i = 0; i < code.length; i += size) out.push(code.slice(i, i + size))
  return out
}

let table: Uint32Array | null = null

/** CRC-32 (polynôme IEEE 802.3, celui de zip et png) */
export function crc32(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (const b of bytes) crc = table[(crc ^ b) & 255]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
