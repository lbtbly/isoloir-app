// Édition « présidentielle 2027 » de la série « Numérique » (src/ui/videos/series/numerique.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/numerique.json).
// Datée : calendrier du règlement européen sur l'IA (révision entrée en vigueur le 27 juillet 2026) ; décision
// du Conseil constitutionnel du 14 août 2026 ; conclusions préliminaires de la Commission sur TikTok
// (6 février 2026) ; amendes au titre du règlement sur les services numériques arrêtées au 31 août 2026 ;
// mesures conservatoires de l'Autorité de la concurrence contre Meta (8 juillet 2026), décision au fond
// attendue. À revoir avant le premier tour du 18 avril 2027 (faits vérifiés au 7 octobre 2026), et dès qu'un de
// ces faits change : décision au fond de l'Autorité de la concurrence sur Meta, suites de l'enquête sur TikTok,
// nouvelles amendes au titre du règlement sur les services numériques, nouveau texte sur l'accès des mineurs aux
// réseaux sociaux, taux de la taxe sur les services numériques (projet de loi de finances pour 2027), estimations
// de RTE sur les centres de données (page du 1er juin 2026).
// Questions : la traduction automatique ne relie aucune vidéo à la question propre à cette élection sur l'IA et les
// écrans à l'école (numerique-4). L'introduction, « Intelligence artificielle » et « Enfants et écrans » la reçoivent,
// après leur question d'origine. « Grandes plateformes » et « Information et médias » gardent la traduction
// (numerique-3).
// Les passages corrigés gardent leur place (identifiants sans trou, GUIDE § 9) : les chiffres sortis des fiches
// (protection sociale, plafond de 6 %, 49 % du capital) cèdent la place à ceux qui y sont entrés (centres de
// données, taxe sur les services numériques, décision de 2020), et chaque nouvelle source prend l'index de
// l'ancienne, si bien qu'aucun autre sourceIndex ne bouge.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const EUROSTAT_ENTREPRISES: VideoSource = {
  title: 'Use of artificial intelligence in enterprises (Statistics Explained)',
  url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises',
  publisher: 'Eurostat',
  date: '2026-06-02',
}
const OIT: VideoSource = {
  title: 'Generative AI and jobs: A refined global index of occupational exposure (ILO Working Paper 140)',
  url: 'https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure',
  publisher: 'Organisation internationale du travail (OIT)',
  date: '2025-05-20',
}
const REGLEMENT_IA: VideoSource = {
  title: 'Législation sur l’IA : cadre réglementaire et calendrier d’application',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai',
  publisher: 'Commission européenne',
  date: '2026-08-03',
}
const CONVENTION_IA: VideoSource = {
  title: 'Commission signs Council of Europe framework Convention on Artificial Intelligence',
  url: 'https://digital-strategy.ec.europa.eu/en/news/commission-signs-council-europe-framework-convention-artificial-intelligence',
  publisher: 'Commission européenne',
  date: '2024-09-05',
}
const INVESTAI: VideoSource = {
  title: 'L’UE lance l’initiative InvestAI, destinée à mobiliser 200 milliards d’euros d’investissements dans l’intelligence artificielle (IP/25/467)',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/ip_25_467',
  publisher: 'Commission européenne',
  date: '2025-02-11',
}
const TIKTOK: VideoSource = {
  title: 'Commission preliminarily finds TikTok’s addictive design in breach of the Digital Services Act',
  url: 'https://digital-strategy.ec.europa.eu/en/news/commission-preliminarily-finds-tiktoks-addictive-design-breach-digital-services-act',
  publisher: 'Commission européenne',
  date: '2026-02-06',
}
const DSA_SEUIL: VideoSource = {
  title: 'DSA : très grandes plateformes en ligne et moteurs de recherche',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/dsa-vlops',
  publisher: 'Commission européenne',
  date: '2026-05-19',
}
const DSA_SUPERVISION: VideoSource = {
  title: 'Supervision des très grandes plateformes en ligne et moteurs de recherche désignés au titre du règlement sur les services numériques',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/list-designated-vlops-and-vloses',
  publisher: 'Commission européenne',
  date: '2026-08-31',
}
const CC_2018: VideoSource = {
  title: 'Décision n° 2018-773 DC du 20 décembre 2018 – Loi relative à la lutte contre la manipulation de l’information',
  url: 'https://www.conseil-constitutionnel.fr/decision/2018/2018773DC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2018-12-20',
}
const DROITS_VOISINS: VideoSource = {
  title: 'Droits voisins : l’Autorité de la concurrence prononce des mesures conservatoires et enjoint Meta de négocier de bonne foi avec les éditeurs et agences de presse',
  url: 'https://www.autoritedelaconcurrence.fr/fr/communiques-de-presse/droits-voisins-lautorite-de-la-concurrence-prononce-des-mesures',
  publisher: 'Autorité de la concurrence',
  date: '2026-07-08',
}
const SMAD: VideoSource = {
  title: 'Le régulateur intègre les principaux SMAD internationaux au système français de financement de la création',
  url: 'https://www.arcom.fr/presse/le-regulateur-integre-les-principaux-smad-internationaux-au-systeme-francais-de-financement-de-la-creation',
  publisher: 'Arcom (alors CSA)',
  date: '2021-12-09',
}

/* ——— Les sources ajoutées par la relecture (chacune à l'index de celle qu'elle remplace) ——— */

/** numerique-6 : à la place d'EUROSTAT_PROTECTION (index 2 de numerique-ia) */
const RTE_DATA_CENTERS: VideoSource = {
  title: 'Les data centers en chiffres clés',
  url: 'https://www.rte-france.com/bases-electricite/consommation-electricite/essor-data-centers-france',
  publisher: 'RTE (Réseau de transport d’électricité)',
  date: '2026-06-01',
}
/** numerique-13 : à la place de DSA_AMENDES (index 2 de numerique-plateformes) */
const TAXE_NUMERIQUE: VideoSource = {
  title: 'Code des impositions sur les biens et services – Taxe sur certains services numériques (articles L453-45 à L453-83)',
  url: 'https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000044595989/LEGISCTA000048626177/',
  publisher: 'Légifrance',
  date: '2024-01-01',
}
/** numerique-17 : à la place de LOI_1986 (index 3 de numerique-medias) */
const CC_2020: VideoSource = {
  title: 'Décision n° 2020-801 DC du 18 juin 2020 – Loi visant à lutter contre les contenus haineux sur internet',
  url: 'https://www.conseil-constitutionnel.fr/decision/2020/2020801DC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2020-06-18',
}

/* ——— Les libellés des fiches de la présidentielle (research/presidentielle-2027/explainers.json), repris tels quels ——— */

/** Fiche numerique-1, figures[2] (RTE) */
const LABEL_DATA_CENTERS =
  'Consommation annuelle d’électricité des quelque 300 centres de données présents en France, estimée par RTE : environ 2 % de la consommation française d’électricité. Dans une trajectoire de « décarbonation rapide » étudiée par son Bilan prévisionnel 2025-2035, elle pourrait atteindre 15 à 20 TWh en 2030 (environ 3 %), puis 23 à 28 TWh en 2035 (4 %)'
/** Fiche numerique-3, figures[1] (taxe sur les services numériques) */
const LABEL_TAXE =
  'Taux de la taxe sur les services numériques, appliqué au chiffre d’affaires tiré en France de la publicité ciblée et des services d’intermédiation en ligne. Elle vise les entreprises dont ces services dépassent 750 millions d’euros de chiffre d’affaires dans le monde et 25 millions d’euros en France'
/** Fiche numerique-3, figures[3] (décision du 18 juin 2020) */
const LABEL_24_HEURES =
  'Délai dans lequel une loi votée en 2020 prévoyait d’obliger les grands opérateurs de plateformes, sous peine de sanction pénale, à retirer les contenus haineux ou sexuels manifestement illicites qui leur étaient signalés. Le Conseil constitutionnel a censuré cette obligation, jamais entrée en vigueur : elle ne pouvait qu’inciter à retirer les contenus signalés, « qu’ils soient ou non manifestement illicites ». Il rappelle que la loi peut faire cesser les abus de la liberté d’expression, protégée par l’article 11 de la Déclaration de 1789, mais que toute atteinte à cette liberté doit être « nécessaire, adaptée et proportionnée »'

export const NUMERIQUE: SeriesPatch = {
  videos: {
    'numerique-intro': {
      questionIds: ['numerique-1', 'numerique-2', 'numerique-3', 'numerique-4'],
    },
    'numerique-ia': {
      questionIds: ['numerique-1', 'numerique-4'],
      // numerique-6 : RTE à la place d'EUROSTAT_PROTECTION, au même index (InvestAI garde l'index 5)
      sources: [EUROSTAT_ENTREPRISES, OIT, RTE_DATA_CENTERS, REGLEMENT_IA, CONVENTION_IA, INVESTAI],
      segments: {
        // numerique-5 : la consommation électrique des centres de données à la place des recettes de la
        // protection sociale ; plus de graphique (le dessin trace les deux barres)
        'numerique-ia-05': {
          say: 'Les centres de données, où tournent notamment les IA, consomment de l’électricité. En France, selon RTE, environ 10 térawattheures par an : environ 2 % de la consommation. Dans un scénario de décarbonation rapide, leur part pourrait atteindre 4 % en 2035.',
          spoken: 'Les centres de données, où tournent notamment les I.A., consomment de l’électricité. En France, selon R.T.E., environ dix térawattheures par an : environ deux pour cent de la consommation. Dans un scénario de décarbonation rapide, leur part pourrait atteindre quatre pour cent en deux mille trente-cinq.',
          visual: 'figure',
          draw: 'Une armoire de serveurs au trait reliée à une prise ; à côté, deux barres à la même échelle, depuis zéro : aujourd’hui au bleu bille, 2035 en pointillé.',
          alt: 'Deux barres à la même échelle : environ 2 % aujourd’hui ; 4 % en 2035, en pointillé (scénario).',
          emphasis: ['10 térawattheures', '2 %', '4 %'],
          figure: {
            value: '10 TWh',
            label: LABEL_DATA_CENTERS,
            date: 'Estimation 2026 (page mise à jour le 1er juin 2026)',
            sourceIndex: 2,
          },
          chart: undefined,
        },
      },
    },
    'numerique-ecrans': {
      questionIds: ['numerique-2', 'numerique-4'],
    },
    'numerique-plateformes': {
      // numerique-13 : la taxe sur les services numériques à la place de DSA_AMENDES, au même index
      sources: [DSA_SEUIL, DSA_SUPERVISION, TAXE_NUMERIQUE, TIKTOK],
      segments: {
        // numerique-11 : la taxe française sur les services numériques à la place du plafond de 6 %
        'numerique-plateformes-05': {
          say: 'En France, une taxe vise aussi les grandes entreprises du numérique. Elle s’élève à 3 % du chiffre d’affaires qu’elles tirent, en France, de la publicité ciblée et de l’intermédiation en ligne.',
          spoken: 'En France, une taxe vise aussi les grandes entreprises du numérique. Elle s’élève à trois pour cent du chiffre d’affaires qu’elles tirent, en France, de la publicité ciblée et de l’intermédiation en ligne.',
          draw: 'Cent pièces en dix rangées ; trois se comptent au bleu bille.',
          emphasis: ['3 %'],
          figure: {
            value: '3 %',
            label: LABEL_TAXE,
            date: 'Règle en vigueur (consultée le 7 octobre 2026)',
            sourceIndex: 2,
          },
        },
        // numerique-12 : après la taxe française, la Commission est nommée
        'numerique-plateformes-06': {
          say: 'La Commission a aussi accepté des engagements de TikTok sur la publicité, en décembre 2025. Puis un plan d’action de X, en juillet 2026.',
          spoken: 'La Commission a aussi accepté des engagements de TikTok sur la publicité, en décembre deux mille vingt-cinq. Puis un plan d’action de X, en juillet deux mille vingt-six.',
        },
        // numerique-14 : la question de fin ouverte dans les trois sens, le statu quo au milieu
        'numerique-plateformes-08': {
          say: 'Alors, ces règles : faut-il les renforcer, les garder telles quelles ou les alléger ?',
          emphasis: ['les renforcer', 'les garder', 'les alléger'],
        },
      },
    },
    'numerique-medias': {
      // numerique-17 : la décision de 2020 à la place de LOI_1986, au même index
      sources: [CC_2018, DROITS_VOISINS, SMAD, CC_2020],
      segments: {
        // numerique-16 : la censure de 2020 (retrait en 24 heures) à la place des 49 % du capital d'une chaîne
        'numerique-medias-07': {
          say: 'En 2020, le Conseil constitutionnel a censuré l’obligation pour les plateformes de retirer en 24 heures les contenus haineux manifestement illicites signalés. Selon lui, elle les poussait à retirer tout contenu signalé, illicite ou non : une atteinte disproportionnée à la liberté d’expression.',
          spoken: 'En deux mille vingt, le Conseil constitutionnel a censuré l’obligation pour les plateformes de retirer en vingt-quatre heures les contenus haineux manifestement illicites signalés. Selon lui, elle les poussait à retirer tout contenu signalé, illicite ou non : une atteinte disproportionnée à la liberté d’expression.',
          visual: 'figure',
          draw: 'Une bulle de message et un chronomètre marqué 24 h ; puis un bâtiment à colonnes, et le chronomètre barré d’un trait.',
          alt: 'Un chronomètre marqué 24 h, barré d’un trait.',
          emphasis: ['24 heures', 'liberté d’expression'],
          figure: {
            value: '24 heures',
            label: LABEL_24_HEURES,
            date: 'Décision du 18 juin 2020',
            sourceIndex: 3,
          },
        },
      },
    },
  },
}
