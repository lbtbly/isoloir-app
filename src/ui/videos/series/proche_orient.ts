// Série « Israël et Gaza » (famille « Europe et monde ») : l'introduction, puis cinq approfondissements (les
// mots du droit, ce qu'examinent les instances internationales, l'accord entre l'Union européenne et Israël, la
// colonisation en Cisjordanie, le Conseil de sécurité de l'ONU). Le thème a deux questions dans la banque
// (international_defense-2, la qualification ; international_defense-4, les moyens de pression) : leurs fiches
// sont la seule matière, chiffres compris. Règles d'écriture : ../GUIDE-SERIES.md ; planches :
// ../pistes/planches/proche_orient.tsx.
// Vocabulaire : celui des fiches et des institutions, toujours attribué (« selon les autorités israéliennes »,
// « selon le ministère de la Santé de Gaza », « selon elle » pour la commission d'enquête, la Cour ou l'Union) ;
// les deux bilans sont donnés avec la même construction, chacun avec sa source. Aucune personne nommée : les
// mandats d'arrêt de la CPI visent « des dirigeants israéliens » (deux) et « le chef de la branche armée du Hamas ».
// Les mandats de la CPI sont racontés comme un fait daté (« le 21 novembre 2024, elle émet… »), sans dire
// qu'ils sont toujours en vigueur : la fiche ne dit rien de leur suite.
// Les positions en débat (approaches) ne sont jamais présentées : les vidéos décrivent les définitions, les
// procédures, les outils existants et leurs règles de décision, puis posent la question.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : bilans au 23 septembre 2026 (OCHA), procédure de la CIJ au 21 mai 2026, sanctions de l'UE au
// 28 mai 2026, réunion des ministres européens du 21 avril 2026. À revoir à la prochaine mise à jour de ces
// sources, ou après une décision de la CIJ sur le fond.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources des fiches, copiées telles quelles (titres composés à la française) ——— */

const OCHA: VideoSource = {
  title: 'Reported impact snapshot | Gaza Strip (23 September 2026)',
  url: 'https://www.ochaopt.org/sites/default/files/Gaza_Reported_Impact_Snapshot_23_September_2026.pdf',
  publisher: 'OCHA – Bureau de la coordination des affaires humanitaires de l’ONU',
  date: '2026-09-23',
}
const DEFINITIONS: VideoSource = {
  title: 'Definitions of Genocide and Related Crimes',
  url: 'https://www.un.org/en/genocide-prevention/definition',
  publisher: 'Nations unies – Bureau pour la prévention du génocide et la responsabilité de protéger',
}
const CIJ: VideoSource = {
  title: 'Application de la convention pour la prévention et la répression du crime de génocide dans la bande de Gaza (Afrique du Sud c. Israël)',
  url: 'https://www.icj-cij.org/fr/affaire/192',
  publisher: 'Cour internationale de justice',
  date: '2026-09-22',
}
const CPI: VideoSource = {
  title: 'Gaza\u00a0: la CPI émet des mandats d’arrêt contre les Israéliens Nétanyahou et Gallant et Deif du Hamas',
  url: 'https://news.un.org/fr/story/2024/11/1150771',
  publisher: 'ONU Info (Nations unies)',
  date: '2024-11-21',
}
const COMMISSION_ONU: VideoSource = {
  title: 'Israël commet un génocide à Gaza, affirme une commission d’enquête de l’ONU',
  url: 'https://news.un.org/fr/story/2025/09/1157475',
  publisher: 'ONU Info (Nations unies)',
  date: '2025-09-16',
}
const COMMERCE: VideoSource = {
  title: 'EU trade relations with Israel',
  url: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/israel_en',
  publisher: 'Commission européenne – DG Commerce',
  date: '2026',
}
const COMMISSION_UE: VideoSource = {
  title: 'La Commission propose des sanctions et la suspension des concessions commerciales avec Israël',
  url: 'https://france.representation.ec.europa.eu/informations-et-evenements/informations/la-commission-propose-des-sanctions-et-la-suspension-des-concessions-commerciales-avec-israel-2025-09-17_fr',
  publisher: 'Commission européenne – Représentation en France',
  date: '2025-09-17',
}
const CONSEIL_AVRIL: VideoSource = {
  title: 'Foreign Affairs Council, 21 April 2026 – Main results',
  url: 'https://www.consilium.europa.eu/en/meetings/fac/2026/04/21/',
  publisher: 'Conseil de l’Union européenne',
  date: '2026-04-21',
}
const AVIS_CIJ: VideoSource = {
  title: 'La CIJ déclare que l’occupation des territoires palestiniens par Israël viole le droit international',
  url: 'https://news.un.org/fr/story/2024/07/1147211',
  publisher: 'ONU Info (Nations unies)',
  date: '2024-07-19',
}
const HCDH: VideoSource = {
  title: 'Israel’s settlement expansion drives mass displacement in West Bank – UN report',
  url: 'https://www.ohchr.org/en/press-releases/2026/03/israels-settlement-expansion-drives-mass-displacement-west-bank-un-report',
  publisher: 'Haut-Commissariat des Nations unies aux droits de l’homme (HCDH)',
  date: '2026-03-17',
}
const COLONS: VideoSource = {
  title: 'Extremist Israeli settlers: EU lists four entities and three individuals',
  url: 'https://www.consilium.europa.eu/en/press/press-releases/2026/05/28/extremist-israeli-settlers-eu-lists-four-entities-and-three-individuals/',
  publisher: 'Conseil de l’Union européenne',
  date: '2026-05-28',
}
const CONSEIL_SECURITE: VideoSource = {
  title: 'Security Council Fails to Adopt Resolution on Gaza Ceasefire (SC/16174)',
  url: 'https://press.un.org/en/2025/sc16174.doc.htm',
  publisher: 'Nations unies – Couverture des réunions',
  date: '2025-09-18',
}

/* ——— Les chiffres des fiches (libellés de la fiche, composés à la française) ——— */

const TUES_ISRAEL = {
  value: 'Plus de 1\u202f200',
  label: 'Personnes tuées en Israël lors de l’attaque du 7\u00a0octobre 2023 et dans les jours suivants, ressortissants étrangers compris. Source\u00a0: autorités israéliennes, citées par les médias israéliens\u202f; l’OCHA reprend ce bilan en l’attribuant à cette source',
  date: '7\u00a0octobre 2023 (bilan repris par l’OCHA au 23\u00a0septembre 2026)',
}
const TUES_GAZA = {
  value: '73\u202f922',
  label: 'Palestiniens tués dans la bande de Gaza depuis octobre 2023 (cumul). Source\u00a0: ministère de la Santé de Gaza\u202f; l’OCHA reprend ce bilan en l’attribuant à cette source',
  date: 'au 23\u00a0septembre 2026',
}
const COMMISSION = {
  value: '4\u00a0sur 5',
  label: 'Catégories d’actes de génocide qu’Israël commettrait à Gaza, selon une commission de l’ONU (la commission d’enquête internationale indépendante créée par le Conseil des droits de l’homme), parmi les cinq prévues par la Convention de 1948\u202f; elle en conclut à un génocide. Cette commission réunit des experts\u00a0: ce n’est pas un tribunal. Israël rejette ce rapport, qu’il juge «\u00a0biaisé et mensonger\u00a0»',
  date: '16\u00a0septembre 2025',
}
const PART_UE = {
  value: '31,7\u00a0%',
  label: 'Part de l’Union européenne dans le commerce de biens d’Israël, dont elle est le premier partenaire (43,3\u00a0Md€ d’échanges de biens). À l’inverse, Israël représente près de 0,8\u00a0% du commerce de biens de l’UE (27e\u00a0partenaire)',
  date: '2025',
}
/** Le graphique de la fiche (explainer-charts.json, international_defense-4, index 0), tel quel */
const PART_UE_CHART = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'UE dans le commerce d’Israël', value: 31.7 },
    { label: 'Israël dans le commerce de l’UE', value: 0.8 },
  ],
}
const AVANT_POSTES = {
  value: '84',
  label: 'Nouveaux avant-postes de colonisation (implantations de colons) établis en Cisjordanie en douze mois, un nombre «\u00a0sans précédent\u00a0» selon le Haut-Commissariat de l’ONU aux droits de l’homme',
  date: '12\u00a0mois jusqu’au 31\u00a0octobre 2025 (rapport du 17\u00a0mars 2026)',
}
const SANCTIONS = {
  value: '4\u00a0entités et 3\u00a0personnes',
  label: 'Colons extrémistes et organisations qui les soutiennent, selon l’UE, qui les sanctionne pour des atteintes aux droits humains en Cisjordanie (gel des avoirs, interdiction de voyager), après un accord politique des ministres le 11\u00a0mai 2026',
  date: '28\u00a0mai 2026',
}
const VOTE = {
  value: '14\u00a0voix contre 1',
  label: 'Vote au Conseil de sécurité de l’ONU sur un projet de résolution exigeant un cessez-le-feu immédiat à Gaza. Le texte a été rejeté car le vote contre venait d’un membre permanent, les États-Unis\u00a0: l’opposition d’un seul des cinq membres permanents suffit à bloquer une résolution',
  date: '18\u00a0septembre 2025',
}

export const PROCHE_ORIENT: VideoSeries = {
  topicId: 'proche_orient',
  familyId: 'monde',
  label: 'Israël et Gaza',
  videos: [
    {
      id: 'proche-orient-intro',
      kind: 'intro',
      questionIds: ['international_defense-2', 'international_defense-4'],
      title: 'Israël et Gaza, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-intro-01',
          say: 'La guerre à Gaza a suivi l’attaque du Hamas contre Israël, le 7\u00a0octobre 2023. Quelle position la France doit-elle prendre\u202f?',
          spoken: 'La guerre à Gaza a suivi l’attaque du Hamas contre Israël, le sept octobre deux mille vingt-trois. Quelle position la France doit-elle prendre ?',
          visual: 'hook',
          draw: 'Une frise des années au trait\u00a0: un fanion planté au 7\u00a0octobre 2023, une flèche en pointillé qui court jusqu’à aujourd’hui, un point d’interrogation au bout.',
          alt: 'Une frise des années, de 2023 à 2026.',
          emphasis: ['7\u00a0octobre 2023', 'Quelle position'],
        },
        {
          id: 'proche-orient-intro-02',
          say: 'Selon les autorités israéliennes, plus de 1\u202f200\u00a0personnes ont été tuées en Israël ce jour-là et les jours suivants, étrangers compris.',
          spoken: 'Selon les autorités israéliennes, plus de mille deux cents personnes ont été tuées en Israël ce jour-là et les jours suivants, étrangers compris.',
          visual: 'figure',
          draw: 'Le nombre écrit à la main\u202f; dessous, un document au trait, la source du bilan, et son nom.',
          emphasis: ['plus de 1\u202f200\u00a0personnes'],
          figure: { ...TUES_ISRAEL, sourceIndex: 0 },
        },
        {
          id: 'proche-orient-intro-03',
          say: 'Selon le ministère de la Santé de Gaza, 73\u202f922\u00a0Palestiniens ont été tués dans la bande de Gaza. C’est le bilan d’octobre 2023 au 23\u00a0septembre 2026.',
          spoken: 'Selon le ministère de la Santé de Gaza, soixante-treize mille neuf cent vingt-deux Palestiniens ont été tués dans la bande de Gaza. C’est le bilan d’octobre deux mille vingt-trois au vingt-trois septembre deux mille vingt-six.',
          visual: 'figure',
          draw: 'Le nombre écrit à la main\u202f; dessous, un document au trait, la source du bilan, et son nom, comme au passage précédent.',
          emphasis: ['73\u202f922\u00a0Palestiniens'],
          figure: { ...TUES_GAZA, sourceIndex: 0 },
        },
        {
          id: 'proche-orient-intro-04',
          say: 'Le bureau des affaires humanitaires de l’ONU reprend ces deux bilans, chacun attribué à sa source.',
          spoken: 'Le bureau des affaires humanitaires de l’Onu reprend ces deux bilans, chacun attribué à sa source.',
          visual: 'point',
          draw: 'Deux documents au trait, de même taille, chacun avec le nom de sa source\u202f; deux flèches les mènent à un même dossier de l’ONU, marqué d’un globe.',
          alt: 'Deux documents, l’un des autorités israéliennes, l’autre du ministère de la Santé de Gaza, mènent au bureau des affaires humanitaires de l’ONU.',
          emphasis: ['chacun attribué à sa source'],
        },
        {
          id: 'proche-orient-intro-05',
          say: 'Deux juridictions internationales ont été saisies. La Cour internationale de justice juge les États. La Cour pénale internationale poursuit des personnes.',
          visual: 'point',
          draw: 'Deux colonnes au trait, sous une même balance de justice\u00a0: d’un côté un édifice, les États\u202f; de l’autre une silhouette, les personnes.',
          emphasis: ['juge les États', 'poursuit des personnes'],
        },
        {
          id: 'proche-orient-intro-06',
          say: 'L’Union européenne est le premier partenaire commercial d’Israël. Un accord d’association encadre leurs échanges, commerciaux et politiques.',
          visual: 'point',
          draw: 'Deux cadres au trait, l’Union européenne et Israël, reliés par une flèche double où passe une caisse de marchandises\u202f; dessous, un document\u00a0: l’accord.',
          alt: 'Une caisse de marchandises sur la flèche des échanges, et le document de l’accord.',
          emphasis: ['premier partenaire commercial', 'accord d’association'],
        },
        {
          id: 'proche-orient-intro-07',
          say: 'Deux questions se posent à la France. Comment qualifier l’action de l’armée israélienne à Gaza\u202f? Et quels moyens de pression envers le gouvernement israélien\u202f?',
          visual: 'question',
          draw: 'Deux pictogrammes, l’un sous l’autre, chacun avec sa question\u00a0: un livre de droit, puis un cadran de pression.',
          emphasis: ['Comment qualifier', 'quels moyens de pression'],
        },
        {
          id: 'proche-orient-intro-08',
          say: 'Les cinq vidéos qui suivent les regardent de plus près.',
          visual: 'outro',
          draw: 'Le sommaire des cinq vidéos, chacune avec son pictogramme.',
        },
      ],
      sources: [OCHA, CIJ, CPI, COMMERCE, COMMISSION_UE],
    },
    {
      id: 'proche-orient-mots',
      kind: 'deep',
      questionIds: ['international_defense-2'],
      title: 'Les mots du droit international',
      short: 'Les mots du droit',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-mots-01',
          say: 'Génocide, crimes contre l’humanité, crimes de guerre\u00a0: ces mots du droit ne disent pas la même chose. Que veulent-ils dire\u202f?',
          visual: 'hook',
          draw: 'Trois fiches au trait, de même taille, posées côte à côte, chacune titrée d’un des trois mots.',
          emphasis: ['Génocide', 'crimes contre l’humanité', 'crimes de guerre'],
        },
        {
          id: 'proche-orient-mots-02',
          say: 'Le génocide est défini par une convention de 1948. Il réunit deux éléments\u00a0: des actes précis, et une intention.',
          spoken: 'Le génocide est défini par une convention de mille neuf cent quarante-huit. Il réunit deux éléments : des actes précis, et une intention.',
          visual: 'point',
          draw: 'Un document daté de 1948\u202f; deux flèches en descendent vers deux cases réunies par un «\u00a0+\u00a0»\u00a0: les actes, l’intention.',
          emphasis: ['des actes précis', 'une intention'],
        },
        {
          id: 'proche-orient-mots-03',
          say: 'Cinq catégories d’actes\u00a0: meurtres, atteintes graves, conditions de vie imposées pour détruire le groupe, entraves aux naissances, transferts forcés d’enfants.',
          visual: 'point',
          draw: 'Cinq cases numérotées l’une sous l’autre, chacune avec un des actes de la liste écrit à côté, quand la voix le dit.',
          alt: 'Les cinq catégories, numérotées de 1 à 5.',
          emphasis: ['Cinq catégories d’actes'],
        },
        {
          id: 'proche-orient-mots-04',
          say: 'Et l’intention de détruire, en tout ou en partie, un groupe national, ethnique, racial ou religieux.',
          visual: 'point',
          draw: 'Un cercle en pointillé autour d’un groupe de silhouettes\u202f; dessous, les quatre sortes de groupes, écrites l’une après l’autre.',
          emphasis: ['l’intention de détruire'],
        },
        {
          id: 'proche-orient-mots-05',
          say: 'Les crimes contre l’humanité sont commis dans le cadre d’une attaque généralisée ou systématique contre des civils, sans exiger cette intention.',
          visual: 'compare',
          draw: 'Un tableau à trois colonnes, une par mot\u202f; sous le génocide, les cinq actes et l’intention\u202f; sous les crimes contre l’humanité, des civils, et la case de l’intention en pointillé.',
          alt: 'Un tableau\u00a0: les actes, puis l’intention de détruire un groupe, cochée pour le génocide, en pointillé pour les crimes contre l’humanité.',
          emphasis: ['crimes contre l’humanité', 'sans exiger cette intention'],
        },
        {
          id: 'proche-orient-mots-06',
          say: 'Les crimes de guerre sont des violations graves des règles qui s’appliquent dans un conflit armé. Eux non plus n’exigent pas cette intention.',
          visual: 'compare',
          draw: 'Le tableau se complète\u00a0: sous les crimes de guerre, le livre des règles du conflit armé, et la case de l’intention, là encore en pointillé.',
          alt: 'Le même tableau\u00a0: pour les crimes de guerre aussi, l’intention de détruire un groupe est en pointillé.',
          emphasis: ['crimes de guerre', 'violations graves'],
        },
        {
          id: 'proche-orient-mots-07',
          say: 'Le mot choisi engage la France. Alors, doit-elle employer l’un de ces mots, et lequel\u202f?',
          visual: 'question',
          draw: 'Les trois fiches du début, côte à côte, et un point d’interrogation au-dessus.',
          emphasis: ['engage la France', 'lequel'],
        },
      ],
      sources: [DEFINITIONS],
    },
    {
      id: 'proche-orient-justice',
      kind: 'deep',
      questionIds: ['international_defense-2'],
      title: 'Ce qu’examinent les instances internationales',
      short: 'Cours et enquête',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-justice-01',
          say: 'Qui peut dire s’il y a génocide, ou crimes de guerre\u202f? Plusieurs instances internationales se sont penchées sur Gaza. Elles n’ont pas le même rôle.',
          visual: 'hook',
          draw: 'Trois pictogrammes de même taille côte à côte, deux édifices et une loupe, sous un point d’interrogation.',
          emphasis: ['pas le même rôle'],
        },
        {
          id: 'proche-orient-justice-02',
          say: 'La Cour internationale de justice juge les États. Le 29\u00a0décembre 2023, l’Afrique du Sud lui a soumis une requête pour génocide visant Israël.',
          spoken: 'La Cour internationale de justice juge les États. Le vingt-neuf décembre deux mille vingt-trois, l’Afrique du Sud lui a soumis une requête pour génocide visant Israël.',
          visual: 'timeline',
          draw: 'Un document, la requête de l’Afrique du Sud, et une flèche vers l’édifice de la Cour\u202f; au-dessus de la flèche, les mots «\u00a0requête pour génocide\u00a0», dessous «\u00a0visant Israël\u00a0».',
          emphasis: ['juge les États', '29\u00a0décembre 2023'],
        },
        {
          id: 'proche-orient-justice-03',
          say: 'Le 26\u00a0janvier 2024, elle ordonne des mesures d’urgence. Elles ne tranchent pas la question du génocide.',
          spoken: 'Le vingt-six janvier deux mille vingt-quatre, elle ordonne des mesures d’urgence. Elles ne tranchent pas la question du génocide.',
          visual: 'timeline',
          draw: 'Une frise de 2024 à 2026\u202f; un fanion au 26\u00a0janvier 2024, les mesures d’urgence\u202f; au-dessus, la balance de la Cour, ses plateaux à l’horizontale\u00a0: rien n’est tranché.',
          alt: 'Une frise des années 2024, 2025 et 2026.',
          emphasis: ['mesures d’urgence', 'ne tranchent pas'],
        },
        {
          id: 'proche-orient-justice-04',
          say: 'Le 21\u00a0mai 2026, elle fixe les délais d’une nouvelle série d’écrits des deux États. L’examen du fond se poursuit.',
          spoken: 'Le vingt et un mai deux mille vingt-six, elle fixe les délais d’une nouvelle série d’écrits des deux États. L’examen du fond se poursuit.',
          visual: 'timeline',
          draw: 'La même frise\u00a0: un second fanion au 21\u00a0mai 2026, deux piles d’écrits, une par État\u202f; puis une flèche en pointillé, l’examen qui continue.',
          alt: 'La frise des années 2024, 2025 et 2026, et deux piles d’écrits.',
          emphasis: ['21\u00a0mai 2026', 'se poursuit'],
        },
        {
          id: 'proche-orient-justice-05',
          say: 'La Cour pénale internationale, elle, poursuit des personnes. Le 21\u00a0novembre 2024, elle émet des mandats d’arrêt. Deux contre des dirigeants israéliens, un contre le chef de la branche armée du Hamas.',
          spoken: 'La Cour pénale internationale, elle, poursuit des personnes. Le vingt et un novembre deux mille vingt-quatre, elle émet des mandats d’arrêt. Deux contre des dirigeants israéliens, un contre le chef de la branche armée du Hamas.',
          visual: 'point',
          draw: 'Trois silhouettes identiques, sans visage, chacune sous un document de mandat\u00a0: deux d’un côté, une de l’autre, chaque groupe avec son étiquette.',
          emphasis: ['poursuit des personnes', 'mandats d’arrêt'],
        },
        {
          id: 'proche-orient-justice-06',
          say: 'Ces mandats portent sur des crimes de guerre et des crimes contre l’humanité présumés, commis à partir du 7\u00a0octobre 2023.',
          spoken: 'Ces mandats portent sur des crimes de guerre et des crimes contre l’humanité présumés, commis à partir du sept octobre deux mille vingt-trois.',
          visual: 'point',
          draw: 'Les trois mandats en rang\u202f; au-dessus, les deux mots, écrits quand la voix les dit\u202f; dessous, la date.',
          emphasis: ['crimes de guerre', 'crimes contre l’humanité'],
        },
        {
          id: 'proche-orient-justice-07',
          say: 'Le 16\u00a0septembre 2025, une commission d’enquête créée par le Conseil des droits de l’homme de l’ONU conclut à un génocide. Elle réunit des experts\u00a0: ce n’est pas un tribunal.',
          spoken: 'Le seize septembre deux mille vingt-cinq, une commission d’enquête créée par le Conseil des droits de l’homme de l’Onu conclut à un génocide. Elle réunit des experts : ce n’est pas un tribunal.',
          visual: 'point',
          draw: 'Trois silhouettes d’experts autour d’une loupe posée sur un rapport\u202f; à côté, l’édifice d’un tribunal en pointillé.',
          emphasis: ['commission d’enquête', 'pas un tribunal'],
        },
        {
          id: 'proche-orient-justice-08',
          say: 'Selon elle, Israël commettrait à Gaza 4\u00a0des 5\u00a0catégories d’actes de génocide. Israël rejette ce rapport, qu’il juge «\u00a0biaisé et mensonger\u00a0».',
          spoken: 'Selon elle, Israël commettrait à Gaza quatre des cinq catégories d’actes de génocide. Israël rejette ce rapport, qu’il juge « biaisé et mensonger ».',
          visual: 'figure',
          draw: 'Deux moitiés égales\u00a0: à gauche, les cinq cases des actes, dont quatre se comptent, selon la commission\u202f; à droite, le rapport, et la réponse d’Israël entre guillemets.',
          alt: 'À gauche, cinq cases dont quatre comptées, selon la commission\u202f; à droite, le rapport et la réponse d’Israël.',
          emphasis: ['4\u00a0des 5', 'biaisé et mensonger'],
          figure: { ...COMMISSION, sourceIndex: 2 },
        },
        {
          id: 'proche-orient-justice-09',
          say: 'Les instances saisies n’ont pas toutes conclu, et leurs conclusions n’ont pas la même portée. Alors, quelle position pour la France\u202f?',
          visual: 'question',
          draw: 'Les trois pictogrammes du début, en rang, et un point d’interrogation au bout.',
          emphasis: ['pas la même portée', 'quelle position'],
        },
      ],
      sources: [CIJ, CPI, COMMISSION_ONU],
    },
    {
      id: 'proche-orient-accord',
      kind: 'deep',
      questionIds: ['international_defense-4'],
      title: 'L’accord entre l’Union européenne et Israël',
      short: 'Accord UE-Israël',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-accord-01',
          say: 'Entre l’Union européenne et Israël, un accord d’association encadre les échanges commerciaux et politiques. Que prévoit-il, et qui peut le changer\u202f?',
          visual: 'hook',
          draw: 'Deux cadres au trait, l’Union européenne et Israël, reliés par une flèche double où passe une caisse de marchandises\u202f; dessous, le document de l’accord.',
          emphasis: ['accord d’association', 'qui peut le changer'],
        },
        {
          id: 'proche-orient-accord-02',
          say: 'L’Union est le premier partenaire commercial d’Israël\u00a0: 31,7\u00a0% de son commerce de biens en 2025. À l’inverse, Israël représente près de 0,8\u00a0% de celui de l’Union.',
          spoken: 'L’Union est le premier partenaire commercial d’Israël : trente et un virgule sept pour cent de son commerce de biens en deux mille vingt-cinq. À l’inverse, Israël représente près de zéro virgule huit pour cent de celui de l’Union.',
          visual: 'figure',
          draw: 'Deux disques de même taille, chacun tout le commerce de biens d’un des deux\u00a0: dans celui d’Israël, la part de l’Union\u202f; dans celui de l’Union, la part d’Israël.',
          alt: 'Deux disques de même taille\u00a0: le commerce de biens d’Israël, et celui de l’Union européenne, chacun avec la part de l’autre.',
          emphasis: ['31,7\u00a0%', '0,8\u00a0%'],
          figure: { ...PART_UE, sourceIndex: 0 },
          chart: PART_UE_CHART,
        },
        {
          id: 'proche-orient-accord-03',
          say: 'L’accord fait du respect des droits de l’homme un «\u00a0élément essentiel\u00a0», à son article\u00a02. En juin 2025, un réexamen européen a relevé des éléments indiquant qu’Israël violerait cet article.',
          spoken: 'L’accord fait du respect des droits de l’homme un « élément essentiel », à son article deux. En juin deux mille vingt-cinq, un réexamen européen a relevé des éléments indiquant qu’Israël violerait cet article.',
          visual: 'point',
          draw: 'La page de l’accord, une ligne surlignée\u00a0: l’article\u00a02\u202f; en juin 2025, une loupe passe dessus.',
          emphasis: ['élément essentiel', 'violerait cet article'],
        },
        {
          id: 'proche-orient-accord-04',
          say: 'En septembre 2025, la Commission européenne propose de suspendre certaines dispositions commerciales\u00a0: les produits israéliens perdraient leur accès préférentiel au marché européen.',
          spoken: 'En septembre deux mille vingt-cinq, la Commission européenne propose de suspendre certaines dispositions commerciales : les produits israéliens perdraient leur accès préférentiel au marché européen.',
          visual: 'point',
          draw: 'Une caisse de marchandises sur une flèche vers le marché européen\u202f; l’étiquette de l’accès préférentiel passe en pointillé\u00a0: ce n’est qu’une proposition.',
          emphasis: ['accès préférentiel'],
        },
        {
          id: 'proche-orient-accord-05',
          say: 'Elle propose aussi des sanctions\u00a0: contre des ministres et des colons israéliens, et contre des membres du bureau politique du Hamas.',
          visual: 'compare',
          draw: 'Un document de sanctions au milieu\u202f; de chaque côté, deux silhouettes identiques, chacune avec son étiquette.',
          emphasis: ['des sanctions'],
        },
        {
          id: 'proche-orient-accord-06',
          say: 'Deux règles de décision. La mesure commerciale se prend à la majorité qualifiée\u00a0: aucun État ne peut la bloquer seul. Les sanctions exigent l’unanimité des Vingt-Sept.',
          visual: 'compare',
          draw: 'Deux grilles de vingt-sept cases, une voix contre dans chacune\u00a0: à la majorité qualifiée, la décision passe quand même\u202f; à l’unanimité, un trait l’arrête et elle reste en pointillé.',
          alt: 'Deux grilles de vingt-sept cases, une case contre dans chacune\u00a0: la majorité qualifiée passe, l’unanimité est bloquée.',
          emphasis: ['majorité qualifiée', 'l’unanimité'],
        },
        {
          id: 'proche-orient-accord-07',
          say: 'Certains États membres ont proposé de suspendre l’accord, en tout ou en partie. Le 21\u00a0avril 2026, la haute représentante de l’Union pour les affaires étrangères constate que les ministres ne sont pas unanimes.',
          spoken: 'Certains États membres ont proposé de suspendre l’accord, en tout ou en partie. Le vingt et un avril deux mille vingt-six, la haute représentante de l’Union pour les affaires étrangères constate que les ministres ne sont pas unanimes.',
          visual: 'timeline',
          draw: 'Le document de l’accord, un signe «\u00a0pause\u00a0» en pointillé posé dessus\u00a0: la suspension proposée\u202f; à côté, la date et trois silhouettes, les ministres.',
          emphasis: ['suspendre l’accord', 'pas unanimes'],
        },
        {
          id: 'proche-orient-accord-08',
          say: 'Alors, faut-il se servir de cet accord pour faire pression, et si oui, comment\u202f?',
          visual: 'question',
          draw: 'Les deux cadres reliés par l’accord, et un point d’interrogation au-dessus.',
          emphasis: ['se servir de cet accord'],
        },
      ],
      sources: [COMMERCE, COMMISSION_UE, CONSEIL_AVRIL],
    },
    {
      id: 'proche-orient-colonisation',
      kind: 'deep',
      questionIds: ['international_defense-4'],
      title: 'La colonisation en Cisjordanie',
      short: 'Colonisation',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-colonisation-01',
          say: 'En Cisjordanie, des colons israéliens établissent de nouvelles implantations, appelées avant-postes. Que dit le droit international\u202f?',
          visual: 'hook',
          draw: 'Une ligne de collines au trait\u202f; de petites maisons s’y posent une à une.',
          emphasis: ['avant-postes', 'Que dit le droit international'],
        },
        {
          id: 'proche-orient-colonisation-02',
          say: 'En douze mois, jusqu’au 31\u00a0octobre 2025, 84\u00a0nouveaux avant-postes ont été établis. Un nombre «\u00a0sans précédent\u00a0», selon le Haut-Commissariat de l’ONU aux droits de l’homme.',
          spoken: 'En douze mois, jusqu’au trente et un octobre deux mille vingt-cinq, quatre-vingt-quatre nouveaux avant-postes ont été établis. Un nombre « sans précédent », selon le Haut-Commissariat de l’Onu aux droits de l’homme.',
          visual: 'figure',
          draw: 'Quatre-vingt-quatre petites maisons au trait, en rangées, qui se dessinent l’une après l’autre.',
          emphasis: ['84\u00a0nouveaux avant-postes', 'sans précédent'],
          figure: { ...AVANT_POSTES, sourceIndex: 0 },
        },
        {
          id: 'proche-orient-colonisation-03',
          say: 'Le 19\u00a0juillet 2024, la Cour internationale de justice rend un avis consultatif, non contraignant. Elle juge illicite la présence continue d’Israël dans le Territoire palestinien occupé.',
          spoken: 'Le dix-neuf juillet deux mille vingt-quatre, la Cour internationale de justice rend un avis consultatif, non contraignant. Elle juge illicite la présence continue d’Israël dans le Territoire palestinien occupé.',
          visual: 'timeline',
          draw: 'L’édifice de la Cour\u202f; la date au-dessus d’une flèche qui mène à un document\u00a0: l’avis.',
          emphasis: ['avis consultatif', 'non contraignant'],
        },
        {
          id: 'proche-orient-colonisation-04',
          say: 'Selon la Cour, Israël doit cesser toute nouvelle colonisation. Et les États ne doivent ni reconnaître cette situation comme licite, ni aider à la maintenir.',
          visual: 'point',
          draw: 'Deux lignes, chacune un pictogramme et sa phrase\u00a0: une maison en pointillé pour la colonisation à cesser\u202f; un édifice pour les États.',
          emphasis: ['cesser toute nouvelle colonisation', 'ni aider à la maintenir'],
        },
        {
          id: 'proche-orient-colonisation-05',
          say: 'Israël a rejeté cet avis, qu’il juge «\u00a0fondamentalement erroné\u00a0».',
          visual: 'point',
          draw: 'Le document de l’avis, renvoyé par une flèche courbe\u202f; les mots d’Israël entre guillemets.',
          emphasis: ['fondamentalement erroné'],
        },
        {
          id: 'proche-orient-colonisation-06',
          say: 'Le 28\u00a0mai 2026, l’Union européenne sanctionne 4\u00a0entités et 3\u00a0personnes, pour des atteintes aux droits humains en Cisjordanie. Ce sont, selon elle, des colons extrémistes et des organisations qui les soutiennent.',
          spoken: 'Le vingt-huit mai deux mille vingt-six, l’Union européenne sanctionne quatre entités et trois personnes, pour des atteintes aux droits humains en Cisjordanie. Ce sont, selon elle, des colons extrémistes et des organisations qui les soutiennent.',
          visual: 'figure',
          draw: 'Quatre bâtiments et trois silhouettes au trait, en rang, qui se comptent.',
          emphasis: ['4\u00a0entités et 3\u00a0personnes'],
          figure: { ...SANCTIONS, sourceIndex: 2 },
        },
        {
          id: 'proche-orient-colonisation-07',
          say: 'Alors, quelles mesures, s’il en faut, et visant qui\u00a0: le pays, ses dirigeants, ou les acteurs de la colonisation\u202f?',
          visual: 'question',
          draw: 'Trois pictogrammes de même taille, chacun avec son nom\u00a0: un édifice pour le pays, une silhouette pour ses dirigeants, une maison pour les acteurs de la colonisation.',
          emphasis: ['visant qui'],
        },
      ],
      sources: [HCDH, AVIS_CIJ, COLONS],
    },
    {
      id: 'proche-orient-onu',
      kind: 'deep',
      questionIds: ['international_defense-4'],
      title: 'Le Conseil de sécurité de l’ONU',
      short: 'Conseil de sécurité',
      register: 'vous',
      segments: [
        {
          id: 'proche-orient-onu-01',
          say: 'À l’ONU, le Conseil de sécurité adopte des résolutions, par un vote. Mais toutes les voix n’y ont pas le même poids.',
          spoken: 'À l’Onu, le Conseil de sécurité adopte des résolutions, par un vote. Mais toutes les voix n’y ont pas le même poids.',
          visual: 'hook',
          draw: 'Les sièges du Conseil en fer à cheval, vus de haut, une résolution au milieu\u202f; cinq sièges, tracés plus fort, se comptent.',
          alt: 'Quinze sièges, dont cinq tracés plus fort.',
          emphasis: ['pas le même poids'],
        },
        {
          id: 'proche-orient-onu-02',
          say: 'Cinq de ses membres sont permanents. L’opposition d’un seul d’entre eux suffit à bloquer une résolution\u00a0: c’est le veto.',
          visual: 'point',
          draw: 'Les cinq sièges permanents se comptent\u202f; l’un d’eux se barre d’une croix, et la résolution passe en pointillé.',
          emphasis: ['Cinq', 'un seul', 'le veto'],
        },
        {
          id: 'proche-orient-onu-03',
          say: 'Le 18\u00a0septembre 2025, le Conseil vote sur un projet de résolution. Le texte exige un cessez-le-feu immédiat à Gaza.',
          spoken: 'Le dix-huit septembre deux mille vingt-cinq, le Conseil vote sur un projet de résolution. Le texte exige un cessez-le-feu immédiat à Gaza.',
          visual: 'timeline',
          draw: 'Au milieu des sièges, un document, le projet de résolution, la date écrite au-dessus.',
          emphasis: ['18\u00a0septembre 2025', 'cessez-le-feu immédiat'],
        },
        {
          id: 'proche-orient-onu-04',
          say: 'Il recueille 14\u00a0voix contre 1. Mais il est rejeté\u00a0: le vote contre vient d’un membre permanent, les États-Unis.',
          spoken: 'Il recueille quatorze voix contre une. Mais il est rejeté : le vote contre vient d’un membre permanent, les États-Unis.',
          visual: 'figure',
          draw: 'Les quinze sièges\u00a0: quatorze teintés, un siège permanent barré d’une croix\u202f; le texte en pointillé.',
          alt: 'Quinze sièges, quatorze pour, un contre, celui d’un membre permanent.',
          emphasis: ['14\u00a0voix contre 1', 'rejeté'],
          figure: { ...VOTE, sourceIndex: 0 },
        },
        {
          id: 'proche-orient-onu-05',
          say: 'Chaque outil a sa règle. Dans l’Union européenne, la majorité qualifiée ou l’unanimité des Vingt-Sept. À l’ONU, l’absence de veto d’un membre permanent.',
          spoken: 'Chaque outil a sa règle. Dans l’Union européenne, la majorité qualifiée ou l’unanimité des Vingt-Sept. À l’Onu, l’absence de veto d’un membre permanent.',
          visual: 'compare',
          draw: 'Deux colonnes égales\u00a0: la grille des vingt-sept voix européennes, avec ses deux règles\u202f; les cinq sièges permanents de l’ONU, avec la sienne.',
          alt: 'À gauche, l’Union européenne et ses vingt-sept cases\u202f; à droite, l’ONU et ses cinq sièges permanents.',
          emphasis: ['majorité qualifiée', 'l’unanimité', 'absence de veto'],
        },
        {
          id: 'proche-orient-onu-06',
          say: 'Alors, quelle place donner au Conseil de sécurité parmi ces outils\u202f?',
          visual: 'question',
          draw: 'Les sièges du Conseil, et un point d’interrogation au milieu.',
          emphasis: ['quelle place'],
        },
      ],
      sources: [CONSEIL_SECURITE, COMMISSION_UE],
    },
  ],
}
