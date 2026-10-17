// Les entrées vers « Mon profil politique » (ui/screens/Profile.tsx, chargée à la demande), dans le code de toutes les
// visites : des liens et des mots, aucun calcul du profil. À l'encre, comme son panneau de « Et maintenant » : papier,
// filet de 1.5px, filet supérieur de 3px, sans pastel (le pastel y prendrait le sens d'un bloc de la grille).
// - Le bandeau (dépouillement complet, sous l'affiche ; seulement là) : le nom de la page et ce qu'elle montre, puis les
//   cinq blocs de la grille en têtes de colonnes, neutres, comme l'axe de la page.
// - L'aperçu (accueil, à tous les états de la feuille ; demande du propriétaire du 17/10/2026, le même cadre la page
//   prête ou non) : une grille fictive de 3 sujets sur 5 blocs aux couleurs de l'échelle d'affinité, comme les cases de
//   la page, sans en-têtes ; sa mention ; le nom de la page, ce qu'elle montre et où elle en est (quand elle s'affiche,
//   ou que la sienne est prête) ; l'appel, vers la page d'attente ou vers la page. La grille reste l'exemple fictif, jamais
//   les lectures de la personne (choix à faire valider par le propriétaire : les montrer demanderait de charger le calcul
//   de la page sur l'accueil). Pour un nouveau visiteur, « Exemple fictif » sous la grille ; dès la première réponse, la
//   mention passe au-dessus, avec le pictogramme d'information, et dit que ce ne sont pas ses réponses avant qu'on lise
//   la grille. Les mots des paliers s'écrivent dans les cases quand la place le permet ; la grille et sa mention sont
//   masquées aux lecteurs d'écran, le texte du lien dit ce qu'il montre.

import { AFFINITY_BANDS } from '../../core/affinity'
import { PEEK_TAG, PEEK_TAG_MINE, PROFILE_PEEK, PROFILE_TITLE } from '../../core/resultsCopy'
import type { SpectrumAxisBloc } from '../../core/types'
import { link } from '../nav'
import { Icon } from './Icon'

/**
 * Le bandeau ; cls : sa place (« results-profile », au dépouillement) ; axis : les cinq blocs de la grille, en têtes de
 * colonnes neutres comme sur la page, sans couleur ni donnée
 */
export function ProfileBand({ cls, title, text, axis }: { cls: string; title: string; text: string; axis: readonly SpectrumAxisBloc[] }) {
  return (
    <a class={`profile-band ${cls}`} href={link('/profil')}>
      <span class="pb-in">
        <span class="pb-body">
          <span class="pb-title">
            {title}
            <Icon name="arrow-right" class="pb-go" />
          </span>
          <span class="pb-text">{text}</span>
        </span>
        <span class="pb-axis" aria-hidden="true">
          {axis.map(a => (
            <span key={a.bloc}>{a.short}</span>
          ))}
        </span>
      </span>
    </a>
  )
}

/**
 * L'aperçu de l'accueil ; text : ce que montre la page ; when : quand elle s'affiche, ou que la sienne est prête ; mine :
 * la personne a déjà des réponses (la mention, « ce ne sont pas vos réponses », au-dessus de la grille, lue avant elle) ;
 * go : l'appel ; ready : la page est prête, un marqueur d'état (classe is-ready, que lit l'e2e), sans effet sur le lien
 * ni sur le dessin
 */
export function ProfilePeek({ text, when, mine, go, ready = false }: { text: string; when: string; mine: boolean; go: string; ready?: boolean }) {
  const mention = mine ? (
    <span class="hp-tag is-first">
      <Icon name="info" />
      {PEEK_TAG_MINE}
    </span>
  ) : (
    <span class="hp-tag">{PEEK_TAG}</span>
  )
  return (
    <a class={`home-profile profile-peek${ready ? ' is-ready' : ''}`} href={link('/profil')}>
      <span class="hp-in">
        <span class="hp-peek" aria-hidden="true">
          {mine ? mention : null}
          <span class="hp-tiles">
            {[...PROFILE_PEEK].map((d, i) => {
              // 1 « très éloigné » … 5 « très proche » : l'ordre inverse de AFFINITY_BANDS
              const band = AFFINITY_BANDS[5 - Number(d)]!
              return (
                <span key={i} class={`tile aff-${band.key}`}>
                  <span class="hp-word">{band.label}</span>
                </span>
              )
            })}
          </span>
          {mine ? null : mention}
        </span>
        <span class="hp-body">
          <span class="hp-title">{PROFILE_TITLE}</span>
          <span class="hp-text">{text}</span>
          <span class="hp-when">{when}</span>
          <span class="hp-go">
            {go}
            <Icon name="arrow-right" />
          </span>
        </span>
      </span>
    </a>
  )
}
