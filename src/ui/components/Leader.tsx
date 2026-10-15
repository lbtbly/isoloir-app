// L'affiche du plus proche : portrait, nom, pourcentage dans son palier, bâtons, puis l'égalité et les lignes rouges dites
// en clair dessous. La même au dépouillement et sur l'accueil de retour (HomeBack), pour que les deux disent la même
// chose ; sur l'accueil, les bâtons sont posés sans tracé (ils ne viennent d'aucun geste) et un lien mène au dépouillement.

import type { ComponentChildren } from 'preact'
import { affinityBand } from '../../core/affinity'
import { closeNote, crossingNote, leaderLead } from '../../core/resultsCopy'
import { displayScore, strokesFor, type CandidateResult, type Results } from '../../core/score'
import type { Candidate } from '../../core/types'
import { link } from '../nav'
import { Icon } from './Icon'
import { Portrait } from './Portrait'
import { Tally } from './Tally'

interface Props {
  ranking: CandidateResult[]
  results: Results
  byId: Map<string, Candidate>
  /** id du titre (deux affiches ne sont jamais sur la même page, mais chaque page garde le sien) */
  titleId?: string
  class?: string
  /** Bâtons posés d'un coup, sans tracé : hors du dépouillement, aucun geste ne vient de les compter */
  still?: boolean
  children?: ComponentChildren
}

export function Leader({ ranking, results, byId, titleId = 'leader-title', class: c, still = false, children }: Props) {
  const [first, second] = ranking
  if (!first || first.score === null) return null
  const cand = byId.get(first.candidateId)!
  const b = affinityBand(first.score)
  // Hors classement et non classés compris : la phrase compte tous les candidats qui franchissent une ligne rouge,
  // autant que de croix sur la page (non classés : décision du propriétaire du 14 octobre 2026)
  const crossing = [...ranking, ...results.unranked, ...results.excludedResults].filter(r => !r.compatible).length
  // Des candidats hors classement ou non classés : l'accroche dit « parmi les candidats classés » (décision du
  // propriétaire du 2026-10-15)
  const someOff = results.unranked.length > 0 || results.excluded.length > 0
  return (
    <section class={c ? `leader on-copy ${c}` : 'leader on-copy'} aria-labelledby={titleId}>
      <Portrait candidate={cand} size="id" decorative />
      <div class="leader-body">
        <h2 id={titleId} class="leader-title">
          <span class="leader-lead">{leaderLead(results.allIncompatible, someOff)}</span>
          <a class="leader-name" href={link(`/candidat/${cand.id}`)}>
            {cand.name}
          </a>
        </h2>
        <p class="leader-score">
          <span class={`leader-pct${b ? ` aff-${b.key}` : ''}`}>
            {displayScore(first.score)}
            <span class="pv-unit">%</span>
          </span>
          {b ? <span class={`leader-band aff-${b.key}`}>{b.label}</span> : null}
        </p>
        <Tally count={strokesFor(first.score)} maxGroups={Infinity} drawAll={!still} still={still} delay={300} label="" />
        {results.close && second ? <p class="leader-note">{closeNote(byId.get(second.candidateId)?.name ?? '')}</p> : null}
        {crossing > 0 && !results.allIncompatible ? (
          <p class="leader-note">
            <Icon name="cross" class="flag-mark" />
            {crossingNote(crossing)}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  )
}
