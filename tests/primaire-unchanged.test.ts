// La primaire « Choisir 2027 » est en ligne, vote en cours : le moteur de score ne doit rien y changer.
// tests/fixtures/primaire-results.json garde le résultat complet (rangs, ex aequo, scores, écart, stabilité,
// « ce qui les sépare ») de profils fixés, calculé avant l'arrivée de la règle « hors classement » ; le moteur
// d'aujourd'hui doit le reproduire à l'identique.
// Les positions de la primaire changent (nouvelle dataVersion) : régénérer, après avoir vérifié que la seule
// différence vient des données, avec UPDATE_GOLDEN=1 npx vitest run tests/primaire-unchanged.test.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { computeResults, stance, type Results } from '../src/core/score'
import { mulberry32 } from '../src/core/rng'
import type { Answers, ElectionPack, Question, Rating, TopicWeights } from '../src/core/types'
import { choisir2027 } from '../src/elections/choisir-2027'

const GOLDEN = new URL('./fixtures/primaire-results.json', import.meta.url)
const pack: ElectionPack = choisir2027
const { bank, candidates, positions } = pack

/** Électeur au hasard : un peu plus de la moitié des approches sans avis, le reste partagé ; parfois une ligne rouge */
function randomAnswers(questions: Question[], rand: () => number, redLines = false): Answers {
  const answers: Answers = {}
  for (const q of questions) {
    const roll = rand()
    if (roll < 0.08) {
      answers[q.id] = { ratings: {}, redLines: [], skipped: true }
      continue
    }
    const ratings: Record<string, Rating> = {}
    const lines: string[] = []
    for (const a of q.approaches) {
      const r = rand()
      if (r < 0.5) continue
      ratings[a.id] = r < 0.75 ? 1 : -1
      if (redLines && ratings[a.id] === -1 && rand() < 0.15) lines.push(a.id)
    }
    answers[q.id] = { ratings, redLines: lines }
  }
  return answers
}

/** Profil d'un électeur qui pense exactement comme un candidat */
function candidateProfile(candidateId: string): Answers {
  const answers: Answers = {}
  for (const q of bank.questions) {
    const ratings: Record<string, Rating> = {}
    for (const a of q.approaches) {
      const v = stance(positions[candidateId]?.[a.id])
      if (v !== 0) ratings[a.id] = v > 0 ? 1 : -1
    }
    if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
  }
  return answers
}

interface Case {
  label: string
  answers: Answers
  weights: TopicWeights
  seed: string
  candidateIds?: string[]
}

function cases(): Case[] {
  const rand = mulberry32(17)
  const step1 = bank.questions.filter(q => q.step === 1)
  const quick = bank.questions.filter(q => q.tier === 'essentiel')
  const deep = bank.questions.filter(q => q.tier === 'approfondi')
  const out: Case[] = []
  const weights = (): TopicWeights =>
    Object.fromEntries(bank.topics.filter(() => rand() < 0.25).map(t => [t.id, rand() < 0.7 ? 2 : 0.5])) as TopicWeights
  for (let i = 0; i < 10; i++) out.push({ label: `premier temps ${i}`, answers: randomAnswers(step1, rand), weights: {}, seed: `g-s1-${i}` })
  for (let i = 0; i < 12; i++) out.push({ label: `rapide ${i}`, answers: randomAnswers(quick, rand), weights: {}, seed: `g-q-${i}` })
  for (let i = 0; i < 6; i++) out.push({ label: `rapide pondéré ${i}`, answers: randomAnswers(quick, rand), weights: weights(), seed: `g-qw-${i}` })
  for (let i = 0; i < 6; i++)
    out.push({ label: `lignes rouges ${i}`, answers: randomAnswers(quick, rand, true), weights: {}, seed: `g-r-${i}` })
  for (let i = 0; i < 6; i++)
    out.push({ label: `banque entière ${i}`, answers: randomAnswers(bank.questions, rand, i % 2 === 0), weights: weights(), seed: `g-b-${i}` })
  // Peu de réponses, prises dans l'approfondissement : des candidats connus sur une partie seulement
  for (let i = 0; i < 6; i++) {
    const few = deep.filter(() => rand() < 0.08)
    out.push({ label: `quelques questions approfondies ${i}`, answers: randomAnswers(few, rand), weights: {}, seed: `g-d-${i}` })
  }
  for (const c of candidates) out.push({ label: `profil de ${c.id}`, answers: candidateProfile(c.id), weights: {}, seed: `g-c-${c.id}` })
  // Seulement les qualifiés pour le second tour
  for (let i = 0; i < 4; i++) {
    const ids = candidates.filter(() => rand() < 0.5).map(c => c.id)
    const pair = ids.length >= 2 ? ids : candidates.slice(0, 2).map(c => c.id)
    out.push({ label: `finalistes ${i}`, answers: randomAnswers(quick, rand), weights: {}, seed: `g-f-${i}`, candidateIds: pair })
  }
  out.push({ label: 'aucune réponse', answers: {}, weights: {}, seed: 'g-vide' })
  return out
}

const round = (x: number | null) => (x === null ? null : Math.round(x * 1e6) / 1e6)

/** Tout ce que le résultat montre de la primaire, dans l'ordre */
function digest(r: Results) {
  return {
    answered: r.answered,
    redLineCount: r.redLineCount,
    close: r.close,
    stable: r.stable,
    allIncompatible: r.allIncompatible,
    why: r.why.map(w => [w.questionId, round(w.delta)]),
    ranking: r.ranking.map(x => ({
      id: x.candidateId,
      rank: x.rank,
      tied: x.tied,
      score: round(x.score),
      raw: round(x.rawScore),
      known: x.known,
      partial: x.partialData,
      compatible: x.compatible,
      simple: x.simpleCount,
      dealbreakers: x.dealbreakers.length,
      topics: Object.fromEntries(Object.entries(x.topicScores).map(([k, v]) => [k, round(v)])),
    })),
  }
}

function compute() {
  return cases().map(c => ({
    label: c.label,
    result: digest(computeResults(pack, c.answers, c.weights, c.seed, c.candidateIds)),
  }))
}

describe('primaire « Choisir 2027 » : résultats inchangés', () => {
  it('sans règle de classement : aucun candidat hors classement', () => {
    expect(pack.election.ranking).toBeUndefined()
    for (const c of cases()) {
      const r = computeResults(pack, c.answers, c.weights, c.seed, c.candidateIds)
      expect(r.unranked, c.label).toEqual([])
      expect(r.ranking).toHaveLength(c.candidateIds?.length ?? candidates.length)
    }
  })

  it('les mêmes rangs, scores, écarts et notes qu’avant la règle « hors classement », sur des profils fixés', () => {
    const now = { dataVersion: pack.election.dataVersion, cases: compute() }
    // Un cas par ligne : un écart se lit dans le diff
    if (process.env.UPDATE_GOLDEN)
      writeFileSync(
        GOLDEN,
        `{"dataVersion":${JSON.stringify(now.dataVersion)},"cases":[\n${now.cases.map(c => JSON.stringify(c)).join(',\n')}\n]}\n`,
      )
    const golden = JSON.parse(readFileSync(GOLDEN, 'utf8')) as typeof now
    expect(golden.dataVersion, 'données de la primaire changées : régénérer le fichier (voir en tête)').toBe(now.dataVersion)
    expect(now.cases.length).toBe(golden.cases.length)
    for (let i = 0; i < now.cases.length; i++) expect(now.cases[i], golden.cases[i]!.label).toEqual(golden.cases[i])
  })
})
