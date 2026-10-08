// Test de bout en bout « Fermez l'isoloir » : on charge la page, on coupe le réseau, et tout doit
// marcher jusqu'au bout (première tendance, suite du questionnaire, résultats, image, double), y compris un
// rechargement de la page sans réseau. Aucune requête ne doit viser un autre site.
// Contrôles annexes : accueil (film en héros, appel dans l'en-tête), anonymat des questions pas encore vues,
// tendance sans verdict, « Sans avis » entouré, légende de « Qui porte quoi », accords et désaccords par
// candidat, étoile de priorité dans la grille par thème, comparaison de candidats (plateau, adresse, tableau en
// colonnes et en-tête collant aligné, thème déplié, filtres des différences et des oppositions, au téléphone et en grand écran), menu de l'en-tête (téléphone et grand écran), pied
// de page commun (liens vers la méthode et les notices, absents de l'en-tête), page « Les sujets » (toutes les fiches et leurs graphiques, sans approche ni candidat), graphique du contexte
// d'une question, en-tête identique partout (même hauteur à chaque largeur, sans nom de page), rien en largeur à 768 px, sommaire des sujets en
// défilement doux, vidéos des sujets (page « Les sujets en vidéo » et entrée du menu, séries, repère, sommaire,
// catégories, commande « Son » sans choix de voix, pas d'appel à donner son avis sur le site, entrées de « Les
// sujets », vidéo liée à une question ouverte par-dessus la feuille, adresses #/videos/<vidéo> et #/essai-videos,
// aucun son demandé sans voix inscrite, sous-titres seuls hors ligne), mention « rédigé par IA » (accueil,
// première question, « Les sujets », fiche candidat, page des vidéos, lecteur vidéo), réglette, film et sujets avec un texte
// agrandi (dont le focus jamais masqué), feuille enregistrée sous la clé de l'élection seule. Élections
// archivées (s'il y en a dans le registre), avec une horloge simulée : bandeau d'archive (pendant et après le
// vote), encart de l'accueil de l'élection par défaut, ancien lien #/candidat/<id> mené à l'archive.
//
// Usage : pnpm build && node tools/e2e-offline.mjs [port] [--pack <id>] [--prefix <slug>]
//   --pack <id>     : l'élection à parcourir (par défaut, celle du registre sans préfixe : src/elections/index.ts)
//   --prefix <slug> : le préfixe tapé dans les adresses (par défaut, le slug de l'élection dans le registre ; un
//                     alias ou l'identifiant de l'élection par défaut sont corrigés par le site, et le contrôle
//                     porte alors aussi sur cette correction)
//   Exemples : node tools/e2e-offline.mjs ; node tools/e2e-offline.mjs 4321 --pack choisir-2027 --prefix primaire
// Tout le reste vient des données : research/<id>/bank.json (questions, temps, question de fin, fiches),
// research/<id>/decisions.json (contrôle croisé du premier dépouillement), et le pack lui-même (candidats,
// familles de thèmes, périmètre vidéo, dates), lu avec le registre par Node (TypeScript sans compilation, Node 22.18+).
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, importSite, loadElection, useSiteModules } from './site-modules.mjs'

// ——— Arguments ———
const argv = process.argv.slice(2)
const VALUED = ['--pack', '--prefix']
const opt = name => {
  const i = argv.indexOf(name)
  return i < 0 ? null : (argv[i + 1] ?? null)
}
const port = Number(argv.find((a, i) => /^\d+$/.test(a) && !VALUED.includes(argv[i - 1])) ?? 4320)

// ——— Les données, lues dans le code du site (registre, pack, séries vidéo), tel que le build le livre ———
useSiteModules()
const { withBase } = await importSite('src/core/routes.ts')
let site
try {
  site = await loadElection(opt('--pack'), opt('--prefix'))
} catch (err) {
  console.error(err.message)
  process.exit(2)
}
const { ELECTIONS, defaultEntry, entry, prefix, pack } = site
const readJson = rel => JSON.parse(readFileSync(join(ROOT, rel), 'utf8'))
const researchBank = readJson(`research/${entry.id}/bank.json`)
const bankFile = researchBank.bank
const decisions = existsSync(join(ROOT, `research/${entry.id}/decisions.json`)) ? readJson(`research/${entry.id}/decisions.json`) : {}

const base = `http://localhost:${port}/`
/** L'adresse d'une page de l'élection, telle que le site l'écrit dans ses liens (préfixe canonique) */
const L = path => withBase(entry.slug, path)
/** L'adresse à visiter, avec le préfixe demandé (le site corrige un alias en slug) */
const U = path => base + withBase(prefix, path)
const HOME = prefix ? U('/') : base

// Ce que l'on attend, tiré des données
const quickQs = bankFile.questions.filter(q => q.tier === 'essentiel')
const QUICK = quickQs.length
const step1Qs = quickQs.filter(q => q.step === 1)
const STEP1 = step1Qs.length
/** La question qui ferme le premier dépouillement, s'il y en a une (primaire : celle sur LFI) */
const closingQ = step1Qs.find(q => q.last) ?? null
const N = pack.candidates.length
/** Candidats notés : hors les non classés de l'élection (election.ranking.excluded), sans score ni rang nulle part */
const EXCLUDED = new Set(pack.election.ranking?.excluded?.ids ?? [])
const NS = pack.candidates.filter(c => !EXCLUDED.has(c.id)).length
const STORAGE = `isoloir:${entry.id}`
/** Un candidat avec une fiche complète (parcours) : la page « candidat » de référence */
const FICHE = pack.candidates.find(c => c.bio?.length) ?? pack.candidates[0]
const pad = n => String(n).padStart(2, '0')
const groups = pack.topicGroups ?? pack.bank.topics.map(t => ({ id: t.id, label: t.label, topicIds: [t.id] }))
const cardsOf = g => g.topicIds.filter(id => pack.bank.questions.some(q => q.topicId === id)).length
const CARDS = groups.reduce((t, g) => t + cardsOf(g), 0)
/** La famille qui a le moins de fiches : le filtre doit n'en laisser que celles-là */
const SMALL = groups.filter(g => cardsOf(g) > 0).sort((a, b) => cardsOf(a) - cardsOf(b))[0]
const surname = name => name.split(' ').slice(1).join(' ')
const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Séries vidéo montrées pour cette élection : toutes celles de ses thèmes, ou celles de son périmètre (videoScope)
const seriesDir = join(ROOT, 'src/ui/videos/series')
const allSeries = []
for (const f of readdirSync(seriesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts')) {
  const mod = await importSite(`src/ui/videos/series/${f}`)
  const s = Object.values(mod).find(v => v && typeof v === 'object' && typeof v.topicId === 'string' && Array.isArray(v.videos))
  if (s?.videos.length) allSeries.push(s)
}
const scope = pack.videoScope ?? null
/** Un périmètre vide (présidentielle, en attendant la mise à jour des séries) : ni page, ni entrée de menu, ni lien */
const VIDEOS_SHOWN = !scope || Object.keys(scope.topics).length > 0
const topicLabel = id => pack.bank.topics.find(t => t.id === id)?.label
const SERIES = allSeries
  .map(s => ({ s, topic: scope ? scope.topics[s.topicId] : s.topicId }))
  .filter(({ topic }) => topic && topicLabel(topic))
  .map(({ s, topic }) => ({
    ...s,
    topic,
    // Libellé du repère : celui de la série, ou celui du thème de l'élection (périmètre réétiqueté)
    labels: [...new Set([s.label, topicLabel(topic)])],
    deepQuestions: s.videos.filter(v => v.kind === 'deep').flatMap(v => v.questionIds.map(q => (scope ? scope.questions[q] : q)).filter(Boolean)),
  }))
const deepLinked = new Set(SERIES.flatMap(s => s.deepQuestions))
// Deux séries de référence : Retraites et Logement si l'élection les montre, sinon les premières assez longues
const pickSeries = (prefer, min, not) => SERIES.find(s => s.topicId === prefer && s.videos.length >= min) ?? SERIES.find(s => s.videos.length >= min && s !== not)
const SA = pickSeries('retraites', 3)
const SB = pickSeries('logement', 2, SA)
/** Repère d'une vidéo (« Retraites · 1 sur 4 — Âge de départ »), avec chacun des libellés possibles de la série */
const marks = (s, v) => {
  const deep = s.videos.filter(x => x.kind === 'deep')
  const place = v.kind === 'intro' ? v.short : `${deep.indexOf(v) + 1} sur ${deep.length} — ${v.short}`
  return s.labels.map(l => `${l} · ${place}`)
}
const flat = s => (s ?? '').replace(/\u00ad/g, '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
const isMark = (got, s, v) => marks(s, v).includes(flat(got))

const server = spawn('pnpm', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore', cwd: ROOT })
await new Promise(r => setTimeout(r, 1500))

const failures = []
const heading = async (page, name) => {
  try {
    await page.getByRole('heading', { name, exact: true }).waitFor({ timeout: 4000 })
    return true
  } catch {
    console.log(`  (titre trouvé : ${await page.locator('h1').first().textContent().catch(() => 'aucun')}, ${page.url()})`)
    return false
  }
}
const check = (ok, msg) => {
  console.log(`${ok ? '✓' : '✗'} ${msg}`)
  if (!ok) failures.push(msg)
}
const hashOf = page => decodeURI(new URL(page.url()).hash)

console.log(`Élection ${entry.id}${entry.slug ? ` (#/${entry.slug}/…)` : ' (par défaut, #/…)'}${prefix !== entry.slug ? `, visitée par #/${prefix}/…` : ''} : ${N} candidats, ${QUICK} questions rapides dont ${STEP1} au premier dépouillement`)

// 0. Les données lues ici sont celles du site : bank.json (research) et le pack (src) disent la même chose
{
  const ids = qs => qs.map(q => `${q.id}:${q.tier}:${q.step ?? '-'}:${q.last ? 'L' : ''}`).sort().join(' ')
  const same = ids(bankFile.questions) === ids(pack.bank.questions)
  const step1Ok = !decisions.step1 || [...decisions.step1].sort().join(' ') === step1Qs.map(q => q.id).sort().join(' ')
  const lastOk = !decisions.lastInStep || !closingQ || decisions.lastInStep.includes(closingQ.id)
  // Mêmes candidats publiés, chacun avec les mêmes approches
  const table = t => Object.entries(t ?? {}).map(([c, ps]) => `${c}:${Object.keys(ps).sort().join(',')}`).sort().join(' ')
  const positionsOk = table(researchBank.positions) === table(pack.positions) && Object.keys(pack.positions).sort().join(' ') === pack.candidates.map(c => c.id).sort().join(' ')
  check(
    same && step1Ok && lastOk && positionsOk,
    `données : research/${entry.id}/bank.json et le pack concordent (questions ${same}, candidats ${positionsOk}), premier dépouillement conforme à decisions.json (${step1Ok}${closingQ ? `, « ${closingQ.id} » en dernier ${lastOk}` : ''})`,
  )
}

// Jamais de son pendant les essais : la machine est celle du propriétaire
const browser = await chromium.launch({ args: ['--mute-audio'] })
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const foreign = []
  page.on('request', r => {
    const u = r.url()
    if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) foreign.push(u)
  })

  // 1. En ligne : la page se charge et la copie hors ligne s'installe
  await page.goto(HOME)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
  check(await page.evaluate(() => !!navigator.serviceWorker.controller), 'la copie hors ligne contrôle la page')
  if (prefix !== entry.slug) {
    await page.waitForFunction(h => location.hash === h, L('/'), { timeout: 3000 }).catch(() => null)
    check(hashOf(page) === L('/'), `adresse corrigée : #/${prefix}/ devient ${L('/')} (${hashOf(page)})`)
  }

  // 1 bis. Accueil au premier passage : le film fait tout le héros, l'en-tête porte l'appel principal
  await page.locator('.home-film .film-stage').waitFor()
  const firstCta = await page.locator('.header-cta').getAttribute('href').catch(() => null)
  const homeBars = await page.locator('.action-bar').count()
  check(firstCta === L('/feuille/1') && homeBars === 0, `accueil : l’en-tête mène à la question 1, pas de barre d’actions en bas (${firstCta}, ${homeBars} barre)`)
  // Mouvement réduit (réglage du contexte) : le film ne démarre pas, chaque chapitre montre son image fixe
  const playing = await page.locator('.film-scene.is-play').count()
  const playLabel = ((await page.locator('.film-play').textContent().catch(() => '')) ?? '').trim()
  check(playing === 0 && playLabel.includes('Lire le film'), `mouvement réduit : le film ne joue pas, le bouton propose « ${playLabel} »`)
  await page.locator('.film-chapter').nth(2).click()
  await page.waitForFunction(() => document.querySelectorAll('.film-chapter')[2]?.getAttribute('aria-current') === 'step', null, { timeout: 2000 }).catch(() => null)
  const current = await page.locator('.film-chapter[aria-current="step"]').evaluateAll(bs => bs.map(b => [...b.parentElement.parentElement.children].indexOf(b.parentElement)))
  const stillPlaying = await page.locator('.film-scene.is-play').count()
  check(current.length === 1 && current[0] === 2 && stillPlaying === 0, `film : le chapitre 3 choisi devient l’étape en cours, en image fixe (chapitres marqués : ${current.map(i => i + 1).join(', ') || 'aucun'})`)

  // 1 ter. Marque : le logo de l'en-tête porte le nom du site ; icônes et aperçu des liens sont servis par le site
  const brandName = await page.locator('.form-header .brand').getAttribute('aria-label')
  const logoShown = await page.locator('.form-header .brand .logo-horizontal').isVisible()
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
  const served = await Promise.all(['favicon.svg', 'apple-touch-icon.png', 'og.png'].map(f => page.request.get(base + f).then(r => r.ok())))
  check(brandName === 'Isoloir' && logoShown && ogImage === 'https://isoloir.vercel.app/og.png' && served.every(Boolean), `marque : logo dans l’en-tête (« ${brandName} »), icônes et aperçu servis (${served.join(', ')})`)

  // 2. Mode avion
  await ctx.setOffline(true)
  await page.waitForTimeout(200)
  check(await page.locator('.curtain').isVisible(), 'le rideau « Isoloir fermé » tombe sous l’en-tête')

  // 2 bis. Accueil, hors ligne : un avis dans le panneau 1 recompte le panneau 2 et réimprime l'affiche du panneau 3
  await page.goto(HOME)
  await page.locator('.journey .approaches > li').nth(1).locator('.cran').nth(2).click()
  await page.locator('.jr-row').first().waitFor()
  const leaderName = (await page.locator('.jr-row .jr-name').first().textContent())?.trim()
  const posterFirst = (await page.locator('.poster-list li .poster-name').first().textContent())?.trim()
  check(leaderName === 'Candidat 2' && posterFirst === 'Candidat 2', `parcours de l’accueil : « D’accord » sur B place le candidat fictif 2 en tête, sur l’affiche aussi (${leaderName}, ${posterFirst})`)

  // 2 ter. Les candidats : la liste et une page, avec leurs positions et leurs sources
  await page.goto(U('/candidats'))
  await page.locator('.people-panel').first().waitFor()
  check((await page.locator('.people-panel').count()) === N, `la page « Les candidats » liste les ${N} candidats`)
  await page.locator('.people-panel-link').first().click()
  await page.locator('.position-row').first().waitFor()
  const shownId = decodeURIComponent(hashOf(page).split('/').pop() ?? '')
  const shownKnown = Object.keys(pack.positions[shownId] ?? {}).length
  const sourceLinks = await page.locator('.position-row .source-links a').count()
  check(sourceLinks >= Math.min(11, shownKnown) && sourceLinks > 0, `une page candidat montre ses positions avec leurs sources (${shownId} : ${sourceLinks} liens pour ${shownKnown} positions)`)

  // 2 ter bis. Comparer (hors ligne, comme tout le reste) : deux cases « Comparer » cochées dans la liste, le
  // plateau « Comparer (2) » ; « Voir la comparaison » ouvre #/comparer/<a>,<b> dans l'ordre du choix. Un vrai
  // tableau : une colonne par candidat (en-têtes de colonne), une ligne par question (en-tête de ligne : la question
  // et sa lecture en toutes lettres), une case par candidat ; aucun code de paire (« OF·RG ») ; l'en-tête des colonnes
  // reste collé et aligné sur les cases en défilant ; un thème déplié montre les résumés (étiquette IA) et les sources ;
  // « Seulement les différences » ne garde que des lignes où tous ne portent pas la même approche (points communs,
  // approches différentes, opposition) ; un cinquième
  // candidat est refusé, et le dit ; rien ne déborde à 390 px.
  if (N >= 2) {
    await page.goto(U('/candidats'))
    await page.locator('.people-panel .compare-toggle').first().waitFor()
    const toggles = page.locator('.people-panel .compare-toggle')
    const picked = []
    for (const i of [0, 1]) {
      await toggles.nth(i).click()
      picked.push(await page.locator('.people-panel').nth(i).locator('.people-panel-link').getAttribute('href').then(h => decodeURI(h ?? '').split('/').pop()))
    }
    const trayTitle = flat(await page.locator('.tray-title').textContent().catch(() => ''))
    const pressed = await toggles.evaluateAll(bs => bs.filter(b => b.getAttribute('aria-pressed') === 'true').length)
    // Plateau plein : le cinquième est refusé, avec un message visible
    let refused = 'sans objet'
    if (N > 4) {
      for (const i of [2, 3]) await toggles.nth(i).click()
      await toggles.nth(4).click({ force: true })
      const notice = flat(await page.locator('.tray-notice').textContent().catch(() => ''))
      const still = await toggles.evaluateAll(bs => bs.filter(b => b.getAttribute('aria-pressed') === 'true').length)
      refused = still === 4 && (await toggles.nth(4).getAttribute('aria-disabled')) === 'true' && /retirez-en un/.test(notice) ? 'oui' : `non (${still}, « ${notice} »)`
      for (const i of [3, 2]) await toggles.nth(i).click()
    }
    await page.locator('.tray-go').click()
    await heading(page, 'Comparer')
    const target = L(`/comparer/${picked.join(',')}`)
    const landed = hashOf(page)
    const columns = await page.locator('.cmp-card').count()
    const candidatesCurrent = await page.locator(`.main-nav a[href="${L('/candidats')}"], .menu-panel a[href="${L('/candidats')}"]`).first().getAttribute('aria-current')
    // Le tableau : en-têtes de colonne (les candidats), une ligne par question de la banque, une case par candidat
    const table = page.getByRole('table')
    await table.waitFor()
    const colHeads = await table.getByRole('columnheader').evaluateAll(hs => hs.filter(h => h.getAttribute('scope') === 'col').length)
    const rows = await page.locator('.cmp-topic .cmp-row').count()
    const cells = await page.locator('.cmp-topic .cmp-row > td').count()
    const named = await page.locator('.cmp-topic .cmp-row .cmp-rowhead .rel-word').evaluateAll(ws => ws.length > 0 && ws.every(w => (w.textContent ?? '').trim().length > 2))
    const said = await page.locator('.cmp-topic .cmp-row > td').evaluateAll(tds => tds.every(td => (td.textContent ?? '').trim().length > 0))
    const coded = /\b[A-ZÉ]{2}·[A-ZÉ]{2}\b/.test(await page.locator('.cmp').innerText())
    // Défilement : l'en-tête des colonnes reste sous l'en-tête du site, aligné sur les cases
    await page.locator('.cmp-topic .cmp-row').nth(Math.min(6, rows - 1)).scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, 300))
    const sticky = await page.evaluate(() => {
      const head = document.querySelector('.cmp-table thead')?.getBoundingClientRect()
      const bar = document.querySelector('.form-header')?.getBoundingClientRect()
      const ths = [...document.querySelectorAll('.cmp-table thead th[scope="col"]')].map(t => t.getBoundingClientRect())
      const row = [...document.querySelectorAll('.cmp-topic .cmp-row')].find(r => r.getBoundingClientRect().top > (head?.bottom ?? 0))
      const tds = row ? [...row.querySelectorAll('td')].map(t => t.getBoundingClientRect()) : []
      const off = ths.length === tds.length ? Math.max(...ths.map((t, i) => Math.abs(t.left - tds[i].left) + Math.abs(t.width - tds[i].width))) : 999
      return { top: Math.round((head?.top ?? 0) - (bar?.bottom ?? 0)), off: Math.round(off) }
    })
    // Un thème déplié : les résumés (rédigés par IA, étiquetés) et les sources, dans la case de chacun
    const firstTopic = page.locator('.cmp-topic-toggle').first()
    await firstTopic.click()
    const expanded = await firstTopic.getAttribute('aria-expanded')
    const open = page.locator('.cmp-topic.is-open').first()
    const labelled = await open.locator('.ai-label').first().isVisible().catch(() => false)
    const summaries = await open.locator('.cmp-details .cmp-summary').count()
    const sourced = await open.locator('.cmp-details .source-links a').count()
    // Seulement les différences
    await page.getByRole('button', { name: 'Seulement les différences' }).click()
    const kinds = await page.locator('.cmp-topic .cmp-row').evaluateAll(rs => rs.map(r => [...r.classList].find(c => c.startsWith('kind-'))))
    const onlyDiff = kinds.length > 0 && kinds.length <= rows && kinds.every(k => k === 'kind-close' || k === 'kind-mixed' || k === 'kind-different' || k === 'kind-opposed')
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    check(
      trayTitle.startsWith('Comparer (2)') && pressed === 2 && (refused === 'oui' || refused === 'sans objet') && landed === target && columns === 2 && candidatesCurrent === 'true' && colHeads === 2 && rows === pack.bank.questions.length && cells === rows * 2 && named && said && !coded && Math.abs(sticky.top) <= 6 && sticky.off <= 1 && expanded === 'true' && labelled && summaries > 0 && sourced > 0 && onlyDiff && wide <= 0,
      `comparer : plateau « ${trayTitle} », cinquième refusé ${refused}, ${landed} (attendu ${target}), ${columns} colonnes, « Les candidats » marqué ${candidatesCurrent} ; tableau : ${colHeads} en-têtes de colonne, ${rows} lignes (banque : ${pack.bank.questions.length}), ${cells} cases toutes remplies ${said}, lectures nommées ${named}, codes de paire ${coded ? 'présents' : 'absents'} ; en-tête collant à ${sticky.top}px de l’en-tête du site, décalage des colonnes ${sticky.off}px ; déplié ${expanded} : étiquette IA ${labelled}, ${summaries} résumés, ${sourced} sources ; « Seulement les différences » : ${kinds.length} lignes où tous ne portent pas la même approche ${onlyDiff} ; débordement ${wide}px`,
    )
    // On vide le plateau (chaque vignette retire son candidat) : la suite retrouve la barre ordinaire
    await page.goto(U('/candidats'))
    while (await page.locator('.tray-chip').count()) await page.locator('.tray-chip').first().click()
  }

  // 2 quater. Menu de l'en-tête, sur téléphone : le bouton ouvre le panneau ; Échap (le focus revient au
  // bouton), un clic ailleurs ou un lien suivi le referment ; ses liens mènent aux sujets et aux candidats
  await page.goto(U('/candidats'))
  const menuToggle = page.locator('.menu-toggle')
  const menuPanel = page.locator('#menu-principal')
  const menuState = async () => ((await menuToggle.getAttribute('aria-expanded')) === 'true') === (await menuPanel.isVisible())
  // Les écouteurs du panneau (Échap, clic ailleurs) s'installent après l'affichage : on laisse passer deux images
  const settle = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r)))))
  const openMenu = async () => {
    await menuToggle.click()
    await settle()
  }
  await openMenu()
  const menuOpened = (await menuToggle.getAttribute('aria-expanded')) === 'true' && (await menuState())
  const menuLinks = await menuPanel.locator('a').evaluateAll(as => as.map(a => `${a.querySelector('.menu-panel-label')?.textContent} ${a.getAttribute('href')}`))
  await page.keyboard.press('Escape')
  const escClosed =
    (await menuToggle.getAttribute('aria-expanded')) === 'false' && (await menuState()) && (await menuToggle.evaluate(b => b === document.activeElement))
  await openMenu()
  // Un clic sur du texte inerte, sous le panneau ouvert
  const spot = await page.evaluate(() => {
    const below = document.getElementById('menu-principal').getBoundingClientRect().bottom
    for (let y = below + 12; y < innerHeight - 120; y += 8) {
      const el = document.elementFromPoint(24, y)
      if (el && !el.closest('a, button, input, select, summary, label, nav')) return { x: 24, y }
    }
    return null
  })
  if (spot) await page.mouse.click(spot.x, spot.y)
  const outsideClosed = (await menuToggle.getAttribute('aria-expanded')) === 'false' && (await menuState())
  await openMenu()
  await menuPanel.getByRole('link', { name: /^Les sujets/ }).click()
  await page.locator('.topic-fiche').first().waitFor()
  const followed = hashOf(page) === L('/sujets') && (await menuToggle.getAttribute('aria-expanded')) === 'false' && (await menuState())
  const sujetsCurrent = await menuPanel.locator(`a[href="${L('/sujets')}"]`).getAttribute('aria-current')
  const expectedMenu = [`Les sujets ${L('/sujets')}`, ...(VIDEOS_SHOWN ? [`Les vidéos ${L('/videos')}`] : []), `Les candidats ${L('/candidats')}`].join(' | ')
  check(
    menuOpened && menuLinks.join(' | ') === expectedMenu && escClosed && outsideClosed && followed && sujetsCurrent === 'page',
    `menu de l’en-tête sur téléphone : ouvert ${menuOpened}, fermé par Échap ${escClosed}, par un clic ailleurs ${outsideClosed}, en suivant « Les sujets » ${followed} (${menuLinks.join(' | ')})`,
  )

  // 2 quinquies. Les sujets : une fiche par question, tous les graphiques, ni approche ni candidat
  const withContext = bankFile.questions.filter(q => q.explainer).length
  const chartCount = bankFile.questions.flatMap(q => q.explainer?.figures ?? []).filter(f => f.chart).length
  const topicsText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  const fiches = await page.locator('.topic-fiche').count()
  const charts = await page.locator('.topic-fiche .fchart[role="img"][aria-label]').count()
  const approachShown = bankFile.questions.flatMap(q => q.approaches.map(a => a.text.replace(/\s+/g, ' '))).filter(t => topicsText.includes(t)).length
  const namesShown = pack.candidates.map(c => surname(c.name)).filter(n => n && new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(n)}(?![\\p{L}\\p{N}])`, 'u').test(topicsText))
  const voteParts = await page.locator('main .approaches, main .cran, main .initials, main .position-row').count()
  check(
    fiches === withContext && fiches > 0 && charts === chartCount && approachShown === 0 && namesShown.length === 0 && voteParts === 0,
    `page « Les sujets » : ${fiches} fiches sur ${withContext}, ${charts} graphiques sur ${chartCount}, aucune approche ni candidat affiché${namesShown.length ? ` (${namesShown.join(', ')})` : ''}`,
  )

  // 2 sexies. Dans la feuille, « Comprendre l'enjeu » dessine au moins un chiffre clé en graphique, dit en mots
  if (quickQs.some(q => q.explainer?.figures?.some(f => f.chart))) {
    let sheetCharts = 0
    let sheetChartLabel = ''
    for (let n = 1; n <= QUICK && !sheetCharts; n++) {
      await page.goto(U(`/feuille/${n}`))
      const explainer = page.locator('details.explainer')
      if (!(await explainer.waitFor({ timeout: 3000 }).then(() => true, () => false))) continue
      if (!(await explainer.evaluate(d => d.open))) await explainer.locator('summary').click()
      sheetCharts = await explainer.locator('[role="img"]').count()
      if (sheetCharts) sheetChartLabel = (await explainer.locator('[role="img"]').first().getAttribute('aria-label')) ?? ''
    }
    check(sheetCharts > 0 && sheetChartLabel.length > 10, `contexte d’une question : ${sheetCharts} graphique(s), décrit(s) en mots (« ${sheetChartLabel.slice(0, 60)}… »)`)
  } else console.log('– contexte d’une question : aucun graphique au questionnaire rapide, contrôle sauté')
  await page.goto(U('/sujets'))

  // 3. Les questions du premier temps, au toucher, puis la première tendance
  await page.goto(U('/feuille/1'))
  // « Sans avis » est entouré dès le départ, son mot écrit dessous ; la ligne ne saute pas quand l'avis change
  const firstRow = page.locator('.approaches > li').first()
  await firstRow.waitFor()
  const neutralCircled = (await firstRow.locator('.cran.is-zero.is-on .cran-mark').count()) === 1
  const neutralWord = ((await firstRow.locator('.ruler-value').textContent()) ?? '').trim()
  const restHeight = (await firstRow.boundingBox()).height
  await firstRow.locator('.cran').nth(2).click()
  const agreeHeight = (await firstRow.boundingBox()).height
  await firstRow.locator('.cran').nth(2).click()
  const backToNeutral = (await firstRow.locator('.cran.is-zero.is-on .cran-mark').count()) === 1
  check(
    neutralCircled && neutralWord === 'Sans avis' && backToNeutral && Math.abs(restHeight - agreeHeight) < 1,
    `réglette : « Sans avis » entouré par défaut et après retour, mot écrit dessous (« ${neutralWord} »), hauteur stable (${Math.round(restHeight)} → ${Math.round(agreeHeight)} px)`,
  )
  // Répond « d'accord » à la première approche et « pas d'accord » à la deuxième, puis attend l'écran suivant
  const answerCurrent = async () => {
    const prompt = (await page.locator('h1').first().textContent()) ?? ''
    const rows = page.locator('.approaches > li')
    await rows.nth(0).locator('.cran').nth(2).click()
    await rows.nth(1).locator('.cran').nth(0).click()
    await page.locator('.action-bar-inner > .btn-primary').click()
    await page.waitForFunction(p => document.querySelector('h1')?.textContent !== p, prompt)
  }
  if (STEP1) {
    for (let n = 1; n < STEP1; n++) await answerCurrent()
    await page.locator('.locator-count', { hasText: `${pad(STEP1)}/${pad(STEP1)}` }).waitFor()
    if (closingQ) {
      const last = flat(await page.locator('h1.q-prompt').textContent())
      check(last === flat(closingQ.prompt), `la ${STEP1}e question, dernière du premier temps, est « ${closingQ.id} » (${last.slice(0, 50)}…)`)
    }
    await answerCurrent()
    await page.waitForTimeout(150)
    check(hashOf(page) === L('/resultats'), `après ${STEP1} questions : première tendance (${hashOf(page)})`)
    check(await heading(page, 'Une première tendance'), 'le résultat est présenté comme une tendance')
    // Pas de verdict : ni affiche du plus proche, ni pourcentage dans le classement, ni partage ; l'appel à continuer
    // est un bouton large dans le héros, et le bouton principal de la barre continue aussi
    const heroCta = page.locator('.results-hero .trend a.btn-primary.is-wide')
    const heroCtaLabel = ((await heroCta.textContent().catch(() => '')) ?? '').trim()
    const trendPercents = (await page.locator('.board-list').innerText()).includes('%')
    const trendVerdict = await page.locator('.leader, .board-pct, .topics-block, .why-block, .agree, .prio').count()
    const trendShare = await page.locator(`.results-bar a[href="${L('/partager')}"]`).count()
    const barLabel = ((await page.locator('.action-bar-inner > .btn-primary').innerText()) ?? '').trim()
    check(
      trendVerdict === 0 && !trendPercents && trendShare === 0 && heroCtaLabel.startsWith(`Continuer\u00a0: ${QUICK - STEP1} question${QUICK - STEP1 > 1 ? 's' : ''}`) && barLabel.startsWith('Continuer'),
      `tendance : pas d’affiche, de pourcentage ni de partage ; bouton large « ${heroCtaLabel} », barre « ${barLabel.replace(/\s+/g, ' ')} »`,
    )

    // 3 bis. Qui porte quoi, à la première tendance : seules les questions vues sont révélées, sous une légende
    // visible qui sépare votre avis de ce que pensent les candidats
    await page.goto(U('/proximite'))
    const legend = page.locator('.reveal-legend')
    const legendText = (await legend.isVisible()) ? await legend.innerText() : ''
    const legendSamples = await legend.locator('.rating-mark, .initials').count()
    check(
      legendText.includes('Votre avis') && legendText.includes('pas s’il pense comme vous') && legendSamples === 8,
      `qui porte quoi : légende visible, votre avis et les pastilles des candidats (${legendSamples} exemples)`,
    )
    await page.getByRole('button', { name: 'Toutes les questions vues' }).click()
    const revealed = await page.locator('.reveal').count()
    check(revealed === STEP1, `qui porte quoi ne révèle que les ${STEP1} questions vues (${revealed})`)
    await page.goto(U('/'))
    const trendLink = ((await page.locator(`.home-status a[href="${L('/resultats')}"]`).textContent().catch(() => '')) ?? '').trim()
    check(trendLink === 'Voir la tendance', `accueil, feuille en cours : « ${trendLink} »`)
    await page.goto(U('/resultats'))
    await heading(page, 'Une première tendance')

    // 4. Continuer : les autres, les priorités, le résultat complet
    await page.locator('.action-bar-inner > .btn-primary').click()
    check(hashOf(page) === L(`/feuille/${STEP1 + 1}`), `Continuer reprend à la question ${STEP1 + 1}`)
    check((await page.locator('.locator-count').textContent())?.trim() === `${pad(STEP1 + 1)}/${pad(QUICK)}`, `la progression passe à ${pad(STEP1 + 1)}/${pad(QUICK)}`)
    for (let n = STEP1 + 1; n <= QUICK; n++) await answerCurrent()
  } else {
    console.log('– premier dépouillement : aucun pour cette élection, contrôles de la tendance sautés')
    for (let n = 1; n <= QUICK; n++) await answerCurrent()
  }
  check(hashOf(page) === L('/priorites'), `après ${QUICK} questions : les priorités`)
  await page.locator('.action-bar-inner > .btn-primary').click()
  check(await heading(page, 'Votre dépouillement'), 'résultat complet, hors ligne')
  const boardRows = await page.locator('.board-row').count()
  const shortcuts = await page.locator('.results-bar .bar-mini:visible').count()
  check(
    boardRows === NS && shortcuts === 2 && (await page.locator('.leader').count()) === 1 && (await page.locator('.unranked.excluded').count()) === (EXCLUDED.size ? 1 : 0),
    `dépouillement : l’affiche du plus proche, un seul classement (${boardRows} lignes), deux raccourcis dans la barre (${shortcuts})${EXCLUDED.size ? `, ${EXCLUDED.size} non classés à part` : ''}`,
  )

  // 4 ter. Accords et désaccords : deux barres par candidat (approches principales, autres positions)
  const agreeItems = await page.locator('.agree .agree-item').count()
  const agreeBars = await page.locator('.agree .agree-item .agree-row').count()
  const agreeSaid = ((await page.locator('.agree .agree-row .sr-only').first().textContent()) ?? '').trim()
  check(
    agreeItems === NS && agreeBars === 2 * NS && /^Ses approches principales\u00a0: \d+\u00a0accords?, \d+\u00a0désaccords?$/.test(agreeSaid),
    `accords et désaccords : ${agreeItems} candidats, ${agreeBars} barres (« ${agreeSaid} »)`,
  )
  // Une étoile par thème : la toucher fait compter le thème double (poids enregistré, ligne « Vos priorités »,
  // annonce), la retoucher le remet à 1
  // Le poids est enregistré après l'affichage : on attend l'écriture avant de le lire
  const doubled = () => page.evaluate(key => Object.values(JSON.parse(localStorage.getItem(key) ?? '{}').weights ?? {}).filter(w => w === 2).length, STORAGE)
  const savedDoubled = n =>
    page
      .waitForFunction(([key, k]) => Object.values(JSON.parse(localStorage.getItem(key) ?? '{}').weights ?? {}).filter(w => w === 2).length === k, [STORAGE, n], { timeout: 2000 })
      .catch(() => null)
  const star = page.locator('.pv-grid .star-toggle').first()
  const starName = (await star.getAttribute('aria-label')) ?? ''
  await star.click()
  await savedDoubled(1)
  const starOn = await star.getAttribute('aria-pressed')
  const doubledOn = await doubled()
  const starNote = ((await page.locator('.topics-block .prio-status').textContent()) ?? '').trim()
  const chips = await page.locator('.prio .star-chip[aria-pressed="true"]').count()
  await star.click()
  await savedDoubled(0)
  const doubledOff = await doubled()
  check(
    /\s:\sprioritaire$/.test(starName) && starOn === 'true' && doubledOn === 1 && chips === 1 && starNote.includes('compte double') && doubledOff === 0,
    `étoile « ${starName} » : thème prioritaire puis normal (${doubledOn} → ${doubledOff} thème double), « ${starNote} »`,
  )
  // La feuille est enregistrée sous la clé de cette élection, et sous aucune autre : chaque élection a sa sauvegarde
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir:') && !k.endsWith(':illisible')))
  const otherKeys = ELECTIONS.filter(e => e.id !== entry.id).map(e => `isoloir:${e.id}`).filter(k => keys.includes(k))
  check(keys.includes(STORAGE) && otherKeys.length === 0, `sauvegarde : la feuille est sous « ${STORAGE} », aucune autre élection n’en reçoit (${keys.join(', ')})`)

  // 4 bis. La fenêtre de confidentialité s'ouvre depuis la barre du bas et se ferme
  await page.goto(U('/feuille/2'))
  await page.locator('.privacy-trigger').click()
  const dialogOpen = await page.locator('.privacy-dialog').evaluate(d => d.open)
  await page.getByRole('button', { name: 'Compris' }).click()
  const dialogClosed = await page.locator('.privacy-dialog').evaluate(d => !d.open)
  check(dialogOpen && dialogClosed, 'le cadenas de la barre ouvre puis ferme la fenêtre de confidentialité')

  // 5. Clavier : les flèches déplacent le repère d'une réglette
  await page.goto(U('/feuille/3'))
  // Le changement de question envoie le focus au titre, après affichage : on l'attend avant de viser la réglette
  await page
    .waitForFunction(() => document.activeElement?.matches('main h1') && /^03\//.test(document.querySelector('.locator-count')?.textContent?.trim() ?? ''), null, { timeout: 3000 })
    .catch(() => null)
  const keyRow = Math.min(2, (await page.locator('.approaches > li').count()) - 1)
  const radio = page.locator('.approaches > li').nth(keyRow).locator('input[type=radio]').nth(1)
  await radio.focus()
  await page.keyboard.press('ArrowRight')
  check(await page.locator('.approaches > li').nth(keyRow).locator('input[type=radio]').nth(2).isChecked(), 'flèche droite : « d’accord »')

  // 6. L'image et le double se fabriquent sans réseau
  await page.goto(U('/partager'))
  await page.waitForSelector('.share-preview img', { timeout: 5000 }).catch(() => null)
  check((await page.locator('.share-preview img').count()) > 0, 'l’affiche JPG est fabriquée hors ligne')
  await page.goto(U('/resultats'))
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Télécharger mon double (JSON)' }).click(),
  ])
  const file = JSON.parse(readFileSync(await download.path(), 'utf8'))
  const rated = file.readable.filter(r => r.avis.length >= 2 && !r.passee).length // la question 3 en a un de plus (test clavier)
  check(file.format === 3 && file.readable.length === QUICK && rated === QUICK, `le double JSON contient les ${QUICK} réponses, chacune avec ses deux avis (${rated})`)

  // 7. Recharger la page sans réseau
  await page.reload()
  await page.waitForTimeout(400)
  check(await heading(page, 'Votre dépouillement'), 'rechargement hors ligne : la page et les réponses reviennent')
  check(await page.evaluate(() => document.fonts.check('1em "Archivo Variable"', 'œ’')), 'la police est disponible hors ligne')

  // 7 bis. Accueil : la date des réponses ; fiche candidat : familles de thèmes et « Mes réponses »
  await page.goto(U('/'))
  const doneNote = (await page.locator('.done-note').textContent().catch(() => '')) ?? ''
  check(new RegExp(`${QUICK} questions le \\d+\\s\\S+\\s20\\d\\d à \\d+\u00a0h\u00a0\\d\\d`).test(doneNote), `l’accueil date les ${QUICK} réponses (${doneNote.trim()})`)
  // L'appel de l'en-tête mène désormais au dépouillement (libellé long ou court selon la largeur)
  const doneCta = page.locator('.header-cta')
  const doneHref = await doneCta.getAttribute('href').catch(() => null)
  const doneLabel = ((await doneCta.innerText().catch(() => '')) ?? '').trim()
  check(doneHref === L('/resultats') && /dépouillement/i.test(doneLabel), `après ${QUICK} réponses, l’en-tête mène au dépouillement (${doneHref}, « ${doneLabel} »)`)
  // 7 bis (en-tête). Le même partout : une seule rangée, de la même hauteur au pixel près sur chaque page
  // principale à chaque largeur (texte normal), avec ou sans appel, menu ouvert ou fermé ; le bouton « Menu »
  // et l'appel de l'accueil ont la même hauteur ; rien ne sort de la rangée ; et le nom de la page n'y figure
  // jamais (la page le porte déjà). Mesuré en ligne, sans le rideau du mode avion.
  const saved = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))
  // La tendance : les mêmes réponses, réduites aux questions du premier temps
  const stepOne = new Set(step1Qs.map(q => q.id))
  const trendSaved = Object.fromEntries(
    Object.entries(saved).map(([k, v]) => {
      try {
        const s = JSON.parse(v)
        if (!s || typeof s !== 'object' || !s.answers) return [k, v]
        const answers = Object.fromEntries(Object.entries(s.answers).filter(([id]) => stepOne.has(id)))
        return [k, JSON.stringify({ ...s, answers, essentialDoneAt: null, lastSeenRanking: null })]
      } catch {
        return [k, v]
      }
    }),
  )
  const headerStates = [
    [null, [['accueil', '/', '.home-film']]],
    [
      saved,
      [
        [`accueil (${QUICK} réponses)`, '/', '.home-film'],
        ['question', '/feuille/2', '.approaches > li'],
        ['résultats', '/resultats', '.board-row'],
        ['sujets', '/sujets', '.topic-fiche'],
        ['candidats', '/candidats', '.people-panel-link'],
        ['fiche candidat', `/candidat/${FICHE.id}`, '.bristol'],
        ['méthode', '/methode', 'main h1'],
        ['mentions légales', '/mentions-legales', 'main h1'],
        ['confidentialité', '/confidentialite', 'main h1'],
        ['vidéos', '/videos', 'main h1'],
      ],
    ],
    ...(STEP1 ? [[trendSaved, [['tendance', '/resultats', '.board-row']]]] : []),
  ]
  const pageNames = ['Feuille de pointage', 'Feuille complémentaire', 'Feuille de révision', 'Résultats', 'Notice', 'Méthode', 'Mentions légales', 'Confidentialité', 'Essai vidéos', 'Les vidéos', 'Qui porte quoi', 'Partager', 'Priorités', 'Les sujets', 'Les candidats']
  const headerWidths = [320, 360, 390, 768, 1024, 1440]
  const measureBar = p =>
    p.evaluate(() => {
      const h = document.querySelector('.form-header')
      const row = h.querySelector('.form-header-inner')
      const shown = el => !!el && el.getClientRects().length > 0
      const end = row.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(row).paddingRight)
      const kids = [...row.children].filter(shown)
      const menu = row.querySelector('.menu-toggle')
      const cta = row.querySelector('.header-cta')
      return {
        height: Math.round(h.getBoundingClientRect().height * 100) / 100,
        // Le texte de l'en-tête hors navigation (les liens du menu nomment les pages de consultation)
        text: kids.filter(k => !k.matches('nav')).map(k => k.innerText).join(' ').replace(/\s+/g, ' ').trim(),
        h1: document.querySelector('main h1')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        out: kids.filter(k => k.getBoundingClientRect().right > end + 0.5).map(k => k.className),
        wide: h.scrollWidth > h.clientWidth,
        menu: shown(menu) ? Math.round(menu.getBoundingClientRect().height * 100) / 100 : null,
        cta: shown(cta) ? Math.round(cta.getBoundingClientRect().height * 100) / 100 : null,
      }
    })
  const barHeights = new Map(headerWidths.map(w => [w, []]))
  const barIssues = []
  for (const [state, list] of headerStates) {
    const hctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    if (state) await hctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), state)
    const hp = await hctx.newPage()
    for (const width of headerWidths) {
      await hp.setViewportSize({ width, height: 844 })
      for (const [what, path, sel] of list) {
        await hp.goto(U(path))
        await hp.locator(sel).first().waitFor()
        await hp.waitForTimeout(60)
        if (what === 'tendance' && !(await hp.getByRole('heading', { name: 'Une première tendance' }).isVisible())) barIssues.push(`${what} : pas de tendance affichée`)
        const bar = await measureBar(hp)
        barHeights.get(width).push([what, bar.height])
        if (bar.out.length || bar.wide) barIssues.push(`${what} à ${width} px : hors de la rangée (${bar.out.join(', ') || 'débord'})`)
        if (bar.menu !== null && bar.cta !== null && bar.menu !== bar.cta) barIssues.push(`${what} à ${width} px : « Menu » ${bar.menu} px, appel ${bar.cta} px`)
        const named = pageNames.filter(n => bar.text.includes(n))
        if (named.length || (bar.h1 && bar.text.includes(bar.h1))) barIssues.push(`${what} à ${width} px : nom de page dans l’en-tête (« ${bar.text} »)`)
        // Menu ouvert : le panneau se pose sous l'en-tête, qui ne change pas de hauteur
        if (bar.menu !== null) {
          await hp.locator('.menu-toggle').click()
          await hp.locator('#menu-principal').waitFor()
          const open = await measureBar(hp)
          if (open.height !== bar.height) barIssues.push(`${what} à ${width} px : ${bar.height} px menu fermé, ${open.height} px ouvert`)
          // Échap n'est écouté qu'une fois le panneau affiché : on laisse passer deux images
          await hp.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r)))))
          await hp.keyboard.press('Escape')
          await hp.locator('#menu-principal').waitFor({ state: 'hidden' })
        }
      }
    }
    await hctx.close()
  }
  const spread = [...barHeights].map(([w, hs]) => {
    const values = [...new Set(hs.map(([, h]) => h))]
    if (values.length !== 1) barIssues.push(`${w} px : ${hs.map(([what, h]) => `${what} ${h}`).join(', ')}`)
    return `${w} : ${values.join(' / ')} px`
  })
  check(
    barIssues.length === 0,
    `en-tête : une rangée de même hauteur sur ${headerStates.reduce((n, [, l]) => n + l.length, 0)} pages à chaque largeur (${spread.join(', ')}), menu ouvert ou fermé, « Menu » et appel de même hauteur, sans nom de page${barIssues.length ? ` : ${barIssues.join(' ; ')}` : ''}`,
  )
  // Texte à 200 % sur 320 px : la barre peut grandir, mais rien n'en sort (l'accueil passe son appel dessous)
  const zctx = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
  await zctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), saved)
  await zctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = '200%')))
  const zp = await zctx.newPage()
  const zoomIssues = []
  for (const [what, path, sel] of headerStates[1][1]) {
    await zp.goto(U(path))
    await zp.locator(sel).first().waitFor()
    const bar = await measureBar(zp)
    if (bar.out.length || bar.wide) zoomIssues.push(`${what} (${bar.out.join(', ') || 'débord'})`)
  }
  await zctx.close()
  check(zoomIssues.length === 0, `en-tête, texte à 200 % sur 320 px : rien ne sort de la barre${zoomIssues.length ? ` : ${zoomIssues.join(', ')}` : ''}`)
  await page.goto(U('/candidats'))
  await page.locator('.people-panel-link').first().click()
  await page.locator('.bristol').first().waitFor()
  const allCards = await page.locator('.bristol').count()
  await page.locator('.filter-select select').selectOption(SMALL.id)
  const oneFamily = await page.locator('.bristol').count()
  await page.locator('.filter-select select').selectOption('')
  check(
    allCards === CARDS && oneFamily === cardsOf(SMALL) && (await page.locator('.bristol').count()) === CARDS,
    `fiche candidat : ${CARDS} fiches, filtrables par famille (${allCards} → ${oneFamily} pour « ${SMALL.label} »)`,
  )
  const before = await page.locator('.stance-you').count()
  await page.locator('.mine-toggle').click()
  const after = await page.locator('.stance-you').count()
  check(before === 0 && after > 5, `« Mes réponses » montre vos avis à côté des siens (${after})`)

  // 7 bis bis. Pied de page commun : sur chaque écran, les liens vers la méthode et les notices sont dans le
  // pied (repère « contentinfo »), jamais dans l'en-tête (ni en ligne ni dans le panneau du menu) ; défilé
  // jusqu'en bas, le dernier lien ne passe pas sous la barre d'actions ; la notice où l'on est est marquée.
  // Un lien vers les archives peut s'y ajouter (#/archives, quand une élection est archivée).
  const footScreens = ['/', '/feuille/2', '/resultats', '/proximite', '/candidats', `/candidat/${FICHE.id}`, '/sujets', '/methode', '/confidentialite', '/mentions-legales', '/priorites', '/approfondir', '/partager']
  const notices = [L('/methode'), L('/confidentialite'), L('/mentions-legales')]
  const footIssues = []
  for (const path of footScreens) {
    const titleBefore = await page.title()
    await page.goto(U(path))
    await page.waitForFunction(t => document.title !== t, titleBefore, { timeout: 3000 }).catch(() => null)
    await page.locator('main h1').first().waitFor()
    const landmarks = await page.getByRole('contentinfo').count()
    const f = await page.evaluate(sel => {
      window.scrollTo(0, document.documentElement.scrollHeight)
      const foot = document.querySelectorAll('footer.site-foot')
      const links = [...(foot[0]?.querySelectorAll('.site-foot-links a') ?? [])]
      const bar = document.querySelector('.action-bar')
      const last = links.at(-1)?.getBoundingClientRect()
      return {
        count: foot.length,
        hrefs: links.map(a => a.getAttribute('href')),
        current: links.filter(a => a.getAttribute('aria-current') === 'page').map(a => a.getAttribute('href')),
        inHeader: document.querySelectorAll(sel).length,
        masked: !last || (!!bar && last.bottom > bar.getBoundingClientRect().top + 0.5),
      }
    }, notices.map(h => `.form-header a[href="${h}"]`).join(', '))
    const expected = notices.includes(L(path)) ? L(path) : ''
    const ownLinks = f.hrefs.filter(h => !/\/archives$/.test(h ?? ''))
    const ok =
      f.count === 1 && landmarks === 1 && ownLinks.join(' ') === notices.join(' ') && f.current.join(' ') === expected && f.inHeader === 0 && !f.masked
    if (!ok) footIssues.push(`${path} (${f.count} pied, ${landmarks} repère, liens ${f.hrefs.join(' ')}, courant ${f.current.join(' ') || '-'}, ${f.inHeader} dans l’en-tête${f.masked ? ', masqué par la barre' : ''})`)
  }
  check(
    footIssues.length === 0,
    `pied de page sur ${footScreens.length} écrans : méthode, confidentialité et mentions légales en bas, pas dans l’en-tête${footIssues.length ? ` : ${footIssues.join(' ; ')}` : ''}`,
  )

  check(foreign.length === 0, `aucune requête vers un autre site${foreign.length ? ` : ${foreign.join(', ')}` : ''}`)
  await ctx.close()

  // 7 ter. Grand écran : le menu en ligne dans l'en-tête, le lien courant marqué, sans bouton « Menu »
  const wide = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const wp = await wide.newPage()
  await wp.goto(U('/sujets'))
  await wp.locator('.topic-fiche').first().waitFor()
  const inlineLinks = await wp
    .locator('.main-nav a')
    .evaluateAll(as => as.filter(a => a.offsetParent).map(a => `${a.textContent} ${a.getAttribute('aria-current') ?? '-'}`))
  const toggleShown = await wp.locator('.menu-toggle').isVisible()
  await wp.locator(`.main-nav a[href="${L('/candidats')}"]`).click()
  await wp.locator('.people-panel').first().waitFor()
  check(
    inlineLinks.join(' | ') === (VIDEOS_SHOWN ? 'Les sujets page | Les vidéos - | Les candidats -' : 'Les sujets page | Les candidats -') && !toggleShown && hashOf(wp) === L('/candidats'),
    `grand écran : menu en ligne (${inlineLinks.join(' | ')}), sans bouton « Menu », lien vers les candidats suivi`,
  )
  // Grand écran, la comparaison de trois ou quatre candidats : le tableau complet (la question dans la colonne de
  // gauche, à hauteur de ses cases), l'en-tête des colonnes collé et aligné en défilant ; « Seulement les
  // oppositions radicales » ne garde que des lignes marquées « Opposition », chacune dite en toutes lettres sous la
  // question (« Faure rejette l'approche de Glucksmann »), avec la case qui rejette l'approche d'un autre et la case
  // dont l'approche est rejetée, thèmes dépliés
  if (N >= 3) {
    const ids = pack.candidates.slice(0, Math.min(4, N)).map(c => c.id)
    await wp.goto(U(`/comparer/${ids.join(',')}`))
    await wp.locator('.cmp-table').waitFor()
    const layout = await wp.locator('.cmp').getAttribute('class')
    const side = await wp.evaluate(() => {
      const row = document.querySelector('.cmp-topic .cmp-row')
      const th = row?.querySelector('th')?.getBoundingClientRect()
      const td = row?.querySelector('td')?.getBoundingClientRect()
      return !!th && !!td && Math.abs(th.top - td.top) < 1 && th.right <= td.left + 1
    })
    await wp.evaluate(() => window.scrollBy(0, 2600))
    const aligned = await wp.evaluate(() => {
      const ths = [...document.querySelectorAll('.cmp-table thead th[scope="col"]')].map(t => t.getBoundingClientRect())
      const bar = document.querySelector('.form-header')?.getBoundingClientRect()
      const row = [...document.querySelectorAll('.cmp-topic .cmp-row')].find(r => r.getBoundingClientRect().top > (ths[0]?.bottom ?? 0))
      const tds = row ? [...row.querySelectorAll('td')].map(t => t.getBoundingClientRect()) : []
      const off = ths.length && ths.length === tds.length ? Math.max(...ths.map((t, i) => Math.abs(t.left - tds[i].left) + Math.abs(t.width - tds[i].width))) : 999
      return { top: Math.round((ths[0]?.top ?? 0) - (bar?.bottom ?? 0)), off: Math.round(off) }
    })
    await wp.getByRole('button', { name: 'Seulement les oppositions radicales' }).click()
    const opp = await wp.evaluate(() => {
      const rows = [...document.querySelectorAll('.cmp-topic .cmp-row')]
      const toggles = [...document.querySelectorAll('.cmp-topic-toggle')]
      return {
        rows: rows.length,
        marked: rows.every(
          r =>
            r.classList.contains('kind-opposed') &&
            /Opposition/.test(r.querySelector('th')?.textContent ?? '') &&
            /rejett(e|ent) l’approche d/.test(r.querySelector('th .cmp-say.is-rejects')?.textContent ?? '') &&
            !!r.querySelector('th .cmp-say.is-rejects')?.getClientRects().length &&
            !!r.querySelector('td .cmp-note.is-rejects') &&
            /Approche rejetée par/.test(r.querySelector('td .cmp-note.is-rejected')?.textContent ?? ''),
        ),
        open: toggles.every(t => t.getAttribute('aria-expanded') === 'true'),
        none: /Aucune opposition radicale/.test(document.querySelector('.cmp-count')?.textContent ?? ''),
      }
    })
    check(
      / is-table/.test(layout ?? '') && side && Math.abs(aligned.top) <= 6 && aligned.off <= 1 && (opp.rows ? opp.marked && opp.open : opp.none),
      `grand écran, comparaison de ${ids.length} : tableau complet ${/ is-table/.test(layout ?? '')}, question à gauche de ses cases ${side} ; en-tête collant à ${aligned.top}px, décalage des colonnes ${aligned.off}px ; « Seulement les oppositions radicales » : ${opp.rows} lignes marquées ${opp.marked}, thèmes dépliés ${opp.open}`,
    )
  }
  await wide.close()

  // 7 quater. Tablette : ni les sujets ni la fiche d'un candidat ne défilent en largeur (les textes pour
  // lecteurs d'écran des pastilles restent dans leur rangée qui défile)
  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce' })
  const tp = await tablet.newPage()
  const widthOverflow = () => tp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await tp.goto(U('/sujets'))
  await tp.waitForSelector('.topic-fiche .fchart')
  const topicsWide = await widthOverflow()
  await tp.goto(U(`/candidat/${FICHE.id}`))
  await tp.waitForSelector('.bristol')
  const ficheWide = await widthOverflow()
  check(topicsWide <= 0 && ficheWide <= 0, `768 px : rien ne déborde en largeur (sujets ${topicsWide}px, fiche candidat ${ficheWide}px)`)
  await tablet.close()

  // 7 quinquies. Sommaire des sujets sur téléphone, défilement doux (réglage par défaut) : le lien mène à sa
  // fiche, dont le titre a le focus et se voit sous la barre des familles ; le sommaire s'est replié
  const smooth = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  const sp = await smooth.newPage()
  await sp.goto(U('/sujets'))
  await sp.waitForSelector('.topic-fiche')
  await sp.locator('.topics-toc summary').click()
  const tocNth = Math.min(39, (await sp.locator('.topics-toc a').count()) - 1)
  const tocLink = sp.locator('.topics-toc a').nth(tocNth)
  const tocTarget = ((await tocLink.getAttribute('href')) ?? '').split('/').pop()
  await tocLink.click()
  await sp.waitForTimeout(2000)
  const landed = await sp.evaluate(id => {
    const h4 = document.getElementById(`sujet-h-${id}`)
    const top = h4?.getBoundingClientRect().top ?? -1
    const below = document.querySelector('.topics-filters').getBoundingClientRect().bottom
    return { top: Math.round(top), below: Math.round(below), focused: !!h4 && document.activeElement === h4, open: document.querySelector('.topics-toc details').open }
  }, tocTarget)
  check(
    landed.top >= landed.below - 1 && landed.top < 844 && landed.focused && !landed.open,
    `sommaire des sujets sur téléphone : le ${tocNth + 1}e lien mène à sa fiche (titre à ${landed.top} px, sous la barre à ${landed.below} px, focus ${landed.focused}, sommaire replié ${!landed.open})`,
  )
  await smooth.close()

  // 7 sexies. Vidéos « Les sujets », intégrées au site : la page « Les sujets en vidéo » (#/videos, dans le menu,
  // les séries par famille, sans jargon d'essai ni choix de voix), le lecteur (repère de série, sommaire en un
  // geste, catégories qui mènent à une série, commande « Son » simple, aucun appel à « donner son avis » sur le
  // site, focus rendu à la fermeture), les entrées de « Les sujets » (fil, thème), une question avec une vidéo liée
  // (le lecteur s'ouvre par-dessus, la réponse reste, « retour » depuis une fiche le rouvre), les adresses
  // (#/videos/<vidéo>, l'ancienne #/essai-videos), aucun son demandé tant que l'inventaire est vide, et, hors
  // ligne, les vidéos en sous-titres seuls. Les séries attendues sont celles des thèmes de l'élection (ou de son
  // périmètre vidéo) ; la série de référence est « Retraites » (SA), l'autre « Logement » (SB), quand l'élection les montre.
  const audioInventory = readJson('src/ui/videos/audio-files.json')
  // Passages inscrits pour la voix du site ({ voices: { aigue: { <vidéo>: { <passage>: … } } } })
  const voicesListed = Object.values(audioInventory.voices?.aigue ?? {}).reduce((m, segs) => m + Object.keys(segs).length, 0)
  const SERIES_N = SERIES.length
  if (!SA || !SB) console.log(`– vidéos : ${SERIES_N} série(s) pour cette élection, pas assez longues pour les contrôles du lecteur : sautés`)
  if (!VIDEOS_SHOWN) {
    // Aucune vidéo pour cette élection : #/videos mène à l'accueil, et « Les sujets » n'a ni fil ni lien vidéo
    const nv = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const np = await nv.newPage()
    await np.goto(U('/videos'))
    await np.waitForFunction(home => location.hash === home || location.hash === '', L('/'))
    const redirected = [L('/'), ''].includes(new URL(np.url()).hash)
    await np.goto(U('/sujets'))
    await np.locator('.topic-fiche').first().waitFor()
    const links = await np.locator('.video-link, .video-play, .video-feed, a[href*="/videos"]').count()
    check(redirected && links === 0, `vidéos : aucune pour cette élection, #/videos mène à l’accueil (${redirected}), aucun lien vidéo dans « Les sujets » (${links})`)
    await nv.close()
  }
  for (const [width, height] of SA && SB ? [[390, 844], [1440, 900]] : []) {
    const [A0, A1, A2] = SA.videos
    const [B0, B1] = SB.videos
    const vctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
    const vp = await vctx.newPage()
    const sounds = []
    const strangers = []
    vp.on('request', r => {
      if (/\.m4a(\?|$)/.test(r.url())) sounds.push(r.url())
      if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) strangers.push(r.url())
    })
    await vp.goto(U('/videos'))
    await vp.waitForSelector('.vl-btn')
    const vpage = await vp.evaluate(href => ({
      h1: document.querySelector('main h1')?.textContent ?? '',
      series: document.querySelectorAll('.vl-serie').length,
      families: document.querySelectorAll('.videos-family').length,
      buttons: document.querySelectorAll('.vl-btn').length,
      feed: document.querySelectorAll('.video-feed .video-play').length,
      menu: document.querySelectorAll(`.form-header a[href="${href}"]`).length,
      jargon: /\b(piste|essai|inventaire)\b|Voix grave|Voix aiguë|passages? sur \d/i.test(document.querySelector('main')?.textContent ?? ''),
    }), L('/videos'))
    check(
      vpage.h1 === 'Les sujets en vidéo' && vpage.series === SERIES_N && vpage.families >= 1 && vpage.buttons >= 2 * vpage.series && vpage.feed === 1 && vpage.menu >= 1 && !vpage.jargon,
      `vidéos, ${width} px : page « ${vpage.h1} », ${vpage.series} séries (attendues : ${SERIES_N}) en ${vpage.families} familles, ${vpage.buttons} vidéos, fil ${vpage.feed}, entrée du menu ${vpage.menu}, sans jargon d’essai ni choix de voix (${!vpage.jargon})`,
    )
    const mark = () => vp.locator('.vp-video:not([inert]) .vp-mark-text').evaluate(e => e.firstChild?.textContent ?? '')
    await vp.locator(`.vl-btn[data-video="${A0.id}"]`).click()
    await vp.locator('dialog.vp[open]').waitFor()
    const first = flat(await mark())
    await vp.keyboard.press('ArrowDown')
    await vp.waitForTimeout(300)
    const second = flat(await mark())
    check(isMark(first, SA, A0) && isMark(second, SA, A1), `vidéos, ${width} px : repère de série (« ${first} », puis « ${second} »)`)
    // Le sommaire, en un toucher sur le repère : la série entière, la vidéo en cours marquée
    await vp.locator('.vp-video:not([inert]) .vp-mark').click()
    await vp.locator('.vp-sheet .vp-toc').waitFor()
    // Le focus passe au titre du panneau après l'affichage
    await vp.waitForFunction(() => document.activeElement?.id === 'vp-sheet-title', null, { timeout: 2000 }).catch(() => null)
    const toc = await vp.evaluate(() => ({
      items: document.querySelectorAll('.vp-toc-item').length,
      here: [...document.querySelectorAll('.vp-toc-item')].findIndex(b => b.getAttribute('aria-current') === 'true'),
      focus: document.activeElement?.id,
    }))
    await vp.locator('.vp-toc-item').nth(2).click()
    await vp.waitForFunction(() => !!document.activeElement?.closest('.vp-video:not([inert])'), null, { timeout: 2000 }).catch(() => null)
    const picked = flat(await mark())
    const focusIn = await vp.evaluate(() => !!document.activeElement?.closest('.vp-video:not([inert])'))
    check(
      toc.items === SA.videos.length && toc.here === 1 && toc.focus === 'vp-sheet-title' && isMark(picked, SA, A2) && focusIn,
      `vidéos, ${width} px : sommaire de la série (${toc.items} vidéos, en cours n° ${toc.here + 1}, focus ${toc.focus}), choix « ${picked} », focus rendu à la vidéo (${focusIn})`,
    )
    // Le son : un bouton bascule « Son », sans panneau ni choix de voix ; M le bascule dans la vidéo
    const sound = vp.locator('.vp-video:not([inert]) .vp-ctl[aria-pressed]')
    const soundBefore = await sound.evaluate(b => ({ label: (b.textContent ?? '').trim(), pressed: b.getAttribute('aria-pressed'), popup: b.hasAttribute('aria-haspopup'), off: b.disabled }))
    if (!soundBefore.off) {
      await vp.locator('.vp-video:not([inert])').focus()
      await vp.keyboard.press('m')
    }
    const soundAfter = await sound.getAttribute('aria-pressed')
    const voicePanel = await vp.evaluate(() => /Voix grave|Voix aiguë|Sans voix/.test(document.querySelector('dialog.vp')?.textContent ?? ''))
    check(
      soundBefore.label === 'Son' && !soundBefore.popup && !voicePanel && (soundBefore.off || (soundBefore.pressed === 'true' && soundAfter === 'false')),
      `vidéos, ${width} px : commande « ${soundBefore.label} » (enfoncée ${soundBefore.pressed}, puis ${soundAfter} après M${soundBefore.off ? ', sans voix enregistrée' : ''}), aucun choix de voix`,
    )
    // Les catégories mènent à la série d'un thème, depuis son introduction
    await vp.locator('.vp-cats-all').click()
    await vp.locator('.vp-cat-go', { hasText: new RegExp(SB.labels.map(escapeRe).join('|')) }).first().click()
    await vp.waitForTimeout(300)
    const other = flat(await mark())
    const pleas = await vp.locator('dialog.vp').evaluate(d => /donnez votre avis/i.test(d.textContent) || !!d.querySelector('.vp-end-cta'))
    check(isMark(other, SB, B0) && !pleas, `vidéos, ${width} px : catégorie → « ${other} », aucun appel à donner son avis sur le site`)
    const wideSide = width >= 1440 ? await vp.locator('.vp-side').isVisible() : true
    const overflow = await vp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    // Fermer : la page est toujours là, le focus revient au bouton qui avait ouvert le lecteur
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const closed = await vp.evaluate(() => ({ open: !!document.querySelector('dialog.vp[open]'), focus: document.activeElement?.getAttribute('data-video'), hash: decodeURI(location.hash) }))
    check(
      (voicesListed || sounds.length === 0) && strangers.length === 0 && wideSide && overflow <= 0 && !closed.open && closed.focus === A0.id && closed.hash === L('/videos'),
      `vidéos, ${width} px : ${sounds.length} son demandé (inventaire : ${voicesListed}), aucune requête vers un autre site, rien ne déborde${width >= 1440 ? ', flèches à côté de la popin' : ''}, fermé avec le focus rendu (${closed.focus}, ${closed.hash})`,
    )

    // « Les sujets » : l'accès au fil en tête de page, et la vidéo d'un thème qui a sa série
    await vp.goto(U('/sujets'))
    await vp.waitForSelector('.topic-video .video-play')
    const topics = await vp.evaluate(
      ([topicA, videoA]) => ({
        feed: document.querySelectorAll('.wide-hero .video-feed .video-play').length,
        themes: document.querySelectorAll('.topic-theme-head .topic-video').length,
        themeA: !!document.getElementById(`theme-${topicA}`)?.closest('.topic-theme')?.querySelector(`.topic-video [data-video="${videoA}"]`),
        fiches: [...document.querySelectorAll('.topic-fiche')].map(f => !!f.querySelector('.video-link')),
      }),
      [SA.topic, A0.id],
    )
    const ficheQuestions = bankFile.questions.filter(q => q.explainer).map(q => q.id)
    const linkedExpected = ficheQuestions.filter(id => deepLinked.has(id)).length
    const linked = topics.fiches.filter(Boolean).length
    await vp.locator(`.topic-video [data-video="${B0.id}"]`).click()
    await vp.locator('dialog.vp[open]').waitFor()
    const fromTopic = flat(await mark())
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const topicBack = await vp.evaluate(() => document.activeElement?.getAttribute('data-video'))
    check(
      topics.feed === 1 && topics.themes === SERIES_N && topics.fiches.length > 0 && linked === linkedExpected && topics.themeA && isMark(fromTopic, SB, B0) && topicBack === B0.id,
      `vidéos dans « Les sujets », ${width} px : fil en tête (${topics.feed}), ${topics.themes}/${SERIES_N} thèmes avec leur vidéo, ${linked}/${topics.fiches.length} fiches avec un lien vidéo (attendues : ${linkedExpected}), ouverte sur « ${fromTopic} », focus rendu (${topicBack})`,
    )

    // Une question avec une vidéo liée : le lecteur s'ouvre par-dessus la feuille, la réponse reste, le focus revient
    let k = 0
    for (let i = 1; i <= QUICK && !k; i++) {
      await vp.goto(U(`/feuille/${i}`))
      await vp.waitForSelector('.q-prompt')
      await vp.waitForTimeout(300)
      if (await vp.locator('.q-video .video-link').count()) k = i
    }
    let question = { k, open: false, kept: false, focus: '', reopened: false, after: '' }
    if (k) {
      await vp.locator('.approaches > li').first().locator('.cran').nth(2).click()
      const linkedVideo = await vp.locator('.q-video .video-link').first().getAttribute('data-video')
      await vp.locator('.q-video .video-link').first().click()
      await vp.locator('dialog.vp[open]').waitFor()
      const open = flat(await mark()).length > 0
      await vp.keyboard.press('Escape')
      await vp.waitForTimeout(400)
      const kept = await vp.evaluate(() => document.querySelectorAll('.approaches > li')[0]?.querySelectorAll('input[type=radio]')[2]?.checked === true)
      const focus = (await vp.evaluate(() => document.activeElement?.getAttribute('data-video'))) ?? ''
      // « Voir la fiche » depuis le lecteur, puis « retour » : le lecteur se rouvre par-dessus la même question
      await vp.locator('.q-video .video-link').first().click()
      await vp.locator('dialog.vp[open]').waitFor()
      await vp.locator('.vp-video:not([inert]) a.vp-ctl').click()
      await vp.waitForFunction(h => decodeURI(location.hash).startsWith(h), L('/sujets/'), { timeout: 3000 }).catch(() => null)
      await vp.locator('.topic-fiche').first().waitFor({ timeout: 3000 }).catch(() => null)
      await vp.goBack()
      await vp.locator('dialog.vp[open]').waitFor({ timeout: 4000 }).catch(() => null)
      const reopened = await vp.evaluate(h => decodeURI(location.hash) === h && !!document.querySelector('dialog.vp[open]'), L(`/feuille/${k}`))
      await vp.keyboard.press('Escape')
      await vp.waitForTimeout(400)
      const after = await vp.evaluate(() => `${decodeURI(location.hash)} ${document.querySelector('dialog.vp[open]') ? 'ouvert' : 'fermé'} ${document.activeElement?.getAttribute('data-video') ?? ''}`)
      question = { k, open, kept, focus: focus === linkedVideo ? focus : `${focus} ≠ ${linkedVideo}`, reopened, after }
    }
    const anyLinkedQuick = quickQs.some(q => deepLinked.has(q.id))
    check(
      anyLinkedQuick
        ? question.k > 0 && question.open && question.kept && !question.focus.includes('≠') && question.reopened && /fermé/.test(question.after)
        : question.k === 0,
      anyLinkedQuick
        ? `vidéo liée à la question ${question.k}, ${width} px : lecteur par-dessus (${question.open}), réponse gardée (${question.kept}), focus rendu (${question.focus}), rouvert au retour d’une fiche (${question.reopened}), puis ${question.after}`
        : `aucune question rapide n’a de vidéo liée, et aucune n’en montre (${question.k})`,
    )

    // Adresses : #/videos/<vidéo> ouvre le lecteur sur cette vidéo (l'adresse redevient #/videos) ; l'ancienne page
    // d'essai mène à la page des vidéos
    await vp.goto(U(`/videos/${B1.id}`))
    await vp.locator('dialog.vp[open]').waitFor({ timeout: 4000 }).catch(() => null)
    const direct = flat(await mark().catch(() => ''))
    const directHash = await vp.evaluate(() => decodeURI(location.hash))
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const directClosed = await vp.evaluate(() => ({ open: !!document.querySelector('dialog.vp[open]'), h1: document.querySelector('main h1')?.textContent }))
    await vp.goto(U('/essai-videos'))
    await vp.waitForFunction(h => decodeURI(location.hash) === h, L('/videos'), { timeout: 3000 }).catch(() => null)
    await vp.waitForSelector('.vl-btn')
    const legacy = await vp.evaluate(() => ({ hash: decodeURI(location.hash), h1: document.querySelector('main h1')?.textContent }))
    check(
      isMark(direct, SB, B1) && directHash === L('/videos') && !directClosed.open && directClosed.h1 === 'Les sujets en vidéo' && legacy.hash === L('/videos') && legacy.h1 === 'Les sujets en vidéo',
      `adresses des vidéos, ${width} px : ${L(`/videos/${B1.id}`)} → « ${direct} » (${directHash}), fermé sur la page ; ${withBase(prefix, '/essai-videos')} → ${legacy.hash}`,
    )
    await vctx.close()
  }
  // Hors ligne (mode avion, page rechargée depuis la copie hors ligne) : la vidéo avance en sous-titres seuls
  if (SA) {
    const octx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const op = await octx.newPage()
    await op.goto(U('/videos'))
    await op.evaluate(() => navigator.serviceWorker.ready)
    await op.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
    await octx.setOffline(true)
    await op.reload()
    await op.waitForSelector('.vl-btn')
    await op.locator(`.vl-btn[data-video="${SA.videos[0].id}"]`).click()
    await op.locator('dialog.vp[open]').waitFor()
    await op.waitForTimeout(2500)
    const run = await op.evaluate(() => {
      const v = document.querySelector('.vp-video:not([inert])')
      return {
        bar: Number(v?.querySelector('.vp-bar-fill')?.style.getPropertyValue('--p') || 0),
        caption: v?.querySelector('.vp-cap')?.textContent?.length ?? 0,
        note: v?.querySelector('.vp-voice-note')?.textContent ?? '',
      }
    })
    check(run.bar > 0 && run.caption > 10 && /sous-titres seuls/.test(run.note), `vidéos hors ligne : la vidéo avance en sous-titres seuls (passage 1 à ${Math.round(run.bar * 100)} %, « ${run.note.trim()} »)`)
    await octx.close()
  }

  // 7 septies. Mention « rédigé par IA » (règlement (UE) 2024/1689, art. 50, 4 et 5) : les textes rédigés par une
  // IA, publiés sans relecture humaine une par une, portent la mention là où on les voit en premier, en vrai
  // texte, affichée, lue par les lecteurs d'écran, et placée avant le texte qu'elle signale : l'accueil (avec
  // un lien vers « Usage de l'IA »), la première question (visible dès l'arrivée, et son « En savoir plus » dit
  // que rien n'est relu un par un), « Les sujets » (la tête de la page et chacune des fiches), la fiche d'un
  // candidat (positions et parcours) et le lecteur vidéo (sous le titre, pendant la lecture). Aucune ne
  // prétend à une relecture ni à une responsabilité éditoriale.
  {
    const actx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const ap = await actx.newPage()
    const plain = s => (s ?? '').replace(/\u00ad/g, '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
    /** Contrôle une mention : `follows`, le texte qu'elle doit précéder ; `inView`, visible sans défiler */
    const mention = async (where, path, sel, lead, opts = {}) => {
      await ap.goto(U(path))
      if (opts.before) await opts.before()
      const label = ap.locator(sel).first()
      await label.waitFor({ timeout: 4000 }).catch(() => null)
      const found = (await label.count()) > 0
      const r = found
        ? await label.evaluate((el, follows) => {
            const box = el.getBoundingClientRect()
            const next = follows ? document.querySelector(follows) : null
            return {
              text: el.textContent ?? '',
              shown: box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[aria-hidden="true"], [inert]:not(dialog)'),
              first: !next || !!(el.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING),
              inView: box.top >= 0 && box.bottom <= innerHeight,
            }
          }, opts.follows ?? null)
        : { text: '', shown: false, first: false, inView: false }
      // Ce que lit un lecteur d'écran : la mention fait partie de l'arbre d'accessibilité, en toutes lettres
      const spoken = found ? plain(await label.ariaSnapshot().catch(() => '')) : ''
      const text = plain(r.text)
      const ok =
        r.shown && text.includes(lead) && spoken.includes(lead) && r.first && (!opts.inView || r.inView) && !/responsabilité éditoriale|\brelue?s? par\b/i.test(text)
      return { ok, where, lead, shown: r.shown, first: r.first, inView: r.inView }
    }
    const results = []
    results.push(await mention('accueil', '/', '.home-proof .trust-ai', 'Textes rédigés par IA, vérifiés automatiquement'))
    const homeLink = await ap.locator(`.home-proof .trust-ai a[href="${L('/methode/ia')}"]`).count()
    results.push(await mention('question 1', '/feuille/1', '.q-col .q-ai', 'Textes rédigés par IA', { follows: '.approaches', inView: true }))
    await ap.locator('.q-col .q-ai summary').click()
    const note = plain(await ap.locator('.q-col .q-ai .ai-label-note').innerText().catch(() => ''))
    const noteOk = /rédigés par une IA \(Claude, d’Anthropic\)/.test(note) && note.includes('ne sont pas relus un par un par une personne') && note.includes('Signalez-la')
    results.push(await mention('tête de « Les sujets »', '/sujets', '.topics-ai', 'Fiches rédigées par IA', { follows: '.topic-fiche' }))
    results.push(await mention('fiche de « Les sujets »', '/sujets', '.topic-fiche .ex-body > .ai-label', 'Rédigé par IA', { follows: '.topic-fiche .ex-summary' }))
    const fichesAll = await ap.locator('.topic-fiche').count()
    const fichesLabelled = await ap.locator('.topic-fiche').evaluateAll(
      fs =>
        fs.filter(f => {
          const l = f.querySelector('.ex-body > .ai-label:first-child')
          return !!l && l.getClientRects().length > 0 && !l.closest('[aria-hidden="true"]') && (l.textContent ?? '').includes('Rédigé par IA')
        }).length,
    )
    results.push(await mention('positions d’un candidat', `/candidat/${FICHE.id}`, '.positions-ai', 'Positions résumées par IA', { follows: '.bristol' }))
    if (FICHE.bio?.length) results.push(await mention('parcours d’un candidat', `/candidat/${FICHE.id}`, '.bio-ai', 'Rédigé par IA', { follows: '.fiche-bio .timeline' }))
    if (VIDEOS_SHOWN) results.push(await mention('page des vidéos', '/videos', '.videos-ai', 'Textes rédigés par IA', { follows: '.vl-serie' }))
    if (SA) {
      results.push(
        await mention('lecteur vidéo', '/videos', '.vp-video:not([inert]) .vp-ai', 'Texte rédigé par IA', {
          before: async () => {
            await ap.locator(`.vl-btn[data-video="${SA.videos[0].id}"]`).click()
            await ap.locator('dialog.vp[open]').waitFor()
          },
          follows: '.vp-video:not([inert]) .vp-stage-wrap',
          inView: true,
        }),
      )
    }
    const missing = results.filter(r => !r.ok)
    check(
      missing.length === 0 && homeLink === 1 && noteOk && fichesAll > 0 && fichesLabelled === fichesAll,
      `mention IA en toutes lettres : ${results.length - missing.length}/${results.length} emplacements (accueil, question 1, « Les sujets », fiche candidat, page des vidéos, lecteur vidéo), ${fichesLabelled}/${fichesAll} fiches des sujets, « En savoir plus » de la question : pas relu un par un ${noteOk}${
        missing.length ? ` ; manque : ${missing.map(r => `${r.where} (« ${r.lead} » affichée ${r.shown}, avant le texte ${r.first}, visible à l’arrivée ${r.inView})`).join(' ; ')}` : ''
      }${homeLink === 1 ? '' : ' ; accueil sans lien vers « Usage de l’IA »'}`,
    )
    await actx.close()
  }

  // 8. Texte agrandi (réglage du navigateur) : la réglette ne glisse jamais sous la case « ligne rouge »,
  // et toucher « D'accord » donne bien « D'accord »
  for (const [width, scale] of [[320, 100], [320, 150], [360, 150], [320, 200], [390, 125]]) {
    const c = await browser.newContext({ viewport: { width, height: 740 }, hasTouch: true, reducedMotion: 'reduce' })
    const p = await c.newPage()
    await p.addInitScript(sc => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${sc}%`)), scale)
    await p.goto(U('/feuille/1'))
    await p.waitForSelector('.approaches > li')
    const geometry = await p.evaluate(() => {
      const doc = document.documentElement
      // l'accueil aussi doit tenir dans la largeur : on le mesure dans un second temps
      const rows = [...document.querySelectorAll('.approaches > li')].map(li => {
        const ruler = li.querySelector('.ruler').getBoundingClientRect()
        const box = li.querySelector('.approach-reject').getBoundingClientRect()
        return box.top >= ruler.bottom - 1 || ruler.right <= box.left + 1
      })
      return { overflow: doc.scrollWidth - doc.clientWidth, clear: rows.every(Boolean) }
    })
    const row = p.locator('.approaches > li').nth(1)
    await row.locator('.cran').nth(2).scrollIntoViewIfNeeded()
    const agree = await row.locator('.cran').nth(2).boundingBox()
    await p.touchscreen.tap(agree.x + agree.width / 2, agree.y + agree.height / 2)
    const state = await row.evaluate(li => ({
      agree: li.querySelectorAll('input[type=radio]')[2].checked,
      red: li.querySelector('.approach-reject').getAttribute('aria-pressed'),
    }))
    await p.goto(HOME)
    await p.waitForSelector('.home-film .film-stage')
    // Le film en images fixes (mouvement réduit) : on passe chacune des scènes et on garde le pire débordement
    const pageOverflow = () => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    const chapters = p.locator('.film-chapter')
    const scenes = await chapters.count()
    let homeOverflow = await pageOverflow()
    for (let i = 0; i < scenes; i++) {
      await chapters.nth(i).click()
      await p.waitForFunction(n => document.querySelectorAll('.film-chapter')[n]?.getAttribute('aria-current') === 'step', i, { timeout: 2000 }).catch(() => null)
      homeOverflow = Math.max(homeOverflow, await pageOverflow())
    }
    await p.goto(U(`/candidat/${FICHE.id}`))
    await p.waitForSelector('.bristol')
    const ficheOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    // Les sujets : les fiches et leurs graphiques tiennent aussi dans la largeur
    await p.goto(U('/sujets'))
    await p.waitForSelector('.topic-fiche .fchart')
    const topicsOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    // Écran court face au texte : la barre des familles ne colle plus, et aucun élément qui reçoit le focus
    // ne disparaît sous l'en-tête ou la barre du bas (WCAG 2.4.11)
    if (scale === 200) {
      await p.evaluate(() => document.querySelector('main h1')?.focus())
      const hiddenStops = []
      for (let k = 0; k < 40; k++) {
        await p.keyboard.press('Tab')
        const stop = await p.evaluate(() => {
          const a = document.activeElement
          if (!a || a === document.body || a.closest('.form-header, .action-bar, .fiche-filters, .skip')) return null
          const top = document.querySelector('.form-header').getBoundingClientRect().bottom
          const bottom = document.querySelector('.action-bar').getBoundingClientRect().top
          const r = a.getBoundingClientRect()
          return r.height > 0 && (r.bottom <= top || r.top >= bottom) ? (a.textContent ?? '').trim().slice(0, 30) : null
        })
        if (stop) hiddenStops.push(stop)
      }
      const loose = await p.locator('.topics-filters').evaluate(b => getComputedStyle(b).position === 'static')
      check(loose && hiddenStops.length === 0, `texte à 200 % sur ${width} px : barre des familles non collante, aucun focus masqué sur les sujets${hiddenStops.length ? ` (${hiddenStops.join(', ')})` : ''}`)
    }
    // La page des vidéos : elle tient dans la largeur, et rien ne sort d'un bouton d'ouverture
    if (VIDEOS_SHOWN) {
      await p.goto(U('/videos'))
      await p.waitForSelector('.vl-btn')
    }
    const videos = !VIDEOS_SHOWN ? { overflow: 0, out: 0 } : await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      out: [...document.querySelectorAll('.vl-btn')].flatMap(b => {
        const r = b.getBoundingClientRect()
        return [...b.querySelectorAll('.vl-btn-label, .vl-btn-meta, .vp-glyph')].filter(e => {
          const x = e.getBoundingClientRect()
          return x.right > r.right + 0.5 || x.left < r.left - 0.5
        })
      }).length,
    }))
    check(
      geometry.overflow <= 0 && scenes === 5 && homeOverflow <= 0 && ficheOverflow <= 0 && topicsOverflow <= 0 && videos.overflow <= 0 && videos.out === 0 && geometry.clear && state.agree && state.red === 'false',
      `texte à ${scale} % sur ${width} px : réglette dégagée, « D’accord » au toucher, rien ne déborde (feuille ${geometry.overflow}px, accueil ${homeOverflow}px sur ${scenes} scènes, fiche candidat ${ficheOverflow}px, sujets ${topicsOverflow}px, vidéos ${videos.overflow}px et ${videos.out} libellé hors bouton)`,
    )
    await c.close()
  }

  // 9. Élections archivées, avec une horloge simulée (Date.now fixé, minuteries libres) : le bandeau d'archive
  // (données arrêtées, et « le vote est en cours » tant que le vote n'est pas clos), l'encart de l'accueil de
  // l'élection par défaut (pendant le vote, ou après si l'appareil garde une feuille de l'archive), et l'ancien
  // lien #/candidat/<id> vers un candidat de l'archive seule. Contrôles fondés sur le texte affiché et sur les
  // liens, pas sur les classes : l'archive doit le dire en toutes lettres.
  const archived = ELECTIONS.filter(e => e.archived)
  if (!archived.length) console.log('– archives : aucune élection archivée dans le registre, contrôles du bandeau et de l’encart sautés')
  const textOf = p => p.evaluate(() => (document.body.innerText ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '))
  const frenchDates = iso => {
    const d = new Date(`${iso}T12:00:00`)
    const month = d.toLocaleDateString('fr-FR', { month: 'long' })
    const day = d.getDate()
    return [`${day} ${month} ${d.getFullYear()}`, ...(day === 1 ? [`1er ${month} ${d.getFullYear()}`] : [])]
  }
  /** Une page à une date donnée, avec ou sans feuilles enregistrées */
  const at = async (when, path, stored = {}) => {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    await c.clock.setFixedTime(when)
    await c.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), stored)
    const p = await c.newPage()
    await p.goto(base + path)
    await p.locator('main h1').first().waitFor({ timeout: 6000 }).catch(() => null)
    await p.waitForTimeout(150)
    return { c, p }
  }
  for (const a of archived) {
    const apack = await a.load()
    const ends = [a.votingUntil, ...apack.election.rounds.map(r => r.end)].filter(Boolean).map(Date.parse).filter(t => !Number.isNaN(t))
    const lastRound = apack.election.rounds.at(-1)
    // Pendant le vote : une heure après l'ouverture du dernier tour (avant la fin du vote) ; après : le lendemain
    const during = a.votingUntil && lastRound ? new Date(Math.min(Date.parse(lastRound.start) + 3600e3, Date.parse(a.votingUntil) - 3600e3)) : null
    const afterVote = new Date(Math.max(...ends, Date.parse(`${apack.election.dataFrozenAt}T12:00:00`)) + 86400e3)
    const dates = frenchDates(apack.election.dataFrozenAt)
    const aHome = withBase(a.slug, '/')

    // Bandeau d'archive, sur l'accueil et sur une question de l'archive (qui reste utilisable)
    {
      for (const [label, when] of [['après le vote', afterVote], ...(during ? [['pendant le vote', during]] : [])]) {
        const issues = []
        for (const path of ['/', '/feuille/1']) {
          const { c, p } = await at(when, withBase(a.slug, path))
          const t = await textOf(p)
          if (!/\bArchive\b/.test(t)) issues.push(`${path} : pas de mention « Archive »`)
          if (!dates.some(d => t.includes(d))) issues.push(`${path} : date d’arrêt des données absente (${dates[0]})`)
          const voting = /vote est en cours/i.test(t)
          if (when === during && !voting) issues.push(`${path} : « le vote est en cours » absent`)
          if (when === afterVote && voting) issues.push(`${path} : « le vote est en cours » après la fin du vote`)
          if (path !== '/' && !(await p.locator('.approaches > li').count())) issues.push(`${path} : la question ne s’affiche pas`)
          await c.close()
        }
        check(issues.length === 0, `archive ${a.id}, ${label} (${when.toISOString().slice(0, 16)}) : bandeau « Archive », données arrêtées au ${dates[0]}${issues.length ? ` : ${issues.join(' ; ')}` : ''}`)
      }
    }

    // L'élection par défaut : l'encart qui mène à l'archive, et l'ancien lien vers un candidat de l'archive seule
    if (entry.slug === '') {
      const firstQ = apack.bank.questions.find(q => q.tier === 'essentiel')
      const kept = JSON.stringify({
        format: 3,
        electionId: a.id,
        dataVersion: apack.election.dataVersion,
        seed: '0123456789abcdef',
        answers: firstQ ? { [firstQ.id]: { ratings: { [firstQ.approaches[0].id]: 1 }, redLines: [] } } : {},
        weights: {},
        deepTopics: [],
        lastSeenRanking: null,
        dataUpdatedFrom: null,
        essentialDoneAt: null,
        updatedAt: afterVote.toISOString(),
      })
      const cases = [
        ...(during ? [['pendant le vote, sans feuille', during, {}, true]] : []),
        ['après le vote, sans feuille', afterVote, {}, false],
        ['après le vote, avec une feuille de l’archive', afterVote, { [`isoloir:${a.id}`]: kept }, true],
      ]
      const issues = []
      for (const [label, when, stored, expected] of cases) {
        const { c, p } = await at(when, '#/', stored)
        const box = p.locator(`main a[href^="${aHome}"]`).first()
        const shown = (await box.count()) > 0 && (await box.isVisible())
        if (shown !== expected) issues.push(`${label} : encart ${shown ? 'affiché' : 'absent'}`)
        if (shown && expected && label.includes('avec une feuille')) {
          await box.click()
          await p.waitForFunction(h => decodeURI(location.hash).startsWith(h), aHome, { timeout: 3000 }).catch(() => null)
          if (!decodeURI(new URL(p.url()).hash).startsWith(aHome)) issues.push(`${label} : le lien ne mène pas à ${aHome}`)
          // L'archive retrouve sa feuille, et la feuille de l'élection par défaut n'a rien reçu
          const keysNow = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir:')))
          if (keysNow.includes(`isoloir:${defaultEntry.id}`)) issues.push(`${label} : une feuille de ${defaultEntry.id} a été créée`)
        }
        await c.close()
      }
      check(issues.length === 0, `accueil de ${defaultEntry.id} : encart vers l’archive ${a.id} (${aHome}) pendant le vote ou si l’appareil garde sa feuille, absent sinon${issues.length ? ` : ${issues.join(' ; ')}` : ''}`)

      const only = a.candidateIds.find(id => !defaultEntry.candidateIds.includes(id))
      if (only) {
        const { c, p } = await at(afterVote, `#/candidat/${only}`)
        const target = withBase(a.slug, `/candidat/${only}`)
        await p.waitForFunction(h => decodeURI(location.hash) === h, target, { timeout: 3000 }).catch(() => null)
        const landedHash = decodeURI(new URL(p.url()).hash)
        const card = await p.locator('.bristol').first().isVisible().catch(() => false)
        check(landedHash === target && card, `ancien lien #/candidat/${only} : mène à l’archive (${landedHash}), fiche affichée ${card}`)
        await c.close()
      }
    }
  }
} finally {
  await browser.close()
  server.kill()
}
if (failures.length) {
  console.error(`\n${failures.length} échec(s)`)
  process.exitCode = 1
} else console.log(`\nFermez l’isoloir : tout marche hors ligne (${entry.id}${prefix ? `, #/${prefix}/…` : ''}).`)
