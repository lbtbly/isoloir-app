// Nouvelle mesure des chiffres publiés après une application de la veille automatique d'Isoloir (constructeur B7 ;
// contrat : tools/veille/CONTRACT.md §d.8). Trois choses, dans l'ordre :
//   1. les chiffres de l'accueil (election.audit) : audit-pack une première fois (il peut échouer sur audit-displayed),
//      report des parts arrondies de research/<id>/audit.json (shares.quick) sur la seule ligne « audit: { … } »
//      d'election.ts, puis audit-pack une seconde fois, qui doit sortir en 0 ;
//   2. les trois constantes exactes de la Méthode (ECHIQUIER_WEIGH.compatibleShare, ECHIQUIER_CROSS.deduced,
//      ECHIQUIER_MANNER.style et styleQuick), recalculées avec le code même des tests (tests/echiquier-copy.test.ts),
//      remplacées nombre par nombre si leurs règles d'indice tiennent (les libellés publiés restent vrais) ;
//   3. la porte D5 : les quatre audits du profil en --json (audit-echiquier, puis audit-croix, audit-poids et
//      audit-facon, sans puis avec --quick), comparés à ECHIQUIER_PUBLISHED (tolérances de
//      tests/echiquier-calibration.test.ts), aux écarts publiés (jamais élargis, à l'arrondi publié) et aux verdicts de
//      référence (research/presidentielle-2027/veille/d5-baseline.json).
// Aucun appel au réseau ni à une IA ; ne touche à rien d'autre qu'election.ts (ligne audit), audit.json (écrit par
// audit-pack), echiquierMethodCopy.ts (nombres des trois constantes) et, avec --write-baseline, d5-baseline.json.
//
// Usage : node <WT>/tools/veille/remeasure.mjs [--dry-run] [--write-baseline] [--root <abs>] [--now <ISO>]
//   --dry-run        : mêmes mesures, rien n'est écrit (audit-pack écrit son audit.json dans un dossier temporaire ;
//                      sa seconde passe est remplacée par la première, moins audit-displayed : l'audit est déterministe)
//   --write-baseline : écrit d5-baseline.json depuis la mesure courante, sans comparer de verdicts (l'intégration le
//                      lance une fois, sur l'état d'origin/main) ; refusé (2) dans un worktree qu'une exécution tient
//                      (verrou) : une exécution ne réécrit jamais la référence qui la juge
// La politique (remeasure.profiles, noisy) et la référence D5 se lisent à origin/main (fichiers de contrôle du
// propriétaire), jamais dans l'arbre de travail ; dans une exécution, une référence absente d'origin/main donne 31 (la
// porte des verdicts ne s'ouvre pas en silence).
//   --root           : la racine du worktree (tests) ; par défaut le checkout qui contient ce script
// Lancés depuis la racine : node tools/audit-pack.mjs presidentielle-2027 --quiet ; node tools/audit-echiquier.mjs
// --profiles <policy.remeasure.profiles> --noisy <policy.remeasure.noisy> --json ; node tools/audit-{croix,poids,facon}.mjs
// --noisy <n> [--quick] --json. Les candidats de l'exécution (paquets d'un échec) viennent de
// <état local>/runs/<runId>/apply-report.json (ou de sa copie versionnée), runId d'après le verrou.
//
// Sortie (une ligne JSON) : {auditPatched, audit:{profiles,minShare,maxShare}, constantsPatched:[…], drift:[{key,
// published, measured}], verdicts:{<outil>.<clé>: verdict}, baseline:'lue'|'absente'|'écrite', files}.
// Codes : 0 ; 2 (appel mal formé, dossier principal, --write-baseline dans une exécution) ; 30 (contrôle dur d'audit-pack en échec à la seconde passe ;
// règle d'indice cassée ; calibration hors tolérance ; écart D5 élargi ; verdict D5 dégradé : la raison le dit, bundles
// « candidat:<id> » quand le contrôle nomme un candidat de l'exécution, [] sinon) ; 31 (audit-pack ne charge pas le pack,
// un audit --json échoue ou rend une forme inattendue, une ligne à remplacer est absente ou en double, référence D5
// absente d'origin/main dans une exécution).
// Il faut Node 22.18+ (TypeScript sans compilation, module.registerHooks).

import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  CONTROL_FILES, ELECTION_ID, EXIT, assertNotMainFolder, currentRunId, exit, fail, parseArgs, parseNow, paths, readControlJson,
  readJson, rootFrom, runMain, runNode, tail, todayInParis, writeJson, writeText,
} from './lib/common.mjs'
import { mergePolicy, parseCandidatesTs } from './lib/apply.mjs'
import {
  auditBounds, calibrationDrift, currentVerdicts, exactShares, failedHardChecks, gapDrift, indexRules, namedCandidates,
  patchAuditLine, patchExactConstants, readAuditLine, verdictDrift,
} from './lib/remeasure.mjs'
import { SCHEMAS, validate } from './schemas.mjs'

const HOURS = 3600 * 1000

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    'dry-run': { type: 'boolean' },
    'write-baseline': { type: 'boolean' },
    root: { type: 'string' },
    now: { type: 'string' },
  })
  if (opts._.length) fail(EXIT.USAGE, `argument inattendu : ${opts._.join(' ')}`)
  const root = rootFrom(opts)
  const P = paths(root)
  const dryRun = opts['dry-run']
  const today = todayInParis(parseNow(opts.now))
  if (!dryRun) assertNotMainFolder(root)
  const control = (rel, fallback) => {
    try {
      return readControlJson(root, rel, fallback)
    } catch (e) {
      return fail(EXIT.CODE, e.message)
    }
  }
  const policy = mergePolicy(control(CONTROL_FILES.policy, {}))
  const cards = parseCandidatesTs(readFileSync(join(P.src, 'candidates.ts'), 'utf8'))
  const files = []

  // Une exécution (verrou) ne réécrit jamais la référence D5, et ne se juge jamais sans elle
  const runId = currentRunId(root)
  if (runId && opts['write-baseline']) fail(EXIT.USAGE, `la référence D5 ne s’écrit qu’à l’intégration, hors exécution (ce worktree est tenu par ${runId}) : --write-baseline refusé`)
  const baselineFile = opts['write-baseline'] ? null : control(CONTROL_FILES.d5Baseline, null)
  if (runId && !opts['write-baseline'] && !baselineFile) fail(EXIT.CODE, `${CONTROL_FILES.d5Baseline} absent d’origin/main : dans une exécution, la porte des verdicts D5 ne s’ouvre pas sans sa référence`)

  // Candidats de cette exécution : les paquets « candidat:<id> » de son application
  const reportFile = runId && [P.local && join(P.local.run(runId), 'apply-report.json'), join(P.committedRun(runId), 'apply-report.json')].find(f => f && existsSync(f))
  const runCandidates = reportFile ? Object.keys(readJson(reportFile).bundles ?? {}).filter(k => k.startsWith('candidat:')).map(k => k.slice('candidat:'.length)) : []
  const bundlesOf = ids => ids.filter(id => runCandidates.includes(id)).map(id => `candidat:${id}`)

  // ——— 1. Chiffres de l'accueil : audit-pack, report, audit-pack ———
  const tmp = dryRun ? mkdtempSync(join(tmpdir(), 'isoloir-remeasure-')) : null
  let payload
  try {
    payload = await measure()
  } finally {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
  }
  // Un essai se range à part (remeasure-essai.json) : rederive lit remeasure.json comme la vraie mesure
  exit(EXIT.OK, payload, { root, ...(dryRun ? { tag: 'essai' } : {}) })

  async function measure() {
    const researchFor = tmp ?? P.research
    if (tmp) copyFileSync(P.config, join(tmp, 'config.json'))
    const auditPack = () => {
      const r = runNode(join(root, 'tools', 'audit-pack.mjs'), [ELECTION_ID, '--quiet', ...(tmp ? ['--research', tmp] : [])], { cwd: root, timeoutMs: 2 * HOURS })
      if (r.code !== 0 && r.code !== 1) fail(EXIT.CODE, `audit-pack ne charge pas le pack (code ${r.code}) : ${tail(r.stderr, 10)}`)
      return { code: r.code, audit: readJson(join(researchFor, 'audit.json')) }
    }
    const first = auditPack()
    const bounds = auditBounds(first.audit)
    const electionText = readFileSync(P.election, 'utf8')
    const current = readAuditLine(electionText)
    const target = { profiles: current.profiles, minShare: bounds.minShare, maxShare: bounds.maxShare }
    const auditPatched = target.minShare !== current.minShare || target.maxShare !== current.maxShare
    if (auditPatched && !dryRun) {
      writeText(P.election, patchAuditLine(electionText, target))
      files.push('src/elections/presidentielle-2027/election.ts')
    }
    let hard
    if (dryRun) hard = failedHardChecks(first.audit).filter(c => c.id !== 'audit-displayed' || !auditPatched)
    else {
      const second = auditPack()
      files.push(`research/${ELECTION_ID}/audit.json`)
      hard = failedHardChecks(second.audit)
      if (second.code !== 0 && !hard.length) fail(EXIT.DATA, 'audit-pack, seconde passe : code 1 sans contrôle dur en échec dans audit.json', { bundles: [] })
    }
    if (hard.length) {
      fail(EXIT.DATA, `audit-pack, contrôles durs en échec : ${hard.map(c => `${c.id}${c.detail ? ` (${c.detail})` : ''}`).join(' ; ')}`, {
        bundles: bundlesOf(namedCandidates(hard, cards)), auditPatched, files,
      })
    }

    // ——— 2. Les trois constantes exactes, avec le code des tests ———
    const { useSiteModules } = await import('../site-modules.mjs')
    useSiteModules()
    const imp = rel => import(pathToFileURL(join(root, rel)).href)
    const { elections } = await imp('src/elections/all.ts')
    const pack = elections.find(p => p.election.id === ELECTION_ID)
    const { panelOf } = await imp('src/core/echiquierPanel.ts')
    const { effectiveWeight, dealbreakerLevel } = await imp('src/core/score.ts')
    const { profilesFor, isQuick } = await imp('tests/fixtures/echiquier-profiles.ts')
    const M = await imp('src/core/echiquierMethodCopy.ts')
    const published = { PUBLISHED: M.ECHIQUIER_PUBLISHED, CROSS: M.ECHIQUIER_CROSS, WEIGH: M.ECHIQUIER_WEIGH, MANNER: M.ECHIQUIER_MANNER }
    const shares = exactShares({ pack, panelOf, effectiveWeight, dealbreakerLevel, profilesFor, isQuick, mannerClones: M.ECHIQUIER_MANNER.clones })
    const broken = indexRules(shares).filter(r => !r.ok)
    if (broken.length) {
      const blocs = new Set(broken.flatMap(r => [...r.indices, ...r.expected]))
      const ids = [...blocs].flatMap(i => shares.panel[i] ?? [])
      fail(EXIT.DATA, `règle d'indice : ${broken.map(r => `${r.constant} (aux indices ${r.indices.join(' et ')}, attendus ${r.expected.join(' et ')})`).join(' ; ')}`, {
        bundles: bundlesOf(ids), auditPatched, files,
      })
    }
    const methodText = readFileSync(P.methodCopy, 'utf8')
    const exact = patchExactConstants(methodText, shares, published)
    if (exact.patched.length && !dryRun) {
      writeText(P.methodCopy, exact.text)
      files.push('src/core/echiquierMethodCopy.ts')
    }

    // ——— 3. Porte D5 ———
    const { profiles, noisy } = policy.remeasure
    const audit = (tool, args) => {
      const r = runNode(join(root, 'tools', `${tool}.mjs`), [...args, '--json'], { cwd: root, timeoutMs: 4 * HOURS })
      if (r.code !== 0) fail(EXIT.CODE, `${tool} ${args.join(' ')} --json : code ${r.code} : ${tail(r.stderr, 10)}`)
      let value
      try {
        value = JSON.parse(r.stdout.trim().split('\n').filter(Boolean).at(-1) ?? '')
      } catch {
        fail(EXIT.CODE, `${tool} --json : stdout n'est pas une ligne JSON`)
      }
      const errors = validate(SCHEMAS.AUDIT_JSON, value)
      if (errors.length || value.tool !== tool) fail(EXIT.CODE, `${tool} --json : sortie non conforme (${errors.slice(0, 5).join(' ; ') || `outil ${value.tool}`})`)
      return value
    }
    const n = String(noisy)
    const audits = {
      echiquier: audit('audit-echiquier', ['--profiles', String(profiles), '--noisy', n]),
      croix: audit('audit-croix', ['--noisy', n]),
      croixQuick: audit('audit-croix', ['--noisy', n, '--quick']),
      poids: audit('audit-poids', ['--noisy', n]),
      poidsQuick: audit('audit-poids', ['--noisy', n, '--quick']),
      facon: audit('audit-facon', ['--noisy', n]),
      faconQuick: audit('audit-facon', ['--noisy', n, '--quick']),
    }
    const calibration = calibrationDrift(audits.echiquier.measured, published.PUBLISHED)
    const gaps = gapDrift(audits, published)
    const verdicts = currentVerdicts(audits)
    const degraded = opts['write-baseline'] || !baselineFile ? [] : verdictDrift(verdicts, baselineFile.verdicts)
    const exactDrift = [
      { key: 'ECHIQUIER_WEIGH.compatibleShare', published: [published.WEIGH.compatibleShare.low, published.WEIGH.compatibleShare.high], measured: [Math.min(...shares.compatibleShare), Math.max(...shares.compatibleShare)] },
      { key: 'ECHIQUIER_CROSS.deduced', published: [published.CROSS.deduced.low, published.CROSS.deduced.high], measured: [Math.min(...shares.deduced), Math.max(...shares.deduced)] },
      { key: 'ECHIQUIER_MANNER.style', published: [...published.MANNER.style], measured: shares.style },
      { key: 'ECHIQUIER_MANNER.styleQuick', published: [...published.MANNER.styleQuick], measured: shares.styleQuick },
    ]
    const drift = [
      ...calibration.map(({ key, published: p, measured }) => ({ key, published: p, measured })),
      ...gaps.map(({ key, published: p, measured }) => ({ key, published: p, measured })),
      ...exactDrift,
    ]
    const problems = [
      ...calibration.filter(c => c.over).map(c => `calibration : ${c.key} mesuré ${c.measured}, publié ${c.published} (tolérance ${c.tolerance})`),
      ...gaps.filter(g => g.widened).map(g => `écart D5 élargi : ${g.key} mesuré ${g.measured}, publié ${g.published}`),
      ...degraded.map(d => `verdict D5 : ${d.key} passe de « ${d.baseline} » à « ${d.now} »`),
    ]
    if (problems.length) fail(EXIT.DATA, problems.join(' ; '), { bundles: [], auditPatched, constantsPatched: exact.patched, drift, verdicts, files })

    let baseline = baselineFile ? 'lue' : 'absente'
    if (opts['write-baseline'] && !dryRun) {
      writeJson(P.d5Baseline, { format: 'isoloir-veille-d5/1', measuredAt: today, verdicts })
      files.push(`research/${ELECTION_ID}/veille/d5-baseline.json`)
      baseline = 'écrite'
    }
    process.stderr.write(`remeasure : accueil ${auditPatched ? `${current.minShare}–${current.maxShare} → ${target.minShare}–${target.maxShare}` : 'inchangé'} ; constantes ${exact.patched.length ? exact.patched.join(', ') : 'inchangées'}${dryRun ? ' (essai, rien écrit)' : ''}\n`)
    return { auditPatched, audit: target, constantsPatched: exact.patched, drift, verdicts, baseline, files: dryRun ? [] : files }
  }
})
