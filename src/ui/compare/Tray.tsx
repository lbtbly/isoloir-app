// La sélection à comparer, sur les pages des candidats : une case « Comparer » par candidat (liste, fiche), et le
// plateau, qui prend la place de la barre du bas dès qu'un candidat est choisi, comme le panier d'un comparateur :
// « Comparer (3) », les vignettes (chacune retire son candidat), « Voir la comparaison » à partir de deux.
// Quatre au plus : la case d'un cinquième dit pourquoi elle ne coche pas. Rien n'est enregistré (selection.ts).

import type { ComponentChildren } from 'preact'
import { useRef, useState } from 'preact/hooks'
import { comparePath } from '../../core/routes'
import type { Candidate, ElectionPack } from '../../core/types'
import { Icon } from '../components/Icon'
import { InkTick } from '../components/Ink'
import { Portrait } from '../components/Portrait'
import { link } from '../nav'
import { MAX_COMPARED, MAX_COMPARED_WORDS, getSelection, say, toggleSelected, useNotice, useSelection, type ToggleResult } from './selection'
import '../../styles/compare.css'

const count = (n: number) => `${n}\u00a0candidat${n > 1 ? 's' : ''}`

/** Ajoute ou retire un candidat de la sélection, et le dit (message du plateau) */
export function toggleCandidate(electionId: string, c: Candidate): ToggleResult {
  const result = toggleSelected(electionId, c.id)
  const n = getSelection(electionId).length
  if (result === 'full')
    say(electionId, `Déjà ${MAX_COMPARED_WORDS}\u00a0candidats à comparer\u00a0: retirez-en un pour ajouter ${c.name}.`, true)
  else if (result === 'added')
    say(electionId, `Ajout à la comparaison\u00a0: ${c.name}. ${n > 1 ? `${count(n)} à comparer.` : 'Choisissez-en au moins un autre.'}`)
  else say(electionId, `Retrait de la comparaison\u00a0: ${c.name}. ${n ? `${count(n)} à comparer.` : 'Plus aucun candidat à comparer.'}`)
  return result
}

interface ToggleProps {
  electionId: string
  candidate: Candidate
  /** Le libellé visible ; par défaut « Comparer », suivi du nom pour les lecteurs d'écran */
  children?: ComponentChildren
  class?: string
}

/**
 * La case « Comparer » d'un candidat : une case imprimée que la coche bille remplit (le geste de l'électeur, comme
 * la case d'un thème prioritaire). Plateau plein : la case reste lisible et dit, au toucher, pourquoi elle ne coche pas.
 */
export function CompareToggle({ electionId, candidate, children, class: c }: ToggleProps) {
  const ids = useSelection(electionId)
  const on = ids.includes(candidate.id)
  const full = !on && ids.length >= MAX_COMPARED
  // La coche ne se trace qu'au geste ; au chargement, elle est entière
  const [drawn, setDrawn] = useState(false)
  return (
    <button
      type="button"
      class={['compare-toggle', c].filter(Boolean).join(' ')}
      aria-pressed={on}
      aria-disabled={full ? 'true' : undefined}
      onClick={() => setDrawn(toggleCandidate(electionId, candidate) === 'added')}
    >
      {children ?? (
        <span class="compare-toggle-label">
          Comparer<span class="sr-only"> {candidate.name}</span>
        </span>
      )}
      <span class="box" aria-hidden="true">
        {on ? <InkTick draw={drawn} /> : null}
      </span>
    </button>
  )
}

interface BarProps {
  pack: ElectionPack
  /** La barre ordinaire de la page, montrée tant que rien n'est choisi */
  children: ComponentChildren
  /** Faux sur la comparaison elle-même : la rangée des candidats y tient lieu de plateau */
  tray?: boolean
}

/**
 * La barre du bas des pages candidats : la barre ordinaire, ou le plateau dès qu'un candidat est choisi. Toujours le
 * même élément (sa hauteur réelle reste mesurée pour la réserve du bas de page), et un message d'état permanent pour
 * les lecteurs d'écran.
 */
export function CompareBar({ pack, children, tray = true }: BarProps) {
  const eid = pack.election.id
  const ids = useSelection(eid)
  const notice = useNotice(eid)
  const bar = useRef<HTMLElement>(null)
  const byId = new Map(pack.candidates.map(c => [c.id, c]))
  const chosen = ids.map(id => byId.get(id)).filter((c): c is Candidate => !!c)
  const n = tray ? chosen.length : 0

  /** Retire un candidat ; le focus passe à la vignette voisine, ou à la barre ordinaire quand le plateau se vide */
  const remove = (c: Candidate, i: number) => {
    toggleCandidate(eid, c)
    requestAnimationFrame(() => {
      const chips = bar.current?.querySelectorAll<HTMLElement>('.tray-chip') ?? []
      const next = chips[Math.min(i, chips.length - 1)] ?? bar.current?.querySelector<HTMLElement>('a, button:not([disabled])')
      next?.focus()
    })
  }

  return (
    <nav class={`action-bar${n ? ' compare-bar' : ''}`} aria-label={n ? 'Comparaison' : 'Suite'} ref={bar}>
      {n ? (
        <div class="action-bar-inner tray">
          <div class="tray-pick" role="group" aria-labelledby="tray-title">
            <p class="tray-title" id="tray-title">
              Comparer <span class="tray-n">({n})</span>
              <span class="sr-only">
                {' '}
                : {count(n)} choisi{n > 1 ? 's' : ''} sur {MAX_COMPARED}
              </span>
            </p>
            <ul class="tray-list">
              {chosen.map((c, i) => (
                <li key={c.id}>
                  <button type="button" class="tray-chip" onClick={() => remove(c, i)} title={`Retirer ${c.name}`}>
                    <Portrait candidate={c} size="small" decorative />
                    <span class="tray-x" aria-hidden="true">
                      <Icon name="cross" />
                    </span>
                    <span class="sr-only">Retirer {c.name} de la comparaison</span>
                  </button>
                </li>
              ))}
              {Array.from({ length: MAX_COMPARED - n }, (_, i) => (
                <li key={`slot-${i}`} class="tray-slot" aria-hidden="true" />
              ))}
            </ul>
          </div>
          {n >= 2 ? (
            <a class="btn-primary tray-go" href={link(comparePath(ids))}>
              <span class="tray-go-long">Voir la comparaison</span>
              <span class="tray-go-short" aria-hidden="true">
                Voir
              </span>
              <Icon name="arrow-right" />
            </a>
          ) : (
            <button
              type="button"
              class="btn-primary tray-go"
              aria-disabled="true"
              onClick={() => say(eid, 'Choisissez au moins un autre candidat\u00a0: on compare à deux, trois ou quatre.', true)}
            >
              <span class="tray-go-long">Voir la comparaison</span>
              <span class="tray-go-short" aria-hidden="true">
                Voir
              </span>
              <Icon name="arrow-right" />
            </button>
          )}
          {notice?.shown ? (
            <p class="tray-notice" aria-hidden="true">
              {notice.text}
            </p>
          ) : n === 1 ? (
            <p class="tray-notice is-hint" aria-hidden="true">
              Choisissez un autre candidat pour comparer.
            </p>
          ) : null}
        </div>
      ) : (
        <div class="action-bar-inner">{children}</div>
      )}
      {/* Annonces du plateau : un seul message d'état, toujours présent (la partie visible ci-dessus est masquée
          aux lecteurs d'écran, qui l'entendent ici) */}
      <p class="sr-only" role="status">
        {notice?.text ?? ''}
      </p>
    </nav>
  )
}
