// Les mots de la page « Mon profil politique » (ui/screens/Profile.tsx) et de sa rubrique de la Méthode. Fonctions
// pures qui renvoient du texte brut ; la page garde autour ses liens et ses balises.
// Règles d'écriture (cahier des charges, § 5.6 ; DESIGN.md, The Reading Not Label Rule) :
// - le sujet de la phrase est toujours « vos réponses » ou « vos accords », jamais la personne : aucune étiquette ;
// - un bloc est toujours attribué à la grille (« que la grille classe à droite », « qu’elle classe ») ; les libellés
//   « extrême gauche » et « extrême droite » ne paraissent qu'en nom de colonne, dans « Comment lire » et dans des
//   phrases qui disent « la grille » ;
// - ni pourcentage dans la synthèse et les phrases, ni point, ni moyenne entre thèmes, ni « en tête ».
// Typographie du site : espaces insécables avant « : ; ? ! », dans les guillemets et devant « % » (fr()).
// tests/echiquier-copy.test.ts vérifie ces règles.

import { joinNames, signed } from './resultsCopy'
import type { Mark, UnitReading } from './echiquier'
import { segments } from './echiquier'
import type { SpectrumAxisBloc } from './types'

const NB = '\u00a0'

/** Espaces insécables du site : avant « : ; ? ! », après « « » et avant « » », entre un nombre et « % » */
export const fr = (s: string): string =>
  s
    .replace(/ ([:;?!»])/g, `${NB}$1`)
    .replace(/« /g, `«${NB}`)
    .replace(/(\d) %/g, `$1${NB}%`)

/** « A », « A et B », « A, B et C » */
export const listFr = joinNames

/** « 1 question », « 3 questions » (nombre et nom soudés) */
const plural = (n: number, word: string) => `${n}${NB}${word}${n > 1 ? 's' : ''}`

const cap = (s: string) => s.charAt(0).toLocaleUpperCase('fr') + s.slice(1)

// ——— Noms ———

/** Le nom de la page, son panneau dans « Et maintenant » et son lien sous « Par thème » : dans core/resultsCopy.ts, avec
 *  le code de toutes les visites */
export { PROFILE_GRID_LINK as GRID_LINK, PROFILE_PANEL as PANEL_DESC, PROFILE_TITLE } from './resultsCopy'

export const LEDE = fr(
  'Vos réponses sur l’échiquier, thème par thème : se rapprochent-elles nettement des candidats qu’une grille officielle range à gauche, au centre ou à droite ? Une lecture de vos réponses, pas une étiquette.',
)
export const NO_AI = fr('Calcul sans IA, sur cet appareil ; rien n’est enregistré.')

// ——— États de la page ———

export const EMPTY = fr('Rien à lire pour l’instant : la lecture se fait sur vos réponses, après le questionnaire rapide.')
export const pending = (left: number) =>
  fr(`Le dépouillement n’est pas fini : il reste ${plural(left, 'question')} du questionnaire rapide. La lecture sur l’échiquier attend la fin du questionnaire rapide.`)
export const QUICK_ONLY = fr(
  'Après le questionnaire rapide, la plupart des thèmes n’ont qu’une question : la lecture se fait surtout par famille de thèmes. Approfondir permet de lire thème par thème.',
)
export const STATUS_BUSY = 'Lecture en cours, sur cet appareil…'
export const STATUS_READY = 'Lecture prête.'

// ——— Comment lire ———

export const HOW_TITLE = 'Comment lire'
export const WHO_COUNTS = 'Qui compte dans chaque bloc'
/** Point 1, autour de la source de la grille (un lien, posé par la page) */
export const HOW_COLUMNS = [
  fr('Les colonnes (les lignes, sur un écran étroit) : les cinq blocs de la grille des nuances politiques du ministère de l’Intérieur ('),
  fr('), de l’extrême gauche à l’extrême droite. Cette grille a été écrite pour les sénatoriales 2026 ; la présidentielle n’en a pas. Les libellés sont les siens.'),
] as const
/** Point 2 : qui compte ; panel : candidats de l'axe ; unscored : candidats non classés de l'élection */
export const howWho = (panel: number, unscored: number) =>
  fr(
    `Comptent les ${panel} candidats classés. ${
      unscored
        ? `Ne comptent pas : ${unscored > 1 ? `les ${unscored} candidats non classés` : 'le candidat non classé'}, ni le bloc « Autres » de la grille (écologistes, divers), qui n’est pas une place entre la gauche et le centre.`
        : 'Ne compte pas : le bloc « Autres » de la grille (écologistes, divers), qui n’est pas une place entre la gauche et le centre.'
    }`,
  )
export const HOW_CALC = fr(
  'Pour chaque bloc, on fait la moyenne de votre affinité, sur le thème, avec ses candidats (les pourcentages de « Par thème »). Puis on refait le même calcul avec vos mêmes avis placés au hasard entre les approches de chaque question.',
)
/** Point 4 : la légende des marques, une par ligne */
export const HOW_MARKS: readonly { mark: Mark; text: string }[] = [
  { mark: 'pres', text: fr('plus près : votre affinité avec ce bloc dépasse nettement celle de vos avis placés au hasard.') },
  { mark: 'loin', text: fr('plus loin : elle reste nettement en dessous.') },
  { mark: 'rien', text: fr('rien de net.') },
  { mark: 'inconnu', text: fr('aucun candidat du bloc n’est connu sur vos questions.') },
]
export const HOW_NETTEMENT = fr('Nettement : des avis placés au hasard n’y arrivent pas neuf fois sur dix.')
export const HOW_MIN = fr('Il faut au moins deux questions pour lire un thème. Quand aucun thème d’une famille ne se lit seul, la famille entière est lue.')
export const HOW_NO_EFFECT = fr('Ni votre score, ni le classement, ni vos priorités n’en dépendent.')

// ——— Marques ———

export const GLYPH: Record<Mark, string> = { pres: '▲', loin: '▽', rien: '·', inconnu: '?' }
export const MARK_WORD: Record<Mark, string> = { pres: 'plus près', loin: 'plus loin', rien: 'rien de net', inconnu: 'aucun candidat connu' }
/** Case d'une ligne sans lecture (une seule question, blocs inconnus) */
export const NO_READING_CELL = 'pas de lecture'
/** Nom d'une case pour les lecteurs d'écran : « Droite (grille du ministère de l’Intérieur) : plus près » */
export const cellLabel = (blocLabel: string, mark: Mark | null) =>
  fr(`${blocLabel} (grille du ministère de l’Intérieur) : ${mark ? MARK_WORD[mark] : NO_READING_CELL}`)

// ——— Formes des blocs dans les phrases ———

/**
 * Une suite contiguë de blocs : « à droite » ; « à l’extrême gauche et à gauche » ; à partir de trois, « de la gauche à
 * la droite », « du centre à l’extrême droite »
 */
export function where(axis: readonly SpectrumAxisBloc[], seg: readonly number[]): string {
  const first = axis[seg[0]!]!
  const last = axis[seg[seg.length - 1]!]!
  if (seg.length === 1) return first.where
  if (seg.length === 2) return `${first.where} et ${last.where}`
  return `${first.from} ${last.to}`
}

/** Des blocs quelconques, suite par suite : « à l’extrême gauche et à droite » */
export const whereAll = (axis: readonly SpectrumAxisBloc[], indices: readonly number[]) => listFr(segments(indices).map(s => where(axis, s)))

/** Libellé d'un groupe de la synthèse : « À droite », « Du centre à l’extrême droite », « À la fois à gauche et à droite » */
export function groupLabel(axis: readonly SpectrumAxisBloc[], near: readonly number[]): string {
  const segs = segments(near)
  return segs.length === 1 ? cap(where(axis, segs[0]!)) : `À la fois ${listFr(segs.map(s => where(axis, s)))}`
}

// ——— Phrases d'une unité ———

/** En-tête d'une ligne : « sur 3 questions » */
export const onQuestions = (n: number) => `sur ${plural(n, 'question')}`
/** En-tête d'une ligne de famille : « Les 5 thèmes ensemble » */
export const familyHead = (k: number) => `Les ${k} thèmes ensemble`
export const FAMILY_WHOLE = '(la famille entière)'

/** La phrase d'une unité lue (lecture, écarts, rien de net, blocs inconnus) ; « une-question » : voir oneQuestion */
export function unitSentence(axis: readonly SpectrumAxisBloc[], r: Pick<UnitReading, 'status' | 'near' | 'far' | 'cells' | 'kind'>): string {
  const unknown = r.cells.flatMap((c, b) => (c.mark === 'inconnu' ? [b] : []))
  const far = r.far.length ? whereAll(axis, r.far) : ''
  let text: string
  switch (r.status) {
    case 'lecture': {
      const segs = segments(r.near).map(s => where(axis, s))
      // Des deux bords : « des candidats que la grille classe A, de ceux qu’elle classe B et de ceux qu’elle classe C »
      text =
        segs.length === 1
          ? `Vos réponses se rapprochent nettement des candidats que la grille classe ${segs[0]}.`
          : `Vos réponses se rapprochent nettement, à la fois, ${listFr([`des candidats que la grille classe ${segs[0]}`, ...segs.slice(1).map(s => `de ceux qu’elle classe ${s}`)])}.`
      if (far) text += ` Elles s’écartent nettement de ceux qu’elle classe ${far}.`
      break
    }
    case 'ecarts':
      text = `Vos réponses ne se rapprochent nettement d’aucun bloc ; elles s’écartent nettement des candidats que la grille classe ${far}.`
      break
    case 'aucun':
      text = 'Rien de net : vos réponses ne se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc.'
      break
    case 'blocs-inconnus':
      return fr(
        `Pas de lecture : la position des candidats que la grille classe ${whereAll(axis, unknown)} n’est pas connue sur vos questions ${r.kind === 'famille' ? 'de cette famille' : 'de ce thème'}.`,
      )
    case 'une-question':
      return ONE_QUESTION
  }
  // « que la grille classe » : la phrase « Rien de net » ne nomme pas la grille, « qu’elle » n'y aurait pas d'antécédent
  if (unknown.length === 1) text += ` La position des candidats que la grille classe ${where(axis, unknown)} n’est pas connue ici : la lecture se fait sans eux.`
  return fr(text)
}

export const ONE_QUESTION = fr('Une seule question : pas de lecture.')
export const DEEPEN_THEME = 'Approfondir ce thème'

/**
 * Le constat d'un thème lu sur une seule question : qui porte en approche principale ce que vous y approuvez (vrai par
 * construction, jamais dans la synthèse). carriers : noms par bloc de l'axe ; null : vous n'y approuvez rien. placed :
 * vos accords sur une approche principale d'un candidat classé ; unplaced : ceux sur une approche qui ne l'est pour
 * aucun (la phrase dit les deux, sans prêter aux premiers ce que portent les seconds).
 */
export function oneQuestion(axis: readonly SpectrumAxisBloc[], carriers: readonly (readonly string[])[] | null, placed = 1, unplaced = 0): string | null {
  if (!carriers) return null
  const total = carriers.reduce((n, names) => n + names.length, 0)
  if (!total || !placed) return fr('Ce que vous y approuvez n’est l’approche principale d’aucun candidat classé.')
  // Bloc par bloc, chacun avec ses porteurs : « à gauche (A, B) et à droite (C) »
  const parts = carriers.flatMap((names, b) => (names.length ? [`${axis[b]!.where} (${names.join(', ')})`] : []))
  const whose = `${total > 1 ? 'de candidats' : 'd’un candidat'} que la grille classe ${listFr(parts)}`
  if (!unplaced)
    return fr(placed > 1 ? `Ce que vous y approuvez, ce sont les approches principales ${whose}.` : `Ce que vous y approuvez est l’approche principale ${whose}.`)
  const rest = unplaced > 1 ? 'les autres ne sont l’approche principale d’aucun candidat classé' : 'l’autre n’est l’approche principale d’aucun candidat classé'
  return fr(
    placed > 1
      ? `Parmi ce que vous y approuvez, ${placed} approches sont les approches principales ${whose} ; ${rest}.`
      : `Parmi ce que vous y approuvez, une approche est l’approche principale ${whose} ; ${rest}.`,
  )
}

// ——— Synthèse ———

export const SUMMARY_TITLE = fr('Où vos réponses se rapprochent nettement d’un bloc de la grille')
export const SUMMARY_EMPTY = fr('Aucun thème ne se rapproche nettement d’un bloc. C’est fréquent : la lecture ne conclut que si l’écart dépasse nettement le hasard.')
export const SUMMARY_NOTE = fr(
  'Selon la grille des nuances du ministère de l’Intérieur. Des réponses données au hasard obtiennent aussi quelques lectures, une ou deux en moyenne sur l’ensemble des thèmes, un peu plus selon la façon de répondre : chaque lecture se vérifie dans son détail.',
)
export const nothingLine = (n: number) => fr(`Rien de net : ${plural(n, 'thème')}`)
export const apartLine = (n: number) => fr(`Seulement plus loin d’un bloc : ${plural(n, 'thème')}`)
export const noReadingLine = (n: number) => fr(`Pas de lecture : ${plural(n, 'thème')}, sur une seule question ou faute de candidats connus`)
export const unansweredLine = (n: number) => fr(`Sans réponse : ${plural(n, 'thème')}`)

// ——— Le graphique « Sujet par sujet » : une ligne par sujet lu (ui/profile/Chart.tsx) ———
// Un sujet : un thème lu, ou sa famille entière quand aucun de ses thèmes ne se lit seul.

export const CHART_TITLE = 'Sujet par sujet'
/** Le compte, en tête du graphique : [avant, en gras, après] ; flat : sujets sans rien de net */
export const countRead = (read: number, flat: number) =>
  ['Sur ', plural(read, 'sujet'), fr(`, vos réponses se rapprochent nettement d’un bloc de la grille${flat ? ` ; sur ${flat}, rien de net` : ''}.`)] as const
export const COUNT_NONE = fr('Pour ces réponses, aucun sujet ne se rapproche nettement d’un bloc de la grille.')
/** Au-dessus du graphique, selon le pointeur : le doigt ou la souris */
export const HINT_TOUCH = 'Touchez un sujet pour voir pourquoi.'
export const HINT_CLICK = 'Cliquez sur un sujet pour voir pourquoi.'
export const KEY_TEXT = fr('Sur un sujet, vos réponses se rapprochent nettement des candidats d’un bloc, ou s’en écartent nettement : bien plus que vos mêmes avis placés au hasard.')
/** La ligne de l'axe : le sens de lecture, et le centre à 0 */
export const AXIS_LEFT = '← vers la gauche'
export const AXIS_ZERO = '0'
export const AXIS_MID = 'centre'
export const AXIS_RIGHT = 'vers la droite →'
/** Nom de la liste des blocs, pour les lecteurs d'écran */
export const zonesLabel = (blocs: number, panel: number) =>
  fr(`Les ${word(blocs)} blocs de la grille du ministère de l’Intérieur, de l’extrême gauche à l’extrême droite, et les ${panel} candidats classés qu’elle y range`)
/** Très étroit (texte très agrandi) : les noms passent sous le graphique */
export const WHO_LIST = fr('Qui la grille range dans chaque bloc :')
/** « 3 questions » */
export const questionsCount = (n: number) => plural(n, 'question')
/** Une ligne de famille : « 4 thèmes ensemble » */
export const themesTogether = (k: number) => `${k} thèmes ensemble`

/**
 * Le nom d'une ligne pour les lecteurs d'écran : son sujet, puis ses marques, chacune attribuée à la grille.
 * « Défense, 5 questions : plus près des candidats que la grille classe à l’extrême gauche, plus loin de ceux qu’elle
 * classe à gauche. »
 */
export function rowSummary(axis: readonly SpectrumAxisBloc[], name: string, meta: string, r: Pick<UnitReading, 'status' | 'near' | 'far' | 'cells'>): string {
  const head = `${name}, ${meta} : `
  if (r.status === 'une-question' || r.status === 'blocs-inconnus') return fr(`${head}pas de lecture.`)
  const parts: string[] = []
  const segs = segments(r.near).map(s => where(axis, s))
  if (segs.length === 1) parts.push(`plus près des candidats que la grille classe ${segs[0]}`)
  else if (segs.length > 1) parts.push(`plus près, à la fois, ${listFr([`des candidats que la grille classe ${segs[0]}`, ...segs.slice(1).map(s => `de ceux qu’elle classe ${s}`)])}`)
  if (r.far.length) parts.push(`${parts.length ? 'plus loin de ceux qu’elle classe' : 'plus loin des candidats que la grille classe'} ${whereAll(axis, r.far)}`)
  const unknown = r.cells.flatMap((c, b) => (c.mark === 'inconnu' ? [b] : []))
  const tail = unknown.length ? ` La position des candidats que la grille classe ${whereAll(axis, unknown)} n’est pas connue ici.` : ''
  return fr(`${head}${parts.length ? parts.join(', ') : 'rien de net'}.${tail}`)
}

/** Nom de la liste des lignes lues d'un seul côté, pour les lecteurs d'écran */
export const MAIN_LABEL = fr('Sujets où vos réponses se rapprochent nettement d’un bloc, rangés de la gauche vers la droite de la grille')
/**
 * Les lectures de part et d'autre du centre, sans lui (ui/profile/rows.ts, acrossCentre) : l'intertitre, sa phrase, et
 * la note d'une ligne ouverte. « Aux deux bouts » quand elles touchent l'extrême gauche et l'extrême droite ; sinon
 * (gauche et droite, extrême gauche et droite…), « des deux côtés ».
 */
export const BOTH_TITLE = 'Aux deux bouts à la fois'
export const SIDES_TITLE = 'Des deux côtés à la fois'
/** L'intertitre de la section : ends, toutes ses lignes touchent les deux bouts de la grille */
export const bothTitle = (ends: boolean) => (ends ? BOTH_TITLE : SIDES_TITLE)
export const BOTH_HEAD = fr('Sur ces sujets, vos réponses se rapprochent nettement de candidats que la grille classe des deux côtés. On ne fait pas de moyenne : ce n’est pas le centre.')
export const BOTH_ROW = ['Aux deux bouts à la fois. ', fr('Vos réponses rejoignent ici des candidats des deux côtés de la grille. On ne les additionne pas : ce n’est pas une place au centre.')] as const
/** La note d'une ligne ouverte : [en gras, la suite] ; ends, la ligne touche les deux bouts de la grille */
export const bothRow = (ends: boolean) => (ends ? BOTH_ROW : ([`${SIDES_TITLE}. `, BOTH_ROW[1]] as const))
export const APART_TITLE = 'Seulement plus loin'
export const APART_HEAD = fr('Sur ces sujets, vos réponses ne se rapprochent nettement d’aucun bloc, mais s’écartent nettement d’au moins un.')
/** Une ligne ouverte : les candidats des blocs marqués */
export const WHO_NEAR = `${GLYPH.pres} Plus près, bloc par bloc`
export const WHO_FAR = `${GLYPH.loin} Plus loin, bloc par bloc`
/** « (2 autres, position inconnue ici) » */
export const othersUnknown = (n: number) => `(${n} autre${n > 1 ? 's' : ''}, position inconnue ici)`
export const BLOC_NOTE = fr('La lecture porte sur le bloc entier : les candidats d’un même bloc ne pensent pas tous pareil. Le détail donne votre affinité avec chacun.')
export const SEE_DETAIL = 'Voir le détail'
/** Un thème sur une seule question, dont la famille entière a sa ligne */
export const readWithFamily = (family: string) => fr(`Lu avec les autres thèmes de sa famille : « ${family} ».`)
/** Ni lecture ni écart nulle part */
export const EMPTY_CHART = fr('C’est fréquent : la lecture ne conclut que si l’écart dépasse nettement le hasard.')
/** Les plis sous le graphique */
export const flatFold = (n: number) => `${plural(n, 'sujet')} sans tendance nette`
/** [libellé, précision] : « 16 thèmes sur une seule question · pas de lecture », ou, avec des blocs inconnus, sans lecture */
export const unreadFold = (n: number, oneQuestionOnly: boolean) =>
  oneQuestionOnly ? ([`${plural(n, 'thème')} sur une seule question`, 'pas de lecture'] as const) : ([`${plural(n, 'thème')} sans lecture`, 'sur une seule question ou faute de candidats connus'] as const)
/** Sous le graphique : la source des colonnes, autour du lien (posé par la page) */
export const SOURCE = [
  fr('Les cinq colonnes sont les blocs de la grille des nuances politiques du ministère de l’Intérieur ('),
  fr('), écrite pour les sénatoriales 2026 : la présidentielle n’en a pas. Les libellés sont les siens.'),
] as const
/** Le lien de la source : « circulaire du 23 août 2026 » */
export const sourceLink = (date: string) => `circulaire du ${date}`
export const sourceWho = (panel: number) => fr(`Comptent les ${panel} candidats classés ; le bloc « Autres » de la grille ne compte pas.`)
/** Les couleurs des colonnes (décision du propriétaire du 12 octobre 2026) : celles de la page des candidats */
export const COLORS_NOTE = fr(
  `Les couleurs repèrent les blocs de la grille, comme sur la page des candidats : rouge à gauche, jaune au centre, bleu à droite. Ce sont les mots, ${GLYPH.pres} ${MARK_WORD.pres} et ${GLYPH.loin} ${MARK_WORD.loin}, qui disent la lecture.`,
)
export const CALC_TITLE = 'Comment c’est calculé'

// ——— Le détail, sujet par sujet : le tableau complet, replié ———

export const DETAIL_TITLE = 'Le détail, sujet par sujet'
export const DETAIL_INTRO = fr('Pour chaque bloc : votre affinité moyenne avec ses candidats, la même avec vos avis placés au hasard, et l’écart. Puis, dans la page, chaque candidat et chaque question.')
export const detailShow = (n: number) => (n > 1 ? `Afficher le détail des ${n} sujets` : 'Afficher le détail du sujet')

// ——— Le tableau ———

export const TABLE_TITLE = 'Thème par thème'
export const TABLE_CAPTION = 'Vos réponses face aux candidats de chaque bloc de la grille, par thème'
export const TABLE_THEME = 'Thème'

// ——— Le détail d'une unité ———

export const DETAIL = 'Le détail'
export const DETAIL_HEADS = ['Bloc', 'Candidats connus', 'Votre affinité moyenne', 'Vos avis placés au hasard', 'Écart'] as const
export const NONE_KNOWN = 'aucun candidat connu'
export const ONE_KNOWN = '(un seul candidat connu)'
/** « 65 % » */
export const pct = (v: number) => `${Math.round(v)}${NB}%`
/** L'écart au hasard, en points signés, et la marque en mot : « +42 points, plus près » */
export const gap = (affinity: number, chance: number, mark: Mark) => {
  const d = Math.round(affinity) - Math.round(chance)
  return `${signed(d)}${NB}point${Math.abs(d) > 1 ? 's' : ''}${mark === 'pres' || mark === 'loin' ? `, ${MARK_WORD[mark]}` : ''}`
}
export const chanceNote = (exact: boolean, n: number) =>
  fr(
    `Vos avis placés au hasard : la moyenne du même calcul ${exact ? `sur les ${n} placements possibles de vos avis` : `sur ${n} placements de vos avis tirés au hasard`}, question par question ; « plus près » ou « plus loin » quand moins d’un placement sur dix fait un tel écart, tous blocs confondus.`,
  )
export const PER_CANDIDATE = 'Votre affinité avec chaque candidat'
export const UNKNOWN_POSITION = '(position inconnue)'
export const UNRANKED_FOR_YOU = '(hors classement pour vous)'
export const BY_QUESTION = 'Question par question'
export const YOUR_VIEW = fr('Votre avis :')
export const RED_LINE_VIEW = 'Pas d’accord, ligne rouge'
export const MAIN_OF = fr('Approche principale de :')
export const BOTH_SIDES = 'Portée des deux côtés'
export const MAIN_OF_NONE = 'Approche principale d’aucun candidat classé'
export const SEE_IN_PROXIMITY = 'Voir dans Qui porte quoi'
/** Accords sur des approches que ne porte en principal aucun candidat classé */
export const unplaced = (n: number, family: boolean) =>
  fr(
    n > 1
      ? `${n} de vos accords ${family ? 'sur ces thèmes' : 'sur ce thème'} portent sur des approches qui ne sont l’approche principale d’aucun candidat classé : elles ne rapprochent d’aucun bloc en particulier.`
      : `Un de vos accords ${family ? 'sur ces thèmes' : 'sur ce thème'} porte sur une approche qui n’est l’approche principale d’aucun candidat classé : elle ne rapproche d’aucun bloc en particulier.`,
  )

// ——— À garder en tête ———

export const CAVEATS_TITLE = 'À garder en tête'
export const caveats = (panel: number) => [
  fr('La grille classe des partis et des candidats, pas des idées : une même approche est souvent portée dans plusieurs blocs, et les candidats d’un même bloc ne pensent pas tous pareil.'),
  fr(`Une lecture situe vos réponses par rapport à ces ${panel} candidats, tels que la grille les range ; elle changerait avec d’autres candidats.`),
  fr('Sur peu de questions, la lecture est fragile, et des réponses données au hasard en obtiennent parfois une.'),
  fr('Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
]
export const METHOD_LINK = 'La méthode en détail'

// ——— La rubrique de la Méthode (#/methode/profil) ———

/**
 * Ce que publie la Méthode, mesuré par tools/audit-echiquier.mjs (clones de chaque candidat classé retirés du calcul,
 * profils tirés au hasard selon six façons de répondre) ; tests/echiquier-calibration.test.ts vérifie que la mesure
 * reste à 5 points près (0,5 pour les moyennes et le rapport). Une mise à jour des positions qui les fait bouger :
 * refaire l'audit, reporter ici, et dire le changement au journal.
 */
export const ECHIQUIER_PUBLISHED = {
  /** Date de la mesure */
  measured: '2026-10-12',
  /** Clones larges, sans le candidat : part des lectures qui désignent son bloc (%) */
  hitWithout: 70,
  /** La même part, bloc vrai par bloc vrai : la plus basse et la plus haute (%) */
  hitWithoutMin: 44,
  hitWithoutMax: 91,
  /** Les mêmes, avec le candidat dans le calcul, comme sur le site (%) */
  hitWith: 91,
  /** Les mêmes, sans le candidat : part des thèmes lus de l'autre côté du centre (%) */
  wrongSideWithout: 0,
  /** Profils tirés au hasard (un quart d'accord, un quart de désaccord) : part des thèmes lus (%) */
  randomThemes: 5,
  /** La même part, pour la façon de répondre qui en reçoit le plus (un seul accord par question, rien d'autre) (%) */
  randomThemesMax: 9,
  /** Profils tirés au hasard (un quart d'accord, un quart de désaccord) : lectures de la synthèse par profil, en moyenne */
  randomPerProfile: 1.4,
  /** La même moyenne, pour la façon de répondre qui en reçoit le plus */
  randomPerProfileMax: 2.4,
  /**
   * Un seul accord par question (avec ou sans désaccords ailleurs) : dans la synthèse, la part moyenne des blocs que
   * la grille classe aux extrêmes, rapportée à celle du bloc qu'elle classe à gauche ; sur la banque entière, puis sur
   * le seul questionnaire rapide. Ce rapport varie d'un échantillon à l'autre (de 1,3 à 1,7 sur la banque entière, de
   * 2,0 à 2,3 sur le rapide, pour 200 à 2 000 profils par façon de répondre) : la valeur publiée est leur milieu. Avis
   * mêlés : chaque bloc reçoit de 18 à 22 % des lectures, aucun n'est favorisé.
   */
  oneChoiceRatio: 1.5,
  oneChoiceRatioQuick: 2.2,
} as const

/** « 1,4 » */
const decimal = (x: number) => String(x).replace('.', ',')
/** Un rapport, en mots : « environ une fois et demie », « environ deux fois » */
const times = (x: number) => (x < 1.25 ? 'un peu' : x < 1.75 ? 'environ une fois et demie' : `environ ${word(Math.round(x))} fois`)

const WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt']
const word = (n: number) => WORDS[n] ?? String(n)

/** Point 1, autour du lien vers « L’ordre des candidats » (posé par la page) */
export const methodIntro = (blocs: number) =>
  [
    fr('Après le dépouillement complet, la page « Mon profil politique » lit vos réponses thème par thème au regard de la grille des nuances politiques du ministère de l’Intérieur (voir '),
    fr(
      `). Pour chacun de ses ${word(blocs)} blocs, de l’extrême gauche à l’extrême droite, elle dit si vos réponses se rapprochent nettement des candidats de ce bloc, s’en écartent nettement, ou rien de net. Elle ne change ni votre score, ni le classement, ni vos priorités, et n’existe pas pendant la première tendance.`,
    ),
  ] as const
export const METHOD_INTRO_LINK = 'l’ordre des candidats'
/** Le schéma, en mots */
export const METHOD_DIAGRAM_CAPTION = fr(
  'Vos avis donnent votre affinité par thème avec chaque candidat, le calcul même du score. On en fait la moyenne par bloc de la grille, puis on la compare à celle de vos mêmes avis placés au hasard : plus près, rien de net, ou plus loin.',
)
export const methodWho = (panel: number, unscored: number, minBloc: number, maxBloc: number, othersEmpty: boolean) =>
  fr(
    `Comptent les ${panel} candidats classés, chacun dans le bloc de sa nuance. Ne comptent pas ${
      unscored ? `les ${unscored} candidats non classés, qui n’ont pas de score, ni ` : ''
    }le bloc « Autres » de la grille (écologistes, divers) : la grille le place entre la gauche et le centre comme une liste, pas comme une position${
      othersEmpty ? ', et aucun candidat classé n’y figure' : ''
    }. Chaque bloc compte une fois${minBloc === maxBloc ? '' : `, qu’il ait ${word(minBloc)} candidats ou ${word(maxBloc)}`}.`,
  )
export const METHOD_CALC = fr(
  'Pour un thème, votre affinité avec un candidat est celle du tableau « Par thème » de vos résultats : même calcul, mêmes questions, mêmes positions. On en fait la moyenne sur les candidats de chaque bloc connus sur vos questions. Pour une famille de thèmes, on fait d’abord la moyenne des thèmes.',
)
export const methodChance = (gapPoints: number) =>
  fr(
    `Une affinité seule ne suffit pas : qui approuve beaucoup est proche de tout le monde, qui désapprouve beaucoup de personne. On refait donc le même calcul en gardant vos avis, autant de « d’accord », de « pas d’accord » et de « sans avis » sur chaque question, mais placés au hasard entre ses approches : tous les placements possibles quand ils sont mille au plus, sinon 999 placements tirés au sort, toujours les mêmes pour les mêmes réponses. Un bloc est « plus près » quand votre affinité avec lui dépasse nettement celle de ces placements (d’au moins ${gapPoints} points, et à ${50 + gapPoints} % au moins), « plus loin » quand elle reste nettement en dessous (d’au moins ${gapPoints} points, et à ${50 - gapPoints} % au plus). « Nettement » : des placements au hasard n’atteignent pas un tel écart une fois sur dix, tous blocs confondus. C’est pourquoi tout approuver, ou tout désapprouver, ne rapproche d’aucun bloc.`,
  )
export const METHOD_WHEN_NOT = fr(
  'Un thème se lit sur deux questions au moins. Il ne se lit pas quand les candidats de plus d’un bloc sont inconnus sur vos questions. Quand aucun thème d’une famille ne se lit seul, la famille entière est lue : c’est ce qui permet une lecture après le seul questionnaire rapide, qui ne pose souvent qu’une question par thème.',
)
export const METHOD_NO_POINT = fr(
  'Placer vos réponses en un point entre l’extrême gauche et l’extrême droite les ramènerait vers le centre, et mettrait au centre quelqu’un qui approuve à la fois des approches portées aux deux extrêmes. La page dit donc bloc par bloc ce qui ressort, sans jamais additionner les thèmes ni vous attribuer de position.',
)
/**
 * Ce que valent les lectures, en deux temps : les clones (le bloc désigné, et les glissements vers un bloc voisin, des
 * deux côtés, tels que les mesure l'audit), puis le hasard (combien de lectures, et leur répartition entre les blocs,
 * qui dépend de la façon de répondre)
 */
export const methodWorth = (m: typeof ECHIQUIER_PUBLISHED = ECHIQUIER_PUBLISHED) =>
  [
    fr(
      `Pour l’éprouver, on a recopié les réponses de chaque candidat classé, puis on l’a retiré du calcul. Quand la page conclut, elle désigne son bloc dans ${m.hitWithout} % des cas, de ${m.hitWithoutMin} % à ${m.hitWithoutMax} % selon le bloc, et ${
        m.wrongSideWithout ? `ne lit de l’autre côté du centre que sur ${m.wrongSideWithout} % des thèmes` : 'ne lit jamais de l’autre côté du centre'
      }. Avec lui, comme sur le site, c’est ${m.hitWith} %. Les blocs sont inégalement lisibles : les candidats que la grille classe à l’extrême gauche portent des approches proches entre elles, ceux des autres blocs moins. Des réponses proches de celles d’un candidat sont donc souvent lues dans un bloc voisin du sien, d’un côté comme de l’autre : celles d’un candidat que la grille classe à gauche, « à l’extrême gauche » ; celles d’un candidat qu’elle classe au centre ou à l’extrême droite, « à droite » ; celles d’un candidat qu’elle classe à droite, « au centre » ou « à l’extrême droite ».`,
    ),
    fr(
      `Des réponses tirées au hasard reçoivent une lecture sur un thème sur ${word(Math.round(100 / m.randomThemes))} à un sur ${word(Math.round(100 / m.randomThemesMax))} selon la façon de répondre, soit de ${decimal(m.randomPerProfile)} à ${decimal(m.randomPerProfileMax)} lectures en moyenne sur l’ensemble. Quand les avis sont mêlés (d’accord, pas d’accord, sans avis), aucun bloc n’y est favorisé. ${
        Math.max(m.oneChoiceRatio, m.oneChoiceRatioQuick) < 1.15
          ? 'Quand on n’approuve qu’une approche par question, non plus.'
          : `Quand on n’approuve qu’une approche par question, elles tombent moins souvent sur les candidats que la grille classe à gauche que sur ceux qu’elle classe aux extrêmes : ${times(m.oneChoiceRatio)} moins sur l’ensemble des questions, ${times(m.oneChoiceRatioQuick)} moins après le seul questionnaire rapide.`
      }`,
    ),
  ] as const
export const METHOD_LIMITS = [
  fr('La grille classe des partis et des candidats, pas des idées ; la présidentielle n’attribue pas de nuances, et certaines ont été déduites (voir '),
  fr('). Une lecture dépend des candidats en lice et de leurs positions, recherchées et résumées par IA : elle peut changer quand elles sont mises à jour. Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
] as const
export const METHOD_PRIVACY = fr(
  'Calcul sans IA, sur votre appareil ; la lecture reste seulement en mémoire le temps de la visite (un rechargement l’oublie), et rien n’est enregistré ni envoyé.',
)
