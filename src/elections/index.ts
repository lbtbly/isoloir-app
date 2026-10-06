// Registre des élections. Ajouter une élection : créer un dossier elections/<id>/ qui
// exporte un ElectionPack, puis l'ajouter ici. Les tests d'intégrité s'y appliquent d'office.
import type { ElectionPack } from '../core/types'
import { choisir2027 } from './choisir-2027'

export const elections: ElectionPack[] = [choisir2027]
export const defaultElection: ElectionPack = choisir2027
