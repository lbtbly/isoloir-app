// « Faire les comptes » relié aux réponses (décision du propriétaire du 18 octobre 2026) : sur chaque levier relié à une
// approche des questions, la réponse de la personne (d'accord, pas d'accord, ligne rouge) ; et le levier pré-réglé dans
// le sens de ce qu'elle approuve, quand ses réponses s'accordent. Calcul sur l'appareil, sans IA ; rien n'est envoyé.
import type { Answers } from '../types'
import { clampValue, isBase, lineSize, type Setting } from './ledger'
import type { Lever, LeverLink } from './types'

export type Stance = 'agree' | 'disagree' | 'red'

/** Une réponse de la personne sur une approche reliée au levier */
export interface LeverMark {
  approach: string
  question: string
  stance: Stance
  /** Le sens où l'approche emmène le levier */
  dir: 1 | -1
  setting: number | string
  /** L'approche ne porte qu'en partie sur ce levier (une façon parmi d'autres de la faire) : marquée, pas pré-réglée */
  partial?: true
  /**
   * L'approche ne porte qu'en partie sur chacun de ses leviers : celui de la plus grosse ligne la représente et peut être
   * pré-réglé d'un cran, pour qu'une idée large (« taxer davantage… ») compte autant qu'une idée précise
   */
  main?: true
}

export interface LeverReading {
  marks: LeverMark[]
  /** Le réglage d'après les réponses, quand elles s'accordent */
  preset?: Setting
  /** Les réponses tirent le levier dans les deux sens (ou une ligne rouge contredit un accord) : pas de pré-réglage */
  split?: true
  /**
   * Les réponses pré-régleraient aussi un levier sur la même base (exclusif) : aucun des deux n'est pré-réglé, la
   * personne choisit lequel régler (aucune règle ne départage à sa place)
   */
  sameBase?: string[]
}

const firstNotch = (lever: Lever) => lever.notches.filter(n => n > 0).sort((a, b) => a - b)[0] ?? lever.step

/** Le réglage qu'une approche approuvée donne au levier, ou rien s'il ne se lit pas */
function settingOf(lever: Lever, m: LeverMark): Setting | undefined {
  if (lever.kind === 'options') {
    if (typeof m.setting === 'string' && m.setting !== 'dir') return lever.options?.some(o => o.id === m.setting && !o.base) ? m.setting : undefined
    // Le sens seulement : le réglage le plus proche du PLF dans ce sens (le plus petit effet), comme le premier cran
    const mid = (o: { lo: number; hi: number }) => (o.lo + o.hi) / 2
    const inDir = (lever.options ?? []).filter(o => !o.base && Math.sign(mid(o)) === m.dir)
    return inDir.sort((a, b) => Math.abs(mid(a)) - Math.abs(mid(b)))[0]?.id
  }
  if (typeof m.setting === 'number' && Number.isFinite(m.setting) && m.setting !== 0) return clampValue(lever, m.dir * Math.abs(m.setting))
  // Le sens seulement : le premier cran, mais jamais plus de 10 % d'une ligne de crédits (dont le premier cran peut être
  // la moitié) : une approche qui ne dit pas de taille n'en reçoit pas une grande
  const step = lever.unit.short === '%' ? Math.min(firstNotch(lever), 10) : firstNotch(lever)
  return clampValue(lever, m.dir * step)
}

/**
 * Ce que les réponses disent de chaque levier relié. Un accord sans contradiction pré-règle le levier : au plus modéré
 * des réglages approuvés (un nombre plus petit, le premier réglage nommé), jamais au-delà de sa borne
 */
export function readLevers(levers: readonly Lever[], links: readonly LeverLink[], answers: Answers): Record<string, LeverReading> {
  const out: Record<string, LeverReading> = {}
  const main = mainLinks(levers, links)
  for (const link of links) {
    const a = answers[link.question]
    if (!a) continue
    const red = a.redLines.includes(link.approach)
    const rating = a.ratings[link.approach]
    const stance: Stance | null = red ? 'red' : rating === 1 ? 'agree' : rating === -1 ? 'disagree' : null
    if (!stance) continue
    const isMain = main.has(`${link.approach}|${link.lever}`)
    ;(out[link.lever] ??= { marks: [] }).marks.push({
      approach: link.approach,
      question: link.question,
      stance,
      dir: link.dir,
      // Le levier principal d'une idée large part du sens seulement : d'un cran, jamais d'une taille qu'elle ne dit pas
      setting: isMain ? 'dir' : link.setting,
      ...(link.fit === 'partial' && !isMain ? { partial: true as const } : {}),
      ...(isMain ? { main: true as const } : {}),
    })
  }
  for (const [id, r] of Object.entries(out)) {
    const lever = levers.find(l => l.id === id)
    if (!lever) {
      delete out[id]
      continue
    }
    const agreed = r.marks.filter(m => m.stance === 'agree')
    const dirs = new Set(agreed.map(m => m.dir))
    if (!dirs.size) continue
    const [dir] = [...dirs]
    const contradicted = dirs.size > 1 || r.marks.some(m => m.stance === 'red' && m.dir === dir)
    if (contradicted) {
      r.split = true
      continue
    }
    // Seules les approches qui se font par ce levier le pré-règlent ; celles qui n'y portent qu'en partie le marquent
    const settings = agreed.filter(m => !m.partial).map(m => settingOf(lever, m)).filter((s): s is Setting => s !== undefined)
    // Le plus modéré : le plus petit nombre d'unités, ou le réglage dont l'effet est le plus petit
    const size = (s: Setting) => {
      if (typeof s === 'number') return Math.abs(s)
      const o = lever.options?.find(x => x.id === s)
      return o ? Math.abs((o.lo + o.hi) / 2) : Infinity
    }
    const pick = settings.reduce<Setting | undefined>((a, b) => (a === undefined || size(b) < size(a) ? b : a), undefined)
    // Un réglage qui retombe sur le PLF (arrondi au pas) ne pré-règle rien
    if (pick !== undefined && !isBase(lever, pick)) r.preset = pick
  }
  // Deux leviers sur la même base que les réponses pré-régleraient ensemble : ni l'un ni l'autre, la fiche le dit
  for (const [id, r] of Object.entries(out)) {
    if (r.preset === undefined) continue
    const clash = (levers.find(l => l.id === id)?.exclusiveWith ?? []).filter(o => out[o]?.preset !== undefined)
    if (clash.length) r.sameBase = clash
  }
  for (const r of Object.values(out)) if (r.sameBase) delete r.preset
  return out
}

/**
 * Les liens qui représentent seuls une approche dont tous les liens sont partiels : le levier de la plus grosse ligne
 * (puis le premier relié), règle connue d'avance, la même pour toutes les idées
 */
export function mainLinks(levers: readonly Lever[], links: readonly LeverLink[]): Set<string> {
  const byApproach = new Map<string, LeverLink[]>()
  for (const k of links) if (levers.some(l => l.id === k.lever)) byApproach.set(k.approach, [...(byApproach.get(k.approach) ?? []), k])
  const out = new Set<string>()
  for (const [approach, ks] of byApproach) {
    if (ks.some(k => k.fit !== 'partial')) continue
    const size = (k: LeverLink) => lineSize(levers.find(l => l.id === k.lever)!)
    const best = ks.reduce((a, b) => (size(b) > size(a) ? b : a))
    out.add(`${approach}|${best.lever}`)
  }
  return out
}

/** Les réglages d'après les réponses, à poser au départ : seulement les leviers pré-réglables */
export function presets(readings: Record<string, LeverReading>): Record<string, Setting> {
  const out: Record<string, Setting> = {}
  for (const [id, r] of Object.entries(readings)) if (r.preset !== undefined) out[id] = r.preset
  return out
}
