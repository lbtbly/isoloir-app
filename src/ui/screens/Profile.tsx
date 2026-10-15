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
// Tant que la page ne s'affiche pas (core/profileAccess.ts : questionnaire rapide pas fini, ou aucun avis), une page
// d'attente : ce qui manque, en bâtons comme la fiche de la tendance, le bouton qui y ramène, puis un exemple fictif de la
// lecture (la grille de l'aperçu de l'accueil, avec ses mots) et ce qu'apporte ensuite « Approfondir ». Une fois la page
// affichée, tant que des thèmes ne se lisent pas seuls faute de questions, la fiche « Pour lire plus de thèmes » les
// nomme, avant le graphique : chacun mène à « Approfondir », coché, comme « Approfondir ce thème » d'une ligne ; son
// adresse (#/approfondir/<thème>) y met le thème en tête, dit ce qui est coché, et la feuille commence par lui.
// Fichier à part du build, chargé à la demande (ui/profile/load.ts), avec la rubrique de la Méthode qui l'explique.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { hasOpinion, RATING_LABELS } from '../../core/answers'
import { approvedOf, deeperTopics, echiquierCached, mainCarriers, panelOf, readEchiquierAsync, type Echiquier, type UnitReading } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import { profileAccess } from '../../core/profileAccess'
import { PROFILE_PEEK } from '../../core/resultsCopy'
import { currentAnswers } from '../../core/revisions'
import type { Results } from '../../core/score'
import { excludedIds } from '../../core/score'
import { axisOf } from '../../core/spectrum'
import type { SessionState } from '../../core/storage'
import type { CandidateId, ElectionPack, Question, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { ProgressTally } from '../components/ProgressTally'
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
  update: (patch: Partial<SessionState>) => void
}

export function Profile({ pack, state, essential, results, update }: Props) {
  const { election, bank, candidates } = pack
  const axis = axisOf(election) ?? []
  const answers = useMemo(() => currentAnswers(pack, state.answers), [pack, state.answers])
  // La règle de l'accueil et du dépouillement : toutes les questions du questionnaire rapide vues, et au moins un avis
  const access = profileAccess(bank.questions, essential, state.answers, answers, state.essentialDoneAt)
  const ready = access.state === 'pret'
  // « Approfondir ce thème » : le thème rejoint ceux déjà cochés dans « Approfondir » (le champ que la page écrit à chaque
  // case cochée ; rien n'est décoché, rien d'autre n'est enregistré)
  const deepen = (ids: string[]) => update({ deepTopics: [...new Set([...state.deepTopics, ...ids])] })

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
    // Le statut ne paraît qu'au-delà de 300 ms, pour éviter un éclair (le calcul laisse passer cette minuterie, voir
    // readEchiquierAsync) ; la page se rend en une fois, une fois tout lu
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
      deepen,
    }
  }, [pack, axis, election, candidates, results, answers, state, bank])

  const quickOnly = !bank.questions.some(q => q.tier !== 'essentiel' && hasOpinion(answers[q.id]))
  const deeper = useMemo(() => deeperTopics(pack, answers, state.answers), [pack, answers, state.answers])

  // « Voir le détail » d'une ligne : le tableau replié s'ouvre, puis le détail de l'unité, qui reçoit le focus
  const all = useRef<HTMLDetailsElement>(null)
  const openDetail = (u: UnitReading) => {
    if (all.current) all.current.open = true
    const d = document.getElementById(`d-${u.kind}-${u.id}`) as HTMLDetailsElement | null
    if (!d) return
    d.open = true
    requestAnimationFrame(() => d.querySelector('summary')?.focus())
  }

  if (access.state !== 'pret') return <Waiting pack={pack} wait={access.state} seen={access.seen} total={access.total} left={access.left} added={access.added} href={access.href} />

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

        {deeper.thin.length || deeper.none.length ? <Deeper deeper={deeper} quickOnly={quickOnly} ctx={ctx} /> : null}

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

/** Les cinq paliers de l'exemple, de « très éloigné » à « très proche » : une affinité au milieu de chacun */
const EXAMPLE_AFFINITY = [10, 30, 50, 70, 90]

/**
 * La page d'attente : la fiche d'état (comme « Où vous en êtes » de la tendance, dont elle reprend les styles), le bouton
 * qui ramène aux questions, puis l'exemple fictif, une grille de 3 sujets sur les 5 blocs, aux cases de la page et à leurs
 * mots, et ce qu'apporte ensuite « Approfondir »
 */
function Waiting({ pack, wait, seen, total, left, added, href }: { pack: ElectionPack; wait: T.WaitState; seen: number; total: number; left: number; added: boolean; href: string }) {
  const axis = axisOf(pack.election) ?? []
  const rows = [0, 1, 2].map(r => [...PROFILE_PEEK.slice(r * 5, r * 5 + 5)].map(Number))
  return (
    <div class="screen screen-wide screen-profile">
      <FormHeader title="Résultats" right={pack.election.shortName} />
      <main class="sheet wide-sheet profile-sheet" id="contenu" tabIndex={-1}>
        <div class="wait-hero">
          <div class="wait-intro">
            <h1 class="display is-medium" tabIndex={-1}>
              {T.PROFILE_TITLE}
            </h1>
            <p class="lede">{T.LEDE}</p>
          </div>
          <section class="trend profile-wait" aria-labelledby="wait-title">
            <h2 id="wait-title" class="trend-title">
              <span class="trend-where">{T.WAIT_WHERE[wait]}</span>{' '}
              <span class="trend-count">
                <span class="trend-figure">{seen}</span> {T.waitCount(seen, total)}
              </span>
            </h2>
            <ProgressTally done={seen} total={total} />
            <p class="trend-text">{T.waitText(wait, total, left, added)}</p>
            <a class="btn-primary is-wide trend-cta" href={link(href)}>
              {T.waitCta(wait, left)}
              <Icon name="arrow-right" />
            </a>
          </section>
        </div>

        <section class="profile-example" aria-labelledby="example-title">
          <h2 id="example-title">{T.EXAMPLE_TITLE}</h2>
          <p class="ex-note">{T.EXAMPLE_NOTE}</p>
          {/* Une illustration, masquée aux lecteurs d'écran : la mention et la phrase des couleurs disent ce qu'elle montre */}
          <div class="ex-grid" aria-hidden="true">
            <div class="ex-head">
              <span />
              {axis.map(a => (
                <span key={a.bloc}>{a.short}</span>
              ))}
            </div>
            {rows.map((row, r) => (
              <div key={r} class="ex-row">
                <span class="ex-name">{T.exampleRow(r + 1)}</span>
                {row.map((d, b) => (
                  <span key={b} class="ex-cell" data-bloc={axis[b]?.short}>
                    <Tile cell={{ affinity: EXAMPLE_AFFINITY[d - 1]!, mark: 'rien' }} />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p class="ex-key">{T.KEY_TEXT}</p>
        </section>

        <p class="wait-deepen">
          <Icon name="deepen" />
          <span>{T.WAIT_DEEPEN}</span>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}

/**
 * Pour lire plus de thèmes : ceux d'une seule question, puis ceux sans réponse, qui ont encore des questions
 * approfondies ; chacun mène à « Approfondir », coché ; puis le choix libre des thèmes
 */
function Deeper({ deeper, quickOnly, ctx }: { deeper: { thin: string[]; none: string[] }; quickOnly: boolean; ctx: ProfileCtx }) {
  // En grand écran, la place ne manque pas : la longue liste est ouverte d'emblée
  const [wide] = useState(() => matchMedia('(min-width: 64rem)').matches)
  // Le séparateur reste collé au thème qui le précède : une ligne ne commence jamais par lui
  const list = (ids: string[]) => (
    <span class="deeper-topics">
      {ids.map((id, i) => (
        <span key={id}>
          {/* Le nom lu commence par l'action, puis le nom visible du thème */}
          <a href={link(`/approfondir/${id}`)} onClick={() => ctx.deepen([id])} aria-label={`${T.DEEPER_THEME} ${ctx.topicLabel.get(id) ?? id}`}>
            {ctx.topicLabel.get(id) ?? id}
          </a>
          {i < ids.length - 1 ? '\u00a0· ' : null}
        </span>
      ))}
    </span>
  )
  return (
    <section class="profile-deeper" aria-labelledby="deeper-title">
      <div class="deeper-head">
        <h2 id="deeper-title">
          <Icon name="deepen" class="deeper-icon" />
          {T.DEEPER_TITLE}
        </h2>
        <p>{T.deeperLede(quickOnly)}</p>
      </div>
      <div class="deeper-lists">
        {deeper.none.length ? (
          <p>
            <strong>{T.unansweredLine(deeper.none.length)}</strong>
            {list(deeper.none)}
          </p>
        ) : null}
        {/* Une longue liste se replie derrière son compte, la fiche reste courte avant le graphique */}
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
    </section>
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
      {tested ? <p class="small">{T.chanceNote(unit.exact, unit.ways)}</p> : null}

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
