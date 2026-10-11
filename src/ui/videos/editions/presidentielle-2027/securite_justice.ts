// Édition « présidentielle 2027 » de la série « Sécurité et justice » (src/ui/videos/series/securite_justice.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/securite_justice.json).
// Datée : blocages de lycées de l'automne 2026 (vidéo propre à la primaire) ; amende forfaitaire pour usage de
// stupéfiants de 500 € depuis le 20 août 2026 ; chiffres de l'incarcération au 1er septembre 2026 (publiés chaque
// mois) ; violences enregistrées en 2025 (bilan 2026 du SSMSI attendu début 2027) ; effectifs visés par le projet
// de budget 2026 (à confronter à la loi de finances pour 2026 et au projet de loi de finances pour 2027) ; médiane
// européenne des juges (CEPEJ, données 2022) ; règles d'usage des armes (article L435-1 du code de la sécurité
// intérieure) : une proposition de loi créant une présomption de légitime défense, adoptée par l'Assemblée en
// juillet 2026, attend le Sénat. À revoir après octobre 2026, puis avant le premier tour du 18 avril 2027.
// Questions : aucune correction ne change les questions des vidéos ; elles restent celles que donne le périmètre
// (src/elections/presidentielle-2027/videos.ts : police → securite_justice-2, trafic de drogue → securite_justice-3,
// justice pénale → securite_justice-1). La question des blocages de lycées n'a pas d'équivalent ici : la vidéo
// securite-lycees est retirée de cette édition (securite_justice-1) et reste dans l'archive de la primaire.
// Passages ajoutés : une édition ne renumérote pas les passages d'origine (leurs voix sont enregistrées) ; les deux
// nouveaux passages sont insérés sous les identifiants securite-police-01-violences-p27 (securite_justice-11) et
// securite-drogues-02-reglements-p27 (securite_justice-18).
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/securite_justice.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la vidéo securite-police, reprises de la série pour en donner la liste complète ——— */

const SENAT_PLF2026_SECURITES: VideoSource = {
  title: 'Projet de loi de finances pour 2026 : Sécurités (Gendarmerie nationale – Police nationale) – Rapport général n° 139 (2025-2026), tome III, annexe 28',
  url: 'https://www.senat.fr/rap/l25-139-328-1/l25-139-328-1_mono.html',
  publisher: 'Sénat – commission des finances',
  date: '2025-11-24',
}

const DDD_RELATIONS_POLICE: VideoSource = {
  title: 'Relations police/population : contrôles d’identité et dépôts de plainte – Enquête Accès aux droits, 2e édition, volume 1 (dossier de presse)',
  url: 'https://www.defenseurdesdroits.fr/sites/default/files/2025-07/ddd_EAD-2024_volume-1_relations-police-population_DP.pdf',
  publisher: 'Défenseur des droits',
  date: '2025-06',
}

const CSI_L435_1: VideoSource = {
  title: 'Code de la sécurité intérieure, article L435-1',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000034107970',
  publisher: 'Légifrance',
  date: 'en vigueur depuis le 2 mars 2017',
}

const CNIL_ECOLES: VideoSource = {
  title: 'Les dispositifs vidéo dans les établissements scolaires',
  url: 'https://www.cnil.fr/fr/la-videosurveillance-videoprotection-dans-les-etablissements-scolaires',
  publisher: 'Commission nationale de l’informatique et des libertés (CNIL)',
  date: '2025-09-12',
}

/** securite_justice-11 : la base du SSMSI (chiffre n° 0 de la fiche de la question), déjà source de l'introduction */
const SSMSI_VICTIMES: VideoSource = {
  title: 'Base nationale des caractéristiques des victimes enregistrées par la police et la gendarmerie nationales (fichier xlsx)',
  url: 'https://static.data.gouv.fr/resources/principales-caracteristiques-des-victimes-enregistrees-et-des-mis-en-cause-pour-des-infractions-elucidees-par-la-police-et-la-gendarmerie-nationales/20260129-160110/donnee-nat-caract-victimes-data.gouv-2025-produit-le-29012026.xlsx',
  publisher: 'Ministère de l’Intérieur – SSMSI (data.gouv.fr)',
  date: '2026-01-29',
}

export const SECURITE_JUSTICE: SeriesPatch = {
  videos: {
    // securite_justice-2 à 5 : l'introduction n'annonce plus « quatre » questions ni les blocages de lycées ; la
    // formulation reste vraie dans les deux élections.
    'securite-intro': {
      segments: {
        'securite-intro-07': {
          say: 'Alors, plusieurs questions se posent. Parmi elles : quelle priorité pour la police ? Comment lutter contre le trafic de drogue ? Et quelle orientation pour la justice pénale ?',
          draw: 'Trois pictogrammes en grille, dessinés l’un après l’autre : un bouclier, des billets, un palais de justice.',
        },
        'securite-intro-08': {
          say: 'Ce sont les sujets des vidéos qui suivent.',
          draw: 'Les trois pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      },
    },
    'securite-police': {
      // securite_justice-11 : la base du SSMSI ajoutée en n° 4 (les index 0 à 3 ne bougent pas)
      sources: [SENAT_PLF2026_SECURITES, DDD_RELATIONS_POLICE, CSI_L435_1, CNIL_ECOLES, SSMSI_VICTIMES],
      segments: {
        // securite_justice-10 : la légende reprend la trajectoire relevée par le Sénat (même source, n° 0) ; ni say
        // ni spoken ne changent.
        'securite-police-02': {
          figure: {
            value: '+3 872',
            label: 'Postes de policiers (équivalents temps plein) visés entre 2023 et 2027, et +3 540 dans la gendarmerie, selon la trajectoire liée à la loi de programmation du ministère de l’Intérieur relevée par le Sénat (ces cibles ne sont pas inscrites dans la loi elle-même). Après un gel en 2025, le projet de budget 2026 prévoyait +1 000 postes dans la police et +400 dans la gendarmerie ; selon le Sénat, la police atteindrait ainsi son objectif dès 2026 (+4 041 postes de 2023 à 2026), et la gendarmerie resterait à 1 145 postes du sien (+2 395 postes)',
            date: '2023-2027',
            sourceIndex: 0,
          },
        },
      },
      insert: [
        {
          // securite_justice-11 : les violences auxquelles répondent policiers et gendarmes (chiffre n° 0 de la fiche),
          // avant les moyens ; dessin à la même échelle depuis zéro, pour ne pas grossir la hausse.
          // Texte arbitré coupé en trois phrases (25 mots au plus par phrase, GUIDE-SERIES §7), chiffres inchangés.
          after: 'securite-police-01',
          segment: {
            id: 'securite-police-01-violences-p27',
            say: 'Côté violences, la police et la gendarmerie ont enregistré 472 956 victimes de violences physiques en 2025. En 2024, 449 819. Plus de la moitié dans le cadre familial.',
            spoken: 'Côté violences, la police et la gendarmerie ont enregistré quatre cent soixante-douze mille neuf cent cinquante-six victimes de violences physiques en deux mille vingt-cinq. En deux mille vingt-quatre, quatre cent quarante-neuf mille huit cent dix-neuf. Plus de la moitié dans le cadre familial.',
            visual: 'figure',
            draw: 'Deux colonnes au trait depuis zéro, à la même échelle, 2024 et 2025, le nombre écrit au bout ; dans la colonne de 2025, un peu plus de la moitié se hachure : le cadre familial.',
            alt: 'Deux colonnes à la même échelle : 449 819 victimes en 2024, 472 956 en 2025 ; dans la seconde, la part du cadre familial, 256 863, est hachurée.',
            emphasis: ['472 956 victimes', '449 819'],
            figure: {
              value: '472 956',
              label: 'Victimes de violences physiques enregistrées par la police et la gendarmerie en 2025, contre 449 819 en 2024 ; plus de la moitié (256 863) dans le cadre familial (France métropolitaine et départements d’outre-mer)',
              date: '2025',
              sourceIndex: 4,
            },
          },
        },
      ],
    },
    'securite-drogues': {
      segments: {
        // securite_justice-19 : plus de flèche de la loi vers les billets, qui suggérerait une cause ; voix inchangée.
        'securite-drogues-01': {
          draw: 'Un texte de loi marqué « interdit » ; à côté, sans flèche qui les relie, une liasse de billets, puis un point d’interrogation.',
        },
      },
      insert: [
        {
          // securite_justice-18 : la violence des réseaux, chiffre de la fiche de la question (source n° 0, déjà dans
          // la liste), après ce que pèse le trafic.
          // Texte arbitré coupé en deux phrases (25 mots au plus par phrase, GUIDE-SERIES §7), faits et attribution inchangés.
          after: 'securite-drogues-02',
          segment: {
            id: 'securite-drogues-02-reglements-p27',
            say: 'Le Sénat cite une note de la police judiciaire de 2023. Selon elle, 80 à 90 % des règlements de comptes, des meurtres et tentatives de meurtre entre délinquants sont liés au trafic de stupéfiants.',
            spoken: 'Le Sénat cite une note de la police judiciaire de deux mille vingt-trois. Selon elle, quatre-vingts à quatre-vingt-dix pour cent des règlements de comptes, des meurtres et tentatives de meurtre entre délinquants sont liés au trafic de stupéfiants.',
            visual: 'point',
            draw: 'Une liasse de billets au trait reliée à quelques points en réseau ; de ces points partent des flèches brisées.',
            emphasis: ['80 à 90 %', 'règlements de comptes'],
          },
        },
      ],
    },
    // securite_justice-1 : question propre à la primaire, sans équivalent ici ; la vidéo reste dans l'archive.
    'securite-lycees': {
      omit: true,
    },
  },
}
