// Édition « présidentielle 2027 » de la série « Agriculture et alimentation » (src/ui/videos/series/agriculture.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/agriculture.json).
// Datée : la PAC de 2028-2034 est en négociation (proposition de la Commission européenne de juillet 2025) ;
// l'accord commercial entre l'Union européenne et le Mercosur s'applique à titre provisoire depuis le 1er mai
// 2026 (fiche de la Représentation de la Commission en France, avril 2026) ; le Parlement européen, qui doit
// encore se prononcer sur son approbation, a demandé le 21 janvier 2026 l'avis de la Cour de justice de l'Union.
// Par un arrêté du 5 janvier 2026 (en vigueur le 8 janvier), jugé légal par le Conseil d'État le 13 mai 2026,
// la France a suspendu l'importation de certains aliments contenant des résidus de cinq pesticides interdits
// dans l'Union ; l'arrêté prend fin dès l'entrée en application de mesures appropriées de la Commission
// européenne, et au plus tard le 8 janvier 2027. Mais la loi n° 2026-796 du 18 août 2026 (art. 2, article
// L. 236-1 A du code rural) prévoit désormais que le ministre suspende ou encadre ces importations à titre
// conservatoire, jusqu'à des mesures européennes adéquates : la suspension peut être prolongée ou reprise. La
// même loi (art. 8) réserve, sauf offre insuffisante, les repas de la restauration collective publique aux
// produits originaires de l'UE, de l'EEE ou des PTOM. À revoir si la négociation aboutit, si le statut de
// l'accord change, à la fin ou au renouvellement de la suspension, et à la parution des chiffres suivants
// avant le 18 avril 2027 : commerce extérieur 2026 (douanes, Agreste), privation matérielle et sociale
// (Insee), comptes de l'agriculture (Insee).
// Questions : celles de la présidentielle. Introduction, « Aides européennes » et « Importations » éclairent
// agriculture-1 (produits importés) ; « Revenu » et « Partage des prix », agriculture-x4 (revenu des
// agriculteurs), dont la fiche porte leurs chiffres clés (17,7 %, +10,4 %, 6,4 €, 1,1 €), mais pas encore
// 27 500, 31 300 et 23 300 € (revenu-05) ni 28,8, 11,7 et 17,1 € (prix-03), à ajouter à la fiche ;
// « Se nourrir » reste un éclairage du thème, sans question.
import type { SeriesPatch } from '../types'

/* ——— Les sources de la vidéo « Importations », liste complète (les trois premières copiées de la série) ——— */

const DOUANES = {
  title: 'Le chiffre du commerce extérieur – Analyse annuelle 2025',
  url: 'https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf',
  publisher: 'Direction générale des douanes et droits indirects',
  date: '2026-02-06',
}

const MERCOSUR = {
  title: 'Accord commercial UE - Mercosur : distinguer le vrai du faux',
  url: 'https://france.representation.ec.europa.eu/informations/accord-commercial-ue-mercosur-distinguer-le-vrai-du-faux-2026-04-27_fr',
  publisher: 'Représentation de la Commission européenne en France',
  date: '2026-04-27',
}

const ORIGINE = {
  title: 'Origin labelling',
  url: 'https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/origin-labelling_en',
  publisher: 'Commission européenne (DG Santé et sécurité alimentaire)',
}

const AGRESTE_COMEX = {
  title: 'Commerce extérieur agroalimentaire – En 2025, l’excédent agroalimentaire français atteint son plus bas niveau depuis la fin des années soixante-dix (Agreste Infos rapides, février 2026, n° 17)',
  url: 'https://agreste.agriculture.gouv.fr/agreste-web/download/publication/publie/IraCex2617/2026_17inforapcommerceext.pdf',
  publisher: 'Agreste, ministère de l’Agriculture',
  date: '2026-02',
}

const CONSEIL_ETAT_IMPORTS = {
  title: 'Fruits et légumes provenant de pays hors UE et contenant des résidus de pesticides interdits : le Gouvernement pouvait suspendre leur importation',
  url: 'https://www.conseil-etat.fr/actualites/fruits-et-legumes-provenant-de-pays-hors-ue-et-contenant-des-residus-de-pesticides-interdits-le-gouvernement-pouvait-suspendre-leur-importation',
  publisher: 'Conseil d’État',
  date: '2026-05-13',
}

const PE_MERCOSUR = {
  title: 'UE–Mercosur : les députés demandent un avis juridique sur sa conformité avec les traités de l’UE',
  url: 'https://www.europarl.europa.eu/news/fr/press-room/20260116IPR32450/ue-mercosur-meps-request-legal-opinion-on-its-compliance-with-eu-treaties',
  publisher: 'Parlement européen',
  date: '2026-01-21',
}

export const AGRICULTURE: SeriesPatch = {
  videos: {
    'agriculture-intro': {
      questionIds: ['agriculture-1', 'agriculture-x4'],
      segments: {
        // Les questions de cette élection, et non celles de la primaire
        'agriculture-intro-07': {
          say: 'Alors, comment protéger les agriculteurs face aux produits importés ? Et comment soutenir leur revenu ?',
          draw: 'Deux pictogrammes, chacun avec sa question, dessinés l’un après l’autre : un cargo, puis un porte-monnaie.',
          emphasis: ['produits importés', 'leur revenu'],
        },
      },
    },
    'agriculture-revenu': {
      questionIds: ['agriculture-x4'],
    },
    'agriculture-prix': {
      questionIds: ['agriculture-x4'],
      segments: {
        // Le poste des importations, le plus lourd du même schéma de l'Observatoire
        'agriculture-prix-03': {
          say: 'Les industries agroalimentaires en tiraient 9,4 euros. Le commerce, de gros et de détail, 18,8 euros. Et 28,8 euros payaient des importations : 11,7 d’aliments importés, 17,1 d’achats importés le long de la chaîne.',
          spoken: 'Les industries agroalimentaires en tiraient neuf virgule quatre euros. Le commerce, de gros et de détail, dix-huit virgule huit euros. Et vingt-huit virgule huit euros payaient des importations : onze virgule sept d’aliments importés, dix-sept virgule un d’achats importés le long de la chaîne.',
          draw: 'Sous la barre de 100 euros, quatre barres à la même échelle : l’agriculture, les industries agroalimentaires, le commerce, puis les importations.',
          alt: 'Sous une barre de 100 euros en pointillé, quatre barres à la même échelle : l’agriculture, les industries agroalimentaires, le commerce, les importations.',
          emphasis: ['9,4 euros', '18,8 euros', '28,8 euros'],
        },
        // Une moyenne sur sept rayons et six enseignes
        'agriculture-prix-06': {
          say: 'Une fois payés aussi le personnel, l’énergie, l’immobilier et l’impôt sur les sociétés, il restait en moyenne 1,1 euro : la marge nette.',
          spoken: 'Une fois payés aussi le personnel, l’énergie, l’immobilier et l’impôt sur les sociétés, il restait en moyenne un virgule un euro : la marge nette.',
        },
      },
    },
    'agriculture-aides': {
      questionIds: ['agriculture-1'],
      segments: {
        // L'intégration de la PAC dans des plans nationaux et régionaux, au mot de la Commission
        'agriculture-aides-05': {
          say: 'La PAC de 2028 à 2034 est en négociation. En juillet 2025, la Commission a proposé de la fondre avec d’autres programmes dans des plans nationaux et régionaux. Au moins 300 milliards resteraient réservés au revenu des agriculteurs.',
          spoken: 'La Pac de deux mille vingt-huit à deux mille trente-quatre est en négociation. En juillet deux mille vingt-cinq, la Commission a proposé de la fondre avec d’autres programmes dans des plans nationaux et régionaux. Au moins trois cents milliards resteraient réservés au revenu des agriculteurs.',
          draw: 'Une frise : la PAC actuelle de 2023 à 2027 en trait plein, la suivante de 2028 à 2034 en pointillé, qui entre dans une bande plus large marquée « plans nationaux et régionaux » ; un fanion en 2025 pour la proposition.',
          // Dans cet ordre, la planche garde la négociation et le montant à leur place ; le troisième s'y ajoute
          emphasis: ['en négociation', 'Au moins 300 milliards', 'plans nationaux et régionaux'],
        },
      },
    },
    'agriculture-importations': {
      questionIds: ['agriculture-1'],
      sources: [DOUANES, MERCOSUR, ORIGINE, AGRESTE_COMEX, CONSEIL_ETAT_IMPORTS, PE_MERCOSUR],
      segments: {
        // Le solde avec l'Union et avec le reste du monde, au lieu de la baisse déjà dite en introduction
        'agriculture-importations-02': {
          say: 'En 2025, la France a exporté 200 millions d’euros de produits agricoles et alimentaires de plus qu’elle n’en a importé. Avec les autres pays de l’Union, elle est en déficit de 3,4 milliards ; avec le reste du monde, en excédent de 3,6 milliards.',
          spoken: 'En deux mille vingt-cinq, la France a exporté deux cents millions d’euros de produits agricoles et alimentaires de plus qu’elle n’en a importé. Avec les autres pays de l’Union, elle est en déficit de trois virgule quatre milliards ; avec le reste du monde, en excédent de trois virgule six milliards.',
          draw: 'Deux colonnes presque égales, exportations et importations ; l’écart, trop fin pour se voir à l’échelle, est montré d’une flèche. Puis deux barres à la même échelle, depuis zéro : l’une vers le bas pour l’Union, l’autre vers le haut pour le reste du monde.',
          alt: 'Deux colonnes presque égales, les exportations et les importations : l’écart, trop fin pour se voir à l’échelle, est montré du doigt ; puis deux barres depuis zéro : 3,4 milliards de déficit avec l’Union, 3,6 milliards d’excédent avec le reste du monde.',
          emphasis: ['200 millions d’euros', '3,4 milliards', '3,6 milliards'],
        },
        // La suspension française de janvier 2026, au passé : vrai que la mesure dure ou non
        'agriculture-importations-04': {
          say: 'Mais leurs normes de production peuvent différer : un pesticide interdit dans l’Union peut avoir été utilisé, si les résidus restent sous la limite. En janvier 2026, la France a suspendu l’importation de certains aliments portant des résidus de cinq pesticides interdits.',
          spoken: 'Mais leurs normes de production peuvent différer : un pesticide interdit dans l’Union peut avoir été utilisé, si les résidus restent sous la limite. En janvier deux mille vingt-six, la France a suspendu l’importation de certains aliments portant des résidus de cinq pesticides interdits.',
          draw: 'Deux colonnes : deux règles identiques pour les normes sanitaires, deux règles différentes pour les normes de production ; dessous, une jauge dont le niveau reste sous la limite, et à côté une barrière devant quelques cageots, datée de janvier 2026.',
          alt: 'À gauche, les normes sanitaires, les mêmes ; à droite, les normes de production, qui peuvent différer ; une jauge des résidus, sous la limite ; une barrière devant certains aliments importés, en janvier 2026.',
          emphasis: ['normes de production', 'sous la limite', 'cinq pesticides interdits'],
        },
        // L'approbation du Parlement européen, encore attendue
        'agriculture-importations-05': {
          say: 'L’accord commercial entre l’Union et le Mercosur, des pays d’Amérique du Sud, s’applique à titre provisoire depuis le 1er mai 2026. Le Parlement européen doit encore se prononcer : en janvier 2026, il a demandé l’avis de la Cour de justice de l’Union.',
          spoken: 'L’accord commercial entre l’Union et le Mercosur, des pays d’Amérique du Sud, s’applique à titre provisoire depuis le premier mai deux mille vingt-six. Le Parlement européen doit encore se prononcer : en janvier deux mille vingt-six, il a demandé l’avis de la Cour de justice de l’Union.',
          draw: 'Deux fanions sans couleur reliés par une double flèche ; dessous, un accord au trait pointillé et un calendrier daté ; sous le calendrier, une balance au trait reliée à l’accord par une flèche en pointillé.',
          emphasis: ['à titre provisoire', 'la Cour de justice'],
        },
      },
    },
    'agriculture-alimentation': {
      // Retirée de agriculture-1, dont la fiche ne porte pas ses chiffres : un éclairage du thème
      questionIds: [],
    },
  },
}
