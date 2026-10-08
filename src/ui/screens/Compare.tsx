// « Comparer » : deux à quatre candidats côte à côte, comme dans le comparateur d'un site marchand. Un vrai tableau :
// une colonne par candidat, sous un en-tête qui reste collé pendant le défilement ; une ligne par question, rangée par
// thème et par famille de thèmes ; dans chaque case, la position du candidat en clair (le texte de son approche).
// La relation se lit dans la ligne : même approche (même repère, même fond), approche jugée compatible, opposition
// (l'un rejette explicitement ce qu'un autre propose), position inconnue. Déplier un thème ajoute, dans chaque case,
// le résumé de chaque position (rédigé par IA) et ses sources.
// Une lecture des positions publiées (core/compare.ts), pas un score : les réponses de la personne n'y entrent pas,
// rien n'est pondéré ni classé, et les candidats restent dans l'ordre qu'elle a choisi (l'adresse
// #/comparer/<id>,<id>… le garde et se partage). Une position inconnue est dite inconnue, jamais devinée.
// Mise en page (compare.css), selon la place mesurée (useLayout) : en grand écran, le tableau complet, la question dans
// une colonne à gauche ; plus étroit, la question en pleine largeur et les cases en colonnes dessous ; très étroit
// (texte agrandi), les cases l'une sous l'autre, chacune nommant son candidat. Les éléments du tableau changent alors
// d'affichage (grille, bloc) : leurs rôles sont écrits en toutes lettres pour que le tableau reste un tableau pour
// les lecteurs d'écran (en-têtes de colonne : les candidats ; en-têtes de ligne : les thèmes et les questions).

import { Fragment } from 'preact'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks'
import { compareTable, type CandidateOverview, type QuestionRow, type RowCell, type TopicTable } from '../../core/compare'
import { seededShuffle } from '../../core/rng'
import { comparePath } from '../../core/routes'
import { isExcluded, knownQuestions } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { Candidate, ElectionPack, Position, Question, Source, Topic, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ExternalLink } from '../components/ExternalLink'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { Portrait } from '../components/Portrait'
import { SiteFooter } from '../components/SiteFooter'
import { LEGEND, Mark, ROW, ROW_HELP, rowLabel, rowSays, type Say } from '../compare/Relation'
import { MAX_COMPARED, MAX_COMPARED_WORDS, setSelection } from '../compare/selection'
import { CompareBar, CompareToggle } from '../compare/Tray'
import { formatDate, hostOf } from '../format'
import { isMany } from '../many'
import { link, rewrite } from '../nav'
import '../../styles/compare.css'

interface Props {
  pack: ElectionPack
  /** Les candidats de l'adresse, dans son ordre (inconnus et surnombre compris : l'écran les écarte et le dit) */
  ids: string[]
  state: SessionState
}

/** Ce qui est affiché : tout, seulement les différences, seulement les oppositions radicales */
type Mode = 'all' | 'diff' | 'opp'

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'all', label: 'Tout' },
  { mode: 'diff', label: 'Seulement les différences' },
  { mode: 'opp', label: 'Seulement les oppositions radicales' },
]

/** Les lignes que garde un filtre. Les différences : toute ligne connue où tous ne portent pas la même approche
 *  (points communs, approches différentes, opposition), comme un comparateur masque les lignes identiques */
const matches = (row: QuestionRow, mode: Mode) =>
  mode === 'all' || (mode === 'opp' ? row.kind === 'opposed' : row.kind !== 'same' && row.kind !== 'unknown')

const NATURE: Record<Position['nature'], string> = {
  proposition: 'proposition',
  declaration: 'déclaration',
  inference: 'déduction (vote ou texte signé)',
}

const plural = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`
/** Nom court, pour les phrases et les colonnes étroites : tout ce qui suit le prénom (« Le Pen », « Ébauche-Lemoine ») */
const shortName = (c: Candidate) => c.name.split(' ').slice(1).join(' ') || c.name
/** « Faure », « Faure et Royal », « Faure, Royal et Maurel » */
const names = (list: string[]) => (list.length < 2 ? (list[0] ?? '') : `${list.slice(0, -1).join(', ')} et ${list[list.length - 1]}`)
/** « de », « d’ » devant un nom : l'élision devant une voyelle */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöûüœæ]/i.test(name) ? 'd’' : 'de ')
/** « de Faure », « d’Exemple » */
const of = (name: string) => `${de(name)}${name}`
/** Repère d'un groupe de même approche, dans l'ordre des colonnes : A, B… */
const markOf = (group: number) => String.fromCharCode(65 + group)

export function Compare({ pack, ids: asked, state }: Props) {
  const { election, candidates } = pack
  const byId = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const askedKey = asked.join(',')
  const valid = asked.filter(id => byId.has(id))
  // La liste vient de l'adresse ; une modification faite sur place (déplacer, retirer, ajouter) la remplace, tant que
  // l'adresse lue reste la même (l'adresse affichée, elle, suit déjà : rewrite). Dérivée au rendu, sans effet : à
  // l'arrivée d'une nouvelle adresse, l'écran s'affiche d'emblée avec ses candidats, et le focus va à son titre.
  const [edits, setEdits] = useState<{ key: string; order: string[] } | null>(null)
  const edited = !!edits && edits.key === askedKey
  const order = edited ? edits.order : valid.slice(0, MAX_COMPARED)
  const orderKey = order.join(',')
  const [status, setStatus] = useState('')
  const focusNext = useRef<string | null>(null)

  // Le plateau des pages candidats reprend la liste comparée
  useEffect(() => setSelection(election.id, orderKey ? orderKey.split(',') : []), [election.id, orderKey])

  // Après un déplacement, un retrait ou un ajout, le focus reprend là où il a un sens (data-focus) : la même flèche,
  // ou l'autre quand le candidat arrive au bout ; sinon le titre de la rangée des candidats
  useEffect(() => {
    const key = focusNext.current
    if (!key) return
    focusNext.current = null
    const other = key.endsWith(':left') ? key.replace(/:left$/, ':right') : key.endsWith(':right') ? key.replace(/:right$/, ':left') : null
    const usable = (k: string | null) => {
      const el = k ? document.querySelector<HTMLButtonElement>(`[data-focus="${k}"]`) : null
      return el && !el.disabled ? el : null
    }
    // Plus qu'un candidat : l'écran revient au choix, le focus à son titre
    const title = key === 'title' ? document.querySelector<HTMLElement>('main h1') : null
    ;(title ?? usable(key) ?? usable(other) ?? document.getElementById('cmp-lineup-title'))?.focus()
  }, [orderKey])

  /** Change la liste sur place : l'adresse suit, sans nouvelle entrée d'historique ni retour en haut de page */
  const apply = (next: string[], message: string, focus: string | null) => {
    focusNext.current = focus
    setEdits({ key: askedKey, order: next })
    rewrite(comparePath(next))
    setStatus(message)
  }

  const people = order.map(id => byId.get(id)!).filter(Boolean)
  const strangers = edited ? [] : asked.filter(id => !byId.has(id))
  const extra = edited ? [] : valid.slice(MAX_COMPARED)
  const notices = (
    <>
      {strangers.length ? (
        <p class="notice" role="status">
          {strangers.length > 1 ? 'Candidats inconnus dans l’adresse, écartés' : 'Candidat inconnu dans l’adresse, écarté'}
          &nbsp;: {strangers.join(', ')}.
        </p>
      ) : null}
      {extra.length ? (
        <p class="notice" role="status">
          On compare {MAX_COMPARED_WORDS}&nbsp;candidats au plus&nbsp;: les {MAX_COMPARED_WORDS} premiers de l’adresse sont gardés (
          {extra.map(id => byId.get(id)?.name).join(', ')} {extra.length > 1 ? 'restent' : 'reste'} de côté).
        </p>
      ) : null}
    </>
  )

  const bar = (
    <CompareBar pack={pack} tray={people.length < 2}>
      <a class="btn-text" href={link('/candidats')}>
        <Icon name="arrow-left" />
        <span class="btn-label">Les candidats</span>
      </a>
      <span />
      <a class="btn-primary" href={link('/feuille/1')}>
        Commencer la feuille
        <Icon name="arrow-right" />
      </a>
    </CompareBar>
  )

  if (people.length < 2) {
    return (
      <div class="screen screen-wide screen-compare">
        <FormHeader title="Comparer" right={election.shortName} />
        <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
          <Picker pack={pack} state={state} notices={notices} />
        </main>
        <SiteFooter />
        {bar}
      </div>
    )
  }

  return (
    <div class="screen screen-wide screen-compare">
      <FormHeader title="Comparer" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class="wide-hero cmp-hero">
          <h1 class="display is-medium" tabIndex={-1}>
            Comparer
          </h1>
          <div>
            <p class="lede">Ce que chacun propose, question par question, et où leurs positions se rejoignent ou s’opposent.</p>
            <p class="small">
              Une lecture de leurs positions publiées, l’une par rapport à l’autre&nbsp;: ni un jugement, ni un score.
              Vos réponses n’y entrent pas, et les candidats restent dans l’ordre que vous avez choisi.
            </p>
            {/* Les approches et les positions se lisent ici d'emblée : la mention vient en tête de page */}
            <AiLabel kind="positions" class="cmp-ai" />
          </div>
        </div>
        {notices}
        <Board pack={pack} state={state} people={people} order={order} apply={apply} />
        <p class="sr-only" role="status">
          {status}
        </p>
      </main>
      <SiteFooter />
      {bar}
    </div>
  )
}

/** Moins de deux candidats : on les choisit, comme sur la page des candidats (même plateau) */
function Picker({ pack, state, notices }: { pack: ElectionPack; state: SessionState; notices: preact.ComponentChildren }) {
  const { candidates, election } = pack
  const people = useMemo(() => seededShuffle(candidates, `${state.seed}:people`), [candidates, state.seed])
  return (
    <>
      <div class="wide-hero cmp-hero">
        <h1 class="display is-medium" tabIndex={-1}>
          Comparer
        </h1>
        <div>
          <p class="lede">
            Choisissez de deux à {MAX_COMPARED_WORDS}&nbsp;candidats&nbsp;: leurs positions côte à côte, question par question,
            et ce qui les rapproche ou les oppose.
          </p>
          <p class="small">
            Une lecture de leurs positions publiées, pas un score&nbsp;: vos réponses n’y entrent pas. Les candidats sont
            présentés ici dans un ordre tiré au hasard&nbsp;; la comparaison garde l’ordre de votre choix.
          </p>
        </div>
      </div>
      {notices}
      <ul class={`cmp-choose${isMany(people.length) ? ' is-many' : ''}`} aria-label="Candidats, dans un ordre tiré au hasard">
        {people.map(c => (
          <li key={c.id}>
            <CompareToggle electionId={election.id} candidate={c} class="cmp-choice">
              <Portrait candidate={c} size="row" decorative />
              <span class="cmp-choice-id">
                <span class="cmp-choice-name">{c.name}</span>
                <span class="cmp-choice-party">{c.affiliation}</span>
              </span>
            </CompareToggle>
          </li>
        ))}
      </ul>
    </>
  )
}

/**
 * Mise en page du tableau, selon la largeur mesurée en rem (elle suit donc le texte agrandi) :
 * - 'table' : le tableau complet, les questions dans une colonne à gauche ;
 * - 'cols'  : la question en pleine largeur, les cases en colonnes dessous (le motif des comparateurs mobiles) ;
 * - 'list'  : trop étroit pour des colonnes lisibles, les cases l'une sous l'autre, chacune nommant son candidat.
 * En colonnes, « narrow » (moins de 9.5rem par candidat) resserre le corps et coupe les mots, « tight » (moins de
 * 6.5rem) plus encore.
 */
type Layout = 'table' | 'cols' | 'list'

interface Fit {
  layout: Layout
  narrow: boolean
  tight: boolean
}

/** Largeur (rem) à partir de laquelle la colonne des questions tient à gauche, selon le nombre de candidats */
const TABLE_FROM: Record<number, number> = { 2: 40, 3: 50, 4: 56 }
/** Largeur minimale d'une colonne de candidat (rem) pour garder les cases côte à côte */
const COLUMN_MIN = 5.25

function useLayout(target: { current: HTMLElement | null }, n: number): Fit {
  const [fit, setFit] = useState<Fit>({ layout: 'cols', narrow: false, tight: false })
  useLayoutEffect(() => {
    const el = target.current
    if (!el) return
    const measure = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      const width = el.clientWidth / rem
      const layout: Layout = width >= (TABLE_FROM[n] ?? 56) ? 'table' : width >= n * COLUMN_MIN ? 'cols' : 'list'
      const column = width / n
      const next = { layout, narrow: layout === 'cols' && column < 9.5, tight: layout === 'cols' && column < 6.5 }
      setFit(f => (f.layout === next.layout && f.narrow === next.narrow && f.tight === next.tight ? f : next))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [target, n])
  return fit
}

/** La hauteur réelle de l'en-tête collant du tableau, pour que l'élément qui reçoit le focus ne passe pas dessous */
function useHeadHeight(root: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const head = root.current?.querySelector('thead')
    const html = document.documentElement
    if (!head || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => html.style.setProperty('--cmp-head', `${head.getBoundingClientRect().height}px`))
    ro.observe(head)
    return () => {
      ro.disconnect()
      html.style.removeProperty('--cmp-head')
    }
  }, [root])
}

interface BoardProps {
  pack: ElectionPack
  state: SessionState
  people: Candidate[]
  order: string[]
  apply: (next: string[], message: string, focus: string | null) => void
}

/** La comparaison : les candidats, puis le tableau */
function Board({ pack, state, people, order, apply }: BoardProps) {
  const { bank } = pack
  const n = people.length
  const table = useMemo(() => compareTable(order, pack), [order, pack])
  const families: TopicGroup[] = useMemo(
    () => pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
    [pack.topicGroups, bank.topics],
  )
  const topicOf = useMemo(() => new Map(table.topics.map(t => [t.topicId, t])), [table])
  const questions = useMemo(() => new Map(bank.questions.map(q => [q.id, q])), [bank.questions])

  const [mode, setMode] = useState<Mode>('all')
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set())
  const [said, setSaid] = useState('')

  const shownIn = (m: Mode) =>
    families
      .map(f => ({ family: f, topics: f.topicIds.map(id => topicOf.get(id)).filter((t): t is TopicTable => !!t && t.rows.some(r => matches(r, m))) }))
      .filter(f => f.topics.length)
  const countIn = (m: Mode) => table.topics.reduce((t, x) => t + x.rows.filter(r => matches(r, m)).length, 0)
  const shownFamilies = shownIn(mode)
  const shownTopics = shownFamilies.flatMap(f => f.topics)
  const shownQuestions = countIn(mode)
  const allOpen = shownTopics.length > 0 && shownTopics.every(t => open.has(t.topicId))

  const pickMode = (m: Mode) => {
    setMode(m)
    const topics = shownIn(m).flatMap(f => f.topics)
    const qs = countIn(m)
    // Les oppositions radicales sont peu nombreuses : on les montre dépliées, avec leurs résumés et leurs sources
    if (m === 'opp') setOpen(new Set(topics.map(t => t.topicId)))
    setSaid(
      topics.length
        ? `${plural(qs, 'question')} affichée${qs > 1 ? 's' : ''}, dans ${plural(topics.length, 'thème')}.`
        : m === 'opp'
          ? 'Aucune opposition radicale entre ces candidats.'
          : 'Aucune différence connue entre ces candidats.',
    )
  }
  const toggle = (id: string) =>
    setOpen(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const root = useRef<HTMLDivElement>(null)
  const { layout, narrow, tight } = useLayout(root, n)
  useHeadHeight(root)
  const c = table.counts
  const someUnknown = table.topics.reduce((t, x) => t + x.rows.filter(r => r.cells.some(cell => !cell.known)).length, 0)

  return (
    <div class={`cmp n-${n} is-${layout}${narrow ? ' is-narrow' : ''}${tight ? ' is-tight' : ''}`} style={{ '--n': n }} ref={root}>
      <Lineup pack={pack} state={state} people={people} order={order} apply={apply} />

      <section class="cmp-topics" aria-labelledby="cmp-topics-title">
        <h2 id="cmp-topics-title" class="section-title">
          Question par question
        </h2>
        <p class="cmp-headline">
          Sur les {table.total}&nbsp;questions&nbsp;: même approche{n === 2 ? '' : ' pour tous'} sur {c.same || 'aucune'}, opposition
          radicale sur {c.opposed || 'aucune'}
          {someUnknown ? `, ${n === 2 ? 'une position inconnue' : 'au moins une position inconnue'} sur ${someUnknown}` : ''}.
        </p>
        <div class="cmp-tools">
          <div class="segmented cmp-modes" role="group" aria-label="Questions affichées">
            {MODES.map(m => (
              <button key={m.mode} type="button" aria-pressed={mode === m.mode} onClick={() => pickMode(m.mode)}>
                {m.label} <span class="cmp-mode-n">({countIn(m.mode)})</span>
              </button>
            ))}
          </div>
          {shownTopics.length ? (
            <button type="button" class="btn-text cmp-all" onClick={() => setOpen(allOpen ? new Set() : new Set(shownTopics.map(t => t.topicId)))}>
              <Icon name="chevron" class={`disclosure${allOpen ? ' is-open' : ''}`} />
              {allOpen ? 'Tout replier' : 'Tout déplier'}
            </button>
          ) : null}
        </div>
        <p class="cmp-count small">
          {shownTopics.length
            ? `${plural(shownQuestions, 'question')}${mode === 'all' ? '' : mode === 'diff' ? ' où leurs approches diffèrent' : ' où l’un rejette ce qu’un autre propose'}, dans ${plural(shownTopics.length, 'thème')}. Déplier un thème montre le résumé de chaque position et ses sources.`
            : mode === 'opp'
              ? 'Aucune opposition radicale entre ces candidats\u00a0: aucun ne rejette explicitement ce qu’un autre propose.'
              : 'Aucune différence connue entre ces candidats.'}
        </p>
        <p class="sr-only" role="status">
          {said}
        </p>
        <HowToRead />

        <table class="cmp-table" role="table">
          <caption class="sr-only">
            Comparaison {of(names(people.map(p => p.name)))}, question par question&nbsp;: une colonne par candidat, dans l’ordre
            choisi.
          </caption>
          <colgroup>
            <col class="cmp-col-q" />
            {people.map(p => (
              <col key={p.id} />
            ))}
          </colgroup>
          <thead role="rowgroup">
            <tr role="row">
              <td role="cell" class="cmp-corner">
                <span>Question</span>
              </td>
              {people.map(p => (
                <th key={p.id} scope="col" role="columnheader" class="cmp-colhead">
                  <span class="cmp-colhead-in">
                    <Portrait candidate={p} size="small" decorative />
                    <span class="cmp-colhead-name">
                      <span class="cmp-name-full">{p.name}</span>
                      <span class="cmp-name-short" aria-hidden="true">
                        {shortName(p)}
                      </span>
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <Overview overview={table.overview} people={people} total={table.total} />

          {shownFamilies.map(({ family, topics }) => [
            <tbody key={`f:${family.id}`} class="cmp-family" role="rowgroup">
              <tr role="row">
                <th colSpan={n + 1} scope="rowgroup" role="rowheader" class="cmp-family-cell">
                  <h3 class="cmp-family-title">{family.label}</h3>
                </th>
              </tr>
            </tbody>,
            ...topics.map(t => (
              <TopicRows
                key={`t:${t.topicId}`}
                data={t}
                topic={bank.topics.find(x => x.id === t.topicId)!}
                people={people}
                pack={pack}
                questions={questions}
                solo={family.topicIds.length === 1 && family.label === bank.topics.find(x => x.id === t.topicId)?.label}
                mode={mode}
                open={open.has(t.topicId)}
                onToggle={() => toggle(t.topicId)}
              />
            )),
          ])}
        </table>
      </section>
    </div>
  )
}

/** Les candidats comparés, dans l'ordre choisi : déplacer, retirer, ajouter */
function Lineup({ pack, state, people, order, apply }: BoardProps) {
  const n = people.length
  const move = (i: number, by: -1 | 1) => {
    const next = [...order]
    const [c] = next.splice(i, 1)
    next.splice(i + by, 0, c!)
    const who = people[i]!
    apply(next, `${who.name} : colonne ${i + by + 1} sur ${n}.`, `${who.id}:${by < 0 ? 'left' : 'right'}`)
  }
  const remove = (i: number) => {
    const who = people[i]!
    const next = order.filter(id => id !== who.id)
    const neighbour = people[i + 1] ?? people[i - 1]
    apply(
      next,
      `Retrait de la comparaison\u00a0: ${who.name}. ${next.length >= 2 ? `${plural(next.length, 'candidat')} comparés.` : 'Choisissez au moins un autre candidat.'}`,
      next.length >= 2 && neighbour ? `${neighbour.id}:remove` : 'title',
    )
  }
  return (
    <section class="cmp-lineup-wrap" aria-labelledby="cmp-lineup-title">
      <div class="cmp-lineup-head">
        <h2 id="cmp-lineup-title" tabIndex={-1}>
          Les candidats comparés
        </h2>
        <p>Dans l’ordre de votre choix&nbsp;; les flèches le changent.</p>
      </div>
      <ol class="cmp-lineup">
        {people.map((c, i) => (
          <li key={c.id} class="cmp-card">
            <Portrait candidate={c} size="small" decorative />
            <span class="cmp-card-id">
              <a class="cmp-card-name" href={link(`/candidat/${c.id}`)}>
                {c.name}
              </a>
              <span class="cmp-card-party">{c.affiliation}</span>
              {/* Non classé (election.ranking.excluded) : un repère discret, le même pour chacun */}
              {isExcluded(pack, c.id) ? (
                <span class="cmp-card-unscored">
                  Non classé dans les résultats&nbsp;: positions connues sur {knownQuestions(pack, c.id)} des{' '}
                  {pack.bank.questions.length}&nbsp;questions
                </span>
              ) : null}
            </span>
            <span class="cmp-card-tools">
              <button
                type="button"
                class="cmp-tool"
                data-focus={`${c.id}:left`}
                disabled={i === 0}
                aria-label={`Déplacer ${c.name} vers la gauche`}
                title="Vers la gauche"
                onClick={() => move(i, -1)}
              >
                <Icon name="arrow-left" />
              </button>
              <button
                type="button"
                class="cmp-tool"
                data-focus={`${c.id}:right`}
                disabled={i === n - 1}
                aria-label={`Déplacer ${c.name} vers la droite`}
                title="Vers la droite"
                onClick={() => move(i, 1)}
              >
                <Icon name="arrow-right" />
              </button>
              <button type="button" class="cmp-tool is-remove" data-focus={`${c.id}:remove`} aria-label={`Retirer ${c.name} de la comparaison`} onClick={() => remove(i)}>
                <Icon name="cross" />
                <span class="cmp-tool-label">Retirer</span>
              </button>
            </span>
          </li>
        ))}
      </ol>
      {n < MAX_COMPARED ? (
        <AddCandidate pack={pack} state={state} order={order} apply={apply} />
      ) : (
        <p class="small cmp-full">
          {MAX_COMPARED_WORDS.charAt(0).toUpperCase() + MAX_COMPARED_WORDS.slice(1)} candidats au plus&nbsp;: retirez-en un pour en ajouter un
          autre.
        </p>
      )}
    </section>
  )
}

/** Ajouter un candidat : la liste des autres, dans l'ordre tiré au hasard pour cette personne */
function AddCandidate({ pack, state, order, apply }: { pack: ElectionPack; state: SessionState; order: string[]; apply: BoardProps['apply'] }) {
  const others = useMemo(
    () => seededShuffle(pack.candidates, `${state.seed}:people`).filter(c => !order.includes(c.id)),
    [pack.candidates, state.seed, order],
  )
  const details = useRef<HTMLDetailsElement>(null)
  const left = MAX_COMPARED - order.length
  if (!others.length) return null
  return (
    <details class="cmp-add" ref={details}>
      <summary data-focus="add">
        <Icon name="plus" class="cmp-add-icon" />
        <span class="summary-label">Ajouter un candidat</span>
        <span class="cmp-add-left">{left > 1 ? `encore ${left}\u00a0places` : 'encore une place'}</span>
      </summary>
      <ul class={`cmp-add-list${isMany(others.length) ? ' is-many' : ''}`}>
        {others.map(c => (
          <li key={c.id}>
            <button
              type="button"
              class="cmp-add-item"
              onClick={() => {
                const next = [...order, c.id]
                if (details.current) details.current.open = false
                apply(next, `Ajout à la comparaison\u00a0: ${c.name}. ${plural(next.length, 'candidat')} comparés.`, next.length < MAX_COMPARED ? 'add' : `${c.id}:remove`)
              }}
            >
              <Portrait candidate={c} size="small" decorative />
              <span class="cmp-add-id">
                <span class="cmp-add-name">{c.name}</span>
                <span class="cmp-add-party">{c.affiliation}</span>
              </span>
              <Icon name="plus" />
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}

/** Le nom du candidat, en tête de sa case, visible seulement quand les cases sont l'une sous l'autre (mise en page
 *  'list') ; les lecteurs d'écran ont l'en-tête de colonne */
function Who({ candidate }: { candidate: Candidate }) {
  return (
    <p class="cmp-who" aria-hidden="true">
      <Portrait candidate={candidate} size="small" decorative />
      <span>{candidate.name}</span>
    </p>
  )
}

/** Vue d'ensemble, en colonnes : pour chaque candidat, ce qui est connu, ce qu'il partage, ce qu'il rejette */
function Overview({ overview, people, total }: { overview: CandidateOverview[]; people: Candidate[]; total: number }) {
  const n = people.length
  const name = (id: string) => shortName(people.find(p => p.id === id)!)
  return (
    <tbody class="cmp-overview" role="rowgroup">
      <tr role="row" class="cmp-band">
        <th colSpan={n + 1} scope="rowgroup" role="rowheader" class="cmp-family-cell">
          <h3 class="cmp-family-title">Vue d’ensemble</h3>
        </th>
      </tr>
      <tr role="row" class="cmp-row">
        <th scope="row" role="rowheader" class="cmp-rowhead">
          <span class="cmp-prompt">Position connue</span>
          <span class="cmp-rowhelp">sur les {total}&nbsp;questions</span>
        </th>
        {overview.map((o, i) => (
          <td role="cell" key={o.candidate} class="cmp-cell">
            <Who candidate={people[i]!} />
            <p class="cmp-figure">
              <span class="cmp-figure-n">{o.known}</span> sur {total}
            </p>
          </td>
        ))}
      </tr>
      <tr role="row" class="cmp-row">
        <th scope="row" role="rowheader" class="cmp-rowhead">
          <span class="cmp-prompt">Même approche que…</span>
          <span class="cmp-rowhelp">nombre de questions</span>
        </th>
        {overview.map((o, i) => (
          <td role="cell" key={o.candidate} class="cmp-cell">
            <Who candidate={people[i]!} />
            <ul class="cmp-tally">
              {o.same.map(s => (
                <li key={s.candidate} class={s.count ? '' : 'is-zero'}>
                  <span>{name(s.candidate)}</span>&nbsp;: <span class="cmp-tally-n">{s.count}</span>
                </li>
              ))}
            </ul>
          </td>
        ))}
      </tr>
      <tr role="row" class="cmp-row">
        <th scope="row" role="rowheader" class="cmp-rowhead">
          <span class="cmp-prompt">Rejette l’approche de…</span>
          <span class="cmp-rowhelp">rejet explicite, nombre de questions</span>
        </th>
        {overview.map((o, i) => {
          const any = o.rejects.filter(r => r.count)
          return (
            <td role="cell" key={o.candidate} class="cmp-cell">
              <Who candidate={people[i]!} />
              {any.length ? (
                <ul class="cmp-tally is-opposed">
                  {any.map(r => (
                    <li key={r.candidate}>
                      <span>{name(r.candidate)}</span>&nbsp;: <span class="cmp-tally-n">{r.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p class="cmp-none">Aucun rejet explicite</p>
              )}
            </td>
          )
        })}
      </tr>
    </tbody>
  )
}

/** Comment lire : chaque mot défini, et les repères des cases (replié : chaque ligne porte déjà ses mots) */
function HowToRead() {
  return (
    <details class="cmp-howto">
      <summary>
        <Icon name="chevron" class="disclosure" />
        <span class="summary-label">Comment lire ce tableau</span>
      </summary>
      <div class="cmp-howto-body">
        <div>
          <h3 class="cmp-howto-title">Dans chaque case</h3>
          <ul class="cmp-legend">
            <li>
              <span class="cmp-legend-key">
                <span class="cmp-chip">A</span>
              </span>
              <span>Même lettre, même fond vert pâle&nbsp;: ces candidats portent la même approche (le même texte).</span>
            </li>
            <li>
              <span class="cmp-legend-key">
                <span class="cmp-note is-close">
                  <Icon name="rel-close" />
                  Juge compatible
                </span>
              </span>
              <span>Le candidat propose autre chose, mais juge compatible l’approche d’un autre.</span>
            </li>
            <li>
              <span class="cmp-legend-key">
                <span class="cmp-note is-rejects">
                  <Icon name="cross" />
                  Rejette
                </span>
              </span>
              <span>Rejet explicite de l’approche qu’un autre propose&nbsp;: une opposition radicale.</span>
            </li>
            <li>
              <span class="cmp-legend-key">
                <span class="cmp-note is-rejected">
                  <Icon name="rel-opposed" />
                  Rejetée
                </span>
              </span>
              <span>L’approche de ce candidat, explicitement rejetée par un autre.</span>
            </li>
            <li>
              <span class="cmp-legend-key">
                <span class="cmp-unknown">Position inconnue</span>
              </span>
              <span>Aucune position trouvée à ce jour sur la question&nbsp;; rien n’est deviné.</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="cmp-howto-title">Sous chaque question</h3>
          <ul class="cmp-legend">
            {LEGEND.map(k => (
              <li key={k}>
                <span class="cmp-legend-key">
                  <Mark look={ROW[k]} small />
                </span>
                <span>{ROW_HELP[k]}</span>
              </li>
            ))}
          </ul>
        </div>
        <p class="small cmp-howto-note">
          Ces mots décrivent des positions publiées, l’une par rapport à l’autre&nbsp;: ce n’est pas un jugement, et rien n’y
          dit si un candidat pense comme vous. Une position de faible confiance n’est jamais comptée&nbsp;: tant qu’elle pourrait
          changer la lecture, celle-ci reste «&nbsp;à confirmer&nbsp;». «&nbsp;Parmi les positions connues&nbsp;» signale une
          lecture qui laisse de côté un candidat dont la position n’est pas connue. Sur un écran étroit, les cases ne gardent
          que la position de chacun&nbsp;: qui rejette ou juge compatible l’approche de qui s’écrit en toutes lettres sous la
          question.
        </p>
      </div>
    </details>
  )
}

interface TopicProps {
  data: TopicTable
  topic: Topic
  people: Candidate[]
  pack: ElectionPack
  questions: Map<string, Question>
  /** Seul thème d'une famille du même nom : l'intertitre de la famille le nomme déjà */
  solo: boolean
  mode: Mode
  open: boolean
  onToggle: () => void
}

/** Un thème : son intitulé sur toute la largeur, puis une ligne par question ; déplié, les résumés et les sources */
function TopicRows({ data, topic, people, pack, questions, solo, mode, open, onToggle }: TopicProps) {
  const n = people.length
  const shown = data.rows.filter(r => matches(r, mode))
  const hidden = data.rows.length - shown.length
  const id = `cmp-t-${topic.id}`
  const opposed = shown.filter(r => r.kind === 'opposed').length
  return (
    <tbody id={id} class={`cmp-topic${open ? ' is-open' : ''}`} role="rowgroup">
      <tr role="row" class="cmp-band">
        <th colSpan={n + 1} scope="rowgroup" role="rowheader" class="cmp-topic-cell">
          <div class="cmp-topic-head">
            {solo ? null : <h4 class="cmp-topic-name">{topic.label}</h4>}
            <span class="cmp-topic-count">{plural(data.rows.length, 'question')}</span>
            {opposed ? <Mark look={ROW.opposed} label={`Opposition sur ${plural(opposed, 'question')}`} small /> : null}
            <button type="button" class="cmp-topic-toggle" aria-expanded={open} aria-controls={id} onClick={onToggle}>
              <Icon name="chevron" class="disclosure" />
              <span>{open ? 'Masquer les résumés et les sources' : 'Résumés et sources'}</span>
              <span class="sr-only"> : {topic.label}</span>
            </button>
          </div>
          {open ? <AiLabel kind="resumes" more="lien" class="cmp-topic-ai" /> : null}
        </th>
      </tr>
      {shown.map(r => (
        <Row key={r.questionId} row={r} question={questions.get(r.questionId)!} people={people} pack={pack} open={open} />
      ))}
      {hidden ? (
        <tr role="row" class="cmp-hidden">
          <td role="cell" colSpan={n + 1}>
            {hidden > 1 ? `${hidden}\u00a0autres questions de ce thème sont masquées` : 'Une autre question de ce thème est masquée'} par le filtre.
          </td>
        </tr>
      ) : null}
    </tbody>
  )
}

/** Des noms, dans l'ordre des colonnes : « Faure », « Faure et Royal », « Faure, Royal et Maurel » ; un nom ne se
 *  coupe jamais (ni césure ni retour à la ligne en son milieu) */
function Names({ ids, people }: { ids: readonly string[]; people: Candidate[] }) {
  const list = ids.map(id => shortName(people.find(p => p.id === id)!))
  return (
    <>
      {list.map((n, i) => (
        <Fragment key={n}>
          {i === 0 ? '' : i === list.length - 1 ? ' et ' : ', '}
          <span class="cmp-name">{n}</span>
        </Fragment>
      ))}
    </>
  )
}

/** « de Faure et Royal », « d’Exemple » */
function Of({ ids, people }: { ids: readonly string[]; people: Candidate[] }) {
  const first = people.find(p => p.id === ids[0])
  return (
    <>
      {first ? de(shortName(first)) : 'de '}
      <Names ids={ids} people={people} />
    </>
  )
}

/** Une phrase de la ligne, en toutes lettres */
function Sentence({ say, people }: { say: Say; people: Candidate[] }) {
  const who = <Names ids={say.who} people={people} />
  const many = say.who.length > 1
  switch (say.kind) {
    case 'rejects':
      return (
        <>
          {who} {many ? 'rejettent' : 'rejette'} l’approche <Of ids={say.whom} people={people} />.
        </>
      )
    case 'same':
      return (
        <>
          {who} portent la même approche ({markOf(say.group ?? 0)}).
        </>
      )
    case 'compatible':
      return (
        <>
          {who} {many ? 'jugent' : 'juge'} compatible l’approche <Of ids={say.whom} people={people} />.
        </>
      )
    case 'also-compatible':
      return (
        <>
          {who} {many ? 'jugent' : 'juge'} aussi compatible l’approche citée par <Names ids={say.whom} people={people} />.
        </>
      )
    case 'also-rejects':
      return (
        <>
          {who} {many ? 'rejettent' : 'rejette'} aussi ce que {say.whom.length > 1 ? 'rejettent' : 'rejette'}{' '}
          <Names ids={say.whom} people={people} />.
        </>
      )
  }
}

/**
 * Une question : son intitulé, la lecture de la ligne et ses phrases (qui rejette ou juge compatible l'approche de qui),
 * puis une case par candidat. Les phrases d'opposition se lisent toujours ; les autres, seulement quand les cases sont
 * trop étroites pour porter leurs notes (compare.css).
 */
function Row({ row, question, people, pack, open }: { row: QuestionRow; question: Question; people: Candidate[]; pack: ElectionPack; open: boolean }) {
  const partial = !row.complete && row.kind !== 'unknown'
  const says = rowSays(row)
  return (
    <tr role="row" class={`cmp-row kind-${row.kind}`}>
      <th scope="row" role="rowheader" class="cmp-rowhead">
        <span class="cmp-prompt">{question.prompt}</span>
        <span class="cmp-read">
          <Mark look={ROW[row.kind]} label={rowLabel(row)} small />
          {partial ? <span class="cmp-partial">parmi les positions connues</span> : null}
        </span>
        {says.length ? (
          <span class="cmp-says">
            {says.map(say => (
              <span key={`${say.kind}:${say.who.join(',')}>${say.whom.join(',')}`} class={`cmp-say is-${say.kind}`}>
                {say.kind === 'rejects' ? <Icon name="cross" /> : null}
                <span>
                  <Sentence say={say} people={people} />
                </span>
              </span>
            ))}
          </span>
        ) : null}
      </th>
      {row.cells.map((cell, i) => (
        <td role="cell" key={cell.candidate} class={`cmp-cell${cell.group !== null ? ' is-shared' : ''}${cell.known ? '' : ' is-unknown'}`}>
          <Who candidate={people[i]!} />
          <Cell cell={cell} question={question} people={people} table={pack.positions[cell.candidate]} open={open} />
        </td>
      ))}
    </tr>
  )
}

/** Regroupe des liens par approche : approche → candidats, dans l'ordre des colonnes */
function byApproach(links: RowCell['rejects']) {
  const out = new Map<string, string[]>()
  for (const l of links) for (const a of l.approaches) out.set(a, [...(out.get(a) ?? []), l.candidate])
  return out
}

/**
 * Ce que tient un candidat sur une question : le texte de son approche, puis ce qu'il dit des autres (et ce que les
 * autres rejettent de la sienne). Sans approche principale, une approche qu'un autre porte se dit par son nom :
 * « Pas d'approche propre ; juge compatible celle de Glucksmann », sans recopier le texte de l'autre.
 */
function Cell({
  cell,
  question,
  people,
  table,
  open,
}: {
  cell: RowCell
  question: Question
  people: Candidate[]
  table: Record<string, Position> | undefined
  open: boolean
}) {
  const text = (id: string) => question.approaches.find(a => a.id === id)?.text ?? ''
  const { stance } = cell

  if (!cell.known) {
    return (
      <>
        <p class="cmp-unknown">
          <span class="cmp-chip is-unknown" aria-hidden="true">
            <Icon name="rel-unknown" />
          </span>
          {stance.unconfirmed.length ? 'Position à confirmer' : 'Position inconnue'}
        </p>
        {open ? <Details stance={stance} question={question} table={table} known={false} /> : null}
      </>
    )
  }

  const chip =
    cell.group !== null ? (
      <span class="cmp-chip" aria-hidden="true">
        {markOf(cell.group)}
      </span>
    ) : null
  const compatible = byApproach(cell.compatibleWith)
  // Sans approche principale : les approches compatibles qu'un autre porte en principale se disent par son nom
  const held = stance.leadLevel === 'compatible' ? stance.lead.filter(id => compatible.has(id)) : []
  const heldBy = people.map(p => p.id).filter(id => held.some(a => compatible.get(a)!.includes(id)))
  const free = stance.lead.filter(id => !held.includes(id))
  const notes = [...compatible].filter(([a]) => !held.includes(a))
  const rejects = byApproach(cell.rejects)
  const rejectedBy = byApproach(cell.rejectedBy)
  return (
    <>
      {held.length ? (
        <p class="cmp-pos">
          {chip}
          <span class="cmp-text">
            Pas d’approche propre&nbsp;; juge compatible {held.length > 1 ? 'celles' : 'celle'} <Of ids={heldBy} people={people} />
          </span>
        </p>
      ) : null}
      {free.length && stance.leadLevel === 'compatible' ? (
        <p class="cmp-level">{held.length ? 'Juge aussi compatible' : 'Sans approche principale\u00a0; juge compatible'}&nbsp;:</p>
      ) : null}
      {stance.leadLevel === 'rejection' ? <p class="cmp-level is-opposed">Ne fait que rejeter&nbsp;:</p> : null}
      {free.map(id => (
        <p key={id} class={`cmp-pos${stance.leadLevel === 'rejection' ? ' is-rejected' : ''}`}>
          {held.length ? null : chip}
          <span class="cmp-text">{text(id)}</span>
        </p>
      ))}
      {cell.group !== null ? (
        <span class="sr-only">
          Même approche que <Names ids={cell.sameAs} people={people} />.
        </span>
      ) : null}
      {notes.map(([a, who]) => (
        <p key={a} class="cmp-note is-close is-quiet">
          <Icon name="rel-close" />
          <span>
            Juge compatible l’approche <Of ids={who} people={people} />
          </span>
        </p>
      ))}
      {cell.alsoCompatible.map(l => (
        <p key={l.candidate} class="cmp-note is-close is-quiet">
          <Icon name="rel-close" />
          <span>
            Juge aussi compatible l’approche citée par <Names ids={[l.candidate]} people={people} />
          </span>
        </p>
      ))}
      {cell.alsoRejects.map(l => (
        <p key={l.candidate} class="cmp-note is-close is-quiet">
          <Icon name="rel-close" />
          <span>
            Rejette aussi ce que rejette <Names ids={[l.candidate]} people={people} />
          </span>
        </p>
      ))}
      {[...rejects].map(([a, who]) => (
        <p key={a} class="cmp-note is-rejects">
          <Icon name="cross" />
          <span>
            <span class="cmp-note-long">
              Rejette l’approche <Of ids={who} people={people} />
            </span>
            <span class="cmp-note-short" aria-hidden="true">
              Rejette
            </span>
          </span>
        </p>
      ))}
      {[...rejectedBy].map(([a, who]) => (
        <p key={a} class="cmp-note is-rejected">
          <Icon name="rel-opposed" />
          <span>
            <span class="cmp-note-long">
              Approche rejetée par <Names ids={who} people={people} />
            </span>
            <span class="cmp-note-short" aria-hidden="true">
              Rejetée
            </span>
          </span>
        </p>
      ))}
      {open ? <Details stance={stance} question={question} table={table} known /> : null}
    </>
  )
}

/** Déplié : chacune de ses positions sur la question, son résumé (rédigé par IA), sa nature et ses sources */
function Details({ stance, question, table, known }: { stance: RowCell['stance']; question: Question; table: Record<string, Position> | undefined; known: boolean }) {
  const text = (id: string) => question.approaches.find(a => a.id === id)?.text ?? ''
  const lead = new Set(stance.lead)
  const items = [
    ...stance.main.map(id => ({ id, label: 'Approche principale' })),
    ...stance.compatible.map(id => ({ id, label: lead.has(id) ? 'Approche jugée compatible' : 'Juge aussi compatible' })),
    ...stance.rejects.map(id => ({ id, label: 'Rejette' })),
    ...stance.unconfirmed.map(id => ({ id, label: 'Position probable, à confirmer (non comptée)' })),
  ]
    .map(x => ({ ...x, p: table?.[x.id] }))
    .filter((x): x is { id: string; label: string; p: Position } => !!x.p)
  if (!items.length) return known ? null : <p class="cmp-detail-none">Aucune position trouvée à ce jour sur cette question.</p>
  return (
    <div class="cmp-details">
      {/* La mention en tête du bloc déplié de chaque case : la mention du thème défile hors de vue dans une longue case */}
      <AiLabel kind="texte" more="seule" class="cmp-detail-ai" />
      {items.map(d => (
        <div key={d.id} class="cmp-detail">
          <p class={`cmp-detail-kicker${d.label === 'Rejette' ? ' is-opposed' : ''}`}>{d.label}</p>
          {/* Le texte de l'approche de tête est déjà en haut de la case */}
          {lead.has(d.id) ? null : <p class="cmp-detail-approach">{text(d.id)}</p>}
          <p class="cmp-summary">
            {d.p.summary}{' '}
            <span class="source-kind">
              ({NATURE[d.p.nature]}
              {d.p.confidence === 'low' ? ', position probable, non comptée' : d.p.confidence === 'medium' ? ', formulation moins nette' : ''})
            </span>
          </p>
          <SourceList sources={d.p.sources} />
        </div>
      ))}
    </div>
  )
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul class="source-links">
      {sources.map(s => (
        <li key={s.url}>
          <ExternalLink href={s.url}>{s.title}</ExternalLink>{' '}
          <span class="source-meta">
            {s.publisher ?? hostOf(s.url)}
            {s.date ? `, ${formatDate(s.date)}` : ''}
          </span>
        </li>
      ))}
    </ul>
  )
}
