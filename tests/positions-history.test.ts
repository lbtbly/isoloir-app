// Historique des positions (research/presidentielle-2027/positions-history.json, décision du propriétaire du
// 2026-10-15) : son rejeu redonne positions.ts, la chaîne est cohérente, le format est stable, chaque entrée dit sa
// cause, et la consignation (tools/positions-history.mjs : appendFromBuild, appelée par build-pack à chaque BUILD,
// append, stamp, rebuild) est idempotente et part de l'état que l'historique connaît. Les cas connus sont bornés à
// leur jour, et les règles sur les causes valent pour tout BUILD : un rafraîchissement légitime de la veille
// automatique (décision du propriétaire du 17 octobre 2026) passe, un changement attribué au candidat sans date ni
// note propre de decisions.json est refusé.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import type { Position, PositionTable } from '../src/core/types'
import {
  CANDIDATE_CAUSES, CHANGE_CAUSES, CHANGE_KINDS, HISTORY_FORMAT, byCandidate, chainErrors, changeKinds, changeLevel, emptyHistory,
  labelAt, recordChanges, recordLabels, replay, stampDataVersion, stanceOf, withoutEmptyRows, type ChangeCause, type LabelQuestion,
  type PositionChange, type PositionsHistory,
} from '../src/core/positionsHistory'
import { appendFromBuild } from '../tools/positions-history.mjs'
import { positions } from '../src/elections/presidentielle-2027/positions'
import { election } from '../src/elections/presidentielle-2027/election'
import { candidates } from '../src/elections/presidentielle-2027/candidates'

const history: PositionsHistory = JSON.parse(
  readFileSync(new URL('../research/presidentielle-2027/positions-history.json', import.meta.url), 'utf8'),
)

/** Format d'une date de prise de position : AAAA-MM-JJ, ou AAAA-MM quand seul le mois est connu */
const STATED = /^\d{4}-\d{2}(-\d{2})?$/

/**
 * Les règles de toujours sur les causes, pour toute entrée, celles des BUILD de la veille automatique comprises
 * (décision du propriétaire du 17 octobre 2026) : aucune cause non précisée ; une cause qui attribue le changement au
 * candidat (CANDIDATE_CAUSES) a la date de sa prise de position, au plus tard le jour de l'entrée, et vient d'une note
 * propre de decisions.json (note et historyCause de la position), jamais d'une inférence ni d'une note d'ensemble
 * (historyNotes) ; aucune autre cause n'a de date. Rend « <id> : <règle> » pour chaque entrée qui en enfreint une
 */
function causeErrors(entries: readonly PositionChange[]): string[] {
  const out: string[] = []
  for (const e of entries) {
    if (e.cause === 'non-précisée') out.push(`${e.id} : cause non précisée`)
    if (CANDIDATE_CAUSES.includes(e.cause)) {
      if (!e.statedAt || !STATED.test(e.statedAt)) out.push(`${e.id} : prise de position sans date`)
      else if (e.statedAt > e.date) out.push(`${e.id} : prise de position datée après son entrée`)
      if (e.reasonFrom !== 'decisions.json' || !e.reason) out.push(`${e.id} : prise de position sans note propre de decisions.json`)
    }
    if (e.cause !== 'prise-de-position' && e.statedAt !== null) out.push(`${e.id} : date de prise de position pour la cause ${e.cause}`)
  }
  return out
}

/**
 * Les causes des cas connus, bornées à leurs jours (8, 14 et 15 octobre 2026) : vraies quelles que soient les entrées
 * des BUILD suivants
 */
function expectKnownCauses(entries: readonly PositionChange[]): void {
  expect(entries.filter(e => e.date === '2026-10-08').every(e => e.cause === 'première-publication')).toBe(true)
  const on = (date: string, c: string, a: string) => entries.find(e => e.date === date && e.candidateId === c && e.approachId === a)
  // 14 octobre : Natacha Polony entre, deux approches entrent dans la banque, le reste est une relecture
  const polony = entries.filter(e => e.candidateId === 'polony' && e.date === '2026-10-14')
  expect(polony.length).toBeGreaterThan(0)
  expect(polony.every(e => e.cause === 'nouveau-candidat')).toBe(true)
  expect(on('2026-10-14', 'cazeneuve', 'finances_publiques-1-h')?.cause).toBe('nouvelle-approche')
  expect(on('2026-10-14', 'philippe', 'finances_publiques-1-a')?.cause).toBe('relecture')
  // 15 octobre : le plan de Bruno Retailleau (12 octobre) est une prise de position ; l'inversion de Florian
  // Philippot, une relecture de son livret déjà cité
  expect(on('2026-10-15', 'retailleau', 'finances_publiques-1-a')).toMatchObject({ cause: 'prise-de-position', statedAt: '2026-10-12' })
  expect(on('2026-10-15', 'philippot', 'finances_publiques-1-g')).toMatchObject({ cause: 'relecture', statedAt: null })
  // Jusqu'au 15 octobre inclus, aucune autre prise de position consignée ; les suivantes suivent les règles de toujours
  const own = entries.filter(e => CANDIDATE_CAUSES.includes(e.cause) && e.date <= '2026-10-15')
  expect(own.length).toBeGreaterThan(0)
  expect(own.every(e => e.candidateId === 'retailleau')).toBe(true)
}

/** La raison d'un changement, telle que build-pack la tire de decisions.json (reasonOf de recordChanges) */
type Why = { reason: string | null; from: string | null; cause?: ChangeCause | null; statedAt?: string | null }
/** Jour d'un BUILD fictif de la veille, après les cas connus */
const FUTURE = '2026-10-20'
/**
 * L'historique réel suivi d'un BUILD fictif de la veille, le 20 octobre 2026 (recordChanges, comme build-pack) : pour
 * chaque candidat donné, sa première position connue change de résumé et de sources (par défaut, une source datée du
 * 18 octobre), avec la raison donnée. Rend toutes les entrées ; l'historique réel n'est pas touché
 */
function futureBuild(changes: Record<string, { why: Why | undefined; sources?: Position['sources'] }>): PositionChange[] {
  const h: PositionsHistory = structuredClone(history)
  const previous = replay(h.entries)
  const next: PositionTable = structuredClone(previous)
  for (const [id, { sources }] of Object.entries(changes)) {
    const [ap, p] = Object.entries(next[id] ?? {}).sort(([a], [b]) => a.localeCompare(b))[0]!
    next[id]![ap] = { ...p, summary: `${p.summary} Précisé depuis.`, sources: sources ?? [{ title: 'Entretien', url: 'https://exemple.fr/entretien', date: '2026-10-18' }] }
  }
  const stats = recordChanges(h, {
    date: FUTURE, origin: 'build-pack', previous, next, dataVersion: { before: election.dataVersion, after: null },
    reasonOf: c => changes[c.candidateId]?.why,
  })
  expect(stats).toEqual({ added: Object.keys(changes).length, updated: 0, removed: 0 })
  expect(chainErrors(h.entries)).toEqual([])
  return h.entries
}

describe('historique de la présidentielle', () => {
  it('le rejeu de toutes les entrées redonne positions.ts', () => {
    expect(withoutEmptyRows(replay(history.entries))).toEqual(withoutEmptyRows(positions))
  })

  it('chaîne cohérente : l’avant de chaque entrée est l’après de la précédente, dates dans l’ordre', () => {
    expect(chainErrors(history.entries)).toEqual([])
  })

  it('format stable', () => {
    expect(history.format).toBe(HISTORY_FORMAT)
    expect(history.electionId).toBe(election.id)
    const commits = new Set(history.retroactive?.commits.map(c => c.commit))
    const ids = new Set<string>()
    const keys = ['id', 'date', 'candidateId', 'questionId', 'approachId', 'rev', 'kinds', 'change', 'stance', 'cause', 'statedAt',
      'dataVersion', 'origin', 'commit', 'reason', 'reasonFrom', 'before', 'after']
    for (const e of history.entries) {
      expect(Object.keys(e).sort(), e.id).toEqual([...keys].sort())
      expect(ids.has(e.id), e.id).toBe(false)
      ids.add(e.id)
      expect(e.id, e.id).toMatch(new RegExp(`^${e.date}:${e.candidateId}:${e.approachId}(:\\d+)?$`))
      expect(e.date, e.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.approachId.startsWith(`${e.questionId}-`), e.id).toBe(true)
      expect(e.kinds.every(k => CHANGE_KINDS.includes(k)), e.id).toBe(true)
      expect(e.kinds, e.id).toEqual(changeKinds(e.before, e.after))
      expect(e.change, e.id).toBe(changeLevel(e.kinds))
      expect(e.stance, e.id).toEqual({ before: stanceOf(e.before), after: stanceOf(e.after) })
      expect(['rétroactif-git', 'build-pack'], e.id).toContain(e.origin)
      if (e.origin === 'rétroactif-git') expect(commits.has(e.commit ?? ''), e.id).toBe(true)
      else expect(e.commit, e.id).toBeNull()
      expect(!!e.reason, e.id).toBe(!!e.reasonFrom)
      expect(CHANGE_CAUSES, e.id).toContain(e.cause)
      // Date d'une prise de position : seulement pour cette cause, jamais après le jour où elle est consignée
      if (e.cause === 'prise-de-position') expect(e.statedAt && e.statedAt <= e.date, e.id).toBe(true)
      else expect(e.statedAt, e.id).toBeNull()
      // Libellé de l'approche tel que publié ce jour-là (sauf pour un retrait d'approche ou de question)
      if (e.after) expect(labelAt(history, 'approach', e.approachId, e.date), e.id).toBeTruthy()
      // Une entrée sans dataVersion d'arrivée attend la prochaine version : « stamp » après l'avoir changée
      if (e.dataVersion.after === null) expect(e.dataVersion.before, `${e.id} : node tools/positions-history.mjs stamp`).toBe(election.dataVersion)
    }
  })

  it('tout candidat de positions.ts, masqué ou non classé compris, a son historique', () => {
    const map = byCandidate(history.entries)
    for (const id of Object.keys(positions)) expect(map[id], id).toBeDefined()
    for (const id of election.hidden ?? []) expect(map[id], id).toBeDefined()
    for (const id of election.ranking?.excluded?.ids ?? []) {
      if (candidates.some(c => c.id === id)) expect(map[id], id).toBeDefined()
    }
  })

  it('cas connus du rétroactif (14 octobre 2026)', () => {
    const on = (date: string, c: string, a: string) => history.entries.find(e => e.date === date && e.candidateId === c && e.approachId === a)
    // Natacha Polony entre le 14 octobre : ce jour-là, rien que des ajouts, et rien d'elle avant. Ses changements
    // ultérieurs (veille automatique, décision du propriétaire du 17 octobre 2026) ne touchent pas ce cas.
    const polony = history.entries.filter(e => e.candidateId === 'polony' && e.date === '2026-10-14')
    expect(polony.length).toBeGreaterThan(0)
    expect(polony.every(e => e.kinds[0] === 'ajout')).toBe(true)
    expect(history.entries.filter(e => e.candidateId === 'polony' && e.date < '2026-10-14').map(e => e.id)).toEqual([])
    expect(on('2026-10-14', 'cazeneuve', 'finances_publiques-1-h')?.stance).toEqual({ before: 'inconnue', after: 'principale' })
    expect(on('2026-10-14', 'cazeneuve', 'finances_publiques-1-c')?.after?.weight).toBe(1)
    expect(on('2026-10-14', 'philippe', 'finances_publiques-1-a')?.stance).toEqual({ before: 'compatible', after: 'principale' })
    expect(on('2026-10-14', 'dupontaignan', 'finances_publiques-1-g')?.kinds).toEqual(['retrait'])
    const lepen = on('2026-10-14', 'lepen', 'europe-3-d')
    expect(lepen?.kinds).toEqual(['retrait'])
    expect(lepen?.reasonFrom).toBe('decisions.json')
    expect(lepen?.dataVersion).toEqual({ before: '2026-10-12.1', after: '2026-10-14.1' })
  })

  it('causes, règles de toujours : aucune non précisée ; un changement attribué au candidat a sa date et sa note de decisions.json', () => {
    expect(history.entries.filter(e => CANDIDATE_CAUSES.includes(e.cause)).length).toBeGreaterThan(0)
    expect(causeErrors(history.entries)).toEqual([])
  })

  it('causes des cas connus (8, 14 et 15 octobre 2026) ; jusqu’au 15, seules les prises de position de Bruno Retailleau', () => {
    expectKnownCauses(history.entries)
  })

  it('un BUILD postérieur de la veille : une prise de position datée d’un autre candidat passe ; sans date ni note, refusée', () => {
    // Le premier candidat, dans l'ordre, ni Bruno Retailleau (seules prises de position jusqu'au 15 octobre) ni Natacha
    // Polony (entrée le 14 octobre)
    const other = Object.keys(positions).filter(id => id !== 'retailleau' && id !== 'polony' && Object.keys(positions[id] ?? {}).length).sort()[0]!
    const own = (statedAt?: string | null): Why => ({ reason: 'AVANT : … APRÈS : … (veille)', from: 'decisions.json', cause: 'prise-de-position', statedAt })
    const ok = futureBuild({ [other]: { why: own('2026-10-18') }, polony: { why: { ...own(), cause: 'relecture' } } })
    expect(ok.filter(e => e.date === FUTURE).map(e => [e.candidateId, e.cause, e.statedAt]).sort()).toEqual(
      [[other, 'prise-de-position', '2026-10-18'], ['polony', 'relecture', null]].sort())
    expect(causeErrors(ok)).toEqual([])
    expectKnownCauses(ok)
    // Ce que les anciennes assertions, non bornées dans le temps, auraient refusé à tort
    expect(ok.filter(e => CANDIDATE_CAUSES.includes(e.cause)).every(e => e.candidateId === 'retailleau')).toBe(false)
    expect(ok.filter(e => e.candidateId === 'polony').every(e => e.date === '2026-10-14')).toBe(false)
    // Une source datée suffit à dater la prise de position (comme build-pack, latestSourceDate)
    expect(causeErrors(futureBuild({ [other]: { why: own() } }))).toEqual([])
    // Refusés : chacun donne exactement une erreur, sur l'entrée du 20 octobre
    const refused = (why: Why | undefined, sources?: Position['sources']) => {
      const errors = causeErrors(futureBuild({ [other]: { why, sources } }))
      expect(errors, JSON.stringify(why)).toHaveLength(1)
      expect(errors[0]!.startsWith(`${FUTURE}:${other}:`), errors[0]).toBe(true)
      return errors[0]!.replace(/^\S+ : /, '')
    }
    const undated = [{ title: 'Entretien', url: 'https://exemple.fr/entretien' }]
    expect(refused(own(), undated)).toBe('prise de position sans date')
    expect(refused(own('2026-10-21'))).toBe('prise de position datée après son entrée')
    expect(refused({ ...own('2026-10-18'), from: 'decisions.json (historyNotes)' })).toBe('prise de position sans note propre de decisions.json')
    expect(refused({ ...own('2026-10-18'), reason: null })).toBe('prise de position sans note propre de decisions.json')
    expect(refused({ ...own('2026-10-18'), cause: 'relecture' })).toBe('date de prise de position pour la cause relecture')
    expect(refused(undefined)).toBe('cause non précisée')
  })
})

// Consignation : tables jouets
const pos = (weight: 1 | 2 | undefined, summary = 'Résumé', extra: Partial<Position> = {}): Position => ({
  ...(weight ? { weight } : {}),
  nature: 'proposition',
  confidence: 'high',
  summary,
  sources: [{ title: 'Source', url: 'https://exemple.fr/a' }],
  ...extra,
})
const empty = (): PositionsHistory => emptyHistory('essai')
const record = (h: PositionsHistory, previous: PositionTable, next: PositionTable, date = '2026-10-15') =>
  recordChanges(h, { date, origin: 'build-pack', previous, next, dataVersion: { before: '2026-10-14.1', after: null } })

describe('consignation des changements', () => {
  const v1: PositionTable = { a: { 'q-1-a': pos(2), 'q-1-b': pos(1) }, b: { 'q-1-a': pos(undefined, 'Rejet', { rejects: true }) } }
  const v2: PositionTable = { a: { 'q-1-a': pos(1), 'q-1-c': pos(2) }, b: { 'q-1-a': pos(undefined, 'Rejet précisé', { rejects: true }) } }

  it('natures et portée : poids, ajout, retrait (fond) ; résumé, sources, confiance, nature (forme)', () => {
    const h = empty()
    expect(record(h, v1, v2)).toEqual({ added: 4, updated: 0, removed: 0 })
    const get = (c: string, a: string) => h.entries.find(e => e.candidateId === c && e.approachId === a)!
    expect(get('a', 'q-1-a').kinds).toEqual(['poids'])
    expect(get('a', 'q-1-a').stance).toEqual({ before: 'principale', after: 'compatible' })
    expect(get('a', 'q-1-b').kinds).toEqual(['retrait'])
    expect(get('a', 'q-1-c').kinds).toEqual(['ajout'])
    expect(get('b', 'q-1-a')).toMatchObject({ kinds: ['résumé'], change: 'forme', questionId: 'q-1' })
    expect(changeKinds(pos(1), pos(1, 'Résumé', { confidence: 'low', nature: 'inference', sources: [] }))).toEqual(['confiance', 'nature', 'sources'])
    expect(withoutEmptyRows(replay(h.entries))).toEqual(withoutEmptyRows(v2))
  })

  it('idempotence : rien ne change, rien n’est ajouté ; la même construction relancée n’ajoute rien', () => {
    const h = empty()
    expect(record(h, v1, v1)).toEqual({ added: 0, updated: 0, removed: 0 })
    record(h, v1, v2)
    const before = JSON.stringify(h)
    expect(record(h, v2, v2)).toEqual({ added: 0, updated: 0, removed: 0 })
    expect(JSON.stringify(h)).toBe(before)
  })

  it('même jour : deux constructions se fondent, un retour en arrière annule l’entrée', () => {
    const h = empty()
    const v3: PositionTable = { ...v2, a: { ...v2.a, 'q-1-a': pos(2, 'Autre résumé') } }
    record(h, v1, v2)
    expect(record(h, v2, v3)).toEqual({ added: 0, updated: 1, removed: 0 })
    const e = h.entries.find(x => x.approachId === 'q-1-a' && x.candidateId === 'a')!
    expect(e.kinds).toEqual(['résumé'])
    expect(e.before?.weight).toBe(2)
    // Candidat oublié (BUILD sans --include) puis rétabli le même jour : rien ne reste
    const h2 = empty()
    record(h2, v1, { b: v1.b! })
    expect(h2.entries).toHaveLength(2)
    expect(record(h2, { b: v1.b! }, v1)).toEqual({ added: 0, updated: 0, removed: 2 })
    expect(h2.entries).toHaveLength(0)
  })

  it('jours différents ou version déjà estampillée : nouvelle entrée, identifiant suffixé si la clé revient le même jour', () => {
    const h = empty()
    record(h, {}, v1, '2026-10-14')
    record(h, v1, v2, '2026-10-15')
    expect(stampDataVersion(h, '2026-10-15.1')).toBe(7)
    expect(h.entries.every(e => e.dataVersion.after === '2026-10-15.1')).toBe(true)
    expect(record(h, v2, v1, '2026-10-15')).toEqual({ added: 4, updated: 0, removed: 0 })
    expect(h.entries.some(e => e.id === '2026-10-15:a:q-1-a:2')).toBe(true)
    expect(record(h, v1, v2, '2026-10-16').added).toBe(4)
    expect(chainErrors(h.entries)).toEqual([])
    expect(withoutEmptyRows(replay(h.entries, '2026-10-15'))).toEqual(withoutEmptyRows(v1))
    expect(byCandidate(h.entries).a!['q-1']).toHaveLength(11)
  })
})

describe('libellés versionnés', () => {
  const bank = (a: string, extra = true): LabelQuestion[] => [
    { id: 'q-1', rev: 1, prompt: 'Question ?', approaches: [{ id: 'q-1-a', text: a }, ...(extra ? [{ id: 'q-1-b', text: 'B' }] : [])] },
  ]
  it('une reformulation garde l’ancien texte pour les anciennes dates ; relancer le même jour ne change rien', () => {
    const h = empty()
    expect(recordLabels(h, '2026-10-14', bank('A'))).toBe(3)
    expect(recordLabels(h, '2026-10-14', bank('A'))).toBe(0)
    recordLabels(h, '2026-10-16', bank('A reformulée', false))
    expect(labelAt(h, 'approach', 'q-1-a', '2026-10-15')).toBe('A')
    expect(labelAt(h, 'approach', 'q-1-a', '2026-10-16')).toBe('A reformulée')
    expect(labelAt(h, 'approach', 'q-1-b', '2026-10-16')).toBeNull()
    expect(labelAt(h, 'approach', 'q-1-b', '2026-10-15')).toBe('B')
    // Retour au texte d'origine le même jour : la version du jour disparaît
    recordLabels(h, '2026-10-16', bank('A'))
    expect(h.labels.approaches['q-1-a']).toHaveLength(1)
  })
})

// appendFromBuild (appelée par build-pack) et rebuild, sur des dossiers temporaires
const dirs: string[] = []
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})
const generated = (name: string, type: string, value: unknown) =>
  `// Fichier généré\nimport type { ${type} } from '../../core/types'\n\nexport const ${name}: ${type} = ${JSON.stringify(value, null, 2)}\n`
const toyBank = (approaches = ['q-1-a', 'q-1-b', 'q-1-c']): LabelQuestion[] => [
  { id: 'q-1', rev: 1, prompt: 'Question ?', approaches: approaches.map(id => ({ id, text: `Texte ${id}` })) },
  { id: 'q-2', rev: 1, prompt: 'Autre question ?', approaches: [{ id: 'q-2-a', text: 'Texte q-2-a' }] },
]
function toy(table: PositionTable, dataVersion = '2026-10-14.1') {
  const root = mkdtempSync(join(tmpdir(), 'historique-'))
  dirs.push(root)
  const researchDir = join(root, 'research', 'essai')
  const srcDir = join(root, 'src', 'essai')
  mkdirSync(researchDir, { recursive: true })
  mkdirSync(srcDir, { recursive: true })
  const h = empty()
  recordChanges(h, { date: '2026-10-14', origin: 'build-pack', previous: {}, next: table, dataVersion: { before: null, after: '2026-10-14.1' } })
  for (const e of h.entries) Object.assign(e, { cause: 'première-publication' })
  recordLabels(h, '2026-10-14', toyBank())
  writeFileSync(join(researchDir, 'positions-history.json'), JSON.stringify(h))
  const setVersion = (v: string) => writeFileSync(join(srcDir, 'election.ts'), `export const election = { dataVersion: '${v}' }\n`)
  setVersion(dataVersion)
  const writePositions = (t: PositionTable) => writeFileSync(join(srcDir, 'positions.ts'), generated('positions', 'PositionTable', t))
  writePositions(table)
  const read = (): PositionsHistory => JSON.parse(readFileSync(join(researchDir, 'positions-history.json'), 'utf8'))
  // Une construction : consigne puis écrit positions.ts, comme build-pack
  const build = (next: PositionTable, o: { date?: string; decisions?: unknown; bank?: LabelQuestion[]; write?: boolean; reasonOf?: unknown } = {}) => {
    const r = appendFromBuild({
      researchDir, srcDir, next, decisions: o.decisions ?? {}, bank: o.bank ?? toyBank(), date: o.date ?? '2026-10-15',
      questionOf: undefined, revOf: () => 1, reasonOf: o.reasonOf,
    })
    if (o.write !== false) writePositions(next)
    return r
  }
  return { root, researchDir, srcDir, setVersion, writePositions, read, build }
}

describe('appendFromBuild (chaque BUILD)', () => {
  const v1: PositionTable = { a: { 'q-1-a': pos(2), 'q-2-a': pos(1) }, b: { 'q-1-b': pos(2) } }
  const v2: PositionTable = { a: { 'q-1-a': pos(2, 'Résumé revu'), 'q-2-a': pos(1) }, b: { 'q-1-b': pos(2) } }

  it('relance sans changement : rien n’est ajouté', () => {
    const t = toy(v1)
    expect(t.build(v1)).toMatchObject({ added: 0, updated: 0, removed: 0, drift: false, diskDrift: false })
    expect(t.read().entries).toHaveLength(3)
  })

  it('entrées du jour estampillées, puis BUILD ou rattrapage : rien n’est ajouté, la chaîne reste cohérente', () => {
    const t = toy(v1)
    expect(t.build(v2)?.added).toBe(1)
    t.setVersion('2026-10-15.1')
    expect(t.build(v2)).toMatchObject({ added: 0, stamped: 1 })
    // Ancien défaut : comparer au positions.ts du dernier commit (ici v1) reconsignait le changement du jour
    t.writePositions(v1)
    expect(t.build(v2, { write: false })).toMatchObject({ added: 0, diskDrift: true })
    expect(chainErrors(t.read().entries)).toEqual([])
  })

  it('essai sans historique puis retour en arrière : rien ne reste ; essai gardé : consigné au BUILD suivant', () => {
    const t = toy(v1)
    t.writePositions(v2) // BUILD --no-history
    expect(t.build(v1)).toMatchObject({ added: 0, diskDrift: true })
    t.writePositions(v2) // BUILD --no-history, gardé
    expect(t.build(v2)?.added).toBe(1)
    const h = t.read()
    expect(chainErrors(h.entries)).toEqual([])
    expect(withoutEmptyRows(replay(h.entries))).toEqual(v2)
  })

  it('raisons et causes : decisions.json, retraits décidés, questions retirées, candidat retiré, inférence', () => {
    const t = toy(v1)
    const next: PositionTable = {
      a: { 'q-1-a': pos(2, 'Nouveau plan', { sources: [{ title: 'Plan', url: 'https://exemple.fr/p', date: '2026-10-12' }] }), 'q-1-d': pos(1) },
      c: { 'q-1-a': pos(1) },
    }
    const decisions = {
      positions: [{ candidate: 'a', approachId: 'q-2-a', remove: true, note: 'Retirée après vérification.', historyCause: 'relecture' }],
      drops: ['q-2'],
      _drops_note: 'q-2 doublait q-1.',
      historyNotes: { 'b:*': { note: 'Candidat retiré (étape 12).', cause: 'candidat-retiré' } },
    }
    const reasonOf = (c: string, ap: string) =>
      c === 'a' && ap === 'q-1-a' ? { reason: 'Plan du 12 octobre.', from: 'decisions.json', cause: 'prise-de-position' } : null
    t.build(next, { decisions, reasonOf, bank: toyBank(['q-1-a', 'q-1-b', 'q-1-c', 'q-1-d']).slice(0, 1) })
    const h = t.read()
    const get = (c: string, a: string) => h.entries.find(e => e.date === '2026-10-15' && e.candidateId === c && e.approachId === a)!
    expect(get('a', 'q-1-a')).toMatchObject({ cause: 'prise-de-position', statedAt: '2026-10-12', reasonFrom: 'decisions.json' })
    expect(get('a', 'q-1-d')).toMatchObject({ cause: 'nouvelle-approche', reason: null })
    expect(get('c', 'q-1-a')).toMatchObject({ cause: 'nouveau-candidat' })
    expect(get('a', 'q-2-a')).toMatchObject({ cause: 'relecture', reason: 'Retirée après vérification.' })
    expect(get('b', 'q-1-b')).toMatchObject({ cause: 'candidat-retiré', reason: 'Candidat retiré (étape 12).', reasonFrom: 'decisions.json (historyNotes)' })
    expect(labelAt(h, 'question', 'q-2', '2026-10-15')).toBeNull()
    expect(labelAt(h, 'question', 'q-2', '2026-10-14')).toBe('Autre question ?')
    // Question retirée sans décision propre : la note des drops, cause inférée
    const t2 = toy(v1)
    t2.build({ ...v1, a: { 'q-1-a': pos(2) } }, { decisions: { drops: ['q-2'], _drops_note: 'q-2 doublait q-1.' }, bank: toyBank().slice(0, 1) })
    expect(t2.read().entries.find(e => e.approachId === 'q-2-a' && e.date === '2026-10-15')).toMatchObject({
      cause: 'question-retirée', reason: 'Question retirée (decisions.drops) : q-2 doublait q-1.',
    })
  })

  it('dataVersion changée : estampillage avant la consignation du jour', () => {
    const t = toy(v1)
    t.build(v2)
    t.setVersion('2026-10-15.1')
    const v3: PositionTable = { ...v2, b: { 'q-1-b': pos(1) } }
    expect(t.build(v3, { date: '2026-10-16' })).toMatchObject({ added: 1, stamped: 1 })
    const h = t.read()
    expect(h.entries.find(e => e.date === '2026-10-15')?.dataVersion).toEqual({ before: '2026-10-14.1', after: '2026-10-15.1' })
    expect(h.entries.find(e => e.date === '2026-10-16')?.dataVersion).toEqual({ before: '2026-10-15.1', after: null })
  })

  it('dossier d’une autre élection, ou sans positions.ts : rien n’est fait', () => {
    const t = toy(v1)
    const other = join(t.root, 'src', 'autre')
    mkdirSync(other)
    writeFileSync(join(other, 'positions.ts'), generated('positions', 'PositionTable', {}))
    expect(appendFromBuild({ researchDir: t.researchDir, srcDir: other, next: v2, decisions: {} })).toBeNull()
    expect(appendFromBuild({ researchDir: t.researchDir, srcDir: join(t.root, 'src', 'neuf'), next: v2, decisions: {} })).toBeNull()
  })
})

describe('rebuild (rétroactif depuis git)', () => {
  it('reproductible : deux lancements donnent le même fichier ; causes inférées ; entrées build-pack gardées', () => {
    const root = mkdtempSync(join(tmpdir(), 'historique-git-'))
    dirs.push(root)
    const researchDir = join(root, 'research', 'essai')
    const srcDir = join(root, 'src', 'essai')
    mkdirSync(researchDir, { recursive: true })
    mkdirSync(srcDir, { recursive: true })
    const git = (...args: string[]) => execFileSync('git', ['-c', 'user.name=Essai', '-c', 'user.email=essai@exemple.invalid', ...args], {
      cwd: root, stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, GIT_AUTHOR_DATE: '2026-10-08T12:00:00+02:00', GIT_COMMITTER_DATE: '2026-10-08T12:00:00+02:00' },
    })
    const commit = (date: string, table: PositionTable, approaches: string[], version: string) => {
      writeFileSync(join(srcDir, 'positions.ts'), generated('positions', 'PositionTable', table))
      writeFileSync(join(srcDir, 'bank.ts'), generated('bank', 'QuestionBank', { questions: toyBank(approaches) }))
      writeFileSync(join(srcDir, 'election.ts'), `export const election = { dataVersion: '${version}' }\n`)
      git('add', '-A')
      execFileSync('git', ['-c', 'user.name=Essai', '-c', 'user.email=essai@exemple.invalid', 'commit', '-q', '-m', `Données du ${date}`], {
        cwd: root, stdio: 'ignore', env: { ...process.env, GIT_AUTHOR_DATE: `${date}T12:00:00+02:00`, GIT_COMMITTER_DATE: `${date}T12:00:00+02:00` },
      })
    }
    git('init', '-q')
    writeFileSync(join(researchDir, 'config.json'), JSON.stringify({ id: 'essai' }))
    commit('2026-10-08', { a: { 'q-1-a': pos(2) } }, ['q-1-a', 'q-1-b'], '2026-10-08.1')
    commit('2026-10-09', { a: { 'q-1-a': pos(1), 'q-1-c': pos(2) }, b: { 'q-1-b': pos(2) } }, ['q-1-a', 'q-1-b', 'q-1-c'], '2026-10-09.1')
    const tool = fileURLToPath(new URL('../tools/positions-history.mjs', import.meta.url))
    const run = () => execFileSync(process.execPath, [tool, 'rebuild', researchDir, srcDir, '--until', 'HEAD'], { cwd: root, stdio: 'pipe' })
    run()
    const first = readFileSync(join(researchDir, 'positions-history.json'), 'utf8')
    run()
    expect(readFileSync(join(researchDir, 'positions-history.json'), 'utf8')).toBe(first)
    const h: PositionsHistory = JSON.parse(first)
    expect(h.format).toBe(HISTORY_FORMAT)
    const get = (date: string, c: string, a: string) => h.entries.find(e => e.date === date && e.candidateId === c && e.approachId === a)!
    expect(get('2026-10-08', 'a', 'q-1-a').cause).toBe('première-publication')
    expect(get('2026-10-09', 'a', 'q-1-c').cause).toBe('nouvelle-approche')
    expect(get('2026-10-09', 'b', 'q-1-b').cause).toBe('nouveau-candidat')
    expect(get('2026-10-09', 'a', 'q-1-a')).toMatchObject({ kinds: ['poids'], cause: 'non-précisée', reason: 'Données du 2026-10-09', reasonFrom: 'commit' })
    expect(labelAt(h, 'approach', 'q-1-c', '2026-10-08')).toBeNull()
    expect(labelAt(h, 'approach', 'q-1-c', '2026-10-09')).toBe('Texte q-1-c')
    // Une entrée de build-pack ajoutée ensuite est gardée par un nouveau rebuild
    h.entries.push({ ...get('2026-10-09', 'b', 'q-1-b'), id: '2026-10-10:b:q-1-b', date: '2026-10-10', origin: 'build-pack', commit: null,
      kinds: ['retrait'], change: 'fond', stance: { before: 'principale', after: 'inconnue' }, cause: 'candidat-retiré', before: pos(2), after: null })
    writeFileSync(join(researchDir, 'positions-history.json'), JSON.stringify(h))
    writeFileSync(join(srcDir, 'positions.ts'), generated('positions', 'PositionTable', { a: { 'q-1-a': pos(1), 'q-1-c': pos(2) } }))
    run()
    const again: PositionsHistory = JSON.parse(readFileSync(join(researchDir, 'positions-history.json'), 'utf8'))
    expect(again.entries.at(-1)).toMatchObject({ id: '2026-10-10:b:q-1-b', cause: 'candidat-retiré' })
  })
})
