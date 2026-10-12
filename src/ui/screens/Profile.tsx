// « Mon profil politique » : vos réponses sur l'échiquier, sujet par sujet, après le dépouillement complet. Pour chaque
// thème (ou sa famille, quand aucun de ses thèmes ne se lit seul) et chaque bloc de la grille des nuances du ministère
// de l'Intérieur : votre affinité moyenne avec ses candidats, en couleur, et vos réponses s'en rapprochent-elles
// nettement, s'en écartent-elles nettement, ou rien de net ? Le calcul (core/echiquier.ts) se fait sur l'appareil, sans
// IA, à l'affichage ; rien n'est enregistré, ni dans l'adresse.
// La page, sur toute la largeur comme le dépouillement : le titre et la mention IA en tête ; « Sujet par sujet », le
// graphique, une ligne par sujet lu (ui/profile/Chart.tsx) ; « À garder en tête » ; puis « Le détail, sujet par
// sujet », le tableau complet de chaque unité, replié.
// Une lecture, pas une étiquette (DESIGN.md, The Reading Not Label Rule) : le sujet des phrases est toujours « vos
// réponses », les blocs sont attribués à « la grille » ; les blocs n'ont pas de couleur : chaque case prend celle de
// l'échelle d'affinité du site (décision du propriétaire du 12 octobre 2026), jamais seule, toujours avec le mot de son
// palier ; aucun symbole de lecture, les mots « nettement plus près » et « nettement plus loin » ; les pourcentages ne
// paraissent que dans « Le détail » et dans la liste d'une ligne ouverte ; ni point, ni moyenne entre thèmes, ni
// synthèse globale. Jamais sur l'affiche ni dans le PDF.
// Fichier à part du build, chargé à la demande (ui/profile/load.ts), avec la rubrique de la Méthode qui l'explique.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { hasOpinion, RATING_LABELS } from '../../core/answers'
import { approvedOf, echiquierCached, mainCarriers, panelOf, readEchiquierAsync, type Echiquier, type UnitReading } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import { currentAnswers } from '../../core/revisions'
import type { Results } from '../../core/score'
import { excludedIds } from '../../core/score'
import { axisOf } from '../../core/spectrum'
import type { SessionState } from '../../core/storage'
import type { CandidateId, ElectionPack, Question, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { link } from '../nav'
import { Chart, deeperOf, oneQuestionFact, Tile, type ProfileCtx } from '../profile/Chart'
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

  const ctx = useMemo<ProfileCtx>(() => {
    const blocs = new Map(election.spectrum?.blocs.map(b => [b.id, b]))
    const present = new Set(candidates.map(c => c.id))
    return {
      pack,
      axis,
      labels: axis.map(a => blocs.get(a.bloc)?.label ?? a.short),
      names: new Map(candidates.map(c => [c.id, c.name])),
      panel: panelOf(pack),
      unranked: new Set(results.unranked.map(r => r.candidateId)),
      answers,
      state,
      topicLabel: new Map(bank.topics.map(t => [t.id, t.label])),
      groups: pack.topicGroups?.length ? pack.topicGroups : bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
      unscored: excludedIds(pack).filter(id => present.has(id)).length,
    }
  }, [pack, axis, election, candidates, results, answers, state, bank])

  const quickOnly = !bank.questions.some(q => q.tier !== 'essentiel' && hasOpinion(answers[q.id]))

  // « Voir le détail » d'une ligne : le tableau replié s'ouvre, puis le détail de l'unité, qui reçoit le focus
  const all = useRef<HTMLDetailsElement>(null)
  const openDetail = (u: UnitReading) => {
    if (all.current) all.current.open = true
    const d = document.getElementById(`d-${u.kind}-${u.id}`) as HTMLDetailsElement | null
    if (!d) return
    d.open = true
    requestAnimationFrame(() => d.querySelector('summary')?.focus())
  }

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

  const units = reading ? reading.themes.length + reading.families.length : 0

  return (
    <div class="screen screen-wide screen-profile">
      <FormHeader title="Résultats" right={election.shortName} />
      <main class="sheet wide-sheet profile-sheet" id="contenu" tabIndex={-1}>
        <div class="profile-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            {T.PROFILE_TITLE}
          </h1>
          <div class="profile-intro-text">
            <p class="lede">{T.LEDE}</p>
            {/* Les positions des candidats, résumées par IA, nourrissent tout le calcul : la mention vient en tête */}
            <AiLabel kind="positions" class="profile-ai" />
            <p class="small profile-noai">{T.NO_AI}</p>
          </div>
        </div>

        {quickOnly ? (
          <p class="notice profile-quick">
            {T.QUICK_ONLY} <a href={link('/approfondir')}>Approfondir</a>
          </p>
        ) : null}

        {/* Lu par les lecteurs d'écran : « Lecture en cours » au-delà de 300 ms, puis « Lecture prête. », une fois */}
        <p class={busy ? 'small profile-status' : 'sr-only'} role="status">
          {busy ? T.STATUS_BUSY : status}
        </p>

        {reading ? <Chart reading={reading} ctx={ctx} quickOnly={quickOnly} onDetail={openDetail} /> : null}

        <section class="profile-keep" aria-labelledby="keep-title">
          <h2 id="keep-title">{T.CAVEATS_TITLE}</h2>
          <ul>
            {T.caveats(ctx.panel.flat().length).map(c => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p class="small">
            <a href={link('/methode/profil')}>{T.METHOD_LINK}</a>
          </p>
        </section>

        {reading ? (
          <section class="profile-detail" aria-labelledby="detail-title">
            <h2 id="detail-title">{T.DETAIL_TITLE}</h2>
            <p>{T.DETAIL_INTRO}</p>
            <details class="profile-all" ref={all}>
              <summary>{T.detailShow(units)}</summary>
              <DetailTable reading={reading} ctx={ctx} />
            </details>
          </section>
        ) : null}
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

/** Le tableau complet, famille par famille : chaque unité, ses marques, sa phrase et son détail */
function DetailTable({ reading, ctx }: { reading: Echiquier; ctx: ProfileCtx }) {
  const { axis, groups } = ctx
  const head = useRef<HTMLTableSectionElement>(null)
  useHeadHeight(head)
  const byTheme = new Map(reading.themes.map(r => [r.id, r]))
  const byFamily = new Map(reading.families.map(r => [r.id, r]))
  return (
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
        {/* Chaque case : le palier, en couleur et en mot, et sa lecture nette en mots ; pour les lecteurs d'écran, un texte
            dans la case qui dit les deux (la case dessinée leur est masquée), lu en mode lecture comme en navigation de
            tableau */}
        {unit.cells.map((c, b) => (
          <td key={c.bloc} role="cell" class="mk" data-bloc={labels[b]}>
            <Tile cell={c} net />
            <span class="sr-only">{T.cellLabel(labels[b]!, c.affinity, c.mark)}</span>
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
                <a href={link('/approfondir')}>{T.DEEPEN_THEME}</a>
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
        <span class="summary-label">{T.DETAIL}</span>
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
                {c.affinity === null ? '–' : `${T.pct(c.affinity)}, ${T.palier(c.affinity)}`}
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
