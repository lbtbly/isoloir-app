// Modèle de données générique d'Isoloir. Une élection = un ElectionPack.
// Le questionnaire ne reçoit que la QuestionBank : les positions des candidats
// vivent dans une table séparée, lue seulement par le moteur de score et les résultats.

export type CandidateId = string
export type TopicId = string
export type QuestionId = string
export type ApproachId = string

export interface Source {
  title: string
  url: string
  /** Date de publication, format AAAA-MM-JJ quand elle est connue */
  date?: string
  publisher?: string
}

/** Image d'un candidat, hébergée sur le site, avec son crédit et la mention de droits qui l'autorise */
export interface CandidateMedia {
  src: string
  alt: string
  /** Mention courte affichée sous la photo */
  credit: string
  /** Page où figure la mention de droits (page Wikimedia Commons de l'image entière) */
  rightsUrl: string
  /** Auteur ou titulaire des droits, tel que la source le nomme */
  author?: string
  /** Titre de l'œuvre ou, à défaut, nom du fichier source */
  title?: string
  /** Licence ou conditions de réutilisation, avec l'adresse de leur texte (en français quand il existe) */
  license?: { name: string; url: string }
  /** Modification apportée à l'image (« recadrée en carré et réduite ») */
  changes?: string
  /** Licence « partage dans les mêmes conditions » : la version modifiée est diffusée sous la même licence */
  shareAlike?: boolean
}

export interface Candidate {
  id: CandidateId
  name: string
  initials: string
  /** Parti ou mouvement, tel qu'affiché après la révélation */
  affiliation: string
  /** Fonction actuelle, une ligne */
  role: string
  /** Page du candidat sur le site officiel de l'élection */
  website?: string
  /** Site de campagne du candidat */
  campaignUrl?: string
  /** Court parcours factuel, chaque élément sourcé ; « when » est le repère affiché dans la frise */
  bio?: { when: string; text: string; source: Source }[]
  photo?: CandidateMedia
  /** Visuel de bandeau repris de son site de campagne */
  banner?: CandidateMedia
}

export interface Topic {
  id: TopicId
  label: string
  /** Une phrase neutre décrivant le périmètre du thème */
  description: string
}

export interface Approach {
  id: ApproachId
  text: string
  /** Approche portée par aucun candidat (alternative ou statu quo), signalée dans la méthode */
  external?: boolean
}

export type Tier = 'essentiel' | 'approfondi'

/**
 * Petit graphique d'un chiffre clé. Chaque nombre figure déjà dans la valeur ou le libellé du chiffre :
 * le graphique le montre, il n'ajoute aucune donnée.
 * part : une part d'un tout (pour un pourcentage, total = 100 et unit « % ») ; whole dit ce qu'est le tout.
 * compare : 2 à 4 grandeurs de même unité, à la même échelle (valeurs négatives permises).
 * series : une évolution dans le temps, 2 à 6 points dans l'ordre chronologique.
 */
export type FigureChart =
  | { kind: 'part'; value: number; total: number; unit?: string; whole?: string }
  | { kind: 'compare'; unit?: string; items: { label: string; value: number }[] }
  | { kind: 'series'; unit?: string; items: { label: string; value: number }[] }

/** Chiffre clé d'une question, tiré d'une source sûre et vérifié contre elle */
export interface ExplainerFigure {
  /** Valeur telle qu'écrite dans la source, à la française : « 115,7 % », « 3 460 Md€ » */
  value: string
  label: string
  /** Année ou date du chiffre */
  date: string
  source: Source
  /** Graphique facultatif, absent quand il n'apporterait rien */
  chart?: FigureChart
}

/** Contexte d'une question : l'enjeu, quelques explications et des chiffres sourcés, sans aucun candidat */
export interface Explainer {
  summary: string
  points: { text: string; source?: Source }[]
  figures: ExplainerFigure[]
}

export interface Question {
  id: QuestionId
  topicId: TopicId
  tier: Tier
  /** Questionnaire rapide : 1 pour le premier dépouillement, 2 pour l'affinage */
  step?: 1 | 2
  /** Ferme toujours son temps (ou son niveau) au lieu d'être placée au hasard parmi les thèmes */
  last?: boolean
  /** Révision de fond (énoncé ou approches) : une réponse d'une autre révision est à revoir */
  rev?: number
  prompt: string
  /** Ligne de contexte factuel et neutre (« Aujourd'hui : … ») */
  context?: string
  /** Contexte détaillé : enjeu, explications, chiffres sourcés */
  explainer?: Explainer
  approaches: Approach[]
}

export interface QuestionBank {
  topics: Topic[]
  questions: Question[]
  /** Points d'accord entre tous les candidats : affichés, jamais notés */
  consensus?: { topicId: TopicId; text: string }[]
}

export type Nature = 'proposition' | 'declaration' | 'inference'
export type Confidence = 'high' | 'medium' | 'low'

/**
 * Position d'un candidat sur une approche.
 * weight 2 : approche principale ou proposition explicite.
 * weight 1 : position compatible ou secondaire.
 * rejects  : rejet explicite de cette approche.
 * Absence d'entrée : position inconnue.
 */
export interface Position {
  weight?: 1 | 2
  rejects?: boolean
  nature: Nature
  confidence: Confidence
  /** Résumé neutre et factuel de ce que dit le candidat, affiché à la révélation */
  summary: string
  sources: Source[]
}

export type PositionTable = Record<CandidateId, Record<ApproachId, Position>>

export interface Round {
  label: string
  /** ISO 8601 */
  start: string
  end: string
}

export interface ElectionInfo {
  id: string
  name: string
  /** Libellé court, utilisé dans l'image partagée */
  shortName: string
  organizers: string[]
  officialUrl?: string
  rounds: Round[]
  /** Version des données (questions + positions) */
  dataVersion: string
  /** Date à laquelle les positions ont été arrêtées, AAAA-MM-JJ */
  dataFrozenAt: string
  /** Candidats qualifiés pour le tour suivant, null tant qu'inconnu */
  finalists: CandidateId[] | null
  /** Mises en garde propres à l'élection */
  notes: string[]
  /** Termes interdits dans les textes des questions (partis des candidats, slogans) : vérifiés par les tests */
  forbiddenTerms?: string[]
  /** Audit de biais publié : part des premières places sur des profils aléatoires (vérifiée par les tests) */
  audit?: { profiles: number; minShare: number; maxShare: number }
  /**
   * Suivi des révisions de questions : une réponse donnée sur une révision antérieure est mise de côté
   * et à revoir. Désactivé pendant la phase de test, où les questions bougent encore.
   */
  revisionTracking?: boolean
  changelog: { date: string; text: string }[]
}

/** Famille de thèmes, pour filtrer les fiches des candidats */
export interface TopicGroup {
  id: string
  label: string
  topicIds: TopicId[]
}

export interface ElectionPack {
  election: ElectionInfo
  candidates: Candidate[]
  bank: QuestionBank
  positions: PositionTable
  /** Familles de thèmes ; à défaut, chaque thème forme sa propre famille */
  topicGroups?: TopicGroup[]
}

/**
 * Cran de la réglette d'avis : −1 pas d'accord, 1 d'accord.
 * Une approche absente des avis est « sans avis » (0).
 */
export type Rating = -1 | 1

/** Réponse de l'utilisateur à une question */
export interface Answer {
  ratings: Record<ApproachId, Rating>
  /** Lignes rouges : approches inacceptables, toujours notées « pas d'accord » */
  redLines: ApproachId[]
  /** Question passée sans avis */
  skipped?: boolean
  /** Révision de la question au moment de la réponse (suivi des révisions activé) */
  rev?: number
}

export type Answers = Record<QuestionId, Answer>

/** Poids d'un thème : 0,5 (peu important), 1 (normal), 2 (prioritaire) */
export type TopicWeight = 0.5 | 1 | 2
export type TopicWeights = Record<TopicId, TopicWeight>
