// Les mots de la rubrique « Mon profil politique » de la Méthode (#/methode/profil, ui/profile/MethodSection.tsx), et
// les chiffres qu'elle publie (ECHIQUIER_PUBLISHED). Fonctions pures qui renvoient du texte brut ; la rubrique garde
// autour ses liens et ses balises. À part des mots de la page (core/echiquierCopy.ts) et sans rien de son calcul
// (core/echiquier.ts) : la rubrique, un fichier à part du build chargé à la demande par la Méthode
// (ui/profile/load.ts), les prend ici sans emporter la page. Mêmes règles d'écriture que la page
// (core/echiquierCopy.ts) ; tests/echiquier-copy.test.ts les vérifie.

import { fr, PRIVACY, word } from './echiquierCommonCopy'

/** « Les couleurs » : les mots de « Comment c'est calculé » de la page (core/echiquierCommonCopy.ts) */
export { COLORS_CHANCE, HOW_COLOR } from './echiquierCommonCopy'

/**
 * Ce que publie la Méthode, mesuré par tools/audit-echiquier.mjs (clones de chaque candidat classé retirés du calcul,
 * feuilles remplies par un programme, sans suivre aucun candidat, selon six façons de répondre) ;
 * tests/echiquier-calibration.test.ts vérifie que la mesure reste à 5 points près (0,5 pour les moyennes et le
 * rapport). Une mise à jour des positions qui les fait bouger : refaire l'audit, reporter ici, et dire le changement au
 * journal.
 */
export const ECHIQUIER_PUBLISHED = {
  // Mesure refaite le 14 octobre 2026 (entrée de Natacha Polony, non classée, et des deux approches ajoutées ce jour-là) :
  // hitWithout 70 → 71, randomPerProfile 1,4 → 1,3 ; le reste inchangé (journal du 14 octobre). Refaite le 15 octobre
  // 2026, à 1 000 profils (positions de Bruno Retailleau et de Florian Philippot sur finances_publiques-1, décisions du
  // propriétaire du 2026-10-15) : hitWithout 71 → 70 ; le reste inchangé (journal du 15 octobre). Remesurée le même
  // jour avec le calcul sans tirage (« compter, sinon calculer », core/echiquier.ts), à 1 000 profils et 30 clones
  // bruités par candidat : hitWithout 70,1 → 70,6, hitWithoutMax 90,6 → 92,3, randomThemes 4,79 → 4,49,
  // randomPerProfileMax 2,41 → 2,31, oneChoiceRatio 1,72 → 1,79 et 2,36 → 2,41 au rapide, le reste identique ; tout
  // reste dans les marges du test, les valeurs publiées sont gardées jusqu'à la réécriture de la Méthode (avant et
  // après, au journal). hitWithMin et hitWithMax (neutralité bloc par bloc, avec le candidat) ajoutés, mesurés à 68,8
  // et 97,1 avec l'un et l'autre calcul. Une seconde série du même jour (1 000 autres feuilles par façon de répondre) :
  // randomThemes 4,72, randomThemesMax 8,24, randomPerProfileMax 2,20. À la réécriture de la Méthode, avec le journal :
  // hitWithoutMax selon la décision du propriétaire sur D5 (92,3 avec la borne calculée, 90,6 en comptant tout jusqu'à
  // quelques millions de façons : la seule lecture qui change, la gauche pour le clone de Jean-Luc Mélenchon sur
  // l'éducation, 1 680 000 façons, a p = 0,098 au compte complet et 0,107 à la borne : la borne la manque),
  // randomPerProfileMax 2,3, randomThemesMax 8,5 (« un sur onze » : oneIn arrondit le dénominateur vers le bas, la part
  // dite n'est jamais sous la part publiée). randomThemes reste à 5 : methodWorth arrondit avant d'inverser, 4 dirait
  // « un sur vingt-cinq » pour un sur vingt et un ou vingt-deux mesuré.
  // Republiée le 15 octobre 2026, à la réécriture de la Méthode (le propriétaire admet la borne prudente au-delà de cent
  // mille façons, et l'écart qu'elle ajoute), mesurée de nouveau à 1 000 profils et 30 clones bruités par candidat
  // (mêmes chiffres que ci-dessus) : hitWithout 70 → 71, hitWithoutMax 91 → 92, randomThemesMax 9 → 8,5,
  // randomPerProfileMax 2,4 → 2,3, oneChoiceRatio 1,5 → 1,7 et oneChoiceRatioQuick 2,2 → 2,4 (les moyennes des six
  // échantillons, mêmes mots dans la Méthode). L'avant que disent la Méthode et le journal est celui des mêmes feuilles,
  // avec les tirages (ECHIQUIER_BEFORE : 1,6 et 2,4 pour les rapports, et non 1,5 et 2,2, mesurés plus tôt)
  /** Date de la mesure */
  measured: '2026-10-15',
  /** Clones larges, sans le candidat : part des lectures qui désignent son bloc (%) */
  hitWithout: 71,
  /** La même part, bloc vrai par bloc vrai : la plus basse et la plus haute (%) */
  hitWithoutMin: 44,
  hitWithoutMax: 92,
  /** Les mêmes, avec le candidat dans le calcul, comme sur le site (%) */
  hitWith: 91,
  /** La même part avec le candidat, bloc vrai par bloc vrai : la plus basse et la plus haute (%) */
  hitWithMin: 69,
  hitWithMax: 97,
  /** Les mêmes, sans le candidat : part des thèmes lus de l'autre côté du centre (%) */
  wrongSideWithout: 0,
  /** Feuilles remplies par un programme (un quart d'accord, un quart de désaccord) : part des thèmes lus (%) */
  randomThemes: 5,
  /** La même part, pour la façon de répondre qui en reçoit le plus (un seul accord par question, du reste rien) (%) */
  randomThemesMax: 8.5,
  /** Les mêmes feuilles (un quart d'accord, un quart de désaccord) : lectures de la synthèse par feuille, en moyenne */
  randomPerProfile: 1.3,
  /** La même moyenne, pour la façon de répondre qui en reçoit le plus */
  randomPerProfileMax: 2.3,
  /**
   * Un seul accord par question (avec ou sans désaccords ailleurs) : dans la synthèse, la part moyenne des blocs que
   * la grille classe aux extrêmes, rapportée à celle du bloc qu'elle classe à gauche ; sur la banque entière, puis sur
   * le seul questionnaire rapide. Ce rapport varie d'un échantillon à l'autre : six échantillons de 1 000 profils par
   * façon de répondre, le 15 octobre 2026, de 1,49 à 1,72 sur la banque entière et de 2,29 à 2,48 au rapide avec les
   * tirages ; avec le calcul sans tirage, un peu plus haut, et dans le même sens à chaque échantillon (+0,05 à +0,10 sur
   * la banque, +0,02 à +0,05 au rapide) : de 1,57 à 1,79 (1,67 en moyenne) et de 2,33 à 2,51 (2,40 en moyenne), contre
   * 1,60 et 2,37 en moyenne avec les tirages (ECHIQUIER_BEFORE). Les valeurs publiées, ces moyennes, donnent les mêmes
   * mots que celles d'avant (« environ une fois et demie », « environ deux fois ») ; publier la moyenne de plusieurs
   * échantillons, pas un seul audit (1,79 dirait « environ deux fois ») ; le journal du 15 octobre dit que le calcul sans
   * tirage accentue un peu ce déséquilibre. Avis mêlés : chaque bloc reçoit de 17 à 23 % des
   * lectures, aucun n'est favorisé.
   */
  oneChoiceRatio: 1.7,
  oneChoiceRatioQuick: 2.4,
} as const

/**
 * Les mêmes chiffres avant le calcul sans tirage (999 façons de poser les avis tirées au sort, la même graine pour les
 * mêmes réponses), mesurés sur les mêmes feuilles que ECHIQUIER_PUBLISHED et arrondis de même : la Méthode dit l'avant et
 * l'après (décision du propriétaire du 15 octobre 2026), comme le journal. Audit du 15 octobre 2026 à 1 000 profils et
 * 30 clones bruités par candidat, avec puis sans les tirages : hitWithout 70,1 puis 70,6, hitWithoutMin 43,8 puis 43,8,
 * hitWithoutMax 90,6 puis 92,3, randomThemesMax 8,93 puis 8,59, randomPerProfileMax 2,41 puis 2,31. Les rapports, comme
 * ECHIQUIER_PUBLISHED, sont la moyenne des six échantillons appariés : 1,60 puis 1,67, et 2,37 puis 2,41 au rapide (la
 * Méthode publiait avant 1,5 et 2,2, une mesure plus ancienne qui donnait les mêmes mots)
 */
export const ECHIQUIER_BEFORE = {
  hitWithout: 70,
  hitWithoutMin: 44,
  hitWithoutMax: 91,
  randomThemesMax: 9,
  randomPerProfileMax: 2.4,
  oneChoiceRatio: 1.6,
  oneChoiceRatioQuick: 2.4,
} as const

/**
 * La croix des lignes rouges (lot 2, A1), contrôle de neutralité bloc par bloc (D5, décision du propriétaire du 15
 * octobre 2026) : elle ne crée, ne change ni ne qualifie aucune lecture (l'écart publié ne bouge donc pas) ; on publie son
 * taux d'affichage, bloc vrai par bloc vrai, avec et sans le candidat, comparé à la référence du même passage, la part des
 * sujets lus nettement, et la répartition de « pourrait franchir » bloc par bloc. Mesuré avec le calcul même de la page
 * (readEchiquier, ui/profile/rows.ts : chartRows et crossingsOf ; core/score.ts : computeResults), sur 60 clones bruités
 * par candidat, l'effectif qui fonde un verdict (§ 2.0 de l'étude : 30 ne donnent qu'une indication ; graines
 * « n:<id>:<s> » et « nq:<id>:<s> » de tools/audit-echiquier.mjs), deux lignes rouges posées parmi leurs « pas d'accord »
 * (une entrée de test, tirée d'une graine), selon trois scénarios : sans viser personne ; parmi les approches que porte un
 * candidat d'un bloc voisin ; parmi celles d'un candidat de l'autre côté du centre (pour un clone du centre, les deux
 * bouts). Part des lignes lues nettement (rows.read) qui montrent une croix, la plus basse et la plus haute selon le bloc
 * vrai (%), sur la banque :
 * - sans viser personne : avec le candidat 1,1 (centre) à 3,5 (extrême gauche), sans lui 0,9 à 3,3 ;
 * - un bloc voisin : avec 2,7 (centre) à 6,4 (extrême droite), sans 2,8 à 6,9 ;
 * - l'autre côté : avec 1,2 à 2,8, sans 1,3 à 2,4.
 * Écarts entre blocs : de 1,1 à 4,1 points (fourchettes de Wilson de 0 à 8 points), sous la référence du même passage,
 * 16,5 points avec le candidat (de 27 à 43,5 % des sujets lus nettement) et 15,9 sans lui : « passe » dans les six cas (la
 * borne haute de l'écart reste sous la référence ; la règle D5, § 2.0 de l'étude). Au seul questionnaire rapide (lignes de
 * famille surtout), la croix paraît plus souvent : sans viser personne, de 2,9 à 8,6 % avec le candidat (5,6 points
 * [0–11,8] pour une référence de 15,2 : passe), de 1 à 7,5 % sans lui (6,5 [0–12,1] pour 17,5 : passe) ; l'autre côté, de
 * 2,4 à 4 % (passe) et de 0 à 5,3 % (passe) ; un bloc voisin, de 2,9 (centre) à 18 % (extrême gauche), 15,1 points
 * [8,3–20,7] pour 15,2, et sans lui de 3,9 à 19,7 %, 15,8 points [6–23,1] pour 17,5 : non établi, avec et sans lui.
 * « Pourrait franchir » (niveau « possible » de core/score.ts) : de 11,9 à 17,2 % des noms cités selon le scénario, avec
 * ou sans le candidat, sur la banque ; de 5,3 à 18 % au rapide. Les trois scénarios réunis, par bloc de la croix, sur la
 * banque : de 4,2 % (droite, 7 sur 168) à 26,5 % (extrême droite, 26 sur 98) avec le candidat, 22,4 points [10,4–34]
 * pour 16,5 ; de 2,9 % (droite) à 23,5 % (extrême droite) sans lui, 20,7 points [5,9–35,8] pour 15,9 : non établi, avec et
 * sans lui (l'écart ponctuel dépasse la référence, sa borne basse non). Au rapide : de 0 % (droite, 0 sur 113) à 19 %
 * (extrême gauche, 23 sur 121) avec le candidat, 19 points [9,7–31,9] pour 15,2 ; de 0 à 27,6 % (gauche) sans lui, 27,6
 * points [9,2–45,7] pour 17,5 : non établi. La cause : « pourrait franchir » vient des positions déduites, ou de confiance
 * basse, et leur part parmi celles qu'une ligne rouge peut viser va de 5,7 % pour les candidats que la grille classe à
 * droite à 31,3 % pour ceux qu'elle classe à l'extrême gauche (30,6 % à l'extrême droite, 22,9 % à gauche, 9,3 % au
 * centre) ; les positions écrites à rechercher (PLAN, « Hors périmètre ») la réduiraient. Un candidat qui franchit sûrement
 * une ligne rouge de la ligne n'est compté qu'à ce niveau (crossingsOf) : aucun n'en avait aussi une autre seulement
 * possible sur la banque, un seul au rapide (« mêlés »). Feuilles remplies par un programme, sans suivre aucun candidat
 * (schéma « audit »), deux lignes rouges de même : 3,0 % des lignes lues sur la banque, 4,6 % au rapide. À 30 clones, la
 * mesure du 15 octobre 2026 donnait les mêmes issues pour la croix sur la banque (écarts de 1,8 à 5,5 points pour 14,4 et
 * 14,9), au rapide un second « non établi » (sans viser personne, sans le candidat : 10,8 points [0–24,7] pour 19,9),
 * qui passe à 60. Remesurée le 17 octobre 2026, la croix ne nommant plus que les candidats connus sur le sujet (décision
 * du propriétaire) : l'autre côté, avec le candidat, 1,3 → 1,2 ; « pourrait franchir », par bloc de la croix, sur la
 * banque, 27,3 → 26,5 avec le candidat et 25 → 23,5 sans lui ; le reste identique, et les mêmes issues. Mesure : node
 * tools/audit-croix.mjs --quick ; à refaire après une mise à jour des positions, et à reporter ici
 */
export const ECHIQUIER_CROSS = {
  measured: '2026-10-17',
  /** Clones bruités par candidat : l'effectif de la porte D5 */
  clones: 60,
  /**
   * Sur la banque : part des lignes lues nettement qui montrent une croix, selon le bloc vrai, la plus basse et la plus
   * haute (%), avec puis sans le candidat
   */
  random: { withMin: 1.1, withMax: 3.5, withoutMin: 0.9, withoutMax: 3.3 },
  neighbour: { withMin: 2.7, withMax: 6.4, withoutMin: 2.8, withoutMax: 6.9 },
  other: { withMin: 1.2, withMax: 2.8, withoutMin: 1.3, withoutMax: 2.4 },
  /** L'écart le plus large entre blocs, en points, et la référence du même passage (sujets lus nettement), avec puis sans */
  gapMax: 4.1,
  reference: [16.5, 15.9],
  /** Au seul questionnaire rapide, de même ; neighbourGap : l'écart du bloc voisin, avec puis sans, non établi */
  quick: {
    random: { withMin: 2.9, withMax: 8.6, withoutMin: 1, withoutMax: 7.5 },
    neighbour: { withMin: 2.9, withMax: 18, withoutMin: 3.9, withoutMax: 19.7 },
    other: { withMin: 2.4, withMax: 4, withoutMin: 0, withoutMax: 5.3 },
    /** L'écart le plus large des deux scénarios qui passent */
    gapMax: 6.5,
    neighbourGap: [15.1, 15.8],
    reference: [15.2, 17.5],
  },
  /** « Pourrait franchir » : part des noms cités, selon le scénario, avec ou sans le candidat (%) : banque, puis rapide */
  possible: [11.9, 17.2],
  possibleQuick: [5.3, 18],
  /**
   * La même part, les trois scénarios réunis, selon le bloc de la croix : la plus basse et la plus haute avec le candidat
   * (et leurs blocs), puis sans lui ; non établi, sur la banque comme au rapide
   */
  possibleBlocs: { low: 4.2, lowWhere: 'à droite', high: 26.5, highWhere: 'à l’extrême droite', withoutLow: 2.9, withoutHigh: 23.5 },
  possibleBlocsQuick: { low: 0, lowWhere: 'à droite', high: 19, highWhere: 'à l’extrême gauche', withoutLow: 0, withoutHigh: 27.6 },
  /** Part des positions déduites, ou de confiance basse, parmi celles qu'une ligne rouge peut viser, selon le bloc (%) */
  deduced: { low: 5.7, lowWhere: 'à droite', high: 31.3, highWhere: 'à l’extrême gauche' },
} as const

/** « 1,4 » */
const decimal = (x: number) => String(x).replace('.', ',')
/**
 * Une part de thèmes, en « un sur N » : le dénominateur arrondi vers le bas, pour que la part dite ne soit jamais sous
 * la part publiée (8,5 % : « un sur onze », 9,1 %, et non « un sur douze », 8,3 %)
 */
export const oneIn = (pct: number) => Math.floor(100 / pct)
/** Un rapport, en mots : « environ une fois et demie », « environ deux fois » */
const times = (x: number) => (x < 1.25 ? 'un peu' : x < 1.75 ? 'environ une fois et demie' : `environ ${word(Math.round(x))} fois`)

/** Point 1, autour du lien vers « L’ordre des candidats » (posé par la page) */
export const methodIntro = (blocs: number) =>
  [
    fr('Après le dépouillement complet, la page « Mon profil politique » lit vos réponses thème par thème au regard de la grille des nuances politiques du ministère de l’Intérieur (voir '),
    fr(
      `). Pour chacun de ses ${word(blocs)} blocs, de l’extrême gauche à l’extrême droite, elle colore une case de votre affinité moyenne avec ses candidats, et dit si vos réponses s’en rapprochent nettement, s’en écartent nettement, ou rien de net. Elle ne change ni votre score, ni le classement, ni vos priorités, et n’existe pas pendant la première tendance.`,
    ),
  ] as const
export const METHOD_INTRO_LINK = 'l’ordre des candidats'
/** Le schéma, en mots */
export const METHOD_DIAGRAM_CAPTION = fr(
  'Vos avis donnent votre affinité par thème avec chaque candidat, le calcul même du score. On en fait la moyenne par bloc de la grille, qui donne le palier de sa case, puis on la compare à celle de vos mêmes avis, posés de toutes les autres façons sur les approches : nettement plus près ou nettement plus loin, sa couleur est pleine ; rien de net, elle reste atténuée.',
)
export const methodWho = (panel: number, unscored: number, minBloc: number, maxBloc: number, othersEmpty: boolean) =>
  fr(
    `Comptent les ${panel} candidats classés, chacun dans le bloc de sa nuance. Ne comptent pas ${
      // Décision du propriétaire du 14 octobre 2026 : un score pour les non classés, pour information seulement, sans rang
      unscored ? `les ${unscored} candidats non classés, dont le score n’est donné que pour information, ni ` : ''
    }le bloc « Autres » de la grille (écologistes, divers) : la grille le place entre la gauche et le centre comme une liste, pas comme une position${
      othersEmpty ? ', et aucun candidat classé n’y figure' : ''
    }. Chaque bloc compte une fois${minBloc === maxBloc ? '' : `, qu’il ait ${word(minBloc)} candidats ou ${word(maxBloc)}`}.`,
  )
export const METHOD_CALC = fr(
  'Pour un thème, votre affinité avec un candidat est celle du tableau « Par thème » de vos résultats : même calcul, mêmes questions, mêmes positions. On en fait la moyenne sur les candidats de chaque bloc connus sur vos questions. Pour une famille de thèmes, on fait d’abord la moyenne des thèmes.',
)
/** « La comparaison » : à quoi l'affinité se compare, et ce que veut dire « nettement » */
export const methodChance = (gapPoints: number) =>
  fr(
    `Une affinité seule ne suffit pas : qui approuve beaucoup est proche de tout le monde, qui désapprouve beaucoup de personne. On refait donc le même calcul pour toutes les façons de poser vos mêmes avis, la vôtre et toutes les autres : sur chaque question, autant de « d’accord », de « pas d’accord » et de « sans avis », répartis entre ses approches. Rien n’est tiré au sort : mêmes réponses, même lecture. Un bloc est « nettement plus près » quand votre affinité avec lui dépasse nettement celle de ces façons (d’au moins ${gapPoints} points, et à ${50 + gapPoints} % au moins), « nettement plus loin » quand elle reste nettement en dessous (d’au moins ${gapPoints} points, et à ${50 - gapPoints} % au plus). « Nettement » : une de ces façons sur dix au plus atteint un tel écart, avec un bloc ou un autre. C’est pourquoi tout approuver, ou tout désapprouver, ne rapproche d’aucun bloc.`,
  )
/**
 * « Compter, sinon calculer » : les deux régimes du calcul (core/echiquier.ts, COUNT_MAX). Les marques manquées par la
 * borne : mesurées le 15 octobre 2026 là où l'on a pu tout compter au-delà de cent mille façons (jusqu'à quelques
 * millions), selon les séries
 */
export const METHOD_REGIMES = fr(
  'Jusqu’à cent mille façons de poser vos mêmes avis, la page les compte toutes, une à une : la part de celles qui font un écart aussi marqué est exacte. Au-delà, le plus souvent pour un domaine entier, elle calcule bloc par bloc la part de celles qui s’écartent autant, au centième de point près (l’arrondi joue toujours contre la lecture), puis additionne ces parts : une borne prudente, qui peut manquer une lecture que ferait le compte complet, jamais en inventer une. Là où l’on a pu tout compter au-delà de cent mille façons, elle en a manqué de 2,5 à 5 % selon les séries, et n’en a ajouté aucune. Les domaines, donc le seul questionnaire rapide, sont ainsi lus plus sévèrement que les thèmes.',
)
export const METHOD_WHEN_NOT = fr(
  'Un thème se lit sur deux questions au moins. Il ne se lit pas quand les candidats de plus d’un bloc sont inconnus sur vos questions. Quand aucun thème d’un domaine ne se lit seul, le domaine entier est lu : c’est ce qui permet une lecture après le seul questionnaire rapide, qui ne pose souvent qu’une question par thème. Avec moins de dix façons de poser vos mêmes avis, rien ne peut être net : la vôtre, qui compte toujours, pèse déjà plus d’une sur dix ; la page le dit.',
)
export const METHOD_NO_POINT = fr(
  'Placer vos réponses en un point entre l’extrême gauche et l’extrême droite les ramènerait vers le centre, et mettrait au centre quelqu’un qui approuve à la fois des approches portées aux deux extrêmes. La page dit donc bloc par bloc ce qui ressort, sans jamais additionner les thèmes ni vous attribuer de position.',
)
/**
 * Ce que valent les lectures, en deux temps : les clones (le bloc désigné, sans puis avec le candidat, bloc vrai par
 * bloc vrai, et les glissements vers un bloc voisin, des deux côtés, tels que les mesure l'audit), puis les feuilles
 * remplies par un programme (combien de lectures, et leur répartition entre les blocs, qui dépend de la façon de
 * répondre)
 */
export const methodWorth = (m: typeof ECHIQUIER_PUBLISHED = ECHIQUIER_PUBLISHED) =>
  [
    fr(
      `Pour l’éprouver, on a recopié les réponses de chaque candidat classé, puis on l’a retiré du calcul. Quand la page conclut, elle désigne son bloc dans ${m.hitWithout} % des cas, de ${m.hitWithoutMin} % à ${m.hitWithoutMax} % selon le bloc, et ${
        m.wrongSideWithout ? `ne lit de l’autre côté du centre que sur ${m.wrongSideWithout} % des thèmes` : 'ne lit jamais de l’autre côté du centre'
      }. Avec lui, comme sur le site, c’est ${m.hitWith} %, de ${m.hitWithMin} % à ${m.hitWithMax} % selon le bloc. Les blocs sont inégalement lisibles : les candidats que la grille classe à l’extrême gauche portent des approches proches entre elles, ceux des autres blocs moins. Des réponses proches de celles d’un candidat sont donc souvent lues dans un bloc voisin du sien, d’un côté comme de l’autre : celles d’un candidat que la grille classe à gauche, « à l’extrême gauche » ; celles d’un candidat qu’elle classe au centre ou à l’extrême droite, « à droite » ; celles d’un candidat qu’elle classe à droite, « au centre » ou « à l’extrême droite ».`,
    ),
    fr(
      `Des questionnaires remplis par un programme, sans suivre aucun candidat, reçoivent une lecture sur un thème sur ${word(oneIn(m.randomThemes))} à un sur ${word(oneIn(m.randomThemesMax))} selon la façon de répondre, soit de ${decimal(m.randomPerProfile)} à ${decimal(m.randomPerProfileMax)} lectures en moyenne sur l’ensemble. Quand les avis sont mêlés (d’accord, pas d’accord, sans avis), aucun bloc n’y est favorisé. ${
        Math.max(m.oneChoiceRatio, m.oneChoiceRatioQuick) < 1.15
          ? 'Quand on n’approuve qu’une approche par question, non plus.'
          : `Quand on n’approuve qu’une approche par question, elles tombent moins souvent sur les candidats que la grille classe à gauche que sur ceux qu’elle classe aux extrêmes : ${times(m.oneChoiceRatio)} moins sur l’ensemble des questions, ${times(m.oneChoiceRatioQuick)} moins après le seul questionnaire rapide.`
      }`,
    ),
  ] as const
/**
 * Ce que devient l'écart entre le bloc le mieux lu et le moins bien lu, en points, et d'où il vient. Mesuré le 15
 * octobre 2026 : il s'élargit par la seule borne prudente, au-delà de cent mille façons ; en les comptant une à une
 * jusqu'à deux millions (tools/audit-echiquier.mjs --count-max 2000000), 43,8 et 90,6, comme avec les tirages. À
 * vérifier de nouveau à chaque republication
 */
const widened = (d: number) =>
  d > 0
    ? `L’écart entre le bloc le mieux lu et le moins bien lu s’élargit donc ${d > 1 ? `de ${d} points` : 'd’un point'} : c’est l’effet de la borne prudente, au-delà de cent mille façons ; en les comptant une à une, jusqu’à deux millions, il ne change pas.`
    : `L’écart entre le bloc le mieux lu et le moins bien lu ${d < 0 ? 'se resserre' : 'ne change pas'}.`
/** « 1,6 puis 1,7 », « au plus 2,4 puis 2,3 » ; le même chiffre avant et après : « toujours 2,4 », « toujours au plus 2,3 » */
const then = (before: string, after: string, lead = '') => (before === after ? `toujours ${lead}${after}` : `${lead}${before} puis ${after}`)
/**
 * « Avant et après » : les chiffres avec les tirages (ECHIQUIER_BEFORE), puis sans (ECHIQUIER_PUBLISHED), sur les
 * mêmes réponses ; le même texte que le journal du 15 octobre 2026, en plus long
 */
export const methodBefore = (m: typeof ECHIQUIER_PUBLISHED = ECHIQUIER_PUBLISHED, b: typeof ECHIQUIER_BEFORE = ECHIQUIER_BEFORE) => {
  const [themesBefore, themesAfter] = [oneIn(b.randomThemesMax), oneIn(m.randomThemesMax)]
  const themes =
    themesBefore === themesAfter
      ? `reçoivent toujours au plus une lecture sur un thème sur ${word(themesAfter)}`
      : `reçoivent au plus une lecture sur un thème sur ${word(themesBefore)} puis sur ${word(themesAfter)}`
  return fr(
    `Jusqu’au 15 octobre 2026, la page tirait au sort 999 de ces façons de poser vos avis ; depuis, elle n’en tire plus aucune. Sur les mêmes réponses, avant puis après : sans le candidat recopié, la page désigne son bloc dans ${b.hitWithout} % puis ${m.hitWithout} % des cas, de ${b.hitWithoutMin} % à ${b.hitWithoutMax} % puis de ${m.hitWithoutMin} % à ${m.hitWithoutMax} % selon le bloc ; les questionnaires remplis par un programme ${themes}, et ${then(decimal(b.randomPerProfileMax), decimal(m.randomPerProfileMax), 'au plus ')} lectures en moyenne sur l’ensemble ; quand on n’approuve qu’une approche par question, chacun des blocs que la grille classe aux extrêmes reçoit en moyenne ${then(decimal(b.oneChoiceRatio), decimal(m.oneChoiceRatio))} fois plus de leurs lectures que celui qu’elle classe à gauche, ${then(decimal(b.oneChoiceRatioQuick), decimal(m.oneChoiceRatioQuick))} fois après le seul questionnaire rapide. ${widened(m.hitWithoutMax - m.hitWithoutMin - (b.hitWithoutMax - b.hitWithoutMin))}`,
  )
}
/**
 * « Lignes rouges et priorités » (lot 2) : où paraît la croix, ce qu'elle ne change pas (HOW_CROSS), ce que deviennent
 * les priorités (METHOD_PRIORITY), puis la mesure de neutralité de la croix, bloc par bloc (ECHIQUIER_CROSS, D5)
 */
export const METHOD_CROSS_WHERE = fr(
  'Sous un bloc nettement plus près, une croix nomme ceux de ses candidats connus sur le sujet qui franchissent une ligne rouge posée sur un de ses thèmes (« pourrait franchir » quand leur position est déduite ou incertaine, comme dans vos résultats) ; le détail, sous l’approche rayée, nomme tous ceux qui la franchissent ou pourraient la franchir. La ligne fermée d’un thème dit seulement s’il est prioritaire.',
)
export { HOW_CROSS } from './echiquierCommonCopy'
/**
 * Les priorités, la règle de HOW_PRIORITY (core/echiquierCopy.ts, « Comment c'est calculé » de la page), où « ici »
 * serait la Méthode : elle nomme la page, comme methodIntro
 */
export const METHOD_PRIORITY = fr(
  'Les priorités comptent double dans votre classement, pas sur la page « Mon profil politique » ; et chaque bloc y est la moyenne de ses candidats : sa lecture peut donc différer de votre classement.',
)
/** « 1,2 à 3,8 % », « 1 à 3,6 % » */
const range = (lo: number, hi: number) => `${decimal(lo)} à ${decimal(hi)} %`
/**
 * La mesure de neutralité de la croix (D5), en deux paragraphes : la croix elle-même, sur la banque puis au seul
 * questionnaire rapide, avec et sans le candidat ; puis « pourrait franchir », bloc par bloc, et d'où vient son écart
 */
export const methodCross = (m: typeof ECHIQUIER_CROSS = ECHIQUIER_CROSS) => {
  const q = m.quick
  const pb = m.possibleBlocs
  const pq = m.possibleBlocsQuick
  return [
    fr(
      `Pour éprouver la croix, on a posé deux lignes rouges parmi les « pas d’accord » des réponses recopiées, puis brouillées, de chaque candidat classé (${m.clones} questionnaires par candidat). Selon le bloc du candidat recopié, la croix paraît sur ${range(m.random.withMin, m.random.withMax)} des sujets lus nettement quand ces lignes rouges ne visent personne (${range(m.random.withoutMin, m.random.withoutMax)} sans lui dans le calcul), sur ${range(m.neighbour.withMin, m.neighbour.withMax)} quand elles visent les candidats d’un bloc voisin (${range(m.neighbour.withoutMin, m.neighbour.withoutMax)}), sur ${range(m.other.withMin, m.other.withMax)} quand elles visent ceux de l’autre côté du centre de la grille (${range(m.other.withoutMin, m.other.withoutMax)}). Ces écarts entre blocs, de ${decimal(m.gapMax)} points au plus, restent sous celui des lectures nettes elles-mêmes (${decimal(m.reference[0])} points avec le candidat, ${decimal(m.reference[1])} sans lui). Après le seul questionnaire rapide, la croix paraît plus souvent : sur ${range(q.random.withMin, q.random.withMax)} des sujets lus nettement quand les lignes rouges ne visent personne (${range(q.random.withoutMin, q.random.withoutMax)} sans lui), sur ${range(q.other.withMin, q.other.withMax)} quand elles visent l’autre côté (${range(q.other.withoutMin, q.other.withoutMax)}), des écarts de ${decimal(q.gapMax)} points au plus, sous ceux des lectures nettes (${decimal(q.reference[0])} et ${decimal(q.reference[1])} points, avec et sans lui) ; mais sur ${range(q.neighbour.withMin, q.neighbour.withMax)} quand elles visent un bloc voisin (${range(q.neighbour.withoutMin, q.neighbour.withoutMax)} sans lui), un écart de ${decimal(q.neighbourGap[0])} points (${decimal(q.neighbourGap[1])} sans lui) qui n’est pas établi : la mesure ne permet de dire ni qu’il reste sous celui des lectures nettes, ni qu’il le dépasse.`,
    ),
    fr(
      `« Pourrait franchir » fait de ${range(m.possible[0], m.possible[1])} des noms cités selon les cas sur la banque entière, de ${range(m.possibleQuick[0], m.possibleQuick[1])} après le seul questionnaire rapide. Selon le bloc, sur la banque, de ${decimal(pb.low)} % sous celui que la grille classe ${pb.lowWhere} à ${decimal(pb.high)} % sous celui qu’elle classe ${pb.highWhere} (${range(pb.withoutLow, pb.withoutHigh)} sans le candidat) ; au rapide, de ${decimal(pq.low)} % sous celui qu’elle classe ${pq.lowWhere} à ${decimal(pq.high)} % sous celui qu’elle classe ${pq.highWhere} (${range(pq.withoutLow, pq.withoutHigh)} sans lui). Ces écarts ne sont pas établis non plus. « Pourrait franchir » vient des positions déduites, ou de confiance basse ; parmi les positions qu’une ligne rouge peut viser, elles en font ${decimal(m.deduced.low)} % chez les candidats que la grille classe ${m.deduced.lowWhere}, ${decimal(m.deduced.high)} % chez ceux qu’elle classe ${m.deduced.highWhere}.`,
    ),
  ] as const
}
/**
 * « Ce qui pèse le plus » (lot 3, A3 ; core/echiquierWeigh.ts) : où paraît la fiche, ce qu'elle dit et comment elle se
 * calcule, ce qu'elle ne change pas. Le même calcul que « Comment c'est calculé » de la page (HOW_WEIGH), dit pour la
 * Méthode : il nomme la page et ce que donne le détail
 */
export const METHOD_WEIGH = fr(
  'Sous une lecture nette, la ligne ouverte dit ce qui y pèse le plus : la question dont vos avis, posés de toutes les autres façons sur ses approches, les autres questions telles quelles, changent le plus votre affinité avec le bloc ; puis, dans cette question, l’avis qui y compte le plus, le texte entier de son approche, et ce qu’elle est pour les candidats que la grille classe là, en nombres, sans aucun nom : leur approche principale, compatible, rejetée, ou portée par aucun. Le détail donne la part de chaque question, en points : sans position incertaine, ces parts font exactement l’écart avec les autres façons de poser vos mêmes avis. Les approches vous ont été présentées sans nom de candidat : les rapprochements sont calculés ensuite. Rien de cela ne change la couleur, la lecture ni l’ordre.',
)
/**
 * La mesure de neutralité de « Ce qui pèse le plus », bloc par bloc (D5, décision du propriétaire du 15 octobre 2026),
 * mesurée le 17 octobre 2026 par tools/audit-poids.mjs --quick, sur 60 clones bruités par candidat (graines « n: » et
 * « nq: » de tools/audit-echiquier.mjs), avec et sans le candidat recopié dans le calcul. La fiche, ou sur des blocs non
 * voisins le renvoi au détail, paraît sous 100 % des lignes lues nettement de chaque bloc vrai (aucune ligne sans fiche ;
 * 25 renvois sur 5 450 lignes avec le candidat, 13 sur 3 379 sans lui) : « passe ». Ce qu'elle dit, part des fiches,
 * selon le bloc vrai, sur la banque :
 * - avec le candidat (référence du même passage : 16,5 points [12,8–20,2]) : approche principale 86,2 % (de 77,5 à
 *   gauche à 90,8 à droite ; 13,3 points [8,9–17,6] : non établi), compatible 10,8 % (de 7,5 à droite à 17,6 à l'extrême
 *   droite ; 10,1 [6–14,2] : passe), rejetée 1,7 % (6,6 [4,5–8,6] : passe), portée par aucun 1,3 % (1,4 [0–3] : passe) ;
 * - sans lui (15,9 points [13,3–18,5]) : principale 80 % (de 75 au centre à 83,8 à droite ; 8,8 [2,3–15,5] : passe),
 *   compatible 16,5 % (9,2 [3–15,7] : passe), rejetée 2 % et portée par aucun 1,4 % (passe).
 * Au seul questionnaire rapide : avec le candidat (15,2 points [8,9–21,4]), principale 90,9 % (de 85 à l'extrême
 * gauche à 97,7 à droite ; 12,7 [7,3–17,6] : non établi), compatible 7,9 % (de 0,9 à droite à 14,3 à l'extrême gauche ;
 * 13,4 [8,6–17,7] : non établi) ; sans lui (17,5 points [12,2–22,6]), principale 86,2 % (de 78 à gauche à 95,4 à droite ;
 * 17,4 [8,2–29] : non établi), compatible 11,8 % (de 3,3 à 19,8 ; 16,5 [7,6–27,4] : non établi) ; rejetée et portée par
 * aucun, moins de 1,2 %, passent. En partie seulement, la part des approches compatibles parmi les positions des
 * candidats de chaque bloc (tools/audit-poids.mjs la refait), de 37,1 % à droite à 52 % à gauche (41,7 au centre, 41,9 à
 * l'extrême droite, 49,7 à l'extrême gauche) : l'approche principale est la plus citée là où elles sont les plus rares
 * (à droite) et la moins citée là où elles sont les plus fréquentes (à gauche), mais l'extrême droite, aussi pauvre en
 * approches compatibles que le centre, a deux fois plus de fiches « compatible » (17,6 % contre 8,6) : contre-vérification
 * du 17 octobre 2026.
 * Selon le candidat, l'approche citée est son approche principale dans 16,3 % (Fabien Roussel) à 72,3 % (Bruno
 * Retailleau) des fiches de son bloc, sur la banque avec lui ; de 15,3 à 73,9 % sans lui ; au rapide, de 16,1 %
 * (Jean-Luc Mélenchon) à 77 % (Nicolas Dupont-Aignan). Une question porte au moins la moitié de l'écart dans 50,6 % des
 * fiches (66,5 % au rapide) ; « Aussi approche principale… » paraît dans le détail de 51,1 % ; un reste de plus de 2
 * points (positions de confiance basse) dans 1,7 %. À 30 clones (une indication), les mêmes parts, à un point près ; sur
 * la banque, avec le candidat, l'approche compatible restait non établie (8,6 points [3–14,4] pour 14,4), et sans lui
 * l'approche principale et compatible aussi (7,2 [0–16,5] et 6,7 [0–15,6] pour 14,9) : 60 les tranchent. Le calcul
 * d'une fiche, sur les 1 880 lignes de famille des clones : 0,1 ms en médiane, 1,1 ms au 99e centile, 1,7 ms au plus
 * (sur Mac ; cinq fois plus sur un téléphone lent, moins d'un centième de seconde). À refaire après une mise à jour des
 * positions, et à reporter ici
 */
export const ECHIQUIER_WEIGH = {
  measured: '2026-10-17',
  /** Clones bruités par candidat : l'effectif de la porte D5 */
  clones: 60,
  /**
   * Sur la banque, part des fiches (%) : en tout, puis la plus basse et la plus haute selon le bloc vrai (et leurs blocs) ;
   * avec puis sans le candidat
   */
  main: { all: 86.2, low: 77.5, lowWhere: 'à gauche', high: 90.8, highWhere: 'à droite', without: 80, withoutLow: 75, withoutHigh: 83.8 },
  compatible: { all: 10.8, without: 16.5 },
  rejects: { all: 1.7, without: 2 },
  none: { all: 1.3, without: 1.4 },
  /** L'écart de l'approche principale avec le candidat, non établi, et la référence du même passage, avec puis sans */
  mainGap: 13.3,
  reference: [16.5, 15.9],
  /** Au seul questionnaire rapide : l'approche principale et l'approche compatible, avec le candidat ; non établies, avec et sans lui */
  quick: { main: 90.9, mainLow: 85, mainHigh: 97.7, compatible: 7.9, compatibleLow: 0.9, compatibleHigh: 14.3 },
  /**
   * La part des approches compatibles parmi les positions des candidats de chaque bloc (tools/audit-poids.mjs), la plus
   * basse et la plus haute : les écarts ne la suivent qu'en partie
   */
  compatibleShare: { low: 37.1, lowWhere: 'à droite', high: 52, highWhere: 'à gauche' },
  /** Selon le candidat, la part des fiches de son bloc dont l'approche citée est son approche principale (%), sur la banque avec lui */
  cited: [16.3, 72.3],
} as const

/**
 * La mesure de neutralité de « Ce qui pèse le plus » (D5) : la fiche sous chaque lecture nette, puis ce qu'elle dit, bloc
 * par bloc, sur la banque avec et sans le candidat, puis au seul questionnaire rapide, et ce que l'écart suit en partie
 */
export const methodWeigh = (m: typeof ECHIQUIER_WEIGH = ECHIQUIER_WEIGH) =>
  fr(
    `Pour éprouver cette fiche, on a repris les réponses recopiées, puis brouillées, de chaque candidat classé (${m.clones} questionnaires par candidat) : elle paraît sous chacune des lectures nettes, quel que soit le bloc du candidat recopié. Sur la banque entière, l’approche citée est l’approche principale de candidats du bloc dans ${decimal(m.main.all)} % des fiches, de ${decimal(m.main.low)} % pour un candidat recopié que la grille classe ${m.main.lowWhere} à ${decimal(m.main.high)} % pour un candidat qu’elle classe ${m.main.highWhere} (${decimal(m.main.without)} %, de ${range(m.main.withoutLow, m.main.withoutHigh)}, sans lui dans le calcul) ; seulement compatible dans ${decimal(m.compatible.all)} % (${decimal(m.compatible.without)} % sans lui), rejetée dans ${decimal(m.rejects.all)} % (${decimal(m.rejects.without)} %), portée par aucun dans ${decimal(m.none.all)} % (${decimal(m.none.without)} %). Ces écarts entre blocs restent sous celui des lectures nettes elles-mêmes (${decimal(m.reference[0])} points avec le candidat, ${decimal(m.reference[1])} sans lui), sauf celui de l’approche principale avec le candidat, ${decimal(m.mainGap)} points, que la mesure ne permet de dire ni sous celui des lectures nettes, ni au-dessus. Après le seul questionnaire rapide, l’approche principale fait ${decimal(m.quick.main)} % des fiches (de ${range(m.quick.mainLow, m.quick.mainHigh)} selon le bloc) et l’approche seulement compatible ${decimal(m.quick.compatible)} % (de ${range(m.quick.compatibleLow, m.quick.compatibleHigh)}) : ces deux écarts ne sont établis ni avec ni sans le candidat. Ces écarts ne suivent qu’en partie la part des approches compatibles parmi les positions des candidats de chaque bloc, de ${decimal(m.compatibleShare.low)} % chez ceux que la grille classe ${m.compatibleShare.lowWhere} à ${decimal(m.compatibleShare.high)} % chez ceux qu’elle classe ${m.compatibleShare.highWhere}. Au sein d’un bloc, l’approche citée est, selon le candidat, son approche principale dans ${range(m.cited[0], m.cited[1])} des fiches de son bloc.`,
  )
/**
 * « Votre façon de répondre » (lot 4, A5 ; ui/profile/rows.ts, mannerOf) : quand la phrase paraît, ce qu'elle ne change
 * pas. Le même seuil que la page : 9 cases sur 10 au moins, la moyenne des autres façons arrondie comme le détail, sur
 * les seuls sujets qui ont une autre façon de poser les mêmes avis
 */
export const METHOD_MANNER = fr(
  'Après les domaines, une phrase sans titre dit, quand c’est vrai, que vos réponses sont en majorité des « pas d’accord » et qu’une case « éloigné », seule, dit peu ; de même pour des « d’accord » et une case « proche ». Elle paraît quand, sur 9 des cases mises à l’épreuve sur 10 au moins, la moyenne des autres façons de poser vos mêmes avis tombe à 39 % ou moins (à 60 % ou plus pour « proche »), et que plus de la moitié de vos questions répondues ont plus de « pas d’accord » que de « d’accord » (ou l’inverse). Seuls comptent les sujets où vos mêmes avis peuvent se poser d’une autre façon : jamais, donc, quand, sur chaque question, vos réponses donnent le même avis à toutes les approches. Elle ne change ni la couleur, ni la lecture, ni l’ordre.',
)
/**
 * La mesure de « Votre façon de répondre » (lot 4, A5), par façon de répondre puis bloc par bloc (D5, décision du
 * propriétaire du 15 octobre 2026), mesurée le 17 octobre 2026 par tools/audit-facon.mjs --quick : le calcul même de la
 * page (readEchiquier, chartRows, mannerOf ; uniformViews pour compter à part les avis uniformes). Refaite le même jour
 * après la contre-vérification, mannerOf ne comptant plus que les sujets qui ont une autre façon de poser les mêmes
 * avis : tous les chiffres ci-dessous sont identiques.
 * Feuilles remplies par un programme, sans suivre aucun candidat (400 par façon de répondre sur la banque, 2 000 au seul
 * questionnaire rapide ; graines « audit-facon:<schéma>:<i> ») : un seul « d'accord » par question et des « pas
 * d'accord » ailleurs, 100 %, côté « éloigné » ; tout sauf un, 100 %, côté « proche » ; des accords seuls (30 % des
 * approches), 33,3 % [28,8–38] sur la banque et 42,1 % [39,9–44,2] au rapide, côté « proche » ; avis mêlés (un quart
 * d'accord, un quart de désaccord ; un tiers de chaque) et un seul accord sans rien d'autre, 0 % ; aucune feuille aux avis
 * uniformes. Un clone large et un clone strict de chaque candidat classé : 15 sur 15, côté « éloigné », sur la banque
 * comme au rapide.
 * Clones bruités, 60 par candidat (l'effectif qui fonde un verdict ; graines « n:<id>:<s> » et « nq:<id>:<s> » de
 * tools/audit-echiquier.mjs), part des feuilles qui montrent la phrase, toujours côté « éloigné », selon le bloc vrai :
 * - banque, avec le candidat : 5,8 %, de 1,1 (gauche, droite) à 12,9 (extrême gauche ; centre 2,5, extrême droite 7,8) ;
 *   11,8 points [5,3–17,4] pour une référence du même passage de 16,5 (les sujets lus nettement, la même que la croix et
 *   « Ce qui pèse le plus ») : non établi ; sans lui, 5,9 %, de 1,1 (droite) à 13,8 ; 12,6 points [6–18,4] pour 15,9 : non
 *   établi ;
 * - rapide, avec le candidat : 34,7 %, de 26,1 (gauche) à 47,2 (extrême droite) ; 21,1 points [7,1–34,3] pour 15,2 : non
 *   établi ; sans lui, 34,6 %, de 25 à 46,7 ; 21,7 points [7,7–34,7] pour 17,5 : non établi.
 * Dans cette mesure, la phrase paraît le plus sur les clones des deux blocs que la grille classe aux extrêmes, sur la
 * banque comme au rapide ; mais les intervalles se recouvrent (au rapide, extrême gauche 37,5 % [31,6–43,8], centre
 * 33,3 % [25,5–42,2] ; sur la banque, extrême droite 7,8 % [4,7–12,6], centre 2,5 % [0,9–7,1]) : cet ordre entre blocs
 * n'est pas établi, et la Méthode le dit (contre-vérification du 17 octobre 2026).
 * Ce que l'affichage suit, feuille par feuille : la part des « pas d'accord » parmi les avis de la feuille. Clones
 * bruités, avec le candidat, par tranche de 5 points de cette part : banque, 0 sur 11 (60 à 65 %), 0 sur 203, 9 sur 516,
 * 41 sur 168, 2 sur 2 (80 à 85 %), soit 1,2 % des feuilles sous 75 % et 25,3 % des autres ; rapide, 0 sur 3 (55 à 60 %),
 * 1 sur 33, 19 sur 199, 125 sur 400, 129 sur 222, 35 sur 40, 3 sur 3 (85 à 90 %), soit 22,8 % et 63 %. Candidat par
 * candidat, de même : dans un même bloc, sur la banque, 0 feuille sur 60 pour Jean-Luc Mélenchon (68,3 % de « pas
 * d'accord » parmi ses avis), 16 pour Anasse Kazib (74,8 %), à l'extrême gauche ; au rapide, 6 pour Raphaël Glucksmann
 * (68,4 %), 24 pour Fabien Roussel (73,2 %), à gauche : les plus grands écarts entre deux candidats d'un même bloc.
 * Bloc par bloc, cette part va de 70,8 % (droite) à 72,9 % (extrême droite) sur la banque (extrême gauche 72,7, centre
 * 72,1, gauche 71,5), de 71 % (gauche) à 74,1 % (extrême gauche) au rapide (extrême droite 73,6, centre 72,5, droite
 * 71,6) : les deux blocs que la grille classe aux extrêmes en comptent le plus, sur la banque comme au rapide ; le seuil
 * de 9 cases sur 10 accentue ces différences de 2 à 3 points. À 30 clones (une indication), les mêmes issues : 8,9 et 8,1
 * points sur la banque, 23,3 et 25,6 au rapide, non établis. À refaire après une mise à jour des positions, et à
 * reporter ici
 */
export const ECHIQUIER_MANNER = {
  measured: '2026-10-17',
  /** Clones bruités par candidat : l'effectif de la porte D5 */
  clones: 60,
  /** Feuilles d'essai aux seuls accords : part de celles qui montrent la phrase, côté « proche » (%), banque puis rapide */
  agreeOnly: [33.3, 42.1],
  /**
   * Clones bruités, sur la banque : part des feuilles qui montrent la phrase (%), en tout, puis bloc vrai par bloc vrai,
   * dans l'ordre de l'axe, et le plus bas et le plus haut d'entre eux ; avec le candidat, puis sans lui
   */
  bank: {
    all: 5.8,
    blocs: [12.9, 1.1, 2.5, 1.1, 7.8],
    lowWhere: 'à gauche ou à droite',
    highWhere: 'à l’extrême gauche',
    without: 5.9,
    withoutBlocs: [13.8, 1.7, 1.7, 1.1, 7.2],
  },
  /** Les mêmes, au seul questionnaire rapide */
  quick: {
    all: 34.7,
    blocs: [37.5, 26.1, 33.3, 27.8, 47.2],
    lowWhere: 'à gauche',
    highWhere: 'à l’extrême droite',
    without: 34.6,
    withoutBlocs: [39.2, 25, 31.7, 27.8, 46.7],
  },
  /** L'écart entre blocs, en points, avec puis sans le candidat (non établi), et la référence du même passage */
  gap: [11.8, 12.6],
  reference: [16.5, 15.9],
  quickGap: [21.1, 21.7],
  quickReference: [15.2, 17.5],
  /** La part des « pas d'accord » parmi les avis des clones bruités, bloc vrai par bloc vrai (%), banque puis rapide */
  style: [72.7, 71.5, 72.1, 70.8, 72.9],
  styleQuick: [74.1, 71, 72.5, 71.6, 73.6],
  /**
   * Ce que l'affichage suit, feuille par feuille (clones bruités, avec le candidat) : la part des feuilles qui montrent
   * la phrase (%) parmi celles qui comptent moins de cut % de « pas d'accord » parmi leurs avis, puis parmi les autres ;
   * sur la banque, puis au rapide
   */
  byShare: { cut: 75, bank: [1.2, 25.3], quick: [22.8, 63] },
  /**
   * Le plus grand écart entre deux candidats recopiés d'un même bloc : les feuilles (sur clones) qui montrent la phrase,
   * pour l'un puis pour l'autre ; sur la banque, puis au rapide
   */
  within: [
    [16, 0],
    [24, 6],
  ],
} as const

/** « 1,1 à 13,8 % » : le plus bas et le plus haut d'une mesure bloc par bloc */
const spread = (xs: readonly number[]) => range(Math.min(...xs), Math.max(...xs))
/**
 * La mesure de « Votre façon de répondre » : sur des questionnaires remplis par un programme, façon de répondre par
 * façon de répondre ; puis bloc par bloc, sur la banque et au seul questionnaire rapide, avec et sans le candidat (D5) ;
 * l'ordre entre blocs, que la mesure n'établit pas ; et ce que l'affichage suit, questionnaire par questionnaire, dans un
 * même bloc, puis bloc par bloc. where : le nom de chaque bloc de l'axe dans une phrase (« à l’extrême gauche »), dans
 * son ordre
 */
export const methodManner = (where: readonly string[], m: typeof ECHIQUIER_MANNER = ECHIQUIER_MANNER) => {
  const top = (xs: readonly number[]) => xs.indexOf(Math.max(...xs))
  const low = (xs: readonly number[]) => xs.indexOf(Math.min(...xs))
  return fr(
    `Sur des questionnaires remplis par un programme, sans suivre aucun candidat, elle paraît sur tous ceux qui n’approuvent qu’une approche par question et désapprouvent les autres (côté « éloigné »), sur tous ceux qui approuvent tout sauf une approche (côté « proche »), sur ${decimal(m.agreeOnly[0])} % de ceux qui ne donnent que des « d’accord » (${decimal(m.agreeOnly[1])} % après le seul questionnaire rapide), jamais quand les avis sont mêlés, ni quand ils n’approuvent qu’une approche sans rien dire des autres. Pour l’éprouver bloc par bloc, on a repris les réponses recopiées, puis brouillées, de chaque candidat classé (${m.clones} questionnaires par candidat) : elle paraît sur ${decimal(m.bank.all)} % d’entre eux, toujours côté « éloigné », de ${decimal(Math.min(...m.bank.blocs))} % pour un candidat recopié que la grille classe ${m.bank.lowWhere} à ${decimal(Math.max(...m.bank.blocs))} % pour un candidat qu’elle classe ${m.bank.highWhere} (${decimal(m.bank.without)} %, de ${spread(m.bank.withoutBlocs)}, sans lui dans le calcul) ; après le seul questionnaire rapide, sur ${decimal(m.quick.all)} %, de ${decimal(Math.min(...m.quick.blocs))} % pour un candidat qu’elle classe ${m.quick.lowWhere} à ${decimal(Math.max(...m.quick.blocs))} % pour un candidat qu’elle classe ${m.quick.highWhere} (${decimal(m.quick.without)} %, de ${spread(m.quick.withoutBlocs)}, sans lui). Ces écarts entre blocs, de ${decimal(m.gap[0])} points sur la banque entière (${decimal(m.gap[1])} sans lui) et de ${decimal(m.quickGap[0])} au rapide (${decimal(m.quickGap[1])}), ne sont pas établis : la mesure ne permet de dire ni qu’ils restent sous celui des lectures nettes elles-mêmes (${decimal(m.reference[0])} et ${decimal(m.reference[1])} points sur la banque, ${decimal(m.quickReference[0])} et ${decimal(m.quickReference[1])} au rapide, avec et sans le candidat), ni qu’ils le dépassent. Dans cette mesure, elle paraît le plus sur les réponses recopiées des candidats que la grille classe aux extrêmes, un ordre entre blocs que la mesure n’établit pas. Ce qu’elle suit, questionnaire par questionnaire, c’est la part des « pas d’accord » parmi les avis : sur la banque, elle paraît sur ${decimal(m.byShare.bank[0])} % des questionnaires qui en comptent moins de ${m.byShare.cut} % et sur ${decimal(m.byShare.bank[1])} % des autres (${decimal(m.byShare.quick[0])} % et ${decimal(m.byShare.quick[1])} % au rapide) ; dans un même bloc, elle peut paraître sur ${m.within[0][0]} questionnaires sur ${m.clones} pour un candidat recopié et sur ${m.within[0][1]} pour un autre (${m.within[1][0]} et ${m.within[1][1]} au rapide). Bloc par bloc, cette part est la plus forte chez les candidats que la grille classe aux extrêmes : sur la banque, de ${decimal(Math.min(...m.style))} % (${where[low(m.style)]}) à ${decimal(Math.max(...m.style))} % (${where[top(m.style)]}) ; au rapide, de ${decimal(Math.min(...m.styleQuick))} % (${where[low(m.styleQuick)]}) à ${decimal(Math.max(...m.styleQuick))} % (${where[top(m.styleQuick)]}) ; le seuil de 9 cases sur 10 accentue ces différences.`,
  )
}
export const METHOD_LIMITS = [
  fr('La grille classe des partis et des candidats, pas des idées ; la présidentielle n’attribue pas de nuances, et certaines ont été déduites (voir '),
  fr('). Une lecture dépend des candidats en lice et de leurs positions, recherchées et résumées par IA : elle peut changer quand elles sont mises à jour. Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
] as const
/** « Vie privée » : le texte du chapeau de la page (core/echiquierCommonCopy.ts) */
export const METHOD_PRIVACY = PRIVACY
