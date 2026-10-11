// Édition « présidentielle 2027 » de la série « Retraites » (src/ui/videos/series/retraites.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/retraites.json).
// Datée : projet de loi de financement de la sécurité sociale pour 2027 (gel des pensions de base proposé, sauf les plus basses), à revoir dès son vote en décembre 2026 ;
// revalorisation des pensions de base (+0,9 %, retraites-pensions-06) et montant de l'Aspa (retraites-pensions-05) au 1er janvier 2026, à revoir au 1er janvier 2027 ;
// nouvelles éditions attendues avant avril 2027 : Insee, emploi des 60-64 ans en 2026 (retraites-age-08) ; DREES, espérance de vie sans incapacité en 2025 (retraites-age-10).
// Suspension de la réforme de 2023 jusqu'au 1er janvier 2028. À revoir en décembre 2026, en janvier et en mars 2027, puis en 2028.
// Voix : retraites-pensions-06-p27 peut attendre le vote de la loi de financement de la sécurité sociale pour 2027
// (décembre 2026), pour ne réenregistrer qu'une fois, avec la revalorisation réellement retenue au 1er janvier 2027
// (say, spoken, figure et source alignés sur la fiche). retraites-penibilite-07-p27 (retraites-22) se revoise
// seulement en même temps que les autres passages de la série.
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/retraites.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
// Questions : celles de la présidentielle. « Financement » éclaire aussi retraites-2 (capitalisation), dont la
// fiche porte ses chiffres ; les autres vidéos gardent la traduction du périmètre (retraites-1, retraites-3).
import type { SeriesPatch } from '../types'

export const RETRAITES: SeriesPatch = {
  videos: {
    'retraites-intro': {
      segments: {
        // retraites-12, retraites-13 (say, spoken, emphasis), retraites-14 (dessin, graphique de la fiche),
        // retraites-15 (alt) : le solde de 2025 et sa projection à règles inchangées, dans la même unité.
        'retraites-intro-07': {
          say: 'En 2025, il manque 5,1 milliards d’euros, soit 0,2 % du PIB, la richesse produite en un an. À règles inchangées, le déficit atteindrait 2,4 % du PIB en 2070, selon les projections.',
          spoken: 'En deux mille vingt-cinq, il manque cinq virgule un milliards d’euros, soit zéro virgule deux pour cent du P.I.B., la richesse produite en un an. À règles inchangées, le déficit atteindrait deux virgule quatre pour cent du P.I.B. en deux mille soixante-dix, selon les projections.',
          draw: 'Deux piles de pièces presque égales, recettes et dépenses, datées 2025 ; à côté, les mêmes piles datées 2070, à la même échelle, l’écart plus large ; chaque écart marqué d’une accolade.',
          alt: 'Deux piles à la même échelle, recettes et dépenses, en 2025 puis en 2070 : l’écart, à peine visible en 2025, s’élargit en 2070.',
          emphasis: ['5,1 milliards', '2,4 %'],
          chart: {
            kind: 'series',
            unit: '% du PIB',
            items: [
              { label: '2025', value: -0.2 },
              { label: '2070 (projection)', value: -2.4 },
            ],
          },
        },
      },
    },
    'retraites-age': {
      segments: {
        // retraites-23 : l'Insee rattache l'effet de la réforme à la hausse de 2024, pas à celle de 2025.
        'retraites-age-08': {
          figure: {
            value: '+3,4 points',
            label: 'Hausse du taux d’emploi des 60-64 ans en 2024, principalement sous l’effet de la mise en œuvre de la réforme des retraites de 2023 selon l’Insee ; nouvelle hausse de 2,0 points en 2025 (France, personnes vivant en logement ordinaire)',
            date: '2024',
            sourceIndex: 3,
          },
        },
      },
    },
    // retraites-18 : la vidéo éclaire aussi la question sur la capitalisation, dont la fiche porte ses chiffres.
    'retraites-financement': {
      questionIds: ['retraites-2', 'retraites-3'],
      segments: {
        // retraites-16 (say), retraites-17 (dessin) : la contrainte de transition, dans le périmètre de la source,
        // puis un fait de la même source (système mixte), pour ne pas finir sur l'argument d'un camp.
        'retraites-financement-11': {
          say: 'Passer, même en partie, de la répartition à la capitalisation obligerait un temps à financer deux retraites à la fois. Certains pays, comme la Suède, combinent les deux.',
          draw: 'Une même main qui remplit en même temps l’enveloppe d’un retraité et une tirelire ; puis la chaîne des générations et une tirelire posées côte à côte, reliées par un trait.',
        },
      },
    },
    'retraites-pensions': {
      segments: {
        // retraites-2, retraites-3 : la règle d'indexation, vraie même si le gel proposé pour 2027 est voté.
        'retraites-pensions-06': {
          say: 'En principe, les pensions de base suivent les prix chaque année : plus 0,9 % au 1er janvier 2026.',
          spoken: 'En principe, les pensions de base suivent les prix chaque année : plus zéro virgule neuf pour cent au premier janvier deux mille vingt-six.',
        },
        // Hors relecture : le mot mis en valeur écrit tel qu'il est dit (« Plus vite », en tête de phrase) ; la
        // planche l'écrit en minuscules, l'image ne change pas, la voix non plus.
        'retraites-pensions-09': {
          emphasis: ['moins vite', 'Plus vite'],
        },
      },
    },
    'retraites-penibilite': {
      segments: {
        // retraites-22 : la raison donnée lors de la réforme, attribuée sans sous-entendu.
        'retraites-penibilite-07': {
          say: 'Motif donné alors : leur évaluation était particulièrement complexe. Un départ anticipé reste possible, mais lié à une maladie professionnelle.',
        },
      },
    },
  },
}
