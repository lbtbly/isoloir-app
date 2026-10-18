// « Faire les comptes » : le calcul, sur l'appareil, sans IA. Chaque levier a un effet en fourchette (les sources ne
// s'accordent pas) ; le total ajoute les bas d'un côté et les hauts de l'autre, et le déficit se lit en fourchette.
// Conventions (research/presidentielle-2027/budget-decisions.json) : 2027 en année pleine, ensemble des administrations
// publiques, point de départ le PLF 2027 déposé ; aucun cran au-delà de ce que chiffre la source.
import type { Family, Lever } from './types'

/** Le réglage d'un levier : des unités (levier linéaire) ou l'identifiant d'un réglage (levier à réglages) */
export type Setting = number | string
export type Settings = Readonly<Record<string, Setting>>

export interface Range {
  lo: number
  hi: number
}

const ZERO: Range = { lo: 0, hi: 0 }
const sorted = (a: number, b: number): Range => (a <= b ? { lo: a, hi: b } : { lo: b, hi: a })

/** Le réglage est-il celui du PLF ? */
export function isBase(lever: Lever, value: Setting | undefined): boolean {
  if (value === undefined) return true
  if (lever.kind === 'options') return typeof value !== 'string' || !!lever.options?.find(o => o.id === value)?.base
  return typeof value !== 'number' || Math.abs(value) < 1e-9
}

/** Le changement dans le sens du levier (Md€ de recettes ou de dépenses en plus si positif) */
export function leverChange(lever: Lever, value: Setting | undefined): Range {
  if (isBase(lever, value)) return ZERO
  if (lever.kind === 'options') {
    const o = lever.options?.find(x => x.id === value)
    return o ? sorted(o.lo, o.hi) : ZERO
  }
  const v = value as number
  const pu = v < 0 && lever.perUnitDown ? lever.perUnitDown : lever.perUnit
  return sorted(v * pu.lo, v * pu.hi)
}

/** L'effet sur le solde public (Md€) : positif, le déficit baisse */
export function balanceEffect(lever: Lever, value: Setting | undefined): Range {
  const c = leverChange(lever, value)
  return lever.direction === 'recette' ? c : sorted(-c.hi, -c.lo)
}

export interface Totals {
  /** Effet sur le solde, toutes familles */
  all: Range
  byFamily: Record<Family, Range>
  /** Leviers réglés (hors PLF) */
  count: number
}

export function totals(levers: readonly Lever[], settings: Settings): Totals {
  const byFamily: Record<Family, Range> = { impots: { ...ZERO }, depenses: { ...ZERO }, sociale: { ...ZERO } }
  const all = { ...ZERO }
  let count = 0
  for (const l of levers) {
    const v = settings[l.id]
    if (isBase(l, v)) continue
    const e = balanceEffect(l, v)
    count++
    all.lo += e.lo
    all.hi += e.hi
    byFamily[l.family].lo += e.lo
    byFamily[l.family].hi += e.hi
  }
  return { all, byFamily, count }
}

/** Le changement par famille, dans le sens des recettes (impôts) ou des dépenses (les deux autres familles) */
export function familyChange(levers: readonly Lever[], settings: Settings, family: Family): Range {
  let lo = 0
  let hi = 0
  for (const l of levers) {
    if (l.family !== family || isBase(l, settings[l.id])) continue
    const e = balanceEffect(l, settings[l.id])
    lo += e.lo
    hi += e.hi
  }
  // Les impôts se disent en recettes (même signe que le solde) ; les dépenses en dépenses (signe contraire)
  return family === 'impots' ? { lo, hi } : sorted(-hi, -lo)
}

export interface Baseline {
  /** Déficit prévu, en % du PIB */
  deficitPct: number
  /** PIB 2027, Md€ */
  gdp: number
}

/** Le déficit 2027 en % du PIB, en fourchette : le plus haut quand l'effet est le plus faible */
export function deficitRange(base: Baseline, effect: Range): Range {
  const md = (base.deficitPct * base.gdp) / 100
  return { lo: ((md - effect.hi) / base.gdp) * 100, hi: ((md - effect.lo) / base.gdp) * 100 }
}

/** L'objectif : un déficit en % du PIB, ou aucun */
export type Goal = number | null

export type GoalState = 'none' | 'reached' | 'partly' | 'missing'

/** Ce qui manque pour l'objectif (Md€), en fourchette, et son état : atteint selon toutes les sources, une partie, aucune */
export function goalGap(base: Baseline, effect: Range, goal: Goal): { state: GoalState; missing: Range } {
  if (goal === null) return { state: 'none', missing: ZERO }
  const need = ((base.deficitPct - goal) * base.gdp) / 100
  const missing = { lo: need - effect.hi, hi: need - effect.lo }
  const state: GoalState = missing.hi <= 0 ? 'reached' : missing.lo <= 0 ? 'partly' : 'missing'
  return { state, missing }
}

/** Ramène une valeur dans la plage du levier, au pas du curseur */
export function clampValue(lever: Lever, value: number): number {
  const v = Math.max(-lever.max, Math.min(lever.max, value))
  const steps = Math.round(v / lever.step)
  // Arrondi au pas, sans laisser de queue flottante (0,30000000000000004)
  return Number((steps * lever.step).toFixed(6))
}

/**
 * Règle un levier. Un levier qui porte sur la même base qu'un autre déjà réglé (TVA, tous les taux, et TVA, taux normal)
 * remet l'autre au PLF : les régler ensemble compterait deux fois. Renvoie les réglages et les leviers ainsi remis.
 */
export function applySetting(levers: readonly Lever[], settings: Settings, id: string, value: Setting): { settings: Record<string, Setting>; reset: string[] } {
  const lever = levers.find(l => l.id === id)
  if (!lever) return { settings: { ...settings }, reset: [] }
  const next: Record<string, Setting> = { ...settings }
  const v = lever.kind === 'linear' && typeof value === 'number' ? clampValue(lever, value) : value
  const reset: string[] = []
  if (isBase(lever, v)) delete next[id]
  else {
    next[id] = v
    for (const other of lever.exclusiveWith) {
      const o = levers.find(l => l.id === other)
      if (o && !isBase(o, next[other])) {
        delete next[other]
        reset.push(other)
      }
    }
  }
  return { settings: next, reset }
}

/** Le plus grand effet qu'un levier peut atteindre dans sa plage, sur le bas de sa fourchette */
export function reach(lever: Lever): number {
  if (lever.kind === 'options') return Math.max(0, ...(lever.options ?? []).map(o => Math.min(Math.abs(o.lo), Math.abs(o.hi))))
  return lever.max * Math.min(lever.perUnit.lo, lever.perUnit.hi)
}

/** La taille de la ligne du budget sur laquelle joue un levier (Md€), ou 0 quand aucune n'est publiée */
export const lineSize = (lever: Lever): number => lever.base?.value ?? 0

/**
 * Les leviers d'une famille dans l'ordre du rayon : de la plus grosse ligne du budget à la plus petite (règle du
 * 18 octobre 2026 après la revue : « les 3 plus gros », au sens propre), puis, sans ligne publiée, du plus grand effet
 * atteignable au plus petit, puis par nom
 */
export function familyOrder(levers: readonly Lever[], family: Family): Lever[] {
  return levers
    .filter(l => l.family === family)
    .sort((a, b) => lineSize(b) - lineSize(a) || reach(b) - reach(a) || a.label.localeCompare(b.label, 'fr'))
}

/** Deux leviers sur la même ligne publiée (même montant, même source) : la TVA à tous les taux et au taux normal */
export const sameLine = (a: Lever, b: Lever): boolean => !!a.base && !!b.base && a.base.value === b.base.value && a.base.source.url === b.base.source.url

/**
 * Les n premiers d'un rayon, trois lignes distinctes : un levier qui recoupe un levier déjà retenu, ou joue sur la même
 * ligne, laisse la place au suivant
 */
export function topOfFamily(levers: readonly Lever[], family: Family, n = 3): Lever[] {
  const out: Lever[] = []
  for (const l of familyOrder(levers, family)) {
    if (out.length >= n) break
    if (out.some(o => o.exclusiveWith.includes(l.id) || l.exclusiveWith.includes(o.id) || sameLine(o, l))) continue
    out.push(l)
  }
  return out
}
