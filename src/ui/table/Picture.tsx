// « À table » : l'image de la table, fabriquée sur le téléphone et seulement avec l'accord de toute la table. Ni
// prénom, ni candidat, ni nombre de personnes, ni date de séance : ce que la table pense des idées, en mots, « sans
// valeur statistique ». « Télécharger » seulement (le partage vers une messagerie reste à décider). Coupée pendant le
// gel des jours de vote.

import type { ComponentChildren } from 'preact'
import { Icon } from '../components/Icon'
import { ClosedFoot, ClosedHeader } from '../questionnaire/table/Closed'

interface Props {
  /** La période de gel en cours, en toutes lettres ; null hors gel */
  frozen: string | null
  agreed: boolean
  onAgree: () => void
  onRefuse: () => void
  /** L'aperçu de l'image (en attendant la fabrication en Canvas : son texte) */
  preview: ComponentChildren
  onDownload: () => void
  onEnd: () => void
}

export function Picture({ frozen, agreed, onAgree, onRefuse, preview, onDownload, onEnd }: Props) {
  return (
    <div class="screen screen-table-picture">
      <ClosedHeader where="L’image" />
      <main class="sheet" id="contenu" tabIndex={-1}>
        <h1 class="display is-medium" tabIndex={-1}>
          L’image de la table
        </h1>
        <p class="lede">Fabriquée sur ce téléphone. Ni prénom, ni candidat, ni nombre de personnes&nbsp;: seulement ce que la table pense des idées, en mots.</p>
        {frozen ? (
          <p class="notice" role="status">
            Pas d’image pendant le gel des jours de vote, {frozen}. La table, elle, reste ouverte.
          </p>
        ) : agreed ? (
          <>{preview}</>
        ) : (
          <div class="consent" role="group" aria-label="Accord de la table">
            <p>Toute la table est-elle d’accord pour que cette image sorte du téléphone&nbsp;? Elle dit ce que pense un groupe que vos proches peuvent reconnaître.</p>
            <div class="consent-actions">
              <button type="button" class="btn-primary" onClick={onAgree}>
                Oui, toute la table est d’accord
              </button>
              <button type="button" class="btn-text" onClick={onRefuse}>
                Non, pas d’image
              </button>
            </div>
          </div>
        )}
      </main>
      <ClosedFoot />
      <nav class="action-bar" aria-label="L’image de la table">
        <div class="action-bar-inner">
          <button type="button" class="btn-text" onClick={onEnd}>
            Terminer
          </button>
          <span />
          {!frozen && agreed ? (
            <button type="button" class="btn-primary" onClick={onDownload}>
              Télécharger le JPG
              <Icon name="download" />
            </button>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </div>
  )
}
