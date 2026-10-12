// Le graphique « Sujet par sujet » de « Mon profil politique » (ui/screens/Profile.tsx) : une ligne par sujet lu, cinq
// colonnes, les blocs de la grille des nuances du ministère de l'Intérieur, de l'extrême gauche à l'extrême droite,
// avec sous chaque bloc les candidats classés qu'elle y range. Les couleurs sont celles des blocs sur la page des
// candidats (décision du propriétaire du 12 octobre 2026) : l'en-tête de chaque colonne au pastel de son bloc ; sur
// une ligne, ▲ plus près, un aplat dans la teinte soutenue du bloc (des blocs voisins en une barre continue, la couture
// visible entre deux couleurs ; des blocs non voisins en barres séparées, jamais reliées ; de part et d'autre du
// centre, sans lui, leur section à part) ; ▽ plus loin, hachuré dans la teinte du bloc ; · rien de net. La couleur ne
// dit jamais seule la lecture : le glyphe et le mot l'écrivent. Chaque ligne est un bouton qui déplie, sous elle, la
// phrase du site et les candidats des blocs marqués ; une seule ouverte à la fois. Survol et focus mettent l'axe en
// évidence. Au clavier : Tab, Entrée, Espace, flèches haut et bas, Début et Fin. Au téléphone, un rappel des cinq
// blocs reste sous l'en-tête pendant qu'on parcourt les lignes ; en grand écran, l'axe entier y colle.
// Rien n'est recalculé : les lignes rangent la lecture (ui/profile/rows.ts) ; les phrases sont celles du site
// (core/echiquierCopy.ts).

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { Echiquier, UnitReading } from '../../core/echiquier'
import { approvedCarriers, approvedOf, mainCarriers, segments } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import type { SessionState } from '../../core/storage'
import type { Answers, CandidateId, ElectionPack, Spectrum, SpectrumAxisBloc, TopicGroup } from '../../core/types'
import { ExternalLink } from '../components/ExternalLink'
import { Icon } from '../components/Icon'
import { formatDate } from '../format'
import { link } from '../nav'
import { acrossCentre, atBothEnds, chartRows, unitKey } from './rows'

/** La couleur d'un bloc : son pastel sur la page des candidats (election.spectrum.blocs) */
export type Tint = Spectrum['blocs'][number]['pastel']

/** La classe de couleur d'un bloc (profile.css) ; sans couleur connue, l'encre */
export const tintClass = (t: Tint | null | undefined) => (t ? `t-${t}` : 't-encre')

/** Ce que le graphique, ses lignes et le tableau du détail partagent */
export interface ProfileCtx {
  pack: ElectionPack
  axis: readonly SpectrumAxisBloc[]
  /** Libellé de chaque bloc de l'axe, celui de la grille : « Extrême gauche » */
  labels: string[]
  /** Couleur de chaque bloc de l'axe, celle de la page des candidats : rouge à gauche, jaune au centre, bleu à droite */
  tints: (Tint | null)[]
  names: Map<CandidateId, string>
  /** Les candidats de l'axe, par bloc */
  panel: CandidateId[][]
  /** Hors classement pour cette personne (connus sur trop peu de ses réponses) */
  unranked: Set<CandidateId>
  answers: Answers
  state: SessionState
  topicLabel: Map<string, string>
  /** Les familles de thèmes (à défaut, un thème par famille) */
  groups: readonly TopicGroup[]
  /** Candidats non classés de l'élection, présents dans le pack */
  unscored: number
}

/** Une unité qui a une lecture (même « rien de net ») ; sinon : une seule question, ou trop de blocs inconnus */
export const isRead = (u: UnitReading) => u.status !== 'une-question' && u.status !== 'blocs-inconnus'

/**
 * Une seule question : ce que la personne y approuve, et qui le porte en approche principale (vrai par construction) ;
 * les accords sur une approche qui n'est l'approche principale d'aucun candidat classé sont comptés à part
 */
export function oneQuestionFact(unit: UnitReading, ctx: ProfileCtx): string | null {
  if (unit.status !== 'une-question') return null
  const { pack, answers, names, axis } = ctx
  const single = pack.bank.questions.find(q => q.id === unit.questions[0])
  if (!single) return null
  const approved = approvedOf(single, answers[single.id])
  const placed = approved.filter(a => mainCarriers(pack, single.id, a).some(ids => ids.length)).length
  return T.oneQuestion(
    axis,
    approved.length ? approvedCarriers(pack, single, answers[single.id]).map(ids => ids.map(id => names.get(id) ?? id)) : null,
    placed,
    approved.length - placed,
  )
}

/** Un thème qui a encore des questions approfondies à voir */
export const deeperOf = (unit: UnitReading, ctx: ProfileCtx) =>
  unit.kind === 'theme' && ctx.pack.bank.questions.some(q => q.topicId === unit.id && q.tier !== 'essentiel' && !ctx.state.answers[q.id])

/** Le nom de famille, pour les colonnes du téléphone : « Le Pen », « Dupont-Aignan » */
const surname = (name: string) => name.split(' ').slice(1).join(' ') || name

interface Props {
  reading: Echiquier
  ctx: ProfileCtx
  quickOnly: boolean
  /** Ouvre le détail complet d'une unité, dans le tableau replié sous le graphique */
  onDetail: (u: UnitReading) => void
}

export function Chart({ reading, ctx, quickOnly, onDetail }: Props) {
  const { axis, labels, panel, names, groups, topicLabel, tints } = ctx
  // La légende : une case par couleur de l'axe, dans l'ordre (rouge, jaune, bleu)
  const keyTints = tints.filter((t, i) => tints.indexOf(t) === i)
  const groupLabel = useMemo(() => new Map(groups.map(g => [g.id, g.label])), [groups])
  const nameOf = (u: UnitReading) => (u.kind === 'famille' ? (groupLabel.get(u.id) ?? u.id) : (topicLabel.get(u.id) ?? u.id))
  // Les libellés ne changent qu'avec le pack : les familles et la lecture suffisent à refaire le rangement
  const rows = useMemo(() => chartRows(groups, reading, nameOf), [groups, reading])
  const { main, both, apart, flat, unread } = rows
  const nRead = main.length + both.length
  const panelSize = panel.flat().length

  // Une seule ligne ouverte ; le survol ou le focus l'emportent sur elle pour mettre l'axe en évidence
  const [open, setOpen] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [folds, setFolds] = useState<Record<string, boolean>>({})
  const all = [...main, ...both, ...apart, ...flat, ...unread.map(x => x.unit)]
  const hl = all.find(u => unitKey(u) === (hover ?? open))
  const lit = hl && isRead(hl) && hl.near.length + hl.far.length > 0 ? hl : null
  const zoneClass = (b: number) => (lit?.near.includes(b) ? ' is-near' : lit?.far.includes(b) ? ' is-far' : '')
  // « ? » n'entre dans la légende que s'il paraît dans une ligne à l'écran (le pli « sans tendance nette » ouvert compris)
  const shown = [...main, ...both, ...apart, ...(folds['pli-flat'] ? flat : [])]
  const hasUnknown = shown.some(u => u.cells.some(c => c.mark === 'inconnu'))

  const plot = useRef<HTMLDivElement>(null)
  const axisEl = useRef<HTMLDivElement>(null)
  const zones = useRef<HTMLOListElement>(null)
  const rowsEl = useRef<HTMLDivElement>(null)
  const mini = useRef<HTMLDivElement>(null)

  // Le rappel des blocs (téléphone) paraît quand l'axe complet a quitté l'écran, tant que des lignes restent visibles.
  // Ce qui reçoit le focus s'arrête sous l'en-tête et sous l'axe collant ou son rappel, jamais caché (WCAG 2.4.11) :
  // leur hauteur va dans --axis-stick, que lit le scroll-padding de la page (profile.css).
  useEffect(() => {
    const html = document.documentElement
    let ticking = false
    const place = () => {
      ticking = false
      const a = axisEl.current
      const m = mini.current
      if (!a || !m || !zones.current || !rowsEl.current) return
      const sticky = getComputedStyle(a).position === 'sticky'
      const top = (document.querySelector('.form-header')?.getBoundingClientRect().bottom ?? 0) + 5
      const on = !sticky && zones.current.getBoundingClientRect().bottom < top && rowsEl.current.getBoundingClientRect().bottom > top + 60
      m.classList.toggle('is-on', on)
      html.style.setProperty('--axis-stick', `${sticky ? a.offsetHeight : m.offsetHeight}px`)
    }
    const later = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(place)
    }
    addEventListener('scroll', later, { passive: true })
    addEventListener('resize', later)
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(later)
    if (axisEl.current) ro?.observe(axisEl.current)
    place()
    return () => {
      removeEventListener('scroll', later)
      removeEventListener('resize', later)
      ro?.disconnect()
      html.style.removeProperty('--axis-stick')
    }
  }, [])

  // Au clavier : flèches haut et bas d'une ligne (ou d'un pli) à l'autre, Début et Fin
  const onKeyDown = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !plot.current) return
    const list = [...plot.current.querySelectorAll<HTMLElement>('.row, .fold')].filter(b => b.offsetParent !== null)
    const i = list.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))
    list[j]!.focus()
  }

  const toggle = (key: string) => setOpen(o => (o === key ? null : key))
  const toggleFold = (id: string, keys: string[]) => {
    const closing = !!folds[id]
    setFolds(f => ({ ...f, [id]: !f[id] }))
    if (closing && open && keys.includes(open)) setOpen(null)
  }
  const row = (u: UnitReading, family: string | null = null) => {
    const key = unitKey(u)
    return (
      <Row
        key={key}
        u={u}
        tints={tints}
        name={nameOf(u)}
        family={family ? (groupLabel.get(family) ?? family) : null}
        open={open === key}
        onToggle={() => toggle(key)}
        onHover={on => setHover(on ? key : null)}
        ctx={ctx}
        onDetail={onDetail}
      />
    )
  }
  // « Aux deux bouts à la fois » quand toutes ses lignes touchent l'extrême gauche et l'extrême droite ; sinon « Des
  // deux côtés à la fois »
  const bothTitle = T.bothTitle(both.every(atBothEnds))
  const unreadLabel = T.unreadFold(unread.length, unread.every(x => x.unit.status === 'une-question'))
  const source = ctx.pack.election.spectrum?.source

  return (
    <>
      <section class="profile-chart" aria-labelledby="chart-title">
        <div class="plot" ref={plot} onKeyDown={onKeyDown}>
          <div class="chart-head">
            <h2 class="chart-title" id="chart-title">
              {T.CHART_TITLE}
            </h2>
            <p class="chart-count">
              {nRead ? (
                <>
                  {T.countRead(nRead, flat.length)[0]}
                  <strong>{T.countRead(nRead, flat.length)[1]}</strong>
                  {T.countRead(nRead, flat.length)[2]}
                </>
              ) : (
                T.COUNT_NONE
              )}
            </p>
            {all.length ? (
              <p class="chart-hint">
                <span class="hint-touch">{T.HINT_TOUCH}</span>
                <span class="hint-click">{T.HINT_CLICK}</span>
              </p>
            ) : null}
          </div>

          <div class={`axis${lit ? ' is-hl' : ''}`} ref={axisEl}>
            <div class="chart-key">
              <ul>
                <li>
                  <span class="key-swatch near" aria-hidden="true">
                    <KeyFills tints={keyTints} />
                    <span class="key-glyph">{T.GLYPH.pres}</span>
                  </span>
                  <strong>{T.MARK_WORD.pres}</strong>
                </li>
                <li>
                  <span class="key-swatch far" aria-hidden="true">
                    <KeyFills tints={keyTints} />
                    <span class="key-glyph">{T.GLYPH.loin}</span>
                  </span>
                  <strong>{T.MARK_WORD.loin}</strong>
                </li>
                <li>
                  <span class="key-swatch none" aria-hidden="true">
                    {T.GLYPH.rien}
                  </span>
                  <span>{T.MARK_WORD.rien}</span>
                </li>
                {hasUnknown ? (
                  <li>
                    <span class="key-swatch none is-inconnu" aria-hidden="true">
                      {T.GLYPH.inconnu}
                    </span>
                    <span>{T.MARK_WORD.inconnu}</span>
                  </li>
                ) : null}
              </ul>
              <p class="key-text">{T.KEY_TEXT}</p>
            </div>
            <p class="axis-dir" aria-hidden="true">
              <span>{T.AXIS_LEFT}</span>
              <span class="axis-mid">
                <span class="axis-zero">{T.AXIS_ZERO}</span>
                {T.AXIS_MID}
              </span>
              <span class="axis-right">{T.AXIS_RIGHT}</span>
            </p>
            <ol class="zones" ref={zones} aria-label={T.zonesLabel(axis.length, panelSize)}>
              {axis.map((a, b) => (
                <li key={a.bloc} class={`zone ${tintClass(tints[b])}${zoneClass(b)}`}>
                  <span class="zone-bloc">
                    {labels[b]}{' '}
                    <span class="zone-mark" aria-hidden="true">
                      {lit?.near.includes(b) ? T.GLYPH.pres : lit?.far.includes(b) ? T.GLYPH.loin : ''}
                    </span>
                  </span>
                  <ul class="zone-names">
                    {panel[b]!.map(id => {
                      const full = names.get(id) ?? id
                      return (
                        <li key={id}>
                          <span class="n-last">{surname(full)}</span>
                          <span class="n-full">{full}</span>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div class="rows-wrap" ref={rowsEl}>
            {main.length ? (
              <ol class="rows" aria-label={T.MAIN_LABEL}>
                {main.map(u => row(u))}
              </ol>
            ) : null}
            {both.length ? (
              <>
                <div class={`rows-head${main.length ? '' : ' is-first'}`}>
                  <h3>{bothTitle}</h3>
                  <p>{T.BOTH_HEAD}</p>
                </div>
                <ol class="rows" aria-label={bothTitle}>
                  {both.map(u => row(u))}
                </ol>
              </>
            ) : null}
            {apart.length ? (
              <>
                <div class={`rows-head${nRead ? '' : ' is-first'}`}>
                  <h3>{T.APART_TITLE}</h3>
                  <p>{T.APART_HEAD}</p>
                </div>
                <ol class="rows" aria-label={T.APART_TITLE}>
                  {apart.map(u => row(u))}
                </ol>
              </>
            ) : null}
            {!nRead && !apart.length ? (
              <div class="chart-empty">
                <p>{T.EMPTY_CHART}</p>
                {quickOnly ? (
                  <p>
                    <a class="btn-primary" href={link('/approfondir')}>
                      Approfondir
                      <Icon name="arrow-right" />
                    </a>
                  </p>
                ) : null}
              </div>
            ) : null}
            <div class={`folds${nRead || apart.length ? ' is-ruled' : ''}`}>
              {flat.length ? (
                <Fold id="pli-flat" label={T.flatFold(flat.length)} open={!!folds['pli-flat']} onToggle={() => toggleFold('pli-flat', flat.map(unitKey))}>
                  {flat.map(u => row(u))}
                </Fold>
              ) : null}
              {unread.length ? (
                <Fold
                  id="pli-unread"
                  label={unreadLabel[0]}
                  rest={unreadLabel[1]}
                  open={!!folds['pli-unread']}
                  onToggle={() => toggleFold('pli-unread', unread.map(x => unitKey(x.unit)))}
                >
                  {unread.map(x => row(x.unit, x.family))}
                </Fold>
              ) : null}
              {reading.unanswered.length ? (
                <p class="unanswered">
                  <strong>{T.unansweredLine(reading.unanswered.length)}</strong>
                  <span class="soft"> · {reading.unanswered.map(id => topicLabel.get(id) ?? id).join(' · ')} · </span>
                  <a href={link('/approfondir')}>Approfondir</a>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Très étroit ou texte très agrandi : les noms quittent l'en-tête des colonnes et passent ici */}
        <div class="who-list">
          <p>{T.WHO_LIST}</p>
          <ul>
            {axis.map((a, b) => (
              <li key={a.bloc}>
                <strong>{labels[b]}</strong>&nbsp;: {T.listFr(panel[b]!.map(id => names.get(id) ?? id))}
              </li>
            ))}
          </ul>
        </div>
        <p class="chart-note">{T.SUMMARY_NOTE}</p>
        <p class="chart-source">
          {T.SOURCE[0]}
          {source ? <ExternalLink href={source.url}>{source.date ? T.sourceLink(formatDate(source.date)) : source.title}</ExternalLink> : null}
          {T.SOURCE[1]} {T.sourceWho(panelSize)} {T.COLORS_NOTE}
        </p>
        <details class="calc">
          <summary>{T.CALC_TITLE}</summary>
          <ul>
            <li>{T.howWho(panelSize, ctx.unscored)}</li>
            <li>{T.HOW_CALC}</li>
            {T.HOW_MARKS.map(m => (
              <li key={m.mark}>
                <span class="calc-glyph" aria-hidden="true">
                  {T.GLYPH[m.mark]}
                </span>{' '}
                {m.text}
              </li>
            ))}
            <li>{T.HOW_NETTEMENT}</li>
            <li>{T.HOW_MIN}</li>
            <li>{T.HOW_NO_EFFECT}</li>
          </ul>
        </details>
      </section>

      {/* Rappel des blocs (téléphone), fixé sous l'en-tête : hors du graphique, qui est un conteneur de requêtes */}
      <div class={`axis-mini${lit ? ' is-hl' : ''}`} ref={mini} aria-hidden="true">
        <div class="axis-mini-inner">
          {axis.map((a, b) => (
            <span key={a.bloc} class={`${tintClass(tints[b])}${zoneClass(b)}`}>
              {a.short}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

/** Le chevron d'un bouton qui déplie : vers le bas, vers le haut une fois ouvert */
const Chevron = () => <Icon name="chevron" class="chev" />

interface RowProps {
  u: UnitReading
  tints: readonly (Tint | null)[]
  name: string
  /** La famille lue à la place de ce thème (une seule question) */
  family: string | null
  open: boolean
  onToggle: () => void
  onHover: (on: boolean) => void
  ctx: ProfileCtx
  onDetail: (u: UnitReading) => void
}

/** Une ligne : un bouton (nom, nombre de questions, marques), puis son explication, dépliée sous elle */
function Row({ u, tints, name, family, open, onToggle, onHover, ctx, onDetail }: RowProps) {
  const id = `sj-${unitKey(u)}`
  const famille = u.kind === 'famille'
  const meta = famille ? T.themesTogether(u.topicIds.length) : T.questionsCount(u.questions.length)
  const spoken = famille ? `${meta}, ${T.questionsCount(u.questions.length)}` : meta
  return (
    <li class="row-item">
      <button
        type="button"
        class="row"
        id={`${id}-b`}
        aria-expanded={open ? 'true' : 'false'}
        aria-controls={`${id}-x`}
        onClick={onToggle}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
      >
        <span class="row-label">
          <span class="row-text" aria-hidden="true">
            <span class="row-name">{name}</span> <span class="row-meta">{meta}</span>
          </span>
          <Chevron />
        </span>
        {isRead(u) ? <Strip u={u} tints={tints} /> : null}
        <span class="sr-only">{T.rowSummary(ctx.axis, name, spoken, u)}</span>
      </button>
      <div class="explain" id={`${id}-x`} role="region" aria-labelledby={`${id}-b`} hidden={!open}>
        {open ? <Explain u={u} family={family} ctx={ctx} onDetail={onDetail} /> : null}
      </div>
    </li>
  )
}

/**
 * Les aplats d'une barre : un par suite de blocs de même couleur, posé au pixel sur ses colonnes (profile.css,
 * .bar-fill) ; entre deux couleurs, la couture reste visible. Chaque aplat porte son glyphe, pour que la couleur ne
 * dise jamais rien seule ; le mot ne s'écrit qu'une fois, dans le plus long (à égalité, le premier), et jamais à
 * cheval sur une couture. data-blocs : les blocs qu'il couvre (contrôles e2e).
 */
function Runs({ s, tints, near }: { s: number[]; tints: readonly (Tint | null)[]; near: boolean }) {
  const runs: [number, number][] = []
  s.forEach((b, j) => {
    const last = runs[runs.length - 1]
    if (last && tints[b] === tints[s[last[0]]!]) last[1] = j + 1
    else runs.push([j, j + 1])
  })
  const main = runs.reduce((m, r, i) => (r[1] - r[0] > runs[m]![1] - runs[m]![0] ? i : m), 0)
  const mark = near ? 'pres' : 'loin'
  return (
    <>
      {runs.map(([j0, j1], i) => (
        <span key={j0} class={`bar-fill ${tintClass(tints[s[j0]!])}`} style={`--j0: ${j0}; --j1: ${j1}; --k: ${s.length}`} data-blocs={s.slice(j0, j1).join(' ')}>
          <span class={near ? 'bar-label' : 'bar-tag'}>
            {T.GLYPH[mark]}
            {i === main ? <span class="bar-word">{near ? T.MARK_WORD.pres : ` ${T.MARK_WORD.loin}`}</span> : null}
          </span>
        </span>
      ))}
    </>
  )
}

/** Les cases de la légende : une par couleur de l'axe */
const KeyFills = ({ tints }: { tints: readonly (Tint | null)[] }) => (
  <span class="key-fills">
    {tints.map(t => (
      <span key={t ?? 'encre'} class={`bar-fill ${tintClass(t)}`} />
    ))}
  </span>
)

/**
 * Les cinq cases d'une ligne, et ses barres, une par suite de blocs voisins : ▲ dans la teinte soutenue de chaque bloc,
 * ▽ hachuré dans sa teinte
 */
function Strip({ u, tints }: { u: UnitReading; tints: readonly (Tint | null)[] }) {
  const span = (s: number[]) => `grid-column: ${s[0]! + 1} / ${s[s.length - 1]! + 2}`
  return (
    <span class="strip" aria-hidden="true">
      {u.cells.map((c, b) => (
        <span key={c.bloc} class={`cell${c.mark === 'inconnu' ? ' is-inconnu' : ''}`} style={`grid-column: ${b + 1}`}>
          {c.mark === 'rien' || c.mark === 'inconnu' ? T.GLYPH[c.mark] : ''}
        </span>
      ))}
      {segments(u.near).map(s => (
        <span key={`n${s[0]}`} class="bar near" style={span(s)}>
          <Runs s={s} tints={tints} near />
        </span>
      ))}
      {segments(u.far).map(s => (
        <span key={`f${s[0]}`} class="bar far" style={span(s)}>
          <Runs s={s} tints={tints} near={false} />
        </span>
      ))}
    </span>
  )
}

/** L'explication d'une ligne ouverte : la phrase du site, les candidats des blocs marqués, le lien vers le détail */
function Explain({ u, family, ctx, onDetail }: { u: UnitReading; family: string | null; ctx: ProfileCtx; onDetail: (u: UnitReading) => void }) {
  const { axis, labels, names, panel } = ctx
  const read = isRead(u)
  const fact = oneQuestionFact(u, ctx)
  const deeper = !read && deeperOf(u, ctx)
  const both = read && acrossCentre(u) ? T.bothRow(atBothEnds(u)) : null
  const who = (title: string, idx: number[]) =>
    idx.length ? (
      <div>
        <dt>{title}</dt>
        <dd>
          {idx.map(b => {
            const known = u.cells[b]!.known
            const others = panel[b]!.length - known.length
            return (
              <span key={b} class="who-bloc">
                <span class="who-name">{labels[b]}&nbsp;: </span>
                {known.length ? T.listFr(known.map(id => names.get(id) ?? id)) : T.NONE_KNOWN}
                {known.length && others > 0 ? <span class="soft"> {T.othersUnknown(others)}</span> : null}
              </span>
            )
          })}
        </dd>
      </div>
    ) : null
  return (
    <div class="explain-inner">
      <p class="explain-lead">{T.unitSentence(axis, u)}</p>
      {both ? (
        <p class="explain-both">
          <strong>{both[0]}</strong>
          {both[1]}
        </p>
      ) : null}
      {read && u.near.length + u.far.length ? (
        <>
          <dl class="explain-who">
            {who(T.WHO_NEAR, u.near)}
            {who(T.WHO_FAR, u.far)}
          </dl>
          <p class="explain-note">{T.BLOC_NOTE}</p>
        </>
      ) : null}
      {fact ? <p class="explain-fact">{fact}</p> : null}
      {family ? <p class="explain-note">{T.readWithFamily(family)}</p> : null}
      <p class="explain-foot">
        {u.kind === 'famille' ? <span class="soft">{T.questionsCount(u.questions.length)}</span> : null}
        {read ? (
          <button type="button" class="link-button" onClick={() => onDetail(u)}>
            {T.SEE_DETAIL}
          </button>
        ) : deeper ? (
          <a href={link('/approfondir')}>{T.DEEPEN_THEME}</a>
        ) : null}
      </p>
    </div>
  )
}

/** Un pli : un bouton (aria-expanded) et ses lignes, rendues une fois ouvert */
function Fold({ id, label, rest, open, onToggle, children }: { id: string; label: string; rest?: string; open: boolean; onToggle: () => void; children: preact.ComponentChildren }) {
  return (
    <div class="fold-item">
      <button type="button" class="fold" aria-expanded={open ? 'true' : 'false'} aria-controls={id} onClick={onToggle}>
        <span class="fold-label">
          {label}
          {rest ? <span class="soft"> · {rest}</span> : null}
        </span>
        <Chevron />
      </button>
      <ol class="rows fold-body" id={id} hidden={!open}>
        {open ? children : null}
      </ol>
    </div>
  )
}
