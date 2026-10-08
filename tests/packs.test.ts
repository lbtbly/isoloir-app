// Tests d'intégrité appliqués à CHAQUE élection de src/elections/all.ts, plus des audits de biais.
// Les seuils sont ceux de l'élection (election.checks, sinon config.quality de research/<id>/config.json) ;
// absents, ceux de la primaire « Choisir 2027 » (DEFAULT_CHECKS), qui reproduisent ses règles d'origine.
// tools/audit-pack.mjs applique les mêmes règles et le même tirage aléatoire, pour un rapport détaillé.
// Candidats non classés (election.ranking.excluded, décision du propriétaire) : ni score ni rang, ils sont hors de
// toutes les mesures du score (parts de 1res places, couverture par candidat, écart de couverture, part des candidats
// connus et concentration des positions principales sur chaque question, distinction deux à deux, auto-cohérence) ;
// les contrôles de structure (identifiants, positions, sources) les comptent toujours.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { computeResults, effectiveWeight, excludedIds, knownQuestions, stance } from '../src/core/score'
import { mulberry32 } from '../src/core/rng'
import type { Answers, ElectionChecks, ElectionPack, Question, Rating } from '../src/core/types'
import { ELECTIONS } from '../src/elections'
import { elections } from '../src/elections/all'

const ROOT = resolve(__dirname, '..')

/** Tous les seuils, chacun renseigné */
type FullChecks = { [K in keyof ElectionChecks]-?: NonNullable<ElectionChecks[K]> }

/** Seuils par défaut : les règles de la primaire (5 candidats), telles qu'elles étaient écrites ici avant les seuils par élection */
const DEFAULT_CHECKS = (n: number): FullChecks => ({
  // 8 questions, chaque candidat connu sur chacune
  step1: { count: 8, minKnownShare: 1, minKnownPerCandidate: 8 },
  // Au moins 3 questions, au plus un candidat inconnu sur chacune
  quick: { min: 3, max: Number.POSITIVE_INFINITY, minKnownShare: (n - 1) / n, minCandidateShare: 0, maxSpread: Number.POSITIVE_INFINITY },
  // Plus de questions que le questionnaire rapide, 2 à 6 approches par question
  bank: { min: 0, max: Number.POSITIVE_INFINITY, approachesMin: 2, approachesMax: 6, maxMainShare: 1, minCandidateShare: 0 },
  // Part des premières places entre 100/n ÷ 2 et 100/n × 1,5 au premier dépouillement, ÷ 4 et × 2,5 au questionnaire rapide
  audit: { step1: [2, 1.5], quick: [4, 2.5] },
})

/** La configuration de l'élection pour les outils de données (research/<id>/config.json), si elle existe */
interface ResearchConfig {
  quality?: ElectionChecks
  /** Candidats non classés, pour les outils de données : les mêmes que election.ranking.excluded */
  scoringExcluded?: string[]
  forbiddenTerms?: string[]
  forbiddenTermsAllow?: string[]
}
function researchConfig(id: string): ResearchConfig | null {
  const file = join(ROOT, 'research', id, 'config.json')
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as ResearchConfig) : null
}

/** Nombre minimal de candidats pour une part donnée (0,85 × 19 → 17) */
const need = (share: number, n: number) => Math.ceil(share * n - 1e-9)

// Termes interdits : mot entier, sans accents ; un sigle ou un nom propre d'un seul mot (« RN », « Horizons »,
// « Royal ») est cherché avec sa casse, une expression ou un mot en minuscules sans casse. Même règle que
// tools/merge-explainers.mjs et tools/workflows/4-explainers.js, plus le pluriel (« socialistes »).
const strip = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/’/g, "'")
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
function matcher(term: string): RegExp {
  const s = strip(term).trim()
  const sensitive = !/\s/.test(s) && s !== s.toLowerCase()
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(s).replace(/ /g, '\\s+')}s?(?![\\p{L}\\p{N}])`, sensitive ? 'u' : 'iu')
}
const lastName = (name: string) => name.split(' ').slice(1).join(' ')

/**
 * Profil d'un électeur qui pense exactement comme un candidat : « d'accord » sur les approches qu'il porte,
 * « pas d'accord » sur celles qu'il rejette explicitement.
 */
function candidateProfile(pack: ElectionPack, candidateId: string, questions: Question[] = pack.bank.questions): Answers {
  const answers: Answers = {}
  for (const q of questions) {
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

/** Part des premières places des candidats notés, en %, sur N électeurs au hasard */
function firstPlaceShares(pack: ElectionPack, questions: Question[], N: number): Record<string, number> {
  const rand = mulberry32(2027)
  const off = new Set(excludedIds(pack))
  const wins = new Map(pack.candidates.filter(c => !off.has(c.id)).map(c => [c.id, 0]))
  for (let i = 0; i < N; i++) {
    const r = computeResults(pack, randomAnswers(questions, rand), {}, `audit-${i}`)
    const first = r.ranking[0]
    if (first && first.score !== null) wins.set(first.candidateId, (wins.get(first.candidateId) ?? 0) + 1)
  }
  return Object.fromEntries([...wins].map(([k, v]) => [k, Math.round((v / N) * 1000) / 10]))
}

for (const pack of elections) {
  const { bank, positions, candidates, election } = pack
  const n = candidates.length
  const config = researchConfig(election.id)
  const custom = election.checks ?? config?.quality ?? {}
  // Candidats notés : tous, moins les non classés (election.ranking.excluded)
  const off = new Set(excludedIds(pack))
  const scored = candidates.filter(c => !off.has(c.id))
  const nScored = scored.length
  const defaults = DEFAULT_CHECKS(nScored)
  const checks = {
    step1: { ...defaults.step1, ...custom.step1 },
    quick: { ...defaults.quick, ...custom.quick },
    bank: { ...defaults.bank, ...custom.bank },
    audit: { ...defaults.audit, ...custom.audit },
  }
  const approachIds = new Set(bank.questions.flatMap(q => q.approaches.map(a => a.id)))
  const known = (cid: string, q: Question) => q.approaches.some(a => effectiveWeight(positions[cid]?.[a.id]) > 0)
  const mainOf = (cid: string, q: Question) => q.approaches.find(a => effectiveWeight(positions[cid]?.[a.id]) === 2)?.id ?? null
  const quick = bank.questions.filter(q => q.tier === 'essentiel')
  const step1 = bank.questions.filter(q => q.step === 1)

  describe(`pack ${election.id} : structure`, () => {
    it('a des identifiants uniques', () => {
      const qids = bank.questions.map(q => q.id)
      expect(new Set(qids).size).toBe(qids.length)
      const aids = bank.questions.flatMap(q => q.approaches.map(a => a.id))
      expect(new Set(aids).size).toBe(aids.length)
      expect(new Set(bank.topics.map(t => t.id)).size).toBe(bank.topics.length)
    })

    it(`rattache chaque question à un thème existant et propose ${checks.bank.approachesMin} à ${checks.bank.approachesMax} approches`, () => {
      const topicIds = new Set(bank.topics.map(t => t.id))
      for (const q of bank.questions) {
        expect(topicIds.has(q.topicId), q.id).toBe(true)
        expect(q.approaches.length, q.id).toBeGreaterThanOrEqual(checks.bank.approachesMin)
        expect(q.approaches.length, q.id).toBeLessThanOrEqual(checks.bank.approachesMax)
      }
    })

    it('range chaque thème dans une seule famille', () => {
      if (!pack.topicGroups) return
      const grouped = pack.topicGroups.flatMap(g => g.topicIds)
      expect(new Set(grouped).size).toBe(grouped.length)
      expect([...grouped].sort()).toEqual(bank.topics.map(t => t.id).sort())
    })

    it('a un questionnaire rapide et un approfondissement, de la taille prévue', () => {
      expect(quick.length).toBeGreaterThanOrEqual(checks.quick.min)
      expect(quick.length).toBeLessThanOrEqual(checks.quick.max)
      expect(bank.questions.length).toBeGreaterThan(quick.length)
      expect(bank.questions.length).toBeGreaterThanOrEqual(checks.bank.min)
      expect(bank.questions.length).toBeLessThanOrEqual(checks.bank.max)
    })

    it('les seuils de l’élection (election.checks) et ceux des outils de données (config.json) sont les mêmes', () => {
      if (election.checks && config?.quality) expect(election.checks).toEqual(config.quality)
    })

    it('les exemptions du premier dépouillement (checks.step1.exempt) désignent des candidats de l’élection', () => {
      for (const id of checks.step1.exempt ?? []) expect(candidates.some(c => c.id === id), id).toBe(true)
    })
  })

  describe(`pack ${election.id} : candidats non classés`, () => {
    const exclusion = election.ranking?.excluded

    it('la liste de l’élection (ranking.excluded) et celle des outils de données (config.scoringExcluded) sont les mêmes', () => {
      if (!exclusion && !config?.scoringExcluded) return
      expect([...(exclusion?.ids ?? [])].sort()).toEqual([...(config?.scoringExcluded ?? exclusion?.ids ?? [])].sort())
    })

    it.runIf(!!exclusion)('des candidats de l’élection, sans doublon, un motif et une date ; au moins deux candidats restent classés', () => {
      const ids = exclusion!.ids
      expect(new Set(ids).size).toBe(ids.length)
      for (const id of ids) expect(candidates.some(c => c.id === id), id).toBe(true)
      expect(exclusion!.reason.length).toBeGreaterThan(10)
      // Motif en cours de phrase (Méthode) : minuscule initiale, pas de point final
      expect(exclusion!.reason).toMatch(/^\p{Ll}.*[^.]$/u)
      expect(exclusion!.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(exclusion!.since))).toBe(false)
      expect(nScored).toBeGreaterThanOrEqual(2)
    })

    it.runIf(!!exclusion)('même traitement pour tous : les non classés sont les moins connus, aucun candidat classé ne l’est aussi peu', () => {
      const most = Math.max(...candidates.filter(c => off.has(c.id)).map(c => knownQuestions(pack, c.id)))
      for (const c of scored) expect(knownQuestions(pack, c.id), c.id).toBeGreaterThan(most)
    })

    it.runIf(!!exclusion)('ni score ni rang : jamais au classement ni hors classement, toujours parmi les non classés', () => {
      const answers: Answers = Object.fromEntries(
        bank.questions.map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map((a, i) => [a.id, (i % 2 ? -1 : 1) as Rating])), redLines: [] }]),
      )
      const r = computeResults(pack, answers, {}, 'audit')
      const listed = [...r.ranking, ...r.unranked].map(x => x.candidateId)
      for (const id of off) expect(listed, id).not.toContain(id)
      expect([...r.excluded].sort()).toEqual([...off].sort())
      expect(listed.length + r.excluded.length).toBe(n)
    })
  })

  describe(`pack ${election.id} : candidats`, () => {
    it('des identifiants et des initiales uniques', () => {
      const ids = candidates.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const c of candidates) expect(c.initials, c.id).toMatch(/^\p{Lu}[\p{Lu}\p{Ll}]{0,3}$/u)
      const initials = candidates.map(c => c.initials)
      const twice = initials.filter((x, i) => initials.indexOf(x) !== i)
      expect(twice, 'initiales en double').toEqual([])
    })

    it('la date de déclaration de candidature, sourcée (obligatoire pour une présidentielle)', () => {
      for (const c of candidates) {
        if (election.kind === 'presidentielle') {
          expect(c.declaredAt, `${c.id} : declaredAt`).toBeTruthy()
          expect(c.declaration?.url, `${c.id} : declaration`).toMatch(/^https:\/\//)
        }
        if (c.declaredAt) {
          expect(c.declaredAt, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/)
          expect(Number.isNaN(Date.parse(c.declaredAt)), c.id).toBe(false)
        }
        if (c.declaration) expect(c.declaration.url, c.id).toMatch(/^https?:\/\//)
      }
    })

    it('le registre (src/elections/index.ts) connaît l’élection, avec les mêmes candidats et le même statut d’archive', () => {
      const entry = ELECTIONS.find(e => e.id === election.id)
      expect(entry, `${election.id} absente du registre`).toBeDefined()
      expect([...entry!.candidateIds].sort()).toEqual(candidates.map(c => c.id).sort())
      expect(entry!.archived, 'archived (registre) ⇔ election.archived').toBe(!!election.archived)
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

    it(`questionnaire rapide : chaque question connue pour au moins ${Math.round(checks.quick.minKnownShare * 100)} % des candidats notés`, () => {
      for (const q of quick) {
        const k = scored.filter(c => known(c.id, q)).length
        expect(k, q.id).toBeGreaterThanOrEqual(need(checks.quick.minKnownShare, nScored))
      }
    })

    it('questionnaire rapide : chaque candidat noté assez connu, et des couvertures proches', () => {
      const counts = scored.map(c => quick.filter(q => known(c.id, q)).length)
      scored.forEach((c, i) => expect(counts[i]! / quick.length, c.id).toBeGreaterThanOrEqual(checks.quick.minCandidateShare - 1e-9))
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(checks.quick.maxSpread)
    })

    it('banque : chaque candidat noté assez connu, et aucune approche ne réunit trop de positions principales', () => {
      for (const c of scored) {
        const k = bank.questions.filter(q => known(c.id, q)).length
        expect(k / bank.questions.length, c.id).toBeGreaterThanOrEqual(checks.bank.minCandidateShare - 1e-9)
      }
      for (const q of bank.questions) {
        const counts = new Map<string, number>()
        for (const c of scored) {
          const m = mainOf(c.id, q)
          if (m) counts.set(m, (counts.get(m) ?? 0) + 1)
        }
        const mains = [...counts.values()].reduce((a, b) => a + b, 0)
        if (mains < 2) continue
        if (checks.bank.maxMainShareScope === 'quick' && q.tier !== 'essentiel') continue
        expect(Math.max(...counts.values()) / mains, q.id).toBeLessThanOrEqual(checks.bank.maxMainShare + 1e-9)
      }
    })

    it('distingue chaque paire de candidats notés : une question au moins où leurs approches principales diffèrent', () => {
      const same: string[] = []
      for (let i = 0; i < nScored; i++) {
        for (let j = i + 1; j < nScored; j++) {
          const [a, b] = [scored[i]!.id, scored[j]!.id]
          const differ = bank.questions.some(q => {
            const [ma, mb] = [mainOf(a, q), mainOf(b, q)]
            return !!ma && !!mb && ma !== mb
          })
          if (!differ) same.push(`${a}-${b}`)
        }
      }
      // Primaire : la règle date de la présidentielle ; un échec y serait signalé sans bloquer
      if (election.kind === 'primaire' && same.length) console.warn(`[${election.id}] paires de candidats indiscernables : ${same.join(', ')}`)
      else expect(same).toEqual([])
    })
  })

  describe(`pack ${election.id} : neutralité des textes`, () => {
    // Noms des candidats (complet et nom de famille), leurs partis (sauf « Sans … ») et les termes interdits de
    // l'élection, moins les exceptions (mots courants qui sont aussi des noms de partis : « Renaissance »)
    const allow = new Set(
      [...((election as { forbiddenTermsAllow?: string[] }).forbiddenTermsAllow ?? []), ...(config?.forbiddenTermsAllow ?? [])].map(t => strip(t).toLowerCase()),
    )
    const terms = [
      ...candidates.flatMap(c => [c.name, lastName(c.name)]),
      ...candidates.map(c => c.affiliation).filter(a => a && !/^Sans /.test(a)),
      ...(election.forbiddenTerms ?? []),
      ...(config?.forbiddenTerms ?? []),
    ].filter((t, i, a) => t && a.indexOf(t) === i && !allow.has(strip(t).toLowerCase()))
    const matchers = terms.map(t => ({ term: t, re: matcher(t) }))
    const hits = (text: string) => matchers.filter(m => m.re.test(strip(text))).map(m => m.term)

    it('aucun nom de candidat, de parti ni de slogan dans les questions et leurs approches (mots entiers)', () => {
      const found: string[] = []
      for (const q of bank.questions) {
        for (const t of [q.prompt, q.context ?? '', ...q.approaches.map(a => a.text)]) {
          for (const term of hits(t)) found.push(`« ${term} » dans ${q.id} : ${t}`)
        }
      }
      expect(found).toEqual([])
    })

    it('ni dans les explications, les chiffres clés, les thèmes et les points d’accord', () => {
      const found: string[] = []
      const scan = (where: string, t: string | undefined) => {
        for (const term of hits(t ?? '')) found.push(`« ${term} » dans ${where} : ${t}`)
      }
      for (const q of bank.questions) {
        if (!q.explainer) continue
        scan(q.id, q.explainer.summary)
        q.explainer.points.forEach((p, i) => scan(`${q.id} (point ${i + 1})`, p.text))
        q.explainer.figures.forEach((f, i) => scan(`${q.id} (chiffre ${i + 1})`, `${f.value} ${f.label}`))
      }
      for (const t of bank.topics) scan(`thème ${t.id}`, `${t.label} ${t.description}`)
      for (const c of bank.consensus ?? []) scan(`accord ${c.topicId}`, c.text)
      expect(found).toEqual([])
    })

    it('le matcher cherche des mots entiers : « RN » ne trouve pas « gouvernement »', () => {
      expect(matcher('RN').test(strip('Le gouvernement'))).toBe(false)
      expect(matcher('RN').test(strip('Le RN propose'))).toBe(true)
      expect(matcher('Horizons').test(strip('de nouveaux horizons'))).toBe(false)
      expect(matcher('socialiste').test(strip('Les Socialistes'))).toBe(true)
      expect(matcher('Gauche républicaine').test(strip('la gauche republicaine'))).toBe(true)
    })
  })

  describe(`pack ${election.id} : réglages de l’élection`, () => {
    it('le nombre de questions du premier dépouillement annoncé (quick.step1) est celui de la banque', () => {
      if (election.quick) expect(step1.length).toBe(election.quick.step1)
    })

    it('périodes de gel, tours et archive : des dates lisibles, dans l’ordre', () => {
      for (const w of election.freezeWindows ?? []) {
        expect(Number.isNaN(Date.parse(w.start)) || Number.isNaN(Date.parse(w.end)), JSON.stringify(w)).toBe(false)
        expect(Date.parse(w.start), JSON.stringify(w)).toBeLessThan(Date.parse(w.end))
      }
      for (const r of election.rounds) expect(Date.parse(r.start), r.label).toBeLessThanOrEqual(Date.parse(r.end))
      if (election.archived) expect(election.archived.since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('le périmètre vidéo ne renvoie qu’à des séries, des thèmes et des questions qui existent', () => {
      if (!pack.videoScope) return
      const topicIds = new Set(bank.topics.map(t => t.id))
      const questionIds = new Set(bank.questions.map(q => q.id))
      for (const [from, to] of Object.entries(pack.videoScope.topics)) {
        expect(existsSync(join(ROOT, 'src/ui/videos/series', `${from}.ts`)), `série ${from}`).toBe(true)
        expect(topicIds.has(to), `${from} → ${to}`).toBe(true)
      }
      for (const [from, to] of Object.entries(pack.videoScope.questions)) expect(questionIds.has(to), `${from} → ${to}`).toBe(true)
    })
  })

  describe(`pack ${election.id} : audits du score`, () => {
    it('auto-cohérence : cocher exactement les approches de chaque candidat noté le classe premier', () => {
      for (const c of scored) {
        const r = computeResults(pack, candidateProfile(pack, c.id), {}, 'audit')
        const winner = r.ranking.find(x => x.candidateId === c.id)!
        expect(winner.rank, c.id).toBe(1)
      }
    })

    it('tout noter « d’accord » donne le même score brut à tous (hors questions avec un rejet explicite)', () => {
      const withRejection = (q: Question) => scored.some(c => q.approaches.some(a => stance(positions[c.id]?.[a.id]) < 0))
      const all: Answers = Object.fromEntries(
        bank.questions
          .filter(q => !withRejection(q))
          .map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, 1 as Rating])), redLines: [] }]),
      )
      const r = computeResults(pack, all, {}, 'audit')
      // Tous les candidats, hors classement compris (règle election.ranking) : le calcul est le même pour eux
      const raws = new Set([...r.ranking, ...r.unranked].filter(x => x.rawScore !== null).map(x => Math.round(x.rawScore!)))
      expect(raws.size).toBe(1)
    })

    const { count, minKnownShare, minKnownPerCandidate, exempt = [] } = checks.step1
    it.runIf(step1.length > 0)(`premier dépouillement : ${count} questions rapides, connues pour au moins ${Math.round(minKnownShare * 100)} % des candidats notés`, () => {
      expect(step1).toHaveLength(count)
      for (const q of step1) {
        expect(q.tier, q.id).toBe('essentiel')
        expect(scored.filter(c => known(c.id, q)).length, q.id).toBeGreaterThanOrEqual(need(minKnownShare, nScored))
      }
      // Candidats exemptés (checks.step1.exempt) de la seule couverture par candidat : les autres règles valent pour eux
      for (const c of scored) {
        if (exempt.includes(c.id)) continue
        expect(step1.filter(q => known(c.id, q)).length, c.id).toBeGreaterThanOrEqual(minKnownPerCandidate)
      }
      expect(quick.every(q => q.step === 1 || q.step === 2)).toBe(true)
    })

    it.runIf(step1.length > 0)(`premier dépouillement : auto-cohérence et équilibre sur les ${step1.length} questions seules`, () => {
      for (const c of scored) {
        expect(computeResults(pack, candidateProfile(pack, c.id, step1), {}, 'audit').ranking.find(x => x.candidateId === c.id)!.rank, c.id).toBe(1)
      }
      const shares = firstPlaceShares(pack, step1, 3000)
      const [div, mul] = checks.audit.step1
      for (const [cid, v] of Object.entries(shares)) {
        expect(v, cid).toBeGreaterThan(100 / nScored / div)
        expect(v, cid).toBeLessThan((100 / nScored) * mul)
      }
    })

    it('ne favorise structurellement personne face à des réponses aléatoires', () => {
      const N = 3000
      const shares = firstPlaceShares(pack, quick, N)
      console.info(`[${election.id}] part des premières places sur ${N} profils aléatoires (%)`, shares)
      const [div, mul] = checks.audit.quick
      for (const [cid, v] of Object.entries(shares)) {
        expect(v, cid).toBeGreaterThan(100 / nScored / div)
        expect(v, cid).toBeLessThan((100 / nScored) * mul)
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
  // Suit les imports statiques, les imports de bord (« import './x' ») et les imports à la demande (« import('./x') ») :
  // la feuille de pointage ne doit atteindre ni les positions, ni les candidats, ni le registre des élections
  // (src/elections/index.ts, qui charge les packs), ni all.ts, ni aucun pack. Seules les familles de thèmes
  // (src/elections/<id>/groups.ts, sans candidat ni position) sont tolérées : les séries vidéo s'y rangent.
  const root = resolve(__dirname, '../src')
  const tolerated = /^elections\/[^/]+\/groups\.ts$/
  const forbidden = (rel: string) => !tolerated.test(rel) && (/^elections\//.test(rel) || /positions|candidates/.test(rel))

  function reach(entries: string[]): { offenders: string[]; seen: Set<string> } {
    const seen = new Set<string>()
    const offenders: string[] = []
    const visit = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(/(?:\bfrom\s+|\bimport\s*\(\s*|^\s*import\s+)['"](\.[^'"]+)['"]/gm)) {
        const spec = m[1]!
        let target = resolve(dirname(file), spec)
        for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
          if (existsSync(target + ext) && /\.tsx?$/.test(target + ext)) {
            target += ext
            break
          }
        }
        if (!/\.tsx?$/.test(target)) continue
        const rel = relative(root, target)
        if (forbidden(rel)) offenders.push(`${relative(root, file)} → ${spec}`)
        else if (!rel.startsWith('..')) visit(target)
      }
    }
    entries.forEach(visit)
    return { offenders, seen }
  }

  it("aucun module du questionnaire n'importe, même indirectement ou à la demande, les positions, les candidats ni les élections", () => {
    const dir = join(root, 'ui/questionnaire')
    const { offenders, seen } = reach(readdirSync(dir).map(f => join(dir, f)))
    expect(offenders).toEqual([])
    // Le parcours passe bien par les liens (nav.ts) et les vidéos chargées à la demande
    expect(seen.has(join(root, 'ui/nav.ts'))).toBe(true)
    expect([...seen].some(f => f.endsWith('ui/videos/catalog.ts'))).toBe(true)
  })

  it('le parcours repère un import du registre des élections, même à la demande', () => {
    expect(forbidden('elections/index.ts')).toBe(true)
    expect(forbidden('elections/all.ts')).toBe(true)
    expect(forbidden('elections/choisir-2027/index.ts')).toBe(true)
    expect(forbidden('elections/choisir-2027/groups.ts')).toBe(false)
    const { offenders } = reach([join(root, 'core/routes.ts'), join(root, 'ui/nav.ts')])
    expect(offenders).toEqual([])
  })
})
