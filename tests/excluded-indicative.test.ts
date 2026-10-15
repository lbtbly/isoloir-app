// Score indicatif des candidats non classés (décision du propriétaire du 14 octobre 2026) : « donne quand même le score
// vis-à-vis de leurs positions connues uniquement, pour information uniquement ».
// - Le classement ne bouge pas d'un octet : sur des profils tirés par une graine (questionnaire rapide, banque entière,
//   peu de réponses, lignes rouges, priorités, qualifiés), tout ce que computeResults rendait avant (classement, hors
//   classement, tirage des ex aequo, écart, stabilité, « ce qui les sépare », « tous concernés », réponses comptées)
//   est identique à la référence figée (tests/fixtures/score-avant-2026-10-14.ts).
// - excludedResults suit l'ordre de excluded, et chaque score est celui du calcul commun (scoreCandidate), sans rang.
// - Aucun score montré pendant la tendance, ni pour un candidat connu sur aucune réponse ; et, depuis la décision du
//   propriétaire du 2026-10-15, aucun pour un non classé connu sur moins de EXCLUDED_MIN_KNOWN (5) de vos réponses
//   (la règle « hors classement » n'a pas ce seuil). Le double JSON garde le score calculé (décision : « Garder »).
// - Le double JSON le donne, toujours sans rang ; la primaire, qui n'a pas de non classés, n'en a aucun.
import { describe, expect, it } from 'vitest'
import { buildExport } from '../src/core/exportData'
import { mulberry32 } from '../src/core/rng'
import { computeResults, displayScore, EXCLUDED_MIN_KNOWN, excludedIds, excludedShown, indicativeShown, scoreCandidate, stance } from '../src/core/score'
import { freshState } from '../src/core/storage'
import type { Answers, CandidateId, ElectionPack, Question, Rating, TopicWeights } from '../src/core/types'
import { elections } from '../src/elections/all'
import { choisir2027 } from '../src/elections/choisir-2027'
import { computeResultsBefore } from './fixtures/score-avant-2026-10-14'
import { manyCandidates } from './fixtures/many-candidates'

const presidentielle = elections.find(p => p.election.id === 'presidentielle-2027') as ElectionPack

/** Électeur au hasard : parfois une question passée, des avis partagés, parfois une ligne rouge sur un « pas d'accord » */
function randomAnswers(questions: Question[], rand: () => number, red: number): Answers {
  const answers: Answers = {}
  for (const q of questions) {
    if (rand() < 0.06) {
      answers[q.id] = { ratings: {}, redLines: [], skipped: true }
      continue
    }
    const ratings: Record<string, Rating> = {}
    const redLines: string[] = []
    for (const a of q.approaches) {
      const x = rand()
      if (x < 0.45) continue
      ratings[a.id] = x < 0.75 ? 1 : -1
      if (ratings[a.id] === -1 && rand() < red) redLines.push(a.id)
    }
    answers[q.id] = { ratings, redLines }
  }
  return answers
}

interface Case {
  label: string
  answers: Answers
  weights: TopicWeights
  seed: string
  candidateIds?: CandidateId[]
}

/** Au moins 200 profils, graine fixe : la moitié avec des lignes rouges */
function cases(pack: ElectionPack, n: number, seed: number): Case[] {
  const rand = mulberry32(seed)
  const { bank, candidates } = pack
  const quick = bank.questions.filter(q => q.tier === 'essentiel')
  const step1 = bank.questions.filter(q => q.step === 1)
  const weights = (): TopicWeights => Object.fromEntries(bank.topics.filter(() => rand() < 0.2).map(t => [t.id, 2]))
  const out: Case[] = []
  for (let i = 0; i < n; i++) {
    const kind = i % 6
    const red = i % 2 ? 0.25 : 0
    const pool =
      kind === 0 ? step1 : kind === 1 || kind === 2 ? quick : kind === 3 ? bank.questions : bank.questions.filter(() => rand() < 0.1)
    const c: Case = {
      label: `profil ${i} (${['premier temps', 'rapide', 'rapide', 'banque', 'peu', 'qualifiés'][kind]})`,
      answers: randomAnswers(pool, rand, red),
      weights: kind === 2 || kind === 3 ? weights() : {},
      seed: `x-${seed}-${i}`,
    }
    // Qualifiés : une partie des candidats, non classés compris
    if (kind === 5) c.candidateIds = candidates.filter(() => rand() < 0.4).map(x => x.id)
    out.push(c)
  }
  // Tous les avis contraires et une ligne rouge sur chaque approche notée : tout le monde est concerné
  const all: Answers = Object.fromEntries(
    bank.questions.map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, -1 as Rating])), redLines: q.approaches.map(a => a.id) }]),
  )
  out.push({ label: 'toutes les lignes rouges', answers: all, weights: {}, seed: 'x-all' })
  out.push({ label: 'aucune réponse', answers: {}, weights: {}, seed: 'x-vide' })
  return out
}

const firm = (r: { dealbreakers: { level: string }[] }) => r.dealbreakers.filter(d => d.level === 'touche').length

describe('non classés : le classement est identique à celui d’avant le score indicatif', () => {
  for (const [name, pack, n] of [
    ['présidentielle 2027', presidentielle, 240],
    ['élection factice de 20 candidats', manyCandidates, 60],
    ['primaire « Choisir 2027 » (sans non classés)', choisir2027, 60],
  ] as const) {
    it(`${name} : ${n + 2} profils, lignes rouges comprises`, () => {
      let flaggedOff = 0
      let redProfiles = 0
      for (const c of cases(pack, n, 2026_10_14)) {
        const now = computeResults(pack, c.answers, c.weights, c.seed, c.candidateIds)
        const before = computeResultsBefore(pack, c.answers, c.weights, c.seed, c.candidateIds)
        const { excludedResults, ...rest } = now
        // À l'octet près : mêmes champs, mêmes valeurs, même ordre
        expect(JSON.stringify(rest), c.label).toBe(JSON.stringify(before))
        expect(rest, c.label).toEqual(before)
        // Aucun non classé au classement, ni hors classement, ni dans le tirage des ex aequo
        const off = new Set(excludedIds(pack))
        for (const r of [...now.ranking, ...now.unranked]) expect(off.has(r.candidateId), `${c.label} : ${r.candidateId}`).toBe(false)
        for (const id of now.drawOrder) expect(off.has(id), `${c.label} : ${id}`).toBe(false)
        expect(excludedResults.map(r => r.candidateId), c.label).toEqual(now.excluded)
        if (Object.values(c.answers).some(a => a.redLines.length)) redProfiles++
        flaggedOff += excludedResults.filter(r => !r.compatible).length
      }
      expect(redProfiles).toBeGreaterThan(n / 3)
      // Les lignes rouges touchent bien des non classés (sauf dans la primaire, qui n'en a pas)
      if (excludedIds(pack).length) expect(flaggedOff).toBeGreaterThan(0)
      else expect(flaggedOff).toBe(0)
    })
  }
})

describe('non classés : excludedResults', () => {
  const off = excludedIds(presidentielle)

  it('la présidentielle en a huit, Ségolène Royal (masquée) retirée de la liste', () => {
    expect([...off].sort()).toEqual(['asselineau', 'batho', 'becht', 'bertrand', 'bouamrane', 'lalanne', 'markovic', 'polony'])
  })

  it('suit l’ordre de excluded ; chaque score est celui du calcul commun (scoreCandidate), sans rang', () => {
    for (const c of cases(presidentielle, 40, 7)) {
      const r = computeResults(presidentielle, c.answers, c.weights, c.seed, c.candidateIds)
      expect(r.excludedResults.map(x => x.candidateId), c.label).toEqual(r.excluded)
      for (const x of r.excludedResults) {
        const ref = scoreCandidate(presidentielle, c.answers, c.weights, x.candidateId, presidentielle.positions)
        expect(x, `${c.label} : ${x.candidateId}`).toEqual({ ...ref, compatible: firm(ref) === 0 })
        expect('rank' in x || 'tied' in x).toBe(false)
      }
    }
  })

  it('le même calcul que s’il était classé : les questions où sa position est inconnue sortent de son calcul', () => {
    // Sans la décision, le même candidat est calculé comme les autres : même score, mêmes questions connues
    const free: ElectionPack = { ...presidentielle, election: { ...presidentielle.election, ranking: { minCoverageShare: 0.5 } } }
    const [c] = cases(presidentielle, 4, 99).slice(3)
    const r = computeResults(presidentielle, c!.answers, c!.weights, c!.seed)
    const ref = computeResults(free, c!.answers, c!.weights, c!.seed)
    for (const x of r.excludedResults) {
      const same = [...ref.ranking, ...ref.unranked].find(y => y.candidateId === x.candidateId)!
      expect(x.score, x.candidateId).toBe(same.score)
      expect(x.known, x.candidateId).toBe(same.known)
      expect(x.known, x.candidateId).toBeLessThanOrEqual(x.answered)
    }
  })

  it('aucun score montré pendant la tendance ; aucun pour un candidat connu sur aucune de vos réponses', () => {
    const step1 = presidentielle.bank.questions.filter(q => q.step === 1)
    const trend = computeResults(presidentielle, randomAnswers(step1, mulberry32(3), 0.2), {}, 'tendance')
    expect(trend.excludedResults.some(x => x.score !== null)).toBe(true)
    for (const x of trend.excludedResults) expect(indicativeShown(x, true), x.candidateId).toBeNull()
    for (const x of trend.unranked) expect(indicativeShown(x, true), x.candidateId).toBeNull()
    // Hors tendance : le score, tel quel
    for (const x of trend.excludedResults) expect(indicativeShown(x, false)).toBe(x.score)
    // Un candidat connu sur aucune réponse : seulement des questions où il n'a aucune position
    for (const id of off) {
      const table = presidentielle.positions[id]
      const blind = presidentielle.bank.questions.filter(q => q.approaches.every(a => stance(table?.[a.id]) === 0))
      const r = computeResults(presidentielle, randomAnswers(blind, mulberry32(5), 0), {}, 'aveugle')
      const x = r.excludedResults.find(y => y.candidateId === id)!
      expect(r.answered, id).toBeGreaterThan(0)
      expect(x.known, id).toBe(0)
      expect(x.score, id).toBeNull()
      expect(indicativeShown(x, false), id).toBeNull()
    }
  })

  it('score montré seulement si la position est connue sur au moins 5 de vos réponses ; jamais pendant la tendance', () => {
    // Décision du propriétaire du 2026-10-15
    expect(EXCLUDED_MIN_KNOWN).toBe(5)
    expect(excludedShown({ score: 61.2, known: 4 }, false)).toBeNull()
    expect(excludedShown({ score: 61.2, known: 5 }, false)).toBe(61.2)
    expect(excludedShown({ score: 61.2, known: 5 }, true)).toBeNull()
    let below = 0
    let above = 0
    let unrankedBelow = 0
    for (const c of cases(presidentielle, 120, 15)) {
      const r = computeResults(presidentielle, c.answers, c.weights, c.seed, c.candidateIds)
      for (const x of r.excludedResults) {
        expect(excludedShown(x, true), `${c.label} : ${x.candidateId}`).toBeNull()
        const shown = excludedShown(x, false)
        if (x.known >= EXCLUDED_MIN_KNOWN) {
          expect(shown, `${c.label} : ${x.candidateId}`).toBe(x.score)
          expect(shown, `${c.label} : ${x.candidateId}`).not.toBeNull()
          above++
        } else {
          expect(shown, `${c.label} : ${x.candidateId}`).toBeNull()
          if (x.score !== null) below++
        }
      }
      // Hors classement : la règle ne change pas, le score se montre hors tendance quel que soit le nombre de réponses
      for (const x of r.unranked) {
        expect(indicativeShown(x, false)).toBe(x.score)
        if (x.score !== null && x.known < EXCLUDED_MIN_KNOWN) unrankedBelow++
      }
    }
    // Les profils couvrent bien les deux côtés du seuil
    expect(above).toBeGreaterThan(0)
    expect(below).toBeGreaterThan(0)
    expect(unrankedBelow).toBeGreaterThan(0)
  })

  it('le double JSON garde le score calculé sous le seuil d’affichage, tendance comprise', () => {
    // Décision du propriétaire du 2026-10-15 : « Garder » ; seul l'affichage (page, PDF) dépend du seuil
    const step1 = presidentielle.bank.questions.filter(q => q.step === 1)
    let checked = 0
    for (let i = 0; i < 40 && !checked; i++) {
      const answers = randomAnswers(step1, mulberry32(100 + i), 0.1)
      const state = { ...freshState(presidentielle.election.id, presidentielle.election.dataVersion), answers }
      const r = computeResults(presidentielle, answers, {}, state.seed)
      const file = buildExport(presidentielle, state, r)
      r.excludedResults.forEach((x, k) => {
        const row = file.nonClasses!.candidats[k]!
        expect(row.affiniteIndicative).toBe(displayScore(x.score))
        if (x.score !== null && x.known < EXCLUDED_MIN_KNOWN) {
          expect(excludedShown(x, false)).toBeNull()
          expect(typeof row.affiniteIndicative).toBe('number')
          checked++
        }
      })
    }
    expect(checked).toBeGreaterThan(0)
  })

  it('le double JSON donne le score indicatif des non classés, hors tendance, et toujours aucun rang', () => {
    const quick = presidentielle.bank.questions.filter(q => q.tier === 'essentiel')
    const answers = randomAnswers(quick, mulberry32(11), 0.2)
    const state = { ...freshState(presidentielle.election.id, presidentielle.election.dataVersion), answers }
    const r = computeResults(presidentielle, answers, {}, state.seed)
    const file = buildExport(presidentielle, state, r)
    const name = new Map(presidentielle.candidates.map(c => [c.id, c.name]))
    expect(file.nonClasses?.candidats.map(x => x.candidat)).toEqual(r.excluded.map(id => name.get(id)))
    expect(file.nonClasses?.candidats.map(x => x.affiniteIndicative)).toEqual(r.excludedResults.map(x => displayScore(x.score)))
    expect(file.nonClasses?.candidats.some(x => typeof x.affiniteIndicative === 'number')).toBe(true)
    for (const x of file.nonClasses?.candidats ?? []) {
      expect(x).not.toHaveProperty('rang')
      expect(x).not.toHaveProperty('exAequo')
      expect(x).not.toHaveProperty('affinite')
      expect(x.questionsNotees).toBe(r.answered)
    }
    // Jamais parmi les résultats classés ou hors classement
    const offNames = new Set(r.excluded.map(id => name.get(id)))
    for (const x of file.results) expect(offNames.has(x.candidat), x.candidat).toBe(false)
  })

  it('la primaire (choisir-2027) n’a aucun non classé, donc aucun score indicatif ni bloc dans le double', () => {
    expect(excludedIds(choisir2027)).toEqual([])
    for (const c of cases(choisir2027, 12, 21)) {
      const r = computeResults(choisir2027, c.answers, c.weights, c.seed, c.candidateIds)
      expect(r.excludedResults, c.label).toEqual([])
      expect(r.excluded, c.label).toEqual([])
      expect(buildExport(choisir2027, freshState(choisir2027.election.id, '1'), r)).not.toHaveProperty('nonClasses')
    }
  })
})
