// Audit d'un pack d'élection, avant publication : équilibre du score, couverture des candidats,
// distinction deux à deux et cohérence. Aucune IA : le moteur de score du site (src/core/score.ts),
// appliqué aux fichiers générés par tools/build-pack.mjs.
//
// Usage : node tools/audit-pack.mjs <id> [--profiles 3000] [--quiet] [--src <dossier>] [--research <dossier>]
//   --src / --research : auditer un pack construit ailleurs (par défaut src/elections/<id> et research/<id>).
//   Lit src/elections/<id>/bank.ts et positions.ts (pas index.ts, qui importe des images), la liste
//   des candidats (candidates.ts, images remplacées par leur chemin, sinon research/<id>/config.json),
//   et, s'il se charge, election.ts (chiffres d'audit affichés sur l'accueil).
//   Seuils : config.quality de research/<id>/config.json, sinon election.checks, sinon les règles de la
//   primaire « Choisir 2027 » (celles de tests/packs.test.ts) ; une clé absente prend la valeur par défaut.
//   quality.step1.exempt : candidats exemptés de la seule règle step1.minKnownPerCandidate (décision du propriétaire).
//   Candidats non notés (décision du propriétaire, ni score ni rang sur le site) : election.ranking.excluded quand
//   l'élection est au registre (src/elections/index.ts), sinon scoringExcluded de research/<id>/config.json (à défaut,
//   l'autre source) ; les deux doivent concorder. Tout ce qui mesure le score ne porte que sur les candidats notés :
//   parts de 1res places, couverture par candidat (étape 1, rapide, banque), écart de couverture, part des candidats
//   connus et concentration des positions principales sur chaque question, distinction deux à deux, cohérence. Les
//   non notés sont listés à part ; les contrôles de structure (identifiants, positions orphelines) les comptent.
//   Sans non notés (primaire), audit.json garde exactement sa forme d'avant.
//   Écrit research/<id>/audit.json et affiche un résumé. Code de sortie 1 si un contrôle dur échoue,
//   2 si le pack ne se charge pas.
//
// Profils aléatoires : même tirage que tests/packs.test.ts (mulberry32(2027), la moitié des approches
// sans avis, un quart d'accord, un quart pas d'accord), pour retrouver exactement les mêmes parts.
// Document interne : ces parts ne mesurent aucune intention de vote et ne se publient pas par candidat.
//
// Il faut Node 22.18+ (exécution du TypeScript simple, crochets de module synchrones).

import * as nodeModule from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const opt = name => {
  const i = argv.findIndex(a => a === name || a.startsWith(`${name}=`))
  if (i < 0) return null
  return argv[i].includes('=') ? argv[i].split('=')[1] : argv[i + 1]
}
const VALUED = ['--profiles', '--src', '--research']
const id = argv.find((a, i) => !a.startsWith('--') && !VALUED.includes(argv[i - 1]))
const N = Number(opt('--profiles') ?? 3000)
const quiet = argv.includes('--quiet')
if (!id || !Number.isInteger(N) || N <= 0) {
  console.error('Usage : node tools/audit-pack.mjs <id> [--profiles 3000] [--quiet] [--src <dossier>] [--research <dossier>]')
  process.exit(2)
}
const srcDir = resolve(opt('--src') ?? join(ROOT, 'src', 'elections', id))
const researchDir = resolve(opt('--research') ?? join(ROOT, 'research', id))
const rel = p => (relative(ROOT, p).startsWith('..') ? p : relative(ROOT, p))

// Le code du site importe sans extension (« ./answers ») et importe des images : on complète
// l'extension .ts et on remplace chaque fichier média par un module qui exporte son adresse.
if (typeof nodeModule.registerHooks !== 'function') {
  console.error(`Node ${process.version} : il faut Node 22.18+ (module.registerHooks et TypeScript).`)
  process.exit(2)
}
const MEDIA = /\.(jpe?g|png|webp|avif|gif|svg|mp3|mp4|webm|ogg|woff2?)$/i
nodeModule.registerHooks({
  resolve(specifier, context, next) {
    const bare = specifier.split('?')[0]
    if (MEDIA.test(bare) && /^\.{0,2}\//.test(bare)) {
      return { url: new URL(bare, context.parentURL).href, format: 'module', shortCircuit: true }
    }
    try {
      return next(specifier, context)
    } catch (err) {
      if (!specifier.startsWith('.')) throw err
      for (const ext of ['.ts', '/index.ts']) {
        try {
          return next(specifier + ext, context)
        } catch {
          // essai suivant
        }
      }
      throw err
    }
  },
  load(url, context, next) {
    if (url.startsWith('file:') && MEDIA.test(new URL(url).pathname)) {
      return { format: 'module', source: `export default ${JSON.stringify(url)}`, shortCircuit: true }
    }
    return next(url, context)
  },
})
const importTs = p => import(pathToFileURL(p).href)

let bank, positions, score, rng
try {
  ;({ bank } = await importTs(join(srcDir, 'bank.ts')))
  ;({ positions } = await importTs(join(srcDir, 'positions.ts')))
  score = await importTs(join(ROOT, 'src/core/score.ts'))
  rng = await importTs(join(ROOT, 'src/core/rng.ts'))
} catch (err) {
  console.error(`Pack ${id} illisible : ${err.message}`)
  process.exit(2)
}
const { computeResults, effectiveWeight, knownQuestions, stance } = score
const config = existsSync(join(researchDir, 'config.json'))
  ? JSON.parse(readFileSync(join(researchDir, 'config.json'), 'utf8'))
  : null
let election = null
try {
  if (existsSync(join(srcDir, 'election.ts'))) ({ election } = await importTs(join(srcDir, 'election.ts')))
} catch {
  // facultatif : sert seulement à comparer les chiffres d'audit affichés
}

// Candidats : ceux du pack (candidates.ts), sinon ceux de la config hors primaire en attente
async function loadCandidates() {
  const file = join(srcDir, 'candidates.ts')
  if (existsSync(file)) {
    try {
      const { candidates } = await importTs(file)
      if (Array.isArray(candidates) && candidates.length)
        return { from: rel(file), list: candidates.map(c => ({ id: c.id, name: c.name ?? c.id, initials: c.initials ?? c.id })) }
    } catch {
      // lecture du texte ci-dessous
    }
    const src = readFileSync(file, 'utf8')
    const field = (block, k) => block.match(new RegExp(`["']?\\b${k}["']?\\s*:\\s*(['"])(.*?)\\1`))?.[2]
    const list = src
      .split(/(?=["']?\bid["']?\s*:\s*['"])/)
      .slice(1)
      .map(b => ({ id: field(b, 'id'), name: field(b, 'name'), initials: field(b, 'initials') }))
      .filter(c => c.id)
      .map(c => ({ ...c, name: c.name ?? c.id, initials: c.initials ?? c.id }))
    if (list.length) return { from: `${rel(file)} (texte)`, list }
  }
  if (config) {
    const list = config.candidates
      .filter(c => !c.pendingPrimary || positions[c.id])
      .map(c => ({ id: c.id, name: c.name ?? c.id, initials: c.initials ?? c.id }))
    return { from: `${rel(join(researchDir, 'config.json'))} (hors primaire en attente)`, list }
  }
  return { from: 'positions.ts', list: Object.keys(positions).map(c => ({ id: c, name: c, initials: c })) }
}
const { from: candidatesFrom, list: candidates } = await loadCandidates()
const n = candidates.length
const ini = cid => candidates.find(c => c.id === cid)?.initials ?? cid

// Non notés : election.ranking.excluded si l'élection est au registre du site, sinon config.scoringExcluded
const registryFile = join(ROOT, 'src', 'elections', 'index.ts')
const registered =
  existsSync(registryFile) && new RegExp(`\\bid:\\s*['"]${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(readFileSync(registryFile, 'utf8'))
const exclusion = election?.ranking?.excluded ?? null
const configExcluded = Array.isArray(config?.scoringExcluded) ? config.scoringExcluded : null
const fromElection = { ids: exclusion?.ids ?? null, label: `${rel(join(srcDir, 'election.ts'))} (ranking.excluded)` }
const fromConfig = { ids: configExcluded, label: `${rel(join(researchDir, 'config.json'))} (scoringExcluded)` }
const [primary, secondary] = registered ? [fromElection, fromConfig] : [fromConfig, fromElection]
const excludedSource = primary.ids ? primary : secondary.ids ? secondary : null
const excludedIds = [...new Set(excludedSource?.ids ?? [])]
const excludedFrom = excludedSource ? `${excludedSource.label}${registered ? ', élection au registre' : ', élection pas encore au registre'}` : null
const excludedSet = new Set(excludedIds)
/** Candidats notés : tous, moins les non notés */
const scored = candidates.filter(c => !excludedSet.has(c.id))
const nScored = scored.length
const off = candidates.filter(c => excludedSet.has(c.id))
// Le calcul du site écarte les non notés lui-même (election.ranking.excluded) : on lui donne la liste retenue ici
const pack = {
  election: excludedIds.length
    ? {
        ...(election ?? { id }),
        ranking: { ...(election?.ranking ?? {}), excluded: { ids: excludedIds, reason: exclusion?.reason ?? '', since: exclusion?.since ?? '' } },
      }
    : (election ?? { id }),
  candidates,
  bank,
  positions,
}
/** « chaque candidat », ou « chaque candidat noté » quand l'élection en écarte */
const each = excludedIds.length ? 'chaque candidat noté' : 'chaque candidat'
/** « des candidats », ou « des candidats notés » */
const ofThem = excludedIds.length ? 'des candidats notés' : 'des candidats'

// Seuils : règles de la primaire par défaut (tests/packs.test.ts), complétées par la config
const DEFAULTS = {
  step1: { count: 8, minKnownShare: 1, minKnownPerCandidate: null, exempt: [] },
  quick: { min: 3, max: null, minKnownShare: (nScored - 1) / nScored, minCandidateShare: null, maxSpread: null },
  bank: { min: null, max: null, approachesMin: 2, approachesMax: 6, maxMainShare: null, maxMainShareScope: 'all', minCandidateShare: null },
  audit: { step1: [2, 1.5], quick: [4, 2.5] },
}
const custom = config?.quality ?? election?.checks ?? null
const qualityFrom = config?.quality
  ? `${rel(join(researchDir, 'config.json'))} (quality)`
  : election?.checks
    ? `${rel(join(srcDir, 'election.ts'))} (checks)`
    : 'règles de la primaire « Choisir 2027 » (tests/packs.test.ts)'
const Q = Object.fromEntries(Object.entries(DEFAULTS).map(([k, v]) => [k, { ...v, ...(custom?.[k] ?? {}) }]))
// Part des candidats connus sur une question : parmi les candidats notés
const need = share => Math.ceil(share * nScored - 1e-9)

// ——— Mesures ———
const questions = bank.questions
const step1 = questions.filter(q => q.step === 1)
const quick = questions.filter(q => q.tier === 'essentiel')
const scopes = { step1, quick, bank: questions }
const SCOPE_LABEL = { step1: 'étape 1', quick: 'rapide', bank: 'banque' }

const known = (cid, q) => q.approaches.some(a => effectiveWeight(positions[cid]?.[a.id]) > 0)
const mainOf = (cid, q) => q.approaches.find(a => effectiveWeight(positions[cid]?.[a.id]) === 2)?.id ?? null

// Par question, les candidats notés seuls : connus, et concentration de leurs positions principales ; knownAll, avec
// les non notés, à titre indicatif quand l'élection en écarte
const perQuestion = questions.map(q => {
  const k = scored.filter(c => known(c.id, q)).length
  const counts = new Map()
  for (const c of scored) {
    const m = mainOf(c.id, q)
    if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
  }
  const mains = [...counts.values()].reduce((a, b) => a + b, 0)
  const [top, topCount] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? [null, 0]
  return {
    id: q.id,
    topicId: q.topicId,
    tier: q.tier,
    ...(q.step ? { step: q.step } : {}),
    approaches: q.approaches.length,
    known: k,
    knownShare: round(k / nScored, 3),
    ...(excludedIds.length ? { knownAll: candidates.filter(c => known(c.id, q)).length } : {}),
    mains,
    maxMain: top ? { approachId: top, count: topCount, share: round(topCount / mains, 3) } : null,
  }
})
const qStat = Object.fromEntries(perQuestion.map(s => [s.id, s]))

const coverageOf = c => ({
  name: c.name,
  initials: c.initials,
  ...Object.fromEntries(
    Object.entries(scopes).map(([k, qs]) => {
      const kn = qs.filter(q => known(c.id, q)).length
      return [k, { known: kn, total: qs.length, share: qs.length ? round(kn / qs.length, 3) : null }]
    }),
  ),
})
// Couverture des candidats notés ; celle des non notés est à part (audit.excluded)
const coverage = Object.fromEntries(scored.map(c => [c.id, coverageOf(c)]))

const BUCKETS = [
  ['100 %', s => s >= 1],
  ['85-99 %', s => s >= 0.85 && s < 1],
  ['75-84 %', s => s >= 0.75 && s < 0.85],
  ['50-74 %', s => s >= 0.5 && s < 0.75],
  ['< 50 %', s => s < 0.5],
]
const knownDistribution = Object.fromEntries(
  Object.entries(scopes).map(([k, qs]) => [
    k,
    Object.fromEntries(BUCKETS.map(([label, test]) => [label, qs.filter(q => test(qStat[q.id].knownShare)).length])),
  ]),
)

// Distinction : deux candidats diffèrent s'ils ont, sur une même question, des approches principales différentes
const pairs = []
for (let i = 0; i < nScored; i++) {
  for (let j = i + 1; j < nScored; j++) {
    const a = scored[i].id
    const b = scored[j].id
    let comparable = 0
    let differing = 0
    for (const q of questions) {
      const ma = mainOf(a, q)
      const mb = mainOf(b, q)
      if (!ma || !mb) continue
      comparable++
      if (ma !== mb) differing++
    }
    pairs.push({ a, b, comparable, differing })
  }
}
pairs.sort((x, y) => x.differing - y.differing || x.comparable - y.comparable)
const indistinguishable = pairs.filter(p => p.differing === 0)

// Cohérence : un profil qui répond exactement comme un candidat le met en tête
function candidateProfile(cid, qs) {
  const answers = {}
  for (const q of qs) {
    const ratings = {}
    for (const a of q.approaches) {
      const v = stance(positions[cid]?.[a.id])
      if (v !== 0) ratings[a.id] = v > 0 ? 1 : -1
    }
    if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
  }
  return answers
}
const coherence = Object.fromEntries(
  Object.entries(scopes)
    .filter(([, qs]) => qs.length)
    .map(([k, qs]) => [
      k,
      Object.fromEntries(
        scored.map(c => {
          const profile = candidateProfile(c.id, qs)
          const r = computeResults(pack, profile, {}, 'audit')
          const me = r.ranking.find(x => x.candidateId === c.id)
          const tiedWith = me.rank === 1 ? r.ranking.filter(x => x.rank === 1 && x.candidateId !== c.id).map(x => x.candidateId) : []
          return [c.id, { rank: me.rank, tiedWith, answered: Object.keys(profile).length }]
        }),
      ),
    ]),
)

// Parts de 1res places sur des profils aléatoires (copie conforme de tests/packs.test.ts)
function randomAnswers(qs, rand) {
  const answers = {}
  for (const q of qs) {
    const ratings = {}
    for (const a of q.approaches) {
      const r = rand()
      if (r < 0.5) continue
      ratings[a.id] = r < 0.75 ? 1 : -1
    }
    if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
  }
  return answers
}
function firstPlaceShares(qs) {
  const rand = rng.mulberry32(2027)
  const wins = new Map(scored.map(c => [c.id, 0]))
  for (let i = 0; i < N; i++) {
    const r = computeResults(pack, randomAnswers(qs, rand), {}, `audit-${i}`)
    const first = r.ranking[0]
    if (first && first.score !== null) wins.set(first.candidateId, (wins.get(first.candidateId) ?? 0) + 1)
  }
  return Object.fromEntries([...wins].map(([k, v]) => [k, Math.round((v / N) * 1000) / 10]))
}
const shares = Object.fromEntries(Object.entries(scopes).filter(([, qs]) => qs.length).map(([k, qs]) => [k, firstPlaceShares(qs)]))
const bounds = Object.fromEntries(
  ['step1', 'quick']
    .filter(k => Q.audit[k])
    .map(k => [k, { min: round(100 / nScored / Q.audit[k][0], 2), max: round((100 / nScored) * Q.audit[k][1], 2) }]),
)

// ——— Contrôles ———
const checks = []
const check = (cid, label, hard, ok, detail = '') => checks.push({ id: cid, label, hard, ok: !!ok, ...(detail ? { detail } : {}) })
const pct = x => `${fmt(x * 100, 0)} %`
const list = (xs, max = 8) => (xs.length > max ? `${xs.slice(0, max).join(', ')}… (+${xs.length - max})` : xs.join(', '))

// Structure
{
  const qids = questions.map(q => q.id)
  const aids = questions.flatMap(q => q.approaches.map(a => a.id))
  const topicIds = new Set(bank.topics.map(t => t.id))
  check('structure-ids', 'identifiants de questions et d’approches uniques', true, new Set(qids).size === qids.length && new Set(aids).size === aids.length)
  const noTopic = questions.filter(q => !topicIds.has(q.topicId)).map(q => q.id)
  check('structure-topics', 'chaque question rattachée à un thème existant', true, !noTopic.length, list(noTopic))
  const aidSet = new Set(aids)
  const ids = new Set(candidates.map(c => c.id))
  const orphans = Object.entries(positions).flatMap(([cid, t]) =>
    ids.has(cid) ? Object.keys(t).filter(a => !aidSet.has(a)).map(a => `${cid}→${a}`) : [`${cid} (candidat absent)`],
  )
  check('structure-orphans', 'aucune position orpheline (candidat ou approche inexistants)', true, !orphans.length, list(orphans))
  const multi = []
  for (const q of questions) {
    for (const c of candidates) {
      const ws = q.approaches.map(a => positions[c.id]?.[a.id]?.weight).filter(Boolean)
      if (ws.filter(w => w === 2).length > 1 || ws.filter(w => w === 1).length > 1) multi.push(`${q.id} ${c.id}`)
    }
  }
  check('structure-mains', 'au plus une approche principale et une compatible par candidat et par question', true, !multi.length, list(multi))
  const noCand = candidates.filter(c => !positions[c.id] || !Object.keys(positions[c.id]).length).map(c => c.id)
  check('structure-empty', 'chaque candidat a au moins une position', true, !noCand.length, list(noCand))
}

// Étape 1 (premier dépouillement)
if (step1.length || Q.step1.count) {
  check('step1-count', `étape 1 : ${Q.step1.count} questions`, true, step1.length === Q.step1.count, step1.length === Q.step1.count ? '' : `il y en a ${step1.length}`)
  const notQuick = step1.filter(q => q.tier !== 'essentiel').map(q => q.id)
  check('step1-tier', 'étape 1 : toutes au questionnaire rapide', true, !notQuick.length, list(notQuick))
  if (Q.step1.minKnownShare != null) {
    const low = step1.filter(q => qStat[q.id].known < need(Q.step1.minKnownShare)).map(q => `${q.id} (${qStat[q.id].known}/${nScored})`)
    check('step1-known', `étape 1 : chaque question connue pour au moins ${pct(Q.step1.minKnownShare)} ${ofThem} (${need(Q.step1.minKnownShare)}/${nScored})`, true, !low.length, list(low))
  }
  if (Q.step1.minKnownPerCandidate != null) {
    // Candidats exemptés de cette seule règle par le propriétaire (quality.step1.exempt) : les autres contrôles valent pour eux
    const exempt = new Set(Q.step1.exempt ?? [])
    const unknownExempt = [...exempt].filter(cid => !candidates.some(c => c.id === cid))
    if (unknownExempt.length) check('step1-exempt', 'étape 1 : les candidats exemptés existent', true, false, list(unknownExempt))
    const low = scored
      .filter(c => !exempt.has(c.id) && coverage[c.id].step1.known < Q.step1.minKnownPerCandidate)
      .map(c => `${ini(c.id)} ${coverage[c.id].step1.known}`)
    const shownExempt = [...exempt].filter(cid => !excludedSet.has(cid))
    const label = `étape 1 : ${each} connu sur au moins ${Q.step1.minKnownPerCandidate} questions${shownExempt.length ? ` (exemptés : ${shownExempt.map(ini).join(', ')})` : ''}`
    check('step1-candidate', label, true, !low.length, list(low))
  }
}

// Questionnaire rapide
{
  const { min, max } = Q.quick
  check('quick-count', `questionnaire rapide : ${range(min, max)} questions`, true, (min == null || quick.length >= min) && (max == null || quick.length <= max), `il y en a ${quick.length}`)
  const noStep = quick.filter(q => step1.length && q.step !== 1 && q.step !== 2).map(q => q.id)
  check('quick-steps', 'questionnaire rapide : chaque question rangée à l’étape 1 ou 2', true, !noStep.length, list(noStep))
  if (Q.quick.minKnownShare != null) {
    const low = quick.filter(q => qStat[q.id].known < need(Q.quick.minKnownShare)).map(q => `${q.id} (${qStat[q.id].known}/${nScored})`)
    check('quick-known', `questionnaire rapide : chaque question connue pour au moins ${pct(Q.quick.minKnownShare)} ${ofThem} (${need(Q.quick.minKnownShare)}/${nScored})`, true, !low.length, list(low))
  }
  if (Q.quick.minCandidateShare != null) {
    const low = scored.filter(c => coverage[c.id].quick.share < Q.quick.minCandidateShare - 1e-9).map(c => `${ini(c.id)} ${coverage[c.id].quick.known}/${quick.length}`)
    check('quick-candidate', `questionnaire rapide : ${each} connu sur au moins ${pct(Q.quick.minCandidateShare)} des questions`, true, !low.length, list(low))
  }
  const kn = scored.map(c => coverage[c.id].quick.known)
  const spread = kn.length ? Math.max(...kn) - Math.min(...kn) : 0
  if (Q.quick.maxSpread != null) check('quick-spread', `questionnaire rapide : au plus ${Q.quick.maxSpread} questions d’écart de couverture entre candidats${excludedIds.length ? ' notés' : ''}`, true, spread <= Q.quick.maxSpread, `écart ${spread}`)
}

// Banque complète
{
  const { min, max, approachesMin, approachesMax } = Q.bank
  const label = min == null && max == null ? 'banque : plus de questions que le questionnaire rapide' : `banque : ${range(min, max)} questions, plus que le questionnaire rapide`
  check('bank-count', label, true, (min == null || questions.length >= min) && (max == null || questions.length <= max) && questions.length > quick.length, `il y en a ${questions.length}`)
  const badA = questions.filter(q => q.approaches.length < approachesMin || q.approaches.length > approachesMax).map(q => `${q.id} (${q.approaches.length})`)
  check('bank-approaches', `banque : ${approachesMin} à ${approachesMax} approches par question`, true, !badA.length, list(badA))
  const over = perQuestion.filter(s => s.mains >= 2 && Q.bank.maxMainShare != null && s.maxMain.share > Q.bank.maxMainShare + 1e-9)
  const few = perQuestion.filter(s => s.mains < 2).map(s => `${s.id} (${s.mains})`)
  if (Q.bank.maxMainShare != null) {
    // maxMainShareScope 'quick' : règle stricte au questionnaire rapide ; sur les questions approfondies, un accord
    // réel entre candidats est signalé sans bloquer (la question distingue encore la minorité)
    const quickOnly = Q.bank.maxMainShareScope === 'quick'
    const hard = quickOnly ? over.filter(s => s.tier === 'essentiel') : over
    const fmt = xs => list(xs.map(s => `${s.id} ${s.maxMain.count}/${s.mains}`))
    check('bank-main-share', `${quickOnly ? 'questionnaire rapide' : 'banque'} : aucune approche ne réunit plus de ${pct(Q.bank.maxMainShare)} des positions principales connues${excludedIds.length ? ' des candidats notés' : ''}`, true, !hard.length, fmt(hard))
    if (quickOnly) check('bank-main-share-deep', `questions approfondies : approche réunissant plus de ${pct(Q.bank.maxMainShare)} des positions principales connues (accord entre candidats, signalé)`, false, !over.length, fmt(over))
  }
  check('bank-few-mains', `banque : au moins 2 positions principales connues${excludedIds.length ? ' de candidats notés' : ''} par question`, false, !few.length, list(few))
  if (Q.bank.minCandidateShare != null) {
    const low = scored.filter(c => coverage[c.id].bank.share < Q.bank.minCandidateShare - 1e-9).map(c => `${ini(c.id)} ${coverage[c.id].bank.known}/${questions.length}`)
    check('bank-candidate', `banque : ${each} connu sur au moins ${pct(Q.bank.minCandidateShare)} des questions`, true, !low.length, list(low))
  }
}

// Non notés : des candidats du pack, la même liste des deux côtés, et les moins connus (même traitement pour tous)
const counted = Object.fromEntries(candidates.map(c => [c.id, knownQuestions(pack, c.id)]))
if (excludedIds.length || configExcluded) {
  const strangers = excludedIds.filter(cid => !candidates.some(c => c.id === cid))
  check('excluded-known', 'non notés : des candidats de l’élection, au moins un candidat noté', true, !strangers.length && nScored > 0, list(strangers))
  if (fromElection.ids && fromConfig.ids) {
    const a = [...new Set(fromElection.ids)].sort()
    const b = [...new Set(fromConfig.ids)].sort()
    const same = a.length === b.length && a.every((x, i) => x === b[i])
    check('excluded-sync', 'non notés : election.ranking.excluded et config.scoringExcluded identiques', true, same, same ? '' : `election : ${a.join(', ')} ; config : ${b.join(', ')}`)
  }
  if (off.length && scored.length) {
    const most = Math.max(...off.map(c => counted[c.id]))
    const least = Math.min(...scored.map(c => counted[c.id]))
    const below = scored.filter(c => counted[c.id] <= most).map(c => `${ini(c.id)} ${counted[c.id]}`)
    check(
      'excluded-least',
      'non notés : les moins connus, aucun candidat noté connu sur aussi peu de questions qu’un non noté',
      true,
      !below.length,
      below.length ? list(below) : `non notés jusqu’à ${most}/${questions.length}, notés dès ${least}/${questions.length}`,
    )
  }
}

// Distinction et cohérence
check('distinction', `chaque paire de candidats${excludedIds.length ? ' notés' : ''} diffère sur au moins une approche principale`, true, !indistinguishable.length, list(indistinguishable.map(p => `${ini(p.a)}-${ini(p.b)}`)))
for (const [k, hard] of [['bank', true], ['step1', true], ['quick', false]]) {
  if (!coherence[k]) continue
  // Un profil vide (aucune position connue) met tout le monde ex aequo en tête : compté comme un échec
  const bad = Object.entries(coherence[k])
    .filter(([, r]) => r.rank !== 1 || !r.answered)
    .map(([cid, r]) => (r.answered ? `${ini(cid)} ${r.rank}e` : `${ini(cid)} sans position`))
  check(`coherence-${k}`, `cohérence (${SCOPE_LABEL[k]}) : répondre comme un candidat${excludedIds.length ? ' noté' : ''} le met en tête`, hard, !bad.length, list(bad))
  const tied = Object.entries(coherence[k])
    .filter(([, r]) => r.answered && r.rank === 1 && r.tiedWith.length)
    .map(([cid, r]) => `${ini(cid)}=${list(r.tiedWith.map(ini), 3).replace(/, /g, '/')}`)
  check(`coherence-${k}-alone`, `cohérence (${SCOPE_LABEL[k]}) : seul en tête, sans ex aequo`, false, !tied.length, list(tied))
}

// Profils aléatoires
for (const k of ['step1', 'quick']) {
  if (!shares[k] || !bounds[k]) continue
  const { min, max } = bounds[k]
  const out = Object.entries(shares[k]).filter(([, v]) => !(v > min && v < max)).map(([cid, v]) => `${ini(cid)} ${fmt(v, 1)} %`)
  check(`audit-${k}`, `profils aléatoires (${SCOPE_LABEL[k]}) : part des 1res places entre ${fmt(min, 1)} et ${fmt(max, 1)} %`, true, !out.length, list(out))
}
if (election?.audit && shares.quick && N === election.audit.profiles) {
  const vals = Object.values(shares.quick)
  const lo = Math.round(Math.min(...vals))
  const hi = Math.round(Math.max(...vals))
  check('audit-displayed', `chiffres de l’accueil (election.audit) : ${election.audit.minShare} à ${election.audit.maxShare} %`, true, lo === election.audit.minShare && hi === election.audit.maxShare, `mesuré : ${lo} à ${hi} %`)
}

// Neutralité du calcul : tout noter « d'accord » (hors questions avec un rejet explicite) donne le même score brut
{
  const withRejection = q => scored.some(c => q.approaches.some(a => stance(positions[c.id]?.[a.id]) < 0))
  const all = Object.fromEntries(
    questions.filter(q => !withRejection(q)).map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, 1])), redLines: [] }]),
  )
  const r = computeResults(pack, all, {}, 'audit')
  // Tous les candidats, hors classement compris (règle election.ranking) : le calcul est le même pour eux
  const raws = new Set([...r.ranking, ...r.unranked].filter(x => x.rawScore !== null).map(x => Math.round(x.rawScore)))
  check('all-agree', 'tout noter « d’accord » donne le même score brut à tous', true, raws.size <= 1, raws.size > 1 ? `${raws.size} scores différents` : '')
}

const failed = checks.filter(c => c.hard && !c.ok)
const warned = checks.filter(c => !c.hard && !c.ok)

// ——— Sorties ———
const mainShares = perQuestion.filter(s => s.mains >= 2).map(s => s.maxMain.share).sort((a, b) => a - b)
const audit = {
  election: id,
  sources: { bank: rel(join(srcDir, 'bank.ts')), positions: rel(join(srcDir, 'positions.ts')), candidates: candidatesFrom, quality: qualityFrom },
  counts: {
    candidates: n,
    ...(excludedIds.length ? { scored: nScored } : {}),
    topics: bank.topics.length,
    questions: questions.length,
    quick: quick.length,
    step1: step1.length,
  },
  quality: Q,
  profiles: N,
  shares,
  bounds,
  coverage,
  // Non notés (ni score ni rang sur le site) : leur couverture, à part ; « counted » est le chiffre affiché sur le site
  // (questions où le calcul retient une position : approche portée ou rejetée, vérifiée)
  ...(excludedIds.length
    ? {
        excluded: {
          from: excludedFrom,
          ids: excludedIds,
          ...(exclusion ? { reason: exclusion.reason, since: exclusion.since } : {}),
          candidates: Object.fromEntries(off.map(c => [c.id, { ...coverageOf(c), counted: { known: counted[c.id], total: questions.length } }])),
        },
      }
    : {}),
  knownDistribution,
  mainShare: {
    median: mainShares.length ? mainShares[Math.floor((mainShares.length - 1) / 2)] : null,
    max: mainShares.at(-1) ?? null,
  },
  questions: perQuestion,
  pairs: { indistinguishable, closest: pairs.slice(0, 10) },
  coherence,
  checks,
  ok: !failed.length,
}
mkdirSync(researchDir, { recursive: true })
writeFileSync(join(researchDir, 'audit.json'), `${JSON.stringify(audit, null, 2)}\n`)

if (!quiet) {
  const L = []
  const pad = (s, w) => String(s).padEnd(w)
  const padL = (s, w) => String(s).padStart(w)
  L.push(`Audit du pack ${id} : ${n} candidats, ${bank.topics.length} thèmes, ${questions.length} questions (${quick.length} au questionnaire rapide, dont ${step1.length} à l’étape 1)`)
  L.push(`Candidats : ${candidatesFrom}. Seuils : ${qualityFrom}.`)
  if (excludedIds.length) L.push(`Non notés : ${excludedIds.length} (${excludedFrom}) ; ${nScored} candidats notés.`)
  L.push('')
  L.push(
    `Couverture (questions où la position est connue) et parts de 1res places sur ${N} profils aléatoires${excludedIds.length ? ', candidats notés' : ''}`,
  )
  const wName = Math.max(...candidates.map(c => c.name.length), 3) + 1
  L.push(`  ${pad('', 4)}${pad('', wName)}  ${padL('étape 1', 8)}  ${padL('rapide', 8)}  ${padL('banque', 13)}   ${padL('1res : ét. 1', 12)} ${padL('rapide', 8)} ${padL('banque', 8)}`)
  for (const c of scored) {
    const cv = coverage[c.id]
    const sh = k => (shares[k] ? `${fmt(shares[k][c.id], 1)} %` : '–')
    L.push(
      `  ${pad(c.initials, 4)}${pad(c.name, wName)}  ${padL(`${cv.step1.known}/${cv.step1.total}`, 8)}  ${padL(`${cv.quick.known}/${cv.quick.total}`, 8)}  ${padL(`${cv.bank.known}/${cv.bank.total} (${cv.bank.share == null ? '–' : fmt(cv.bank.share * 100, 0)} %)`, 13)}   ${padL(sh('step1'), 12)} ${padL(sh('quick'), 8)} ${padL(sh('bank'), 8)}`,
    )
  }
  const b = k => (bounds[k] ? `${fmt(bounds[k].min, 1)} à ${fmt(bounds[k].max, 1)} %` : 'sans borne')
  L.push(`  Bornes des parts : étape 1 ${b('step1')} ; rapide ${b('quick')} (exclues). Égalité parfaite : ${fmt(100 / nScored, 1)} %.`)
  if (off.length) {
    L.push('')
    L.push(`Non notés (ni score ni rang)${exclusion ? `, depuis le ${exclusion.since} : ${exclusion.reason}` : ''}`)
    L.push(`  ${pad('', 4)}${pad('', wName)}  ${padL('étape 1', 8)}  ${padL('rapide', 8)}  ${padL('banque', 13)}   ${padL('site', 8)}`)
    for (const c of off) {
      const cv = coverageOf(c)
      L.push(
        `  ${pad(c.initials, 4)}${pad(c.name, wName)}  ${padL(`${cv.step1.known}/${cv.step1.total}`, 8)}  ${padL(`${cv.quick.known}/${cv.quick.total}`, 8)}  ${padL(`${cv.bank.known}/${cv.bank.total} (${cv.bank.share == null ? '–' : fmt(cv.bank.share * 100, 0)} %)`, 13)}   ${padL(`${counted[c.id]}/${questions.length}`, 8)}`,
      )
    }
    L.push('  « site » : questions où le calcul retient une position (portée ou rejetée), le chiffre affiché sur le site.')
  }
  L.push('')
  L.push(`Questions par part de candidats${excludedIds.length ? ' notés' : ''} connus`)
  L.push(`  ${pad('', 9)}${BUCKETS.map(([l]) => padL(l, 9)).join('')}`)
  for (const [k, d] of Object.entries(knownDistribution)) L.push(`  ${pad(SCOPE_LABEL[k], 9)}${BUCKETS.map(([l]) => padL(d[l], 9)).join('')}`)
  L.push('')
  const topMain = perQuestion.filter(s => s.mains >= 2).sort((x, y) => y.maxMain.share - x.maxMain.share).slice(0, 5)
  L.push(`Approche principale la plus partagée par question${excludedIds.length ? ' (candidats notés)' : ''} : médiane ${audit.mainShare.median == null ? '–' : pct(audit.mainShare.median)}, maximum ${audit.mainShare.max == null ? '–' : pct(audit.mainShare.max)}`)
  if (topMain.length) L.push(`  les plus concentrées : ${topMain.map(s => `${s.id} ${s.maxMain.count}/${s.mains}`).join(', ')}`)
  L.push(`Paires indistinguables (aucune approche principale différente) : ${indistinguishable.length ? list(indistinguishable.map(p => `${ini(p.a)}-${ini(p.b)}`), 12) : 'aucune'}`)
  L.push(`  paires les plus proches (questions où leurs approches principales diffèrent / comparables) : ${pairs.slice(0, 5).map(p => `${ini(p.a)}-${ini(p.b)} ${p.differing}/${p.comparable}`).join(', ')}`)
  L.push('')
  L.push('Contrôles')
  for (const c of checks) L.push(`  ${c.ok ? '[ok]     ' : c.hard ? '[ÉCHEC]  ' : '[attention]'} ${c.label}${c.detail ? ` : ${c.detail}` : ''}`)
  L.push('')
  L.push(`${failed.length ? `${failed.length} contrôle(s) dur(s) en échec` : 'Tous les contrôles durs passent'}${warned.length ? `, ${warned.length} avertissement(s)` : ''}. Détail : ${rel(join(researchDir, 'audit.json'))}`)
  console.log(L.join('\n'))
}
process.exit(failed.length ? 1 : 0)

function range(min, max) {
  if (min != null && max != null) return `${min} à ${max}`
  if (min != null) return `au moins ${min}`
  return max != null ? `au plus ${max}` : 'un nombre quelconque de'
}
function round(x, d) {
  const f = 10 ** d
  return Math.round(x * f) / f
}
function fmt(x, d) {
  return x == null ? '–' : x.toFixed(d).replace('.', ',')
}
