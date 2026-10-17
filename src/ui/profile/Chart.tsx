// Le graphique « Domaine par domaine » de « Mon profil politique » (ui/screens/Profile.tsx) : une ligne par sujet, cinq
// colonnes, les blocs de la grille des nuances du ministère de l'Intérieur, de l'extrême gauche à l'extrême droite,
// avec sous chaque bloc les candidats classés qu'elle y range. Les en-têtes de colonne sont neutres ; chaque case prend
// la couleur de votre affinité moyenne avec les candidats du bloc, sur ce sujet, selon les cinq paliers du site
// (core/affinity.ts ; décision du propriétaire du 12 octobre 2026), du rouge foncé de « très éloigné » au vert foncé de
// « très proche », le mot du palier toujours écrit dans la case ; « ? inconnu » quand aucun candidat du bloc n'est connu.
// Variante a′ (décision du propriétaire du 15 octobre 2026) : les lignes sont groupées sous les neuf domaines, dans leur
// ordre ; dans chacun, les lectures nettes, puis les écarts, puis les sujets sans tendance nette, puis ceux d'une seule
// question, chaque groupe sans lecture nette sous un court intertitre gris (ui/profile/rows.ts). Aucun symbole de
// lecture : ce qui est net se dit par le rangement, par le compte en tête, dont chaque nom ouvre sa ligne, et par la
// phrase d'une ligne ouverte. Quand il n'y a pas assez de réponses, ou rien de net, l'affichage dédié le dit à la place
// du compte (D1) : rien de net nulle part, aucun sujet à l'épreuve, des avis uniformes. Chaque ligne est un bouton qui
// déplie, sous elle, la phrase du site et chaque bloc avec son palier, son affinité et sa lecture nette ; une seule
// ouverte à la fois. Au clavier : Tab, Entrée, Espace, flèches haut et bas, Début et Fin. Au téléphone, un rappel des
// cinq blocs reste sous l'en-tête pendant qu'on parcourt les lignes ; en grand écran, l'axe entier y colle. La fiche
// « Pour lire plus de thèmes » suit les domaines, repliée ; ouverte sous le compte au seul questionnaire rapide, ou
// quand rien n'est net nulle part.
// Lot 2 : une ligne fermée ne reçoit que le mot « prioritaire », sur un thème prioritaire ; une ligne ouverte, sous un bloc
// nettement plus près, la croix des lignes rouges que franchissent ses candidats sur ce sujet, seule au stylo rouge, le
// texte en gris. Ni l'une ni l'autre ne change la couleur, la lecture ni l'ordre des lignes.
// Rien n'est recalculé : les lignes rangent la lecture (ui/profile/rows.ts) ; les phrases sont celles du site
// (core/echiquierCopy.ts).

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { AFFINITY_BANDS, affinityBand } from '../../core/affinity'
import { isAnswered } from '../../core/answers'
import type { BlocCell, Echiquier, UnitReading } from '../../core/echiquier'
import { approvedCarriers, approvedOf, mainCarriers } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import type { DealbreakerHit } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { Answers, CandidateId, ElectionPack, QuestionId, SpectrumAxisBloc, TopicGroup, TopicId } from '../../core/types'
import { ExternalLink } from '../components/ExternalLink'
import { Icon } from '../components/Icon'
import { InkCross } from '../components/Ink'
import { formatDate } from '../format'
import { link } from '../nav'
import { acrossCentre, atBothEnds, chartRows, crossingsOf, headOf, splitsABloc, uniformViews, unitKey, type FamilyRows, type RowGroupKind } from './rows'

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
  /** Les lignes rouges que franchit chaque candidat de l'axe, celles du dépouillement (rows.ts, hitsOf) */
  hits: ReadonlyMap<CandidateId, readonly DealbreakerHit[]>
  /** Au moins une ligne rouge posée : « Comment c'est calculé » dit alors ce que la croix ne change pas */
  redLines: boolean
  /** Les thèmes prioritaires, la règle du dépouillement (core/answers.ts, priorityTopics) */
  priorities: ReadonlySet<TopicId>
  /** Le thème de chaque question */
  topicOf: ReadonlyMap<QuestionId, TopicId>
  /** Les thèmes de la banque, dans son ordre (celui des domaines) : la croix d'une ligne de famille cite les siens ainsi */
  topicOrder: readonly TopicId[]
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

/** Les thèmes à compléter pour être lus seuls (core/echiquier.ts, deeperTopics) */
export interface Deeper {
  thin: string[]
  none: string[]
}

interface Props {
  reading: Echiquier
  ctx: ProfileCtx
  quickOnly: boolean
  /** Les thèmes à compléter, pour la fiche « Pour lire plus de thèmes » */
  deeper: Deeper
  /** Questions vues sans avis qui compte : passées, vues sans avis, ou à revoir */
  unseen: number
  /** Ouvre le détail complet d'une unité, dans le tableau replié sous le graphique */
  onDetail: (u: UnitReading) => void
}

export function Chart({ reading, ctx, quickOnly, deeper, unseen, onDetail }: Props) {
  const { axis, labels, panel, names, groups, topicLabel, pack, answers } = ctx
  const groupLabel = useMemo(() => new Map(groups.map(g => [g.id, g.label])), [groups])
  const nameOf = (u: UnitReading) => (u.kind === 'famille' ? (groupLabel.get(u.id) ?? u.id) : (topicLabel.get(u.id) ?? u.id))
  // Les libellés ne changent qu'avec le pack : les familles et la lecture suffisent à refaire le rangement
  const rows = useMemo(() => chartRows(groups, reading, nameOf), [groups, reading])
  const { families, read, apart, flat, unread } = rows
  const panelSize = panel.flat().length
  const all = families.flatMap(f => f.groups.flatMap(g => g.rows))
  // « ? inconnu » n'entre dans la légende que s'il paraît dans une ligne
  const hasUnknown = all.some(u => u.cells.some(c => c.affinity === null))
  const hasDeeper = deeper.thin.length + deeper.none.length > 0
  // L'état de la tête (C0, C5, C5 bis, C6, C9), ce que C5 dit de plus quand c'est vrai, et la place de la fiche : ouverte
  // sous le compte au seul questionnaire rapide et quand rien n'est net nulle part, sinon après les domaines, repliée
  // (rows.ts, headOf)
  const { state: head, cause, deeperOnTop } = headOf(rows, reading.themes, { uniform: uniformViews(pack.bank.questions, answers), quickOnly, hasDeeper })
  // Les thèmes sans réponse que la fiche ne cite pas (plus rien à approfondir) : leur ligne, sans doublon
  const unanswered = reading.unanswered.filter(id => !deeper.none.includes(id))
  // Par ligne d'un thème sans lecture : le nom de la famille lue à sa place
  const covered = Object.fromEntries(unread.map(x => [unitKey(x.unit), x.family ? (groupLabel.get(x.family) ?? x.family) : null]))

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

  // Un nom du compte de tête : sa ligne s'ouvre, vient sous l'en-tête et l'axe (scroll-padding), avec l'intertitre de son
  // domaine quand elle en est la première, et reçoit le focus
  const openRow = (u: UnitReading) => {
    const key = unitKey(u)
    setOpen(key)
    requestAnimationFrame(() => {
      const b = document.getElementById(`sj-${key}-b`)
      if (!b) return
      const family = b.closest<HTMLElement>('.fam-group')
      const target = family && family.querySelector('.row') === b ? family : b
      target.scrollIntoView({ block: 'start' })
      b.focus({ preventScroll: true })
    })
  }
  /**
   * Les noms du compte, cinq au plus, séparés de virgules (un nom peut contenir « et »), puis « et N autres ». Chacun un
   * lien vers son sujet, dans la page (un bouton ne se couperait pas en fin de ligne : la phrase passerait à la ligne
   * avant chaque nom long) ; ouvert dans un autre onglet, il mène à la page
   */
  const countNames = (list: readonly UnitReading[]) => (
    <>
      {list.slice(0, T.COUNT_NAMES).map((u, i) => (
        <span key={unitKey(u)}>
          {i ? ', ' : ''}
          <a
            class="count-link"
            href={link('/profil')}
            onClick={e => {
              e.preventDefault()
              openRow(u)
            }}
          >
            {nameOf(u)}
          </a>
        </span>
      ))}
      {T.countEnd(list.length - T.COUNT_NAMES)}
    </>
  )
  const rest = head === 'read' || head === 'apart' ? T.countRest(head === 'read' ? apart.length : 0, flat.length, unread.filter(x => x.unit.status === 'une-question').length, unread.filter(x => x.unit.status === 'blocs-inconnus').length, unseen) : null
  const deepenCta = (
    <p class="chart-state-cta">
      <a class="btn-primary" href={link('/approfondir')}>
        Approfondir
        <Icon name="arrow-right" />
      </a>
    </p>
  )
  const card = (top: boolean) => <DeeperCard deeper={deeper} quickOnly={quickOnly} ctx={ctx} folded={!top} />
  const source = pack.election.spectrum?.source

  return (
    <>
      <section class="profile-chart" aria-labelledby="chart-title">
        <div class="plot" ref={plot} onKeyDown={onKeyDown}>
          <div class="chart-head">
            <h2 class="chart-title" id="chart-title">
              {T.CHART_TITLE}
            </h2>
            {head === 'read' || head === 'apart' ? (
              <p class="chart-count">
                {(head === 'read' ? T.countNear(read.length) : T.countApart(apart.length)).map((part, i) => (i === 1 ? <strong key={i}>{part}</strong> : part))}
                {countNames(head === 'read' ? read : apart)}
              </p>
            ) : null}
            {rest ? <p class="chart-rest">{rest}</p> : null}
            {head === 'nothing' ? (
              <>
                <p class="chart-state">
                  {T.nothingAnywhere(cause).map((part, i) => (i === 1 ? <strong key={i}>{part}</strong> : part))}
                </p>
                <p class="chart-state">{T.NOT_CENTRE}</p>
                {cause === 'quick' ? (
                  deepenCta
                ) : (
                  <p class="chart-state">
                    {T.YOUR_RANKING[0]}
                    <a href={link('/resultats')}>
                      {T.YOUR_RANKING[1]}
                      <Icon name="arrow-right" />
                    </a>
                  </p>
                )}
              </>
            ) : null}
            {head === 'untestable' ? (
              <>
                <p class="chart-state">{T.NOTHING_TESTABLE}</p>
                {hasDeeper ? deepenCta : null}
              </>
            ) : null}
            {head === 'uniform' ? <p class="chart-state">{T.UNIFORM}</p> : null}
            {deeperOnTop ? card(true) : null}
            {all.length ? (
              <p class="chart-hint">
                <span class="hint-touch">{T.HINT_TOUCH}</span>
                <span class="hint-click">{T.HINT_CLICK}</span>
              </p>
            ) : null}
          </div>

          {all.length ? (
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
          ) : null}

          <div class="rows-wrap" ref={rowsEl}>
            {families.map((f, i) => (
              <Family
                key={f.id}
                f={f}
                first={i === 0}
                nameOf={nameOf}
                open={open}
                setOpen={setOpen}
                covered={covered}
                ctx={ctx}
                onDetail={onDetail}
              />
            ))}
            {unanswered.length ? (
              <p class="unanswered">
                <strong>{T.unansweredLine(unanswered.length)}</strong>
                <span class="soft"> · {unanswered.map(id => topicLabel.get(id) ?? id).join(' · ')}</span>
              </p>
            ) : null}
            {hasDeeper && !deeperOnTop ? card(false) : null}
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
        {/* Huit points au plus : le reste est dans la Méthode */}
        <details class="calc">
          <summary>{T.CALC_TITLE}</summary>
          <ul>
            <li>{T.howWho(panelSize, ctx.unscored)}</li>
            <li>{T.HOW_CALC}</li>
            <li>{T.HOW_COLOR}</li>
            <li>{T.HOW_MARKS.join(' ')}</li>
            <li>
              {T.HOW_NETTEMENT} {T.HOW_EXAMPLE_TITLE}
              <ol class="calc-example">
                {T.HOW_EXAMPLE.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
            </li>
            <li>{T.COLORS_CHANCE}</li>
            <li>{T.HOW_MIN}</li>
            {/* Ce qui n'en dépend pas, ce qui n'y compte pas (les priorités), et ce que la croix ne change pas : un seul point */}
            <li>
              {T.HOW_NO_EFFECT} {T.HOW_PRIORITY}
              {ctx.redLines ? ` ${T.HOW_CROSS}` : null}
            </li>
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

/** L'intertitre gris d'un groupe d'un domaine ; les lectures nettes d'un seul côté n'en ont pas */
function groupTitle(kind: RowGroupKind, rows: readonly UnitReading[]): string | null {
  if (kind === 'net') return null
  // « Aux deux bouts à la fois » quand toutes ses lignes touchent l'extrême gauche et l'extrême droite ; sinon « Des deux
  // côtés à la fois »
  if (kind === 'both') return T.bothTitle(rows.every(atBothEnds))
  return T.GROUP_TITLE[kind]
}

interface FamilyProps {
  f: FamilyRows
  first: boolean
  nameOf: (u: UnitReading) => string
  open: string | null
  setOpen: (f: (o: string | null) => string | null) => void
  /** Par ligne d'un thème sans lecture : le nom de la famille lue à sa place */
  covered: Record<string, string | null>
  ctx: ProfileCtx
  onDetail: (u: UnitReading) => void
}

/**
 * Un domaine : son intertitre (plus d'un thème) ou son seul filet (un thème, dont la ligne porte le nom), puis ses
 * groupes de lignes, chacun une liste nommée par l'intertitre du domaine et le sien ; les lectures nettes d'un seul côté,
 * sans intertitre, par un nom masqué (T.NET_LABEL), que lisent seuls les lecteurs d'écran
 */
function Family({ f, first, nameOf, open, setOpen, covered, ctx, onDetail }: FamilyProps) {
  const headId = `fam-${f.id}`
  return (
    <div class={`fam-group${first ? ' is-first' : ''}`} id={headId}>
      {f.heading ? (
        <h3 class="fam-name" id={`${headId}-h`}>
          {f.label}
        </h3>
      ) : null}
      {f.groups.map(({ kind, rows }) => {
        const title = groupTitle(kind, rows)
        const subId = `${headId}-${kind}`
        const quiet = kind === 'flat' || kind === 'thin' || kind === 'unknown'
        const labelledBy = [f.heading ? `${headId}-h` : '', subId].filter(Boolean).join(' ')
        return (
          <div key={kind} class="fam-part">
            {title ? (
              <p class="fam-sub" id={subId}>
                {title}
              </p>
            ) : (
              <span id={subId} hidden>
                {T.NET_LABEL}
              </span>
            )}
            <ol class={`rows${quiet ? ' is-quiet' : ''}`} data-group={kind} aria-labelledby={labelledBy}>
              {rows.map(u => {
                const key = unitKey(u)
                return (
                  <Row
                    key={key}
                    u={u}
                    name={nameOf(u)}
                    family={covered[key] ?? null}
                    open={open === key}
                    onToggle={() => setOpen(o => (o === key ? null : key))}
                    ctx={ctx}
                    onDetail={onDetail}
                  />
                )
              })}
            </ol>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Pour lire plus de thèmes : ceux sans réponse, puis ceux d'une seule question, qui ont encore des questions
 * approfondies ; chacun mène à « Approfondir », coché ; puis le choix libre des thèmes. folded : après les domaines,
 * repliée derrière son titre et ce qu'elle compte ; sinon ouverte, sous le compte
 */
function DeeperCard({ deeper, quickOnly, ctx, folded }: { deeper: Deeper; quickOnly: boolean; ctx: ProfileCtx; folded: boolean }) {
  // En grand écran, la place ne manque pas : la longue liste est ouverte d'emblée
  const [wide] = useState(() => matchMedia('(min-width: 64rem)').matches)
  // Le séparateur reste collé au thème qui le précède : une ligne ne commence jamais par lui
  const list = (ids: string[], sep = ' · ') => (
    <span class="deeper-topics">
      {ids.map((id, i) => (
        <span key={id}>
          {/* Le nom lu commence par l'action, puis le nom visible du thème */}
          <a href={link(`/approfondir/${id}`)} onClick={() => ctx.deepen([id])} aria-label={`${T.DEEPER_THEME} ${ctx.topicLabel.get(id) ?? id}`}>
            {ctx.topicLabel.get(id) ?? id}
          </a>
          {i < ids.length - 1 ? sep : null}
        </span>
      ))}
    </span>
  )
  // Ses thèmes prioritaires (lot 2, A2), dans son ordre : hors du pli, toujours visibles
  const prio = [...deeper.none, ...deeper.thin].filter(id => ctx.priorities.has(id))
  return (
    <section class={`deeper-card${folded ? ' is-below' : ''}`} aria-labelledby="deeper-title">
      <details open={!folded}>
        <summary>
          <Icon name="deepen" class="deeper-icon" />
          <span class="ds-text">
            <span class="ds-title" id="deeper-title">
              {T.DEEPER_TITLE}
            </span>{' '}
            <span class="ds-n">{T.deeperCount(deeper.none.length, deeper.thin.length, folded)}</span>
          </span>
          <Icon name="chevron" class="disclosure" />
        </summary>
        <div class="deeper-body">
          <p>{T.deeperLede(quickOnly)}</p>
          <div class="deeper-lists">
            {deeper.none.length ? (
              <p>
                <strong>{T.unansweredLine(deeper.none.length)}</strong>
                {list(deeper.none)}
              </p>
            ) : null}
            {/* Une longue liste se replie derrière son compte */}
            {deeper.thin.length > 6 ? (
              <details class="deeper-fold" open={wide}>
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="summary-label">{T.thinLine(deeper.thin.length)}</span>
                </summary>
                <p>{list(deeper.thin)}</p>
              </details>
            ) : deeper.thin.length ? (
              <p>
                <strong>{T.thinLine(deeper.thin.length)}</strong>
                {list(deeper.thin)}
              </p>
            ) : null}
            <a class="btn-text" href={link('/approfondir')}>
              <Icon name="deepen" />
              {T.DEEPER_GO}
            </a>
          </div>
        </div>
      </details>
      {prio.length ? (
        <p class="deeper-prio">
          <strong>{T.DEEPER_PRIO}</strong> {list(prio, ', ')}
        </p>
      ) : null}
    </section>
  )
}

/** Le chevron d'un bouton qui déplie : vers le bas, vers le haut une fois ouvert */
const Chevron = () => <Icon name="chevron" class="chev" />

interface RowProps {
  u: UnitReading
  /** Le nom du sujet : le thème, ou la famille pour sa ligne entière */
  name: string
  /** La famille lue à la place de ce thème (une seule question) */
  family: string | null
  open: boolean
  onToggle: () => void
  ctx: ProfileCtx
  onDetail: (u: UnitReading) => void
}

/**
 * Une ligne : un bouton (nom, nombre de questions, cinq cases), puis son explication, dépliée sous elle. La ligne d'une
 * famille entière, sous l'intertitre de son domaine, s'écrit « Les 5 thèmes ensemble » ; son nom lu dit la famille, puis
 * ce libellé visible (« Santé, logement, solidarités, les 3 thèmes ensemble, 5 questions »)
 */
function Row({ u, name, family, open, onToggle, ctx, onDetail }: RowProps) {
  const id = `sj-${unitKey(u)}`
  const famille = u.kind === 'famille'
  const shown = famille ? T.familyHead(u.topicIds.length) : name
  const meta = T.questionsCount(u.questions.length)
  // Un thème prioritaire, comme au dépouillement : le seul mot qu'une ligne fermée reçoit en plus (jamais une famille)
  const prio = !famille && ctx.priorities.has(u.id)
  const spoken = famille ? `${T.themesTogether(u.topicIds.length)}, ${meta}` : T.rowMeta(u.questions.length, prio)
  return (
    <li class="row-item">
      <button type="button" class="row" id={`${id}-b`} aria-expanded={open ? 'true' : 'false'} aria-controls={`${id}-x`} onClick={onToggle}>
        <span class="row-label">
          <span class="row-text" aria-hidden="true">
            <span class="row-name">{shown}</span>{' '}
            <span class="row-meta">
              {meta}
              {prio ? (
                <>
                  , <span class="row-prio">{T.PRIORITY}</span>
                </>
              ) : null}
            </span>
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
 * L'explication d'une ligne ouverte : la phrase du site, la note sur le bloc entier quand il y a une lecture nette, puis
 * chaque bloc, son palier en mots, son affinité moyenne (celle du détail) et sa lecture nette s'il y en a une, avec
 * alors ses candidats ; le lien vers le détail, ou vers « Approfondir » pour un thème sans lecture
 */
function Explain({ u, family, ctx, onDetail }: { u: UnitReading; family: string | null; ctx: ProfileCtx; onDetail: (u: UnitReading) => void }) {
  const { axis, labels, names, panel, topicLabel } = ctx
  const read = isRead(u)
  const net = u.status === 'lecture' || u.status === 'ecarts'
  const fact = oneQuestionFact(u, ctx)
  const deeper = !read && deeperOf(u, ctx)
  const both = read && acrossCentre(u) ? T.bothRow(atBothEnds(u)) : null
  // Sous chaque bloc nettement plus près : qui franchit une ligne rouge posée sur un thème de la ligne (rows.ts) ; pour
  // une ligne de famille, la phrase nomme le thème de ces lignes rouges, dans l'ordre de la banque
  const crossings = crossingsOf(u, panel, ctx.hits, q => ctx.topicOf.get(q), ctx.topicOrder)
  const crossText = (b: number) =>
    crossings[b]!.map(g =>
      T.crossLine(
        g.ids.map(id => names.get(id) ?? id),
        g.level === 'possible',
        g.count,
        u.kind === 'famille' ? g.topics.map(t => topicLabel.get(t) ?? t) : null,
      ),
    ).join(' ')
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
      {/* La note sur le bloc entier s'efface quand une croix l'illustre, en nommant certains candidats d'un bloc et pas les
          autres (au plus deux nouveautés par ligne ouverte) ; une croix qui nomme tout son bloc la laisse */}
      {net && !splitsABloc(crossings, panel) ? <p class="explain-note">{T.BLOC_NOTE}</p> : null}
      <div class="explain-blocs">
        <p class="eb-title">{T.BLOCS_TITLE}</p>
        <ul>
          {u.cells.map((c, b) => {
            const word = T.netWord(c.mark)
            const others = panel[b]!.length - c.known.length
            return (
              <li key={c.bloc} class={word ? 'is-net' : undefined}>
                <span class={`key-tile ${tileClass(c.affinity)}`} aria-hidden="true">
                  {c.affinity === null ? T.UNKNOWN_GLYPH : null}
                </span>
                <span>
                  <span class="who-name">{labels[b]}&nbsp;:</span> {c.affinity === null ? T.MARK_WORD.inconnu : `${T.palier(c.affinity)}, ${T.pct(c.affinity)}`}
                  {word ? <strong class="eb-net">{word}</strong> : null}
                  {word && c.known.length ? (
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
                  {/* La croix, au stylo rouge, nommée pour les lecteurs d'écran ; le texte en gris */}
                  {crossings[b]!.length ? (
                    <span class="eb-cross">
                      <span class="x" role="img" aria-label={T.CROSS_LABEL}>
                        <InkCross />
                      </span>
                      <span>{keepHyphens(crossText(b))}</span>
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <p class="explain-foot">
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
