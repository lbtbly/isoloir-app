// Mise en page verticale du PDF : des blocs atomiques posés l'un sous l'autre, page après page.
//
// - Un bloc qui ne tient pas entre la position courante et le bas du contenu part en page suivante ; l'espace
//   qui le précède (gap) est annulé en haut de page.
// - Un titre n'est jamais orphelin : un bloc qui demande keepWithNext = n n'est posé que si lui et les n blocs
//   suivants tiennent sur la page (ou tous, s'il en vient moins) ; sinon le groupe part en page suivante.
//   L'intercalaire des lignes rouges demande 1 (solidaire de la ligne qui suit), un titre 2.
// - Pages de suite : un bloc qui porte `continued` (ligne d'une liste, d'un tableau) et qui ouvre une page y fait
//   d'abord poser ses blocs de suite : le sous-titre « … (suite) », puis l'en-tête de colonnes répété.
// - Fin de page dans une liste : le dernier bloc posé sur la page peut la refermer (`closeOnBreak` : le filet fort
//   d'une liste encadrée).
// - Listes : ni ligne seule en bas de page, ni ligne seule en page de suite. C'est au rapport de le demander, par
//   keepWithNext sur la première et l'avant-dernière ligne ; layoutProblems le vérifie.
// - Chaque bloc posé entre au journal (page, y, hauteur, sorte, identifiant), que les tests relisent.

import type { PdfCanvas } from './writer'

export interface Block {
  /** Sorte du bloc, pour le journal (« h2 », « h3 », « row », « grid-head »…) */
  kind: string
  id?: string
  /** Hauteur occupée, sans l'espace qui précède */
  height: number
  /** Espace avant le bloc, annulé en haut de page */
  gap?: number
  /** Nombre de blocs suivants à garder sur la même page que celui-ci */
  keepWithNext?: number
  /** Titre (h2, h3) : ne doit jamais finir une page */
  heading?: boolean
  /** Blocs à poser en haut d'une page que ce bloc ouvrirait : « (suite) », en-tête répété */
  continued?: () => Block[]
  /** Dernier bloc d'une page que la suite quitte : de quoi la refermer (son bas en bottom) */
  closeOnBreak?: (c: PdfCanvas, bottom: number) => void
  /** Dessine le bloc, son haut en y */
  draw(c: PdfCanvas, y: number): void
}

export interface FlowLogEntry {
  /** Page, à partir de 0 */
  page: number
  /** Haut du bloc (après l'espace qui le précède) */
  y: number
  h: number
  kind: string
  id?: string
  heading: boolean
  /** Bloc de suite, posé en haut de page pour continuer une liste */
  suite: boolean
  /** Bloc d'une liste qui peut continuer sur la page suivante */
  inList: boolean
}

export interface FlowOptions {
  /** Ouvre la page `index` (en-tête compris) et donne son canevas et le haut de son contenu */
  newPage(index: number): { canvas: PdfCanvas; top: number }
  /** Bas du contenu */
  bottom: number
}

const EPS = 1e-6

export class Flow {
  readonly log: FlowLogEntry[] = []
  private readonly opts: FlowOptions
  private current!: PdfCanvas
  private pageIndex = -1
  private pageTop = 0
  private cursor = 0
  private pending: { blocks: Block[]; need: number } | null = null
  /** Dernier bloc posé sur la page courante, et son bas */
  private last: { block: Block; bottom: number } | null = null

  constructor(opts: FlowOptions) {
    this.opts = opts
    this.open()
  }

  /** Canevas de la page courante */
  get canvas(): PdfCanvas {
    return this.current
  }

  /** Page courante, à partir de 0 */
  get page(): number {
    return this.pageIndex
  }

  /** Position courante (bas du dernier bloc posé) */
  get y(): number {
    return this.cursor
  }

  /** Rien n'est encore posé sur la page courante */
  get atTop(): boolean {
    return this.cursor <= this.pageTop + EPS
  }

  /** Place restante sur la page courante */
  get remaining(): number {
    return this.opts.bottom - this.cursor
  }

  /** Pose un bloc (ou le met en attente s'il garde les suivants avec lui) */
  place(block: Block): void {
    if (this.pending) {
      this.pending.blocks.push(block)
      this.pending.need = Math.max(this.pending.need - 1, block.keepWithNext ?? 0)
      if (this.pending.need <= 0) this.commit()
      return
    }
    if (block.keepWithNext && block.keepWithNext > 0) {
      this.pending = { blocks: [block], need: block.keepWithNext }
      return
    }
    this.put(block)
  }

  /** Pose les blocs en attente (fin d'une section, fin du document) */
  flush(): void {
    if (this.pending) this.commit()
  }

  /** Espace vertical, annulé en haut de page */
  skip(h: number): void {
    this.flush()
    if (!this.atTop) this.cursor = Math.min(this.opts.bottom, this.cursor + h)
  }

  /** Ouvre une nouvelle page (les blocs en attente sont d'abord posés) */
  newPage(): void {
    this.flush()
    this.open()
  }

  private open(): void {
    // La page qu'on quitte : son dernier bloc la referme s'il le demande
    if (this.last) this.last.block.closeOnBreak?.(this.current, this.last.bottom)
    this.last = null
    this.pageIndex++
    const { canvas, top } = this.opts.newPage(this.pageIndex)
    this.current = canvas
    this.pageTop = top
    this.cursor = top
  }

  private capacity(): number {
    return this.opts.bottom - this.pageTop
  }

  private commit(): void {
    const group = this.pending
    this.pending = null
    if (!group) return
    const [first] = group.blocks
    if (!first) return
    let total = 0
    group.blocks.forEach((b, i) => {
      total += (i === 0 && this.atTop ? 0 : (b.gap ?? 0)) + b.height
    })
    if (!this.atTop && this.cursor + total > this.opts.bottom + EPS) {
      this.open()
      // Un groupe ouvert par un titre commence une section : pas de « (suite) » de la précédente
      if (!first.heading && first.continued) this.putAll(first.continued(), true)
    }
    for (const b of group.blocks) this.put(b)
  }

  private putAll(blocks: Block[], suite: boolean): void {
    for (const b of blocks) this.put(b, suite)
  }

  private put(block: Block, suite = false): void {
    if (block.height > this.capacity() + EPS) {
      throw new Error(`bloc « ${block.kind}${block.id ? ` ${block.id}` : ''} » plus haut qu'une page (${block.height} pt)`)
    }
    let gap = this.atTop ? 0 : (block.gap ?? 0)
    if (!this.atTop && this.cursor + gap + block.height > this.opts.bottom + EPS) {
      this.open()
      if (!suite && !block.heading && block.continued) this.putAll(block.continued(), true)
      gap = this.atTop ? 0 : (block.gap ?? 0)
    }
    const y = this.cursor + gap
    block.draw(this.current, y)
    this.cursor = y + block.height
    this.last = { block, bottom: this.cursor }
    this.log.push({
      page: this.pageIndex,
      y,
      h: block.height,
      kind: block.kind,
      ...(block.id === undefined ? {} : { id: block.id }),
      heading: !!block.heading,
      suite,
      inList: !!block.continued,
    })
  }
}

/**
 * Invariants de mise en page, pour les tests : aucun bloc ne dépasse le bas du contenu ; tout titre a au moins
 * un bloc après lui sur sa page ; toute page (sauf la première) s'ouvre par un titre ou par les blocs de suite
 * d'une liste ; une liste qui passe d'une page à l'autre laisse au moins deux lignes de chaque côté.
 * Renvoie la liste des manquements (vide si tout va bien).
 */
export function layoutProblems(log: readonly FlowLogEntry[], bottom: number): string[] {
  const problems: string[] = []
  const name = (e: FlowLogEntry) => `${e.kind}${e.id ? ` ${e.id}` : ''} (page ${e.page + 1})`
  log.forEach((e, i) => {
    if (e.y + e.h > bottom + EPS) problems.push(`${name(e)} dépasse le bas du contenu`)
    const next = log[i + 1]
    if (e.heading && (!next || next.page !== e.page)) problems.push(`${name(e)} finit sa page`)
    const prev = log[i - 1]
    const opensPage = !prev || prev.page !== e.page
    if (opensPage && e.page > 0 && e.inList && !e.suite && prev?.inList) problems.push(`${name(e)} continue une liste sans « (suite) »`)
    if (opensPage && e.page > 0 && !e.heading && !e.suite) problems.push(`${name(e)} ouvre sa page sans titre ni « (suite) »`)
  })
  // Coupures dans une liste : la sorte de la première ligne après les blocs de suite, comptée en bas de la page
  // quittée (orpheline) et en haut de la page de suite (veuve)
  const pages = Math.max(0, ...log.map(e => e.page + 1))
  for (let p = 1; p < pages; p++) {
    const here = log.filter(e => e.page === p)
    if (!here[0]?.suite) continue
    const items = here.filter(e => !e.suite)
    const kind = items[0]?.kind
    if (!kind) continue
    const before = log.filter(e => e.page === p - 1)
    let tail = 0
    for (let i = before.length - 1; i >= 0 && before[i]?.kind === kind; i--) tail++
    let head = 0
    for (const e of items) {
      if (e.kind !== kind) break
      head++
    }
    if (tail === 1) problems.push(`${kind} seule en bas de la page ${p} avant « (suite) »`)
    if (head === 1 && before.some(e => e.kind === kind)) problems.push(`${kind} seule en haut de la page ${p + 1}, après « (suite) »`)
  }
  return problems
}
