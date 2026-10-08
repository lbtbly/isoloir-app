export const meta = {
  name: 'isoloir-explainers',
  description: 'Neutral, sourced context (summary, explanations, 2-4 verified key figures) and small charts for the listed questions of an election: draft, adversarial fact-check, cross-spectrum neutrality review, cross-question consistency, charts, mechanical checks and one repair pass',
  whenToUse: 'After build-pack has written research/<id>/bank.json, for the new or retouched questions only (args.questions)',
  phases: [
    { title: 'Draft', detail: 'one researcher per batch of questions: summary, points, 2-4 sourced figures' },
    { title: 'Fact-check', detail: 'open every source, confirm or correct each figure, drop unverifiable ones' },
    { title: 'Neutrality', detail: 'left, centre, right and sovereignist readings; no candidate, party or slogan' },
    { title: 'Consistency', detail: 'overlapping figures across questions, fixes applied by the script' },
    { title: 'Charts', detail: 'part / compare / series where a chart helps, checked exactly like build-pack' },
    { title: 'Repair', detail: 'one pass on the batches with mechanical issues, then a new check' },
  ],
}

// « Comprendre l'enjeu » : contexte (résumé, explications) et chiffres clés vérifiés des questions d'une élection,
// avec leurs petits graphiques. Reprise paramétrée du script de la primaire (isoloir-explainers, 3 octobre 2026,
// non versionné), mêmes règles : chiffres officiels lus dans leur source, sources https, aucun candidat ni parti,
// seuls les chiffres « verified » sont gardés. Nouveau : les graphiques (explainer-charts.json), faits à la main
// pour la primaire, sont produits ici et contrôlés par le script avec la règle de tools/build-pack.mjs (tout
// nombre tracé figure dans la valeur ou le libellé du chiffre).
//
// Usage (la session principale lit research/<id>/config.json et le passe en args, complété) :
//   Workflow({ scriptPath: 'tools/workflows/4-explainers.js', args: { ...config, root, questions: [...] } })
// args :
//   …config.json     id, name, context, contextDate, candidates, topics, groups, forbiddenTerms, forbiddenTermsAllow
//   root             racine du dépôt, en chemin absolu (défaut « . », le dossier de travail des agents)
//   questions        OBLIGATOIRE, les seules questions à expliquer (nouvelles ou retouchées). Chaque élément est
//                    un identifiant (« finances_publiques-1 ») ou un objet { id, topicId?, from?, note? } :
//                    topicId si l'identifiant ne commence pas par l'identifiant du thème ; from = « <élection>/<question> »
//                    (« choisir-2027/fiscalite-1 ») pour repartir d'une explication publiée ; note = ce qui a changé.
//   today            date du jour (défaut : contextDate) ; un workflow ne lit pas l’horloge
//   bankFile         banque à lire (défaut : <root>/research/<id>/bank.json, écrit par build-pack)
//   batchSize        questions par chercheur (défaut 5) ; les questions d'un même thème restent ensemble
//   skipConsistency  sauter la vérification de cohérence entre questions
// Sortie (résultat du workflow, enregistré par le harnais dans wf_<runId>.json) :
//   explainers   [{ questionId, summary, points, figures }] ; figures : uniquement les chiffres verified=true,
//                dans l'ordre auquel renvoient les graphiques ; corrections de cohérence déjà appliquées
//   charts       [{ questionId, index, chart }] au format de research/<id>/explainer-charts.json, déjà contrôlés
//   consistency  { fixes: [] (vide : tout est appliqué ici), applied, unapplied, notes }
//   issues       défauts qui restent après la réparation (à arbitrer) ; missing : questions sans explication ;
//   dropped      lots perdus et chiffres non vérifiés retirés ; batchNotes ; stats
// Les explications reprises telles quelles d'une autre élection (research/<id>/reuse.json) ne passent pas par
// ce workflow ; une question reprise mais retouchée y passe avec from.
// Ensuite :
//   node tools/merge-explainers.mjs <wf_runId.json> research/<id> --config research/<id>/config.json --merge
//     (--merge garde les explications et graphiques des questions hors de cette exécution)
//   node tools/build-pack.mjs …   (contrôle à nouveau sources et graphiques)

const C = args
if (!C || !C.id || !Array.isArray(C.candidates) || !Array.isArray(C.topics)) throw new Error('args = research/<id>/config.json (+ root, questions) attendu')
const ROOT = String(C.root ?? '.').replace(/\/+$/, '') || '.'
if (!C.root) log('args.root absent : chemins relatifs au dossier de travail')
const TODAY = C.today || C.contextDate
const RESEARCH = `${ROOT}/research/${C.id}`
const BANK = C.bankFile || `${RESEARCH}/bank.json`
const BATCH_SIZE = Number.isInteger(C.batchSize) && C.batchSize > 0 ? C.batchSize : 5

// ——— Questions et lots ———

const QUESTIONS = []
for (const raw of C.questions ?? []) {
  const q = typeof raw === 'string' ? { id: raw } : raw
  if (!q || typeof q.id !== 'string' || QUESTIONS.some(x => x.id === q.id)) continue
  if (q.from !== undefined && !/^[\w-]+\/[\w-]+$/.test(q.from)) throw new Error(`args.questions : « from » attendu sous la forme <élection>/<question> (${q.id} : ${q.from})`)
  QUESTIONS.push(q)
}
if (!QUESTIONS.length) throw new Error('args.questions : liste non vide des questions à expliquer attendue')

const TOPIC = new Map(C.topics.map(t => [t.id, t]))
function topicIdOf(q) {
  if (q.topicId && TOPIC.has(q.topicId)) return q.topicId
  let best = ''
  for (const t of C.topics) if (q.id.startsWith(`${t.id}-`) && t.id.length > best.length) best = t.id
  return best
}
// Ordre des familles, puis des thèmes hors famille, puis des questions sans thème reconnu
const ORDER = [...(C.groups ?? []).flatMap(g => g.topicIds), ...C.topics.map(t => t.id), ''].filter((id, i, a) => a.indexOf(id) === i)
const byTopic = new Map()
for (const q of QUESTIONS) {
  const t = topicIdOf(q)
  if (!byTopic.has(t)) byTopic.set(t, [])
  byTopic.get(t).push(q)
}
const chunks = []
let current = []
const flush = () => {
  if (current.length) chunks.push(current)
  current = []
}
for (const t of ORDER.filter(id => byTopic.has(id))) {
  const qs = byTopic.get(t)
  if (qs.length > BATCH_SIZE) {
    flush()
    for (let i = 0; i < qs.length; i += BATCH_SIZE) chunks.push(qs.slice(i, i + BATCH_SIZE))
    continue
  }
  if (current.length + qs.length > BATCH_SIZE) flush()
  current.push(...qs)
}
flush()
const BATCHES = chunks.map((items, i) => {
  const topics = items.map(topicIdOf).filter((t, j, a) => a.indexOf(t) === j)
  return {
    key: `${String(i + 1).padStart(2, '0')}-${topics.map(t => t || 'autres').join('+')}`,
    label: topics.map(t => TOPIC.get(t)?.label ?? 'thème à lire dans la banque').join(', '),
    ids: items.map(q => q.id),
    items,
  }
})
log(`${QUESTIONS.length} question(s) en ${BATCHES.length} lot(s)`)

// ——— Neutralité : noms et termes interdits ———

const NAMES = C.candidates.map(c => c.name)
const SURNAMES = NAMES.map(n => n.split(' ').slice(1).join(' ')).filter(Boolean)
const PARTIES = C.candidates.map(c => c.party).filter((p, i, a) => p && !/^Sans /.test(p) && a.indexOf(p) === i)
const strip = s => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/’/g, "'")
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const ALLOW = new Set((C.forbiddenTermsAllow ?? []).map(t => strip(t).toLowerCase()))
const TERMS = [...(C.forbiddenTerms ?? []), ...PARTIES, ...NAMES, ...SURNAMES].filter((t, i, a) => t && a.indexOf(t) === i && !ALLOW.has(strip(t).toLowerCase()))
// Mot entier, sans accents. Un sigle ou un nom propre d'un seul mot (« RN », « Horizons », « Philippe ») est
// cherché avec sa casse, pour ne pas confondre « Horizons » avec « horizons » ; une expression l'est sans casse.
const MATCHERS = TERMS.map(t => {
  const s = strip(t)
  const sensitive = !/\s/.test(s) && s !== s.toLowerCase()
  return { term: t, re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(s).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, sensitive ? 'u' : 'iu') }
})
const termsIn = text => MATCHERS.filter(m => m.re.test(strip(text))).map(m => m.term)

// ——— Contrôle des graphiques : la règle de tools/build-pack.mjs, à l'identique ———

const flat = s => String(s).replace(/[\s  ]+/g, ' ')
const frFormat = (n, d) => {
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) return flat(new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n))
  // Repli sans Intl : identique dans les cas utilisés ici (d ≥ nombre de décimales de n, donc sans arrondi)
  const [i, f] = n.toFixed(d).split('.')
  const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return f ? `${g},${f}` : g
}
const decimals = n => (String(n).split('.')[1] ?? '').length
function writtenIn(text, n) {
  const a = Math.abs(n)
  const forms = []
  for (let d = decimals(a); d <= decimals(a) + 2; d++) forms.push(escapeRe(frFormat(a, d)))
  for (const [k, word] of [[1e6, '(?:millions?|M)'], [1e9, '(?:milliards?|Md)']]) {
    const v = a / k
    if (v < 1) continue
    for (let d = 0; d <= 3; d++) if (Math.abs(Number(v.toFixed(d)) - v) < 1e-9) forms.push(`${escapeRe(frFormat(v, d))} ${word}`)
  }
  return forms.some(f => new RegExp(`(?<![\\d,])(?<!\\d )${f}(?!\\d|,\\d| \\d{3}(?!\\d))`).test(flat(text)))
}
const finite = v => typeof v === 'number' && Number.isFinite(v)
const shortText = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max
/** Graphique nettoyé, ou la raison de son refus */
function checkChart(c, explainer) {
  if (!explainer) return { error: 'question sans explication' }
  if (!Number.isInteger(c.index) || c.index < 0 || c.index >= explainer.figures.length) return { error: `index hors des ${explainer.figures.length} chiffres` }
  const g = c.chart ?? {}
  if (g.unit !== undefined && g.unit !== '' && !shortText(g.unit, 32)) return { error: 'unité vide ou trop longue' }
  const unit = g.unit ? { unit: g.unit } : {}
  let chart
  if (g.kind === 'part') {
    if (!finite(g.value) || !finite(g.total) || g.total <= 0 || g.value < 0 || g.value > g.total) return { error: 'part : 0 ≤ value ≤ total, total > 0' }
    if (g.whole !== undefined && g.whole !== '' && !shortText(g.whole, 48)) return { error: 'part : « whole » vide ou trop long' }
    if (!g.unit && g.whole && /^(?:des|du|de)\s|^d[’']/.test(g.whole)) return { error: `part sans unité : « ${g.whole} » ne doit pas commencer par un article` }
    chart = { kind: 'part', value: g.value, total: g.total, ...unit, ...(g.whole ? { whole: g.whole } : {}) }
  } else if (g.kind === 'compare' || g.kind === 'series') {
    const [min, max] = g.kind === 'compare' ? [2, 4] : [2, 6]
    if (!Array.isArray(g.items) || g.items.length < min || g.items.length > max) return { error: `${g.kind} : de ${min} à ${max} éléments` }
    for (const i of g.items) {
      if (!shortText(i.label, 32)) return { error: `${g.kind} : étiquette vide ou de plus de 32 caractères (${i.label})` }
      if (!finite(i.value)) return { error: `${g.kind} : valeur non finie pour « ${i.label} »` }
    }
    if (new Set(g.items.map(i => i.label)).size !== g.items.length) return { error: `${g.kind} : étiquettes en double` }
    chart = { kind: g.kind, ...unit, items: g.items.map(i => ({ label: i.label, value: i.value })) }
  } else return { error: `type inconnu (${g.kind})` }
  const figure = explainer.figures[c.index]
  const plotted = chart.kind === 'part' ? [chart.value, ...(chart.unit === '%' && chart.total === 100 ? [] : [chart.total])] : chart.items.map(i => i.value)
  const absent = plotted.filter(n => !writtenIn(`${figure.value} ${figure.label}`, n))
  if (absent.length) return { error: `nombre absent de la valeur et du libellé du chiffre (${absent.join(', ')})` }
  return { chart }
}

// ——— Consignes ———

const readCmd = (bankFile, ids) =>
  `node -e 'const {bank}=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));for(const id of process.argv.slice(2)){const q=bank.questions.find(x=>x.id===id);if(!q){console.log(id+" : introuvable");continue}const {explainer,...rest}=q;console.log(JSON.stringify(rest))}' ${bankFile} ${ids.join(' ')}`
const readPublishedCmd = from => {
  const [election, id] = from.split('/')
  return `node -e 'const fs=require("fs");const [dir,id]=process.argv.slice(1);const e=JSON.parse(fs.readFileSync(dir+"/explainers.json","utf8")).explainers.find(x=>x.questionId===id);let c=[];try{c=JSON.parse(fs.readFileSync(dir+"/explainer-charts.json","utf8")).charts.filter(x=>x.questionId===id)}catch{}console.log(JSON.stringify({explainer:e??null,charts:c}))' ${ROOT}/research/${election} ${id}`
}
const FROM_ELECTIONS = QUESTIONS.filter(q => q.from).map(q => q.from.split('/')[0]).filter((e, i, a) => a.indexOf(e) === i)

const CONTEXT = `Projet : « Isoloir », boussole électorale indépendante et neutre pour l'élection : ${C.name} (aujourd'hui : ${TODAY}). ${C.context}

Chaque question propose des « approches » anonymes ; l'utilisateur dit s'il est d'accord, sans avis ou pas d'accord. À côté de chaque question, la rubrique « Comprendre l'enjeu » donne le CONTEXTE : un résumé de l'enjeu, quelques explications et des chiffres clés issus de sources sûres, pour que l'électeur comprenne l'enjeu avant de répondre. Ces textes sont rédigés par une IA et vérifiés automatiquement, sans relecture humaine une par une : leur exactitude et leur neutralité reposent sur toi.

Les questions sont dans ${BANK} (objet { bank: { topics, questions }, positions }), fichier volumineux : lis seulement tes questions avec la commande donnée plus bas. Chaque question a : id, topicId, tier, prompt, context (une ligne « Aujourd'hui : … » déjà vérifiée, à ne pas répéter mot pour mot), approaches (textes des approches). N'utilise PAS positions (qui porte quoi) : le contexte doit rester indépendant des candidats.

RÈGLES ABSOLUES
1. Neutralité : aucun nom de candidat (${NAMES.join(', ')}), aucun parti, mouvement ou groupe parlementaire désigné par le nom d'un parti (${[...PARTIES, ...(C.forbiddenTerms ?? [])].filter((t, i, a) => a.indexOf(t) === i).join(', ')}), aucune étiquette politique (« extrême droite », « extrême gauche », « macronie »…), aucun slogan, aucun nom de mesure-signature. Le contexte ne doit ni plaider pour une approche ni en disqualifier une, quel que soit le bord : un électeur de gauche, du centre, de droite ou souverainiste doit le trouver juste. Si un chiffre sert spontanément un camp, ajoute le chiffre qui éclaire l'autre côté, ou choisis un chiffre descriptif.
2. Sources sûres, primaires de préférence : INSEE, DREES, DARES, DEPP, SIES, SSMSI, DGEF/ministère de l'Intérieur, OFPRA, OFII, Santé publique France, Assurance maladie, Agence de la biomédecine, INED, Conseil d'orientation des retraites, Cour des comptes, Haut Conseil des finances publiques, Banque de France, Agence France Trésor, DGFiP, DGAFP, France Stratégie, Conseil d'analyse économique, ADEME, RTE, CRE, Haut Conseil pour le climat, Citepa, Arcep, CNIL, Arcom, Défenseur des droits, CNCDH, DILCRAH, CCNE, Conseil d'État et Conseil constitutionnel (décisions, études), Eurostat, Commission européenne, Parlement européen, Conseil de l'UE, OCDE, FMI, Banque mondiale, ONU/HCR/OCHA, CIJ, CPI, SIPRI, OTAN, Assemblée nationale et Sénat (rapports, comptes rendus), vie-publique.fr, legifrance.gouv.fr, budget.gouv.fr, ministères (statistiques publiques). Les médias ne servent qu'en dernier recours et seulement pour un fait vérifiable (AFP, Le Monde, Les Échos…). Interdits : think tanks ou fondations partisanes, associations militantes (sauf chiffre repris et attribué par une institution publique), sites de partis ou de candidats, blogs, Wikipédia comme source finale.
3. Chaque chiffre : la valeur exacte telle qu'elle figure dans la source, son périmètre (France entière, métropole, zone euro…), sa date ou année, et l'URL PRÉCISE https de la page qui le contient (pas une page d'accueil). Le plus récent disponible. Aucun chiffre sans source. Aucune estimation personnelle, aucun calcul de ta part (pas de pourcentage ni d'écart recalculé), aucun arrondi trompeur.
4. Lisible en 30 secondes : un « summary » de 1 à 2 phrases (l'enjeu, pourquoi la question divise), 1 à 3 « points » d'explication courts (un mécanisme, un terme, un calendrier, une règle en vigueur ; un point contenant un fait chiffré ou daté doit porter sa source), et 2 à 4 « figures ». Français soigné, ton factuel, phrases courtes, pas de jargon non expliqué. Valeurs écrites à la française (virgule décimale, « 3 460 Md€ », « 15,7 % »).
5. Politique étrangère (Ukraine, Gaza, défense) : faits issus d'organisations internationales ou d'institutions publiques ; date claire de chaque bilan humain ou chiffre de conflit, et qui le produit (ex. « selon le ministère de la Santé de Gaza, repris par l'OCHA »).
6. Sujets de société (droits des personnes LGBTQIA+, fin de vie, laïcité, immigration, sécurité) : vocabulaire descriptif, celui de la loi et de la statistique publique, sans terme militant d'aucun bord ; présente l'état du droit en vigueur et ses dates.
7. Un chiffre gagne souvent à être comparé (avant/après, part d'un tout, évolution) : écris alors dans son libellé les nombres de comparaison tirés de la MÊME source (« contre 3,1 % en 2019 », « sur 4 717 396 nécessaires »). Un graphique ne pourra montrer que des nombres écrits dans la valeur ou le libellé.

Outils : charge WebSearch et WebFetch avec ToolSearch (query "select:WebSearch,WebFetch"). Si WebSearch est indisponible (quota), continue avec WebFetch sur les sites des institutions de la règle 2 (pages de statistiques, rapports, bases de données). Ne modifie AUCUN fichier du projet et n'écris rien sur le disque : lecture seule (Read, ou Bash pour node, jq ou curl envoyé dans un pipe).`

const SOURCE = {
  type: 'object',
  properties: { title: { type: 'string' }, url: { type: 'string' }, publisher: { type: 'string' }, date: { type: 'string' } },
  required: ['title', 'url', 'publisher'],
}
const EXPLAINER = {
  type: 'object',
  properties: {
    questionId: { type: 'string' },
    summary: { type: 'string' },
    points: { type: 'array', items: { type: 'object', properties: { text: { type: 'string' }, source: SOURCE }, required: ['text'] } },
    figures: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          label: { type: 'string' },
          date: { type: 'string' },
          source: SOURCE,
          verified: { type: 'boolean' },
          quote: { type: 'string' },
        },
        required: ['value', 'label', 'date', 'source'],
      },
    },
  },
  required: ['questionId', 'summary', 'points', 'figures'],
}
const EXPLAINERS = {
  type: 'object',
  properties: { explainers: { type: 'array', items: EXPLAINER }, notes: { type: 'array', items: { type: 'string' } } },
  required: ['explainers', 'notes'],
}
const CHART = {
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['part', 'compare', 'series'] },
    value: { type: 'number' },
    total: { type: 'number' },
    unit: { type: 'string' },
    whole: { type: 'string' },
    items: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'number' } }, required: ['label', 'value'] } },
  },
  required: ['kind'],
}
const CHARTS_ITEMS = {
  type: 'array',
  items: { type: 'object', properties: { questionId: { type: 'string' }, index: { type: 'integer' }, chart: CHART }, required: ['questionId', 'index', 'chart'] },
}
const CHARTS = { type: 'object', properties: { charts: CHARTS_ITEMS, notes: { type: 'array', items: { type: 'string' } } }, required: ['charts', 'notes'] }
const REPAIRED = {
  type: 'object',
  properties: { explainers: { type: 'array', items: EXPLAINER }, charts: CHARTS_ITEMS, notes: { type: 'array', items: { type: 'string' } } },
  required: ['explainers', 'charts', 'notes'],
}

function questionList(batch) {
  return batch.items
    .map(q => {
      const t = TOPIC.get(topicIdOf(q))
      const lines = [`- ${q.id}${t ? ` (thème : ${t.label} — ${t.description})` : ''}`]
      if (q.from) lines.push(`  point de départ : l'explication publiée pour ${q.from}, à lire avec : ${readPublishedCmd(q.from)}`)
      if (q.note) lines.push(`  à savoir : ${q.note}`)
      return lines.join('\n')
    })
    .join('\n')
}
const FROM_RULE = `Quand une question a un « point de départ » : reprends ce qui reste exact, à jour au ${TODAY} et neutre pour cette élection (un débat entre tous les bords, et non plus interne à une famille politique) ; adapte le texte à l'énoncé et aux approches de la question ; mets chaque chiffre à jour avec la valeur la plus récente et relis-le dans sa source. L'énoncé d'origine se lit avec la même commande sur ${ROOT}/research/<élection>/bank.json.`

// ——— Rédaction, vérification adverse, neutralité ———

const checked = await pipeline(
  BATCHES,
  batch =>
    agent(
      `${CONTEXT}\n\nTA MISSION (rédaction) : pour chacune des questions suivantes, lis-la (énoncé, contexte, approches) et produis son explication : summary, points, figures (2 à 4). Cherche les chiffres avec WebSearch puis OUVRE chaque page source avec WebFetch pour lire la valeur exacte avant de l'écrire ; renseigne « quote » avec la phrase ou la ligne de tableau de la source qui contient le chiffre ; laisse verified à false, le vérificateur s'en charge.\nQuestions (thèmes : ${batch.label}) :\n${questionList(batch)}\nLecture des questions : ${readCmd(BANK, batch.ids)}\n${FROM_RULE}\nDans notes, signale toute difficulté (chiffre introuvable, source ancienne, approche qu'aucun chiffre public n'éclaire).`,
      { label: `draft:${batch.key}`, phase: 'Draft', schema: EXPLAINERS },
    ),
  (draft, batch) =>
    draft &&
    agent(
      `${CONTEXT}\n\nTA MISSION (vérification adverse des faits) : voici le brouillon d'un autre chercheur pour les questions ${batch.ids.join(', ')} (lecture des questions : ${readCmd(BANK, batch.ids)}). Pour CHAQUE chiffre et CHAQUE point sourcé : ouvre l'URL avec WebFetch et vérifie que la page contient bien cette valeur, pour ce périmètre et cette date. Si la page ne la contient pas, si la valeur diffère, si la source n'est pas sûre au sens de la règle 2, si l'URL n'est pas en https, ou si une source plus récente et plus officielle donne une autre valeur : corrige (valeur, libellé, date, URL précise, quote) ou remplace par un chiffre vérifié ; s'il ne reste pas 2 chiffres vérifiés pour une question, trouves-en de nouveaux et vérifie-les toi-même. Mets verified=true uniquement sur les chiffres dont tu as lu la valeur dans la page. Supprime tout chiffre invérifiable. Rends l'ensemble corrigé (même schéma) et liste chaque correction dans notes (« questionId : avant → après, raison »).\n\nBROUILLON :\n${JSON.stringify(draft)}`,
      { label: `factcheck:${batch.key}`, phase: 'Fact-check', schema: EXPLAINERS },
    ),
  (verified, batch) =>
    verified &&
    agent(
      `${CONTEXT}\n\nTA MISSION (relecture de neutralité et de clarté) : relis les explications vérifiées ci-dessous pour les questions ${batch.ids.join(', ')}, en les comparant aux approches de chaque question (lecture : ${readCmd(BANK, batch.ids)}). Relis-les successivement comme le ferait un électeur de gauche, du centre, de droite, puis souverainiste : chacun doit y trouver les faits utiles à son approche et aucun cadrage qui la disqualifie. Corrige : tout ce qui favorise ou disqualifie une approche (choix des chiffres, adjectifs, ordre, cadrage), toute trace de candidat, de parti, d'étiquette politique ou de slogan, tout vocabulaire militant, tout jargon non expliqué, toute phrase trop longue, la typographie française. Si un chiffre est utile mais unilatéral, ajoute en regard un chiffre vérifié qui éclaire l'autre approche (ouvre sa source avec WebFetch et mets verified=true seulement si tu as lu la valeur), ou remplace-le. Ne touche pas aux valeurs vérifiées sans raison et garde verified tel quel. Rends l'ensemble final (même schéma) et liste tes changements dans notes.\n\nEXPLICATIONS VÉRIFIÉES :\n${JSON.stringify(verified)}`,
      { label: `neutrality:${batch.key}`, phase: 'Neutrality', schema: EXPLAINERS },
    ),
)

// Ne garder que les questions du lot et les chiffres lus dans leur source
const byId = new Map()
const batchNotes = []
const dropLog = []
checked.forEach((r, i) => {
  const batch = BATCHES[i]
  if (!r) {
    dropLog.push(`lot ${batch.key} perdu (${batch.ids.join(', ')})`)
    return
  }
  batchNotes.push({ batch: batch.key, notes: r.notes ?? [] })
  for (const e of r.explainers ?? []) {
    if (!batch.ids.includes(e.questionId)) {
      dropLog.push(`${batch.key} : question hors du lot ignorée (${e.questionId})`)
      continue
    }
    const figures = (e.figures ?? []).filter(f => f.verified === true)
    if (figures.length < (e.figures ?? []).length) dropLog.push(`${e.questionId} : ${(e.figures ?? []).length - figures.length} chiffre(s) non vérifié(s) retiré(s)`)
    byId.set(e.questionId, { ...e, figures })
  }
})
for (const line of dropLog) log(line)

// ——— Cohérence entre questions ———

let consistency = { fixes: [], applied: [], unapplied: [], notes: [] }
if (!C.skipConsistency && byId.size) {
  phase('Consistency')
  const figures = [...byId.values()].flatMap(e => e.figures.map(f => ({ questionId: e.questionId, value: f.value, label: f.label, date: f.date, url: f.source?.url })))
  const others = [`${RESEARCH}/explainers.json (s'il existe : explications déjà publiées pour cette élection)`, ...FROM_ELECTIONS.map(el => `${ROOT}/research/${el}/explainers.json (explications reprises)`)]
  const r = await agent(
    `${CONTEXT}\n\nTA MISSION (cohérence transversale) : voici tous les chiffres retenus pour les ${byId.size} questions de cette exécution. Repère les chiffres qui se recoupent (même indicateur avec des valeurs, dates ou périmètres différents : dette, déficit, chômage, prix de l'énergie, effectifs, etc.) et les incohérences, entre ces questions et avec les chiffres déjà publiés : ${others.join(' ; ')}. Pour chaque incohérence, ouvre les sources avec WebFetch, détermine la valeur juste et la plus récente, et propose la correction précise (questionId, ancienne valeur exactement comme écrite, nouvelle valeur, libellé, date, URL, titre, éditeur). Ne propose de correction que pour les questions de cette exécution (${[...byId.keys()].join(', ')}) ; une correction à faire dans une explication déjà publiée va dans notes, avec son questionId. Une même valeur peut rester si seul le libellé doit préciser le périmètre : donne alors value = oldValue et le libellé corrigé. N'invente rien.\n\nCHIFFRES :\n${JSON.stringify(figures)}`,
    {
      label: 'consistency',
      phase: 'Consistency',
      schema: {
        type: 'object',
        properties: {
          fixes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                questionId: { type: 'string' },
                oldValue: { type: 'string' },
                value: { type: 'string' },
                label: { type: 'string' },
                date: { type: 'string' },
                url: { type: 'string' },
                title: { type: 'string' },
                publisher: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['questionId', 'oldValue', 'value', 'reason'],
            },
          },
          notes: { type: 'array', items: { type: 'string' } },
        },
        required: ['fixes', 'notes'],
      },
    },
  )
  // Appliquées ici, comme le ferait merge-explainers, pour que les graphiques portent sur les valeurs finales
  const bare = s => String(s ?? '').replace(/\s/g, '')
  for (const fix of r?.fixes ?? []) {
    const f = byId.get(fix.questionId)?.figures.find(x => bare(x.value) === bare(fix.oldValue))
    if (!f) {
      consistency.unapplied.push({ ...fix, why: byId.has(fix.questionId) ? 'chiffre introuvable' : 'question hors de cette exécution' })
      continue
    }
    if (fix.url && !/^https:\/\//.test(fix.url)) {
      consistency.unapplied.push({ ...fix, why: 'source non https' })
      continue
    }
    f.value = fix.value
    if (fix.label) f.label = fix.label
    if (fix.date) f.date = fix.date
    if (fix.url) f.source = { ...f.source, url: fix.url, ...(fix.title ? { title: fix.title } : {}), ...(fix.publisher ? { publisher: fix.publisher } : {}) }
    consistency.applied.push(fix)
  }
  consistency.notes = r?.notes ?? (r ? [] : ['agent de cohérence perdu : vérification non faite'])
  log(`cohérence : ${consistency.applied.length} correction(s) appliquée(s), ${consistency.unapplied.length} non appliquée(s)`)
}

// ——— Contrôles mécaniques d'un lot ———

function issuesOf(batch, explainers, charts) {
  const issues = []
  for (const id of batch.ids) {
    const e = explainers.get(id)
    if (!e) {
      issues.push(`${id} : aucune explication`)
      continue
    }
    if (!String(e.summary ?? '').trim()) issues.push(`${id} : résumé vide`)
    if (e.figures.length < 2) issues.push(`${id} : ${e.figures.length} chiffre(s) vérifié(s), 2 au moins attendus`)
    if (e.figures.length > 4) issues.push(`${id} : ${e.figures.length} chiffres, 4 au plus`)
    const texts = [e.summary, ...(e.points ?? []).map(p => p.text), ...e.figures.flatMap(f => [f.value, f.label])]
    for (const t of texts) for (const term of termsIn(t)) issues.push(`${id} : terme interdit « ${term} » dans « ${t} »`)
    for (const f of e.figures) {
      if (!String(f.value ?? '').trim() || !String(f.label ?? '').trim() || !String(f.date ?? '').trim()) issues.push(`${id} : chiffre incomplet (valeur, libellé ou date) « ${f.value} »`)
      if (!/^https:\/\//.test(f.source?.url ?? '')) issues.push(`${id} : source non https pour « ${f.value} » (${f.source?.url})`)
    }
    for (const p of e.points ?? []) if (p.source && !/^https:\/\//.test(p.source.url ?? '')) issues.push(`${id} : source non https pour un point (${p.source.url})`)
  }
  for (const c of charts.rejected) issues.push(`${c.questionId}#${c.index} : graphique refusé, ${c.error}`)
  return issues
}
function sortCharts(batch, list, explainers) {
  const kept = []
  const rejected = []
  const seen = new Set()
  for (const c of list ?? []) {
    const key = `${c.questionId}#${c.index}`
    if (!batch.ids.includes(c.questionId)) continue
    if (seen.has(key)) {
      rejected.push({ ...c, error: 'graphique en double' })
      continue
    }
    const r = checkChart(c, explainers.get(c.questionId))
    if (r.error) rejected.push({ ...c, error: r.error })
    else {
      seen.add(key)
      kept.push({ questionId: c.questionId, index: c.index, chart: r.chart })
    }
  }
  return { kept, rejected }
}
const figureList = (batch, explainers) =>
  batch.ids
    .filter(id => explainers.has(id))
    .map(id => ({ questionId: id, figures: explainers.get(id).figures.map((f, index) => ({ index, value: f.value, label: f.label, date: f.date })) }))

const CHART_RULES = `Types (FigureChart, src/core/types.ts) :
- part : une part d'un tout. { kind: "part", value, total, unit?, whole? } avec 0 ≤ value ≤ total et total > 0. Pour un pourcentage : total = 100 et unit « % ». whole dit ce qu'est le tout (48 caractères au plus) : « des suffrages exprimés » avec unit « % », « soutiens nécessaires » sans unité ; sans unité, whole ne commence pas par un article (« des », « du », « de », « d’ ») car il suit directement un nombre.
- compare : 2 à 4 grandeurs de même unité, à la même échelle. { kind: "compare", unit?, items: [{ label, value }] } ; étiquettes de 32 caractères au plus, toutes différentes ; valeurs négatives permises.
- series : une évolution dans le temps, 2 à 6 points dans l'ordre chronologique. { kind: "series", unit?, items: [{ label: année ou date, value }] }.
- unit : 32 caractères au plus (« % », « Md€ », « € », « députés »…), commune à tous les éléments ; omets-la plutôt que de la laisser vide.
Règles :
1. Chaque nombre tracé (value, et total sauf pour un pourcentage sur 100 ; ou chaque value des items) doit être écrit tel quel dans la valeur ou le libellé du chiffre, à la française : « 27,99 » → 27.99, « 1 093 030 » → 1093030 ; même nombre de décimales ou des zéros en plus (« 3,0 % » → 3) ; un grand nombre peut être écrit en millions ou en milliards (« 2,76 millions » → 2760000, « 3 460 Md€ » avec unit « Md€ » → 3460) ; un nombre négatif peut l'être sans son signe (« a baissé de 2,1 % » → -2.1). Jamais de base inventée (« 1 » face à « 4,3 fois ») ni de nombre calculé (différence, somme, total ou reste que le texte n'écrit pas). Le contrôle est automatique : un graphique qui ne le passe pas est retiré.
2. Pas de graphique quand il n'apporterait rien : nombre seul sans point de comparaison, date, rang, durée, nombre d'articles de loi… Dans l'élection précédente, environ deux chiffres sur trois en avaient un ; ne force rien.
3. Le graphique doit se lire juste : même unité et même périmètre pour les éléments comparés ; une série dans l'ordre chronologique ; une part dont le tout est bien celui du libellé ; aucune comparaison qui suggère une conclusion que le texte ne tire pas, ni qui avantage une approche.
4. index = numéro du chiffre dans la liste « figures » de sa question, à partir de 0, tel que donné ci-dessous.
Exemples publiés :
{"questionId":"x","index":0,"chart":{"kind":"part","value":27.99,"total":100,"unit":"%","whole":"des suffrages exprimés"}} pour « 27,99 % des suffrages exprimés… »
{"questionId":"x","index":2,"chart":{"kind":"part","value":1093030,"total":4717396,"whole":"soutiens nécessaires"}} pour « 1 093 030 soutiens recueillis…, sur 4 717 396 nécessaires »
{"questionId":"x","index":1,"chart":{"kind":"compare","unit":"Md€","items":[{"label":"Recettes de l’ISF en 2017","value":4.2},{"label":"Recettes de l’IFI en 2018","value":1.29}]}}
{"questionId":"x","index":0,"chart":{"kind":"series","items":[{"label":"2024","value":88},{"label":"2025","value":19}]}}`

// ——— Graphiques, contrôle, réparation ———

const finals = await pipeline(
  BATCHES.filter(b => b.ids.some(id => byId.has(id))),
  batch =>
    agent(
      `TA MISSION (graphiques) : pour chaque chiffre clé ci-dessous (questions ${batch.ids.join(', ')} d'une boussole électorale neutre, ${C.name}), décide s'il mérite un petit graphique, et lequel. Le graphique ne montre QUE des nombres déjà écrits dans la valeur ou le libellé du chiffre ; il n'ajoute aucune donnée. Ne modifie ni les chiffres ni les textes. Pas besoin du web ni d'aucun fichier. Dans notes, signale un chiffre qui mériterait un graphique si son libellé écrivait le nombre de comparaison.\n\n${CHART_RULES}\n\nCHIFFRES :\n${JSON.stringify(figureList(batch, byId))}`,
      { label: `charts:${batch.key}`, phase: 'Charts', schema: CHARTS },
    ),
  async (proposed, batch) => {
    let explainers = new Map(batch.ids.filter(id => byId.has(id)).map(id => [id, byId.get(id)]))
    let charts = sortCharts(batch, proposed?.charts, explainers)
    if (!proposed) batchNotes.push({ batch: batch.key, notes: ['graphiques : agent perdu'] })
    else if (proposed.notes?.length) batchNotes.push({ batch: batch.key, notes: proposed.notes.map(n => `graphiques : ${n}`) })
    let issues = issuesOf(batch, explainers, charts)
    if (!issues.length) return { batch, explainers: Object.fromEntries(explainers), charts: charts.kept, issues }
    const repaired = await agent(
      `${CONTEXT}\n\nTA MISSION (réparation) : le contrôle automatique a relevé ces défauts dans les explications des questions ${batch.ids.join(', ')} (lecture : ${readCmd(BANK, batch.ids)}) :\n${issues.map(i => `- ${i}`).join('\n')}\nCorrige chacun :\n- terme interdit ou nom propre : reformule pour qu'il disparaisse, même s'il désigne autre chose (homonyme) ; le contrôle cherche le mot entier ;\n- source non https : trouve l'adresse https de la même page, ou remplace le chiffre par un chiffre vérifié ;\n- moins de 2 chiffres : trouve-en de nouveaux selon les règles, ouvre leur source avec WebFetch et mets verified=true seulement si tu as lu la valeur ;\n- graphique refusé : corrige-le selon les règles ci-dessous ou retire-le.\nGarde l'ordre des chiffres ; ajoute les nouveaux à la fin ; si tu en retires un, renumérote les index des graphiques de la question. Rends TOUTES les explications du lot et TOUS leurs graphiques (même schéma), et liste tes corrections dans notes.\n\n${CHART_RULES}\n\nEXPLICATIONS :\n${JSON.stringify([...explainers.values()])}\n\nGRAPHIQUES :\n${JSON.stringify(charts.kept.concat(charts.rejected.map(({ error, ...c }) => c)))}`,
      { label: `repair:${batch.key}`, phase: 'Repair', schema: REPAIRED },
    )
    if (!repaired) return { batch, explainers: Object.fromEntries(explainers), charts: charts.kept, issues }
    const next = new Map(explainers)
    for (const e of repaired.explainers ?? []) {
      if (!batch.ids.includes(e.questionId)) continue
      next.set(e.questionId, { ...e, figures: (e.figures ?? []).filter(f => f.verified === true) })
    }
    explainers = next
    charts = sortCharts(batch, repaired.charts, explainers)
    issues = issuesOf(batch, explainers, charts)
    batchNotes.push({ batch: batch.key, notes: (repaired.notes ?? []).map(n => `réparation : ${n}`) })
    return { batch, explainers: Object.fromEntries(explainers), charts: charts.kept, issues }
  },
)

// ——— Résultat ———

const explainers = []
const charts = []
const issues = []
for (const r of finals) {
  if (!r) continue
  // Le résultat d'une étape peut arriver sérialisé (une Map devient alors un objet) : on lit les deux formes
  const ex = r.explainers instanceof Map ? Object.fromEntries(r.explainers) : (r.explainers ?? {})
  for (const id of r.batch.ids) if (ex[id]) explainers.push(ex[id])
  charts.push(...r.charts)
  issues.push(...r.issues)
}
const missing = QUESTIONS.map(q => q.id).filter(id => !explainers.some(e => e.questionId === id))
if (missing.length) log(`questions sans explication : ${missing.join(', ')}`)
if (issues.length) log(`${issues.length} défaut(s) restant(s) après réparation, voir issues`)
const figureCount = explainers.reduce((n, e) => n + e.figures.length, 0)
log(`${explainers.length} explication(s) sur ${QUESTIONS.length}, ${figureCount} chiffres vérifiés, ${charts.length} graphiques`)
return {
  explainers,
  charts,
  consistency,
  issues,
  missing,
  batchNotes,
  dropped: dropLog,
  stats: { questions: QUESTIONS.length, batches: BATCHES.length, explainers: explainers.length, figures: figureCount, charts: charts.length },
}
