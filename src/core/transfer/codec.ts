// Codes de reprise : toute la feuille (avis, lignes rouges, priorités, thèmes approfondis, graine) en quelques dizaines
// d'octets, écrits en base 32 (base32.ts) pour être copiés, tapés ou portés par un QR code d'un appareil à l'autre.
// Rien ne passe par un réseau : le code est fabriqué et lu sur l'appareil, et sa lecture aboutit au même contrôle
// que le double (importEnvelope, puis sanitizeState).
//
// Format 1, bits de poids fort d'abord :
//   version (4) · élection (6) · largeur des numéros de thème − 1 (3) · drapeaux : version des données, date du
//   questionnaire rapide (2)
//   [version des données : jours depuis le 1er janvier 2026 (15) + n (5)] · graine (64)
//   [questionnaire rapide complété : secondes depuis le 1er janvier 2026 (31)]
//   priorités : nombre + 1 (gamma), puis numéro de thème + poids (2 : 2, 0,5 ou 1)
//   thèmes approfondis : nombre + 1 (gamma), puis numéros de thème, dans l'ordre
//   réponses : longueur de la carte + 1 (gamma), carte des questions répondues (1 bit par numéro), puis pour chacune :
//     révision (1 bit « notée », puis gamma) · nombre de lettres − 1 (4) · 2 bits par lettre (a, b, c…) :
//     00 sans avis, 01 d'accord, 10 pas d'accord, 11 ligne rouge ; tout à 00 : question passée
//   remplissage à l'octet, puis CRC-32 (4 octets)
// Les approches sont repérées par leur lettre, pas par leur rang : une approche retirée laisse un trou (00) au lieu
// de décaler les suivantes, et une approche inconnue de cette version du site est ignorée.

import { EXPORT_FORMAT, importEnvelope, type ImportResult } from '../exportData'
import type { SessionState } from '../storage'
import type { ElectionPack, Question, Rating, TopicWeights, TransferSlots } from '../types'
import { crc32, fromBase32, normalizeCode, toBase32 } from './base32'
import { BitReader, BitWriter, widthFor } from './bits'

export const CODEC_VERSION = 1
const EPOCH = Date.UTC(2026, 0, 1)
const DAY = 86_400_000
const LETTERS = 'abcdefghijklmnop'
const WEIGHTS: TopicWeights[string][] = [2, 0.5, 1]
const STATE = { none: 0, agree: 1, disagree: 2, redLine: 3 } as const

/** Un code ne peut pas être fabriqué (question sans numéro, approche hors règle) : le double reste possible */
export class TransferError extends Error {}

/** Rang de la lettre d'une approche dans sa question (« retraites-1-c » → 2) ; -1 si l'identifiant ne suit pas la règle */
export function letterIndex(questionId: string, approachId: string): number {
  if (!approachId.startsWith(questionId)) return -1
  const m = /^-?([a-p])$/.exec(approachId.slice(questionId.length))
  return m ? LETTERS.indexOf(m[1]!) : -1
}

function slotsOf(pack: ElectionPack): TransferSlots {
  if (!pack.transfer) throw new TransferError('Cette élection n’a pas de code de reprise.')
  return pack.transfer
}

const maxOf = (rec: Record<string, number>) => Math.max(0, ...Object.values(rec))

function parseDataVersion(v: string): { days: number; n: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})\.(\d+)$/.exec(v)
  if (!m) return null
  const days = (Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) - EPOCH) / DAY
  const n = Number(m[4])
  return Number.isInteger(days) && days >= 0 && days < 2 ** 15 && n < 32 ? { days, n } : null
}

function formatDataVersion(days: number, n: number): string {
  return `${new Date(EPOCH + days * DAY).toISOString().slice(0, 10)}.${n}`
}

/** Le code de reprise d'une feuille, sans espaces (groupCode pour l'afficher) */
export function encodeTransfer(state: SessionState, pack: ElectionPack): string {
  const slots = slotsOf(pack)
  const tWidth = widthFor(maxOf(slots.topics))
  if (tWidth > 8) throw new TransferError('Trop de thèmes pour un code.')
  const w = new BitWriter()
  const dv = parseDataVersion(state.dataVersion)
  const doneSec = state.essentialDoneAt ? Math.floor((Date.parse(state.essentialDoneAt) - EPOCH) / 1000) : -1
  const hasDone = doneSec >= 0 && doneSec < 2 ** 31

  w.write(CODEC_VERSION, 4)
  w.write(slots.tag, 6)
  w.write(tWidth - 1, 3)
  w.bit(!!dv)
  w.bit(hasDone)
  if (dv) {
    w.write(dv.days, 15)
    w.write(dv.n, 5)
  }
  if (!/^[0-9a-f]{16}$/.test(state.seed)) throw new TransferError('Graine illisible.')
  w.write(parseInt(state.seed.slice(0, 8), 16), 32)
  w.write(parseInt(state.seed.slice(8), 16), 32)
  if (hasDone) w.write(doneSec, 31)

  const topicSlot = (id: string) => {
    const s = slots.topics[id]
    if (s === undefined) throw new TransferError(`Thème sans numéro : ${id}`)
    return s
  }
  const weights = Object.entries(state.weights)
  w.gamma(weights.length + 1)
  for (const [id, value] of weights) {
    w.write(topicSlot(id), tWidth)
    w.write(WEIGHTS.indexOf(value), 2)
  }
  w.gamma(state.deepTopics.length + 1)
  for (const id of state.deepTopics) w.write(topicSlot(id), tWidth)

  const byQuestion = new Map(pack.bank.questions.map(q => [q.id, q]))
  const answered: { slot: number; q: Question }[] = []
  for (const qid of Object.keys(state.answers)) {
    const q = byQuestion.get(qid)
    const slot = slots.questions[qid]
    if (!q) continue
    if (slot === undefined) throw new TransferError(`Question sans numéro : ${qid}`)
    answered.push({ slot, q })
  }
  answered.sort((a, b) => a.slot - b.slot)
  const len = answered.length ? answered[answered.length - 1]!.slot + 1 : 0
  w.gamma(len + 1)
  const set = new Set(answered.map(a => a.slot))
  for (let s = 0; s < len; s++) w.bit(set.has(s))
  for (const { q } of answered) {
    const a = state.answers[q.id]!
    w.bit(a.rev !== undefined)
    if (a.rev !== undefined) w.gamma(a.rev)
    const states: number[] = []
    for (const [id, r] of Object.entries(a.ratings)) {
      const k = letterIndex(q.id, id)
      if (k < 0) throw new TransferError(`Approche hors règle : ${id}`)
      states[k] = a.redLines.includes(id) ? STATE.redLine : r === 1 ? STATE.agree : STATE.disagree
    }
    const letters = Math.max(1, states.length)
    w.write(letters - 1, 4)
    for (let k = 0; k < letters; k++) w.write(states[k] ?? STATE.none, 2)
  }

  const payload = w.bytes()
  const crc = crc32(payload)
  const out = new Uint8Array(payload.length + 4)
  out.set(payload)
  new DataView(out.buffer).setUint32(payload.length, crc)
  return toBase32(out)
}

export type RawDecode =
  | { ok: true; dataVersion: string | null; state: Record<string, unknown>; unknownSlots: number }
  | { ok: false; error: string }

const DAMAGED = 'Ce code ne se lit pas : vérifiez chaque groupe de caractères, ou reprenez-le depuis l’autre appareil.'

/**
 * Lit un code (normalisé ou non) et rebâtit une feuille brute, à valider ensuite (parseCode) : identifiants de cette
 * version du site, réponses à des questions inconnues comptées à part.
 */
export function decodeTransferRaw(text: string, pack: ElectionPack, now = new Date()): RawDecode {
  const slots = slotsOf(pack)
  const code = normalizeCode(text)
  if (!code) return { ok: false, error: 'Le code est vide.' }
  const bytes = fromBase32(code)
  if (!bytes) {
    return /[^0-9A-Z]/.test(code) || /U/.test(code)
      ? { ok: false, error: 'Ce code contient un caractère qui n’en fait pas partie : seuls les chiffres et les lettres sont utilisés.' }
      : { ok: false, error: DAMAGED }
  }
  if (bytes.length < 15) return { ok: false, error: 'Ce code est incomplet.' }
  const payload = bytes.subarray(0, bytes.length - 4)
  if (new DataView(bytes.buffer, bytes.byteOffset).getUint32(bytes.length - 4) !== crc32(payload)) return { ok: false, error: DAMAGED }

  const r = new BitReader(payload)
  try {
    const version = r.read(4)
    if (version > CODEC_VERSION) return { ok: false, error: 'Ce code vient d’une version plus récente d’Isoloir. Rechargez la page, connecté, puis réessayez.' }
    if (version < 1) return { ok: false, error: DAMAGED }
    if (r.read(6) !== slots.tag) return { ok: false, error: 'Ce code concerne une autre élection.' }
    const tWidth = r.read(3) + 1
    const hasDv = r.bit()
    const hasDone = r.bit()
    const dataVersion = hasDv ? formatDataVersion(r.read(15), r.read(5)) : null
    const seed = r.read(32).toString(16).padStart(8, '0') + r.read(32).toString(16).padStart(8, '0')
    const essentialDoneAt = hasDone ? new Date(EPOCH + r.read(31) * 1000).toISOString() : null

    const topicById = new Map(Object.entries(slots.topics).map(([id, s]) => [s, id]))
    const weights: Record<string, number> = {}
    for (let i = r.gamma() - 1; i > 0; i--) {
      const id = topicById.get(r.read(tWidth))
      const value = WEIGHTS[r.read(2)]
      if (id && value !== undefined) weights[id] = value
    }
    const deepTopics: string[] = []
    for (let i = r.gamma() - 1; i > 0; i--) {
      const id = topicById.get(r.read(tWidth))
      if (id) deepTopics.push(id)
    }

    const questionById = new Map(Object.entries(slots.questions).map(([id, s]) => [s, id]))
    const byQuestion = new Map(pack.bank.questions.map(q => [q.id, q]))
    const len = r.gamma() - 1
    const present: number[] = []
    for (let s = 0; s < len; s++) if (r.bit()) present.push(s)
    const answers: Record<string, unknown> = {}
    let unknownSlots = 0
    for (const slot of present) {
      const rev = r.bit() ? r.gamma() : undefined
      const letters = r.read(4) + 1
      const states = Array.from({ length: letters }, () => r.read(2))
      const qid = questionById.get(slot)
      if (!qid) {
        // Question ajoutée après cette version du site
        unknownSlots++
        continue
      }
      const q = byQuestion.get(qid)
      const ratings: Record<string, Rating> = {}
      const redLines: string[] = []
      states.forEach((st, k) => {
        if (st === STATE.none) return
        // Approche reconnue à sa lettre ; une question retirée de la banque garde son identifiant (compté comme ignoré)
        const id = q ? q.approaches.find(x => letterIndex(q.id, x.id) === k)?.id : `${qid}-${LETTERS[k]}`
        if (!id) return
        ratings[id] = st === STATE.agree ? 1 : -1
        if (st === STATE.redLine) redLines.push(id)
      })
      const skipped = states.every(st => st === STATE.none)
      answers[qid] = { ratings, redLines, ...(skipped ? { skipped: true } : {}), ...(rev !== undefined ? { rev } : {}) }
    }
    // Après le dernier champ, seul le remplissage à l'octet, nul
    if (r.remaining >= 8 || (r.remaining > 0 && r.read(r.remaining) !== 0)) return { ok: false, error: DAMAGED }

    return {
      ok: true,
      dataVersion,
      unknownSlots,
      state: {
        electionId: pack.election.id,
        dataVersion: dataVersion ?? pack.election.dataVersion,
        seed,
        answers,
        weights,
        deepTopics,
        lastSeenRanking: null,
        essentialDoneAt,
        updatedAt: now.toISOString(),
      },
    }
  } catch {
    return { ok: false, error: DAMAGED }
  }
}

/** Lit un code de reprise et renvoie une feuille validée comme un double, ou une erreur lisible */
export function parseCode(text: string, pack: ElectionPack, now = new Date()): ImportResult {
  if (!pack.transfer) return { ok: false, error: 'Cette élection n’a pas de code de reprise.' }
  const raw = decodeTransferRaw(text, pack, now)
  if (!raw.ok) return raw
  return importEnvelope(
    { format: EXPORT_FORMAT, electionId: pack.election.id, dataVersion: raw.dataVersion ?? undefined, state: raw.state, extraDropped: raw.unknownSlots },
    pack,
    'code',
  )
}

/** Un texte qui a l'allure d'un code de reprise (à essayer avant de le dire illisible) */
export function looksLikeCode(text: string): boolean {
  const code = normalizeCode(text)
  return code.length >= 24 && code.length <= 2000 && /^[0-9A-HJKMNP-TV-Z]+$/.test(code)
}
