export const meta = {
  name: 'choisir2027-question-bank',
  description: 'Design neutral question bank + sourced candidate stances per topic group, fact-check each stance via WebFetch, then neutrality + completeness review',
  phases: [
    { title: 'Design', detail: '6 topic groups: questions, anonymous approaches, sourced stance matrix' },
    { title: 'Fact-check', detail: 'adversarial re-reading of every cited source (WebFetch only)' },
    { title: 'Review', detail: 'cross-bank neutrality review + completeness critic' },
  ],
}

const ROOT = '/Users/lambertbouley/Claude/Politique/primaire-de-gauche'
const CANDS = [
  { id: 'faure', name: 'Olivier Faure', slug: 'olivier-faure' },
  { id: 'glucksmann', name: 'Raphaël Glucksmann', slug: 'raphael-glucksmann' },
  { id: 'guedj', name: 'Jérôme Guedj', slug: 'jerome-guedj' },
  { id: 'maurel', name: 'Emmanuel Maurel', slug: 'emmanuel-maurel' },
  { id: 'royal', name: 'Ségolène Royal', slug: 'segolene-royal' },
]
const CAND_IDS = CANDS.map(c => c.id)
const GROUPS = [
  { id: 'strategie_institutions', topics: ['strategie', 'institutions'], essential: 2, deep: 6 },
  { id: 'economie', topics: ['fiscalite', 'travail_salaires', 'industrie_economie'], essential: 4, deep: 9 },
  { id: 'social', topics: ['retraites', 'sante', 'education', 'logement'], essential: 3, deep: 10 },
  { id: 'ecologie', topics: ['ecologie_energie', 'agriculture', 'territoires'], essential: 2, deep: 7 },
  { id: 'monde', topics: ['europe', 'international_defense'], essential: 5, deep: 7 },
  { id: 'societe', topics: ['immigration', 'laicite_republique', 'securite_justice', 'numerique', 'societe'], essential: 4, deep: 11 },
]

const CONTEXT = `Contexte (2 octobre 2026). Nous construisons « Isoloir », une boussole électorale NEUTRE, 100 % locale, pour la primaire « Choisir 2027 » (PS, Place publique, GRS ; vote les 9-10 et 16-17 octobre 2026 ; site officiel https://choisir2027.fr). Cinq candidats, identifiants à utiliser : ${CANDS.map(c => `${c.id} = ${c.name}`).join(' ; ')}. Pages officielles des candidats : https://choisir2027.fr/candidat/<slug>/ avec slugs ${CANDS.map(c => c.slug).join(', ')}.

Fonctionnement : chaque question propose 3 à 5 « approches » ANONYMES (on ne dit jamais qui les porte). Pour chaque approche, l'utilisateur dit pas d'accord (−1), sans avis (0) ou d'accord (+1), et peut tracer une ligne rouge (filtre de classement : les candidats qui portent l'approche sont classés après les autres). Score d'un candidat sur une question : x = Σ v·u / Σ |v|, ramené entre 0 et 1 par s = (x + 1) / 2, avec v = 2 pour son approche principale / proposition explicite, 1 pour une position compatible ou secondaire, −1 pour un rejet explicite (rejects) : un rejet explicite compte donc dans le score. Position absente = inconnue (exclue du calcul pour ce candidat). Après le score, l'application RÉVÈLE qui porte quelle approche, avec le résumé et les sources : une attribution fausse est bien pire qu'une case inconnue.`

const DESIGN_RULES = `RÈGLES DE CONCEPTION (issues de la littérature sur les boussoles électorales : Wahl-O-Mat, smartvote, StemWijzer, Walgrave 2009, Kamoen 2017/2019, Berdoz et al. 2025) :
1. Chaque question porte sur une vraie ligne de fracture entre candidats. Écarte les sujets où les 5 ont la même approche principale : liste-les dans "consensus" (ils seront affichés comme points communs, sans score).
2. 3 à 5 approches par question, formulées comme de vraies alternatives de politique publique, aussi exclusives que possible (pas des variantes d'intensité de la même mesure).
3. Chaque candidat a AU PLUS une approche de poids 2 et AU PLUS une de poids 1 par question. Une même approche peut être portée par plusieurs candidats. Au plus UNE approche "external" (portée par aucun des 5 : statu quo ou alternative crédible défendue ailleurs) par question, seulement si elle aide l'utilisateur à exprimer une préférence réelle.
4. NEUTRALITÉ ET ANONYMAT des textes (prompt, context, approches) :
   - jamais de nom de candidat, de parti organisateur (PS, Parti socialiste, Place publique, GRS, Gauche républicaine et socialiste), de slogan, de titre de livre, ni de mesure connue sous un nom propre ou une marque (ex. « taxe Zucman » → « impôt minimum de 2 % par an sur les patrimoines de plus de 100 millions d'euros » ; « ordre juste », « France + juste », « bouclier logement », « règle d'or verte » → décrire la mesure). Les autres partis (La France insoumise, Rassemblement national, etc.) peuvent être nommés quand la question l'exige (stratégie d'alliances).
   - approches à l'infinitif, même structure grammaticale, longueurs comparables (±20 %), même niveau de précision (si une approche est chiffrée, les autres le sont aussi, ou aucune) ;
   - aucun adjectif évaluatif (juste, courageux, dangereux, ambitieux…) ; préférer la forme positive à la négation quand c'est possible ;
   - langage clair, sigles explicités, pas de jargon. 120 caractères max par approche si possible, 180 au grand maximum.
   - prompt : une question courte et neutre (« Comment financer… ? », « Quelle stratégie… ? »). context : une phrase factuelle et neutre sur la situation actuelle, commençant par « Aujourd'hui : » (facultatif).
5. Tier "essentiel" (questionnaire rapide) : uniquement les fractures les plus importantes ET où les 5 candidats ont une position connue (confidence high/medium, nature proposition ou declaration). Si une fracture majeure laisse un candidat inconnu, tu peux la garder en essentiel avec AU PLUS un inconnu, en le signalant dans rationale. Tier "approfondi" : le reste ; les inconnues y sont tolérées.
6. Équilibre : chaque candidat doit avoir, sur l'ensemble des questions du groupe, un nombre comparable de questions où son approche principale est distinctive. Couvre les thèmes prioritaires de chaque candidat (propriété des enjeux).
7. ATTRIBUTIONS (positions) — règle d'or : ne mets une position que si une source du dossier la soutient explicitement.
   - candidate : identifiant parmi ${CAND_IDS.join(', ')} ;
   - weight : 2, 1, ou 0 (0 uniquement avec rejects=true pour un rejet explicite) ;
   - nature : proposition (mesure de programme / profession de foi), declaration (déclaration publique, débat, interview), inference (vote parlementaire, motion signée, déduction) — une inférence ne peut pas dépasser le poids 1 ;
   - confidence : high (source primaire ou grand média, claire), medium (source secondaire fiable ou formulation moins nette), low (source faible ou non officielle : wikis non officiels, comparateurs en ligne, agrégateurs → à éviter ; ne les utilise que s'il n'y a rien d'autre et mets low) ;
   - summary : résumé factuel et neutre en français, 1 phrase, ce que le candidat propose/dit (c'est ce qui sera affiché à la révélation) ;
   - sources : 1 à 3 sources {title, url, date (AAAA-MM-JJ si connue), publisher} reprises EXACTEMENT du dossier (n'invente aucune URL).
8. Identifiants : question id = "<topicId>-<n>" (n = 1, 2, … par thème) ; approche id = "<questionId>-<lettre>" (a, b, c…). topicId parmi les thèmes du groupe.`

const POS = {
  type: 'object',
  properties: {
    candidate: { type: 'string', enum: CAND_IDS },
    approachId: { type: 'string' },
    weight: { type: 'integer', enum: [0, 1, 2] },
    rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
    sources: {
      type: 'array',
      items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' }, publisher: { type: 'string' } }, required: ['title', 'url'] },
    },
  },
  required: ['candidate', 'approachId', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources'],
}

const DESIGN_SCHEMA = {
  type: 'object',
  properties: {
    group: { type: 'string' },
    topics: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, label: { type: 'string' }, description: { type: 'string' } }, required: ['id', 'label', 'description'] } },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          topicId: { type: 'string' },
          tier: { type: 'string', enum: ['essentiel', 'approfondi'] },
          prompt: { type: 'string' },
          context: { type: 'string' },
          rationale: { type: 'string', description: 'Pourquoi cette question discrimine, qui est où, inconnues éventuelles' },
          approaches: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' }, external: { type: 'boolean' } }, required: ['id', 'text', 'external'] } },
          positions: { type: 'array', items: POS },
        },
        required: ['id', 'topicId', 'tier', 'prompt', 'rationale', 'approaches', 'positions'],
      },
    },
    consensus: { type: 'array', items: { type: 'object', properties: { topicId: { type: 'string' }, text: { type: 'string' } }, required: ['topicId', 'text'] } },
    dropped: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, why: { type: 'string' } }, required: ['what', 'why'] } },
  },
  required: ['group', 'topics', 'questions', 'consensus', 'dropped'],
}

const CHECK = {
  type: 'object',
  properties: {
    questionId: { type: 'string' },
    candidate: { type: 'string', enum: CAND_IDS },
    approachId: { type: 'string' },
    verdict: { type: 'string', enum: ['confirmed', 'adjusted', 'refuted', 'unverifiable'] },
    weight: { type: 'integer', enum: [0, 1, 2] },
    rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
    sources: POS.properties.sources,
    note: { type: 'string', description: 'Ce que la source dit réellement, ou pourquoi on ajuste/réfute' },
  },
  required: ['questionId', 'candidate', 'approachId', 'verdict', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources', 'note'],
}

const FC_SCHEMA = {
  type: 'object',
  properties: {
    checks: { type: 'array', items: CHECK, description: 'UNE entrée par position du brouillon, avec les valeurs finales' },
    additions: { type: 'array', items: CHECK, description: 'Positions manquantes mais sourcées (verdict "confirmed")' },
    question_issues: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, issue: { type: 'string' } }, required: ['questionId', 'issue'] } },
    fetch_log: { type: 'string', description: 'URLs lues, échecs de chargement' },
  },
  required: ['checks', 'additions', 'question_issues'],
}

function compactDraft(d) {
  return JSON.stringify(d.questions.map(q => ({ id: q.id, tier: q.tier, prompt: q.prompt, approaches: q.approaches, positions: q.positions })), null, 1)
}

function mergeChecks(draft, fc, log) {
  const key = p => `${p.candidate}|${p.approachId}`
  const byQ = new Map()
  for (const c of [...(fc?.checks ?? []), ...(fc?.additions ?? [])]) {
    if (!byQ.has(c.questionId)) byQ.set(c.questionId, [])
    byQ.get(c.questionId).push(c)
  }
  for (const q of draft.questions) {
    const checks = byQ.get(q.id) ?? []
    const checked = new Map(checks.map(c => [key(c), c]))
    const out = []
    for (const p of q.positions) {
      const c = checked.get(key(p))
      if (!c) { out.push({ ...p, verdict: 'unchecked' }); log.push(`unchecked ${q.id} ${key(p)}`); continue }
      checked.delete(key(p))
      if (c.verdict === 'refuted') { log.push(`refuted ${q.id} ${key(p)}: ${c.note}`); continue }
      out.push({ candidate: c.candidate, approachId: c.approachId, weight: c.weight, rejects: c.rejects, nature: c.nature, confidence: c.confidence, summary: c.summary, sources: c.sources, verdict: c.verdict, note: c.note })
    }
    for (const c of checked.values()) {
      if (c.verdict === 'refuted') continue
      if (!q.approaches.some(a => a.id === c.approachId)) { log.push(`addition on unknown approach ${c.approachId}`); continue }
      out.push({ candidate: c.candidate, approachId: c.approachId, weight: c.weight, rejects: c.rejects, nature: c.nature, confidence: c.confidence, summary: c.summary, sources: c.sources, verdict: 'added', note: c.note })
    }
    q.positions = out
  }
  draft.question_issues = fc?.question_issues ?? []
  draft.fetch_log = fc?.fetch_log ?? ''
  return draft
}

const logs = []

const groups = await pipeline(
  GROUPS,
  g => agent(
    `${CONTEXT}\n\n${DESIGN_RULES}\n\nTA MISSION : concevoir les questions du groupe « ${g.id} » (thèmes : ${g.topics.join(', ')}).\n\nDonnées : lis le fichier ${ROOT}/research/choisir-2027/groups/${g.id}.json (dossiers sourcés des 5 candidats limités à ces thèmes, lignes de fracture, consensus, débats). Tu peux aussi consulter ${ROOT}/research/choisir-2027/vaa-methodology.json. Utilise Read, ou Bash avec node/jq pour filtrer ce gros JSON. Pas besoin du web pour cette étape.\n\nQuotas visés pour ce groupe : ${g.essential} question(s) "essentiel" et environ ${g.deep} question(s) "approfondi" (±2). Répartis entre les thèmes selon la richesse des données ; un thème sans fracture documentée peut n'avoir aucune question (explique dans dropped). Donne pour chaque thème utilisé un label court et neutre (ex. « Retraites », « Fiscalité », « Europe ») et une description d'une phrase.\n\nRetourne l'objet conforme au schéma, avec group="${g.id}".`,
    { label: `design:${g.id}`, phase: 'Design', schema: DESIGN_SCHEMA },
  ),
  (draft, g) => {
    if (!draft) return null
    return agent(
      `${CONTEXT}\n\nTA MISSION : FACT-CHECKER ADVERSARIAL du groupe « ${g.id} ». Ton rôle est d'essayer de RÉFUTER chaque attribution candidat → approche du brouillon ci-dessous. Par défaut, sois sceptique.\n\nOutils : charge WebFetch via ToolSearch ("select:WebFetch"). ATTENTION : WebSearch n'est PAS disponible (quota épuisé). N'utilise que WebFetch sur : les URLs citées, les autres URLs présentes dans ${ROOT}/research/choisir-2027/groups/${g.id}.json (lisible avec Read/Bash), et les pages officielles https://choisir2027.fr/candidat/<slug>/ (slugs : ${CANDS.map(c => `${c.id}→${c.slug}`).join(', ')}) ainsi que les documents qu'elles lient (profession de foi). Lis chaque URL distincte une seule fois et vérifie toutes les attributions qui la citent.\n\nPour CHAQUE position du brouillon, renvoie une entrée dans "checks" avec les valeurs FINALES :\n- confirmed : la source soutient clairement que le candidat porte (ou rejette) CETTE approche telle que formulée ;\n- adjusted : la source soutient une version plus faible ou différente → corrige weight (2→1), nature, confidence, summary, ou déplace vers une autre approche de la même question (indique le bon approachId dans l'entrée et explique dans note) ;\n- refuted : la source ne dit pas ça, ou dit le contraire, ou concerne un autre candidat → la position sera supprimée ;\n- unverifiable : l'URL ne se charge pas (paywall, erreur) ET aucune autre source accessible ne confirme → baisse confidence d'un cran (high→medium, medium→low).\nVérifie aussi : correspondance sémantique exacte entre l'approche et ce que dit le candidat (pas de sur-interprétation), date récente (2025-2026), nature correcte (inférence ≤ poids 1), au plus un poids 2 et un poids 1 par candidat et par question, summary factuel et neutre.\n\nDans "additions", ajoute les positions MANQUANTES que tu trouves sourcées (dans le fichier de groupe ou la page officielle) : surtout pour les questions "essentiel" où un candidat est inconnu. Dans "question_issues", signale les problèmes de formulation, d'exclusivité des approches ou d'anonymat (approche reconnaissable).\n\nBROUILLON (questions, approches et positions) :\n${compactDraft(draft)}`,
      { label: `factcheck:${g.id}`, phase: 'Fact-check', schema: FC_SCHEMA },
    ).then(fc => {
      if (!fc) logs.push(`factcheck failed for ${g.id}`)
      return mergeChecks(draft, fc, logs)
    })
  },
)

const drafts = groups.filter(Boolean)
const missing = GROUPS.filter(g => !drafts.find(d => d.group === g.id)).map(g => g.id)
if (missing.length) log(`Groupes manquants : ${missing.join(', ')}`)

// Statistiques d'équilibre sur la banque fusionnée
const allQ = drafts.flatMap(d => d.questions)
const stats = { essentiel: allQ.filter(q => q.tier === 'essentiel').length, approfondi: allQ.filter(q => q.tier === 'approfondi').length, perCandidate: {}, essentialUnknowns: [], nonDiscriminating: [] }
for (const c of CAND_IDS) stats.perCandidate[c] = { main: 0, distinctive: 0, known: 0, unknownEssential: 0 }
for (const q of allQ) {
  const known = new Set(q.positions.filter(p => p.confidence !== 'low' && (p.weight > 0 || p.rejects)).map(p => p.candidate))
  const mains = new Map()
  for (const p of q.positions) if (p.weight === 2 && p.confidence !== 'low') mains.set(p.candidate, p.approachId)
  for (const c of CAND_IDS) {
    if (known.has(c)) stats.perCandidate[c].known++
    else if (q.tier === 'essentiel') { stats.perCandidate[c].unknownEssential++; stats.essentialUnknowns.push(`${q.id}:${c}`) }
    const m = mains.get(c)
    if (m) {
      stats.perCandidate[c].main++
      if ([...mains.entries()].filter(([k, v]) => k !== c && v === m).length === 0) stats.perCandidate[c].distinctive++
    }
  }
  if (new Set(mains.values()).size <= 1) stats.nonDiscriminating.push(q.id)
}

const textsOnly = drafts.map(d => ({ group: d.group, topics: d.topics, questions: d.questions.map(q => ({ id: q.id, topicId: q.topicId, tier: q.tier, prompt: q.prompt, context: q.context, approaches: q.approaches.map(a => ({ id: a.id, text: a.text, external: a.external })) })) }))
const compactPositions = drafts.flatMap(d => d.questions.map(q => ({ id: q.id, tier: q.tier, topicId: q.topicId, prompt: q.prompt, approaches: q.approaches.map(a => `${a.id}: ${a.text}`), stances: q.positions.map(p => `${p.candidate}→${p.approachId} w${p.weight}${p.rejects ? ' REJ' : ''} ${p.nature}/${p.confidence}`), issues: (d.question_issues || []).filter(i => i.questionId === q.id).map(i => i.issue) })))

phase('Review')
const [neutrality, critic] = await parallel([
  () => agent(
    `${CONTEXT}\n\nTA MISSION : RELECTEUR DE NEUTRALITÉ ET D'ANONYMAT pour l'ensemble de la banque de questions ci-dessous (textes seulement : tu ne vois volontairement pas les attributions). Tu connais bien la politique française et les 5 candidats.\n\nVérifie chaque prompt, context et approche :\n- vocabulaire connoté ou évaluatif, cadrage orienté, formulations négatives évitables, jargon, sigles non explicités ;\n- ANONYMAT : un lecteur informé reconnaîtrait-il immédiatement un candidat derrière une approche (slogan, nom de mesure, formule signature, chiffre emblématique associé à une seule personne) ? Si oui, propose une reformulation descriptive qui garde le sens et la précision nécessaire ;\n- équilibre au sein d'une question : longueurs (±20 %), structure grammaticale (infinitif), niveau de précision homogène ;\n- cohérence de style entre groupes (ton, ponctuation française avec espaces insécables avant : ; ? !, guillemets « », pas de tirets cadratins en série) ;\n- labels de thèmes neutres et descriptifs.\nNe change JAMAIS le sens d'une approche (sinon les attributions deviendraient fausses). Les ids restent identiques.\n\nBANQUE :\n${JSON.stringify(textsOnly)}`,
    {
      label: 'neutrality-review', phase: 'Review',
      schema: {
        type: 'object',
        properties: {
          edits: { type: 'array', items: { type: 'object', properties: { id: { type: 'string', description: 'id de question, d\'approche ou de thème' }, field: { type: 'string', enum: ['prompt', 'context', 'text', 'label', 'description'] }, newText: { type: 'string' }, reason: { type: 'string' } }, required: ['id', 'field', 'newText', 'reason'] } },
          recognizable: { type: 'array', items: { type: 'object', properties: { approachId: { type: 'string' }, guessedCandidate: { type: 'string' }, why: { type: 'string' } }, required: ['approachId', 'why'] } },
          notes: { type: 'string' },
        },
        required: ['edits', 'recognizable', 'notes'],
      },
    },
  ),
  () => agent(
    `${CONTEXT}\n\nTA MISSION : CRITIQUE DE COMPLÉTUDE ET D'ÉQUILIBRE de la banque de questions fusionnée (après fact-check). Objectif : ~20 questions "essentiel" (questionnaire rapide, 5-7 min) et ~50 "approfondi".\n\nStatistiques calculées : ${JSON.stringify(stats)}\n\nVérifie :\n1. Les fractures majeures de la primaire sont-elles toutes en "essentiel" ? (alliance avec LFI, fiscalité des plus riches/CSG, salaires, retraites, carburants/énergie, Europe fédérale vs souveraineté, Ukraine/Russie, Gaza, défense européenne/OTAN, immigration/régularisation, ordre public/laïcité…). Lesquelles manquent ou sont mal placées ?\n2. Chaque question "essentiel" a-t-elle les 5 candidats connus ? Sinon, faut-il la passer en "approfondi" ou la remplacer ?\n3. Équilibre entre candidats : nombre de questions où chacun a une approche principale distinctive ; un candidat est-il structurellement avantagé ou désavantagé par la sélection ?\n4. Questions non discriminantes (tous la même approche principale) à retirer ou à passer en consensus.\n5. Thèmes sur- ou sous-représentés ; doublons entre questions.\n6. Approches qui se recouvrent au sein d'une question ; questions où une approche external manquerait pour qu'un électeur puisse s'exprimer.\nPropose des corrections CONCRÈTES et minimales (changement de tier, suppression, fusion, approche à ajouter avec son texte).\n\nBANQUE (compacte) :\n${JSON.stringify(compactPositions)}`,
    {
      label: 'completeness-critic', phase: 'Review',
      schema: {
        type: 'object',
        properties: {
          issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, questionId: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'issue', 'fix'] } },
          tierChanges: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, newTier: { type: 'string', enum: ['essentiel', 'approfondi'] }, why: { type: 'string' } }, required: ['questionId', 'newTier', 'why'] } },
          drops: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, why: { type: 'string' } }, required: ['questionId', 'why'] } },
          summary: { type: 'string' },
        },
        required: ['issues', 'tierChanges', 'drops', 'summary'],
      },
    },
  ),
])

return { drafts, stats, neutrality, critic, logs, missing }
