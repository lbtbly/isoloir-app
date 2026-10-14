// « À table » : la fin de séance, toujours en mode fermé. « C'est effacé. » après « Terminer et effacer la table » ;
// « La table a été interrompue. » après un rechargement (la séance ne vivait qu'en mémoire). Le verrou ne se lève
// que par un geste confirmé du propriétaire du téléphone, parce que revenir à Isoloir montrerait sa propre feuille.

import { useState } from 'preact/hooks'
import { Icon } from '../../components/Icon'
import { ClosedFoot, ClosedHeader } from './Closed'

export function Ended({ kind, onUnlock }: { kind: 'ended' | 'interrupted'; onUnlock: () => void }) {
  const [asking, setAsking] = useState(false)
  return (
    <div class="screen screen-ended">
      <ClosedHeader />
      <main class="sheet ended" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          {kind === 'ended' ? 'C’est effacé.' : 'La table a été interrompue.'}
        </h1>
        {kind === 'ended' ? (
          <p>Aucun bulletin ni aucun total n’est resté dans Isoloir. Si vous avez téléchargé l’image de la table, elle est dans les fichiers de ce téléphone.</p>
        ) : (
          <p>La page a été rechargée&nbsp;: les bulletins sont perdus, rien n’avait été gardé.</p>
        )}
        <p>Rendez le téléphone à son propriétaire.</p>
        <p class="small">Chacun peut faire sa propre feuille, seul, sur son téléphone&nbsp;: isoloir.vercel.app</p>
        {asking ? (
          <div class="consent" role="group" aria-label="Confirmer le retour à Isoloir">
            <p>Revenir à Isoloir montre la feuille et le dépouillement du propriétaire de ce téléphone.</p>
            <div class="consent-actions">
              <button type="button" class="btn-primary" onClick={onUnlock}>
                Oui, c’est mon téléphone
              </button>
              <button type="button" class="btn-text" onClick={() => setAsking(false)}>
                Annuler
              </button>
            </div>
          </div>
        ) : null}
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Fin de la table">
        <div class="action-bar-inner is-single">
          <button type="button" class="btn-text" onClick={() => setAsking(true)}>
            <Icon name="lock" />
            C’est mon téléphone&nbsp;: revenir à Isoloir
          </button>
        </div>
      </nav>
    </div>
  )
}
