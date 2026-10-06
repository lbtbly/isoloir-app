// Vidéos « Les sujets » : le modèle de données (séries, vidéos, passages) et le contrat de la piste graphique.
//
// Un thème de la banque de questions forme une SÉRIE : une vidéo d'introduction (l'essentiel du thème, puis
// les questions qu'il pose), suivie d'un approfondissement par levier ou sous-sujet. Chaque vidéo raconte
// l'enjeu et les chiffres, jamais les approches proposées, ni un candidat, ni un parti.
// Une vidéo n'est pas un fichier vidéo : c'est un script (series.ts), dessiné en direct par la piste
// graphique (pistes/C.tsx) et dit par une voix de synthèse enregistrée d'avance, un fichier audio par passage
// (audio.ts : public/videos/audio/aigue/<vidéo>/<passage>.m4a). Tant qu'un fichier manque, ou le son coupé, le
// passage se lit en sous-titres seuls, au rythme estimé.
//
// Le lecteur (Player.tsx, Video.tsx, narration.ts, audio.ts) s'occupe de tout ce qui n'est pas l'image : le
// fil à la TikTok, la chronologie, la voix, les sous-titres, la pause, le clavier, le mouvement réduit, le
// sommaire de la série, les sources. La piste ne dessine que la scène, passage par passage.

import type { ComponentChildren, JSX } from 'preact'

/* ——— Les données ——— */

/** Une série : toutes les vidéos d'un thème, l'introduction d'abord */
export interface VideoSeries {
  /** Thème de la banque (bank.topics) : « retraites » */
  topicId: string
  /** Famille du thème (groups.ts) : la catégorie de la série dans le fil */
  familyId: string
  /** Nom de la série, celui du thème : « Retraites » */
  label: string
  /** L'introduction (kind 'intro') puis les approfondissements (kind 'deep'), dans l'ordre de lecture */
  videos: VideoScript[]
}

/** Introduction d'une série, ou approfondissement d'un de ses leviers */
export type VideoKind = 'intro' | 'deep'

export interface VideoScript {
  /** Identifiant stable, unique entre toutes les séries : « retraites-intro », « retraites-age ». C'est aussi le
   *  dossier de ses fichiers audio. */
  id: string
  kind: VideoKind
  /** Questions de la banque dont la vidéo éclaire l'enjeu ; la première mène à « Voir la fiche » */
  questionIds: string[]
  /** Titre, 45 signes au plus : « À quel âge partir à la retraite ? » */
  title: string
  /** Nom court dans la série, pour le repère et le sommaire : « Âge de départ » (« Introduction » pour l'intro) */
  short: string
  /** Adresse au spectateur */
  register: 'vous' | 'tu'
  /** 6 à 12 passages, de 30 secondes à 1 minute 30 environ à l'oral */
  segments: VideoSegment[]
  /** Les sources des chiffres cités */
  sources: VideoSource[]
}

export interface VideoSegment {
  /** Identifiant stable, unique entre toutes les vidéos : « retraites-age-04 ». C'est aussi le nom de son
   *  fichier audio. Le changer, c'est perdre la voix enregistrée du passage. */
  id: string
  /** Ce qui est dit : une à trois phrases courtes, langue orale simple. C'est aussi le sous-titre.
   *  Typographie déjà composée (insécables avant « : ; % », fines avant « ? ! », nombre et unité liés). */
  say: string
  /** Facultatif : ce que prononce la voix de synthèse, quand cela diffère du « say » (qui reste le sous-titre).
   *  Forme orale exacte, comme la dirait un présentateur : nombres, décimales, pourcentages, montants, dates,
   *  ordinaux et sigles épelés en toutes lettres (« 14,1 % du PIB » → « quatorze virgule un pour cent du
   *  P.I.B. »), ponctuation et apostrophes du « say » gardées pour l'intonation, espaces simples seulement.
   *  Même sens, mêmes chiffres, même information que le « say ». Absent : la voix dit le « say » tel quel, ses
   *  espaces insécables et fines lues comme des espaces simples. */
  spoken?: string
  /** Ce que montre l'image pendant ce passage */
  visual: 'hook' | 'figure' | 'compare' | 'timeline' | 'point' | 'question' | 'outro'
  /** Le dessin voulu, en une phrase : la consigne de la piste graphique, jamais montrée telle quelle */
  draw: string
  /** 1 à 3 mots ou nombres du « say », écrits exactement comme dans le « say », à mettre en valeur à l'écran */
  emphasis?: string[]
  /** Quand le passage montre un chiffre d'une fiche : sa valeur EXACTE, et sa source (index dans « sources ») */
  figure?: { value: string; label: string; date?: string; sourceIndex: number }
  /** Facultatif : un FigureChart (src/core/types) pour ce chiffre, vérifié par chartOf() de model.ts */
  chart?: unknown
  /** Ce que le dessin écrit en plus du « say » et du chiffre clé (graduations, légendes), écrit d'après la
   *  planche réelle, à la française et sans cadrage : la transcription du panneau Sources le reprend */
  alt?: string
}

export interface VideoSource {
  title: string
  url: string
  publisher?: string
  date?: string
}

/** Les sortes d'image d'un passage */
export type SegmentVisual = VideoSegment['visual']

/**
 * Où la vidéo est regardée. « site » : dans Isoloir (aucun appel à donner son avis en fin de vidéo, la
 * personne y est déjà). « share » : vue hors du site (lien partagé, intégration ; pas encore branché), la fin
 * invite à donner son avis dans Isoloir.
 */
export type VideoContext = 'site' | 'share'

/* ——— Le contrat de la piste ———

   La piste est la manière de dessiner les vidéos. Il n'en reste qu'une, C « Explication dessinée »
   (pistes/C.tsx, styles src/styles/videos-c.css préfixés .vc-) ; pistes/index.ts l'expose au lecteur
   (PISTE). Changer de dessin, c'est changer ce seul export.

   Ce que le lecteur garantit à la piste :
   - La scène est la zone entre l'en-tête de la vidéo (barres de progression, repère de série, titre) et les
     sous-titres. Les sous-titres et les commandes ne la recouvrent jamais : la piste n'a pas à leur laisser de
     place. La scène est un conteneur de taille (container: vp-stage / size) : les unités cqi et cqb s'y
     rapportent. Format : environ 9:16 moins les bandeaux, de 300 × 360 px (petit téléphone) à 520 × 560 px.
   - Chaque passage est remonté (nouvelle clé) quand il commence : les animations CSS repartent d'elles-mêmes.
   - Pause, attente de la voix et vidéo hors champ : le lecteur fige toutes les animations CSS de la scène
     (.vp-stage.is-paused * { animation-play-state: paused }). « playing » le dit aussi aux animations en JS.
   - Mouvement réduit : « still » vaut true. La piste montre l'état final du passage, sans aucune animation ni
     transition. Par sécurité, le lecteur coupe aussi toute animation CSS de la scène (.vp-stage.is-still *),
     ce qui laisse voir l'état final des animations « from → état normal ».
   - Affiche d'une vidéo voisine dans le fil : son passage en cours (le premier si elle n'a pas été vue),
     « still » à true, « playing » à false.
   - « progress » avance de 0 à 1 pendant le passage : d'après la position de lecture du fichier audio (sa durée
     réelle) quand la voix est là, sinon d'après une durée estimée. « word » est l'index du mot dit (mots
     séparés par des espaces ordinaires, comme wordsOf() de model.ts), -1 avant le premier : il est estimé au
     prorata du texte (la longueur des mots), le fichier ne donnant pas l'instant de chaque mot. Les mots de
     « emphasis » peuvent apparaître quand la voix les atteint : cueAt() de model.ts donne leur position (0 à 1).
   - « context » dit où la vidéo est regardée (VideoContext) : sur le site, pas d'appel à donner son avis.
   - La scène est masquée aux lecteurs d'écran (aria-hidden) : tout ce qu'elle montre doit être dit dans le
     « say » (sous-titres), le chiffre clé (value, label, date) ou l'« alt » du passage, tous repris dans la
     transcription du panneau Sources, avec la liste des sources. Elle ne doit contenir aucun élément interactif.
     Un toucher ou un clic sur la scène met en pause, comme sur TikTok.

   Ce que la piste s'engage à respecter :
   - Neutralité : l'enjeu et les chiffres, jamais les approches, les candidats ni les partis ; aucun cadrage
     par l'image (pas de chiffre grossi plus que l'autre dans une comparaison, pas de pictogramme connoté).
   - Le monde « Le dépouillement » (DESIGN.md) : encres et jetons du thème, clair et sombre (papier carbone),
     rouge réservé à la ligne rouge, bleu bille réservé à ce qui compte, pastels sans signification.
   - Rien de ludique au sens gadget : ni confettis, ni badges, ni rebonds. Vivant, mais sobre.
   - Aucune ressource externe (CSP : ni police, ni image, ni son venus du réseau), aucune dépendance.
   - Les chiffres montrés sont ceux de « figure.value », à la lettre, et les graphiques ceux de « chart »
     (FigureChart de src/ui/components, via chartOf() de model.ts qui vérifie sa forme). */

/** Ce que la piste sait de la vidéo en plus du script, pour titrer sans rien chercher */
export interface VideoMeta {
  /** Libellé du thème, nom de la série : « Retraites » */
  topic: string
  /** Libellé de la famille de thèmes : « Travail et économie » */
  family: string
  /** Place dans la série : 0 pour l'introduction, 1 à « of » pour les approfondissements */
  part: number
  /** Nombre d'approfondissements de la série */
  of: number
  /** Repère complet : « Retraites · Introduction », « Retraites · 1 sur 4 — Âge de départ » */
  marker: string
  /**
   * La question de la feuille quand la vidéo n'en éclaire qu'une ; sinon '' (introduction, levier commun).
   * Pour référence seulement : ce n'est PAS ce que dit la vidéo. Un passage « question » pose sa propre
   * question (segment.say), c'est elle qu'on dessine, sinon l'image contredit les sous-titres.
   */
  prompt: string
}

/** Ce que reçoit le dessin d'un passage */
export interface PisteSegmentProps {
  script: VideoScript
  segment: VideoSegment
  /** Index du passage dans script.segments */
  index: number
  /** La lecture avance : ni pause, ni attente de la voix, ni vidéo hors champ */
  playing: boolean
  /** Image fixe : mouvement réduit, ou affiche d'une vidéo voisine. Montrer l'état final, sans animation. */
  still: boolean
  /** Avancement dans le passage, de 0 à 1 */
  progress: number
  /** Index du mot en train d'être dit dans segment.say (wordsOf), -1 avant le premier */
  word: number
  meta: VideoMeta
  /** Où la vidéo est regardée */
  context: VideoContext
}

/** Ce que reçoit le décor permanent de la piste, autour des passages */
export interface PisteFrameProps {
  script: VideoScript
  /** Index du passage en cours */
  index: number
  playing: boolean
  still: boolean
  meta: VideoMeta
  context: VideoContext
  /** Le passage en cours, déjà dessiné */
  children: ComponentChildren
}

export interface Piste {
  /** Lettre de la piste, gardée de l'essai (« C ») */
  id: string
  /** Nom court : « Explication dessinée » */
  name: string
  /** Une ou deux phrases : le parti pris de la piste (documentation, jamais affichée) */
  description: string
  /** Adresse au spectateur pour laquelle la piste est dessinée (les scripts sont tous au vouvoiement) */
  register?: 'vous' | 'tu'
  /**
   * Classe posée sur chaque vidéo (« vc ») : le préfixe des styles de la piste. Elle peut y redéfinir les
   * jetons du lecteur : --vp-paper (fond de la vidéo), --vp-print (texte), --vp-soft (texte secondaire et mots
   * à venir des sous-titres), --vp-rule (filets), --vp-mark (soulignement du mot dit).
   */
  className: string
  /** Dessin d'un passage, remonté à chaque passage */
  Segment: (props: PisteSegmentProps) => JSX.Element
  /** Décor permanent facultatif, qui enveloppe les passages dans la scène (fond, marge, compteur…) */
  Frame?: (props: PisteFrameProps) => JSX.Element
}
