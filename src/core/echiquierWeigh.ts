// Ce qui pèse le plus dans une lecture nette (lot 3, A3, plan « Approfondir Mon profil politique » approuvé le 15
// octobre 2026), pour la page « Mon profil politique » : dans une ligne ouverte, la question qui pèse le plus dans
// l'écart affiché, et dans elle l'avis qui y compte le plus ; dans le détail, la part de chaque question. Calcul exact,
// sans tirage, comme la lecture (décision D1 du propriétaire) : les pièces mêmes de core/echiquier.ts, reprises sans
// rien recopier. Rien n'y change la lecture : on décompose celle qui est faite. Aucun nom de candidat n'en sort pour la
// page, seulement des nombres (D3).
// Un fichier à part du build, avec la fiche qui le montre (ui/profile/Weigh.tsx) : la page le charge à la demande, après
// son premier affichage, et ne le calcule qu'à l'ouverture d'une ligne ou d'un détail.

import { affinityInto, arrangements, blocMeansInto, membersOf, prepare, scoreInto, segments, TIE, vectorOf, type ReadOptions, type UnitReading } from './echiquier'
import type { Answers, ApproachId, ElectionPack, QuestionId, Rating, TopicId } from './types'


/**
 * Ce que l'approche citée est pour les candidats connus des blocs de la fiche, la phrase qui la suit : vous l'approuvez,
 * et elle est l'approche principale de certains (principale), ou compatible pour certains sans être principale pour
 * aucun (compatible) ; vous la désapprouvez, et certains la rejettent (rejet), ou aucun ne la porte ni ne la rejette
 * (aucun)
 */
export type WeighSuite = 'principale' | 'compatible' | 'rejet' | 'aucun'

/** Ce qui pèse le plus dans une lecture nette, pour une suite contiguë de ses blocs nettement plus près */
export interface Weigh {
  /** Les blocs de la suite, indices de l'axe, croissants */
  seg: number[]
  /** L'écart affiché : l'affinité moins sa moyenne sur toutes les façons de poser les mêmes avis, en moyenne sur la suite (points) */
  gap: number
  /**
   * La part de chaque question de l'unité, dans l'ordre de UnitReading.questions (points, en moyenne sur la suite) :
   * l'affinité observée moins sa moyenne quand on pose les avis de cette seule question de toutes les façons possibles,
   * les autres questions telles quelles
   */
  parts: number[]
  /** L'écart moins la somme des parts : nul sans position de confiance basse, au calcul près */
  rest: number
  /** La question qui pèse le plus (la plus grande part, la première de la banque à égalité) ; null sans part positive */
  question: QuestionId | null
  /**
   * Dans elle, la part de chaque avis, dans l'ordre de ses approches (points ; 0 sans avis) : sans position de
   * confiance basse, elles font exactement la part de la question ; [] sans question
   */
  shares: number[]
  /** Dans elle, l'approche notée qui y compte le plus (la première à égalité) ; null sans question ou sans part d'avis positive */
  approach: ApproachId | null
  /** Votre avis sur elle (0 sans approche citée) */
  view: Rating | 0
  /** Les candidats connus de la suite, ceux de ses cases ; parmi eux, ceux dont l'approche est principale, compatible, rejetée */
  known: number
  main: number
  compatible: number
  rejects: number
  /** Chacun d'eux porte une autre approche de la question (« ils en portent d'autres ») */
  others: boolean
  /** La phrase qui suit l'approche ; null : aucune ne serait vraie, et la page ne montre pas de fiche */
  suite: WeighSuite | null
  /** Hors de la suite : les blocs où l'approche est l'approche principale d'un candidat de l'axe (croissants), et combien en tout */
  alsoBlocs: number[]
  alsoCount: number
}

/** L'indice de la plus grande valeur positive (au-delà de TIE), le premier à égalité (à TIE près) ; −1 sans valeur positive */
function firstMax(xs: readonly number[]): number {
  let k = -1
  xs.forEach((x, i) => {
    if (x > (k < 0 ? 0 : xs[k]!) + TIE) k = i
  })
  return k
}

/**
 * Ce qui pèse le plus dans une lecture nette (A3), pour chaque suite contiguë de ses blocs nettement plus près, dans
 * l'ordre de l'axe ; [] pour une unité sans lecture nette. Calcul exact, sans tirage, sur les réponses de la lecture
 * (answers : celles qui comptent, hors questions à revoir ; opts : ceux de la lecture). La part d'une question : pour
 * chaque bloc, l'affinité observée moins sa moyenne quand on pose les avis de cette seule question de toutes les façons
 * possibles, les autres telles quelles (parmi les façons où le bloc est connu), en moyenne sur la suite. Sans position
 * de confiance basse, l'affinité d'un bloc est une somme de questions (voir BlocModel) : les parts font exactement
 * l'écart affiché. Dans la question qui pèse le plus, la part d'un avis r posé sur l'approche a : pour chaque candidat
 * connu sur la question, son poids dans l'affinité (100 / (T × n), voir affinityInto) × (v(a) − v̄) × r / (2 Σ|v|), v
 * son profil sur la question et v̄ sa moyenne sur les approches, c'est-à-dire l'écart de son score à la moyenne des
 * façons, avis par avis ; en moyenne sur les candidats connus du bloc, puis sur la suite. À l'ouverture d'une ligne
 * seulement, jamais pour une ligne fermée.
 */
export function weighOf(pack: ElectionPack, answers: Answers, u: UnitReading, opts: Pick<ReadOptions, 'without'> = {}): Weigh[] {
  if (u.status !== 'lecture') return []
  const prep = prepare(pack)
  const members = membersOf(prep, opts)
  const NP = prep.ids.length
  const qs = u.questions.map(id => prep.qIndex.get(id)!)
  const vec = qs.map(qi => vectorOf(prep.questions[qi]!, answers[prep.questions[qi]!.id]!))
  const score = (qi: number, r: Int8Array) => {
    const o = new Float64Array(NP)
    scoreInto(prep, qi, r, o)
    return o
  }
  const obs = qs.map((qi, j) => score(qi, vec[j]!))
  // Les questions rangées par thème, comme readUnit (chaque thème pèse un dans une famille)
  const topicOf = new Map<TopicId, number[]>()
  qs.forEach((qi, j) => {
    const t = prep.questions[qi]!.topicId
    const list = topicOf.get(t)
    if (list) list.push(j)
    else topicOf.set(t, [j])
  })
  const byTopic = [...topicOf.values()]
  const aff = new Float64Array(NP)
  const S = new Float64Array(members.length)
  const blocs = (scores: readonly Float64Array[]) => {
    affinityInto(scores, byTopic, aff)
    blocMeansInto(aff, members, S)
  }
  blocs(obs)
  // L'affinité observée de chaque candidat (NaN : inconnu sur l'unité) et de chaque bloc
  const aff0 = Float64Array.from(aff)
  const S0 = Float64Array.from(S)
  const isKnown = (c: number) => aff0[c] === aff0[c]
  // Par question, par bloc : l'affinité observée moins sa moyenne sur les façons de poser les avis de cette question
  const partOf = qs.map((qi, j) => {
    const sc = obs.slice()
    const sum = new Float64Array(S.length)
    const n = new Float64Array(S.length)
    for (const a of arrangements(vec[j]!)) {
      sc[j] = score(qi, a)
      blocs(sc)
      S.forEach((x, b) => {
        if (x === x) {
          sum[b]! += x
          n[b]!++
        }
      })
    }
    return Float64Array.from(S0, (x, b) => x - sum[b]! / n[b]!)
  })
  return segments(u.near).map(seg => {
    const mean = (f: (b: number) => number) => seg.reduce((s, b) => s + f(b), 0) / seg.length
    const gap = mean(b => u.cells[b]!.affinity! - u.cells[b]!.chance!)
    const parts = partOf.map(p => mean(b => p[b]!))
    const w: Weigh = { seg, gap, parts, rest: gap - parts.reduce((s, x) => s + x, 0), question: null, shares: [], approach: null, view: 0, known: 0, main: 0, compatible: 0, rejects: 0, others: false, suite: null, alsoBlocs: [], alsoCount: 0 }
    const j = firstMax(parts)
    if (j < 0) return w
    const qi = qs[j]!
    const r = vec[j]!
    const V = prep.V[qi]!
    const DEN = prep.DEN[qi]!
    const q = prep.questions[qi]!
    const onQ = obs[j]!
    const own = byTopic.find(js => js.includes(j))!
    w.question = q.id
    // Le poids de la question dans l'affinité d'un candidat connu sur elle : 100 / (T × n), T thèmes où il est connu, n
    // questions de ce thème où il l'est (affinityInto)
    const weight = (c: number) => (onQ[c] === onQ[c] ? 100 / (byTopic.filter(js => js.some(i => obs[i]![c] === obs[i]![c])).length * own.filter(i => obs[i]![c] === obs[i]![c]).length) : 0)
    const shares = Array.from(r, (x, a) =>
      x
        ? mean(b => {
            const K = members[b]!.filter(isKnown)
            let t = 0
            for (const c of K) {
              const v = V[c]!
              if (DEN[c]) t += (weight(c) * (v[a]! - v.reduce((y, z) => y + z, 0) / v.length) * x) / (2 * DEN[c]!)
            }
            return t / K.length
          })
        : 0,
    )
    w.shares = shares
    const a = firstMax(shares)
    if (a < 0) return w
    const id = q.approaches[a]!.id
    const cands = seg.flatMap(b => members[b]!.filter(isKnown))
    w.approach = id
    w.view = r[a]! > 0 ? 1 : -1
    w.known = cands.length
    for (const c of cands) {
      const v = V[c]![a]!
      if (v === 2) w.main++
      else if (v === 1) w.compatible++
      else if (v < 0) w.rejects++
    }
    w.others = cands.every(c => V[c]!.some((v, i) => i !== a && v > 0))
    // « Aucun ne porte » : pas même une position de confiance basse, que le calcul ne compte pas
    const carried = cands.some(c => (pack.positions[prep.ids[c]!]?.[id]?.weight ?? 0) > 0)
    w.suite = w.view > 0 ? (w.main ? 'principale' : w.compatible ? 'compatible' : null) : w.rejects ? 'rejet' : carried ? null : 'aucun'
    const also = prep.MAIN[qi]![a]!.filter(c => !seg.includes(prep.blocIndex[c]!) && members[prep.blocIndex[c]!]!.includes(c))
    w.alsoBlocs = [...new Set(also.map(c => prep.blocIndex[c]!))].sort((x, y) => x - y)
    w.alsoCount = also.length
    return w
  })
}

