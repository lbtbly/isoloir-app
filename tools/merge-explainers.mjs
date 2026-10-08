// Fusionne la sortie du workflow « explainers » (contexte et chiffres clés des questions) dans
// research/<id>/explainers.json, lu ensuite par tools/build-pack.mjs.
// - ne garde que les chiffres marqués vérifiés (lus dans leur source par le vérificateur) ;
// - applique les corrections de cohérence entre questions (tools/workflows/4-explainers.js les applique déjà
//   lui-même et les rend dans consistency.applied : elles sont alors seulement reportées au journal) ;
// - refuse tout nom de candidat, de parti ou terme interdit, et toute source non https ;
// - écrit research/<id>/explainer-charts.json quand la sortie porte des graphiques (« charts », produits par
//   4-explainers.js), en renumérotant leurs index si des chiffres non vérifiés ont été retirés.
// Usage : node tools/merge-explainers.mjs <sortie-workflow.json> research/<id> [termes interdits séparés par |]
//           [--config research/<id>/config.json] [--merge]
//   termes séparés par | : recherche simple dans le texte sans accents ni casse (usage de la primaire) ;
//   --config : termes interdits, partis et noms des candidats lus dans la configuration de l'élection, cherchés
//     en mots entiers (« RN » ne doit pas trouver « gouvernement »), sauf forbiddenTermsAllow ;
//   --merge : garde les explications et les graphiques déjà écrits pour les questions absentes de cette sortie
//     (exécution partielle de 4-explainers.js sur les seules questions nouvelles ou retouchées).

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const argv = process.argv.slice(2)
const flag = name => {
  const i = argv.indexOf(name)
  if (i < 0) return undefined
  const v = argv[i + 1]
  argv.splice(i, 2)
  return v
}
const configFile = flag('--config')
const mergeMode = argv.includes('--merge')
const [outFile, researchDir, forbiddenArg = ''] = argv.filter(a => a !== '--merge')
const raw = JSON.parse(readFileSync(outFile, 'utf8'))
const result = raw.result ?? raw
const bank = JSON.parse(readFileSync(join(researchDir, 'bank.json'), 'utf8')).bank
const ids = new Set(bank.questions.map(q => q.id))
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Termes interdits : liste simple (primaire) ou configuration de l'élection (mots entiers)
let forbiddenIn
if (configFile) {
  const config = JSON.parse(readFileSync(configFile, 'utf8'))
  const strip = s => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/’/g, "'")
  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const allow = new Set((config.forbiddenTermsAllow ?? []).map(t => strip(t).toLowerCase()))
  const names = (config.candidates ?? []).map(c => c.name)
  const terms = [
    ...(config.forbiddenTerms ?? []),
    ...(config.candidates ?? []).map(c => c.party).filter(p => p && !/^Sans /.test(p)),
    ...names,
    ...names.map(n => n.split(' ').slice(1).join(' ')),
  ].filter((t, i, a) => t && a.indexOf(t) === i && !allow.has(strip(t).toLowerCase()))
  // Un sigle ou un nom propre d'un seul mot est cherché avec sa casse (« Horizons », pas « horizons ») ;
  // une expression l'est sans casse. Même règle que 4-explainers.js.
  const matchers = terms.map(t => {
    const s = strip(t)
    const sensitive = !/\s/.test(s) && s !== s.toLowerCase()
    return { term: t, re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(s).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}])`, sensitive ? 'u' : 'iu') }
  })
  forbiddenIn = text => matchers.filter(m => m.re.test(strip(text))).map(m => m.term)
} else {
  const forbidden = forbiddenArg.split('|').filter(Boolean).map(norm)
  forbiddenIn = text => forbidden.filter(term => norm(text).includes(term))
}

const log = []
const byId = new Map()
// Pour chaque question de la sortie : nouvel index de chaque chiffre gardé (les graphiques y renvoient)
const reindex = new Map()
for (const e of result.explainers) {
  if (!ids.has(e.questionId)) {
    log.push(`inconnue ${e.questionId}`)
    continue
  }
  const kept = []
  const map = new Map()
  e.figures.forEach((f, i) => {
    if (f.verified !== true) return
    map.set(i, kept.length)
    kept.push(f)
  })
  const dropped = e.figures.length - kept.length
  if (dropped) log.push(`${e.questionId} : ${dropped} chiffre(s) non vérifié(s) retiré(s)`)
  byId.set(e.questionId, { ...e, figures: kept })
  reindex.set(e.questionId, map)
}

// Corrections de cohérence transversale
for (const fix of result.consistency?.applied ?? []) {
  log.push(`cohérence (appliquée par le workflow) ${fix.questionId} : ${fix.oldValue} → ${fix.value} (${fix.reason})`)
}
for (const fix of result.consistency?.unapplied ?? []) {
  log.push(`cohérence NON appliquée ${fix.questionId} : ${fix.oldValue} → ${fix.value} (${fix.why} ; ${fix.reason})`)
}
for (const fix of result.consistency?.fixes ?? []) {
  const e = byId.get(fix.questionId)
  // Comparaison sans espaces : la valeur citée peut porter des espaces insécables
  const bare = s => s.replace(/\s/g, '')
  const f = e?.figures.find(x => bare(x.value) === bare(fix.oldValue))
  if (!f) {
    log.push(`correction non appliquée ${fix.questionId} ${fix.oldValue} → ${fix.value} (chiffre introuvable)`)
    continue
  }
  f.value = fix.value
  if (fix.label) f.label = fix.label
  if (fix.date) f.date = fix.date
  if (fix.url) f.source = { ...f.source, url: fix.url, ...(fix.title ? { title: fix.title } : {}), ...(fix.publisher ? { publisher: fix.publisher } : {}) }
  log.push(`cohérence ${fix.questionId} : ${fix.oldValue} → ${fix.value} (${fix.reason})`)
}

// Contrôles : sources https, aucun terme interdit
let errors = 0
for (const e of byId.values()) {
  const texts = [e.summary, ...e.points.map(p => p.text), ...e.figures.flatMap(f => [f.value, f.label])]
  for (const t of texts) {
    for (const term of forbiddenIn(t)) {
      log.push(`ERREUR ${e.questionId} : terme interdit « ${term} » dans « ${t} »`)
      errors++
    }
  }
  for (const s of [...e.figures.map(f => f.source), ...e.points.filter(p => p.source).map(p => p.source)]) {
    if (!/^https:\/\//.test(s.url)) {
      log.push(`ERREUR ${e.questionId} : source non https ${s.url}`)
      errors++
    }
  }
  if (e.figures.length < 2) log.push(`${e.questionId} : seulement ${e.figures.length} chiffre(s) vérifié(s)`)
}

// Fusion avec les explications déjà écrites (exécution partielle)
const explainerFile = join(researchDir, 'explainers.json')
const fresh = new Set(byId.keys())
if (mergeMode && existsSync(explainerFile)) {
  let kept = 0
  for (const e of JSON.parse(readFileSync(explainerFile, 'utf8')).explainers ?? []) {
    if (byId.has(e.questionId) || !ids.has(e.questionId)) continue
    byId.set(e.questionId, e)
    kept++
  }
  log.push(`fusion : ${fresh.size} explication(s) nouvelle(s) ou refaite(s), ${kept} gardée(s)`)
}

const missing = [...ids].filter(id => !byId.has(id))
if (missing.length) log.push(`sans contexte : ${missing.join(', ')}`)

const explainers = bank.questions.filter(q => byId.has(q.id)).map(q => byId.get(q.id))
writeFileSync(explainerFile, JSON.stringify({ explainers }, null, 2) + '\n')

// Graphiques : ceux de la sortie, renumérotés ; en fusion, ceux des questions non refaites restent
let chartCount = null
if (Array.isArray(result.charts)) {
  const chartFile = join(researchDir, 'explainer-charts.json')
  const charts = []
  if (mergeMode && existsSync(chartFile)) {
    for (const c of JSON.parse(readFileSync(chartFile, 'utf8')).charts ?? []) if (!fresh.has(c.questionId) && byId.has(c.questionId)) charts.push(c)
  }
  for (const c of result.charts) {
    if (!fresh.has(c.questionId)) {
      log.push(`graphique ignoré ${c.questionId}#${c.index} (question absente)`)
      continue
    }
    const index = reindex.get(c.questionId).get(c.index)
    if (index === undefined) {
      log.push(`graphique ignoré ${c.questionId}#${c.index} (chiffre non vérifié ou inexistant)`)
      continue
    }
    charts.push({ questionId: c.questionId, index, chart: c.chart })
  }
  const order = new Map(bank.questions.map((q, i) => [q.id, i]))
  charts.sort((a, b) => order.get(a.questionId) - order.get(b.questionId) || a.index - b.index)
  // Un graphique par ligne, comme le fichier tenu à la main pour la primaire
  writeFileSync(chartFile, `{\n  "charts": [\n${charts.map(c => `    ${JSON.stringify(c)}`).join(',\n')}\n  ]\n}\n`)
  chartCount = charts.length
}

writeFileSync(join(researchDir, 'explainers-log.txt'), log.join('\n') + '\n')
console.log(
  `${explainers.length} contextes, ${explainers.reduce((n, e) => n + e.figures.length, 0)} chiffres vérifiés${chartCount === null ? '' : `, ${chartCount} graphiques`} ; ${log.length} lignes de journal`,
)
if (errors) {
  console.error(`${errors} erreur(s) : voir explainers-log.txt`)
  process.exitCode = 1
}
