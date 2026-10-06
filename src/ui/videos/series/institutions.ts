// Série « Institutions » (famille « République et vie politique ») : l'introduction, puis quatre
// approfondissements (le président et l'Assemblée, le 49.3, la révision de la Constitution, la place des
// citoyens). La banque n'a que deux questions sur ce thème (institutions-1 : l'équilibre des pouvoirs ;
// institutions-2 : la place des citoyens) : la première, qui mêle trois leviers, est scindée en trois vidéos.
// Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/institutions.tsx. Tous les faits et
// chiffres viennent des fiches institutions-1 et institutions-2 (research/choisir-2027/explainers.json).
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : motions de censure arrêtées au 26 février 2026, recours au 49.3 à janvier 2026, référendums
// d'initiative partagée au 3 octobre 2026, révisions de la Constitution au 8 mars 2024. À revoir si un 49.3,
// une motion de censure, une dissolution, une révision ou un nouveau référendum d'initiative partagée survient
// avant le vote (9-10 et 16-17 octobre 2026).

import type { VideoSeries, VideoSource } from '../types'

/* ——— Les sources des fiches, copiées telles quelles (typographie française appliquée aux titres) ——— */

const AN_RESPONSABILITE: VideoSource = {
  title: 'Fiche de synthèse n°\u00a064\u00a0: La mise en cause de la responsabilité du Gouvernement',
  url: 'https://www.assemblee-nationale.fr/dyn/synthese/fonctionnement-assemblee-nationale/evaluation-politiques-publiques-controle-gouvernement/la-mise-en-cause-de-la-responsabilite-du-gouvernement',
  publisher: 'Assemblée nationale',
  date: 'actualisée le 6\u00a0décembre 2024',
}

const AN_ENGAGEMENTS: VideoSource = {
  title: 'Engagements de responsabilité du Gouvernement et motions de censure depuis 1958',
  url: 'https://www.assemblee-nationale.fr/dyn/engagements_responsabilite-motions_censures/engagements-de-responsabilite-du-gouvernement-et-motions-de-censure-depuis-1958',
  publisher: 'Assemblée nationale',
  date: 'mise à jour du 9\u00a0septembre 2025',
}

const LCP_DISSOLUTIONS: VideoSource = {
  title: 'Dissolution de l’Assemblée nationale\u00a0: Emmanuel Macron procède à la sixième dissolution depuis 1958',
  url: 'https://lcp.fr/actualites/dissolution-de-l-assemblee-nationale-emmanuel-macron-procede-a-la-sixieme-dissolution',
  publisher: 'LCP-Assemblée nationale',
  date: '10\u00a0juin 2024',
}

const CC_REVISIONS: VideoSource = {
  title: 'Quand la Constitution a-t-elle été modifiée\u202f?',
  url: 'https://www.conseil-constitutionnel.fr/la-constitution/quand-la-constitution-a-t-elle-ete-modifiee',
  publisher: 'Conseil constitutionnel',
  date: 'mise à jour du 11\u00a0mars 2024',
}

const CC_ARTICLE_89: VideoSource = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur (article\u00a089)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: 'à jour de la révision constitutionnelle du 8\u00a0mars 2024',
}

const CC_ARTICLE_11: VideoSource = {
  title: 'Texte intégral de la Constitution du 4\u00a0octobre 1958 en vigueur (article\u00a011)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: 'à jour de la révision constitutionnelle du 8\u00a0mars 2024',
}

const CC_HISTOIRE_REFERENDUM: VideoSource = {
  title: 'L’histoire du référendum sous la Ve\u00a0République',
  url: 'https://www.conseil-constitutionnel.fr/la-constitution/l-histoire-du-referendum-sous-la-ve-republique',
  publisher: 'Conseil constitutionnel',
  date: 'mise à jour du 11\u00a0février 2020',
}

const CC_TABLEAU_REFERENDUMS: VideoSource = {
  title: 'Tableau récapitulatif des référendums de la Vème\u00a0République',
  url: 'https://www.conseil-constitutionnel.fr/referendum-sous-la-ve-republique/tableau-recapitulatif-des-referendums-de-la-veme-republique',
  publisher: 'Conseil constitutionnel',
}

const CC_DECISIONS_RIP: VideoSource = {
  title: 'Les décisions – type\u00a0: Référendum d’initiative partagée (RIP)',
  url: 'https://www.conseil-constitutionnel.fr/les-decisions/type/RIP',
  publisher: 'Conseil constitutionnel',
  date: 'consulté le 3\u00a0octobre 2026',
}

const CC_DECISION_ADP: VideoSource = {
  title: 'Décision n°\u00a02019-1-8 RIP du 26\u00a0mars 2020',
  url: 'https://www.conseil-constitutionnel.fr/decision/2020/201918RIP.htm',
  publisher: 'Conseil constitutionnel',
  date: '26\u00a0mars 2020',
}

const CGCT_REFERENDUM_LOCAL: VideoSource = {
  title: 'Code général des collectivités territoriales, article LO1112-7',
  url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000006389054',
  publisher: 'Légifrance',
  date: 'en vigueur depuis le 1er\u00a0janvier 2005',
}

const CESE_CONVENTION: VideoSource = {
  title: 'Après 8\u00a0mois de travail, la Convention Citoyenne pour le Climat a rendu ses propositions',
  url: 'https://www.lecese.fr/actualites/apres-8-mois-de-travail-la-convention-citoyenne-pour-le-climat-rendu-ses-propositions',
  publisher: 'Conseil économique, social et environnemental (CESE)',
  date: '30\u00a0juin 2020',
}

/* ——— Les chiffres des fiches, repris dans plusieurs vidéos (libellé, date) ——— */

const DISSOLUTIONS = {
  value: '6',
  label: 'dissolutions de l’Assemblée nationale depuis 1958\u00a0: 1962, 1968, 1981, 1988, 1997 et 2024',
  date: 'juin 2024',
}

const CENSURES = {
  value: '2',
  label: 'motions de censure adoptées depuis 1958\u00a0: en octobre 1962 et le 4\u00a0décembre 2024. Aucune autre n’a atteint la majorité requise jusqu’au dernier vote recensé par l’Assemblée, le 26\u00a0février 2026',
  date: 'état au 26\u00a0février 2026',
}

const RECOURS_49_3 = {
  value: '116',
  label: 'recours au 49.3 entre 1959 et septembre 2025, sur 61\u00a0textes, selon le bilan de l’Assemblée nationale. Son tableau détaillé en ajoute 2 en janvier 2026, pour le budget 2026',
  date: '9\u00a0septembre 2025',
}

const REVISIONS = {
  value: '25',
  label: 'révisions de la Constitution depuis 1958, la dernière le 8\u00a0mars 2024',
  date: '8\u00a0mars 2024',
}

const REFERENDUMS = {
  value: '9',
  label: 'référendums nationaux organisés depuis 1958, hors adoption de la Constitution\u00a0; le dernier le 29\u00a0mai 2005',
  date: '29\u00a0mai 2005',
}

export const INSTITUTIONS: VideoSeries = {
  topicId: 'institutions',
  familyId: 'republique',
  label: 'Institutions',
  videos: [
    {
      id: 'institutions-intro',
      kind: 'intro',
      questionIds: ['institutions-1', 'institutions-2'],
      title: 'Les institutions, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'institutions-intro-01',
          say: 'Vous élisez un président et des députés. Mais ensuite, qui décide quoi\u202f?',
          visual: 'hook',
          draw: 'Une urne au trait où entre une enveloppe\u202f; de l’urne partent deux pointillés, vers le président et vers l’hémicycle des députés, puis un point d’interrogation.',
          emphasis: ['qui décide quoi'],
        },
        {
          id: 'institutions-intro-02',
          say: 'La Constitution de 1958 donne au président des pouvoirs qu’il exerce seul. Il nomme le Premier ministre, et peut dissoudre l’Assemblée nationale.',
          spoken: 'La Constitution de mille neuf cent cinquante-huit donne au président des pouvoirs qu’il exerce seul. Il nomme le Premier ministre, et peut dissoudre l’Assemblée nationale.',
          visual: 'point',
          draw: 'Le président au trait, seul\u202f; une flèche pleine vers le Premier ministre, une flèche en pointillé marquée «\u00a0dissoudre\u00a0» vers l’hémicycle de l’Assemblée nationale.',
          emphasis: ['qu’il exerce seul', 'le Premier ministre', 'dissoudre'],
        },
        {
          id: 'institutions-intro-03',
          say: 'Depuis 1958, l’Assemblée a été dissoute 6\u00a0fois. La dernière, en 2024.',
          spoken: 'Depuis mille neuf cent cinquante-huit, l’Assemblée a été dissoute six fois. La dernière, en deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'Une ligne du temps qui part de 1958\u202f; six repères au bleu bille, le dernier, 2024, appuyé.',
          alt: 'Sur une ligne du temps qui part de 1958, six repères\u00a0: 1962, 1968, 1981, 1988, 1997 et 2024.',
          emphasis: ['6\u00a0fois', '2024'],
          figure: { ...DISSOLUTIONS, sourceIndex: 1 },
        },
        {
          id: 'institutions-intro-04',
          say: 'Le gouvernement, lui, peut faire adopter un texte sans vote\u00a0: c’est le 49.3. Il a servi 116\u00a0fois entre 1959 et septembre 2025.',
          spoken: 'Le gouvernement, lui, peut faire adopter un texte sans vote : c’est le quarante-neuf trois. Il a servi cent seize fois entre mille neuf cent cinquante-neuf et septembre deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Une grille de 116\u00a0petites cases qui passent au bleu bille, une par recours au 49.3.',
          alt: 'Une grille de 116\u00a0cases, une par recours au 49.3.',
          emphasis: ['le 49.3', '116\u00a0fois'],
          figure: { ...RECOURS_49_3, sourceIndex: 2 },
        },
        {
          id: 'institutions-intro-05',
          say: 'Face à lui, l’Assemblée peut renverser le gouvernement en votant une motion de censure. C’est arrivé 2\u00a0fois depuis 1958\u00a0: en 1962 et en 2024.',
          spoken: 'Face à lui, l’Assemblée peut renverser le gouvernement en votant une motion de censure. C’est arrivé deux fois depuis mille neuf cent cinquante-huit : en mille neuf cent soixante-deux et en deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'L’hémicycle de l’Assemblée et une flèche marquée «\u00a0motion de censure\u00a0» vers le gouvernement, trois personnes au trait\u202f; dessous, une ligne du temps et deux repères, 1962 et 2024.',
          alt: 'Sur une ligne du temps qui part de 1958, deux repères\u00a0: 1962 et 2024.',
          emphasis: ['motion de censure', '2\u00a0fois'],
          figure: { ...CENSURES, sourceIndex: 0 },
        },
        {
          id: 'institutions-intro-06',
          say: 'Les règles elles-mêmes changent\u00a0: la Constitution a été révisée 25\u00a0fois depuis 1958, la dernière le 8\u00a0mars 2024.',
          spoken: 'Les règles elles-mêmes changent : la Constitution a été révisée vingt-cinq fois depuis mille neuf cent cinquante-huit, la dernière le huit mars deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'Vingt-cinq petites feuilles au trait, rangée après rangée, qui passent au bleu bille.',
          emphasis: ['25\u00a0fois'],
          figure: { ...REVISIONS, sourceIndex: 3 },
        },
        {
          id: 'institutions-intro-07',
          say: 'Et vous\u202f? Vous décidez surtout en élisant vos représentants. Sous la Constitution de 1958, il y a eu 9\u00a0référendums nationaux, le dernier en 2005.',
          spoken: 'Et vous, vous décidez surtout en élisant vos représentants. Sous la Constitution de mille neuf cent cinquante-huit, il y a eu neuf référendums nationaux, le dernier en deux mille cinq.',
          visual: 'figure',
          draw: 'Neuf petites urnes au trait alignées, qui passent au bleu bille\u202f; sous la dernière, 2005.',
          emphasis: ['en élisant vos représentants', '9\u00a0référendums'],
          figure: { ...REFERENDUMS, sourceIndex: 4 },
        },
        {
          id: 'institutions-intro-08',
          say: 'Alors, quatre questions se posent. Qui nomme et qui renverse un gouvernement\u202f? Quand un texte peut-il passer sans vote\u202f? Comment changer la Constitution\u202f? Et quelle place pour les citoyens\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: un hémicycle, une feuille de texte, un livre, une urne.',
          emphasis: ['qui renverse', 'sans vote', 'quelle place'],
        },
        {
          id: 'institutions-intro-09',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [AN_RESPONSABILITE, LCP_DISSOLUTIONS, AN_ENGAGEMENTS, CC_REVISIONS, CC_HISTOIRE_REFERENDUM],
    },
    {
      id: 'institutions-pouvoirs',
      kind: 'deep',
      questionIds: ['institutions-1'],
      title: 'Qui nomme, qui renverse le gouvernement\u202f?',
      short: 'Président et Assemblée',
      register: 'vous',
      segments: [
        {
          id: 'institutions-pouvoirs-01',
          say: 'Un nouveau Premier ministre est nommé. Les députés doivent-ils d’abord voter pour lui\u202f?',
          visual: 'hook',
          draw: 'Une personne au trait, le nouveau Premier ministre\u202f; face à elle, l’hémicycle des députés, et entre les deux une flèche en pointillé et un point d’interrogation.',
          emphasis: ['voter pour lui'],
        },
        {
          id: 'institutions-pouvoirs-02',
          say: 'Non, le président le nomme seul, sans vote de l’Assemblée\u00a0: il n’y a pas d’investiture obligatoire.',
          visual: 'point',
          draw: 'Une flèche pleine du président vers le Premier ministre\u202f; l’hémicycle reste en dessous, en pointillé.',
          emphasis: ['sans vote de l’Assemblée', 'pas d’investiture obligatoire'],
        },
        {
          id: 'institutions-pouvoirs-03',
          say: 'Son gouvernement reste en place tant que l’Assemblée n’adopte pas de motion de censure. Ou tant qu’elle ne lui refuse pas une confiance qu’il a lui-même demandée.',
          visual: 'point',
          draw: 'Le gouvernement, trois personnes au trait sur un même banc\u202f; de l’hémicycle montent deux flèches en pointillé, la censure et la confiance.',
          emphasis: ['motion de censure', 'confiance'],
        },
        {
          id: 'institutions-pouvoirs-04',
          say: 'Depuis 1958, l’Assemblée a adopté 2\u00a0motions de censure\u00a0: en octobre 1962, et le 4\u00a0décembre 2024.',
          spoken: 'Depuis mille neuf cent cinquante-huit, l’Assemblée a adopté deux motions de censure : en octobre mille neuf cent soixante-deux, et le quatre décembre deux mille vingt-quatre.',
          visual: 'timeline',
          draw: 'Une ligne du temps de 1958 à 2026\u202f; deux repères au bleu bille, octobre 1962 et 4\u00a0décembre 2024.',
          alt: 'Sur une ligne du temps de 1958 à 2026, deux repères\u00a0: octobre 1962 et 4\u00a0décembre 2024.',
          emphasis: ['2\u00a0motions de censure'],
          figure: { ...CENSURES, sourceIndex: 0 },
        },
        {
          id: 'institutions-pouvoirs-05',
          say: 'En face, le président peut dissoudre l’Assemblée. C’est arrivé 6\u00a0fois depuis 1958. En 1962, 1968, 1981, 1988, 1997 et 2024.',
          spoken: 'En face, le président peut dissoudre l’Assemblée. C’est arrivé six fois depuis mille neuf cent cinquante-huit. En mille neuf cent soixante-deux, mille neuf cent soixante-huit, mille neuf cent quatre-vingt-un, mille neuf cent quatre-vingt-huit, mille neuf cent quatre-vingt-dix-sept et deux mille vingt-quatre.',
          visual: 'timeline',
          draw: 'Une ligne du temps qui part de 1958\u202f; un repère au bleu bille se pose à chaque année dite.',
          alt: 'Sur une ligne du temps qui part de 1958, un repère par dissolution.',
          emphasis: ['dissoudre', '6\u00a0fois'],
          figure: { ...DISSOLUTIONS, sourceIndex: 1 },
        },
        {
          id: 'institutions-pouvoirs-06',
          say: 'D’un côté, la capacité d’agir du président et du gouvernement. De l’autre, le poids du Parlement et des citoyens.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: le président et une feuille de texte sur un plateau, l’hémicycle et une personne sur l’autre.',
          emphasis: ['la capacité d’agir', 'le poids du Parlement'],
        },
        {
          id: 'institutions-pouvoirs-07',
          say: 'Alors, quel équilibre entre le président, le gouvernement et l’Assemblée\u202f?',
          visual: 'question',
          draw: 'Le président, le gouvernement et l’hémicycle en triangle, reliés par des pointillés, un point d’interrogation au milieu.',
          emphasis: ['quel équilibre'],
        },
      ],
      sources: [AN_RESPONSABILITE, LCP_DISSOLUTIONS],
    },
    {
      id: 'institutions-49-3',
      kind: 'deep',
      questionIds: ['institutions-1'],
      title: 'Le 49.3, comment ça marche\u202f?',
      short: 'Le 49.3',
      register: 'vous',
      segments: [
        {
          id: 'institutions-49-3-01',
          say: 'Une loi peut-elle être adoptée sans vote des députés\u202f?',
          visual: 'hook',
          draw: 'Une feuille de texte passe au-dessus de l’hémicycle, par une flèche en pointillé, jusqu’à un point d’interrogation.',
          emphasis: ['sans vote des députés'],
        },
        {
          id: 'institutions-49-3-02',
          say: 'Oui, avec l’article 49.3 de la Constitution. Le gouvernement engage alors sa responsabilité sur un texte.',
          spoken: 'Oui, avec l’article quarante-neuf trois de la Constitution. Le gouvernement engage alors sa responsabilité sur un texte.',
          visual: 'point',
          draw: 'Le gouvernement, trois personnes au trait, relié par une flèche au bleu bille à une feuille de texte.',
          emphasis: ['l’article 49.3', 'sa responsabilité'],
        },
        {
          id: 'institutions-49-3-03',
          say: 'Le texte est alors considéré comme adopté, sauf si les députés votent une motion de censure.',
          visual: 'point',
          draw: 'La feuille de texte reçoit une coche au bleu bille\u202f; de l’hémicycle part une flèche en pointillé vers elle, la motion de censure.',
          emphasis: ['considéré comme adopté', 'motion de censure'],
        },
        {
          id: 'institutions-49-3-04',
          say: 'Avant la révision du 23\u00a0juillet 2008, son usage n’avait pas de limite. Depuis, il ne sert que pour les budgets de l’État et de la Sécurité sociale, plus un autre texte par session.',
          spoken: 'Avant la révision du vingt-trois juillet deux mille huit, son usage n’avait pas de limite. Depuis, il ne sert que pour les budgets de l’État et de la Sécurité sociale, plus un autre texte par session.',
          visual: 'timeline',
          draw: 'Une ligne du temps coupée en 2008\u00a0: avant, une pile de feuilles\u202f; après, deux budgets et une seule feuille de plus, au bleu bille.',
          emphasis: ['pas de limite', 'les budgets', 'un autre texte par session'],
        },
        {
          id: 'institutions-49-3-05',
          say: 'Entre 1959 et septembre 2025, il a servi 116\u00a0fois, sur 61\u00a0textes. Puis 2\u00a0fois en janvier 2026, pour le budget 2026.',
          spoken: 'Entre mille neuf cent cinquante-neuf et septembre deux mille vingt-cinq, il a servi cent seize fois, sur soixante et un textes. Puis deux fois en janvier deux mille vingt-six, pour le budget deux mille vingt-six.',
          visual: 'figure',
          draw: 'Une grille de 116\u00a0petites cases au bleu bille, puis deux cases de plus, à l’écart, marquées janvier 2026.',
          alt: 'Une grille de 116\u00a0cases, une par recours, puis deux cases de plus.',
          emphasis: ['116\u00a0fois', '61\u00a0textes'],
          figure: { ...RECOURS_49_3, sourceIndex: 1 },
        },
        {
          id: 'institutions-49-3-06',
          say: 'D’un côté, la capacité du gouvernement à faire adopter ses textes. De l’autre, le poids du vote des députés.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: le gouvernement et une feuille de texte sur un plateau, l’hémicycle des députés et une feuille de texte sur l’autre.',
          emphasis: ['la capacité du gouvernement', 'le poids du vote des députés'],
        },
        {
          id: 'institutions-49-3-07',
          say: 'Alors, quelle place donner à cet outil, et dans quelles limites\u202f?',
          visual: 'question',
          draw: 'La feuille de texte posée devant l’hémicycle, et un point d’interrogation.',
          emphasis: ['quelle place', 'quelles limites'],
        },
      ],
      sources: [AN_RESPONSABILITE, AN_ENGAGEMENTS],
    },
    {
      id: 'institutions-constitution',
      kind: 'deep',
      questionIds: ['institutions-1'],
      title: 'Comment change-t-on la Constitution\u202f?',
      short: 'Réviser la Constitution',
      register: 'vous',
      segments: [
        {
          id: 'institutions-constitution-01',
          say: 'La Constitution fixe les règles entre le président, le gouvernement et le Parlement. Peut-on la changer\u202f?',
          visual: 'hook',
          draw: 'Un livre au trait, la Constitution, relié par des pointillés au président, au gouvernement et à l’hémicycle du Parlement.',
          emphasis: ['Peut-on la changer'],
        },
        {
          id: 'institutions-constitution-02',
          say: 'Oui, mais d’abord, l’Assemblée nationale et le Sénat doivent voter le même texte.',
          visual: 'point',
          draw: 'Deux hémicycles côte à côte, l’Assemblée nationale et le Sénat\u202f; au-dessus de chacun, la même feuille de texte, et un signe égal au bleu bille.',
          emphasis: ['le même texte'],
        },
        {
          id: 'institutions-constitution-03',
          say: 'Ensuite, deux chemins pour l’approuver. Le premier\u00a0: un référendum, où les électeurs tranchent.',
          visual: 'point',
          draw: 'La feuille de texte au départ d’une fourche\u202f; en haut, une urne au bleu bille\u202f; en bas, un grand hémicycle, encore en gris.',
          emphasis: ['deux chemins', 'un référendum'],
        },
        {
          id: 'institutions-constitution-04',
          say: 'Le second\u00a0: le Parlement réuni en Congrès. C’est possible pour un projet du gouvernement, si le président le décide.',
          visual: 'point',
          draw: 'La même fourche\u202f; cette fois le chemin du bas, vers le grand hémicycle du Congrès, au bleu bille, et le président à côté.',
          emphasis: ['en Congrès', 'si le président le décide'],
        },
        {
          id: 'institutions-constitution-05',
          say: 'Au Congrès, la révision doit réunir les trois cinquièmes des suffrages exprimés. Soit 60\u00a0voix sur 100.',
          spoken: 'Au Congrès, la révision doit réunir les trois cinquièmes des suffrages exprimés. Soit soixante voix sur cent.',
          visual: 'point',
          draw: 'Cent petits carrés en dix rangées\u202f; soixante passent au bleu bille.',
          emphasis: ['trois cinquièmes', '60\u00a0voix sur 100'],
        },
        {
          id: 'institutions-constitution-06',
          say: 'Depuis 1958, la Constitution a été révisée 25\u00a0fois. La dernière fois, le 8\u00a0mars 2024.',
          spoken: 'Depuis mille neuf cent cinquante-huit, la Constitution a été révisée vingt-cinq fois. La dernière fois, le huit mars deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'Vingt-cinq petites feuilles au trait qui passent au bleu bille\u202f; une flèche montre la dernière.',
          emphasis: ['25\u00a0fois', 'le 8\u00a0mars 2024'],
          figure: { ...REVISIONS, sourceIndex: 1 },
        },
        {
          id: 'institutions-constitution-07',
          say: 'Alors, faut-il changer ces règles\u202f? Et si oui, par quel chemin\u202f?',
          visual: 'question',
          draw: 'Le livre de la Constitution devant la fourche des deux chemins, l’urne et l’hémicycle, et un point d’interrogation.',
          emphasis: ['changer ces règles', 'quel chemin'],
        },
      ],
      sources: [CC_ARTICLE_89, CC_REVISIONS],
    },
    {
      id: 'institutions-citoyens',
      kind: 'deep',
      questionIds: ['institutions-2'],
      title: 'Quelle place pour les citoyens\u202f?',
      short: 'Place des citoyens',
      register: 'vous',
      segments: [
        {
          id: 'institutions-citoyens-01',
          say: 'Entre deux élections, pouvez-vous voter directement sur une loi\u202f?',
          visual: 'hook',
          draw: 'Deux urnes au trait aux deux bouts d’une ligne\u202f; entre elles, une feuille de texte et un point d’interrogation.',
          emphasis: ['voter directement'],
        },
        {
          id: 'institutions-citoyens-02',
          say: 'En France, vous décidez surtout en élisant vos représentants. Et aucune procédure ne permet aux seuls électeurs de lancer un référendum national.',
          visual: 'point',
          draw: 'Une personne, une urne, puis l’hémicycle des représentants\u202f; dessous, des électeurs et une flèche en pointillé vers une urne restée en pointillé.',
          emphasis: ['en élisant vos représentants', 'aux seuls électeurs'],
        },
        {
          id: 'institutions-citoyens-03',
          say: 'Sous la Constitution de 1958, il y a eu 9\u00a0référendums nationaux. Le dernier date du 29\u00a0mai 2005.',
          spoken: 'Sous la Constitution de mille neuf cent cinquante-huit, il y a eu neuf référendums nationaux. Le dernier date du vingt-neuf mai deux mille cinq.',
          visual: 'figure',
          draw: 'Neuf petites urnes au trait alignées\u202f; la dernière au bleu bille, avec sa date.',
          emphasis: ['9\u00a0référendums', '29\u00a0mai 2005'],
          figure: { ...REFERENDUMS, sourceIndex: 0 },
        },
        {
          id: 'institutions-citoyens-04',
          say: 'En 2000, sur le quinquennat, 69,81\u00a0% des inscrits se sont abstenus. En 2005, sur le traité constitutionnel européen, 30,63\u00a0%.',
          spoken: 'En deux mille, sur le quinquennat, soixante-neuf virgule quatre-vingt-un pour cent des inscrits se sont abstenus. En deux mille cinq, sur le traité constitutionnel européen, trente virgule soixante-trois pour cent.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, depuis zéro, sur cent inscrits\u00a0: l’abstention de 2000 et celle de 2005.',
          alt: 'Deux barres à la même échelle, de 0 à 100\u00a0% des inscrits\u00a0: Quinquennat (2000) et Traité constitutionnel (2005).',
          emphasis: ['69,81\u00a0%', '30,63\u00a0%'],
          figure: {
            value: '69,81\u00a0%',
            label: 'd’abstention au référendum de 2000 sur le quinquennat, contre 30,63\u00a0% à celui de 2005 sur le traité constitutionnel européen (en\u00a0% des inscrits)',
            date: '2000 et 2005',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Quinquennat (2000)', value: 69.81 },
              { label: 'Traité constitutionnel (2005)', value: 30.63 },
            ],
          },
        },
        {
          id: 'institutions-citoyens-05',
          say: 'Il existe un référendum d’initiative partagée. Il faut d’abord un cinquième des parlementaires, puis le soutien d’un dixième des électeurs inscrits.',
          visual: 'point',
          draw: 'Deux rangs de personnes au trait\u00a0: cinq parlementaires, dont une au bleu bille\u202f; puis dix électeurs, dont un au bleu bille.',
          emphasis: ['initiative partagée', 'un cinquième', 'un dixième'],
        },
        {
          id: 'institutions-citoyens-06',
          say: 'Entre les deux, le Conseil constitutionnel contrôle la proposition de loi. Puis, si le Parlement ne l’examine pas dans le délai prévu, le président la soumet au référendum.',
          visual: 'point',
          draw: 'Trois étapes\u00a0: une loupe sur la feuille de texte\u202f; un sablier devant l’hémicycle\u202f; une urne au bleu bille.',
          emphasis: ['le Conseil constitutionnel', 'dans le délai prévu', 'au référendum'],
        },
        {
          id: 'institutions-citoyens-07',
          say: 'Depuis 2019, 7\u00a0propositions de ce type ont été soumises au Conseil constitutionnel. Pour 6\u00a0d’entre elles, jugées non conformes, la procédure s’est arrêtée.',
          spoken: 'Depuis deux mille dix-neuf, sept propositions de ce type ont été soumises au Conseil constitutionnel. Pour six d’entre elles, jugées non conformes, la procédure s’est arrêtée.',
          visual: 'figure',
          draw: 'Sept feuilles de texte au trait\u202f; six passent en pointillé, une seule reste.',
          emphasis: ['7\u00a0propositions', 'non conformes'],
          figure: {
            value: '7',
            label: 'propositions de référendum d’initiative partagée soumises au Conseil constitutionnel depuis 2019\u00a0: une seule jugée conforme, sur les aéroports de Paris (2019)\u202f; les six autres, d’août 2021 à juin 2026, jugées non conformes, ce qui a arrêté la procédure',
            date: 'état au 3\u00a0octobre 2026',
            sourceIndex: 3,
          },
        },
        {
          id: 'institutions-citoyens-08',
          say: 'Une seule, sur les aéroports de Paris, a pu recueillir des soutiens. En neuf mois\u00a0: 1\u202f093\u202f030, sur 4\u202f717\u202f396 nécessaires. Moins d’un quart.',
          spoken: 'Une seule, sur les aéroports de Paris, a pu recueillir des soutiens. En neuf mois : un million quatre-vingt-treize mille trente, sur quatre millions sept cent dix-sept mille trois cent quatre-vingt-seize nécessaires. Moins d’un quart.',
          visual: 'figure',
          draw: 'Une longue barre au trait, les soutiens nécessaires\u202f; la part recueillie se remplit au bleu bille et s’arrête avant le quart, marqué en pointillé.',
          alt: 'Une barre pour les soutiens nécessaires, la part recueillie remplie\u202f; un repère en pointillé marque le quart.',
          emphasis: ['1\u202f093\u202f030', 'Moins d’un quart'],
          figure: {
            value: '1\u202f093\u202f030',
            label: 'soutiens recueillis en neuf mois pour le seul référendum d’initiative partagée arrivé à la collecte (aéroports de Paris), sur 4\u202f717\u202f396 nécessaires',
            date: '12\u00a0mars 2020 (fin de la collecte)',
            sourceIndex: 4,
          },
          chart: { kind: 'part', value: 1093030, total: 4717396, whole: 'soutiens nécessaires' },
        },
        {
          id: 'institutions-citoyens-09',
          say: 'Au niveau local, un référendum n’est adopté qu’à deux conditions. Au moins la moitié des inscrits a voté, et le projet obtient la majorité des suffrages exprimés.',
          visual: 'point',
          draw: 'Deux conditions côte à côte\u00a0: dix personnes, dont cinq au bleu bille, qui ont voté\u202f; puis deux colonnes de bulletins, pour et contre, la première plus haute.',
          alt: 'Deux colonnes de bulletins, «\u00a0pour\u00a0» et «\u00a0contre\u00a0», la première plus haute.',
          emphasis: ['la moitié des inscrits', 'la majorité'],
        },
        {
          id: 'institutions-citoyens-10',
          say: 'Pour la Convention citoyenne pour le climat, 150\u00a0citoyens ont été tirés au sort. Le 21\u00a0juin 2020, elle a remis 149\u00a0propositions au gouvernement.',
          spoken: 'Pour la Convention citoyenne pour le climat, cent cinquante citoyens ont été tirés au sort. Le vingt et un juin deux mille vingt, elle a remis cent quarante-neuf propositions au gouvernement.',
          visual: 'figure',
          draw: 'Cent cinquante petits ronds au trait qui passent au bleu bille\u202f; une flèche vers une liasse de feuilles, les 149\u00a0propositions.',
          emphasis: ['150\u00a0citoyens', '149\u00a0propositions'],
          figure: {
            value: '150',
            label: 'citoyens tirés au sort pour la Convention citoyenne pour le climat (2019-2020). Elle a formulé 149\u00a0propositions, remises au gouvernement le 21\u00a0juin 2020',
            date: 'juin 2020',
            sourceIndex: 6,
          },
        },
        {
          id: 'institutions-citoyens-11',
          say: 'D’un côté, des décisions prises directement par les citoyens. De l’autre, des décisions prises par les élus.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: une personne et une urne sur un plateau, l’hémicycle des élus et une feuille de texte sur l’autre.',
          emphasis: ['directement par les citoyens', 'par les élus'],
        },
        {
          id: 'institutions-citoyens-12',
          say: 'Alors, quelle place donner aux citoyens dans les décisions publiques\u202f?',
          visual: 'question',
          draw: 'Une personne au trait, une urne et l’hémicycle côte à côte, et un point d’interrogation.',
          emphasis: ['quelle place'],
        },
      ],
      sources: [
        CC_HISTOIRE_REFERENDUM,
        CC_TABLEAU_REFERENDUMS,
        CC_ARTICLE_11,
        CC_DECISIONS_RIP,
        CC_DECISION_ADP,
        CGCT_REFERENDUM_LOCAL,
        CESE_CONVENTION,
      ],
    },
  ],
}
