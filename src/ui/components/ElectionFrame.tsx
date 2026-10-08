// Le cadre d'une élection : fournit à l'en-tête et au pied de page de chaque écran l'élection affichée et, si elle
// est archivée, de quoi le dire (CurrentElection). Il lit le registre des élections : seul app.tsx l'importe, la
// feuille de pointage ne lit que le contexte.

import type { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'
import type { ElectionInfo } from '../../core/types'
import { defaultEntry, ELECTIONS, entryById } from '../../elections'
import { CurrentElectionContext, type CurrentElection } from './CurrentElection'

export function ElectionFrame({ election, children }: { election: ElectionInfo; children: ComponentChildren }) {
  const value = useMemo<CurrentElection>(() => {
    const entry = entryById(election.id)
    // Archivée au registre (ce qui décide des adresses) ou dans ses propres données ; jamais l'élection du site
    const archived = (!!entry?.archived || !!election.archived) && entry !== defaultEntry
    return {
      election,
      archive: archived ? { votingUntil: entry?.votingUntil, currentLabel: defaultEntry.label } : null,
      hasArchives: ELECTIONS.some(e => e.archived),
    }
  }, [election])
  return <CurrentElectionContext.Provider value={value}>{children}</CurrentElectionContext.Provider>
}
