// Série « Territoires et services publics » (famille « Écologie et territoires ») : l'introduction, puis quatre
// approfondissements (accès aux services publics, salaires et effectifs de la fonction publique, pouvoirs et
// moyens des collectivités, vie chère outre-mer). Règles d'écriture : ../GUIDE-SERIES.md ; planches :
// ../pistes/planches/territoires.tsx. Tous les chiffres viennent des fiches du thème (research/choisir-2027 :
// explainers.json, questions territoires-1, -x1, -x2, -x3).
// Ne pas toucher aux identifiants ni aux textes dits sans raison : changer un « say » ou un « spoken », c'est
// devoir réenregistrer la voix du passage.
// Datée : valeur du point d'indice inchangée depuis le 1er juillet 2023 (chiffres du 2e trimestre 2026, DGAFP,
// septembre 2026). À revoir si le point est revalorisé.

import type { VideoSeries } from '../types'

/* Sources, copiées des fiches du thème */

const INSEE_DEMARCHES = {
  title: 'Les difficultés rencontrées lors des démarches administratives – France, portrait social, édition 2025',
  url: 'https://www.insee.fr/fr/statistiques/8612560?sommaire=8612596',
  publisher: 'Insee',
  date: '2025-11-18',
}

const DGAFP_CHIFFRES_CLES = {
  title: 'Chiffres clés de la fonction publique, édition 2025',
  url: 'https://www.fonction-publique.gouv.fr/files/files/publications/rapport-annuel/cc-2025-web.pdf',
  publisher: 'DGAFP',
  date: '2025-10',
}

const OFGL = {
  title: 'Rapport de l’OFGL 2026 – Vue d’ensemble sur l’année 2025',
  url: 'https://www.collectivites-locales.gouv.fr/files/files/Etudes-et-statistiques/OFGL/pre%20rapport%202026/1-%20Vue%20d%27ensemble.pdf',
  publisher: 'Observatoire des finances et de la gestion publique locales (OFGL)',
  date: '2026',
}

const INSEE_PRIX_DOM = {
  title: 'En 2022, les prix restent plus élevés dans les DOM qu’en France métropolitaine, en particulier pour les produits alimentaires – Insee Première n° 1958',
  url: 'https://www.insee.fr/fr/statistiques/7648939',
  publisher: 'Insee',
  date: '2023-07-11',
}

const ANCT_FRANCE_SERVICES = {
  title: 'France services',
  url: 'https://agence-cohesion-territoires.gouv.fr/france-services-36',
  publisher: 'Agence nationale de la cohésion des territoires (ANCT)',
  date: '2026',
}

const COUR_PERINATALITE = {
  title: 'La politique de périnatalité – Rapport public thématique',
  url: 'https://www.ccomptes.fr/sites/default/files/2024-05/20240506-Sante-perinatale.pdf',
  publisher: 'Cour des comptes',
  date: '2024-05',
}

const DGAFP_ITB = {
  title: 'Indice de traitement brut – grille indiciaire (ITB-GI), deuxième trimestre 2026 – Stats Rapides n° 140',
  url: 'https://www.fonction-publique.gouv.fr/files/files/publications/stats-rapides/itb_gi_2026_t2.pdf',
  publisher: 'DGAFP',
  date: '2026-09',
}

const SP_TRAITEMENT = {
  title: 'Traitement indiciaire dans la fonction publique',
  url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F461',
  publisher: 'Service-Public.fr (DILA)',
  date: '2026-06-01',
}

const INSEE_COMPTES = {
  title: 'Comptes de la Nation / comptes publics 2025',
  url: 'https://www.insee.fr/fr/statistiques/8997691',
  publisher: 'Insee',
  date: '2026-08-28',
}

const CONSTITUTION = {
  title: 'Constitution du 4\u00a0octobre 1958, texte intégral en vigueur (articles 72 et 72-2)',
  url: 'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur',
  publisher: 'Conseil constitutionnel',
  date: '2024-03-08',
}

const AUTORITE_MARTINIQUE = {
  title: 'Avis 26-A-01 relatif aux marges des grossistes-importateurs et des distributeurs de produits alimentaires de première nécessité en Martinique',
  url: 'https://www.autoritedelaconcurrence.fr/fr/avis/relatif-aux-marges-des-grossistes-importateurs-et-des-distributeurs-de-produits-alimentaires',
  publisher: 'Autorité de la concurrence',
  date: '2026-02-10',
}

/* Libellés des chiffres, repris des fiches */

const DEMARCHES_LABEL = 'des ménages ayant fait une démarche administrative dans l’année ont rencontré au moins une difficulté (France hors Mayotte)'
const PRIX_DOM_LABEL = 'Écart des prix à la consommation avec la France métropolitaine, de La Réunion à la Guadeloupe. En Guadeloupe, l’écart était de +8,3\u00a0% en 2010'
const INVEST_LABEL = 'Investissement des administrations publiques locales (collectivités et organismes locaux), en hausse de 3,4\u00a0% sur un an'

export const TERRITOIRES: VideoSeries = {
  topicId: 'territoires',
  familyId: 'ecologie',
  label: 'Territoires et services publics',
  videos: [
    {
      id: 'territoires-intro',
      kind: 'intro',
      questionIds: ['territoires-1', 'territoires-x1', 'territoires-x2', 'territoires-x3'],
      title: 'Territoires et services publics, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'territoires-intro-01',
          say: 'Un guichet, une école, une maternité\u00a0: à quelle distance de chez vous\u202f?',
          visual: 'hook',
          draw: 'Une maison au trait au bout d’une route en pointillé qui file vers un guichet, un livre d’école et une croix de soin, chacun nommé quand la voix le dit.',
          emphasis: ['à quelle distance'],
        },
        {
          id: 'territoires-intro-02',
          say: 'En 2023, 23\u00a0% des ménages qui ont fait une démarche administrative ont eu au moins une difficulté. Près d’un sur quatre.',
          spoken: 'En deux mille vingt-trois, vingt-trois pour cent des ménages qui ont fait une démarche administrative ont eu au moins une difficulté. Près d’un sur quatre.',
          visual: 'figure',
          draw: 'Cent petits carrés en dix rangées\u202f; vingt-trois se colorent au bleu bille, et la phrase dite s’écrit à côté.',
          emphasis: ['23\u00a0%', 'Près d’un sur quatre'],
          figure: { value: '23\u00a0%', label: DEMARCHES_LABEL, date: '2023', sourceIndex: 0 },
        },
        {
          id: 'territoires-intro-03',
          say: 'Ces services, ce sont aussi des agents publics\u00a0: 5,80\u00a0millions fin 2023. L’emploi public, c’est un emploi sur cinq.',
          spoken: 'Ces services, ce sont aussi des agents publics : cinq virgule huit millions fin deux mille vingt-trois. L’emploi public, c’est un emploi sur cinq.',
          visual: 'figure',
          draw: 'Cinq mallettes de travail alignées\u202f; l’une se colore au bleu bille, une accolade sous les cinq.',
          emphasis: ['5,80\u00a0millions', 'un emploi sur cinq'],
          figure: {
            value: '5,80\u00a0millions',
            label: 'agents publics au 31\u00a0décembre 2023 (France hors Mayotte), dont 1\u202f358\u202f500 contractuels, soit 23\u00a0%. L’emploi public représente un emploi sur cinq',
            date: '31\u00a0décembre 2023',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-intro-04',
          say: 'Communes, départements et régions gèrent de nombreux services de proximité. Avec les organismes locaux, ils ont investi 70,7\u00a0milliards d’euros en 2025.',
          spoken: 'Communes, départements et régions gèrent de nombreux services de proximité. Avec les organismes locaux, ils ont investi soixante-dix virgule sept milliards d’euros en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Trois bâtiments publics au trait, de même taille, nommés communes, départements, régions\u202f; une grue de chantier se dresse à côté.',
          emphasis: ['70,7\u00a0milliards d’euros'],
          figure: { value: '70,7\u00a0Md€', label: INVEST_LABEL, date: '2025', sourceIndex: 2 },
        },
        {
          id: 'territoires-intro-05',
          say: 'Et dans les départements d’outre-mer, la vie coûte plus cher. En 2022, les prix y dépassent ceux de la France métropolitaine. De 9\u00a0% à La Réunion à 16\u00a0% en Guadeloupe.',
          spoken: 'Et dans les départements d’outre-mer, la vie coûte plus cher. En deux mille vingt-deux, les prix y dépassent ceux de la France métropolitaine. De neuf pour cent à La Réunion à seize pour cent en Guadeloupe.',
          visual: 'figure',
          draw: 'Deux barres au trait, à la même échelle depuis zéro\u00a0: La Réunion, puis la Guadeloupe.',
          emphasis: ['9\u00a0%', '16\u00a0%'],
          figure: { value: '+9\u00a0% à +16\u00a0%', label: PRIX_DOM_LABEL, date: '2022', sourceIndex: 3 },
        },
        {
          id: 'territoires-intro-06',
          say: 'Alors, quatre questions se posent. Comment garantir l’accès aux services publics partout\u202f? Quels salaires et quels effectifs dans la fonction publique\u202f? Quels pouvoirs et quels moyens pour les collectivités\u202f? Comment lutter contre la vie chère outre-mer\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: un guichet, une mallette, un bâtiment public, une étiquette de prix.',
          emphasis: ['quatre questions'],
        },
        {
          id: 'territoires-intro-07',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Le sommaire des quatre vidéos qui suivent, chacune avec son pictogramme.',
        },
      ],
      sources: [INSEE_DEMARCHES, DGAFP_CHIFFRES_CLES, OFGL, INSEE_PRIX_DOM],
    },
    {
      id: 'territoires-services',
      kind: 'deep',
      questionIds: ['territoires-1'],
      title: 'Services publics\u00a0: distance et attente',
      short: 'Services publics',
      register: 'vous',
      segments: [
        {
          id: 'territoires-services-01',
          say: 'Une question d’impôts, d’allocations ou de retraite\u00a0: à quel guichet vous adresser, près de chez vous\u202f?',
          visual: 'hook',
          draw: 'Trois documents au trait, impôts, allocations, retraite, au-dessus d’une petite maison\u202f; une route en pointillé file vers un guichet, un point d’interrogation au milieu.',
          emphasis: ['près de chez vous'],
        },
        {
          id: 'territoires-services-02',
          say: 'Depuis 2019, les espaces France services réunissent 12\u00a0organismes nationaux en un même lieu. Objectif\u00a0: un espace accessible en moins de 20\u00a0minutes.',
          spoken: 'Depuis deux mille dix-neuf, les espaces France services réunissent douze organismes nationaux en un même lieu. Objectif : un espace accessible en moins de vingt minutes.',
          visual: 'point',
          draw: 'Un guichet au trait, et dessous douze petites portes, une par organisme\u202f; à côté, une route d’une maison au guichet, un cadran sur la route.',
          emphasis: ['12\u00a0organismes', 'moins de 20\u00a0minutes'],
        },
        {
          id: 'territoires-services-03',
          say: 'Et les démarches\u202f? En 2023, 23\u00a0% des ménages qui en ont fait une ont rencontré au moins une difficulté.',
          spoken: 'Et les démarches ? En deux mille vingt-trois, vingt-trois pour cent des ménages qui en ont fait une ont rencontré au moins une difficulté.',
          visual: 'figure',
          draw: 'Cent petits carrés en dix rangées\u202f; vingt-trois se colorent au bleu bille.',
          emphasis: ['23\u00a0%'],
          figure: { value: '23\u00a0%', label: DEMARCHES_LABEL, date: '2023', sourceIndex: 1 },
        },
        {
          id: 'territoires-services-04',
          say: 'Lesquelles\u202f? Des délais d’attente trop longs, pour 45,3\u00a0% de ces ménages. Pas d’interlocuteur compétent, pour 22,7\u00a0%. Pas de service près de chez eux, pour 10,3\u00a0%.',
          spoken: 'Lesquelles ? Des délais d’attente trop longs, pour quarante-cinq virgule trois pour cent de ces ménages. Pas d’interlocuteur compétent, pour vingt-deux virgule sept pour cent. Pas de service près de chez eux, pour dix virgule trois pour cent.',
          visual: 'compare',
          draw: 'Trois barres au trait, à la même échelle depuis zéro, chacune nommée quand la voix la dit\u00a0: délais d’attente, interlocuteur, service près de chez soi.',
          emphasis: ['45,3\u00a0%', '22,7\u00a0%', '10,3\u00a0%'],
          figure: {
            value: '10,3\u00a0%',
            label: 'des ménages ayant rencontré une difficulté citent l’absence de service administratif près de chez eux. Ils sont 45,3\u00a0% à citer des délais d’attente trop longs et 22,7\u00a0% l’absence d’un interlocuteur compétent (France hors Mayotte)',
            date: '2023',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-services-05',
          say: 'Depuis 1998, une maternité doit réaliser au moins 300\u00a0accouchements par an, pour la qualité et la sécurité des soins. Une dérogation est possible quand l’éloignement imposerait des trajets excessifs.',
          spoken: 'Depuis mille neuf cent quatre-vingt-dix-huit, une maternité doit réaliser au moins trois cents accouchements par an, pour la qualité et la sécurité des soins. Une dérogation est possible quand l’éloignement imposerait des trajets excessifs.',
          visual: 'point',
          draw: 'Un bâtiment de soins au trait, une croix au-dessus, et un calendrier marqué «\u00a0par an\u00a0»\u202f; puis une route en pointillé qui file au loin, la dérogation.',
          emphasis: ['300\u00a0accouchements', 'Une dérogation'],
        },
        {
          id: 'territoires-services-06',
          say: 'Le nombre de maternités a baissé\u00a0: 721 en 2000, 557 en 2010. Puis 471 en 2021.',
          spoken: 'Le nombre de maternités a baissé : sept cent vingt et un en deux mille, cinq cent cinquante-sept en deux mille dix. Puis quatre cent soixante et onze en deux mille vingt et un.',
          visual: 'timeline',
          draw: 'Trois colonnes au trait depuis zéro, datées 2000, 2010 et 2021, de plus en plus basses.',
          emphasis: ['721', '557', '471'],
          figure: { value: '471', label: 'maternités en France en 2021, contre 721 en 2000 et 557 en 2010', date: '2021', sourceIndex: 2 },
        },
        {
          id: 'territoires-services-07',
          say: 'Selon la Cour des comptes, réduire l’offre allonge les temps de trajet, ce qui inquiète les familles.',
          visual: 'point',
          draw: 'Une maison au trait au bout d’une route\u202f; la maternité, d’abord proche, en pointillé, s’éloigne au bout de la route, et un sablier se pose à côté.',
          emphasis: ['allonge les temps de trajet'],
        },
        {
          id: 'territoires-services-08',
          say: 'Depuis 2022, une femme enceinte qui vit à plus de 45\u00a0minutes d’une maternité peut demander à être hébergée à proximité. Cela vaut pour les cinq derniers jours de sa grossesse.',
          spoken: 'Depuis deux mille vingt-deux, une femme enceinte qui vit à plus de quarante-cinq minutes d’une maternité peut demander à être hébergée à proximité. Cela vaut pour les cinq derniers jours de sa grossesse.',
          visual: 'point',
          draw: 'Une maison au trait, une longue route, la maternité au bout\u202f; un cadran sur la route\u202f; près de la maternité, un petit logement au bleu bille et cinq cases de calendrier.',
          emphasis: ['45\u00a0minutes', 'cinq derniers jours'],
        },
        {
          id: 'territoires-services-09',
          say: 'Pour les maternités, deux exigences se font face\u00a0: la qualité et la sécurité des soins d’un côté, la proximité de l’autre.',
          visual: 'compare',
          draw: 'Une balance au trait, fléau à l’horizontale\u00a0: une croix de soin sur un plateau, une maison et une épingle de lieu sur l’autre.',
          emphasis: ['deux exigences'],
        },
        {
          id: 'territoires-services-10',
          say: 'Alors, comment garantir l’accès aux services publics dans tous les territoires\u202f?',
          visual: 'question',
          draw: 'Des maisons dispersées sur des collines au trait, un guichet et une croix de soin parmi elles\u202f; un point d’interrogation au bout.',
          emphasis: ['dans tous les territoires'],
        },
      ],
      sources: [ANCT_FRANCE_SERVICES, INSEE_DEMARCHES, COUR_PERINATALITE],
    },
    {
      id: 'territoires-agents',
      kind: 'deep',
      questionIds: ['territoires-x1'],
      title: 'Fonction publique\u00a0: salaires et emplois',
      short: 'Fonction publique',
      register: 'vous',
      segments: [
        {
          id: 'territoires-agents-01',
          say: 'La paie de base d\u2019un fonctionnaire suit une grille. Mais qui en fixe le montant, et comment\u202f?',
          visual: 'hook',
          draw: 'Une fiche de paie au trait posée sur une grille de cases\u202f; un point d’interrogation au-dessus.',
          emphasis: ['qui en fixe le montant'],
        },
        {
          id: 'territoires-agents-02',
          say: 'On la calcule en multipliant deux nombres\u00a0: un indice, selon le grade et l’échelon, et la valeur du point, fixée par décret. C’est le traitement\u202f; les primes s’y ajoutent.',
          visual: 'point',
          draw: 'Une multiplication posée à la main\u00a0: une grille où une case est cochée, fois une pièce, égale une enveloppe, le traitement\u202f; une petite enveloppe de primes s’y ajoute.',
          emphasis: ['un indice', 'la valeur du point', 'le traitement'],
        },
        {
          id: 'territoires-agents-03',
          say: 'Dernière hausse du point\u00a0: 1,5\u00a0% le 1er\u00a0juillet 2023. Au 2e\u00a0trimestre 2026, sur un an\u00a0: 0\u00a0% pour le point, 2,1\u00a0% pour les prix hors tabac.',
          spoken: 'Dernière hausse du point : un virgule cinq pour cent le premier juillet deux mille vingt-trois. Au deuxième trimestre deux mille vingt-six, sur un an : zéro pour cent pour le point, deux virgule un pour cent pour les prix hors tabac.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle depuis zéro\u00a0: le point, à plat sur la ligne de zéro, et les prix, qui avancent.',
          emphasis: ['0\u00a0%', '2,1\u00a0%'],
          figure: {
            value: '0\u00a0% contre +2,1\u00a0%',
            label: 'Évolution sur un an de la valeur du point d’indice, comparée à celle des prix à la consommation hors tabac, en moyenne sur le trimestre\u00a0: 2e\u00a0trimestre 2026 comparé au 2e\u00a0trimestre 2025 (France hors Mayotte)',
            date: '2e\u00a0trimestre 2026',
            sourceIndex: 0,
          },
        },
        {
          id: 'territoires-agents-04',
          say: 'À temps complet, le traitement minimum est de 1\u202f801,73\u00a0euros brut par mois. C’est moins que le Smic brut, 1\u202f867,02\u00a0euros\u00a0: une indemnité comble l’écart.',
          spoken: 'À temps complet, le traitement minimum est de mille huit cent un euros et soixante-treize centimes brut par mois. C’est moins que le Smic brut, mille huit cent soixante-sept euros et deux centimes : une indemnité comble l’écart.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle\u00a0: le traitement minimum, un peu plus court, et le Smic brut\u202f; une petite rallonge au bleu bille, l’indemnité, comble l’écart.',
          alt: 'Deux barres à la même échelle, le traitement minimum et le Smic brut\u00a0: l’indemnité qui comble l’écart est au bleu bille.',
          emphasis: ['1\u202f801,73\u00a0euros', '1\u202f867,02\u00a0euros'],
          figure: {
            value: '1\u202f801,73\u00a0€',
            label: 'Traitement minimum brut mensuel pour un temps complet dans la fonction publique, inférieur au Smic brut (1\u202f867,02\u00a0€)\u00a0: une indemnité différentielle comble l’écart',
            date: '2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-agents-05',
          say: 'En 2023, en équivalent temps plein, le salaire net mensuel moyen est de 2\u202f652\u00a0euros dans la fonction publique. Dans le privé, 2\u202f735\u00a0euros. Inflation déduite, les deux ont baissé en un an.',
          spoken: 'En deux mille vingt-trois, en équivalent temps plein, le salaire net mensuel moyen est de deux mille six cent cinquante-deux euros dans la fonction publique. Dans le privé, deux mille sept cent trente-cinq euros. Inflation déduite, les deux ont baissé en un an.',
          visual: 'compare',
          draw: 'Deux barres au trait à la même échelle depuis zéro\u00a0: fonction publique et privé, presque égales\u202f; une petite flèche vers le bas à côté de chacune.',
          alt: 'Deux barres à la même échelle, la fonction publique et le privé, chacune avec une flèche vers le bas\u00a0: −0,7\u00a0% et −0,8\u00a0% en un an, inflation déduite.',
          emphasis: ['2\u202f652\u00a0euros', '2\u202f735\u00a0euros'],
          figure: {
            value: '2\u202f652\u00a0€',
            label: 'Salaire net mensuel moyen dans la fonction publique (en équivalent temps plein), en baisse de 0,7\u00a0% sur un an une fois l’inflation déduite. Dans le secteur privé\u00a0: 2\u202f735\u00a0€, en baisse de 0,8\u00a0% (France hors Mayotte\u202f; pour le privé, hors apprentis, stagiaires, salariés agricoles et salariés des particuliers employeurs)',
            date: '2023',
            sourceIndex: 2,
          },
        },
        {
          id: 'territoires-agents-06',
          say: 'Fin 2023, la fonction publique compte 5,80\u00a0millions d’agents. Parmi eux, 23\u00a0% sont contractuels, et leur nombre a augmenté de 4,9\u00a0% en un an.',
          spoken: 'Fin deux mille vingt-trois, la fonction publique compte cinq virgule huit millions d’agents. Parmi eux, vingt-trois pour cent sont contractuels, et leur nombre a augmenté de quatre virgule neuf pour cent en un an.',
          visual: 'figure',
          draw: 'Cent petits carrés en dix rangées\u202f; vingt-trois se colorent au bleu bille, les contractuels.',
          emphasis: ['5,80\u00a0millions', '23\u00a0%'],
          figure: {
            value: '23\u00a0%',
            label: 'des 5,80\u00a0millions d’agents publics sont contractuels (1\u202f358\u202f500), en hausse de 4,9\u00a0% sur un an. L’emploi public représente un emploi sur cinq (France hors Mayotte)',
            date: '31\u00a0décembre 2023',
            sourceIndex: 2,
          },
        },
        {
          id: 'territoires-agents-07',
          say: 'En 2025, les administrations publiques ont versé 370\u00a0milliards d’euros de rémunérations. C’est un peu plus d’un euro sur cinq de leurs 1\u202f714,2\u00a0milliards de dépenses.',
          spoken: 'En deux mille vingt-cinq, les administrations publiques ont versé trois cent soixante-dix milliards d’euros de rémunérations. C’est un peu plus d’un euro sur cinq de leurs mille sept cent quatorze virgule deux milliards de dépenses.',
          visual: 'figure',
          draw: 'Un grand disque, les dépenses publiques\u202f; un peu plus d’un cinquième se colore au bleu bille, les rémunérations.',
          emphasis: ['370\u00a0milliards d’euros', 'un euro sur cinq'],
          figure: {
            value: '370,0\u00a0Md€',
            label: 'Rémunérations versées par l’ensemble des administrations publiques (État et organismes nationaux, collectivités locales, sécurité sociale), sur 1\u202f714,2\u00a0Md€ de dépenses publiques (France)',
            date: '2025',
            sourceIndex: 3,
          },
        },
        {
          id: 'territoires-agents-08',
          say: 'Le pouvoir d’achat des agents d’un côté, la maîtrise de la dépense publique de l’autre\u00a0: c’est la balance du débat.',
          visual: 'compare',
          draw: 'Une balance au trait, fléau à l’horizontale\u00a0: un porte-monnaie sur un plateau, une pile de pièces sur l’autre.',
          emphasis: ['la balance'],
        },
        {
          id: 'territoires-agents-09',
          say: 'Alors, quels salaires et quels effectifs pour la fonction publique\u202f?',
          visual: 'question',
          draw: 'La grille de paie et une rangée d’agents au trait\u202f; un point d’interrogation au bout.',
          emphasis: ['quels salaires', 'quels effectifs'],
        },
      ],
      sources: [DGAFP_ITB, SP_TRAITEMENT, DGAFP_CHIFFRES_CLES, INSEE_COMPTES],
    },
    {
      id: 'territoires-collectivites',
      kind: 'deep',
      questionIds: ['territoires-x2'],
      title: 'Collectivités locales\u00a0: pouvoirs et moyens',
      short: 'Collectivités',
      register: 'vous',
      segments: [
        {
          id: 'territoires-collectivites-01',
          say: 'Votre commune, votre département, votre région\u00a0: que peuvent-ils décider eux-mêmes, et avec quel argent\u202f?',
          visual: 'hook',
          draw: 'Trois bâtiments publics au trait, de même taille, nommés commune, département, région\u202f; au-dessus, une pièce et un point d’interrogation.',
          emphasis: ['décider eux-mêmes', 'quel argent'],
        },
        {
          id: 'territoires-collectivites-02',
          say: 'La Constitution le dit\u00a0: les collectivités «\u00a0s’administrent librement\u00a0». Si une loi ou un règlement le prévoit, elles peuvent déroger aux règles nationales, à titre expérimental et pour une durée limitée.',
          visual: 'point',
          draw: 'Un document au trait, la Constitution\u202f; à côté, une grande feuille de règles nationales, et une petite feuille qui s’y superpose dans un cadre en pointillé, avec un sablier.',
          emphasis: ['s’administrent librement', 'à titre expérimental'],
        },
        {
          id: 'territoires-collectivites-03',
          say: 'Quand l’État leur transfère une compétence, il leur doit des ressources équivalentes. Et la loi doit prévoir une péréquation\u00a0: une redistribution, pour favoriser l’égalité entre collectivités.',
          visual: 'point',
          draw: 'Une mallette de compétence passe d’un bâtiment à colonnes, l’État, à un bâtiment public local, suivie de pièces\u202f; dessous, une pièce passe d’une collectivité à une autre.',
          emphasis: ['ressources équivalentes', 'une péréquation'],
        },
        {
          id: 'territoires-collectivites-04',
          say: 'Les collectivités portent une large part de l’investissement public. Avec les organismes locaux, 70,7\u00a0milliards d’euros en 2025, 3,4\u00a0% de plus en un an.',
          spoken: 'Les collectivités portent une large part de l’investissement public. Avec les organismes locaux, soixante-dix virgule sept milliards d’euros en deux mille vingt-cinq, trois virgule quatre pour cent de plus en un an.',
          visual: 'figure',
          draw: 'Une grue de chantier au trait à côté d’un bâtiment public\u202f; une pile de pièces, et une petite flèche qui monte.',
          emphasis: ['70,7\u00a0milliards d’euros', '3,4\u00a0%'],
          figure: { value: '70,7\u00a0Md€', label: INVEST_LABEL, date: '2025', sourceIndex: 1 },
        },
        {
          id: 'territoires-collectivites-05',
          say: 'En 2021, les collectivités ont perdu plusieurs impôts locaux. Pour les communes, la taxe d’habitation sur les résidences principales. Pour les départements, la taxe foncière sur le bâti. Pour les régions, la CVAE, un impôt sur les entreprises.',
          spoken: 'En deux mille vingt et un, les collectivités ont perdu plusieurs impôts locaux. Pour les communes, la taxe d’habitation sur les résidences principales. Pour les départements, la taxe foncière sur le bâti. Pour les régions, la C.V.A.E., un impôt sur les entreprises.',
          visual: 'point',
          draw: 'Trois bâtiments publics au trait, communes, départements, régions\u202f; sous chacun, le nom d’un impôt, écrit en gris, qui se raye quand la voix le dit.',
          emphasis: ['taxe d’habitation', 'taxe foncière', 'CVAE'],
        },
        {
          id: 'territoires-collectivites-06',
          say: 'Pour compenser, les collectivités reçoivent notamment une part de la TVA nationale\u00a0: 52,7\u00a0milliards d’euros en 2025. C’est désormais leur première ressource fiscale.',
          spoken: 'Pour compenser, les collectivités reçoivent notamment une part de la T.V.A. nationale : cinquante-deux virgule sept milliards d’euros en deux mille vingt-cinq. C’est désormais leur première ressource fiscale.',
          visual: 'figure',
          draw: 'Une étiquette marquée TVA\u202f; une flèche en part, porte des pièces vers trois bâtiments publics.',
          emphasis: ['52,7\u00a0milliards d’euros', 'première ressource fiscale'],
          figure: {
            value: '52,7\u00a0Md€',
            label: 'Fractions de TVA nationale reversées aux collectivités, stables sur un an (+0,4\u00a0%)\u00a0: c’est désormais leur première ressource fiscale',
            date: '2025',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-collectivites-07',
          say: 'L’État leur verse aussi des dotations et d’autres concours\u00a0: 38,2\u00a0milliards d’euros en 2025. Ces concours pèsent 16,8\u00a0% des recettes des communes, contre 6\u00a0% pour celles des régions.',
          spoken: 'L’État leur verse aussi des dotations et d’autres concours : trente-huit virgule deux milliards d’euros en deux mille vingt-cinq. Ces concours pèsent seize virgule huit pour cent des recettes des communes, contre six pour cent pour celles des régions.',
          visual: 'figure',
          draw: 'Deux barres au trait à la même échelle depuis zéro\u00a0: la part des concours de l’État dans les recettes des communes, puis dans celles des régions.',
          emphasis: ['16,8\u00a0%', '6\u00a0%'],
          figure: {
            value: '38,2\u00a0Md€',
            label: 'Dotations et autres concours financiers de l’État aux collectivités, en hausse de 0,4\u00a0% sur un an. Ils pèsent 16,8\u00a0% des recettes des communes, contre 6\u00a0% pour les régions',
            date: '2025',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-collectivites-08',
          say: 'Le débat porte sur leur autonomie fiscale, le niveau des dotations, leur droit d’adapter les règles nationales, et le partage des compétences avec l’État.',
          visual: 'point',
          draw: 'Quatre curseurs au trait, côte à côte, chacun sous un pictogramme\u00a0: pièces, enveloppe, document, mallette\u202f; aucun n’est poussé.',
        },
        {
          id: 'territoires-collectivites-09',
          say: 'Alors, quels pouvoirs et quels moyens pour les collectivités locales\u202f?',
          visual: 'question',
          draw: 'Les trois bâtiments publics du début, une pièce et un document au-dessus\u202f; un point d’interrogation.',
          emphasis: ['quels pouvoirs', 'quels moyens'],
        },
      ],
      sources: [CONSTITUTION, OFGL],
    },
    {
      id: 'territoires-outre-mer',
      kind: 'deep',
      questionIds: ['territoires-x3'],
      title: 'Le coût de la vie outre-mer',
      short: 'Vie chère outre-mer',
      register: 'vous',
      segments: [
        {
          id: 'territoires-outre-mer-01',
          say: 'En Guadeloupe, en Martinique ou à La Réunion, la vie coûte plus cher que dans l’Hexagone. Pourquoi\u202f?',
          visual: 'hook',
          draw: 'Un panier au trait, une étiquette de prix accrochée\u202f; au loin, un cargo sur la mer\u202f; un point d’interrogation.',
          emphasis: ['Pourquoi'],
        },
        {
          id: 'territoires-outre-mer-02',
          say: 'En 2022, l’écart de prix avec la France métropolitaine va de 9\u00a0% à La Réunion à 16\u00a0% en Guadeloupe. Il y était de 8,3\u00a0% en 2010.',
          spoken: 'En deux mille vingt-deux, l’écart de prix avec la France métropolitaine va de neuf pour cent à La Réunion à seize pour cent en Guadeloupe. Il y était de huit virgule trois pour cent en deux mille dix.',
          visual: 'figure',
          draw: 'Deux barres au trait, à la même échelle depuis zéro\u00a0: La Réunion, puis la Guadeloupe\u202f; sur la barre de la Guadeloupe, un repère en pointillé marque l’écart de 2010.',
          alt: 'Deux barres à la même échelle, La Réunion et la Guadeloupe\u202f; un repère en pointillé marque l’écart de la Guadeloupe en 2010.',
          emphasis: ['9\u00a0%', '16\u00a0%', '8,3\u00a0%'],
          figure: { value: '+9\u00a0% à +16\u00a0%', label: PRIX_DOM_LABEL, date: '2022', sourceIndex: 0 },
        },
        {
          id: 'territoires-outre-mer-03',
          say: 'Plusieurs causes sont avancées\u00a0: l’éloignement et le coût du transport, de petits marchés, l’organisation de la distribution, et la fiscalité locale.',
          visual: 'point',
          draw: 'Quatre pictogrammes en grille, nommés quand la voix les dit\u00a0: un cargo, trois silhouettes, un magasin, un document de taxe.',
          emphasis: ['Plusieurs causes'],
        },
        {
          id: 'territoires-outre-mer-04',
          say: 'En Martinique, transport, logistique, stockage et taxes à l’entrée pèsent 33,3\u00a0% du coût d’achat des marchandises importées par les distributeurs. Un tiers\u00a0: les frais d’approche.',
          spoken: 'En Martinique, transport, logistique, stockage et taxes à l’entrée pèsent trente-trois virgule trois pour cent du coût d’achat des marchandises importées par les distributeurs. Un tiers : les frais d’approche.',
          visual: 'figure',
          draw: 'Un disque au trait, le coût d’achat d’une marchandise importée\u202f; un tiers se colore au bleu bille, les frais d’approche.',
          emphasis: ['33,3\u00a0%', 'Un tiers', 'les frais d’approche'],
          figure: {
            value: '33,3\u00a0%',
            label: 'Part des frais d’approche (transport, logistique, stockage et taxes à l’entrée) dans le coût d’achat des marchandises importées par les distributeurs en Martinique. L’Autorité l’estimait à 28\u00a0% pour l’ensemble des départements et régions d’outre-mer en 2019. Principaux postes\u00a0: logistique et port 12,8\u00a0%, transport maritime 10,9\u00a0%, octroi de mer 9,6\u00a0%',
            date: 'Données jusqu’à 2024',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-outre-mer-05',
          say: 'Parmi ces taxes, l’octroi de mer\u00a0: la collectivité en vote les taux. En Martinique, il a rapporté 346\u00a0millions d’euros en 2022, contre 250 en 2014.',
          spoken: 'Parmi ces taxes, l’octroi de mer : la collectivité en vote les taux. En Martinique, il a rapporté trois cent quarante-six millions d’euros en deux mille vingt-deux, contre deux cent cinquante en deux mille quatorze.',
          visual: 'figure',
          draw: 'Deux colonnes au trait depuis zéro, datées 2014 et 2022\u202f; la seconde plus haute.',
          emphasis: ['l’octroi de mer', '346\u00a0millions d’euros'],
          figure: {
            value: '346\u00a0M€',
            label: 'Octroi de mer perçu en Martinique en 2022, contre 250\u00a0M€ en 2014 (de 637\u00a0€ à 949\u00a0€ par habitant), selon la Cour des comptes',
            date: '2022',
            sourceIndex: 1,
          },
        },
        {
          id: 'territoires-outre-mer-06',
          say: 'Le 16\u00a0octobre 2024, un protocole contre la vie chère est signé en Martinique. L’État supprime la TVA sur 69\u00a0familles de produits, la collectivité baisse l’octroi de mer sur 54.',
          spoken: 'Le seize octobre deux mille vingt-quatre, un protocole contre la vie chère est signé en Martinique. L’État supprime la T.V.A. sur soixante-neuf familles de produits, la collectivité baisse l’octroi de mer sur cinquante-quatre.',
          visual: 'point',
          draw: 'Un document au trait, le protocole\u202f; à côté, deux étiquettes de prix\u00a0: sur l’une, la TVA se raye, sur l’autre, l’octroi de mer descend d’un cran.',
          emphasis: ['69\u00a0familles de produits', 'sur 54'],
        },
        {
          id: 'territoires-outre-mer-07',
          say: 'En contrepartie, sur d’autres produits, la TVA revient au taux normal et l’octroi de mer augmente. Selon l’Autorité de la concurrence, la hausse de l’octroi de mer rapporte bien plus que sa baisse ne coûte.',
          spoken: 'En contrepartie, sur d’autres produits, la T.V.A. revient au taux normal et l’octroi de mer augmente. Selon l’Autorité de la concurrence, la hausse de l’octroi de mer rapporte bien plus que sa baisse ne coûte.',
          visual: 'point',
          draw: 'Sous «\u00a0sur d’autres produits\u00a0», deux étiquettes au trait, chacune avec une flèche qui monte\u00a0: la TVA, l’octroi de mer\u202f; dessous, la phrase de l’Autorité de la concurrence.',
          alt: 'Deux étiquettes, la TVA et l’octroi de mer, chacune avec une flèche qui monte.',
          emphasis: ['taux normal', 'bien plus'],
        },
        {
          id: 'territoires-outre-mer-08',
          say: 'Chez les distributeurs étudiés en Martinique, l’Autorité n’a pas constaté de marges notablement plus élevées que dans l’Hexagone. Elle relève toutefois que les intermédiaires en amont sont plus rentables que les magasins.',
          visual: 'compare',
          draw: 'Une chaîne au trait\u00a0: un cargo, un entrepôt d’importateur, un magasin\u202f; une loupe passe sur le magasin, puis l’entrepôt se colore au bleu bille.',
          emphasis: ['pas constaté', 'plus rentables'],
        },
        {
          id: 'territoires-outre-mer-09',
          say: 'Pour les uns, l’octroi de mer pèse sur le prix des produits importés. Pour d’autres, il finance les collectivités et soutient la production locale.',
          visual: 'compare',
          draw: 'Une balance au trait, fléau à l’horizontale\u00a0: une étiquette de prix sur un plateau, un bâtiment public et un arbre sur l’autre.',
          emphasis: ['pèse sur le prix', 'finance les collectivités'],
        },
        {
          id: 'territoires-outre-mer-10',
          say: 'Alors, comment lutter contre la vie chère dans les outre-mer\u202f?',
          visual: 'question',
          draw: 'Le panier et son étiquette de prix au bord de l’eau, le cargo au loin\u202f; un point d’interrogation au bout.',
          emphasis: ['la vie chère'],
        },
      ],
      sources: [INSEE_PRIX_DOM, AUTORITE_MARTINIQUE],
    },
  ],
}
