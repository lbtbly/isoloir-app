// Édition « présidentielle 2027 » de la série « Israël et Gaza » (src/ui/videos/series/proche_orient.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/proche_orient.json).
// Datée : bilans au 23 septembre 2026 (OCHA), procédure de la CIJ au 21 mai 2026, sanctions de l'UE au
// 28 mai 2026, réunions des ministres européens du 21 avril et du 13 juillet 2026 (options de la Commission sur
// de nouvelles mesures commerciales visant les produits des colonies), cessez-le-feu du 10 octobre 2025 et
// résolution 2803 du Conseil de sécurité (17 novembre 2025, mandat jusqu'au 31 décembre 2027 ; deuxième phase
// du plan largement bloquée au 5 octobre 2026, selon l'ONU). À revoir avant le premier tour (18 avril 2027) :
// après les élections législatives israéliennes du 27 octobre 2026, une décision du Conseil de l'UE sur
// l'accord ou sur les produits des colonies, la mise en œuvre de la résolution 2803, une décision de la CIJ
// sur le fond, le prochain rapport du HCDH sur les colonies et chaque mise à jour du bilan (cumulatif) de l'OCHA.
// La procédure de la CIJ au 21 mai 2026 n'est dite que dans « Cours et enquête » (justice-04), retirée de cette
// édition : cette échéance ne vaut pour les vidéos que si elle y revient.
// Questions : celles de la présidentielle, proche_orient-1 (la politique envers le gouvernement israélien) et
// proche_orient-2 (la position sur l'État de Palestine). L'introduction, qui annonce les deux (intro-07), les
// reçoit en propre. « Accord UE-Israël », « Colonisation » et « Conseil de sécurité » gardent la traduction du
// périmètre (international_defense-4 → proche_orient-1) : ce sont « les vidéos qui suivent » d'intro-08, sur la
// première question. « Les mots du droit » et « Cours et enquête » servent la question de la qualification
// (international_defense-2), sans équivalent ici : elles sont retirées de cette édition (proche_orient-14) et
// restent dans la série d'origine. Elles pourront revenir si la banque reçoit une question sur la
// qualification, ouverte à tout le spectre et dotée de sa fiche.
// Passages à revoiser : proche-orient-intro-01-p27, intro-07-p27, intro-08-p27, proche-orient-onu-05-p27.
// Planches : chaque passage corrigé dont le dessin change a la sienne dans pistes/planches/proche_orient.tsx, rangée sous son
// identifiant suffixé (« -p27 ») ou, si seul le dessin change, sous son champ board (editions/apply.ts).
// Les listes de sources sont complètes : les sources gardées sont copiées de la série d'origine, à l'identique.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const OCHA: VideoSource = {
  title: 'Reported impact snapshot | Gaza Strip (23 September 2026)',
  url: 'https://www.ochaopt.org/sites/default/files/Gaza_Reported_Impact_Snapshot_23_September_2026.pdf',
  publisher: 'OCHA – Bureau de la coordination des affaires humanitaires de l’ONU',
  date: '2026-09-23',
}
const CIJ: VideoSource = {
  title: 'Application de la convention pour la prévention et la répression du crime de génocide dans la bande de Gaza (Afrique du Sud c. Israël)',
  url: 'https://www.icj-cij.org/fr/affaire/192',
  publisher: 'Cour internationale de justice',
  date: '2026-09-22',
}
const CPI: VideoSource = {
  title: 'Gaza : la CPI émet des mandats d’arrêt contre les Israéliens Nétanyahou et Gallant et Deif du Hamas',
  url: 'https://news.un.org/fr/story/2024/11/1150771',
  publisher: 'ONU Info (Nations unies)',
  date: '2024-11-21',
}
const COMMERCE: VideoSource = {
  title: 'EU trade relations with Israel',
  url: 'https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/israel_en',
  publisher: 'Commission européenne – DG Commerce',
  date: '2026',
}
const COMMISSION_UE: VideoSource = {
  title: 'La Commission propose des sanctions et la suspension des concessions commerciales avec Israël',
  url: 'https://france.representation.ec.europa.eu/informations-et-evenements/informations/la-commission-propose-des-sanctions-et-la-suspension-des-concessions-commerciales-avec-israel-2025-09-17_fr',
  publisher: 'Commission européenne – Représentation en France',
  date: '2025-09-17',
}
const CONSEIL_SECURITE: VideoSource = {
  title: 'Security Council Fails to Adopt Resolution on Gaza Ceasefire (SC/16174)',
  url: 'https://press.un.org/en/2025/sc16174.doc.htm',
  publisher: 'Nations unies – Couverture des réunions',
  date: '2025-09-18',
}

/* ——— Les sources ajoutées par la relecture ——— */

/** proche_orient-11 : le cessez-le-feu du 10 octobre 2025 et l'échange d'otages et de prisonniers */
const CESSEZ_LE_FEU: VideoSource = {
  title: '7-Octobre : trois ans après, Guterres appelle à transformer un cessez-le-feu inachevé en paix durable',
  url: 'https://news.un.org/fr/story/2026/10/1159611',
  publisher: 'ONU Info (Nations unies)',
  date: '2026-10-05',
}

/** proche_orient-13 : le vote sur la résolution 2803 */
const RESOLUTION_2803_SOURCE: VideoSource = {
  title: 'Security Council Authorizes International Stabilization Force in Gaza, Adopting Resolution 2803 (2025) (SC/16225)',
  url: 'https://press.un.org/en/2025/sc16225.doc.htm',
  publisher: 'Nations unies – Couverture des réunions',
  date: '2025-11-17',
}

/* ——— Les chiffres des fiches de la présidentielle, repris tels quels ——— */

/** Fiche proche_orient-1, figure de la résolution 2803 : libellé raccourci sans en changer le sens (proche_orient-13) */
const RESOLUTION_2803 = {
  value: '13 voix pour, 0 contre',
  label: 'Vote au Conseil de sécurité de l’ONU sur la résolution 2803, qui approuve le plan de paix pour Gaza présenté par les États-Unis, après le cessez-le-feu entré en vigueur le 10 octobre 2025. Deux membres permanents, la Chine et la Russie, se sont abstenus : une abstention ne bloque pas une résolution',
  date: '17 novembre 2025',
}

export const PROCHE_ORIENT: SeriesPatch = {
  videos: {
    'proche-orient-intro': {
      // proche_orient-14 : l'introduction annonce les deux questions de cette élection (intro-07)
      questionIds: ['proche_orient-1', 'proche_orient-2'],
      // proche_orient-11 : la source du cessez-le-feu, ajoutée en dernier (les figures gardent leur index)
      sources: [OCHA, CIJ, CPI, COMMERCE, COMMISSION_UE, CESSEZ_LE_FEU],
      segments: {
        // proche_orient-11 : le cessez-le-feu du 10 octobre 2025, puis l'échange d'otages et de prisonniers
        'proche-orient-intro-01': {
          say: 'La guerre à Gaza a suivi l’attaque du Hamas contre Israël, le 7 octobre 2023. Un cessez-le-feu est entré en vigueur le 10 octobre 2025, suivi d’un échange d’otages et de prisonniers. Quelle position la France doit-elle prendre ?',
          spoken: 'La guerre à Gaza a suivi l’attaque du Hamas contre Israël, le sept octobre deux mille vingt-trois. Un cessez-le-feu est entré en vigueur le dix octobre deux mille vingt-cinq, suivi d’un échange d’otages et de prisonniers. Quelle position la France doit-elle prendre ?',
          draw: 'Une frise des années au trait : un fanion planté au 7 octobre 2023, un second au 10 octobre 2025, le cessez-le-feu ; une flèche en pointillé qui court jusqu’à aujourd’hui, un point d’interrogation au bout.',
          emphasis: ['7 octobre 2023', 'cessez-le-feu', 'Quelle position'],
        },
        // proche_orient-2 : les deux questions de la présidentielle, mot pour mot ; ni carte ni drapeau au dessin
        'proche-orient-intro-07': {
          say: 'Deux questions se posent à la France. Quelle politique mener envers le gouvernement israélien ? Et quelle position sur l’État de Palestine ?',
          draw: 'Deux pictogrammes, l’un sous l’autre, chacun avec sa question : deux cadres au trait reliés par une flèche double, puis un document posé sous le globe de l’ONU.',
          emphasis: ['Quelle politique', 'État de Palestine'],
        },
        // proche_orient-3 : les vidéos qui suivent portent sur la première question, quel que soit leur nombre
        'proche-orient-intro-08': {
          say: 'Les vidéos qui suivent regardent de plus près la première question.',
          draw: 'Le sommaire des vidéos qui suivent, chacune avec son pictogramme.',
        },
      },
    },
    // proche_orient-14 : question de la qualification (international_defense-2), sans équivalent dans cette élection
    'proche-orient-mots': {
      omit: true,
    },
    // proche_orient-14 : même question ; « 4 sur 5 » (justice-08) vient d'une fiche que cette élection n'affiche pas
    'proche-orient-justice': {
      omit: true,
    },
    'proche-orient-onu': {
      // proche_orient-13 : la source du vote sur la résolution 2803 ; COMMISSION_UE ne sert plus (onu-05 remplacé)
      sources: [CONSEIL_SECURITE, RESOLUTION_2803_SOURCE],
      segments: {
        // proche_orient-12 : le vote de novembre 2025 remplace le récapitulatif des règles (déjà dit en accord-06),
        // avec la construction d'onu-04 (date, décompte, effet de la règle)
        'proche-orient-onu-05': {
          say: 'Le 17 novembre 2025, le Conseil adopte la résolution 2803, qui approuve le plan de paix pour Gaza présenté par les États-Unis. Elle recueille 13 voix pour et aucune contre ; la Chine et la Russie, membres permanents, s’abstiennent, ce qui ne la bloque pas.',
          spoken: 'Le dix-sept novembre deux mille vingt-cinq, le Conseil adopte la résolution deux mille huit cent trois, qui approuve le plan de paix pour Gaza présenté par les États-Unis. Elle recueille treize voix pour et aucune contre ; la Chine et la Russie, membres permanents, s’abstiennent, ce qui ne la bloque pas.',
          visual: 'figure',
          draw: 'Les quinze sièges, comme au vote de septembre : treize teintés, aucun barré, deux sièges permanents laissés en blanc, les abstentions ; le texte, cette fois, en trait plein.',
          alt: 'Quinze sièges : treize pour, aucun contre, deux abstentions de membres permanents. La résolution 2803 est adoptée.',
          emphasis: ['résolution 2803', '13 voix pour', 'aucune contre'],
          figure: { ...RESOLUTION_2803, sourceIndex: 1 },
        },
      },
    },
  },
}
