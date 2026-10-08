// Le film d'Isoloir : la partition. Cinq scènes, leur texte (du vrai texte, lu par les lecteurs
// d'écran), la description de chaque image et sa durée. L'exemple est fictif : la question est
// celle de la démonstration de l'accueil, les « candidats » n'existent pas.

import { affinityBand } from '../../core/affinity'
import { firstStepSize } from '../../core/order'
import { strokesFor } from '../../core/score'
import type { QuestionBank, Rating } from '../../core/types'

/** Typographie française : espace insécable avant « : ; ! ? % » et à l'intérieur des guillemets */
export const fr = (s: string) => s.replace(/ ([:;!?»%])/g, '\u00a0$1').replace(/« /g, '«\u00a0')

export interface Scene {
  /** Libellé court du chapitre */
  chapter: string
  title: string
  /** Mot du titre entouré au stylo, s'il y en a un */
  mark?: string
  text: string
  /** Ce que montre l'image, pour les lecteurs d'écran et la version texte */
  alt: string
  /** Durée de la scène, en millisecondes */
  ms: number
}

export const SCENES: Scene[] = [
  {
    chapter: 'Des idées',
    title: 'Des idées, pas des noms.',
    mark: 'idées',
    text: fr('Chaque question propose plusieurs approches, sans dire qui les porte : vous jugez l’idée, pas le nom.'),
    alt: fr(
      'Exemple fictif. La question « Comment organiser la semaine des écoliers ? » et trois approches, A, B et C. Les candidats qui les portent sont d’abord nommés, puis leurs noms sont masqués par des points d’interrogation.',
    ),
    ms: 6500,
  },
  {
    chapter: 'Votre avis',
    title: 'Vous donnez votre avis.',
    text: fr('Un repère sur la réglette : pas d’accord, sans avis ou d’accord. Et une ligne rouge pour ce que vous refusez.'),
    alt: fr(
      'Sur la réglette de l’approche A, le repère se pose sur « D’accord » ; sur celle de B, sur « Pas d’accord ». La case « Ligne rouge » de l’approche C reçoit une croix rouge : C est rayée et notée « Pas d’accord ».',
    ),
    ms: 7500,
  },
  {
    chapter: 'Le dépouillement',
    title: 'On dépouille sur votre appareil.',
    text: fr('Les approches retrouvent leurs candidats, sources à l’appui. Votre affinité se compte en bâtons : un bâton vaut 5 points.'),
    alt: fr(
      'Chaque approche se rattache à un candidat fictif : A à Candidat 1, B à Candidat 2, C à Candidat 3. Des bâtons se tracent, puis les affinités s’affichent : Candidat 1, 82 %, très proche ; Candidat 2, 41 %, mitigé ; Candidat 3, 23 %, éloigné, signalé d’une croix rouge parce qu’il porte l’approche rayée.',
    ),
    ms: 7500,
  },
  {
    chapter: 'Rien ne part',
    title: 'Rien ne part.',
    text: fr('Vos réponses ne quittent pas cet appareil. Passez en mode avion : tout marche quand même.'),
    alt: fr(
      'Le téléphone est dans l’isoloir. Le mode avion s’allume, la flèche vers Internet est barrée d’une croix rouge, puis le rideau se ferme : « Isoloir fermé, rien ne peut partir ».',
    ),
    ms: 6000,
  },
  {
    chapter: 'Votre affiche',
    title: 'Vous gardez votre affiche.',
    text: fr('Un double fabriqué sur l’appareil, à garder ou à partager. Il montre des pourcentages, jamais vos réponses.'),
    alt: fr(
      'Un double jaune, « Mon dépouillement », sort de sous la feuille : Candidat 1, 82 % ; Candidat 2, 41 % ; Candidat 3, 23 %. En pied : fabriqué sur cet appareil, rien n’a été envoyé.',
    ),
    ms: 6500,
  },
]

/** L'appel final parle de questions, jamais de durée : la première tendance de l'élection affichée */
export function ctaNote(bank: QuestionBank): string {
  const essential = bank.questions.filter(q => q.tier === 'essentiel')
  const step1 = firstStepSize(essential)
  return step1 > 0 ? `Une première tendance dès ${step1} questions.` : `Un résultat en ${essential.length} questions.`
}

/** La question fictive, reprise de la démonstration de l'accueil */
export const QUESTION = fr('Comment organiser la semaine des écoliers ?')

export interface Row {
  letter: string
  text: string
  /** Avis donné dans la scène 2 */
  rating: Rating
  redLine: boolean
  /** Candidat fictif qui porte l'approche */
  initials: string
  name: string
  /** Affinité illustrative (sur une feuille entière, pas sur cette seule question) */
  pct: number
}

export const ROWS: Row[] = [
  { letter: 'A', text: 'Passer à quatre jours et demi de classe', rating: 1, redLine: false, initials: 'C1', name: 'Candidat 1', pct: 82 },
  { letter: 'B', text: 'Garder la semaine de quatre jours', rating: -1, redLine: false, initials: 'C2', name: 'Candidat 2', pct: 41 },
  { letter: 'C', text: 'Laisser chaque commune décider', rating: -1, redLine: true, initials: 'C3', name: 'Candidat 3', pct: 23 },
]

/** Palier d'affinité et nombre de bâtons, par le vrai moteur */
export const bandOf = (pct: number) => affinityBand(pct)!
export const sticksOf = (pct: number) => strokesFor(pct)

/** Repère dans la chronologie d'une scène : délai (et durée) d'un geste, en variables CSS */
export const at = (ms: number, dur?: number) => (dur ? { '--d': `${ms}ms`, '--dur': `${dur}ms` } : { '--d': `${ms}ms` })
