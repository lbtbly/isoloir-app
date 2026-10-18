// L'accueil de qui a déjà son dépouillement (demande du propriétaire du 14/10/2026 : « si un dépouillement existe, la
// page d'accueil doit être différente et adaptée »), questionnaire rapide terminé et au moins un avis compté (Home.tsx).
// En tête, à la place du film qui explique l'outil à qui ne le connaît pas : les questions à revoir, son affiche (la
// même qu'au dépouillement, components/Leader.tsx), l'entrée de « Mon profil politique » (le cadre de l'accueil vierge,
// components/ProfileEntry.tsx), ce qui est nouveau depuis ses réponses (les titres du journal des données, chacun vers
// son entrée), puis les suites en panneaux, dans l'ordre de « Et maintenant ». Le film et les garanties restent plus
// bas, pour qui veut les revoir.

import type { ComponentChildren } from 'preact'
import { frozenAt } from '../../core/freeze'
import { PROFILE_TITLE } from '../../core/resultsCopy'
import type { Results } from '../../core/score'
import type { SessionState } from '../../core/storage'
import type { ChangelogEntry, ElectionPack, Question } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { ChangedQuestions } from '../components/ChangedQuestions'
import { Icon } from '../components/Icon'
import { BUDGET_PANEL, budgetShown } from '../budget/shown'
import { Leader } from '../components/Leader'
import { formatDate, formatMoment } from '../format'
import { link } from '../nav'
import { presetOnClick } from '../journalPreset'
import { hasTable } from '../table/load'
import { InstallLink } from '../install/InstallLink'
import '../../styles/home-back.css'

/** Le jour, à Paris, d'un instant ISO (en UTC) : celui des dates du journal des données */
const PARIS_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
export const parisDay = (iso: string): string => PARIS_DAY.format(new Date(iso))

/** « 12 octobre », sans l'année : le jour des réponses, dans l'année du journal */
const dayMonth = (day: string): string => formatDate(day).replace(/\u00a0\d{4}$/, '')

/** La première phrase d'une entrée du journal : le titre d'une entrée qui n'en a pas */
export const firstSentence = (text: string): string => text.match(/^.+?[.!?](?=\s+\p{Lu}|$)/u)?.[0] ?? text

/**
 * Ce qui est nouveau depuis ses réponses : les entrées du journal des données publiées après le jour (à Paris) où le
 * questionnaire rapide a été terminé ; d'abord ce qui peut changer le classement : ces entrées seules s'il y en a, sinon
 * les autres ; les plus récentes d'abord (puis le numéro, l'ordre de publication), « max » au plus, et le nombre de
 * toutes en tout, pour le lien vers le journal. Sans date de réponses, rien.
 */
export function newsSince(changelog: readonly ChangelogEntry[], since: string | null, max = 3): { shown: ChangelogEntry[]; total: number } {
  if (!since || Number.isNaN(Date.parse(since))) return { shown: [], total: 0 }
  const day = parisDay(since)
  const after = changelog.filter(e => e.date > day)
  const moving = after.filter(e => e.effect === 'peut-changer')
  const shown = [...(moving.length ? moving : after)].sort((a, b) => b.date.localeCompare(a.date) || (b.n ?? 0) - (a.n ?? 0)).slice(0, max)
  return { shown, total: after.length }
}

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
  // « Faire les comptes » en dernier : à l'encre si sa place tombe sur le bleu (même règle que les autres panneaux)
  if (budgetShown()) tiles.push({ href: link('/comptes'), icon: 'comptes', title: 'Faire les comptes', desc: BUDGET_PANEL, ink: tiles.length % 4 === 1 })

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
          {news.total && doneAt ? (
            <section class="back-news" aria-labelledby="back-news-title">
              {/* Sans date : celle du chapeau est à l'heure de l'appareil, le tri des jours du journal à celle de Paris */}
              <h2 id="back-news-title" class="back-news-title">
                Nouveau depuis vos réponses
              </h2>
              {/* Les titres du journal sont rédigés par IA : la mention avant eux, la première fois qu'on peut les lire */}
              <AiLabel kind="journal" more="lien" class="back-news-ai" />
              <ol class="back-news-list">
                {news.shown.map(e => (
                  <li key={`${e.date}:${e.n ?? e.text}`}>
                    <time dateTime={e.date}>{formatDate(e.date)}</time>
                    <span class="back-news-item">
                      <a href={link(e.n ? `/journal/${e.n}` : '/journal')}>{e.title ?? firstSentence(e.text)}</a>
                      {e.effect === 'peut-changer' || e.effect === 'sans-effet' ? (
                        <span class="back-news-effect">{`Classement\u00a0: ${e.effect === 'peut-changer' ? 'peut changer' : 'sans effet'}`}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ol>
              {/* Le journal réglé sur « Après vos réponses », passé en mémoire (clic simple), jamais dans l'adresse. Le jour
                  des réponses n'y est pas compté (les entrées n'ont qu'une date) : « après le 12 octobre », et non
                  « depuis vos réponses », qui laisserait croire qu'aucune entrée de ce jour-là n'a suivi */}
              <a class="g-link" href={link('/journal')} onClick={presetOnClick('reponses')}>
                {`Tout ce qui a changé après le ${dayMonth(parisDay(doneAt))} (${news.total}\u00a0entrée${news.total > 1 ? 's' : ''})`}
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
