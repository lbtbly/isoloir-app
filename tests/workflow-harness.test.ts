// Banc d'essai des workflows (tests/helpers/workflow-harness.ts) : il exécute un vrai script de tools/workflows/ avec des
// agents simulés et capte chaque appel, avec les règles de l'outil Workflow (meta pur, parallel et pipeline, horloge et
// hasard interdits). Contrat de la veille : tools/veille/CONTRACT.md, §e et §f.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { REPO_ROOT, runWorkflow, splitWorkflow } from './helpers/workflow-harness'

const config = JSON.parse(readFileSync(join(REPO_ROOT, 'research/presidentielle-2027/config.json'), 'utf8'))
const FACTS = { calendar: 'Premier tour le 18 avril 2027, second tour le 2 mai 2027.', declared: [], changes_vs_config: [] }

const dirs: string[] = []
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})
/** Écrit un workflow d'essai dans un dossier temporaire et rend son chemin */
function scratch(source: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'isoloir-harness-'))
  dirs.push(dir)
  const file = join(dir, 'essai.js')
  writeFileSync(file, source)
  return file
}
const META = `export const meta = { name: 'essai', description: 'Essai du banc', phases: [{ title: 'Un' }, { title: 'Deux' }] }\n`

describe('1-research.js, sans dossier ni clivage (only: ["-"], skipCleavages)', () => {
  it('ne lance que la vérification des faits, et capte son appel', async () => {
    const run = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: { 'facts-check': FACTS },
    })
    expect(run.meta.name).toBe('isoloir-research')
    expect(run.meta.phases?.map(p => p.title)).toEqual(['Research'])
    expect(run.phases).toEqual(['Research'])
    expect(run.phasesMissingFromMeta).toEqual([])
    expect(run.calls).toHaveLength(1)
    const [call] = run.calls
    expect(call).toMatchObject({ index: 0, label: 'facts-check', phase: 'Research', matchedBy: 'facts-check', missing: false, schemaErrors: [], error: null })
    expect(call!.opts.schema).toBeTypeOf('object')
    expect(call!.prompt).toContain('TA MISSION : vérifier les faits de base à la date du jour')
    expect(call!.prompt).toContain('Contexte (date du jour : 2026-10-17)')
    expect(call!.prompt).toContain('IsoloirBot/1.0')
    expect(call!.response).toEqual(FACTS)
    expect(run.result).toEqual({ counts: { dossiers: 0, refresh: 0, cleavages: 0, done: 1 }, missing: [] })
    expect(run.logs).toEqual([])
  })

  it('un agent mort (null) ne compte pas', async () => {
    const run = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: { 'facts-check': null },
    })
    expect(run.result).toMatchObject({ counts: { done: 0 } })
    expect(run.calls[0]!.response).toBeNull()
  })

  it('une réponse simulée non conforme au schéma de l’agent est signalée (et l’agent tombe à null dans parallel)', async () => {
    const run = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: { 'facts-check': { calendar: 'x' } },
    })
    expect(run.calls[0]!.schemaErrors.join(' ')).toContain('declared')
    expect(run.result).toMatchObject({ counts: { done: 0 } })
  })

  it('les réponses se cherchent par label, préfixe, phase puis « * »', async () => {
    const run = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: { 'phase:Research': FACTS },
    })
    expect(run.calls[0]!.matchedBy).toBe('phase:Research')
    const byStar = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: { '*': () => FACTS },
    })
    expect(byStar.calls[0]!.matchedBy).toBe('*')
  })

  it('sans réponse prévue : l’appel est marqué missing', async () => {
    const run = await runWorkflow('tools/workflows/1-research.js', {
      args: { ...config, contextDate: '2026-10-17', only: ['-'], skipCleavages: true },
      responders: {},
    })
    expect(run.calls[0]!.missing).toBe(true)
    expect(run.result).toMatchObject({ counts: { done: 0 } })
  })
})

describe('règles de l’outil Workflow', () => {
  it('pipeline : (précédent, élément, indice) ; une étape qui lève donne null et saute la suite', async () => {
    const file = scratch(`${META}
phase('Un')
const seen = []
const out = await pipeline([1, 2, 3],
  (x, item, i) => { seen.push(['a', x, item, i]); if (item === 2) throw new Error('non'); return x * 10 },
  (x, item, i) => { seen.push(['b', x, item, i]); return x + item })
return { out, seen }`)
    const run = await runWorkflow(file)
    const r = run.result as { out: unknown[]; seen: unknown[][] }
    expect(r.out).toEqual([11, null, 33])
    expect(r.seen.filter(s => s[0] === 'b').map(s => s[2])).toEqual([1, 3])
    expect(r.seen.find(s => s[0] === 'a' && s[2] === 3)).toEqual(['a', 3, 3, 2])
  })

  it('parallel : barrière, un thunk qui lève donne null', async () => {
    const file = scratch(`${META}
const r = await parallel([() => agent('p', { label: 'x:1' }), () => { throw new Error('non') }, async () => 3])
return r`)
    const run = await runWorkflow(file, { responders: { x: 'ok' } })
    expect(run.result).toEqual(['ok', null, 3])
    expect(run.calls[0]).toMatchObject({ label: 'x:1', matchedBy: 'x', phase: null })
  })

  it('horloge et hasard interdits ; new Date(valeur) permis', async () => {
    await expect(runWorkflow(scratch(`${META}return Date.now()`))).rejects.toThrow(/Date\.now\(\) est interdit/)
    await expect(runWorkflow(scratch(`${META}return new Date()`))).rejects.toThrow(/new Date\(\) sans argument/)
    await expect(runWorkflow(scratch(`${META}return Math.random()`))).rejects.toThrow(/Math\.random\(\) est interdit/)
    const ok = await runWorkflow(scratch(`${META}return [new Date(args.today + 'T12:00:00Z').toISOString().slice(0, 10), Math.max(1, 2)]`), { args: { today: '2026-10-19' } })
    expect(ok.result).toEqual(['2026-10-19', 2])
  })

  it('meta doit être un objet littéral pur, en tête du script', () => {
    expect(() => splitWorkflow(`const x = 1\n${META}`)).toThrow(/doit commencer/)
    expect(() => splitWorkflow(`export const meta = { name: NAME, description: 'd' }\nreturn 1`)).toThrow(/pur/)
    expect(() => splitWorkflow('export const meta = { name: `a${1}`, description: \'d\' }\nreturn 1')).toThrow(/gabarit/)
    expect(() => splitWorkflow(`export const meta = { name: 'a' }\nreturn 1`)).toThrow(/description/)
    const { meta, body } = splitWorkflow(`export const meta = { name: 'a', description: 'avec } et { dans le texte' } // fin\nreturn 1`)
    expect(meta.description).toBe('avec } et { dans le texte')
    expect(body.trim()).toBe('// fin\nreturn 1')
  })

  it('phase() hors de meta.phases est relevée ; log() et workflow() sont captés', async () => {
    const file = scratch(`${META}
phase('Un'); phase('Trois'); log('bonjour')
let sub = null
try { sub = await workflow({ scriptPath: '/x/5-candidates.js' }, { only: ['a'] }) } catch (e) { sub = 'absent' }
return sub`)
    const run = await runWorkflow(file)
    expect(run.phases).toEqual(['Un', 'Trois'])
    expect(run.phasesMissingFromMeta).toEqual(['Trois'])
    expect(run.logs).toEqual(['bonjour'])
    expect(run.result).toBe('absent')
    expect(run.workflowCalls).toEqual([{ ref: { scriptPath: '/x/5-candidates.js' }, args: { only: ['a'] } }])
    const stubbed = await runWorkflow(file, { workflow: () => ({ candidates: [] }) })
    expect(stubbed.result).toEqual({ candidates: [] })
  })

  it('les réponses sont copiées : le workflow peut les modifier sans toucher au test', async () => {
    const shared = { n: 1 }
    const file = scratch(`${META}
const a = await agent('p', { label: 'r' }); a.n = 2
const b = await agent('p', { label: 'r' })
return [a.n, b.n]`)
    const run = await runWorkflow(file, { responders: { r: shared } })
    expect(run.result).toEqual([2, 1])
    expect(shared.n).toBe(1)
  })
})
