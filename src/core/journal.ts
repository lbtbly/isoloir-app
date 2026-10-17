// Journal des données (page #/journal, décision du propriétaire du 17 octobre 2026, sur maquette) : chaque changement
// des données, daté et numéroté, filtrable par candidat, thème, nature et période. Ce module ne fait que des calculs :
// les entrées du journal (election.changelog : texte, titre, versions, natures, effet sur le classement), leurs
// candidats (ElectionPack.journal, tirés de l'historique des positions par tools/build-journal.mjs), les filtres et
// l'adresse d'une vue filtrée. Les mots de la page sont dans ui/screens/Journal.tsx.
//
// L'adresse ne dit rien des réponses : les deux choix de la période calculés sur l'appareil (« après vos réponses »,
// « après votre dernier passage ») n'y vont jamais. Ils passent d'une page à l'autre en mémoire (ui/journalPreset.ts).
//
// Importé par la page du journal, chargée à la demande, et par les outils et les tests, jamais par le code de toutes
// les visites : l'accueil de retour et le dépouillement lisent le journal de l'élection directement (titre, numéro,
// effet). N'importe que des types : tools/build-journal.mjs s'en sert avec Node.

import type { CandidateId, ChangelogEntry, ElectionPack, JournalEffect, JournalKind, JournalPeople, JournalPerson, QuestionId } from './types'

/** Les natures d'une entrée, dans l'ordre du filtre « Ce qui change » et de la tête des entrées */
export const JOURNAL_KINDS: readonly JournalKind[] = ['candidats', 'positions', 'questions', 'explications', 'site']

/** Mêmes mots sur l'entrée, dans le menu et sur les pastilles */
export const KIND_LABELS: Record<JournalKind, string> = {
  candidats: 'Liste des candidats',
  positions: 'Positions',
  questions: 'Questions',
  explications: 'Fiches et vidéos',
  site: 'Calcul et pages du site',
}

/** Longueur maximale d'un titre d'entrée, en signes */
export const TITLE_MAX = 70

/** Causes de l'historique qui disent l'arrivée d'un candidat : toutes ses positions sont publiées d'un coup */
const ARRIVAL = new Set(['première-publication', 'nouveau-candidat'])

export const isArrival = (p: JournalPerson): boolean => p.causes.some(c => ARRIVAL.has(c.cause))

/** Ce qui arrive aux positions d'un candidat : il arrive, une position change sur le fond, ou seule sa justification */
export function levelOf(p: JournalPerson): 'arrivée' | 'fond' | 'forme' {
  if (isArrival(p)) return 'arrivée'
  return p.causes.some(c => c.fond) ? 'fond' : 'forme'
}

/** Une version des données, « 2026-10-15.2 », en clé comparable ; illisible : null */
function versionKey(v: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})\.(\d{1,6})$/.exec(v)
  return m ? `${m[1]}.${m[2]!.padStart(6, '0')}` : null
}

/** La version a est plus récente que b (deux versions lisibles) */
export function newerVersion(a: string, b: string): boolean {
  const x = versionKey(a)
  const y = versionKey(b)
  return !!x && !!y && x > y
}

/** Une ligne de l'historique des positions, telle que la lit le journal (core/positionsHistory.ts, PositionChange) */
export interface HistoryLine {
  candidateId: CandidateId
  questionId: QuestionId
  cause: string
  change: 'fond' | 'forme'
  statedAt: string | null
  dataVersion: { after: string | null }
}

/**
 * Les candidats de chaque entrée « Positions » du journal, tirés de l'historique : toutes ses lignes publiées avec les
 * versions de l'entrée, candidat par candidat (causes dans l'ordre de l'historique, questions hors arrivée, date de la
 * prise de position). Candidats masqués compris : l'export du pack les retire (core/visible.ts).
 */
export function peopleFromHistory(lines: readonly HistoryLine[], changelog: readonly ChangelogEntry[]): JournalPeople {
  const out: JournalPeople = {}
  for (const e of changelog) {
    if (e.n == null || !e.kinds?.includes('positions')) continue
    const versions = new Set(e.versions ?? [])
    const byId = new Map<CandidateId, JournalPerson>()
    for (const h of lines) {
      if (!h.dataVersion.after || !versions.has(h.dataVersion.after)) continue
      const p = byId.get(h.candidateId) ?? { id: h.candidateId, causes: [], questions: [], statedAt: null }
      const cause = p.causes.find(c => c.cause === h.cause)
      if (cause) cause.fond ||= h.change === 'fond'
      else p.causes.push({ cause: h.cause, fond: h.change === 'fond' })
      if (!ARRIVAL.has(h.cause) && !p.questions.includes(h.questionId)) p.questions.push(h.questionId)
      if (h.statedAt && (!p.statedAt || h.statedAt > p.statedAt)) p.statedAt = h.statedAt
      byId.set(h.candidateId, p)
    }
    const people = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id))
    for (const p of people) p.questions.sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
    out[e.n] = { people }
  }
  return out
}

/**
 * L'effet d'une entrée sur le classement, d'après ses candidats (masqués compris) : « peut-changer » si et seulement si
 * une position change sur le fond, une question gagne ou perd une approche, ou un candidat classé arrive ou part. La
 * première publication n'a pas d'avant. Les tests vérifient que chaque entrée dit le même effet (ChangelogEntry.effect).
 */
export function effectFrom(e: ChangelogEntry, people: readonly JournalPerson[]): JournalEffect {
  if (people.some(p => p.causes.some(c => c.cause === 'première-publication'))) return 'première-version'
  const unranked = new Set(e.unranked ?? [])
  const moves =
    people.some(p => levelOf(p) === 'fond') ||
    !!e.kinds?.includes('questions') ||
    people.some(p => isArrival(p) && !unranked.has(p.id)) ||
    (e.departed?.length ?? 0) > 0
  return moves ? 'peut-changer' : 'sans-effet'
}

/** Une entrée du journal, prête pour la page : ses candidats présentés et toutes les questions qu'elle touche */
export interface JournalItem {
  n: number
  date: string
  title: string
  text: string
  notes: { date: string; text: string }[]
  versions: string[]
  kinds: JournalKind[]
  effect: JournalEffect | null
  parts: { label: string; questions: QuestionId[] }[]
  /** Candidats présentés dont les positions changent */
  people: JournalPerson[]
  /** Candidats nommés sans que leurs positions changent */
  named: CandidateId[]
  unranked: CandidateId[]
  /** Candidats qui ne sont plus présentés : masqués de l'entrée, et partis avec elle */
  gone: number
  /** Parmi les candidats masqués de l'entrée, ceux qui arrivaient ce jour-là */
  goneArrivals: number
  departed: number
  questions: QuestionId[]
}

/**
 * Les entrées du journal d'une élection, de la plus récente à la plus ancienne (numéro décroissant : l'ordre de
 * publication, même à date égale). Une élection dont les entrées n'ont pas de numéro (la primaire) les reçoit dans
 * l'ordre des dates, et son texte pour titre.
 */
export function journalItems(pack: Pick<ElectionPack, 'election'> & Pick<Partial<ElectionPack>, 'journal'>): JournalItem[] {
  const log = pack.election.changelog
  const hidden = new Set(pack.election.hidden ?? [])
  const order = log.map((e, i) => ({ e, i })).sort((a, b) => a.e.date.localeCompare(b.e.date) || b.i - a.i)
  return order
    .map(({ e }, rank) => {
      const n = e.n ?? rank + 1
      const lines = pack.journal?.[n]
      const people = lines?.people ?? []
      const partQs = (e.parts ?? []).flatMap(p => p.questions)
      return {
        n,
        date: e.date,
        title: e.title ?? e.text,
        text: e.text,
        notes: e.notes ?? [],
        versions: e.versions ?? [],
        kinds: JOURNAL_KINDS.filter(k => e.kinds?.includes(k)),
        effect: e.effect ?? null,
        parts: e.parts ?? [],
        people,
        named: (e.named ?? []).filter(id => !hidden.has(id) && !people.some(p => p.id === id)),
        unranked: e.unranked ?? [],
        gone: (lines?.hidden?.count ?? 0) + (e.departed ?? []).filter(id => hidden.has(id)).length,
        goneArrivals: lines?.hidden?.arrivals ?? 0,
        departed: e.departed?.length ?? 0,
        questions: [...new Set([...people.flatMap(p => p.questions), ...partQs])],
      }
    })
    .sort((a, b) => b.n - a.n)
}

/** Les deux choix de la période calculés sur l'appareil, jamais dans l'adresse */
export type LocalSince = 'reponses' | 'passage'
export const LOCAL_SINCE: readonly LocalSince[] = ['reponses', 'passage']
export const isLocalSince = (v: string | undefined): v is LocalSince => v === 'reponses' || v === 'passage'

/** Les filtres du journal ; depuis : un jour (AAAA-MM-JJ, compris) ou un choix calculé sur l'appareil */
export interface JournalFilters {
  candidat?: CandidateId
  theme?: string
  change?: JournalKind
  depuis?: string
}

export const FILTER_KEYS = ['candidat', 'theme', 'change', 'depuis'] as const
export type FilterKey = (typeof FILTER_KEYS)[number]

/** Ce que les filtres doivent savoir de l'appareil et des thèmes, sans rien garder */
export interface JournalContext {
  /** Les familles de thèmes d'une entrée */
  families: (item: JournalItem) => readonly string[]
  /** Jour (à Paris) où le questionnaire rapide a été terminé, sur cet appareil ; null : pas de réponses */
  answeredDay: string | null
  /** Version des données du dernier passage, tant que l'avis de mise à jour n'est pas refermé ; null sinon */
  seenVersion: string | null
}

/** L'entrée passe le filtre de la période */
export function inPeriod(item: JournalItem, depuis: string | undefined, ctx: Pick<JournalContext, 'answeredDay' | 'seenVersion'>): boolean {
  if (!depuis) return true
  if (depuis === 'reponses') return !!ctx.answeredDay && item.date > ctx.answeredDay
  if (depuis === 'passage') return !!ctx.seenVersion && item.versions.some(v => newerVersion(v, ctx.seenVersion!))
  return item.date >= depuis
}

/** L'entrée passe les filtres ; skip : un filtre à ignorer (pour compter ce que garderait un autre choix) */
export function matches(item: JournalItem, f: JournalFilters, ctx: JournalContext, skip?: FilterKey): boolean {
  return (
    (skip === 'candidat' || !f.candidat || item.people.some(p => p.id === f.candidat) || item.named.includes(f.candidat)) &&
    (skip === 'theme' || !f.theme || ctx.families(item).includes(f.theme)) &&
    (skip === 'change' || !f.change || item.kinds.includes(f.change)) &&
    (skip === 'depuis' || inPeriod(item, f.depuis, ctx))
  )
}

/** Nombre de filtres posés */
export const activeFilters = (f: JournalFilters): number => FILTER_KEYS.filter(k => !!f[k]).length

/** Le chemin d'une vue du journal : les filtres en paramètres, jamais les choix calculés sur l'appareil */
export function journalPath(f: JournalFilters): string {
  const q = FILTER_KEYS.filter(k => f[k] && !(k === 'depuis' && isLocalSince(f[k]))).map(k => `${k}=${encodeURIComponent(f[k]!)}`)
  return `/journal${q.length ? `?${q.join('&')}` : ''}`
}

/** Les valeurs qu'une adresse peut porter : un filtre inconnu ou mal écrit est ignoré */
export interface FilterValues {
  candidat: ReadonlySet<string>
  theme: ReadonlySet<string>
  change: ReadonlySet<string>
  depuis: ReadonlySet<string>
}

/** Les filtres d'une adresse (« ?candidat=retailleau&depuis=2026-10-14 », point d'interrogation compris ou non) */
export function parseJournalQuery(query: string, valid: FilterValues): JournalFilters {
  const f: JournalFilters = {}
  for (const part of query.replace(/^\?/, '').split('&')) {
    const [key, raw = ''] = part.split('=')
    let value: string
    try {
      value = decodeURIComponent(raw)
    } catch {
      continue
    }
    if (key === 'candidat' && valid.candidat.has(value)) f.candidat = value
    if (key === 'theme' && valid.theme.has(value)) f.theme = value
    if (key === 'change' && valid.change.has(value)) f.change = value as JournalKind
    if (key === 'depuis' && valid.depuis.has(value)) f.depuis = value
  }
  return f
}
