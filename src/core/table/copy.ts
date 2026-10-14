// « À table » : tous les mots de la table, en un seul endroit, pour les tests de vocabulaire (ni sondage, ni score,
// ni gagnant ; « tous » jamais sans « ou presque »). Accords au singulier et au pluriel, typographie française.

import type { Shown, Verdict } from './count'

const NB = '\u00a0'

/** Le nom de la table, partout (le nom « Ce qui nous rassemble » a été écarté : écho à un parti) */
export const TABLE_NAME = 'À table'

export const plural = (n: number, one: string, many: string) => (n > 1 ? many : one)

/** Un compte montré, en toutes lettres quand il est au bord */
export function shownText(v: Shown): string {
  if ('exact' in v) return String(v.exact)
  return v.words === 'peu' ? 'personne ou presque' : 'toute la table ou presque'
}

/** Le titre d'une rubrique du dépouillement */
export const SECTION: Record<Verdict, string> = {
  reunit: 'Ce qui vous réunit',
  refuse: 'Ce que la table refuse',
  divise: 'Ce qui vous divise',
  aucun: 'Pas d’avis net',
}

/** La phrase d'un verdict, lue à voix haute ; « tous » toujours suivi de « ou presque » */
export function verdictLine(verdict: Verdict, agree: Shown, disagree: Shown): string {
  switch (verdict) {
    case 'reunit':
      return 'words' in agree && agree.words === 'presque-tous' ? 'Toute la table ou presque est d’accord' : 'Plus de la moitié de la table est d’accord'
    case 'refuse':
      return 'words' in disagree && disagree.words === 'presque-tous' ? 'Toute la table ou presque n’est pas d’accord' : 'La plupart d’entre vous ne sont pas d’accord'
    case 'divise':
      return 'Certains sont d’accord, d’autres non'
    case 'aucun':
      return 'La table n’a pas d’avis net'
  }
}

/** Les règles de « Comment la table compte », publiées sur la page de la table */
export const RULES = [
  'Chacun donne son avis sur la réglette du site : pas d’accord, sans avis ou d’accord, et peut tracer une ligne rouge. Passer une question est permis.',
  'Sur chaque question, la table, ce sont ceux qui ont donné un avis : passer ne compte pas. Une question n’est dépouillée qu’à partir de 3 bulletins ; en dessous, rien n’est montré.',
  'Vous réunit : plus de la moitié de la table est d’accord, et une personne au plus ne l’est pas. La table refuse : plus de la moitié n’est pas d’accord, et une personne au plus l’est. Vous divise : au moins deux d’accord et au moins deux pas d’accord.',
  'Aux deux bouts, des mots plutôt que des nombres : «' + NB + 'personne ou presque' + NB + '», «' + NB + 'toute la table ou presque' + NB + '». Aucun pourcentage. L’ordre des idées sur chaque bulletin, l’ordre de lecture à égalité et l’ordre des candidats sont tirés au hasard sur ce téléphone.',
  'Les sujets : pour chaque thème, la question du questionnaire rapide qui a une fiche «' + NB + 'Comprendre l’enjeu' + NB + '», où au moins trois candidats sur quatre ont une position connue, et où chaque bloc de l’axe de la grille des nuances (de l’extrême gauche à l’extrême droite) porte une approche principale ; s’il y en a plusieurs, celle où le plus de candidats ont une position connue, puis la première de la liste. Deux sont tirés au hasard ; vous pouvez les changer. Un thème sans question qui remplit ces conditions n’est pas proposé.',
]

/** « Le secret, honnêtement » */
export const SECRET = [
  'Votre bulletin n’est jamais montré ni gardé : il est ajouté au compte, puis oublié.',
  'Quand tout le monde vote pareil, cela se voit : c’est pourquoi l’écran dit «' + NB + 'toute la table ou presque' + NB + '» plutôt qu’un nombre.',
  'Si vous êtes seul à voter autrement sur une idée, le dépouillement peut vous apprendre comment les autres ont voté sur elle.',
  'Si tous les autres comparent leurs votes, ils peuvent deviner le vôtre, comme dans un tout petit bureau de vote. À trois, c’est plus facile : mieux vaut être quatre ou plus.',
  'Avec un lecteur d’écran, le bulletin est lu à voix haute : mettez des écouteurs.',
  'Recharger la page fait perdre la séance : rien n’est gardé, même pour la reprendre.',
  'La table ne montre pas la feuille du propriétaire du téléphone et n’y touche pas. Un autre onglet ouvert sur Isoloir, lui, la montrerait.',
]

/** Les trois règles de table de « Vous voulez en parler ? » */
export const TALK_RULES = ['On parle de l’idée, pas des personnes.', 'Personne n’a à dire ce qu’il a voté.', 'Chacun parle une fois avant que quelqu’un parle deux fois.']

/** Récapitulatif de la préparation, sans minutes */
export const setupSummary = (people: number, questions: number, ideas: number) =>
  `${people}${NB}personnes · ${questions}${NB}${plural(questions, 'question', 'questions')} chacune · ${ideas}${NB}idées à lire`

/** Le compte des votants, à l'émargement */
export const votedLine = (voted: number, people: number) => `${voted}${NB}sur ${people}${NB}${plural(voted, 'a voté', 'ont voté')}`
