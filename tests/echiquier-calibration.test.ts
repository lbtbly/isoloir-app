// Calibration de la page « Mon profil politique » sur l'élection réelle (cahier des charges, § 4.2) : les clones des
// candidats classés sont lus de leur côté et presque jamais de l'autre ; des réponses tirées au hasard ne reçoivent
// qu'une lecture rare, également répartie entre les blocs quand les avis sont mêlés, moins également quand on n'approuve
// qu'une approche par question (ce que dit la Méthode, chiffres à l'appui) ; deux profils composés (la demande du
// propriétaire) se lisent comme on l'attend. Les bornes prennent environ 5 points de marge sous la mesure du 12 octobre 2026 : une mise à jour
// légitime des positions ne casse pas la CI, mais une borne franchie signale un changement à expliquer au journal.
// Les chiffres que publie la Méthode (ECHIQUIER_PUBLISHED) doivent rester à 5 points de la mesure ; sinon, relancer
// node tools/audit-echiquier.mjs, reporter ses chiffres et le dire au journal.
import { describe, expect, it } from 'vitest'
import { hasOpinion } from '../src/core/answers'
import { readEchiquier, type Echiquier, type ReadOptions } from '../src/core/echiquier'
import { ECHIQUIER_PUBLISHED } from '../src/core/echiquierMethodCopy'
import { computeResults, effectiveWeight } from '../src/core/score'
import type { ElectionPack, Question } from '../src/core/types'
import { elections } from '../src/elections/all'
import { isQuick, pct, profilesFor, type Scheme, type Tally, type Vector } from './fixtures/echiquier-profiles'

const pack = elections.find(p => p.election.id === 'presidentielle-2027')! as ElectionPack
const Q = pack.bank.questions
const { panel: axisBlocs, ranked, blocOf, CENTER, toAnswers, cloneLarge, noisy, randomProfile, compose, tally, count } = profilesFor(pack)

/** Les comptes d'une série de clones, en tout et bloc vrai par bloc vrai (perBloc) */
function clones(make: (id: string) => Map<string, Vector>[], opts: (id: string) => ReadOptions = () => ({})): Tally & { perBloc: Tally[] } {
  const acc = tally()
  const perBloc = axisBlocs.map(() => tally())
  for (const id of ranked)
    for (const v of make(id)) {
      const e = readEchiquier(pack, toAnswers(v), opts(id))
      count(acc, e, blocOf(id))
      count(perBloc[blocOf(id)]!, e, blocOf(id))
    }
  return { ...acc, perBloc }
}

const N_RANDOM = 200
/** Part de chaque bloc parmi les éléments de la synthèse (%) */
const summaryShares = (acc: Tally) => {
  const total = acc.summaryShare.reduce((a, b) => a + b, 0)
  return acc.summaryShare.map(n => pct(n, total))
}
/** Le seul questionnaire rapide se lit bien plus vite : cinq fois plus de profils, pour des parts stables */
function randoms(scheme: Scheme, only?: (q: Question) => boolean): Tally {
  const acc = tally()
  for (let i = 0; i < (only ? 5 * N_RANDOM : N_RANDOM); i++) count(acc, readEchiquier(pack, toAnswers(randomProfile(`echiquier:${scheme}${only ? '-rapide' : ''}:${i}`, scheme, only)), { draws: 199 }), null)
  return acc
}

describe('calibration sur l’élection réelle', { timeout: 120_000 }, () => {
  it('C1 : affinités d’un thème = topicScores, sur l’élection réelle', () => {
    const profiles = [cloneLarge('glucksmann'), cloneLarge('lepen'), cloneLarge('attal'), randomProfile('c1:1', 'audit'), randomProfile('c1:2', 'uniforme'), randomProfile('c1:3', 'un-choix')]
    for (const v of profiles) {
      const answers = toAnswers(v)
      const e = readEchiquier(pack, answers)
      const results = computeResults(pack, answers, {}, 'graine')
      const all = [...results.ranking, ...results.unranked]
      for (const t of e.themes)
        for (const [id, mine] of Object.entries(t.perCandidate)) {
          const ts = all.find(r => r.candidateId === id)!.topicScores[t.id] ?? null
          if (ts === null) expect(mine).toBeNull()
          else expect(Math.abs(ts - mine!)).toBeLessThan(1e-9)
        }
    }
  })

  const large = clones(id => [cloneLarge(id)])
  const largeWithout = clones(
    id => [cloneLarge(id)],
    id => ({ without: [id] }),
  )

  it('K1 à K6 : clones larges, avec le candidat dans le calcul (comme sur le site)', () => {
    expect(pct(large.read, large.themes), 'K1 thèmes lus').toBeGreaterThanOrEqual(55)
    expect(pct(large.hit, large.read), 'K2 juste').toBeGreaterThanOrEqual(85)
    expect(pct(large.sole, large.read), 'K3 seul').toBeGreaterThanOrEqual(60)
    expect(pct(large.wrong, large.themes), 'K4 mauvais côté').toBeLessThanOrEqual(1)
    expect(large.trueFar, 'K5 bloc vrai marqué ▽').toBe(0)
    expect(pct(large.famRead, large.families), 'K6 familles lues').toBeGreaterThanOrEqual(70)
    expect(pct(large.famHit, large.famRead), 'K6 familles justes').toBeGreaterThanOrEqual(90)
  })

  it('K7 à K9 : clones larges, sans le candidat (le test honnête de la grille)', () => {
    expect(pct(largeWithout.hit, largeWithout.read), 'K7 juste').toBeGreaterThanOrEqual(60)
    expect(pct(largeWithout.wrong, largeWithout.themes), 'K8 mauvais côté').toBeLessThanOrEqual(1)
    expect(pct(largeWithout.famHit, largeWithout.famRead), 'K9 familles justes').toBeGreaterThanOrEqual(70)
  })

  it('K10 et K11 : clones larges, questionnaire rapide seul', () => {
    const quick = clones(id => [cloneLarge(id, isQuick)])
    expect(pct(quick.famRead, quick.families), 'K10 familles lues').toBeGreaterThanOrEqual(40)
    expect(pct(quick.famHit, quick.famRead), 'K10 familles justes').toBeGreaterThanOrEqual(90)
    expect(pct(quick.cover, quick.answered), 'K11 thèmes couverts par la synthèse').toBeGreaterThanOrEqual(45)
  })

  it('K12 : clones bruités (six tirages par candidat)', () => {
    const noisyAcc = clones(id => Array.from({ length: 6 }, (_, s) => noisy(cloneLarge(id), `n:${id}:${s}`)))
    expect(pct(noisyAcc.wrong, noisyAcc.themes), 'K12 mauvais côté').toBeLessThanOrEqual(1.5)
    expect(pct(noisyAcc.hit, noisyAcc.read), 'K12 juste').toBeGreaterThanOrEqual(78)
  })

  const audit = randoms('audit')
  const uniform = randoms('uniforme')
  const oneChoice = randoms('un-choix')
  const softChoice = randoms('un-choix-doux')
  const oneChoiceQuick = randoms('un-choix', isQuick)
  const softChoiceQuick = randoms('un-choix-doux', isQuick)
  it('R1 à R7 : réponses tirées au hasard', () => {
    const agreeOnly = randoms('accord-seul')
    const allButOne = randoms('tout-sauf-un')
    for (const [name, acc] of [['audit', audit], ['uniforme', uniform], ['un-choix', oneChoice]] as const) expect(pct(acc.read, acc.themes), `R1 ${name}`).toBeLessThanOrEqual(10)
    for (const [name, acc] of [['accord-seul', agreeOnly], ['un-choix-doux', softChoice]] as const) expect(pct(acc.read, acc.themes), `R2 ${name}`).toBeLessThanOrEqual(12)
    for (const [name, acc] of [['audit', audit], ['uniforme', uniform], ['un-choix', oneChoice], ['un-choix-doux', softChoice], ['accord-seul', agreeOnly], ['tout-sauf-un', allButOne]] as const) {
      expect(pct(acc.famRead, acc.families), `R3 familles ${name}`).toBeLessThanOrEqual(11)
      // Un seul accord par question, rien d'autre : la façon de répondre qui reçoit le plus de lectures (2,4 mesurées)
      expect(acc.items / acc.profiles, `R4 lectures par profil ${name}`).toBeLessThanOrEqual(name === 'un-choix-doux' ? 3 : 2.6)
    }
    // R5 : avis mêlés, aucun bloc favorisé, parmi les ▲ comme dans la synthèse
    for (const [name, acc] of [['audit', audit], ['uniforme', uniform]] as const) {
      const total = acc.share.reduce((a, b) => a + b, 0)
      for (const [b, n] of acc.share.entries()) {
        expect(pct(n, total), `R5 ${name}, bloc ${b}`).toBeGreaterThanOrEqual(12)
        expect(pct(n, total), `R5 ${name}, bloc ${b}`).toBeLessThanOrEqual(30)
      }
      for (const [b, x] of summaryShares(acc).entries()) {
        expect(x, `R5 ${name}, synthèse, bloc ${b}`).toBeGreaterThanOrEqual(12)
        expect(x, `R5 ${name}, synthèse, bloc ${b}`).toBeLessThanOrEqual(30)
      }
    }
    // R6 : un seul accord par question, sur la banque entière et sur le seul questionnaire rapide. La répartition est
    // inégale (la Méthode le dit, voir plus bas) ; aucun bloc n'y disparaît ni n'y domine
    const oneChoiceThemes = oneChoice.share.reduce((a, b) => a + b, 0)
    for (const [b, n] of oneChoice.share.entries()) {
      expect(pct(n, oneChoiceThemes), `R6 un-choix, bloc ${b}`).toBeGreaterThanOrEqual(8)
      expect(pct(n, oneChoiceThemes), `R6 un-choix, bloc ${b}`).toBeLessThanOrEqual(35)
    }
    for (const [name, acc] of [['un-choix', oneChoice], ['un-choix-doux', softChoice], ['un-choix, rapide seul', oneChoiceQuick], ['un-choix-doux, rapide seul', softChoiceQuick]] as const)
      for (const [b, x] of summaryShares(acc).entries()) {
        expect(x, `R6 ${name}, synthèse, bloc ${b}`).toBeGreaterThanOrEqual(5)
        expect(x, `R6 ${name}, synthèse, bloc ${b}`).toBeLessThanOrEqual(40)
      }
    expect(pct(allButOne.read, allButOne.themes), 'R7 tout sauf un').toBeLessThanOrEqual(2)
  })

  it('P1 et P2 : les profils composés de la demande du propriétaire', () => {
    const near = (e: Echiquier, id: string) => e.themes.find(t => t.id === id)?.near ?? []
    const right = (bs: number[]) => bs.every(b => b > CENTER)
    // P1 : Mélenchon partout, Retailleau sur la sécurité, l'immigration et la laïcité
    const regalien = new Set(['securite_justice', 'immigration', 'laicite_republique'])
    const p1 = readEchiquier(pack, compose('melenchon', 'retailleau', regalien))
    for (const t of ['immigration', 'securite_justice']) {
      expect(near(p1, t).length, `P1 ${t}`).toBeGreaterThan(0)
      expect(right(near(p1, t)), `P1 ${t}`).toBe(true)
    }
    expect(near(p1, 'retraites'), 'P1 retraites').toContain(blocOf('melenchon'))
    for (const t of p1.themes.filter(x => !regalien.has(x.id))) expect(t.near.some(b => b > CENTER), `P1 ${t.id}`).toBe(false)
    // P2 : Glucksmann partout, Le Pen sur l'immigration
    const p2 = readEchiquier(pack, compose('glucksmann', 'lepen', new Set(['immigration'])))
    expect(near(p2, 'immigration').length).toBeGreaterThan(0)
    expect(right(near(p2, 'immigration'))).toBe(true)
    for (const t of p2.themes.filter(x => x.id !== 'immigration')) expect(t.near.some(b => b > CENTER), `P2 ${t.id}`).toBe(false)
  })

  it('les chiffres que publie la Méthode restent à 5 points de la mesure', () => {
    const P = ECHIQUIER_PUBLISHED
    expect(Math.abs(pct(largeWithout.hit, largeWithout.read) - P.hitWithout), 'juste, sans lui').toBeLessThanOrEqual(5)
    // Bloc vrai par bloc vrai : la fourchette publiée (« de 44 % à 91 % selon le bloc »)
    const byBloc = largeWithout.perBloc.filter(a => a.read).map(a => pct(a.hit, a.read))
    expect(Math.abs(Math.min(...byBloc) - P.hitWithoutMin), 'juste, sans lui, bloc le moins juste').toBeLessThanOrEqual(5)
    expect(Math.abs(Math.max(...byBloc) - P.hitWithoutMax), 'juste, sans lui, bloc le plus juste').toBeLessThanOrEqual(5)
    expect(Math.abs(pct(large.hit, large.read) - P.hitWith), 'juste, avec lui').toBeLessThanOrEqual(5)
    expect(Math.abs(pct(largeWithout.wrong, largeWithout.themes) - P.wrongSideWithout), 'mauvais côté, sans lui').toBeLessThanOrEqual(1)
    // Les glissements que nomme la Méthode, des deux côtés (sans lui) : gauche lue à l'extrême gauche ; centre et
    // extrême droite lus à droite ; droite lue au centre et à l'extrême droite
    const [EG, G, C, D, ED] = [0, 1, 2, 3, 4]
    const slips: [number, number][] = [[G, EG], [C, D], [ED, D], [D, C], [D, ED]]
    for (const [from, to] of slips) {
      const a = largeWithout.perBloc[from]!
      expect(pct(a.share[to]!, a.read), `clones du bloc ${from} lus au bloc ${to}`).toBeGreaterThanOrEqual(15)
    }
    expect(Math.abs(pct(audit.read, audit.themes) - P.randomThemes), 'thèmes lus au hasard').toBeLessThanOrEqual(5)
    expect(Math.abs(pct(softChoice.read, softChoice.themes) - P.randomThemesMax), 'thèmes lus au hasard, un seul accord').toBeLessThanOrEqual(5)
    expect(Math.abs(audit.items / audit.profiles - P.randomPerProfile), 'lectures par profil au hasard').toBeLessThanOrEqual(0.5)
    expect(Math.abs(softChoice.items / softChoice.profiles - P.randomPerProfileMax), 'lectures par profil au hasard, un seul accord').toBeLessThanOrEqual(0.5)
    // Un seul accord par question : la part moyenne des extrêmes, rapportée à celle de la gauche, dans la synthèse ;
    // sur la banque entière, puis sur le seul questionnaire rapide
    const ratio = (accs: Tally[]) => {
      const pooled = accs.reduce((n, acc) => n.map((x, b) => x + acc.summaryShare[b]!), axisBlocs.map(() => 0))
      return (pooled[EG]! + pooled[ED]!) / 2 / pooled[G]!
    }
    const full = ratio([oneChoice, softChoice])
    const quick = ratio([oneChoiceQuick, softChoiceQuick])
    expect(Math.abs(full - P.oneChoiceRatio), `rapport extrêmes / gauche, un seul accord, banque entière (${full.toFixed(2)})`).toBeLessThanOrEqual(0.5)
    expect(Math.abs(quick - P.oneChoiceRatioQuick), `rapport extrêmes / gauche, un seul accord, rapide seul (${quick.toFixed(2)})`).toBeLessThanOrEqual(0.5)
  })

  it('les réponses neutres ne comptent pas : une question sans avis n’ouvre aucune unité', () => {
    const e = readEchiquier(pack, { [Q[0]!.id]: { ratings: {}, redLines: [] } })
    expect(hasOpinion({ ratings: {}, redLines: [] })).toBe(false)
    expect(e.themes).toEqual([])
    expect(effectiveWeight(undefined)).toBe(0)
  })
})
