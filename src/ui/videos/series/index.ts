// Les séries de vidéos, une par thème de la banque de la primaire « Choisir 2027 », pour laquelle elles ont été
// écrites : un fichier par thème (series/<thème>.ts), qui exporte sa série, ou null tant qu'elle n'est pas
// écrite. VIDEO_SERIES les garde dans l'ordre de SERIES_BY_TOPIC (celui des familles de la primaire) et ignore
// les null. Ce module n'importe aucune élection : chaque élection range et réétiquette les séries qu'elle montre
// d'après ses propres thèmes et familles (../scope.ts, appliqué par ../catalog.ts).
// Pour ajouter une série : remplir son fichier (../GUIDE-SERIES.md), rien à changer ici.

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

/** Chaque thème de la banque de la primaire et sa série (null : pas encore écrite), dans l'ordre de ses familles */
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

/** Les séries écrites, dans l'ordre de SERIES_BY_TOPIC, telles qu'écrites (identifiants de la primaire) */
export const VIDEO_SERIES: VideoSeries[] = Object.values(SERIES_BY_TOPIC).filter((s): s is VideoSeries => s !== null)
