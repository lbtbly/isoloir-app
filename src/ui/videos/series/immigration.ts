// Série « Immigration » (famille « Immigration ») : l'introduction, puis quatre approfondissements (titres de
// séjour et régularisation, langue et nationalité, emploi et droits, expulsions). Matière : les fiches des
// questions immigration-1 à immigration-3 (research/choisir-2027/explainers.json et explainer-charts.json),
// rien d'autre. Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/immigration.tsx.
// Sujet où les mots eux-mêmes sont disputés : seulement les termes des fiches et des institutions (immigré,
// étranger, titre de séjour, régularisation, éloignement, OQTF), les analyses attribuées à leur source.
// Ne pas toucher aux identifiants ni aux textes dits sans raison une fois la voix enregistrée : changer un
// « say » ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : la voie de régularisation par les « métiers en tension » s'applique jusqu'au 31 décembre 2026
// (immigration-titres-06). À revoir après cette date.

import type { VideoSeries } from '../types'

/* ——— Les sources, copiées des fiches ——— */

const TITRES_2025 = {
  title: 'Les titres de séjour en 2025\u00a0: les protections subsidiaires ont plus que doublé',
  url: 'https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html',
  publisher: 'Ministère de l’Intérieur – DGEF, service statistique (DSED)',
  date: '2026-06-30',
}

const ACTIVITE_IMMIGRES = {
  title: 'Activité, emploi et chômage des immigrés de 2014 à 2024',
  url: 'https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/activite-emploi-et-chomage-des-immigres-de-2014-a-2024.html',
  publisher: 'Ministère de l’Intérieur – DGEF, service statistique (DSED), d’après l’INSEE (enquête Emploi)',
  date: '2025-10-22',
}

const ELOIGNEMENTS_2025 = {
  title: 'Les éloignements d’étrangers en situation irrégulière en 2025\u00a0: une dynamique ascendante',
  url: 'https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/eloignements-detrangers-en-situation-irreguliere-en-2025-dynamique-ascendante',
  publisher: 'Ministère de l’Intérieur – DGEF, service statistique (DSED)',
  date: '2026-06-30',
}

const CESEDA_L435_4 = {
  title: 'Article L435-4 du Code de l’entrée et du séjour des étrangers et du droit d’asile',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049044146',
  publisher: 'Légifrance',
  date: '2024-01-28',
}

const DECISION_2023_863 = {
  title: 'Décision n°\u00a02023-863 DC du 25\u00a0janvier 2024 – Communiqué de presse',
  url: 'https://www.conseil-constitutionnel.fr/actualites/communique/decision-n-2023-863-dc-du-25-janvier-2024-communique-de-presse',
  publisher: 'Conseil constitutionnel',
  date: '2024-01-25',
}

const INTEGRATION_2025 = {
  title: 'L’intégration des étrangers en 2025\u00a0: 46\u202f600 BPI ont été accompagnés par le programme Agir',
  url: 'https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lintegration-des-etrangers-en-2025-46-600-bpi-ont-ete-accompagnes-par-programme-agir',
  publisher: 'Ministère de l’Intérieur – DGEF, service statistique (DSED), d’après l’OFII',
  date: '2026-06-30',
}

const NATIONALITE_2025 = {
  title: 'L’accès à la nationalité française pour l’année 2025\u00a0: moins d’acquisitions de la nationalité française par décret',
  url: 'https://www.immigration.interieur.gouv.fr/chiffres-de-limmigration-en-france/lacces-a-nationalite-francaise-pour-lannee-2025-moins-dacquisitions-de-nationalite-francaise-par',
  publisher: 'Ministère de l’Intérieur – DGEF, service statistique (DSED)',
  date: '2026-06-30',
}

const TESTING_2023 = {
  title: 'Les discriminations sur le marché du travail subies par les personnes d’origine maghrébine (Immigrés et descendants d’immigrés, édition 2023)',
  url: 'https://www.insee.fr/fr/statistiques/6793310?sommaire=6793391',
  publisher: 'INSEE Références (étude de la DARES)',
  date: '2023-03-30',
}

const RSA_F19778 = {
  title: 'RSA\u00a0: demandeur de 25\u00a0ans et plus',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F19778',
  publisher: 'Service-Public.fr (DILA, Premier ministre)',
  date: '2026-04-01',
}

const DECISION_2024_6 = {
  title: 'Décision n°\u00a02024-6 RIP du 11\u00a0avril 2024',
  url: 'https://www.conseil-constitutionnel.fr/decision/2024/20246RIP.htm',
  publisher: 'Conseil constitutionnel',
  date: '2024-04-11',
}

const NOTE_OQTF = {
  title: 'Séance thématique de contrôle\u00a0: «\u00a0Les résultats de la politique d’éloignement des personnes sous obligation de quitter le territoire français (OQTF)\u00a0»',
  url: 'https://www.assemblee-nationale.fr/dyn/17/documents/cion_lois/l17n813203444_document.pdf',
  publisher: 'Assemblée nationale – Commission des lois',
  date: '2025-06',
}

const EUROSTAT_ORDRES = {
  title: 'Enforcement of immigration legislation statistics',
  url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Enforcement_of_immigration_legislation_statistics',
  publisher: 'Eurostat (Commission européenne)',
  date: '2026',
}

/* ——— Les chiffres des fiches, repris dans plusieurs vidéos ——— */

const LABEL_TITRES =
  'Premiers titres de séjour délivrés à des ressortissants de pays tiers (+9,2\u00a0% sur un an), dont 31,0\u00a0% pour études et 13,5\u00a0% pour motif économique (France)'

const LABEL_REGULARISATIONS =
  'Régularisations (admissions exceptionnelles au séjour et titres «\u00a0liens personnels et familiaux\u00a0»), en baisse de 11,0\u00a0% sur un an, dont 9\u202f696 au titre du travail (France). Le ministère relie cette baisse à la loi de 2024 et à une circulaire de janvier 2025'

export const IMMIGRATION: VideoSeries = {
  topicId: 'immigration',
  familyId: 'immigration',
  label: 'Immigration',
  videos: [
    /* ——— Introduction ——— */
    {
      id: 'immigration-intro',
      kind: 'intro',
      questionIds: ['immigration-1', 'immigration-2', 'immigration-3'],
      title: 'L’immigration, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'immigration-intro-01',
          say: 'Chaque année, des étrangers viennent vivre en France. Qui peut rester, à quelles conditions, et qui doit partir\u202f?',
          visual: 'hook',
          draw: 'Une personne au trait et sa valise devant une porte\u202f; une flèche entre, puis une flèche sort, sous un point d’interrogation.',
          emphasis: ['Qui peut rester', 'qui doit partir'],
        },
        {
          id: 'immigration-intro-02',
          say: 'Un immigré, c’est une personne née étrangère, à l’étranger. Certains sont devenus français.',
          visual: 'point',
          draw: 'Une personne au trait hors de la carte de France, une flèche en pointillé jusqu’à une personne dans la carte\u202f; une carte d’identité vient s’y poser.',
          emphasis: ['Un immigré', 'devenus français'],
        },
        {
          id: 'immigration-intro-03',
          say: 'En 2024, en France hors Mayotte, les immigrés forment 12,2\u00a0% de la population active de 15 à 64\u00a0ans. À peu près 12\u00a0sur 100.',
          spoken: 'En deux mille vingt-quatre, en France hors Mayotte, les immigrés forment douze virgule deux pour cent de la population active de quinze à soixante-quatre ans. À peu près douze sur cent.',
          visual: 'figure',
          draw: 'Cent petites cases en dix rangées\u202f; douze se comptent au bleu bille.',
          emphasis: ['12,2\u00a0%', '12\u00a0sur 100'],
          figure: {
            value: '12,2\u00a0%',
            label: 'Part des immigrés dans la population active de 15 à 64\u00a0ans (France hors Mayotte). Un immigré est une personne née étrangère à l’étranger\u202f; certains sont devenus français',
            date: '2024',
            sourceIndex: 0,
          },
          chart: { kind: 'part', value: 12.2, total: 100, unit: '%', whole: 'de la population active' },
        },
        {
          id: 'immigration-intro-04',
          say: 'En 2025, 377\u202f462 premiers titres de séjour ont été délivrés à des étrangers de pays tiers, hors Union européenne. C’est 9,2\u00a0% de plus en un an.',
          spoken: 'En deux mille vingt-cinq, trois cent soixante-dix-sept mille quatre cent soixante-deux premiers titres de séjour ont été délivrés à des étrangers de pays tiers, hors Union européenne. C’est neuf virgule deux pour cent de plus en un an.',
          visual: 'figure',
          draw: 'Deux rangées de cartes de séjour au trait\u202f; à côté, une flèche qui monte.',
          emphasis: ['377\u202f462'],
          figure: { value: '377\u202f462', label: LABEL_TITRES, date: '2025 (données provisoires)', sourceIndex: 1 },
        },
        {
          id: 'immigration-intro-05',
          say: 'D’autres vivent déjà en France sans titre de séjour. Certains sont régularisés, au cas par cas\u00a0: 27\u202f819 en 2025.',
          spoken: 'D’autres vivent déjà en France sans titre de séjour. Certains sont régularisés, au cas par cas : vingt-sept mille huit cent dix-neuf en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Une personne sans carte, en pointillé\u202f; elle passe par un guichet et en ressort avec sa carte de séjour.',
          emphasis: ['régularisés', '27\u202f819'],
          figure: { value: '27\u202f819', label: LABEL_REGULARISATIONS, date: '2025 (données provisoires)', sourceIndex: 1 },
        },
        {
          id: 'immigration-intro-06',
          say: 'Dans l’autre sens, 23\u202f549 éloignements d’étrangers majeurs en situation irrégulière depuis la métropole en 2025. Et 24\u202f512 éloignements depuis l’outre-mer, près de 9\u00a0sur 10 depuis Mayotte.',
          spoken: 'Dans l’autre sens, vingt-trois mille cinq cent quarante-neuf éloignements d’étrangers majeurs en situation irrégulière depuis la métropole en deux mille vingt-cinq. Et vingt-quatre mille cinq cent douze éloignements depuis l’outre-mer, près de neuf sur dix depuis Mayotte.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis la métropole et depuis l’outre-mer.',
          alt: 'Deux barres à la même échelle\u00a0: depuis la métropole, 23\u202f549\u202f; depuis l’outre-mer, 24\u202f512.',
          emphasis: ['23\u202f549', '24\u202f512'],
          figure: {
            value: '23\u202f549',
            label: 'Éloignements d’étrangers en situation irrégulière (forcés, aidés et spontanés), en hausse de 11,1\u00a0% sur un an (France métropolitaine, majeurs). S’y ajoutent 24\u202f512 éloignements depuis l’outre-mer, à près de 90\u00a0% depuis Mayotte',
            date: '2025',
            sourceIndex: 2,
          },
        },
        {
          id: 'immigration-intro-07',
          say: 'Alors, quatre questions se posent. Qui accueillir, et pour quels motifs\u202f? Que demander aux nouveaux arrivants, et que leur garantir\u202f? Quel accès à l’emploi et aux aides\u202f? Et qui éloigner, et comment\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: une carte de séjour, un livre, une mallette de travail, une valise.',
          emphasis: ['Qui accueillir', 'que leur garantir', 'qui éloigner'],
        },
        {
          id: 'immigration-intro-08',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [ACTIVITE_IMMIGRES, TITRES_2025, ELOIGNEMENTS_2025],
    },

    /* ——— Titres de séjour et régularisation ——— */
    {
      id: 'immigration-titres',
      kind: 'deep',
      questionIds: ['immigration-1'],
      title: 'Titres de séjour\u00a0: qui peut rester\u202f?',
      short: 'Titres de séjour',
      register: 'vous',
      segments: [
        {
          id: 'immigration-titres-01',
          say: 'Un étranger non européen veut s’installer en France. Il lui faut un titre de séjour. Pour quels motifs peut-il l’obtenir\u202f?',
          visual: 'hook',
          draw: 'Une personne au trait et sa valise\u202f; une flèche mène à une grande carte de séjour, marquée d’un point d’interrogation.',
          emphasis: ['un titre de séjour', 'quels motifs'],
        },
        {
          id: 'immigration-titres-02',
          say: 'En 2025, sur 377\u202f462 premiers titres, 31,0\u00a0% sont délivrés pour des études. Et 13,5\u00a0% pour un motif économique.',
          spoken: 'En deux mille vingt-cinq, sur trois cent soixante-dix-sept mille quatre cent soixante-deux premiers titres, trente et un pour cent sont délivrés pour des études. Et treize virgule cinq pour cent pour un motif économique.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les titres pour études, les titres pour motif économique.',
          alt: 'Deux barres à la même échelle\u00a0: pour des études, 31,0\u00a0%\u202f; pour un motif économique, 13,5\u00a0%.',
          emphasis: ['31,0\u00a0%', '13,5\u00a0%'],
          figure: { value: '377\u202f462', label: LABEL_TITRES, date: '2025 (données provisoires)', sourceIndex: 0 },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Titres pour études', value: 31 },
              { label: 'Titres pour motif économique', value: 13.5 },
            ],
          },
        },
        {
          id: 'immigration-titres-03',
          say: 'D’autres vivent déjà en France, sans titre. Leur régularisation est décidée au cas par cas, par les préfectures.',
          visual: 'point',
          draw: 'Une file de dossiers devant un guichet de préfecture\u202f; une loupe passe sur l’un d’eux.',
          emphasis: ['au cas par cas'],
        },
        {
          id: 'immigration-titres-04',
          say: 'Depuis la loi du 26\u00a0janvier 2024, une voie de régularisation existe pour les métiers en tension, où les employeurs peinent à recruter.',
          spoken: 'Depuis la loi du vingt-six janvier deux mille vingt-quatre, une voie de régularisation existe pour les métiers en tension, où les employeurs peinent à recruter.',
          visual: 'point',
          draw: 'Le texte de loi, daté\u202f; une flèche vers une mallette de travail et trois places, dont deux restées vides, en pointillé.',
          emphasis: ['métiers en tension'],
        },
        {
          id: 'immigration-titres-05',
          say: 'Il faut y avoir travaillé 12\u00a0mois sur les 24 derniers, y occuper un emploi, et résider en France depuis au moins 3\u00a0ans.',
          spoken: 'Il faut y avoir travaillé douze mois sur les vingt-quatre derniers, y occuper un emploi, et résider en France depuis au moins trois ans.',
          visual: 'timeline',
          draw: 'Trois conditions l’une sous l’autre\u00a0: une grille de 24 mois dont 12 se cochent, une mallette, une maison suivie de trois calendriers.',
          emphasis: ['12\u00a0mois sur les 24 derniers', 'au moins 3\u00a0ans'],
        },
        {
          id: 'immigration-titres-06',
          say: 'Le titre est accordé «\u00a0à titre exceptionnel\u00a0»\u00a0: le préfet n’est pas tenu de le délivrer. Et cette voie s’applique jusqu’au 31\u00a0décembre 2026.',
          spoken: 'Le titre est accordé « à titre exceptionnel » : le préfet n’est pas tenu de le délivrer. Et cette voie s’applique jusqu’au trente et un décembre deux mille vingt-six.',
          visual: 'point',
          draw: 'Une carte de séjour en pointillé posée sur le guichet\u202f; à côté, un calendrier marque la fin de la voie.',
          emphasis: ['à titre exceptionnel', '31\u00a0décembre 2026'],
        },
        {
          id: 'immigration-titres-07',
          say: 'En 2025, 27\u202f819 régularisations, 11\u00a0% de moins qu’en 2024. Dont 9\u202f696 au titre du travail.',
          spoken: 'En deux mille vingt-cinq, vingt-sept mille huit cent dix-neuf régularisations, onze pour cent de moins qu’en deux mille vingt-quatre. Dont neuf mille six cent quatre-vingt-seize au titre du travail.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: toutes les régularisations, puis celles au titre du travail.',
          alt: 'Deux barres à la même échelle\u00a0: toutes les régularisations, 27\u202f819\u202f; au titre du travail, 9\u202f696.',
          emphasis: ['27\u202f819', '9\u202f696'],
          figure: { value: '27\u202f819', label: LABEL_REGULARISATIONS, date: '2025 (données provisoires)', sourceIndex: 0 },
          chart: {
            kind: 'compare',
            items: [
              { label: 'Toutes régularisations', value: 27819 },
              { label: 'Dont au titre du travail', value: 9696 },
            ],
          },
        },
        {
          id: 'immigration-titres-08',
          say: 'Le ministère de l’Intérieur relie cette baisse à la loi de 2024. Et à une circulaire de janvier 2025, qui recentre la régularisation sur des situations «\u00a0strictement exceptionnelles\u00a0».',
          spoken: 'Le ministère de l’Intérieur relie cette baisse à la loi de deux mille vingt-quatre. Et à une circulaire de janvier deux mille vingt-cinq, qui recentre la régularisation sur des situations « strictement exceptionnelles ».',
          visual: 'point',
          draw: 'Deux documents datés, la loi et la circulaire\u202f; leurs flèches se rejoignent sur une flèche qui descend.',
          emphasis: ['strictement exceptionnelles'],
        },
        {
          id: 'immigration-titres-09',
          say: 'En janvier 2024, le Conseil constitutionnel a censuré l’obligation faite au Parlement de fixer, pour trois ans, le nombre d’étrangers admis à s’installer durablement. Selon lui, une loi ne peut imposer au Parlement ni débat, ni objectifs chiffrés d’immigration.',
          spoken: 'En janvier deux mille vingt-quatre, le Conseil constitutionnel a censuré l’obligation faite au Parlement de fixer, pour trois ans, le nombre d’étrangers admis à s’installer durablement. Selon lui, une loi ne peut imposer au Parlement ni débat, ni objectifs chiffrés d’immigration.',
          visual: 'point',
          draw: 'Un monument au trait pour le Parlement\u202f; un document d’objectifs sur trois ans pointé vers lui passe en pointillé, censuré.',
          emphasis: ['Conseil constitutionnel', 'objectifs chiffrés'],
        },
        {
          id: 'immigration-titres-10',
          say: 'Alors, qui accueillir, pour quels motifs, et qui en fixe le cap\u202f?',
          visual: 'question',
          draw: 'La carte de séjour et le monument du Parlement côte à côte, suivis d’un point d’interrogation.',
          emphasis: ['qui accueillir', 'le cap'],
        },
      ],
      sources: [TITRES_2025, CESEDA_L435_4, DECISION_2023_863],
    },

    /* ——— Langue et nationalité ——— */
    {
      id: 'immigration-langue',
      kind: 'deep',
      questionIds: ['immigration-2'],
      title: 'Apprendre le français, devenir français',
      short: 'Langue et nationalité',
      register: 'vous',
      segments: [
        {
          id: 'immigration-langue-01',
          say: 'Un étranger non européen s’installe en France pour y vivre. Que lui demande-t-on, et que lui propose-t-on\u202f?',
          visual: 'hook',
          draw: 'Une personne au trait entre deux objets\u00a0: d’un côté un document à remplir, de l’autre un livre ouvert.',
          emphasis: ['demande-t-on', 'propose-t-on'],
        },
        {
          id: 'immigration-langue-02',
          say: 'Il signe un contrat d’intégration républicaine, pour un an. Il s’engage à suivre une formation civique de 4\u00a0jours et, selon son niveau, jusqu’à 600\u00a0heures de cours de français.',
          spoken: 'Il signe un contrat d’intégration républicaine, pour un an. Il s’engage à suivre une formation civique de quatre jours et, selon son niveau, jusqu’à six cents heures de cours de français.',
          visual: 'point',
          draw: 'Un contrat au trait marqué «\u00a0pour un an\u00a0»\u202f; à côté, un calendrier pour la formation civique et un livre pour les heures de cours.',
          emphasis: ['4\u00a0jours', '600\u00a0heures'],
        },
        {
          id: 'immigration-langue-03',
          say: 'En 2025, 102\u202f871 contrats ont été signés. Pour un peu plus de la moitié, 51,2\u00a0%, une formation au français est prescrite.',
          spoken: 'En deux mille vingt-cinq, cent deux mille huit cent soixante et onze contrats ont été signés. Pour un peu plus de la moitié, cinquante et un virgule deux pour cent, une formation au français est prescrite.',
          visual: 'figure',
          draw: 'Un disque au trait dont un peu plus de la moitié se compte au bleu bille.',
          emphasis: ['102\u202f871', '51,2\u00a0%'],
          figure: {
            value: '102\u202f871',
            label: 'Contrats d’intégration républicaine signés (−10,1\u00a0% sur un an), dont 51,2\u00a0% avec une formation au français prescrite. Parmi les signataires formés, 67,6\u00a0% ont atteint le niveau A1 (débutant) en fin de formation (France, ressortissants de pays tiers)',
            date: '2025',
            sourceIndex: 0,
          },
        },
        {
          id: 'immigration-langue-04',
          say: 'En 2025, 67,6\u00a0% des signataires formés ont atteint en fin de formation le niveau A1, celui des débutants. Depuis juillet 2025, les cours sont ouverts à tous ceux qui n’ont pas le niveau A2.',
          spoken: 'En deux mille vingt-cinq, soixante-sept virgule six pour cent des signataires formés ont atteint en fin de formation le niveau A un, celui des débutants. Depuis juillet deux mille vingt-cinq, les cours sont ouverts à tous ceux qui n’ont pas le niveau A deux.',
          visual: 'point',
          draw: 'Le bas d’une échelle des niveaux\u00a0: le barreau A1, compté\u202f; au-dessus, le barreau A2, avec un livre de cours.',
          emphasis: ['67,6\u00a0%', 'niveau A1'],
        },
        {
          id: 'immigration-langue-05',
          say: 'La loi de 2024 exige un niveau de français à chaque étape. A2 pour une carte de séjour pluriannuelle, B1 pour une carte de résident, B2 pour être naturalisé. Et à partir de 2026, un examen civique à réussir.',
          spoken: 'La loi de deux mille vingt-quatre exige un niveau de français à chaque étape. A deux pour une carte de séjour pluriannuelle, B un pour une carte de résident, B deux pour être naturalisé. Et à partir de deux mille vingt-six, un examen civique à réussir.',
          visual: 'timeline',
          draw: 'L’échelle des niveaux complète, de A1 à B2\u202f; à chaque barreau, la carte qu’il ouvre\u202f; à part, sous un trait, l’examen civique.',
          alt: 'Une échelle des niveaux de français\u00a0: A1 en bas, puis A2, B1 et B2.',
          emphasis: ['A2', 'B1', 'B2'],
        },
        {
          id: 'immigration-langue-06',
          say: 'En 2025, on compte 42\u202f246 acquisitions de la nationalité française par décret. C’est 13,5\u00a0% de moins en un an, notamment après une circulaire de mai 2025 qui a renforcé les conditions.',
          spoken: 'En deux mille vingt-cinq, on compte quarante-deux mille deux cent quarante-six acquisitions de la nationalité française par décret. C’est treize virgule cinq pour cent de moins en un an, notamment après une circulaire de mai deux mille vingt-cinq qui a renforcé les conditions.',
          visual: 'figure',
          draw: 'Une carte d’identité au trait\u202f; à côté, une flèche qui descend, et la circulaire datée.',
          emphasis: ['42\u202f246'],
          figure: {
            value: '42\u202f246',
            label: 'Acquisitions de la nationalité française par décret (naturalisations et réintégrations), en baisse de 13,5\u00a0%, notamment après une circulaire du 2\u00a0mai 2025 qui a renforcé les conditions. Depuis le 1er\u00a0janvier 2026, la loi exige aussi un niveau B2 (avancé) en français pour être naturalisé',
            date: '2025',
            sourceIndex: 1,
          },
        },
        {
          id: 'immigration-langue-07',
          say: 'Ce qu’on exige des nouveaux arrivants d’un côté, ce qu’on leur garantit de l’autre\u00a0: c’est la balance du débat.',
          visual: 'compare',
          draw: 'Une balance au trait, le fléau à l’horizontale\u00a0: un document d’examen sur un plateau, un livre de cours sur l’autre.',
          emphasis: ['exige', 'garantit', 'la balance du débat'],
        },
        {
          id: 'immigration-langue-08',
          say: 'Alors, quel niveau demander, et quel accompagnement garantir\u202f?',
          visual: 'question',
          draw: 'L’échelle des niveaux, à peine esquissée, et un point d’interrogation à son sommet.',
          emphasis: ['quel niveau', 'quel accompagnement'],
        },
      ],
      sources: [INTEGRATION_2025, NATIONALITE_2025],
    },

    /* ——— Emploi et droits ——— */
    {
      id: 'immigration-emploi',
      kind: 'deep',
      questionIds: ['immigration-2'],
      title: 'L’emploi et l’accès aux droits',
      short: 'Emploi et droits',
      register: 'vous',
      segments: [
        {
          id: 'immigration-emploi-01',
          say: 'S’intégrer passe aussi par l’emploi, et par l’accès aux droits. Où en est-on\u202f?',
          visual: 'hook',
          draw: 'Une mallette de travail et un guichet au trait, côte à côte.',
          emphasis: ['l’emploi', 'l’accès aux droits'],
        },
        {
          id: 'immigration-emploi-02',
          say: 'En 2024, en France hors Mayotte, 62,4\u00a0% des immigrés de 15 à 64\u00a0ans ont un emploi. Contre 69,8\u00a0% des non-immigrés.',
          spoken: 'En deux mille vingt-quatre, en France hors Mayotte, soixante-deux virgule quatre pour cent des immigrés de quinze à soixante-quatre ans ont un emploi. Contre soixante-neuf virgule huit pour cent des non-immigrés.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les immigrés, les non-immigrés.',
          emphasis: ['62,4\u00a0%', '69,8\u00a0%'],
          figure: {
            value: '62,4\u00a0% contre 69,8\u00a0%',
            label: 'Taux d’emploi des immigrés et des non-immigrés de 15 à 64\u00a0ans (France hors Mayotte)',
            date: '2024',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Immigrés', value: 62.4 },
              { label: 'Non-immigrés', value: 69.8 },
            ],
          },
        },
        {
          id: 'immigration-emploi-03',
          say: 'Pour mesurer les discriminations à l’embauche, on envoie des candidatures fictives, identiques sauf le nom. Un testing a porté sur 9\u202f600 candidatures de diplômés, de décembre 2019 à avril 2021.',
          spoken: 'Pour mesurer les discriminations à l’embauche, on envoie des candidatures fictives, identiques sauf le nom. Un testing a porté sur neuf mille six cents candidatures de diplômés, de décembre deux mille dix-neuf à avril deux mille vingt et un.',
          visual: 'point',
          draw: 'Deux candidatures au trait, identiques ligne pour ligne\u202f; seule la ligne du nom, en haut, diffère.',
          emphasis: ['identiques sauf le nom', '9\u202f600 candidatures'],
        },
        {
          id: 'immigration-emploi-04',
          say: 'Les recruteurs ont rappelé 22,8\u00a0% des candidatures au nom d’origine supposée maghrébine. Et 33,3\u00a0% de celles sans origine migratoire supposée.',
          spoken: 'Les recruteurs ont rappelé vingt-deux virgule huit pour cent des candidatures au nom d’origine supposée maghrébine. Et trente-trois virgule trois pour cent de celles sans origine migratoire supposée.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les taux de rappel des deux groupes de candidatures.',
          emphasis: ['22,8\u00a0%', '33,3\u00a0%'],
          figure: {
            value: '22,8\u00a0% contre 33,3\u00a0%',
            label: 'Taux de rappel par les recruteurs de candidatures fictives au nom d’origine supposée maghrébine, contre des candidatures comparables sans ascendance migratoire supposée (testing mené pour la DARES sur 9\u202f600 candidatures de diplômés ayant étudié et travaillé en France)',
            date: 'décembre 2019 – avril 2021 (publié en 2023)',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Origine supposée maghrébine', value: 22.8 },
              { label: 'Sans origine migratoire supposée', value: 33.3 },
            ],
          },
        },
        {
          id: 'immigration-emploi-05',
          say: 'Côté aides, certaines exigent une durée de séjour. C’est le cas du RSA, le revenu de solidarité active.',
          spoken: 'Côté aides, certaines exigent une durée de séjour. C’est le cas du R.S.A., le revenu de solidarité active.',
          visual: 'point',
          draw: 'Un guichet au trait marqué RSA\u202f; à côté, un sablier.',
          emphasis: ['une durée de séjour', 'RSA'],
        },
        {
          id: 'immigration-emploi-06',
          say: 'Pour le toucher, un étranger non européen doit en principe détenir depuis au moins 5\u00a0ans un titre de séjour qui l’autorise à travailler. Sauf, notamment, les réfugiés ou les titulaires d’une carte de résident.',
          spoken: 'Pour le toucher, un étranger non européen doit en principe détenir depuis au moins cinq ans un titre de séjour qui l’autorise à travailler. Sauf, notamment, les réfugiés ou les titulaires d’une carte de résident.',
          visual: 'timeline',
          draw: 'Une ligne des années, de la carte de séjour au repère des cinq ans\u202f; un chemin en pointillé la contourne pour les exceptions.',
          alt: 'Une ligne des années graduée de un à cinq.',
          emphasis: ['au moins 5\u00a0ans', 'les réfugiés'],
        },
        {
          id: 'immigration-emploi-07',
          say: 'En avril 2024, le Conseil constitutionnel a admis qu’une durée de résidence puisse être exigée des étrangers pour certaines prestations. Mais il a jugé disproportionné d’exiger 5\u00a0ans de résidence ou 30\u00a0mois d’activité pour les allocations familiales ou les aides au logement.',
          spoken: 'En avril deux mille vingt-quatre, le Conseil constitutionnel a admis qu’une durée de résidence puisse être exigée des étrangers pour certaines prestations. Mais il a jugé disproportionné d’exiger cinq ans de résidence ou trente mois d’activité pour les allocations familiales ou les aides au logement.',
          visual: 'point',
          draw: 'Le monument du Conseil constitutionnel\u202f; à côté, un sablier admis pour certaines prestations, et un sablier de cinq ans (ou trente mois d’activité) qui passe en pointillé devant les allocations familiales et les aides au logement.',
          emphasis: ['certaines prestations', 'disproportionné'],
        },
        {
          id: 'immigration-emploi-08',
          say: 'Alors, comment favoriser l’emploi, et quels droits ouvrir, après combien de temps\u202f?',
          visual: 'question',
          draw: 'La mallette et le guichet du début, puis un sablier et un point d’interrogation.',
          emphasis: ['quels droits ouvrir'],
        },
      ],
      sources: [ACTIVITE_IMMIGRES, TESTING_2023, RSA_F19778, DECISION_2024_6],
    },

    /* ——— Expulsions ——— */
    {
      id: 'immigration-expulsions',
      kind: 'deep',
      questionIds: ['immigration-3'],
      title: 'Comment se passent les expulsions\u202f?',
      short: 'Expulsions',
      register: 'vous',
      segments: [
        {
          id: 'immigration-expulsions-01',
          say: 'Un étranger en situation irrégulière reçoit une OQTF, une obligation de quitter le territoire français. Part-il ensuite\u202f?',
          spoken: 'Un étranger en situation irrégulière reçoit une O.Q.T.F., une obligation de quitter le territoire français. Part-il ensuite ?',
          visual: 'hook',
          draw: 'Un document au trait marqué OQTF, une personne, et une valise posée à côté, sous un point d’interrogation.',
          emphasis: ['OQTF', 'Part-il'],
        },
        {
          id: 'immigration-expulsions-02',
          say: 'Selon la commission des lois de l’Assemblée, près de 15\u202f000\u00a0OQTF ont été exécutées en 2024, sur environ 130\u202f000 prononcées. Environ une sur dix.',
          spoken: 'Selon la commission des lois de l’Assemblée, près de quinze mille O.Q.T.F. ont été exécutées en deux mille vingt-quatre, sur environ cent trente mille prononcées. Environ une sur dix.',
          visual: 'figure',
          draw: 'Dix documents OQTF alignés\u202f; un seul se compte au bleu bille.',
          emphasis: ['15\u202f000', 'une sur dix'],
          figure: {
            value: '≈\u00a015\u202f000 sur 130\u202f000',
            label: 'OQTF exécutées en 2024 (près de 15\u202f000, contre environ 10\u202f000 en 2022 et en 2023), rapportées aux OQTF prononcées chaque année (de l’ordre de 130\u202f000)\u00a0: environ une sur dix. Ce décompte de la commission des lois de l’Assemblée ne recouvre pas celui du ministère de l’Intérieur (éloignements forcés depuis la métropole, majeurs seulement)',
            date: '2024',
            sourceIndex: 0,
          },
          chart: { kind: 'part', value: 15000, total: 130000, whole: 'OQTF prononcées' },
        },
        {
          id: 'immigration-expulsions-03',
          say: 'Plusieurs facteurs pèsent sur ce taux. D’abord, la loi impose une OQTF à chaque séjour irrégulier constaté, même sans perspective réelle de départ.',
          spoken: 'Plusieurs facteurs pèsent sur ce taux. D’abord, la loi impose une O.Q.T.F. à chaque séjour irrégulier constaté, même sans perspective réelle de départ.',
          visual: 'point',
          draw: 'Quatre personnes au trait, chacune avec son document OQTF\u202f; les valises restent en pointillé.',
          emphasis: ['à chaque séjour irrégulier constaté'],
        },
        {
          id: 'immigration-expulsions-04',
          say: 'Ensuite, le juge en annule 18\u00a0% en première instance, en 2023. Une même personne peut en recevoir plusieurs. Certains départs spontanés ne sont pas comptés.',
          spoken: 'Ensuite, le juge en annule dix-huit pour cent en première instance, en deux mille vingt-trois. Une même personne peut en recevoir plusieurs. Certains départs spontanés ne sont pas comptés.',
          visual: 'point',
          draw: 'Trois lignes, une par facteur\u00a0: un document annulé, une personne avec plusieurs documents, une valise en pointillé.',
          emphasis: ['18\u00a0%', 'plusieurs', 'pas comptés'],
        },
        {
          id: 'immigration-expulsions-05',
          say: 'En 2025, avec 137\u202f550 ordres de quitter le territoire, la France est en tête de l’Union européenne. Pour les OQTF exécutées en 2024, elle était aussi en tête des pays européens, à égalité avec l’Allemagne.',
          spoken: 'En deux mille vingt-cinq, avec cent trente-sept mille cinq cent cinquante ordres de quitter le territoire, la France est en tête de l’Union européenne. Pour les O.Q.T.F. exécutées en deux mille vingt-quatre, elle était aussi en tête des pays européens, à égalité avec l’Allemagne.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: la France et l’Allemagne\u202f; dessous, les OQTF exécutées en 2024, à égalité avec l’Allemagne.',
          alt: 'Deux barres à la même échelle, les ordres de quitter le territoire\u00a0: France, 137\u202f550\u202f; Allemagne, 55\u202f240.',
          emphasis: ['137\u202f550', 'à égalité avec l’Allemagne'],
          figure: {
            value: '137\u202f550',
            label: 'Ordres de quitter le territoire délivrés en France à des ressortissants de pays tiers\u00a0: le nombre le plus élevé de l’UE (28,0\u00a0% du total européen, devant l’Allemagne avec 55\u202f240)',
            date: '2025',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'ordres',
            items: [
              { label: 'France', value: 137550 },
              { label: 'Allemagne', value: 55240 },
            ],
          },
        },
        {
          id: 'immigration-expulsions-06',
          say: 'Depuis une circulaire d’août 2022, la rétention vise en priorité les étrangers qui menacent l’ordre public. Selon le ministère de l’Intérieur, 90\u00a0% des personnes retenues sont connues pour troubles à l’ordre public ou radicalisation.',
          spoken: 'Depuis une circulaire d’août deux mille vingt-deux, la rétention vise en priorité les étrangers qui menacent l’ordre public. Selon le ministère de l’Intérieur, quatre-vingt-dix pour cent des personnes retenues sont connues pour troubles à l’ordre public ou radicalisation.',
          visual: 'point',
          draw: 'Un bâtiment au trait pour le centre de rétention\u202f; à côté, un disque dont neuf dixièmes se comptent, et dessous, l’attribution au ministère de l’Intérieur.',
          emphasis: ['l’ordre public', '90\u00a0%'],
        },
        {
          id: 'immigration-expulsions-07',
          say: 'Les 26 centres de rétention comptent environ 2\u202f000\u00a0places. Pour les personnes retenues, 40\u00a0% des OQTF sont exécutées.',
          spoken: 'Les vingt-six centres de rétention comptent environ deux mille places. Pour les personnes retenues, quarante pour cent des O.Q.T.F. sont exécutées.',
          visual: 'point',
          draw: 'Vingt-six petits bâtiments en deux rangées\u202f; dessous, dix documents OQTF dont quatre se comptent.',
          emphasis: ['2\u202f000\u00a0places', '40\u00a0%'],
        },
        {
          id: 'immigration-expulsions-08',
          say: 'Pour un éloignement forcé, le pays d’origine doit reconnaître son ressortissant, souvent par un laissez-passer consulaire. En 2023, 30\u00a0% des laissez-passer demandés par les préfectures ont été délivrés à temps.',
          spoken: 'Pour un éloignement forcé, le pays d’origine doit reconnaître son ressortissant, souvent par un laissez-passer consulaire. En deux mille vingt-trois, trente pour cent des laissez-passer demandés par les préfectures ont été délivrés à temps.',
          visual: 'figure',
          draw: 'Un guichet de consulat au trait\u202f; à côté, dix laissez-passer dont trois se comptent.',
          emphasis: ['laissez-passer consulaire', '30\u00a0%'],
          figure: {
            value: '30\u00a0%',
            label: 'Des laissez-passer consulaires demandés par les préfectures ont été délivrés à temps par les consulats',
            date: '2023',
            sourceIndex: 0,
          },
          chart: { kind: 'part', value: 30, total: 100, unit: '%', whole: 'des laissez-passer demandés' },
        },
        {
          id: 'immigration-expulsions-09',
          say: 'Selon la commission des lois, c’est l’obstacle principal dans de nombreux cas. Certaines personnes refusent de coopérer pour établir leur identité. Certains consulats tardent, ou refusent.',
          visual: 'point',
          draw: 'Deux côtés de l’obstacle\u00a0: une personne et une carte d’identité en pointillé\u202f; un guichet de consulat et un sablier.',
          emphasis: ['l’obstacle principal'],
        },
        {
          id: 'immigration-expulsions-10',
          say: 'Alors, qui éloigner, combien, et comment obtenir la coopération des pays d’origine\u202f?',
          visual: 'question',
          draw: 'Le document OQTF et le guichet du consulat, reliés par une flèche en pointillé jusqu’à un point d’interrogation.',
          emphasis: ['qui éloigner', 'la coopération'],
        },
      ],
      sources: [NOTE_OQTF, EUROSTAT_ORDRES],
    },
  ],
}
