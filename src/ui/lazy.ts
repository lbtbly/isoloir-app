// Un fichier à part du build, chargé à la demande par import() : le code que télécharge chaque visite n'en contient
// rien. La même mécanique pour chacun (la comparaison, « Mon profil politique », le dépouillement en PDF, l'image
// « Accords et désaccords ») : le module une fois chargé, son chargement (une seule fois ; un échec, ancienne version
// en cache après un déploiement ou réseau coupé avant la copie hors ligne, permet de réessayer), et sa préparation
// quand le navigateur a un moment. La copie hors ligne contient ces fichiers comme tous ceux du site.

import { useEffect, useState } from 'preact/hooks'

export interface OnDemand<M> {
  /** Le module, s'il est déjà chargé */
  now: () => M | null
  /** Charge le module (une fois) ; après un échec, un nouvel appel réessaie */
  load: () => Promise<M>
  /** Prépare le module quand le navigateur a un moment */
  prepare: () => void
}

export function onDemand<M>(importer: () => Promise<M>): OnDemand<M> {
  let mod: M | null = null
  let loading: Promise<M> | null = null
  const load = () =>
    (loading ??= importer().then(
      m => (mod = m),
      e => {
        loading = null
        throw e
      },
    ))
  return {
    now: () => mod,
    load,
    prepare() {
      if (mod || loading) return
      const later = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      const go = () => void load().catch(() => undefined)
      if (later) later(go, { timeout: 4000 })
      else setTimeout(go, 1500)
    },
  }
}

/**
 * Pour un écran ou une rubrique chargés à la demande : le module dès qu'il est là (null avant), et l'échec du
 * chargement. onLoad suit l'arrivée du module, quand il a fallu l'attendre.
 */
export function useOnDemand<M>(now: () => M | null, load: () => Promise<M>, onLoad?: () => void): [M | null, boolean] {
  const [mod, setMod] = useState(now)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (mod) return
    let alive = true
    load().then(
      m => {
        if (!alive) return
        setMod(() => m)
        onLoad?.()
      },
      () => alive && setFailed(true),
    )
    return () => {
      alive = false
    }
  }, [mod])
  return [mod, failed]
}
