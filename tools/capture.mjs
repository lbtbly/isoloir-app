// Captures d'écran de revue (Impeccable) : sert dist/ via `vite preview` puis photographie les écrans clés d'une
// élection, feuille vierge ou remplie d'un profil de démonstration.
// Usage : pnpm build && node tools/capture.mjs [port] [filtre] [--election <id>] [--prefix <slug>] [--base <url>]
//   filtre          : sous-chaîne des noms de captures (« results », « candidates »…)
//   --election <id> : l'élection photographiée (par défaut, celle des adresses sans préfixe) ; ses captures vont dans
//                     .impeccable/review/<id>/ quand ce n'est pas l'élection par défaut
//   --prefix <slug> : le préfixe tapé dans les adresses (par défaut, le slug de l'élection dans le registre)
//   --base <url>    : photographier un serveur déjà lancé au lieu de dist/ ; un serveur de développement
//                     (pnpm dev, http://localhost:5173/) montre aussi l'élection factice de 20 candidats :
//                     node tools/capture.mjs --base http://localhost:5173/ --election essai-20
// Le profil de démonstration vient de la banque de l'élection (research/<id>/bank.json, sinon le pack).
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, importSite, loadElection, useSiteModules } from './site-modules.mjs'

const argv = process.argv.slice(2)
const VALUED = ['--election', '--prefix', '--base']
const opt = name => {
  const i = argv.indexOf(name)
  return i < 0 ? null : (argv[i + 1] ?? null)
}
const positional = argv.filter((a, i) => !a.startsWith('--') && !VALUED.includes(argv[i - 1]))
const port = Number(positional.find(a => /^\d+$/.test(a)) ?? 4317)
const only = positional.find(a => !/^\d+$/.test(a)) ?? ''
const external = opt('--base')
const base = external ? external.replace(/\/?$/, '/') : `http://localhost:${port}/`

// L'élection : registre et pack, lus dans le code du site (celui du serveur de développement avec --base)
useSiteModules({ dev: !!external })
const { withBase } = await importSite('src/core/routes.ts')
let site
try {
  site = await loadElection(opt('--election'), opt('--prefix'))
} catch (err) {
  console.error(err.message)
  process.exit(2)
}
const { entry, prefix, pack } = site
const out = entry.slug === '' ? join(ROOT, '.impeccable/review') : join(ROOT, '.impeccable/review', entry.id)
mkdirSync(out, { recursive: true })
/** L'adresse d'une page de l'élection */
const at = path => withBase(prefix, path)

// Profil de démonstration : avis plausibles (d'accord, pas d'accord, lignes rouges) sur la feuille rapide
const researchBank = join(ROOT, 'research', entry.id, 'bank.json')
const bank = existsSync(researchBank) ? JSON.parse(readFileSync(researchBank, 'utf8')).bank : pack.bank
const step1Ids = bank.questions.filter(q => q.step === 1).map(q => q.id)
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
const storageKey = `isoloir:${entry.id}`
const stateOf = answers => ({ format: 3, electionId: entry.id, dataVersion: pack.election.dataVersion, seed: '0123456789abcdef', answers, weights: {}, deepTopics: [], lastSeenRanking: null, dataUpdatedFrom: null, updatedAt: new Date().toISOString() })
const state = stateOf(answers)
// Premier dépouillement seulement : les questions du premier temps
const step1State = stateOf(Object.fromEntries(Object.entries(answers).filter(([id]) => step1Ids.includes(id))))

const server = external ? null : spawn('pnpm', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', cwd: ROOT })
if (server) await new Promise(r => setTimeout(r, 1500))

// Jamais de son pendant les captures : la machine est celle du propriétaire
const browser = await chromium.launch({ args: ['--mute-audio'] })
async function shot(name, path, viewport, { fullPage = true, filled = true, dark = false, offline = false, saved = state } = {}) {
  if (only && !name.includes(only)) return
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, colorScheme: dark ? 'dark' : 'light', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  if (filled) await page.addInitScript(([k, s]) => localStorage.setItem(k, s), [storageKey, JSON.stringify(saved)])
  await page.goto(base + at(path))
  if (offline) await ctx.setOffline(true)
  // En capture pleine page, la barre fixe apparaîtrait au milieu : on la remet dans le flux
  if (fullPage) await page.addStyleTag({ content: '.action-bar{position:static}' })
  await page.waitForTimeout(900)
  await page.screenshot({ path: join(out, `${name}.png`), fullPage })
  await ctx.close()
  console.log('✓', name)
}
try {
  console.log(`Élection ${entry.id} (${at('/')}), captures dans ${out}`)
  await shot('mobile', '/', { width: 390, height: 844 }, { filled: false })
  await shot('desktop', '/', { width: 1440, height: 900 }, { filled: false })
  await shot('mobile-sheet', '/feuille/2', { width: 390, height: 844 }, { fullPage: false })
  await shot('mobile-results', '/resultats', { width: 390, height: 844 })
  await shot('mobile-proximity', '/proximite', { width: 390, height: 844 })
  await shot('mobile-share', '/partager', { width: 390, height: 844 })
  await shot('mobile-sheet-dark', '/feuille/2', { width: 390, height: 844 }, { fullPage: false, dark: true })
  await shot('desktop-results', '/resultats', { width: 1440, height: 900 })
  await shot('desktop-sheet', '/feuille/5', { width: 1440, height: 900 }, { fullPage: false })
  await shot('mobile-privacy', '/confidentialite', { width: 390, height: 844 }, { filled: false })
  await shot('desktop-privacy', '/confidentialite', { width: 1440, height: 900 }, { filled: false })
  await shot('user-320-sheet', '/feuille/5', { width: 320, height: 640 }, { fullPage: false })
  await shot('mobile-results-provisional', '/resultats', { width: 390, height: 844 }, { saved: step1State })
  await shot('desktop-results-provisional', '/resultats', { width: 1440, height: 900 }, { fullPage: false, saved: step1State })
  await shot('mobile-sheet-offline', '/feuille/3', { width: 390, height: 844 }, { fullPage: false, offline: true })
  await shot('desktop-sheet-offline', '/feuille/3', { width: 1440, height: 900 }, { fullPage: false, offline: true })
  await shot('mobile-home-offline', '/', { width: 390, height: 844 }, { filled: false, offline: true })
  await shot('desktop-sheet-wide', '/feuille/11', { width: 1680, height: 1050 }, { fullPage: false })
  await shot('tablet-sheet', '/feuille/4', { width: 768, height: 1024 }, { fullPage: false })
  // Une élection nombreuse : l'accueil, la liste des candidats et les résultats à trois largeurs
  await shot('tablet', '/', { width: 768, height: 1024 }, { filled: false })
  await shot('mobile-candidates', '/candidats', { width: 390, height: 844 }, { filled: false })
  await shot('tablet-candidates', '/candidats', { width: 768, height: 1024 }, { filled: false })
  await shot('desktop-candidates', '/candidats', { width: 1280, height: 800 }, { filled: false })
  await shot('tablet-results', '/resultats', { width: 768, height: 1024 })
  await shot('desktop-1280-results-dark', '/resultats', { width: 1280, height: 800 }, { dark: true })
} finally {
  await browser.close()
  server?.kill()
}
