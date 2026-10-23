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

/**
 * Les décimales du déficit : une, sauf quand les réglages le bougent de moins de 0,1 point de PIB (un levier sur une
 * petite ligne), où une seule décimale ne montrerait aucun mouvement : deux
 */
export const deficitDecimals = (b: Baseline, effect: Range) =>
  Math.max(Math.abs(effect.lo), Math.abs(effect.hi)) > 0 && (Math.max(Math.abs(effect.lo), Math.abs(effect.hi)) / b.gdp) * 100 < 0.1 ? 2 : 1

/** Une fourchette de déficit en % du PIB : « 4,2 à 4,4 % » */
// Un pourcentage négatif (un excédent) prend le vrai signe moins, comme les montants
const frSigned = (x: number, d: number) => fr(x, d).replace(/^[-\u2212]/, MINUS)

export function pct(r: Range, d = 1): string {
  const lo = down(r.lo, d)
  const hi = up(r.hi, d)
  return lo === hi ? `${frSigned(lo, d)}${NB}%` : `${frSigned(lo, d)} à ${frSigned(hi, d)}${NB}%`
}

export const pctOne = (x: number, d = 1) => `${frSigned(x, d)}${NB}%`

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
export function bandSentence(state: GoalState, missing: Range, moved: boolean, effect: Range, estimated = false): { before: string; strong?: string; after?: string } {
  // Une part estimée par Isoloir : ce ne sont plus seulement des chiffrages publiés
  const all = estimated ? ' selon toutes les fourchettes, estimations d’Isoloir comprises.' : ' selon tous les chiffrages publiés.'
  const some = estimated ? 'une partie des fourchettes' : 'une partie des chiffrages'
  switch (state) {
    case 'reached':
      return { before: '', strong: 'Objectif atteint', after: all }
    case 'partly':
      return { before: `Objectif atteint selon ${some}${NB}; selon les autres, il manque jusqu’à `, strong: md({ lo: missing.hi, hi: missing.hi }), after: '.' }
    case 'missing':
      // Les réglages en Md€ d'abord : un levier sur une petite ligne bouge à peine le pourcentage, pas le montant
      return moved
        ? { before: `Vos réglages${NB}: ${md(effect, { sign: true })}${NB}; pour votre objectif, encore `, strong: md(missing), after: '.' }
        : { before: 'Pour votre objectif, encore ', strong: md(missing), after: '.' }
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
    'Vos réglages sont gardés sur cet appareil, avec vos réponses, et repris dans le double que vous exportez\u202f; rien n’est envoyé.',
    'Vos réponses aux questions, si vous en avez donné, peuvent pré-régler les leviers qui s’y rapportent\u202f: chaque fiche le dit, et tout se change.',
    'Chaque montant vient d’une source citée, en fourchette quand les sources divergent, ou d’une estimation d’Isoloir, dite comme telle.',
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
  moreSources: (n: number) => (n > 1 ? `Les ${n} autres sources` : 'L’autre source'),
  consulted: (d: string) => `consulté le ${d.split('-').reverse().join('/')}`,
  resetBy: (other: string) => `remis au PLF\u202f: «\u202f${other}\u202f» porte sur la même base`,
  partly: (names: string[]) => {
    const q = names.map(n => `«${NB}${n}${NB}»`)
    const list = q.length > 1 ? `${q.slice(0, -1).join(', ')} et ${q[q.length - 1]}` : q[0]
    return `Vous avez aussi réglé ${list}, qui porte${q.length > 1 ? 'nt' : ''} en partie sur la même base que ce levier${NB}: une même baisse ou une même hausse peut y compter deux fois.`
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
    'Les mesures qu’on ne peut ni chiffrer ni estimer honnêtement\u202f: elles ne sont pas dans le jeu.',
  ],
  howTitle: 'Comment c’est calculé',
  // Le point de départ, quand des réponses se rapportent à des leviers
  startLegend: 'Votre point de départ',
  startAnswers: (n: number) => `D’après mes réponses (${n} levier${n > 1 ? 's' : ''} pré-réglé${n > 1 ? 's' : ''})`,
  startAnswersLine: 'Les leviers que vos réponses approuvent partent dans leur sens\u202f; vous les réglez ensuite comme vous voulez.',
  startPlf: 'Le PLF, sans rien régler',
  startPlfLine: 'Tous les leviers au réglage du projet de loi de finances.',
  presetNote: (n: number) => `${n} levier${n > 1 ? 's' : ''} pré-réglé${n > 1 ? 's' : ''} d’après vos réponses`,
  presetClear: 'Les remettre au PLF',
  // Les marques des fiches
  tagPreset: 'd’après vos réponses',
  tagAnswered: 'vous avez répondu',
  tagSplit: 'réponses partagées',
  tagEstimate: 'estimation',
  answersTitle: 'Vos réponses',
  stance: { agree: 'D’accord', disagree: 'Pas d’accord', red: 'Ligne rouge' } as const,
  towards: (dir: 1 | -1, lever: Lever) =>
    dir > 0 ? (lever.direction === 'recette' ? 'plus de recettes' : 'plus de dépenses') : lever.direction === 'recette' ? 'moins de recettes' : 'moins de dépenses',
  presetIs: (v: string) => `Pré-réglé d’après vos réponses\u202f: ${v}.`,
  splitIs: 'Vos réponses tirent ce levier dans les deux sens (ou une ligne rouge contredit un accord)\u202f: rien n’est pré-réglé.',
  // Les estimations d'Isoloir et la plage au-delà de la source (décisions du 18 octobre 2026)
  estimateTitle: 'Estimation d’Isoloir',
  estimateLine: 'Aucune source éligible ne chiffre ce levier\u202f: l’effet est estimé par Isoloir, en fourchette large, à partir de chiffres officiels cités.',
  estimateHow: 'Comment c’est estimé',
  beyondLine: (max: string) => `Hachuré, au-delà de ${max}\u202f: la source ne chiffre plus, l’effet est une estimation, en fourchette élargie.`,
  beyondEstimate: (max: string) => `Hachuré, au-delà de ${max}\u202f: l’estimation d’Isoloir s’élargit encore.`,
  beyondNow: 'Ce réglage va au-delà de la plage chiffrée par la source\u202f: une partie de l’effet est estimée.',
  estimatedPart: (all: string, share: string) =>
    `Vos réglages font ${all} sur le solde, dont ${share} d’effets estimés par Isoloir (sans chiffrage éligible, ou au-delà de la plage chiffrée).`,
  sameBaseIs: (others: string) => `Vos réponses régleraient aussi ${others}, sur la même base\u202f: rien n’est pré-réglé, à vous de choisir lequel régler.`,
  noPresetIs: 'Votre accord ne dit pas de réglage lisible pour ce levier\u202f: rien n’est pré-réglé.',
  partialIs: 'Ces approches ne portent qu’en partie sur ce levier (une façon parmi d’autres de les faire)\u202f: il n’est pas pré-réglé.',
  mainIs: 'Votre réponse porte sur plusieurs leviers à la fois\u202f: celui de la plus grosse ligne la représente, d’un cran.',
  presetCleared: (n: number) => `${n} levier${n > 1 ? 's' : ''} remis au PLF.`,
  // « Comprendre » un levier
  understand: 'Comprendre',
  understandMore: 'Qui paie, ce qui change, les arguments',
  who: 'Qui est concerné',
  ifUp: 'S’il monte',
  ifDown: 'S’il baisse',
  argsUp: 'Pour le monter, on avance',
  argsDown: 'Pour le baisser, on avance',
  fallTitle: 'Du PLF à votre budget',
  fallStart: 'Déficit prévu (PLF 2027)',
  fallEnd: 'Votre déficit 2027',
  fallStep: (family: 'impots' | 'depenses' | 'sociale', lowers: boolean) =>
    family === 'impots'
      ? `Impôts et cotisations${NB}: ${lowers ? 'recettes en plus' : 'recettes en moins'}`
      : `${family === 'depenses' ? 'Dépenses de l’État' : 'Protection sociale'}${NB}: ${lowers ? 'dépenses en moins' : 'dépenses en plus'}`,
  fallNote: 'Chaque pas regroupe vos réglages d’une famille dans un sens\u202f; la barre suit le milieu de chaque fourchette.',
  setCount: (n: number) => (n === 0 ? 'Aucun levier réglé' : n === 1 ? '1 levier réglé' : `${n} leviers réglés`),
  loading: 'Chargement des leviers',
} as const

/** La phrase de « Votre budget 2027 » */
export function verdict(b: Baseline, deficit: Range, state: GoalState, missing: Range, goal: number | null, effect: Range = { lo: 0, hi: 0 }, estimated = false): string {
  const now = `Avec vos réglages, le déficit passerait de ${pctOne(b.deficitPct)} à ${pct(deficit, deficitDecimals(b, effect))} du PIB.`
  switch (state) {
    case 'reached':
      return `${now} Votre objectif (${goalShort(goal)}) est atteint ${estimated ? 'selon toutes les fourchettes, estimations d’Isoloir comprises' : 'selon tous les chiffrages publiés'}.`
    case 'partly':
      return `${now} Votre objectif (${goalShort(goal)}) est atteint selon une partie des ${estimated ? 'fourchettes' : 'chiffrages'}\u202f; selon les autres, il manque jusqu’à ${md({ lo: missing.hi, hi: missing.hi })}.`
    case 'missing':
      return `${now} Pour votre objectif (${goalShort(goal)}), il manque encore ${md(missing)}.`
    default:
      return now
  }
}
