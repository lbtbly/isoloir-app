// « Les sujets » : toutes les fiches de contexte des questions (l'enjeu, les chiffres clés, les repères,
// chacun sourcé), rangées par famille de thèmes puis par thème, la question en titre de fiche.
// Ni approche ni candidat : la page se lit avant de répondre, sans rien orienter.
// Navigation : la barre collante des familles (comme la fiche d'un candidat) et un sommaire qui mène
// à chaque question ; chaque fiche a son adresse, #/sujets/<question>.
// Vidéos : en tête de page, l'accès au fil de toutes les vidéos ; en tête de chaque thème qui a sa série,
// « Regarder la vidéo » (son introduction) ; sous une fiche, les approfondissements qui l'éclairent. Le lecteur
// s'ouvre par-dessus la page (videos/Host.tsx), et les entrées n'apparaissent que pour les vidéos qui existent.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question, Topic, TopicGroup } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { SiteFooter } from '../components/SiteFooter'
import { Icon } from '../components/Icon'
import { Explainer } from '../questionnaire/Explainer'
import { QuestionVideos, TopicVideo, VideoFeedEntry } from '../videos/Links'
import { useStickyFilters } from '../useStickyFilters'
import '../../styles/topics.css'

interface Props {
  pack: ElectionPack
  state: SessionState
  /** Questions du questionnaire rapide, dans l'ordre de la personne : pour l'appel « Commencer / Reprendre » */
  essential: Question[]
  /** Question à montrer à l'ouverture (#/sujets/<id>) */
  anchor?: string
}

interface Family {
  group: TopicGroup
  themes: { topic: Topic; questions: Question[] }[]
  count: number
}

const wide = () => typeof matchMedia !== 'undefined' && matchMedia('(min-width: 64rem)').matches
const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const fiches = (n: number) => `${n}\u00a0fiche${n > 1 ? 's' : ''}`

/** Amène une fiche sous la barre collante et lui donne le focus (son titre est annoncé) */
function reveal(id: string, smooth: boolean) {
  const el = document.getElementById(`sujet-${id}`)
  if (!el) return false
  el.scrollIntoView({ behavior: smooth && !reduced() ? 'smooth' : 'auto', block: 'start' })
  el.querySelector<HTMLElement>('h4')?.focus({ preventScroll: true })
  return true
}

export function Topics({ pack, state, essential, anchor }: Props) {
  const { election, bank } = pack
  const groups = useMemo(
    () => pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
    [pack.topicGroups, bank.topics],
  )
  const families = useMemo<Family[]>(() => {
    // Un thème hors des familles reste consultable, dans une famille à part
    const placed = new Set(groups.flatMap(g => g.topicIds))
    const rest = bank.topics.filter(t => !placed.has(t.id)).map(t => t.id)
    const all = rest.length ? [...groups, { id: 'autres', label: 'Autres thèmes', topicIds: rest }] : groups
    return all
      .map(group => {
        const themes = group.topicIds
          .map(id => ({
            topic: bank.topics.find(t => t.id === id),
            questions: bank.questions.filter(q => q.topicId === id && q.explainer),
          }))
          .filter((x): x is { topic: Topic; questions: Question[] } => !!x.topic && x.questions.length > 0)
        return { group, themes, count: themes.reduce((n, t) => n + t.questions.length, 0) }
      })
      .filter(f => f.count > 0)
  }, [groups, bank])
  const total = families.reduce((n, f) => n + f.count, 0)
  const themeCount = families.reduce((n, f) => n + f.themes.length, 0)

  const [filter, setFilter] = useState<string | null>(null)
  const shown = filter ? families.filter(f => f.group.id === filter) : families
  const shownCount = shown.reduce((n, f) => n + f.count, 0)
  const current = filter ? families.find(f => f.group.id === filter) : null
  const [tocOpen, setTocOpen] = useState(wide)

  const section = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const toc = useRef<HTMLDetailsElement>(null)
  // Barre collante : sa hauteur pour le focus, et si elle colle encore (écran court face au texte)
  const loose = useStickyFilters(bar)

  // Adresse d'une fiche : on y va une fois la page posée (après le focus du titre que donne le routeur)
  useEffect(() => {
    if (!anchor) return
    const t = window.setTimeout(() => reveal(anchor, false), 60)
    return () => window.clearTimeout(t)
  }, [anchor])

  /** Change de famille ; si la barre colle déjà en haut, on remonte au début des fiches */
  const pick = (id: string | null) => {
    setFilter(id)
    const top = section.current?.getBoundingClientRect().top ?? 0
    if (top < 0) section.current?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })
  }

  /** Lien du sommaire : la fiche vient sous la barre, l'adresse change sans nouvelle entrée d'historique */
  const jump = (e: MouseEvent, id: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    history.replaceState(null, '', `#/sujets/${id}`)
    if (!wide()) {
      // Le sommaire se replie avant la mesure : sinon le défilement doux vise une position périmée
      if (toc.current) toc.current.open = false
      setTocOpen(false)
    }
    reveal(id, true)
  }

  // Appel principal, comme sur l'accueil : commencer, reprendre, ou revoir son dépouillement
  const seen = essential.filter(q => state.answers[q.id]).length
  const firstOpen = essential.findIndex(q => !state.answers[q.id])
  const done = essential.length > 0 && seen === essential.length
  const start = done
    ? { href: '#/resultats', label: 'Voir mon dépouillement' }
    : { href: `#/feuille/${(firstOpen < 0 ? 0 : firstOpen) + 1}`, label: seen ? 'Reprendre la feuille' : 'Commencer la feuille' }

  return (
    <div class="screen screen-wide screen-topics">
      <FormHeader title="Les sujets" right={election.shortName} />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class="wide-hero">
          <h1 class="display" tabIndex={-1}>
            Les sujets
          </h1>
          <div>
            <p class="lede">
              {`Le contexte des ${total} questions, en ${themeCount} thèmes\u00a0: l’enjeu, les chiffres clés et quelques repères, chacun avec sa source.`}
            </p>
            <p class="small">
              {'Ni les approches proposées ni les candidats n’y figurent\u00a0: vous pouvez lire ces fiches avant de répondre sans que rien n’oriente votre avis.'}
            </p>
            {/* Dès l'arrivée, avant la première fiche : l'explication ici, la mention seule sur chaque fiche */}
            <AiLabel kind="fiches" class="topics-ai" />
            {/* Le fil de toutes les vidéos, s'il y en a */}
            <VideoFeedEntry groups={groups} />
          </div>
        </div>

        <div class="topics-content" ref={section}>
          {/* Barre collante : les familles de thèmes ; sur téléphone, un menu déroulant remplace les pastilles */}
          <div class={`fiche-filters topics-filters${loose ? ' is-loose' : ''}`} ref={bar}>
            <label class="filter-select">
              <span class="sr-only">Filtrer les fiches par famille de thèmes</span>
              <select value={filter ?? ''} onChange={e => pick(e.currentTarget.value || null)}>
                <option value="">Tout ({fiches(total)})</option>
                {families.map(f => (
                  <option key={f.group.id} value={f.group.id}>
                    {f.group.label} ({f.count})
                  </option>
                ))}
              </select>
              <Icon name="chevron" class="select-chevron" />
            </label>
            <ul class="filter-chips" aria-label="Filtrer les fiches par famille de thèmes">
              <li>
                <button type="button" class="filter-chip is-all" aria-pressed={!filter} onClick={() => pick(null)}>
                  Tout
                  <span class="chip-n">
                    <span class="sr-only">, </span>
                    {total}
                    <span class="sr-only"> fiches</span>
                  </span>
                </button>
              </li>
              {families.map(f => (
                <li key={f.group.id}>
                  <button
                    type="button"
                    class="filter-chip"
                    aria-pressed={filter === f.group.id}
                    onClick={() => pick(filter === f.group.id ? null : f.group.id)}
                  >
                    {f.group.label}
                    <span class="chip-n">
                      <span class="sr-only">, </span>
                      {f.count}
                      <span class="sr-only"> fiche{f.count > 1 ? 's' : ''}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p class="sr-only" role="status">
            {current ? `${fiches(shownCount)}\u00a0: ${current.group.label}` : ''}
          </p>

          <div class="topics-layout">
            <nav class="topics-toc" aria-label="Sommaire des fiches">
              <details open={tocOpen} ref={toc} onToggle={e => setTocOpen((e.currentTarget as HTMLDetailsElement).open)}>
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="summary-label">Sommaire</span>
                  <span class="toc-count">{fiches(shownCount)}</span>
                </summary>
                {shown.map(f => (
                  <div key={f.group.id} class="toc-family">
                    {filter ? null : <p class="toc-family-label">{f.group.label}</p>}
                    {f.themes.map(({ topic, questions }) => (
                      <div key={topic.id} class="toc-theme">
                        <p class="toc-theme-label">{topic.label}</p>
                        <ul>
                          {questions.map(q => (
                            <li key={q.id}>
                              <a href={`#/sujets/${q.id}`} onClick={e => jump(e, q.id)}>
                                {q.prompt}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </details>
            </nav>

            <div class="topics-list">
              {shown.map(f => (
                <section key={f.group.id} class="topic-family" aria-labelledby={`famille-${f.group.id}`}>
                  <h2 id={`famille-${f.group.id}`} class="section-title">
                    {f.group.label}
                  </h2>
                  {f.themes.map(({ topic, questions }) => (
                    <section key={topic.id} class="topic-theme" aria-labelledby={`theme-${topic.id}`}>
                      <div class="topic-theme-head">
                        <h3 id={`theme-${topic.id}`} class="topic-theme-title">
                          {topic.label}
                        </h3>
                        <p class="topic-theme-desc">{topic.description}</p>
                        <TopicVideo topicId={topic.id} topic={topic.label} />
                      </div>
                      {questions.map(q => (
                        <article key={q.id} class="topic-fiche" id={`sujet-${q.id}`} aria-labelledby={`sujet-h-${q.id}`}>
                          <h4 id={`sujet-h-${q.id}`} class="topic-fiche-title" tabIndex={-1}>
                            {q.prompt}
                          </h4>
                          {q.context ? <p class="topic-fiche-context">{q.context}</p> : null}
                          {/* Mention sans bulle : on peut arriver ici directement (#/sujets/<question>) */}
                          <Explainer data={q.explainer!} page ai="seule" />
                          <QuestionVideos questionId={q.id} />
                        </article>
                      ))}
                    </section>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href="#/">
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </a>
          <span />
          <a class="btn-primary" href={start.href}>
            {start.label}
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}
