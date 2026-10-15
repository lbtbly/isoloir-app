// Édition « présidentielle 2027 » de la série « Industrie et entreprises » (src/ui/videos/series/industrie_economie.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/industrie_economie.json).
// Datée : accord UE-Mercosur (application provisoire depuis le 1er mai 2026 ; ratification suspendue depuis la saisine
// de la Cour de justice par le Parlement européen le 21 janvier 2026, avis 1/26 attendu ; demande de suspension de la
// Pologne rejetée le 29 septembre 2026, recours C-460/26 pendant ; industrie-commerce-06 dit « au 27 avril 2026 ») ;
// proposition de la Commission européenne de mars 2026 (en négociation) ; fin du dispositif d'accès régulé à
// l'électricité nucléaire au 31 décembre 2025 ; allègements de cotisations fondus en une réduction unique depuis le
// 1er janvier 2026 ; projet de loi de finances pour 2027 déposé le 1er octobre 2026, en discussion ; participations de
// l'État au 30 juin 2026 (rapport « État actionnaire » annexé à ce projet, en ligne le 15 octobre 2026 : fiche
// industrie_economie-3 et industrie-etat-02-p27/-03-p27 ; périmètre réduit depuis : FDPITMA dissous le 13 juillet
// 2026, ATMB et SFTRF cédées à la Caisse des dépôts le 31 juillet 2026) ; contrôle des investissements étrangers :
// règlement européen révisé en juin 2026, réglementation française à adapter avant fin 2026 (libellé du chiffre n° 2
// de la fiche). À revoir à chaque échéance, et au plus tard début avril 2027, avant le premier tour du 18 avril 2027.
// Périmètre (industrie_economie-19) : la question d'origine industrie_economie-1 (réindustrialisation) n'a pas
// d'équivalent ici. « L'État actionnaire » éclaire la question industrie_economie-3 de cette élection, dont la fiche
// porte ses chiffres (229,6, 209,1 et 77,6 Md€ ; « 87 entités », dans la fiche comme dans la vidéo).
// Aucune fiche de cette élection ne porte les prix de l'électricité des entreprises (0,2688 €/kWh…), le solde
// d'usines (+19, +88) ni l'emploi industriel (3 240 600) : la vidéo industrie-energie et les passages
// industrie-intro-02 et -03 ne sont pas montrés ici, et l'introduction ne cite plus les sources de ces deux passages.
// Conséquence : l'accroche industrie-intro-01 (« la France en gagne-t-elle, ou en perd-elle ? ») ne trouverait plus
// que le déficit commercial pour réponse ; elle demande ici quelle part y prennent l'État et l'Union européenne.
// Ce texte est hors de l'arbitrage du 7 octobre : à valider avant de l'enregistrer (voix industrie-intro-01-p27).
// Décision du propriétaire du 2026-10-15 (n° 6) : la fiche industrie_economie-3 porte l'article 345 du TFUE (points[1],
// source EUR-Lex, celle de TFUE_345) et les règles sur les aides d'État (points[2] : projets importants d'intérêt
// européen commun, critère de l'investisseur privé ; rapport n° 808 du Sénat, celle d'AIDES_SENAT), que disent
// industrie-etat-04-p27 et industrie-etat-05.
// Décision du propriétaire du 2026-10-15 (suivi n° 3) : la fiche (chiffres n° 0 et 1, graphique n° 0) et la vidéo
// passent au rapport « État actionnaire » 2027, au 30 juin 2026. industrie-etat-02-p27 et -03-p27 reprennent le
// chiffre n° 0 (229,6 Md€, « 87 entités », 77,6 Md€ cotés, 209,1 Md€ un an plus tôt), son graphique et sa source,
// mêmes phrases et mêmes longueurs, voix propres ; -03-p27 a sa planche (etat03p27).
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/industrie_economie.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const COMMERCE_EXTERIEUR: VideoSource = {
  title: 'Le chiffre du commerce extérieur – Analyse annuelle 2025',
  url: 'https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf',
  publisher: 'Direction générale des douanes et droits indirects',
  date: '2026-02-06',
}

const AIDES_SENAT: VideoSource = {
  title: 'L’essentiel sur le rapport de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants (rapport n° 808, 2024-2025)',
  url: 'https://www.senat.fr/rap/r24-808-1/r24-808-1-syn.pdf',
  publisher: 'Sénat',
  date: '2025-07',
}

const MERCOSUR: VideoSource = {
  title: 'Accord commercial UE - Mercosur : distinguer le vrai du faux',
  url: 'https://france.representation.ec.europa.eu/informations/accord-commercial-ue-mercosur-distinguer-le-vrai-du-faux-2026-04-27_fr',
  publisher: 'Représentation de la Commission européenne en France',
  date: '2026-04-27',
}

/* ——— La source mise à jour (décision du propriétaire du 2026-10-15) : le rapport « État actionnaire » annexé au projet
   de loi de finances pour 2027, au 30 juin 2026, remplace celui de 2026 (ETAT_ACTIONNAIRE, au 30 juin 2025) ——— */

const ETAT_ACTIONNAIRE_2027: VideoSource = {
  title: 'Rapport relatif à l’État actionnaire, annexe au projet de loi de finances pour 2027',
  url: 'https://www2.assemblee-nationale.fr/static/17/Annexes-DL/PLF_2027/10-Jaune-2027-Etat-actionnaire.pdf',
  publisher: 'Agence des participations de l’État (ministère de l’Économie), publié par l’Assemblée nationale',
  date: '2026-10',
}

/* ——— La source ajoutée par la relecture (industrie_economie-15) ——— */

const TFUE_345: VideoSource = {
  title: 'Traité sur le fonctionnement de l’Union européenne (version consolidée 2016), article 345',
  url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:12016E345',
  publisher: 'EUR-Lex (Office des publications de l’Union européenne)',
}

/** Le solde commercial, tel que le montre la série (industrie-intro-04) */
const SOLDE_COMMERCIAL = {
  value: '−69,2 Md€',
  label: 'Solde commercial des biens de la France en 2025, en amélioration de 10,0 Md€ sur un an (exportations : 614,7 Md€)',
  date: '2025',
}

export const INDUSTRIE_ECONOMIE: SeriesPatch = {
  videos: {
    /* ——— Introduction ——— */
    // industrie_economie-11, -12 : les trois questions de cette élection, dans l'ordre des vidéos qui suivent.
    // industrie_economie-19 : les questions de cette élection (dont industrie_economie-3) ; sans les passages 02 et
    // 03, ni leurs sources (BAROMETRE, EMPLOI_INDUSTRIE) : les chiffres restants changent d'index de source.
    // Conséquence de industrie_economie-19 (hors arbitrage du 7 octobre, à valider) : l'accroche ne demande plus si la
    // France « gagne ou perd », question à laquelle seul le déficit commercial répondrait désormais.
    'industrie-intro': {
      questionIds: ['industrie_economie-1', 'industrie_economie-2', 'industrie_economie-3'],
      sources: [COMMERCE_EXTERIEUR, AIDES_SENAT, MERCOSUR],
      segments: {
        'industrie-intro-01': {
          say: 'Une usine ouvre ici, une autre ferme là. Quelle part y prennent l’État et l’Union européenne ?',
        },
        'industrie-intro-02': 'omit',
        'industrie-intro-03': 'omit',
        'industrie-intro-04': {
          figure: { ...SOLDE_COMMERCIAL, sourceIndex: 0 },
        },
        'industrie-intro-05': {
          figure: {
            value: '2 267',
            label: 'Nombre d’aides publiques aux entreprises recensées en mai 2025 par le site de référence aides-entreprises.fr (État, sécurité sociale, collectivités, Union européenne…)',
            date: 'mai 2025',
            sourceIndex: 1,
          },
        },
        'industrie-intro-07': {
          say: 'Alors, trois questions se posent. Quel rôle pour l’État dans le capital des entreprises stratégiques ? Quelle politique commerciale face à la concurrence internationale ? Et que faire des aides publiques aux entreprises ?',
          draw: 'Trois pictogrammes en liste, dessinés l’un après l’autre : un bâtiment à colonnes relié à un immeuble de bureaux, un conteneur, des pièces.',
          emphasis: ['dans le capital', 'politique commerciale', 'aides publiques'],
        },
        // industrie_economie-19 : le sommaire compte quatre vidéos ici (sans industrie-energie)
        'industrie-intro-08': {
          draw: 'Le sommaire de la série : quatre pictogrammes en file, comme les chapitres d’un carnet.',
        },
      },
    },

    /* ——— L'État actionnaire ——— */
    // industrie_economie-19 : rattachée à la question industrie_economie-3 de cette élection, dont la fiche porte ses
    // chiffres de participations (industrie-etat-02 et -03 alignés sur elle : voir l'en-tête).
    // industrie_economie-15, -16 : les traités neutres sur la propriété, avant les règles sur les aides ; source EUR-Lex.
    'industrie-etat': {
      questionIds: ['industrie_economie-3'],
      sources: [ETAT_ACTIONNAIRE_2027, AIDES_SENAT, TFUE_345],
      segments: {
        // Décision du propriétaire du 2026-10-15 : chiffres au 30 juin 2026 (rapport « État actionnaire » 2027), ceux de la
        // fiche industrie_economie-3 ; mêmes phrases, mêmes longueurs. Voix propres (industrie-etat-02-p27, -03-p27).
        'industrie-etat-02': {
          say: 'Au 30 juin 2026, l’Agence des participations de l’État gérait ses parts dans 87 entités. Leur valeur était estimée à 229,6 milliards d’euros.',
          spoken: 'Au trente juin deux mille vingt-six, l’Agence des participations de l’État gérait ses parts dans quatre-vingt-sept entités. Leur valeur était estimée à deux cent vingt-neuf virgule six milliards d’euros.',
          draw: 'Une grille de 87 petites cases, une par entité, qui se remplit rangée après rangée ; le montant écrit au-dessus.',
          emphasis: ['87 entités', '229,6 milliards'],
          figure: {
            value: '229,6 Md€',
            label: 'Valeur des participations de l’État gérées par l’Agence des participations de l’État au 30 juin 2026 (87 entités), dont 77,6 Md€ dans des sociétés cotées',
            date: '30 juin 2026',
            sourceIndex: 0,
          },
          chart: {
            kind: 'series',
            unit: 'Md€',
            items: [
              { label: 'Juin 2025', value: 209.1 },
              { label: 'Juin 2026', value: 229.6 },
            ],
          },
        },
        // La planche d'origine prend « 209,1 milliards » pour la valeur du jour : planche propre (etat03p27)
        'industrie-etat-03': {
          say: 'Les sociétés cotées en Bourse en représentent 77,6 milliards. Un an plus tôt, l’ensemble valait 209,1 milliards.',
          spoken: 'Les sociétés cotées en Bourse en représentent soixante-dix-sept virgule six milliards. Un an plus tôt, l’ensemble valait deux cent neuf virgule un milliards.',
          draw: 'Deux barres à la même échelle, un an plus tôt et au 30 juin 2026 ; dans la seconde, la part des sociétés cotées comptée au bleu bille.',
          alt: 'Deux barres à la même échelle, en milliards d’euros : 209,1 un an plus tôt, 229,6 au 30 juin 2026, dont la part des sociétés cotées.',
          emphasis: ['77,6 milliards', '209,1 milliards'],
        },
        'industrie-etat-04': {
          say: 'Pour les traités européens, une entreprise peut être publique ou privée. Mais les aides publiques qui faussent la concurrence sont en principe interdites, avec des exceptions, comme les « projets importants d’intérêt européen commun ».',
          draw: 'D’abord, deux immeubles de bureaux identiques côte à côte, l’un relié au bâtiment à colonnes, l’autre non. Puis des pièces partent vers une entreprise et butent contre une barrière, un document de règles posé à côté ; un chemin en pointillé contourne la barrière pour quelques projets.',
          emphasis: ['publique ou privée', 'en principe interdites', 'des exceptions'],
        },
      },
    },

    /* ——— Le prix de l'électricité des entreprises ——— */
    // industrie_economie-19 : aucune fiche de cette élection ne porte ses chiffres ; la vidéo reste dans la série d'origine.
    'industrie-energie': {
      omit: true,
    },

    /* ——— Le commerce avec le reste du monde ——— */
    // industrie_economie-13 : la question de fin, celle de cette élection
    'industrie-commerce': {
      segments: {
        'industrie-commerce-08': {
          say: 'Alors, quelle politique commerciale face à la concurrence internationale ?',
          emphasis: ['politique commerciale'],
        },
      },
    },

    /* ——— Les achats publics ——— */
    // industrie_economie-17 : le dessin montre la règle (un marché ne peut être réservé), sans exclure personne
    'industrie-achats': {
      segments: {
        'industrie-achats-04': {
          draw: 'Un document de marché ; une étiquette « réservé » barrée ; devant, côte à côte, des dossiers d’entreprises de plusieurs pays de l’Union, dont un marqué d’une épingle sur une carte de France.',
        },
      },
    },

    /* ——— Les aides publiques aux entreprises ——— */
    'industrie-aides': {
      segments: {
        // industrie_economie-3 : la valeur et le libellé de la fiche industrie_economie-1 de cette élection
        'industrie-aides-03': {
          figure: {
            value: 'de 108 à 211 Md€',
            label: 'Aides publiques aux entreprises en 2023 selon la commission d’enquête du Sénat : au moins 211 Md€ au sens large (subventions de l’État, aides de Bpifrance, dépenses fiscales et allègements de cotisations sociales) ; 108 Md€ au sens strict, sans les interventions de Bpifrance, les avantages fiscaux sur la TVA et ceux que l’État ne compte plus officiellement comme « dépenses fiscales »',
            date: '2023',
            sourceIndex: 0,
          },
        },
        // industrie_economie-7 : le libellé de la fiche (« effet de périmètre » du CICE, selon la Cour des comptes)
        'industrie-aides-04': {
          figure: {
            value: '77,3 Md€',
            label: 'Allègements généraux de cotisations patronales du secteur privé en 2024, contre 20,9 Md€ en 2014. Sur cette hausse, 26,6 Md€ viennent des baisses de cotisations accordées en 2019 en échange de la suppression d’un crédit d’impôt (le CICE) : un « effet de périmètre », selon la Cour des comptes',
            date: '2024',
            sourceIndex: 1,
          },
        },
      },
    },
  },
}
