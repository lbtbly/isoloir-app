// Les entrées vers les vidéos, dans les pages du site : sous une question (la feuille, une fiche de « Les
// sujets »), en tête d'un thème, et l'accès au fil de toutes les vidéos. Elles n'apparaissent qu'une fois le
// catalogue chargé (load.ts), et seulement s'il y a une vidéo à montrer : rien n'est écrit en dur, tout vient des
// séries. Chacune ouvre le lecteur par-dessus la page (Host.tsx) et lui rend le focus à la fermeture.
// Ni approche ni candidat : comme les fiches, les vidéos racontent l'enjeu et les chiffres.

import { Glyph } from './Glyph'
import { openVideo, VIDEOS_PAGE } from './Host'
import { useVideoCatalog } from './load'
import { durationLabel } from './model'
import '../../styles/videos-page.css'

const plural = (n: number, word: string) => `${n}\u00a0${word}${n > 1 ? 's' : ''}`

/**
 * Les approfondissements qui éclairent une question, en lien discret (« En vidéo : … ») sous son contexte.
 * Rien si aucune vidéo ne la couvre.
 */
export function QuestionVideos({ questionId, class: c }: { questionId: string; class?: string }) {
  const catalog = useVideoCatalog()
  const refs = catalog?.questionVideos(questionId) ?? []
  if (!catalog || !refs.length) return null
  const items = refs.map(({ video }) => (
    <button
      key={video.id}
      type="button"
      class="video-link"
      data-video={video.id}
      aria-haspopup="dialog"
      onClick={e => openVideo(video.id, e.currentTarget)}
    >
      <Glyph name="play" />
      <span class="video-link-text">
        <span class="video-link-kicker">{'En vidéo\u00a0: '}</span>
        <span class="video-link-title">{video.title}</span>
        <span class="video-link-meta">{`\u00a0· environ ${durationLabel(catalog.videoDuration(video))}`}</span>
      </span>
    </button>
  ))
  const cls = ['video-links', c].filter(Boolean).join(' ')
  return items.length === 1 ? (
    <p class={cls}>{items[0]}</p>
  ) : (
    <ul class={cls}>
      {items.map(b => (
        <li key={b.key}>{b}</li>
      ))}
    </ul>
  )
}

/** En tête d'un thème : sa série, ouverte sur l'introduction. Rien si le thème n'a pas encore de vidéo. */
export function TopicVideo({ topicId, topic }: { topicId: string; topic: string }) {
  const catalog = useVideoCatalog()
  const series = catalog?.topicSeries(topicId)
  const intro = series?.videos[0]
  if (!catalog || !series || !intro) return null
  const deep = series.videos.length - 1
  return (
    <p class="topic-video">
      <button
        type="button"
        class="video-play"
        data-video={intro.id}
        aria-haspopup="dialog"
        aria-describedby={`video-meta-${topicId}`}
        onClick={e => openVideo(intro.id, e.currentTarget)}
      >
        <Glyph name="play" />
        <span>
          Regarder la vidéo
          <span class="sr-only">{`\u00a0: ${topic}`}</span>
        </span>
      </button>
      <span class="video-play-meta" id={`video-meta-${topicId}`}>
        {`L’essentiel en ${durationLabel(catalog.videoDuration(intro))}${deep > 0 ? `, puis ${plural(deep, 'approfondissement')}` : ''}`}
      </span>
    </p>
  )
}

/**
 * L'accès au fil de toutes les vidéos : le lecteur ouvert sur la première vidéo du fil (famille après famille),
 * et le lien vers la page « Les sujets en vidéo ». Rien tant qu'aucune série n'existe.
 */
export function VideoFeedEntry({
  groups,
  page = true,
  class: c,
}: {
  groups: readonly { topicIds: readonly string[] }[]
  /** Ajouter le lien vers la page « Les sujets en vidéo » */
  page?: boolean
  class?: string
}) {
  const catalog = useVideoCatalog()
  const feed = catalog?.feedSeries(groups) ?? []
  const first = feed[0]?.videos[0]
  if (!catalog || !first) return null
  const videos = feed.reduce((n, s) => n + s.videos.length, 0)
  return (
    <div class={['video-feed', c].filter(Boolean).join(' ')}>
      <p class="video-feed-row">
        <button
          type="button"
          class="video-play"
          data-video={first.id}
          aria-haspopup="dialog"
          onClick={e => openVideo(first.id, e.currentTarget)}
        >
          <Glyph name="play" />
          Regarder les vidéos
        </button>
        {page ? (
          <a class="btn-text video-feed-all" href={VIDEOS_PAGE}>
            Toutes les séries
          </a>
        ) : null}
      </p>
      <p class="video-play-meta">
        {page
          ? `${plural(feed.length, 'série')}, ${plural(videos, 'vidéo')}\u00a0: une série par thème, l’essentiel puis le détail, avec les chiffres des fiches et leurs sources.`
          : `${plural(feed.length, 'série')}, ${plural(videos, 'vidéo')}, à la suite, famille après famille.`}
      </p>
    </div>
  )
}
