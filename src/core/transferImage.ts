// L'image du code de reprise : le double jaune, avec le QR code sur une plaque blanche et le code à recopier dessous.
// Dessinée en Canvas sur l'appareil, enregistrée en PNG (net : un JPEG brouillerait les modules du QR code). On la
// garde pour plus tard, ou on la passe à un autre appareil, qui la lit (« Choisir une image ») sans caméra.

import { APP_NAME, APP_URL } from './app'
import { COLORS, IMAGE_W, M, R, drawHeader, fit, font, loadFonts, paperCanvas } from './posterKit'
import type { SessionState } from './storage'
import { groupCode } from './transfer/base32'
import { qrModules } from './transfer/qr'
import { sheetContents } from './transfer/summary'
import type { ElectionPack } from './types'

const MONO = "Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', 'Courier New', monospace"
/** Côté de la plaque blanche du QR code (marge de 4 modules comprise), au plus */
const PLATE = 720
const QR_TOP = 420
const CODE_SIZE = 36
const CODE_LINE = 54
const GROUPS_PER_LINE = 7

const dateFr = (d: Date) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export function transferImageName(pack: ElectionPack, now = new Date()): string {
  return `${APP_NAME.toLowerCase()}-${pack.election.id}-reprise-${now.toISOString().slice(0, 10)}.png`
}

/** L'image du code de reprise d'une feuille, sur un canevas */
export async function renderTransferImage(pack: ElectionPack, state: SessionState, code: string, now = new Date()): Promise<HTMLCanvasElement> {
  await loadFonts()
  const modules = qrModules(code)
  const side = modules.length + 8
  const unit = Math.floor(PLATE / side)
  const plate = unit * side
  const lines: string[][] = []
  const groups = groupCode(code)
  for (let i = 0; i < groups.length; i += GROUPS_PER_LINE) lines.push(groups.slice(i, i + GROUPS_PER_LINE))
  const codeTop = QR_TOP + plate + 96
  const footTop = codeTop + lines.length * CODE_LINE + 40
  const height = footTop + 170

  const { canvas, ctx } = paperCanvas(height)
  drawHeader(ctx, pack.election.shortName)

  // Titre, marche à suivre, contenu
  ctx.fillStyle = COLORS.print
  fit(ctx, 'Mes réponses, à reprendre', 850, 96, R - M, true)
  ctx.fillText('Mes réponses, à reprendre', M, 262)
  ctx.fillStyle = COLORS.printSoft
  const how = 'Sur l’autre appareil : Isoloir, puis Autre appareil, Récupérer mes réponses.'
  fit(ctx, how, 400, 30, R - M)
  ctx.fillText(how, M, 314)
  ctx.fillStyle = COLORS.print
  const what = `Code du ${dateFr(now)} · ${sheetContents(state)}`
  fit(ctx, what, 650, 28, R - M)
  ctx.fillText(what, M, 362)

  // Le QR code, noir sur une plaque blanche, des modules entiers
  const x0 = Math.round((IMAGE_W - plate) / 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x0, QR_TOP, plate, plate)
  ctx.fillStyle = '#000000'
  modules.forEach((row, y) =>
    row.forEach((on, x) => {
      if (on) ctx.fillRect(x0 + (x + 4) * unit, QR_TOP + (y + 4) * unit, unit, unit)
    }),
  )
  ctx.strokeStyle = COLORS.print
  ctx.lineWidth = 1.5
  ctx.strokeRect(x0 + 0.75, QR_TOP + 0.75, plate - 1.5, plate - 1.5)

  // Le code à recopier, par lignes de sept groupes numérotées
  ctx.fillStyle = COLORS.print
  font(ctx, 700, 26)
  ctx.fillText('Ou recopiez ce code :', M, codeTop - 30)
  ctx.fillRect(M, codeTop - 14, R - M, 1.5)
  lines.forEach((line, i) => {
    const y = codeTop + 26 + i * CODE_LINE
    ctx.fillStyle = COLORS.printSoft
    font(ctx, 800, 24, true)
    ctx.textAlign = 'right'
    ctx.fillText(String(i + 1), M + 34, y)
    ctx.textAlign = 'left'
    ctx.fillStyle = COLORS.print
    ctx.font = `500 ${CODE_SIZE}px ${MONO}`
    ctx.fillText(line.join('  '), M + 60, y)
  })

  // Pied : ce que contient l'image, et d'où elle vient
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, footTop, R - M, 1.5)
  const notes = [
    'Ne publiez jamais cette image, ni sur les réseaux sociaux ni ailleurs :',
    'n’importe qui pourrait y lire chacune de vos réponses et vos lignes rouges.',
  ]
  const size = Math.min(...notes.map(n => fit(ctx, n, 400, 26, R - M)))
  font(ctx, 400, size)
  notes.forEach((n, i) => ctx.fillText(n, M, footTop + 48 + i * 34))
  const foot = `Fabriqué sur mon appareil par ${APP_NAME} · ${APP_URL.replace(/^https?:\/\//, '')}`
  fit(ctx, foot, 600, 26, R - M)
  ctx.fillText(foot, M, footTop + 136)
  return canvas
}

export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('PNG indisponible'))), 'image/png'))
}
