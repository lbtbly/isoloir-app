// Toutes les élections, chargées d'un coup : réservé aux tests et aux outils. Le site, lui, passe par le
// registre (index.ts), qui charge chaque élection à la demande ; aucun module de src/ n'importe ce fichier.

import type { ElectionPack } from '../core/types'
import { choisir2027 } from './choisir-2027'
import { presidentielle2027 } from './presidentielle-2027'

export const elections: ElectionPack[] = [presidentielle2027, choisir2027]
