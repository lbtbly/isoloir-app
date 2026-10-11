// Le dépouillement en PDF (core/reportPdf.ts et son moteur, core/pdf/) est un fichier à part du build, chargé à la
// demande : le code que télécharge chaque visite n'en contient rien. Il se prépare quand le navigateur a un moment,
// sur la page des résultats, pour que la fabrication et le téléchargement restent dans le geste de l'utilisateur
// (Safari sur iPhone refuse un téléchargement lancé après une attente). La copie hors ligne le contient comme tous
// les fichiers du site.

export type ReportModule = typeof import('../../core/reportPdf')

let mod: ReportModule | null = null
let loading: Promise<ReportModule> | null = null

/** Le module, s'il est déjà chargé */
export const reportNow = (): ReportModule | null => mod

/** Charge le module (une fois) ; un échec (ancienne version en cache après un déploiement, copie hors ligne incomplète) permet de réessayer */
export function loadReport(): Promise<ReportModule> {
  loading ??= import('../../core/reportPdf').then(
    m => (mod = m),
    e => {
      loading = null
      throw e
    },
  )
  return loading
}

/** Prépare le module quand le navigateur a un moment */
export function prepareReport(): void {
  if (mod || loading) return
  const later = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  const go = () => void loadReport().catch(() => undefined)
  if (later) later(go, { timeout: 4000 })
  else setTimeout(go, 1500)
}
