// Portes horaires de la veille automatique (contrat : tools/veille/CONTRACT.md §d.4) : le gel des jours de vote, le gel
// souple qui le précède, l'entre-deux-tours et la fin de la veille, appliqués à une étape (start, push, deploy) et à un
// instant donné. Fonctions pures : les périodes de gel de l'élection arrivent en paramètre (freezeSpans de
// src/core/freeze.ts, appliqué à election.ts par le script gate-time.mjs ou run.mjs), l'instant aussi (--now).
//
// Règles (policy.json, valeurs par défaut de DEFAULT_POLICY) :
//   gel           freezeSpans(election) (election.freezeWindows : du 16/04/2027 0 h au 18/04 20 h, du 30/04 0 h au
//                 02/05 20 h), plus policy.extraFreezeWindows ; début inclus, fin exclue (comme frozenAt).
//   gel souple    [début du gel − softFreezeHours (48), début du gel) : aucune publication automatique.
//   entre-deux-tours  de la fin du premier gel de l'élection au début du second : avec reportOnlyBetweenRounds,
//                 rapport seulement (mode « rapport ») ; push et deploy y sont refusés (12, « entre-deux-tours »).
//   fin           now ≥ policy.endAt (2027-05-02T20:00:00+02:00) : 13 à toutes les étapes.
//   start         refusé si [now, now + hours] touche un gel (11) ou un gel souple (12) ; seul le kind « quotidien »
//                 (qui ne publie jamais) peut partir en gel souple. hours vaut hebdoHorizonHours (8) pour hebdo.
//   push, deploy  refusés si now (ou [now, now + hours] si hours est donné) est dans un gel (11), un gel souple (12),
//                 ou entre les deux tours (12).
//
// Usage :
//   import { gateTime, allFreezeSpans } from './lib/time.mjs'
//   const g = gateTime({ step: 'start', now: new Date('2027-04-12T06:00:00+02:00'), hours: 8, kind: 'hebdo',
//     electionSpans: freezeSpans(election), policy })   // { code: 0, mode: 'publication', … }

import { END_AT, EXIT, isoInParis } from './common.mjs'

const HOUR_MS = 3600 * 1000
const ms = iso => new Date(iso).getTime()
export const GATE_STEPS = Object.freeze(['start', 'push', 'deploy'])

/** Gels de l'élection plus ceux de la politique, triés par début ; chacun garde son origine (« élection » | « politique ») */
export function allFreezeSpans(electionSpans = [], policy = {}) {
  const own = (electionSpans ?? []).map(s => ({ start: s.start, end: s.end, origin: 'élection' }))
  const extra = (policy.extraFreezeWindows ?? []).map(s => ({ start: s.start, end: s.end, origin: 'politique', ...(s.reason ? { reason: s.reason } : {}) }))
  return [...own, ...extra].sort((a, b) => ms(a.start) - ms(b.start))
}

/** Gels souples : les softFreezeHours qui précèdent chaque gel, [début − h, début) ; aucun si h vaut 0 */
export function softFreezeSpans(spans, hours) {
  if (!hours || hours <= 0) return []
  return spans.map(s => ({ start: isoInParis(new Date(ms(s.start) - hours * HOUR_MS)), end: s.start, before: { start: s.start, end: s.end } }))
}

/** L'entre-deux-tours : de la fin du premier gel de l'élection au début du second ; null s'il y en a moins de deux */
export function betweenRoundsSpan(electionSpans = []) {
  const s = [...(electionSpans ?? [])].sort((a, b) => ms(a.start) - ms(b.start))
  if (s.length < 2) return null
  return { start: s[0].end, end: s[1].start }
}

/**
 * Décision de la porte horaire. Rend { code, reason, step, kind, now, until, hours, mode, freeze, softFreeze,
 * betweenRounds, nextFreeze, endAt } : code 0 (passe), 11 (gel), 12 (gel souple ou entre-deux-tours), 13 (fin).
 * now est une Date ; les périodes sont des ISO 8601 avec fuseau.
 */
export function gateTime({ step, now, hours = 0, kind = null, electionSpans = [], policy = {} }) {
  if (!GATE_STEPS.includes(step)) throw new Error(`étape inconnue : ${step} (${GATE_STEPS.join(' | ')})`)
  const t = now.getTime()
  const h = Math.max(0, Number(hours) || 0)
  const until = t + h * HOUR_MS
  const endAt = policy.endAt ?? END_AT
  const spans = allFreezeSpans(electionSpans, policy)
  const softs = softFreezeSpans(spans, policy.softFreezeHours ?? 0)
  const br = betweenRoundsSpan(electionSpans)
  // [t, until] touche [s, e) : t < e et until ≥ s (un horizon nul revient à « now dans la période »)
  const touches = p => t < ms(p.end) && until >= ms(p.start)
  const strip = p => (p ? { start: p.start, end: p.end, ...(p.origin ? { origin: p.origin } : {}), ...(p.reason ? { reason: p.reason } : {}) } : null)
  const freeze = spans.find(touches) ?? null
  const softFreeze = freeze ? null : softs.find(touches) ?? null
  const inBetween = !!br && t >= ms(br.start) && t < ms(br.end)
  const reportOnly = inBetween && policy.reportOnlyBetweenRounds !== false
  const nextFreeze = strip(spans.find(s => ms(s.start) > t) ?? null)
  const out = {
    code: EXIT.OK,
    reason: null,
    step,
    kind,
    now: isoInParis(now),
    until: isoInParis(new Date(until)),
    hours: h,
    mode: reportOnly ? 'rapport' : 'publication',
    freeze: strip(freeze),
    softFreeze: softFreeze ? { start: softFreeze.start, end: softFreeze.end } : null,
    betweenRounds: inBetween ? br : null,
    nextFreeze,
    endAt,
  }
  if (t >= ms(endAt)) return { ...out, code: EXIT.ENDED, reason: `fin de la veille : ${out.now} est après ${endAt}` }
  if (freeze) {
    const what = h > 0 ? `[${out.now}, ${out.until}] touche` : `${out.now} est dans`
    return { ...out, code: EXIT.FROZEN, reason: `gel : ${what} la période du ${freeze.start} au ${freeze.end}` }
  }
  if (softFreeze && !(step === 'start' && kind === 'quotidien')) {
    const what = h > 0 ? `[${out.now}, ${out.until}] touche` : `${out.now} est dans`
    return {
      ...out,
      code: EXIT.SOFT_FROZEN,
      reason: `gel souple : ${what} les ${policy.softFreezeHours} h qui précèdent le gel du ${softFreeze.before.start}`,
    }
  }
  if (step !== 'start' && reportOnly) {
    return { ...out, code: EXIT.SOFT_FROZEN, reason: `entre-deux-tours : rapport seulement jusqu'au ${br.end} (reportOnlyBetweenRounds)` }
  }
  return out
}

/** Horizon par défaut de l'étape start : hebdoHorizonHours pour hebdo, 0 sinon */
export const startHorizon = (kind, policy = {}) => (kind === 'hebdo' ? policy.hebdoHorizonHours ?? 8 : 0)

/**
 * Les périodes de gel de l'élection de root : freezeSpans de src/core/freeze.ts (chargé par tools/site-modules.mjs,
 * importSite), appliqué à root/src/elections/presidentielle-2027/election.ts. Réservé aux scripts : il installe les
 * crochets de module de site-modules.
 */
export async function loadElectionFreezeSpans(root) {
  const { importSite, useSiteModules } = await import('../../site-modules.mjs')
  useSiteModules()
  const { freezeSpans } = await importSite('src/core/freeze.ts')
  const { loadElection } = await import('./common.mjs')
  const election = await loadElection(root)
  return { election, spans: freezeSpans(election) }
}
