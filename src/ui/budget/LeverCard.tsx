// La fiche d'un levier : ce qu'il est aujourd'hui, ce que vaut une unité, les crans en boutons et le curseur au pas fin,
// l'effet du réglage (en bleu bille), ce que le chiffre ne compte pas, et les sources. Toucher à nouveau le cran choisi
// ne change rien : « Revenir au PLF » remet le levier au départ.
import { useRef } from 'preact/hooks'
import { changeLabel, COPY, deficitPoints, md, MINUS, settingLabel } from '../../core/budget/copy'
import { balanceEffect, beyondSource, estimatedEffect, isBase, leverChange, outerMax, type Baseline, type Setting } from '../../core/budget/ledger'
import type { LeverReading } from '../../core/budget/links'
import type { Lever, LeverExplainer } from '../../core/budget/types'
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
  /** Ce que les réponses de la personne disent de ce levier, s'il est relié à des questions */
  reading?: LeverReading
  /** Le réglage actuel vient des réponses (pré-réglé, pas touché depuis) */
  fromAnswers: boolean
  /** Les leviers sur la même base que les réponses pré-régleraient aussi (aucun ne l'est) */
  sameBase: string[]
  /** Le texte d'une approche, pour citer la réponse */
  approachText: (id: string) => string | undefined
  /** « Comprendre » : chargé à l'ouverture de la fiche ; undefined tant qu'il arrive, null s'il n'y en a pas */
  explainer: LeverExplainer | null | undefined
}

/** Les sources d'une fiche montrées d'emblée, avant le dépliant */
const SHOWN_SOURCES = 2

/** Une source : son titre en lien, l'éditeur, l'année, le chiffre, le jour de la consultation */
function SourceItem({ s }: { s: Lever['sources'][number] }) {
  return (
    <li>
      <ExternalLink href={s.url}>{s.title}</ExternalLink>
      <span>
        {s.publisher}, {s.date.slice(0, 4)} · {s.figure.replace(/-(?=\d)/g, MINUS)} · {COPY.consulted(s.accessedAt)}
      </span>
    </li>
  )
}

/** Le libellé d'un cran : l'unité courte aux deux bouts seulement (« −1 pt », « −0,5 », « 20 % », « +0,5 », « +1 pt ») */
function notchLabel(lever: Lever, v: number, i: number, n: number): string {
  if (Math.abs(v) < 1e-9) return lever.baseLabel
  const full = settingLabel(lever, v)
  // Aux deux bouts, l'unité courte du point ou du pourcentage ; les autres unités (emplois, places…) sont dites sous le
  // curseur : dans un bouton, le nombre seul
  // Sept crans (la plage au-delà de la source) : le nombre seul partout, l'échelle sous le curseur dit l'unité
  if (n <= 5 && (i === 0 || i === n - 1) && /point|%/.test(full)) return full.replace(/ points?( de PIB)?$/, '\u00a0pt')
  // Au milieu, le nombre seul (les milliers gardent leur espace : « −5 000 »)
  return (/^[+\u2212-]?[\d\u202f\u00a0,]+/.exec(full)?.[0] ?? full).trim()
}

export function LeverCard({ lever, value, base, overlapping, partly, resetBy, onSet, tint, reading, fromAnswers, sameBase, approachText, explainer }: Props) {
  const steps = useRef<HTMLDivElement>(null)
  const set = !isBase(lever, value)
  const change = leverChange(lever, value)
  const effect = balanceEffect(lever, value)
  const estimated = estimatedEffect(lever, value)
  const v = typeof value === 'number' ? value : 0
  // La borne du curseur : la plage chiffrée, ou plus loin en estimation ; les crans de la source, et ceux de la borne
  const outer = outerMax(lever)
  const notches = [...new Set([...(outer > lever.max ? [-outer] : []), ...lever.notches, ...(outer > lever.max ? [outer] : [])])].sort((a, b) => a - b)
  // Le trajet du curseur depuis le PLF, au bleu bille
  const at = (x: number) => ((x + outer) / (2 * outer)) * 100
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
      {explainer ? <p class="cpt-what">{explainer.what}</p> : null}
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

      {lever.estimate ? (
        <div class="cpt-estimate">
          <p>
            <b>{COPY.estimateTitle}.</b> {COPY.estimateLine}
          </p>
          <details>
            <summary>{COPY.estimateHow}</summary>
            <p>{lever.estimate.method}</p>
          </details>
        </div>
      ) : null}

      {reading ? (
        <div class="cpt-answers">
          <h2>{COPY.answersTitle}</h2>
          <ul>
            {reading.marks.map(m => (
              <li key={m.approach} class={`stance-${m.stance}`}>
                <b>{COPY.stance[m.stance]}</b>
                {'\u202f: '}«{'\u202f'}
                {approachText(m.approach) ?? m.approach}
                {'\u202f'}» <span class="cpt-towards">({COPY.towards(m.dir, lever)})</span>
              </li>
            ))}
          </ul>
          {reading.split ? (
            <p>{COPY.splitIs}</p>
          ) : sameBase.length ? (
            <p>{COPY.sameBaseIs(sameBase.map(l => `«\u202f${l}\u202f»`).join(', '))}</p>
          ) : fromAnswers && set ? (
            <p>
              {COPY.presetIs(valueLabel(lever, value))}
              {reading.marks.some(m => m.main && m.stance === 'agree') ? ` ${COPY.mainIs}` : ''}
            </p>
          ) : reading.marks.some(m => m.stance === 'agree') && reading.preset === undefined ? (
            <p>{reading.marks.filter(m => m.stance === 'agree').every(m => m.partial) ? COPY.partialIs : COPY.noPresetIs}</p>
          ) : null}
        </div>
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
            <div class={notches.length > 5 ? 'cpt-steps is-wide' : 'cpt-steps'} ref={steps} role="group" aria-label={COPY.steps} style={{ gridTemplateColumns: `repeat(${notches.length}, minmax(0, 1fr))` }}>
              {notches.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  class={[n === 0 ? 'is-base' : '', Math.abs(n) > lever.max + 1e-9 && !lever.estimate ? 'is-beyond' : ''].filter(Boolean).join(' ') || undefined}
                  aria-pressed={Math.abs(v - n) < 1e-9}
                  aria-label={n === 0 ? `${lever.baseLabel}, réglage du PLF` : `${settingLabel(lever, n)}${Math.abs(n) > lever.max + 1e-9 ? ', estimation' : ''}`}
                  onClick={() => onSet(n, true)}
                >
                  {notchLabel(lever, n, i, notches.length)}
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
              <div class="cpt-range-wrap">
                {/* Au-delà de la plage chiffrée : hachuré, c'est une estimation */}
                {outer > lever.max ? (
                  <>
                    <span class="cpt-range-beyond" style={{ left: '0%', width: `${at(-lever.max)}%` }} aria-hidden="true" />
                    <span class="cpt-range-beyond" style={{ left: `${at(lever.max)}%`, right: '0%' }} aria-hidden="true" />
                  </>
                ) : null}
              <input
                id={`fin-${lever.id}`}
                class="cpt-range"
                type="range"
                min={-outer}
                max={outer}
                step={lever.step}
                value={v}
                style={{ '--from': `${from}%`, '--to': `${to}%` }}
                aria-valuetext={set ? `${settingLabel(lever, v)}, ${changeLabel(lever, change)}` : `${lever.baseLabel}, réglage du PLF`}
                onInput={e => onSet(Number((e.target as HTMLInputElement).value), false)}
                onChange={e => onSet(Number((e.target as HTMLInputElement).value), true)}
              />
              </div>
              <div class="cpt-range-scale cpt-num" aria-hidden="true">
                <span>{settingLabel(lever, -outer)}</span>
                <span>{lever.baseLabel}</span>
                <span>{settingLabel(lever, outer)}</span>
              </div>
              {lever.stretch && outer > lever.max ? (
                <p class="cpt-limits">
                  <b>{(lever.estimate ? COPY.beyondEstimate : COPY.beyondLine)(`${settingLabel(lever, -lever.max)} et ${settingLabel(lever, lever.max)}`)}</b> {lever.stretch.why}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div class="cpt-steps cpt-options" ref={steps} role="group" aria-label={COPY.steps}>
            {(lever.options ?? []).map(o => (
              <button key={o.id} type="button" class={[o.base ? 'is-base' : '', o.estimate ? 'is-beyond' : ''].filter(Boolean).join(' ') || undefined} aria-pressed={value === o.id || (!set && !!o.base)} onClick={() => onSet(o.id, true)}>
                {o.label}
                {o.estimate ? <small> · {COPY.tagEstimate}</small> : null}
              </button>
            ))}
          </div>
        )}
      </div>

      <div class="cpt-effect" aria-live="off">
        <span class="cpt-label">{COPY.yourSetting}</span>
        <span class="cpt-effect-fig">{set ? changeLabel(lever, change).replace(/ de (recettes|dépenses)$/, '') : '0\u202fMd€'}</span>
        <p>{set ? `de ${lever.direction === 'recette' ? 'recettes' : 'dépenses'} en 2027\u202f: ${deficitPoints(effect, base)}.` : 'Réglage du PLF\u202f: aucun effet.'}</p>
        {set && (estimated.lo !== 0 || estimated.hi !== 0) && !lever.estimate ? (
          <p class="cpt-limits">{beyondSource(lever, value) ? COPY.beyondNow : (lever.options?.find(o => o.id === value)?.estimate ?? '')}</p>
        ) : null}
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

      {explainer ? (
        <details class="cpt-understand">
          <summary>
            <b>{COPY.understand}</b> · {COPY.understandMore}
          </summary>
          <dl>
            <dt>{COPY.who}</dt>
            <dd>{explainer.who}</dd>
            <dt>{COPY.ifUp}</dt>
            <dd>{explainer.up}</dd>
            <dt>{COPY.ifDown}</dt>
            <dd>{explainer.down}</dd>
            <dt>{COPY.argsUp}</dt>
            <dd>
              <ul>
                {explainer.argsUp.map(a => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </dd>
            <dt>{COPY.argsDown}</dt>
            <dd>
              <ul>
                {explainer.argsDown.map(a => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </dd>
          </dl>
          <ul class="cpt-sources" aria-label={COPY.sources}>
            {explainer.sources.map(s => (
              <li key={s.url}>
                <ExternalLink href={s.url}>{s.title}</ExternalLink>
                <span>
                  {s.publisher}, {s.date.slice(0, 4)} · {COPY.consulted(s.accessedAt)}
                </span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

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
      {/* Les deux premières sources en vue ; au-delà, repliées : une fiche peut en citer une quinzaine */}
      <ul class="cpt-sources" aria-label={COPY.sources}>
        {lever.sources.slice(0, SHOWN_SOURCES).map(s => (
          <SourceItem key={s.url} s={s} />
        ))}
      </ul>
      {lever.sources.length > SHOWN_SOURCES ? (
        <details class="cpt-more-sources">
          <summary>{COPY.moreSources(lever.sources.length - SHOWN_SOURCES)}</summary>
          <ul class="cpt-sources" aria-label={COPY.sources}>
            {lever.sources.slice(SHOWN_SOURCES).map(s => (
              <SourceItem key={s.url} s={s} />
            ))}
          </ul>
        </details>
      ) : null}
      <p class="cpt-howto">
        <a class="btn-text" href={link('/comptes/methode')}>
          <Icon name="info" />
          {COPY.howTitle}
        </a>
      </p>
    </article>
  )
}

/** Le réglage en clair, pour dire ce que les réponses ont posé */
function valueLabel(lever: Lever, value: Setting | undefined): string {
  if (lever.kind === 'options') return lever.options?.find(o => o.id === value)?.label ?? lever.baseLabel
  return typeof value === 'number' ? settingLabel(lever, value) : lever.baseLabel
}
