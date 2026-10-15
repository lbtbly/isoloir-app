// Image de partage : le « double » jaune de la feuille, dessiné en Canvas 2D sur l'appareil.
// Aucune réponse détaillée ni aucune ligne rouge n'y figure par défaut.
// Ses aides (en-tête, tampon, pied, ordre, numéros, dessin) servent aussi l'image « Accords et désaccords »
// (core/agreeImage.ts, chargée à la demande), qui les importe d'ici.

import { APP_NAME, APP_URL } from './app'
import { affinityBand } from './affinity'
import { LOGO, PASTELS, belowBaseline, drawLogo } from './brand'
import { displayScore, strokesFor, type CandidateResult, type Results } from './score'
import type { Candidate, CandidateId, ElectionPack } from './types'

export const IMAGE_W = 1080
export const IMAGE_H = 1350

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

/** Lignes de candidats sur l'affiche ; au-delà (élection nombreuse), une ligne « + N autres candidats » */
export const POSTER_ROWS = 7
/** Lignes de candidats de l'image « Accords et désaccords » (core/agreeImage.ts), hors « Tous » */
export const AGREE_ROWS = 5
/** Jusqu'à ce nombre de lignes, chacune a sa place pleine (nom, parti, bâtons dessous) ; au-delà, une ligne serrée */
const ROOMY_ROWS = 5

/** L'affiche montre les candidats les plus proches de mes idées (« top ») ou les plus éloignés (« flop ») */
export type PosterView = 'top' | 'flop'

/**
 * Tous les candidats classés, du plus proche au plus éloigné : l'ordre du classement avec les croix, sinon
 * l'affinité seule (sans le report des lignes rouges). Sans les croix, les ex aequo suivent le tirage de la graine
 * (results.drawOrder), pas le classement, qui fait passer les candidats sans ligne rouge franchie devant : l'ordre
 * est alors celui que donneraient les mêmes avis sans aucune ligne rouge
 */
function posterOrder(results: Results, showFlags: boolean): CandidateResult[] {
  const draw = results.drawOrder
  return showFlags
    ? results.ranking
    : results.ranking
        .slice()
        .sort(
          (a, b) =>
            (displayScore(b.score) ?? -1) - (displayScore(a.score) ?? -1) || draw.indexOf(a.candidateId) - draw.indexOf(b.candidateId),
        )
}

/**
 * Les candidats de l'affiche, dans son ordre. « top » : les POSTER_ROWS premiers (ou « rows »), du plus proche au plus
 * éloigné, les autres à part ; « flop » : les POSTER_ROWS derniers, du plus éloigné au moins éloigné, les autres (plus
 * proches) à part. L'image « Accords et désaccords » en prend AGREE_ROWS, dans le même ordre.
 */
export function posterRanking(
  results: Results,
  showFlags: boolean,
  view: PosterView = 'top',
  rows = POSTER_ROWS,
): { shown: CandidateResult[]; others: CandidateResult[] } {
  const order = posterOrder(results, showFlags)
  const cut = Math.max(order.length - rows, 0)
  if (view === 'flop') return { shown: order.slice(cut).reverse(), others: order.slice(0, cut) }
  if (order.length <= rows) return { shown: order, others: [] }
  return { shown: order.slice(0, rows), others: order.slice(rows) }
}

/**
 * Le numéro imprimé devant chaque candidat de l'affiche, toujours : avec les croix, son rang au classement ; sans
 * elles, sa place dans l'ordre d'affinité seule de l'affiche (même numéro pour le même pourcentage affiché, comme au
 * classement), pour ne jamais trahir par un rang qu'un candidat a été relégué pour une ligne rouge.
 */
export function posterPositions(results: Results, showFlags: boolean): Map<CandidateId, number> {
  const positions = new Map<CandidateId, number>()
  let prev: CandidateResult | undefined
  posterOrder(results, showFlags).forEach((r, i) => {
    const same = prev !== undefined && displayScore(prev.score) === displayScore(r.score)
    positions.set(r.candidateId, showFlags ? r.rank : same && prev ? positions.get(prev.candidateId)! : i + 1)
    prev = r
  })
  return positions
}

/**
 * « 13 autres candidats, de 41 à 52 % » (ou « 1 autre candidat, à 41 % ») : les candidats hors de l'affiche ; sur
 * l'affiche des plus éloignés, « 13 autres candidats, plus proches, de 52 à 61 % », ou, avec les croix (l'ordre du
 * classement, où un candidat relégué peut avoir un pourcentage plus haut), « mieux classés »
 */
export function othersText(others: CandidateResult[], view: PosterView = 'top', showFlags = false): string {
  const n = others.length
  const closer = view === 'flop' ? `, ${showFlags ? 'mieux classé' : 'plus proche'}${n > 1 ? 's' : ''}` : ''
  const who = `${n}\u00a0autre${n > 1 ? 's' : ''} candidat${n > 1 ? 's' : ''}${closer}`
  const scores = others.map(r => displayScore(r.score)).filter((x): x is number => x !== null)
  if (!scores.length) return who
  const lo = Math.min(...scores)
  const hi = Math.max(...scores)
  return lo === hi ? `${who}, à ${lo}\u00a0%` : `${who}, de ${lo} à ${hi}\u00a0%`
}

/**
 * Les notes de pied qui expliquent l'affiche, après « Résultat indicatif… » : avec les croix, leur légende s'il y en a ;
 * sans elles, toujours la même phrase (ordre et numéros par affinité seule), qu'il y ait ou non des lignes rouges et
 * qu'un candidat en franchisse ou non : une note qui ne paraîtrait qu'en cas de relégation trahirait les lignes rouges.
 * Le texte de remplacement de l'image (Share.tsx) les reprend.
 */
export function posterNotes(results: Results, showFlags: boolean): string[] {
  if (!showFlags) return ['Ordre et numéros par affinité seule, sans tenir compte des lignes rouges.']
  return results.ranking.some(r => !r.compatible) ? ['La croix rouge : franchit une de mes lignes rouges.'] : []
}

/** Avec les croix : combien des candidats hors de l'affiche franchissent une ligne rouge */
export const flaggedCount = (others: CandidateResult[]): number => others.filter(r => !r.compatible).length

/**
 * Règle « hors classement » : l'affiche ne montre que les candidats classés ; les autres tiennent en une ligne,
 * « 3 candidats hors classement (trop peu de positions connues) », sans nom ni score
 */
export function unrankedText(n: number): string {
  return `${n}\u00a0candidat${n > 1 ? 's' : ''} hors classement (trop peu de positions connues)`
}

/**
 * La ligne des candidats absents de l'affiche, leur seul nombre, sans nom ni score : hors classement (règle
 * election.ranking) et non classés (election.ranking.excluded). null s'il n'y en a aucun (la primaire).
 * « 7 candidats non classés (trop peu de positions connues) » ; « 2 candidats hors classement et 7 non classés (…) »
 */
export function offPosterText(unranked: number, excluded: number): string | null {
  if (!excluded) return unranked ? unrankedText(unranked) : null
  const off = `non classé${excluded > 1 ? 's' : ''} (trop peu de positions connues)`
  if (!unranked) return `${excluded}\u00a0candidat${excluded > 1 ? 's' : ''} ${off}`
  return `${unranked}\u00a0candidat${unranked > 1 ? 's' : ''} hors classement et ${excluded}\u00a0${off}`
}

/** Hauteur gardée sous les lignes pour la ligne des candidats hors classement et non classés */
const UNRANKED_H = 60
/** Bas de la place des lignes : le pied commence 220 au-dessus du bord de l'image */
export const FOOT_H = 220

export interface ShareOptions {
  /** Signaler d'une croix les candidats qui franchissent une ligne rouge (désactivé par défaut) */
  showFlags: boolean
  /** Les plus proches (par défaut) ou les plus éloignés */
  view?: PosterView
  date?: Date
}

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

/** Marges de l'image : le texte et les filets vont de M à R */
export const M = 72
export const R = IMAGE_W - M
/** Haut des lignes de candidats ; un filet les ouvre 20 plus haut */
export const ROWS_TOP = 470

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

/** « sur 12 réponses » */
export const onAnswersText = (answered: number) => `sur ${answered} réponse${answered > 1 ? 's' : ''}`
/** « …, sur 12 réponses » : le sous-titre de l'image */
export const onAnswers = (lead: string, answered: number) => `${lead}, ${onAnswersText(answered)}`

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

/**
 * Le haut de l'image : en-tête de formulaire (logo, élection, double filet), titre, sous-titre et bâtons des réponses,
 * tampon daté à droite, puis le filet qui ouvre les lignes (ROWS_TOP - 20)
 */
export function drawTop(ctx: CanvasRenderingContext2D, pack: ElectionPack, results: Results, title: string, sub: string) {
  drawHeader(ctx, pack.election.shortName)

  // Titre
  fit(ctx, title, 850, 112, R - M, true)
  ctx.fillText(title, M, 284)

  // Sous-titre et bâtons
  ctx.fillStyle = COLORS.printSoft
  fit(ctx, sub, 400, 30, R - M - 290)
  ctx.fillText(sub, M, 342)
  tally(ctx, M, 372, Math.min(results.answered, 40))

  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, ROWS_TOP - 20, R - M, 1.5)

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
}

/** Le pied de l'image, au bas d'une image de hauteur « height » : avertissement, notes de pied, adresse du site */
export function drawFoot(ctx: CanvasRenderingContext2D, results: Results, showFlags: boolean, height: number) {
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, height - 96, R - M, 1.5)
  const lines = [
    'Résultat indicatif, pas une consigne de vote. Calculé sur mon appareil,',
    'aucune réponse n’a été transmise.',
    ...posterNotes(results, showFlags),
  ]
  const lineSize = Math.min(...lines.map(l => fit(ctx, l, 400, 25, R - M)))
  font(ctx, 400, lineSize)
  lines.forEach((l, i) => ctx.fillText(l, M, height - 184 + i * 34))
  const foot = APP_URL ? `Faites le vôtre\u00a0: ${APP_URL.replace(/^https?:\/\//, '')}` : `${APP_NAME} · boussole électorale indépendante`
  fit(ctx, foot, 600, 28, R - M)
  ctx.fillText(foot, M, height - 50)
}

/**
 * Sous-titre de l'affiche des plus éloignés ; avec des candidats hors classement ou non classés, « Les classés les plus
 * éloignés » : l'affiche ne montre que les classés (décision du propriétaire du 2026-10-15, comme l'affiche du plus
 * proche)
 */
export const flopLead = (results: Results) =>
  results.unranked.length + results.excluded.length > 0 ? 'Les classés les plus éloignés de mes idées' : 'Les plus éloignés de mes idées'

export async function renderShareImage(
  pack: ElectionPack,
  results: Results,
  options: ShareOptions,
): Promise<HTMLCanvasElement> {
  await loadFonts()
  const { canvas, ctx } = paperCanvas(IMAGE_H)
  const view = options.view ?? 'top'
  drawTop(ctx, pack, results, 'Mon dépouillement', onAnswers(view === 'flop' ? flopLead(results) : 'Affinité d’idées', results.answered))

  // Lignes du classement
  const { shown: ranking, others } = posterRanking(results, options.showFlags, view)
  const top = ROWS_TOP
  const byId = new Map(pack.candidates.map(c => [c.id, c]))

  // Sans les croix, l'ordre suit la seule affinité, et les numéros aussi (posterPositions) ; une note de pied le dit
  // toujours (posterNotes)
  const positions = posterPositions(results, options.showFlags)
  // Élection nombreuse : des lignes serrées, puis les autres candidats en une ligne ; enfin, le nombre de candidats
  // hors classement et non classés, sans nom ni score
  const off = offPosterText(results.unranked.length, results.excluded.length)
  if (ranking.length > ROOMY_ROWS) drawCompactRows(ctx, ranking, others, byId, positions, options.showFlags, view, top, off)
  else drawRoomyRows(ctx, ranking, byId, positions, options.showFlags, top, off)

  drawFoot(ctx, results, options.showFlags, IMAGE_H)
  return canvas
}

/** Croix au stylo rouge, centrée en (cx, cy) : le candidat franchit une ligne rouge */
export function redCross(ctx: CanvasRenderingContext2D, cx: number, cy: number, half = 9) {
  ctx.save()
  ctx.strokeStyle = COLORS.red
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - half, cy - half)
  ctx.lineTo(cx + half, cy + half)
  ctx.moveTo(cx + half, cy - half)
  ctx.lineTo(cx - half, cy + half)
  ctx.stroke()
  ctx.restore()
}

type ById = Map<string, Candidate>

/** Les candidats hors classement et non classés, en une ligne grise sous un filet, alignée sur les noms */
function drawUnrankedLine(ctx: CanvasRenderingContext2D, text: string, y: number) {
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, y, R - M, 1.5)
  ctx.fillStyle = COLORS.printSoft
  fit(ctx, text, 600, 28, R - M - 70)
  ctx.fillText(text, M + 70, y + 42)
  ctx.fillStyle = COLORS.print
}

/** Jusqu'à 5 candidats : une ligne pleine chacun, nom et parti, bâtons dessous, pourcentage à droite */
function drawRoomyRows(
  ctx: CanvasRenderingContext2D,
  ranking: CandidateResult[],
  byId: ById,
  positions: Map<CandidateId, number>,
  showFlags: boolean,
  top: number,
  off: string | null,
) {
  const reserve = off ? UNRANKED_H : 0
  const rowH = Math.min(150, Math.floor((1130 - top - reserve) / Math.max(ranking.length, 1)))
  ranking.forEach((r, i) => {
    const c = byId.get(r.candidateId)
    if (!c) return
    const y = top + i * rowH
    const score = displayScore(r.score)

    ctx.fillStyle = COLORS.print
    font(ctx, 800, 56, true)
    ctx.fillText(String(positions.get(r.candidateId) ?? i + 1), M, y + 62)

    const flagged = showFlags && !r.compatible
    fit(ctx, c.name, 700, 42, R - (M + 70) - 230 - (flagged ? 44 : 0))
    ctx.fillText(c.name, M + 70, y + 50)
    // Ligne rouge franchie : une croix au stylo rouge après le nom
    if (flagged) redCross(ctx, M + 70 + ctx.measureText(c.name).width + 24, y + 35)
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
    if (showFlags && !r.compatible) ctx.globalAlpha = 0.45
    tally(ctx, M + 70, y + 98, strokesFor(r.score), 0.8)
    ctx.restore()
  })
  if (off) drawUnrankedLine(ctx, off, top + ranking.length * rowH + 6)
}

/**
 * Élection nombreuse : les premiers en lignes serrées (nom, bâtons et pourcentage sur une ligne, parti et palier
 * dessous), puis une ligne « + N autres candidats » avec l'étendue de leurs pourcentages
 */
function drawCompactRows(
  ctx: CanvasRenderingContext2D,
  ranking: CandidateResult[],
  others: CandidateResult[],
  byId: ById,
  positions: Map<CandidateId, number>,
  showFlags: boolean,
  view: PosterView,
  top: number,
  off: string | null,
) {
  // Les lignes prennent la place laissée par la ligne des autres candidats (et celle des croix), puis par celle des
  // candidats hors classement et non classés, sans dépasser 96
  const reserve = tailHeight(others, showFlags, off)
  const rowH = Math.min(96, Math.floor((1130 - top - reserve) / Math.max(ranking.length, 1)))
  const scoreW = 170
  // Place des bâtons : 20 au plus (100 %), en 4 paquets de 5 ; ils partent tous du même bord, comme au classement
  const tallyX = R - scoreW - 4 * 56 * 0.6
  ranking.forEach((r, i) => {
    const c = byId.get(r.candidateId)
    if (!c) return
    const y = top + i * rowH
    const score = displayScore(r.score)
    const flagged = showFlags && !r.compatible
    const strokes = strokesFor(r.score)

    ctx.fillStyle = COLORS.print
    font(ctx, 800, 44, true)
    ctx.fillText(String(positions.get(r.candidateId) ?? i + 1), M, y + 44)

    // Nom, jusqu'aux bâtons ; un nom très long est réduit, puis coupé d'une ellipse
    const nameMax = tallyX - 32 - (M + 70) - (flagged ? 40 : 0)
    fit(ctx, c.name, 700, 36, nameMax, false, 0.75)
    const name = clip(ctx, c.name, nameMax)
    ctx.fillText(name, M + 70, y + 40)
    if (flagged) redCross(ctx, M + 70 + ctx.measureText(name).width + 22, y + 27, 8)

    // Parti, sous le nom, jusqu'au palier
    ctx.fillStyle = COLORS.printSoft
    const partyMax = R - scoreW - (M + 70)
    fit(ctx, c.affiliation, 400, 22, partyMax, false, 0.8)
    ctx.fillText(clip(ctx, c.affiliation, partyMax), M + 70, y + 68)

    // Bâtons, entre le nom et le pourcentage
    ctx.save()
    if (flagged) ctx.globalAlpha = 0.45
    tally(ctx, tallyX, y + 14, strokes, 0.6)
    ctx.restore()

    // Pourcentage sur l'échelle rouge → vert, avec le libellé du palier dessous
    const band = affinityBand(score)
    ctx.fillStyle = band?.poster ?? COLORS.print
    font(ctx, 800, 56, true)
    ctx.textAlign = 'right'
    ctx.fillText(score === null ? '–' : `${score} %`, R, y + 46)
    if (band) {
      font(ctx, 700, 19)
      ctx.fillText(band.label, R, y + 70)
    }
    ctx.textAlign = 'left'
    ctx.fillStyle = COLORS.print
  })
  drawTail(ctx, others, showFlags, view, off, top + ranking.length * rowH + 6)
}

/**
 * Hauteur gardée sous les lignes pour ce qui les suit (drawTail) : la ligne des autres candidats (et celle des
 * croix), puis celle des candidats hors classement et non classés
 */
export function tailHeight(others: CandidateResult[], showFlags: boolean, off: string | null): number {
  const flaggedOthers = showFlags ? flaggedCount(others) : 0
  return (others.length ? (flaggedOthers ? 104 : 84) : 0) + (off ? (others.length ? 40 : UNRANKED_H) : 0)
}

/**
 * Sous les lignes, à partir de y : « + N autres candidats » avec l'étendue de leurs pourcentages (et, avec les croix,
 * combien d'entre eux franchissent une ligne rouge), puis les candidats hors classement et non classés
 */
export function drawTail(
  ctx: CanvasRenderingContext2D,
  others: CandidateResult[],
  showFlags: boolean,
  view: PosterView,
  off: string | null,
  y: number,
) {
  if (!others.length) {
    if (off) drawUnrankedLine(ctx, off, y)
    return
  }
  // Les autres candidats : leur nombre et l'étendue de leurs pourcentages, sous un filet
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, y, R - M, 1.5)
  const text = `+ ${othersText(others, view, showFlags)}`
  fit(ctx, text, 650, 30, R - M - 70)
  ctx.fillText(text, M + 70, y + 46)
  // Avec les croix, ceux d'entre eux qui franchissent une ligne rouge : l'étendue peut dépasser le premier affiché
  const flagged = showFlags ? flaggedCount(others) : 0
  if (flagged) {
    const more = `dont ${flagged} qui franchi${flagged > 1 ? 'ssent' : 't'} une de mes lignes rouges`
    redCross(ctx, M + 70 + 14, y + 80 - 8, 7)
    ctx.fillStyle = COLORS.printSoft
    fit(ctx, more, 400, 24, R - M - 70 - 40)
    ctx.fillText(more, M + 70 + 40, y + 80)
  }
  // Puis les candidats hors classement et non classés, sous la ligne des autres (sans second filet)
  if (off) {
    ctx.fillStyle = COLORS.printSoft
    fit(ctx, off, 600, 26, R - M - 70)
    ctx.fillText(off, M + 70, y + (flagged ? 118 : 84))
  }
  ctx.fillStyle = COLORS.print
}

export function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Conversion JPEG impossible'))), 'image/jpeg', 0.92),
  )
}

/** Le début du nom de fichier des images : « isoloir-<élection>-<date> » */
export const shareFileStem = (pack: ElectionPack, date: Date) =>
  `${APP_NAME.toLowerCase()}-${pack.election.id}-${date.toISOString().slice(0, 10)}`

export function shareFileName(pack: ElectionPack, date = new Date(), view: PosterView = 'top'): string {
  return `${shareFileStem(pack, date)}${view === 'flop' ? '-plus-eloignes' : ''}.jpg`
}
