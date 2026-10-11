// Édition « présidentielle 2027 » de la série « Écologie, énergie et transports » (src/ui/videos/series/ecologie_energie.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/ecologie_energie.json).
// Datée : prix des carburants au 25 septembre 2026, marge de raffinage de septembre 2026 (provisoire), bilans
// provisoires de l'été 2026, location aidée de voitures électriques en 2026, bilan électrique 2025 de RTE (bilan
// 2026 attendu début 2027), coût des réacteurs EPR2 confirmé en mars 2026 après l'audit de l'État (décision finale
// d'investissement d'EDF visée avant fin 2026), coût du soutien aux renouvelables évalué par la CRE pour 2027,
// règle européenne de 2035 sur les voitures neuves (vote du Parlement européen attendu le 23 novembre 2026,
// position du Conseil le 11 décembre 2026).
// À revoir chaque mois jusqu'au premier tour du 18 avril 2027.
// Les listes de sources sont complètes : les sources gardées sont copiées de la série d'origine, à l'identique.

import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Sources gardées, copiées de la série d'origine ——— */

const RTE_PRODUCTION: VideoSource = {
  title: 'Bilan électrique 2025 : production',
  url: 'https://analysesetdonnees.rte-france.com/bilan-electrique-2025/production',
  publisher: 'RTE',
  date: '2026',
}

const RTE_SYNTHESE: VideoSource = {
  title: 'Bilan électrique 2025 : synthèse',
  url: 'https://analysesetdonnees.rte-france.com/bilan-electrique-2025/synthese',
  publisher: 'RTE',
  date: '2026',
}

const RTE_PRIX: VideoSource = {
  title: 'Bilan électrique 2025 : prix',
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
  title: 'La filière EPR : une dynamique nouvelle, des risques persistants',
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
  title: 'Stratégie nationale bas-carbone n° 3 – Partie 1 (version de juillet 2026)',
  url: 'https://www.ecologie.gouv.fr/sites/default/files/documents/SNBC3-Partie1-Juillet2026.pdf',
  publisher: 'Ministère de la Transition écologique',
  date: '2026-07',
}

const HCC_RESUME: VideoSource = {
  title: 'Rapport annuel 2026 « Dangers climatiques : la France face à ses responsabilités » – Résumé exécutif et recommandations',
  url: 'https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/HCC_RA2026-Resume-executif-Recommandations_1707.pdf',
  publisher: 'Haut Conseil pour le climat',
  date: '2026-07-09',
}

const HCC_SECTEURS: VideoSource = {
  title: 'Rapport annuel 2026 – Chapitre 4 : suivi des émissions et des politiques publiques par secteur',
  url: 'https://www.hautconseilclimat.fr/wp-content/uploads/2026/07/RANC2026-Chapitre-4.pdf',
  publisher: 'Haut Conseil pour le climat',
  date: '2026-07-09',
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

const METEO_FRANCE: VideoSource = {
  title: 'Bilan climatique de l’été 2026 (juin-juillet-août)',
  url: 'https://meteofrance.com/presse/bilan-climatique-de-lete-2026-juin-juillet-aout',
  publisher: 'Météo-France',
  date: '2026-09-03',
}

const SANTE_PUBLIQUE: VideoSource = {
  title: 'Canicule et santé : excès de mortalité durant l’épisode de canicule du 27 juillet au 20 août 2026',
  url: 'https://www.santepubliquefrance.fr/climat/fortes-chaleurs-canicule/bulletin-national/canicule-et-sante-exces-de-mortalite-durant-lepisode-de-canicule-du-27-juillet-au-20-aout-2026',
  publisher: 'Santé publique France',
  date: '2026-09-16',
}

const COUR_CATNAT_SYNTHESE: VideoSource = {
  title: 'L’assurance des catastrophes naturelles : un enjeu de soutenabilité financière (synthèse)',
  url: 'https://www.ccomptes.fr/sites/default/files/2026-04/20260427-synthese-Assurance-des-catastrophes-naturelles.pdf',
  publisher: 'Cour des comptes',
  date: '2026-04-27',
}

const COUR_CATNAT: VideoSource = {
  title: 'L’assurance des catastrophes naturelles : un enjeu de soutenabilité financière',
  url: 'https://www.ccomptes.fr/fr/publications/lassurance-des-catastrophes-naturelles-un-enjeu-de-soutenabilite-financiere',
  publisher: 'Cour des comptes',
  date: '2026-04-27',
}

const SDES_EAU: VideoSource = {
  title: 'L’eau en France : ressource et utilisation – Extrait du Bilan environnemental 2024',
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

/* ——— Sources ajoutées par la relecture ——— */

/** Coût cible des six EPR2 (corrections ecologie_energie-7 à -10) */
const ELYSEE_EPR: VideoSource = {
  title: 'Cinquième Conseil de politique nucléaire',
  url: 'https://www.elysee.fr/emmanuel-macron/2026/03/12/cinquieme-conseil-de-politique-nucleaire',
  publisher: 'Présidence de la République',
  date: '2026-03-12',
}

/** Coût prévu en 2027 du soutien aux renouvelables électriques (correction ecologie_energie-14) */
const CRE_CSPE: VideoSource = {
  title:
    'Délibération n° 2026-149 du 15 juillet 2026 relative à l’évaluation des charges de service public de l’énergie à compenser en 2027 et à la réévaluation des charges à compenser en 2026 (tableau 3)',
  url: 'https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260715_2026-149_CSPE_2026-2027.pdf',
  publisher: 'Commission de régulation de l’énergie (CRE)',
  date: '2026-07-15',
}

/** Règle européenne de 2035 sur les voitures neuves (correction ecologie_energie-23) : remplace la page des vols courts */
const PE_VOITURES_2035: VideoSource = {
  title:
    'Legislative Train Schedule – Proposal amending Regulation (EU) 2019/631 as regards CO2 emission performance standards for new light duty vehicles and vehicle labelling',
  url: 'https://www.europarl.europa.eu/legislative-train/package-automotive-package/file-co2-emission-standards-for-new-light-duty-vehicles-and-labelling',
  publisher: 'Parlement européen',
  date: '2026-09-20',
}

/** Part de l’agriculture dans l’eau consommée en 2023, celle de la fiche ecologie_energie-5 (extension de la correction
 *  ecologie_energie-28, à faire valider) */
const SDES_PRELEVEMENTS: VideoSource = {
  title: 'Prélèvements de ressources naturelles en France – État des connaissances en 2025',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/prelevements-de-ressources-naturelles-en-france-etat-des-connaissances-en-2025',
  publisher: 'SDES, ministère de la Transition écologique',
  date: '2026-03-06',
}

export const ECOLOGIE_ENERGIE: SeriesPatch = {
  videos: {
    'ecologie-carburants': {
      segments: {
        // ecologie_energie-20 : la part simulée aux prix du printemps 2026, déjà dans le libellé du chiffre montré ;
        // la coupure de phrase d'origine est gardée (pas de deux-points), pour des phrases de 25 mots au plus à la voix
        'ecologie-carburants-06': {
          say: 'Un poids inégal. En 2021, 10,6 % des ménages avec voiture ont consacré au carburant plus d’un mois de revenu. Dans les intercommunalités rurales, 13,5 % ; dans les urbaines, 9 %. Aux prix du printemps 2026 et avec les revenus de 2021, cette part aurait été de 22,4 %.',
          spoken:
            'Un poids inégal. En deux mille vingt et un, dix virgule six pour cent des ménages avec voiture ont consacré au carburant plus d’un mois de revenu. Dans les intercommunalités rurales, treize virgule cinq pour cent ; dans les urbaines, neuf pour cent. Aux prix du printemps deux mille vingt-six et avec les revenus de deux mille vingt et un, cette part aurait été de vingt-deux virgule quatre pour cent.',
          draw: 'Trois barres à la même échelle : l’ensemble des ménages avec voiture, puis les intercommunalités rurales, puis les urbaines ; puis une quatrième, en pointillé, la simulation aux prix du printemps 2026.',
          alt: 'Quatre barres à la même échelle : ménages avec voiture en 2021, 10,6 % ; intercommunalités rurales, 13,5 % ; urbaines, 9 % ; aux prix du printemps 2026 (simulation), 22,4 %.',
          emphasis: ['10,6 %', '13,5 %', '22,4 %'],
        },
      },
    },
    'ecologie-electricite': {
      // ELYSEE_EPR (index 6) pour le coût cible des EPR2 ; COUR_EPR reste, seule source de 51,7 et 67,4.
      // CRE_CSPE (index 7) pour le coût du soutien aux renouvelables.
      sources: [RTE_PRODUCTION, COUR_EPR, RTE_SYNTHESE, RTE_PRIX, CRE_RESEAUX, COMMISSION_MARCHE, ELYSEE_EPR, CRE_CSPE],
      segments: {
        // ecologie_energie-10 (avec les corrections de la fiche -7, -8 et -9) : le coût cible confirmé en mars 2026
        'ecologie-electricite-03': {
          say: 'Pour six nouveaux réacteurs EPR2, EDF s’est engagé en 2026, après un audit de l’État, sur un coût de construction de 72,8 milliards d’euros de 2020. Les chiffrages précédents étaient de 51,7 milliards en 2022, puis de 67,4 fin 2023.',
          spoken:
            'Pour six nouveaux réacteurs E.P.R. deux, E.D.F. s’est engagé en deux mille vingt-six, après un audit de l’État, sur un coût de construction de soixante-douze virgule huit milliards d’euros de deux mille vingt. Les chiffrages précédents étaient de cinquante et un virgule sept milliards en deux mille vingt-deux, puis de soixante-sept virgule quatre fin deux mille vingt-trois.',
          draw: 'Trois colonnes à la même échelle, les chiffrages de 2022 et de fin 2023 puis la cible de 2026, une flèche au bleu bille de la première à la dernière.',
          alt: 'Trois colonnes à la même échelle : 51,7 milliards pour le chiffrage de 2022, 67,4 pour celui de fin 2023, 72,8 pour la cible de 2026.',
          emphasis: ['72,8 milliards', '51,7'],
          figure: {
            value: '72,8 Md€',
            label:
              'Coût de construction de six réacteurs EPR2 (trois paires, à Penly, Gravelines et Bugey), en euros de 2020 : en mars 2026, après un audit mené par l’État au début de l’année, EDF s’est engagé à tenir cette cible. L’État accorde au programme un prêt bonifié pour 60 % de son montant total. La décision finale d’investissement d’EDF est visée avant la fin de 2026, pour une première mise en service d’ici 2038. Selon la Cour des comptes, les chiffrages précédents, hors frais de financement, étaient de 51,7 Md€ en 2022 et de 67,4 Md€ fin 2023',
            date: 'mars 2026',
            sourceIndex: 6,
          },
          chart: {
            kind: 'series',
            unit: 'Md€ de 2020',
            items: [
              { label: 'Chiffrage 2022', value: 51.7 },
              { label: 'Chiffrage fin 2023', value: 67.4 },
              { label: 'Cible 2026', value: 72.8 },
            ],
          },
        },
        // ecologie_energie-14 : le coût du soutien public aux renouvelables, attribué à la CRE ; le chiffre montré
        // (30,4 GW) ne change pas
        'ecologie-electricite-04': {
          say: 'Les renouvelables ont fourni 27 % de l’électricité en 2025. Le solaire atteint 30,4 gigawatts installés fin 2025, plus que l’hydraulique. Selon la Commission de régulation de l’énergie, leur soutien public devrait coûter 8,4 milliards d’euros en 2027.',
          spoken:
            'Les renouvelables ont fourni vingt-sept pour cent de l’électricité en deux mille vingt-cinq. Le solaire atteint trente virgule quatre gigawatts installés fin deux mille vingt-cinq, plus que l’hydraulique. Selon la Commission de régulation de l’énergie, leur soutien public devrait coûter huit virgule quatre milliards d’euros en deux mille vingt-sept.',
          emphasis: ['27 %', '30,4 gigawatts', '8,4 milliards'],
        },
      },
    },
    'ecologie-climat': {
      // ecologie_energie-6 : France Stratégie et le HCFP ne sont plus cités (passages 06 et 07 retirés) ; les
      // sourceIndex des passages gardés (0 et 1) ne changent pas
      sources: [SNBC, HCC_RESUME, CITEPA, HCC_SECTEURS],
      segments: {
        // ecologie_energie-4 : chiffre de France Stratégie et trois leviers, venus d'une fiche de l'archive
        'ecologie-climat-06': 'omit',
        // ecologie_energie-5 : dette et déficit, venus de la même fiche ; traités ailleurs dans cette élection
        'ecologie-climat-07': 'omit',
      },
    },
    'ecologie-transports': {
      // ecologie_energie-23 : la page du Parlement européen remplace celle des vols courts, à la même place (index 3)
      sources: [HCC_SECTEURS, ART_FERROVIAIRE, ART_AUTOROUTES, PE_VOITURES_2035],
      segments: {
        // ecologie_energie-23 : la règle européenne de 2035 sur les voitures neuves, au lieu des vols courts de l'été 2026
        'ecologie-transports-05': {
          say: 'Et la voiture ? Une règle européenne de 2023 prévoit que les voitures neuves vendues dès 2035 n’émettent plus de CO₂ à l’échappement. Fin 2025, la Commission a proposé de viser plutôt 90 % de baisse. Le Parlement et les États doivent se prononcer.',
          spoken:
            'Et la voiture ? Une règle européenne de deux mille vingt-trois prévoit que les voitures neuves vendues dès deux mille trente-cinq n’émettent plus de C.O. deux à l’échappement. Fin deux mille vingt-cinq, la Commission a proposé de viser plutôt quatre-vingt-dix pour cent de baisse. Le Parlement et les États doivent se prononcer.',
          visual: 'timeline',
          draw: 'Une frise des années : 2023, un texte au trait ; 2035, une voiture neuve sous l’étiquette « 100 % », puis, quand la voix le dit, une seconde étiquette « 90 % » posée à côté, sans rien barrer.',
          alt: 'Une frise : 2023, la règle européenne ; 2035, baisse de 100 % des émissions de CO₂ des voitures neuves ; fin 2025, 90 % proposé par la Commission européenne.',
          emphasis: ['2035', '90 %'],
        },
      },
    },
    'ecologie-adaptation': {
      // SDES_PRELEVEMENTS (index 7) pour la part de l’agriculture en 2023 ; SDES_EAU reste à l’index 3, source de la
      // figure du passage 05 ; les autres sourceIndex (0, 1, 2, 6) ne changent pas
      sources: [METEO_FRANCE, SANTE_PUBLIQUE, COUR_CATNAT_SYNTHESE, SDES_EAU, COUR_CATNAT, HCC_SECTEURS, SISPEA, SDES_PRELEVEMENTS],
      segments: {
        // ecologie_energie-28 : sans « Mais », le fait attribué au Haut Conseil pour le climat reste, sans réfuter.
        // Au-delà du texte arbitré (à faire valider) : 61 % en 2023, comme la fiche ecologie_energie-5, au lieu de
        // 58 % (Bilan environnemental 2024, fiche de l’archive) ; la voix est de toute façon refaite
        'ecologie-adaptation-06': {
          say: 'L’agriculture représente 61 % de l’eau consommée. Des retenues la stockent l’hiver, au lieu de la prélever l’été. Selon une étude citée par le Haut Conseil pour le climat, l’eau disponible l’hiver sera très variable d’une année à l’autre.',
          spoken:
            'L’agriculture représente soixante et un pour cent de l’eau consommée. Des retenues la stockent l’hiver, au lieu de la prélever l’été. Selon une étude citée par le Haut Conseil pour le climat, l’eau disponible l’hiver sera très variable d’une année à l’autre.',
          emphasis: ['61 %', 'au lieu de la prélever l’été', 'très variable'],
        },
      },
    },
  },
}
