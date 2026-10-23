// La cascade de « Votre budget 2027 » (demande du propriétaire du 18 octobre 2026) : du déficit prévu par le PLF à celui
// de la personne, une rangée par famille et par sens (ce qui baisse le déficit, ce qui l'augmente). Toutes les rangées
// partagent la même échelle, resserrée sur le trajet (et l'objectif) pour que les petits pas se voient. Le sens se lit à
// la place de la barre et dans les mots, jamais à une couleur : le PLF à l'encre d'imprimerie, les réglages au bleu
// bille ; la fourchette du résultat en hachures. Les nombres sont dans le texte, les barres ne sont qu'une image.
import { COPY, md, pct, pctOne, deficitDecimals } from '../../core/budget/copy'
import { fallSteps, type Baseline, type Range, type Settings } from '../../core/budget/ledger'
import type { Lever } from '../../core/budget/types'

const MINUS = '−'
const NB = ' '

/**
 * Un écart de déficit en points de PIB, signé, arrondi vers l'extérieur comme les autres fourchettes (« −0,36 à −0,44
 * point ») ; un écart sous le centième se dit, plutôt que d'écrire un zéro signé
 */
function points(r: Range): string {
  const big = Math.max(Math.abs(r.lo), Math.abs(r.hi))
  if (big < 0.005) return `moins de 0,01${NB}point`
  const sign = (r.lo + r.hi) / 2 < 0 ? MINUS : '+'
  const f = (x: number) => x.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const small = Math.min(Math.abs(r.lo), Math.abs(r.hi))
  const a = Math.floor(small * 100 + 1e-9) / 100
  const b = Math.ceil(big * 100 - 1e-9) / 100
  const word = b >= 2 ? 'points' : 'point'
  return a === b || r.lo * r.hi < 0 ? `${sign}${f(b)}${NB}${word}` : `${sign}${f(a)} à ${sign}${f(b)}${NB}${word}`
}

export function Waterfall({ base, levers, settings, goal }: { base: Baseline; levers: readonly Lever[]; settings: Settings; goal: number | null }) {
  const steps = fallSteps(levers, settings)
  if (!steps.length) return null
  const toPts = (md: number) => (md / base.gdp) * 100
  // Le trajet, en points de PIB : chaque pas déplace la fourchette cumulée
  let cum: Range = { lo: base.deficitPct, hi: base.deficitPct }
  const rows = steps.map(s => {
    const delta: Range = { lo: -toPts(s.effect.hi), hi: -toPts(s.effect.lo) }
    const from = (cum.lo + cum.hi) / 2
    cum = { lo: cum.lo + delta.lo, hi: cum.hi + delta.hi }
    const to = (cum.lo + cum.hi) / 2
    // Le montant dans le sens des mots de la rangée : des recettes ou des dépenses, sans signe
    const amount = { lo: Math.min(Math.abs(s.effect.lo), Math.abs(s.effect.hi)), hi: Math.max(Math.abs(s.effect.lo), Math.abs(s.effect.hi)) }
    return { s, delta, from, to, amount }
  })
  const end = cum
  const effect = steps.reduce((a, s) => ({ lo: a.lo + s.effect.lo, hi: a.hi + s.effect.hi }), { lo: 0, hi: 0 })
  // L'échelle : le trajet et l'objectif, avec un peu d'air ; jamais sous 0
  const values = [base.deficitPct, end.lo, end.hi, ...rows.flatMap(r => [r.from, r.to]), ...(goal === null ? [] : [goal])]
  const span = Math.max(...values) - Math.min(...values)
  const pad = Math.max(0.05, span * 0.08)
  // Un début rond (au dixième), dit sous le graphique ; sous 0 si le résultat est un excédent, avec la marque du zéro
  const lo = Math.floor((Math.min(...values, ...(Math.min(...values) < 0 ? [0] : [])) - pad) * 10) / 10
  const hi = Math.max(...values) + pad
  const x = (v: number) => ((v - lo) / (hi - lo)) * 100
  const anchor = Math.max(lo, 0)
  const span2 = (a: number, b: number) => ({ left: `${x(Math.min(a, b))}%`, width: `${Math.max(0, Math.abs(x(b) - x(a)))}%` })
  const goalMark = (
    <>
      {lo < 0 ? <span class="cpt-fall-zero" style={{ left: `${x(0)}%` }} /> : null}
      {goal === null ? null : <span class="cpt-fall-goal" style={{ left: `${x(goal)}%` }} />}
    </>
  )
  // Le résultat : en plein de l'ancre (0 ou le début de l'échelle) jusqu'à la fourchette, la fourchette hachurée
  const solid = end.lo >= anchor ? span2(anchor, end.lo) : end.hi <= anchor ? span2(end.hi, anchor) : null

  return (
    <section class="cpt-fall" aria-labelledby="cascade">
      <h2 id="cascade">{COPY.fallTitle}</h2>
      <ol class="cpt-fall-rows">
        <li class="cpt-fall-row is-total">
          <span class="cpt-fall-name">{COPY.fallStart}</span>
          <span class="cpt-fall-val cpt-num">{pctOne(base.deficitPct)}</span>
          <span class="cpt-fall-track" aria-hidden="true">
            {goalMark}
            <span class="cpt-fall-bar is-plf" style={span2(anchor, base.deficitPct)} />
          </span>
        </li>
        {rows.map(r => (
          <li class="cpt-fall-row" key={`${r.s.family}-${r.s.lowers}`}>
            <span class="cpt-fall-name">{COPY.fallStep(r.s.family, r.s.lowers)}</span>
            <span class="cpt-fall-val cpt-num">
              {md(r.amount)} · {points(r.delta)}
            </span>
            <span class="cpt-fall-track" aria-hidden="true">
              {goalMark}
              <span class="cpt-fall-bar is-step" style={{ left: `${x(Math.min(r.from, r.to))}%`, width: `${Math.abs(x(r.to) - x(r.from))}%` }} />
            </span>
          </li>
        ))}
        <li class="cpt-fall-row is-total is-end">
          <span class="cpt-fall-name">{COPY.fallEnd}</span>
          <span class="cpt-fall-val cpt-num">{pct(end, deficitDecimals(base, effect))}</span>
          <span class="cpt-fall-track" aria-hidden="true">
            {goalMark}
            {solid ? <span class="cpt-fall-bar is-end" style={solid} /> : null}
            <span class="cpt-fall-bar is-range" style={span2(end.lo, end.hi)} />
          </span>
        </li>
      </ol>
      <p class="cpt-limits">
        {COPY.fallNote}
        {goal !== null ? ` Le trait en tirets marque votre objectif (${pctOne(goal, goal % 1 ? 1 : 0)}).` : ''}
        {lo > 0 ? ` L’échelle commence à ${pctOne(lo, 1)}, pour que les petits pas se voient.` : lo < 0 ? ' Le trait plein marque 0\u202f% : à gauche, un excédent.' : ''}
      </p>
    </section>
  )
}
