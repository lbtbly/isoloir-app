// Toutes les élections du site, chargées d'un coup : réservé aux tests et aux outils. Le site, lui, passe par le
// registre (index.ts), qui charge chaque élection à la demande ; aucun module de src/ n'importe ce fichier.
// La primaire « Choisir 2027 » n'y est plus depuis le 12 octobre 2026 : son pack (./choisir-2027) reste dans le
// dépôt, hors du site, comme référence (séries vidéo, élection factice essai-20, référence figée du moteur) ; les
// tests qui s'en servent l'importent directement.

import type { ElectionPack } from '../core/types'
import { presidentielle2027 } from './presidentielle-2027'

export const elections: ElectionPack[] = [presidentielle2027]
