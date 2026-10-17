// Application des changements de la veille automatique (tools/veille/apply.mjs et lib/apply.mjs, contrat
// tools/veille/CONTRACT.md §c.4, §c.8, §d.7, annexe A1) : ce qui se publie, ce qui est retenu pour le propriétaire et ce
// qui est écarté. Les règles s'essaient sur une copie FIGÉE en mémoire des données de la présidentielle (banque,
// décisions, historique) : les positions qu'elles touchent (Gabriel Attal, Bruno Retailleau, Laurent Lisnard sur
// quelques questions) y sont fixées, pour qu'une publication légitime de la veille ne les casse pas ; les données réelles
// ne servent qu'aux contrôles de structure. Les essais de la ligne de commande travaillent sur une copie dans un dossier
// temporaire. Les sources des changements sont fictives.
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { election } from '../src/elections/presidentielle-2027/election'
import {
  acceptQuestion, addTransferSlot, applyChangeset, buildNote, claimKeyOf, classOf, forbiddenHits, hiddenNamesRegex, knownCount,
  nextLetter, parseCandidatesTs, publishedForm, serializeLike, transferSlotsOf, typo,
} from '../tools/veille/lib/apply.mjs'
import * as stateLib from '../tools/veille/lib/state.mjs'
import { DEFAULT_POLICY, SCHEMAS, validate } from '../tools/veille/schemas.mjs'
import { REPO_ROOT } from './helpers/workflow-harness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- valeurs JSON lues ou fabriquées sans type propre
type Json = Record<string, any>
const D = join(REPO_ROOT, 'research/presidentielle-2027')
const S = join(REPO_ROOT, 'src/elections/presidentielle-2027')
const readJ = (f: string) => JSON.parse(readFileSync(f, 'utf8'))
const realBank = readJ(join(D, 'bank.json'))
const decisionsText = readFileSync(join(D, 'decisions.json'), 'utf8')
const config = readJ(join(D, 'config.json'))

// ——— Données figées en mémoire ———
/** Questions où Gabriel Attal n'a rien (positions compatibles nouvelles des essais de plafond) */
const FREE = ['retraites-3-a', 'fiscalite-1-a', 'travail_salaires-3-a', 'sante-3-a', 'logement-3-a', 'education-3-b', 'numerique-2-b']
const FIXED_SOURCES = [{ title: 'Entretien publié fictif', url: 'https://www.journal-publie.fr/entretien-fictif', date: '2026-05-02', publisher: 'Journal publié' }]
const FIXED_MAIN = { weight: 2, nature: 'proposition', confidence: 'high', summary: 'Position principale publiée, fictive et figée pour les essais.', sources: FIXED_SOURCES }
const FIXED_REJECT = { rejects: true, nature: 'declaration', confidence: 'high', summary: 'Rejet publié, fictif et figé pour les essais.', sources: FIXED_SOURCES }
const OWNER_SOURCES = [{ title: 'Plan fictif du propriétaire', url: 'https://www.exemple-proprietaire.fr/plan', date: '2026-10-12', publisher: 'Site fictif' }]
const touched = (cid: string, aid: string) =>
  (cid === 'attal' && (/^(retraites-2|immigration-1)-/.test(aid) || aid === 'finances_publiques-2-f' || FREE.includes(aid))) || (cid === 'lisnard' && aid.startsWith('retraites-2-'))
  || (cid === 'retailleau' && aid === 'finances_publiques-1-a')
const trimmed = (aid: string) => /^retraites-2-[f-p]$/.test(aid) || /^retraites-3-[e-p]$/.test(aid)
function freezeBank(b: Json): Json {
  const out = structuredClone(b)
  for (const q of out.bank.questions) q.approaches = q.approaches.filter((a: Json) => !trimmed(a.id))
  for (const [cid, row] of Object.entries(out.positions) as [string, Json][]) for (const aid of Object.keys(row)) if (touched(cid, aid) || trimmed(aid)) delete row[aid]
  Object.assign(out.positions.attal, { 'retraites-2-c': FIXED_MAIN, 'finances_publiques-2-f': FIXED_REJECT, 'immigration-1-c': FIXED_MAIN })
  out.positions.retailleau['finances_publiques-1-a'] = { ...FIXED_MAIN, sources: OWNER_SOURCES }
  return out
}
function freezeDecisions(d: Json): Json {
  const out = structuredClone(d)
  out.positions = (out.positions ?? []).filter((e: Json) => !touched(e.candidate, String(e.approachId ?? '')) && !trimmed(String(e.approachId ?? '')))
  out.addApproaches = (out.addApproaches ?? []).filter((a: Json) => !/^retraites-[23]$/.test(a.questionId))
  out.dropApproaches = (out.dropApproaches ?? []).filter((x: unknown) => !/retraites-[23]-/.test(JSON.stringify(x)))
  // L'entrée du propriétaire de Bruno Retailleau, figée : prise de position du 12 octobre, sans clé veille
  out.positions.push({
    questionId: 'finances_publiques-1', candidate: 'retailleau', approachId: 'finances_publiques-1-a', weight: 2, rejects: false, nature: 'proposition',
    confidence: 'high', summary: FIXED_MAIN.summary, sources: OWNER_SOURCES, verdict: 'confirmed', note: 'Décision du propriétaire (essai).',
    historyCause: 'prise-de-position', statedAt: '2026-10-12',
  })
  return out
}
function freezeHistory(h: Json): Json {
  const out = structuredClone(h)
  for (const id of Object.keys(out.labels?.approaches ?? {})) if (trimmed(id)) delete out.labels.approaches[id]
  return out
}
const bankJson = freezeBank(realBank)
const decisions = freezeDecisions(JSON.parse(decisionsText))
const history = freezeHistory(readJ(join(D, 'positions-history.json')))
const frozenDecisionsText = serializeLike(decisionsText, decisions)
/** Les fonctions de lib/state.mjs, telles qu'apply.mjs les passe à applyChangeset */
const stateOps = stateLib as unknown as NonNullable<Parameters<typeof applyChangeset>[0]['stateOps']>
const candidates = parseCandidatesTs(readFileSync(join(S, 'candidates.ts'), 'utf8'))
const transferText = readFileSync(join(S, 'transfer.ts'), 'utf8')
const fixture = readJ(join(REPO_ROOT, 'tests/fixtures/transfer-slots-presidentielle-2027.json'))

const visibleIds: string[] = config.candidates.filter((c: Json) => !c.pendingPrimary && !(election.hidden ?? []).includes(c.id)).map((c: Json) => c.id)
const TODAY = '2026-10-19'
const SINCE = '2026-10-06'
const RUN = '2026-10-19-hebdo'
const LOCKS0 = { format: 'isoloir-veille-locks/1', locks: [] }

const pub = (cid: string, aid: string) => bankJson.positions[cid]?.[aid] ?? null
const qOf = (aid: string) => aid.replace(/-[^-]+$/, '')
const src = (n: number, date = '2026-10-16', host = 'journal-exemple.fr') => ({ title: `Article fictif n° ${n}`, url: `https://www.${host}/article-${n}`, date, publisher: `Journal fictif ${n}` })
const pos = (weight: 1 | 2 | 0, extra: Json = {}) => ({
  ...(weight ? { weight } : { rejects: true }),
  nature: 'proposition',
  confidence: 'high',
  summary: 'Résumé fictif d’une position relevée dans une source fictive.',
  sources: [src(1)],
  ...extra,
})
function set(cid: string, aid: string, after: Json | null, extra: Json = {}): Json {
  return {
    kind: 'set', candidateId: cid, questionId: qOf(aid), approachId: aid, proposedApproachText: null, before: pub(cid, aid), after,
    cause: 'prise-de-position', statedAt: '2026-10-16',
    evidence: { primarySource: true, independentOutlets: 1, shortQuote: '' },
    verifier: { verdict: 'confirmed', notes: 'Source relue.' },
    blindRecode: null, rationale: 'Déclaration récente.', ...extra,
  }
}
const remove = (cid: string, aid: string, extra: Json = {}) => set(cid, aid, null, { kind: 'remove', ...extra })
const agree = (aid: string | null, weight = 2) => ({ approachId: aid, weight, rejects: false, agrees: true })
function addApproach(cid: string, qid: string, k: number, text: string, extra: Json = {}): Json {
  return {
    kind: 'addApproach', candidateId: cid, questionId: qid, approachId: `${qid}-NEW${k}`, proposedApproachText: text, before: null, after: null,
    cause: 'nouvelle-approche', statedAt: null, evidence: { primarySource: true, independentOutlets: 2, shortQuote: '' },
    verifier: { verdict: 'confirmed', notes: 'Aucune approche ne la couvre.' }, blindRecode: null, rationale: 'Position centrale, sans approche.', ...extra,
  }
}
function changeset(byCand: Record<string, Json[]>, extra: Json = {}, resultExtra: Json = {}): Json {
  return {
    format: 'isoloir-veille-changeset/1', runId: RUN, electionId: 'presidentielle-2027', baseCommit: '9d6eb73', today: TODAY,
    since: Object.fromEntries(Object.keys(byCand).map(c => [c, SINCE])),
    results: [{
      format: 'isoloir-veille-refresh/1', electionId: 'presidentielle-2027', mode: 'candidates', today: TODAY,
      candidates: Object.entries(byCand).map(([cid, changes]) => ({ candidateId: cid, since: SINCE, triageCompleted: true, searches: 10, findings: changes.length, changes })),
      newQuestionSubjects: [], programmes: [], log: [], ...resultExtra,
    }],
    ...extra,
  }
}
function run(cs: Json, o: Json = {}) {
  const out = applyChangeset({
    changeset: cs, bankJson: o.bankJson ?? bankJson, decisions: o.decisions ?? decisions, config, election: o.election ?? election, candidates, history,
    policy: o.policy ?? {}, locks: o.locks ?? LOCKS0, ledger: o.ledger ?? null, state: null, pending: o.pending ?? [], localWatch: [],
    holds: o.holds ?? [], approve: o.approve ?? [], only: o.only ?? [], today: TODAY, now: '2026-10-19T08:00:00+02:00',
  })
  expect(validate(SCHEMAS.APPLY_REPORT, out.report)).toEqual([])
  expect(validate(SCHEMAS.LEDGER, out.ledger)).toEqual([])
  return out
}
const reasons = (out: Json, kind: 'held' | 'dropped') => out.report[kind].map((x: Json) => `${x.change.candidateId}:${x.change.approachId ?? x.change.questionId}:${x.reason}`)
const entryOf = (out: Json, cid: string, aid: string) => out.decisions.positions.find((e: Json) => e.candidate === cid && e.approachId === aid)

describe('outils de lib/apply', () => {
  it('typo() est celle de build-pack, octet pour octet', () => {
    const bp = readFileSync(join(REPO_ROOT, 'tools/build-pack.mjs'), 'utf8')
    const mine = readFileSync(join(REPO_ROOT, 'tools/veille/lib/apply.mjs'), 'utf8')
    const body = (t: string) => t.slice(t.indexOf('export function typo'), t.indexOf('\n}\n', t.indexOf('export function typo')))
    expect(body(mine)).toBe(body(bp))
    expect(typo("Quelle dette? « oui »")).toBe('Quelle dette\u202f? «\u202foui\u202f»')
  })

  it('publishedForm redonne exactement les positions publiées (typographie déjà appliquée)', () => {
    for (const row of Object.values(realBank.positions) as Json[]) for (const p of Object.values(row)) expect(publishedForm(p)).toEqual(p)
  })

  it('les fiches de candidates.ts : identifiant, nom, initiales et nuance, dans l’ordre', () => {
    expect(candidates.length).toBe(config.candidates.length)
    expect(candidates.find(c => c.id === 'polony')).toMatchObject({ name: 'Natacha Polony', nuance: 'DIV' })
    for (const c of candidates) expect(c.nuance, c.id).toMatch(/^[A-Z]{2,3}$/)
  })

  it('claimKey : stable, sensible aux sources, au poids et au texte d’une approche proposée', () => {
    const a = set('attal', 'retraites-2-c', pos(2))
    expect(claimKeyOf(a)).toBe(claimKeyOf(structuredClone(a)))
    expect(claimKeyOf(a)).toMatch(/^[0-9a-f]{40}$/)
    // Même page, autre écriture de l'adresse : même clé ; source neuve, autre poids : autre clé
    expect(claimKeyOf(set('attal', 'retraites-2-c', pos(2, { sources: [{ ...src(1), url: 'https://journal-exemple.fr/article-1/?utm_source=x' }] })))).toBe(claimKeyOf(a))
    expect(claimKeyOf(set('attal', 'retraites-2-c', pos(2, { sources: [src(1), src(2)] })))).not.toBe(claimKeyOf(a))
    expect(claimKeyOf(set('attal', 'retraites-2-c', pos(1)))).not.toBe(claimKeyOf(a))
    const p1 = set('attal', 'retraites-2-NEW1', pos(2), { before: null })
    expect(claimKeyOf(p1, 'Un texte')).not.toBe(claimKeyOf(p1, 'Un autre texte'))
    expect(claimKeyOf(p1, 'Un texte')).toBe(claimKeyOf({ ...p1, approachId: 'retraites-2-NEW7' }, 'un  TEXTE'))
  })

  it('classes : forme, secondaire, principale, renversement, nouvelle approche', () => {
    const main = { weight: 2, nature: 'proposition', confidence: 'high', summary: 'x', sources: [] }
    const comp = { ...main, weight: 1 }
    const rej = { nature: 'proposition', confidence: 'high', summary: 'x', sources: [], rejects: true }
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: { ...main, summary: 'y' } }, main)).toBe('forme')
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: comp }, null)).toBe('secondaire')
    expect(classOf({ kind: 'remove', approachId: 'q-1-a', after: null }, rej)).toBe('secondaire')
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: main }, null)).toBe('principale')
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: comp }, main)).toBe('principale')
    expect(classOf({ kind: 'remove', approachId: 'q-1-a', after: null }, main)).toBe('principale')
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: rej }, comp)).toBe('renversement')
    expect(classOf({ kind: 'set', approachId: 'q-1-a', after: main }, rej)).toBe('renversement')
    expect(classOf({ kind: 'set', approachId: 'q-1-NEW1', after: main }, null)).toBe('nouvelle-approche')
  })

  it('noms masqués : nom complet et nom de famille, casse et mot entier (tests/hidden.test.ts)', () => {
    const re = hiddenNamesRegex(election.hidden ?? [], candidates)!
    expect(re.test('Comme le propose Ségolène Royal')).toBe(true)
    expect(re.test('selon Royal,')).toBe(true)
    expect(re.test('des royalties')).toBe(false)
    expect(re.test('le prince royal')).toBe(false)
    expect(hiddenNamesRegex([], candidates)).toBeNull()
  })

  it('termes interdits : la recherche de 6-add-candidate (sans accents ni casse, mots entiers, noms des candidats)', () => {
    expect(forbiddenHits('Comme le veut le rassemblement National', config)).toContain('Rassemblement national')
    expect(forbiddenHits('Faire comme Attal', config)).toContain('Attal')
    expect(forbiddenHits('Renforcer les services publics de proximité', config)).toEqual([])
  })

  it('lettre suivante : jamais réutilisée, au plus « p »', () => {
    const q = bankJson.bank.questions.find((x: Json) => x.id === 'retraites-2')
    expect(nextLetter('retraites-2', { bankQuestion: q, decisions, history })).toBe('retraites-2-f')
    // Une lettre retirée (dropApproaches) ou connue de l'historique compte encore
    expect(nextLetter('retraites-2', { bankQuestion: q, decisions: { dropApproaches: ['retraites-2-g'] }, history })).toBe('retraites-2-h')
    expect(nextLetter('retraites-2', { bankQuestion: q, history: { labels: { approaches: { 'retraites-2-k': [] } } } })).toBe('retraites-2-l')
    expect(nextLetter('retraites-2', { bankQuestion: { approaches: [{ id: 'retraites-2-p' }] } })).toBeNull()
  })

  it('transfer.ts : lecture de la table, ajout d’une ligne à la fin, rien d’autre', () => {
    const slots = transferSlotsOf(transferText)!
    expect(slots.length).toBe(Object.keys(fixture.questions).length)
    const out = addTransferSlot(transferText, 'sante-x9', 100)
    const a = transferText.split('\n')
    const b = out.split('\n')
    expect(b.length).toBe(a.length + 1)
    expect(b.filter(l => !a.includes(l))).toEqual(["    'sante-x9': 100,"])
    expect(transferSlotsOf(out)!.at(-1)).toEqual(['sante-x9', 100])
    expect(() => addTransferSlot(transferText, 'retraites-1', 101)).toThrow(/déjà/)
    expect(() => addTransferSlot('export const x = {}', 'sante-x9', 100)).toThrow()
  })

  it('decisions.json garde sa mise en forme (pas de saut de ligne final) ; la fixture garde le sien', () => {
    expect(serializeLike(decisionsText, JSON.parse(decisionsText))).toBe(decisionsText)
    const ft = readFileSync(join(REPO_ROOT, 'tests/fixtures/transfer-slots-presidentielle-2027.json'), 'utf8')
    expect(serializeLike(ft, JSON.parse(ft))).toBe(ft)
  })

  it('knownCount est knownQuestions du score : approche portée ou rejetée, confiance autre que basse', () => {
    const qs = realBank.bank.questions
    const most = Math.max(...(election.ranking!.excluded!.ids.filter(id => !(election.hidden ?? []).includes(id)).map(id => knownCount(qs, realBank.positions[id]))))
    const ranked = Object.keys(realBank.positions).filter(id => !(election.hidden ?? []).includes(id) && !election.ranking!.excluded!.ids.includes(id))
    for (const id of ranked) expect(knownCount(qs, realBank.positions[id]), id).toBeGreaterThan(most)
    const q = qs[0]
    expect(knownCount([q], { [q.approaches[0].id]: { weight: 2, confidence: 'low' } })).toBe(0)
    expect(knownCount([q], { [q.approaches[0].id]: { rejects: true, confidence: 'medium' } })).toBe(1)
  })
})

describe('applyChangeset : publié', () => {
  it('une position compatible nouvelle sur une question approfondie : entrée de decisions.json à la manière du 15 octobre', () => {
    const c = set('attal', 'retraites-2-d', pos(1, { summary: 'Il se dit favorable à une part de capitalisation collective, en complément.' }))
    const out = run(changeset({ attal: [c] }))
    expect(out.report.published.map((p: Json) => [p.approachId, p.class])).toEqual([['retraites-2-d', 'secondaire']])
    const e = entryOf(out, 'attal', 'retraites-2-d')
    expect(Object.keys(e)).toEqual(['questionId', 'candidate', 'approachId', 'weight', 'rejects', 'nature', 'confidence', 'summary', 'sources', 'verdict', 'note', 'historyCause', 'statedAt', 'veille'])
    expect(e).toMatchObject({ weight: 1, rejects: false, verdict: 'confirmed', historyCause: 'prise-de-position', statedAt: '2026-10-16' })
    expect(e.veille).toEqual({ runId: RUN, claimKey: claimKeyOf(c), at: TODAY })
    expect(e.note).toMatch(/^Veille automatique du 19 octobre 2026 \(2026-10-19-hebdo, changement [0-9a-f]{8}\) : Déclaration récente\./)
    expect(e.note).toContain('AVANT : inconnue.')
    expect(e.note).toContain('APRÈS : compatible « Il se dit favorable')
    expect(e.note).toContain('Cause : prise de position du 16 octobre 2026.')
    expect(e.note).toContain('Vérifié automatiquement par une IA contre ses sources, sans relecture humaine.')
    // Ajoutée en fin de liste, rien d'autre ne bouge
    expect(out.decisions.positions.slice(0, -1)).toEqual(decisions.positions)
    expect(out.decisions.positions.length).toBe(decisions.positions.length + 1)
    expect(out.ledger.claims[claimKeyOf(c)]).toMatchObject({ status: 'published', publishedIn: RUN, candidateId: 'attal', kind: 'set' })
    expect(out.report.checked).toEqual(['attal'])
    expect(out.report.bundles['candidat:attal']).toEqual([claimKeyOf(c)])
  })

  it('idempotence : la même application, refaite avec son registre, ne change plus rien', () => {
    const cs = changeset({ attal: [set('attal', 'retraites-2-d', pos(1)), remove('attal', 'finances_publiques-2-f', { cause: 'relecture', statedAt: null })] })
    const first = run(cs)
    expect(first.report.published.length).toBe(2)
    const again = run(cs, { decisions: first.decisions, ledger: first.ledger })
    expect(again.report.published).toEqual([])
    expect(again.report.dropped.map((d: Json) => d.reason)).toEqual(['déjà-publiée', 'déjà-publiée'])
    expect(again.decisions).toEqual(first.decisions)
    expect(again.decisionsChanged).toBe(false)
    expect(again.ledger).toEqual(first.ledger)
  })

  it('changement d’approche principale sur une question approfondie : preuve, confiance haute et recodage à l’aveugle', () => {
    const before = pub('attal', 'retraites-2-c')
    expect(before.weight).toBe(2)
    const b = set('attal', 'retraites-2-b', pos(2), { blindRecode: agree('retraites-2-b') })
    const c = remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b') })
    const out = run(changeset({ attal: [b, c] }))
    expect(out.report.published.map((p: Json) => `${p.approachId}:${p.class}:${p.kind}`)).toEqual(['retraites-2-b:principale:set', 'retraites-2-c:principale:remove'])
    const r = entryOf(out, 'attal', 'retraites-2-c')
    expect(Object.keys(r)).toEqual(['questionId', 'candidate', 'approachId', 'remove', 'note', 'historyCause', 'statedAt', 'veille'])
    expect(r.note).toContain('APRÈS : retirée.')
    expect(r.note).toContain(`AVANT (publié jusqu’au 19 octobre 2026) : principale « ${before.summary.replace(/[.\s]+$/, '')} »`)
    expect(r.note).toContain('recodage à l’aveugle : d’accord')
  })

  it('renversement prouvé (rejet → compatible, prise de position de la période relue) : publié par défaut', () => {
    expect(pub('attal', 'finances_publiques-2-f').rejects).toBe(true)
    const c = set('attal', 'finances_publiques-2-f', pos(1), { blindRecode: agree('finances_publiques-2-f', 1) })
    expect(run(changeset({ attal: [c] })).report.published.map((p: Json) => p.class)).toEqual(['renversement'])
    // Le même, retenu quand policy.holdReversals le demande ; ou s'il ne vient que d'une relecture
    expect(reasons(run(changeset({ attal: [c] }), { policy: { holdReversals: true } }), 'held')).toEqual(['attal:finances_publiques-2-f:renversement'])
    expect(reasons(run(changeset({ attal: [{ ...c, cause: 'relecture', statedAt: null }] })), 'held')).toEqual(['attal:finances_publiques-2-f:preuve-insuffisante'])
  })

  it('une prise de position d’avant la période relue devient une relecture, sans date, et la note le dit', () => {
    const c = set('attal', 'retraites-2-d', pos(1), { statedAt: '2026-09-20' })
    const out = run(changeset({ attal: [c] }))
    const e = entryOf(out, 'attal', 'retraites-2-d')
    expect(e.historyCause).toBe('relecture')
    expect('statedAt' in e).toBe(false)
    expect(e.note).toContain('requalifiée en relecture')
    expect(out.report.published[0]).toMatchObject({ cause: 'relecture', statedAt: null, requalified: true })
    // La clé est celle du changement tel que reçu
    expect(out.report.published[0].claimKey).toBe(claimKeyOf(c))
  })

  it('une entrée du propriétaire ne cède qu’à une prise de position plus récente que sa date et ses sources', () => {
    const owner = decisions.positions.find((e: Json) => e.candidate === 'retailleau' && e.approachId === 'finances_publiques-1-a')
    expect(owner.statedAt).toBe('2026-10-12')
    expect('veille' in owner).toBe(false)
    const base = set('retailleau', 'finances_publiques-1-a', pos(2, { summary: 'Il précise son plan d’économies, chiffré à nouveau.', sources: [src(1, '2026-10-12')] }), { statedAt: '2026-10-12' })
    expect(reasons(run(changeset({ retailleau: [base] })), 'held')).toEqual(['retailleau:finances_publiques-1-a:entrée-du-propriétaire'])
    expect(reasons(run(changeset({ retailleau: [{ ...base, cause: 'relecture', statedAt: null }] })), 'held')).toEqual(['retailleau:finances_publiques-1-a:entrée-du-propriétaire'])
    const newer = { ...base, statedAt: '2026-10-16', after: { ...base.after, sources: [src(1, '2026-10-16')] } }
    const out = run(changeset({ retailleau: [newer] }))
    expect(out.report.published.map((p: Json) => p.class)).toEqual(['forme'])
    // Remplacée à sa place, avec la clé veille
    const at = decisions.positions.indexOf(owner)
    expect(out.decisions.positions[at]).toMatchObject({ candidate: 'retailleau', approachId: 'finances_publiques-1-a', statedAt: '2026-10-16', veille: { runId: RUN } })
    expect(out.decisions.positions.length).toBe(decisions.positions.length)
  })
})

describe('applyChangeset : écarté', () => {
  it('chaque règle d’écart, dans l’ordre du contrat', () => {
    const ok = pos(1)
    const cases: [Json, string][] = [
      [{ ...set('attal', 'retraites-2-d', ok), statedAt: null }, 'invalide'],
      [set('attal', 'retraites-2-z', ok), 'invalide'],
      [set('faure', 'retraites-2-d', ok), 'hors-cible'],
      [set('attal', 'retraites-2-d', ok, { verifier: { verdict: 'refuted', notes: 'La source ne dit pas cela.' } }), 'réfutée'],
      [set('attal', 'retraites-2-d', pos(1, { confidence: 'low' })), 'confiance-basse'],
      [set('attal', 'retraites-2-d', pos(1, { nature: 'inference' })), 'inférence-de-fond'],
      [set('attal', 'retraites-2-d', pos(1, { sources: [{ ...src(1), url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal' }] })), 'source-invalide'],
      [set('attal', 'retraites-2-d', pos(1, { sources: [{ ...src(1), url: 'https://www.exemple.fr/comparateur-des-programmes' }] })), 'source-invalide'],
      [set('attal', 'retraites-2-d', pos(1, { summary: 'Il reprend une idée défendue par Ségolène Royal pendant la primaire.' })), 'nom-masqué'],
      [set('attal', 'retraites-2-d', ok, { statedAt: '2026-10-25' }), 'date-future'],
      [remove('attal', 'retraites-2-d', { before: { ...pub('attal', 'retraites-2-c') } }), 'sans-effet'],
      [set('attal', 'retraites-2-c', pub('attal', 'retraites-2-c')), 'sans-effet'],
      [set('attal', 'retraites-2-c', pos(2, { summary: 'Un autre résumé, sans source neuve.', sources: pub('attal', 'retraites-2-c').sources })), 'résumé-sans-source-neuve'],
      [set('attal', 'retraites-2-d', ok, { verifier: { verdict: 'unverifiable', notes: 'Page indisponible.' } }), 'source-invérifiable'],
    ]
    for (const [c, why] of cases) expect(reasons(run(changeset({ [c.candidateId]: [c] })), 'dropped'), why).toEqual([`${c.candidateId}:${c.approachId}:${why}`])
  })

  it('une source neuve (adresse ou date plus récente) suffit à publier une retouche de forme', () => {
    const before = pub('attal', 'retraites-2-c')
    const c = set('attal', 'retraites-2-c', { ...before, summary: 'Résumé mis à jour d’après un entretien récent.', sources: [...before.sources, src(9)] })
    expect(run(changeset({ attal: [c] })).report.published.map((p: Json) => p.class)).toEqual(['forme'])
  })

  it('un candidat masqué, ou en attente de retrait, n’est jamais touché', () => {
    const pending = [{ id: 'R-attal', kind: 'retrait', status: 'attente', details: { candidateId: 'attal' } }]
    const out = run(changeset({ attal: [set('attal', 'retraites-2-d', pos(1))] }), { pending })
    expect(reasons(out, 'dropped')).toEqual(['attal:retraites-2-d:hors-cible'])
    expect(out.report.checked).toEqual([])
  })
})

describe('applyChangeset : retenu', () => {
  it('preuve insuffisante : un seul éditeur sans source primaire, ou pas de source primaire au questionnaire rapide', () => {
    const deep = set('attal', 'retraites-2-b', pos(2), { evidence: { primarySource: false, independentOutlets: 1, shortQuote: '' }, blindRecode: agree('retraites-2-b') })
    expect(reasons(run(changeset({ attal: [deep] })), 'held')).toEqual(['attal:retraites-2-b:preuve-insuffisante'])
    // Deux éditeurs indépendants suffisent sur une question approfondie, pas sur une question du questionnaire rapide
    const two = { primarySource: false, independentOutlets: 2, shortQuote: '' }
    const deep2 = { ...deep, evidence: two }
    expect(run(changeset({ attal: [deep2, remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b'), evidence: two })] })).report.published.length).toBe(2)
    const quick = set('attal', 'immigration-1-a', pos(2), { evidence: two, blindRecode: agree('immigration-1-a') })
    expect(reasons(run(changeset({ attal: [quick, remove('attal', 'immigration-1-c', { evidence: two, blindRecode: agree('immigration-1-a') })] })), 'held'))
      .toEqual(['attal:immigration-1-a:preuve-insuffisante', 'attal:immigration-1-c:preuve-insuffisante'])
    expect(reasons(run(changeset({ attal: [{ ...deep2, after: pos(2, { confidence: 'medium' }) }] })), 'held')).toEqual(['attal:retraites-2-b:preuve-insuffisante'])
  })

  it('recodage à l’aveugle absent ou en désaccord ; source invérifiable sur une approche principale', () => {
    const c = set('attal', 'retraites-2-b', pos(2))
    expect(reasons(run(changeset({ attal: [c] })), 'held')).toEqual(['attal:retraites-2-b:recodage-absent'])
    expect(reasons(run(changeset({ attal: [{ ...c, blindRecode: { ...agree('retraites-2-c'), agrees: false } }] })), 'held')).toEqual(['attal:retraites-2-b:recodage-en-désaccord'])
    expect(reasons(run(changeset({ attal: [{ ...c, blindRecode: agree('retraites-2-b'), verifier: { verdict: 'unverifiable', notes: '' } }] })), 'held')).toEqual(['attal:retraites-2-b:source-invérifiable'])
  })

  it('retrait d’une principale que le recodeur à l’aveugle ne confirme pas (lu mais muet, ou rien lu) : retenu, jamais publié', () => {
    const lone = remove('attal', 'retraites-2-c', { blindRecode: { approachId: null, weight: 0, rejects: false, agrees: false } })
    expect(reasons(run(changeset({ attal: [lone] })), 'held')).toEqual(['attal:retraites-2-c:recodage-en-désaccord'])
    expect(reasons(run(changeset({ attal: [{ ...lone, blindRecode: null }] })), 'held')).toEqual(['attal:retraites-2-c:recodage-absent'])
  })

  it('avant mal lu, verrou valable (pas un verrou échu), paquet retenu par l’orchestrateur', () => {
    const c = set('attal', 'retraites-2-d', pos(1))
    expect(reasons(run(changeset({ attal: [{ ...c, before: pub('attal', 'retraites-2-c') }] })), 'held')).toEqual(['attal:retraites-2-d:avant-mal-lu'])
    const lock = (l: Json) => ({ format: 'isoloir-veille-locks/1', locks: [{ candidateId: 'attal', reason: 'droit-de-réponse', since: '2026-10-10', ...l }] })
    expect(reasons(run(changeset({ attal: [c] }), { locks: lock({ questionId: 'retraites-2' }) }), 'held')).toEqual(['attal:retraites-2-d:verrou'])
    expect(reasons(run(changeset({ attal: [c] }), { locks: lock({ questionId: '*' }) }), 'held')).toEqual(['attal:retraites-2-d:verrou'])
    expect(run(changeset({ attal: [c] }), { locks: lock({ questionId: '*', until: '2026-10-18' }) }).report.published.length).toBe(1)
    expect(reasons(run(changeset({ attal: [c] }, { holds: ['candidat:attal'] })), 'held')).toEqual(['attal:retraites-2-d:retenu-par-le-run'])
    expect(reasons(run(changeset({ attal: [c] }), { holds: [`cle:${claimKeyOf(c)}`] }), 'held')).toEqual(['attal:retraites-2-d:retenu-par-le-run'])
  })

  it('état final invalide : deux approches principales sur une question, toute la question est retenue', () => {
    const b = set('attal', 'retraites-2-b', pos(2), { blindRecode: agree('retraites-2-b') })
    const d = set('attal', 'retraites-2-d', pos(1))
    expect(reasons(run(changeset({ attal: [b, d] })), 'held')).toEqual(['attal:retraites-2-b:état-final-invalide', 'attal:retraites-2-d:état-final-invalide'])
  })

  it('identifiants H-<jour>-<n> dans l’ordre des clés, gardés d’une exécution à l’autre ; une attente « OK H-… » par retenu', () => {
    const a = set('attal', 'retraites-2-b', pos(2))
    const b = set('attal', 'fiscalite-1-a', pos(2))
    const out = run(changeset({ attal: [a, b] }))
    const ids = out.report.held.map((h: Json) => [h.claimKey, h.id]).sort()
    expect(ids.map(([, id]: string[]) => id)).toEqual(['H-2026-10-19-1', 'H-2026-10-19-2'])
    expect(out.pending.map((p: Json) => p.approveWith).sort()).toEqual(['OK H-2026-10-19-1', 'OK H-2026-10-19-2'])
    for (const p of out.pending) expect(validate(SCHEMAS.PENDING_ITEM, p)).toEqual([])
    const again = run(changeset({ attal: [a, b, set('attal', 'retraites-3-a', pos(2))] }), { ledger: out.ledger, pending: out.pending })
    expect(again.report.held.find((h: Json) => h.claimKey === claimKeyOf(a)).id).toBe(out.report.held.find((h: Json) => h.claimKey === claimKeyOf(a)).id)
    expect(again.report.held.find((h: Json) => h.claimKey === claimKeyOf(set('attal', 'retraites-3-a', pos(2)))).id).toBe('H-2026-10-19-3')
    expect(again.pending.map((p: Json) => p.id)).toEqual(['H-2026-10-19-3'])
  })

  it('« OK H-… » : un retenu approuvé passe outre sa raison, pas un verrou ; « only » n’examine que lui', () => {
    const a = set('attal', 'retraites-2-b', pos(2), { blindRecode: agree('retraites-2-b'), evidence: { primarySource: false, independentOutlets: 1, shortQuote: '' } })
    const c = remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b'), evidence: { primarySource: false, independentOutlets: 1, shortQuote: '' } })
    const other = set('lisnard', 'retraites-2-d', pos(1))
    const first = run(changeset({ attal: [a, c], lisnard: [other] }))
    const holdIds = first.report.held.map((h: Json) => h.id)
    expect(holdIds.length).toBe(2)
    const ok = run(changeset({ attal: [a, c], lisnard: [other] }, { approve: holdIds }), { ledger: first.ledger })
    expect(ok.report.published.map((p: Json) => p.approachId).sort()).toEqual(['retraites-2-b', 'retraites-2-c'])
    // Celui de Lisnard, publié la première fois, reste publié une fois
    expect(reasons(ok, 'dropped')).toEqual(['lisnard:retraites-2-d:déjà-publiée'])
    const only = run(changeset({ attal: [a, c], lisnard: [other] }), { ledger: first.ledger, only: holdIds })
    expect(only.report.published.map((p: Json) => p.approachId).sort()).toEqual(['retraites-2-b', 'retraites-2-c'])
    expect(only.report.counts.ignored).toBe(1)
    expect(only.report.checked).toEqual([])
    const locked = { format: 'isoloir-veille-locks/1', locks: [{ candidateId: 'attal', questionId: 'retraites-2', reason: 'droit-de-réponse', since: '2026-10-10' }] }
    expect(run(changeset({ attal: [a, c] }, { approve: holdIds }), { ledger: first.ledger, locks: locked }).report.held.map((h: Json) => h.reason)).toEqual(['verrou', 'verrou'])
  })

  it('plafonds : au plus 5 changements de fond par candidat et 15 par exécution, sans compter la forme ni un programme', () => {
    // Sept positions compatibles nouvelles, sur des questions où il n'en a pas encore
    const free = ['retraites-3-a', 'fiscalite-1-a', 'travail_salaires-3-a', 'sante-3-a', 'logement-3-a', 'education-3-b', 'numerique-2-b']
    for (const aid of free) expect(pub('attal', aid), aid).toBeNull()
    const changes = free.map((aid, i) => set('attal', aid, pos(1), { statedAt: `2026-10-1${i}` }))
    expect(changes.length).toBeGreaterThan(5)
    const out = run(changeset({ attal: changes }))
    expect(out.report.published.length).toBe(5)
    expect(out.report.held.every((h: Json) => h.reason === 'plafond-candidat')).toBe(true)
    // Les plus récentes passent d'abord
    const kept = out.report.published.map((p: Json) => p.statedAt).sort()
    const all = changes.map(c => c.statedAt).sort()
    expect(kept).toEqual(all.slice(-5))
    expect(run(changeset({ attal: changes }), { policy: { caps: { changesPerRun: 3 } } }).report.held.filter((h: Json) => h.reason === 'plafond-run').length).toBe(changes.length - 3)
    // En mode programme, pas de plafond
    expect(run(changeset({ attal: changes }, {}, { mode: 'programme' })).report.published.length).toBe(changes.length)
  })

  it('même traitement pour tous : un non classé qui deviendrait aussi connu qu’un classé est retenu, avec une attente I-<id>', () => {
    // Banque modifiée en mémoire : le moins connu des classés (Florian Philippot) l'est à peine plus que Natacha Polony
    const qs = bankJson.bank.questions
    const polonyKnown = knownCount(qs, bankJson.positions.polony)
    const tight = structuredClone(bankJson)
    const row = tight.positions.philippot
    for (const q of qs) {
      if (knownCount(qs, row) <= polonyKnown + 1) break
      for (const a of q.approaches) delete row[a.id]
    }
    expect(knownCount(qs, row)).toBe(polonyKnown + 1)
    const unknown = qs.filter((q: Json) => !q.approaches.some((a: Json) => bankJson.positions.polony[a.id]) && q.tier === 'approfondi').slice(0, 2)
    const changes = unknown.map((q: Json) => set('polony', q.approaches[0].id, pos(1), { before: null }))
    const out = run(changeset({ polony: changes }), { bankJson: tight })
    expect(out.report.held.map((h: Json) => h.reason)).toEqual(['réintégration', 'réintégration'])
    const item = out.pending.find((p: Json) => p.id === 'I-polony')
    expect(item).toMatchObject({ kind: 'reintegration', approveWith: 'OK I-polony', details: { candidateId: 'polony', rankedMin: polonyKnown + 1 } })
    expect(validate(SCHEMAS.PENDING_ITEM, item)).toEqual([])
    // Sans la banque resserrée : publiés
    expect(run(changeset({ polony: changes })).report.published.length).toBe(2)
  })
})

describe('applyChangeset : approches ajoutées', () => {
  const text = 'Ouvrir à chaque salarié un compte de retraite par capitalisation géré par sa branche professionnelle'
  // L'approche proposée, sa position principale dessus, et le retrait de son ancienne approche principale
  const bundle = (cid = 'attal', k = 1, qid = 'retraites-2', main = 'c') => [
    addApproach(cid, qid, k, text),
    set(cid, `${qid}-NEW${k}`, pos(2), { before: null, blindRecode: agree(`${qid}-NEW${k}`) }),
    remove(cid, `${qid}-${main}`, { blindRecode: agree(`${qid}-NEW${k}`) }),
  ]

  it('la lettre suivante, réécrite partout ; addApproaches et registre des approches', () => {
    const out = run(changeset({ attal: bundle() }))
    expect(out.report.approaches).toEqual([{ questionId: 'retraites-2', placeholder: 'retraites-2-NEW1', approachId: 'retraites-2-f', text }])
    expect(out.decisions.addApproaches.at(-1)).toEqual({ questionId: 'retraites-2', id: 'retraites-2-f', text })
    expect(entryOf(out, 'attal', 'retraites-2-f')).toMatchObject({ weight: 2, historyCause: 'prise-de-position' })
    expect(out.decisions.positions.some((e: Json) => /NEW/.test(e.approachId))).toBe(false)
    expect(out.ledger.approaches).toEqual([{ questionId: 'retraites-2', approachId: 'retraites-2-f', addedAt: TODAY, runId: RUN }])
    expect(out.report.bundles['approche:retraites-2'].length).toBe(2)
    expect(out.report.published.map((p: Json) => p.class)).toEqual(['nouvelle-approche', 'nouvelle-approche', 'principale'])
    // Rejouée : déjà publiée, aucune lettre de plus
    const again = run(changeset({ attal: bundle() }), { decisions: out.decisions, ledger: out.ledger })
    expect(again.report.published).toEqual([])
    expect(again.decisions.addApproaches).toEqual(out.decisions.addApproaches)
  })

  it('les autres candidats recodés sur l’approche ajoutée (cause « nouvelle-approche »)', () => {
    const lisnard = set('lisnard', 'retraites-2-NEW1', pos(1), { before: null, cause: 'nouvelle-approche', statedAt: null })
    const cs = changeset({ attal: bundle() })
    cs.results[0].candidates.push({ candidateId: 'lisnard', since: SINCE, triageCompleted: true, searches: 8, findings: 1, changes: [lisnard] })
    const out = run(cs)
    expect(entryOf(out, 'lisnard', 'retraites-2-f')).toMatchObject({ weight: 1, historyCause: 'nouvelle-approche' })
    expect('statedAt' in entryOf(out, 'lisnard', 'retraites-2-f')).toBe(false)
  })

  it('un terme interdit fait tomber l’approche et tout son paquet ; un délai de 30 jours la retient', () => {
    const bad = bundle()
    bad[0] = { ...bad[0], proposedApproachText: 'Faire comme le Rassemblement national sur la capitalisation des retraites' }
    const out = run(changeset({ attal: bad }))
    expect(out.report.published).toEqual([])
    expect(reasons(out, 'dropped')).toEqual(['attal:retraites-2-NEW1:terme-interdit', 'attal:retraites-2-NEW1:paquet-lié', 'attal:retraites-2-c:paquet-lié'])
    // europe-3-f est entrée le 14 octobre (positions-history.json) : pas de nouvelle approche sur europe-3 avant 30 jours
    const late = run(changeset({ attal: bundle('attal', 1, 'europe-3').slice(0, 2) }))
    expect(reasons(late, 'held')).toEqual(['attal:europe-3-NEW1:approche-délai', 'attal:europe-3-NEW1:paquet-lié'])
    // Une approche du registre il y a 10 jours, de même
    const ledger = { format: 'isoloir-veille-ledger/1', claims: {}, approaches: [{ questionId: 'retraites-2', approachId: 'retraites-2-f', addedAt: '2026-10-09', runId: '2026-10-09-hebdo' }], questions: [] }
    expect(reasons(run(changeset({ attal: bundle() }), { ledger }), 'held')[0]).toBe('attal:retraites-2-NEW1:approche-délai')
  })

  it('au plus 9 approches, et au plus 2 approches ajoutées par exécution', () => {
    // sante-1 a déjà 9 approches
    expect(reasons(run(changeset({ attal: bundle('attal', 1, 'sante-1').slice(0, 2) })), 'held')[0]).toBe('attal:sante-1-NEW1:approches-max')
    const three = [...bundle('attal', 1, 'retraites-2', 'c'), ...bundle('attal', 1, 'retraites-3', 'c'), ...bundle('attal', 1, 'fiscalite-1', 'e')]
    const out = run(changeset({ attal: three }))
    expect(out.report.approaches.map((a: Json) => a.approachId)).toEqual(['retraites-2-f', 'retraites-3-e'])
    expect(reasons(out, 'held')).toEqual(['attal:fiscalite-1-NEW1:plafond-approches', 'attal:fiscalite-1-NEW1:paquet-lié', 'attal:fiscalite-1-e:paquet-lié'])
  })

  it('une approche dont aucune position n’est publiée n’entre pas', () => {
    const lonely = [addApproach('attal', 'retraites-2', 1, text), set('attal', 'retraites-2-NEW1', pos(2, { confidence: 'low' }), { before: null })]
    const out = run(changeset({ attal: lonely }))
    expect(out.report.approaches).toEqual([])
    expect(out.decisions.addApproaches).toEqual(decisions.addApproaches)
    expect(reasons(out, 'dropped')).toEqual(['attal:retraites-2-NEW1:paquet-lié', 'attal:retraites-2-NEW1:confiance-basse'])
  })
})

describe('applyChangeset : nouvelle question, état', () => {
  const subject = (cands: [string, string][]) => ({
    topicId: 'sante', subject: 'Déserts médicaux et installation des médecins', proposal: 'Réguler l’installation des médecins ?',
    candidates: cands.map(([candidateId, confidence]) => ({ candidateId, summary: 'Position fictive.', sources: [src(1)], confidence })),
    rationale: 'Sujet absent de la banque.',
  })
  it('au moins deux candidats sourcés de deux blocs, un thème existant, la banque sous son plafond', () => {
    const ok = run(changeset({ attal: [] }, {}, { newQuestionSubjects: [subject([['attal', 'high'], ['melenchon', 'medium'], ['faure', 'high']])] }))
    expect(ok.report.newQuestion).toEqual({ topicId: 'sante', subject: 'Déserts médicaux et installation des médecins', proposal: 'Réguler l’installation des médecins ?', candidates: ['attal', 'melenchon'], blocs: ['centre', 'extreme-gauche'] })
    const oneBloc = run(changeset({ attal: [] }, {}, { newQuestionSubjects: [subject([['attal', 'high'], ['philippe', 'high'], ['melenchon', 'low']])] }))
    expect(oneBloc.report.newQuestion).toBeNull()
    expect(oneBloc.report.newQuestionRejected[0].reason).toMatch(/1 bloc/)
    const full = run(changeset({ attal: [] }, {}, { newQuestionSubjects: [subject([['attal', 'high'], ['melenchon', 'high']])] }), { policy: { caps: { bankMax: 100 } } })
    expect(full.report.newQuestionRejected[0].reason).toMatch(/banque pleine/)
    const badTopic = run(changeset({ attal: [] }, {}, { newQuestionSubjects: [{ ...subject([['attal', 'high'], ['melenchon', 'high']]), topicId: 'astronomie' }] }))
    expect(badTopic.report.newQuestionRejected[0].reason).toMatch(/thème/)
  })

  it('checkedAt avance seulement pour les candidats dont le tri est allé au bout (fonctions de lib/state.mjs)', () => {
    const calls: Json[] = []
    const stateOps = {
      advanceCheckedAt: (s: Json, ids: string[], today: string, runId: string) => { calls.push({ ids, today, runId }); return { ...s, advanced: ids } },
      rotationFor: () => ({ questions: [], nextCursor: 7 }),
      advanceRotation: (s: Json, used: Json) => ({ ...s, used }),
      mergeWatch: (s: Json) => s,
      mergeRefused: (s: Json) => s,
    }
    const cs = changeset({ attal: [], lisnard: [] })
    cs.results[0].candidates[1].triageCompleted = false
    const out = applyChangeset({ changeset: cs, bankJson, decisions, config, election, candidates, history, policy: {}, locks: LOCKS0, ledger: null, state: { candidates: {}, lastRuns: {} }, pending: [], localWatch: [], today: TODAY, stateOps })
    expect(out.report.checked).toEqual(['attal'])
    expect(calls).toEqual([{ ids: ['attal'], today: TODAY, runId: RUN }])
    expect(out.state).toMatchObject({ advanced: ['attal'], used: { attal: 7 }, lastRuns: { hebdo: { runId: RUN, at: TODAY } } })
    // Un candidat dont le paquet est retenu par l'orchestrateur n'avance pas ; l'accord d'un retenu ne relit personne
    const held = applyChangeset({ changeset: { ...cs, holds: ['candidat:attal'] }, bankJson, decisions, config, election, candidates, history, policy: {}, locks: LOCKS0, ledger: null, state: { candidates: {}, lastRuns: {} }, pending: [], localWatch: [], today: TODAY, stateOps })
    expect(held.report.checked).toEqual([])
    const accord = applyChangeset({ changeset: { ...cs, runId: 'accord-h-2026-10-19-1-2026-10-20', only: ['H-2026-10-19-1'] }, bankJson, decisions, config, election, candidates, history, policy: {}, locks: LOCKS0, ledger: null, state: { candidates: {}, lastRuns: {} }, pending: [], localWatch: [], today: TODAY, stateOps })
    expect(accord.report.checked).toEqual([])
    expect(accord.state!.lastRuns.accord).toEqual({ runId: 'accord-h-2026-10-19-1-2026-10-20', at: TODAY, dataVersion: null })
  })

  it('buildNote : AVANT, APRÈS, cause et vérification en une seule chaîne', () => {
    const note = buildNote({ change: { ...set('attal', 'retraites-2-c', pos(1)), verifier: { verdict: 'adjusted', notes: 'Poids ramené à 1.' } }, published: pub('attal', 'retraites-2-c'), today: TODAY, runId: RUN, claimKey: 'a'.repeat(40) })
    expect(note).not.toMatch(/\n/)
    expect(note).toMatch(/AVANT \(publié jusqu’au 19 octobre 2026\) : principale « .+ » \(confiance haute ; sources : .+\)\. APRÈS : compatible « Résumé fictif/)
    expect(note).toContain('Vérification : ajustée — Poids ramené à 1.')
  })
})

describe('acceptQuestion (apply.mjs --question)', () => {
  const visible = config.candidates.filter((c: Json) => !c.pendingPrimary && !(election.hidden ?? []).includes(c.id)).map((c: Json) => c.id)
  function merged(over: Json = {}, positions?: Json[]): Json {
    const id = 'sante-x9'
    const approaches = ['a', 'b', 'c', 'd', 'e'].map((l, i) => ({ id: `${id}-${l}`, text: `Approche fictive numéro ${i + 1} sur la question`, external: false }))
    // Douze candidats présentés, trois approches principales, aucune ne dépasse 60 %
    const ps = positions ?? visible.slice(0, 12).map((cid: string, i: number) => ({ candidate: cid, approachId: approaches[i % 3]!.id, weight: 2, rejects: false, nature: 'proposition', confidence: 'high', summary: 'Position fictive.', sources: [src(i)], verdict: 'confirmed' }))
    return {
      result: {
        drafts: [{ group: 'expansion', topics: [], questions: [{ id, topicId: 'sante', tier: 'approfondi', prompt: 'Faut-il réguler l’installation des médecins ?', context: 'Contexte fictif.', approaches, positions: ps, ...over }], consensus: [], dropped: [] }],
        neutrality: { edits: [] },
        gapFills: [],
      },
    }
  }
  const build = readJ(join(D, 'build.json'))
  const accept = (m: Json, o: Json = {}) => acceptQuestion({ merged: m, mergedPath: 'research/presidentielle-2027/expansion-merged-3.json', bankJson, config, election, candidates, policy: o.policy ?? {}, build, transferText, fixture, ledger: null, history, today: TODAY, runId: RUN })

  it('acceptée : numéro suivant (100), même paire dans transfer.ts et la fixture, extension en fin de build.json', () => {
    const r = accept(merged())
    expect(r.reasons).toEqual([])
    expect(r).toMatchObject({ accepted: true, questionId: 'sante-x9', slot: 100 })
    expect(r.fixture!.questions['sante-x9']).toBe(100)
    expect(transferSlotsOf(r.transferText!)!.at(-1)).toEqual(['sante-x9', 100])
    expect(r.build!.expansions.at(-1)).toBe('research/presidentielle-2027/expansion-merged-3.json')
    expect(r.ledger!.questions).toEqual([{ questionId: 'sante-x9', addedAt: TODAY, runId: RUN, transferSlot: 100 }])
    expect(validate(SCHEMAS.BUILD_CONFIG, r.build)).toEqual([])
  })

  it('refusée, avec sa raison, pour chaque condition du contrat', () => {
    const two = merged()
    two.result.drafts[0].questions.push({ ...two.result.drafts[0].questions[0], id: 'sante-x10' })
    const cases: [Json, RegExp, Json?][] = [
      [two, /une seule question neuve/],
      [merged({ tier: 'essentiel' }), /tier/],
      [merged({ approaches: merged().result.drafts[0].questions[0].approaches.slice(0, 3) }), /3 approches/],
      [merged({ id: 'sante-1' }), /une seule question neuve/],
      [merged({ id: 'sante-9' }), /<thème>-x<n>/],
      [merged({}, merged().result.drafts[0].questions[0].positions.slice(0, 6)), /6 candidats présentés connus/],
      [merged({}, merged().result.drafts[0].questions[0].positions.map((p: Json) => ({ ...p, approachId: 'sante-x9-a' }))), /approche\(s\) principale\(s\) distincte|au plus 60/],
      [merged({ prompt: 'Faut-il faire comme le Rassemblement national ?' }), /terme interdit/],
      [{ result: { ...merged().result, gapFills: [{ questionId: 'retraites-1' }] } }, /gapFills/],
      [{ result: { ...merged().result, neutrality: { edits: [{ id: 'retraites-1-a', field: 'text', newText: 'x' }] } } }, /hors de la question neuve/],
      [merged(), /banque pleine/, { policy: { caps: { bankMax: 100 } } }],
      [merged({}, merged().result.drafts[0].questions[0].positions.map((p: Json, i: number) => (i === 0 ? { ...p, summary: 'Comme Olivier Faure, il veut réguler l’installation.' } : p))), /résumé de .+ nom d’un candidat masqué/],
    ]
    for (const [m, re, o] of cases) {
      const r = accept(m, o)
      expect(r.accepted, String(re)).toBe(false)
      expect(r.reasons.join(' | '), String(re)).toMatch(re)
    }
    // Un identifiant qui a déjà un numéro (question retirée de la banque) n'est jamais repris
    const r = acceptQuestion({ merged: merged(), mergedPath: 'research/presidentielle-2027/expansion-merged-3.json', bankJson, config, election, candidates, policy: {}, build, transferText: addTransferSlot(transferText, 'sante-x9', 100), fixture, ledger: null, history, today: TODAY, runId: RUN })
    expect(r.reasons.join(' | ')).toMatch(/déjà un numéro/)
  })
})

describe('applyChangeset : l’état complet d’une (candidat, question) se publie d’un bloc', () => {
  const text = 'Ouvrir à chaque salarié un compte de retraite par capitalisation géré par sa branche professionnelle'
  const medium = (aid: string) => set('attal', aid, pos(2, { confidence: 'medium' }), { blindRecode: agree(aid) })

  it('la nouvelle principale retenue : l’ancienne n’est ni retirée ni rétrogradée (paquet-lié)', () => {
    const out = run(changeset({ attal: [medium('retraites-2-b'), remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b') })] }))
    expect(out.report.published).toEqual([])
    expect(reasons(out, 'held')).toEqual(['attal:retraites-2-b:preuve-insuffisante', 'attal:retraites-2-c:paquet-lié'])
    // Même chose quand la nouvelle est réfutée : la principale publiée reste en ligne
    const refuted = set('attal', 'retraites-2-b', pos(2), { blindRecode: agree('retraites-2-b'), verifier: { verdict: 'refuted', notes: 'Non.' } })
    const r = run(changeset({ attal: [refuted, remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b') })] }))
    expect(reasons(r, 'dropped')).toEqual(['attal:retraites-2-b:réfutée'])
    expect(reasons(r, 'held')).toEqual(['attal:retraites-2-c:paquet-lié'])
    // Un écart sans conséquence (sans-effet) ou de forme ne retient pas le reste
    const kept = run(changeset({ attal: [set('attal', 'retraites-2-c', pub('attal', 'retraites-2-c')), set('attal', 'retraites-2-d', pos(1))] }))
    expect(kept.report.published.map((p: Json) => p.approachId)).toEqual(['retraites-2-d'])
  })

  it('une approche nouvelle : la position du proposant écartée retient la rétrogradation de son ancienne principale', () => {
    const add = addApproach('attal', 'retraites-2', 1, text)
    const low = set('attal', 'retraites-2-NEW1', pos(2, { confidence: 'low' }), { before: null })
    const demote = set('attal', 'retraites-2-c', { ...FIXED_MAIN, weight: 1, sources: [...FIXED_SOURCES, src(4)] }, { cause: 'nouvelle-approche', statedAt: null, blindRecode: agree('retraites-2-NEW1') })
    const lisnard = set('lisnard', 'retraites-2-NEW1', pos(1), { before: null, cause: 'nouvelle-approche', statedAt: null })
    const cs = changeset({ attal: [add, low, demote], lisnard: [lisnard] })
    const out = run(cs)
    expect(reasons(out, 'dropped')).toEqual(['attal:retraites-2-NEW1:confiance-basse'])
    expect(reasons(out, 'held')).toEqual(['attal:retraites-2-c:paquet-lié'])
    expect(entryOf(out, 'attal', 'retraites-2-c')).toBeUndefined()
    // Paquet « approche:<q> » retenu par l'orchestrateur : la rétrogradation, hors du paquet, est retenue avec lui
    const held = run(changeset({ attal: [add, set('attal', 'retraites-2-NEW1', pos(2), { before: null, blindRecode: agree('retraites-2-NEW1') }), demote] }), { holds: ['approche:retraites-2'] })
    expect(held.report.published).toEqual([])
    expect(reasons(held, 'held').sort()).toEqual(['attal:retraites-2-NEW1:retenu-par-le-run', 'attal:retraites-2-NEW1:retenu-par-le-run', 'attal:retraites-2-c:paquet-lié'])
  })

  it('« OK » sur un seul changement d’un groupe retenu : l’accord vaut pour toute la question', () => {
    const b = medium('retraites-2-b')
    const c = remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-b') })
    const first = run(changeset({ attal: [b, c] }))
    const linked = first.report.held.find((h: Json) => h.reason === 'paquet-lié').id
    const only = run(changeset({ attal: [b, c] }), { ledger: first.ledger, pending: first.pending, only: [linked] })
    expect(only.report.published.map((p: Json) => p.approachId).sort()).toEqual(['retraites-2-b', 'retraites-2-c'])
    const approved = run(changeset({ attal: [b, c] }), { ledger: first.ledger, pending: first.pending, approve: [linked] })
    expect(approved.report.published.map((p: Json) => p.approachId).sort()).toEqual(['retraites-2-b', 'retraites-2-c'])
  })

  it('une approche déjà en ligne (accord après le BUILD) : la position retenue s’y pose sous sa lettre', () => {
    const add = addApproach('attal', 'retraites-2', 1, text)
    const mine = set('attal', 'retraites-2-NEW1', pos(2), { before: null, blindRecode: agree('retraites-2-NEW1') })
    const demote = remove('attal', 'retraites-2-c', { blindRecode: agree('retraites-2-NEW1') })
    const lisnard = set('lisnard', 'retraites-2-NEW1', pos(1), { before: null, cause: 'nouvelle-approche', statedAt: null })
    const cs = changeset({ attal: [add, mine, demote], lisnard: [lisnard] })
    const r1 = run(cs, { holds: ['candidat:lisnard'] })
    expect(r1.report.approaches.map((a: Json) => a.approachId)).toEqual(['retraites-2-f'])
    const hold = r1.report.held.find((h: Json) => h.change.candidateId === 'lisnard').id
    // Le BUILD : f entre dans la banque, avec la position d'Attal ; c n'est plus publiée
    const built = structuredClone(bankJson)
    built.bank.questions.find((q: Json) => q.id === 'retraites-2').approaches.push({ id: 'retraites-2-f', text })
    built.positions.attal['retraites-2-f'] = publishedForm(mine.after)
    delete built.positions.attal['retraites-2-c']
    for (const o of [{ only: [hold] }, { approve: [hold] }]) {
      const r2 = run(cs, { bankJson: built, decisions: r1.decisions, ledger: r1.ledger, pending: r1.pending, ...o })
      expect(r2.report.published.map((p: Json) => `${p.candidateId}:${p.approachId}`), JSON.stringify(o)).toEqual(['lisnard:retraites-2-f'])
      expect(entryOf(r2, 'lisnard', 'retraites-2-f')).toMatchObject({ weight: 1, historyCause: 'nouvelle-approche' })
      expect(r2.decisions.addApproaches).toEqual(r1.decisions.addApproaches)
      expect(r2.ledger.approaches).toEqual(r1.ledger.approaches)
    }
  })

  it('checkedAt n’avance pas quand le budget a coupé le codage (budgetCut), même tri complet', () => {
    const cs = changeset({ attal: [], lisnard: [] })
    cs.results[0].candidates[1].budgetCut = true
    const out = applyChangeset({ changeset: cs, bankJson, decisions, config, election, candidates, history, policy: {}, locks: LOCKS0, ledger: null, state: stateLib.seedState(visibleIds), pending: [], localWatch: [], today: TODAY, stateOps })
    expect(out.report.checked).toEqual(['attal'])
    expect(out.state!.candidates.attal.checkedAt).toBe(TODAY)
    expect(out.state!.candidates.lisnard.checkedAt).toBe('2026-10-09')
  })

  it('un candidat présenté absent de state.json y entre à sa date d’entrée ou de déclaration, jamais à today sans relevé', () => {
    const state = stateLib.seedState(visibleIds.filter(id => id !== 'polony'))
    const out = applyChangeset({ changeset: changeset({ attal: [] }), bankJson, decisions, config, election, candidates, history, policy: {}, locks: LOCKS0, ledger: null, state, pending: [], localWatch: [], today: TODAY, stateOps })
    expect(out.report.seeded).toEqual(['polony'])
    expect(out.state!.candidates.polony).toEqual({ checkedAt: '2026-10-14', rotationCursor: 0, lastRunId: null, programmeSeen: null })
    expect(validate(SCHEMAS.STATE, out.state)).toEqual([])
  })
})

describe('apply.mjs, ligne de commande (copie temporaire des données)', () => {
  let tmp: string | null = null
  afterEach(() => {
    if (tmp) rmSync(tmp, { recursive: true, force: true })
    tmp = null
  })
  function sandbox(): string {
    tmp = mkdtempSync(join(tmpdir(), 'isoloir-apply-'))
    cpSync(D, join(tmp, 'research/presidentielle-2027'), { recursive: true, filter: f => !/\/(groups|spectrum-notes|video-corrections|add-candidate)(\/|$)/.test(f) })
    cpSync(S, join(tmp, 'src/elections/presidentielle-2027'), { recursive: true, filter: f => !/\/media(\/|$)/.test(f) })
    mkdirSync(join(tmp, 'tests/fixtures'), { recursive: true })
    cpSync(join(REPO_ROOT, 'tests/fixtures/transfer-slots-presidentielle-2027.json'), join(tmp, 'tests/fixtures/transfer-slots-presidentielle-2027.json'))
    mkdirSync(join(tmp, 'local'), { recursive: true })
    // Données figées et graines du contrat (l'état réel avance à chaque publication)
    const R = join(tmp, 'research/presidentielle-2027')
    writeFileSync(join(R, 'bank.json'), JSON.stringify(bankJson))
    writeFileSync(join(R, 'decisions.json'), frozenDecisionsText)
    writeFileSync(join(R, 'positions-history.json'), JSON.stringify(history))
    writeFileSync(join(R, 'veille/state.json'), JSON.stringify(stateLib.seedState(visibleIds)))
    writeFileSync(join(R, 'veille/policy.json'), JSON.stringify(DEFAULT_POLICY))
    writeFileSync(join(R, 'veille/locks.json'), JSON.stringify(LOCKS0))
    rmSync(join(R, 'veille/ledger.json'), { force: true })
    return tmp
  }
  const cli = (root: string, args: string[]) => {
    try {
      const out = execFileSync(process.execPath, [join(REPO_ROOT, 'tools/veille/apply.mjs'), ...args, '--root', root], {
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ISOLOIR_VEILLE_LOCAL: join(root, 'local'), ISOLOIR_VEILLE_NO_RECORD: '1' },
      })
      return { code: 0, json: JSON.parse(out.trim().split('\n').at(-1)!) }
    } catch (err) {
      const e = err as { status: number; stdout: unknown; stderr?: unknown; code?: number }
      return { code: e.status as number, json: JSON.parse(String(e.stdout).trim().split('\n').at(-1) || '{}') }
    }
  }

  it('--question : écrit transfer.ts, la fixture, build.json et le registre ; refuse ensuite le même identifiant', () => {
    const root = sandbox()
    const id = 'sante-x9'
    const approaches = ['a', 'b', 'c', 'd'].map((l, i) => ({ id: `${id}-${l}`, text: `Approche fictive numéro ${i + 1}`, external: false }))
    const visible = config.candidates.filter((c: Json) => !c.pendingPrimary && !(election.hidden ?? []).includes(c.id)).map((c: Json) => c.id)
    const positions = visible.slice(0, 12).map((cid: string, i: number) => ({ candidate: cid, approachId: approaches[i % 3]!.id, weight: 2, rejects: false, nature: 'proposition', confidence: 'high', summary: 'Position fictive.', sources: [src(i)], verdict: 'confirmed' }))
    const file = join(root, 'research/presidentielle-2027/expansion-merged-3.json')
    writeFileSync(file, JSON.stringify({ result: { drafts: [{ group: 'expansion', topics: [], questions: [{ id, topicId: 'sante', tier: 'approfondi', prompt: 'Question fictive ?', approaches, positions }], consensus: [], dropped: [] }], neutrality: { edits: [] }, gapFills: [] } }))
    const dry = cli(root, ['--question', file, '--dry-run'])
    expect(dry.code).toBe(0)
    expect(dry.json).toMatchObject({ accepted: true, questionId: id, slot: 100, files: [] })
    expect(readFileSync(join(root, 'src/elections/presidentielle-2027/transfer.ts'), 'utf8')).toBe(transferText)
    const r = cli(root, ['--question', file])
    expect(r.json).toMatchObject({ accepted: true, slot: 100 })
    expect(r.json.files.sort()).toEqual(['research/presidentielle-2027/build.json', 'research/presidentielle-2027/veille/ledger.json', 'src/elections/presidentielle-2027/transfer.ts', 'tests/fixtures/transfer-slots-presidentielle-2027.json'])
    expect(readFileSync(join(root, 'src/elections/presidentielle-2027/transfer.ts'), 'utf8')).toBe(addTransferSlot(transferText, id, 100))
    expect(readJ(join(root, 'tests/fixtures/transfer-slots-presidentielle-2027.json')).questions[id]).toBe(100)
    expect(readJ(join(root, 'research/presidentielle-2027/build.json')).expansions.at(-1)).toBe('research/presidentielle-2027/expansion-merged-3.json')
    const again = cli(root, ['--question', file])
    expect(again.code).toBe(0)
    expect(again.json.accepted).toBe(false)
    expect(again.json.reasons.join(' ')).toMatch(/déjà un numéro/)
  })

  it('codes : changeset illisible ou non conforme 30, option inconnue ou --reset-revisions 2', () => {
    const root = sandbox()
    writeFileSync(join(root, 'cs.json'), '{ pas du json')
    expect(cli(root, [join(root, 'cs.json')]).code).toBe(30)
    writeFileSync(join(root, 'cs.json'), JSON.stringify({ format: 'autre' }))
    expect(cli(root, [join(root, 'cs.json')]).code).toBe(30)
    expect(cli(root, [join(root, 'cs.json'), '--bizarre']).code).toBe(2)
    expect(cli(root, [join(root, 'cs.json'), '--reset-revisions']).code).toBe(2)
    expect(cli(root, ['--question', join(root, 'absent.json')]).code).toBe(30)
  })

  it('forme 1 : écrit decisions.json, le registre et l’état ; --dry-run n’écrit rien ; rejouée, rien ne change', () => {
    const root = sandbox()
    const cs = changeset({ attal: [set('attal', 'retraites-2-d', pos(1)), set('attal', 'fiscalite-1-a', pos(2))] })
    const file = join(root, 'changeset.json')
    writeFileSync(file, JSON.stringify(cs))
    const dec = join(root, 'research/presidentielle-2027/decisions.json')
    const dry = cli(root, [file, '--dry-run'])
    expect(dry.code).toBe(0)
    expect(dry.json).toMatchObject({ dryRun: true, files: [] })
    expect(readFileSync(dec, 'utf8')).toBe(frozenDecisionsText)
    expect(existsSync(join(root, 'local/pending.json'))).toBe(false)
    const r = cli(root, [file])
    expect(r.code).toBe(0)
    expect(r.json.published.map((p: Json) => p.approachId)).toEqual(['retraites-2-d'])
    expect(r.json.held.map((h: Json) => h.reason)).toEqual(['recodage-absent'])
    expect(r.json.files).toContain('research/presidentielle-2027/decisions.json')
    const after = readFileSync(dec, 'utf8')
    expect(after.endsWith('\n')).toBe(decisionsText.endsWith('\n'))
    expect(JSON.parse(after).positions.length).toBe(decisions.positions.length + 1)
    expect(readJ(join(root, 'local/pending.json')).items.map((p: Json) => p.id)).toEqual(['H-2026-10-19-1'])
    expect(existsSync(join(root, `research/presidentielle-2027/veille/runs/${RUN}/apply-report.json`))).toBe(true)
    expect(existsSync(join(root, `local/runs/${RUN}/apply-report.json`))).toBe(true)
    // checkedAt avancé pour le seul candidat relu, dans state.json (fonctions de lib/state.mjs)
    const state = readJ(join(root, 'research/presidentielle-2027/veille/state.json'))
    expect(state.candidates.attal).toMatchObject({ checkedAt: TODAY, lastRunId: RUN })
    expect(state.candidates.lisnard.checkedAt).not.toBe(TODAY)
    expect(state.lastRuns.hebdo).toEqual({ runId: RUN, at: TODAY, dataVersion: null })
    expect(validate(SCHEMAS.STATE, state)).toEqual([])
    const ledger = readFileSync(join(root, 'research/presidentielle-2027/veille/ledger.json'), 'utf8')
    const again = cli(root, [file])
    expect(again.json.published).toEqual([])
    expect(readFileSync(dec, 'utf8')).toBe(after)
    expect(readFileSync(join(root, 'research/presidentielle-2027/veille/ledger.json'), 'utf8')).toBe(ledger)
  })
})
