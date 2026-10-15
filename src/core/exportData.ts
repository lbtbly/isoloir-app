// Export et import du « double » : un fichier JSON lisible qui contient les réponses,
// les pondérations, la graine et les scores. Il est produit et lu entièrement sur l'appareil.

import { RATING_LABELS } from './answers'
import { APP_NAME } from './app'
import { staleQuestions } from './revisions'
import { displayScore, knownQuestions, METHOD_VERSION, type Results } from './score'
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
    /** Score affiché ; hors classement, à titre indicatif seulement */
    affinite: number | null
    /** null : hors classement */
    rang: number | null
    exAequo: boolean
    /** Présent (true) seulement pour un candidat hors classement : connu sur trop peu de questions pour être classé */
    horsClassement?: true
    questionsConnues: number
    questionsNotees: number
    lignesRougesFranchies: number
  }[]
  /**
   * Candidats non classés (election.ranking.excluded) : sans rang ; le motif, ce que l'on sait d'eux et leur score
   * indicatif, pour information seulement (décision du propriétaire du 14 octobre 2026). Présent seulement quand
   * l'élection en désigne parmi les candidats du résultat.
   */
  nonClasses?: {
    motif: string
    depuis: string
    candidats: {
      candidat: string
      questionsConnuesDansLaBanque: number
      questionsDeLaBanque: number
      /**
       * Score indicatif, sur ses seules positions connues : ne se compare pas au classement ; null sans position connue
       * sur vos réponses. Toujours la valeur calculée, même connu sur moins de EXCLUDED_MIN_KNOWN de vos réponses, où la
       * page et le PDF ne le montrent pas (décision du propriétaire du 2026-10-15 : « Garder »)
       */
      affiniteIndicative: number | null
      questionsConnues: number
      questionsNotees: number
      lignesRougesFranchies: number
    }[]
  }
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
    results: [
      ...results.ranking.map(r => ({
        candidat: name.get(r.candidateId) ?? r.candidateId,
        affinite: displayScore(r.score),
        rang: r.rank,
        exAequo: r.tied,
        questionsConnues: r.known,
        questionsNotees: r.answered,
        lignesRougesFranchies: r.dealbreakers.filter(d => d.level === 'touche').length,
      })),
      // Hors classement (élections qui l'activent) : à la suite, sans rang
      ...results.unranked.map(r => ({
        candidat: name.get(r.candidateId) ?? r.candidateId,
        affinite: displayScore(r.score),
        rang: null,
        exAequo: false,
        horsClassement: true as const,
        questionsConnues: r.known,
        questionsNotees: r.answered,
        lignesRougesFranchies: r.dealbreakers.filter(d => d.level === 'touche').length,
      })),
    ],
    // Non classés : à part, sans rang, avec leur score indicatif (pour information seulement)
    ...(results.excludedResults.length && pack.election.ranking?.excluded
      ? {
          nonClasses: {
            motif: pack.election.ranking.excluded.reason,
            depuis: pack.election.ranking.excluded.since,
            candidats: results.excludedResults.map(r => {
              const id = r.candidateId
              // Entré dans la liste après la décision, à sa déclaration
              const depuis = pack.election.ranking?.excluded?.joined?.[id]
              return {
                candidat: name.get(id) ?? id,
                ...(depuis ? { depuis } : {}),
                questionsConnuesDansLaBanque: knownQuestions(pack, id),
                questionsDeLaBanque: pack.bank.questions.length,
                affiniteIndicative: displayScore(r.score),
                questionsConnues: r.known,
                questionsNotees: r.answered,
                lignesRougesFranchies: r.dealbreakers.filter(d => d.level === 'touche').length,
              }
            }),
          },
        }
      : {}),
  }
}

export function exportFileName(pack: ElectionPack, now = new Date()): string {
  const day = now.toISOString().slice(0, 10)
  return `${APP_NAME.toLowerCase()}-${pack.election.id}-${day}.json`
}

/** D'où vient une feuille importée : le double (JSON) ou un code de reprise (texte, QR ou image du QR) */
export type ImportSource = 'fichier' | 'code'

export type ImportResult =
  | { ok: true; state: SessionState; dropped: number; review: number; fromVersion: string | null; source: ImportSource }
  | { ok: false; error: string }

/** Taille maximale acceptée pour un fichier importé */
export const MAX_IMPORT_BYTES = 1_000_000

/** Ce qu'un import apporte, une fois lu : le double tel quel, ou ce qu'en reconstruit un code de reprise */
export interface ImportEnvelope {
  format?: unknown
  electionId?: unknown
  election?: unknown
  dataVersion?: unknown
  state?: unknown
  /** Réponses déjà écartées à la lecture (question inconnue de cette version du site) */
  extraDropped?: number
}

const NOUN: Record<ImportSource, string> = { fichier: 'Ce fichier', code: 'Ce code' }

/**
 * Valide une feuille importée, d'où qu'elle vienne : même contrôle (sanitizeState), mêmes refus et même compte des
 * réponses écartées ou à revoir pour le double et pour les codes de reprise.
 */
export function importEnvelope(env: ImportEnvelope, pack: ElectionPack, source: ImportSource): ImportResult {
  const noun = NOUN[source]
  if (typeof env.format === 'number' && env.format > EXPORT_FORMAT) {
    return { ok: false, error: `${noun} vient d’une version plus récente d’${APP_NAME}. Rechargez la page puis réessayez.` }
  }
  if (env.electionId !== pack.election.id) {
    return { ok: false, error: `${noun} concerne une autre élection (${String(env.election ?? env.electionId).slice(0, 80)}).` }
  }
  const state = sanitizeState(env.state, pack)
  if (!state) return { ok: false, error: `Le contenu ${source === 'code' ? 'du code' : 'du fichier'} est incomplet ou abîmé.` }
  // Réponses ignorées : celles dont la question n'existe plus (une réponse vide est simplement omise)
  const questionIds = new Set(pack.bank.questions.map(q => q.id))
  const rawAnswers = typeof env.state === 'object' && env.state !== null && 'answers' in env.state ? env.state.answers : null
  const dropped =
    (typeof rawAnswers === 'object' && rawAnswers !== null && !Array.isArray(rawAnswers)
      ? Object.keys(rawAnswers).filter(id => !questionIds.has(id)).length
      : 0) + (env.extraDropped ?? 0)
  const fromVersion = typeof env.dataVersion === 'string' && env.dataVersion !== pack.election.dataVersion ? env.dataVersion.slice(0, 40) : null
  const review = staleQuestions(pack, state.answers).length
  return { ok: true, state, dropped, review, fromVersion, source }
}

/** Ordre des versions de données « AAAA-MM-JJ.n » ; 0 si l'une ne suit pas ce format */
function compareVersions(a: string, b: string): number {
  const parse = (v: string) => /^(\d{4}-\d{2}-\d{2})\.(\d+)$/.exec(v)
  const x = parse(a)
  const y = parse(b)
  if (!x || !y) return 0
  return x[1]!.localeCompare(y[1]!) || Number(x[2]) - Number(y[2])
}

/** Ce qu'il faut dire avant de remplacer la feuille : version des données, réponses écartées ou à revoir */
export function importNotes(res: Extract<ImportResult, { ok: true }>, pack: ElectionPack): string[] {
  const noun = NOUN[res.source]
  const newer = res.fromVersion !== null && compareVersions(res.fromVersion, pack.election.dataVersion) > 0
  return [
    res.fromVersion
      ? newer
        ? `${noun} vient d’une version plus récente des données : rechargez la page, connecté, pour la retrouver.`
        : `${noun} date d’une version antérieure des données.`
      : '',
    res.dropped ? `${res.dropped} réponse${res.dropped > 1 ? 's' : ''} ne correspond${res.dropped > 1 ? 'ent' : ''} plus à une question et ser${res.dropped > 1 ? 'ont' : 'a'} ignorée${res.dropped > 1 ? 's' : ''}.` : '',
    res.review ? `${res.review} question${res.review > 1 ? 's ont' : ' a'} changé depuis : ${res.review > 1 ? 'elles seront' : 'elle sera'} à revoir.` : '',
  ].filter(Boolean)
}

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
  return importEnvelope(raw as ImportEnvelope, pack, 'fichier')
}

/** Le téléchargement d'un fichier fabriqué sur l'appareil, défini à part (core/download.ts) et repris ici pour ses importeurs */
export { downloadBlob } from './download'
