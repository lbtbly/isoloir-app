// Édition « présidentielle 2027 » de la série « Immigration » (src/ui/videos/series/immigration.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/immigration.json).
// Datée : la voie de régularisation par les « métiers en tension » n'est prévue par la loi que jusqu'au 31 décembre 2026,
// avant le premier tour du 18 avril 2027 (immigration-titres-04 à -06, et la fiche immigration-1) ; aucune prolongation
// au 7 octobre 2026. À revoir au 1er janvier 2027 (prolongée ou non).
// Datée : les chiffres 2025 des titres de séjour et des régularisations sont provisoires (définitifs en janvier 2027 ;
// selon le ministère, les données provisoires « sous-estiment généralement » les définitives, surtout pour les titres
// humanitaires). Le ministère de l'Intérieur a publié ses estimations pour 2025 en janvier 2026 ; une publication analogue
// pour 2026 est probable en janvier 2027 (immigration-intro-04 à -06, immigration-titres-02 et -07, immigration-langue-03
// et -06). À revoir en janvier 2027, avant le vote.
// Datée : le testing de 2019-2021 (immigration-emploi-03 et -04) ; une nouvelle vague nationale de testing a été annoncée
// par l'État pour l'automne 2025. À revoir à la parution de ses résultats.
import type { SeriesPatch } from '../types'

/** Libellé des premiers titres de séjour (immigration-intro-04, immigration-titres-02), repris de la fiche immigration-1 */
const LABEL_TITRES =
  'Premiers titres de séjour délivrés à des ressortissants de pays tiers (+9,2 % sur un an, une hausse totalement portée par les titres pour motif humanitaire : +56,8 %), dont 31,0 % pour études, 24,1 % pour motif familial, 23,3 % pour motif humanitaire, 13,5 % pour motif économique et 8,2 % pour des motifs divers (France)'

export const IMMIGRATION: SeriesPatch = {
  videos: {
    /* ——— Introduction ——— */
    'immigration-intro': {
      segments: {
        // immigration-10 : le libellé des titres, tous motifs (texte non dit)
        'immigration-intro-04': {
          figure: { value: '377 462', label: LABEL_TITRES, date: '2025 (données provisoires)', sourceIndex: 1 },
        },
        // immigration-11 : la répartition des éloignements (texte non dit)
        'immigration-intro-06': {
          figure: {
            value: '23 549',
            label:
              'Éloignements d’étrangers en situation irrégulière, en hausse de 11,1 % sur un an : 14 133 éloignements forcés, 4 564 aidés et 4 852 spontanés (France métropolitaine, majeurs). S’y ajoutent 24 512 éloignements depuis l’outre-mer, à près de 90 % depuis Mayotte',
            date: '2025',
            sourceIndex: 2,
          },
        },
        // immigration-15 : le nombre d’entrées parmi les questions, découpage non exhaustif
        'immigration-intro-07': {
          say: 'Alors, parmi d’autres, quatre questions se posent. Combien d’étrangers admettre, et pour quels motifs ? Que demander aux nouveaux arrivants, et que leur garantir ? Quel accès à l’emploi et aux aides ? Et qui éloigner, et comment ?',
          emphasis: ['Combien d’étrangers admettre', 'Que demander', 'que leur garantir', 'qui éloigner'],
        },
      },
    },

    /* ——— Titres de séjour et régularisation ——— */
    'immigration-titres': {
      segments: {
        // immigration-8 (say, spoken, emphasis), immigration-9 (draw, alt, chart), immigration-10 (libellé)
        'immigration-titres-02': {
          say: 'En 2025, sur 377 462 premiers titres, 31,0 % sont délivrés pour des études, 24,1 % pour un motif familial, 23,3 % pour un motif humanitaire. Et 13,5 % pour un motif économique.',
          spoken:
            'En deux mille vingt-cinq, sur trois cent soixante-dix-sept mille quatre cent soixante-deux premiers titres, trente et un pour cent sont délivrés pour des études, vingt-quatre virgule un pour cent pour un motif familial, vingt-trois virgule trois pour cent pour un motif humanitaire. Et treize virgule cinq pour cent pour un motif économique.',
          draw: 'Quatre barres à la même échelle, depuis zéro : les titres pour études, pour motif familial, pour motif humanitaire, pour motif économique.',
          alt: 'Quatre barres à la même échelle : pour des études, 31,0 % ; pour un motif familial, 24,1 % ; pour un motif humanitaire, 23,3 % ; pour un motif économique, 13,5 %.',
          emphasis: ['31,0 %', '24,1 %', '23,3 %', '13,5 %'],
          figure: { value: '377 462', label: LABEL_TITRES, date: '2025 (données provisoires)', sourceIndex: 0 },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Titres pour études', value: 31 },
              { label: 'Titres pour motif familial', value: 24.1 },
              { label: 'Titres pour motif humanitaire', value: 23.3 },
              { label: 'Titres pour motif économique', value: 13.5 },
            ],
          },
        },
        // immigration-12 : au passé, juste avant comme après l’échéance du 31 décembre 2026
        'immigration-titres-04': {
          say: 'La loi du 26 janvier 2024 a ouvert une voie de régularisation pour les métiers en tension, où les employeurs peinent à recruter.',
          spoken:
            'La loi du vingt-six janvier deux mille vingt-quatre a ouvert une voie de régularisation pour les métiers en tension, où les employeurs peinent à recruter.',
        },
        // immigration-13 : l’échéance dite comme une disposition de la loi (emphasis inchangée)
        'immigration-titres-06': {
          say: 'Le titre est accordé « à titre exceptionnel » : le préfet n’est pas tenu de le délivrer. Et la loi a prévu cette voie jusqu’au 31 décembre 2026.',
          spoken:
            'Le titre est accordé « à titre exceptionnel » : le préfet n’est pas tenu de le délivrer. Et la loi a prévu cette voie jusqu’au trente et un décembre deux mille vingt-six.',
        },
        // immigration-14 : la question de fin du débat présidentiel (nombre d’entrées, objectifs chiffrés)
        'immigration-titres-10': {
          say: 'Alors, combien d’étrangers admettre, pour quels motifs, et faut-il des objectifs chiffrés ?',
          emphasis: ['combien d’étrangers admettre', 'objectifs chiffrés'],
        },
      },
    },

    /* ——— Expulsions ——— */
    // immigration-16 : rattachée à la question immigration-3 de cette élection (étrangers en situation irrégulière)
    'immigration-expulsions': {
      questionIds: ['immigration-3'],
    },
  },
}
