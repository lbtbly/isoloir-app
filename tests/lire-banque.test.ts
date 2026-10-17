// Lecture de la banque pour les agents (tools/lire-banque.mjs ; contrat de la veille, tools/veille/CONTRACT.md §d.1) :
// la commande remplace les deux « node -e » que 6-add-candidate donnait à ses agents et doit redonner exactement leur
// sortie sur la banque publiée ; les commandes que le workflow écrit dans ses prompts sont bien des appels à
// lire-banque ; candidat, question-all et unknown suivent les règles du site (latestSourceDate, stance et
// knownQuestions de src/core, candidats masqués) ; un appel mal formé sort en 2 ; rien n'est jamais écrit.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import type { ElectionPack, Position } from '../src/core/types'
import { latestSourceDate } from '../src/core/positionsHistory'
import { knownQuestions } from '../src/core/score'
import { election } from '../src/elections/presidentielle-2027/election'
import { REPO_ROOT, runWorkflow, type AgentCall } from './helpers/workflow-harness'

const ROOT = REPO_ROOT.replace(/\/+$/, '')
const SCRIPT = join(ROOT, 'tools', 'lire-banque.mjs')
const D = join(ROOT, 'research', 'presidentielle-2027')
const BANK = join(D, 'bank.json')

interface BankQuestion {
  id: string
  topicId: string
  tier: string
  step?: number
  prompt: string
  context?: string
  approaches: { id: string; text: string; external?: boolean }[]
}
interface BankFile {
  bank: { questions: BankQuestion[] }
  positions: Record<string, Record<string, Position>>
  prepared?: Record<string, Record<string, Position>>
}
interface ConfigCandidate {
  id: string
  name: string
  pendingPrimary?: boolean
}
const bank: BankFile = JSON.parse(readFileSync(BANK, 'utf8'))
const config: { id: string; candidates: ConfigCandidate[] } & Record<string, unknown> = JSON.parse(readFileSync(join(D, 'config.json'), 'utf8'))
const questionsOf = bank.bank.questions

// Les deux « node -e » de tools/workflows/6-add-candidate.js (showQuestions et PREFLIGHT_CMD) jusqu'au 17/10/2026,
// recopiés tels quels : la référence de ce que lire-banque doit redonner.
const OLD_SHOW = `const fs=require("fs");const [f,l]=process.argv.slice(1);const s=new Set(l.split(","));for(const q of JSON.parse(fs.readFileSync(f,"utf8")).bank.questions)if(s.has(q.id))console.log(JSON.stringify({id:q.id,topicId:q.topicId,tier:q.tier,step:q.step,prompt:q.prompt,context:q.context,approaches:q.approaches}))`
const OLD_PREFLIGHT = `const fs=require("fs");const [f,c,...files]=process.argv.slice(1);const o={problems:[],files:files.map(p=>({path:p,exists:fs.existsSync(p)}))};if(!fs.existsSync(f))o.problems.push("banque absente : "+f);else{const j=JSON.parse(fs.readFileSync(f,"utf8"));o.questions=j.bank.questions.map(q=>({id:q.id,topicId:q.topicId,tier:q.tier,step:q.step||0,approaches:q.approaches.map(a=>a.id),external:q.approaches.filter(a=>a.external).map(a=>a.id)}));o.candidatesInBank=[...Object.keys(j.positions),...Object.keys(j.prepared||{})];o.alreadyCoded=Object.keys(j.positions[c]||(j.prepared||{})[c]||{}).length}console.log(JSON.stringify(o))`

const scratchDirs: string[] = []
const scratch = (prefix = 'isoloir-lire-banque-') => {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  scratchDirs.push(dir)
  return dir
}
afterAll(() => {
  for (const d of scratchDirs) rmSync(d, { recursive: true, force: true })
})
const LOCAL = scratch('isoloir-lire-banque-local-')
const ENV = { ...process.env, ISOLOIR_VEILLE_LOCAL: LOCAL, ISOLOIR_VEILLE_NO_RECORD: '1' }

interface Out {
  code: number | null
  stdout: string
  stderr: string
}
const runNode = (args: string[], cwd = ROOT): Out => {
  const r = spawnSync(process.execPath, args, { cwd, env: ENV, encoding: 'utf8', maxBuffer: 1 << 28 })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}
const lire = (...args: string[]) => runNode([SCRIPT, ...args])
const old = (code: string, ...args: string[]) => runNode(['-e', code, ...args])
const shell = (command: string): Out => {
  const r = spawnSync('/bin/sh', ['-c', command], { cwd: ROOT, env: ENV, encoding: 'utf8', maxBuffer: 1 << 28 })
  return { code: r.status, stdout: r.stdout, stderr: r.stderr }
}
const lines = (out: Out) => out.stdout.split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, unknown>)

/** Un appel refusé : code 2, une seule ligne JSON sur stdout, la raison en français sur stderr */
function expectRefused(out: Out, reason: RegExp) {
  expect(out.code).toBe(2)
  const outLines = out.stdout.split('\n').filter(Boolean)
  expect(outLines).toHaveLength(1)
  const v = JSON.parse(outLines[0]!) as { script: string; code: number; ok: boolean; reason: string }
  expect(v).toMatchObject({ script: 'lire-banque', code: 2, ok: false })
  expect(v.reason).toMatch(reason)
  expect(out.stderr).toMatch(reason)
}

// Questions particulières de la banque : sans step, sans context, identifiant en « x »
const noStep = questionsOf.find(q => q.step === undefined)!
const noContext = questionsOf.find(q => q.context === undefined)!
const xQuestion = questionsOf.find(q => /-x\d+$/.test(q.id))!

describe('lire-banque redonne la sortie des anciens « node -e » de 6-add-candidate', () => {
  it('la banque publiée a les cas qui comptent (step absent, context absent, approche external)', () => {
    expect(noStep).toBeDefined()
    expect(noContext).toBeDefined()
    expect(xQuestion).toBeDefined()
    expect(questionsOf.some(q => q.approaches.some(a => a.external))).toBe(true)
  })

  it('questions : octet pour octet, dans l’ordre de la banque, quel que soit l’ordre demandé', () => {
    const ids = [xQuestion.id, noStep.id, questionsOf[0]!.id, noContext.id, questionsOf[0]!.id]
    const reference = old(OLD_SHOW, BANK, ids.join(','))
    expect(reference.code).toBe(0)
    const got = lire('questions', '--bank', BANK, ids.join(','))
    expect(got.code).toBe(0)
    expect(got.stdout).toBe(reference.stdout)
    // L'ordre est celui de la banque, chaque question une fois ; step et context omis quand ils manquent
    const order = lines(got).map(q => q.id)
    expect(order).toEqual(questionsOf.map(q => q.id).filter(id => ids.includes(id)))
    expect(lines(got).find(q => q.id === noStep.id)).not.toHaveProperty('step')
    expect(lines(got).find(q => q.id === noContext.id)).not.toHaveProperty('context')
    // Plusieurs arguments, ou la banque par défaut : même sortie
    expect(lire('questions', '--bank', BANK, ids.slice(0, 2).join(','), ...ids.slice(2)).stdout).toBe(reference.stdout)
    expect(lire('questions', ids.join(',')).stdout).toBe(reference.stdout)
  })

  it('questions : toute la banque d’un coup, octet pour octet', () => {
    const all = questionsOf.map(q => q.id).join(',')
    const got = lire('questions', '--bank', BANK, all)
    expect(got.stdout).toBe(old(OLD_SHOW, BANK, all).stdout)
    expect(lines(got)).toHaveLength(questionsOf.length)
  })

  it('preflight : même objet pour un candidat de la banque, un candidat nouveau et des fichiers présents ou absents', () => {
    const files = [join(D, 'dossier_polony.json'), join(D, 'reuse.json'), join(D, 'dossier_inexistant.json')]
    for (const cid of ['polony', 'faure', 'nouveau']) {
      const reference = old(OLD_PREFLIGHT, BANK, cid, ...files)
      expect(reference.code).toBe(0)
      const got = lire('preflight', cid, '--bank', BANK, '--files', ...files)
      expect(got.code).toBe(0)
      expect(got.stdout).toBe(reference.stdout)
    }
    // Les champs dont se sert le workflow
    const pre = lines(lire('preflight', 'polony', '--bank', BANK, '--files', ...files))[0] as {
      problems: string[]; files: { path: string; exists: boolean }[]; questions: { id: string; step: number; approaches: string[]; external: string[] }[]
      candidatesInBank: string[]; alreadyCoded: number
    }
    expect(pre.problems).toEqual([])
    expect(pre.files).toEqual([{ path: files[0], exists: true }, { path: files[1], exists: true }, { path: files[2], exists: false }])
    expect(pre.questions.map(q => q.id)).toEqual(questionsOf.map(q => q.id))
    expect(pre.questions.find(q => q.id === noStep.id)!.step).toBe(0)
    expect(pre.questions.flatMap(q => q.external)).toEqual(questionsOf.flatMap(q => q.approaches.filter(a => a.external).map(a => a.id)))
    expect(pre.candidatesInBank).toEqual(Object.keys(bank.positions))
    expect(pre.alreadyCoded).toBe(Object.keys(bank.positions.polony!).length)
    expect((lines(lire('preflight', 'nouveau', '--bank', BANK))[0] as { alreadyCoded: number }).alreadyCoded).toBe(0)
  })

  it('preflight : banque absente, problems le dit et la sortie reste 0, comme avant', () => {
    const missing = join(scratch(), 'bank.json')
    const reference = old(OLD_PREFLIGHT, missing, 'polony', BANK)
    const got = lire('preflight', 'polony', '--bank', missing, '--files', BANK)
    expect(got.code).toBe(0)
    expect(got.stdout).toBe(reference.stdout)
    expect(lines(got)[0]).toEqual({ problems: [`banque absente : ${missing}`], files: [{ path: BANK, exists: true }] })
  })

  it('preflight : --files garde un chemin avec une virgule, et --bank peut venir après', () => {
    const dir = scratch()
    const odd = join(dir, 'dossier, version 2.json')
    writeFileSync(odd, '{}')
    const got = lines(lire('preflight', 'polony', '--files', odd, join(dir, 'absent.json'), '--bank', BANK))[0] as { files: unknown[] }
    expect(got.files).toEqual([{ path: odd, exists: true }, { path: join(dir, 'absent.json'), exists: false }])
  })

  it('6-add-candidate ne donne plus de « node -e » à ses agents : ses commandes lire-banque redonnent l’ancienne sortie', async () => {
    const executed: { label: string; command: string; out: Out }[] = []
    const commandIn = (call: AgentCall) => {
      const found = call.prompt.split('\n').filter(l => l.startsWith('node '))
      expect(found).toHaveLength(1)
      return found[0]!
    }
    const execute = (call: AgentCall) => {
      const command = commandIn(call)
      const out = shell(command)
      executed.push({ label: call.label ?? '', command, out })
      return out
    }
    let firstCoded: string | null = null
    const run = await runWorkflow('tools/workflows/6-add-candidate.js', {
      args: { ...config, root: ROOT, candidate: 'polony', checkedAt: '2026-10-17', skipCard: true },
      onMissing: 'null',
      responders: {
        preflight: (call: AgentCall) => JSON.parse(execute(call).stdout),
        code: (call: AgentCall) => {
          const shown = lines(execute(call)) as unknown as BankQuestion[]
          if (firstCoded) return null
          firstCoded = call.label
          const q = shown[0]!
          return {
            group: call.label!.slice('code:'.length),
            questions: shown.map(x => ({ questionId: x.id, status: x.id === q.id ? 'coded' : 'unknown', note: 'essai' })),
            positions: [{
              questionId: q.id, approachId: q.approaches[0]!.id, weight: 2, rejects: false, nature: 'declaration', confidence: 'medium',
              summary: 'Phrase d’essai.', sources: [{ title: 'Source d’essai', url: 'https://exemple.fr/a', date: '2026-10-01', publisher: 'Exemple' }], origin: 'dossier',
            }],
            proposals: [],
          }
        },
        factcheck: (call: AgentCall) => {
          execute(call)
          return null
        },
      },
    })
    expect(run.calls.every(c => !/node -e/.test(c.prompt))).toBe(true)
    const pre = executed.find(e => e.label === 'preflight:polony')!
    expect(pre.command.startsWith(`node "${ROOT}/tools/lire-banque.mjs" preflight polony --bank "${BANK}" --files `)).toBe(true)
    const files = [join(D, 'dossier_polony.json'), join(D, 'reuse.json')]
    expect(pre.out.code).toBe(0)
    expect(pre.out.stdout).toBe(old(OLD_PREFLIGHT, BANK, 'polony', ...files).stdout)

    // Chaque agent de codage et de vérification a reçu une commande questions, exécutée ici
    const shows = executed.filter(e => e.label.startsWith('code:') || e.label.startsWith('factcheck:'))
    expect(shows.map(s => s.label)).toEqual(run.calls.map(c => c.label ?? '').filter(l => /^(code|factcheck):/.test(l)))
    expect(shows.filter(s => s.label.startsWith('code:')).length).toBeGreaterThan(5)
    for (const s of shows) {
      const m = /^node "(.+?)" questions --bank "(.+?)" (\S+)$/.exec(s.command)
      expect(m, s.command).not.toBeNull()
      expect(m![1]).toBe(SCRIPT)
      expect(m![2]).toBe(BANK)
      expect(s.out.code).toBe(0)
      expect(s.out.stdout).toBe(old(OLD_SHOW, BANK, m![3]!).stdout)
    }
    expect(shows.some(s => s.label.startsWith('factcheck:'))).toBe(true)
  })
})

describe('lire-banque : candidat, question-all, unknown', () => {
  it('candidat : une ligne par question, positions publiées telles quelles, date de source la plus récente du site', () => {
    const out = lire('candidat', 'polony')
    expect(out.code).toBe(0)
    const rows = lines(out) as unknown as {
      id: string; topicId: string; tier: string; step?: number; prompt: string; approaches: { id: string; text: string }[]
      positions: Record<string, Position>; latestSourceDate: Record<string, string | null>
    }[]
    expect(rows.map(r => r.id)).toEqual(questionsOf.map(q => q.id))
    const table = bank.positions.polony!
    for (const [i, r] of rows.entries()) {
      const q = questionsOf[i]!
      expect(Object.keys(r)).toEqual(['id', 'topicId', 'tier', ...(q.step === undefined ? [] : ['step']), 'prompt', 'approaches', 'positions', 'latestSourceDate'])
      expect(r.approaches).toEqual(q.approaches.map(a => ({ id: a.id, text: a.text })))
      const held = q.approaches.map(a => a.id).filter(id => table[id] !== undefined)
      expect(Object.keys(r.positions)).toEqual(held)
      for (const id of held) {
        expect(r.positions[id]).toEqual(table[id])
        expect(r.latestSourceDate[id]).toBe(latestSourceDate(table[id]))
      }
    }
    expect(rows.some(r => Object.keys(r.positions).length > 0)).toBe(true)
  })

  it('latestSourceDate suit la règle du site sur toutes les positions publiées (texte libre ignoré, mois gardé)', () => {
    let compared = 0
    for (const cid of ['retailleau', 'melenchon', 'lepen', 'philippot']) {
      const table = bank.positions[cid]!
      for (const r of lines(lire('candidat', cid)) as unknown as { latestSourceDate: Record<string, string | null> }[]) {
        for (const [id, date] of Object.entries(r.latestSourceDate)) {
          expect(date).toBe(latestSourceDate(table[id]))
          if (date !== null) expect(date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/)
          compared++
        }
      }
    }
    expect(compared).toBeGreaterThan(200)
  })

  it('candidat --questions : seulement ces questions, toujours dans l’ordre de la banque ; un masqué reste lisible', () => {
    const wanted = [questionsOf[5]!.id, questionsOf[1]!.id]
    const rows = lines(lire('candidat', 'polony', '--questions', wanted.join(','))) as unknown as { id: string }[]
    expect(rows.map(r => r.id)).toEqual([questionsOf[1]!.id, questionsOf[5]!.id])
    expect(lines(lire('candidat', 'polony', '--questions', wanted[0]!, '--questions', wanted[1]!)).map(r => r.id)).toEqual(rows.map(r => r.id))
    const hidden = lines(lire('candidat', election.hidden![0]!))
    expect(hidden).toHaveLength(questionsOf.length)
  })

  it('question-all : les seuls candidats présentés, dans l’ordre de config.json, avec la forme courte de leurs positions', () => {
    const q = questionsOf.find(x => x.step === 1 && x.context !== undefined)!
    const out = lire('question-all', q.id)
    expect(out.code).toBe(0)
    const rows = lines(out)
    expect(rows).toHaveLength(1)
    const v = rows[0] as {
      id: string; topicId: string; tier: string; prompt: string; context?: string; approaches: unknown[]
      candidates: { candidateId: string; name: string; positions: Record<string, Record<string, unknown>> }[]
    }
    expect(v).toMatchObject({ id: q.id, topicId: q.topicId, tier: q.tier, prompt: q.prompt, context: q.context, approaches: q.approaches })
    const hidden = new Set([...(election.hidden ?? []), ...config.candidates.filter(c => c.pendingPrimary).map(c => c.id)])
    expect(hidden.size).toBeGreaterThan(0)
    expect(v.candidates.map(c => c.candidateId)).toEqual(config.candidates.filter(c => !hidden.has(c.id)).map(c => c.id))
    expect(v.candidates.map(c => c.name)).toEqual(config.candidates.filter(c => !hidden.has(c.id)).map(c => c.name))
    // Aucun masqué, ni par son identifiant ni par son nom
    const hiddenNames = config.candidates.filter(c => hidden.has(c.id)).map(c => c.name)
    for (const name of hiddenNames) expect(out.stdout).not.toContain(name)
    for (const c of v.candidates) {
      const table = bank.positions[c.candidateId] ?? {}
      const held = q.approaches.map(a => a.id).filter(id => table[id] !== undefined)
      expect(Object.keys(c.positions)).toEqual(held)
      for (const id of held) {
        const p = table[id]!
        const expected: Record<string, unknown> = { nature: p.nature, confidence: p.confidence, summary: p.summary }
        if (p.weight !== undefined) expected.weight = p.weight
        if (p.rejects !== undefined) expected.rejects = p.rejects
        expect(c.positions[id]).toEqual(expected)
        expect(c.positions[id]).not.toHaveProperty('sources')
      }
    }
  })

  it('unknown : exactement les questions que knownQuestions ne compte pas, pour chaque candidat de la banque', () => {
    const pack = { bank: bank.bank, positions: bank.positions } as unknown as Pick<ElectionPack, 'bank' | 'positions'>
    for (const cid of Object.keys(bank.positions)) {
      const v = lines(lire('unknown', cid))[0] as { candidateId: string; unknown: { id: string; topicId: string; tier: string; step?: number }[] }
      expect(v.candidateId).toBe(cid)
      expect(questionsOf.length - v.unknown.length).toBe(knownQuestions(pack, cid))
      // Dans l'ordre de la banque, et la forme courte de chaque question
      const ids = v.unknown.map(u => u.id)
      expect(ids).toEqual(questionsOf.map(q => q.id).filter(id => ids.includes(id)))
      for (const u of v.unknown) {
        const q = questionsOf.find(x => x.id === u.id)!
        expect(u).toEqual({ id: q.id, topicId: q.topicId, tier: q.tier, ...(q.step === undefined ? {} : { step: q.step }) })
      }
    }
  })

  it('unknown --tier : le filtre ne garde que ce niveau', () => {
    const all = (lines(lire('unknown', 'polony'))[0] as { unknown: { id: string; tier: string }[] }).unknown
    const essentiel = (lines(lire('unknown', 'polony', '--tier', 'essentiel'))[0] as { unknown: { id: string; tier: string }[] }).unknown
    expect(essentiel).toEqual(all.filter(u => u.tier === 'essentiel'))
    expect(essentiel.length).toBeGreaterThan(0)
    expect(essentiel.length).toBeLessThan(all.length)
  })
})

describe('lire-banque sur une banque d’essai (--root)', () => {
  const pos = (over: Partial<Position>): Position => ({ weight: 2, nature: 'declaration', confidence: 'high', summary: 'Résumé.', sources: [], ...over }) as Position
  const fakeRoot = () => {
    const root = scratch()
    const d = join(root, 'research', 'presidentielle-2027')
    const s = join(root, 'src', 'elections', 'presidentielle-2027')
    mkdirSync(d, { recursive: true })
    mkdirSync(s, { recursive: true })
    const q = (id: string, tier: string) => ({ id, topicId: 'theme', tier, prompt: `Question ${id} ?`, approaches: ['a', 'b'].map(l => ({ id: `${id}-${l}`, text: `Approche ${l}` })) })
    writeFileSync(join(d, 'bank.json'), JSON.stringify({
      bank: { topics: [], questions: [q('theme-1', 'essentiel'), q('theme-2', 'approfondi'), q('theme-3', 'approfondi'), q('theme-4', 'essentiel')] },
      positions: {
        alpha: {
          'theme-1-a': pos({ sources: [{ title: 't', url: 'https://a.fr', date: '2026-09' }, { title: 't', url: 'https://b.fr', date: '2026-09-15' }, { title: 't', url: 'https://d.fr', date: '2026-08-30' }] }),
          'theme-1-b': pos({ weight: 1, sources: [{ title: 't', url: 'https://e.fr', date: '2026-10' }, { title: 't', url: 'https://f.fr', date: '2026-09-30' }] }),
          'theme-2-b': pos({ confidence: 'low' }),
          'theme-3-a': pos({ weight: undefined, rejects: true, sources: [{ title: 't', url: 'https://c.fr', date: 'consulté le 2026-10-06' }] }),
          'theme-4-b': pos({ weight: undefined, rejects: true, confidence: 'low' }),
        },
        retire: { 'theme-1-b': pos({}) },
        attente: { 'theme-1-a': pos({}) },
      },
      prepared: { prepa: { 'theme-2-a': pos({ nature: 'inference' }) } },
    }))
    writeFileSync(join(d, 'config.json'), JSON.stringify({
      id: 'presidentielle-2027',
      candidates: [
        { id: 'retire', name: 'Personne Retirée' },
        { id: 'alpha', name: 'Alpha Exemple' },
        { id: 'attente', name: 'Personne Attente', pendingPrimary: true },
        { id: 'nouveau', name: 'Nouveau Venu' },
      ],
    }))
    writeFileSync(join(s, 'election.ts'), `export const election: { id: string; hidden: string[] } = { id: 'presidentielle-2027', hidden: ['retire'] }\n`)
    return root
  }

  it('unknown : une confiance low ne rend pas une question connue, un rejet sourcé si ; prepared est lu', () => {
    const root = fakeRoot()
    expect(lines(lire('unknown', 'alpha', '--root', root))[0]).toEqual({
      candidateId: 'alpha',
      unknown: [{ id: 'theme-2', topicId: 'theme', tier: 'approfondi' }, { id: 'theme-4', topicId: 'theme', tier: 'essentiel' }],
    })
    expect((lines(lire('unknown', 'prepa', '--root', root))[0] as { unknown: { id: string }[] }).unknown.map(u => u.id)).toEqual(['theme-1', 'theme-3', 'theme-4'])
  })

  const root1 = fakeRoot()

  it('candidat : la date de source la plus récente, mois compris ; une date en texte libre ne compte pas', () => {
    const rows = lines(lire('candidat', 'alpha', '--root', root1)) as unknown as { id: string; latestSourceDate: Record<string, string | null> }[]
    expect(rows.map(r => r.latestSourceDate)).toEqual([
      { 'theme-1-a': '2026-09-15', 'theme-1-b': '2026-10' }, { 'theme-2-b': null }, { 'theme-3-a': null }, { 'theme-4-b': null },
    ])
  })

  it('question-all : election.hidden (lu dans election.ts) et pendingPrimary sont écartés ; un présenté sans position a {}', () => {
    const v = lines(lire('question-all', 'theme-1', '--root', root1))[0] as { candidates: { candidateId: string; name: string; positions: object }[] }
    expect(v.candidates).toEqual([
      {
        candidateId: 'alpha', name: 'Alpha Exemple',
        positions: { 'theme-1-a': { weight: 2, nature: 'declaration', confidence: 'high', summary: 'Résumé.' }, 'theme-1-b': { weight: 1, nature: 'declaration', confidence: 'high', summary: 'Résumé.' } },
      },
      { candidateId: 'nouveau', name: 'Nouveau Venu', positions: {} },
    ])
  })

  it('n’écrit rien : ni dans la racine d’essai, ni dans l’état local d’une exécution en cours', () => {
    const root = fakeRoot()
    const local = scratch('isoloir-lire-banque-run-')
    // Une exécution en cours dans ce checkout : lib/common.mjs y rangerait la sortie d'un script de la veille
    writeFileSync(join(local, 'lock.json'), JSON.stringify({ runId: '2026-10-19-hebdo', worktrees: [{ path: ROOT, runId: '2026-10-19-hebdo' }, { path: root, runId: '2026-10-19-hebdo' }] }))
    const snapshot = (dir: string): string[] => readdirSync(dir, { recursive: true, encoding: 'utf8' }).map(f => `${f}:${statSync(join(dir, f)).mtimeMs}`).sort()
    const before = [snapshot(root), snapshot(local)]
    const env = { ...process.env, ISOLOIR_VEILLE_LOCAL: local }
    const calls = [
      ['questions', 'theme-1'], ['preflight', 'alpha', '--files', join(root, 'x.json')], ['candidat', 'alpha'], ['question-all', 'theme-2'],
      ['unknown', 'alpha'], ['unknown', 'inconnu'], ['commande-inconnue'],
    ]
    for (const args of calls) {
      for (const where of [root, ROOT]) {
        spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { cwd: where, env, encoding: 'utf8' })
      }
    }
    expect([snapshot(root), snapshot(local)]).toEqual(before)
  })
})

describe('lire-banque refuse les appels mal formés (sortie 2)', () => {
  it('commande absente ou inconnue', () => {
    expectRefused(lire(), /commande attendue/)
    expectRefused(lire('positions', 'polony'), /commande attendue/)
  })

  it('--reset-revisions, sous toutes ses formes', () => {
    expectRefused(lire('questions', questionsOf[0]!.id, '--reset-revisions'), /reset-revisions est interdit/)
    expectRefused(lire('preflight', 'polony', '--files', 'a', '--reset-revisions=1'), /reset-revisions est interdit/)
    expectRefused(lire('candidat', 'reset-revisions'), /reset-revisions est interdit/)
  })

  it('option inconnue, ou permise pour une autre commande', () => {
    expectRefused(lire('candidat', 'polony', '--write'), /option inconnue : --write/)
    expectRefused(lire('candidat', 'polony', '--files', 'a'), /option inconnue pour candidat : --files/)
    expectRefused(lire('questions', '--tier', 'essentiel', questionsOf[0]!.id), /option inconnue : --tier/)
    expectRefused(lire('unknown', 'polony', '--tier', 'rapide'), /--tier : « rapide » hors de essentiel \| approfondi/)
  })

  it('identifiants manquants, en trop ou mal formés', () => {
    expectRefused(lire('questions'), /au moins un identifiant de question/)
    expectRefused(lire('preflight'), /identifiant de candidat attendu/)
    expectRefused(lire('candidat', 'Polony'), /identifiant de candidat invalide/)
    expectRefused(lire('unknown', 'polony', 'attal'), /argument inattendu : attal/)
    expectRefused(lire('question-all'), /identifiant de question attendu/)
    expectRefused(lire('question-all', questionsOf[0]!.id, questionsOf[1]!.id), /argument inattendu/)
  })

  it('question ou candidat inconnus de la banque', () => {
    expectRefused(lire('questions', `${questionsOf[0]!.id},inexistante-1`), /question inconnue de la banque : inexistante-1/)
    expectRefused(lire('question-all', 'inexistante-1'), /question inconnue de la banque : inexistante-1/)
    expectRefused(lire('candidat', 'polony', '--questions', 'inexistante-1'), /question inconnue de la banque/)
    expectRefused(lire('candidat', 'personne'), /candidat inconnu de la banque : personne/)
    expectRefused(lire('unknown', 'personne'), /candidat inconnu de la banque : personne/)
  })

  it('banque absente ou illisible (sauf preflight, qui le dit dans problems)', () => {
    const dir = scratch()
    expectRefused(lire('questions', '--bank', join(dir, 'absente.json'), 'a-1'), /banque absente/)
    writeFileSync(join(dir, 'casse.json'), '{ pas du json')
    expectRefused(lire('candidat', 'polony', '--bank', join(dir, 'casse.json')), /JSON illisible/)
    writeFileSync(join(dir, 'autre.json'), '{"questions": []}')
    expectRefused(lire('unknown', 'polony', '--bank', join(dir, 'autre.json')), /pas une banque construite/)
    expectRefused(lire('question-all', questionsOf[0]!.id, '--bank', join(dir, 'casse.json')), /JSON illisible/)
  })
})
