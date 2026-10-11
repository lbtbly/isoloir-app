// Édition « présidentielle 2027 » de la série « Logement » (src/ui/videos/series/logement.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/logement.json).
// Datée : fin de l'essai d'encadrement des loyers en novembre 2026 sans nouvelle loi (examen au Sénat le
// 21 octobre 2026) : réécrire et réenregistrer logement-loyers-04 selon l'issue. À revoir aussi avant le vote :
// autorisations sur douze mois (intro-05, publication mensuelle du SDES), reprise des mises en chantier
// (construire-03), aides à l'investissement locatif (construire-07, nouveau dispositif créé en loi de finances
// pour 2026, loi de finances pour 2027), règles d'urbanisme (construire-05, projet de loi « relance et
// décentralisation du logement », adopté par le Sénat en juillet 2026), taxe sur les logements vacants
// (existant-04 : TLV et THLV fusionnées à partir de 2027 selon le Trésor-Éco n° 405), calendrier d'interdiction
// de louer les passoires (existant-07).
// logement-loyers-04, une fois l'issue connue (correction logement-17, pas encore appliquée : le texte d'origine
// est exact d'ici là) : « C’est un essai ouvert par une loi de 2018, puis prolongé jusqu’en novembre 2026. »,
// suivi, selon l'issue, de « Une loi de [mois] 2026 l’a rendu permanent. », « Une loi de [mois] l’a prolongé
// jusqu’en [date]. » ou « Faute de loi adoptée à temps, il a pris fin en novembre 2026. » ; le spoken, le dessin
// (sablier sur novembre 2026, drapeau sur le 21 octobre) et l'emphasis suivent. Source de la durée de l'essai :
// le rapport de la mission d'évaluation (sources[4] de la vidéo).
// logement-existant-08 (correction logement-25, pas appliquée : sa condition n'est pas remplie, aucune autre
// correction retenue ne fait réenregistrer la voix de « Les logements qui existent déjà », et elle ne justifie
// pas à elle seule un réenregistrement). À reprendre si cette voix est réenregistrée pour une autre raison, en
// retirant « Mais » pour mettre les deux effets à égalité : « Rénover réduit les factures, et selon le Trésor,
// la mesure incite les propriétaires à engager des travaux. D’après une étude qu’il cite, l’annonce de
// l’interdiction des G aurait aussi poussé certains propriétaires à vendre plutôt qu’à rénover. »
// Questions : celles de la présidentielle. L'introduction mène d'abord à la fiche de logement-1 (levier
// prioritaire), dont l'explication reprend ses chiffres ; « Les logements qui existent déjà » éclaire aussi
// logement-3 (logements mal isolés), par ses passages sur les passoires énergétiques (06 à 08). Les autres
// vidéos gardent la traduction du périmètre : « L’encadrement des loyers », logement-2 ; « Le logement social »
// et « Construire », logement-1.
import type { SeriesPatch } from '../types'

/* ——— Le Trésor-Éco n° 405, à l'adresse de la page de l'article : l'ancienne adresse du PDF renvoie une erreur 404 ——— */

const TRESOR = {
  title: 'Trésor-Éco n° 405 – Logement : des tensions structurelles pesant sur l’offre et la mobilité',
  url: 'https://www.tresor.economie.gouv.fr/Articles/2026/10/02/logement-des-tensions-structurelles-pesant-sur-l-offre-et-la-mobilite',
  publisher: 'Direction générale du Trésor',
  date: '2026-10-02',
}

/* ——— Les autres sources, copiées de la série (les listes de sources sont données en entier) ——— */

const INSEE_PORTRAIT = {
  title: 'Logement – France, portrait social, édition 2025',
  url: 'https://www.insee.fr/fr/statistiques/8612550?sommaire=8612596',
  publisher: 'Insee',
  date: '2025-11-18',
}

const COUR_SOCIAL = {
  title: 'Rapport public annuel 2026 – Faciliter le parcours d’accès au logement social dans les territoires',
  url: 'https://www.ccomptes.fr/sites/default/files/2026-03/20260325-RPA-2026-I-4-Faciliter-le-parcours-d-acces-au-logement-social_0.pdf',
  publisher: 'Cour des comptes',
  date: '2026-03-25',
}

const SDES_CONSTRUCTION = {
  title: 'Construction de logements : résultats à fin août 2026 (France entière)',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/construction-de-logements-resultats-fin-aout-2026-france-entiere',
  publisher: 'SDES – Ministère de la Transition écologique',
  date: '2026-09-29',
}

const SP_ENCADREMENT = {
  title: 'En quoi consiste l’encadrement des loyers à respecter en zone tendue ?',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F1314',
  publisher: 'Service-Public.fr (DILA)',
  date: '2026-08-01',
}

const AN_TEXTE = {
  title: 'Texte adopté n° 196 – Proposition de loi pour retrouver la confiance et l’équilibre dans les rapports locatifs',
  url: 'https://www.assemblee-nationale.fr/dyn/17/textes/l17t0196_texte-adopte-provisoire',
  publisher: 'Assemblée nationale',
  date: '2025-12-11',
}

const SENAT_ODJ = {
  title: 'Ordre du jour du Sénat (proposition de loi n° 217, 2025-2026)',
  url: 'https://www.senat.fr/ordre-du-jour/ordre-du-jour.html',
  publisher: 'Sénat',
  date: '2026-10-03',
}

const EVALUATION = {
  title: 'L’encadrement des loyers : effets économiques et redistributifs – Rapport de la mission d’évaluation (G. Chapelle, G. Fack, avec l’IGEDD et l’IGF)',
  url: 'https://www.clcv.org/storage/app/media/RAPPORT%20FACK%20CHAPELLE.pdf',
  publisher: 'Mission d’évaluation commandée par le Premier ministre (copie hébergée par la CLCV)',
  date: '2026-05',
}

const SDES_SOCIAL = {
  title: '5,4 millions de logements locatifs sociaux en France au 1er janvier 2025',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/54-millions-de-logements-locatifs-sociaux-en-france-au-1er-janvier-2025',
  publisher: 'SDES – Ministère de la Transition écologique',
  date: '2026-01-20',
}

const SDES_TERRAINS = {
  title: 'Le prix des terrains et du bâti pour les maisons individuelles en 2024',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/le-prix-des-terrains-et-du-bati-pour-les-maisons-individuelles-en-2024',
  publisher: 'SDES – Enquête sur le prix des terrains à bâtir',
  date: '2025-11-27',
}

const INSEE_PARC = {
  title: 'Parc de logements au 1er janvier 2026 – Insee Focus n° 388',
  url: 'https://www.insee.fr/fr/statistiques/9055697',
  publisher: 'Insee',
  date: '2026-09-30',
}

const COUR_VACANTS = {
  title: 'La lutte contre les logements vacants dans le parc privé',
  url: 'https://www.ccomptes.fr/fr/publications/la-lutte-contre-les-logements-vacants-dans-le-parc-prive',
  publisher: 'Cour des comptes',
  date: '2025-05-22',
}

const SP_VACANTS = {
  title: 'Taxe annuelle sur les logements vacants (TLV) et taxe d’habitation sur les logements vacants (THLV)',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F17293',
  publisher: 'Service-Public.fr (DILA)',
  date: '2025-06-11',
}

const SP_TOURISME = {
  title: 'Locations touristiques : de nouvelles règles en 2025 ?',
  url: 'https://www.service-public.gouv.fr/particuliers/actualites/A17883',
  publisher: 'Service-Public.fr (DILA)',
  date: '2025-01-20',
}

const SDES_DPE = {
  title: 'Le parc de logements par classe de performance énergétique au 1er janvier 2025',
  url: 'https://www.statistiques.developpement-durable.gouv.fr/le-parc-de-logements-par-classe-de-performance-energetique-au-1er-janvier-2025',
  publisher: 'SDES – Observatoire national de la rénovation énergétique',
  date: '2025-11-12',
}

const MTE_DPE = {
  title: 'Diagnostic de performance énergétique (DPE)',
  url: 'https://www.ecologie.gouv.fr/politiques-publiques/diagnostic-performance-energetique-dpe',
  publisher: 'Ministère de la Transition écologique',
  date: '2025-12-19',
}

export const LOGEMENT: SeriesPatch = {
  videos: {
    'logement-intro': {
      // D'abord logement-1 : « Voir la fiche » mène à sa fiche, celle du levier prioritaire
      questionIds: ['logement-1', 'logement-2'],
      // Le Trésor-Éco à sa nouvelle adresse (logement-22)
      sources: [INSEE_PORTRAIT, TRESOR, COUR_SOCIAL, SDES_CONSTRUCTION],
      segments: {
        // La dispersion, à côté de la médiane, dans le libellé affiché seulement : la voix ne change pas (logement-23)
        'logement-intro-02': {
          figure: {
            value: '29,6 %',
            label: 'Taux d’effort médian des locataires du parc privé : la moitié d’entre eux consacrent plus de 29,6 % de leur revenu au logement (loyer, charges, eau, énergie, assurance), aides déduites. Pour les locataires du privé parmi le quart de la population au niveau de vie le plus faible : 42,3 % (France métropolitaine)',
            date: '2023',
            sourceIndex: 0,
          },
        },
      },
    },
    'logement-loyers': {
      // Un titre qui décrit le dispositif, sans se lire comme un programme (logement-18)
      title: 'L’encadrement des loyers',
      // Le Trésor-Éco à sa nouvelle adresse (logement-22) ; les chiffres des passages 05 et 06 viennent désormais
      // du rapport de la mission d'évaluation (sources[4])
      sources: [SP_ENCADREMENT, AN_TEXTE, SENAT_ODJ, TRESOR, EVALUATION],
      segments: {
        // « En moyenne », et non « en deux ans » : l'effet atteint environ 5 % après deux ans (logement-15)
        'logement-loyers-05': {
          say: 'Effet mesuré sur les loyers : 2 à 4 % de moins en moyenne. Sur un loyer de 800 euros, 16 à 32 euros par mois.',
          spoken: 'Effet mesuré sur les loyers : deux à quatre pour cent de moins en moyenne. Sur un loyer de huit cents euros, seize à trente-deux euros par mois.',
          figure: {
            value: '−2 à −4 %',
            label: 'Effet moyen estimé du plafonnement sur les loyers des annonces, hors Paris ; il semble se renforcer avec le temps (environ −5 % après deux ans hors Île-de-France)',
            date: 'Évaluation publiée en mai 2026',
            sourceIndex: 4,
          },
        },
        // Une baisse des annonces, dont le rapport ne peut pas établir la cause, et non une perte de logements
        // (logement-12, libellé logement-13, dessin logement-14). La planche (pistes/planches/logement.tsx, loyers06)
        // est à redessiner d'après le nouveau « draw » : elle montre encore des maisons qui s'effacent.
        'logement-loyers-06': {
          say: 'Effet mesuré hors Île-de-France : environ 8 % d’annonces de location en moins, et pas de baisse à Paris. Moins de logements à louer, ou des locataires qui restent plus longtemps ? Selon le rapport d’évaluation, les données ne permettent pas de trancher.',
          spoken: 'Effet mesuré hors Île-de-France : environ huit pour cent d’annonces de location en moins, et pas de baisse à Paris. Moins de logements à louer, ou des locataires qui restent plus longtemps ? Selon le rapport d’évaluation, les données ne permettent pas de trancher.',
          draw: 'Un panneau de 100 petites annonces « à louer » ; 8 s’effacent en pointillé. À côté, une fenêtre allumée où un locataire reste chez lui, et un point d’interrogation entre les deux.',
          emphasis: ['8 %', 'trancher'],
          figure: {
            value: '−8 %',
            label: 'Effet estimé du plafonnement sur le nombre de nouvelles annonces de location, dans les villes concernées hors Île-de-France. Recul de l’offre, locataires qui restent plus longtemps ou annonces passées ailleurs : les données ne permettent pas de trancher (pas de baisse des annonces à Paris)',
            date: 'Évaluation publiée en mai 2026',
            sourceIndex: 4,
          },
        },
        // La question de cette élection, qui laisse toutes les options ouvertes, de la suppression au gel (logement-16)
        'logement-loyers-09': {
          say: 'Alors, quelles règles pour les loyers ?',
          emphasis: ['quelles règles'],
        },
      },
    },
    'logement-social': {
      // Le Trésor-Éco à sa nouvelle adresse (logement-22)
      sources: [COUR_SOCIAL, TRESOR, SDES_SOCIAL],
      segments: {
        // Le montant et ce qu'il couvre, sans le bénéfice d'une approche (logement-20)
        'logement-social-07': {
          say: 'Le soutien public au logement social, pour construire et rénover, était de 9,9 milliards d’euros en 2025.',
          spoken: 'Le soutien public au logement social, pour construire et rénover, était de neuf virgule neuf milliards d’euros en deux mille vingt-cinq.',
        },
        // Le décalage inverse, du même paragraphe de la Cour des comptes (sources[0]) (logement-19)
        'logement-social-08': {
          say: 'Selon des rapports publics, la moitié des demandes vient de personnes seules, et les petits logements manquent. Seuls 7 % des logements sociaux ont les loyers les plus bas, quand 60 % des demandeurs y ont droit. Et le loyer ne dépend pas directement des revenus.',
          spoken: 'Selon des rapports publics, la moitié des demandes vient de personnes seules, et les petits logements manquent. Seuls sept pour cent des logements sociaux ont les loyers les plus bas, quand soixante pour cent des demandeurs y ont droit. Et le loyer ne dépend pas directement des revenus.',
          // Dans cet ordre, la planche garde les deux premiers à leur place
          emphasis: ['personnes seules', 'petits logements', '7 %'],
        },
      },
    },
    'logement-construire': {
      // Le Trésor-Éco à sa nouvelle adresse (logement-22)
      sources: [TRESOR, SDES_TERRAINS],
      segments: {
        // La limite inflationniste, que le Trésor relève pour une partie des aides au logement, pas pour ces seules
        // aides (logement-21)
        'logement-construire-07': {
          say: 'Pour encourager les particuliers à acheter des logements à louer, il existe des aides : 2,2 milliards d’euros en 2025. Limite relevée par le Trésor, pour ces aides comme pour d’autres aides au logement : là où le terrain manque, elles peuvent faire monter les prix.',
          spoken: 'Pour encourager les particuliers à acheter des logements à louer, il existe des aides : deux virgule deux milliards d’euros en deux mille vingt-cinq. Limite relevée par le Trésor, pour ces aides comme pour d’autres aides au logement : là où le terrain manque, elles peuvent faire monter les prix.',
        },
      },
    },
    'logement-existant': {
      // Les passoires énergétiques (06 à 08) éclairent aussi la question des logements mal isolés
      questionIds: ['logement-1', 'logement-3'],
      // Le Trésor-Éco à sa nouvelle adresse (logement-22)
      sources: [INSEE_PARC, COUR_VACANTS, SP_VACANTS, SP_TOURISME, SDES_DPE, MTE_DPE, TRESOR],
    },
  },
}
