// Série « Ukraine et Russie » (famille « Europe et monde ») : l'introduction, puis trois approfondissements (la
// population civile, l'aide européenne, la diplomatie au Conseil de sécurité). Le thème n'a qu'une question dans
// la banque (international_defense-1) : sa fiche est la seule matière, chiffres compris. Règles d'écriture :
// ../GUIDE-SERIES.md ; planches : ../pistes/planches/ukraine_russie.tsx.
// Vocabulaire : celui de la fiche (« invasion à grande échelle de l'Ukraine par la Russie », « la guerre menée
// par la Russie en Ukraine ») ; les bilans sont attribués à la mission de l'ONU, les montants à la Commission
// européenne. Les positions en débat (approaches) ne sont jamais présentées : seulement « les avis divergent »,
// comme la fiche.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : bilans de l'ONU au 31 août 2026, aide européenne au 18 septembre 2026, protection temporaire à fin
// juillet 2026. À revoir à la prochaine mise à jour de ces sources.

import type { VideoSeries, VideoSource } from '../types'

/** Les sources de la fiche, copiées telles quelles (titres composés à la française) */
const ONU_MOIS: VideoSource = {
  title: 'Protection of Civilians in Armed Conflict — August 2026',
  url: 'https://ukraine.ohchr.org/en/Protection-of-Civilians-in-Armed-Conflict-August-2026',
  publisher: 'Mission de surveillance des droits de l’homme des Nations unies en Ukraine (HCDH)',
  date: '2026-09-16',
}
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
const AIDE_UE: VideoSource = {
  title: 'Aide de l’UE à l’Ukraine',
  url: 'https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine_fr',
  publisher: 'Commission européenne',
  date: '2026-09-18',
}
const PRET_UE: VideoSource = {
  title: 'La Commission verse 3,3\u00a0milliards d’euros à l’Ukraine pour financer sa défense (IP/26/1900)',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/ip_26_1900',
  publisher: 'Commission européenne',
  date: '2026-09-18',
}
const CONSEIL: VideoSource = {
  title: 'Système de vote – Conseil de sécurité des Nations unies',
  url: 'https://main.un.org/securitycouncil/fr/content/voting-system',
  publisher: 'Nations unies, Conseil de sécurité',
}

/** Les chiffres de la fiche (international_defense-1), et leurs graphiques (explainer-charts.json) */
const BILAN = {
  value: '17\u202f257 tués, 53\u202f693 blessés',
  label: 'Civils tués et blessés en Ukraine, vérifiés par la mission de l’ONU. Selon elle, le bilan réel est probablement bien plus élevé, faute d’accès à certaines zones',
  date: '24\u00a0février 2022 – 31\u00a0août 2026',
}
const BESOINS = {
  value: '10,8\u00a0millions',
  label: 'Personnes ayant besoin d’une aide humanitaire en Ukraine, selon l’ONU. Le plan de l’ONU et de ses partenaires en cible 4,1\u00a0millions, pour 2,3\u00a0milliards de dollars',
  date: '2026',
}
const BESOINS_CHART = {
  kind: 'compare',
  unit: 'millions',
  items: [
    { label: 'Personnes ayant besoin d’aide', value: 10.8 },
    { label: 'Personnes ciblées par le plan', value: 4.1 },
  ],
}
const PROTECTION = {
  value: '4\u202f363\u202f130',
  label: 'Ukrainiens sous protection temporaire dans l’UE, dont 47\u202f215 en France (définition française légèrement différente, selon Eurostat)',
  date: 'Fin juillet 2026',
}
const PROTECTION_CHART = {
  kind: 'compare',
  unit: 'personnes',
  items: [
    { label: 'Union européenne', value: 4363130 },
    { label: 'Dont France', value: 47215 },
  ],
}
const SOUTIEN = {
  value: '224,5\u00a0Md€',
  label: 'Soutien total de l’UE et de ses États membres à l’Ukraine depuis 2022, dont 77,9\u00a0Md€ d’aide militaire, selon la Commission',
  date: 'mise à jour du 18\u00a0septembre 2026',
}
const SOUTIEN_CHART = {
  kind: 'compare',
  unit: 'Md€',
  items: [
    { label: 'Soutien total depuis 2022', value: 224.5 },
    { label: 'Dont aide militaire', value: 77.9 },
  ],
}

export const UKRAINE_RUSSIE: VideoSeries = {
  topicId: 'ukraine_russie',
  familyId: 'monde',
  label: 'Ukraine et Russie',
  videos: [
    {
      id: 'ukraine-intro',
      kind: 'intro',
      questionIds: ['international_defense-1'],
      title: 'Ukraine et Russie, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'ukraine-intro-01',
          say: 'Le 24\u00a0février 2022, la Russie lance une invasion à grande échelle de l’Ukraine. Plus de quatre ans après, la guerre continue.',
          spoken: 'Le vingt-quatre février deux mille vingt-deux, la Russie lance une invasion à grande échelle de l’Ukraine. Plus de quatre ans après, la guerre continue.',
          visual: 'hook',
          draw: 'Une frise des années au trait\u00a0: un fanion planté au 24\u00a0février 2022, puis une flèche qui court au-delà de la quatrième année, une accolade dessous.',
          alt: 'Une frise des années, de 2022 à 2026.',
          emphasis: ['24\u00a0février 2022', 'Plus de quatre ans'],
        },
        {
          id: 'ukraine-intro-02',
          say: 'Une mission de l’ONU a vérifié 17\u202f257\u00a0civils tués et 53\u202f693\u00a0blessés depuis le début de l’invasion. Selon elle, le bilan réel est probablement bien plus élevé.',
          spoken: 'Une mission de l’Onu a vérifié dix-sept mille deux cent cinquante-sept civils tués et cinquante-trois mille six cent quatre-vingt-treize blessés depuis le début de l’invasion. Selon elle, le bilan réel est probablement bien plus élevé.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle, les civils tués et les blessés\u202f; une flèche en pointillé prolonge chacune\u00a0: le bilan réel, probablement plus élevé.',
          alt: 'Deux barres à la même échelle, les civils tués et les blessés, chacune prolongée d’une flèche en pointillé.',
          emphasis: ['17\u202f257\u00a0civils tués', '53\u202f693\u00a0blessés', 'bien plus élevé'],
          figure: { ...BILAN, sourceIndex: 0 },
        },
        {
          id: 'ukraine-intro-03',
          say: 'En 2026, 10,8\u00a0millions de personnes ont besoin d’une aide humanitaire en Ukraine, selon l’ONU.',
          spoken: 'En deux mille vingt-six, dix virgule huit millions de personnes ont besoin d’une aide humanitaire en Ukraine, selon l’Onu.',
          visual: 'figure',
          draw: 'Une foule de petites silhouettes au trait qui se remplit rangée par rangée, le nombre écrit au-dessus.',
          emphasis: ['10,8\u00a0millions'],
          figure: { ...BESOINS, sourceIndex: 1 },
          chart: BESOINS_CHART,
        },
        {
          id: 'ukraine-intro-04',
          say: 'Fin juillet 2026, plus de 4,3\u00a0millions d’Ukrainiens étaient sous protection temporaire dans l’Union européenne.',
          spoken: 'Fin juillet deux mille vingt-six, plus de quatre virgule trois millions d’Ukrainiens étaient sous protection temporaire dans l’Union européenne.',
          visual: 'figure',
          draw: 'Deux silhouettes au trait, chacune avec sa valise, à l’abri d’un grand parapluie\u00a0: la protection.',
          emphasis: ['plus de 4,3\u00a0millions', 'protection temporaire'],
          figure: { ...PROTECTION, sourceIndex: 2 },
          chart: PROTECTION_CHART,
        },
        {
          id: 'ukraine-intro-05',
          say: 'Depuis 2022, le soutien de l’Union européenne et de ses États membres à l’Ukraine atteint 224,5\u00a0milliards d’euros. Dont 77,9\u00a0milliards d’aide militaire.',
          spoken: 'Depuis deux mille vingt-deux, le soutien de l’Union européenne et de ses États membres à l’Ukraine atteint deux cent vingt-quatre virgule cinq milliards d’euros. Dont soixante-dix-sept virgule neuf milliards d’aide militaire.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle\u00a0: le soutien total, puis l’aide militaire, comptée au bleu bille.',
          alt: 'Deux barres à la même échelle, en milliards d’euros\u00a0: le total, et l’aide militaire.',
          emphasis: ['224,5\u00a0milliards d’euros', '77,9\u00a0milliards'],
          figure: { ...SOUTIEN, sourceIndex: 3 },
          chart: SOUTIEN_CHART,
        },
        {
          id: 'ukraine-intro-06',
          say: 'La France prend part à ce soutien, militaire et financier. Et comme la Russie, elle est membre permanent du Conseil de sécurité de l’ONU.',
          spoken: 'La France prend part à ce soutien, militaire et financier. Et comme la Russie, elle est membre permanent du Conseil de sécurité de l’Onu.',
          visual: 'point',
          draw: 'À gauche, un bouclier et des pièces au trait\u00a0: le soutien\u202f; à droite, la table ronde du Conseil vue de haut et tous ses sièges, dont deux sièges permanents marqués.',
          alt: 'Un bouclier et des pièces\u202f; une table ronde et ses sièges, dont ceux de la France et de la Russie, membres permanents.',
          emphasis: ['militaire et financier', 'membre permanent'],
        },
        {
          id: 'ukraine-intro-07',
          say: 'Sur l’attitude de la France face à cette guerre, les avis divergent.',
          visual: 'point',
          draw: 'Une balance au trait, deux plateaux égaux, le fléau à l’horizontale, un point d’interrogation sur chaque plateau.',
          emphasis: ['les avis divergent'],
        },
        {
          id: 'ukraine-intro-08',
          say: 'Trois questions se posent. Comment venir en aide aux civils\u202f? Quelle aide apporter à l’Ukraine\u202f? Et quelle place pour la diplomatie\u202f?',
          visual: 'question',
          draw: 'Trois pictogrammes en grille, dessinés l’un après l’autre\u00a0: une silhouette, des pièces, un édifice à colonnes.',
          emphasis: ['aux civils', 'à l’Ukraine', 'la diplomatie'],
        },
        {
          id: 'ukraine-intro-09',
          say: 'Les vidéos qui suivent les reprennent une à une.',
          visual: 'outro',
          draw: 'Les trois pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [ONU_BILAN, OCHA, EUROSTAT, AIDE_UE, CONSEIL],
    },
    {
      id: 'ukraine-civils',
      kind: 'deep',
      questionIds: ['international_defense-1'],
      title: 'La population civile dans la guerre',
      short: 'Civils',
      register: 'vous',
      segments: [
        {
          id: 'ukraine-civils-01',
          say: 'Dans une guerre, combien de civils sont touchés\u202f? Et qui les compte\u202f?',
          visual: 'hook',
          draw: 'Une rangée de silhouettes au trait, une loupe posée au-dessus, et un point d’interrogation.',
          emphasis: ['combien de civils', 'qui les compte'],
        },
        {
          id: 'ukraine-civils-02',
          say: 'En Ukraine, une mission de l’ONU surveille les droits de l’homme. Elle recense les victimes civiles qu’elle a pu vérifier.',
          spoken: 'En Ukraine, une mission de l’Onu surveille les droits de l’homme. Elle recense les victimes civiles qu’elle a pu vérifier.',
          visual: 'point',
          draw: 'Un registre au trait, ses lignes cochées une à une, et une loupe posée à côté.',
          emphasis: ['une mission de l’ONU', 'pu vérifier'],
        },
        {
          id: 'ukraine-civils-03',
          say: 'Son bilan va du 24\u00a0février 2022 au 31\u00a0août 2026. Il compte 17\u202f257\u00a0civils tués, et 53\u202f693\u00a0blessés.',
          spoken: 'Son bilan va du vingt-quatre février deux mille vingt-deux au trente et un août deux mille vingt-six. Il compte dix-sept mille deux cent cinquante-sept civils tués, et cinquante-trois mille six cent quatre-vingt-treize blessés.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle, les civils tués et les blessés, chacune avec son nombre.',
          alt: 'Deux barres à la même échelle, les civils tués et les blessés.',
          emphasis: ['17\u202f257\u00a0civils tués', '53\u202f693\u00a0blessés'],
          figure: { ...BILAN, sourceIndex: 1 },
        },
        {
          id: 'ukraine-civils-04',
          say: 'Selon elle, le bilan réel est probablement bien plus élevé, faute d’accès à certaines zones.',
          visual: 'point',
          draw: 'Une grille de zones au trait\u202f; quelques cases restent en pointillé, hors d’atteinte, avec un point d’interrogation.',
          alt: 'Une grille de zones, dont quelques-unes en pointillé\u00a0: celles où la mission n’a pas accès.',
          emphasis: ['bien plus élevé', 'faute d’accès'],
        },
        {
          id: 'ukraine-civils-05',
          say: 'De janvier à août 2026, elle a vérifié 2\u202f222\u00a0civils tués et 13\u202f058\u00a0blessés. C’est 55\u00a0% de victimes de plus que sur la même période de 2025.',
          spoken: 'De janvier à août deux mille vingt-six, elle a vérifié deux mille deux cent vingt-deux civils tués et treize mille cinquante-huit blessés. C’est cinquante-cinq pour cent de victimes de plus que sur la même période de deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Deux colonnes au trait depuis zéro, 2025 et 2026\u202f; la seconde plus haute de 55\u00a0%, l’écart marqué d’une accolade.',
          alt: 'Deux colonnes depuis zéro, les victimes civiles de janvier à août, en 2025 et en 2026\u00a0: la seconde plus haute de 55\u00a0%.',
          emphasis: ['55\u00a0%'],
          figure: {
            value: '+55\u00a0%',
            label: 'Victimes civiles vérifiées de janvier à août 2026, par rapport à la même période de 2025 (2\u202f222 tués, 13\u202f058 blessés en 2026)',
            date: 'Janvier – août 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'ukraine-civils-06',
          say: 'En août 2026, les missiles et drones à longue portée ont causé 47\u00a0% des victimes civiles, presque la moitié. Surtout dans des villes éloignées du front.',
          spoken: 'En août deux mille vingt-six, les missiles et drones à longue portée ont causé quarante-sept pour cent des victimes civiles, presque la moitié. Surtout dans des villes éloignées du front.',
          visual: 'figure',
          draw: 'Un disque au trait dont un peu moins de la moitié se compte au bleu bille\u202f; à côté, des immeubles au trait.',
          emphasis: ['47\u00a0%', 'villes éloignées du front'],
          figure: {
            value: '47\u00a0%',
            label: 'Part des victimes civiles causées par des missiles et drones à longue portée en août 2026, surtout dans des villes éloignées du front',
            date: 'Août 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'ukraine-civils-07',
          say: 'Selon l’ONU, 10,8\u00a0millions de personnes ont besoin d’une aide humanitaire en Ukraine en 2026.',
          spoken: 'Selon l’Onu, dix virgule huit millions de personnes ont besoin d’une aide humanitaire en Ukraine en deux mille vingt-six.',
          visual: 'figure',
          draw: 'Une foule de petites silhouettes au trait qui se remplit rangée par rangée, le nombre écrit au-dessus.',
          emphasis: ['10,8\u00a0millions'],
          figure: { ...BESOINS, sourceIndex: 2 },
          chart: BESOINS_CHART,
        },
        {
          id: 'ukraine-civils-08',
          say: 'Le plan de l’ONU et de ses partenaires en cible 4,1\u00a0millions, pour 2,3\u00a0milliards de dollars.',
          spoken: 'Le plan de l’Onu et de ses partenaires en cible quatre virgule un millions, pour deux virgule trois milliards de dollars.',
          visual: 'compare',
          draw: 'Deux barres au trait à la même échelle\u00a0: les personnes qui ont besoin d’aide, puis celles que le plan cible\u202f; un billet et le budget du plan dessous.',
          alt: 'Deux barres à la même échelle\u00a0: 10,8\u00a0millions de personnes qui ont besoin d’une aide humanitaire, 4,1\u00a0millions ciblées par le plan.',
          emphasis: ['4,1\u00a0millions', '2,3\u00a0milliards de dollars'],
        },
        {
          id: 'ukraine-civils-09',
          say: 'D’autres ont quitté le pays. Fin juillet 2026, plus de 4,3\u00a0millions d’Ukrainiens étaient sous protection temporaire dans l’Union européenne.',
          spoken: 'D’autres ont quitté le pays. Fin juillet deux mille vingt-six, plus de quatre virgule trois millions d’Ukrainiens étaient sous protection temporaire dans l’Union européenne.',
          visual: 'figure',
          draw: 'Deux silhouettes au trait, chacune avec sa valise, à l’abri d’un grand parapluie\u00a0: la protection.',
          emphasis: ['plus de 4,3\u00a0millions', 'protection temporaire'],
          figure: { ...PROTECTION, sourceIndex: 3 },
          chart: PROTECTION_CHART,
        },
        {
          id: 'ukraine-civils-10',
          say: 'Dont 47\u202f215 en France, selon Eurostat, qui note une définition française légèrement différente.',
          spoken: 'Dont quarante-sept mille deux cent quinze en France, selon Eurostat, qui note une définition française légèrement différente.',
          visual: 'compare',
          draw: 'Deux barres au trait à la même échelle, l’Union européenne et la France\u202f; celle de la France, un simple trait, montrée du doigt.',
          alt: 'Deux barres à la même échelle\u00a0: 4\u202f363\u202f130 personnes dans l’Union européenne, 47\u202f215 en France\u00a0; celle de la France, trop fine pour se voir, est montrée du doigt.',
          emphasis: ['47\u202f215 en France'],
        },
        {
          id: 'ukraine-civils-11',
          say: 'Alors, quelle aide apporter aux civils, en Ukraine comme dans les pays d’accueil\u202f?',
          visual: 'question',
          draw: 'Deux silhouettes au trait, une valise, et un point d’interrogation.',
          emphasis: ['quelle aide apporter'],
        },
      ],
      sources: [ONU_MOIS, ONU_BILAN, OCHA, EUROSTAT],
    },
    {
      id: 'ukraine-aide',
      kind: 'deep',
      questionIds: ['international_defense-1'],
      title: 'L’aide européenne à l’Ukraine',
      short: 'Aide européenne',
      register: 'vous',
      segments: [
        {
          id: 'ukraine-aide-01',
          say: 'Depuis 2022, l’Union européenne aide l’Ukraine. Combien, et sous quelle forme\u202f?',
          spoken: 'Depuis deux mille vingt-deux, l’Union européenne aide l’Ukraine. Combien, et sous quelle forme ?',
          visual: 'hook',
          draw: 'Un bouclier et des pièces au trait, puis un point d’interrogation.',
          emphasis: ['Combien', 'sous quelle forme'],
        },
        {
          id: 'ukraine-aide-02',
          say: 'Selon la Commission européenne, le soutien de l’Union et de ses États membres atteint 224,5\u00a0milliards d’euros depuis 2022.',
          spoken: 'Selon la Commission européenne, le soutien de l’Union et de ses États membres atteint deux cent vingt-quatre virgule cinq milliards d’euros depuis deux mille vingt-deux.',
          visual: 'figure',
          draw: 'Un grand disque au trait, le soutien total, avec des pièces au milieu.',
          emphasis: ['224,5\u00a0milliards d’euros'],
          figure: { ...SOUTIEN, sourceIndex: 0 },
          chart: SOUTIEN_CHART,
        },
        {
          id: 'ukraine-aide-03',
          say: 'Dont 77,9\u00a0milliards d’euros d’aide militaire\u00a0: un peu plus d’un tiers.',
          spoken: 'Dont soixante-dix-sept virgule neuf milliards d’euros d’aide militaire : un peu plus d’un tiers.',
          visual: 'figure',
          draw: 'Le disque du soutien total\u202f; un peu plus d’un tiers se compte au bleu bille, un petit bouclier dessus.',
          alt: 'Le disque du soutien total, 224,5\u00a0milliards d’euros\u00a0; la part de l’aide militaire comptée.',
          emphasis: ['77,9\u00a0milliards d’euros', 'un peu plus d’un tiers'],
          figure: {
            value: '77,9\u00a0Md€',
            label: 'Aide militaire de l’UE et de ses États membres à l’Ukraine depuis 2022, sur un soutien total de 224,5\u00a0Md€, selon la Commission',
            date: 'mise à jour du 18\u00a0septembre 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'ukraine-aide-04',
          say: 'En février 2026, l’Union a adopté un prêt à l’Ukraine pour 2026 et 2027\u00a0: jusqu’à 90\u00a0milliards d’euros.',
          spoken: 'En février deux mille vingt-six, l’Union a adopté un prêt à l’Ukraine pour deux mille vingt-six et deux mille vingt-sept : jusqu’à quatre-vingt-dix milliards d’euros.',
          visual: 'figure',
          draw: 'Deux calendriers au trait, 2026 et 2027, sous un plafond tracé au bleu bille.',
          alt: 'Deux calendriers, 2026 et 2027, sous un plafond.',
          emphasis: ['jusqu’à 90\u00a0milliards d’euros'],
          figure: {
            value: 'Jusqu’à 90\u00a0Md€',
            label: 'Prêt de l’UE à l’Ukraine pour 2026-2027, adopté en février 2026\u00a0: 60\u00a0Md€ pour sa défense et 30\u00a0Md€ d’aide budgétaire, pour maintenir l’État et les services publics',
            date: 'Février 2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'ukraine-aide-05',
          say: 'Deux parts\u00a0: 60\u00a0milliards pour sa défense, et 30\u00a0milliards d’aide budgétaire, pour maintenir l’État et les services publics.',
          spoken: 'Deux parts : soixante milliards pour sa défense, et trente milliards d’aide budgétaire, pour maintenir l’État et les services publics.',
          visual: 'compare',
          draw: 'Deux barres au trait à la même échelle, un bouclier devant la première, un édifice à colonnes devant la seconde.',
          alt: 'Deux barres à la même échelle\u00a0: la défense, et l’aide budgétaire.',
          emphasis: ['60\u00a0milliards', '30\u00a0milliards'],
        },
        {
          id: 'ukraine-aide-06',
          say: 'Le soutien total vient de l’Union et de ses États membres. La France en fait partie\u00a0: elle aide l’Ukraine militairement et financièrement.',
          visual: 'point',
          draw: 'Un grand édifice à colonnes, l’Union, relié à une rangée de petits édifices, les États membres\u202f; l’un d’eux se compte au bleu bille.',
          alt: 'Un grand édifice pour l’Union, de petits pour ses États membres, dont la France.',
          emphasis: ['ses États membres', 'La France'],
        },
        {
          id: 'ukraine-aide-07',
          say: 'Alors, quelle aide à l’Ukraine, sous quelle forme, et jusqu’à quand\u202f?',
          visual: 'question',
          draw: 'Le bouclier, les pièces et le calendrier, une flèche en pointillé vers un point d’interrogation.',
          emphasis: ['quelle aide', 'jusqu’à quand'],
        },
      ],
      sources: [AIDE_UE, PRET_UE],
    },
    {
      id: 'ukraine-diplomatie',
      kind: 'deep',
      questionIds: ['international_defense-1'],
      title: 'Diplomatie\u00a0: le Conseil de sécurité',
      short: 'Diplomatie',
      register: 'vous',
      segments: [
        {
          id: 'ukraine-diplomatie-01',
          say: 'Face à une guerre, il y a aussi la diplomatie. Que peut faire l’ONU\u202f?',
          spoken: 'Face à une guerre, il y a aussi la diplomatie. Que peut faire l’Onu ?',
          visual: 'hook',
          draw: 'Une table ronde au trait, vue de haut, entourée de sièges vides, et un point d’interrogation.',
          emphasis: ['la diplomatie', 'Que peut faire l’ONU'],
        },
        {
          id: 'ukraine-diplomatie-02',
          say: 'À l’ONU, le Conseil de sécurité adopte des résolutions, par un vote. Cinq pays y sont membres permanents.',
          spoken: 'À l’Onu, le Conseil de sécurité adopte des résolutions, par un vote. Cinq pays y sont membres permanents.',
          visual: 'point',
          draw: 'La table ronde et tous ses sièges, une résolution posée au centre\u202f; les cinq sièges permanents se marquent.',
          alt: 'Une table ronde et ses sièges, une résolution au centre\u202f; cinq sièges, ceux des membres permanents, sont marqués.',
          emphasis: ['des résolutions', 'Cinq pays'],
        },
        {
          id: 'ukraine-diplomatie-03',
          say: 'La France et la Russie en font partie, toutes les deux.',
          visual: 'point',
          draw: 'Deux des cinq sièges permanents de la table prennent une étiquette\u00a0: la France, la Russie.',
          emphasis: ['La France', 'la Russie'],
        },
        {
          id: 'ukraine-diplomatie-04',
          say: 'Le vote négatif d’un seul de ces cinq membres suffit à bloquer une résolution. On parle de droit de veto.',
          visual: 'point',
          draw: 'Une résolution au trait et cinq cases de vote, une seule cochée d’une croix\u202f; une barrière se baisse devant la résolution.',
          alt: 'Une résolution, cinq cases de vote, dont une marquée d’une croix, et une barrière baissée.',
          emphasis: ['un seul', 'droit de veto'],
        },
        {
          id: 'ukraine-diplomatie-05',
          say: 'La France comme la Russie peuvent donc, chacune, bloquer seule une résolution.',
          visual: 'compare',
          draw: 'Deux barrières au trait côte à côte, de même taille, l’une étiquetée la France, l’autre la Russie.',
          emphasis: ['bloquer seule'],
        },
        {
          id: 'ukraine-diplomatie-06',
          say: 'Aide militaire et financière, avec l’Union européenne, voix au Conseil de sécurité\u00a0: la France a plusieurs moyens d’agir.',
          visual: 'point',
          draw: 'À gauche, un bouclier et des pièces\u202f; à droite, la table ronde du Conseil.',
          alt: 'Un bouclier et des pièces, pour l’aide\u202f; une table ronde, pour le Conseil de sécurité.',
          emphasis: ['plusieurs moyens d’agir'],
        },
        {
          id: 'ukraine-diplomatie-07',
          say: 'Mais sur l’attitude à adopter par la France, les avis divergent.',
          visual: 'point',
          draw: 'Une balance au trait, deux plateaux égaux, le fléau à l’horizontale, un point d’interrogation sur chaque plateau.',
          emphasis: ['les avis divergent'],
        },
        {
          id: 'ukraine-diplomatie-08',
          say: 'Alors, quelle stratégie face à la guerre menée par la Russie en Ukraine\u202f?',
          visual: 'question',
          draw: 'La table ronde du Conseil, une flèche en pointillé, un point d’interrogation.',
          emphasis: ['quelle stratégie'],
        },
      ],
      sources: [CONSEIL],
    },
  ],
}
