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
 * sujets lus nettement. Mesuré le 15 octobre 2026 avec le calcul même de la page (readEchiquier, ui/profile/rows.ts :
 * chartRows et crossingsOf ; core/score.ts : computeResults), sur 30 clones bruités par candidat (graines « n:<id>:<s> »
 * de tools/audit-echiquier.mjs), deux lignes rouges posées parmi leurs « pas d'accord » (une entrée de test, tirée d'une
 * graine), selon trois scénarios : sans viser personne ; parmi les approches que porte un candidat d'un bloc voisin ;
 * parmi celles d'un candidat de l'autre côté du centre (pour un clone du centre, les deux bouts). Part des lignes lues
 * nettement (rows.read) qui montrent une croix, la plus basse et la plus haute selon le bloc vrai (%) :
 * - sans viser personne : avec le candidat 1,2 (centre) à 3,8 (extrême gauche), sans lui 0,5 à 3,3 ;
 * - un bloc voisin : avec 3,2 (gauche) à 6,6 (extrême droite), sans 1,8 à 7,2 ;
 * - l'autre côté : avec 1,0 à 3,6, sans 0,5 à 2,3.
 * Écarts entre blocs : de 1,8 à 5,5 points (fourchettes de Wilson de 0 à 10,7 points), sous la référence du même passage,
 * 14,4 points avec le candidat (de 27,9 à 42,3 % des sujets lus nettement) et 14,9 sans lui : « passe » dans les six cas
 * (la borne haute de l'écart reste sous la référence ; la règle D5, § 2.0 de l'étude). À 60 clones par candidat, les mêmes
 * issues (écarts de 1,1 à 4,1 points, références 16,5 et 15,9). Au seul questionnaire rapide (lignes de famille surtout),
 * la croix paraît plus souvent, et l'écart n'est pas établi quand les lignes rouges visent un bloc voisin : avec le
 * candidat, de 5,0 (centre) à 16,4 % (extrême droite), écart 11,4 points [0,5–21,6] pour une référence de 16,9 ; sans lui,
 * de 2,7 à 19,4 %, 16,7 points [0–26,3] pour 19,9 ; sans viser personne, sans lui, de 0 à 10,8 % (non établi, sur peu
 * de lignes) ; à 60 clones, toujours non établi en visant un bloc voisin (15,1 et 15,8 points pour 15,2 et 17,5).
 * « Pourrait franchir » (niveau « possible » de core/score.ts) : de 11,8 à 21,7 % des noms cités selon le scénario,
 * avec ou sans le candidat ; les trois scénarios réunis, par bloc de la croix, de 8,0 % (droite, 7 sur 88) à 28,8 %
 * (extrême droite, 15 sur 52) avec le candidat, de 6,3 à 25,0 % sans lui : pas l'extrême gauche seule, comme le craignait
 * l'étude. Un candidat qui franchit sûrement une ligne rouge de la ligne n'est compté qu'à ce niveau (crossingsOf) : aucun
 * n'en avait aussi une autre seulement possible sur la banque, un seul au rapide. Feuilles remplies par un programme,
 * sans suivre aucun candidat (schéma « audit »), deux lignes rouges de même : 3,0 % des lignes lues sur la banque, 4,6 %
 * au rapide. Mesure : node tools/audit-croix.mjs --quick (--noisy 60 pour la porte D5) ; à refaire après une mise à jour
 * des positions, et à reporter ici
 */
export const ECHIQUIER_CROSS = {
  measured: '2026-10-15',
  /** Clones bruités par candidat */
  clones: 30,
  /** Part des lignes lues nettement qui montrent une croix, selon le bloc vrai, la plus basse et la plus haute (%) */
  random: { withMin: 1.2, withMax: 3.8, withoutMin: 0.5, withoutMax: 3.3 },
  neighbour: { withMin: 3.2, withMax: 6.6, withoutMin: 1.8, withoutMax: 7.2 },
  other: { withMin: 1, withMax: 3.6, withoutMin: 0.5, withoutMax: 2.3 },
  /** L'écart le plus large entre blocs, en points, et la référence du même passage (sujets lus nettement), avec puis sans */
  gapMax: 5.5,
  reference: [14.4, 14.9],
  /** Au seul questionnaire rapide, lignes rouges visant un bloc voisin, avec le candidat : la plus basse et la plus haute (%) */
  quickNeighbour: [5, 16.4],
  /** « Pourrait franchir » : part des noms cités, selon le scénario (%) */
  possible: [11.8, 21.7],
  /** La même part, trois scénarios réunis, avec le candidat : le bloc de la croix où elle est la plus basse, la plus haute */
  possibleLow: { where: 'à droite', pct: 8 },
  possibleHigh: { where: 'à l’extrême droite', pct: 28.8 },
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
  'Vos avis donnent votre affinité par thème avec chaque candidat, le calcul même du score. On en fait la moyenne par bloc de la grille, qui colore sa case, puis on la compare à celle de vos mêmes avis, posés de toutes les autres façons sur les approches : nettement plus près, rien de net, ou nettement plus loin.',
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
      `Des feuilles remplies par un programme, sans suivre aucun candidat, reçoivent une lecture sur un thème sur ${word(oneIn(m.randomThemes))} à un sur ${word(oneIn(m.randomThemesMax))} selon la façon de répondre, soit de ${decimal(m.randomPerProfile)} à ${decimal(m.randomPerProfileMax)} lectures en moyenne sur l’ensemble. Quand les avis sont mêlés (d’accord, pas d’accord, sans avis), aucun bloc n’y est favorisé. ${
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
    `Jusqu’au 15 octobre 2026, la page tirait au sort 999 de ces façons de poser vos avis ; depuis, elle n’en tire plus aucune. Sur les mêmes réponses, avant puis après : sans le candidat recopié, la page désigne son bloc dans ${b.hitWithout} % puis ${m.hitWithout} % des cas, de ${b.hitWithoutMin} % à ${b.hitWithoutMax} % puis de ${m.hitWithoutMin} % à ${m.hitWithoutMax} % selon le bloc ; les feuilles remplies par un programme ${themes}, et ${then(decimal(b.randomPerProfileMax), decimal(m.randomPerProfileMax), 'au plus ')} lectures en moyenne sur l’ensemble ; quand on n’approuve qu’une approche par question, chacun des blocs que la grille classe aux extrêmes reçoit en moyenne ${then(decimal(b.oneChoiceRatio), decimal(m.oneChoiceRatio))} fois plus de leurs lectures que celui qu’elle classe à gauche, ${then(decimal(b.oneChoiceRatioQuick), decimal(m.oneChoiceRatioQuick))} fois après le seul questionnaire rapide. ${widened(m.hitWithoutMax - m.hitWithoutMin - (b.hitWithoutMax - b.hitWithoutMin))}`,
  )
}
/**
 * « Lignes rouges et priorités » (lot 2) : où paraît la croix, ce qu'elle ne change pas (HOW_CROSS), ce que deviennent
 * les priorités (HOW_PRIORITY), puis la mesure de neutralité de la croix, bloc par bloc (ECHIQUIER_CROSS, D5)
 */
export const METHOD_CROSS_WHERE = fr(
  'Sous un bloc nettement plus près, une croix nomme ceux de ses candidats qui franchissent une ligne rouge posée sur un thème du sujet (« pourrait franchir » quand leur position est déduite ou incertaine, comme dans vos résultats) ; la ligne fermée d’un thème dit seulement s’il est prioritaire.',
)
export { HOW_CROSS, HOW_PRIORITY } from './echiquierCommonCopy'
/** « 1,2 à 3,8 % », « 1 à 3,6 % » */
const range = (lo: number, hi: number) => `${decimal(lo)} à ${decimal(hi)} %`
export const methodCross = (m: typeof ECHIQUIER_CROSS = ECHIQUIER_CROSS) =>
  fr(
    `Pour éprouver la croix, on a posé deux lignes rouges parmi les « pas d’accord » des réponses recopiées, puis brouillées, de chaque candidat classé (${m.clones} feuilles par candidat). Selon le bloc du candidat recopié, la croix paraît sur ${range(m.random.withMin, m.random.withMax)} des sujets lus nettement quand ces lignes rouges ne visent personne (${range(m.random.withoutMin, m.random.withoutMax)} sans lui dans le calcul), sur ${range(m.neighbour.withMin, m.neighbour.withMax)} quand elles visent les candidats d’un bloc voisin (${range(m.neighbour.withoutMin, m.neighbour.withoutMax)}), sur ${range(m.other.withMin, m.other.withMax)} quand elles visent ceux de l’autre côté du centre de la grille (${range(m.other.withoutMin, m.other.withoutMax)}). Ces écarts entre blocs, de ${decimal(m.gapMax)} points au plus, restent sous celui des lectures nettes elles-mêmes (${decimal(m.reference[0])} points avec le candidat, ${decimal(m.reference[1])} sans lui). Après le seul questionnaire rapide, la croix paraît plus souvent, et quand les lignes rouges visent un bloc voisin, son écart entre blocs n’est pas établi (${range(m.quickNeighbour[0], m.quickNeighbour[1])} selon le bloc). « Pourrait franchir » fait de ${range(m.possible[0], m.possible[1])} des noms cités selon les cas ; selon le bloc, de ${decimal(m.possibleLow.pct)} % sous celui que la grille classe ${m.possibleLow.where} à ${decimal(m.possibleHigh.pct)} % sous celui qu’elle classe ${m.possibleHigh.where}.`,
  )
export const METHOD_LIMITS = [
  fr('La grille classe des partis et des candidats, pas des idées ; la présidentielle n’attribue pas de nuances, et certaines ont été déduites (voir '),
  fr('). Une lecture dépend des candidats en lice et de leurs positions, recherchées et résumées par IA : elle peut changer quand elles sont mises à jour. Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
] as const
/** « Vie privée » : le texte du chapeau de la page (core/echiquierCommonCopy.ts) */
export const METHOD_PRIVACY = PRIVACY
