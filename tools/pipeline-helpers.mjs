// Petits outils de la chaîne de données d'une élection, entre deux workflows (suite complète :
// research/presidentielle-2027/PIPELINE.md). Aucun n'appelle d'IA ni le réseau ; rien n'est écrit sans --out ou --write.
//
// Usage : node tools/pipeline-helpers.mjs <commande> research/<id> [options]
//   research-status research/<id>
//       Sorties attendues de tools/workflows/1-research.js (extraites par tools/extract-journal.mjs) : dossier_<c>.json
//       des candidats neufs, refresh_<c>.json des dossiers réutilisés, cleavages_<famille>.json, facts-check.json.
//       Affiche les manquants et les args à passer pour une relance partielle.
//   decisions-draft research/<id> [sortie.json] [--out <fichier>]
//       Brouillon de decisions.json tiré de la critique d'une sortie de 2-question-bank.js (défaut
//       research/<id>/question-bank-output.json) ou de 3-bank-expansion.js : tierChanges, drops, step1 (celle du
//       critique, sinon la proposition calculée stats.step1Proposal). À relire et arbitrer par le propriétaire.
//   merge-families <base.json> <partielle.json> <sortie.json>
//       Fusionne une relance partielle de 2-question-bank.js (args.only = familles) dans la sortie complète : les
//       familles relancées remplacent les anciennes à la même place, et les reformulations retenues pour leurs thèmes
//       remplacent les anciennes.
//   explainers-todo research/<id> [--spectrum research/<id>/spectrum-review.json]
//       La liste « questions » à passer à tools/workflows/4-explainers.js, d'après research/<id>/bank.json (écrit par
//       build-pack) : questions sans explication, et questions reprises dont l'énoncé a changé de plus de 15 %
//       (reuse-question-reworded dans build-log.txt), avec « from ». Avec --spectrum : en plus, les explications
//       reprises que 7-spectrum-review.js met en attente (explanationsOnHold) ou corrige, avec les corrections en note.
//       Une question qui a déjà son explication propre dans research/<id>/explainers.json n'est pas reprise.
//   spectrum-videos research/<id> <spectrum-review.json> [--write]
//       Reporte dans research/<id>/reuse.json les séries vidéo retenues par 7-spectrum-review.js (videoTopics, séries
//       écartées en moins). Sans --write : affiche seulement ce qui changerait.
//   check-log research/<id>
//       Lignes du journal de build-pack (build-log.txt) à examiner avant toute publication ; code de sortie 1 s'il y
//       en a qui signalent une donnée perdue (orphan, edit-miss, gapfill-miss, unknown-candidate, nosource,
//       reuse-miss, reuse-question-miss, addcand-miss, video-series-miss).

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [command, ...rest] = process.argv.slice(2)
const flags = new Map()
const positional = []
for (let i = 0; i < rest.length; i++) {
  const a = rest[i]
  if (a === '--write') flags.set('write', true)
  else if (a === '--out' || a === '--spectrum') flags.set(a.slice(2), rest[++i])
  else if (a.startsWith('--')) fail(`option inconnue : ${a}`)
  else positional.push(a)
}
const readJson = f => JSON.parse(readFileSync(f, 'utf8'))
const resultOf = f => {
  const raw = readJson(f)
  return raw.result ?? raw
}
function fail(message) {
  console.error(message)
  process.exit(2)
}
function emit(value) {
  const text = JSON.stringify(value, null, 2) + '\n'
  if (flags.get('out')) {
    writeFileSync(flags.get('out'), text)
    console.error(`écrit ${flags.get('out')}`)
  } else process.stdout.write(text)
}

const commands = {
  'research-status'([dir]) {
    const C = readJson(join(dir, 'config.json'))
    const missing = { dossiers: [], refresh: [], cleavages: [], facts: false }
    for (const c of C.candidates) {
      if (c.reuseDossier) {
        if (!existsSync(join(dir, `refresh_${c.id}.json`))) missing.refresh.push(c.id)
      } else if (!existsSync(join(dir, `dossier_${c.id}.json`))) missing.dossiers.push(c.id)
    }
    for (const g of C.groups ?? []) if (!existsSync(join(dir, `cleavages_${g.id}.json`))) missing.cleavages.push(g.id)
    missing.facts = !existsSync(join(dir, 'facts-check.json'))
    const n = C.candidates.length
    console.log(`${n - missing.dossiers.length - missing.refresh.length}/${n} dossiers ou compléments, ${(C.groups ?? []).length - missing.cleavages.length}/${(C.groups ?? []).length} familles, facts-check ${missing.facts ? 'absent' : 'présent'}`)
    const only = [...missing.dossiers, ...missing.refresh]
    if (only.length) console.log(`relance des dossiers : args = { ...config, only: ${JSON.stringify(only)}, skipCleavages: true, skipFacts: true }`)
    if (missing.cleavages.length) console.log(`familles sans lignes de fracture : ${missing.cleavages.join(', ')} ; relance (toutes les familles) : args = { ...config, only: ["-"], skipFacts: true }`)
    if (missing.facts) console.log('vérification des faits absente ; relance : args = { ...config, only: ["-"], skipCleavages: true }')
    if (!only.length && !missing.cleavages.length && !missing.facts) console.log('recherche complète')
  },

  'decisions-draft'([dir, file]) {
    const w = resultOf(file ?? join(dir, 'question-bank-output.json'))
    const c = w.critic ?? {}
    emit({
      _note: 'Brouillon tiré de la critique du workflow : à relire, arbitrer et compléter par le propriétaire, puis à fusionner dans decisions.json',
      tierChanges: (c.tierChanges ?? []).map(({ questionId, newTier }) => ({ questionId, newTier })),
      drops: [...(c.drops ?? []).map(x => x.questionId), ...(c.duplicates ?? []).map(x => x.newId)],
      step1: c.step1?.questionIds ?? w.stats?.step1Proposal?.questionIds ?? [],
      lastInStep: [],
      edits: [],
      rejectEdits: [],
      addApproaches: [],
      dropApproaches: [],
      positions: [],
      movePositions: [],
      externalFlags: [],
    })
  },

  'merge-families'([baseFile, partFile, outFile]) {
    if (!outFile) fail('merge-families <base.json> <partielle.json> <sortie.json>')
    const raw = readJson(baseFile)
    const B = raw.result ?? raw
    const P = resultOf(partFile)
    const redone = new Map((P.drafts ?? []).map(d => [d.group, d]))
    const topics = (P.drafts ?? []).flatMap(d => (d.topics ?? []).map(t => t.id))
    const ofRedone = id => topics.some(t => String(id).startsWith(`${t}-`))
    B.drafts = [...B.drafts.map(d => redone.get(d.group) ?? d), ...(P.drafts ?? []).filter(d => !B.drafts.some(x => x.group === d.group))]
    B.neutrality = { ...(B.neutrality ?? {}), edits: [...(B.neutrality?.edits ?? []).filter(e => !ofRedone(e.id)), ...(P.neutrality?.edits ?? [])] }
    writeFileSync(outFile, JSON.stringify(raw, null, 2))
    console.log(`familles remplacées ou ajoutées : ${[...redone.keys()].join(', ')} ; statistiques et critique de ${baseFile} non recalculées`)
  },

  'explainers-todo'([dir]) {
    const { bank } = readJson(join(dir, 'bank.json'))
    const reuse = existsSync(join(dir, 'reuse.json')) ? readJson(join(dir, 'reuse.json')) : { questions: {} }
    const logFile = join(dir, 'build-log.txt')
    const lines = existsSync(logFile) ? readFileSync(logFile, 'utf8').split('\n') : []
    const reworded = new Set(lines.filter(l => l.startsWith('reuse-question-reworded ')).map(l => l.split(' ')[1]))
    // Explications déjà propres à cette élection (explainers.json) : elles ne sont plus reprises, on ne les refait pas
    const localFile = join(dir, 'explainers.json')
    const local = new Set(existsSync(localFile) ? readJson(localFile).explainers.map(e => e.questionId) : [])
    const skipped = []
    const todo = new Map()
    for (const q of bank.questions) {
      if (reworded.has(q.id) && reuse.questions?.[q.id] && !local.has(q.id)) todo.set(q.id, { id: q.id, from: `${reuse.from}/${reuse.questions[q.id]}`, note: 'énoncé reformulé pour cette élection : adapter l’explication reprise' })
      else if (!q.explainer) todo.set(q.id, q.id)
    }
    if (flags.get('spectrum')) {
      const s = resultOf(flags.get('spectrum'))
      const notes = new Map()
      for (const c of s.corrections ?? []) {
        if (!['explication', 'graphique'].includes(c.target) || !c.electionQuestionId) continue
        const list = notes.get(c.electionQuestionId) ?? []
        list.push(`[${c.severity}] ${c.field} : ${c.issue} → ${c.proposed || 'supprimer'}${c.newSource?.url ? ` (source : ${c.newSource.url})` : ''}`)
        notes.set(c.electionQuestionId, list)
      }
      for (const h of s.explanationsOnHold ?? []) if (!notes.has(h.electionQuestionId)) notes.set(h.electionQuestionId, [`en attente : ${h.reasons.join(', ')}`])
      for (const [id, list] of notes) {
        const there = reuse.questions?.[id]
        if (!there || !bank.questions.some(q => q.id === id)) continue
        if (local.has(id)) { skipped.push(id); continue }
        todo.set(id, { id, from: `${reuse.from}/${there}`, note: `corrections retenues par la relecture d’équilibre (7-spectrum-review) : ${list.join(' ; ')}` })
      }
    }
    if (skipped.length) console.error(`déjà propres à cette élection, corrections de la relecture à vérifier à la main : ${skipped.join(', ')}`)
    console.error(`${todo.size} question(s) à expliquer`)
    emit([...todo.values()])
  },

  'spectrum-videos'([dir, file]) {
    if (!file) fail('spectrum-videos research/<id> <spectrum-review.json> [--write]')
    const s = resultOf(file)
    const reuseFile = join(dir, 'reuse.json')
    const reuse = readJson(reuseFile)
    const before = reuse.videoTopics ?? {}
    const excluded = new Set((s.excludedSeries ?? []).map(x => x.topic))
    const after = Object.fromEntries(Object.entries(before).filter(([serie]) => !excluded.has(serie)))
    for (const x of s.excludedSeries ?? []) console.log(`écartée : ${x.topic} (${x.reasons.join(', ')})`)
    const removed = Object.keys(before).filter(k => !(k in after))
    console.log(`${Object.keys(after).length} séries gardées, ${removed.length} retirées${removed.length ? ` : ${removed.join(', ')}` : ''}`)
    if (flags.get('write')) {
      writeFileSync(reuseFile, JSON.stringify({ ...reuse, videoTopics: after }, null, 2) + '\n')
      console.log(`écrit ${reuseFile} (à reconstruire : tools/build-pack.mjs)`)
    }
  },

  'check-log'([dir]) {
    const LOST = /^(orphan|edit-miss|gapfill-miss|unknown-candidate|nosource|reuse-miss|reuse-question-miss|addcand-miss|video-series-miss)\b/
    const WATCH = /^(downgrade-dup-main|dup-secondary-dropped|reuse-refused|reuse-unmapped|reuse-dup|reuse-question-reworded|addcand-known|addcand-refuted|addcand-unchecked|revision-fond|video-question-dup|video-topic-miss|consensus-topic-miss)/
    const lines = readFileSync(join(dir, 'build-log.txt'), 'utf8').split('\n').filter(Boolean)
    const lost = lines.filter(l => LOST.test(l))
    const watch = lines.filter(l => WATCH.test(l))
    for (const l of lost) console.log(`PERTE  ${l}`)
    for (const l of watch) console.log(`À VOIR ${l}`)
    console.log(`${lines.length} lignes ; ${lost.length} perte(s) de donnée, ${watch.length} ligne(s) à examiner`)
    if (lost.length) process.exitCode = 1
  },
}

if (!commands[command]) fail(`commandes : ${Object.keys(commands).join(', ')}`)
commands[command](positional)
