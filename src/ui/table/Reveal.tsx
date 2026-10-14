// « À table » : « Qui porte ces idées ? ». Seulement après le dépouillement, et plus aucun vote ensuite. Pour chaque
// idée des questions de la table, le mot de la table, puis ce qu'en pensent tous les candidats visibles (classés ou
// non), groupés sous des libellés écrits, dans un ordre tiré au hasard pour la séance. Aucun décompte par candidat,
// aucun portrait : quelques questions ne disent pas quel candidat ressemble à une table.

import type { Mark } from '../../core/carriers'
import { holdersOf, unknownOf } from '../../core/carriers'
import type { Verdict } from '../../core/table/count'
import { SECTION } from '../../core/table/copy'
import type { Candidate, ElectionPack, Question } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { Icon } from '../components/Icon'
import { Initials, InitialsSample } from '../components/Initials'
import { PositionSources } from '../components/PositionSources'
import { ClosedFoot, ClosedHeader } from '../questionnaire/table/Closed'

const GROUPS: { mark: Mark; label: string }[] = [
  { mark: 'main', label: 'Approche principale' },
  { mark: 'secondary', label: 'Approche compatible' },
  { mark: 'rejects', label: 'Rejette l’idée' },
]

interface Props {
  questions: readonly Question[]
  /** Les candidats visibles, déjà mélangés avec la graine de la séance */
  people: readonly Candidate[]
  positions: ElectionPack['positions']
  /** Le mot de la table pour chaque idée (absent : question non dépouillée) */
  verdicts: ReadonlyMap<string, Verdict>
  onPicture: () => void
  onEnd: () => void
}

export function Reveal({ questions, people, positions, verdicts, onPicture, onEnd }: Props) {
  return (
    <div class="screen screen-wide screen-table-reveal">
      <ClosedHeader where="Les noms" />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          Qui porte ces idées&nbsp;?
        </h1>
        <p class="lede">
          Maintenant seulement, les noms. Pour chaque idée de votre table, ce qu’en pensent les {people.length} candidats, d’après leurs
          positions publiques et sourcées, dans un ordre tiré au hasard.
        </p>
        <AiLabel kind="positions" more="seule" />
        <p class="small">
          Les pastilles disent ce que chaque candidat pense de l’idée. Elles ne comptent rien&nbsp;:{' '}
          <InitialsSample mark="main" /> approche principale, <InitialsSample mark="secondary" /> approche compatible,{' '}
          <InitialsSample mark="rejects" /> rejette l’idée, <InitialsSample mark="unknown" /> position non trouvée.
        </p>
        {questions.map(q => {
          const unknown = unknownOf(q, people, positions)
          return (
            <article key={q.id} class="reveal is-table" aria-labelledby={`t-${q.id}`}>
              <h2 class="reveal-prompt" id={`t-${q.id}`}>
                {q.prompt}
              </h2>
              <ul class="reveal-approaches">
                {q.approaches.map(a => {
                  const verdict = verdicts.get(`${q.id}:${a.id}`)
                  const holders = holdersOf(a, people, positions)
                  return (
                    <li key={a.id} class="reveal-row">
                      <div>
                        {verdict && verdict !== 'aucun' ? <span class={`table-verdict is-${verdict}`}>{SECTION[verdict]}</span> : null}
                        <p class="reveal-text">{a.text}</p>
                        {holders.length ? (
                          GROUPS.map(g => {
                            const group = holders.filter(h => h.mark === g.mark)
                            if (!group.length) return null
                            return (
                              <p key={g.mark} class="holders-group">
                                <span class="holders-group-label">{g.label}&nbsp;:</span>
                                {group.map(h => (
                                  <Initials key={h.c.id} candidate={h.c} mark={h.mark} withName />
                                ))}
                              </p>
                            )
                          })
                        ) : (
                          <p class="holders-group nobody">{a.external ? 'Aucun des candidats' : 'Personne'}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
              {unknown.length ? (
                <p class="reveal-unknown">
                  <span>Position non trouvée à ce jour&nbsp;:</span>
                  {unknown.map(c => (
                    <Initials key={c.id} candidate={c} mark="unknown" withName />
                  ))}
                </p>
              ) : null}
              <PositionSources question={q} people={people} positions={positions} aiMore="seule" />
            </article>
          )
        })}
        <p class="small">Quelques questions ne suffisent pas à dire quel candidat est proche de votre table&nbsp;: chaque idée se lit seule.</p>
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="Fin de la table">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={onPicture}>
            <Icon name="download" />
            Image de la table
          </button>
          <span />
          <button type="button" class="btn-primary" onClick={onEnd}>
            Terminer
          </button>
        </div>
      </nav>
    </div>
  )
}
