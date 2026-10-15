// Lire un code de reprise sur l'appareil : dans l'image de la caméra, dans une image choisie (PNG du code, capture
// d'écran, photo) ou dans un fichier. Tout se passe ici : aucune image n'est gardée ni envoyée, la caméra s'arrête dès
// que le code est lu, que la page change ou se cache, ou au bout de deux minutes.

import { parseImport, type ImportResult, MAX_IMPORT_BYTES } from '../../core/exportData'
import { looksLikeCode, parseCode } from '../../core/transfer/codec'
import type { ElectionPack } from '../../core/types'

/** Le BarcodeDetector des navigateurs qui en ont un (Chrome sur Android et macOS, Edge…), réduit à ce qui sert ici */
interface NativeDetector {
  detect(source: ImageBitmapSource): Promise<{ rawValue: string }[]>
}
interface NativeDetectorClass {
  new (options: { formats: string[] }): NativeDetector
  getSupportedFormats(): Promise<string[]>
}

let native: Promise<NativeDetector | null> | null = null

/** Le détecteur du navigateur s'il lit les QR codes, sinon null (le décodeur JavaScript prend le relais) */
function nativeDetector(): Promise<NativeDetector | null> {
  native ??= (async () => {
    const Detector = (globalThis as { BarcodeDetector?: NativeDetectorClass }).BarcodeDetector
    if (!Detector) return null
    try {
      return (await Detector.getSupportedFormats()).includes('qr_code') ? new Detector({ formats: ['qr_code'] }) : null
    } catch {
      return null
    }
  })()
  return native
}

type Decode = typeof import('./decoder').decodeQR
let decoder: Promise<Decode> | null = null
const jsDecoder = () => (decoder ??= import('./decoder').then(m => m.decodeQR))

/** Le texte d'un QR code dans une image de canevas ; null s'il n'y en a pas */
function decodePixels(decode: Decode, ctx: CanvasRenderingContext2D, w: number, h: number, effort?: { effort: number; timeLimit: number }): string | null {
  try {
    const img = ctx.getImageData(0, 0, w, h)
    return decode({ width: w, height: h, data: img.data }, effort)
  } catch {
    return null
  }
}

// ——— Caméra ———

export type CameraError = 'refusee' | 'absente' | 'indisponible'

export interface CameraOptions {
  /** Un texte lu : renvoie true s'il est accepté (un code d'Isoloir), ce qui arrête la caméra */
  onText: (text: string) => boolean
  /** La caméra s'est arrêtée d'elle-même (deux minutes sans code, page cachée) */
  onStop: (why: 'delai' | 'cachee') => void
}

const SCAN_MS = 125
const SCAN_LIMIT_MS = 120_000
/** Côté de l'image analysée par le décodeur JavaScript : assez pour un QR code de version 14 tenu à bout de bras */
const SCAN_SIDE = 720

/**
 * Ouvre la caméra arrière dans « video » et cherche un QR code, huit fois par seconde, au centre de l'image.
 * Renvoie de quoi l'arrêter ; lève une CameraError si la caméra est refusée, absente ou indisponible.
 */
export async function startCamera(video: HTMLVideoElement, opts: CameraOptions): Promise<() => void> {
  if (!navigator.mediaDevices?.getUserMedia) throw 'indisponible' satisfies CameraError
  let stream: MediaStream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
  } catch (e) {
    const name = (e as DOMException).name
    throw (name === 'NotAllowedError' || name === 'SecurityError' ? 'refusee' : name === 'NotFoundError' || name === 'OverconstrainedError' ? 'absente' : 'indisponible') satisfies CameraError
  }

  let running = true
  let timer = 0
  const stop = () => {
    if (!running) return
    running = false
    clearTimeout(timer)
    clearTimeout(limit)
    document.removeEventListener('visibilitychange', onHidden)
    for (const t of stream.getTracks()) t.stop()
    video.srcObject = null
  }
  const onHidden = () => {
    if (document.hidden) {
      stop()
      opts.onStop('cachee')
    }
  }
  const limit = window.setTimeout(() => {
    if (!running) return
    stop()
    opts.onStop('delai')
  }, SCAN_LIMIT_MS)
  document.addEventListener('visibilitychange', onHidden)

  video.muted = true
  video.playsInline = true
  video.srcObject = stream
  try {
    await video.play()
  } catch {
    // la lecture démarre d'elle-même dès que l'image arrive
  }

  const detector = await nativeDetector()
  const decode = detector ? null : await jsDecoder()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const tick = async () => {
    if (!running) return
    let text: string | null = null
    if (video.readyState >= 2 && video.videoWidth) {
      if (detector) {
        try {
          text = (await detector.detect(video))[0]?.rawValue ?? null
        } catch {
          text = null
        }
      } else if (decode && ctx) {
        // Le carré central de l'image, réduit : le QR code y est visé, et l'analyse reste rapide
        const size = Math.min(video.videoWidth, video.videoHeight)
        const side = Math.min(size, SCAN_SIDE)
        canvas.width = side
        canvas.height = side
        ctx.drawImage(video, (video.videoWidth - size) / 2, (video.videoHeight - size) / 2, size, size, 0, 0, side, side)
        text = decodePixels(decode, ctx, side, side)
      }
    }
    if (!running) return
    if (text && opts.onText(text)) {
      stop()
      return
    }
    timer = window.setTimeout(() => void tick(), SCAN_MS)
  }
  void tick()
  return stop
}

// ——— Images et fichiers ———

/** Taille au-delà de laquelle une image n'est pas lue (une photo de téléphone en fait quelques mégaoctets) */
export const MAX_IMAGE_BYTES = 40_000_000
/** Plus grand côté de l'image analysée par le décodeur JavaScript (limite des canevas de Safari, mémoire) */
const IMAGE_SIDE = 2048

async function bitmapOf(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file)
  } catch {
    // Format que createImageBitmap ne lit pas ici (HEIC hors Safari…) : par une image, depuis une adresse blob:
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      return img
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

/** Le texte du QR code d'une image ; null si aucun n'y est lu */
export async function codeFromImage(file: Blob): Promise<string | null> {
  const bitmap = await bitmapOf(file)
  try {
    const detector = await nativeDetector()
    if (detector) {
      try {
        const found = await detector.detect(bitmap)
        if (found[0]?.rawValue) return found[0].rawValue
      } catch {
        // le décodeur JavaScript essaie à son tour
      }
    }
    const decode = await jsDecoder()
    const w = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
    const h = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
    const scale = Math.min(1, IMAGE_SIDE / Math.max(w, h))
    const cw = Math.max(1, Math.round(w * scale))
    const ch = Math.max(1, Math.round(h * scale))
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, cw, ch)
    return decodePixels(decode, ctx, cw, ch, { effort: 3, timeLimit: 1500 })
  } finally {
    if ('close' in bitmap) bitmap.close()
  }
}

/** Ce qu'est un fichier, d'après ses premiers octets (le type annoncé manque souvent sur Android) */
export async function kindOf(file: Blob): Promise<'image' | 'json' | 'texte'> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  const at = (i: number, ...bytes: number[]) => bytes.every((b, k) => head[i + k] === b)
  const ascii = (i: number, s: string) => at(i, ...[...s].map(c => c.charCodeAt(0)))
  if (
    at(0, 0x89, 0x50, 0x4e, 0x47) || // PNG
    at(0, 0xff, 0xd8, 0xff) || // JPEG
    ascii(0, 'GIF8') ||
    (ascii(0, 'RIFF') && ascii(8, 'WEBP')) ||
    ascii(4, 'ftyp') // HEIC, AVIF
  ) {
    return 'image'
  }
  // Un double : du JSON, après d'éventuels espaces ou une marque d'ordre des octets
  let i = at(0, 0xef, 0xbb, 0xbf) ? 3 : 0
  while (i < head.length && (head[i] === 0x20 || head[i] === 0x0a || head[i] === 0x0d || head[i] === 0x09)) i++
  return head[i] === 0x7b ? 'json' : 'texte'
}

const NOT_A_CODE = 'Aucun QR code d’Isoloir n’a été trouvé dans cette image. Essayez une image plus nette, ou collez le code en texte.'

/**
 * Lit un fichier choisi, quel qu'il soit : le double (JSON), une image de QR code ou un texte qui contient un code.
 * Même validation et mêmes messages que partout ailleurs (importEnvelope).
 */
export async function readImportFile(file: File, pack: ElectionPack): Promise<ImportResult> {
  const kind = await kindOf(file)
  if (kind === 'image') {
    if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: 'Cette image est trop volumineuse : prenez une capture d’écran du QR code.' }
    let text: string | null
    try {
      text = await codeFromImage(file)
    } catch {
      return { ok: false, error: 'Cette image ne se lit pas sur ce navigateur. Essayez une capture d’écran au format PNG, ou collez le code.' }
    }
    return text ? parseCode(text, pack) : { ok: false, error: NOT_A_CODE }
  }
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, error: 'Ce fichier est trop volumineux pour venir d’Isoloir.' }
  const text = await file.text()
  if (kind === 'json') return parseImport(text, pack)
  return looksLikeCode(text) ? parseCode(text, pack) : { ok: false, error: 'Ce fichier n’est ni un double (JSON), ni une image de QR code, ni un code d’Isoloir.' }
}
