// Garde la valeur de retour d'un lancement de l'outil Workflow (contrat : tools/veille/CONTRACT.md §a.2, §c.7, §d.5),
// juste après lui : retrouve <projets Claude>/*/<session>/workflows/wf_<id>.json (toutes sessions confondues ; le
// préfixe wf_ est facultatif), le copie dans <état local>/runs/<runId>/wf/, note sa dépense (totalTokens, et par
// candidat d'après les libellés des agents) dans spend.jsonl et le lancement dans run.json, valide la valeur de retour
// selon --kind, puis l'écrit là où la suite l'attend. Un même lancement gardé deux fois ne compte et ne s'ajoute qu'une
// fois.
//
// Usage : node <WT>/tools/veille/persist.mjs --run <wfRunId> --kind watch|refresh|research|addcandidate|expansion|explainers
//         [--candidate <id>] [--recover] [--root <abs>] [--now ISO]
//   watch         WATCH_RESULT → runs/<runId>/watch.json (local) et research/presidentielle-2027/veille/runs/<runId>/watch.json
//   refresh       REFRESH_RESULT → refresh-<n>.json, et création ou ajout dans changeset.json (local et versionné ; since
//                 de run start)
//   research      node tools/extract-journal.mjs <journal> <dossier temporaire>, puis copie dans research/presidentielle-2027/
//                 des dossier_<id>.json et refresh_<id>.json (de --candidate seul s'il est donné) ; un fichier existant
//                 différent n'est jamais écrasé (30, rien n'est écrit)
//   addcandidate  research/presidentielle-2027/add-candidate/<id>.json ; refus (30) d'une erreur de 6-add-candidate ou
//                 d'une sortie partielle (args.onlyGroups), gardée seulement dans runs/<runId>/
//   expansion     research/presidentielle-2027/expansion-output-<N>.json, N = premier numéro libre ≥ 3 (le même fichier
//                 s'il existe déjà à l'identique)
//   explainers    research/presidentielle-2027/explainers-output-<runId>.json
//   --recover     le fichier de résultat manque (exécution coupée) : reprend du journal d'agents les résultats finis dans
//                 runs/<runId>/recovered-<wfRunId>.json, marque run.json « interrompu » ; 30 si rien n'est récupérable
// Le dossier des projets Claude est ~/.claude/projects (ISOLOIR_VEILLE_PROJECTS pour les tests). Il faut une exécution
// en cours dans ce worktree (run.mjs start). Sortie : une ligne JSON { runId, wfRunId, kind, stage, tokens, files, … } ;
// codes 0, 2 (appel), 30 (workflow en échec, valeur de retour non conforme, écrasement refusé, rien à reprendre), 31.
// Il faut Node 22.18+.

import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { SCHEMAS, validate } from './schemas.mjs'
import {
  EXIT, appendJsonl, assertNotMainFolder, claudeProjectsDir, currentRunId, exit, fail, isoInParis, parseArgs, parseNow, paths, readJson,
  rootFrom, runMain, runNode, stableJson, tail, worktreeRoot, writeJson, writeText,
} from './lib/common.mjs'
import { readLock } from './lib/lock.mjs'
import {
  addToChangeset, checkAddCandidate, findWorkflowFiles, firstFreeNumber, normalizeWfId, planResearchCopy, recoverFromJournal, researchFileWanted,
  stageOf, tokensByCandidate, workflowFailure,
} from './lib/persist.mjs'
import { readSpend, spendLine } from './lib/budget.mjs'

const KINDS = ['watch', 'refresh', 'research', 'addcandidate', 'expansion', 'explainers']
const RUN_KINDS = ['quotidien', 'hebdo', 'candidat', 'retrait', 'accord']

runMain(async () => {
  const o = parseArgs(process.argv.slice(2), {
    run: { type: 'string', required: true },
    kind: { type: 'string', required: true, choices: KINDS },
    candidate: { type: 'string' },
    recover: { type: 'boolean' },
    root: { type: 'string' },
    now: { type: 'string' },
  })
  const root = rootFrom(o)
  assertNotMainFolder(root)
  const P = paths(root)
  const L = P.local
  if (!L) fail(EXIT.USAGE, `état local introuvable depuis ${root}`)
  const runId = currentRunId(root)
  if (!runId) fail(EXIT.USAGE, `aucune exécution en cours dans ce worktree (${root}) : run.mjs start d'abord`)
  const now = parseNow(o.now)
  const tag = o.candidate ? `${o.kind}-${o.candidate}` : o.kind
  const done = (code, payload) => exit(code, { runId, ...payload }, { tag, root })
  const runDir = L.run(runId)
  const runPath = join(runDir, 'run.json')
  const run = readJson(runPath, null)
  const lock = readLock(L.lock)
  const runKind = [run?.kind, lock?.kind].find(k => RUN_KINDS.includes(k)) ?? null
  const wfRunId = normalizeWfId(o.run)
  if (!/^wf_[A-Za-z0-9_-]+$/.test(wfRunId)) fail(EXIT.USAGE, `--run : identifiant de lancement « ${o.run} » illisible`)
  const found = findWorkflowFiles(claudeProjectsDir(), wfRunId)
  const config = readJson(P.config, { candidates: [] })
  const rel = f => (f.startsWith(root) ? relative(root, f) : f)

  // Le lancement noté dans run.json : une entrée par wfRunId, complétée (jamais remplacée : elle garde son fichier refresh-<n>)
  const noteWorkflow = entry => {
    if (!run) return
    const prev = (run.workflows ?? []).find(w => w.wfRunId === wfRunId) ?? {}
    run.workflows = [...(run.workflows ?? []).filter(w => w.wfRunId !== wfRunId), { ...prev, wfRunId, kind: o.kind, persistedAt: isoInParis(now), ...entry }]
    writeJson(runPath, run)
  }

  // Reprise d'une exécution coupée : le journal seul
  if (o.recover && !found.results.length) {
    if (!found.journals.length) fail(EXIT.DATA, `${wfRunId} : ni fichier de résultat ni journal d'agents dans ${claudeProjectsDir()}`, { bundles: [] })
    const rec = recoverFromJournal(readFileSync(found.journals[0], 'utf8'))
    if (run) {
      run.status = 'interrompu'
      run.note = [run.note, `${wfRunId} repris du journal (${rec.finished}/${rec.started} agents)`].filter(Boolean).join(' ; ')
    }
    noteWorkflow({ tokens: null, recovered: true })
    if (!rec.finished) fail(EXIT.DATA, `${wfRunId} : aucun résultat d'agent à reprendre dans ${found.journals[0]}`, { bundles: [] })
    const file = join(runDir, `recovered-${wfRunId}.json`)
    writeJson(file, { format: 'isoloir-veille-recovered/1', wfRunId, kind: o.kind, journal: found.journals[0], at: isoInParis(now), ...rec })
    done(EXIT.OK, { wfRunId, kind: o.kind, recovered: rec.finished, started: rec.started, missing: rec.missing, files: [file], note: 'dépense inconnue : le journal ne donne pas les jetons' })
  }
  if (!found.results.length) {
    fail(EXIT.DATA, `${wfRunId}.json introuvable sous ${claudeProjectsDir()}/*/*/workflows/${o.recover ? '' : ' (--recover si l’exécution a été coupée)'}`, { bundles: [] })
  }
  const source = found.results[0]
  const text = readFileSync(source, 'utf8')
  let wf
  try {
    wf = JSON.parse(text)
  } catch (e) {
    fail(EXIT.DATA, `${source} : JSON illisible (${e.message})`, { bundles: [] })
  }
  const files = []
  const raw = join(runDir, 'wf', `${wfRunId}.json`)
  writeText(raw, text)
  files.push(raw)

  // Dépense : une ligne par lancement, jamais deux
  const stage = stageOf(o.kind, wf.result)
  const tokens = Math.max(0, Math.round(Number(wf.totalTokens) || 0))
  const byCandidate = tokensByCandidate(wf, config.candidates.map(c => c.id))
  const already = readSpend(L.spend).lines.some(l => l.wfRunId === wfRunId)
  if (!already && runKind) appendJsonl(L.spend, spendLine({ now, runId, kind: runKind, stage, wfRunId, tokens, byCandidate }))
  const failure = workflowFailure(wf)
  noteWorkflow({ tokens, status: wf.status ?? null, ...(failure ? { failure } : {}) })
  if (failure) fail(EXIT.DATA, `${wfRunId} : ${failure}`, { bundles: [], tokens, stage })

  const both = (name, value) => {
    const local = join(runDir, name)
    const committed = join(P.committedRun(runId), name)
    writeJson(local, value)
    writeJson(committed, value)
    files.push(local, rel(committed))
  }
  const schemaFail = (what, errors) => fail(EXIT.DATA, `${what} non conforme : ${errors.slice(0, 10).join(' ; ')}${errors.length > 10 ? ` ; … ${errors.length - 10} autres` : ''}`, { bundles: [], errors: errors.slice(0, 10) })
  const extra = {}

  switch (o.kind) {
    case 'watch': {
      const errors = validate(SCHEMAS.WATCH_RESULT, wf.result)
      // Le workflow 8 rend { format, electionId, error: [raisons] } sur des arguments mal formés ou si ses deux chercheurs
      // sont morts : une veille aveugle, jamais « rien de neuf » ; la raison est la sienne, pas les écarts au schéma
      const wfError = wf.result?.error
      if (errors.length && wfError && (!Array.isArray(wfError) || wfError.length)) {
        const why = (Array.isArray(wfError) ? wfError : [wfError]).map(String)
        fail(EXIT.DATA, `veille des candidats en erreur : ${why.slice(0, 10).join(' ; ')}`.slice(0, 1000), { bundles: [], errors: why.slice(0, 10) })
      }
      if (errors.length) schemaFail('WATCH_RESULT', errors)
      both('watch.json', wf.result)
      extra.events = wf.result.events.length
      break
    }
    case 'refresh': {
      const errors = validate(SCHEMAS.REFRESH_RESULT, wf.result)
      if (errors.length) schemaFail('REFRESH_RESULT', errors)
      const previous = (run?.workflows ?? []).find(w => w.wfRunId === wfRunId)?.file
      const taken = existsSync(runDir) ? readdirSync(runDir).map(f => /^refresh-(\d+)\.json$/.exec(f)?.[1]).filter(Boolean).map(Number) : []
      const name = previous ?? `refresh-${taken.length ? Math.max(...taken) + 1 : 1}.json`
      both(name, wf.result)
      const csPath = join(runDir, 'changeset.json')
      const { changeset, added } = addToChangeset(readJson(csPath, null), {
        runId,
        baseCommit: run?.baseCommit,
        today: run?.today ?? wf.result.today,
        sinceMap: run?.since ?? {},
        result: wf.result,
        wfRunId,
      })
      const csErrors = validate(SCHEMAS.CHANGESET, changeset)
      if (csErrors.length) fail(EXIT.CODE, `changeset non conforme : ${csErrors.slice(0, 10).join(' ; ')}`)
      both('changeset.json', changeset)
      noteWorkflow({ tokens, status: wf.status ?? null, file: name })
      Object.assign(extra, { file: name, changesetResults: changeset.results.length, added, changes: wf.result.candidates.reduce((n, c) => n + c.changes.length, 0) })
      break
    }
    case 'research': {
      if (!found.journals.length) fail(EXIT.DATA, `${wfRunId} : journal d'agents introuvable (subagents/workflows/${wfRunId}/journal.jsonl)`, { bundles: [] })
      const tmp = mkdtempSync(join(tmpdir(), 'isoloir-extract-'))
      try {
        // Le code vient du checkout de ce script ; les données vont dans root
        const r = runNode(join(worktreeRoot(), 'tools', 'extract-journal.mjs'), [found.journals[0], tmp], { cwd: root })
        if (r.code !== 0) fail(EXIT.CODE, `extract-journal : ${tail(r.stderr, 10)}`)
        const extracted = readdirSync(tmp).filter(n => researchFileWanted(n, o.candidate ?? null)).sort().map(n => ({ name: n, text: readFileSync(join(tmp, n), 'utf8') }))
        if (!extracted.length) fail(EXIT.DATA, `${wfRunId} : aucun dossier_${o.candidate ?? '<id>'}.json dans le journal`, { bundles: [] })
        const plan = planResearchCopy(extracted, n => (existsSync(join(P.research, n)) ? readFileSync(join(P.research, n), 'utf8') : null))
        if (plan.conflicts.length) fail(EXIT.DATA, `écrasement refusé : ${plan.conflicts.join(', ')} existe(nt) déjà, différent(s), dans ${rel(P.research)}`, { bundles: [], conflicts: plan.conflicts })
        for (const f of extracted) writeText(join(runDir, 'research', f.name), f.text)
        for (const f of plan.write) {
          writeText(join(P.research, f.name), f.text)
          files.push(rel(join(P.research, f.name)))
        }
        Object.assign(extra, { written: plan.write.map(f => f.name), unchanged: plan.same })
      } finally {
        rmSync(tmp, { recursive: true, force: true })
      }
      break
    }
    case 'addcandidate': {
      const check = checkAddCandidate(wf, o.candidate ?? null)
      if (!check.ok) {
        const keep = join(runDir, `addcandidate-${check.partial ? 'partiel-' : ''}${check.id ?? 'inconnu'}.json`)
        writeJson(keep, wf.result)
        fail(EXIT.DATA, check.reason, { bundles: check.id ? [`candidat:${check.id}`] : [], kept: keep, partial: check.partial })
      }
      const dest = join(P.research, 'add-candidate', `${check.id}.json`)
      const replaced = existsSync(dest) && readFileSync(dest, 'utf8') !== stableJson(wf.result)
      writeJson(dest, wf.result)
      files.push(rel(dest))
      Object.assign(extra, { candidate: check.id, replaced })
      break
    }
    case 'expansion': {
      const names = readdirSync(P.research)
      const value = stableJson(wf.result)
      const same = names.filter(n => /^expansion-output-\d+\.json$/.test(n)).find(n => readFileSync(join(P.research, n), 'utf8') === value)
      const name = same ?? `expansion-output-${firstFreeNumber(names)}.json`
      if (!same) writeText(join(P.research, name), value)
      files.push(rel(join(P.research, name)))
      Object.assign(extra, { file: rel(join(P.research, name)), unchanged: !!same })
      break
    }
    case 'explainers': {
      const dest = join(P.research, `explainers-output-${runId}.json`)
      writeJson(dest, wf.result)
      files.push(rel(dest))
      extra.file = rel(dest)
      break
    }
  }
  done(EXIT.OK, { wfRunId, kind: o.kind, stage, tokens, byCandidate, spendRecorded: !already && !!runKind, source, files, ...extra })
})
