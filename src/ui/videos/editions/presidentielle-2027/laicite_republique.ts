// Édition « présidentielle 2027 » de la série « Laïcité et mémoire » (src/ui/videos/series/laicite_republique.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/laicite_republique.json).
// Datée (laicite_republique-18) : la proposition de loi sur la laïcité dans le sport, adoptée par le Sénat le 18 février
// 2025, n'était pas adoptée par l'Assemblée nationale au 3 octobre 2026 (laicite-signes-04 et -05). À revoir si l'Assemblée
// l'examine (vérifié au 7 octobre 2026 : renvoyé en commission le 19 février 2025, sans rapport ni séance). Datée aussi : la commission mixte
// d'historiens français et algériens (laicite-histoire-07) : vérifier où en sont ses travaux, sur une source officielle,
// avant le 18 avril 2027. Et le chiffre 2024-2025 des atteintes à la laïcité à l'école (laicite-signes-02, s'il est
// ajouté) : le remplacer par le bilan 2025-2026 du ministère de l'Éducation nationale s'il paraît avant le vote.
// Matière ajoutée à celle de la série (laicite_republique-6, -9, -14) : la loi du 24 août 2021, qui renforce le
// contrôle des associations et des lieux de culte (fiche laicite_republique-1 et « context » de sa question) ;
// l'interdiction de dissimuler son visage dans tout l'espace public (loi du 11 octobre 2010, « context » de
// laicite_republique-1) ; la loi du 21 mai 2001 sur la traite et l'esclavage (fiche laicite_republique-2).
// Écartée (laicite_republique-8, laicite-signes-02) : le chiffre des atteintes à la laïcité à l'école (4 280 en
// 2024-2025, question au Gouvernement n° 1078) n'est plus dans la fiche laicite_republique-1 : la réparation des fiches
// du 8 octobre 2026 l'en a retiré (explainers-output-2.json), et la vidéo ne montre que les nombres de la fiche (§ 6 du
// guide). Le passage d'origine garde sa voix. On la rétablira si le propriétaire remet le chiffre dans la fiche, en
// coupant la phrase en deux (say et spoken) et en lisant « deux mille vingt-quatre – deux mille vingt-cinq ».
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/laicite_republique.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
import type { SeriesPatch } from '../types'

/* ——— Les sources des vidéos corrigées, copiées de la série ——— */

const CONSTITUTION = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
}

const QPC_2013 = {
  title: 'Décision n°\u00a02012-297 QPC du 21\u00a0février 2013 (traitement des pasteurs dans le Bas-Rhin, le Haut-Rhin et la Moselle)',
  url: 'https://www.conseil-constitutionnel.fr/decision/2013/2012297QPC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2013-02-21',
}

const COMITE_2021 = {
  title: 'Décret n°\u00a02021-716 du 4\u00a0juin 2021 instituant un comité interministériel de la laïcité',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043604820',
  publisher: 'Légifrance',
  date: '2021-06-04',
}

const SENAT_SPORT = {
  title: 'Proposition de loi visant à assurer le respect du principe de laïcité dans le sport – La loi en clair',
  url: 'https://www.senat.fr/travaux-parlementaires/textes-legislatifs/la-loi-en-clair/proposition-de-loi-visant-a-assurer-le-respect-du-principe-de-laicite-dans-le-sport.html',
  publisher: 'Sénat',
  date: '2025-02',
}

const MISSION_2008 = {
  title: 'Rapport d’information n°\u00a01262 fait au nom de la mission d’information sur les questions mémorielles',
  url: 'https://www.assemblee-nationale.fr/13/rap-info/i1262.asp',
  publisher: 'Assemblée nationale',
  date: '2008-11-18',
}

/* ——— Les sources ajoutées par la relecture ——— */

/** laicite_republique-6 : copiée de la fiche laicite_republique-1 (point 3, laicite_republique-2) */
const LOI_2021 = {
  title: 'Loi n°\u00a02021-1109 du 24\u00a0août 2021 confortant le respect des principes de la République (articles 1er, 12, 21 et 87)',
  url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043964778',
  publisher: 'Légifrance',
  date: '2021-08-24',
}

/** laicite_republique-9 : l'interdiction de dissimuler son visage dans l'espace public (article 1er) */
const LOI_2010 = {
  title: 'Loi n°\u00a02010-1192 du 11\u00a0octobre 2010 interdisant la dissimulation du visage dans l’espace public',
  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000022911670',
  publisher: 'Légifrance',
  date: '2010-10-11',
}

/** laicite_republique-14 : la loi de 2001 (article 2), dite au passage laicite-histoire-02 (fiche corrigée, laicite_republique-13) */
const LOI_2001 = {
  title: 'Loi n°\u00a02001-434 du 21\u00a0mai 2001 tendant à la reconnaissance de la traite et de l’esclavage en tant que crime contre l’humanité',
  url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000405369',
  publisher: 'Légifrance',
  date: '2001-05-21',
}

export const LAICITE_REPUBLIQUE: SeriesPatch = {
  videos: {
    'laicite-intro': {
      segments: {
        // laicite_republique-7 : la question du contrôle des associations et des lieux de culte (loi de 2021, approche e)
        'laicite-intro-07': {
          say: 'Alors, cinq questions se posent. Comment définir la laïcité\u202f? Où placer la limite pour les signes religieux\u202f? Quel contrôle des associations et des lieux de culte\u202f? Quelle place pour la lutte contre les discriminations\u202f? Et comment aborder l’histoire de la colonisation\u202f?',
          draw: 'Cinq pictogrammes en grille, chacun avec sa question\u00a0: un document, un rond barré, une loupe, une personne, un livre.',
        },
      },
    },
    'laicite-principe': {
      // laicite_republique-6 : la loi du 24 août 2021
      sources: [CONSTITUTION, QPC_2013, COMITE_2021, LOI_2021],
      segments: {
        // laicite_republique-6 : la loi de 2021 entre dans ce passage (« la même année » : 2021, dit au passage -06)
        'laicite-principe-07': {
          say: 'Depuis, un comité interministériel de la laïcité, présidé par le Premier ministre, coordonne l’action du gouvernement. La même année, une loi renforce le contrôle des associations et des lieux de culte.',
          draw: 'Une table au trait, des personnes autour, celle du milieu au bleu bille\u202f; puis un texte de loi, une flèche vers un local d’association et une salle sans aucun signe, une loupe au bleu bille au-dessus.',
          emphasis: ['comité interministériel', 'contrôle des associations'],
        },
      },
    },
    'laicite-signes': {
      // laicite_republique-9 (LOI_2010) ; SENAT_SPORT reste à l'index 0 (figure de laicite-signes-04)
      sources: [SENAT_SPORT, LOI_2010],
      segments: {
        // laicite_republique-9 : la seule interdiction qui vaut dans tout l'espace public (loi de 2010, article 1er)
        'laicite-signes-03': {
          say: 'Les agents publics, eux, doivent rester neutres. Et dans tout l’espace public, il est interdit de porter une tenue destinée à dissimuler son visage, comme le voile intégral.',
          draw: 'Un guichet de service public, une personne derrière, une petite balance au fléau bien droit\u202f; puis une rue au trait, des passants, un rond barré.',
          // « les agents publics » de la proposition, avec la majuscule du début de phrase
          emphasis: ['Les agents publics', 'tout l’espace public'],
        },
      },
    },
    'laicite-discriminations': {
      segments: {
        // laicite_republique-4 (fiche, liée à laicite_republique-10) : le libellé du chiffre suit la fiche corrigée
        // (texte non dit)
        'laicite-discriminations-05': {
          figure: {
            value: '7\u00a0%',
            label: 'des personnes ayant déclaré une discrimination ou un traitement inégalitaire au cours des cinq dernières années citent leur religion comme motif. C’est 30\u00a0% chez les immigrés et descendants d’immigrés du Maroc et de Tunisie, contre 2\u00a0% chez les personnes sans ascendance migratoire ni originaires d’outre-mer. La mention de ce motif a augmenté en dix ans – France métropolitaine, 18-59\u00a0ans',
            date: '2019-2020',
            sourceIndex: 1,
          },
        },
        // laicite_republique-10 : l'évolution du motif religieux, attribuée à l'enquête (aucun nombre ajouté)
        'laicite-discriminations-06': {
          say: 'C’est 30\u00a0% chez les immigrés et descendants d’immigrés du Maroc et de Tunisie. Et 2\u00a0% chez les personnes sans ascendance migratoire ni originaires d’outre-mer. Selon cette enquête, la mention de ce motif a augmenté en dix ans.',
          spoken: 'C’est trente pour cent chez les immigrés et descendants d’immigrés du Maroc et de Tunisie. Et deux pour cent chez les personnes sans ascendance migratoire ni originaires d’outre-mer. Selon cette enquête, la mention de ce motif a augmenté en dix ans.',
        },
      },
    },
    'laicite-memoire': {
      segments: {
        // laicite_republique-17 : la question de fin ne reprend plus les trois verbes de l'approche laicite_republique-2-b
        'laicite-memoire-08': {
          say: 'Alors, sur la mémoire de la colonisation, quel rôle pour l’État\u202f?',
          draw: 'Les pictogrammes des décisions montrées (un document, une boîte d’archives, une caisse que ramène une flèche), sans légende, puis une flèche en tirets vers un point d’interrogation.',
        },
      },
    },
    'laicite-histoire': {
      // laicite_republique-14 : la loi de 2001
      sources: [MISSION_2008, LOI_2001],
      segments: {
        // laicite_republique-14 : la loi de 2001, toujours en vigueur, à côté de celle de 2005
        'laicite-histoire-02': {
          say: 'En 2001, une loi demande aux programmes scolaires d’accorder à la traite et à l’esclavage «\u00a0la place conséquente qu’ils méritent\u00a0». En 2005, une autre loi leur demande de reconnaître «\u00a0le rôle positif de la présence française outre-mer\u00a0».',
          spoken: 'En deux mille un, une loi demande aux programmes scolaires d’accorder à la traite et à l’esclavage « la place conséquente qu’ils méritent ». En deux mille cinq, une autre loi leur demande de reconnaître « le rôle positif de la présence française outre-mer ».',
          draw: 'Deux textes de loi datés 2001 et 2005, chacun avec une ligne surlignée au bleu bille, et une flèche de chacun vers le même livre\u00a0: les programmes scolaires.',
          emphasis: ['2001', '2005', 'programmes scolaires'],
        },
        // laicite_republique-15 : le dessin montre que la disposition de 2001 reste en vigueur (voix inchangée)
        'laicite-histoire-03': {
          draw: 'Le texte de 2005\u00a0: sa ligne surlignée est barrée, et entre lui et le livre, un trait en pointillé\u202f; le texte de 2001 garde sa flèche pleine vers le livre.',
          alt: 'Deux lois\u00a0: 2001, toujours en vigueur\u202f; 2005, disposition abrogée en 2006.',
        },
      },
    },
  },
}
