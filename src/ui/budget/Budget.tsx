// « Faire les comptes » (#/comptes) : un budget 2027 à régler, levier par levier, décisions du propriétaire des 17 et
// 18 octobre 2026 (research/presidentielle-2027/budget-decisions.json). Le jeu ne lit pas la feuille de réponses ; ses
// réglages vivent en mémoire le temps de la page, rien n'est gardé ni envoyé. Les écrans :
// - #/comptes/objectif : l'objectif (ou aucun), au premier passage ;
// - #/comptes : les rayons, une rangée par famille ;
// - #/comptes/<levier> : la fiche d'un levier, à la place des rayons au téléphone, à côté sur grand écran ;
// - #/comptes/<famille> : tous les leviers d'une famille ;
// - #/comptes/budget : « Votre budget 2027 » ;
// - #/comptes/methode : comment c'est calculé.
import { useEffect, useRef, useState } from 'preact/hooks'
import { COPY, GOALS, goalLine, md, pct, verdict, type GoalId } from '../../core/budget/copy'
import { applySetting, deficitRange, familyOrder, goalGap, isBase, totals, type Baseline, type Setting } from '../../core/budget/ledger'
import type { BudgetData, Family, Lever } from '../../core/budget/types'
import type { ElectionInfo } from '../../core/types'
import '../../styles/budget.css'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { link, replace } from '../nav'
import { Band } from './Band'
import { LeverCard } from './LeverCard'
import { FAMILIES, familyTotal, FamilyGrid, Rails, tintOf, valueText } from './Rails'
import { Method } from './Method'

/** Les leviers d'une élection : un fichier à part, chargé avec l'écran (src/elections/<id>/budget.ts, généré) */
const DATA: Record<string, () => Promise<BudgetData>> = {
  'presidentielle-2027': () => import('../../elections/presidentielle-2027/budget').then(m => m.budget),
}

interface Game {
  goalId: GoalId | null
  settings: Record<string, Setting>
  /** Les leviers réglés au moins une fois, dans l'ordre : le récapitulatif garde ceux ramenés au PLF, barrés */
  touched: string[]
  /** Un levier remis au PLF par un autre sur la même base : le nom de l'autre */
  resetBy: Record<string, string>
}

// En mémoire, le temps de la page : les écrans du jeu se succèdent sans rien perdre ; recharger la page efface tout
let memory: Game = { goalId: null, settings: {}, touched: [], resetBy: {} }

/** Un écran où la fiche s'ouvre à côté des rayons sur grand écran (les rayons, ou un levier) */
const besideRails = (arg: string | undefined, levers: readonly Lever[]) => !arg || levers.some(l => l.id === arg)

export function Budget({ election, arg, focusOnArrival }: { election: ElectionInfo; arg?: string; focusOnArrival: boolean }) {
  const [data, setData] = useState<BudgetData | null>(null)
  const [failed, setFailed] = useState(false)
  const [game, setGameState] = useState<Game>(memory)
  const [status, setStatus] = useState('')
  const setGame = (g: Game) => {
    memory = g
    setGameState(g)
  }

  useEffect(() => {
    const load = DATA[election.id]
    if (!load) return setFailed(true)
    load().then(setData, () => setFailed(true))
  }, [election.id])

  // Premier passage sans objectif : l'écran de l'objectif d'abord, à la place de l'adresse demandée (sans entrée
  // d'historique : le retour arrière ne ramène pas à une redirection)
  useEffect(() => {
    if (data && game.goalId === null && arg !== 'objectif' && arg !== 'methode') replace('/comptes/objectif')
  }, [data, game.goalId, arg])

  // L'annonce d'un réglage ne survit pas à l'écran : sans quoi elle serait relue au retour, même périmée
  useEffect(() => setStatus(''), [arg])

  // À chaque écran du jeu, le focus va au titre ; la page remonte en haut, sauf sur grand écran d'un levier à l'autre
  // (la fiche s'ouvre à côté des rayons, qui gardent leur place). L'application ne le fait pas : pour elle, tout le jeu
  // est un seul écran (#/comptes/…). À l'arrivée, seulement si l'on vient d'un lien, comme les autres écrans
  const lastArg = useRef<string | undefined | null>(null)
  useEffect(() => {
    if (!data) return
    const prev = lastArg.current
    lastArg.current = arg
    if (prev === null && !focusOnArrival) return
    const wide = typeof matchMedia !== 'undefined' && matchMedia('(min-width: 64rem)').matches
    if (!(wide && prev !== null && besideRails(prev, data.levers) && besideRails(arg, data.levers))) window.scrollTo(0, 0)
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [arg, data])

  if (failed) return <Shell bar={null}>{<p class="cpt-start">Les leviers de cette élection ne se chargent pas.</p>}</Shell>
  if (!data) return <Shell bar={null}>{<p class="cpt-start">{COPY.loading}…</p>}</Shell>

  const base: Baseline = { deficitPct: data.baseline.deficitPct, gdp: data.baseline.gdp }
  const levers = data.levers
  const goal = goalPct(game.goalId, base)
  const t = totals(levers, game.settings)

  function set(id: string, value: Setting, commit: boolean) {
    const r = applySetting(levers, game.settings, id, value)
    const resetBy = { ...game.resetBy }
    delete resetBy[id]
    const lever = levers.find(l => l.id === id)!
    for (const other of r.reset) resetBy[other] = lever.label
    const touched = game.touched.includes(id) || isBase(lever, r.settings[id]) ? game.touched : [...game.touched, id]
    setGame({ ...game, settings: r.settings, touched: [...touched, ...r.reset.filter(x => !touched.includes(x))], resetBy })
    if (commit) {
      const d = deficitRange(base, totals(levers, r.settings).all)
      setStatus(`${lever.label}\u202f: ${valueText(lever, r.settings[id])}. Déficit 2027\u202f: ${pct(d)} du PIB.`)
    }
  }

  // ——— L'objectif ———
  if (arg === 'objectif')
    return (
      <Shell bar={<Bar left={{ href: link('/'), label: 'Accueil', icon: 'arrow-left' }} primary={game.goalId ? { href: link('/comptes'), label: COPY.start } : null} disabled={COPY.start} />}>
        <div class="cpt-start">
          <h1 class="display is-medium" tabIndex={-1}>
            {COPY.title}
          </h1>
          <p class="lede">{COPY.lede}</p>
          <AiLabel kind="chiffrages" />
          <p class="cpt-fact">{COPY.fact(base)}</p>
          <fieldset class="cpt-goals">
            <legend>{COPY.goalLegend}</legend>
            {GOALS.map(g => (
              <label class="cpt-goal-row" key={g.id}>
                <input type="radio" name="objectif" checked={game.goalId === g.id} onChange={() => setGame({ ...game, goalId: g.id })} />
                <b>{g.title}</b>
                <span>{goalLine(g.id, base)}</span>
              </label>
            ))}
          </fieldset>
          <ul class="cpt-notes">
            {COPY.notes.map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p class="cpt-limits">
            <a href={link('/comptes/methode')}>{COPY.howTitle}, et d’où viennent l’objectif de 3{'\u202f'}% et les chiffres</a>
          </p>
        </div>
      </Shell>
    )

  if (arg === 'methode')
    return (
      <Shell bar={<Bar left={{ href: link('/comptes'), label: COPY.rails, icon: 'chevron-left' }} primary={null} />}>
        <Method data={data} />
      </Shell>
    )

  const band = <Band base={base} effect={t.all} goal={goal} count={t.count} />
  const mainBar = <Bar left={{ href: link('/comptes/objectif'), label: COPY.objective, icon: 'chevron-left' }} note={COPY.setCount(t.count)} primary={{ href: link('/comptes/budget'), label: COPY.myBudget }} />

  // ——— Votre budget 2027 ———
  if (arg === 'budget') {
    const d = deficitRange(base, t.all)
    const gap = goalGap(base, t.all, goal)
    return (
      <Shell band={band} bar={<Bar left={{ href: link('/comptes/objectif'), label: COPY.restart, icon: 'chevron-left', onClick: () => setGame({ goalId: null, settings: {}, touched: [], resetBy: {} }) }} primary={{ href: link('/comptes'), label: COPY.backToLevers }} />}>
        <div class="cpt-recap">
          <h1 class="display is-medium" tabIndex={-1}>
            {COPY.recapTitle}
          </h1>
          <p class="cpt-verdict">{verdict(base, d, gap.state, gap.missing, goal)}</p>
          <AiLabel kind="chiffrages" more="lien" />
          <h2>{COPY.yourSettings}</h2>
          <Recap levers={levers} game={game} />
          <h2>{COPY.notCounted}</h2>
          <ul class="cpt-list">
            {COPY.notCountedList.map(n => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p class="cpt-limits">
            <a href={link('/comptes/methode')}>{COPY.howTitle}, et d’où viennent les chiffres</a>
          </p>
        </div>
      </Shell>
    )
  }

  // ——— Une famille entière ———
  if (arg && (FAMILIES as string[]).includes(arg))
    return (
      <Shell band={band} bar={<Bar left={{ href: link('/comptes'), label: COPY.rails, icon: 'chevron-left' }} primary={{ href: link('/comptes/budget'), label: COPY.myBudget }} />}>
        <FamilyGrid levers={levers} settings={game.settings} family={arg as Family} />
      </Shell>
    )

  // ——— Les rayons, et la fiche ouverte ———
  const open = arg ? levers.find(l => l.id === arg) : undefined
  const order = open ? familyOrder(levers, open.family) : []
  const at = open ? order.findIndex(l => l.id === open.id) : -1
  const prev = at > 0 ? order[at - 1] : undefined
  const next = at >= 0 && at < order.length - 1 ? order[at + 1] : undefined
  const bar = open ? (
    <Bar
      left={prev ? { href: link(`/comptes/${prev.id}`), label: COPY.previous, icon: 'chevron-left' } : { href: link('/comptes'), label: COPY.rails, icon: 'chevron-left' }}
      note={`${at + 1} sur ${order.length}`}
      primary={next ? { href: link(`/comptes/${next.id}`), label: COPY.next } : { href: link('/comptes/budget'), label: COPY.myBudget }}
    />
  ) : (
    mainBar
  )
  return (
    <Shell band={band} bar={bar} status={status}>
      <div class={open ? 'cpt-split has-open' : 'cpt-split'}>
        <div class="cpt-work">
          {open ? null : (
            <h1 class="sr-only" tabIndex={-1}>
              {COPY.title}
            </h1>
          )}
          <AiLabel kind="chiffrages" class="cpt-rails-ai" />
          <Rails levers={levers} settings={game.settings} open={open?.id} />
        </div>
        <aside class="cpt-panel" aria-label={open ? 'Le levier ouvert' : 'Vos réglages et ce que le calcul ne compte pas'}>
          {open ? (
            <>
              <div class="cpt-panel-head">
                <a class="btn-text cpt-back" href={link('/comptes')}>
                  <Icon name="chevron-left" />
                  {COPY.families[open.family]}
                </a>
                {/* Le total de la famille bouge avec le curseur, au téléphone aussi (la moitié de la signature) */}
                {familyTotal(levers, game.settings, open.family)}
              </div>
              <LeverCard
                lever={open}
                value={game.settings[open.id]}
                base={base}
                overlapping={open.exclusiveWith.map(id => levers.find(l => l.id === id)!).filter(o => o && !isBase(o, game.settings[o.id]))}
                partly={(open.overlapsWith ?? []).map(id => levers.find(l => l.id === id)!).filter(o => o && !isBase(o, game.settings[o.id]))}
                resetBy={isBase(open, game.settings[open.id]) ? game.resetBy[open.id] : undefined}
                onSet={(v, commit) => set(open.id, v, commit)}
                tint={tintOf(levers, open)}
              />
            </>
          ) : (
            // Grand écran seulement (au téléphone, les rayons prennent la page) : la colonne sert, avant la première fiche
            // ouverte, à ce que la personne a déjà réglé, puis à ce que le calcul ne compte pas
            <div class="cpt-panel-empty">
              <p>{COPY.panelHint}</p>
              {game.touched.length ? (
                <>
                  <h2>{COPY.yourSettings}</h2>
                  <Recap levers={levers} game={game} />
                </>
              ) : null}
              <h2>{COPY.notCounted}</h2>
              <ul class="cpt-list">
                {COPY.notCountedList.map(n => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <p>
                <a href={link('/comptes/methode')}>{COPY.howTitle}, et d’où viennent les chiffres</a>
              </p>
            </div>
          )}
        </aside>
      </div>
    </Shell>
  )
}

function goalPct(id: GoalId | null, base: Baseline): number | null {
  const g = GOALS.find(x => x.id === id)
  return g ? g.pct(base) : null
}

/** Les réglages, par famille ; un levier ramené au PLF reste écrit, barré : rien ne disparaît */
function Recap({ levers, game }: { levers: readonly Lever[]; game: Game }) {
  const rows = game.touched.map(id => levers.find(l => l.id === id)).filter((l): l is Lever => !!l)
  if (!rows.length) return <p class="cpt-limits">{COPY.nothingSet}</p>
  return (
    <ul class="cpt-lines">
      {FAMILIES.flatMap(f => {
        const mine = rows.filter(l => l.family === f)
        if (!mine.length) return []
        return [
          <li class="fam" key={f}>
            {COPY.families[f]}
          </li>,
          ...mine.map(l => {
            const v = game.settings[l.id]
            const off = isBase(l, v)
            const t = totals([l], game.settings).all
            const change = l.direction === 'recette' ? t : { lo: -t.hi, hi: -t.lo }
            return (
              <li key={l.id} class={off ? 'is-cancelled' : undefined}>
                <span class="name">{l.label}</span>
                <span class="set">{off ? (game.resetBy[l.id] ? COPY.resetBy(game.resetBy[l.id]!) : COPY.cancelled) : valueText(l, v)}</span>
                <span class="amount cpt-num">
                  {off ? '0' : md(change, { sign: true }).replace(/\u202fMd€$/, '')}
                  <small>Md€{off ? '' : l.direction === 'recette' ? ' de recettes' : ' de dépenses'}</small>
                </span>
              </li>
            )
          }),
        ]
      })}
    </ul>
  )
}

interface BarLink {
  href: string
  label: string
  icon?: string
  onClick?: () => void
}

/** La barre du bas : un lien texte à gauche, un compte au milieu, l'action principale à droite (aplat bleu) */
function Bar({ left, note, primary, disabled }: { left: BarLink; note?: string; primary: BarLink | null; disabled?: string }) {
  return (
    <nav class="action-bar" aria-label="Navigation">
      <div class="action-bar-inner">
        <a class="btn-text" href={left.href} onClick={left.onClick}>
          {left.icon ? <Icon name={left.icon} /> : null}
          {left.label}
        </a>
        <span class="bar-note cpt-num">{note}</span>
        {primary ? (
          <a class="btn-primary" href={primary.href} onClick={primary.onClick}>
            {primary.label}
            <Icon name="arrow-right" />
          </a>
        ) : disabled ? (
          <button type="button" class="btn-primary" disabled>
            {disabled}
            <Icon name="arrow-right" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </nav>
  )
}

function Shell({ band, bar, status, children }: { band?: preact.ComponentChildren; bar: preact.ComponentChildren; status?: string; children: preact.ComponentChildren }) {
  // Les hauteurs réelles de la barre du bas et de l'en-tête : l'écran arrive après le chargement, l'application ne
  // les a pas encore mesurées (le pied de page et la fiche collée sous la bande s'y calent), comme « À table »
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>('.action-bar')
    const header = document.querySelector<HTMLElement>('.form-header')
    const root = document.documentElement.style
    if (!bar) root.setProperty('--bar-real', '0px')
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      if (bar?.isConnected) root.setProperty('--bar-real', `${bar.offsetHeight}px`)
      if (header?.isConnected) root.setProperty('--header-real', `${header.offsetHeight}px`)
    })
    if (bar) ro.observe(bar)
    if (header) ro.observe(header)
    return () => ro.disconnect()
  })
  return (
    <div class="screen screen-comptes">
      <FormHeader title={COPY.title} />
      {band}
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <p class="sr-only" role="status">
        {status}
      </p>
      <SiteFooter />
      {bar}
    </div>
  )
}
