// Série « Égalité femmes-hommes » (famille « Travail et économie ») : l'introduction, puis quatre
// approfondissements (écart de salaire, congés autour de la naissance, garde des jeunes enfants, transparence des
// salaires). La banque n'a qu'une question sur ce thème (egalite-x1) : elle mêle ces quatre leviers, chacun a sa
// vidéo. Toute la matière vient de sa fiche (research/choisir-2027/explainers.json, egalite-x1). L'écart
// « d'environ 14 % » à temps de travail égal, cité sans date par le contexte de la question dans la banque, n'est
// pas repris : la fiche ne le donne pas, et rien ne dit qu'il vient de l'Insee Focus n° 377 (2024).
// Règles d'écriture : ../GUIDE-SERIES.md ; planches : ../pistes/planches/egalite.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : projet de loi sur la transparence des salaires présenté le 10 septembre 2026, congé supplémentaire de
// naissance ouvert depuis le 1er juillet 2026. À revoir après l'examen du projet de loi.

import type { VideoSeries } from '../types'

/** Les sources de la fiche egalite-x1, typographie française appliquée aux titres */
const INSEE = {
  title: 'Écart de salaire entre femmes et hommes en 2024 (Insee Focus n°\u00a0377)',
  url: 'https://www.insee.fr/fr/statistiques/8743657',
  publisher: 'Insee',
  date: '2026-02-26',
}
const DREES = {
  title: 'La part des enfants de moins de 3\u00a0ans confiés principalement à une assistante maternelle ou une crèche a presque doublé entre 2002 et 2021 (Études et résultats n°\u00a01257)',
  url: 'https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse/etudes-et-resultats/la-part-des-enfants-de-moins-de-3-ans-confies',
  publisher: 'DREES',
  date: '2023-02-14',
}
const MATERNITE = {
  title: 'Congé de maternité d’une salariée du secteur privé',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F2265',
  publisher: 'Service-public.fr (DILA)',
  date: '2026-06-01',
}
const PATERNITE = {
  title: 'Congé de paternité et d’accueil de l’enfant d’un salarié du secteur privé',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F3156',
  publisher: 'Service-public.fr (DILA)',
  date: '2026-06-01',
}
const SUPPLEMENTAIRE = {
  title: 'Congé supplémentaire de naissance d’un salarié du secteur privé',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39685',
  publisher: 'Service-public.fr (DILA)',
  date: '2026-06-03',
}
const PROJET_DE_LOI = {
  title: 'Projet de loi portant sur la transposition de la directive sur l’égalité des rémunérations entre les femmes et les hommes (dossier de presse)',
  url: 'https://www.fonction-publique.gouv.fr/files/files/Espace%20Presse/Amiel/DP_PJL_egalite_remuneration_transparence_salariale.pdf',
  publisher: 'Gouvernement (dossier de presse)',
  date: '2026-09-10',
}

/** Le graphique de la fiche pour le revenu salarial (explainer-charts.json, egalite-x1, index 0) */
const CHART_REVENU = {
  kind: 'compare',
  unit: '€',
  items: [
    { label: 'Femmes', value: 22060 },
    { label: 'Hommes', value: 28220 },
  ],
}

/** Le graphique de la fiche pour la garde des moins de 3 ans (explainer-charts.json, egalite-x1, index 3) */
const CHART_GARDE = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Parents, en 2021', value: 56 },
    { label: 'Parents, si premier choix', value: 36 },
    { label: 'Crèche, en 2021', value: 18 },
    { label: 'Crèche, si premier choix', value: 35 },
  ],
}

const LABEL_REVENU =
  'Écart de revenu salarial annuel moyen entre femmes et hommes dans le secteur privé en 2024 (22\u202f060\u00a0€ contre 28\u202f220\u00a0€), tous temps de travail confondus'
const LABEL_MEME_EMPLOI =
  'Écart de salaire en équivalent temps plein entre femmes et hommes qui occupent le même emploi dans le même établissement (secteur privé, 2024)'
const LABEL_GARDE =
  'Part des enfants de moins de 3\u00a0ans gardés principalement par leurs parents en semaine (France métropolitaine, 2021). Si chaque famille avait obtenu son premier choix, cette part serait de 36\u00a0%\u202f; celle des enfants accueillis surtout en crèche ou dans un autre établissement passerait de 18\u00a0% à 35\u00a0%'

export const EGALITE: VideoSeries = {
  topicId: 'egalite',
  familyId: 'economie',
  label: 'Égalité femmes-hommes',
  videos: [
    {
      id: 'egalite-intro',
      kind: 'intro',
      questionIds: ['egalite-x1'],
      title: 'L’égalité femmes-hommes, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'egalite-intro-01',
          say: 'Dans le secteur privé, sur une année, les femmes gagnent-elles autant que les hommes\u202f?',
          visual: 'hook',
          draw: 'Deux personnages au trait identiques, «\u00a0femmes\u00a0» et «\u00a0hommes\u00a0» écrits dessous, chacun devant une enveloppe de salaire\u202f; un point d’interrogation entre les deux.',
          alt: 'Deux personnages identiques, l’un marqué «\u00a0les femmes\u00a0», l’autre «\u00a0les hommes\u00a0», chacun avec une enveloppe de salaire.',
          emphasis: ['autant que les hommes'],
        },
        {
          id: 'egalite-intro-02',
          say: 'En 2024, le revenu salarial moyen des femmes est 21,8\u00a0% plus bas que celui des hommes.',
          spoken: 'En deux mille vingt-quatre, le revenu salarial moyen des femmes est vingt et un virgule huit pour cent plus bas que celui des hommes.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle, femmes et hommes\u202f; l’écart entre leurs bouts marqué d’une accolade.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: les femmes, puis les hommes\u202f; l’écart entre leurs bouts est marqué.',
          emphasis: ['21,8\u00a0%'],
          figure: { value: '21,8\u00a0%', label: LABEL_REVENU, date: '2024', sourceIndex: 0 },
          chart: CHART_REVENU,
        },
        {
          id: 'egalite-intro-03',
          say: 'Mais pour le même emploi, dans le même établissement, et au même temps de travail, l’écart se réduit à 3,6\u00a0%.',
          spoken: 'Mais pour le même emploi, dans le même établissement, et au même temps de travail, l’écart se réduit à trois virgule six pour cent.',
          visual: 'figure',
          draw: 'Deux écarts posés l’un sous l’autre à la même échelle\u00a0: celui du revenu salarial, puis celui, plus court, à même emploi.',
          alt: 'Deux écarts à la même échelle\u00a0: 21,8\u00a0% pour le revenu salarial, 3,6\u00a0% pour le même emploi.',
          emphasis: ['même emploi', '3,6\u00a0%'],
          figure: { value: '3,6\u00a0%', label: LABEL_MEME_EMPLOI, date: '2024', sourceIndex: 0 },
        },
        {
          id: 'egalite-intro-04',
          say: 'Une grande partie de l’écart tient donc au temps de travail et aux emplois occupés. D’où la question du partage des tâches familiales.',
          visual: 'point',
          draw: 'Un sablier pour le temps de travail, une mallette pour les emplois\u202f; puis une maison où deux personnages se partagent les tâches.',
          emphasis: ['temps de travail', 'emplois occupés', 'tâches familiales'],
        },
        {
          id: 'egalite-intro-05',
          say: 'En France métropolitaine, en 2021, 56\u00a0% des moins de 3\u00a0ans étaient gardés surtout par leurs parents, en semaine.',
          spoken: 'En France métropolitaine, en deux mille vingt et un, cinquante-six pour cent des moins de trois ans étaient gardés surtout par leurs parents, en semaine.',
          visual: 'figure',
          draw: 'Cent petites cases au trait\u202f; cinquante-six se remplissent au bleu bille.',
          emphasis: ['56\u00a0%'],
          figure: { value: '56\u00a0%', label: LABEL_GARDE, date: '2021', sourceIndex: 1 },
          chart: CHART_GARDE,
        },
        {
          id: 'egalite-intro-06',
          say: 'À la naissance d’un premier enfant, dans le privé, le congé de maternité dure 16\u00a0semaines, celui de paternité 25\u00a0jours.',
          spoken: 'À la naissance d’un premier enfant, dans le privé, le congé de maternité dure seize semaines, celui de paternité vingt-cinq jours.',
          visual: 'compare',
          draw: 'Deux barres au trait à la même échelle, graduées par semaine\u00a0: le congé de maternité, puis celui de paternité\u202f; un petit berceau en tête.',
          alt: 'Deux barres à la même échelle, graduées par semaine\u00a0: maternité, 16\u00a0semaines\u202f; paternité, 25\u00a0jours.',
          emphasis: ['16\u00a0semaines', '25\u00a0jours'],
        },
        {
          id: 'egalite-intro-07',
          say: 'Depuis juillet 2026, chaque parent peut aussi, s’il le souhaite, prendre 1 ou 2\u00a0mois de congé supplémentaire de naissance.',
          spoken: 'Depuis juillet deux mille vingt-six, chaque parent peut aussi, s’il le souhaite, prendre un ou deux mois de congé supplémentaire de naissance.',
          visual: 'point',
          draw: 'Deux personnages identiques, chacun au-dessus de deux cases de mois\u00a0: la première au trait, la seconde en pointillé, pour «\u00a01 ou 2\u00a0»\u202f; «\u00a0s’il le souhaite\u00a0» écrit dessous.',
          alt: 'Pour chaque parent, une case de mois au trait et une seconde en pointillé\u00a0: 1 ou 2\u00a0mois, s’il le souhaite.',
          emphasis: ['chaque parent', '1 ou 2\u00a0mois'],
        },
        {
          id: 'egalite-intro-08',
          say: 'Et un projet de loi, présenté le 10\u00a0septembre 2026, prévoit 7\u00a0indicateurs d’écart de salaire, à déclarer dès 50\u00a0salariés.',
          spoken: 'Et un projet de loi, présenté le dix septembre deux mille vingt-six, prévoit sept indicateurs d’écart de salaire, à déclarer dès cinquante salariés.',
          visual: 'point',
          draw: 'Un document au trait marqué «\u00a0projet de loi\u00a0», d’où sortent sept petites jauges alignées.',
          alt: 'Un projet de loi, et sept petites jauges, une par indicateur.',
          emphasis: ['7\u00a0indicateurs', '50\u00a0salariés'],
        },
        {
          id: 'egalite-intro-09',
          say: 'Alors, quatre questions. D’où vient l’écart de salaire\u202f? Comment partager les congés autour d’une naissance\u202f? Qui garde les jeunes enfants\u202f? Et comment mesurer les écarts dans les entreprises\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: un billet, un calendrier, une maison, une loupe.',
          emphasis: ['l’écart de salaire', 'les congés', 'jeunes enfants'],
        },
        {
          id: 'egalite-intro-10',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [INSEE, DREES, MATERNITE, PATERNITE, SUPPLEMENTAIRE, PROJET_DE_LOI],
    },
    {
      id: 'egalite-salaires',
      kind: 'deep',
      questionIds: ['egalite-x1'],
      title: 'D’où vient l’écart de salaire\u202f?',
      short: 'Écart de salaire',
      register: 'vous',
      segments: [
        {
          id: 'egalite-salaires-01',
          say: 'Écart de salaire entre femmes et hommes\u00a0: selon ce que l’on compare, le chiffre change. De quel écart parle-t-on\u202f?',
          visual: 'hook',
          draw: 'Un mètre ruban au trait, et deux traits de longueurs différentes qui se posent à côté, l’un après l’autre\u202f; un point d’interrogation au bout.',
          emphasis: ['le chiffre change', 'De quel écart'],
        },
        {
          id: 'egalite-salaires-02',
          say: 'Premier chiffre, le revenu salarial\u00a0: tout le salaire touché dans l’année. En 2024, dans le privé, 22\u202f060\u00a0euros en moyenne pour les femmes, 28\u202f220 pour les hommes.',
          spoken: 'Premier chiffre, le revenu salarial : tout le salaire touché dans l’année. En deux mille vingt-quatre, dans le privé, vingt-deux mille soixante euros en moyenne pour les femmes, vingt-huit mille deux cent vingt pour les hommes.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle, depuis zéro, femmes et hommes, chacune avec son montant au bout.',
          alt: 'Deux barres à la même échelle, depuis zéro\u00a0: les femmes, puis les hommes.',
          emphasis: ['22\u202f060\u00a0euros', '28\u202f220'],
          figure: {
            value: '22\u202f060\u00a0€ contre 28\u202f220\u00a0€',
            label: 'Revenu salarial annuel moyen des femmes et des hommes dans le secteur privé en 2024, tous temps de travail confondus',
            date: '2024',
            sourceIndex: 0,
          },
          chart: CHART_REVENU,
        },
        {
          id: 'egalite-salaires-03',
          say: 'Soit un écart de 21,8\u00a0%. Ce chiffre compte tous les temps de travail, plein ou partiel, et tous les emplois.',
          spoken: 'Soit un écart de vingt et un virgule huit pour cent. Ce chiffre compte tous les temps de travail, plein ou partiel, et tous les emplois.',
          visual: 'figure',
          draw: 'Les deux barres restent\u202f; une accolade au bleu bille marque l’écart entre leurs bouts.',
          alt: 'Les deux barres du passage précédent, femmes et hommes à la même échelle, l’écart marqué entre leurs bouts.',
          emphasis: ['21,8\u00a0%', 'tous les temps de travail'],
          figure: { value: '21,8\u00a0%', label: LABEL_REVENU, date: '2024', sourceIndex: 0 },
          chart: CHART_REVENU,
        },
        {
          id: 'egalite-salaires-04',
          say: 'Une part de cet écart tient au temps de travail\u00a0: à temps partiel, par exemple, le salaire de l’année est plus bas.',
          visual: 'point',
          draw: 'Un sablier au trait, «\u00a0temps partiel\u00a0» écrit dessous\u202f; une flèche mène à une enveloppe de salaire, une flèche vers le bas à côté.',
          alt: 'Un sablier pour le temps partiel, une flèche vers une enveloppe de salaire, et une flèche vers le bas.',
          emphasis: ['temps de travail', 'temps partiel'],
        },
        {
          id: 'egalite-salaires-05',
          say: 'Une autre part tient aux emplois occupés\u00a0: femmes et hommes n’exercent pas toujours les mêmes.',
          visual: 'point',
          draw: 'Une grille de postes au trait\u202f; deux personnages identiques s’y placent dans des cases différentes.',
          emphasis: ['emplois occupés'],
        },
        {
          id: 'egalite-salaires-06',
          say: 'Pour le même emploi, dans le même établissement, et au même temps de travail, l’écart se réduit à 3,6\u00a0%.',
          spoken: 'Pour le même emploi, dans le même établissement, et au même temps de travail, l’écart se réduit à trois virgule six pour cent.',
          visual: 'figure',
          draw: 'Les deux écarts empilés à la même échelle, du plus large au plus court\u202f; le second au bleu bille.',
          alt: 'Deux écarts à la même échelle\u00a0: 21,8\u00a0% pour le revenu salarial, 3,6\u00a0% pour le même emploi.',
          emphasis: ['3,6\u00a0%'],
          figure: { value: '3,6\u00a0%', label: LABEL_MEME_EMPLOI, date: '2024', sourceIndex: 0 },
        },
        {
          id: 'egalite-salaires-07',
          say: 'D’un côté, le temps de travail et les emplois occupés comptent pour une grande partie de l’écart. De l’autre, pour le même emploi et le même temps de travail, il reste un écart.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: un sablier et une mallette sur un plateau\u202f; sur l’autre, deux barres presque égales, ce qui manque à la plus courte en pointillé.',
          alt: 'Une balance au fléau horizontal\u00a0: d’un côté un sablier et une mallette, de l’autre deux barres presque égales.',
          emphasis: ['temps de travail et les emplois', 'il reste un écart'],
        },
        {
          id: 'egalite-salaires-08',
          say: 'Et le temps de travail renvoie à une autre question\u00a0: le partage des tâches familiales, et la garde des enfants.',
          visual: 'point',
          draw: 'Le sablier au trait\u202f; une flèche le relie à une maison où deux personnages identiques se font face, un berceau entre eux.',
          emphasis: ['tâches familiales', 'garde des enfants'],
        },
        {
          id: 'egalite-salaires-09',
          say: 'Alors, quelle priorité pour l’égalité, au travail et dans la famille\u202f?',
          visual: 'question',
          draw: 'Une mallette et une maison de part et d’autre d’un grand point d’interrogation.',
          emphasis: ['quelle priorité'],
        },
      ],
      sources: [INSEE],
    },
    {
      id: 'egalite-conges',
      kind: 'deep',
      questionIds: ['egalite-x1'],
      title: 'Les congés autour de la naissance',
      short: 'Congés de naissance',
      register: 'vous',
      segments: [
        {
          id: 'egalite-conges-01',
          say: 'Un enfant arrive. Combien de temps chaque parent peut-il s’arrêter de travailler\u202f?',
          visual: 'hook',
          draw: 'Un berceau au trait entre deux personnages identiques\u202f; au-dessus, un calendrier et un point d’interrogation.',
          emphasis: ['chaque parent'],
        },
        {
          id: 'egalite-conges-02',
          say: 'Pour une salariée du privé, le congé de maternité dure 16\u00a0semaines, pour un premier ou un deuxième enfant. Soit 6 avant la naissance, et 10 après.',
          spoken: 'Pour une salariée du privé, le congé de maternité dure seize semaines, pour un premier ou un deuxième enfant. Soit six avant la naissance, et dix après.',
          visual: 'figure',
          draw: 'Une bande de seize cases, une par semaine\u202f; un berceau marque la naissance entre la sixième et la septième.',
          alt: 'Seize cases, une par semaine\u00a0: six avant la naissance, dix après.',
          emphasis: ['16\u00a0semaines', '6 avant', '10 après'],
          figure: {
            value: '16\u00a0semaines',
            label: 'Durée du congé de maternité d’une salariée du secteur privé pour un premier ou un deuxième enfant\u00a0: 6\u00a0semaines avant la naissance, 10 après',
            date: '2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'egalite-conges-03',
          say: 'Au moins 8\u00a0semaines sont obligatoires, dont 6 après l’accouchement.',
          spoken: 'Au moins huit semaines sont obligatoires, dont six après l’accouchement.',
          visual: 'point',
          draw: 'Huit cases au bleu bille\u202f; une accolade réunit les six qui viennent après l’accouchement.',
          alt: 'Huit cases de semaines obligatoires, dont six après l’accouchement.',
          emphasis: ['8\u00a0semaines', '6 après l’accouchement'],
        },
        {
          id: 'egalite-conges-04',
          say: 'Pour l’autre parent, le père ou la personne qui vit en couple avec la mère, le congé de paternité et d’accueil de l’enfant dure 25\u00a0jours.',
          spoken: 'Pour l’autre parent, le père ou la personne qui vit en couple avec la mère, le congé de paternité et d’accueil de l’enfant dure vingt-cinq jours.',
          visual: 'figure',
          draw: 'Une grille de vingt-cinq cases, une par jour, rangées par semaines comme un calendrier.',
          alt: 'Vingt-cinq cases, une par jour.',
          emphasis: ['25\u00a0jours'],
          figure: {
            value: '25\u00a0jours',
            label: 'Durée du congé de paternité et d’accueil de l’enfant, ouvert au père ou à la personne qui vit en couple avec la mère (secteur privé, un enfant)',
            date: '2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'egalite-conges-05',
          say: 'Dont 4\u00a0jours obligatoires, à prendre juste après les 3\u00a0jours ouvrables du congé de naissance.',
          spoken: 'Dont quatre jours obligatoires, à prendre juste après les trois jours ouvrables du congé de naissance.',
          visual: 'point',
          draw: 'Trois cases à part pour le congé de naissance, une flèche, puis la grille des vingt-cinq jours dont les quatre premières cases passent au bleu bille.',
          alt: 'Trois cases pour le congé de naissance, puis les vingt-cinq jours, dont les quatre premiers obligatoires.',
          emphasis: ['4\u00a0jours obligatoires', '3\u00a0jours ouvrables'],
        },
        {
          id: 'egalite-conges-06',
          say: 'Depuis le 1er\u00a0juillet 2026, il existe aussi un congé supplémentaire de naissance. Il vaut pour les enfants nés à partir du 1er\u00a0janvier 2026.',
          spoken: 'Depuis le premier juillet deux mille vingt-six, il existe aussi un congé supplémentaire de naissance. Il vaut pour les enfants nés à partir du premier janvier deux mille vingt-six.',
          visual: 'timeline',
          draw: 'Une frise des douze mois de 2026\u202f; un berceau au 1er\u00a0janvier, un drapeau au 1er\u00a0juillet.',
          alt: 'Sur la frise de l’année 2026\u00a0: les naissances à partir du 1er\u00a0janvier, le congé ouvert à partir du 1er\u00a0juillet.',
          emphasis: ['congé supplémentaire de naissance', '1er\u00a0janvier 2026'],
        },
        {
          id: 'egalite-conges-07',
          say: 'Chaque parent peut, s’il le souhaite, prendre 1 ou 2\u00a0mois. Le premier mois est indemnisé à 70\u00a0% du salaire net, le second à 60\u00a0%.',
          spoken: 'Chaque parent peut, s’il le souhaite, prendre un ou deux mois. Le premier mois est indemnisé à soixante-dix pour cent du salaire net, le second à soixante pour cent.',
          visual: 'figure',
          draw: 'Deux colonnes au trait sous une ligne pointillée du salaire net\u00a0: le premier mois monte à 70, le second à 60.',
          alt: 'Deux colonnes sous la ligne du salaire net, à 100\u00a0: le premier mois à 70\u00a0%, le second à 60\u00a0%.',
          emphasis: ['1 ou 2\u00a0mois', '70\u00a0%', '60\u00a0%'],
          figure: {
            value: '1 ou 2\u00a0mois',
            label: 'Durée du congé supplémentaire de naissance, au choix de chaque parent, pour les enfants nés à partir du 1er\u00a0janvier 2026\u00a0; le premier mois indemnisé à 70\u00a0% du salaire net, le second à 60\u00a0%',
            date: '2026',
            sourceIndex: 2,
          },
        },
        {
          id: 'egalite-conges-08',
          say: 'D’un côté, des congés en partie obligatoires. De l’autre, des congés que chaque parent choisit de prendre, ou non.',
          visual: 'compare',
          draw: 'Une balance au fléau horizontal\u00a0: un document de règle sur un plateau, un personnage sur l’autre.',
          emphasis: ['en partie obligatoires', 'chaque parent choisit'],
        },
        {
          id: 'egalite-conges-09',
          say: 'Alors, comment partager les congés autour d’une naissance, et qui en décide\u202f?',
          visual: 'question',
          draw: 'Le berceau du début entre deux calendriers, et un point d’interrogation.',
          emphasis: ['comment partager', 'qui en décide'],
        },
      ],
      sources: [MATERNITE, PATERNITE, SUPPLEMENTAIRE],
    },
    {
      id: 'egalite-garde',
      kind: 'deep',
      questionIds: ['egalite-x1'],
      title: 'Qui garde les jeunes enfants\u202f?',
      short: 'Garde des enfants',
      register: 'vous',
      segments: [
        {
          id: 'egalite-garde-01',
          say: 'Votre enfant n’a pas encore 3\u00a0ans. Du lundi au vendredi, qui le garde\u202f?',
          spoken: 'Votre enfant n’a pas encore trois ans. Du lundi au vendredi, qui le garde ?',
          visual: 'hook',
          draw: 'Un berceau au trait sous une rangée de cinq cases, du lundi au vendredi, et un point d’interrogation.',
          alt: 'Cinq cases, une par jour, du lundi au vendredi.',
          emphasis: ['qui le garde'],
        },
        {
          id: 'egalite-garde-02',
          say: 'En France métropolitaine, en 2021, 56\u00a0% des moins de 3\u00a0ans étaient gardés surtout par leurs parents, en semaine.',
          spoken: 'En France métropolitaine, en deux mille vingt et un, cinquante-six pour cent des moins de trois ans étaient gardés surtout par leurs parents, en semaine.',
          visual: 'figure',
          draw: 'Cent petites cases au trait\u202f; cinquante-six se remplissent au bleu bille.',
          emphasis: ['56\u00a0%'],
          figure: { value: '56\u00a0%', label: LABEL_GARDE, date: '2021', sourceIndex: 0 },
          chart: CHART_GARDE,
        },
        {
          id: 'egalite-garde-03',
          say: 'Et 18\u00a0% surtout en crèche, ou dans un autre établissement d’accueil.',
          spoken: 'Et dix-huit pour cent surtout en crèche, ou dans un autre établissement d’accueil.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle, depuis zéro\u00a0: les parents, puis la crèche.',
          alt: 'Deux barres à la même échelle\u00a0: 56\u00a0% gardés surtout par leurs parents, 18\u00a0% surtout en crèche ou dans un autre établissement.',
          emphasis: ['18\u00a0%'],
          figure: {
            value: '18\u00a0%',
            label: 'Part des enfants de moins de 3\u00a0ans accueillis principalement en crèche ou dans un autre établissement, en semaine (France métropolitaine, 2021)',
            date: '2021',
            sourceIndex: 0,
          },
        },
        {
          id: 'egalite-garde-04',
          say: 'Mais si chaque famille avait eu son premier choix\u00a0: 36\u00a0% par leurs parents, 35\u00a0% en crèche ou en établissement.',
          spoken: 'Mais si chaque famille avait eu son premier choix : trente-six pour cent par leurs parents, trente-cinq pour cent en crèche ou en établissement.',
          visual: 'compare',
          draw: 'Les deux barres restent\u202f; sous chacune, en pointillé, la barre du premier choix des familles, à la même échelle.',
          alt: 'Quatre barres à la même échelle\u00a0: les parents, 56\u00a0% en 2021 et 36\u00a0% au premier choix\u202f; la crèche ou un autre établissement, 18\u00a0% en 2021 et 35\u00a0% au premier choix.',
          emphasis: ['premier choix', '36\u00a0%', '35\u00a0%'],
          figure: {
            value: '36\u00a0%',
            label: 'Mode de garde principal des moins de 3\u00a0ans en semaine, en 2021 et au premier choix des familles\u00a0: par leurs parents, 56\u00a0% et 36\u00a0%\u202f; en crèche ou dans un autre établissement, 18\u00a0% et 35\u00a0% (France métropolitaine)',
            date: '2021',
            sourceIndex: 0,
          },
          chart: CHART_GARDE,
        },
        {
          id: 'egalite-garde-05',
          say: 'Une grande partie de l’écart de salaire entre femmes et hommes tient au temps de travail et aux emplois occupés. Cela pose aussi la question de la garde des enfants.',
          visual: 'point',
          draw: 'Deux barres de salaire inégales, «\u00a0l’écart de salaire\u00a0»\u202f; un sablier, «\u00a0temps de travail\u00a0», relié à elles par une flèche\u202f; un berceau, «\u00a0garde des enfants\u00a0», relié au sablier.',
          alt: 'Un berceau pour la garde des enfants, une flèche vers un sablier pour le temps de travail, une flèche vers deux barres de salaire inégales.',
          emphasis: ['temps de travail', 'garde des enfants'],
        },
        {
          id: 'egalite-garde-06',
          say: 'Alors, qui garde les jeunes enfants, et qui l’organise\u202f?',
          visual: 'question',
          draw: 'Une maison et un établissement d’accueil de part et d’autre d’un berceau, sous un point d’interrogation.',
          emphasis: ['qui l’organise'],
        },
      ],
      sources: [DREES, INSEE],
    },
    {
      id: 'egalite-transparence',
      kind: 'deep',
      questionIds: ['egalite-x1'],
      title: 'Mesurer les écarts de salaire',
      short: 'Transparence des salaires',
      register: 'vous',
      segments: [
        {
          id: 'egalite-transparence-01',
          say: 'Dans votre entreprise, femmes et hommes sont-ils payés pareil pour le même travail\u202f? Comment le savoir\u202f?',
          visual: 'hook',
          draw: 'Deux personnages identiques, chacun devant une enveloppe fermée\u202f; une loupe s’approche, un point d’interrogation au-dessus.',
          emphasis: ['payés pareil', 'Comment le savoir'],
        },
        {
          id: 'egalite-transparence-02',
          say: 'Prenez une femme et un homme au même emploi, dans le même établissement, au même temps de travail. Selon l’Insee, en 2024, dans le privé, l’écart de salaire est de 3,6\u00a0% en moyenne.',
          spoken: 'Prenez une femme et un homme au même emploi, dans le même établissement, au même temps de travail. Selon l’Insee, en deux mille vingt-quatre, dans le privé, l’écart de salaire est de trois virgule six pour cent en moyenne.',
          visual: 'figure',
          draw: 'Deux barres au trait presque égales, à la même échelle\u202f; l’écart, trop fin pour bien se voir, est montré du doigt.',
          alt: 'Deux barres à la même échelle, une femme et un homme\u00a0: l’écart, trop fin pour bien se voir, est montré du doigt.',
          emphasis: ['3,6\u00a0%'],
          figure: { value: '3,6\u00a0%', label: LABEL_MEME_EMPLOI, date: '2024', sourceIndex: 0 },
        },
        {
          id: 'egalite-transparence-03',
          say: 'Depuis 2019, il existe un index de l’égalité professionnelle. En 2023, l’Union européenne a adopté une directive sur l’égalité des rémunérations entre femmes et hommes.',
          spoken: 'Depuis deux mille dix-neuf, il existe un index de l’égalité professionnelle. En deux mille vingt-trois, l’Union européenne a adopté une directive sur l’égalité des rémunérations entre femmes et hommes.',
          visual: 'timeline',
          draw: 'Une frise des années\u202f; un document au jalon 2019, l’index, puis un second au jalon 2023, la directive.',
          alt: 'Sur une frise de 2019 à 2026\u00a0: l’index en 2019, la directive européenne en 2023.',
          emphasis: ['2019', '2023'],
        },
        {
          id: 'egalite-transparence-04',
          say: 'Pour l’inscrire dans la loi française, un projet de loi a été présenté le 10\u00a0septembre 2026.',
          spoken: 'Pour l’inscrire dans la loi française, un projet de loi a été présenté le dix septembre deux mille vingt-six.',
          visual: 'timeline',
          draw: 'La frise reste\u202f; un troisième document, le projet de loi, se pose au jalon 2026, une flèche le relie à la directive.',
          alt: 'Sur la frise\u00a0: l’index en 2019, la directive en 2023, le projet de loi en 2026.',
          emphasis: ['10\u00a0septembre 2026'],
        },
        {
          id: 'egalite-transparence-05',
          say: 'Il prévoit de remplacer l’index par 7\u00a0indicateurs d’écart de salaire, à déclarer dès 50\u00a0salariés.',
          spoken: 'Il prévoit de remplacer l’index par sept indicateurs d’écart de salaire, à déclarer dès cinquante salariés.',
          visual: 'figure',
          draw: 'Le document de l’index passe en pointillé\u202f; à sa place, sept petites jauges alignées\u202f; dessous, un bâtiment d’entreprise.',
          alt: 'L’index en pointillé, remplacé par sept jauges, une par indicateur\u202f; un bâtiment pour l’entreprise.',
          emphasis: ['7\u00a0indicateurs', '50\u00a0salariés'],
          figure: {
            value: '7\u00a0indicateurs',
            label: 'Indicateurs d’écart de salaire prévus par le projet de loi à la place de l’index de l’égalité professionnelle, à déclarer dès 50\u00a0salariés',
            date: '2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'egalite-transparence-06',
          say: 'Et chaque salarié aurait le droit de connaître la rémunération moyenne des femmes et des hommes de sa catégorie d’emploi.',
          visual: 'point',
          draw: 'Un personnage au trait, une loupe, et une fiche à deux lignes, «\u00a0femmes\u00a0» et «\u00a0hommes\u00a0», sans montant écrit.',
          alt: 'Une fiche à deux lignes, les femmes et les hommes, sans montant.',
          emphasis: ['le droit de connaître', 'catégorie d’emploi'],
        },
        {
          id: 'egalite-transparence-07',
          say: 'Alors, jusqu’où mesurer les écarts de salaire, et qui doit les connaître\u202f?',
          visual: 'question',
          draw: 'La loupe posée sur la rangée de jauges, et un point d’interrogation.',
          emphasis: ['jusqu’où', 'qui doit les connaître'],
        },
      ],
      sources: [INSEE, PROJET_DE_LOI],
    },
  ],
}
