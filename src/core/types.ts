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
  /** Date de la déclaration de candidature, AAAA-MM-JJ */
  declaredAt?: string
  /** Source de la déclaration de candidature */
  declaration?: Source
  /**
   * Candidat d'une primaire encore en cours, présenté jusqu'à sa désignation : la mention affichée sur sa carte et sa
   * fiche (seul le gagnant restera)
   */
  primary?: string
  /** Parti, montré sur la page des candidats : son logo, ou son nom */
  party?: PartyMark
  /** Nuance politique du candidat dans la grille de l'élection (ElectionInfo.spectrum), pour l'ordre de la page des candidats */
  nuance?: string
}

/**
 * Le parti d'un candidat, sur la page des candidats seulement (décision du propriétaire du 8 octobre 2026) : jamais
 * pendant le questionnaire, où les approches restent sans nom.
 */
export interface PartyMark {
  /** Nom du parti, ou « Sans investiture de parti » : écrit en gras, ou texte de remplacement du logo */
  name: string
  /** Logo du parti, hébergé sur le site ; « dark » : logo clair, posé sur une étiquette sombre */
  logo?: { src: string; plate?: 'light' | 'dark'; /** largeur / hauteur, pour donner à chaque logo la même surface */ ratio: number }
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
  /**
   * Révision de la question où l'approche est apparue (registre des révisions, tools/build-pack.mjs) ; absente, elle
   * y est depuis la première. Une réponse d'une révision plus ancienne ne l'a pas vue : la feuille la met en tête
   */
  since?: number
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
  /** Points de large accord, partagés par la plupart des candidats qui se sont exprimés : affichés, jamais notés */
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

/** Nature du scrutin : les textes et les seuils qui en dépendent sont dans « copy » et « checks » */
export type ElectionKind = 'primaire' | 'presidentielle'

/**
 * Phrases propres à une élection, reprises telles quelles par les écrans (typographie française comprise :
 * espaces insécables, apostrophes courbes). Chaque champ dit la phrase qui l'encadre.
 */
export interface ElectionCopy {
  /** Nom avec son article, en cours de phrase : « la primaire « Choisir 2027 » » */
  theName: string
  /** Nom précédé de « à la… » (ou « à l'… ») : « {N} personnes ont annoncé leur candidature {atName}. » (Les candidats) */
  atName: string
  /** Mention d'indépendance, chaque fois à partir de « sans lien avec » */
  independence: {
    /** Pied de page : « Outil indépendant, édité par un citoyen, {footer}. » */
    footer: string
    /** Méthode : « Outil édité par un citoyen, à titre personnel, {method}, et sans financement. » */
    method: string
    /** Mentions légales : « Isoloir est édité par un citoyen, à titre personnel, {legal}, et sans financement. » */
    legal: string
  }
  /** Les sources des positions : « {N} attributions s'appuient sur {M} sources publiques : {sources}. » (Méthode) */
  sources: string
  /**
   * Le site officiel de l'élection, nommé dans les mentions légales, absent s'il n'y en a pas :
   * « Les photos des sites de campagne et {photos} ne sont pas reprises. » (Crédits) et
   * « Les liens vers les sources, les sites des candidats et {links} s'ouvrent dans un nouvel onglet… » (Liens externes)
   */
  officialSite?: { photos: string; links: string }
  /** Pourquoi un petit écart n'est pas significatif : « {closeGapReason} : un écart de moins de N points n'est pas significatif » (Méthode) */
  closeGapReason: string
  /**
   * Sur quoi portent les questions qui ouvrent la feuille, sans rien dire de la couverture (Méthode la calcule) :
   * « Les {N} premières {step1Reason}, la position de chaque candidat y est connue, et elles ont été retenues
   * parce qu’elles ne favorisent personne… » ; ex. « portent sur les grands désaccords de la primaire »
   */
  step1Reason: string
  /** Libellé du lien vers la page d'un candidat sur le site officiel de l'élection (Candidate.website) */
  officialPageLabel: string
  /**
   * Description de partage (balises Open Graph et Twitter de index.html, image d'aperçu). Celle de l'élection par
   * défaut est posée au build : vite.config.ts, tools/build-og.mjs et tools/check-dist.mjs lisent election.ts tel
   * quel avec Node, qui efface les types ; ce fichier ne doit donc importer que des types.
   */
  shareDescription: string
}

/**
 * Seuils des tests d'intégrité de la banque (tests/packs.test.ts). Absents, les tests appliquent ceux de la
 * primaire. Les parts sont des fractions (0,85 = 85 %).
 */
export interface ElectionChecks {
  /** Premier dépouillement */
  step1?: {
    /** Nombre de questions */
    count: number
    /** Part minimale des candidats dont la position est connue, sur chaque question */
    minKnownShare: number
    /** Nombre minimal de ces questions sur lesquelles chaque candidat est connu */
    minKnownPerCandidate: number
    /**
     * Candidats exemptés de la seule règle minKnownPerCandidate, par décision du propriétaire (candidature
     * centrée sur une cause unique, par exemple) ; toutes les autres règles s'appliquent à eux
     */
    exempt?: string[]
  }
  /** Questionnaire rapide */
  quick?: {
    min: number
    max: number
    /** Part minimale des candidats connus, sur chaque question */
    minKnownShare: number
    /** Part minimale des questions sur lesquelles chaque candidat est connu */
    minCandidateShare: number
    /** Écart maximal, en nombre de questions connues, entre le candidat le mieux et le moins bien couvert */
    maxSpread: number
  }
  /** Banque complète */
  bank?: {
    min: number
    max: number
    approachesMin: number
    approachesMax: number
    /** Part maximale des positions principales connues qu'une même approche peut réunir */
    maxMainShare: number
    /**
     * Portée de maxMainShare : 'all' (défaut) pour toute la banque ; 'quick' pour le questionnaire rapide seulement,
     * les questions approfondies au-dessus du seuil étant signalées sans bloquer (accord réel entre candidats)
     */
    maxMainShareScope?: 'all' | 'quick'
    /** Part minimale des questions sur lesquelles chaque candidat est connu */
    minCandidateShare: number
  }
  /**
   * Audit sur profils aléatoires : la part des premières places de chaque candidat reste entre 100/n ÷ a
   * et 100/n × b, donnés en [a, b] pour le premier dépouillement et pour le questionnaire rapide
   */
  audit?: { step1: [number, number]; quick: [number, number] }
}

/**
 * Candidats non classés, par décision du propriétaire : leurs positions sont connues sur trop peu de questions pour
 * qu'un rang ait du sens. Ils restent sur le site (liste et fiches des candidats, comparateur, positions connues),
 * mais n'ont de rang nulle part : ni au classement, ni hors classement, ni dans les ex aequo, la sensibilité
 * à la méthode, les lignes rouges du classement ou l'image partagée. Depuis la décision du propriétaire du 14 octobre
 * 2026, le dépouillement (page, PDF, double JSON) donne leur score indicatif, pour information seulement, calculé à
 * part sur leurs seules positions connues (Results.excludedResults). Liste propre à l'élection et révisable (un
 * candidat y revient quand ses positions sont connues) ; les tests et tools/audit-pack.mjs mesurent l'équilibre du
 * score sur les seuls candidats notés. research/<id>/config.json la reprend (scoringExcluded, mêmes identifiants).
 */
export interface ScoringExclusion {
  /** Identifiants des candidats non classés */
  ids: CandidateId[]
  /**
   * Motif factuel, le même pour tous, en début de phrase sans majuscule ni point final (Méthode, double JSON) :
   * « positions connues sur trop peu de questions ». Le chiffre de chacun est donné à côté, d'après les données ;
   * le motif n'avance aucune cause (programme non publié, candidature centrée sur une cause…).
   */
  reason: string
  /** Date de la décision, AAAA-MM-JJ */
  since: string
  /**
   * Candidats entrés dans la liste après la décision, parce qu'ils se sont déclarés plus tard : date de leur entrée,
   * AAAA-MM-JJ. La Méthode et le double JSON la donnent à côté de celle de la décision.
   */
  joined?: Partial<Record<CandidateId, string>>
}

/**
 * Ce que change une entrée du journal des données, un ou plusieurs (mêmes mots sur l'entrée et dans le filtre « Ce qui
 * change », core/journal.ts) : la liste des candidats, leurs positions, les questions (une approche ajoutée ou
 * retirée), les fiches « Comprendre l'enjeu » et les vidéos, le calcul et les pages du site
 */
export type JournalKind = 'candidats' | 'positions' | 'questions' | 'explications' | 'site'

/**
 * Effet d'une entrée sur le classement, vérifié par les tests (tests/journal.test.ts) : « peut-changer » si et seulement
 * si une position change sur le fond, une question gagne ou perd une approche, ou un candidat classé arrive ou part
 */
export type JournalEffect = 'peut-changer' | 'sans-effet' | 'première-version'

/**
 * Une entrée du journal des données. date et text pour toutes les élections ; les autres champs (décision du
 * propriétaire du 17 octobre 2026, page #/journal) pour celles qui ont la page, vérifiés par les tests. Les candidats
 * dont les positions changent, leurs causes et leurs questions ne s'écrivent pas ici : ils viennent de l'historique
 * des positions (ElectionPack.journal, tools/build-journal.mjs).
 */
export interface ChangelogEntry {
  /** Jour de publication, AAAA-MM-JJ (à Paris) */
  date: string
  /** Le texte entier, rédigé par IA, sous « Lire la suite » */
  text: string
  /** Numéro stable, dans l'ordre de publication : l'adresse de l'entrée (#/journal/8) */
  n?: number
  /** Titre court, 70 signes au plus, rédigé par IA ; il ne fait jamais dire à un candidat qu'il change quand seule notre lecture change */
  title?: string
  /** Version(s) des données en vigueur à la publication (dataVersion) : celles des lignes de l'historique qu'elle raconte */
  versions?: string[]
  kinds?: JournalKind[]
  effect?: JournalEffect
  /** Ce qui n'est pas une position de candidat : fiches, vidéos, questions qui gagnent une approche, avec leur titre */
  parts?: { label: string; questions: QuestionId[] }[]
  /** Candidats nommés sans que leurs positions changent (désigné par la primaire, par exemple) */
  named?: CandidateId[]
  /** Candidats arrivés ce jour-là sans être classés (election.ranking.excluded) : leur arrivée ne change pas le classement */
  unranked?: CandidateId[]
  /** Candidats qui ne sont plus présentés à partir de cette entrée */
  departed?: CandidateId[]
  /** Précisions ajoutées après coup, datées */
  notes?: { date: string; text: string }[]
}

/**
 * Ce qui arrive aux positions d'un candidat dans une entrée du journal, tiré de l'historique des positions
 * (research/<id>/positions-history.json) par tools/build-journal.mjs : une cause par ligne distincte de l'historique,
 * dans son ordre ; fond : la position elle-même change (ajout, retrait, poids), sinon seule sa justification
 */
export interface JournalPerson {
  id: CandidateId
  causes: { cause: string; fond: boolean }[]
  /** Les questions où ses positions changent ; à son arrivée, aucune (toutes ses positions sont publiées) */
  questions: QuestionId[]
  /** Date de sa prise de position, quand c'en est une (AAAA-MM-JJ) */
  statedAt: string | null
}

/**
 * Les candidats de chaque entrée du journal, par numéro d'entrée. hidden : les candidats masqués (election.hidden),
 * retirés de people par l'export du pack (core/visible.ts), comptés seulement, et parmi eux ceux qui arrivaient
 */
export type JournalPeople = Record<number, { people: JournalPerson[]; hidden?: { count: number; arrivals: number } }>

export interface ElectionInfo {
  id: string
  kind: ElectionKind
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
  /**
   * Exceptions aux termes interdits : noms de partis qui sont aussi des mots courants (« Renaissance »,
   * « Ensemble »), jamais cherchés, même quand ils sont l'étiquette d'un candidat (vérifiées par les tests)
   */
  forbiddenTermsAllow?: string[]
  /** Audit de biais publié : part des premières places sur des profils aléatoires (vérifiée par les tests) */
  audit?: { profiles: number; minShare: number; maxShare: number }
  /**
   * Suivi des révisions de questions : une réponse donnée sur une révision antérieure est mise de côté
   * et à revoir. Désactivé pendant la phase de test, où les questions bougent encore.
   */
  revisionTracking?: boolean
  /** Journal des données (page #/journal, core/journal.ts) */
  changelog: ChangelogEntry[]
  /** Phrases propres à l'élection */
  copy: ElectionCopy
  /** Questionnaire rapide : nombre de questions du premier dépouillement */
  quick?: { step1: number }
  /**
   * Règle de classement, absente : tous les candidats sont classés (primaire). minCoverageShare (fraction, 0,5 =
   * la moitié) : un candidat connu sur moins de cette part des questions comptées (notées avec au moins un avis)
   * est « hors classement », montré sous le classement avec son score à titre indicatif (Résultats, Méthode, image
   * partagée). Raison : un score calculé sur peu de questions varie trop, et finit premier par simple hasard.
   * excluded : candidats sortis du classement par décision du propriétaire (score indicatif seulement, décision du
   * propriétaire du 14 octobre 2026 ; voir ScoringExclusion).
   */
  ranking?: { minCoverageShare?: number; excluded?: ScoringExclusion }
  /** Seuils des tests d'intégrité ; absents, ceux de la primaire */
  checks?: ElectionChecks
  /** Périodes où les données ne doivent pas changer (veille et jours de vote), ISO 8601 */
  freezeWindows?: { start: string; end: string }[]
  /** Élection passée, gardée en archive : depuis quand (AAAA-MM-JJ) et la note affichée */
  archived?: { since: string; note: string }
  /** Annonces en attente (candidature attendue, résultat à venir), affichées telles quelles */
  pending?: string[]
  /**
   * Candidats masqués, par décision du propriétaire : leur fiche (candidates.ts) et leurs positions (positions.ts) restent
   * dans les données, mais le pack les retire à son export (core/visible.ts, appelé par src/elections/<id>/index.ts) :
   * le site ne les montre ni ne les compte nulle part. Le registre en garde une copie (hiddenCandidateIds), pour mener
   * un ancien lien vers leur fiche à la page des candidats. Les retirer de cette liste les fait revenir tels quels (et
   * les retirer de hiddenCandidateIds, remettre leurs identifiants dans candidateIds du registre, puis refaire l'audit).
   */
  hidden?: CandidateId[]
  /**
   * Ordre de la page des candidats, de l'extrême gauche à l'extrême droite : les nuances d'une grille officielle, dans
   * son ordre, puis l'ordre alphabétique au sein d'une même nuance. Sans elle, ordre tiré au hasard.
   */
  spectrum?: Spectrum
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
  /**
   * Séries vidéo reprises d'une autre élection : identifiant de thème ou de question des séries
   * (src/ui/videos/series/) → identifiant dans cette élection. Un thème de série absent de « topics »
   * n'est pas montré. Absent : les séries sont prises telles quelles (leurs identifiants sont ceux de l'élection).
   */
  videoScope?: {
    topics: Record<string, string>
    questions: Record<string, string>
    /** Édition des séries propre à cette élection (src/ui/videos/editions) : corrections posées sur les séries communes */
    edition?: string
  }
  /** Numéros stables des questions et des thèmes dans les codes de reprise ; absent : pas de code pour cette élection */
  transfer?: TransferSlots
  /** Les candidats des entrées du journal des données (src/elections/<id>/journal.ts, généré) ; absent : aucun */
  journal?: JournalPeople
}

/**
 * Numérotation des codes de reprise (core/transfer) : un code ne porte pas les identifiants, seulement ces numéros.
 * Ajout seulement : un numéro n'est jamais changé ni réutilisé, même quand sa question disparaît, sans quoi un code
 * fait avant la mise à jour attribuerait des avis à une autre question.
 */
export interface TransferSlots {
  /** Numéro de l'élection dans les codes (1 à 63), propre à chaque élection */
  tag: number
  questions: Record<QuestionId, number>
  topics: Record<TopicId, number>
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

/** Grille des nuances politiques (ElectionInfo.spectrum) */
export interface Spectrum {
  /** Les nuances, dans l'ordre de la grille ; bloc : identifiant d'un des blocs */
  nuances: { code: string; label: string; bloc: string }[]
  /**
   * Les blocs, dans l'ordre de la grille, chacun avec l'un des quatre pastels du site, qui habille les cartes de ses
   * candidats sur la page des candidats
   */
  blocs: { id: string; label: string; pastel: 'rouge' | 'jaune' | 'bleu' | 'vert' }[]
  /** La grille et sa source */
  source: Source
  /**
   * Les blocs qui forment l'axe de la page « Mon profil politique », de gauche à droite (core/echiquier.ts) ; un bloc
   * absent (« Autres ») est hors axe, et ses candidats hors lecture. Sans axe, pas de page.
   */
  axis?: SpectrumAxisBloc[]
}

/** Un bloc de l'axe (Spectrum.axis) et ses formes dans les phrases de la page « Mon profil politique » */
export interface SpectrumAxisBloc {
  /** Identifiant d'un des blocs de la grille (Spectrum.blocs) */
  bloc: string
  /** En-tête de colonne : « Ext. gauche » */
  short: string
  /** « à l’extrême gauche » */
  where: string
  /** « de l’extrême gauche » (premier bloc d'une suite : « de l’extrême gauche à la gauche ») */
  from: string
  /** « à l’extrême gauche » (dernier bloc d'une suite) */
  to: string
}
