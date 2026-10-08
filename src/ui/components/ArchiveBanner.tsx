// Bandeau d'une élection archivée, sous l'en-tête de chaque écran : ses données sont arrêtées, et l'élection du
// site est ailleurs. Pendant son vote, il dit que le questionnaire reste utilisable. Rien pour l'élection du site.
// Il ne lit que le contexte de l'élection affichée (CurrentElection) : la feuille de pointage peut l'afficher.

import { formatDate } from '../format'
import { linkIn } from '../nav'
import { isVoting, useCurrentElection, withArticle } from './CurrentElection'
import '../../styles/archive.css'

export function ArchiveBanner() {
  const current = useCurrentElection()
  if (!current?.archive) return null
  const { election, archive } = current
  const voting = isVoting(archive.votingUntil)
  const note = voting ? 'Le vote est en cours\u00a0; ce questionnaire reste utilisable.' : election.archived?.note
  const target = withArticle('pour', archive.currentLabel)
  return (
    <aside class="archive-banner" aria-label="Élection archivée">
      <p class="archive-banner-inner">
        <strong>Archive</strong>&nbsp;: données arrêtées au {formatDate(election.dataFrozenAt).replace(/ /g, '\u00a0')}.
        {note ? ` ${note}` : ''}{' '}
        {/* L'élection du site : ses adresses n'ont pas de préfixe */}
        <a href={linkIn('', '/')}>Isoloir {target}</a>
      </p>
    </aside>
  )
}
