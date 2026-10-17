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
// - aucun mot de qualité (« surtout », « fragile », « solide », « presque ») ; jamais « vous êtes au centre »,
//   « modéré », « incohérent », « personne ne vous représente » ; chaque phrase ne paraît que quand elle est vraie ;
// - la comparaison se dit « les autres façons de poser vos mêmes avis », jamais « hasard » ; les profils de la
//   calibration sont « des feuilles remplies par un programme, sans suivre aucun candidat » (décision du propriétaire du
//   15 octobre 2026, D2).
// Vocabulaire : un « domaine » est une famille de thèmes (pack.topicGroups), un « sujet » une ligne du graphique (un
// thème, ou sa famille entière), un « thème » celui de la banque.
// Typographie du site : espaces insécables avant « : ; ? ! », dans les guillemets et devant « % » (fr()).
// tests/echiquier-copy.test.ts vérifie ces règles.

import { affinityBand } from './affinity'
import { fr, PRIVACY, word } from './echiquierCommonCopy'
import { joinNames, signed } from './resultsCopy'
import type { Mark, UnitReading } from './echiquier'
import { ECHIQUIER, segments } from './echiquier'
import type { SpectrumAxisBloc } from './types'

const NB = '\u00a0'

/** Espaces insécables du site : dans core/echiquierCommonCopy.ts, avec la rubrique de la Méthode */
export { fr }

/** « A », « A et B », « A, B et C » */
export const listFr = joinNames

/** « 1 question », « 3 questions » (nombre et nom soudés) */
const plural = (n: number, word: string) => `${n}${NB}${word}${n > 1 ? 's' : ''}`

export const cap = (s: string) => s.charAt(0).toLocaleUpperCase('fr') + s.slice(1)

// ——— Noms ———

/** Le nom de la page, son panneau dans « Et maintenant » et son lien sous « Par thème » : dans core/resultsCopy.ts, avec
 *  le code de toutes les visites */
export { PROFILE_GRID_LINK as GRID_LINK, PROFILE_PANEL as PANEL_DESC, PROFILE_TITLE } from './resultsCopy'

/** Le chapeau : la question, puis ce que la page n'est pas, et où est le classement (le lien, posé par la page) */
export const LEDE = fr(
  'Vos réponses sur l’échiquier, thème par thème : se rapprochent-elles nettement des candidats qu’une grille officielle range à gauche, au centre ou à droite ?',
)
export const LEDE_VOTE = [fr('Une lecture, pas un conseil de vote : le classement est dans '), 'Résultats'] as const
/** La page d'attente : la même phrase, sans le lien (le classement n'y est pas encore complet) */
export const LEDE_WAIT = 'Une lecture, pas un conseil de vote.'
/** Sous le chapeau : ce qui reste sur l'appareil (le même texte que « Vie privée » de la Méthode) */
export { PRIVACY }

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
 * La phrase de la fiche ; left : questions rapides qui restent ; added : ajoutées depuis un questionnaire fini avec au
 * moins un avis (core/profileAccess.ts : la lecture s'est déjà affichée ; après tout passé, false, la phrase générale). Elle
 * nomme « la lecture » plutôt qu'un pronom : après « le questionnaire rapide », « il » se rapporterait à lui
 */
export function waitText(state: WaitState, total: number, left: number, added: boolean): string {
  // Quand la lecture s'affiche : la même fin pour une feuille vierge et pour une feuille en cours
  const when = `s’affiche au bout des ${plural(total, 'question')} du questionnaire rapide, avec le dépouillement complet`
  const many = left > 1
  return fr(
    state === 'vide'
      ? `La lecture se fait sur vos réponses : elle ${when}.`
      : state === 'sans-avis'
        ? // Toutes les questions du questionnaire rapide vues, mais aucun avis qui compte : passées, vues sans avis, ou à revoir
          'Aucune de vos réponses ne donne encore d’avis qui compte : la lecture se fait sur vos « d’accord » et vos « pas d’accord », hors questions passées et questions à revoir.'
        : added
          ? `${many ? `${plural(left, 'question')} ont été ajoutées` : 'Une question a été ajoutée'} au questionnaire rapide depuis vos réponses : la lecture s’affiche de nouveau une fois ${many ? 'ces questions vues' : 'cette question vue'}.`
          : `La lecture ${when} : encore ${plural(left, 'question')}.`,
  )
}
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

// La fiche « Pour lire plus de thèmes », tant que des thèmes à compléter ont des questions approfondies à voir
// (core/echiquier.ts, deeperTopics) : après les domaines, repliée ; ouverte sous le compte au seul questionnaire rapide,
// ou quand rien n'est net nulle part
export const DEEPER_TITLE = 'Pour lire plus de thèmes'
export const deeperLede = (quickOnly: boolean) => {
  const rule = 'il faut au moins deux questions pour lire un thème seul.'
  return fr(quickOnly ? `Après le questionnaire rapide, la lecture se fait par domaine : ${rule}` : cap(rule))
}
/**
 * Ce que compte la fiche, sur sa ligne : repliée, ce qu'elle reprend (« 3 sans réponse, 8 sur une seule question ») ;
 * ouverte, le nombre de ses thèmes
 */
export const deeperCount = (none: number, thin: number, folded: boolean) =>
  folded ? [none ? `${none}${NB}sans réponse` : '', thin ? `${thin}${NB}sur une seule question` : ''].filter(Boolean).join(', ') : plural(none + thin, 'thème')
/** « Sur une seule question : 16 thèmes » ; ceux sans réponse : unansweredLine */
export const thinLine = (n: number) => fr(`Sur une seule question : ${plural(n, 'thème')}`)
/** Le nom lu d'un thème de la fiche, devant son nom visible : le lien le coche dans « Approfondir » */
export const DEEPER_THEME = fr('Approfondir :')
export const DEEPER_GO = 'Choisir les thèmes à approfondir'
/** Hors du pli de la fiche, toujours visible : ses thèmes prioritaires (lot 2, A2 ; la page pose leurs liens) */
export const DEEPER_PRIO = fr('Dont vos priorités :')
export const STATUS_BUSY = 'Lecture en cours, sur cet appareil…'
export const STATUS_READY = 'Lecture prête.'

// ——— Comment c'est calculé : huit points au plus, le reste dans la Méthode ———

/** Point 1 : qui compte ; panel : candidats de l'axe ; unscored : candidats non classés de l'élection */
export const howWho = (panel: number, unscored: number) => {
  const others = 'le bloc « Autres » de la grille (écologistes, divers), qui n’est pas une place entre la gauche et le centre.'
  return fr(
    `Comptent les ${panel} candidats classés. ${
      unscored ? `Ne comptent pas : ${unscored > 1 ? `les ${unscored} candidats non classés` : 'le candidat non classé'}, ni ${others}` : `Ne compte pas : ${others}`
    }`,
  )
}
/** Point 2 : le calcul, et ce à quoi on le compare (toutes les façons, la vôtre comprise, comme la moyenne du détail) */
export const HOW_CALC = fr(
  'Pour chaque bloc, on fait la moyenne de votre affinité, sur le thème, avec ses candidats (les pourcentages de « Par thème »). Puis le même calcul pour toutes les façons de poser vos mêmes avis, la vôtre et toutes les autres : sur chaque question, autant de « d’accord », de « pas d’accord » et de « sans avis », répartis entre ses approches. Ce qui compte : où vont vos avis, pas leur nombre.',
)
/**
 * Points 3 et 6 : la couleur d'une case, palier par palier, et ce qu'elle ne dit pas (le même texte dans la Méthode) :
 * dans core/echiquierCommonCopy.ts, avec la rubrique de la Méthode
 */
export { COLORS_CHANCE, HOW_COLOR } from './echiquierCommonCopy'
/**
 * Point 8, après HOW_NO_EFFECT : la croix des lignes rouges, qui ne change rien (seulement quand vous avez posé une ligne
 * rouge), dans les mots de la Méthode (core/echiquierCommonCopy.ts)
 */
export { HOW_CROSS } from './echiquierCommonCopy'
/**
 * Point 8 : les priorités (lot 2, A2), pourquoi la lecture peut différer du classement. Une règle, vraie même pour qui
 * n'a choisi aucune priorité (« les priorités », pas « vos priorités ») ; la Méthode a ses propres mots
 * (core/echiquierMethodCopy.ts, METHOD_PRIORITY), où « ici » serait la Méthode
 */
export const HOW_PRIORITY = fr(
  'Les priorités comptent double dans votre classement, pas ici ; et chaque bloc est la moyenne de ses candidats : cette lecture peut donc différer de votre classement.',
)
/**
 * Point 4, en un seul point : les lectures nettes, avec leur écart et leur seuil (ECHIQUIER.GAP : d'au moins 5 points,
 * à 55 % au moins ou 45 % au plus, comme dans la Méthode), et le bloc inconnu. Le seuil est dit : sans lui, une unité qui
 * s'écarte nettement des autres façons sans s'éloigner assez de 50 % paraîtrait contredire « Rien de net ». Depuis le 17
 * octobre 2026, la couleur pleine dit aussi « net » : « rien de net » laisse la couleur atténuée, quel que soit le palier
 */
export const HOW_MARKS: readonly string[] = [
  fr(`Nettement plus près : votre affinité avec ce bloc dépasse nettement celle des autres façons de poser vos mêmes avis, d’au moins ${ECHIQUIER.GAP}${NB}points, et atteint ${50 + ECHIQUIER.GAP} % au moins.`),
  fr(`Nettement plus loin : elle reste nettement en dessous, d’au moins ${ECHIQUIER.GAP}${NB}points, à ${50 - ECHIQUIER.GAP} % au plus. Sinon, rien de net, quel que soit le palier : la couleur reste atténuée.`),
  fr(`?${NB}inconnu : aucun candidat du bloc n’est connu sur vos questions.`),
]
/** Point 5 : « nettement », le seuil du test (p ≤ 0,10), puis son exemple, sur des questions fictives */
export const HOW_NETTEMENT = fr(
  'Nettement : posés de toutes les façons possibles sur les approches de chaque question, la vôtre comprise, vos mêmes avis font un tel écart une fois sur dix au plus, avec un bloc ou un autre.',
)
export const HOW_EXAMPLE_TITLE = fr('Un exemple, sur des questions fictives :')
/** 5! / (1! 1! 3!) = 20 façons ; 20 × 20 = 400 ; une sur dix au plus : 40 */
export const HOW_EXAMPLE: readonly string[] = [
  fr('Une question, cinq approches (de A à E). Votre avis : « d’accord » pour B, « pas d’accord » pour D, « sans avis » ailleurs.'),
  fr(`Ces mêmes avis peuvent se poser de 20${NB}façons, la vôtre comprise.`),
  fr(`Sur deux questions comme celle-ci : 20 fois 20, soit 400${NB}façons.`),
  fr('Pour chacune, le même calcul : l’affinité avec chaque bloc.'),
  fr(`Pour « nettement plus près », il faut que 40 de ces 400${NB}façons au plus fassent un écart aussi marqué.`),
]
/** Point 7 */
export const HOW_MIN = fr('Il faut au moins deux questions pour lire un thème. Quand aucun thème d’un domaine ne se lit seul, le domaine entier est lu.')
/** Point 8 */
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

/**
 * Des blocs quelconques, suite par suite : « à l’extrême gauche et à droite », « de la gauche à la droite ». Avec
 * plusieurs suites, une suite de deux blocs se dit bloc par bloc, en une seule énumération : « à gauche, au centre et à
 * l’extrême droite », jamais « à gauche et au centre et à l’extrême droite »
 */
export function whereAll(axis: readonly SpectrumAxisBloc[], indices: readonly number[]): string {
  const segs = segments(indices)
  if (segs.length === 1) return where(axis, segs[0]!)
  return listFr(segs.flatMap(s => (s.length === 2 ? s.map(b => axis[b]!.where) : [where(axis, s)])))
}

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

/** « 97 200 » : les milliers séparés par une espace insécable */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB)

/**
 * La phrase d'une unité (lecture, écarts, rien de net, blocs inconnus, une seule question). Rien de net : la seule cause
 * dite est celle que le calcul rend certaine, trop peu de façons de poser vos mêmes avis (moins de dix : la vôtre, qui
 * compte toujours, pèse déjà plus d'une sur dix) ; sinon, un constat, jamais une cause prêtée à la personne : « ne se
 * distinguent pas assez des autres façons » seulement quand aucun bloc ne s'en écarte nettement (UnitReading.distinct) ;
 * quand un bloc s'en écarte sans s'éloigner assez de 50 %, la phrase toujours vraie, sans cause
 */
export function unitSentence(axis: readonly SpectrumAxisBloc[], r: Pick<UnitReading, 'status' | 'near' | 'far' | 'cells' | 'kind' | 'ways' | 'distinct'>): string {
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
      text =
        r.ways < MIN_WAYS
          ? `Rien de net : vos mêmes avis ne pouvaient se poser que ${
              r.ways === 1 ? 'd’une seule façon sur ces questions, la vôtre ; rien à comparer' : `de ${r.ways}${NB}façons sur ces questions, trop peu pour conclure (il en faut au moins dix)`
            }.`
          : `Rien de net : sur ${r.kind === 'famille' ? 'ce domaine' : 'ce thème'}, vos réponses ne ${
              r.distinct ? 'se rapprochent ni ne s’écartent nettement des candidats d’aucun bloc' : 'se distinguent pas assez des autres façons de poser vos mêmes avis'
            }, quel que soit le palier des cases.`
      break
    case 'blocs-inconnus':
      return fr(
        `Pas de lecture nette : la position des candidats que la grille classe ${whereAll(axis, unknown)} n’est pas connue sur vos questions ${r.kind === 'famille' ? 'de ce domaine' : 'de ce thème'}.`,
      )
    case 'une-question':
      return ONE_QUESTION_LEAD
  }
  // « que la grille classe » : la phrase « Rien de net » ne nomme pas la grille, « qu’elle » n'y aurait pas d'antécédent
  if (unknown.length === 1) text += ` La position des candidats que la grille classe ${where(axis, unknown)} n’est pas connue ici : la lecture se fait sans eux.`
  return fr(text)
}

/**
 * Moins de façons de poser vos mêmes avis que cela : rien ne peut être net, la vôtre comptant toujours (p ≥ 1 / N, plus
 * d'une sur dix)
 */
export const MIN_WAYS = 10

/** Une ligne d'une seule question, ouverte : la règle, puis ce que disent ses couleurs */
export const ONE_QUESTION_LEAD = fr('Sur une seule question, la page ne conclut pas : il en faut deux pour lire un thème. Ces couleurs, atténuées, donnent seulement votre affinité.')
/** La même, en bref : le nom lu d'une ligne */
export const ONE_QUESTION = fr('Une seule question : pas de lecture nette.')
export const DEEPEN_THEME = 'Approfondir ce thème'
/**
 * Ce que dit la page d'une approche qu'aucun candidat classé ne porte en principal : dans le constat d'une seule question,
 * le détail et les accords qu'il compte à part ; écrit une fois (le plafond du fichier de la page)
 */
export const NO_MAIN = 'approche principale d’aucun candidat classé'

/**
 * Le constat d'un thème lu sur une seule question : qui porte en approche principale ce que vous y approuvez (vrai par
 * construction, jamais dans la synthèse). carriers : noms par bloc de l'axe ; null : vous n'y approuvez rien. placed :
 * vos accords sur une approche principale d'un candidat classé ; unplaced : ceux sur une approche qui ne l'est pour
 * aucun (la phrase dit les deux, sans prêter aux premiers ce que portent les seconds).
 */
export function oneQuestion(axis: readonly SpectrumAxisBloc[], carriers: readonly (readonly string[])[] | null, placed = 1, unplaced = 0): string | null {
  if (!carriers) return null
  const total = carriers.reduce((n, names) => n + names.length, 0)
  if (!total || !placed) return fr(`Ce que vous y approuvez n’est l’${NO_MAIN}.`)
  // Bloc par bloc, chacun avec ses porteurs : « à gauche (A, B) et à droite (C) »
  const parts = carriers.flatMap((names, b) => (names.length ? [`${axis[b]!.where} (${names.join(', ')})`] : []))
  const whose = `${total > 1 ? 'de candidats' : 'd’un candidat'} que la grille classe ${listFr(parts)}`
  if (!unplaced)
    return fr(placed > 1 ? `Ce que vous y approuvez, ce sont les approches principales ${whose}.` : `Ce que vous y approuvez est l’approche principale ${whose}.`)
  const rest = unplaced > 1 ? `les autres ne sont l’${NO_MAIN}` : `l’autre n’est l’${NO_MAIN}`
  return fr(
    placed > 1
      ? `Parmi ce que vous y approuvez, ${placed} approches sont les approches principales ${whose} ; ${rest}.`
      : `Parmi ce que vous y approuvez, une approche est l’approche principale ${whose} ; ${rest}.`,
  )
}

// ——— Synthèse ———

export const SUMMARY_TITLE = /* @__PURE__ */ fr('Où vos réponses se rapprochent nettement d’un bloc de la grille')
/** Sous le graphique, en petit corps gris : ce que vaut une lecture nette, chiffres de la Méthode (ECHIQUIER_PUBLISHED) */
export const SUMMARY_NOTE = fr(
  'Selon la grille des nuances du ministère de l’Intérieur. Une lecture nette n’est pas une certitude : des feuilles remplies par un programme, sans suivre aucun candidat, en obtiennent aussi une ou deux sur l’ensemble des thèmes, un peu plus selon la façon de répondre. Chaque lecture se vérifie dans son détail.',
)
export const nothingLine = (n: number) => fr(`Rien de net : ${plural(n, 'thème')}`)
export const apartLine = (n: number) => fr(`Seulement plus loin d’un bloc : ${plural(n, 'thème')}`)
export const noReadingLine = (n: number) => fr(`Pas de lecture : ${plural(n, 'thème')}, sur une seule question ou faute de candidats connus`)
export const unansweredLine = (n: number) => fr(`Sans réponse : ${plural(n, 'thème')}`)

// ——— Le graphique « Domaine par domaine » : une ligne par sujet, sous son domaine (ui/profile/Chart.tsx) ———
// Un sujet : un thème lu, ou sa famille entière quand aucun de ses thèmes ne se lit seul ; un domaine : une famille.

export const CHART_TITLE = 'Domaine par domaine'
/** Le compte de tête cite au plus ce nombre de sujets, chacun un lien qui ouvre sa ligne, puis « et N autres » */
export const COUNT_NAMES = 5
/**
 * Le compte (C0), des lectures nettes : [avant, en gras, après], puis la page pose les noms, séparés de virgules (un
 * nom peut contenir « et »), et countEnd
 */
export const countNear = (n: number) => ['Sur ', plural(n, 'sujet'), fr(', vos réponses se rapprochent nettement d’un bloc : ')] as const
/** Sans rapprochement, des écarts (C6) : de même, les noms des sujets seulement plus loin */
export const countApart = (n: number) =>
  ['Sur ', 'aucun sujet', fr(`, vos réponses ne se rapprochent nettement d’un bloc de la grille ; sur ${plural(n, 'sujet')}, elles s’écartent nettement d’au moins un : `)] as const
/** La fin du compte : « . », ou « et 2 autres. » au-delà de COUNT_NAMES */
export const countEnd = (more: number) => (more > 0 ? ` et ${more}${NB}autre${more > 1 ? 's' : ''}.` : '.')
/**
 * Puis, en gris, ce qui n'a pas compté (C0) : les sujets seulement plus loin quand il y a aussi des lectures, ceux sans
 * rien de net, les thèmes d'une seule question et ceux faute de candidats connus ; enfin les questions vues sans avis qui
 * compte (passées, sans avis ou à revoir). Chaque part seulement si elle compte quelque chose ; null s'il n'y a rien
 */
export function countRest(apart: number, flat: number, thin: number, unknown: number, unseen: number): string | null {
  const parts = [
    apart ? `seulement plus loin sur ${plural(apart, 'sujet')}` : '',
    flat ? `rien de net sur ${plural(flat, 'sujet')}` : '',
    thin ? `${plural(thin, 'thème')} sur une seule question` : '',
    unknown ? `${plural(unknown, 'thème')} faute de candidats connus` : '',
  ].filter(Boolean)
  const seen = unseen ? `${plural(unseen, 'question')} sans avis ou à revoir ${unseen > 1 ? 'ne comptent' : 'ne compte'} pas` : ''
  const text = [parts.join(', '), seen].filter(Boolean).join(' ; ')
  return text ? fr(`${cap(text)}.`) : null
}

// Les états de tête, à la place du compte, avant l'axe : rien de net nulle part (C5), aucun sujet à l'épreuve (C5 bis),
// des avis uniformes (C9). Des constats ; jamais « c'est fréquent », jamais une cause prêtée à la personne.
/**
 * Ce que C5 dit de plus, seulement quand c'est vrai (ui/profile/rows.ts, headOf) : quick, au seul questionnaire rapide,
 * la plupart des thèmes répondus n'ont qu'une question ; few, sur chaque sujet mis à l'épreuve, moins de dix façons de
 * poser vos mêmes avis ; alike, sur chacun, assez de façons et aucun bloc nettement à l'écart d'elles ; null, rien de
 * plus (un bloc s'en écarte sans s'éloigner assez de 50 %, ou les cas se mêlent)
 */
export type NothingCause = 'quick' | 'few' | 'alike' | null
/** C5 : des sujets mis à l'épreuve, ni rapprochement ni écart : [avant, en gras, après] */
export const nothingAnywhere = (cause: NothingCause) =>
  [
    'Sur ',
    'aucun sujet',
    fr(
      `, vos réponses ne se rapprochent ni ne s’écartent nettement d’un bloc${
        cause === 'quick'
          ? '. Après le seul questionnaire rapide, la plupart des thèmes n’ont qu’une question : la lecture se fait par domaine.'
          : cause === 'few'
            ? '. Là où la page les compare, vos mêmes avis ne pouvaient se poser que de trop peu de façons pour conclure (il en faut au moins dix).'
            : cause === 'alike'
              ? ' : elles ne se distinguent pas assez des autres façons de poser vos mêmes avis.'
              : '.'
      }`,
    ),
  ] as const
/** Les causes de C5, pour les tests */
export const NOTHING_CAUSES: readonly NothingCause[] = ['quick', 'few', 'alike', null]
/** Avec C5 : une absence de lecture n'est pas une place (la page ne fait pas de moyenne) */
export const NOT_CENTRE = fr('Ce n’est pas une place au centre : la page ne fait pas de moyenne entre les blocs.')
/** Avec C5, hors questionnaire rapide : où est le classement (le lien, posé par la page) */
export const YOUR_RANKING = [fr('Votre classement : '), 'Résultats'] as const
/** C5 bis : aucun sujet ne peut être mis à l'épreuve */
export const NOTHING_TESTABLE = fr('Pas encore de sujet à lire : il faut deux questions sur un même thème, ou deux thèmes répondus dans un même domaine.')
/** C9 : chaque question répondue donne le même avis à toutes ses approches (rows.ts, uniformViews) */
export const UNIFORM = fr(
  'Sur chaque question, vos réponses donnent le même avis à toutes les approches : il n’y a qu’une façon de poser ces avis, la vôtre, donc rien à comparer. Les couleurs, atténuées, donnent seulement votre affinité.',
)
/** Au-dessus du graphique, selon le pointeur : le doigt ou la souris */
export const HINT_TOUCH = 'Touchez un sujet pour voir pourquoi.'
export const HINT_CLICK = 'Cliquez sur un sujet pour voir pourquoi.'
/** La légende : les cinq paliers du site (core/affinity.ts), puis sa phrase */
export const KEY_LABEL = 'Les couleurs des cases'
export const KEY_TEXT = fr('Chaque case : votre affinité moyenne, sur ce sujet, avec les candidats du bloc.')
/**
 * Sous les paliers, deux pastilles du même palier : la couleur pleine d'une case nette, atténuée ailleurs (« pâle sauf
 * net », décision du propriétaire du 17 octobre 2026)
 */
export const KEY_NET = fr('Pleine : nettement plus près ou plus loin')
export const KEY_FLAT = fr('Atténuée : rien de net')
/** Nom de la liste des blocs, pour les lecteurs d'écran */
export const zonesLabel = (blocs: number, panel: number) =>
  fr(`Les ${word(blocs)} blocs de la grille du ministère de l’Intérieur, de l’extrême gauche à l’extrême droite, et les ${panel} candidats classés qu’elle y range`)
/** Très étroit (texte très agrandi) : les noms passent sous le graphique */
export const WHO_LIST = fr('Qui la grille range dans chaque bloc :')
/** « 3 questions » */
export const questionsCount = (n: number) => plural(n, 'question')
/**
 * Le seul mot qu'une ligne fermée reçoit en plus (lot 2, A2) : un thème prioritaire (poids 2 et au moins un avis, comme au
 * dépouillement), jamais une famille. La page le pose après le nombre de questions, dans sa propre balise
 */
export const PRIORITY = 'prioritaire'
/** Le nombre de questions d'une ligne de thème, et « prioritaire » s'il l'est : « 4 questions, prioritaire » (le nom lu) */
export const rowMeta = (n: number, priority: boolean) => (priority ? `${questionsCount(n)}, ${PRIORITY}` : questionsCount(n))
/**
 * Une ligne de famille, pour les lecteurs d'écran, après le nom du domaine : « les 4 thèmes ensemble », le libellé visible
 * de la ligne (familyHead), pour qu'une commande vocale la trouve par ce qu'elle voit (WCAG 2.5.3)
 */
export const themesTogether = (k: number) => `les ${k} thèmes ensemble`

/**
 * Le nom d'une ligne pour les lecteurs d'écran : son sujet et ce qu'en dit sa ligne fermée (meta : rowMeta, avec
 * « prioritaire » pour un thème prioritaire), puis chaque bloc de la grille avec son palier et, s'il y a lieu, sa lecture
 * nette ; enfin ce qui manque. « Défense, 5 questions, prioritaire. Selon la grille : Extrême gauche, très proche,
 * nettement plus près ; Gauche, mitigé ; … »
 */
export function rowSummary(labels: readonly string[], name: string, meta: string, r: Pick<UnitReading, 'status' | 'cells'>): string {
  const blocs = r.cells.map((c, b) => [labels[b], palier(c.affinity), netWord(c.mark)].filter(Boolean).join(', ')).join(' ; ')
  const tail = r.status === 'une-question' ? ` ${ONE_QUESTION}` : r.status === 'blocs-inconnus' ? ' Pas de lecture nette.' : r.status === 'aucun' ? ' Rien de net.' : ''
  return fr(`${name}, ${meta}. Selon la grille : ${blocs}.${tail}`)
}

/**
 * Les groupes d'un domaine, chacun sous un court intertitre (ui/profile/rows.ts), les lectures nettes d'un seul côté
 * comprises depuis le 17 octobre 2026 : sans le leur, la première ligne d'un domaine se lisait sous l'intertitre du
 * groupe suivant (« Culture et audiovisuel public », nette, lue « rien de net » sur une capture de la production). Aucun
 * bloc nommé. Le rangement et les mots disent « net » ; depuis le 17 octobre 2026, la couleur aussi, pleine sur une case
 * nette seulement (styles/app.css, .tile.is-net), jamais celle d'un bloc.
 */
export const GROUP_TITLE = { net: 'Nettement plus près', apart: 'Seulement plus loin', flat: 'Rien de net', thin: 'Sur une seule question', unknown: 'Faute de candidats connus' } as const
/**
 * Les lectures de part et d'autre du centre, sans lui (ui/profile/rows.ts, acrossCentre) : l'intertitre de leur groupe,
 * et la note d'une ligne ouverte. « Aux deux bouts » quand elles touchent l'extrême gauche et l'extrême droite ; sinon
 * (gauche et droite, extrême gauche et droite…), « des deux côtés ».
 */
export const BOTH_TITLE = 'Aux deux bouts à la fois'
export const SIDES_TITLE = 'Des deux côtés à la fois'
/** L'intertitre du groupe : ends, toutes ses lignes touchent les deux bouts de la grille */
export const bothTitle = (ends: boolean) => (ends ? BOTH_TITLE : SIDES_TITLE)
export const BOTH_ROW = ['Aux deux bouts à la fois. ', fr('Vos réponses rejoignent ici des candidats des deux côtés de la grille. On ne les additionne pas : ce n’est pas une place au centre.')] as const
/** La note d'une ligne ouverte : [en gras, la suite] ; ends, la ligne touche les deux bouts de la grille */
export const bothRow = (ends: boolean) => (ends ? BOTH_ROW : ([`${SIDES_TITLE}. `, BOTH_ROW[1]] as const))
/** Une ligne ouverte : chaque bloc, son palier et son affinité moyenne, sa lecture nette, et alors ses candidats */
export const BLOCS_TITLE = 'Votre affinité, bloc par bloc'
/** « (2 autres, position inconnue ici) » */
export const othersUnknown = (n: number) => `(${n} autre${n > 1 ? 's' : ''}, position inconnue ici)`
/** Une ligne ouverte qui a une lecture nette (plus près ou plus loin) */
export const BLOC_NOTE = fr('La lecture porte sur le bloc entier : les candidats d’un même bloc ne pensent pas tous pareil. Le détail donne votre affinité avec chacun.')
export const SEE_DETAIL = 'Voir le détail'
/** Un thème sur une seule question, dont la famille entière a sa ligne */
export const readWithFamily = (family: string) => fr(`Lu avec les autres thèmes de son domaine : « ${family} ».`)

// La croix des lignes rouges (lot 2, A1), dans une ligne ouverte, sous un bloc nettement plus près : qui, parmi ses
// candidats connus sur la ligne, franchit une ligne rouge posée sur un de ses thèmes (ui/profile/rows.ts, crossingsOf). Seule la croix est
// au stylo rouge, le texte reste gris ; elle ne change ni la couleur, ni la lecture, ni l'ordre (HOW_CROSS).
/** Le nom lu de la croix */
export const CROSS_LABEL = 'ligne rouge franchie'
/** « une de vos lignes rouges », « 2 de vos lignes rouges » */
const redLines = (n: number) => (n > 1 ? `${n}${NB}de vos lignes rouges` : 'une de vos lignes rouges')
/**
 * La phrase de la croix, pour des candidats qui franchissent autant de lignes rouges de la ligne, de la même façon : names,
 * dans l'ordre de la grille puis alphabétique ; possible, ils pourraient les franchir (position déduite, ou de confiance
 * basse : « pourrait franchir », le mot du dépouillement), sinon ils les franchissent ; count, combien ; themes, pour une
 * ligne de famille, les thèmes de ces lignes rouges, dans l'ordre de la banque (« sur ce sujet (« Europe ») »), sinon
 * null. Chaque thème entre guillemets, comme readWithFamily : beaucoup de noms de thèmes contiennent déjà « et » ou une
 * virgule (« Salaires et travail », « Agriculture, alimentation et animaux »), qu'on ne saurait plus compter sans eux.
 * « Nathalie Arthaud et Selma Labib franchissent une de vos lignes rouges sur ce sujet. »
 */
export function crossLine(names: readonly string[], possible: boolean, count: number, themes: readonly string[] | null): string {
  const many = names.length > 1
  const verb = possible ? `${many ? 'pourraient' : 'pourrait'} franchir` : many ? 'franchissent' : 'franchit'
  return fr(`${listFr([...names])} ${verb} ${redLines(count)} sur ce sujet${themes?.length ? ` (${listFr(themes.map(t => `« ${t} »`))})` : ''}.`)
}
/**
 * Votre façon de répondre (lot 4, A5) : une phrase, sans titre, après les domaines, quand presque toutes les cases mises
 * à l'épreuve ont leur point de comparaison du même côté (ui/profile/rows.ts, mannerOf). near : du côté « proche » ;
 * k questions sur n ont plus d'avis de ce côté que de l'autre. 25 mots au plus, aucun nom de bloc ni de candidat : un
 * constat chiffré sur la feuille, jamais un portrait (effet Barnum). « pas d’accord » ne se coupe pas entre ses guillemets
 */
export const manner = (near: boolean, k: number, n: number) =>
  fr(
    `Sur ${plural(k, 'question')} sur ${n}, vos réponses sont en majorité des « ${near ? '' : `pas${NB}`}d’accord » : une case « ${near ? 'proche' : 'éloigné'} », seule, dit peu ; les lectures nettes en tiennent compte.`,
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
export const DETAIL_INTRO = fr(
  'Pour chaque bloc : votre affinité moyenne avec ses candidats, la même moyenne pour les autres façons de poser vos mêmes avis, et l’écart. Puis, dans la page, chaque candidat et chaque question.',
)
/** Le bouton du tableau : ses thèmes, et leurs domaines entiers quand il y en a (une ligne chacun) */
export const detailShow = (themes: number, families: number) =>
  themes > 1 ? `Afficher le détail des ${themes} thèmes${families ? ' et de leurs domaines' : ''}` : 'Afficher le détail du thème'
/** Le tableau, un fichier à part chargé à son ouverture, n'a pas pu venir (hors ligne avant la copie hors ligne) */
export const DETAIL_FAILED = fr('Le détail n’a pas pu être chargé : rechargez la page pour le lire.')


// ——— Le détail d'une unité ———
// Ses libellés fixes sont dans core/echiquierDetailCopy.ts, avec le tableau, chargés avec lui ; restent ici ceux qui
// disent la lecture (en-têtes des blocs, écart, façons, note), que la page et la Méthode partagent avec lui

export const DETAIL_HEADS = ['Bloc', 'Candidats connus', 'Votre affinité moyenne', 'Avec vos mêmes avis, autrement placés', 'Écart'] as const
export const NONE_KNOWN = MARK_WORD.inconnu
/** « 65 % » */
export const pct = (v: number) => `${Math.round(v)}${NB}%`
/** L'écart aux autres façons de poser vos mêmes avis, en points signés, et la lecture nette en mots : « +42 points, nettement plus près » */
export const gap = (affinity: number, chance: number, mark: Mark) => {
  const d = Math.round(affinity) - Math.round(chance)
  const net = netWord(mark)
  return `${signed(d)}${NB}point${Math.abs(d) > 1 ? 's' : ''}${net ? `, ${net}` : ''}`
}
/**
 * Sous un bloc lu nettement, quand toutes les façons ont été comptées une à une (UnitReading.exact) : combien il y en
 * avait, et combien, la vôtre comprise, rapprochent de ce bloc (ou en éloignent) au moins autant que la vôtre
 * (BlocCell.alike, le compte du bloc seul)
 */
export function detailWhy(ways: number, alike: number, mark: 'pres' | 'loin'): string {
  const verb = mark === 'pres' ? 'rapproche' : 'éloigne'
  return fr(
    `Vos mêmes avis pouvaient se poser de ${thousands(ways)}${NB}façons sur ces approches ; ${
      alike > 1 ? `${thousands(alike)}, dont la vôtre, ${verb}nt au moins autant de ce bloc.` : `seule la vôtre ${verb} autant de ce bloc.`
    }`,
  )
}
/**
 * La note sous le tableau d'une unité. ways : le nombre de façons de poser ses avis tel que la page peut le dire
 * (UnitReading.ways : Infinity au-delà de cent mille) ; exact : toutes comptées une à une, sinon une part calculée bloc
 * par bloc puis additionnée, une borne prudente (core/echiquier.ts). Rien n'y est tiré au sort
 */
export const chanceNote = (exact: boolean, ways: number) =>
  fr(
    ways === 1
      ? `${DETAIL_HEADS[3]} : sur chaque question, vos avis ne se posent que d’une seule façon, la vôtre ; rien à comparer.`
      : `${DETAIL_HEADS[3]} : la moyenne du même calcul pour ${
          Number.isFinite(ways) ? `les ${thousands(ways)}${NB}façons` : 'toutes les façons (plus de cent mille)'
        } de poser vos mêmes avis sur les approches de chaque question, la vôtre comprise ; « nettement plus près » ou « nettement plus loin » quand une sur dix au plus fait un écart aussi marqué, avec un bloc ou un autre.${
          exact ? '' : ' Au-delà de cent mille façons, cette part se calcule bloc par bloc, puis s’additionne : une borne prudente, qui peut manquer une lecture, jamais en inventer une.'
        }`,
  )
export const YOUR_VIEW = fr('Votre avis :')

// ——— À garder en tête ———

export const CAVEATS_TITLE = 'À garder en tête'
export const caveats = (panel: number) => [
  fr('La grille classe des partis et des candidats, pas des idées : une même approche est souvent portée dans plusieurs blocs, et les candidats d’un même bloc ne pensent pas tous pareil.'),
  fr(`Une lecture situe vos réponses par rapport à ces ${panel} candidats, tels que la grille les range ; elle changerait avec d’autres candidats.`),
  fr('Sur peu de questions, des feuilles remplies par un programme, sans suivre aucun candidat, obtiennent parfois une lecture nette, elles aussi.'),
  fr('Ce n’est ni un test, ni une étiquette, ni une consigne de vote.'),
]
export const METHOD_LINK = 'La méthode en détail'

// ——— La barre collante, domaine par domaine puis sujet par sujet (ui/profile/Nav.tsx) ———
// Des noms seulement : ni groupe, ni lecture, ni couleur ; l'ordre est celui des domaines, puis celui des lignes

export const NAV_LABEL = 'Aller à un domaine ou à un sujet'
export const NAV_DOMAINS = 'Domaines'
/** La liste des sujets du domaine en cours */
export const navSubjects = (domain: string) => fr(`Sujets du domaine « ${domain} »`)
