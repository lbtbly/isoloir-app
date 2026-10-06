// Série « Agriculture et alimentation » (famille « Écologie et territoires ») : l'introduction, puis cinq
// approfondissements (revenu des agriculteurs, partage des prix de la ferme au magasin, aides européennes,
// produits importés, accès à l'alimentation). Matière : les fiches du thème (research/choisir-2027/
// explainers.json, agriculture-1 et agriculture-x1), le contexte de leurs questions (bank.json) et leurs
// graphiques, rien d'autre. Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/agriculture.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : la PAC de 2028-2034 est en négociation (proposition de la Commission européenne de juillet 2025) ;
// l'accord commercial entre l'Union européenne et le Mercosur s'applique à titre provisoire depuis le 1er mai
// 2026 (fiche de la Représentation de la Commission en France, avril 2026). À revoir si la négociation aboutit
// ou si le statut de l'accord change.

import type { VideoSeries } from '../types'

/* ——— Les sources, copiées des fiches ——— */

const AGRESTE = {
  title: 'Enquête sur la structure des exploitations agricoles en 2023 – L’agrandissement des exploitations se poursuit depuis 2020 (Agreste Primeur n° 2, version révisée)',
  url: 'https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/Pri2502/Primeur2025-2_ESEA-2023_v2.pdf',
  publisher: 'Agreste, ministère de l’Agriculture',
  date: '2025-06',
}

const INSEE_PAUVRETE = {
  title: 'Les exploitants agricoles vivent plus souvent sous le seuil de pauvreté que l’ensemble de la population (Emploi et revenus des indépendants, édition 2025)',
  url: 'https://www.insee.fr/fr/statistiques/8376591?sommaire=8376600',
  publisher: 'Insee',
  date: '2025-05-21',
}

const DOUANES = {
  title: 'Le chiffre du commerce extérieur – Analyse annuelle 2025',
  url: 'https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf',
  publisher: 'Direction générale des douanes et droits indirects',
  date: '2026-02-06',
}

const INSEE_PRIVATION = {
  title: 'Privation matérielle et sociale en 2025 – Insee Focus n° 380',
  url: 'https://www.insee.fr/fr/statistiques/8967255',
  publisher: 'Insee',
  date: '2026-04-15',
}

const PSN = {
  title: 'CAP Strategic Plan 2023-2027\u00a0: key facts & figures – France',
  url: 'https://eu-cap-network.ec.europa.eu/sites/default/files/publications/2024-10/eu-cap-network-csp-summary-france.pdf',
  publisher: 'Commission européenne (EU CAP Network)',
  date: '2024-09',
}

const INSEE_COMPTE = {
  title: 'Le compte provisoire de l’agriculture en 2025 – Les prix et les volumes rebondissent après la chute de 2024 (Insee Première n° 2116)',
  url: 'https://www.insee.fr/fr/statistiques/9018334?sommaire=9019233',
  publisher: 'Insee',
  date: '2026-07-07',
}

const OFPM_VALEUR = {
  title: 'Rapport au Parlement 2026 de l’Observatoire de la formation des prix et des marges des produits alimentaires (chapitre 2, schémas 6 et 7)',
  url: 'https://observatoire-prixmarges.franceagrimer.fr/sites/default/files/PDF/2026_rapport_ofpm_v2.pdf',
  publisher: 'Observatoire de la formation des prix et des marges des produits alimentaires (FranceAgriMer)',
  date: '2026',
}

const OFPM_MARGES = {
  title: 'Rapport au Parlement 2026 de l’Observatoire de la formation des prix et des marges des produits alimentaires (section 11, tableau 32)',
  url: 'https://observatoire-prixmarges.franceagrimer.fr/sites/default/files/PDF/2026_rapport_ofpm_v2.pdf',
  publisher: 'Observatoire de la formation des prix et des marges des produits alimentaires (FranceAgriMer)',
  date: '2026',
}

const EGALIM = {
  title: 'Tout comprendre de la loi EGalim\u00a02',
  url: 'https://agriculture.gouv.fr/tout-comprendre-de-la-loi-egalim-2',
  publisher: 'Ministère de l’Agriculture',
  date: '2023-04-13',
}

const PAC_OISE = {
  title: 'La Politique agricole commune (PAC) 2023-2027 – présentation',
  url: 'https://www.oise.gouv.fr/contenu/telechargement/76510/560311/file/Pr%C3%A9sentation%20Nouvelle%20PAC2023-2027.pdf',
  publisher: 'Préfecture de l’Oise (direction départementale des territoires)',
  date: '2023-01-25',
}

const PAC_2028 = {
  title: 'Questions and answers on the CAP post-2027 proposal',
  url: 'https://agriculture.ec.europa.eu/media/news/questions-and-answers-cap-post-2027-proposal-2025-07-23_en',
  publisher: 'Commission européenne (DG Agriculture et développement rural)',
  date: '2025-07-23',
}

const MERCOSUR = {
  title: 'Accord commercial UE - Mercosur\u00a0: distinguer le vrai du faux',
  url: 'https://france.representation.ec.europa.eu/informations/accord-commercial-ue-mercosur-distinguer-le-vrai-du-faux-2026-04-27_fr',
  publisher: 'Représentation de la Commission européenne en France',
  date: '2026-04-27',
}

const ORIGINE = {
  title: 'Origin labelling',
  url: 'https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/origin-labelling_en',
  publisher: 'Commission européenne (DG Santé et sécurité alimentaire)',
}

const TVA = {
  title: 'TVA – Liquidation – Taux réduits – Produits destinés à l’alimentation humaine (BOI-TVA-LIQ-30-10-10, version en vigueur depuis le 19/11/2025)',
  url: 'https://bofip.impots.gouv.fr/bofip/2033-PGP.html/identifiant=BOI-TVA-LIQ-30-10-10-20251119',
  publisher: 'Direction générale des finances publiques (BOFiP-Impôts)',
  date: '2025-11-19',
}

/* ——— Les chiffres des fiches, et leurs graphiques (explainer-charts.json) ——— */

const FIG_TERRES = {
  value: 'Un tiers',
  label: 'Part des terres agricoles exploitées par les fermes de 200\u00a0hectares ou plus en 2023, qui représentent une exploitation sur dix (France métropolitaine, hors micro-exploitations). Surface moyenne des fermes\u00a0: 93\u00a0hectares, contre 76 en 2010',
  date: '2023',
}

const FIG_PAUVRETE = {
  value: '17,7\u00a0%',
  label: 'Part des exploitants agricoles vivant sous le seuil de pauvreté en 2020, contre 14,4\u00a0% dans l’ensemble de la population (France métropolitaine). Leur niveau de vie moyen (27\u202f500\u00a0€) est le même, mais plus dispersé\u00a0: 31\u202f300\u00a0€ en moyenne dans les cultures, 23\u202f300\u00a0€ dans l’élevage',
  date: '2020',
}
const CHART_PAUVRETE = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Exploitants agricoles', value: 17.7 },
    { label: 'Ensemble de la population', value: 14.4 },
  ],
}

const FIG_COMMERCE = {
  value: '200\u00a0M€',
  label: 'Excédent commercial agricole et agroalimentaire de la France en 2025, en baisse de 5\u00a0Md€ sur un an, au plus bas depuis au moins 2000. Exportations\u00a0: 19,3\u00a0Md€ de produits agricoles et 65\u00a0Md€ de produits des industries agroalimentaires',
  date: '2025',
}

const FIG_PRIVATION = {
  value: '11,2\u00a0%',
  label: 'Personnes ne pouvant s’offrir viande, poisson ou équivalent végétarien tous les deux jours (part des personnes, faute de moyens, début 2025, France hors Mayotte\u202f; 7,3\u00a0% en 2020)',
  date: 'début 2025',
}
const CHART_PRIVATION = {
  kind: 'series',
  unit: '%',
  items: [
    { label: '2020', value: 7.3 },
    { label: 'Début 2025', value: 11.2 },
  ],
}

const FIG_PAC = {
  value: '34,2\u00a0Md€',
  label: 'Paiements directs de la PAC prévus pour la France sur 2023-2027, sur 45,5\u00a0Md€ d’aides européennes au total. Dont 16,5\u00a0Md€ d’aide de base au revenu, 8,6\u00a0Md€ d’écorégime (paiement lié à des pratiques favorables au climat et à l’environnement), 5,1\u00a0Md€ d’aides liées à certaines productions, 3,4\u00a0Md€ d’aide redistributive en faveur des fermes plus petites et 0,6\u00a0Md€ pour les jeunes agriculteurs (première version approuvée du plan stratégique national, 2022)',
  date: '2023-2027',
}
const CHART_PAC = { kind: 'part', value: 34.2, total: 45.5, unit: 'Md€', whole: 'des aides européennes 2023-2027' }

const FIG_VALEUR_AJOUTEE = {
  value: '+10,4\u00a0%',
  label: 'Évolution en 2025 de la valeur ajoutée agricole par emploi, en termes réels, après −12,0\u00a0% en 2024 (estimation provisoire)',
  date: '2025',
}
const CHART_VALEUR_AJOUTEE = {
  kind: 'series',
  unit: '%',
  items: [
    { label: '2024', value: -12 },
    { label: '2025', value: 10.4 },
  ],
}

export const AGRICULTURE: VideoSeries = {
  topicId: 'agriculture',
  familyId: 'ecologie',
  label: 'Agriculture et alimentation',
  videos: [
    {
      id: 'agriculture-intro',
      kind: 'intro',
      questionIds: ['agriculture-1', 'agriculture-x1'],
      title: 'Agriculture et alimentation, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-intro-01',
          say: 'Votre pain, votre lait, vos légumes viennent d’une ferme, ici ou ailleurs. Et ceux qui les produisent, comment en vivent-ils\u202f?',
          visual: 'hook',
          draw: 'Une grange au trait, une personne devant, un point d’interrogation au-dessus d’elle\u202f; une flèche en pointillé mène à un panier de courses, où arrive aussi un cargo.',
          emphasis: ['ici ou ailleurs', 'comment en vivent-ils'],
        },
        {
          id: 'agriculture-intro-02',
          say: 'Les fermes sont de moins en moins nombreuses, et de plus en plus grandes. En 2023, en métropole et hors micro-exploitations, une sur dix fait 200\u00a0hectares ou plus\u00a0: ensemble, elles exploitent un tiers des terres agricoles.',
          spoken: 'Les fermes sont de moins en moins nombreuses, et de plus en plus grandes. En deux mille vingt-trois, en métropole et hors micro-exploitations, une sur dix fait deux cents hectares ou plus : ensemble, elles exploitent un tiers des terres agricoles.',
          visual: 'figure',
          draw: 'Dix granges sur deux rangs, dont une au bleu bille\u202f; dessous, une bande de terres coupée en trois parts égales, dont une au bleu bille.',
          alt: 'Dix fermes, dont une de 200\u00a0hectares ou plus\u202f; une bande des terres agricoles en trois parts égales.',
          emphasis: ['une sur dix', 'un tiers'],
          figure: { ...FIG_TERRES, sourceIndex: 0 },
        },
        {
          id: 'agriculture-intro-03',
          say: 'Côté revenus, en 2020 et en métropole, 17,7\u00a0% des exploitants agricoles vivaient sous le seuil de pauvreté. Contre 14,4\u00a0% de l’ensemble de la population.',
          spoken: 'Côté revenus, en deux mille vingt et en métropole, dix-sept virgule sept pour cent des exploitants agricoles vivaient sous le seuil de pauvreté. Contre quatorze virgule quatre pour cent de l’ensemble de la population.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les exploitants agricoles au bleu bille, l’ensemble de la population à l’encre.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: les exploitants agricoles, l’ensemble de la population.',
          emphasis: ['17,7\u00a0%', '14,4\u00a0%'],
          figure: { ...FIG_PAUVRETE, sourceIndex: 1 },
          chart: CHART_PAUVRETE,
        },
        {
          id: 'agriculture-intro-04',
          say: 'En 2025, la France a importé presque autant de produits agricoles et alimentaires qu’elle en a exporté. L’écart en sa faveur, 200\u00a0millions d’euros, est le plus bas depuis au moins 2000.',
          spoken: 'En deux mille vingt-cinq, la France a importé presque autant de produits agricoles et alimentaires qu’elle en a exporté. L’écart en sa faveur, deux cents millions d’euros, est le plus bas depuis au moins deux mille.',
          visual: 'figure',
          draw: 'Deux colonnes presque égales, exportations et importations\u202f; l’écart, trop fin pour se voir à l’échelle, est montré d’une flèche.',
          alt: 'Deux colonnes presque égales, les exportations et les importations\u00a0: l’écart, trop fin pour se voir à l’échelle, est montré du doigt.',
          emphasis: ['presque autant', '200\u00a0millions d’euros'],
          figure: { ...FIG_COMMERCE, sourceIndex: 2 },
        },
        {
          id: 'agriculture-intro-05',
          say: 'Côté assiette\u00a0: de la viande, du poisson ou un équivalent végétarien tous les deux jours\u202f? Début 2025, 11,2\u00a0% des personnes n’en avaient pas les moyens.',
          spoken: 'Côté assiette : de la viande, du poisson ou un équivalent végétarien tous les deux jours ? Début deux mille vingt-cinq, onze virgule deux pour cent des personnes n’en avaient pas les moyens.',
          visual: 'figure',
          draw: 'Une rangée de jours\u00a0: une assiette au trait un jour sur deux.',
          alt: 'Une rangée de jours, une assiette un jour sur deux.',
          emphasis: ['11,2\u00a0%', 'tous les deux jours'],
          figure: { ...FIG_PRIVATION, sourceIndex: 3 },
          chart: CHART_PRIVATION,
        },
        {
          id: 'agriculture-intro-06',
          say: 'La politique agricole commune européenne, la PAC, prévoit 34,2\u00a0milliards d’euros de paiements directs en France, de 2023 à 2027. Ses aides sont en grande partie versées selon la surface exploitée.',
          spoken: 'La politique agricole commune européenne, la Pac, prévoit trente-quatre virgule deux milliards d’euros de paiements directs en France, de deux mille vingt-trois à deux mille vingt-sept. Ses aides sont en grande partie versées selon la surface exploitée.',
          visual: 'figure',
          draw: 'Un champ découpé en parcelles égales\u202f; quand la voix dit «\u00a0surface\u00a0», une pièce se pose sur chaque parcelle.',
          emphasis: ['34,2\u00a0milliards', 'la surface exploitée'],
          figure: { ...FIG_PAC, sourceIndex: 4 },
          chart: CHART_PAC,
        },
        {
          id: 'agriculture-intro-07',
          say: 'Alors, deux questions se posent. Comment améliorer le revenu des agriculteurs\u202f? Et quel levier privilégier pour soutenir l’agriculture et l’alimentation\u202f?',
          visual: 'question',
          draw: 'Deux pictogrammes, chacun avec sa question, dessinés l’un après l’autre\u00a0: un porte-monnaie, puis des collines.',
          emphasis: ['le revenu', 'quel levier'],
        },
        {
          id: 'agriculture-intro-08',
          say: 'Dans les vidéos suivantes, on regarde chacun de ces sujets de plus près.',
          visual: 'outro',
          draw: 'Le sommaire de la série\u00a0: les cinq vidéos qui suivent, chacune avec son pictogramme.',
        },
      ],
      sources: [AGRESTE, INSEE_PAUVRETE, DOUANES, INSEE_PRIVATION, PSN],
    },
    {
      id: 'agriculture-revenu',
      kind: 'deep',
      questionIds: ['agriculture-x1'],
      title: 'Le revenu du travail agricole',
      short: 'Revenu',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-revenu-01',
          say: 'Des prix qui montent ou qui baissent, des récoltes plus ou moins bonnes\u00a0: d’une année à l’autre, ce que gagne une ferme peut beaucoup changer.',
          visual: 'hook',
          draw: 'Une étiquette de prix et un épi de blé\u202f; dessous, une ligne en dents de scie au fil des années.',
          emphasis: ['peut beaucoup changer'],
        },
        {
          id: 'agriculture-revenu-02',
          say: 'Pour suivre ces variations, l’Insee mesure la valeur ajoutée par emploi. En simplifiant\u00a0: ce que produit l’agriculture, moins ce qu’elle achète pour produire, plus les aides qu’elle reçoit, divisé par le nombre d’emplois.',
          visual: 'point',
          draw: 'Une opération posée à la main\u00a0: une grange et ce qu’elle produit, moins un sac de ce qu’elle achète, plus des pièces pour les aides qu’elle reçoit, le tout divisé par des personnes.',
          emphasis: ['la valeur ajoutée par emploi'],
        },
        {
          id: 'agriculture-revenu-03',
          say: 'Hors inflation, elle a baissé de 12\u00a0% en 2024. Puis elle a augmenté de 10,4\u00a0% en 2025, selon une première estimation.',
          spoken: 'Hors inflation, elle a baissé de douze pour cent en deux mille vingt-quatre. Puis elle a augmenté de dix virgule quatre pour cent en deux mille vingt-cinq, selon une première estimation.',
          visual: 'figure',
          draw: 'Une ligne de zéro\u00a0: une barre qui descend en 2024, une barre qui monte en 2025, à la même échelle.',
          alt: 'Deux barres à la même échelle, depuis la ligne de zéro\u00a0: vers le bas en 2024, vers le haut en 2025.',
          emphasis: ['12\u00a0%', '10,4\u00a0%'],
          figure: { ...FIG_VALEUR_AJOUTEE, sourceIndex: 0 },
          chart: CHART_VALEUR_AJOUTEE,
        },
        {
          id: 'agriculture-revenu-04',
          say: 'En 2020 et en métropole, 17,7\u00a0% des exploitants agricoles vivaient sous le seuil de pauvreté. C’est plus que dans l’ensemble de la population\u00a0: 14,4\u00a0%.',
          spoken: 'En deux mille vingt et en métropole, dix-sept virgule sept pour cent des exploitants agricoles vivaient sous le seuil de pauvreté. C’est plus que dans l’ensemble de la population : quatorze virgule quatre pour cent.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: les exploitants agricoles au bleu bille, l’ensemble de la population à l’encre.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: les exploitants agricoles, l’ensemble de la population.',
          emphasis: ['17,7\u00a0%', '14,4\u00a0%'],
          figure: { ...FIG_PAUVRETE, sourceIndex: 1 },
          chart: CHART_PAUVRETE,
        },
        {
          id: 'agriculture-revenu-05',
          say: 'Leur niveau de vie moyen est pourtant le même\u00a0: 27\u202f500\u00a0euros par an. Mais les écarts sont plus grands\u00a0: 31\u202f300\u00a0euros en moyenne dans les cultures, 23\u202f300 dans l’élevage.',
          spoken: 'Leur niveau de vie moyen est pourtant le même : vingt-sept mille cinq cents euros par an. Mais les écarts sont plus grands : trente et un mille trois cents euros en moyenne dans les cultures, vingt-trois mille trois cents dans l’élevage.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, depuis zéro, les cultures et l’élevage\u202f; un trait en pointillé marque le niveau de vie moyen.',
          alt: 'Deux barres à la même échelle, depuis zéro, les cultures et l’élevage\u202f; un pointillé marque le niveau de vie moyen de 27\u202f500\u00a0euros.',
          emphasis: ['27\u202f500\u00a0euros', '31\u202f300\u00a0euros', '23\u202f300'],
        },
        {
          id: 'agriculture-revenu-06',
          say: 'Alors, comment améliorer le revenu des agriculteurs\u202f?',
          visual: 'question',
          draw: 'La grange et un porte-monnaie, côte à côte, devant un point d’interrogation.',
          emphasis: ['améliorer le revenu'],
        },
      ],
      sources: [INSEE_COMPTE, INSEE_PAUVRETE],
    },
    {
      id: 'agriculture-prix',
      kind: 'deep',
      questionIds: ['agriculture-x1'],
      title: 'De la ferme au magasin, qui touche quoi\u202f?',
      short: 'Partage des prix',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-prix-01',
          say: 'Vous dépensez 100\u00a0euros pour vous nourrir, au magasin ou au restaurant. Combien en revient à ceux qui cultivent et qui élèvent\u202f?',
          spoken: 'Vous dépensez cent euros pour vous nourrir, au magasin ou au restaurant. Combien en revient à ceux qui cultivent et qui élèvent ?',
          visual: 'hook',
          draw: 'Un chariot de courses et une assiette mènent à un billet de 100\u00a0euros\u202f; une flèche en pointillé file vers une grange, un point d’interrogation au-dessus.',
          emphasis: ['100\u00a0euros', 'Combien en revient'],
        },
        {
          id: 'agriculture-prix-02',
          say: 'En 2021, l’agriculture française en tirait 6,4\u00a0euros de valeur ajoutée\u00a0: ce qu’elle produit, moins ce qu’elle achète pour produire.',
          spoken: 'En deux mille vingt et un, l’agriculture française en tirait six virgule quatre euros de valeur ajoutée : ce qu’elle produit, moins ce qu’elle achète pour produire.',
          visual: 'figure',
          draw: 'Une barre de 100\u00a0euros en pointillé\u202f; dessous, à la même échelle, la barre de l’agriculture au bleu bille.',
          alt: 'Une barre de 100\u00a0euros en pointillé, et dessous, à la même échelle, celle de l’agriculture.',
          emphasis: ['6,4\u00a0euros'],
          figure: { value: '6,4\u00a0€', label: 'Valeur ajoutée de l’agriculture française pour 100\u00a0€ de dépenses alimentaires en France en 2021, contre 9,4\u00a0€ pour les industries agroalimentaires et 18,8\u00a0€ pour le commerce au sens large (grande distribution, petits commerces, grossistes…). La valeur des produits agricoles français incorporés, intrants compris, atteint 13,2\u00a0€. En 2021, les confinements ont encore favorisé le commerce alimentaire', date: '2021', sourceIndex: 0 },
          chart: {
            kind: 'compare',
            unit: '€',
            items: [
              { label: 'Agriculture', value: 6.4 },
              { label: 'Industries agroalimentaires', value: 9.4 },
              { label: 'Commerce', value: 18.8 },
            ],
          },
        },
        {
          id: 'agriculture-prix-03',
          say: 'Les industries agroalimentaires en tiraient 9,4\u00a0euros. Le commerce, grandes surfaces, petits commerces et grossistes compris, 18,8\u00a0euros.',
          spoken: 'Les industries agroalimentaires en tiraient neuf virgule quatre euros. Le commerce, grandes surfaces, petits commerces et grossistes compris, dix-huit virgule huit euros.',
          visual: 'compare',
          draw: 'Sous la barre de 100\u00a0euros, trois barres à la même échelle\u00a0: l’agriculture, les industries agroalimentaires, le commerce.',
          alt: 'Sous une barre de 100\u00a0euros en pointillé, trois barres à la même échelle\u00a0: l’agriculture, les industries agroalimentaires, le commerce.',
          emphasis: ['9,4\u00a0euros', '18,8\u00a0euros'],
        },
        {
          id: 'agriculture-prix-04',
          say: 'En comptant ce que les fermes achètent pour produire, la valeur des produits agricoles français atteint 13,2\u00a0euros. Et en 2021, les confinements ont encore favorisé le commerce alimentaire.',
          spoken: 'En comptant ce que les fermes achètent pour produire, la valeur des produits agricoles français atteint treize virgule deux euros. Et en deux mille vingt et un, les confinements ont encore favorisé le commerce alimentaire.',
          visual: 'point',
          draw: 'La barre de l’agriculture s’allonge d’une rallonge au bleu bille\u202f; dessous, l’année 2021, une maison, une flèche vers un chariot de courses qui monte.',
          alt: 'La barre de l’agriculture, à la même échelle que celle de 100\u00a0euros, s’allonge d’une rallonge jusqu’à 13,2\u00a0euros.',
          emphasis: ['13,2\u00a0euros', 'les confinements'],
        },
        {
          id: 'agriculture-prix-05',
          say: 'Et les grandes surfaces\u202f? Dans leurs rayons frais, en 2024, il restait 29,4\u00a0euros sur 100\u00a0euros de ventes, une fois payés les produits achetés. C’est la marge brute.',
          spoken: 'Et les grandes surfaces ? Dans leurs rayons frais, en deux mille vingt-quatre, il restait vingt-neuf virgule quatre euros sur cent euros de ventes, une fois payés les produits achetés. C’est la marge brute.',
          visual: 'compare',
          draw: 'Un chariot de courses\u202f; deux barres à la même échelle, depuis zéro\u00a0: les ventes, puis la marge brute au bleu bille.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: les ventes, la marge brute.',
          emphasis: ['29,4\u00a0euros', 'la marge brute'],
        },
        {
          id: 'agriculture-prix-06',
          say: 'Une fois payés aussi le personnel, l’énergie, l’immobilier et l’impôt sur les sociétés, il restait 1,1\u00a0euro\u00a0: la marge nette.',
          spoken: 'Une fois payés aussi le personnel, l’énergie, l’immobilier et l’impôt sur les sociétés, il restait un virgule un euro : la marge nette.',
          visual: 'figure',
          draw: 'Les barres des ventes et de la marge brute, puis une troisième, très courte, à la même échelle\u00a0: la marge nette au bleu bille.',
          alt: 'Trois barres à la même échelle, depuis zéro\u00a0: les ventes, la marge brute, la marge nette.',
          emphasis: ['1,1\u00a0euro', 'la marge nette'],
          figure: { value: '1,1\u00a0€', label: 'Marge nette moyenne des rayons frais des grandes surfaces, pour 100\u00a0€ de chiffre d’affaires en 2024\u00a0: ce qui reste après les achats, les frais de personnel, l’énergie, l’immobilier et l’impôt sur les sociétés. La marge brute est de 29,4\u00a0€ (rayons alimentaires frais, sept rayons, six enseignes)', date: '2024', sourceIndex: 1 },
          chart: {
            kind: 'compare',
            unit: '€',
            items: [
              { label: 'Marge brute', value: 29.4 },
              { label: 'Marge nette', value: 1.1 },
            ],
          },
        },
        {
          id: 'agriculture-prix-07',
          say: 'Les lois EGalim, issues des États généraux de l’alimentation de 2017, obligent à tenir compte des coûts de production dans les contrats agricoles. Sans garantir de prix minimum.',
          spoken: 'Les lois Égalim, issues des États généraux de l’alimentation de deux mille dix-sept, obligent à tenir compte des coûts de production dans les contrats agricoles. Sans garantir de prix minimum.',
          visual: 'point',
          draw: 'Un texte de loi et des pièces de coûts qui entrent dans un contrat\u202f; sous une étiquette de prix, un plancher en pointillé, qui n’est pas garanti.',
          alt: 'Un texte de loi et un contrat\u202f; sous l’étiquette du prix, un plancher en pointillé.',
          emphasis: ['coûts de production', 'prix minimum'],
        },
        {
          id: 'agriculture-prix-08',
          say: 'Depuis 2023, la loi EGalim\u00a02 impose, sauf exceptions, un contrat écrit pour vendre un produit agricole. Avec une clause de révision automatique du prix.',
          spoken: 'Depuis deux mille vingt-trois, la loi Égalim deux impose, sauf exceptions, un contrat écrit pour vendre un produit agricole. Avec une clause de révision automatique du prix.',
          visual: 'point',
          draw: 'Une grange et un acheteur reliés par un contrat\u202f; à côté, une étiquette de prix entourée de deux flèches qui tournent.',
          emphasis: ['un contrat écrit', 'révision automatique'],
        },
        {
          id: 'agriculture-prix-09',
          say: 'Pour la viande bovine, un décret impose aussi un «\u00a0tunnel de prix\u00a0»\u00a0: une borne basse et une borne haute, entre lesquelles le prix évolue.',
          visual: 'point',
          draw: 'Deux bornes en pointillé, basse et haute\u202f; entre elles, la ligne du prix ondule sans les franchir.',
          emphasis: ['tunnel de prix'],
        },
        {
          id: 'agriculture-prix-10',
          say: 'Et entre industriels et distributeurs, la part de la matière première agricole dans le prix n’est pas négociable.',
          visual: 'point',
          draw: 'Une usine et un chariot de courses face à face\u202f; entre eux, une étiquette de prix dont la part agricole, un épi, est fermée d’un cadenas.',
          emphasis: ['pas négociable'],
        },
        {
          id: 'agriculture-prix-11',
          say: 'Alors, de la ferme au magasin, quelle part pour chacun\u202f?',
          visual: 'question',
          draw: 'Une grange, une usine et un chariot de courses en file, reliés par des flèches, jusqu’à un point d’interrogation.',
          emphasis: ['quelle part pour chacun'],
        },
      ],
      sources: [OFPM_VALEUR, OFPM_MARGES, EGALIM],
    },
    {
      id: 'agriculture-aides',
      kind: 'deep',
      questionIds: ['agriculture-1', 'agriculture-x1'],
      title: 'Les aides européennes à l’agriculture',
      short: 'Aides européennes',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-aides-01',
          say: 'Pour soutenir les agriculteurs, l’Union européenne a une politique agricole commune, la PAC. Comment ses aides sont-elles réparties\u202f?',
          spoken: 'Pour soutenir les agriculteurs, l’Union européenne a une politique agricole commune, la Pac. Comment ses aides sont-elles réparties ?',
          visual: 'hook',
          draw: 'Un document au bleu bille, d’où partent trois flèches en pointillé vers trois fermes de tailles différentes.',
          emphasis: ['la PAC', 'réparties'],
        },
        {
          id: 'agriculture-aides-02',
          say: 'De 2023 à 2027, elle prévoit 45,5\u00a0milliards d’euros d’aides pour la France, dont 34,2\u00a0milliards de paiements directs. Ces aides sont en grande partie versées selon la surface exploitée.',
          spoken: 'De deux mille vingt-trois à deux mille vingt-sept, elle prévoit quarante-cinq virgule cinq milliards d’euros d’aides pour la France, dont trente-quatre virgule deux milliards de paiements directs. Ces aides sont en grande partie versées selon la surface exploitée.',
          visual: 'figure',
          draw: 'Un disque, le total des aides\u202f; la part des paiements directs, un peu plus des trois quarts, au bleu bille.',
          emphasis: ['45,5\u00a0milliards', '34,2\u00a0milliards'],
          figure: { ...FIG_PAC, sourceIndex: 0 },
          chart: CHART_PAC,
        },
        {
          id: 'agriculture-aides-03',
          say: 'Dans le détail, 16,5\u00a0milliards vont à l’aide de base au revenu, et 8,6 à l’écorégime. Cette aide à l’hectare dépend de pratiques favorables au climat et à l’environnement, ou d’une certification comme le bio.',
          spoken: 'Dans le détail, seize virgule cinq milliards vont à l’aide de base au revenu, et huit virgule six à l’écorégime. Cette aide à l’hectare dépend de pratiques favorables au climat et à l’environnement, ou d’une certification comme le bio.',
          visual: 'compare',
          draw: 'Des barres à la même échelle, depuis zéro, une par aide\u00a0: d’abord l’aide de base au revenu, puis l’écorégime.',
          alt: 'Des barres à la même échelle, depuis zéro, une par aide.',
          emphasis: ['16,5\u00a0milliards', '8,6', 'l’écorégime'],
        },
        {
          id: 'agriculture-aides-04',
          say: 'Puis 5,1\u00a0milliards d’aides liées à certaines productions. Et 3,4 d’aide redistributive pour les fermes plus petites, 0,6 pour les jeunes agriculteurs.',
          spoken: 'Puis cinq virgule un milliards d’aides liées à certaines productions. Et trois virgule quatre d’aide redistributive pour les fermes plus petites, zéro virgule six pour les jeunes agriculteurs.',
          visual: 'compare',
          draw: 'Les deux premières barres restent\u202f; trois autres s’ajoutent dessous, à la même échelle.',
          alt: 'Cinq barres à la même échelle, depuis zéro, une par aide\u00a0: aide de base au revenu, écorégime, aides liées à certaines productions, aide redistributive, jeunes agriculteurs.',
          emphasis: ['5,1\u00a0milliards', '3,4', '0,6'],
        },
        {
          id: 'agriculture-aides-05',
          say: 'La PAC de 2028 à 2034 est en négociation. En juillet 2025, la Commission européenne a proposé d’y réserver au moins 300\u00a0milliards d’euros au soutien du revenu des agriculteurs de l’Union.',
          spoken: 'La Pac de deux mille vingt-huit à deux mille trente-quatre est en négociation. En juillet deux mille vingt-cinq, la Commission européenne a proposé d’y réserver au moins trois cents milliards d’euros au soutien du revenu des agriculteurs de l’Union.',
          visual: 'timeline',
          draw: 'Une frise\u00a0: la PAC actuelle de 2023 à 2027 en trait plein, la suivante de 2028 à 2034 en pointillé\u202f; un fanion en 2025 pour la proposition.',
          alt: 'Une frise de 2023 à 2034\u00a0: la PAC de 2023 à 2027, puis celle de 2028 à 2034 en pointillé, et un repère en 2025.',
          emphasis: ['en négociation', 'au moins 300\u00a0milliards'],
        },
        {
          id: 'agriculture-aides-06',
          say: 'La Commission propose une aide à l’hectare unique, dégressive et plafonnée pour les grandes exploitations, avec une priorité aux petites fermes et aux jeunes agriculteurs.',
          visual: 'point',
          draw: 'Un schéma sans chiffres\u00a0: l’aide selon la surface, une courbe qui monte de moins en moins vite puis bute sur un plafond\u202f; sous l’axe, trois granges de plus en plus grandes, la plus petite et une personne au bleu bille.',
          alt: 'Un schéma sans chiffres\u00a0: l’aide selon la surface de la ferme, qui monte de moins en moins vite puis s’arrête à un plafond.',
          emphasis: ['dégressive et plafonnée', 'petites fermes'],
        },
        {
          id: 'agriculture-aides-07',
          say: 'Alors, à qui verser ces aides, et selon quels critères\u202f?',
          visual: 'question',
          draw: 'Une pile de pièces devant trois fermes de tailles différentes, et un point d’interrogation.',
          emphasis: ['selon quels critères'],
        },
      ],
      sources: [PSN, PAC_OISE, PAC_2028],
    },
    {
      id: 'agriculture-importations',
      kind: 'deep',
      questionIds: ['agriculture-1', 'agriculture-x1'],
      title: 'Ce qui vient d’ailleurs\u00a0: quelles règles\u202f?',
      short: 'Importations',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-importations-01',
          say: 'Dans votre assiette, il y a aussi des produits venus d’autres pays. Doivent-ils respecter les mêmes règles que ceux produits en Europe\u202f?',
          visual: 'hook',
          draw: 'Un cargo chargé de conteneurs arrive vers une assiette\u202f; au-dessus, un point d’interrogation.',
          emphasis: ['venus d’autres pays', 'les mêmes règles'],
        },
        {
          id: 'agriculture-importations-02',
          say: 'En 2025, la France a vendu à l’étranger 200\u00a0millions d’euros de produits agricoles et alimentaires de plus qu’elle n’en a acheté. C’est 5\u00a0milliards de moins qu’un an plus tôt.',
          spoken: 'En deux mille vingt-cinq, la France a vendu à l’étranger deux cents millions d’euros de produits agricoles et alimentaires de plus qu’elle n’en a acheté. C’est cinq milliards de moins qu’un an plus tôt.',
          visual: 'figure',
          draw: 'Deux colonnes presque égales, exportations et importations\u202f; l’écart, trop fin pour se voir à l’échelle, est montré d’une flèche.',
          alt: 'Deux colonnes presque égales, les exportations et les importations\u00a0: l’écart, trop fin pour se voir à l’échelle, est montré du doigt.',
          emphasis: ['200\u00a0millions d’euros', '5\u00a0milliards de moins'],
          figure: { ...FIG_COMMERCE, sourceIndex: 0 },
        },
        {
          id: 'agriculture-importations-03',
          say: 'Les aliments importés doivent respecter les normes sanitaires de l’Union européenne\u00a0: par exemple les limites de résidus de pesticides, ou l’interdiction des viandes aux hormones.',
          visual: 'point',
          draw: 'Un cargo, une loupe, puis une assiette, reliés par des flèches\u202f; dessous, les deux exemples écrits l’un sous l’autre.',
          emphasis: ['normes sanitaires'],
        },
        {
          id: 'agriculture-importations-04',
          say: 'Mais leurs normes de production peuvent différer\u00a0: un pesticide interdit dans l’Union peut avoir été utilisé, si les résidus restent sous la limite fixée.',
          visual: 'compare',
          draw: 'Deux colonnes\u00a0: deux règles identiques pour les normes sanitaires, deux règles différentes pour les normes de production\u202f; dessous, une jauge dont le niveau reste sous la limite.',
          alt: 'À gauche, les normes sanitaires, les mêmes\u202f; à droite, les normes de production, qui peuvent différer\u202f; une jauge des résidus, sous la limite.',
          emphasis: ['normes de production', 'sous la limite'],
        },
        {
          id: 'agriculture-importations-05',
          say: 'L’accord commercial entre l’Union et le Mercosur, un groupe de pays d’Amérique du Sud, s’applique à titre provisoire depuis le 1er\u00a0mai 2026.',
          spoken: 'L’accord commercial entre l’Union et le Mercosur, un groupe de pays d’Amérique du Sud, s’applique à titre provisoire depuis le premier mai deux mille vingt-six.',
          visual: 'timeline',
          draw: 'Deux fanions sans couleur reliés par une double flèche\u202f; dessous, un accord au trait pointillé et un calendrier daté.',
          emphasis: ['à titre provisoire'],
        },
        {
          id: 'agriculture-importations-06',
          say: 'Selon le droit européen, l’origine doit figurer sur l’étiquette de certains produits\u00a0: plusieurs viandes, les fruits et légumes, le miel, le poisson, l’huile d’olive. Pour les autres, seulement si son absence risque de tromper sur l’origine réelle.',
          visual: 'point',
          draw: 'Une étiquette marquée «\u00a0origine\u00a0», et à côté la liste des produits, chacun coché quand la voix le dit.',
          alt: 'Une étiquette marquée «\u00a0origine\u00a0».',
          emphasis: ['l’origine', 'risque de tromper'],
        },
        {
          id: 'agriculture-importations-07',
          say: 'Alors, quelles règles pour les produits importés, et quelle information sur l’étiquette\u202f?',
          visual: 'question',
          draw: 'Le cargo et une étiquette, puis un point d’interrogation.',
          emphasis: ['quelles règles', 'quelle information'],
        },
      ],
      sources: [DOUANES, MERCOSUR, ORIGINE],
    },
    {
      id: 'agriculture-alimentation',
      kind: 'deep',
      questionIds: ['agriculture-1'],
      title: 'L’accès à l’alimentation',
      short: 'Se nourrir',
      register: 'vous',
      segments: [
        {
          id: 'agriculture-alimentation-01',
          say: 'Un repas avec de la viande, du poisson ou un équivalent végétarien, tous les deux jours\u00a0: tout le monde peut-il se l’offrir\u202f?',
          visual: 'hook',
          draw: 'Une assiette au trait, un couvert de chaque côté\u202f; dessous, une rangée de jours, l’assiette un jour sur deux.',
          emphasis: ['tous les deux jours', 'tout le monde'],
        },
        {
          id: 'agriculture-alimentation-02',
          say: 'Non. Début 2025, 11,2\u00a0% des personnes n’en avaient pas les moyens\u00a0: plus d’une sur dix.',
          spoken: 'Non. Début deux mille vingt-cinq, onze virgule deux pour cent des personnes n’en avaient pas les moyens : plus d’une sur dix.',
          visual: 'figure',
          draw: 'Dix personnes en rang, dont une au bleu bille.',
          emphasis: ['11,2\u00a0%', 'plus d’une sur dix'],
          figure: { ...FIG_PRIVATION, sourceIndex: 0 },
          chart: CHART_PRIVATION,
        },
        {
          id: 'agriculture-alimentation-03',
          say: 'En 2020, c’était 7,3\u00a0%. Ce sont les personnes elles-mêmes qui déclarent se priver, dans une enquête de l’Insee.',
          spoken: 'En deux mille vingt, c’était sept virgule trois pour cent. Ce sont les personnes elles-mêmes qui déclarent se priver, dans une enquête de l’Insee.',
          visual: 'timeline',
          draw: 'Deux colonnes à la même échelle, depuis zéro, 2020 et début 2025\u202f; la valeur écrite au-dessus de chacune.',
          alt: 'Deux colonnes à la même échelle, depuis zéro\u00a0: 7,3\u00a0% en 2020, 11,2\u00a0% début 2025.',
          emphasis: ['7,3\u00a0%', 'une enquête de l’Insee'],
        },
        {
          id: 'agriculture-alimentation-04',
          say: 'Côté prix, la plupart des aliments ont un taux réduit de TVA, la taxe comprise dans le prix\u00a0: 5,5\u00a0%.',
          spoken: 'Côté prix, la plupart des aliments ont un taux réduit de T.V.A., la taxe comprise dans le prix : cinq virgule cinq pour cent.',
          visual: 'point',
          draw: 'Un panier de courses et son étiquette de prix, où s’écrit le taux.',
          emphasis: ['taux réduit', '5,5\u00a0%'],
        },
        {
          id: 'agriculture-alimentation-05',
          say: 'Certains en sont exclus, comme les confiseries, les chocolats ou les boissons alcoolisées. Et les plats préparés à consommer tout de suite, ou les repas servis sur place, sont à 10\u00a0%.',
          spoken: 'Certains en sont exclus, comme les confiseries, les chocolats ou les boissons alcoolisées. Et les plats préparés à consommer tout de suite, ou les repas servis sur place, sont à dix pour cent.',
          visual: 'compare',
          draw: 'Le panier et son étiquette, puis les exceptions mises de côté\u202f; une assiette avec sa propre étiquette, au bleu bille.',
          alt: 'Le panier de courses et son taux, les exceptions mises de côté, puis l’assiette et son taux.',
          emphasis: ['en sont exclus', '10\u00a0%'],
        },
        {
          id: 'agriculture-alimentation-06',
          say: 'Alors, comment permettre à chacun de bien se nourrir, et à quel prix\u202f?',
          visual: 'question',
          draw: 'Une assiette et un panier, puis un point d’interrogation.',
          emphasis: ['bien se nourrir'],
        },
      ],
      sources: [INSEE_PRIVATION, TVA],
    },
  ],
}
