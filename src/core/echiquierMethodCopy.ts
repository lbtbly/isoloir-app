// Les mots de la rubrique « Mon profil politique » de la Méthode (#/methode/profil, ui/profile/MethodSection.tsx), et
// les chiffres qu'elle publie (ECHIQUIER_PUBLISHED). Fonctions pures qui renvoient du texte brut ; la rubrique garde
// autour ses liens et ses balises. À part des mots de la page (core/echiquierCopy.ts) et sans rien de son calcul
// (core/echiquier.ts) : la rubrique, un fichier à part du build chargé à la demande par la Méthode
// (ui/profile/load.ts), les prend ici sans emporter la page. Mêmes règles d'écriture que la page
// (core/echiquierCopy.ts) ; tests/echiquier-copy.test.ts les vérifie.

import { fr, word } from './echiquierCommonCopy'

/** « Les couleurs » : les mots de « Comment lire » de la page (core/echiquierCommonCopy.ts) */
export { COLORS_CHANCE, HOW_COLOR } from './echiquierCommonCopy'

/**
 * Ce que publie la Méthode, mesuré par tools/audit-echiquier.mjs (clones de chaque candidat classé retirés du calcul,
 * profils tirés au hasard selon six façons de répondre) ; tests/echiquier-calibration.test.ts vérifie que la mesure
 * reste à 5 points près (0,5 pour les moyennes et le rapport). Une mise à jour des positions qui les fait bouger :
 * refaire l'audit, reporter ici, et dire le changement au journal.
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
  // randomPerProfileMax 2,3, randomThemesMax 8,5 (« un sur douze »). randomThemes reste à 5 : methodWorth arrondit avant
  // d'inverser, 4 dirait « un sur vingt-cinq » pour un sur vingt et un ou vingt-deux mesuré
  /** Date de la mesure */
  measured: '2026-10-15',
  /** Clones larges, sans le candidat : part des lectures qui désignent son bloc (%) */
  hitWithout: 70,
  /** La même part, bloc vrai par bloc vrai : la plus basse et la plus haute (%) */
  hitWithoutMin: 44,
  hitWithoutMax: 91,
  /** Les mêmes, avec le candidat dans le calcul, comme sur le site (%) */
  hitWith: 91,
  /** La même part avec le candidat, bloc vrai par bloc vrai : la plus basse et la plus haute (%) */
  hitWithMin: 69,
  hitWithMax: 97,
  /** Les mêmes, sans le candidat : part des thèmes lus de l'autre côté du centre (%) */
  wrongSideWithout: 0,
  /** Profils tirés au hasard (un quart d'accord, un quart de désaccord) : part des thèmes lus (%) */
  randomThemes: 5,
  /** La même part, pour la façon de répondre qui en reçoit le plus (un seul accord par question, rien d'autre) (%) */
  randomThemesMax: 9,
  /** Profils tirés au hasard (un quart d'accord, un quart de désaccord) : lectures de la synthèse par profil, en moyenne */
  randomPerProfile: 1.3,
  /** La même moyenne, pour la façon de répondre qui en reçoit le plus */
  randomPerProfileMax: 2.4,
  /**
   * Un seul accord par question (avec ou sans désaccords ailleurs) : dans la synthèse, la part moyenne des blocs que
   * la grille classe aux extrêmes, rapportée à celle du bloc qu'elle classe à gauche ; sur la banque entière, puis sur
   * le seul questionnaire rapide. Ce rapport varie d'un échantillon à l'autre : six échantillons de 1 000 profils par
   * façon de répondre, le 15 octobre 2026, de 1,49 à 1,72 sur la banque entière et de 2,29 à 2,48 au rapide avec les
   * tirages ; avec le calcul sans tirage, un peu plus haut, et dans le même sens à chaque échantillon (+0,05 à +0,10 sur
   * la banque, +0,02 à +0,05 au rapide) : de 1,57 à 1,79 (1,67 en moyenne) et de 2,33 à 2,51 (2,40 en moyenne). Les
   * valeurs publiées, 1,5 et 2,2, donnent les mêmes mots que ces moyennes (« environ une fois et demie », « environ deux
   * fois ») ; publier la moyenne de plusieurs échantillons, pas un seul audit (1,79 dirait « environ deux fois »), et dire
   * au journal que le calcul sans tirage accentue un peu ce déséquilibre. Avis mêlés : chaque bloc reçoit de 17 à 23 % des
   * lectures, aucun n'est favorisé.
   */
  oneChoiceRatio: 1.5,
  oneChoiceRatioQuick: 2.2,
} as const

/** « 1,4 » */
const decimal = (x: number) => String(x).replace('.', ',')
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
  'Vos avis donnent votre affinité par thème avec chaque candidat, le calcul même du score. On en fait la moyenne par bloc de la grille, qui colore sa case, puis on la compare à celle de vos mêmes avis placés au hasard : nettement plus près, rien de net, ou nettement plus loin.',
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
export const methodChance = (gapPoints: number) =>
  fr(
    `Une affinité seule ne suffit pas : qui approuve beaucoup est proche de tout le monde, qui désapprouve beaucoup de personne. On refait donc le même calcul en gardant vos avis, autant de « d’accord », de « pas d’accord » et de « sans avis » sur chaque question, mais placés autrement entre ses approches : tous les placements possibles, le vôtre compris, comptés un à un quand ils sont cent mille au plus. Au-delà, la page calcule bloc par bloc la part de ceux qui font un écart aussi marqué, puis additionne ces parts : ce compte ne peut être que trop prudent. Rien n’est tiré au sort : mêmes réponses, même lecture. Un bloc est « nettement plus près » quand votre affinité avec lui dépasse nettement celle de ces placements (d’au moins ${gapPoints} points, et à ${50 + gapPoints} % au moins), « nettement plus loin » quand elle reste nettement en dessous (d’au moins ${gapPoints} points, et à ${50 - gapPoints} % au plus). « Nettement » : moins d’un de ces placements sur dix atteint un tel écart, tous blocs confondus. C’est pourquoi tout approuver, ou tout désapprouver, ne rapproche d’aucun bloc.`,
  )
export const METHOD_WHEN_NOT = fr(
  'Un thème se lit sur deux questions au moins. Il ne se lit pas quand les candidats de plus d’un bloc sont inconnus sur vos questions. Quand aucun thème d’une famille ne se lit seul, la famille entière est lue : c’est ce qui permet une lecture après le seul questionnaire rapide, qui ne pose souvent qu’une question par thème.',
)
export const METHOD_NO_POINT = fr(
  'Placer vos réponses en un point entre l’extrême gauche et l’extrême droite les ramènerait vers le centre, et mettrait au centre quelqu’un qui approuve à la fois des approches portées aux deux extrêmes. La page dit donc bloc par bloc ce qui ressort, sans jamais additionner les thèmes ni vous attribuer de position.',
)
/**
 * Ce que valent les lectures, en deux temps : les clones (le bloc désigné, et les glissements vers un bloc voisin, des
 * deux côtés, tels que les mesure l'audit), puis le hasard (combien de lectures, et leur répartition entre les blocs,
 * qui dépend de la façon de répondre)
 */
export const methodWorth = (m: typeof ECHIQUIER_PUBLISHED = ECHIQUIER_PUBLISHED) =>
  [
    fr(
      `Pour l’éprouver, on a recopié les réponses de chaque candidat classé, puis on l’a retiré du calcul. Quand la page conclut, elle désigne son bloc dans ${m.hitWithout} % des cas, de ${m.hitWithoutMin} % à ${m.hitWithoutMax} % selon le bloc, et ${
        m.wrongSideWithout ? `ne lit de l’autre côté du centre que sur ${m.wrongSideWithout} % des thèmes` : 'ne lit jamais de l’autre côté du centre'
      }. Avec lui, comme sur le site, c’est ${m.hitWith} %. Les blocs sont inégalement lisibles : les candidats que la grille classe à l’extrême gauche portent des approches proches entre elles, ceux des autres blocs moins. Des réponses proches de celles d’un candidat sont donc souvent lues dans un bloc voisin du sien, d’un côté comme de l’autre : celles d’un candidat que la grille classe à gauche, « à l’extrême gauche » ; celles d’un candidat qu’elle classe au centre ou à l’extrême droite, « à droite » ; celles d’un candidat qu’elle classe à droite, « au centre » ou « à l’extrême droite ».`,
    ),
    fr(
      `Des réponses tirées au hasard reçoivent une lecture sur un thème sur ${word(Math.round(100 / m.randomThemes))} à un sur ${word(Math.round(100 / m.randomThemesMax))} selon la façon de répondre, soit de ${decimal(m.randomPerProfile)} à ${decimal(m.randomPerProfileMax)} lectures en moyenne sur l’ensemble. Quand les avis sont mêlés (d’accord, pas d’accord, sans avis), aucun bloc n’y est favorisé. ${
        Math.max(m.oneChoiceRatio, m.oneChoiceRatioQuick) < 1.15
          ? 'Quand on n’approuve qu’une approche par question, non plus.'
          : `Quand on n’approuve qu’une approche par question, elles tombent moins souvent sur les candidats que la grille classe à gauche que sur ceux qu’elle classe aux extrêmes : ${times(m.oneChoiceRatio)} moins sur l’ensemble des questions, ${times(m.oneChoiceRatioQuick)} moins après le seul questionnaire rapide.`
      }`,
    ),
  ] as const
export const METHOD_LIMITS = [
  fr('La grille classe des partis et des candidats, pas des idées ; la présidentielle n’attribue pas de nuances, et certaines ont été déduites (voir '),
  fr('). Une lecture dépend des candidats en lice et de leurs positions, recherchées et résumées par IA : elle peut changer quand elles sont mises à jour. Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
] as const
export const METHOD_PRIVACY = fr(
  'Calcul sans IA, sur votre appareil ; la lecture reste seulement en mémoire le temps de la visite (un rechargement l’oublie), et rien n’est enregistré ni envoyé.',
)
