// Série « Culture » (famille « École, culture, numérique ») : l'introduction, puis quatre approfondissements
// (budget de la culture, audiovisuel public, pass Culture, quotas à la télévision), un par outil de la fiche
// « societe-1 ». Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/societe.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : montants votés pour 2026 (la loi de finances pour 2027 les remplacera, en fin d'année 2026) ; pass
// Culture et bonus « annoncé » d'après le site consulté le 3 octobre 2026 ; quotas d'après la page de l'Arcom
// consultée le même jour. À revoir après ces dates.
// « Vous ne payez plus de redevance télé » (culture-audiovisuel-01) vient du « context » de la question
// societe-1 dans la banque (suppression de la redevance en 2022), sans source propre dans la fiche : l'année
// n'est donc pas dite.

import type { VideoSeries, VideoSource } from '../types'

/* Les sources de la fiche « societe-1 », copiées telles quelles (typographie française appliquée aux titres) */

const LOI_DE_FINANCES: VideoSource = {
  title: 'Projet de loi de finances pour 2026 – Texte adopté n°\u00a0227 (texte définitif)',
  url: 'https://www.assemblee-nationale.fr/dyn/17/textes/l17t0227_texte-adopte-seance',
  publisher: 'Assemblée nationale',
  date: '2026-02-02',
}

const SENAT_AUDIOVISUEL: VideoSource = {
  title: 'Projet de loi de finances pour 2026\u00a0: Médias, livre et industries culturelles – Avances à l’audiovisuel public (rapport général n°\u00a0139, tome\u00a0III, annexe\u00a018)',
  url: 'https://www.senat.fr/rap/l25-139-318/l25-139-318_mono.html',
  publisher: 'Sénat, commission des finances',
  date: '2025-11-24',
}

const SENAT_CULTURE: VideoSource = {
  title: 'Projet de loi de finances pour 2026\u00a0: Culture (rapport général n°\u00a0139, tome\u00a0III, annexe\u00a07)',
  url: 'https://www.senat.fr/rap/l25-139-37/l25-139-37_mono.html',
  publisher: 'Sénat, commission des finances',
  date: '2025-11-24',
}

const PASS_CULTURE: VideoSource = {
  title: 'Le pass Culture, c’est quoi\u202f?',
  url: 'https://pass.culture.fr/le-pass-culture-cest-quoi',
  publisher: 'pass Culture (opérateur public du ministère de la Culture)',
  date: 'consulté le 3 octobre 2026',
}

const COUR_DES_COMPTES: VideoSource = {
  title: 'Premier bilan du pass Culture',
  url: 'https://www.ccomptes.fr/fr/publications/premier-bilan-du-pass-culture',
  publisher: 'Cour des comptes',
  date: '2024-12-17',
}

const ARCOM: VideoSource = {
  title: 'Les quotas à la télévision',
  url: 'https://www.arcom.fr/nous-connaitre-nos-missions/promouvoir-et-proteger-la-creation/les-quotas-la-television',
  publisher: 'Arcom',
  date: 'consulté le 3 octobre 2026',
}

/* Les chiffres de la fiche, repris d'une vidéo à l'autre */

const CULTURE_2026 = {
  value: '3,745\u00a0Md€',
  label: 'Crédits de paiement de la mission budgétaire «\u00a0Culture\u00a0» votés pour 2026 (patrimoines, création, transmission des savoirs, soutien du ministère\u202f; l’audiovisuel public est financé à part)',
  date: 'Loi de finances pour 2026',
}

const AUDIOVISUEL_2026 = {
  value: '3,863\u00a0Md€',
  label: 'Crédits votés pour l’audiovisuel public pour 2026, dont 2,426\u00a0Md€ pour France Télévisions et 648\u00a0M€ pour Radio France (le reste pour Arte France, France Médias Monde, l’INA et TV5 Monde)',
  date: 'Loi de finances pour 2026',
}

/** Graphique de la fiche « societe-1 », chiffre n° 1 (explainer-charts.json) */
const AUDIOVISUEL_CHART = {
  kind: 'compare',
  unit: 'Md€',
  items: [
    { label: 'Audiovisuel public, total', value: 3.863 },
    { label: 'Dont France Télévisions', value: 2.426 },
  ],
}

export const SOCIETE: VideoSeries = {
  topicId: 'societe',
  familyId: 'savoirs',
  label: 'Culture',
  videos: [
    {
      id: 'culture-intro',
      kind: 'intro',
      questionIds: ['societe-1'],
      title: 'La politique culturelle, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'culture-intro-01',
          say: 'Un film à la télévision, une émission de radio, un livre. Quel rôle l’État joue-t-il dans la culture\u202f?',
          visual: 'hook',
          draw: 'Trois objets au trait posés côte à côte, un écran de télévision, un poste de radio, un livre ouvert, et un point d’interrogation.',
          emphasis: ['Quel rôle'],
        },
        {
          id: 'culture-intro-02',
          say: 'L’État soutient la culture par plusieurs outils\u00a0: le budget du ministère, l’audiovisuel public, un crédit aux jeunes et des quotas à la télé.',
          visual: 'point',
          draw: 'Quatre pictogrammes en grille, un par outil, chacun quand la voix le nomme\u00a0: des pièces, une tirelire, un document, un sablier\u202f; ce sont aussi ceux du sommaire.',
          emphasis: ['plusieurs outils'],
        },
        {
          id: 'culture-intro-03',
          say: 'Pour 2026, le Parlement a voté 3,745\u00a0milliards d’euros pour la mission «\u00a0Culture\u00a0» du budget de l’État. Et à part, 3,863\u00a0milliards pour l’audiovisuel public.',
          spoken: 'Pour deux mille vingt-six, le Parlement a voté trois milliards sept cent quarante-cinq millions d’euros pour la mission « Culture » du budget de l’État. Et à part, trois milliards huit cent soixante-trois millions pour l’audiovisuel public.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro\u00a0: la mission «\u00a0Culture\u00a0», puis l’audiovisuel public, presque de même longueur.',
          alt: 'Deux barres à la même échelle\u00a0: la mission «\u00a0Culture\u00a0», 3,745\u00a0milliards, et l’audiovisuel public, 3,863\u00a0milliards.',
          emphasis: ['3,745\u00a0milliards', '3,863\u00a0milliards'],
          figure: { ...CULTURE_2026, sourceIndex: 0 },
        },
        {
          id: 'culture-intro-04',
          say: 'Pour les jeunes, il y a le pass Culture\u00a0: un crédit pour leurs achats et leurs sorties culturels. Il donne 50\u00a0euros à 17\u00a0ans, puis 150\u00a0euros à 18\u00a0ans.',
          spoken: 'Pour les jeunes, il y a le pass Culture : un crédit pour leurs achats et leurs sorties culturels. Il donne cinquante euros à dix-sept ans, puis cent cinquante euros à dix-huit ans.',
          visual: 'compare',
          draw: 'Le nom du pass en titre\u202f; dessous, deux barres à la même échelle, 50\u00a0euros à 17\u00a0ans et 150\u00a0euros à 18\u00a0ans.',
          alt: 'Deux barres à la même échelle\u00a0: 50\u00a0euros à 17\u00a0ans, 150\u00a0euros à 18\u00a0ans.',
          emphasis: ['50\u00a0euros', '150\u00a0euros'],
        },
        {
          id: 'culture-intro-05',
          say: 'Et à la télévision, les chaînes ont des quotas. Au moins 60\u00a0% d’œuvres européennes, au moins 40\u00a0% d’œuvres conçues d’abord en français, sur le temps de diffusion des œuvres.',
          spoken: 'Et à la télévision, les chaînes ont des quotas. Au moins soixante pour cent d’œuvres européennes, au moins quarante pour cent d’œuvres conçues d’abord en français, sur le temps de diffusion des œuvres.',
          visual: 'point',
          draw: 'Un écran de télévision au trait\u202f; à côté, deux jauges sur 100, remplies au bleu bille jusqu’à 60 et jusqu’à 40.',
          alt: 'Deux jauges sur 100, remplies à 60 et à 40.',
          emphasis: ['des quotas', '60\u00a0%', '40\u00a0%'],
        },
        {
          id: 'culture-intro-06',
          say: 'Le désaccord porte sur les priorités\u00a0: où mettre l’effort, et sous quelle forme.',
          visual: 'point',
          draw: 'Quatre manettes côte à côte, une par outil, toutes au milieu de leur course.',
          alt: 'Quatre manettes, une par outil\u00a0: budget, audiovisuel public, pass Culture, quotas.',
          emphasis: ['les priorités'],
        },
        {
          id: 'culture-intro-07',
          say: 'Alors, quatre questions se posent. Combien pour la culture\u202f? Comment financer l’audiovisuel public\u202f? Quel soutien aux jeunes\u202f? Et quels quotas à la télévision\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: des pièces, une tirelire, un document, un sablier.',
          emphasis: ['Combien', 'Comment financer', 'Quel soutien'],
        },
        {
          id: 'culture-intro-08',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [LOI_DE_FINANCES, PASS_CULTURE, ARCOM],
    },
    {
      id: 'culture-budget',
      kind: 'deep',
      questionIds: ['societe-1'],
      title: 'Le budget de la culture',
      short: 'Budget',
      register: 'vous',
      segments: [
        {
          id: 'culture-budget-01',
          say: 'Un monument à entretenir, un spectacle à créer\u00a0: l’État y met-il de l’argent, et combien\u202f?',
          visual: 'hook',
          draw: 'Un monument et une scène de spectacle au trait, une pile de pièces entre les deux, et un point d’interrogation.',
          emphasis: ['combien'],
        },
        {
          id: 'culture-budget-02',
          say: 'Pour 2026, le Parlement a voté 3,745\u00a0milliards d’euros pour la mission «\u00a0Culture\u00a0» du budget de l’État.',
          spoken: 'Pour deux mille vingt-six, le Parlement a voté trois milliards sept cent quarante-cinq millions d’euros pour la mission « Culture » du budget de l’État.',
          visual: 'figure',
          draw: 'Le document de la loi de finances, d’où une flèche mène à une pile de pièces au bleu bille.',
          alt: 'Le document de la loi de finances pour 2026, et une pile de pièces.',
          emphasis: ['3,745\u00a0milliards'],
          figure: { ...CULTURE_2026, sourceIndex: 0 },
        },
        {
          id: 'culture-budget-03',
          say: 'Elle finance quatre grands postes\u00a0: le patrimoine, la création, la transmission des savoirs et le soutien du ministère.',
          visual: 'point',
          draw: 'Quatre pictogrammes en grille, chacun quand la voix le nomme\u00a0: un monument, une scène, un livre, un bâtiment.',
          emphasis: ['quatre grands postes'],
        },
        {
          id: 'culture-budget-04',
          say: 'L’audiovisuel public n’en fait pas partie\u00a0: il est financé à part, avec 3,863\u00a0milliards d’euros pour 2026.',
          spoken: 'L’audiovisuel public n’en fait pas partie : il est financé à part, avec trois milliards huit cent soixante-trois millions d’euros pour deux mille vingt-six.',
          visual: 'compare',
          draw: 'Les deux barres de l’introduction, à la même échelle\u00a0: la mission «\u00a0Culture\u00a0», puis l’audiovisuel public, au bleu bille.',
          alt: 'Deux barres à la même échelle\u00a0: la mission «\u00a0Culture\u00a0», 3,745\u00a0milliards, et l’audiovisuel public, 3,863\u00a0milliards.',
          emphasis: ['à part', '3,863\u00a0milliards'],
          figure: { ...AUDIOVISUEL_2026, sourceIndex: 0 },
          chart: AUDIOVISUEL_CHART,
        },
        {
          id: 'culture-budget-05',
          say: 'Ces deux montants sont fixés chaque année par le Parlement, dans la loi de finances.',
          visual: 'point',
          draw: 'Un calendrier, une flèche vers le document de la loi de finances, puis deux piles de pièces.',
          emphasis: ['chaque année'],
        },
        {
          id: 'culture-budget-06',
          say: 'Alors, combien pour la culture, et pour quelles priorités\u202f?',
          visual: 'question',
          draw: 'Une pile de pièces et un monument, et un point d’interrogation à côté.',
          emphasis: ['quelles priorités'],
        },
      ],
      sources: [LOI_DE_FINANCES, SENAT_AUDIOVISUEL],
    },
    {
      id: 'culture-audiovisuel',
      kind: 'deep',
      questionIds: ['societe-1'],
      title: 'Qui finance l’audiovisuel public\u202f?',
      short: 'Audiovisuel public',
      register: 'vous',
      segments: [
        {
          id: 'culture-audiovisuel-01',
          say: 'Vous ne payez plus de redevance télé. Alors, qui finance les chaînes et les radios publiques\u202f?',
          visual: 'hook',
          draw: 'Un écran et un poste de radio au trait\u202f; à côté, l’avis de redevance en pointillé, et un point d’interrogation.',
          alt: 'L’avis de redevance, en pointillé\u00a0: il n’existe plus.',
          emphasis: ['qui finance'],
        },
        {
          id: 'culture-audiovisuel-02',
          say: 'Une part de la TVA, la taxe sur ce que vous achetez, va à l’audiovisuel public.',
          spoken: 'Une part de la T.V.A., la taxe sur ce que vous achetez, va à l’audiovisuel public.',
          visual: 'point',
          draw: 'Une étiquette de prix marquée TVA au-dessus d’une pile de pièces\u202f; une pièce au bleu bille en part, par une flèche, vers l’écran et la radio.',
          alt: 'Une étiquette de prix marquée «\u00a0TVA\u00a0».',
          emphasis: ['Une part de la TVA'],
        },
        {
          id: 'culture-audiovisuel-03',
          say: 'Ce financement a été rendu durable par une loi organique, le 13\u00a0décembre 2024.',
          spoken: 'Ce financement a été rendu durable par une loi organique, le treize décembre deux mille vingt-quatre.',
          visual: 'point',
          draw: 'L’étiquette de la TVA reliée par une flèche à l’écran et à la radio\u202f; sur la flèche, le texte de la loi organique, au bleu bille, et sa date dessous.',
          alt: 'Une étiquette de prix marquée «\u00a0TVA\u00a0», reliée à l’écran et à la radio par le texte de la loi.',
          emphasis: ['loi organique', '13\u00a0décembre 2024'],
        },
        {
          id: 'culture-audiovisuel-04',
          say: 'Une loi organique, c’est un texte au-dessus des lois ordinaires, mais sous la Constitution.',
          visual: 'point',
          draw: 'Trois marches\u00a0: les lois ordinaires en bas, la loi organique au milieu, au bleu bille, la Constitution en haut.',
          alt: 'Trois marches\u00a0: lois ordinaires, loi organique, Constitution.',
          emphasis: ['au-dessus des lois ordinaires', 'sous la Constitution'],
        },
        {
          id: 'culture-audiovisuel-05',
          say: 'Mais le montant, lui, reste fixé chaque année par le Parlement, dans la loi de finances.',
          visual: 'point',
          draw: 'Un calendrier, une flèche vers le document de la loi de finances, puis une pile de pièces.',
          emphasis: ['chaque année'],
        },
        {
          id: 'culture-audiovisuel-06',
          say: 'Pour 2026, le Parlement a voté 3,863\u00a0milliards d’euros.',
          spoken: 'Pour deux mille vingt-six, le Parlement a voté trois milliards huit cent soixante-trois millions d’euros.',
          visual: 'figure',
          draw: 'Une longue barre au trait, l’enveloppe de l’audiovisuel public pour 2026, au-dessus d’un écran et d’une radio.',
          emphasis: ['3,863\u00a0milliards'],
          figure: { ...AUDIOVISUEL_2026, sourceIndex: 1 },
          chart: AUDIOVISUEL_CHART,
        },
        {
          id: 'culture-audiovisuel-07',
          say: 'Sur ce total, 2,426\u00a0milliards vont à France Télévisions, et 648\u00a0millions à Radio France.',
          spoken: 'Sur ce total, deux milliards quatre cent vingt-six millions vont à France Télévisions, et six cent quarante-huit millions à Radio France.',
          visual: 'compare',
          draw: 'La même barre se partage, à l’échelle\u00a0: une longue part pour France Télévisions, une plus courte pour Radio France.',
          alt: 'Une barre de 3,863\u00a0milliards, partagée à l’échelle.',
          emphasis: ['2,426\u00a0milliards', '648\u00a0millions'],
        },
        {
          id: 'culture-audiovisuel-08',
          say: 'Le reste va à Arte France, France Médias Monde, l’INA et TV5 Monde.',
          spoken: 'Le reste va à Arte France, France Médias Monde, l’Ina et T.V. cinq Monde.',
          visual: 'point',
          draw: 'Le dernier morceau de la barre s’entoure d’une accolade, avec quatre noms dessous.',
          alt: 'La barre de l’audiovisuel public, partagée entre France Télévisions, Radio France et le reste.',
          emphasis: ['Le reste'],
        },
        {
          id: 'culture-audiovisuel-09',
          say: 'Alors, comment financer l’audiovisuel public, et à quelle hauteur\u202f?',
          visual: 'question',
          draw: 'L’écran et la radio posés sur une pile de pièces, et un point d’interrogation.',
          emphasis: ['comment financer'],
        },
      ],
      sources: [SENAT_AUDIOVISUEL, LOI_DE_FINANCES],
    },
    {
      id: 'culture-pass',
      kind: 'deep',
      questionIds: ['societe-1'],
      title: 'Le pass Culture, pour qui et pour quoi\u202f?',
      short: 'Pass Culture',
      register: 'vous',
      segments: [
        {
          id: 'culture-pass-01',
          say: 'Vous avez 17\u00a0ans\u00a0: vous pouvez recevoir un crédit pour vos achats et vos sorties culturels. Comment marche ce pass Culture\u202f?',
          spoken: 'Vous avez dix-sept ans : vous pouvez recevoir un crédit pour vos achats et vos sorties culturels. Comment marche ce pass Culture ?',
          visual: 'hook',
          draw: 'Une personne au trait, une carte au bleu bille tendue vers elle, et un point d’interrogation.',
          emphasis: ['pass Culture'],
        },
        {
          id: 'culture-pass-02',
          say: 'Il donne 50\u00a0euros à 17\u00a0ans, puis 150\u00a0euros à 18\u00a0ans, à utiliser en 3\u00a0ans.',
          spoken: 'Il donne cinquante euros à dix-sept ans, puis cent cinquante euros à dix-huit ans, à utiliser en trois ans.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, 50\u00a0euros à 17\u00a0ans et 150\u00a0euros à 18\u00a0ans\u202f; dessous, un sablier.',
          alt: 'Deux barres à la même échelle, à 17\u00a0ans et à 18\u00a0ans, et un sablier.',
          emphasis: ['50\u00a0euros', '150\u00a0euros', 'en 3\u00a0ans'],
        },
        {
          id: 'culture-pass-03',
          say: 'Un bonus de 50\u00a0euros est aussi annoncé, sous conditions liées au handicap ou aux ressources.',
          spoken: 'Un bonus de cinquante euros est aussi annoncé, sous conditions liées au handicap ou aux ressources.',
          visual: 'point',
          draw: 'Les deux barres du passage précédent, et une troisième, de 50\u00a0euros, en pointillé\u00a0: annoncée.',
          alt: 'Trois barres à la même échelle\u00a0: 50\u00a0euros à 17\u00a0ans, 150\u00a0euros à 18\u00a0ans, et le bonus annoncé, en pointillé.',
          emphasis: ['annoncé'],
        },
        {
          id: 'culture-pass-04',
          say: 'Il a aussi une part collective, gérée par les enseignants\u00a0: elle finance des activités d’éducation artistique et culturelle, de la 6e à la terminale.',
          spoken: 'Il a aussi une part collective, gérée par les enseignants : elle finance des activités d’éducation artistique et culturelle, de la sixième à la terminale.',
          visual: 'point',
          draw: 'Une personne au trait, les enseignants, devant une rangée d’élèves\u202f; dessous, de la 6e à la terminale.',
          emphasis: ['part collective'],
        },
        {
          id: 'culture-pass-05',
          say: 'Sur l’année scolaire 2023-2024, 72\u00a0% des élèves concernés en ont bénéficié au moins une fois. Plus de 7\u00a0sur 10.',
          spoken: 'Sur l’année scolaire deux mille vingt-trois – deux mille vingt-quatre, soixante-douze pour cent des élèves concernés en ont bénéficié au moins une fois. Plus de sept sur dix.',
          visual: 'figure',
          draw: 'Cent petites cases\u202f; 72 se remplissent au bleu bille.',
          emphasis: ['72\u00a0%', 'Plus de 7\u00a0sur 10'],
          figure: {
            value: '72\u00a0%',
            label: 'Part des élèves éligibles à la part collective du pass Culture (sorties, accueil d’un professionnel en classe…) ayant bénéficié d’au moins une action financée par elle',
            date: 'Année scolaire 2023-2024',
            sourceIndex: 1,
          },
          chart: { kind: 'part', value: 72, total: 100, unit: '%', whole: 'des élèves éligibles' },
        },
        {
          id: 'culture-pass-06',
          say: 'Le crédit individuel, lui, a été évalué par la Cour des comptes, quand il valait 300\u00a0euros à 18\u00a0ans. Fin août 2024, 75\u00a0% des jeunes l’avaient utilisé\u00a0: trois sur quatre.',
          spoken: 'Le crédit individuel, lui, a été évalué par la Cour des comptes, quand il valait trois cents euros à dix-huit ans. Fin août deux mille vingt-quatre, soixante-quinze pour cent des jeunes l’avaient utilisé : trois sur quatre.',
          visual: 'figure',
          draw: 'Quatre personnes au trait\u202f; trois se colorent au bleu bille.',
          emphasis: ['75\u00a0%', 'trois sur quatre'],
          figure: {
            value: '75\u00a0%',
            label: 'Part des jeunes ayant utilisé leur pass Culture individuel, quand le crédit à 18\u00a0ans était de 300\u00a0€ (dépense moyenne\u00a0: un peu plus de 250\u00a0€). Les 25\u00a0% restants se répartissent entre 16\u00a0% de non-inscrits, «\u00a0les publics les moins familiers des pratiques culturelles\u00a0» selon la Cour, et 9\u00a0% d’inscrits qui ne l’ont pas utilisé',
            date: 'Fin août 2024',
            sourceIndex: 2,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Ont utilisé leur pass', value: 75 },
              { label: 'Non-inscrits', value: 16 },
              { label: 'Inscrits sans l’utiliser', value: 9 },
            ],
          },
        },
        {
          id: 'culture-pass-07',
          say: 'En moyenne, ils en avaient dépensé un peu plus de 250\u00a0euros, sur les 300.',
          spoken: 'En moyenne, ils en avaient dépensé un peu plus de deux cent cinquante euros, sur les trois cents.',
          visual: 'point',
          draw: 'Une jauge graduée jusqu’à 300\u00a0euros, remplie au bleu bille un peu au-delà de 250.',
          alt: 'Une jauge graduée de 0 à 300\u00a0euros.',
          emphasis: ['un peu plus de 250\u00a0euros'],
        },
        {
          id: 'culture-pass-08',
          say: 'Les autres\u00a0: 16\u00a0% ne s’étaient pas inscrits, «\u00a0les publics les moins familiers des pratiques culturelles\u00a0», selon la Cour. Et 9\u00a0% s’étaient inscrits sans l’utiliser.',
          spoken: 'Les autres : seize pour cent ne s’étaient pas inscrits, « les publics les moins familiers des pratiques culturelles », selon la Cour. Et neuf pour cent s’étaient inscrits sans l’utiliser.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: 75, 16 et 9\u00a0%\u202f; les deux dernières au bleu bille.',
          alt: 'Trois barres à la même échelle\u00a0: ont utilisé leur pass, 75\u00a0%\u202f; ne s’étaient pas inscrits, 16\u00a0%\u202f; s’étaient inscrits sans l’utiliser, 9\u00a0%.',
          emphasis: ['16\u00a0%', '9\u00a0%'],
        },
        {
          id: 'culture-pass-09',
          say: 'D’un côté, le crédit individuel, que chaque jeune utilise lui-même. De l’autre, la part collective, que les enseignants gèrent pour leurs élèves.',
          visual: 'compare',
          draw: 'Une balance à deux plateaux de même taille, fléau horizontal\u00a0: une personne et sa carte d’un côté, une rangée d’élèves de l’autre.',
          emphasis: ['le crédit individuel', 'la part collective'],
        },
        {
          id: 'culture-pass-10',
          say: 'Alors, quelle place donner à chacune de ces deux parts\u202f?',
          visual: 'question',
          draw: 'La carte et la rangée d’élèves côte à côte, et un point d’interrogation.',
          emphasis: ['quelle place'],
        },
      ],
      sources: [PASS_CULTURE, SENAT_CULTURE, COUR_DES_COMPTES],
    },
    {
      id: 'culture-quotas',
      kind: 'deep',
      questionIds: ['societe-1'],
      title: 'Quotas\u00a0: le temps de diffusion des œuvres',
      short: 'Quotas',
      register: 'vous',
      segments: [
        {
          id: 'culture-quotas-01',
          say: 'Ce soir, vous allumez la télévision. La chaîne choisit-elle librement les films et les séries qu’elle diffuse\u202f?',
          visual: 'hook',
          draw: 'Un écran de télévision au trait, et un point d’interrogation à côté.',
          emphasis: ['librement'],
        },
        {
          id: 'culture-quotas-02',
          say: 'Pas tout à fait. Elle doit respecter des quotas, des parts minimales du temps de diffusion des œuvres.',
          visual: 'point',
          draw: 'L’écran, et à côté un sablier, le temps de diffusion.',
          emphasis: ['des quotas'],
        },
        {
          id: 'culture-quotas-03',
          say: 'Au moins 60\u00a0% du temps de diffusion des œuvres audiovisuelles doit aller à des œuvres européennes.',
          spoken: 'Au moins soixante pour cent du temps de diffusion des œuvres audiovisuelles doit aller à des œuvres européennes.',
          visual: 'figure',
          draw: 'Cent petites cases\u202f; 60 se remplissent au bleu bille.',
          emphasis: ['60\u00a0%'],
          figure: {
            value: '60\u00a0%',
            label: 'Part minimale du temps de diffusion des œuvres audiovisuelles consacrée à des œuvres européennes, à la télévision (proportion comparable pour les films)',
            date: 'Règle en vigueur au 3\u00a0octobre 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'culture-quotas-04',
          say: 'Et au moins 40\u00a0% à des œuvres d’expression originale française, c’est-à-dire conçues d’abord en français.',
          spoken: 'Et au moins quarante pour cent à des œuvres d’expression originale française, c’est-à-dire conçues d’abord en français.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, sur 100\u00a0: les œuvres européennes, 60, puis l’expression originale française, 40, au bleu bille.',
          alt: 'Deux barres à la même échelle\u00a0: œuvres européennes, 60\u00a0%\u202f; expression originale française, 40\u00a0%.',
          emphasis: ['40\u00a0%', 'conçues d’abord en français'],
          figure: {
            value: '40\u00a0%',
            label: 'Part minimale du temps de diffusion des œuvres audiovisuelles consacrée à des œuvres d’expression originale française, conçues d’abord en français (proportion comparable pour les films)',
            date: 'Règle en vigueur au 3\u00a0octobre 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'culture-quotas-05',
          say: 'Sur les chaînes reçues par l’antenne, dites hertziennes, ces quotas valent aussi aux heures de grande écoute.',
          visual: 'point',
          draw: 'Un écran avec son antenne, et une horloge à côté.',
          alt: 'Un écran avec son antenne, et une horloge.',
          emphasis: ['heures de grande écoute'],
        },
        {
          id: 'culture-quotas-06',
          say: 'Pour les films, les proportions sont comparables\u00a0: 60\u00a0% et 40\u00a0%.',
          spoken: 'Pour les films, les proportions sont comparables : soixante pour cent et quarante pour cent.',
          visual: 'compare',
          draw: 'Une pellicule de film au trait, et à côté les deux mêmes jauges, 60 et 40, sur 100.',
          alt: 'Une pellicule de film, et deux jauges sur 100\u00a0: œuvres européennes, remplie à 60\u00a0%\u202f; conçues d’abord en français, remplie à 40\u00a0%.',
          emphasis: ['Pour les films', 'comparables'],
        },
        {
          id: 'culture-quotas-07',
          say: 'Alors, quelle part de l’écran pour les œuvres européennes, et pour celles conçues en français\u202f?',
          visual: 'question',
          draw: 'L’écran de télévision, et un point d’interrogation.',
          emphasis: ['quelle part'],
        },
      ],
      sources: [ARCOM],
    },
  ],
}
