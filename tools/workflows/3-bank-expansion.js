export const meta = {
  name: 'isoloir-bank-expansion',
  description: 'Mine the official documents of each candidate of an election (args = config.json) for uncoded positions and gap fills on the existing bank, design extra deep questions per topic family, fact-check every new attribution in packets of about 60, then left, centre, right and anonymity review, arbitration and a coverage critic',
  phases: [
    { title: 'Mine', detail: 'one agent per candidate: official documents, campaign site, recent party programme (WebFetch)' },
    { title: 'Design', detail: 'extra deep questions, one designer per topic family' },
    { title: 'Verify', detail: 'adversarial fact-check in packets of about 60; gap fills start as soon as their candidate is mined' },
    { title: 'Review', detail: 'left, centre and right reviewers, anonymity reviewer (texts only), coverage critic' },
    { title: 'Arbitrage', detail: 'one neutral arbiter keeps at most one rewording per text' },
  ],
}

// Extension de la banque d'une élection : exploitation des documents officiels de chaque candidat (programme,
// site de campagne, programme récent du parti) pour combler ses inconnues sur les questions existantes
// (gapFills) et concevoir des questions approfondies supplémentaires, famille par famille ; vérification
// adversariale de chaque nouvelle attribution par paquets d'environ 60 ; relecture des nouvelles questions
// par trois sensibilités politiques (gauche, centre, droite) et par un relecteur d'anonymat qui ne voit que
// les textes ; arbitrage des reformulations ; critique de couverture (doublons, règles, sujets absents).
//
// USAGE (session principale), une fois research/<id>/bank.json construit par tools/build-pack.mjs à partir de
// la sortie de 2-question-bank.js et de decisions.json :
//   Workflow({ scriptPath: 'tools/workflows/3-bank-expansion.js', args: { ...config, root: '<racine absolue du dépôt>' } })
//   où config = contenu de research/<id>/config.json. Ne pas passer args sous forme de chaîne JSON.
// Puis : copier le fichier de résultat du workflow (…/workflows/wf_<runId>.json) en
// research/<id>/expansion-output.json, et
//   node tools/merge-expansion.mjs research/<id>/expansion-output.json research/<id>/expansion-merged.json
//   node tools/build-pack.mjs research/<id>/question-bank-output.json research/<id> src/elections/<id> research/<id>/expansion-merged.json
//
// ARGS : le contenu de config.json (id, name, contextDate, context, candidates[].docs, topics, groups,
// forbiddenTerms, forbiddenTermsAllow, quality), plus :
//   root         racine du dépôt, en chemin absolu (comme pour 2 et 4 à 7-….js) ; défaut « . », le dossier de
//                travail des agents. <root>/research/<id> doit contenir bank.json, dossier_<id>.json et
//                groups/<famille>.json
//   only         identifiants de candidats codés à traiter seuls : exploitation et compléments pour eux
//                seulement, sans nouvelle question (sauf newQuestions: true). Un candidat pendingPrimary est
//                refusé : 6-add-candidate.js le place sur la banque
//   newQuestions true pour concevoir de nouvelles questions malgré only
//   target       { bank } : taille visée de la banque après extension (défaut : milieu de quality.bank), répartie
//                entre familles comme dans 2-question-bank.js (ou groups[].bank)
//   minKnownNew  candidats connus requis pour créer une question (défaut : max(3, quality.bank.minCandidateShare × n))
//   packetSize   taille visée des paquets de vérification (défaut 60)
//   subjects     sujets que le propriétaire a décidé d'ajouter : [{ topicId, subject, proposal }] ; la famille du
//                thème DOIT concevoir une question approfondie pour chacun (hors quota), sauf impossibilité motivée
//   addedApproaches  approches ajoutées par décision (decisions.addApproaches, déjà dans bank.json) :
//                [{ questionId, approachId, text }] ; les explorateurs y cherchent les candidats qui les portent
//
// SORTIE (résultat du workflow ; format lu sans changement par merge-expansion.mjs) :
//   mined[]    { candidate, documents_read, positions[{ topic, position, already_coded, … }], gapFills }
//   design     { newTopics (thèmes de config des familles conçues), questions[{ id, topicId, tier: 'approfondi',
//              prompt, context, rationale, approaches, positions, pendingFit? }], gapFills[{ questionId, candidate,
//              approachId, weight, rejects, nature, confidence, summary, sources, … }], notes }
//   checks[]   une vérification par attribution (questionId, candidate, approachId, verdict, valeurs finales) ;
//              les déplacements d'approche sont déjà reportés dans design, pour que merge-expansion les retrouve
//   neutrality { edits (retenues par l'arbitre), duplicates (critique), recognizable, notes, proposals (reformulations
//              de thèmes, approches manquantes, attributions contestées : à trancher) }
//   critic     { duplicates, candidatesUnder, undistinguishedPairs, tierChanges, step1, missingSubjects, issues, summary }
//   reviews    sorties brutes des relecteurs et de l'arbitre ; logs ; missing (candidats non exploités)
//
// COÛT ESTIMÉ (19 candidats codés, 9 familles) : 19 explorateurs (≈ 0,3 M de jetons chacun), 9 concepteurs
// (≈ 0,3 M), ≈ 10 à 15 paquets de vérification (≈ 0,25 M), 4 relecteurs, 1 critique et 1 arbitre (≈ 0,15 M) :
// ≈ 12 à 15 M de jetons, 2 à 3 h. Avec only = un candidat : ≈ 0,5 à 0,8 M, 30 à 45 min. Repère : l'extension
// de la primaire (5 candidats, 9 agents) a coûté 2,5 M de jetons en 50 min.
// Historique : l'extension de la primaire « Choisir 2027 » a été faite avec la version précédente de ce script
// (git : tools/workflows/3-bank-expansion.js du premier commit), même format de sortie.

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
const SUBJECTS = Array.isArray(C.subjects) ? C.subjects : []
const ADDED = Array.isArray(C.addedApproaches) ? C.addedApproaches : []
const IDS = CODED.map(c => c.id)
const N = IDS.length
const PACKET = C.packetSize ?? 60
const FORBIDDEN = C.forbiddenTerms ?? []
const ALLOW = C.forbiddenTermsAllow ?? []
const topicById = new Map(C.topics.map(t => [t.id, t]))
const pct = x => `${Math.round(x * 100)} %`
const need = share => Math.ceil(share * N - 1e-9)
const MIN_KNOWN_NEW = C.minKnownNew ?? Math.max(3, need(Q.bank.minCandidateShare))
// Candidats exemptés par le propriétaire de la seule couverture par candidat de l'étape 1 (quality.step1.exempt)
const STEP1_EXEMPT = Q.step1?.exempt?.length ? ` (sauf ${Q.step1.exempt.join(', ')}, exemptés de cette seule règle par le propriétaire)` : ''
const lastName = name => name.split(' ').slice(1).join(' ')
// Documents officiels listés dans la configuration (docs : URL ou { url }), puis la source de la déclaration
const docsOf = c => [...(c.docs ?? []).map(d => (typeof d === 'string' ? d : d?.url)), c.declarationSource?.url].filter(Boolean)
const dossiersOf = c => (c.reuseDossier ? [inRepo(c.reuseDossier), `${RESEARCH}/refresh_${c.id}.json`] : [`${RESEARCH}/dossier_${c.id}.json`])
const groupTopics = g => g.topicIds.map(id => topicById.get(id)).filter(Boolean).map(t => ({ id: t.id, label: t.label, description: t.description }))
if (!N) throw new Error('aucun candidat codé (tous pendingPrimary ?)')

const onlyList = Array.isArray(C.only) ? C.only : typeof C.only === 'string' ? [C.only] : []
const pendingOnly = onlyList.filter(x => PENDING.some(c => c.id === x))
if (pendingOnly.length) throw new Error(`only : ${pendingOnly.join(', ')} est en attente (pendingPrimary) : utiliser 6-add-candidate.js`)
const badOnly = onlyList.filter(x => !IDS.includes(x))
if (badOnly.length) throw new Error(`only : ${badOnly.join(', ')} n'est pas un candidat de la configuration`)
const TARGETS = CODED.filter(c => !onlyList.length || onlyList.includes(c.id))
const DESIGN = !onlyList.length || C.newQuestions === true

// Quotas par famille (même règle que 2-question-bank.js : prorata des thèmes, une famille d'un seul thème compte pour deux)
function apportion(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1
  const raw = weights.map(w => (total * w) / sum)
  const out = raw.map(Math.floor)
  let rest = total - out.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1])
  for (let k = 0; rest > 0; k++, rest--) out[order[k % order.length][1]]++
  return out
}
const TARGET_BANK = C.target?.bank ?? Math.round((Q.bank.min + Q.bank.max) / 2)
const bankQuota = apportion(TARGET_BANK, C.groups.map(g => Math.max(2, g.topicIds.length)))
const QUOTA = new Map(C.groups.map((g, i) => [g.id, g.bank ?? bankQuota[i]]))

// ---------------------------------------------------------------------------------------------------------
// Consignes communes

const quote = s => `« ${s} »`
const CONTEXT = `Contexte (date du jour : ${C.contextDate}). ${C.context}

« Isoloir » est une boussole électorale NEUTRE et 100 % locale pour l'élection : ${C.name}. ${N} candidats y sont codés ; identifiants : ${CODED.map(c => `${c.id} = ${c.name} (${c.party})`).join(' ; ')}.${PENDING.length ? `\nCandidats en attente de désignation, NON codés ici (un autre workflow les placera plus tard) : ${PENDING.map(c => `${c.id} = ${c.name} (${c.party} ; dossiers : ${dossiersOf(c).join(' + ')})`).join(' ; ')}.` : ''}
La banque actuelle (questions, approches anonymes, attributions sourcées) est dans ${RESEARCH}/bank.json (clés "bank" et "positions" ; positions[<candidat>][<approche>]). Les dossiers de recherche sont dans ${RESEARCH}/dossier_<id>.json, les données par famille de thèmes dans ${RESEARCH}/groups/<famille>.json. Un chemin relatif l'est à la racine du dépôt (ton dossier de travail) ; utilise Read ou Bash (node/jq) pour les lire.
Une attribution a un poids 2 (approche principale / proposition explicite), 1 (position compatible ou secondaire) ou rejects (rejet explicite) ; une inférence ne dépasse pas le poids 1 ; une confiance low ne compte pas dans le calcul. Un candidat est « connu » sur une question s'il y a une attribution de poids 1 ou 2 de confiance high ou medium. Une attribution fausse est bien pire qu'une case inconnue : aucune supposition.
OUTILS WEB : charge WebFetch via ToolSearch ("select:WebFetch") et lis des URLs connues (documents officiels, URLs des dossiers, liens trouvés dans ces pages) ; les PDF se lisent avec WebFetch. WebSearch est à éviter (quota partagé) : seulement pour retrouver un document officiel introuvable autrement. Paraphrase ; citations de moins de 15 mots. Petits candidats : le programme récent (2025-2026) de leur propre parti est attribuable en confiance medium ; un programme plus ancien ou porté par un autre candidat n'est qu'une inférence de confiance low.`

const STYLE = `- ${Q.bank.approachesMin} à ${Q.bank.approachesMax} approches anonymes, vraies alternatives de politique publique, aussi exclusives que possible ; ensemble, elles couvrent tout l'éventail des positions documentées, pour qu'un électeur de n'importe quelle sensibilité s'y retrouve ;
- infinitif, même structure grammaticale, longueurs comparables (±20 %), même niveau de précision, sans point final, 180 caractères au plus ; aucun adjectif évaluatif ; aucun vocabulaire militant ou disqualifiant, d'aucun bord ;
- jamais de nom de candidat ni de parti, de slogan, de titre de livre ni de mesure-signature nommée (décrire la mesure) ; termes interdits (mots entiers) : ${FORBIDDEN.map(quote).join(', ')}${ALLOW.length ? ` ; ${ALLOW.map(quote).join(', ')} admis seulement dans leur sens courant` : ''} ;
- au plus une approche external (portée par aucun candidat codé) par question ;
- prompt : question courte et neutre ; context : une phrase factuelle commençant par « Aujourd'hui : » (facultatif).`

// ---------------------------------------------------------------------------------------------------------
// Schémas

const SOURCES = {
  type: 'array',
  items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' }, date: { type: 'string' }, publisher: { type: 'string' } }, required: ['title', 'url'] },
}
const POS_PROPS = {
  candidate: { type: 'string', enum: IDS },
  approachId: { type: 'string' },
  weight: { type: 'integer', enum: [0, 1, 2] },
  rejects: { type: 'boolean' },
  nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
  confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  summary: { type: 'string' },
  sources: SOURCES,
}
const POS_REQ = ['candidate', 'approachId', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources']
const POS = { type: 'object', properties: POS_PROPS, required: POS_REQ }
const GAP = {
  type: 'object',
  properties: { questionId: { type: 'string' }, ...POS_PROPS, prompt: { type: 'string', description: 'Énoncé recopié de bank.json' }, approachText: { type: 'string', description: 'Texte de l\'approche recopié de bank.json' } },
  required: ['questionId', ...POS_REQ, 'prompt', 'approachText'],
}
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
          topic: { type: 'string', description: 'un topicId de la configuration, ou un sujet court hors configuration (ex. "fin_de_vie")' },
          position: { type: 'string', description: 'mesure ou position concrète, paraphrasée, chiffrée si possible' },
          already_coded: { type: 'string', description: 'id d\'approche de bank.json qui la code déjà pour ce candidat, ou "" si non codée' },
          nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          source_title: { type: 'string' }, source_url: { type: 'string' }, source_date: { type: 'string' },
        },
        required: ['topic', 'position', 'already_coded', 'nature', 'confidence', 'source_title', 'source_url'],
      },
    },
    gapFills: { type: 'array', items: GAP, description: 'Attributions proposées sur des questions EXISTANTES où le candidat est inconnu' },
  },
  required: ['candidate', 'documents_read', 'positions', 'gapFills'],
}
const QUESTION_PROPS = {
  id: { type: 'string' },
  topicId: { type: 'string', enum: C.topics.map(t => t.id) },
  tier: { type: 'string', enum: ['approfondi'] },
  prompt: { type: 'string' },
  context: { type: 'string' },
  rationale: { type: 'string', description: 'Fracture, qui est où, candidats connus, ce que la question apporte à la banque' },
  approaches: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' }, external: { type: 'boolean' } }, required: ['id', 'text', 'external'] } },
  positions: { type: 'array', items: POS },
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
    questions: { type: 'array', items: { type: 'object', properties: QUESTION_PROPS, required: ['id', 'topicId', 'tier', 'prompt', 'rationale', 'approaches', 'positions'] } },
    dropped: { type: 'array', items: { type: 'object', properties: { what: { type: 'string' }, why: { type: 'string' } }, required: ['what', 'why'] } },
    notes: { type: 'string' },
  },
  required: ['questions', 'notes'],
}
const CHECK = {
  type: 'object',
  properties: {
    questionId: { type: 'string' },
    candidate: { type: 'string', enum: IDS },
    approachId: { type: 'string', description: 'Approche FINALE' },
    fromApproachId: { type: 'string', description: 'Approche proposée, seulement si tu déplaces l\'attribution' },
    verdict: { type: 'string', enum: ['confirmed', 'adjusted', 'refuted', 'unverifiable'] },
    weight: { type: 'integer', enum: [0, 1, 2] },
    rejects: { type: 'boolean' },
    nature: { type: 'string', enum: ['proposition', 'declaration', 'inference'] },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    summary: { type: 'string' },
    sources: SOURCES,
    note: { type: 'string' },
  },
  required: ['questionId', 'candidate', 'approachId', 'verdict', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources', 'note'],
}
const FC_SCHEMA = {
  type: 'object',
  properties: {
    checks: { type: 'array', items: CHECK, description: 'UNE entrée par attribution du paquet, avec les valeurs finales' },
    additions: { type: 'array', items: CHECK, description: 'Nouvelles questions seulement : positions manquantes mais sourcées des candidats du paquet' },
    fetch_log: { type: 'string' },
  },
  required: ['checks'],
}
const EDIT = {
  type: 'object',
  properties: { id: { type: 'string' }, field: { type: 'string', enum: ['prompt', 'context', 'text', 'label', 'description'] }, newText: { type: 'string' }, reason: { type: 'string' } },
  required: ['id', 'field', 'newText', 'reason'],
}
const LENS_SCHEMA = {
  type: 'object',
  properties: {
    edits: { type: 'array', items: EDIT },
    missingApproaches: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, text: { type: 'string' }, why: { type: 'string' } }, required: ['questionId', 'text', 'why'] } },
    positionIssues: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, candidate: { type: 'string' }, approachId: { type: 'string' }, issue: { type: 'string' } }, required: ['questionId', 'issue'] } },
    notes: { type: 'string' },
  },
  required: ['edits', 'missingApproaches', 'positionIssues', 'notes'],
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
    duplicates: { type: 'array', items: { type: 'object', properties: { newId: { type: 'string' }, existingId: { type: 'string' }, why: { type: 'string' } }, required: ['newId', 'existingId', 'why'] } },
    candidatesUnder: { type: 'array', items: { type: 'object', properties: { candidate: { type: 'string' }, scope: { type: 'string', enum: ['bank', 'quick', 'step1'] }, known: { type: 'integer' }, required: { type: 'integer' } }, required: ['candidate', 'scope', 'known', 'required'] } },
    undistinguishedPairs: { type: 'array', items: { type: 'string' } },
    tierChanges: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, newTier: { type: 'string', enum: ['essentiel', 'approfondi'] }, why: { type: 'string' } }, required: ['questionId', 'newTier', 'why'] } },
    step1: { type: 'object', properties: { questionIds: { type: 'array', items: { type: 'string' } }, why: { type: 'string' } }, required: ['questionIds', 'why'] },
    missingSubjects: { type: 'array', items: { type: 'object', properties: { subject: { type: 'string' }, why: { type: 'string' }, candidatesWithPositions: { type: 'array', items: { type: 'string' } }, proposal: { type: 'string' } }, required: ['subject', 'why', 'proposal'] } },
    issues: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['high', 'medium', 'low'] }, questionId: { type: 'string' }, issue: { type: 'string' }, fix: { type: 'string' } }, required: ['severity', 'issue', 'fix'] } },
    summary: { type: 'string' },
  },
  required: ['duplicates', 'candidatesUnder', 'undistinguishedPairs', 'tierChanges', 'step1', 'missingSubjects', 'issues', 'summary'],
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
// Outils de calcul

const logs = []
const down = c => (c === 'high' ? 'medium' : 'low')
const checkKey = c => `${c.questionId}|${c.candidate}|${c.approachId}`
const finalOf = (c, verdict) => ({
  candidate: c.candidate, approachId: c.approachId, weight: c.weight, rejects: c.rejects, nature: c.nature,
  confidence: c.confidence, summary: c.summary, sources: c.sources, verdict, note: c.note,
})
const chunks = (list, size) => {
  const n = Math.max(1, Math.ceil(list.length / size))
  const per = Math.ceil(list.length / n)
  return Array.from({ length: n }, (_, i) => list.slice(i * per, (i + 1) * per)).filter(c => c.length)
}

// Un déplacement d'approche par le vérificateur (fromApproachId → approachId) est reporté sur l'attribution
// proposée, pour que merge-expansion.mjs retrouve la vérification par sa clé questionId|candidate|approachId ;
// un doublon ainsi créé est écarté.
function applyMoves(list, checks, qid) {
  const qOf = e => qid ?? e.questionId
  for (const c of checks) {
    if (!c.fromApproachId || c.fromApproachId === c.approachId) continue
    const p = list.find(e => qOf(e) === c.questionId && e.candidate === c.candidate && e.approachId === c.fromApproachId)
    if (p) p.approachId = c.approachId
  }
  const seen = new Set()
  return list.filter(e => {
    const k = `${qOf(e)}|${e.candidate}|${e.approachId}`
    if (seen.has(k)) { logs.push(`doublon après déplacement ${k}`); return false }
    seen.add(k)
    return true
  })
}

// Vue après vérification (pour les relecteurs et le critique seulement ; merge-expansion.mjs fait foi)
function verifiedView(list, checkMap, qid) {
  return list.map(p => {
    const c = checkMap.get(checkKey({ ...p, questionId: qid ?? p.questionId }))
    if (!c) return { ...p, confidence: down(p.confidence), verdict: 'unchecked' }
    if (c.verdict === 'refuted') return null
    return { ...p, ...finalOf(c, c.verdict) }
  }).filter(Boolean)
}

function packets(questions) {
  const byCand = new Map(IDS.map(id => [id, []]))
  for (const q of questions) for (const p of q.positions) byCand.get(p.candidate)?.push({ questionId: q.id, ...p })
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
    const known = new Set(q.positions.filter(p => p.weight > 0 && p.confidence !== 'low').map(p => p.candidate))
    if (known.size < MIN_KNOWN_NEW) out.push(`${q.id} : ${known.size} candidats connus (minimum ${MIN_KNOWN_NEW})`)
  }
  return out
}

const VERDICTS = `Pour CHAQUE attribution, renvoie une entrée dans "checks" avec les valeurs FINALES :
- confirmed : la source soutient clairement que le candidat porte (ou rejette) CETTE approche telle que formulée ;
- adjusted : la source soutient une version plus faible ou différente → corrige weight (2→1), nature, confidence, summary, ou déplace vers une autre approche de la même question (nouvelle approche dans approachId, ancienne dans fromApproachId ; explique dans note) ;
- refuted : la source ne dit pas ça, dit le contraire, ou concerne quelqu'un d'autre → l'attribution sera supprimée ;
- unverifiable : source inaccessible ET rien d'autre ne confirme → baisse confidence d'un cran (high→medium, medium→low).
Vérifie aussi : pas de sur-interprétation, position récente (2025-2026), bonne nature (inférence ≤ poids 1), au plus un poids 2 et un poids 1 par candidat et par question, summary en une phrase factuelle et neutre.`

const withRetry = (prompt, opts) => agent(prompt, opts).then(r => r ?? agent(prompt, { ...opts, label: `${opts.label}:reprise` }))

// ---------------------------------------------------------------------------------------------------------
// Exploitation des documents (un agent par candidat, partagé entre les deux branches ci-dessous)

const mineMemo = new Map()
const mine = c => {
  if (!mineMemo.has(c.id)) {
    const docs = docsOf(c)
    mineMemo.set(c.id, agent(
      `${CONTEXT}\n\nTA MISSION : extraire de façon exhaustive les positions programmatiques de ${c.name} (${c.party}) à partir de ses DOCUMENTS OFFICIELS, pour combler ses inconnues dans la banque et enrichir le questionnaire approfondi.\n\n1. Repère d'abord ses inconnues : les questions de ${RESEARCH}/bank.json (bank.questions) dont aucune approche n'a, dans positions["${c.id}"], d'attribution de poids 1 ou 2 et de confiance high ou medium. Ce sont tes priorités, d'abord celles du questionnaire rapide (tier "essentiel").\n2. Lis${docs.length ? `, dans cet ordre, ses documents de référence (programme, site, source de la déclaration) : ${docs.join(' ; ')} ; puis` : ' :'} le site de campagne et les programme_sources de son dossier (${dossiersOf(c).join(' + ')}), et le programme récent (2025-2026) de son parti. Suis les liens utiles (pages programme, propositions détaillées, livrets thématiques, professions de foi).\n3. Liste TOUTES les mesures et positions concrètes trouvées (vise 40 à 100), en priorité celles qui ne sont pas encore codées (already_coded = ""), sur les thèmes de la configuration : ${C.topics.map(t => `${t.id} (${t.label})`).join(', ')}. Note aussi, avec un sujet court, les positions sur des sujets hors de ces thèmes (ex. fin de vie) : elles seront signalées pour décision.\n4. gapFills : pour chaque question où ${c.name} est inconnu(e) et où une position extraite correspond clairement à une approche EXISTANTE, propose l'attribution (questionId, approachId, poids, nature, confiance, résumé d'une phrase factuel et neutre, 1 à 3 sources exactes), en recopiant depuis bank.json l'énoncé (prompt) et le texte de l'approche (approachText). Au plus un poids 2 et un poids 1 par question. Si aucune approche ne correspond, ne force pas : la position servira à concevoir de nouvelles questions.${ADDED.length ? `\n5. APPROCHES AJOUTÉES PAR LE PROPRIÉTAIRE (déjà dans bank.json, encore sans candidat) : pour chacune, si ${c.name} la porte, propose l'attribution en gapFills — poids 2 seulement s'il ou elle est encore inconnu(e) sur la question, sinon poids 1 (compatible) s'il n'a pas déjà un poids 1 sur cette question ; si l'approche correspond mieux à sa position principale que son attribution actuelle, signale-le dans notes (« reclassement proposé : <questionId> <ancienne> → <nouvelle> », avec la source) sans le coder. Approches : ${JSON.stringify(ADDED)}` : ''}\nN'invente rien ; chaque position a sa source exacte.`,
      { label: `mine:${c.id}`, phase: 'Mine', schema: MINED },
    ).then(m => {
      if (!m) { logs.push(`exploitation perdue : ${c.id}`); return null }
      m.candidate = c.id
      m.gapFills = (m.gapFills ?? []).filter(g => g.questionId).map(g => ({ ...g, candidate: c.id }))
      return m
    }))
  }
  return mineMemo.get(c.id)
}

// Vérification des compléments d'un candidat, dès que son exploitation est terminée
function checkGapFills(m, c) {
  if (!m || !m.gapFills.length) return { candidate: c.id, gapFills: [], checks: [] }
  const parts = chunks(m.gapFills, PACKET)
  return parallel(parts.map((part, i) => () => withRetry(
    `${CONTEXT}\n\nTA MISSION : VÉRIFICATEUR ADVERSARIAL des compléments proposés pour ${c.name} (paquet ${i + 1}/${parts.length}) : des attributions sur des questions EXISTANTES de ${RESEARCH}/bank.json où ce candidat était inconnu. Essaie de RÉFUTER chacune ; par défaut, sois sceptique. Pour chacune, relis dans bank.json la question et toutes ses approches (l'énoncé et le texte de l'approche recopiés ci-dessous peuvent être faux), relis la ou les sources (WebFetch ; lis chaque URL une seule fois) et vérifie que le candidat porte (ou rejette) exactement CETTE approche. Si l'approche n'existe pas dans cette question de bank.json, ou si le candidat y a déjà une attribution de même poids : refuted (note « approche inconnue » ou « doublon »).\n\n${VERDICTS}\n\nATTRIBUTIONS (${part.length}) :\n${JSON.stringify(part)}`,
    { label: `factcheck:gaps:${c.id}:${i + 1}`, phase: 'Verify', schema: FC_SCHEMA },
  ))).then(results => {
    const ok = results.filter(Boolean)
    if (ok.length < results.length) logs.push(`${c.id} : ${results.length - ok.length} paquet(s) de compléments non vérifié(s)`)
    const checks = ok.flatMap(r => r.checks ?? [])
    return { candidate: c.id, gapFills: applyMoves(m.gapFills.map(g => ({ ...g })), checks), checks }
  })
}

// Conception d'une famille à partir des positions extraites de tous les candidats
function designGroup(g, minedAll) {
  const topics = new Set(g.topicIds)
  const mined = minedAll.flatMap(m => m.positions.filter(p => topics.has(p.topic)).map(p => ({ candidate: m.candidate, ...p })))
  if (!mined.length) { logs.push(`${g.id} : aucune position extraite, pas de conception`); return null }
  const quota = QUOTA.get(g.id)
  return agent(
    `${CONTEXT}\n\nTA MISSION : enrichir le questionnaire APPROFONDI pour la famille « ${g.label} » (${g.id}), thèmes :\n${groupTopics(g).map(t => `- ${t.id} : ${t.label} — ${t.description}`).join('\n')}\n\nCompte d'abord les questions existantes de ces thèmes dans ${RESEARCH}/bank.json : la famille vise environ ${quota} questions au total (toute la banque : ${Q.bank.min} à ${Q.bank.max}). Crée au plus ${quota} − (questions existantes) + 1 nouvelles questions, et aucune si la famille est déjà au quota sauf pour la priorité (b) ci-dessous. La qualité prime sur le quota.\n\nPriorités, dans l'ordre : (a) des fractures où des candidats encore peu connus dans la banque ont des positions sourcées ; (b) des fractures qui séparent des candidats que la banque ne distingue pas encore (même approche principale partout où ils sont tous deux connus) ; (c) un thème de la famille sans question. Ne crée AUCUN doublon d'une question existante.${SUBJECTS.filter(x => topics.has(x.topicId)).length ? `\n\nOBLIGATOIRE, HORS QUOTA (décision du propriétaire) : conçois une question approfondie pour CHACUN de ces sujets, avec ses approches neutres et les positions sourcées des candidats (cherche-les dans les dossiers, groups/${g.id}.json et les documents officiels) ; si un sujet n'atteint vraiment pas le seuil de candidats sourcés, crée-la quand même si au moins 3 candidats sont sourcés et signale-le dans notes, sinon explique pourquoi dans notes : ${JSON.stringify(SUBJECTS.filter(x => topics.has(x.topicId)))}` : ''}\n\nRÈGLES (identiques à la banque existante) :\n- une nouvelle question n'est créée que si au moins ${MIN_KNOWN_NEW} des ${N} candidats y ont une position sourcée (confidence high ou medium) et s'il existe un vrai désaccord : au moins 2 approches principales différentes, aucune ne réunissant plus de ${pct(Q.bank.maxMainShare)} des approches principales connues. Pour atteindre ce seuil, cherche aussi les positions des autres candidats dans ${RESEARCH}/groups/${g.id}.json et leurs dossiers (sources exactes, aucune URL inventée) ;\n${STYLE}\n- chaque candidat : au plus un poids 2 et un poids 1 par question ; inférence ≤ 1 ; summary d'une phrase factuelle et neutre ; 1 à 3 sources exactes ;\n- ids : nouvelles questions "<topicId>-x<n>" (n = premier numéro libre dans bank.json pour ce thème, puis suivants), approches "<questionId>-<lettre>" ; tier "approfondi".${PENDING.length ? `\n- candidats en attente (${PENDING.map(c => c.id).join(', ')}) : aucune position ; lis leurs dossiers et indique dans pendingFit l'approche où chacun se retrouverait quand une position est documentée (ou ajoute l'approche qui manque).` : ''}\n\nPOSITIONS EXTRAITES DES DOCUMENTS OFFICIELS (${mined.length}) :\n${JSON.stringify(mined)}`,
    { label: `design:${g.id}`, phase: 'Design', schema: DESIGN_SCHEMA },
  )
}

// Vérification des positions des nouvelles questions d'une famille, par paquets regroupés par candidat
function verifyGroup(d, g) {
  if (!d) return null
  const ids = new Set()
  d.questions = (d.questions ?? []).filter(q => {
    if (!g.topicIds.includes(q.topicId)) logs.push(`${g.id} : ${q.id} sur le thème ${q.topicId}, hors famille`)
    if (ids.has(q.id)) { logs.push(`${g.id} : id en double ${q.id}`); return false }
    ids.add(q.id)
    const aIds = new Set(q.approaches.map(a => a.id))
    q.tier = 'approfondi'
    q.positions = (q.positions ?? []).filter(p => {
      if (!aIds.has(p.approachId)) { logs.push(`orphan ${q.id} ${p.candidate} ${p.approachId}`); return false }
      return true
    })
    return true
  })
  if (!d.questions.length) return { group: g.id, questions: [], checks: [], notes: d.notes ?? '' }
  const pks = packets(d.questions)
  log(`${g.id} : ${d.questions.length} nouvelle(s) question(s), ${pks.reduce((n, p) => n + p.items.length, 0)} attributions en ${pks.length} paquet(s)`)
  const questionsView = JSON.stringify(d.questions.map(q => ({ id: q.id, prompt: q.prompt, approaches: q.approaches.map(a => `${a.id}${a.external ? ' (external)' : ''} : ${a.text}`) })), null, 1)
  return parallel(pks.map((pk, i) => () => withRetry(
    `${CONTEXT}\n\nTA MISSION : VÉRIFICATEUR ADVERSARIAL des nouvelles questions de la famille « ${g.label} », paquet ${i + 1}/${pks.length} : les attributions de ${pk.cands.join(', ')}. Essaie de RÉFUTER chacune ; par défaut, sois sceptique. Relis chaque source citée (WebFetch ; lis chaque URL une seule fois).\n\n${VERDICTS}\n\nDans "additions", ajoute les positions MANQUANTES de ces candidats (${pk.cands.join(', ')}) sur ces nouvelles questions, si tu les trouves sourcées (${RESEARCH}/groups/${g.id}.json, dossiers, documents officiels) : verdict "confirmed", sources exactes, jamais d'URL inventée.\n\nNOUVELLES QUESTIONS :\n${questionsView}\n\nATTRIBUTIONS À VÉRIFIER (${pk.items.length}) :\n${JSON.stringify(pk.items)}`,
    { label: `factcheck:${g.id}:${i + 1}`, phase: 'Verify', schema: FC_SCHEMA },
  ))).then(results => {
    const ok = results.filter(Boolean)
    if (ok.length < results.length) logs.push(`${g.id} : ${results.length - ok.length} paquet(s) non vérifié(s)`)
    const checks = ok.flatMap(r => r.checks ?? [])
    for (const q of d.questions) {
      q.positions = applyMoves(q.positions, checks, q.id)
      // Ajouts du vérificateur : versés dans la question ET dans les vérifications, pour merge-expansion.mjs
      const aIds = new Set(q.approaches.map(a => a.id))
      for (const a of ok.flatMap(r => r.additions ?? []).filter(x => x.questionId === q.id)) {
        if (a.verdict === 'refuted' || !aIds.has(a.approachId)) continue
        if (q.positions.some(p => p.candidate === a.candidate && p.approachId === a.approachId)) continue
        const { questionId, fromApproachId, verdict, note, ...pos } = a
        q.positions.push(pos)
        checks.push({ ...a, verdict: 'confirmed', note: `ajout du vérificateur. ${note ?? ''}`.trim() })
        logs.push(`added ${q.id} ${a.candidate} ${a.approachId}`)
      }
    }
    return { group: g.id, questions: d.questions, checks, notes: d.notes ?? '', dropped: d.dropped ?? [] }
  })
}

// ---------------------------------------------------------------------------------------------------------
// Déroulé : les compléments de chaque candidat sont vérifiés dès son exploitation ; la conception attend
// toutes les exploitations (elle compare les positions de tous les candidats), puis chaque famille est
// vérifiée sans attendre les autres.

const DESIGN_GROUPS = DESIGN ? C.groups : []
log(`${TARGETS.length} candidat(s) à exploiter${DESIGN ? `, ${DESIGN_GROUPS.length} familles à enrichir (banque visée : ${TARGET_BANK} questions ; ${MIN_KNOWN_NEW} candidats connus par nouvelle question)` : ', sans nouvelle question'}`)
phase('Mine')

const [gapResults, designResults] = await parallel([
  () => pipeline(TARGETS, c => mine(c), (m, c) => checkGapFills(m, c)),
  () => parallel(TARGETS.map(c => () => mine(c))).then(all => {
    const minedAll = all.filter(Boolean)
    if (!DESIGN) return []
    return pipeline(DESIGN_GROUPS, g => designGroup(g, minedAll), (d, g) => verifyGroup(d, g))
  }),
])

const mined = (await parallel(TARGETS.map(c => () => mine(c)))).filter(Boolean)
const missing = TARGETS.filter(c => !mined.some(m => m.candidate === c.id)).map(c => c.id)
if (missing.length) log(`Candidats non exploités : ${missing.join(', ')}`)
const gapOut = (gapResults ?? []).filter(Boolean)
const designOut = (designResults ?? []).filter(Boolean)
const design = {
  newTopics: DESIGN_GROUPS.flatMap(groupTopics),
  questions: designOut.flatMap(d => d.questions),
  gapFills: gapOut.flatMap(r => r.gapFills),
  notes: designOut.map(d => `${d.group} : ${d.notes}${d.dropped?.length ? ` (écartées : ${d.dropped.map(x => `${x.what} — ${x.why}`).join(' ; ')})` : ''}`).join('\n'),
}
const checks = [...designOut.flatMap(d => d.checks), ...gapOut.flatMap(r => r.checks)]
const checkMap = new Map(checks.map(c => [checkKey(c), c]))
log(`${design.questions.length} nouvelle(s) question(s), ${design.gapFills.length} complément(s), ${checks.length} vérification(s)`)

// ---------------------------------------------------------------------------------------------------------
// Relecture des nouvelles questions et critique de couverture

const verifiedQuestions = design.questions.map(q => ({ ...q, positions: verifiedView(q.positions, checkMap, q.id) }))
const verifiedGaps = verifiedView(design.gapFills, checkMap)
const auto = autoChecks(verifiedQuestions)
const textsOnly = design.questions.map(q => ({ id: q.id, topicId: q.topicId, prompt: q.prompt, context: q.context, approaches: q.approaches.map(a => ({ id: a.id, text: a.text, external: a.external })) }))
const compact = verifiedQuestions.map(q => ({
  id: q.id, topicId: q.topicId, prompt: q.prompt, context: q.context,
  approaches: q.approaches.map(a => `${a.id}${a.external ? '*' : ''} : ${a.text}`),
  stances: q.positions.map(p => `${p.candidate}→${p.approachId.split('-').pop()} ${p.rejects ? 'REJ' : `w${p.weight}`}${p.confidence === 'low' ? '?' : ''}`),
  ...(q.pendingFit?.length ? { pendingFit: q.pendingFit.map(f => `${f.candidate}→${f.approachId.split('-').pop()}`) } : {}),
}))
const compactGaps = verifiedGaps.map(p => `${p.questionId} ${p.candidate}→${p.approachId} ${p.rejects ? 'REJ' : `w${p.weight}`} ${p.confidence}`)
const knownTopics = new Set(C.topics.map(t => t.id))
const offTopic = mined.flatMap(m => m.positions.filter(p => !knownTopics.has(p.topic)).map(p => `${m.candidate} [${p.topic}] ${p.position} (${p.source_url})`))

const LENSES = [
  { id: 'gauche', label: 'DE GAUCHE', desc: 'de gauche, de la gauche radicale et anticapitaliste à la social-démocratie et à l\'écologie politique' },
  { id: 'centre', label: 'DU CENTRE', desc: 'du centre, libéral, réformiste et pro-européen, du centre gauche au centre droit' },
  { id: 'droite', label: 'DE DROITE', desc: 'de droite, de la droite libérale et conservatrice à la droite nationale et souverainiste' },
]
const hasNew = design.questions.length > 0
phase('Review')
const reviewThunks = [
  ...LENSES.map(L => async () => (hasNew ? agent(
    `${CONTEXT}\n\nTA MISSION : RELECTEUR DE SENSIBILITÉ ${L.label} des NOUVELLES questions ci-dessous. Lis-les avec le regard d'un électeur ou d'un responsable ${L.desc} : cadrage qui présuppose le diagnostic d'un camp ; absence d'une approche crédible pour cette sensibilité (missingApproaches, même style que les autres) ; approches de cette sensibilité caricaturées, affaiblies, plus longues ou plus vagues ; vocabulaire militant ou disqualifiant de n'importe quel bord ; et, par honnêteté, ce qui la favoriserait indûment. Signale les attributions qui te paraissent douteuses (positionIssues) sans les vérifier. Tes reformulations (edits) ne changent JAMAIS le sens d'une approche ; les ids restent identiques ; un arbitre neutre les confrontera à celles des autres relecteurs. Règles de style :\n${STYLE}\n\nCONTRÔLES AUTOMATIQUES (indicatifs) :\n${auto.join('\n') || 'aucun'}\n\nNOUVELLES QUESTIONS (stances = candidat→lettre poids ; ? = confiance low) :\n${JSON.stringify(compact)}`,
    { label: `review:${L.id}`, phase: 'Review', schema: LENS_SCHEMA },
  ) : null)),
  async () => (hasNew ? agent(
    `${CONTEXT}\n\nTA MISSION : RELECTEUR D'ANONYMAT des NOUVELLES questions ci-dessous. Tu ne vois volontairement que les textes, jamais les attributions (ne lis pas bank.json). Candidats et partis : ${C.candidates.map(c => `${c.name} (${c.party})`).join(', ')}. Pour chaque approche, un lecteur informé reconnaîtrait-il immédiatement un candidat ou un parti (slogan, nom de mesure, formule signature, chiffre emblématique d'une seule personne, vocabulaire propre à un camp, nom propre) ? Si oui, signale-la (recognizable) et propose une reformulation descriptive qui garde le sens (edits). Vérifie aussi les termes interdits (mots entiers) : ${FORBIDDEN.map(quote).join(', ')}, et que les approches d'une même question se ressemblent assez (structure, longueur, précision) pour qu'aucune ne trahisse son auteur. Ne change JAMAIS le sens ; les ids restent identiques.\n\nCONTRÔLES AUTOMATIQUES (indicatifs) :\n${auto.join('\n') || 'aucun'}\n\nTEXTES :\n${JSON.stringify({ topics: design.newTopics, questions: textsOnly })}`,
    { label: 'review:anonymat', phase: 'Review', schema: ANON_SCHEMA },
  ) : null),
  async () => (hasNew || verifiedGaps.length || offTopic.length ? agent(
    `${CONTEXT}\n\nTA MISSION : CRITIQUE DE COUVERTURE après l'extension. Lis ${RESEARCH}/bank.json et combine-le (Bash + node) avec les nouvelles questions et les compléments vérifiés ci-dessous, puis recalcule les règles de la configuration (« connu » = poids 1 ou 2, confiance high ou medium ; « principale » = poids 2 hors inférence) :\n- banque : ${Q.bank.min} à ${Q.bank.max} questions ; chaque candidat connu sur au moins ${pct(Q.bank.minCandidateShare)} des questions ; aucune approche ne réunit plus de ${pct(Q.bank.maxMainShare)} des approches principales connues d'une question ; chaque paire de candidats a des approches principales différentes sur au moins une question ;\n- questionnaire rapide (tier "essentiel", ${Q.quick.min} à ${Q.quick.max} questions) : chaque question connue pour au moins ${need(Q.quick.minKnownShare)} des ${N} candidats ; chaque candidat connu sur au moins ${pct(Q.quick.minCandidateShare)} des questions ; au plus ${Q.quick.maxSpread} questions d'écart entre le mieux et le moins bien couvert ;\n- étape 1 : ${Q.step1.count} questions essentielles, chacune connue pour au moins ${need(Q.step1.minKnownShare)} candidats, chaque candidat connu sur au moins ${Q.step1.minKnownPerCandidate} d'entre elles${STEP1_EXEMPT}.\n\nRenvoie :\n1. duplicates : nouvelles questions qui doublent une question existante (même fracture) ;\n2. candidatesUnder (candidats sous un seuil, avec scope), undistinguishedPairs ("a/b") ;\n3. tierChanges utiles (des compléments ont pu rendre une question assez connue pour le questionnaire rapide, ou une question essentielle reste trop peu connue) et une liste step1 conforme ;\n4. missingSubjects : grands sujets débattus dans cette campagne absents de la banque et des thèmes de la configuration (par ex. fin de vie et aide à mourir), d'après les positions hors thèmes ci-dessous et ta connaissance de la campagne, avec les candidats concernés : ils seront soumis au propriétaire pour décision ;\n5. issues : autres problèmes (inconnues encore comblables et documents à lire, approches qui se recouvrent, équilibre entre sensibilités).\n\nCONTRÔLES AUTOMATIQUES :\n${auto.join('\n') || 'aucun'}\n\nNOUVELLES QUESTIONS (après vérification) :\n${JSON.stringify(compact)}\n\nCOMPLÉMENTS SUR QUESTIONS EXISTANTES (après vérification) :\n${JSON.stringify(compactGaps)}\n\nPOSITIONS HORS THÈMES DE LA CONFIGURATION :\n${JSON.stringify(offTopic)}`,
    { label: 'coverage-critic', phase: 'Review', schema: CRITIC_SCHEMA },
  ) : null),
]
const [gauche, centre, droite, anonymat, critic] = await parallel(reviewThunks)

// ---------------------------------------------------------------------------------------------------------
// Arbitrage des reformulations

const reviewers = { gauche, centre, droite, anonymat }
const proposals = new Map()
for (const [by, r] of Object.entries(reviewers)) {
  for (const e of r?.edits ?? []) {
    const k = `${e.id}|${e.field}`
    if (!proposals.has(k)) proposals.set(k, [])
    proposals.get(k).push({ by, newText: e.newText, reason: e.reason })
  }
}
const qOfId = new Map()
for (const q of design.questions) { qOfId.set(q.id, q); for (const a of q.approaches) qOfId.set(a.id, q) }
const currentText = (id, field) => {
  const t = design.newTopics.find(x => x.id === id)
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
}).filter(i => {
  if (i.current === null) logs.push(`reformulation hors nouvelles questions ignorée : ${i.id}.${i.field}`)
  return i.current !== null
})

phase('Arbitrage')
const arbitrage = items.length ? await agent(
  `${CONTEXT}\n\nTA MISSION : ARBITRE NEUTRE des reformulations proposées par quatre relecteurs (sensibilités gauche, centre et droite ; anonymat) sur les nouvelles questions. Pour chaque texte (id + field), retiens AU PLUS une version finale : une proposition telle quelle, une synthèse de plusieurs, ou aucune. Retiens une reformulation seulement si elle ne change pas le sens (les attributions en dépendent), ne favorise ni ne défavorise aucune sensibilité (une proposition qui rend l'approche du camp de son relecteur plus attrayante, ou celle d'un autre camp moins attrayante, est refusée), respecte les règles de style et améliore réellement la neutralité, l'anonymat ou la clarté. Les corrections d'anonymat passent en priorité. Explique chaque refus dans rejected. Règles de style :\n${STYLE}\n\nPROPOSITIONS :\n${JSON.stringify(items)}`,
  { label: 'arbitrage', phase: 'Arbitrage', schema: ARB_SCHEMA },
) : null
let edits = arbitrage?.edits ?? []
if (items.length && !arbitrage) {
  edits = (anonymat?.edits ?? []).filter(e => currentText(e.id, e.field) !== null)
  logs.push('arbitrage perdu : seules les reformulations du relecteur d\'anonymat sont retenues')
}
// Les libellés et descriptions de thèmes sont fixés par la configuration : seulement proposés. Les
// reformulations d'une question signalée comme doublon (que merge-expansion.mjs écartera) sont ignorées.
const dupIds = new Set((critic?.duplicates ?? []).map(d => d.newId))
const seen = new Set()
const topicEdits = []
edits = edits.filter(e => {
  const k = `${e.id}|${e.field}`
  if (seen.has(k) || currentText(e.id, e.field) === null || dupIds.has(qOfId.get(e.id)?.id)) return false
  seen.add(k)
  if (e.field === 'label' || e.field === 'description') { topicEdits.push(e); return false }
  return true
})

const neutrality = {
  edits,
  duplicates: critic?.duplicates ?? [],
  recognizable: anonymat?.recognizable ?? [],
  notes: [anonymat?.notes, arbitrage?.notes].filter(Boolean).join('\n'),
  proposals: {
    topicEdits,
    missingApproaches: LENSES.flatMap(L => (reviewers[L.id]?.missingApproaches ?? []).map(x => ({ ...x, by: L.id }))),
    positionIssues: LENSES.flatMap(L => (reviewers[L.id]?.positionIssues ?? []).map(x => ({ ...x, by: L.id }))),
  },
}
if (neutrality.duplicates.length) log(`Doublons signalés : ${neutrality.duplicates.map(d => `${d.newId} ≈ ${d.existingId}`).join(', ')}`)

return { mined, design, checks, neutrality, critic, reviews: { ...reviewers, arbitrage }, logs, missing }
