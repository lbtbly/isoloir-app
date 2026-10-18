// « Faire les comptes » : l'amorce du budget à partir des réponses, sans IA et sans hasard (mêmes réponses, même amorce).
// Règles du plan du 17 octobre 2026 (budget-decisions.json) :
// - seule une approche « d'accord » (+1) qui n'est pas une ligne rouge amorce quelque chose ; « pas d'accord », « sans
//   avis », lignes rouges et poids des thèmes ne créent rien et n'inversent rien ;
// - deux approches d'accord qui s'excluent forment une idée « à trancher » : l'amorce ne choisit jamais à la place de la
//   personne ;
// - un même réglage venu de plusieurs questions ne compte qu'une fois ;
// - rien n'est écrit dans les réponses.
import type { Answers, ApproachId, Question, QuestionId } from '../types'
import type { BudgetEntry, BudgetMap, Direction } from './types'

export interface SeedLine {
  /** Clé du réglage : un même réglage venu de deux questions n'est qu'une ligne */
  key: string
  lever: string | null
  setting: string | null
  approachIds: ApproachId[]
  entry: BudgetEntry
}
export interface OpenLever {
  key: string
  lever: string
  direction: Direction | null
  approachIds: ApproachId[]
}
export interface Conflict {
  questionId: QuestionId | null
  lever: string | null
  approachIds: ApproachId[]
}
export interface Seed {
  /** Idées dont la recherche a trouvé un chiffrage éligible */
  priced: SeedLine[]
  /** Leviers à régler : l'idée donne le sens, la personne choisit la taille */
  open: OpenLever[]
  /** Idées sans chiffre, chacune avec sa raison dans la carte */
  unpriced: SeedLine[]
  /** Idées à trancher */
  conflicts: Conflict[]
}

/** Le sens qu'une idée à régler donne à son levier */
export function directionOf(e: BudgetEntry): Direction | null {
  if (e.setting === '+' || e.setting === '-') return e.setting
  if (e.sign === 'recette+' || e.sign === 'depense+') return '+'
  if (e.sign === 'recette-' || e.sign === 'depense-') return '-'
  return null
}

/** Les approches d'accord d'une question, hors lignes rouges */
function agreed(q: Question, answers: Answers): ApproachId[] {
  const a = answers[q.id]
  if (!a) return []
  const red = new Set(a.redLines)
  return q.approaches.filter(x => a.ratings[x.id] === 1 && !red.has(x.id)).map(x => x.id)
}

/** Groupes d'approches d'accord reliées par « s'exclut avec » (dans un sens ou dans l'autre) */
function exclusiveGroups(ids: ApproachId[], map: BudgetMap): ApproachId[][] {
  const set = new Set(ids)
  const parent = new Map(ids.map(id => [id, id]))
  const find = (x: ApproachId): ApproachId => {
    let r = x
    while (parent.get(r) !== r) r = parent.get(r)!
    return r
  }
  for (const id of ids) for (const other of map[id]?.excludes ?? []) if (set.has(other)) parent.set(find(id), find(other))
  const groups = new Map<ApproachId, ApproachId[]>()
  for (const id of ids) {
    const r = find(id)
    groups.set(r, [...(groups.get(r) ?? []), id])
  }
  return [...groups.values()].filter(g => g.length > 1)
}

export interface SeedOptions {
  /** Version « À régler » (décision du 17 octobre 2026) : une idée chiffrable oriente aussi son levier, aucune ligne
   *  d'idée chiffrée n'est posée */
  directionsOnly?: boolean
}

export function seedBudget(questions: readonly Question[], answers: Answers, map: BudgetMap, options: SeedOptions = {}): Seed {
  const priced = new Map<string, SeedLine>()
  const unpriced = new Map<string, SeedLine>()
  const open = new Map<string, OpenLever>()
  const conflicts: Conflict[] = []

  const addLine = (into: Map<string, SeedLine>, id: ApproachId, e: BudgetEntry) => {
    const key = e.lever ? `${e.lever}|${e.setting ?? ''}` : id
    const line = into.get(key)
    if (line) line.approachIds.push(id)
    else into.set(key, { key, lever: e.lever, setting: e.setting, approachIds: [id], entry: e })
  }

  for (const q of questions) {
    const ids = agreed(q, answers).filter(id => map[id] && map[id].status !== 'sans-effet')
    const groups = exclusiveGroups(ids, map)
    const inConflict = new Set(groups.flat())
    for (const g of groups) conflicts.push({ questionId: q.id, lever: map[g[0]!]?.lever ?? null, approachIds: g })
    for (const id of ids) {
      if (inConflict.has(id)) continue
      const e = map[id]!
      if (e.status === 'chiffrable' && !options.directionsOnly) addLine(priced, id, e)
      else if (e.status === 'non-chiffre' || !e.lever) addLine(unpriced, id, e)
      else {
        const direction = directionOf(e)
        const key = `${e.lever}|${direction ?? '?'}`
        const o = open.get(key)
        if (o) o.approachIds.push(id)
        else open.set(key, { key, lever: e.lever, direction, approachIds: [id] })
      }
    }
  }

  // Un levier à régler que les réponses poussent dans les deux sens (deux questions) est aussi à trancher
  const byLever = new Map<string, OpenLever[]>()
  for (const o of open.values()) byLever.set(o.lever, [...(byLever.get(o.lever) ?? []), o])
  for (const [lever, list] of byLever) {
    const dirs = new Set(list.map(o => o.direction).filter(Boolean))
    if (dirs.size < 2) continue
    conflicts.push({ questionId: null, lever, approachIds: list.flatMap(o => o.approachIds) })
    for (const o of list) open.delete(o.key)
  }

  return { priced: [...priced.values()], open: [...open.values()], unpriced: [...unpriced.values()], conflicts }
}
