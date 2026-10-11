// Édition « présidentielle 2027 » des séries vidéo : une correction par thème (fichiers de ce dossier), issue de
// la relecture d'équilibre politique du 7 octobre 2026 (research/presidentielle-2027/VIDEOS-A-METTRE-A-JOUR.md),
// appliquée le 10 octobre 2026 (research/presidentielle-2027/video-edition-run.json).

import type { Edition } from '../types'
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
import { TERRITOIRES } from './territoires'
import { TRAVAIL_SALAIRES } from './travail_salaires'
import { UKRAINE_RUSSIE } from './ukraine_russie'

export const PRESIDENTIELLE_2027: Edition = {
  id: 'presidentielle-2027',
  suffix: '-p27',
  patches: {
    agriculture: AGRICULTURE,
    defense: DEFENSE,
    ecologie_energie: ECOLOGIE_ENERGIE,
    education: EDUCATION,
    egalite: EGALITE,
    europe: EUROPE,
    fiscalite: FISCALITE,
    immigration: IMMIGRATION,
    industrie_economie: INDUSTRIE_ECONOMIE,
    institutions: INSTITUTIONS,
    laicite_republique: LAICITE_REPUBLIQUE,
    logement: LOGEMENT,
    numerique: NUMERIQUE,
    proche_orient: PROCHE_ORIENT,
    retraites: RETRAITES,
    sante: SANTE,
    securite_justice: SECURITE_JUSTICE,
    societe: SOCIETE,
    solidarites: SOLIDARITES,
    territoires: TERRITOIRES,
    travail_salaires: TRAVAIL_SALAIRES,
    ukraine_russie: UKRAINE_RUSSIE,
  },
}
