// Édition « présidentielle 2027 » de la série « Salaires et travail » (src/ui/videos/series/travail_salaires.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/travail_salaires.json).
// Datée : Smic du 1er juin 2026 (une nouvelle hausse automatique peut venir si les prix montent encore de 2 %
// depuis ; revalorisation annuelle au 1er janvier 2027, avant le premier tour : travail-intro-03 et
// travail-pouvoir-05, au présent, seront alors à réenregistrer) ; prix de septembre 2026 (estimation provisoire
// de l'Insee, résultats définitifs le 15 octobre 2026) ; salaires du privé en 2024 (Insee Première n° 2079,
// édition annuelle d'octobre) ; part des salariés concernés par la hausse du Smic du 1er novembre 2024 (Dares,
// « dernière hausse mesurée ») ; risques professionnels 2024 (rapport annuel de l'Assurance Maladie, fin d'année) ;
// contrats courts en 2025 (Insee Première n° 2096, édition annuelle de mars) ; heures supplémentaires, déduction
// patronale, forfait social et allègements de cotisations, modifiables par les lois de finances et de financement
// de la sécurité sociale pour 2027. À revoir à chacune de ces publications, et au plus tard avant le premier tour
// du 18 avril 2027.
// Questions : celles de la présidentielle. « Au-delà du Smic, les autres salaires » n'a pas de question
// équivalente dans cette élection ; elle est rattachée à travail_salaires-1 (pouvoir d'achat), dont les approches
// touchent à l'indexation des salaires et à la négociation de branche. L'introduction garde ainsi ses cinq sujets
// et ses cinq vidéos, sans réenregistrement. Les autres vidéos gardent la traduction du périmètre.
// Hors de ce fichier (fiches) : compléter l'explication de travail_salaires-1 avec ce que montre cette vidéo
// (interdiction d'indexer les salaires, +2,0 % à fin juin 2026, 126 branches sur 179, négociation dans les
// 45 jours), et la correction travail_salaires-4 (chiffres de travail-intro-05 et -06) ; les libellés corrigés
// ci-dessous suivent les corrections des fiches travail_salaires-3, -9, -13 et -15.
// Dessin : travail-partage-07 ne met plus « Aucune loi » en valeur ; sa planche (partage07 de
// pistes/planches/travail_salaires.tsx) cherche ce mot pour écrire la première phrase, et ne montre donc plus que
// l'image et la question, en attendant d'être adaptée (première phrase écrite, « doivent les publier » en valeur).
import type { SeriesPatch } from '../types'

export const TRAVAIL_SALAIRES: SeriesPatch = {
  videos: {
    // travail_salaires-1 : la vidéo éclaire la question sur le pouvoir d'achat (indexation, négociation de branche).
    'travail-salaires': {
      questionIds: ['travail_salaires-1'],
    },
    'travail-partage': {
      segments: {
        // travail_salaires-14 : le libellé dit aussi ce que la marge paie et finance (taux d'autofinancement).
        'travail-partage-04': {
          figure: {
            value: '32,2 %',
            label: 'Taux de marge des sociétés non financières en 2025 (32,7 % en 2024). C’est la part de leur valeur ajoutée qui leur reste une fois payés les salariés et les impôts sur la production, en comptant les subventions d’exploitation reçues. Elles en paient ensuite leurs intérêts, leur impôt sur les bénéfices et leurs dividendes, et en financent leurs investissements : en 2025, leur épargne en couvre 88,8 % (taux d’autofinancement)',
            date: '2025',
            sourceIndex: 2,
          },
        },
        // travail_salaires-16 : le libellé montre aussi la dispersion des salaires (premier et dernier dixièmes).
        'travail-partage-06': {
          figure: {
            value: '10 261 €',
            label: 'Salaire net mensuel en équivalent temps plein au-dessus duquel se situent les 1 % de salariés du privé les mieux payés en 2024, soit 7,3 fois le Smic. La moitié des salariés gagne moins de 2 190 €. Un salarié sur dix gagne moins de 1 492 €, un sur dix plus de 4 334 € : un rapport de 2,91, stable en 2024 et à son plus bas niveau depuis dix ans (France y compris Mayotte, apprentis et stagiaires compris, hors agriculture et particuliers employeurs)',
            date: '2024',
            sourceIndex: 4,
          },
        },
        // travail_salaires-17 : la vidéo ne finit plus sur le seul fait qui fonde le plafonnement ; le fait qui
        // tempère (publication des écarts par les sociétés cotées, code de commerce art. L22-10-9, même point de
        // la fiche), et la question de l'élection (associer les salariés). Pas de chiffre : la voix lit le say.
        'travail-partage-07': {
          say: 'Aucune loi ne plafonne ces écarts dans le privé, mais les sociétés cotées doivent les publier pour leurs dirigeants. Profits, décisions, salaires : quelle place pour les salariés ?',
          emphasis: ['doivent les publier', 'quelle place'],
        },
      },
    },
    'travail-droits': {
      segments: {
        // travail_salaires-10 : le libellé suit la fiche (contrats des 15-24 ans en emploi).
        'travail-droits-07': {
          figure: {
            value: '9,4 %',
            label: 'Part des CDD et de l’intérim dans l’emploi total en 2025. Elle baisse depuis 2023 et se situe 0,9 point sous son niveau d’avant la crise sanitaire. Chez les 15-24 ans en emploi, 39,8 % ont un emploi à durée indéterminée (76,2 % chez les 25 ans ou plus) et 30,5 % sont en alternance ou en stage (France, hors personnes vivant en collectivité)',
            date: '2025',
            sourceIndex: 4,
          },
        },
      },
    },
  },
}
