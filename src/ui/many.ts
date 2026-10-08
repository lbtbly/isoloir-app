// Élection nombreuse (une présidentielle, une vingtaine de candidats) : au-delà de 8 candidats, les écrans qui
// les montrent tous à la fois se resserrent (portraits plus petits, colonnes plus nombreuses, grille par thème
// réduite aux premiers du classement). Jusqu'à 8, rien ne change : c'est la mise en page de la primaire.

/** Nombre de candidats jusqu'auquel la mise en page ordinaire tient */
export const MANY_CANDIDATES = 8

/** Assez de candidats pour la mise en page resserrée */
export const isMany = (count: number): boolean => count > MANY_CANDIDATES
