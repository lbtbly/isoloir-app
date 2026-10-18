// La bande du déficit : collée sous l'en-tête, elle répond à chaque geste. Le chiffre en fourchette, l'axe (le PLF, le
// drapeau de l'objectif, la fourchette de la personne au bleu bille et son trajet depuis le PLF), puis la phrase.
import { useEffect, useRef } from 'preact/hooks'
import { bandSentence, COPY, goalShort, pct, pctOne } from '../../core/budget/copy'
import { deficitRange, goalGap, type Baseline, type Range } from '../../core/budget/ledger'

interface Props {
  base: Baseline
  effect: Range
  goal: number | null
  /** Leviers réglés : le PLF n'est plus le point montré dès qu'un levier bouge, même si les effets se compensent */
  count: number
}

export function Band({ base, effect, goal, count }: Props) {
  const ref = useRef<HTMLElement>(null)
  // Sa hauteur réelle : la fiche ouverte se colle dessous sur grand écran (budget.css, --band-real)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const root = document.documentElement.style
    const ro = new ResizeObserver(() => root.setProperty('--band-real', `${el.offsetHeight}px`))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const moved = count > 0
  const d = deficitRange(base, effect)
  const gap = goalGap(base, effect, goal)
  // L'axe va de 0 à 6 % du PIB, plus loin si les réglages l'emmènent au-delà
  const min = Math.min(0, Math.floor(d.lo))
  const max = Math.max(6, Math.ceil(d.hi))
  const x = (v: number) => 2 + ((v - min) / (max - min)) * 96
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <section class="cpt-band" ref={ref} aria-label={COPY.bandLabel}>
      <div class="cpt-band-inner">
        <div class="cpt-fig-wrap">
          <span class="cpt-label">{COPY.bandLabel}</span>
          <span class="cpt-fig">
            {moved ? pct(d).replace(/\u202f%$/, '') : pctOne(base.deficitPct).replace(/\u202f%$/, '')}
            <small>{'\u202f%'}</small>
          </span>
        </div>
        <div class="cpt-goal">
          {COPY.goal}
          <b>{goalShort(goal)}</b>
        </div>
        <div class="cpt-axis" aria-hidden="true">
          <span class="cpt-axis-track" />
          {ticks.map(v => (
            <span key={v} class="cpt-axis-mark" style={{ left: `${x(v)}%` }}>
              <span>{v === max ? `${v}\u202f%` : v}</span>
            </span>
          ))}
          {/* Un objectif égal au PLF (« garder le déficit prévu ») : un seul repère, un seul mot */}
          {goal !== null && Math.abs(goal - base.deficitPct) > 1e-9 ? (
            <span class="cpt-axis-mark cpt-axis-goal" style={{ left: `${x(goal)}%` }}>
              <span>{COPY.goalMark(goal)}</span>
            </span>
          ) : null}
          <span class="cpt-axis-mark cpt-axis-plf" style={{ left: `${x(base.deficitPct)}%` }}>
            <span>{goal !== null && Math.abs(goal - base.deficitPct) <= 1e-9 ? `${COPY.plf(base)}, objectif` : COPY.plf(base)}</span>
          </span>
          {moved ? (
            <>
              <span class="cpt-axis-trail" style={trail(x(d.hi), x(d.lo), x(base.deficitPct))} />
              <span class="cpt-axis-you" style={{ left: `${x(d.lo)}%`, width: `${Math.max(0, x(d.hi) - x(d.lo))}%` }} />
            </>
          ) : null}
        </div>
        <p class="cpt-left">
          <Sentence {...bandSentence(gap.state, gap.missing, moved, effect)} />
          {/* Au téléphone, la barre du bas n'a pas la place du compte : il est ici (budget.css) */}
          {/* L'espace hors du compte : la ligne se coupe avant le point, jamais dans « 3 leviers réglés » */}{' '}
          <span class="cpt-band-count cpt-num">· {COPY.setCount(count)}</span>
        </p>
      </div>
    </section>
  )
}

/** La phrase de la bande : le montant, conséquence des réglages de la personne, au bleu bille */
function Sentence({ before, strong, after }: { before: string; strong?: string; after?: string }) {
  return (
    <>
      {before}
      {strong ? <span class="cpt-ink cpt-num">{strong}</span> : null}
      {after}
    </>
  )
}

/** Le trajet en tirets entre le PLF et la fourchette, de quelque côté qu'elle soit */
function trail(hi: number, lo: number, plf: number) {
  if (hi <= plf) return { left: `${hi}%`, width: `${plf - hi}%` }
  return { left: `${plf}%`, width: `${Math.max(0, lo - plf)}%` }
}
