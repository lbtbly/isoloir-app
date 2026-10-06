// Série « Écologie, énergie et transports » (famille « Écologie et territoires ») : l'introduction, puis cinq
// approfondissements (carburants, électricité, émissions et financement, transports, chaleur et eau). Chaque
// chiffre vient des fiches du thème (questions ecologie_energie-*, research/choisir-2027/explainers.json et
// explainer-charts.json). Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/ecologie_energie.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : prix des carburants au 25 septembre 2026, marge de raffinage de septembre 2026 (provisoire), bilans
// provisoires de l'été 2026, location aidée de voitures électriques en 2026, liaisons aériennes de l'été 2026.
// À revoir après octobre 2026.

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources, copiées des fiches du thème ——— */

const DGEC: VideoSource = {
  title: 'Cours, prix et marges des produits pétroliers en France et dans l’Union européenne (note hebdomadaire du 25\u00a0septembre 2026)',
  url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/NPG-2026.09.25.pdf',
  publisher: 'Ministère de la Transition écologique (DGEC)',
  date: '2026-09-25',
}

const GUIDE_FISCALITE: VideoSource = {
  title: 'Guide 2026 sur la fiscalité des énergies',
  url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/Guide%202026%20sur%20fiscalit%C3%A9%20des%20%C3%A9nergies.pdf',
  publisher: 'Ministère de la Transition écologique',
  date: '2026',
}

const HCFP: VideoSource = {
  title: 'Avis n°\u00a0HCFP-2026-5 relatif aux projets de lois de finances et de financement de la sécurité sociale pour l’année 2027',
  url: 'https://www.hcfp.fr/sites/default/files/2026-10/Avis%20HCFP%202026-5%20-%20PLF-PLFSS%202027.pdf',
  publisher: 'Haut Conseil des finances publiques',
  date: '2026-09-25',
}

const INSEE_CARBURANT: VideoSource = {
  title: 'Les dépenses de carburant pèsent davantage sur le budget des ménages ruraux (Insee Première n°\u00a02125)',
  url: 'https://www.insee.fr/fr/statistiques/9037833',
  publisher: 'Insee',
  date: '2026-09-08',
}

const RTE_PRODUCTION: VideoSource = {
  title: 'Bilan électrique 2025\u00a0: production',
  url: 'https://analysesetdonnees.rte-france.com/bilan-electrique-2025/production',
  publisher: 'RTE',
  date: '2026',
}

const RTE_SYNTHESE: VideoSource = {
  title: 'Bilan électrique 2025\u00a0: synthèse',
  url: 'https://analysesetdonnees.rte-france.com/bilan-electrique-2025/synthese',
  publisher: 'RTE',
  date: '2026',
}

const RTE_PRIX: VideoSource = {
  title: 'Bilan électrique 2025\u00a0: prix',
  url: 'https://analysesetdonnees.rte-france.com/bilan-electrique-2025/prix',
  publisher: 'RTE',
  date: '2026',
}

const CRE_RESEAUX: VideoSource = {
  title: 'Présentation des réseaux d’électricité',
  url: 'https://www.cre.fr/electricite/reseaux-delectricite/presentation-des-reseaux-delectricite.html',
  publisher: 'Commission de régulation de l’énergie (CRE)',
  date: '2024-04-10',
}

const COMMISSION_MARCHE: VideoSource = {
  title: 'Questions et réponses sur la réforme de l’organisation du marché de l’électricité',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/qanda_24_2260',
  publisher: 'Commission européenne',
  date: '2024-05-21',
}

const COUR_EPR: VideoSource = {
  title: 'La filière EPR\u00a0: une dynamique nouvelle, des risques persistants',
  url: 'https://www.ccomptes.fr/sites/default/files/2025-01/20250114-La-filiere-EPR--une-dynamique-nouvelle-des-risques-persistants_0.pdf',
  publisher: 'Cour des comptes',
  date: '2025-01-14',
}

const CITEPA: VideoSource = {
  title: 'Rapport Secten 2026 – Synthèse et messages clés',
  url: 'https://www.citepa.org/wp-content/uploads/2026/06/Synthese-et-messages-cles-Secten-2026.pdf',
  publisher: 'Citepa',
  date: '2026-06-16',
}

const SNBC: VideoSource = {
  title: 'Stratégie nationale bas-carbone n°\u00a03 – Partie\u00a01 (version de juillet 2026)',
  url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/SNBC3-Partie1-Juillet2026.pdf',
  publisher: 'Ministère de la Transition écologique',
  date: '2026-07',
}

const HCC_RESUME: VideoSource = {
  title: 'Rapport annuel 2026 «\u00a0Dangers climatiques\u00a0: la France face à ses responsabilités\u00a0» – Résumé exécutif et recommandations',
  url: 'https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf',
  publisher: 'Haut Conseil pour le climat',
  date: '2026-07-09',
}

const HCC_SECTEURS: VideoSource = {
  title: 'Rapport annuel 2026 – Chapitre\u00a04\u00a0: suivi des émissions et des politiques publiques par secteur',
  url: 'https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf',
  publisher: 'Haut Conseil pour le climat',
  date: '2026-07-09',
}

const FRANCE_STRATEGIE: VideoSource = {
  title: 'Les incidences économiques de l’action pour le climat (rapport à la Première ministre)',
  url: 'https://www.strategie-plan.gouv.fr/publications/incidences-economiques-de-laction-climat',
  publisher: 'France Stratégie (aujourd’hui Haut-commissariat à la Stratégie et au Plan)',
  date: '2023-05-22',
}

const ART_FERROVIAIRE: VideoSource = {
  title: 'Marché français du transport ferroviaire – Premiers chiffres 2025',
  url: 'https://www.autorite-transports.fr/wp-content/uploads/2026/07/art-bilan-ferroviaire-france-premiers-chiffres-2025.pdf',
  publisher: 'Autorité de régulation des transports',
  date: '2026-07',
}

const ART_AUTOROUTES: VideoSource = {
  title: 'Synthèse des comptes des sociétés concessionnaires d’autoroutes – exercice 2024',
  url: 'https://www.autorite-transports.fr/wp-content/uploads/2025/12/synthese_des_comptes_sca_2024.pdf',
  publisher: 'Autorité de régulation des transports',
  date: '2025-12',
}

const VOLS_COURTS: VideoSource = {
  title: 'Interdiction liaisons de moins de 2\u00a0h\u00a030',
  url: 'https://www.ecologie.gouv.fr/politiques-publiques/interdiction-liaisons-moins-2h30',
  publisher: 'Ministère de la Transition écologique',
  date: '2026-04-14',
}

const METEO_FRANCE: VideoSource = {
  title: 'Bilan climatique de l’été 2026 (juin-juillet-août)',
  url: 'https://meteofrance.com/presse/bilan-climatique-de-lete-2026-juin-juillet-aout',
  publisher: 'Météo-France',
  date: '2026-09-03',
}

const SANTE_PUBLIQUE: VideoSource = {
  title: 'Canicule et santé\u00a0: excès de mortalité durant l’épisode de canicule du 27\u00a0juillet au 20\u00a0août 2026',
  url: 'https://www.santepubliquefrance.fr/climat/fortes-chaleurs-canicule/bulletin-national/canicule-et-sante-exces-de-mortalite-durant-lepisode-de-canicule-du-27-juillet-au-20-aout-2026',
  publisher: 'Santé publique France',
  date: '2026-09-16',
}

const COUR_CATNAT_SYNTHESE: VideoSource = {
  title: 'L’assurance des catastrophes naturelles\u00a0: un enjeu de soutenabilité financière (synthèse)',
  url: 'https://www.ccomptes.fr/sites/default/files/2026-04/20260427-synthese-Assurance-des-catastrophes-naturelles.pdf',
  publisher: 'Cour des comptes',
  date: '2026-04-27',
}

const COUR_CATNAT: VideoSource = {
  title: 'L’assurance des catastrophes naturelles\u00a0: un enjeu de soutenabilité financière',
  url: 'https://www.ccomptes.fr/fr/publications/lassurance-des-catastrophes-naturelles-un-enjeu-de-soutenabilite-financiere',
  publisher: 'Cour des comptes',
  date: '2026-04-27',
}

const SDES_EAU: VideoSource = {
  title: 'L’eau en France\u00a0: ressource et utilisation – Extrait du Bilan environnemental 2024',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/leau-en-france-ressource-et-utilisation-synthese-des-connaissances-en-2024',
  publisher: 'SDES, ministère de la Transition écologique',
  date: '2025-02-04',
}

const SISPEA: VideoSource = {
  title: 'Observatoire des services publics d’eau et d’assainissement – Rapport national 2026 (données 2024), version complète',
  url: 'https://www.services.eaufrance.fr/cms/uploads/Rapport_Sispea_2024_VF_79c80d7b71.pdf',
  publisher: 'Office français de la biodiversité (Sispea)',
  date: '2026-06',
}

/* ——— Les chiffres repris dans plusieurs vidéos ——— */

const GAZOLE = {
  value: '2,37\u00a0€ le litre',
  label:
    'Prix moyen du gazole à la pompe le vendredi 25\u00a0septembre 2026 (237,06\u00a0centimes par litre), en hausse de 46,6\u00a0% sur un an. Hors taxes, il vaut 136,8\u00a0centimes\u00a0: 108,3 pour le produit raffiné au cours international et 28,5 pour le transport, la distribution et la marge des distributeurs. SP95-E10\u00a0: 214,24\u00a0centimes (+26,2\u00a0%). France métropolitaine hors Corse',
  date: '25 septembre 2026',
}

const NUCLEAIRE = {
  value: '68,1\u00a0%',
  label:
    'Part du nucléaire dans la production d’électricité en 2025 (373,0\u00a0TWh), France métropolitaine. Elle a varié entre 63 et 77\u00a0% sur les dix dernières années',
  date: '2025',
}

const NUCLEAIRE_CHART = { kind: 'part', value: 68.1, total: 100, unit: '%', whole: 'de la production d’électricité' }

export const ECOLOGIE_ENERGIE: VideoSeries = {
  topicId: 'ecologie_energie',
  familyId: 'ecologie',
  label: 'Écologie, énergie et transports',
  videos: [
    {
      id: 'ecologie-intro',
      kind: 'intro',
      questionIds: ['ecologie_energie-1', 'ecologie_energie-2', 'ecologie_energie-5', 'ecologie_energie-x2'],
      title: 'Écologie, énergie, transports\u00a0: l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-intro-01',
          say: 'Faire le plein, payer l’électricité, traverser un été de canicule\u00a0: l’énergie et le climat sont dans votre quotidien. Où en est la France\u202f?',
          visual: 'hook',
          draw: 'Trois pictogrammes au trait, chacun quand la voix le dit\u00a0: une pompe à essence, une ampoule, un thermomètre sous le soleil\u202f; au-dessus, la question.',
          emphasis: ['Où en est la France'],
        },
        {
          id: 'ecologie-intro-02',
          say: 'Le 25\u00a0septembre 2026, le litre de gazole coûtait en moyenne 2,37\u00a0euros à la pompe. C’est 46,6\u00a0% de plus qu’un an plus tôt.',
          spoken: 'Le vingt-cinq septembre deux mille vingt-six, le litre de gazole coûtait en moyenne deux euros trente-sept à la pompe. C’est quarante-six virgule six pour cent de plus qu’un an plus tôt.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle\u00a0: le prix d’un an plus tôt, prolongé en pointillé de la hausse, puis celui du 25\u00a0septembre 2026.',
          alt: 'Deux barres à la même échelle\u00a0: le prix d’un an plus tôt, prolongé en pointillé de la hausse, puis celui du 25\u00a0septembre 2026.',
          emphasis: ['2,37\u00a0euros', '46,6\u00a0%'],
          figure: { ...GAZOLE, sourceIndex: 0 },
        },
        {
          id: 'ecologie-intro-03',
          say: 'L’électricité, elle, vient surtout du nucléaire\u00a0: 68,1\u00a0% de la production de la métropole en 2025. Les renouvelables en fournissent 27\u00a0%.',
          spoken: 'L’électricité, elle, vient surtout du nucléaire : soixante-huit virgule un pour cent de la production de la métropole en deux mille vingt-cinq. Les renouvelables en fournissent vingt-sept pour cent.',
          visual: 'figure',
          draw: 'Une barre, toute la production d’électricité de l’année\u00a0: la part du nucléaire se compte au bleu bille, puis celle des renouvelables se grise à sa suite.',
          alt: 'Une barre, toute la production d’électricité\u00a0: la part du nucléaire, puis celle des renouvelables.',
          emphasis: ['68,1\u00a0%', '27\u00a0%'],
          figure: { ...NUCLEAIRE, sourceIndex: 1 },
          chart: NUCLEAIRE_CHART,
        },
        {
          id: 'ecologie-intro-04',
          say: 'En 2025, la France a émis 359\u00a0millions de tonnes de gaz à effet de serre. La baisse ralentit\u00a0: −3\u00a0% en 2024, −2,1\u00a0% en 2025.',
          spoken: 'En deux mille vingt-cinq, la France a émis trois cent cinquante-neuf millions de tonnes de gaz à effet de serre. La baisse ralentit : moins trois pour cent en deux mille vingt-quatre, moins deux virgule un pour cent en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Deux colonnes qui descendent d’une même ligne, 2024 puis 2025, à la même échelle\u00a0: la seconde moins profonde que la première.',
          alt: 'Deux baisses à la même échelle, en 2024 puis en 2025.',
          emphasis: ['359\u00a0millions', 'ralentit'],
          figure: {
            value: '359\u00a0Mt CO₂e',
            label:
              'Émissions de gaz à effet de serre de la France (Hexagone et outre-mer de l’UE), en millions de tonnes d’équivalent CO₂. Ce total ne déduit pas le CO₂ absorbé par les forêts et les sols. Il a baissé de 2,1\u00a0% sur un an, après −3,0\u00a0% en 2024',
            date: '2025 (pré-estimation)',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Évolution en 2024', value: -3 },
              { label: 'Évolution en 2025', value: -2.1 },
            ],
          },
        },
        {
          id: 'ecologie-intro-05',
          say: 'Alors, cinq questions se posent. Que faire face au prix des carburants\u202f? Quelle électricité, et à quel prix\u202f? Comment baisser les émissions, et avec quel argent\u202f? Comment se déplacer\u202f? Et comment s’adapter à la chaleur et au manque d’eau\u202f?',
          visual: 'question',
          draw: 'Cinq pictogrammes en grille, chacun avec sa question, dessinés quand la voix la pose\u00a0: une pompe à essence, une ampoule, une cheminée d’usine, un train, une goutte d’eau.',
          emphasis: ['prix des carburants', 'Quelle électricité', 'baisser les émissions'],
        },
        {
          id: 'ecologie-intro-06',
          say: 'Ce sont les sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les cinq pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [DGEC, RTE_PRODUCTION, CITEPA],
    },
    {
      id: 'ecologie-carburants',
      kind: 'deep',
      questionIds: ['ecologie_energie-1'],
      title: 'Le prix des carburants',
      short: 'Carburants',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-carburants-01',
          say: 'Vous faites le plein. Dans le prix du litre, quelle part pour le carburant, et quelle part pour les taxes\u202f?',
          visual: 'hook',
          draw: 'Une pompe à essence au trait\u202f; à côté, un litre partagé par un pointillé, le carburant en bas, les taxes en haut, et un point d’interrogation.',
          emphasis: ['le carburant', 'les taxes'],
        },
        {
          id: 'ecologie-carburants-02',
          say: 'Hors Corse et outre-mer, le prix à la pompe additionne le carburant hors taxes et deux taxes. L’accise, un montant fixe\u00a0: 60,75\u00a0centimes par litre de gazole. Et la TVA, de 20\u00a0%, qui s’applique aussi à l’accise.',
          spoken: 'Hors Corse et outre-mer, le prix à la pompe additionne le carburant hors taxes et deux taxes. L’accise, un montant fixe : soixante virgule soixante-quinze centimes par litre de gazole. Et la T.V.A., de vingt pour cent, qui s’applique aussi à l’accise.',
          visual: 'point',
          draw: 'Trois cases reliées par des «\u00a0+\u00a0»\u00a0: le carburant hors taxes, l’accise et son montant, la TVA et son taux\u202f; une accolade au-dessus, le prix à la pompe.',
          alt: 'Trois cases\u00a0: hors taxes, plus l’accise, plus la TVA.',
          emphasis: ['L’accise', 'la TVA'],
        },
        {
          id: 'ecologie-carburants-03',
          say: 'Prenons le 25\u00a0septembre 2026\u00a0: 2,37\u00a0euros le litre de gazole. Hors taxes, 136,8\u00a0centimes, dont 108,3 pour le produit raffiné. Les taxes font le reste, un peu plus d’un euro.',
          spoken: 'Prenons le vingt-cinq septembre deux mille vingt-six : deux euros trente-sept le litre de gazole. Hors taxes, cent trente-six virgule huit centimes, dont cent huit virgule trois pour le produit raffiné. Les taxes font le reste, un peu plus d’un euro.',
          visual: 'figure',
          draw: 'Une barre, le prix d’un litre à l’échelle\u00a0: le produit raffiné, le reste du prix hors taxes, puis les taxes au bleu bille, chacun sous son accolade.',
          alt: 'Une barre du prix d’un litre, à l’échelle\u00a0: le produit raffiné, le reste du prix hors taxes, puis les taxes.',
          emphasis: ['136,8\u00a0centimes', '108,3', 'un peu plus d’un euro'],
          figure: { ...GAZOLE, sourceIndex: 1 },
          chart: {
            kind: 'compare',
            unit: 'centimes par litre',
            items: [
              { label: 'Prix à la pompe', value: 237.06 },
              { label: 'Prix hors taxes', value: 136.8 },
              { label: 'Dont produit raffiné', value: 108.3 },
            ],
          },
        },
        {
          id: 'ecologie-carburants-04',
          say: 'Depuis mars 2026, la hausse du pétrole se répercute à la pompe. Le baril de Brent, la référence en Europe, a coûté 94\u00a0dollars en moyenne de mars à mi-septembre, 33 de plus qu’au début de l’année.',
          spoken: 'Depuis mars deux mille vingt-six, la hausse du pétrole se répercute à la pompe. Le baril de Brent, la référence en Europe, a coûté quatre-vingt-quatorze dollars en moyenne de mars à mi-septembre, trente-trois de plus qu’au début de l’année.',
          visual: 'figure',
          draw: 'Un baril au trait\u202f; deux barres à la même échelle, le prix du début de l’année, prolongé en pointillé de la hausse, puis celui de mars à mi-septembre.',
          alt: 'Deux barres à la même échelle\u00a0: au début de l’année, prolongée en pointillé de la hausse, puis de mars à mi-septembre.',
          emphasis: ['94\u00a0dollars', '33 de plus'],
          figure: {
            value: '94\u00a0$ le baril',
            label:
              'Prix moyen du Brent, pétrole brut de référence en Europe, de mars à mi-septembre 2026, soit 33\u00a0$ de plus qu’au début de l’année, sur fond de conflit au Moyen-Orient',
            date: 'mars à mi-septembre 2026',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecologie-carburants-05',
          say: 'Et le raffinage\u202f? Sa marge brute valait 37,26\u00a0dollars par baril en septembre, contre 23,17 en moyenne sur 2026. Un indicateur du ministère de la Transition écologique, pas la marge réelle de chaque raffinerie.',
          spoken: 'Et le raffinage ? Sa marge brute valait trente-sept virgule vingt-six dollars par baril en septembre, contre vingt-trois virgule dix-sept en moyenne sur deux mille vingt-six. Un indicateur du ministère de la Transition écologique, pas la marge réelle de chaque raffinerie.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, en dollars par baril\u00a0: la marge brute de raffinage de septembre 2026, au bleu bille, puis sa moyenne sur 2026.',
          alt: 'Deux barres à la même échelle\u00a0: septembre 2026 (provisoire), 37,26\u00a0$\u202f; moyenne 2026, 23,17\u00a0$.',
          emphasis: ['37,26\u00a0dollars', '23,17'],
          figure: {
            value: '37,26\u00a0$ par baril',
            label:
              'Marge brute de raffinage en septembre 2026 (données provisoires), soit 20,3\u00a0centimes par litre, contre 23,17\u00a0$ (12,6\u00a0centimes) en moyenne sur 2026. Cet indicateur de la DGEC compare la valeur d’un panier de produits raffinés au prix du Brent\u202f; il diffère de la marge réelle de chaque raffinerie',
            date: 'septembre 2026 (provisoire)',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '$ par baril',
            items: [
              { label: 'Septembre 2026 (provisoire)', value: 37.26 },
              { label: 'Moyenne 2026', value: 23.17 },
            ],
          },
        },
        {
          id: 'ecologie-carburants-06',
          say: 'Un poids inégal. En 2021, 10,6\u00a0% des ménages avec voiture ont consacré au carburant plus d’un mois de revenu. Dans les intercommunalités rurales, 13,5\u00a0%\u202f; dans les urbaines, 9\u00a0%.',
          spoken: 'Un poids inégal. En deux mille vingt et un, dix virgule six pour cent des ménages avec voiture ont consacré au carburant plus d’un mois de revenu. Dans les intercommunalités rurales, treize virgule cinq pour cent ; dans les urbaines, neuf pour cent.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle\u00a0: l’ensemble des ménages avec voiture, puis les intercommunalités rurales, puis les urbaines.',
          alt: 'Trois barres à la même échelle\u00a0: ménages avec voiture, 10,6\u00a0%\u202f; intercommunalités rurales, 13,5\u00a0%\u202f; urbaines, 9\u00a0%.',
          emphasis: ['10,6\u00a0%', '13,5\u00a0%', '9\u00a0%'],
          figure: {
            value: '10,6\u00a0%',
            label:
              'Part des ménages avec voiture qui ont consacré plus d’un mois de revenu annuel au carburant en 2021, soit 2,2\u00a0millions de ménages (13,5\u00a0% dans les intercommunalités rurales, 9,0\u00a0% dans les urbaines). Avec les prix du printemps 2026 appliqués aux revenus de 2021, cette part aurait été de 22,4\u00a0% (4,7\u00a0millions). France hors Mayotte',
            date: '2021',
            sourceIndex: 3,
          },
        },
        {
          id: 'ecologie-carburants-07',
          say: 'Alors, face à la hausse des carburants, quelle réponse, et pour qui\u202f?',
          visual: 'question',
          draw: 'La pompe à essence du début, et un point d’interrogation à côté.',
          emphasis: ['quelle réponse', 'pour qui'],
        },
      ],
      sources: [GUIDE_FISCALITE, DGEC, HCFP, INSEE_CARBURANT],
    },
    {
      id: 'ecologie-electricite',
      kind: 'deep',
      questionIds: ['ecologie_energie-2', 'ecologie_energie-3'],
      title: 'Quelle électricité, et à quel prix\u202f?',
      short: 'Électricité',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-electricite-01',
          say: 'Vous allumez la lumière. Qui a produit cette électricité, et comment son prix est-il fixé\u202f?',
          visual: 'hook',
          draw: 'Une ampoule au trait qui s’allume\u202f; un fil la relie, d’un côté, à une centrale et une éolienne, de l’autre, à une étiquette de prix vierge.',
          emphasis: ['Qui a produit', 'son prix'],
        },
        {
          id: 'ecologie-electricite-02',
          say: 'En 2025, le nucléaire a produit 68,1\u00a0% de l’électricité de la métropole. Sur les dix dernières années, cette part a varié entre 63 et 77\u00a0%.',
          spoken: 'En deux mille vingt-cinq, le nucléaire a produit soixante-huit virgule un pour cent de l’électricité de la métropole. Sur les dix dernières années, cette part a varié entre soixante-trois et soixante-dix-sept pour cent.',
          visual: 'figure',
          draw: 'Une réglette de 0 à 100\u00a0%\u00a0: la plage de 63 à 77\u00a0% grisée, un drapeau au bleu bille planté à 68,1.',
          alt: 'Sur une réglette de 0 à 100\u00a0%, la plage des dix dernières années, de 63 à 77\u00a0%, et un drapeau pour 2025.',
          emphasis: ['68,1\u00a0%', 'entre 63 et 77\u00a0%'],
          figure: { ...NUCLEAIRE, sourceIndex: 0 },
          chart: NUCLEAIRE_CHART,
        },
        {
          id: 'ecologie-electricite-03',
          say: 'Pour six nouveaux réacteurs EPR2, EDF chiffrait fin 2023 la construction à 67,4\u00a0milliards d’euros de 2020, hors frais de financement. C’est 30\u00a0% de plus que le chiffrage de 2022.',
          spoken: 'Pour six nouveaux réacteurs E.P.R. deux, E.D.F. chiffrait fin deux mille vingt-trois la construction à soixante-sept virgule quatre milliards d’euros de deux mille vingt, hors frais de financement. C’est trente pour cent de plus que le chiffrage de deux mille vingt-deux.',
          visual: 'figure',
          draw: 'Deux colonnes à la même échelle, le chiffrage de 2022 et celui de fin 2023, une flèche au bleu bille de l’une à l’autre.',
          alt: 'Deux colonnes à la même échelle\u00a0: 51,7\u00a0milliards pour le chiffrage de 2022, 67,4 pour celui de fin 2023.',
          emphasis: ['67,4\u00a0milliards', '30\u00a0%'],
          figure: {
            value: '67,4\u00a0Md€',
            label:
              'Coût de construction estimé de six réacteurs EPR2 (trois paires), en euros de 2020 et hors frais de financement, selon le chiffrage d’EDF de fin 2023\u00a0: +30\u00a0% par rapport aux 51,7\u00a0Md€ de 2022. En euros de 2023\u00a0: 79,9\u00a0Md€. Ce chiffrage prévoyait la mise en service du premier réacteur, à Penly, en juillet 2038',
            date: 'fin 2023',
            sourceIndex: 1,
          },
          chart: {
            kind: 'series',
            unit: 'Md€ de 2020',
            items: [
              { label: 'Chiffrage 2022', value: 51.7 },
              { label: 'Chiffrage fin 2023', value: 67.4 },
            ],
          },
        },
        {
          id: 'ecologie-electricite-04',
          say: 'Les renouvelables ont fourni 27\u00a0% de l’électricité en 2025, contre 27,9\u00a0% en 2024. Le solaire progresse\u00a0: 30,4\u00a0gigawatts installés fin 2025, désormais plus que l’hydraulique.',
          spoken: 'Les renouvelables ont fourni vingt-sept pour cent de l’électricité en deux mille vingt-cinq, contre vingt-sept virgule neuf pour cent en deux mille vingt-quatre. Le solaire progresse : trente virgule quatre gigawatts installés fin deux mille vingt-cinq, désormais plus que l’hydraulique.',
          visual: 'figure',
          draw: 'Un soleil et une goutte d’eau au trait\u202f; deux barres à la même échelle, la puissance solaire au bleu bille, puis l’hydraulique.',
          alt: 'Deux barres à la même échelle\u00a0: le solaire fin 2025, 30,4\u00a0GW, et l’hydraulique, 25,7\u00a0GW.',
          emphasis: ['27\u00a0%', '30,4\u00a0gigawatts'],
          figure: {
            value: '30,4\u00a0GW',
            label: 'Puissance solaire installée fin 2025 (+5,9\u00a0GW en un an), désormais supérieure à celle des installations hydrauliques (25,7\u00a0GW)',
            date: '31 décembre 2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: 'GW',
            items: [
              { label: 'Solaire (fin 2025)', value: 30.4 },
              { label: 'Hydraulique', value: 25.7 },
            ],
          },
        },
        {
          id: 'ecologie-electricite-05',
          say: 'Le nucléaire produit sans dépendre du vent ni du soleil, mais il est long et coûteux à bâtir. Les renouvelables s’installent vite, mais leur production varie avec la météo.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: une centrale sur un plateau, une éolienne et un soleil sur l’autre, chacun nommé quand la voix le dit.',
          emphasis: ['Le nucléaire', 'Les renouvelables'],
        },
        {
          id: 'ecologie-electricite-06',
          say: 'Sur le marché européen de gros, tous les producteurs reçoivent le même prix\u00a0: celui de la dernière offre retenue pour couvrir la demande. En France, 61\u00a0euros le mégawattheure en moyenne en 2025.',
          spoken: 'Sur le marché européen de gros, tous les producteurs reçoivent le même prix : celui de la dernière offre retenue pour couvrir la demande. En France, soixante et un euros le mégawattheure en moyenne en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Des offres en escalier, de la moins chère à la plus chère, jusqu’à la ligne de la demande\u202f; le prix de la dernière retenue se tire au bleu bille au-dessus de toutes.',
          alt: 'Des offres rangées de la moins chère à la plus chère, jusqu’à couvrir la demande\u00a0: toutes reçoivent le prix de la dernière retenue.',
          emphasis: ['le même prix', '61\u00a0euros'],
          figure: {
            value: '61\u00a0€/MWh',
            label:
              'Prix moyen de l’électricité sur le marché de gros (prix «\u00a0spot\u00a0») en France en 2025. Il était de 58\u00a0€/MWh en 2024, de 275,9\u00a0€/MWh en 2022 au plus fort de la crise et de 39,4\u00a0€/MWh en 2019',
            date: '2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'series',
            unit: '€/MWh',
            items: [
              { label: '2019', value: 39.4 },
              { label: '2022', value: 275.9 },
              { label: '2024', value: 58 },
              { label: '2025', value: 61 },
            ],
          },
        },
        {
          id: 'ecologie-electricite-07',
          say: 'Selon RTE, qui gère le réseau, le gaz a pu fixer ce prix environ 30\u00a0% du temps en mars et en novembre 2025. Ses centrales ont produit environ 3\u00a0% de l’électricité de l’année.',
          spoken: 'Selon R.T.E., qui gère le réseau, le gaz a pu fixer ce prix environ trente pour cent du temps en mars et en novembre deux mille vingt-cinq. Ses centrales ont produit environ trois pour cent de l’électricité de l’année.',
          visual: 'figure',
          draw: 'Deux grilles de cent cases\u00a0: trente comptées au bleu bille pour le temps où le gaz a pu fixer le prix, trois pour sa part de la production.',
          alt: 'Deux grilles de cent cases\u00a0: le temps où le gaz a pu fixer le prix\u202f; sa part de la production d’électricité.',
          emphasis: ['30\u00a0%', '3\u00a0%'],
          figure: {
            value: 'Environ 30\u00a0% du temps',
            label:
              'En mars et en novembre 2025, deux mois étudiés par RTE, le prix spot a dépassé le coût variable minimal des centrales à gaz environ 30\u00a0% du temps\u00a0: pour RTE, un indice du temps où le gaz a pu fixer le prix (barrages et batteries peuvent aussi caler leurs offres sur le prix du gaz). Ces centrales ont produit environ 3\u00a0% de l’électricité en 2025. Depuis mi-2024, les prix à terme annuels français restent sous leurs coûts variables',
            date: 'mars et novembre 2025',
            sourceIndex: 3,
          },
          chart: { kind: 'part', value: 30, total: 100, unit: '%', whole: 'du temps, mars et novembre 2025' },
        },
        {
          id: 'ecologie-electricite-08',
          say: 'Une réforme européenne de 2024 vise des prix plus stables. Alors, quelle électricité produire, et comment en fixer le prix\u202f?',
          spoken: 'Une réforme européenne de deux mille vingt-quatre vise des prix plus stables. Alors, quelle électricité produire, et comment en fixer le prix ?',
          visual: 'question',
          draw: 'L’ampoule du début près d’une étiquette de prix vierge\u202f; la question et son point d’interrogation quand la voix la pose.',
          emphasis: ['quelle électricité', 'le prix'],
        },
      ],
      sources: [RTE_PRODUCTION, COUR_EPR, RTE_SYNTHESE, RTE_PRIX, CRE_RESEAUX, COMMISSION_MARCHE],
    },
    {
      id: 'ecologie-climat',
      kind: 'deep',
      questionIds: ['ecologie_energie-5', 'ecologie_energie-4'],
      title: 'Baisser les émissions, et le financer',
      short: 'Émissions et financement',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-climat-01',
          say: 'Pour le climat, la France s’est fixé une trajectoire de baisse des émissions. Où en est-elle, et comment la financer\u202f?',
          visual: 'hook',
          draw: 'Une trajectoire en pointillé qui descend\u202f; un point posé dessus, un point d’interrogation, et une tirelire au bout.',
          emphasis: ['une trajectoire', 'comment la financer'],
        },
        {
          id: 'ecologie-climat-02',
          say: 'C’est la stratégie nationale bas-carbone. Elle fixe des budgets carbone, des plafonds d’émissions sur cinq ans. Pour 2024 à 2028\u00a0: 342\u00a0millions de tonnes d’équivalent CO₂ par an, en moyenne.',
          spoken: 'C’est la stratégie nationale bas-carbone. Elle fixe des budgets carbone, des plafonds d’émissions sur cinq ans. Pour deux mille vingt-quatre à deux mille vingt-huit : trois cent quarante-deux millions de tonnes d’équivalent C.O. deux par an, en moyenne.',
          visual: 'figure',
          draw: 'Une frise de cinq années, de 2024 à 2028, sous un plafond hachuré au bleu bille\u202f; une accolade embrasse les cinq ans.',
          alt: 'Une frise de cinq années, de 2024 à 2028, sous un plafond.',
          emphasis: ['budgets carbone', '342\u00a0millions'],
          figure: {
            value: '342\u00a0Mt CO₂e par an',
            label:
              'Budget carbone 2024-2028\u00a0: plafond moyen d’émissions par an retenu par la troisième stratégie nationale bas-carbone (version de juillet 2026), en millions de tonnes d’équivalent CO₂',
            date: 'version de juillet 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'ecologie-climat-03',
          say: 'Selon le Haut Conseil pour le climat, tenir ce budget demande plus de 4\u00a0% de baisse par an de 2026 à 2028. Au moins le double du rythme de 2025\u00a0: −2,1\u00a0%.',
          spoken: 'Selon le Haut Conseil pour le climat, tenir ce budget demande plus de quatre pour cent de baisse par an de deux mille vingt-six à deux mille vingt-huit. Au moins le double du rythme de deux mille vingt-cinq : moins deux virgule un pour cent.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle\u00a0: la baisse demandée chaque année de 2026 à 2028, au bleu bille, ouverte au bout, puis celle de 2025.',
          alt: 'Deux barres à la même échelle\u00a0: la baisse demandée de 2026 à 2028, plus de 4\u00a0% par an, puis celle de 2025, −2,1\u00a0%.',
          emphasis: ['plus de 4\u00a0%', 'le double'],
          figure: {
            value: 'plus de 4\u00a0% par an',
            label: 'Baisse moyenne des émissions nécessaire chaque année de 2026 à 2028\u00a0: au moins le double du rythme de 2025, pour respecter le budget carbone 2024-2028',
            date: '2026-2028 (évaluation de juillet 2026)',
            sourceIndex: 1,
          },
        },
        {
          id: 'ecologie-climat-04',
          say: 'Centrales, industrie et vols intra-européens relèvent d’un marché européen du carbone\u00a0: un quota par tonne émise. En 2025, leurs émissions ont baissé de 14\u00a0%, aussi parce que l’industrie a moins produit. Les autres, de 0,4\u00a0%.',
          spoken: 'Centrales, industrie et vols intra-européens relèvent d’un marché européen du carbone : un quota par tonne émise. En deux mille vingt-cinq, leurs émissions ont baissé de quatorze pour cent, aussi parce que l’industrie a moins produit. Les autres, de zéro virgule quatre pour cent.',
          visual: 'figure',
          draw: 'Une cheminée d’usine au trait\u202f; deux barres de baisse à la même échelle, les émissions soumises au marché du carbone au bleu bille, puis les autres.',
          alt: 'Deux barres à la même échelle\u00a0: les émissions soumises au marché du carbone, −14\u00a0%, et les autres, −0,4\u00a0%.',
          emphasis: ['un quota', '14\u00a0%'],
          figure: {
            value: '−14\u00a0%',
            label:
              'Évolution des émissions soumises au marché européen du carbone (centrales électriques et de chaleur, industrie, vols intra-européens), contre −0,4\u00a0% pour les autres émissions. Dans l’industrie, la baisse tient aussi à un recul de la production',
            date: '2025',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Soumises au marché du carbone', value: -14 },
              { label: 'Autres émissions', value: -0.4 },
            ],
          },
        },
        {
          id: 'ecologie-climat-05',
          say: 'Les investissements pour le climat ont progressé de 50\u00a0% en dix ans, puis reculé de 5\u00a0% en 2024. Selon le Haut Conseil pour le climat, ils devraient presque doubler d’ici 2030.',
          spoken: 'Les investissements pour le climat ont progressé de cinquante pour cent en dix ans, puis reculé de cinq pour cent en deux mille vingt-quatre. Selon le Haut Conseil pour le climat, ils devraient presque doubler d’ici deux mille trente.',
          visual: 'figure',
          draw: 'Une ligne qui monte sur dix ans, fléchit en 2024 au bleu bille, puis repart en pointillé vers le double, d’ici 2030.',
          alt: 'Une ligne\u00a0: la hausse sur dix ans, le recul de 2024, puis, en pointillé, presque le double d’ici 2030.',
          emphasis: ['5\u00a0%', 'presque doubler'],
          figure: {
            value: '−5\u00a0%',
            label:
              'Évolution en 2024 des investissements publics et privés en faveur du climat, après +50\u00a0% en dix ans (en euros constants). Selon le Haut Conseil pour le climat (HCC), ils devraient presque doubler d’ici 2030',
            date: '2024',
            sourceIndex: 1,
          },
        },
        {
          id: 'ecologie-climat-06',
          say: 'En 2023, un rapport de France Stratégie chiffrait le besoin à plus de 2\u00a0points de PIB d’investissements supplémentaires en 2030. Il citait trois leviers\u00a0: redéployer des dépenses défavorables au climat, emprunter, relever les prélèvements obligatoires.',
          spoken: 'En deux mille vingt-trois, un rapport de France Stratégie chiffrait le besoin à plus de deux points de P.I.B. d’investissements supplémentaires en deux mille trente. Il citait trois leviers : redéployer des dépenses défavorables au climat, emprunter, relever les prélèvements obligatoires.',
          visual: 'figure',
          draw: 'Trois leviers au trait, côte à côte\u00a0: des pièces pour les dépenses redéployées, un billet pour l’emprunt, un document pour les prélèvements.',
          alt: 'Trois leviers\u00a0: dépenses, emprunt, prélèvements.',
          emphasis: ['plus de 2\u00a0points', 'trois leviers'],
          figure: {
            value: 'Plus de 2\u00a0points de PIB',
            label: 'Investissements supplémentaires nécessaires en 2030 pour réduire les émissions, par rapport à un scénario sans action climatique (estimation de 2023)',
            date: 'mai 2023',
            sourceIndex: 2,
          },
        },
        {
          id: 'ecologie-climat-07',
          say: 'Côté budget, fin 2025, la dette publique atteint 115,7\u00a0% du PIB, la richesse produite en un an. Selon les règles européennes, la France doit ramener son déficit sous 3\u00a0% d’ici 2029.',
          spoken: 'Côté budget, fin deux mille vingt-cinq, la dette publique atteint cent quinze virgule sept pour cent du P.I.B., la richesse produite en un an. Selon les règles européennes, la France doit ramener son déficit sous trois pour cent d’ici deux mille vingt-neuf.',
          visual: 'figure',
          draw: 'Trois colonnes de dette à la même échelle\u00a0: 2025 au trait plein, 2026 et 2027 en pointillé, des prévisions\u202f; au-dessus, la valeur de chacune.',
          alt: 'Trois colonnes à la même échelle\u00a0: 115,7\u00a0% en 2025, puis, en pointillé, les prévisions du Gouvernement, 119,3\u00a0% en 2026 et 121,7\u00a0% en 2027.',
          emphasis: ['115,7\u00a0%', 'sous 3\u00a0%'],
          figure: {
            value: '115,7\u00a0% du PIB',
            label: 'Dette publique fin 2025, au sens retenu par les règles européennes (dite «\u00a0de Maastricht\u00a0»). Le Gouvernement prévoit 119,3\u00a0% en 2026 et 121,7\u00a0% en 2027',
            date: 'fin 2025',
            sourceIndex: 3,
          },
          chart: {
            kind: 'series',
            unit: '% du PIB',
            items: [
              { label: '2025', value: 115.7 },
              { label: '2026 (prévision)', value: 119.3 },
              { label: '2027 (prévision)', value: 121.7 },
            ],
          },
        },
        {
          id: 'ecologie-climat-08',
          say: 'Alors, quel principe pour guider la transition, et comment la financer\u202f?',
          visual: 'question',
          draw: 'La trajectoire du début, en pointillé, la tirelire posée au bout, et un point d’interrogation.',
          emphasis: ['quel principe', 'comment la financer'],
        },
      ],
      sources: [SNBC, HCC_RESUME, FRANCE_STRATEGIE, HCFP, CITEPA, HCC_SECTEURS],
    },
    {
      id: 'ecologie-transports',
      kind: 'deep',
      questionIds: ['ecologie_energie-6'],
      title: 'Se déplacer\u00a0: voiture, train, autoroutes',
      short: 'Transports',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-transports-01',
          say: 'Vous allez au travail, vous partez en vacances\u00a0: voiture, train ou avion\u202f? Les transports sont le premier secteur émetteur de gaz à effet de serre, et la voiture fait 55\u00a0% de leurs émissions.',
          spoken: 'Vous allez au travail, vous partez en vacances : voiture, train ou avion ? Les transports sont le premier secteur émetteur de gaz à effet de serre, et la voiture fait cinquante-cinq pour cent de leurs émissions.',
          visual: 'hook',
          draw: 'Une voiture, un train, un avion au trait, chacun quand la voix le dit\u202f; puis quatre barres à la même échelle, les émissions des transports\u00a0: les voitures au bleu bille, puis les poids lourds, les utilitaires légers, l’avion sur les trajets intérieurs.',
          alt: 'Une voiture, un train, un avion\u202f; quatre barres à la même échelle\u00a0: voitures particulières 55\u00a0%, poids lourds 22\u00a0%, utilitaires légers 13\u00a0%, avion sur les trajets intérieurs 4\u00a0%.',
          emphasis: ['premier secteur émetteur', '55\u00a0%'],
          figure: {
            value: '55\u00a0%',
            label:
              'Part des voitures particulières dans les émissions des transports, qui atteignent 122,9\u00a0millions de tonnes d’équivalent CO₂ (34\u00a0% des émissions de la France). Suivent les poids lourds (22\u00a0%), les utilitaires légers (13\u00a0%) et l’avion sur les trajets intérieurs (4\u00a0%)',
            date: '2025 (estimation provisoire)',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Voitures particulières', value: 55 },
              { label: 'Poids lourds', value: 22 },
              { label: 'Utilitaires légers', value: 13 },
              { label: 'Avion, trajets intérieurs', value: 4 },
            ],
          },
        },
        {
          id: 'ecologie-transports-02',
          say: 'Depuis 2024, la moitié la plus modeste des ménages peut louer une voiture électrique neuve, 100 à 200\u00a0euros par mois. Par vagues de 50\u202f000\u00a0voitures, aidées chacune d’environ 8\u202f400\u00a0euros en 2026.',
          spoken: 'Depuis deux mille vingt-quatre, la moitié la plus modeste des ménages peut louer une voiture électrique neuve, cent à deux cents euros par mois. Par vagues de cinquante mille voitures, aidées chacune d’environ huit mille quatre cents euros en deux mille vingt-six.',
          visual: 'point',
          draw: 'Dix personnes au trait, les cinq premières comptées au bleu bille\u202f; dessous, une voiture, son loyer par mois, puis le montant de l’aide par voiture.',
          alt: 'Dix personnes, cinq comptées\u00a0: la moitié la plus modeste des ménages\u202f; une voiture.',
          emphasis: ['la moitié la plus modeste', '100 à 200\u00a0euros', '8\u202f400\u00a0euros'],
        },
        {
          id: 'ecologie-transports-03',
          say: 'Le train bat des records\u00a0: 118\u00a0milliards de passagers-kilomètres en 2025, 4\u00a0% de plus en un an. Un passager-kilomètre, c’est un voyageur transporté sur un kilomètre.',
          spoken: 'Le train bat des records : cent dix-huit milliards de passagers-kilomètres en deux mille vingt-cinq, quatre pour cent de plus en un an. Un passager-kilomètre, c’est un voyageur transporté sur un kilomètre.',
          visual: 'figure',
          draw: 'Un train au trait\u202f; à côté, une personne et une flèche d’un kilomètre\u00a0: l’unité qui se compte.',
          alt: 'Un train\u202f; une personne et une flèche d’un kilomètre.',
          emphasis: ['118\u00a0milliards', '4\u00a0%'],
          figure: {
            value: '118\u00a0milliards de passagers-km',
            label:
              'Fréquentation des trains en France (un passager-km correspond à un voyageur transporté sur un kilomètre). C’est un record pour la quatrième année consécutive, en hausse de 4\u00a0% sur un an',
            date: '2025 (chiffres provisoires)',
            sourceIndex: 1,
          },
        },
        {
          id: 'ecologie-transports-04',
          say: 'Les trains financés par les régions ou l’État s’ouvrent à la concurrence. Mi-2026, 15\u00a0lots sur plus de 50 avaient été attribués\u00a0: 10 à SNCF Voyageurs, plus 1 en groupement, 2 à la RATP, 2 à Transdev.',
          spoken: 'Les trains financés par les régions ou l’État s’ouvrent à la concurrence. Mi-deux mille vingt-six, quinze lots sur plus de cinquante avaient été attribués : dix à S.N.C.F. Voyageurs, plus un en groupement, deux à la R.A.T.P., deux à Transdev.',
          visual: 'figure',
          draw: 'Une grille de cinquante cases, les lots de trains\u00a0: quinze comptées au bleu bille, attribuées après mise en concurrence, les autres encore à venir.',
          alt: 'Une grille de cinquante cases\u00a0: quinze lots attribués, les autres à venir.',
          emphasis: ['15\u00a0lots', 'plus de 50'],
          figure: {
            value: '15\u00a0lots sur plus de 50',
            label:
              'Lots de trains financés par les régions ou l’État (TER, Intercités, Transilien) attribués après mise en concurrence. SNCF Voyageurs en a remporté 10, plus 1 en groupement, soit 86,3\u00a0% de l’offre attribuée\u202f; RATP et Transdev, 2 chacun. Plus de 40\u00a0lots restent à mettre en concurrence avant 2033. Sur les trains commerciaux comme les TGV, les concurrents de la SNCF pèsent environ 2\u00a0% du marché national',
            date: 'mi-2026',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'lots',
            items: [
              { label: 'SNCF Voyageurs', value: 10 },
              { label: 'SNCF Voyageurs en groupement', value: 1 },
              { label: 'RATP', value: 2 },
              { label: 'Transdev', value: 2 },
            ],
          },
        },
        {
          id: 'ecologie-transports-05',
          say: 'Face à l’avion, depuis 2023, un vol intérieur régulier peut être interdit quand le train fait le trajet en moins de 2\u00a0h\u00a030. Pour l’été 2026, huit liaisons pouvaient l’être.',
          spoken: 'Face à l’avion, depuis deux mille vingt-trois, un vol intérieur régulier peut être interdit quand le train fait le trajet en moins de deux heures trente. Pour l’été deux mille vingt-six, huit liaisons pouvaient l’être.',
          visual: 'point',
          draw: 'Une carte de France au trait\u00a0: de Paris, des liaisons vers sept villes, en pointillé puis au bleu bille quand la voix dit «\u00a0huit liaisons\u00a0»\u202f; un train et la durée dans un coin.',
          alt: 'Sur une carte, les liaisons concernées\u00a0: de Paris-Orly vers Nantes, Lyon, Bordeaux, Rennes, Strasbourg, Lille et Reims, et de Lille vers Paris-Charles-de-Gaulle.',
          emphasis: ['moins de 2\u00a0h\u00a030', 'huit liaisons'],
        },
        {
          id: 'ecologie-transports-06',
          say: 'Les autoroutes, elles, sont surtout exploitées par des sociétés privées, sous concession. Les contrats historiques prennent fin entre 2031 et 2036\u00a0: le réseau revient alors gratuitement à l’État.',
          spoken: 'Les autoroutes, elles, sont surtout exploitées par des sociétés privées, sous concession. Les contrats historiques prennent fin entre deux mille trente et un et deux mille trente-six : le réseau revient alors gratuitement à l’État.',
          visual: 'timeline',
          draw: 'Une frise des années\u00a0: la plage de 2031 à 2036 au bleu bille\u202f; une route qui part d’une barrière de péage et rejoint un monument public.',
          alt: 'Une frise des années, de 2026 à 2038\u00a0: la fin des contrats, de 2031 à 2036.',
          emphasis: ['entre 2031 et 2036', 'gratuitement à l’État'],
        },
        {
          id: 'ecologie-transports-07',
          say: 'En 2024, ces sociétés ont dégagé 4,3\u00a0milliards d’euros de résultat net. La même année, elles ont investi 1,3\u00a0milliard et payé 1,6\u00a0milliard d’impôt sur les sociétés.',
          spoken: 'En deux mille vingt-quatre, ces sociétés ont dégagé quatre virgule trois milliards d’euros de résultat net. La même année, elles ont investi un virgule trois milliard et payé un virgule six milliard d’impôt sur les sociétés.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle\u00a0: le résultat net, les investissements, l’impôt sur les sociétés.',
          alt: 'Trois barres à la même échelle\u00a0: résultat net, 4,3\u00a0milliards\u202f; investissements, 1,3\u202f; impôt sur les sociétés, 1,6.',
          emphasis: ['4,3\u00a0milliards', '1,3\u00a0milliard', '1,6\u00a0milliard'],
          figure: {
            value: '4,3\u00a0Md€',
            label:
              'Résultat net des sociétés concessionnaires d’autoroutes, pour un chiffre d’affaires de 12,8\u00a0Md€, à 97\u00a0% issu des péages. La même année, elles ont investi 1,3\u00a0Md€ et payé 1,6\u00a0Md€ d’impôt sur les sociétés',
            date: '2024',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: 'Md€',
            items: [
              { label: 'Résultat net', value: 4.3 },
              { label: 'Chiffre d’affaires', value: 12.8 },
              { label: 'Investissements', value: 1.3 },
              { label: 'Impôt sur les sociétés', value: 1.6 },
            ],
          },
        },
        {
          id: 'ecologie-transports-08',
          say: 'Alors, quelles priorités pour se déplacer\u202f?',
          visual: 'question',
          draw: 'Une voiture et un train au trait, côte à côte sur une même ligne, et un point d’interrogation.',
          emphasis: ['quelles priorités'],
        },
      ],
      sources: [HCC_SECTEURS, ART_FERROVIAIRE, ART_AUTOROUTES, VOLS_COURTS],
    },
    {
      id: 'ecologie-adaptation',
      kind: 'deep',
      questionIds: ['ecologie_energie-x2', 'ecologie_energie-x1'],
      title: 'Canicules, feux, eau\u00a0: s’adapter',
      short: 'Chaleur et eau',
      register: 'vous',
      segments: [
        {
          id: 'ecologie-adaptation-01',
          say: 'L’été 2026 a été le plus chaud mesuré en France depuis 1900\u00a0: 3,6\u00a0°C au-dessus de la normale. Comment s’y adapter\u202f?',
          spoken: 'L’été deux mille vingt-six a été le plus chaud mesuré en France depuis mille neuf cent : trois virgule six degrés au-dessus de la normale. Comment s’y adapter ?',
          visual: 'hook',
          draw: 'Un thermomètre au trait sous un soleil\u202f; l’écart à la normale écrit au bleu bille, puis la question.',
          emphasis: ['le plus chaud', 'Comment s’y adapter'],
        },
        {
          id: 'ecologie-adaptation-02',
          say: 'Cet été-là, 53\u00a0jours de vague de chaleur, contre 33 en 2022. Et 27\u00a0jours où au moins un département était en danger très élevé de feux de forêt, contre 13 en 2025.',
          spoken: 'Cet été-là, cinquante-trois jours de vague de chaleur, contre trente-trois en deux mille vingt-deux. Et vingt-sept jours où au moins un département était en danger très élevé de feux de forêt, contre treize en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Deux paires de barres à la même échelle, en jours\u00a0: la vague de chaleur, 2026 au bleu bille puis 2022\u202f; le danger de feux, 2026 au bleu bille puis 2025.',
          alt: 'Deux paires de barres à la même échelle, en jours\u00a0: vague de chaleur, 53 en 2026 et 33 en 2022\u202f; danger très élevé de feux, 27 en 2026 et 13 en 2025.',
          emphasis: ['53\u00a0jours', '27\u00a0jours'],
          figure: {
            value: '53\u00a0jours',
            label:
              'Jours de vague de chaleur en France à l’été 2026, en trois épisodes, contre 33 à l’été 2022. C’est l’été le plus chaud mesuré depuis 1900 (+3,6\u00a0°C au-dessus de la normale), devant 2003 (+2,7\u00a0°C)',
            date: 'été 2026',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: 'jours',
            items: [
              { label: 'Été 2026', value: 53 },
              { label: 'Été 2022', value: 33 },
            ],
          },
        },
        {
          id: 'ecologie-adaptation-03',
          say: 'Selon des estimations provisoires de Santé publique France, la première canicule s’est accompagnée d’au moins 5\u202f764\u00a0décès de plus qu’attendu. Puis d’au moins 1\u202f243 et 817 lors des deux suivantes.',
          spoken: 'Selon des estimations provisoires de Santé publique France, la première canicule s’est accompagnée d’au moins cinq mille sept cent soixante-quatre décès de plus qu’attendu. Puis d’au moins mille deux cent quarante-trois et huit cent dix-sept lors des deux suivantes.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, une par canicule de l’été, sans autre dessin.',
          alt: 'Trois barres à la même échelle\u00a0: au moins 5\u202f764\u00a0décès en excès pendant la 1re canicule, 1\u202f243 pendant la 2e, 817 pendant la 3e.',
          emphasis: ['au moins 5\u202f764', '1\u202f243', '817'],
          figure: {
            value: 'au moins 5\u202f764\u00a0décès',
            label:
              'Décès en excès (au-delà du nombre attendu, toutes causes) estimés pendant la canicule du 17\u00a0juin au 2\u00a0juillet 2026. Au moins 1\u202f243 et 817\u00a0décès en excès ont été estimés pour les deux canicules suivantes. Estimations provisoires, France hexagonale',
            date: 'été 2026',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: 'décès',
            items: [
              { label: '1re canicule', value: 5764 },
              { label: '2e canicule', value: 1243 },
              { label: '3e canicule', value: 817 },
            ],
          },
        },
        {
          id: 'ecologie-adaptation-04',
          say: 'Inondations, sécheresse, séismes\u00a0: le régime «\u00a0Cat-Nat\u00a0» couvre ces dégâts, financé par une surprime sur votre assurance habitation. En 2025, son taux est passé de 12 à 20\u00a0%\u00a0: en moyenne, environ 40\u00a0euros par an au lieu de 25.',
          spoken: 'Inondations, sécheresse, séismes : le régime « cat-nat » couvre ces dégâts, financé par une surprime sur votre assurance habitation. En deux mille vingt-cinq, son taux est passé de douze à vingt pour cent : en moyenne, environ quarante euros par an au lieu de vingt-cinq.',
          visual: 'figure',
          draw: 'Une maison sous un parapluie\u202f; deux barres à la même échelle, le coût moyen d’avant et celui de 2025, au bleu bille.',
          alt: 'Une maison sous un parapluie\u202f; deux barres à la même échelle\u00a0: environ 25\u00a0euros par an avant, 40 en 2025.',
          emphasis: ['Cat-Nat', 'de 12 à 20\u00a0%'],
          figure: {
            value: 'de 12\u00a0% à 20\u00a0%',
            label:
              'Hausse au 1er\u00a0janvier 2025 de la surprime «\u00a0catastrophes naturelles\u00a0» sur les contrats d’assurance habitation et professionnels (de 6\u00a0% à 9\u00a0% en automobile). Pour un particulier, son coût moyen passe d’environ 25\u00a0€ à 40\u00a0€ par an. La garantie couvre 100\u00a0% des professionnels et 97\u00a0% des habitations en métropole, nettement moins en outre-mer',
            date: '1er janvier 2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Avant le 1er janvier 2025', value: 12 },
              { label: 'À partir du 1er janvier 2025', value: 20 },
            ],
          },
        },
        {
          id: 'ecologie-adaptation-05',
          say: 'Et l’eau\u202f? De juin à août, on consomme environ 60\u00a0% de l’eau de l’année. Les cours d’eau, eux, transportent alors 15\u00a0% de leur volume annuel.',
          spoken: 'Et l’eau ? De juin à août, on consomme environ soixante pour cent de l’eau de l’année. Les cours d’eau, eux, transportent alors quinze pour cent de leur volume annuel.',
          visual: 'figure',
          draw: 'Les douze mois de l’année en cases, juin, juillet et août au bleu bille\u202f; dessous, deux barres à la même échelle, l’eau consommée et l’eau des cours d’eau sur ces trois mois.',
          alt: 'Les douze mois de l’année, de juin à août marqués\u202f; deux barres à la même échelle\u00a0: l’eau consommée, environ 60\u00a0%, et l’eau des cours d’eau, 15\u00a0%.',
          emphasis: ['environ 60\u00a0%', '15\u00a0%'],
          figure: {
            value: 'environ 60\u00a0%',
            label: 'Part de l’eau consommée dans l’année qui l’est de juin à août, alors que les cours d’eau ne transportent que 15\u00a0% du volume annuel à cette période (France métropolitaine)',
            date: 'moyenne 2008-2021',
            sourceIndex: 3,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Eau consommée (juin à août)', value: 60 },
              { label: 'Cours d’eau (juin à août)', value: 15 },
            ],
          },
        },
        {
          id: 'ecologie-adaptation-06',
          say: 'L’agriculture représente 58\u00a0% de l’eau consommée. Des retenues la stockent l’hiver, au lieu de la prélever l’été. Mais selon une étude citée par le Haut Conseil pour le climat, l’eau disponible l’hiver sera très variable d’une année à l’autre.',
          spoken: 'L’agriculture représente cinquante-huit pour cent de l’eau consommée. Des retenues la stockent l’hiver, au lieu de la prélever l’été. Mais selon une étude citée par le Haut Conseil pour le climat, l’eau disponible l’hiver sera très variable d’une année à l’autre.',
          visual: 'compare',
          draw: 'À gauche, une retenue qui se remplit l’hiver\u202f; à droite, un champ l’été, arrosé par une flèche venue de la retenue\u202f; puis trois niveaux d’eau en pointillé dans la retenue.',
          alt: 'Une retenue remplie l’hiver, une flèche vers un champ l’été\u202f; puis trois niveaux d’eau différents, d’une année à l’autre.',
          emphasis: ['58\u00a0%', 'au lieu de la prélever l’été', 'très variable'],
        },
        {
          id: 'ecologie-adaptation-07',
          say: 'Au robinet, chaque commune ou intercommunalité choisit\u00a0: gérer l’eau elle-même, en régie, ou la confier à un opérateur. Les régies desservent 48\u00a0% de la population.',
          spoken: 'Au robinet, chaque commune ou intercommunalité choisit : gérer l’eau elle-même, en régie, ou la confier à un opérateur. Les régies desservent quarante-huit pour cent de la population.',
          visual: 'figure',
          draw: 'Un robinet au trait\u202f; une barre de toute la population, partagée\u00a0: la part desservie en régie au bleu bille, le reste par un opérateur.',
          alt: 'Une barre de toute la population\u00a0: la part desservie en régie, puis celle desservie par un opérateur.',
          emphasis: ['en régie', '48\u00a0%'],
          figure: {
            value: '48\u00a0%',
            label: 'Part de la population desservie en eau potable par un service en régie. Les régies représentent 69\u00a0% des services\u202f; les services délégués, moins nombreux (31\u00a0%), desservent 52\u00a0% de la population',
            date: '2024',
            sourceIndex: 6,
          },
          chart: { kind: 'part', value: 48, total: 100, unit: '%', whole: 'de la population desservie' },
        },
        {
          id: 'ecologie-adaptation-08',
          say: 'Alors, comment protéger la population, et comment gérer l’eau\u202f?',
          visual: 'question',
          draw: 'Le thermomètre et une goutte d’eau, côte à côte, et un point d’interrogation.',
          emphasis: ['protéger la population', 'gérer l’eau'],
        },
      ],
      sources: [METEO_FRANCE, SANTE_PUBLIQUE, COUR_CATNAT_SYNTHESE, SDES_EAU, COUR_CATNAT, HCC_SECTEURS, SISPEA],
    },
  ],
}
