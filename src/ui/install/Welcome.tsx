// L'avis de l'accueil de l'application installée, ouverte vide, là où elle a son propre espace (iPhone, iPad, Safari du
// Mac : core/installed.ts) : les réponses données dans le navigateur n'y sont pas, on dit comment les faire passer. Sur
// iPhone et iPad, elle a pu être ajoutée depuis Safari, Chrome, Edge ou Firefox, et ne sait pas lequel. Il porte
// l'aplat bleu de l'accueil (« Importer mes réponses ») ; « Je n'avais pas répondu » le ferme pour de bon (retenu sur
// l'appareil, sous une clé d'Isoloir, effacée avec le reste par « Tout effacer »), et la première réponse aussi.

import { useState } from 'preact/hooks'
import { appApart } from '../../core/installed'
import { STORAGE_PREFIX } from '../../core/storage'
import { Icon } from '../components/Icon'
import { link } from '../nav'

/** « Je n'avais pas répondu » : l'avis ne revient plus sur cet appareil */
export const WELCOME_KEY = `${STORAGE_PREFIX}accueil-application`

const closed = () => {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'ferme'
  } catch {
    return false
  }
}

/** L'avis est à montrer (application à part, aucune réponse, pas fermé) ; et de quoi le fermer */
export function useAppWelcome(empty: boolean): [boolean, () => void] {
  const [gone, setGone] = useState(closed)
  const close = () => {
    try {
      localStorage.setItem(WELCOME_KEY, 'ferme')
    } catch {
      // stockage refusé : l'avis se ferme le temps de la visite
    }
    setGone(true)
    // Le focus passe à l'appel de l'en-tête, redevenu l'action principale
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.header-cta')?.focus())
  }
  return [empty && !gone && !!appApart(), close]
}

export function AppWelcome({ onClose }: { onClose: () => void }) {
  const os = appApart()
  const where = os === 'mac' ? 'ce Mac' : os === 'ipad' ? 'cet iPad' : 'cet iPhone'
  return (
    <aside class="app-welcome" aria-labelledby="app-welcome-title">
      <h2 id="app-welcome-title" class="app-welcome-title">
        Vous aviez déjà répondu&nbsp;?
      </h2>
      <p>
        Ici, tout part de zéro&nbsp;: sur {where}, l’application ne voit pas les réponses données dans{' '}
        {os === 'mac' ? 'Safari' : 'Safari ou un autre navigateur'}. Faites-les passer une fois.
      </p>
      <div class="app-welcome-actions">
        <a class="btn-primary" href={link('/autre-appareil/importer')}>
          <Icon name="paste" />
          Importer mes réponses
        </a>
        <div class="app-welcome-more">
          <a class="btn-text" href={link('/installer')}>
            Comment faire
          </a>
          <button type="button" class="btn-text" onClick={onClose}>
            Je n’avais pas répondu
          </button>
        </div>
      </div>
    </aside>
  )
}
