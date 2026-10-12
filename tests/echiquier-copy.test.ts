// Les mots de la page « Mon profil politique » (core/echiquierCopy.ts), sur le modèle de results-copy.test.ts : accords
// au singulier et au pluriel, formes des blocs, et les règles d'écriture (DESIGN.md, The Reading Not Label Rule) : le
// sujet est toujours « vos réponses », un bloc est toujours attribué à la grille, aucun mot d'étiquette, aucun « % »
// dans la synthèse et les phrases, les espaces insécables du site.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { BlocCell, Mark, UnitReading, UnitStatus } from '../src/core/echiquier'
import * as T from '../src/core/echiquierCopy'
import { axisOf } from '../src/core/spectrum'
import { elections } from '../src/elections/all'

const NB = String.fromCharCode(0xa0)
const ROOT = fileURLToPath(new URL('..', import.meta.url))
const axis = axisOf(elections.find(p => p.election.id === 'presidentielle-2027')!.election)!

/** Une unité factice : ses blocs ▲, ▽ et inconnus */
function reading(status: UnitStatus, near: number[] = [], far: number[] = [], unknown: number[] = [], kind: 'theme' | 'famille' = 'theme') {
  const cells: BlocCell[] = axis.map((a, b) => ({
    bloc: a.bloc,
    known: [],
    affinity: null,
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
  for (const v of Object.values(T)) if (typeof v !== 'function') walk(v)
  for (const n of [1, 2, 7]) {
    out.push(T.pending(n), T.howWho(15, n), T.onQuestions(n), T.familyHead(n + 1), T.nothingLine(n), T.apartLine(n), T.noReadingLine(n), T.unansweredLine(n))
    out.push(...T.caveats(15), T.unplaced(n, false), T.unplaced(n, true), T.chanceNote(true, n * 12), T.chanceNote(false, 999))
  }
  out.push(T.howWho(15, 0), ...T.methodIntro(5), T.methodWho(15, 7, 2, 4, true), T.methodWho(15, 0, 3, 3, false), T.methodChance(5), ...T.methodWorth())
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
    expect(T.pending(1)).toContain(`il reste 1${NB}question du`)
    expect(T.pending(12)).toContain(`il reste 12${NB}questions du`)
    expect(T.unplaced(1, false)).toMatch(/^Un de vos accords sur ce thème porte sur une approche qui n’est/)
    expect(T.unplaced(3, true)).toMatch(/^3 de vos accords sur ces thèmes portent sur des approches qui ne sont/)
    expect(T.gap(65, 23, 'pres')).toBe(`+42${NB}points, plus près`)
    expect(T.gap(30, 31, 'rien')).toBe(`−1${NB}point`)
    expect(T.pct(64.6)).toBe(`65${NB}%`)
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
      `Pas de lecture${NB}: la position des candidats que la grille classe à droite et à l’extrême droite n’est pas connue sur vos questions de cette famille.`,
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
    const texts = [...sentences, ...T.methodWorth()]
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
    // La Méthode aussi : ce sont des réponses qui sont lues, pas une personne
    for (const s of T.methodWorth()) {
      expect(/personne|quelqu’un/.test(s), s).toBe(false)
      if (/lues/.test(s)) expect(/réponses/.test(s), s).toBe(true)
    }
  })

  it('aucun « % » dans la synthèse ni dans les phrases d’unité', () => {
    for (const s of [...sentences, T.SUMMARY_TITLE, T.SUMMARY_EMPTY, T.SUMMARY_NOTE, ...subsets(axis.length).map(x => T.groupLabel(axis, x))]) expect(s, s).not.toContain('%')
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
    for (const file of ['src/ui/screens/Profile.tsx', 'src/ui/profile/MethodSection.tsx', 'src/ui/profile/Diagram.tsx']) {
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
