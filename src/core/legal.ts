// Informations légales : la SEULE source de l'identité de l'éditeur et de l'adresse de contact.
// Les pages « Mentions légales » et « Confidentialité », le lien « Signalez-la » (REPORT_URL, dans app.ts)
// et la mention du logo en dérivent ; seul le fichier LICENSE, à la racine, répète le nom à la main.
// Tant qu'une valeur commence par « [à compléter », elle s'affiche telle quelle, encadrée, et aucun lien
// n'est actif ; tools/check-dist.mjs avertit au build s'il en reste dans dist/.

const A_COMPLETER = '[à compléter'

/**
 * Éditeur, qui est aussi le directeur de la publication : identité publique (LCEN, art. 1-1, I ;
 * loi n° 82-652, art. 93-2). Personne physique : nom et prénom, domicile (ou adresse de domiciliation),
 * téléphone.
 */
export const EDITEUR: { nom: string; adresse: string; telephone: string } = {
  nom: 'Lambert BOULEY',
  adresse: '11, avenue de l’Opéra, 75001\u00a0Paris, France',
  telephone: '+33\u00a07\u00a083\u00a097\u00a034\u00a081',
}

/** Adresse électronique dédiée : signalements, corrections, droit de réponse, exercice des droits */
export const CONTACT_EMAIL: string = 'contact@isoloir.app'

/**
 * Fournisseur de la messagerie qui reçoit ces messages : il les conserve pour l'éditeur, c'est donc un
 * destinataire au sens du RGPD (art. 13, 1, e). Son nom et, s'il est établi hors de l'Union européenne,
 * son pays, par exemple « Proton AG, en Suisse, pays reconnu adéquat par la Commission européenne ».
 */
export const CONTACT_MESSAGERIE: string =
  '[à compléter : fournisseur de la messagerie, et son pays s’il est hors de l’Union européenne]'

/** Délai dans lequel un signalement est lu et vérifié (engagement affiché dans les mentions légales) */
export const DELAI_VERIFICATION = '72 heures'

/** Date de mise à jour des mentions légales et de la notice de confidentialité (AAAA-MM-JJ) */
export const MISE_A_JOUR = '2026-10-04'

/** Hébergeur, tel que Vercel le publie (vérifié le 4 octobre 2026, voir research/juridique/) */
export const HEBERGEUR = {
  nom: 'Vercel Inc.',
  adresse: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  /** Seul numéro publié par Vercel : celui de son agent DMCA */
  telephone: '+1 559 288 7060',
  courriel: 'legalnotices@vercel.com',
  confidentialite: 'https://vercel.com/legal/privacy-notice',
}

/** Vrai tant que la valeur reste à compléter (ou vide) ; les espaces insécables comptent comme des espaces */
export function isPlaceholder(value: string): boolean {
  const v = value.replace(/\u00a0/g, ' ').trim()
  return v === '' || v.startsWith(A_COMPLETER)
}

/** Lien mailto: vers l'adresse de contact, avec un objet prérempli ; null tant qu'elle est à compléter */
export function contactHref(subject?: string): string | null {
  if (isPlaceholder(CONTACT_EMAIL)) return null
  return `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
}
