// Candidats masqués d'une élection (ElectionInfo.hidden) : gardés dans ses données (candidates.ts, positions.ts),
// retirés du pack à un seul endroit, son export (src/elections/<id>/index.ts). Le site (registre), les tests (all.ts) et
// les outils qui chargent le pack ne les voient nulle part : ni fiche, ni position, ni score, ni rang, ni compte. Ils sont
// aussi retirés des non classés (ranking.excluded), où ils reviennent d'eux-mêmes quand on les montre à nouveau.
// N'importe que des types : tools/audit-pack.mjs, qui lit les fichiers du pack sans index.ts, applique la même règle.
import type { ElectionPack } from './types'

export function withoutHidden<P extends Pick<ElectionPack, 'election' | 'candidates' | 'positions'>>(pack: P): P {
  const hidden = new Set(pack.election.hidden ?? [])
  if (!hidden.size) return pack
  const { ranking } = pack.election
  const excluded = ranking?.excluded ? { ...ranking.excluded, ids: ranking.excluded.ids.filter(id => !hidden.has(id)) } : undefined
  return {
    ...pack,
    election: {
      ...pack.election,
      ...(ranking ? { ranking: { ...ranking, excluded: excluded?.ids.length ? excluded : undefined } } : {}),
    },
    candidates: pack.candidates.filter(c => !hidden.has(c.id)),
    positions: Object.fromEntries(Object.entries(pack.positions).filter(([id]) => !hidden.has(id))),
  }
}
