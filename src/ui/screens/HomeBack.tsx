// L'accueil de qui a déjà son dépouillement (demande du propriétaire du 14/10/2026 : « si un dépouillement existe, la
// page d'accueil doit être différente et adaptée »). En tête, à la place du film qui explique l'outil à qui ne le
// connaît pas : son affiche (le plus proche, son pourcentage, ses bâtons), les questions à revoir, ce qui est nouveau
// depuis ses réponses, puis les suites en panneaux, dans l'ordre de « Et maintenant ». Le film et les garanties restent
// plus bas, pour qui veut les revoir.

import type { ComponentChildren } from 'preact'
import { affinityBand } from '../../core/affinity'
import { frozenAt } from '../../core/freeze'
import { closeNote, leaderLead, PROFILE_TITLE } from '../../core/resultsCopy'
import { displayScore, strokesFor, type Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { Icon } from '../components/Icon'
import { Portrait } from '../components/Portrait'
import { Tally } from '../components/Tally'
import { formatDate, formatMoment } from '../format'
import { link } from '../nav'
import { hasTable } from '../table/load'
import '../../styles/home-back.css'

type Entry = { date: string; text: string }

/**
 * Ce qui est nouveau depuis ses réponses : les jours du journal des données postérieurs à leur date, les plus récents
 * d'abord, une entrée par jour (à date égale, la première écrite, celle qui dit l'effet sur le classement, comme en
 * tête du dépouillement ; le détail reste dans la Méthode). Sans date de réponses, rien.
 */
export function newsSince(changelog: readonly Entry[], since: string | null, max = 3): Entry[] {
  if (!since) return []
  const day = since.slice(0, 10)
  const days = new Set<string>()
  return changelog
    .filter(e => e.date > day && !days.has(e.date) && !!days.add(e.date))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, max)
}

/** La première phrase d'une entrée du journal : la carte reste courte */
export const firstSentence = (text: string): string => text.match(/^.+?[.!?](?=\s+\p{Lu}|$)/u)?.[0] ?? text

interface Props {
  pack: ElectionPack
  state: SessionState
  results: Results
  stale: Question[]
  /** « Mon profil politique » est prêt (même règle que la page et le dépouillement) */
  profileReady: boolean
  /** Son bandeau, la page prête : sous l'affiche, comme au dépouillement */
  profile?: ComponentChildren
}

export function WelcomeBack({ pack, state, results, stale, profileReady, profile }: Props) {
  const { election, candidates, bank } = pack
  const topics = new Map(bank.topics.map(t => [t.id, t]))
  const byId = new Map(candidates.map(c => [c.id, c]))
  const [first, second] = results.ranking
  const leader = first && first.score !== null ? byId.get(first.candidateId) : undefined
  const band = first ? affinityBand(first.score) : null
  const news = newsSince(election.changelog, state.essentialDoneAt)
  const table = hasTable(election)

  // Les panneaux de « Et maintenant », dans le même ordre et sur les mêmes papiers que le dépouillement
  const tiles = [
    { href: link('/proximite'), icon: 'list', title: 'Qui porte quoi', desc: 'Vos avis face aux positions des candidats, sources à l’appui.' },
    ...(profileReady ? [{ href: link('/profil'), icon: 'axis', title: PROFILE_TITLE, desc: 'Vos réponses, thème par thème, au regard de la grille des nuances.', ink: true }] : []),
    ...(table
      ? [
          {
            href: link('/a-table'),
            icon: 'table',
            title: 'À table',
            desc: 'De 3 à 12 personnes, un seul téléphone : chacun vote en secret, puis vous lisez ensemble ce qui vous réunit.',
            ink: !profileReady,
          },
        ]
      : []),
    {
      href: link('/partager'),
      icon: 'share',
      title: 'Partager l’image',
      desc: frozenAt(election) ? 'Pas d’image pendant le gel des jours de vote.' : 'Votre affiche en JPG, fabriquée sur cet appareil.',
    },
    { href: link('/approfondir'), icon: 'deepen', title: 'Approfondir', desc: 'D’autres questions, par thème, pour affiner votre dépouillement.' },
  ]

  return (
    <div class="welcome-back">
      <div class="back-hero">
        <div class="back-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            Votre dépouillement vous attend
          </h1>
          <p class="lede">
            {state.essentialDoneAt ? (
              <>
                Calculé sur vos réponses du <time dateTime={state.essentialDoneAt}>{formatMoment(state.essentialDoneAt)}</time>
              </>
            ) : (
              'Calculé sur vos réponses'
            )}
            , sur cet appareil : il ne le quitte pas.
          </p>
          <ChangedQuestions questions={stale} topics={topics} class="back-changed" />
        </div>

        <div class="back-side">
          {leader && first ? (
            <section class="leader on-copy back-leader" aria-labelledby="back-leader-title">
              <Portrait candidate={leader} size="id" decorative />
              <div class="leader-body">
                <h2 id="back-leader-title" class="leader-title">
                  <span class="leader-lead">{leaderLead(results.allIncompatible)}</span>
                  <span class="leader-name">{leader.name}</span>
                </h2>
                <p class="leader-score">
                  <span class={`leader-pct${band ? ` aff-${band.key}` : ''}`}>
                    {displayScore(first.score)}
                    <span class="pv-unit">%</span>
                  </span>
                  {band ? <span class={`leader-band aff-${band.key}`}>{band.label}</span> : null}
                </p>
                <Tally count={strokesFor(first.score)} maxGroups={Infinity} label="" />
                {results.close && second ? <p class="leader-note">{closeNote(byId.get(second.candidateId)?.name ?? '')}</p> : null}
                <a class="back-open" href={link('/resultats')}>
                  Tout mon dépouillement
                  <Icon name="arrow-right" />
                </a>
              </div>
            </section>
          ) : null}
          {profile}
          {news.length ? (
            <section class="back-news" aria-labelledby="back-news-title">
              <h2 id="back-news-title" class="back-news-title">
                Nouveau depuis vos réponses
              </h2>
              <ol class="back-news-list">
                {news.map(e => (
                  <li key={e.date}>
                    <time dateTime={e.date}>{formatDate(e.date)}</time>
                    <span>{firstSentence(e.text)}</span>
                  </li>
                ))}
              </ol>
              <a class="g-link" href={link('/methode/journal')}>
                Tout le journal des données
              </a>
            </section>
          ) : null}
        </div>
      </div>

      <section class="next-block back-next" aria-labelledby="back-next-title">
        <h2 id="back-next-title" class="section-title">
          Et maintenant
        </h2>
        <ul class="next-panels">
          {tiles.map((t, i) => (
            <li key={t.href} class={i === 0 ? 'on-copy' : 'ink' in t && t.ink ? 'is-ink' : undefined}>
              <a href={t.href} class="next-panel">
                <Icon name={t.icon} class="next-icon" />
                <span class="next-title">{t.title}</span>
                <span class="next-desc">{t.desc}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
