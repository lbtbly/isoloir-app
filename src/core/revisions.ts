// Révisions des questions. Quand l'énoncé ou les approches d'une question changent sur le fond,
// une réponse donnée sur l'ancienne version ne veut plus forcément dire la même chose : elle est
// mise de côté et proposée à la relecture. Une retouche de forme (coquille, typographie, mot
// remplacé) garde la réponse.
//
// Ce module sert aussi au build (tools/build-pack.mjs, via l'exécution TypeScript de Node) :
// il ne doit importer que des types.

import type { Answer, Answers, ElectionPack, Question } from './types'

/** Au-delà de cette part de caractères modifiés, sur l'énoncé ou sur une approche, le changement est de fond */
export const FORM_THRESHOLD = 0.15

export interface QuestionText {
  prompt: string
  approaches: Record<string, string>
}

export interface RevisionEntry extends QuestionText {
  /** Révision de fond, à partir de 1 */
  rev: number
  /** Retouches de forme depuis la dernière révision de fond */
  minor: number
}

export type Change = 'same' | 'forme' | 'fond'

/** Texte comparé : casse, accents, ponctuation typographique et espaces ne comptent pas */
export function normalizeText(t: string): string {
  return t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[’'`«»"“”]/g, '')
    .replace(/[\s\u00a0\u202f]+/g, ' ')
    .trim()
}

/** Distance d'édition rapportée à la longueur du plus long texte, entre 0 et 1 */
export function editRatio(a: string, b: string): number {
  if (a === b) return 0
  const n = a.length
  const m = b.length
  if (n === 0 || m === 0) return 1
  let prev = Array.from({ length: m + 1 }, (_, j) => j)
  for (let i = 1; i <= n; i++) {
    const cur = [i]
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost)
    }
    prev = cur
  }
  return prev[m]! / Math.max(n, m)
}

/** Compare une question à son texte de référence */
export function classifyChange(ref: QuestionText, cur: QuestionText): Change {
  const refIds = Object.keys(ref.approaches).sort()
  const curIds = Object.keys(cur.approaches).sort()
  // Approche ajoutée ou retirée : le choix proposé n'est plus le même
  if (refIds.join('|') !== curIds.join('|')) return 'fond'
  const pairs: [string, string][] = [
    [ref.prompt, cur.prompt],
    ...refIds.map(id => [ref.approaches[id]!, cur.approaches[id]!] as [string, string]),
  ]
  let same = true
  for (const [a, b] of pairs) {
    const na = normalizeText(a)
    const nb = normalizeText(b)
    if (na === nb) continue
    same = false
    if (editRatio(na, nb) > FORM_THRESHOLD) return 'fond'
  }
  return same ? 'same' : 'forme'
}

export function questionText(q: Pick<Question, 'prompt' | 'approaches'>): QuestionText {
  return { prompt: q.prompt, approaches: Object.fromEntries(q.approaches.map(a => [a.id, a.text])) }
}

/**
 * Révision suivante d'une question. Le texte de référence n'est remplacé qu'à un changement de fond :
 * une suite de petites retouches finit donc par compter comme un changement de fond.
 */
export function nextRevision(entry: RevisionEntry | undefined, cur: QuestionText): { entry: RevisionEntry; change: Change } {
  if (!entry) return { entry: { rev: 1, minor: 0, ...cur }, change: 'fond' }
  const change = classifyChange(entry, cur)
  if (change === 'fond') return { entry: { rev: entry.rev + 1, minor: 0, ...cur }, change }
  if (change === 'forme') return { entry: { ...entry, minor: entry.minor + 1 }, change }
  return { entry, change }
}

// --- Dans l'application ---

/** Une réponse est à revoir si le suivi est actif et qu'elle date d'une autre révision (sans révision : la 1re) */
export function isStale(q: Question, a: Answer | undefined, tracking: boolean): boolean {
  return tracking && !!a && (a.rev ?? 1) !== (q.rev ?? 1)
}

export function staleQuestions(pack: ElectionPack, answers: Answers): Question[] {
  const tracking = !!pack.election.revisionTracking
  if (!tracking) return []
  return pack.bank.questions.filter(q => isStale(q, answers[q.id], tracking))
}

/** Réponses comptées dans le calcul : celles à revoir en sont retirées en attendant */
export function currentAnswers(pack: ElectionPack, answers: Answers): Answers {
  const stale = staleQuestions(pack, answers)
  if (stale.length === 0) return answers
  const out = { ...answers }
  for (const q of stale) delete out[q.id]
  return out
}
