// Série « Europe » (famille « Europe et monde ») : l'introduction, puis cinq approfondissements (comment l'Union
// décide, ses traités, son budget, les règles sur les budgets des États, la concurrence). Tous les chiffres
// viennent des fiches du thème (research/choisir-2027/explainers.json, questions europe-1, europe-2, europe-3) et
// de leurs graphiques (explainer-charts.json). Règles d'écriture : ../GUIDE-SERIES.md ; planches :
// ../pistes/planches/europe.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : budget 2028-2034 proposé par la Commission le 16 juillet 2025, en négociation ; convention de révision
// des traités demandée en 2022, non convoquée (fiche du Parlement européen d'avril 2026) ; règles sur les fusions
// en réexamen en 2026 ; parts de l'offre de marché (électricité, CRE) et des trains attribués après appel
// d'offres (ART) en juin 2026. À revoir après l'adoption du budget 2028-2034 et la fin du réexamen des fusions.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources des fiches (titres composés à la française) ——— */

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

const VOTE_2023: VideoSource = {
  title: 'Avenir de l’UE\u00a0: les propositions du Parlement pour modifier les traités',
  url: 'https://www.europarl.europa.eu/news/fr/press-room/20231117IPR12217/avenir-de-l-ue-les-propositions-du-parlement-pour-modifier-les-traites',
  publisher: 'Parlement européen',
  date: '2023-11-22',
}

const EUROSTAT: VideoSource = {
  title: 'Population au 1er\u00a0janvier (tps00001)',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/tps00001/default/table?lang=fr',
  publisher: 'Eurostat',
  date: '2026-09-30',
}

const UEM: VideoSource = {
  title: 'Historique de l’Union économique et monétaire – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/79/historique-de-l-union-economique-et-monetaire',
  publisher: 'Parlement européen',
  date: '2026-04',
}

const RECETTES: VideoSource = {
  title: 'Recettes de l’Union – Fiches thématiques sur l’Union européenne',
  url: 'https://www.europarl.europa.eu/factsheets/fr/sheet/27/recettes-de-l-union',
  publisher: 'Parlement européen',
  date: '2026-05',
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
  title: 'Projet de loi de finances pour 2026\u00a0: Affaires européennes – Rapport général n° 139 (2025-2026), tome II, fascicule 2',
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

const FUSIONS: VideoSource = {
  title: 'Merger cases statistics',
  url: 'https://competition-policy.ec.europa.eu/document/download/4b083559-e36c-44c2-a604-f581abd6b42c_en?filename=Merger_cases_statistics.pdf',
  publisher: 'Commission européenne, DG Concurrence',
  date: '2026-09-30',
}

const ALSTOM: VideoSource = {
  title: 'Concentrations\u00a0: la Commission interdit le projet d’acquisition d’Alstom par Siemens (IP/19/881)',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/ip_19_881',
  publisher: 'Commission européenne',
  date: '2019-02-06',
}

const CRE_ELEC: VideoSource = {
  title: 'Marché de détail de l’électricité – Présentation',
  url: 'https://www.cre.fr/electricite/marche-de-detail-de-lelectricite/presentation.html',
  publisher: 'Commission de régulation de l’énergie (CRE)',
}

const CRE_GAZ: VideoSource = {
  title: 'Marché de détail du gaz naturel – Présentation',
  url: 'https://www.cre.fr/gaz/marche-de-detail-du-gaz-naturel/presentation.html',
  publisher: 'Commission de régulation de l’énergie (CRE)',
}

const ART: VideoSource = {
  title: 'Ouverture du marché ferroviaire\u00a0: de premiers bénéfices concrets, trois défis pour les pérenniser',
  url: 'https://www.autorite-transports.fr/actualites/ouverture-du-marche-ferroviaire-de-premiers-benefices-concrets-trois-defis-pour-les-perenniser/',
  publisher: 'Autorité de régulation des transports (ART)',
  date: '2026-06-28',
}

/* ——— Les chiffres des fiches, repris tels quels ——— */

const POPULATION = {
  value: '69,1\u00a0millions sur 452,0\u00a0millions',
  label: 'Habitants de la France et de l’UE à 27 (données provisoires). Ce poids démographique compte dans les votes à la majorité qualifiée',
  date: '1er\u00a0janvier 2026',
}
const POPULATION_CHART = { kind: 'part', value: 69.1, total: 452, unit: 'millions', whole: 'd’habitants de l’UE à 27' }

const BUDGET = {
  value: '1\u202f763\u00a0Md€',
  label: 'Budget 2028-2034 proposé par la Commission (prix de 2025), soit 1,26\u00a0% du revenu national brut de l’UE, dont 0,11\u00a0% pour rembourser le plan de relance. Le budget 2021-2027 représentait 1,13\u00a0% à son adoption',
  date: 'Proposition du 16\u00a0juillet 2025, en négociation',
}

const SOLDE = {
  value: '−7,9\u00a0Md€',
  label: 'Solde net de la France avec le budget européen (versements moins dépenses de l’UE en France)\u00a0: deuxième contributeur net, derrière l’Allemagne. Avec 16,5\u00a0Md€ reçus hors plan de relance, dont 58\u00a0% au titre de la politique agricole commune, elle est aussi le premier bénéficiaire en volume, mais 22e par habitant',
  date: '2024',
}

const EURO = {
  value: '21 sur 27',
  label: 'États membres qui ont adopté l’euro. Tous doivent l’adopter une fois les critères remplis, sauf le Danemark, qui bénéficie d’une dérogation',
  date: 'Avril 2026',
}

export const EUROPE: VideoSeries = {
  topicId: 'europe',
  familyId: 'monde',
  label: 'Europe',
  videos: [
    {
      id: 'europe-intro',
      kind: 'intro',
      questionIds: ['europe-1', 'europe-2', 'europe-3'],
      title: 'L’Europe, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'europe-intro-01',
          say: 'Vous payez en euros. Vous pouvez choisir votre fournisseur d’électricité. Derrière, il y a des règles européennes. Qui les décide, et comment\u202f?',
          visual: 'hook',
          draw: 'Un porte-monnaie et un compteur électrique au trait\u202f; deux flèches en pointillé mènent à un texte de règles, avec un point d’interrogation.',
          emphasis: ['Qui les décide'],
        },
        {
          id: 'europe-intro-02',
          say: 'L’Union européenne, c’est 27\u00a0États et 452\u00a0millions d’habitants, au 1er\u00a0janvier 2026. La France en compte 69,1\u00a0millions\u00a0: un peu plus de 15 sur 100.',
          spoken: 'L’Union européenne, c’est vingt-sept États et quatre cent cinquante-deux millions d’habitants, au premier janvier deux mille vingt-six. La France en compte soixante-neuf virgule un millions : un peu plus de quinze sur cent.',
          visual: 'figure',
          draw: 'Cent petites cases, les habitants de l’Union\u202f; quinze se colorent au bleu bille, et une seizième à moitié, pour la France.',
          emphasis: ['452\u00a0millions', '15 sur 100'],
          figure: { ...POPULATION, sourceIndex: 0 },
          chart: POPULATION_CHART,
        },
        {
          id: 'europe-intro-03',
          say: 'Au Conseil de l’Union, les États décident en règle générale à la majorité qualifiée. Mais dans quelques domaines, comme le budget sur sept ans ou l’entrée de nouveaux pays, il faut l’unanimité. Chaque État a alors un droit de veto.',
          visual: 'point',
          draw: 'Deux rangées de 27\u00a0cases, une par État\u00a0: dans la première, une majorité se colore\u202f; dans la seconde, toutes doivent se colorer, et une seule case barrée suffit à arrêter la décision.',
          alt: 'Deux rangées de 27\u00a0cases, une par État\u00a0: pour la majorité qualifiée, au moins 15 se colorent\u202f; pour l’unanimité, toutes, et une case barrée, le veto.',
          emphasis: ['la majorité qualifiée', 'l’unanimité'],
        },
        {
          id: 'europe-intro-04',
          say: 'L’Union a aussi un budget, fixé pour sept ans. Pour 2028 à 2034, la Commission européenne propose 1\u202f763\u00a0milliards d’euros, aux prix de 2025. C’est en négociation.',
          spoken: 'L’Union a aussi un budget, fixé pour sept ans. Pour deux mille vingt-huit à deux mille trente-quatre, la Commission européenne propose mille sept cent soixante-trois milliards d’euros, aux prix de deux mille vingt-cinq. C’est en négociation.',
          visual: 'figure',
          draw: 'Sept cases d’années en file, de 2028 à 2034, réunies par une accolade\u202f; «\u00a0sept ans\u00a0» écrit dessous.',
          alt: 'Sept cases, une par année, de 2028 à 2034.',
          emphasis: ['sept ans', '1\u202f763\u00a0milliards'],
          figure: { ...BUDGET, sourceIndex: 2 },
        },
        {
          id: 'europe-intro-05',
          say: 'En 2024, la France a été le premier bénéficiaire du budget européen, en volume. Et son deuxième contributeur net\u00a0: elle a versé 7,9\u00a0milliards d’euros de plus qu’elle n’a reçu.',
          spoken: 'En deux mille vingt-quatre, la France a été le premier bénéficiaire du budget européen, en volume. Et son deuxième contributeur net : elle a versé sept virgule neuf milliards d’euros de plus qu’elle n’a reçu.',
          visual: 'figure',
          draw: 'Deux flèches de sens contraire entre la France et le budget européen\u00a0: ce qu’elle reçoit, ce qu’elle verse\u202f; chacune avec sa légende.',
          alt: 'Deux flèches de même taille entre la France et le budget européen, une dans chaque sens.',
          emphasis: ['premier bénéficiaire', 'deuxième contributeur net'],
          figure: { ...SOLDE, sourceIndex: 3 },
        },
        {
          id: 'europe-intro-06',
          say: 'Le marché unique a aussi ses règles. L’Union contrôle les ententes, les fusions et les aides publiques aux entreprises. Et elle a ouvert à la concurrence d’anciens monopoles publics.',
          visual: 'point',
          draw: 'Deux immeubles d’entreprises qui se rapprochent, une loupe au-dessus\u202f; à côté, un compteur et un train, d’anciens monopoles.',
          emphasis: ['contrôle', 'ouvert à la concurrence'],
        },
        {
          id: 'europe-intro-07',
          say: 'Alors, cinq questions se posent. Comment décider à 27\u202f? Quelle direction pour la construction européenne\u202f? Qui finance le budget européen\u202f? Quelles règles pour les budgets des États\u202f? Et quelle place pour la concurrence\u202f?',
          spoken: 'Alors, cinq questions se posent. Comment décider à vingt-sept ? Quelle direction pour la construction européenne ? Qui finance le budget européen ? Quelles règles pour les budgets des États ? Et quelle place pour la concurrence ?',
          visual: 'question',
          draw: 'Cinq pictogrammes en grille, dessinés l’un après l’autre\u00a0: un texte, une grue, une tirelire, des pièces, une mallette.',
          emphasis: ['Comment décider', 'Qui finance', 'quelle place'],
        },
        {
          id: 'europe-intro-08',
          say: 'Ce sont les cinq sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les cinq pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [EUROSTAT, CONSEIL, CFP, SENAT, CONCURRENCE],
    },
    {
      id: 'europe-decider',
      kind: 'deep',
      questionIds: ['europe-1'],
      title: 'Comment l’Union décide-t-elle\u202f?',
      short: 'Unanimité ou majorité',
      register: 'vous',
      segments: [
        {
          id: 'europe-decider-01',
          say: 'Quand l’Union décide, faut-il l’accord de tous les États, ou celui d’une majorité\u202f?',
          visual: 'hook',
          draw: 'Deux cercles de 27 petites cases\u00a0: dans l’un, toutes se colorent\u202f; dans l’autre, une partie\u202f; un point d’interrogation entre les deux.',
          emphasis: ['tous les États', 'une majorité'],
        },
        {
          id: 'europe-decider-02',
          say: 'Au Conseil de l’Union, la règle par défaut est la majorité qualifiée. Il faut au moins 55\u00a0% des États, soit 15 sur 27, représentant au moins 65\u00a0% de la population.',
          spoken: 'Au Conseil de l’Union, la règle par défaut est la majorité qualifiée. Il faut au moins cinquante-cinq pour cent des États, soit quinze sur vingt-sept, représentant au moins soixante-cinq pour cent de la population.',
          visual: 'figure',
          draw: 'Deux jauges\u00a0: une rangée de 27 cases, dont 15 se colorent\u202f; une barre de population, remplie jusqu’au trait des 65\u00a0%.',
          alt: 'Deux jauges\u00a0: les États, 15 cases sur 27\u202f; la population, une barre remplie jusqu’à 65 sur 100.',
          emphasis: ['15 sur 27', '65\u00a0%'],
          figure: {
            value: '55\u00a0% des États, 65\u00a0% de la population',
            label: 'Seuil de la majorité qualifiée au Conseil de l’UE\u00a0: au moins 15\u00a0États sur 27, représentant au moins 65\u00a0% des habitants de l’Union',
            date: 'Règle en vigueur (article 16 du traité sur l’UE)',
            sourceIndex: 0,
          },
        },
        {
          id: 'europe-decider-03',
          say: 'Mais dans quelques domaines, il faut l’unanimité. Par exemple\u00a0: le budget sur sept ans, l’entrée de nouveaux pays, la révision des traités, la création d’un impôt européen.',
          visual: 'point',
          draw: 'Quatre pictogrammes en grille, chacun avec sa légende\u00a0: des pièces pour le budget, une porte pour l’entrée de nouveaux pays, un texte pour les traités, un billet pour un impôt.',
          emphasis: ['l’unanimité'],
        },
        {
          id: 'europe-decider-04',
          say: 'D’un côté, aucun État ne se voit imposer une décision. De l’autre, un seul État peut la bloquer.',
          visual: 'compare',
          draw: 'Une balance aux plateaux égaux, le fléau à l’horizontale\u00a0: un cadenas d’un côté, une barrière baissée de l’autre.',
          alt: 'Une balance au fléau horizontal\u00a0: un cadenas d’un côté, une barrière de l’autre.',
          emphasis: ['aucun État', 'un seul État'],
        },
        {
          id: 'europe-decider-05',
          say: 'Sans changer les traités, sept «\u00a0clauses passerelles\u00a0» permettent de passer à la majorité qualifiée dans un domaine. Mais il faut l’unanimité pour les activer, et elles ont été rarement utilisées.',
          visual: 'point',
          draw: 'Une passerelle au trait relie deux rives, l’unanimité et la majorité qualifiée\u202f; un cadenas se pose à son entrée.',
          emphasis: ['clauses passerelles', 'rarement utilisées'],
        },
        {
          id: 'europe-decider-06',
          say: 'Autre voie, la coopération renforcée\u00a0: au moins neuf États peuvent avancer ensemble, comme pour le Parquet européen.',
          visual: 'point',
          draw: 'Trois rangées de neuf cases\u202f; neuf se colorent et avancent d’un pas, ensemble.',
          alt: '27\u00a0cases, une par État\u00a0: neuf avancent ensemble.',
          emphasis: ['neuf États'],
        },
        {
          id: 'europe-decider-07',
          say: 'Alors, dans quels domaines décider à l’unanimité, et dans lesquels à la majorité\u202f?',
          visual: 'question',
          draw: 'Les deux cercles de cases du début, côte à côte, et un point d’interrogation entre eux.',
          emphasis: ['l’unanimité', 'la majorité'],
        },
      ],
      sources: [CONSEIL, LISBONNE, RECETTES],
    },
    {
      id: 'europe-traites',
      kind: 'deep',
      questionIds: ['europe-1'],
      title: 'La construction européenne et ses traités',
      short: 'Traités',
      register: 'vous',
      segments: [
        {
          id: 'europe-traites-01',
          say: 'L’Union européenne repose sur des traités. Peut-on les changer, et comment\u202f?',
          visual: 'hook',
          draw: 'Une pile de textes posée comme une fondation sous un petit édifice à colonnes\u202f; un point d’interrogation.',
          emphasis: ['les changer'],
        },
        {
          id: 'europe-traites-02',
          say: 'Pour réviser un traité, il faut l’accord de tous les États. Puis chacun doit le ratifier, par son Parlement ou par référendum.',
          visual: 'point',
          draw: '27 cases toutes colorées mènent à un texte\u202f; de là, deux chemins\u00a0: un édifice à colonnes, ou une urne.',
          alt: '27\u00a0cases, une par État, toutes d’accord\u202f; puis un Parlement ou une urne.',
          emphasis: ['tous les États', 'référendum'],
        },
        {
          id: 'europe-traites-03',
          say: 'En juin 2022, le Parlement européen a demandé une convention pour réviser les traités. À ce jour, le Conseil européen ne l’a pas convoquée.',
          spoken: 'En juin deux mille vingt-deux, le Parlement européen a demandé une convention pour réviser les traités. À ce jour, le Conseil européen ne l’a pas convoquée.',
          visual: 'timeline',
          draw: 'Une frise\u00a0: au jalon 2022, une demande part\u202f; elle attend, en pointillé, devant une porte fermée.',
          alt: 'Sur une frise, la demande de 2022, puis une attente en pointillé devant une porte.',
          emphasis: ['une convention', 'pas convoquée'],
        },
        {
          id: 'europe-traites-04',
          say: 'Le 22\u00a0novembre 2023, le Parlement européen a adopté ses propositions de révision, dont plus de décisions à la majorité qualifiée. Par 305\u00a0voix pour, 276 contre et 29 abstentions.',
          spoken: 'Le vingt-deux novembre deux mille vingt-trois, le Parlement européen a adopté ses propositions de révision, dont plus de décisions à la majorité qualifiée. Par trois cent cinq voix pour, deux cent soixante-seize contre et vingt-neuf abstentions.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: pour, contre, abstentions.',
          alt: 'Trois barres à la même échelle\u00a0: 305\u00a0voix pour, 276 contre, 29\u00a0abstentions.',
          emphasis: ['305\u00a0voix pour', '276 contre'],
          figure: {
            value: '305 pour, 276 contre',
            label: 'Vote du Parlement européen sur ses propositions de révision des traités, qui prévoient notamment davantage de décisions à la majorité qualifiée au Conseil (29\u00a0abstentions)',
            date: '22\u00a0novembre 2023',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'voix',
            items: [
              { label: 'Pour', value: 305 },
              { label: 'Contre', value: 276 },
              { label: 'Abstentions', value: 29 },
            ],
          },
        },
        {
          id: 'europe-traites-05',
          say: 'Un État peut aussi obtenir des garanties. Après un premier «\u00a0non\u00a0» par référendum, l’Irlande en a obtenu, puis a ratifié le traité de Lisbonne lors d’un second référendum.',
          visual: 'timeline',
          draw: 'Une frise en trois temps\u00a0: une urne et son «\u00a0non\u00a0», un texte de garanties, une seconde urne\u202f; une coche, le traité ratifié.',
          alt: 'Trois temps\u00a0: le premier «\u00a0non\u00a0», les garanties, le second référendum.',
          emphasis: ['des garanties', 'second référendum'],
        },
        {
          id: 'europe-traites-06',
          say: 'Côté monnaie, 21\u00a0États sur 27 ont adopté l’euro. Tous doivent le faire une fois les critères remplis, sauf un\u00a0: le Danemark, qui bénéficie d’une dérogation.',
          spoken: 'Côté monnaie, vingt et un États sur vingt-sept ont adopté l’euro. Tous doivent le faire une fois les critères remplis, sauf un : le Danemark, qui bénéficie d’une dérogation.',
          visual: 'figure',
          draw: '27 pièces en trois rangées de neuf\u202f; 21 se colorent\u202f; une flèche désigne l’une des six autres, le Danemark.',
          alt: '27 pièces\u00a0: 21 colorées\u202f; une flèche désigne l’une des six autres, le Danemark.',
          emphasis: ['21\u00a0États sur 27', 'le Danemark'],
          figure: { ...EURO, sourceIndex: 2 },
          chart: { kind: 'part', value: 21, total: 27, whole: 'États membres de l’UE' },
        },
        {
          id: 'europe-traites-07',
          say: 'Alors, quelle direction donner à la construction européenne\u202f?',
          visual: 'question',
          draw: 'Une grue au trait au-dessus de l’édifice à colonnes, et un point d’interrogation.',
          emphasis: ['quelle direction'],
        },
      ],
      sources: [LISBONNE, VOTE_2023, UEM],
    },
    {
      id: 'europe-budget',
      kind: 'deep',
      questionIds: ['europe-2'],
      title: 'Qui finance le budget européen\u202f?',
      short: 'Budget',
      register: 'vous',
      segments: [
        {
          id: 'europe-budget-01',
          say: 'L’Union européenne a son propre budget, fixé pour sept ans. Combien pèse-t-il, et qui le paie\u202f?',
          visual: 'hook',
          draw: 'Une tirelire au trait posée sur sept cases d’années\u202f; un point d’interrogation.',
          emphasis: ['qui le paie'],
        },
        {
          id: 'europe-budget-02',
          say: 'Pour 2028 à 2034, la Commission propose 1\u202f763\u00a0milliards d’euros, aux prix de 2025. C’est 1,26\u00a0% du revenu national brut de l’Union, une mesure de sa richesse.',
          spoken: 'Pour deux mille vingt-huit à deux mille trente-quatre, la Commission propose mille sept cent soixante-trois milliards d’euros, aux prix de deux mille vingt-cinq. C’est un virgule vingt-six pour cent du revenu national brut de l’Union, une mesure de sa richesse.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, en part du revenu national brut\u00a0: le budget 2021-2027 à son adoption, la proposition 2028-2034, et sa part pour rembourser le plan de relance.',
          alt: 'Trois barres à la même échelle, en part du revenu national brut\u00a0: 1,13\u00a0% pour le budget 2021-2027 à son adoption, 1,26\u00a0% pour la proposition 2028-2034, dont 0,11\u00a0% pour rembourser le plan de relance.',
          emphasis: ['1\u202f763\u00a0milliards', '1,26\u00a0%'],
          figure: { ...BUDGET, sourceIndex: 0 },
          chart: {
            kind: 'compare',
            unit: '% du revenu national brut',
            items: [
              { label: '2021-2027, à son adoption', value: 1.13 },
              { label: '2028-2034, proposition', value: 1.26 },
              { label: 'Dont remboursement de la relance', value: 0.11 },
            ],
          },
        },
        {
          id: 'europe-budget-03',
          say: 'L’argent vient surtout des États. Leurs contributions, calculées sur leur richesse, fournissent environ 60 à 70\u00a0% des ressources propres de l’Union.',
          spoken: 'L’argent vient surtout des États. Leurs contributions, calculées sur leur richesse, fournissent environ soixante à soixante-dix pour cent des ressources propres de l’Union.',
          visual: 'point',
          draw: 'Cent pièces en dix rangées\u202f; soixante se colorent au bleu bille, dix de plus en bleu clair.',
          emphasis: ['60 à 70\u00a0%'],
        },
        {
          id: 'europe-budget-04',
          say: 'Créer une nouvelle ressource, comme un impôt européen, exige l’unanimité des États. En juillet 2025, la Commission en a proposé plusieurs, notamment\u00a0: quotas carbone, tabac, déchets électroniques, grandes entreprises.',
          spoken: 'Créer une nouvelle ressource, comme un impôt européen, exige l’unanimité des États. En juillet deux mille vingt-cinq, la Commission en a proposé plusieurs, notamment : quotas carbone, tabac, déchets électroniques, grandes entreprises.',
          visual: 'point',
          draw: 'Un billet fermé par un cadenas, l’unanimité\u202f; dessous, quatre petits dessins légendés\u00a0: une cheminée d’usine, une cigarette, un écran, un immeuble.',
          emphasis: ['un impôt européen', 'l’unanimité'],
        },
        {
          id: 'europe-budget-05',
          say: 'Pour son plan de relance, 750\u00a0milliards d’euros aux prix de 2018, l’Union a emprunté sur les marchés financiers. Le rembourser coûtera environ 25\u00a0milliards d’euros par an, de 2028 à 2034.',
          spoken: 'Pour son plan de relance, sept cent cinquante milliards d’euros aux prix de deux mille dix-huit, l’Union a emprunté sur les marchés financiers. Le rembourser coûtera environ vingt-cinq milliards d’euros par an, de deux mille vingt-huit à deux mille trente-quatre.',
          visual: 'point',
          draw: 'Une courbe de Bourse d’où des pièces partent vers une tirelire\u202f; dessous, sept cases d’années, chacune avec sa pièce de remboursement.',
          alt: 'Sept cases d’années, de 2028 à 2034, chacune avec sa part de remboursement.',
          emphasis: ['emprunté', '25\u00a0milliards'],
        },
        {
          id: 'europe-budget-06',
          say: 'En 2024, la France a reçu 16,5\u00a0milliards d’euros, hors plan de relance. Dont 58\u00a0% pour la politique agricole commune. Premier bénéficiaire en volume, elle est 22e par habitant.',
          spoken: 'En deux mille vingt-quatre, la France a reçu seize virgule cinq milliards d’euros, hors plan de relance. Dont cinquante-huit pour cent pour la politique agricole commune. Premier bénéficiaire en volume, elle est vingt-deuxième par habitant.',
          visual: 'point',
          draw: 'Un disque, ce que la France reçoit\u202f; un peu plus de la moitié se colore, la politique agricole commune.',
          alt: 'Un disque\u00a0: la part de la politique agricole commune.',
          emphasis: ['16,5\u00a0milliards', '58\u00a0%', '22e par habitant'],
        },
        {
          id: 'europe-budget-07',
          say: 'Elle verse aussi sa contribution\u00a0: en 2024, 7,9\u00a0milliards d’euros de plus qu’elle n’a reçu. C’est le deuxième contributeur net, derrière l’Allemagne.',
          spoken: 'Elle verse aussi sa contribution : en deux mille vingt-quatre, sept virgule neuf milliards d’euros de plus qu’elle n’a reçu. C’est le deuxième contributeur net, derrière l’Allemagne.',
          visual: 'figure',
          draw: 'Deux flèches de sens contraire entre la France et le budget européen\u00a0: ce qu’elle verse, ce qu’elle reçoit.',
          alt: 'Deux flèches de même taille entre la France et le budget européen\u00a0: sa contribution, et ce qu’elle a reçu.',
          emphasis: ['7,9\u00a0milliards', 'deuxième contributeur net'],
          figure: { ...SOLDE, sourceIndex: 1 },
        },
        {
          id: 'europe-budget-08',
          say: 'Cinq pays ont un rabais sur leur contribution\u00a0: l’Allemagne, les Pays-Bas, la Suède, l’Autriche et le Danemark. En 2025, la France en finance la plus grande part\u00a0: 1,5\u00a0milliard d’euros.',
          spoken: 'Cinq pays ont un rabais sur leur contribution : l’Allemagne, les Pays-Bas, la Suède, l’Autriche et le Danemark. En deux mille vingt-cinq, la France en finance la plus grande part : un virgule cinq milliard d’euros.',
          visual: 'figure',
          draw: 'Cinq étiquettes de rabais en colonne, chacune avec le nom de son pays.',
          emphasis: ['Cinq pays', '1,5\u00a0milliard'],
          figure: {
            value: '1,5\u00a0Md€',
            label: 'Part payée par la France pour financer les rabais accordés à cinq pays\u00a0: Allemagne (2,2\u00a0Md€), Pays-Bas (1,7\u00a0Md€), Suède (0,9\u00a0Md€), Autriche (0,4\u00a0Md€) et Danemark (0,2\u00a0Md€). La France est le premier financeur de ces rabais',
            date: '2025',
            sourceIndex: 1,
          },
        },
        {
          id: 'europe-budget-09',
          say: 'Alors, quelle taille pour le budget européen, et qui doit le financer\u202f?',
          visual: 'question',
          draw: 'La tirelire du début sur ses sept cases d’années, et un point d’interrogation.',
          emphasis: ['quelle taille', 'qui doit le financer'],
        },
      ],
      sources: [CFP, SENAT, RECETTES],
    },
    {
      id: 'europe-deficits',
      kind: 'deep',
      questionIds: ['europe-2'],
      title: 'Les règles sur les budgets des États',
      short: 'Déficits',
      register: 'vous',
      segments: [
        {
          id: 'europe-deficits-01',
          say: 'Un État de l’Union peut-il dépenser plus qu’il ne perçoit, et s’endetter autant qu’il le veut\u202f?',
          visual: 'hook',
          draw: 'Deux piles, recettes et dépenses, la seconde plus haute\u202f; un point d’interrogation.',
          alt: 'Deux piles, recettes et dépenses, la seconde plus haute.',
          emphasis: ['s’endetter'],
        },
        {
          id: 'europe-deficits-02',
          say: 'Les règles européennes fixent deux valeurs de référence. Un déficit public de 3\u00a0% du PIB, la richesse produite en un an. Et une dette de 60\u00a0%.',
          spoken: 'Les règles européennes fixent deux valeurs de référence. Un déficit public de trois pour cent du P.I.B., la richesse produite en un an. Et une dette de soixante pour cent.',
          visual: 'point',
          draw: 'Deux grilles de cent cases, la richesse produite en un an\u00a0: trois se colorent pour le déficit, soixante pour la dette.',
          alt: 'Deux grilles de cent cases\u00a0: le déficit, 3 sur 100\u202f; la dette, 60 sur 100.',
          emphasis: ['3\u00a0%', '60\u00a0%'],
        },
        {
          id: 'europe-deficits-03',
          say: 'Depuis la réforme de 2024, un État qui les dépasse suit une trajectoire de dépenses sur quatre ou cinq ans. Jusqu’à sept ans, s’il s’engage à investir et à réformer.',
          spoken: 'Depuis la réforme de deux mille vingt-quatre, un État qui les dépasse suit une trajectoire de dépenses sur quatre ou cinq ans. Jusqu’à sept ans, s’il s’engage à investir et à réformer.',
          visual: 'timeline',
          draw: 'Une frise de sept années\u00a0: un chemin plat tracé sur les quatre ou cinq premières, prolongé en pointillé jusqu’à la septième.',
          alt: 'Une frise de sept années\u00a0: un chemin plein sur quatre ou cinq ans, prolongé en pointillé jusqu’à sept.',
          emphasis: ['trajectoire de dépenses', 'sept ans'],
        },
        {
          id: 'europe-deficits-04',
          say: 'En 2025, le déficit public de la France atteint 5,1\u00a0% du PIB, soit 152,5\u00a0milliards d’euros.',
          spoken: 'En deux mille vingt-cinq, le déficit public de la France atteint cinq virgule un pour cent du P.I.B., soit cent cinquante-deux virgule cinq milliards d’euros.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: la valeur de référence et le déficit de la France.',
          alt: 'Deux barres à la même échelle\u00a0: la valeur de référence, 3\u00a0%, et la France, 5,1\u00a0%.',
          emphasis: ['5,1\u00a0%', '152,5\u00a0milliards'],
          figure: {
            value: '5,1\u00a0% du PIB',
            label: 'Déficit public de la France (152,5\u00a0Md€), au-dessus de la valeur de référence européenne de 3\u00a0%. La dette publique atteint 115,7\u00a0% du PIB fin 2025',
            date: '2025 (comptes publiés le 29\u00a0mai 2026)',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '% du PIB',
            items: [
              { label: 'Déficit public de la France', value: 5.1 },
              { label: 'Valeur de référence européenne', value: 3 },
            ],
          },
        },
        {
          id: 'europe-deficits-05',
          say: 'Sa dette publique atteint 115,7\u00a0% du PIB fin 2025, pour une valeur de référence de 60\u00a0%.',
          spoken: 'Sa dette publique atteint cent quinze virgule sept pour cent du P.I.B. fin deux mille vingt-cinq, pour une valeur de référence de soixante pour cent.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: la valeur de référence et la dette de la France.',
          alt: 'Deux barres à la même échelle\u00a0: la valeur de référence, 60\u00a0%, et la France, 115,7\u00a0%.',
          emphasis: ['115,7\u00a0%', '60\u00a0%'],
        },
        {
          id: 'europe-deficits-06',
          say: 'Alors, quelles règles pour les budgets des États\u202f?',
          visual: 'question',
          draw: 'Les deux grilles de cent cases, et un point d’interrogation.',
          emphasis: ['quelles règles'],
        },
      ],
      sources: [REGLES_BUDGET, INSEE],
    },
    {
      id: 'europe-concurrence',
      kind: 'deep',
      questionIds: ['europe-3'],
      title: 'Concurrence, entreprises et services publics',
      short: 'Concurrence',
      register: 'vous',
      segments: [
        {
          id: 'europe-concurrence-01',
          say: 'Deux grandes entreprises veulent fusionner. Peuvent-elles le faire librement, dans l’Union européenne\u202f?',
          visual: 'hook',
          draw: 'Deux immeubles d’entreprises qui s’avancent l’un vers l’autre\u202f; un point d’interrogation entre eux.',
          emphasis: ['librement'],
        },
        {
          id: 'europe-concurrence-02',
          say: 'L’Union contrôle les fusions, les ententes entre entreprises, et les aides publiques qu’elles reçoivent. Elle interdit l’abus de position dominante, mais pas le fait d’être dominant.',
          visual: 'point',
          draw: 'Une loupe au-dessus de trois petites scènes\u00a0: deux immeubles côte à côte, deux immeubles reliés par un trait, des pièces au-dessus d’un immeuble.',
          emphasis: ['contrôle', 'pas le fait d’être dominant'],
        },
        {
          id: 'europe-concurrence-03',
          say: 'Depuis septembre 1990, 10\u202f164\u00a0opérations ont été notifiées à la Commission européenne. Elle en a interdit 33, soit 1 sur 308.',
          spoken: 'Depuis septembre mille neuf cent quatre-vingt-dix, dix mille cent soixante-quatre opérations ont été notifiées à la Commission européenne. Elle en a interdit trente-trois, soit une sur trois cent huit.',
          visual: 'figure',
          draw: 'Une grille de 308 petites cases\u202f; une seule se colore au bleu bille.',
          alt: 'Une grille de 308 cases, dont une colorée.',
          emphasis: ['33', '1 sur 308'],
          figure: {
            value: '33 sur 10\u202f164',
            label: 'Fusions interdites par la Commission européenne, sur l’ensemble des opérations qui lui ont été notifiées',
            date: '21\u00a0septembre 1990 – 30\u00a0septembre 2026',
            sourceIndex: 1,
          },
          chart: { kind: 'part', value: 33, total: 10164, whole: 'opérations notifiées' },
        },
        {
          id: 'europe-concurrence-04',
          say: 'En 2019, elle a interdit le rachat d’Alstom par Siemens, les deux plus grands fournisseurs européens de trains et de signalisation ferroviaire. Selon elle, l’opération aurait réduit la concurrence.',
          spoken: 'En deux mille dix-neuf, elle a interdit le rachat d’Alstom par Siemens, les deux plus grands fournisseurs européens de trains et de signalisation ferroviaire. Selon elle, l’opération aurait réduit la concurrence.',
          visual: 'compare',
          draw: 'Deux trains au trait qui s’approchent pour s’accrocher, séparés par une barrière baissée\u202f; sous chacun, sa légende.',
          alt: 'Deux trains face à face, Alstom et Siemens, séparés par une barrière baissée.',
          emphasis: ['interdit le rachat'],
        },
        {
          id: 'europe-concurrence-05',
          say: 'L’Union a aussi ouvert d’anciens monopoles publics. Depuis le 1er\u00a0juillet 2007, vous pouvez choisir votre fournisseur d’électricité et de gaz.',
          spoken: 'L’Union a aussi ouvert d’anciens monopoles publics. Depuis le premier juillet deux mille sept, vous pouvez choisir votre fournisseur d’électricité et de gaz.',
          visual: 'timeline',
          draw: 'Une frise\u202f; au jalon 2007, un drapeau\u202f; au-dessus, une personne entre un compteur et un radiateur.',
          emphasis: ['choisir votre fournisseur'],
        },
        {
          id: 'europe-concurrence-06',
          say: 'Électricité\u00a0: fin juin 2026, 49\u00a0% des sites de consommation sont en offre de marché. Les autres restent au tarif réglementé, fixé par les pouvoirs publics. Celui du gaz a pris fin en 2023.',
          spoken: 'Électricité : fin juin deux mille vingt-six, quarante-neuf pour cent des sites de consommation sont en offre de marché. Les autres restent au tarif réglementé, fixé par les pouvoirs publics. Celui du gaz a pris fin en deux mille vingt-trois.',
          visual: 'compare',
          draw: 'Deux barres de même longueur, l’électricité et le gaz\u00a0: la part en offre de marché au bleu bille, le reste au tarif réglementé\u202f; celle du gaz entièrement en offre de marché.',
          alt: 'Deux barres sur 100\u00a0: l’électricité, 49 en offre de marché et le reste au tarif réglementé\u202f; le gaz, tout en offre de marché.',
          emphasis: ['49\u00a0%', 'en 2023'],
          figure: {
            value: '49\u00a0%',
            label: 'Part des sites de consommation d’électricité en offre de marché, dont 34\u00a0% chez un fournisseur autre que les fournisseurs historiques. Les autres sites restent au tarif réglementé. En volume, 77\u00a0% de l’électricité consommée passe par des offres de marché',
            date: '30\u00a0juin 2026',
            sourceIndex: 2,
          },
          chart: { kind: 'part', value: 49, total: 100, unit: '%', whole: 'des sites de consommation d’électricité' },
        },
        {
          id: 'europe-concurrence-07',
          say: 'Pour les trains financés par une autorité publique, comme les TER, des lots sont attribués après appel d’offres. Selon le régulateur, ceux déjà attribués représentent près de 20\u00a0% de l’offre nationale.',
          spoken: 'Pour les trains financés par une autorité publique, comme les T.E.R., des lots sont attribués après appel d’offres. Selon le régulateur, ceux déjà attribués représentent près de vingt pour cent de l’offre nationale.',
          visual: 'figure',
          draw: 'Un long train de dix voitures\u202f; deux se colorent au bleu bille.',
          alt: 'Un train de dix voitures, dont deux colorées.',
          emphasis: ['appel d’offres', 'près de 20\u00a0%'],
          figure: {
            value: 'près de 20\u00a0%',
            label: 'Part de l’offre nationale que représentent les lots de trains conventionnés (services financés par une autorité publique, comme les TER) déjà attribués après appel d’offres, selon le régulateur des transports',
            date: 'Juin 2026',
            sourceIndex: 4,
          },
          chart: { kind: 'part', value: 20, total: 100, unit: '%', whole: 'de l’offre nationale' },
        },
        {
          id: 'europe-concurrence-08',
          say: 'Les règles sur les fusions sont réexaminées en 2026. Alors, quelle place pour la concurrence dans le marché unique\u202f?',
          spoken: 'Les règles sur les fusions sont réexaminées en deux mille vingt-six. Alors, quelle place pour la concurrence dans le marché unique ?',
          visual: 'question',
          draw: 'Un texte de règles sous une loupe, et un point d’interrogation.',
          emphasis: ['réexaminées', 'quelle place'],
        },
      ],
      sources: [CONCURRENCE, FUSIONS, CRE_ELEC, CRE_GAZ, ART, ALSTOM],
    },
  ],
}
