// Image de partage : le « double » jaune de la feuille, dessiné en Canvas 2D sur l'appareil.
// Aucune réponse détaillée ni aucune ligne rouge n'y figure par défaut.

import { APP_NAME, APP_URL } from './app'
import { affinityBand } from './affinity'
import { LOGO, PASTELS, belowBaseline, drawLogo } from './brand'
import { displayScore, strokesFor, type Results } from './score'
import type { ElectionPack } from './types'

export const IMAGE_W = 1080
export const IMAGE_H = 1350

const COLORS = {
  paper: '#f2e7a6',
  print: '#1d1b10',
  printSoft: '#4f4823',
  ink: '#1f3bb3',
  red: '#b7191c',
  // Jaune du rideau plus soutenu : le pastel du logo se confondrait avec le papier du double (1,01:1)
  drapeJaune: '#e3c45a',
}

/** Le rideau du logo sur le double : les pastels, sauf le jaune, foncé pour se détacher du papier */
const DRAPE_SUR_DOUBLE = [PASTELS.vert, PASTELS.rouge, COLORS.drapeJaune, PASTELS.bleu] as const

const FONT = "'Archivo Variable', 'Archivo', 'Helvetica Neue', Arial, sans-serif"

// Logo de l'en-tête : sa boîte serrée tient au-dessus du double filet (y = 140), avec un blanc dessous
const LOGO_H = 72
const LOGO_TOP = 54
/** Ligne de base du mot « isoloir », où se pose le nom de l'élection */
const LOGO_BASELINE = LOGO_TOP + (1 - belowBaseline(LOGO.horizontal)) * LOGO_H

export interface ShareOptions {
  /** Signaler d'une croix les candidats qui franchissent une ligne rouge (désactivé par défaut) */
  showFlags: boolean
  date?: Date
}

function font(ctx: CanvasRenderingContext2D, weight: number, size: number, condensed = false) {
  ctx.font = `${condensed ? 'condensed ' : ''}${weight} ${size}px ${FONT}`
  try {
    ;(ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = condensed ? 'condensed' : 'normal'
  } catch {
    // propriété non prise en charge : la largeur normale convient
  }
}

/** Réduit la taille jusqu'à ce que le texte tienne dans la largeur (Safari ignore fontStretch) */
function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  maxWidth: number,
  condensed = false,
): number {
  let s = size
  font(ctx, weight, s, condensed)
  while (ctx.measureText(text).width > maxWidth && s > size * 0.55) {
    s -= 2
    font(ctx, weight, s, condensed)
  }
  return s
}

function tally(ctx: CanvasRenderingContext2D, x: number, y: number, count: number, scale = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.strokeStyle = COLORS.ink
  ctx.lineWidth = 3.4 / Math.max(scale, 0.6)
  ctx.lineCap = 'round'
  const groups = Math.ceil(count / 5)
  for (let g = 0; g < groups; g++) {
    const gx = g * 56
    const n = Math.min(5, count - g * 5)
    for (let k = 0; k < n; k++) {
      const i = g * 5 + k
      const jx = Math.sin(i * 7.1) * 1.2
      ctx.beginPath()
      if (k < 4) {
        ctx.moveTo(gx + 6 + k * 9 + jx, 0)
        ctx.lineTo(gx + 6.6 + k * 9 - jx, 34)
      } else {
        ctx.moveTo(gx + 1, 29)
        ctx.lineTo(gx + 43, 6)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
  return groups * 56 * scale
}

export async function renderShareImage(
  pack: ElectionPack,
  results: Results,
  options: ShareOptions,
): Promise<HTMLCanvasElement> {
  try {
    await Promise.all([
      document.fonts.load(`800 100px ${FONT}`),
      document.fonts.load(`600 40px ${FONT}`),
      document.fonts.load(`400 28px ${FONT}`),
    ])
  } catch {
    // polices indisponibles : repli sur les polices système
  }

  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_W
  canvas.height = IMAGE_H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')

  const M = 72
  const R = IMAGE_W - M
  ctx.fillStyle = COLORS.paper
  ctx.fillRect(0, 0, IMAGE_W, IMAGE_H)
  ctx.textBaseline = 'alphabetic'

  // En-tête de formulaire : le logo à gauche, le nom de l'élection à droite sur la ligne de base du mot
  const logo = drawLogo(ctx, { layout: 'horizontal', ink: COLORS.print, drape: DRAPE_SUR_DOUBLE, x: M, y: LOGO_TOP, height: LOGO_H })
  ctx.fillStyle = COLORS.print
  fit(ctx, pack.election.shortName, 500, 28, R - M - logo.width - 48)
  ctx.textAlign = 'right'
  ctx.fillText(pack.election.shortName, R, LOGO_BASELINE)
  ctx.textAlign = 'left'
  ctx.fillRect(M, 140, R - M, 5)
  ctx.fillRect(M, 151, R - M, 1.5)

  // Titre
  fit(ctx, 'Mon dépouillement', 850, 112, R - M, true)
  ctx.fillText('Mon dépouillement', M, 284)

  // Sous-titre et bâtons
  ctx.fillStyle = COLORS.printSoft
  const sub = `Affinité d’idées, sur ${results.answered} réponse${results.answered > 1 ? 's' : ''}`
  fit(ctx, sub, 400, 30, R - M - 290)
  ctx.fillText(sub, M, 342)
  tally(ctx, M, 372, Math.min(results.answered, 40))

  // Lignes du classement
  const ranking = options.showFlags
    ? results.ranking
    : results.ranking.slice().sort((a, b) => (displayScore(b.score) ?? -1) - (displayScore(a.score) ?? -1))
  const top = 470
  const rowH = Math.min(150, Math.floor((1130 - top) / Math.max(ranking.length, 1)))
  const byId = new Map(pack.candidates.map(c => [c.id, c]))
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, top - 20, R - M, 1.5)

  // Sans les croix, l'ordre suit la seule affinité : aucun numéro de rang n'est imprimé, pour ne jamais
  // contredire le classement de l'application (qui relègue les candidats franchissant une ligne rouge)
  const reordered = !options.showFlags && ranking.some((r, i) => r.candidateId !== results.ranking[i]?.candidateId)
  ranking.forEach((r, i) => {
    const c = byId.get(r.candidateId)
    if (!c) return
    const y = top + i * rowH
    const score = displayScore(r.score)

    ctx.fillStyle = COLORS.print
    if (options.showFlags) {
      font(ctx, 800, 56, true)
      ctx.fillText(String(r.rank), M, y + 62)
    } else {
      ctx.fillRect(M, y + 40, 26, 3)
    }

    const flagged = options.showFlags && !r.compatible
    fit(ctx, c.name, 700, 42, R - (M + 70) - 230 - (flagged ? 44 : 0))
    ctx.fillText(c.name, M + 70, y + 50)
    if (flagged) {
      // Ligne rouge franchie : une croix au stylo rouge après le nom
      const cx = M + 70 + ctx.measureText(c.name).width + 24
      ctx.save()
      ctx.strokeStyle = COLORS.red
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx - 9, y + 26)
      ctx.lineTo(cx + 9, y + 44)
      ctx.moveTo(cx + 9, y + 26)
      ctx.lineTo(cx - 9, y + 44)
      ctx.stroke()
      ctx.restore()
    }
    ctx.fillStyle = COLORS.printSoft
    fit(ctx, c.affiliation, 400, 26, R - (M + 70) - 230)
    ctx.fillText(c.affiliation, M + 70, y + 86)

    // Pourcentage sur l'échelle rouge → vert, avec le libellé du palier dessous
    const band = affinityBand(score)
    ctx.fillStyle = band?.poster ?? COLORS.print
    font(ctx, 800, 76, true)
    ctx.textAlign = 'right'
    ctx.fillText(score === null ? '–' : `${score} %`, R, y + 70)
    if (band) {
      font(ctx, 700, 22)
      ctx.fillText(band.label, R, y + 100)
    }
    ctx.textAlign = 'left'
    ctx.fillStyle = COLORS.print

    // Bâtons de pointage : un bâton vaut 5 points d'affinité, comme sur la page de résultats
    ctx.save()
    if (options.showFlags && !r.compatible) ctx.globalAlpha = 0.45
    tally(ctx, M + 70, y + 98, strokesFor(r.score), 0.8)
    ctx.restore()
  })

  // Tampon daté, à droite du sous-titre
  const [yy, mm, dd] = pack.election.dataFrozenAt.split('-')
  ctx.save()
  ctx.translate(R - 252, 318)
  ctx.rotate(-0.06)
  ctx.strokeStyle = COLORS.print
  ctx.lineWidth = 3
  ctx.strokeRect(0, 0, 252, 92)
  ctx.fillStyle = COLORS.print
  fit(ctx, 'POSITIONS ARRÊTÉES AU', 650, 17, 252 - 32)
  ctx.fillText('POSITIONS ARRÊTÉES AU', 16, 32)
  fit(ctx, `${dd}.${mm}.${yy}`, 850, 42, 252 - 32, true)
  ctx.fillText(`${dd}.${mm}.${yy}`, 16, 76)
  ctx.restore()

  // Pied
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, IMAGE_H - 96, R - M, 1.5)
  const lines = [
    'Résultat indicatif, pas une consigne de vote. Calculé sur mon appareil,',
    'aucune réponse n’a été transmise.',
    ...(options.showFlags && results.ranking.some(r => !r.compatible) ? ['La croix rouge : franchit une de mes lignes rouges.'] : []),
    ...(reordered ? ['Ordre par affinité seule, sans tenir compte de mes lignes rouges.'] : []),
  ]
  const lineSize = Math.min(...lines.map(l => fit(ctx, l, 400, 25, R - M)))
  font(ctx, 400, lineSize)
  lines.forEach((l, i) => ctx.fillText(l, M, IMAGE_H - 184 + i * 34))
  const foot = APP_URL ? `Faites le vôtre\u00a0: ${APP_URL.replace(/^https?:\/\//, '')}` : `${APP_NAME} · boussole électorale indépendante`
  fit(ctx, foot, 600, 28, R - M)
  ctx.fillText(foot, M, IMAGE_H - 50)

  return canvas
}

export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Conversion JPEG impossible'))), 'image/jpeg', 0.92),
  )
}

export function shareFileName(pack: ElectionPack, date = new Date()): string {
  return `${APP_NAME.toLowerCase()}-${pack.election.id}-${date.toISOString().slice(0, 10)}.jpg`
}
