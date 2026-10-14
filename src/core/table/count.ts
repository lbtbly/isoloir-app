// « À table » : le dépouillement d'une table, en fonctions pures et sans IA. Chaque personne vote en secret sur la
// réglette du site (pas d'accord, sans avis, d'accord, et la ligne rouge, toujours « pas d'accord ») ; son bulletin
// est ajouté aux totaux puis oublié : seuls des compteurs restent, jamais un bulletin.
// Secret à petit effectif : sur chaque question, « la table », ce sont les bulletins exprimés (une question passée
// ne compte pas). Rien n'est montré d'une question qui en a moins de K_MIN, et aucun nombre exact n'est écrit aux
// deux bouts (0, 1, n − 1, n) : « personne ou presque », « toute la table ou presque ». Les règles sont publiées
// sur la page de la table (copy.ts) ; les seuils restent à confirmer par la simulation et l'essai réel.

import { hasOpinion, ratingOf } from '../answers'
import { seededShuffle } from '../rng'
import type { Answer, ApproachId, Question, QuestionId } from '../types'

/** Taille d'une table : dès 3 (demande du propriétaire, 14/10/2026) ; à 3, le secret est plus fragile, et la page le dit */
export const MIN_PEOPLE = 3
export const MAX_PEOPLE = 12
/** Bulletins exprimés au moins sur une question pour qu'elle soit dépouillée */
export const K_MIN = 3

/** Les avis d'une table sur une idée */
export interface Tallies {
  agree: number
  neutral: number
  disagree: number
  /** Dont lignes rouges (toujours comptées aussi en « pas d'accord ») */
  redLines: number
}

export interface QuestionTotals {
  /** Bulletins qui donnent un avis sur la question */
  expressed: number
  /** Bulletins qui la passent (aucun avis) */
  passed: number
  byApproach: Record<ApproachId, Tallies>
}

export type Totals = Record<QuestionId, QuestionTotals>

/** Un bulletin : la réponse de chacun aux questions de la table, le temps de l'ajouter aux totaux */
export type TableBallot = Record<QuestionId, Answer | undefined>

export function emptyTotals(questions: readonly Question[]): Totals {
  return Object.fromEntries(
    questions.map(q => [
      q.id,
      { expressed: 0, passed: 0, byApproach: Object.fromEntries(q.approaches.map(a => [a.id, { agree: 0, neutral: 0, disagree: 0, redLines: 0 }])) },
    ]),
  )
}

/** Ajoute un bulletin aux totaux et renvoie de nouveaux totaux : le bulletin n'y est plus lisible */
export function addBallot(totals: Totals, questions: readonly Question[], ballot: TableBallot): Totals {
  const next: Totals = {}
  for (const q of questions) {
    const prev = totals[q.id] ?? emptyTotals([q])[q.id]!
    const answer = ballot[q.id]
    if (!answer || answer.skipped || !hasOpinion(answer)) {
      next[q.id] = { ...prev, passed: prev.passed + 1 }
      continue
    }
    const byApproach: Record<ApproachId, Tallies> = {}
    for (const a of q.approaches) {
      const t = prev.byApproach[a.id] ?? { agree: 0, neutral: 0, disagree: 0, redLines: 0 }
      const r = ratingOf(answer, a.id)
      byApproach[a.id] = {
        agree: t.agree + (r === 1 ? 1 : 0),
        neutral: t.neutral + (r === 0 ? 1 : 0),
        disagree: t.disagree + (r === -1 ? 1 : 0),
        redLines: t.redLines + (answer.redLines.includes(a.id) ? 1 : 0),
      }
    }
    next[q.id] = { expressed: prev.expressed + 1, passed: prev.passed, byApproach }
  }
  return next
}

/** Ce que la table pense d'une idée */
export type Verdict = 'reunit' | 'refuse' | 'divise' | 'aucun'

/**
 * Le verdict d'une idée, n bulletins exprimés :
 * - vous réunit : plus de la moitié d'accord, au plus une personne pas d'accord ;
 * - la table refuse : plus de la moitié pas d'accord, au plus une personne d'accord ;
 * - vous divise : au moins deux d'accord et au moins deux pas d'accord ;
 * - sinon, pas d'avis net.
 */
export function verdictOf(t: Tallies, n: number): Verdict {
  if (2 * t.agree > n && t.disagree <= 1) return 'reunit'
  if (2 * t.disagree > n && t.agree <= 1) return 'refuse'
  if (t.agree >= 2 && t.disagree >= 2) return 'divise'
  return 'aucun'
}

/** Un compte tel qu'il peut être montré : exact au milieu, en mots aux deux bouts */
export type Shown = { exact: number } | { words: 'peu' | 'presque-tous' }

/** Exact seulement de 2 à n − 2 ; 0 et 1 deviennent « personne ou presque », n − 1 et n « toute la table ou presque » */
export function shown(count: number, n: number): Shown {
  if (count <= 1) return { words: 'peu' }
  if (count >= n - 1) return { words: 'presque-tous' }
  return { exact: count }
}

/** La valeur d'un compte montré, pour comparer : les mots valent leur borne commune */
const level = (v: Shown, n: number): number => ('exact' in v ? v.exact : v.words === 'peu' ? 1 : n - 1)

/** Une idée dépouillée */
export interface IdeaResult {
  questionId: QuestionId
  approachId: ApproachId
  verdict: Verdict
  /** Bulletins exprimés sur sa question : la table, pour cette idée */
  n: number
  agree: Shown
  neutral: Shown
  disagree: Shown
  redLines: Shown
  /** Pour l'ordre de lecture seulement, jamais montré */
  strength: number
}

/** Le dépouillement d'une table */
export interface TableSummary {
  /** Les idées à lire, dans l'ordre de lecture : ce qui réunit, ce que la table refuse, ce qui divise */
  ideas: IdeaResult[]
  /** Les idées sans avis net, par question (montrées au récapitulatif seulement) */
  quiet: IdeaResult[]
  /** Questions non dépouillées : moins de K_MIN bulletins exprimés */
  hidden: QuestionId[]
}

const ORDER: Verdict[] = ['reunit', 'refuse', 'divise']

/**
 * Le dépouillement : chaque idée des questions assez votées, avec son verdict, rangée pour la lecture à voix haute
 * (les plus nettes d'abord dans chaque verdict ; égalités départagées par la graine de la séance, jamais par l'ordre
 * de la banque)
 */
export function summarize(totals: Totals, questions: readonly Question[], seed: string): TableSummary {
  const all: IdeaResult[] = []
  const hidden: QuestionId[] = []
  // Les questions aussi dans un ordre tiré avec la graine : à force égale, aucune idée ne passe devant une autre parce que
  // sa question vient d'abord dans la banque
  for (const q of seededShuffle(questions, `${seed}:questions`)) {
    const t = totals[q.id]
    if (!t || t.expressed < K_MIN) {
      hidden.push(q.id)
      continue
    }
    const n = t.expressed
    for (const a of seededShuffle(q.approaches, `${seed}:depouillement:${q.id}`)) {
      const c = t.byApproach[a.id]!
      const verdict = verdictOf(c, n)
      // La force se lit sur les comptes tels qu'ils sont montrés : l'ordre de lecture ne doit pas trahir ce que les
      // mots cachent (une idée unanime ne passe pas devant une idée « toute la table ou presque »)
      const s = (x: number) => level(shown(x, n), n)
      const strength = verdict === 'reunit' ? s(c.agree) : verdict === 'refuse' ? s(c.disagree) : verdict === 'divise' ? Math.min(s(c.agree), s(c.disagree)) : 0
      all.push({
        questionId: q.id,
        approachId: a.id,
        verdict,
        n,
        agree: shown(c.agree, n),
        neutral: shown(c.neutral, n),
        disagree: shown(c.disagree, n),
        redLines: shown(c.redLines, n),
        strength: strength / n,
      })
    }
  }
  // Tri stable : à force égale, l'ordre tiré au hasard ci-dessus reste
  const ideas = ORDER.flatMap(v => all.filter(i => i.verdict === v).sort((x, y) => y.strength - x.strength))
  return { ideas, quiet: all.filter(i => i.verdict === 'aucun'), hidden }
}
