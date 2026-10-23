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
  /** Un réglage qu'aucune source éligible ne chiffre : estimé par Isoloir, et comment (décision du 18 octobre 2026) */
  estimate?: string
}

/**
 * Au-delà de la plage chiffrée par la source (±max), jusqu'à une borne justifiée (décision du 18 octobre 2026) : l'effet
 * de chaque unité en plus est une estimation, en fourchette élargie
 */
export interface LeverStretch {
  /** La borne, en unités, des deux côtés : de −max à +max */
  max: number
  /** Md€ par unité au-delà de la plage chiffrée */
  perUnit: { lo: number; hi: number }
  /** Le même à la baisse, quand il diffère */
  perUnitDown?: { lo: number; hi: number }
  /** Pourquoi cette borne, et comment l'effet au-delà est estimé */
  why: string
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
  /** La taille de la ligne du budget sur laquelle joue le levier (Md€), publiée : elle range les « 3 plus gros » ; de sa
   *  source, la fiche ne montre que l'éditeur, en lien */
  base?: { value: number; label: string; source: Pick<LeverSource, 'title' | 'publisher' | 'url'> }
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
  /** Aucune source éligible ne chiffre le levier : l'effet par unité est une estimation d'Isoloir, et sa méthode */
  estimate?: { method: string }
  /** Plus loin que la plage chiffrée, en estimation */
  stretch?: LeverStretch
}

/**
 * Une approche d'une question reliée à un levier (research/presidentielle-2027/budget-links.json) : d'accord avec elle,
 * le levier va dans ce sens (dir), jusqu'au réglage qu'elle dit (un nombre d'unités, un réglage, ou « dir » : le sens
 * seulement)
 */
export interface LeverLink {
  approach: string
  question: string
  lever: string
  dir: 1 | -1
  setting: number | string
  /** exact : l'approche dit la taille ; direction : le sens seulement ; partial : elle ne porte que sur une part */
  fit: 'exact' | 'direction' | 'partial'
}

/** « Comprendre » un levier (research/presidentielle-2027/budget-explain.json), chargé à l'ouverture d'une fiche */
export interface LeverExplainer {
  what: string
  who: string
  up: string
  down: string
  argsUp: string[]
  argsDown: string[]
  /** Ses sources en plus de celles de la fiche du levier (sans leur chiffre, qui reste dans la recherche) */
  sources: Omit<LeverSource, 'figure'>[]
}

export interface BudgetData {
  /** Version des données du jeu, à part de celle de l'élection (pas de bannière « données mises à jour ») */
  version: string
  /** Le point de départ : le PLF 2027 tel que déposé */
  baseline: { label: string; deficitPct: number; gdp: number; source: LeverSource }
  levers: Lever[]
  /** Les approches des questions reliées aux leviers */
  links?: LeverLink[]
  /**
   * La mesure de neutralité du mode relié (tools/budget-pregate.mjs) : l'écart de couverture entre le bloc le mieux et
   * le moins bien servi, pour les idées qui creusent et celles qui réduisent le déficit, avec tous les candidats et au
   * pire sans l'un d'eux ; l'écart des leviers que chaque bloc peut faire bouger dans son sens ; le seuil et le verdict
   */
  gate?: {
    threshold: number
    creuse: number | null
    reduit: number | null
    worstCreuse: number | null
    worstReduit: number | null
    reach: number | null
    pass: boolean
    /** La même mesure sur les seules approches qui pré-règlent un levier (pas les liens partiels) */
    preset?: { creuse: number | null; reduit: number | null; worstCreuse: number | null; worstReduit: number | null; pass: boolean }
  }
}

/**
 * Les réglages du jeu, gardés sur l'appareil avec les réponses (décision du propriétaire du 18 octobre 2026) et repris
 * dans le double exporté : l'objectif choisi, la valeur de chaque levier réglé (un nombre d'unités, ou l'identifiant
 * d'une option) et les leviers touchés, dans l'ordre (le récapitulatif garde barrés ceux ramenés au PLF)
 */
export interface BudgetSave {
  goalId: string | null
  settings: Record<string, number | string>
  touched: string[]
  /** Les leviers pré-réglés d'après les réponses (et pas touchés depuis) ; absent : pas encore proposé */
  preset?: string[]
  /** La personne a choisi de partir du PLF plutôt que de ses réponses */
  fromPlf?: boolean
}

