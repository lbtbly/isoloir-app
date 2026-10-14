// Le graphique « Sujet par sujet » de « Mon profil politique » (ui/screens/Profile.tsx) : une ligne par sujet, cinq
// colonnes, les blocs de la grille des nuances du ministère de l'Intérieur, de l'extrême gauche à l'extrême droite,
// avec sous chaque bloc les candidats classés qu'elle y range. Les en-têtes de colonne sont neutres ; chaque case prend
// la couleur de votre affinité moyenne avec les candidats du bloc, sur ce sujet, selon les cinq paliers du site
// (core/affinity.ts ; décision du propriétaire du 12 octobre 2026), du rouge foncé de « très éloigné » au vert foncé de
// « très proche », le mot du palier toujours écrit dans la case ; « ? inconnu » quand aucun candidat du bloc n'est connu.
// Aucun symbole de lecture : ce qui est net se dit par le rangement des lignes (d'abord les lectures nettes, dans l'ordre
// validé, puis les sujets sans tendance nette, puis ceux d'une seule question), par le compte en tête et par la phrase
// d'une ligne ouverte. Chaque ligne est un bouton qui déplie, sous elle, la phrase du site et chaque bloc avec son palier,
// son affinité et sa lecture nette ; une seule ouverte à la fois. Au clavier : Tab, Entrée, Espace, flèches haut et
// bas, Début et Fin. Au téléphone, un rappel des cinq blocs reste sous l'en-tête pendant qu'on parcourt les lignes ; en
// grand écran, l'axe entier y colle.
// Rien n'est recalculé : les lignes rangent la lecture (ui/profile/rows.ts) ; les phrases sont celles du site
// (core/echiquierCopy.ts).

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { AFFINITY_BANDS, affinityBand } from '../../core/affinity'
import { isAnswered } from '../../core/answers'
import type { BlocCell, Echiquier, UnitReading } from '../../core/echiquier'
import { approvedCarriers, approvedOf, mainCarriers } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import type { SessionState } from '../../core/storage'
import type { Answers, CandidateId, ElectionPack, SpectrumAxisBloc, TopicGroup } from '../../core/types'
import { ExternalLink } from '../components/ExternalLink'
import { Icon } from '../components/Icon'
import { formatDate } from '../format'
import { link } from '../nav'
import { acrossCentre, atBothEnds, chartRows, unitKey } from './rows'

/** Ce que le graphique, ses lignes et le tableau du détail partagent */
export interface ProfileCtx {
  pack: ElectionPack
  axis: readonly SpectrumAxisBloc[]
  /** Libellé de chaque bloc de l'axe, celui de la grille : « Extrême gauche » */
  labels: string[]
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
  /** Coche ces thèmes dans « Approfondir » (ils rejoignent ceux déjà cochés), avant d'y aller */
  deepen: (topicIds: string[]) => void
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

/** Un thème qui a encore des questions approfondies sans avis : la règle de la page Approfondir (une question passée y reste) */
export const deeperOf = (unit: UnitReading, ctx: ProfileCtx) =>
  unit.kind === 'theme' && ctx.pack.bank.questions.some(q => q.topicId === unit.id && q.tier !== 'essentiel' && !isAnswered(ctx.state.answers[q.id]))

/** La classe d'une case : son palier d'affinité (profile.css, .tile.aff-*) ; sans candidat connu, « is-inconnu » */
export const tileClass = (affinity: number | null) => {
  const band = affinityBand(affinity)
  return band ? `tile aff-${band.key}` : 'tile is-inconnu'
}

/**
 * Une case : la couleur de son palier et son mot (« Très proche ») ; « ? inconnu » sans candidat connu. net : la lecture
 * nette en mots, sous le palier (le tableau du détail). Toujours masquée aux lecteurs d'écran : la ligne ou la case qui
 * la porte dit le palier en toutes lettres.
 */
export function Tile({ cell, net = false }: { cell: Pick<BlocCell, 'affinity' | 'mark'>; net?: boolean }) {
  const band = affinityBand(cell.affinity)
  const word = net ? T.netWord(cell.mark) : null
  return (
    <span class={tileClass(cell.affinity)} aria-hidden="true">
      {band ? (
        <span class="tile-word">{band.label}</span>
      ) : (
        <span class="tile-word">
          <span class="tile-q">{T.UNKNOWN_GLYPH}</span> {T.UNKNOWN_WORD}
        </span>
      )}
      {word ? <span class="tile-net">{word}</span> : null}
    </span>
  )
}

/** Un nom qui ne se coupe pas à son trait d'union (« Jean-Luc » d'un tenant), mais toujours entre ses mots */
const keepHyphens = (name: string) => name.split(/(\s+)/).map((w, i) => (w.includes('-') ? <span key={i} class="nw">{w}</span> : w))

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
  const { axis, labels, panel, names, groups, topicLabel } = ctx
  const groupLabel = useMemo(() => new Map(groups.map(g => [g.id, g.label])), [groups])
  const nameOf = (u: UnitReading) => (u.kind === 'famille' ? (groupLabel.get(u.id) ?? u.id) : (topicLabel.get(u.id) ?? u.id))
  // Les libellés ne changent qu'avec le pack : les familles et la lecture suffisent à refaire le rangement
  const rows = useMemo(() => chartRows(groups, reading, nameOf), [groups, reading])
  const { main, both, apart, flat, unread } = rows
  const nRead = main.length + both.length
  const panelSize = panel.flat().length
  const all = [...main, ...both, ...apart, ...flat, ...unread.map(x => x.unit)]
  // « ? inconnu » n'entre dans la légende que s'il paraît dans une ligne
  const hasUnknown = all.some(u => u.cells.some(c => c.affinity === null))

  // Une seule ligne ouverte
  const [open, setOpen] = useState<string | null>(null)

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
      // Texte très agrandi : les lignes passent en liste et les colonnes s'effacent ; pas de rappel non plus
      const columns = zones.current.getClientRects().length > 0
      const top = (document.querySelector('.form-header')?.getBoundingClientRect().bottom ?? 0) + 5
      const on = columns && !sticky && zones.current.getBoundingClientRect().bottom < top && rowsEl.current.getBoundingClientRect().bottom > top + 60
      m.classList.toggle('is-on', on)
      html.style.setProperty('--axis-stick', `${sticky ? a.offsetHeight : columns ? m.offsetHeight : 0}px`)
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

  // Au clavier : flèches haut et bas d'une ligne à l'autre, Début et Fin
  const onKeyDown = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !plot.current) return
    const list = [...plot.current.querySelectorAll<HTMLElement>('.row')]
    const i = list.indexOf(document.activeElement as HTMLElement)
    if (i < 0) return
    e.preventDefault()
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))
    list[j]!.focus()
  }

  const row = (u: UnitReading, family: string | null = null) => {
    const key = unitKey(u)
    return (
      <Row
        key={key}
        u={u}
        name={nameOf(u)}
        family={family ? (groupLabel.get(family) ?? family) : null}
        open={open === key}
        onToggle={() => setOpen(o => (o === key ? null : key))}
        ctx={ctx}
        onDetail={onDetail}
      />
    )
  }
  // Une section de lignes sous son intertitre ; first : la première du graphique, sans filet au-dessus
  const section = (title: string, head: string, list: preact.ComponentChildren, first: boolean, quiet = false) => (
    <>
      <div class={`rows-head${first ? ' is-first' : ''}`}>
        <h3>{title}</h3>
        <p>{head}</p>
      </div>
      <ol class={`rows${quiet ? ' is-quiet' : ''}`} aria-label={title}>
        {list}
      </ol>
    </>
  )
  // « Aux deux bouts à la fois » quand toutes ses lignes touchent l'extrême gauche et l'extrême droite ; sinon « Des
  // deux côtés à la fois »
  const bothTitle = T.bothTitle(both.every(atBothEnds))
  const oneQuestionOnly = unread.every(x => x.unit.status === 'une-question')
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

          <div class="axis" ref={axisEl}>
            <div class="chart-key">
              <ul class="key-scale" aria-label={T.KEY_LABEL}>
                {AFFINITY_BANDS.map(b => (
                  <li key={b.key}>
                    <span class={`key-tile tile aff-${b.key}`} aria-hidden="true" />
                    {b.label}
                  </li>
                ))}
                {hasUnknown ? (
                  <li>
                    <span class="key-tile tile is-inconnu" aria-hidden="true">
                      {T.UNKNOWN_GLYPH}
                    </span>
                    {T.UNKNOWN_WORD}
                  </li>
                ) : null}
              </ul>
              <p class="key-text">{T.KEY_TEXT}</p>
            </div>
            <ol class="zones" ref={zones} aria-label={T.zonesLabel(axis.length, panelSize)}>
              {axis.map((a, b) => (
                <li key={a.bloc} class="zone">
                  <span class="zone-bloc">{labels[b]}</span>
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
            {both.length ? section(bothTitle, T.BOTH_HEAD, both.map(u => row(u)), !main.length) : null}
            {apart.length ? section(T.APART_TITLE, T.APART_HEAD, apart.map(u => row(u)), !nRead) : null}
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
            {/* Sans tendance nette, puis sur une seule question : visibles, en couleurs, sous leur intertitre */}
            {flat.length ? section(T.flatTitle(flat.length), T.FLAT_HEAD, flat.map(u => row(u)), false, true) : null}
            {unread.length ? section(T.unreadTitle(unread.length, oneQuestionOnly), T.unreadHead(oneQuestionOnly), unread.map(x => row(x.unit, x.family)), false, true) : null}
            {reading.unanswered.length ? (
              <p class="unanswered">
                <strong>{T.unansweredLine(reading.unanswered.length)}</strong>
                <span class="soft"> · {reading.unanswered.map(id => topicLabel.get(id) ?? id).join(' · ')} · </span>
                <a href={link('/approfondir')}>Approfondir</a>
              </p>
            ) : null}
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
            <li>{T.HOW_COLOR}</li>
            {T.HOW_MARKS.map(m => (
              <li key={m}>{m}</li>
            ))}
            <li>{T.COLORS_CHANCE}</li>
            <li>{T.HOW_NETTEMENT}</li>
            <li>{T.HOW_MIN}</li>
            <li>{T.HOW_NO_EFFECT}</li>
          </ul>
        </details>
      </section>

      {/* Rappel des blocs (téléphone), fixé sous l'en-tête : hors du graphique, qui est un conteneur de requêtes */}
      <div class="axis-mini" ref={mini} aria-hidden="true">
        <div class="axis-mini-inner">
          {axis.map(a => (
            <span key={a.bloc}>{a.short}</span>
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
  name: string
  /** La famille lue à la place de ce thème (une seule question) */
  family: string | null
  open: boolean
  onToggle: () => void
  ctx: ProfileCtx
  onDetail: (u: UnitReading) => void
}

/** Une ligne : un bouton (nom, nombre de questions, cinq cases), puis son explication, dépliée sous elle */
function Row({ u, name, family, open, onToggle, ctx, onDetail }: RowProps) {
  const id = `sj-${unitKey(u)}`
  const famille = u.kind === 'famille'
  const meta = famille ? T.themesTogether(u.topicIds.length) : T.questionsCount(u.questions.length)
  const spoken = famille ? `${meta}, ${T.questionsCount(u.questions.length)}` : meta
  return (
    <li class="row-item">
      <button type="button" class="row" id={`${id}-b`} aria-expanded={open ? 'true' : 'false'} aria-controls={`${id}-x`} onClick={onToggle}>
        <span class="row-label">
          <span class="row-text" aria-hidden="true">
            <span class="row-name">{name}</span> <span class="row-meta">{meta}</span>
          </span>
          <Chevron />
        </span>
        <span class="strip" aria-hidden="true">
          {/* data-net : la lecture nette du bloc, que le rangement des lignes suit (contrôles e2e) ; rien à l'écran.
              data-bloc : son nom court, écrit devant la case quand la ligne passe en liste (texte très agrandi) */}
          {u.cells.map((c, b) => (
            <span key={c.bloc} class="cell" data-bloc={ctx.axis[b]!.short} data-net={T.netWord(c.mark) ? c.mark : undefined}>
              <Tile cell={c} />
            </span>
          ))}
        </span>
        <span class="sr-only">{T.rowSummary(ctx.labels, name, spoken, u)}</span>
      </button>
      <div class="explain" id={`${id}-x`} role="region" aria-labelledby={`${id}-b`} hidden={!open}>
        {open ? <Explain u={u} family={family} ctx={ctx} onDetail={onDetail} /> : null}
      </div>
    </li>
  )
}

/**
 * L'explication d'une ligne ouverte : la phrase du site, puis chaque bloc, son palier en mots, son affinité moyenne
 * (celle du détail) et sa lecture nette s'il y en a une, avec alors ses candidats ; le lien vers le détail
 */
function Explain({ u, family, ctx, onDetail }: { u: UnitReading; family: string | null; ctx: ProfileCtx; onDetail: (u: UnitReading) => void }) {
  const { axis, labels, names, panel } = ctx
  const read = isRead(u)
  const fact = oneQuestionFact(u, ctx)
  const deeper = !read && deeperOf(u, ctx)
  const both = read && acrossCentre(u) ? T.bothRow(atBothEnds(u)) : null
  return (
    <div class="explain-inner">
      <p class="explain-lead">{T.unitSentence(axis, u)}</p>
      {both ? (
        <p class="explain-both">
          <strong>{both[0]}</strong>
          {both[1]}
        </p>
      ) : null}
      {fact ? <p class="explain-fact">{fact}</p> : null}
      {family ? <p class="explain-note">{T.readWithFamily(family)}</p> : null}
      <p class="explain-note">{T.BLOC_NOTE}</p>
      <div class="explain-blocs">
        <p class="eb-title">{T.BLOCS_TITLE}</p>
        <ul>
          {u.cells.map((c, b) => {
            const net = T.netWord(c.mark)
            const others = panel[b]!.length - c.known.length
            return (
              <li key={c.bloc} class={net ? 'is-net' : undefined}>
                <span class={`key-tile ${tileClass(c.affinity)}`} aria-hidden="true">
                  {c.affinity === null ? T.UNKNOWN_GLYPH : null}
                </span>
                <span>
                  <span class="who-name">{labels[b]}&nbsp;:</span> {c.affinity === null ? T.MARK_WORD.inconnu : `${T.palier(c.affinity)}, ${T.pct(c.affinity)}`}
                  {net ? <strong class="eb-net">{net}</strong> : null}
                  {net && c.known.length ? (
                    <span class="eb-who">
                      {c.known.map((id, i) => (
                        <span key={id}>
                          {i ? (i === c.known.length - 1 ? ' et ' : ', ') : ''}
                          {keepHyphens(names.get(id) ?? id)}
                        </span>
                      ))}
                      {others > 0 ? <span class="soft"> {T.othersUnknown(others)}</span> : null}
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <p class="explain-foot">
        {u.kind === 'famille' ? <span class="soft">{T.questionsCount(u.questions.length)}</span> : null}
        {read ? (
          <button type="button" class="link-button" onClick={() => onDetail(u)}>
            {T.SEE_DETAIL}
          </button>
        ) : deeper ? (
          <a href={link(`/approfondir/${u.id}`)} onClick={() => ctx.deepen([u.id])}>
            {T.DEEPEN_THEME}
          </a>
        ) : null}
      </p>
    </div>
  )
}
