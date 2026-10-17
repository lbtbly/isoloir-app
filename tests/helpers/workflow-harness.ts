// Banc d'essai des workflows (tools/workflows/*.js) : exécute un script de workflow sans agent réel ni réseau, avec les
// mêmes règles que l'outil Workflow de Claude Code (contrat de la veille : tools/veille/CONTRACT.md, §e et §f).
//   - meta : l'objet littéral « export const meta = {…} » du début, lu sans rien exécuter du reste ; il doit être PUR
//     (aucune variable, aucun appel) et porter name et description ;
//   - le corps du script tourne dans une fonction asynchrone (await et return au premier niveau), en mode strict, avec
//     agent(), parallel(), pipeline(), phase(), log(), args, budget et workflow() simulés ;
//   - Date.now(), new Date() sans argument et Math.random() lèvent une erreur, comme dans l'outil (ils casseraient la
//     reprise d'un workflow) ; new Date(<valeur>) reste permis ;
//   - parallel(thunks) : barrière ; un thunk qui lève donne null, l'appel ne lève jamais ;
//   - pipeline(items, étape1, étape2…) : chaque élément passe seul par toutes les étapes ; chaque étape reçoit
//     (résultat précédent, élément d'origine, indice), la première reçoit l'élément lui-même en premier ; une étape qui
//     lève fait de l'élément un null et saute ses étapes suivantes ;
//   - agent(prompt, opts) : réponse donnée par le test (responders, ci-dessous), copiée en profondeur (un workflow
//     peut la modifier) ; avec opts.schema, la réponse est validée contre ce schéma (validate de tools/veille/
//     schemas.mjs) : une réponse simulée non conforme est une erreur du test, signalée.
//
// Réponses des agents (responders) : une fonction (appel) => valeur, ou un objet dont on essaie les clés dans cet ordre :
//   le label exact (« code:economie »), le préfixe du label avant « : » (« code »), « phase:<phase> », puis « * ».
//   La valeur trouvée est rendue telle quelle (copiée), ou appelée si c'est une fonction (appel) => valeur.
//   null simule un agent passé ou mort ; une fonction qui lève simule une erreur d'agent.
//   Aucune réponse trouvée : onMissing « throw » (par défaut, l'appel est marqué missing et agent() lève) ou « null ».
//
// Usage :
//   const run = await runWorkflow('tools/workflows/1-research.js', {
//     args: { ...config, only: ['-'], skipCleavages: true },
//     responders: { 'facts-check': { calendar: '…', declared: [], changes_vs_config: [] } },
//   })
//   run.meta.name ; run.result ; run.calls[0].label ; run.logs ; run.phases ; run.workflowCalls

import { readFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validate } from '../../tools/veille/schemas.mjs'

/** Racine du dépôt (ce fichier est dans tests/helpers/) */
export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url))

export interface AgentOpts {
  label?: string
  phase?: string
  schema?: Record<string, unknown>
  model?: string
  effort?: string
  isolation?: 'worktree'
  agentType?: string
  [key: string]: unknown
}

export interface AgentCall {
  /** Rang de l'appel, à partir de 0, dans l'ordre où agent() a été appelé */
  index: number
  prompt: string
  opts: AgentOpts
  label: string | null
  /** opts.phase, sinon la phase courante (dernier phase()) */
  phase: string | null
  /** La clé de responders qui a répondu (ou « fonction »), null si aucune */
  matchedBy: string | null
  missing: boolean
  /** Erreurs de la réponse simulée au regard de opts.schema */
  schemaErrors: string[]
  /** La réponse rendue au workflow (null si l'agent a levé) */
  response: unknown
  error: string | null
}

export type Responder = (call: AgentCall) => unknown | Promise<unknown>
export type Responders = Responder | Record<string, unknown>

export interface WorkflowCall {
  ref: string | { scriptPath: string }
  args: unknown
}

export interface HarnessOptions {
  args?: unknown
  responders?: Responders
  /** Ce que rend workflow(ref, args) ; sans lui, workflow() lève (comme un script introuvable) */
  workflow?: (ref: WorkflowCall['ref'], args: unknown) => unknown | Promise<unknown>
  /** budget.total ; null par défaut (aucune cible) */
  budgetTotal?: number | null
  /** budget.remaining(), selon les appels d'agents déjà faits (par défaut : budgetTotal, constant) */
  budgetRemaining?: (calls: readonly AgentCall[]) => number
  onMissing?: 'throw' | 'null'
  /** Valider les réponses simulées contre opts.schema (par défaut oui) */
  checkSchemas?: boolean
  /** Nombre d'agents simultanés au plus (par défaut illimité ; 1 : ordre d'appel strictement séquentiel) */
  concurrency?: number
}

export interface WorkflowMeta {
  name: string
  description: string
  whenToUse?: string
  phases?: { title: string; detail?: string; model?: string }[]
  [key: string]: unknown
}

export interface HarnessRun {
  meta: WorkflowMeta
  result: unknown
  calls: AgentCall[]
  logs: string[]
  /** Titres passés à phase(), dans l'ordre */
  phases: string[]
  /** phase() appelées sans entrée de même titre dans meta.phases */
  phasesMissingFromMeta: string[]
  workflowCalls: WorkflowCall[]
}

/** Fin (indice exclu) de l'objet littéral qui commence à text[start] === '{', chaînes, gabarits et commentaires compris */
function literalEnd(text: string, start: number): number {
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]!
    if (ch === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i)
      if (i < 0) break
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2) + 1
      if (i <= 0) break
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      for (i++; i < text.length && text[i] !== ch; i++) if (text[i] === '\\') i++
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return i + 1
  }
  throw new Error('meta : objet littéral non fermé')
}

/** Sépare meta (évalué seul, pur) du corps du script */
export function splitWorkflow(source: string): { meta: WorkflowMeta; body: string } {
  const m = /^\s*export\s+const\s+meta\s*=\s*/.exec(source)
  if (!m) throw new Error('le script doit commencer par « export const meta = {…} »')
  const open = m.index + m[0].length
  if (source[open] !== '{') throw new Error('meta doit être un objet littéral')
  const end = literalEnd(source, open)
  const literal = source.slice(open, end)
  if (/\$\{/.test(literal)) throw new Error('meta : pas de gabarit interpolé (${…}) dans un objet PUR')
  let meta: WorkflowMeta
  try {
    // Aucune variable n'est visible ici : une référence à une variable ou un appel de fonction lève
    meta = new Function(`"use strict"; return (${literal})`)() as WorkflowMeta
  } catch (e) {
    throw new Error(`meta n'est pas un objet littéral pur : ${(e as Error).message}`, { cause: e })
  }
  if (!meta || typeof meta.name !== 'string' || typeof meta.description !== 'string') throw new Error('meta : name et description obligatoires')
  return { meta, body: source.slice(end).replace(/^\s*;?/, '') }
}

class StrictDate extends Date {
  constructor(...a: unknown[]) {
    if (!a.length) throw new Error('new Date() sans argument est interdit dans un workflow : passer la date dans args')
    super(...(a as [string]))
  }
  static override now(): number {
    throw new Error('Date.now() est interdit dans un workflow : passer la date dans args')
  }
}
const StrictMath: Math = Object.create(Math, {
  random: {
    value: () => {
      throw new Error('Math.random() est interdit dans un workflow : varier le prompt ou le label par indice')
    },
  },
})

const clone = <T>(v: T): T => (v === undefined ? v : structuredClone(v))

/** Petit limiteur de simultanéité, pour l'option concurrency */
function limiter(max: number) {
  let active = 0
  const queue: (() => void)[] = []
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    if (active >= max) await new Promise<void>(r => queue.push(r))
    active++
    try {
      return await fn()
    } finally {
      active--
      queue.shift()?.()
    }
  }
}

/**
 * Exécute le workflow file (chemin absolu, ou relatif à la racine du dépôt) avec des agents simulés. Rend meta, la
 * valeur de retour du script et tous les appels ; lève si le script lève (le test l'attend avec rejects).
 */
export async function runWorkflow(file: string, options: HarnessOptions = {}): Promise<HarnessRun> {
  const path = isAbsolute(file) ? file : join(REPO_ROOT, file)
  const { meta, body } = splitWorkflow(readFileSync(path, 'utf8'))
  const calls: AgentCall[] = []
  const logs: string[] = []
  const phases: string[] = []
  const workflowCalls: WorkflowCall[] = []
  const onMissing = options.onMissing ?? 'throw'
  const checkSchemas = options.checkSchemas ?? true
  const limit = limiter(options.concurrency ?? Number.POSITIVE_INFINITY)
  let currentPhase: string | null = null

  const find = (call: AgentCall): { by: string; value: unknown } | null => {
    const r = options.responders
    if (typeof r === 'function') return { by: 'fonction', value: r }
    if (!r) return null
    const label = call.label ?? ''
    const keys = [label, label.includes(':') ? label.slice(0, label.indexOf(':')) : null, call.phase ? `phase:${call.phase}` : null, '*']
    for (const k of keys) if (k && Object.prototype.hasOwnProperty.call(r, k)) return { by: k, value: r[k] }
    return null
  }

  const agent = (prompt: string, opts: AgentOpts = {}) =>
    limit(async () => {
      const call: AgentCall = {
        index: calls.length,
        prompt: String(prompt),
        opts: { ...opts },
        label: opts.label ?? null,
        phase: opts.phase ?? currentPhase,
        matchedBy: null,
        missing: false,
        schemaErrors: [],
        response: null,
        error: null,
      }
      calls.push(call)
      const hit = find(call)
      if (!hit) {
        call.missing = true
        if (onMissing === 'null') return null
        call.error = `aucune réponse simulée pour l'agent « ${call.label ?? '(sans label)'} » (phase ${call.phase ?? '—'})`
        throw new Error(call.error)
      }
      call.matchedBy = hit.by
      let value: unknown
      try {
        value = typeof hit.value === 'function' ? await (hit.value as Responder)(call) : hit.value
      } catch (e) {
        call.error = (e as Error)?.message ?? String(e)
        throw e
      }
      value = clone(value ?? null)
      if (checkSchemas && opts.schema && value !== null) {
        call.schemaErrors = validate(opts.schema, value)
        if (call.schemaErrors.length) {
          call.error = `réponse simulée non conforme au schéma de « ${call.label} » : ${call.schemaErrors.slice(0, 5).join(' ; ')}`
          throw new Error(call.error)
        }
      }
      call.response = value
      return value
    })

  const parallel = async (thunks: (() => unknown)[]) => {
    if (!Array.isArray(thunks)) throw new Error('parallel attend une liste de fonctions')
    return Promise.all(thunks.map(t => Promise.resolve().then(t).catch(() => null)))
  }

  const pipeline = async (items: unknown[], ...stages: ((prev: unknown, item: unknown, index: number) => unknown)[]) => {
    if (!Array.isArray(items)) throw new Error('pipeline attend une liste')
    return Promise.all(
      items.map(async (item, index) => {
        let prev: unknown = item
        for (const stage of stages) {
          try {
            prev = await stage(prev, item, index)
          } catch {
            return null
          }
        }
        return prev
      }),
    )
  }

  const phase = (title: string) => {
    currentPhase = String(title)
    phases.push(currentPhase)
  }
  const log = (message: string) => {
    logs.push(String(message))
  }
  const total = options.budgetTotal ?? null
  const budget = {
    total,
    spent: () => 0,
    remaining: () => (options.budgetRemaining ? options.budgetRemaining(calls) : total == null ? Number.POSITIVE_INFINITY : total),
  }
  const workflow = async (ref: WorkflowCall['ref'], args?: unknown) => {
    workflowCalls.push({ ref, args: clone(args) })
    if (!options.workflow) throw new Error(`workflow() non simulé : ${typeof ref === 'string' ? ref : ref.scriptPath}`)
    return clone(await options.workflow(ref, clone(args)))
  }

  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (...a: string[]) => (...v: unknown[]) => Promise<unknown>
  const fn = new AsyncFunction('agent', 'parallel', 'pipeline', 'phase', 'log', 'args', 'budget', 'workflow', 'Date', 'Math', `"use strict";\n${body}`)
  const result = await fn(agent, parallel, pipeline, phase, log, clone(options.args), budget, workflow, StrictDate, StrictMath)
  const titles = new Set((meta.phases ?? []).map(p => p.title))
  return {
    meta,
    result,
    calls,
    logs,
    phases,
    phasesMissingFromMeta: [...new Set(phases.filter(p => !titles.has(p)))],
    workflowCalls,
  }
}
