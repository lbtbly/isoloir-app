// Les mots de la page « Mon profil politique » (ui/screens/Profile.tsx). Fonctions pures qui renvoient du texte brut ;
// la page garde autour ses liens et ses balises. Ceux de sa rubrique de la Méthode sont à part
// (core/echiquierMethodCopy.ts), comme ceux qu'elles ont en commun (core/echiquierCommonCopy.ts, repris ici) : la
// rubrique, chargée à la demande par la Méthode, n'emporte ni la page ni son calcul.
// Règles d'écriture, les mêmes pour la rubrique (cahier des charges, § 5.6 ; DESIGN.md, The Reading Not Label Rule) :
// - le sujet de la phrase est toujours « vos réponses » ou « vos accords », jamais la personne : aucune étiquette ;
// - un bloc est toujours attribué à la grille (« que la grille classe à droite », « qu’elle classe ») ; les libellés
//   « extrême gauche » et « extrême droite » ne paraissent qu'en nom de colonne, dans « Comment lire » et dans des
//   phrases qui disent « la grille » ;
// - ni pourcentage dans la synthèse et les phrases (seuls le détail et la liste d'une ligne ouverte en donnent), ni
//   point, ni moyenne entre thèmes, ni « en tête » ;
// - aucun symbole de lecture : les mots « nettement plus près » et « nettement plus loin » ; seul « ? » reste, avec son
//   mot (décision du propriétaire du 12 octobre 2026 : les couleurs des cases suffisent).
// Typographie du site : espaces insécables avant « : ; ? ! », dans les guillemets et devant « % » (fr()).
// tests/echiquier-copy.test.ts vérifie ces règles.

import { affinityBand } from './affinity'
import { fr, word } from './echiquierCommonCopy'
import { joinNames, signed } from './resultsCopy'
import type { Mark, UnitReading } from './echiquier'
import { segments } from './echiquier'
import type { SpectrumAxisBloc } from './types'

const NB = '\u00a0'

/** Espaces insécables du site : dans core/echiquierCommonCopy.ts, avec la rubrique de la Méthode */
export { fr }

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

// La page d'attente, tant que la page ne s'affiche pas (core/profileAccess.ts) : la fiche d'état, puis un exemple
export type WaitState = 'vide' | 'en-cours' | 'sans-avis'
/** L'en-tête de la fiche d'état */
export const WAIT_WHERE: Record<WaitState, string> = {
  vide: 'Pas encore de réponse',
  'en-cours': 'Pas encore assez de réponses',
  'sans-avis': fr('Aucun avis pour l’instant'),
}
/** « 0 question sur 22 », « 7 questions sur 22 » : le chiffre est posé à part, en grand */
export const waitCount = (seen: number, total: number) => `question${seen > 1 ? 's' : ''} sur ${total}`
/**
 * La phrase de la fiche ; left : questions rapides qui restent ; added : ajoutées depuis un questionnaire fini. Elle
 * nomme « la lecture » plutôt qu'un pronom : après « le questionnaire rapide », « il » se rapporterait à lui
 */
export const waitText = (state: WaitState, total: number, left: number, added: boolean) =>
  fr(
    state === 'vide'
      ? `La lecture se fait sur vos réponses : elle s’affiche au bout des ${plural(total, 'question')} du questionnaire rapide, avec le dépouillement complet.`
      : state === 'sans-avis'
        ? `Vous avez passé les ${plural(total, 'question')} sans placer de repère : la lecture se fait sur vos avis, « d’accord » ou « pas d’accord ».`
        : added
          ? left > 1
            ? `${plural(left, 'question')} ont été ajoutées au questionnaire rapide depuis vos réponses : la lecture s’affiche de nouveau une fois ces questions vues.`
            : 'Une question a été ajoutée au questionnaire rapide depuis vos réponses : la lecture s’affiche de nouveau une fois cette question vue.'
          : `La lecture s’affiche au bout des ${plural(total, 'question')} du questionnaire rapide, avec le dépouillement complet : encore ${plural(left, 'question')}.`,
  )
/** Le bouton de la fiche : les libellés de l'accueil et de la tendance */
export const waitCta = (state: WaitState, left: number) =>
  state === 'vide' ? 'Commencer la feuille' : state === 'sans-avis' ? 'Relire la feuille' : fr(`Continuer : ${plural(left, 'question')}`)
/** L'exemple : la grille fictive de l'aperçu de l'accueil (core/resultsCopy.ts, PROFILE_PEEK), avec ses mots */
export const EXAMPLE_TITLE = 'À quoi ressemblera la lecture'
export const EXAMPLE_NOTE = fr('Exemple fictif : ces sujets n’existent pas, et les couleurs sont illustratives.')
export const exampleRow = (n: number) => `Sujet ${n}`
export const WAIT_DEEPEN = fr(
  'Après le questionnaire rapide, la plupart des thèmes n’ont qu’une question ; il en faut deux pour lire un thème seul. Approfondir, ensuite, permet de les lire un par un.',
)

// La fiche « Pour lire plus de thèmes », avant le graphique, tant que des thèmes à compléter ont des questions
// approfondies à voir (core/echiquier.ts, deeperTopics)
export const DEEPER_TITLE = 'Pour lire plus de thèmes'
export const deeperLede = (quickOnly: boolean) =>
  fr(
    quickOnly
      ? 'Après le questionnaire rapide, la lecture se fait surtout par famille de thèmes : il faut au moins deux questions pour lire un thème seul.'
      : 'Il faut au moins deux questions pour lire un thème seul.',
  )
/** « Sur une seule question : 16 thèmes » ; ceux sans réponse : unansweredLine */
export const thinLine = (n: number) => fr(`Sur une seule question : ${plural(n, 'thème')}`)
/** Le nom lu d'un thème de la fiche, devant son nom visible : le lien le coche dans « Approfondir » */
export const DEEPER_THEME = fr('Approfondir :')
export const DEEPER_GO = 'Choisir les thèmes à approfondir'
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
/**
 * Points 4 et 5 : la couleur d'une case, palier par palier, et ce qu'elle ne dit pas (le même texte dans la Méthode) :
 * dans core/echiquierCommonCopy.ts, avec la rubrique de la Méthode
 */
export { COLORS_CHANCE, HOW_COLOR } from './echiquierCommonCopy'
/** Point 6 : les lectures nettes, et le bloc inconnu */
export const HOW_MARKS: readonly string[] = [
  fr('Nettement plus près : votre affinité avec ce bloc dépasse nettement celle de vos avis placés au hasard.'),
  fr('Nettement plus loin : elle reste nettement en dessous. Sinon, rien de net, quelle que soit la couleur.'),
  fr('? inconnu : aucun candidat du bloc n’est connu sur vos questions.'),
]
export const HOW_NETTEMENT = fr('Nettement : des avis placés au hasard n’y arrivent pas neuf fois sur dix.')
export const HOW_MIN = fr('Il faut au moins deux questions pour lire un thème. Quand aucun thème d’une famille ne se lit seul, la famille entière est lue.')
export const HOW_NO_EFFECT = fr('Ni votre score, ni le classement, ni vos priorités n’en dépendent.')

// ——— Cases : le palier d'affinité, et les lectures nettes en mots ———

/** Les lectures en mots ; plus aucun symbole, sauf « ? » pour un bloc inconnu */
export const MARK_WORD: Record<Mark, string> = { pres: 'nettement plus près', loin: 'nettement plus loin', rien: 'rien de net', inconnu: 'aucun candidat connu' }
/** Le seul symbole gardé : un bloc sans candidat connu sur le sujet, toujours avec son mot */
export const UNKNOWN_GLYPH = '?'
export const UNKNOWN_WORD = 'inconnu'
/** Le palier d'une affinité moyenne, en minuscules : « très proche » ; null : « inconnu » */
export const palier = (affinity: number | null) => affinityBand(affinity)?.label.toLocaleLowerCase('fr') ?? UNKNOWN_WORD
/** La lecture nette d'une case, en mots ; null : rien de net */
export const netWord = (mark: Mark) => (mark === 'pres' || mark === 'loin' ? MARK_WORD[mark] : null)
/**
 * Nom d'une case pour les lecteurs d'écran : « Droite (grille du ministère de l’Intérieur) : proche, nettement plus
 * près »
 */
export const cellLabel = (blocLabel: string, affinity: number | null, mark: Mark) =>
  fr(`${blocLabel} (grille du ministère de l’Intérieur) : ${[palier(affinity), netWord(mark)].filter(Boolean).join(', ')}`)

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
        `Pas de lecture nette : la position des candidats que la grille classe ${whereAll(axis, unknown)} n’est pas connue sur vos questions ${r.kind === 'famille' ? 'de cette famille' : 'de ce thème'}.`,
      )
    case 'une-question':
      return ONE_QUESTION
  }
  // « que la grille classe » : la phrase « Rien de net » ne nomme pas la grille, « qu’elle » n'y aurait pas d'antécédent
  if (unknown.length === 1) text += ` La position des candidats que la grille classe ${where(axis, unknown)} n’est pas connue ici : la lecture se fait sans eux.`
  return fr(text)
}

export const ONE_QUESTION = fr('Une seule question : pas de lecture nette.')
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
/** La légende : les cinq paliers du site (core/affinity.ts), puis sa phrase */
export const KEY_LABEL = 'Les couleurs des cases'
export const KEY_TEXT = fr('Chaque case : votre affinité moyenne, sur ce sujet, avec les candidats du bloc.')
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
 * Le nom d'une ligne pour les lecteurs d'écran : son sujet, puis chaque bloc de la grille avec son palier et, s'il y a
 * lieu, sa lecture nette ; enfin ce qui manque. « Défense, 5 questions. Selon la grille : Extrême gauche, très proche,
 * nettement plus près ; Gauche, mitigé ; … »
 */
export function rowSummary(labels: readonly string[], name: string, meta: string, r: Pick<UnitReading, 'status' | 'cells'>): string {
  const blocs = r.cells.map((c, b) => [labels[b], palier(c.affinity), netWord(c.mark)].filter(Boolean).join(', ')).join(' ; ')
  const tail = r.status === 'une-question' ? ` ${ONE_QUESTION}` : r.status === 'blocs-inconnus' ? ' Pas de lecture nette.' : r.status === 'aucun' ? ' Rien de net.' : ''
  return fr(`${name}, ${meta}. Selon la grille : ${blocs}.${tail}`)
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
/** Une ligne ouverte : chaque bloc, son palier et son affinité moyenne, sa lecture nette, et alors ses candidats */
export const BLOCS_TITLE = 'Votre affinité, bloc par bloc'
/** « (2 autres, position inconnue ici) » */
export const othersUnknown = (n: number) => `(${n} autre${n > 1 ? 's' : ''}, position inconnue ici)`
export const BLOC_NOTE = fr('La lecture porte sur le bloc entier : les candidats d’un même bloc ne pensent pas tous pareil. Le détail donne votre affinité avec chacun.')
export const SEE_DETAIL = 'Voir le détail'
/** Un thème sur une seule question, dont la famille entière a sa ligne */
export const readWithFamily = (family: string) => fr(`Lu avec les autres thèmes de sa famille : « ${family} ».`)
/** Ni lecture ni écart nulle part */
export const EMPTY_CHART = fr('C’est fréquent : la lecture ne conclut que si l’écart dépasse nettement le hasard.')
/** Les sujets sans tendance nette, sous les lectures : l'intertitre et sa phrase */
export const flatTitle = (n: number) => `${plural(n, 'sujet')} sans tendance nette`
export const FLAT_HEAD = fr('Sur ces sujets, vos réponses ne se rapprochent ni ne s’écartent nettement d’aucun bloc : leurs couleurs restent à la portée du hasard.')
/** Puis les thèmes sans lecture nette : « 16 thèmes sur une seule question », ou, avec des blocs inconnus, sans lecture nette */
export const unreadTitle = (n: number, oneQuestionOnly: boolean) => (oneQuestionOnly ? `${plural(n, 'thème')} sur une seule question` : `${plural(n, 'thème')} sans lecture nette`)
export const unreadHead = (oneQuestionOnly: boolean) =>
  fr(
    `${oneQuestionOnly ? 'Une seule question ne permet pas de dire' : 'Sur une seule question, ou faute de candidats connus, on ne peut pas dire'} si un écart dépasse nettement le hasard : ces couleurs se lisent avec prudence.`,
  )
/** Sous le graphique : la source des colonnes, autour du lien (posé par la page) */
export const SOURCE = [
  fr('Les cinq colonnes sont les blocs de la grille des nuances politiques du ministère de l’Intérieur ('),
  fr('), écrite pour les sénatoriales 2026 : la présidentielle n’en a pas. Les libellés sont les siens.'),
] as const
/** Le lien de la source : « circulaire du 23 août 2026 » */
export const sourceLink = (date: string) => `circulaire du ${date}`
export const sourceWho = (panel: number) => fr(`Comptent les ${panel} candidats classés ; le bloc « Autres » de la grille ne compte pas.`)
/**
 * Les couleurs des cases (décision du propriétaire du 12 octobre 2026) : l'échelle d'affinité du site, jamais la
 * couleur d'un bloc
 */
export const COLORS_NOTE = fr(
  'Les couleurs sont celles de l’échelle d’affinité du site, de « très éloigné » à « très proche » : votre affinité moyenne avec les candidats de chaque bloc, sur chaque sujet, et non la couleur d’un bloc de la grille.',
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
/** L'écart au hasard, en points signés, et la lecture nette en mots : « +42 points, nettement plus près » */
export const gap = (affinity: number, chance: number, mark: Mark) => {
  const d = Math.round(affinity) - Math.round(chance)
  const net = netWord(mark)
  return `${signed(d)}${NB}point${Math.abs(d) > 1 ? 's' : ''}${net ? `, ${net}` : ''}`
}
export const chanceNote = (exact: boolean, n: number) =>
  fr(
    `Vos avis placés au hasard : la moyenne du même calcul ${exact ? `sur les ${n} placements possibles de vos avis` : `sur ${n} placements de vos avis tirés au hasard`}, question par question ; « nettement plus près » ou « nettement plus loin » quand moins d’un placement sur dix fait un tel écart, tous blocs confondus.`,
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
