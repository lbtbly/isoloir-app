export const meta = {
  name: 'choisir2027-bank-expansion',
  description: 'Mine official candidate documents for uncoded positions, design ~16 extra deep questions + fill unknowns, fact-check and neutrality-review them',
  phases: [
    { title: 'Mine', detail: 'one agent per candidate: professions de foi, programmes, campaign sites (WebFetch only)' },
    { title: 'Design', detail: 'new deep questions + gap fills on existing questions' },
    { title: 'Verify', detail: 'adversarial fact-check of every new attribution + neutrality review' },
  ],
}

const ROOT = '/Users/lambertbouley/Claude/Politique/primaire-de-gauche'
const CANDS = [
  { id: 'faure', name: 'Olivier Faure', docs: ['https://choisir2027.fr/wp-content/uploads/2026/09/Prof.foi_A4_OF-1.pdf', 'https://avecfaure2027.fr/mes-propositions', 'https://avecfaure2027.fr/la-loi-du-plus-juste', 'https://choisir2027.fr/candidat/olivier-faure/'] },
  { id: 'glucksmann', name: 'Raphaël Glucksmann', docs: ['https://choisir2027.fr/wp-content/uploads/2026/09/Profession-de-foi-RG.pdf', 'https://place-publique.eu/document/3Ari5O0s5O1L4iK1uyUhI0/pp-acte-un.pdf', 'https://place-publique.eu/posts/2fgDdljEIy36rgxBjRyiQZ/raphael-glucksmann-sa-lettre-aux-francais', 'https://choisir2027.fr/candidat/raphael-glucksmann/'] },
  { id: 'guedj', name: 'Jérôme Guedj', docs: ['https://choisir2027.fr/wp-content/uploads/2026/09/PF-Jerome-Guedj.pdf', 'https://www.jeromeguedj2027.fr/', 'https://www.jeromeguedj2027.fr/lettre', 'https://choisir2027.fr/candidat/jerome-guedj/'] },
  { id: 'maurel', name: 'Emmanuel Maurel', docs: ['https://choisir2027.fr/wp-content/uploads/2026/09/Profession-de-foi-Emmanuel-Maurel.pdf', 'https://emmanuel-maurel.fr/programme/', 'https://emmanuel-maurel.fr/lettre-aux-militants/', 'https://choisir2027.fr/candidat/emmanuel-maurel/'] },
  { id: 'royal', name: 'Ségolène Royal', docs: ['https://choisir2027.fr/wp-content/uploads/2026/09/Profession_de_foi_Segolene_Royal_2027.pdf', 'https://choisir2027.fr/candidat/segolene-royal/'] },
]
const IDS = CANDS.map(c => c.id)

const CONTEXT = `Contexte (2 octobre 2026). « Isoloir » est une boussole électorale NEUTRE pour la primaire « Choisir 2027 » (PS, Place publique, GRS ; vote 9-10 et 16-17 octobre 2026 ; site officiel https://choisir2027.fr). Candidats (identifiants) : ${CANDS.map(c => `${c.id} = ${c.name}`).join(' ; ')}.
La banque actuelle (questions, approches anonymes, attributions sourcées) est dans ${ROOT}/research/choisir-2027/bank.json (clés "bank" et "positions"). Les dossiers de recherche initiaux sont dans ${ROOT}/research/choisir-2027/dossier_<id>.json. Utilise Read ou Bash (node/jq) pour les lire.
Poids d'une attribution : 2 = approche principale / proposition explicite ; 1 = position compatible ou secondaire ; rejects = rejet explicite. Une attribution fausse est bien pire qu'une case inconnue : aucune supposition.
OUTILS WEB : WebSearch est INDISPONIBLE (quota épuisé). Charge WebFetch via ToolSearch ("select:WebFetch") et ne lis que des URLs connues (documents officiels listés, URLs des dossiers, liens trouvés dans ces pages). Les PDF se lisent avec WebFetch. Paraphrase ; citations < 15 mots.`

const MINED = {
  type: 'object',
  properties: {
    candidate: { type: 'string', enum: IDS },
    documents_read: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, ok: { type: 'boolean' }, note: { type: 'string' } }, required: ['url', 'ok'] } },
    positions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'un des topicId de bank.json ou un nouveau thème court (ex. "fin_de_vie", "culture", "outre_mer")' },
          position: { type: 'string', description: 'mesure ou position concrète, paraphrasée, chiffrée si possible' },
          already_coded: { type: 'string', description: 'id d\'approche de bank.json qui la code déjà pour ce candidat, ou "" si non codée' },
          nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          source_title: { type: 'string' }, source_url: { type: 'string' }, source_date: { type: 'string' },
        },
        required: ['topic', 'position', 'already_coded', 'nature', 'confidence', 'source_title', 'source_url'],
      },
    },
  },
  required: ['candidate', 'documents_read', 'positions'],
}

const POS = {
  type: 'object',
  properties: {
    candidate: { type: 'string', enum: IDS },
    approachId: { type: 'string' },
    weight: { type: 'integer', enum: [0, 1, 2] },
    rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
    sources: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' }, publisher: { type: 'string' } }, required: ['title', 'url'] } },
  },
  required: ['candidate', 'approachId', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources'],
}

const DESIGN = {
  type: 'object',
  properties: {
    newTopics: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, label: { type: 'string' }, description: { type: 'string' } }, required: ['id', 'label', 'description'] } },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' }, topicId: { type: 'string' }, tier: { type: 'string', enum: ['approfondi'] },
          prompt: { type: 'string' }, context: { type: 'string' }, rationale: { type: 'string' },
          approaches: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' }, external: { type: 'boolean' } }, required: ['id', 'text', 'external'] } },
          positions: { type: 'array', items: POS },
        },
        required: ['id', 'topicId', 'tier', 'prompt', 'rationale', 'approaches', 'positions'],
      },
    },
    gapFills: { type: 'array', items: { allOf: [POS], type: 'object', properties: { ...POS.properties, questionId: { type: 'string' } }, required: [...POS.required, 'questionId'] }, description: 'Nouvelles attributions sur des questions EXISTANTES où le candidat est aujourd\'hui inconnu' },
    notes: { type: 'string' },
  },
  required: ['questions', 'gapFills', 'notes'],
}

const CHECK = {
  type: 'object',
  properties: {
    questionId: { type: 'string' }, candidate: { type: 'string', enum: IDS }, approachId: { type: 'string' },
    verdict: { type: 'string', enum: ['confirmed', 'adjusted', 'refuted', 'unverifiable'] },
    weight: { type: 'integer', enum: [0, 1, 2] }, rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' }, sources: POS.properties.sources, note: { type: 'string' },
  },
  required: ['questionId', 'candidate', 'approachId', 'verdict', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources', 'note'],
}

phase('Mine')
const mined = (await parallel(CANDS.map(c => () => agent(
  `${CONTEXT}\n\nTA MISSION : extraire de façon exhaustive les positions programmatiques de ${c.name} à partir de ses DOCUMENTS OFFICIELS, pour enrichir le questionnaire approfondi.\n\nLis d'abord, dans cet ordre : ${c.docs.join(' ; ')}. Suis les liens utiles qu'ils contiennent (pages programme, propositions détaillées). Puis relis le dossier ${ROOT}/research/choisir-2027/dossier_${c.id}.json et la table positions["${c.id}"] de bank.json.\n\nListe TOUTES les mesures et positions concrètes trouvées (vise 40 à 80), en priorité celles qui ne sont PAS encore codées dans bank.json (already_coded = ""), et en particulier sur les sujets peu couverts : institutions (proportionnelle, 49.3, référendum, décentralisation), éducation et enseignement supérieur, logement, agriculture, territoires et outre-mer, numérique, culture et audiovisuel public, fin de vie, égalité femmes-hommes et violences sexuelles, droits LGBT, santé (déserts médicaux, santé mentale), assurance chômage, RSA et minima sociaux, temps de travail, services publics, budget de la défense, asile, droit de vote des étrangers, police et justice. N'invente rien ; chaque position a sa source exacte.`,
  { label: `mine:${c.id}`, phase: 'Mine', schema: MINED },
)))).filter(Boolean)
log(`${mined.length}/5 candidats minés, ${mined.reduce((n, m) => n + m.positions.length, 0)} positions`)

phase('Design')
const design = await agent(
  `${CONTEXT}\n\nTA MISSION : enrichir le questionnaire APPROFONDI (actuellement 34 questions ; objectif total ~50, donc environ 14 à 18 nouvelles questions) et combler les inconnues.\n\nDonnées : bank.json (questions existantes : ne crée AUCUN doublon), et les positions extraites des documents officiels ci-dessous.\n\nRÈGLES (identiques à la banque existante) :\n- Une nouvelle question n'est créée que si AU MOINS 3 candidats y ont une position sourcée (confidence high/medium) et qu'il existe un vrai désaccord (au moins 2 approches principales différentes). Sinon, n'en crée pas : la qualité prime sur le quota.\n- 3 à 5 approches anonymes : infinitif, longueurs comparables (±20 %), pas d'adjectif évaluatif, pas de nom de candidat, de parti organisateur (PS, Parti socialiste, Place publique, GRS, Gauche républicaine…), de slogan, de titre de livre ni de mesure-signature nommée (décrire la mesure). Au plus une approche external (portée par aucun candidat) par question. Sans point final.\n- Chaque candidat : au plus un poids 2 et un poids 1 par question ; inférence ≤ 1 ; sources exactes reprises des positions extraites (n'invente aucune URL).\n- Ids : nouvelles questions "<topicId>-x<n>" (n = 1, 2…), approches "<questionId>-<lettre>". Pour un nouveau thème, déclare-le dans newTopics (label court et neutre, description d'une phrase). context : une phrase factuelle commençant par « Aujourd'hui : ».\n- gapFills : pour les questions EXISTANTES de bank.json où un candidat est inconnu (aucune attribution), ajoute son attribution si une position extraite la soutient clairement. Respecte la limite (au plus un poids 2 et un poids 1 par candidat et par question). Précise questionId.\n\nPOSITIONS EXTRAITES :\n${JSON.stringify(mined)}`,
  { label: 'design:expansion', phase: 'Design', schema: DESIGN },
)
if (!design) return { mined, design: null }
log(`${design.questions.length} nouvelles questions, ${design.gapFills.length} compléments`)

phase('Verify')
const items = [
  ...design.questions.flatMap(q => q.positions.map(p => ({ ...p, questionId: q.id, approachText: q.approaches.find(a => a.id === p.approachId)?.text ?? '', prompt: q.prompt }))),
  ...design.gapFills.map(p => ({ ...p, approachText: '(voir bank.json)', prompt: '(question existante, voir bank.json)' })),
]
const half = Math.ceil(items.length / 2)
const batches = [items.slice(0, half), items.slice(half)].filter(b => b.length)

const [checks1, checks2, neutrality] = await parallel([
  ...batches.map((b, i) => () => agent(
    `${CONTEXT}\n\nTA MISSION : FACT-CHECKER ADVERSARIAL. Essaie de RÉFUTER chacune des attributions ci-dessous (lot ${i + 1}). Pour chacune, relis la ou les sources (WebFetch) et vérifie que le candidat porte (ou rejette) exactement CETTE approche, telle que formulée (pas de sur-interprétation, position 2025-2026, bonne nature, bon poids). Pour une question existante, lis la question et ses approches dans bank.json. Renvoie une entrée par attribution, avec les valeurs FINALES : confirmed / adjusted (corrige poids, nature, confiance, résumé) / refuted (sera supprimée) / unverifiable (source inaccessible et rien d'autre : baisse la confiance d'un cran). Résumé : une phrase factuelle et neutre.\n\nATTRIBUTIONS :\n${JSON.stringify(b)}`,
    { label: `factcheck:lot${i + 1}`, phase: 'Verify', schema: { type: 'object', properties: { checks: { type: 'array', items: CHECK } }, required: ['checks'] } },
  )),
  () => agent(
    `${CONTEXT}\n\nTA MISSION : RELECTEUR DE NEUTRALITÉ ET D'ANONYMAT des NOUVELLES questions ci-dessous (textes seulement). Cherche : vocabulaire connoté, formulations-signatures reconnaissables (slogan, chiffre emblématique d'un seul candidat), déséquilibre de longueur ou de précision entre approches, négations évitables, jargon, sigles non explicités, ponctuation française. Ne change JAMAIS le sens d'une approche. Les ids restent identiques. Vérifie aussi qu'aucune nouvelle question ne double une question existante de bank.json.\n\nNOUVELLES QUESTIONS :\n${JSON.stringify({ newTopics: design.newTopics ?? [], questions: design.questions.map(q => ({ id: q.id, topicId: q.topicId, prompt: q.prompt, context: q.context, approaches: q.approaches })) })}`,
    {
      label: 'neutrality:expansion', phase: 'Verify',
      schema: {
        type: 'object',
        properties: {
          edits: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, field: { type: 'string', enum: ['prompt', 'context', 'text', 'label', 'description'] }, newText: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'field', 'newText', 'reason'] } },
          duplicates: { type: 'array', items: { type: 'object', properties: { newId: { type: 'string' }, existingId: { type: 'string' }, why: { type: 'string' } }, required: ['newId', 'existingId', 'why'] } },
        },
        required: ['edits', 'duplicates'],
      },
    },
  ),
])

return { mined, design, checks: [...(checks1?.checks ?? []), ...(batches.length > 1 ? checks2?.checks ?? [] : [])], neutrality: batches.length > 1 ? neutrality : checks2 }
