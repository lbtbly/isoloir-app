// Sauvegarde locale de la progression. Rien n'est jamais transmis : localStorage seulement,
// avec effacement complet à la demande. Chaque accès est protégé (navigation privée,
// stockage bloqué) : l'application fonctionne aussi sans stockage.

import { newSeed } from './rng'
import { type Answer, type Answers, type CandidateId, type ElectionPack, type Question, type QuestionBank, type Rating, type TopicId, type TopicWeights } from './types'

export const STORAGE_PREFIX = 'isoloir:'
const FORMAT = 3

export interface SessionState {
  format: number
  electionId: string
  dataVersion: string
  /** Graine des ordres aléatoires (approches, thèmes, ex aequo) */
  seed: string
  answers: Answers
  weights: TopicWeights
  /** Thèmes choisis pour l'approfondissement */
  deepTopics: TopicId[]
  /** Classement vu lors de la dernière visite des résultats, pour signaler les changements */
  lastSeenRanking: { candidateId: CandidateId; score: number | null }[] | null
  /** Version des données lors de la dernière visite, si elles ont changé depuis */
  dataUpdatedFrom: string | null
  /**
   * Date où le questionnaire rapide a été complété pour la dernière fois. Elle est gardée si une question
   * y est ajoutée ensuite : c'est ce qui permet de signaler « nouvelle question depuis le … ».
   */
  essentialDoneAt: string | null
  updatedAt: string
}

export function storageKey(electionId: string): string {
  return `${STORAGE_PREFIX}${electionId}`
}

/**
 * Cet appareil garde-t-il une feuille pour cette élection ? Une feuille vierge n'est jamais enregistrée
 * (saveState) : une sauvegarde présente veut dire qu'on y a répondu. Rien n'est lu ni validé ici.
 */
export function hasSaved(electionId: string): boolean {
  try {
    return globalThis.localStorage?.getItem(storageKey(electionId)) != null
  } catch {
    return false
  }
}

export function freshState(electionId: string, dataVersion: string): SessionState {
  return {
    format: FORMAT,
    electionId,
    dataVersion,
    seed: newSeed(),
    answers: {},
    weights: {},
    deepTopics: [],
    lastSeenRanking: null,
    dataUpdatedFrom: null,
    essentialDoneAt: null,
    updatedAt: new Date().toISOString(),
  }
}

const ISO = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/
const isoOrNull = (v: unknown) => (typeof v === 'string' && ISO.test(v) && !Number.isNaN(Date.parse(v)) ? v : null)

/** Toutes les questions du questionnaire rapide ont-elles été vues (répondues ou passées) ? */
export function essentialComplete(bank: QuestionBank, answers: Answers): boolean {
  const essential = bank.questions.filter(q => q.tier === 'essentiel')
  return essential.length > 0 && essential.every(q => answers[q.id])
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const SEED = /^[0-9a-f]{16}$/
const MAX_IDS = 12
const strings = (v: unknown) =>
  Array.isArray(v) ? v.slice(0, MAX_IDS).filter((x): x is string => typeof x === 'string') : []

/**
 * Lit une réponse enregistrée, quel que soit son format, en ne gardant que les approches de la question.
 * - Réglette à cinq crans (version de test) : seul le sens de l'avis est gardé, d'accord ou pas d'accord.
 * - Ancien format à cases : cochée → « d'accord », rayée → ligne rouge, « aucune ne me convient » →
 *   « pas d'accord » sur toutes les approches.
 */
function readAnswer(raw: Record<string, unknown>, q: Question): Answer | null {
  const ids = new Set(q.approaches.map(x => x.id))
  const ratings: Record<string, Rating> = {}
  let redLines: string[]
  if (isRecord(raw.ratings)) {
    for (const [id, r] of Object.entries(raw.ratings)) {
      if (ids.has(id) && (r === -2 || r === -1 || r === 1 || r === 2)) ratings[id] = Math.sign(r) as Rating
    }
    redLines = strings(raw.redLines)
  } else {
    const liked = strings(raw.liked).filter(id => ids.has(id))
    for (const id of liked) ratings[id] = 1
    redLines = strings(raw.rejected).filter(id => !liked.includes(id))
    if (raw.none === true && liked.length === 0) for (const id of ids) ratings[id] = -1
  }
  redLines = [...new Set(redLines)].filter(id => ids.has(id))
  // Une ligne rouge est toujours notée « pas d'accord »
  for (const id of redLines) ratings[id] = -1
  const rated = Object.keys(ratings).length > 0
  if (!rated && raw.skipped !== true) return null
  const rev = typeof raw.rev === 'number' && Number.isInteger(raw.rev) && raw.rev > 0 && raw.rev < 1e6 ? raw.rev : null
  return { ratings, redLines, ...(rated ? {} : { skipped: true }), ...(rev ? { rev } : {}) }
}

/** Lit les réponses enregistrées et retire celles qui ne correspondent plus à la banque de questions */
export function migrateAnswers(raw: unknown, bank: QuestionBank): Answers {
  const out: Answers = {}
  if (!isRecord(raw)) return out
  for (const q of bank.questions) {
    const a = raw[q.id]
    if (!isRecord(a)) continue
    const answer = readAnswer(a, q)
    if (answer) out[q.id] = answer
  }
  return out
}

/** Valide un état venu du stockage ou d'un fichier importé ; tout champ douteux est ignoré */
export function sanitizeState(raw: unknown, pack: ElectionPack): SessionState | null {
  const { bank } = pack
  const { id: electionId, dataVersion } = pack.election
  if (!isRecord(raw) || raw.electionId !== electionId) return null
  const topicIds = new Set(bank.topics.map(t => t.id))
  const weights: TopicWeights = {}
  if (isRecord(raw.weights)) {
    for (const [tid, w] of Object.entries(raw.weights)) {
      if (topicIds.has(tid) && (w === 0.5 || w === 1 || w === 2)) weights[tid] = w
    }
  }
  // Tous les thèmes peuvent être approfondis (« Tout cocher ») : la liste est bornée par la banque, pas par MAX_IDS
  const deepTopics = Array.isArray(raw.deepTopics)
    ? [...new Set(raw.deepTopics.filter((t): t is string => typeof t === 'string' && topicIds.has(t)))]
    : []
  const versionChanged = typeof raw.dataVersion === 'string' && raw.dataVersion !== dataVersion
  // Un candidat non classé (election.ranking.excluded) n'a pas de score : un classement mémorisé avant la décision
  // (ou venu d'un double importé) ne doit pas en garder, ni le recopier dans le prochain double
  const off = new Set(pack.election.ranking?.excluded?.ids ?? [])
  const known = new Set(pack.candidates.map(c => c.id).filter(id => !off.has(id)))
  const seen = new Set<string>()
  const lastSeenRanking =
    !versionChanged && Array.isArray(raw.lastSeenRanking)
      ? raw.lastSeenRanking.filter((r): r is { candidateId: string; score: number | null } => {
          if (!isRecord(r) || typeof r.candidateId !== 'string' || seen.has(r.candidateId)) return false
          if (!known.has(r.candidateId)) return false
          const ok = r.score === null || (typeof r.score === 'number' && Number.isFinite(r.score) && r.score >= 0 && r.score <= 100)
          if (ok) seen.add(r.candidateId)
          return ok
        })
      : null
  const answers = migrateAnswers(raw.answers, bank)
  const updatedAt = isoOrNull(raw.updatedAt)
  return {
    format: FORMAT,
    electionId,
    dataVersion,
    seed: typeof raw.seed === 'string' && SEED.test(raw.seed) ? raw.seed : newSeed(),
    answers,
    weights,
    deepTopics,
    lastSeenRanking,
    dataUpdatedFrom: versionChanged
      ? String(raw.dataVersion).slice(0, 40)
      : typeof raw.dataUpdatedFrom === 'string'
        ? raw.dataUpdatedFrom.slice(0, 40)
        : null,
    // Sauvegarde antérieure à ce champ : la dernière modification en tient lieu, si la feuille est complète
    essentialDoneAt: isoOrNull(raw.essentialDoneAt) ?? (essentialComplete(bank, answers) ? updatedAt : null),
    updatedAt: updatedAt ?? new Date().toISOString(),
  }
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function loadState(pack: ElectionPack): SessionState {
  const { id: electionId, dataVersion } = pack.election
  const s = storage()
  let raw: string | null = null
  try {
    raw = s?.getItem(storageKey(electionId)) ?? null
    if (raw) {
      const parsed = sanitizeState(JSON.parse(raw), pack)
      if (parsed) return parsed
    }
  } catch {
    // Stockage illisible : on le met de côté plutôt que de l'écraser, puis on repart d'une feuille vierge
    try {
      if (raw) s?.setItem(`${storageKey(electionId)}:illisible`, raw)
    } catch {
      // rien à sauver
    }
  }
  return freshState(electionId, dataVersion)
}

/** Une feuille vierge n'est pas enregistrée : rien n'est écrit tant que l'utilisateur n'a rien fait */
export function isBlank(state: SessionState): boolean {
  return (
    Object.keys(state.answers).length === 0 &&
    Object.keys(state.weights).length === 0 &&
    state.deepTopics.length === 0
  )
}

export function saveState(state: SessionState): boolean {
  const s = storage()
  if (!s) return false
  try {
    if (isBlank(state)) s.removeItem(storageKey(state.electionId))
    else s.setItem(storageKey(state.electionId), JSON.stringify({ ...state, updatedAt: new Date().toISOString() }))
    return true
  } catch {
    return false
  }
}

/** Efface toutes les données Isoloir de cet appareil, toutes élections confondues */
export function clearAll(): void {
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i)
      if (k?.startsWith(STORAGE_PREFIX) || k?.startsWith('isoloir-')) sessionStorage.removeItem(k)
    }
  } catch {
    // pas de stockage de session
  }
  const s = storage()
  if (!s) return
  try {
    const keys: string[] = []
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i)
      if (k?.startsWith(STORAGE_PREFIX)) keys.push(k)
    }
    keys.forEach(k => s.removeItem(k))
  } catch {
    // rien à effacer
  }
}
