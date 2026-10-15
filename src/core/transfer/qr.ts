// Le QR code d'un code de reprise : le même texte, en mode alphanumérique (l'alphabet de Crockford y tient tout entier),
// correction d'erreurs moyenne (15 %). Dessiné sur l'appareil, sans image distante ni adresse « data: » (bloquée par la
// politique de sécurité du site) : un chemin SVG pour l'écran, des carrés sur un canevas pour l'image PNG.

import encodeQR from 'qr'

/** Les modules du symbole, sans la marge (true : module sombre) */
export function qrModules(code: string): boolean[][] {
  // La bibliothèque ajoute toujours une marge : une seule rangée, retirée ici
  const m = encodeQR(code, 'raw', { ecc: 'medium', encoding: 'alphanumeric', border: 1 })
  return m.slice(1, -1).map(row => row.slice(1, -1))
}

/** Version du symbole (1 à 40) : 21 modules de côté pour la 1, 4 de plus par version */
export const qrVersion = (modules: boolean[][]) => (modules.length - 17) / 4

/** Un chemin SVG d'un seul tenant, une rangée de modules sombres contigus par segment, en unités de module */
export function qrPath(modules: boolean[][], offset = 0): string {
  let d = ''
  modules.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!row[x]) {
        x++
        continue
      }
      const start = x
      while (x < row.length && row[x]) x++
      d += `M${start + offset} ${y + offset}h${x - start}v1h${start - x}z`
    }
  })
  return d
}
