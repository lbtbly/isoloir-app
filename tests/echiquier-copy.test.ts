// Les mots de la page « Mon profil politique » (core/echiquierCopy.ts), de sa rubrique de la Méthode
// (core/echiquierMethodCopy.ts) et ceux qu'elles ont en commun (core/echiquierCommonCopy.ts), sur le modèle de
// results-copy.test.ts : accords au singulier et au pluriel, formes des blocs, et les règles d'écriture (DESIGN.md, The
// Reading Not Label Rule) : le sujet est toujours « vos réponses », un bloc est toujours attribué à la grille, aucun mot
// d'étiquette ni de qualité, plus jamais « hasard » pour dire la comparaison (D2), aucun « % » dans la synthèse et les
// phrases, aucun symbole de lecture (seul « ? » reste), les espaces insécables du site ; l'affichage dédié (D1) : chaque
// état dit un constat, sans cause prêtée à la personne. Ceux de « Ce qui pèse le plus » (lot 3,
// core/echiquierWeighCopy.ts) : les phrases des maquettes validées, en nombres, sans aucun nom de candidat. Puis le
// découpage du build : la rubrique n'emporte ni le calcul de la page ni ses mots, ni la page la fiche.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ECHIQUIER, readEchiquier, segments, type BlocCell, type Mark, type UnitReading, type UnitStatus } from '../src/core/echiquier'
import * as C from '../src/core/echiquierCopy'
import * as D from '../src/core/echiquierDetailCopy'
import * as W from '../src/core/echiquierWeighCopy'
import { word } from '../src/core/echiquierCommonCopy'
import * as M from '../src/core/echiquierMethodCopy'
import { panelOf } from '../src/core/echiquierPanel'
import { CLOSE_GAP, dealbreakerLevel, effectiveWeight } from '../src/core/score'
import { axisOf } from '../src/core/spectrum'
import { elections } from '../src/elections/all'
import { isQuick, profilesFor } from './fixtures/echiquier-profiles'

/** Les mots de la page et ceux de son détail, chargés avec le tableau (core/echiquierDetailCopy.ts) : les mêmes règles */
const T = { ...C, ...D }
const NB = String.fromCharCode(0xa0)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
/** Les fichiers de la page et de sa rubrique de la Méthode, dont on lit les textes (la barre des domaines et le détail compris) */
const PAGE_FILES = [
  'src/ui/screens/Profile.tsx',
  'src/ui/profile/Chart.tsx',
  'src/ui/profile/Nav.tsx',
  'src/ui/profile/ProfileDetail.tsx',
  'src/ui/profile/Weigh.tsx',
  'src/ui/profile/MethodSection.tsx',
  'src/ui/profile/Diagram.tsx',
]
const axis = axisOf(elections.find(p => p.election.id === 'presidentielle-2027')!.election)!

/** Les libellés de la grille, ceux des colonnes : « Extrême gauche » */
const labels = axis.map(a => elections.find(p => p.election.id === 'presidentielle-2027')!.election.spectrum!.blocs.find(b => b.id === a.bloc)!.label)

/**
 * Une unité factice : ses blocs nettement plus près, nettement plus loin et inconnus ; affinity : celle de chaque bloc ;
 * ways : ses façons de poser les mêmes avis ; distinct : un bloc s'écarte nettement des autres façons (toujours vrai
 * d'une lecture ou d'écarts ; sur « rien de net », un bloc trop près de 50 %)
 */
function reading(
  status: UnitStatus,
  near: number[] = [],
  far: number[] = [],
  unknown: number[] = [],
  kind: 'theme' | 'famille' = 'theme',
  affinity: number[] = [50, 50, 50, 50, 50],
  ways = 252,
  distinct = status === 'lecture' || status === 'ecarts',
) {
  const cells: BlocCell[] = axis.map((a, b) => ({
    bloc: a.bloc,
    known: [],
    affinity: unknown.includes(b) ? null : (affinity[b] ?? 50),
    chance: null,
    p: null,
    alike: null,
    mark: (unknown.includes(b) ? 'inconnu' : near.includes(b) ? 'pres' : far.includes(b) ? 'loin' : 'rien') as Mark,
  }))
  return { status, near, far, cells, kind, ways, distinct } as Pick<UnitReading, 'status' | 'near' | 'far' | 'cells' | 'kind' | 'ways' | 'distinct'>
}

/** Toutes les parties de l'axe (sous-ensembles non vides) */
const subsets = (n: number) => Array.from({ length: 2 ** n - 1 }, (_, m) => [...Array(n).keys()].filter(i => (m + 1) & (1 << i)))

/** Toutes les phrases d'unité possibles sur l'axe réel */
function allSentences(): string[] {
  const out: string[] = []
  const B = axis.length
  for (const near of subsets(B)) {
    out.push(T.unitSentence(axis, reading('lecture', near)))
    const rest = [...Array(B).keys()].filter(b => !near.includes(b))
    for (const far of subsets(rest.length).map(s => s.map(i => rest[i]!)).slice(0, 8)) out.push(T.unitSentence(axis, reading('lecture', near, far)))
    if (rest.length) out.push(T.unitSentence(axis, reading('lecture', near, [], [rest[0]!])))
  }
  for (const far of subsets(B)) out.push(T.unitSentence(axis, reading('ecarts', [], far)))
  // Rien de net : assez de façons, ou trop peu pour conclure (moins de dix), ou une seule
  for (const ways of [1, 2, 6, 9, 10, 252, Number.POSITIVE_INFINITY])
    for (const kind of ['theme', 'famille'] as const) out.push(T.unitSentence(axis, reading('aucun', [], [], [], kind, undefined, ways)))
  // Rien de net, un bloc nettement à l'écart des autres façons mais trop près de 50 %
  for (const kind of ['theme', 'famille'] as const) out.push(T.unitSentence(axis, reading('aucun', [], [], [], kind, undefined, 252, true)))
  for (const u of [0, 1, 2, 3, 4]) out.push(T.unitSentence(axis, reading('aucun', [], [], [u])), T.unitSentence(axis, reading('aucun', [], [], [u], 'theme', undefined, 6)))
  for (const unknown of subsets(B).filter(s => s.length > 1)) {
    out.push(T.unitSentence(axis, reading('blocs-inconnus', [], [], unknown)))
    out.push(T.unitSentence(axis, reading('blocs-inconnus', [], [], unknown, 'famille')))
  }
  out.push(T.unitSentence(axis, reading('une-question')))
  return out
}

/** Les noms des lignes du graphique pour les lecteurs d'écran, sur toutes les formes de marques */
function allSummaries(): string[] {
  const out: string[] = []
  const B = axis.length
  for (const near of subsets(B)) {
    out.push(T.rowSummary(labels, 'Logement', T.questionsCount(4), reading('lecture', near)))
    const rest = [...Array(B).keys()].filter(b => !near.includes(b))
    for (const far of subsets(rest.length).map(s => s.map(i => rest[i]!)).slice(0, 8)) out.push(T.rowSummary(labels, 'Défense', T.questionsCount(5), reading('lecture', near, far)))
    if (rest.length) out.push(T.rowSummary(labels, 'Europe', T.questionsCount(5), reading('lecture', near, [], [rest[0]!])))
  }
  for (const far of subsets(B)) out.push(T.rowSummary(labels, 'Retraites', T.questionsCount(3), reading('ecarts', [], far)))
  out.push(T.rowSummary(labels, 'Numérique', T.questionsCount(2), reading('aucun')))
  for (const u of [0, 2, 4]) out.push(T.rowSummary(labels, 'Numérique', T.questionsCount(2), reading('aucun', [], [], [u])))
  out.push(T.rowSummary(labels, 'Culture', T.questionsCount(1), reading('une-question')))
  out.push(T.rowSummary(labels, 'Économie et travail', `${T.themesTogether(4)}, ${T.questionsCount(9)}`, reading('blocs-inconnus', [], [], [3, 4], 'famille')))
  return out
}

/** Les faits « sur une seule question » : un ou plusieurs accords portés, et des accords que personne ne porte */
function allFacts(): string[] {
  const names = ['Nathalie Arthaud', 'Raphaël Glucksmann', 'Gabriel Attal', 'Bruno Retailleau', 'Marine Le Pen']
  const out: string[] = [T.oneQuestion(axis, [[], [], [], [], []], 0, 2)!]
  for (const s of subsets(axis.length))
    for (const [placed, unplaced] of [[1, 0], [2, 0], [1, 1], [2, 1], [1, 2], [3, 2]] as const)
      out.push(T.oneQuestion(axis, axis.map((_, b) => (s.includes(b) ? [names[b]!] : [])), placed, unplaced)!)
  out.push(T.oneQuestion(axis, [[names[0]!, 'Jean-Luc Mélenchon'], [], [], [], []])!)
  return out
}

/** Tous les textes du module : constantes, tableaux, et fonctions appelées avec des valeurs plausibles */
function allTexts(): string[] {
  const out: string[] = []
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  for (const v of [...Object.values(T), ...Object.values(M), ...Object.values(W)]) if (typeof v !== 'function') walk(v)
  for (const n of [1, 2, 7]) {
    out.push(T.howWho(15, n), T.onQuestions(n), T.familyHead(n + 1), T.nothingLine(n), T.apartLine(n), T.noReadingLine(n), T.unansweredLine(n))
    out.push(...T.caveats(15), T.unplaced(n, false), T.unplaced(n, true), T.chanceNote(true, n * 12), T.chanceNote(true, n * 12_345), T.chanceNote(false, Number.POSITIVE_INFINITY))
    out.push(T.detailWhy(252, n, 'pres'), T.detailWhy(97_200, n * 1000, 'loin'), T.countEnd(n - 1), T.deeperCount(n, n + 1, true), T.deeperCount(0, n, true), T.deeperCount(n, 0, false))
  }
  out.push(T.chanceNote(true, 1))
  // Le compte de tête et ce qui n'a pas compté, toutes les combinaisons
  for (const [a, f, t, u, q] of [[0, 0, 0, 0, 0], [0, 10, 8, 0, 4], [1, 1, 1, 1, 1], [2, 0, 0, 3, 0], [0, 0, 0, 0, 7]] as const) {
    const rest = T.countRest(a, f, t, u, q)
    if (rest) out.push(rest)
  }
  // La page d'attente et la fiche « Pour lire plus de thèmes »
  for (const w of ['vide', 'en-cours', 'sans-avis'] as const)
    for (const n of [1, 2, 15]) out.push(T.waitText(w, 22, n, false), T.waitText(w, 22, n, true), T.waitCta(w, n))
  for (const n of [0, 1, 7, 22]) out.push(T.waitCount(n, 22))
  for (const n of [1, 2, 16]) out.push(T.thinLine(n), T.exampleRow(n))
  out.push(T.deeperLede(true), T.deeperLede(false))
  out.push(T.howWho(15, 0), ...M.methodIntro(5), M.methodWho(15, 7, 2, 4, true), M.methodWho(15, 0, 3, 3, false), M.methodChance(5), ...M.methodWorth(), M.methodBefore())
  // Le graphique « Domaine par domaine »
  for (const n of [1, 2, 17]) {
    out.push(...T.countNear(n), ...T.countApart(n), T.questionsCount(n), T.themesTogether(n + 1), T.othersUnknown(n), T.detailShow(n, 0), T.detailShow(n, n))
  }
  out.push(...T.NOTHING_CAUSES.flatMap(c => T.nothingAnywhere(c)))
  out.push(T.zonesLabel(5, 15), T.readWithFamily('Économie et travail'), T.sourceLink('23 août 2026'), T.sourceWho(15), T.COLORS_NOTE, ...allSummaries())
  out.push(T.HOW_COLOR, T.COLORS_CHANCE, ...T.HOW_MARKS)
  for (const a of [null, 0, 19.4, 19.6, 45, 79.6, 100]) for (const m of ['pres', 'loin', 'rien', 'inconnu'] as const) out.push(T.cellLabel('Droite', a, m))
  out.push(T.bothTitle(true), T.bothTitle(false), ...T.bothRow(true), ...T.bothRow(false))
  out.push(...allSentences(), ...allFacts())
  for (const s of subsets(axis.length)) out.push(T.groupLabel(axis, s))
  // Lignes rouges et priorités (lot 2)
  out.push(...allCrossLines(), T.rowMeta(1, true), T.rowMeta(4, true), T.rowMeta(4, false), ...M.methodCross(), M.METHOD_PRIORITY)
  // Ce qui pèse le plus (lot 3)
  out.push(...allWeighTexts(), M.methodWeigh(), M.METHOD_WEIGH)
  // Votre façon de répondre (lot 4)
  out.push(...allManners(), M.methodManner(axis.map(a => a.where)), M.METHOD_MANNER)
  return out
}

/** La phrase « Votre façon de répondre », des deux côtés, de la plus petite feuille à la banque entière */
const allManners = () => [false, true].flatMap(near => [[2, 2], [2, 3], [31, 41], [12, 12], [145, 163]].map(([k, n]) => T.manner(near, k!, n!)))

/** Les suites contiguës de blocs de l'axe, telles que la fiche les dit (where) */
const contiguous = () => subsets(axis.length).filter(s => segments(s).length === 1)

/**
 * Les phrases de « Ce qui pèse le plus » : chaque suite pour chaque suite de blocs, de un à sept candidats connus, tous
 * ceux que la grille y classe ou non (« connus ici »), k d'entre eux, avec ou sans compatibles, « ils en portent
 * d'autres » ou non ; le renvoi au détail, le détail, la règle
 */
function allWeighTexts(): string[] {
  const out: string[] = []
  for (const seg of contiguous()) {
    const where = T.where(axis, seg)
    for (const n of [1, 2, 3, 4, 7])
      for (const size of [n, n + 2])
        for (let k = 1; k <= n; k++) {
          const base = { size, known: n, main: 0, compatible: 0, rejects: 0, others: true }
          out.push(W.weighWho(where, { ...base, suite: 'principale', main: k }))
          for (const m of [1, 2]) if (k + m <= n) out.push(W.weighWho(where, { ...base, suite: 'principale', main: k, compatible: m }))
          out.push(W.weighWho(where, { ...base, suite: 'compatible', compatible: k }), W.weighWho(where, { ...base, suite: 'rejet', rejects: k }))
        }
    for (const n of [1, 3])
      for (const size of [n, n + 1]) for (const others of [true, false]) out.push(W.weighWho(where, { suite: 'aucun', size, known: n, main: 0, compatible: 0, rejects: 0, others }))
    out.push(W.weighFor(where))
    for (const count of [1, 3]) for (const also of [true, false]) out.push(W.weighAlso(where, count, also))
  }
  out.push(W.weighElsewhere([T.where(axis, [1]), T.where(axis, [3])]), W.weighElsewhere([T.where(axis, [0]), T.where(axis, [2]), T.where(axis, [4])]))
  out.push(W.weighAlso(T.whereAll(axis, [0, 3, 4]), 4, true), W.weighPartsLead(1), W.weighPartsLead(2), W.weighRest(2.4), W.weighRest(-1.6))
  for (const x of [-12.4, -1, 0, 0.4, 1, 18.6]) out.push(W.points(x))
  for (const [v, r] of [[1, false], [-1, false], [-1, true]] as const) out.push(W.weighView(v, r))
  out.push(W.quoted('Ramener l’âge légal à 60 ans à taux plein, sans allonger la durée de cotisation'), W.HOW_WEIGH, W.WEIGH_TITLE)
  return out
}

/**
 * Les thèmes d'une ligne de famille, tels que la croix les cite : un ou plusieurs, et de vrais noms de la banque qui
 * contiennent déjà « et » ou une virgule
 */
const CROSS_THEMES = [null, ['Europe'], ['Retraites', 'Logement'], ['Salaires et travail'], ['Territoires et services publics', 'Agriculture, alimentation et animaux'], ['Retraites', 'Industrie et entreprises', 'Salaires et travail']]

/** Les phrases de la croix des lignes rouges : un nom ou plusieurs, « franchit », « pourrait franchir » ou les deux, thèmes */
function allCrossLines(): string[] {
  const out: string[] = []
  for (const names of [['Florian Philippot'], ['Nathalie Arthaud', 'Selma Labib'], ['Nathalie Arthaud', 'Anasse Kazib', 'Selma Labib']])
    for (const possible of [false, true]) for (const count of [1, 2, 3]) for (const themes of CROSS_THEMES) out.push(T.crossLine(names, possible, count, themes))
  return out
}

describe('accords', () => {
  it('au singulier et au pluriel, nombre et nom soudés', () => {
    expect(T.onQuestions(1)).toBe(`sur 1${NB}question`)
    expect(T.onQuestions(2)).toBe(`sur 2${NB}questions`)
    expect(T.nothingLine(1)).toBe(`Rien de net${NB}: 1${NB}thème`)
    expect(T.nothingLine(3)).toBe(`Rien de net${NB}: 3${NB}thèmes`)
    expect(T.familyHead(5)).toBe('Les 5 thèmes ensemble')
    expect(T.waitCount(0, 22)).toBe('question sur 22')
    expect(T.waitCount(1, 22)).toBe('question sur 22')
    expect(T.waitCount(7, 22)).toBe('questions sur 22')
    expect(T.waitCta('en-cours', 1)).toBe(`Continuer${NB}: 1${NB}question`)
    expect(T.waitCta('en-cours', 15)).toBe(`Continuer${NB}: 15${NB}questions`)
    expect(T.waitCta('vide', 22)).toBe('Commencer la feuille')
    expect(T.waitCta('sans-avis', 0)).toBe('Relire la feuille')
    expect(T.waitText('en-cours', 22, 15, false)).toBe(
      `La lecture s’affiche au bout des 22${NB}questions du questionnaire rapide, avec le dépouillement complet${NB}: encore 15${NB}questions.`,
    )
    expect(T.waitText('en-cours', 22, 1, false)).toMatch(new RegExp(`encore 1${NB}question\\.$`))
    expect(T.waitText('en-cours', 22, 1, true)).toBe(`Une question a été ajoutée au questionnaire rapide depuis vos réponses${NB}: la lecture s’affiche de nouveau une fois cette question vue.`)
    expect(T.waitText('en-cours', 22, 2, true)).toBe(`2${NB}questions ont été ajoutées au questionnaire rapide depuis vos réponses${NB}: la lecture s’affiche de nouveau une fois ces questions vues.`)
    expect(T.waitText('vide', 22, 22, false)).toBe(
      `La lecture se fait sur vos réponses${NB}: elle s’affiche au bout des 22${NB}questions du questionnaire rapide, avec le dépouillement complet.`,
    )
    // Aucun pronom sans antécédent en tête de phrase ni après « le questionnaire rapide »
    for (const [w, l, a] of [['vide', 22, false], ['en-cours', 15, false], ['en-cours', 1, true], ['en-cours', 2, true]] as const)
      expect(/(^|: )il /i.test(T.waitText(w, 22, l, a)), T.waitText(w, 22, l, a)).toBe(false)
    // Tout vu, aucun avis qui compte : passées, vues sans avis, ou à revoir ; la phrase ne dit pas « passé » à qui a tout à revoir
    expect(T.waitText('sans-avis', 22, 0, false)).toBe(
      `Aucune de vos réponses ne donne encore d’avis qui compte${NB}: la lecture se fait sur vos «${NB}d’accord${NB}» et vos «${NB}pas d’accord${NB}», hors questions passées et questions à revoir.`,
    )
    expect(T.waitText('sans-avis', 22, 0, false)).not.toMatch(/repère|Vous avez passé/)
    expect(T.thinLine(1)).toBe(`Sur une seule question${NB}: 1${NB}thème`)
    expect(T.thinLine(16)).toBe(`Sur une seule question${NB}: 16${NB}thèmes`)
    expect(T.unplaced(1, false)).toMatch(/^Un de vos accords sur ce thème porte sur une approche qui n’est/)
    expect(T.unplaced(3, true)).toMatch(/^3 de vos accords sur ces thèmes portent sur des approches qui ne sont/)
    expect(T.gap(65, 23, 'pres')).toBe(`+42${NB}points, nettement plus près`)
    expect(T.gap(30, 45, 'loin')).toBe(`−15${NB}points, nettement plus loin`)
    expect(T.gap(30, 31, 'rien')).toBe(`−1${NB}point`)
    expect(T.pct(64.6)).toBe(`65${NB}%`)
  })

  it('la note du détail et la Méthode disent la méthode sans tirage : le nombre de façons à la française, jamais un tirage', () => {
    // Le nombre de façons, tel que la page peut le dire (UnitReading.ways) : exact jusqu'à cent mille, au-delà en mots
    expect(T.chanceNote(true, 15_750)).toBe(
      `Avec vos mêmes avis, autrement placés${NB}: la moyenne du même calcul pour les 15${NB}750${NB}façons de poser vos mêmes avis sur les approches de chaque question, la vôtre comprise${NB}; «${NB}nettement plus près${NB}» ou «${NB}nettement plus loin${NB}» quand une sur dix au plus fait un écart aussi marqué, avec un bloc ou un autre.`,
    )
    expect(T.chanceNote(true, 100_000)).toContain(`les 100${NB}000${NB}façons`)
    expect(T.chanceNote(true, 36)).toContain(`les 36${NB}façons`)
    expect(T.chanceNote(true, 1)).toMatch(/que d’une seule façon, la vôtre\u00a0; rien à comparer\.$/)
    expect(T.chanceNote(true, 15_750)).not.toMatch(/prudente/)
    const bound = T.chanceNote(false, Number.POSITIVE_INFINITY)
    expect(bound).toContain('pour toutes les façons (plus de cent mille) de poser vos mêmes avis')
    expect(bound).toMatch(/Au-delà de cent mille façons, cette part se calcule bloc par bloc, puis s’additionne\u00a0: une borne prudente, qui peut manquer une lecture, jamais en inventer une\.$/)
    expect(ECHIQUIER.COUNT_MAX).toBe(100_000)
    for (const s of [T.chanceNote(true, 15_750), bound, T.chanceNote(false, 3888), M.methodChance(5), M.METHOD_REGIMES]) {
      expect(s, s).not.toMatch(/tirés au (hasard|sort)|hasard|placés au|\d\.\d|e\+|Infinity|NaN|999/)
    }
    // La Méthode : compter jusqu'à cent mille, calculer au-delà, rien de tiré au sort ; l'avant et l'après
    expect(M.METHOD_REGIMES).toMatch(/^Jusqu’à cent mille façons de poser vos mêmes avis, la page les compte toutes, une à une/)
    expect(M.METHOD_REGIMES).toContain('une borne prudente, qui peut manquer une lecture que ferait le compte complet, jamais en inventer une')
    expect(M.methodChance(5)).toContain(`Rien n’est tiré au sort${NB}: mêmes réponses, même lecture.`)
    expect(M.methodChance(5)).toContain(`«${NB}Nettement${NB}»${NB}: une de ces façons sur dix au plus atteint un tel écart, avec un bloc ou un autre.`)
    // La page passe le nombre que la note peut dire, jamais N brut (arrangements, qui peut valoir 10²⁵) ; le tableau du
    // détail est un fichier à part, chargé à son ouverture (ui/profile/ProfileDetail.tsx)
    const page = readFileSync(join(ROOT, 'src/ui/profile/ProfileDetail.tsx'), 'utf8')
    expect(page).toContain('T.chanceNote(unit.exact, unit.ways)')
    expect(page).not.toMatch(/chanceNote\([^)]*arrangements/)
    // Le compte d'un bloc, sous sa ligne du détail, seulement quand tout a été compté
    expect(page).toContain('unit.exact && c.alike !== null')
  })

  it('le détail : combien de façons, et combien rapprochent (ou éloignent) au moins autant de ce bloc, la vôtre comprise', () => {
    expect(T.detailWhy(252, 6, 'pres')).toBe(`Vos mêmes avis pouvaient se poser de 252${NB}façons sur ces approches${NB}; 6, dont la vôtre, rapprochent au moins autant de ce bloc.`)
    expect(T.detailWhy(97_200, 1_234, 'loin')).toBe(`Vos mêmes avis pouvaient se poser de 97${NB}200${NB}façons sur ces approches${NB}; 1${NB}234, dont la vôtre, éloignent au moins autant de ce bloc.`)
    expect(T.detailWhy(252, 1, 'pres')).toBe(`Vos mêmes avis pouvaient se poser de 252${NB}façons sur ces approches${NB}; seule la vôtre rapproche autant de ce bloc.`)
    expect(T.DETAIL_HEADS[3]).toBe('Avec vos mêmes avis, autrement placés')
  })
})

describe('le graphique « Domaine par domaine »', () => {
  it('le compte de tête, ce qui n’a pas compté, les plis, les lignes : accords au singulier et au pluriel, nombre et nom soudés', () => {
    expect(T.CHART_TITLE).toBe('Domaine par domaine')
    // C0 : les sujets nets, puis leurs noms (posés par la page), puis la fin du compte
    expect(T.countNear(3).join('')).toBe(`Sur 3${NB}sujets, vos réponses se rapprochent nettement d’un bloc${NB}: `)
    expect(T.countNear(1).join('')).toBe(`Sur 1${NB}sujet, vos réponses se rapprochent nettement d’un bloc${NB}: `)
    expect(T.countNear(7)[1]).toBe(`7${NB}sujets`)
    expect(T.COUNT_NAMES).toBe(5)
    expect(T.countEnd(0)).toBe('.')
    expect(T.countEnd(-3)).toBe('.')
    expect(T.countEnd(1)).toBe(` et 1${NB}autre.`)
    expect(T.countEnd(2)).toBe(` et 2${NB}autres.`)
    // C6 : seulement des écarts
    expect(T.countApart(1).join('')).toBe(`Sur aucun sujet, vos réponses ne se rapprochent nettement d’un bloc de la grille${NB}; sur 1${NB}sujet, elles s’écartent nettement d’au moins un${NB}: `)
    expect(T.countApart(1)[1]).toBe('aucun sujet')
    // Ce qui n'a pas compté : chaque part seulement si elle compte quelque chose
    expect(T.countRest(0, 10, 8, 0, 4)).toBe(`Rien de net sur 10${NB}sujets, 8${NB}thèmes sur une seule question${NB}; 4${NB}questions sans avis ou à revoir ne comptent pas.`)
    expect(T.countRest(2, 1, 0, 1, 1)).toBe(`Seulement plus loin sur 2${NB}sujets, rien de net sur 1${NB}sujet, 1${NB}thème faute de candidats connus${NB}; 1${NB}question sans avis ou à revoir ne compte pas.`)
    expect(T.countRest(0, 0, 0, 0, 3)).toBe(`3${NB}questions sans avis ou à revoir ne comptent pas.`)
    expect(T.countRest(0, 0, 0, 0, 0)).toBeNull()
    expect(T.questionsCount(1)).toBe(`1${NB}question`)
    expect(T.questionsCount(5)).toBe(`5${NB}questions`)
    // Le nom lu d'une ligne de famille reprend son libellé visible, « Les 4 thèmes ensemble » (WCAG 2.5.3)
    expect(T.themesTogether(4)).toBe('les 4 thèmes ensemble')
    expect(T.themesTogether(4).toLocaleLowerCase('fr')).toBe(T.familyHead(4).toLocaleLowerCase('fr'))
    expect(T.othersUnknown(1)).toBe('(1 autre, position inconnue ici)')
    expect(T.othersUnknown(2)).toBe('(2 autres, position inconnue ici)')
    // Le tableau : ses thèmes, et leurs domaines entiers quand il y en a
    expect(T.detailShow(31, 6)).toBe('Afficher le détail des 31 thèmes et de leurs domaines')
    expect(T.detailShow(3, 0)).toBe('Afficher le détail des 3 thèmes')
    expect(T.detailShow(1, 0)).toBe('Afficher le détail du thème')
    expect(T.zonesLabel(5, 15)).toBe('Les cinq blocs de la grille du ministère de l’Intérieur, de l’extrême gauche à l’extrême droite, et les 15 candidats classés qu’elle y range')
    expect(T.readWithFamily('Économie et travail')).toBe(`Lu avec les autres thèmes de son domaine${NB}: «${NB}Économie et travail${NB}».`)
    expect(T.sourceLink('23 août 2026')).toBe('circulaire du 23 août 2026')
    // Les intertitres des groupes d'un domaine (ceux des maquettes validées), et depuis le 17 octobre 2026 celui des
    // lectures nettes d'un seul côté, qui ne nomme aucun bloc
    expect(T.GROUP_TITLE).toEqual({ net: 'Nettement plus près', apart: 'Seulement plus loin', flat: 'Rien de net', thin: 'Sur une seule question', unknown: 'Faute de candidats connus' })
    expect(T.GROUP_TITLE.net).not.toMatch(/gauche|droite|centre|extrême|bloc/i)
    // La fiche « Pour lire plus de thèmes » : repliée, ce qu'elle reprend ; ouverte, ses thèmes
    expect(T.deeperCount(3, 8, true)).toBe(`3${NB}sans réponse, 8${NB}sur une seule question`)
    expect(T.deeperCount(0, 8, true)).toBe(`8${NB}sur une seule question`)
    expect(T.deeperCount(2, 5, false)).toBe(`7${NB}thèmes`)
    expect(T.deeperLede(true)).toBe(`Après le questionnaire rapide, la lecture se fait par domaine${NB}: il faut au moins deux questions pour lire un thème seul.`)
    // Les couleurs : l'échelle d'affinité du site, jamais celle d'un bloc ; aucun nom de couleur de bloc
    expect(T.COLORS_NOTE).toBe(
      `Les couleurs sont celles de l’échelle d’affinité du site, de «${NB}très éloigné${NB}» à «${NB}très proche${NB}»${NB}: votre affinité moyenne avec les candidats de chaque bloc, sur chaque sujet, et non la couleur d’un bloc de la grille.`,
    )
    expect(T.COLORS_NOTE).not.toMatch(/vert|orang|rouge|jaune|bleu/)
    expect(T.HINT_TOUCH).toMatch(/^Touchez /)
    expect(T.HINT_CLICK).toMatch(/^Cliquez /)
  })

  it('le chapeau : une lecture, pas un conseil de vote ; le classement est dans Résultats ; ce qui reste sur l’appareil, comme dans la Méthode', () => {
    expect(`${T.LEDE} ${T.LEDE_VOTE.join('')}`).toBe(
      `Vos réponses sur l’échiquier, thème par thème${NB}: se rapprochent-elles nettement des candidats qu’une grille officielle range à gauche, au centre ou à droite${NB}? Une lecture, pas un conseil de vote${NB}: le classement est dans Résultats`,
    )
    expect(T.PRIVACY).toBe(M.METHOD_PRIVACY)
    expect(T.PRIVACY).toMatch(/^Calcul sans IA, sur votre appareil/)
    expect(T.PRIVACY).toContain('rien n’est enregistré ni envoyé')
  })

  it('l’affichage dédié (D1) : des constats, la seule cause dite étant celle que le calcul rend certaine', () => {
    // C1 : une seule question
    expect(T.unitSentence(axis, reading('une-question'))).toBe(`Sur une seule question, la page ne conclut pas${NB}: il en faut deux pour lire un thème. Ces couleurs donnent seulement votre affinité.`)
    // C2 : rien de net, le thème ou le domaine
    expect(T.unitSentence(axis, reading('aucun'))).toBe(
      `Rien de net${NB}: sur ce thème, vos réponses ne se distinguent pas assez des autres façons de poser vos mêmes avis, quelle que soit la couleur des cases.`,
    )
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'famille'))).toContain('sur ce domaine, vos réponses')
    // Un bloc s'écarte nettement des autres façons, mais reste trop près de 50 % : la phrase toujours vraie, sans cause
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'theme', undefined, 252, true))).toBe(
      `Rien de net${NB}: sur ce thème, vos réponses ne se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc, quelle que soit la couleur des cases.`,
    )
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'famille', undefined, 252, true))).not.toMatch(/distinguent/)
    // C2 bis : moins de dix façons ; une seule
    expect(T.MIN_WAYS).toBe(10)
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'theme', undefined, 6))).toBe(
      `Rien de net${NB}: vos mêmes avis ne pouvaient se poser que de 6${NB}façons sur ces questions, trop peu pour conclure (il en faut au moins dix).`,
    )
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'theme', undefined, 10))).toMatch(/^Rien de net\u00a0: sur ce thème/)
    expect(T.unitSentence(axis, reading('aucun', [], [], [], 'theme', undefined, 1))).toBe(
      `Rien de net${NB}: vos mêmes avis ne pouvaient se poser que d’une seule façon sur ces questions, la vôtre${NB}; rien à comparer.`,
    )
    // C3 : blocs inconnus, sans cause ajoutée
    expect(T.unitSentence(axis, reading('blocs-inconnus', [], [], [0, 4]))).toBe(
      `Pas de lecture nette${NB}: la position des candidats que la grille classe à l’extrême gauche et à l’extrême droite n’est pas connue sur vos questions de ce thème.`,
    )
    // C5 : rien de net nulle part, banque et questionnaire rapide (la cause certaine, à la place de « C'est fréquent ») ;
    // « ne se distinguent pas assez » seulement quand c'est vrai de chaque sujet, sinon rien de plus (ui/profile/rows.ts)
    expect(T.nothingAnywhere('alike').join('')).toBe(
      `Sur aucun sujet, vos réponses ne se rapprochent ni ne s’écartent nettement d’un bloc${NB}: elles ne se distinguent pas assez des autres façons de poser vos mêmes avis.`,
    )
    expect(T.nothingAnywhere('quick').join('')).toBe(
      `Sur aucun sujet, vos réponses ne se rapprochent ni ne s’écartent nettement d’un bloc. Après le seul questionnaire rapide, la plupart des thèmes n’ont qu’une question${NB}: la lecture se fait par domaine.`,
    )
    expect(T.nothingAnywhere('few').join('')).toBe(
      'Sur aucun sujet, vos réponses ne se rapprochent ni ne s’écartent nettement d’un bloc. Là où la page les compare, vos mêmes avis ne pouvaient se poser que de trop peu de façons pour conclure (il en faut au moins dix).',
    )
    expect(T.nothingAnywhere(null).join('')).toBe('Sur aucun sujet, vos réponses ne se rapprochent ni ne s’écartent nettement d’un bloc.')
    expect(T.NOT_CENTRE).toBe(`Ce n’est pas une place au centre${NB}: la page ne fait pas de moyenne entre les blocs.`)
    expect(T.YOUR_RANKING.join('')).toBe(`Votre classement${NB}: Résultats`)
    // C5 bis, C9
    expect(T.NOTHING_TESTABLE).toBe(`Pas encore de sujet à lire${NB}: il faut deux questions sur un même thème, ou deux thèmes répondus dans un même domaine.`)
    expect(T.UNIFORM).toBe(
      `Sur chaque question, vos réponses donnent le même avis à toutes les approches${NB}: il n’y a qu’une façon de poser ces avis, la vôtre, donc rien à comparer. Les couleurs donnent seulement votre affinité.`,
    )
    // Jamais « c'est fréquent », jamais une cause sur la personne
    for (const t of [...T.NOTHING_CAUSES.flatMap(c => T.nothingAnywhere(c)), T.NOT_CENTRE, T.NOTHING_TESTABLE, T.UNIFORM, ...allSentences()]) {
      expect(/fréquent|vous n’avez pas|vous avez trop|parce que vous|votre faute/i.test(t), t).toBe(false)
    }
  })

  it('« Comment c’est calculé » : huit points au plus (le reste est dans la Méthode), et l’exemple dit le bon compte', () => {
    const code = readFileSync(join(ROOT, 'src/ui/profile/Chart.tsx'), 'utf8')
    const calc = code.slice(code.indexOf('<details class="calc">'), code.indexOf('</details>', code.indexOf('<details class="calc">')))
    const top = calc.replace(/<ol class="calc-example">[\s\S]*?<\/ol>/, '')
    expect((top.match(/<li[ >]/g) ?? []).length).toBeLessThanOrEqual(8)
    expect(T.HOW_EXAMPLE).toHaveLength(5)
    // 5! / (1! 1! 3!) = 20 ; 20 × 20 = 400 ; une sur dix au plus : 40
    expect(T.HOW_EXAMPLE.join(' ')).toMatch(/20\u00a0façons.*400\u00a0façons.*40 de ces 400\u00a0façons/)
    expect(T.HOW_NETTEMENT).toBe(
      `Nettement${NB}: posés de toutes les façons possibles sur les approches de chaque question, la vôtre comprise, vos mêmes avis font un tel écart une fois sur dix au plus, avec un bloc ou un autre.`,
    )
    expect(T.HOW_MIN).toContain('Quand aucun thème d’un domaine ne se lit seul, le domaine entier est lu.')
  })

  it('« aux deux bouts » seulement à l’extrême gauche et à l’extrême droite à la fois ; sinon « des deux côtés »', () => {
    expect(T.bothTitle(true)).toBe('Aux deux bouts à la fois')
    expect(T.bothTitle(false)).toBe('Des deux côtés à la fois')
    expect(T.bothRow(true)[0]).toBe('Aux deux bouts à la fois. ')
    expect(T.bothRow(false)[0]).toBe('Des deux côtés à la fois. ')
    expect(T.bothRow(false)[0]).not.toMatch(/bouts/)
    // La même phrase dans les deux cas : vraie dès que les blocs ▲ sont de part et d'autre du centre, sans lui
    expect(T.bothRow(false)[1]).toBe(T.bothRow(true)[1])
    expect(T.bothRow(true)[1]).toMatch(/des deux côtés de la grille/)
    // Le détail : la phrase de la maquette validée (15 octobre 2026)
    expect(T.DETAIL_INTRO).toBe(
      `Pour chaque bloc${NB}: votre affinité moyenne avec ses candidats, la même moyenne pour les autres façons de poser vos mêmes avis, et l’écart. Puis, dans la page, chaque candidat et chaque question.`,
    )
  })

  it('le nom d’une ligne pour les lecteurs d’écran : chaque bloc de la grille, son palier et sa lecture nette en mots', () => {
    expect(T.rowSummary(labels, 'Défense', T.questionsCount(5), reading('lecture', [0], [1], [], 'theme', [88, 30, 50, 61, 12]))).toBe(
      `Défense, 5${NB}questions. Selon la grille${NB}: Extrême gauche, très proche, nettement plus près${NB}; Gauche, éloigné, nettement plus loin${NB}; Centre, mitigé${NB}; Droite, proche${NB}; Extrême droite, très éloigné.`,
    )
    expect(T.rowSummary(labels, 'Retraites', T.questionsCount(3), reading('ecarts', [], [2], [], 'theme', [55, 55, 20, 60, 60]))).toBe(
      `Retraites, 3${NB}questions. Selon la grille${NB}: Extrême gauche, mitigé${NB}; Gauche, mitigé${NB}; Centre, éloigné, nettement plus loin${NB}; Droite, proche${NB}; Extrême droite, proche.`,
    )
    expect(T.rowSummary(labels, 'Numérique', T.questionsCount(2), reading('aucun', [], [], [2]))).toBe(
      `Numérique, 2${NB}questions. Selon la grille${NB}: Extrême gauche, mitigé${NB}; Gauche, mitigé${NB}; Centre, inconnu${NB}; Droite, mitigé${NB}; Extrême droite, mitigé. Rien de net.`,
    )
    expect(T.rowSummary(labels, 'Culture', T.questionsCount(1), reading('une-question'))).toMatch(/\. Une seule question\u00a0: pas de lecture nette\.$/)
    expect(T.rowSummary(labels, 'Économie', T.questionsCount(9), reading('blocs-inconnus', [], [], [3, 4]))).toMatch(/Droite, inconnu\u00a0; Extrême droite, inconnu\. Pas de lecture nette\.$/)
  })

  it('les cases : le palier du site, en minuscules, aux mêmes bornes que « Par thème » ; la lecture nette en mots', () => {
    expect([0, 19.4, 19.6, 39.4, 40, 59.4, 60, 79.4, 79.6, 100].map(T.palier)).toEqual([
      'très éloigné',
      'très éloigné',
      'éloigné',
      'éloigné',
      'mitigé',
      'mitigé',
      'proche',
      'proche',
      'très proche',
      'très proche',
    ])
    expect(T.palier(null)).toBe('inconnu')
    expect(T.cellLabel('Droite', 64, 'pres')).toBe(`Droite (grille du ministère de l’Intérieur)${NB}: proche, nettement plus près`)
    expect(T.cellLabel('Centre', 52, 'rien')).toBe(`Centre (grille du ministère de l’Intérieur)${NB}: mitigé`)
    expect(T.cellLabel('Centre', null, 'inconnu')).toBe(`Centre (grille du ministère de l’Intérieur)${NB}: inconnu`)
    expect(T.netWord('rien')).toBeNull()
    // Les paliers et leurs bornes, tels que les donne « Comment c'est calculé »
    expect(T.HOW_COLOR).toBe(
      `La couleur d’une case donne votre affinité moyenne avec les candidats du bloc, selon les paliers du site${NB}: très proche (80 à 100${NB}%), proche (60 à 79${NB}%), mitigé (40 à 59${NB}%), éloigné (20 à 39${NB}%), très éloigné (0 à 19${NB}%).`,
    )
    // Ce que la couleur ne dit pas : « nettement » ; la façon de répondre (les deux paliers de chaque côté, les bouts
    // compris : c'est eux que donne une façon de répondre tranchée ; tout approuver, tout désapprouver, mesurés le 15
    // octobre 2026), l'accord des candidats d'un bloc, sans comparer des blocs par leur taille (l'écart ne se mesure
    // pas) ; une lecture nette peut tomber sur « mitigé »
    expect(T.COLORS_CHANCE).toMatch(/^La couleur seule ne dit pas «.nettement.»/)
    expect(T.COLORS_CHANCE).toContain(`Qui approuve beaucoup voit le plus souvent «${NB}proche${NB}» et «${NB}très proche${NB}»`)
    expect(T.COLORS_CHANCE).toContain(`qui désapprouve beaucoup «${NB}éloigné${NB}» et «${NB}très éloigné${NB}»`)
    expect(T.COLORS_CHANCE).toContain(`tout approuver colore 97${NB}cases sur 100 en «${NB}très proche${NB}», tout désapprouver 96 sur 100 en «${NB}très éloigné${NB}»`)
    expect(T.COLORS_CHANCE).toMatch(/quand ils ne pensent pas pareil, elle est moins tranchée/)
    expect(T.COLORS_CHANCE).not.toMatch(/quatre|un bloc de deux|surtout|presque/)
    expect(T.COLORS_CHANCE).toContain('Seules les lectures nettes comparent vos réponses aux autres façons de poser vos mêmes avis')
    expect(T.COLORS_CHANCE).toMatch(/une lecture nette peut tomber sur une case «.mitigé.»\.$/)
  })
})

describe('formes des blocs', () => {
  it('une suite contiguë : un bloc, deux blocs, trois et plus', () => {
    expect(T.where(axis, [3])).toBe('à droite')
    expect(T.where(axis, [0, 1])).toBe('à l’extrême gauche et à gauche')
    expect(T.where(axis, [1, 2, 3])).toBe('de la gauche à la droite')
    expect(T.where(axis, [2, 3, 4])).toBe('du centre à l’extrême droite')
    expect(T.where(axis, [0, 1, 2, 3, 4])).toBe('de l’extrême gauche à l’extrême droite')
  })

  it('des blocs quelconques : une seule énumération, jamais deux « et » (« à gauche, au centre et à l’extrême droite »)', () => {
    expect(T.whereAll(axis, [3])).toBe('à droite')
    expect(T.whereAll(axis, [0, 1])).toBe('à l’extrême gauche et à gauche')
    expect(T.whereAll(axis, [1, 2, 4])).toBe('à gauche, au centre et à l’extrême droite')
    expect(T.whereAll(axis, [0, 1, 3, 4])).toBe('à l’extrême gauche, à gauche, à droite et à l’extrême droite')
    expect(T.whereAll(axis, [0, 2, 3, 4])).toBe('à l’extrême gauche et du centre à l’extrême droite')
    for (const x of subsets(axis.length)) expect((T.whereAll(axis, x).match(/ et /g) ?? []).length, T.whereAll(axis, x)).toBeLessThanOrEqual(1)
    // La phrase des blocs inconnus (C3), qui la prend
    expect(T.unitSentence(axis, reading('blocs-inconnus', [], [], [1, 2, 4]))).toBe(
      `Pas de lecture nette${NB}: la position des candidats que la grille classe à gauche, au centre et à l’extrême droite n’est pas connue sur vos questions de ce thème.`,
    )
  })

  it('les libellés de la synthèse : capitale initiale ; les deux bords', () => {
    expect(T.groupLabel(axis, [3])).toBe('À droite')
    expect(T.groupLabel(axis, [0, 1])).toBe('À l’extrême gauche et à gauche')
    expect(T.groupLabel(axis, [2, 3, 4])).toBe('Du centre à l’extrême droite')
    expect(T.groupLabel(axis, [0, 4])).toBe('À la fois à l’extrême gauche et à l’extrême droite')
    expect(T.groupLabel(axis, [0, 2, 4])).toBe('À la fois à l’extrême gauche, au centre et à l’extrême droite')
  })

  it('les phrases d’une lecture, d’un côté et des deux bords ; un bloc inconnu au milieu coupe la suite', () => {
    expect(T.unitSentence(axis, reading('lecture', [3]))).toBe('Vos réponses se rapprochent nettement des candidats que la grille classe à droite.')
    expect(T.unitSentence(axis, reading('lecture', [0, 4]))).toBe(
      'Vos réponses se rapprochent nettement, à la fois, des candidats que la grille classe à l’extrême gauche et de ceux qu’elle classe à l’extrême droite.',
    )
    expect(T.unitSentence(axis, reading('lecture', [0, 2, 4]))).toBe(
      'Vos réponses se rapprochent nettement, à la fois, des candidats que la grille classe à l’extrême gauche, de ceux qu’elle classe au centre et de ceux qu’elle classe à l’extrême droite.',
    )
    expect(T.unitSentence(axis, reading('lecture', [1, 3], [], [2]))).toContain('à la fois, des candidats que la grille classe à gauche et de ceux qu’elle classe à droite.')
    expect(T.unitSentence(axis, reading('lecture', [1], [3]))).toBe(
      'Vos réponses se rapprochent nettement des candidats que la grille classe à gauche. Elles s’écartent nettement de ceux qu’elle classe à droite.',
    )
    expect(T.unitSentence(axis, reading('blocs-inconnus', [], [], [3, 4], 'famille'))).toBe(
      `Pas de lecture nette${NB}: la position des candidats que la grille classe à droite et à l’extrême droite n’est pas connue sur vos questions de ce domaine.`,
    )
    // « Rien de net » ne nomme pas la grille : la phrase qui suit la nomme, sans pronom
    expect(T.unitSentence(axis, reading('aucun', [], [], [2]))).toBe(
      `Rien de net${NB}: sur ce thème, vos réponses ne se distinguent pas assez des autres façons de poser vos mêmes avis, quelle que soit la couleur des cases. La position des candidats que la grille classe au centre n’est pas connue ici${NB}: la lecture se fait sans eux.`,
    )
  })

  it('le fait « sur une seule question » : bloc par bloc, chacun avec ses porteurs', () => {
    expect(T.oneQuestion(axis, null)).toBeNull()
    expect(T.oneQuestion(axis, [[], [], [], [], []])).toBe('Ce que vous y approuvez n’est l’approche principale d’aucun candidat classé.')
    expect(T.oneQuestion(axis, [[], ['A'], [], ['B', 'C'], []])).toBe(
      'Ce que vous y approuvez est l’approche principale de candidats que la grille classe à gauche (A) et à droite (B, C).',
    )
    expect(T.oneQuestion(axis, [[], [], [], ['B'], []])).toBe('Ce que vous y approuvez est l’approche principale d’un candidat que la grille classe à droite (B).')
    // Plusieurs accords, tous portés
    expect(T.oneQuestion(axis, [[], ['A'], [], ['B'], []], 2, 0)).toBe(
      'Ce que vous y approuvez, ce sont les approches principales de candidats que la grille classe à gauche (A) et à droite (B).',
    )
    // Des accords que personne ne porte : la phrase ne les prête pas aux porteurs des autres
    expect(T.oneQuestion(axis, [[], ['A'], [], ['B', 'C'], []], 1, 1)).toBe(
      `Parmi ce que vous y approuvez, une approche est l’approche principale de candidats que la grille classe à gauche (A) et à droite (B, C)${NB}; l’autre n’est l’approche principale d’aucun candidat classé.`,
    )
    expect(T.oneQuestion(axis, [[], [], [], ['B'], []], 2, 3)).toBe(
      `Parmi ce que vous y approuvez, 2 approches sont les approches principales d’un candidat que la grille classe à droite (B)${NB}; les autres ne sont l’approche principale d’aucun candidat classé.`,
    )
    expect(T.oneQuestion(axis, [[], [], [], [], []], 0, 2)).toBe('Ce que vous y approuvez n’est l’approche principale d’aucun candidat classé.')
  })
})

describe('règles d’écriture', () => {
  const sentences = [...allSentences(), ...allFacts()]
  const BLOC = /extrême gauche|extrême droite|à gauche|à droite|au centre|de la gauche|de la droite|du centre/i

  it('chaque phrase qui nomme un bloc l’attribue à la grille ; « qu’elle » vient toujours après « la grille »', () => {
    const chart = [
      T.zonesLabel(5, 15),
      T.BOTH_ROW.join(''),
      T.bothRow(false).join(''),
      T.KEY_TEXT,
      T.COLORS_NOTE,
      T.COLORS_CHANCE,
      T.countNear(3).join(''),
      T.countApart(2).join(''),
      ...T.NOTHING_CAUSES.flatMap(c => T.nothingAnywhere(c)),
      T.NOTHING_TESTABLE,
      T.UNIFORM,
    ]
    const texts = [
      ...sentences,
      ...M.methodWorth(),
      M.methodBefore(),
      ...M.methodCross(),
      M.METHOD_CROSS_WHERE,
      M.METHOD_PRIORITY,
      M.METHOD_WEIGH,
      M.methodWeigh(),
      M.METHOD_MANNER,
      M.methodManner(axis.map(a => a.where)),
      ...allWeighTexts(),
      ...allManners(),
      ...allSummaries(),
      ...chart,
    ]
    for (const s of texts) {
      if (BLOC.test(s)) expect(/la grille/.test(s), s).toBe(true)
      for (const m of s.matchAll(/qu’elle classe/g)) expect(s.slice(0, m.index).includes('la grille'), s).toBe(true)
    }
    // La seule phrase qui dit « au centre » sans la grille le nie : une absence de lecture n'est pas une place
    expect(T.NOT_CENTRE.replace(/^Ce n’est pas une place au centre/, '')).not.toMatch(BLOC)
  })

  it('les libellés de la synthèse se lisent sous son titre, qui nomme la grille', () => {
    expect(T.SUMMARY_TITLE).toMatch(/d’un bloc de la grille$/)
    for (const x of subsets(axis.length)) expect(`${T.SUMMARY_TITLE} : ${T.groupLabel(axis, x)}`).toMatch(/de la grille : [ÀAD]/)
  })

  it('le sujet est « vos réponses » (ou ce que vous approuvez), jamais la personne', () => {
    for (const s of allSentences().filter(x => /rapprochent|écartent/.test(x))) expect(/Vos réponses|vos réponses/.test(s), s).toBe(true)
    for (const s of [T.BOTH_ROW[1], T.bothRow(false)[1], T.countNear(3).join(''), T.countApart(1).join(''), ...T.NOTHING_CAUSES.map(c => T.nothingAnywhere(c).join('')), T.UNIFORM, ...allManners()])
      expect(/Vos réponses|vos réponses/.test(s), s).toBe(true)
    // La Méthode aussi : ce sont des réponses qui sont lues, pas une personne
    for (const s of M.methodWorth()) {
      expect(/personne|quelqu’un/.test(s), s).toBe(false)
      if (/lues/.test(s)) expect(/réponses/.test(s), s).toBe(true)
    }
  })

  it('aucun « % » dans la synthèse ni dans les phrases d’unité', () => {
    for (const s of [...sentences, T.SUMMARY_TITLE, T.SUMMARY_NOTE, ...subsets(axis.length).map(x => T.groupLabel(axis, x))]) expect(s, s).not.toContain('%')
    // Le graphique non plus : les pourcentages ne paraissent que dans « Le détail » et la liste d'une ligne ouverte
    const chart = [...allSummaries(), T.KEY_TEXT, ...T.BOTH_ROW, ...T.bothRow(false), T.BLOC_NOTE, T.COLORS_NOTE, ...T.countNear(7), ...T.countApart(7), T.countRest(1, 2, 3, 4, 5)!]
    for (const s of [...chart, ...T.NOTHING_CAUSES.flatMap(c => T.nothingAnywhere(c)), T.NOT_CENTRE, T.NOTHING_TESTABLE, T.UNIFORM, ...Object.values(T.GROUP_TITLE), ...allManners()]) expect(s, s).not.toContain('%')
  })

  it('aucun symbole de lecture : ni ▲ ni ▽ ni point, dans les textes du module comme dans ceux de la page ; seul « ? » reste', () => {
    for (const t of allTexts()) expect(/[▲▽△▼·]/.test(t), t).toBe(false)
    for (const file of PAGE_FILES) {
      const code = readFileSync(join(ROOT, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
      expect(/[▲▽△▼]/.test(code), file).toBe(false)
    }
    expect(T.UNKNOWN_GLYPH).toBe('?')
  })

  it('aucun mot d’étiquette, dans les textes du module comme dans ceux de la page', () => {
    // « en tête » au sens du classement ; « À garder en tête », le titre des mises en garde, n'en est pas
    const FORBIDDEN = [/vous êtes/i, /êtes de/i, /votre camp/i, /votre bord/i, /(?<!garder )en tête/i, /gagnant/i, /score de gauche/i, /% de gauche/i, /% de droite/i]
    // « profil » n'est permis que dans le nom de la page, « Mon profil politique » (décision du propriétaire du 12 octobre 2026)
    const check = (where: string, text: string) => {
      for (const re of FORBIDDEN) expect(re.test(text), `${where} : ${re} dans « ${text.slice(0, 120)} »`).toBe(false)
      expect(/profil/i.test(text.replace(/Mon profil politique/g, '')), `${where} : « profil » hors du nom de la page dans « ${text.slice(0, 120)} »`).toBe(false)
    }
    for (const t of allTexts()) check('echiquierCopy', t)
    // Les fichiers de la page, sans leurs commentaires : leurs textes sont du JSX ou des chaînes
    for (const file of PAGE_FILES) {
      const code = readFileSync(join(ROOT, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter(l => !/^\s*\/\//.test(l))
        .join('\n')
      const texts = [...code.matchAll(/'([^'\n]*)'|`([^`]*)`|>([^<>{}\n]+)</g)].map(m => m[1] ?? m[2] ?? m[3] ?? '').filter(t => /[a-zà-ÿ]{3}/i.test(t))
      // Les noms de composants et de fichiers ne sont pas des textes : seule la phrase compte
      const phrases = texts.filter(x => !/^\.{0,2}\//.test(x))
      expect(phrases.length, file).toBeGreaterThan(3)
      for (const t of phrases) check(file, t.replace(/ProfileMethod|ProfileDiagram|profile/g, ''))
    }
  })

  /** Les textes des fichiers de la page et de sa rubrique, sans leurs commentaires : du JSX ou des chaînes */
  const pageTexts = (file: string) => {
    const code = readFileSync(join(ROOT, file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter(l => !/^\s*\/\//.test(l))
      .join('\n')
    return [...code.matchAll(/'([^'\n]*)'|`([^`]*)`|"([^"\n]*)"|>([^<>{}\n]+)</g)].map(m => m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').filter(t => /[a-zà-ÿ]{3}/i.test(t))
  }

  it('plus jamais « hasard » pour dire la comparaison (D2), ni « placés au hasard », dans les textes comme dans la page', () => {
    for (const t of allTexts()) expect(/hasard/i.test(t), t).toBe(false)
    for (const file of PAGE_FILES) for (const t of pageTexts(file)) expect(/hasard/i.test(t), `${file} : « ${t.slice(0, 120)} »`).toBe(false)
    // Les feuilles de la calibration : « des feuilles remplies par un programme, sans suivre aucun candidat »
    for (const t of [T.SUMMARY_NOTE, T.caveats(15)[2]!, M.methodWorth()[1], M.methodBefore()]) expect(t, t).toContain('feuilles remplies par un programme')
  })

  it('aucun mot de qualité, et rien qui situe la personne : ni « surtout », ni « fragile », ni « solide », ni « presque »', () => {
    const FORBIDDEN = [/\bsurtout\b/i, /fragile/i, /solide/i, /presque/i, /vous êtes au centre/i, /modéré/i, /incohéren/i, /personne ne vous représente/i, /c’est fréquent/i, /dans l’autre sens/i]
    for (const t of allTexts()) for (const re of FORBIDDEN) expect(re.test(t), `${re} dans « ${t.slice(0, 120)} »`).toBe(false)
    for (const file of PAGE_FILES) for (const t of pageTexts(file)) for (const re of FORBIDDEN) expect(re.test(t), `${file} : ${re} dans « ${t.slice(0, 120)} »`).toBe(false)
  })

  it('les espaces insécables du site : avant « : ; ? ! », dans les guillemets, devant « % »', () => {
    for (const t of allTexts()) {
      expect(/ [:;?!»]/.test(t), `espace ordinaire avant une ponctuation haute : « ${t} »`).toBe(false)
      expect(/« /.test(t), `espace ordinaire après « : « ${t} »`).toBe(false)
      expect(/\d %/.test(t), `espace ordinaire devant % : « ${t} »`).toBe(false)
    }
  })
})

describe('lignes rouges et priorités (lot 2)', () => {
  it('la croix : les phrases des maquettes validées, au singulier et au pluriel, « pourrait franchir », les thèmes d’une ligne de famille', () => {
    expect(T.crossLine(['Nathalie Arthaud', 'Selma Labib'], false, 1, null)).toBe('Nathalie Arthaud et Selma Labib franchissent une de vos lignes rouges sur ce sujet.')
    expect(T.crossLine(['Florian Philippot'], false, 1, null)).toBe('Florian Philippot franchit une de vos lignes rouges sur ce sujet.')
    expect(T.crossLine(['Florian Philippot'], true, 1, null)).toBe('Florian Philippot pourrait franchir une de vos lignes rouges sur ce sujet.')
    expect(T.crossLine(['Nathalie Arthaud', 'Selma Labib'], true, 2, null)).toBe(`Nathalie Arthaud et Selma Labib pourraient franchir 2${NB}de vos lignes rouges sur ce sujet.`)
    expect(T.crossLine(['Jean-Luc Mélenchon'], false, 2, null)).toBe(`Jean-Luc Mélenchon franchit 2${NB}de vos lignes rouges sur ce sujet.`)
    // Une ligne de famille : le thème de ces lignes rouges, entre guillemets comme readWithFamily
    expect(T.crossLine(['Florian Philippot'], false, 1, ['Europe'])).toBe(`Florian Philippot franchit une de vos lignes rouges sur ce sujet («${NB}Europe${NB}»).`)
    expect(T.crossLine(['Florian Philippot'], false, 2, ['Retraites', 'Logement'])).toBe(`Florian Philippot franchit 2${NB}de vos lignes rouges sur ce sujet («${NB}Retraites${NB}» et «${NB}Logement${NB}»).`)
    expect(T.crossLine(['Jean-Luc Mélenchon'], false, 2, ['Territoires et services publics', 'Agriculture, alimentation et animaux'])).toBe(
      `Jean-Luc Mélenchon franchit 2${NB}de vos lignes rouges sur ce sujet («${NB}Territoires et services publics${NB}» et «${NB}Agriculture, alimentation et animaux${NB}»).`,
    )
    // Les vrais noms de thèmes contiennent souvent « et » ou une virgule : entre guillemets, on les compte et on les
    // retrouve tels quels, quel que soit leur nombre
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const real = pack.bank.topics.map(t => t.label)
    expect(real.filter(l => / et |, /.test(l)).length).toBeGreaterThan(1)
    for (const themes of [real.slice(0, 2), real.slice(0, 3), real.filter(l => / et |, /.test(l)).slice(0, 4)]) {
      const t = T.crossLine(['Jean-Luc Mélenchon'], false, themes.length, themes)
      const inParens = t.slice(t.indexOf(' (') + 2, -2)
      expect([...inParens.matchAll(/«\u00a0(.+?)\u00a0»/g)].map(m => m[1]), t).toEqual(themes)
    }
    expect(T.CROSS_LABEL).toBe('ligne rouge franchie')
    // Jamais un mot de lecture, de couleur ni de palier : la croix ne dit rien d'un bloc
    for (const t of allCrossLines()) {
      expect(/nettement|proche|éloigné|mitigé|grille|bloc|rouge foncé/.test(t.replace(/lignes rouges/g, '')), t).toBe(false)
      expect(t, t).toMatch(/ sur ce sujet( \(.+\))?\.$/)
    }
  })

  it('le détail : « Franchie par », à part ce qui « pourrait » l’être ; la priorité, qui compte double dans le classement, pas ici', () => {
    expect(T.CROSSED_BY).toBe(`Franchie par${NB}:`)
    expect(T.MAYBE_CROSSED_BY).toBe(`Pourrait être franchie par${NB}:`)
    expect(T.PRIORITY_DETAIL).toBe(`Votre priorité${NB}: ce thème compte double dans votre classement, pas dans cette lecture.`)
  })

  it('prioritaire : le seul mot qu’une ligne fermée reçoit en plus, dans son nom lu aussi ; « Dont vos priorités » dans la fiche', () => {
    expect(T.PRIORITY).toBe('prioritaire')
    expect(T.rowMeta(4, true)).toBe(`4${NB}questions, prioritaire`)
    expect(T.rowMeta(1, true)).toBe(`1${NB}question, prioritaire`)
    expect(T.rowMeta(4, false)).toBe(T.questionsCount(4))
    expect(T.rowSummary(labels, 'Logement', T.rowMeta(4, true), reading('aucun'))).toMatch(/^Logement, 4\u00a0questions, prioritaire\. Selon la grille\u00a0: /)
    expect(T.DEEPER_PRIO).toBe(`Dont vos priorités${NB}:`)
  })

  it('l’étiquette IA de la page : les approches vérifiées comme le dit la Méthode, sans renvoi à des sources que la page ne cite pas', () => {
    const code = readFileSync(join(ROOT, 'src/ui/components/AiLabel.tsx'), 'utf8')
    const lead = code.match(/approches: \{ lead: '([^']+)'/)?.[1]
    const what = code.match(/approches:\s*\n\s*'([^']+)'/)?.[1]
    // « par IA » soudé : « IA » ne commence jamais seul une ligne
    expect(lead).toBe('Approches rédigées et positions résumées par\\u00a0IA')
    // Les approches : une IA, au regard du principe de neutralité, et des tests qui refusent tout nom de candidat
    // (Method.tsx) ; seules les positions sont vérifiées contre leurs sources, citées dans « Qui porte quoi »
    expect(what).toContain('Les approches des questions ont été rédigées par une IA')
    expect(what).toContain('au regard du principe de neutralité, et par des tests qui refusent tout nom de candidat')
    expect(what).toContain('Qui porte quoi')
    expect(what).not.toMatch(/les unes et les autres|approches[^.]*contre ces sources/)
    // La fin de la note : un point, comme pour la feuille, sans « chaque source est citée »
    expect(code).toMatch(/const check = kind === 'feuille' \|\| kind === 'texte' \|\| kind === 'approches' \? '\.'/)
  })

  it('« Comment c’est calculé » et la Méthode : les mêmes mots pour ce que la croix ne change pas ; les priorités, une règle', () => {
    expect(T.HOW_CROSS).toBe(M.HOW_CROSS)
    expect(T.HOW_CROSS).toBe(`La croix d’une ligne rouge ne change ni la couleur, ni la lecture, ni l’ordre${NB}: votre ligne rouge y compte déjà comme un «${NB}pas d’accord${NB}».`)
    // Une règle, vraie même pour qui n'a choisi aucune priorité : « les priorités », jamais « vos priorités »
    expect(T.HOW_PRIORITY).toBe(
      `Les priorités comptent double dans votre classement, pas ici${NB}; et chaque bloc est la moyenne de ses candidats${NB}: cette lecture peut donc différer de votre classement.`,
    )
    // Dans la Méthode, « ici » serait la Méthode : la règle nomme la page
    expect(M.METHOD_PRIORITY).toBe(
      `Les priorités comptent double dans votre classement, pas sur la page «${NB}Mon profil politique${NB}»${NB}; et chaque bloc y est la moyenne de ses candidats${NB}: sa lecture peut donc différer de votre classement.`,
    )
    expect(M.METHOD_PRIORITY).not.toMatch(/\bici\b|Vos priorités/)
    // Un seul point de plus au plus : le huitième, et la Méthode les reprend
    const code = readFileSync(join(ROOT, 'src/ui/profile/MethodSection.tsx'), 'utf8')
    for (const x of ['T.METHOD_CROSS_WHERE', 'T.HOW_CROSS', 'T.METHOD_PRIORITY', 'T.methodCross()']) expect(code, x).toContain(x)
    expect(code).not.toContain('T.HOW_PRIORITY')
  })

  it('la Méthode publie la neutralité de la croix bloc par bloc, avec et sans le candidat (D5), et « pourrait franchir » bloc par bloc', () => {
    const C = M.ECHIQUIER_CROSS
    const [text, possible] = M.methodCross()
    // L'effectif qui fonde un verdict (§ 2.0 de l'étude : 30 ne donnent qu'une indication)
    expect(C.clones).toBeGreaterThanOrEqual(60)
    expect(text).toContain(`(${C.clones} feuilles par candidat)`)
    const dec = (x: number) => String(x).replace('.', ',')
    const span = (lo: number, hi: number) => `${dec(lo)} à ${dec(hi)}${NB}%`
    const KEYS = ['random', 'neighbour', 'other'] as const
    // Sur la banque, puis au seul questionnaire rapide : chaque fourchette, avec et sans le candidat
    for (const C2 of [C, C.quick])
      for (const k of KEYS) {
        expect(text).toContain(span(C2[k].withMin, C2[k].withMax))
        expect(text).toContain(span(C2[k].withoutMin, C2[k].withoutMax))
        expect(C2[k].withMin).toBeLessThanOrEqual(C2[k].withMax)
        expect(C2[k].withoutMin).toBeLessThanOrEqual(C2[k].withoutMax)
      }
    // Sur la banque, l'écart entre blocs le plus large reste sous la référence du même passage, et c'est dit
    const widest = (C2: typeof C | typeof C.quick, ks: readonly (typeof KEYS)[number][]) =>
      Math.max(...ks.flatMap(k => [C2[k].withMax - C2[k].withMin, C2[k].withoutMax - C2[k].withoutMin]))
    expect(C.gapMax).toBeLessThan(Math.min(...C.reference))
    expect(widest(C, KEYS)).toBeLessThanOrEqual(C.gapMax + 0.05)
    expect(text).toContain(`de ${dec(C.gapMax)} points au plus, restent sous celui des lectures nettes elles-mêmes (${dec(C.reference[0])} points avec le candidat, ${dec(C.reference[1])} sans lui)`)
    // Au rapide : les deux scénarios qui passent, sous la référence ; le bloc voisin, non établi avec et sans le candidat
    expect(widest(C.quick, ['random', 'other'])).toBeLessThanOrEqual(C.quick.gapMax + 0.05)
    expect(C.quick.gapMax).toBeLessThan(Math.min(...C.quick.reference))
    expect(text).toContain(`des écarts de ${dec(C.quick.gapMax)} points au plus, sous ceux des lectures nettes (${dec(C.quick.reference[0])} et ${dec(C.quick.reference[1])} points, avec et sans lui)`)
    expect(text).toContain(`un écart de ${dec(C.quick.neighbourGap[0])} points (${dec(C.quick.neighbourGap[1])} sans lui) qui n’est pas établi`)
    expect(text).toContain('la mesure ne permet de dire ni qu’il reste sous celui des lectures nettes, ni qu’il le dépasse')
    // « Pourrait franchir » : sur la banque entière, puis au rapide ; bloc par bloc, avec et sans le candidat, non établi ; sa cause
    expect(possible).toContain(`«${NB}Pourrait franchir${NB}» fait de ${span(C.possible[0], C.possible[1])} des noms cités selon les cas sur la banque entière, de ${span(C.possibleQuick[0], C.possibleQuick[1])} après le seul questionnaire rapide`)
    const pb = C.possibleBlocs
    const pq = C.possibleBlocsQuick
    expect(possible).toContain(`de ${dec(pb.low)}${NB}% sous celui que la grille classe ${pb.lowWhere} à ${dec(pb.high)}${NB}% sous celui qu’elle classe ${pb.highWhere} (${span(pb.withoutLow, pb.withoutHigh)} sans le candidat)`)
    expect(possible).toContain(`au rapide, de ${dec(pq.low)}${NB}% sous celui qu’elle classe ${pq.lowWhere} à ${dec(pq.high)}${NB}% sous celui qu’elle classe ${pq.highWhere} (${span(pq.withoutLow, pq.withoutHigh)} sans lui)`)
    expect(possible).toContain('Ces écarts ne sont pas établis non plus.')
    expect(possible).toContain(`elles en font ${dec(C.deduced.low)}${NB}% chez les candidats que la grille classe ${C.deduced.lowWhere}, ${dec(C.deduced.high)}${NB}% chez ceux qu’elle classe ${C.deduced.highWhere}`)
    // Ni « sur de », ni « hasard » : les lignes rouges « ne visent personne »
    for (const t of [text, possible]) expect(t).not.toMatch(/sur de |hasard/)
    expect(text).toContain('quand ces lignes rouges ne visent personne')
    expect(text).toContain(`parmi les «${NB}pas d’accord${NB}» des réponses recopiées`)
  })

  it('la part des positions déduites, ou de confiance basse, que la Méthode publie : celle des données, bloc par bloc', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const shares = panelOf(pack).map(ids => {
      let n = 0
      let k = 0
      for (const id of ids)
        for (const pos of Object.values(pack.positions[id] ?? {})) {
          const level = dealbreakerLevel(pos)
          if (level) n++
          if (level === 'possible') k++
        }
      return Math.round((1000 * k) / n) / 10
    })
    const D = M.ECHIQUIER_CROSS.deduced
    expect(Math.min(...shares)).toBe(D.low)
    expect(Math.max(...shares)).toBe(D.high)
    // À droite la plus basse, à l'extrême gauche la plus haute (les libellés publiés)
    expect(shares.indexOf(D.low)).toBe(3)
    expect(shares.indexOf(D.high)).toBe(0)
  })
})

describe('ce qui pèse le plus dans cette lecture (lot 3)', () => {
  const where = (seg: number[]) => T.where(axis, seg)
  const w = (suite: 'principale' | 'compatible' | 'rejet' | 'aucun', known: number, k: number, extra: Partial<{ compatible: number; others: boolean; size: number }> = {}) => ({
    suite,
    size: extra.size ?? known,
    known,
    main: suite === 'principale' ? k : 0,
    compatible: suite === 'compatible' ? k : (extra.compatible ?? 0),
    rejects: suite === 'rejet' ? k : 0,
    others: extra.others ?? true,
  })

  it('les quatre suites des maquettes validées, en nombres, sans aucun nom', () => {
    expect(W.WEIGH_TITLE).toBe('Ce qui pèse le plus dans cette lecture')
    expect(W.weighWho(where([0]), w('principale', 4, 2, { compatible: 1 }))).toBe(`Approche principale de 2${NB}des 4${NB}candidats que la grille classe à l’extrême gauche${NB}; compatible pour 1${NB}autre.`)
    expect(W.weighWho(where([4]), w('principale', 3, 2))).toBe(`Approche principale de 2${NB}des 3${NB}candidats que la grille classe à l’extrême droite.`)
    expect(W.weighWho(where([2]), w('compatible', 2, 1))).toBe(`Approche compatible pour 1${NB}des 2${NB}candidats que la grille classe au centre.`)
    expect(W.weighWho(where([3]), w('rejet', 3, 2))).toBe(`2${NB}des 3${NB}candidats que la grille classe à droite rejettent cette approche.`)
    expect(W.weighWho(where([1]), w('aucun', 3, 0))).toBe(`Aucun des 3${NB}candidats que la grille classe à gauche ne porte cette approche${NB}: ils en portent d’autres.`)
  })

  it('un seul, tous, un candidat connu ; « ils en portent d’autres » seulement quand c’est vrai ; une suite de blocs', () => {
    expect(W.weighWho(where([0]), w('principale', 4, 1, { compatible: 2 }))).toBe(`Approche principale d’un des 4${NB}candidats que la grille classe à l’extrême gauche${NB}; compatible pour 2${NB}autres.`)
    expect(W.weighWho(where([3]), w('principale', 3, 3))).toBe(`Approche principale des 3${NB}candidats que la grille classe à droite.`)
    expect(W.weighWho(where([2]), w('principale', 1, 1))).toBe('Approche principale du candidat que la grille classe au centre.')
    expect(W.weighWho(where([1]), w('compatible', 3, 3))).toBe(`Approche compatible pour les 3${NB}candidats que la grille classe à gauche.`)
    expect(W.weighWho(where([2]), w('compatible', 1, 1))).toBe('Approche compatible pour le candidat que la grille classe au centre.')
    expect(W.weighWho(where([3]), w('rejet', 3, 1))).toBe(`Un des 3${NB}candidats que la grille classe à droite rejette cette approche.`)
    expect(W.weighWho(where([3]), w('rejet', 3, 3))).toBe(`Les 3${NB}candidats que la grille classe à droite rejettent cette approche.`)
    expect(W.weighWho(where([3]), w('rejet', 1, 1))).toBe('Le candidat que la grille classe à droite rejette cette approche.')
    expect(W.weighWho(where([1]), w('aucun', 3, 0, { others: false }))).toBe(`Aucun des 3${NB}candidats que la grille classe à gauche ne porte cette approche.`)
    expect(W.weighWho(where([1]), w('aucun', 1, 0))).toBe(`Le candidat que la grille classe à gauche ne porte pas cette approche${NB}: il en porte d’autres.`)
    expect(W.weighWho(where([1]), w('aucun', 1, 0, { others: false }))).toBe('Le candidat que la grille classe à gauche ne porte pas cette approche.')
    expect(W.weighWho(where([0, 1]), w('principale', 7, 1, { compatible: 4 }))).toBe(`Approche principale d’un des 7${NB}candidats que la grille classe à l’extrême gauche et à gauche${NB}; compatible pour 4${NB}autres.`)
    // Jamais « 1 des », « 3 des 3 », ni « 0 » : chaque nombre se dit comme il se lit
    for (const t of allWeighTexts()) expect(/(^|[^\d])(0|1)\u00a0des|\b(\d+)\u00a0des \3\u00a0/.test(t.replace(/pour 1\u00a0des/g, '')), t).toBe(false)
  })

  it('un candidat du bloc sans position sur le sujet : la phrase ne compte que les connus, et le dit (« connus ici »)', () => {
    // Les 3 candidats que la grille classe à gauche, dont un inconnu sur le sujet : jamais « des 2 candidats que la grille
    // classe à gauche », qui dirait qu'elle n'en classe que deux là
    expect(W.weighWho(where([1]), w('compatible', 2, 2, { size: 3 }))).toBe(`Approche compatible pour les 2${NB}candidats connus ici que la grille classe à gauche.`)
    expect(W.weighWho(where([0]), w('principale', 2, 2, { size: 4 }))).toBe(`Approche principale des 2${NB}candidats connus ici que la grille classe à l’extrême gauche.`)
    expect(W.weighWho(where([0, 1]), w('principale', 6, 1, { size: 7 }))).toBe(`Approche principale d’un des 6${NB}candidats connus ici que la grille classe à l’extrême gauche et à gauche.`)
    expect(W.weighWho(where([3]), w('principale', 3, 2, { size: 4, compatible: 1 }))).toBe(`Approche principale de 2${NB}des 3${NB}candidats connus ici que la grille classe à droite${NB}; compatible pour 1${NB}autre.`)
    expect(W.weighWho(where([3]), w('rejet', 3, 1, { size: 4 }))).toBe(`Un des 3${NB}candidats connus ici que la grille classe à droite rejette cette approche.`)
    expect(W.weighWho(where([3]), w('rejet', 2, 2, { size: 3 }))).toBe(`Les 2${NB}candidats connus ici que la grille classe à droite rejettent cette approche.`)
    expect(W.weighWho(where([1]), w('aucun', 2, 0, { size: 3 }))).toBe(`Aucun des 2${NB}candidats connus ici que la grille classe à gauche ne porte cette approche${NB}: ils en portent d’autres.`)
    // Un seul connu parmi plusieurs : « le seul candidat connu ici », jamais « le candidat » (la grille en classe plusieurs là)
    expect(W.weighWho(where([2]), w('principale', 1, 1, { size: 2 }))).toBe('Approche principale du seul candidat connu ici que la grille classe au centre.')
    expect(W.weighWho(where([4]), w('compatible', 1, 1, { size: 3 }))).toBe('Approche compatible pour le seul candidat connu ici que la grille classe à l’extrême droite.')
    expect(W.weighWho(where([3]), w('rejet', 1, 1, { size: 4 }))).toBe('Le seul candidat connu ici que la grille classe à droite rejette cette approche.')
    expect(W.weighWho(where([1]), w('aucun', 1, 0, { size: 3 }))).toBe(`Le seul candidat connu ici que la grille classe à gauche ne porte pas cette approche${NB}: il en porte d’autres.`)
    expect(W.weighWho(where([1]), w('aucun', 1, 0, { size: 3, others: false }))).toBe('Le seul candidat connu ici que la grille classe à gauche ne porte pas cette approche.')
    // Tous connus : jamais « connus ici » ; et « connus ici » n'est jamais dit d'un seul candidat sans « seul »
    for (const n of [1, 2, 3]) expect(W.weighWho(where([1]), w('principale', n, 1, { size: n }))).not.toContain('connu')
    for (const t of allWeighTexts()) expect(t.replace(/seul candidat connu ici/g, ''), t).not.toMatch(/candidat connu ici/)
  })

  it('les points du détail font exactement l’écart du tableau (méthode du plus fort reste)', () => {
    // 11,81 + 16,67 + 5,56 + 5,83 = 39,86 : chacune arrondie ferait 41 pour un écart de 39 au tableau (71 % − 32 %)
    expect(W.apportion([11.81, 16.67, 5.56, 5.83, 0], 39)).toEqual([12, 16, 5, 6, 0])
    expect(W.apportion([36.4, 16.6, 0], 52)).toEqual([36, 16, 0])
    // Vers le haut aussi, et des parts négatives ; une part nulle (le reste sans position incertaine) le reste
    expect(W.apportion([20.2, -3.4, 12.3, 0], 30)).toEqual([20, -3, 13, 0])
    expect(W.apportion([10.5, 10.5], 20)).toEqual([10, 10])
    expect(W.apportion([10.4, 10.4], 21)).toEqual([11, 10])
    expect(W.apportion([12, 8], 20)).toEqual([12, 8])
    // Un reste de l'écart : il compte comme une part
    expect(W.apportion([30.3, 9.3, 0.4], 40)).toEqual([30, 9, 1])
  })

  it('votre avis en entier, l’approche entre guillemets ; le renvoi au détail, ce qu’il donne, la part de chaque question', () => {
    expect(T.YOUR_VIEW).toBe(`Votre avis${NB}:`)
    expect([W.weighView(1, false), W.weighView(-1, false), W.weighView(-1, true)]).toEqual(['d’accord', 'pas d’accord', 'pas d’accord, ligne rouge'])
    expect(W.quoted('Ramener l’âge légal à 60 ans à taux plein, sans allonger la durée de cotisation')).toBe(`«${NB}Ramener l’âge légal à 60 ans à taux plein, sans allonger la durée de cotisation${NB}»`)
    expect(W.weighElsewhere([where([1]), where([3])])).toBe('Le détail le donne pour les candidats que la grille classe à gauche, puis pour ceux qu’elle classe à droite.')
    expect(W.weighElsewhere([where([0]), where([2]), where([4])])).toBe('Le détail le donne pour les candidats que la grille classe à l’extrême gauche, pour ceux qu’elle classe au centre, puis pour ceux qu’elle classe à l’extrême droite.')
    expect(W.weighFor(where([0, 1]))).toBe(`Pour les candidats que la grille classe à l’extrême gauche et à gauche${NB}:`)
    // Dans le détail seulement : « Aussi… » quand l'approche est déjà principale dans la fiche, sinon sans « Aussi »
    expect(W.weighAlso(T.whereAll(axis, [3, 4]), 3, true)).toBe('Aussi approche principale de candidats que la grille classe à droite et à l’extrême droite.')
    expect(W.weighAlso(where([1]), 1, false)).toBe('Approche principale d’un candidat que la grille classe à gauche.')
    expect(W.weighPartsLead(1)).toMatch(/^Part de chaque question dans l’écart avec les autres façons de poser vos mêmes avis\u00a0: /)
    expect(W.weighPartsLead(2)).toMatch(/^Part de chaque question dans l’écart moyen de ces blocs avec /)
    expect([W.points(12.4), W.points(-3.2), W.points(0.4), W.points(1), W.points(-0.5)]).toEqual([`+12${NB}points`, `−3${NB}points`, `0${NB}point`, `+1${NB}point`, `0${NB}point`])
    expect(W.weighRest(2.4)).toBe(`Reste de l’écart, +2${NB}points${NB}: sur certaines questions, une position incertaine rend un candidat connu ou non selon la façon de poser vos avis.`)
  })

  it('« Comment c’est calculé » et la Méthode : la règle des maquettes, et ce que la fiche ne change pas', () => {
    expect(W.HOW_WEIGH).toBe(
      `Ce qui pèse le plus${NB}: la question dont vos avis, posés de toutes les autres façons sur ses approches, changent le plus votre affinité avec le bloc${NB}; puis, dans cette question, l’avis qui y compte le plus. Les approches vous ont été présentées sans nom de candidat${NB}: les rapprochements sont calculés ensuite.`,
    )
    expect(M.METHOD_WEIGH).toMatch(/^Sous une lecture nette, la ligne ouverte dit ce qui y pèse le plus\u00a0: /)
    expect(M.METHOD_WEIGH).toContain('en nombres, sans aucun nom')
    expect(M.METHOD_WEIGH).toContain('sans position incertaine, ces parts font exactement l’écart avec les autres façons de poser vos mêmes avis')
    expect(M.METHOD_WEIGH).toMatch(/Rien de cela ne change la couleur, la lecture ni l’ordre\.$/)
    // La page dit la règle une fois la fiche chargée, dans son point 2 : jamais un neuvième point
    const chart = readFileSync(join(ROOT, 'src/ui/profile/Chart.tsx'), 'utf8')
    // La règle ne paraît, et la fiche ne se charge, qu'une fois « Comment c'est calculé » ouvert (décision du 17 octobre 2026)
    expect(chart).toContain('{calc ? <HowWeigh /> : null}')
    expect(chart).toContain('return weigh && ` ${weigh.HOW_WEIGH}`')
    const section = readFileSync(join(ROOT, 'src/ui/profile/MethodSection.tsx'), 'utf8')
    for (const x of ['T.METHOD_WEIGH', 'T.methodWeigh()', '<strong>Ce qui pèse le plus.</strong>']) expect(section, x).toContain(x)
  })

  it('aucun nom de candidat, aucun « % », aucun mot de qualité dans la fiche ; chaque bloc attribué à la grille', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const names = pack.candidates.flatMap(c => [c.name, c.name.split(' ').slice(1).join(' ')]).filter(n => n.length > 3)
    const texts = allWeighTexts().filter(t => !t.startsWith('«'))
    for (const t of texts) {
      for (const n of names) expect(t.includes(n), `${n} dans « ${t} »`).toBe(false)
      expect(t, t).not.toContain('%')
      expect(/surtout|fragile|solide|presque|tire dans|hasard/i.test(t), t).toBe(false)
    }
    // Chaque phrase qui compte des candidats les attribue à la grille (la règle et le reste ne comptent personne)
    for (const t of texts.filter(x => /candidat/.test(x) && x !== W.HOW_WEIGH && !/^Reste/.test(x))) expect(t, t).toMatch(/que la grille classe/)
  })

  it('la Méthode publie la neutralité de la fiche bloc par bloc, avec et sans le candidat (D5)', () => {
    const P = M.ECHIQUIER_WEIGH
    const text = M.methodWeigh()
    const dec = (x: number) => String(x).replace('.', ',')
    expect(P.clones).toBeGreaterThanOrEqual(60)
    expect(text).toContain(`(${P.clones} feuilles par candidat)`)
    expect(text).toContain('elle paraît sous chacune des lectures nettes, quel que soit le bloc du candidat recopié')
    expect(text).toContain(
      `l’approche citée est l’approche principale de candidats du bloc dans ${dec(P.main.all)}${NB}% des fiches, de ${dec(P.main.low)}${NB}% pour un candidat recopié que la grille classe ${P.main.lowWhere} à ${dec(P.main.high)}${NB}% pour un candidat qu’elle classe ${P.main.highWhere}`,
    )
    expect(text).toContain(`(${dec(P.main.without)}${NB}%, de ${dec(P.main.withoutLow)} à ${dec(P.main.withoutHigh)}${NB}%, sans lui dans le calcul)`)
    expect(P.main.low).toBeLessThanOrEqual(P.main.all)
    expect(P.main.all).toBeLessThanOrEqual(P.main.high)
    expect(P.main.withoutLow).toBeLessThanOrEqual(P.main.without)
    // Les quatre suites font toutes les fiches, avec et sans le candidat (à l'arrondi près)
    expect(Math.abs(P.main.all + P.compatible.all + P.rejects.all + P.none.all - 100)).toBeLessThan(0.3)
    expect(Math.abs(P.main.without + P.compatible.without + P.rejects.without + P.none.without - 100)).toBeLessThan(0.3)
    // L'écart de l'approche principale avec le candidat : non établi, dit tel quel, et sous la référence ponctuellement
    expect(text).toContain(`sauf celui de l’approche principale avec le candidat, ${dec(P.mainGap)} points, que la mesure ne permet de dire ni sous celui des lectures nettes, ni au-dessus`)
    expect(P.mainGap).toBeLessThan(P.reference[0])
    expect(text).toContain(`(${dec(P.reference[0])} points avec le candidat, ${dec(P.reference[1])} sans lui)`)
    expect(text).toContain('ces deux écarts ne sont établis ni avec ni sans le candidat')
    // Ce que les écarts suivent en partie seulement (contre-vérification du lot 3 : l'extrême droite, aussi pauvre en
    // approches compatibles que le centre, en cite deux fois plus), la part des approches compatibles bloc par bloc ; et
    // la part de chaque candidat
    expect(text).toContain('Ces écarts ne suivent qu’en partie la part des approches compatibles')
    expect(text).not.toMatch(/Les écarts suivent/)
    expect(text).toContain(`de ${dec(P.compatibleShare.low)}${NB}% chez ceux que la grille classe ${P.compatibleShare.lowWhere} à ${dec(P.compatibleShare.high)}${NB}% chez ceux qu’elle classe ${P.compatibleShare.highWhere}`)
    expect(text).toContain(`son approche principale dans ${dec(P.cited[0])} à ${dec(P.cited[1])}${NB}% des fiches de son bloc`)
    expect(text).not.toMatch(/hasard|Infinity|NaN|\d\.\d/)
  })

  it('la part des approches compatibles, que la Méthode publie : celle des données, bloc par bloc', () => {
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const shares = panelOf(pack).map(ids => {
      let one = 0
      let all = 0
      for (const id of ids)
        for (const pos of Object.values(pack.positions[id] ?? {})) {
          const e = effectiveWeight(pos)
          if (e) all++
          if (e === 1) one++
        }
      return Math.round((1000 * one) / all) / 10
    })
    const C = M.ECHIQUIER_WEIGH.compatibleShare
    expect(Math.min(...shares)).toBe(C.low)
    expect(Math.max(...shares)).toBe(C.high)
    // À droite la plus basse, à gauche la plus haute (les libellés publiés)
    expect(shares.indexOf(C.low)).toBe(3)
    expect(shares.indexOf(C.high)).toBe(1)
  })
})

describe('votre façon de répondre (lot 4)', () => {
  const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
  const where = axis.map(a => a.where)
  const words = (s: string) => s.split(/\s+/).filter(w => /[\p{L}\d]/u.test(w)).length
  /** « à gauche », « à gauche ou à droite » : les blocs à égalité */
  const listOf = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ou ${xs.at(-1)}` : xs[0])

  it('la phrase des maquettes validées, des deux côtés : un constat chiffré sur la feuille, 25 mots au plus, sans titre', () => {
    expect(T.manner(false, 31, 41)).toBe(
      `Sur 31${NB}questions sur 41, vos réponses sont en majorité des «${NB}pas${NB}d’accord${NB}»${NB}: une case «${NB}éloigné${NB}», seule, dit peu${NB}; les lectures nettes en tiennent compte.`,
    )
    expect(T.manner(true, 12, 20)).toBe(
      `Sur 12${NB}questions sur 20, vos réponses sont en majorité des «${NB}d’accord${NB}»${NB}: une case «${NB}proche${NB}», seule, dit peu${NB}; les lectures nettes en tiennent compte.`,
    )
    for (const t of allManners()) {
      expect(words(t), t).toBeLessThanOrEqual(25)
      // Le sujet : vos réponses ; aucun bloc, aucun candidat, aucun pourcentage
      expect(t).toContain('vos réponses sont en majorité des')
      expect(/extrême|gauche|droite|centre|grille|%/i.test(t), t).toBe(false)
      for (const c of pack.candidates) expect(t).not.toContain(c.name.split(' ').slice(1).join(' '))
    }
  })

  it('la Méthode : la règle même de la page, ce qu’elle ne change pas', () => {
    expect(M.METHOD_MANNER).toContain(`sur 9 des cases mises à l’épreuve sur 10 au moins, la moyenne des autres façons de poser vos mêmes avis tombe à 39${NB}% ou moins (à 60${NB}% ou plus pour «${NB}proche${NB}»)`)
    expect(M.METHOD_MANNER).toContain('plus de la moitié de vos questions répondues')
    expect(M.METHOD_MANNER).toContain(`Seuls comptent les sujets où vos mêmes avis peuvent se poser d’une autre façon${NB}: jamais, donc, quand, sur chaque question, vos réponses donnent le même avis à toutes les approches`)
    expect(M.METHOD_MANNER).toMatch(/Elle ne change ni la couleur, ni la lecture, ni l’ordre\.$/)
    // Les seuils dits sont ceux du calcul (ui/profile/rows.ts, mannerOf)
    const rows = readFileSync(join(ROOT, 'src/ui/profile/rows.ts'), 'utf8')
    for (const x of ['if (c.chance === null || u.ways < 2) continue', 'if (m <= 39) far++', 'else if (m >= 60) near++', '10 * far >= 9 * cells && 2 * no > n', '10 * near >= 9 * cells && 2 * yes > n']) expect(rows).toContain(x)
  })

  it('la Méthode publie le taux d’affichage par façon de répondre, puis bloc par bloc, avec et sans le candidat (D5)', () => {
    const P = M.ECHIQUIER_MANNER
    const text = M.methodManner(where)
    const dec = (x: number) => String(x).replace('.', ',')
    expect(P.clones).toBeGreaterThanOrEqual(60)
    expect(text).toContain(`(${P.clones} feuilles par candidat)`)
    expect(text).toContain('feuilles remplies par un programme, sans suivre aucun candidat')
    expect(text).toContain(`sur ${dec(P.agreeOnly[0])}${NB}% de celles qui ne donnent que des «${NB}d’accord${NB}» (${dec(P.agreeOnly[1])}${NB}% après le seul questionnaire rapide)`)
    for (const [m, label] of [[P.bank, 'banque'], [P.quick, 'rapide']] as const) {
      const blocs: readonly number[] = m.blocs
      const lo = Math.min(...blocs)
      const hi = Math.max(...blocs)
      // Les blocs nommés sont ceux de la mesure : le plus bas (tous ceux qui le sont) et le plus haut
      expect(m.lowWhere, label).toBe(listOf(blocs.flatMap((x, b) => (x === lo ? [where[b]!] : []))))
      expect(m.highWhere, label).toBe(where[blocs.indexOf(hi)])
      expect(text).toContain(`de ${dec(lo)}${NB}% pour un candidat`)
      expect(text).toContain(`à ${dec(hi)}${NB}% pour un candidat qu’elle classe ${m.highWhere}`)
      expect(text).toContain(`(${dec(m.without)}${NB}%, de ${dec(Math.min(...m.withoutBlocs))} à ${dec(Math.max(...m.withoutBlocs))}${NB}%, sans lui`)
      expect(lo).toBeLessThanOrEqual(m.all)
      expect(m.all).toBeLessThanOrEqual(hi)
    }
    // Les écarts, non établis, dits tels quels ; la référence du même passage, celle de la croix (lot 2)
    expect(text).toContain(`Ces écarts entre blocs, de ${dec(P.gap[0])} points sur la banque entière (${dec(P.gap[1])} sans lui) et de ${dec(P.quickGap[0])} au rapide (${dec(P.quickGap[1])}), ne sont pas établis`)
    expect(P.reference).toEqual(M.ECHIQUIER_CROSS.reference)
    expect(P.quickReference).toEqual(M.ECHIQUIER_CROSS.quick.reference)
    expect(P.gap[0]).toBeCloseTo(Math.max(...P.bank.blocs) - Math.min(...P.bank.blocs), 1)
    expect(P.quickGap[0]).toBeCloseTo(Math.max(...P.quick.blocs) - Math.min(...P.quick.blocs), 1)
    // Dans cette mesure, la phrase paraît le plus pour les deux blocs que la grille classe aux extrêmes, qui comptent le plus
    // de « pas d'accord » ; un ordre entre blocs que la mesure n'établit pas (les intervalles se recouvrent), dit tel quel
    const ends = [0, axis.length - 1]
    for (const [shownBy, style] of [[P.bank.blocs, P.style], [P.quick.blocs, P.styleQuick]] as const) {
      const top2 = (xs: readonly number[]) => [...xs.keys()].sort((a, b) => xs[b]! - xs[a]!).slice(0, 2).sort()
      expect(top2(shownBy)).toEqual(ends)
      expect(top2(style)).toEqual(ends)
    }
    expect(text).toContain('Dans cette mesure, elle paraît le plus sur les réponses recopiées des candidats que la grille classe aux extrêmes, un ordre entre blocs que la mesure n’établit pas.')
    expect(text).not.toContain('Elle paraît le plus')
    // Ce qu'elle suit, feuille par feuille, puis dans un même bloc : plus de « pas d'accord », plus souvent la phrase
    const S = P.byShare
    expect(text).toContain(
      `Ce qu’elle suit, feuille par feuille, c’est la part des «${NB}pas d’accord${NB}» parmi les avis${NB}: sur la banque, elle paraît sur ${dec(S.bank[0])}${NB}% des feuilles qui en comptent moins de ${S.cut}${NB}% et sur ${dec(S.bank[1])}${NB}% des autres (${dec(S.quick[0])}${NB}% et ${dec(S.quick[1])}${NB}% au rapide)`,
    )
    for (const [below, above] of [S.bank, S.quick]) expect(below).toBeLessThan(above)
    const [bankWithin, quickWithin] = P.within
    expect(text).toContain(
      `dans un même bloc, elle peut paraître sur ${bankWithin[0]} feuilles sur ${P.clones} pour un candidat recopié et sur ${bankWithin[1]} pour un autre (${quickWithin[0]} et ${quickWithin[1]} au rapide)`,
    )
    // L'écart dans un même bloc tient dans ce que montrent les blocs : au plus toutes les feuilles d'un candidat
    for (const [hi, lo] of P.within) {
      expect(hi).toBeGreaterThan(lo)
      expect(hi).toBeLessThanOrEqual(P.clones)
    }
    expect(text).toContain('Bloc par bloc, cette part est la plus forte chez les candidats que la grille classe aux extrêmes')
    expect(text).not.toMatch(/hasard|Infinity|NaN|\d\.\d|undefined/)
  })

  it('la part des « pas d’accord » que la Méthode publie : celle des clones bruités, bloc par bloc (60 par candidat)', () => {
    const P = profilesFor(pack)
    for (const [only, seed, published] of [[undefined, 'n', M.ECHIQUIER_MANNER.style], [isQuick, 'nq', M.ECHIQUIER_MANNER.styleQuick]] as const) {
      const acc = axis.map(() => ({ no: 0, all: 0 }))
      for (const cid of P.ranked)
        for (let s = 0; s < M.ECHIQUIER_MANNER.clones; s++)
          for (const a of Object.values(P.toAnswers(P.noisy(P.cloneLarge(cid, only), `${seed}:${cid}:${s}`)))) {
            const v = Object.values(a.ratings)
            acc[P.blocOf(cid)]!.all += v.length
            acc[P.blocOf(cid)]!.no += v.filter(r => r < 0).length
          }
      expect(acc.map(x => Math.round((1000 * x.no) / x.all) / 10)).toEqual([...published])
    }
  })
})

describe('la rubrique de la Méthode : la comparaison, les deux régimes, l’avant et l’après', () => {
  it('publie la neutralité bloc par bloc, sans puis avec le candidat (D5)', () => {
    const [clones] = M.methodWorth()
    const P = M.ECHIQUIER_PUBLISHED
    expect(clones).toContain(`dans ${P.hitWithout}${NB}% des cas, de ${P.hitWithoutMin}${NB}% à ${P.hitWithoutMax}${NB}% selon le bloc`)
    expect(clones).toContain(`Avec lui, comme sur le site, c’est ${P.hitWith}${NB}%, de ${P.hitWithMin}${NB}% à ${P.hitWithMax}${NB}% selon le bloc.`)
  })

  it('dit l’avant et l’après le calcul sans tirage, sur les mêmes réponses (le propriétaire admet la borne prudente)', () => {
    const P = M.ECHIQUIER_PUBLISHED
    const B = M.ECHIQUIER_BEFORE
    // Republié le 15 octobre 2026 ; l'avant, avec les tirages sur les mêmes feuilles (audit à 1 000 profils et 30 clones
    // bruités ; les rapports, moyenne de six échantillons appariés)
    expect([P.hitWithout, P.hitWithoutMin, P.hitWithoutMax, P.randomThemesMax, P.randomPerProfileMax, P.oneChoiceRatio, P.oneChoiceRatioQuick]).toEqual([71, 44, 92, 8.5, 2.3, 1.7, 2.4])
    expect([B.hitWithout, B.hitWithoutMin, B.hitWithoutMax, B.randomThemesMax, B.randomPerProfileMax, B.oneChoiceRatio, B.oneChoiceRatioQuick]).toEqual([70, 44, 91, 9, 2.4, 1.6, 2.4])
    const text = M.methodBefore()
    expect(text).toMatch(/^Jusqu’au 15 octobre 2026, la page tirait au sort 999 de ces façons de poser vos avis\u00a0; depuis, elle n’en tire plus aucune\. Sur les mêmes réponses, avant puis après\u00a0:/)
    expect(text).toContain(`dans 70${NB}% puis 71${NB}% des cas, de 44${NB}% à 91${NB}% puis de 44${NB}% à 92${NB}% selon le bloc`)
    // « Au plus un sur onze » (9,1 %), avant (9 %) comme après (8,5 %) : jamais « un sur douze » (8,3 %), sous la part publiée
    expect(text).toContain('les feuilles remplies par un programme reçoivent toujours au plus une lecture sur un thème sur onze, et au plus 2,4 puis 2,3 lectures en moyenne sur l’ensemble')
    for (const x of [P.randomThemesMax, B.randomThemesMax]) expect(100 / 11).toBeGreaterThanOrEqual(x)
    expect(text).toContain('chacun des blocs que la grille classe aux extrêmes reçoit en moyenne 1,6 puis 1,7 fois plus de leurs lectures que celui qu’elle classe à gauche, toujours 2,4 fois après le seul questionnaire rapide')
    // L'écart qui s'élargit vient de la borne prudente : en comptant tout, il ne change pas (audit --count-max 2000000)
    expect(text).toMatch(
      /L’écart entre le bloc le mieux lu et le moins bien lu s’élargit donc d’un point\u00a0: c’est l’effet de la borne prudente, au-delà de cent mille façons\u00a0; en les comptant une à une, jusqu’à deux millions, il ne change pas\.$/,
    )
    expect(text).not.toMatch(/prix d’une lecture sans tirage/)
    // Des chiffres différents : « puis » ; les mêmes : « toujours »
    expect(M.methodBefore({ ...P, randomThemesMax: 5 } as unknown as typeof P)).toContain('reçoivent au plus une lecture sur un thème sur onze puis sur vingt, et au plus')
    expect(M.methodBefore(P, { ...B, randomPerProfileMax: 2.3 } as unknown as typeof B)).toContain('sur onze, et toujours au plus 2,3 lectures en moyenne')
    // Le même mot pour le rapport, avant comme après : « environ une fois et demie », « environ deux fois »
    expect(M.methodWorth()[1]).toContain('environ une fois et demie moins sur l’ensemble des questions, environ deux fois moins après le seul questionnaire rapide')
    expect(M.methodWorth()[1]).toContain('une lecture sur un thème sur vingt à un sur onze selon la façon de répondre, soit de 1,3 à 2,3 lectures')
  })

  it('« un sur N » : le dénominateur arrondi vers le bas, la part dite jamais sous la part publiée', () => {
    for (const x of [4.49, 5, 8.24, 8.5, 8.59, 8.93, 9, 9.1, 12.5, 20]) {
      const n = M.oneIn(x)
      expect(100 / n, String(x)).toBeGreaterThanOrEqual(x)
      expect(100 / (n + 1), String(x)).toBeLessThan(x)
      expect(M.methodWorth({ ...M.ECHIQUIER_PUBLISHED, randomThemesMax: x } as typeof M.ECHIQUIER_PUBLISHED)[1]).toContain(` à un sur ${word(n)} selon la façon de répondre`)
    }
  })

  it('le journal du 15 octobre dit l’avant et l’après que publie la Méthode, rapports compris', () => {
    const P = M.ECHIQUIER_PUBLISHED
    const B = M.ECHIQUIER_BEFORE
    const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
    const entry = pack.election.changelog.find(c => c.text.includes('ne tire plus rien au sort'))!
    expect(entry.date).toBe('2026-10-15')
    const d = (x: number) => String(x).replace('.', ',')
    for (const part of [
      'sur les mêmes réponses qu’avant',
      `dans ${P.hitWithout}${NB}% des cas (${B.hitWithout}${NB}% avant)`,
      `de ${P.hitWithoutMin} à ${P.hitWithoutMax}${NB}% selon le bloc (de ${B.hitWithoutMin} à ${B.hitWithoutMax}${NB}% avant, l’écart d’un point venant de la borne prudente)`,
      `toujours au plus une lecture sur un thème sur ${word(M.oneIn(P.randomThemesMax))}`,
      `au plus ${d(P.randomPerProfileMax)} lectures en moyenne sur l’ensemble des thèmes (${d(B.randomPerProfileMax)} avant)`,
      `en reçoit en moyenne ${d(P.oneChoiceRatio)} fois plus que celui qu’elle classe à gauche (${d(B.oneChoiceRatio)} avant), et toujours ${d(P.oneChoiceRatioQuick)} fois au seul questionnaire rapide`,
      'le calcul sans tirage accentue un peu ce déséquilibre',
    ])
      expect(entry.text, part).toContain(part)
    expect(M.oneIn(B.randomThemesMax)).toBe(M.oneIn(P.randomThemesMax))
    expect(B.oneChoiceRatioQuick).toBe(P.oneChoiceRatioQuick)
    expect(entry.text).not.toMatch(/douze|hasard/)
  })

  it('la comparaison : toutes les façons, la vôtre et toutes les autres ; jamais « les autres façons… la vôtre comprise »', () => {
    for (const t of [T.HOW_CALC, M.methodChance(5)]) {
      expect(t, t).toContain('toutes les façons de poser vos mêmes avis, la vôtre et toutes les autres')
      expect(/autres façons[^.]*la vôtre comprise/.test(t), t).toBe(false)
      expect(/sur d’autres approches|posés autrement/.test(t), t).toBe(false)
    }
    // « Nettement » : l'écart et le seuil, comme dans la Méthode
    expect(T.HOW_MARKS[0]).toBe(
      `Nettement plus près${NB}: votre affinité avec ce bloc dépasse nettement celle des autres façons de poser vos mêmes avis, d’au moins 5${NB}points, et atteint 55${NB}% au moins.`,
    )
    expect(T.HOW_MARKS[1]).toMatch(/^Nettement plus loin\u00a0: elle reste nettement en dessous, d’au moins 5\u00a0points, à 45\u00a0% au plus\./)
    expect(M.methodChance(5)).toContain(`(d’au moins 5 points, et à 55${NB}% au moins)`)
  })
})

describe('la rubrique de la Méthode, un fichier à part du build', () => {
  /** Les fichiers que tire un module, de proche en proche : importations de valeurs relatives (« import type » s'efface) */
  function reached(start: string): Set<string> {
    const seen = new Set<string>()
    const visit = (file: string) => {
      if (seen.has(file)) return
      seen.add(file)
      const code = readFileSync(join(ROOT, file), 'utf8')
      for (const m of code.matchAll(/^(?:import|export) (?!type\b)[^'"]*?from '(\.[^']+)'/gm)) {
        const base = join(file, '..', m[1]!)
        const next = ['.ts', '.tsx', '/index.ts'].map(ext => base + ext).find(f => existsSync(join(ROOT, f)))
        if (next) visit(next)
      }
    }
    visit(start)
    return seen
  }

  it('n’emporte ni la page, ni son calcul, ni ses mots ; la page n’emporte pas les mots de la rubrique', () => {
    const files = reached('src/ui/profile/MethodSection.tsx')
    for (const f of ['src/core/echiquierMethodCopy.ts', 'src/core/echiquierCommonCopy.ts', 'src/core/echiquierPanel.ts']) expect(files, f).toContain(f)
    for (const f of ['src/ui/screens/Profile.tsx', 'src/ui/profile/Chart.tsx', 'src/core/echiquier.ts', 'src/core/echiquierCopy.ts']) expect(files, f).not.toContain(f)
    const page = reached('src/ui/screens/Profile.tsx')
    expect(page).toContain('src/core/echiquier.ts')
    expect(page).not.toContain('src/core/echiquierMethodCopy.ts')
    // « Ce qui pèse le plus » (lot 3) : un fichier à part, chargé par la page à la demande, qui n'emporte pas la rubrique
    for (const f of ['src/ui/profile/Weigh.tsx', 'src/core/echiquierWeigh.ts', 'src/core/echiquierWeighCopy.ts']) {
      expect(page, f).not.toContain(f)
      expect(files, f).not.toContain(f)
    }
    expect(reached('src/ui/profile/Weigh.tsx')).not.toContain('src/core/echiquierMethodCopy.ts')
    // « Le détail, sujet par sujet » : un fichier à part, chargé par la page à l'ouverture du tableau (son import est
    // dynamique), qui n'emporte pas la rubrique ; la barre des domaines, elle, est dans la page
    expect(page).not.toContain('src/ui/profile/ProfileDetail.tsx')
    expect(page).toContain('src/ui/profile/Nav.tsx')
    expect(files).not.toContain('src/ui/profile/ProfileDetail.tsx')
    expect(reached('src/ui/profile/ProfileDetail.tsx')).not.toContain('src/core/echiquierMethodCopy.ts')
    // Ses libellés fixes partent avec lui (17 octobre 2026 : la place des correctifs de la barre sous le plafond de la page)
    expect(reached('src/ui/profile/ProfileDetail.tsx')).toContain('src/core/echiquierDetailCopy.ts')
    expect(page).not.toContain('src/core/echiquierDetailCopy.ts')
    expect(files).not.toContain('src/core/echiquierDetailCopy.ts')
    expect(readFileSync(join(ROOT, 'src/ui/screens/Profile.tsx'), 'utf8')).toContain("onDemand<typeof import('../profile/ProfileDetail')>(() => import('../profile/ProfileDetail'))")
  })

  it('dit l’écart du calcul, qu’elle prend sans lui : ECHIQUIER.GAP est CLOSE_GAP', () => {
    expect(ECHIQUIER.GAP).toBe(CLOSE_GAP)
  })
})

describe('sur des feuilles réelles : « Rien de net » ne dit « ne se distinguent pas assez » que quand c’est vrai', () => {
  const pack = elections.find(p => p.election.id === 'presidentielle-2027')!
  const P = profilesFor(pack)
  const TIE = 1e-9
  /** Un bloc nettement à l'écart des autres façons de poser les mêmes avis : le test et l'écart, sans le seuil de 55 % */
  const apartFromOthers = (u: UnitReading) => u.cells.some(c => c.p !== null && c.chance !== null && c.affinity !== null && c.p <= ECHIQUIER.ALPHA + 1e-12 && Math.abs(c.affinity - c.chance) >= ECHIQUIER.GAP - TIE)

  it('le domaine « Travail et économie » d’un clone bruité de Bernard Cazeneuve, au rapide : la gauche à l’écart, sous 55 % (contre-vérification du 15 octobre 2026)', () => {
    const e = readEchiquier(pack, P.toAnswers(P.noisy(P.cloneLarge('cazeneuve', isQuick), 'fq:cazeneuve:0')))
    const eco = e.families.find(f => f.id === 'economie')!
    expect(eco.status).toBe('aucun')
    expect(eco.distinct).toBe(true)
    expect(apartFromOthers(eco)).toBe(true)
    expect(T.unitSentence(axis, eco)).toBe(
      `Rien de net${NB}: sur ce domaine, vos réponses ne se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc, quelle que soit la couleur des cases.`,
    )
  })

  it('clones bruités, au rapide et sur la banque, et feuilles remplies par un programme : chaque phrase dit ce qui est', () => {
    const sheets = [
      ...P.ranked.flatMap(id => [0, 1].map(k => P.noisy(P.cloneLarge(id, isQuick), `fq:${id}:${k}`))),
      ...P.ranked.map(id => P.noisy(P.cloneLarge(id), `f:${id}:0`)),
      ...(['audit', 'un-choix', 'accord-seul'] as const).flatMap(scheme => [0, 1].map(k => P.randomProfile(`f:${scheme}:${k}`, scheme, isQuick))),
    ]
    let alike = 0
    let distinct = 0
    for (const sheet of sheets) {
      const e = readEchiquier(pack, P.toAnswers(sheet))
      for (const u of [...e.themes, ...e.families]) {
        // distinct : toujours d'une lecture ou d'écarts ; sur « rien de net », exactement un bloc à l'écart sous le seuil
        if (u.status === 'lecture' || u.status === 'ecarts') expect(u.distinct, `${u.kind}-${u.id}`).toBe(true)
        if (u.status !== 'aucun') continue
        expect(u.distinct, `${u.kind}-${u.id}`).toBe(apartFromOthers(u))
        const text = T.unitSentence(axis, u)
        if (/ne se distinguent pas assez/.test(text)) {
          alike++
          expect(apartFromOthers(u), `${u.kind}-${u.id} : ${text}`).toBe(false)
        }
        if (u.distinct) {
          distinct++
          expect(text).toMatch(/ne se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc/)
        }
      }
    }
    // Les deux cas paraissent bien
    expect(alike).toBeGreaterThan(50)
    expect(distinct).toBeGreaterThan(0)
  }, 30_000)
})
