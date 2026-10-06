// Série « Industrie et entreprises » (famille « Travail et économie ») : l'introduction, puis cinq
// approfondissements (l'État actionnaire, le prix de l'électricité, le commerce avec le reste du monde, les
// achats publics, les aides publiques aux entreprises). Matière : les fiches des questions industrie_economie-1
// à 3 (research/choisir-2027/explainers.json et explainer-charts.json), rien d'autre. Règles d'écriture :
// ../GUIDE-SERIES.md ; planches : ../pistes/planches/industrie_economie.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison : une fois la voix enregistrée, changer un
// « say » ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : accord UE-Mercosur (application provisoire depuis le 1er mai 2026, ratification suspendue au
// 27 avril 2026) et proposition de la Commission européenne de mars 2026 (en négociation) ; fin du dispositif
// d'accès régulé à l'électricité nucléaire au 31 décembre 2025. À revoir après le vote d'octobre 2026.

import type { VideoSeries } from '../types'

/* ——— Les sources, copiées des fiches ——— */

const BAROMETRE = {
  title: 'Baromètre industriel de l’État\u00a0: en 2025, les extensions d’usines portent la réindustrialisation avec un solde positif malgré un contexte international dégradé',
  url: 'https://www.entreprises.gouv.fr/espace-presse/barometre-industriel-de-letat-en-2025-les-extensions-dusines-portent-la',
  publisher: 'Direction générale des Entreprises (ministère de l’Économie)',
  date: '2026-03-29',
}

const EMPLOI_INDUSTRIE = {
  title: 'Au deuxième trimestre 2026, l’emploi salarié est quasi stable (−0,1\u00a0%) – Informations rapides n°\u00a0214',
  url: 'https://www.insee.fr/fr/statistiques/9039152',
  publisher: 'Insee',
  date: '2026-08-28',
}

const ETAT_ACTIONNAIRE = {
  title: 'Rapport relatif à l’État actionnaire, annexe au projet de loi de finances pour 2026',
  url: 'https://www2.assemblee-nationale.fr/static/17/Annexes-DL/PLF-2026/10-Jaune2026_Etat_actionnaire.pdf',
  publisher: 'Agence des participations de l’État (ministère de l’Économie), publié par l’Assemblée nationale',
  date: '2025',
}

const PRIX_ELECTRICITE = {
  title: 'Prix de l’électricité pour les clients non résidentiels – données semestrielles (nrg_pc_205), France et UE, moins de 20\u00a0MWh, hors TVA, 2e\u00a0semestre 2019 et 2e\u00a0semestre 2025',
  url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_pc_205?lang=fr&geo=FR&geo=EU27_2020&nrg_cons=MWH_LT20&tax=X_VAT&currency=EUR&time=2019-S2&time=2025-S2',
  publisher: 'Eurostat',
  date: '2026-09-24',
}

const VERSEMENT_NUCLEAIRE = {
  title: 'La CRE publie son avis sur le projet de décret relatif aux paramètres de la comptabilité appropriée des revenus nucléaires d’EDF dans le cadre du nouveau dispositif de versement nucléaire universel (lettre d’information de juin 2025)',
  url: 'https://www.cre.fr/actualites/nos-lettres-dinformation/la-cre-publie-son-avis-sur-le-projet-de-decret-relatif-aux-parametres-de-la-comptabilite-appropriee-des-revenus-nucleaires-dedf-dans-le-cadre-du-nouveau-dispositif-de-versement-nucleaire-universel.html',
  publisher: 'Commission de régulation de l’énergie (CRE)',
  date: '2025-06',
}

const AIDES_SENAT = {
  title: 'L’essentiel sur le rapport de la commission d’enquête sur l’utilisation des aides publiques aux grandes entreprises et à leurs sous-traitants (rapport n°\u00a0808, 2024-2025)',
  url: 'https://www.senat.fr/rap/r24-808-1/r24-808-1-syn.pdf',
  publisher: 'Sénat',
  date: '2025-07',
}

const COMMERCE_EXTERIEUR = {
  title: 'Le chiffre du commerce extérieur – Analyse annuelle 2025',
  url: 'https://www.douane.gouv.fr/sites/default/files/2026-02/09/chiffre-comex-Analyse-Annuelle-2025.pdf',
  publisher: 'Direction générale des douanes et droits indirects',
  date: '2026-02-06',
}

const EMPLOIS_EXPORT = {
  title: 'Trade and Jobs: France',
  url: 'https://policy.trade.ec.europa.eu/analysis-and-assessment/statistics/trade-and-jobs/france_en',
  publisher: 'Commission européenne (DG Commerce et sécurité économique)',
}

const VOITURES_CHINE = {
  title: 'EU Commission imposes countervailing duties on imports of battery electric vehicles (BEVs) from China',
  url: 'https://trade.ec.europa.eu/access-to-markets/en/news/eu-commission-imposes-countervailing-duties-imports-battery-electric-vehicles-bevs-china',
  publisher: 'Commission européenne (Access2Markets)',
  date: '2024-12-12',
}

const MERCOSUR = {
  title: 'Accord commercial UE - Mercosur\u00a0: distinguer le vrai du faux',
  url: 'https://france.representation.ec.europa.eu/informations/accord-commercial-ue-mercosur-distinguer-le-vrai-du-faux-2026-04-27_fr',
  publisher: 'Représentation de la Commission européenne en France',
  date: '2026-04-27',
}

const COMMANDE_PUBLIQUE = {
  title: 'Rapport n°\u00a0830 (2024-2025) de la commission d’enquête sur la commande publique\u00a0: «\u00a0L’urgence d’agir pour éviter la sortie de route\u00a0: piloter la commande publique au service de la souveraineté économique\u00a0»',
  url: 'https://www.senat.fr/rap/r24-830-1/r24-830-1_mono.html',
  publisher: 'Sénat',
  date: '2025-07-08',
}

const ACCELERATEUR = {
  title: 'Commission proposes Industrial Accelerator Act to strengthen industry and create jobs in Europe',
  url: 'https://employment-social-affairs.ec.europa.eu/news/commission-proposes-industrial-accelerator-act-strengthen-industry-and-create-jobs-europe-2026-03-04_en',
  publisher: 'Commission européenne',
  date: '2026-03-04',
}

const ALLEGEMENTS = {
  title: 'Maîtriser la dynamique des allègements généraux de cotisations sociales (Sécurité sociale 2025, chapitre III)',
  url: 'https://www.ccomptes.fr/sites/default/files/2025-05/20250526-RALFSS-2025-Maitriser-dynamique-allegements-generaux-de-cotisations-sociales.pdf',
  publisher: 'Cour des comptes',
  date: '2025-05',
}

const COMPTES_PUBLICS = {
  title: 'Le compte des administrations publiques en 2025 – Insee Première n°\u00a02106',
  url: 'https://www.insee.fr/fr/statistiques/8997691',
  publisher: 'Insee',
  date: '2026-05-29',
}

/* ——— Les chiffres des fiches qui reviennent d'une vidéo à l'autre ——— */

const SOLDE_COMMERCIAL = {
  value: '−69,2\u00a0Md€',
  label: 'Solde commercial des biens de la France en 2025, en amélioration de 10,0\u00a0Md€ sur un an (exportations\u00a0: 614,7\u00a0Md€)',
  date: '2025',
}

const PRIX_KWH = {
  value: '0,2688\u00a0€/kWh',
  label: 'Prix moyen de l’électricité pour les entreprises françaises consommant moins de 20\u00a0MWh par an, hors TVA et taxes récupérables, au 2e\u00a0semestre 2025 (0,1704\u00a0€/kWh au 2e\u00a0semestre 2019). Moyenne de l’UE\u00a0: 0,298\u00a0€/kWh (0,2077\u00a0€/kWh en 2019)',
  date: '2e\u00a0semestre 2025',
}

/** Le graphique de la fiche industrie_economie-1, chiffre n° 3 (explainer-charts.json), tel quel */
const PRIX_KWH_CHART = {
  kind: 'compare',
  unit: '€/kWh',
  items: [
    { label: 'France, 2e sem. 2019', value: 0.1704 },
    { label: 'Moyenne de l’UE, 2e sem. 2019', value: 0.2077 },
    { label: 'France, 2e sem. 2025', value: 0.2688 },
    { label: 'Moyenne de l’UE, 2e sem. 2025', value: 0.298 },
  ],
}

export const INDUSTRIE_ECONOMIE: VideoSeries = {
  topicId: 'industrie_economie',
  familyId: 'economie',
  label: 'Industrie et entreprises',
  videos: [
    {
      id: 'industrie-intro',
      kind: 'intro',
      questionIds: ['industrie_economie-1', 'industrie_economie-2', 'industrie_economie-3'],
      title: 'Industrie et entreprises, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'industrie-intro-01',
          say: 'Une usine ouvre ici, une autre ferme là. Au bout du compte, la France en gagne-t-elle, ou en perd-elle\u202f?',
          visual: 'hook',
          draw: 'Deux petites usines au trait sur une même ligne de sol\u00a0: l’une se dessine, l’autre s’efface en pointillé\u202f; dessous, la question.',
          emphasis: ['ouvre ici', 'ferme là'],
        },
        {
          id: 'industrie-intro-02',
          say: 'En 2025, elle a ouvert ou agrandi plus d’usines qu’elle n’en a fermé ou réduit\u00a0: un solde de plus\u00a019. En 2024, il était de plus\u00a088.',
          spoken: 'En deux mille vingt-cinq, elle a ouvert ou agrandi plus d’usines qu’elle n’en a fermé ou réduit : un solde de plus dix-neuf. En deux mille vingt-quatre, il était de plus quatre-vingt-huit.',
          visual: 'figure',
          draw: 'Deux colonnes au trait à la même échelle, 2024 et 2025\u00a0: le solde d’usines, plus 88 puis plus 19.',
          alt: 'Deux colonnes à la même échelle, datées 2024 et 2025.',
          emphasis: ['plus\u00a019', 'plus\u00a088'],
          figure: {
            value: '+19',
            label: 'Solde des ouvertures et extensions significatives d’usines, moins les fermetures et réductions importantes, en France en 2025 (contre +88 en 2024). Dernier baromètre publié',
            date: '2025',
            sourceIndex: 0,
          },
          chart: {
            kind: 'series',
            items: [
              { label: '2024', value: 88 },
              { label: '2025', value: 19 },
            ],
          },
        },
        {
          id: 'industrie-intro-03',
          say: 'Fin juin 2026, l’industrie emploie 3\u202f240\u202f600\u00a0salariés, hors intérim. C’est 0,5\u00a0% de moins sur un an, et 1,7\u00a0% de plus que fin 2019.',
          spoken: 'Fin juin deux mille vingt-six, l’industrie emploie trois millions deux cent quarante mille six cents salariés, hors intérim. C’est zéro virgule cinq pour cent de moins sur un an, et un virgule sept pour cent de plus que fin deux mille dix-neuf.',
          visual: 'figure',
          draw: 'Une ligne du zéro\u202f; deux barres à la même échelle, l’une vers la gauche (moins 0,5\u00a0% en un an), l’autre vers la droite (plus 1,7\u00a0% depuis fin 2019).',
          alt: 'Deux écarts à la même échelle, de part et d’autre de zéro\u00a0: sur un an, et depuis fin 2019.',
          emphasis: ['3\u202f240\u202f600\u00a0salariés', '0,5\u00a0%', '1,7\u00a0%'],
          figure: {
            value: '3\u202f240\u202f600',
            label: 'Emplois salariés dans l’industrie (hors intérim) fin juin 2026, France hors Mayotte\u00a0: −0,5\u00a0% sur un an, +1,7\u00a0% par rapport à fin 2019. Dont 2\u202f816\u202f200 dans l’industrie manufacturière',
            date: '2e\u00a0trimestre 2026',
            sourceIndex: 1,
          },
          chart: {
            kind: 'compare',
            unit: '%',
            items: [
              { label: 'Sur un an', value: -0.5 },
              { label: 'Par rapport à fin 2019', value: 1.7 },
            ],
          },
        },
        {
          id: 'industrie-intro-04',
          say: 'Côté échanges, la France importe plus de biens qu’elle n’en exporte. En 2025, son déficit commercial est de 69,2\u00a0milliards d’euros.',
          spoken: 'Côté échanges, la France importe plus de biens qu’elle n’en exporte. En deux mille vingt-cinq, son déficit commercial est de soixante-neuf virgule deux milliards d’euros.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, exportations et importations\u202f; celle des importations un peu plus longue, l’écart marqué d’une accolade.',
          alt: 'Deux barres à la même échelle, les exportations et les importations de biens\u00a0; l’écart est marqué d’une accolade.',
          emphasis: ['importe plus', '69,2\u00a0milliards'],
          figure: { ...SOLDE_COMMERCIAL, sourceIndex: 2 },
        },
        {
          id: 'industrie-intro-05',
          say: 'Pour soutenir les entreprises, il existe des subventions, des crédits d’impôt, des baisses de cotisations. En mai 2025, un site de référence recensait 2\u202f267\u00a0aides publiques.',
          spoken: 'Pour soutenir les entreprises, il existe des subventions, des crédits d’impôt, des baisses de cotisations. En mai deux mille vingt-cinq, un site de référence recensait deux mille deux cent soixante-sept aides publiques.',
          visual: 'figure',
          draw: 'Trois pictogrammes au trait, chacun quand la voix le nomme\u00a0: des pièces, un document, une flèche qui descend.',
          emphasis: ['2\u202f267\u00a0aides publiques'],
          figure: {
            value: '2\u202f267',
            label: 'Nombre d’aides publiques aux entreprises recensées en mai 2025 par le site de référence aides-entreprises.fr (État, sécurité sociale, collectivités, Union européenne…)',
            date: 'mai 2025',
            sourceIndex: 3,
          },
        },
        {
          id: 'industrie-intro-06',
          say: 'Certaines décisions se prennent à l’échelle de l’Union européenne\u00a0: les accords commerciaux, et les règles sur les aides publiques aux entreprises.',
          visual: 'point',
          draw: 'Un bâtiment à colonnes au trait, d’où partent deux documents\u00a0: un accord commercial, des règles sur les aides.',
          emphasis: ['l’Union européenne'],
        },
        {
          id: 'industrie-intro-07',
          say: 'Alors, trois questions se posent. Quelle stratégie pour réindustrialiser le pays\u202f? Comment protéger la production face à la concurrence internationale\u202f? Et que faire des aides publiques aux entreprises\u202f?',
          visual: 'question',
          draw: 'Trois pictogrammes en liste, dessinés l’un après l’autre\u00a0: une grue, une carte de France, des pièces.',
          emphasis: ['réindustrialiser', 'protéger la production', 'aides publiques'],
        },
        {
          id: 'industrie-intro-08',
          say: 'Dans les vidéos suivantes, on regarde chacun de ces sujets de plus près.',
          visual: 'outro',
          draw: 'Le sommaire de la série\u00a0: cinq pictogrammes en file, comme les chapitres d’un carnet.',
          emphasis: ['de plus près'],
        },
      ],
      sources: [BAROMETRE, EMPLOI_INDUSTRIE, COMMERCE_EXTERIEUR, AIDES_SENAT, MERCOSUR],
    },
    {
      id: 'industrie-etat',
      kind: 'deep',
      questionIds: ['industrie_economie-1'],
      title: 'L’État actionnaire',
      short: 'État actionnaire',
      register: 'vous',
      segments: [
        {
          id: 'industrie-etat-01',
          say: 'Certaines entreprises ont un actionnaire particulier\u00a0: l’État. Que détient-il, et que peut-il en faire\u202f?',
          visual: 'hook',
          draw: 'Un bâtiment à colonnes au trait, l’État, et un immeuble de bureaux, reliés par un trait en pointillé\u202f; un point d’interrogation au-dessus.',
          emphasis: ['actionnaire particulier', 'l’État'],
        },
        {
          id: 'industrie-etat-02',
          say: 'Au 30\u00a0juin 2025, l’Agence des participations de l’État gérait ses parts dans 86\u00a0entités. Leur valeur était estimée à 209,1\u00a0milliards d’euros.',
          spoken: 'Au trente juin deux mille vingt-cinq, l’Agence des participations de l’État gérait ses parts dans quatre-vingt-six entités. Leur valeur était estimée à deux cent neuf virgule un milliards d’euros.',
          visual: 'figure',
          draw: 'Une grille de 86 petites cases, une par entité, qui se remplit rangée après rangée\u202f; le montant écrit au-dessus.',
          emphasis: ['86\u00a0entités', '209,1\u00a0milliards'],
          figure: {
            value: '209,1\u00a0Md€',
            label: 'Valeur des participations de l’État gérées par l’Agence des participations de l’État au 30\u00a0juin 2025 (86\u00a0entités), dont 67,9\u00a0Md€ dans des sociétés cotées',
            date: '30\u00a0juin 2025',
            sourceIndex: 0,
          },
          chart: {
            kind: 'compare',
            unit: 'Md€',
            items: [
              { label: 'Participations de l’État', value: 209.1 },
              { label: 'Dont sociétés cotées', value: 67.9 },
            ],
          },
        },
        {
          id: 'industrie-etat-03',
          say: 'Les sociétés cotées en Bourse en représentent 67,9\u00a0milliards. Un an plus tôt, l’ensemble valait 179,5\u00a0milliards.',
          spoken: 'Les sociétés cotées en Bourse en représentent soixante-sept virgule neuf milliards. Un an plus tôt, l’ensemble valait cent soixante-dix-neuf virgule cinq milliards.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle, un an plus tôt et au 30\u00a0juin 2025\u202f; dans la seconde, la part des sociétés cotées comptée au bleu bille.',
          alt: 'Deux barres à la même échelle, en milliards d’euros\u00a0: 179,5 un an plus tôt, 209,1 au 30\u00a0juin 2025, dont la part des sociétés cotées.',
          emphasis: ['67,9\u00a0milliards', '179,5\u00a0milliards'],
        },
        {
          id: 'industrie-etat-04',
          say: 'Mais toute aide publique à une entreprise doit respecter les règles européennes. Les aides qui faussent la concurrence sont en principe interdites. Avec des exceptions, comme les «\u00a0projets importants d’intérêt européen commun\u00a0».',
          visual: 'point',
          draw: 'Des pièces partent vers une entreprise et butent contre une barrière, un document de règles posé à côté\u202f; un chemin en pointillé contourne la barrière pour quelques projets.',
          emphasis: ['règles européennes', 'en principe interdites', 'des exceptions'],
        },
        {
          id: 'industrie-etat-05',
          say: 'Quand l’État prend une part dans une entreprise, cela peut compter comme une aide. C’est le cas s’il n’agit pas comme un investisseur privé qui recherche une rentabilité à long terme.',
          visual: 'point',
          draw: 'L’État et un investisseur privé, côte à côte devant une même entreprise\u202f; au-dessus, une courbe de rentabilité qui monte sur la durée.',
          emphasis: ['investisseur privé', 'rentabilité à long terme'],
        },
        {
          id: 'industrie-etat-06',
          say: 'Alors, quelle place pour l’État dans le capital des entreprises\u202f?',
          visual: 'question',
          draw: 'Le bâtiment à colonnes et l’immeuble de bureaux, reliés par un trait en pointillé qui s’arrête sur un point d’interrogation.',
          emphasis: ['quelle place'],
        },
      ],
      sources: [ETAT_ACTIONNAIRE, AIDES_SENAT],
    },
    {
      id: 'industrie-energie',
      kind: 'deep',
      questionIds: ['industrie_economie-1'],
      title: 'Le prix de l’électricité des entreprises',
      short: 'Électricité',
      register: 'vous',
      segments: [
        {
          id: 'industrie-energie-01',
          say: 'Un atelier, un commerce, un bureau\u00a0: chaque entreprise paie son électricité. Combien, en France\u202f?',
          visual: 'hook',
          draw: 'Un compteur électrique au trait, relié par un fil à des pièces de monnaie\u202f; un point d’interrogation.',
          emphasis: ['Combien, en France'],
        },
        {
          id: 'industrie-energie-02',
          say: 'Prenons les entreprises qui consomment moins de 20\u00a0mégawattheures par an. Au second semestre 2025, elles payaient en moyenne 26,88\u00a0centimes le kilowattheure, hors TVA et taxes récupérables.',
          spoken: 'Prenons les entreprises qui consomment moins de vingt mégawattheures par an. Au second semestre deux mille vingt-cinq, elles payaient en moyenne vingt-six virgule quatre-vingt-huit centimes le kilowattheure, hors T.V.A. et taxes récupérables.',
          visual: 'figure',
          draw: 'Un compteur au trait d’où sort un kilowattheure qui se change en pièces\u202f; le prix en centimes écrit dessous.',
          alt: 'Un compteur, et le prix d’un kilowattheure en pièces.',
          emphasis: ['26,88\u00a0centimes'],
          figure: { ...PRIX_KWH, sourceIndex: 0 },
          chart: PRIX_KWH_CHART,
        },
        {
          id: 'industrie-energie-03',
          say: 'En 2019, au même semestre, c’était 17,04\u00a0centimes. Dans l’Union européenne, la moyenne est passée de 20,77 à 29,8\u00a0centimes.',
          spoken: 'En deux mille dix-neuf, au même semestre, c’était dix-sept virgule zéro quatre centimes. Dans l’Union européenne, la moyenne est passée de vingt virgule soixante-dix-sept à vingt-neuf virgule huit centimes.',
          visual: 'compare',
          draw: 'Quatre colonnes au trait à la même échelle, deux pour 2019 et deux pour 2025\u00a0: la France et la moyenne de l’Union européenne.',
          alt: 'Quatre colonnes à la même échelle, en centimes le kilowattheure\u00a0: la France (26,88 en 2025) et la moyenne de l’Union européenne, en 2019 et en 2025.',
          emphasis: ['17,04\u00a0centimes', '20,77', '29,8\u00a0centimes'],
          figure: { ...PRIX_KWH, sourceIndex: 0 },
          chart: PRIX_KWH_CHART,
        },
        {
          id: 'industrie-energie-04',
          say: 'Un dispositif donnait aux fournisseurs un accès régulé à une partie de l’électricité nucléaire d’EDF, jusqu’au 31\u00a0décembre 2025. Depuis, ils achètent sur le marché, ou produisent avec leurs propres centrales.',
          spoken: 'Un dispositif donnait aux fournisseurs un accès régulé à une partie de l’électricité nucléaire d’E.D.F., jusqu’au trente et un décembre deux mille vingt-cinq. Depuis, ils achètent sur le marché, ou produisent avec leurs propres centrales.',
          visual: 'timeline',
          draw: 'Une ligne du temps\u00a0: un trait plein jusqu’à un drapeau planté au 31\u00a0décembre 2025, puis deux chemins\u00a0: le marché, et des centrales.',
          emphasis: ['accès régulé', '31\u00a0décembre 2025', 'sur le marché'],
        },
        {
          id: 'industrie-energie-05',
          say: 'Et un «\u00a0versement nucléaire universel\u00a0» réduit les factures si les revenus nucléaires d’EDF dépassent des seuils fixés par le gouvernement.',
          spoken: 'Et un « versement nucléaire universel » réduit les factures si les revenus nucléaires d’E.D.F. dépassent des seuils fixés par le gouvernement.',
          visual: 'point',
          draw: 'Une jauge de revenus avec un seuil en pointillé\u202f; ce qui dépasse le seuil revient, par une flèche, vers une facture qui diminue.',
          alt: 'Une colonne des revenus nucléaires, un seuil en pointillé, et une facture.',
          emphasis: ['versement nucléaire universel', 'des seuils'],
        },
        {
          id: 'industrie-energie-06',
          say: 'Alors, quelle place pour le prix de l’énergie dans une stratégie industrielle\u202f?',
          visual: 'question',
          draw: 'Le compteur du début, une flèche en pointillé vers une usine\u202f; un point d’interrogation.',
          emphasis: ['prix de l’énergie'],
        },
      ],
      sources: [PRIX_ELECTRICITE, VERSEMENT_NUCLEAIRE],
    },
    {
      id: 'industrie-commerce',
      kind: 'deep',
      questionIds: ['industrie_economie-2'],
      title: 'Le commerce avec le reste du monde',
      short: 'Commerce',
      register: 'vous',
      segments: [
        {
          id: 'industrie-commerce-01',
          say: 'Votre téléphone, vos vêtements, votre voiture\u00a0: où ont-ils été fabriqués\u202f?',
          visual: 'hook',
          draw: 'Trois objets au trait, un téléphone, un vêtement, une voiture, chacun quand la voix le nomme\u202f; au-dessus, la question.',
          emphasis: ['où ont-ils été fabriqués'],
        },
        {
          id: 'industrie-commerce-02',
          say: 'En 2025, la France a exporté pour 614,7\u00a0milliards d’euros de biens, et importé davantage. Son déficit commercial\u00a0: 69,2\u00a0milliards, 10 de moins qu’en 2024.',
          spoken: 'En deux mille vingt-cinq, la France a exporté pour six cent quatorze virgule sept milliards d’euros de biens, et importé davantage. Son déficit commercial : soixante-neuf virgule deux milliards, dix de moins qu’en deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, exportations et importations\u202f; l’écart au bout marqué d’une accolade.',
          alt: 'Deux barres à la même échelle, les exportations et les importations de biens\u00a0; l’écart est marqué d’une accolade.',
          emphasis: ['614,7\u00a0milliards', '69,2\u00a0milliards'],
          figure: { ...SOLDE_COMMERCIAL, sourceIndex: 0 },
        },
        {
          id: 'industrie-commerce-03',
          say: 'En 2024, selon la Commission européenne, 13,5\u00a0% des emplois en France dépendaient des exportations hors de l’Union. Plus de 13 sur 100.',
          spoken: 'En deux mille vingt-quatre, selon la Commission européenne, treize virgule cinq pour cent des emplois en France dépendaient des exportations hors de l’Union. Plus de treize sur cent.',
          visual: 'figure',
          draw: 'Cent petites cases\u202f; treize se remplissent au bleu bille, une quatorzième en plus clair.',
          emphasis: ['13,5\u00a0%', 'Plus de 13 sur 100'],
          figure: {
            value: '13,5\u00a0%',
            label: 'Part des emplois en France qui dépendent des exportations vers des pays hors UE, selon la Commission européenne (exportations de 2024)\u00a0: 3,46\u00a0millions d’emplois liés aux exportations françaises et 671\u202f000 à celles d’autres pays de l’UE',
            date: '2024',
            sourceIndex: 1,
          },
          chart: { kind: 'part', value: 13.5, total: 100, unit: '%', whole: 'des emplois en France' },
        },
        {
          id: 'industrie-commerce-04',
          say: 'La politique commerciale relève surtout de l’Union européenne. Depuis le 30\u00a0octobre 2024, l’Union applique des droits anti-subventions aux voitures électriques neuves importées de Chine. De 7,8 à 35,3\u00a0%, selon le constructeur.',
          spoken: 'La politique commerciale relève surtout de l’Union européenne. Depuis le trente octobre deux mille vingt-quatre, l’Union applique des droits anti-subventions aux voitures électriques neuves importées de Chine. De sept virgule huit à trente-cinq virgule trois pour cent, selon le constructeur.',
          visual: 'figure',
          draw: 'Une voiture au trait devant une barrière de douane\u202f; à côté, une réglette de 0 à 40\u00a0% où une bande au bleu bille va de 7,8 à 35,3.',
          alt: 'Une réglette graduée de 0 à 40\u00a0%\u00a0: la bande des taux, de 7,8 à 35,3\u00a0%.',
          emphasis: ['droits anti-subventions', '7,8 à 35,3\u00a0%'],
          figure: {
            value: 'de 7,8\u00a0% à 35,3\u00a0%',
            label: 'Droits compensateurs (anti-subventions) imposés par l’UE pour cinq ans, applicables depuis le 30\u00a0octobre 2024, sur les voitures électriques neuves importées de Chine\u202f; le taux dépend du constructeur',
            date: 'depuis le 30\u00a0octobre 2024',
            sourceIndex: 2,
          },
        },
        {
          id: 'industrie-commerce-05',
          say: 'L’Union négocie aussi les accords commerciaux. Celui avec le Mercosur, Argentine, Brésil, Paraguay et Uruguay, s’applique à titre provisoire depuis le 1er\u00a0mai 2026.',
          spoken: 'L’Union négocie aussi les accords commerciaux. Celui avec le Mercosur, Argentine, Brésil, Paraguay et Uruguay, s’applique à titre provisoire depuis le premier mai deux mille vingt-six.',
          visual: 'timeline',
          draw: 'Un accord au trait entre deux bâtiments à colonnes\u202f; sur une ligne du temps, un drapeau au 1er\u00a0mai 2026.',
          alt: 'Une ligne du temps de janvier à juin 2026.',
          emphasis: ['Mercosur', 'à titre provisoire'],
        },
        {
          id: 'industrie-commerce-06',
          say: 'Le 21\u00a0janvier 2026, le Parlement européen a saisi la Cour de justice de l’Union sur sa conformité aux traités. Au 27\u00a0avril 2026, sa ratification restait suspendue.',
          spoken: 'Le vingt et un janvier deux mille vingt-six, le Parlement européen a saisi la Cour de justice de l’Union sur sa conformité aux traités. Au vingt-sept avril deux mille vingt-six, sa ratification restait suspendue.',
          visual: 'timeline',
          draw: 'La même ligne du temps\u00a0: un second drapeau au 21\u00a0janvier, sous un bâtiment à colonnes\u202f; au 27\u00a0avril, un signe «\u00a0pause\u00a0» sur l’accord.',
          alt: 'Une ligne du temps de janvier à juin 2026, avec le 1er\u00a0mai 2026\u00a0; un signe «\u00a0pause\u00a0» sur l’accord.',
          emphasis: ['Cour de justice', 'suspendue'],
        },
        {
          id: 'industrie-commerce-07',
          say: 'D’un côté, la France importe plus de biens qu’elle n’en exporte. De l’autre, une partie de ses emplois dépend des exportations.',
          visual: 'compare',
          draw: 'Une balance à deux plateaux de même taille, fléau à l’horizontale\u00a0: deux conteneurs empilés d’un côté, une personne et un conteneur de l’autre.',
          emphasis: ['importe plus', 'dépend des exportations'],
        },
        {
          id: 'industrie-commerce-08',
          say: 'Alors, comment protéger la production face à la concurrence internationale\u202f?',
          visual: 'question',
          draw: 'Une usine au trait et un conteneur, reliés par une flèche en pointillé\u202f; un point d’interrogation.',
          emphasis: ['protéger la production'],
        },
      ],
      sources: [COMMERCE_EXTERIEUR, EMPLOIS_EXPORT, VOITURES_CHINE, MERCOSUR],
    },
    {
      id: 'industrie-achats',
      kind: 'deep',
      questionIds: ['industrie_economie-2'],
      title: 'Les achats publics',
      short: 'Achats publics',
      register: 'vous',
      segments: [
        {
          id: 'industrie-achats-01',
          say: 'Une cantine, un hôpital, une route\u00a0: les acheteurs publics passent des marchés. Peuvent-ils les réserver aux entreprises françaises\u202f?',
          visual: 'hook',
          draw: 'Trois pictogrammes au trait, chacun quand la voix le nomme\u00a0: une assiette, une croix de soin, une route\u202f; dessous, la question.',
          emphasis: ['les réserver', 'entreprises françaises'],
        },
        {
          id: 'industrie-achats-02',
          say: 'En 2023, les marchés publics d’au moins 90\u202f000\u00a0euros hors taxes ont représenté 170,7\u00a0milliards d’euros. C’est 6\u00a0% du PIB, la richesse produite en un an.',
          spoken: 'En deux mille vingt-trois, les marchés publics d’au moins quatre-vingt-dix mille euros hors taxes ont représenté cent soixante-dix virgule sept milliards d’euros. C’est six pour cent du P.I.B., la richesse produite en un an.',
          visual: 'figure',
          draw: 'Un grand disque qui figure la richesse produite en un an\u202f; une part de 6\u00a0% se remplit au bleu bille.',
          alt: 'Un disque, le PIB, dont une part est comptée.',
          emphasis: ['170,7\u00a0milliards', '6\u00a0%'],
          figure: {
            value: '170,7\u00a0Md€',
            label: 'Montant des marchés publics recensés en France en 2023 (contrats d’au moins 90\u202f000\u00a0€ HT seulement), soit 6\u00a0% du PIB. Tous contrats confondus, la Cour des comptes européenne estime la commande publique à près de 400\u00a0Md€ pour la France',
            date: '2023',
            sourceIndex: 0,
          },
        },
        {
          id: 'industrie-achats-03',
          say: 'Tous contrats compris, la Cour des comptes européenne estime la commande publique à près de 400\u00a0milliards d’euros pour la France.',
          spoken: 'Tous contrats compris, la Cour des comptes européenne estime la commande publique à près de quatre cents milliards d’euros pour la France.',
          visual: 'compare',
          draw: 'Deux barres à la même échelle\u00a0: les marchés d’au moins 90\u202f000\u00a0euros, et tous les contrats, plus de deux fois plus longue.',
          alt: 'Deux barres à la même échelle, en milliards d’euros\u00a0: 170,7 pour les marchés d’au moins 90\u202f000\u00a0euros, près de 400 pour tous les contrats.',
          emphasis: ['près de 400\u00a0milliards'],
        },
        {
          id: 'industrie-achats-04',
          say: 'Mais le droit européen interdit de réserver un marché public aux entreprises françaises ou locales.',
          visual: 'point',
          draw: 'Un document de marché\u202f; une épingle sur une carte de France tente de s’en approcher et bute contre une barrière.',
          emphasis: ['interdit de réserver'],
        },
        {
          id: 'industrie-achats-05',
          say: 'En revanche, les acheteurs publics peuvent écarter les entreprises de pays sans accord avec l’Union sur les marchés publics, comme la Chine et l’Inde. Et fixer des exigences environnementales et sociales.',
          visual: 'point',
          draw: 'Un document de marché\u202f; une flèche en pointillé écarte un autre dossier, en pointillé\u202f; dessous, un arbre et une personne, les deux exigences.',
          alt: 'Deux exigences, un arbre et une personne.',
          emphasis: ['sans accord avec l’Union', 'exigences environnementales et sociales'],
        },
        {
          id: 'industrie-achats-06',
          say: 'En mars 2026, la Commission européenne a fait une proposition. Dans certains achats et aides publics, elle exigerait des produits «\u00a0fabriqués dans l’UE\u00a0» ou bas carbone.',
          spoken: 'En mars deux mille vingt-six, la Commission européenne a fait une proposition. Dans certains achats et aides publics, elle exigerait des produits « fabriqués dans l’U.E. » ou bas carbone.',
          visual: 'point',
          draw: 'Un projet de texte au trait, sorti d’un bâtiment à colonnes\u202f; une étiquette accrochée à un produit.',
          emphasis: ['fabriqués dans l’UE', 'bas carbone'],
        },
        {
          id: 'industrie-achats-07',
          say: 'Sont visés l’acier, le ciment, l’aluminium, les voitures, et des technologies propres. Le texte doit être négocié par le Parlement européen et le Conseil de l’Union avant d’entrer en vigueur.',
          visual: 'point',
          draw: 'Le projet de texte entre deux bâtiments à colonnes, le Parlement européen et le Conseil de l’Union, reliés par des flèches.',
          emphasis: ['doit être négocié'],
        },
        {
          id: 'industrie-achats-08',
          say: 'Alors, quelle place donner à l’origine des produits dans les achats publics\u202f?',
          visual: 'question',
          draw: 'Une étiquette d’origine vierge accrochée au document de marché\u202f; un point d’interrogation.',
          emphasis: ['l’origine des produits'],
        },
      ],
      sources: [COMMANDE_PUBLIQUE, ACCELERATEUR],
    },
    {
      id: 'industrie-aides',
      kind: 'deep',
      questionIds: ['industrie_economie-3'],
      title: 'Les aides publiques aux entreprises',
      short: 'Aides publiques',
      register: 'vous',
      segments: [
        {
          id: 'industrie-aides-01',
          say: 'Subventions, crédits d’impôt, baisses de cotisations\u00a0: l’argent public aide les entreprises. Combien, au total\u202f?',
          visual: 'hook',
          draw: 'Trois formes d’aide au trait, des pièces, un document, une flèche qui descend, qui convergent vers une entreprise\u202f; un point d’interrogation.',
          emphasis: ['Combien, au total'],
        },
        {
          id: 'industrie-aides-02',
          say: 'Tout dépend de ce que l’on compte. En mai 2025, le ministre de l’Économie estimait ces aides à 150\u00a0milliards d’euros, dont 80 d’allègements de cotisations sociales.',
          spoken: 'Tout dépend de ce que l’on compte. En mai deux mille vingt-cinq, le ministre de l’Économie estimait ces aides à cent cinquante milliards d’euros, dont quatre-vingts d’allègements de cotisations sociales.',
          visual: 'point',
          draw: 'Une barre de 150 au trait\u202f; les 80 des allègements de cotisations s’y comptent au bleu bille.',
          alt: 'Une barre, 150\u00a0milliards d’euros, dont une part de 80 comptée\u00a0: les allègements de cotisations sociales.',
          emphasis: ['Tout dépend', '150\u00a0milliards'],
        },
        {
          id: 'industrie-aides-03',
          say: 'La commission d’enquête du Sénat retient un champ plus large, qui inclut notamment les aides de la banque publique d’investissement. Elle arrive à 211\u00a0milliards pour 2023, et 108 au sens strict.',
          spoken: 'La commission d’enquête du Sénat retient un champ plus large, qui inclut notamment les aides de la banque publique d’investissement. Elle arrive à deux cent onze milliards pour deux mille vingt-trois, et cent huit au sens strict.',
          visual: 'compare',
          draw: 'Trois barres à la même échelle, du plus petit au plus grand\u00a0: 108 au sens strict, 150 selon le ministre, 211 selon la commission.',
          alt: 'Trois barres à la même échelle, en milliards d’euros\u00a0: 108 au sens strict, 150 selon le ministre de l’Économie, 211 selon la commission d’enquête.',
          emphasis: ['211\u00a0milliards', '108 au sens strict'],
          figure: {
            value: '108\u00a0Md€',
            label: 'Aides publiques aux entreprises en 2023 selon la commission d’enquête du Sénat, au sens strict\u00a0: sans les interventions de Bpifrance, les avantages fiscaux sur la TVA et ceux que l’État ne compte plus officiellement comme «\u00a0dépenses fiscales\u00a0»',
            date: '2023',
            sourceIndex: 0,
          },
        },
        {
          id: 'industrie-aides-04',
          say: 'Les allègements généraux de cotisations patronales du privé représentent 77,3\u00a0milliards d’euros en 2024, contre 20,9 en 2014. La hausse vient en partie d’un crédit d’impôt, devenu baisse de cotisations en 2019.',
          spoken: 'Les allègements généraux de cotisations patronales du privé représentent soixante-dix-sept virgule trois milliards d’euros en deux mille vingt-quatre, contre vingt virgule neuf en deux mille quatorze. La hausse vient en partie d’un crédit d’impôt, devenu baisse de cotisations en deux mille dix-neuf.',
          visual: 'figure',
          draw: 'Deux colonnes à la même échelle, 2014 et 2024\u202f; entre elles, un repère en pointillé à 2019.',
          alt: 'Deux colonnes à la même échelle, datées 2014 et 2024, et un repère à 2019.',
          emphasis: ['77,3\u00a0milliards', '20,9', 'en partie'],
          figure: {
            value: '77,3\u00a0Md€',
            label: 'Allègements généraux de cotisations patronales du secteur privé en 2024, contre 20,9\u00a0Md€ en 2014. La hausse tient en partie à la transformation, en 2019, d’un crédit d’impôt (le CICE) en baisse de cotisations',
            date: '2024',
            sourceIndex: 1,
          },
          chart: {
            kind: 'series',
            unit: 'Md€',
            items: [
              { label: '2014', value: 20.9 },
              { label: '2024', value: 77.3 },
            ],
          },
        },
        {
          id: 'industrie-aides-05',
          say: 'Leur effet sur l’emploi\u202f? Selon les évaluations citées par la Cour des comptes, il est positif au niveau du Smic. Les études récentes sont plus incertaines.',
          spoken: 'Leur effet sur l’emploi ? Selon les évaluations citées par la Cour des comptes, il est positif au niveau du Smic. Les études récentes sont plus incertaines.',
          visual: 'point',
          draw: 'Deux colonnes de même taille\u00a0: sous «\u00a0les évaluations\u00a0», une mallette et une flèche qui monte\u202f; sous «\u00a0les études récentes\u00a0», une mallette et un point d’interrogation.',
          alt: 'Deux colonnes de même taille\u00a0: les évaluations, et les études récentes.',
          emphasis: ['positif au niveau du Smic', 'plus incertaines'],
        },
        {
          id: 'industrie-aides-06',
          say: 'Une simulation, pour un rapport d’économistes de 2024, chiffre à un million les emplois détruits si ces allègements étaient tous supprimés. Pour les salaires intermédiaires, la baisse des cotisations familiales a des effets sur l’emploi «\u00a0jugés marginaux\u00a0».',
          spoken: 'Une simulation, pour un rapport d’économistes de deux mille vingt-quatre, chiffre à un million les emplois détruits si ces allègements étaient tous supprimés. Pour les salaires intermédiaires, la baisse des cotisations familiales a des effets sur l’emploi « jugés marginaux ».',
          visual: 'compare',
          draw: 'Deux cadres de même taille côte à côte\u00a0: à gauche, six personnes en pointillé et «\u00a0un million\u00a0»\u202f; à droite, une mallette et un trait à plat, «\u00a0jugés marginaux\u00a0».',
          alt: 'Deux cadres de même taille\u00a0: tous les allègements supprimés, et les salaires intermédiaires.',
          emphasis: ['un million', 'jugés marginaux'],
        },
        {
          id: 'industrie-aides-07',
          say: 'Certaines aides ont des contreparties, selon les cas\u00a0: ne pas délocaliser, ne pas verser de dividendes, maintenir l’emploi pendant le projet et cinq ans après.',
          visual: 'point',
          draw: 'Trois pictogrammes en liste, chacun quand la voix le nomme\u00a0: une épingle, un cadenas, une mallette.',
          emphasis: ['contreparties'],
        },
        {
          id: 'industrie-aides-08',
          say: 'Le débat porte aussi sur leur coût. En 2025, le déficit public est de 152,5\u00a0milliards d’euros. C’est 5,1\u00a0% du PIB, après 5,8\u00a0% en 2024.',
          spoken: 'Le débat porte aussi sur leur coût. En deux mille vingt-cinq, le déficit public est de cent cinquante-deux virgule cinq milliards d’euros. C’est cinq virgule un pour cent du P.I.B., après cinq virgule huit pour cent en deux mille vingt-quatre.',
          visual: 'figure',
          draw: 'Deux colonnes à la même échelle, 2024 et 2025\u00a0: le déficit public en part du PIB.',
          alt: 'Deux colonnes à la même échelle, en part du PIB, datées 2024 et 2025.',
          emphasis: ['152,5\u00a0milliards', '5,1\u00a0%'],
          figure: {
            value: '152,5\u00a0Md€',
            label: 'Déficit public de la France en 2025, soit 5,1\u00a0% du PIB (après 5,8\u00a0% en 2024)',
            date: '2025',
            sourceIndex: 2,
          },
          chart: {
            kind: 'series',
            unit: '% du PIB',
            items: [
              { label: '2024', value: 5.8 },
              { label: '2025', value: 5.1 },
            ],
          },
        },
        {
          id: 'industrie-aides-09',
          say: 'Alors, combien d’aides, pour quelles entreprises, et avec quelles contreparties\u202f?',
          visual: 'question',
          draw: 'Des pièces, une flèche en pointillé vers une mallette\u202f; un point d’interrogation.',
          emphasis: ['combien d’aides', 'quelles entreprises', 'quelles contreparties'],
        },
      ],
      sources: [AIDES_SENAT, ALLEGEMENTS, COMPTES_PUBLICS],
    },
  ],
}
