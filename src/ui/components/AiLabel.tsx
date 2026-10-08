// Étiquette « Rédigé par IA » : tout texte rédigé par une IA porte cette mention là où il apparaît, au plus
// tard à la première exposition (règlement (UE) 2024/1689, art. 50, 4 et 5). Ces textes ne sont pas relus un
// par un par une personne : la mention le dit sans détour, en vrai texte (jamais par une icône seule).
// L'étiquette se place en tête du texte qu'elle signale (au début de la publication, pas à son pied), et sur
// chaque écran où ce texte peut être vu en premier : chaque question de la feuille, et non la seule première,
// car on peut reprendre la feuille en cours de route.
// Trois formes :
//   - « bulle » (par défaut) : la mention, puis « En savoir plus » qui déplie l'explication sur place, sans
//     quitter la page (questions, tête des positions, tête de « Les sujets » et de « Qui porte quoi ») ;
//   - « lien » : la mention, puis un lien vers la rubrique « Usage de l'IA » de la méthode (encarts, panneaux
//     déjà dépliés, où une bulle de plus serait une poupée russe) ;
//   - « seule » : la mention sans rien d'autre (pendant la lecture d'une vidéo, où un lien sortirait du lecteur ;
//     sur chacune des fiches de « Les sujets », dont la tête porte déjà la bulle).
// Vidéos : leur texte est rédigé par IA, et elles sont lues par une voix de synthèse, générée à l'avance sur
// l'ordinateur de l'éditeur par un modèle libre (VoxCPM2), qui n'imite aucune personne réelle ; rien n'est
// synthétisé sur l'appareil. La mention le dit dès que la voix est enregistrée.
// Le calcul d'affinité, lui, n'utilise aucune IA : rien ici ne le concerne.

import { APP_NAME, REPORT_URL } from '../../core/app'
import { Icon } from './Icon'
import { link } from '../nav'
import '../../styles/ai-label.css'

/** Ce que l'étiquette accompagne : le texte de la mention et de son explication en dépend */
export type AiKind = 'feuille' | 'fiche' | 'fiches' | 'positions' | 'resumes' | 'parcours' | 'texte' | 'video' | 'videos'

/** Rubrique « Usage de l'IA » de la notice Méthode et sources (ancre stable), en chemin : link(AI_METHOD_PATH) */
export const AI_METHOD_PATH = '/methode/ia'

/** La mention visible : le constat en noir, la précision en gris */
const LABEL: Record<AiKind, { lead: string; rest?: string }> = {
  // Un écran de la feuille : la question, son contexte, « Comprendre l'enjeu » et les approches
  feuille: { lead: 'Textes rédigés par IA', rest: 'vérifiés automatiquement' },
  fiche: { lead: 'Rédigé par IA', rest: 'vérifié automatiquement' },
  fiches: { lead: 'Fiches rédigées par IA', rest: 'vérifiées automatiquement contre leurs sources' },
  positions: { lead: 'Positions résumées par IA', rest: 'vérifiées automatiquement contre leurs sources' },
  resumes: { lead: 'Résumés rédigés par IA', rest: 'vérifiés automatiquement contre leurs sources' },
  parcours: { lead: 'Rédigé par IA', rest: 'à partir des sources citées' },
  texte: { lead: 'Rédigé par IA' },
  video: { lead: 'Texte rédigé par IA', rest: 'vérifié automatiquement' },
  // La page « Les sujets en vidéo » : les textes de toutes les vidéos
  videos: { lead: 'Textes rédigés par IA', rest: 'vérifiés automatiquement' },
}

/** La première phrase de l'explication, propre à chaque texte */
const WHAT: Record<AiKind, string> = {
  feuille:
    'La question, son contexte, ses approches et la fiche «\u00a0Comprendre l’enjeu\u00a0» ont été rédigés par une IA (Claude, d’Anthropic) à partir des positions publiques des candidats et des sources citées, puis vérifiés automatiquement\u00a0: par une IA, contre ces sources, et par des tests, pour qu’aucune formulation ne désigne un candidat.',
  fiche:
    'Cette fiche a été rédigée par une IA (Claude, d’Anthropic) à partir des sources citées, puis vérifiée automatiquement contre ces sources, par une IA elle aussi.',
  fiches:
    'Ces fiches, comme les questions qui les titrent, ont été rédigées par une IA (Claude, d’Anthropic) à partir des sources citées, puis vérifiées automatiquement contre ces sources, par une IA elle aussi.',
  positions:
    'Les positions des candidats ont été recherchées et résumées par une IA (Claude, d’Anthropic) à partir des sources citées, puis vérifiées automatiquement contre ces sources, par une IA elle aussi. Une attribution douteuse est retirée.',
  resumes:
    'Ces résumés ont été rédigés par une IA (Claude, d’Anthropic) à partir des sources citées, puis vérifiés automatiquement contre ces sources, par une IA elle aussi.',
  parcours: 'Ce parcours a été rédigé par une IA (Claude, d’Anthropic) à partir des sources citées.',
  texte: 'Ce texte a été rédigé par une IA (Claude, d’Anthropic).',
  video:
    'Le texte de cette vidéo a été rédigé par une IA (Claude, d’Anthropic) à partir des fiches et des sources citées, puis vérifié automatiquement contre elles.',
  videos:
    'Les textes de ces vidéos ont été rédigés par une IA (Claude, d’Anthropic) à partir des fiches et des sources citées, puis vérifiés automatiquement contre elles.',
}

interface Props {
  kind: AiKind
  /** « bulle » : explication dépliable sur place ; « lien » : vers la méthode ; « seule » : la mention seule */
  more?: 'bulle' | 'lien' | 'seule'
  /** Vidéo (ou page des vidéos) : la voix de synthèse est enregistrée (sinon, elle se lit en sous-titres seuls) ;
   *  la mention devient « Texte rédigé par IA · voix de synthèse » */
  voice?: boolean
  /** On quitte l'écran par un lien de l'étiquette (lecteur vidéo : retrouver la vidéo au retour) */
  onLeave?: () => void
  class?: string
}

/** Séparateur lu comme une virgule, vu comme un point médian soudé au mot qui précède : à la coupure de ligne,
 *  le point reste en fin de ligne, jamais seul en tête de la suivante */
function Sep() {
  return (
    <>
      <span aria-hidden="true">{'\u00a0· '}</span>
      <span class="sr-only">, </span>
    </>
  )
}

/** La mention elle-même, en une ligne de petit corps */
function Mention({ kind, voice }: { kind: AiKind; voice?: boolean }) {
  const { lead, rest } = LABEL[kind]
  const tail = (kind === 'video' || kind === 'videos') && voice ? 'voix de synthèse' : rest
  return (
    <>
      <span class="ai-label-lead">{lead}</span>
      {tail ? (
        <>
          <Sep />
          {tail}
        </>
      ) : null}
    </>
  )
}

/** L'explication complète : ce qu'a fait l'IA, ce qui n'a pas été fait, et comment signaler une erreur */
export function AiNote({ kind, voice, onLeave }: { kind: AiKind; voice?: boolean; onLeave?: () => void }) {
  const voiceLine =
    kind === 'video' || kind === 'videos'
      ? voice
        ? ' La voix est une voix de synthèse, générée à l’avance à partir du texte, sur l’ordinateur de l’éditeur, par un modèle libre (VoxCPM2)\u00a0; elle n’imite aucune personne réelle, et rien n’est synthétisé sur votre appareil.'
        : kind === 'video'
          ? ' La vidéo sera lue par une voix de synthèse\u00a0; en attendant, elle se lit en sous-titres seuls.'
          : ' Les vidéos seront lues par une voix de synthèse\u00a0; en attendant, elles se lisent en sous-titres seuls.'
      : ''
  // Les approches et les points d'accord ne citent pas de source à côté d'eux : pas de renvoi aux sources
  const check = kind === 'feuille' || kind === 'texte' ? '.' : '\u00a0: chaque source est citée pour que vous puissiez vérifier.'
  return (
    <>
      <p>
        {WHAT[kind]}
        {voiceLine} Les textes d’{APP_NAME} ne sont pas relus un par un par une personne{check}
      </p>
      <p>
        Une erreur&nbsp;?{' '}
        <a href={REPORT_URL || link('/mentions-legales')} onClick={REPORT_URL ? undefined : onLeave}>
          Signalez-la
        </a>
        .{' '}
        <a href={link(AI_METHOD_PATH)} onClick={onLeave}>
          L’usage de l’IA dans {APP_NAME}
        </a>
      </p>
    </>
  )
}

export function AiLabel({ kind, more = 'bulle', voice, onLeave, class: c }: Props) {
  const cls = ['ai-label', c].filter(Boolean).join(' ')
  if (more !== 'bulle')
    return (
      <p class={cls}>
        <Mention kind={kind} voice={voice} />
        {more === 'lien' ? (
          <>
            <Sep />
            <a class="ai-label-link" href={link(AI_METHOD_PATH)} onClick={onLeave}>
              En savoir plus
            </a>
          </>
        ) : null}
      </p>
    )
  return (
    <details class={cls}>
      <summary>
        <Mention kind={kind} voice={voice} />
        {/* Le chevron sépare déjà : pas de point médian devant « En savoir plus » */}
        <span class="sr-only">, </span>{' '}
        <span class="ai-label-more">
          <Icon name="chevron" class="disclosure" />
          <span class="summary-label">En savoir plus</span>
        </span>
      </summary>
      <div class="ai-label-note">
        <AiNote kind={kind} voice={voice} onLeave={onLeave} />
      </div>
    </details>
  )
}
