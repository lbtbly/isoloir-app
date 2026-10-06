// Les séries de vidéos, une par thème de la banque : un fichier par thème (series/<thème>.ts), qui exporte sa
// série, ou null tant qu'elle n'est pas écrite. VIDEO_SERIES les range dans l'ordre des familles de thèmes
// (src/elections/choisir-2027/groups.ts), puis des thèmes dans leur famille, et ignore les null.
// Pour ajouter une série : remplir son fichier (../GUIDE-SERIES.md), rien à changer ici.

import { topicGroups } from '../../../elections/choisir-2027/groups'
import type { VideoSeries } from '../types'
import { AGRICULTURE } from './agriculture'
import { DEFENSE } from './defense'
import { ECOLOGIE_ENERGIE } from './ecologie_energie'
import { EDUCATION } from './education'
import { EGALITE } from './egalite'
import { EUROPE } from './europe'
import { FISCALITE } from './fiscalite'
import { IMMIGRATION } from './immigration'
import { INDUSTRIE_ECONOMIE } from './industrie_economie'
import { INSTITUTIONS } from './institutions'
import { LAICITE_REPUBLIQUE } from './laicite_republique'
import { LOGEMENT } from './logement'
import { NUMERIQUE } from './numerique'
import { PROCHE_ORIENT } from './proche_orient'
import { RETRAITES } from './retraites'
import { SANTE } from './sante'
import { SECURITE_JUSTICE } from './securite_justice'
import { SOCIETE } from './societe'
import { SOLIDARITES } from './solidarites'
import { STRATEGIE } from './strategie'
import { TERRITOIRES } from './territoires'
import { TRAVAIL_SALAIRES } from './travail_salaires'
import { UKRAINE_RUSSIE } from './ukraine_russie'

/** Chaque thème de la banque et sa série (null : pas encore écrite), dans l'ordre des familles */
export const SERIES_BY_TOPIC: Readonly<Record<string, VideoSeries | null>> = {
  travail_salaires: TRAVAIL_SALAIRES,
  fiscalite: FISCALITE,
  industrie_economie: INDUSTRIE_ECONOMIE,
  retraites: RETRAITES,
  egalite: EGALITE,
  sante: SANTE,
  logement: LOGEMENT,
  solidarites: SOLIDARITES,
  education: EDUCATION,
  societe: SOCIETE,
  numerique: NUMERIQUE,
  ecologie_energie: ECOLOGIE_ENERGIE,
  agriculture: AGRICULTURE,
  territoires: TERRITOIRES,
  securite_justice: SECURITE_JUSTICE,
  immigration: IMMIGRATION,
  europe: EUROPE,
  ukraine_russie: UKRAINE_RUSSIE,
  proche_orient: PROCHE_ORIENT,
  defense: DEFENSE,
  institutions: INSTITUTIONS,
  laicite_republique: LAICITE_REPUBLIQUE,
  strategie: STRATEGIE,
}

/** Les séries écrites, dans l'ordre des familles puis des thèmes (celui de groups.ts) */
export const VIDEO_SERIES: VideoSeries[] = topicGroups
  .flatMap(g => g.topicIds.map(id => SERIES_BY_TOPIC[id] ?? null))
  .filter((s): s is VideoSeries => s !== null)
