// Petite élection factice pour la page « Mon profil politique » (core/echiquier.ts), à part de tests/fixture.ts pour ne
// rien changer aux autres tests : cinq blocs sur l'axe et un bloc « Autres » ; sept candidats, dont un non classé et un
// dans « Autres » ; deux familles, l'une de trois thèmes, l'autre d'un seul ; des questions de trois ou quatre
// approches (placements comptés un à un) ; une position de confiance basse ; un thème où deux blocs sont inconnus ;
// un thème « en fer à cheval » (thème H), où les deux extrêmes portent la même approche.
// Sur chaque question, les approches vont à peu près de l'extrême gauche à l'extrême droite.
import type { Answers, ElectionPack, Position, Question } from '../../src/core/types'

const src = [{ title: 'Source de test', url: 'https://example.org/test', date: '2026-09-01' }]
const pos = (weight: 1 | 2, extra: Partial<Position> = {}): Position => ({ weight, nature: 'proposition', confidence: 'high', summary: 'test', sources: src, ...extra })
const rej = (): Position => ({ rejects: true, nature: 'declaration', confidence: 'high', summary: 'rejet', sources: src })

const q = (id: string, topicId: string, tier: 'essentiel' | 'approfondi', n: number): Question => ({
  id,
  topicId,
  tier,
  prompt: `Question ${id}`,
  approaches: Array.from({ length: n }, (_, i) => ({ id: `${id}${'abcd'[i]}`, text: `Approche ${'ABCD'[i]} de ${id}` })),
})

export const echiquierPack: ElectionPack = {
  election: {
    id: 'essai-echiquier',
    kind: 'presidentielle',
    name: 'Élection d’essai',
    shortName: 'Essai',
    organizers: [],
    rounds: [],
    dataVersion: '1',
    dataFrozenAt: '2026-10-01',
    finalists: null,
    notes: [],
    changelog: [],
    ranking: { minCoverageShare: 0.5, excluded: { ids: ['n1'], reason: 'positions connues sur trop peu de questions', since: '2026-10-01' } },
    copy: {
      theName: 'l’élection d’essai',
      atName: 'à l’élection d’essai',
      independence: { footer: 'sans lien', method: 'sans lien', legal: 'sans lien' },
      sources: 'sources de test',
      closeGapReason: 'Les candidats sont proches',
      step1Reason: 'sont des questions de test',
      officialPageLabel: 'Page officielle',
      shareDescription: 'Élection d’essai',
    },
    spectrum: {
      nuances: [
        { code: 'EXG', label: 'Extrême gauche', bloc: 'extreme-gauche' },
        { code: 'SOC', label: 'Socialiste', bloc: 'gauche' },
        { code: 'ECO', label: 'Écologiste', bloc: 'autres' },
        { code: 'REN', label: 'Centre', bloc: 'centre' },
        { code: 'LR', label: 'Droite', bloc: 'droite' },
        { code: 'RN', label: 'Extrême droite', bloc: 'extreme-droite' },
      ],
      blocs: [
        { id: 'extreme-gauche', label: 'Extrême gauche', pastel: 'rouge' },
        { id: 'gauche', label: 'Gauche', pastel: 'rouge' },
        { id: 'autres', label: 'Autres', pastel: 'vert' },
        { id: 'centre', label: 'Centre', pastel: 'jaune' },
        { id: 'droite', label: 'Droite', pastel: 'bleu' },
        { id: 'extreme-droite', label: 'Extrême droite', pastel: 'bleu' },
      ],
      source: { title: 'Grille de test', url: 'https://example.org/grille', date: '2026-08-23' },
      axis: [
        { bloc: 'extreme-gauche', short: 'Ext. gauche', where: 'à l’extrême gauche', from: 'de l’extrême gauche', to: 'à l’extrême gauche' },
        { bloc: 'gauche', short: 'Gauche', where: 'à gauche', from: 'de la gauche', to: 'à la gauche' },
        { bloc: 'centre', short: 'Centre', where: 'au centre', from: 'du centre', to: 'au centre' },
        { bloc: 'droite', short: 'Droite', where: 'à droite', from: 'de la droite', to: 'à la droite' },
        { bloc: 'extreme-droite', short: 'Ext. droite', where: 'à l’extrême droite', from: 'de l’extrême droite', to: 'à l’extrême droite' },
      ],
    },
  },
  candidates: [
    { id: 'e1', name: 'Edith Un', initials: 'EU', affiliation: 'X', role: 'r', nuance: 'EXG' },
    { id: 'g1', name: 'Gaston Un', initials: 'GU', affiliation: 'X', role: 'r', nuance: 'SOC' },
    { id: 'c1', name: 'Céline Un', initials: 'CU', affiliation: 'X', role: 'r', nuance: 'REN' },
    { id: 'd1', name: 'Damien Un', initials: 'DU', affiliation: 'X', role: 'r', nuance: 'LR' },
    { id: 'x1', name: 'Xavière Un', initials: 'XU', affiliation: 'X', role: 'r', nuance: 'RN' },
    // Non classé (election.ranking.excluded) : jamais sur l'axe, même s'il a des positions partout
    { id: 'n1', name: 'Noé Un', initials: 'NU', affiliation: 'X', role: 'r', nuance: 'LR' },
    // Bloc « Autres », hors de l'axe
    { id: 'v1', name: 'Violette Un', initials: 'VU', affiliation: 'X', role: 'r', nuance: 'ECO' },
  ],
  bank: {
    topics: [
      { id: 'ta1', label: 'Thème A un', description: '' },
      { id: 'ta2', label: 'Thème A deux', description: '' },
      { id: 'tc', label: 'Thème C', description: '' },
      { id: 'tb', label: 'Thème B', description: '' },
      { id: 'th', label: 'Thème H', description: '' },
    ],
    questions: [
      q('q1', 'ta1', 'essentiel', 3),
      q('q2', 'ta1', 'approfondi', 4),
      q('q3', 'ta2', 'essentiel', 3),
      q('q4', 'ta2', 'approfondi', 3),
      q('q6', 'tc', 'essentiel', 3),
      q('q5', 'tb', 'essentiel', 4),
      q('q7', 'tb', 'approfondi', 3),
      q('q8', 'th', 'essentiel', 4),
      q('q9', 'th', 'approfondi', 4),
      q('q10', 'th', 'approfondi', 4),
    ],
  },
  topicGroups: [
    { id: 'fa', label: 'Famille A', topicIds: ['ta1', 'ta2', 'tc'] },
    { id: 'fb', label: 'Famille B', topicIds: ['tb'] },
    { id: 'fh', label: 'Famille H', topicIds: ['th'] },
  ],
  positions: {
    e1: { q1a: pos(2), q1c: rej(), q2a: pos(2), q3a: pos(2), q4a: pos(2), q4c: rej(), q5a: pos(2), q6a: pos(2), q7a: pos(2), q8a: pos(2), q9a: pos(2), q10a: pos(2) },
    g1: { q1b: pos(2), q1a: pos(1), q2b: pos(2), q3a: pos(2), q4b: pos(2), q5a: pos(2), q6a: pos(1), q6b: pos(2), q7a: pos(1), q7b: pos(2), q8b: pos(2), q9b: pos(2), q10b: pos(2) },
    c1: { q1b: pos(2), q2c: pos(2), q3b: pos(2), q4b: pos(2), q5b: pos(2), q6b: pos(2), q7b: pos(2), q8c: pos(2), q9c: pos(2), q10c: pos(2) },
    // Position de confiance basse sur q5b : une note posée sur q5b rend q5 inconnue pour lui ; rien sur q7
    d1: { q1c: pos(2), q2c: pos(2), q3c: pos(2), q4c: pos(2), q5b: pos(2, { confidence: 'low' }), q5c: pos(1), q8d: pos(2), q9d: pos(2), q10d: pos(2) },
    x1: { q1c: pos(2), q1a: rej(), q2d: pos(2), q3c: pos(2), q4c: pos(2), q5c: pos(2), q7c: pos(2), q8a: pos(2), q9a: pos(2), q10a: pos(2) },
    n1: { q1a: pos(2), q2a: pos(2), q3a: pos(2), q4a: pos(2), q5a: pos(2), q6c: pos(2), q7a: pos(2) },
    v1: { q1b: pos(2), q2b: pos(2), q3b: pos(2), q4b: pos(2), q5d: pos(2), q6c: pos(2), q7b: pos(2) },
  },
}

/** Une réponse à partir des avis, dans l'ordre des approches (−1, 0, 1) ; tout à 0 : pas de réponse */
export function answersOf(byQuestion: Record<string, number[]>, pack: ElectionPack = echiquierPack): Answers {
  const out: Answers = {}
  for (const [id, values] of Object.entries(byQuestion)) {
    const question = pack.bank.questions.find(x => x.id === id)!
    const ratings: Record<string, -1 | 1> = {}
    question.approaches.forEach((a, i) => {
      const v = values[i] ?? 0
      if (v === 1 || v === -1) ratings[a.id] = v
    })
    out[id] = { ratings, redLines: [] }
  }
  return out
}

/** D'accord avec tout ce que porte le candidat (principal ou compatible), pas d'accord avec le reste, partout où il est connu */
export function cloneOf(id: string, pack: ElectionPack = echiquierPack, only?: (q: Question) => boolean): Answers {
  const byQuestion: Record<string, number[]> = {}
  for (const question of pack.bank.questions) {
    if (only && !only(question)) continue
    const table = pack.positions[id] ?? {}
    const carried = question.approaches.map(a => !!table[a.id]?.weight && table[a.id]!.confidence !== 'low')
    if (!carried.some(Boolean)) continue
    byQuestion[question.id] = carried.map(c => (c ? 1 : -1))
  }
  return answersOf(byQuestion, pack)
}
