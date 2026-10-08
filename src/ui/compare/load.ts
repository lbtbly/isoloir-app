// L'écran de comparaison (et le calcul qui le nourrit, core/compare.ts) est un fichier à part du build, chargé à la
// première visite de #/comparer : le code que télécharge chaque visite n'en contient rien. Il se prépare quand le
// navigateur a un moment, sur les pages qui y mènent (les candidats, le dépouillement), pour s'ouvrir sans attendre.
// La copie hors ligne le contient comme tous les fichiers du site.

export type CompareModule = typeof import('../screens/Compare')

let screen: CompareModule | null = null
let loading: Promise<CompareModule> | null = null

/** L'écran, s'il est déjà chargé */
export const compareNow = (): CompareModule | null => screen

/** Charge l'écran (une fois) ; un échec (ancienne version en cache, réseau coupé avant la copie hors ligne) permet de réessayer */
export function loadCompare(): Promise<CompareModule> {
  loading ??= import('../screens/Compare').then(
    m => (screen = m),
    e => {
      loading = null
      throw e
    },
  )
  return loading
}

/** Prépare l'écran quand le navigateur a un moment */
export function prepareCompare(): void {
  if (screen || loading) return
  const later = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  const go = () => void loadCompare().catch(() => undefined)
  if (later) later(go, { timeout: 4000 })
  else setTimeout(go, 1500)
}
