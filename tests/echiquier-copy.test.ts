// Les mots de la page « Mon profil politique » (core/echiquierCopy.ts), de sa rubrique de la Méthode
// (core/echiquierMethodCopy.ts) et ceux qu'elles ont en commun (core/echiquierCommonCopy.ts), sur le modèle de
// results-copy.test.ts : accords au singulier et au pluriel, formes des blocs, et les règles d'écriture (DESIGN.md, The
// Reading Not Label Rule) : le sujet est toujours « vos réponses », un bloc est toujours attribué à la grille, aucun mot
// d'étiquette, aucun « % » dans la synthèse et les phrases, aucun symbole de lecture (seul « ? » reste), les espaces
// insécables du site. Puis le découpage du build : la rubrique n'emporte ni le calcul de la page ni ses mots.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ECHIQUIER, type BlocCell, type Mark, type UnitReading, type UnitStatus } from '../src/core/echiquier'
import * as T from '../src/core/echiquierCopy'
import * as M from '../src/core/echiquierMethodCopy'
import { CLOSE_GAP } from '../src/core/score'
import { axisOf } from '../src/core/spectrum'
import { elections } from '../src/elections/all'

const NB = String.fromCharCode(0xa0)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const axis = axisOf(elections.find(p => p.election.id === 'presidentielle-2027')!.election)!

/** Les libellés de la grille, ceux des colonnes : « Extrême gauche » */
const labels = axis.map(a => elections.find(p => p.election.id === 'presidentielle-2027')!.election.spectrum!.blocs.find(b => b.id === a.bloc)!.label)

/** Une unité factice : ses blocs nettement plus près, nettement plus loin et inconnus ; affinity : celle de chaque bloc */
function reading(status: UnitStatus, near: number[] = [], far: number[] = [], unknown: number[] = [], kind: 'theme' | 'famille' = 'theme', affinity: number[] = [50, 50, 50, 50, 50]) {
  const cells: BlocCell[] = axis.map((a, b) => ({
    bloc: a.bloc,
    known: [],
    affinity: unknown.includes(b) ? null : (affinity[b] ?? 50),
    chance: null,
    p: null,
    mark: (unknown.includes(b) ? 'inconnu' : near.includes(b) ? 'pres' : far.includes(b) ? 'loin' : 'rien') as Mark,
  }))
  return { status, near, far, cells, kind } as Pick<UnitReading, 'status' | 'near' | 'far' | 'cells' | 'kind'>
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
  out.push(T.unitSentence(axis, reading('aucun')))
  for (const u of [0, 1, 2, 3, 4]) out.push(T.unitSentence(axis, reading('aucun', [], [], [u])))
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
  for (const v of [...Object.values(T), ...Object.values(M)]) if (typeof v !== 'function') walk(v)
  for (const n of [1, 2, 7]) {
    out.push(T.howWho(15, n), T.onQuestions(n), T.familyHead(n + 1), T.nothingLine(n), T.apartLine(n), T.noReadingLine(n), T.unansweredLine(n))
    out.push(...T.caveats(15), T.unplaced(n, false), T.unplaced(n, true), T.chanceNote(true, n * 12), T.chanceNote(true, n * 12_345), T.chanceNote(false, Number.POSITIVE_INFINITY))
  }
  // La page d'attente et la fiche « Pour lire plus de thèmes »
  for (const w of ['vide', 'en-cours', 'sans-avis'] as const)
    for (const n of [1, 2, 15]) out.push(T.waitText(w, 22, n, false), T.waitText(w, 22, n, true), T.waitCta(w, n))
  for (const n of [0, 1, 7, 22]) out.push(T.waitCount(n, 22))
  for (const n of [1, 2, 16]) out.push(T.thinLine(n), T.exampleRow(n))
  out.push(T.deeperLede(true), T.deeperLede(false))
  out.push(T.howWho(15, 0), ...M.methodIntro(5), M.methodWho(15, 7, 2, 4, true), M.methodWho(15, 0, 3, 3, false), M.methodChance(5), ...M.methodWorth())
  // Le graphique « Sujet par sujet »
  for (const n of [1, 2, 17]) {
    out.push(...T.countRead(n, 0), ...T.countRead(n, n + 1), T.questionsCount(n), T.themesTogether(n + 1), T.othersUnknown(n), T.flatTitle(n), T.unreadTitle(n, true), T.unreadTitle(n, false), T.detailShow(n))
  }
  out.push(T.zonesLabel(5, 15), T.readWithFamily('Économie et travail'), T.sourceLink('23 août 2026'), T.sourceWho(15), T.COLORS_NOTE, ...allSummaries())
  out.push(T.unreadHead(true), T.unreadHead(false), T.FLAT_HEAD, T.HOW_COLOR, T.COLORS_CHANCE, ...T.HOW_MARKS)
  for (const a of [null, 0, 19.4, 19.6, 45, 79.6, 100]) for (const m of ['pres', 'loin', 'rien', 'inconnu'] as const) out.push(T.cellLabel('Droite', a, m))
  out.push(T.bothTitle(true), T.bothTitle(false), ...T.bothRow(true), ...T.bothRow(false))
  out.push(...allSentences(), ...allFacts())
  for (const s of subsets(axis.length)) out.push(T.groupLabel(axis, s))
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
    expect(T.waitText('sans-avis', 22, 0, false)).toMatch(/^Vous avez passé les 22\u00a0questions sans placer de repère/)
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
    expect(T.chanceNote(true, 15_750)).toMatch(new RegExp(`sur les 15${NB}750 placements possibles de vos avis, question par question, le vôtre compris${NB};`))
    expect(T.chanceNote(true, 100_000)).toContain(`les 100${NB}000 placements possibles`)
    expect(T.chanceNote(true, 36)).toContain('les 36 placements possibles')
    expect(T.chanceNote(true, 15_750)).not.toMatch(/prudente/)
    const bound = T.chanceNote(false, Number.POSITIVE_INFINITY)
    expect(bound).toContain('sur tous les placements possibles de vos avis (plus de cent mille)')
    expect(bound).toMatch(/une part calculée bloc par bloc puis additionnée, qui ne peut être que trop prudente\)\.$/)
    expect(ECHIQUIER.COUNT_MAX).toBe(100_000)
    for (const s of [T.chanceNote(true, 15_750), bound, T.chanceNote(false, 3888), M.methodChance(5)]) {
      expect(s, s).not.toMatch(/tirés au (hasard|sort)|\d\.\d|e\+|Infinity|NaN|999/)
    }
    // La Méthode : compter jusqu'à cent mille, calculer au-delà, rien de tiré au sort
    expect(M.methodChance(5)).toMatch(/comptés un à un quand ils sont cent mille au plus\. Au-delà, la page calcule bloc par bloc/)
    expect(M.methodChance(5)).toContain(`Rien n’est tiré au sort${NB}: mêmes réponses, même lecture.`)
    // La page passe le nombre que la note peut dire, jamais N brut (arrangements, qui peut valoir 10²⁵)
    const page = readFileSync(join(ROOT, 'src/ui/screens/Profile.tsx'), 'utf8')
    expect(page).toContain('T.chanceNote(unit.exact, unit.ways)')
    expect(page).not.toMatch(/chanceNote\([^)]*arrangements/)
  })
})

describe('le graphique « Sujet par sujet »', () => {
  it('le compte, les plis, les lignes : accords au singulier et au pluriel, nombre et nom soudés', () => {
    expect(T.countRead(7, 17).join('')).toBe(`Sur 7${NB}sujets, vos réponses se rapprochent nettement d’un bloc de la grille${NB}; sur 17, rien de net.`)
    expect(T.countRead(1, 0).join('')).toBe(`Sur 1${NB}sujet, vos réponses se rapprochent nettement d’un bloc de la grille.`)
    expect(T.countRead(7, 17)[1]).toBe(`7${NB}sujets`)
    expect(T.flatTitle(17)).toBe(`17${NB}sujets sans tendance nette`)
    expect(T.flatTitle(1)).toBe(`1${NB}sujet sans tendance nette`)
    expect(T.unreadTitle(16, true)).toBe(`16${NB}thèmes sur une seule question`)
    expect(T.unreadTitle(1, false)).toBe(`1${NB}thème sans lecture nette`)
    // Les sujets sans tendance nette et ceux d'une seule question : leurs couleurs se lisent, avec prudence
    expect(T.FLAT_HEAD).toMatch(/à la portée du hasard\.$/)
    expect(T.unreadHead(true)).toMatch(/^Une seule question ne permet pas de dire si un écart dépasse nettement le hasard/)
    expect(T.unreadHead(false)).toMatch(/^Sur une seule question, ou faute de candidats connus, on ne peut pas dire si un écart dépasse nettement le hasard/)
    expect(T.unreadHead(false)).not.toMatch(/pas de dire/)
    expect(T.questionsCount(1)).toBe(`1${NB}question`)
    expect(T.questionsCount(5)).toBe(`5${NB}questions`)
    expect(T.themesTogether(4)).toBe('4 thèmes ensemble')
    expect(T.othersUnknown(1)).toBe('(1 autre, position inconnue ici)')
    expect(T.othersUnknown(2)).toBe('(2 autres, position inconnue ici)')
    expect(T.detailShow(31)).toBe('Afficher le détail des 31 sujets')
    expect(T.detailShow(1)).toBe('Afficher le détail du sujet')
    expect(T.zonesLabel(5, 15)).toBe('Les cinq blocs de la grille du ministère de l’Intérieur, de l’extrême gauche à l’extrême droite, et les 15 candidats classés qu’elle y range')
    expect(T.readWithFamily('Économie et travail')).toBe(`Lu avec les autres thèmes de sa famille${NB}: «${NB}Économie et travail${NB}».`)
    expect(T.sourceLink('23 août 2026')).toBe('circulaire du 23 août 2026')
    // Les couleurs : l'échelle d'affinité du site, jamais celle d'un bloc ; aucun nom de couleur de bloc
    expect(T.COLORS_NOTE).toBe(
      `Les couleurs sont celles de l’échelle d’affinité du site, de «${NB}très éloigné${NB}» à «${NB}très proche${NB}»${NB}: votre affinité moyenne avec les candidats de chaque bloc, sur chaque sujet, et non la couleur d’un bloc de la grille.`,
    )
    expect(T.COLORS_NOTE).not.toMatch(/vert|orang|rouge|jaune|bleu/)
    expect(T.HINT_TOUCH).toMatch(/^Touchez /)
    expect(T.HINT_CLICK).toMatch(/^Cliquez /)
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
    // Le détail : la phrase de la maquette validée
    expect(T.DETAIL_INTRO).toBe(
      `Pour chaque bloc${NB}: votre affinité moyenne avec ses candidats, la même avec vos avis placés au hasard, et l’écart. Puis, dans la page, chaque candidat et chaque question.`,
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
    // Ce que la couleur ne dit pas : le hasard, la façon de répondre (les deux paliers de chaque côté, les bouts
    // compris : c'est eux que donne une façon de répondre tranchée), l'accord des candidats d'un bloc, sans comparer des
    // blocs par leur taille (l'écart ne se mesure pas) ; une lecture nette peut tomber sur « mitigé »
    expect(T.COLORS_CHANCE).toMatch(/des réponses données au hasard colorent aussi des cases/)
    expect(T.COLORS_CHANCE).toContain(`qui approuve beaucoup voit surtout «${NB}proche${NB}» et «${NB}très proche${NB}»`)
    expect(T.COLORS_CHANCE).toContain(`qui désapprouve beaucoup surtout «${NB}éloigné${NB}» et «${NB}très éloigné${NB}»`)
    expect(T.COLORS_CHANCE).toContain(`tout approuver donne «${NB}très proche${NB}» presque partout`)
    expect(T.COLORS_CHANCE).toMatch(/quand ils ne pensent pas pareil, cette moyenne est moins tranchée/)
    expect(T.COLORS_CHANCE).not.toMatch(/quatre|un bloc de deux/)
    expect(T.COLORS_CHANCE).toMatch(/Seules les lectures nettes disent qu’un écart dépasse nettement le hasard/)
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
      `Pas de lecture nette${NB}: la position des candidats que la grille classe à droite et à l’extrême droite n’est pas connue sur vos questions de cette famille.`,
    )
    // « Rien de net » ne nomme pas la grille : la phrase qui suit la nomme, sans pronom
    expect(T.unitSentence(axis, reading('aucun', [], [], [2]))).toBe(
      `Rien de net${NB}: vos réponses ne se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc. La position des candidats que la grille classe au centre n’est pas connue ici${NB}: la lecture se fait sans eux.`,
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
    const chart = [T.zonesLabel(5, 15), T.MAIN_LABEL, T.BOTH_HEAD, T.BOTH_ROW.join(''), T.bothRow(false).join(''), T.APART_HEAD, T.FLAT_HEAD, T.KEY_TEXT, T.COUNT_NONE, T.COLORS_NOTE, T.COLORS_CHANCE, ...T.countRead(3, 2)]
    const texts = [...sentences, ...M.methodWorth(), ...allSummaries(), ...chart]
    for (const s of texts) {
      if (BLOC.test(s)) expect(/la grille/.test(s), s).toBe(true)
      for (const m of s.matchAll(/qu’elle classe/g)) expect(s.slice(0, m.index).includes('la grille'), s).toBe(true)
    }
  })

  it('les libellés de la synthèse se lisent sous son titre, qui nomme la grille', () => {
    expect(T.SUMMARY_TITLE).toMatch(/d’un bloc de la grille$/)
    for (const x of subsets(axis.length)) expect(`${T.SUMMARY_TITLE} : ${T.groupLabel(axis, x)}`).toMatch(/de la grille : [ÀAD]/)
  })

  it('le sujet est « vos réponses » (ou ce que vous approuvez), jamais la personne', () => {
    for (const s of allSentences().filter(x => /rapprochent|écartent/.test(x))) expect(/Vos réponses|vos réponses/.test(s), s).toBe(true)
    for (const s of [T.BOTH_HEAD, T.BOTH_ROW[1], T.bothRow(false)[1], T.APART_HEAD, T.FLAT_HEAD, T.countRead(3, 2).join('')]) expect(/Vos réponses|vos réponses/.test(s), s).toBe(true)
    // Sans lecture, le sujet est « aucun sujet », pour « ces réponses »
    expect(T.COUNT_NONE).toMatch(/^Pour ces réponses, aucun sujet/)
    // La Méthode aussi : ce sont des réponses qui sont lues, pas une personne
    for (const s of M.methodWorth()) {
      expect(/personne|quelqu’un/.test(s), s).toBe(false)
      if (/lues/.test(s)) expect(/réponses/.test(s), s).toBe(true)
    }
  })

  it('aucun « % » dans la synthèse ni dans les phrases d’unité', () => {
    for (const s of [...sentences, T.SUMMARY_TITLE, T.SUMMARY_EMPTY, T.SUMMARY_NOTE, ...subsets(axis.length).map(x => T.groupLabel(axis, x))]) expect(s, s).not.toContain('%')
    // Le graphique non plus : les pourcentages ne paraissent que dans « Le détail » et la liste d'une ligne ouverte
    for (const s of [...allSummaries(), T.KEY_TEXT, T.BOTH_HEAD, ...T.BOTH_ROW, ...T.bothRow(false), T.APART_HEAD, T.FLAT_HEAD, T.unreadHead(true), T.unreadHead(false), T.BLOC_NOTE, T.EMPTY_CHART, T.COLORS_NOTE, ...T.countRead(7, 17)])
      expect(s, s).not.toContain('%')
  })

  it('aucun symbole de lecture : ni ▲ ni ▽ ni point, dans les textes du module comme dans ceux de la page ; seul « ? » reste', () => {
    for (const t of allTexts()) expect(/[▲▽△▼·]/.test(t), t).toBe(false)
    for (const file of ['src/ui/screens/Profile.tsx', 'src/ui/profile/Chart.tsx', 'src/ui/profile/MethodSection.tsx', 'src/ui/profile/Diagram.tsx']) {
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
    for (const file of ['src/ui/screens/Profile.tsx', 'src/ui/profile/Chart.tsx', 'src/ui/profile/MethodSection.tsx', 'src/ui/profile/Diagram.tsx']) {
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

  it('les espaces insécables du site : avant « : ; ? ! », dans les guillemets, devant « % »', () => {
    for (const t of allTexts()) {
      expect(/ [:;?!»]/.test(t), `espace ordinaire avant une ponctuation haute : « ${t} »`).toBe(false)
      expect(/« /.test(t), `espace ordinaire après « : « ${t} »`).toBe(false)
      expect(/\d %/.test(t), `espace ordinaire devant % : « ${t} »`).toBe(false)
    }
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
  })

  it('dit l’écart du calcul, qu’elle prend sans lui : ECHIQUIER.GAP est CLOSE_GAP', () => {
    expect(ECHIQUIER.GAP).toBe(CLOSE_GAP)
  })
})
