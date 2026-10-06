// Série « Laïcité et mémoire » (famille « République et vie politique ») : l'introduction, puis cinq
// approfondissements. La question laicite_republique-1 (quelle approche de la laïcité) mêle trois leviers, chacun a
// sa vidéo : le principe et ses exceptions, les signes religieux, les religions et les discriminations. La question
// laicite_republique-2 (l'histoire de la colonisation) en a deux : les décisions prises depuis 2021, puis la place
// de la loi et de l'État face à l'histoire.
// Matière : les fiches des deux questions (research/choisir-2027/explainers.json, explainer-charts.json) et le
// « context » de leurs questions dans bank.json (la loi de 1905, les règles de l'école publique et des agents
// publics, les crimes reconnus sans excuses officielles, la commission mixte d'historiens), rien d'autre. Ces faits
// du « context » n'ont pas de source dans les fiches : aucun ne porte de chiffre de fiche (« figure »), et le seul
// nombre qui en vient est l'année de la loi de 1905, qui la nomme ; l'année de la commission mixte (2022 selon le
// « context ») n'est pas dite, faute de source.
// Sujet où les mots eux-mêmes sont disputés : seulement les termes des fiches et des institutions, les analyses
// attribuées à leur source ; jamais les approches en débat. Aucun symbole religieux dans les dessins.
// Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/laicite_republique.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison une fois la voix enregistrée : changer un « say »
// ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : la proposition de loi sur la laïcité dans le sport, adoptée par le Sénat le 18 février 2025, n'était pas
// adoptée par l'Assemblée nationale au 3 octobre 2026 (laicite-signes-04 et -05). À revoir si l'Assemblée
// l'examine.

import type { VideoSeries } from '../types'

/* ——— Les sources, copiées des fiches ——— */

const CONSTITUTION = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
}

const QPC_2013 = {
  title: 'Décision n°\u00a02012-297 QPC du 21\u00a0février 2013 (traitement des pasteurs dans le Bas-Rhin, le Haut-Rhin et la Moselle)',
  url: 'https://www.conseil-constitutionnel.fr/decision/2013/2012297QPC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2013-02-21',
}

const COMITE_2021 = {
  title: 'Décret n°\u00a02021-716 du 4\u00a0juin 2021 instituant un comité interministériel de la laïcité',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043604820',
  publisher: 'Légifrance',
  date: '2021-06-04',
}

const RELIGIONS = {
  title: 'La diversité religieuse en France\u00a0: transmissions intergénérationnelles et pratiques selon les origines (enquête Trajectoires et Origines\u00a02)',
  url: 'https://www.insee.fr/fr/statistiques/6793308?sommaire=6793391',
  publisher: 'Insee – Ined',
  date: '2023-03-30',
}

const DISCRIMINATIONS = {
  title: 'Immigrés et descendants d’immigrés en France – fiche Discriminations',
  url: 'https://www.insee.fr/fr/statistiques/6793302?sommaire=6793391',
  publisher: 'Insee – Ined',
  date: '2023-03-30',
}

const SENAT_SPORT = {
  title: 'Proposition de loi visant à assurer le respect du principe de laïcité dans le sport – La loi en clair',
  url: 'https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-assurer-le-respect-du-principe-de-laicite-dans-le-sport.html',
  publisher: 'Sénat',
  date: '2025-02',
}

const RAPPORT_2021 = {
  title: 'Les questions mémorielles portant sur la colonisation et la guerre d’Algérie',
  url: 'https://www.vie-publique.fr/rapport/278186-rapport-stora-memoire-sur-la-colonisation-et-la-guerre-dalgerie',
  publisher: 'vie-publique.fr (DILA) – rapport commandé par la Présidence de la République',
  date: '2021-01-20',
}

const ARCHIVES_2021 = {
  title: 'Arrêté du 22\u00a0décembre 2021 portant ouverture d’archives relatives à la guerre d’Algérie',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000044546979',
  publisher: 'Légifrance',
  date: '2021-12-22',
}

const HARKIS_2022 = {
  title: 'Loi n°\u00a02022-229 du 23\u00a0février 2022 portant reconnaissance de la Nation envers les harkis',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045220741',
  publisher: 'Légifrance',
  date: '2022-02-23',
}

const RESTES_2023 = {
  title: 'Loi n°\u00a02023-1251 du 26\u00a0décembre 2023 relative à la restitution de restes humains appartenant aux collections publiques',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000048668800',
  publisher: 'Légifrance',
  date: '2023-12-26',
}

const BIENS_2026 = {
  title: 'Loi n°\u00a02026-351 du 9\u00a0mai 2026 relative à la restitution de biens culturels ayant fait l’objet d’une appropriation illicite (art.\u00a0L.\u00a0115-10 à L.\u00a0115-16 du code du patrimoine)',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054049788',
  publisher: 'Légifrance',
  date: '2026-05-09',
}

const MISSION_2008 = {
  title: 'Rapport d’information n°\u00a01262 fait au nom de la mission d’information sur les questions mémorielles',
  url: 'https://www.assemblee-nationale.fr/13/rap-info/i1262.asp',
  publisher: 'Assemblée nationale',
  date: '2008-11-18',
}

/* ——— Les chiffres des fiches, et leurs graphiques (explainer-charts.json, copiés tels quels) ——— */

const FIG_RELIGIONS = {
  value: '51\u00a0%',
  label: 'des 18-59\u00a0ans se disent sans religion\u202f; 29\u00a0% se déclarent catholiques, 10\u00a0% musulmans et 10\u00a0% d’une autre religion – France métropolitaine',
  date: '2019-2020',
}

/** laicite_republique-1, chiffre n° 0 */
const CHART_RELIGIONS = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Sans religion', value: 51 },
    { label: 'Catholiques', value: 29 },
    { label: 'Musulmans', value: 10 },
    { label: 'Autre religion', value: 10 },
  ],
}

const FIG_VOILE = {
  value: '26\u00a0%',
  label: 'des femmes musulmanes de 18 à 49\u00a0ans disent porter un voile, contre 18\u00a0% en 2008-2009 – France métropolitaine',
  date: '2019-2020',
}

/** laicite_republique-1, chiffre n° 1 */
const CHART_VOILE = {
  kind: 'series',
  unit: '%',
  items: [
    { label: '2008-2009', value: 18 },
    { label: '2019-2020', value: 26 },
  ],
}

const FIG_DISCRIMINATIONS = {
  value: '7\u00a0%',
  label: 'des personnes ayant déclaré une discrimination ou un traitement inégalitaire au cours des cinq dernières années citent leur religion comme motif. C’est 30\u00a0% chez les immigrés et descendants d’immigrés du Maroc et de Tunisie, contre 2\u00a0% chez les personnes sans ascendance migratoire ni originaires d’outre-mer – France métropolitaine, 18-59\u00a0ans',
  date: '2019-2020',
}

/** laicite_republique-1, chiffre n° 2 */
const CHART_DISCRIMINATIONS = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Ensemble des personnes', value: 7 },
    { label: 'Origine Maroc ou Tunisie', value: 30 },
    { label: 'Sans ascendance migratoire', value: 2 },
  ],
}

const FIG_SENAT = {
  value: '210\u00a0voix contre 81',
  label: 'vote du Sénat sur une proposition de loi (texte d’origine parlementaire) interdisant les signes ou tenues manifestant ostensiblement une appartenance religieuse dans les compétitions sportives. Transmis à l’Assemblée nationale le 19\u00a0février 2025, le texte n’y avait pas été adopté au 3\u00a0octobre 2026',
  date: '18 février 2025',
}

/** laicite_republique-1, chiffre n° 3 */
const CHART_SENAT = {
  kind: 'compare',
  unit: 'voix',
  items: [
    { label: 'Pour', value: 210 },
    { label: 'Contre', value: 81 },
  ],
}

const FIG_RAPPORT = {
  value: 'Une trentaine',
  label: 'de préconisations dans le rapport remis en janvier 2021 au président de la République par un historien, à sa demande\u00a0: commission «\u00a0Mémoire et vérité\u00a0», commémorations, restitution de l’épée de l’émir Abdelkader, transfert de certaines archives…',
  date: '20 janvier 2021',
}

const FIG_ARCHIVES = {
  value: '1954-1966',
  label: 'période couverte par l’ouverture anticipée des archives d’enquêtes de police judiciaire et d’affaires judiciaires liées à la guerre d’Algérie (du 1er\u00a0novembre 1954 au 31\u00a0décembre 1966)',
  date: '22 décembre 2021',
}

const FIG_BIENS = {
  value: '1815-1972',
  label: 'période d’appropriation visée par la loi du 9\u00a0mai 2026 (vol, pillage, cession obtenue par contrainte ou violence)\u00a0: les biens culturels publics concernés peuvent être restitués à un État qui le demande, par un décret pris après avis du Conseil d’État',
  date: '9 mai 2026',
}

export const LAICITE_REPUBLIQUE: VideoSeries = {
  topicId: 'laicite_republique',
  familyId: 'republique',
  label: 'Laïcité et mémoire',
  videos: [
    {
      id: 'laicite-intro',
      kind: 'intro',
      questionIds: ['laicite_republique-1', 'laicite_republique-2'],
      title: 'Laïcité et mémoire, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'laicite-intro-01',
          say: 'La République est laïque\u00a0: la Constitution l’écrit dès son article\u00a01er. Mais elle ne définit pas le mot.',
          spoken: 'La République est laïque : la Constitution l’écrit dès son article premier. Mais elle ne définit pas le mot.',
          visual: 'hook',
          draw: 'Une page de la Constitution\u00a0: «\u00a0article 1er\u00a0», puis le mot «\u00a0laïque\u00a0» au bleu bille\u202f; à la place de sa définition, des lignes vides en pointillé et un point d’interrogation.',
          emphasis: ['laïque', 'ne définit pas'],
        },
        {
          id: 'laicite-intro-02',
          say: 'La loi de 1905 sépare les Églises et l’État. Avec des exceptions locales, comme en Alsace-Moselle, où l’État rémunère des ministres du culte.',
          spoken: 'La loi de mille neuf cent cinq sépare les Églises et l’État. Avec des exceptions locales, comme en Alsace-Moselle, où l’État rémunère des ministres du culte.',
          visual: 'point',
          draw: 'L’État (un monument) et les Églises (une salle sans aucun signe), séparés par un double trait au bleu bille\u202f; dessous, la carte de France où l’Alsace-Moselle se marque d’un rond, et une pièce qui va de l’État à une personne.',
          emphasis: ['loi de 1905', 'Alsace-Moselle'],
        },
        {
          id: 'laicite-intro-03',
          say: 'À l’école publique, les élèves ne peuvent pas porter de signes religieux ostensibles. Et les agents publics doivent rester neutres.',
          visual: 'point',
          draw: 'Une école au trait, un panneau d’interdiction générique (un rond barré) à sa porte\u202f; à côté, un guichet de service public, une personne derrière.',
          emphasis: ['signes religieux ostensibles', 'neutres'],
        },
        {
          id: 'laicite-intro-04',
          say: 'En France métropolitaine, en 2019 et 2020, 51\u00a0% des 18 à 59\u00a0ans se disent sans religion. 29\u00a0% se déclarent catholiques, 10\u00a0% musulmans, 10\u00a0% d’une autre religion.',
          spoken: 'En France métropolitaine, en deux mille dix-neuf et deux mille vingt, cinquante et un pour cent des dix-huit à cinquante-neuf ans se disent sans religion. Vingt-neuf pour cent se déclarent catholiques, dix pour cent musulmans, dix pour cent d’une autre religion.',
          visual: 'figure',
          draw: 'Quatre barres horizontales à la même échelle, depuis zéro\u00a0: sans religion, catholiques, musulmans, autre religion.',
          alt: 'Quatre barres à la même échelle, depuis zéro\u00a0: sans religion 51\u00a0%, catholiques 29\u00a0%, musulmans 10\u00a0%, autre religion 10\u00a0%.',
          emphasis: ['51\u00a0%', 'sans religion'],
          figure: { ...FIG_RELIGIONS, sourceIndex: 2 },
          chart: CHART_RELIGIONS,
        },
        {
          id: 'laicite-intro-05',
          say: 'L’autre sujet du thème, c’est la mémoire de la colonisation, notamment de la guerre d’Algérie.',
          visual: 'point',
          draw: 'Trois pictogrammes au trait\u00a0: une boîte d’archives, un livre d’histoire, un monument.',
          emphasis: ['la mémoire de la colonisation'],
        },
        {
          id: 'laicite-intro-06',
          say: 'Depuis 2021, l’État a pris plusieurs décisions\u00a0: un rapport officiel, l’ouverture d’archives, des lois de restitution.',
          spoken: 'Depuis deux mille vingt et un, l’État a pris plusieurs décisions : un rapport officiel, l’ouverture d’archives, des lois de restitution.',
          visual: 'point',
          draw: 'Trois pictogrammes légendés, chacun quand la voix le nomme\u00a0: un document, une boîte d’archives, une caisse que ramène une flèche.',
          emphasis: ['plusieurs décisions'],
        },
        {
          id: 'laicite-intro-07',
          say: 'Alors, quatre questions se posent. Comment définir la laïcité\u202f? Où placer la limite pour les signes religieux\u202f? Quelle place pour la lutte contre les discriminations\u202f? Et comment aborder l’histoire de la colonisation\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, chacun avec sa question\u00a0: un document, un rond barré, une personne, un livre.',
          emphasis: ['définir', 'la limite', 'aborder l’histoire'],
        },
        {
          id: 'laicite-intro-08',
          say: 'Dans les vidéos suivantes, on regarde chacun de ces sujets de plus près.',
          visual: 'outro',
          draw: 'Le sommaire de la série\u00a0: les cinq approfondissements, chacun avec son pictogramme.',
        },
      ],
      sources: [CONSTITUTION, QPC_2013, RELIGIONS, RAPPORT_2021, ARCHIVES_2021, RESTES_2023, BIENS_2026],
    },
    {
      id: 'laicite-principe',
      kind: 'deep',
      questionIds: ['laicite_republique-1'],
      title: 'Que veut dire «\u00a0laïque\u00a0»\u202f?',
      short: 'Le principe',
      register: 'vous',
      segments: [
        {
          id: 'laicite-principe-01',
          say: 'La France est une République laïque. Mais qui décide de ce que ce mot veut dire\u202f?',
          visual: 'hook',
          draw: 'Une page où le mot «\u00a0laïque\u00a0» est écrit au bleu bille, et un grand point d’interrogation.',
          emphasis: ['laïque', 'qui décide'],
        },
        {
          id: 'laicite-principe-02',
          say: 'La Constitution emploie ce mot dès son article\u00a01er, sans le définir.',
          spoken: 'La Constitution emploie ce mot dès son article premier, sans le définir.',
          visual: 'point',
          draw: 'La page de la Constitution\u00a0: «\u00a0article 1er\u00a0», le mot «\u00a0laïque\u00a0», et à la place de sa définition, des lignes vides en pointillé et un point d’interrogation.',
          emphasis: ['article\u00a01er', 'sans le définir'],
        },
        {
          id: 'laicite-principe-03',
          say: 'C’est une loi, celle de 1905, qui sépare les Églises et l’État.',
          spoken: 'C’est une loi, celle de mille neuf cent cinq, qui sépare les Églises et l’État.',
          visual: 'point',
          draw: 'L’État (un monument) et les Églises (une salle sans aucun signe), puis un double trait au bleu bille qui les sépare.',
          emphasis: ['1905', 'sépare'],
        },
        {
          id: 'laicite-principe-04',
          say: 'Mais il existe des exceptions locales. En Alsace-Moselle, par exemple, l’État rémunère des ministres du culte.',
          visual: 'point',
          draw: 'La carte de France, l’Alsace-Moselle marquée d’un rond au bleu bille\u202f; à côté, une pièce qui va de l’État à une personne.',
          emphasis: ['exceptions locales', 'Alsace-Moselle'],
        },
        {
          id: 'laicite-principe-05',
          say: 'En 2013, le Conseil constitutionnel a jugé que la Constitution n’avait pas «\u00a0entendu remettre en cause\u00a0» ces règles particulières.',
          spoken: 'En deux mille treize, le Conseil constitutionnel a jugé que la Constitution n’avait pas « entendu remettre en cause » ces règles particulières.',
          visual: 'timeline',
          draw: 'Une frise de 1900 à aujourd’hui\u00a0: la loi de 1905 en gris, un fanion au bleu bille en 2013\u202f; au-dessus, la carte de France, l’Alsace-Moselle toujours marquée.',
          alt: 'Sur une frise du temps, la loi de 1905, puis la décision de 2013.',
          emphasis: ['Conseil constitutionnel', 'remettre en cause'],
        },
        {
          id: 'laicite-principe-06',
          say: 'L’Observatoire de la laïcité, créé en 2007, a été supprimé en juin 2021.',
          spoken: 'L’Observatoire de la laïcité, créé en deux mille sept, a été supprimé en juin deux mille vingt et un.',
          visual: 'timeline',
          draw: 'Sur une frise des années, une bande au bleu bille de 2007 à 2021, fermée d’une croix.',
          emphasis: ['créé en 2007', 'supprimé en juin 2021'],
        },
        {
          id: 'laicite-principe-07',
          say: 'Depuis, un comité interministériel de la laïcité coordonne l’action du gouvernement. Présidé par le Premier ministre, il se réunit au moins une fois par an.',
          visual: 'point',
          draw: 'Une table au trait, des personnes autour, celle du milieu au bleu bille\u202f; à côté, un calendrier, un jour entouré.',
          emphasis: ['comité interministériel', 'au moins une fois par an'],
        },
        {
          id: 'laicite-principe-08',
          say: 'Alors, comment définir la laïcité, et que faire des exceptions locales\u202f?',
          visual: 'question',
          draw: 'La page sans définition, la carte de France et son rond, puis un point d’interrogation.',
          emphasis: ['définir', 'exceptions locales'],
        },
      ],
      sources: [CONSTITUTION, QPC_2013, COMITE_2021],
    },
    {
      id: 'laicite-signes',
      kind: 'deep',
      questionIds: ['laicite_republique-1'],
      title: 'Les signes religieux\u00a0: quelles règles\u202f?',
      short: 'Signes religieux',
      register: 'vous',
      segments: [
        {
          id: 'laicite-signes-01',
          say: 'Porter un signe religieux\u00a0: où est-ce interdit, et pour qui\u202f?',
          visual: 'hook',
          draw: 'Trois lieux au trait sur une même ligne, une école, un guichet, une coupe de compétition, chacun avec un point d’interrogation.',
          emphasis: ['où est-ce interdit', 'pour qui'],
        },
        {
          id: 'laicite-signes-02',
          say: 'À l’école publique, les élèves ne peuvent pas porter de signes religieux ostensibles.',
          visual: 'point',
          draw: 'Une école au trait, un panneau d’interdiction générique (un rond barré) à sa porte, trois élèves à côté.',
          emphasis: ['les élèves', 'signes religieux ostensibles'],
        },
        {
          id: 'laicite-signes-03',
          say: 'Et les agents publics, eux, doivent rester neutres.',
          visual: 'point',
          draw: 'Un guichet de service public, une personne derrière\u202f; à côté, une petite balance au fléau bien droit.',
          emphasis: ['les agents publics', 'neutres'],
        },
        {
          id: 'laicite-signes-04',
          say: 'En février 2025, le Sénat a adopté une proposition de loi pour interdire les signes religieux ostensibles dans les compétitions sportives. Par 210\u00a0voix contre 81.',
          spoken: 'En février deux mille vingt-cinq, le Sénat a adopté une proposition de loi pour interdire les signes religieux ostensibles dans les compétitions sportives. Par deux cent dix voix contre quatre-vingt-un.',
          visual: 'figure',
          draw: 'Un hémicycle au trait, et deux barres à la même échelle, depuis zéro\u00a0: les voix pour, les voix contre.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: 210\u00a0voix pour, 81\u00a0voix contre.',
          emphasis: ['compétitions sportives', '210\u00a0voix contre 81'],
          figure: { ...FIG_SENAT, sourceIndex: 0 },
          chart: CHART_SENAT,
        },
        {
          id: 'laicite-signes-05',
          say: 'Transmis à l’Assemblée nationale, le texte n’y avait pas été adopté au 3\u00a0octobre 2026.',
          spoken: 'Transmis à l’Assemblée nationale, le texte n’y avait pas été adopté au trois octobre deux mille vingt-six.',
          visual: 'point',
          draw: 'Le texte, adopté, part du premier hémicycle vers le second par une flèche en tirets\u202f; au-dessus du second, le même texte en pointillé, et la date.',
          alt: 'Deux hémicycles\u00a0: le Sénat, puis l’Assemblée nationale.',
          emphasis: ['pas été adopté'],
        },
        {
          id: 'laicite-signes-06',
          say: 'Alors, où placer la limite pour les signes religieux\u202f?',
          visual: 'question',
          draw: 'L’école, le guichet et la coupe sur une même ligne\u202f; entre le guichet et la coupe, une limite en pointillé, deux flèches de part et d’autre, un point d’interrogation.',
          emphasis: ['la limite'],
        },
      ],
      sources: [SENAT_SPORT],
    },
    {
      id: 'laicite-discriminations',
      kind: 'deep',
      questionIds: ['laicite_republique-1'],
      title: 'Religions et discriminations, en chiffres',
      short: 'Discriminations',
      register: 'vous',
      segments: [
        {
          id: 'laicite-discriminations-01',
          say: 'Combien de personnes se disent d’une religion, ou sans religion\u202f? Une enquête de l’Insee et de l’Ined l’a mesuré, en 2019 et 2020.',
          spoken: 'Combien de personnes se disent d’une religion, ou sans religion ? Une enquête de l’Insee et de l’Ined l’a mesuré, en deux mille dix-neuf et deux mille vingt.',
          visual: 'hook',
          draw: 'Un questionnaire au trait, trois cases à cocher, une personne à côté\u202f; les années de l’enquête dessous.',
          emphasis: ['Combien de personnes'],
        },
        {
          id: 'laicite-discriminations-02',
          say: 'En France métropolitaine, 51\u00a0% des 18 à 59\u00a0ans se disent sans religion.',
          spoken: 'En France métropolitaine, cinquante et un pour cent des dix-huit à cinquante-neuf ans se disent sans religion.',
          visual: 'figure',
          draw: 'Cent petits carrés en dix rangées\u202f; cinquante et un se comptent au bleu bille.',
          emphasis: ['51\u00a0%', 'sans religion'],
          figure: { ...FIG_RELIGIONS, sourceIndex: 0 },
          chart: CHART_RELIGIONS,
        },
        {
          id: 'laicite-discriminations-03',
          say: '29\u00a0% se déclarent catholiques, 10\u00a0% musulmans, et 10\u00a0% d’une autre religion.',
          spoken: 'Vingt-neuf pour cent se déclarent catholiques, dix pour cent musulmans, et dix pour cent d’une autre religion.',
          visual: 'compare',
          draw: 'Quatre barres à la même échelle, depuis zéro\u00a0: sans religion, déjà dite, en gris\u202f; puis catholiques, musulmans, autre religion, chacune quand la voix la dit.',
          alt: 'Quatre barres à la même échelle, depuis zéro\u00a0: sans religion 51\u00a0%, catholiques 29\u00a0%, musulmans 10\u00a0%, autre religion 10\u00a0%.',
          emphasis: ['29\u00a0%', '10\u00a0% musulmans', '10\u00a0% d’une autre religion'],
        },
        {
          id: 'laicite-discriminations-04',
          say: 'Dans cette enquête, 26\u00a0% des femmes musulmanes de 18 à 49\u00a0ans disent porter un voile. C’était 18\u00a0% en 2008 et 2009.',
          spoken: 'Dans cette enquête, vingt-six pour cent des femmes musulmanes de dix-huit à quarante-neuf ans disent porter un voile. C’était dix-huit pour cent en deux mille huit et deux mille neuf.',
          visual: 'figure',
          draw: 'Deux colonnes à la même échelle, depuis zéro\u00a0: 2008-2009, puis 2019-2020.',
          alt: 'Deux colonnes à la même échelle, depuis zéro\u00a0: 18\u00a0% en 2008-2009, 26\u00a0% en 2019-2020.',
          emphasis: ['26\u00a0%', '18\u00a0%'],
          figure: { ...FIG_VOILE, sourceIndex: 0 },
          chart: CHART_VOILE,
        },
        {
          id: 'laicite-discriminations-05',
          say: 'Autre résultat\u00a0: parmi les personnes qui déclarent une discrimination ou un traitement inégalitaire ces cinq dernières années, 7\u00a0% citent leur religion comme motif.',
          spoken: 'Autre résultat : parmi les personnes qui déclarent une discrimination ou un traitement inégalitaire ces cinq dernières années, sept pour cent citent leur religion comme motif.',
          visual: 'figure',
          draw: 'Cent petits carrés en dix rangées\u202f; sept se comptent au bleu bille.',
          emphasis: ['7\u00a0%', 'leur religion'],
          figure: { ...FIG_DISCRIMINATIONS, sourceIndex: 1 },
          chart: CHART_DISCRIMINATIONS,
        },
        {
          id: 'laicite-discriminations-06',
          say: 'C’est 30\u00a0% chez les immigrés et descendants d’immigrés du Maroc et de Tunisie. Et 2\u00a0% chez les personnes sans ascendance migratoire ni originaires d’outre-mer.',
          spoken: 'C’est trente pour cent chez les immigrés et descendants d’immigrés du Maroc et de Tunisie. Et deux pour cent chez les personnes sans ascendance migratoire ni originaires d’outre-mer.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: l’ensemble des personnes, déjà dit, en gris\u202f; puis les personnes originaires du Maroc ou de Tunisie, et celles sans ascendance migratoire.',
          alt: 'Trois barres à la même échelle, depuis zéro\u00a0: ensemble des personnes 7\u00a0%, origine Maroc ou Tunisie 30\u00a0%, sans ascendance migratoire 2\u00a0%.',
          emphasis: ['30\u00a0%', '2\u00a0%'],
        },
        {
          id: 'laicite-discriminations-07',
          say: 'Alors, dans la laïcité, quelle place pour la lutte contre les discriminations\u202f?',
          visual: 'question',
          draw: 'Une rangée de personnes toutes semblables, et un point d’interrogation.',
          emphasis: ['la lutte contre les discriminations'],
        },
      ],
      sources: [RELIGIONS, DISCRIMINATIONS],
    },
    {
      id: 'laicite-memoire',
      kind: 'deep',
      questionIds: ['laicite_republique-2'],
      title: 'Colonisation\u00a0: les décisions depuis 2021',
      short: 'Mémoire et restitutions',
      register: 'vous',
      segments: [
        {
          id: 'laicite-memoire-01',
          say: 'La colonisation, la guerre d’Algérie\u00a0: depuis 2021, l’État a pris plusieurs décisions sur leur mémoire. Lesquelles\u202f?',
          spoken: 'La colonisation, la guerre d’Algérie : depuis deux mille vingt et un, l’État a pris plusieurs décisions sur leur mémoire. Lesquelles ?',
          visual: 'hook',
          draw: 'Une frise des années\u00a0: un fanion au bleu bille en 2021, puis une flèche en tirets vers un point d’interrogation.',
          emphasis: ['plusieurs décisions', 'Lesquelles'],
        },
        {
          id: 'laicite-memoire-02',
          say: 'En janvier 2021, un historien remet un rapport au président de la République, à sa demande. Il contient une trentaine de préconisations, c’est-à-dire de recommandations.',
          spoken: 'En janvier deux mille vingt et un, un historien remet un rapport au président de la République, à sa demande. Il contient une trentaine de préconisations, c’est-à-dire de recommandations.',
          visual: 'figure',
          draw: 'Une personne, un rapport au trait, une flèche vers un monument.',
          emphasis: ['une trentaine'],
          figure: { ...FIG_RAPPORT, sourceIndex: 0 },
        },
        {
          id: 'laicite-memoire-03',
          say: 'Parmi elles\u00a0: une commission «\u00a0Mémoire et vérité\u00a0», des commémorations, la restitution de l’épée de l’émir Abdelkader, le transfert de certaines archives.',
          visual: 'point',
          draw: 'Quatre pictogrammes légendés, chacun quand la voix le nomme\u00a0: une personne, un monument, une caisse que ramène une flèche, une boîte d’archives.',
        },
        {
          id: 'laicite-memoire-04',
          say: 'En décembre 2021, l’État ouvre en avance des archives d’enquêtes de police judiciaire et d’affaires judiciaires liées à la guerre d’Algérie. Elles couvrent les années 1954 à 1966.',
          spoken: 'En décembre deux mille vingt et un, l’État ouvre en avance des archives d’enquêtes de police judiciaire et d’affaires judiciaires liées à la guerre d’Algérie. Elles couvrent les années mille neuf cent cinquante-quatre à mille neuf cent soixante-six.',
          visual: 'timeline',
          draw: 'Une boîte d’archives et une clé au bleu bille\u202f; à côté, une frise où la période de 1954 à 1966 se compte au bleu bille.',
          emphasis: ['en avance', '1954 à 1966'],
          figure: { ...FIG_ARCHIVES, sourceIndex: 1 },
        },
        {
          id: 'laicite-memoire-05',
          say: 'En 2022, une loi reconnaît la «\u00a0responsabilité\u00a0» de la Nation envers les harkis et leurs familles. En cause, «\u00a0l’indignité des conditions d’accueil et de vie\u00a0» en France, après 1962. La loi crée aussi une réparation financière forfaitaire.',
          spoken: 'En deux mille vingt-deux, une loi reconnaît la « responsabilité » de la Nation envers les harkis et leurs familles. En cause, « l’indignité des conditions d’accueil et de vie » en France, après mille neuf cent soixante-deux. La loi crée aussi une réparation financière forfaitaire.',
          visual: 'point',
          draw: 'Un texte de loi, une flèche vers trois personnes\u202f; puis des pièces au bleu bille, la réparation.',
          emphasis: ['responsabilité', 'réparation financière'],
        },
        {
          id: 'laicite-memoire-06',
          say: 'Depuis fin 2023, la loi permet de restituer des restes humains des collections publiques à un État qui le demande, pour des funérailles. À condition qu’il s’agisse de personnes mortes après l’an 1500.',
          spoken: 'Depuis fin deux mille vingt-trois, la loi permet de restituer des restes humains des collections publiques à un État qui le demande, pour des funérailles. À condition qu’il s’agisse de personnes mortes après l’an mille cinq cent.',
          visual: 'timeline',
          draw: 'Une vitrine de collection, une caisse que ramène une flèche\u202f; dessous, une frise où le temps après l’an 1500 se compte au bleu bille.',
          alt: 'Sur une frise du temps, à partir de l’an 1500.',
          emphasis: ['restituer', 'après l’an 1500'],
        },
        {
          id: 'laicite-memoire-07',
          say: 'Une loi du 9\u00a0mai 2026 vise des biens culturels publics, pris entre 1815 et 1972. Volés, pillés, ou cédés sous la contrainte ou la violence, ils peuvent être restitués à un État qui le demande.',
          spoken: 'Une loi du neuf mai deux mille vingt-six vise des biens culturels publics, pris entre mille huit cent quinze et mille neuf cent soixante-douze. Volés, pillés, ou cédés sous la contrainte ou la violence, ils peuvent être restitués à un État qui le demande.',
          visual: 'figure',
          draw: 'Un vase au trait et une flèche de retour\u202f; à côté, une frise où la période de 1815 à 1972 se compte au bleu bille.',
          emphasis: ['1815 et 1972', 'restitués'],
          figure: { ...FIG_BIENS, sourceIndex: 4 },
        },
        {
          id: 'laicite-memoire-08',
          say: 'Alors, reconnaître, ouvrir, restituer\u00a0: quel rôle pour l’État\u202f?',
          visual: 'question',
          draw: 'Trois pictogrammes légendés, un document, une boîte d’archives, une caisse que ramène une flèche, puis une flèche en tirets vers un point d’interrogation.',
          emphasis: ['quel rôle pour l’État'],
        },
      ],
      sources: [RAPPORT_2021, ARCHIVES_2021, HARKIS_2022, RESTES_2023, BIENS_2026],
    },
    {
      id: 'laicite-histoire',
      kind: 'deep',
      questionIds: ['laicite_republique-2'],
      title: 'L’État et l’histoire de la colonisation',
      short: 'La loi et l’histoire',
      register: 'vous',
      segments: [
        {
          id: 'laicite-histoire-01',
          say: 'Une loi peut-elle dire comment enseigner l’histoire de la colonisation\u202f? En France, la question s’est posée.',
          visual: 'hook',
          draw: 'Un texte de loi, une flèche en tirets vers un livre d’histoire.',
          emphasis: ['Une loi', 'enseigner l’histoire'],
        },
        {
          id: 'laicite-histoire-02',
          say: 'En 2005, une loi demande aux programmes scolaires de reconnaître «\u00a0le rôle positif de la présence française outre-mer\u00a0».',
          spoken: 'En deux mille cinq, une loi demande aux programmes scolaires de reconnaître « le rôle positif de la présence française outre-mer ».',
          visual: 'timeline',
          draw: 'Un texte de loi dont une ligne est surlignée au bleu bille, une flèche vers un livre\u00a0: les programmes scolaires.',
          emphasis: ['2005', 'programmes scolaires'],
        },
        {
          id: 'laicite-histoire-03',
          say: 'En 2006, cette disposition est abrogée, c’est-à-dire supprimée, par décret. Le Conseil constitutionnel avait jugé que le contenu des programmes ne relève pas de la loi.',
          spoken: 'En deux mille six, cette disposition est abrogée, c’est-à-dire supprimée, par décret. Le Conseil constitutionnel avait jugé que le contenu des programmes ne relève pas de la loi.',
          visual: 'timeline',
          draw: 'La ligne surlignée du texte de loi est barrée\u202f; entre le texte et le livre, un trait en pointillé.',
          emphasis: ['abrogée', 'ne relève pas de la loi'],
        },
        {
          id: 'laicite-histoire-04',
          say: 'En 2008, une mission de l’Assemblée nationale se penche sur les questions mémorielles. Elle conclut que le rôle du Parlement n’est pas d’adopter des lois «\u00a0qualifiant ou portant une appréciation sur des faits historiques\u00a0».',
          spoken: 'En deux mille huit, une mission de l’Assemblée nationale se penche sur les questions mémorielles. Elle conclut que le rôle du Parlement n’est pas d’adopter des lois « qualifiant ou portant une appréciation sur des faits historiques ».',
          visual: 'point',
          draw: 'Un hémicycle au trait, un texte de loi en pointillé, un livre d’histoire.',
          emphasis: ['le rôle du Parlement'],
        },
        {
          id: 'laicite-histoire-05',
          say: 'Selon elle, les résolutions, des textes votés sans force de loi, sont un meilleur outil pour s’exprimer sur l’histoire.',
          visual: 'point',
          draw: 'Le même hémicycle\u202f; à la place du texte de loi, une résolution au bleu bille, et le livre d’histoire.',
          alt: 'Un hémicycle, l’Assemblée nationale\u00a0; une résolution\u00a0; un livre d’histoire, les faits historiques.',
          emphasis: ['les résolutions'],
        },
        {
          id: 'laicite-histoire-06',
          say: 'La France a reconnu plusieurs crimes commis pendant la guerre d’Algérie. Sans présenter d’excuses officielles.',
          visual: 'point',
          draw: 'Un document au bleu bille, la reconnaissance\u202f; à côté, écrit en gris, «\u00a0sans présenter d’excuses officielles\u00a0».',
          emphasis: ['reconnu', 'excuses officielles'],
        },
        {
          id: 'laicite-histoire-07',
          say: 'Une commission mixte d’historiens français et algériens a aussi été créée.',
          visual: 'point',
          draw: 'Une table au trait, deux groupes de personnes semblables autour, un livre au milieu.',
          emphasis: ['commission mixte'],
        },
        {
          id: 'laicite-histoire-08',
          say: 'Alors, comment la France doit-elle aborder l’histoire de la colonisation\u202f?',
          visual: 'question',
          draw: 'Un livre d’histoire ouvert et un point d’interrogation.',
          emphasis: ['aborder l’histoire'],
        },
      ],
      sources: [MISSION_2008],
    },
  ],
}
