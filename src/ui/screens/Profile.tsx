// « Mon profil politique » : vos réponses sur l'échiquier, thème par thème, après le dépouillement complet. Pour chaque
// thème, puis chaque famille de thèmes, et chaque bloc de la grille des nuances du ministère de l'Intérieur : vos
// réponses se rapprochent-elles nettement de ses candidats (▲ plus près), s'en écartent-elles nettement (▽ plus loin),
// ou rien de net (·) ? Le calcul (core/echiquier.ts) se fait sur l'appareil, sans IA, à l'affichage ; rien n'est
// enregistré, ni dans l'adresse.
// Une lecture, pas une étiquette (DESIGN.md, The Reading Not Label Rule) : le sujet des phrases est toujours « vos
// réponses », les blocs sont attribués à « la grille », tout est à l'encre (ni pastel ni couleur de bloc, ni vert ni
// orangé), les pourcentages ne paraissent que dans « Le détail » ; ni point, ni moyenne entre thèmes, ni synthèse
// globale. Jamais sur l'affiche ni dans le PDF.
// Fichier à part du build, chargé à la demande (ui/profile/load.ts), avec la rubrique de la Méthode qui l'explique.

import type { ComponentChildren } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { hasOpinion, RATING_LABELS } from '../../core/answers'
import { approvedCarriers, approvedOf, echiquierCached, mainCarriers, panelOf, readEchiquierAsync, type Echiquier, type Mark, type UnitReading } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import { currentAnswers } from '../../core/revisions'
import type { Results } from '../../core/score'
import { excludedIds } from '../../core/score'
import { axisOf } from '../../core/spectrum'
import type { SessionState } from '../../core/storage'
import type { Answers, CandidateId, ElectionPack, Question, SpectrumAxisBloc, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { formatDate } from '../format'
import { link } from '../nav'
import '../../styles/profile.css'

// La rubrique de la Méthode, dans le même fichier du build : la Méthode la charge à la demande
export { ProfileMethod } from '../profile/MethodSection'

interface Props {
  pack: ElectionPack
  state: SessionState
  /** Les questions du questionnaire rapide, dans l'ordre de la feuille (pour reprendre là où l'on s'est arrêté) */
  essential: Question[]
  results: Results
}

/** Ce que les lignes et leurs détails partagent */
interface Ctx {
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
}

export function Profile({ pack, state, essential, results }: Props) {
  const { election, bank, candidates } = pack
  const axis = axisOf(election) ?? []
  const answers = useMemo(() => currentAnswers(pack, state.answers), [pack, state.answers])
  const answered = bank.questions.some(q => hasOpinion(answers[q.id]))
  // Même règle que le dépouillement : tant qu'une question du questionnaire rapide n'a pas été vue, c'est une tendance
  const unseen = essential.filter(q => !state.answers[q.id])
  const provisional = unseen.length > 0
  const ready = answered && !provisional

  const [reading, setReading] = useState<Echiquier | null>(() => (ready ? echiquierCached(pack, answers) : null))
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  useEffect(() => {
    if (!ready) return
    const known = echiquierCached(pack, answers)
    if (known) {
      setReading(known)
      setStatus(T.STATUS_READY)
      return
    }
    setReading(null)
    setStatus('')
    // Le statut ne paraît qu'au-delà de 300 ms, pour éviter un éclair ; la page se rend en une fois, une fois tout lu
    const ctrl = new AbortController()
    const slow = window.setTimeout(() => setBusy(true), 300)
    readEchiquierAsync(pack, answers, ctrl.signal).then(
      r => {
        window.clearTimeout(slow)
        setBusy(false)
        setReading(r)
        setStatus(T.STATUS_READY)
      },
      () => window.clearTimeout(slow),
    )
    return () => {
      ctrl.abort()
      window.clearTimeout(slow)
    }
  }, [pack, answers, ready])

  const ctx = useMemo<Ctx>(() => {
    const blocs = new Map(election.spectrum?.blocs.map(b => [b.id, b.label]))
    return {
      pack,
      axis,
      labels: axis.map(a => blocs.get(a.bloc) ?? a.short),
      names: new Map(candidates.map(c => [c.id, c.name])),
      panel: panelOf(pack),
      unranked: new Set(results.unranked.map(r => r.candidateId)),
      answers,
      state,
      topicLabel: new Map(bank.topics.map(t => [t.id, t.label])),
    }
  }, [pack, axis, election, candidates, results, answers, state, bank])

  const quickOnly = !bank.questions.some(q => q.tier !== 'essentiel' && hasOpinion(answers[q.id]))

  if (!answered || provisional) {
    const refineHref = `/feuille/${essential.indexOf(unseen[0]!) + 1}`
    return (
      <div class="screen screen-profile">
        <FormHeader title="Résultats" right={election.shortName} />
        <main class="sheet has-margin" id="contenu" tabIndex={-1}>
          <h1 class="display is-medium" tabIndex={-1}>
            {T.PROFILE_TITLE}
          </h1>
          <p class="lede">{answered ? T.pending(unseen.length) : T.EMPTY}</p>
          <p>
            <a class="btn-primary" href={link(answered ? refineHref : '/feuille/1')}>
              {answered ? 'Continuer' : 'Commencer'}
              <Icon name="arrow-right" />
            </a>
          </p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const panelSize = ctx.panel.flat().length
  const present = new Set(candidates.map(c => c.id))
  const unscored = excludedIds(pack).filter(id => present.has(id)).length
  const source = election.spectrum?.source

  return (
    <div class="screen screen-profile">
      <FormHeader title="Résultats" right={election.shortName} />
      <main class="sheet has-margin" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          {T.PROFILE_TITLE}
        </h1>
        <p class="lede">{T.LEDE}</p>
        {/* Les positions des candidats, résumées par IA, nourrissent tout le calcul : la mention vient en tête */}
        <AiLabel kind="positions" class="profile-ai" />
        <p class="small profile-noai">{T.NO_AI}</p>

        {quickOnly ? (
          <p class="notice profile-quick">
            {T.QUICK_ONLY} <a href={link('/approfondir')}>Approfondir</a>
          </p>
        ) : null}

        <section class="profile-how" aria-labelledby="how-title">
          <h2 id="how-title" class="profile-how-title">
            {T.HOW_TITLE}
          </h2>
          <ol>
            <li>
              {T.HOW_COLUMNS[0]}
              {source ? (
                <>
                  <ExternalLink href={source.url}>{source.title}</ExternalLink>
                  {source.date ? `, ${formatDate(source.date)}` : ''}
                </>
              ) : null}
              {T.HOW_COLUMNS[1]}
              <details class="profile-who">
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="summary-label">{T.WHO_COUNTS}</span>
                </summary>
                <ul>
                  {ctx.panel.map((ids, b) => (
                    <li key={axis[b]!.bloc}>
                      <strong>{ctx.labels[b]}</strong>&nbsp;: {T.listFr(ids.map(id => ctx.names.get(id) ?? id))}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
            <li>{T.howWho(panelSize, unscored)}</li>
            <li>{T.HOW_CALC}</li>
            <li>
              <ul class="profile-legend">
                {T.HOW_MARKS.map(m => (
                  <li key={m.mark}>
                    <Glyph mark={m.mark} /> {m.text}
                  </li>
                ))}
              </ul>
              {T.HOW_NETTEMENT}
            </li>
            <li>{T.HOW_MIN}</li>
            <li>{T.HOW_NO_EFFECT}</li>
          </ol>
        </section>

        {/* Lu par les lecteurs d'écran : « Lecture en cours » au-delà de 300 ms, puis « Lecture prête. », une fois */}
        <p class={busy ? 'small profile-status' : 'sr-only'} role="status">
          {busy ? T.STATUS_BUSY : status}
        </p>

        {reading ? <Reading reading={reading} ctx={ctx} /> : null}

        <section class="profile-foot" aria-labelledby="caveats-title">
          <div class="caveats">
            <h2 id="caveats-title">{T.CAVEATS_TITLE}</h2>
            <ul>
              {T.caveats(panelSize).map(c => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p class="small">
              <a href={link('/methode/profil')}>{T.METHOD_LINK}</a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/resultats')}>
            <Icon name="arrow-left" />
            Résultats
          </a>
          <span />
          <a class="btn-primary" href={link('/proximite')}>
            Qui porte quoi
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}

/** La marque d'un bloc : le glyphe, toujours doublé de son mot (ici, le mot suit dans la phrase de la légende) */
function Glyph({ mark }: { mark: Mark }) {
  return (
    <span class={`mk-glyph is-${mark}`} aria-hidden="true">
      {T.GLYPH[mark]}
    </span>
  )
}

/**
 * La hauteur réelle de l'en-tête collant du tableau (nulle quand il est masqué, en liste) : l'élément qui reçoit le
 * focus s'arrête dessous, jamais caché par lui (WCAG 2.4.11), comme sur la page de comparaison
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

/** La synthèse et le tableau, une fois tout lu */
function Reading({ reading, ctx }: { reading: Echiquier; ctx: Ctx }) {
  const { pack, axis, topicLabel } = ctx
  const head = useRef<HTMLTableSectionElement>(null)
  useHeadHeight(head)
  const groups: readonly TopicGroup[] = pack.topicGroups?.length ? pack.topicGroups : pack.bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))
  const groupLabel = new Map(groups.map(g => [g.id, g.label]))
  const byTheme = new Map(reading.themes.map(r => [r.id, r]))
  const byFamily = new Map(reading.families.map(r => [r.id, r]))
  const names = (ids: readonly string[]) => ids.map(id => topicLabel.get(id) ?? id).join(' · ')
  const lists: [string, string[], ComponentChildren?][] = [
    [T.nothingLine(reading.nothing.length), reading.nothing],
    [T.apartLine(reading.apart.length), reading.apart],
    [T.noReadingLine(reading.noReading.length), reading.noReading],
    [
      T.unansweredLine(reading.unanswered.length),
      reading.unanswered,
      <>
        {' '}
        <a href={link('/approfondir')}>Approfondir</a>
      </>,
    ],
  ]

  return (
    <>
      <section class="block profile-summary" aria-labelledby="summary-title">
        <h2 id="summary-title">{T.SUMMARY_TITLE}</h2>
        {reading.summary.length ? (
          <dl class="summary-list">
            {reading.summary.map(g => (
              <div key={g.near.join(',')}>
                <dt>{T.groupLabel(axis, g.near)}</dt>
                <dd>
                  {g.items.map((it, i) => (
                    <span key={it.id} class="summary-item">
                      {i ? <span aria-hidden="true"> · </span> : null}
                      {i ? <span class="sr-only">, </span> : null}
                      {it.kind === 'famille' ? (
                        <>
                          {groupLabel.get(it.id)} <span class="summary-family">{T.FAMILY_WHOLE}</span>
                        </>
                      ) : (
                        topicLabel.get(it.id)
                      )}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p class="summary-empty">{T.SUMMARY_EMPTY}</p>
        )}
        <div class="summary-lists">
          {lists
            .filter(([, ids]) => ids.length)
            .map(([title, ids, extra]) => (
              <details key={title} class="summary-more">
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="summary-label">{title}</span>
                </summary>
                <p>
                  {names(ids)}
                  {extra}
                </p>
              </details>
            ))}
        </div>
        <p class="small">{T.SUMMARY_NOTE}</p>
      </section>

      <section class="block profile-table" aria-labelledby="table-title">
        <h2 id="table-title">{T.TABLE_TITLE}</h2>
        <div class="echiquier-wrap">
          {/* Rôles explicites : au téléphone, les lignes passent en grille, sans rien perdre de la lecture en tableau */}
          <table class="echiquier" role="table" style={`--blocs: ${axis.length}`}>
            <caption class="sr-only">{T.TABLE_CAPTION}</caption>
            <thead role="rowgroup" ref={head}>
              <tr role="row">
                {/* Au téléphone, masquée aux yeux seulement : chaque case de bloc garde l'en-tête de sa colonne */}
                <th scope="col" role="columnheader" class="echq-theme-head">
                  {T.TABLE_THEME}
                </th>
                {axis.map((a, b) => (
                  <th key={a.bloc} scope="col" role="columnheader">
                    <span aria-hidden="true">{a.short}</span>
                    <span class="sr-only">{ctx.labels[b]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map(g => {
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
      </section>
    </>
  )
}

/** Une unité : sa ligne de marques, puis sa phrase et son détail */
function UnitRows({ unit, ctx }: { unit: UnitReading; ctx: Ctx }) {
  const { axis, labels, pack } = ctx
  const family = unit.kind === 'famille'
  const read = unit.status !== 'une-question' && unit.status !== 'blocs-inconnus'
  const name = family ? T.familyHead(unit.topicIds.length) : (ctx.topicLabel.get(unit.id) ?? unit.id)
  const rowId = `u-${unit.kind}-${unit.id}`
  // Une seule question : ce que la personne y approuve, et qui le porte en approche principale (vrai par construction) ;
  // les accords sur une approche qui n'est l'approche principale d'aucun candidat classé sont comptés à part
  const single = unit.status === 'une-question' ? pack.bank.questions.find(q => q.id === unit.questions[0]) : undefined
  const approved = single ? approvedOf(single, ctx.answers[single.id]) : []
  const placed = single ? approved.filter(a => mainCarriers(pack, single.id, a).some(ids => ids.length)).length : 0
  const fact = single
    ? T.oneQuestion(
        axis,
        approved.length ? approvedCarriers(pack, single, ctx.answers[single.id]).map(ids => ids.map(id => ctx.names.get(id) ?? id)) : null,
        placed,
        approved.length - placed,
      )
    : null
  const deeper = !family && pack.bank.questions.some(q => q.topicId === unit.id && q.tier !== 'essentiel' && !ctx.state.answers[q.id])
  return (
    <>
      <tr class={`unit-row${family ? ' fam-row' : ''}${read ? '' : ' is-unread'}`} role="row">
        <th scope="row" role="rowheader" id={rowId}>
          <span class="unit-name">{name}</span> <span class="unit-n">{T.onQuestions(unit.questions.length)}</span>
        </th>
        {unit.cells.map((c, b) => {
          const mark = read ? c.mark : null
          return (
            <td key={c.bloc} role="cell" class={`mk${mark ? ` is-${mark}` : ''}`} data-bloc={labels[b]} aria-label={T.cellLabel(labels[b]!, mark)}>
              {mark ? (
                <>
                  <span class="mk-glyph" aria-hidden="true">
                    {T.GLYPH[mark]}
                  </span>{' '}
                  {mark === 'pres' || mark === 'loin' ? <span class="mk-word">{T.MARK_WORD[mark]}</span> : <span class="sr-only">{T.MARK_WORD[mark]}</span>}
                </>
              ) : (
                <span class="sr-only">{T.NO_READING_CELL}</span>
              )}
            </td>
          )
        })}
      </tr>
      <tr class={`say${family ? ' fam-say' : ''}${unit.status === 'lecture' || unit.status === 'ecarts' ? '' : ' is-quiet'}`} role="row">
        <td colSpan={axis.length + 1} role="cell">
          <p class="say-text">
            {T.unitSentence(axis, unit)}
            {fact ? ` ${fact}` : null}
            {unit.status === 'une-question' && deeper ? (
              <>
                {' '}
                <a href={link('/approfondir')}>{T.DEEPEN_THEME}</a>
              </>
            ) : null}
          </p>
          <Detail unit={unit} ctx={ctx} deeper={deeper} labelledBy={rowId} />
        </td>
      </tr>
    </>
  )
}

/** « Le détail » d'une unité : fermé par défaut, rempli à l'ouverture seulement (la page reste légère) */
function Detail({ unit, ctx, deeper, labelledBy }: { unit: UnitReading; ctx: Ctx; deeper: boolean; labelledBy: string }) {
  const [open, setOpen] = useState(false)
  return (
    <details class="unit-detail" onToggle={e => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary aria-describedby={labelledBy}>
        <Icon name="chevron" class="disclosure" />
        <span class="summary-label">{T.DETAIL}</span>
      </summary>
      {open ? <DetailBody unit={unit} ctx={ctx} deeper={deeper} /> : null}
    </details>
  )
}

function DetailBody({ unit, ctx, deeper }: { unit: UnitReading; ctx: Ctx; deeper: boolean }) {
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
          {unit.cells.map((c, b) => (
            <tr key={c.bloc} role="row">
              <th scope="row" role="rowheader">
                {labels[b]}
              </th>
              <td role="cell" data-head={T.DETAIL_HEADS[1]}>
                {c.known.length ? T.listFr(c.known.map(nameOf)) : T.NONE_KNOWN}
              </td>
              <td role="cell" data-head={T.DETAIL_HEADS[2]}>
                {c.affinity === null ? '–' : T.pct(c.affinity)}
                {c.known.length === 1 ? ` ${T.ONE_KNOWN}` : ''}
              </td>
              <td role="cell" data-head={T.DETAIL_HEADS[3]}>
                {c.chance === null ? '–' : T.pct(c.chance)}
              </td>
              <td role="cell" data-head={T.DETAIL_HEADS[4]}>
                {c.affinity === null || c.chance === null ? '–' : T.gap(c.affinity, c.chance, c.mark)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tested ? <p class="small">{T.chanceNote(unit.exact, unit.arrangements)}</p> : null}

      <h3 class="detail-title">{T.PER_CANDIDATE}</h3>
      <ul class="detail-people">
        {panel.map((ids, b) => (
          <li key={axis[b]!.bloc}>
            <strong>{labels[b]}</strong>&nbsp;:{' '}
            {ids
              .filter(id => id in unit.perCandidate)
              .map(id => {
                const v = unit.perCandidate[id]
                return `${nameOf(id)} ${v === null || v === undefined ? T.UNKNOWN_POSITION : T.pct(v)}${unranked.has(id) ? ` ${T.UNRANKED_FOR_YOU}` : ''}`
              })
              .join(', ')}
          </li>
        ))}
      </ul>

      <h3 class="detail-title">{T.BY_QUESTION}</h3>
      {questions.map(q => {
        const answer = answers[q.id]
        return (
          <div key={q.id} class="detail-q">
            <p class="detail-prompt">{q.prompt}</p>
            <ul class="detail-approaches">
              {q.approaches.map(a => {
                const rating = answer?.ratings[a.id] ?? 0
                const view = answer?.redLines.includes(a.id) ? T.RED_LINE_VIEW : RATING_LABELS[rating]
                const carriers = mainCarriers(pack, q.id, a.id)
                const blocs = carriers.flatMap((ids, b) => (ids.length ? [b] : []))
                const both = blocs.some(b => b < middle) && blocs.some(b => b > middle)
                return (
                  <li key={a.id}>
                    <p class="detail-approach">{a.text}</p>
                    <p class="detail-meta">
                      {T.YOUR_VIEW} <strong>{view}</strong>
                    </p>
                    <p class="detail-meta">
                      {blocs.length ? (
                        <>
                          {T.MAIN_OF}{' '}
                          {blocs.map((b, i) => (
                            <span key={b}>
                              {i ? ' · ' : ''}
                              {labels[b]}&nbsp;: {T.listFr(carriers[b]!.map(nameOf))}
                            </span>
                          ))}
                          {both ? <span class="detail-both">. {T.BOTH_SIDES}</span> : null}
                        </>
                      ) : (
                        T.MAIN_OF_NONE
                      )}
                    </p>
                  </li>
                )
              })}
            </ul>
            <p class="small">
              <a href={link('/proximite')} onClick={() => focusLater(q.id)}>
                {T.SEE_IN_PROXIMITY}
              </a>
            </p>
          </div>
        )
      })}
      {unplaced ? <p class="small">{T.unplaced(unplaced, family)}</p> : null}
      {deeper ? (
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
