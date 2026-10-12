// Phrases du dépouillement, partagées par la page des résultats (ui/screens/Results.tsx) et le dépouillement en PDF :
// les mêmes mots, au singulier comme au pluriel, pendant la tendance comme au résultat complet, sur l'écran et sur
// le papier. Fonctions pures qui renvoient du texte brut : la page garde autour ses liens et ses balises, le PDF
// ses styles.
// Les espaces sont celles de la page, à l'identique (insécables là où elle en met, ordinaires ailleurs, par exemple
// devant certains « : ») : la page ne doit pas changer d'un caractère ; le PDF les régularise en écrivant.

import { shareText } from '../ui/format'
import { CLOSE_GAP, displayScore, POINTS_PER_STROKE, type CandidateResult, type DealbreakerHit } from './score'
import type { ElectionInfo } from './types'

// Les mots de « Accords et désaccords », à part (core/agreeCopy.ts) pour l'image partagée qui les reprend
export { AGREE_HEADS, AGREE_LEDE, AGREE_NONE, count, TITLE_AGREE } from './agreeCopy'

// Titres et intitulés de la page, repris par le PDF (où les liens deviennent des adresses imprimées)
export const TITLE_DONE = 'Votre dépouillement'
export const TITLE_PRIORITIES = 'Vos priorités'
export const TITLE_BOARD = 'Le classement'
export const TITLE_SWAP = 'Un résultat qui dépend de la façon de compter'
/** Les deux colonnes du résultat sensible à la méthode */
export const SWAP_HEADS = ['Score complet', 'Approches principales seulement'] as const
export const TITLE_TOPICS = 'Par thème'
export const TITLE_WHY = 'Ce qui les sépare'
export const TITLE_CAVEATS = 'À garder en tête'
export const LINK_METHOD = 'La méthode'
export const LINK_RULE = 'La règle, dans la méthode'
export const LINK_SOURCES = 'Méthode et sources'
/** Sous le rang de candidats à égalité */
export const TIE_MARK = 'ex æquo'

/** « A », « A et B », « A, B et C » */
export const joinNames = (names: string[]) =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} et ${names.at(-1)}`

/** Sous le titre : « Sur 12 réponses. » */
export const answeredLede = (answered: number) => `Sur ${answered} réponse${answered > 1 ? 's' : ''}.`

/** Après « Vos priorités » : les thèmes choisis suivent, ou aucun */
export const priorityHead = (chosenCount: number) =>
  chosenCount ? 'comptent double dans le calcul' : 'aucune\u00a0: tous les thèmes comptent autant.'

/** Questions changées sur le fond depuis la réponse (la page ajoute le lien « La / Les revoir ») */
export const staleNotice = (n: number) =>
  `${n} question${n > 1 ? 's ont' : ' a'} changé depuis vos réponses : le résultat est calculé sans ${n > 1 ? 'elles' : 'elle'} en attendant.`

/** Ligne de lecture : le milieu de l'échelle, puis la valeur d'un bâton */
export const READING_NEUTRAL = '50\u00a0%\u00a0: neutre'
export const READING_STROKE = `1 bâton = ${POINTS_PER_STROKE} points`

/** Accroche de l'affiche du plus proche */
export const leaderLead = (allIncompatible: boolean) =>
  allIncompatible ? 'Le moins concerné par vos lignes rouges' : 'Le plus proche de vos idées'

/** Sous l'affiche : le deuxième est trop près pour que l'écart compte */
export const closeNote = (secondName: string) =>
  `${secondName} suit à moins de ${CLOSE_GAP} points : l’écart n’est pas significatif.`

/** Sous l'affiche : combien de candidats (classés ou hors classement) franchissent une ligne rouge */
export const crossingNote = (n: number) =>
  `${n} candidat${n > 1 ? 's franchissent' : ' franchit'} au moins une de vos lignes rouges.`

/** Bascule entre les seuls qualifiés pour le second tour */
export const FINALISTS_ONLY = 'Seulement les qualifiés pour le 2nd tour'

/** Intercalaire du classement, avant les candidats qui franchissent une ligne rouge */
export const CROSSING_DIVIDER = 'Franchissent au moins une de vos lignes rouges'

/** Sur combien de vos réponses la position d'un candidat est connue */
export const knownLine = (known: number, answered: number) =>
  answered > 0 ? `Connu sur ${known} de vos ${answered} réponses` : 'Aucune réponse notée'

/** Le score avant lissage mérite d'être dit : il diffère d'au moins un point, une fois arrondi */
export const rawShown = (r: Pick<CandidateResult, 'rawScore' | 'score'>) =>
  r.rawScore !== null && r.score !== null && Math.abs(Math.round(r.rawScore) - Math.round(r.score)) >= 1

/**
 * Méta d'une ligne du classement : couverture, données partielles et, hors tendance (withRaw), score avant lissage.
 * Les écarts depuis la visite précédente n'en font pas partie : c'est un état de la session, propre à la page.
 */
export const rowMeta = (r: Pick<CandidateResult, 'known' | 'answered' | 'partialData' | 'rawScore' | 'score'>, withRaw: boolean) =>
  knownLine(r.known, r.answered) +
  (r.partialData ? ' · données partielles' : '') +
  (withRaw && rawShown(r) ? ` · ${Math.round(r.rawScore!)}\u00a0% avant lissage` : '')

/** « Franchit une de vos lignes rouges », « Pourrait franchir 3 de vos lignes rouges »… */
export const redLineSummary = (hits: readonly Pick<DealbreakerHit, 'level'>[]) =>
  `${hits.some(d => d.level === 'touche') ? 'Franchit' : 'Pourrait franchir'} ${hits.length > 1 ? `${hits.length} de vos lignes rouges` : 'une de vos lignes rouges'}`

/** Classement vide (règle de couverture) : personne n'est assez connu sur ces réponses */
export const emptyRanking = (minShare: number | null) =>
  `Aucun candidat n’est connu sur au moins ${shareText(minShare ?? 0.5)} de vos réponses\u00a0: pas de classement pour l’instant. D’autres réponses peuvent le permettre.`

/** Encadré : tous les classés franchissent une ligne rouge */
export const allIncompatibleNote = (someOff: boolean) =>
  `Aucun candidat${someOff ? ' classé' : ''} ne respecte toutes vos lignes rouges : ils sont classés du moins au plus concerné.`

/** Encadré : début de la phrase sur le résultat sensible à la méthode (la page y ajoute son lien) */
export const UNSTABLE_NOTE = 'Résultat sensible à la façon de compter'

/** Au-delà de ce nombre de lignes rouges, l'encadré rappelle l'effet d'exclusion (page et PDF) */
export const MANY_RED_LINES = 5

/** Encadré : beaucoup de lignes rouges */
export const manyRedLinesNote = (n: number) => `${n} lignes rouges : le classement dépend surtout de ces refus.`

/** Hors classement : titre */
export const unrankedTitle = (n: number) => `Trop peu de positions connues pour ${n === 1 ? 'le' : 'les'} classer`

/** Hors classement : chapeau (la page ajoute le lien vers la règle) */
export const unrankedLede = (n: number, minShare: number, provisional: boolean) =>
  `${n === 1 ? 'Sa' : 'Leur'} position est connue sur moins de ${shareText(minShare)} de vos réponses. Calculé sur si peu de questions, un score varie trop pour être comparé aux autres` +
  (provisional ? '.' : `\u00a0: ${n === 1 ? 'le sien' : 'le leur'} est donné à titre indicatif.`) +
  (n === 1 ? '' : ' Ordre tiré au hasard.')

/** Hors classement : le score, donné à titre indicatif */
export const indicativeScore = (score: number) => `Score indicatif\u00a0: ${displayScore(score)}\u00a0%`

/** Non classés : titre (en gras sur la page) */
export const excludedTitle = (n: number) =>
  n === 1 ? '1\u00a0candidat n’est pas classé' : `${n}\u00a0candidats ne sont pas classés`

/** Non classés : suite du titre, à partir de « : » */
export const excludedWhy = (n: number) =>
  `\u00a0: ${n === 1 ? 'sa position est connue' : 'leurs positions sont connues'} sur trop peu de questions`

/** Non classés : chapeau (la page ajoute le lien vers la règle) */
export const excludedLede = (n: number) =>
  n === 1
    ? 'Il n’a ni score ni rang, quelles que soient vos réponses. Sa fiche et ses positions restent consultables\u00a0; la liste sera revue à mesure que ses positions seront connues.'
    : 'Ils n’ont ni score ni rang, quelles que soient vos réponses. Leurs fiches et leurs positions restent consultables\u00a0; la liste sera revue à mesure que leurs positions seront connues. Ordre tiré au hasard.'

/** Non classés : sur combien de questions de la banque la position est connue */
export const bankKnownLine = (known: number, total: number) => `Connu sur ${known} des ${total}\u00a0questions de la banque`

/**
 * Résultat sensible à la méthode : la phrase, en morceaux alternés, texte puis noms (en gras sur la page) :
 * [texte, devant, texte, meneurs, texte].
 */
export const swapText = (aheadNames: string[], leaderNames: string[]) => [
  'Le score complet tient compte de toutes leurs positions. En ne gardant que leurs approches principales, vos accords moins vos désaccords, ',
  joinNames(aheadNames),
  ` ${aheadNames.length > 1 ? 'passent' : 'passe'} devant `,
  joinNames(leaderNames),
  '.',
]

/** Compte signé de la méthode simplifiée : « +3 », « −2 » (signe moins), « 0 » */
export const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0')

/** Par thème : légende de l'étoile, à partir de « : » (la page ajoute comment la choisir) */
export const starLegend = (chosenCount: number, max: number) =>
  `\u00a0: thème prioritaire, compte double (${max}\u00a0au plus${chosenCount ? `, ${chosenCount}\u00a0choisi${chosenCount > 1 ? 's' : ''}` : ''}).`

/** Par thème : tous les candidats classés en colonnes */
export const gridAllLine = (n: number, someOff: boolean) =>
  `Les ${n}\u00a0candidats${someOff ? ' classés' : ''}, dans l’ordre de votre classement.`

/** Par thème : sous la grille */
export const GRID_DASH = 'Un tiret : aucune position connue sur vos réponses de ce thème.'

// La page « Mon profil politique » (ui/screens/Profile.tsx, ses mots dans core/echiquierCopy.ts) : son nom et ses
// entrées depuis le dépouillement complet, ici pour que le code de toutes les visites n'emporte rien de plus
/** Le nom de la page : son titre, son panneau dans « Et maintenant », le titre de l'onglet */
export const PROFILE_TITLE = 'Mon profil politique'
/** Son panneau dans « Et maintenant » */
export const PROFILE_PANEL = 'Thème par thème, vos réponses se rapprochent-elles nettement d’un bloc de la grille officielle\u00a0?'
/** Son lien sous la grille « Par thème » */
export const PROFILE_GRID_LINK = 'Les mêmes thèmes, bloc par bloc\u00a0: «\u00a0Mon profil politique\u00a0»'

/** À garder en tête : les trois mises en garde */
export const caveats = (election: Pick<ElectionInfo, 'dataFrozenAt'>, minShare: number | null) => [
  'Pas une consigne de vote : le résultat dépend des sujets retenus et de la méthode.',
  `Positions arrêtées au ${election.dataFrozenAt.split('-').reverse().join('/')}. Une position inconnue sort du calcul ; un candidat connu sur peu de vos réponses est ramené vers 50 %${minShare === null ? '.' : `, et sur moins de ${shareText(minShare)}, il n’est pas classé.`}`,
  'L’outil ignore la personnalité, l’expérience et la capacité à rassembler.',
]
