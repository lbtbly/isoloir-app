// Phrases et bâtons partagés par la page des résultats et le dépouillement en PDF (src/core/resultsCopy.ts,
// src/core/tally.ts) : les mêmes mots au singulier comme au pluriel, et le même trait, au dernier chiffre près,
// que celui que l'écran a toujours dessiné.
import { describe, expect, it } from 'vitest'
import * as copy from '../src/core/resultsCopy'
import { computeResults } from '../src/core/score'
import { jitter, tallyPath, tallyStroke } from '../src/core/tally'
import type { Answers } from '../src/core/types'
import { elections } from '../src/elections/all'

const NB = '\u00a0'

// Témoins : le tracé tel qu'il était écrit dans components/Tally.tsx et dans la progression de Results.tsx
function witnessJitter(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 1.4
}
const j = witnessJitter
const witnessTally = (i: number) => {
  const k = i % 5
  return k < 4
    ? `M${4 + k * 6 + j(i, 1)} ${3 + j(i, 2)} L${4.4 + k * 6 + j(i, 3)} ${23 + j(i, 4)}`
    : `M${0.8 + j(i, 5)} ${19.5 + j(i, 6)} L${28.5 + j(i, 7)} ${6 + j(i, 8)}`
}
const witnessProgress = (i: number, x: number) => {
  const k = i % 5
  return k < 4
    ? `M${x + 4 + k * 6 + j(i, 1)} ${3 + j(i, 2)} L${x + 4.4 + k * 6 + j(i, 3)} ${23 + j(i, 4)}`
    : `M${x + 0.8 + j(i, 5)} ${19.5 + j(i, 6)} L${x + 28.5 + j(i, 7)} ${6 + j(i, 8)}`
}

describe('bâtons partagés (core/tally)', () => {
  it('trace exactement le chemin de l’écran, bâtons du dépouillement comme progression de la tendance', () => {
    for (let i = 0; i < 500; i++) {
      expect(tallyPath(i), `bâton ${i}`).toBe(witnessTally(i))
      const x = Math.floor(i / 5) * 36
      expect(tallyPath(i, x), `bâton ${i} décalé de ${x}`).toBe(witnessProgress(i, x))
      expect(jitter(i, 3)).toBe(witnessJitter(i, 3))
    }
  })

  it('reste dans la boîte du paquet (30 × 26) : quatre verticaux, le cinquième barre le paquet', () => {
    for (let i = 0; i < 200; i++) {
      const [x1, y1, x2, y2] = tallyStroke(i)
      for (const v of [x1, y1, x2, y2]) expect(Number.isFinite(v)).toBe(true)
      expect(Math.min(x1, x2)).toBeGreaterThanOrEqual(0)
      expect(Math.max(x1, x2)).toBeLessThanOrEqual(30)
      expect(Math.min(y1, y2)).toBeGreaterThanOrEqual(0)
      expect(Math.max(y1, y2)).toBeLessThanOrEqual(26)
      if (i % 5 < 4) expect(y2 - y1).toBeGreaterThan(15)
      else expect(x2 - x1).toBeGreaterThan(20)
      expect(Math.abs(jitter(i, 1))).toBeLessThanOrEqual(0.7)
    }
  })
})

describe('phrases du dépouillement (core/resultsCopy)', () => {
  it('accorde chaque phrase au singulier et au pluriel', () => {
    expect(copy.answeredLede(1)).toBe('Sur 1 réponse.')
    expect(copy.answeredLede(12)).toBe('Sur 12 réponses.')
    expect(copy.staleNotice(1)).toBe('1 question a changé depuis vos réponses : le résultat est calculé sans elle en attendant.')
    expect(copy.staleNotice(2)).toBe('2 questions ont changé depuis vos réponses : le résultat est calculé sans elles en attendant.')
    expect(copy.crossingNote(1)).toBe('1 candidat franchit au moins une de vos lignes rouges.')
    expect(copy.crossingNote(14)).toBe('14 candidats franchissent au moins une de vos lignes rouges.')
    expect(copy.unrankedTitle(1)).toBe('Trop peu de positions connues pour le classer')
    expect(copy.unrankedTitle(3)).toBe('Trop peu de positions connues pour les classer')
    expect(copy.excludedTitle(1)).toBe(`1${NB}candidat n’est pas classé`)
    expect(copy.excludedTitle(8)).toBe(`8${NB}candidats ne sont pas classés`)
    expect(copy.excludedWhy(1)).toBe(`${NB}: sa position est connue sur trop peu de questions`)
    expect(copy.excludedWhy(8)).toBe(`${NB}: leurs positions sont connues sur trop peu de questions`)
    // Pas de rang ; hors tendance, un score pour information seulement (décision du propriétaire du 14 octobre 2026), à
    // partir de 5 réponses où la position est connue (décision du propriétaire du 2026-10-15)
    expect(copy.excludedLede(1)).toBe(
      `Il n’a pas de rang, quelles que soient vos réponses. Son score, calculé sur ses seules positions connues, est donné pour information seulement${NB}: sur si peu de questions, il dépend surtout de celles auxquelles vous avez répondu. Il n’est montré que si sa position est connue sur au moins 5${NB}de vos réponses. Il ne se compare donc à aucun autre${NB}: même plus haut que ceux du classement, il ne dit pas que ce candidat est plus proche de vos idées. Sa fiche et ses positions restent consultables${NB}; la liste sera revue à mesure que ses positions seront connues.`,
    )
    expect(copy.excludedLede(8)).toBe(
      `Ils n’ont pas de rang, quelles que soient vos réponses. Le score de chacun, calculé sur ses seules positions connues, est donné pour information seulement${NB}: sur si peu de questions, il dépend surtout de celles auxquelles vous avez répondu. Il n’est montré que si sa position est connue sur au moins 5${NB}de vos réponses. Il ne se compare donc à aucun autre${NB}: même plus haut que ceux du classement, il ne dit pas que ce candidat est plus proche de vos idées. Leurs fiches et leurs positions restent consultables${NB}; la liste sera revue à mesure que leurs positions seront connues. Ordre tiré au hasard.`,
    )
    // Pendant la tendance, aucun score n'est montré : la phrase n'en parle pas
    for (const n of [1, 8]) {
      expect(copy.excludedLede(n, true)).not.toMatch(/score/)
      expect(copy.excludedLede(n, true)).toMatch(/^Ils? n’(a|ont) pas de rang, quelles que soient vos réponses\. /)
    }
    expect(copy.excludedLede(1, true)).not.toContain('Ordre tiré au hasard')
    expect(copy.excludedLede(8, true)).toMatch(/ Ordre tiré au hasard\.$/)
    expect(copy.starLegend(0, 3)).toBe(`${NB}: thème prioritaire, compte double (3${NB}au plus).`)
    expect(copy.starLegend(1, 3)).toBe(`${NB}: thème prioritaire, compte double (3${NB}au plus, 1${NB}choisi).`)
    expect(copy.starLegend(2, 3)).toBe(`${NB}: thème prioritaire, compte double (3${NB}au plus, 2${NB}choisis).`)
    expect(copy.priorityHead(0)).toBe(`aucune${NB}: tous les thèmes comptent autant.`)
    expect(copy.priorityHead(2)).toBe('comptent double dans le calcul')
  })

  it('dit les lignes rouges franchies, sûres ou possibles', () => {
    expect(copy.redLineSummary([{ level: 'touche' }])).toBe('Franchit une de vos lignes rouges')
    expect(copy.redLineSummary([{ level: 'possible' }])).toBe('Pourrait franchir une de vos lignes rouges')
    expect(copy.redLineSummary([{ level: 'possible' }, { level: 'possible' }])).toBe('Pourrait franchir 2 de vos lignes rouges')
    expect(copy.redLineSummary([{ level: 'possible' }, { level: 'touche' }, { level: 'possible' }])).toBe('Franchit 3 de vos lignes rouges')
    expect(copy.allIncompatibleNote(false)).toBe('Aucun candidat ne respecte toutes vos lignes rouges : ils sont classés du moins au plus concerné.')
    expect(copy.allIncompatibleNote(true)).toBe('Aucun candidat classé ne respecte toutes vos lignes rouges : ils sont classés du moins au plus concerné.')
    expect(copy.manyRedLinesNote(7)).toBe('7 lignes rouges : le classement dépend surtout de ces refus.')
    expect(copy.leaderLead(false)).toBe('Le plus proche de vos idées')
    expect(copy.leaderLead(true)).toBe('Le moins concerné par vos lignes rouges')
    // Des candidats hors classement ou non classés : « parmi les candidats classés » (décision du propriétaire du 2026-10-15)
    expect(copy.leaderLead(false, false)).toBe('Le plus proche de vos idées')
    expect(copy.leaderLead(false, true)).toBe('Le plus proche de vos idées parmi les candidats classés')
    expect(copy.leaderLead(true, true)).toBe('Le moins concerné par vos lignes rouges parmi les candidats classés')
  })

  it('compose la méta d’une ligne : couverture, données partielles, score avant lissage hors tendance', () => {
    const r = { known: 2, answered: 5, partialData: true, rawScore: 70.4, score: 63.2 }
    expect(copy.rowMeta(r, true)).toBe(`Connu sur 2 de vos 5 réponses · données partielles · 70${NB}% avant lissage`)
    expect(copy.rowMeta(r, false)).toBe('Connu sur 2 de vos 5 réponses · données partielles')
    expect(copy.rowMeta({ ...r, partialData: false, rawScore: 63.4 }, true)).toBe('Connu sur 2 de vos 5 réponses')
    expect(copy.rowMeta({ ...r, rawScore: null, score: null }, true)).toBe('Connu sur 2 de vos 5 réponses · données partielles')
    expect(copy.knownLine(0, 0)).toBe('Aucune réponse notée')
    expect(copy.bankKnownLine(38, 100)).toBe(`Connu sur 38 des 100${NB}questions de la banque`)
    expect(copy.indicativeScore(55.6)).toBe(`Score indicatif${NB}: 56${NB}%`)
  })

  it('suit la règle de couverture : la moitié, une autre part, ou aucune règle', () => {
    expect(copy.emptyRanking(null)).toBe(
      `Aucun candidat n’est connu sur au moins la moitié de vos réponses${NB}: pas de classement pour l’instant. D’autres réponses peuvent le permettre.`,
    )
    expect(copy.emptyRanking(0.4)).toContain(`au moins 40${NB}% de vos réponses`)
    expect(copy.unrankedLede(1, 0.5, false)).toBe(
      `Sa position est connue sur moins de la moitié de vos réponses. Calculé sur si peu de questions, un score varie trop pour être comparé aux autres${NB}: le sien est donné à titre indicatif.`,
    )
    expect(copy.unrankedLede(3, 0.5, false)).toMatch(/^Leur position .*\u00a0: le leur est donné à titre indicatif\. Ordre tiré au hasard\.$/)
    expect(copy.unrankedLede(3, 0.4, true)).toBe(
      `Leur position est connue sur moins de 40${NB}% de vos réponses. Calculé sur si peu de questions, un score varie trop pour être comparé aux autres. Ordre tiré au hasard.`,
    )
    const [first, second, third] = copy.caveats({ dataFrozenAt: '2026-10-09' }, null)
    expect(first).toBe('Pas une consigne de vote : le résultat dépend des sujets retenus et de la méthode.')
    expect(second).toBe(
      'Positions arrêtées au 09/10/2026. Une position inconnue sort du calcul ; un candidat connu sur peu de vos réponses est ramené vers 50 %.',
    )
    expect(third).toBe('L’outil ignore la personnalité, l’expérience et la capacité à rassembler.')
    expect(copy.caveats({ dataFrozenAt: '2026-10-09' }, 0.5)[1]).toMatch(/50 %, et sur moins de la moitié, il n’est pas classé\.$/)
  })

  it('nomme les candidats : « A », « A et B », « A, B et C », et la phrase du résultat sensible à la méthode', () => {
    expect(copy.joinNames([])).toBe('')
    expect(copy.joinNames(['A'])).toBe('A')
    expect(copy.joinNames(['A', 'B'])).toBe('A et B')
    expect(copy.joinNames(['A', 'B', 'C'])).toBe('A, B et C')
    const one = copy.swapText(['A'], ['B', 'C'])
    expect(one.join('')).toBe(
      'Le score complet tient compte de toutes leurs positions. En ne gardant que leurs approches principales, vos accords moins vos désaccords, A passe devant B et C.',
    )
    // Les morceaux de rang impair sont les noms, en gras sur la page
    expect(one.filter((_, i) => i % 2)).toEqual(['A', 'B et C'])
    expect(copy.swapText(['A', 'D'], ['B']).join('')).toContain('A et D passent devant B.')
    expect(copy.signed(3)).toBe('+3')
    expect(copy.signed(-2)).toBe('−2')
    expect(copy.signed(0)).toBe('0')
    expect(copy.closeNote('Marine Tondelier')).toBe('Marine Tondelier suit à moins de 5 points : l’écart n’est pas significatif.')
    expect(copy.gridAllLine(18, true)).toBe(`Les 18${NB}candidats classés, dans l’ordre de votre classement.`)
    expect(copy.gridAllLine(5, false)).toBe(`Les 5${NB}candidats, dans l’ordre de votre classement.`)
  })

  it('sur les vrais packs : aucune valeur manquante, aucun mot de pronostic ni de sondage', () => {
    const forbidden = /sondage|gagnant|vainqueur|intentions? de vote/i
    const missing = /\bundefined\b|\bNaN\b|\bnull\b/
    for (const pack of elections) {
      // Avis tirés d'une graine fixe, une ligne rouge de temps en temps
      let x = 42
      const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648
      const answers: Answers = {}
      for (const q of pack.bank.questions) {
        const ratings: Record<string, 1 | -1> = {}
        for (const a of q.approaches) ratings[a.id] = rnd() < 0.5 ? 1 : -1
        const redLines = rnd() < 0.1 ? [q.approaches[0]!.id] : []
        for (const id of redLines) ratings[id] = -1
        answers[q.id] = { ratings, redLines }
      }
      const r = computeResults(pack, answers, {}, '0123456789abcdef')
      const names = r.ranking.map(c => pack.candidates.find(p => p.id === c.candidateId)!.name)
      const texts = [
        copy.answeredLede(r.answered),
        copy.leaderLead(r.allIncompatible),
        copy.leaderLead(false, true),
        copy.leaderLead(true, true),
        copy.closeNote(names[1]!),
        copy.crossingNote([...r.ranking, ...r.unranked, ...r.excludedResults].filter(c => !c.compatible).length),
        copy.allIncompatibleNote(r.excluded.length > 0),
        copy.manyRedLinesNote(r.redLineCount),
        copy.emptyRanking(r.minCoverageShare),
        copy.excludedTitle(r.excluded.length),
        copy.excludedWhy(r.excluded.length),
        copy.excludedLede(r.excluded.length),
        copy.EXCLUDED_NO_COMPARE,
        copy.swapText(names.slice(1, 2), names.slice(0, 1)).join(''),
        copy.gridAllLine(r.ranking.length, r.excluded.length > 0),
        ...copy.caveats(pack.election, r.minCoverageShare),
        ...r.ranking.map(c => copy.rowMeta(c, true)),
        ...r.ranking.filter(c => c.dealbreakers.length).map(c => copy.redLineSummary(c.dealbreakers)),
        copy.AGREE_LEDE,
        copy.AGREE_NONE,
        copy.GRID_DASH,
        copy.READING_NEUTRAL,
        copy.READING_STROKE,
        copy.TITLE_DONE,
        copy.TITLE_BOARD,
        copy.TITLE_SWAP,
        ...copy.SWAP_HEADS,
        copy.LINK_RULE,
        copy.TIE_MARK,
      ]
      for (const t of texts) {
        expect(t, pack.election.id).not.toMatch(forbidden)
        expect(t, pack.election.id).not.toMatch(missing)
        expect(t.length, pack.election.id).toBeGreaterThan(0)
      }
    }
  })
})

describe('entrées de « Mon profil politique » (accueil, dépouillement, tendance)', () => {
  const pres = elections.find(p => p.election.id === 'presidentielle-2027')!
  const axis = pres.election.spectrum!.axis!

  it('dit ce que montre la page, d’un bout à l’autre de la grille, et quand elle s’affiche', () => {
    expect(copy.profileHome(axis)).toBe('Sujet par sujet, vos réponses face aux blocs d’une grille officielle, de l’extrême gauche à l’extrême droite.')
    expect(copy.profileWhen(22, 22)).toBe(`Il s’affiche au bout des 22${NB}questions du questionnaire rapide.`)
    expect(copy.profileWhen(22, 15)).toBe(`Il s’affiche au bout des 22${NB}questions du questionnaire rapide${NB}: encore 15${NB}questions.`)
    expect(copy.profileWhen(22, 1)).toBe(`Il s’affiche au bout des 22${NB}questions du questionnaire rapide${NB}: encore 1${NB}question.`)
    expect(copy.profileWhen(22, 0)).toBe(`Il s’affiche au bout des 22${NB}questions du questionnaire rapide.`)
    expect(copy.profileWhen(22, 0, true)).toBe(`Il se lit sur vos avis${NB}: placez au moins un repère, «${NB}d’accord${NB}» ou «${NB}pas d’accord${NB}».`)
    // Des questions ajoutées depuis un questionnaire fini : la page s'est déjà affichée, elle revient une fois vues
    expect(copy.profileWhen(22, 2, false, true)).toBe(`Il s’affiche de nouveau une fois les 2${NB}nouvelles questions vues.`)
    expect(copy.profileWhen(22, 1, false, true)).toBe('Il s’affiche de nouveau une fois la nouvelle question vue.')
    expect(copy.profileWhen(22, 0, true, true)).toBe(copy.profileWhen(22, 0, true))
    // La page prête : le même cadre, ce qu'il en est à la place de quand elle s'affiche, et l'appel vers la page
    expect(copy.PROFILE_READY).toBe('Il est prêt, calculé sur cet appareil à partir de vos réponses.')
    expect(copy.PROFILE_SEE).toBe('Voir mon profil politique')
    // La grille reste un exemple fictif ; dès la première réponse, la mention dit qu'elle n'est pas la sienne
    expect(copy.PEEK_TAG).toBe('Exemple fictif')
    expect(copy.PEEK_TAG_MINE).toBe('Exemple fictif, pas vos réponses')
    expect(copy.trendNext(22).join('')).toBe(`Au bout des 22${NB}questions${NB}: le dépouillement complet et «${NB}Mon profil politique${NB}».`)
    expect(copy.trendNext(22)[1]).toBe(copy.PROFILE_TITLE)
    // L'appel de l'aperçu dit ce que montre la page d'attente, dans l'ordre : l'état de la feuille, puis l'exemple
    expect(copy.PEEK_GO).toBe('Voir où j’en suis et un exemple')
  })

  it('« Approfondir », arrivé d’un thème touché : ce qui est coché, et par où commence la feuille', () => {
    expect(copy.deepenTouched('Israël et Gaza', 2, 0, 2)).toBe(`Le thème «${NB}Israël et Gaza${NB}» est coché${NB}: 2${NB}questions.`)
    expect(copy.deepenTouched('Défense', 1, 0, 1)).toBe(`Le thème «${NB}Défense${NB}» est coché${NB}: 1${NB}question.`)
    expect(copy.deepenTouched('Israël et Gaza', 2, 3, 15)).toBe(
      `Le thème «${NB}Israël et Gaza${NB}» est coché${NB}: la feuille commence par ses 2${NB}questions. 3${NB}autres thèmes sont aussi cochés${NB}: 15${NB}questions en tout.`,
    )
    expect(copy.deepenTouched('Défense', 1, 1, 4)).toBe(
      `Le thème «${NB}Défense${NB}» est coché${NB}: la feuille commence par sa question. Un autre thème est aussi coché${NB}: 4${NB}questions en tout.`,
    )
  })

  it('une lecture, pas une étiquette : espaces insécables, aucun « % », « profil » seulement dans le nom de la page et son appel', () => {
    const texts = [
      copy.profileHome(axis),
      ...[22, 15, 1, 0].map(n => copy.profileWhen(22, n)),
      copy.profileWhen(22, 0, true),
      ...[2, 1].map(n => copy.profileWhen(22, n, false, true)),
      copy.PROFILE_READY,
      copy.trendNext(22).join(''),
      copy.PROFILE_SEE,
      copy.PEEK_TAG,
      copy.PEEK_TAG_MINE,
      copy.PEEK_GO,
      copy.PROFILE_PANEL,
      copy.deepenTouched('Israël et Gaza', 2, 3, 15),
      copy.deepenTouched('Défense', 1, 0, 1),
    ]
    const FORBIDDEN = [/vous êtes/i, /êtes de/i, /votre camp/i, /votre bord/i, /en tête/i, /gagnant/i]
    for (const t of texts) {
      expect(/ [:;?!»]/.test(t) || /« /.test(t), `espace ordinaire : « ${t} »`).toBe(false)
      expect(t, t).not.toContain('%')
      for (const re of FORBIDDEN) expect(re.test(t), `${re} dans « ${t} »`).toBe(false)
      expect(/profil/i.test(t.replace(/(Mon|Voir mon) profil politique/g, '')), `« profil » hors du nom de la page : « ${t} »`).toBe(false)
    }
  })

  it('la grille fictive est neutre par construction', () => {
    const peek = copy.PROFILE_PEEK
    expect(peek).toMatch(/^[1-5]{15}$/)
    const rows = [0, 1, 2].map(r => [...peek.slice(r * 5, r * 5 + 5)].map(Number))
    const col = (c: number) => rows.map(r => r[c]!)
    // Même somme par colonne : même moyenne pour chaque bloc
    const sums = [0, 1, 2, 3, 4].map(c => col(c).reduce((a, b) => a + b, 0))
    expect(new Set(sums).size).toBe(1)
    // Miroir gauche-droite : les colonnes 1 et 5, 2 et 4, ont les mêmes cases
    const sorted = (c: number) => [...col(c)].sort().join('')
    expect(sorted(0)).toBe(sorted(4))
    expect(sorted(1)).toBe(sorted(3))
    for (const r of rows) {
      // Aucune ligne ne monte ni ne descend d'un bout à l'autre, aucune n'est symétrique (pas de lecture « centre »)
      const up = r.every((v, i) => i === 0 || v >= r[i - 1]!)
      const down = r.every((v, i) => i === 0 || v <= r[i - 1]!)
      expect(up || down, r.join('')).toBe(false)
      expect(r.join('') === [...r].reverse().join(''), r.join('')).toBe(false)
    }
    // Chaque palier paraît au moins deux fois
    for (const d of '12345') expect(peek.split(d).length - 1, d).toBeGreaterThanOrEqual(2)
  })
})
