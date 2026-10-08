// « Les sujets en vidéo » (#/videos) : toutes les séries, rangées par famille de thèmes, chacune avec son
// introduction puis ses approfondissements ; chaque vidéo ouvre le lecteur par-dessus la page (Host.tsx), et
// « Regarder les vidéos » ouvre le fil depuis le début. Les séries viennent du catalogue (VIDEO_SERIES), rien n'est
// écrit en dur : un thème qui reçoit sa série apparaît ici de lui-même.
// #/videos/<vidéo> ouvre la page avec le lecteur sur cette vidéo ; l'ancienne adresse #/essai-videos y mène.
// Ni approche ni candidat : comme les fiches de « Les sujets », les vidéos racontent l'enjeu et les chiffres.

import type { SessionState } from '../../core/storage'
import type { ElectionPack, Question } from '../../core/types'
import { AiLabel } from '../components/AiLabel'
import { FormHeader } from '../components/FormHeader'
import { Icon } from '../components/Icon'
import { SiteFooter } from '../components/SiteFooter'
import { Glyph } from '../videos/Glyph'
import { openVideo } from '../videos/Host'
import { VideoFeedEntry } from '../videos/Links'
import { useVideoCatalog } from '../videos/load'
import { durationLabel, partOf, placeOf } from '../videos/model'
import { link } from '../nav'
import '../../styles/videos-page.css'

const plural = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`

interface Props {
  pack: ElectionPack
  state: SessionState
  /** Questions du questionnaire rapide, dans l'ordre de la personne : pour l'appel « Commencer / Reprendre » */
  essential: Question[]
}

export function Videos({ pack, state, essential }: Props) {
  const { bank } = pack
  const groups = pack.topicGroups ?? bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))
  const catalog = useVideoCatalog()
  const feed = catalog?.feedSeries(groups) ?? []
  const families = groups
    .map(group => ({ group, series: feed.filter(s => group.topicIds.includes(s.topicId)) }))
    .filter(f => f.series.length > 0)
  // Thèmes sans série pour l'instant : on le dit, et leurs fiches écrites restent à un lien
  const without = groups
    .flatMap(g => g.topicIds)
    .filter(id => !feed.some(s => s.topicId === id))
    .map(id => bank.topics.find(t => t.id === id)?.label)
    .filter((l): l is string => !!l)

  // Appel principal, comme sur « Les sujets » : commencer, reprendre, ou revoir son dépouillement
  const seen = essential.filter(q => state.answers[q.id]).length
  const firstOpen = essential.findIndex(q => !state.answers[q.id])
  const done = essential.length > 0 && seen === essential.length
  const start = done
    ? { href: link('/resultats'), label: 'Voir mon dépouillement' }
    : { href: link(`/feuille/${(firstOpen < 0 ? 0 : firstOpen) + 1}`), label: seen ? 'Reprendre la feuille' : 'Commencer la feuille' }

  let place = 0
  return (
    <div class="screen screen-wide screen-videos">
      <FormHeader title="Les sujets en vidéo" />
      <main class="sheet wide-sheet" id="contenu" tabIndex={-1}>
        <div class="wide-hero">
          <h1 class="display" tabIndex={-1}>
            Les sujets en vidéo
          </h1>
          <div>
            <p class="lede">
              {'Chaque thème a sa série\u00a0: une introduction pose l’essentiel et les questions du thème, puis une vidéo par levier entre dans le détail, avec les chiffres des fiches et leurs sources.'}
            </p>
            <p class="small">
              {'Ni les approches proposées ni les candidats n’y figurent. Une voix de synthèse les lit, sous-titres affichés\u00a0; le son se coupe dans le lecteur. Sans voix enregistrée, ou hors ligne, elles se lisent en sous-titres seuls.'}
            </p>
            {/* Dès l'arrivée, avant la première vidéo : l'explication ici, la mention seule pendant la lecture */}
            <AiLabel kind="videos" voice={!!catalog?.anyVoice()} class="videos-ai" />
          </div>
        </div>

        <div class="videos-list" aria-busy={catalog ? undefined : 'true'}>
          <VideoFeedEntry groups={groups} page={false} class="videos-feed" />

          {families.map(f => (
            <section key={f.group.id} class="videos-family" aria-labelledby={`videos-${f.group.id}`}>
              <h2 id={`videos-${f.group.id}`} class="section-title">
                {f.group.label}
              </h2>
              <ol class="vl-series">
                {f.series.map(s => {
                  const k = place++
                  const seconds = catalog ? catalog.seriesDuration(s) : 0
                  return (
                    <li key={s.topicId} class={`vl-serie vl-tint-${k % 4}`}>
                      <h3 class="vl-name">{s.label}</h3>
                      <p class="vl-meta">{`${plural(s.videos.length, 'vidéo')} · environ ${durationLabel(seconds)}`}</p>
                      <ol class="vl-open">
                        {s.videos.map(v => {
                          const { part } = partOf(s, v)
                          return (
                            <li key={v.id}>
                              <button
                                type="button"
                                class="vl-btn"
                                data-video={v.id}
                                aria-haspopup="dialog"
                                onClick={e => openVideo(v.id, e.currentTarget)}
                              >
                                <span class={`vl-btn-n${part ? '' : ' is-intro'}`} aria-hidden="true">
                                  {part || 'Intro'}
                                </span>
                                <span class="vl-btn-text">
                                  <span class="vl-btn-label">{placeOf(s, v)}</span>
                                  <span class="vl-btn-meta">
                                    {`${v.title} · environ ${durationLabel(catalog ? catalog.videoDuration(v) : 0)}`}
                                  </span>
                                </span>
                                <Glyph name="play" />
                              </button>
                            </li>
                          )
                        })}
                      </ol>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}

          {catalog && without.length ? (
            <p class="small vl-foot">
              {without.length > 5
                ? `${without.length}\u00a0thèmes n’ont pas encore de vidéo. Leurs fiches écrites, avec les chiffres et les sources, sont dans `
                : `Pas encore de vidéo pour ${without.length > 1 ? 'ces thèmes' : 'ce thème'}\u00a0: ${without.join(', ')}. ${without.length > 1 ? 'Leurs fiches écrites' : 'Ses fiches écrites'}, avec les chiffres et les sources, sont dans `}
              <a href={link('/sujets')}>Les sujets</a>.
            </p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
      <nav class="action-bar" aria-label="Suite">
        <div class="action-bar-inner">
          <a class="btn-text" href={link('/')}>
            <Icon name="arrow-left" />
            <span class="btn-label">Accueil</span>
          </a>
          <span />
          <a class="btn-primary" href={start.href}>
            {start.label}
            <Icon name="arrow-right" />
          </a>
        </div>
      </nav>
    </div>
  )
}
