// Les séries vidéo telles que les montre une élection. Les séries (series/<thème>.ts) ont été écrites pour la
// primaire « Choisir 2027 » : leurs thèmes et leurs questions portent les identifiants de sa banque. Une autre
// élection qui les reprend donne son périmètre vidéo (ElectionPack.videoScope, écrit par tools/build-pack.mjs
// depuis research/<élection>/reuse.json) : sous quel thème d'ici montrer chaque série, et à quelle question
// d'ici correspond chaque question d'origine. Sans périmètre, les identifiants restent tels quels (la primaire).
// scopeSeries en tire les séries de l'élection :
// - une série dont le thème n'est pas dans le périmètre, ou pas dans la banque, n'est pas montrée (la série
//   « Alliances », propre à la primaire, pour la présidentielle) ; une seule série par thème, la première ;
// - le thème, la famille et le nom de chaque série sont ceux de l'élection (sa banque, ses familles) ;
// - les questions de chaque vidéo sont traduites ; une question sans équivalent dans la banque est retirée, et
//   la vidéo n'apparaît plus sous elle ;
// - « Voir la fiche » (fiche) mène à la première question traduite qui a sa fiche, sinon à la première fiche
//   du thème ;
// - les séries sont rangées famille après famille, dans l'ordre des thèmes de l'élection.
// Les identifiants des vidéos et des passages ne changent jamais : ils nomment les fichiers de la voix.
// Fonction pure, sans données : le catalogue (catalog.ts) l'applique à l'élection affichée.

import type { ElectionPack } from '../../core/types'
import type { VideoScript, VideoSeries } from './types'

/** Périmètre vidéo d'une élection : thème ou question des séries → thème ou question de l'élection */
export type VideoScope = NonNullable<ElectionPack['videoScope']>

/** Ce que scopeSeries lit de la banque de l'élection */
export interface ScopeBank {
  topics: readonly { id: string; label: string }[]
  questions: readonly { id: string; topicId: string; explainer?: unknown }[]
}

/** Les familles de thèmes de l'élection, dans l'ordre éditorial */
export type ScopeGroups = readonly { id: string; topicIds: readonly string[] }[]

export function scopeSeries(
  all: readonly VideoSeries[],
  scope: VideoScope | undefined,
  groups: ScopeGroups,
  bank: ScopeBank,
): VideoSeries[] {
  const topics = new Map(bank.topics.map(t => [t.id, t]))
  const questions = new Map(bank.questions.map(q => [q.id, q]))
  const hasFiche = (id: string) => !!questions.get(id)?.explainer
  // Rang de chaque thème : celui des familles, puis celui de la banque pour un thème hors des familles
  const order = [...groups.flatMap(g => g.topicIds), ...bank.topics.map(t => t.id)]
  const rank = (topicId: string) => order.indexOf(topicId)
  const taken = new Set<string>()
  const out: VideoSeries[] = []

  for (const series of all) {
    const topicId = scope ? scope.topics[series.topicId] : series.topicId
    const topic = topicId === undefined ? undefined : topics.get(topicId)
    if (!topic || taken.has(topic.id)) continue
    taken.add(topic.id)
    // La fiche du thème, quand aucune question de la vidéo n'en a : sa première, dans l'ordre de la banque
    const topicFiche = bank.questions.find(q => q.topicId === topic.id && q.explainer)?.id
    const videos = series.videos.map((video): VideoScript => {
      const translated = video.questionIds
        .map(id => (scope ? scope.questions[id] : id))
        .filter((id): id is string => id !== undefined && questions.has(id))
      const questionIds = [...new Set(translated)]
      const fiche = questionIds.find(hasFiche) ?? topicFiche ?? questionIds[0]
      return { ...video, questionIds, ...(fiche ? { fiche } : {}) }
    })
    out.push({
      ...series,
      topicId: topic.id,
      familyId: groups.find(g => g.topicIds.includes(topic.id))?.id ?? topic.id,
      label: topic.label,
      videos,
    })
  }
  return out.sort((a, b) => rank(a.topicId) - rank(b.topicId))
}
