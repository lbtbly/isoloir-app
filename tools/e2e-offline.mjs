// Test de bout en bout « Fermez l'isoloir » : on charge la page, on coupe le réseau, et tout doit
// marcher jusqu'au bout (première tendance, suite du questionnaire, résultats, image, double), y compris un
// rechargement de la page sans réseau. Aucune requête ne doit viser un autre site.
// Contrôles annexes : accueil (film en héros, appel dans l'en-tête), anonymat des questions pas encore vues,
// tendance sans verdict, « Sans avis » entouré, légende de « Qui porte quoi », accords et désaccords par
// candidat, étoile de priorité dans la grille par thème, menu de l'en-tête (téléphone et grand écran), pied
// de page commun (liens vers la méthode et les notices, absents de l'en-tête), page « Les sujets » (toutes les fiches et leurs graphiques, sans approche ni candidat), graphique du contexte
// d'une question, en-tête identique partout (même hauteur à chaque largeur, sans nom de page), rien en largeur à 768 px, sommaire des sujets en
// défilement doux, vidéos des sujets (page « Les sujets en vidéo » et entrée du menu, séries, repère, sommaire,
// catégories, commande « Son » sans choix de voix, pas d'appel à donner son avis sur le site, entrées de « Les
// sujets », vidéo liée à une question ouverte par-dessus la feuille, adresses #/videos/<vidéo> et #/essai-videos,
// aucun son demandé sans voix inscrite, sous-titres seuls hors ligne), mention « rédigé par IA » (accueil,
// première question, « Les sujets », fiche candidat, page des vidéos, lecteur vidéo), réglette, film et sujets avec un texte
// agrandi (dont le focus jamais masqué).
// Usage : pnpm build && node tools/e2e-offline.mjs [port]
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const port = Number(process.argv[2] ?? 4320)
const base = `http://localhost:${port}/`
const server = spawn('pnpm', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' })
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
  await page.goto(base)
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
  check(await page.evaluate(() => !!navigator.serviceWorker.controller), 'la copie hors ligne contrôle la page')

  // 1 bis. Accueil au premier passage : le film fait tout le héros, l'en-tête porte l'appel principal
  await page.locator('.home-film .film-stage').waitFor()
  const firstCta = await page.locator('.header-cta').getAttribute('href').catch(() => null)
  const homeBars = await page.locator('.action-bar').count()
  check(firstCta === '#/feuille/1' && homeBars === 0, `accueil : l’en-tête mène à la question 1, pas de barre d’actions en bas (${firstCta}, ${homeBars} barre)`)
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
  await page.goto(base)
  await page.locator('.journey .approaches > li').nth(1).locator('.cran').nth(2).click()
  await page.locator('.jr-row').first().waitFor()
  const leaderName = (await page.locator('.jr-row .jr-name').first().textContent())?.trim()
  const posterFirst = (await page.locator('.poster-list li .poster-name').first().textContent())?.trim()
  check(leaderName === 'Candidat 2' && posterFirst === 'Candidat 2', `parcours de l’accueil : « D’accord » sur B place le candidat fictif 2 en tête, sur l’affiche aussi (${leaderName}, ${posterFirst})`)

  // 2 ter. Les candidats : la liste et une page, avec leurs positions et leurs sources
  await page.goto(`${base}#/candidats`)
  check((await page.locator('.people-panel').count()) === 5, 'la page « Les candidats » liste les cinq candidats')
  await page.locator('.people-panel-link').first().click()
  await page.locator('.position-row').first().waitFor()
  check((await page.locator('.position-row .source-links a').count()) > 10, 'une page candidat montre ses positions avec leurs sources')

  // 2 quater. Menu de l'en-tête, sur téléphone : le bouton ouvre le panneau ; Échap (le focus revient au
  // bouton), un clic ailleurs ou un lien suivi le referment ; ses liens mènent aux sujets et aux candidats
  await page.goto(`${base}#/candidats`)
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
  const followed = page.url().endsWith('#/sujets') && (await menuToggle.getAttribute('aria-expanded')) === 'false' && (await menuState())
  const sujetsCurrent = await menuPanel.locator('a[href="#/sujets"]').getAttribute('aria-current')
  check(
    menuOpened && menuLinks.join(' | ') === 'Les sujets #/sujets | Les vidéos #/videos | Les candidats #/candidats' && escClosed && outsideClosed && followed && sujetsCurrent === 'page',
    `menu de l’en-tête sur téléphone : ouvert ${menuOpened}, fermé par Échap ${escClosed}, par un clic ailleurs ${outsideClosed}, en suivant « Les sujets » ${followed} (${menuLinks.join(' | ')})`,
  )

  // 2 quinquies. Les sujets : une fiche par question, tous les graphiques, ni approche ni candidat
  const bankFile = JSON.parse(readFileSync(new URL('../research/choisir-2027/bank.json', import.meta.url), 'utf8')).bank
  const withContext = bankFile.questions.filter(q => q.explainer).length
  const chartCount = bankFile.questions.flatMap(q => q.explainer?.figures ?? []).filter(f => f.chart).length
  const candidateNames = [...readFileSync(new URL('../src/elections/choisir-2027/candidates.ts', import.meta.url), 'utf8').matchAll(/^\s+name: '([^']+)'/gm)].map(m => m[1])
  const topicsText = (await page.locator('main').innerText()).replace(/\s+/g, ' ')
  const fiches = await page.locator('.topic-fiche').count()
  const charts = await page.locator('.topic-fiche .fchart[role="img"][aria-label]').count()
  const approachShown = bankFile.questions.flatMap(q => q.approaches.map(a => a.text.replace(/\s+/g, ' '))).filter(t => topicsText.includes(t)).length
  const namesShown = candidateNames.filter(n => new RegExp(`\\b${n.split(' ').pop()}\\b`).test(topicsText))
  const voteParts = await page.locator('main .approaches, main .cran, main .initials, main .position-row').count()
  check(
    fiches === withContext && fiches > 0 && charts === chartCount && approachShown === 0 && namesShown.length === 0 && voteParts === 0,
    `page « Les sujets » : ${fiches} fiches sur ${withContext}, ${charts} graphiques sur ${chartCount}, aucune approche ni candidat affiché${namesShown.length ? ` (${namesShown.join(', ')})` : ''}`,
  )

  // 2 sexies. Dans la feuille, « Comprendre l'enjeu » dessine au moins un chiffre clé en graphique, dit en mots
  let sheetCharts = 0
  let sheetChartLabel = ''
  for (let n = 1; n <= 3 && !sheetCharts; n++) {
    await page.goto(`${base}#/feuille/${n}`)
    const explainer = page.locator('details.explainer')
    await explainer.waitFor()
    if (!(await explainer.evaluate(d => d.open))) await explainer.locator('summary').click()
    sheetCharts = await explainer.locator('[role="img"]').count()
    if (sheetCharts) sheetChartLabel = (await explainer.locator('[role="img"]').first().getAttribute('aria-label')) ?? ''
  }
  check(sheetCharts > 0 && sheetChartLabel.length > 10, `contexte d’une question : ${sheetCharts} graphique(s), décrit(s) en mots (« ${sheetChartLabel.slice(0, 60)}… »)`)
  await page.goto(`${base}#/sujets`)

  // 3. Les 8 questions du premier temps, au toucher, puis la première tendance
  await page.goto(`${base}#/feuille/1`)
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
  for (let n = 1; n <= 7; n++) await answerCurrent()
  await page.locator('.locator-count', { hasText: '08/08' }).waitFor()
  const eighth = (await page.locator('h1.q-prompt').textContent()) ?? ''
  check(eighth.includes('La France insoumise'), `la 8e question, dernière du premier temps, porte sur LFI (${eighth.slice(0, 50)}…)`)
  await answerCurrent()
  await page.waitForTimeout(150)
  check(page.url().endsWith('#/resultats'), `après 8 questions : première tendance (${page.url().split('#')[1]})`)
  check(await heading(page, 'Une première tendance'), 'le résultat est présenté comme une tendance')
  // Pas de verdict : ni affiche du plus proche, ni pourcentage dans le classement, ni partage ; l'appel à continuer
  // est un bouton large dans le héros, et le bouton principal de la barre continue aussi
  const heroCta = page.locator('.results-hero .trend a.btn-primary.is-wide')
  const heroCtaLabel = ((await heroCta.textContent().catch(() => '')) ?? '').trim()
  const trendPercents = (await page.locator('.board-list').innerText()).includes('%')
  const trendVerdict = await page.locator('.leader, .board-pct, .topics-block, .why-block, .agree, .prio').count()
  const trendShare = await page.locator('.results-bar a[href="#/partager"]').count()
  const barLabel = ((await page.locator('.action-bar-inner > .btn-primary').innerText()) ?? '').trim()
  check(
    trendVerdict === 0 && !trendPercents && trendShare === 0 && /^Continuer\u00a0: 11 questions/.test(heroCtaLabel) && barLabel.startsWith('Continuer'),
    `tendance : pas d’affiche, de pourcentage ni de partage ; bouton large « ${heroCtaLabel} », barre « ${barLabel.replace(/\s+/g, ' ')} »`,
  )

  // 3 bis. Qui porte quoi, à la première tendance : seules les questions vues sont révélées, sous une légende
  // visible qui sépare votre avis de ce que pensent les candidats
  await page.goto(`${base}#/proximite`)
  const legend = page.locator('.reveal-legend')
  const legendText = (await legend.isVisible()) ? await legend.innerText() : ''
  const legendSamples = await legend.locator('.rating-mark, .initials').count()
  check(
    legendText.includes('Votre avis') && legendText.includes('pas s’il pense comme vous') && legendSamples === 8,
    `qui porte quoi : légende visible, votre avis et les pastilles des candidats (${legendSamples} exemples)`,
  )
  await page.getByRole('button', { name: 'Toutes les questions vues' }).click()
  const revealed = await page.locator('.reveal').count()
  check(revealed === 8, `qui porte quoi ne révèle que les 8 questions vues (${revealed})`)
  await page.goto(`${base}#/`)
  const trendLink = ((await page.locator('.home-status a[href="#/resultats"]').textContent().catch(() => '')) ?? '').trim()
  check(trendLink === 'Voir la tendance', `accueil, feuille en cours : « ${trendLink} »`)
  await page.goto(`${base}#/resultats`)
  await heading(page, 'Une première tendance')

  // 4. Continuer : les 11 autres, les priorités, le résultat complet
  await page.locator('.action-bar-inner > .btn-primary').click()
  check(page.url().endsWith('#/feuille/9'), 'Continuer reprend à la question 9')
  check((await page.locator('.locator-count').textContent())?.trim() === '09/19', 'la progression passe à 09/19')
  for (let n = 9; n <= 19; n++) await answerCurrent()
  check(page.url().endsWith('#/priorites'), 'après 19 questions : les priorités')
  await page.locator('.action-bar-inner > .btn-primary').click()
  check(await heading(page, 'Votre dépouillement'), 'résultat complet, hors ligne')
  const boardRows = await page.locator('.board-row').count()
  const shortcuts = await page.locator('.results-bar .bar-mini:visible').count()
  check(
    boardRows === 5 && shortcuts === 2 && (await page.locator('.leader').count()) === 1,
    `dépouillement : l’affiche du plus proche, un seul classement (${boardRows} lignes), deux raccourcis dans la barre (${shortcuts})`,
  )

  // 4 ter. Accords et désaccords : deux barres par candidat (approches principales, autres positions)
  const agreeItems = await page.locator('.agree .agree-item').count()
  const agreeBars = await page.locator('.agree .agree-item .agree-row').count()
  const agreeSaid = ((await page.locator('.agree .agree-row .sr-only').first().textContent()) ?? '').trim()
  check(
    agreeItems === 5 && agreeBars === 10 && /^Ses approches principales\u00a0: \d+\u00a0accords?, \d+\u00a0désaccords?$/.test(agreeSaid),
    `accords et désaccords : ${agreeItems} candidats, ${agreeBars} barres (« ${agreeSaid} »)`,
  )
  // Une étoile par thème : la toucher fait compter le thème double (poids enregistré, ligne « Vos priorités »,
  // annonce), la retoucher le remet à 1
  // Le poids est enregistré après l'affichage : on attend l'écriture avant de le lire
  const doubled = () =>
    page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('isoloir:choisir-2027') ?? '{}').weights ?? {}).filter(w => w === 2).length)
  const savedDoubled = n =>
    page
      .waitForFunction(
        k => Object.values(JSON.parse(localStorage.getItem('isoloir:choisir-2027') ?? '{}').weights ?? {}).filter(w => w === 2).length === k,
        n,
        { timeout: 2000 },
      )
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

  // 4 bis. La fenêtre de confidentialité s'ouvre depuis la barre du bas et se ferme
  await page.goto(`${base}#/feuille/2`)
  await page.locator('.privacy-trigger').click()
  const dialogOpen = await page.locator('.privacy-dialog').evaluate(d => d.open)
  await page.getByRole('button', { name: 'Compris' }).click()
  const dialogClosed = await page.locator('.privacy-dialog').evaluate(d => !d.open)
  check(dialogOpen && dialogClosed, 'le cadenas de la barre ouvre puis ferme la fenêtre de confidentialité')

  // 5. Clavier : les flèches déplacent le repère d'une réglette
  await page.goto(`${base}#/feuille/3`)
  // Le changement de question envoie le focus au titre, après affichage : on l'attend avant de viser la réglette
  await page
    .waitForFunction(() => document.activeElement?.matches('main h1') && /^03\//.test(document.querySelector('.locator-count')?.textContent?.trim() ?? ''), null, { timeout: 3000 })
    .catch(() => null)
  const radio = page.locator('.approaches > li').nth(2).locator('input[type=radio]').nth(1)
  await radio.focus()
  await page.keyboard.press('ArrowRight')
  check(await page.locator('.approaches > li').nth(2).locator('input[type=radio]').nth(2).isChecked(), 'flèche droite : « d’accord »')

  // 6. L'image et le double se fabriquent sans réseau
  await page.goto(`${base}#/partager`)
  await page.waitForSelector('.share-preview img', { timeout: 5000 }).catch(() => null)
  check(await page.locator('.share-preview img').count() > 0, 'l’affiche JPG est fabriquée hors ligne')
  await page.goto(`${base}#/resultats`)
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Télécharger mon double (JSON)' }).click(),
  ])
  const file = JSON.parse(readFileSync(await download.path(), 'utf8'))
  const rated = file.readable.filter(r => r.avis.length >= 2 && !r.passee).length // la question 3 en a un de plus (test clavier)
  check(file.format === 3 && file.readable.length === 19 && rated === 19, `le double JSON contient les 19 réponses, chacune avec ses deux avis (${rated})`)

  // 7. Recharger la page sans réseau
  await page.reload()
  await page.waitForTimeout(400)
  check(await heading(page, 'Votre dépouillement'), 'rechargement hors ligne : la page et les réponses reviennent')
  check(await page.evaluate(() => document.fonts.check('1em "Archivo Variable"', 'œ’')), 'la police est disponible hors ligne')

  // 7 bis. Accueil : la date des 19 réponses ; fiche candidat : familles de thèmes et « Mes réponses »
  await page.goto(`${base}#/`)
  const doneNote = (await page.locator('.done-note').textContent().catch(() => '')) ?? ''
  check(/19 questions le \d+\s\S+\s20\d\d à \d+\u00a0h\u00a0\d\d/.test(doneNote), `l’accueil date les 19 réponses (${doneNote.trim()})`)
  // L'appel de l'en-tête mène désormais au dépouillement (libellé long ou court selon la largeur)
  const doneCta = page.locator('.header-cta')
  const doneHref = await doneCta.getAttribute('href').catch(() => null)
  const doneLabel = ((await doneCta.innerText().catch(() => '')) ?? '').trim()
  check(doneHref === '#/resultats' && /dépouillement/i.test(doneLabel), `après 19 réponses, l’en-tête mène au dépouillement (${doneHref}, « ${doneLabel} »)`)
  // 7 bis (en-tête). Le même partout : une seule rangée, de la même hauteur au pixel près sur chaque page
  // principale à chaque largeur (texte normal), avec ou sans appel, menu ouvert ou fermé ; le bouton « Menu »
  // et l'appel de l'accueil ont la même hauteur ; rien ne sort de la rangée ; et le nom de la page n'y figure
  // jamais (la page le porte déjà). Mesuré en ligne, sans le rideau du mode avion.
  const saved = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))
  // La tendance : les mêmes réponses, réduites aux questions du premier temps
  const stepOne = new Set(bankFile.questions.filter(q => q.step === 1).map(q => q.id))
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
  const videosPath = ((await page.locator('.form-header nav a', { hasText: /vidéos/i }).first().getAttribute('href', { timeout: 1000 }).catch(() => null)) ?? '#/essai-videos').slice(1)
  const headerStates = [
    [null, [['accueil', '/', '.home-film']]],
    [
      saved,
      [
        ['accueil (19 réponses)', '/', '.home-film'],
        ['question', '/feuille/2', '.approaches > li'],
        ['résultats', '/resultats', '.board-row'],
        ['sujets', '/sujets', '.topic-fiche'],
        ['candidats', '/candidats', '.people-panel-link'],
        ['fiche candidat', '/candidat/royal', '.bristol'],
        ['méthode', '/methode', 'main h1'],
        ['mentions légales', '/mentions-legales', 'main h1'],
        ['confidentialité', '/confidentialite', 'main h1'],
        ['vidéos', videosPath, 'main h1'],
      ],
    ],
    [trendSaved, [['tendance', '/resultats', '.board-row']]],
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
        await hp.goto(`${base}#${path}`)
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
    await zp.goto(`${base}#${path}`)
    await zp.locator(sel).first().waitFor()
    const bar = await measureBar(zp)
    if (bar.out.length || bar.wide) zoomIssues.push(`${what} (${bar.out.join(', ') || 'débord'})`)
  }
  await zctx.close()
  check(zoomIssues.length === 0, `en-tête, texte à 200 % sur 320 px : rien ne sort de la barre${zoomIssues.length ? ` : ${zoomIssues.join(', ')}` : ''}`)
  await page.goto(`${base}#/candidats`)
  await page.locator('.people-panel-link').first().click()
  await page.locator('.bristol').first().waitFor()
  const allCards = await page.locator('.bristol').count()
  await page.locator('.filter-select select').selectOption('immigration')
  const oneFamily = await page.locator('.bristol').count()
  await page.locator('.filter-select select').selectOption('')
  check(allCards === 23 && oneFamily === 1 && (await page.locator('.bristol').count()) === 23, `fiche candidat : 23 fiches, filtrables par famille (${allCards} → ${oneFamily})`)
  const before = await page.locator('.stance-you').count()
  await page.locator('.mine-toggle').click()
  const after = await page.locator('.stance-you').count()
  check(before === 0 && after > 5, `« Mes réponses » montre vos avis à côté des siens (${after})`)

  // 7 bis bis. Pied de page commun : sur chaque écran, les liens vers la méthode et les notices sont dans le
  // pied (repère « contentinfo »), jamais dans l'en-tête (ni en ligne ni dans le panneau du menu) ; défilé
  // jusqu'en bas, le dernier lien ne passe pas sous la barre d'actions ; la notice où l'on est est marquée
  const footScreens = ['/', '/feuille/2', '/resultats', '/proximite', '/candidats', '/candidat/royal', '/sujets', '/methode', '/confidentialite', '/mentions-legales', '/priorites', '/approfondir', '/partager']
  const notices = ['#/methode', '#/confidentialite', '#/mentions-legales']
  const footIssues = []
  for (const path of footScreens) {
    const titleBefore = await page.title()
    await page.goto(`${base}#${path}`)
    await page.waitForFunction(t => document.title !== t, titleBefore, { timeout: 3000 }).catch(() => null)
    await page.locator('main h1').first().waitFor()
    const landmarks = await page.getByRole('contentinfo').count()
    const f = await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight)
      const foot = document.querySelectorAll('footer.site-foot')
      const links = [...(foot[0]?.querySelectorAll('.site-foot-links a') ?? [])]
      const bar = document.querySelector('.action-bar')
      const last = links.at(-1)?.getBoundingClientRect()
      return {
        count: foot.length,
        hrefs: links.map(a => a.getAttribute('href')),
        current: links.filter(a => a.getAttribute('aria-current') === 'page').map(a => a.getAttribute('href')),
        inHeader: document.querySelectorAll('.form-header a[href="#/mentions-legales"], .form-header a[href="#/confidentialite"], .form-header a[href="#/methode"]').length,
        masked: !last || (!!bar && last.bottom > bar.getBoundingClientRect().top + 0.5),
      }
    })
    const expected = notices.includes(`#${path}`) ? `#${path}` : ''
    const ok = f.count === 1 && landmarks === 1 && f.hrefs.join(' ') === notices.join(' ') && f.current.join(' ') === expected && f.inHeader === 0 && !f.masked
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
  await wp.goto(`${base}#/sujets`)
  await wp.locator('.topic-fiche').first().waitFor()
  const inlineLinks = await wp
    .locator('.main-nav a')
    .evaluateAll(as => as.filter(a => a.offsetParent).map(a => `${a.textContent} ${a.getAttribute('aria-current') ?? '-'}`))
  const toggleShown = await wp.locator('.menu-toggle').isVisible()
  await wp.locator('.main-nav a[href="#/candidats"]').click()
  await wp.locator('.people-panel').first().waitFor()
  check(
    inlineLinks.join(' | ') === 'Les sujets page | Les vidéos - | Les candidats -' && !toggleShown && wp.url().endsWith('#/candidats'),
    `grand écran : menu en ligne (${inlineLinks.join(' | ')}), sans bouton « Menu », lien vers les candidats suivi`,
  )
  await wide.close()

  // 7 quater. Tablette : ni les sujets ni la fiche d'un candidat ne défilent en largeur (les textes pour
  // lecteurs d'écran des pastilles restent dans leur rangée qui défile)
  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 }, reducedMotion: 'reduce' })
  const tp = await tablet.newPage()
  const widthOverflow = () => tp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  await tp.goto(`${base}#/sujets`)
  await tp.waitForSelector('.topic-fiche .fchart')
  const topicsWide = await widthOverflow()
  await tp.goto(`${base}#/candidat/royal`)
  await tp.waitForSelector('.bristol')
  const ficheWide = await widthOverflow()
  check(topicsWide <= 0 && ficheWide <= 0, `768 px : rien ne déborde en largeur (sujets ${topicsWide}px, fiche candidat ${ficheWide}px)`)
  await tablet.close()

  // 7 quinquies. Sommaire des sujets sur téléphone, défilement doux (réglage par défaut) : le lien mène à sa
  // fiche, dont le titre a le focus et se voit sous la barre des familles ; le sommaire s'est replié
  const smooth = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' })
  const sp = await smooth.newPage()
  await sp.goto(`${base}#/sujets`)
  await sp.waitForSelector('.topic-fiche')
  await sp.locator('.topics-toc summary').click()
  const tocLink = sp.locator('.topics-toc a').nth(39)
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
    `sommaire des sujets sur téléphone : le 40e lien mène à sa fiche (titre à ${landed.top} px, sous la barre à ${landed.below} px, focus ${landed.focused}, sommaire replié ${!landed.open})`,
  )
  await smooth.close()

  // 7 sexies. Vidéos « Les sujets », intégrées au site : la page « Les sujets en vidéo » (#/videos, dans le menu,
  // les séries par famille, sans jargon d'essai ni choix de voix), le lecteur (repère de série, sommaire en un
  // geste, catégories qui mènent à une série, commande « Son » simple, aucun appel à « donner son avis » sur le
  // site, focus rendu à la fermeture), les entrées de « Les sujets » (fil, thème), une question avec une vidéo liée
  // (le lecteur s'ouvre par-dessus, la réponse reste, « retour » depuis une fiche le rouvre), les adresses
  // (#/videos/<vidéo>, l'ancienne #/essai-videos), aucun son demandé tant que l'inventaire est vide, et, hors
  // ligne, les vidéos en sous-titres seuls
  const audioInventory = JSON.parse(readFileSync(new URL('../src/ui/videos/audio-files.json', import.meta.url), 'utf8'))
  // Passages inscrits pour la voix du site ({ voices: { aigue: { <vidéo>: { <passage>: … } } } })
  const voicesListed = Object.values(audioInventory.voices?.aigue ?? {}).reduce((m, segs) => m + Object.keys(segs).length, 0)
  // Une série par thème de la banque, toutes écrites : la page et « Les sujets » les montrent toutes
  const bankTopics = JSON.parse(readFileSync(new URL('../research/choisir-2027/bank.json', import.meta.url), 'utf8')).bank.topics.length
  const flat = s => (s ?? '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const vctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' })
    const vp = await vctx.newPage()
    const sounds = []
    const strangers = []
    vp.on('request', r => {
      if (/\.m4a(\?|$)/.test(r.url())) sounds.push(r.url())
      if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) strangers.push(r.url())
    })
    await vp.goto(`${base}#/videos`)
    await vp.waitForSelector('.vl-btn')
    const page = await vp.evaluate(() => ({
      h1: document.querySelector('main h1')?.textContent ?? '',
      series: document.querySelectorAll('.vl-serie').length,
      families: document.querySelectorAll('.videos-family').length,
      buttons: document.querySelectorAll('.vl-btn').length,
      feed: document.querySelectorAll('.video-feed .video-play').length,
      menu: document.querySelectorAll('.form-header a[href="#/videos"]').length,
      jargon: /\b(piste|essai|inventaire)\b|Voix grave|Voix aiguë|passages? sur \d/i.test(document.querySelector('main')?.textContent ?? ''),
    }))
    check(
      page.h1 === 'Les sujets en vidéo' && page.series === bankTopics && page.families >= 1 && page.buttons >= 2 * page.series && page.feed === 1 && page.menu >= 1 && !page.jargon,
      `vidéos, ${width} px : page « ${page.h1} », ${page.series} séries (thèmes : ${bankTopics}) en ${page.families} familles, ${page.buttons} vidéos, fil ${page.feed}, entrée du menu ${page.menu}, sans jargon d’essai ni choix de voix (${!page.jargon})`,
    )
    const mark = () => vp.locator('.vp-video:not([inert]) .vp-mark-text').evaluate(e => e.firstChild?.textContent ?? '')
    await vp.locator('.vl-btn[data-video="retraites-intro"]').click()
    await vp.locator('dialog.vp[open]').waitFor()
    const first = flat(await mark())
    await vp.keyboard.press('ArrowDown')
    await vp.waitForTimeout(300)
    const second = flat(await mark())
    check(first === 'Retraites · Introduction' && second === 'Retraites · 1 sur 4 — Âge de départ', `vidéos, ${width} px : repère de série (« ${first} », puis « ${second} »)`)
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
      toc.items === 5 && toc.here === 1 && toc.focus === 'vp-sheet-title' && picked === 'Retraites · 2 sur 4 — Financement' && focusIn,
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
    await vp.locator('.vp-cat-go', { hasText: 'Logement' }).click()
    await vp.waitForTimeout(300)
    const other = flat(await mark())
    const pleas = await vp.locator('dialog.vp').evaluate(d => /donnez votre avis/i.test(d.textContent) || !!d.querySelector('.vp-end-cta'))
    check(other === 'Logement · Introduction' && !pleas, `vidéos, ${width} px : catégorie → « ${other} », aucun appel à donner son avis sur le site`)
    const wideSide = width >= 1440 ? await vp.locator('.vp-side').isVisible() : true
    const overflow = await vp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    // Fermer : la page est toujours là, le focus revient au bouton qui avait ouvert le lecteur
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const closed = await vp.evaluate(() => ({ open: !!document.querySelector('dialog.vp[open]'), focus: document.activeElement?.getAttribute('data-video'), hash: location.hash }))
    check(
      (voicesListed || sounds.length === 0) && strangers.length === 0 && wideSide && overflow <= 0 && !closed.open && closed.focus === 'retraites-intro' && closed.hash === '#/videos',
      `vidéos, ${width} px : ${sounds.length} son demandé (inventaire : ${voicesListed}), aucune requête vers un autre site, rien ne déborde${width >= 1440 ? ', flèches à côté de la popin' : ''}, fermé avec le focus rendu (${closed.focus}, ${closed.hash})`,
    )

    // « Les sujets » : l'accès au fil en tête de page, et la vidéo d'un thème qui a sa série
    await vp.goto(`${base}#/sujets`)
    await vp.waitForSelector('.topic-video .video-play')
    const topics = await vp.evaluate(() => ({
      feed: document.querySelectorAll('.wide-hero .video-feed .video-play').length,
      themes: document.querySelectorAll('.topic-theme-head .topic-video').length,
      retraites: !!document.querySelector('#theme-retraites')?.closest('.topic-theme')?.querySelector('.topic-video [data-video="retraites-intro"]'),
      fiches: document.querySelectorAll('.topic-fiche').length,
      linked: [...document.querySelectorAll('.topic-fiche')].filter(f => f.querySelector('.video-link')).length,
    }))
    await vp.locator('.topic-video [data-video="logement-intro"]').click()
    await vp.locator('dialog.vp[open]').waitFor()
    const fromTopic = flat(await mark())
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const topicBack = await vp.evaluate(() => document.activeElement?.getAttribute('data-video'))
    check(
      topics.feed === 1 && topics.themes === bankTopics && topics.fiches > 0 && topics.linked === topics.fiches && topics.retraites && fromTopic === 'Logement · Introduction' && topicBack === 'logement-intro',
      `vidéos dans « Les sujets », ${width} px : fil en tête (${topics.feed}), ${topics.themes}/${bankTopics} thèmes avec leur vidéo, ${topics.linked}/${topics.fiches} fiches avec un lien vidéo, ouverte sur « ${fromTopic} », focus rendu (${topicBack})`,
    )

    // Une question avec une vidéo liée : le lecteur s'ouvre par-dessus la feuille, la réponse reste, le focus revient
    let k = 0
    for (let i = 1; i <= 19 && !k; i++) {
      await vp.goto(`${base}#/feuille/${i}`)
      await vp.waitForSelector('.q-prompt')
      await vp.waitForTimeout(300)
      if (await vp.locator('.q-video .video-link').count()) k = i
    }
    let question = { k, open: false, kept: false, focus: '', reopened: false, after: '' }
    if (k) {
      await vp.locator('.approaches > li').first().locator('.cran').nth(2).click()
      const linked = await vp.locator('.q-video .video-link').first().getAttribute('data-video')
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
      await vp.waitForFunction(() => location.hash.startsWith('#/sujets/'), null, { timeout: 3000 }).catch(() => null)
      await vp.locator('.topic-fiche').first().waitFor({ timeout: 3000 }).catch(() => null)
      await vp.goBack()
      await vp.locator('dialog.vp[open]').waitFor({ timeout: 4000 }).catch(() => null)
      const reopened = await vp.evaluate(n => location.hash === `#/feuille/${n}` && !!document.querySelector('dialog.vp[open]'), k)
      await vp.keyboard.press('Escape')
      await vp.waitForTimeout(400)
      const after = await vp.evaluate(() => `${location.hash} ${document.querySelector('dialog.vp[open]') ? 'ouvert' : 'fermé'} ${document.activeElement?.getAttribute('data-video') ?? ''}`)
      question = { k, open, kept, focus: focus === linked ? focus : `${focus} ≠ ${linked}`, reopened, after }
    }
    check(
      question.k > 0 && question.open && question.kept && !question.focus.includes('≠') && question.reopened && /fermé/.test(question.after),
      `vidéo liée à la question ${question.k}, ${width} px : lecteur par-dessus (${question.open}), réponse gardée (${question.kept}), focus rendu (${question.focus}), rouvert au retour d’une fiche (${question.reopened}), puis ${question.after}`,
    )

    // Adresses : #/videos/<vidéo> ouvre le lecteur sur cette vidéo (l'adresse redevient #/videos) ; l'ancienne page
    // d'essai mène à la page des vidéos
    await vp.goto(`${base}#/videos/logement-loyers`)
    await vp.locator('dialog.vp[open]').waitFor({ timeout: 4000 }).catch(() => null)
    const direct = flat(await mark().catch(() => ''))
    const directHash = await vp.evaluate(() => location.hash)
    await vp.keyboard.press('Escape')
    await vp.waitForTimeout(400)
    const directClosed = await vp.evaluate(() => ({ open: !!document.querySelector('dialog.vp[open]'), h1: document.querySelector('main h1')?.textContent }))
    await vp.goto(`${base}#/essai-videos`)
    await vp.waitForFunction(() => location.hash === '#/videos', null, { timeout: 3000 }).catch(() => null)
    await vp.waitForSelector('.vl-btn')
    const legacy = await vp.evaluate(() => ({ hash: location.hash, h1: document.querySelector('main h1')?.textContent }))
    check(
      direct === 'Logement · 1 sur 4 — Loyers' && directHash === '#/videos' && !directClosed.open && directClosed.h1 === 'Les sujets en vidéo' && legacy.hash === '#/videos' && legacy.h1 === 'Les sujets en vidéo',
      `adresses des vidéos, ${width} px : #/videos/logement-loyers → « ${direct} » (${directHash}), fermé sur la page ; #/essai-videos → ${legacy.hash}`,
    )
    await vctx.close()
  }
  // Hors ligne (mode avion, page rechargée depuis la copie hors ligne) : la vidéo avance en sous-titres seuls
  {
    const octx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const op = await octx.newPage()
    await op.goto(`${base}#/videos`)
    await op.evaluate(() => navigator.serviceWorker.ready)
    await op.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
    await octx.setOffline(true)
    await op.reload()
    await op.waitForSelector('.vl-btn')
    await op.locator('.vl-btn[data-video="retraites-intro"]').click()
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
      await ap.goto(`${base}#${path}`)
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
    const homeLink = await ap.locator('.home-proof .trust-ai a[href="#/methode/ia"]').count()
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
    results.push(await mention('positions d’un candidat', '/candidat/royal', '.positions-ai', 'Positions résumées par IA', { follows: '.bristol' }))
    results.push(await mention('parcours d’un candidat', '/candidat/royal', '.bio-ai', 'Rédigé par IA', { follows: '.fiche-bio .timeline' }))
    results.push(await mention('page des vidéos', '/videos', '.videos-ai', 'Textes rédigés par IA', { follows: '.vl-serie' }))
    results.push(
      await mention('lecteur vidéo', '/videos', '.vp-video:not([inert]) .vp-ai', 'Texte rédigé par IA', {
        before: async () => {
          await ap.locator('.vl-btn[data-video="retraites-intro"]').click()
          await ap.locator('dialog.vp[open]').waitFor()
        },
        follows: '.vp-video:not([inert]) .vp-stage-wrap',
        inView: true,
      }),
    )
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
    await p.goto(`${base}#/feuille/1`)
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
    await p.goto(base)
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
    await p.goto(`${base}#/candidat/royal`)
    await p.waitForSelector('.bristol')
    const ficheOverflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    // Les sujets : les fiches et leurs graphiques tiennent aussi dans la largeur
    await p.goto(`${base}#/sujets`)
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
    await p.goto(`${base}#/videos`)
    await p.waitForSelector('.vl-btn')
    const videos = await p.evaluate(() => ({
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
} finally {
  await browser.close()
  server.kill()
}
if (failures.length) {
  console.error(`\n${failures.length} échec(s)`)
  process.exitCode = 1
} else console.log('\nFermez l’isoloir : tout marche hors ligne.')
