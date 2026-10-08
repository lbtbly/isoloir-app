// Image d'aperçu des liens (Open Graph) : ce qu'affichent WhatsApp, Signal, iMessage… sous une adresse
// partagée. Rendue avec Playwright depuis du HTML : polices Archivo du paquet (intégrées en data:),
// logo de public/brand recadré sur sa boîte serrée (core/brand.ts). Rien n'est chargé du réseau.
// L'essentiel (logo, accroche, promesse) tient dans le carré central de 630 px, que WhatsApp ou Signal
// découpent pour leurs vignettes compactes ; les côtés portent les bâtons et le rideau de la marque.
// La promesse nomme l'élection par défaut du registre (src/elections/index.ts) : à refaire quand elle change, avec
// la description de l'image dans index.html (vite.config.ts, shareMeta), qui en reprend le texte.
// Usage : node tools/build-og.mjs [sortie.png]   (par défaut public/og.png, 1200 × 630)
import { chromium } from 'playwright-core'
import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DRAPE_ORDER, LOGO, drapeColors, viewBoxOf } from '../src/core/brand.ts'

const W = 1200
const H = 630

// L'élection par défaut : l'entrée du registre dont « slug: '' » suit « id » (comme vite.config.ts), puis ses
// informations (election.ts n'importe que des types : Node l'exécute tel quel)
const registry = readFileSync(new URL('../src/elections/index.ts', import.meta.url), 'utf8')
const defaults = [...registry.matchAll(/\bid: '([a-z0-9-]+)',\s*slug: '([^']*)'/g)].filter(m => m[2] === '').map(m => m[1])
if (defaults.length !== 1) throw new Error(`src/elections/index.ts : ${defaults.length} élection(s) par défaut trouvée(s), une attendue`)
const { election } = await import(new URL(`../src/elections/${defaults[0]}/election.ts`, import.meta.url).href)
const out = process.argv[2] ?? fileURLToPath(new URL('../public/og.png', import.meta.url))

// Couleurs du site (tokens.css) : papier, noir d'imprimerie, et les tons de la réglette
const C = {
  paper: '#ffffff',
  print: '#17191c',
  printSoft: '#4a4f57',
  disagree: '#b44f00',
  neutral: '#636363',
  agree: '#00722e',
}

// Polices : les fichiers latin et latin étendu d'Archivo (axes graisse et largeur)
const files = new URL('../node_modules/@fontsource-variable/archivo/files/', import.meta.url)
const face = (file, range) => `@font-face {
  font-family: 'Archivo Variable';
  font-weight: 100 900;
  font-stretch: 62% 125%;
  src: url(data:font/woff2;base64,${readFileSync(new URL(file, files)).toString('base64')}) format('woff2');
  unicode-range: ${range};
}`
const fonts = [
  face('archivo-latin-wdth-normal.woff2', 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212'),
  face('archivo-latin-ext-wdth-normal.woff2', 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+2C60-2C7F, U+A720-A7FF'),
].join('\n')

// Logo horizontal en couleur, cadré sur sa boîte serrée pour s'aligner sur la marge
const logo = readFileSync(new URL('../public/brand/isoloir-horizontal-color.svg', import.meta.url), 'utf8')
  .trim()
  .replace(/viewBox="[^"]+"/, `viewBox="${viewBoxOf(LOGO.horizontal.bounds)}" class="logo" aria-hidden="true"`)

// Le rideau du logo, en grand, qui sort du bord droit : ses quatre bandes pastel, peintes du bleu au vert
const drapeColorsList = drapeColors('color')
// Cadré sur le seul rideau (du sommet, au coin du fût, jusqu'à la pointe et à l'ourlet)
const drape = `<svg class="drape" viewBox="12 -36 142 142" aria-hidden="true">${DRAPE_ORDER.map(
  k => `<path fill="${drapeColorsList[k]}" d="${LOGO.mark.drape[k]}" />`,
).join('')}</svg>`

// Bâtons de pointage, à l'encre bleu bille : trois groupes de cinq et quatre, comme sur la feuille
const TALLY_INK = '#1f3bb3'
const tallyGroup = (n, x0) =>
  Array.from({ length: Math.min(n, 4) }, (_, k) => `<path d="M${x0 + 8 + k * 13} 6 L${x0 + 9 + k * 13 + (k % 2 ? -1 : 1)} 60" />`).join('') +
  (n >= 5 ? `<path d="M${x0 + 1} 52 L${x0 + 62} 14" />` : '')
const tally = `<svg class="tally" viewBox="0 0 230 66" aria-hidden="true"><g stroke="${TALLY_INK}" stroke-width="4.2" stroke-linecap="round" fill="none">${tallyGroup(5, 0)}${tallyGroup(5, 80)}${tallyGroup(4, 160)}</g></svg>`

// Boucles au stylo, reprises du site : autour d'un mot du titre (film) et autour d'un cran (réglette)
const TITLE_LOOP =
  'M91.8 14.2C79.2 7.7 48.6 6.7 30.9 13.2 12.6 20 12 35.7 29.1 43.9c18 8.7 51.9 7.7 66.9-1.7 13.2-8.3 9.9-21.2-7.2-28.1-11.4-4.6-27.9-5.9-41.7-4.6'
const NOTCH_LOOP =
  'M30.6 9.8C26.4 5.3 16.2 4.6 10.3 9.1 4.2 13.8 4 24.6 9.7 30.3c6 6 17.3 5.3 22.3-1.2 4.4-5.7 3.3-14.6-2.4-19.4-3.8-3.2-9.3-4.1-13.9-3.2'

// Typographie française : espaces insécables avant « : ; ! ? » et à l'intérieur des guillemets
const fr = s => s.replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ')

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<style>
${fonts}
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  width: ${W}px;
  height: ${H}px;
  overflow: hidden;
  background: ${C.paper};
  color: ${C.print};
  font-family: 'Archivo Variable', sans-serif;
  font-kerning: normal;
  -webkit-font-smoothing: antialiased;
}
.og {
  position: relative;
  width: ${W}px;
  height: ${H}px;
  display: grid;
  grid-template-columns: 285px 630px 285px;
}

/* Le carré central : le logo, le double filet, l'accroche et la promesse, centrés */
.center { display: flex; flex-direction: column; align-items: center; padding-top: 46px; text-align: center; }
.logo { display: block; height: 66px; width: auto; }
.rules { align-self: stretch; margin: 20px 0 0; height: 12.5px; border-top: 5px solid ${C.print}; border-bottom: 1.5px solid ${C.print}; }
h1 {
  margin: 34px 0 0;
  font-weight: 850;
  font-stretch: 70%;
  font-size: 100px;
  line-height: 0.94;
  letter-spacing: -0.01em;
}
.mark { position: relative; display: inline-block; }
.mark svg {
  position: absolute;
  left: -14%;
  top: -0.24em;
  width: 128%;
  height: auto;
  aspect-ratio: 120 / 58;
  overflow: visible;
  fill: none;
  stroke: ${C.agree};
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.promise { margin: 26px 0 0; max-width: 30ch; font-size: 25px; line-height: 1.3; color: ${C.printSoft}; }
.promise strong { color: ${C.print}; font-weight: 750; }

/* À gauche : les bâtons et la réglette, à l'encre de la feuille */
.left { display: flex; flex-direction: column; justify-content: center; gap: 34px; padding-left: 56px; }
.tally { width: 190px; height: auto; }
.ruler { width: 190px; }
.ruler svg { display: block; width: 190px; height: 40px; overflow: visible; }
.ruler p { margin: 6px 0 0; font-size: 19px; font-weight: 750; color: ${C.agree}; text-align: right; }

/* À droite : le rideau de la marque, en grand, qui sort du bord */
.right { position: relative; overflow: hidden; }
.drape { position: absolute; left: 34px; top: 132px; width: 400px; height: 400px; }
</style>
</head>
<body>
<div class="og">
  <div class="left" aria-hidden="true">
    ${tally}
    <div class="ruler">
      <svg viewBox="0 0 190 40">
        <g stroke="${C.print}" stroke-width="2.5" fill="none" stroke-linecap="round">
          <path d="M14 20H170" />
          <path d="M14 8V32" />
        </g>
        <circle cx="92" cy="20" r="5" fill="${C.paper}" stroke="${C.print}" stroke-width="2.5" />
        <circle cx="170" cy="20" r="7" fill="${C.agree}" />
        <path d="${NOTCH_LOOP}" transform="translate(146 -4) scale(1.3)" fill="none" stroke="${C.agree}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <p>D’accord</p>
    </div>
  </div>
  <div class="center">
    ${logo}
    <div class="rules"></div>
    <h1>Pointez les<br /><span class="mark">idées<svg viewBox="0 0 120 58" aria-hidden="true"><path d="${TITLE_LOOP}" /></svg></span> qui vous<br />ressemblent.</h1>
    <p class="promise">${fr(`${election.name} : des idées sans le nom des candidats.`)} <strong>Vos réponses restent chez vous.</strong></p>
  </div>
  <div class="right" aria-hidden="true">${drape}</div>
</div>
</body>
</html>`

const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  const loaded = await page.evaluate(() => document.fonts.check('850 100px "Archivo Variable"'))
  if (!loaded) throw new Error('Police Archivo non chargée')
  // Le titre et la promesse doivent tenir dans le carré central (630 px, avec 20 px de blanc de chaque côté)
  const wide = await page.evaluate(() =>
    ['h1', '.promise', '.logo'].map(sel => document.querySelector(sel).getBoundingClientRect()).some(r => r.left < 305 || r.right > 895),
  )
  if (wide) throw new Error('Le carré central déborde : réduire le titre ou la promesse')
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } })
} finally {
  await browser.close()
}
const kb = Math.round(statSync(out).size / 1024)
console.log(`✓ ${out} (${W} × ${H}, ${kb} Ko)`)
if (kb > 300) {
  console.error('✗ plus de 300 Ko : certaines applications n’afficheraient pas l’aperçu')
  process.exitCode = 1
}
