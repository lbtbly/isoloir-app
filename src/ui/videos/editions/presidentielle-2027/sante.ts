// Édition « présidentielle 2027 » de la série « Santé et grand âge » (src/ui/videos/series/sante.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/sante.json).
// Datée : aucune mention nouvelle. Celle de la série d'origine vaut toujours (proposition de loi sur l'installation
// des médecins, adoptée par l'Assemblée nationale, examen en séance au Sénat commencé le 11 juin 2026 puis
// suspendu : à revoir si l'examen reprend ou si le texte est adopté). Le déficit de la branche maladie montré dans
// « Qui rembourse vos soins ? » est le résultat de 2025, qui ne bougera pas d'ici au vote (sante-8).
// Les questions des vidéos restent celles que donne le périmètre (sante-1 → sante-1, sante-2 → sante-2,
// sante-3 → sante-5, sante-x1 → sante-4) ; aucune correction ne les change. La fin de vie (sante-3 de cette
// élection) n'a ni vidéo ni passage : c'est un contenu à écrire, pas une correction.
// Les listes de sources sont complètes : les sources gardées sont copiées de la série d'origine, à l'identique ;
// chaque nouvelle source prend l'index de celle qu'elle remplace, si bien qu'aucun autre sourceIndex ne bouge.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Sources gardées, copiées de la série d'origine ——— */

const DREES_PANORAMA: VideoSource = {
  title: 'Les dépenses de santé en 2025 – édition 2026 (Panorama)',
  url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/261001-les-d%C3%A9penses-de-sant%C3%A9-en-2025-edition-2026-panorama-de-la-drees',
  publisher: 'DREES',
  date: '2026-10-01',
}
const DREES_COMPLEMENTAIRE: VideoSource = {
  title: 'En 2023, les personnes sous le seuil de pauvreté restent bien plus souvent sans complémentaire santé que les autres (Les Dossiers de la DREES n° 137)',
  url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/les-dossiers-de-la-drees/260401_DD_compl%C3%A9mentaire_sant%C3%A9',
  publisher: 'DREES',
  date: '2026-04-01',
}
const DREES_GESTION: VideoSource = {
  title: 'Les dépenses de santé en 2025, édition 2026 – Fiche 28 : Les dépenses de gestion du système de santé',
  url: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-09/CNS2026%20-%20Fiche%2028%20-%20Les%20d%C3%A9penses%20de%20gestion%20du%20syst%C3%A8me%20de%20sant%C3%A9.pdf',
  publisher: 'DREES',
  date: '2026-10-01',
}
const DREES_PREVENTION: VideoSource = {
  title: 'Les dépenses de santé en 2025, édition 2026 – Fiche 27 : Les dépenses de prévention',
  url: 'https://drees.solidarites-sante.gouv.fr/sites/default/files/2026-09/CNS2026%20-%20Fiche%2027%20-%20Les%20d%C3%A9penses%20de%20pr%C3%A9vention.pdf',
  publisher: 'DREES',
  date: '2026-10-01',
}
const LFSS: VideoSource = {
  title: 'Loi de financement de la sécurité sociale : présentation',
  url: 'https://www.securite-sociale.fr/la-secu-en-detail/loi-de-financement/presentation',
  publisher: 'Direction de la Sécurité sociale (securite-sociale.fr)',
}
const OQALI: VideoSource = {
  title: 'Suivi du Nutri-Score par l’Oqali – Bilan annuel – Édition 2024',
  url: 'https://www.oqali.fr/media/2025/01/OQALI-2024_Suivi-du-Nutri-Score.pdf',
  publisher: 'Oqali (observatoire public de l’alimentation, INRAE-Anses)',
  date: '2025-01',
}
const NUTRI_SCORE: VideoSource = {
  title: 'Nutri-Score',
  url: 'https://www.santepubliquefrance.fr/nutrition-et-activite-physique/nutri-score',
  publisher: 'Santé publique France',
  date: '2026-03-19',
}

/* ——— Les sources ajoutées par la relecture (chacune à l'index de celle qu'elle remplace) ——— */

/** sante-10 : à la place de « Complémentaire santé d’entreprise » (index 3 de sante-remboursements) */
const CCSS_2026: VideoSource = {
  title: 'Rapport à la Commission des comptes de la Sécurité sociale – Résultats 2025, prévisions 2026 et 2027',
  url: 'https://www.securite-sociale.fr/files/live/sites/SSFR/files/medias/CCSS/2026/CCSS-octobre-2026_assemble_VDEF.pdf',
  publisher: 'Commission des comptes de la Sécurité sociale (Direction de la Sécurité sociale)',
  date: '2026-10',
}
/** sante-18 : à la place de « Qualité de l’air intérieur » (index 4 de sante-prevention) */
const VACCINS_ENFANT: VideoSource = {
  title: 'Faut-il faire vacciner son enfant pour l’inscrire à l’école, en crèche ou garderie ?',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F767',
  publisher: 'Service-public.fr (DILA)',
  date: '2026-01-06',
}
/** sante-18 : à la place du coût de la pollution de l’air intérieur (index 5 de sante-prevention) */
const SPF_PARTICULES: VideoSource = {
  title: 'Pollution de l’air ambiant : nouvelles estimations de son impact sur la santé des Français',
  url: 'https://www.santepubliquefrance.fr/presse/pollution-de-lair-ambiant-nouvelles-estimations-de-son-impact-sur-la-sante-des-francais',
  publisher: 'Santé publique France',
  date: '2021-04-14',
}

export const SANTE: SeriesPatch = {
  videos: {
    'sante-intro': {
      segments: {
        // sante-19 : le thème compte cinq questions dans cette élection ; le compte « quatre » devient inexact
        'sante-intro-06': {
          say: 'Alors, plusieurs questions se posent. Comment mieux accéder aux soins ? Qui rembourse quoi ? Comment accompagner le grand âge ? Et quelle place pour la prévention ?',
        },
      },
    },
    'sante-remboursements': {
      // sante-10 : le rapport à la Commission des comptes de la Sécurité sociale remplace la fiche de service-public
      // à la même place (index 3) ; la boîte à outils du Sénat (index 4) ne sert plus. Index 0 à 2 inchangés.
      sources: [DREES_PANORAMA, DREES_COMPLEMENTAIRE, DREES_GESTION, CCSS_2026],
      segments: {
        // sante-11 : les flèches de même taille suggéraient un partage égal ; l'argent public paie 77,4 %
        'sante-remboursements-02': {
          draw: 'Une facture au trait ; trois flèches en partent vers trois payeurs, la plus large vers le monument : un monument, un parapluie, une personne.',
        },
        // sante-7 : l'obligation de l'employeur n'est plus un fait de la fiche ; le passage 06 suit le 04
        'sante-remboursements-05': 'omit',
        // sante-8 : le scénario du HCAAM (une approche) cède la place au déficit de la branche maladie, le chiffre
        // qui fait pendant aux frais de gestion du passage 08
        'sante-remboursements-09': {
          say: 'Côté comptes, la branche maladie de la Sécurité sociale était en déficit de 15,9 milliards d’euros en 2025.',
          spoken: 'Côté comptes, la branche maladie de la Sécurité sociale était en déficit de quinze virgule neuf milliards d’euros en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Deux piles de pièces au trait, les recettes et les dépenses de la branche maladie, la seconde un peu plus haute ; la différence se hachure au bleu bille, avec le montant.',
          alt: 'Deux piles, les recettes et les dépenses de la branche maladie : la différence, 15,9 milliards.',
          emphasis: ['15,9 milliards'],
          figure: {
            value: '15,9 Md€',
            label: 'Déficit de la branche maladie du régime général de la Sécurité sociale en 2025',
            date: '2025',
            sourceIndex: 3,
          },
        },
        // sante-9 : le chiffrage du même scénario, retiré avec l'ancien passage 09
        'sante-remboursements-10': 'omit',
      },
    },
    'sante-prevention': {
      // sante-18 : la fiche F767 (index 4) et la page de Santé publique France (index 5) remplacent les deux
      // sources sur l'air intérieur, à la même place. Index 0 à 3 inchangés.
      sources: [DREES_PREVENTION, LFSS, OQALI, NUTRI_SCORE, VACCINS_ENFANT, SPF_PARTICULES],
      segments: {
        // sante-15 : l'aération des écoles quitte la fiche ; à sa place, les obligations vaccinales, une règle en
        // vigueur dite sans approche
        'sante-prevention-06': {
          say: 'Côté vaccins, pour les enfants nés depuis 2018, onze vaccinations sont obligatoires. Un enfant qui n’est pas à jour peut entrer provisoirement en crèche ou à l’école ; ses parents ont alors trois mois pour le faire vacciner.',
          spoken: 'Côté vaccins, pour les enfants nés depuis deux mille dix-huit, onze vaccinations sont obligatoires. Un enfant qui n’est pas à jour peut entrer provisoirement en crèche ou à l’école ; ses parents ont alors trois mois pour le faire vacciner.',
          visual: 'point',
          draw: 'Un carnet de santé au trait, onze cases cochées l’une après l’autre ; à côté, la porte d’une école et un calendrier de trois mois.',
          emphasis: ['onze vaccinations', 'trois mois'],
        },
        // sante-16 : le coût de l'air intérieur (étude de 2014) quitte la fiche ; à sa place, la mortalité
        // attribuable aux particules fines, au conditionnel de la source et dans son périmètre (France métropolitaine)
        'sante-prevention-07': {
          say: 'Côté environnement, selon Santé publique France, près de 40 000 décès par an seraient attribuables aux particules fines, chez les 30 ans et plus. C’est 7 % des décès en France métropolitaine, sur des données de 2016 à 2019.',
          spoken: 'Côté environnement, selon Santé publique France, près de quarante mille décès par an seraient attribuables aux particules fines, chez les trente ans et plus. C’est sept pour cent des décès en France métropolitaine, sur des données de deux mille seize à deux mille dix-neuf.',
          visual: 'figure',
          draw: 'Une silhouette au trait sous un ciel semé de fines particules en pointillé ; à côté, une ligne du temps, de 2016 à 2019, hachurée.',
          alt: 'Une silhouette sous des particules fines ; les années des données, de 2016 à 2019.',
          emphasis: ['près de 40 000 décès', '7 %'],
          figure: {
            value: 'près de 40 000',
            label: 'Décès par an attribuables à l’exposition des personnes de 30 ans et plus aux particules fines (PM2,5), soit 7 % de la mortalité totale en France métropolitaine (données 2016-2019, estimation publiée en avril 2021)',
            date: '2016-2019',
            sourceIndex: 5,
          },
        },
        // sante-17 : la question de fin nomme les deux thèmes désormais traités (vaccins, environnement), dans
        // l'ordre des passages, au lieu de l'air intérieur
        'sante-prevention-08': {
          say: 'Budgets, alimentation, vaccins, environnement : quelle priorité pour la prévention ?',
          draw: 'Un calendrier, une pomme, une seringue et une feuille en rang, suivis d’un point d’interrogation.',
        },
      },
    },
  },
}
