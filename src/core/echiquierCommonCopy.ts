// Les mots que la page « Mon profil politique » (core/echiquierCopy.ts) et sa rubrique de la Méthode
// (core/echiquierMethodCopy.ts) ont en commun : la typographie du site (fr()), les nombres en lettres, ce que dit la
// couleur d'une case (« Comment c'est calculé » de la page, « Les couleurs » de la rubrique) et ce qui reste sur
// l'appareil (le chapeau de la page, « Vie privée » de la rubrique). Repris tels quels par ces deux modules. À part, sans
// rien du calcul de la page (core/echiquier.ts) : la rubrique, chargée à la demande par la Méthode, les prend ici sans
// emporter la page, ni la page les mots de la rubrique. Mêmes règles d'écriture que la page (core/echiquierCopy.ts) ;
// tests/echiquier-copy.test.ts les vérifie.

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

/** Point 3 de « Comment c'est calculé » : la couleur d'une case, palier par palier (core/affinity.ts) */
export const HOW_COLOR = fr(
  `La couleur d’une case donne votre affinité moyenne avec les candidats du bloc, selon les paliers du site : ${AFFINITY_BANDS.map(b => `${b.label.toLocaleLowerCase('fr')} (${bandRange(b)})`).join(', ')}.`,
)
/**
 * Point 6 de « Comment c'est calculé » : ce que la couleur ne dit pas (le même texte dans la Méthode). Mesuré sur la
 * présidentielle le 15 octobre 2026, cases des thèmes (119) : tout approuver donne 96,6 % de « très proche », tout
 * désapprouver 95,8 % de « très éloigné » (97 et 96 cases sur 100) ; approuver 80 % des approches, 75 % de « très proche »
 * et 23 % de « proche » (12 octobre). L'écart entre blocs de quatre et de deux candidats, lui, ne se mesure pas (1 à 2
 * points, dans un sens ou dans l'autre selon les réponses) : on ne le dit pas. Une lecture nette peut tomber sur une case
 * « mitigé » : « nettement plus près » commence à 55 %, « proche » à 60 % ; « nettement plus loin » à 45 %, « éloigné » à
 * 39 %. Plus jamais « hasard » pour dire la comparaison (décision du propriétaire du 15 octobre 2026) : ce sont « les
 * autres façons de poser vos mêmes avis »
 */
export const COLORS_CHANCE = fr(
  `La couleur seule ne dit pas « nettement » : elle dépend aussi de votre façon de répondre. Qui approuve beaucoup voit le plus souvent « proche » et « très proche », qui désapprouve beaucoup « éloigné » et « très éloigné » : tout approuver colore 97${NB}cases sur 100 en « très proche », tout désapprouver 96 sur 100 en « très éloigné ». Et la couleur d’un bloc vient de la moyenne de ses candidats : quand ils ne pensent pas pareil, elle est moins tranchée que votre affinité avec certains d’entre eux dans « Par thème ». Seules les lectures nettes comparent vos réponses aux autres façons de poser vos mêmes avis ; elles ne suivent pas les paliers : une lecture nette peut tomber sur une case « mitigé ».`,
)

/**
 * Ce qui reste sur l'appareil : sous le chapeau de la page (décision du propriétaire du 15 octobre 2026) et en fin de la
 * rubrique de la Méthode (« Vie privée »)
 */
export const PRIVACY = fr(
  'Calcul sans IA, sur votre appareil ; la lecture reste seulement en mémoire le temps de la visite (un rechargement l’oublie), et rien n’est enregistré ni envoyé.',
)
