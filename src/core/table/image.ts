// « À table » : l'image de la table, fabriquée sur le téléphone, sur le jaune du double, comme les autres images du
// site. Elle dit, en mots, ce que la table pense de quelques idées : au plus deux qui la réunissent, une qu'elle
// refuse, une qui la divise. Ni prénom, ni candidat, ni nombre de personnes, ni date de séance : seulement la date
// des textes. « Sans valeur statistique ». Elle ne reçoit que l'élection et le dépouillement, jamais les candidats.

import { APP_URL } from '../../core/app'
import { canvasToJpeg, COLORS, drawHeader, fit, font, IMAGE_W, loadFonts, M, paperCanvas, R } from '../shareImage'
import type { ElectionInfo, Question } from '../types'
import type { IdeaResult, TableSummary } from './count'
import { TABLE_NAME } from './copy'

/** Ce que l'image peut dire d'une idée, sans jamais écrire « toute la table » */
const LEAD: Record<'reunit' | 'refuse' | 'divise', string> = {
  reunit: 'Plus de la moitié de notre table est d’accord',
  refuse: 'La plupart d’entre nous n’en veulent pas',
  divise: 'Une idée nous divise',
}

export interface PictureLine {
  lead: string
  text: string
}

/** Les lignes de l'image : au plus 2 idées qui réunissent, 1 refusée, 1 qui divise, et le compte des autres */
export function pictureLines(summary: TableSummary, questions: readonly Question[]): { lines: PictureLine[]; more: number } {
  const text = (i: IdeaResult) => questions.find(q => q.id === i.questionId)?.approaches.find(a => a.id === i.approachId)?.text ?? ''
  const pick = (v: 'reunit' | 'refuse' | 'divise', n: number) => summary.ideas.filter(i => i.verdict === v).slice(0, n)
  const chosen = [...pick('reunit', 2), ...pick('refuse', 1), ...pick('divise', 1)]
  return {
    lines: chosen.map(i => ({ lead: LEAD[i.verdict as 'reunit' | 'refuse' | 'divise'], text: text(i) })),
    more: summary.ideas.length - chosen.length,
  }
}

export const PICTURE_FOOT = [
  'Résultat d’une table, sans valeur statistique. Compté sur un téléphone : aucun bulletin n’a été transmis.',
  'Idées rédigées par IA, présentées sans nom de candidat.',
]

/** Le texte de remplacement de l'image : les mêmes lignes */
export function pictureAlt(lines: PictureLine[], more: number): string {
  return [
    `Image « ${TABLE_NAME} ».`,
    ...lines.map(l => `${l.lead} : « ${l.text} ».`),
    more > 0 ? `Et ${more} autre${more > 1 ? 's' : ''} idée${more > 1 ? 's' : ''}.` : '',
    ...PICTURE_FOOT,
  ]
    .filter(Boolean)
    .join(' ')
}

export const pictureFileName = (election: Pick<ElectionInfo, 'id'>) => `isoloir-${election.id}-table.jpg`

/** Coupe un texte en lignes qui tiennent dans maxWidth, au corps courant du contexte */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      out.push(line)
      line = word
    } else line = next
  }
  if (line) out.push(line)
  return out
}

/** L'image, en JPG : 1080 de large, la hauteur suit le texte (au moins 1350) */
export async function renderTablePicture(election: Pick<ElectionInfo, 'shortName' | 'dataFrozenAt'>, lines: PictureLine[], more: number): Promise<Blob> {
  await loadFonts()
  // Mesure d'abord, sur une toile de travail, pour connaître la hauteur
  const probe = paperCanvas(10).ctx
  const blocks = lines.map(l => {
    font(probe, 400, 38)
    return { lead: l.lead, body: wrap(probe, `« ${l.text} »`, R - M) }
  })
  const height = Math.max(1350, 330 + blocks.reduce((h, b) => h + 56 + b.body.length * 50 + 40, 0) + (more > 0 ? 60 : 0) + 230)
  const { canvas, ctx } = paperCanvas(height)
  drawHeader(ctx, election.shortName)

  ctx.fillStyle = COLORS.print
  fit(ctx, TABLE_NAME, 850, 112, R - M, true)
  ctx.fillText(TABLE_NAME, M, 284)
  const [yy, mm, dd] = election.dataFrozenAt.split('-')
  ctx.fillStyle = COLORS.printSoft
  fit(ctx, `Une table, un seul téléphone · textes arrêtés au ${dd}.${mm}.${yy}`, 400, 30, R - M)
  ctx.fillText(`Une table, un seul téléphone · textes arrêtés au ${dd}.${mm}.${yy}`, M, 342)
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, 380, R - M, 1.5)

  let y = 450
  for (const b of blocks) {
    ctx.fillStyle = COLORS.print
    fit(ctx, b.lead, 750, 40, R - M)
    ctx.fillText(b.lead, M, y)
    y += 56
    font(ctx, 400, 38)
    for (const l of b.body) {
      ctx.fillText(l, M, y)
      y += 50
    }
    y += 40
  }
  if (more > 0) {
    ctx.fillStyle = COLORS.printSoft
    font(ctx, 400, 32)
    ctx.fillText(`+ ${more} autre${more > 1 ? 's' : ''} idée${more > 1 ? 's' : ''}`, M, y)
  }

  // Pied : l'avertissement, la mention IA et l'adresse du site
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, height - 200, R - M, 1.5)
  font(ctx, 400, 26)
  let fy = height - 160
  for (const t of PICTURE_FOOT)
    for (const l of wrap(ctx, t, R - M)) {
      ctx.fillText(l, M, fy)
      fy += 36
    }
  font(ctx, 750, 28)
  ctx.fillText(APP_URL.replace(/^https?:\/\//, ''), M, height - 48)
  if (canvas.width !== IMAGE_W) throw new Error('Largeur inattendue')
  return canvasToJpeg(canvas)
}
