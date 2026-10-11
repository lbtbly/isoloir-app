// Édition « présidentielle 2027 » de la série « Impôts et budget » (src/ui/videos/series/fiscalite.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/fiscalite.json).
// Datée : dette publique à fin juin 2026 (Insee, 29 septembre 2026) ; prévisions de déficit du Gouvernement pour
// 2026 et 2027 et avis du Haut Conseil des finances publiques du 25 septembre 2026 (projets de lois de finances
// pour 2027). À revoir après le vote du budget 2027 (contribution exceptionnelle des grandes entreprises, dont le
// projet de loi de finances réduit le rendement ; prélèvements sociaux sur l’épargne et IFI s’ils sont modifiés en
// séance), la dette du troisième trimestre 2026 (Insee, 18 décembre 2026), l’exécution budgétaire 2026 de l’État
// (février 2027 : droits de succession et de donation, impôt sur les sociétés, contribution exceptionnelle), le
// compte 2026 des administrations publiques (Insee, attendu fin mars 2027 : déficit, dépenses, recettes,
// prélèvements obligatoires, intérêts, dette fin 2026) et, s’il paraît avant le vote, le bulletin de la DGFiP sur
// l’IFI 2026 (l’édition 2025 est parue le 14 avril 2026). Premier tour : 18 avril 2027. Les explications de
// finances_publiques-1 (fiche fiscalite-2) et de fiscalite-1 (droits de succession, IFI, impôt minimum) sont à
// mettre à jour en même temps.
// Dans la banque de la présidentielle, « fiche fiscalite-2 » ci-dessus désigne la fiche d’origine (primaire) de
// finances_publiques-1 ; les droits de succession et de donation (16,1 et 5,1 Md€, impots-heritages-02) sont dans
// l’explication de fiscalite-2 (héritages et donations), celle de fiscalite-1 gardant l’IFI et l’impôt minimum.
// Passages à revoiser à ces échéances : impots-intro-02 à 05, impots-dette-02, 03 et 05-p27, impots-heritages-02
// et, si le bulletin de la DGFiP sur l’IFI 2026 paraît avant le vote ou si l’IFI est modifié en séance,
// impots-fortune-04.
// La vidéo impots-capital étant retirée de cette édition (fiscalite-10, option 1), l’impôt sur les sociétés, la
// contribution exceptionnelle et les prélèvements sociaux sur l’épargne n’y sont dits nulle part : ces échéances ne
// valent pour les vidéos que si elle y revient.
// Choix de fiscalite-10 : la fiche fiscalite-1 de la présidentielle ne porte que 12,8 % et 18,6 % ; 96 % des
// dividendes, 14 puis 23 Md€, 25 %, 59,9 et 7,5 Md€ n'y sont pas. L'option 2 (rattacher impots-capital à fiscalite-1)
// suppose d'abord de reprendre ces chiffres dans la fiche ; elle demanderait alors « quatre questions » / « quatre
// sujets » en impots-intro-06 et 07 (fiscalite-11 et 12, textes proposés), au lieu de « trois » ici.
import type { SeriesPatch } from '../types'

export const FISCALITE: SeriesPatch = {
  videos: {
    // fiscalite-11, fiscalite-12 : l'introduction annonce les trois approfondissements montrés ici (dette, grandes
    // fortunes, héritages), sans « À quoi affecter une recette nouvelle ? » (fiscalite-9) ni le capital (fiscalite-10).
    'impots-intro': {
      segments: {
        'impots-intro-06': {
          say: 'Alors, trois questions se posent. Que faire face à la dette ? Comment imposer les grandes fortunes ? Et les héritages ?',
          draw: 'Trois pictogrammes en grille, dessinés l’un après l’autre : une pile de pièces, un immeuble, une clé.',
        },
        'impots-intro-07': {
          say: 'Ce sont les trois sujets des vidéos qui suivent.',
          draw: 'Les trois pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      },
    },
    // fiscalite-4 : la prévision pour 2026 est une remontée du déficit, après 5,1 % en 2025.
    'impots-dette': {
      segments: {
        'impots-dette-05': {
          say: 'Le Gouvernement prévoit que le déficit remonte à 5,4 % en 2026, puis revienne à 5 % en 2027. Le Haut Conseil des finances publiques juge un retour sous 3 % en 2029 « très peu vraisemblable », sauf conjoncture très favorable.',
          spoken: 'Le Gouvernement prévoit que le déficit remonte à cinq virgule quatre pour cent en deux mille vingt-six, puis revienne à cinq pour cent en deux mille vingt-sept. Le Haut Conseil des finances publiques juge un retour sous trois pour cent en deux mille vingt-neuf « très peu vraisemblable », sauf conjoncture très favorable.',
          emphasis: ['remonte', 'très peu vraisemblable'],
        },
      },
    },
    // fiscalite-8 : le libellé du chiffre reprend la précision de la fiche (Insee Focus n° 371, section Sources).
    'impots-fortune': {
      segments: {
        'impots-fortune-02': {
          figure: {
            value: '48 %',
            label: 'Part du patrimoine brut total détenue par les 10 % de ménages les mieux dotés (France hors Mayotte, ménages en logement ordinaire). Les 1 % les mieux dotés en détiennent 15 %. Selon l’Insee, seules des données administratives permettent d’observer finement le très haut de la distribution, au sein de ces 1 %.',
            date: '2023-2024',
            sourceIndex: 0,
          },
        },
      },
    },
    // fiscalite-13 : la vidéo éclaire la question propre aux héritages et aux donations, dont la fiche porte ses chiffres.
    'impots-heritages': {
      questionIds: ['fiscalite-2'],
    },
    // fiscalite-10 : aucune fiche montrée ici ne porte ses chiffres (option 1 de l'arbitrage, voir l'en-tête).
    'impots-capital': {
      omit: true,
    },
    // fiscalite-9 : question propre à la primaire, sans équivalent ici ; la vidéo reste dans l'archive de la primaire.
    'impots-recettes': {
      omit: true,
    },
  },
}
