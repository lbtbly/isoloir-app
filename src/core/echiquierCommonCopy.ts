// Les mots que la page « Mon profil politique » (core/echiquierCopy.ts) et sa rubrique de la Méthode
// (core/echiquierMethodCopy.ts) ont en commun : la typographie du site (fr()), les nombres en lettres, et ce que dit la
// couleur d'une case (« Comment lire » de la page, « Les couleurs » de la rubrique). Repris tels quels par ces deux
// modules. À part, sans rien du calcul de la page (core/echiquier.ts) : la rubrique, chargée à la demande par la
// Méthode, les prend ici sans emporter la page, ni la page les mots de la rubrique. Mêmes règles d'écriture que la page
// (core/echiquierCopy.ts) ; tests/echiquier-copy.test.ts les vérifie.

import { AFFINITY_BANDS, bandRange } from './affinity'

const NB = '\u00a0'

/** Espaces insécables du site : avant « : ; ? ! », après « « » et avant « » », entre un nombre et « % » */
export const fr = (s: string): string =>
  s
    .replace(/ ([:;?!»])/g, `${NB}$1`)
    .replace(/« /g, `«${NB}`)
    .replace(/(\d) %/g, `$1${NB}%`)

const WORDS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt']
/** Un nombre en lettres, jusqu'à vingt ; au-delà, en chiffres */
export const word = (n: number) => WORDS[n] ?? String(n)

/** Point 4 : la couleur d'une case, palier par palier (core/affinity.ts) */
export const HOW_COLOR = fr(
  `La couleur d’une case donne votre affinité moyenne avec les candidats du bloc, selon les paliers du site : ${AFFINITY_BANDS.map(b => `${b.label.toLocaleLowerCase('fr')} (${bandRange(b)})`).join(', ')}.`,
)
/**
 * Point 5 : ce que la couleur ne dit pas (le même texte dans la Méthode). Mesuré sur la présidentielle, cases des thèmes :
 * tout approuver donne 97 % de « très proche », tout désapprouver 96 % de « très éloigné » ; approuver 80 % des
 * approches, 75 % de « très proche » et 23 % de « proche ». L'écart entre blocs de quatre et de deux candidats, lui,
 * ne se mesure pas (1 à 2 points, dans un sens ou dans l'autre selon les réponses) : on ne le dit pas. Une lecture
 * nette peut tomber sur une case « mitigé » : « nettement plus près » commence à 55 %, « proche » à 60 % ; « nettement
 * plus loin » à 45 %, « éloigné » à 39 %.
 */
export const COLORS_CHANCE = fr(
  'La couleur seule ne se compare pas au hasard : des réponses données au hasard colorent aussi des cases ; qui approuve beaucoup voit surtout « proche » et « très proche », qui désapprouve beaucoup surtout « éloigné » et « très éloigné » (tout approuver donne « très proche » presque partout, tout désapprouver « très éloigné ») ; et la couleur d’un bloc vient de la moyenne de ses candidats : quand ils ne pensent pas pareil, cette moyenne est moins tranchée que votre affinité avec certains d’entre eux dans « Par thème ». Seules les lectures nettes disent qu’un écart dépasse nettement le hasard : les sujets du haut du graphique, le compte qui les annonce et la phrase d’une ligne ouverte. Elles ne suivent pas les paliers : une lecture nette peut tomber sur une case « mitigé ».',
)
