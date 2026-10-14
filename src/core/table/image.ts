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

/** La hauteur de l'image : 4:5, le format que les messageries et les réseaux montrent en entier */
const HEIGHT = 1350
/** La zone des idées, entre le filet sous le titre et le pied */
const TOP = 440
const FOOT = 1150

/** L'image, en JPG, 1080 × 1350 : les idées qui ne tiennent pas, même en plus petit, rejoignent « + N autres idées » */
export async function renderTablePicture(
  election: Pick<ElectionInfo, 'shortName' | 'dataFrozenAt'>,
  lines: PictureLine[],
  more: number,
): Promise<{ blob: Blob; height: number }> {
  await loadFonts()
  const { canvas, ctx } = paperCanvas(HEIGHT)
  // Le corps le plus grand où tout tient ; sinon, on retire des idées par la fin
  let kept = lines
  let size = 38
  const layout = (n: number, s: number) => {
    font(ctx, 400, s)
    return kept.slice(0, n).map(l => ({ lead: l.lead, body: wrap(ctx, `« ${l.text} »`, R - M) }))
  }
  const heightOf = (blocks: { body: string[] }[], s: number) => blocks.reduce((h, b) => h + s * 1.45 + b.body.length * s * 1.32 + 34, 0)
  let blocks = layout(kept.length, size)
  while (heightOf(blocks, size) > FOOT - TOP - 60 && size > 28) {
    size -= 2
    blocks = layout(kept.length, size)
  }
  while (blocks.length > 1 && heightOf(blocks, size) > FOOT - TOP - 60) {
    kept = kept.slice(0, -1)
    blocks = layout(kept.length, size)
  }
  const extra = more + (lines.length - kept.length)

  drawHeader(ctx, election.shortName)
  ctx.fillStyle = COLORS.print
  fit(ctx, TABLE_NAME, 850, 112, R - M, true)
  ctx.fillText(TABLE_NAME, M, 284)
  // Sous le titre, là où le partage ne coupe jamais : la mention IA et « sans valeur statistique »
  const [yy, mm, dd] = election.dataFrozenAt.split('-')
  const sub = `Idées rédigées par IA · sans valeur statistique · textes arrêtés au ${dd}.${mm}.${yy}`
  ctx.fillStyle = COLORS.printSoft
  fit(ctx, sub, 400, 28, R - M)
  ctx.fillText(sub, M, 342)
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, 380, R - M, 1.5)

  let y = TOP + size
  for (const b of blocks) {
    ctx.fillStyle = COLORS.print
    fit(ctx, b.lead, 750, size + 2, R - M)
    ctx.fillText(b.lead, M, y)
    y += size * 1.45
    font(ctx, 400, size)
    for (const l of b.body) {
      ctx.fillText(l, M, y)
      y += size * 1.32
    }
    y += 34
  }
  if (extra > 0) {
    ctx.fillStyle = COLORS.printSoft
    font(ctx, 400, 30)
    ctx.fillText(`+ ${extra} autre${extra > 1 ? 's' : ''} idée${extra > 1 ? 's' : ''}`, M, Math.min(y, FOOT - 20))
  }

  // Pied : l'avertissement, la mention IA et l'adresse du site
  ctx.fillStyle = COLORS.print
  ctx.fillRect(M, FOOT, R - M, 1.5)
  font(ctx, 400, 26)
  let fy = FOOT + 46
  for (const t of PICTURE_FOOT)
    for (const l of wrap(ctx, t, R - M)) {
      ctx.fillText(l, M, fy)
      fy += 34
    }
  font(ctx, 750, 28)
  ctx.fillText(APP_URL.replace(/^https?:\/\//, ''), M, HEIGHT - 40)
  if (canvas.width !== IMAGE_W) throw new Error('Largeur inattendue')
  return { blob: await canvasToJpeg(canvas), height: HEIGHT }
}
