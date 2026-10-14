// La lecture des réponses sur l'échiquier, pour la page « Mon profil politique » (ui/screens/Profile.tsx). Thème par
// thème, puis par famille de thèmes, et pour chaque bloc de l'axe de la grille des nuances (election.spectrum.axis) :
// les réponses se rapprochent-elles nettement des candidats de ce bloc, s'en écartent-elles nettement, ou rien de net ?
// « Nettement » : bien plus que les mêmes avis placés au hasard entre les approches de chaque question. C'est un test
// de permutation commun aux blocs (max-T de Westfall-Young) : pour des réponses données au hasard, la probabilité
// qu'au moins un bloc soit marqué sur un thème reste sous ALPHA, quels que soient le nombre de blocs et leur taille.
// Méthode « chaque bloc face au hasard », retenue par le propriétaire le 12 octobre 2026 ; ses garanties sont
// mesurées par tests/echiquier-calibration.test.ts et tools/audit-echiquier.mjs, publiées dans la Méthode.
//
// Ni point sur un axe, ni moyenne entre thèmes, ni étiquette : seulement, par unité de lecture, des marques par bloc.
// Aucun effet sur le score, le classement ni les priorités. Calcul sans IA, sur l'appareil, à l'affichage ; rien n'est
// enregistré (un cache en mémoire, par empreinte des réponses, évite de recalculer au retour sur la page).
// L'affinité d'un thème avec un candidat est exactement topicScores de core/score.ts : mêmes stance et
// effectiveWeight, approches non notées au dénominateur, et une note posée sur une approche où le candidat a une
// position de confiance basse rend la question inconnue pour lui.
// Fichier à part du build, chargé à la demande avec la page (ui/profile/load.ts).

import { hasOpinion } from './answers'
import { hashString, mulberry32 } from './rng'
import { CLOSE_GAP, effectiveWeight, excludedIds, stance } from './score'
import { axisOf } from './spectrum'
import type { Answer, Answers, ApproachId, Candidate, CandidateId, ElectionInfo, ElectionPack, Question, QuestionId, SpectrumAxisBloc, TopicGroup, TopicId } from './types'

/** Les réglages de la méthode (cahier des charges, § 3.13) */
export const ECHIQUIER = {
  /** Seuil du test commun aux blocs, par unité de lecture (décision du propriétaire : 0,10) */
  ALPHA: 0.1,
  /** Écart minimal, en points, au hasard et au neutre (50 %) : un bâton du site */
  GAP: CLOSE_GAP,
  /** Questions répondues qu'il faut pour lire une unité */
  MIN_QUESTIONS: 2,
  /** Au-delà d'un bloc sans candidat connu, pas de lecture */
  MAX_UNKNOWN_BLOCS: 1,
  /** Jusqu'à ce nombre de placements possibles, on les compte tous ; au-delà, des tirages */
  EXACT_MAX: 1000,
  /** Tirages au hasard quand les placements possibles sont trop nombreux */
  DRAWS: 999,
} as const

/** La marque d'un bloc : ▲ plus près, ▽ plus loin, · rien de net, ? aucun candidat du bloc connu */
export type Mark = 'pres' | 'loin' | 'rien' | 'inconnu'
/** Statut d'une unité, testé dans cet ordre : blocs-inconnus, une-question, puis lecture, ecarts ou aucun */
export type UnitStatus = 'une-question' | 'blocs-inconnus' | 'aucun' | 'ecarts' | 'lecture'
export type UnitKind = 'theme' | 'famille'

/** Un bloc de l'axe, pour une unité de lecture */
export interface BlocCell {
  /** Identifiant du bloc dans la grille */
  bloc: string
  /** Ses candidats connus sur les questions de l'unité (ordre de l'axe : alphabétique) */
  known: CandidateId[]
  /** Moyenne de l'affinité avec ses candidats connus, entre 0 et 100 ; null : aucun connu */
  affinity: number | null
  /** La même moyenne, pour les avis placés au hasard (moyenne des placements) ; null sans test */
  chance: number | null
  /** Probabilité, commune aux blocs, qu'un placement au hasard fasse un tel écart ; null sans test */
  p: number | null
  mark: Mark
}

/** La lecture d'un thème ou d'une famille de thèmes */
export interface UnitReading {
  kind: UnitKind
  /** Identifiant du thème, ou de la famille (pack.topicGroups) */
  id: string
  /** Les thèmes répondus de l'unité, dans l'ordre de la banque */
  topicIds: TopicId[]
  /** Les questions répondues de l'unité, dans l'ordre de la banque */
  questions: QuestionId[]
  status: UnitStatus
  /** Un par bloc de l'axe, dans son ordre */
  cells: BlocCell[]
  /** Indices de l'axe des blocs ▲, croissants */
  near: number[]
  /** Indices de l'axe des blocs ▽, croissants */
  far: number[]
  /** Les blocs ▲ ne forment pas une suite contiguë de l'axe */
  twoSided: boolean
  /** Tous les placements possibles ont été comptés (sinon : des tirages) */
  exact: boolean
  /** Placements comptés ou tirés ; 0 sans test */
  arrangements: number
  /** Affinité avec chaque candidat de l'axe, entre 0 et 100 ; null : inconnu sur ces questions */
  perCandidate: Record<CandidateId, number | null>
}

/** Un groupe de la synthèse : les unités lues dont les blocs ▲ sont les mêmes */
export interface SummaryGroup {
  near: number[]
  twoSided: boolean
  items: { kind: UnitKind; id: string }[]
}

export interface Echiquier {
  /** Les thèmes répondus, dans l'ordre de la banque */
  themes: UnitReading[]
  /** Les familles d'au moins deux thèmes dont au moins deux ont une réponse, dans l'ordre des familles */
  families: UnitReading[]
  /** Par famille, les thèmes lus ; à défaut, la famille si elle est lue ; groupés par blocs ▲, rangés selon l'axe */
  summary: SummaryGroup[]
  /** Thèmes sans rien de net */
  nothing: TopicId[]
  /** Thèmes qui ne se rapprochent d'aucun bloc mais s'écartent nettement d'au moins un */
  apart: TopicId[]
  /** Thèmes sans lecture : une seule question, ou trop de blocs sans candidat connu */
  noReading: TopicId[]
  /** Thèmes sans réponse */
  unanswered: TopicId[]
  /** Aucune question approfondie répondue : la lecture se fait surtout par famille */
  quickOnly: boolean
}

/** Réglages réservés aux tests et à l'outil d'audit ; la page n'en passe aucun */
export interface ReadOptions {
  /** Tirages au hasard au-delà de EXACT_MAX placements (199 pour les profils aléatoires de la calibration) */
  draws?: number
  /** Seuil du test (calibration à 0,20) */
  alpha?: number
  /** Candidats retirés de l'axe (calibration « sans lui ») */
  without?: readonly CandidateId[]
}

// ——— Les candidats de l'axe ———

/** Le bloc de la grille d'un candidat (celui de sa nuance) ; null s'il n'a pas de nuance de la grille */
export const blocOf = (election: Pick<ElectionInfo, 'spectrum'>, candidate: Pick<Candidate, 'nuance'>): string | null =>
  election.spectrum?.nuances.find(n => n.code === candidate.nuance)?.bloc ?? null

/**
 * Les candidats qui comptent sur l'axe, bloc par bloc dans l'ordre de l'axe : ceux que le score calcule (ni masqués,
 * déjà retirés du pack, ni non classés), dont le bloc est sur l'axe ; dans l'ordre alphabétique de leur identifiant au
 * sein d'un bloc, comme sur la page des candidats. Le même pour tout le monde : les candidats hors classement d'une
 * personne y restent. Sans axe : vide.
 */
export function panelOf(pack: Pick<ElectionPack, 'election' | 'candidates'>): CandidateId[][] {
  const axis = axisOf(pack.election)
  if (!axis) return []
  const out = new Set(excludedIds(pack))
  const scored = pack.candidates.filter(c => !out.has(c.id))
  return axis.map(a =>
    scored
      .filter(c => blocOf(pack.election, c) === a.bloc)
      .map(c => c.id)
      .sort((x, y) => x.localeCompare(y)),
  )
}

// ——— Précalcul par pack ———

interface Prep {
  electionId: string
  axis: readonly SpectrumAxisBloc[]
  /** Les candidats de l'axe, à plat, bloc après bloc */
  ids: CandidateId[]
  /** Indice de l'axe de chacun */
  blocIndex: number[]
  questions: readonly Question[]
  qIndex: Map<QuestionId, number>
  /** Par question, par candidat : son profil sur chaque approche (stance), dans l'ordre des approches */
  V: Int8Array[][]
  /** Par question, par candidat : Σ |stance| */
  DEN: Int32Array[]
  /** Par question, par candidat : les approches où sa position est de confiance basse (portée ou rejetée), ou null */
  LOW: (Uint8Array | null)[][]
  /** Par question, par approche : les candidats de l'axe dont c'est l'approche principale (poids effectif 2) */
  MAIN: number[][][]
  /** Les familles de thèmes (pack.topicGroups, à défaut un thème par famille) */
  groups: readonly TopicGroup[]
}

const PREPS = new WeakMap<ElectionPack, Prep>()

function prepare(pack: ElectionPack): Prep {
  const done = PREPS.get(pack)
  if (done) return done
  const axis = axisOf(pack.election) ?? []
  const panel = panelOf(pack)
  const ids = panel.flat()
  const blocIndex = panel.flatMap((list, b) => list.map(() => b))
  const questions = pack.bank.questions
  const V: Int8Array[][] = []
  const DEN: Int32Array[] = []
  const LOW: (Uint8Array | null)[][] = []
  const MAIN: number[][][] = []
  for (const q of questions) {
    const v: Int8Array[] = []
    const den = new Int32Array(ids.length)
    const low: (Uint8Array | null)[] = []
    ids.forEach((id, c) => {
      const table = pack.positions[id]
      const row = Int8Array.from(q.approaches, a => stance(table?.[a.id]))
      v.push(row)
      den[c] = row.reduce((n, x) => n + Math.abs(x), 0)
      const mask = Uint8Array.from(q.approaches, a => {
        const p = table?.[a.id]
        return p && p.confidence === 'low' && (p.weight || p.rejects) ? 1 : 0
      })
      low.push(mask.some(Boolean) ? mask : null)
    })
    V.push(v)
    DEN.push(den)
    LOW.push(low)
    MAIN.push(q.approaches.map(a => ids.flatMap((id, c) => (effectiveWeight(pack.positions[id]?.[a.id]) === 2 ? [c] : []))))
  }
  const groups = pack.topicGroups?.length ? pack.topicGroups : pack.bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))
  const prep: Prep = {
    electionId: pack.election.id,
    axis,
    ids,
    blocIndex,
    questions,
    qIndex: new Map(questions.map((q, i) => [q.id, i])),
    V,
    DEN,
    LOW,
    MAIN,
    groups,
  }
  PREPS.set(pack, prep)
  return prep
}

/** Les avis d'une réponse, dans l'ordre des approches de la question : −1, 0 ou +1 (une ligne rouge est déjà à −1) */
const vectorOf = (q: Question, answer: Answer): Int8Array => Int8Array.from(q.approaches, a => answer.ratings[a.id] ?? 0)

/** Score de la question pour chaque candidat de l'axe, entre 0 et 1 ; NaN : inconnu (questionScore de core/score.ts) */
function scoreInto(prep: Prep, qi: number, r: Int8Array, out: Float64Array): void {
  const V = prep.V[qi]!
  const DEN = prep.DEN[qi]!
  const LOW = prep.LOW[qi]!
  for (let c = 0; c < out.length; c++) {
    const den = DEN[c]!
    const low = LOW[c]
    const v = V[c]!
    let num = 0
    let ok = den > 0
    for (let a = 0; ok && a < r.length; a++) {
      const u = r[a]!
      if (u === 0) continue
      if (low && low[a]) ok = false
      else num += v[a]! * u
    }
    out[c] = ok ? (num / den + 1) / 2 : NaN
  }
}

/**
 * Affinité de l'unité avec chaque candidat, entre 0 et 100 : par thème, la moyenne des questions où il est connu (×100,
 * c'est topicScores) ; pour une famille, la moyenne des thèmes où il est connu, chaque thème pesant un. NaN : inconnu.
 */
function affinityInto(scores: readonly Float64Array[], byTopic: readonly number[][], out: Float64Array): void {
  for (let c = 0; c < out.length; c++) {
    let sum = 0
    let topics = 0
    for (const js of byTopic) {
      let s = 0
      let k = 0
      for (const j of js) {
        const v = scores[j]![c]!
        if (v === v) {
          s += v
          k++
        }
      }
      if (k) {
        sum += s / k
        topics++
      }
    }
    out[c] = topics ? (100 * sum) / topics : NaN
  }
}

/** Moyenne par bloc des affinités connues ; NaN : aucun candidat du bloc connu */
function blocMeansInto(aff: Float64Array, members: readonly number[][], out: Float64Array, at = 0): void {
  for (let b = 0; b < members.length; b++) {
    let s = 0
    let k = 0
    for (const c of members[b]!) {
      const v = aff[c]!
      if (v === v) {
        s += v
        k++
      }
    }
    out[at + b] = k ? s / k : NaN
  }
}

const FACT = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600]
const fact = (n: number) => FACT[n] ?? Number.POSITIVE_INFINITY

/** Placements distincts des avis d'une question entre ses approches : k! / (n₊! n₋! n₀!) */
function arrangementCount(r: Int8Array): number {
  const counts = new Map<number, number>()
  for (const v of r) counts.set(v, (counts.get(v) ?? 0) + 1)
  let n = fact(r.length)
  for (const k of counts.values()) n /= fact(k)
  return Math.round(n)
}

/** Tous les placements distincts des avis d'une question (le placement observé compris) */
function arrangements(r: Int8Array): Int8Array[] {
  const counts = new Map<number, number>()
  for (const v of r) counts.set(v, (counts.get(v) ?? 0) + 1)
  const values = [...counts.keys()].sort((a, b) => a - b)
  const out: Int8Array[] = []
  const cur = new Int8Array(r.length)
  const place = (i: number) => {
    if (i === r.length) {
      out.push(cur.slice())
      return
    }
    for (const v of values) {
      const k = counts.get(v)!
      if (!k) continue
      counts.set(v, k - 1)
      cur[i] = v
      place(i + 1)
      counts.set(v, k)
    }
  }
  place(0)
  return out
}

/** Une unité de lecture : un thème, ou une famille d'au moins deux thèmes */
interface UnitDef {
  kind: UnitKind
  id: string
  topicIds: readonly TopicId[]
}

/** Les blocs ▲ ne forment pas une suite contiguë de l'axe */
const isTwoSided = (near: readonly number[]) => near.length > 1 && near[near.length - 1]! - near[0]! !== near.length - 1

function readUnit(
  prep: Prep,
  members: readonly number[][],
  def: UnitDef,
  qs: readonly number[],
  vectors: ReadonlyMap<number, Int8Array>,
  opts: ReadOptions,
): UnitReading {
  const NP = prep.ids.length
  const B = prep.axis.length
  const inPanel = new Set(members.flat())
  // Les questions de l'unité, rangées par thème (chaque thème pèse un dans une famille)
  const topicOf = new Map<TopicId, number[]>()
  qs.forEach((qi, j) => {
    const t = prep.questions[qi]!.topicId
    const list = topicOf.get(t)
    if (list) list.push(j)
    else topicOf.set(t, [j])
  })
  const byTopic = [...topicOf.values()]
  const observed = qs.map(qi => {
    const o = new Float64Array(NP)
    scoreInto(prep, qi, vectors.get(qi)!, o)
    return o
  })
  const aff = new Float64Array(NP)
  affinityInto(observed, byTopic, aff)
  const S = new Float64Array(B)
  blocMeansInto(aff, members, S)

  const perCandidate: Record<CandidateId, number | null> = {}
  prep.ids.forEach((id, c) => {
    if (inPanel.has(c)) perCandidate[id] = Number.isFinite(aff[c]!) ? aff[c]! : null
  })
  const cells: BlocCell[] = prep.axis.map((a, b) => ({
    bloc: a.bloc,
    known: members[b]!.filter(c => Number.isFinite(aff[c]!)).map(c => prep.ids[c]!),
    affinity: Number.isFinite(S[b]!) ? S[b]! : null,
    chance: null,
    p: null,
    mark: Number.isFinite(S[b]!) ? 'rien' : 'inconnu',
  }))
  const reading: UnitReading = {
    kind: def.kind,
    id: def.id,
    topicIds: [...topicOf.keys()],
    questions: qs.map(qi => prep.questions[qi]!.id),
    status: 'aucun',
    cells,
    near: [],
    far: [],
    twoSided: false,
    exact: false,
    arrangements: 0,
    perCandidate,
  }
  const known: number[] = []
  for (let b = 0; b < B; b++) if (Number.isFinite(S[b]!)) known.push(b)
  if (B - known.length > ECHIQUIER.MAX_UNKNOWN_BLOCS) {
    reading.status = 'blocs-inconnus'
    return reading
  }
  if (qs.length < ECHIQUIER.MIN_QUESTIONS) {
    reading.status = 'une-question'
    return reading
  }

  // Les mêmes avis, placés au hasard entre les approches de chaque question : tous les placements s'ils sont peu
  // nombreux (mille au plus), sinon des tirages dont la graine ne dépend que de l'élection, de l'unité, des questions
  // et des avis
  let total = 1
  for (const qi of qs) {
    total *= arrangementCount(vectors.get(qi)!)
    if (total > ECHIQUIER.EXACT_MAX) break
  }
  let nulls: Float64Array
  let N: number
  const pick: Float64Array[] = qs.map(() => new Float64Array(NP))
  const affJ = new Float64Array(NP)
  if (total <= ECHIQUIER.EXACT_MAX) {
    const per = qs.map(qi =>
      arrangements(vectors.get(qi)!).map(a => {
        const o = new Float64Array(NP)
        scoreInto(prep, qi, a, o)
        return o
      }),
    )
    N = per.reduce((n, list) => n * list.length, 1)
    nulls = new Float64Array(N * B)
    const at = new Int32Array(per.length)
    for (let n = 0; n < N; n++) {
      for (let j = 0; j < per.length; j++) pick[j] = per[j]![at[j]!]!
      affinityInto(pick, byTopic, affJ)
      blocMeansInto(affJ, members, nulls, n * B)
      for (let j = per.length - 1; j >= 0; j--) {
        if (++at[j]! < per[j]!.length) break
        at[j] = 0
      }
    }
    reading.exact = true
  } else {
    N = opts.draws ?? ECHIQUIER.DRAWS
    nulls = new Float64Array(N * B)
    // Les avis au signe près (le premier avis de l'unité compte positif) : des avis tous inversés reçoivent les mêmes
    // tirages, et leur lecture échange exactement ▲ et ▽, comme quand tous les placements sont comptés
    let sign = 0
    for (const qi of qs) {
      sign = vectors.get(qi)!.find(x => x !== 0) ?? 0
      if (sign) break
    }
    const seed = `${prep.electionId}|${def.kind}:${def.id}|${qs.map(qi => `${prep.questions[qi]!.id}:${Array.from(vectors.get(qi)!, x => x * (sign || 1) || 0).join(',')}`).join(';')}`
    const rand = mulberry32(hashString(seed))
    const buffers = qs.map(qi => new Int8Array(vectors.get(qi)!.length))
    for (let n = 0; n < N; n++) {
      for (let j = 0; j < qs.length; j++) {
        const a = buffers[j]!
        a.set(vectors.get(qs[j]!)!)
        // Fisher-Yates, comme seededShuffle (core/rng.ts)
        for (let i = a.length - 1; i > 0; i--) {
          const k = Math.floor(rand() * (i + 1))
          const t = a[i]!
          a[i] = a[k]!
          a[k] = t
        }
        scoreInto(prep, qs[j]!, a, pick[j]!)
      }
      affinityInto(pick, byTopic, affJ)
      blocMeansInto(affJ, members, nulls, n * B)
    }
  }
  reading.arrangements = N

  // Moyenne et écart-type des placements, par bloc ; écart réduit z ; statistique commune T = max |z| (max-T)
  const mu = new Float64Array(B).fill(NaN)
  const sd = new Float64Array(B)
  for (const b of known) {
    let s = 0
    let k = 0
    for (let n = 0; n < N; n++) {
      const v = nulls[n * B + b]!
      if (v === v) {
        s += v
        k++
      }
    }
    if (!k) continue
    const m = s / k
    let d = 0
    for (let n = 0; n < N; n++) {
      const v = nulls[n * B + b]!
      if (v === v) d += (v - m) ** 2
    }
    mu[b] = m
    sd[b] = k > 1 ? Math.sqrt(d / k) : 0
  }
  const zOf = (b: number, v: number) => (sd[b]! > 1e-9 && v === v ? (v - mu[b]!) / sd[b]! : 0)
  const z = new Float64Array(B)
  for (const b of known) z[b] = zOf(b, S[b]!)
  const T = new Float64Array(N)
  for (let n = 0; n < N; n++) {
    let t = 0
    for (const b of known) t = Math.max(t, Math.abs(zOf(b, nulls[n * B + b]!)))
    T[n] = t
  }
  const alpha = (opts.alpha ?? ECHIQUIER.ALPHA) + 1e-12
  const GAP = ECHIQUIER.GAP
  for (const b of known) {
    let ge = 0
    const bar = Math.abs(z[b]!) - 1e-9
    for (let n = 0; n < N; n++) if (T[n]! >= bar) ge++
    const p = reading.exact ? ge / N : (1 + ge) / (1 + N)
    const cell = cells[b]!
    cell.p = p
    cell.chance = Number.isFinite(mu[b]!) ? mu[b]! : null
    const s = S[b]!
    const m = mu[b]!
    if (p <= alpha && z[b]! > 0 && s - m >= GAP && s >= 50 + GAP) {
      cell.mark = 'pres'
      reading.near.push(b)
    } else if (p <= alpha && z[b]! < 0 && m - s >= GAP && s <= 50 - GAP) {
      cell.mark = 'loin'
      reading.far.push(b)
    }
  }
  if (reading.near.length) {
    reading.status = 'lecture'
    reading.twoSided = isTwoSided(reading.near)
  } else reading.status = reading.far.length ? 'ecarts' : 'aucun'
  return reading
}

/** Les blocs ▲ d'une unité, en suites contiguës de l'axe : [[0, 1], [4]] */
export function segments(indices: readonly number[]): number[][] {
  const out: number[][] = []
  for (const i of indices) {
    const last = out[out.length - 1]
    if (last && i === last[last.length - 1]! + 1) last.push(i)
    else out.push([i])
  }
  return out
}

/**
 * Le calcul, une unité à la fois : rend la main entre deux unités (readEchiquierAsync). Les thèmes répondus d'abord,
 * puis les familles affichables, puis la synthèse.
 */
function* steps(pack: ElectionPack, answers: Answers, opts: ReadOptions): Generator<void, Echiquier, void> {
  const prep = prepare(pack)
  const without = new Set(opts.without ?? [])
  const members = prep.axis.map((_, b) => prep.ids.flatMap((id, c) => (prep.blocIndex[c] === b && !without.has(id) ? [c] : [])))
  const vectors = new Map<number, Int8Array>()
  prep.questions.forEach((q, qi) => {
    const a = answers[q.id]
    if (hasOpinion(a)) vectors.set(qi, vectorOf(q, a))
  })
  const answeredOf = (topicIds: readonly TopicId[]) => {
    const set = new Set(topicIds)
    return prep.questions.flatMap((q, qi) => (set.has(q.topicId) && vectors.has(qi) ? [qi] : []))
  }

  const themes: UnitReading[] = []
  const byTheme = new Map<TopicId, UnitReading>()
  for (const t of pack.bank.topics) {
    const qs = answeredOf([t.id])
    if (!qs.length) continue
    const r = readUnit(prep, members, { kind: 'theme', id: t.id, topicIds: [t.id] }, qs, vectors, opts)
    themes.push(r)
    byTheme.set(t.id, r)
    yield
  }
  const families: UnitReading[] = []
  const byFamily = new Map<string, UnitReading>()
  for (const g of prep.groups) {
    // Une famille d'un seul thème, c'est le thème ; une famille dont un seul thème a une réponse redirait sa ligne
    if (g.topicIds.length < 2 || g.topicIds.filter(t => byTheme.has(t)).length < 2) continue
    const r = readUnit(prep, members, { kind: 'famille', id: g.id, topicIds: g.topicIds }, answeredOf(g.topicIds), vectors, opts)
    families.push(r)
    byFamily.set(g.id, r)
    yield
  }

  // Synthèse : par famille, les thèmes lus ; à défaut, la famille si elle est lue
  const summary: SummaryGroup[] = []
  const add = (r: UnitReading) => {
    const key = r.near.join(',')
    const group = summary.find(s => s.near.join(',') === key)
    if (group) group.items.push({ kind: r.kind, id: r.id })
    else summary.push({ near: r.near.slice(), twoSided: r.twoSided, items: [{ kind: r.kind, id: r.id }] })
  }
  for (const g of prep.groups) {
    const read = g.topicIds.map(t => byTheme.get(t)).filter((r): r is UnitReading => r?.status === 'lecture')
    if (read.length) read.forEach(add)
    else {
      const f = byFamily.get(g.id)
      if (f?.status === 'lecture') add(f)
    }
  }
  // Selon l'axe : le plus petit bloc d'abord, puis le nombre de blocs ; les lectures des deux bords en dernier
  summary.sort((a, b) => Number(a.twoSided) - Number(b.twoSided) || a.near[0]! - b.near[0]! || a.near.length - b.near.length || compareNear(a.near, b.near))

  const statusOf = (t: TopicId) => byTheme.get(t)?.status
  const topics = pack.bank.topics.map(t => t.id)
  return {
    themes,
    families,
    summary,
    nothing: topics.filter(t => statusOf(t) === 'aucun'),
    apart: topics.filter(t => statusOf(t) === 'ecarts'),
    noReading: topics.filter(t => statusOf(t) === 'une-question' || statusOf(t) === 'blocs-inconnus'),
    unanswered: topics.filter(t => !byTheme.has(t)),
    quickOnly: !prep.questions.some((q, qi) => q.tier !== 'essentiel' && vectors.has(qi)),
  }
}

const compareNear = (a: readonly number[], b: readonly number[]) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i]! - b[i]!
  return a.length - b.length
}

// ——— Cache en mémoire, par pack et par empreinte des réponses : jamais enregistré ———

const CACHES = new WeakMap<ElectionPack, Map<string, Echiquier>>()
const CACHE_SIZE = 4

/** L'empreinte des réponses qui comptent : les réglages, et les avis de chaque question répondue */
function fingerprint(pack: ElectionPack, answers: Answers, opts: ReadOptions): string {
  const parts = [String(opts.draws ?? ''), String(opts.alpha ?? ''), [...(opts.without ?? [])].sort().join(',')]
  for (const q of pack.bank.questions) {
    const a = answers[q.id]
    if (hasOpinion(a)) parts.push(`${q.id}:${Array.from(vectorOf(q, a)).join(',')}`)
  }
  return parts.join('|')
}

const cached = (pack: ElectionPack, key: string): Echiquier | null => CACHES.get(pack)?.get(key) ?? null

function remember(pack: ElectionPack, key: string, value: Echiquier): Echiquier {
  let cache = CACHES.get(pack)
  if (!cache) CACHES.set(pack, (cache = new Map()))
  cache.delete(key)
  cache.set(key, value)
  while (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!)
  return value
}

/** La lecture, si elle est déjà calculée pour ces réponses (retour sur la page) ; sinon null */
export function echiquierCached(pack: ElectionPack, answers: Answers): Echiquier | null {
  return cached(pack, fingerprint(pack, answers, {}))
}

/** La lecture, d'un seul tenant (tests, outil d'audit) */
export function readEchiquier(pack: ElectionPack, answers: Answers, opts: ReadOptions = {}): Echiquier {
  const key = fingerprint(pack, answers, opts)
  const hit = cached(pack, key)
  if (hit) return remember(pack, key, hit)
  const it = steps(pack, answers, opts)
  for (;;) {
    const r = it.next()
    if (r.done) return remember(pack, key, r.value)
  }
}

/** Rend la main au navigateur : scheduler.yield() s'il existe, sinon un tour de boucle */
const yieldToMain = (): Promise<void> => {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  return scheduler?.yield ? scheduler.yield() : new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * La lecture, une unité à la fois : le navigateur reprend la main entre deux unités (la page reste réactive sur un
 * téléphone lent). Même résultat que readEchiquier. Un signal interrompu arrête le calcul (rejet « AbortError »).
 */
export async function readEchiquierAsync(pack: ElectionPack, answers: Answers, signal?: AbortSignal): Promise<Echiquier> {
  const key = fingerprint(pack, answers, {})
  const hit = cached(pack, key)
  if (hit) return remember(pack, key, hit)
  const it = steps(pack, answers, {})
  for (;;) {
    if (signal?.aborted) throw new DOMException('Lecture interrompue', 'AbortError')
    const r = it.next()
    if (r.done) return remember(pack, key, r.value)
    await yieldToMain()
  }
}

// ——— Ce que la page dit des approches : qui les porte en approche principale ———

/**
 * Les candidats de l'axe dont une approche est l'approche principale (poids effectif 2), par bloc de l'axe, dans
 * l'ordre alphabétique de leur bloc
 */
export function mainCarriers(pack: ElectionPack, questionId: QuestionId, approachId: ApproachId): CandidateId[][] {
  const prep = prepare(pack)
  const qi = prep.qIndex.get(questionId)
  const out: CandidateId[][] = prep.axis.map(() => [])
  if (qi === undefined) return out
  const ai = prep.questions[qi]!.approaches.findIndex(a => a.id === approachId)
  for (const c of prep.MAIN[qi]?.[ai] ?? []) out[prep.blocIndex[c]!]!.push(prep.ids[c]!)
  return out
}

/** Les approches d'une réponse marquées « d'accord » */
export const approvedOf = (q: Question, answer: Answer | undefined): ApproachId[] =>
  answer && hasOpinion(answer) ? q.approaches.filter(a => answer.ratings[a.id] === 1).map(a => a.id) : []

/**
 * Qui porte en approche principale ce qu'une réponse approuve, par bloc de l'axe (sans doublon, ordre alphabétique) :
 * le constat d'un thème lu sur une seule question
 */
export function approvedCarriers(pack: ElectionPack, q: Question, answer: Answer | undefined): CandidateId[][] {
  const prep = prepare(pack)
  const out: Set<CandidateId>[] = prep.axis.map(() => new Set())
  for (const a of approvedOf(q, answer)) mainCarriers(pack, q.id, a).forEach((ids, b) => ids.forEach(id => out[b]!.add(id)))
  const order = new Map(prep.ids.map((id, i) => [id, i]))
  return out.map(s => [...s].sort((x, y) => order.get(x)! - order.get(y)!))
}

/**
 * Les thèmes à compléter pour être lus seuls (la fiche « Pour lire plus de thèmes » de la page) : sur une seule question
 * avec un avis (thin) ou sans aucun avis (none), et qui ont encore des questions approfondies sans avis, la règle de la
 * page Approfondir (une question passée y reste à faire). Dans l'ordre de la banque. current : les réponses qui comptent
 * (hors questions à revoir) ; answers : celles enregistrées
 */
export function deeperTopics(pack: Pick<ElectionPack, 'bank'>, current: Answers, answers: Answers): { thin: TopicId[]; none: TopicId[] } {
  const thin: TopicId[] = []
  const none: TopicId[] = []
  for (const t of pack.bank.topics) {
    const qs = pack.bank.questions.filter(q => q.topicId === t.id)
    if (!qs.some(q => q.tier !== 'essentiel' && !hasOpinion(answers[q.id]))) continue
    const n = qs.filter(q => hasOpinion(current[q.id])).length
    if (n === 0) none.push(t.id)
    else if (n < ECHIQUIER.MIN_QUESTIONS) thin.push(t.id)
  }
  return { thin, none }
}
