// Écriture et lecture bit à bit des codes de reprise (codec.ts) : bits de poids fort d'abord.

export class BitWriter {
  private bits: number[] = []

  /** Écrit `value` (entier positif) sur `width` bits ; au plus 32 bits */
  write(value: number, width: number): void {
    if (!Number.isInteger(value) || value < 0 || value >= 2 ** width) throw new RangeError(`${value} ne tient pas sur ${width} bits`)
    for (let i = width - 1; i >= 0; i--) this.bits.push(Math.floor(value / 2 ** i) % 2)
  }

  bit(on: boolean): void {
    this.bits.push(on ? 1 : 0)
  }

  /** Code gamma d'Elias : court pour les petits nombres (1 → 1 bit, 2 et 3 → 3 bits…) ; n ≥ 1 */
  gamma(n: number): void {
    if (!Number.isInteger(n) || n < 1 || n >= 2 ** 31) throw new RangeError(`gamma : ${n}`)
    const width = Math.floor(Math.log2(n)) + 1
    for (let i = 1; i < width; i++) this.bits.push(0)
    this.write(n, width)
  }

  get length(): number {
    return this.bits.length
  }

  /** Les octets, le dernier complété par des zéros */
  bytes(): Uint8Array {
    const out = new Uint8Array(Math.ceil(this.bits.length / 8))
    this.bits.forEach((b, i) => {
      if (b) out[i >> 3]! |= 0x80 >> (i & 7)
    })
    return out
  }
}

export class BitReader {
  private pos = 0

  constructor(private readonly data: Uint8Array) {}

  /** Lit `width` bits ; au-delà de la fin, lève une erreur (code tronqué) */
  read(width: number): number {
    let v = 0
    for (let i = 0; i < width; i++) {
      if (this.pos >= this.data.length * 8) throw new RangeError('fin du code')
      v = v * 2 + ((this.data[this.pos >> 3]! >> (7 - (this.pos & 7))) & 1)
      this.pos++
    }
    return v
  }

  bit(): boolean {
    return this.read(1) === 1
  }

  gamma(): number {
    let zeros = 0
    while (!this.bit()) {
      if (++zeros > 30) throw new RangeError('gamma trop long')
    }
    return 2 ** zeros + this.read(zeros)
  }

  /** Bits restants après la position courante */
  get remaining(): number {
    return this.data.length * 8 - this.pos
  }
}

/** Nombre de bits pour écrire les entiers de 0 à max (au moins 1) */
export function widthFor(max: number): number {
  return Math.max(1, Math.ceil(Math.log2(max + 1)))
}
