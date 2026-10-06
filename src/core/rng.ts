// Hasard déterministe : l'ordre des approches et des thèmes est tiré une fois par
// utilisateur (graine stockée localement) puis reste stable au rechargement.

/** Hachage FNV-1a 32 bits */
export function hashString(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Générateur mulberry32 : rapide, suffisant pour mélanger un affichage */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mélange de Fisher-Yates reproductible pour une graine donnée */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice()
  const rand = mulberry32(hashString(seed))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = out[i] as T
    out[i] = out[j] as T
    out[j] = tmp
  }
  return out
}

/** Nouvelle graine aléatoire (crypto.getRandomValues), 16 caractères hexadécimaux */
export function newSeed(): string {
  const bytes = new Uint8Array(8)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}
