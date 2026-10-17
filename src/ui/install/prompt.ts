// L'installation proposée par le navigateur (Chrome, Edge, Samsung Internet… sur Android et sur ordinateur) : il
// annonce dès l'ouverture de la page qu'il sait installer le site (beforeinstallprompt). L'annonce est gardée ici, sans
// laisser le navigateur afficher sa propre invite : Isoloir ne propose jamais l'installation de lui-même, seul le bouton
// « Installer Isoloir » de la page « Installer l'application » (ui/screens/Install.tsx) l'ouvre, au geste de la personne.
// appinstalled dit que c'est fait. Branché au démarrage (main.tsx), dans le code de chaque visite : l'annonce arrive avant
// qu'on ouvre la page. Au démarrage aussi, la demande de garder les réponses (navigator.storage.persist) : sans elle,
// Safari peut effacer les données d'un site qu'on n'ouvre plus pendant quelques semaines ; rien n'est envoyé.

/** L'annonce du navigateur : prompt() ouvre sa fenêtre d'installation, une seule fois */
interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let offer: InstallEvent | null = null
let done = false
const listeners = new Set<() => void>()
const tell = () => listeners.forEach(f => f())

/** Garde l'annonce d'installation et suit l'installation ; demande à garder les réponses */
export function watchInstall(): void {
  addEventListener('beforeinstallprompt', e => {
    // Pas d'invite du navigateur : la page en a son bouton
    e.preventDefault()
    offer = e as InstallEvent
    tell()
  })
  addEventListener('appinstalled', () => {
    offer = null
    done = true
    tell()
  })
  keepAnswers()
}

/** Le navigateur sait installer Isoloir maintenant (bouton « Installer Isoloir ») */
export const canInstall = (): boolean => !!offer

/** Isoloir vient d'être installé, pendant cette visite */
export const installedNow = (): boolean => done

/** Suit l'annonce et l'installation ; rend de quoi arrêter */
export function onInstall(f: () => void): () => void {
  listeners.add(f)
  return () => listeners.delete(f)
}

/** Ouvre la fenêtre d'installation du navigateur, au geste de la personne : « accepted », « dismissed », ou null sans annonce */
export async function install(): Promise<'accepted' | 'dismissed' | null> {
  const e = offer
  if (!e) return null
  // L'annonce ne sert qu'une fois : le navigateur en enverra une autre s'il le peut encore
  offer = null
  tell()
  try {
    await e.prompt()
    return (await e.userChoice).outcome
  } catch {
    return null
  }
}

/**
 * Demande au navigateur de ne pas effacer de lui-même les réponses gardées (Safari le fait pour un site qu'on n'ouvre
 * plus ; l'application de l'écran d'accueil y échappe). Sans question à la personne : sauf dans Firefox, qui en poserait
 * une, d'où l'exception
 */
function keepAnswers() {
  const storage = typeof navigator === 'undefined' ? undefined : navigator.storage
  if (!storage?.persist || /\bFirefox\//.test(navigator.userAgent)) return
  storage
    .persisted()
    .then(kept => (kept ? kept : storage.persist()))
    .catch(() => undefined)
}
