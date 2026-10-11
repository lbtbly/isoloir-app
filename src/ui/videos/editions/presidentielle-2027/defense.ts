// Édition « présidentielle 2027 » de la série « Défense » (src/ui/videos/series/defense.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/defense.json).
// Datée : pays associés à la « dissuasion avancée » au 15 septembre 2026 (dix) ; États parties au traité
// d'interdiction des armes nucléaires au 3 octobre 2026 (75) ; plans présentés au titre des prêts européens
// d'armement (dix-neuf États) ; crédits de la dissuasion pour 2026 (7,4 Md€, projet de loi de finances pour 2026,
// dissuasion-05) et budget 2027 de la mission Défense (projet de loi de finances pour 2027, budget-03), à confronter
// à la loi de finances pour 2027 une fois votée ; première conférence d'examen du traité d'interdiction des armes
// nucléaires, du 30 novembre au 4 décembre 2026 (desarmement-05 à 07 ; Nations unies,
// https://indico.un.org/event/1021647/) ; importations d'armes des pays européens de l'OTAN sur 2021-2025 (SIPRI,
// alliances-07), dont la mise à jour sur 2022-2026 est attendue en mars 2027. À revoir après chacune de ces dates,
// et au plus tard avant le premier tour, le 18 avril 2027.
// Questions : la traduction automatique rattache « Budget » à la seule question sur l'Europe (defense-4) et ne
// relie aucune vidéo à l'OTAN (defense-1) ni au budget des armées (defense-2) ; l'introduction, « Budget » et
// « Alliances » reçoivent donc les questions de cette élection qu'elles traitent. « Dissuasion » et « Désarmement »
// gardent la traduction (defense-3).

import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la vidéo « Budget », copiées de la série, plus le projet de loi de finances pour 2027 ——— */

const LPM: VideoSource = {
  title: 'Loi du 16 août 2026 actualisant la programmation militaire 2024-2030',
  url: 'https://www.vie-publique.fr/loi/302742-actualisation-lpm-2024-2030-etat-dalerte-de-securite-nationale-loi-2026',
  publisher: 'Vie-publique.fr (DILA)',
  date: '2026-08-18',
}

const OTAN_DEPENSES: VideoSource = {
  title: 'Defence Investment of NATO Countries (2014-2026)',
  url: 'https://www.nato.int/content/dam/nato/webready/documents/finance/def-exp-2026-en.pdf',
  publisher: 'OTAN',
  date: '2026-07',
}

const SENAT_PLF: VideoSource = {
  title: 'Projet de loi de finances pour 2026 : Défense – Rapport général n° 139 (2025-2026), tome III, annexe 8',
  url: 'https://www.senat.fr/rap/l25-139-38/l25-139-38_mono.html',
  publisher: 'Sénat, commission des finances',
  date: '2025-11-24',
}

const PLF_2027: VideoSource = {
  title:
    'Budget 2027 – Projet de loi de finances pour 2027 (dossier de présentation, p. 29-30 et fiche mission « Défense », p. 79-80)',
  url: 'https://www.budget.gouv.fr/documentation/file-download/33484',
  publisher: 'Ministère de l’Économie et des Finances, Direction du budget',
  date: '2026-10-01',
}

export const DEFENSE: SeriesPatch = {
  videos: {
    'defense-intro': {
      questionIds: ['defense-1', 'defense-2', 'defense-3', 'defense-4'],
    },
    'defense-budget': {
      questionIds: ['defense-2', 'defense-4'],
      // defense-4 : le projet de loi de finances pour 2027, ajouté aux sources (index 3)
      sources: [LPM, OTAN_DEPENSES, SENAT_PLF, PLF_2027],
      segments: {
        // defense-4 (et defense-3 pour le libellé et la date du chiffre) : l'effort prévu pour 2027, dit et affiché
        'defense-budget-03': {
          say: 'Une loi du 16 août 2026 l’a actualisée. Au total, 436 milliards d’euros sont prévus pour la mission Défense de 2024 à 2030. Dont 36 milliards ajoutés entre 2026 et 2030. Pour 2027, le projet de budget prévoit 6,4 milliards de plus qu’en 2026.',
          spoken:
            'Une loi du seize août deux mille vingt-six l’a actualisée. Au total, quatre cent trente-six milliards d’euros sont prévus pour la mission Défense de deux mille vingt-quatre à deux mille trente. Dont trente-six milliards ajoutés entre deux mille vingt-six et deux mille trente. Pour deux mille vingt-sept, le projet de budget prévoit six virgule quatre milliards de plus qu’en deux mille vingt-six.',
          emphasis: ['436 milliards', '36 milliards', '6,4 milliards'],
          figure: {
            value: '436 Md€',
            label:
              'Budget de la mission Défense sur 2024-2030 après la loi d’actualisation, qui ajoute 36 Md€ sur 2026-2030. Objectif : 2,5 % du PIB en 2030 et 3,5 % en 2035. Pour 2027, le projet de loi de finances prévoit 63,4 Md€ hors pensions, soit 6,4 Md€ de plus qu’en 2026, et un gel en euros courants des crédits des autres ministères pris ensemble',
            date: 'Loi promulguée le 16 août 2026 ; projet de loi de finances pour 2027',
            sourceIndex: 0,
          },
        },
        // defense-5 : une question de fin ouverte vers le haut comme vers le bas
        'defense-budget-09': {
          say: 'Alors, combien dépenser pour la défense dans les années à venir ?',
          emphasis: ['combien dépenser'],
        },
      },
    },
    'defense-alliances': {
      questionIds: ['defense-1', 'defense-4'],
      segments: {
        // defense-9 : le rang mondial de la France à l'exportation (même source, même période)
        'defense-alliances-07': {
          figure: {
            value: '58 %',
            label:
              'Part des États-Unis dans les importations d’armes majeures des 29 pays européens de l’OTAN. La France en fournit 7,4 %. Dans le monde, elle est le deuxième exportateur d’armes majeures, avec 9,8 % des exportations',
            date: '2021-2025 (publié le 9 mars 2026)',
            sourceIndex: 3,
          },
        },
      },
    },
    'defense-dissuasion': {
      segments: {
        // defense-14 : la date de la fiche, sans ambiguïté avec le budget 2027
        'defense-dissuasion-05': {
          figure: {
            value: '7,4 Md€',
            label: 'Crédits de la dissuasion nucléaire prévus pour 2026, soit 11,1 % des crédits de paiement de la mission Défense',
            date: '2026 (projet de loi de finances pour 2026)',
            sourceIndex: 2,
          },
        },
        // defense-15 : un lien vers les partenaires, sans cercle de protection commun (planche d07 à redessiner)
        'defense-dissuasion-07': {
          draw: 'La carte de la France et son cercle de protection ; à côté, une rangée de fanions voisins, reliés à la France par de fines flèches en pointillé.',
        },
      },
    },
    'defense-desarmement': {
      segments: {
        // defense-7 : l'arsenal chinois, estimé et qualifié par le SIPRI
        'defense-desarmement-02': {
          figure: {
            value: 'Environ 9 745 ogives',
            label:
              'Ogives nucléaires utilisables (stocks militaires) dans le monde, estimées par le SIPRI ; la Russie et les États-Unis en détiennent environ 83 %, la Chine environ 620 (selon le SIPRI, l’arsenal qui croît le plus vite), la France 290',
            date: 'Janvier 2026',
            sourceIndex: 0,
          },
        },
      },
    },
  },
}
