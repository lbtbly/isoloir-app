// La lecture des réponses sur l'échiquier, pour la page « Mon profil politique » (ui/screens/Profile.tsx). Thème par
// thème, puis par famille de thèmes, et pour chaque bloc de l'axe de la grille des nuances (election.spectrum.axis) :
// les réponses se rapprochent-elles nettement des candidats de ce bloc, s'en écartent-elles nettement, ou rien de net ?
// « Nettement » : bien plus que les autres façons de poser les mêmes avis, c'est-à-dire autant de « d'accord », de
// « pas d'accord » et de « sans avis » sur chaque question, posés sur d'autres approches (toutes les façons distinctes,
// la vôtre comprise, comptent autant). C'est un test de permutation commun aux blocs (max-T de Westfall-Young) : parmi
// ces façons, la part de celles qui font un écart aussi marqué, avec un bloc ou un autre, doit rester sous ALPHA, quels
// que soient le nombre de blocs et leur taille.
// « Compter, sinon calculer » (décision du propriétaire du 15 octobre 2026 : rien n'est tiré au sort ; mêmes réponses,
// même lecture). Jusqu'à COUNT_MAX façons, on les compte toutes, une à une (max-T exact). Au-delà, on calcule pour
// chaque bloc la loi exacte de son affinité moyenne, question par question, sur une grille au centième de point dont
// l'arrondi, borné, joue toujours contre la lecture, et l'on additionne entre blocs les parts qui s'écartent autant
// (inégalité de Boole) : une borne qui ne peut être que trop prudente, jamais plus généreuse que le compte complet. Elle
// peut donc manquer une lecture que ferait le compte complet, jamais en inventer une (le 15 octobre 2026, là où l'on a
// pu compter en entier au-delà de COUNT_MAX : de 2,5 à 5 % des marques du compte complet manquées selon les séries,
// aucune ajoutée).
// Méthode « chaque bloc face aux autres façons de poser vos avis », retenue par le propriétaire le 12 octobre 2026 ;
// ses garanties sont mesurées par tests/echiquier-calibration.test.ts et tools/audit-echiquier.mjs, publiées dans la
// Méthode.
//
// Ni point sur un axe, ni moyenne entre thèmes, ni étiquette : seulement, par unité de lecture, des marques par bloc.
// Aucun effet sur le score, le classement ni les priorités. Calcul sans IA, sur l'appareil, à l'affichage ; rien n'est
// enregistré (un cache en mémoire, par empreinte des réponses, évite de recalculer au retour sur la page).
// L'affinité d'un thème avec un candidat est exactement topicScores de core/score.ts : mêmes stance et
// effectiveWeight, approches non notées au dénominateur, et une note posée sur une approche où le candidat a une
// position de confiance basse rend la question inconnue pour lui (dans la comparaison aussi : selon la façon de poser
// les avis, il est connu ou non sur la question, et le calcul en tient compte exactement).
// Fichier à part du build, chargé à la demande avec la page (ui/profile/load.ts).

import { hasOpinion } from './answers'
import { CLOSE_GAP, effectiveWeight, excludedIds, stance } from './score'
import { axisOf, blocOf } from './spectrum'
import type { Answer, Answers, ApproachId, CandidateId, ElectionPack, Question, QuestionId, SpectrumAxisBloc, TopicGroup, TopicId } from './types'

/** Les réglages de la méthode (cahier des charges, § 3.13) */
export const ECHIQUIER = {
  /** Seuil du test commun aux blocs, par unité de lecture (décision du propriétaire : 0,10) */
  ALPHA: 0.1,
  /** Écart minimal, en points, aux autres façons de poser les avis et au neutre (50 %) : un bâton du site */
  GAP: CLOSE_GAP,
  /** Questions répondues qu'il faut pour lire une unité */
  MIN_QUESTIONS: 2,
  /** Au-delà d'un bloc sans candidat connu, pas de lecture */
  MAX_UNKNOWN_BLOCS: 1,
  /** Jusqu'à ce nombre de façons de poser les mêmes avis, on les compte toutes ; au-delà, on calcule (borne prudente) */
  COUNT_MAX: 100_000,
  /** Pas de la grille des lois par bloc au-delà de COUNT_MAX, en points d'affinité */
  GRID: 0.01,
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
  /**
   * La même moyenne, sur les façons de poser les mêmes avis où le bloc a un candidat connu (la vôtre comprise) ; null
   * sans test
   */
  chance: number | null
  /**
   * Part des façons de poser les mêmes avis (la vôtre comprise) qui font un écart aussi marqué, avec ce bloc ou un
   * autre, chaque écart rapporté à la dispersion de son bloc (max-T, commun aux blocs) ; au-delà de COUNT_MAX façons,
   * sa borne calculée, jamais plus petite ; null sans test
   */
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
  /**
   * Les façons de poser les mêmes avis ont toutes été comptées, une à une : les p sont exacts. Faux au-delà de
   * COUNT_MAX façons (ou de ReadOptions.countMax), où les p sont la borne calculée bloc par bloc puis additionnée entre
   * blocs, jamais plus petite que le compte complet, et sans test. Rien n'est tiré au sort, dans un cas comme dans
   * l'autre
   */
  exact: boolean
  /**
   * Le nombre de façons distinctes de poser les mêmes avis : le produit, question par question, des placements
   * distincts de ses avis entre ses approches (la façon observée comprise), même très grand (arrondi au-delà de 2⁵³) ;
   * 0 sans test
   */
  arrangements: number
  /**
   * Le même nombre, tel que la page peut le dire : exact jusqu'à COUNT_MAX ; au-delà, Infinity (« plus de cent
   * mille ») ; 0 sans test
   */
  ways: number
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
  /** Seuil du test (calibration à 0,20) */
  alpha?: number
  /** Candidats retirés de l'axe (calibration « sans lui ») */
  without?: readonly CandidateId[]
  /** Façons comptées une à une, au plus (COUNT_MAX) ; 0 : toujours la borne calculée (tests de la borne) */
  countMax?: number
  /** Pas de la grille des lois au-delà de COUNT_MAX (GRID) : tests de la grille affinée */
  grid?: number
  /** Faux : la loi d'un bloc qui varie à peine ne s'affine jamais (tests de la grille affinée) */
  refine?: boolean
}

// ——— Les candidats de l'axe ———

/** Le bloc de la grille d'un candidat : défini avec la grille (core/spectrum.ts), repris ici pour les importeurs du calcul */
export { blocOf }

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
function blocMeansInto(aff: Float64Array, members: readonly number[][], out: Float64Array): void {
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
    out[b] = k ? s / k : NaN
  }
}

/** C(n, k) */
function binomial(n: number, k: number): number {
  let x = 1
  for (let i = 1; i <= k; i++) x = (x * (n - k + i)) / i
  return Math.round(x)
}

/** Placements distincts des avis d'une question entre ses approches : k! / (n₊! n₋! n₀!) */
function arrangementCount(r: Int8Array): number {
  let pos = 0
  let neg = 0
  for (const v of r) {
    if (v > 0) pos++
    else if (v < 0) neg++
  }
  return binomial(r.length, pos) * binomial(r.length - pos, neg)
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

/** Les placements distincts des avis d'une question, et pour chacun le score de chaque candidat de l'axe (scoreInto) */
type Placements = Float64Array[]

/**
 * Les placements d'une question, groupés selon ceux des candidats donnés qui y sont connus (une position de confiance
 * basse sous un avis rend la question inconnue pour un candidat), dans l'ordre de leur première apparition
 */
function groupsOf(list: Placements, cands: readonly number[]): number[][] {
  const by = new Map<string, number[]>()
  list.forEach((s, a) => {
    let key = ''
    for (const c of cands) key += s[c] === s[c] ? '1' : '0'
    const l = by.get(key)
    if (l) l.push(a)
    else by.set(key, [a])
  })
  return [...by.values()]
}

/** Chaque motif, un groupe par question (choice[j] : le groupe de la question j), dans l'ordre */
function eachPattern(sizes: readonly number[], visit: (choice: Int32Array) => void): void {
  const choice = new Int32Array(sizes.length)
  for (;;) {
    visit(choice)
    let j = sizes.length - 1
    while (j >= 0 && ++choice[j]! === sizes[j]) choice[j--] = 0
    if (j < 0) return
  }
}

/**
 * L'affinité moyenne d'un bloc, question par question. Sous un motif (qui est connu sur chaque question), elle est
 * une somme de contributions, une par question : chaque candidat connu y pèse 100 / (K × T × n), K candidats connus
 * dans le bloc, T thèmes où il est connu, n questions où il l'est dans ce thème (c'est affinityInto, puis
 * blocMeansInto).
 */
interface BlocModel {
  /** Pose le motif d'une façon de poser les avis (un placement par question) ; rend K, 0 si le bloc y est inconnu */
  set: (reps: readonly Float64Array[]) => number
  /** La contribution d'une question pour un placement, sous le motif posé */
  x: (j: number, s: Float64Array) => number
}

function blocModel(cands: readonly number[], tOf: Int32Array, nTopics: number): BlocModel {
  const m = tOf.length
  const coef = Array.from({ length: m }, () => new Float64Array(cands.length))
  const n = new Int32Array(nTopics)
  return {
    set(reps) {
      let K = 0
      for (let i = 0; i < cands.length; i++) {
        const c = cands[i]!
        n.fill(0)
        for (let j = 0; j < m; j++) if (reps[j]![c] === reps[j]![c]) ++n[tOf[j]!]!
        let T = 0
        for (const k of n) if (k) T++
        if (T) K++
        for (let j = 0; j < m; j++) coef[j]![i] = reps[j]![c] === reps[j]![c] ? 1 / (T * n[tOf[j]!]!) : 0
      }
      if (K) for (const row of coef) for (let i = 0; i < row.length; i++) row[i] = (row[i]! * 100) / K
      return K
    },
    x(j, s) {
      const row = coef[j]!
      let x = 0
      for (let i = 0; i < row.length; i++) if (row[i]) x += row[i]! * s[cands[i]!]!
      return x
    },
  }
}

/** Un motif : sa probabilité, et sous lui la moyenne (e) et la variance (v) exactes de l'affinité du bloc */
interface Moments {
  P: number
  e: number
  v: number
}

/**
 * Moyenne et écart-type exacts de l'affinité d'un bloc, parmi les façons où il est connu : le mélange des motifs, sous
 * chacun une somme de questions indépendantes (variances ajoutées). En deux passes : un bloc constant a un écart-type
 * nul, au lieu d'un résidu d'arrondi qui le ferait compter.
 */
function moments(list: readonly Moments[]): [number, number] {
  let w = 0
  let s = 0
  for (const t of list) {
    w += t.P
    s += t.P * t.e
  }
  const mu = s / w
  let q = 0
  for (const t of list) q += t.P * (t.v + (t.e - mu) * (t.e - mu))
  return [mu, Math.sqrt(q / w)]
}

/** Moyenne et variance (en deux passes), plus petite et plus grande valeur */
function stats(x: Float64Array): [number, number, number, number] {
  let s = 0
  let min = Infinity
  let max = -Infinity
  for (const y of x) {
    s += y
    if (y < min) min = y
    if (y > max) max = y
  }
  const mean = s / x.length
  let q = 0
  for (const y of x) q += (y - mean) * (y - mean)
  return [mean, q / x.length, min, max]
}

/** Ce que le test dit de chaque bloc connu, au signe près (voir readUnit) : p, moyenne des façons, écart réduit observé */
interface Fit {
  p: Float64Array
  mu: Float64Array
  z: Float64Array
}

/** L'écart-type sous lequel un bloc ne compte pas : bloc constant (son écart réduit vaut alors 0) */
const FLAT = 1e-9
/**
 * Tolérance des égalités : un écart réduit, un écart en points ou un seuil atteint tout juste compte comme atteint (la
 * règle dit « au moins »), malgré l'arrondi des nombres à virgule
 */
const TIE = 1e-9
/** Façons comptées d'un seul tenant, au plus, avant de rendre la main (un thème compté en entier, téléphone lent) */
const CHUNK = 20_000

/**
 * Jusqu'à COUNT_MAX façons : le compte complet (max-T exact). Moyenne et écart-type exacts de chaque bloc, puis, façon
 * par façon, le plus grand écart réduit des blocs connus ; p : la part des façons où il atteint celui du bloc. Les
 * placements d'une question qui apportent les mêmes contributions à tous les blocs sont comptés ensemble, et les sommes
 * se font de proche en proche : le même résultat que l'énumération des façons une à une, en bien moins de calcul. Rend
 * la main toutes les CHUNK façons comptées.
 */
function* countAll(models: readonly BlocModel[], cands: readonly number[], per: readonly Placements[], xs: readonly number[]): Generator<void, Fit, void> {
  const m = per.length
  const K = models.length
  const sig = per.map(list => groupsOf(list, cands))
  const pats: { def: Uint8Array; atoms: { x: Float64Array; w: number }[][] }[] = []
  const mom: Moments[][] = models.map(() => [])
  const reps: Float64Array[] = []
  eachPattern(
    sig.map(g => g.length),
    choice => {
      for (let j = 0; j < m; j++) reps[j] = per[j]![sig[j]![choice[j]!]![0]!]!
      const def = Uint8Array.from(models, md => (md.set(reps) ? 1 : 0))
      let P = 1
      const e = new Float64Array(K)
      const v = new Float64Array(K)
      const atoms = sig.map((g, j) => {
        const list = g[choice[j]!]!
        P *= list.length / per[j]!.length
        const xj = list.map(a => Float64Array.from(models, (md, k) => (def[k] ? md.x(j, per[j]![a]!) : 0)))
        for (let k = 0; k < K; k++) {
          const [mean, vj] = stats(Float64Array.from(xj, x => x[k]!))
          e[k]! += mean
          v[k]! += vj
        }
        const merged = new Map<string, { x: Float64Array; w: number }>()
        for (const x of xj) {
          const key = x.join(',')
          const at = merged.get(key)
          if (at) at.w++
          else merged.set(key, { x, w: 1 })
        }
        return [...merged.values()]
      })
      for (let k = 0; k < K; k++) if (def[k]) mom[k]!.push({ P, e: e[k]!, v: v[k]! })
      pats.push({ def, atoms })
    },
  )
  const mu = new Float64Array(K)
  const inv = new Float64Array(K)
  mom.forEach((list, k) => {
    const [mean, sd] = moments(list)
    mu[k] = mean
    inv[k] = sd > FLAT ? 1 / sd : 0
  })
  const z = Float64Array.from(xs, (x, k) => (x - mu[k]!) * inv[k]!)
  // Les seuils des blocs, croissants : une façon compte pour tous les blocs dont le seuil est sous son plus grand écart
  const thr = Array.from(z, t => Math.abs(t) - TIE)
  const order = thr.map((_, k) => k).sort((a, b) => thr[a]! - thr[b]!)
  const sorted = order.map(k => thr[k]!)
  const hist = new Float64Array(K + 1)
  let total = 0
  let leaves = 0
  const pre = Array.from({ length: m + 1 }, () => new Float64Array(K))
  const wpre = new Float64Array(m + 1)
  const idx = new Int32Array(m)
  for (const { def, atoms } of pats) {
    wpre[0] = 1
    idx.fill(0)
    let from = 0
    for (;;) {
      for (let j = from; j < m; j++) {
        const at = atoms[j]![idx[j]!]!
        const p0 = pre[j]!
        const p1 = pre[j + 1]!
        for (let k = 0; k < K; k++) p1[k] = p0[k]! + at.x[k]!
        wpre[j + 1] = wpre[j]! * at.w
      }
      const fin = pre[m]!
      let t = 0
      for (let k = 0; k < K; k++) {
        const d = def[k] ? Math.abs(fin[k]! - mu[k]!) * inv[k]! : 0
        if (d > t) t = d
      }
      let R = 0
      while (R < K && sorted[R]! <= t) R++
      hist[R]! += wpre[m]!
      total += wpre[m]!
      if (++leaves === CHUNK) {
        leaves = 0
        yield
      }
      let j = m - 1
      while (j >= 0 && ++idx[j]! === atoms[j]!.length) idx[j--] = 0
      if (j < 0) break
      from = j
    }
  }
  const p = new Float64Array(K)
  order.forEach((k, r) => {
    let ge = 0
    for (let R = r + 1; R <= K; R++) ge += hist[R]!
    p[k] = ge / total
  })
  return { p, mu, z }
}

/** La loi d'un bloc au-delà de COUNT_MAX façons (blocLaw) */
interface Law {
  /** Moyenne et écart-type exacts (sans arrondi), parmi les façons où le bloc est connu */
  mu: number
  sd: number
  /** La part des façons où le bloc est connu et s'écarte de mu d'au moins d, bornée par excès */
  tail: (d: number) => number
}

/** Cases de la grille, au plus, quand elle s'affine pour un bloc qui varie à peine */
const FINE_CELLS = 1 << 16

/**
 * La loi exacte de l'affinité moyenne d'un bloc sur toutes les façons de poser les mêmes avis : le mélange exact des
 * motifs (qui est connu), et sous chacun la convolution, question par question, des contributions posées sur une grille
 * de pas h. La moyenne, l'écart-type et le plus grand écart à la moyenne sont calculés exactement, hors de la grille ;
 * E borne l'écart entre une somme posée et la somme exacte (la somme, sur les questions, du plus grand arrondi de
 * chacune) : la part des façons qui s'écartent d'au moins d est au plus celle des sommes posées qui s'écartent d'au
 * moins d − E. Un bloc qui varie à peine (E trop grand devant son écart-type) refait sa loi sur une grille plus fine
 * (sauf refine faux, pour les tests).
 */
function blocLaw(md: BlocModel, cands: readonly number[], per: readonly Placements[], refine: boolean, h: number = ECHIQUIER.GRID): Law {
  const m = per.length
  const sig = per.map(list => groupsOf(list, cands))
  const pats: (Moments & { lo: number; hi: number; d: Float64Array; at: number })[] = []
  let E = 0
  const reps: Float64Array[] = []
  eachPattern(
    sig.map(g => g.length),
    choice => {
      for (let j = 0; j < m; j++) reps[j] = per[j]![sig[j]![choice[j]!]![0]!]!
      if (!md.set(reps)) return
      let P = 1
      let e = 0
      let v = 0
      let lo = 0
      let hi = 0
      let err = 0
      let d = new Float64Array([1])
      let at = 0
      for (let j = 0; j < m; j++) {
        const list = sig[j]![choice[j]!]!
        P *= list.length / per[j]!.length
        const x = Float64Array.from(list, a => md.x(j, per[j]![a]!))
        const [mean, vj, min, max] = stats(x)
        e += mean
        v += vj
        lo += min
        hi += max
        // Les contributions de la question, posées sur la grille : leurs poids, à partir de k0
        const k0 = Math.round(min / h)
        const w = new Float64Array(Math.round(max / h) - k0 + 1)
        let ej = 0
        for (const y of x) {
          const k = Math.round(y / h)
          ej = Math.max(ej, Math.abs(y - k * h))
          w[k - k0]! += 1 / x.length
        }
        err += ej
        // La loi des questions déjà vues, décalée par chaque contribution possible de celle-ci
        const out = new Float64Array(d.length + w.length - 1)
        for (let s = 0; s < w.length; s++) {
          const ws = w[s]!
          if (ws) for (let i = 0; i < d.length; i++) out[i + s]! += d[i]! * ws
        }
        d = out
        at += k0
      }
      E = Math.max(E, err)
      pats.push({ P, e, v, lo, hi, d, at })
    },
  )
  const [mu, sd] = moments(pats)
  let dMax = 0
  let lo = Infinity
  let hi = -Infinity
  for (const t of pats) {
    dMax = Math.max(dMax, t.hi - mu, mu - t.lo)
    lo = Math.min(lo, t.lo)
    hi = Math.max(hi, t.hi)
  }
  if (refine && sd > FLAT && E > sd / 20) {
    const fine = Math.max((h * sd) / (40 * E), (hi - lo) / FINE_CELLS)
    if (fine < h / 2) return blocLaw(md, cands, per, refine, fine)
  }
  // La loi posée, case i à la somme (base + i) × h ; ses masses cumulées par le bas (low) et par le haut (high)
  const base = Math.min(...pats.map(t => t.at))
  const size = Math.max(...pats.map(t => t.at + t.d.length)) - base
  const law = new Float64Array(size)
  for (const t of pats) for (let i = 0; i < t.d.length; i++) law[t.at - base + i]! += t.P * t.d[i]!
  const low = new Float64Array(size + 1)
  const high = new Float64Array(size + 1)
  for (let i = 0; i < size; i++) low[i + 1] = low[i]! + law[i]!
  for (let i = size - 1; i >= 0; i--) high[i] = high[i + 1]! + law[i]!
  return {
    mu,
    sd,
    tail: dd => {
      // Aucune façon ne s'écarte autant (exact) ; sinon, les cases à mu − d + E et en dessous, à mu + d − E et au-dessus
      // (une case de plus de chaque côté au moindre doute d'arrondi)
      if (dd > dMax + TIE) return 0
      const cut = dd - E - TIE
      const a = Math.floor((mu - cut) / h - base + 1e-6) + 1
      const b = Math.ceil((mu + cut) / h - base - 1e-6)
      if (a >= b) return low[size]!
      return low[Math.min(size, Math.max(0, a))]! + high[Math.min(size, Math.max(0, b))]!
    },
  }
}

/**
 * Au-delà de COUNT_MAX façons : la loi de chaque bloc, puis l'addition. La part des façons où un bloc ou un autre
 * s'écarte autant que le bloc b, en écarts réduits, est au plus la somme de ces parts, bloc par bloc (inégalité de
 * Boole, sans hypothèse d'indépendance) : jamais moins que le compte complet. Un bloc constant n'ajoute rien, comme
 * dans le compte complet où son écart réduit vaut toujours 0 : il n'efface pas les lectures des autres blocs. Rend la
 * main après chaque bloc (téléphone lent).
 */
function* bound(models: readonly BlocModel[], members: readonly (readonly number[])[], per: readonly Placements[], xs: readonly number[], opts: ReadOptions): Generator<void, Fit, void> {
  const laws: Law[] = []
  for (let k = 0; k < models.length; k++) {
    laws.push(blocLaw(models[k]!, members[k]!, per, opts.refine ?? true, opts.grid))
    yield
  }
  const z = Float64Array.from(xs, (x, k) => (laws[k]!.sd > FLAT ? (x - laws[k]!.mu) / laws[k]!.sd : 0))
  const p = Float64Array.from(z, zb => {
    const t = Math.abs(zb) - TIE
    if (t <= 0) return 1
    let s = 0
    for (const law of laws) if (law.sd > FLAT) s += law.tail(t * law.sd)
    return Math.min(1, s)
  })
  return { p, mu: Float64Array.from(laws, law => law.mu), z }
}

/** Une unité de lecture : un thème, ou une famille d'au moins deux thèmes */
interface UnitDef {
  kind: UnitKind
  id: string
  topicIds: readonly TopicId[]
}

/** Les blocs ▲ ne forment pas une suite contiguë de l'axe */
const isTwoSided = (near: readonly number[]) => near.length > 1 && near[near.length - 1]! - near[0]! !== near.length - 1

function* readUnit(
  prep: Prep,
  members: readonly number[][],
  def: UnitDef,
  qs: readonly number[],
  vectors: ReadonlyMap<number, Int8Array>,
  place: (qi: number, flip: boolean) => Placements,
  opts: ReadOptions,
): Generator<void, UnitReading, void> {
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
  const tOf = new Int32Array(qs.length)
  byTopic.forEach((js, t) => js.forEach(j => (tOf[j] = t)))
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
    ways: 0,
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

  // Les autres façons de poser les mêmes avis : sur chaque question, ses avis placés autrement entre ses approches
  let N = 1
  for (const qi of qs) N *= arrangementCount(vectors.get(qi)!)
  reading.arrangements = N
  reading.ways = N <= ECHIQUIER.COUNT_MAX ? N : Number.POSITIVE_INFINITY
  // Les avis au signe près (le premier avis de l'unité compte positif) : des avis tous inversés font le même calcul,
  // l'affinité de chaque façon devenant 100 moins elle-même, et leur lecture échange exactement ▲ et ▽
  let sign = 0
  for (const qi of qs) {
    sign = vectors.get(qi)!.find(x => x !== 0) ?? 0
    if (sign) break
  }
  const flip = sign < 0
  const per = qs.map(qi => place(qi, flip))
  const seen = flip
    ? qs.map(qi => {
        const o = new Float64Array(NP)
        scoreInto(prep, qi, vectors.get(qi)!.map(x => -x), o)
        return o
      })
    : observed
  const blocs = known.map(b => members[b]!)
  const models = blocs.map(cands => blocModel(cands, tOf, byTopic.length))
  // L'affinité observée de chaque bloc, par son modèle : l'affinité moyenne affichée (au signe près)
  const xs = models.map(md => {
    md.set(seen)
    let x = 0
    seen.forEach((s, j) => (x += md.x(j, s)))
    return x
  })
  let fit: Fit
  if (N <= (opts.countMax ?? ECHIQUIER.COUNT_MAX)) {
    fit = yield* countAll(models, blocs.flat(), per, xs)
    reading.exact = true
  } else fit = yield* bound(models, blocs, per, xs, opts)

  // Les marques se décident au signe près (xs, fit), puis se rendent dans le sens des avis : des avis tous inversés ont
  // exactement les mêmes, ▲ et ▽ échangés, même quand un écart ou un seuil est atteint tout juste
  const alpha = (opts.alpha ?? ECHIQUIER.ALPHA) + 1e-12
  const GAP = ECHIQUIER.GAP - TIE
  known.forEach((b, k) => {
    const p = fit.p[k]!
    const s = xs[k]!
    const m = fit.mu[k]!
    const z = fit.z[k]!
    const up = p <= alpha && z > 0 && s - m >= GAP && s >= 50 + GAP
    const down = p <= alpha && z < 0 && m - s >= GAP && s <= 50 - GAP
    const cell = cells[b]!
    cell.p = p
    cell.chance = flip ? 100 - m : m
    if (flip ? down : up) {
      cell.mark = 'pres'
      reading.near.push(b)
    } else if (flip ? up : down) {
      cell.mark = 'loin'
      reading.far.push(b)
    }
  })
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
 * Le calcul, une unité à la fois : rend la main entre deux unités (readEchiquierAsync), et dans une unité toutes les
 * CHUNK façons comptées, ou entre deux blocs quand elles sont trop nombreuses pour être comptées. Les thèmes répondus
 * d'abord, puis les familles affichables, puis la synthèse.
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
  // Les placements de chaque question et leurs scores, une fois par lecture (partagés entre thème et famille), dans
  // le sens où une unité les prend (ses avis au signe près, voir readUnit)
  const placed = new Map<number, Placements>()
  const place = (qi: number, flip: boolean): Placements => {
    const key = flip ? -1 - qi : qi
    let list = placed.get(key)
    if (!list) {
      const r = vectors.get(qi)!
      list = arrangements(flip ? r.map(x => -x) : r).map(a => {
        const o = new Float64Array(prep.ids.length)
        scoreInto(prep, qi, a, o)
        return o
      })
      placed.set(key, list)
    }
    return list
  }

  const themes: UnitReading[] = []
  const byTheme = new Map<TopicId, UnitReading>()
  for (const t of pack.bank.topics) {
    const qs = answeredOf([t.id])
    if (!qs.length) continue
    const r = yield* readUnit(prep, members, { kind: 'theme', id: t.id, topicIds: [t.id] }, qs, vectors, place, opts)
    themes.push(r)
    byTheme.set(t.id, r)
    yield
  }
  const families: UnitReading[] = []
  const byFamily = new Map<string, UnitReading>()
  for (const g of prep.groups) {
    // Une famille d'un seul thème, c'est le thème ; une famille dont un seul thème a une réponse redirait sa ligne
    if (g.topicIds.length < 2 || g.topicIds.filter(t => byTheme.has(t)).length < 2) continue
    const r = yield* readUnit(prep, members, { kind: 'famille', id: g.id, topicIds: g.topicIds }, answeredOf(g.topicIds), vectors, place, opts)
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
  const parts = [String(opts.alpha ?? ''), [...(opts.without ?? [])].sort().join(','), String(opts.countMax ?? ''), String(opts.grid ?? ''), String(opts.refine ?? '')]
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

/** Un tour de boucle entier, par une minuterie : les minuteries de la page déjà échues passent avant la suite */
const nextTask = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Rend la main au navigateur : scheduler.yield() s'il existe (sa reprise passe devant toutes les minuteries), sinon un
 * tour de boucle
 */
const yieldToMain = (): Promise<void> => {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler
  return scheduler?.yield ? scheduler.yield() : nextTask()
}

/** Calcul d'un seul tenant avant de rendre la main, en ms */
const SLICE = 10
/** Au plus tous les TIMERS ms, la main se rend par une minuterie */
const TIMERS = 50

/**
 * La lecture, par étapes : le navigateur reprend la main dès que le calcul a duré SLICE ms d'un seul tenant (la page
 * reste réactive sur un téléphone lent, sans payer à chaque étape le délai d'une minuterie quand scheduler.yield
 * manque), et au moins tous les TIMERS ms par une minuterie, pour que passent aussi celles de la page (le statut
 * « Lecture en cours » de Profile.tsx), que les reprises de scheduler.yield feraient attendre jusqu'à la fin. Même
 * résultat que readEchiquier. Un signal interrompu arrête le calcul (rejet « AbortError »).
 */
export async function readEchiquierAsync(pack: ElectionPack, answers: Answers, signal?: AbortSignal): Promise<Echiquier> {
  const key = fingerprint(pack, answers, {})
  const hit = cached(pack, key)
  if (hit) return remember(pack, key, hit)
  const it = steps(pack, answers, {})
  let resumed = performance.now()
  let timers = resumed
  for (;;) {
    if (signal?.aborted) throw new DOMException('Lecture interrompue', 'AbortError')
    const r = it.next()
    if (r.done) return remember(pack, key, r.value)
    const now = performance.now()
    if (now - resumed < SLICE) continue
    if (now - timers >= TIMERS) {
      timers = now
      await nextTask()
    } else await yieldToMain()
    resumed = performance.now()
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
