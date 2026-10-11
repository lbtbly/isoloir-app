// Une « édition » des séries vidéo : les corrections propres à une élection, posées sur les séries communes
// (series/<thème>.ts, écrites pour la primaire « Choisir 2027 ») sans les modifier. L'archive de la primaire garde
// ses textes et ses voix ; l'élection qui déclare l'édition (ElectionPack.videoScope.edition) voit les séries
// corrigées (apply.ts, appliqué par scope.ts).
// Les voix : un passage dont le texte dit change (say ou spoken) prend un nouvel identifiant, celui d'origine
// suivi du suffixe de l'édition, pour avoir son propre fichier de voix ; les autres gardent le leur.

import type { VideoScript, VideoSegment, VideoSource } from '../types'

/** Correction d'un passage : les champs remplacés, ou « omit » pour le retirer */
export type SegmentPatch = Partial<Omit<VideoSegment, 'id'>> | 'omit'

export interface VideoPatch {
  /** Vidéo retirée de cette élection */
  omit?: true
  title?: string
  short?: string
  /** Questions de l'élection elle-même (pas celles des séries d'origine) : remplacent la traduction du périmètre */
  questionIds?: string[]
  sources?: VideoSource[]
  /** Passages corrigés ou retirés, par identifiant d'origine */
  segments?: Record<string, SegmentPatch>
  /** Passages ajoutés, chacun après un passage d'origine (null : en tête) ; leur identifiant finit par le suffixe */
  insert?: { after: string | null; segment: VideoSegment }[]
}

export interface SeriesPatch {
  /** Vidéos corrigées ou retirées, par identifiant */
  videos?: Record<string, VideoPatch>
}

export interface Edition {
  id: string
  /** Suffixe des passages au texte dit changé (« -p27 ») : nomme leurs fichiers de voix */
  suffix: string
  /** Corrections par thème de série (series/<thème>.ts) */
  patches: Readonly<Record<string, SeriesPatch>>
}

/** Une vidéo telle que la donne une édition : ses questions sont déjà celles de l'élection quand native est vrai */
export type EditedScript = VideoScript & { nativeQuestionIds?: true }
