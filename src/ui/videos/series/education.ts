// Série « École et jeunesse » (famille « École, culture, numérique ») : l'introduction, puis cinq
// approfondissements, un par question de la banque (taille des classes, apprentissages, enseignement privé sous
// contrat, université et recherche, jeunes). Règles d'écriture : ../GUIDE-SERIES.md ; planches :
// ../pistes/planches/education.tsx. Tous les faits et chiffres viennent des fiches du thème
// (research/choisir-2027/explainers.json : education-1, -2, -3, -x1, -x2), sources recopiées.
// Une fois la voix enregistrée, ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say »
// ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : crédits de la loi de finances pour 2026 (enseignement privé sous contrat), droits d'inscription à
// l'université de l'année 2026-2027, montants 2026 de l'allocation du contrat d'engagement jeune et de l'indemnité
// du service civique, part des jeunes ni en emploi, ni en études, ni en formation au 2e trimestre 2026. À revoir au
// vote d'une nouvelle loi de finances, à la revalorisation des allocations, et à la rentrée 2027 au plus tard.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources, recopiées des fiches ——— */

const NI_TAILLE_CLASSES: VideoSource = {
  title: 'Taille des classes du premier degré\u00a0: une neuvième année de baisse consécutive dans les écoles publiques (Note d’information n° 26.01)',
  url: 'https://www.education.gouv.fr/sites/default/files/document/Education_nationale_DEPP_NI%20Taille%20des%20classes%2026-01.pdf-478592.pdf',
  publisher: 'Ministère de l’Éducation nationale – DEPP',
  date: '2026-01',
}

const NI_PROJECTIONS: VideoSource = {
  title: 'Projections d’effectifs scolaires à horizon 2035 (Note d’information n° 26.09)',
  url: 'https://www.education.gouv.fr/sites/default/files/document/education-nationale-depp-ni-2026-09-pdf-508061.pdf',
  publisher: 'Ministère de l’Éducation nationale – DEPP',
  date: '2026-04',
}

const SYNTHESE_DEDOUBLEMENT: VideoSource = {
  title: 'Réduction de la taille de classe en éducation prioritaire\u00a0: que nous apprennent les données de la DEPP\u202f? (Synthèse de la DEPP n° 8)',
  url: 'https://www.education.gouv.fr/sites/default/files/document/r-duction-de-la-taille-de-classe-en-ducation-prioritaire-que-nous-apprennent-les-donn-es-de-la-depp--478949.pdf',
  publisher: 'Ministère de l’Éducation nationale – DEPP',
  date: '2026-02',
}

const EAG_2026 = (indicateur: string): VideoSource => ({
  title: `Education at a Glance 2026\u00a0: OECD Indicators (${indicateur})`,
  url: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2026/09/education-at-a-glance-2026_3bce4131/b4968bbc-en.pdf',
  publisher: 'OCDE',
  date: '2026-09',
})

const REGARDS_2025: VideoSource = {
  title: 'Regards sur l’éducation 2025 – note pays\u00a0: France',
  url: 'https://www.oecd.org/content/dam/oecd/fr/publications/reports/2025/09/education-at-a-glance-2025-country-notes_9749f4ff/france_0639c7fb/aca6dceb-fr.pdf',
  publisher: 'OCDE',
  date: '2025-09',
}

const PISA_2025: VideoSource = {
  title: 'Résultats du PISA 2025 (Volume I) – note pays\u00a0: France',
  url: 'https://www.oecd.org/content/dam/oecd/fr/publications/reports/2026/09/pisa-2025-results-volume-i-country-notes_88d1164e/france_69779694/9840dc6b-fr.pdf',
  publisher: 'OCDE',
  date: '2026-09',
}

/** Repères et références statistiques 2026 : un seul document, cité par ses fiches */
const RERS_2026 = (fiches: string, publisher = 'Ministère de l’Éducation nationale – DEPP'): VideoSource => ({
  title: `Repères et références statistiques 2026 (${fiches})`,
  url: 'https://www.education.gouv.fr/sites/default/files/document/rers-2026-pdf-519880.pdf',
  publisher,
  date: '2026-08',
})

const COUR_DES_COMPTES_PRIVE: VideoSource = {
  title: 'L’enseignement privé sous contrat (rapport public thématique)',
  url: 'https://www.ccomptes.fr/fr/publications/lenseignement-prive-sous-contrat',
  publisher: 'Cour des comptes',
  date: '2023-06-01',
}

const INSEE_NEET: VideoSource = {
  title: 'Au deuxième trimestre 2026, le taux de chômage augmente de 0,2\u00a0point et atteint 8,3\u00a0% (Informations rapides n° 192)',
  url: 'https://www.insee.fr/fr/statistiques/9032359',
  publisher: 'Insee',
  date: '2026-08-07',
}

export const EDUCATION: VideoSeries = {
  topicId: 'education',
  familyId: 'savoirs',
  label: 'École et jeunesse',
  videos: [
    /* ——— Introduction ——— */
    {
      id: 'ecole-intro',
      kind: 'intro',
      questionIds: ['education-1', 'education-x2', 'education-2', 'education-x1', 'education-3'],
      title: 'École et jeunesse, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'ecole-intro-01',
          say: 'Une classe, un enseignant, des élèves. Combien sont-ils, et qu’apprennent-ils\u202f?',
          visual: 'hook',
          draw: 'Une salle de classe au trait\u00a0: un tableau marqué d’un point d’interrogation, l’enseignant à côté, deux rangées d’élèves à leurs tables.',
          emphasis: ['Combien sont-ils', 'qu’apprennent-ils'],
        },
        {
          id: 'ecole-intro-02',
          say: 'Dans une classe d’élémentaire publique, ils sont 20,7 en moyenne à la rentrée 2025. C’est 2,8\u00a0élèves de moins qu’en 2015.',
          spoken: 'Dans une classe d’élémentaire publique, ils sont vingt virgule sept en moyenne à la rentrée deux mille vingt-cinq. C’est deux virgule huit élèves de moins qu’en deux mille quinze.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, 2015 et 2025\u202f; la seconde est plus courte, et une accolade marque les 2,8\u00a0élèves de moins.',
          alt: 'Deux barres à la même échelle, 2015 et 2025\u00a0: l’écart entre elles, 2,8\u00a0élèves de moins.',
          emphasis: ['20,7', '2,8\u00a0élèves de moins'],
          figure: {
            value: '20,7\u00a0élèves',
            label: 'par classe en moyenne en élémentaire (du CP au CM2) dans les écoles publiques, soit 2,8 de moins qu’en 2015 (France, hors dispositifs ULIS pour élèves en situation de handicap)',
            date: 'rentrée 2025',
            sourceIndex: 0,
          },
        },
        {
          id: 'ecole-intro-03',
          say: 'Les élèves français de 15\u00a0ans ont des résultats proches de la moyenne de l’OCDE à l’enquête PISA 2025. Mais depuis 2015, la part d’élèves sous le niveau de base a augmenté de 12\u00a0points en mathématiques.',
          spoken: 'Les élèves français de quinze ans ont des résultats proches de la moyenne de l’O.C.D.E. à l’enquête Pisa deux mille vingt-cinq. Mais depuis deux mille quinze, la part d’élèves sous le niveau de base a augmenté de douze points en mathématiques.',
          visual: 'figure',
          draw: 'Une ligne qui monte d’une marche entre 2015 et 2025\u00a0: la part d’élèves sous le niveau de base\u202f; une accolade marque les 12\u00a0points de plus.',
          alt: 'Une ligne qui monte d’une marche entre 2015 et 2025\u00a0: la part d’élèves sous le niveau de base, +12\u00a0points.',
          emphasis: ['proches de la moyenne', '12\u00a0points'],
          figure: {
            value: '+12\u00a0points',
            label: 'depuis 2015 pour la part d’élèves de 15\u00a0ans sous le niveau de base en mathématiques (enquête PISA 2025 de l’OCDE)\u202f; des résultats proches de la moyenne de l’OCDE, mais parmi les plus faibles jamais mesurés en France',
            date: '2025',
            sourceIndex: 1,
          },
        },
        {
          id: 'ecole-intro-04',
          say: 'En maternelle et en élémentaire, 13,6\u00a0% des écoliers vont dans le privé, en France hexagonale. À peu près 1 sur 7.',
          spoken: 'En maternelle et en élémentaire, treize virgule six pour cent des écoliers vont dans le privé, en France hexagonale. À peu près un sur sept.',
          visual: 'figure',
          draw: 'Sept écoliers au trait, en rang\u202f; l’un d’eux se colore au bleu bille.',
          emphasis: ['13,6\u00a0%', '1 sur 7'],
          figure: {
            value: '13,6\u00a0%',
            label: 'des écoliers du premier degré sont scolarisés dans le privé en France hexagonale\u202f; 50,7\u00a0% en Vendée, moins de 5\u00a0% dans la Creuse, en Haute-Corse, en Seine-et-Marne ou dans le Val-d’Oise',
            date: 'rentrée 2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-intro-05',
          say: 'Dans l’enseignement supérieur, 3\u202f049\u202f600\u00a0étudiants sont inscrits à la rentrée 2025. Et 26\u00a0% d’entre eux sont dans le privé\u00a0: plus d’un sur quatre.',
          spoken: 'Dans l’enseignement supérieur, trois millions quarante-neuf mille six cents étudiants sont inscrits à la rentrée deux mille vingt-cinq. Et vingt-six pour cent d’entre eux sont dans le privé : plus d’un sur quatre.',
          visual: 'figure',
          draw: 'Un disque au trait, les étudiants\u202f; un peu plus d’un quart se colore au bleu bille, «\u00a0dans le privé\u00a0».',
          emphasis: ['3\u202f049\u202f600', 'plus d’un sur quatre'],
          figure: {
            value: '26\u00a0%',
            label: 'des 3\u202f049\u202f600\u00a0étudiants sont inscrits dans l’enseignement supérieur privé, lucratif ou non (786\u202f800)',
            date: 'rentrée 2025',
            sourceIndex: 2,
          },
          chart: { kind: 'part', value: 26, total: 100, unit: '%', whole: 'des étudiants' },
        },
        {
          id: 'ecole-intro-06',
          say: 'Et chez les 15 à 29\u00a0ans, 13,3\u00a0% ne sont ni en emploi, ni en études, ni en formation. Plus d’un jeune sur huit.',
          spoken: 'Et chez les quinze à vingt-neuf ans, treize virgule trois pour cent ne sont ni en emploi, ni en études, ni en formation. Plus d’un jeune sur huit.',
          visual: 'figure',
          draw: 'Huit jeunes au trait, en rang\u202f; l’un d’eux se colore au bleu bille.',
          emphasis: ['13,3\u00a0%', 'Plus d’un jeune sur huit'],
          figure: {
            value: '13,3\u00a0%',
            label: 'des 15-29\u00a0ans ne sont ni en emploi, ni en études, ni en formation\u00a0: 0,9\u00a0point de plus que fin 2019 (12,4\u00a0%), mais moins que fin 2015 (14,3\u00a0%) (France y compris Mayotte, personnes vivant en logement ordinaire, données corrigées des variations saisonnières)',
            date: '2e\u00a0trimestre 2026',
            sourceIndex: 3,
          },
          chart: {
            kind: 'series',
            unit: '%',
            items: [
              { label: 'Fin 2015', value: 14.3 },
              { label: 'Fin 2019', value: 12.4 },
              { label: '2e trimestre 2026', value: 13.3 },
            ],
          },
        },
        {
          id: 'ecole-intro-07',
          say: 'Alors, cinq questions. Combien d’élèves par classe\u202f? Comment mieux faire apprendre\u202f? Quelles règles pour financer le privé\u202f? Quelle priorité pour l’université\u202f? Et que faire d’abord pour les jeunes\u202f?',
          visual: 'question',
          draw: 'Cinq pictogrammes en grille, dessinés l’un après l’autre\u00a0: le tableau d’une classe, un livre, une école, une toque d’étudiant, une personne.',
          emphasis: ['cinq questions'],
        },
        {
          id: 'ecole-intro-08',
          say: 'Ce sont les cinq sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les cinq pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [
        NI_TAILLE_CLASSES,
        PISA_2025,
        RERS_2026(
          'fiche 3.02, le premier degré par département et académie\u202f; fiche 7.01, les effectifs du supérieur\u00a0: évolution',
          'Ministère de l’Éducation nationale – DEPP / SIES',
        ),
        INSEE_NEET,
      ],
    },

    /* ——— Taille des classes ——— */
    {
      id: 'ecole-classes',
      kind: 'deep',
      questionIds: ['education-1'],
      title: 'Combien d’élèves par classe\u202f?',
      short: 'Taille des classes',
      register: 'vous',
      segments: [
        {
          id: 'ecole-classes-01',
          say: 'Chaque année, l’école primaire perd des élèves. Que faire de ses classes\u202f?',
          visual: 'hook',
          draw: 'Une école au trait\u202f; devant, une file d’élèves dont les derniers s’effacent en pointillé, et un point d’interrogation.',
          emphasis: ['perd des élèves', 'Que faire de ses classes'],
        },
        {
          id: 'ecole-classes-02',
          say: 'Avec la baisse des naissances, la maternelle et l’élémentaire perdraient 933\u202f000\u00a0élèves selon les projections. Elles passeraient de 6,15\u00a0millions d’élèves en 2025 à 5,22\u00a0millions en 2035.',
          spoken: 'Avec la baisse des naissances, la maternelle et l’élémentaire perdraient neuf cent trente-trois mille élèves selon les projections. Elles passeraient de six virgule quinze millions d’élèves en deux mille vingt-cinq à cinq virgule vingt-deux millions en deux mille trente-cinq.',
          visual: 'figure',
          draw: 'Deux colonnes depuis zéro\u00a0: 6,15\u00a0millions en 2025, puis 5,22\u00a0millions en 2035, en pointillé parce que projetée.',
          alt: 'Deux colonnes depuis zéro\u00a0: 2025, et 2035 en pointillé (projection).',
          emphasis: ['933\u202f000\u00a0élèves', '6,15\u00a0millions', '5,22\u00a0millions'],
          figure: {
            value: '−933\u202f000\u00a0élèves',
            label: 'dans le premier degré (maternelle et élémentaire) entre 2025 (6,15\u00a0millions) et 2035 (5,22\u00a0millions), soit −15,2\u00a0%, selon le scénario intermédiaire de projection (France, public et privé sous contrat)',
            date: 'projection 2025-2035',
            sourceIndex: 0,
          },
          chart: {
            kind: 'series',
            unit: 'millions d’élèves',
            items: [
              { label: '2025', value: 6.15 },
              { label: '2035 (projection)', value: 5.22 },
            ],
          },
        },
        {
          id: 'ecole-classes-03',
          say: 'En primaire, public et privé ensemble, une classe compte 21\u00a0élèves en moyenne en 2024, contre 24 en 2015. Autant que la moyenne de l’OCDE, et plus que celle de 25\u00a0pays de l’Union européenne\u00a0: 19.',
          spoken: 'En primaire, public et privé ensemble, une classe compte vingt et un élèves en moyenne en deux mille vingt-quatre, contre vingt-quatre en deux mille quinze. Autant que la moyenne de l’O.C.D.E., et plus que celle de vingt-cinq pays de l’Union européenne : dix-neuf.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: la France, la moyenne de l’OCDE, la moyenne de 25\u00a0pays de l’Union européenne.',
          alt: 'Trois barres à la même échelle\u00a0: France, 21\u202f; moyenne de l’OCDE, 21\u202f; moyenne de 25\u00a0pays de l’UE, 19.',
          emphasis: ['21\u00a0élèves', '19'],
          figure: {
            value: '21\u00a0élèves',
            label: 'par classe en moyenne en primaire en France (public et privé), contre 24 en 2015. C’est autant que la moyenne de l’OCDE (21) et plus que celle de 25\u00a0pays de l’UE membres de l’OCDE (19)',
            date: '2024',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'élèves',
            items: [
              { label: 'France', value: 21 },
              { label: 'Moyenne de l’OCDE', value: 21 },
              { label: 'Moyenne de 25 pays de l’UE', value: 19 },
            ],
          },
        },
        {
          id: 'ecole-classes-04',
          say: 'Depuis 2020, partout en France, un plafond de 24\u00a0élèves est mis en place en grande section, en CP et en CE1. En 2025, 95\u00a0% des classes publiques qui accueillent des CP le respectent.',
          spoken: 'Depuis deux mille vingt, partout en France, un plafond de vingt-quatre élèves est mis en place en grande section, en C.P. et en C.E. un. En deux mille vingt-cinq, quatre-vingt-quinze pour cent des classes publiques qui accueillent des C.P. le respectent.',
          visual: 'figure',
          draw: 'Un plafond au trait au-dessus de vingt classes dessinées en colonnes\u202f; dix-neuf restent dessous, au bleu bille, une le dépasse.',
          alt: 'Vingt classes sous un plafond\u00a0: dix-neuf en dessous, une au-dessus.',
          emphasis: ['plafond de 24\u00a0élèves', '95\u00a0%'],
          figure: {
            value: '95\u00a0%',
            label: 'des classes publiques accueillant des élèves de CP respectent le plafond de 24\u00a0élèves par classe, mis en place depuis 2020 en grande section, CP et CE1 dans toute la France',
            date: '2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-classes-05',
          say: 'De 2017 à 2019, les CP et CE1 d’éducation prioritaire ont été dédoublés. En réseau renforcé\u00a0: en moyenne 12,8\u00a0élèves par CP en 2025. Contre 21,7 en 2015.',
          spoken: 'De deux mille dix-sept à deux mille dix-neuf, les C.P. et C.E. un d’éducation prioritaire ont été dédoublés. En réseau renforcé : en moyenne douze virgule huit élèves par C.P. en deux mille vingt-cinq. Contre vingt et un virgule sept en deux mille quinze.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, 2015 et 2025\u00a0: la classe de CP en éducation prioritaire renforcée passe de 21,7 à 12,8\u00a0élèves.',
          alt: 'Deux barres à la même échelle, 2015 et 2025.',
          emphasis: ['dédoublés', '12,8\u00a0élèves', '21,7'],
          figure: {
            value: '12,8\u00a0élèves',
            label: 'par classe de CP en éducation prioritaire renforcée (REP+) après le dédoublement, contre 21,7 en 2015 (France)',
            date: 'rentrée 2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'series',
            unit: 'élèves',
            items: [
              { label: '2015', value: 21.7 },
              { label: '2025', value: 12.8 },
            ],
          },
        },
        {
          id: 'ecole-classes-06',
          say: 'Selon le ministère, en réseau renforcé, les élèves des classes dédoublées ont plus progressé que des élèves comparables, jusqu’en fin de CE1. Pour la première génération, selon une thèse, l’écart n’est plus significatif à l’entrée en sixième, sauf en français dans les départements d’outre-mer.',
          spoken: 'Selon le ministère, en réseau renforcé, les élèves des classes dédoublées ont plus progressé que des élèves comparables, jusqu’en fin de C.E. un. Pour la première génération, selon une thèse, l’écart n’est plus significatif à l’entrée en sixième, sauf en français dans les départements d’outre-mer.',
          visual: 'compare',
          draw: 'Une balance aux plateaux égaux, le fléau à l’horizontale\u00a0: d’un côté un livre et une flèche qui monte, jusqu’en fin de CE1\u202f; de l’autre deux colonnes égales, à l’entrée en sixième.',
          emphasis: ['plus progressé', 'l’écart n’est plus significatif'],
        },
        {
          id: 'ecole-classes-07',
          say: 'En dix ans, les écoles publiques rurales ont perdu 15,4\u00a0% d’élèves, 8,1\u00a0% de classes. En éducation prioritaire, 6,5\u00a0% d’élèves en moins, mais 25,5\u00a0% de classes en plus.',
          spoken: 'En dix ans, les écoles publiques rurales ont perdu quinze virgule quatre pour cent d’élèves, huit virgule un pour cent de classes. En éducation prioritaire, six virgule cinq pour cent d’élèves en moins, mais vingt-cinq virgule cinq pour cent de classes en plus.',
          visual: 'compare',
          draw: 'Deux groupes de barres depuis une même ligne zéro, à la même échelle, les écoles rurales et l’éducation prioritaire\u00a0: les élèves et les classes, vers le bas quand ils baissent, vers le haut quand ils augmentent.',
          alt: 'Depuis une ligne zéro, à la même échelle\u00a0: écoles rurales, élèves −15,4\u00a0% et classes −8,1\u00a0%\u202f; éducation prioritaire, élèves −6,5\u00a0% et classes +25,5\u00a0%.',
          emphasis: ['15,4\u00a0%', '25,5\u00a0%'],
          figure: {
            value: '−15,4\u00a0%',
            label: 'd’élèves de 2015 à 2025 dans les écoles publiques du rural (hors éducation prioritaire), et −8,1\u00a0% de classes\u202f; en éducation prioritaire, −6,5\u00a0% d’élèves et +25,5\u00a0% de classes\u202f; dans l’urbain, −7,7\u00a0% d’élèves et +0,9\u00a0% de classes',
            date: '2015-2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-classes-08',
          say: 'Alors, avec moins d’élèves, quelle taille pour les classes\u202f?',
          visual: 'question',
          draw: 'Le tableau d’une classe et trois élèves, puis un point d’interrogation.',
          emphasis: ['quelle taille pour les classes'],
        },
      ],
      sources: [NI_PROJECTIONS, EAG_2026('indicateur D2, tableau D2.3'), NI_TAILLE_CLASSES, SYNTHESE_DEDOUBLEMENT],
    },

    /* ——— Apprentissages ——— */
    {
      id: 'ecole-apprentissages',
      kind: 'deep',
      questionIds: ['education-x2'],
      title: 'Le temps de classe et les apprentissages',
      short: 'Apprentissages',
      register: 'vous',
      segments: [
        {
          id: 'ecole-apprentissages-01',
          say: 'Lire, écrire, compter. Comment aider les élèves à mieux apprendre\u202f?',
          visual: 'hook',
          draw: 'Un livre ouvert et un crayon au trait\u202f; à côté, un point d’interrogation.',
          emphasis: ['Lire, écrire, compter', 'mieux apprendre'],
        },
        {
          id: 'ecole-apprentissages-02',
          say: 'En CM1, à l’enquête internationale TIMSS de 2023, les écoliers français obtiennent en moyenne 484\u00a0points en mathématiques. La moyenne des pays de l’Union européenne participants est de 524.',
          spoken: 'En C.M. un, à l’enquête internationale Timss de deux mille vingt-trois, les écoliers français obtiennent en moyenne quatre cent quatre-vingt-quatre points en mathématiques. La moyenne des pays de l’Union européenne participants est de cinq cent vingt-quatre.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les écoliers français, 484, et les pays de l’Union européenne participants, 524.',
          emphasis: ['484\u00a0points', '524'],
          figure: {
            value: '484\u00a0points',
            label: 'score moyen des élèves de CM1 en mathématiques à l’enquête internationale TIMSS, stable par rapport à 2019, contre 524 en moyenne dans les 22\u00a0pays de l’UE participants\u202f; 15\u00a0% des élèves français n’atteignent pas le niveau le plus bas (France hors Mayotte)',
            date: '2023',
            sourceIndex: 0,
          },
        },
        {
          id: 'ecole-apprentissages-03',
          say: 'Entre élèves très favorisés et très défavorisés, l’écart atteint 81\u00a0points\u00a0: 532 contre 451. Selon le ministère, la France est ainsi parmi les pays de l’Union européenne et de l’OCDE les plus inégalitaires sur ce point.',
          spoken: 'Entre élèves très favorisés et très défavorisés, l’écart atteint quatre-vingt-un points : cinq cent trente-deux contre quatre cent cinquante et un. Selon le ministère, la France est ainsi parmi les pays de l’Union européenne et de l’O.C.D.E. les plus inégalitaires sur ce point.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les élèves très favorisés, 532, et très défavorisés, 451\u202f; l’écart marqué d’une accolade.',
          emphasis: ['81\u00a0points', '532', '451'],
          figure: {
            value: '81\u00a0points',
            label: 'd’écart en mathématiques en CM1 entre élèves très favorisés et très défavorisés (532 contre 451), à l’enquête internationale TIMSS 2023',
            date: '2023',
            sourceIndex: 0,
          },
        },
        {
          id: 'ecole-apprentissages-04',
          say: 'Par rapport à la moyenne de l’OCDE, les écoliers français ont moins de jours de classe. Dans le public, la réglementation en prévoit 162 par an, contre 183. Mais plus d’heures\u00a0: 864 par an en élémentaire, contre 804.',
          spoken: 'Par rapport à la moyenne de l’O.C.D.E., les écoliers français ont moins de jours de classe. Dans le public, la réglementation en prévoit cent soixante-deux par an, contre cent quatre-vingt-trois. Mais plus d’heures : huit cent soixante-quatre par an en élémentaire, contre huit cent quatre.',
          visual: 'compare',
          draw: 'Deux paires de barres, chacune à sa propre échelle depuis zéro\u00a0: les jours de classe par an, puis les heures par an, pour la France et la moyenne de l’OCDE.',
          alt: 'Deux paires de barres, la France et l’OCDE\u00a0: jours de classe par an, 162 et 183\u202f; heures par an, 864 et 804.',
          emphasis: ['moins de jours de classe', 'plus d’heures'],
          figure: {
            value: '162\u00a0jours',
            label: 'd’enseignement par an prévus par la réglementation pour un professeur des écoles du public (sur 36\u00a0semaines), contre 183 en moyenne dans l’OCDE et 178 dans 25\u00a0pays de l’UE membres de l’OCDE',
            date: '2025',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'jours',
            items: [
              { label: 'France', value: 162 },
              { label: 'Moyenne OCDE', value: 183 },
              { label: 'Moyenne de 25 pays de l’UE', value: 178 },
            ],
          },
        },
        {
          id: 'ecole-apprentissages-05',
          say: 'Les vacances d’été durent environ 8\u00a0semaines\u00a0: moins que la moyenne de l’OCDE, 8,7. Mais avec les autres congés, le total atteint 16\u00a0semaines par an, contre 13,5.',
          spoken: 'Les vacances d’été durent environ huit semaines : moins que la moyenne de l’O.C.D.E., huit virgule sept. Mais avec les autres congés, le total atteint seize semaines par an, contre treize virgule cinq.',
          visual: 'figure',
          draw: 'Deux paires de barres à la même échelle, en semaines\u00a0: l’été, puis le total des congés, pour la France et la moyenne de l’OCDE.',
          alt: 'Deux paires de barres à la même échelle, la France et l’OCDE\u00a0: vacances d’été, environ 8 et 8,7\u00a0semaines\u202f; congés au total, 16 et 13,5.',
          emphasis: ['8\u00a0semaines', '16\u00a0semaines'],
          figure: {
            value: '16\u00a0semaines',
            label: 'de congés scolaires par an au total en France, contre 13,5 en moyenne dans l’OCDE\u202f; des vacances d’été d’environ 8\u00a0semaines, plus courtes qu’en moyenne dans l’OCDE (8,7) et dans 25\u00a0pays de l’UE (9,5)',
            date: '2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-apprentissages-06',
          say: 'En élémentaire, 59\u00a0% du temps d’instruction va au français et aux mathématiques. Dans l’OCDE, c’est 41\u00a0% en moyenne.',
          spoken: 'En élémentaire, cinquante-neuf pour cent du temps d’instruction va au français et aux mathématiques. Dans l’O.C.D.E., c’est quarante et un pour cent en moyenne.',
          visual: 'figure',
          draw: 'Deux disques au trait, la France et la moyenne de l’OCDE\u202f; la part du français et des mathématiques se colore dans chacun.',
          alt: 'Deux disques\u00a0: la France, 59\u00a0%, et l’OCDE, 41\u00a0%.',
          emphasis: ['59\u00a0%', '41\u00a0%'],
          figure: {
            value: '59\u00a0%',
            label: 'du temps d’instruction obligatoire à l’école élémentaire consacré au français et aux mathématiques (38\u00a0% et 21\u00a0%), contre 41\u00a0% en moyenne dans l’OCDE',
            date: '2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'France', value: 59 },
              { label: 'Moyenne OCDE', value: 41 },
            ],
          },
        },
        {
          id: 'ecole-apprentissages-07',
          say: 'Alors, sur quoi agir d’abord\u00a0: le temps de classe, ce qu’on enseigne, ou l’aide aux élèves en difficulté\u202f?',
          visual: 'question',
          draw: 'Trois pictogrammes côte à côte, un sablier, un livre, une personne\u202f; un point d’interrogation au bout.',
          emphasis: ['sur quoi agir d’abord'],
        },
      ],
      sources: [
        RERS_2026('fiche 5.28, les performances des élèves de CM1 en mathématiques et en sciences selon l’enquête Timss'),
        EAG_2026('indicateur D4, tableau D4.1'),
        REGARDS_2025,
      ],
    },

    /* ——— Enseignement privé sous contrat ——— */
    {
      id: 'ecole-prive',
      kind: 'deep',
      questionIds: ['education-2'],
      title: 'Le financement du privé sous contrat',
      short: 'Enseignement privé',
      register: 'vous',
      segments: [
        {
          id: 'ecole-prive-01',
          say: 'Une école privée sous contrat\u00a0: qui la finance, et qui décide des inscriptions\u202f?',
          visual: 'hook',
          draw: 'Une école au trait\u202f; à sa gauche des pièces, à sa droite un registre, chacun avec un point d’interrogation.',
          emphasis: ['qui la finance', 'qui décide des inscriptions'],
        },
        {
          id: 'ecole-prive-02',
          say: 'Depuis une loi de 1959, elle s’engage à suivre les programmes nationaux et à accueillir sans discrimination. L’État paie ses enseignants. Mais elle décide de ses inscriptions, hors de la carte scolaire, qui fixe l’école publique selon l’adresse.',
          spoken: 'Depuis une loi de mille neuf cent cinquante-neuf, elle s’engage à suivre les programmes nationaux et à accueillir sans discrimination. L’État paie ses enseignants. Mais elle décide de ses inscriptions, hors de la carte scolaire, qui fixe l’école publique selon l’adresse.',
          visual: 'point',
          draw: 'En haut, un bâtiment public verse une pièce à un enseignant. En bas, deux écoles\u00a0: celle du public au milieu des maisons de son secteur, celle du privé avec son registre d’inscriptions.',
          alt: 'Deux écoles\u00a0: celle du public, entourée des maisons de son secteur\u202f; celle du privé, avec son registre.',
          emphasis: ['L’État paie ses enseignants', 'ses inscriptions', 'la carte scolaire'],
        },
        {
          id: 'ecole-prive-03',
          say: 'Selon la Cour des comptes, l’État apporte 55\u00a0% du financement du privé sous contrat à l’école. Et 68\u00a0% au collège et au lycée.',
          spoken: 'Selon la Cour des comptes, l’État apporte cinquante-cinq pour cent du financement du privé sous contrat à l’école. Et soixante-huit pour cent au collège et au lycée.',
          visual: 'figure',
          draw: 'Deux disques au trait\u202f; la part de l’État se colore au bleu bille\u00a0: un peu plus de la moitié à l’école, plus des deux tiers au collège et au lycée.',
          emphasis: ['55\u00a0%', '68\u00a0%'],
          figure: {
            value: '55\u00a0% et 68\u00a0%',
            label: 'part de l’État dans le financement des établissements privés sous contrat, respectivement dans le premier et dans le second degré',
            date: '2022 (rapport de juin 2023)',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Premier degré', value: 55 },
              { label: 'Second degré', value: 68 },
            ],
          },
        },
        {
          id: 'ecole-prive-04',
          say: 'Pour 2026, les crédits votés par l’État pour le privé sous contrat s’élèvent à 8\u202f871\u00a0millions d’euros. C’est 9,9\u00a0% du budget de l’enseignement scolaire.',
          spoken: 'Pour deux mille vingt-six, les crédits votés par l’État pour le privé sous contrat s’élèvent à huit mille huit cent soixante et onze millions d’euros. C’est neuf virgule neuf pour cent du budget de l’enseignement scolaire.',
          visual: 'figure',
          draw: 'Un disque au trait, le budget de l’enseignement scolaire\u202f; une part d’un dixième environ se colore au bleu bille.',
          emphasis: ['8\u202f871\u00a0millions', '9,9\u00a0%'],
          figure: {
            value: '8\u202f871\u00a0M€',
            label: 'de crédits votés par l’État pour 2026 en faveur de l’enseignement privé sous contrat, premier et second degrés (programme 139), soit 9,9\u00a0% du budget de l’enseignement scolaire\u202f; 8\u202f812\u00a0M€ ont été dépensés en 2025 (France, y compris collectivités d’outre-mer)',
            date: 'loi de finances 2026',
            sourceIndex: 1,
          },
          chart: { kind: 'part', value: 9.9, total: 100, unit: '%', whole: 'du budget de l’enseignement scolaire' },
        },
        {
          id: 'ecole-prive-05',
          say: 'Au collège, 58\u00a0% des élèves du privé sous contrat sont de milieu favorisé ou très favorisé, contre 33\u00a0% dans le public. De milieu défavorisé\u00a0: 16\u00a0%, contre 40\u00a0%.',
          spoken: 'Au collège, cinquante-huit pour cent des élèves du privé sous contrat sont de milieu favorisé ou très favorisé, contre trente-trois pour cent dans le public. De milieu défavorisé : seize pour cent, contre quarante pour cent.',
          visual: 'compare',
          draw: 'Deux paires de barres à la même échelle, depuis zéro, le privé sous contrat et le public\u00a0: les collégiens de milieu favorisé, puis de milieu défavorisé.',
          alt: 'Deux paires de barres à la même échelle, le privé et le public\u00a0: milieu favorisé ou très favorisé, 58 et 33\u00a0%\u202f; milieu défavorisé, 16 et 40\u00a0%.',
          emphasis: ['58\u00a0%', '16\u00a0%'],
          figure: {
            value: '58\u00a0% contre 33\u00a0%',
            label: 'des collégiens du privé sous contrat sont de milieu favorisé ou très favorisé, contre 33\u00a0% dans le public\u202f; ceux de milieu défavorisé y sont 16\u00a0%, contre 40\u00a0% (France hors Mayotte, origine sociale renseignée)',
            date: 'rentrée 2025',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Favorisés, privé sous contrat', value: 58 },
              { label: 'Favorisés, public', value: 33 },
              { label: 'Défavorisés, privé sous contrat', value: 16 },
              { label: 'Défavorisés, public', value: 40 },
            ],
          },
        },
        {
          id: 'ecole-prive-06',
          say: 'Les résultats du privé sont en moyenne meilleurs, mais dépendent beaucoup du milieu social des élèves. Selon la Cour des comptes, la recherche ne permet pas d’établir que le privé fait plus progresser ses élèves que le public, ni moins.',
          visual: 'compare',
          draw: 'Une balance aux plateaux égaux, le fléau à l’horizontale\u00a0: une école du privé d’un côté, une école du public de l’autre\u202f; dessous, la phrase de la Cour des comptes.',
          emphasis: ['en moyenne meilleurs', 'milieu social', 'ni moins'],
        },
        {
          id: 'ecole-prive-07',
          say: 'Alors, quelles règles pour le financement public du privé sous contrat\u202f?',
          visual: 'question',
          draw: 'L’école du début, une pièce posée devant, et un point d’interrogation.',
          emphasis: ['quelles règles'],
        },
      ],
      sources: [
        COUR_DES_COMPTES_PRIVE,
        RERS_2026('fiche 10.03, le budget\u00a0: analyse et évolution\u202f; fiche 2.19, les élèves du second degré habitant dans un quartier prioritaire'),
      ],
    },

    /* ——— Université et recherche ——— */
    {
      id: 'ecole-superieur',
      kind: 'deep',
      questionIds: ['education-x1'],
      title: 'Université et recherche\u00a0: quels moyens\u202f?',
      short: 'Université et recherche',
      register: 'vous',
      segments: [
        {
          id: 'ecole-superieur-01',
          say: 'Après le bac, comment entre-t-on dans le supérieur\u202f? Et quels moyens pour l’université et la recherche\u202f?',
          visual: 'hook',
          draw: 'Une toque d’étudiant et une pile de pièces au trait, avec un point d’interrogation.',
          emphasis: ['Après le bac', 'quels moyens'],
        },
        {
          id: 'ecole-superieur-02',
          say: 'L’accès aux formations passe par la plateforme Parcoursup. En 2025, 94\u00a0% des nouveaux bacheliers inscrits ont reçu au moins une proposition. Ils sont 97\u00a0% en bac général, 92\u00a0% en technologique, 83\u00a0% en professionnel.',
          spoken: 'L’accès aux formations passe par la plateforme Parcoursup. En deux mille vingt-cinq, quatre-vingt-quatorze pour cent des nouveaux bacheliers inscrits ont reçu au moins une proposition. Ils sont quatre-vingt-dix-sept pour cent en bac général, quatre-vingt-douze pour cent en technologique, quatre-vingt-trois pour cent en professionnel.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: bac général, technologique, professionnel.',
          emphasis: ['94\u00a0%', '83\u00a0%'],
          figure: {
            value: '94\u00a0%',
            label: 'des bacheliers 2025 inscrits sur Parcoursup ont reçu au moins une proposition, un point de moins qu’en 2024\u00a0: 97\u00a0% en bac général, 92\u00a0% en bac technologique, 83\u00a0% en bac professionnel',
            date: 'session 2025',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Ensemble des bacheliers', value: 94 },
              { label: 'Bac général', value: 97 },
              { label: 'Bac technologique', value: 92 },
              { label: 'Bac professionnel', value: 83 },
            ],
          },
        },
        {
          id: 'ecole-superieur-03',
          say: 'Depuis 2010, le privé a gagné 76,1\u00a0% d’étudiants, en partie grâce à un meilleur comptage. Le public, 19\u00a0%. En 2025, le privé perd 1,7\u00a0%, le public gagne 2\u00a0%.',
          spoken: 'Depuis deux mille dix, le privé a gagné soixante-seize virgule un pour cent d’étudiants, en partie grâce à un meilleur comptage. Le public, dix-neuf pour cent. En deux mille vingt-cinq, le privé perd un virgule sept pour cent, le public gagne deux pour cent.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: la hausse des effectifs du privé et du public depuis 2010\u202f; dessous, la phrase sur 2025.',
          alt: 'Deux barres à la même échelle, la hausse depuis 2010\u00a0: le privé, +76,1\u00a0%\u202f; le public, +19\u00a0%.',
          emphasis: ['76,1\u00a0%', '19\u00a0%'],
          figure: {
            value: '+76,1\u00a0%',
            label: 'd’effectifs dans l’enseignement supérieur privé depuis 2010, contre +19,0\u00a0% dans le public, en partie grâce à une meilleure collecte des données depuis 2016\u202f; en 2025, −1,7\u00a0% dans le privé et +2,0\u00a0% dans le public. Le privé compte 786\u202f800 des 3\u202f049\u202f600 étudiants, soit 26\u00a0% (France)',
            date: '2010-2025',
            sourceIndex: 0,
          },
        },
        {
          id: 'ecole-superieur-04',
          say: 'À l’université, la dépense moyenne par étudiant est de 12\u202f460\u00a0euros en 2024, en euros constants. Contre 12\u202f870 en 2010, et 11\u202f540 en 2020.',
          spoken: 'À l’université, la dépense moyenne par étudiant est de douze mille quatre cent soixante euros en deux mille vingt-quatre, en euros constants. Contre douze mille huit cent soixante-dix en deux mille dix, et onze mille cinq cent quarante en deux mille vingt.',
          visual: 'figure',
          draw: 'Trois colonnes depuis zéro, 2010, 2020 et 2024, presque de même hauteur.',
          alt: 'Trois colonnes depuis zéro\u00a0: 2010, 2020 et 2024.',
          emphasis: ['12\u202f460\u00a0euros', '12\u202f870', '11\u202f540'],
          figure: {
            value: '12\u202f460\u00a0€',
            label: 'dépense moyenne par étudiant à l’université en 2024 (euros constants, donnée provisoire)\u00a0: moins qu’en 2010 (12\u202f870\u00a0€), plus qu’en 2020 (11\u202f540\u00a0€). Pour un élève de classe préparatoire aux grandes écoles, elle atteint 19\u202f070\u00a0€ (France, public et privé)',
            date: '2024',
            sourceIndex: 0,
          },
          chart: {
            kind: 'series',
            unit: '€',
            items: [
              { label: '2010', value: 12870 },
              { label: '2020', value: 11540 },
              { label: '2024 (provisoire)', value: 12460 },
            ],
          },
        },
        {
          id: 'ecole-superieur-05',
          say: 'À l’université publique, un étudiant non boursier paie des droits d’inscription. À la rentrée 2026, c’est 178\u00a0euros par an en licence, et 255 en master.',
          spoken: 'À l’université publique, un étudiant non boursier paie des droits d’inscription. À la rentrée deux mille vingt-six, c’est cent soixante-dix-huit euros par an en licence, et deux cent cinquante-cinq en master.',
          visual: 'figure',
          draw: 'Deux étiquettes de prix au trait, licence et master, chacune avec son montant.',
          alt: 'Deux étiquettes\u00a0: 178\u00a0€ en licence, 255\u00a0€ en master.',
          emphasis: ['178\u00a0euros', '255'],
          figure: {
            value: '178\u00a0€',
            label: 'par an en licence à l’université publique pour un étudiant non boursier (taux normal)\u202f; 255\u00a0€ en master',
            date: '2026-2027',
            sourceIndex: 1,
          },
        },
        {
          id: 'ecole-superieur-06',
          say: 'En 2023, la recherche et développement réalisée en France représente 2,18\u00a0% du PIB, la richesse produite en un an. Les entreprises en font 1,44\u00a0point, les administrations, dont l’enseignement supérieur, 0,74.',
          spoken: 'En deux mille vingt-trois, la recherche et développement réalisée en France représente deux virgule dix-huit pour cent du P.I.B., la richesse produite en un an. Les entreprises en font un virgule quarante-quatre point, les administrations, dont l’enseignement supérieur, zéro virgule soixante-quatorze.',
          visual: 'figure',
          draw: 'Une barre de 2,18\u00a0points coupée en deux\u00a0: la part des entreprises, puis celle des administrations.',
          alt: 'Une barre coupée en deux\u00a0: les entreprises, 1,44\u00a0point\u202f; les administrations, 0,74.',
          emphasis: ['2,18\u00a0%', '1,44\u00a0point', '0,74'],
          figure: {
            value: '2,18\u00a0% du PIB',
            label: 'consacrés à la recherche et développement réalisée en France, soit 61,5\u00a0Md€ (2,22\u00a0% en 2022). Les entreprises en réalisent 1,44\u00a0point, les administrations (État, enseignement supérieur, institutions sans but lucratif) 0,74\u00a0point',
            date: '2023',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '% du PIB',
            items: [
              { label: 'Entreprises', value: 1.44 },
              { label: 'Administrations', value: 0.74 },
            ],
          },
        },
        {
          id: 'ecole-superieur-07',
          say: 'La recherche se finance aussi par appels à projets\u00a0: des équipes proposent, une agence choisit. En 2025, le principal appel de l’Agence nationale de la recherche retient 1\u202f737\u00a0projets. Sur 7\u202f665\u00a0éligibles, pour 834\u00a0millions d’euros.',
          spoken: 'La recherche se finance aussi par appels à projets : des équipes proposent, une agence choisit. En deux mille vingt-cinq, le principal appel de l’Agence nationale de la recherche retient mille sept cent trente-sept projets. Sur sept mille six cent soixante-cinq éligibles, pour huit cent trente-quatre millions d’euros.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les projets éligibles, puis les projets retenus, au bleu bille.',
          alt: 'Deux barres à la même échelle\u00a0: 7\u202f665\u00a0projets éligibles, 1\u202f737 retenus.',
          emphasis: ['appels à projets', '1\u202f737', '7\u202f665'],
          figure: {
            value: '1\u202f737\u00a0projets',
            label: 'retenus sur 7\u202f665 propositions éligibles par le principal appel à projets 2025 de l’Agence nationale de la recherche (appel à projets générique), pour 834\u00a0millions d’euros',
            date: '2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-superieur-08',
          say: 'Alors, quelle priorité pour l’université et la recherche publique\u202f?',
          visual: 'question',
          draw: 'La toque du début, à côté d’un livre, et un point d’interrogation.',
          emphasis: ['quelle priorité'],
        },
      ],
      sources: [
        RERS_2026(
          'fiche 7.20, les vœux d’orientation et propositions d’admission des nouveaux bacheliers\u202f; fiche 7.01, les effectifs du supérieur\u00a0: évolution\u202f; fiche 10.05, les dépenses par élève et par étudiant\u202f; fiche 10.09, la recherche et le développement expérimental\u00a0: vue d’ensemble',
          'Ministère de l’Éducation nationale – DEPP / SIES',
        ),
        {
          title: 'Coût d’une inscription dans l’enseignement supérieur – cas général',
          url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F36520/2',
          publisher: 'Service-Public.fr (DILA)',
          date: '2026-08-20',
        },
        {
          title: 'Les résultats définitifs de l’Appel à projets générique (AAPG) 2025',
          url: 'https://anr.fr/fr/actus/details/news/les-resultats-definitifs-de-lappel-a-projets-generique-aapg-2025/',
          publisher: 'Agence nationale de la recherche (ANR)',
          date: '2026-06-08',
        },
      ],
    },

    /* ——— Jeunes ——— */
    {
      id: 'ecole-jeunes',
      kind: 'deep',
      questionIds: ['education-3'],
      title: 'Que faire d’abord pour les jeunes\u202f?',
      short: 'Jeunes',
      register: 'vous',
      segments: [
        {
          id: 'ecole-jeunes-01',
          say: 'Après l’école, avant un emploi stable\u00a0: de quoi vivent les jeunes\u202f?',
          visual: 'hook',
          draw: 'Un chemin au trait, de l’école à une mallette de travail\u202f; au milieu, une personne et un point d’interrogation.',
          emphasis: ['de quoi vivent les jeunes'],
        },
        {
          id: 'ecole-jeunes-02',
          say: 'En 2024, 18,6\u00a0% des 18 à 29\u00a0ans vivent sous le seuil de pauvreté. Contre 15,4\u00a0% dans l’ensemble de la population.',
          spoken: 'En deux mille vingt-quatre, dix-huit virgule six pour cent des dix-huit à vingt-neuf ans vivent sous le seuil de pauvreté. Contre quinze virgule quatre pour cent dans l’ensemble de la population.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les 18 à 29\u00a0ans, puis l’ensemble de la population.',
          emphasis: ['18,6\u00a0%', '15,4\u00a0%'],
          figure: {
            value: '18,6\u00a0%',
            label: 'taux de pauvreté des 18-29\u00a0ans (niveau de vie inférieur à 60\u00a0% du niveau de vie médian), contre 15,4\u00a0% pour l’ensemble de la population\u202f; France métropolitaine, hors ménages dont la personne de référence est étudiante',
            date: '2024',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: '18-29 ans', value: 18.6 },
              { label: 'Ensemble de la population', value: 15.4 },
            ],
          },
        },
        {
          id: 'ecole-jeunes-03',
          say: 'Avant 25\u00a0ans, le RSA, revenu de solidarité active, n’est ouvert qu’aux parents et futurs parents. Ou à ceux qui ont travaillé l’équivalent de deux ans à temps plein, sur les trois dernières années. Les étudiants n’y ont pas droit, sauf exceptions.',
          spoken: 'Avant vingt-cinq ans, le R.S.A., revenu de solidarité active, n’est ouvert qu’aux parents et futurs parents. Ou à ceux qui ont travaillé l’équivalent de deux ans à temps plein, sur les trois dernières années. Les étudiants n’y ont pas droit, sauf exceptions.',
          visual: 'point',
          draw: 'Trois lignes, chacune avec son pictogramme\u00a0: une personne pour les parents, une mallette pour deux ans de travail, un livre pour les étudiants.',
          emphasis: ['Avant 25\u00a0ans', 'sauf exceptions'],
        },
        {
          id: 'ecole-jeunes-04',
          say: 'Pour les 16 à 25\u00a0ans qui peinent à trouver un emploi durable, hors études et formation, il existe le contrat d’engagement jeune. Il prévoit 15 à 20\u00a0heures d’accompagnement par semaine, et jusqu’à 566,17\u00a0euros par mois.',
          spoken: 'Pour les seize à vingt-cinq ans qui peinent à trouver un emploi durable, hors études et formation, il existe le contrat d’engagement jeune. Il prévoit quinze à vingt heures d’accompagnement par semaine, et jusqu’à cinq cent soixante-six euros dix-sept par mois.',
          visual: 'figure',
          draw: 'Un sablier pour les heures d’accompagnement de la semaine, un porte-monnaie pour l’allocation.',
          emphasis: ['contrat d’engagement jeune', '566,17\u00a0euros'],
          figure: {
            value: '566,17\u00a0€',
            label: 'par mois au maximum, l’allocation du contrat d’engagement jeune (pour 15 à 20\u00a0heures d’accompagnement par semaine, pendant un an au plus, prolongeable de 6\u00a0mois)',
            date: '2026',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecole-jeunes-05',
          say: 'Le service civique est volontaire\u00a0: une mission d’intérêt général de 6\u00a0mois à 1\u00a0an. Le volontaire touche au moins 619,83\u00a0euros par mois. En 2024, 149\u202f878\u00a0jeunes y ont été accueillis, un record.',
          spoken: 'Le service civique est volontaire : une mission d’intérêt général de six mois à un an. Le volontaire touche au moins six cent dix-neuf euros quatre-vingt-trois par mois. En deux mille vingt-quatre, cent quarante-neuf mille huit cent soixante-dix-huit jeunes y ont été accueillis, un record.',
          visual: 'figure',
          draw: 'Un calendrier pour la durée de la mission, un billet pour l’indemnité.',
          emphasis: ['volontaire', '149\u202f878'],
          figure: {
            value: '149\u202f878',
            label: 'jeunes accueillis en service civique (volontaire) en 2024, une année record\u202f; âge moyen\u00a0: 21\u00a0ans. Plus de 850\u202f000 jeunes s’y sont engagés depuis sa création',
            date: '2024',
            sourceIndex: 4,
          },
        },
        {
          id: 'ecole-jeunes-06',
          say: 'À la rentrée 2024, 661\u202f700\u00a0étudiants touchent une bourse sur critères sociaux. C’est 2,6\u00a0% de moins en un an\u00a0: le barème d’éligibilité n’a pas été revalorisé, dans un contexte d’inflation.',
          spoken: 'À la rentrée deux mille vingt-quatre, six cent soixante et un mille sept cents étudiants touchent une bourse sur critères sociaux. C’est deux virgule six pour cent de moins en un an : le barème d’éligibilité n’a pas été revalorisé, dans un contexte d’inflation.',
          visual: 'figure',
          draw: 'Sous le chiffre, deux lignes\u00a0: un étudiant et une flèche qui descend, «\u00a02,6\u00a0% de moins en un an\u00a0»\u202f; un barème au trait, «\u00a0le barème d’éligibilité n’a pas été revalorisé\u00a0».',
          emphasis: ['661\u202f700', '2,6\u00a0%'],
          figure: {
            value: '661\u202f700',
            label: 'étudiants boursiers sur critères sociaux (France, toutes formations), en baisse de 2,6\u00a0% à la rentrée 2024\u00a0: le barème d’éligibilité n’a pas été revalorisé dans un contexte d’inflation. La bourse va de 1\u202f450\u00a0€ par an (un tiers des boursiers) à 6\u202f340\u00a0€ (8\u00a0%)',
            date: '2024-2025',
            sourceIndex: 5,
          },
        },
        {
          id: 'ecole-jeunes-07',
          say: 'Alors, pour les jeunes, quelle mesure faire passer en premier\u202f?',
          visual: 'question',
          draw: 'Une personne au trait au départ d’un chemin, et un point d’interrogation au bout.',
          emphasis: ['en premier'],
        },
      ],
      sources: [
        {
          title: 'Pauvreté selon l’âge et le seuil – données annuelles de 1996 à 2024',
          url: 'https://www.insee.fr/fr/statistiques/3565548',
          publisher: 'Insee',
          date: '2026-07-09',
        },
        {
          title: 'Minima sociaux et prestations de solidarité, édition 2025 – fiche 23\u00a0: le revenu de solidarité active (RSA)',
          url: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2025-12/MS2025%20-%20Fiche%2023%20-%20Le%20revenu%20de%20solidarit%C3%A9%20active%20(RSA).pdf',
          publisher: 'DREES',
          date: '2025-12',
        },
        {
          title: 'Contrat d’engagement jeune (accompagnement pour trouver un travail)',
          url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F32700',
          publisher: 'Service-Public.fr (DILA)',
          date: '2026-04-01',
        },
        {
          title: 'Engagement de service civique',
          url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F13278',
          publisher: 'Service-Public.fr (DILA)',
          date: '2026-07-17',
        },
        {
          title: 'Rapport annuel 2024 («\u00a0Nos chiffres clés\u00a0», p. 12)',
          url: 'https://www.service-civique.gouv.fr/api/media/assets/document/rapport-d-activite-2024-asc-version-web.pdf',
          publisher: 'Agence du Service Civique',
          date: '2025-08',
        },
        RERS_2026('fiche 10.07, l’aide aux étudiants', 'Ministère de l’Éducation nationale – DEPP / SIES'),
      ],
    },
  ],
}
