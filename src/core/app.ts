// Identité de l'application : un seul endroit pour renommer l'outil.
import { contactHref } from './legal'

export const APP_NAME = 'Isoloir'
export const APP_TAGLINE = 'Comparer les idées des candidats, sans dévoiler vos réponses à personne.'
/** Adresse publique, affichée au pied de l'image partagée (et dans les balises d'aperçu d'index.html) */
export const APP_URL: string = 'https://isoloir.vercel.app'
/** Où signaler une erreur dans les données : l'adresse de contact de src/core/legal.ts, vide tant qu'elle est à compléter */
export const REPORT_URL: string = contactHref('Isoloir : signaler une erreur') ?? ''
