// Le dépouillement en PDF (src/core/reportPdf.ts) sur les vrais packs et l'élection factice de 20 candidats, avec
// des profils tirés par une graine : questionnaire rapide, complet, peu de réponses, beaucoup de lignes rouges,
// ex æquo forcé, qualifiés du second tour, questions à revoir, archive pendant et après le vote, classement vide.
// Le fichier est relu par tools/pdf-text.mjs (comme dans l'e2e ; il saute les initiales décoratives, marquées comme
// artefacts) : texte, ordre des candidats et des sections, mentions obligatoires, mots interdits, pagination (sans
// ligne seule de part et d'autre d'une coupure), encodage, couleurs, imports, déterminisme.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { layoutProblems } from '../src/core/pdf/flow'
import { encodeWinAnsi } from '../src/core/pdf/winansi'
import { buildReportPdf, PDF_BANDS, PDF_COLORS, renderReport, reportFileName, type ReportInput } from '../src/core/reportPdf'
import { crossingNote, excludedTitle, MANY_RED_LINES, manyRedLinesNote, unrankedTitle } from '../src/core/resultsCopy'
import { computeResults, dealbreakerLevel, displayScore, METHOD_VERSION, type Results } from '../src/core/score'
import type { Answers, ElectionPack, TopicWeights } from '../src/core/types'
import { elections } from '../src/elections/all'
import { choisir2027 } from '../src/elections/choisir-2027'
import { VOTING_NOTE } from '../src/ui/components/CurrentElection'
import { MAX_PRIORITIES } from '../src/ui/screens/Priorities'
import { readPdf } from '../tools/pdf-text.mjs'
import { manyCandidates } from './fixtures/many-candidates'

const ROOT = join(import.meta.dirname, '..')
const presidentielle = elections.find(p => p.election.id === 'presidentielle-2027') as ElectionPack
// La primaire n'est plus sur le site : son pack de référence sert encore à éprouver la ligne d'archive du PDF
const primaire: ElectionPack = choisir2027
const NOW = new Date(2026, 9, 11, 21, 5, 0)
const CB = 792

/** Générateur congruentiel : le même profil à chaque essai */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

interface Draw {
  /** Part des questions retenues (1 : toutes), ou seulement le questionnaire rapide */
  share?: number
  quick?: boolean
  /** Au plus ce nombre de questions */
  max?: number
  /** Probabilité d'une ligne rouge sur une approche notée « pas d'accord » */
  red?: number
}

function answersFor(pack: ElectionPack, seed: number, d: Draw): Answers {
  const r = rng(seed)
  const answers: Answers = {}
  let n = 0
  for (const q of pack.bank.questions) {
    if (d.quick && q.tier !== 'essentiel') continue
    if (r() > (d.share ?? 1) || n >= (d.max ?? Infinity)) continue
    const ratings: Record<string, 1 | -1> = {}
    const redLines: string[] = []
    for (const a of q.approaches) {
      const x = r()
      if (x < 0.35) ratings[a.id] = 1
      else if (x < 0.7) {
        ratings[a.id] = -1
        if (r() < (d.red ?? 0)) redLines.push(a.id)
      }
    }
    const first = q.approaches[0]
    if (!Object.keys(ratings).length && first) ratings[first.id] = 1
    answers[q.id] = { ratings, redLines }
    n++
  }
  return answers
}

/** Les n premiers thèmes répondus comptent double */
function weightsFor(pack: ElectionPack, answers: Answers, n: number): TopicWeights {
  const answered = new Set(pack.bank.questions.filter(q => answers[q.id]).map(q => q.topicId))
  return Object.fromEntries(pack.bank.topics.filter(t => answered.has(t.id)).slice(0, n).map(t => [t.id, 2 as const]))
}

interface Case {
  name: string
  input: ReportInput
}

function makeCase(name: string, pack: ElectionPack, seed: number, d: Draw, o: Partial<ReportInput> & { prio?: number; ids?: string[] } = {}): Case {
  const answers = answersFor(pack, seed, d)
  const weights = weightsFor(pack, answers, o.prio ?? 0)
  const results = computeResults(pack, answers, weights, `graine-${seed}`, o.ids)
  const archived = pack.election.id === 'choisir-2027'
  return {
    name,
    input: {
      pack,
      state: { answers, weights },
      results,
      finalistsOnly: false,
      staleCount: 0,
      archive: archived ? { voting: true, currentLabel: 'Présidentielle 2027' } : null,
      slug: archived ? 'choisir-2027' : '',
      maxPriorities: MAX_PRIORITIES,
      now: NOW,
      ...o,
    },
  }
}

/** Le premier profil (graine 1, 2…) dont le résultat convient */
function findCase(name: string, pack: ElectionPack, d: Draw, want: (r: Results) => boolean, o: Parameters<typeof makeCase>[4] = {}): Case {
  for (let seed = 1; seed < 3000; seed++) {
    const c = makeCase(name, pack, seed, d, o)
    if (want(c.input.results)) return c
  }
  throw new Error(`${name} : aucun profil ne convient`)
}

// Élection factice avec deux candidats aux positions identiques (ex æquo forcé) et des qualifiés du second tour
const twin: ElectionPack = {
  ...manyCandidates,
  election: { ...manyCandidates.election, finalists: ['exemple', 'essai', 'fictive', 'maquette'] },
  positions: { ...manyCandidates.positions, essai: manyCandidates.positions.exemple ?? {} },
}

/** Classement vide (règle de couverture) : tous les classés passés hors classement, comme la page le montrerait */
function emptyRanking(c: Case): Case {
  const r = c.input.results
  const unranked = r.ranking.reduce<Results['unranked']>((list, x) => {
    const { rank, tied, ...rest } = x
    void rank
    void tied
    return [...list, rest]
  }, [...r.unranked])
  return { name: 'présidentielle, classement vide', input: { ...c.input, results: { ...r, ranking: [], unranked, close: false, stable: true, allIncompatible: false, why: [] } } }
}

/**
 * Une ligne rouge sur une approche que seul un non classé porte fermement, et aucun autre candidat, même « possible »
 * (décision du propriétaire du 14 octobre 2026 : ses lignes rouges sont dites comme celles des autres)
 */
function offOnlyRedLine(): Case {
  const off = new Set(presidentielle.election.ranking?.excluded?.ids ?? [])
  const level = (id: string, a: string) => dealbreakerLevel(presidentielle.positions[id]?.[a])
  const pick = presidentielle.bank.questions
    .flatMap(q => q.approaches.map(a => ({ q, a: a.id })))
    .find(
      ({ a }) =>
        presidentielle.candidates.some(c => off.has(c.id) && level(c.id, a) === 'touche') &&
        !presidentielle.candidates.some(c => !off.has(c.id) && level(c.id, a) !== null),
    )
  if (!pick) throw new Error('aucune approche portée par des non classés seulement')
  const c = makeCase('présidentielle, lignes rouges franchies par des non classés seulement', presidentielle, 1, { quick: true })
  const answers: Answers = { ...c.input.state.answers, [pick.q.id]: { ratings: { [pick.a]: -1 }, redLines: [pick.a] } }
  const results = computeResults(presidentielle, answers, {}, 'graine-1')
  return { ...c, input: { ...c.input, state: { answers, weights: {} }, results } }
}

const quick = makeCase('présidentielle, questionnaire rapide', presidentielle, 1, { quick: true })
const cases: Case[] = [
  quick,
  findCase('présidentielle, complet, lignes rouges, hors classement', presidentielle, { share: 0.62, red: 0.08 }, r => r.unranked.length > 1 && r.ranking.some(x => !x.compatible) && !r.allIncompatible, { prio: 3, staleCount: 2 }),
  makeCase('présidentielle, toutes les questions', presidentielle, 2, { red: 0.02 }, { prio: 3 }),
  // Lignes rouges franchies par des non classés seulement (décision du propriétaire du 14 octobre 2026) : la phrase
  // sous l'affiche et le détail les comptent, avec la mention « (non classé) »
  offOnlyRedLine(),
  makeCase('présidentielle, peu de réponses', presidentielle, 3, { max: 4 }),
  findCase('présidentielle, 25 lignes rouges et plus, tous incompatibles', presidentielle, { share: 0.6, red: 0.35 }, r => r.redLineCount >= 25 && r.allIncompatible),
  findCase('présidentielle, résultat sensible à la méthode', presidentielle, { share: 0.5, red: 0.03 }, r => !r.stable),
  findCase('primaire, vote en cours, écart serré', primaire, { quick: true }, r => r.close),
  findCase('primaire, après le vote, lignes rouges', primaire, { share: 0.6, red: 0.08 }, r => r.ranking.some(x => x.dealbreakers.length > 0), {
    archive: { voting: false, currentLabel: 'Présidentielle 2027' },
    now: new Date(2026, 9, 18, 10, 0, 0),
  }),
  makeCase('élection factice, ex æquo forcé', twin, 4, {}, { prio: 2 }),
  makeCase('élection factice, qualifiés du second tour', twin, 5, {}, { ids: twin.election.finalists ?? [], finalistsOnly: true }),
]
cases.push(emptyRanking(quick))

/** Le texte du document, blancs et retours à la ligne réduits à une espace */
const flat = (s: string) => s.replace(/\s+/g, ' ')
const nameOf = (pack: ElectionPack, id: string) => pack.candidates.find(c => c.id === id)?.name ?? id

function read(c: Case) {
  const out = renderReport(c.input)
  const doc = readPdf(out.bytes)
  const text = flat(doc.pages.map(p => p.text).join('\n'))
  return { out, doc, text }
}

describe.each(cases)('$name', c => {
  const { pack, results } = c.input
  const { out, doc, text } = read(c)
  const after = (needle: string, from = 0) => text.indexOf(flat(needle), from)

  it('se construit : au plus 12 pages et 400 ko, sans caractère perdu ni octet hors WinAnsi', () => {
    expect(doc.version).toBe('1.4')
    expect(doc.pages.length).toBeLessThanOrEqual(12)
    expect(out.bytes.length).toBeLessThanOrEqual(400_000)
    expect(out.lost).toEqual([])
    expect(doc.pages.every(p => p.contentAscii)).toBe(true)
    expect(text).not.toContain('�')
    expect(doc.info.title).toBe(`Votre dépouillement · ${pack.election.shortName}`)
    expect(doc.info.lang).toBe('fr-FR')
  })

  it('a ses mentions : titre, réponses, IA en tête, indépendance, pas une consigne de vote, date, méthode', () => {
    const first = flat(doc.pages[0]?.text ?? '')
    expect(first).toContain('Votre dépouillement')
    expect(first).toContain(`Sur ${results.answered} réponse`)
    expect(first.indexOf('Textes rédigés par IA')).toBeGreaterThanOrEqual(0)
    expect(first.indexOf('Textes rédigés par IA')).toBeLessThan(first.indexOf('Le classement') < 0 ? Infinity : first.indexOf('Le classement'))
    expect(first).toContain('elles ne sont pas relues une par une par une personne')
    // Les positions des candidats (qui porte quoi, d'où vient le calcul) sont dites recherchées et résumées par IA
    expect(first).toContain('les positions attribuées aux candidats, sur lesquelles repose le calcul, recherchées et résumées par une IA')
    expect(text).toContain(flat(pack.election.copy.independence.footer))
    expect(text).toContain('pas une consigne de vote')
    expect(text).toContain(pack.election.dataFrozenAt.split('-').reverse().join('.'))
    expect(text).toContain(`méthode ${METHOD_VERSION}`)
    expect(text).toContain(c.input.slug ? `isoloir.vercel.app/#/${c.input.slug}/methode` : 'isoloir.vercel.app/#/methode')
    // Chaque page porte au pied ses mentions (une page imprimée ou transmise seule les garde) et son numéro
    doc.pages.forEach((p, i) => {
      const t = flat(p.text)
      expect(t).toContain('Document personnel.')
      expect(t).toContain('ce n’est pas une consigne de vote')
      expect(t).toContain('Outil indépendant.')
      expect(t).toContain('Questions et approches rédigées, positions résumées par IA, vérifiées automatiquement')
      expect(t).toContain(`page ${i + 1}/${doc.pages.length}`)
    })
  })

  it('classe comme la page : rangs, ex æquo, pourcentages et paliers, dans l’ordre du classement', () => {
    const start = after('Le classement')
    expect(start).toBeGreaterThan(0)
    let from = start
    for (const r of results.ranking) {
      const cand = pack.candidates.find(x => x.id === r.candidateId)!
      // Les initiales du cercle sont un artefact : le rang, puis le nom
      const at = after(`${r.rank} ${r.tied ? 'ex æquo ' : ''}${cand.name}`, from)
      expect(at, `${r.rank} ${cand.name}`).toBeGreaterThan(from - 1)
      expect(text).not.toContain(`${cand.initials} ${cand.name}`)
      from = at + 1
      const pct = displayScore(r.score)
      if (pct !== null) expect(text.slice(at, at + 300)).toContain(`${pct} %`)
    }
    expect(text.includes('ex æquo')).toBe(results.ranking.some(r => r.tied))
    // Même seuil que la page pour l'encadré des lignes rouges nombreuses
    expect(text.includes(flat(manyRedLinesNote(results.redLineCount)))).toBe(results.redLineCount > MANY_RED_LINES)
  })

  it('nomme hors classement et non classés dans l’ordre tiré au hasard, les non classés avec leur score indicatif', () => {
    if (results.unranked.length && results.minCoverageShare !== null) {
      let from = after(unrankedTitle(results.unranked.length))
      expect(from).toBeGreaterThan(0)
      for (const r of results.unranked) {
        const at = after(nameOf(pack, r.candidateId), from)
        expect(at, nameOf(pack, r.candidateId)).toBeGreaterThan(from)
        from = at
      }
      if (results.unranked.length > 1) expect(text).toContain('Ordre tiré au hasard')
    }
    if (results.excluded.length) {
      const start = after(excludedTitle(results.excluded.length))
      expect(start).toBeGreaterThan(0)
      let from = start
      for (const id of results.excluded) {
        const at = after(nameOf(pack, id), from)
        expect(at, nameOf(pack, id)).toBeGreaterThan(from)
        from = at
      }
      // Score indicatif (décision du propriétaire du 14 octobre 2026) : un par candidat connu sur au moins une réponse,
      // dans l'ordre de la liste ; aucun rang
      const ends = ['Vos lignes rouges franchies', 'Accords et désaccords', 'À garder en tête'].map(n => after(n, start)).filter(i => i > 0)
      const block = text.slice(start, Math.min(...ends))
      const scores = [...block.matchAll(/Score indicatif\s*:\s*(\d+)\s*%/g)].map(m => Number(m[1]))
      expect(scores).toEqual(results.excludedResults.filter(r => r.score !== null).map(r => displayScore(r.score)))
      expect(block.match(/%/g)?.length ?? 0).toBe(scores.length)
      expect(block).not.toMatch(/ex æquo|\b\d+e\b/)
    }
    // Tous les candidats de l'élection sont nommés (26 pour la présidentielle)
    for (const cand of pack.candidates) {
      const inResult = [...results.ranking, ...results.unranked].some(r => r.candidateId === cand.id) || results.excluded.includes(cand.id)
      if (inResult) expect(text, cand.name).toContain(cand.name)
    }
  })

  it('détaille les lignes rouges franchies', () => {
    // Non classés compris (décision du propriétaire du 14 octobre 2026) : une croix n'est jamais sans son détail, et la
    // phrase sous l'affiche compte autant de candidats que de croix
    const crossed = [...results.ranking, ...results.unranked, ...results.excludedResults].filter(r => r.dealbreakers.length)
    const crossing = crossed.filter(r => !r.compatible).length
    if (results.ranking[0]?.score != null && !results.allIncompatible && crossing > 0) expect(text).toContain(flat(crossingNote(crossing)))
    expect(text.includes('Vos lignes rouges franchies')).toBe(crossed.length > 0)
    if (!crossed.length) return
    const section = text.slice(after('Vos lignes rouges franchies', after('Le classement')))
    // Qui porte quoi : des positions résumées par IA, étiquetées comme sur le site
    expect(section).toContain('Approches rédigées et positions résumées par IA · vérifiées automatiquement contre leurs sources')
    const approach = new Map(pack.bank.questions.flatMap(q => q.approaches.map(a => [a.id, a.text] as const)))
    for (const r of crossed) for (const d of r.dealbreakers) expect(section).toContain(flat(approach.get(d.approachId) ?? '∅'))
    expect(section.includes('(non classé)')).toBe(results.excludedResults.some(r => r.dealbreakers.length > 0))
    const firm = crossed.some(r => r.dealbreakers.some(d => d.level === 'touche'))
    expect(section).toContain(firm ? 'Franchie par' : 'Peut-être')
  })

  it('suit l’ordre des sections et reprend la grille par thème entière', () => {
    const order = ['Votre dépouillement', 'Le classement', ...(results.ranking.length ? ['Accords et désaccords', 'Par thème'] : []), 'À garder en tête', 'À propos de ce document']
    const at = order.map(t => after(t))
    expect(at.every(i => i >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
    if (!results.ranking.length) {
      expect(text).toContain('pas de classement pour l’instant')
      expect(text).not.toContain('Par thème')
      return
    }
    // Accords : chaque classé nommé en entier (la colonne d'identité s'élargit pour le nom le plus long)
    const agreeStart = after('Vos avis sur ce que porte chaque candidat')
    const agree = text.slice(agreeStart, after('Par thème', agreeStart))
    for (const r of results.ranking) expect(agree).toContain(nameOf(pack, r.candidateId))
    // Une colonne par candidat classé, au nom écrit en entier ; une étoile par thème prioritaire
    const grid = text.slice(after('Par thème', after('Accords et désaccords', after('Le classement'))))
    for (const r of results.ranking) expect(grid).toContain(nameOf(pack, r.candidateId))
    const rows = out.log.filter(e => e.kind === 'grid-row')
    const starred = rows.filter(e => e.id?.endsWith('*')).map(e => e.id?.slice(0, -1))
    const answered = new Set(pack.bank.questions.filter(q => c.input.state.answers[q.id]).map(q => q.topicId))
    const chosen = pack.bank.topics.filter(t => answered.has(t.id) && c.input.state.weights[t.id] === 2).map(t => t.id)
    expect([...new Set(starred)]).toEqual(chosen.filter(id => rows.some(e => e.id?.startsWith(id))))
  })

  it('n’imprime ni mot interdit ni état de la session', () => {
    for (const word of ['sondage', 'gagnant', 'intentions de vote', 'vainqueur', 'depuis votre dernier passage', 'avec ce changement de priorités', 'Comparer mes', 'Appuyez', '[à compléter']) {
      expect(text.toLowerCase(), word).not.toContain(word.toLowerCase())
    }
  })

  it('dit l’archive, le vote en cours ou passé, les qualifiés et les questions à revoir', () => {
    const first = flat(doc.pages[0]?.text ?? '')
    expect(first.includes('Archive')).toBe(!!c.input.archive)
    expect(text.includes(flat(VOTING_NOTE))).toBe(!!c.input.archive?.voting)
    if (c.input.archive && !c.input.archive.voting) expect(text).toContain(pack.election.archived?.note ?? '∅')
    if (c.input.archive) expect(first).toContain('Isoloir pour la présidentielle 2027')
    expect(text.includes('Seulement les qualifiés pour le 2nd tour')).toBe(c.input.finalistsOnly)
    expect(text.includes('question a changé') || text.includes('questions ont changé')).toBe(c.input.staleCount > 0)
  })

  it('se pagine sans titre seul, sans débordement, avec « (suite) »', () => {
    expect(layoutProblems(out.log, CB)).toEqual([])
    doc.pages.forEach((p, i) => {
      if (i === 0) return
      const first = out.log.find(e => e.page === i)
      if (first?.suite) expect(flat(p.text)).toContain('(suite)')
    })
  })

  it('est déterministe', () => {
    expect(buildReportPdf(c.input)).toEqual(out.bytes)
  })
})

describe('dépouillement en PDF : règles générales', () => {
  it('lignes rouges franchies par des non classés seulement : comptées sous l’affiche, détaillées avec « (non classé) »', () => {
    const c = cases.find(x => x.name === 'présidentielle, lignes rouges franchies par des non classés seulement') as Case
    const r = c.input.results
    const crossing = r.excludedResults.filter(x => !x.compatible).length
    expect(crossing).toBeGreaterThan(0)
    expect([...r.ranking, ...r.unranked].some(x => x.dealbreakers.length)).toBe(false)
    const { text } = read(c)
    expect(text).toContain(flat(crossingNote(crossing)))
    expect(text.slice(text.indexOf('Vos lignes rouges franchies', text.indexOf('Le classement')))).toContain('(non classé)')
  })

  it('refuse de fabriquer un dépouillement sans réponse', () => {
    const c = makeCase('vide', presidentielle, 1, { max: 0 })
    expect(c.input.results.answered).toBe(0)
    expect(() => buildReportPdf(c.input)).toThrow()
  })

  it('ex æquo forcé : deux candidats aux positions identiques partagent leur rang, et le PDF le dit', () => {
    const c = cases.find(x => x.name === 'élection factice, ex æquo forcé') as Case
    const [a, b] = ['exemple', 'essai'].map(id => c.input.results.ranking.find(r => r.candidateId === id))
    expect(a && b && a.rank === b.rank && a.tied && b.tied).toBe(true)
    expect(read(c).text).toContain(`${a?.rank} ex æquo`)
  })

  it('marque les initiales décoratives comme artefacts, et sépare le rang du nom', () => {
    const c = cases[1] as Case
    const { doc } = read(c)
    const content = doc.pages.map(p => p.content).join('\n')
    const marks = content.match(/\/Artifact BMC/g)?.length ?? 0
    expect(marks).toBeGreaterThan(c.input.results.ranking.length)
    expect(content.match(/\bEMC\b/g)?.length).toBe(marks)
    // Le rang s'écrit suivi d'une espace : les lecteurs qui gardent les initiales ne les collent pas au rang
    const first = c.input.results.ranking[0]
    expect(content).toContain(`(${first?.rank} ) Tj`)
  })

  it('nomme le fichier à la date locale de l’appareil', () => {
    expect(reportFileName(presidentielle, new Date(2026, 9, 11, 23, 59))).toBe('isoloir-presidentielle-2027-depouillement-2026-10-11.pdf')
    expect(reportFileName(primaire, new Date(2026, 0, 2, 0, 1))).toBe('isoloir-choisir-2027-depouillement-2026-01-02.pdf')
  })

  it('présidentielle complète : tous les candidats montrés y sont, et la grille a 18 colonnes au plus', () => {
    const c = makeCase('présidentielle, tous les candidats', presidentielle, 7, {}, { prio: 1 })
    const { results } = c.input
    expect(results.ranking.length + results.unranked.length + results.excluded.length).toBe(presidentielle.candidates.length)
    const { text, out } = read(c)
    for (const cand of presidentielle.candidates) expect(text).toContain(cand.name)
    const heads = out.log.filter(e => e.kind === 'grid-head')
    expect(new Set(heads.map(e => e.id)).size).toBe(Math.ceil(results.ranking.length / 18))
  })

  it('encode tous les textes des élections sans rien perdre', () => {
    for (const pack of [...elections, manyCandidates]) {
      const { election } = pack
      const texts = [
        election.name,
        election.shortName,
        election.copy.independence.footer,
        election.archived?.note ?? '',
        ...pack.bank.topics.map(t => t.label),
        ...pack.bank.questions.flatMap(q => [q.prompt, ...q.approaches.map(a => a.text)]),
        ...pack.candidates.flatMap(c => [c.name, c.initials, c.affiliation]),
      ]
      for (const t of texts) expect(encodeWinAnsi(t).lost, t).toEqual([])
    }
  })

  it('prend ses encres dans le mode clair de tokens.css', () => {
    const css = readFileSync(join(ROOT, 'src/styles/tokens.css'), 'utf8')
    const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')))
    const token = (name: string) => new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(root)?.[1]?.toLowerCase()
    const pairs: [string, string][] = [
      ['paper', PDF_COLORS.paper],
      ['print', PDF_COLORS.print],
      ['print-soft', PDF_COLORS.soft],
      ['rule', PDF_COLORS.rule],
      ['ink', PDF_COLORS.ink],
      ['red', PDF_COLORS.red],
      ['copy', PDF_COLORS.copy],
      ['copy-print', PDF_COLORS.copyPrint],
      ['copy-print-soft', PDF_COLORS.copySoft],
      ['copy-ink', PDF_COLORS.copyInk],
      ['copy-red', PDF_COLORS.copyRed],
      ...Object.entries(PDF_BANDS).flatMap(([key, b]): [string, string][] => [
        [`aff-${key}`, b.color],
        [`aff-${key}-tint`, b.tint],
        [`copy-aff-${key}`, b.copy],
      ]),
    ]
    for (const [name, value] of pairs) expect(value, name).toBe(token(name))
    // Le bleu bille pâli : l'encre à 45 % sur blanc, précalculée
    const ink = [1, 3, 5].map(i => parseInt(PDF_COLORS.ink.slice(i, i + 2), 16))
    const muted = [1, 3, 5].map(i => parseInt(PDF_COLORS.inkMuted.slice(i, i + 2), 16))
    ink.forEach((v, i) => expect(Math.abs((muted[i] ?? 0) - (255 - 0.45 * (255 - v)))).toBeLessThanOrEqual(1))
  })

  it('n’entre jamais dans le JS initial : seul import() charge le rapport et son moteur', () => {
    const files = (dir: string): string[] =>
      readdirSync(dir).flatMap(f => {
        const p = join(dir, f)
        return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(f) ? [p] : []
      })
    const offenders: string[] = []
    for (const file of files(join(ROOT, 'src'))) {
      const rel = relative(ROOT, file)
      if (rel === 'src/core/reportPdf.ts' || rel.startsWith('src/core/pdf/')) continue
      const code = readFileSync(file, 'utf8')
      for (const m of code.matchAll(/^\s*(import|export)\s+(?!type\b)[^;]*?from\s+'([^']+)'/gm)) {
        if (/(^|\/)(reportPdf|pdf\/[\w-]+)$/.test(m[2] ?? '') || /\/core\/pdf$/.test(m[2] ?? '')) offenders.push(`${rel} : ${m[0].trim()}`)
      }
    }
    expect(offenders).toEqual([])
    // Le chargeur passe bien par import()
    expect(readFileSync(join(ROOT, 'src/ui/report/load.ts'), 'utf8')).toMatch(/import\('\.\.\/\.\.\/core\/reportPdf'\)/)
  })
})
