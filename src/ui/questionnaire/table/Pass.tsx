// « À table » : le rideau. Entre deux votants, l'écran tombe en rideau plissé aux quatre pastels du logo : la
// personne suivante prend le téléphone, les autres détournent les yeux. Après le vote, « dans l'urne » : le bulletin
// est compté puis oublié, l'émargement gagne un bâton. Ni tampon ni rituel officiel.

import { votedLine } from '../../../core/table/copy'
import { Icon } from '../../components/Icon'
import { Tally } from '../../components/Tally'
import { ClosedFoot, ClosedHeader } from './Closed'

interface Props {
  /** « pass » : le rideau avant un vote ; « cast » : le bulletin vient d'entrer dans l'urne */
  phase: 'pass' | 'cast'
  voted: number
  people: number
  onTake: () => void
  /** Ajouter une personne (avant le dépouillement) */
  onArrive?: () => void
  /** Dépouiller sans attendre les absents */
  onCountNow?: () => void
  /** Le libellé de ce geste, et à partir de combien de bulletins il est proposé */
  countNow?: { label: string; from: number }
  /** Une sortie douce, sans tout effacer (annuler le nouveau tour de table) */
  onCancel?: { label: string; action: () => void }
  onStop: () => void
}

export function Pass({ phase, voted, people, onTake, onArrive, onCountNow, countNow = { label: 'Il manque quelqu’un\u00a0? Dépouiller maintenant', from: 4 }, onCancel, onStop }: Props) {
  const done = voted >= people
  return (
    <div class="screen screen-pass">
      <ClosedHeader where={<span class="pass-voted">{votedLine(voted, people)}</span>} offline={phase === 'cast'} />
      <main class="pass-sheet" id="contenu" tabIndex={-1}>
        <div class="pass-label">
          {phase === 'pass' ? (
            <>
              <h1 tabIndex={-1}>{voted === 0 ? 'Le téléphone est à la première personne.' : 'Passez le téléphone à la personne suivante.'}</h1>
              <p>Les autres détournent les yeux, comme devant l’isoloir.</p>
              <button type="button" class="btn-primary is-wide" onClick={onTake}>
                J’ai le téléphone
              </button>
            </>
          ) : (
            <>
              <h1 tabIndex={-1}>Votre bulletin est dans l’urne.</h1>
              <p>Il est compté, puis oublié&nbsp;: personne ne pourra le revoir, pas même vous.</p>
              <Tally count={voted} maxGroups={Infinity} label={votedLine(voted, people)} />
              <p class="pass-voted">{votedLine(voted, people)}</p>
              {done ? <p>Tout le monde a voté. Après le dépouillement, plus personne ne pourra voter à cette table.</p> : null}
              <button type="button" class="btn-primary is-wide" onClick={onTake}>
                {done ? 'Dépouiller ensemble' : 'Passer le téléphone'}
                <Icon name="arrow-right" />
              </button>
            </>
          )}
          <p class="pass-links">
            {onArrive ? (
              <button type="button" class="btn-text" onClick={onArrive}>
                Quelqu’un arrive
              </button>
            ) : null}
            {onCountNow && voted >= countNow.from && !done ? (
              <button type="button" class="btn-text" onClick={onCountNow}>
                {countNow.label}
              </button>
            ) : null}
            {onCancel ? (
              <button type="button" class="btn-text" onClick={onCancel.action}>
                {onCancel.label}
              </button>
            ) : null}
            <button type="button" class="btn-text" onClick={onStop}>
              Arrêter et effacer la table
            </button>
          </p>
        </div>
      </main>
      <ClosedFoot />
    </div>
  )
}
