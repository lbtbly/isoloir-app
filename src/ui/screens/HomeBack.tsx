// L'accueil de qui a déjà son dépouillement (demande du propriétaire du 14/10/2026 : « si un dépouillement existe, la
// page d'accueil doit être différente et adaptée »), questionnaire rapide terminé et au moins un avis compté (Home.tsx).
// En tête, à la place du film qui explique l'outil à qui ne le connaît pas : les questions à revoir, son affiche (la
// même qu'au dépouillement, components/Leader.tsx), l'entrée de « Mon profil politique » (le cadre de l'accueil vierge,
// components/ProfileEntry.tsx), ce qui est nouveau depuis ses réponses, puis les suites en panneaux, dans l'ordre de
// « Et maintenant ». Le film et les garanties restent plus bas, pour qui veut les revoir.

import type { ComponentChildren } from 'preact'
import { frozenAt } from '../../core/freeze'
import { PROFILE_TITLE } from '../../core/resultsCopy'
import type { Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { Icon } from '../components/Icon'
import { Leader } from '../components/Leader'
import { formatDate, formatMoment } from '../format'
import { link } from '../nav'
import { hasTable } from '../table/load'
import { InstallLink } from '../install/InstallLink'
import '../../styles/home-back.css'

type Entry = { date: string; text: string }

/** Le jour, à Paris, d'un instant ISO (en UTC) : celui des dates du journal des données */
const PARIS_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
export const parisDay = (iso: string): string => PARIS_DAY.format(new Date(iso))

/**
 * Ce qui est nouveau depuis ses réponses : les jours du journal des données postérieurs au jour (à Paris) où le
 * questionnaire rapide a été terminé, les plus récents d'abord, une entrée par jour (à date égale, la première écrite,
 * celle qui dit l'effet sur le classement, comme en tête du dépouillement ; le détail reste dans la Méthode). Sans date
 * de réponses, rien.
 */
export function newsSince(changelog: readonly Entry[], since: string | null, max = 3): Entry[] {
  if (!since || Number.isNaN(Date.parse(since))) return []
  const day = parisDay(since)
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
  /** Les questions du questionnaire rapide, toutes vues */
  essentialCount: number
  /** « Mon profil politique » est prêt (même règle que la page et le dépouillement) */
  profileReady: boolean
  /**
   * Son cadre, la page prête : sous l'affiche au téléphone ; en grand écran, sur toute la largeur sous le héros, ou dans
   * la colonne de l'affiche quand la carte des questions à revoir occupe celle de l'introduction
   */
  profile?: ComponentChildren
}

export function WelcomeBack({ pack, state, results, stale, essentialCount, profileReady, profile }: Props) {
  const { election, candidates, bank } = pack
  const topics = new Map(bank.topics.map(t => [t.id, t]))
  const byId = new Map(candidates.map(c => [c.id, c]))
  const doneAt = state.essentialDoneAt
  const news = newsSince(election.changelog, doneAt)
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
            desc: 'De 3 à 12 personnes, un seul téléphone\u00a0: chacun vote en secret, puis vous lisez ensemble ce qui vous réunit.',
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
      {/* Des questions à revoir : leur carte allonge l'introduction, l'affiche garde sa colonne (home-back.css) */}
      <div class={stale.length ? 'back-hero has-changed' : 'back-hero'}>
        <div class="back-intro">
          <h1 class="display is-medium" tabIndex={-1}>
            Votre dépouillement vous attend
          </h1>
          <p class="lede">
            {/* La date est celle où le questionnaire rapide a été terminé (essentialDoneAt) : le dépouillement, lui, suit
                toutes les réponses d'aujourd'hui, approfondies et revues comprises */}
            {doneAt ? (
              <>
                Vous avez répondu aux {essentialCount} questions du questionnaire rapide le{' '}
                <time dateTime={doneAt}>{formatMoment(doneAt)}</time>.{' '}
              </>
            ) : null}
            Votre dépouillement est calculé sur cet appareil et ne le quitte pas.
          </p>
          <ChangedQuestions questions={stale} topics={topics} />
        </div>

        <div class="back-side">
          <Leader ranking={results.ranking} results={results} byId={byId} titleId="back-leader-title" class="back-leader" still>
            <a class="back-open" href={link('/resultats')}>
              Tout mon dépouillement
              <Icon name="arrow-right" />
            </a>
          </Leader>
          {profile}
          {news.length && doneAt ? (
            <section class="back-news" aria-labelledby="back-news-title">
              {/* Sans date : celle du chapeau est à l'heure de l'appareil, le tri des jours du journal à celle de Paris */}
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
        <InstallLink />
      </section>
    </div>
  )
}
