// Série « Alliances » (famille « République et vie politique ») : l'introduction, puis quatre approfondissements
// (se qualifier pour le second tour, la dissolution et le calendrier des législatives, gouverner sans majorité
// absolue, le 49.3 et la censure). Le thème n'a que deux questions dans la banque (strategie-1, strategie-2) :
// leurs fiches sont la seule matière, chiffres compris. Règles d'écriture : ../GUIDE-SERIES.md ; planches :
// ../pistes/planches/strategie.tsx.
// Neutralité : aucun parti, aucune alliance électorale, aucun groupe parlementaire n'est nommé, même quand la
// fiche le fait (« un groupe de droite », « les partis de gauche », « candidats communs ») ; les approches en
// débat (approaches) ne sont jamais présentées, seulement les deux côtés du débat tels que les résument les
// fiches, à égalité.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : composition de l'Assemblée nationale au 3 octobre 2026 (192, 161, 47, 169 ; 70, 67, 38, 17). À revoir
// à chaque changement d'effectif des groupes, et après une éventuelle dissolution.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources des fiches, copiées telles quelles (titres composés à la française) ——— */

const CONSTITUTION_7: VideoSource = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur (article\u00a07)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: 'à jour de la révision constitutionnelle du 8\u00a0mars 2024',
}
const CONSTITUTION_49: VideoSource = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur (article\u00a049)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: 'à jour de la révision constitutionnelle du 8\u00a0mars 2024',
}
const ELECTION_DEPUTES: VideoSource = {
  title: 'Fiche de synthèse n°\u00a03\u00a0: L’élection des députés',
  url: 'https://www.assemblee-nationale.fr/dyn/synthese/deputes-groupes-parlementaires/l-election-des-deputes',
  publisher: 'Assemblée nationale',
  date: 'septembre 2023',
}
const RESPONSABILITE: VideoSource = {
  title: 'Fiche de synthèse n°\u00a064\u00a0: La mise en cause de la responsabilité du Gouvernement',
  url: 'https://www.assemblee-nationale.fr/dyn/synthese/fonctionnement-assemblee-nationale/evaluation-politiques-publiques-controle-gouvernement/la-mise-en-cause-de-la-responsabilite-du-gouvernement',
  publisher: 'Assemblée nationale',
  date: 'actualisée le 6\u00a0décembre 2024',
}
const RESULTATS_2024: VideoSource = {
  title: 'Élections législatives des 30\u00a0juin et 7\u00a0juillet 2024 – Résultats définitifs du 1er\u00a0tour, France entière (fichier)',
  url: 'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/20240710-171253/resultats-definitifs-france-entiere.xlsx',
  publisher: 'Ministère de l’Intérieur (data.gouv.fr)',
  date: '10\u00a0juillet 2024',
}
const CODE_L162: VideoSource = {
  title: 'Code électoral, article L162',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006353380',
  publisher: 'Légifrance',
  date: 'version en vigueur depuis le 9\u00a0décembre 2003',
}
const EFFECTIF: VideoSource = {
  title: 'Effectif des groupes politiques, XVIIe\u00a0législature',
  url: 'https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif',
  publisher: 'Assemblée nationale',
  date: 'page non datée, consultée le 3\u00a0octobre 2026',
}
const CENSURES_49_3: VideoSource = {
  title: 'Engagements de responsabilité du Gouvernement et motions de censure depuis 1958 (article\u00a049, alinéa\u00a03)',
  url: 'https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/engagements-de-responsabilite-du-gouvernement-et-motions-de-censure-depuis-1958',
  publisher: 'Assemblée nationale',
  date: 'mise à jour du 9\u00a0septembre 2025 (lignes jusqu’en janvier 2026)',
}
const CONFIANCE_49_1: VideoSource = {
  title: 'Engagements de responsabilité du Gouvernement sur son programme ou sur une déclaration de politique générale depuis 1958 (article\u00a049, alinéa\u00a01)',
  url: 'https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/engagements-de-responsabilite-du-gouvernement-sur-son-programme-ou-sur-une-declaration-de-politique-generale-depuis-1958',
  publisher: 'Assemblée nationale',
  date: 'mise à jour du 15\u00a0septembre 2025',
}
const MOTIONS: VideoSource = {
  title: 'Motions de censure depuis 1958',
  url: 'https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/motions-de-censure-depuis-1958',
  publisher: 'Assemblée nationale',
  date: 'mise à jour du 15\u00a0janvier 2026 (votes recensés jusqu’au 26\u00a0février 2026)',
}

/* ——— Les chiffres des fiches (strategie-1, strategie-2), et leurs graphiques (explainer-charts.json) ——— */

/** strategie-1, chiffre n° 0 */
const UNION_2024 = {
  value: '27,99\u00a0%',
  label: 'des suffrages exprimés pour les candidats communs de la gauche au 1er\u00a0tour des législatives, France entière (8\u202f971\u202f581\u00a0voix)',
  date: '30\u00a0juin 2024',
}
const UNION_2024_CHART = { kind: 'part', value: 27.99, total: 100, unit: '%', whole: 'des suffrages exprimés' }

/** strategie-1, chiffre n° 1 */
const SEUIL = {
  value: '12,5\u00a0%',
  label: 'des électeurs inscrits\u00a0: score minimal au 1er\u00a0tour des législatives pour se maintenir au second tour dans une circonscription. Si moins de deux candidats l’atteignent, les deux premiers peuvent se maintenir',
  date: 'Règle en vigueur depuis le 9\u00a0décembre 2003',
}

/** strategie-2, chiffre n° 0 (sans nommer de groupe : « un groupe de droite ») */
const BLOCS = {
  value: '192',
  label: 'députés dans les quatre groupes de gauche et écologistes\u202f; 161 dans les trois groupes du centre, dits «\u00a0bloc central\u00a0»\u202f; 47 dans un groupe de droite\u202f; 169 dans les autres groupes ou parmi les non-inscrits (569\u00a0sièges pourvus)',
  date: '3\u00a0octobre 2026',
}

/** strategie-1, chiffre n° 2, et strategie-2, chiffre n° 0 (même source) : les quatre groupes de gauche */
const GROUPES_GAUCHE = {
  value: '192',
  label: 'députés de gauche et écologistes, répartis en quatre groupes\u00a0: 70, 67, 38 et 17 (569\u00a0sièges pourvus)',
  date: '3\u00a0octobre 2026',
}

/** strategie-2, chiffre n° 1 */
const CENSURE_2024 = {
  value: '331',
  label: 'voix pour la motion de censure du 4\u00a0décembre 2024, déposée après un recours au 49.3 sur le budget de la Sécurité sociale\u202f; 288 étaient nécessaires. Le gouvernement, nommé trois mois plus tôt, a été renversé',
  date: '4\u00a0décembre 2024',
}
const CENSURE_2024_CHART = {
  kind: 'compare',
  unit: 'voix',
  items: [
    { label: 'Voix pour la motion', value: 331 },
    { label: 'Voix nécessaires', value: 288 },
  ],
}

/** strategie-2, chiffre n° 2 */
const CONFIANCE_2025 = {
  value: '364 contre 194',
  label: 'députés ont refusé la confiance que le gouvernement avait lui-même demandée\u202f; il a dû démissionner. C’est le seul des 42\u00a0votes de confiance demandés depuis 1958 (article\u00a049, alinéa\u00a01) à avoir été perdu',
  date: '8\u00a0septembre 2025',
}
const CONFIANCE_2025_CHART = {
  kind: 'compare',
  unit: 'députés',
  items: [
    { label: 'Contre la confiance', value: 364 },
    { label: 'Pour la confiance', value: 194 },
  ],
}

/** strategie-2, chiffre n° 2 : le nombre de votes de confiance écrit dans son libellé (« le seul des 42 votes de
 *  confiance demandés depuis 1958 »), compté par la source jusqu’au vote du 8 septembre 2025 inclus */
const VOTES_CONFIANCE = {
  value: '42',
  label: 'votes de confiance demandés depuis 1958 (article\u00a049, alinéa\u00a01)\u202f; celui du 8\u00a0septembre 2025 est le seul à avoir été perdu',
  date: '8\u00a0septembre 2025',
}

/** strategie-2, chiffre n° 3 */
const CENSURE_2025 = {
  value: '271',
  label: 'voix pour la motion de censure du 16\u00a0octobre 2025\u202f; 289 étaient nécessaires (majorité absolue des membres de l’Assemblée). La motion a été rejetée et le gouvernement est resté en place',
  date: '16\u00a0octobre 2025',
}
const CENSURE_2025_CHART = {
  kind: 'compare',
  unit: 'voix',
  items: [
    { label: 'Voix pour la motion', value: 271 },
    { label: 'Voix nécessaires', value: 289 },
  ],
}

/** La composition de l'Assemblée, dite de la même façon dans l'introduction et dans « Majorité » : la planche
 *  y retrouve les quatre nombres et ce qu'ils comptent */
const COMPOSITION =
  'Début octobre 2026, l’Assemblée compte 192\u00a0députés de gauche et écologistes, et 161 au centre. S’y ajoutent 47\u00a0députés dans un groupe de droite, et 169 autres.'
const COMPOSITION_DITE =
  'Début octobre deux mille vingt-six, l’Assemblée compte cent quatre-vingt-douze députés de gauche et écologistes, et cent soixante et un au centre. S’y ajoutent quarante-sept députés dans un groupe de droite, et cent soixante-neuf autres.'
const COMPOSITION_ALT =
  'Quatre barres à la même échelle, depuis zéro\u00a0: gauche et écologistes, centre, un groupe de droite, autres (autres groupes ou sans groupe). Un trait en pointillé marque la moitié des 569\u00a0sièges pourvus\u202f; aucune barre ne l’atteint.'

export const STRATEGIE: VideoSeries = {
  topicId: 'strategie',
  familyId: 'republique',
  label: 'Alliances',
  videos: [
    {
      id: 'alliances-intro',
      kind: 'intro',
      questionIds: ['strategie-1', 'strategie-2'],
      title: 'Les alliances, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'alliances-intro-01',
          say: 'En 2027, vous élirez le président de la République. Pour gagner, puis pour gouverner, avec qui s’allier\u202f?',
          spoken: 'En deux mille vingt-sept, vous élirez le président de la République. Pour gagner, puis pour gouverner, avec qui s’allier ?',
          visual: 'hook',
          draw: 'Trois personnes au trait, à distance l’une de l’autre\u202f; des traits en pointillé cherchent à les relier, un point d’interrogation au-dessus.',
          emphasis: ['avec qui s’allier'],
        },
        {
          id: 'alliances-intro-02',
          say: 'À la présidentielle, seuls les deux premiers du premier tour, après d’éventuels retraits, peuvent se présenter au second tour.',
          visual: 'point',
          draw: 'Six personnes en rang au premier tour\u202f; les deux premières, au bleu bille, passent par deux flèches vers le second tour.',
          emphasis: ['les deux premiers'],
        },
        {
          id: 'alliances-intro-03',
          say: 'Aux législatives anticipées de 2024, les partis de gauche avaient présenté des candidats communs. Au premier tour, ces candidats ont obtenu 27,99\u00a0% des suffrages exprimés.',
          spoken: 'Aux législatives anticipées de deux mille vingt-quatre, les partis de gauche avaient présenté des candidats communs. Au premier tour, ces candidats ont obtenu vingt-sept virgule quatre-vingt-dix-neuf pour cent des suffrages exprimés.',
          visual: 'figure',
          draw: 'Un disque au trait, les suffrages exprimés\u202f; un peu plus d’un quart se hachure au bleu bille.',
          emphasis: ['candidats communs', '27,99\u00a0%'],
          figure: { ...UNION_2024, sourceIndex: 1 },
          chart: UNION_2024_CHART,
        },
        {
          id: 'alliances-intro-04',
          say: `${COMPOSITION} Aucun bloc n’a seul la majorité absolue.`,
          spoken: `${COMPOSITION_DITE} Aucun bloc n’a seul la majorité absolue.`,
          visual: 'figure',
          draw: 'Quatre barres horizontales à la même échelle, depuis zéro, une par ensemble de députés\u202f; un trait en pointillé, la moitié des sièges, qu’aucune n’atteint.',
          alt: COMPOSITION_ALT,
          emphasis: ['Aucun bloc'],
          figure: { ...BLOCS, sourceIndex: 2 },
        },
        {
          id: 'alliances-intro-05',
          say: 'En décembre 2024, les députés ont renversé un gouvernement par une motion de censure. En septembre 2025, un autre a dû démissionner, après avoir perdu un vote de confiance.',
          spoken: 'En décembre deux mille vingt-quatre, les députés ont renversé un gouvernement par une motion de censure. En septembre deux mille vingt-cinq, un autre a dû démissionner, après avoir perdu un vote de confiance.',
          visual: 'timeline',
          draw: 'Une frise de mi-2024 à fin 2025\u202f; deux fanions au bleu bille, en décembre 2024 et en septembre 2025\u202f; au-dessus de chacun, la mallette d’un gouvernement et une flèche vers le bas.',
          alt: 'Une frise graduée 2025 et 2026\u202f; à chaque date, un fanion, la mallette d’un gouvernement et une flèche vers le bas.',
          emphasis: ['décembre 2024', 'septembre 2025'],
        },
        {
          id: 'alliances-intro-06',
          say: 'Les pouvoirs de l’Assemblée élue en juillet 2024 expirent en juin 2029. Des législatives en 2027 supposent donc une dissolution.',
          spoken: 'Les pouvoirs de l’Assemblée élue en juillet deux mille vingt-quatre expirent en juin deux mille vingt-neuf. Des législatives en deux mille vingt-sept supposent donc une dissolution.',
          visual: 'timeline',
          draw: 'Une frise de 2024 à 2029\u202f; la bande de l’Assemblée court de juillet 2024 à juin 2029\u202f; à 2027, un repère en pointillé, la dissolution.',
          alt: 'Une frise graduée de 2024 à 2029.',
          emphasis: ['juin 2029', 'une dissolution'],
        },
        {
          id: 'alliances-intro-07',
          say: 'Alors, quatre questions se posent. Pour 2027, s’allier, et jusqu’où\u202f? Dissoudre l’Assemblée, ou non\u202f? Avec qui gouverner\u202f? Et comment faire adopter ses textes\u202f?',
          spoken: 'Alors, quatre questions se posent. Pour deux mille vingt-sept, s’allier, et jusqu’où ? Dissoudre l’Assemblée, ou non ? Avec qui gouverner ? Et comment faire adopter ses textes ?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: une personne, un calendrier, un monument, un document.',
          emphasis: ['jusqu’où', 'Dissoudre', 'Avec qui gouverner'],
        },
        {
          id: 'alliances-intro-08',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Le sommaire de la série\u00a0: les quatre approfondissements en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [CONSTITUTION_7, RESULTATS_2024, EFFECTIF, CENSURES_49_3, CONFIANCE_49_1, ELECTION_DEPUTES],
    },
    {
      id: 'alliances-premier-tour',
      kind: 'deep',
      questionIds: ['strategie-1'],
      title: 'S’allier pour les élections de 2027\u202f?',
      short: 'Premier tour',
      register: 'vous',
      segments: [
        {
          id: 'alliances-premier-tour-01',
          say: 'Vous votez au premier tour. Mais qui pourra encore se présenter au second\u202f?',
          visual: 'hook',
          draw: 'Une urne au trait où glisse une enveloppe\u202f; une flèche part vers un second tour marqué d’un point d’interrogation.',
          emphasis: ['au second'],
        },
        {
          id: 'alliances-premier-tour-02',
          say: 'À la présidentielle, seuls les deux premiers, après d’éventuels retraits, peuvent se présenter au second tour.',
          visual: 'point',
          draw: 'Six personnes en rang au premier tour\u202f; les deux premières, au bleu bille, passent par deux flèches vers le second tour.',
          emphasis: ['les deux premiers'],
        },
        {
          id: 'alliances-premier-tour-03',
          say: 'Pour être élu, il faut ensuite la majorité absolue des suffrages exprimés, c’est-à-dire plus de la moitié.',
          visual: 'point',
          draw: 'Une barre des suffrages exprimés, coupée en son milieu par un trait en pointillé\u202f; la part comptée au bleu bille dépasse le milieu.',
          alt: 'Une barre des suffrages exprimés, son milieu marqué.',
          emphasis: ['plus de la moitié'],
        },
        {
          id: 'alliances-premier-tour-04',
          say: 'Aux législatives, pour se maintenir au second tour, il faut les voix d’au moins 12,5\u00a0% des inscrits de la circonscription. Soit un inscrit sur huit.',
          spoken: 'Aux législatives, pour se maintenir au second tour, il faut les voix d’au moins douze virgule cinq pour cent des inscrits de la circonscription. Soit un inscrit sur huit.',
          visual: 'figure',
          draw: 'Huit personnes en rang\u202f; l’une se compte au bleu bille.',
          emphasis: ['12,5\u00a0%', 'un inscrit sur huit'],
          figure: { ...SEUIL, sourceIndex: 1 },
        },
        {
          id: 'alliances-premier-tour-05',
          say: 'Si moins de deux candidats atteignent ce seuil, les deux premiers peuvent quand même se maintenir.',
          visual: 'point',
          draw: 'Des barres de candidats sous un trait en pointillé, le seuil\u202f; une seule le passe\u202f; les deux plus hautes passent au bleu bille.',
          alt: 'Le seuil, en pointillé, au-dessus des barres des candidats.',
          emphasis: ['les deux premiers'],
        },
        {
          id: 'alliances-premier-tour-06',
          say: 'En 2024, les partis de gauche avaient présenté des candidats communs. Au premier tour des législatives, ces candidats ont obtenu 27,99\u00a0% des suffrages exprimés\u00a0: près de 9\u00a0millions de voix.',
          spoken: 'En deux mille vingt-quatre, les partis de gauche avaient présenté des candidats communs. Au premier tour des législatives, ces candidats ont obtenu vingt-sept virgule quatre-vingt-dix-neuf pour cent des suffrages exprimés : près de neuf millions de voix.',
          visual: 'figure',
          draw: 'Un disque au trait, les suffrages exprimés\u202f; un peu plus d’un quart se hachure au bleu bille.',
          emphasis: ['candidats communs', '27,99\u00a0%'],
          figure: { ...UNION_2024, sourceIndex: 2 },
          chart: UNION_2024_CHART,
        },
        {
          id: 'alliances-premier-tour-07',
          say: 'Début octobre 2026, les 192\u00a0députés de gauche et écologistes se répartissent en quatre groupes\u00a0: 70, 67, 38 et 17.',
          spoken: 'Début octobre deux mille vingt-six, les cent quatre-vingt-douze députés de gauche et écologistes se répartissent en quatre groupes : soixante-dix, soixante-sept, trente-huit et dix-sept.',
          visual: 'figure',
          draw: 'Quatre colonnes à la même échelle, depuis zéro, une par groupe, chacune avec son nombre de députés.',
          emphasis: ['quatre groupes'],
          figure: { ...GROUPES_GAUCHE, sourceIndex: 3 },
        },
        {
          id: 'alliances-premier-tour-08',
          say: 'Pour les uns, l’union aide à se qualifier pour le second tour. Pour d’autres, elle gêne le rassemblement nécessaire pour gagner.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: une porte sur un plateau, une cible sur l’autre, chaque étiquette quand la voix la dit.',
          emphasis: ['aide à se qualifier', 'gêne le rassemblement'],
        },
        {
          id: 'alliances-premier-tour-09',
          say: 'Alors, pour les élections de 2027, avec qui s’allier, et jusqu’où\u202f?',
          spoken: 'Alors, pour les élections de deux mille vingt-sept, avec qui s’allier, et jusqu’où ?',
          visual: 'question',
          draw: 'Trois personnes, des liens en pointillé entre elles, et un point d’interrogation.',
          emphasis: ['avec qui s’allier', 'jusqu’où'],
        },
      ],
      sources: [CONSTITUTION_7, CODE_L162, RESULTATS_2024, EFFECTIF],
    },
    {
      id: 'alliances-dissolution',
      kind: 'deep',
      questionIds: ['strategie-1', 'strategie-2'],
      title: 'Des législatives dès 2027\u202f?',
      short: 'Dissolution',
      register: 'vous',
      segments: [
        {
          id: 'alliances-dissolution-01',
          say: 'En 2027, vous élirez le président de la République. Élirez-vous aussi de nouveaux députés\u202f?',
          spoken: 'En deux mille vingt-sept, vous élirez le président de la République. Élirez-vous aussi de nouveaux députés ?',
          visual: 'hook',
          draw: 'Un calendrier marqué 2027 à côté du monument de l’Assemblée, un point d’interrogation au-dessus.',
          emphasis: ['de nouveaux députés'],
        },
        {
          id: 'alliances-dissolution-02',
          say: 'Pas forcément. Les pouvoirs de l’Assemblée expirent «\u00a0le troisième mardi de juin de la cinquième année qui suit son élection\u00a0». Les législatives ont lieu dans les 60\u00a0jours qui précèdent.',
          spoken: 'Pas forcément. Les pouvoirs de l’Assemblée expirent « le troisième mardi de juin de la cinquième année qui suit son élection ». Les législatives ont lieu dans les soixante jours qui précèdent.',
          visual: 'point',
          draw: 'Une ligne de cinq années, le monument de l’Assemblée au départ, un calendrier à la fin\u202f; juste avant la fin, un court trait au bleu bille montré du doigt, le temps des législatives.',
          alt: 'Une ligne de cinq années, de l’élection de l’Assemblée à la fin de ses pouvoirs.',
          emphasis: ['troisième mardi de juin', '60\u00a0jours'],
        },
        {
          id: 'alliances-dissolution-03',
          say: 'L’Assemblée actuelle a été élue en juillet 2024, lors de législatives anticipées. Ses pouvoirs expirent donc en juin 2029.',
          spoken: 'L’Assemblée actuelle a été élue en juillet deux mille vingt-quatre, lors de législatives anticipées. Ses pouvoirs expirent donc en juin deux mille vingt-neuf.',
          visual: 'timeline',
          draw: 'Une frise de 2024 à 2029\u202f; la bande de l’Assemblée se trace de juillet 2024 à juin 2029.',
          alt: 'Une frise graduée de 2024 à 2029.',
          emphasis: ['juillet 2024', 'juin 2029'],
        },
        {
          id: 'alliances-dissolution-04',
          say: 'Pour voter plus tôt, il faut une dissolution\u00a0: le président de la République peut dissoudre l’Assemblée, selon l’article\u00a012 de la Constitution.',
          spoken: 'Pour voter plus tôt, il faut une dissolution : le président de la République peut dissoudre l’Assemblée, selon l’article douze de la Constitution.',
          visual: 'point',
          draw: 'Le monument de l’Assemblée passe en pointillé\u202f; à côté, le texte de la Constitution, ouvert à l’article\u00a012.',
          emphasis: ['une dissolution', 'article\u00a012'],
        },
        {
          id: 'alliances-dissolution-05',
          say: 'Le président élu en 2027 pourra donc dissoudre l’Assemblée. Vous éliriez alors de nouveaux députés.',
          spoken: 'Le président élu en deux mille vingt-sept pourra donc dissoudre l’Assemblée. Vous éliriez alors de nouveaux députés.',
          visual: 'timeline',
          draw: 'Sur la frise, à 2027, une branche au bleu bille part vers une nouvelle Assemblée\u202f; la suite de l’ancienne bande passe en pointillé.',
          alt: 'Une frise graduée de 2024 à 2029\u00a0: la bande de l’Assemblée élue en juillet 2024 s’arrête en 2027, sa suite jusqu’en juin 2029 en pointillé, et une nouvelle bande part de 2027.',
          emphasis: ['pourra donc dissoudre'],
        },
        {
          id: 'alliances-dissolution-06',
          say: 'Sinon, le gouvernement devra composer avec l’Assemblée élue en juillet 2024, jusqu’en juin 2029.',
          spoken: 'Sinon, le gouvernement devra composer avec l’Assemblée élue en juillet deux mille vingt-quatre, jusqu’en juin deux mille vingt-neuf.',
          visual: 'timeline',
          draw: 'Sur la même frise, la bande de l’Assemblée élue en 2024 continue jusqu’en juin 2029, au bleu bille\u202f; la branche de 2027 reste en pointillé.',
          alt: 'Une frise graduée de 2024 à 2029\u202f; la nouvelle Assemblée possible dès 2027 reste en pointillé.',
          emphasis: ['composer'],
        },
        {
          id: 'alliances-dissolution-07',
          say: 'Alors, en 2027, garder l’Assemblée élue en 2024, ou en élire une nouvelle\u202f?',
          spoken: 'Alors, en deux mille vingt-sept, garder l’Assemblée élue en deux mille vingt-quatre, ou en élire une nouvelle ?',
          visual: 'question',
          draw: 'Deux monuments côte à côte, l’un au trait plein, l’autre en pointillé, et un point d’interrogation entre eux.',
          emphasis: ['garder', 'une nouvelle'],
        },
      ],
      sources: [ELECTION_DEPUTES],
    },
    {
      id: 'alliances-majorite',
      kind: 'deep',
      questionIds: ['strategie-2'],
      title: 'Gouverner sans majorité absolue',
      short: 'Majorité',
      register: 'vous',
      segments: [
        {
          id: 'alliances-majorite-01',
          say: 'Un gouvernement peut-il rester en place sans majorité à l’Assemblée\u202f?',
          visual: 'hook',
          draw: 'Le monument de l’Assemblée, à côté la mallette du gouvernement, et un point d’interrogation.',
          emphasis: ['sans majorité'],
        },
        {
          id: 'alliances-majorite-02',
          say: `${COMPOSITION} Aucun bloc n’a donc seul la majorité absolue.`,
          spoken: `${COMPOSITION_DITE} Aucun bloc n’a donc seul la majorité absolue.`,
          visual: 'figure',
          draw: 'Quatre barres horizontales à la même échelle, depuis zéro, une par ensemble de députés\u202f; un trait en pointillé, la moitié des sièges, qu’aucune n’atteint.',
          alt: COMPOSITION_ALT,
          emphasis: ['Aucun bloc'],
          figure: { ...BLOCS, sourceIndex: 1 },
        },
        {
          id: 'alliances-majorite-03',
          say: 'Or un gouvernement tombe si la majorité absolue des députés vote contre lui une motion de censure.',
          visual: 'point',
          draw: 'Dix personnes en rang, coupées en deux par un trait\u202f; six se comptent au bleu bille, sous une accolade\u202f; à côté de la mallette du gouvernement, une flèche vers le bas.',
          alt: 'Un trait marque la moitié des députés.',
          emphasis: ['la majorité absolue', 'motion de censure'],
        },
        {
          id: 'alliances-majorite-04',
          say: 'Seuls les votes pour la motion sont comptés. S’abstenir revient donc à laisser le gouvernement en place.',
          visual: 'point',
          draw: 'Dix personnes en rang, coupées en deux par un trait\u202f; quatre se comptent au bleu bille, les six autres passent en pointillé\u202f; la mallette du gouvernement reste en place.',
          alt: 'Un trait marque la moitié des députés.',
          emphasis: ['votes pour', 'S’abstenir'],
        },
        {
          id: 'alliances-majorite-05',
          say: 'En septembre 2025, un gouvernement a lui-même demandé la confiance des députés. Il l’a perdue, par 364\u00a0voix contre 194, et a dû démissionner.',
          spoken: 'En septembre deux mille vingt-cinq, un gouvernement a lui-même demandé la confiance des députés. Il l’a perdue, par trois cent soixante-quatre voix contre cent quatre-vingt-quatorze, et a dû démissionner.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: contre la confiance, pour la confiance.',
          alt: 'Deux barres à la même échelle\u00a0: contre la confiance, pour la confiance.',
          emphasis: ['364\u00a0voix', '194'],
          figure: { ...CONFIANCE_2025, sourceIndex: 2 },
          chart: CONFIANCE_2025_CHART,
        },
        {
          id: 'alliances-majorite-06',
          say: 'De 1958 à septembre 2025, c’est le seul des 42\u00a0votes de confiance demandés à avoir été perdu.',
          spoken: 'De mille neuf cent cinquante-huit à septembre deux mille vingt-cinq, c’est le seul des quarante-deux votes de confiance demandés à avoir été perdu.',
          visual: 'figure',
          draw: 'Quarante-deux cases en grille\u202f; une seule, la dernière, se compte au bleu bille.',
          alt: 'Quarante-deux cases, de 1958 à 2025\u202f; la dernière est comptée.',
          emphasis: ['le seul', '42\u00a0votes'],
          figure: { ...VOTES_CONFIANCE, sourceIndex: 2 },
        },
        {
          id: 'alliances-majorite-07',
          say: 'En octobre 2025, une motion de censure a recueilli 271\u00a0voix, pour 289 nécessaires. Le gouvernement est resté en place.',
          spoken: 'En octobre deux mille vingt-cinq, une motion de censure a recueilli deux cent soixante et onze voix, pour deux cent quatre-vingt-neuf nécessaires. Le gouvernement est resté en place.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les voix pour la motion, un peu plus courte que les voix nécessaires.',
          alt: 'Deux barres à la même échelle\u00a0: voix pour la motion, voix nécessaires.',
          emphasis: ['271\u00a0voix', '289'],
          figure: { ...CENSURE_2025, sourceIndex: 3 },
          chart: CENSURE_2025_CHART,
        },
        {
          id: 'alliances-majorite-08',
          say: 'S’allier au centre, voire à une partie de la droite, élargit la base du gouvernement, mais impose des compromis durables. S’en passer évite ces compromis, mais expose davantage à la censure.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal, plateaux égaux\u00a0: deux personnes sur l’un, une seule sur l’autre, chaque étiquette quand la voix la dit.',
          emphasis: ['S’allier au centre', 'S’en passer'],
        },
        {
          id: 'alliances-majorite-09',
          say: 'Alors, quelle attitude adopter envers le centre et la droite modérée pour gouverner\u202f?',
          visual: 'question',
          draw: 'Le monument de l’Assemblée, des personnes dessinées de part et d’autre, et un point d’interrogation.',
          emphasis: ['quelle attitude'],
        },
      ],
      sources: [CONSTITUTION_49, EFFECTIF, CONFIANCE_49_1, MOTIONS],
    },
    {
      id: 'alliances-49-3',
      kind: 'deep',
      questionIds: ['strategie-2'],
      title: 'Le 49.3 et la motion de censure',
      short: 'Le 49.3',
      register: 'vous',
      segments: [
        {
          id: 'alliances-49-3-01',
          say: 'Un texte de loi peut-il être adopté sans vote des députés\u202f?',
          visual: 'hook',
          draw: 'Un document de loi, à côté le monument de l’Assemblée, et un point d’interrogation entre les deux.',
          emphasis: ['sans vote'],
        },
        {
          id: 'alliances-49-3-02',
          say: 'Oui. L’article\u00a049.3 de la Constitution permet d’adopter un texte sans vote.',
          spoken: 'Oui. L’article quarante-neuf trois de la Constitution permet d’adopter un texte sans vote.',
          visual: 'point',
          draw: 'Le document passe au-dessus des députés, en pointillé, et reçoit son tampon d’adoption au bleu bille.',
          emphasis: ['49.3', 'sans vote'],
        },
        {
          id: 'alliances-49-3-03',
          say: 'Sauf si une motion de censure est votée en réponse\u00a0: le texte n’est alors pas adopté, et le gouvernement tombe.',
          visual: 'point',
          draw: 'Une motion de censure, au bleu bille, arrive\u00a0: le texte passe en pointillé, et une flèche vers le bas se pose à côté de la mallette du gouvernement.',
          emphasis: ['une motion de censure', 'le gouvernement tombe'],
        },
        {
          id: 'alliances-49-3-04',
          say: 'De 1988 à 1993, des gouvernements sans majorité absolue y ont eu recours 39\u00a0fois.',
          spoken: 'De mille neuf cent quatre-vingt-huit à mille neuf cent quatre-vingt-treize, des gouvernements sans majorité absolue y ont eu recours trente-neuf fois.',
          visual: 'figure',
          draw: 'Trente-neuf cases qui se comptent au bleu bille, une par recours, entre 1988 et 1993.',
          emphasis: ['39\u00a0fois'],
          figure: {
            value: '39\u00a0fois',
            label: 'Recours à l’article\u00a049.3 par des gouvernements sans majorité absolue, de 1988 à 1993',
            date: '1988-1993',
            sourceIndex: 0,
          },
        },
        {
          id: 'alliances-49-3-05',
          say: 'Une révision de la Constitution, le 23\u00a0juillet 2008, l’a limité. Depuis, il ne vaut que pour les budgets de l’État et de la Sécurité sociale, plus un autre texte par session.',
          spoken: 'Une révision de la Constitution, le vingt-trois juillet deux mille huit, l’a limité. Depuis, il ne vaut que pour les budgets de l’État et de la Sécurité sociale, plus un autre texte par session.',
          visual: 'point',
          draw: 'La date en gros\u202f; trois documents côte à côte\u00a0: le budget de l’État, celui de la Sécurité sociale, et un autre texte par session, les deux premiers réunis par une accolade, «\u00a0budgets\u00a0».',
          emphasis: ['l’État', 'la Sécurité sociale', 'un autre texte par session'],
        },
        {
          id: 'alliances-49-3-06',
          say: 'En décembre 2024, le gouvernement a eu recours au 49.3 sur le budget de la Sécurité sociale. Une motion de censure a alors recueilli 331\u00a0voix, pour 288 nécessaires. Il a été renversé.',
          spoken: 'En décembre deux mille vingt-quatre, le gouvernement a eu recours au quarante-neuf trois sur le budget de la Sécurité sociale. Une motion de censure a alors recueilli trois cent trente et une voix, pour deux cent quatre-vingt-huit nécessaires. Il a été renversé.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les voix pour la motion dépassent les voix nécessaires.',
          alt: 'Deux barres à la même échelle\u00a0: voix pour la motion, voix nécessaires.',
          emphasis: ['331\u00a0voix', '288'],
          figure: { ...CENSURE_2024, sourceIndex: 1 },
          chart: CENSURE_2024_CHART,
        },
        {
          id: 'alliances-49-3-07',
          say: 'Alors, sans majorité absolue, comment faire adopter ses textes\u202f?',
          visual: 'question',
          draw: 'Une pile de documents devant le monument de l’Assemblée, et un point d’interrogation.',
          emphasis: ['comment faire adopter'],
        },
      ],
      sources: [RESPONSABILITE, CENSURES_49_3],
    },
  ],
}
