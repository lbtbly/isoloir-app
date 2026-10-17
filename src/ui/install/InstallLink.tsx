// Un lien discret vers « Installer l'application », sous « Et maintenant » (le dépouillement, l'accueil de retour) : là
// où sont ceux qui ont le plus de réponses à garder. Jamais dans l'application installée.

import { isInstalled } from '../../core/installed'
import { Icon } from '../components/Icon'
import { link } from '../nav'

export function InstallLink() {
  if (isInstalled()) return null
  return (
    <p class="next-install">
      <a class="btn-text" href={link('/installer')}>
        <Icon name="install" />
        Installer l’application
      </a>
      <span class="next-install-desc">Isoloir comme une application, vos réponses comprises.</span>
    </p>
  )
}
