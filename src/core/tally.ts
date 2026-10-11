// Bâtons de pointage : le tracé de chaque bâton, partagé par l'écran (components/Tally.tsx, la progression de la
// tendance dans les résultats) et le dépouillement en PDF, pour que le papier montre le même trait que la page.
// Un paquet de cinq tient dans une boîte de 30 × 26 unités : quatre bâtons verticaux, le cinquième barre le paquet.

/** Variation déterministe, pour que chaque bâton ait l'air tracé à la main */
export function jitter(i: number, k: number): number {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 1.4
}

/**
 * Bâton n° i (à partir de 0), en unités de la boîte de son paquet, décalé de x vers la droite : [x1, y1, x2, y2].
 * Le décalage est ajouté en premier, comme l'écran l'a toujours fait : mêmes nombres, au dernier chiffre près.
 */
export function tallyStroke(i: number, x = 0): [number, number, number, number] {
  const k = i % 5
  return k < 4
    ? [x + 4 + k * 6 + jitter(i, 1), 3 + jitter(i, 2), x + 4.4 + k * 6 + jitter(i, 3), 23 + jitter(i, 4)]
    : [x + 0.8 + jitter(i, 5), 19.5 + jitter(i, 6), x + 28.5 + jitter(i, 7), 6 + jitter(i, 8)]
}

/** Le même bâton en chemin SVG (« M x1 y1 L x2 y2 ») */
export function tallyPath(i: number, x = 0): string {
  const [x1, y1, x2, y2] = tallyStroke(i, x)
  return `M${x1} ${y1} L${x2} ${y2}`
}
