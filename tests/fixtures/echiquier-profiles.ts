// Les profils de la calibration de « Mon profil politique » (core/echiquier.ts) et leurs comptes, partagés par
// tests/echiquier-calibration.test.ts et tools/audit-echiquier.mjs : clones des candidats classés (larges, stricts,
// bruités, questionnaire rapide seul), réponses tirées au hasard selon six schémas, et ce que l'on en mesure.
import type { Echiquier } from '../../src/core/echiquier'
import { panelOf } from '../../src/core/echiquier'
import { hashString, mulberry32 } from '../../src/core/rng'
import { effectiveWeight, stance } from '../../src/core/score'
import type { Answers, ElectionPack, Question } from '../../src/core/types'

export type Vector = number[] | null
export type Scheme = 'audit' | 'uniforme' | 'un-choix' | 'un-choix-doux' | 'accord-seul' | 'tout-sauf-un'
export const SCHEMES: Scheme[] = ['audit', 'uniforme', 'un-choix', 'un-choix-doux', 'accord-seul', 'tout-sauf-un']
export const isQuick = (q: Question) => q.tier === 'essentiel'

/** Comptes d'une série de lectures, pour un bloc vrai (clones) ou sans (hasard) */
export interface Tally {
  themes: number
  read: number
  hit: number
  sole: number
  wrong: number
  trueFar: number
  families: number
  famRead: number
  famHit: number
  answered: number
  cover: number
  items: number
  profiles: number
  /** Les ▲ des thèmes lus, par bloc */
  share: number[]
  /** Les éléments de la synthèse, par bloc ▲ (ce que la personne voit d'abord) */
  summaryShare: number[]
}

export const pct = (a: number, b: number) => (b ? (100 * a) / b : 0)

export function profilesFor(pack: ElectionPack) {
  const Q = pack.bank.questions
  const panel = panelOf(pack)
  const ranked = panel.flat()
  const blocOf = (id: string) => panel.findIndex(ids => ids.includes(id))
  const CENTER = (panel.length - 1) / 2

  const toAnswers = (vectors: Map<string, Vector>): Answers => {
    const out: Answers = {}
    for (const q of Q) {
      const v = vectors.get(q.id)
      if (!v) continue
      const ratings: Record<string, -1 | 1> = {}
      q.approaches.forEach((a, i) => {
        if (v[i] === 1 || v[i] === -1) ratings[a.id] = v[i] as -1 | 1
      })
      if (Object.keys(ratings).length) out[q.id] = { ratings, redLines: [] }
    }
    return out
  }

  /** Clone large : d'accord avec tout ce qu'il porte (principal ou compatible), pas d'accord avec le reste, partout où il est connu */
  function cloneLarge(id: string, only?: (q: Question) => boolean): Map<string, Vector> {
    const out = new Map<string, Vector>()
    for (const q of Q) {
      if (only && !only(q)) continue
      const st = q.approaches.map(a => stance(pack.positions[id]?.[a.id]))
      if (st.some(x => x !== 0)) out.set(q.id, st.map(x => (x > 0 ? 1 : -1)))
    }
    return out
  }
  /** Clone strict : d'accord avec ses approches principales seulement, pas d'accord avec le reste */
  function cloneStrict(id: string, only?: (q: Question) => boolean): Map<string, Vector> {
    const out = new Map<string, Vector>()
    for (const q of Q) {
      if (only && !only(q)) continue
      const main = q.approaches.map(a => effectiveWeight(pack.positions[id]?.[a.id]) === 2)
      if (main.some(Boolean)) out.set(q.id, main.map(x => (x ? 1 : -1)))
    }
    return out
  }
  /** Clone bruité : 30 % des questions passées, puis 15 % des avis effacés et 10 % inversés */
  function noisy(base: Map<string, Vector>, seed: string): Map<string, Vector> {
    const rand = mulberry32(hashString(seed))
    const out = new Map<string, Vector>()
    for (const q of Q) {
      const v = base.get(q.id)
      if (!v) continue
      if (rand() < 0.3) continue
      const o = v.map(x => {
        const u = rand()
        return u < 0.15 ? 0 : u < 0.25 ? -x : x
      })
      if (o.some(x => x !== 0)) out.set(q.id, o)
    }
    return out
  }
  /** Réponses tirées au hasard : un quart d'accord et un quart de désaccord (audit), un tiers de chaque (uniforme), un seul
   *  accord par question et des désaccords ailleurs (un-choix), un seul accord et rien d'autre (un-choix-doux), des
   *  accords seuls (30 %), ou tout sauf un */
  function randomProfile(seed: string, scheme: Scheme, only?: (q: Question) => boolean): Map<string, Vector> {
    const rand = mulberry32(hashString(seed))
    const out = new Map<string, Vector>()
    for (const q of Q) {
      if (only && !only(q)) continue
      const n = q.approaches.length
      let o: number[]
      if (scheme === 'audit')
        o = Array.from({ length: n }, () => {
          const r = rand()
          return r < 0.25 ? 1 : r < 0.5 ? -1 : 0
        })
      else if (scheme === 'uniforme') o = Array.from({ length: n }, () => Math.floor(rand() * 3) - 1)
      else if (scheme === 'un-choix') {
        const k = Math.floor(rand() * n)
        o = Array.from({ length: n }, (_, i) => (i === k ? 1 : -1))
      } else if (scheme === 'un-choix-doux') {
        const k = Math.floor(rand() * n)
        o = Array.from({ length: n }, (_, i) => (i === k ? 1 : 0))
      } else if (scheme === 'accord-seul') o = Array.from({ length: n }, () => (rand() < 0.3 ? 1 : 0))
      else {
        const k = Math.floor(rand() * n)
        o = Array.from({ length: n }, (_, i) => (i === k ? -1 : 1))
      }
      if (o.some(x => x !== 0)) out.set(q.id, o)
    }
    return out
  }
  /** Deux candidats : le second sur les thèmes donnés, le premier ailleurs */
  function compose(a: string, b: string, topics: Set<string>, only?: (q: Question) => boolean): Answers {
    const ra = cloneLarge(a, only)
    const rb = cloneLarge(b, only)
    return toAnswers(new Map(Q.map(q => [q.id, (topics.has(q.topicId) ? rb.get(q.id) : ra.get(q.id)) ?? null])))
  }

  const tally = (): Tally => ({
    themes: 0,
    read: 0,
    hit: 0,
    sole: 0,
    wrong: 0,
    trueFar: 0,
    families: 0,
    famRead: 0,
    famHit: 0,
    answered: 0,
    cover: 0,
    items: 0,
    profiles: 0,
    share: panel.map(() => 0),
    summaryShare: panel.map(() => 0),
  })
  /** Un ▲ de l'autre côté du centre que le bloc vrai */
  const wrongSide = (near: number[], t: number) => t !== CENTER && near.some(b => (b - CENTER) * (t - CENTER) < 0)
  function count(acc: Tally, e: Echiquier, t: number | null): void {
    acc.profiles++
    for (const u of e.themes) {
      acc.themes++
      if (t !== null && u.far.includes(t)) acc.trueFar++
      if (u.status !== 'lecture') continue
      acc.read++
      u.near.forEach(b => acc.share[b]!++)
      if (t === null) continue
      if (u.near.includes(t)) acc.hit++
      if (u.near.length === 1 && u.near[0] === t) acc.sole++
      if (wrongSide(u.near, t)) acc.wrong++
    }
    for (const f of e.families) {
      acc.families++
      if (f.status !== 'lecture') continue
      acc.famRead++
      if (t !== null && f.near.includes(t)) acc.famHit++
    }
    acc.answered += e.themes.length
    for (const g of e.summary) {
      acc.items += g.items.length
      g.near.forEach(b => (acc.summaryShare[b]! += g.items.length))
      if (t === null || !g.near.includes(t)) continue
      for (const it of g.items) acc.cover += it.kind === 'theme' ? 1 : (e.families.find(f => f.id === it.id)?.topicIds.length ?? 0)
    }
  }
  return { panel, ranked, blocOf, CENTER, toAnswers, cloneLarge, cloneStrict, noisy, randomProfile, compose, tally, count }
}
