export const meta = {
  name: 'isoloir-research',
  description: 'Research sourced positions of every candidate of an election by topic (new dossiers + refresh of reused ones), the cleavages per topic family, and a facts check',
  phases: [{ title: 'Research', detail: 'candidate dossiers + refreshes + cleavages per family + facts check' }],
}

// Recherche des positions des candidats d'une élection. Paramétré par `args` = le contenu de
// research/<id>/config.json (la session principale le lit et le passe tel quel). Options :
//   args.only : liste d'identifiants de candidats à traiter seuls (ajout d'un candidat)
//   args.skipCleavages / args.skipFacts : sauter ces agents
// Sorties (journal du workflow → node tools/extract-journal.mjs <journal.jsonl> research/<id>) :
//   dossier:<id> → dossier_<id>.json ; refresh:<id> → refresh_<id>.json ;
//   cleavages:<groupe> → cleavages_<groupe>.json ; facts-check → facts-check.json
// Historique : la recherche de la primaire « Choisir 2027 » a été faite avec la version précédente de ce
// script (git : tools/workflows/1-research.js du premier commit), même schéma de dossier.

const C = args
if (!C || !Array.isArray(C.candidates) || !Array.isArray(C.topics)) throw new Error('args = research/<id>/config.json attendu')

const CONTEXT = `Contexte (date du jour : ${C.contextDate}). ${C.context}

Objectif final : construire une « boussole électorale » (voting advice application) NEUTRE qui aide un électeur à trouver le candidat le plus proche de ses idées, pour l'élection : ${C.name}. Tes données serviront à rédiger des questions et à positionner chaque candidat sur des « approches » anonymisées. La rigueur factuelle est critique : une attribution fausse est bien pire qu'une case « inconnu ».`

const RULES = `Règles de recherche :
- Charge d'abord les outils web : ToolSearch avec query "select:WebSearch,WebFetch". Utilise-les abondamment (au moins 20 recherches + lectures de pages). Cherche en français. Si WebSearch est indisponible (quota), continue avec WebFetch sur des adresses connues : site de campagne ou du parti, programme, Assemblée nationale (assemblee-nationale.fr), Sénat (senat.fr), Parlement européen (europarl.europa.eu), vie-publique.fr, grands médias.
- Sources à privilégier : site de campagne / programme officiel, programme récent (2025-2026) du parti dont la personne est la candidate ou le candidat, tribunes signées, interviews, discours de déclaration, votes et propositions de loi, grands médias (franceinfo, Le Monde, Libération, Le Figaro, Les Echos, L'Obs, Mediapart, Public Sénat, LCP, Ouest-France, 20 Minutes, BFMTV, RTL, France Inter, Le Parisien, La Croix, L'Opinion, Le JDD), fact-checking. Wikipédia uniquement comme point d'entrée.
- Privilégie les positions récentes (2025-2026). Si une position a évolué, donne la plus récente et signale l'évolution. Un programme du parti antérieur à 2025 ou porté par un autre candidat n'est qu'une inférence (confidence « low »).
- Chaque position doit avoir une source (URL + titre + date). Sans source : ne pas inclure, ou confidence « low » avec explication.
- Paraphrase ; toute citation exacte doit faire moins de 15 mots.
- Distingue : proposition explicite / position déclarée / inférence (vote parlementaire, motion signée, programme du parti, etc.).
- Donne des mesures concrètes et chiffrées quand elles existent (montants, âges, seuils, dates, pourcentages).
- N'invente rien. Si tu ne trouves rien sur un thème : found=false et positions=[].
- Lecture du web uniquement : n'écris aucun fichier, ne modifie rien.`

const topicList = C.topics.map(t => `- ${t.id} : ${t.label} — ${t.description}`).join('\n')
const names = C.candidates.filter(c => !c.pendingPrimary).map(c => c.name)
const pendingNames = C.candidates.filter(c => c.pendingPrimary).map(c => c.name)

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
const TOPICS_ARRAY = {
  type: 'array',
  items: {
    type: 'object',
    properties: { topic_id: { type: 'string' }, found: { type: 'boolean' }, positions: { type: 'array', items: POSITION } },
    required: ['topic_id', 'found', 'positions'],
  },
}
const DOSSIER = {
  type: 'object',
  properties: {
    candidate: { type: 'string' },
    affiliation: { type: 'string' },
    campaign_site: { type: 'string' },
    declaration: { type: 'object', properties: { date: { type: 'string' }, form: { type: 'string' }, source_title: { type: 'string' }, source_url: { type: 'string' } }, required: ['date', 'source_url'] },
    programme_sources: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' } }, required: ['title', 'url'] } },
    overview: { type: 'string', description: 'Ligne politique générale en 5-8 phrases, factuelle' },
    signature_proposals: { type: 'array', items: { type: 'object', properties: { proposal: { type: 'string' }, topic_id: { type: 'string' }, source_url: { type: 'string' } }, required: ['proposal', 'topic_id', 'source_url'] } },
    topics: TOPICS_ARRAY,
    distinctive_vs_others: { type: 'string', description: 'Ce qui distingue ce candidat des autres candidats déclarés, avec références' },
    evolutions_and_contradictions: { type: 'string' },
    open_questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['candidate', 'overview', 'topics', 'signature_proposals', 'distinctive_vs_others'],
}
const REFRESH = {
  type: 'object',
  properties: {
    candidate: { type: 'string' },
    topics: TOPICS_ARRAY,
    updates: { type: 'array', items: { type: 'object', properties: { topic_id: { type: 'string' }, change: { type: 'string' }, source_url: { type: 'string' } }, required: ['topic_id', 'change'] }, description: 'Positions du dossier existant qui ont changé depuis le 2 octobre 2026' },
  },
  required: ['candidate', 'topics'],
}
const CLEAVAGES = {
  type: 'object',
  properties: {
    group: { type: 'string' },
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
  },
  required: ['cleavages'],
}
const FACTS = {
  type: 'object',
  properties: {
    calendar: { type: 'string', description: 'Dates des tours, parrainages, liste officielle, campagne officielle, avec sources' },
    declared: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, party: { type: 'string' }, date: { type: 'string' }, unconditional: { type: 'boolean' }, source_url: { type: 'string' } }, required: ['name', 'unconditional'] } },
    changes_vs_config: { type: 'array', items: { type: 'string' }, description: 'Écarts avec la liste fournie : nouvelles déclarations, retraits, conditions levées, erreurs' },
  },
  required: ['calendar', 'declared', 'changes_vs_config'],
}

const only = Array.isArray(C.only) && C.only.length ? new Set(C.only) : null
const pick = c => !only || only.has(c.id)
const fresh = C.candidates.filter(c => !c.reuseDossier && pick(c))
const reused = C.candidates.filter(c => c.reuseDossier && pick(c))

phase('Research')

const dossierThunks = fresh.map(c => () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : constituer le dossier programmatique le plus complet et le mieux sourcé possible de ${c.name} (${c.party}${c.note ? ` ; ${c.note}` : ''}), candidat(e) déclaré(e) à l'élection : ${C.name}${c.declaredAt ? ` (déclaration du ${c.declaredAt})` : ''}.\n\n1. Trouve sa déclaration de candidature (date, forme, source), son site de campagne, son programme / projet / livre / professions de foi, le programme récent de son parti, et ses 5 à 12 propositions phares.\n2. Pour CHACUN des thèmes ci-dessous (utilise exactement ces topic_id), liste ses positions concrètes et sourcées. Vise 2 à 6 positions par thème quand elles existent :\n${topicList}\n3. Indique ce qui le/la distingue des autres candidats déclarés (${names.filter(n => n !== c.name).join(', ')}), ses évolutions/contradictions et les points restés flous.\n\nRetourne un objet conforme au schéma. Inclus TOUS les topic_id listés dans « topics » (found=false si rien trouvé).`,
  { label: `dossier:${c.id}`, phase: 'Research', schema: DOSSIER },
))

const refreshTopics = C.topics.filter(t => !t.reuse || ['egalite', 'societe', 'ukraine_russie', 'proche_orient', 'defense', 'solidarites', 'agriculture', 'europe'].includes(t.id))
const refreshThunks = reused.map(c => () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : compléter le dossier de ${c.name} (${c.party}), candidat(e) à la primaire « Choisir 2027 » (vote les 9-10 et 16-17 octobre 2026), en vue de l'élection : ${C.name}. Son dossier existant est ${c.reuseDossier} (lis-le avec l'outil Read pour ne pas refaire ce qui existe). Recherche UNIQUEMENT ses positions sourcées sur ces thèmes, absents ou trop sommaires dans ce dossier (utilise exactement ces topic_id) :\n${refreshTopics.map(t => `- ${t.id} : ${t.label} — ${t.description}`).join('\n')}\nSignale aussi dans « updates » toute position du dossier existant qui a changé depuis le 2 octobre 2026.`,
  { label: `refresh:${c.id}`, phase: 'Research', schema: REFRESH },
))

const cleavageThunks = C.skipCleavages ? [] : C.groups.map(g => () => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : cartographier les LIGNES DE FRACTURE entre les candidats déclarés à l'élection ${C.name} sur la famille de thèmes « ${g.label} » : ${g.topicIds.map(id => { const t = C.topics.find(x => x.id === id); return `${id} (${t?.label} — ${t?.description})` }).join(' ; ')}.\nCandidats : ${names.join(', ')}${pendingNames.length ? ` ; et, en attente de la primaire de la gauche, ${pendingNames.join(', ')}` : ''}.\nPour chaque fracture, décris les approches en présence de façon NEUTRE (sans nom de parti ni étiquette « extrême ») et indique quels candidats sont de quel côté, avec des URLs de preuve. Relève aussi les points de consensus (sur lesquels presque tous sont d'accord : ces sujets discriminent peu). Utilise exactement ces topic_id.`,
  { label: `cleavages:${g.id}`, phase: 'Research', schema: CLEAVAGES },
))

const factsThunk = C.skipFacts ? [] : [() => agent(
  `${CONTEXT}\n\n${RULES}\n\nTA MISSION : vérifier les faits de base à la date du jour. 1) Le calendrier officiel de l'élection ${C.name} (tours, parrainages, liste officielle, campagne officielle), avec sources. 2) La liste des personnes ayant déclaré leur candidature SANS CONDITION, avec parti, date et source ; signale celles qui se sont déclarées, retirées ou ont levé une condition depuis la liste fournie : ${C.candidates.filter(c => !c.pendingPrimary).map(c => `${c.name} (${c.party}, ${c.declaredAt})`).join(' ; ')}. Candidats à la primaire de la gauche, en attente : ${pendingNames.join(', ')}.`,
  { label: 'facts-check', phase: 'Research', schema: FACTS },
)]

const results = await parallel([...dossierThunks, ...refreshThunks, ...cleavageThunks, ...factsThunk])
const done = results.filter(Boolean)
const missing = [...fresh, ...reused].map(c => c.id).filter((id, i) => !results[i])
if (missing.length) log(`Dossiers manquants : ${missing.join(', ')}`)
return { counts: { dossiers: fresh.length, refresh: reused.length, cleavages: cleavageThunks.length, done: done.length }, missing }
