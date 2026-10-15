// Ce que porte une feuille, en mots : sur la page « Autre appareil » et sur l'image du code de reprise.

import type { SessionState } from '../storage'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** « 22 réponses, dont 2 passées · 3 priorités · 2 thèmes approfondis » */
export function sheetContents(state: Pick<SessionState, 'answers' | 'weights' | 'deepTopics'>): string {
  const all = Object.values(state.answers)
  const skipped = all.filter(a => a.skipped).length
  const parts = [`${plural(all.length, 'réponse', 'réponses')}${skipped ? `, dont ${plural(skipped, 'passée', 'passées')}` : ''}`]
  const weights = Object.keys(state.weights).length
  if (weights) parts.push(plural(weights, 'priorité', 'priorités'))
  if (state.deepTopics.length) parts.push(plural(state.deepTopics.length, 'thème approfondi', 'thèmes approfondis'))
  return parts.join(' · ')
}
