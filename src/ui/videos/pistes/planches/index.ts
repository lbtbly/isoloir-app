// Les planches de la piste C : un dessin par passage (identifiant du passage → planche), série par série, un
// fichier par thème (<thème>.tsx, comme retraites.tsx), dans l'ordre des familles. Un passage sans planche, ou
// dont la planche ne se retrouve plus dans le script, prend le dessin générique de sa sorte d'image
// (generique.tsx). Pour une nouvelle série : remplir son fichier, rien à changer ici. Mode d'emploi :
// src/ui/videos/GUIDE-SERIES.md.

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
import type { Board } from './types'

/** Les planches de chaque thème (clés de SERIES_BY_TOPIC, ../../series) : identifiant de passage → planche */
export const PLANCHES_BY_TOPIC: Readonly<Record<string, Record<string, Board>>> = {
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

/** Toutes les planches, par identifiant de passage (unique entre toutes les séries) */
export const PLANCHES: Record<string, Board> = Object.assign({}, ...Object.values(PLANCHES_BY_TOPIC))

export { generique } from './generique'
export type { Board } from './types'
