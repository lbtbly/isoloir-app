// Échelle de lecture des pourcentages d'affinité : cinq paliers du rouge au vert, chacun nommé,
// pour que la couleur ne soit jamais le seul indice. Échelle absolue (et non relative au premier) :
// deux candidats proches en points restent proches en couleur.

export interface AffinityBand {
  key: 'tres-proche' | 'proche' | 'mitige' | 'eloigne' | 'tres-eloigne'
  label: string
  /** Borne basse incluse, en points */
  min: number
  /** Couleur d'impression sur le papier jaune de l'affiche (contraste ≥ 4,5:1) */
  poster: string
}

export const AFFINITY_BANDS: AffinityBand[] = [
  { key: 'tres-proche', label: 'Très proche', min: 80, poster: '#00722e' },
  { key: 'proche', label: 'Proche', min: 60, poster: '#4a6a0c' },
  { key: 'mitige', label: 'Mitigé', min: 40, poster: '#55554f' },
  { key: 'eloigne', label: 'Éloigné', min: 20, poster: '#a34500' },
  { key: 'tres-eloigne', label: 'Très éloigné', min: 0, poster: '#b7191c' },
]

export function affinityBand(score: number | null): AffinityBand | null {
  if (score === null) return null
  const s = Math.round(score)
  return AFFINITY_BANDS.find(b => s >= b.min) ?? AFFINITY_BANDS[AFFINITY_BANDS.length - 1]!
}

/** Intervalle lisible d'un palier : « 80 à 100 % » */
export function bandRange(band: AffinityBand): string {
  const i = AFFINITY_BANDS.indexOf(band)
  const max = i === 0 ? 100 : AFFINITY_BANDS[i - 1]!.min - 1
  return `${band.min} à ${max} %`
}
