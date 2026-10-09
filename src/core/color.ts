// Couleurs de carte lisibles : sur la couleur d'un parti, le texte est l'encre ou le blanc, celui des deux qui
// contraste le plus. Si aucun n'atteint 4,5:1 (WCAG AA, petit texte), la couleur est assombrie pas à pas jusqu'à ce
// que le blanc l'atteigne : la teinte du parti reste reconnaissable, le texte reste lisible.

const INK = '#17191c'
const WHITE = '#ffffff'
const AA = 4.5

const channel = (c: number) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function rgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) as [number, number, number]
}

// Hexadécimal « #rrggbb » ; le dièse est ajouté par concat pour ne pas ressembler à une adresse « #… » du site
const toHex = (c: [number, number, number]) => ''.concat('\u0023', ...c.map(v => Math.round(v).toString(16).padStart(2, '0')))

/** Luminance relative (WCAG) */
export function luminance(hex: string): number {
  const [r, g, b] = rgb(hex)
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Rapport de contraste entre deux couleurs (WCAG), de 1 à 21 */
export function contrast(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Fond et texte d'une carte à la couleur donnée, contraste d'au moins 4,5:1 */
export function cardColors(color: string): { bg: string; fg: string } {
  const bg = color.toLowerCase()
  const onWhite = contrast(bg, WHITE)
  const onInk = contrast(bg, INK)
  if (Math.max(onWhite, onInk) >= AA) return { bg, fg: onWhite >= onInk ? WHITE : INK }
  let c = rgb(bg)
  for (let i = 0; i < 40 && contrast(toHex(c), WHITE) < AA; i++) c = c.map(v => v * 0.97) as [number, number, number]
  return { bg: toHex(c), fg: WHITE }
}
