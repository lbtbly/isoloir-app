// Primaire « Choisir 2027 » (vote du 9 au 11 octobre 2026) : pack de RÉFÉRENCE, hors du site depuis le 12 octobre
// 2026. Ni le registre (../index.ts) ni all.ts ne l'importent, et tools/check-dist.mjs refuse qu'un fichier de la
// primaire arrive dans le build. Il reste dans le dépôt parce que d'autres s'en servent : les séries vidéo sont
// écrites sur sa banque (tests/videos.test.ts, video-site.test.ts, tools/videos-snap.page.ts), l'élection factice
// essai-20 du serveur de développement en reprend la banque et les familles (tests/fixtures/many-candidates.ts),
// tests/primaire-unchanged.test.ts y fige le moteur, et tests/report-pdf.test.ts y éprouve la ligne d'archive du PDF.
// research/choisir-2027 reste aussi : la reconstruction de la présidentielle lit sa banque (reuse.json).
// Ne pas le remettre au registre : ses adresses (#/choisir-2027, #/primaire) sont retirées (RETIRED_PREFIXES).
import type { ElectionPack } from '../../core/types'
import { bank } from './bank'
import { candidates } from './candidates'
import { election } from './election'
import { topicGroups } from './groups'
import { positions } from './positions'

export const choisir2027: ElectionPack = { election, candidates, bank, positions, topicGroups }
