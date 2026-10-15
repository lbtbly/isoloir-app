// Lecture des QR codes de reprise par le décodeur JavaScript (celui des navigateurs sans BarcodeDetector : Safari sur
// iPhone, Firefox) : images nettes, puis « photos » d'écran synthétiques, tournées, floues, bruitées et réduites.
import { decodeQR } from 'qr/decode.js'
import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/core/rng'
import { freshState } from '../src/core/storage'
import { encodeTransfer } from '../src/core/transfer/codec'
import { qrModules, qrVersion } from '../src/core/transfer/qr'
import type { Answer, Rating } from '../src/core/types'
import { presidentielle2027 as pack } from '../src/elections/presidentielle-2027'

/** Le code d'une feuille de n questions, toutes les approches notées */
function codeFor(n: number): string {
  const order = Object.entries(pack.transfer!.questions).sort((a, b) => a[1] - b[1]).map(([id]) => id)
  const answers: Record<string, Answer> = {}
  for (const id of order.slice(0, n)) {
    const q = pack.bank.questions.find(x => x.id === id)!
    answers[id] = { ratings: Object.fromEntries(q.approaches.map((a, i) => [a.id, (i % 3 ? -1 : 1) as Rating])), redLines: [], rev: 1 }
  }
  return encodeTransfer({ ...freshState(pack.election.id, pack.election.dataVersion), seed: '89abcdef01234567', answers }, pack)
}

interface Shot {
  /** Pixels par module */
  scale: number
  /** Rotation, en degrés */
  angle: number
  /** Rayon du flou (moyenne sur un carré), en pixels */
  blur: number
  /** Amplitude du bruit, sur 255 */
  noise: number
  /** Contraste réduit : noir et blanc rapprochés du gris (écran photographié) */
  dim: boolean
}

/** Une image RGBA du QR code, comme une photo d'écran plus ou moins bonne */
function render(modules: boolean[][], shot: Shot, seed = 1) {
  const quiet = 4
  const side = (modules.length + 2 * quiet) * shot.scale
  const W = Math.ceil(side * 1.25)
  const rnd = mulberry32(seed)
  const dark = shot.dim ? 70 : 20
  const light = shot.dim ? 190 : 240
  const cos = Math.cos((shot.angle * Math.PI) / 180)
  const sin = Math.sin((shot.angle * Math.PI) / 180)
  const gray = new Float32Array(W * W)
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      // Point de l'image ramené dans le repère du symbole (rotation autour du centre)
      const dx = x - W / 2
      const dy = y - W / 2
      const u = (cos * dx + sin * dy + side / 2) / shot.scale - quiet
      const v = (-sin * dx + cos * dy + side / 2) / shot.scale - quiet
      const mx = Math.floor(u)
      const my = Math.floor(v)
      const on = my >= 0 && my < modules.length && mx >= 0 && mx < modules.length && modules[my]![mx]
      gray[y * W + x] = on ? dark : light
    }
  }
  const r = shot.blur
  const out = new Uint8ClampedArray(W * W * 4)
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0
      let n = 0
      for (let j = -r; j <= r; j++) {
        for (let i = -r; i <= r; i++) {
          const xx = Math.min(W - 1, Math.max(0, x + i))
          const yy = Math.min(W - 1, Math.max(0, y + j))
          sum += gray[yy * W + xx]!
          n++
        }
      }
      const value = sum / n + (rnd() - 0.5) * 2 * shot.noise
      const k = (y * W + x) * 4
      out[k] = out[k + 1] = out[k + 2] = value
      out[k + 3] = 255
    }
  }
  return { width: W, height: W, data: out }
}

describe('décodeur JavaScript des QR codes de reprise', () => {
  const cases = [
    { name: 'premier dépouillement', n: 10 },
    { name: 'questionnaire rapide', n: 22 },
    { name: 'toute la banque', n: pack.bank.questions.length },
  ]
  for (const { name, n } of cases) {
    const code = codeFor(n)
    const modules = qrModules(code)
    it(`lit l’image nette (${name}, version ${qrVersion(modules)})`, () => {
      expect(decodeQR(render(modules, { scale: 4, angle: 0, blur: 0, noise: 0, dim: false }))).toBe(code)
    })
    it(`lit une photo d’écran tournée, floue et bruitée (${name})`, () => {
      expect(decodeQR(render(modules, { scale: 5, angle: 8, blur: 1, noise: 25, dim: true }), { effort: 3, timeLimit: 2000 })).toBe(code)
    })
  }

  it('signale une image sans QR code', () => {
    const blank = render([[false]], { scale: 40, angle: 0, blur: 0, noise: 10, dim: false })
    expect(() => decodeQR(blank)).toThrow()
  })
})
