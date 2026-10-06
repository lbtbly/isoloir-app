// Piste C, « Explication dessinée » : le sujet expliqué comme au tableau, sur une feuille quadrillée qu'on
// remplit étape par étape. Chaque passage a son dessin au trait d'encre, qui se trace quand la voix l'appelle :
// des pictogrammes (une personne, une maison, un calendrier, des pièces, une grue, une balance…) rendent chaque
// idée concrète, des schémas simples se construisent (un rang qu'on compte, cent unités, des barres à la même
// échelle, une frise, une balance, des leviers), et les mots mis en valeur s'écrivent en gros quand ils sont dits.
//
// Organisation (une grammaire commune, réutilisable pour les thèmes à venir) :
//   dessin/encre.tsx     les gestes (trait qui se trace, texte qui apparaît) et la lecture du script
//   dessin/pictos.tsx    la bibliothèque de pictogrammes au trait, et le lexique mot → pictogramme
//   dessin/schemas.tsx   les schémas paramétrables (rang, cent, barres, colonnes, disque, frise, balance…)
//   dessin/mises.tsx     les mises en page d'un passage (titre, chiffre, question, sommaire)
//   planches/            le dessin de chaque passage, série par série, et le dessin générique
//
// Neutre : l'encre d'imprimerie pour tout ce qui est dit, le bleu bille seulement pour ce que le passage compte,
// ni rouge ni pastel ; pictogrammes sans attribut ; rien n'est grossi d'un côté d'une comparaison (grandeurs
// depuis zéro, à la même échelle) ; une question n'a jamais de réponse dessinée. Les textes du dessin viennent du
// script : si le script change, le dessin suit. Vouvoiement. Styles : src/styles/videos-c.css (.vc-*).
// Image fixe (mouvement réduit, affiche d'une vidéo voisine) : chaque geste va « de l'état de départ vers l'état
// normal », et tout ce que la voix appelle est déjà là : on voit le dessin fini.

import '../../../styles/videos-c.css'
import type { Piste, PisteFrameProps, PisteSegmentProps, VideoSegment } from '../types'
import { cls } from './dessin/encre'
import { PLANCHES, generique } from './planches'

/** Le dessin d'un passage : sa planche, ou, si elle manque ou ne se retrouve plus dans le script, le générique */
function Segment(p: PisteSegmentProps) {
  return <div class={cls('vc-scene', p.still && 'is-still')}>{planche(p) ?? generique(p)}</div>
}

/** La planche du passage, ou rien : une planche qui ne comprend plus son script ne doit jamais casser la vidéo */
function planche(p: PisteSegmentProps) {
  const board = PLANCHES[p.segment.id]
  try {
    return board ? board(p) : null
  } catch {
    return null
  }
}

/** Le titre de l'étape, à côté de son numéro */
function kickerOf(segment: VideoSegment | undefined): string {
  if (segment?.figure && (segment.visual === 'figure' || segment.visual === 'hook')) return 'Chiffre clé'
  if (segment?.visual === 'question') return 'La question'
  return ''
}

/** Le décor : la feuille quadrillée, le numéro de l'étape et son filet, qui se tire à chaque étape */
function Frame({ script, index, still, children }: PisteFrameProps) {
  const kicker = kickerOf(script.segments[index])
  return (
    <div class={cls('vc-frame', still && 'is-still')} data-step={index + 1}>
      <div class="vc-head" key={index}>
        <span class="vc-n">{index + 1}</span>
        {kicker ? <span class="vc-kick">{kicker}</span> : null}
        <span class="vc-rule" />
      </div>
      <div class="vc-board">{children}</div>
    </div>
  )
}

export const piste: Piste = {
  id: 'C',
  name: 'Explication dessinée',
  description:
    'Comme au tableau, sur une feuille quadrillée qu’on remplit étape par étape\u00a0: des pictogrammes au trait se dessinent avec la voix, des schémas simples se construisent (un rang qu’on compte, des barres à la même échelle, une frise, une balance), et les chiffres de la fiche se comptent au bleu bille.',
  register: 'vous',
  className: 'vc',
  Segment,
  Frame,
}
