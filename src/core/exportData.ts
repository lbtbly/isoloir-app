// Export et import du « double » : un fichier JSON lisible qui contient les réponses,
// les pondérations, la graine et les scores. Il est produit et lu entièrement sur l'appareil.

import { RATING_LABELS } from './answers'
import { APP_NAME } from './app'
import { staleQuestions } from './revisions'
import { displayScore, METHOD_VERSION, type Results } from './score'
import { sanitizeState, type SessionState } from './storage'
import type { ElectionPack } from './types'

/** Format 3 : avis d'accord / pas d'accord et lignes rouges (les formats 1, à cases, et 2, à cinq crans, restent lisibles à l'import) */
export const EXPORT_FORMAT = 3

export interface ExportFile {
  application: string
  format: number
  electionId: string
  election: string
  dataVersion: string
  methodVersion: string
  exportedAt: string
  note: string
  state: SessionState
  readable: {
    question: string
    theme: string
    avis: { approche: string; avis: string; ligneRouge: boolean }[]
    passee: boolean
  }[]
  results: {
    candidat: string
    affinite: number | null
    rang: number
    exAequo: boolean
    questionsConnues: number
    questionsNotees: number
    lignesRougesFranchies: number
  }[]
}

export function buildExport(pack: ElectionPack, state: SessionState, results: Results, now = new Date()): ExportFile {
  const topicLabel = new Map(pack.bank.topics.map(t => [t.id, t.label]))
  const readable = pack.bank.questions
    .filter(q => state.answers[q.id])
    .map(q => {
      const a = state.answers[q.id]!
      return {
        question: q.prompt,
        theme: topicLabel.get(q.topicId) ?? q.topicId,
        avis: q.approaches
          .filter(x => a.ratings[x.id])
          .map(x => ({ approche: x.text, avis: RATING_LABELS[a.ratings[x.id]!], ligneRouge: a.redLines.includes(x.id) })),
        passee: !!a.skipped,
      }
    })
  const name = new Map(pack.candidates.map(c => [c.id, c.name]))
  return {
    application: APP_NAME,
    format: EXPORT_FORMAT,
    electionId: pack.election.id,
    election: pack.election.name,
    dataVersion: pack.election.dataVersion,
    methodVersion: METHOD_VERSION,
    exportedAt: now.toISOString(),
    note: `Fichier généré sur votre appareil par ${APP_NAME}. Il contient vos opinions politiques : ne le partagez qu’en connaissance de cause.`,
    state,
    readable,
    results: results.ranking.map(r => ({
      candidat: name.get(r.candidateId) ?? r.candidateId,
      affinite: displayScore(r.score),
      rang: r.rank,
      exAequo: r.tied,
      questionsConnues: r.known,
      questionsNotees: r.answered,
      lignesRougesFranchies: r.dealbreakers.filter(d => d.level === 'touche').length,
    })),
  }
}

export function exportFileName(pack: ElectionPack, now = new Date()): string {
  const day = now.toISOString().slice(0, 10)
  return `${APP_NAME.toLowerCase()}-${pack.election.id}-${day}.json`
}

export type ImportResult =
  | { ok: true; state: SessionState; dropped: number; review: number; fromVersion: string | null }
  | { ok: false; error: string }

/** Taille maximale acceptée pour un fichier importé */
export const MAX_IMPORT_BYTES = 1_000_000

/** Lit un fichier exporté et renvoie un état utilisable, ou une erreur lisible */
export function parseImport(text: string, pack: ElectionPack): ImportResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Ce fichier n’est pas un JSON lisible.' }
  }
  if (typeof raw !== 'object' || raw === null || !('state' in raw)) {
    return { ok: false, error: `Ce fichier ne vient pas d’${APP_NAME}.` }
  }
  const file = raw as Partial<ExportFile>
  if (typeof file.format === 'number' && file.format > EXPORT_FORMAT) {
    return { ok: false, error: `Ce fichier vient d’une version plus récente d’${APP_NAME}. Rechargez la page puis réessayez.` }
  }
  if (file.electionId !== pack.election.id) {
    return { ok: false, error: `Ce fichier concerne une autre élection (${String(file.election ?? file.electionId).slice(0, 80)}).` }
  }
  const state = sanitizeState(file.state, pack)
  if (!state) return { ok: false, error: 'Le contenu du fichier est incomplet ou abîmé.' }
  // Réponses ignorées : celles dont la question n'existe plus (une réponse vide est simplement omise)
  const questionIds = new Set(pack.bank.questions.map(q => q.id))
  const rawAnswers =
    typeof file.state === 'object' && file.state !== null && 'answers' in file.state ? file.state.answers : null
  const dropped =
    typeof rawAnswers === 'object' && rawAnswers !== null && !Array.isArray(rawAnswers)
      ? Object.keys(rawAnswers).filter(id => !questionIds.has(id)).length
      : 0
  const fromVersion = typeof file.dataVersion === 'string' && file.dataVersion !== pack.election.dataVersion ? file.dataVersion.slice(0, 40) : null
  const review = staleQuestions(pack, state.answers).length
  return { ok: true, state, dropped, review, fromVersion }
}

/** Déclenche le téléchargement d'un fichier généré localement */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
