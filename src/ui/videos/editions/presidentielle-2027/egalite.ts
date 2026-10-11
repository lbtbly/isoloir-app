// Édition « présidentielle 2027 » de la série « Égalité femmes-hommes » (src/ui/videos/series/egalite.ts) : corrections
// de la relecture d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/egalite.json).
// En-tête de la série, corrigé pour la présidentielle (egalite-15, egalite-16) : la banque de la primaire n'avait
// qu'une question sur ce thème (egalite-x1), montrée pour la présidentielle sous egalite-2 (responsabilités
// familiales). Les vidéos sur l'écart de salaire touchent aussi egalite-3 ; egalite-1 (violences) et egalite-4 (IVG)
// n'ont pas de vidéo. La fiche mêle ces quatre leviers, chacun a sa vidéo. L'écart de 14,0 % à temps de travail égal
// (Insee Focus n° 377, 2024) est repris dans la fiche (figures[1].label) [présidentielle : bank.json, egalite-2 et
// egalite-3, figures[0].label] et au passage egalite-salaires-04.
// Datée (egalite-17) : projet de loi sur la transparence des salaires présenté le 10 septembre 2026, congé
// supplémentaire de naissance ouvert depuis le 1er juillet 2026. À revoir à chaque étape du projet de loi (déposé au
// Sénat le 10 septembre 2026, en procédure accélérée), avec le point 3 de la fiche egalite-x1 [présidentielle : point 2
// de la fiche egalite-3]. À revoir aussi après le vote de la loi de financement de la sécurité sociale pour 2027
// (congés autour de la naissance), à la parution de l'écart de salaire 2025 par l'Insee, et au plus tard avant le
// 18 avril 2027.
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/egalite.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).

import type { SeriesPatch } from '../types'

/** LABEL_MEME_EMPLOI de la série, avec la mise en garde de l'Insee (egalite-4) */
const LABEL_MEME_EMPLOI =
  'Écart de salaire en équivalent temps plein entre femmes et hommes qui occupent le même emploi dans le même établissement (secteur privé, 2024). Selon l’Insee, ce n’est pas au sens strict une mesure de la discrimination : l’expérience, l’ancienneté ou le diplôme, non observés, peuvent l’amplifier comme l’atténuer'
const MEME_EMPLOI = { value: '3,6 %', label: LABEL_MEME_EMPLOI, date: '2024', sourceIndex: 0 }

export const EGALITE: SeriesPatch = {
  videos: {
    'egalite-intro': {
      // egalite-5 : le titre annonce le périmètre réel (salaires, transparence, congés, garde)
      title: 'Égalité femmes-hommes : salaires et famille',
      // egalite-6 : la famille (congés, garde) relève de egalite-2, les salaires et leur transparence de egalite-3
      questionIds: ['egalite-2', 'egalite-3'],
      segments: {
        // egalite-4
        'egalite-intro-03': { figure: MEME_EMPLOI },
      },
    },
    'egalite-salaires': {
      // egalite-6 : relier la vidéo à egalite-3 (écarts de salaire), sans la retirer de egalite-2 (temps de travail, famille)
      questionIds: ['egalite-3', 'egalite-2'],
      segments: {
        // egalite-3 : l'étape de l'Insee à temps de travail égal, entre 21,8 % (passage 03) et 3,6 % (passage 06)
        'egalite-salaires-04': {
          say: 'Une part de cet écart tient au temps de travail : à temps partiel, par exemple, le salaire de l’année est plus bas. À temps de travail égal, l’écart est de 14,0 %.',
          spoken: 'Une part de cet écart tient au temps de travail : à temps partiel, par exemple, le salaire de l’année est plus bas. À temps de travail égal, l’écart est de quatorze pour cent.',
          visual: 'figure',
          draw: 'Un sablier au trait, « temps partiel » écrit dessous ; une flèche mène à une enveloppe de salaire, une flèche vers le bas à côté ; puis, quand la voix le dit, le chiffre 14,0 % écrit au-dessus.',
          emphasis: ['temps de travail', 'temps partiel', '14,0 %'],
          figure: {
            value: '14,0 %',
            label: 'Écart de salaire en équivalent temps plein entre femmes et hommes, à temps de travail égal, tous emplois confondus (secteur privé, 2024)',
            date: '2024',
            sourceIndex: 0,
          },
        },
        // egalite-4 (libellé), egalite-7 (dessin et alt : les trois écarts)
        'egalite-salaires-06': {
          draw: 'Les trois écarts empilés à la même échelle, du plus large au plus court ; le dernier au bleu bille.',
          alt: 'Trois écarts à la même échelle : 21,8 % pour le revenu salarial, 14,0 % à temps de travail égal, 3,6 % pour le même emploi.',
          figure: MEME_EMPLOI,
        },
      },
    },
    'egalite-conges': {
      // egalite-6 : périmètre explicite (la traduction egalite-x1 → egalite-2 donnait déjà cette question)
      questionIds: ['egalite-2'],
    },
    'egalite-garde': {
      // egalite-6 : périmètre explicite
      questionIds: ['egalite-2'],
      segments: {
        // egalite-12 : l'assistante maternelle, deuxième mode de garde (fiche corrigée, egalite-11)
        'egalite-garde-04': {
          figure: {
            value: '36 %',
            label: 'Mode de garde principal des moins de 3 ans en semaine, en 2021 et au premier choix des familles : par leurs parents, 56 % et 36 % ; en crèche ou dans un autre établissement, 18 % et 35 % ; chez une assistante maternelle, 20 % et 23 % (France métropolitaine)',
            date: '2021',
            sourceIndex: 0,
          },
        },
      },
    },
    'egalite-transparence': {
      // egalite-6 : la mesure des écarts de salaire relève de egalite-3
      questionIds: ['egalite-3'],
      segments: {
        // egalite-4 (libellé), egalite-8 (dessin et alt sans jugement sur la taille de l'écart)
        'egalite-transparence-02': {
          draw: 'Deux barres au trait presque égales, à la même échelle ; l’écart entre leurs bouts est montré du doigt.',
          alt: 'Deux barres à la même échelle, une femme et un homme : l’écart de 3,6 % entre leurs bouts est montré du doigt.',
          figure: MEME_EMPLOI,
        },
      },
    },
  },
}
