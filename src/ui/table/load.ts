// « À table » : un fichier à part du build, chargé à la demande (#/a-table), comme la comparaison et « Mon profil
// politique ». Ce qui reste dans le code de chaque visite tient en quelques lignes : savoir si l'élection a une table,
// et si une table est en cours (verrou du mode fermé), pour qu'aucune autre page ne s'affiche pendant qu'un téléphone
// passe de main en main.

import { axisOf } from '../../core/spectrum'
import type { ElectionInfo } from '../../core/types'
import { onDemand } from '../lazy'

export type TableModule = typeof import('./Table')

export const tableScreen = onDemand<TableModule>(() => import('./Table'))

/** Une table pour cette élection : il faut l'axe de la grille des nuances (règle du vivier), hors archive */
export const hasTable = (election: Pick<ElectionInfo, 'spectrum' | 'archived'>): boolean => !!axisOf(election) && !election.archived

// Le verrou du mode fermé, repris ici pour le site (src/app.tsx)
export { setTableLocked, TABLE_MARK, tableLocked } from './lock'
