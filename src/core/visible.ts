// Candidats masqués d'une élection (ElectionInfo.hidden) : gardés dans ses données (candidates.ts, positions.ts),
// retirés du pack à un seul endroit, son export (src/elections/<id>/index.ts). Le site (registre), les tests (all.ts) et
// les outils qui chargent le pack ne les voient nulle part : ni fiche, ni position, ni score, ni rang, ni compte. Ils sont
// aussi retirés des non classés (ranking.excluded), où ils reviennent d'eux-mêmes quand on les montre à nouveau, et des
// candidats du journal des données (journal), qui ne garde que leur nombre, entrée par entrée.
// N'importe que des types : tools/audit-pack.mjs, qui lit les fichiers du pack sans index.ts, applique la même règle.
import type { ElectionPack } from './types'

export function withoutHidden<P extends Pick<ElectionPack, 'election' | 'candidates' | 'positions'> & Pick<Partial<ElectionPack>, 'journal'>>(pack: P): P {
  const hidden = new Set(pack.election.hidden ?? [])
  if (!hidden.size) return pack
  // Le journal des données ne garde que leur nombre, entrée par entrée (« et 4 candidats qui ne sont plus présentés »),
  // et combien arrivaient ce jour-là (les causes d'arrivée de core/journal.ts)
  const journal = pack.journal
    ? Object.fromEntries(
        Object.entries(pack.journal).map(([n, { people }]) => {
          const shown = people.filter(p => !hidden.has(p.id))
          const gone = people.filter(p => hidden.has(p.id))
          const arrivals = gone.filter(p => p.causes.some(c => c.cause === 'première-publication' || c.cause === 'nouveau-candidat')).length
          return [n, gone.length ? { people: shown, hidden: { count: gone.length, arrivals } } : { people }]
        }),
      )
    : undefined
  const { ranking } = pack.election
  const joined = ranking?.excluded?.joined
  const excluded = ranking?.excluded
    ? {
        ...ranking.excluded,
        ids: ranking.excluded.ids.filter(id => !hidden.has(id)),
        ...(joined ? { joined: Object.fromEntries(Object.entries(joined).filter(([id]) => !hidden.has(id))) } : {}),
      }
    : undefined
  return {
    ...pack,
    election: {
      ...pack.election,
      ...(ranking ? { ranking: { ...ranking, excluded: excluded?.ids.length ? excluded : undefined } } : {}),
    },
    candidates: pack.candidates.filter(c => !hidden.has(c.id)),
    positions: Object.fromEntries(Object.entries(pack.positions).filter(([id]) => !hidden.has(id))),
    ...(journal ? { journal } : {}),
  }
}
