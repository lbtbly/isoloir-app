export const meta = {
  name: 'choisir2027-research',
  description: 'Research sourced positions of the 5 Choisir 2027 candidates by topic, their cleavages, and VAA methodology',
  phases: [{ title: 'Research', detail: '5 candidate dossiers + cleavages/debates + VAA methodology' }],
}

const CONTEXT = `Contexte (date du jour : 2 octobre 2026). "Choisir 2027" (choisir2027.org) est la primaire "socialiste et démocratique" organisée par le Parti socialiste, Place publique et la Gauche républicaine et socialiste (GRS) pour désigner leur candidat commun à la présidentielle 2027. Vote en ligne : 1er tour 9-10 octobre 2026, 2nd tour 16-17 octobre 2026. Débats télévisés : 23 septembre (LCI), 1er octobre (France 2 / France Inter), 4 octobre (BFMTV, pas encore eu lieu). Cinq candidats retenus (franceinfo, 16/09/2026) : Olivier Faure, Raphaël Glucksmann, Jérôme Guedj, Emmanuel Maurel, Ségolène Royal (Philippe Brun a été exclu). Vérifie ces faits et signale toute info contradictoire.

Objectif final : construire une "boussole électorale" (voting advice application) NEUTRE qui aide un électeur à trouver le candidat le plus proche de ses idées. Tes données serviront à rédiger des questions et à positionner chaque candidat sur des "approches" anonymisées. La rigueur factuelle est critique : une attribution fausse est bien pire qu'une case "inconnu".`

const RULES = `Règles de recherche :
- Charge d'abord les outils web : ToolSearch avec query "select:WebSearch,WebFetch". Utilise-les abondamment (au moins 20 recherches + lectures de pages). Cherche en français.
- Sources à privilégier : site de campagne / programme officiel, profession de foi de la primaire, tribunes signées, interviews, comptes-rendus des débats de la primaire (LCI 23/09/2026, France 2 01/10/2026), votes et propositions de loi (Assemblée nationale, Parlement européen), grands médias (franceinfo, Le Monde, Libération, Le Figaro, Les Echos, L'Obs, Mediapart, Public Sénat, LCP, Ouest-France, 20 Minutes, BFMTV, RTL, France Inter, Le Parisien, La Croix), fact-checking. Wikipédia uniquement comme point d'entrée.
- Privilégie les positions récentes (2025-2026, campagne de la primaire). Si une position a évolué, donne la plus récente et signale l'évolution.
- Chaque position doit avoir une source (URL + titre + date). Sans source : ne pas inclure, ou confidence "low" avec explication.
- Paraphrase ; toute citation exacte doit faire moins de 15 mots.
- Distingue : proposition explicite / position déclarée / inférence (vote parlementaire, motion signée, etc.).
- Donne des mesures concrètes et chiffrées quand elles existent (montants, âges, seuils, dates, pourcentages).
- N'invente rien. Si tu ne trouves rien sur un thème : found=false et positions=[].
- Lecture du web uniquement : n'écris aucun fichier, ne modifie rien.`

const TOPICS = [
  ['strategie', "Stratégie politique et alliances (rapport à LFI, au NFP, au centre/macronistes, union de la gauche, candidature unique, désistements)"],
  ['fiscalite', "Fiscalité et finances publiques (ISF/taxe Zucman, héritage, impôt sur le revenu, TVA, CSG, niches, superprofits, dette/déficit, règles budgétaires)"],
  ['travail_salaires', "Travail, salaires, pouvoir d'achat (SMIC, indexation, temps de travail/32h/semaine de 4 jours, assurance chômage, RSA, partage de la valeur)"],
  ['retraites', "Retraites (abrogation réforme 2023, âge légal 62/60 ans, durée de cotisation, pénibilité, financement, système universel/points)"],
  ['sante', "Santé et hôpital (déserts médicaux, régulation de l'installation des médecins, hôpital public, dépassements d'honoraires, Sécurité sociale, autonomie/grand âge, EHPAD)"],
  ['education', "Éducation, jeunesse, enseignement supérieur (salaires enseignants, mixité sociale/carte scolaire, école privée sous contrat, uniforme, Parcoursup, revenu/allocation jeunes, service civique/militaire)"],
  ['ecologie_energie', "Écologie et énergie (nucléaire : nouveaux EPR/sortie, renouvelables, planification écologique, ISF climatique, voiture électrique/2035, transports, rénovation thermique, prix de l'énergie, grands projets contestés)"],
  ['agriculture', "Agriculture et alimentation (Mercosur, pesticides/glyphosate, loi Duplomb, revenus agricoles, PAC, bassines/eau)"],
  ['europe', "Europe (fédéralisme vs souveraineté nationale, traités, règles budgétaires européennes, élargissement à l'Ukraine, emprunt commun, protectionnisme européen, unanimité)"],
  ['international_defense', "International et défense (Ukraine/Russie, livraison d'armes, troupes, Israël/Gaza/Palestine, reconnaissance, sanctions, Chine, États-Unis/Trump, OTAN, dissuasion nucléaire européenne, budget défense, service militaire)"],
  ['institutions', "Institutions et démocratie (VIe République, 49.3, proportionnelle, RIC/référendum, cumul/limitation des mandats, rôle du Président, décentralisation, Conseil constitutionnel)"],
  ['securite_justice', "Sécurité, justice, drogues (police de proximité, effectifs, prisons, peines, cannabis légalisation/dépénalisation, narcotrafic, vidéosurveillance)"],
  ['immigration', "Immigration, asile, intégration (régularisation des travailleurs sans-papiers, AME, quotas, pacte asile-migration UE, droit du sol, OQTF, intégration, droit de vote des étrangers aux élections locales)"],
  ['laicite_republique', "Laïcité, République, discriminations (loi 1905, voile, islamisme/séparatisme, antisémitisme, racisme, lutte contre les discriminations)"],
  ['logement', "Logement (encadrement des loyers, logement social/HLM, construction, Airbnb/meublés, réquisitions, accès à la propriété)"],
  ['industrie_economie', "Industrie, économie, souveraineté (réindustrialisation, nationalisations, protectionnisme, aides aux entreprises et conditionnalité, libre-échange, services publics de l'énergie/EDF, banques)"],
  ['numerique', "Numérique et IA (réseaux sociaux et mineurs, régulation des plateformes, IA, souveraineté numérique, désinformation)"],
  ['societe', "Société (fin de vie/aide à mourir, PMA/GPA, droits LGBT, égalité femmes-hommes, violences sexuelles, culture, audiovisuel public, sport)"],
  ['territoires', "Territoires (ruralité, services publics de proximité, outre-mer, Corse, Nouvelle-Calédonie)"],
]
const topicList = TOPICS.map(([id, label]) => `- ${id} : ${label}`).join('\n')

const CANDIDATES = [
  { key: 'faure', name: 'Olivier Faure', hint: 'Premier secrétaire du Parti socialiste, député de Seine-et-Marne' },
  { key: 'glucksmann', name: 'Raphaël Glucksmann', hint: 'eurodéputé, co-fondateur de Place publique, tête de liste PS-Place publique aux européennes 2024' },
  { key: 'guedj', name: 'Jérôme Guedj', hint: "député PS de l'Essonne, spécialiste des questions sociales, santé, retraites" },
  { key: 'maurel', name: 'Emmanuel Maurel', hint: 'député du Val-d\'Oise, animateur de la Gauche républicaine et socialiste (GRS), ancien eurodéputé' },
  { key: 'royal', name: 'Ségolène Royal', hint: "ancienne ministre de l'Écologie, candidate PS à la présidentielle 2007, ancienne présidente de Poitou-Charentes" },
]

const POSITION = {
  type: 'object',
  properties: {
    position: { type: 'string', description: 'Paraphrase factuelle et précise de la position/proposition' },
    kind: { type: 'string', enum: ['proposition_explicite', 'position_declaree', 'inference'] },
    details: { type: 'string', description: 'Chiffres, conditions, nuances, contexte' },
    source_title: { type: 'string' },
    source_url: { type: 'string' },
    source_date: { type: 'string' },
    short_quote: { type: 'string', description: 'Citation exacte < 15 mots, optionnelle' },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['position', 'kind', 'source_url', 'confidence'],
}

const DOSSIER = {
  type: 'object',
  properties: {
    candidate: { type: 'string' },
    affiliation: { type: 'string' },
    campaign_site: { type: 'string' },
    programme_sources: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' } }, required: ['title', 'url'] } },
    overview: { type: 'string', description: 'Ligne politique générale en 5-8 phrases, factuelle' },
    signature_proposals: { type: 'array', items: { type: 'object', properties: { proposal: { type: 'string' }, topic_id: { type: 'string' }, source_url: { type: 'string' } }, required: ['proposal', 'topic_id', 'source_url'] } },
    topics: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic_id: { type: 'string' },
          found: { type: 'boolean' },
          positions: { type: 'array', items: POSITION },
        },
        required: ['topic_id', 'found', 'positions'],
      },
    },
    distinctive_vs_others: { type: 'string', description: 'Ce qui distingue ce candidat des 4 autres, avec références' },
    evolutions_and_contradictions: { type: 'string' },
    open_questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['candidate', 'overview', 'topics', 'signature_proposals', 'distinctive_vs_others'],
}

const CLEAVAGES = {
  type: 'object',
  properties: {
    facts_check: { type: 'string', description: 'Vérification : organisateurs, liste exacte des candidats et affiliations, dates, règles de vote, participation payante, site officiel' },
    debates: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, channel: { type: 'string' }, summary: { type: 'string' }, url: { type: 'string' } }, required: ['date', 'summary'] } },
    cleavages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic_id: { type: 'string' },
          cleavage: { type: 'string', description: 'Description neutre de la ligne de fracture' },
          sides: { type: 'array', items: { type: 'object', properties: { approach: { type: 'string', description: 'Formulation neutre de l\'approche' }, candidates: { type: 'array', items: { type: 'string' } }, evidence_urls: { type: 'array', items: { type: 'string' } } }, required: ['approach', 'candidates'] } },
          importance: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['topic_id', 'cleavage', 'sides', 'importance'],
      },
    },
    consensus_points: { type: 'array', items: { type: 'object', properties: { topic_id: { type: 'string' }, point: { type: 'string' }, url: { type: 'string' } }, required: ['topic_id', 'point'] } },
    polls: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, institute: { type: 'string' }, results: { type: 'string' }, url: { type: 'string' } }, required: ['results'] } },
  },
  required: ['facts_check', 'cleavages', 'debates'],
}

const METHODO = {
  type: 'object',
  properties: {
    existing_tools_for_this_primary: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, url: { type: 'string' }, notes: { type: 'string' } }, required: ['name', 'notes'] } },
    vaa_methods: { type: 'array', items: { type: 'object', properties: { tool: { type: 'string' }, scoring: { type: 'string' }, weighting: { type: 'string' }, dealbreakers: { type: 'string' }, neutrality_practices: { type: 'string' }, url: { type: 'string' } }, required: ['tool', 'scoring'] } },
    recommendations: {
      type: 'object',
      properties: {
        scoring_algorithm: { type: 'string' },
        multi_select_approaches: { type: 'string', description: 'Comment scorer quand l\'utilisateur peut sélectionner plusieurs approches qui lui plaisent par question' },
        dealbreaker_handling: { type: 'string' },
        weighting: { type: 'string' },
        unknown_positions: { type: 'string', description: 'Comment traiter les positions inconnues d\'un candidat' },
        question_design_neutrality: { type: 'string' },
        answer_order_randomization: { type: 'string' },
        result_presentation: { type: 'string' },
        transparency: { type: 'string' },
        pitfalls: { type: 'string' },
      },
      required: ['scoring_algorithm', 'multi_select_approaches', 'dealbreaker_handling', 'unknown_positions', 'question_design_neutrality'],
    },
  },
  required: ['vaa_methods', 'recommendations'],
}

phase('Research')

const candidateThunks = CANDIDATES.map(c => () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : constituer le dossier programmatique le plus complet et le mieux sourcé possible de ${c.name} (${c.hint}) dans le cadre de la primaire Choisir 2027.\n\n1. Trouve son site de campagne, son programme / projet / livre / profession de foi pour la primaire, et ses 5 à 12 propositions phares.\n2. Pour CHACUN des thèmes ci-dessous (utilise exactement ces topic_id), liste ses positions concrètes et sourcées. Vise 2 à 6 positions par thème quand elles existent :\n${topicList}\n3. Indique ce qui le/la distingue des 4 autres candidats (Faure, Glucksmann, Guedj, Maurel, Royal), ses évolutions/contradictions et les points restés flous.\n\nRetourne un objet conforme au schéma. Inclus TOUS les topic_id listés dans "topics" (found=false si rien trouvé).`,
  { label: `dossier:${c.key}`, phase: 'Research', schema: DOSSIER }
).then(r => r && { key: c.key, ...r }))

const cleavageThunk = () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : cartographier les LIGNES DE FRACTURE entre les 5 candidats de la primaire Choisir 2027 (Faure, Glucksmann, Guedj, Maurel, Royal).\n1. Vérifie les faits de base (organisateurs, liste exacte et affiliations des candidats, dates, règles et modalités de vote, contribution financière, site officiel choisir2027.org).\n2. Résume les débats télévisés déjà tenus (LCI 23/09/2026, France 2 01/10/2026) et les points d'affrontement.\n3. Liste toutes les lignes de fracture programmatiques et stratégiques, thème par thème (utilise ces topic_id) :\n${topicList}\nPour chaque fracture, décris les approches en présence de façon NEUTRE et indique quels candidats sont de quel côté, avec des URLs de preuve.\n4. Liste aussi les points de consensus (sur lesquels les 5 sont d'accord : ces sujets discriminent peu).\n5. Relève les sondages sur la primaire.`,
  { label: 'cleavages+debates', phase: 'Research', schema: CLEAVAGES }
)

const methodoThunk = () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : recherche méthodologique sur les "voting advice applications" (boussoles électorales) pour concevoir l'algorithme et l'UX de notre app.\n1. Existe-t-il déjà des outils de ce type pour la primaire Choisir 2027 ou les primaires de gauche 2026 ? (noms, URLs, approche)\n2. Étudie la méthodologie de : Wahl-O-Mat, Smartvote, Kieskompas / Stemwijzer, Elyze, La Boussole présidentielle, Voxe, "Mon candidat" / "Quel candidat" 2022, et tout outil pertinent ; ainsi que la littérature académique (ex. travaux sur les VAA, Garzia & Marschall, Louwerse & Rosema, Mendez sur les métriques de distance/proximité). Pour chacun : algorithme de score (distance euclidienne, city-block, accord/désaccord), pondération des thèmes, gestion des "rédhibitoires"/dealbreakers, neutralité de la formulation, ordre aléatoire des réponses, présentation des résultats, transparence (méthode publiée, sources).\n3. Formule des recommandations concrètes pour NOTRE design : chaque question propose plusieurs "approches" (formulées sans indiquer qui les porte) ; l'utilisateur peut en sélectionner plusieurs comme lui plaisant et en marquer comme rédhibitoires ; il y a un questionnaire rapide puis un approfondissement ; à la fin, un score d'affinité par candidat. Comment scorer la multi-sélection ? Comment traiter les positions inconnues d'un candidat ? Comment intégrer les rédhibitoires (exclusion, pénalité, signalement) ? Comment éviter les biais (ordre, formulation, nombre d'approches par candidat, sujets surreprésentés) ? Quelles mises en garde afficher ?`,
  { label: 'vaa-methodology', phase: 'Research', schema: METHODO }
)

const results = await parallel([...candidateThunks, cleavageThunk, methodoThunk])
const dossiers = results.slice(0, CANDIDATES.length).filter(Boolean)
const cleavages = results[CANDIDATES.length]
const methodology = results[CANDIDATES.length + 1]
const missing = CANDIDATES.filter(c => !dossiers.find(d => d.key === c.key)).map(c => c.key)
if (missing.length) log(`Dossiers manquants : ${missing.join(', ')}`)
return { topics: TOPICS, dossiers, cleavages, methodology, missing }
