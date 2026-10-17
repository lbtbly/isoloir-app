import type { ElectionPack } from '../../core/types'
import { withoutHidden } from '../../core/visible'
import { bank } from './bank'
import { candidates } from './candidates'
import { election } from './election'
import { topicGroups } from './groups'
import { journal } from './journal'
import { positions } from './positions'
import { transferSlots } from './transfer'
import { videoScope } from './videos'

// Candidats masqués (election.hidden) : retirés ici, à l'export du pack, et nulle part ailleurs
export const presidentielle2027: ElectionPack = withoutHidden({ election, candidates, bank, positions, topicGroups, videoScope, transfer: transferSlots, journal })
