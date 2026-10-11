// Le dépouillement en PDF : le rapport de la page « Résultats », fabriqué sur l'appareil, à lire sans rouvrir la
// page. A4 portrait, papier blanc, encres du mode clair ; tout déplié (classement complet, lignes rouges en détail,
// grille par thème de tous les classés). Mêmes résultats que la page (même objet `results` : mêmes rangs, mêmes
// ex æquo, même ordre tiré au hasard), mêmes phrases (core/resultsCopy.ts) ; rien de l'état de la session
// (écarts depuis la dernière visite, étoiles vides, avis à fermer).
//
// Pur : aucun accès au DOM, au stockage ni à l'horloge (le moment de fabrication est donné). Chargé à la demande
// seulement (ui/report/load.ts, par import()) : rien d'ici, ni le moteur (core/pdf), n'entre dans le JS initial.
// Seul module qui connaît les textes propres au papier (mentions de tête, colophon, intitulés des sections
// ajoutées) ; les autres viennent de resultsCopy.ts.

import { affinityBand, AFFINITY_BANDS, bandRange, type AffinityBand } from './affinity'
import { hasOpinion } from './answers'
import { APP_NAME, APP_URL } from './app'
import { Flow, type Block, type FlowLogEntry } from './pdf/flow'
import { cross, identityTile, info, initials, miniTally, stamp, star, swatch, tally } from './pdf/shapes'
import { drawLines, drawRunLines, inlineRows, truncate, wrapRuns, wrapText, type Run } from './pdf/text'
import { measure, PdfWriter, type FontKey, type PdfCanvas, type TextStyle } from './pdf/writer'
import {
  AGREE_HEADS,
  AGREE_LEDE,
  AGREE_NONE,
  allIncompatibleNote,
  answeredLede,
  bankKnownLine,
  caveats,
  closeNote,
  CROSSING_DIVIDER,
  crossingNote,
  emptyRanking,
  excludedLede,
  excludedTitle,
  excludedWhy,
  FINALISTS_ONLY,
  GRID_DASH,
  gridAllLine,
  indicativeScore,
  joinNames,
  knownLine,
  leaderLead,
  LINK_METHOD,
  LINK_RULE,
  LINK_SOURCES,
  MANY_RED_LINES,
  manyRedLinesNote,
  priorityHead,
  READING_NEUTRAL,
  READING_STROKE,
  redLineSummary,
  rowMeta,
  signed,
  staleNotice,
  starLegend,
  SWAP_HEADS,
  swapText,
  TIE_MARK,
  TITLE_AGREE,
  TITLE_BOARD,
  TITLE_CAVEATS,
  TITLE_DONE,
  TITLE_PRIORITIES,
  TITLE_SWAP,
  TITLE_TOPICS,
  TITLE_WHY,
  unrankedLede,
  unrankedTitle,
  UNSTABLE_NOTE,
} from './resultsCopy'
import { withBase } from './routes'
import { displayScore, knownQuestions, METHOD_VERSION, methodPeers, strokesFor, type CandidateResult, type Results, type UnrankedResult } from './score'
import type { SessionState } from './storage'
import type { Candidate, ElectionPack } from './types'
import { VOTING_NOTE, withArticle } from '../ui/components/CurrentElection'
import { formatDate, formatMoment, percent } from '../ui/format'

export interface ReportInput {
  pack: ElectionPack
  /** Réponses et poids : pour les priorités (thèmes répondus à poids 2) */
  state: Pick<SessionState, 'answers' | 'weights'>
  /** Les résultats affichés : finalistResults ?? allResults (Results.tsx) */
  results: Results
  /** La bascule « Seulement les qualifiés pour le 2nd tour » est active */
  finalistsOnly: boolean
  /** Nombre de questions à revoir (prop `stale` de Results) */
  staleCount: number
  /** Élection archivée : vote en cours ou non (isVoting(votingUntil, now)), et nom de l'élection du site ; null sinon */
  archive: { voting: boolean; currentLabel: string } | null
  /** Slug de l'élection affichée (getBase()) : '' pour l'élection du site, son slug pour une archive */
  slug: string
  /** Nombre maximal de thèmes prioritaires (MAX_PRIORITIES de l'écran des priorités) */
  maxPriorities: number
  /** Moment de fabrication, sur l'horloge de l'appareil (donné : sortie déterministe) */
  now: Date
}

/** Le rapport, ce qu'il a perdu en route et son journal de mise en page (pour les tests) */
export interface ReportOutput {
  bytes: Uint8Array<ArrayBuffer>
  /** Caractères omis faute de code WinAnsi (vide attendu) */
  lost: string[]
  /** Blocs posés, page par page */
  log: FlowLogEntry[]
  pageCount: number
}

/* ---------- Palette (mode clair de src/styles/tokens.css, comparée au fichier par les tests) ---------- */

/** Encres du papier. Jamais lues dans la page (le mode sombre rendrait le papier carbone), jamais celles de l'affiche */
export const PDF_COLORS = {
  paper: '#ffffff',
  print: '#17191c',
  soft: '#4a4f57',
  rule: '#c9cbcf',
  ink: '#1f3bb3',
  /** L'encre bille à 45 % sur blanc, précalculée (pas de transparence) : bâtons pâlis */
  inkMuted: '#9aa7dd',
  red: '#c90f1a',
  /** Le double jaune : seulement sous l'affiche du plus proche */
  copy: '#f2e7a6',
  copyPrint: '#1d1b10',
  copySoft: '#4f4823',
  copyInk: '#1f3bb3',
  copyRed: '#c90f1a',
} as const

/** Échelle d'affinité : couleur sur papier, teinte de cellule, couleur sur le jaune de l'affiche */
export const PDF_BANDS: Readonly<Record<AffinityBand['key'], { color: string; tint: string; copy: string }>> = {
  'tres-proche': { color: '#00722e', tint: '#dcf7e1', copy: '#00672a' },
  proche: { color: '#53760e', tint: '#ebf7de', copy: '#4a690c' },
  mitige: { color: '#636363', tint: '#eeeeee', copy: '#5a5a5a' },
  eloigne: { color: '#b44f00', tint: '#ffece1', copy: '#9c4400' },
  'tres-eloigne': { color: '#b7191c', tint: '#ffe6e2', copy: '#b7191c' },
}

const C = PDF_COLORS
/** Désaccords (orangé-brun) et accords (vert) : jamais de rouge pour un désaccord */
const AGAINST = PDF_BANDS.eloigne.color
const FOR = PDF_BANDS['tres-proche'].color

/* ---------- Page ---------- */

/** Marges (15 mm), colonne de marge (rangs, numéros, croix), corps, haut et bas du contenu */
const ML = 42.52
const MR = 552.76
const CW = MR - ML
const B = ML + 32
const BW = MR - B
const CT = 84
const CB = 792
/** Les bâtons du classement : 62 pour le pourcentage, 10 de blanc, 68 pour quatre paquets */
const TX = MR - 62 - 10 - 68

const st = (font: FontKey, size: number, color: string = C.print, tz = 100, tc = 0): TextStyle => ({ font, size, color, tz, tc })
const thin = (color: string = C.rule, width = 0.6) => ({ color, width })

/* ---------- Textes propres au papier ---------- */

/** Étiquettes IA (forme de components/AiLabel.tsx) : celle des textes (questions, approches) et, là où le papier
 *  dit qui porte quoi, celle des positions des candidats, recherchées et résumées par IA comme sur le site */
const AI_TEXTS = { lead: 'Textes rédigés par IA', rest: 'vérifiés automatiquement' }
const AI_POSITIONS = { lead: 'Approches rédigées et positions résumées par IA', rest: 'vérifiées automatiquement contre leurs sources' }
const AI_WHAT =
  'Les questions et les approches citées ont été rédigées par une IA (Claude, d’Anthropic), et les positions attribuées aux candidats, sur lesquelles repose le calcul, recherchées et résumées par une IA, à partir des sources citées, puis vérifiées automatiquement\u00a0; elles ne sont pas relues une par une par une personne. Le calcul d’affinité, lui, n’utilise aucune IA.'
const PERSONAL = 'Document personnel\u00a0: '
const PERSONAL_REST = 'il contient vos priorités et vos lignes rouges. Ne le partagez qu’en connaissance de cause.'
/** Pied de chaque page : ce que doit dire une page imprimée ou transmise seule (document personnel, résultat
 *  indicatif, indépendance, part de l'IA) */
const FOOT_1 = 'Document personnel. Résultat indicatif\u00a0: ce n’est pas une consigne de vote. Calculé sur cet appareil, aucune réponse transmise.'
const FOOT_2 = 'Outil indépendant. Questions et approches rédigées, positions résumées par IA, vérifiées automatiquement, non relues une par une. Calcul sans IA.'
const TITLE_RED_LINES = 'Vos lignes rouges franchies'
const RED_LINES_LEDE =
  'Les approches que vous avez marquées «\u00a0ligne rouge\u00a0» et les candidats qui les portent. «\u00a0Peut-être\u00a0»\u00a0: leur position n’est qu’une déduction ou reste probable\u00a0; cela ne modifie pas le classement.'
const TITLE_ABOUT = 'À propos de ce document'
const SUITE = (title: string) => `${title} (suite)`

/** « isoloir.vercel.app » et l'adresse complète d'une page du site, dans l'élection affichée */
const HOST = APP_URL.replace(/^https?:\/\//, '')
const address = (slug: string, path: string) => {
  const p = withBase(slug, path)
  return { text: `${HOST}/${p}`, uri: `${APP_URL}/${p}` }
}

/** « isoloir-presidentielle-2027-depouillement-2026-10-11.pdf », à la date locale de l'appareil */
export function reportFileName(pack: ElectionPack, now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `isoloir-${pack.election.id}-depouillement-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.pdf`
}

/** Le rapport, en octets. Pur : aucun accès au DOM, au stockage ni à l'horloge. Lève une erreur si rien n'est noté. */
export function buildReportPdf(input: ReportInput): Uint8Array<ArrayBuffer> {
  return renderReport(input).bytes
}

/** Le rapport et ce qu'en vérifient les tests : caractères perdus, journal de mise en page */
export function renderReport(input: ReportInput): ReportOutput {
  const { pack, state, results, finalistsOnly, staleCount, archive, slug, now } = input
  const { election, bank } = pack
  if (results.answered === 0) throw new Error('rien à dépouiller : aucune réponse notée')

  const byId = new Map(pack.candidates.map(c => [c.id, c]))
  const who = (id: string): Candidate => {
    const c = byId.get(id)
    if (!c) throw new Error(`candidat inconnu : ${id}`)
    return c
  }
  const nameOf = (id: string) => who(id).name
  const topicLabel = new Map(bank.topics.map(t => [t.id, t.label]))
  const lost: string[] = []
  const wrap = (runs: readonly Run[], width: number, firstWidth = width) => wrapRuns(runs, width, firstWidth, lost)
  const lines = (s: string, width: number, style: TextStyle) => wrapText(s, width, style, lost)

  const { ranking, unranked, allIncompatible } = results
  const [first, second] = ranking
  const someOff = unranked.length > 0 || results.excluded.length > 0
  const compatible = ranking.filter(r => r.compatible || allIncompatible)
  const incompatible = allIncompatible ? [] : ranking.filter(r => !r.compatible)
  const flagged = (r: Pick<CandidateResult, 'compatible'>) => !r.compatible && !allIncompatible
  // Priorités : les thèmes répondus qui comptent double, dans l'ordre de la banque (jamais les étoiles vides de la page)
  const answeredTopics = new Set(bank.questions.filter(q => hasOpinion(state.answers[q.id])).map(q => q.topicId))
  const chosen = bank.topics.filter(t => answeredTopics.has(t.id) && state.weights[t.id] === 2)
  const chosenIds = new Set(chosen.map(t => t.id))
  const withRed = [...ranking, ...unranked].filter(r => r.dealbreakers.length > 0)

  const frozen = election.dataFrozenAt
  const frozenLong = formatDate(frozen).replace(/ /g, '\u00a0')
  const moment = formatMoment(now.toISOString())
  const independence = `Outil indépendant, édité par un citoyen, ${election.copy.independence.footer}.`

  /* ---------- Blocs communs ---------- */

  /** Titre de section ; keep : blocs suivants gardés avec lui (2, ou 1 devant un encart qui ouvre sa section) */
  const h2 = (title: string, keep = 2): Block => ({
    kind: 'h2',
    id: title,
    heading: true,
    keepWithNext: keep,
    gap: 22,
    height: 37.6,
    draw: (c, y) => {
      c.text(ML, y + 20, title, st('B', 20, C.print, 82))
      c.line(ML, y + 27, MR, y + 27, thin(C.print, 2.25))
    },
  })

  /** Sous-titre ; runs : un sous-titre en plusieurs styles, coupé sur la largeur utile ; keep : blocs suivants
   *  gardés avec lui (toute une section courte, posée d'un seul tenant) */
  const h3 = (title: string, gap = 16, runs?: Run[], keep = 2): Block => {
    const ls = wrap(runs ?? [{ text: title, style: st('B', 13, C.print, 85) }], CW)
    return {
      kind: 'h3',
      id: title,
      heading: true,
      keepWithNext: keep,
      gap,
      height: 16 * ls.length + 6,
      draw: (c, y) => void drawRunLines(c, ML, y + 13, ls, 16),
    }
  }
  const suite = (title: string): Block => h3(SUITE(title), 0)

  /** Ligne i d'une liste de n : la première et l'avant-dernière gardent la suivante, pour qu'une liste coupée laisse
   *  au moins deux lignes en bas de page et deux en page de suite */
  const listKeep = (i: number, n: number): number => (n > 1 && (i === 0 || i === n - 2) ? 1 : 0)
  const withKeep = (n: number) => (n > 0 ? { keepWithNext: n } : {})

  interface ParaOptions {
    kind?: string
    x?: number
    width?: number
    leading?: number
    gap?: number
    keep?: number
    /** Retrait de la première ligne (une icône la précède) */
    indent?: number
    /** Dessin avant le texte, la ligne de base de la première ligne donnée */
    before?: (c: PdfCanvas, baseline: number) => void
  }

  /** Paragraphe atomique en suites de styles (les morceaux qui portent une adresse deviennent cliquables) */
  const para = (runs: Run[], o: ParaOptions = {}): Block => {
    const x = o.x ?? ML
    const width = o.width ?? MR - x
    const size = Math.max(...runs.map(r => r.style.size))
    const leading = o.leading ?? size * 1.35
    const ls = wrap(runs, width, width - (o.indent ?? 0))
    const top = size * 0.92
    return {
      kind: o.kind ?? 'para',
      height: top + (ls.length - 1) * leading + size * 0.3,
      ...(o.gap === undefined ? {} : { gap: o.gap }),
      ...(o.keep ? { keepWithNext: o.keep } : {}),
      draw: (c, y) => {
        o.before?.(c, y + top)
        drawRunLines(c, x, y + top, ls, leading, x + (o.indent ?? 0))
      },
    }
  }

  /** Texte gris suivi d'une adresse du site, imprimée et cliquable */
  const withLink = (lead: string, label: string, path: string, size = 8.5): Run[] => {
    const a = address(slug, path)
    return [
      ...(lead ? [{ text: `${lead} `, style: st('R', size, C.soft) }] : []),
      { text: `${label}\u00a0: `, style: st('R', size, C.soft) },
      { text: a.text, style: st('R', size, C.print), link: a.uri },
    ]
  }

  /** Étiquette « Textes rédigés par IA · vérifiés automatiquement » (ou celle des positions) */
  const aiLabel = (label = AI_TEXTS): Block => ({
    kind: 'ai-label',
    gap: 4,
    height: 10,
    draw: (c, y) => {
      const w = c.text(ML, y + 7.5, label.lead, st('B', 7.5))
      c.text(ML + w, y + 7.5, `\u00a0· ${label.rest}`, st('R', 7.5, C.soft))
    },
  })

  /** Puce carrée et texte gris sur la largeur du corps */
  const bullet = (runs: Run[], gap = 4): Block =>
    para(runs, {
      kind: 'bullet',
      x: B,
      leading: 11.5,
      gap,
      before: (c, baseline) => c.rect(B - 8, baseline - 4.3, 2.5, 2.5, C.print),
    })

  /** Encadré : icône « i » et texte */
  const callout = (text: string, firstOne: boolean): Block =>
    para([{ text, style: st('R', 8.5) }], {
      kind: 'callout',
      x: ML + 14,
      leading: 11,
      gap: firstOne ? 10 : 5,
      before: (c, baseline) => info(c, ML + 5, baseline - 3, C.soft),
    })

  /* ---------- Pages : en-tête et pied ---------- */

  const writer = new PdfWriter({ title: `${TITLE_DONE} · ${election.shortName}`, created: now })

  // Archive : la ligne de la page 1, sous le double filet (même logique que le bandeau de la page)
  const archiveLines = archive
    ? wrap(
        [
          { text: 'Archive', style: st('B', 8.5) },
          {
            text:
              `\u00a0: données arrêtées au ${frozenLong}. ` +
              `${archive.voting ? VOTING_NOTE : (election.archived?.note ?? '')} ` +
              `${APP_NAME} ${withArticle('pour', archive.currentLabel)}\u00a0: `,
            style: st('R', 8.5),
          },
          { text: HOST, style: st('R', 8.5), link: APP_URL },
        ],
        CW,
      )
    : []
  const firstTop = archiveLines.length ? 100 + 11 * (archiveLines.length - 1) : CT

  const header = (c: PdfCanvas, page: number) => {
    const lg = c.logo(ML, 34, 20)
    c.textRight(MR, lg.baseline, election.shortName, st('R', 9))
    c.line(ML, 62, MR, 62, thin(C.print, 2.25))
    c.line(ML, 66.5, MR, 66.5, thin(C.print, 0.75))
    if (page === 0 && archiveLines.length) {
      drawRunLines(c, ML, 80, archiveLines, 11)
      const y = 86 + 11 * (archiveLines.length - 1)
      c.line(ML, y, MR, y, thin(C.print))
    }
  }

  const footer = (c: PdfCanvas, page: number, count: number) => {
    c.line(ML, 806, MR, 806, thin(C.print, 0.75))
    const foot = st('R', 7, C.soft)
    c.text(ML, 815.5, FOOT_1, foot)
    c.text(ML, 824.5, FOOT_2, foot)
    const w = c.textRight(MR, 815.5, HOST, foot)
    c.link(MR - w, 815.5 - 5.6, w, 7.4, APP_URL)
    c.textRight(MR, 824.5, `page ${page + 1}/${count}`, foot)
  }

  const flow = new Flow({
    bottom: CB,
    newPage: i => {
      const canvas = writer.addPage()
      header(canvas, i)
      return { canvas, top: i === 0 ? firstTop : CT }
    },
  })

  /* ---------- Tête (page 1) ---------- */

  const lede = finalistsOnly ? answeredLede(results.answered).replace(/\.$/, ', entre les seuls qualifiés pour le 2nd tour.') : answeredLede(results.answered)
  const made = lines(`Fabriqué sur cet appareil le ${moment} · ${election.shortName} · données ${election.dataVersion} · méthode ${METHOD_VERSION}`, CW, st('R', 8, C.soft))
  flow.place({
    kind: 'head',
    height: 69 + 10.5 * (made.length - 1),
    draw: (c, y) => {
      c.text(ML, y + 30, TITLE_DONE, st('B', 36, C.print, 80))
      stamp(c, MR - 128, y + 2, 'Positions arrêtées au', frozen.split('-').reverse().join('.'), { color: C.print })
      c.text(ML, y + 52, lede, st('R', 11))
      drawLines(c, ML, y + 66, made, st('R', 8, C.soft), 10.5)
    },
  })

  // Avant de lire : l'étiquette IA, l'indépendance, le caractère personnel du document
  {
    const what = lines(AI_WHAT, CW, st('R', 8, C.soft))
    const indep = lines(`${independence} Le résultat est indicatif\u00a0: ce n’est pas une consigne de vote.`, CW, st('R', 8))
    const personal = wrap([{ text: PERSONAL, style: st('B', 8) }, { text: PERSONAL_REST, style: st('R', 8) }], CW)
    const count = 1 + what.length + indep.length + personal.length
    const height = 5 + 7.5 + (count - 1) * 10.5 + 2 * 4 + 2.5 + 5
    flow.place({
      kind: 'before-reading',
      gap: 10,
      height,
      draw: (c, y) => {
        c.line(ML, y, MR, y, thin())
        let b = y + 5 + 7.5
        const w = c.text(ML, b, AI_TEXTS.lead, st('B', 8))
        c.text(ML + w, b, `\u00a0· ${AI_TEXTS.rest}`, st('R', 8, C.soft))
        b = drawLines(c, ML, b + 10.5, what, st('R', 8, C.soft), 10.5) + 10.5 + 4
        b = drawLines(c, ML, b, indep, st('R', 8), 10.5) + 10.5 + 4
        drawRunLines(c, ML, b, personal, 10.5)
        c.line(ML, y + height, MR, y + height, thin())
      },
    })
  }

  // Vos priorités : étoile pleine et thème, en ligne, sans jamais couper un thème
  {
    const head = st('B', 9)
    const rest = st('R', 9, C.soft)
    const restText = chosen.length ? `${priorityHead(chosen.length)}\u00a0:` : priorityHead(0)
    const headW = measure(TITLE_PRIORITIES, head) + 4 + measure(restText, rest)
    const restLines = chosen.length ? [restText] : lines(restText, CW - measure(TITLE_PRIORITIES, head) - 4, rest)
    const itemW = chosen.map(t => 11 + measure(t.label, st('R', 9)))
    const rows = chosen.length ? inlineRows(itemW, CW, 10, CW - headW - 10) : []
    const count = Math.max(1, rows.length, restLines.length)
    const height = 5 + 9 + 13 * (count - 1) + 7
    // Juste sous le bandeau « avant de lire » : son filet du bas sert de filet du haut
    flow.place({
      kind: 'priorities',
      height,
      draw: (c, y) => {
        const base = y + 14
        const x0 = ML + c.text(ML, base, TITLE_PRIORITIES, head) + 4
        drawLines(c, x0, base, restLines, rest, 13)
        rows.forEach((row, r) => {
          let x = r ? ML : x0 + measure(restText, rest) + 10
          for (const i of row) {
            const t = chosen[i]
            if (!t) continue
            star(c, x, base + 13 * r - 7.4, 8, C.ink)
            x += 11 + c.text(x + 11, base + 13 * r, t.label, st('R', 9)) + 10
          }
        })
        c.line(ML, y + height, MR, y + height, thin())
      },
    })
  }

  // Questions à revoir : elles changent le résultat
  if (staleCount > 0) {
    const ls = lines(`${staleNotice(staleCount)} À revoir sur le site, page «\u00a0Résultats\u00a0».`, CW - 12, st('R', 8.5))
    const height = 6 + 7.8 + 11 * (ls.length - 1) + 2.5 + 6
    flow.place({
      kind: 'stale',
      gap: 10,
      height,
      draw: (c, y) => {
        c.rect(ML, y, CW, height, undefined, thin(C.print, 1.1))
        drawLines(c, ML + 6, y + 13.8, ls, st('R', 8.5), 11)
      },
    })
  }

  // Comment lire : le neutre, la valeur d'un bâton, la méthode
  flow.place({
    kind: 'reading',
    gap: 8,
    height: 13,
    draw: (c, y) => {
      const s = st('R', 8.5, C.soft)
      const b = y + 9.5
      let x = ML + c.text(ML, b, READING_NEUTRAL, s) + 14
      miniTally(c, x, b - 7.5, C.ink)
      x += 4
      x += c.text(x, b, READING_STROKE, s) + 14
      x += c.text(x, b, `${LINK_METHOD}\u00a0: `, s)
      const a = address(slug, '/methode')
      const w = c.text(x, b, a.text, st('R', 8.5))
      c.link(x, b - 6.8, w, 8.9, a.uri)
    },
  })

  /* ---------- Affiche du plus proche ---------- */

  if (first && first.score !== null) {
    const c0 = who(first.candidateId)
    const band = affinityBand(first.score) as AffinityBand
    const X = ML + 102
    const colW = MR - 16 - X
    // Hors classement compris : la phrase compte tous les candidats qui franchissent une ligne rouge
    const crossing = [...ranking, ...unranked].filter(r => !r.compatible).length
    const notes: { lines: string[]; cross: boolean }[] = []
    const noteStyle = st('R', 8.5, C.copySoft)
    if (results.close && second) notes.push({ lines: lines(closeNote(nameOf(second.candidateId)), colW, noteStyle), cross: false })
    if (crossing > 0 && !allIncompatible) notes.push({ lines: lines(crossingNote(crossing), colW - 9, noteStyle), cross: true })
    const noteLines = notes.reduce((n, x) => n + x.lines.length, 0)
    const height = noteLines ? 112 + 11 * noteLines + 6 : 114
    flow.place({
      kind: 'poster',
      id: first.candidateId,
      gap: 16,
      height,
      draw: (c, y) => {
        c.rect(ML, y, CW, height, C.copy)
        c.line(ML, y + 1.125, MR, y + 1.125, thin(C.copyPrint, 2.25))
        identityTile(c, ML + 16, y + 18, 66, c0.initials, { ink: C.copyPrint, paper: C.paper, angle: 2, size: 26, tz: 72 })
        c.text(X, y + 30, leaderLead(allIncompatible), st('B', 9, C.copySoft))
        const nameStyle = st('B', 25, C.copyPrint, 80)
        c.text(X, y + 58, truncate(c0.name, colW, nameStyle), nameStyle)
        const color = PDF_BANDS[band.key].copy
        const base = y + 100
        let x = X + c.text(X, base, String(displayScore(first.score)), st('B', 44, color, 80))
        x += c.text(x, base, '\u00a0%', st('B', 22, color, 80)) + 8
        swatch(c, x, base - 7, color, 7)
        x += 11 + c.text(x + 11, base, band.label, st('B', 10, C.copyPrint)) + 18
        tally(c, x, base - 11.9 - 6.5, strokesFor(first.score), { color: C.copyInk })
        let b = y + 116
        for (const n of notes) {
          if (n.cross) cross(c, X + 3, b - 3, C.copyRed)
          b = drawLines(c, n.cross ? X + 9 : X, b, n.lines, noteStyle, 11) + 11
        }
      },
    })
  }

  /* ---------- Le classement ---------- */

  flow.place(h2(TITLE_BOARD))
  if (finalistsOnly) flow.place(para([{ text: `${FINALISTS_ONLY}.`, style: st('R', 9) }], { kind: 'finalists', keep: 1 }))
  const boardSuite = () => [suite(TITLE_BOARD)]

  // Encadrés : ceux qui s'appliquent, dans l'ordre de la page ; l'écart serré est dit sur l'affiche seulement. Ils
  // restent avec l'échelle, elle-même solidaire des deux dernières lignes : jamais un encadré seul en haut de page
  const notes = [
    allIncompatible ? allIncompatibleNote(someOff) : null,
    !results.stable && ranking.length ? `${UNSTABLE_NOTE}\u00a0: voir «\u00a0${TITLE_SWAP}\u00a0», dans «\u00a0${TITLE_AGREE}\u00a0».` : null,
    results.redLineCount > MANY_RED_LINES ? manyRedLinesNote(results.redLineCount) : null,
    withRed.length ? `Le détail des lignes rouges franchies est plus bas, dans «\u00a0${TITLE_RED_LINES}\u00a0».` : null,
  ].filter((n): n is string => !!n)

  /** Ligne du classement ; keep : blocs suivants gardés avec elle (la ligne suivante, ou l'échelle après la dernière) */
  const row = (r: CandidateResult, keep: number): Block => {
    const c0 = who(r.candidateId)
    const height = r.dealbreakers.length ? 54 : 40
    const pale = flagged(r)
    const band = affinityBand(r.score)
    return {
      kind: 'row',
      id: r.candidateId,
      height,
      ...withKeep(keep),
      continued: boardSuite,
      draw: (c, y) => {
        // Le rang suivi d'une espace : au copier-coller, « 2 Jean-Luc Mélenchon » (les initiales sont décoratives)
        c.text(ML, y + 21, `${r.rank} `, st('B', 20, C.print, 75))
        if (r.tied) c.text(ML, y + 30, TIE_MARK, st('B', 6, C.soft))
        initials(c, B + 10, y + 16, 10, c0.initials, { ink: C.print, paper: C.paper, size: 7 })
        const nameStyle = st('B', 10.5, pale ? C.soft : C.print)
        c.text(B + 26, y + 14, truncate(c0.name, 300, nameStyle), nameStyle)
        const party = st('R', 8, C.soft)
        c.text(B + 26, y + 25, truncate(c0.affiliation, TX - 10 - (B + 26), party), party)
        tally(c, TX, y + 9, strokesFor(r.score), { color: pale ? C.inkMuted : C.ink })
        if (band) {
          const color = PDF_BANDS[band.key].color
          // Le nombre, puis « % » précédé d'une insécable : « 59 % » au copier-coller, dans cet ordre
          const unit = st('B', 10.5, color, 76)
          const w = measure('\u00a0%', unit)
          c.textRight(MR - w, y + 22, percent(r.score), st('B', 21, color, 76))
          c.text(MR - w, y + 22, '\u00a0%', unit)
          c.textRight(MR, y + 31, band.label, st('B', 6.8, color))
        } else c.textRight(MR, y + 22, percent(null), st('B', 21, C.soft, 76))
        const meta = st('R', 7, C.soft)
        c.text(B + 26, y + 35, truncate(rowMeta(r, true), MR - 62 - (B + 26), meta), meta)
        if (r.dealbreakers.length) {
          cross(c, B + 28.6, y + 45.3, C.red)
          c.text(B + 35, y + 48, redLineSummary(r.dealbreakers), st('B', 8, C.red))
        }
        c.line(ML, y + height, MR, y + height, thin())
      },
    }
  }

  if (ranking.length) {
    // Chaque partie (avant et après l'intercalaire) se coupe en laissant deux lignes de chaque côté ; la dernière
    // ligne garde l'échelle
    const m = compatible.length
    const k = incompatible.length
    compatible.forEach((r, i) => flow.place(row(r, i === m - 1 && !k ? 1 : listKeep(i, m))))
    if (k) {
      flow.place({
        kind: 'divider',
        height: 24,
        keepWithNext: Math.min(2, k),
        continued: boardSuite,
        draw: (c, y) => {
          cross(c, ML + 3, y + 13, C.red)
          c.text(ML + 12, y + 16, CROSSING_DIVIDER, st('B', 9.5, C.print, 88))
          c.line(ML, y + 22, MR, y + 22, thin(C.print, 1.1))
        },
      })
      incompatible.forEach((r, i) => flow.place(row(r, i === k - 1 ? 1 : listKeep(i, k))))
    }
    // Échelle de lecture : chaque palier, sa couleur et son intervalle
    const label = st('R', 7.5)
    const range = st('R', 7.5, C.soft)
    const items = AFFINITY_BANDS.map(b => ({ b, w: 6.5 + 3 + measure(b.label, label) + measure(` ${bandRange(b)}`, range) }))
    const rows = inlineRows(
      items.map(i => i.w),
      CW,
      12,
    )
    flow.place({
      kind: 'scale',
      gap: 10,
      height: 8 + 11 * (rows.length - 1) + 3,
      ...withKeep(notes.length),
      draw: (c, y) => {
        rows.forEach((rw, k) => {
          let x = ML
          const base = y + 8 + 11 * k
          for (const i of rw) {
            const it = items[i]
            if (!it) continue
            swatch(c, x, base - 6, PDF_BANDS[it.b.key].color)
            const w = c.text(x + 9.5, base, it.b.label, label)
            c.text(x + 9.5 + w, base, ` ${bandRange(it.b)}`, range)
            x += it.w + 12
          }
        })
      },
    })
  } else flow.place(para([{ text: emptyRanking(results.minCoverageShare), style: st('R', 9) }], { kind: 'empty', gap: 6, leading: 12.5, keep: notes.length }))
  notes.forEach((n, i) => flow.place(callout(n, i === 0)))

  /* ---------- Hors classement, non classés ---------- */

  interface SideLine {
    text: string
    style: TextStyle
    cross?: boolean
  }

  /** Filet fort qui encadre ces listes, dessus et dessous, sur chaque page où elles passent */
  const strong = thin(C.print, 1.1)
  /** Bloc de hauteur nulle, sous « … (suite) » : le filet fort qui rouvre la liste en page de suite */
  const reopen = (): Block => ({ kind: 'rule', height: 0, draw: (c, y) => c.line(ML, y, MR, y, strong) })

  /** Ligne i (sur n) d'une liste de candidats hors du classement : cercle, nom, parti, et à droite ce que l'on sait
   *  de lui */
  const sideRow = (id: string, right: SideLine[], o: { pale: boolean; i: number; n: number; title: string }): Block => {
    const c0 = who(id)
    const height = 8 + 10 * Math.max(2, right.length) + 6
    const leftW = MR - 200 - (B + 22)
    const lastRow = o.i === o.n - 1
    return {
      kind: 'side-row',
      id,
      height,
      ...(o.i === 0 ? { gap: 7 } : {}),
      ...withKeep(listKeep(o.i, o.n)),
      continued: () => [suite(o.title), reopen()],
      // Liste coupée par la page : la dernière ligne posée la referme
      closeOnBreak: (c, bottom) => c.line(ML, bottom, MR, bottom, strong),
      draw: (c, y) => {
        if (o.i === 0) c.line(ML, y, MR, y, strong)
        initials(c, B + 8, y + 14, 8, c0.initials, { ink: C.print, paper: C.paper, size: 5.5 })
        const nameStyle = st('B', 9.5, o.pale ? C.soft : C.print)
        c.text(B + 22, y + 12, truncate(c0.name, leftW, nameStyle), nameStyle)
        const party = st('R', 7, C.soft)
        c.text(B + 22, y + 22, truncate(c0.affiliation, leftW, party), party)
        right.forEach((l, k) => {
          const base = y + 11 + 10 * k
          const w = c.textRight(MR, base, l.text, l.style)
          if (l.cross) cross(c, MR - w - 5, base - 2.7, C.red, 2.3)
        })
        c.line(ML, y + height, MR, y + height, lastRow ? strong : thin())
      },
    }
  }

  if (unranked.length && results.minCoverageShare !== null) {
    const n = unranked.length
    const title = unrankedTitle(n)
    flow.place(h3(title))
    flow.place(
      para([{ text: unrankedLede(n, results.minCoverageShare, false), style: st('R', 8.5, C.soft) }, { text: ' ', style: st('R', 8.5, C.soft) }, ...withLink('', LINK_RULE, '/methode/hors-classement')], {
        kind: 'lede',
        leading: 11.5,
        gap: 2,
        keep: 1,
      }),
    )
    unranked.forEach((r: UnrankedResult, i) => {
      const right: SideLine[] = [{ text: knownLine(r.known, r.answered), style: st('R', 7.5, C.soft) }]
      if (r.score !== null) right.push({ text: indicativeScore(r.score), style: st('B', 7.5) })
      if (r.dealbreakers.length) right.push({ text: redLineSummary(r.dealbreakers), style: st('R', 7.5, C.soft), cross: true })
      flow.place(sideRow(r.candidateId, right, { pale: !r.compatible, i, n, title }))
    })
  }

  if (results.excluded.length) {
    const n = results.excluded.length
    const title = excludedTitle(n)
    const total = bank.questions.length
    flow.place(h3(title, 16, [{ text: title, style: st('B', 13, C.print, 85) }, { text: excludedWhy(n), style: st('R', 13, C.soft, 85) }]))
    flow.place(para([{ text: `${excludedLede(n)} `, style: st('R', 8.5, C.soft) }, ...withLink('', LINK_RULE, '/methode/non-classes')], { kind: 'lede', leading: 11.5, gap: 2, keep: 1 }))
    results.excluded.forEach((id, i) =>
      flow.place(
        sideRow(id, [{ text: bankKnownLine(knownQuestions(pack, id), total), style: st('R', 7.5, C.soft) }], { pale: false, i, n, title }),
      ),
    )
  }

  /* ---------- Vos lignes rouges franchies (détail, propre au papier) ---------- */

  if (withRed.length) {
    flow.place(h3(TITLE_RED_LINES))
    // Qui franchit quoi : des positions de candidats, recherchées et résumées par IA, et non seulement des textes
    flow.place(aiLabel(AI_POSITIONS))
    flow.place(para([{ text: RED_LINES_LEDE, style: st('R', 8.5, C.soft) }], { kind: 'lede', leading: 11.5, gap: 4, keep: 1 }))
    // Qui porte chaque approche marquée : les classés par rang, puis les hors classement dans leur ordre
    const holders = new Map<string, { touche: string[]; possible: string[] }>()
    const add = (r: Pick<CandidateResult, 'candidateId' | 'dealbreakers'>, suffix: string) => {
      for (const d of r.dealbreakers) {
        const h = holders.get(d.approachId) ?? { touche: [], possible: [] }
        h[d.level].push(`${nameOf(r.candidateId)}${suffix}`)
        holders.set(d.approachId, h)
      }
    }
    for (const r of ranking) add(r, '')
    for (const r of unranked) add(r, '\u00a0(hors\u00a0classement)')
    const entries = bank.questions.flatMap(q => q.approaches.filter(a => holders.has(a.id)).map(a => ({ q, a })))
    entries.forEach(({ q, a }, i) => {
      const h = holders.get(a.id)
      if (!h) return
      const approach = lines(`«\u00a0${a.text}\u00a0»`, BW, st('R', 9))
      const groups = [
        h.touche.length ? wrap([{ text: 'Franchie par\u00a0: ', style: st('B', 8, C.red) }, { text: joinNames(h.touche), style: st('R', 8) }], BW) : [],
        h.possible.length ? wrap([{ text: 'Peut-être\u00a0: ', style: st('B', 8, C.soft) }, { text: joinNames(h.possible), style: st('R', 8) }], BW) : [],
      ].filter(g => g.length)
      const last = 24 + 11.5 * (approach.length - 1) + groups.reduce((t, g) => t + 12 + 10 * (g.length - 1), 0)
      const height = last + 7
      flow.place({
        kind: 'red-line',
        id: a.id,
        height,
        ...withKeep(listKeep(i, entries.length)),
        continued: () => [suite(TITLE_RED_LINES)],
        draw: (c, y) => {
          cross(c, ML + 6, y + 14, C.red)
          c.text(B, y + 12, topicLabel.get(q.topicId) ?? '', st('R', 7, C.soft))
          let b = drawLines(c, B, y + 24, approach, st('R', 9), 11.5)
          for (const g of groups) b = drawRunLines(c, B, b + 12, g, 10)
          c.line(ML, y + height, MR, y + height, thin())
        },
      })
    })
  }

  /* ---------- Accords et désaccords ---------- */

  if (ranking.length) {
    // L'encart, s'il y en a un, ouvre la section avec le titre. Le chapeau commence un autre groupe (chapeau,
    // légende, en-tête, deux entrées), qui rouvre la section par « (suite) » s'il passe en page suivante : un seul
    // groupe, du titre aux premières entrées, laisserait jusqu'à une demi-page blanche
    const swap = results.stable ? null : swapBox()
    flow.place(h2(TITLE_AGREE, swap ? 1 : 2))
    if (swap) flow.place(swap)
    flow.place({
      ...para([{ text: AGREE_LEDE, style: st('R', 8.5, C.soft) }], { kind: 'agree-lede', leading: 11.5, gap: 10, keep: 2 }),
      continued: () => [suite(TITLE_AGREE)],
    })
    const anyFlagged = ranking.some(flagged)
    if (anyFlagged) {
      flow.place({
        kind: 'legend',
        gap: 4,
        height: 11,
        draw: (c, y) => {
          cross(c, ML + 3, y + 5.5, C.red)
          c.text(ML + 10, y + 8.5, 'franchit au moins une de vos lignes rouges', st('R', 8, C.soft))
        },
      })
    }
    // Identité (rang, cercle, nom en entier croix comprise, pourcentage) : 170 points, plus si un nom l'exige
    // (200 au plus, au-delà le nom serait tronqué), puis deux colonnes de barres
    const identity = (r: CandidateResult) =>
      34 + measure(nameOf(r.candidateId), st('B', 9)) + (flagged(r) ? 10 : 0) + 6 + (r.score === null ? 0 : measure(`${displayScore(r.score)}\u00a0%`, st('R', 8)))
    const ID = ML + Math.min(200, Math.max(170, Math.ceil(Math.max(...ranking.map(identity)))))
    const colSpan = (MR - (ID + 10) - 8) / 2
    const cols = [ID + 10, ID + 10 + colSpan + 8]
    const half = colSpan / 2
    const maxLen = half - 18
    const max = Math.max(1, ...ranking.flatMap(r => [r.breakdown.main, r.breakdown.other]).flatMap(t => [t.agree, t.disagree]))
    const agreeHead = (): Block => ({
      kind: 'agree-head',
      gap: 8,
      height: 30,
      // L'en-tête n'est jamais seul avec une entrée en bas de page
      keepWithNext: Math.min(2, ranking.length),
      draw: (c, y) => {
        cols.forEach((x, k) => {
          const axis = x + half
          c.textCenter(axis, y + 10, AGREE_HEADS[k] ?? '', st('B', 8.5))
          c.textRight(axis - 3, y + 21, 'désaccords', st('B', 7, AGAINST))
          c.text(axis + 3, y + 21, 'accords', st('B', 7, FOR))
        })
        c.line(ML, y + 27, MR, y + 27, thin(C.print, 1.1))
      },
    })
    flow.place(agreeHead())
    ranking.forEach((r, i) => {
      const c0 = who(r.candidateId)
      const marked = flagged(r)
      flow.place({
        kind: 'agree-row',
        id: r.candidateId,
        height: 20,
        ...withKeep(listKeep(i, ranking.length)),
        continued: () => [suite(TITLE_AGREE), { ...agreeHead(), gap: 0 }],
        draw: (c, y) => {
          const base = y + 13.5
          c.text(ML, base, `${r.rank} `, st('B', 14, C.print, 75))
          initials(c, ML + 22, y + 10, 7.5, c0.initials, { ink: C.print, paper: C.paper, size: 5.5 })
          const pct = r.score === null ? '' : `${displayScore(r.score)}\u00a0%`
          const pctW = pct ? c.textRight(ID, base, pct, st('R', 8, C.soft)) : 0
          const nameStyle = st('B', 9, marked ? C.soft : C.print)
          const room = ID - pctW - 6 - (marked ? 10 : 0) - (ML + 34)
          const w = c.text(ML + 34, base, truncate(c0.name, room, nameStyle), nameStyle)
          if (marked) cross(c, ML + 34 + w + 4 + 2.3, base - 3.2, C.red, 2.3)
          if (r.score === null) c.text(cols[0] ?? 0, base, AGREE_NONE, st('R', 8, C.soft))
          else {
            ;[r.breakdown.main, r.breakdown.other].forEach((t, k) => {
              const axis = (cols[k] ?? 0) + half
              const left = (maxLen * t.disagree) / max
              const right = (maxLen * t.agree) / max
              if (left) c.rect(axis - left, y + 7, left, 6, AGAINST)
              if (right) c.rect(axis, y + 7, right, 6, FOR)
              c.line(axis, y + 3, axis, y + 17, thin(C.print, 1.1))
              const n = (v: number, color: string) => (v ? st('B', 8, color) : st('R', 8, C.soft))
              c.textRight(axis - left - 3, y + 12.9, String(t.disagree), n(t.disagree, AGAINST))
              c.text(axis + right + 3, y + 12.9, String(t.agree), n(t.agree, FOR))
            })
          }
          c.line(ML, y + 20, MR, y + 20, thin())
        },
      })
    })
  }

  /** Résultat sensible à la méthode : le classement complet et celui des seules approches principales, reliés */
  function swapBox(): Block | null {
    const peers = methodPeers(ranking, allIncompatible)
    const top = peers[0]
    if (!top) return null
    // Tri stable : à compte égal, l'ordre du classement complet
    const simple = peers.slice().sort((a, b) => b.simpleCount - a.simpleCount)
    const best = Math.max(...peers.map(r => r.simpleCount))
    const leaders = peers.filter(r => r.rank === top.rank)
    const ahead = peers.filter(r => r.simpleCount === best)
    const marked = new Set([...leaders, ...ahead].map(r => r.candidateId))
    const simpleRank = (r: CandidateResult) => 1 + peers.filter(x => x.simpleCount > r.simpleCount).length
    const parts = swapText(ahead.map(r => nameOf(r.candidateId)), leaders.map(r => nameOf(r.candidateId)))
    const text = wrap(
      parts.map((p, i) => ({ text: p, style: st(i % 2 ? 'B' : 'R', 9) })),
      CW - 24,
    )
    const colW = (CW - 24 - 30) / 2
    const left = ML + 12
    const right = left + colW + 30
    const titleBase = 12 + 10
    const textBase = titleBase + 18
    const headBase = textBase + 12.5 * (text.length - 1) + 10 + 12
    const firstRow = headBase + 15
    const height = firstRow + 12 * (peers.length - 1) + 3 + 12
    const index = (list: CandidateResult[], id: string) => list.findIndex(r => r.candidateId === id)
    return {
      kind: 'swap',
      gap: 10,
      height,
      draw: (c, y) => {
        c.rect(ML, y, CW, height, undefined, thin(C.print, 1.1))
        c.line(ML, y + 1.125, MR, y + 1.125, thin(C.print, 2.25))
        c.text(left, y + titleBase, TITLE_SWAP, st('B', 13, C.print, 85))
        drawRunLines(c, left, y + textBase, text, 12.5)
        c.text(left, y + headBase, SWAP_HEADS[0], st('B', 8, C.soft))
        c.text(right, y + headBase, SWAP_HEADS[1], st('B', 8, C.soft))
        const column = (x: number, list: CandidateResult[], rank: (r: CandidateResult) => number, value: (r: CandidateResult) => string) => {
          list.forEach((r, i) => {
            const base = y + firstRow + 12 * i
            const on = marked.has(r.candidateId)
            c.text(x, base, String(rank(r)), st('B', 9, C.print, 80))
            const vw = c.textRight(x + colW, base, value(r), st('R', 8.5, on ? C.print : C.soft))
            const ns = on ? st('B', 8.5) : st('R', 8.5, C.soft)
            c.text(x + 14, base, truncate(nameOf(r.candidateId), colW - 14 - vw - 6, ns), ns)
          })
        }
        column(left, peers, r => r.rank, r => `${displayScore(r.score)}\u00a0%`)
        column(right, simple, simpleRank, r => signed(r.simpleCount))
        // Traits : chaque candidat relié à sa place dans l'autre colonne (dessinés après le texte, dans la gouttière)
        for (const r of peers) {
          const on = marked.has(r.candidateId)
          const y1 = y + firstRow + 12 * index(peers, r.candidateId) - 3
          const y2 = y + firstRow + 12 * index(simple, r.candidateId) - 3
          c.line(left + colW + 4, y1, right - 4, y2, on ? thin(C.print, 1.5) : thin(C.rule, 0.6))
        }
      },
    }
  }

  /* ---------- Par thème ---------- */

  if (ranking.length) {
    flow.place(h2(TITLE_TOPICS))
    const legend = st('R', 8.5, C.soft)
    flow.place(
      para([{ text: `${starLegend(chosen.length, input.maxPriorities)} ${GRID_DASH}`, style: legend }], {
        kind: 'legend',
        leading: 11.5,
        gap: 0,
        indent: 10,
        keep: 1,
        before: (c, b) => star(c, ML - 0.5, b - 7, 9, C.ink),
      }),
    )
    flow.place(para([{ text: gridAllLine(ranking.length, someOff), style: legend }], { kind: 'legend', leading: 11.5, gap: 2, keep: 1 }))
    const topicRows = bank.topics.filter(t => ranking.some(r => r.topicScores[t.id] !== null && r.topicScores[t.id] !== undefined))
    const WT = 130
    // Plus de 18 colonnes : plusieurs tableaux équilibrés, qui répètent la colonne des thèmes
    const tables = Math.ceil(ranking.length / 18)
    const per = Math.ceil(ranking.length / tables)
    const nameStyle = st('B', 7.5)
    for (let k = 0; k < tables; k++) {
      const cols = ranking.slice(k * per, (k + 1) * per)
      const colW = Math.min(40, (CW - WT) / cols.length)
      const nameMax = Math.min(104, Math.max(40, ...cols.map(r => measure(nameOf(r.candidateId), nameStyle))))
      const headH = nameMax + 20
      const gridHead = (gap: number): Block => ({
        kind: 'grid-head',
        id: String(k),
        gap,
        height: headH,
        // Le haut en-tête des noms n'est jamais posé avec moins de deux lignes de thèmes
        ...withKeep(Math.min(2, topicRows.length)),
        draw: (c, y) => {
          cols.forEach((r, j) => {
            const cx = ML + WT + j * colW + colW / 2
            c.textRotated(cx + 2.6, y + nameMax + 4, 90, truncate(nameOf(r.candidateId), nameMax, nameStyle), nameStyle)
            c.textCenter(cx, y + nameMax + 14, String(r.rank), st('B', 7, C.soft, 80))
          })
          c.text(ML, y + nameMax + 14, 'Thème', st('B', 7, C.soft))
          c.line(ML, y + headH - 1, ML + WT + cols.length * colW, y + headH - 1, thin(C.print, 1.1))
        },
      })
      flow.place(gridHead(k ? 18 : 10))
      topicRows.forEach((t, i) => {
        const prio = chosenIds.has(t.id)
        const ls = lines(t.label, WT - 14, st(prio ? 'B' : 'R', 8))
        const height = Math.max(15, ls.length * 9.5 + 5.5)
        flow.place({
          kind: 'grid-row',
          id: `${t.id}${prio ? '*' : ''}`,
          height,
          ...withKeep(listKeep(i, topicRows.length)),
          continued: () => [suite(TITLE_TOPICS), gridHead(0)],
          draw: (c, y) => {
            if (prio) star(c, ML, y + height / 2 - 3.9, 8, C.ink)
            drawLines(c, ML + 12, y + (height - ls.length * 9.5) / 2 + 7, ls, st(prio ? 'B' : 'R', 8), 9.5)
            cols.forEach((r, j) => {
              const x = ML + WT + j * colW
              const v = r.topicScores[t.id] ?? null
              const band = affinityBand(v)
              if (!band) {
                c.textCenter(x + colW / 2, y + height / 2 + 2.9, percent(null), st('R', 8, C.soft))
                return
              }
              c.rect(x + 0.75, y + 0.75, colW - 1.5, height - 1.5, PDF_BANDS[band.key].tint)
              c.textCenter(x + colW / 2, y + height / 2 + 2.9, percent(v), st('B', 8, PDF_BANDS[band.key].color))
            })
            c.line(ML, y + height, ML + WT - 4, y + height, thin())
          },
        })
      })
    }
  }

  /* ---------- Ce qui les sépare ---------- */

  if (results.why.length && first && second) {
    const a = who(first.candidateId)
    const b = who(second.candidateId)
    const questionById = new Map(bank.questions.map(q => [q.id, q]))
    flow.place(h2(TITLE_WHY))
    flow.place(aiLabel())
    // Section courte (trois questions au plus) : la paire garde toute la liste et son pied, posés d'un seul tenant
    flow.place({
      kind: 'pair',
      gap: 8,
      height: 20,
      keepWithNext: results.why.length + 1,
      draw: (c, y) => {
        initials(c, ML + 7.5, y + 9, 7.5, a.initials, { ink: C.print, paper: C.paper, size: 5.5 })
        c.circle(ML + 20.5, y + 9, 8.6, C.paper)
        initials(c, ML + 20.5, y + 9, 7.5, b.initials, { ink: C.print, paper: C.paper, size: 5.5 })
        const s = st('B', 11, C.print, 82)
        let x = ML + 36
        x += c.text(x, y + 13, a.name, s)
        x += c.text(x, y + 13, ' et ', st('R', 11, C.soft, 82))
        c.text(x, y + 13, b.name, s)
      },
    })
    results.why.forEach((w, i) => {
      const ls = lines(questionById.get(w.questionId)?.prompt ?? '', BW, st('B', 9))
      const height = 17 + 12 * (ls.length - 1) + 6
      flow.place({
        kind: 'why',
        id: w.questionId,
        gap: i ? 0 : 6,
        height,
        continued: () => [suite(TITLE_WHY)],
        draw: (c, y) => {
          c.line(ML, y, MR, y, i ? thin() : thin(C.print, 1.1))
          c.text(ML, y + 17, `${i + 1} `, st('B', 13, C.print, 70))
          drawLines(c, B, y + 16, ls, st('B', 9), 12)
        },
      })
    })
    flow.place(para(withLink('', 'Question par question, avec les sources', '/proximite'), { kind: 'why-foot', gap: 6, leading: 11.5 }))
  }

  /* ---------- À garder en tête, à propos ---------- */

  // Sections courtes, posées d'un seul tenant avec leur titre : jamais une puce seule en haut de page
  const kept = caveats(election, results.minCoverageShare)
  flow.place(h3(TITLE_CAVEATS, 22, undefined, kept.length + 1))
  kept.forEach((t, i) => flow.place(bullet([{ text: t, style: st('R', 8.5, C.soft) }], i ? 4 : 2)))
  flow.place(para(withLink('', LINK_SOURCES, '/methode'), { kind: 'sources', x: B, gap: 6, leading: 11.5 }))

  const about = [
    `Fabriqué sur cet appareil par ${APP_NAME} le ${moment}. Aucune réponse n’a quitté l’appareil.`,
    `Données\u00a0: ${election.name}, version ${election.dataVersion}, positions arrêtées au ${frozenLong}. Méthode de calcul\u00a0: version\u00a0${METHOD_VERSION}.`,
    'Ce document contient vos opinions politiques (priorités, lignes rouges)\u00a0: ne le partagez qu’en connaissance de cause. «\u00a0Tout effacer\u00a0», sur le site, ne supprime pas ce fichier.',
    `Version accessible et interactive\u00a0: la page «\u00a0Résultats\u00a0» d’${APP_NAME}, sur l’appareil où vous avez répondu.`,
    `${independence} Ses textes sont rédigés par une IA à partir des sources citées et vérifiés automatiquement\u00a0; ils ne sont pas relus un par un par une personne. Le résultat est indicatif\u00a0: ce n’est pas une consigne de vote.`,
  ]
  flow.place(h3(TITLE_ABOUT, 22, undefined, about.length))
  about.forEach((t, i) => flow.place(bullet([{ text: t, style: st('R', 8.5, C.soft) }], i ? 4 : 2)))

  flow.flush()
  const count = writer.pageCount
  for (let i = 0; i < count; i++) footer(writer.page(i), i, count)
  const bytes = writer.toBytes()
  return { bytes, lost: [...new Set([...lost, ...writer.lost])], log: flow.log, pageCount: count }
}
