// Découpe les dossiers de recherche par groupe de thèmes pour les agents de conception.
// Usage : node tools/split-research.mjs research/choisir-2027
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
const GROUPS = {
  strategie_institutions: ['strategie', 'institutions'],
  economie: ['fiscalite', 'travail_salaires', 'industrie_economie'],
  social: ['retraites', 'sante', 'education', 'logement'],
  ecologie: ['ecologie_energie', 'agriculture', 'territoires'],
  monde: ['europe', 'international_defense'],
  societe: ['immigration', 'laicite_republique', 'securite_justice', 'numerique', 'societe'],
}
const dossiers = readdirSync(dir).filter(f => f.startsWith('dossier_')).map(f => JSON.parse(readFileSync(join(dir, f), 'utf8')))
const cleav = JSON.parse(readFileSync(join(dir, 'cleavages+debates.json'), 'utf8'))
mkdirSync(join(dir, 'groups'), { recursive: true })
for (const [g, topics] of Object.entries(GROUPS)) {
  const out = {
    group: g,
    topics,
    candidates: dossiers.map(d => ({
      candidate: d.candidate,
      affiliation: d.affiliation,
      overview: d.overview,
      distinctive_vs_others: d.distinctive_vs_others,
      signature_proposals: d.signature_proposals.filter(s => topics.includes(s.topic_id)),
      topics: d.topics.filter(t => topics.includes(t.topic_id)),
    })),
    cleavages: cleav.cleavages.filter(c => topics.includes(c.topic_id)),
    consensus: cleav.consensus_points.filter(c => topics.includes(c.topic_id)),
    debates: cleav.debates,
  }
  writeFileSync(join(dir, 'groups', `${g}.json`), JSON.stringify(out, null, 2))
  const n = out.candidates.reduce((a, c) => a + c.topics.reduce((x, t) => x + t.positions.length, 0), 0)
  console.log(g, 'positions:', n, 'cleavages:', out.cleavages.length, 'candidates:', out.candidates.length)
}
