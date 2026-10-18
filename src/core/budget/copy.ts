// « Faire les comptes » : tous les mots du jeu, et l'écriture des nombres (comme core/table/copy.ts pour « À table »).
// Les nombres s'arrondissent vers l'extérieur : une fourchette affichée contient toujours la fourchette calculée.
import type { Baseline, GoalState, Range } from './ledger'
import type { Lever } from './types'

const NB = '\u202f'
export const MINUS = '−'

const fr = (x: number, d = 1) => x.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
const down = (x: number, d: number) => Math.floor(x * 10 ** d + 1e-9) / 10 ** d
const up = (x: number, d: number) => Math.ceil(x * 10 ** d - 1e-9) / 10 ** d
/** Un nombre signé, avec le vrai signe moins */
const signed = (x: number, d: number, sign: boolean) => {
  const s = fr(Math.abs(x), d)
  if (Number(s.replace(/[^\d]/g, '')) === 0) return s
  if (x < 0) return `${MINUS}${s}`
  return sign && x > 0 ? `+${s}` : s
}

/** Les décimales d'un montant : une au-delà d'un milliard, deux en dessous, puis autant qu'il faut pour qu'un montant
 *  non nul montre un chiffre (jamais « 0,000 ») */
export const decimalsFor = (r: Range) => {
  const m = Math.max(Math.abs(r.lo), Math.abs(r.hi))
  if (m >= 1) return 1
  if (m >= 0.1 || m === 0) return 2
  let d = 3
  while (d < 6 && m < 10 ** -(d - 1)) d++
  return d
}

/** Une fourchette de milliards d'euros, arrondie vers l'extérieur : « 11,0 à 13,7 Md€ » ; un seul nombre quand elle est étroite */
export function md(r: Range, { sign = false, d = decimalsFor(r) }: { sign?: boolean; d?: number } = {}): string {
  if (Math.abs(r.hi - r.lo) < 0.5 * 10 ** -d) {
    // Un seul nombre, arrondi lui aussi vers l'extérieur (loin de zéro)
    const m = (r.lo + r.hi) / 2
    return `${signed(m < 0 ? down(m, d) : up(m, d), d, sign)}${NB}Md€`
  }
  return `${signed(down(r.lo, d), d, sign)} à ${signed(up(r.hi, d), d, sign)}${NB}Md€`
}

/**
 * Un montant publié (ou la fourchette que donne la source), arrondi au plus près : c'est le chiffre de la source, pas un
 * calcul, il ne s'arrondit pas vers l'extérieur (« 58,5 Md€ » pour 58 516 M€, « 0,30 à 0,40 Md€ » pour 300 à 400 M€)
 */
export function mdPublished(r: Range): string {
  const d = decimalsFor(r)
  const near = (x: number) => Math.round(x * 10 ** d + 1e-9) / 10 ** d
  const [lo, hi] = [near(r.lo), near(r.hi)]
  return lo === hi ? `${fr(lo, d)}${NB}Md€` : `${fr(lo, d)} à ${fr(hi, d)}${NB}Md€`
}

/** Une fourchette de déficit en % du PIB : « 4,2 à 4,4 % » */
export function pct(r: Range, d = 1): string {
  const lo = down(r.lo, d)
  const hi = up(r.hi, d)
  return lo === hi ? `${fr(lo, d)}${NB}%` : `${fr(lo, d)} à ${fr(hi, d)}${NB}%`
}

export const pctOne = (x: number, d = 1) => `${fr(x, d)}${NB}%`

/** Le réglage d'un levier linéaire en clair, avec la forme courte de l'unité : « +0,6 point », « −30 000 emplois », « +10 % » ;
 *  le nombre de l'unité (« 10 000 emplois », « 0,1 point de PIB ») multiplie le réglage, l'explication reste sur la fiche */
export function settingLabel(lever: Lever, v: number): string {
  const m = /^([\d\s\u202f\u00a0]+(?:,\d+)?)/.exec(lever.unit.label)
  const n = m ? Number(m[1]!.replace(/[\s\u202f\u00a0]/g, '').replace(',', '.')) || 1 : 1
  const x = v * n
  const d = Number.isInteger(Math.round(x * 1e6) / 1e6) ? 0 : Math.abs(x * 10 - Math.round(x * 10)) < 1e-6 ? 1 : 2
  const num = signed(x, d, true)
  const short = lever.unit.short
  if (short === '%') return `${num}\u202f%`
  if (short === 'pt') return `${num} ${Math.abs(x) >= 2 ? 'points' : 'point'}${/de PIB/.test(lever.unit.label) ? ' de PIB' : ''}`
  return `${num} ${short}`
}

/** Le changement dans le sens du levier : « +11,0 à +13,7 Md€ de recettes » */
export function changeLabel(lever: Lever, r: Range): string {
  return `${md(r, { sign: true })} de ${lever.direction === 'recette' ? 'recettes' : 'dépenses'}`
}

/** Ce que fait un réglage au déficit, en points de PIB : « le déficit baisse de 0,21 à 0,27 point de PIB » ; un seul nombre
 *  quand la fourchette est étroite ; quand les sources ne s'accordent pas sur le sens, le dire */
export function deficitPoints(effect: Range, b: Baseline): string {
  const p = (x: number) => (x / b.gdp) * 100
  const pts = (a: number, z: number) => (z - a < 0.005 ? fr(up(a, 2), 2) : `${fr(down(a, 2), 2)} à ${fr(up(z, 2), 2)}`)
  if (effect.lo >= 0) return `le déficit baisse de ${pts(p(effect.lo), p(effect.hi))} point de PIB`
  if (effect.hi <= 0) return `le déficit monte de ${pts(p(-effect.hi), p(-effect.lo))} point de PIB`
  return `selon les sources, le déficit monte jusqu’à ${fr(up(p(-effect.lo), 2), 2)} point ou baisse jusqu’à ${fr(up(p(effect.hi), 2), 2)} point de PIB`
}

/** Les mots de l'objectif */
export const GOALS = [
  { id: 'garder', title: 'Garder le déficit prévu', pct: (b: Baseline) => b.deficitPct },
  { id: 'moitie', title: 'Le réduire de moitié', pct: (b: Baseline) => b.deficitPct / 2 },
  { id: 'trois', title: `Revenir sous 3${NB}%`, pct: () => 3 },
  { id: 'aucun', title: 'Pas d’objectif', pct: () => null },
] as const

export type GoalId = (typeof GOALS)[number]['id']

export function goalLine(id: GoalId, b: Baseline): string {
  const need = (g: number) => `environ ${fr(Math.round(((b.deficitPct - g) * b.gdp) / 100), 0)}${NB}Md€ à trouver`
  switch (id) {
    case 'garder':
      return `${pctOne(b.deficitPct)}${NB}: vous changez la répartition, pas le total.`
    case 'moitie':
      return `${pctOne(b.deficitPct / 2, 2).replace(',50', ',5')}${NB}: ${need(b.deficitPct / 2)}.`
    case 'trois':
      return `La valeur de référence des traités européens${NB}; visée par une procédure pour déficit excessif, la France est appelée par le Conseil de l’Union européenne à y revenir d’ici 2029. ${need(3).replace(/^e/, 'E')}.`
    case 'aucun':
      return 'Réglez librement, le déficit suit.'
  }
}

/** Le nom de l'objectif, tel que la bande l'imprime */
export const goalShort = (goal: number | null) => (goal === null ? 'Pas d’objectif' : `sous ${pctOne(goal, goal % 1 ? 1 : 0)}`)

/** La phrase de la bande, sous l'axe, en morceaux : le montant (« strong ») s'imprime au bleu bille */
export function bandSentence(state: GoalState, missing: Range, moved: boolean, effect: Range): { before: string; strong?: string; after?: string } {
  switch (state) {
    case 'reached':
      return { before: '', strong: 'Objectif atteint', after: ' selon tous les chiffrages publiés.' }
    case 'partly':
      return { before: `Objectif atteint selon une partie des chiffrages${NB}; selon les autres, il manque jusqu’à `, strong: md({ lo: missing.hi, hi: missing.hi }), after: '.' }
    case 'missing':
      return { before: 'Pour votre objectif, encore ', strong: md(missing), after: '.' }
    default:
      return moved ? { before: `Vos réglages${NB}: `, strong: md(effect, { sign: true }), after: ' sur le solde.' } : { before: 'Le déficit prévu par le projet de loi de finances, non voté.' }
  }
}

export const COPY = {
  title: 'Faire les comptes',
  menuHint: 'Régler le budget 2027 et voir le déficit bouger',
  lede: 'Le budget 2027 de la France, comme si vous le décidiez\u202f: choisissez un objectif, puis réglez des leviers chiffrés par des sources publiques. Le déficit suit chaque geste.',
  fact: (b: Baseline) =>
    `Au départ, le déficit prévu par le projet de loi de finances pour 2027${NB}: ${pctOne(b.deficitPct)} du PIB, soit environ ${fr(Math.round((b.deficitPct * b.gdp) / 100), 0)}${NB}Md€. Ce projet n’est pas encore voté.`,
  goalLegend: 'Votre objectif',
  notes: [
    'Vos réglages restent sur cet appareil le temps de la page\u202f; rien n’est envoyé, rien n’est gardé.',
    'Vos réponses aux questions ne sont pas lues\u202f: ce jeu ne dit rien de vos idées.',
    'Chaque montant vient d’une source citée, en fourchette quand les sources divergent.',
  ],
  start: 'Commencer',
  bandLabel: 'Votre déficit 2027, en % du PIB',
  goal: 'Objectif',
  plf: (b: Baseline) => `PLF ${pctOne(b.deficitPct)}`,
  goalMark: (g: number) => `objectif ${pctOne(g, g % 1 ? 1 : 0)}`,
  railNote: (n: number) => `Les 3 plus gros d’abord, sur ${n}`,
  railSwipe: ' · glissez pour la suite',
  railNothing: 'rien de réglé',
  others: (n: number) => `Les ${n} autres`,
  unchanged: 'inchangé',
  families: { impots: 'Impôts et cotisations', depenses: 'Dépenses de l’État et des services publics', sociale: 'Protection sociale' } as const,
  familyLede: (n: number) => `${n} leviers, de la plus grosse ligne du budget à la plus petite. Chacun se règle dans les deux sens.`,
  allRails: 'Tous les rayons',
  today: 'Aujourd’hui',
  perUnit: (lever: Lever) => `${lever.unit.label}${NB}: `,
  steps: 'Crans',
  fine: (lever: Lever) =>
    lever.unit.short === 'pt' && lever.step < 1
      ? 'Au dixième de point'
      : lever.unit.short === '%' && lever.step === 1
        ? 'Au pour cent près'
        : `Par pas de ${settingLabel(lever, lever.step).replace(/^\+/, '')}`,
  yourSetting: 'Votre réglage',
  backToPlf: 'Revenir au PLF',
  limits: 'Ce que ce chiffre ne compte pas',
  operator: 'Pour la part versée à un organisme public, l’effet suppose qu’il réduise ou augmente d’autant sa dépense.',
  later: 'Après 2027',
  line: 'La ligne du budget',
  sources: 'Sources',
  consulted: (d: string) => `consulté le ${d.split('-').reverse().join('/')}`,
  resetBy: (other: string) => `remis au PLF\u202f: «\u202f${other}\u202f» porte sur la même base`,
  partly: (names: string[]) => {
    const q = names.map(n => `«${NB}${n}${NB}»`)
    const list = q.length > 1 ? `${q.slice(0, -1).join(', ')} et ${q[q.length - 1]}` : q[0]
    return `Vous avez aussi réglé ${list}, qui recoupe${q.length > 1 ? 'nt' : ''} en partie ce levier (la paie des agents publics)${NB}: une même baisse ou une même hausse peut y compter deux fois.`
  },
  myBudget: 'Mon budget',
  objective: 'Objectif',
  previous: 'Précédent',
  next: 'Suivant',
  rails: 'Rayons',
  restart: 'Recommencer',
  backToLevers: 'Les leviers',
  recapTitle: 'Votre budget 2027',
  yourSettings: 'Vos réglages',
  panelHint: 'Choisissez une fiche pour la régler\u202f: chaque cran déplace le déficit, en haut de la page.',
  nothingSet: 'Aucun levier réglé pour l’instant.',
  cancelled: 'réglé puis ramené au PLF',
  notCounted: 'Ce que ce calcul ne compte pas',
  notCountedList: [
    'Les réactions des ménages et des entreprises\u202f: chaque montant est un effet mécanique sur l’année 2027.',
    'Les effets sur la croissance et l’emploi, ni dans un sens ni dans l’autre.',
    'Ce qui ne joue qu’après 2027\u202f: une réforme des retraites, par exemple, monte en charge sur plusieurs années.',
    'Les mesures qu’aucune source éligible ne chiffre\u202f: elles ne sont pas dans le jeu.',
  ],
  howTitle: 'Comment c’est calculé',
  setCount: (n: number) => (n === 0 ? 'Aucun levier réglé' : n === 1 ? '1 levier réglé' : `${n} leviers réglés`),
  loading: 'Chargement des leviers',
} as const

/** La phrase de « Votre budget 2027 » */
export function verdict(b: Baseline, deficit: Range, state: GoalState, missing: Range, goal: number | null): string {
  const now = `Avec vos réglages, le déficit passerait de ${pctOne(b.deficitPct)} à ${pct(deficit)} du PIB.`
  switch (state) {
    case 'reached':
      return `${now} Votre objectif (${goalShort(goal)}) est atteint selon tous les chiffrages publiés.`
    case 'partly':
      return `${now} Votre objectif (${goalShort(goal)}) est atteint selon une partie des chiffrages\u202f; selon les autres, il manque jusqu’à ${md({ lo: missing.hi, hi: missing.hi })}.`
    case 'missing':
      return `${now} Pour votre objectif (${goalShort(goal)}), il manque encore ${md(missing)}.`
    default:
      return now
  }
}
