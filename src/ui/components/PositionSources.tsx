// « Voir les positions et sources » d'une question : pour chaque candidat qui a une position sur l'une de ses
// approches, la marque (principale, compatible, rejet), le résumé, sa nature et ses sources, dans l'ordre des
// candidats que l'écran a déjà mélangé. Replié par défaut. Partagé par « Qui porte quoi » et la révélation de la table.

import { useState } from 'preact/hooks'
import type { Candidate, ElectionPack, Position, Question } from '../../core/types'
import { AiLabel } from './AiLabel'
import { ExternalLink } from './ExternalLink'
import { formatSourceDate, hostOf } from '../format'

const NATURE: Record<Position['nature'], string> = {
  proposition: 'proposition',
  declaration: 'déclaration',
  inference: 'déduction (vote ou texte signé)',
}

interface Props {
  question: Question
  people: readonly Candidate[]
  positions: ElectionPack['positions']
  /** L'étiquette IA du panneau : avec un lien vers « Usage de l'IA » (par défaut), ou seule, là où aucun lien ne doit sortir de l'écran */
  aiMore?: 'lien' | 'seule'
}

export function PositionSources({ question, people, positions, aiMore = 'lien' }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" class="btn-text sources-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Masquer les positions et sources' : 'Voir les positions et sources'}
      </button>
      {open ? (
        <div class="sources">
          <AiLabel kind="resumes" more={aiMore} class="sources-ai" />
          <dl class="sources-list">
            {people.map(c => {
              const entries = question.approaches
                .map(a => ({ a, p: positions[c.id]?.[a.id] }))
                .filter((x): x is { a: Question['approaches'][number]; p: Position } => !!x.p)
              if (!entries.length) return null
              return (
                <div key={c.id} class="source-person">
                  <dt>{c.name}</dt>
                  {entries.map(({ a, p }) => (
                    <dd key={a.id}>
                      <p class="source-approach">
                        <span class="source-mark">{p.weight === 2 ? 'Approche principale' : p.weight === 1 ? 'Approche compatible' : 'Rejette'}</span>{' '}
                        <q>{a.text}</q>
                      </p>
                      <p>
                        {p.summary}{' '}
                        <span class="source-kind">
                          ({NATURE[p.nature]}
                          {p.confidence === 'low' ? ', position probable, non comptée' : p.confidence === 'medium' ? ', formulation moins nette' : ''})
                        </span>
                      </p>
                      <ul class="source-links">
                        {p.sources.map(s => (
                          <li key={s.url}>
                            <ExternalLink href={s.url}>{s.title}</ExternalLink>{' '}
                            <span class="source-meta">
                              {s.publisher ?? hostOf(s.url)}
                              {s.date ? `, ${formatSourceDate(s.date)}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  ))}
                </div>
              )
            })}
          </dl>
        </div>
      ) : null}
    </>
  )
}
