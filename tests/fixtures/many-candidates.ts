// Élection factice de 20 candidats, pour la mise en page d'une élection nombreuse (présidentielle).
// Noms, partis et positions sont inventés : ils ne désignent personne. Les questions sont celles de la
// primaire (src/elections/choisir-2027), et les positions en sont tirées de façon déterministe : chaque
// candidat a une place sur un axe imaginaire, chaque approche aussi, et il porte l'approche la plus proche
// de la sienne, à un bruit près ; une part de ses positions reste inconnue, plus grande pour les derniers.
// Un candidat (NARROW) a une candidature centrée sur une seule cause : connu sur deux thèmes seulement, il éprouve
// la règle « hors classement » de l'élection (election.ranking), comme une candidature de ce genre à la présidentielle.
// Deux autres (EXCLUDED), les moins connus après lui, sont « non classés » à titre d'essai (election.ranking.excluded),
// comme les candidats de la présidentielle connus sur trop peu de questions : ni score ni rang.
// Visible en développement seulement, à l'adresse #/essai-20/ (registre src/elections/index.ts) ; jamais dans
// le build de production.

import { bank } from '../../src/elections/choisir-2027/bank'
import { topicGroups } from '../../src/elections/choisir-2027/groups'
import type { Candidate, CandidateMedia, ElectionInfo, ElectionPack, Position, PositionTable } from '../../src/core/types'

/** Identifiant et préfixe d'adresse de l'élection factice */
export const MANY_ID = 'essai-20'

/** Le candidat à cause unique, et les seuls thèmes où sa position est connue (10 questions sur 69, 1 sur 19 au rapide) */
export const NARROW = 'placebo'
const NARROW_TOPICS = ['ecologie_energie', 'agriculture']

/** Les non classés de l'essai : les deux candidats les moins connus après la cause unique (35 et 36 questions sur 69) */
export const EXCLUDED = ['patron', 'temoin']

/** Hachage FNV-1a sur 32 bits : le même texte donne toujours le même nombre */
function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Un nombre de [0, 1[ tiré du texte */
const unit = (text: string) => hash(text) / 2 ** 32

// Silhouette neutre, pour mêler portraits et initiales comme dans une vraie élection (aucune vraie photo)
const SILHOUETTE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#cfd2d6"/><circle cx="50" cy="40" r="18" fill="#8a9099"/><path d="M14 100c4-24 18-34 36-34s32 10 36 34z" fill="#8a9099"/></svg>',
)}`
const photo = (name: string): CandidateMedia => ({
  src: SILHOUETTE,
  alt: `Silhouette factice de ${name}`,
  credit: 'Image factice, pour l’essai de mise en page',
  rightsUrl: 'https://example.org/',
})

// [identifiant, nom, initiales, parti, portrait factice] ; des noms et des partis longs pour éprouver les coupures
const PEOPLE: [string, string, string, string, boolean][] = [
  ['exemple', 'Alix Exemple', 'AE', 'Parti de l’exemple', false],
  ['essai', 'Bertrand Essai', 'BE', 'Collectif Essai', true],
  ['fictive', 'Camille Fictive', 'CF', 'Mouvement fictif', false],
  ['maquette', 'Dominique Maquette', 'DM', 'Atelier de la maquette', false],
  ['brouillon', 'Éloïse Brouillon', 'ÉB', 'Les Brouillons', true],
  ['prototype', 'François Prototype', 'FP', 'Alliance prototype', false],
  ['ebauche', 'Gabrielle Ébauche-Lemoine', 'GÉ', 'Ébauche commune', false],
  ['gabarit', 'Hugo Gabarit', 'HG', 'Cercle du gabarit', false],
  ['specimen', 'Inès Spécimen', 'IS', 'Spécimen citoyen', true],
  ['temoin', 'Jean-Baptiste Témoin', 'JT', 'Comité des témoins', false],
  ['modele', 'Karim Modèle', 'KM', 'Modèle 2027', false],
  ['echantillon', 'Léa Échantillon', 'LÉ', 'Ligue de l’échantillon', false],
  ['simulacre', 'Maxime Simulacre', 'MS', 'Les Simulacres', false],
  ['canevas', 'Nadia Canevas', 'NC', 'Nouveau canevas', true],
  ['patron', 'Octave Patron', 'OP', 'Association du patron', false],
  ['ersatz', 'Pauline Ersatz', 'PE', 'Ersatz démocratique', false],
  ['factice', 'Quentin Factice', 'QF', 'Parti factice', false],
  ['pastiche', 'Rose Pastiche', 'RP', 'Club du pastiche', true],
  ['esquisse', 'Solène Esquisse-Montclar', 'SE', 'Mouvement pour une esquisse démocratique, solidaire et territoriale', false],
  ['placebo', 'Théo Placebo', 'TP', 'Placebo', false],
]

export const candidates: Candidate[] = PEOPLE.map(([id, name, initials, affiliation, withPhoto], i) => ({
  id,
  name,
  initials,
  affiliation,
  role: i % 3 === 0 ? 'Candidat fictif, pour l’essai de mise en page' : i % 3 === 1 ? 'Personnage inventé, sans mandat' : 'Candidature imaginaire',
  campaignUrl: 'https://example.org/',
  declaredAt: `2026-0${1 + (i % 9)}-1${i % 10}`,
  declaration: { title: 'Déclaration fictive', url: 'https://example.org/', date: '2026-09-01' },
  ...(withPhoto ? { photo: photo(name) } : {}),
}))

const SOURCE = [{ title: 'Source fictive, pour l’essai', url: 'https://example.org/', date: '2026-09-01', publisher: 'example.org' }]
const position = (weight: 1 | 2 | undefined, summary: string): Position => ({
  ...(weight ? { weight } : { rejects: true }),
  nature: 'proposition',
  confidence: 'high',
  summary,
  sources: SOURCE,
})

/** Positions tirées sur la banque de la primaire : déterministes, d'une exécution à l'autre */
function generate(): PositionTable {
  const table: PositionTable = {}
  candidates.forEach((c, k) => {
    // Place sur l'axe imaginaire, de −1 à 1 ; part des positions connues, de 95 % à 55 %
    const axis = -1 + (2 * k) / (candidates.length - 1)
    const known = 0.95 - (k % 5) * 0.1
    const mine: Record<string, Position> = {}
    for (const q of bank.questions) {
      if (c.id === NARROW ? !NARROW_TOPICS.includes(q.topicId) : unit(`${c.id}:${q.id}:connu`) > known) continue
      const target = axis + (unit(`${c.id}:${q.id}:bruit`) - 0.5) * 0.9
      const placed = q.approaches
        .map(a => ({ a, d: Math.abs(-1 + 2 * unit(`${q.id}:${a.id}`) - target) }))
        .sort((x, y) => x.d - y.d)
      const [main, second] = placed
      const far = placed.at(-1)
      if (!main) continue
      mine[main.a.id] = position(2, `${c.name} porte cette approche (position fictive).`)
      if (second && second.d < 0.35 && unit(`${c.id}:${q.id}:compatible`) < 0.5)
        mine[second.a.id] = position(1, `${c.name} la juge compatible (position fictive).`)
      if (far && far !== main && far !== second && unit(`${c.id}:${q.id}:rejet`) < 0.3)
        mine[far.a.id] = position(undefined, `${c.name} la rejette (position fictive).`)
    }
    table[c.id] = mine
  })
  return table
}

export const election: ElectionInfo = {
  id: MANY_ID,
  kind: 'presidentielle',
  name: 'Élection d’essai (20 candidats fictifs)',
  shortName: 'Essai · 20 candidats fictifs',
  organizers: [],
  rounds: [
    { label: '1er tour', start: '2027-04-18T08:00:00+02:00', end: '2027-04-18T20:00:00+02:00' },
    { label: '2nd tour', start: '2027-05-02T08:00:00+02:00', end: '2027-05-02T20:00:00+02:00' },
  ],
  dataVersion: 'essai-1',
  dataFrozenAt: '2026-10-02',
  finalists: null,
  notes: ['Élection factice : candidats, partis et positions sont inventés, pour l’essai de mise en page.'],
  quick: { step1: 8 },
  // La règle de la présidentielle : connu sur moins de la moitié des réponses, hors classement ; et, à titre
  // d'essai, deux candidats non classés
  ranking: {
    minCoverageShare: 0.5,
    excluded: {
      ids: EXCLUDED,
      reason: 'positions connues sur trop peu de questions\u00a0: exclusion d’essai, pour la mise en page',
      since: '2026-10-07',
    },
  },
  copy: {
    theName: 'l’élection d’essai',
    atName: 'à l’élection d’essai',
    independence: {
      footer: 'sans lien avec les candidats fictifs de cet essai',
      method: 'sans lien avec les candidats fictifs de cet essai',
      legal: 'sans lien avec les candidats fictifs de cet essai',
    },
    sources: 'sources fictives, pour l’essai de mise en page',
    closeGapReason: 'Les positions de cet essai sont tirées au hasard',
    step1Reason: 'sont celles de la primaire, reprises pour l’essai',
    officialPageLabel: 'Page fictive',
    shareDescription: 'Élection d’essai, 20 candidats fictifs.',
  },
  revisionTracking: false,
  changelog: [
    { date: '2026-10-06', text: 'Élection factice, pour l’essai de mise en page.' },
    { date: '2026-10-07', text: 'Deux candidats fictifs non classés, pour l’essai de mise en page.' },
  ],
}

export const manyCandidates: ElectionPack = { election, candidates, bank, positions: generate(), topicGroups }
