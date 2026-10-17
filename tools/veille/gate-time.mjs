// Porte horaire de la veille automatique (contrat : tools/veille/CONTRACT.md §d.4) : une étape peut-elle partir à cet
// instant ? Gel des jours de vote (freezeSpans de src/core/freeze.ts sur election.freezeWindows, plus
// policy.extraFreezeWindows), gel souple des policy.softFreezeHours (48) heures qui le précèdent, entre-deux-tours
// (rapport seulement), fin de la veille (policy.endAt, 2027-05-02T20:00:00+02:00). Lecture seule : il n'écrit rien,
// sinon sa ligne de sortie dans <état local>/runs/<runId>/gate-time-<étape>.json quand une exécution est en cours.
//
// Usage : node <WT>/tools/veille/gate-time.mjs --step start|push|deploy [--now ISO] [--hours N] [--kind …] [--root <abs>]
//   --step   start : [now, now + hours] ne doit toucher ni un gel (11) ni un gel souple (12) ; seul --kind quotidien
//            peut partir en gel souple. push, deploy : now hors gel (11), hors gel souple et hors entre-deux-tours (12).
//   --now    instant simulé, ISO 8601 avec fuseau (tests et essais) ; sinon ISOLOIR_VEILLE_NOW, sinon l'horloge
//   --hours  horizon de l'étape ; par défaut hebdoHorizonHours (8) pour start --kind hebdo, 0 sinon
//   --kind   quotidien | hebdo | candidat | retrait | accord
//   --root   racine de travail (tests) ; par défaut le checkout de ce script
// Sortie (une ligne JSON) : { step, kind, now, until, hours, mode: 'publication' | 'rapport', freeze, softFreeze,
//   betweenRounds, nextFreeze, endAt, reason? }. Codes : 0 passe, 11 gel, 12 gel souple ou entre-deux-tours,
//   13 fin de la veille, 2 appel mal formé.
// La politique (softFreezeHours, endAt, extraFreezeWindows, reportOnlyBetweenRounds) se lit à origin/main, jamais dans
// l'arbre de travail de l'exécution (lib/state.mjs, loadPolicy). Il faut Node 22.18+ (TypeScript sans compilation).

import { EXIT, exit, parseArgs, parseNow, rootFrom, runMain } from './lib/common.mjs'
import { loadPolicy } from './lib/state.mjs'
import { GATE_STEPS, gateTime, loadElectionFreezeSpans, startHorizon } from './lib/time.mjs'

const KINDS = ['quotidien', 'hebdo', 'candidat', 'retrait', 'accord']

runMain(async () => {
  const opts = parseArgs(process.argv.slice(2), {
    step: { type: 'string', required: true, choices: GATE_STEPS },
    now: { type: 'string' },
    hours: { type: 'number' },
    kind: { type: 'string', choices: KINDS },
    root: { type: 'string' },
  })
  if (opts._.length) exit(EXIT.USAGE, { reason: `argument inattendu : ${opts._.join(' ')}` })
  const root = rootFrom(opts)
  const policy = loadPolicy(root)
  const now = parseNow(opts.now)
  const { spans } = await loadElectionFreezeSpans(root)
  const hours = opts.hours ?? (opts.step === 'start' ? startHorizon(opts.kind, policy) : 0)
  if (hours < 0) exit(EXIT.USAGE, { reason: '--hours : nombre positif attendu' })
  const { code, reason, ...rest } = gateTime({ step: opts.step, now, hours, kind: opts.kind ?? null, electionSpans: spans, policy })
  if (reason) process.stderr.write(`${reason}\n`)
  exit(code, { ...rest, ...(reason ? { reason } : {}) }, { tag: opts.step, root })
})
