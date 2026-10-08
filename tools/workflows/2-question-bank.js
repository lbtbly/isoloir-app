export const meta = {
  name: 'isoloir-question-bank',
  description: 'Design a neutral question bank and sourced stance matrix per topic family of an election (args = config.json), fact-check every attribution in packets of about 60, then left, centre and right reviewers, an anonymity reviewer, an arbiter and a completeness critic',
  phases: [
    { title: 'Design', detail: 'one designer per topic family (config.groups), reading groups/<family>.json' },
    { title: 'Fact-check', detail: 'adversarial re-reading of every attribution, packets of about 60 grouped by candidate' },
    { title: 'Review', detail: 'left, centre and right reviewers, anonymity reviewer (texts only), completeness critic' },
    { title: 'Arbitrage', detail: 'one neutral arbiter keeps at most one rewording per text' },
  ],
}

// Banque de questions d'une élection : questions neutres et matrice des positions sourcées, conçues par
// famille de thèmes ; vérification adversariale de chaque attribution par paquets d'environ 60 ; relecture
// par trois sensibilités politiques (gauche, centre, droite) et par un relecteur d'anonymat qui ne voit que
// les textes ; arbitrage des reformulations ; critique d'exhaustivité (y compris les grands sujets absents).
//
// USAGE (session principale), après 1-research.js, tools/extract-journal.mjs et tools/split-research.mjs
// (qui écrit research/<id>/groups/<famille>.json) :
//   Workflow({ scriptPath: 'tools/workflows/2-question-bank.js', args: { ...config, root: '<racine absolue du dépôt>' } })
//   où config = contenu de research/<id>/config.json. Ne pas passer args sous forme de chaîne JSON.
// Puis : copier le fichier de résultat du workflow (…/workflows/wf_<runId>.json) en
// research/<id>/question-bank-output.json, le relire avec tools/review-bank.mjs (--edits --critic --checks),
// consigner les arbitrages dans research/<id>/decisions.json (tierChanges, drops, step1, addApproaches…),
// écrire research/<id>/reuse.json avec tools/build-reuse.mjs (d'après les champs reuseOf), construire
// research/<id>/bank.json avec tools/build-pack.mjs, puis lancer 3-bank-expansion.js, qui le lit.
// Suite complète pour la présidentielle : research/presidentielle-2027/PIPELINE.md.
//
// ARGS : le contenu de config.json (id, name, contextDate, context, candidates, topics, groups, forbiddenTerms,
// forbiddenTermsAllow, quality), plus :
//   root       racine du dépôt, en chemin absolu (comme pour 4 à 7-….js) ; défaut « . », le dossier de travail
//              des agents. Le dossier de recherche est <root>/research/<id>
//   only       identifiants de familles (config.groups) à (re)concevoir seules ; la sortie ne contient que ces
//              familles (à fusionner à la main) et les statistiques ne portent que sur elles. Un identifiant de
//              candidat est refusé : un nouveau candidat se place sur la banque existante avec 6-add-candidate.js
//   target     { quick, bank } : questions visées par ce workflow (défaut : milieu de quality.quick, minimum de
//              quality.bank ; 3-bank-expansion.js complète). Une famille peut fixer groups[].quick et groups[].bank
//   reuseBank  banque d'une élection précédente (research/<autre>/bank.json, relatif à root) dont reprendre les questions encore
//              pertinentes ; défaut : bank.json du dossier des `reuseDossier`, s'il y en a
//   packetSize taille visée des paquets de vérification (défaut 60)
// Candidats `pendingPrimary` : jamais codés ici (6-add-candidate.js le fera) ; leurs dossiers servent à
// vérifier que chaque question leur offre une approche (champ indicatif pendingFit, jamais publié).
//
// SORTIE (résultat du workflow ; format lu sans changement par build-pack.mjs et review-bank.mjs) :
//   drafts[]   { group, topics (libellés de config), questions[{ id, topicId, tier, prompt, context, rationale,
//              approaches[{ id, text, external, reuseOf? }], positions[{ candidate, approachId, weight, rejects,
//              nature, confidence, summary, sources, verdict, note }], reuseOf?, pendingFit? }], consensus,
//              dropped, question_issues, fetch_log }
//   neutrality { edits (reformulations retenues par l'arbitre), recognizable, notes, proposals (reformulations de
//              thèmes, approches manquantes, sujets absents, attributions contestées : à trancher) }
//   critic     { issues, tierChanges, drops, missingSubjects, step1, summary }
//   stats      contrôles chiffrés des règles de config.quality, autoChecks, proposition d'étape 1 (step1Proposal)
//   reviews    sorties brutes des relecteurs (gauche, centre, droite, anonymat) et de l'arbitre
//   logs, missing
//
// COÛT ESTIMÉ (19 candidats codés, 9 familles, ≈ 1 400 attributions) : 9 concepteurs (≈ 0,5 M de jetons
// chacun), ≈ 25 paquets de vérification (≈ 0,3 M chacun), 4 relecteurs, 1 critique et 1 arbitre (≈ 0,2 M
// chacun) : ≈ 13 à 16 M de jetons, 2 à 3 h. Repère : la primaire (5 candidats, 6 familles, 14 agents) a
// coûté 3,5 M de jetons en 47 min.
// Historique : la banque de la primaire « Choisir 2027 » a été conçue avec la version précédente de ce script
// (git : tools/workflows/2-question-bank.js du premier commit), même format de sortie.

const C = args
if (!C || !Array.isArray(C.candidates) || !Array.isArray(C.topics) || !Array.isArray(C.groups) || !C.quality) {
  throw new Error('args = contenu de research/<id>/config.json (+ root) attendu, en objet JSON')
}
// Racine du dépôt (args.root ; défaut « . », le dossier de travail des agents) et dossier de recherche de l'élection
const REPO = String(C.root ?? '.').replace(/\/+$/, '') || '.'
const inRepo = path => (path.startsWith('/') || REPO === '.' ? path : `${REPO}/${path}`)
const RESEARCH = inRepo(`research/${C.id}`)
const Q = C.quality
const CODED = C.candidates.filter(c => !c.pendingPrimary)
const PENDING = C.candidates.filter(c => c.pendingPrimary)
const IDS = CODED.map(c => c.id)
const N = IDS.length
const PACKET = C.packetSize ?? 60
const FORBIDDEN = C.forbiddenTerms ?? []
const ALLOW = C.forbiddenTermsAllow ?? []
const topicById = new Map(C.topics.map(t => [t.id, t]))
const pct = x => `${Math.round(x * 100)} %`
// Nombre minimal de candidats pour une part donnée (0,85 × 19 → 17)
const need = share => Math.ceil(share * N - 1e-9)
// Candidats exemptés par le propriétaire de la seule couverture par candidat de l'étape 1 (quality.step1.exempt)
const EXEMPT1 = new Set(Q.step1?.exempt ?? [])
const STEP1_EXEMPT = EXEMPT1.size ? ` (sauf ${[...EXEMPT1].join(', ')}, exemptés de cette seule règle par le propriétaire)` : ''
const lastName = name => name.split(' ').slice(1).join(' ')
// Documents officiels listés dans la configuration (docs : URL ou { url }), puis la source de la déclaration
const docsOf = c => [...(c.docs ?? []).map(d => (typeof d === 'string' ? d : d?.url)), c.declarationSource?.url].filter(Boolean)
const dossiersOf = c => (c.reuseDossier ? [inRepo(c.reuseDossier), `${RESEARCH}/refresh_${c.id}.json`] : [`${RESEARCH}/dossier_${c.id}.json`])
if (!N) throw new Error('aucun candidat codé (tous pendingPrimary ?)')

const onlyList = Array.isArray(C.only) ? C.only : typeof C.only === 'string' ? [C.only] : []
const badOnly = onlyList.filter(x => !C.groups.some(g => g.id === x))
if (badOnly.length) {
  const cand = badOnly.some(x => C.candidates.some(c => c.id === x))
  throw new Error(`only : ${badOnly.join(', ')} n'est pas une famille de config.groups${cand ? ' (pour placer un candidat : 6-add-candidate.js)' : ''}`)
}
const GROUPS = C.groups.filter(g => !onlyList.length || onlyList.includes(g.id))

// Quotas par famille, au prorata du nombre de thèmes (plus forts restes ; une famille d'un seul thème, comme
// l'immigration, compte pour deux : c'est un grand sujet à elle seule), sauf quotas fixés dans config.groups
function apportion(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map(w => (total * w) / sum)
  const out = raw.map(Math.floor)
  let rest = total - out.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1])
  for (let k = 0; rest > 0; k++, rest--) out[order[k % order.length][1]]++
  return out
}
const TARGET = { quick: C.target?.quick ?? Math.round((Q.quick.min + Q.quick.max) / 2), bank: C.target?.bank ?? Q.bank.min }
const sizes = C.groups.map(g => Math.max(2, g.topicIds.length))
const quickQuota = apportion(TARGET.quick, sizes)
const bankQuota = apportion(TARGET.bank, sizes)
const QUOTA = new Map(C.groups.map((g, i) => [g.id, { quick: g.quick ?? quickQuota[i], bank: Math.max(g.bank ?? bankQuota[i], g.quick ?? quickQuota[i]) }]))
const groupTopics = g => g.topicIds.map(id => topicById.get(id)).filter(Boolean).map(t => ({ id: t.id, label: t.label, description: t.description }))

const REUSE_FROM = C.reuseBank ?? C.candidates.find(c => c.reuseDossier)?.reuseDossier.replace(/[^/]+$/, 'bank.json') ?? null
const REUSE_BANK = REUSE_FROM ? inRepo(REUSE_FROM) : null
const REUSE_TOPICS = C.topics.filter(t => t.reuse).map(t => t.id)

// ---------------------------------------------------------------------------------------------------------
// Consignes communes

const CONTEXT = `Contexte (date du jour : ${C.contextDate}). ${C.context}

Nous construisons « Isoloir », une boussole électorale NEUTRE et 100 % locale, pour l'élection : ${C.name}. ${N} candidats y sont codés ; identifiants à utiliser : ${CODED.map(c => `${c.id} = ${c.name} (${c.party})`).join(' ; ')}.${PENDING.length ? `\nCandidats en attente de désignation, NON codés dans cette banque (un autre workflow les placera plus tard sur les mêmes questions) : ${PENDING.map(c => `${c.id} = ${c.name} (${c.party} ; dossiers : ${dossiersOf(c).join(' + ')})`).join(' ; ')}.` : ''}
Un chemin de fichier relatif l'est à la racine du dépôt (ton dossier de travail).

Fonctionnement : chaque question propose ${Q.bank.approachesMin} à ${Q.bank.approachesMax} « approches » ANONYMES (on ne dit jamais qui les porte). Pour chaque approche, l'électeur dit pas d'accord (−1), sans avis (0) ou d'accord (+1), et peut tracer une ligne rouge (les candidats qui portent l'approche sont classés après les autres). Score d'un candidat sur une question : x = Σ v·u / Σ |v|, ramené entre 0 et 1 par s = (x + 1) / 2, avec v = 2 pour son approche principale / proposition explicite, 1 pour une position compatible ou secondaire, −1 pour un rejet explicite (rejects). Une attribution de confiance low ne compte pas, une inférence compte au plus 1. Position absente = inconnue (exclue du calcul pour ce candidat). Après le score, l'application RÉVÈLE qui porte quelle approche, avec le résumé et les sources : une attribution fausse est bien pire qu'une case inconnue.`

const quote = s => `« ${s} »`
const DESIGN_RULES = `RÈGLES DE CONCEPTION (littérature sur les boussoles électorales : Wahl-O-Mat, smartvote, StemWijzer, Walgrave 2009, Kamoen 2017/2019, Berdoz et al. 2025), adaptées à une élection à ${N} candidats aux programmes inégaux. Un candidat est « connu » sur une question s'il y a une attribution de poids 1 ou 2, de confiance high ou medium ; son « approche principale » est celle de poids 2.
1. Chaque question porte sur une vraie ligne de fracture entre candidats. Écarte les sujets où presque tous ont la même approche principale : liste-les dans "consensus" (affichés comme points communs, sans score). Aucune approche ne doit réunir plus de ${pct(Q.bank.maxMainShare)} des approches principales connues d'une question : sinon, scinde l'approche majoritaire selon ce qui sépare réellement ses partisans (méthode, ampleur chiffrée, calendrier, financement), ou passe le sujet en consensus.
2. ${Q.bank.approachesMin} à ${Q.bank.approachesMax} approches par question : de vraies alternatives de politique publique, aussi exclusives que possible (pas des variantes d'intensité de la même mesure). Ensemble, elles couvrent tout l'éventail des positions documentées, y compris les positions de rupture (sortie d'un traité ou d'une alliance, abrogation, refonte complète) quand des candidats les portent : un électeur de n'importe quelle sensibilité doit pouvoir s'y retrouver.
3. Chaque candidat a AU PLUS une approche de poids 2 et AU PLUS une de poids 1 par question. Une même approche peut être portée par plusieurs candidats. Au plus UNE approche "external" (portée par aucun candidat codé : statu quo ou alternative crédible défendue ailleurs) par question, seulement si elle aide l'électeur à exprimer une préférence réelle.
4. NEUTRALITÉ ET ANONYMAT des textes (prompt, context, approches) :
   - jamais de nom de candidat ni de parti, de slogan, de titre de livre, ni de mesure connue sous un nom propre ou une marque (ex. « taxe Zucman » → « impôt minimum de 2 % par an sur les patrimoines de plus de 100 millions d'euros ») ; termes interdits (mots entiers) : ${FORBIDDEN.map(quote).join(', ')}${ALLOW.length ? ` ; ${ALLOW.map(quote).join(', ')} ne sont admis que dans leur sens courant, jamais pour désigner un parti` : ''} ;
   - aucun vocabulaire militant ou disqualifiant, d'aucun bord (ex. « ultra-riches », « assistanat », « submersion », « wokisme », « théorie du genre », « casse sociale », « écologie punitive ») : décrire la mesure, pas le camp ; c'est particulièrement délicat sur les sujets de mœurs, de genre, d'identité et de mémoire ;
   - approches à l'infinitif, même structure grammaticale, longueurs comparables (±20 %), même niveau de précision (si une approche est chiffrée, les autres le sont aussi, ou aucune), sans point final ;
   - aucun adjectif évaluatif (juste, courageux, dangereux, ambitieux…) ; forme positive plutôt que négation quand c'est possible ;
   - langage clair, sigles explicités, pas de jargon ; 120 caractères par approche si possible, 180 au plus ;
   - prompt : une question courte et neutre (« Comment financer… ? », « Quelle politique… ? ») ; context : une phrase factuelle et neutre sur la situation actuelle, commençant par « Aujourd'hui : » (facultatif). Une question ne présuppose pas le diagnostic d'un camp.
5. NIVEAUX. Tier "essentiel" (questionnaire rapide, ${Q.quick.min} à ${Q.quick.max} questions pour toute la banque) : seulement les fractures les plus importantes de l'élection ET connues pour au moins ${need(Q.quick.minKnownShare)} des ${N} candidats (${pct(Q.quick.minKnownShare)}). Sur tout le questionnaire rapide, chaque candidat devra être connu sur au moins ${pct(Q.quick.minCandidateShare)} des questions, avec au plus ${Q.quick.maxSpread} questions d'écart entre le mieux et le moins bien couvert : à importance égale, préfère les fractures où les candidats aux programmes les plus minces sont connus. ${Q.step1.count} questions essentielles formeront l'étape 1 (premier dépouillement) : chacune connue pour au moins ${need(Q.step1.minKnownShare)} candidats (${pct(Q.step1.minKnownShare)}), chaque candidat connu sur au moins ${Q.step1.minKnownPerCandidate} d'entre elles${STEP1_EXEMPT} ; écris « étape 1 possible » dans rationale quand une question s'y prête (grande fracture, couverture très large). Tier "approfondi" : le reste ; les inconnues y sont tolérées, mais sur toute la banque (${Q.bank.min} à ${Q.bank.max} questions) chaque candidat devra être connu sur au moins ${pct(Q.bank.minCandidateShare)} des questions : n'empile pas les questions que seuls quelques candidats abordent.
6. DISTINCTION : chaque paire de candidats doit différer sur l'approche principale d'au moins une question de la banque. Cherche activement ce qui sépare des candidats proches (même famille politique, programmes voisins) : méthode, rythme, ampleur, financement, alliances, rapport aux institutions et à l'Union européenne.
7. ÉQUILIBRE : couvre les thèmes prioritaires de chaque candidat et de chaque sensibilité (propriété des enjeux), pour que chacun ait des questions où son approche principale est distinctive ; aucune sensibilité ne doit être sur-représentée par le choix des sujets, ni désavantagée par leur cadrage.
8. ATTRIBUTIONS (positions) — règle d'or : une position seulement si une source du dossier la soutient explicitement.
   - candidate : identifiant parmi ${IDS.join(', ')} ;
   - weight : 2, 1, ou 0 (0 uniquement avec rejects=true pour un rejet explicite) ;
   - nature : proposition (mesure de programme / profession de foi), declaration (déclaration publique, débat, interview), inference (vote parlementaire, motion signée, programme du parti, déduction) — une inférence ne peut pas dépasser le poids 1 ;
   - confidence : high (source primaire ou grand média, claire), medium (source secondaire fiable, formulation moins nette, ou programme récent 2025-2026 du propre parti du candidat), low (source faible ou non officielle, programme de parti antérieur à 2025 ou porté par un autre candidat : à éviter, la position ne comptera pas) ;
   - summary : résumé factuel et neutre en français, 1 phrase, ce que le candidat propose ou dit (affiché à la révélation) ;
   - sources : 1 à 3 sources {title, url, date (AAAA-MM-JJ si connue), publisher} reprises EXACTEMENT du dossier (n'invente aucune URL).
9. Identifiants : question id = "<topicId>-<n>" (n = 1, 2, … par thème) ; approche id = "<questionId>-<lettre>" (a, b, c…). topicId parmi les thèmes de la famille.${PENDING.length ? `
10. CANDIDATS EN ATTENTE (${PENDING.map(c => c.id).join(', ')}) : ne code AUCUNE position pour eux. Lis leurs dossiers : chaque question doit offrir une approche où chacun se retrouverait quand son dossier documente une position ; indique-la dans pendingFit (indication non vérifiée, jamais publiée), ou ajoute l'approche qui manque.` : ''}${REUSE_BANK ? `
11. BANQUE PRÉCÉDENTE : ${REUSE_BANK} (bank.questions, d'une élection antérieure). Sur les thèmes réutilisables (${REUSE_TOPICS.join(', ')}), si une de ses questions porte sur une fracture toujours pertinente entre les candidats de CETTE élection, reprends son énoncé et ses approches à l'identique ou presque, complète les approches pour couvrir tout l'éventail, et indique reuseOf (id de la question reprise) ; sur chaque approche reprise mot pour mot ou presque, indique reuseOf (id de l'approche reprise). Ne force pas : une question pensée pour un débat interne à un camp doit être refondue. N'en reprends jamais les attributions : code les positions à partir des dossiers de cette élection.` : ''}`

// ---------------------------------------------------------------------------------------------------------
// Schémas

const SOURCES = {
  type: 'array',
  items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' }, publisher: { type: 'string' } }, required: ['title', 'url'] },
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
    sources: SOURCES,
  },
  required: ['candidate', 'approachId', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources'],
}
const QUESTION_PROPS = {
  id: { type: 'string' },
  topicId: { type: 'string', enum: C.topics.map(t => t.id) },
  tier: { type: 'string', enum: ['essentiel', 'approfondi'] },
  prompt: { type: 'string' },
  context: { type: 'string' },
  rationale: { type: 'string', description: 'Pourquoi cette question discrimine, qui est où, inconnues, « étape 1 possible »' },
  approaches: {
    type: 'array',
    items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' }, external: { type: 'boolean' }, reuseOf: { type: 'string', description: 'id de l\'approche reprise de la banque précédente' } }, required: ['id', 'text', 'external'] },
  },
  positions: { type: 'array', items: POS },
  reuseOf: { type: 'string', description: 'id de la question reprise de la banque précédente' },
}
if (PENDING.length) {
  QUESTION_PROPS.pendingFit = {
    type: 'array',
    description: 'Indicatif, non publié : approche où se retrouverait chaque candidat en attente dont le dossier documente une position',
    items: { type: 'object', properties: { candidate: { type: 'string', enum: PENDING.map(c => c.id) }, approachId: { type: 'string' } }, required: ['candidate', 'approachId'] },
  }
}
const DESIGN_SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    questions: { type: 'array', items: { type: 'object', properties: QUESTION_PROPS, required: ['id', 'topicId', 'tier', 'prompt', 'rationale', 'approaches', 'positions'] } },
    consensus: { type: 'array', items: { type: 'object', properties: { topicId: { type: 'string' }, text: { type: 'string' } }, required: ['topicId', 'text'] } },
    dropped: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, why: { type: 'string' } }, required: ['what', 'why'] } },
  },
  required: ['group', 'questions', 'consensus', 'dropped'],
}
const CHECK = {
  type: 'object',
  properties: {
    questionId: { type: 'string' },
    candidate: { type: 'string', enum: IDS },
    approachId: { type: 'string', description: 'Approche FINALE' },
    fromApproachId: { type: 'string', description: 'Approche du brouillon, seulement si tu déplaces l\'attribution' },
    verdict: { type: 'string', enum: ['confirmed', 'adjusted', 'refuted', 'unverifiable'] },
    weight: { type: 'integer', enum: [0, 1, 2] },
    rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
    sources: SOURCES,
    note: { type: 'string', description: 'Ce que la source dit réellement, ou pourquoi on ajuste ou réfute' },
  },
  required: ['questionId', 'candidate', 'approachId', 'verdict', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources', 'note'],
}
const FC_SCHEMA = {
  type: 'object',
  properties: {
    checks: { type: 'array', items: CHECK, description: 'UNE entrée par attribution du paquet, avec les valeurs finales' },
    additions: { type: 'array', items: CHECK, description: 'Positions manquantes mais sourcées des candidats du paquet (verdict "confirmed")' },
    question_issues: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, issue: { type: 'string' } }, required: ['questionId', 'issue'] } },
    fetch_log: { type: 'string', description: 'URLs lues, échecs de chargement' },
  },
  required: ['checks', 'additions', 'question_issues'],
}
const EDIT = {
  type: 'object',
  properties: {
    id: { type: 'string', description: 'id de question, d\'approche ou de thème' },
    field: { type: 'string', enum: ['prompt', 'context', 'text', 'label', 'description'] },
    newText: { type: 'string' },
    reason: { type: 'string' },
  },
  required: ['id', 'field', 'newText', 'reason'],
}
const LENS_SCHEMA = {
  type: 'object',
  properties: {
    edits: { type: 'array', items: EDIT },
    missingApproaches: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, text: { type: 'string' }, why: { type: 'string' } }, required: ['questionId', 'text', 'why'] } },
    topicGaps: { type: 'array', items: { type: 'object', properties: { subject: { type: 'string' }, topicId: { type: 'string' }, why: { type: 'string' } }, required: ['subject', 'why'] } },
    positionIssues: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, candidate: { type: 'string' }, approachId: { type: 'string' }, issue: { type: 'string' } }, required: ['questionId', 'issue'] } },
    notes: { type: 'string' },
  },
  required: ['edits', 'missingApproaches', 'topicGaps', 'positionIssues', 'notes'],
}
const ANON_SCHEMA = {
  type: 'object',
  properties: {
    edits: { type: 'array', items: EDIT },
    recognizable: { type: 'array', items: { type: 'object', properties: { approachId: { type: 'string' }, guessedCandidate: { type: 'string' }, why: { type: 'string' } }, required: ['approachId', 'why'] } },
    notes: { type: 'string' },
  },
  required: ['edits', 'recognizable', 'notes'],
}
const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, questionId: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'issue', 'fix'] } },
    tierChanges: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, newTier: { type: 'string', enum: ['essentiel', 'approfondi'] }, why: { type: 'string' } }, required: ['questionId', 'newTier', 'why'] } },
    drops: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, why: { type: 'string' } }, required: ['questionId', 'why'] } },
    missingSubjects: { type: 'array', items: { type: 'object', properties: { subject: { type: 'string' }, why: { type: 'string' }, candidatesWithPositions: { type: 'array', items: { type: 'string' } }, proposal: { type: 'string', description: 'Thème existant ou nouveau thème, question type' } }, required: ['subject', 'why', 'proposal'] } },
    step1: { type: 'object', properties: { questionIds: { type: 'array', items: { type: 'string' } }, why: { type: 'string' } }, required: ['questionIds', 'why'] },
    summary: { type: 'string' },
  },
  required: ['issues', 'tierChanges', 'drops', 'missingSubjects', 'step1', 'summary'],
}
const ARB_SCHEMA = {
  type: 'object',
  properties: {
    edits: { type: 'array', items: EDIT, description: 'Au plus une version finale par texte (id + field)' },
    rejected: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, field: { type: 'string' }, why: { type: 'string' } }, required: ['id', 'field', 'why'] } },
    notes: { type: 'string' },
  },
  required: ['edits', 'rejected', 'notes'],
}

// ---------------------------------------------------------------------------------------------------------
// Outils de calcul (aucun accès aux fichiers : tout se fait sur les sorties des agents)

const logs = []
const down = c => (c === 'high' ? 'medium' : 'low')
const known = q => new Set(q.positions.filter(p => p.weight > 0 && p.confidence !== 'low' && IDS.includes(p.candidate)).map(p => p.candidate))
function mains(q) {
  const m = new Map()
  for (const p of q.positions) {
    if (p.weight === 2 && p.nature !== 'inference' && p.confidence !== 'low' && IDS.includes(p.candidate) && !m.has(p.candidate)) m.set(p.candidate, p.approachId)
  }
  return m
}

// Brouillon d'une famille : thèmes de la configuration, positions sans approche ou hors candidats écartées
function sanitize(draft, g) {
  draft.group = g.id
  draft.topics = groupTopics(g)
  const allowed = new Set(g.topicIds)
  draft.questions = draft.questions ?? []
  for (const q of draft.questions) {
    if (!allowed.has(q.topicId)) logs.push(`${g.id} : ${q.id} sur le thème ${q.topicId}, hors famille`)
    const ids = new Set(q.approaches.map(a => a.id))
    q.positions = (q.positions ?? []).filter(p => {
      if (!IDS.includes(p.candidate)) { logs.push(`hors candidats codés ${q.id} ${p.candidate}`); return false }
      if (!ids.has(p.approachId)) { logs.push(`orphan ${q.id} ${p.candidate} ${p.approachId}`); return false }
      return true
    })
  }
  return draft
}

// Paquets d'environ PACKET attributions, regroupées par candidat (un vérificateur lit ainsi les sources d'un
// même candidat une seule fois) ; chaque candidat codé appartient à un paquet, même sans attribution, pour que
// son vérificateur cherche ses positions manquantes.
function packets(draft) {
  const byCand = new Map(IDS.map(id => [id, []]))
  for (const q of draft.questions) for (const p of q.positions) byCand.get(p.candidate)?.push({ questionId: q.id, ...p })
  const total = [...byCand.values()].reduce((n, l) => n + l.length, 0)
  const bins = Array.from({ length: Math.max(1, Math.round(total / PACKET)) }, () => ({ cands: [], items: [] }))
  const order = [...byCand.entries()].sort((a, b) => b[1].length - a[1].length || IDS.indexOf(a[0]) - IDS.indexOf(b[0]))
  for (const [id, items] of order) {
    const bin = bins.reduce((m, b) => (b.items.length < m.items.length ? b : m), bins[0])
    bin.cands.push(id)
    bin.items.push(...items)
  }
  return bins
}

const finalOf = (c, verdict) => ({
  candidate: c.candidate, approachId: c.approachId, weight: c.weight, rejects: c.rejects, nature: c.nature,
  confidence: c.confidence, summary: c.summary, sources: c.sources, verdict, note: c.note,
})

// Applique les vérifications au brouillon : refuted → supprimée, adjusted → corrigée (éventuellement déplacée),
// sans vérification → confiance abaissée d'un cran ; additions → ajoutées (verdict "added")
function mergeChecks(draft, fcs, g) {
  const ok = fcs.filter(Boolean)
  if (ok.length < fcs.length) logs.push(`${g.id} : ${fcs.length - ok.length} paquet(s) de vérification perdu(s)`)
  const checks = ok.flatMap(fc => fc.checks ?? [])
  const additions = ok.flatMap(fc => fc.additions ?? [])
  const qIds = new Set(draft.questions.map(q => q.id))
  for (const c of [...checks, ...additions]) if (!qIds.has(c.questionId)) logs.push(`${g.id} : vérification sur une question inconnue ${c.questionId}`)
  for (const q of draft.questions) {
    const approaches = new Set(q.approaches.map(a => a.id))
    const byOrig = new Map()
    for (const c of checks.filter(x => x.questionId === q.id)) byOrig.set(`${c.candidate}|${c.fromApproachId || c.approachId}`, c)
    const out = []
    for (const p of q.positions) {
      const k = `${p.candidate}|${p.approachId}`
      const c = byOrig.get(k)
      if (c) byOrig.delete(k)
      if (!c || !approaches.has(c.approachId)) {
        out.push({ ...p, confidence: down(p.confidence), verdict: 'unchecked', note: c ? `déplacement vers une approche inconnue (${c.approachId}) ignoré` : 'non vérifiée : confiance abaissée d\'un cran' })
        logs.push(`unchecked ${q.id} ${k}`)
        continue
      }
      if (c.verdict === 'refuted') { logs.push(`refuted ${q.id} ${k} : ${c.note}`); continue }
      out.push(finalOf(c, c.verdict))
    }
    // Vérifications sans attribution correspondante dans le brouillon, et ajouts : traités comme des ajouts
    for (const c of [...byOrig.values(), ...additions.filter(x => x.questionId === q.id)]) {
      if (c.verdict === 'refuted') continue
      if (!approaches.has(c.approachId)) { logs.push(`addition on unknown approach ${q.id} ${c.approachId}`); continue }
      if (out.some(p => p.candidate === c.candidate && p.approachId === c.approachId)) continue
      out.push(finalOf(c, 'added'))
      logs.push(`added ${q.id} ${c.candidate} ${c.approachId}`)
    }
    q.positions = out
  }
  draft.question_issues = ok.flatMap(fc => fc.question_issues ?? [])
  draft.fetch_log = ok.map(fc => fc.fetch_log ?? '').filter(Boolean).join('\n')
  return draft
}

// Contrôles automatiques des textes : termes interdits, noms, longueurs, nombre d'approches
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const NAME_TERMS = [...new Set([
  ...FORBIDDEN,
  ...C.candidates.flatMap(c => [c.name, lastName(c.name)]),
  ...C.candidates.map(c => c.party).filter(p => p && !ALLOW.includes(p) && !/^sans /i.test(p)),
])].filter(t => t && t.length > 1)
const TERM_RES = NAME_TERMS.map(t => [t, new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, 'u')])
function autoChecks(questions) {
  const out = []
  for (const q of questions) {
    for (const [field, text] of [['prompt', q.prompt], ['context', q.context ?? ''], ...q.approaches.map(a => [a.id, a.text])]) {
      for (const [t, re] of TERM_RES) if (re.test(text)) out.push(`${q.id} ${field} : terme interdit ou nom propre « ${t} »`)
    }
    const lens = q.approaches.map(a => a.text.length)
    if (lens.some(n => n > 180)) out.push(`${q.id} : approche de plus de 180 caractères`)
    if (lens.length && Math.max(...lens) > 1.5 * Math.min(...lens)) out.push(`${q.id} : longueurs d'approches de ${Math.min(...lens)} à ${Math.max(...lens)} caractères`)
    if (q.approaches.length < Q.bank.approachesMin || q.approaches.length > Q.bank.approachesMax) out.push(`${q.id} : ${q.approaches.length} approches (règle : ${Q.bank.approachesMin} à ${Q.bank.approachesMax})`)
    if (q.approaches.filter(a => a.external).length > 1) out.push(`${q.id} : plusieurs approches external`)
    for (const a of q.approaches) if (/\.\s*$/.test(a.text)) out.push(`${a.id} : point final`)
  }
  return out
}

// Proposition d'étape 1, gloutonne et déterministe : questions essentielles assez connues, en servant d'abord
// les candidats encore sous le minimum, puis la couverture, la diversité des approches principales et des thèmes
function proposeStep1(quick) {
  const S = Q.step1
  const eligible = quick.filter(q => known(q).size >= need(S.minKnownShare))
  const chosen = []
  const cover = Object.fromEntries(IDS.map(id => [id, 0]))
  const topicUse = new Map()
  while (chosen.length < S.count) {
    let best = null
    let bestScore = -Infinity
    for (const q of eligible) {
      if (chosen.includes(q)) continue
      const k = known(q)
      const lagging = IDS.filter(id => !EXEMPT1.has(id) && k.has(id) && cover[id] < S.minKnownPerCandidate).length
      const score = lagging * 100 + k.size * 10 + new Set(mains(q).values()).size * 3 - (topicUse.get(q.topicId) ?? 0) * 40
      if (score > bestScore) { best = q; bestScore = score }
    }
    if (!best) break
    chosen.push(best)
    for (const id of known(best)) cover[id]++
    topicUse.set(best.topicId, (topicUse.get(best.topicId) ?? 0) + 1)
  }
  const under = IDS.filter(id => !EXEMPT1.has(id) && cover[id] < S.minKnownPerCandidate)
  return { questionIds: chosen.map(q => q.id), eligible: eligible.length, ok: chosen.length === S.count && !under.length, perCandidate: cover, candidatesUnder: under }
}

// Statistiques des règles de config.quality sur la banque fusionnée
function computeStats(qs) {
  const quick = qs.filter(q => q.tier === 'essentiel')
  const per = Object.fromEntries(IDS.map(id => [id, { known: 0, knownQuick: 0, main: 0, distinctive: 0 }]))
  const rows = []
  const mainsByQ = qs.map(mains)
  qs.forEach((q, i) => {
    const k = known(q)
    const m = mainsByQ[i]
    const counts = new Map()
    for (const a of m.values()) counts.set(a, (counts.get(a) ?? 0) + 1)
    const top = Math.max(0, ...counts.values())
    for (const id of IDS) {
      if (k.has(id)) { per[id].known++; if (q.tier === 'essentiel') per[id].knownQuick++ }
      const a = m.get(id)
      if (a) { per[id].main++; if (counts.get(a) === 1) per[id].distinctive++ }
    }
    rows.push({ id: q.id, tier: q.tier, known: k.size, mains: m.size, distinctMains: counts.size, mainShare: m.size ? Math.round((top / m.size) * 100) / 100 : null, approaches: q.approaches.length })
  })
  const pairs = []
  for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) {
    const [a, b] = [IDS[i], IDS[j]]
    if (!mainsByQ.some(m => m.has(a) && m.has(b) && m.get(a) !== m.get(b))) pairs.push(`${a}/${b}`)
  }
  const kq = IDS.map(id => per[id].knownQuick)
  const pendingNoFit = Object.fromEntries(PENDING.map(c => [c.id, qs.filter(q => !(q.pendingFit ?? []).some(f => f.candidate === c.id && f.approachId)).map(q => q.id)]))
  const perTopic = {}
  for (const q of qs) {
    const t = (perTopic[q.topicId] ??= { essentiel: 0, approfondi: 0 })
    t[q.tier === 'essentiel' ? 'essentiel' : 'approfondi']++
  }
  return {
    candidates: N,
    thresholds: { quickKnown: need(Q.quick.minKnownShare), step1Known: need(Q.step1.minKnownShare), quickPerCandidate: Math.ceil(Q.quick.minCandidateShare * quick.length - 1e-9), bankPerCandidate: Math.ceil(Q.bank.minCandidateShare * qs.length - 1e-9) },
    essentiel: quick.length,
    approfondi: qs.length - quick.length,
    rules: {
      bankCount: { value: qs.length, min: Q.bank.min, max: Q.bank.max, note: '3-bank-expansion.js complète la banque' },
      quickCount: { value: quick.length, min: Q.quick.min, max: Q.quick.max, ok: quick.length >= Q.quick.min && quick.length <= Q.quick.max },
      quickUnderKnown: rows.filter(r => r.tier === 'essentiel' && r.known < need(Q.quick.minKnownShare)).map(r => `${r.id} (${r.known}/${N})`),
      quickCandidatesUnder: IDS.filter(id => per[id].knownQuick < Math.ceil(Q.quick.minCandidateShare * quick.length - 1e-9)),
      quickSpread: { value: kq.length ? Math.max(...kq) - Math.min(...kq) : 0, max: Q.quick.maxSpread },
      bankCandidatesUnder: IDS.filter(id => per[id].known < Math.ceil(Q.bank.minCandidateShare * qs.length - 1e-9)),
      approachesOutOfRange: rows.filter(r => r.approaches < Q.bank.approachesMin || r.approaches > Q.bank.approachesMax).map(r => `${r.id} (${r.approaches})`),
      dominated: rows.filter(r => r.mainShare !== null && r.mainShare > Q.bank.maxMainShare).map(r => `${r.id} (${Math.round(r.mainShare * 100)} % de ${r.mains})`),
      nonDiscriminating: rows.filter(r => r.distinctMains <= 1).map(r => r.id),
      undistinguishedPairs: pairs,
    },
    perCandidate: per,
    perTopic,
    questions: rows,
    pendingNoFit,
    step1Proposal: proposeStep1(quick),
  }
}

// ---------------------------------------------------------------------------------------------------------
// Conception puis vérification, famille par famille (pas de barrière entre familles)

log(`${GROUPS.length} famille(s), ${N} candidats codés${PENDING.length ? `, ${PENDING.length} en attente` : ''} ; visés : ${TARGET.quick} essentielles, ${TARGET.bank} au total`)
phase('Design')

const checkPacket = (draft, g, pk, i, n) => {
  const cands = pk.cands.map(id => CODED.find(c => c.id === id))
  const prompt = `${CONTEXT}

TA MISSION : VÉRIFICATEUR ADVERSARIAL, famille « ${g.label} », paquet ${i + 1}/${n} : les attributions de ${cands.map(c => c.name).join(', ')}. Essaie de RÉFUTER chacune ; par défaut, sois sceptique.

Outils : charge WebFetch via ToolSearch ("select:WebFetch"). WebSearch est à éviter (quota partagé avec la recherche) : seulement si une source citée est inaccessible et qu'il faut une autre source pour la même affirmation. Lis les URLs citées, les autres URLs de ces candidats dans ${RESEARCH}/groups/${g.id}.json (Read, ou Bash avec node/jq), leurs dossiers (${cands.map(c => dossiersOf(c).join(' + ')).join(' ; ')} : site de campagne, programme_sources) et leurs documents de référence${cands.some(c => docsOf(c).length) ? ` (${cands.filter(c => docsOf(c).length).map(c => `${c.id} : ${docsOf(c).join(', ')}`).join(' ; ')})` : ''}. Lis chaque URL distincte une seule fois et vérifie toutes les attributions qui la citent.

Pour CHAQUE attribution ci-dessous, renvoie une entrée dans "checks" avec les valeurs FINALES :
- confirmed : la source soutient clairement que le candidat porte (ou rejette) CETTE approche telle que formulée ;
- adjusted : la source soutient une version plus faible ou différente → corrige weight (2→1), nature, confidence, summary, ou déplace vers une autre approche de la même question (nouvelle approche dans approachId, ancienne dans fromApproachId ; explique dans note) ;
- refuted : la source ne dit pas ça, dit le contraire, ou concerne quelqu'un d'autre → l'attribution sera supprimée ;
- unverifiable : l'URL ne se charge pas (paywall, erreur) ET aucune autre source accessible ne confirme → baisse confidence d'un cran (high→medium, medium→low).
Vérifie aussi : correspondance exacte entre l'approche et ce que dit le candidat (pas de sur-interprétation) ; date récente (2025-2026) — un programme de parti antérieur à 2025, ou porté par un autre candidat, n'est qu'une inférence de confiance low — ; nature (une inférence ne dépasse pas le poids 1) ; au plus un poids 2 et un poids 1 par candidat et par question ; summary en une phrase factuelle et neutre, sans adjectif évaluatif.

Dans "additions", ajoute les positions MANQUANTES de ces candidats (${pk.cands.join(', ')}) que tu trouves sourcées (fichier de la famille, dossiers, documents officiels) sur les questions ci-dessous où ils sont inconnus, en priorité les questions "essentiel" : verdict "confirmed", sources exactes, jamais d'URL inventée. Dans "question_issues", signale les problèmes de formulation, d'exclusivité des approches ou d'anonymat.

QUESTIONS DE LA FAMILLE :
${JSON.stringify(draft.questions.map(q => ({ id: q.id, tier: q.tier, prompt: q.prompt, approaches: q.approaches.map(a => `${a.id}${a.external ? ' (external)' : ''} : ${a.text}`) })), null, 1)}

ATTRIBUTIONS À VÉRIFIER (${pk.items.length}) :
${JSON.stringify(pk.items)}`
  const label = `factcheck:${g.id}:${i + 1}`
  return agent(prompt, { label, phase: 'Fact-check', schema: FC_SCHEMA })
    .then(r => r ?? agent(prompt, { label: `${label}:reprise`, phase: 'Fact-check', schema: FC_SCHEMA }))
}

const designed = await pipeline(
  GROUPS,
  g => {
    const quota = QUOTA.get(g.id)
    return agent(
      `${CONTEXT}\n\n${DESIGN_RULES}\n\nTA MISSION : concevoir les questions de la famille « ${g.label} » (${g.id}). Thèmes (labels et descriptions fixés par la configuration, ne les change pas) :\n${groupTopics(g).map(t => `- ${t.id} : ${t.label} — ${t.description}`).join('\n')}\n\nDonnées : lis ${RESEARCH}/groups/${g.id}.json (produit par tools/split-research.mjs : dossiers sourcés des candidats limités à ces thèmes, lignes de fracture, points de consensus). Si un candidat codé y manque, lis directement son dossier (${RESEARCH}/dossier_<id>.json). Utilise Read, ou Bash avec node/jq pour filtrer ces gros JSON. Synthèse de la littérature : vaa-methodology.json (dans ${RESEARCH} ou, à défaut, dans un autre dossier de research/). Pas besoin du web pour cette étape.\n\nQuotas visés pour cette famille : ${quota.quick} question(s) "essentiel" et environ ${quota.bank - quota.quick} question(s) "approfondi" (±2). Répartis-les entre les thèmes selon l'importance des fractures et la richesse des données ; chaque thème de la famille a au moins une question si une fracture y est documentée (sinon, explique dans dropped).\n\nAvant de répondre, compte pour chaque question les candidats connus et les approches principales, et vérifie les règles 1, 2, 5 et 6 ; corrige si besoin.\n\nRetourne l'objet conforme au schéma, avec group="${g.id}".`,
      { label: `design:${g.id}`, phase: 'Design', schema: DESIGN_SCHEMA },
    )
  },
  (draft, g) => {
    if (!draft) { logs.push(`design failed for ${g.id}`); return null }
    sanitize(draft, g)
    const pks = packets(draft)
    log(`${g.id} : ${draft.questions.length} questions, ${pks.reduce((n, p) => n + p.items.length, 0)} attributions en ${pks.length} paquet(s)`)
    return parallel(pks.map((pk, i) => () => checkPacket(draft, g, pk, i, pks.length))).then(fcs => mergeChecks(draft, fcs, g))
  },
)

const drafts = designed.filter(Boolean)
const missing = GROUPS.filter(g => !drafts.find(d => d.group === g.id)).map(g => g.id)
if (missing.length) log(`Familles manquantes : ${missing.join(', ')}`)
if (onlyList.length) log(`Familles traitées seules (${onlyList.join(', ')}) : statistiques partielles`)

const allQ = drafts.flatMap(d => d.questions)
const stats = computeStats(allQ)
stats.autoChecks = autoChecks(allQ)
log(`${allQ.length} questions (${stats.essentiel} essentielles) ; paires non distinguées : ${stats.rules.undistinguishedPairs.length} ; étape 1 proposée ${stats.step1Proposal.ok ? 'conforme' : 'NON conforme'}`)

// ---------------------------------------------------------------------------------------------------------
// Relecture : trois sensibilités, anonymat (textes seuls), critique d'exhaustivité

const textsOnly = drafts.map(d => ({
  group: d.group,
  topics: d.topics,
  questions: d.questions.map(q => ({ id: q.id, topicId: q.topicId, tier: q.tier, prompt: q.prompt, context: q.context, approaches: q.approaches.map(a => ({ id: a.id, text: a.text, external: a.external })) })),
}))
const compact = drafts.flatMap(d => d.questions.map(q => ({
  id: q.id, tier: q.tier, topicId: q.topicId, prompt: q.prompt, context: q.context,
  approaches: q.approaches.map(a => `${a.id}${a.external ? '*' : ''} : ${a.text}`),
  stances: q.positions.map(p => `${p.candidate}→${p.approachId.split('-').pop()} ${p.rejects ? 'REJ' : `w${p.weight}`}${p.confidence === 'low' ? '?' : ''}`),
  ...(q.pendingFit?.length ? { pendingFit: q.pendingFit.map(f => `${f.candidate}→${f.approachId.split('-').pop()}`) } : {}),
})))
const issuesOf = d => (d.question_issues ?? []).map(i => `${i.questionId} : ${i.issue}`)
const topicsLine = C.topics.map(t => `${t.id} (${t.label})`).join(', ')

const LENSES = [
  { id: 'gauche', label: 'DE GAUCHE', desc: 'de gauche, de la gauche radicale et anticapitaliste à la social-démocratie et à l\'écologie politique' },
  { id: 'centre', label: 'DU CENTRE', desc: 'du centre, libéral, réformiste et pro-européen, du centre gauche au centre droit' },
  { id: 'droite', label: 'DE DROITE', desc: 'de droite, de la droite libérale et conservatrice à la droite nationale et souverainiste' },
]
const lensAgent = L => () => agent(
  `${CONTEXT}\n\nTA MISSION : RELECTEUR DE SENSIBILITÉ ${L.label}. Tu relis toute la banque avec le regard d'un électeur ou d'un responsable ${L.desc}, pour repérer ce qui désavantagerait ou caricaturerait cette sensibilité — et, par honnêteté, ce qui la favoriserait indûment. Les attributions sont données en abrégé (candidat→lettre d'approche, poids ; REJ = rejet ; ? = confiance low) pour que tu juges si les approches de chaque camp sont formulées avec le même soin.\n\nVérifie :\n1. Cadrage : un énoncé ou un contexte présuppose-t-il le diagnostic d'un camp (vocabulaire, choix des faits, ordre des approches) ?\n2. Offre : sur chaque question, un électeur de cette sensibilité trouve-t-il une approche crédible qui exprime sa position, formulée aussi favorablement que les autres ? Sinon, propose l'approche manquante (missingApproaches, même style que les autres).\n3. Formulation : approches de cette sensibilité caricaturées, affaiblies, plus longues ou plus vagues que les autres ; vocabulaire militant ou disqualifiant, de n'importe quel bord ; style (infinitif, longueurs ±20 %, précision homogène, ponctuation française avec espaces avant : ; ? !, guillemets « »).\n4. Sujets : grands sujets chers à cette sensibilité absents de la banque ou relégués en "approfondi" (topicGaps). Thèmes de la configuration : ${topicsLine}.\n5. Attributions qui te paraissent douteuses ou injustes pour un candidat (positionIssues) ; tu ne les vérifies pas toi-même.\nTes reformulations (edits) ne changent JAMAIS le sens d'une approche (sinon les attributions deviendraient fausses) ; les ids restent identiques. Un arbitre neutre confrontera tes propositions à celles des autres relecteurs.\n\nCONTRÔLES AUTOMATIQUES (indicatifs) :\n${stats.autoChecks.join('\n') || 'aucun'}\n\nBANQUE :\n${JSON.stringify(compact)}`,
  { label: `review:${L.id}`, phase: 'Review', schema: LENS_SCHEMA },
)

phase('Review')
const [gauche, centre, droite, anonymat, critic] = await parallel([
  ...LENSES.map(lensAgent),
  () => agent(
    `${CONTEXT}\n\nTA MISSION : RELECTEUR D'ANONYMAT. Tu ne vois volontairement que les textes (énoncés, contextes, approches), jamais les attributions. Tu connais bien la politique française, les ${N} candidats et leurs partis : ${C.candidates.map(c => `${c.name} (${c.party})`).join(', ')}.\n\nPour chaque approche, demande-toi si un lecteur informé reconnaîtrait immédiatement un candidat ou un parti : slogan, nom de mesure, formule signature, chiffre emblématique associé à une seule personne, vocabulaire propre à un camp, nom propre. Si oui, signale-la dans recognizable (candidat deviné, raison) et propose une reformulation descriptive (edits) qui garde le sens et la précision nécessaire. Vérifie aussi l'absence des termes interdits (mots entiers) : ${FORBIDDEN.map(quote).join(', ')}${ALLOW.length ? ` (${ALLOW.map(quote).join(', ')} admis seulement dans leur sens courant)` : ''}, et que les approches d'une même question se ressemblent assez (structure, longueur, précision) pour qu'aucune ne trahisse son auteur par sa forme. Ne change JAMAIS le sens d'une approche ; les ids restent identiques.\n\nCONTRÔLES AUTOMATIQUES (indicatifs) :\n${stats.autoChecks.join('\n') || 'aucun'}\n\nTEXTES :\n${JSON.stringify(textsOnly)}`,
    { label: 'review:anonymat', phase: 'Review', schema: ANON_SCHEMA },
  ),
  () => agent(
    `${CONTEXT}\n\n${DESIGN_RULES}\n\nTA MISSION : CRITIQUE D'EXHAUSTIVITÉ ET D'ÉQUILIBRE de la banque fusionnée (après vérification des faits). Cibles : ${Q.quick.min} à ${Q.quick.max} questions "essentiel" ; ${Q.bank.min} à ${Q.bank.max} au total, dont environ ${TARGET.bank} issues de ce workflow (l'extension 3-bank-expansion.js ajoutera des questions approfondies et comblera des inconnues à partir des documents officiels).\n\nStatistiques calculées (règles de la configuration ; « connu » = poids 1 ou 2, confiance high ou medium ; « principale » = poids 2) :\n${JSON.stringify(stats)}\n\nVérifie :\n1. Les grandes fractures de l'élection sont-elles en "essentiel" ? Appuie-toi sur les lignes de fracture de ${RESEARCH}/groups/<famille>.json (ou ${RESEARCH}/cleavages_<famille>.json) et sur ta connaissance de la campagne. Lesquelles manquent ou sont mal placées ?\n2. Règles du questionnaire rapide (rules.quickUnderKnown, quickCandidatesUnder, quickSpread) et de l'étape 1 : propose les changements de tier et une liste de ${Q.step1.count} questions pour l'étape 1 qui respecte les règles (la proposition calculée stats.step1Proposal sert de base : corrige-la si elle écarte une grande fracture ou si elle est non conforme).\n3. Équilibre entre candidats et entre sensibilités : approches principales distinctives par candidat (perCandidate), couverture des candidats aux programmes minces (bankCandidatesUnder), paires non distinguées (undistinguishedPairs) : quelle question ou approche les séparerait ?\n4. Questions dominées par une approche (rules.dominated) ou non discriminantes : scinder une approche, retirer, ou passer en consensus.\n5. Thèmes sur- ou sous-représentés (perTopic) ; doublons entre questions ; approches qui se recouvrent ; questions où il manque une approche pour qu'un électeur puisse s'exprimer.\n6. GRANDS SUJETS ABSENTS : liste les grands sujets de société, d'économie ou de politique étrangère débattus dans cette campagne qui ne sont couverts ni par la banque ni par les thèmes de la configuration (${topicsLine}) — par exemple la fin de vie et l'aide à mourir —, avec les candidats qui ont une position connue et une proposition (thème, question type). Ils seront soumis au propriétaire pour décision : ne les ajoute pas toi-même.${PENDING.length ? `\n7. Candidats en attente (${PENDING.map(c => c.id).join(', ')}) : chaque question leur offre-t-elle une approche quand leur dossier documente une position (pendingFit, stats.pendingNoFit) ?` : ''}\nPropose des corrections CONCRÈTES et minimales.\n\nPROBLÈMES SIGNALÉS PAR LES VÉRIFICATEURS :\n${drafts.flatMap(issuesOf).join('\n') || 'aucun'}\n\nBANQUE (compacte ; stances = candidat→lettre poids) :\n${JSON.stringify(compact)}`,
    { label: 'completeness-critic', phase: 'Review', schema: CRITIC_SCHEMA },
  ),
])

// ---------------------------------------------------------------------------------------------------------
// Arbitrage : au plus une reformulation par texte, confrontée aux autres propositions

const reviewers = { gauche, centre, droite, anonymat }
const proposals = new Map()
for (const [by, r] of Object.entries(reviewers)) {
  if (!r) { logs.push(`relecteur ${by} perdu`); continue }
  for (const e of r.edits ?? []) {
    const k = `${e.id}|${e.field}`
    if (!proposals.has(k)) proposals.set(k, [])
    proposals.get(k).push({ by, newText: e.newText, reason: e.reason })
  }
}
const qOfId = new Map()
for (const q of allQ) { qOfId.set(q.id, q); for (const a of q.approaches) qOfId.set(a.id, q) }
const currentText = (id, field) => {
  const t = drafts.flatMap(d => d.topics).find(x => x.id === id)
  if (t && (field === 'label' || field === 'description')) return t[field]
  const q = qOfId.get(id)
  if (!q) return null
  if (q.id === id) return field === 'prompt' || field === 'context' ? q[field] ?? '' : null
  return field === 'text' ? q.approaches.find(a => a.id === id)?.text ?? null : null
}
const items = [...proposals.entries()].map(([k, list]) => {
  const [id, field] = k.split('|')
  const q = qOfId.get(id)
  return { id, field, current: currentText(id, field), question: q ? { prompt: q.prompt, approaches: q.approaches.map(a => `${a.id} : ${a.text}`) } : undefined, proposals: list }
})
const unknownEdits = items.filter(i => i.current === null)
for (const i of unknownEdits) logs.push(`reformulation sur un id inconnu ${i.id}.${i.field}`)

phase('Arbitrage')
let arbitrage = null
if (items.length) {
  arbitrage = await agent(
    `${CONTEXT}\n\nTA MISSION : ARBITRE NEUTRE des reformulations proposées par quatre relecteurs (sensibilités gauche, centre et droite ; anonymat). Pour chaque texte (id + field), retiens AU PLUS une version finale : une proposition telle quelle, une synthèse de plusieurs, ou aucune (le texte actuel reste). Retiens une reformulation seulement si elle :\n- ne change pas le sens (les attributions des candidats en dépendent) ;\n- ne favorise ni ne défavorise aucune sensibilité : une proposition d'un relecteur qui rend l'approche de son camp plus attrayante, ou celle d'un autre camp moins attrayante, est refusée ;\n- respecte les règles de style (infinitif, longueurs comparables dans la question, précision homogène, aucun adjectif évaluatif, ≤ 180 caractères, sans point final, aucun terme interdit : ${FORBIDDEN.map(quote).join(', ')}) ;\n- améliore réellement la neutralité, l'anonymat ou la clarté.\nLes corrections d'anonymat (approche reconnaissable) passent en priorité. Pour une approche, vérifie la cohérence avec les autres approches de sa question (fournies). Explique chaque refus dans rejected.\n\nPROPOSITIONS :\n${JSON.stringify(items.filter(i => i.current !== null))}`,
    { label: 'arbitrage', phase: 'Arbitrage', schema: ARB_SCHEMA },
  )
}
let edits = arbitrage?.edits ?? []
if (items.length && !arbitrage) {
  // Sans arbitre, seules les corrections d'anonymat passent ; le reste attend une décision (decisions.json)
  edits = anonymat?.edits ?? []
  logs.push('arbitrage perdu : seules les reformulations du relecteur d\'anonymat sont retenues')
}
// Les libellés et descriptions de thèmes sont fixés par la configuration : leurs reformulations sont
// seulement proposées (à reporter dans config.json ou decisions.json)
const seen = new Set()
const topicEdits = []
edits = edits.filter(e => {
  const k = `${e.id}|${e.field}`
  if (seen.has(k) || currentText(e.id, e.field) === null) return false
  seen.add(k)
  if (e.field === 'label' || e.field === 'description') { topicEdits.push(e); return false }
  return true
})

const neutrality = {
  edits,
  recognizable: anonymat?.recognizable ?? [],
  notes: [anonymat?.notes, arbitrage?.notes].filter(Boolean).join('\n'),
  proposals: {
    topicEdits,
    missingApproaches: LENSES.flatMap(L => (reviewers[L.id]?.missingApproaches ?? []).map(x => ({ ...x, by: L.id }))),
    topicGaps: LENSES.flatMap(L => (reviewers[L.id]?.topicGaps ?? []).map(x => ({ ...x, by: L.id }))),
    positionIssues: LENSES.flatMap(L => (reviewers[L.id]?.positionIssues ?? []).map(x => ({ ...x, by: L.id }))),
  },
}
log(`${edits.length} reformulation(s) retenue(s) sur ${items.length} texte(s) proposés ; ${critic?.missingSubjects?.length ?? 0} sujet(s) absent(s) signalé(s)`)

return { drafts, stats, neutrality, critic, reviews: { ...reviewers, arbitrage }, logs, missing }
