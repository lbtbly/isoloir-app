// Édition « présidentielle 2027 » de la série « Ukraine et Russie » (src/ui/videos/series/ukraine_russie.ts) : corrections de la relecture
// d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/video-corrections/ukraine_russie.json).
// Datée : bilans de l'ONU au 31 août 2026 (mensuels), aide européenne au 7 octobre 2026 (total qui croît à chaque
// versement du prêt), protection temporaire à fin juillet 2026 (mensuelle), besoins humanitaires du plan 2026 de
// l'ONU (plan 2027 attendu avant le vote), prêt de l'UE selon le règlement (UE) 2026/467. « La guerre continue » :
// à revoir en cas de cessez-le-feu ou d'accord de paix ; « Plus de quatre ans » (ukraine-intro-01), s'il reste, ne
// vaut que jusqu'au 24 février 2027. À revoir à chaque mise à jour de ces sources, et en tout cas avant le premier
// tour du 18 avril 2027.
// Questions : la traduction du périmètre (international_defense-1 → ukraine_russie-1) vaut pour l'introduction,
// « Civils » et « Aide européenne », qu'elle garde. « Diplomatie » reçoit en plus ukraine_russie-2 (la relation
// avec la Russie), dont la fiche traite du Conseil de sécurité et du veto, et du cessez-le-feu sous l'égide de
// l'ONU ; ukraine_russie-1 reste en tête (la question de fin de la vidéo, et sa fiche). Aucune vidéo ne traite
// des garanties de sécurité (ukraine_russie-x3).
// Passages à revoiser, en un seul lot au dernier rafraîchissement avant le gel du vote : ukraine-intro-01-p27,
// ukraine-intro-05-p27, ukraine-intro-08-p27, ukraine-aide-02-p27, ukraine-diplomatie-05-p27.
// Les planches (pistes/planches/ukraine_russie.tsx) doivent suivre : intro01 cherchait « plus de N ans » dans le
// texte, diplo05 « La France » et « la Russie » ; sans ces mots, elles ne dessinent plus rien (dessin générique).
// Le nombre 193 (diplomatie-05) et le prêt selon le règlement (aide-04) supposent les corrections de la fiche
// ukraine_russie-1 (ukraine_russie-5 et ukraine_russie-7) appliquées.
// Les listes de sources sont complètes : les sources gardées sont copiées de la série d'origine, à l'identique.
import type { VideoSource } from '../../types'
import type { SeriesPatch } from '../types'

/* ——— Les sources de la série reprises ici, pour donner la liste complète des vidéos dont les sources changent ——— */

const ONU_BILAN: VideoSource = {
  title: 'Ukraine – Protection of civilians in armed conflict, August 2026 update (PDF)',
  url: 'https://ukraine.ohchr.org/sites/default/files/2026-09/Ukraine%20-%20protection%20of%20civilians%20in%20armed%20conflict%20%28August%29_ENG.pdf',
  publisher: 'Mission de surveillance des droits de l’homme des Nations unies en Ukraine (HCDH)',
  date: '2026-09-16',
}
const OCHA: VideoSource = {
  title: 'Ukraine – Humanitarian Needs and Response Plan 2026 (page pays)',
  url: 'https://www.unocha.org/ukraine',
  publisher: 'Bureau de la coordination des affaires humanitaires des Nations unies (OCHA)',
}
const EUROSTAT: VideoSource = {
  title: 'Personnes bénéficiant d’une protection temporaire à la fin du mois par nationalité, âge et sexe (migr_asytpsm)',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/migr_asytpsm/default/table?lang=fr',
  publisher: 'Eurostat',
  date: '2026-10-01',
}
const PRET_UE: VideoSource = {
  title: 'La Commission verse 3,3 milliards d’euros à l’Ukraine pour financer sa défense (IP/26/1900)',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/ip_26_1900',
  publisher: 'Commission européenne',
  date: '2026-09-18',
}
const CONSEIL: VideoSource = {
  title: 'Système de vote – Conseil de sécurité des Nations unies',
  url: 'https://main.un.org/securitycouncil/fr/content/voting-system',
  publisher: 'Nations unies, Conseil de sécurité',
}

/* ——— Les sources mises à jour ou ajoutées par la relecture ——— */

/** ukraine_russie-11 : page de la Commission mise à jour le 7 octobre 2026 */
const AIDE_UE: VideoSource = {
  title: 'Aide de l’UE à l’Ukraine',
  url: 'https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine_fr',
  publisher: 'Commission européenne',
  date: '2026-10-07',
}
/** ukraine_russie-12 : la source du prêt dans la fiche ukraine_russie-1 */
const REGLEMENT: VideoSource = {
  title: 'Règlement (UE) 2026/467 du Parlement européen et du Conseil du 24 février 2026 mettant en œuvre une coopération renforcée concernant l’établissement du prêt de soutien à l’Ukraine pour 2026 et 2027',
  url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32026R0467',
  publisher: 'EUR-Lex – Journal officiel de l’Union européenne',
  date: '2026-02-24',
}
/** ukraine_russie-13 : l'Assemblée générale, quand le Conseil est bloqué par un veto */
const ASSEMBLEE: VideoSource = {
  title: 'Assemblée générale des Nations unies – Fonctions et pouvoirs',
  url: 'https://www.un.org/fr/ga/about/background.shtml',
  publisher: 'Nations unies',
}

/* ——— Les chiffres de la fiche ukraine_russie-1 corrigée (figures[1] et son graphique) ——— */

/** ukraine_russie-11 (avec ukraine_russie-3 et -4 de la fiche) : total au 7 octobre 2026, libellé corrigé */
const SOUTIEN = {
  value: '228,7 Md€',
  label: 'Soutien total de l’UE et de ses États membres à l’Ukraine depuis 2022, selon la Commission. Il comprend 114,4 Md€ financés ou garantis par le budget de l’UE, 77,9 Md€ d’aide militaire, jusqu’à 17 Md€ pour l’accueil des Ukrainiens dans l’UE, 15,5 Md€ de soutien des États membres et 3,8 Md€ tirés des revenus des avoirs russes immobilisés',
  date: 'mise à jour du 7 octobre 2026',
}
const SOUTIEN_CHART = {
  kind: 'compare',
  unit: 'Md€',
  items: [
    { label: 'Soutien total depuis 2022', value: 228.7 },
    { label: 'Dont aide militaire', value: 77.9 },
  ],
}

export const UKRAINE_RUSSIE: SeriesPatch = {
  videos: {
    'ukraine-intro': {
      // ukraine_russie-11 : AIDE_UE à jour du 7 octobre 2026 (index 3)
      sources: [ONU_BILAN, OCHA, EUROSTAT, AIDE_UE, CONSEIL],
      segments: {
        // ukraine_russie-14 : une formule qui ne vieillit pas le 24 février 2027
        'ukraine-intro-01': {
          say: 'Le 24 février 2022, la Russie lance une invasion à grande échelle de l’Ukraine. Depuis, la guerre continue.',
          spoken: 'Le vingt-quatre février deux mille vingt-deux, la Russie lance une invasion à grande échelle de l’Ukraine. Depuis, la guerre continue.',
          draw: 'Une frise des années au trait : un fanion planté au 24 février 2022, puis une flèche qui court jusqu’à aujourd’hui, une accolade dessous.',
          alt: 'Une frise des années, depuis 2022.',
          emphasis: ['24 février 2022', 'la guerre continue'],
        },
        // ukraine_russie-8, ukraine_russie-11 : le total de la Commission au 7 octobre 2026
        'ukraine-intro-05': {
          say: 'Depuis 2022, le soutien de l’Union européenne et de ses États membres à l’Ukraine atteint 228,7 milliards d’euros. Dont 77,9 milliards d’aide militaire.',
          spoken: 'Depuis deux mille vingt-deux, le soutien de l’Union européenne et de ses États membres à l’Ukraine atteint deux cent vingt-huit virgule sept milliards d’euros. Dont soixante-dix-sept virgule neuf milliards d’aide militaire.',
          emphasis: ['228,7 milliards d’euros', '77,9 milliards'],
          figure: { ...SOUTIEN, sourceIndex: 3 },
          chart: SOUTIEN_CHART,
        },
        // ukraine_russie-15 : la question de l'aide reste ouverte
        'ukraine-intro-08': {
          say: 'Trois questions se posent. Comment venir en aide aux civils ? Faut-il aider l’Ukraine, et comment ? Et quelle place pour la diplomatie ?',
          emphasis: ['aux civils', 'aider l’Ukraine', 'la diplomatie'],
        },
      },
    },
    'ukraine-civils': {
      segments: {
        // ukraine_russie-16 : « montrée du doigt » suggère un reproche ; la planche dessine une flèche
        'ukraine-civils-10': {
          draw: 'Deux barres au trait à la même échelle, l’Union européenne et la France ; celle de la France, un simple trait, désignée d’une flèche.',
          alt: 'Deux barres à la même échelle : 4 363 130 personnes dans l’Union européenne, 47 215 en France ; celle de la France, trop fine pour se voir, est désignée d’une flèche.',
        },
      },
    },
    'ukraine-aide': {
      // ukraine_russie-11 : AIDE_UE à jour (index 0) ; ukraine_russie-12 : le règlement ajouté (index 2), IP/26/1900
      // gardé pour aide-05 (« pour maintenir l'État et les services publics »)
      sources: [AIDE_UE, PRET_UE, REGLEMENT],
      segments: {
        // ukraine_russie-9, ukraine_russie-11 : le total de la Commission au 7 octobre 2026
        'ukraine-aide-02': {
          say: 'Selon la Commission européenne, le soutien de l’Union et de ses États membres atteint 228,7 milliards d’euros depuis 2022.',
          spoken: 'Selon la Commission européenne, le soutien de l’Union et de ses États membres atteint deux cent vingt-huit virgule sept milliards d’euros depuis deux mille vingt-deux.',
          emphasis: ['228,7 milliards d’euros'],
          figure: { ...SOUTIEN, sourceIndex: 0 },
          chart: SOUTIEN_CHART,
        },
        // ukraine_russie-10 : textes affichés alignés sur le nouveau total, sans voix (77,9 sur 228,7 : 34 %, « un
        // peu plus d'un tiers » reste juste)
        'ukraine-aide-03': {
          alt: 'Le disque du soutien total, 228,7 milliards d’euros ; la part de l’aide militaire comptée.',
          figure: {
            value: '77,9 Md€',
            label: 'Aide militaire de l’UE et de ses États membres à l’Ukraine depuis 2022, sur un soutien total de 228,7 Md€, selon la Commission',
            date: 'mise à jour du 7 octobre 2026',
            sourceIndex: 0,
          },
        },
        // ukraine_russie-12 : comment le prêt est financé, et à quelles conditions il est remboursé (libellé affiché,
        // sans voix), selon le règlement
        'ukraine-aide-04': {
          figure: {
            value: 'Jusqu’à 90 Md€',
            label: 'Prêt de l’UE à l’Ukraine pour 2026-2027, adopté en février 2026 et financé par un emprunt de l’Union : 60 Md€ pour sa défense et 30 Md€ d’aide budgétaire. L’Ukraine ne doit le rembourser que si elle reçoit des réparations de la Russie, ou en cas de fraude ou de manquement aux conditions du prêt',
            date: 'Février 2026',
            sourceIndex: 2,
          },
        },
      },
    },
    'ukraine-diplomatie': {
      // Question ajoutée : ukraine_russie-2, dont la fiche traite du Conseil de sécurité, du veto et du
      // cessez-le-feu sous l'égide de l'ONU
      questionIds: ['ukraine_russie-1', 'ukraine_russie-2'],
      // ukraine_russie-13 : la page de l'ONU sur l'Assemblée générale
      sources: [CONSEIL, ASSEMBLEE],
      segments: {
        // ukraine_russie-13 : la voie de l'Assemblée générale et sa limite, au lieu de l'équivalence des deux vetos
        'ukraine-diplomatie-05': {
          say: 'Si le Conseil est bloqué par un veto, l’Assemblée générale de l’ONU peut se saisir de la question. Chacun de ses 193 États membres y a une voix. Elle fait des recommandations.',
          spoken: 'Si le Conseil est bloqué par un veto, l’Assemblée générale de l’Onu peut se saisir de la question. Chacun de ses cent quatre-vingt-treize États membres y a une voix. Elle fait des recommandations.',
          visual: 'point',
          draw: 'Un hémicycle au trait, rangée après rangée de sièges tous de même taille ; la résolution, arrêtée par la barrière à la table ronde, passe à l’hémicycle.',
          alt: 'Un hémicycle aux sièges tous égaux, l’Assemblée générale, où passe la résolution.',
          emphasis: ['l’Assemblée générale', 'une voix'],
        },
      },
    },
  },
}
