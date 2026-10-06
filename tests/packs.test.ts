// Tests d'intégrité appliqués à CHAQUE élection du registre, plus des audits de biais.
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { computeResults, effectiveWeight, stance } from '../src/core/score'
import { mulberry32 } from '../src/core/rng'
import type { Answers, ElectionPack, Question, Rating } from '../src/core/types'
import { elections } from '../src/elections'

const lastName = (name: string) => name.split(' ').slice(1).join(' ')
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/**
 * Profil d'un électeur qui pense exactement comme un candidat : « d'accord » sur les approches qu'il porte,
 * « pas d'accord » sur celles qu'il rejette explicitement.
 */
function candidateProfile(pack: ElectionPack, candidateId: string): Answers {
  const answers: Answers = {}
  for (const q of pack.bank.questions) {
    const ratings: Record<string, Rating> = {}
    for (const a of q.approaches) {
      const v = stance(pack.positions[candidateId]?.[a.id])
      if (v !== 0) ratings[a.id] = v > 0 ? 1 : -1
    }
    if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
  }
  return answers
}

/** Électeur au hasard : la moitié des approches sans avis, un quart d'accord, un quart pas d'accord */
function randomAnswers(questions: Question[], rand: () => number): Answers {
  const answers: Answers = {}
  for (const q of questions) {
    const ratings: Record<string, Rating> = {}
    for (const a of q.approaches) {
      const r = rand()
      if (r < 0.5) continue
      ratings[a.id] = r < 0.75 ? 1 : -1
    }
    if (Object.keys(ratings).length) answers[q.id] = { ratings, redLines: [] }
  }
  return answers
}

/** Part des premières places, en %, sur N électeurs au hasard */
function firstPlaceShares(pack: ElectionPack, questions: Question[], N: number): Record<string, number> {
  const rand = mulberry32(2027)
  const wins = new Map(pack.candidates.map(c => [c.id, 0]))
  for (let i = 0; i < N; i++) {
    const r = computeResults(pack, randomAnswers(questions, rand), {}, `audit-${i}`)
    const first = r.ranking[0]
    if (first && first.score !== null) wins.set(first.candidateId, (wins.get(first.candidateId) ?? 0) + 1)
  }
  return Object.fromEntries([...wins].map(([k, v]) => [k, Math.round((v / N) * 1000) / 10]))
}

for (const pack of elections) {
  const { bank, positions, candidates, election } = pack
  const approachIds = new Set(bank.questions.flatMap(q => q.approaches.map(a => a.id)))

  describe(`pack ${election.id} : structure`, () => {
    it('a des identifiants uniques', () => {
      const qids = bank.questions.map(q => q.id)
      expect(new Set(qids).size).toBe(qids.length)
      const aids = bank.questions.flatMap(q => q.approaches.map(a => a.id))
      expect(new Set(aids).size).toBe(aids.length)
      expect(new Set(bank.topics.map(t => t.id)).size).toBe(bank.topics.length)
    })

    it('rattache chaque question à un thème existant et propose 2 à 6 approches', () => {
      const topicIds = new Set(bank.topics.map(t => t.id))
      for (const q of bank.questions) {
        expect(topicIds.has(q.topicId), q.id).toBe(true)
        expect(q.approaches.length, q.id).toBeGreaterThanOrEqual(2)
        expect(q.approaches.length, q.id).toBeLessThanOrEqual(6)
      }
    })

    it('range chaque thème dans une seule famille', () => {
      if (!pack.topicGroups) return
      const grouped = pack.topicGroups.flatMap(g => g.topicIds)
      expect(new Set(grouped).size).toBe(grouped.length)
      expect([...grouped].sort()).toEqual(bank.topics.map(t => t.id).sort())
    })

    it('a un questionnaire rapide et un approfondissement', () => {
      const ess = bank.questions.filter(q => q.tier === 'essentiel').length
      expect(ess).toBeGreaterThanOrEqual(3)
      expect(bank.questions.length).toBeGreaterThan(ess)
    })
  })

  describe(`pack ${election.id} : positions`, () => {
    it('ne référence que des candidats et des approches existants', () => {
      for (const [cid, table] of Object.entries(positions)) {
        expect(candidates.some(c => c.id === cid), cid).toBe(true)
        for (const aid of Object.keys(table)) expect(approachIds.has(aid), `${cid} → ${aid}`).toBe(true)
      }
    })

    it('source chaque attribution (URL http/https) et la résume', () => {
      for (const [cid, table] of Object.entries(positions)) {
        for (const [aid, p] of Object.entries(table)) {
          expect(p.weight !== undefined || p.rejects, `${cid} → ${aid}`).toBeTruthy()
          expect(p.sources.length, `${cid} → ${aid}`).toBeGreaterThan(0)
          for (const s of p.sources) expect(s.url, `${cid} → ${aid}`).toMatch(/^https?:\/\//)
          expect(p.summary.length, `${cid} → ${aid}`).toBeGreaterThan(10)
        }
      }
    })

    it('donne au plus une approche principale et une compatible par candidat et par question ; inférence ≤ 1', () => {
      for (const q of bank.questions) {
        for (const c of candidates) {
          const ws = q.approaches.map(a => positions[c.id]?.[a.id]?.weight).filter(Boolean)
          expect(ws.filter(w => w === 2).length, `${q.id} ${c.id}`).toBeLessThanOrEqual(1)
          expect(ws.filter(w => w === 1).length, `${q.id} ${c.id}`).toBeLessThanOrEqual(1)
          for (const a of q.approaches) {
            const p = positions[c.id]?.[a.id]
            if (p?.nature === 'inference') expect(p.weight ?? 0, `${a.id} ${c.id}`).toBeLessThanOrEqual(1)
          }
        }
      }
    })

    it('connaît au moins 4 candidats sur 5 dans chaque question du questionnaire rapide', () => {
      for (const q of bank.questions.filter(x => x.tier === 'essentiel')) {
        const known = candidates.filter(c => q.approaches.some(a => effectiveWeight(positions[c.id]?.[a.id]) > 0))
        expect(known.length, q.id).toBeGreaterThanOrEqual(candidates.length - 1)
      }
    })
  })

  describe(`pack ${election.id} : neutralité des textes`, () => {
    const forbidden = [
      ...candidates.flatMap(c => [lastName(c.name), c.name]),
      ...(election.forbiddenTerms ?? []),
    ].map(norm)
    it('ne contient aucun nom de candidat, de parti organisateur ni de slogan', () => {
      for (const q of bank.questions) {
        const texts = [q.prompt, q.context ?? '', ...q.approaches.map(a => a.text)]
        for (const t of texts) {
          const n = norm(t)
          for (const f of forbidden) expect(n.includes(f), `« ${f} » dans ${q.id} : ${t}`).toBe(false)
        }
      }
    })
  })

  describe(`pack ${election.id} : audits du score`, () => {
    it('auto-cohérence : cocher exactement les approches de chaque candidat le classe premier', () => {
      for (const c of candidates) {
        const r = computeResults(pack, candidateProfile(pack, c.id), {}, 'audit')
        const winner = r.ranking.find(x => x.candidateId === c.id)!
        expect(winner.rank, c.id).toBe(1)
      }
    })

    it('tout noter « d’accord » donne le même score brut à tous (hors questions avec un rejet explicite)', () => {
      const withRejection = (q: Question) => candidates.some(c => q.approaches.some(a => stance(positions[c.id]?.[a.id]) < 0))
      const all: Answers = Object.fromEntries(
        bank.questions
          .filter(q => !withRejection(q))
          .map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, 1 as Rating])), redLines: [] }]),
      )
      const r = computeResults(pack, all, {}, 'audit')
      const raws = new Set(r.ranking.filter(x => x.rawScore !== null).map(x => Math.round(x.rawScore!)))
      expect(raws.size).toBe(1)
    })

    const step1 = bank.questions.filter(q => q.step === 1)
    it.runIf(step1.length > 0)('premier dépouillement : 8 questions rapides, chaque candidat connu sur chacune', () => {
      expect(step1).toHaveLength(8)
      for (const q of step1) {
        expect(q.tier, q.id).toBe('essentiel')
        const known = candidates.filter(c => q.approaches.some(a => effectiveWeight(positions[c.id]?.[a.id]) > 0))
        expect(known.length, q.id).toBe(candidates.length)
      }
      expect(bank.questions.filter(q => q.tier === 'essentiel').every(q => q.step === 1 || q.step === 2)).toBe(true)
    })

    it.runIf(step1.length > 0)('premier dépouillement : auto-cohérence et équilibre sur les 8 questions seules', () => {
      const ids = new Set(step1.map(q => q.id))
      for (const c of candidates) {
        const profile = Object.fromEntries(Object.entries(candidateProfile(pack, c.id)).filter(([qid]) => ids.has(qid)))
        expect(computeResults(pack, profile, {}, 'audit').ranking.find(x => x.candidateId === c.id)!.rank, c.id).toBe(1)
      }
      const shares = firstPlaceShares(pack, step1, 3000)
      for (const v of Object.values(shares)) {
        expect(v).toBeGreaterThan(100 / candidates.length / 2)
        expect(v).toBeLessThan((100 / candidates.length) * 1.5)
      }
    })

    it('ne favorise structurellement personne face à des réponses aléatoires', () => {
      const N = 3000
      const shares = firstPlaceShares(pack, bank.questions.filter(x => x.tier === 'essentiel'), N)
      console.info(`[${election.id}] part des premières places sur ${N} profils aléatoires (%)`, shares)
      for (const v of Object.values(shares)) {
        expect(v).toBeGreaterThan(100 / candidates.length / 4)
        expect(v).toBeLessThan(100 / candidates.length * 2.5)
      }
      // Les chiffres affichés sur l'accueil doivent rester ceux de l'audit
      if (election.audit) {
        const vals = Object.values(shares)
        expect(Math.round(Math.min(...vals))).toBe(election.audit.minShare)
        expect(Math.round(Math.max(...vals))).toBe(election.audit.maxShare)
        expect(election.audit.profiles).toBe(N)
      }
    })
  })
}

describe('anonymat structurel du questionnaire', () => {
  it("aucun module du questionnaire n'importe, même indirectement, les positions ou les candidats", () => {
    const root = resolve(__dirname, '../src')
    const seen = new Set<string>()
    const offenders: string[] = []
    const visit = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
        const spec = m[1]!
        let target = resolve(dirname(file), spec)
        for (const ext of ['.ts', '.tsx', '/index.ts']) {
          try {
            readFileSync(target + ext)
            target += ext
            break
          } catch {
            // essai suivant
          }
        }
        if (/positions|candidates|elections/.test(target)) offenders.push(`${file} → ${spec}`)
        else if (target.startsWith(root)) visit(target)
      }
    }
    const dir = join(root, 'ui/questionnaire')
    for (const f of readdirSync(dir)) visit(join(dir, f))
    expect(offenders).toEqual([])
  })
})
