// Ce qui pèse le plus dans une lecture nette (lot 3, A3 ; core/echiquierWeigh.ts) : la part de chaque question face à une
// force brute écrite à part (questionScore de core/score.ts, les placements distincts recomptés ici) ; sans position de
// confiance basse, les parts font exactement l'écart affiché, et les parts des avis celle de la question ; avec elles, un
// reste, seulement là ; l'approche citée, la plus grande part d'avis ; les égalités, à l'ordre de la banque et des
// approches ; l'inversion de tous les avis, qui change le signe de chaque part ; les quatre suites, chacune vraie au
// regard des positions, les candidats connus comptés à part de ceux que la grille classe là ; une fiche par suite de
// blocs ; les points du détail, qui font l'écart du tableau ; rien sur des réponses changées depuis la lecture ; le temps
// d'une ligne de famille sur un téléphone lent ; rien de tiré au sort. Sur la petite élection factice
// (tests/fixtures/echiquier.ts) et sur l'élection réelle.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { panelOf, readEchiquier, segments, type Echiquier, type UnitReading } from '../src/core/echiquier'
import { weighOf, type Weigh } from '../src/core/echiquierWeigh'
import { apportion, weighWho } from '../src/core/echiquierWeighCopy'
import { where } from '../src/core/echiquierCopy'
import { questionScore, stance } from '../src/core/score'
import type { Answers, ElectionPack, Position, Question, Rating } from '../src/core/types'
import { elections } from '../src/elections/all'
import { answersOf, echiquierPack } from './fixtures/echiquier'
import { isQuick, profilesFor } from './fixtures/echiquier-profiles'

const real = elections.find(p => p.election.id === 'presidentielle-2027')!
const P = profilesFor(real)
const units = (e: Echiquier) => [...e.themes, ...e.families]
const read = (e: Echiquier) => units(e).filter(u => u.status === 'lecture')

/** Le pack sans aucune position de confiance basse : chaque candidat est connu, ou non, sur une question, quelle que soit la façon de poser les avis */
function withoutLow(pack: ElectionPack): ElectionPack {
  const positions: ElectionPack['positions'] = {}
  for (const [id, table] of Object.entries(pack.positions)) positions[id] = Object.fromEntries(Object.entries(table).filter(([, p]) => p.confidence !== 'low'))
  return { ...pack, positions }
}
const realNoLow = withoutLow(real)

/** Une fiche d'une lecture nette où la grille classe dans les blocs de la suite plus de candidats que de connus */
type PartialCard = { u: UnitReading; w: Weigh; key: string }
/**
 * Les cas de la contre-vérification du lot 3, cherchés dans les données du jour : graine par graine (« n:<id>:<s> »,
 * celles de sheets), les clones bruités de chaque candidat classé, jusqu'à une fiche à phrase (suite) d'un seul connu
 * parmi plusieurs candidats de la grille, et une de plusieurs connus parmi plus encore ; au plus PARTIAL_SEEDS graines
 */
const PARTIAL_SEEDS = 60
function partialCards(): { one?: PartialCard; many?: PartialCard; sheets: number } {
  let one: PartialCard | undefined
  let many: PartialCard | undefined
  let sheets = 0
  for (let s = 0; s < PARTIAL_SEEDS && !(one && many); s++) {
    for (const id of P.ranked) {
      const answers = P.toAnswers(P.noisy(P.cloneLarge(id), `n:${id}:${s}`))
      sheets++
      for (const u of read(readEchiquier(real, answers))) {
        for (const w of weighOf(real, answers, u)) {
          if (!w.suite || w.known >= w.size) continue
          const card = { u, w, key: `n:${id}:${s} ${u.kind}-${u.id}, blocs ${w.seg.join('-')}` }
          if (w.known === 1) one ??= card
          else many ??= card
        }
      }
      if (one && many) break
    }
  }
  return { one, many, sheets }
}

/** Des feuilles réelles : clones bruités (banque et questionnaire rapide) et feuilles remplies par un programme */
function sheets(n = 2): Answers[] {
  return [
    ...P.ranked.flatMap(id => Array.from({ length: n }, (_, s) => P.toAnswers(P.noisy(P.cloneLarge(id), `n:${id}:${s}`)))),
    ...P.ranked.slice(0, 6).map(id => P.toAnswers(P.noisy(P.cloneLarge(id, isQuick), `nq:${id}:0`))),
    ...(['audit', 'un-choix'] as const).flatMap(scheme => [0, 1].map(k => P.toAnswers(P.randomProfile(`poids:${scheme}:${k}`, scheme)))),
  ]
}

/** Les placements distincts d'avis, écrits à part de core/echiquier.ts : toutes les permutations, sans doublon */
function distinctPlacements(v: readonly number[]): number[][] {
  const out = new Map<string, number[]>()
  const go = (rest: number[], cur: number[]) => {
    if (!rest.length) out.set(cur.join(','), cur)
    rest.forEach((x, i) => go([...rest.slice(0, i), ...rest.slice(i + 1)], [...cur, x]))
  }
  go([...v], [])
  return [...out.values()]
}

/**
 * La part de chaque question, par la force brute : pour chaque bloc de la suite, l'affinité moyenne de ses candidats
 * (questionScore, moyenne par thème puis sur les thèmes où il est connu), observée, moins sa moyenne sur les placements
 * distincts des avis de cette seule question où le bloc est connu ; en moyenne sur la suite
 */
function bruteParts(pack: ElectionPack, answers: Answers, u: UnitReading, seg: readonly number[]): number[] {
  const panel = panelOf(pack)
  const qs = u.questions.map(id => pack.bank.questions.find(q => q.id === id)!)
  const vec = qs.map(q => q.approaches.map(a => answers[q.id]!.ratings[a.id] ?? 0))
  const ratings = (q: Question, v: readonly number[]): Record<string, Rating> => Object.fromEntries(q.approaches.flatMap((a, i) => (v[i] ? [[a.id, v[i] as Rating]] : [])))
  const blocMean = (vs: readonly (readonly number[])[], b: number) => {
    let sum = 0
    let k = 0
    for (const id of panel[b]!) {
      const byTopic = new Map<string, number[]>()
      qs.forEach((q, j) => {
        const s = questionScore(q, { ratings: ratings(q, vs[j]!), redLines: [] }, pack.positions[id])
        if (s !== null) byTopic.set(q.topicId, [...(byTopic.get(q.topicId) ?? []), s])
      })
      if (!byTopic.size) continue
      sum += (100 * [...byTopic.values()].reduce((t, l) => t + l.reduce((x, y) => x + y, 0) / l.length, 0)) / byTopic.size
      k++
    }
    return k ? sum / k : NaN
  }
  return qs.map((_, j) => {
    let total = 0
    for (const b of seg) {
      const seen = blocMean(vec, b)
      const others = distinctPlacements(vec[j]!).map(p => blocMean(vec.map((v, i) => (i === j ? p : v)), b)).filter(x => x === x)
      total += seen - others.reduce((x, y) => x + y, 0) / others.length
    }
    return total / seg.length
  })
}

describe('la part de chaque question', () => {
  it('égale une force brute écrite à part, positions de confiance basse comprises (élection réelle et petite élection)', () => {
    let n = 0
    const cases: [ElectionPack, Answers][] = [
      ...sheets(1)
        .slice(0, 8)
        .map(a => [real, a] as [ElectionPack, Answers]),
      [echiquierPack, answersOf({ q1: [1, -1, 0], q2: [1, 0, -1, 0], q3: [1, -1, 0], q4: [1, 0, -1], q5: [0, 1, -1, 0], q7: [1, -1, 0] })],
    ]
    for (const [pack, answers] of cases) {
      for (const u of units(readEchiquier(pack, answers))) {
        if (u.status !== 'lecture' || u.questions.length > 7) continue
        for (const w of weighOf(pack, answers, u)) {
          const brute = bruteParts(pack, answers, u, w.seg)
          w.parts.forEach((x, j) => expect(Math.abs(x - brute[j]!), `${u.kind}-${u.id} ${u.questions[j]}`).toBeLessThan(1e-9))
          n++
        }
      }
    }
    expect(n).toBeGreaterThan(20)
  }, 60_000)

  it('sans position de confiance basse, les parts font exactement l’écart affiché, et les parts des avis celle de la question', () => {
    let n = 0
    for (const answers of sheets()) {
      for (const u of read(readEchiquier(realNoLow, answers))) {
        const ws = weighOf(realNoLow, answers, u)
        for (const w of ws) {
          const gap = w.seg.reduce((s, b) => s + u.cells[b]!.affinity! - u.cells[b]!.chance!, 0) / w.seg.length
          expect(Math.abs(w.gap - gap)).toBeLessThan(1e-12)
          expect(Math.abs(w.parts.reduce((s, x) => s + x, 0) - w.gap), `${u.kind}-${u.id}`).toBeLessThan(1e-9)
          expect(Math.abs(w.rest), `${u.kind}-${u.id}`).toBeLessThan(1e-9)
          // La question qui pèse le plus : ses avis font sa part, et l'approche citée en a la plus grande
          const j = u.questions.indexOf(w.question!)
          expect(j).toBeGreaterThanOrEqual(0)
          expect(Math.abs(w.shares.reduce((s, x) => s + x, 0) - w.parts[j]!), `${u.kind}-${u.id}`).toBeLessThan(1e-9)
          expect(w.parts[j]).toBe(Math.max(...w.parts))
          const q = real.bank.questions.find(x => x.id === w.question)!
          const a = q.approaches.findIndex(x => x.id === w.approach)
          expect(w.shares[a]).toBe(Math.max(...w.shares))
          // Une approche notée, et votre avis sur elle
          expect(answers[q.id]!.ratings[w.approach!]).toBe(w.view)
          n++
        }
      }
    }
    expect(n).toBeGreaterThan(200)
  }, 120_000)

  it('avec des positions de confiance basse, un reste, et seulement là ; ce que les parts n’en font pas', () => {
    let rests = 0
    for (const answers of sheets()) {
      for (const u of read(readEchiquier(real, answers))) {
        for (const w of weighOf(real, answers, u)) {
          expect(Math.abs(w.rest - (w.gap - w.parts.reduce((s, x) => s + x, 0)))).toBeLessThan(1e-12)
          // Un reste seulement si un candidat de la suite a une position de confiance basse sur une question de l'unité
          const low = w.seg.some(b =>
            panelOf(real)[b]!.some(id => u.questions.some(qid => real.bank.questions.find(q => q.id === qid)!.approaches.some(a => real.positions[id]?.[a.id]?.confidence === 'low'))),
          )
          if (!low) expect(Math.abs(w.rest), `${u.kind}-${u.id}`).toBeLessThan(1e-9)
          if (Math.abs(w.rest) > 0.5) rests++
        }
      }
    }
    expect(rests).toBeGreaterThan(0)
  }, 120_000)

  it('l’inversion de tous les avis change le signe de chaque part et de l’écart', () => {
    let n = 0
    for (const answers of sheets(1).slice(0, 10)) {
      const flipped: Answers = Object.fromEntries(
        Object.entries(answers).map(([id, a]) => [id, { ...a, redLines: [], ratings: Object.fromEntries(Object.entries(a.ratings).map(([k, v]) => [k, -v as -1 | 1])) }]),
      )
      const back = readEchiquier(real, flipped)
      for (const u of read(readEchiquier(real, answers))) {
        const v = units(back).find(x => x.kind === u.kind && x.id === u.id)!
        // Les blocs nettement plus près le sont maintenant nettement plus loin : la même décomposition, sur eux
        expect(v.far).toEqual(u.near)
        const [a, b] = [weighOf(real, answers, u), weighOf(real, flipped, { ...v, status: 'lecture', near: u.near })]
        a.forEach((w, i) => {
          expect(Math.abs(w.gap + b[i]!.gap)).toBeLessThan(1e-9)
          w.parts.forEach((x, j) => expect(Math.abs(x + b[i]!.parts[j]!), `${u.kind}-${u.id}`).toBeLessThan(1e-9))
        })
        n++
      }
    }
    expect(n).toBeGreaterThan(10)
  }, 60_000)
})

describe('les égalités : l’ordre de la banque, puis celui des approches', () => {
  // La petite élection, avec une copie de q1 (q1x) juste après elle, dans le même thème : mêmes positions, sauf celles du
  // bloc de l'extrême gauche (e1), qui ne porte sur q1x que sa première approche
  const pos = (weight: 1 | 2): Position => ({ weight, nature: 'proposition', confidence: 'high', summary: 'test', sources: [] })
  function tiePack(copyFirst: boolean): ElectionPack {
    const q1 = echiquierPack.bank.questions.find(q => q.id === 'q1')!
    const q1x: Question = { ...q1, id: 'q1x', prompt: 'Question q1x', approaches: q1.approaches.map((_, i) => ({ id: `q1x${'abc'[i]}`, text: `Approche ${'ABC'[i]} de q1x` })) }
    const questions = echiquierPack.bank.questions.flatMap(q => (q.id === 'q1' ? (copyFirst ? [q1x, q] : [q, q1x]) : [q]))
    const positions: ElectionPack['positions'] = {}
    for (const [id, table] of Object.entries(echiquierPack.positions)) {
      const copy = Object.fromEntries(Object.entries(table).flatMap(([a, p]) => (a.startsWith('q1') && a.length === 3 ? [[a.replace('q1', 'q1x'), p]] : [])))
      positions[id] = { ...table, ...(id === 'e1' ? { q1xa: pos(2) } : copy) }
    }
    return { ...echiquierPack, bank: { ...echiquierPack.bank, questions }, positions }
  }
  /** Le thème des deux questions, lu comme si le bloc de l'extrême gauche y était nettement plus près */
  function weighAt(pack: ElectionPack, answers: Answers): Weigh {
    const u = readEchiquier(pack, answers).themes.find(t => t.id === 'ta1')!
    expect(u.questions).toHaveLength(2)
    return weighOf(pack, answers, { ...u, status: 'lecture', near: [0] })[0]!
  }

  it('deux questions de même part : la première de la banque', () => {
    // Pour e1, les deux questions ont alors le même profil (2, 0, 0) et les mêmes avis
    for (const copyFirst of [false, true]) {
      const pack = tiePack(copyFirst)
      const e1q1: Record<string, Position> = { ...pack.positions.e1!, q1a: pos(2) }
      delete e1q1.q1c
      const same = { ...pack, positions: { ...pack.positions, e1: e1q1 } }
      const w = weighAt(same, answersOf({ q1: [1, -1, 0], q1x: [1, -1, 0] }, same))
      expect(Math.abs(w.parts[0]! - w.parts[1]!)).toBeLessThan(1e-12)
      expect(w.parts[0]).toBeGreaterThan(0)
      expect(w.question).toBe(copyFirst ? 'q1x' : 'q1')
    }
  })

  it('deux avis de même part dans la question qui pèse le plus : la première approche', () => {
    // q1x : e1 porte sa première approche (2, 0, 0) ; « pas d'accord » sur la deuxième et la troisième, de même part
    const pack = tiePack(false)
    const w = weighAt(pack, answersOf({ q1: [1, 0, 0], q1x: [0, -1, -1] }, pack))
    expect(w.question).toBe('q1x')
    expect(w.shares[1]).toBeGreaterThan(0)
    expect(Math.abs(w.shares[1]! - w.shares[2]!)).toBeLessThan(1e-12)
    expect(w.approach).toBe('q1xb')
    expect(w.view).toBe(-1)
  })
})

describe('les quatre suites, et ce que dit la fiche', () => {
  it('chaque suite est vraie au regard des positions ; toutes paraissent ; sans phrase vraie, pas de fiche', () => {
    const seen = new Set<string>()
    let n = 0
    let partial = 0
    for (const answers of sheets(3)) {
      for (const u of read(readEchiquier(real, answers))) {
        const ws = weighOf(real, answers, u)
        // Une fiche par suite contiguë de blocs nettement plus près, dans l'ordre de l'axe
        expect(ws.map(w => w.seg)).toEqual(segments(u.near))
        for (const w of ws) {
          if (!w.approach) continue
          const q = real.bank.questions.find(x => x.id === w.question)!
          const ids = w.seg.flatMap(b => u.cells[b]!.known)
          const st = ids.map(id => stance(real.positions[id]?.[w.approach!]))
          expect(w.known).toBe(ids.length)
          // Les candidats que la grille classe dans ces blocs, connus ou non sur le sujet : la phrase les compte à part
          expect(w.size).toBe(w.seg.reduce((t, b) => t + panelOf(real)[b]!.length, 0))
          expect(w.known).toBeLessThanOrEqual(w.size)
          if (w.known < w.size) partial++
          expect([w.main, w.compatible, w.rejects]).toEqual([st.filter(x => x === 2).length, st.filter(x => x === 1).length, st.filter(x => x < 0).length])
          expect(w.others).toBe(ids.every(id => q.approaches.some(a => a.id !== w.approach && stance(real.positions[id]?.[a.id]) > 0)))
          const carried = ids.some(id => (real.positions[id]?.[w.approach!]?.weight ?? 0) > 0)
          const want = w.view > 0 ? (w.main ? 'principale' : w.compatible ? 'compatible' : null) : w.rejects ? 'rejet' : carried ? null : 'aucun'
          expect(w.suite, `${u.kind}-${u.id}`).toBe(want)
          if (w.suite) seen.add(w.suite)
          // Ailleurs sur l'axe : les blocs où l'approche est l'approche principale d'un candidat, hors de la suite
          const also = panelOf(real).flatMap((list, b) => (w.seg.includes(b) ? [] : list.filter(id => stance(real.positions[id]?.[w.approach!]) === 2).map(() => b)))
          expect(w.alsoBlocs).toEqual([...new Set(also)])
          expect(w.alsoCount).toBe(also.length)
          n++
        }
      }
    }
    expect([...seen].sort()).toEqual(['aucun', 'compatible', 'principale', 'rejet'])
    expect(n).toBeGreaterThan(300)
    expect(partial).toBeGreaterThan(0)
  }, 120_000)

  it('des candidats du bloc sans position sur le sujet : la phrase ne compte que les connus, et le dit (contre-vérification du lot 3)', () => {
    // Des feuilles réelles où la grille classe plus de candidats dans le bloc qu'il n'y en a de connus sur le sujet :
    // « du candidat que la grille classe au centre » disait qu'elle n'en classe qu'un là. En octobre 2026 : Marine
    // Le Pen (logement, 1 connu sur 3), Gabriel Attal (territoires, 1 sur 2), Selma Labib (société, 2 sur 3). Les
    // positions changent (veille automatique, décision du propriétaire du 17 octobre 2026) : les cas sont cherchés dans
    // les données du jour, des clones bruités de chaque candidat classé, jusqu'à un cas d'un seul connu et un de plusieurs
    const axis = real.election.spectrum!.axis!
    const { one, many, sheets: tried } = partialCards()
    expect(one, `aucune fiche d’un seul connu parmi plusieurs, sur ${tried} feuilles`).toBeDefined()
    expect(many, `aucune fiche de plusieurs connus parmi plus encore, sur ${tried} feuilles`).toBeDefined()
    for (const { u, w, key } of [one!, many!]) {
      const ids = w.seg.flatMap(b => u.cells[b]!.known)
      expect(w.size, key).toBe(w.seg.reduce((t, b) => t + panelOf(real)[b]!.length, 0))
      expect(w.known, key).toBe(ids.length)
      expect(w.known, key).toBeGreaterThan(0)
      expect(w.known, key).toBeLessThan(w.size)
      const place = where(axis, w.seg)
      const text = weighWho(place, { ...w, suite: w.suite! })
      expect(text, key).toContain(`que la grille classe ${place}`)
      // Le compte des connus, dit comme tel ; jamais celui que la grille classe là, ni « le candidat » quand elle en classe plusieurs
      expect(text, key).toContain(w.known === 1 ? 'seul candidat connu ici' : `${w.known}\u00a0candidats connus ici`)
      expect(text, key).not.toContain(`${w.size}\u00a0candidats`)
      expect(text, key).not.toMatch(/(^|[^\p{L}])(du|le|Le) candidat que la grille/u)
    }
  })

  it('les points du détail font exactement l’écart du tableau, à moins d’un point et demi de chaque part', () => {
    let n = 0
    for (const answers of sheets()) {
      for (const u of read(readEchiquier(real, answers))) {
        for (const w of weighOf(real, answers, u)) {
          // L'écart du tableau : l'affinité arrondie moins la moyenne arrondie, en moyenne sur la suite
          const table = w.seg.map(b => Math.round(u.cells[b]!.affinity!) - Math.round(u.cells[b]!.chance!))
          expect(w.shown).toBe(Math.round(table.reduce((t, x) => t + x, 0) / table.length))
          const exact = [...w.parts, w.rest]
          const pts = apportion(exact, w.shown)
          expect(pts.reduce((t, x) => t + x, 0), `${u.kind}-${u.id}`).toBe(w.shown)
          pts.forEach((x, i) => expect(Math.abs(x - exact[i]!), `${u.kind}-${u.id}`).toBeLessThan(1.5))
          // Sans reste (aucune position incertaine), aucun « Reste de l'écart »
          if (Math.abs(w.rest) < 1e-9) expect(pts.at(-1)).toBe(0)
          n++
        }
      }
    }
    expect(n).toBeGreaterThan(200)
  }, 120_000)

  it('rien pour une unité sans lecture nette ; sans candidat retiré, la même chose qu’avec la liste vide', () => {
    const answers = P.toAnswers(P.noisy(P.cloneLarge('melenchon'), 'n:melenchon:0'))
    const e = readEchiquier(real, answers)
    for (const u of units(e)) if (u.status !== 'lecture') expect(weighOf(real, answers, u)).toEqual([])
    const u = read(e)[0]!
    expect(weighOf(real, answers, u, { without: [] })).toEqual(weighOf(real, answers, u))
    // Sans le candidat recopié (la calibration « sans lui ») : il ne compte ni parmi les candidats de la fiche, ni ailleurs
    const without = readEchiquier(real, answers, { without: ['melenchon'] })
    for (const v of read(without))
      for (const w of weighOf(real, answers, v, { without: ['melenchon'] })) expect(w.known).toBe(w.seg.flatMap(b => v.cells[b]!.known).length)
  })
})

describe('des réponses changées depuis la lecture (un autre onglet, avant que la page ne relise)', () => {
  it('une question de l’unité sans réponse, passée ou changée : rien, sans erreur', () => {
    const answers = P.toAnswers(P.noisy(P.cloneLarge('arthaud'), 'n:arthaud:0'))
    let stale = 0
    for (const u of read(readEchiquier(real, answers))) {
      expect(weighOf(real, answers, u).length).toBeGreaterThan(0)
      const first = u.questions[0]!
      const { [first]: gone, ...rest } = answers
      expect(gone).toBeDefined()
      expect(() => weighOf(real, rest, u)).not.toThrow()
      expect(weighOf(real, rest, u)).toEqual([])
      expect(weighOf(real, { ...answers, [first]: { ratings: {}, redLines: [], skipped: true } }, u)).toEqual([])
      // Chaque avis de la première question inversé : rien dès que l'affinité de la lecture n'est plus la même
      const flipped: Answers = { ...answers, [first]: { ...gone!, ratings: Object.fromEntries(Object.entries(gone!.ratings).map(([k, v]) => [k, -v as Rating])) } }
      const now = units(readEchiquier(real, flipped)).find(x => x.kind === u.kind && x.id === u.id)!
      if (now.cells.some((c, b) => c.affinity !== u.cells[b]!.affinity)) {
        expect(weighOf(real, flipped, u)).toEqual([])
        stale++
      }
    }
    expect(stale).toBeGreaterThan(0)
  })
})

describe('le calcul, à l’ouverture d’une ligne', () => {
  it('rien de tiré au sort : mêmes réponses, même fiche ; aucun tirage dans le fichier', () => {
    const answers = P.toAnswers(P.noisy(P.cloneLarge('retailleau'), 'n:retailleau:1'))
    const e = readEchiquier(real, answers)
    for (const u of read(e)) expect(weighOf({ ...real }, answers, u)).toEqual(weighOf(real, answers, u))
    const src = readFileSync(fileURLToPath(new URL('../src/core/echiquierWeigh.ts', import.meta.url)), 'utf8')
    expect([...src.matchAll(/from '([^']+)'/g)].map(m => m[1]).sort()).toEqual(['./echiquier', './types'])
    expect(src).not.toMatch(/\brng\b|Math\.random|getRandomValues|mulberry32|hashString|seededShuffle/)
  })

  it('une ligne de famille s’ouvre en moins d’un dixième de seconde sur un téléphone lent (× 5)', () => {
    // La page la plus lourde : tout noté sur la banque entière, d'accord, pas d'accord et sans avis en rotation ; chaque
    // famille, comme si un bloc y était nettement plus près (le temps ne dépend pas de la lecture : toutes les questions
    // sont replacées). Le meilleur de trois essais
    const rotation = answersOf(Object.fromEntries(real.bank.questions.map((q, qi) => [q.id, q.approaches.map((_, i) => [1, -1, 0][(qi + i) % 3]!)])), real)
    const e = readEchiquier(real, rotation)
    let worst = 0
    for (const f of e.families) {
      let best = Infinity
      for (let i = 0; i < 3; i++) {
        const t0 = performance.now()
        weighOf(real, rotation, { ...f, status: 'lecture', near: [0, 1] })
        best = Math.min(best, performance.now() - t0)
      }
      worst = Math.max(worst, best)
    }
    expect(e.families.length).toBeGreaterThan(5)
    expect(5 * worst).toBeLessThan(100)
  })
})
