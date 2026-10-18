// La fiche d'un levier : ce qu'il est aujourd'hui, ce que vaut une unité, les crans en boutons et le curseur au pas fin,
// l'effet du réglage (en bleu bille), ce que le chiffre ne compte pas, et les sources. Toucher à nouveau le cran choisi
// ne change rien : « Revenir au PLF » remet le levier au départ.
import { useRef } from 'preact/hooks'
import { changeLabel, COPY, deficitPoints, md, MINUS, settingLabel } from '../../core/budget/copy'
import { balanceEffect, isBase, leverChange, type Baseline, type Setting } from '../../core/budget/ledger'
import type { Lever } from '../../core/budget/types'
import { AiLabel } from '../components/AiLabel'
import { firstNotch } from './Rails'
import { ExternalLink } from '../components/ExternalLink'
import { Icon } from '../components/Icon'
import { link } from '../nav'

interface Props {
  lever: Lever
  value: Setting | undefined
  base: Baseline
  /** Les leviers déjà réglés sur la même base, qui seraient remis au PLF */
  overlapping: Lever[]
  /** Les leviers déjà réglés qui le recoupent en partie : ils restent réglés, la fiche prévient */
  partly: Lever[]
  /** Le levier remis au PLF par un autre réglé ensuite, s'il y en a un */
  resetBy?: string
  onSet: (value: Setting, commit: boolean) => void
  /** Le pastel de sa fiche dans les rayons : la fiche touchée devient la carte */
  tint: number
}

/** Le libellé d'un cran : l'unité courte aux deux bouts seulement (« −1 pt », « −0,5 », « 20 % », « +0,5 », « +1 pt ») */
function notchLabel(lever: Lever, v: number, i: number, n: number): string {
  if (Math.abs(v) < 1e-9) return lever.baseLabel
  const full = settingLabel(lever, v)
  // Aux deux bouts, l'unité courte du point ou du pourcentage ; les autres unités (emplois, places…) sont dites sous le
  // curseur : dans un bouton, le nombre seul
  if ((i === 0 || i === n - 1) && /point|%/.test(full)) return full.replace(/ points?( de PIB)?$/, '\u00a0pt')
  // Au milieu, le nombre seul (les milliers gardent leur espace : « −5 000 »)
  return (/^[+\u2212-]?[\d\u202f\u00a0,]+/.exec(full)?.[0] ?? full).trim()
}

export function LeverCard({ lever, value, base, overlapping, partly, resetBy, onSet, tint }: Props) {
  const steps = useRef<HTMLDivElement>(null)
  const set = !isBase(lever, value)
  const change = leverChange(lever, value)
  const effect = balanceEffect(lever, value)
  const v = typeof value === 'number' ? value : 0
  // Le trajet du curseur depuis le PLF, au bleu bille
  const at = (x: number) => ((x + lever.max) / (2 * lever.max)) * 100
  const from = Math.min(at(0), at(v))
  const to = Math.max(at(0), at(v))

  return (
    <article class={`cpt-card tint-${tint}`} aria-labelledby="fiche-titre">
      {/* Toujours un h1 : à chaque écran, le focus va au titre de la page (main h1), ici celui de la carte ouverte, à côté
          des rayons sur grand écran comme à leur place au téléphone */}
      <h1 class="cpt-card-title" id="fiche-titre" tabIndex={-1}>
        {lever.label}
      </h1>
      {/* L'étiquette en tête de la fiche, qu'elle signale : au téléphone, la carte est un écran à elle, à une adresse directe */}
      <AiLabel kind="chiffrages" more="lien" class="cpt-card-ai" />
      <p class="cpt-today">
        {COPY.today}
        {'\u202f: '}
        {lever.today}
      </p>
      {lever.kind === 'linear' ? (
        <p class="cpt-unit">
          {lever.amount ? `${lever.amount.label}. ` : null}
          {lever.amount
            ? `${settingLabel(lever, firstNotch(lever)).replace(/^\+/, '')}\u202f: `
            : lever.perUnit.hi < 0.1
              ? `${settingLabel(lever, firstNotch(lever)).replace(/^\+/, '')} (${lever.unit.label})\u202f: `
              : COPY.perUnit(lever)}
          <b class="cpt-num">{md(lever.amount || lever.perUnit.hi < 0.1 ? { lo: firstNotch(lever) * lever.perUnit.lo, hi: firstNotch(lever) * lever.perUnit.hi } : lever.perUnit)}</b> de{' '}
          {lever.direction === 'recette' ? 'recettes' : 'dépenses'} en 2027.
        </p>
      ) : null}

      {overlapping.length ? (
        <p class="cpt-limits">
          Régler ce levier remettra au PLF {overlapping.map(o => `«\u202f${o.label}\u202f»`).join(', ')}, qui porte{overlapping.length > 1 ? 'nt' : ''} sur la
          même base.
        </p>
      ) : null}
      {resetBy ? <p class="cpt-limits">{COPY.resetBy(resetBy)}.</p> : null}
      {partly.length ? <p class="cpt-limits">{COPY.partly(partly.map(o => o.label))}</p> : null}

      <div class="cpt-control">
        {lever.kind === 'linear' ? (
          <>
            <div class="cpt-steps" ref={steps} role="group" aria-label={COPY.steps} style={{ gridTemplateColumns: `repeat(${lever.notches.length}, minmax(0, 1fr))` }}>
              {lever.notches.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  class={n === 0 ? 'is-base' : undefined}
                  aria-pressed={Math.abs(v - n) < 1e-9}
                  aria-label={n === 0 ? `${lever.baseLabel}, réglage du PLF` : settingLabel(lever, n)}
                  onClick={() => onSet(n, true)}
                >
                  {notchLabel(lever, n, i, lever.notches.length)}
                </button>
              ))}
            </div>
            <div class="cpt-fine">
              <div class="cpt-fine-head">
                <label for={`fin-${lever.id}`}>{COPY.fine(lever)}</label>
                <output for={`fin-${lever.id}`} class="cpt-num">
                  {set ? settingLabel(lever, v) : lever.baseLabel}
                </output>
              </div>
              <input
                id={`fin-${lever.id}`}
                class="cpt-range"
                type="range"
                min={-lever.max}
                max={lever.max}
                step={lever.step}
                value={v}
                style={{ '--from': `${from}%`, '--to': `${to}%` }}
                aria-valuetext={set ? `${settingLabel(lever, v)}, ${changeLabel(lever, change)}` : `${lever.baseLabel}, réglage du PLF`}
                onInput={e => onSet(Number((e.target as HTMLInputElement).value), false)}
                onChange={e => onSet(Number((e.target as HTMLInputElement).value), true)}
              />
              <div class="cpt-range-scale cpt-num" aria-hidden="true">
                <span>{settingLabel(lever, -lever.max)}</span>
                <span>{lever.baseLabel}</span>
                <span>{settingLabel(lever, lever.max)}</span>
              </div>
            </div>
          </>
        ) : (
          <div class="cpt-steps cpt-options" ref={steps} role="group" aria-label={COPY.steps}>
            {(lever.options ?? []).map(o => (
              <button key={o.id} type="button" class={o.base ? 'is-base' : undefined} aria-pressed={value === o.id || (!set && !!o.base)} onClick={() => onSet(o.id, true)}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div class="cpt-effect" aria-live="off">
        <span class="cpt-label">{COPY.yourSetting}</span>
        <span class="cpt-effect-fig">{set ? changeLabel(lever, change).replace(/ de (recettes|dépenses)$/, '') : '0\u202fMd€'}</span>
        <p>{set ? `de ${lever.direction === 'recette' ? 'recettes' : 'dépenses'} en 2027\u202f: ${deficitPoints(effect, base)}.` : 'Réglage du PLF\u202f: aucun effet.'}</p>
        {set ? (
          <button
            type="button"
            class="btn-text cpt-reset"
            onClick={() => {
              onSet(lever.kind === 'options' ? (lever.options?.find(o => o.base)?.id ?? 0) : 0, true)
              // Le bouton disparaît avec le réglage : le focus passe au cran du PLF, plutôt que de tomber sur la page
              requestAnimationFrame(() => steps.current?.querySelector<HTMLButtonElement>('.is-base')?.focus())
            }}
          >
            {COPY.backToPlf}
          </button>
        ) : null}
      </div>

      <p class="cpt-limits">
        <b>{COPY.limits}{'\u202f: '}</b>
        {lever.limits}
      </p>
      {lever.operatorCaveat ? <p class="cpt-limits">{COPY.operator}</p> : null}
      {lever.laterNote ? (
        <p class="cpt-limits">
          <b>{COPY.later}{'\u202f: '}</b>
          {lever.laterNote}
        </p>
      ) : null}
      {lever.base ? (
        <p class="cpt-limits">
          <b>{COPY.line}{'\u202f: '}</b>
          {lever.base.label} (<ExternalLink href={lever.base.source.url}>{lever.base.source.publisher}</ExternalLink>)
        </p>
      ) : null}
      <ul class="cpt-sources" aria-label={COPY.sources}>
        {lever.sources.map(s => (
          <li key={s.url}>
            <ExternalLink href={s.url}>{s.title}</ExternalLink>
            <span>
              {s.publisher}, {s.date.slice(0, 4)} · {s.figure.replace(/-(?=\d)/g, MINUS)} · {COPY.consulted(s.accessedAt)}
            </span>
          </li>
        ))}
      </ul>
      <p class="cpt-howto">
        <a class="btn-text" href={link('/comptes/methode')}>
          <Icon name="info" />
          {COPY.howTitle}
        </a>
      </p>
    </article>
  )
}
