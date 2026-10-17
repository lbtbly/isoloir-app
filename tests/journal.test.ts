// Journal des données (page #/journal, décision du propriétaire du 17 octobre 2026, sur maquette) : les entrées
// structurées de election.ts (numéro, titre, versions, natures, effet sur le classement), leurs candidats tirés de
// l'historique des positions (journal.ts, généré par tools/build-journal.mjs), les filtres et l'adresse d'une vue
// filtrée (core/journal.ts). Le dépôt public n'a pas research/ : les comparaisons avec l'historique y sont sautées.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  JOURNAL_KINDS,
  TITLE_MAX,
  effectFrom,
  inPeriod,
  isArrival,
  journalItems,
  journalPath,
  levelOf,
  matches,
  newerVersion,
  parseJournalQuery,
  peopleFromHistory,
  type FilterValues,
  type HistoryLine,
  type JournalContext,
  type JournalItem,
} from '../src/core/journal'
import { updateMoves } from '../src/core/resultsCopy'
import type { ChangelogEntry, JournalPerson } from '../src/core/types'
import { elections } from '../src/elections/all'
import { candidates as rawCandidates } from '../src/elections/presidentielle-2027/candidates'
import { election } from '../src/elections/presidentielle-2027/election'
import { journal as rawJournal } from '../src/elections/presidentielle-2027/journal'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const HISTORY = join(ROOT, 'research/presidentielle-2027/positions-history.json')
const history: { entries: (HistoryLine & { id: string })[] } | null = existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, 'utf8')) : null
const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
const log = election.changelog
const questionIds = new Set(pack.bank.questions.map(q => q.id))
const hidden = new Set(election.hidden ?? [])
/** Les candidats d'une entrée, masqués compris (le fichier généré, avant l'export du pack) */
const peopleOf = (e: ChangelogEntry): JournalPerson[] => rawJournal[e.n!]?.people ?? []
/** Les questions d'une entrée : celles de ses candidats et de ses parties */
const questionsOf = (e: ChangelogEntry) => new Set([...peopleOf(e).flatMap(p => p.questions), ...(e.parts ?? []).flatMap(p => p.questions)])
const spaces = (t: string) => t.replace(/\s/g, ' ')

describe('journal des données : les entrées', () => {
  it('un numéro stable par entrée, de 1 au nombre d’entrées, dans l’ordre des dates', () => {
    const ns = log.map(e => e.n!)
    expect(ns.every(n => Number.isInteger(n))).toBe(true)
    expect([...ns].sort((a, b) => a - b)).toEqual(log.map((_, i) => i + 1))
    const byN = [...log].sort((a, b) => a.n! - b.n!)
    byN.forEach((e, i) => i && expect(e.date >= byN[i - 1]!.date, `N° ${e.n}`).toBe(true))
  })

  it.each(log.map(e => [e.n, e] as const))('N° %s : un titre court, ses natures, son effet, ses versions', (_, e) => {
    expect(e.title, `N° ${e.n}`).toBeTruthy()
    expect(e.title!.length, e.title).toBeLessThanOrEqual(TITLE_MAX)
    expect(e.title).not.toMatch(/\s$|^\s|\.$/)
    expect(e.kinds?.length).toBeGreaterThan(0)
    for (const k of e.kinds!) expect(JOURNAL_KINDS).toContain(k)
    expect(['peut-changer', 'sans-effet', 'première-version']).toContain(e.effect)
    expect(e.versions?.length).toBeGreaterThan(0)
    for (const v of e.versions!) {
      expect(v).toMatch(/^\d{4}-\d{2}-\d{2}\.\d+$/)
      // Une version publiée au plus tard le jour de l'entrée, jamais plus récente que les données
      expect(v.slice(0, 10) <= e.date, `${v} / ${e.date}`).toBe(true)
      expect(newerVersion(v, election.dataVersion), v).toBe(false)
    }
    // Les précisions venues après coup sont datées, à part, et non plus entre crochets dans le texte
    expect(e.text).not.toMatch(/\[précision/i)
    for (const note of e.notes ?? []) expect(note.date > e.date && /^\p{Lu}.*\.$/u.test(note.text), note.text).toBe(true)
  })

  it('tout candidat nommé dans le titre ou le texte est étiqueté, masqués compris', () => {
    const missing: string[] = []
    for (const e of log) {
      const tagged = new Set([...peopleOf(e).map(p => p.id), ...(e.named ?? []), ...(e.departed ?? [])])
      for (const c of rawCandidates) if (spaces(`${e.title} ${e.text}`).includes(spaces(c.name)) && !tagged.has(c.id)) missing.push(`N° ${e.n} : ${c.name}`)
    }
    expect(missing).toEqual([])
  })

  it('toute question citée entre guillemets est étiquetée, et toute question étiquetée est de la banque', () => {
    const missing: string[] = []
    for (const e of log) {
      const qs = questionsOf(e)
      for (const id of qs) expect(questionIds.has(id), `N° ${e.n} : ${id}`).toBe(true)
      for (const m of spaces(e.text).matchAll(/« ([^»]*?\?) »/g)) {
        const hit = pack.bank.questions.find(q => spaces(q.prompt) === m[1]!.trim())
        if (!hit || !qs.has(hit.id)) missing.push(`N° ${e.n} : « ${m[1]} »`)
      }
    }
    expect(missing).toEqual([])
  })

  it('les candidats étiquetés sont des candidats de l’élection, nommés, arrivés ou partis selon ce que dit l’entrée', () => {
    const ids = new Set(rawCandidates.map(c => c.id))
    for (const e of log) {
      for (const id of [...peopleOf(e).map(p => p.id), ...(e.named ?? []), ...(e.departed ?? []), ...(e.unranked ?? [])]) expect(ids.has(id), `N° ${e.n} : ${id}`).toBe(true)
      // Un candidat non classé à son arrivée arrive dans cette entrée
      for (const id of e.unranked ?? []) expect(peopleOf(e).some(p => p.id === id && isArrival(p)), `N° ${e.n} : ${id}`).toBe(true)
      // Les partis : des candidats masqués aujourd'hui
      for (const id of e.departed ?? []) expect(hidden.has(id), `N° ${e.n} : ${id}`).toBe(true)
    }
  })

  it('« peut changer le classement » si et seulement si une position change sur le fond, une question gagne une approche, ou un candidat classé arrive ou part', () => {
    for (const e of log) {
      expect(effectFrom(e, peopleOf(e)), `N° ${e.n} ${e.title}`).toBe(e.effect)
      if (/le classement ne change(nt)? pas/.test(e.text)) expect(e.effect, `N° ${e.n}`).toBe('sans-effet')
    }
    // La règle elle-même, sur des entrées d'essai
    const p = (id: string, cause: string, fond: boolean): JournalPerson => ({ id, causes: [{ cause, fond }], questions: cause.includes('candidat') ? [] : ['q-1'], statedAt: null })
    const e = (o: Partial<ChangelogEntry> = {}): ChangelogEntry => ({ date: '2026-10-20', text: 'Essai.', n: 99, kinds: ['positions'], ...o })
    expect(effectFrom(e(), [p('a', 'relecture', false), p('b', 'prise-de-position', false)])).toBe('sans-effet')
    expect(effectFrom(e(), [p('a', 'relecture', true)])).toBe('peut-changer')
    expect(effectFrom(e(), [p('a', 'nouvelle-approche', true)])).toBe('peut-changer')
    expect(effectFrom(e({ kinds: ['questions'] }), [])).toBe('peut-changer')
    expect(effectFrom(e(), [p('a', 'nouveau-candidat', true)])).toBe('peut-changer')
    expect(effectFrom(e({ unranked: ['a'] }), [p('a', 'nouveau-candidat', true)])).toBe('sans-effet')
    expect(effectFrom(e({ departed: ['x'] }), [])).toBe('peut-changer')
    expect(effectFrom(e({ kinds: ['site'] }), [])).toBe('sans-effet')
    expect(effectFrom(e(), [p('a', 'première-publication', true)])).toBe('première-version')
  })

  it('chaque candidat présenté a au moins une entrée : le menu du journal les propose tous', () => {
    const items = journalItems(pack)
    const without = pack.candidates.filter(c => !items.some(i => i.people.some(p => p.id === c.id) || i.named.includes(c.id))).map(c => c.name)
    expect(without).toEqual([])
  })

  it('les candidats masqués ne sont que comptés, à l’export du pack', () => {
    for (const [n, { people }] of Object.entries(pack.journal ?? {})) for (const p of people) expect(hidden.has(p.id), `N° ${n} : ${p.id}`).toBe(false)
    const items = new Map(journalItems(pack).map(i => [i.n, i]))
    // Les cinq candidats de la primaire ajoutés le 9 octobre, dont quatre ne sont plus présentés ; puis les quatre partis le 12
    expect(items.get(2)?.gone).toBe(4)
    expect(items.get(2)?.goneArrivals).toBe(4)
    expect(items.get(4)?.gone).toBe(4)
    expect(items.get(4)?.named).toEqual(['glucksmann'])
  })

  it('de la plus récente à la plus ancienne, par numéro', () => {
    const ns = journalItems(pack).map(i => i.n)
    expect(ns).toEqual([...ns].sort((a, b) => b - a))
  })
})

describe.runIf(!!history)('journal des données : l’historique des positions', () => {
  const entries = history?.entries ?? []

  it('journal.ts redonne l’historique (node tools/build-journal.mjs presidentielle-2027) : fond ou forme, causes et questions, candidat par candidat', () => {
    expect(peopleFromHistory(entries, log)).toEqual(rawJournal)
  })

  it('chaque ligne de l’historique a son entrée « Positions », une seule ; seules des relectures de forme peuvent n’en avoir aucune', () => {
    const problems: string[] = []
    for (const h of entries) {
      const homes = log.filter(e => e.kinds?.includes('positions') && !!h.dataVersion.after && e.versions?.includes(h.dataVersion.after))
      if (homes.length > 1) problems.push(`${h.id} : ${homes.length} entrées`)
      if (!homes.length && (h.change === 'fond' || h.cause !== 'relecture')) problems.push(`${h.id} (${h.cause}, ${h.change}) sans entrée`)
    }
    expect(problems).toEqual([])
  })

  it('une prise de position est datée, et seule elle peut dire « nouvelle déclaration »', () => {
    for (const people of Object.values(rawJournal))
      for (const p of people.people) if (p.causes.some(c => c.cause === 'prise-de-position')) expect(p.statedAt, p.id).toMatch(/^\d{4}-\d{2}(-\d{2})?$/)
  })
})

describe('journal des données : candidats tirés de l’historique', () => {
  const line = (candidateId: string, questionId: string, cause: string, change: 'fond' | 'forme', after: string, statedAt: string | null = null): HistoryLine => ({
    candidateId,
    questionId,
    cause,
    change,
    statedAt,
    dataVersion: { after },
  })
  const e: ChangelogEntry = { date: '2026-10-20', text: 'Essai.', n: 1, kinds: ['positions'], versions: ['2026-10-20.1', '2026-10-20.2'] }

  it('une ligne par cause, fond si une ligne l’est, questions hors arrivée, la date de prise de position la plus récente', () => {
    const out = peopleFromHistory(
      [
        line('b', 'q-2', 'relecture', 'forme', '2026-10-20.1'),
        line('b', 'q-1', 'relecture', 'fond', '2026-10-20.2'),
        line('b', 'q-3', 'prise-de-position', 'forme', '2026-10-20.2', '2026-10-18'),
        line('b', 'q-3', 'prise-de-position', 'forme', '2026-10-20.2', '2026-10-19'),
        line('a', 'q-1', 'nouveau-candidat', 'fond', '2026-10-20.1'),
        line('c', 'q-1', 'relecture', 'fond', '2026-10-19.1'),
      ],
      [e, { date: '2026-10-21', text: 'Sans positions.', n: 2, kinds: ['site'], versions: ['2026-10-19.1'] }],
    )
    expect(out).toEqual({
      1: {
        people: [
          { id: 'a', causes: [{ cause: 'nouveau-candidat', fond: true }], questions: [], statedAt: null },
          {
            id: 'b',
            causes: [
              { cause: 'relecture', fond: true },
              { cause: 'prise-de-position', fond: false },
            ],
            questions: ['q-1', 'q-2', 'q-3'],
            statedAt: '2026-10-19',
          },
        ],
      },
    })
    expect(levelOf(out[1]!.people[0]!)).toBe('arrivée')
    expect(levelOf(out[1]!.people[1]!)).toBe('fond')
    expect(levelOf({ id: 'x', causes: [{ cause: 'relecture', fond: false }], questions: [], statedAt: null })).toBe('forme')
  })
})

describe('journal des données : filtres et adresse', () => {
  const items = journalItems(pack)
  const families = (i: JournalItem) => (i.questions.length ? ['economie'] : [])
  const ctx: JournalContext = { families, answeredDay: '2026-10-12', seenVersion: '2026-10-14.1' }
  const valid: FilterValues = {
    candidat: new Set(pack.candidates.map(c => c.id)),
    theme: new Set(['economie', 'europe']),
    change: new Set(JOURNAL_KINDS),
    depuis: new Set(['2026-10-14', '2026-10-15']),
  }

  it('l’adresse fait l’aller-retour, sans jamais porter les choix calculés sur l’appareil', () => {
    for (const f of [{}, { candidat: 'retailleau' }, { theme: 'economie', change: 'positions' as const, depuis: '2026-10-14' }, { candidat: 'polony', depuis: '2026-10-15' }]) {
      const path = journalPath(f)
      expect(parseJournalQuery(path.slice('/journal'.length), valid), path).toEqual(f)
    }
    expect(journalPath({ depuis: 'passage' })).toBe('/journal')
    expect(journalPath({ depuis: 'reponses', candidat: 'retailleau' })).toBe('/journal?candidat=retailleau')
    // L'adresse ne peut pas non plus les demander : ni valeur inconnue, ni choix local, ni encodage cassé
    expect(parseJournalQuery('?candidat=inconnu&depuis=passage&change=tout&theme=%E0&x=1', valid)).toEqual({})
    expect(parseJournalQuery('depuis=reponses', valid)).toEqual({})
    expect(parseJournalQuery('', valid)).toEqual({})
  })

  it('la période : un jour compris ; après vos réponses, le jour exclu ; après votre dernier passage, par version des données', () => {
    const at = (date: string, versions: string[]) => ({ ...items[0]!, date, versions })
    expect(inPeriod(at('2026-10-14', ['2026-10-14.1']), '2026-10-14', ctx)).toBe(true)
    expect(inPeriod(at('2026-10-13', ['2026-10-12.1']), '2026-10-14', ctx)).toBe(false)
    expect(inPeriod(at('2026-10-12', ['2026-10-12.1']), 'reponses', ctx)).toBe(false)
    expect(inPeriod(at('2026-10-13', ['2026-10-12.1']), 'reponses', ctx)).toBe(true)
    expect(inPeriod(at('2026-10-15', ['2026-10-14.1']), 'passage', ctx)).toBe(false)
    expect(inPeriod(at('2026-10-15', ['2026-10-15.1', '2026-10-15.2']), 'passage', ctx)).toBe(true)
    expect(inPeriod(at('2026-10-15', ['2026-10-15.1']), 'passage', { ...ctx, seenVersion: null })).toBe(false)
    expect(inPeriod(at('2026-10-15', ['2026-10-15.1']), 'reponses', { ...ctx, answeredDay: null })).toBe(false)
    // Le 15 octobre : deux versions des données, 15.1 puis 15.2 ; un passage sur 15.1 ne garde que ce qui est venu après
    const seen151 = items.filter(i => inPeriod(i, 'passage', { ...ctx, seenVersion: '2026-10-15.1' })).map(i => i.n)
    expect(seen151.sort((a, b) => a - b)).toEqual([8, 11])
    expect(newerVersion('2026-10-15.10', '2026-10-15.9')).toBe(true)
    expect(newerVersion('n’importe quoi', '2026-10-15.9')).toBe(false)
  })

  it('un candidat : les entrées où ses positions changent, et celles qui le nomment', () => {
    const of = (candidat: string) => items.filter(i => matches(i, { candidat }, ctx)).map(i => i.n)
    expect(of('retailleau')).toEqual([8, 1])
    expect(of('glucksmann')).toEqual([6, 4, 2])
    expect(of('polony')).toEqual([6])
    // « Ce qui change » et le thème, et ce que garderait chaque autre choix (les pastilles)
    expect(items.filter(i => matches(i, { change: 'questions' }, ctx)).map(i => i.n)).toEqual([6])
    expect(items.filter(i => matches(i, { candidat: 'retailleau', change: 'questions' }, ctx, 'change')).length).toBe(2)
    expect(items.filter(i => matches(i, { theme: 'economie' }, ctx)).every(i => i.questions.length > 0)).toBe(true)
  })
})

describe('l’avis du dépouillement après une mise à jour des données : ce qui a bougé pour vous', () => {
  const r = (...xs: [string, number | null][]) => xs.map(([candidateId, score]) => ({ candidateId, score }))
  it('l’ordre d’abord, puis les scores, puis les arrivées et les départs ; sans repère, la phrase d’avant', () => {
    expect(updateMoves(null, r(['a', 60]))).toBe('Votre résultat a pu changer.')
    expect(updateMoves([], r(['a', 60]))).toBe('Votre résultat a pu changer.')
    expect(updateMoves(r(['a', 60], ['b', 50]), r(['a', 60], ['b', 50]))).toBe('Pour vous\u00a0: rien n’a bougé, même ordre, mêmes scores.')
    expect(updateMoves(r(['a', 60], ['b', 50]), r(['a', 61], ['b', 50]))).toBe('Pour vous\u00a0: même ordre, un score a bougé.')
    expect(updateMoves(r(['a', 60], ['b', 50]), r(['a', 61], ['b', 49]))).toBe('Pour vous\u00a0: même ordre, 2\u00a0scores ont bougé.')
    expect(updateMoves(r(['a', 60], ['b', 50], ['c', 40]), r(['b', 62], ['a', 60], ['c', 40]))).toBe('Pour vous\u00a0: 2\u00a0candidats ont changé de place.')
    expect(updateMoves(r(['a', 60], ['b', 50]), r(['a', 60], ['n', 55], ['b', 50]))).toBe('Pour vous\u00a0: même ordre pour les autres\u00a0; un candidat est entré au classement.')
    expect(updateMoves(r(['a', 60], ['x', 55], ['b', 50]), r(['a', 60], ['b', 51]))).toBe('Pour vous\u00a0: même ordre, un score a bougé\u00a0; un candidat l’a quitté.')
  })
})

describe('les liens vers le journal', () => {
  /** Les fichiers de src/, de proche en proche */
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap(f => {
      const p = join(dir, f)
      return statSync(p).isDirectory() ? files(p) : /\.(tsx?|css)$/.test(f) ? [p] : []
    })

  it('plus aucun texte ne dit que le journal est « en bas de la page Méthode », ni ne mène à son ancienne rubrique', () => {
    const found: string[] = []
    for (const f of files(join(ROOT, 'src'))) {
      const code = readFileSync(f, 'utf8')
      // Le texte tel qu'il s'affiche : sans les balises ni les espaces de JSX
      const text = code.replace(/\{' '\}/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ')
      if (/en bas de la page M[ée]thode/i.test(text) || /journal des données, en bas/i.test(text)) found.push(f.slice(ROOT.length))
      if (/link\(['`]\/methode\/journal/.test(code) || /SectionLink id="journal"/.test(code)) found.push(`${f.slice(ROOT.length)} (ancienne rubrique)`)
    }
    expect(found).toEqual([])
  })
})
