// Types de tools/pdf-text.mjs, pour les tests en TypeScript.

export interface PdfValue {
  dict?: Record<string, PdfValue>
  name?: string
  ref?: number
  bytes?: number[]
  hex?: boolean
  op?: string
}

export interface PdfObject {
  offset: number
  value: unknown
  stream: Uint8Array | null
}

export interface PdfPage {
  /** Texte extrait dans l'ordre du flux, une ligne par ordonnée */
  text: string
  /** Flux de contenu, un caractère par octet */
  content: string
  /** Tous les octets du flux sont de l'ASCII */
  contentAscii: boolean
  /** Adresses des annotations de lien */
  links: string[]
  mediaBox: unknown
}

export interface PdfDocument {
  version: string
  /** /Size : nombre d'entrées de la xref */
  size: number
  xrefOffset: number
  /** Décalage de chaque objet (index = numéro d'objet ; 0 pour l'entrée libre) */
  offsets: number[]
  objects: Map<number, PdfObject>
  trailer: Record<string, PdfValue | number>
  catalog: Record<string, PdfValue>
  pages: PdfPage[]
  info: { title?: string; creator?: string; producer?: string; creationDate?: string; lang?: string }
}

/** Lit un PDF de l'écrivain maison ; lève une erreur si sa structure est fausse */
export function readPdf(bytes: Uint8Array | ArrayBuffer): PdfDocument

/** Octets WinAnsi vers texte Unicode */
export function decodeWinAnsi(bytes: Iterable<number>): string
