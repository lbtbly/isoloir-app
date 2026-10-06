import type { ElectionPack, Position } from '../src/core/types'

const src = [{ title: 'Source de test', url: 'https://example.org/test', date: '2026-09-01' }]
export const pos = (weight: 1 | 2, extra: Partial<Position> = {}): Position => ({
  weight,
  nature: 'proposition',
  confidence: 'high',
  summary: 'test',
  sources: src,
  ...extra,
})
export const rej = (extra: Partial<Position> = {}): Position => ({
  rejects: true,
  nature: 'declaration',
  confidence: 'high',
  summary: 'rejet',
  sources: src,
  ...extra,
})

// Trois candidats, deux thèmes, trois questions.
export const pack: ElectionPack = {
  election: {
    id: 'test',
    name: 'Élection de test',
    shortName: 'Test',
    organizers: [],
    rounds: [],
    dataVersion: '1',
    dataFrozenAt: '2026-10-01',
    finalists: null,
    notes: [],
    changelog: [],
  },
  candidates: [
    { id: 'a', name: 'Alice A', initials: 'AA', affiliation: 'X', role: 'r' },
    { id: 'b', name: 'Bruno B', initials: 'BB', affiliation: 'Y', role: 'r' },
    { id: 'c', name: 'Chloé C', initials: 'CC', affiliation: 'Z', role: 'r' },
  ],
  bank: {
    topics: [
      { id: 't1', label: 'Thème 1', description: '' },
      { id: 't2', label: 'Thème 2', description: '' },
    ],
    questions: [
      { id: 'q1', topicId: 't1', tier: 'essentiel', prompt: 'Q1', approaches: [{ id: 'q1a', text: 'A' }, { id: 'q1b', text: 'B' }, { id: 'q1c', text: 'C' }] },
      { id: 'q2', topicId: 't1', tier: 'essentiel', prompt: 'Q2', approaches: [{ id: 'q2a', text: 'A' }, { id: 'q2b', text: 'B' }] },
      { id: 'q3', topicId: 't2', tier: 'essentiel', prompt: 'Q3', approaches: [{ id: 'q3a', text: 'A' }, { id: 'q3b', text: 'B' }, { id: 'q3c', text: 'C' }] },
    ],
  },
  positions: {
    a: { q1a: pos(2), q2a: pos(2), q3a: pos(2), q3b: pos(1) },
    b: { q1b: pos(2), q1a: pos(1), q2b: pos(2), q3b: pos(2), q3a: rej() },
    c: { q1c: pos(2), q2a: pos(1), q2b: pos(1) /* q3 inconnue */ },
  },
}
