// Le dépouillement en PDF (core/reportPdf.ts et son moteur, core/pdf/) est un fichier à part du build, chargé à la
// demande : le code que télécharge chaque visite n'en contient rien. Il se prépare quand le navigateur a un moment,
// sur la page des résultats, pour que la fabrication et le téléchargement restent dans le geste de l'utilisateur
// (Safari sur iPhone refuse un téléchargement lancé après une attente). La copie hors ligne le contient comme tous
// les fichiers du site.

import { onDemand } from '../lazy'

export type ReportModule = typeof import('../../core/reportPdf')

const report = onDemand<ReportModule>(() => import('../../core/reportPdf'))

/** Le module, s'il est déjà chargé */
export const reportNow = report.now
/** Charge le module (une fois) ; un échec (ancienne version en cache après un déploiement, copie hors ligne incomplète) permet de réessayer */
export const loadReport = report.load
/** Prépare le module quand le navigateur a un moment */
export const prepareReport = report.prepare
