// Les rayons : une rangée par famille, qui défile de côté ; les 3 plus gros leviers d'abord (règle du 18/10/2026), puis
// une fiche qui mène aux autres. Une fiche réglée prend le bleu bille, le stylo de la personne : son filet et sa valeur.
// Les pastels des fiches suivent l'ordre du drapé selon la place, sans aucun sens.
import { changeLabel, COPY, md, mdPublished, settingLabel } from '../../core/budget/copy'
import { familyChange, familyOrder, isBase, leverChange, topOfFamily, type Settings } from '../../core/budget/ledger'
import type { Family, Lever } from '../../core/budget/types'
import { AiLabel } from '../components/AiLabel'
import { Icon } from '../components/Icon'
import { link } from '../nav'

export const FAMILIES: Family[] = ['impots', 'depenses', 'sociale']

/**
 * Le pastel d'un levier : sa place dans l'ordre des rayons, la même sur sa fiche de rayon, dans la grille de sa famille et
 * sur sa carte ouverte (la fiche touchée devient la carte). Les pastels ne disent rien du levier.
 */
export function tintOf(levers: readonly Lever[], lever: Lever): number {
  return (FAMILIES.indexOf(lever.family) * 3 + familyOrder(levers, lever.family).indexOf(lever)) % 4
}

/** Le réglage d'une fiche, en clair : « +1 point », « 62 ans » */
export function valueText(lever: Lever, value: Settings[string] | undefined): string {
  if (isBase(lever, value)) return COPY.unchanged
  if (lever.kind === 'options') return lever.options?.find(o => o.id === value)?.label ?? COPY.unchanged
  return settingLabel(lever, value as number)
}

/** Le premier cran au-dessus du PLF : l'unité qui parle (« 10 % » d'une enveloppe plutôt que « 1 % ») */
export const firstNotch = (lever: Lever) => lever.notches.filter(n => n > 0).sort((a, b) => a - b)[0] ?? lever.step

/**
 * Ce que vaut un cran, sur la fiche : « 1 point = 11,0 à 13,7 Md€ », « 3,6 Md€ en 2027 · 10 % = 0,37 Md€ ». Le montant
 * compté vient du PLF, du PLFSS ou d'une prévision (CCSS, Unédic) : la fiche ouverte dit lequel
 */
export function unitText(lever: Lever): string {
  if (lever.kind === 'options') return lever.today
  if (lever.amount || lever.perUnit.hi < 0.1) {
    const n = firstNotch(lever)
    const one = `${settingLabel(lever, n).replace(/^\+/, '')} = ${md({ lo: n * lever.perUnit.lo, hi: n * lever.perUnit.hi })}`
    return lever.amount ? `${mdPublished({ lo: lever.amount.lo ?? lever.amount.value, hi: lever.amount.value })} en 2027 · ${one}` : one
  }
  return `${lever.unit.label} = ${md(lever.perUnit)}`
}

export function Tile({ lever, tint, settings, open }: { lever: Lever; tint: number; settings: Settings; open?: boolean }) {
  const value = settings[lever.id]
  const set = !isBase(lever, value)
  return (
    <li class={['cpt-tile', `tint-${tint}`, set ? 'is-set' : '', open ? 'is-open' : ''].filter(Boolean).join(' ')}>
      <a class="cpt-tile-btn" href={link(`/comptes/${lever.id}`)} aria-current={open ? 'true' : undefined}>
        <span class="cpt-tile-name">{lever.label}</span>
        <span class="cpt-tile-unit cpt-num">{unitText(lever)}</span>
        <span class="cpt-tile-state">
          {set ? (
            <>
              <b>{valueText(lever, value)}</b>
              {changeLabel(lever, leverChange(lever, value))}
            </>
          ) : (
            COPY.unchanged
          )}
        </span>
      </a>
    </li>
  )
}

/** Le total d'une famille, en recettes (impôts) ou en dépenses (les deux autres) */
export function familyTotal(levers: readonly Lever[], settings: Settings, family: Family) {
  const any = levers.some(l => l.family === family && !isBase(l, settings[l.id]))
  if (!any) return <span class="cpt-rail-total">{COPY.railNothing}</span>
  const r = familyChange(levers, settings, family)
  return <span class="cpt-rail-total is-set">{`${md(r, { sign: true })} de ${family === 'impots' ? 'recettes' : 'dépenses'}`}</span>
}

export function Rails({ levers, settings, open }: { levers: readonly Lever[]; settings: Settings; open?: string }) {
  return (
    <>
      {FAMILIES.map(f => {
        const all = familyOrder(levers, f)
        const top = topOfFamily(levers, f)
        // La fiche ouverte reste visible dans son rayon même hors des 3 premiers
        const extra = open && !top.some(l => l.id === open) ? all.filter(l => l.id === open) : []
        const shown = [...top, ...extra]
        return (
          <section class="cpt-rail" aria-labelledby={`rayon-${f}`} key={f}>
            <div class="cpt-rail-head">
              <h2 class="cpt-rail-title" id={`rayon-${f}`}>
                {COPY.families[f]}
              </h2>
              {familyTotal(levers, settings, f)}
              <p class="cpt-rail-note cpt-num">
                {COPY.railNote(all.length)}
                <span class="cpt-swipe">{COPY.railSwipe}</span>
              </p>
            </div>
            <ul class="cpt-row">
              {shown.map(l => (
                <Tile key={l.id} lever={l} tint={tintOf(levers, l)} settings={settings} open={l.id === open} />
              ))}
              <li class="cpt-tile cpt-tile-more">
                <a class="cpt-tile-btn" href={link(`/comptes/${f}`)}>
                  <span class="cpt-tile-name">{COPY.others(all.length - top.length)}</span>
                  <Icon name="arrow-right" />
                </a>
              </li>
            </ul>
          </section>
        )
      })}
    </>
  )
}

/** Tous les leviers d'une famille, de la plus grosse ligne du budget à la plus petite (familyOrder) */
export function FamilyGrid({ levers, settings, family }: { levers: readonly Lever[]; settings: Settings; family: Family }) {
  const all = familyOrder(levers, family)
  return (
    <div class="cpt-family">
      <a class="btn-text cpt-back" href={link('/comptes')}>
        <Icon name="chevron-left" />
        {COPY.allRails}
      </a>
      <h1 class="display is-medium" tabIndex={-1}>
        {COPY.families[family]}
      </h1>
      <p class="lede">{COPY.familyLede(all.length)}</p>
      <AiLabel kind="chiffrages" class="cpt-rails-ai" />
      <ul class="cpt-grid">
        {all.map(l => (
          <Tile key={l.id} lever={l} tint={tintOf(levers, l)} settings={settings} />
        ))}
      </ul>
    </div>
  )
}
