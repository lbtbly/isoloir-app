// « Faire les comptes » (#/comptes) : un budget 2027 à régler, levier par levier, décisions du propriétaire des 17 et
// 18 octobre 2026 (research/presidentielle-2027/budget-decisions.json). Ses réglages sont gardés sur l'appareil avec
// les réponses, par l'application (onSave), et repris dans le double ; rien n'est envoyé. Les écrans :
// - #/comptes/objectif : l'objectif (ou aucun), au premier passage ;
// - #/comptes : les rayons, une rangée par famille ;
// - #/comptes/<levier> : la fiche d'un levier, à la place des rayons au téléphone, à côté sur grand écran ;
// - #/comptes/<famille> : tous les leviers d'une famille ;
// - #/comptes/budget : « Votre budget 2027 » ;
// - #/comptes/methode : comment c'est calculé.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { COPY, deficitDecimals, GOALS, goalLine, md, pct, verdict, type GoalId } from '../../core/budget/copy'
import { applySetting, clampValue, deficitRange, estimatedShare, familyOrder, goalGap, isBase, totals, type Baseline, type Setting } from '../../core/budget/ledger'
import { presets, readLevers } from '../../core/budget/links'
import type { BudgetData, BudgetSave, Family, Lever, LeverExplainer } from '../../core/budget/types'
import type { Answers, ElectionInfo } from '../../core/types'
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
import { Waterfall } from './Waterfall'

/** Les leviers d'une élection : un fichier à part, chargé avec l'écran (src/elections/<id>/budget.ts, généré) */
const DATA: Record<string, () => Promise<BudgetData>> = {
  'presidentielle-2027': () => import('../../elections/presidentielle-2027/budget').then(m => m.budget),
}

/** « Comprendre » chaque levier : un troisième fichier, chargé à l'ouverture de la première fiche */
const EXPLAIN: Record<string, () => Promise<Record<string, LeverExplainer>>> = {
  'presidentielle-2027': () => import('../../elections/presidentielle-2027/budget-explain').then(m => m.explain),
}

interface Game {
  goalId: GoalId | null
  settings: Record<string, Setting>
  /** Les leviers réglés au moins une fois, dans l'ordre : le récapitulatif garde ceux ramenés au PLF, barrés */
  touched: string[]
  /** Un levier remis au PLF par un autre sur la même base : le nom de l'autre */
  resetBy: Record<string, string>
  /** Les leviers pré-réglés d'après les réponses et pas touchés depuis ; null : le point de départ n'est pas encore choisi */
  preset: string[] | null
  /** Parti du PLF plutôt que des réponses */
  fromPlf: boolean
}

const EMPTY: Game = { goalId: null, settings: {}, touched: [], resetBy: {}, preset: null, fromPlf: false }

/** Les réglages gardés, relus : un levier inconnu ou une valeur hors plage (données mises à jour depuis) sont écartés */
function fromSave(saved: BudgetSave | null, levers?: readonly Lever[]): Game {
  if (!saved) return EMPTY
  const goalId = (GOALS.find(g => g.id === saved.goalId)?.id ?? null) as GoalId | null
  const start = { preset: saved.preset ? [...saved.preset] : saved.fromPlf ? [] : null, fromPlf: !!saved.fromPlf }
  if (!levers) return { goalId, settings: { ...saved.settings }, touched: [...saved.touched], resetBy: {}, ...start }
  const settings: Record<string, Setting> = {}
  for (const [id, v] of Object.entries(saved.settings)) {
    const l = levers.find(x => x.id === id)
    if (!l) continue
    if (l.kind === 'options') {
      if (typeof v === 'string' && l.options?.some(o => o.id === v)) settings[id] = v
    } else if (typeof v === 'number') settings[id] = clampValue(l, v)
  }
  const touched = saved.touched.filter(id => levers.some(l => l.id === id))
  return { goalId, settings, touched, resetBy: {}, ...start, preset: start.preset?.filter(id => id in settings) ?? null }
}

const toSave = (g: Game): BudgetSave | null =>
  g.goalId === null && !Object.keys(g.settings).length && !g.touched.length && g.preset === null && !g.fromPlf
    ? null
    : {
        goalId: g.goalId,
        settings: g.settings as Record<string, number | string>,
        touched: g.touched,
        ...(g.preset ? { preset: g.preset } : {}),
        ...(g.fromPlf ? { fromPlf: true } : {}),
      }

/** Un écran où la fiche s'ouvre à côté des rayons sur grand écran (les rayons, ou un levier) */
const besideRails = (arg: string | undefined, levers: readonly Lever[]) => !arg || levers.some(l => l.id === arg)

interface Props {
  election: ElectionInfo
  arg?: string
  focusOnArrival: boolean
  /** Les réglages gardés sur l'appareil (avec les réponses), ou rien */
  saved: BudgetSave | null
  /** Garder les réglages (null : plus rien à garder) ; appelé à chaque réglage arrêté, pas pendant le glissé */
  onSave: (save: BudgetSave | null) => void
  /** Les réponses aux questions (à jour des révisions), lues sur l'appareil pour relier les leviers */
  answers: Answers
  /** Le texte d'une approche, pour citer la réponse sur la fiche */
  approachText: (id: string) => string | undefined
}

export function Budget({ election, arg, focusOnArrival, saved, onSave, answers, approachText }: Props) {
  const [data, setData] = useState<BudgetData | null>(null)
  const [failed, setFailed] = useState(false)
  const [game, setGameState] = useState<Game>(() => fromSave(saved))
  const [status, setStatus] = useState('')
  const [explain, setExplain] = useState<Record<string, LeverExplainer> | null>(null)
  const [startFrom, setStartFrom] = useState<'answers' | 'plf'>('answers')
  // Ce que les réponses disent des leviers, et les réglages qu'elles donnent
  const readings = useMemo(() => (data ? readLevers(data.levers, data.links ?? [], answers) : {}), [data, answers])
  const fromAnswers = useMemo(() => presets(readings), [readings])
  // Ce que le jeu a gardé en dernier : une autre valeur reçue vient d'ailleurs (un autre onglet, un import) et la remplace
  const lastSent = useRef(JSON.stringify(saved ?? null))
  const setGame = (g: Game, keep = true) => {
    setGameState(g)
    if (!keep) return
    const s = toSave(g)
    lastSent.current = JSON.stringify(s)
    onSave(s)
  }
  useEffect(() => {
    const now = JSON.stringify(saved ?? null)
    if (now === lastSent.current) return
    lastSent.current = now
    setGameState(fromSave(saved, data?.levers))
  }, [saved, data])

  useEffect(() => {
    const load = DATA[election.id]
    if (!load) return setFailed(true)
    load().then(d => {
      // Les réglages gardés, relus contre les leviers de cette version des données
      setGameState(g => fromSave(toSave(g), d.levers))
      setData(d)
    }, () => setFailed(true))
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

  // « Comprendre » : chargé à l'ouverture de la première fiche, puis gardé le temps de la page
  useEffect(() => {
    if (explain || !data || !arg || !data.levers.some(l => l.id === arg)) return
    const load = EXPLAIN[election.id]
    if (!load) return setExplain({})
    load().then(setExplain, () => setExplain({}))
  }, [arg, data, explain, election.id])

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
    // Réglé à la main : il n'est plus « d'après vos réponses » (ni ceux qu'il remet au PLF)
    const preset = game.preset?.filter(x => x !== id && !r.reset.includes(x)) ?? game.preset
    // Gardé quand le réglage s'arrête (le curseur lâché, un cran touché), pas à chaque pas du glissé
    setGame({ ...game, settings: r.settings, touched: [...touched, ...r.reset.filter(x => !touched.includes(x))], resetBy, preset }, commit)
    if (commit) {
      const all = totals(levers, r.settings).all
      setStatus(`${lever.label}\u202f: ${valueText(lever, r.settings[id])}. Déficit 2027\u202f: ${pct(deficitRange(base, all), deficitDecimals(base, all))} du PIB.`)
    }
  }

  /**
   * Un levier encore réglé d'après les réponses : pré-réglé au départ, pas touché depuis, et toujours à la valeur que
   * les réponses d'aujourd'hui donnent (une réponse changée depuis ne le laisse pas marqué)
   */
  const presetNow = (id: string) => {
    const want = fromAnswers[id]
    const have = game.settings[id]
    return !!game.preset?.includes(id) && want !== undefined && (typeof want === 'number' && typeof have === 'number' ? Math.abs(want - have) < 1e-9 : want === have)
  }
  const presetIds = (game.preset ?? []).filter(presetNow)

  /** Les marques d'une fiche : d'après vos réponses, vous avez répondu, réponses partagées, estimation */
  function tagsOf(l: Lever): string[] {
    const r = readings[l.id]
    const tags: string[] = []
    if (presetNow(l.id)) tags.push(COPY.tagPreset)
    else if (r?.split) tags.push(COPY.tagSplit)
    else if (r) tags.push(COPY.tagAnswered)
    if (l.estimate) tags.push(COPY.tagEstimate)
    return tags
  }

  /** Remet au PLF les leviers encore pré-réglés d'après les réponses ; l'annonce le dit, le focus va au titre */
  function clearPresets() {
    const settings = { ...game.settings }
    for (const id of presetIds) delete settings[id]
    setGame({ ...game, settings, preset: [] })
    const all = totals(levers, settings).all
    setStatus(`${COPY.presetCleared(presetIds.length)} Déficit 2027\u202f: ${pct(deficitRange(base, all), deficitDecimals(base, all))} du PIB.`)
    requestAnimationFrame(() => document.querySelector<HTMLElement>('main h1')?.focus())
  }

  // Le point de départ : proposé une fois, quand des réponses se rapportent à des leviers
  const presetCount = Object.keys(fromAnswers).length
  // Proposé une fois, et seulement tant que rien n'est réglé : un départ d'après les réponses n'écrase jamais un réglage
  // fait à la main
  const askStart = game.preset === null && presetCount > 0 && !game.touched.length && !Object.keys(game.settings).length
  function start() {
    if (!askStart) return
    if (startFrom === 'plf') return setGame({ ...game, preset: [], fromPlf: true })
    let settings: Record<string, Setting> = { ...game.settings }
    // Les leviers sur une même base ne sont jamais pré-réglés ensemble (readLevers) : aucun n'en remet un autre au PLF
    for (const l of levers) if (l.id in fromAnswers) settings = applySetting(levers, settings, l.id, fromAnswers[l.id]!).settings
    const set = levers.filter(l => !isBase(l, settings[l.id]) && l.id in fromAnswers).map(l => l.id)
    setGame({ ...game, settings, preset: set, touched: [...game.touched, ...set.filter(id => !game.touched.includes(id))] })
  }

  // ——— L'objectif ———
  if (arg === 'objectif')
    return (
      <Shell bar={<Bar left={{ href: link('/'), label: 'Accueil', icon: 'arrow-left' }} primary={game.goalId ? { href: link('/comptes'), label: COPY.start, onClick: start } : null} disabled={COPY.start} />}>
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
          {askStart ? (
            <fieldset class="cpt-goals cpt-start-from">
              <legend>{COPY.startLegend}</legend>
              <label class="cpt-goal-row">
                <input type="radio" name="depart" checked={startFrom === 'answers'} onChange={() => setStartFrom('answers')} />
                <b>{COPY.startAnswers(presetCount)}</b>
                <span>{COPY.startAnswersLine}</span>
              </label>
              <label class="cpt-goal-row">
                <input type="radio" name="depart" checked={startFrom === 'plf'} onChange={() => setStartFrom('plf')} />
                <b>{COPY.startPlf}</b>
                <span>{COPY.startPlfLine}</span>
              </label>
            </fieldset>
          ) : null}
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

  const estimatedNow = t.estimated.lo !== 0 || t.estimated.hi !== 0
  const band = <Band base={base} effect={t.all} goal={goal} count={t.count} estimated={estimatedNow} />
  const mainBar = <Bar left={{ href: link('/comptes/objectif'), label: COPY.objective, icon: 'chevron-left' }} note={COPY.setCount(t.count)} primary={{ href: link('/comptes/budget'), label: COPY.myBudget }} />

  // ——— Votre budget 2027 ———
  if (arg === 'budget') {
    const d = deficitRange(base, t.all)
    const gap = goalGap(base, t.all, goal)
    return (
      <Shell band={band} bar={<Bar left={{ href: link('/comptes/objectif'), label: COPY.restart, icon: 'chevron-left', onClick: () => setGame(EMPTY) }} primary={{ href: link('/comptes'), label: COPY.backToLevers }} />}>
        <div class="cpt-recap">
          <h1 class="display is-medium" tabIndex={-1}>
            {COPY.recapTitle}
          </h1>
          <p class="cpt-verdict">{verdict(base, d, gap.state, gap.missing, goal, t.all, estimatedNow)}</p>
          {(() => {
            const share = estimatedShare(levers, game.settings)
            return share.hi > 0 ? <p class="cpt-limits">{COPY.estimatedPart(md(t.all, { sign: true }), md(share))}</p> : null
          })()}
          <Waterfall base={base} levers={levers} settings={game.settings} goal={goal} />
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
        <FamilyGrid levers={levers} settings={game.settings} family={arg as Family} tagsOf={tagsOf} />
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
          {presetIds.length ? (
            <p class="cpt-preset-note">
              {COPY.presetNote(presetIds.length)} ·{' '}
              <button type="button" class="btn-text" onClick={clearPresets}>
                {COPY.presetClear}
              </button>
            </p>
          ) : null}
          <Rails levers={levers} settings={game.settings} open={open?.id} tagsOf={tagsOf} />
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
                reading={readings[open.id]}
                fromAnswers={presetNow(open.id)}
                sameBase={(readings[open.id]?.sameBase ?? []).map(id => levers.find(l => l.id === id)?.label ?? id)}
                approachText={approachText}
                explainer={explain ? (explain[open.id] ?? null) : undefined}
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
