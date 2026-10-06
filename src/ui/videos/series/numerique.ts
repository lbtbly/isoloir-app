// Série « Numérique » (famille « École, culture, numérique ») : l'introduction, puis quatre approfondissements
// (intelligence artificielle, enfants et écrans, grandes plateformes, information et médias). La question
// numerique-3 mêle deux leviers (le droit européen des plateformes ; l'information, la presse et la création) :
// elle est scindée en deux vidéos. Les conclusions préliminaires de la Commission sur TikTok (fiche numerique-2) sont
// présentées dans la vidéo des grandes plateformes, avec les autres suites données au règlement sur les services
// numériques. Matière : les fiches numerique-1 à 3 (research/choisir-2027/explainers.json,
// explainer-charts.json, et le « context » de bank.json), rien d'autre. Règles d'écriture : ../GUIDE-SERIES.md ;
// planches : ../pistes/planches/numerique.tsx.
// Ne pas toucher aux identifiants ni aux textes dits sans raison une fois la voix enregistrée : changer un
// « say » ou un « spoken », c'est devoir réenregistrer la voix du passage.
// Datée : calendrier du règlement européen sur l'IA (révision entrée en vigueur le 27 juillet 2026) ; décision
// du Conseil constitutionnel du 14 août 2026 ; conclusions préliminaires de la Commission sur TikTok
// (6 février 2026) ; amendes au titre du règlement sur les services numériques arrêtées au 31 août 2026 ;
// mesures conservatoires de l'Autorité de la concurrence contre Meta (8 juillet 2026), décision au fond
// attendue. À revoir après le vote d'octobre 2026, ou dès qu'un de ces faits change.

import type { VideoSeries } from '../types'

/* ——— Sources (copiées des fiches) ——— */

const EUROSTAT_PERSONNES = {
  title: 'Use of artificial intelligence by individuals (Statistics Explained)',
  url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_by_individuals',
  publisher: 'Eurostat',
  date: '2026-04-15',
}
const EUROSTAT_ENTREPRISES = {
  title: 'Use of artificial intelligence in enterprises (Statistics Explained)',
  url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises',
  publisher: 'Eurostat',
  date: '2026-06-02',
}
const OIT = {
  title: 'Generative AI and jobs: A refined global index of occupational exposure (ILO Working Paper 140)',
  url: 'https://www.ilo.org/publications/generative-ai-and-jobs-refined-global-index-occupational-exposure',
  publisher: 'Organisation internationale du travail (OIT)',
  date: '2025-05-20',
}
const EUROSTAT_PROTECTION = {
  title: 'Recettes de protection sociale par type (spr_rec_sumt)',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/spr_rec_sumt/default/table?lang=fr',
  publisher: 'Eurostat',
  date: '2026-10-01',
}
const REGLEMENT_IA = {
  title: 'Législation sur l’IA\u00a0: cadre réglementaire et calendrier d’application',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/regulatory-framework-ai',
  publisher: 'Commission européenne',
  date: '2026-08-03',
}
const CONVENTION_IA = {
  title: 'Commission signs Council of Europe framework Convention on Artificial Intelligence',
  url: 'https://digital-strategy.ec.europa.eu/en/news/commission-signs-council-europe-framework-convention-artificial-intelligence',
  publisher: 'Commission européenne',
  date: '2024-09-05',
}
const INVESTAI = {
  title: 'L’UE lance l’initiative InvestAI, destinée à mobiliser 200\u00a0milliards d’euros d’investissements dans l’intelligence artificielle (IP/25/467)',
  url: 'https://ec.europa.eu/commission/presscorner/detail/fr/ip_25_467',
  publisher: 'Commission européenne',
  date: '2025-02-11',
}
const ENABEE = {
  title: 'Temps d’écran des enfants de 3 à 11\u00a0ans\u00a0: un usage précoce, quotidien et marqué par les inégalités sociales (étude Enabee)',
  url: 'https://www.santepubliquefrance.fr/presse/temps-decran-des-enfants-de-3-a-11-ans-un-usage-precoce-quotidien-et-marque-par-les',
  publisher: 'Santé publique France',
  date: '2025-09-25',
}
const OMS = {
  title: 'Teens, screens and mental health',
  url: 'https://www.who.int/europe/news/item/25-09-2024-teens--screens-and-mental-health',
  publisher: 'Organisation mondiale de la santé, bureau régional pour l’Europe',
  date: '2024-09-25',
}
const ANSES = {
  title: 'Sécuriser les usages des réseaux sociaux pour protéger la santé des adolescents',
  url: 'https://www.anses.fr/fr/actualite/securiser-usages-reseaux-sociaux-proteger-sante-adolescents',
  publisher: 'Anses (Agence nationale de sécurité sanitaire)',
  date: '2026-01-13',
}
const CC_2026 = {
  title: 'Décision n°\u00a02026-911 DC du 14\u00a0août 2026 – Loi visant à protéger les mineurs des risques auxquels les expose l’utilisation des réseaux sociaux',
  url: 'https://www.conseil-constitutionnel.fr/decision/2026/2026911DC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2026-08-14',
}
const TIKTOK = {
  title: 'Commission preliminarily finds TikTok’s addictive design in breach of the Digital Services Act',
  url: 'https://digital-strategy.ec.europa.eu/en/news/commission-preliminarily-finds-tiktoks-addictive-design-breach-digital-services-act',
  publisher: 'Commission européenne',
  date: '2026-02-06',
}
const DSA_SEUIL = {
  title: 'DSA\u00a0: très grandes plateformes en ligne et moteurs de recherche',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/dsa-vlops',
  publisher: 'Commission européenne',
  date: '2026-05-19',
}
const DSA_SUPERVISION = {
  title: 'Supervision des très grandes plateformes en ligne et moteurs de recherche désignés au titre du règlement sur les services numériques',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/list-designated-vlops-and-vloses',
  publisher: 'Commission européenne',
  date: '2026-08-31',
}
const DSA_AMENDES = {
  title: 'Le cadre d’application de la législation sur les services numériques',
  url: 'https://digital-strategy.ec.europa.eu/fr/policies/dsa-enforcement',
  publisher: 'Commission européenne',
  date: '2026-07-02',
}
const CC_2018 = {
  title: 'Décision n°\u00a02018-773 DC du 20\u00a0décembre 2018 – Loi relative à la lutte contre la manipulation de l’information',
  url: 'https://www.conseil-constitutionnel.fr/decision/2018/2018773DC.htm',
  publisher: 'Conseil constitutionnel',
  date: '2018-12-20',
}
const DROITS_VOISINS = {
  title: 'Droits voisins\u00a0: l’Autorité de la concurrence prononce des mesures conservatoires et enjoint Meta de négocier de bonne foi avec les éditeurs et agences de presse',
  url: 'https://www.autoritedelaconcurrence.fr/fr/communiques-de-presse/droits-voisins-lautorite-de-la-concurrence-prononce-des-mesures',
  publisher: 'Autorité de la concurrence',
  date: '2026-07-08',
}
const SMAD = {
  title: 'Le régulateur intègre les principaux SMAD internationaux au système français de financement de la création',
  url: 'https://www.arcom.fr/presse/le-regulateur-integre-les-principaux-smad-internationaux-au-systeme-francais-de-financement-de-la-creation',
  publisher: 'Arcom (alors CSA)',
  date: '2021-12-09',
}
const LOI_1986 = {
  title: 'Loi n°\u00a086-1067 du 30\u00a0septembre 1986 relative à la liberté de communication – article\u00a039',
  url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000044260461',
  publisher: 'Légifrance',
  date: '2021-10-27',
}

/* ——— Graphiques des fiches (explainer-charts.json), tels quels ——— */

/** numerique-1, chiffre n° 0 */
const CHART_ENTREPRISES = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'France, 2024', value: 9.91 },
    { label: 'France, 2025', value: 18.16 },
    { label: 'Union européenne, 2025', value: 19.95 },
  ],
}
/** numerique-1, chiffre n° 1 */
const CHART_PERSONNES = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'France', value: 37.5 },
    { label: 'Union européenne', value: 32.7 },
  ],
}
/** numerique-1, chiffre n° 2 */
const CHART_OIT = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Pays à revenu élevé', value: 34 },
    { label: 'Pays à faible revenu', value: 11 },
  ],
}
/** numerique-1, chiffre n° 3 */
const CHART_PROTECTION = {
  kind: 'compare',
  unit: '%',
  items: [
    { label: 'Cotisations sociales', value: 55.11 },
    { label: 'Contributions publiques', value: 42.9 },
  ],
}
/** numerique-2, chiffre n° 0 */
const CHART_RESEAUX = { kind: 'part', value: 25, total: 100, unit: '%', whole: 'des enfants de 9 à 11 ans' }
/** numerique-2, chiffre n° 2 */
const CHART_PARENTS = { kind: 'part', value: 9, total: 10, whole: 'parents d’enfants de 3 à 11 ans' }

/* ——— Libellés des chiffres (fiches) ——— */

const LABEL_PERSONNES =
  'Part des personnes de 16 à 74\u00a0ans ayant utilisé un outil d’IA générative au cours des trois derniers mois, France (Union européenne\u00a0: 32,7\u00a0%)'
const LABEL_RESEAUX =
  'Part des enfants de 9 à 11\u00a0ans ayant accès aux réseaux sociaux, alors que l’âge minimal d’inscription est de 13\u00a0ans en France (30\u00a0% des filles\u202f; moins de 2\u00a0% des 3-5\u00a0ans). Enfants scolarisés en France hexagonale'
const LABEL_SEUIL =
  'Utilisateurs mensuels dans l’UE au-delà desquels une plateforme ou un moteur de recherche est classé «\u00a0très grand\u00a0» (et soumis aux règles les plus strictes du règlement européen sur les services numériques)'
const DATE_ENABEE = '2022 (publié le 25\u00a0septembre 2025)'
const DATE_SEUIL = 'Règle en vigueur (page mise à jour le 19\u00a0mai 2026)'

export const NUMERIQUE: VideoSeries = {
  topicId: 'numerique',
  familyId: 'savoirs',
  label: 'Numérique',
  videos: [
    {
      id: 'numerique-intro',
      kind: 'intro',
      questionIds: ['numerique-1', 'numerique-2', 'numerique-3'],
      title: 'Le numérique, l’essentiel',
      short: 'Introduction',
      register: 'vous',
      segments: [
        {
          id: 'numerique-intro-01',
          say: 'Une intelligence artificielle qui rédige un texte à votre demande. Des vidéos qui défilent sans fin sur un écran. Qui fixe les règles de ces outils\u202f?',
          visual: 'hook',
          draw: 'Un téléphone au trait\u00a0: une puce d’IA d’où sort une bulle de texte, des vignettes de vidéos qui défilent sur l’écran\u202f; à côté, un point d’interrogation.',
          emphasis: ['Qui fixe les règles'],
        },
        {
          id: 'numerique-intro-02',
          say: 'C’est l’IA dite générative. En 2025, en France, 37,5\u00a0% des 16 à 74\u00a0ans en avaient utilisé une dans les trois derniers mois.',
          spoken: 'C’est l’I.A. dite générative. En deux mille vingt-cinq, en France, trente-sept virgule cinq pour cent des seize à soixante-quatorze ans en avaient utilisé une dans les trois derniers mois.',
          visual: 'figure',
          draw: 'Deux barres à la même échelle, depuis zéro et jusqu’à 100\u00a0%\u00a0: la France au bleu bille, la moyenne de l’Union européenne à côté.',
          alt: 'Deux barres à la même échelle\u00a0: France, 37,5\u00a0%\u202f; Union européenne, 32,7\u00a0%.',
          emphasis: ['37,5\u00a0%'],
          figure: { value: '37,5\u00a0%', label: LABEL_PERSONNES, date: '2025 (article publié le 15\u00a0avril 2026)', sourceIndex: 0 },
          chart: CHART_PERSONNES,
        },
        {
          id: 'numerique-intro-03',
          say: 'L’intelligence artificielle se diffuse vite, dans les entreprises comme dans la vie quotidienne. Ses effets sur l’emploi restent difficiles à mesurer.',
          visual: 'point',
          draw: 'Un immeuble de bureaux et une maison, chacun touché par la puce d’IA\u202f; puis une mallette de travail à côté d’un mètre ruban et d’un point d’interrogation.',
          emphasis: ['difficiles à mesurer'],
        },
        {
          id: 'numerique-intro-04',
          say: 'Les écrans arrivent tôt. En 2022, un quart des enfants de 9 à 11\u00a0ans avaient accès aux réseaux sociaux. L’âge minimum pour s’y inscrire\u00a0: 13\u00a0ans.',
          spoken: 'Les écrans arrivent tôt. En deux mille vingt-deux, un quart des enfants de neuf à onze ans avaient accès aux réseaux sociaux. L’âge minimum pour s’y inscrire : treize ans.',
          visual: 'figure',
          draw: 'Quatre enfants au trait au-dessus d’une ligne des âges, dont un compté au bleu bille\u202f; une barrière posée sur la ligne à 13\u00a0ans.',
          alt: 'Sur une ligne des âges, de 3 à 15\u00a0ans\u00a0: les 9-11\u00a0ans, puis une barrière à 13\u00a0ans.',
          emphasis: ['un quart', '13\u00a0ans'],
          figure: { value: '25\u00a0%', label: LABEL_RESEAUX, date: DATE_ENABEE, sourceIndex: 1 },
          chart: CHART_RESEAUX,
        },
        {
          id: 'numerique-intro-05',
          say: 'Les plateformes et moteurs de recherche qui dépassent 45\u00a0millions d’utilisateurs par mois dans l’Union européenne sont soumis aux règles les plus strictes. La Commission européenne les fait appliquer.',
          spoken: 'Les plateformes et moteurs de recherche qui dépassent quarante-cinq millions d’utilisateurs par mois dans l’Union européenne sont soumis aux règles les plus strictes. La Commission européenne les fait appliquer.',
          visual: 'figure',
          draw: 'Deux piles d’utilisateurs au trait, l’une sous un seuil en pointillé, l’autre au-dessus\u202f; celle qui le dépasse reçoit un document de règles au bleu bille.',
          alt: 'Une ligne de seuil en pointillé\u00a0: une plateforme en dessous, une au-dessus, qui reçoit les règles.',
          emphasis: ['45\u00a0millions', 'les plus strictes'],
          figure: { value: '45\u00a0millions', label: LABEL_SEUIL, date: DATE_SEUIL, sourceIndex: 2 },
        },
        {
          id: 'numerique-intro-06',
          say: 'Alors, quatre questions. Face à l’IA, quelle priorité\u202f? Comment protéger les enfants\u202f? Comment encadrer les plateformes\u202f? Et quelles règles pour l’information et les médias\u202f?',
          spoken: 'Alors, quatre questions. Face à l’I.A., quelle priorité ? Comment protéger les enfants ? Comment encadrer les plateformes ? Et quelles règles pour l’information et les médias ?',
          visual: 'question',
          draw: 'Quatre pictogrammes en grille, dessinés l’un après l’autre\u00a0: une puce d’IA, un parapluie, un téléphone, un journal.',
          emphasis: ['quelle priorité', 'protéger les enfants', 'encadrer les plateformes'],
        },
        {
          id: 'numerique-intro-07',
          say: 'Ce sont les quatre sujets des vidéos qui suivent.',
          visual: 'outro',
          draw: 'Les quatre pictogrammes se rangent en file, comme les chapitres d’un carnet.',
        },
      ],
      sources: [EUROSTAT_PERSONNES, ENABEE, DSA_SEUIL],
    },
    {
      id: 'numerique-ia',
      kind: 'deep',
      questionIds: ['numerique-1'],
      title: 'Face à l’IA, quelle priorité\u202f?',
      short: 'Intelligence artificielle',
      register: 'vous',
      segments: [
        {
          id: 'numerique-ia-01',
          say: 'Industrie, construction, commerce, services\u00a0: l’intelligence artificielle arrive dans les entreprises. Que va-t-elle changer\u202f?',
          visual: 'hook',
          draw: 'Une puce d’IA au trait d’où partent quatre flèches vers quatre secteurs, chacun avec son pictogramme quand la voix le nomme\u00a0: une usine, une grue, une étiquette, une mallette.',
          emphasis: ['Que va-t-elle changer'],
        },
        {
          id: 'numerique-ia-02',
          say: 'En France, 9,91\u00a0% des entreprises d’au moins 10\u00a0personnes utilisaient l’IA en 2024. Et 18,16\u00a0% en 2025.',
          spoken: 'En France, neuf virgule quatre-vingt-onze pour cent des entreprises d’au moins dix personnes utilisaient l’I.A. en deux mille vingt-quatre. Et dix-huit virgule seize pour cent en deux mille vingt-cinq.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, depuis zéro\u00a0: la France en 2024, la France en 2025 au bleu bille, puis l’Union européenne en 2025.',
          alt: 'Troisième barre, à la même échelle\u00a0: Union européenne, 2025, 19,95\u00a0%.',
          emphasis: ['9,91\u00a0%', '18,16\u00a0%'],
          figure: {
            value: '18,16\u00a0%',
            label: 'Part des entreprises d’au moins 10\u00a0personnes utilisant au moins une technologie d’IA, France (9,91\u00a0% en 2024\u202f; Union européenne\u00a0: 19,95\u00a0% en 2025). Champ\u00a0: industrie, construction, commerce et principaux services marchands, hors finance',
            date: '2025',
            sourceIndex: 0,
          },
          chart: CHART_ENTREPRISES,
        },
        {
          id: 'numerique-ia-03',
          say: 'Selon l’Organisation internationale du travail, 34\u00a0% des emplois des pays à revenu élevé sont exposés à l’IA générative, au moins en partie.',
          spoken: 'Selon l’Organisation internationale du travail, trente-quatre pour cent des emplois des pays à revenu élevé sont exposés à l’I.A. générative, au moins en partie.',
          visual: 'compare',
          draw: 'Deux barres sur cent, à la même échelle, depuis zéro\u00a0: les pays à revenu élevé, au bleu bille, puis, pour comparer, les pays à faible revenu.',
          alt: 'Deux barres sur cent, à la même échelle\u00a0: pays à revenu élevé, 34\u00a0%\u202f; pays à faible revenu, 11\u00a0%.',
          emphasis: ['34\u00a0%', 'au moins en partie'],
          figure: {
            value: '34\u00a0%',
            label: 'Part des emplois exposés, au moins en partie, à l’IA générative dans les pays à revenu élevé (11\u00a0% dans les pays à faible revenu\u202f; un travailleur sur quatre dans le monde). Pour l’OIT, la plupart des métiers comportant des tâches qui exigent une intervention humaine, l’effet le plus probable est une transformation des emplois',
            date: 'Mai 2025',
            sourceIndex: 1,
          },
          chart: CHART_OIT,
        },
        {
          id: 'numerique-ia-04',
          say: 'Pour l’OIT, la plupart des métiers comportent des tâches qui exigent une intervention humaine. L’effet le plus probable est donc une transformation des emplois.',
          spoken: 'Pour l’O.I.T., la plupart des métiers comportent des tâches qui exigent une intervention humaine. L’effet le plus probable est donc une transformation des emplois.',
          visual: 'point',
          draw: 'Une mallette au-dessus d’une rangée de tâches\u00a0: une personne s’y relie, puis la puce d’IA s’y relie à son tour.',
          emphasis: ['une intervention humaine', 'une transformation des emplois'],
        },
        {
          id: 'numerique-ia-05',
          say: 'En France, en 2024, les cotisations sociales apportaient 55,11\u00a0% des recettes de la protection sociale. Les contributions publiques, 42,9\u00a0%.',
          spoken: 'En France, en deux mille vingt-quatre, les cotisations sociales apportaient cinquante-cinq virgule onze pour cent des recettes de la protection sociale. Les contributions publiques, quarante-deux virgule neuf pour cent.',
          visual: 'figure',
          draw: 'Un disque des recettes de la protection sociale\u00a0: un peu plus de la moitié au bleu bille, les cotisations\u202f; une seconde part en aplat gris, les contributions publiques.',
          alt: 'Les deux parts sur un même disque\u202f; le petit reste, en blanc, correspond aux autres recettes.',
          emphasis: ['55,11\u00a0%', '42,9\u00a0%'],
          figure: {
            value: '55,11\u00a0%',
            label: 'Part des cotisations sociales dans les recettes de la protection sociale, France. Les contributions publiques en apportent 42,9\u00a0%, dont 29,95\u00a0% sous forme d’impôts affectés (réservés à ce financement)',
            date: '2024',
            sourceIndex: 2,
          },
          chart: CHART_PROTECTION,
        },
        {
          id: 'numerique-ia-06',
          say: 'Un règlement européen, en vigueur depuis 2024, classe les systèmes d’IA en quatre niveaux de risque.',
          spoken: 'Un règlement européen, en vigueur depuis deux mille vingt-quatre, classe les systèmes d’I.A. en quatre niveaux de risque.',
          visual: 'point',
          draw: 'Un document de règlement au trait\u202f; à côté, une pyramide de quatre étages qui se construit, du risque le plus faible au plus élevé.',
          emphasis: ['quatre niveaux de risque'],
        },
        {
          id: 'numerique-ia-07',
          say: 'Des pratiques sont interdites depuis février 2025, et les grands modèles d’IA encadrés depuis août 2025. Les usages «\u00a0à haut risque\u00a0», comme dans l’emploi ou l’éducation, le seront en décembre 2027.',
          spoken: 'Des pratiques sont interdites depuis février deux mille vingt-cinq, et les grands modèles d’I.A. encadrés depuis août deux mille vingt-cinq. Les usages à haut risque, comme dans l’emploi ou l’éducation, le seront en décembre deux mille vingt-sept.',
          visual: 'timeline',
          draw: 'Une frise de 2025 à 2028, à l’échelle\u00a0: deux repères déjà franchis au bleu bille, février et août 2025, puis un troisième en pointillé, décembre 2027.',
          alt: 'Frise à l’échelle, de 2025 à 2028\u00a0: deux repères franchis, le troisième à venir, en pointillé.',
          emphasis: ['février 2025', 'août 2025', 'décembre 2027'],
        },
        {
          id: 'numerique-ia-08',
          say: 'Une convention du Conseil de l’Europe a été négociée aussi avec les États-Unis, le Canada ou le Japon. L’Union européenne l’a signée en septembre 2024.',
          spoken: 'Une convention du Conseil de l’Europe a été négociée aussi avec les États-Unis, le Canada ou le Japon. L’Union européenne l’a signée en septembre deux mille vingt-quatre.',
          visual: 'point',
          draw: 'Un globe au trait\u202f; un document de convention posé devant, signé d’un trait de plume\u202f; les noms des États écrits autour du globe.',
          emphasis: ['Une convention du Conseil de l’Europe', 'septembre 2024'],
        },
        {
          id: 'numerique-ia-09',
          say: 'Selon la Commission européenne, c’est le premier traité international contraignant sur l’IA. Il vise à la rendre compatible avec les droits humains, la démocratie et l’État de droit.',
          spoken: 'Selon la Commission européenne, c’est le premier traité international contraignant sur l’intelligence artificielle. Il vise à la rendre compatible avec les droits humains, la démocratie et l’État de droit.',
          visual: 'point',
          draw: 'Trois pictogrammes légendés\u00a0: une personne, trois personnes côte à côte, un bâtiment à colonnes.',
          emphasis: ['premier traité international contraignant'],
        },
        {
          id: 'numerique-ia-10',
          say: 'En février 2025, la Commission a lancé InvestAI, pour mobiliser 200\u00a0milliards d’euros d’investissements. Dont 20\u00a0milliards pour quatre «\u00a0giga-fabriques\u00a0» d’IA\u00a0: de très grands centres de calcul.',
          spoken: 'En février deux mille vingt-cinq, la Commission a lancé Invest A.I., pour mobiliser deux cents milliards d’euros d’investissements. Dont vingt milliards pour quatre giga-fabriques d’I.A. : de très grands centres de calcul.',
          visual: 'figure',
          draw: 'Dix piles de pièces en rang\u202f; l’une, au bleu bille, file vers quatre grands centres de calcul dessinés comme des armoires de serveurs.',
          emphasis: ['200\u00a0milliards', '20\u00a0milliards'],
          figure: {
            value: '200\u00a0Md€',
            label: 'Investissements dans l’IA que vise à mobiliser l’initiative InvestAI de la Commission européenne (lancée en février 2025\u202f; dont un fonds de 20\u00a0Md€ pour financer quatre «\u00a0giga-fabriques\u00a0» d’IA, de très grands centres de calcul destinés à entraîner les modèles les plus complexes)',
            date: 'Février 2025',
            sourceIndex: 5,
          },
        },
        {
          id: 'numerique-ia-11',
          say: 'Alors, face à l’IA, quelle priorité, et à quelle échelle\u202f?',
          spoken: 'Alors, face à l’I.A., quelle priorité, et à quelle échelle ?',
          visual: 'question',
          draw: 'La puce d’IA au centre de trois cercles en pointillé de plus en plus larges, et un point d’interrogation.',
          emphasis: ['quelle priorité', 'quelle échelle'],
        },
      ],
      sources: [EUROSTAT_ENTREPRISES, OIT, EUROSTAT_PROTECTION, REGLEMENT_IA, CONVENTION_IA, INVESTAI],
    },
    {
      id: 'numerique-ecrans',
      kind: 'deep',
      questionIds: ['numerique-2'],
      title: 'Protéger les enfants face aux écrans',
      short: 'Enfants et écrans',
      register: 'vous',
      segments: [
        {
          id: 'numerique-ecrans-01',
          say: 'Dessins animés, jeux, vidéos\u00a0: les écrans arrivent tôt dans la vie des enfants. Comment les protéger\u202f?',
          visual: 'hook',
          draw: 'Un enfant au trait devant une tablette qui s’allume\u202f; au-dessus de lui, un parapluie esquissé, et un point d’interrogation.',
          emphasis: ['Comment les protéger'],
        },
        {
          id: 'numerique-ecrans-02',
          say: 'Sur leur temps de loisirs, en 2022, les 9 à 11\u00a0ans passaient en moyenne 2\u00a0h\u00a033 par jour devant un écran. Les 3 à 5\u00a0ans, 1\u00a0h\u00a022.',
          spoken: 'Sur leur temps de loisirs, en deux mille vingt-deux, les neuf à onze ans passaient en moyenne deux heures trente-trois par jour devant un écran. Les trois à cinq ans, une heure vingt-deux.',
          visual: 'figure',
          draw: 'Deux barres de temps à la même échelle, depuis zéro\u00a0: les 9 à 11\u00a0ans, puis les 3 à 5\u00a0ans.',
          emphasis: ['2\u00a0h\u00a033', '1\u00a0h\u00a022'],
          figure: {
            value: '2\u00a0h\u00a033',
            label: 'Temps d’écran quotidien moyen des 9-11\u00a0ans sur leur temps de loisirs (1\u00a0h\u00a022 chez les 3-5\u00a0ans). Enfants scolarisés en France hexagonale',
            date: DATE_ENABEE,
            sourceIndex: 0,
          },
        },
        {
          id: 'numerique-ecrans-03',
          say: 'Il faut 13\u00a0ans pour s’inscrire sur un réseau social. Pourtant, 25\u00a0% des 9 à 11\u00a0ans y avaient accès.',
          spoken: 'Il faut treize ans pour s’inscrire sur un réseau social. Pourtant, vingt-cinq pour cent des neuf à onze ans y avaient accès.',
          visual: 'figure',
          draw: 'Une barrière marquée 13\u00a0ans\u202f; dessous, une barre sur cent, depuis zéro\u00a0: les 9 à 11\u00a0ans qui ont accès aux réseaux sociaux.',
          emphasis: ['13\u00a0ans', '25\u00a0%'],
          figure: { value: '25\u00a0%', label: LABEL_RESEAUX, date: DATE_ENABEE, sourceIndex: 0 },
          chart: CHART_RESEAUX,
        },
        {
          id: 'numerique-ecrans-04',
          say: '9\u00a0parents sur 10 disent limiter souvent ou toujours le temps d’écran. Le contrôle fréquent des contenus baisse avec l’âge.',
          spoken: 'Neuf parents sur dix disent limiter souvent ou toujours le temps d’écran. Le contrôle fréquent des contenus baisse avec l’âge.',
          visual: 'figure',
          draw: 'Dix parents au trait, dont neuf comptés au bleu bille\u202f; dessous, une flèche qui descend quand la voix dit que le contrôle des contenus baisse avec l’âge.',
          emphasis: ['9\u00a0parents sur 10', 'baisse avec l’âge'],
          figure: {
            value: '9\u00a0sur\u00a010',
            label: 'Parents d’enfants de 3 à 11\u00a0ans qui déclarent limiter «\u00a0toujours\u00a0» ou «\u00a0souvent\u00a0» leur temps d’écran. Le contrôle des contenus est moins répandu et baisse avec l’âge\u00a0: 52\u00a0% des parents de 3-5\u00a0ans et 36\u00a0% de ceux de 9-11\u00a0ans empêchent «\u00a0souvent\u00a0» l’accès à certains contenus. France hexagonale',
            date: DATE_ENABEE,
            sourceIndex: 0,
          },
          chart: CHART_PARENTS,
        },
        {
          id: 'numerique-ecrans-05',
          say: 'Une enquête de l’OMS interroge des jeunes de 11, 13 et 15\u00a0ans, dans 44\u00a0pays et régions. En 2022, 11\u00a0% montraient des signes proches de l’addiction aux réseaux sociaux, contre 7\u00a0% en 2018.',
          spoken: 'Une enquête de l’O.M.S. interroge des jeunes de onze, treize et quinze ans, dans quarante-quatre pays et régions. En deux mille vingt-deux, onze pour cent montraient des signes proches de l’addiction aux réseaux sociaux, contre sept pour cent en deux mille dix-huit.',
          visual: 'figure',
          draw: 'Deux colonnes datées, 2018 et 2022, depuis zéro\u202f; la seconde, plus haute, au bleu bille.',
          emphasis: ['11\u00a0%', '7\u00a0%'],
          figure: {
            value: '11\u00a0%',
            label: 'Part des jeunes de 11, 13 et 15\u00a0ans présentant des signes d’usage problématique des réseaux sociaux (des symptômes proches de l’addiction\u00a0: perte de contrôle, manque, activités délaissées\u202f; 7\u00a0% en 2018\u202f; filles 13\u00a0%, garçons 9\u00a0%). Enquête HBSC auprès de près de 280\u202f000 jeunes de 44 pays et régions d’Europe, d’Asie centrale et du Canada',
            date: '2022 (publié le 25\u00a0septembre 2024)',
            sourceIndex: 1,
          },
        },
        {
          id: 'numerique-ecrans-06',
          say: 'En janvier 2026, l’Anses, l’agence de sécurité sanitaire, relève des risques surtout pour la santé mentale des adolescents.',
          spoken: 'En janvier deux mille vingt-six, l’Anses, l’agence de sécurité sanitaire, relève des risques surtout pour la santé mentale des adolescents.',
          visual: 'point',
          draw: 'Un document d’expertise au trait\u202f; une flèche mène à une personne, un cœur au bleu bille à côté d’elle.',
          emphasis: ['la santé mentale'],
        },
        {
          id: 'numerique-ecrans-07',
          say: 'Elle recommande d’agir d’abord sur la conception des réseaux. Et de faire respecter la limite de 13\u00a0ans, avec une vérification fiable de l’âge. Elle insiste aussi sur l’éducation au numérique et l’accompagnement parental.',
          spoken: 'Elle recommande d’agir d’abord sur la conception des réseaux. Et de faire respecter la limite de treize ans, avec une vérification fiable de l’âge. Elle insiste aussi sur l’éducation au numérique et l’accompagnement parental.',
          visual: 'point',
          draw: 'Quatre lignes, chacune avec son pictogramme quand la voix la dit\u00a0: un téléphone, une barrière, une loupe, un livre (l’éducation au numérique et l’accompagnement parental).',
          emphasis: ['la conception des réseaux', '13\u00a0ans'],
        },
        {
          id: 'numerique-ecrans-08',
          say: 'Une loi votée en juillet 2026 prévoyait d’interdire les réseaux sociaux avant 15\u00a0ans. En août, le Conseil constitutionnel a censuré cette interdiction, pour atteinte disproportionnée à la liberté d’expression.',
          spoken: 'Une loi votée en juillet deux mille vingt-six prévoyait d’interdire les réseaux sociaux avant quinze ans. En août, le Conseil constitutionnel a censuré cette interdiction, pour atteinte disproportionnée à la liberté d’expression.',
          visual: 'timeline',
          draw: 'Un document de loi marqué «\u00a015\u00a0ans\u00a0», daté de juillet\u202f; en août, un bâtiment à colonnes, et le document barré d’un trait.',
          emphasis: ['avant 15\u00a0ans', 'censuré'],
        },
        {
          id: 'numerique-ecrans-09',
          say: 'Protéger les mineurs peut justifier une limite, admet-il. Mais celle-ci visait tous les réseaux, sans que les parents puissent l’adapter. Et chacun, même majeur, devait prouver son âge, sans garanties légales pour sa vie privée.',
          visual: 'point',
          draw: 'Trois lignes, chacune avec son pictogramme quand la voix la dit\u00a0: un parapluie, un téléphone, une carte d’identité.',
          emphasis: ['Protéger les mineurs', 'tous les réseaux', 'même majeur'],
        },
        {
          id: 'numerique-ecrans-10',
          say: 'Protéger les mineurs d’un côté, liberté d’expression et vie privée de l’autre\u00a0: c’est la balance du débat.',
          visual: 'compare',
          draw: 'Une balance au trait, fléau à l’horizontale\u00a0: un parapluie au-dessus d’un enfant sur un plateau, une bulle de parole et un cadenas sur l’autre.',
          emphasis: ['la balance du débat'],
        },
        {
          id: 'numerique-ecrans-11',
          say: 'Alors, qui doit agir, et comment\u00a0: les parents, l’école, les plateformes, la loi\u202f?',
          visual: 'question',
          draw: 'Quatre pictogrammes en rang, une personne, un livre, un téléphone, un document de loi, et un point d’interrogation.',
          emphasis: ['qui doit agir'],
        },
      ],
      sources: [ENABEE, OMS, ANSES, CC_2026],
    },
    {
      id: 'numerique-plateformes',
      kind: 'deep',
      questionIds: ['numerique-3'],
      title: 'Encadrer les grandes plateformes',
      short: 'Grandes plateformes',
      register: 'vous',
      segments: [
        {
          id: 'numerique-plateformes-01',
          say: 'Réseaux sociaux, sites de vente, moteurs de recherche\u00a0: vous les utilisez peut-être chaque jour. Qui les encadre\u202f?',
          visual: 'hook',
          draw: 'Trois pictogrammes au trait, chacun quand la voix le nomme\u00a0: une bulle de messages, une étiquette de prix, une loupe.',
          emphasis: ['Qui les encadre'],
        },
        {
          id: 'numerique-plateformes-02',
          say: 'Au-delà de 45\u00a0millions d’utilisateurs par mois dans l’Union européenne, une plateforme est classée «\u00a0très grande\u00a0». Elle a alors les obligations les plus strictes, en modération et en transparence.',
          spoken: 'Au-delà de quarante-cinq millions d’utilisateurs par mois dans l’Union européenne, une plateforme est classée très grande. Elle a alors les obligations les plus strictes, en modération et en transparence.',
          visual: 'figure',
          draw: 'Deux piles d’utilisateurs au trait, l’une sous un seuil en pointillé, l’autre au-dessus\u202f; celle qui le dépasse reçoit un document de règles au bleu bille.',
          alt: 'Une ligne de seuil en pointillé\u00a0: une plateforme en dessous, une au-dessus, qui reçoit les obligations.',
          emphasis: ['45\u00a0millions', 'très grande'],
          figure: { value: '45\u00a0millions', label: LABEL_SEUIL, date: DATE_SEUIL, sourceIndex: 0 },
        },
        {
          id: 'numerique-plateformes-03',
          say: 'C’est le règlement européen sur les services numériques. La Commission européenne le fait appliquer, par des sanctions et des engagements négociés.',
          visual: 'point',
          draw: 'Le nom du règlement\u202f; dessous, un bâtiment à colonnes d’où partent deux flèches\u00a0: des pièces d’amende d’un côté, un document de l’autre.',
          emphasis: ['des sanctions', 'des engagements négociés'],
        },
        {
          id: 'numerique-plateformes-04',
          say: 'Au 31\u00a0août 2026, elle avait infligé trois amendes. À X, 120\u00a0millions d’euros\u202f; à Temu, 200\u00a0millions\u202f; à AliExpress, 550\u00a0millions.',
          spoken: 'Au trente et un août deux mille vingt-six, elle avait infligé trois amendes. À X, cent vingt millions d’euros ; à Temu, deux cents millions ; à AliExpress, cinq cent cinquante millions.',
          visual: 'figure',
          draw: 'Trois barres à la même échelle, depuis zéro, une par amende, dans l’ordre où la voix les dit.',
          emphasis: ['trois amendes'],
          figure: {
            value: '120, 200 et 550\u00a0M€',
            label: 'Amendes infligées par la Commission européenne au titre du règlement sur les services numériques\u00a0: X (120\u00a0M€, décembre 2025), Temu (200\u00a0M€, mai 2026) et AliExpress (550\u00a0M€, juillet 2026)',
            date: 'Au 31\u00a0août 2026',
            sourceIndex: 1,
          },
        },
        {
          id: 'numerique-plateformes-05',
          say: 'Le plafond d’une amende\u00a0: 6\u00a0% du chiffre d’affaires annuel mondial de la plateforme.',
          spoken: 'Le plafond d’une amende : six pour cent du chiffre d’affaires annuel mondial de la plateforme.',
          visual: 'figure',
          draw: 'Cent pièces en dix rangées\u202f; six se comptent au bleu bille.',
          emphasis: ['6\u00a0%'],
          figure: {
            value: '6\u00a0%',
            label: 'Plafond des amendes prévues par le règlement européen sur les services numériques, en part du chiffre d’affaires annuel mondial de la plateforme',
            date: 'Règle en vigueur (page mise à jour le 2\u00a0juillet 2026)',
            sourceIndex: 2,
          },
        },
        {
          id: 'numerique-plateformes-06',
          say: 'Elle a aussi accepté des engagements de TikTok sur la publicité, en décembre 2025. Puis un plan d’action de X, en juillet 2026.',
          spoken: 'Elle a aussi accepté des engagements de TikTok sur la publicité, en décembre deux mille vingt-cinq. Puis un plan d’action de X, en juillet deux mille vingt-six.',
          visual: 'timeline',
          draw: 'Deux documents signés posés sur une frise, décembre 2025 et juillet 2026.',
          emphasis: ['des engagements', 'un plan d’action'],
        },
        {
          id: 'numerique-plateformes-07',
          say: 'En février 2026, la Commission a estimé, à titre préliminaire, que la conception «\u00a0addictive\u00a0» de TikTok enfreint ce règlement. En cause\u00a0: défilement infini, lecture automatique, notifications, recommandations très personnalisées.',
          spoken: 'En février deux mille vingt-six, la Commission a estimé, à titre préliminaire, que la conception addictive de TikTok enfreint ce règlement. En cause : défilement infini, lecture automatique, notifications, recommandations très personnalisées.',
          visual: 'point',
          draw: 'Un téléphone au trait où des vidéos défilent sans fin\u202f; quatre pictogrammes à côté\u00a0: une flèche qui boucle, un bouton de lecture, une cloche, une cible.',
          emphasis: ['à titre préliminaire'],
        },
        {
          id: 'numerique-plateformes-08',
          say: 'Alors, comment faire respecter ces règles, et faut-il en ajouter\u202f?',
          visual: 'question',
          draw: 'Le document de règles, une loupe posée dessus, et un point d’interrogation.',
          emphasis: ['faut-il en ajouter'],
        },
      ],
      sources: [DSA_SEUIL, DSA_SUPERVISION, DSA_AMENDES, TIKTOK],
    },
    {
      id: 'numerique-medias',
      kind: 'deep',
      questionIds: ['numerique-3'],
      title: 'Information, presse et création',
      short: 'Information et médias',
      register: 'vous',
      segments: [
        {
          id: 'numerique-medias-01',
          say: 'Une fausse information circule en ligne avant une élection. Peut-on en faire cesser la diffusion\u202f?',
          visual: 'hook',
          draw: 'Une bulle de message au trait qui se recopie, de bulle en bulle\u202f; au bout, un calendrier d’élection.',
          emphasis: ['fausse information', 'cesser la diffusion'],
        },
        {
          id: 'numerique-medias-02',
          say: 'Une loi de 2018 le permet, si cette information risque d’altérer la sincérité du scrutin. Pendant les trois mois qui précèdent le mois d’une élection générale ou d’un référendum, un juge saisi en urgence peut en faire cesser la diffusion.',
          spoken: 'Une loi de deux mille dix-huit le permet, si cette information risque d’altérer la sincérité du scrutin. Pendant les trois mois qui précèdent le mois d’une élection générale ou d’un référendum, un juge saisi en urgence peut en faire cesser la diffusion.',
          visual: 'timeline',
          draw: 'Quatre cases de mois en rang\u00a0: les trois premières au bleu bille, la dernière marquée d’un drapeau pour l’élection\u202f; un bâtiment à colonnes pour le juge.',
          emphasis: ['trois mois', 'un juge'],
        },
        {
          id: 'numerique-medias-03',
          say: 'Le Conseil constitutionnel l’a admis, à condition que le caractère inexact ou trompeur soit «\u00a0manifeste\u00a0», comme le risque pour le scrutin.',
          visual: 'point',
          draw: 'Deux conditions, une loupe sur une bulle de message et un calendrier d’élection, chacune cochée du même mot.',
          emphasis: ['manifeste'],
        },
        {
          id: 'numerique-medias-04',
          say: 'Pour la presse, une loi de 2019 a créé un «\u00a0droit voisin\u00a0» du droit d’auteur. Les plateformes qui reprennent des contenus de presse doivent négocier leur rémunération avec les éditeurs et les agences.',
          spoken: 'Pour la presse, une loi de deux mille dix-neuf a créé un droit voisin du droit d’auteur. Les plateformes qui reprennent des contenus de presse doivent négocier leur rémunération avec les éditeurs et les agences.',
          visual: 'point',
          draw: 'Un journal et un téléphone face à face\u00a0: un article passe du journal au téléphone, des pièces repartent dans l’autre sens.',
          emphasis: ['droit voisin', 'négocier leur rémunération'],
        },
        {
          id: 'numerique-medias-05',
          say: 'Des accords avec Meta ont expiré fin 2024 et début 2025, sans être renouvelés. En juillet 2026, avant sa décision sur le fond, l’Autorité de la concurrence lui a ordonné de reprendre des négociations de bonne foi.',
          spoken: 'Des accords avec Meta ont expiré fin deux mille vingt-quatre et début deux mille vingt-cinq, sans être renouvelés. En juillet deux mille vingt-six, avant sa décision sur le fond, l’Autorité de la concurrence lui a ordonné de reprendre des négociations de bonne foi.',
          visual: 'timeline',
          draw: 'Une frise de 2024 à 2027, à l’échelle\u00a0: deux documents en pointillé, les accords expirés\u202f; en juillet 2026, un bâtiment à colonnes, et une flèche qui renvoie vers les accords.',
          emphasis: ['Autorité de la concurrence', 'de bonne foi'],
        },
        {
          id: 'numerique-medias-06',
          say: 'Pour la création, les grandes plateformes de vidéo par abonnement ont des obligations depuis 2021. Elles doivent consacrer 20\u00a0% de leur chiffre d’affaires en France à la production d’œuvres.',
          spoken: 'Pour la création, les grandes plateformes de vidéo par abonnement ont des obligations depuis deux mille vingt et un. Elles doivent consacrer vingt pour cent de leur chiffre d’affaires en France à la production d’œuvres.',
          visual: 'figure',
          draw: 'Cinq pièces en rang\u202f; l’une, au bleu bille, file vers un écran de cinéma.',
          emphasis: ['20\u00a0%', 'la production d’œuvres'],
          figure: {
            value: '20\u00a0%',
            label: 'Part du chiffre d’affaires réalisé en France que les grandes plateformes de vidéo par abonnement doivent consacrer à la production d’œuvres (Netflix, Disney+, Amazon Prime Video…\u202f; dont 80\u00a0% pour l’audiovisuel et 20\u00a0% pour le cinéma)',
            date: 'Décret du 22\u00a0juin 2021 (conventions et notifications de décembre 2021)',
            sourceIndex: 2,
          },
        },
        {
          id: 'numerique-medias-07',
          say: 'Contre la concentration des médias, une loi de 1986 fixe des limites. Personne ne peut détenir plus de 49\u00a0% du capital d’une chaîne nationale de la TNT qui dépasse 8\u00a0% d’audience.',
          spoken: 'Contre la concentration des médias, une loi de mille neuf cent quatre-vingt-six fixe des limites. Personne ne peut détenir plus de quarante-neuf pour cent du capital d’une chaîne nationale de la T.N.T. qui dépasse huit pour cent d’audience.',
          visual: 'figure',
          draw: 'Un poste de télévision au trait\u202f; à côté, une barre de cent, comptée au bleu bille jusqu’à un plafond à 49.',
          emphasis: ['49\u00a0%', '8\u00a0%'],
          figure: {
            value: '49\u00a0%',
            label: 'Part maximale du capital ou des droits de vote qu’une même personne peut détenir dans une chaîne nationale de la TNT (dont l’audience annuelle dépasse 8\u00a0% de l’audience totale de la télévision). C’est l’une des règles anti-concentration de la loi de 1986 sur la liberté de communication',
            date: 'Règle en vigueur (rédaction du 27\u00a0octobre 2021, consultée le 3\u00a0octobre 2026)',
            sourceIndex: 3,
          },
        },
        {
          id: 'numerique-medias-08',
          say: 'Alors, quelles règles pour l’information, la presse et la création, et faut-il les changer\u202f?',
          visual: 'question',
          draw: 'Un journal, un écran de vidéo et un téléphone en rang, et un point d’interrogation.',
          emphasis: ['quelles règles', 'faut-il les changer'],
        },
      ],
      sources: [CC_2018, DROITS_VOISINS, SMAD, LOI_1986],
    },
  ],
}
