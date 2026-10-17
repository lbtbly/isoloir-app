// Journal des données (#/journal ; une entrée : #/journal/8), décision du propriétaire du 17 octobre 2026, sur maquette :
// chaque changement des données, daté et numéroté, le plus récent en haut, filtrable par candidat, thème, nature et
// période. Chaque entrée a un titre court et trois faits (candidats, thèmes, effet sur le classement) ; « Lire la suite »
// déplie le texte entier, ce qui arrive aux positions de chaque candidat, une phrase par cause, et les questions
// touchées. Titres et textes sont rédigés par IA (l'étiquette le dit en tête) ; candidats, causes, questions et effet
// viennent des données (core/journal.ts). Retouche du même jour : au téléphone, les filtres sont dans une feuille
// modale, derrière un bouton « Filtres » qui compte les filtres posés ; sur ordinateur, ils restent visibles.
//
// Rien ne quitte l'appareil : « Vous y avez répondu », « après vos réponses » et « après votre dernier passage » se
// calculent sur la feuille de l'appareil et ne vont jamais dans l'adresse, qui ne porte que les filtres
// (#/journal?candidat=retailleau). Un fichier à part, chargé à la demande (ui/screens/load.ts), avec son style
// (styles/journal.css), comme « À table » et « Mon profil politique » : la feuille de toutes les visites n'en a rien.

import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { APP_NAME } from '../../core/app'
import { seededShuffle } from '../../core/rng'
import { parseLocation } from '../../core/routes'
import {
  FILTER_KEYS,
  JOURNAL_KINDS,
  KIND_LABELS,
  activeFilters,
  journalItems,
  journalPath,
  levelOf,
  matches,
  parseJournalQuery,
  type FilterKey,
  type JournalContext,
  type JournalFilters,
  type JournalItem,
  type LocalSince,
} from '../../core/journal'
import type { SessionState } from '../../core/storage'
import type { Candidate, ElectionPack, JournalKind, JournalPerson, QuestionId } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { takeJournalPreset } from '../journalPreset'
import { go, link, rewrite } from '../nav'
import { useStickyFilters } from '../useStickyFilters'
import '../../styles/journal.css'

const NB = '\u00a0'
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const dayOf = (d: string) => Number(d.slice(8, 10))
/** « 1er », « 15 » */
const dd = (d: string) => (dayOf(d) === 1 ? '1er' : String(dayOf(d)))
const monthOf = (d: string) => MONTHS[Number(d.slice(5, 7)) - 1] ?? ''
/** « 15 octobre » */
const dayLabel = (d: string) => `${dd(d)}${NB}${monthOf(d)}`
/** « 15 octobre 2026 » */
const fullDate = (d: string) => `${dayLabel(d)}${NB}${d.slice(0, 4)}`
/**
 * Le jour, à Paris, d'un instant ISO : celui des dates du journal (le même calcul que l'accueil de retour, HomeBack.tsx ;
 * l'importer d'elle ferait sortir du fichier de la page une partie du code de toutes les visites)
 */
const PARIS_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
const parisDay = (iso: string): string => PARIS_DAY.format(new Date(iso))
const plural = (n: number, one: string, many = `${one}s`) => `${n}${NB}${n > 1 ? many : one}`
const entries = (n: number) => plural(n, 'entrée')

/** Les pictogrammes des natures (Icon.tsx), devant leur nom sur la tête de chaque entrée */
const KIND_ICONS: Record<JournalKind, string> = { candidats: 'people', positions: 'list', questions: 'topics', explications: 'videos', site: 'calc' }

/** Les dates du journal : « du 8 au 15 octobre 2026 », le mois et l'année dits une fois quand ils sont les mêmes */
function spanOf(from: string, to: string): string {
  const start = from.slice(0, 7) === to.slice(0, 7) ? dd(from) : from.slice(0, 4) === to.slice(0, 4) ? dayLabel(from) : fullDate(from)
  return from === to ? `le ${fullDate(to)}` : `du ${start} au ${fullDate(to)}`
}

/**
 * Ce que disent les choix « Pour vous » de la période, dans le menu et en mots sous lui. Le jour des réponses n'est pas
 * compté (core/journal.ts, inPeriod) : « après le 12 octobre », pour ne pas laisser croire qu'aucune entrée de ce jour-là
 * n'a suivi les réponses
 */
const localLabel = (since: LocalSince, answeredDay: string | null) =>
  since === 'reponses' ? `Après le ${answeredDay ? dayLabel(answeredDay) : ''}, jour de vos réponses` : 'Après votre dernier passage'

interface Props {
  pack: ElectionPack
  state: SessionState
  /** L'entrée à ouvrir à l'arrivée (#/journal/8) */
  n?: number
  /** Les filtres de l'adresse (« ?candidat=retailleau ») */
  query?: string
  /**
   * La question a une réponse sur cet appareil (au moins un avis : core/answers.ts, isAnswered, que l'application passe :
   * importé ici, il sortirait du code de la page un fichier de plus, chargé par « Mon profil politique » aussi)
   */
  answered: (id: QuestionId) => boolean
}

export function Journal({ pack, state, n, query, answered }: Props) {
  const { bank, candidates } = pack
  const items = useMemo(() => journalItems(pack), [pack])
  const total = items.length
  const byId = useMemo(() => new Map(candidates.map(c => [c.id, c])), [candidates])
  const questionById = useMemo(() => new Map(bank.questions.map(q => [q.id, q])), [bank])
  const topicLabel = useMemo(() => new Map(bank.topics.map(t => [t.id, t.label])), [bank])
  const groups = useMemo(
    () => pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] })),
    [pack.topicGroups, bank.topics],
  )
  const topicOrder = useMemo(() => new Map(bank.topics.map((t, i) => [t.id, i])), [bank])
  /** Les questions dans l'ordre des thèmes de la banque */
  const byTopic = (ids: readonly QuestionId[]) =>
    ids
      .filter(id => questionById.has(id))
      .sort((a, b) => (topicOrder.get(questionById.get(a)!.topicId) ?? 0) - (topicOrder.get(questionById.get(b)!.topicId) ?? 0) || a.localeCompare(b, 'fr', { numeric: true }))
  // Les familles de thèmes d'une entrée, dans l'ordre de « Les sujets » : celles de ses questions
  const familiesOf = useMemo(() => {
    const familyOf = new Map(groups.flatMap(g => g.topicIds.map(t => [t, g.id] as const)))
    const order = new Map(groups.map((g, i) => [g.id, i]))
    const cache = new Map<number, string[]>()
    return (item: JournalItem): string[] => {
      let out = cache.get(item.n)
      if (!out) {
        const ids = item.questions.map(q => familyOf.get(questionById.get(q)?.topicId ?? '')).filter((g): g is string => !!g)
        out = [...new Set(ids)].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
        cache.set(item.n, out)
      }
      return out
    }
  }, [groups, questionById])
  const familyLabel = useMemo(() => new Map(groups.map(g => [g.id, g.label])), [groups])
  const families = useMemo(() => groups.filter(g => items.some(i => familiesOf(i).includes(g.id))), [groups, items, familiesOf])
  // Les candidats présentés, chacun avec son parti, dans l'ordre du site, tiré au hasard sur l'appareil (le même qu'à
  // l'accueil et dans la comparaison, la Méthode le dit) : jamais les mêmes noms en tête. Chacun a au moins une entrée
  // (tests/journal.test.ts)
  const presented = useMemo(() => seededShuffle(candidates, `${state.seed}:people`), [candidates, state.seed])
  const siteOrder = useMemo(() => new Map(presented.map((c, i) => [c.id, i])), [presented])
  const days = useMemo(() => [...new Set(items.map(i => i.date))].sort((a, b) => b.localeCompare(a)), [items])

  // Ce que l'appareil sait, pour les deux choix « Pour vous » : rien n'en sort, rien n'en va dans l'adresse
  const answeredDay = state.essentialDoneAt && !Number.isNaN(Date.parse(state.essentialDoneAt)) ? parisDay(state.essentialDoneAt) : null
  const seenVersion = state.dataUpdatedFrom
  const seenAt = state.beforeUpdate?.at
  const seenDay = seenVersion && seenAt ? parisDay(seenAt) : null
  const locals = (['reponses', 'passage'] as const).filter(s => (s === 'reponses' ? !!answeredDay : !!seenVersion))
  const ctx: JournalContext = { families: familiesOf, answeredDay, seenVersion, seenDay }

  /** Les filtres d'une adresse, et le choix passé en mémoire par la page d'où l'on vient (pris une fois, toujours) */
  const fromAddress = (q: string | undefined, entry: number | undefined): JournalFilters => {
    const preset = takeJournalPreset()
    // Une entrée demandée (#/journal/8) s'ouvre sans filtre
    if (entry) return {}
    const f = parseJournalQuery(q ?? '', {
      candidat: new Set(candidates.map(c => c.id)),
      theme: new Set(families.map(g => g.id)),
      change: new Set(JOURNAL_KINDS),
      depuis: new Set(days.slice(0, -1)),
    })
    if (preset && locals.includes(preset)) f.depuis = preset
    return f
  }
  const [filters, setFilters] = useState<JournalFilters>(() => fromAddress(query, n))
  useEffect(() => {
    // Un lien vers le journal depuis le journal (le pied de page) : l'écran reste le même (app.tsx), les filtres suivent
    // l'adresse. Les filtres posés ici réécrivent l'adresse sans hashchange (nav.ts, rewrite)
    const onHash = () => {
      const { route } = parseLocation(location.hash)
      if (route.name === 'journal' && !route.n) setFilters(fromAddress(route.query, undefined))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const shown = items.filter(i => matches(i, filters, ctx))
  const active = activeFilters(filters)
  const count = (f: JournalFilters, skip?: FilterKey) => items.filter(i => matches(i, f, ctx, skip)).length

  /** Pose les filtres ; l'adresse suit, sans nouvelle entrée d'historique, et sans jamais les choix « Pour vous » */
  const apply = (f: JournalFilters) => {
    const next = Object.fromEntries(Object.entries(f).filter(([, v]) => !!v)) as JournalFilters
    setFilters(next)
    rewrite(journalPath(next))
    // La ligne collée : on revient au début du journal
    const top = sentinel.current?.getBoundingClientRect().top ?? 0
    if (top < 0) sentinel.current?.scrollIntoView({ block: 'start' })
  }
  const set = (key: FilterKey, value: string | undefined) => apply({ ...filters, [key]: value || undefined })
  /**
   * Pose les filtres depuis un bouton qui va disparaître (« Tout afficher », les boutons de « Aucune entrée ») : le focus
   * passe à la ligne du compte, qui dit ce qui est affiché, plutôt que de tomber sur la page
   */
  const countLine = useRef<HTMLParagraphElement>(null)
  const applyAndSay = (f: JournalFilters) => {
    apply(f)
    countLine.current?.focus({ preventScroll: true })
  }

  // « Lire la suite » ouvert : l'entrée de l'adresse à l'arrivée, puis ce que la personne ouvre
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set(n ? [n] : []))
  const toggle = (num: number, on: boolean) =>
    setOpen(prev => {
      if (prev.has(num) === on) return prev
      const next = new Set(prev)
      if (on) next.add(num)
      else next.delete(num)
      return next
    })
  useEffect(() => {
    if (!n) return
    // L'entrée de l'adresse, une fois la page posée (après le focus du titre que donne le routeur) : sous la ligne collante
    const t = window.setTimeout(() => {
      const title = document.getElementById(`entree-${n}`)
      if (!title) return
      title.scrollIntoView({ block: 'start' })
      title.focus({ preventScroll: true })
    }, 60)
    return () => window.clearTimeout(t)
  }, [n])

  // La ligne du compte colle sous l'en-tête ; collée, elle tient sur une ligne
  const summary = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const loose = useStickyFilters(summary)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    const s = sentinel.current
    if (!s || typeof IntersectionObserver === 'undefined') return
    const header = document.querySelector<HTMLElement>('.form-header')
    const offset = (header?.offsetHeight ?? 56) + 6
    const io = new IntersectionObserver(([e]) => setStuck(!!e && !e.isIntersecting && e.boundingClientRect.top < offset), {
      rootMargin: `-${offset}px 0px 0px 0px`,
    })
    io.observe(s)
    return () => io.disconnect()
  }, [])

  // La feuille modale des filtres (téléphone) : titre, focus gardé dedans (dialog modal), Échap, retour du focus
  const sheet = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const sheetTitle = useRef<HTMLHeadingElement>(null)
  const seeButton = useRef<HTMLButtonElement>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const openSheet = () => {
    const d = sheet.current
    if (!d || d.open) return
    d.showModal()
    setSheetOpen(true)
    sheetTitle.current?.focus()
  }
  const closeSheet = () => sheet.current?.close()
  // Le focus reste dans la feuille : Tab passe du dernier contrôle au premier, Maj+Tab du premier (ou du titre) au dernier
  const keepFocus = (e: KeyboardEvent) => {
    const d = sheet.current
    if (e.key !== 'Tab' || !d) return
    const stops = [...d.querySelectorAll<HTMLElement>('button:not([disabled]), select, a[href]')]
    const first = stops[0]
    const last = stops.at(-1)
    const at = document.activeElement
    if (!first || !last) return
    if (e.shiftKey && (at === first || at === sheetTitle.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && at === last) {
      e.preventDefault()
      first.focus()
    }
  }
  useEffect(() => {
    // Passée en grand écran (fenêtre élargie, téléphone tourné), la feuille se referme : les filtres sont sur la page
    if (typeof matchMedia === 'undefined') return
    const wide = matchMedia('(min-width: 48rem)')
    const onChange = () => wide.matches && sheet.current?.open && sheet.current.close()
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [])

  // Remonter aux filtres de la page (grand écran, ligne collée)
  const toFilters = () => {
    const tools = document.getElementById('filtres')
    tools?.scrollIntoView({ block: 'start' })
    tools?.querySelector<HTMLElement>('select, button')?.focus({ preventScroll: true })
  }

  /** Ce que retiennent les filtres, en mots : les menus coupent un long nom, cette ligne le dit en entier */
  const words = (f: JournalFilters) => {
    const out: string[] = []
    const c = f.candidat ? byId.get(f.candidat) : undefined
    if (c) out.push(c.party ? `${c.name} (${c.party.name})` : c.name)
    if (f.theme) out.push(familyLabel.get(f.theme) ?? '')
    if (f.change) out.push(KIND_LABELS[f.change])
    if (f.depuis) out.push(sinceWords(f.depuis))
    return out.join(' · ')
  }
  const sinceWords = (v: string) => (v === 'reponses' || v === 'passage' ? localLabel(v, answeredDay).replace(/^A/, 'a') : `à partir du ${dayLabel(v)}`)
  const range = days.length ? spanOf(days.at(-1)!, days[0]!) : ''
  const filtered = active > 0

  const fieldsProps = { filters, set, presented, families, locals, answeredDay, days, count }

  return (
    <div class="screen screen-read">
      <FormHeader title="Notice" right="Journal des données" />
      <main class="sheet has-margin journal" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Journal des données
        </h1>
        <p class="lede">{`Tout ce qui change dans les données d’${APP_NAME}, daté. Le plus récent en haut.`}</p>
        {/* Avant le premier titre : titres et textes sont rédigés par IA, le reste vient des données */}
        <AiLabel kind="journal" class="jr-ai" />

        {/* Grand écran : les filtres sur la page ; au téléphone, dans la feuille modale (plus bas) */}
        <div class="jr-tools" id="filtres">
          <div class="jr-filters" role="group" aria-label="Filtrer le journal">
            <Fields idp="jr-page" chips {...fieldsProps} />
          </div>
        </div>

        <div class="jr-sentinel" ref={sentinel} />
        <div class={['jr-summary', filtered && 'is-filtered', stuck && !loose && 'is-stuck', loose && 'is-loose'].filter(Boolean).join(' ')} ref={summary}>
          <p class="jr-count" role="status" tabIndex={-1} ref={countLine}>
            {filtered ? (
              <>
                <b>{entries(shown.length)}</b> sur {total}
                <span class="sr-only">{`\u00a0: ${words(filters)}`}</span>
              </>
            ) : (
              <>
                <b>{entries(total)}</b>
                <span class="sr-only"> {range}</span>
              </>
            )}
          </p>
          <p class="jr-words" aria-hidden="true">
            {filtered ? words(filters) : range}
          </p>
          <p class="jr-acts">
            {filtered && shown.length ? (
              <button type="button" class="btn-text jr-reset" onClick={() => applyAndSay({})}>
                Tout afficher
              </button>
            ) : null}
            <button type="button" class="btn-text jr-up" onClick={toFilters}>
              <Icon name="arrow-up" />
              Filtres
            </button>
            <button
              type="button"
              class={`filter-chip jr-open${active ? ' is-set' : ''}`}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              ref={opener}
              onClick={openSheet}
            >
              <Icon name="filters" />
              Filtres
              {active ? (
                <span class="chip-n">
                  <span class="sr-only">, </span>
                  {active}
                  <span class="sr-only">{active > 1 ? ' posés' : ' posé'}</span>
                </span>
              ) : null}
            </button>
          </p>
        </div>

        {shown.length ? (
          days.map(d => {
            const ofDay = shown.filter(i => i.date === d)
            if (!ofDay.length) return null
            return (
              <section class="jr-day" key={d} aria-labelledby={`jour-${d}`}>
                <h2 class="jr-date" id={`jour-${d}`}>
                  <span class="jr-date-d">{dd(d)}</span> <span class="jr-date-m">{`${monthOf(d)} ${d.slice(0, 4)}`}</span>
                </h2>
                <ol class="jr-entries">
                  {ofDay.map(item => (
                    <Entry
                      key={item.n}
                      item={item}
                      open={open.has(item.n)}
                      onToggle={on => toggle(item.n, on)}
                      chosen={filters.candidat}
                      byId={byId}
                      siteOrder={siteOrder}
                      families={familiesOf(item).map(g => familyLabel.get(g) ?? g)}
                      questionList={ids => (
                        <Questions ids={byTopic(ids)} questionById={questionById} topicLabel={topicLabel} answered={answered} />
                      )}
                      answered={answered}
                    />
                  ))}
                </ol>
              </section>
            )
          })
        ) : (
          <Empty filters={filters} items={items} ctx={ctx} total={total} words={{ byId, familyLabel, sinceWords }} onApply={applyAndSay} />
        )}
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Retour">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={() => go('/')}>
            <Icon name="arrow-left" />
            Accueil
          </button>
        </div>
      </nav>

      {/* Téléphone : les filtres dans une feuille modale (le reste de la page est inerte tant qu'elle est ouverte ; Échap la
          referme, le focus revient au bouton « Filtres ») */}
      <dialog
        ref={sheet}
        class="jr-sheet"
        aria-labelledby="jr-sheet-title"
        onClose={() => {
          setSheetOpen(false)
          // Le focus revient au bouton ; la fenêtre élargie (téléphone tourné), le bouton n'est plus affiché : au premier
          // des filtres de la page
          if (opener.current?.offsetParent) opener.current.focus()
          else document.querySelector<HTMLElement>('#filtres select')?.focus({ preventScroll: true })
        }}
        onKeyDown={keepFocus}
        onClick={e => {
          // Un toucher sur le fond, hors de la feuille, la referme ; sur sa bande haute (le double filet, qui est le
          // dialog lui-même), non
          const d = sheet.current
          if (!d || e.target !== d) return
          const r = d.getBoundingClientRect()
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeSheet()
        }}
      >
        <div class="jr-sheet-in">
          <div class="jr-sheet-head">
            <h2 class="jr-sheet-title" id="jr-sheet-title" tabIndex={-1} ref={sheetTitle}>
              Filtres
            </h2>
            <button type="button" class="btn-text jr-sheet-close" onClick={closeSheet}>
              <Icon name="cross" />
              <span class="sr-only">Fermer les filtres</span>
            </button>
          </div>
          <div class="jr-sheet-body">
            <Fields idp="jr-sheet" {...fieldsProps} />
          </div>
          <div class="jr-sheet-foot">
            <p class="jr-sheet-count" role="status">
              {filtered ? (
                <>
                  <b>{entries(shown.length)}</b> sur {total}
                </>
              ) : (
                <>
                  <b>{entries(total)}</b>, aucun filtre posé
                </>
              )}
            </p>
            {/* Le bouton s'éteint de lui-même : le focus passe à « Voir N entrées » */}
            <button
              type="button"
              class="btn-text"
              disabled={!filtered}
              onClick={() => {
                apply({})
                seeButton.current?.focus()
              }}
            >
              Effacer les filtres
            </button>
            <button type="button" class="btn-primary" ref={seeButton} onClick={closeSheet}>
              Voir {entries(shown.length)}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

interface FieldsProps {
  /** Préfixe des identifiants : les champs existent deux fois (la page, la feuille modale) */
  idp: string
  /** « Ce qui change » en pastilles avec leur nombre (grand écran), sinon un menu */
  chips?: boolean
  filters: JournalFilters
  set: (key: FilterKey, value: string | undefined) => void
  presented: Candidate[]
  families: { id: string; label: string }[]
  locals: readonly LocalSince[]
  answeredDay: string | null
  days: string[]
  count: (f: JournalFilters, skip?: FilterKey) => number
}

/**
 * Les quatre filtres : candidat, thème, ce qui change, période. Sur la page, la période vient avant « Ce qui change » :
 * le clavier suit la grille, rangée par rangée (les trois menus, puis les pastilles dessous)
 */
function Fields({ idp, chips, filters: f, set, presented, families, locals, answeredDay, days, count }: FieldsProps) {
  const changeLabel = `${idp}-change`
  const period = (
    <label class="jr-field is-depuis">
      <span class="jr-field-label">Période</span>
      <Select value={f.depuis} onChange={v => set('depuis', v)}>
        <option value="">Tout le journal</option>
        {locals.length ? (
          <optgroup label="Pour vous, calculé sur cet appareil">
            {locals.map(s => (
              <option key={s} value={s}>
                {localLabel(s, answeredDay)}
              </option>
            ))}
          </optgroup>
        ) : null}
        {days.length > 1 ? (
          <optgroup label="Par date">
            {days.slice(0, -1).map(d => (
              <option key={d} value={d}>{`À partir du ${dayLabel(d)}`}</option>
            ))}
          </optgroup>
        ) : null}
      </Select>
    </label>
  )
  return (
    <div class="jr-fields">
      <label class="jr-field is-candidat">
        <span class="jr-field-label">Candidat ou parti</span>
        <Select value={f.candidat} onChange={v => set('candidat', v)}>
          <option value="">Tous</option>
          {presented.map(c => (
            <option key={c.id} value={c.id}>{c.party ? `${c.name}, ${c.party.name}` : c.name}</option>
          ))}
        </Select>
      </label>
      <label class="jr-field is-theme">
        <span class="jr-field-label">Thème</span>
        <Select value={f.theme} onChange={v => set('theme', v)}>
          <option value="">Tous</option>
          {families.map(g => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </Select>
      </label>
      {chips ? period : null}
      <div class="jr-field is-change">
        <span class="jr-field-label" id={changeLabel}>
          Ce qui change
        </span>
        {chips ? (
          // Comme sur « Les sujets » : enfoncée, la pastille s'imprime en négatif ; son nombre tient compte des autres filtres
          <ul class="filter-chips jr-chips" aria-labelledby={changeLabel}>
            {([undefined, ...JOURNAL_KINDS] as (JournalKind | undefined)[]).map(k => {
              const nb = count({ ...f, change: k }, k ? undefined : 'change')
              const on = f.change === k
              return (
                <li key={k ?? 'tout'}>
                  <button
                    type="button"
                    class={`filter-chip${k ? '' : ' is-all'}`}
                    aria-pressed={on}
                    disabled={!nb && !on}
                    onClick={() => set('change', on ? undefined : k)}
                  >
                    {k ? KIND_LABELS[k] : 'Tout'}
                    <span class="chip-n">
                      <span class="sr-only">, </span>
                      {nb}
                      <span class="sr-only">{nb > 1 ? ' entrées' : ' entrée'}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <Select value={f.change} onChange={v => set('change', v)} labelledby={changeLabel}>
            <option value="">Tout</option>
            {JOURNAL_KINDS.map(k => (
              <option key={k} value={k}>
                {KIND_LABELS[k]}
              </option>
            ))}
          </Select>
        )}
      </div>
      {chips ? null : period}
    </div>
  )
}

/** Un menu natif du site (.filter-select) ; posé, il s'imprime en négatif */
function Select({ value, onChange, labelledby, children }: { value?: string; onChange: (v: string) => void; labelledby?: string; children: preact.ComponentChildren }) {
  return (
    <span class={`filter-select jr-select${value ? ' is-set' : ''}`}>
      <select value={value ?? ''} aria-labelledby={labelledby} onChange={e => onChange(e.currentTarget.value)}>
        {children}
      </select>
      <Icon name="chevron" class="select-chevron" />
    </span>
  )
}

interface EntryProps {
  item: JournalItem
  open: boolean
  onToggle: (on: boolean) => void
  /** Le candidat du filtre : sa ligne d'abord, et l'effet pour lui */
  chosen?: string
  byId: Map<string, Candidate>
  /** L'ordre du site, tiré au hasard sur l'appareil : celui du menu des candidats */
  siteOrder: Map<string, number>
  families: string[]
  questionList: (ids: readonly QuestionId[]) => preact.ComponentChildren
  answered: (id: QuestionId) => boolean
}

/** Ce qui arrive aux positions d'un candidat, une phrase par cause : jamais « il change » quand seule notre lecture change */
function causeLines(p: JournalPerson): string[] {
  const forme = levelOf(p) === 'forme'
  const same = forme ? ', approches inchangées' : ''
  const out: string[] = []
  for (const { cause, fond } of p.causes) {
    if (cause === 'relecture')
      out.push(fond ? `${APP_NAME} a relu ses sources et revu sa position\u00a0: ce n’est pas une nouvelle déclaration.` : `${APP_NAME} a relu ses sources\u00a0: résumé mis à jour${same}.`)
    else if (cause === 'prise-de-position')
      out.push(`Nouvelle déclaration${p.statedAt ? ` (${fullDate(p.statedAt)})` : ''}\u00a0: ${fond ? 'sa position change' : `résumés et sources mis à jour${same}`}.`)
    else if (cause === 'nouvelle-approche') out.push('Une question a reçu une nouvelle approche\u00a0; sa position y a été rangée.')
    else if (cause === 'approche-retirée') out.push('Une approche a été retirée d’une question\u00a0; sa position y a été revue.')
    else if (cause === 'question-retirée') out.push('Une question a été retirée\u00a0; sa position y disparaît avec elle.')
    else if (cause === 'nouveau-candidat' || cause === 'première-publication') out.push(`Arrivée dans ${APP_NAME}\u00a0: ses positions sont publiées.`)
    else if (cause === 'candidat-retiré') out.push('Ses positions ne sont plus publiées.')
    else out.push(fond ? 'Sa position change.' : `Résumé mis à jour${same}.`)
  }
  return out
}

/** L'effet sur le score d'un candidat */
function scoreLine(p: JournalPerson, item: JournalItem): { yes: boolean; text: string } {
  const level = levelOf(p)
  if (level === 'fond') return { yes: true, text: 'Son score peut changer.' }
  if (level === 'arrivée')
    return item.unranked.includes(p.id) ? { yes: false, text: 'Candidature non classée\u00a0: sans effet sur le classement.' } : { yes: true, text: 'Son score s’ajoute au classement.' }
  return { yes: false, text: 'Sans effet sur son score.' }
}

function Who({ p, item, byId, questionList }: { p: JournalPerson; item: JournalItem } & Pick<EntryProps, 'byId' | 'questionList'>) {
  const c = byId.get(p.id)
  const s = scoreLine(p, item)
  return (
    <div>
      <dt>{c ? <Name c={c} /> : p.id}</dt>
      <dd>
        {causeLines(p).map(l => (
          <p key={l}>{l}</p>
        ))}
        <p class={`jr-score${s.yes ? ' is-yes' : ''}`}>{s.text}</p>
        {p.questions.length ? questionList(p.questions) : null}
      </dd>
    </div>
  )
}

/** Un candidat : son nom, lien vers sa fiche, et son parti */
function Name({ c }: { c: Candidate }) {
  return (
    <>
      <a href={link(`/candidat/${c.id}`)}>{c.name}</a>
      {c.party ? <span class="jr-party">{` (${c.party.name})`}</span> : null}
    </>
  )
}

/** Les phrases du texte, une par paragraphe */
const sentences = (text: string) => text.split(/(?<=[.!?])\s+(?=\p{Lu})/u)

function Entry({ item, open, onToggle, chosen, byId, siteOrder, families, questionList, answered }: EntryProps) {
  const first = item.effect === 'première-version'
  const people = item.people.filter(p => byId.has(p.id))
  // Rangés par rôle : ceux que le titre nomme, dans son ordre, puis les arrivées, puis les autres, dans l'ordre du site
  const at = (id: string) => item.title.indexOf(byId.get(id)?.name ?? '\u0000')
  const place = (id: string) => siteOrder.get(id) ?? 1e3
  const named = item.named.map(id => byId.get(id)).filter((c): c is Candidate => !!c)
  const ranked = [...people].sort((a, b) => {
    const ta = at(a.id)
    const tb = at(b.id)
    if (ta >= 0 || tb >= 0) return (ta < 0 ? 1e3 : ta) - (tb < 0 ? 1e3 : tb)
    return Number(levelOf(b) === 'arrivée') - Number(levelOf(a) === 'arrivée') || place(a.id) - place(b.id)
  })
  const everyone = [...named, ...ranked.map(p => byId.get(p.id)!)]
  // Les candidats de l'entrée : jusqu'à trois, nommés ; au-delà, ceux que le titre nomme et un nombre
  const inTitle = everyone.filter(c => item.title.includes(c.name))
  const list = everyone.length <= 3 ? everyone : inTitle
  const rest = everyone.length - list.length
  const gone = item.gone ? `et ${plural(item.gone, 'candidat')} qui ne ${item.gone > 1 ? 'sont' : 'est'} plus présenté${item.gone > 1 ? 's' : ''}` : ''
  const mine = chosen && !first && item.kinds.includes('positions') ? people.find(p => p.id === chosen) : undefined

  // L'effet sur le classement : pour le candidat choisi s'il y en a un, sinon pour l'entrée, avec ce qui le cause
  let effect: preact.ComponentChildren = null
  if (mine) {
    const s = scoreLine(mine, item)
    const name = byId.get(mine.id)!.name
    effect = (
      <Fact label={`Pour ${name}`} cls={`jr-effect${s.yes ? ' is-yes' : ''}`}>
        {s.yes ? <b>{s.text.replace(/\.$/, '')}</b> : `${s.text.replace(/\.$/, '').replace(/^Sans/, 'sans').replace(/^Candidature non classée\u00a0: /, 'candidature non classée, ')}${levelOf(mine) === 'forme' ? ', approches inchangées' : ''}`}
      </Fact>
    )
  } else if (item.effect === 'peut-changer') {
    const why = reasons(item, people, byId)
    effect = (
      <Fact label="Classement" cls="jr-effect is-yes">
        <b>peut changer</b>
        {why ? ` — ${why}` : ''}
      </Fact>
    )
  } else if (item.effect === 'sans-effet') effect = <Fact label="Classement" cls="jr-effect">sans effet</Fact>
  else if (first) effect = <Fact label="Classement" cls="jr-effect">première version</Fact>

  // Ce que déplie « Lire la suite » : le texte, les précisions datées, candidat par candidat, les questions
  const text = (
    <div class="jr-text">
      {sentences(item.text).map((s, i) => (
        <p key={i}>{s}</p>
      ))}
      {item.notes.map(note => (
        <p class="jr-note" key={note.date + note.text}>
          <b>{`Précision du ${fullDate(note.date)}${NB}:`}</b> {note.text}
        </p>
      ))}
    </div>
  )
  const others = ranked.filter(p => p.id !== mine?.id)
  const perCandidate =
    item.kinds.includes('positions') && !first && others.length ? (
      <>
        <h4 class="jr-sub">{mine ? 'Les autres candidats' : 'Candidat par candidat'}</h4>
        <dl class="jr-who">
          {others.map(p => (
            <Who key={p.id} p={p} item={item} byId={byId} questionList={questionList} />
          ))}
        </dl>
        {item.gone ? <p class="jr-out-line">{`${gone.charAt(0).toUpperCase()}${gone.slice(1)}.`}</p> : null}
      </>
    ) : null
  const firstList = first ? (
    <>
      <h4 class="jr-sub">{`Les ${plural(everyone.length, 'candidat')}`}</h4>
      <p class="jr-names">
        {[...everyone]
          .sort((a, b) => place(a.id) - place(b.id))
          .map((c, i) => (
            <span key={c.id}>
              {i ? ', ' : ''}
              <Name c={c} />
            </span>
          ))}
      </p>
    </>
  ) : null
  const parts = item.parts.map(part => (
    <div key={part.label}>
      <h4 class="jr-sub">{part.label}</h4>
      {questionList(part.questions)}
    </div>
  ))

  const qs = mine ? mine.questions : item.questions
  const done = qs.filter(answered).length
  const more = qs.length ? ` · ${plural(qs.length, 'question')}${done ? `, vous avez répondu à ${done}` : ''}` : first ? ` · ${plural(everyone.length, 'candidat')}` : ''

  return (
    <li class="jr-entry">
      {/* À l'écran, les pictogrammes séparent les natures ; à la lecture vocale, une virgule entre elles, un point avant
          le numéro */}
      <p class="jr-head">
        <span class="jr-kinds">
          {item.kinds.map((k, i) => (
            <span key={k}>
              {i ? <span class="sr-only">, </span> : null}
              <Icon name={KIND_ICONS[k]} />
              {KIND_LABELS[k]}
            </span>
          ))}
          <span class="sr-only">. </span>
        </span>
        <span class="jr-n">{`N°${NB}${item.n}`}</span>
      </p>
      <h3 class="jr-title" id={`entree-${item.n}`} tabIndex={-1}>
        {item.title}
      </h3>
      <dl class="jr-facts">
        {everyone.length || item.gone ? (
          <Fact label={everyone.length + item.gone > 1 ? 'Candidats' : 'Candidat'}>
            {list.map((c, i) => (
              <span key={c.id}>
                {i ? ', ' : ''}
                <Name c={c} />
              </span>
            ))}
            {rest ? `${list.length ? ' et ' : ''}${list.length ? plural(rest, 'autre') : rest}` : ''}
            {gone ? (
              <span class="jr-out">
                {list.length || rest ? ' · ' : ''}
                {gone}
              </span>
            ) : null}
          </Fact>
        ) : null}
        {families.length ? <Fact label={families.length > 1 ? 'Thèmes' : 'Thème'}>{families.join(' · ')}</Fact> : null}
        {effect}
      </dl>
      <details class="jr-more" open={open} onToggle={e => onToggle((e.currentTarget as HTMLDetailsElement).open)}>
        <summary>
          <Icon name="chevron" class="disclosure" />
          <span class="jr-more-t">
            <span class="summary-label">Lire la suite</span>
            {more ? <span class="jr-more-n">{more}</span> : null}
          </span>
        </summary>
        <div class="jr-body">
          {mine ? (
            // Vue d'un candidat : sa ligne d'abord, et seulement ses questions ; le reste de l'entrée replié
            <>
              <dl class="jr-who is-mine">
                <Who p={mine} item={item} byId={byId} questionList={questionList} />
              </dl>
              <details class="jr-rest">
                <summary>
                  <Icon name="chevron" class="disclosure" />
                  <span class="summary-label">Le reste de l’entrée</span>
                </summary>
                {text}
                {perCandidate}
                {parts}
              </details>
            </>
          ) : (
            <>
              {text}
              {perCandidate}
              {firstList}
              {parts}
            </>
          )}
        </div>
      </details>
    </li>
  )
}

/** Ce qui peut changer le classement, en mots : candidats arrivés ou partis, questions complétées, positions revues */
function reasons(item: JournalItem, people: JournalPerson[], byId: Map<string, Candidate>): string {
  const out: string[] = []
  const arrivals = people.filter(p => levelOf(p) === 'arrivée').length + item.goneArrivals
  const rankedArrival = people.some(p => levelOf(p) === 'arrivée' && !item.unranked.includes(p.id)) || item.goneArrivals > 0
  if (arrivals && rankedArrival) out.push(`${plural(arrivals, 'candidat')} ajouté${arrivals > 1 ? 's' : ''}`)
  if (item.departed) out.push(`${plural(item.departed, 'candidat')} ne ${item.departed > 1 ? 'sont' : 'est'} plus présenté${item.departed > 1 ? 's' : ''}`)
  if (item.kinds.includes('questions')) {
    const n = new Set(item.parts.flatMap(p => p.questions)).size
    if (n) out.push(`${plural(n, 'question')} complétée${n > 1 ? 's' : ''}`)
  }
  const fond = people.filter(p => levelOf(p) === 'fond')
  if (fond.length > 2) out.push(`positions de ${plural(fond.length, 'candidat')}`)
  else if (fond.length) out.push(`position${fond.length > 1 ? 's' : ''} de ${fond.map(p => byId.get(p.id)?.name ?? p.id).join(' et ')}`)
  return out.join(', ')
}

/** Un fait de l'entrée : son libellé, puis sa valeur, sur la même ligne ; l'espace entre les deux permet la coupure */
function Fact({ label, cls, children }: { label: string; cls?: string; children: preact.ComponentChildren }) {
  return (
    <div class={cls}>
      <dt>{`${label}${NB}:`}</dt> <dd>{children}</dd>
    </div>
  )
}

function Questions({
  ids,
  questionById,
  topicLabel,
  answered,
}: {
  ids: readonly QuestionId[]
  questionById: Map<string, { id: string; prompt: string; topicId: string }>
  topicLabel: Map<string, string>
  answered: (id: QuestionId) => boolean
}) {
  return (
    <ol class="jr-questions">
      {ids.map(id => {
        const q = questionById.get(id)!
        return (
          <li key={id}>
            <a href={link(`/sujets/${id}`)}>
              <span>
                <span class="jr-q-theme">{topicLabel.get(q.topicId)}</span>
                <span class="jr-q-text">{q.prompt.replace(/ ([?!:;])/g, '\u00a0$1')}</span>
                {answered(id) ? (
                  <span class="jr-mine">
                    <Icon name="check" />
                    Vous y avez répondu
                  </span>
                ) : null}
              </span>
              <Icon name="arrow-right" />
            </a>
          </li>
        )
      })}
    </ol>
  )
}

interface EmptyProps {
  filters: JournalFilters
  items: JournalItem[]
  ctx: JournalContext
  total: number
  words: { byId: Map<string, Candidate>; familyLabel: Map<string, string>; sinceWords: (v: string) => string }
  onApply: (f: JournalFilters) => void
}

/** Aucune entrée : ce que retiennent les filtres, la dernière entrée de ce qui est choisi, et de quoi en sortir */
function Empty({ filters: f, items, ctx, total, words, onApply }: EmptyProps) {
  const keys = FILTER_KEYS.filter(k => !!f[k])
  const what = f.candidat
    ? (words.byId.get(f.candidat)?.name ?? '')
    : f.theme
      ? `«\u00a0${words.familyLabel.get(f.theme) ?? ''}\u00a0»`
      : f.change
        ? `«\u00a0${KIND_LABELS[f.change]}\u00a0»`
        : ''
  const since = f.depuis ? words.sinceWords(f.depuis) : ''
  const said = [what ? `sur ${what}` : '', since].filter(Boolean).join(' ')
  // Le reste des filtres sans la période : la dernière entrée de ce qui est choisi
  const last = keys.length > 1 && f.depuis ? items.find(i => matches(i, { ...f, depuis: undefined }, ctx)) : undefined
  const name: Record<FilterKey, string> = { candidat: 'Tous les candidats', theme: 'Tous les thèmes', change: 'Tout ce qui change', depuis: 'Tout le journal' }
  return (
    <div class="jr-empty-row">
      <div class="jr-empty">
        <p class="jr-empty-title">Aucune entrée pour ces filtres</p>
        <p>
          {`Rien ${said || 'ici'}.`}
          {last ? ` ${f.candidat ? 'Sa' : 'La'} dernière entrée date du ${fullDate(last.date)}.` : ''}
        </p>
        <ul class="jr-empty-actions">
          {keys.map(k => {
            const without = { ...f, [k]: undefined }
            return (
              <li key={k}>
                <button type="button" class="btn-text" onClick={() => onApply(without)}>
                  {`${name[k]} (${entries(items.filter(i => matches(i, without, ctx)).length)})`}
                </button>
              </li>
            )
          })}
          {keys.length > 1 ? (
            <li>
              <button type="button" class="btn-text" onClick={() => onApply({})}>
                {`Tout afficher (${entries(total)})`}
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  )
}
