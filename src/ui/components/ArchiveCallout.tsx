// Encart de l'accueil de l'élection du site : une élection archivée (la primaire, une fois la présidentielle en
// ligne) dont le vote est encore en cours, ou dont cet appareil garde une feuille, reste à un lien. Les feuilles
// des deux élections sont séparées : on ne les mélange jamais, on dit seulement où trouver l'autre.

import { hasSaved } from '../../core/storage'
import { defaultEntry, ELECTIONS } from '../../elections'
import { linkIn } from '../nav'
import { isVoting, withArticle } from './CurrentElection'
import '../../styles/archive.css'

const DAY_LONG = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
const HOUR = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Paris' })

/** « samedi 17 octobre à 20 h », « samedi 1er mai à 20 h » (heure de Paris, les minutes seulement si elles comptent) */
function closing(iso: string): string {
  const d = new Date(iso)
  const [h, m] = HOUR.format(d).split(':')
  const hour = m && m !== '00' ? `${Number(h)}\u00a0h\u00a0${m}` : `${Number(h)}\u00a0h`
  const day = DAY_LONG.format(d).replace(/^(\S+ )1 /, (_, weekday: string) => `${weekday}1er `)
  return `${day.replace(/ /g, '\u00a0')} à\u00a0${hour}`
}

export function ArchiveCallout({ electionId }: { electionId: string }) {
  if (electionId !== defaultEntry.id) return null
  const now = Date.now()
  const shown = ELECTIONS.filter(e => e.archived && e !== defaultEntry)
    .map(e => ({ entry: e, voting: isVoting(e.votingUntil, now), saved: hasSaved(e.id) }))
    .filter(x => x.voting || x.saved)
  if (!shown.length) return null
  return (
    <>
      {shown.map(({ entry, voting, saved }) => (
        // Une section titrée de la page d'accueil (un « aside » dans <main> serait un repère mal placé)
        <section key={entry.id} class="archive-callout" aria-labelledby={`archive-${entry.id}`}>
          <h2 id={`archive-${entry.id}`}>
            {voting ? `Vous votez ${withArticle('à', entry.label)}\u00a0?` : `Votre feuille ${withArticle('de', entry.label)}`}
          </h2>
          <p>
            {voting
              ? `Le vote est en cours jusqu’au ${closing(entry.votingUntil!)}. Son questionnaire reste utilisable, tel qu’il était${
                  saved ? '\u00a0; vos réponses y sont gardées, à part, sur cet appareil' : ''
                }.`
              : 'Elle reste sur cet appareil, à part. Le questionnaire est gardé en archive, tel qu’il était.'}
          </p>
          <p>
            <a href={linkIn(entry.slug, '/')}>Isoloir {withArticle('pour', entry.label)}</a>
          </p>
        </section>
      ))}
    </>
  )
}
