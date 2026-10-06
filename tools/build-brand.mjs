// Fichiers de la marque, générés depuis src/core/brand.ts (seule source de la géométrie et des couleurs) :
// - public/brand/isoloir-{stacked,horizontal,mark}-{color,grey,white}.svg : SVG autonomes, couleurs en dur ;
// - public/favicon.svg : le pictogramme sans ombre, lisible à 16 px, disque éclairci en mode sombre ;
// - public/apple-touch-icon.png (180), public/icon-192.png, public/icon-512.png : pictogramme sur blanc.
// Usage : node tools/build-brand.mjs   (Node 22.18+ ou 23.6+ : brand.ts est importé tel quel)
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { BLANC, DRAPE_ORDER, ENCRE, LOGO, drapeColors, logoSvg } from '../src/core/brand.ts'

const pub = new URL('../public/', import.meta.url)
mkdirSync(new URL('brand/', pub), { recursive: true })
const write = (name, content) => {
  writeFileSync(new URL(name, pub), content)
  console.log('✓', `public/${name}`)
}

// Neuf SVG : trois dispositions, en couleur, en gris, et en blanc (disque et mot blancs, rideau gris)
for (const layout of ['stacked', 'horizontal', 'mark']) {
  write(`brand/isoloir-${layout}-color.svg`, logoSvg(layout, 'color', ENCRE) + '\n')
  write(`brand/isoloir-${layout}-grey.svg`, logoSvg(layout, 'grey', ENCRE) + '\n')
  write(`brand/isoloir-${layout}-white.svg`, logoSvg(layout, 'grey', BLANC) + '\n')
}

// Icône d'onglet : sans l'ombre, qui ne serait qu'une bavure à 16 px ; carré centré sur le disque et le rideau
const mark = LOGO.mark
const colors = drapeColors('color')
const top = -100
const bottom = mark.bounds.y + mark.bounds.height
const left = -100
const right = mark.bounds.x + mark.bounds.width
const side = Math.max(right - left, bottom - top) + 4
const cx = (left + right) / 2
const cy = (top + bottom) / 2
const r = v => Math.round(v * 100) / 100
const favicon = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(cx - side / 2)} ${r(cy - side / 2)} ${r(side)} ${r(side)}">`,
  `<style>.d{fill:${ENCRE}}@media (prefers-color-scheme:dark){.d{fill:#e9eae5}}</style>`,
  `<path class="d" d="${mark.disc}"/>`,
  ...DRAPE_ORDER.map(k => `<path fill="${colors[k]}" d="${mark.drape[k]}"/>`),
  '</svg>',
].join('')
write('favicon.svg', favicon + '\n')

// Icônes PNG : le pictogramme complet (ombre comprise) sur fond blanc, avec une marge qui laisse
// la place aux coins arrondis des écrans d'accueil
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  for (const [name, size, fill] of [
    ['apple-touch-icon.png', 180, 0.76],
    ['icon-192.png', 192, 0.8],
    ['icon-512.png', 512, 0.8],
  ]) {
    const b = mark.bounds
    const span = Math.max(b.width, b.height) / fill
    const vx = b.x + b.width / 2 - span / 2
    const vy = b.y + b.height / 2 - span / 2
    const svg = logoSvg('mark', 'color', ENCRE)
      .replace(/viewBox="[^"]+"/, `viewBox="${r(vx)} ${r(vy)} ${r(span)} ${r(span)}" width="${size}" height="${size}"`)
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`<!doctype html><body style="margin:0;background:#fff">${svg}</body>`)
    await page.screenshot({ path: fileURLToPath(new URL(name, pub)), clip: { x: 0, y: 0, width: size, height: size } })
    console.log('✓', `public/${name}`)
  }
} finally {
  await browser.close()
}
