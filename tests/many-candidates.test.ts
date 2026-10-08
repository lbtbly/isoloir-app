// Élection nombreuse : l'élection factice de 20 candidats (tests/fixtures/many-candidates.ts), son entrée de
// développement dans le registre, et l'affiche partagée, qui montre les 7 premiers puis « + N autres candidats »,
// et, règle « hors classement » de l'élection, le nombre de candidats connus sur trop peu de réponses pour être classés.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildExport } from '../src/core/exportData'
import { computeResults, displayScore, knownQuestions } from '../src/core/score'
import { othersText, posterRanking, POSTER_ROWS, unrankedText } from '../src/core/shareImage'
import { freshState } from '../src/core/storage'
import type { Answers } from '../src/core/types'
import { ELECTIONS } from '../src/elections'
import { isMany, MANY_CANDIDATES } from '../src/ui/many'
import { EXCLUDED, manyCandidates, MANY_ID, NARROW } from './fixtures/many-candidates'
import { pack } from './fixture'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const { candidates, bank, positions } = manyCandidates

/** Avis « d'accord » sur la première approche de chaque question du questionnaire rapide */
const answers: Answers = Object.fromEntries(
  bank.questions.filter(q => q.tier === 'essentiel').map(q => [q.id, { ratings: { [q.approaches[0]!.id]: 1 as const }, redLines: [] }]),
)

describe('élection factice de 20 candidats', () => {
  it('20 candidats aux identifiants et aux initiales uniques', () => {
    expect(candidates).toHaveLength(20)
    expect(new Set(candidates.map(c => c.id)).size).toBe(20)
    expect(new Set(candidates.map(c => c.initials)).size).toBe(20)
    expect(manyCandidates.election.id).toBe(MANY_ID)
  })

  it('positions sur les seules approches de la banque, connues sur une bonne part des questions (sauf la cause unique)', () => {
    const approaches = new Set(bank.questions.flatMap(q => q.approaches.map(a => a.id)))
    for (const c of candidates) {
      const mine = positions[c.id] ?? {}
      for (const id of Object.keys(mine)) expect(approaches.has(id), `${c.id} : ${id}`).toBe(true)
      const known = bank.questions.filter(q => q.approaches.some(a => mine[a.id])).length
      if (c.id === NARROW) expect(known / bank.questions.length, c.id).toBeLessThan(0.2)
      else expect(known / bank.questions.length, c.id).toBeGreaterThan(0.4)
    }
  })

  it('règle « hors classement » : la cause unique sort du classement au questionnaire rapide, les autres y restent', () => {
    expect(manyCandidates.election.ranking?.minCoverageShare).toBe(0.5)
    const r = computeResults(manyCandidates, answers, {}, 'seed')
    expect(r.unranked.map(x => x.candidateId)).toContain(NARROW)
    expect(r.ranking.map(x => x.candidateId)).not.toContain(NARROW)
    expect(r.ranking.length + r.unranked.length + r.excluded.length).toBe(20)
    for (const x of r.unranked) expect(x.coverage, x.candidateId).toBeLessThan(0.5)
    for (const x of r.ranking) expect(x.coverage, x.candidateId).toBeGreaterThanOrEqual(0.5)
  })

  it('exclusion d’essai : deux candidats non classés, ni au classement ni hors classement, les moins connus après la cause unique', () => {
    expect(manyCandidates.election.ranking?.excluded?.ids).toEqual(EXCLUDED)
    const r = computeResults(manyCandidates, answers, {}, 'seed')
    expect([...r.excluded].sort()).toEqual([...EXCLUDED].sort())
    const listed = [...r.ranking, ...r.unranked].map(x => x.candidateId)
    for (const id of EXCLUDED) expect(listed).not.toContain(id)
    const known = (id: string) => knownQuestions(manyCandidates, id)
    const most = Math.max(...EXCLUDED.map(known))
    for (const c of candidates) if (!EXCLUDED.includes(c.id) && c.id !== NARROW) expect(known(c.id), c.id).toBeGreaterThan(most)
  })

  it('l’entrée de développement du registre liste les mêmes candidats, et reste hors des tests', () => {
    const src = readFileSync(`${ROOT}src/elections/index.ts`, 'utf8')
    const entry = src.slice(src.indexOf(`id: '${MANY_ID}'`))
    const ids = [...entry.slice(entry.indexOf('candidateIds'), entry.indexOf(']')).matchAll(/'([a-z0-9-]+)'/g)].map(m => m[1])
    expect(ids).toEqual(candidates.map(c => c.id))
    expect(src).toMatch(/import\.meta\.env\.DEV && import\.meta\.env\.MODE !== 'test'/)
    expect(ELECTIONS.map(e => e.id)).not.toContain(MANY_ID)
  })
})

describe('mise en page d’une élection nombreuse', () => {
  it('au-delà de 8 candidats seulement', () => {
    expect(isMany(5)).toBe(false)
    expect(isMany(MANY_CANDIDATES)).toBe(false)
    expect(isMany(MANY_CANDIDATES + 1)).toBe(true)
  })

  it('affiche : tous les candidats jusqu’à 7, sinon les 7 premiers et les autres à part', () => {
    const few = computeResults(pack, { q1: { ratings: { q1a: 1 }, redLines: [] } }, {}, 'seed')
    expect(posterRanking(few, false)).toEqual({ shown: few.ranking, others: [] })
    const many = computeResults(manyCandidates, answers, {}, 'seed')
    const { shown, others } = posterRanking(many, false)
    expect(shown).toHaveLength(POSTER_ROWS)
    // Les seuls classés : les candidats hors classement ne sont ni sur l'affiche ni parmi les autres
    expect(others).toHaveLength(many.ranking.length - POSTER_ROWS)
    expect([...shown, ...others].map(r => r.candidateId)).not.toContain(NARROW)
    // Sans les croix, l'ordre de l'affinité seule (le pourcentage affiché), du plus proche au plus éloigné
    const scores = [...shown, ...others].map(r => displayScore(r.score) ?? -1)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    // Avec les croix, l'ordre du classement
    expect(posterRanking(many, true).shown.map(r => r.candidateId)).toEqual(many.ranking.slice(0, POSTER_ROWS).map(r => r.candidateId))
  })

  it('« + N autres candidats » : nombre, accord et étendue des pourcentages', () => {
    const many = computeResults(manyCandidates, answers, {}, 'seed')
    const rest = posterRanking(many, false).others
    expect(othersText(rest)).toMatch(new RegExp(`^${many.ranking.length - POSTER_ROWS}\u00a0autres candidats, de \\d+ à \\d+\u00a0%$`))
    expect(othersText(rest.slice(0, 1))).toMatch(/^1\u00a0autre candidat, à \d+\u00a0%$/)
    expect(othersText([{ ...rest[0]!, score: null }])).toBe('1\u00a0autre candidat')
  })

  it('candidats hors classement : une ligne sur l’affiche et dans son texte, leur seul nombre', () => {
    expect(unrankedText(1)).toBe('1\u00a0candidat hors classement (trop peu de positions connues)')
    expect(unrankedText(3)).toBe('3\u00a0candidats hors classement (trop peu de positions connues)')
  })

  it('le double (JSON) garde les candidats hors classement à la suite, sans rang ; rien ne change sans eux', () => {
    const many = computeResults(manyCandidates, answers, {}, 'seed')
    const file = buildExport(manyCandidates, freshState(MANY_ID, '1'), many)
    // Les non classés n'y ont ni score ni rang : à part, avec le motif et leur couverture de la banque
    expect(file.results).toHaveLength(20 - EXCLUDED.length)
    expect(file.nonClasses?.candidats.map(x => x.candidat).sort()).toEqual(
      EXCLUDED.map(id => candidates.find(c => c.id === id)!.name).sort(),
    )
    expect(file.nonClasses?.candidats.every(x => x.questionsDeLaBanque === bank.questions.length && x.questionsConnuesDansLaBanque < 40)).toBe(true)
    expect(file.nonClasses?.candidats.every(x => !('affinite' in x) && !('rang' in x))).toBe(true)
    const off = file.results.slice(many.ranking.length)
    expect(off.map(x => x.candidat)).toContain(candidates.find(c => c.id === NARROW)!.name)
    expect(off.every(x => x.rang === null && x.horsClassement === true && !x.exAequo)).toBe(true)
    expect(file.results.slice(0, many.ranking.length).every(x => typeof x.rang === 'number' && !('horsClassement' in x))).toBe(true)
    const few = computeResults(pack, { q1: { ratings: { q1a: 1 }, redLines: [] } }, {}, 'seed')
    expect(buildExport(pack, freshState('test', '1'), few).results.some(x => 'horsClassement' in x)).toBe(false)
    expect('nonClasses' in buildExport(pack, freshState('test', '1'), few)).toBe(false)
  })
})
