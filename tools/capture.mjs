// Captures d'écran de revue (Impeccable) : sert dist/ via `vite preview` puis photographie les écrans clés.
// Usage : pnpm build && node tools/capture.mjs [port] [filtre]   (filtre : sous-chaîne des noms de captures)
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const port = Number(process.argv[2] ?? 4317)
const only = process.argv[3] ?? ''
const base = `http://localhost:${port}/`
const out = '.impeccable/review'
const server = spawn('pnpm', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' })
await new Promise(r => setTimeout(r, 1500))

// Profil de démonstration : avis plausibles (d'accord, pas d'accord, lignes rouges) sur la feuille rapide
const bank = (await import('../research/choisir-2027/bank.json', { with: { type: 'json' } })).default.bank
const step1Ids = JSON.parse(readFileSync('research/choisir-2027/decisions.json', 'utf8')).step1
const answers = {}
let i = 0
for (const q of bank.questions.filter(q => q.tier === 'essentiel')) {
  const a = q.approaches
  const ratings = { [a[i % a.length].id]: 1 }
  if (i % 2) ratings[a[(i + 1) % a.length].id] = -1
  if (i % 3 === 0) ratings[a[(i + 2) % a.length].id] = 1
  const redLines = i % 7 === 2 ? [a[(i + 1) % a.length].id] : []
  for (const id of redLines) ratings[id] = -1
  answers[q.id] = { ratings, redLines }
  i++
}
const election = readFileSync('src/elections/choisir-2027/election.ts', 'utf8').match(/dataVersion: '([^']+)'/)[1]
const stateOf = answers => ({ format: 3, electionId: 'choisir-2027', dataVersion: election, seed: '0123456789abcdef', answers, weights: {}, deepTopics: [], lastSeenRanking: null, dataUpdatedFrom: null, updatedAt: new Date().toISOString() })
const state = stateOf(answers)
// Premier dépouillement seulement : les 8 questions du premier temps
const step1State = stateOf(Object.fromEntries(Object.entries(answers).filter(([id]) => step1Ids.includes(id))))

const browser = await chromium.launch()
async function shot(name, path, viewport, { fullPage = true, filled = true, dark = false, offline = false, saved = state } = {}) {
  if (only && !name.includes(only)) return
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  if (filled) await page.addInitScript(s => localStorage.setItem('isoloir:choisir-2027', s), JSON.stringify(saved))
  await page.goto(base + path)
  if (offline) await ctx.setOffline(true)
  // En capture pleine page, la barre fixe apparaîtrait au milieu : on la remet dans le flux
  if (fullPage) await page.addStyleTag({ content: '.action-bar{position:static}' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${out}/${name}.png`, fullPage })
  await ctx.close()
  console.log('✓', name)
}
try {
  await shot('mobile', '#/', { width: 390, height: 844 }, { filled: false })
  await shot('desktop', '#/', { width: 1440, height: 900 }, { filled: false })
  await shot('mobile-sheet', '#/feuille/2', { width: 390, height: 844 }, { fullPage: false })
  await shot('mobile-results', '#/resultats', { width: 390, height: 844 })
  await shot('mobile-proximity', '#/proximite', { width: 390, height: 844 })
  await shot('mobile-share', '#/partager', { width: 390, height: 844 })
  await shot('mobile-sheet-dark', '#/feuille/2', { width: 390, height: 844 }, { fullPage: false, dark: true })
  await shot('desktop-results', '#/resultats', { width: 1440, height: 900 })
  await shot('desktop-sheet', '#/feuille/5', { width: 1440, height: 900 }, { fullPage: false })
  await shot('mobile-privacy', '#/confidentialite', { width: 390, height: 844 }, { filled: false })
  await shot('desktop-privacy', '#/confidentialite', { width: 1440, height: 900 }, { filled: false })
  await shot('user-320-sheet', '#/feuille/5', { width: 320, height: 640 }, { fullPage: false })
  await shot('mobile-results-provisional', '#/resultats', { width: 390, height: 844 }, { saved: step1State })
  await shot('desktop-results-provisional', '#/resultats', { width: 1440, height: 900 }, { fullPage: false, saved: step1State })
  await shot('mobile-sheet-offline', '#/feuille/3', { width: 390, height: 844 }, { fullPage: false, offline: true })
  await shot('desktop-sheet-offline', '#/feuille/3', { width: 1440, height: 900 }, { fullPage: false, offline: true })
  await shot('mobile-home-offline', '#/', { width: 390, height: 844 }, { filled: false, offline: true })
  await shot('desktop-sheet-wide', '#/feuille/11', { width: 1680, height: 1050 }, { fullPage: false })
  await shot('tablet-sheet', '#/feuille/4', { width: 768, height: 1024 }, { fullPage: false })
} finally {
  await browser.close()
  server.kill()
}
