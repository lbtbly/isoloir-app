// Édition « présidentielle 2027 » de la série « Solidarités » (src/ui/videos/series/solidarites.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/solidarites.json).
// Datée : taux de chômage du deuxième trimestre 2026 (Insee, août 2026), prévisions de l'Unédic de juin 2026 (dont
// le +2,1 Md€ prévu pour 2027, que son Bureau du 23 septembre 2026 dit devoir être « sensiblement revu à la baisse »),
// montants du RSA et de l'AAH en vigueur en 2026, allocataires de minima sociaux fin 2024 et dépenses de 2024 (DREES),
// foyers au RSA en juin 2026 (DREES, suivi mensuel), part des inscrits indemnisés fin 2025 (France Travail), règle de
// la rupture conventionnelle du 1er septembre 2026.
// À revoir : chômage du troisième trimestre (Insee, 10 novembre 2026), puis du quatrième, avant le vote (la règle
// des 548 jours suppose un chômage sous 9 %, sans hausse de 0,8 point en un trimestre) ; prochaines prévisions de
// l'Unédic, et lois de finances et de financement de la sécurité sociale pour 2027 (un nouveau prélèvement de l'État
// rend caduc « Sans nouveau prélèvement… ») ; revalorisation du RSA et de l'AAH au 1er avril 2027, avant le premier
// tour du 18 avril ; nouvelles éditions de la DREES (minima sociaux) et de France Travail (part des indemnisés) ;
// ou si ces règles changent.
// (solidarites-9.) Dans cette édition, les vidéos solidarites-rsa et solidarites-handicap et les passages
// solidarites-intro-05 et -06 ne sont pas montrés : les montants du RSA et de l'AAH, les allocataires et dépenses de
// minima sociaux et les foyers au RSA n'y sont dits nulle part, et ces échéances ne valent pour les vidéos que s'ils y
// reviennent. Passages à revoiser à ces échéances : solidarites-intro-04, solidarites-chomage-03, -04, -06, -07 et
// -08-p27.
// Périmètre (solidarites-7) : seule la question d'origine solidarites-x1 a une équivalente ici (solidarites-1,
// « Quelle orientation pour l'assurance chômage et les minima sociaux ? »). Sa fiche ne porte ni les chiffres de la
// vidéo « RSA » (651,69 €, 78,20 €, 1,89 million, préremplissage, fraude ; seul le non-recours y est), ni ceux de la
// vidéo « Handicap » (AAH, MDPH, AESH, accessibilité), ni ceux des passages intro-05 et -06 (4,25 millions
// d'allocataires, 33,3 Md€) : options « ne pas la montrer » (1), « la retirer » (3) et « ne pas les montrer » (2) de
// l'arbitrage. La vidéo « RSA » est retirée entière, pour garder ensemble le non-recours et la fraude. L'introduction
// ne cite plus la source de ses passages 05 et 06 (DREES, minima sociaux), et annonce les deux approfondissements
// montrés ici (assurance chômage, contreparties), comme une liste non fermée (« Parmi d'autres », solidarites-8) :
// les questions solidarites-2 (politique familiale) et solidarites-3 (protection de l'enfance) n'ont pas de vidéo.
// Une édition ne peut pas ajouter de vidéo : leurs approfondissements (point 4 de l'arbitrage) restent à écrire dans
// une série, avec leurs planches et leurs voix, à partir de leurs fiches.
// Fiche (à rapprocher, hors de ce fichier) : la fiche solidarites-1 de cette élection (bank.json, figures[1]) donne le
// libellé du solde sans la phrase sur 2027 ni la synthèse du Bureau de l'Unédic, que reprennent le libellé de
// solidarites-chomage-07 et la voix de -08 (solidarites-4 à -6) ; elle ne porte pas non plus 8,3 % (intro-04) ni
// 730 jours (chomage-04), hors relecture.
// Planches à adapter (pistes/planches/solidarites.tsx et pistes/dessin/mises.tsx, hors de ce fichier) : intro07
// dessine déjà les deux questions (mallette, document) sans changement ; intro08 (Sommaire) lit la série d'origine
// et montre quatre chapitres au lieu de deux ; ch06 doit écrire la légende de l'alt (solidarites-10) ; ch08 doit
// ajouter la flèche « dépenses » et la mention « à revoir à la baisse » sous l'excédent prévu en 2027 (draw corrigé,
// solidarites-5).
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/** La source du chômage de l'introduction, seule gardée (intro-05 et -06 ne sont pas montrés) */
const INSEE_CHOMAGE: VideoSource = {
  title: 'Au deuxième trimestre 2026, le taux de chômage augmente de 0,2 point et atteint 8,3 % (Informations rapides n° 192)',
  url: 'https://www.insee.fr/fr/statistiques/9032359',
  publisher: 'Insee',
  date: '2026-08-07',
}

/** Les sources de la vidéo solidarites-chomage, copiées de la série, puis la synthèse du Bureau de l'Unédic */
const CHOMAGE_SOURCES: VideoSource[] = [
  {
    title: 'Code du travail, articles L5422-20 et L5422-20-1',
    url: 'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006189825',
    publisher: 'Légifrance',
  },
  {
    title: 'Allocation chômage d’aide au retour à l’emploi (ARE) d’un salarié du secteur privé dont la fin de contrat de travail intervient à compter du 1er avril 2025',
    url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F38881',
    publisher: 'Service-public.gouv.fr (DILA)',
    date: '2026-07-23',
  },
  {
    title: 'Rupture conventionnelle : ce qui change au 1er septembre 2026',
    url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18945',
    publisher: 'Service-public.gouv.fr (DILA)',
    date: '2026-06-12',
  },
  {
    title: 'Part des demandeurs d’emploi indemnisables : situation au 31 décembre 2025 (n° 26.014)',
    url: 'https://statistiques.francetravail.org/indem/indempub/229912',
    publisher: 'France Travail, service statistique',
    date: '2026-09-24',
  },
  {
    title: 'Prévisions financières de l’Unédic, juin 2026',
    url: 'https://www.unedic.org/publications/previsions-financieres-de-lunedic-juin-2026',
    publisher: 'Unédic',
    date: '2026-06-17',
  },
  // solidarites-4 à -6 : la prévision de 2027 « sensiblement revue à la baisse »
  {
    title: 'Synthèse du Bureau de l’Unédic du 23 septembre 2026',
    url: 'https://www.unedic.org/actualites/synthese-du-bureau-de-lunedic-du-23-septembre-2026',
    publisher: 'Unédic',
    date: '2026-10-02',
  },
]

export const SOLIDARITES: SeriesPatch = {
  videos: {
    /* ——— Introduction ——— */
    // solidarites-7 : la question de cette élection ; sans les passages 05 et 06 (chiffres absents de sa fiche), ni
    // leur source. solidarites-7 (point 5) et solidarites-8 : les deux approfondissements montrés ici, liste non fermée.
    'solidarites-intro': {
      questionIds: ['solidarites-1'],
      sources: [INSEE_CHOMAGE],
      segments: {
        'solidarites-intro-05': 'omit',
        'solidarites-intro-06': 'omit',
        'solidarites-intro-07': {
          say: 'Parmi d’autres, deux questions se posent. Quelle assurance chômage ? Et quelles contreparties aux allocations ?',
          draw: 'Deux pictogrammes côte à côte, dessinés l’un après l’autre : une mallette, un contrat.',
          emphasis: ['assurance chômage', 'contreparties'],
        },
        'solidarites-intro-08': {
          say: 'Ce sont les deux sujets des vidéos qui suivent.',
          draw: 'Les deux pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      },
    },

    /* ——— Assurance chômage ——— */
    // solidarites-7 : la question de cette élection. Sources : la synthèse du Bureau de l'Unédic ajoutée en dernier
    // (index 5) ; les autres index ne changent pas.
    'solidarites-chomage': {
      questionIds: ['solidarites-1'],
      sources: CHOMAGE_SOURCES,
      segments: {
        // solidarites-10 : le périmètre des inscrits (catégories A, B et C), écrit par la planche, sans changer la voix
        'solidarites-chomage-06': {
          alt: 'Inscrits sans emploi ou en activité réduite : les deux barres sur une échelle de 0 à 100 %.',
        },
        // solidarites-4 : le libellé de la fiche corrigée (recettes et dépenses, prévision de 2027 datée et sa révision)
        'solidarites-chomage-07': {
          figure: {
            value: '−2,3 Md€',
            label: 'Solde de l’assurance chômage prévu pour 2026 par l’Unédic, qui gère le régime (+0,1 Md€ en 2025). Ses recettes baisseraient (44,3 Md€, contre 45,4 Md€ en 2025) et ses dépenses augmenteraient (46,6 Md€, contre 45,3 Md€). L’Unédic attribue la baisse de ses recettes à des prélèvements de l’État et à des pertes de CSG sur les travailleurs indépendants. Dette attendue fin 2026 : 61,5 Md€. En juin, sans nouveau prélèvement, elle prévoyait +2,1 Md€ en 2027 ; le 23 septembre 2026, son Bureau a indiqué que ce solde devrait être « sensiblement revu à la baisse », la situation économique se dégradant.',
            date: '2026',
            sourceIndex: 4,
          },
        },
        // solidarites-5, solidarites-6 : les deux causes (dépenses, recettes), la dette, puis la prévision de 2027 au
        // passé avec sa révision annoncée. emphasis inchangé (la planche lit CSG, État, 2,1 milliards dans cet ordre).
        // Le dessin donne la même place aux dépenses et signale la révision (planche ch08 à adapter).
        'solidarites-chomage-08': {
          say: 'Selon l’Unédic, ses dépenses augmentent et ses recettes baissent, par des pertes de CSG et des prélèvements de l’État. Sa dette atteindrait 61,5 milliards fin 2026. L’excédent prévu en 2027, 2,1 milliards, serait nettement revu à la baisse.',
          spoken: 'Selon l’Unédic, ses dépenses augmentent et ses recettes baissent, par des pertes de C.S.G. et des prélèvements de l’État. Sa dette atteindrait soixante et un virgule cinq milliards fin deux mille vingt-six. L’excédent prévu en deux mille vingt-sept, deux virgule un milliards, serait nettement revu à la baisse.',
          draw: 'Une tirelire : deux flèches en partent, vers des pièces en pointillé et vers un bâtiment public, et une troisième, marquée « dépenses », s’épaissit ; en dessous, une flèche qui monte vers l’excédent prévu en 2027, avec la mention « à revoir à la baisse ».',
        },
      },
    },

    /* ——— RSA et minima sociaux ——— */
    // solidarites-7 (point 1, « ne pas la montrer ») : la fiche de solidarites-1 ne porte que le non-recours, pas le
    // montant, les foyers, le préremplissage ni la fraude ; la vidéo reste dans la série d'origine.
    'solidarites-rsa': {
      omit: true,
    },

    /* ——— Contreparties ——— */
    // solidarites-7 : la question de cette élection, dont la fiche porte désormais le plafond de 50 % du RSA
    // (correction solidarites-2 de la fiche).
    'solidarites-contreparties': {
      questionIds: ['solidarites-1'],
    },

    /* ——— Handicap ——— */
    // solidarites-7 (point 3, « la retirer ») : aucune question ni fiche de cette élection ne porte ses chiffres ; la
    // vidéo reste dans la série d'origine.
    'solidarites-handicap': {
      omit: true,
    },
  },
}
