// Images fixes des vidéos « Les sujets » : chaque passage d'une ou plusieurs vidéos, dessiné par la piste du
// site en mouvement réduit (état final), à 390 × 844 (téléphone) et à 1280 × 800 (ordinateur), en clair et en
// sombre ; et, pour chaque vidéo, une planche d'ensemble (tous ses passages en grille) pour un coup d'œil.
// Chaque passage est aussi contrôlé : dessin générique au lieu de sa planche, texte coupé par le bord de la
// scène, dessin qui sort de sa feuille, texte trop petit (moins de 11 px).
//
// Usage : node tools/videos-snap.mjs <dossier> <vidéo|thème|tout>... [options]
//   node tools/videos-snap.mjs .impeccable/videos-snap/sante sante                 (toute la série du thème)
//   node tools/videos-snap.mjs .impeccable/videos-snap/essai retraites-intro logement-loyers --planche
// Options :
//   --planche            les planches d'ensemble seulement (pas une image par passage)
//   --formats a,b        formats : mobile (écran de 390 × 844), desktop (écran de 1280 × 800), et les bornes
//                        de la scène du contrat (types.ts) : petit (scène de 300 × 360), grand (scène de
//                        520 × 560) ; défaut : mobile,desktop
//   --themes a,b         clair, sombre ; défaut : les deux
//   --dpr N              densité des images (1 ; 2 pour zoomer sur un détail)
//   --base URL           serveur de dev (http://localhost:5173/)
// Sorties, dans <dossier> :
//   <vidéo>/<NN>-<format>-<thème>.png          un passage, l'écran entier (onglets, titre, scène, sous-titres,
//                                              et en bas, à la place des commandes, le bilan du contrôle)
//   <vidéo>-planche-<format>-<thème>.png       la vidéo entière, passages en grille, contrôles sous chacun
//   rapport.json                               les contrôles, passage par passage
// Le bilan s'affiche aussi à la fin : une ligne par passage qui a un défaut.
//
// La page dessinée est tools/videos-snap.html (+ videos-snap.page.ts), servie par le serveur de dev de Vite
// seulement (jamais construite ni livrée) : elle rend la piste (PISTE.Frame, PISTE.Segment) sans le lecteur,
// donc sans voix ni son, et ne dépend que du contrat de src/ui/videos/types.ts. Le serveur de dev doit tourner
// (`pnpm dev --port 5173 --strictPort`) ; s'il ne répond pas, le harnais le lance et le laisse tourner.
// Navigateur : Chromium de Playwright, sans écran, son coupé (--mute-audio).

import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../node_modules/playwright-core/index.mjs'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
// Un écran (la scène prend la place qui reste, comme dans le lecteur), ou une scène de taille fixe (« stage »)
const FORMATS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
  petit: { width: 300, height: 800, stage: [300, 360] },
  grand: { width: 520, height: 900, stage: [520, 560] },
}
const THEMES = { clair: 'light', sombre: 'dark' }

function usage(msg) {
  if (msg) console.error(`✗ ${msg}\n`)
  console.error('Usage : node tools/videos-snap.mjs <dossier> <vidéo|thème|tout>... [--planche] [--formats mobile,desktop,petit] [--themes clair,sombre] [--dpr 1] [--base http://localhost:5173/]')
  process.exit(2)
}

const args = process.argv.slice(2)
const opts = { planche: false, formats: ['mobile', 'desktop'], themes: ['clair', 'sombre'], dpr: 1, base: 'http://localhost:5173/' }
const pos = []
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--planche') opts.planche = true
  else if (a === '--formats') opts.formats = (args[++i] ?? '').split(',').filter(Boolean)
  else if (a === '--themes') opts.themes = (args[++i] ?? '').split(',').filter(Boolean)
  else if (a === '--dpr') opts.dpr = Number(args[++i])
  else if (a === '--base') opts.base = args[++i]?.replace(/\/?$/, '/') ?? opts.base
  else if (a === '-h' || a === '--help') usage()
  else if (a.startsWith('--')) usage(`option inconnue : ${a}`)
  else pos.push(a)
}
const [outDir, ...wanted] = pos
if (!outDir || !wanted.length) usage()
for (const f of opts.formats) if (!FORMATS[f]) usage(`format inconnu : ${f} (${Object.keys(FORMATS).join(', ')})`)
for (const t of opts.themes) if (!THEMES[t]) usage(`thème inconnu : ${t} (clair, sombre)`)
if (!(opts.dpr > 0 && opts.dpr <= 3)) usage('--dpr entre 1 et 3')

const PAGE = `${opts.base}tools/videos-snap.html`

async function up() {
  try {
    const r = await fetch(PAGE, { signal: AbortSignal.timeout(3000) })
    return r.ok
  } catch {
    return false
  }
}

// Le serveur de dev : celui qui tourne, sinon on le lance (port fixe ; s'il est pris par un autre lancement
// simultané, ce lancement-ci échoue sans dommage et l'autre sert)
if (!(await up())) {
  const port = new URL(opts.base).port || '5173'
  console.log(`Serveur de dev absent sur ${opts.base} : lancement de « pnpm dev --port ${port} --strictPort » (il reste lancé)`)
  spawn('pnpm', ['dev', '--port', port, '--strictPort'], { cwd: ROOT, detached: true, stdio: 'ignore' }).unref()
  let ok = false
  for (let k = 0; k < 40 && !ok; k++) {
    await new Promise(r => setTimeout(r, 500))
    ok = await up()
  }
  if (!ok) {
    console.error(`✗ ${PAGE} ne répond pas`)
    process.exit(1)
  }
}

const browser = await chromium.launch({ args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] })
const report = { date: new Date().toISOString(), page: PAGE, formats: {}, videos: {} }
const problems = []
const pad = n => String(n + 1).padStart(2, '0')

async function open(format, theme) {
  const { width, height } = FORMATS[format]
  const viewport = { width, height }
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: opts.dpr, colorScheme: THEMES[theme], reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => {
    if (m.type() === 'error') errors.push(m.text())
  })
  await page.goto(PAGE)
  try {
    await page.waitForFunction(() => !!window.__snap, null, { timeout: 30000 })
  } catch {
    throw new Error(`la page de dessin ne se charge pas (${PAGE}) : ${errors.join(' | ') || 'sans message'}`)
  }
  return { ctx, page, errors }
}

try {
  // Les vidéos voulues : un identifiant de vidéo, un thème (toute sa série), ou « tout »
  const first = await open(opts.formats[0], opts.themes[0])
  const catalog = await first.page.evaluate(() => window.__snap.catalog())
  await first.ctx.close()
  const videos = []
  for (const w of wanted) {
    const list =
      w === 'tout'
        ? catalog.flatMap(s => s.videos)
        : (catalog.find(s => s.topicId === w)?.videos ?? catalog.flatMap(s => s.videos).filter(v => v.id === w))
    if (!list.length) {
      const known = catalog.map(s => `${s.topicId} (${s.videos.map(v => v.id).join(', ')})`).join(' ; ')
      usage(`« ${w} » : ni une vidéo ni un thème qui a une série (séries écrites : ${known || 'aucune'})`)
    }
    for (const v of list) if (!videos.some(x => x.id === v.id)) videos.push(v)
  }
  mkdirSync(outDir, { recursive: true })
  console.log(`${videos.length} vidéo(s), ${videos.reduce((n, v) => n + v.n, 0)} passage(s) ; formats ${opts.formats.join(', ')} ; thèmes ${opts.themes.join(', ')} → ${outDir}`)

  for (const format of opts.formats) {
    for (const theme of opts.themes) {
      const { ctx, page, errors } = await open(format, theme)
      for (const v of videos) {
        // Un écran par passage ; la taille de scène qu'il donne sert à la planche d'ensemble
        let size = null
        const checks = []
        for (let i = 0; i < v.n; i++) {
          const c = await page.evaluate(([id, k, forced]) => window.__snap.one(id, k, forced), [v.id, i, FORMATS[format].stage ?? null])
          size ??= c.stage
          checks.push(c)
          if (!opts.planche) {
            mkdirSync(join(outDir, v.id), { recursive: true })
            await page.screenshot({ path: join(outDir, v.id, `${pad(i)}-${format}-${theme}.png`), fullPage: !!FORMATS[format].stage })
          }
        }
        report.formats[format] = { viewport: { width: FORMATS[format].width, height: FORMATS[format].height }, stage: size }
        // La planche d'ensemble : la même taille de scène, en grille
        const cols = Math.min(v.n, size[0] > 450 ? 3 : 4)
        const gridViewport = { width: 40 + cols * size[0] + (cols - 1) * 20, height: FORMATS[format].height }
        await page.setViewportSize(gridViewport)
        await page.evaluate(([id, w, h, n]) => window.__snap.grid(id, w, h, n), [v.id, size[0], size[1], cols])
        await page.screenshot({ path: join(outDir, `${v.id}-planche-${format}-${theme}.png`), fullPage: true })
        await page.setViewportSize({ width: FORMATS[format].width, height: FORMATS[format].height })
        ;(report.videos[v.id] ??= {})[`${format}-${theme}`] = checks
        for (const c of checks) {
          const bad = [
            c.generic ? `dessin générique (${c.error})` : '',
            c.clipped.length ? `coupé : ${c.clipped.join(' ; ')}` : '',
            c.spill.length ? `hors feuille : ${c.spill.join(' ; ')}` : '',
            c.small.length ? `petit : ${c.small.join(' ; ')}` : '',
          ].filter(Boolean)
          if (bad.length) problems.push(`${c.id} [${format}, ${theme}, scène ${c.stage.join('×')}] ${bad.join(' — ')}`)
        }
        console.log(`✓ ${v.id} (${format}, ${theme}) : ${v.n} passage(s), scène ${size.join('×')}`)
      }
      if (errors.length) {
        problems.push(`erreurs de la page (${format}, ${theme}) : ${[...new Set(errors)].join(' | ')}`)
      }
      await ctx.close()
    }
  }
  report.problems = problems
  writeFileSync(join(outDir, 'rapport.json'), JSON.stringify(report, null, 1))
  if (problems.length) {
    console.log(`\n${problems.length} défaut(s) repéré(s) (détail dans ${join(outDir, 'rapport.json')}) :`)
    for (const p of problems) console.log(`  ⚠ ${p}`)
  } else console.log('\nAucun défaut repéré (planches présentes, rien de coupé ni hors feuille, aucun texte trop petit).')
} finally {
  await browser.close()
}
