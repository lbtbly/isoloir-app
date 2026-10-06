import type { ElectionPack } from '../../core/types'
import { bank } from './bank'
import { candidates } from './candidates'
import { election } from './election'
import { topicGroups } from './groups'
import { positions } from './positions'

export const choisir2027: ElectionPack = { election, candidates, bank, positions, topicGroups }
