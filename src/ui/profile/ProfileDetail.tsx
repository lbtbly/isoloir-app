// « Le détail, sujet par sujet » de « Mon profil politique » (ui/screens/Profile.tsx) : le tableau complet, famille par
// famille, chaque unité avec ses cases, sa phrase et son détail replié (le tableau des blocs, « Ce qui pèse le plus »,
// l'affinité par candidat, question par question, et qui franchit chaque ligne rouge). Un fichier à part du build,
// chargé par la page à la première ouverture du tableau (son bouton, ou « Voir le détail » d'une ligne), sur le modèle de
// « Ce qui pèse le plus » (ui/profile/Weigh.tsx ; décision du propriétaire du 17 octobre 2026 : la page reste sous son
// plafond plutôt que de le relever) : une visite qui ne l'ouvre pas ne le télécharge pas. Rien n'y est recalculé ; les
// mots sont ceux du site (core/echiquierCopy.ts).

import { Fragment } from 'preact'
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { RATING_LABELS } from '../../core/answers'
import { approvedOf, mainCarriers, type Echiquier, type UnitReading } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import * as D from '../../core/echiquierDetailCopy'
import type { CandidateId, Question, TopicGroup } from '../../core/types'
import { Icon } from '../components/Icon'
import { link } from '../nav'
import { deeperOf, isRead, oneQuestionFact, Tile, useWeigh, type ProfileCtx } from './Chart'
import { crossedBy } from './rows'

/**
 * La hauteur réelle de l'en-tête collant du tableau (nulle quand il est masqué, en liste, ou replié) : l'élément qui
 * reçoit le focus s'arrête dessous, jamais caché par lui (WCAG 2.4.11), comme sur la page de comparaison
 */
function useHeadHeight(head: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const el = head.current
    const html = document.documentElement
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => html.style.setProperty('--echq-head', `${el.getBoundingClientRect().height}px`))
    ro.observe(el)
    return () => {
      ro.disconnect()
      html.style.removeProperty('--echq-head')
    }
  }, [head])
}

/** Une demande d'ouverture du détail d'une unité (« Voir le détail » d'une ligne) : un objet neuf à chaque demande */
export interface DetailAsk {
  u: UnitReading
}

/**
 * Le tableau complet, famille par famille : chaque unité, ses marques, sa phrase et son détail. ask : le détail d'une
 * unité à ouvrir, qui reçoit alors le focus (« Voir le détail » d'une ligne)
 */
export function DetailTable({ reading, ctx, ask }: { reading: Echiquier; ctx: ProfileCtx; ask: DetailAsk | null }) {
  const { axis, groups } = ctx
  const head = useRef<HTMLTableSectionElement>(null)
  useHeadHeight(head)
  const byTheme = new Map(reading.themes.map(r => [r.id, r]))
  const byFamily = new Map(reading.families.map(r => [r.id, r]))
  // « Voir le détail » d'une ligne : le détail de l'unité s'ouvre et son résumé reçoit le focus, qui l'amène sous les
  // éléments collants (scroll-padding)
  useEffect(() => {
    if (!ask) return
    const d = document.getElementById(`d-${ask.u.kind}-${ask.u.id}`) as HTMLDetailsElement | null
    if (!d) return
    d.open = true
    requestAnimationFrame(() => d.querySelector('summary')?.focus())
  }, [ask])
  return (
    <div class="echiquier-wrap">
      {/* Rôles explicites : au téléphone, les lignes passent en grille, sans rien perdre de la lecture en tableau */}
      <table class="echiquier" role="table" style={`--blocs: ${axis.length}`}>
        <caption class="sr-only">{D.TABLE_CAPTION}</caption>
        <thead role="rowgroup" ref={head}>
          <tr role="row">
            {/* Au téléphone, masquée aux yeux seulement : chaque case de bloc garde l'en-tête de sa colonne */}
            <th scope="col" role="columnheader" class="echq-theme-head">
              {D.TABLE_THEME}
            </th>
            {axis.map((a, b) => (
              <th key={a.bloc} scope="col" role="columnheader" class="bloc-head">
                <span aria-hidden="true">{a.short}</span>
                <span class="sr-only">{ctx.labels[b]}</span>
              </th>
            ))}
          </tr>
        </thead>
        {groups.map((g: TopicGroup) => {
          const themes = g.topicIds.map(t => byTheme.get(t)).filter((r): r is UnitReading => !!r)
          if (!themes.length) return null
          const family = byFamily.get(g.id)
          return (
            <tbody key={g.id} role="rowgroup">
              {/* Une famille d'un seul thème porte le nom du thème : sa ligne suffit */}
              {g.topicIds.length > 1 ? (
                <tr class="fam-head" role="row">
                  <th scope="rowgroup" colSpan={axis.length + 1} role="rowheader">
                    {g.label}
                  </th>
                </tr>
              ) : null}
              {family ? <UnitRows unit={family} ctx={ctx} /> : null}
              {themes.map(t => (
                <UnitRows key={t.id} unit={t} ctx={ctx} />
              ))}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}

/** Une unité : sa ligne de cases, puis sa phrase et son détail */
function UnitRows({ unit, ctx }: { unit: UnitReading; ctx: ProfileCtx }) {
  const { axis, labels } = ctx
  const family = unit.kind === 'famille'
  const name = family ? T.familyHead(unit.topicIds.length) : (ctx.topicLabel.get(unit.id) ?? unit.id)
  const rowId = `u-${unit.kind}-${unit.id}`
  const fact = oneQuestionFact(unit, ctx)
  const deeper = deeperOf(unit, ctx)
  return (
    <>
      <tr class={`unit-row${family ? ' fam-row' : ''}`} role="row">
        <th scope="row" role="rowheader" id={rowId}>
          <span class="unit-name">{name}</span> <span class="unit-n">{T.onQuestions(unit.questions.length)}</span>
        </th>
        {/* Chaque case : le palier, en couleur et en mot, et sa lecture nette en mots, qui rend la couleur pleine (Tile,
            atténuée sinon) ; pour les lecteurs d'écran, un texte
            dans la case qui dit les deux (la case dessinée leur est masquée), lu en mode lecture comme en navigation de
            tableau */}
        {unit.cells.map((c, b) => (
          <td key={c.bloc} role="cell" class="mk" data-bloc={labels[b]}>
            <Tile cell={c} net />
            <span class="sr-only">{D.cellLabel(labels[b]!, c.affinity, c.mark)}</span>
          </td>
        ))}
      </tr>
      <tr class={`say${family ? ' fam-say' : ''}${unit.status === 'lecture' || unit.status === 'ecarts' ? '' : ' is-quiet'}`} role="row">
        <td colSpan={axis.length + 1} role="cell">
          <p class="say-text">
            {T.unitSentence(axis, unit)}
            {fact ? ` ${fact}` : null}
            {unit.status === 'une-question' && deeper ? (
              <>
                {' '}
                <a href={link(`/approfondir/${unit.id}`)} onClick={() => ctx.deepen([unit.id])}>
                  {T.DEEPEN_THEME}
                </a>
              </>
            ) : null}
          </p>
          <Detail unit={unit} ctx={ctx} deeper={deeper} labelledBy={rowId} id={`d-${unit.kind}-${unit.id}`} />
        </td>
      </tr>
    </>
  )
}

/** « Le détail » d'une unité : fermé par défaut, rempli à l'ouverture seulement (la page reste légère) */
function Detail({ unit, ctx, deeper, labelledBy, id }: { unit: UnitReading; ctx: ProfileCtx; deeper: boolean; labelledBy: string; id: string }) {
  const [open, setOpen] = useState(false)
  return (
    <details class="unit-detail" id={id} onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary aria-describedby={labelledBy}>
        <Icon name="chevron" class="disclosure" />
        <span class="summary-label">{D.DETAIL}</span>
      </summary>
      {open ? <DetailBody unit={unit} ctx={ctx} deeper={deeper} /> : null}
    </details>
  )
}

function DetailBody({ unit, ctx, deeper }: { unit: UnitReading; ctx: ProfileCtx; deeper: boolean }) {
  const { pack, axis, labels, names, panel, unranked, answers } = ctx
  const family = unit.kind === 'famille'
  const tested = unit.arrangements > 0
  const nameOf = (id: CandidateId) => names.get(id) ?? id
  const questions = unit.questions.map(id => pack.bank.questions.find(q => q.id === id)).filter((q): q is Question => !!q)
  // Accords sur des approches que ne porte en principal aucun candidat de l'axe
  let unplaced = 0
  for (const q of questions)
    for (const a of approvedOf(q, answers[q.id])) if (mainCarriers(pack, q.id, a).every(ids => !ids.length)) unplaced++
  const middle = (axis.length - 1) / 2
  // Ce qui pèse le plus (lot 3), à l'ouverture du détail seulement : chaque suite de blocs nettement plus près, dès que
  // son fichier est là (ui/profile/Weigh.tsx)
  const [weigh] = useWeigh()
  return (
    <div class="detail-body">
      {/* Rôles explicites : à l'étroit, chaque bloc passe en quelques lignes nommées */}
      <table class="detail-blocs" role="table">
        <thead role="rowgroup">
          <tr role="row">
            {T.DETAIL_HEADS.map(h => (
              <th key={h} scope="col" role="columnheader">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup">
          {unit.cells.map((c, b) => {
            // Sous un bloc lu nettement, quand toutes les façons ont été comptées : combien en rapprochent (ou en
            // éloignent) au moins autant que la vôtre
            const why = unit.exact && c.alike !== null && (c.mark === 'pres' || c.mark === 'loin') ? T.detailWhy(unit.ways, c.alike, c.mark) : null
            return (
              <Fragment key={c.bloc}>
                <tr role="row" class={why ? 'has-why' : undefined}>
                  <th scope="row" role="rowheader">
                    {labels[b]}
                  </th>
                  <td role="cell" data-head={T.DETAIL_HEADS[1]}>
                    {c.known.length ? T.listFr(c.known.map(nameOf)) : T.NONE_KNOWN}
                  </td>
                  <td role="cell" data-head={T.DETAIL_HEADS[2]}>
                    {c.affinity === null ? '–' : `${T.pct(c.affinity)}, ${T.palier(c.affinity)}`}
                    {c.known.length === 1 ? ` ${D.ONE_KNOWN}` : ''}
                  </td>
                  <td role="cell" data-head={T.DETAIL_HEADS[3]}>
                    {c.chance === null ? '–' : T.pct(c.chance)}
                  </td>
                  <td role="cell" data-head={T.DETAIL_HEADS[4]}>
                    {c.affinity === null || c.chance === null ? '–' : T.gap(c.affinity, c.chance, c.mark)}
                  </td>
                </tr>
                {why ? (
                  <tr role="row" class="detail-why">
                    <td role="cell" colSpan={5}>
                      {why}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {tested ? <p class="small">{T.chanceNote(unit.exact, unit.ways)}</p> : null}
      {/* Ce qui pèse le plus (lot 3, A3) : pour chaque suite de blocs nettement plus près, sa fiche, où l'approche citée est
          aussi l'approche principale de candidats de l'axe, puis la part de chaque question dans l'écart, en points */}
      {weigh ? <weigh.WeighDetail u={unit} ctx={ctx} /> : null}
      {/* Un thème prioritaire : il compte double dans le classement, pas ici (lot 2, A2) */}
      {!family && ctx.priorities.has(unit.id) ? <p class="small detail-prio">{D.PRIORITY_DETAIL}</p> : null}

      <h3 class="detail-title">{D.PER_CANDIDATE}</h3>
      <ul class="detail-people">
        {panel.map((ids, b) => (
          <li key={axis[b]!.bloc}>
            <strong>{labels[b]}</strong>&nbsp;:{' '}
            {ids
              .filter(id => id in unit.perCandidate)
              .map(id => {
                const v = unit.perCandidate[id]
                return `${nameOf(id)} ${v === null || v === undefined ? D.UNKNOWN_POSITION : T.pct(v)}${unranked.has(id) ? ` ${D.UNRANKED_FOR_YOU}` : ''}`
              })
              .join(', ')}
          </li>
        ))}
      </ul>

      <h3 class="detail-title">{D.BY_QUESTION}</h3>
      {questions.map(q => {
        const answer = answers[q.id]
        return (
          <div key={q.id} class="detail-q">
            <p class="detail-prompt">{q.prompt}</p>
            <ul class="detail-approaches">
              {q.approaches.map(a => {
                const rating = answer?.ratings[a.id] ?? 0
                const red = !!answer?.redLines.includes(a.id)
                const view = red ? D.RED_LINE_VIEW : RATING_LABELS[rating]
                // Une ligne rouge : l'approche rayée, puis qui la franchit parmi les candidats de l'axe, hors classement
                // compris (lot 2, A1)
                const by = red ? crossedBy(q.id, a.id, panel, ctx.hits) : null
                const carriers = mainCarriers(pack, q.id, a.id)
                const blocs = carriers.flatMap((ids, b) => (ids.length ? [b] : []))
                const both = blocs.some(b => b < middle) && blocs.some(b => b > middle)
                return (
                  <li key={a.id}>
                    <p class={`detail-approach${red ? ' is-struck' : ''}`}>{a.text}</p>
                    <p class="detail-meta">
                      {T.YOUR_VIEW} <strong class={red ? 'is-red' : undefined}>{view}</strong>
                    </p>
                    {by?.firm.length ? (
                      <p class="detail-cross">
                        {D.CROSSED_BY} <strong>{T.listFr(by.firm.map(nameOf))}</strong>.
                      </p>
                    ) : null}
                    {by?.possible.length ? (
                      <p class="detail-cross">
                        {D.MAYBE_CROSSED_BY} <strong>{T.listFr(by.possible.map(nameOf))}</strong>.
                      </p>
                    ) : null}
                    <p class="detail-meta">
                      {blocs.length ? (
                        <>
                          {D.MAIN_OF}{' '}
                          {blocs.map((b, i) => (
                            <span key={b}>
                              {i ? ' · ' : ''}
                              {labels[b]}&nbsp;: {T.listFr(carriers[b]!.map(nameOf))}
                            </span>
                          ))}
                          {both ? <span class="detail-both">. {D.BOTH_SIDES}</span> : null}
                        </>
                      ) : (
                        D.MAIN_OF_NONE
                      )}
                    </p>
                  </li>
                )
              })}
            </ul>
            <p class="small">
              <a href={link('/proximite')} onClick={() => focusLater(q.id)}>
                {D.SEE_IN_PROXIMITY}
              </a>
            </p>
          </div>
        )
      })}
      {unplaced ? <p class="small">{D.unplaced(unplaced, family)}</p> : null}
      {/* Comme la ligne ouverte : « Approfondir » seulement sans lecture (une seule question, des blocs inconnus), jamais
          sous un sujet lu, même « rien de net » (refusé par le propriétaire le 15 octobre 2026) */}
      {deeper && !isRead(unit) ? (
        <p class="small">
          <a href={link('/approfondir')}>Approfondir</a>
        </p>
      ) : null}
    </div>
  )
}

/** « Qui porte quoi » s'ouvrira sur cette question : la clé de session existante, effacée par la page à l'arrivée */
function focusLater(questionId: string) {
  try {
    sessionStorage.setItem('isoloir-focus', questionId)
  } catch {
    // sans stockage, on arrive simplement en haut de la page
  }
}
