// « Faire les comptes » : les types de la carte des approches vers les leviers du budget. La carte est produite par la
// recherche (research/presidentielle-2027/budget-map*.json, conventions dans budget-decisions.json) ; rien ici n'est
// écrit à la main ni calculé par une IA sur l'appareil.
import type { ApproachId } from '../types'

/** Ce que l'on peut dire d'une approche, au regard des règles strictes de budget-decisions.json */
export type BudgetStatus = 'chiffrable' | 'a-regler' | 'non-chiffre' | 'sans-effet'
/** Effet sur le déficit public si l'approche était appliquée */
export type DeficitEffect = 'creuse' | 'reduit' | 'les-deux' | 'aucun' | 'incertain'
export type BudgetSign = 'depense+' | 'depense-' | 'recette+' | 'recette-' | 'mixte' | 'aucun' | 'incertain'
export type LeverKind = 'exclusif' | 'cumulable' | 'reglable'

export interface BudgetEntry {
  status: BudgetStatus
  /** Identifiant d'un levier du catalogue, d'un groupe (« groupe:… ») ou d'un levier propre à l'approche */
  lever: string | null
  /** Réglage énoncé par l'approche (« 62 ans », « + », « - », « suppression ») */
  setting: string | null
  deficit: DeficitEffect
  sign: BudgetSign
  kind: LeverKind | null
  /** Approches de la même question qui règlent le même levier autrement */
  excludes: ApproachId[]
}

export type BudgetMap = Record<ApproachId, BudgetEntry>

/** Sens d'un levier à régler : monter ou baisser le levier lui-même (le taux, la dépense…) */
export type Direction = '+' | '-'

// ——— L'établi (décision du 17 octobre 2026) : les leviers sourcés que la personne règle ———

/** Les trois familles de leviers, dans l'ordre des rayons */
export type Family = 'impots' | 'depenses' | 'sociale'

/** Une source d'un levier, telle que l'affiche sa fiche (la citation reste dans la recherche) */
export interface LeverSource {
  title: string
  publisher: string
  url: string
  /** Date de publication (AAAA, AAAA-MM ou AAAA-MM-JJ) */
  date: string
  /** « Consulté le », AAAA-MM-JJ */
  accessedAt: string
  /** Le chiffre publié, en clair */
  figure: string
}

/** Un réglage d'un levier à crans distincts (âge de départ…), son effet de 2027 dans le sens du levier */
export interface LeverOption {
  id: string
  label: string
  /** Md€ en 2027, dans le sens du levier (dépense ou recette en plus si positif) */
  lo: number
  hi: number
  /** Le réglage du PLF : le point de départ, sans effet */
  base?: true
  note?: string
}

export interface Lever {
  id: string
  family: Family
  /** Nom court de la fiche */
  label: string
  /** Le réglage du PLF 2027, en clair */
  today: string
  /** « linear » : unités × effet par unité ; « options » : des réglages distincts */
  kind: 'linear' | 'options'
  /** Monter le levier fait monter une recette ou une dépense */
  direction: 'recette' | 'depense'
  unit: { label: string; short: string }
  /** Md€ par unité en 2027, sur l'ensemble des administrations publiques : la fourchette des sources */
  perUnit: { lo: number; hi: number }
  /** Md€ par unité à la baisse, quand les sources la chiffrent autrement que la hausse */
  perUnitDown?: { lo: number; hi: number }
  /** La taille de la ligne du budget sur laquelle joue le levier (Md€), publiée : elle range les « 3 plus gros » */
  base?: { value: number; label: string; source: LeverSource }
  /** La plage, symétrique autour du PLF : de −max à +max unités, jamais au-delà de ce que chiffre la source */
  max: number
  /** Le pas du curseur, en unités */
  step: number
  /** Les crans en boutons, en unités, 0 compris */
  notches: number[]
  /** Le mot du cran 0 (« 20 % », « PLF ») */
  baseLabel: string
  options?: LeverOption[]
  /** Le montant compté (Md€) : celui d'une enveloppe du PLF, ou d'une prévision ; « lo » quand la source donne une fourchette */
  amount?: { value: number; lo?: number; label: string }
  /** Leviers qui portent sur la même base : les régler ensemble compterait deux fois */
  exclusiveWith: string[]
  /** Leviers qui le recoupent en partie (la paie publique et les crédits d'une mission) : ils se règlent ensemble, la fiche prévient */
  overlapsWith?: string[]
  /** Ligne de l'État versée à un organisme public : l'effet suppose qu'il réduise d'autant sa dépense */
  operatorCaveat: boolean
  /** Ce qui ne joue qu'après 2027 */
  laterNote?: string
  /** Ce que le chiffre ne compte pas */
  limits: string
  sources: LeverSource[]
}

export interface BudgetData {
  /** Version des données du jeu, à part de celle de l'élection (pas de bannière « données mises à jour ») */
  version: string
  /** Le point de départ : le PLF 2027 tel que déposé */
  baseline: { label: string; deficitPct: number; gdp: number; source: LeverSource }
  levers: Lever[]
}
