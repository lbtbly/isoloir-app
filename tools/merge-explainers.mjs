// Fusionne la sortie du workflow « explainers » (contexte et chiffres clés des questions) dans
// research/<id>/explainers.json, lu ensuite par tools/build-pack.mjs.
// - ne garde que les chiffres marqués vérifiés (lus dans leur source par le vérificateur) ;
// - applique les corrections de cohérence entre questions ;
// - refuse tout nom de candidat, de parti ou terme interdit, et toute source non https.
// Usage : node tools/merge-explainers.mjs <sortie-workflow.json> research/<id> [termes interdits séparés par |]

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [outFile, researchDir, forbiddenArg = ''] = process.argv.slice(2)
const raw = JSON.parse(readFileSync(outFile, 'utf8'))
const result = raw.result ?? raw
const bank = JSON.parse(readFileSync(join(researchDir, 'bank.json'), 'utf8')).bank
const ids = new Set(bank.questions.map(q => q.id))
const norm = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const forbidden = forbiddenArg.split('|').filter(Boolean).map(norm)

const log = []
const byId = new Map()
for (const e of result.explainers) {
  if (!ids.has(e.questionId)) {
    log.push(`inconnue ${e.questionId}`)
    continue
  }
  const figures = e.figures.filter(f => f.verified === true)
  const dropped = e.figures.length - figures.length
  if (dropped) log.push(`${e.questionId} : ${dropped} chiffre(s) non vérifié(s) retiré(s)`)
  byId.set(e.questionId, { ...e, figures })
}

// Corrections de cohérence transversale
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
    for (const term of forbidden) {
      if (norm(t).includes(term)) {
        log.push(`ERREUR ${e.questionId} : terme interdit « ${term} » dans « ${t} »`)
        errors++
      }
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

const missing = [...ids].filter(id => !byId.has(id))
if (missing.length) log.push(`sans contexte : ${missing.join(', ')}`)

const explainers = bank.questions.filter(q => byId.has(q.id)).map(q => byId.get(q.id))
writeFileSync(join(researchDir, 'explainers.json'), JSON.stringify({ explainers }, null, 2) + '\n')
writeFileSync(join(researchDir, 'explainers-log.txt'), log.join('\n') + '\n')
console.log(`${explainers.length} contextes, ${explainers.reduce((n, e) => n + e.figures.length, 0)} chiffres vérifiés ; ${log.length} lignes de journal`)
if (errors) {
  console.error(`${errors} erreur(s) : voir explainers-log.txt`)
  process.exitCode = 1
}
