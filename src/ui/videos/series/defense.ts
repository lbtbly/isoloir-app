// Série « Défense » (famille « Europe et monde ») : l'introduction, puis quatre approfondissements (budget,
// alliances, dissuasion nucléaire, désarmement). Matière : les fiches des questions international_defense-3 et
// international_defense-5 (research/choisir-2027/explainers.json), et leurs graphiques. Règles d'écriture :
// ../GUIDE-SERIES.md ; planches : ../pistes/planches/defense.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison une fois la voix enregistrée : changer un
// « say » ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : pays associés à la « dissuasion avancée » au 15 septembre 2026 (dix) ; États parties au traité
// d'interdiction des armes nucléaires au 3 octobre 2026 (75) ; plans présentés au titre des prêts européens
// d'armement (dix-neuf États). À revoir avant le vote.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources, copiées des fiches ——— */

const VIE_PUBLIQUE_10Q: VideoSource = {
  title: 'Armée, dissuasion nucléaire, Europe de la défense… en 10\u00a0questions',
  url: 'https://www.vie-publique.fr/questions-reponses/284126-armee-dissuasion-nucleaire-europe-de-la-defense-en-10-questions',
  publisher: 'Vie-publique.fr (DILA)',
  date: '2025-12-16',
}

const SAFE: VideoSource = {
  title: 'SAFE | Security Action for Europe',
  url: 'https://defence-industry-space.ec.europa.eu/eu-defence-industry/safe-security-action-europe_en',
  publisher: 'Commission européenne, DG Industrie de la défense et espace',
}

const OTAN_MEMBRES: VideoSource = {
  title: 'Pays membres de l’OTAN',
  url: 'https://www.nato.int/fr/about-us/organization/nato-member-countries',
  publisher: 'OTAN',
  date: '2024-03-11',
}

const SENAT_PLF: VideoSource = {
  title: 'Projet de loi de finances pour 2026\u00a0: Défense – Rapport général n°\u00a0139 (2025-2026), tome III, annexe 8',
  url: 'https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html',
  publisher: 'Sénat, commission des finances',
  date: '2025-11-24',
}

const OTAN_DEPENSES: VideoSource = {
  title: 'Defence Investment of NATO Countries (2014-2026)',
  url: 'https://www.nato.int/content/dam/nato/webready/documents/finance/def-exp-2026-en.pdf',
  publisher: 'OTAN',
  date: '2026-07',
}

const LPM: VideoSource = {
  title: 'Loi du 16\u00a0août 2026 actualisant la programmation militaire 2024-2030',
  url: 'https://www.vie-publique.fr/loi/302742-actualisation-lpm-2024-2030-etat-dalerte-de-securite-nationale-loi-2026',
  publisher: 'Vie-publique.fr (DILA)',
  date: '2026-08-18',
}

const SIPRI_ARMES: VideoSource = {
  title: 'Global arms flows jump nearly 10 per cent as European demand soars',
  url: 'https://www.sipri.org/media/press-release/2026/global-arms-flows-jump-nearly-10-cent-european-demand-soars',
  publisher: 'SIPRI',
  date: '2026-03-09',
}

const DISSUASION_AVANCEE: VideoSource = {
  title: 'La «\u00a0dissuasion avancée\u00a0»\u00a0: une évolution de la doctrine nucléaire française',
  url: 'https://www.vie-publique.fr/en-bref/302309-la-dissuasion-avancee-une-evolution-de-la-doctrine-nucleaire-francaise',
  publisher: 'Vie-publique.fr (DILA)',
  date: '2026-09-15',
}

const SIPRI_ANNUAIRE: VideoSource = {
  title: 'Communiqué de presse\u00a0: parution du Sipri Yearbook 2026 (version française, PDF)',
  url: 'https://www.sipri.org/sites/default/files/WNF%202026%20PR%20FRE.pdf',
  publisher: 'SIPRI',
  date: '2026-06-08',
}

const TIAN: VideoSource = {
  title: 'Traité sur l’interdiction des armes nucléaires – état des signatures et ratifications',
  url: 'https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XXVI-9&chapter=26&clang=_fr',
  publisher: 'Nations unies, Collection des traités',
  date: '2026-10-03',
}

/* ——— Les chiffres repris d'une fiche à l'autre ——— */

const DEPENSES_FRANCE = {
  value: '2,22\u00a0% du PIB',
  label: 'Dépenses de défense de la France au sens de l’OTAN (estimation, hors volet résilience de 1,5\u00a0%), contre 1,82\u00a0% en 2014. Pour l’ensemble des alliés européens et du Canada\u00a0: 2,53\u00a0%',
  date: '2026 (estimation, données arrêtées au 3\u00a0juillet 2026)',
}

const OGIVES_FRANCE = {
  value: '290\u00a0ogives',
  label: 'Stock militaire de la France (ogives utilisables) estimé par le SIPRI, sur environ 9\u202f745 dans le monde. La Russie et les États-Unis en détiennent environ 83\u00a0%',
  date: 'Janvier 2026',
}

export const DEFENSE: VideoSeries = {
  topicId: 'defense',
  familyId: 'monde',
  label: 'Défense',
  videos: [
    {
      id: 'defense-intro',
      kind: 'intro',
      questionIds: ['international_defense-3', 'international_defense-5'],
      title: 'La défense, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'defense-intro-01',
          say: 'Une armée, des alliés, l’arme nucléaire. Sur quoi repose la défense de la France\u202f?',
          visual: 'hook',
          draw: 'Trois pictogrammes au trait, chacun quand la voix le nomme\u00a0: un bouclier, deux maillons de chaîne, un atome\u202f; dessous, la question.',
          emphasis: ['Une armée', 'des alliés', 'l’arme nucléaire'],
        },
        {
          id: 'defense-intro-02',
          say: 'Depuis la guerre en Ukraine, les dépenses militaires augmentent en Europe.',
          visual: 'point',
          draw: 'Trois piles de pièces au trait, de plus en plus hautes, et une flèche de hausse au bleu bille.',
          emphasis: ['dépenses militaires', 'augmentent en Europe'],
        },
        {
          id: 'defense-intro-03',
          say: 'Selon une estimation de l’OTAN, la France consacre à sa défense 2,22\u00a0% de son PIB en 2026. C’était 1,82\u00a0% en 2014. Le PIB, c’est la richesse produite en un an.',
          spoken: 'Selon une estimation de l’Otan, la France consacre à sa défense deux virgule vingt-deux pour cent de son P.I.B. en deux mille vingt-six. C’était un virgule quatre-vingt-deux pour cent en deux mille quatorze. Le P.I.B., c’est la richesse produite en un an.',
          visual: 'figure',
          draw: 'Deux colonnes au trait depuis zéro, 2014 et 2026, la seconde un peu plus haute.',
          emphasis: ['2,22\u00a0%', '1,82\u00a0%'],
          figure: { ...DEPENSES_FRANCE, sourceIndex: 0 },
        },
        {
          id: 'defense-intro-04',
          say: 'La France est membre de l’OTAN, l’Alliance atlantique, qui réunit 32\u00a0pays. Une attaque armée contre l’un d’eux est considérée comme dirigée contre tous.',
          spoken: 'La France est membre de l’Otan, l’Alliance atlantique, qui réunit trente-deux pays. Une attaque armée contre l’un d’eux est considérée comme dirigée contre tous.',
          visual: 'point',
          draw: 'Trente-deux petits fanions en rangées\u202f; une flèche en pointillé en vise un, puis tous passent au bleu bille.',
          emphasis: ['32\u00a0pays', 'contre tous'],
        },
        {
          id: 'defense-intro-05',
          say: 'L’Union européenne a aussi ses outils\u00a0: elle prête jusqu’à 150\u00a0milliards d’euros aux États pour leurs achats d’armement.',
          spoken: 'L’Union européenne a aussi ses outils : elle prête jusqu’à cent cinquante milliards d’euros aux États pour leurs achats d’armement.',
          visual: 'figure',
          draw: 'Une pile de pièces au centre\u202f; des flèches en pointillé partent vers cinq petits monuments, les États.',
          emphasis: ['150\u00a0milliards'],
          figure: {
            value: '150\u00a0Md€',
            label: 'Prêts de l’Union européenne aux États pour leurs achats d’armement, en principe communs à au moins deux pays (instrument SAFE)',
            sourceIndex: 3,
          },
        },
        {
          id: 'defense-intro-06',
          say: 'Et la France est le seul pays de l’Union doté de l’arme nucléaire. Selon une estimation de janvier 2026, elle a 290\u00a0ogives utilisables.',
          spoken: 'Et la France est le seul pays de l’Union doté de l’arme nucléaire. Selon une estimation de janvier deux mille vingt-six, elle a deux cent quatre-vingt-dix ogives utilisables.',
          visual: 'figure',
          draw: 'Un grand atome au trait, au bleu bille, à côté des mots «\u00a0le seul pays de l’Union\u00a0».',
          emphasis: ['le seul pays', '290\u00a0ogives'],
          figure: { ...OGIVES_FRANCE, sourceIndex: 4 },
        },
        {
          id: 'defense-intro-07',
          say: 'Alors, quatre questions se posent. Combien dépenser pour sa défense\u202f? Avec quels alliés\u202f? Quel rôle pour la dissuasion nucléaire\u202f? Et quelle place pour le désarmement\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: des pièces, deux maillons de chaîne, un atome, un traité scellé.',
          emphasis: ['Combien dépenser', 'quels alliés', 'la dissuasion nucléaire'],
        },
        {
          id: 'defense-intro-08',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [OTAN_DEPENSES, VIE_PUBLIQUE_10Q, SENAT_PLF, SAFE, SIPRI_ANNUAIRE],
    },
    {
      id: 'defense-budget',
      kind: 'deep',
      questionIds: ['international_defense-3'],
      title: 'Combien dépenser pour la défense\u202f?',
      short: 'Budget',
      register: 'vous',
      segments: [
        {
          id: 'defense-budget-01',
          say: 'Se défendre a un coût. Combien la France y consacre-t-elle, et qui en décide\u202f?',
          visual: 'hook',
          draw: 'Une pile de pièces au trait à côté d’un bouclier, et un point d’interrogation.',
          emphasis: ['Combien', 'qui en décide'],
        },
        {
          id: 'defense-budget-02',
          say: 'Ces dépenses sont prévues par une loi, pour plusieurs années\u00a0: la loi de programmation militaire. L’actuelle couvre les années 2024 à 2030.',
          spoken: 'Ces dépenses sont prévues par une loi, pour plusieurs années : la loi de programmation militaire. L’actuelle couvre les années deux mille vingt-quatre à deux mille trente.',
          visual: 'timeline',
          draw: 'Un document de loi au trait au-dessus d’une frise de 2024 à 2030, une accolade couvrant toutes les années.',
          emphasis: ['programmation militaire'],
        },
        {
          id: 'defense-budget-03',
          say: 'Une loi du 16\u00a0août 2026 l’a actualisée. Au total, 436\u00a0milliards d’euros sont prévus pour la mission Défense de 2024 à 2030. Dont 36\u00a0milliards ajoutés entre 2026 et 2030.',
          spoken: 'Une loi du seize août deux mille vingt-six l’a actualisée. Au total, quatre cent trente-six milliards d’euros sont prévus pour la mission Défense de deux mille vingt-quatre à deux mille trente. Dont trente-six milliards ajoutés entre deux mille vingt-six et deux mille trente.',
          visual: 'figure',
          draw: 'Une longue barre au trait pour le total\u202f; son dernier morceau, les milliards ajoutés, au bleu bille, à la même échelle.',
          alt: 'Une barre du total, dont la part ajoutée est marquée à la même échelle.',
          emphasis: ['436\u00a0milliards', '36\u00a0milliards'],
          figure: {
            value: '436\u00a0Md€',
            label: 'Budget de la mission Défense sur 2024-2030 après la loi d’actualisation, qui ajoute 36\u00a0Md€ sur 2026-2030. Objectif\u00a0: 2,5\u00a0% du PIB en 2030 et 3,5\u00a0% en 2035',
            date: 'Loi promulguée le 16\u00a0août 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'defense-budget-04',
          say: 'Son objectif\u00a0: consacrer à la défense 2,5\u00a0% du PIB, la richesse produite en un an, en 2030. Puis 3,5\u00a0% en 2035.',
          spoken: 'Son objectif : consacrer à la défense deux virgule cinq pour cent du P.I.B., la richesse produite en un an, en deux mille trente. Puis trois virgule cinq pour cent en deux mille trente-cinq.',
          visual: 'timeline',
          draw: 'Deux colonnes en pointillé, 2030 et 2035, la seconde plus haute\u00a0: ce sont des objectifs.',
          alt: 'Deux colonnes en pointillé, des objectifs\u00a0: 2,5\u00a0% en 2030, 3,5\u00a0% en 2035.',
          emphasis: ['2,5\u00a0%', '3,5\u00a0%'],
        },
        {
          id: 'defense-budget-05',
          say: 'L’OTAN a sa propre mesure des dépenses de défense. Selon son estimation, la France y consacre 2,22\u00a0% de son PIB en 2026. Contre 1,82\u00a0% en 2014.',
          spoken: 'L’Otan a sa propre mesure des dépenses de défense. Selon son estimation, la France y consacre deux virgule vingt-deux pour cent de son P.I.B. en deux mille vingt-six. Contre un virgule quatre-vingt-deux pour cent en deux mille quatorze.',
          visual: 'figure',
          draw: 'Deux colonnes au trait depuis zéro, 2014 et 2026.',
          emphasis: ['2,22\u00a0%', '1,82\u00a0%'],
          figure: { ...DEPENSES_FRANCE, sourceIndex: 1 },
        },
        {
          id: 'defense-budget-06',
          say: 'Pour l’ensemble des alliés européens et du Canada, c’est 2,53\u00a0%.',
          spoken: 'Pour l’ensemble des alliés européens et du Canada, c’est deux virgule cinquante-trois pour cent.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: la France en 2014, la France en 2026, et l’ensemble des alliés européens et du Canada.',
          alt: 'Trois barres à la même échelle\u00a0: France 2014, 1,82\u00a0%\u202f; France 2026, 2,22\u00a0%\u202f; alliés européens et Canada, 2,53\u00a0%.',
          emphasis: ['2,53\u00a0%'],
          figure: {
            value: '2,53\u00a0% du PIB',
            label: 'Dépenses de défense de l’ensemble des alliés européens et du Canada au sens de l’OTAN (estimation), contre 2,22\u00a0% pour la France',
            date: '2026 (estimation, données arrêtées au 3\u00a0juillet 2026)',
            sourceIndex: 1,
          },
        },
        {
          id: 'defense-budget-07',
          say: 'En juin 2025, les 32\u00a0pays de l’OTAN ont adopté un nouvel objectif\u00a0: 5\u00a0% du PIB en 2035. Le précédent était de 2\u00a0%.',
          spoken: 'En juin deux mille vingt-cinq, les trente-deux pays de l’Otan ont adopté un nouvel objectif : cinq pour cent du P.I.B. en deux mille trente-cinq. Le précédent était de deux pour cent.',
          visual: 'figure',
          draw: 'Deux colonnes au trait depuis zéro\u00a0: l’objectif précédent, et le nouveau, pour 2035, au bleu bille.',
          alt: 'Deux colonnes à la même échelle\u00a0: l’objectif précédent, 2\u00a0%, et celui de 2035, 5\u00a0%.',
          emphasis: ['5\u00a0%', '2\u00a0%'],
          figure: {
            value: '5\u00a0% du PIB en 2035',
            label: 'Objectif adopté par les 32\u00a0pays de l’OTAN\u00a0: 3,5\u00a0% du PIB pour la défense elle-même et 1,5\u00a0% pour la résilience et l’innovation en matière de sécurité. L’objectif précédent était de 2\u00a0%',
            date: 'Sommet de La Haye, 24-25\u00a0juin 2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: '% du PIB',
            items: [
              { label: 'Objectif précédent', value: 2 },
              { label: 'Objectif 2035', value: 5 },
              { label: 'Dont défense elle-même', value: 3.5 },
            ],
          },
        },
        {
          id: 'defense-budget-08',
          say: 'Dans ces 5\u00a0%, 3,5\u00a0% vont à la défense elle-même. Et 1,5\u00a0% à la résilience et à l’innovation en matière de sécurité.',
          spoken: 'Dans ces cinq pour cent, trois virgule cinq pour cent vont à la défense elle-même. Et un virgule cinq pour cent à la résilience et à l’innovation en matière de sécurité.',
          visual: 'point',
          draw: 'La colonne de l’objectif se partage en deux\u00a0: en bas, la défense elle-même au bleu bille\u202f; au-dessus, la résilience et l’innovation.',
          alt: 'Une colonne de 5\u00a0%, partagée en 3,5\u00a0% et 1,5\u00a0%.',
          emphasis: ['3,5\u00a0%', '1,5\u00a0%'],
        },
        {
          id: 'defense-budget-09',
          say: 'Alors, quel effort de défense, et à quel rythme\u202f?',
          visual: 'question',
          draw: 'Une pile de pièces, une flèche en pointillé le long d’une frise d’années, et un point d’interrogation au bout.',
          emphasis: ['quel effort'],
        },
      ],
      sources: [LPM, OTAN_DEPENSES, SENAT_PLF],
    },
    {
      id: 'defense-alliances',
      kind: 'deep',
      questionIds: ['international_defense-3'],
      title: 'L’OTAN et la défense européenne',
      short: 'Alliances',
      register: 'vous',
      segments: [
        {
          id: 'defense-alliances-01',
          say: 'Si un pays de l’OTAN est attaqué, que font les autres\u202f?',
          spoken: 'Si un pays de l’Otan est attaqué, que font les autres ?',
          visual: 'hook',
          draw: 'Une rangée de fanions au trait\u202f; une flèche en pointillé en vise un, un point d’interrogation au-dessus des autres.',
          emphasis: ['que font les autres'],
        },
        {
          id: 'defense-alliances-02',
          say: 'Dans l’OTAN, l’article\u00a05 le prévoit\u00a0: une attaque armée contre un allié est considérée comme dirigée contre tous.',
          spoken: 'Dans l’Otan, l’article cinq le prévoit : une attaque armée contre un allié est considérée comme dirigée contre tous.',
          visual: 'point',
          draw: 'Une rangée de fanions\u202f; une flèche en pointillé en vise un, puis une accolade les réunit tous, au bleu bille.',
          emphasis: ['l’article\u00a05', 'contre tous'],
        },
        {
          id: 'defense-alliances-03',
          say: 'Chaque allié assiste alors le pays attaqué, par l’action qu’il juge nécessaire, y compris la force armée.',
          visual: 'point',
          draw: 'Un fanion au centre\u202f; autour, les alliés lui envoient chacun une flèche, de longueurs différentes.',
          emphasis: ['l’action qu’il juge nécessaire'],
        },
        {
          id: 'defense-alliances-04',
          say: 'Membre de l’OTAN depuis sa fondation, en 1949, la France quitte sa structure militaire intégrée en 1966. En avril 2009, elle annonce sa pleine participation, sans rejoindre le Groupe des plans nucléaires.',
          spoken: 'Membre de l’Otan depuis sa fondation, en mille neuf cent quarante-neuf, la France quitte sa structure militaire intégrée en mille neuf cent soixante-six. En avril deux mille neuf, elle annonce sa pleine participation, sans rejoindre le Groupe des plans nucléaires.',
          visual: 'timeline',
          draw: 'Deux lignes du temps\u00a0: l’appartenance à l’OTAN, continue depuis 1949\u202f; la structure militaire intégrée, en pointillé de 1966 à 2009\u202f; un petit atome à part.',
          alt: 'Sur une frise marquée 1949, 1966 et 2009, deux lignes\u00a0: l’OTAN, continue, et la structure militaire intégrée, interrompue de 1966 à 2009.',
          emphasis: ['1949', '1966', 'avril 2009'],
        },
        {
          id: 'defense-alliances-05',
          say: 'L’Union européenne a ses propres outils. Elle prête jusqu’à 150\u00a0milliards d’euros aux États pour leurs achats d’armement. Dix-neuf États, dont la France, ont présenté des plans.',
          spoken: 'L’Union européenne a ses propres outils. Elle prête jusqu’à cent cinquante milliards d’euros aux États pour leurs achats d’armement. Dix-neuf États, dont la France, ont présenté des plans.',
          visual: 'figure',
          draw: 'Dix-neuf petits fanions en deux rangées, qui passent au bleu bille quand la voix les compte.',
          emphasis: ['150\u00a0milliards', 'Dix-neuf États'],
          figure: {
            value: '150\u00a0Md€',
            label: 'Prêts de l’Union européenne aux États pour leurs achats d’armement, en principe communs à au moins deux pays (instrument SAFE)\u202f; dix-neuf États, dont la France, ont présenté des plans d’investissement',
            sourceIndex: 2,
          },
        },
        {
          id: 'defense-alliances-06',
          say: 'Ces achats doivent en principe être communs à au moins deux pays. Et au moins 65\u00a0% du coût des composants doit venir de l’Union, d’Ukraine, ou, sous conditions, de Norvège, d’Islande et du Liechtenstein.',
          spoken: 'Ces achats doivent en principe être communs à au moins deux pays. Et au moins soixante-cinq pour cent du coût des composants doit venir de l’Union, d’Ukraine, ou, sous conditions, de Norvège, d’Islande et du Liechtenstein.',
          visual: 'figure',
          draw: 'Deux fanions reliés d’un trait\u202f; dessous, cent petits carrés dont soixante-cinq au bleu bille.',
          emphasis: ['au moins deux pays', '65\u00a0%'],
          figure: {
            value: '65\u00a0%',
            label: 'Part minimale du coût des composants qui doit venir de l’Union européenne, d’Ukraine ou, sous conditions, de Norvège, d’Islande et du Liechtenstein, pour les achats financés par ces prêts (instrument SAFE)',
            sourceIndex: 2,
          },
        },
        {
          id: 'defense-alliances-07',
          say: 'Les 29\u00a0pays européens de l’OTAN achètent aussi des armes à l’étranger. De 2021 à 2025, 58\u00a0% de leurs importations d’armes majeures venaient des États-Unis. 7,4\u00a0% venaient de France.',
          spoken: 'Les vingt-neuf pays européens de l’Otan achètent aussi des armes à l’étranger. De deux mille vingt et un à deux mille vingt-cinq, cinquante-huit pour cent de leurs importations d’armes majeures venaient des États-Unis. Sept virgule quatre pour cent venaient de France.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les États-Unis, puis la France.',
          alt: 'Deux barres à la même échelle\u00a0: États-Unis, 58\u00a0%\u202f; France, 7,4\u00a0%.',
          emphasis: ['58\u00a0%', '7,4\u00a0%'],
          figure: {
            value: '58\u00a0%',
            label: 'Part des États-Unis dans les importations d’armes majeures des 29\u00a0pays européens de l’OTAN. La France en fournit 7,4\u00a0%',
            date: '2021-2025 (publié le 9\u00a0mars 2026)',
            sourceIndex: 3,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'États-Unis', value: 58 },
              { label: 'France', value: 7.4 },
            ],
          },
        },
        {
          id: 'defense-alliances-08',
          say: 'Dans l’OTAN, les décisions se prennent d’un commun accord. Dans la défense européenne, à l’unanimité.',
          spoken: 'Dans l’Otan, les décisions se prennent d’un commun accord. Dans la défense européenne, à l’unanimité.',
          visual: 'compare',
          draw: 'Deux tables rondes de même taille, entourées de fanions\u00a0: l’OTAN d’un côté, la défense européenne de l’autre.',
          alt: 'Deux tables, l’OTAN et la défense européenne.',
          emphasis: ['d’un commun accord', 'à l’unanimité'],
        },
        {
          id: 'defense-alliances-09',
          say: 'Alors, sur quoi faire reposer d’abord la sécurité de la France\u202f?',
          visual: 'question',
          draw: 'Un bouclier au trait, des maillons de chaîne et des fanions autour, un point d’interrogation.',
          emphasis: ['sur quoi'],
        },
      ],
      sources: [VIE_PUBLIQUE_10Q, OTAN_MEMBRES, SAFE, SIPRI_ARMES],
    },
    {
      id: 'defense-dissuasion',
      kind: 'deep',
      questionIds: ['international_defense-5'],
      title: 'La dissuasion nucléaire française',
      short: 'Dissuasion',
      register: 'vous',
      segments: [
        {
          id: 'defense-dissuasion-01',
          say: 'La France a l’arme nucléaire. À quoi sert-elle, et qui peut décider de l’employer\u202f?',
          visual: 'hook',
          draw: 'Un atome au trait, et un point d’interrogation à côté.',
          emphasis: ['À quoi sert-elle', 'qui peut décider'],
        },
        {
          id: 'defense-dissuasion-02',
          say: 'Son but\u00a0: faire redouter à tout agresseur des dommages «\u00a0absolument inacceptables\u00a0», s’il s’en prenait aux intérêts vitaux de la France. C’est la dissuasion.',
          visual: 'point',
          draw: 'La carte de la France au trait\u202f; un cercle de protection en pointillé se trace autour.',
          emphasis: ['absolument inacceptables', 'la dissuasion'],
        },
        {
          id: 'defense-dissuasion-03',
          say: 'Seul le président de la République décide de son emploi.',
          visual: 'point',
          draw: 'Une seule personne au trait, une clé au bleu bille à côté d’elle.',
          emphasis: ['Seul le président de la République'],
        },
        {
          id: 'defense-dissuasion-04',
          say: 'Selon une estimation de janvier 2026, la France a 290\u00a0ogives nucléaires utilisables. Sur environ 9\u202f745 dans le monde\u00a0: à peu près 3 sur 100.',
          spoken: 'Selon une estimation de janvier deux mille vingt-six, la France a deux cent quatre-vingt-dix ogives nucléaires utilisables. Sur environ neuf mille sept cent quarante-cinq dans le monde : à peu près trois sur cent.',
          visual: 'figure',
          draw: 'Cent petits carrés\u202f; trois passent au bleu bille.',
          emphasis: ['290\u00a0ogives', '3 sur 100'],
          figure: { ...OGIVES_FRANCE, sourceIndex: 1 },
          chart: { kind: 'part', value: 290, total: 9745, unit: 'ogives', whole: 'environ dans le monde' },
        },
        {
          id: 'defense-dissuasion-05',
          say: 'Pour 2026, le projet de budget prévoit 7,4\u00a0milliards d’euros pour la dissuasion. Un peu plus de 11\u00a0euros sur 100 des crédits de la mission Défense.',
          spoken: 'Pour deux mille vingt-six, le projet de budget prévoit sept virgule quatre milliards d’euros pour la dissuasion. Un peu plus de onze euros sur cent des crédits de la mission Défense.',
          visual: 'figure',
          draw: 'Cent pièces en dix rangées\u202f; onze passent au bleu bille.',
          emphasis: ['7,4\u00a0milliards', '11\u00a0euros sur 100'],
          figure: {
            value: '7,4\u00a0Md€',
            label: 'Crédits de la dissuasion nucléaire prévus pour 2026, soit 11,1\u00a0% des crédits de paiement de la mission Défense',
            date: '2026 (projet de loi de finances)',
            sourceIndex: 2,
          },
          chart: { kind: 'part', value: 11.1, total: 100, unit: '%', whole: 'des crédits de paiement de la mission Défense' },
        },
        {
          id: 'defense-dissuasion-06',
          say: 'Dans l’OTAN, le «\u00a0partage nucléaire\u00a0» repose sur des armes américaines. En 2025, plusieurs États européens, dont l’Allemagne, ont souhaité le compléter par des accords comparables avec la France et le Royaume-Uni.',
          spoken: 'Dans l’Otan, le « partage nucléaire » repose sur des armes américaines. En deux mille vingt-cinq, plusieurs États européens, dont l’Allemagne, ont souhaité le compléter par des accords comparables avec la France et le Royaume-Uni.',
          visual: 'point',
          draw: 'Un atome, et une flèche vers une rangée de fanions\u202f; deux autres atomes arrivent en gris, pour la France et le Royaume-Uni.',
          alt: 'Un atome, les armes américaines, et une flèche vers des fanions\u202f; deux autres atomes en gris, la France et le Royaume-Uni.',
          emphasis: ['partage nucléaire', 'la France et le Royaume-Uni'],
        },
        {
          id: 'defense-dissuasion-07',
          say: 'En mars 2026, le président de la République a annoncé une «\u00a0dissuasion avancée\u00a0», ouverte à des pays partenaires européens.',
          spoken: 'En mars deux mille vingt-six, le président de la République a annoncé une « dissuasion avancée », ouverte à des pays partenaires européens.',
          visual: 'point',
          draw: 'La carte de la France et son cercle de protection\u202f; un second cercle, plus large, en pointillé, rejoint une rangée de fanions voisins.',
          emphasis: ['dissuasion avancée'],
        },
        {
          id: 'defense-dissuasion-08',
          say: 'Ces pays pourront participer aux exercices nucléaires, et accueillir des forces stratégiques françaises. Mais la décision d’emploi ne sera pas partagée.',
          visual: 'point',
          draw: 'Trois lignes, chacune avec son pictogramme quand la voix la dit\u00a0: un fanion, un atome, une clé au bleu bille.',
          emphasis: ['participer', 'accueillir', 'ne sera pas partagée'],
        },
        {
          id: 'defense-dissuasion-09',
          say: 'Au 15\u00a0septembre 2026, dix pays européens y sont associés. Huit sont membres de l’Union européenne.',
          spoken: 'Au quinze septembre deux mille vingt-six, dix pays européens y sont associés. Huit sont membres de l’Union européenne.',
          visual: 'figure',
          draw: 'Dix fanions en deux rangées\u202f; huit passent au bleu bille.',
          alt: 'Dix fanions, dont huit en bleu\u00a0: les membres de l’Union européenne.',
          emphasis: ['dix pays européens', 'Huit'],
          figure: {
            value: '10\u00a0pays',
            label: 'Pays européens associés à la «\u00a0dissuasion avancée\u00a0»\u00a0: Royaume-Uni, Allemagne, Pologne, Pays-Bas, Belgique, Grèce, Suède, Danemark, puis Norvège et Finlande. Huit d’entre eux sont membres de l’UE',
            date: 'Au 15\u00a0septembre 2026',
            sourceIndex: 3,
          },
        },
        {
          id: 'defense-dissuasion-10',
          say: 'Autre annonce\u00a0: le nombre de têtes nucléaires va augmenter, et ne sera plus rendu public.',
          visual: 'point',
          draw: 'Une rangée de cases, comme un compteur\u202f; deux de plus au bleu bille et une flèche de hausse\u202f; puis toutes passent en pointillé, sous un cadenas.',
          emphasis: ['va augmenter', 'plus rendu public'],
        },
        {
          id: 'defense-dissuasion-11',
          say: 'Alors, quel rôle pour la dissuasion française en Europe\u202f?',
          visual: 'question',
          draw: 'La carte de la France et son cercle en pointillé, une rangée de fanions à côté, et un point d’interrogation.',
          emphasis: ['quel rôle'],
        },
      ],
      sources: [VIE_PUBLIQUE_10Q, SIPRI_ANNUAIRE, SENAT_PLF, DISSUASION_AVANCEE],
    },
    {
      id: 'defense-desarmement',
      kind: 'deep',
      questionIds: ['international_defense-5'],
      title: 'Où en est le désarmement nucléaire\u202f?',
      short: 'Désarmement',
      register: 'vous',
      segments: [
        {
          id: 'defense-desarmement-01',
          say: 'Combien d’armes nucléaires compte le monde\u202f? Et des traités les limitent-ils\u202f?',
          visual: 'hook',
          draw: 'Un globe au trait, un traité scellé à côté, et un point d’interrogation.',
          emphasis: ['Combien', 'des traités'],
        },
        {
          id: 'defense-desarmement-02',
          say: 'En janvier 2026, le monde compte environ 9\u202f745\u00a0ogives nucléaires utilisables, selon une estimation. La Russie et les États-Unis en détiennent environ 83\u00a0%\u00a0: plus de 8 sur 10.',
          spoken: 'En janvier deux mille vingt-six, le monde compte environ neuf mille sept cent quarante-cinq ogives nucléaires utilisables, selon une estimation. La Russie et les États-Unis en détiennent environ quatre-vingt-trois pour cent : plus de huit sur dix.',
          visual: 'figure',
          draw: 'Cent petits carrés\u202f; quatre-vingt-trois passent au bleu bille.',
          emphasis: ['9\u202f745\u00a0ogives', '83\u00a0%'],
          figure: {
            value: 'Environ 9\u202f745\u00a0ogives',
            label: 'Ogives nucléaires utilisables (stocks militaires) dans le monde, estimées par le SIPRI\u202f; la Russie et les États-Unis en détiennent environ 83\u00a0%, la France 290',
            date: 'Janvier 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'defense-desarmement-03',
          say: 'Côté désarmement, le traité New Start, entre les États-Unis et la Russie, a expiré en février 2026. Sans traité pour le remplacer.',
          spoken: 'Côté désarmement, le traité New Start, entre les États-Unis et la Russie, a expiré en février deux mille vingt-six. Sans traité pour le remplacer.',
          visual: 'timeline',
          draw: 'Un traité au trait sur une frise\u202f; au jalon de février 2026, il passe en pointillé\u202f; après, une page vide en pointillé.',
          emphasis: ['New Start', 'a expiré'],
        },
        {
          id: 'defense-desarmement-04',
          say: 'Le traité sur la non-prolifération, le TNP, fait l’objet de conférences d’examen. La dernière s’est achevée le 22\u00a0mai 2026 sans document final. Pour la troisième fois de suite.',
          spoken: 'Le traité sur la non-prolifération, le T.N.P., fait l’objet de conférences d’examen. La dernière s’est achevée le vingt-deux mai deux mille vingt-six sans document final. Pour la troisième fois de suite.',
          visual: 'timeline',
          draw: 'Trois pages en pointillé alignées, restées blanches, sous le sigle TNP\u202f; la dernière, au bleu bille, datée du 22\u00a0mai 2026.',
          emphasis: ['sans document final', 'la troisième fois'],
        },
        {
          id: 'defense-desarmement-05',
          say: 'Un traité de l’ONU interdit les armes nucléaires aux États qui en font partie. Il est en vigueur depuis 2021. Au 3\u00a0octobre 2026, 75\u00a0États s’y sont engagés.',
          spoken: 'Un traité de l’Onu interdit les armes nucléaires aux États qui en font partie. Il est en vigueur depuis deux mille vingt et un. Au trois octobre deux mille vingt-six, soixante-quinze États s’y sont engagés.',
          visual: 'figure',
          draw: 'Soixante-quinze petits fanions en rangées, qui passent au bleu bille quand la voix les compte.',
          emphasis: ['interdit', '75\u00a0États'],
          figure: {
            value: '75\u00a0États parties',
            label: 'Pays engagés dans le traité de l’ONU sur l’interdiction des armes nucléaires, en vigueur depuis 2021 (96\u00a0signataires)',
            date: 'Au 3\u00a0octobre 2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'defense-desarmement-06',
          say: 'Aucun des neuf États dotés de l’arme nucléaire n’en fait partie. Dans l’Union européenne, l’Autriche, l’Irlande et Malte l’ont ratifié.',
          visual: 'point',
          draw: 'Le cercle du traité\u202f; neuf atomes en gris restent dehors\u202f; trois fanions entrent dedans, à leur nom.',
          emphasis: ['Aucun des neuf États', 'l’Autriche, l’Irlande et Malte'],
        },
        {
          id: 'defense-desarmement-07',
          say: 'En Europe, des pays s’associent à la dissuasion française. Dans le monde, des États s’engagent par traité à interdire ces armes.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal, plateaux égaux\u00a0: un atome et un fanion d’un côté, un traité scellé de l’autre.',
          emphasis: ['la dissuasion française', 'interdire ces armes'],
        },
        {
          id: 'defense-desarmement-08',
          say: 'Alors, quelle place pour l’arme nucléaire française, en Europe et dans le monde\u202f?',
          visual: 'question',
          draw: 'Un globe et un atome côte à côte, un point d’interrogation entre les deux.',
          emphasis: ['quelle place'],
        },
      ],
      sources: [SIPRI_ANNUAIRE, TIAN, DISSUASION_AVANCEE],
    },
  ],
}
