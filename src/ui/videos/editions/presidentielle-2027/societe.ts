// Édition « présidentielle 2027 » de la série « Culture » (src/ui/videos/series/societe.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/societe.json).
// Datée (societe-7) : montants votés pour 2026 par la loi n° 2026-103 du 19 février 2026 de finances pour 2026. La
// loi de finances pour 2027 (projet n° 3210, déposé le 1er octobre 2026, Assemblée nationale :
// https://www.assemblee-nationale.fr/dyn/17/textes/l17b3210_projet-loi) les remplacera à sa promulgation, fin 2026
// ou début 2027 : celle pour 2026 n'a été promulguée que le 19 février 2026. Mettre alors à jour, avant le premier
// tour du 18 avril 2027 : les chiffres 0 et 1 de la fiche « societe-1 » de choisir-2027 (reprise sous la question
// « societe-2 » de la présidentielle), le graphique du chiffre 1 (explainer-charts.json) et, si la correction
// societe-3 est retenue, la prévision 2026 du CNC (point 2) ; dans la série (src/ui/videos/series/societe.ts), les
// constantes CULTURE_2026, AUDIOVISUEL_2026 et AUDIOVISUEL_CHART, la source LOI_DE_FINANCES, et les passages
// culture-intro-03, culture-budget-02, culture-budget-04, culture-audiovisuel-06 et culture-audiovisuel-07, voix et
// dessins compris (pour la seule présidentielle, par des corrections de ces passages dans ce fichier, la série
// restant l'archive de la primaire). Pass Culture et bonus « annoncé » d'après le site consulté le 3 octobre 2026
// (bonus toujours annoncé le 7 octobre 2026) ; quotas d'après la page de l'Arcom consultée le 3 octobre 2026. À
// revoir après ces dates.
// Questions : la traduction automatique rattache les cinq vidéos à la seule question societe-2 (« Quelle priorité
// pour la politique culturelle ? », reprise de la fiche « societe-1 » de la primaire) et ne relie aucune vidéo à
// societe-1 (« Quel avenir pour l'audiovisuel public ? »), dont la fiche porte pourtant les chiffres de « Audiovisuel
// public » (3,863 Md€, dont 2,426 Md€ et 648 M€) ; la loi organique du 13 décembre 2024 est, elle, dans la fiche de
// societe-2. « Audiovisuel public » mène donc d'abord à societe-1, puis à societe-2 ; l'introduction, qui pose
// désormais mot pour mot la question societe-1 (societe-6), mène d'abord à societe-2 (tous ses chiffres y sont),
// puis à societe-1. « Budget », « Pass Culture » et « Quotas » gardent la traduction (societe-2). Aucune vidéo
// n'éclaire societe-x1 (concentration et indépendance des médias).
// Planches (pistes/planches/societe.tsx, non modifiées) : intro07 lit les quatre questions dans le say (toujours
// quatre) ; av09 ne dépend pas du texte. Le commentaire d'av09 cite encore l'ancienne question.
import type { SeriesPatch } from '../types'

export const SOCIETE: SeriesPatch = {
  videos: {
    'culture-intro': {
      questionIds: ['societe-2', 'societe-1'],
      segments: {
        // societe-6 : la question sur l'audiovisuel public reprend l'énoncé de cette élection, sans présupposer son
        // financement public (jumelle de culture-audiovisuel-09)
        'culture-intro-07': {
          say: 'Alors, quatre questions se posent. Combien pour la culture ? Quel avenir pour l’audiovisuel public ? Quel soutien aux jeunes ? Et quels quotas à la télévision ?',
          emphasis: ['Combien', 'Quel avenir', 'Quel soutien'],
        },
      },
    },
    'culture-audiovisuel': {
      questionIds: ['societe-1', 'societe-2'],
      segments: {
        // societe-5 : la question finale reste ouverte à toutes les approches (financement public garanti, réduit,
        // privé ou par un chèque) ; le dessin ne change pas
        'culture-audiovisuel-09': {
          say: 'Alors, quel avenir pour l’audiovisuel public, et avec quel financement ?',
          emphasis: ['quel avenir'],
        },
      },
    },
  },
}
