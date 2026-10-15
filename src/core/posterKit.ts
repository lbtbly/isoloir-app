// Les pièces communes des images dessinées sur l'appareil, sur le double jaune : papier, encres, polices, marges,
// en-tête de formulaire (logo, élection, double filet). L'affiche et « Accords et désaccords » (core/shareImage.ts,
// qui les réexporte), l'image de la table et celle du code de reprise (core/transferImage.ts) s'en servent ; à part,
// pour qu'une image ne fasse pas charger les aides des autres.

import { LOGO, PASTELS, belowBaseline, drawLogo } from './brand'

export const IMAGE_W = 1080

export const COLORS = {
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

export function font(ctx: CanvasRenderingContext2D, weight: number, size: number, condensed = false) {
  ctx.font = `${condensed ? 'condensed ' : ''}${weight} ${size}px ${FONT}`
  try {
    ;(ctx as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = condensed ? 'condensed' : 'normal'
  } catch {
    // propriété non prise en charge : la largeur normale convient
  }
}

/** Le texte, coupé d'une ellipse s'il ne tient toujours pas dans la largeur à la police courante */
export function clip(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

/**
 * Réduit la taille jusqu'à ce que le texte tienne dans la largeur (Safari ignore fontStretch), sans descendre
 * sous « floor » fois la taille de départ
 */
export function fit(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  size: number,
  maxWidth: number,
  condensed = false,
  floor = 0.55,
): number {
  let s = size
  font(ctx, weight, s, condensed)
  while (ctx.measureText(text).width > maxWidth && s > size * floor) {
    s -= 2
    font(ctx, weight, s, condensed)
  }
  return s
}

/** Marges de l'image : le texte et les filets vont de M à R */
export const M = 72
export const R = IMAGE_W - M

/** Les polices de l'image, chargées avant de dessiner */
export async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`800 100px ${FONT}`),
      document.fonts.load(`600 40px ${FONT}`),
      document.fonts.load(`400 28px ${FONT}`),
    ])
  } catch {
    // polices indisponibles : repli sur les polices système
  }
}

/** Une feuille de papier jaune de IMAGE_W de large */
export function paperCanvas(height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_W
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponible')
  ctx.fillStyle = COLORS.paper
  ctx.fillRect(0, 0, IMAGE_W, height)
  ctx.textBaseline = 'alphabetic'
  return { canvas, ctx }
}

/**
 * L'en-tête de formulaire des images : le logo à gauche, le nom de l'élection à droite sur la ligne de base du mot,
 * puis le double filet (5px et 1,5px) ; le contenu commence sous y = 160
 */
export function drawHeader(ctx: CanvasRenderingContext2D, shortName: string) {
  const logo = drawLogo(ctx, { layout: 'horizontal', ink: COLORS.print, drape: DRAPE_SUR_DOUBLE, x: M, y: LOGO_TOP, height: LOGO_H })
  ctx.fillStyle = COLORS.print
  fit(ctx, shortName, 500, 28, R - M - logo.width - 48)
  ctx.textAlign = 'right'
  ctx.fillText(shortName, R, LOGO_BASELINE)
  ctx.textAlign = 'left'
  ctx.fillRect(M, 140, R - M, 5)
  ctx.fillRect(M, 151, R - M, 1.5)
}
