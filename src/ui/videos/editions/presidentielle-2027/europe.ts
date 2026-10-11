// Édition « présidentielle 2027 » de la série « Europe » (src/ui/videos/series/europe.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/europe.json).
// Datée : budget 2028-2034 proposé par la Commission le 16 juillet 2025, en négociation ; convention de révision
// des traités demandée en 2022, non convoquée (fiche du Parlement européen d'avril 2026) ; règles sur les fusions
// en réexamen en 2026 ; parts de l'offre de marché (électricité, CRE) et des trains attribués après appel
// d'offres (ART) en juin 2026. À revoir après l'adoption du budget 2028-2034 et la fin du réexamen des fusions.
// Avant le premier tour du 18 avril 2027 : déficit et dette de 2025 (Insee, mai 2026), à remplacer par ceux de
// 2026, que l'Insee publiera fin mars 2027 ; nombre d'États au-dessus des valeurs de référence et moyennes de l'UE
// (Eurostat, avril 2026), à mettre à jour avec la notification d'octobre 2026 ; solde net de 2024 et rabais de
// 2025 (Sénat, rapport sur le PLF 2026), à mettre à jour avec son rapport sur le PLF 2027 (vers fin novembre 2026).
// Les questions des vidéos restent celles que donne le périmètre (europe-1, europe-2, europe-3 : mêmes
// identifiants dans les deux élections) ; aucune correction ne les change.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const CONSEIL: VideoSource = {
  title: 'Le Conseil de l’Union européenne – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/24/le-conseil-de-l-union-europeenne',
  publisher: 'Parlement européen',
  date: '2026-09',
}

const LISBONNE: VideoSource = {
  title: 'Le traité de Lisbonne – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/5/le-traite-de-lisbonne',
  publisher: 'Parlement européen',
  date: '2026-04',
}

const EUROSTAT: VideoSource = {
  title: 'Population au 1er janvier (tps00001)',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/tps00001/default/table?lang=fr',
  publisher: 'Eurostat',
  date: '2026-09-30',
}

const CFP: VideoSource = {
  title: 'Cadre financier pluriannuel – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/29/cadre-financier-pluriannuel',
  publisher: 'Parlement européen',
  date: '2025-11',
}

const REGLES_BUDGET: VideoSource = {
  title: 'Le cadre de l’Union européenne pour les politiques budgétaires – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/89/le-cadre-de-l-union-europeenne-pour-les-politiques-budgetaires',
  publisher: 'Parlement européen',
  date: '2026-04',
}

const SENAT: VideoSource = {
  title: 'Projet de loi de finances pour 2026 : Affaires européennes – Rapport général n° 139 (2025-2026), tome II, fascicule 2',
  url: 'https://www.senat.fr/rap/l25-139-22/l25-139-22_mono.html',
  publisher: 'Sénat, commission des finances',
  date: '2025-11-24',
}

const INSEE: VideoSource = {
  title: 'Le compte des administrations publiques en 2025 – Insee Première n° 2106',
  url: 'https://www.insee.fr/fr/statistiques/8997691',
  publisher: 'Insee',
  date: '2026-05-29',
}

const CONCURRENCE: VideoSource = {
  title: 'Politique de concurrence – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/82/politique-de-concurrence',
  publisher: 'Parlement européen',
  date: '2026-04',
}

/* ——— Les sources ajoutées par la relecture ——— */

const MARCHE_INTERIEUR: VideoSource = {
  title: 'Le marché intérieur : principes généraux – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/33/le-marche-interieur-principes-generaux',
  publisher: 'Parlement européen',
  date: '2026-03',
}

const EUROSTAT_2025: VideoSource = {
  title: 'Euro area government deficit at 2.9% and EU at 3.1% of GDP',
  url: 'https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-22042026-ap',
  publisher: 'Eurostat',
  date: '2026-04-22',
}

/* ——— Les chiffres des fiches de la présidentielle, repris tels quels ——— */

/** Fiche europe-2, figures[1] : libellé précisé (« selon la méthode comptable »), sans la phrase sur les rabais */
const SOLDE = {
  value: '−7,9 Md€',
  label: 'Solde net de la France avec le budget européen, selon la méthode comptable (versements moins dépenses de l’UE en France) : deuxième contributeur net, derrière l’Allemagne. Avec 16,5 Md€ reçus hors plan de relance, dont 58 % au titre de la politique agricole commune, elle est aussi le premier bénéficiaire en volume, mais 22e par habitant',
  date: '2024',
}

/** Fiche europe-2, figures[2] (Eurostat) et son graphique (explainer-charts.json, europe-2, index 2) */
const DEFICITS_UE = {
  value: '11 sur 27',
  label: 'États de l’UE dont le déficit public atteint ou dépasse 3 % du PIB. Les plus forts déficits sont ceux de la Roumanie (−7,9 %), de la Pologne (−7,3 %), de la Belgique (−5,2 %) et de la France (−5,1 %). Douze États ont une dette publique de plus de 60 % du PIB. Pour l’ensemble de l’UE, le déficit est de 3,1 % du PIB et la dette de 81,7 % (zone euro : 2,9 % et 87,8 %)',
  date: '2025 (données publiées le 22 avril 2026)',
}
const DEFICITS_UE_CHART = { kind: 'part', value: 11, total: 27, whole: 'États de l’UE' }

export const EUROPE: SeriesPatch = {
  videos: {
    'europe-intro': {
      sources: [EUROSTAT, CONSEIL, CFP, SENAT, CONCURRENCE, MARCHE_INTERIEUR],
      segments: {
        // europe-13, europe-17 : libellé du solde net précisé ; le dessin désigne l'écart d'un crochet
        'europe-intro-05': {
          draw: 'Deux flèches de sens contraire entre la France et le budget européen : ce qu’elle reçoit, ce qu’elle verse ; chacune avec sa légende, et un crochet qui désigne ce qu’elle verse en plus.',
          alt: 'Deux flèches entre la France et le budget européen, une dans chaque sens ; un crochet désigne ce qu’elle verse en plus.',
          figure: { ...SOLDE, sourceIndex: 3 },
        },
        // europe-20 : le marché unique décrit aussi par la libre circulation
        'europe-intro-06': {
          say: 'Le marché unique a aussi ses règles. Il repose sur la libre circulation des marchandises, des personnes, des services et des capitaux. L’Union y contrôle les ententes, les fusions et les aides publiques aux entreprises, et elle a ouvert à la concurrence d’anciens monopoles publics.',
          draw: 'Quatre petites flèches franchissent une frontière en pointillé : un colis, une personne, une mallette, des pièces ; puis deux immeubles d’entreprises qui se rapprochent, une loupe au-dessus ; à côté, un compteur et un train, d’anciens monopoles.',
          emphasis: ['libre circulation', 'contrôle', 'ouvert à la concurrence'],
        },
        // europe-22 : la cinquième question, celle de cette élection
        'europe-intro-07': {
          say: 'Alors, cinq questions se posent. Comment décider à 27 ? Quelle direction pour la construction européenne ? Qui finance le budget européen ? Quelles règles pour les budgets des États ? Et comment faire évoluer le marché unique ?',
          spoken: 'Alors, cinq questions se posent. Comment décider à vingt-sept ? Quelle direction pour la construction européenne ? Qui finance le budget européen ? Quelles règles pour les budgets des États ? Et comment faire évoluer le marché unique ?',
          emphasis: ['Comment décider', 'Qui finance', 'le marché unique'],
        },
      },
    },
    'europe-decider': {
      // europe-7 : RECETTES n'est plus citée dans cette vidéo
      sources: [CONSEIL, LISBONNE],
      segments: {
        // europe-7 : la politique étrangère et la fiscalité parmi les exemples d'unanimité
        'europe-decider-03': {
          say: 'Mais dans quelques domaines, il faut l’unanimité. Par exemple : la politique étrangère, la fiscalité, le budget sur sept ans, l’entrée de nouveaux pays, la révision des traités.',
          draw: 'Cinq pictogrammes en grille, chacun avec sa légende : un globe pour la politique étrangère, un billet pour la fiscalité, des pièces pour le budget, une porte pour l’entrée de nouveaux pays, un texte pour les traités.',
        },
      },
    },
    'europe-traites': {
      segments: {
        // europe-5 : un État peut aussi quitter l'Union
        'europe-traites-02': {
          say: 'Pour réviser un traité, il faut l’accord de tous les États. Puis chacun doit le ratifier, par son Parlement ou par référendum. Un État peut aussi quitter l’Union, avec une période de négociation de deux ans, prolongeable.',
          draw: '27 cases toutes colorées mènent à un texte ; de là, deux chemins : un édifice à colonnes, ou une urne. À part, une case quitte la rangée, au bout d’une frise de deux ans prolongée en pointillé.',
          alt: '27 cases, une par État, toutes d’accord ; puis un Parlement ou une urne. À part, une case quitte la rangée, avec une période de négociation de deux ans, prolongeable.',
          emphasis: ['tous les États', 'référendum', 'quitter l’Union'],
        },
        // europe-6 : les « non » de 2005 et la ratification parlementaire en France, avant le cas irlandais
        'europe-traites-05': {
          say: 'En 2005, la France et les Pays-Bas ont rejeté par référendum un projet de Constitution européenne. Puis le traité de Lisbonne, presque identique selon le Parlement européen, y a été ratifié par la voie parlementaire, et en Irlande par un second référendum.',
          spoken: 'En deux mille cinq, la France et les Pays-Bas ont rejeté par référendum un projet de Constitution européenne. Puis le traité de Lisbonne, presque identique selon le Parlement européen, y a été ratifié par la voie parlementaire, et en Irlande par un second référendum.',
          draw: 'Une frise : au jalon 2005, deux urnes et leur « non » ; puis le texte du traité de Lisbonne, d’où partent deux chemins : pour la France, un édifice à colonnes ; pour l’Irlande, une urne et son « non », puis une seconde urne avec sa coche.',
          alt: 'Une frise : les deux « non » de 2005, puis le traité de Lisbonne, ratifié en France par le Parlement, et en Irlande par un second référendum, après un premier « non ».',
          emphasis: ['rejeté par référendum', 'la voie parlementaire', 'second référendum'],
        },
      },
    },
    'europe-budget': {
      segments: {
        // europe-13, europe-16 : libellé du solde net précisé ; le dessin désigne l'écart d'un crochet
        'europe-budget-07': {
          draw: 'Deux flèches de sens contraire entre la France et le budget européen : ce qu’elle verse, ce qu’elle reçoit ; au bout de la première, un crochet désigne ce qu’elle verse en plus.',
          alt: 'Deux flèches entre la France et le budget européen : sa contribution, et ce qu’elle a reçu ; un crochet désigne ce qu’elle verse en plus.',
          figure: { ...SOLDE, sourceIndex: 1 },
        },
        // europe-11 : les rabais ne sont plus un chiffre de la fiche, mais une phrase du libellé du solde net
        'europe-budget-08': {
          visual: 'point',
          figure: undefined,
        },
      },
    },
    'europe-deficits': {
      sources: [REGLES_BUDGET, INSEE, EUROSTAT_2025],
      segments: {
        // europe-10 : la France et les autres États au-dessus des valeurs de référence
        'europe-deficits-05': {
          say: 'Sa dette publique atteint 115,7 % du PIB fin 2025, pour une valeur de référence de 60 %. Dans l’Union, onze États ont un déficit d’au moins 3 %, et douze une dette de plus de 60 %.',
          spoken: 'Sa dette publique atteint cent quinze virgule sept pour cent du P.I.B. fin deux mille vingt-cinq, pour une valeur de référence de soixante pour cent. Dans l’Union, onze États ont un déficit d’au moins trois pour cent, et douze une dette de plus de soixante pour cent.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro : la valeur de référence et la dette de la France ; puis deux rangées de 27 cases, une par État : onze se colorent pour le déficit, douze pour la dette.',
          alt: 'Deux barres à la même échelle : la valeur de référence, 60 %, et la France, 115,7 %. Puis deux rangées de 27 cases : 11 pour le déficit, 12 pour la dette.',
          emphasis: ['115,7 %', 'onze États', 'douze'],
          figure: { ...DEFICITS_UE, sourceIndex: 2 },
          chart: DEFICITS_UE_CHART,
        },
      },
    },
    'europe-concurrence': {
      segments: {
        // europe-21 : la question de fin, celle de cette élection
        'europe-concurrence-08': {
          say: 'Les règles sur les fusions sont réexaminées en 2026. Alors, comment faire évoluer les règles du marché unique ?',
          spoken: 'Les règles sur les fusions sont réexaminées en deux mille vingt-six. Alors, comment faire évoluer les règles du marché unique ?',
          emphasis: ['réexaminées', 'faire évoluer'],
        },
      },
    },
  },
}
