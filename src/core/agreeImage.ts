// Image de partage « Accords et désaccords » : la section du dépouillement (ui/screens/Results.tsx, Agreement), sur le
// même double jaune que l'affiche « Mon dépouillement » (core/shareImage.ts), dont elle reprend l'en-tête, le tampon,
// le pied, l'ordre, les numéros et les aides de dessin. Pour chaque candidat : numéro, nom (et parti si la place le
// permet), pourcentage, puis deux barres divergentes, ses approches principales et ses autres positions, désaccords à
// gauche de l'axe, accords à droite, nombres écrits, sur une même échelle pour toute l'image.
// Un fichier à part du build, chargé à la demande (ui/share/load.ts) quand on choisit cette image dans « Partager ».

import { affinityBand } from './affinity'
import { AGREE_HEADS, AGREE_NONE, count, TITLE_AGREE } from './agreeCopy'
import { displayScore, type AgreementTally, type CandidateResult, type Results } from './score'
import {
  AGREE_ROWS,
  clip,
  COLORS,
  drawFoot,
  drawTail,
  drawTop,
  fit,
  flaggedCount,
  font,
  FOOT_H,
  IMAGE_H,
  loadFonts,
  M,
  offPosterText,
  onAnswers,
  onAnswersText,
  othersText,
  paperCanvas,
  posterNotes,
  posterPositions,
  posterRanking,
  R,
  redCross,
  ROWS_TOP,
  shareFileStem,
  tailHeight,
} from './shareImage'
import type { Candidate, CandidateId, ElectionPack } from './types'

/** Les 5 plus proches, les 5 plus éloignés ou tous les candidats classés */
export type AgreeScope = 'top' | 'flop' | 'all'

export interface AgreeOptions {
  /** Signaler d'une croix (et de barres pâlies) les candidats qui franchissent une ligne rouge */
  showFlags: boolean
  scope: AgreeScope
}

/** Hauteur au plus de l'image de tous les candidats ; les autres gardent celle de l'affiche (IMAGE_H) */
export const AGREE_MAX_H = 1920

/**
 * Accords et désaccords sur le papier jaune : les teintes du site sur le double (--copy-aff-tres-proche et
 * --copy-aff-eloigne de styles/tokens.css), 5,6:1 et 5,2:1 sur le papier ; pâlies (PALE), les barres d'un candidat
 * qui franchit une ligne rouge, mais jamais ses nombres
 */
export const AGREE_COLORS = { agree: '#00672a', disagree: '#9c4400' } as const
const PALE = 0.45

/** Les titres des colonnes, sous le filet des lignes : leur hauteur, filet du bas compris */
const HEAD_H = 56
/** Haut de la première ligne de candidat */
export const AGREE_ROWS_TOP = ROWS_TOP + HEAD_H
/** Hauteur d'une ligne quand la place ne manque pas (« Tous ») ; jamais plus de AGREE_ROW_MAX */
const ROW_IDEAL = 96
const AGREE_ROW_MAX = 112
/** Blanc entre les deux colonnes de barres */
const GAP = 56

/**
 * Les candidats de l'image, dans l'ordre et sous les numéros de l'affiche (posterRanking, posterPositions) : les
 * AGREE_ROWS premiers (« top ») ou derniers, du plus éloigné au moins éloigné (« flop »), les autres à part ; ou tous
 */
export function agreeRanking(
  results: Results,
  showFlags: boolean,
  scope: AgreeScope,
): { shown: CandidateResult[]; others: CandidateResult[] } {
  return scope === 'all' ? posterRanking(results, showFlags, 'top', Infinity) : posterRanking(results, showFlags, scope, AGREE_ROWS)
}

/** L'échelle commune à toutes les barres de l'image : le plus grand compte de ses candidats, au moins 1 */
export function agreeScale(shown: CandidateResult[]): number {
  return Math.max(1, ...shown.filter(r => r.score !== null).flatMap(r => [r.breakdown.main, r.breakdown.other]).flatMap(t => [t.agree, t.disagree]))
}

/**
 * Hauteur de l'image et de chaque ligne : celle de l'affiche pour 5 candidats ; pour « Tous », autant qu'il faut
 * pour des lignes pleines, sans dépasser AGREE_MAX_H, les lignes se serrant au-delà. « tail » : la place gardée sous
 * les lignes (tailHeight)
 */
export function agreeLayout(rows: number, tail: number, scope: AgreeScope): { height: number; rowH: number } {
  const n = Math.max(rows, 1)
  const fixed = AGREE_ROWS_TOP + tail + FOOT_H
  const height = scope === 'all' ? Math.min(AGREE_MAX_H, Math.max(IMAGE_H, fixed + n * ROW_IDEAL)) : IMAGE_H
  return { height, rowH: Math.min(AGREE_ROW_MAX, Math.floor((height - fixed) / n)) }
}

/**
 * Le début du sous-titre : quels candidats (« Les 5 plus proches de mes idées », « Les 15 candidats classés »). Avec
 * des candidats hors classement ou non classés, « Les 5 classés les plus proches » : le plus proche ne l'est que parmi
 * les classés, comme sur l'affiche du dépouillement (décision du propriétaire du 2026-10-15)
 */
export function agreeLead(results: Results, scope: AgreeScope, shown: number): string {
  const off = results.unranked.length + results.excluded.length > 0
  if (scope === 'top') return `Les ${shown}${off ? ' classés les' : ''} plus proches de mes idées`
  if (scope === 'flop') return `Les ${shown}${off ? ' classés les' : ''} plus éloignés de mes idées`
  return shown > 1 ? `Les ${shown} candidats${off ? ' classés' : ''}` : `Le candidat${off ? ' classé' : ''}`
}

/** Le nom de fichier : « isoloir-<élection>-<date>-accords-plus-proches.jpg », « …-plus-eloignes », « …-tous » */
export function agreeFileName(pack: ElectionPack, date = new Date(), scope: AgreeScope = 'top'): string {
  return `${shareFileStem(pack, date)}-accords-${scope === 'top' ? 'plus-proches' : scope === 'flop' ? 'plus-eloignes' : 'tous'}.jpg`
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const tallyText = (head: string, t: AgreementTally) => `${lower(head)}, ${count(t.agree, 'accord')} et ${count(t.disagree, 'désaccord')}`

/**
 * Le texte de remplacement : ce que montre l'image, ligne à ligne (numéro, nom, pourcentage, croix, accords et
 * désaccords de chaque barre), puis les autres candidats, les candidats hors classement et non classés, et les
 * notes de pied
 */
export function agreeAlt(pack: ElectionPack, results: Results, { showFlags, scope }: AgreeOptions): string {
  const { shown, others } = agreeRanking(results, showFlags, scope)
  const positions = posterPositions(results, showFlags)
  const names = new Map(pack.candidates.map(c => [c.id, c.name]))
  const rows = shown.map(r => {
    const head = `${positions.get(r.candidateId)}. ${names.get(r.candidateId)} ${displayScore(r.score) ?? '–'}\u00a0%${showFlags && !r.compatible ? ' (croix)' : ''}`
    return r.score === null
      ? `${head}\u00a0: ${lower(AGREE_NONE)}`
      : `${head}\u00a0: ${tallyText(AGREE_HEADS[0], r.breakdown.main)}\u00a0; ${tallyText(AGREE_HEADS[1], r.breakdown.other)}.`
  })
  const flagged = showFlags ? flaggedCount(others) : 0
  const rest = others.length
    ? ` Puis ${othersText(others, scope === 'flop' ? 'flop' : 'top', showFlags)}${flagged ? `, dont ${flagged} marqué${flagged > 1 ? 's' : ''} d’une croix` : ''}.`
    : ''
  const off = offPosterText(results.unranked.length, results.excluded.length)
  return (
    `Image « ${TITLE_AGREE} », ${lower(agreeLead(results, scope, shown.length))}, ${pack.election.shortName}, ${onAnswersText(results.answered)}. ` +
    `Mes accords et mes désaccords avec chaque candidat, sur ses approches principales puis sur ses autres positions${rows.length ? `\u00a0: ${rows.join(' ')}` : '.'}` +
    rest +
    (off ? ` ${off}.` : '') +
    posterNotes(results, showFlags)
      .map(n => ` ${n}`)
      .join('')
  )
}

/** Les deux colonnes de barres, sous les noms : l'axe de chacune */
const BARS_X = M + 70
const COL_W = (R - BARS_X - GAP) / 2
const AXES = [BARS_X + COL_W / 2, BARS_X + COL_W + GAP + COL_W / 2] as const

const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)))

/** Les jambages d'un nom (p, q, g) descendent sous sa ligne de base d'au plus cette part de sa taille */
export const DESCENT = 0.22

/**
 * Les tailles d'une ligne, selon sa hauteur : pleines à 92 et plus, serrées jusqu'à une cinquantaine. Les barres et
 * leur axe, qui dépasse de « tick » en haut et en bas, tiennent entre les jambages du nom, 4 px au-dessus au moins, et
 * le filet du bas de la ligne, 2 px au-dessous ; dans les lignes les plus serrées, l'axe dépasse moins et la barre
 * s'amincit plutôt que de toucher le nom
 */
export function agreeRowSizes(rowH: number) {
  const name = clamp(rowH * 0.42, 22, 38)
  const nameBase = Math.round(rowH * 0.42)
  const top = nameBase + name * DESCENT + 4
  const bottom = rowH - 2
  const tick = rowH < 60 ? 2 : rowH < 84 ? 3 : 5
  const bar = Math.min(clamp(rowH * 0.28, 12, 26), Math.floor(bottom - top - 2 * tick) - 1)
  return {
    num: clamp(rowH * 0.48, 30, 46),
    name,
    party: clamp(rowH * 0.27, 19, 23),
    pct: clamp(rowH * 0.5, 30, 48),
    count: clamp(rowH * 0.34, 24, 28),
    bar,
    tick,
    /** Ligne de base du nom et milieu des barres, depuis le haut de la ligne */
    nameBase,
    barMid: Math.min(Math.floor(bottom - tick - bar / 2), Math.max(Math.round(rowH * 0.73), Math.ceil(top + tick + bar / 2))),
  }
}

export async function renderAgreeImage(pack: ElectionPack, results: Results, options: AgreeOptions): Promise<HTMLCanvasElement> {
  await loadFonts()
  const { showFlags, scope } = options
  const { shown, others } = agreeRanking(results, showFlags, scope)
  const off = offPosterText(results.unranked.length, results.excluded.length)
  const { height, rowH } = agreeLayout(shown.length, tailHeight(others, showFlags, off), scope)
  const { canvas, ctx } = paperCanvas(height)
  drawTop(ctx, pack, results, TITLE_AGREE, onAnswers(agreeLead(results, scope, shown.length), results.answered))
  drawHeads(ctx)

  const byId = new Map(pack.candidates.map(c => [c.id, c]))
  const positions = posterPositions(results, showFlags)
  const max = agreeScale(shown)
  const sizes = agreeRowSizes(rowH)
  // La place d'un nombre au bout de sa barre : celle du plus grand ; la barre la plus longue va jusque-là
  font(ctx, 700, sizes.count)
  const reach = COL_W / 2 - ctx.measureText(String(max)).width - 18
  shown.forEach((r, i) => {
    const c = byId.get(r.candidateId)
    if (!c) return
    const y = AGREE_ROWS_TOP + i * rowH
    drawRow(ctx, r, c, positions, showFlags && !r.compatible, y, sizes, max, reach)
    // Un filet fin entre deux candidats
    if (i < shown.length - 1) {
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = COLORS.print
      ctx.fillRect(M, y + rowH - 1, R - M, 1)
      ctx.restore()
    }
  })
  drawTail(ctx, others, showFlags, scope === 'flop' ? 'flop' : 'top', off, AGREE_ROWS_TOP + shown.length * rowH + 6)
  drawFoot(ctx, results, showFlags, height)
  return canvas
}

/** Les titres des deux colonnes, puis, de part et d'autre de chaque axe, « désaccords » et « accords » */
function drawHeads(ctx: CanvasRenderingContext2D) {
  const top = ROWS_TOP - 20
  AGREE_HEADS.forEach((head, i) => {
    const axis = AXES[i]!
    ctx.fillStyle = COLORS.print
    ctx.textAlign = 'center'
    fit(ctx, head, 700, 24, COL_W)
    ctx.fillText(head, axis, top + 33)
    font(ctx, 700, 22)
    ctx.textAlign = 'right'
    ctx.fillStyle = AGREE_COLORS.disagree
    ctx.fillText('désaccords', axis - 10, top + 62)
    ctx.textAlign = 'left'
    ctx.fillStyle = AGREE_COLORS.agree
    ctx.fillText('accords', axis + 10, top + 62)
    ctx.fillStyle = COLORS.print
    ctx.fillRect(axis - 1, top + 44, 2, 24)
  })
  ctx.textAlign = 'left'
  ctx.fillRect(M, AGREE_ROWS_TOP - 2, R - M, 1.5)
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  r: CandidateResult,
  c: Candidate,
  positions: Map<CandidateId, number>,
  flagged: boolean,
  y: number,
  s: ReturnType<typeof agreeRowSizes>,
  max: number,
  reach: number,
) {
  const base = y + s.nameBase
  const score = displayScore(r.score)

  // Numéro, sur la ligne du nom
  ctx.fillStyle = COLORS.print
  font(ctx, 800, s.num, true)
  ctx.fillText(String(positions.get(r.candidateId) ?? ''), M, base)

  // Pourcentage à droite, sur l'échelle rouge → vert
  const band = affinityBand(score)
  font(ctx, 800, s.pct, true)
  ctx.textAlign = 'right'
  ctx.fillStyle = band?.poster ?? COLORS.print
  const pct = score === null ? '–' : `${score} %`
  ctx.fillText(pct, R, base)
  ctx.textAlign = 'left'
  const end = R - ctx.measureText(pct).width - 28

  // Nom, réduit puis coupé s'il le faut ; croix au stylo rouge ; parti à la suite, s'il tient en entier
  const half = Math.max(6, Math.round(s.name * 0.22))
  const cross = flagged ? 12 + 2 * half : 0
  ctx.fillStyle = COLORS.print
  fit(ctx, c.name, 700, s.name, end - BARS_X - cross, false, 0.75)
  const name = clip(ctx, c.name, end - BARS_X - cross)
  ctx.fillText(name, BARS_X, base)
  let x = BARS_X + ctx.measureText(name).width
  if (flagged) {
    redCross(ctx, x + 12 + half, base - s.name * 0.36, half)
    x += cross
  }
  font(ctx, 400, s.party)
  if (x + 18 + ctx.measureText(c.affiliation).width <= end) {
    ctx.fillStyle = COLORS.printSoft
    ctx.fillText(c.affiliation, x + 18, base)
  }

  // Les deux barres, ou, sans position connue, la phrase de la page
  const mid = y + s.barMid
  if (r.score === null) {
    ctx.fillStyle = COLORS.printSoft
    font(ctx, 400, s.count)
    ctx.fillText(AGREE_NONE, BARS_X, mid + s.count * 0.36)
    return
  }
  drawBar(ctx, r.breakdown.main, AXES[0], mid, s, max, reach, flagged)
  drawBar(ctx, r.breakdown.other, AXES[1], mid, s, max, reach, flagged)
}

/** Une barre divergente : désaccords à gauche de l'axe, accords à droite, nombres écrits au bout */
function drawBar(
  ctx: CanvasRenderingContext2D,
  tally: AgreementTally,
  axis: number,
  mid: number,
  s: ReturnType<typeof agreeRowSizes>,
  max: number,
  reach: number,
  pale: boolean,
) {
  const len = (n: number) => (n ? Math.max(4, (n / max) * reach) : 0)
  const against = len(tally.disagree)
  const pro = len(tally.agree)
  ctx.save()
  if (pale) ctx.globalAlpha = PALE
  ctx.fillStyle = AGREE_COLORS.disagree
  ctx.fillRect(axis - 1 - against, mid - s.bar / 2, against, s.bar)
  ctx.fillStyle = AGREE_COLORS.agree
  ctx.fillRect(axis + 1, mid - s.bar / 2, pro, s.bar)
  ctx.restore()
  // L'axe, un filet imprimé qui dépasse un peu la barre (s.tick), en haut et en bas
  ctx.fillStyle = COLORS.print
  ctx.fillRect(axis - 1, mid - s.bar / 2 - s.tick, 2, s.bar + 2 * s.tick)
  // Les nombres ; un zéro en gris, en maigre
  const digits = mid + s.count * 0.36
  font(ctx, tally.disagree ? 700 : 400, s.count)
  ctx.fillStyle = tally.disagree ? AGREE_COLORS.disagree : COLORS.printSoft
  ctx.textAlign = 'right'
  ctx.fillText(String(tally.disagree), axis - 1 - against - 8, digits)
  font(ctx, tally.agree ? 700 : 400, s.count)
  ctx.fillStyle = tally.agree ? AGREE_COLORS.agree : COLORS.printSoft
  ctx.textAlign = 'left'
  ctx.fillText(String(tally.agree), axis + 1 + pro + 8, digits)
  ctx.fillStyle = COLORS.print
}
