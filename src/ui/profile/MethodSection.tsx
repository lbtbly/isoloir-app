// La rubrique « Mon profil politique » de la Méthode (#/methode/profil), sous son titre, que la Méthode pose elle-même
// (l'ancre existe dès l'ouverture). Dans le fichier à part de la page, chargé à la demande : le code de toutes les
// visites n'en contient rien. Ses chiffres viennent de ECHIQUIER_PUBLISHED (core/echiquierCopy.ts), mesurés par
// tools/audit-echiquier.mjs.

import { blocOf, ECHIQUIER, panelOf } from '../../core/echiquier'
import * as T from '../../core/echiquierCopy'
import { excludedIds } from '../../core/score'
import { axisOf } from '../../core/spectrum'
import type { ElectionPack } from '../../core/types'
import { SectionLink } from '../components/LegalBits'
import { ProfileDiagram } from './Diagram'

export function ProfileMethod({ pack }: { pack: ElectionPack }) {
  const { election, candidates } = pack
  const axis = axisOf(election) ?? []
  const panel = panelOf(pack)
  const sizes = panel.map(ids => ids.length).filter(Boolean)
  const present = new Set(candidates.map(c => c.id))
  const off = new Set(excludedIds(pack))
  const unscored = [...off].filter(id => present.has(id)).length
  // Aucun candidat classé n'est dans un bloc hors de l'axe (« Autres ») : la phrase le dit seulement si c'est vrai
  const onAxis = new Set(axis.map(a => a.bloc))
  const othersEmpty = candidates.every(c => off.has(c.id) || onAxis.has(blocOf(election, c) ?? ''))
  const [intro, introEnd] = T.methodIntro(axis.length)
  const [worthClones, worthChance] = T.methodWorth()
  return (
    <>
      <p>
        {intro}
        <SectionLink id="ordre-des-candidats">{T.METHOD_INTRO_LINK}</SectionLink>
        {introEnd}
      </p>
      <ProfileDiagram />
      <p class="caption">{T.METHOD_DIAGRAM_CAPTION}</p>
      <p>
        <strong>Qui compte.</strong> {T.methodWho(panel.flat().length, unscored, Math.min(...sizes), Math.max(...sizes), othersEmpty)}
      </p>
      <p>
        <strong>Le calcul.</strong> {T.METHOD_CALC}
      </p>
      <p>
        <strong>Le hasard.</strong> {T.methodChance(ECHIQUIER.GAP)}
      </p>
      <p>
        <strong>Quand on ne lit pas.</strong> {T.METHOD_WHEN_NOT}
      </p>
      <p>
        <strong>Pourquoi ni moyenne ni point.</strong> {T.METHOD_NO_POINT}
      </p>
      <p>
        <strong>Ce que valent ces lectures.</strong> {worthClones}
      </p>
      <p>{worthChance}</p>
      <p>
        <strong>Limites.</strong> {T.METHOD_LIMITS[0]}
        <SectionLink id="ordre-des-candidats">{T.METHOD_INTRO_LINK}</SectionLink>
        {T.METHOD_LIMITS[1]}
      </p>
      <p>
        <strong>Vie privée.</strong> {T.METHOD_PRIVACY}
      </p>
    </>
  )
}
