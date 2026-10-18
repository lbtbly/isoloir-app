// Test de bout en bout « Fermez l'isoloir » : on charge la page, on coupe le réseau, et tout doit
// marcher jusqu'au bout (première tendance, suite du questionnaire, résultats, images à partager, double), y compris un
// rechargement de la page sans réseau. Aucune requête ne doit viser un autre site.
// « Transférez vos réponses » (#/autre-appareil) : code, image du QR code, copie par e-mail et caméra simulée, entre
// deux appareils hors ligne.
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
// agrandi (dont le focus jamais masqué), feuille enregistrée sous la clé de l'élection seule. Adresses retirées
// du site (la primaire « Choisir 2027 », #/primaire, #/archives : RETIRED_PREFIXES du registre) et anciens liens
// vers un candidat masqué, tous corrigés ; accueil sans rien de la primaire, même avec sa feuille sur l'appareil.
// « Mon profil politique » (#/profil) : ses entrées selon l'état de la feuille (accueil vierge : l'aperçu fictif après la
// liste de confiance ; feuille en cours : sous l'état de la feuille ; tendance : une ligne de « Où vous en êtes », pas de
// bandeau ; résultat complet : le bandeau sous l'affiche, le panneau et le lien sous « Par thème » ; accueil prêt : le
// cadre de l'accueil vierge, sa grille fictive et « Voir mon profil politique », sur toute la largeur en grand écran,
// dans la colonne de l'affiche avec des questions à revoir ; dès la première réponse, « ce ne sont pas vos réponses »
// au-dessus de la grille ; questions ajoutées : « de nouveau » après un avis, la phrase générale après tout passé ; le
// journal de l'accueil de retour, sa date dans sa colonne à 1 024 et 1 280 px), leurs liens et leurs teintes (celles
// des cases de la page, clair et sombre, contraste
// forcé) ; la page d'attente (pas encore de réponse, pas encore assez : le compte, le bouton qui ramène à la première
// question non vue, l'exemple fictif et, dessous, pleine et atténuée, sans tableau) ; la fiche « Pour lire plus de thèmes » (questionnaire rapide seul,
// mais pas tout approfondi) et « Approfondir ce thème », qui coche le thème ; puis la page lue sur l'appareil (mention
// IA), son graphique « une ligne par sujet » (axe, lignes, clavier, survol, plis, détail replié, chargé à son ouverture ;
// la barre collante des domaines et de leurs sujets : en cours, toucher, focus, clavier, hauteur collée) aux couleurs de
// l'échelle d'affinité et à elles seules (clair et sombre), sans nouvelle clé de stockage, sans défilement en largeur ni
// texte rogné ou mot coupé (320, 390, 1 280 px, texte à 125 et 200 %, entrées comprises), sans focus caché sous
// l'en-tête, l'axe collant ou l'en-tête des colonnes, et sans effet sur l'affiche JPG ; sa rubrique de la Méthode, hors
// ligne, chargée sans la page ; le statut « Lecture en cours » d'une page lourde, processeur bridé ; rien de tout cela
// sans axe.
// « Installer l'application » (#/installer), en imitant chaque appareil (iPhone avec Safari d'iOS 26 et 18, Android
// avec Chrome, ordinateur, Windows avec Firefox, fenêtre d'Instagram, appareil non reconnu) et le mode installé : la
// copie du code dans le geste, le bouton du navigateur sans invite de lui-même (le focus et le statut après sa fenêtre),
// le QR code de la seule adresse, l'avis de l'application ouverte vide, l'import par « Coller le code » et le
// presse-papiers vidé (et lui seul : jamais un texte collé puis effacé), les symboles des menus dits en mots, la feuille
// de la page chargée avec elle, le manifeste gardé hors ligne.
//
// Usage : pnpm build && node tools/e2e-offline.mjs [port] [--pack <id>] [--prefix <slug>]
//   --pack <id>     : l'élection à parcourir (par défaut, celle du registre sans préfixe : src/elections/index.ts)
//   --prefix <slug> : le préfixe tapé dans les adresses (par défaut, le slug de l'élection dans le registre ; un
//                     alias ou l'identifiant de l'élection par défaut sont corrigés par le site, et le contrôle
//                     porte alors aussi sur cette correction)
//   Exemples : node tools/e2e-offline.mjs ; node tools/e2e-offline.mjs 4321 --pack presidentielle-2027 --prefix presidentielle-2027
// Tout le reste vient des données : research/<id>/bank.json (questions, temps, question de fin, fiches),
// research/<id>/decisions.json (contrôle croisé du premier dépouillement), et le pack lui-même (candidats,
// familles de thèmes, périmètre vidéo, dates), lu avec le registre par Node (TypeScript sans compilation, Node 22.18+).
// Serveur d'aperçu : sortie 2 s'il ne démarre pas (port pris) ou s'il ne sert pas l'asset index-*.js de dist/index.html
// (un aperçu orphelin d'un autre worktree) ; il est toujours arrêté en partant, même sur SIGTERM ou SIGINT.
import { chromium } from 'playwright-core'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ROOT, importSite, loadElection, useSiteModules } from './site-modules.mjs'
import { readPdf } from './pdf-text.mjs'
import encodeQR from 'qr'

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
const { orderedQuestions } = await importSite('src/core/order.ts')
const { RETIRED_PREFIXES = [] } = await importSite('src/elections/index.ts')
// Seuil du score indicatif des non classés et accroche de l'affiche (décisions du propriétaire du 2026-10-15)
const { EXCLUDED_MIN_KNOWN } = await importSite('src/core/score.ts')
/** La paire de la légende, pleine puis atténuée, telle que la lit waitInfo (« pâle sauf net », 17 octobre 2026) */
const PAIR = await importSite('src/core/echiquierCopy.ts').then(T => `pleine ${T.KEY_NET.replace(/\s+/g, ' ')}|atténuée ${T.KEY_FLAT.replace(/\s+/g, ' ')}`)
const { leaderLead } = await importSite('src/core/resultsCopy.ts')
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
/**
 * Candidats notés : hors les non classés de l'élection (election.ranking.excluded), sans rang nulle part ; leur score
 * indicatif, pour information seulement, est à part sous le classement (décision du propriétaire du 14 octobre 2026)
 */
const EXCLUDED = new Set(pack.election.ranking?.excluded?.ids ?? [])
const NS = pack.candidates.filter(c => !EXCLUDED.has(c.id)).length
const STORAGE = `isoloir:${entry.id}`
/** « Mon profil politique » : seulement pour une élection dont la grille des nuances a un axe */
const PROFILE = !!pack.election.spectrum?.axis?.length
// « Faire les comptes » : l'élection a des leviers (src/elections/<id>/budget.ts, ui/budget/load.ts), hors archive
const COMPTES = !pack.election.archived && existsSync(new URL(`../src/elections/${pack.election.id}/budget.ts`, import.meta.url))
/** La couleur de chaque bloc de l'axe, celle de la page des candidats : rouge, jaune, bleu */
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
/** Un périmètre vide (élection en attente de ses séries) : ni page, ni entrée de menu, ni lien */
const VIDEOS_SHOWN = !scope || Object.keys(scope.topics).length > 0
const topicLabel = id => pack.bank.topics.find(t => t.id === id)?.label
// Les séries telles que les montre l'édition de cette élection (src/ui/videos/editions), le cas échéant
const { EDITIONS } = await importSite('src/ui/videos/editions/index.ts')
const { applyEdition } = await importSite('src/ui/videos/editions/apply.ts')
const edition = scope?.edition ? EDITIONS[scope.edition] : undefined
/** Questions d'une vidéo dans cette élection : natives (édition) ou traduites par le périmètre */
const questionsOf = v => (v.nativeQuestionIds || !scope ? v.questionIds : v.questionIds.map(q => scope.questions[q]).filter(Boolean))
const SERIES = allSeries
  .map(s => applyEdition(s, edition))
  .map(s => ({ s, topic: scope ? scope.topics[s.topicId] : s.topicId }))
  .filter(({ topic }) => topic && topicLabel(topic))
  .map(({ s, topic }) => ({
    ...s,
    topic,
    // Libellé du repère : celui de la série, ou celui du thème de l'élection (périmètre réétiqueté)
    labels: [...new Set([s.label, topicLabel(topic)])],
    deepQuestions: s.videos.filter(v => v.kind === 'deep').flatMap(questionsOf),
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
let serverExit = null
server.on('exit', (code, signal) => {
  serverExit = { code, signal }
})
const stopServer = () => {
  try {
    server.kill()
  } catch {
    // déjà arrêté
  }
}
// Tué de l'extérieur (délai d'un lanceur, session close) : ne jamais laisser l'aperçu tourner derrière soi
process.on('SIGTERM', () => {
  stopServer()
  process.exit(143)
})
process.on('SIGINT', () => {
  stopServer()
  process.exit(130)
})
await new Promise(r => setTimeout(r, 1500))
// Le serveur est-il le nôtre, et sert-il ce dist/ ? Avec --strictPort, un port pris fait sortir vite aussitôt, en
// silence : sans ce contrôle, l'e2e parcourrait l'aperçu orphelin d'un autre worktree, et son dist à lui
const indexAssetIn = html => /assets\/index-[A-Za-z0-9_-]+\.js/.exec(String(html ?? ''))?.[0] ?? null
if (serverExit) {
  console.error(`Le serveur d’aperçu n’a pas démarré (port ${port} pris ?) : code ${serverExit.code ?? serverExit.signal}`)
  process.exit(2)
}
{
  const expected = indexAssetIn(readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8'))
  let served = null
  try {
    served = indexAssetIn(await (await fetch(base, { signal: AbortSignal.timeout(10000) })).text())
  } catch (e) {
    served = `illisible (${e?.message ?? e})`
  }
  if (!expected || served !== expected) {
    console.error(`Le serveur du port ${port} ne sert pas ce dist/ (${served ?? 'aucun asset'} au lieu de ${expected ?? 'aucun asset dans dist/index.html'}) : un autre aperçu tourne-t-il ?`)
    stopServer()
    process.exit(2)
  }
}

const failures = []
/** Fichiers du transfert de réponses (image du QR code, vidéo de la caméra simulée), hors du dépôt */
const transferDir = mkdtempSync(join(tmpdir(), 'isoloir-e2e-'))
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

// « Mon profil politique » : ses entrées et sa page d'attente
/** Ce que dit la page d'attente (#/profil avant le résultat complet) */
const waitInfo = pg =>
  pg.evaluate(() => {
    const t = sel => (document.querySelector(sel)?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
    const cta = document.querySelector('main .profile-wait a.btn-primary')
    const tiles = [...document.querySelectorAll('main .ex-grid[aria-hidden="true"] .tile')]
    // Sous l'exemple, la paire de la légende (décision du propriétaire du 17 octobre 2026) : entre la grille et la phrase
    // des couleurs, ses mots et ses deux pastilles, pleine puis atténuée
    const pair = document.querySelector('main .profile-example .key-pair')
    return {
      where: t('main .profile-wait .trend-where'),
      count: t('main .profile-wait .trend-count'),
      text: t('main .profile-wait .trend-text'),
      cta: (cta?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').trim(),
      href: cta?.getAttribute('href') ?? null,
      tiles: tiles.length,
      words: tiles.every(x => (x.textContent ?? '').trim().length > 2),
      pair: pair?.checkVisibility() && pair.previousElementSibling?.matches('.ex-grid') && pair.nextElementSibling?.matches('.ex-key') ? [...pair.querySelectorAll('li')].map(li => `${li.querySelector('.tile')?.classList.contains('is-net') ? 'pleine' : 'atténuée'} ${(li.textContent ?? '').replace(/\s+/g, ' ').trim()}`).join('|') : null,
      tables: document.querySelectorAll('main table').length,
      deepen: t('main .wait-deepen').length > 20,
      focused: !!document.activeElement?.matches('main h1'),
    }
  })
/** L'entrée de l'accueil : sa forme, sa place, son lien et son texte */
const homeEntry = pg =>
  pg.evaluate(() => {
    const card = document.querySelector('.home-profile')
    const at = sel => document.querySelector(sel)
    const before = (a, b) => !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    return {
      n: document.querySelectorAll('.home-profile').length,
      ready: !!card?.classList.contains('is-ready'),
      // Dès la première réponse, la mention au-dessus de la grille (lue avant elle) ; pour un nouveau visiteur, dessous
      tagFirst: !!card?.querySelector('.hp-peek > .hp-tag.is-first:first-child'),
      href: card?.getAttribute('href') ?? null,
      afterProof: before(at('.home-proof'), card) && before(card, at('.journey')),
      afterStatus: !!card && card.previousElementSibling === at('.home-status') && before(card, at('.home-proof')),
      // L'accueil de retour (questionnaire complet) : sous l'affiche du plus proche, comme au dépouillement
      afterLeader: !!card && card.previousElementSibling === at('.welcome-back .back-leader'),
      tiles: card?.querySelectorAll('.hp-peek[aria-hidden="true"] .tile').length ?? 0,
      // Le texte du lien, sans les mots des cases de l'aperçu (masqués aux lecteurs d'écran), sa mention comprise
      text: [...(card?.querySelectorAll('.hp-tag, .hp-body, .pb-body') ?? [])].map(e => e.textContent).join(' ').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim(),
    }
  })
/**
 * Le fond des cases d'un palier, pleines et atténuées, sous un sélecteur : { « aff-tres-proche » : « rgb(…) »,
 * « aff-proche is-net » : « rgb(…) », « aff-mitige is-net is-sens-pres » : « rgb(…) », … } ; bad : une case pleine hors
 * de l'aplat de son palier (au palier « mitigé », de celui de son sens), une atténuée hors de sa teinte (« pâle sauf
 * net », décision du propriétaire du 17 octobre 2026) ; net : les cases pleines ; paliers : les paliers vus, pleins ou
 * atténués
 */
const tileColors = (pg, sel) =>
  pg.evaluate(sel => {
    const colors = {}
    const bad = []
    const paliers = new Set()
    let net = 0
    const probe = document.createElement('span')
    document.body.append(probe)
    const css = v => {
      probe.style.backgroundColor = v
      return getComputedStyle(probe).backgroundColor
    }
    for (const t of document.querySelectorAll(`${sel} .tile`)) {
      const k = [...t.classList].find(c => c.startsWith('aff-'))
      if (!k) continue
      paliers.add(k)
      const full = t.classList.contains('is-net')
      const sens = ['is-sens-pres', 'is-sens-loin'].find(c => t.classList.contains(c))
      const bg = getComputedStyle(t).backgroundColor
      colors[full ? `${k} is-net${sens ? ` ${sens}` : ''}` : k] = bg
      if (full) net++
      // Pleine : l'aplat de son palier ; au palier « mitigé », celui de « proche » ou de « éloigné », selon son sens
      const flat = k !== 'aff-mitige' ? k : sens === 'is-sens-pres' ? 'aff-proche' : sens === 'is-sens-loin' ? 'aff-eloigne' : null
      if (full && !flat) bad.push(`${k} pleine sans le sens de sa lecture`)
      if (sens && (!full || k !== 'aff-mitige')) bad.push(`${k}${full ? ' pleine' : ' atténuée'} avec ${sens}`)
      const want = css(full ? `var(--${flat ?? k})` : `var(--${k}-tint)`)
      if (bg !== want) bad.push(`${k}${full ? ' pleine' : ' atténuée'} : ${bg} au lieu de ${want}`)
    }
    probe.remove()
    return { colors, bad, net, paliers: paliers.size }
  }, sel)
/** Les mots coupés sur deux lignes (un mot dont les rectangles tiennent sur deux hauteurs) sous ces sélecteurs */
const cutWords = (pg, sel) =>
  pg.evaluate(sel => {
    const out = new Set()
    for (const el of document.querySelectorAll(sel)) {
      if (!el.checkVisibility()) continue
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.parentElement?.checkVisibility() || n.parentElement.closest('.sr-only')) continue
        for (const m of n.data.matchAll(/[^\s\u00a0]+/g)) {
          const r = document.createRange()
          r.setStart(n, m.index)
          r.setEnd(n, m.index + m[0].length)
          if (new Set([...r.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))).size > 1) out.add(m[0])
        }
      }
    }
    return [...out]
  }, sel)

console.log(`Élection ${entry.id}${entry.slug ? ` (#/${entry.slug}/…)` : ' (par défaut, #/…)'}${prefix !== entry.slug ? `, visitée par #/${prefix}/…` : ''} : ${N} candidats, ${QUICK} questions rapides dont ${STEP1} au premier dépouillement`)

// 0. Les données lues ici sont celles du site : bank.json (research) et le pack (src) disent la même chose
{
  const ids = qs => qs.map(q => `${q.id}:${q.tier}:${q.step ?? '-'}:${q.last ? 'L' : ''}`).sort().join(' ')
  const same = ids(bankFile.questions) === ids(pack.bank.questions)
  const step1Ok = !decisions.step1 || [...decisions.step1].sort().join(' ') === step1Qs.map(q => q.id).sort().join(' ')
  const lastOk = !decisions.lastInStep || !closingQ || decisions.lastInStep.includes(closingQ.id)
  // Mêmes candidats publiés, chacun avec les mêmes approches
  const table = t => Object.entries(t ?? {}).map(([c, ps]) => `${c}:${Object.keys(ps).sort().join(',')}`).sort().join(' ')
  // Candidats masqués (election.hidden) : publiés dans research/<id>/bank.json, retirés du pack à son chargement
  const hidden = new Set(pack.election.hidden ?? [])
  const published = Object.fromEntries(Object.entries(researchBank.positions ?? {}).filter(([c]) => !hidden.has(c)))
  const positionsOk = table(published) === table(pack.positions) && Object.keys(pack.positions).sort().join(' ') === pack.candidates.map(c => c.id).sort().join(' ')
  check(
    same && step1Ok && lastOk && positionsOk,
    `données : research/${entry.id}/bank.json et le pack concordent (questions ${same}, candidats ${positionsOk}), premier dépouillement conforme à decisions.json (${step1Ok}${closingQ ? `, « ${closingQ.id} » en dernier ${lastOk}` : ''})`,
  )
}

// Jamais de son pendant les essais : la machine est celle du propriétaire
let browser = null
try {
  browser = await chromium.launch({ args: ['--mute-audio'] })
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  const foreign = []
  page.on('request', r => {
    const u = r.url()
    // mailto: (copie par e-mail des réponses) n'est pas une requête : le navigateur passe le message à la messagerie
    if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:') && !u.startsWith('mailto:')) foreign.push(u)
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
  // Son libellé parle de questions, jamais de feuille (décision du propriétaire du 17/10/2026) : le long, ou le court
  // quand la place manque
  const ctaShown = flat(await page.locator('.header-cta').innerText().catch(() => ''))
  check(
    firstCta === L('/feuille/1') && homeBars === 0 && ['Répondre aux questions', 'Répondre'].includes(ctaShown),
    `accueil : l’en-tête mène à la question 1 par « ${ctaShown} », pas de barre d’actions en bas (${firstCta}, ${homeBars} barre)`,
  )
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

  // 1 quater. « Mon profil politique » sur l'accueil vierge : l'aperçu fictif après la liste de confiance (15 cases
  // décoratives, « Exemple fictif », quand la page s'affiche, « Voir où j’en suis et un exemple ») ; il mène à la page d'attente (rien
  // de vu, un exemple aux cases de la page, sans tableau, rien d'enregistré), dont les cases ont les mêmes teintes
  if (PROFILE) {
    const fresh = await homeEntry(page)
    check(
      fresh.n === 1 && !fresh.ready && fresh.href === L('/profil') && fresh.afterProof && fresh.tiles === 15 && fresh.text.includes('Exemple fictif') && !fresh.text.includes('pas vos réponses') && !fresh.tagFirst && fresh.text.includes('Voir où j’en suis et un exemple') && fresh.text.includes(`Il s’affiche au bout des ${QUICK} questions du questionnaire rapide.`) && !fresh.text.includes('Voir mon profil politique'),
      `mon profil politique, accueil vierge : aperçu après la liste de confiance ${fresh.afterProof}, ${fresh.tiles} cases masquées aux lecteurs d’écran, « ${fresh.text.slice(0, 90)}… »`,
    )
    await page.locator('.home-profile').click()
    await page.locator('main .profile-wait').waitFor()
    await page.waitForFunction(() => document.activeElement?.matches('main h1'), null, { timeout: 2000 }).catch(() => null)
    const w = await waitInfo(page)
    const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir')))
    check(
      hashOf(page) === L('/profil') && w.focused && w.where === 'Pas encore de réponse' && w.count === `0 question sur ${QUICK}` && w.cta === 'Répondre aux questions' && w.href === L('/feuille/1') && w.tiles === 15 && w.words && w.pair === PAIR && w.tables === 0 && w.deepen && keys.length === 0,
      `mon profil politique, page d’attente (feuille vierge) : focus au titre ${w.focused}, « ${w.where} », « ${w.count} », bouton « ${w.cta} » vers ${w.href}, exemple de ${w.tiles} cases avec leurs mots ${w.words}, dessous « ${w.pair} », ${w.tables} tableau, rien d’enregistré (${keys.join(', ') || 'aucune clé'})`,
    )
    // Les teintes de l'aperçu sont celles des cases de la page, en clair comme en sombre : pleines sur les lectures
    // fictives nettes (PROFILE_PEEK_NET), atténuées ailleurs ; en contraste forcé, chaque case garde son cadre, épais sur
    // une case pleine
    const { PROFILE_PEEK_NET } = await importSite('src/core/resultsCopy.ts')
    const fictive = [...PROFILE_PEEK_NET].filter(m => m !== '.').length
    const shades = {}
    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme })
      shades[scheme] = { page: await tileColors(page, 'main .ex-grid') }
    }
    await page.goBack()
    await page.locator('.home-profile').waitFor()
    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme })
      shades[scheme].home = await tileColors(page, '.home-profile')
    }
    await page.emulateMedia({ colorScheme: 'light', forcedColors: 'active' })
    const framed = await page.locator('.home-profile .tile').evaluateAll(ts =>
      ts.every(t => getComputedStyle(t).outlineStyle === 'solid' && parseFloat(getComputedStyle(t).outlineWidth) >= (t.classList.contains('is-net') ? 3 : 1)),
    )
    await page.emulateMedia({ colorScheme: 'light', forcedColors: 'none' })
    // Sorte de case par sorte de case (palier, pleine ou atténuée, sens d'un « mitigé » net), les mêmes sur la page et sur
    // l'accueil, et la même teinte ; les cinq paliers vus des deux côtés, pleins ou atténués ; chaque sorte de case a sa
    // teinte (une case nette « mitigé » prend celle de son sens, contrôlée par bad)
    const kinds = o => Object.keys(o).sort().join('|')
    const same = ['light', 'dark'].every(k => kinds(shades[k].page.colors) === kinds(shades[k].home.colors) && Object.keys(shades[k].page.colors).every(c => shades[k].page.colors[c] === shades[k].home.colors[c]))
    const five = ['light', 'dark'].every(k => shades[k].page.paliers === 5 && shades[k].home.paliers === 5)
    const own = Object.entries(shades.light.home.colors).filter(([c]) => !c.includes('is-sens-'))
    const distinct = new Set(own.map(([, v]) => v)).size === own.length
    const ruled = ['light', 'dark'].flatMap(k => [...shades[k].page.bad, ...shades[k].home.bad])
    const full = ['light', 'dark'].every(k => shades[k].page.net === fictive && shades[k].home.net === fictive)
    check(
      same && five && distinct && framed && full && !ruled.length,
      `mon profil politique, aperçu de l’accueil : les teintes des cases de la page, sorte par sorte (clair et sombre ${same} : ${kinds(shades.light.home.colors).replace(/\|/g, ', ')}), cinq paliers vus ${five}, une teinte par sorte de case ${distinct}, ${shades.light.home.net} cases pleines sur ${fictive} lectures fictives nettes ${full}, aplat ou teinte de leur palier ${ruled.length ? ruled.slice(0, 3).join(' ; ') : 'oui'}, cadre en contraste forcé ${framed}`,
    )
  } else {
    check((await page.locator('.home-profile').count()) === 0, 'accueil : pas d’entrée « Mon profil politique » sans axe de la grille')
  }

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
  const expectedMenu = [`Les sujets ${L('/sujets')}`, ...(VIDEOS_SHOWN ? [`Les vidéos ${L('/videos')}`] : []), `Les candidats ${L('/candidats')}`, ...(PROFILE ? [`À table ${L('/a-table')}`] : []), ...(COMPTES ? [`Faire les comptes ${L('/comptes')}`] : [])].join(' | ')
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
    // Ni dépouillement en PDF : comme l'affiche, il attend le résultat complet
    const trendPdf = await page.getByRole('button', { name: 'Télécharger mon dépouillement (PDF)' }).count()
    const barLabel = ((await page.locator('.action-bar-inner > .btn-primary').innerText()) ?? '').trim()
    check(
      trendVerdict === 0 && !trendPercents && trendShare === 0 && trendPdf === 0 && heroCtaLabel.startsWith(`Continuer\u00a0: ${QUICK - STEP1} question${QUICK - STEP1 > 1 ? 's' : ''}`) && barLabel.startsWith('Continuer'),
      `tendance : pas d’affiche, de pourcentage, de partage ni de PDF ; bouton large « ${heroCtaLabel} », barre « ${barLabel.replace(/\s+/g, ' ')} »`,
    )
    // Non classés pendant la tendance : nommés, sans rang, et sans score indicatif (ni pourcentage, ni phrase sur le score)
    if (EXCLUDED.size) {
      const trendOff = page.locator('.unranked.excluded')
      const trendOffItems = await trendOff.locator('.unranked-item').count()
      const trendOffText = (await trendOff.innerText().catch(() => '')) ?? ''
      check(
        trendOffItems === EXCLUDED.size && !trendOffText.includes('%') && !/score/i.test(trendOffText) && (await trendOff.locator('.unranked-score').count()) === 0,
        `tendance : les ${trendOffItems} non classés nommés, sans score indicatif ni pourcentage`,
      )
    }

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
    if (PROFILE) {
      const going = await homeEntry(page)
      const left = QUICK - STEP1
      // La ligne d'état compte les questions vues, comme l'aperçu juste dessous : les deux comptes font le questionnaire
      const status = flat(await page.locator('.home-status .progress-note').textContent().catch(() => ''))
      check(
        status.startsWith(`Vous avez vu ${STEP1} question${STEP1 > 1 ? 's' : ''} sur ${QUICK}.`),
        `accueil, feuille en cours : « ${status} », puis « encore ${left} » dans l’aperçu (${STEP1} + ${left} = ${QUICK})`,
      )
      check(
        going.n === 1 && !going.ready && going.afterStatus && going.tiles === 15 && going.tagFirst && going.text.startsWith('Exemple fictif : ce ne sont pas vos réponses.') && going.text.includes(`: encore ${left} question${left > 1 ? 's' : ''}.`),
        `mon profil politique, accueil d’une feuille en cours : l’aperçu sous l’état de la feuille ${going.afterStatus}, « …${going.text.slice(going.text.indexOf('Il s’affiche'), going.text.indexOf('Voir où j’en suis')).trim()} »`,
      )
    }
    await page.goto(U('/resultats'))
    await heading(page, 'Une première tendance')

    // 3 ter. « Mon profil politique » pendant la tendance : pas de bandeau ; un seul lien vers la page, dans la fiche « Où
    // vous en êtes » ; il mène à la page d'attente (hors ligne : son fichier est dans la copie hors ligne), qui dit ce
    // qui manque et ramène à la première question non vue, sans tableau
    if (PROFILE) {
      const trendBand = await page.locator('.results-profile').count()
      const trendLinks = await page.locator(`main a[href="${L('/profil')}"]`).evaluateAll(as => as.map(a => !!a.closest('.trend')))
      const line = flat(await page.locator('main .trend .trend-next').textContent().catch(() => ''))
      await page.locator('main .trend .trend-next a').click()
      await page.locator('main .profile-wait').waitFor()
      await page.waitForFunction(() => document.activeElement?.matches('main h1'), null, { timeout: 2000 }).catch(() => null)
      const w = await waitInfo(page)
      const left = QUICK - STEP1
      check(
        trendBand === 0 && trendLinks.length === 1 && trendLinks[0] && line === `Au bout des ${QUICK} questions : le dépouillement complet et « Mon profil politique ».`,
        `mon profil politique, pendant la tendance : pas de bandeau (${trendBand}), ${trendLinks.length} lien, dans « Où vous en êtes » (« ${line} »)`,
      )
      check(
        w.focused && w.where === 'Pas encore assez de réponses' && w.count === `${STEP1} questions sur ${QUICK}` && w.text.includes(`encore ${left} question`) && w.cta === `Continuer : ${left} question${left > 1 ? 's' : ''}` && w.href === L(`/feuille/${STEP1 + 1}`) && w.tiles === 15 && w.pair === PAIR && w.tables === 0,
        `mon profil politique, page d’attente (tendance, hors ligne) : « ${w.where} », « ${w.count} », « ${w.text} », bouton « ${w.cta} » vers ${w.href}, pleine et atténuée sous l’exemple ${w.pair === PAIR}, ${w.tables} tableau`,
      )
      await page.goto(U('/resultats'))
      await heading(page, 'Une première tendance')
    } else {
      check((await page.locator('.results-profile, .trend-next').count()) === 0, 'tendance : rien de « Mon profil politique » sans axe de la grille')
    }

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
  // L'accroche de l'affiche : « parmi les candidats classés » dès que des candidats sont hors classement ou non classés
  // (décision du propriétaire du 2026-10-15), sinon inchangée ; la même sur l'accueil de retour (contrôlé plus bas)
  const leadInfo = await page.evaluate(() => ({
    lead: (document.querySelector('.leader .leader-lead')?.textContent ?? '').trim(),
    off: document.querySelectorAll('.unranked').length > 0,
    all: [...document.querySelectorAll('.board-row')].every(r => r.classList.contains('is-flagged')),
  }))
  const leadWant = leaderLead(leadInfo.all, leadInfo.off)
  check(leadInfo.lead === leadWant, `affiche : « ${leadInfo.lead} »${leadInfo.lead === leadWant ? '' : `, attendu « ${leadWant} »`}`)
  // Non classés hors tendance (décision du propriétaire du 14 octobre 2026) : aucun au classement ; chacun avec sa
  // couverture de la banque et de vos réponses, et un score indicatif seulement si sa position est connue sur au moins
  // EXCLUDED_MIN_KNOWN de vos réponses (décision du propriétaire du 2026-10-15)
  let offScored = 0
  if (EXCLUDED.size) {
    const inBoard = await page.locator('.board-row[data-candidate]').evaluateAll(rows => rows.map(r => r.getAttribute('data-candidate')))
    const offRows = await page.locator('.unranked.excluded .unranked-item').evaluateAll(items =>
      items.map(li => ({
        name: li.querySelector('.unranked-name')?.textContent?.trim() ?? '',
        meta: li.querySelector('.unranked-meta')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
        score: li.querySelector('.unranked-score')?.textContent?.replace(/^,\s*/, '').trim() ?? null,
        flagged: li.classList.contains('is-flagged'),
        cross: !!li.querySelector('.unranked-flag .flag-mark'),
      })),
    )
    const offIssues = offRows.flatMap(r => {
      const known = /Connu sur (\d+) de vos \d+ réponses/.exec(r.meta)
      return [
        /Connu sur \d+ des \d+\squestions de la banque/.test(r.meta) ? '' : `${r.name} : couverture de la banque`,
        known ? '' : `${r.name} : couverture de vos réponses`,
        known && Number(known[1]) >= EXCLUDED_MIN_KNOWN && !/^Score indicatif\u00a0: \d+\u00a0%$/.test(r.score ?? '') ? `${r.name} : score « ${r.score} »` : '',
        known && Number(known[1]) < EXCLUDED_MIN_KNOWN && r.score !== null ? `${r.name} : un score connu sur ${known[1]} réponses seulement` : '',
        !r.flagged || r.cross ? '' : `${r.name} : ligne rouge franchie sans sa croix`,
      ].filter(Boolean)
    })
    const lede = ((await page.locator('.unranked.excluded .unranked-lede').innerText().catch(() => '')) ?? '').trim()
    offScored = offRows.filter(r => r.score !== null).length
    check(
      inBoard.every(id => !EXCLUDED.has(id)) &&
        offRows.length === EXCLUDED.size &&
        offIssues.length === 0 &&
        /pas de rang/.test(lede) &&
        /pour information seulement/.test(lede) &&
        new RegExp(`connue sur au moins ${EXCLUDED_MIN_KNOWN}\\s*de vos réponses`).test(lede),
      `non classés : aucun au classement, ${offScored} sur ${offRows.length} avec un score indicatif (position connue sur au moins ${EXCLUDED_MIN_KNOWN} de vos réponses), sans rang${offIssues.length ? ` : ${offIssues.join(' ; ')}` : ''}`,
    )
  }

  // Lignes rouges : la phrase sous l'affiche compte autant de candidats que de croix sur la page, non classés compris
  // (décision du propriétaire du 14 octobre 2026) ; sans phrase quand tous les classés franchissent
  const crossInfo = await page.evaluate(() => {
    const note = [...document.querySelectorAll('.leader-note')].find(p => /franchi/.test(p.textContent ?? ''))
    const rows = [...document.querySelectorAll('.board-row')]
    return {
      note: note ? Number(/(\d+)/.exec(note.textContent ?? '')?.[1] ?? -1) : 0,
      all: rows.length > 0 && rows.every(r => r.classList.contains('is-flagged')),
      crosses: document.querySelectorAll('.board-row.is-flagged, .unranked-item.is-flagged').length,
    }
  })
  check(crossInfo.all || crossInfo.note === crossInfo.crosses, `lignes rouges : la phrase sous l’affiche compte ${crossInfo.note} candidats, ${crossInfo.crosses} croix sur la page`)
  // Listes sous le classement, de la tablette au petit portable : le nom garde sa colonne, jamais coupé lettre par lettre
  if (EXCLUDED.size) {
    const narrow = []
    for (const width of [768, 820, 900, 1024, 1180, 1280]) {
      await page.setViewportSize({ width, height: 900 })
      const min = await page.locator('.unranked .unranked-who').evaluateAll(els => Math.min(...els.map(e => e.getBoundingClientRect().width)))
      const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
      if (min < 8 * rem) narrow.push(`${width} px : ${Math.round(min)} px`)
    }
    await page.setViewportSize({ width: 390, height: 844 })
    check(narrow.length === 0, `listes sous le classement, de 768 à 1280 px : la colonne du nom garde au moins 8rem${narrow.length ? ` (${narrow.join(' ; ')})` : ''}`)
  }

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
  // La feuille est enregistrée sous la clé de cette élection, et sous aucune autre : chaque élection a sa sauvegarde.
  // La liste interdite ne vient pas du registre (il peut n'avoir qu'une élection) : aucune autre clé « isoloir: »
  const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir:') && !k.endsWith(':illisible')))
  check(keys.length === 1 && keys[0] === STORAGE, `sauvegarde : la feuille est sous « ${STORAGE} », et aucune autre clé « isoloir: » n’existe (${keys.join(', ')})`)

  // 4 quinquies. « Mon profil politique », hors ligne comme tout le reste (le fichier à part de la page est dans la copie
  // hors ligne) : le panneau de « Et maintenant » et le lien sous « Par thème » ; la page, arrivée par le panneau (focus
  // au titre), sa mention IA en tête, « Calcul sans IA », le statut « Lecture prête. » ; le graphique « Domaine par
  // domaine » (cinq colonnes et leurs candidats, une ligne par sujet, sous les domaines dans l'ordre des familles ; dans
  // chacun, les lectures nettes, celles des deux bords à part, puis les écarts, puis les sujets sans tendance nette et
  // ceux d'une seule question, visibles sous leur intertitre ; autant de lectures nettes que le dit le compte de tête,
  // dont chaque nom ouvre sa ligne, et autant de sujets sans rien de net et de thèmes d'une seule question que le dit
  // ce qui n'a pas compté), au clavier (Entrée, Espace, flèches, Début, Fin ; une seule ligne ouverte), « Voir le
  // détail » qui ouvre le tableau complet (une ligne par thème répondu et par famille affichée) ; les couleurs des cases, l'échelle d'affinité du site, et elles seules, en clair comme en
  // sombre (chaque case au palier de son mot, le mot à 4,5:1 au moins ; en-têtes de colonne neutres, aucun pastel de
  // bloc ; aucun symbole ▲ ▽) ; aucune nouvelle clé de stockage ni de session
  // (seule « isoloir-focus », le temps d'un clic vers « Qui porte quoi ») ; rien en largeur à 320, 390 et 1 280 px, ni
  // au texte agrandi à 200 % ; l'indication au doigt ou à la souris ; aucun focus caché sous l'en-tête, l'axe collant,
  // son rappel ou l'en-tête des colonnes du détail ; l'affiche JPG est la même avant et après la visite.
  if (PROFILE) {
    const imageHash = async () => {
      await page.goto(U('/partager'))
      await page.waitForSelector('.share-preview img', { timeout: 5000 }).catch(() => null)
      // Les pixels de l'image, redessinés : la CSP (connect-src 'none') interdit de relire son fichier
      return page.evaluate(async () => {
        const img = document.querySelector('.share-preview img')
        if (!img) return null
        await img.decode().catch(() => null)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const g = canvas.getContext('2d')
        g.drawImage(img, 0, 0)
        const digest = await crypto.subtle.digest('SHA-256', g.getImageData(0, 0, canvas.width, canvas.height).data)
        return { hash: [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join(''), alt: img.getAttribute('alt') ?? '' }
      }).catch(() => null)
    }
    const before = await imageHash()
    const sessionBefore = await page.evaluate(() => Object.keys(sessionStorage).sort())
    await page.goto(U('/resultats'))
    await heading(page, 'Votre dépouillement')
    const panel = page.locator(`.next-panels a[href="${L('/profil')}"]`)
    const panelTitle = flat(await panel.locator('.next-title').textContent().catch(() => ''))
    const panelPlace = await page.locator('.next-panels > li').evaluateAll((lis, href) => lis.findIndex(li => li.querySelector(`a[href="${href}"]`)), L('/profil'))
    const gridLink = await page.locator(`.topics-block a[href="${L('/profil')}"]`).count()
    const barShortcuts = await page.locator('.results-bar .bar-mini:visible').count()
    // Le bandeau : sous l'affiche, avant le classement, dans les deux premiers écrans ; trois liens vers la page en tout
    await page.evaluate(() => window.scrollTo(0, 0))
    const band = await page.evaluate(href => {
      const b = document.querySelector('.results-profile')
      const before = (x, y) => !!x && !!y && !!(x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING)
      return {
        n: document.querySelectorAll('.results-profile').length,
        href: b?.getAttribute('href') ?? null,
        place: before(document.querySelector('.leader'), b) && before(b, document.querySelector('.board')),
        top: b ? Math.round(b.getBoundingClientRect().top + scrollY) : 1e9,
        title: (b?.querySelector('.pb-title')?.textContent ?? '').trim(),
        links: document.querySelectorAll(`main a[href="${href}"]`).length,
      }
    }, L('/profil'))
    check(
      band.n === 1 && band.href === L('/profil') && band.place && band.top < 2 * 844 && band.title === 'Mon profil politique' && band.links === 3,
      `mon profil politique, dépouillement : bandeau « ${band.title} » entre l’affiche et le classement ${band.place}, à ${band.top} px du haut (deux écrans : ${2 * 844}), ${band.links} liens vers la page (bandeau, panneau, lien sous « Par thème »)`,
    )
    await panel.click()
    await page.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
    const focused = await page.evaluate(() => document.activeElement?.matches('main h1') ?? false)
    const h1 = flat(await page.locator('main h1').textContent().catch(() => ''))
    const title = await page.title()
    const main = flat(await page.locator('main').innerText())
    const status = flat(await page.locator('main [role="status"]').last().textContent().catch(() => ''))
    const aiLabel = await page.locator('main .ai-label').first().isVisible().catch(() => false)
    // Le tableau du détail : une ligne par thème répondu, plus une par famille affichée (au moins deux thèmes répondus)
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE)
    const answeredTopics = new Set(pack.bank.questions.filter(q => Object.keys(saved.answers?.[q.id]?.ratings ?? {}).length && !saved.answers[q.id].skipped).map(q => q.topicId))
    const familiesShown = groups.filter(g => g.topicIds.length > 1 && g.topicIds.filter(t => answeredTopics.has(t)).length > 1).length
    const detailLabel = flat(await page.locator('main .profile-all > summary').textContent().catch(() => ''))
    // « Le détail, sujet par sujet » : un fichier à part (ProfileDetail-*.js), chargé hors ligne à la première ouverture du
    // tableau, jamais avant (demande du 17 octobre 2026 : faire place à la barre des domaines sans relever le plafond)
    const detailFile = () => page.evaluate(() => performance.getEntriesByType('resource').some(e => /\/ProfileDetail-[\w-]+\.js$/.test(e.name)))
    const detailBefore = await detailFile()
    const tableBefore = await page.locator('main table.echiquier').count()
    await page.locator('main .profile-all > summary').click()
    const tableShown = await page
      .locator('main .profile-all[open] table.echiquier > tbody > tr > th[scope="row"]')
      .first()
      .waitFor({ timeout: 5000 })
      .then(() => true, () => false)
    const detailAfter = await detailFile()
    check(
      !detailBefore && tableBefore === 0 && tableShown && detailAfter,
      `mon profil politique : « Le détail », un fichier à part, pas chargé avant l’ouverture du tableau (${!detailBefore}, ${tableBefore} tableau), puis chargé hors ligne à son ouverture (${detailAfter}, tableau ${tableShown})`,
    )
    const rows = await page.locator('main table.echiquier > tbody > tr > th[scope="row"]').count()
    // Chaque case du détail se dit par un texte dans la case, la case dessinée masquée aux lecteurs d'écran : le bloc, la
    // grille, le palier et, s'il y a lieu, la lecture nette ; pas d'aria-label, pris en compte inégalement dans un tableau
    const detailCells = await page.locator('main table.echiquier td.mk').evaluateAll(tds => {
      const said = /^.+ \(grille du ministère de l’Intérieur\)\s?: (très proche|proche|mitigé|éloigné|très éloigné|inconnu)(, nettement plus (près|loin))?$/
      const bad = tds.filter(td => td.hasAttribute('aria-label') || td.querySelector(':scope > .tile')?.getAttribute('aria-hidden') !== 'true' || !said.test(td.querySelector(':scope > .sr-only')?.textContent ?? ''))
      return { n: tds.length, bad: bad.slice(0, 3).map(td => td.textContent.trim().slice(0, 50)) }
    })
    check(
      detailCells.n >= rows && detailCells.bad.length === 0,
      `mon profil politique, détail : ${detailCells.n} cases, chacune dite par un texte dans la case (bloc, grille, palier, lecture nette)${detailCells.bad.length ? ` : ${detailCells.bad.join(' ; ')}` : ''}`,
    )
    // Le tableau replié de nouveau, comme à l'arrivée
    await page.locator('main .profile-all > summary').click()
    // « Ce qui pèse le plus » (lot 3) : son fichier à part ne se charge qu'à la première ouverture d'une ligne, d'un détail
    // ou de « Comment c'est calculé » (décision du propriétaire du 17 octobre 2026), hors ligne lui aussi (il est dans la
    // copie hors ligne) ; « Comment c'est calculé » ouvert en dit alors la règle
    const weighed = () => page.evaluate(() => performance.getEntriesByType('resource').some(e => /\/Weigh-[\w-]+\.js$/.test(e.name)))
    await page.waitForTimeout(1500)
    const weighBefore = await weighed()
    const calcWasOpen = await page.locator('main details.calc').evaluate(d => d.open)
    if (!calcWasOpen) await page.locator('main details.calc > summary').click()
    const weighLoaded = await page
      .waitForFunction(() => performance.getEntriesByType('resource').some(e => /\/Weigh-[\w-]+\.js$/.test(e.name)) && (document.querySelector('main details.calc')?.textContent ?? '').includes('Ce qui pèse le plus'), null, { timeout: 5000 })
      .then(() => true, () => false)
    if (!calcWasOpen) await page.locator('main details.calc > summary').click()
    check(
      !weighBefore && weighLoaded,
      `mon profil politique : « Ce qui pèse le plus », un fichier à part, pas chargé avant une ouverture (${!weighBefore}), puis chargé hors ligne à l'ouverture de « Comment c’est calculé », qui en dit la règle (${weighLoaded})`,
    )
    check(
      panelTitle === 'Mon profil politique' && panelPlace === 1 && gridLink === 1 && barShortcuts === 2,
      `mon profil politique : panneau « ${panelTitle} » en ${panelPlace + 1}e place de « Et maintenant », lien sous « Par thème » (${gridLink}), toujours deux raccourcis dans la barre (${barShortcuts})`,
    )
    check(
      focused &&
        h1 === 'Mon profil politique' &&
        /^Mon profil politique · Isoloir$/.test(title) &&
        aiLabel &&
        main.includes('Approches rédigées et positions résumées par IA') &&
        main.includes('Calcul sans IA') &&
        main.includes('Une lecture, pas un conseil de vote : le classement est dans Résultats') &&
        status === 'Lecture prête.' &&
        rows === answeredTopics.size + familiesShown &&
        detailLabel === (answeredTopics.size > 1 ? `Afficher le détail des ${answeredTopics.size} thèmes${familiesShown ? ' et de leurs domaines' : ''}` : 'Afficher le détail du thème'),
      `mon profil politique : focus au titre ${focused}, onglet « ${title} », mention IA ${aiLabel}, « Calcul sans IA », statut « ${status} », détail replié « ${detailLabel} », ${rows} lignes (${answeredTopics.size} thèmes répondus + ${familiesShown} familles)`,
    )

    /** Les couleurs du graphique d'une page déjà lue, dans le thème de couleurs du moment */
    const { AFFINITY_BANDS } = await importSite('src/core/affinity.ts')
    const { KEY_NET, KEY_FLAT } = await importSite('src/core/echiquierCopy.ts')
    const profileColors = async (pg, where) => {
      // Les couleurs des cases, et elles seules (décision du propriétaire du 12 octobre 2026) : chaque case du graphique,
      // du détail, de la légende et d'une ligne ouverte au palier de son mot, sur l'échelle d'affinité du site ; « pâle
      // sauf net » (décision du 17 octobre 2026) : pleine (l'aplat du palier ; au palier « mitigé », celui de « proche »
      // ou de « éloigné », selon son sens) sur une lecture nette et elle seule, celle que dit sa ligne, son bloc ou ses
      // mots, atténuée ailleurs (la teinte du palier ; une petite case, plus soutenue, sans atteindre l'aplat) ; le mot à
      // 4,5:1 au moins sur sa case, l'aplat à 4,5:1 au moins de la teinte du même palier ; « ? inconnu » sur le papier ;
      // la légende, les cinq paliers dans l'ordre du site, puis « Pleine » et « Atténuée », une seule paire en vue, dans
      // l'axe au téléphone, juste sous l'axe collant à l'ordinateur (17 octobre 2026) ; les en-têtes de colonne, le
      // rappel collant et les en-têtes du détail sur le papier, sans pastel de bloc ; aucun autre fond que le papier, les
      // lavis de l'encre et ces cases ; aucun symbole ▲ ▽ sur la page
      const colors = await pg.evaluate(([bands, keyWords]) => {
        const probe = document.createElement('span')
        document.querySelector('.screen-profile')?.append(probe)
        const parse = s => {
          // « rgb(r, g, b) », « rgba(…, a) », ou « color(srgb r g b / a) » (un color-mix), ramené sur 0-255
          const n = s.match(/[\d.]+/g)?.map(Number) ?? []
          return s.startsWith('color(srgb') ? [...n.slice(0, 3).map(x => x * 255), ...n.slice(3)] : n
        }
        const rgb = v => {
          probe.style.color = v
          return parse(getComputedStyle(probe).color)
        }
        const print = rgb('var(--print)')
        const soft = rgb('var(--print-soft)')
        const paper = rgb('var(--paper)')
        const onPrint = rgb('var(--on-print)')
        // L'action principale, en aplat de bille (demande du propriétaire du 2026-10-15) : le bouton « Approfondir » du
        // graphique, seul autorisé à sortir du papier et de l'encre, et seulement dans ces deux couleurs-là
        const action = rgb('var(--action)')
        const onAction = rgb('var(--on-action)')
        // « prioritaire », au bleu bille des choix de la personne, et la ligne rouge du détail, au rouge de la croix (lot 2)
        const ink = rgb('var(--ink)')
        const red = rgb('var(--red)')
        const aff = Object.fromEntries(bands.map(b => [b.key, rgb(`var(--aff-${b.key})`)]))
        const tint = Object.fromEntries(bands.map(b => [b.key, rgb(`var(--aff-${b.key}-tint)`)]))
        const pastels = ['vert', 'rouge', 'jaune', 'bleu'].map(t => rgb(`var(--pastel-${t})`))
        probe.remove()
        const near = (a, b) => !!b && a.slice(0, 3).every((x, i) => Math.abs(x - b[i]) <= 2)
        const clear = c => c.length === 4 && c[3] === 0
        // Sur le segment du papier à une teinte : un lavis de cette teinte (de 5 à 100 %)
        const onSegment = (c, to, lo = -0.02) => {
          const t = c.slice(0, 3).map((x, i) => (Math.abs(paper[i] - to[i]) < 8 ? null : (x - paper[i]) / (to[i] - paper[i]))).filter(x => x !== null)
          return t.length > 0 && t.every(x => x >= lo && x <= 1.02) && Math.max(...t) - Math.min(...t) <= 0.04
        }
        const onWash = c => onSegment(c, print)
        const lum = c => {
          const [r, g, b] = c.slice(0, 3).map(x => x / 255).map(x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
          return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
        const bad = []
        const name = el => `${el.tagName.toLowerCase()}.${String(el.className).trim().replace(/\s+/g, '.')}`
        const bg = el => parse(getComputedStyle(el).backgroundColor)
        // Un fond calculé, quelle que soit sa notation (un color-mix en oklab compris), en sRGB 0-255, par le canevas
        const pen = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
        const paint = el => {
          pen.clearRect(0, 0, 1, 1)
          pen.fillStyle = getComputedStyle(el).backgroundColor
          pen.fillRect(0, 0, 1, 1)
          return [...pen.getImageData(0, 0, 1, 1).data]
        }
        const label = Object.fromEntries(bands.map(b => [b.key, b.label]))
        /**
         * La lecture d'une case : celle de sa colonne sur une ligne (data-net), de son bloc dans une ligne ouverte (« Votre
         * affinité, bloc par bloc »), ses mots dans le détail ; « pres », « loin » ou null ; undefined pour la légende
         */
        const readingOf = t => {
          if (t.parentElement?.matches('.cell')) return t.parentElement.dataset.net ?? null
          const li = t.closest('.explain-blocs li')
          if (li) return li.classList.contains('is-net') ? (/près/.test(li.querySelector('.eb-net')?.textContent ?? '') ? 'pres' : 'loin') : null
          if (t.closest('td.mk')) {
            const w = t.querySelector('.tile-net')?.textContent ?? ''
            return /plus près/.test(w) ? 'pres' : /plus loin/.test(w) ? 'loin' : null
          }
          return undefined
        }
        // L'aplat de chaque palier se détache de sa teinte (une case pleine, d'une atténuée du même palier)
        for (const b of bands) if (ratio(aff[b.key], tint[b.key]) < 4.5) bad.push(`${b.key} : aplat à ${ratio(aff[b.key], tint[b.key]).toFixed(2)}:1 de sa teinte`)
        // Chaque case : le fond de son palier, plein sur une lecture nette, atténué ailleurs ; son mot (s'il en porte un),
        // et ce mot lisible dessus
        let tiles = 0
        let full = 0
        let minRatio = 99
        const seen = new Set()
        // Par place, les cases contrôlées, les pleines et les « mitigé » nettes : les lignes, une ligne ouverte (« Votre
        // affinité, bloc par bloc », montée à l'ouverture seulement), le détail (son tableau ouvert), la légende
        const places = Object.fromEntries(['lignes', 'ouverte', 'détail', 'légende'].map(p => [p, { tiles: 0, full: 0, mitige: 0 }]))
        const placeOf = t => (t.closest('.chart-key, .key-pair') ? 'légende' : t.closest('.explain-blocs') ? 'ouverte' : t.closest('.echiquier') ? 'détail' : 'lignes')
        for (const t of document.querySelectorAll('main .profile-chart .tile, main .echiquier .tile')) {
          tiles++
          const key = [...t.classList].find(c => c.startsWith('aff-'))?.slice(4) ?? (t.classList.contains('is-inconnu') ? 'inconnu' : null)
          const b = paint(t)
          const word = t.querySelector('.tile-word')?.textContent.replace(/\s+/g, ' ').trim()
          const isNet = t.classList.contains('is-net')
          const reading = readingOf(t)
          if (t.checkVisibility()) {
            const at = places[placeOf(t)]
            at.tiles++
            if (isNet) at.full++
            if (isNet && key === 'mitige') at.mitige++
          }
          if (!key) bad.push(`${name(t)} : une case sans palier`)
          else if (key === 'inconnu') {
            if (!near(b, paper)) bad.push(`${name(t)} : « inconnu » hors du papier`)
            if (isNet) bad.push(`${name(t)} : « inconnu » plein`)
            if (word !== undefined && word !== '? inconnu') bad.push(`${name(t)} : « ${word} » pour un bloc inconnu`)
          } else {
            seen.add(key)
            if (isNet && reading !== undefined) full++
            if (reading !== undefined && isNet !== !!reading) bad.push(`${name(t)} ${key} : ${isNet ? 'pleine' : 'atténuée'} pour une lecture ${reading ?? 'sans rien de net'}`)
            // Pleine : l'aplat de son palier ; au palier « mitigé », celui de son sens
            const sens = key !== 'mitige' ? key : t.classList.contains('is-sens-pres') ? 'proche' : t.classList.contains('is-sens-loin') ? 'eloigne' : null
            if (isNet && key === 'mitige' && (!sens || (reading && sens !== (reading === 'pres' ? 'proche' : 'eloigne')))) bad.push(`${name(t)} : « mitigé » net sans le sens de sa lecture (${reading})`)
            const small = t.classList.contains('key-tile')
            const ok = isNet
              ? near(b, aff[sens ?? key])
              : small
                ? !near(b, tint[key]) && !near(b, aff[key]) && ratio(b, paper) >= 1.25 && ratio(b, paper) < ratio(aff[key], paper)
                : near(b, tint[key])
            if (!ok) bad.push(`${name(t)} ${key}${isNet ? ' pleine' : ' atténuée'} : fond ${getComputedStyle(t).backgroundColor}`)
            if (word !== undefined && word !== label[key]) bad.push(`${name(t)} : « ${word} » sur la case ${key}`)
          }
          if (t.textContent.trim()) minRatio = Math.min(minRatio, ratio(parse(getComputedStyle(t).color), key === 'inconnu' ? paper : b))
        }
        // Le reste : papier, lavis de l'encre ou rien ; l'encre de l'imprimé, du gris ou du papier ; aucun pastel de bloc
        for (const el of document.querySelectorAll('main .profile-chart *:not(.tile, .tile *), .axis-mini, .axis-mini *, main .echiquier *:not(.tile, .tile *), main .profile-keep li')) {
          const cs = getComputedStyle(el)
          const b = parse(cs.backgroundColor)
          const c = parse(cs.color)
          if (el.closest('.btn-primary')) {
            if (!clear(b) && !near(b, action)) bad.push(`${name(el)} : bouton principal hors de la bille (${cs.backgroundColor})`)
            if (!near(c, onAction)) bad.push(`${name(el)} : lettres du bouton principal ${cs.color}`)
            continue
          }
          // Votre avis dans « Ce qui pèse le plus » (lot 3), dans une ligne nette ouverte et dans le détail : le repère de
          // la mini-réglette de « Qui porte quoi », dans le ton de son cran (l'aplat d'un palier de l'échelle du site), en
          // gris pour « mitigé », au rouge du stylo sur une ligne rouge ; ses crans et son filet en gris
          if (el.closest('.weigh .rating-mark')) {
            const tone = x => clear(x) || [paper, print, soft, red, ...Object.values(aff)].some(y => near(x, y))
            if (!tone(b) || !tone(c)) bad.push(`${name(el)} : votre avis hors du ton de son cran (${cs.backgroundColor}, ${cs.color})`)
            continue
          }
          if (!clear(b) && !near(b, paper) && !near(b, print) && !onWash(b)) bad.push(`${name(el)} fond ${cs.backgroundColor}`)
          if (!clear(b) && pastels.some(x => near(b, x))) bad.push(`${name(el)} : un pastel (${cs.backgroundColor})`)
          if (!clear(c) && ![print, soft, paper, onPrint].some(x => near(c, x)) && !(el.matches('.row-prio') && near(c, ink)) && !(el.matches('.detail-meta .is-red') && near(c, red)))
            bad.push(`${name(el)} encre ${cs.color}`)
        }
        // La légende : les cinq paliers, dans l'ordre du site, puis « inconnu » s'il paraît, atténués ; dessous, la même
        // pastille pleine (« Pleine : … ») puis atténuée (« Atténuée : … »)
        const key = [...document.querySelectorAll('main .profile-chart .key-scale:not(.key-pair) li')].map(li => li.textContent.replace(/\s+/g, ' ').trim())
        const want = bands.map(b => b.label).join('|')
        if (key.slice(0, bands.length).join('|') !== want || key.length > bands.length + 1) bad.push(`légende : ${key.join(', ')}`)
        if (document.querySelector('main .profile-chart .key-scale:not(.key-pair) .tile.is-net')) bad.push('légende : un palier plein')
        // Une seule paire en vue (décision du propriétaire du 17 octobre 2026) : au téléphone, dans la légende de l'axe ; à
        // l'ordinateur, l'axe collant, juste sous lui, hors de ce qui colle
        const pairs = [...document.querySelectorAll('main .profile-chart .key-pair')].filter(x => x.checkVisibility())
        const axisEl = document.querySelector('main .profile-chart .axis')
        const stuck = getComputedStyle(axisEl).position === 'sticky'
        if (pairs.length !== 1) bad.push(`légende : ${pairs.length} paires pleine et atténuée en vue`)
        else if (stuck ? pairs[0].closest('.axis') || pairs[0].previousElementSibling !== axisEl : !pairs[0].closest('.axis .chart-key'))
          bad.push(`légende : pleine et atténuée ${pairs[0].closest('.axis') ? 'dans l’axe' : 'hors de l’axe'}, l’axe ${stuck ? 'collant' : 'dans la page'}`)
        const pair = [...(pairs[0]?.querySelectorAll('li') ?? [])]
        const pairText = pair.map(li => li.textContent.replace(/\s+/g, ' ').trim()).join('|')
        if (pairText !== keyWords.map(w => w.replace(/\s+/g, ' ')).join('|') || pair.map(li => li.querySelector('.tile')?.classList.contains('is-net')).join() !== 'true,false')
          bad.push(`légende, pleine et atténuée : ${pairText}`)
        // Les en-têtes de colonne, du rappel et du détail : neutres
        for (const el of document.querySelectorAll('main .profile-chart .zone, .axis-mini-inner > span, main .echiquier th.bloc-head'))
          if (!clear(bg(el)) && !near(bg(el), paper)) bad.push(`${name(el)} : en-tête coloré (${getComputedStyle(el).backgroundColor})`)
        const glyphs = /[▲▽]/.test(document.querySelector('main')?.textContent ?? '')
        return { bad: [...new Set(bad)].slice(0, 12), tiles, full, places, seen: seen.size, minRatio, glyphs, scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair' }
      }, [AFFINITY_BANDS, [KEY_NET, KEY_FLAT]])
      // Une page de lectures nettes a des cases pleines (la légende mise à part) ; une ligne nette ouverte, des petites
      // cases pleines ; le détail ouvert sur une lecture nette, des cases pleines ; une case nette « mitigé », dans chacun
      // des trois (contre-vérification du 17 octobre 2026 : ni la ligne ouverte ni « mitigé » net n'étaient contrôlés)
      const P = colors.places
      const want = [
        [/lectures nettes/.test(where), 'lignes', P.lignes.full > 0],
        [/ligne nette ouverte/.test(where), 'ligne ouverte', P.ouverte.tiles >= 5 && P.ouverte.full > 0],
        [/détail/.test(where), 'détail', P['détail'].full > 0],
        [/« mitigé »/.test(where), '« mitigé » net', P.lignes.mitige > 0 && P.ouverte.mitige > 0 && P['détail'].mitige > 0],
      ].filter(([on, , ok]) => on && !ok)
      check(
        colors.bad.length === 0 && colors.tiles > 0 && colors.minRatio >= 4.5 && !colors.glyphs && !want.length,
        `mon profil politique (${where}), couleurs des cases (${colors.scheme}) : ${colors.tiles} cases au palier de leur mot (${colors.seen} paliers vus), ${colors.full} pleines, chacune sur une lecture nette (vues, pleines dont « mitigé » : ${Object.entries(P).map(([p, x]) => `${p} ${x.tiles}, ${x.full} dont ${x.mitige}`).join(' ; ')}), mot à ${colors.minRatio === 99 ? '–' : colors.minRatio.toFixed(1)}:1 au moins, légende dans l’ordre du site puis pleine et atténuée, en-têtes neutres, aucun pastel de bloc, ${colors.glyphs ? 'des ▲ ▽ !' : 'aucun ▲ ▽'}${want.length ? ` ; manquent : ${want.map(w => w[1]).join(', ')}` : ''}${colors.bad.length ? ` : ${colors.bad.join(' ; ')}` : ''}`,
      )
    }

    /**
     * En contraste forcé, les couleurs tombent et les cadres restent : chaque case de la page (lignes, ligne ouverte,
     * détail, légende), un cadre plein, épais (3 px) sur une case pleine, fin ailleurs, en tirets sur « ? inconnu » ;
     * places : celles qui doivent avoir des cases pleines
     */
    const forcedFrames = async (pg, where, places) => {
      await pg.emulateMedia({ forcedColors: 'active' })
      const f = await pg.evaluate(() => {
        const out = { bad: [], full: {}, tiles: 0 }
        for (const t of document.querySelectorAll('main .profile-chart .tile, main .echiquier .tile')) {
          if (!t.checkVisibility()) continue
          out.tiles++
          const cs = getComputedStyle(t)
          const w = parseFloat(cs.outlineWidth)
          const net = t.classList.contains('is-net')
          const style = t.classList.contains('is-inconnu') ? 'dashed' : 'solid'
          const place = t.closest('.chart-key, .key-pair') ? 'légende' : t.closest('.explain-blocs') ? 'ligne ouverte' : t.closest('.echiquier') ? 'détail' : 'lignes'
          if (net) out.full[place] = (out.full[place] ?? 0) + 1
          if (cs.outlineStyle !== style || (net ? w < 3 : w < 1 || w >= 3)) out.bad.push(`${place}, ${t.className} : ${cs.outlineStyle} ${cs.outlineWidth}`)
        }
        return out
      })
      await pg.emulateMedia({ forcedColors: 'none' })
      const missing = places.filter(p => !f.full[p])
      check(
        f.tiles > 0 && !f.bad.length && !missing.length,
        `mon profil politique (${where}), contraste forcé : ${f.tiles} cases, chacune dans son cadre, épais sur les cases pleines (${Object.entries(f.full).map(([p, n]) => `${p} ${n}`).join(', ') || 'aucune'})${missing.length ? `, aucune case pleine vue : ${missing.join(', ')}` : ''}${f.bad.length ? ` : ${f.bad.slice(0, 4).join(' ; ')}` : ''}`,
      )
    }

    /** Le graphique « Domaine par domaine » d'une page déjà lue : axe, domaines, lignes et leurs groupes, compte, clavier, couleurs des cases */
    const profileChart = async (pg, where) => {
      // Le graphique : l'axe (cinq colonnes et leurs candidats), les domaines, leurs groupes de lignes, le compte
      const chart = await pg.evaluate(() => {
        const zones = [...document.querySelectorAll('.profile-chart .zone')]
        const lists = [...document.querySelectorAll('.profile-chart ol.rows')]
        const listOf = kind => lists.filter(ol => ol.dataset.group === kind).flatMap(ol => [...ol.querySelectorAll(':scope > li > .row')])
        const all = [...document.querySelectorAll('.profile-chart ol.rows > li > .row')]
        const net = (r, k) => [...r.querySelectorAll('.cell')].flatMap((c, b) => (c.dataset.net === k ? [b] : []))
        // De part et d'autre du centre, sans lui : dans « Aux deux bouts » ou « Des deux côtés », et elles seules
        const across = r => {
          const n = net(r, 'pres')
          return n.some(b => b < 2) && n.some(b => b > 2) && !n.includes(2)
        }
        // Les groupes sans lecture nette : visibles, sous un intertitre, sans aucune lecture nette
        const quiet = lists
          .filter(ol => ['flat', 'thin', 'unknown'].includes(ol.dataset.group))
          .map(ol => ({
            group: ol.dataset.group,
            title: ol.previousElementSibling?.matches('.fam-sub') ? ol.previousElementSibling.textContent.trim() : '',
            rows: ol.querySelectorAll(':scope > li > .row').length,
            netRows: [...ol.querySelectorAll(':scope > li > .row')].filter(r => r.querySelector('.cell[data-net]')).length,
            visible: ol.checkVisibility(),
          }))
        const text = el => (el?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
        // Les noms du compte de tête, dans l'ordre de la page ; ceux des lignes nettes, dans le même ordre
        const names = [...document.querySelectorAll('.profile-chart .chart-count .count-link')].map(text)
        const readRows = [...listOf('net'), ...listOf('both')].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        return {
          zones: zones.length,
          names: zones.map(zn => zn.querySelectorAll('.zone-names li').length),
          families: [...document.querySelectorAll('.profile-chart .fam-group')].map(f => f.id.replace(/^fam-/, '')),
          mainRows: listOf('net').length,
          bothRows: listOf('both').length,
          apartRows: listOf('apart').length,
          flatRows: listOf('flat').length,
          thinRows: listOf('thin').length,
          all: all.length,
          count: text(document.querySelector('.profile-chart .chart-count')),
          state: text(document.querySelector('.profile-chart .chart-state')),
          rest: text(document.querySelector('.profile-chart .chart-rest')),
          countNames: names,
          // Une ligne de famille s'écrit « Les 5 thèmes ensemble » sous l'intertitre de son domaine : le compte la nomme par lui
          readNames: readRows.map(r => (r.id.startsWith('sj-famille-') ? text(r.closest('.fam-group')?.querySelector('.fam-name')) : text(r.querySelector('.row-name')))),
          readIds: readRows.map(r => r.id),
          // Les lignes que nomme le compte : les lectures nettes ; sans elles (C6), les sujets seulement plus loin
          countIds: (readRows.length ? readRows : listOf('apart')).map(r => r.id),
          // Chaque ligne : cinq cases ; une lecture nette plus près dans les groupes du haut, seulement plus loin dans le sien
          fiveTiles: all.every(r => r.querySelectorAll('.strip > .cell > .tile').length === 5),
          mainOk: [...listOf('net'), ...listOf('both')].every(r => net(r, 'pres').length > 0) && listOf('apart').every(r => !net(r, 'pres').length && net(r, 'loin').length > 0),
          twoBarsOutside: all.filter(r => net(r, 'pres').length && across(r) !== (r.closest('ol')?.dataset.group === 'both')).length,
          quiet,
          closed: all.every(r => r.getAttribute('aria-expanded') === 'false' && document.getElementById(r.getAttribute('aria-controls'))?.hidden),
          hint: document.querySelector('.profile-chart .hint-click')?.checkVisibility() ?? false,
          source: document.querySelector('.profile-chart .chart-source')?.textContent ?? '',
          calc: document.querySelectorAll('.profile-chart details.calc > ul > li').length,
          hasard: /hasard/i.test(document.querySelector('main')?.textContent ?? ''),
          // Chaque liste a un nom (l'intertitre de son domaine et le sien ; « Nettement plus près » pour les lectures nettes)
          unnamed: lists.filter(ol => {
            const ids = (ol.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean)
            return !ids.length || ids.some(id => !text(document.getElementById(id))) || (ol.dataset.group === 'net' && !ids.some(id => /nettement/i.test(text(document.getElementById(id)))))
          }).length,
          // Chaque groupe s'ouvre sur son intertitre visible, les lectures nettes comprises (17 octobre 2026 : sans le
          // leur, la première ligne d'un domaine se lisait sous l'intertitre du groupe suivant)
          bare: lists.filter(ol => !(ol.previousElementSibling?.matches('.fam-sub') && ol.previousElementSibling.checkVisibility() && text(ol.previousElementSibling))).length,
          netTitles: [...new Set(lists.filter(ol => ol.dataset.group === 'net').map(ol => text(ol.previousElementSibling)))],
          // Les noms du compte : des liens, qui se coupent en fin de ligne comme le reste de la phrase
          countLinks: [...document.querySelectorAll('.profile-chart .chart-count .count-link')].every(a => a.tagName === 'A' && getComputedStyle(a).display === 'inline'),
          // Le nom lu d'une ligne de famille contient son libellé visible (« les 3 thèmes ensemble, 5 questions »)
          famLabelInName: all
            .filter(r => r.id.startsWith('sj-famille-'))
            .every(r => text(r.querySelector('.sr-only')).toLowerCase().includes(`${text(r.querySelector('.row-name'))}, ${text(r.querySelector('.row-meta'))}`.toLowerCase())),
        }
      })
      const readCount = Number(chart.count.match(/^Sur (\d+)/)?.[1] ?? 0)
      const shownNames = Math.min(5, readCount)
      const ranked = Number(chart.source.match(/Comptent les (\d+) candidats classés/)?.[1] ?? -1)
      const familyOrder = groups.map(g => g.id).filter(id => chart.families.includes(id))
      check(
        chart.zones === 5 && chart.names.every(n => n > 0) && chart.names.reduce((a, b) => a + b, 0) === ranked,
        `mon profil politique (${where}), l’axe : ${chart.zones} colonnes, candidats ${chart.names.join(' + ')} = ${ranked} classés`,
      )
      check(
        readCount === chart.mainRows + chart.bothRows &&
          (readCount > 0 || /^Sur aucun sujet/.test(chart.count) || chart.state.length > 0) &&
          chart.families.join() === familyOrder.join() &&
          chart.fiveTiles &&
          chart.mainOk &&
          chart.twoBarsOutside === 0 &&
          chart.closed &&
          chart.hint &&
          chart.calc <= 8 &&
          !chart.hasard &&
          chart.unnamed === 0 &&
          chart.bare === 0 &&
          chart.netTitles.every(t => t === 'Nettement plus près') &&
          chart.countLinks &&
          chart.famLabelInName,
        `mon profil politique (${where}), les lignes : « ${chart.count || chart.state} » pour ${chart.mainRows} + ${chart.bothRows} lignes lues (et ${chart.apartRows} seulement plus loin), domaines dans l’ordre des familles ${chart.families.join() === familyOrder.join()}, cinq cases par ligne ${chart.fiveTiles}, lectures nettes dans leurs groupes ${chart.mainOk}, lignes de part et d’autre du centre hors de leur groupe (ou l’inverse) ${chart.twoBarsOutside}, toutes fermées ${chart.closed}, « Cliquez… » à la souris ${chart.hint}, « Comment c’est calculé » en ${chart.calc} points, « hasard » ${chart.hasard ? 'présent !' : 'absent'}, listes sans nom ${chart.unnamed}, groupes sans intertitre visible ${chart.bare} (lectures nettes sous « ${chart.netTitles.join(' », « ') || '—'} »), noms du compte en liens ${chart.countLinks}, libellé visible des lignes de famille dans leur nom lu ${chart.famLabelInName}`,
      )
      // Le compte de tête : les noms des lignes nettes, dans l'ordre de la page, cinq au plus, puis « et N autres » ;
      // ce qui n'a pas compté, autant que de lignes
      const restFlat = Number(chart.rest.match(/rien de net sur (\d+) sujets?/i)?.[1] ?? 0)
      const restThin = Number(chart.rest.match(/(\d+) thèmes? sur une seule question/)?.[1] ?? 0)
      check(
        (readCount === 0 || (chart.countNames.join('|') === chart.readNames.slice(0, shownNames).join('|') && (readCount <= 5 ? chart.count.endsWith('.') && !/ autres?\.$/.test(chart.count) : chart.count.endsWith(` et ${readCount - 5} autre${readCount - 5 > 1 ? 's' : ''}.`)))) &&
          (!chart.rest || (restFlat === chart.flatRows && restThin === chart.thinRows)),
        `mon profil politique (${where}), le compte de tête : ${chart.countNames.length} noms (« ${chart.countNames.join(' », « ')} ») pour ${readCount} lignes nettes, « ${chart.rest} » pour ${chart.flatRows} sans rien de net et ${chart.thinRows} d’une seule question`,
      )
      check(
        chart.quiet.every(q => q.visible && q.title && q.netRows === 0),
        `mon profil politique (${where}), les sujets sans lecture nette, visibles sous leur intertitre : ${chart.quiet.map(q => `« ${q.title} » ${q.rows} lignes`).join(', ') || 'aucun'}`,
      )
      // Un nom du compte ouvre sa ligne et lui donne le focus
      if (chart.countNames.length) {
        await pg.locator('.profile-chart .chart-count .count-link').first().click()
        await pg.waitForTimeout(150)
        const opened = await pg.evaluate(() => {
          const b = document.activeElement
          return { row: !!b?.matches('.profile-chart .row'), expanded: b?.getAttribute('aria-expanded'), id: b?.id ?? '' }
        })
        check(
          opened.row && opened.expanded === 'true' && opened.id === chart.countIds[0],
          `mon profil politique (${where}), le premier nom du compte (« ${chart.countNames[0]} ») ouvre sa ligne et lui donne le focus : ${JSON.stringify(opened)}`,
        )
        await pg.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))
      }

      // Au clavier : Entrée ouvre, flèche bas passe à la suivante, Espace l'ouvre et referme la première, Fin et Début
      const buttons = pg.locator('.profile-chart .row')
      const nButtons = await buttons.count()
      await buttons.first().focus()
      await pg.keyboard.press('Enter')
      const afterEnter = await pg.evaluate(() => {
        const b = document.activeElement
        const region = document.getElementById(b?.getAttribute('aria-controls') ?? '')
        return {
          expanded: b?.getAttribute('aria-expanded'),
          visible: !!region && !region.hidden && region.getBoundingClientRect().height > 0,
          text: (region?.textContent ?? '').trim().slice(0, 60),
          blocs: region?.querySelectorAll('.explain-blocs li').length ?? 0,
        }
      })
      await pg.keyboard.press('ArrowDown')
      const secondFocused = await pg.evaluate(() => [...document.querySelectorAll('.profile-chart .row')].indexOf(document.activeElement))
      await pg.keyboard.press(' ')
      const openRows = await pg.locator('.profile-chart .row[aria-expanded="true"]').count()
      await pg.keyboard.press('End')
      const atEnd = await pg.evaluate(() => {
        const list = [...document.querySelectorAll('.profile-chart .row')]
        return list.indexOf(document.activeElement) === list.length - 1
      })
      await pg.keyboard.press('Home')
      const atHome = await pg.evaluate(() => document.activeElement === document.querySelector('.profile-chart .row'))
      check(
        nButtons > 0 && afterEnter.expanded === 'true' && afterEnter.visible && afterEnter.text.length > 20 && afterEnter.blocs === 5 && secondFocused === 1 && openRows === 1 && atEnd && atHome,
        `mon profil politique (${where}), au clavier : Entrée ouvre (« ${afterEnter.text}… », ${afterEnter.blocs} blocs avec leur palier), flèche bas passe à la suivante (${secondFocused}), une seule ligne ouverte (${openRows}), Fin ${atEnd}, Début ${atHome}`,
      )
      await pg.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))

      await profileColors(pg, where)
    }
    await profileChart(page, 'parcours, 390 px')

    // Pour lire plus de thèmes (questionnaire rapide seul) : ouverte sous le compte, dans la tête du graphique ; les thèmes
    // d'une seule question et ceux sans réponse qui ont encore des questions approfondies, tels qu'on les compte depuis la
    // feuille enregistrée ; un
    // thème de la fiche, puis « Approfondir ce thème » d'une ligne, mènent à « Approfondir » avec ce thème coché (le champ
    // existant, rien d'autre d'enregistré), qu'on décoche ensuite
    {
      const st = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE)
      const opinion = a => !!a && !a.skipped && Object.keys(a.ratings ?? {}).length > 0
      const expected = { thin: [], none: [] }
      for (const t of pack.bank.topics) {
        const qs = pack.bank.questions.filter(q => q.topicId === t.id)
        if (!qs.some(q => q.tier !== 'essentiel' && !opinion(st.answers?.[q.id]))) continue
        const n = qs.filter(q => opinion(st.answers?.[q.id])).length
        if (n === 0) expected.none.push(t.label)
        else if (n === 1) expected.thin.push(t.label)
      }
      const fold = page.locator('main .deeper-card details.deeper-fold')
      if ((await fold.count()) && !(await fold.evaluate(d => d.open))) await fold.locator('summary').click()
      const fiche = await page.evaluate(() => {
        const f = document.querySelector('main .deeper-card')
        const names = el => [...(el?.querySelectorAll('.deeper-topics a') ?? [])].map(a => [...a.childNodes].filter(n => n.nodeType === 3).map(n => n.data).join('').trim())
        return {
          n: document.querySelectorAll('main .deeper-card').length,
          // Au seul questionnaire rapide : ouverte, sous le compte, avant l'axe
          first: !!f && !!f.closest('.profile-chart .chart-head') && !!f.querySelector(':scope > details[open]') && !!(f.compareDocumentPosition(document.querySelector('main .profile-chart .axis')) & Node.DOCUMENT_POSITION_FOLLOWING),
          thin: names(f?.querySelector('.deeper-fold') ?? [...(f?.querySelectorAll('.deeper-lists > p') ?? [])].find(p => p.textContent.startsWith('Sur une seule'))),
          none: names([...(f?.querySelectorAll('.deeper-lists > p') ?? [])].find(p => p.textContent.startsWith('Sans réponse'))),
          go: f?.querySelector('a.btn-text')?.getAttribute('href') ?? null,
        }
      })
      check(
        fiche.n === 1 && fiche.first && fiche.thin.join('|') === expected.thin.join('|') && fiche.none.join('|') === expected.none.join('|') && fiche.go === L('/approfondir'),
        `mon profil politique, questionnaire rapide seul : fiche « Pour lire plus de thèmes » ouverte sous le compte ${fiche.first}, ${fiche.thin.length} thèmes sur une seule question (attendus ${expected.thin.length}) et ${fiche.none.length} sans réponse (attendus ${expected.none.length}), « Choisir les thèmes à approfondir » vers ${fiche.go}`,
      )
      // Les questions approfondies d'un thème encore sans avis (la règle de la page Approfondir)
      const openOf = id => pack.bank.questions.filter(q => q.topicId === id && q.tier === 'approfondi' && !opinion(st.answers?.[q.id])).length
      const idOf = label => pack.bank.topics.find(t => t.label === label)?.id
      /** À l'arrivée : l'adresse porte le thème, sa ligne est en tête et seule cochée, la phrase sous le titre le dit, le retour mène à la page */
      const arrival = () =>
        page.evaluate(() => ({
          hash: decodeURI(location.hash),
          first: document.querySelector('.is-topics .topic-label')?.textContent?.trim() ?? '',
          on: [...document.querySelectorAll('.is-topics .approach-main[aria-pressed="true"] .topic-label')].map(e => e.textContent.trim()),
          note: (document.querySelector('main .deepen-touched')?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim(),
          back: document.querySelector('.action-bar a.btn-text')?.getAttribute('href') ?? null,
          noteTop: Math.round(document.querySelector('main .deepen-touched')?.getBoundingClientRect().bottom ?? 9999),
          rowTop: Math.round(document.querySelector('.is-topics li')?.getBoundingClientRect().top ?? 9999),
          vh: innerHeight,
        }))
      const pressedOn = async label => {
        await page.locator('main h1', { hasText: 'Quels thèmes voulez-vous approfondir' }).waitFor({ timeout: 4000 }).catch(() => null)
        const a = await arrival()
        const n = openOf(idOf(label))
        const note = `Le thème « ${label} » est coché : ${n} question${n > 1 ? 's' : ''}.`
        const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir')))
        // Décocher : la feuille revient à l'état d'avant ; la ligne reste en tête (rien ne saute sous le doigt)
        await page.locator('.is-topics .approach-main[aria-pressed="true"]').first().click().catch(() => null)
        const left = await page.locator('.is-topics .approach-main[aria-pressed="true"]').count()
        const after = await arrival()
        const ok =
          a.hash === L(`/approfondir/${idOf(label)}`) && a.first === label && a.on.length === 1 && a.on[0] === label && a.note === note && a.back === L('/profil') && a.noteTop < a.vh &&
          keys.length === 1 && keys[0] === STORAGE && left === 0 && after.first === label && after.note === ''
        return ok ? 'oui' : `non (${JSON.stringify(a)} ; attendu « ${note} » ; ${keys.join(', ')} ; ${left} encore cochés ; après : ${after.first}, « ${after.note} »)`
      }
      const pick = expected.thin[0] ?? expected.none[0]
      await page.locator('main .deeper-card .deeper-topics a').filter({ hasText: pick }).first().click()
      const fromFiche = await pressedOn(pick)
      // « Approfondir ce thème » d'une ligne sur une seule question
      await page.goto(U('/profil'))
      await page.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
      const rows = page.locator('.profile-chart ol.rows[data-group="thin"] .row')
      let fromRow = 'aucune ligne avec le lien'
      for (let i = 0, n = await rows.count(); i < n; i++) {
        await rows.nth(i).click()
        const link = page.locator('.profile-chart .explain:not([hidden]) a', { hasText: 'Approfondir ce thème' })
        if (await link.count()) {
          const name = flat(await rows.nth(i).locator('.row-name').textContent())
          await link.click()
          fromRow = await pressedOn(name)
          break
        }
        await rows.nth(i).click()
      }
      check(fromFiche === 'oui' && fromRow === 'oui', `mon profil politique, approfondir un thème : depuis la fiche (« ${pick} ») ${fromFiche}, depuis une ligne ${fromRow} ; coché à l’arrivée, en tête de liste, dit sous le titre, retour vers la page, une seule clé de stockage`)

      // Un autre thème déjà coché, qui vient avant dans la feuille : la phrase dit les deux, le thème touché est en tête
      // de liste, la feuille commence par lui, puis finit par les questions jamais vues qui le précèdent. La feuille
      // enregistrée est remise ensuite telle qu'avant ces essais (les questions passées ici n'y restent pas)
      {
        const pickId = idOf(pick)
        const topicOrder = [...new Set(orderedQuestions(pack.bank, 'approfondi', st.seed).map(q => q.topicId))]
        const others = pack.bank.topics.filter(t => t.id !== pickId && openOf(t.id) > 0)
        const other = others.filter(t => topicOrder.indexOf(t.id) < topicOrder.indexOf(pickId)).sort((x, y) => topicOrder.indexOf(x.id) - topicOrder.indexOf(y.id))[0] ?? others[0]
        await page.goto(U('/approfondir'))
        await page.evaluate(label => [...document.querySelectorAll('.is-topics .approach-main')].find(b => b.querySelector('.topic-label')?.textContent?.trim() === label)?.click(), other.label)
        await page.goto(U('/profil'))
        await page.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
        const fold2 = page.locator('main .deeper-card details.deeper-fold')
        if ((await fold2.count()) && !(await fold2.evaluate(d => d.open))) await fold2.locator('summary').click()
        await page.locator('main .deeper-card .deeper-topics a').filter({ hasText: pick }).first().click()
        await page.locator('main h1', { hasText: 'Quels thèmes voulez-vous approfondir' }).waitFor({ timeout: 4000 }).catch(() => null)
        const a = await arrival()
        const n = openOf(pickId)
        const total = n + openOf(other.id)
        const note = `Le thème « ${pick} » est coché : vous commencez par ${n > 1 ? `ses ${n} questions` : 'sa question'}. Un autre thème est aussi coché : ${total} questions en tout.`
        const list = orderedQuestions(pack.bank, 'approfondi', st.seed, [pickId, other.id])
        const seen = new Set(Object.keys(st.answers ?? {}))
        const own = list.filter(q => q.topicId === pickId)
        const startQ = own.find(q => !seen.has(q.id)) ?? own.find(q => !opinion(st.answers?.[q.id]))
        const startAt = list.indexOf(startQ)
        await page.locator('.action-bar .btn-primary').click()
        await page.waitForFunction(() => location.hash.includes('/approfondi/'), null, { timeout: 4000 }).catch(() => null)
        const started = { hash: hashOf(page), topic: flat(await page.locator('.locator-topic').first().textContent().catch(() => '')) }
        // Passer jusqu'au bout de la feuille : elle revient à la première question jamais vue qui précède
        for (let i = startAt; i < list.length; i++) {
          const before = hashOf(page)
          await page.locator('button.btn-primary', { hasText: /^(Passer|Suivante)$/ }).click()
          await page.waitForFunction(h => decodeURI(location.hash) !== h, before, { timeout: 4000 }).catch(() => null)
        }
        const firstUnseen = list.findIndex((q, i) => i < startAt && !seen.has(q.id))
        const wrapped = hashOf(page)
        const expectedWrap = firstUnseen < 0 ? L('/resultats') : L(`/approfondi/${firstUnseen + 1}`)
        check(
          a.first === pick && a.on.length === 2 && a.on.includes(other.label) && a.note === note && started.hash === L(`/approfondi/${startAt + 1}`) && started.topic === pick && wrapped === expectedWrap,
          `mon profil politique, approfondir avec un autre thème déjà coché (« ${other.label} ») : « ${pick} » en tête (${a.first}), « ${a.note} », la feuille commence par lui (${started.hash}, « ${started.topic} »), puis revient à ${wrapped} (attendu ${expectedWrap})`,
        )
        // La dernière question passée s'enregistre après le changement d'adresse : on l'attend, puis la feuille d'avant
        // revient, relue au rechargement
        await page.goto(U('/'))
        await page.waitForTimeout(400)
        await page.evaluate(([key, v]) => localStorage.setItem(key, v), [STORAGE, JSON.stringify(st)])
        await page.reload()
        const restored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE)
        check(
          Object.keys(restored.answers ?? {}).length === Object.keys(st.answers ?? {}).length && (restored.deepTopics ?? []).length === (st.deepTopics ?? []).length,
          `mon profil politique, après l’essai d’« Approfondir » : la feuille d’avant revient (${Object.keys(restored.answers ?? {}).length} réponses, ${(restored.deepTopics ?? []).length} thème coché)`,
        )
      }
      await page.goto(U('/profil'))
      await page.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
    }


    // « Voir le détail » d'une ligne lue : le tableau replié s'ouvre sur le détail de l'unité, qui reçoit le focus ; puis
    // son lien vers « Qui porte quoi » : la seule clé de session, effacée à l'arrivée. La lecture d'abord (le tableau
    // replié ne paraît qu'avec elle) : sur une machine chargée, elle dépasse les 8 s attendues plus haut, et le chemin
    // choisi sans elle (aucune ligne lue) attendrait un tableau qui n'est pas encore là
    await page.locator('main .profile-all').waitFor({ timeout: 60000 })
    const readRow = page.locator('.profile-chart .row:has(.strip)').first()
    let detailRows = 0
    let detailFocus = false
    if (await readRow.count()) {
      await readRow.click()
      await page.locator('.profile-chart .explain:not([hidden]) .link-button').first().click()
      await page.locator('main .profile-all[open] .unit-detail[open] .detail-blocs tbody tr').first().waitFor({ timeout: 3000 }).catch(() => null)
      await page.waitForTimeout(100)
      detailFocus = await page.evaluate(() => !!document.activeElement?.matches('.profile-all[open] .unit-detail[open] > summary'))
      detailRows = await page.locator('main .unit-detail[open] .detail-blocs tbody tr:not(.detail-why)').count()
    } else {
      await page.locator('main .profile-all > summary').click()
      await page.locator('main .unit-detail summary').first().click()
      await page.locator('main .unit-detail[open] .detail-blocs tbody tr').first().waitFor({ timeout: 3000 }).catch(() => null)
      detailRows = await page.locator('main .unit-detail[open] .detail-blocs tbody tr:not(.detail-why)').count()
      detailFocus = true
    }
    check(detailRows === 5 && detailFocus, `mon profil politique, « Voir le détail » : le tableau s’ouvre sur l’unité (focus ${detailFocus}), détail de ${detailRows} blocs`)
    const sessionDuring = await page.evaluate(() => Object.keys(sessionStorage).sort())
    const keysAfter = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir')))
    await page.locator('main .unit-detail[open] .detail-q a').first().click()
    await heading(page, 'Qui porte quoi')
    const sessionAfter = await page.evaluate(() => Object.keys(sessionStorage).sort())
    const after = await imageHash()
    check(
      keysAfter.length === 1 && keysAfter[0] === STORAGE && sessionDuring.join() === sessionBefore.join() && sessionAfter.join() === sessionBefore.join(),
      `mon profil politique : rien d’enregistré (clés ${keysAfter.join(', ')} ; session avant ${sessionBefore.join(', ') || 'vide'}, pendant ${sessionDuring.join(', ') || 'vide'}, après « Qui porte quoi » ${sessionAfter.join(', ') || 'vide'})`,
    )
    check(
      !!before && !!after && before.hash === after.hash && before.alt === after.alt && !/profil|échiquier|grille/i.test(after.alt),
      `affiche JPG : la même avant et après « Mon profil politique » (${before?.hash.slice(0, 12)}…, ${after?.hash.slice(0, 12)}…), rien de la page dans son texte de remplacement`,
    )

    // L'accueil, une fois la page prête : le cadre de l'accueil vierge (demande du propriétaire du 17/10/2026), sous
    // l'affiche du plus proche ; « ce ne sont pas vos réponses » au-dessus de la grille fictive, « Le vôtre est prêt » et
    // « Voir mon profil politique », vers la page
    await page.goto(U('/'))
    await page.locator('.home-profile').waitFor()
    const ready = await homeEntry(page)
    check(
      ready.n === 1 && ready.ready && ready.afterLeader && ready.tiles === 15 && ready.href === L('/profil') && ready.tagFirst && ready.text.startsWith('Exemple fictif : ce ne sont pas vos réponses. Mon profil politique') && ready.text.includes('Le vôtre est prêt : il se calcule sur cet appareil quand vous l’ouvrez.') && ready.text.endsWith('Voir mon profil politique') && !ready.text.includes('Voir où j’en suis'),
      `mon profil politique, accueil prêt : le cadre de l’accueil vierge sous l’affiche du plus proche ${ready.afterLeader}, ${ready.tiles} cases fictives, « ${ready.text.slice(0, 50)}… ${ready.text.slice(-26)} »`,
    )

    // En grand écran : le bandeau du dépouillement sous l'affiche, dans sa colonne ; une feuille tout approfondie (un avis
    // sur chaque question) n'a pas de fiche « Pour lire plus de thèmes »
    {
      const quickState = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))
      const wctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
      await wctx.addInitScript(s => {
        if (!sessionStorage.getItem('e2e-seeded')) {
          Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v))
          sessionStorage.setItem('e2e-seeded', '1')
        }
      }, quickState)
      const wp = await wctx.newPage()
      // L'accueil prêt : le cadre sur toute la largeur de l'accueil de retour, sous l'affiche, la grille à gauche et
      // ses mots dans les cases, comme sur l'accueil vierge
      await wp.goto(U('/'))
      await wp.locator('.home-profile').waitFor()
      const frame = await wp.evaluate(() => {
        const box = sel => document.querySelector(sel)?.getBoundingClientRect()
        const f = box('.home-profile'), h = box('.back-hero'), l = box('.back-leader'), g = box('.home-profile .hp-tiles'), t = box('.home-profile .hp-body')
        const words = [...document.querySelectorAll('.home-profile .hp-word')].filter(w => w.checkVisibility()).length
        return f && h && l && g && t ? { left: Math.round(f.left - h.left), width: Math.round(f.width - h.width), below: Math.round(f.top - l.bottom), gridLeft: g.right <= t.left, words } : null
      })
      check(
        !!frame && frame.left === 0 && frame.width === 0 && frame.below > 0 && frame.gridLeft && frame.words === 15,
        `mon profil politique, accueil prêt à 1 280 px : le cadre sur toute la largeur, sous l’affiche, la grille à gauche et ses mots (${JSON.stringify(frame)})`,
      )

      // D'autres états de l'accueil, chacun dans son contexte : la feuille du parcours, modifiée
      const quick = JSON.parse(quickState[STORAGE])
      const homeIn = async (viewport, st) => {
        const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce' })
        await ctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), { ...quickState, [STORAGE]: JSON.stringify(st) })
        const pg = await ctx.newPage()
        await pg.goto(U('/'))
        await pg.locator('.home-profile').waitFor()
        const entryNow = await homeEntry(pg)
        const layout = await pg.evaluate(() => {
          const box = sel => {
            const b = document.querySelector(sel)?.getBoundingClientRect()
            return b ? { l: Math.round(b.left), t: Math.round(b.top + scrollY), b: Math.round(b.bottom + scrollY), w: Math.round(b.width) } : null
          }
          const li = document.querySelector('.back-news-list > li')
          return {
            hero: box('.back-hero'),
            leader: box('.back-leader'),
            frame: box('.home-profile'),
            changed: !!document.querySelector('.back-hero.has-changed .back-intro .changed'),
            // La date du journal dans sa colonne : deux pistes à la grille de chaque entrée
            newsCols: li ? getComputedStyle(li).gridTemplateColumns.split(' ').length : 0,
            // Les titres du journal sont rédigés par IA : la mention avant le premier
            newsAi: !!(document.querySelector('.back-news .ai-label')?.compareDocumentPosition(document.querySelector('.back-news-list a')) & Node.DOCUMENT_POSITION_FOLLOWING),
            newsAll: document.querySelector('.back-news > .g-link')?.textContent ?? '',
            vh: innerHeight,
            wide: document.documentElement.scrollWidth > innerWidth,
          }
        })
        await ctx.close()
        return { ...entryNow, ...layout }
      }
      // Un questionnaire fini plus tôt, pour que « Nouveau depuis vos réponses » ait des entrées
      const earlier = '2026-10-10T10:00:00.000Z'
      const withNews = { ...quick, essentialDoneAt: earlier }
      // Une réponse rapide avec un avis, d'une révision plus ancienne : la question est à revoir, la page reste prête
      const revId = quickQs.map(q => q.id).find(id => Object.values(quick.answers[id]?.ratings ?? {}).some(v => v))
      const revoir = revId ? { ...withNews, answers: { ...quick.answers, [revId]: { ...quick.answers[revId], rev: 999 } } } : null
      for (const width of [1024, 1280]) {
        const full = await homeIn({ width, height: 900 }, withNews)
        check(
          full.ready && full.frame && full.hero && full.frame.l === full.hero.l && full.frame.w === full.hero.w && full.newsCols === 2 && full.newsAi && /^Tout ce qui a changé après le \d/.test(flat(full.newsAll)) && !full.wide,
          `accueil de retour à ${width} px : le cadre sur toute la largeur, la date du journal dans sa colonne (${full.newsCols} pistes), la mention IA avant ses titres, « ${flat(full.newsAll)} »`,
        )
        if (!revoir) continue
        const back = await homeIn({ width, height: 900 }, revoir)
        // Avec la carte des questions à revoir, le cadre reste dans la colonne de l'affiche, sous elle : pas de vide à
        // côté de la carte ; à 1 280 px, dans le premier écran
        check(
          back.ready && back.changed && back.frame && back.leader && back.frame.l === back.leader.l && back.frame.w === back.leader.w && back.frame.t > back.leader.b && (width < 1280 || back.frame.b <= back.vh) && !back.wide,
          `accueil de retour à ${width} px, une question à revoir : le cadre sous l’affiche, dans sa colonne (${JSON.stringify({ frame: back.frame, leader: back.leader, vh: back.vh })})`,
        )
      }
      // Questions ajoutées depuis un questionnaire fini : avec un avis, la page s'est affichée et revient ; après tout
      // passé, elle ne s'est jamais affichée, la phrase générale
      const gone = quickQs.slice(-2).map(q => q.id)
      const minus = answers => Object.fromEntries(Object.entries(answers).filter(([id]) => !gone.includes(id)))
      const added = await homeIn({ width: 390, height: 844 }, { ...withNews, answers: minus(quick.answers) })
      check(
        added.n === 1 && !added.ready && added.afterStatus && added.tagFirst && added.text.includes('Il s’affiche de nouveau une fois les 2 nouvelles questions vues.') && added.text.endsWith('Voir où j’en suis et un exemple'),
        `mon profil politique, accueil après 2 questions ajoutées : « …${added.text.slice(added.text.indexOf('Il s’affiche'))} »`,
      )
      const passed = Object.fromEntries(quickQs.filter(q => !gone.includes(q.id)).map(q => [q.id, { ratings: {}, redLines: [], skipped: true, ...(q.rev ? { rev: q.rev } : {}) }]))
      const addedPassed = await homeIn({ width: 390, height: 844 }, { ...withNews, answers: passed })
      check(
        addedPassed.n === 1 && !addedPassed.ready && !addedPassed.text.includes('de nouveau') && addedPassed.text.includes(`Il s’affiche au bout des ${QUICK} questions du questionnaire rapide : encore 2 questions.`),
        `mon profil politique, accueil après 2 questions ajoutées, tout passé : « …${addedPassed.text.slice(addedPassed.text.indexOf('Il s’affiche'))} »`,
      )
      await wp.goto(U('/resultats'))
      await heading(wp, 'Votre dépouillement')
      const column = await wp.evaluate(() => {
        const b = document.querySelector('.results-profile')?.getBoundingClientRect()
        const l = document.querySelector('.leader')?.getBoundingClientRect()
        return b && l ? { left: Math.round(b.left - l.left), width: Math.round(b.width - l.width), below: Math.round(b.top - l.bottom) } : null
      })
      const all = JSON.parse(quickState[STORAGE])
      for (const q of pack.bank.questions) all.answers[q.id] = { ratings: { [q.approaches[0].id]: 1 }, redLines: [], ...(q.rev ? { rev: q.rev } : {}) }
      await wp.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE, JSON.stringify(all)])
      await wp.goto(U('/profil'))
      await wp.reload()
      await wp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 15000 }).catch(() => null)
      const allDeep = await wp.evaluate(() => ({ chart: document.querySelectorAll('main .profile-chart').length, fiche: document.querySelectorAll('main .deeper-card').length }))
      check(
        !!column && column.left === 0 && column.width === 0 && column.below > 0 && allDeep.chart === 1 && allDeep.fiche === 0,
        `mon profil politique, 1 280 px : bandeau dans la colonne de l’affiche, dessous (${JSON.stringify(column)}) ; tout approfondi, pas de fiche « Pour lire plus de thèmes » (${allDeep.fiche})`,
      )
      await wctx.close()
    }

    // Un second état, avec des lectures nettes (le parcours ci-dessus, questionnaire rapide, n'en a souvent aucune) : sur
    // la première moitié des familles, d'accord avec l'approche principale d'un candidat que la grille classe au premier
    // bloc de l'axe et pas d'accord avec les autres ; sur la seconde, de même avec un candidat de l'avant-dernier bloc ;
    // sans approche principale, la question est passée. En grand écran : l'axe collant, les barres, le survol, le
    // clavier, et « Voir le détail » depuis une ligne.
    const { freshState, sanitizeState } = await importSite('src/core/storage.ts')
    const { panelOf, readEchiquier } = await importSite('src/core/echiquier.ts')
    const { effectiveWeight } = await importSite('src/core/score.ts')
    const axisPanel = panelOf(pack)
    const leftId = axisPanel[0]?.at(-1)
    const rightId = axisPanel[axisPanel.length - 2]?.at(-1)
    const firstHalf = new Set(groups.slice(0, Math.ceil(groups.length / 2)).flatMap(g => g.topicIds))
    const readAnswers = {}
    for (const q of pack.bank.questions) {
      const who = firstHalf.has(q.topicId) ? leftId : rightId
      const mains = q.approaches.map(a => effectiveWeight(pack.positions[who]?.[a.id]) === 2)
      readAnswers[q.id] = mains.some(Boolean)
        ? { ratings: Object.fromEntries(q.approaches.map((a, i) => [a.id, mains[i] ? 1 : -1])), redLines: [], ...(q.rev ? { rev: q.rev } : {}) }
        : { ratings: {}, redLines: [], skipped: true, ...(q.rev ? { rev: q.rev } : {}) }
    }
    // Lot 2 : deux lignes rouges, sur des « pas d'accord » que porte un autre candidat du premier bloc, dans la première
    // moitié des familles (la croix paraît sous un bloc nettement plus près) ; et un thème prioritaire, le premier de la
    // seconde moitié qui a un avis. Rien de cela ne change la lecture
    const redPicks = []
    for (const q of pack.bank.questions) {
      const a = readAnswers[q.id]
      if (redPicks.length >= 2 || !firstHalf.has(q.topicId) || a.skipped) continue
      const x = q.approaches.find(ap => a.ratings[ap.id] === -1 && axisPanel[0].some(id => id !== leftId && (pack.positions[id]?.[ap.id]?.weight ?? 0) > 0))
      if (x) {
        a.redLines = [x.id]
        redPicks.push(q.id)
      }
    }
    const prioTopic = pack.bank.questions.find(q => !firstHalf.has(q.topicId) && !readAnswers[q.id].skipped)?.topicId
    const readState = sanitizeState(
      { ...freshState(pack.election.id, pack.election.dataVersion), answers: readAnswers, weights: prioTopic ? { [prioTopic]: 2 } : {}, essentialDoneAt: new Date().toISOString() },
      pack,
    )
    const readOk = readEchiquier(pack, readState.answers).summary.length > 0
    const readStorage = { [STORAGE]: JSON.stringify(readState) }
    if (readOk) {
      // En papier carbone : les teintes sombres de l'échelle passent aussi les contrôles des couleurs
      const rctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' })
      await rctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), readStorage)
      const rp = await rctx.newPage()
      await rp.goto(U('/profil'))
      await rp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
      const sticky = await rp.evaluate(() => getComputedStyle(document.querySelector('.profile-chart .axis')).position)
      await profileChart(rp, 'lectures nettes, 1 280 px')
      // Et en clair : les mêmes cases, dans les teintes claires
      await rp.emulateMedia({ colorScheme: 'light' })
      await profileColors(rp, 'lectures nettes, 1 280 px')
      await rp.emulateMedia({ colorScheme: 'dark' })
      // « Voir le détail » depuis une ligne lue : le tableau s'ouvre sur l'unité, qui reçoit le focus
      const firstRead = rp.locator('.profile-chart ol.rows[data-group="net"] .row').first()
      await firstRead.click()
      const opened = await rp.evaluate(() => {
        const b = document.querySelector('.profile-chart .row[aria-expanded="true"]')
        const x = document.getElementById(b?.getAttribute('aria-controls') ?? '')
        return { lead: x?.querySelector('.explain-lead')?.textContent ?? '', who: x?.querySelectorAll('.explain-blocs .eb-net').length ?? 0 }
      })
      await rp.locator('.profile-chart .explain:not([hidden]) .link-button').click()
      await rp.locator('main .profile-all[open] .unit-detail[open] .detail-blocs tbody tr').first().waitFor({ timeout: 3000 }).catch(() => null)
      await rp.waitForTimeout(100)
      // Sous chaque bloc lu nettement d'une unité comptée en entier, combien de façons, et combien rapprochent (ou
      // éloignent) au moins autant de lui ; aucune sous un bloc sans lecture nette
      const toDetail = await rp.evaluate(() => {
        const rows = [...document.querySelectorAll('.profile-all .unit-detail[open] .detail-blocs tbody tr')]
        const blocs = rows.filter(r => !r.matches('.detail-why'))
        const why = rows.filter(r => r.matches('.detail-why'))
        const note = document.querySelector('.profile-all .unit-detail[open] .detail-blocs + p')?.textContent ?? ''
        return {
          focus: !!document.activeElement?.matches('.profile-all[open] .unit-detail[open] > summary'),
          blocs: blocs.length,
          exact: !/plus de cent mille/.test(note),
          nets: blocs.filter(r => /nettement plus (près|loin)$/.test(r.lastElementChild?.textContent?.trim() ?? '')).length,
          why: why.map(r => (r.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').trim()),
          placed: why.every(r => r.previousElementSibling?.matches('.has-why')),
        }
      })
      const whyOk =
        toDetail.why.length === (toDetail.exact ? toDetail.nets : 0) &&
        toDetail.placed &&
        toDetail.why.every(t => /^Vos mêmes avis pouvaient se poser de [\d ]+ façons sur ces approches ; ([\d ]+, dont la vôtre, (rapprochent|éloignent) au moins|seule la vôtre (rapproche|éloigne)) autant de ce bloc\.$/.test(t))
      check(
        sticky === 'sticky' && /^Vos réponses se rapprochent nettement/.test(opened.lead) && opened.who > 0 && toDetail.focus && toDetail.blocs === 5 && whyOk,
        `mon profil politique (lectures nettes, 1 280 px) : axe ${sticky}, ligne ouverte « ${opened.lead.slice(0, 50)}… » (${opened.who} bloc(s) nettement plus près ou plus loin, en mots), « Voir le détail » : focus ${toDetail.focus}, ${toDetail.blocs} blocs, ${toDetail.why.length} phrase(s) des façons pour ${toDetail.nets} lecture(s) nette(s)${toDetail.exact ? '' : ' (borne : aucune attendue)'} (« ${toDetail.why[0] ?? ''} »)`,
      )
      // La ligne nette encore ouverte et « Le détail » ouvert sur elle : les petites cases de « Votre affinité, bloc par
      // bloc » et celles du détail suivent la même règle (pleines sur un bloc net seulement), en sombre puis en clair ; en
      // contraste forcé, le cadre épais sur chaque case pleine des lignes, de la ligne ouverte, du détail et de la légende
      {
        const where = 'lectures nettes, une ligne nette ouverte et le détail, 1 280 px'
        await profileColors(rp, where)
        await rp.emulateMedia({ colorScheme: 'light' })
        await profileColors(rp, where)
        await forcedFrames(rp, where, ['lignes', 'ligne ouverte', 'détail', 'légende'])
        await rp.emulateMedia({ colorScheme: 'dark' })
      }
      // « Approfondir » jamais sous un sujet lu sans tendance nette (« Rien de net ») : ni dans sa ligne ouverte, ni dans
      // son détail (refusé par le propriétaire le 15 octobre 2026)
      const flatDetails = await rp.evaluate(async () => {
        const says = [...document.querySelectorAll('.profile-all tr.say')].filter(tr => /^Rien de net/.test(tr.querySelector('.say-text')?.textContent?.trim() ?? ''))
        for (const tr of says) {
          const d = tr.querySelector('details.unit-detail')
          if (d) d.open = true
        }
        await new Promise(r => setTimeout(r, 400))
        const deepens = tr => [...tr.querySelectorAll('a')].some(a => /approfondir/.test(a.getAttribute('href') ?? ''))
        return { n: says.length, opened: says.filter(tr => tr.querySelector('.detail-body')).length, deepen: says.filter(deepens).length }
      })
      check(
        flatDetails.n > 0 && flatDetails.opened === flatDetails.n && flatDetails.deepen === 0,
        `mon profil politique (lectures nettes, 1 280 px) : « Approfondir » sous ${flatDetails.deepen} des ${flatDetails.n} sujets « Rien de net » du tableau (${flatDetails.opened} détails ouverts)`,
      )

      // Lot 2 : les lignes rouges et la priorité, telles que les calcule le site (mêmes réponses, même calcul) ; la croix
      // sous chaque bloc nettement plus près qui a un candidat qui franchit, et seulement là ; son nom lu ; la note sur le
      // bloc entier effacée quand la croix nomme certains candidats d'un bloc, pas tous (splitsABloc) ; « prioritaire » sur
      // la ligne fermée du thème, dans son nom lu ; dans le détail, l'approche rayée et « Franchie par »
      {
        const { computeResults } = await importSite('src/core/score.ts')
        const { currentAnswers } = await importSite('src/core/revisions.ts')
        const { chartRows: rowsOfChart, crossingsOf, hitsOf, splitsABloc } = await importSite('src/ui/profile/rows.ts')
        const { weighOf } = await importSite('src/core/echiquierWeigh.ts')
        const C = await importSite('src/core/echiquierCopy.ts')
        const cur = currentAnswers(pack, readState.answers)
        const hits = hitsOf(computeResults(pack, cur, readState.weights, readState.seed))
        const names = new Map(pack.candidates.map(c => [c.id, c.name]))
        const topicLabel = new Map(pack.bank.topics.map(t => [t.id, t.label]))
        const topicOfQ = new Map(pack.bank.questions.map(q => [q.id, q.topicId]))
        const read = rowsOfChart(groups, readEchiquier(pack, cur), u => u.id).read
        const topicOrder = pack.bank.topics.map(t => t.id)
        const crossOf = new Map(read.map(u => [`sj-${u.kind}-${u.id}-b`, crossingsOf(u, hits, q => topicOfQ.get(q), topicOrder)]))
        const want = new Map(
          read.map(u => [
            `sj-${u.kind}-${u.id}-b`,
            crossOf.get(`sj-${u.kind}-${u.id}-b`).map(gs =>
              gs.map(g => C.crossLine(g.ids.map(id => names.get(id) ?? id), g.level === 'possible', g.count, u.kind === 'famille' ? g.topics.map(t => topicLabel.get(t) ?? t) : null)).join(' '),
            ),
          ]),
        )
        const crossed = [...want].filter(([, texts]) => texts.some(Boolean))
        const issues = []
        // Toutes fermées d'abord (« Voir le détail » a laissé la première ouverte)
        await rp.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))
        for (const [id, texts] of [...crossed, ...[...want].filter(([, t]) => !t.some(Boolean)).slice(0, 1)]) {
          await rp.locator(`#${id}`).click()
          const got = await rp.evaluate(bid => {
            const x = document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')
            const said = el => (el?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
            return {
              texts: [...(x?.querySelectorAll('.explain-blocs > ul > li') ?? [])].map(li => said(li.querySelector('.eb-cross > span:last-child'))),
              named: [...(x?.querySelectorAll('.eb-cross .x') ?? [])].every(e => e.getAttribute('role') === 'img' && e.getAttribute('aria-label') === 'ligne rouge franchie' && !!e.querySelector('svg.ink-cross')),
              underNet: [...(x?.querySelectorAll('.eb-cross') ?? [])].every(e => e.closest('li')?.matches('.is-net') && !!e.closest('li')?.querySelector('.eb-who')),
              note: [...(x?.querySelectorAll('.explain-note') ?? [])].some(p => /bloc entier/.test(said(p))),
              gray: [...(x?.querySelectorAll('.eb-cross > span:last-child') ?? [])].every(e => getComputedStyle(e).color === getComputedStyle(document.querySelector('.eb-who') ?? e).color),
            }
          }, id)
          const norm = t => t.replace(/[\u00a0\u202f]/g, ' ')
          if (got.texts.map(norm).join('|') !== texts.map(norm).join('|')) issues.push(`${id} : « ${got.texts.filter(Boolean).join(' / ')} » au lieu de « ${texts.filter(Boolean).join(' / ')} »`)
          if (!got.named || !got.underNet || !got.gray) issues.push(`${id} : croix ${JSON.stringify(got)}`)
          // La note s'efface aussi quand la fiche « Ce qui pèse le plus » est là (lot 3)
          const ws = weighOf(pack, cur, read.find(r => `sj-${r.kind}-${r.id}-b` === id))
          const card = ws.length === 1 && !!ws[0].suite
          if ((splitsABloc(crossOf.get(id), axisPanel) || card) === got.note) issues.push(`${id} : note sur le bloc entier ${got.note}`)
          await rp.locator(`#${id}`).click()
        }
        const prio = await rp.evaluate(t => {
          const b = document.getElementById(`sj-theme-${t}-b`)
          return {
            row: !!b,
            word: (b?.querySelector('.row-meta .row-prio')?.textContent ?? '').trim(),
            said: (b?.querySelector('.sr-only')?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' '),
            others: document.querySelectorAll('.profile-chart .row-prio').length,
          }
        }, prioTopic)
        // Le détail d'une ligne qui a une croix : chaque ligne rouge de ses questions rayée, et qui la franchit
        let detail = { struck: 0, want: 0, by: [] }
        if (crossed.length) {
          const [id] = crossed[0]
          if ((await rp.locator(`#${id}`).getAttribute('aria-expanded')) !== 'true') await rp.locator(`#${id}`).click()
          await rp.locator('.profile-chart .explain:not([hidden]) .link-button').click()
          await rp.locator('main .profile-all[open] .unit-detail[open] .detail-approaches').first().waitFor({ timeout: 3000 }).catch(() => null)
          const u = read.find(r => `sj-${r.kind}-${r.id}-b` === id)
          detail = await rp.evaluate(d => {
            const body = document.getElementById(d)
            return {
              struck: body?.querySelectorAll('.detail-approach.is-struck').length ?? 0,
              by: [...(body?.querySelectorAll('.detail-cross') ?? [])].map(p => (p.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').trim()),
            }
          }, `d-${u.kind}-${u.id}`)
          detail.want = u.questions.reduce((n, q) => n + (cur[q]?.redLines.length ?? 0), 0)
        }
        check(
          crossed.length > 0 &&
            issues.length === 0 &&
            prio.row &&
            prio.word === 'prioritaire' &&
            prio.said.includes(', prioritaire. Selon la grille') &&
            prio.others === 1 &&
            detail.struck === detail.want &&
            detail.by.length > 0 &&
            detail.by.every(t => /^(Franchie par|Pourrait être franchie par) : .+\.$/.test(t)),
          `mon profil politique (lectures nettes, lot 2) : croix sur ${crossed.length} ligne(s) lue(s) (« ${crossed[0]?.[1].filter(Boolean)[0] ?? ''} »)${issues.length ? ` : ${issues.join(' ; ')}` : ''} ; « prioritaire » sur la ligne de ${prioTopic} (« ${prio.word} », nom lu « …${prio.said.slice(0, 60)}… », ${prio.others} en tout) ; détail : ${detail.struck} approche(s) rayée(s) sur ${detail.want}, « ${detail.by.join(' / ')} »`,
        )
      }

      // Lot 3 : « Ce qui pèse le plus dans cette lecture », tel que le calcule le site (mêmes réponses, même calcul) : dans
      // chaque ligne lue nettement, la fiche (intertitre, question, votre avis, l'approche entière, la suite en nombres),
      // ou sur des blocs non voisins le renvoi au détail ; aucun nom de candidat dans la fiche ; la note sur le bloc entier
      // effacée quand la fiche est là ; le repère de la mini-réglette, masqué aux lecteurs d'écran. Puis le détail d'une
      // ligne : la fiche et la part de chaque question, en points
      {
        const { weighOf } = await importSite('src/core/echiquierWeigh.ts')
        const W = await importSite('src/core/echiquierWeighCopy.ts')
        const C = await importSite('src/core/echiquierCopy.ts')
        const { currentAnswers } = await importSite('src/core/revisions.ts')
        const { chartRows: rowsOfChart } = await importSite('src/ui/profile/rows.ts')
        const cur = currentAnswers(pack, readState.answers)
        const axis = pack.election.spectrum.axis
        const norm = t => (t ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
        const read = rowsOfChart(groups, readEchiquier(pack, cur), u => u.id).read
        const issues = []
        let cards = 0
        let elsewhere = 0
        await rp.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))
        for (const u of read) {
          const id = `sj-${u.kind}-${u.id}-b`
          const ws = weighOf(pack, cur, u)
          const card = ws.length === 1 && ws[0].suite
          const away = ws.length > 1 && ws.every(w => w.suite)
          let want = []
          if (card) {
            const w = ws[0]
            const q = pack.bank.questions.find(x => x.id === w.question)
            const a = q.approaches.find(x => x.id === w.approach)
            want = [W.WEIGH_TITLE, q.prompt, `${C.YOUR_VIEW} ${W.weighView(w.view, !!cur[q.id]?.redLines.includes(a.id))}`, W.quoted(a.text), W.weighWho(C.where(axis, w.seg), w)]
            cards++
          } else if (away) {
            want = [W.WEIGH_TITLE, W.weighElsewhere(ws.map(w => C.where(axis, w.seg)))]
            elsewhere++
          }
          await rp.locator(`#${id}`).click()
          await rp.waitForFunction(bid => !!document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')?.querySelector('.explain-blocs'), id)
          const got = await rp.evaluate(bid => {
            const x = document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')
            const said = el => (el?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
            const fiche = x?.querySelector('.weigh')
            return {
              texts: [...(fiche?.querySelectorAll(':scope > p') ?? [])].map(said),
              note: [...(x?.querySelectorAll('.explain-note') ?? [])].some(p => /bloc entier/.test(said(p))),
              ruler: !fiche?.querySelector('.rating-mark') || fiche.querySelector('.mini-ruler')?.getAttribute('aria-hidden') === 'true',
              before: !fiche || !!(fiche.compareDocumentPosition(x.querySelector('.explain-blocs')) & Node.DOCUMENT_POSITION_FOLLOWING),
            }
          }, id)
          if (got.texts.join(' | ') !== want.map(norm).join(' | ')) issues.push(`${u.kind}-${u.id} : « ${got.texts.join(' / ').slice(0, 160)} » au lieu de « ${want.map(norm).join(' / ').slice(0, 160)} »`)
          if (card && got.note) issues.push(`${u.kind}-${u.id} : note sur le bloc entier avec la fiche`)
          if (!got.ruler || !got.before) issues.push(`${u.kind}-${u.id} : repère ${got.ruler}, fiche avant les blocs ${got.before}`)
          for (const c of pack.candidates) if (got.texts.some(t => t.includes(c.name))) issues.push(`${u.kind}-${u.id} : « ${c.name} » dans la fiche`)
          await rp.locator(`#${id}`).click()
        }
        // Le détail de la première ligne qui a une fiche : la fiche, puis la part de chaque question, en points
        let parts = { n: 0, want: 0, ok: false, title: false }
        const first = read.find(u => {
          const ws = weighOf(pack, cur, u)
          return ws.length === 1 && ws[0].suite
        })
        if (first) {
          const id = `sj-${first.kind}-${first.id}-b`
          await rp.locator(`#${id}`).click()
          await rp.locator('.profile-chart .explain:not([hidden]) .link-button').click()
          await rp.locator(`#d-${first.kind}-${first.id} .detail-parts li`).first().waitFor({ timeout: 3000 }).catch(() => null)
          parts = await rp.evaluate(d => {
            const body = document.getElementById(d)
            const items = [...(body?.querySelectorAll('.detail-parts li') ?? [])].map(li => (li.querySelector('strong')?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' '))
            return { n: items.length, ok: items.every(t => /^(\+|−)?\d+ points?$/.test(t)), title: (body?.querySelector('.detail-weigh .detail-title')?.textContent ?? '') === 'Ce qui pèse le plus dans cette lecture', want: 0 }
          }, `d-${first.kind}-${first.id}`)
          parts.want = first.questions.length
        }
        check(
          read.length > 0 && cards > 0 && issues.length === 0 && (!first || (parts.n === parts.want && parts.ok && parts.title)),
          `mon profil politique (lectures nettes, lot 3) : « Ce qui pèse le plus » dans ${cards} ligne(s) sur ${read.length}, ${elsewhere} renvoi(s) au détail${issues.length ? ` : ${issues.slice(0, 3).join(' ; ')}` : ''} ; détail : ${parts.n} part(s) sur ${parts.want} question(s), en points ${parts.ok}`,
        )
      }
      await rctx.close()
    } else console.log('– mon profil politique : aucune lecture nette pour le second état, contrôles en grand écran sautés')

    // Lot 3, ce que la feuille ci-dessus ne montre pas forcément (contre-vérifications du 17 octobre 2026), sur des clones
    // bruités réels (graines « n:<id>:<s> » de tools/audit-echiquier.mjs ; le questionnaire rapide vu en entier) : le
    // renvoi au détail d'une lecture sur des blocs non voisins, puis le détail, une fiche par suite de blocs, nommée ;
    // « Aussi approche principale… » et le reste de l'écart ; la phrase qui ne compte que les candidats connus sur le
    // sujet (« connus ici »). Le détail : chaque fiche, et les points qui font exactement l'écart du tableau. Puis, à 320 px
    // et texte à 200 %, la ligne ouverte et le détail : rien ne sort de la fiche, et seul un mot trop long pour la ligne
    // entière s'y coupe
    {
      const { weighOf } = await importSite('src/core/echiquierWeigh.ts')
      const W = await importSite('src/core/echiquierWeighCopy.ts')
      const C = await importSite('src/core/echiquierCopy.ts')
      const { profilesFor } = await importSite('tests/fixtures/echiquier-profiles.ts')
      const { chartRows: rowsOfChart } = await importSite('src/ui/profile/rows.ts')
      const { currentAnswers: currentAnswersOf } = await importSite('src/core/revisions.ts')
      const P = profilesFor(pack)
      const axis = pack.election.spectrum.axis
      const norm = t => (t ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
      /** Une feuille de clone bruité, telle que la page l'enregistre, et ses lignes lues nettement */
      const sheetOf = (cid, seed) => {
        const answers = P.toAnswers(P.noisy(P.cloneLarge(cid), `n:${cid}:${seed}`))
        for (const q of pack.bank.questions) {
          if (answers[q.id] && q.rev) answers[q.id].rev = q.rev
          if (q.tier === 'essentiel' && !answers[q.id]) answers[q.id] = { ratings: {}, redLines: [], skipped: true, ...(q.rev ? { rev: q.rev } : {}) }
        }
        const st = sanitizeState({ ...freshState(pack.election.id, pack.election.dataVersion), answers, essentialDoneAt: new Date().toISOString() }, pack)
        const cur = currentAnswersOf(pack, st.answers)
        return { st, cur, read: rowsOfChart(groups, readEchiquier(pack, cur), u => u.id).read }
      }
      /** La première ligne qui convient, d'abord sur les feuilles repérées, sinon sur les dix premières de chaque candidat */
      const find = (hints, fits) => {
        const tries = [...hints, ...P.ranked.flatMap(cid => Array.from({ length: 10 }, (_, s) => [cid, s]))]
        for (const [cid, seed] of tries) {
          const sh = sheetOf(cid, seed)
          for (const u of sh.read) {
            const ws = weighOf(pack, sh.cur, u)
            if (fits(ws)) return { ...sh, u, ws, name: `${cid}:${seed} ${u.kind}-${u.id}` }
          }
        }
        return null
      }
      const pts = w => W.apportion([...w.parts, w.rest], w.shown)
      const cases = [
        ['renvoi', find([['glucksmann', 7], ['retailleau', 4]], ws => ws.length > 1 && ws.every(w => w.suite) && ws.some(w => w.alsoBlocs.length))],
        ['aussi et reste', find([['labib', 3], ['glucksmann', 7]], ws => ws.length === 1 && !!ws[0].suite && ws[0].alsoBlocs.length > 0 && pts(ws[0]).at(-1) !== 0)],
        ['connus ici', find([['melenchon', 3], ['labib', 30]], ws => ws.length === 1 && !!ws[0].suite && ws[0].known < ws[0].size)],
      ]
      const issues = []
      const seen = []
      for (const [label, c] of cases) {
        if (!c) {
          issues.push(`${label} : aucune feuille trouvée`)
          continue
        }
        seen.push(`${label} (${c.name})`)
        const { u, ws, cur } = c
        const id = `sj-${u.kind}-${u.id}-b`
        const questions = u.questions.map(q => pack.bank.questions.find(x => x.id === q))
        const cardOf = w => {
          const q = pack.bank.questions.find(x => x.id === w.question)
          const a = q.approaches.find(x => x.id === w.approach)
          return [q.prompt, `${C.YOUR_VIEW} ${W.weighView(w.view, !!cur[q.id]?.redLines.includes(a.id))}`, W.quoted(a.text), W.weighWho(C.where(axis, w.seg), w)].map(norm)
        }
        for (const [width, zoom] of [
          [1280, 100],
          [320, 200],
        ]) {
          const phone = width < 600
          const cctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce', hasTouch: phone, isMobile: phone })
          await cctx.addInitScript(x => Object.entries(x).forEach(([k, v]) => localStorage.setItem(k, v)), { [STORAGE]: JSON.stringify(c.st) })
          if (zoom !== 100) await cctx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
          const cp = await cctx.newPage()
          await cp.goto(U('/profil'))
          await cp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => issues.push(`${label}, ${width} px : pas de lecture`))
          await cp.locator(`#${id}`).click()
          await cp.waitForFunction(bid => !!document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')?.querySelector('.weigh'), id, { timeout: 5000 }).catch(() => issues.push(`${label}, ${width} px : pas de fiche dans la ligne`))
          // Ce qui sort de la fiche (sa boîte), et les mots coupés qui tenaient sur une ligne entière
          const spillOf = sel =>
            cp.evaluate(sel => {
              const out = []
              for (const box of document.querySelectorAll(sel)) {
                if (!box.checkVisibility()) continue
                const r0 = box.getBoundingClientRect()
                const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
                // Un mot, ce qui ne se coupe pas : les espaces insécables le prolongent (« Accompagner » collé à son
                // guillemet), un trait d'union le finit (« Nouvelle- / Calédonie »)
                for (let n = walker.nextNode(); n; n = walker.nextNode())
                  for (const m of n.data.matchAll(/[^ \t\n-]+-?/g)) {
                    const r = document.createRange()
                    r.setStart(n, m.index)
                    r.setEnd(n, m.index + m[0].length)
                    const rects = [...r.getClientRects()].filter(q => q.width > 0)
                    if (rects.some(q => q.right > r0.right + 1 || q.left < r0.left - 1)) out.push(`« ${m[0]} » sort de ${sel}`)
                    const lines = new Set(rects.map(q => Math.round(q.top))).size
                    const host = n.parentElement.closest('p, li, span') ?? box
                    if (lines > 1 && rects.reduce((t, q) => t + q.width, 0) < host.getBoundingClientRect().width - 1) out.push(`« ${m[0]} » coupé`)
                  }
              }
              return out
            }, sel)
          const row = await cp.evaluate(bid => {
            const x = document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')
            const said = el => (el?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
            return [...(x?.querySelector('.weigh')?.querySelectorAll(':scope > p') ?? [])].map(said)
          }, id)
          const wantRow = (ws.length > 1 ? [W.WEIGH_TITLE, W.weighElsewhere(ws.map(w => C.where(axis, w.seg)))] : [W.WEIGH_TITLE, ...cardOf(ws[0])]).map(norm)
          if (row.join(' | ') !== wantRow.join(' | ')) issues.push(`${label}, ${width} px, ligne : « ${row.join(' / ').slice(0, 200)} » au lieu de « ${wantRow.join(' / ').slice(0, 200)} »`)
          if (label === 'connus ici' && !row.some(t => / connus? ici /.test(t))) issues.push(`${label} : la phrase ne dit pas « connus ici »`)
          if (phone) for (const x of await spillOf('.profile-chart .explain:not([hidden]) .weigh')) issues.push(`${label}, ${width} px à ${zoom} %, ligne : ${x}`)
          // Le détail
          await cp.locator('.profile-chart .explain:not([hidden]) .link-button').click()
          await cp.locator(`#d-${u.kind}-${u.id} .detail-parts li`).first().waitFor({ timeout: 5000 }).catch(() => issues.push(`${label}, ${width} px : pas de parts dans le détail`))
          const detail = await cp.evaluate(d => {
            const body = document.getElementById(d)
            const said = el => (el?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
            // L'écart de chaque bloc, dans l'ordre de l'axe : « +39 points, nettement plus près »
            const gaps = [...(body?.querySelectorAll('.detail-blocs tbody tr:not(.detail-why)') ?? [])].map(tr => said(tr.lastElementChild))
            return {
              title: said(body?.querySelector('.detail-weigh > .detail-title')),
              gaps,
              segs: [...(body?.querySelectorAll('.detail-weigh-seg') ?? [])].map(seg => ({
                for: said(seg.querySelector('.detail-weigh-for')),
                card: [...seg.querySelectorAll('.weigh > p')].map(said),
                small: [...seg.querySelectorAll(':scope > p.small')].map(said),
                parts: [...seg.querySelectorAll('.detail-parts li')].map(li => [said(li.querySelector('span')), said(li.querySelector('strong'))]),
              })),
            }
          }, `d-${u.kind}-${u.id}`)
          if (detail.title !== W.WEIGH_TITLE) issues.push(`${label}, ${width} px : intertitre du détail « ${detail.title} »`)
          if (detail.segs.length !== ws.length) issues.push(`${label}, ${width} px : ${detail.segs.length} fiche(s) dans le détail pour ${ws.length} suite(s)`)
          ws.forEach((w, i) => {
            const got = detail.segs[i]
            if (!got) return
            const p = pts(w)
            const want = {
              for: ws.length > 1 ? norm(W.weighFor(C.where(axis, w.seg))) : '',
              card: cardOf(w),
              small: [
                ...(w.alsoBlocs.length ? [W.weighAlso(C.whereAll(axis, w.alsoBlocs), w.alsoCount, w.suite === 'principale')] : []),
                W.weighPartsLead(w.seg.length),
                ...(p.at(-1) ? [W.weighRest(p.at(-1))] : []),
              ].map(norm),
              parts: questions.map((q, j) => [norm(q.prompt), norm(W.points(p[j]))]),
            }
            for (const k of ['for', 'card', 'small', 'parts'])
              if (JSON.stringify(got[k]) !== JSON.stringify(want[k])) issues.push(`${label}, ${width} px, détail ${w.seg.join('')}, ${k} : « ${JSON.stringify(got[k]).slice(0, 180)} » au lieu de « ${JSON.stringify(want[k]).slice(0, 180)} »`)
            // Les points affichés, parts et reste, font l'écart du tableau du bloc (une fiche d'un seul bloc)
            if (w.seg.length === 1) {
              const table = Number((detail.gaps[w.seg[0]] ?? '').replace('−', '-').match(/^[+-]?\d+/)?.[0])
              const sum = got.parts.reduce((t, [, x]) => t + Number(x.replace('−', '-').match(/^[+-]?\d+/)?.[0] ?? NaN), 0) + (p.at(-1) ?? 0)
              if (sum !== table) issues.push(`${label}, ${width} px, détail : les points font ${sum}, l’écart du tableau ${table}`)
            }
          })
          if (phone) for (const x of await spillOf(`#d-${u.kind}-${u.id} .detail-weigh`)) issues.push(`${label}, ${width} px à ${zoom} %, détail : ${x}`)
          const wide = await cp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
          if (wide > 0) issues.push(`${label}, ${width} px à ${zoom} % : ${wide} px de trop`)
          // Un autre onglet retire une réponse du sujet, sa ligne et son détail ouverts : la page relit, sans erreur (la
          // lecture affichée est toujours celle des réponses courantes ; contre-vérification du lot 3, la page cassait)
          if (width === 1280 && label === 'aussi et reste') {
            const errors = []
            cp.on('pageerror', e => errors.push(e.message))
            const other = await cctx.newPage()
            await other.goto(U('/'))
            const gone = u.questions.find(q => pack.bank.questions.find(x => x.id === q)?.tier !== 'essentiel') ?? u.questions[0]
            const after = structuredClone(c.st)
            delete after.answers[gone]
            await other.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE, JSON.stringify(after)])
            await cp.waitForTimeout(400)
            await cp
              .waitForFunction(() => document.querySelectorAll('.profile-chart .row').length > 0 && (document.querySelector('main [role="status"]')?.textContent ?? '').includes('Lecture prête.'), null, { timeout: 15000 })
              .catch(() => null)
            const rows = await cp.locator('.profile-chart .row').count()
            if (errors.length || !rows) issues.push(`${label} : un autre onglet retire « ${gone} », ${errors.length} erreur(s) de la page${errors[0] ? ` (« ${errors[0].slice(0, 80)} »)` : ''}, ${rows} ligne(s) ensuite`)
            else seen.push('un autre onglet retire une réponse : la page relit, sans erreur')
            await other.close()
          }
          await cctx.close()
        }
      }
      check(issues.length === 0, `mon profil politique (lot 3, cas repérés) : ${seen.join(', ')}, ligne et détail à 1 280 px et à 320 px texte à 200 %${issues.length ? ` : ${[...new Set(issues)].slice(0, 6).join(' ; ')}` : ''}`)
    }

    // « Pâle sauf net », une case nette au palier « mitigé » (décision du propriétaire du 17 octobre 2026 ; la feuille
    // mêlée ci-dessus n'en porte pas forcément) : sur le clone bruité de la maquette (graine « n:attal:11 », le
    // questionnaire rapide vu en entier), la première ligne qui en porte une, ouverte, puis son détail : sa case dans la
    // ligne, sa petite case dans « Votre affinité, bloc par bloc » et sa case du détail, pleines dans l'aplat de leur sens,
    // « Mitigé » écrit, en sombre et en clair ; en contraste forcé, le cadre épais
    {
      const { profilesFor } = await importSite('tests/fixtures/echiquier-profiles.ts')
      const { chartRows: rowsOfChart } = await importSite('src/ui/profile/rows.ts')
      const { currentAnswers: currentOf } = await importSite('src/core/revisions.ts')
      const { affinityBand } = await importSite('src/core/affinity.ts')
      const P = profilesFor(pack)
      const answers = P.toAnswers(P.noisy(P.cloneLarge('attal'), 'n:attal:11'))
      for (const q of pack.bank.questions) {
        if (answers[q.id] && q.rev) answers[q.id].rev = q.rev
        if (q.tier === 'essentiel' && !answers[q.id]) answers[q.id] = { ratings: {}, redLines: [], skipped: true, ...(q.rev ? { rev: q.rev } : {}) }
      }
      const st = sanitizeState({ ...freshState(pack.election.id, pack.election.dataVersion), answers, essentialDoneAt: new Date().toISOString() }, pack)
      const shown = rowsOfChart(groups, readEchiquier(pack, currentOf(pack, st.answers)), u => u.id)
      const u = [...shown.read, ...shown.apart].find(x => x.cells.some(c => affinityBand(c.affinity)?.key === 'mitige' && (c.mark === 'pres' || c.mark === 'loin')))
      if (!u) check(false, 'mon profil politique, case nette « mitigé » : aucune sur le clone bruité n:attal:11')
      else {
        const mctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' })
        await mctx.addInitScript(x => Object.entries(x).forEach(([k, v]) => localStorage.setItem(k, v)), { [STORAGE]: JSON.stringify(st) })
        const mp = await mctx.newPage()
        await mp.goto(U('/profil'))
        await mp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => null)
        const id = `sj-${u.kind}-${u.id}-b`
        await mp.locator(`#${id}`).click()
        await mp.waitForFunction(bid => !!document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')?.querySelector('.explain-blocs'), id, { timeout: 5000 }).catch(() => null)
        await mp.locator('.profile-chart .explain:not([hidden]) .link-button').click()
        await mp.locator(`#d-${u.kind}-${u.id} .detail-blocs tbody tr`).first().waitFor({ timeout: 5000 }).catch(() => null)
        await mp.waitForTimeout(200)
        const where = `case nette « mitigé », ${u.kind}-${u.id} ouverte et son détail, 1 280 px`
        await profileColors(mp, where)
        await mp.emulateMedia({ colorScheme: 'light' })
        await profileColors(mp, where)
        await forcedFrames(mp, where, ['lignes', 'ligne ouverte', 'détail', 'légende'])
        await mctx.close()
      }
    }

    // Lot 4, « Votre façon de répondre » : la phrase, sans titre, après les domaines et avant la fiche repliée, quand presque
    // toutes les cases mises à l'épreuve ont leur point de comparaison du même côté (ui/profile/rows.ts, mannerOf), mot
    // pour mot celle du calcul. Ses deux côtés : un clone bruité réel (graine « n:<id>:<s> » de tools/audit-echiquier.mjs,
    // le questionnaire rapide vu en entier), côté « éloigné », la fiche repliée après elle ; une feuille remplie par un
    // programme qui approuve tout sauf une approche, au seul questionnaire rapide, côté « proche », la fiche ouverte sous le
    // compte. Rien avec des avis uniformes (C9 : le calcul seul n'y compte aucun sujet, chacun n'ayant qu'une façon de poser
    // les mêmes avis), ni sur la feuille mêlée des lectures nettes ci-dessus si le calcul n'en dit rien. À 390 px, puis à
    // 320 px texte à 200 % : rien ne sort de la page
    {
      const C = await importSite('src/core/echiquierCopy.ts')
      const { profilesFor } = await importSite('tests/fixtures/echiquier-profiles.ts')
      const { chartRows: rowsOfChart, mannerOf } = await importSite('src/ui/profile/rows.ts')
      const { currentAnswers: currentOf } = await importSite('src/core/revisions.ts')
      const P = profilesFor(pack)
      const quickOnly = q => q.tier === 'essentiel'
      const norm = t => (t ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
      /** Une feuille telle que la page l'enregistre : le questionnaire rapide vu en entier */
      const stateOf = answers => {
        for (const q of pack.bank.questions) {
          if (answers[q.id] && q.rev) answers[q.id].rev = q.rev
          if (q.tier === 'essentiel' && !answers[q.id]) answers[q.id] = { ratings: {}, redLines: [], skipped: true, ...(q.rev ? { rev: q.rev } : {}) }
        }
        return sanitizeState({ ...freshState(pack.election.id, pack.election.dataVersion), answers, essentialDoneAt: new Date().toISOString() }, pack)
      }
      /** La phrase que donne le calcul, comme la page (rien avec des avis uniformes : mannerOf n'y compte aucun sujet) */
      const wanted = st => {
        const cur = currentOf(pack, st.answers)
        const m = mannerOf(rowsOfChart(groups, readEchiquier(pack, cur), u => u.id), pack.bank.questions, cur)
        return m ? { near: m.near, text: norm(C.manner(m.near, m.k, m.n)) } : null
      }
      const agreeAll = Object.fromEntries(pack.bank.questions.filter(quickOnly).map(q => [q.id, { ratings: Object.fromEntries(q.approaches.map(a => [a.id, 1])), redLines: [] }]))
      const cases = [
        ['clone bruité d’Anasse Kazib', stateOf(P.toAnswers(P.noisy(P.cloneLarge('kazib'), 'n:kazib:5'))), false],
        ['tout sauf un, rapide seul', stateOf(P.toAnswers(P.randomProfile('e2e-facon:tout-sauf-un:0', 'tout-sauf-un', quickOnly))), true],
        ['avis uniformes', stateOf(agreeAll), null],
        ['feuille mêlée', readState, undefined],
      ]
      const issues = []
      const seen = []
      for (const [label, st, side] of cases) {
        const want = wanted(st)
        if (side !== undefined && (want?.near ?? null) !== side) issues.push(`${label} : le calcul donne ${want ? (want.near ? '« proche »' : '« éloigné »') : 'aucune phrase'}`)
        for (const [width, zoom] of [
          [390, 100],
          [320, 200],
        ]) {
          const fctx = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true })
          await fctx.addInitScript(x => Object.entries(x).forEach(([k, v]) => localStorage.setItem(k, v)), { [STORAGE]: JSON.stringify(st) })
          if (zoom !== 100) await fctx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
          const fp = await fctx.newPage()
          await fp.goto(U('/profil'))
          await fp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 20000 }).catch(() => issues.push(`${label}, ${width} px : pas de lecture`))
          const got = await fp.evaluate(() => {
            const after = (a, b) => !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
            const p = document.querySelector('.profile-chart .manner')
            const card = document.querySelector('.profile-chart .deeper-card')
            const r = p?.getBoundingClientRect()
            return {
              n: document.querySelectorAll('.profile-chart .manner').length,
              text: p?.textContent ?? null,
              afterFamilies: after([...document.querySelectorAll('.profile-chart .fam-group')].at(-1), p),
              card: !card ? 'aucune' : card.closest('.chart-head') ? 'sous le compte' : after(p, card) ? 'après la phrase' : 'avant la phrase',
              beforeNote: after(p, document.querySelector('.profile-chart .chart-note')),
              // Sans titre : rien qui la nomme, ni intertitre juste avant elle
              titled: !!p && (/^H\d$/.test(p.previousElementSibling?.tagName ?? '') || p.hasAttribute('aria-labelledby')),
              inside: !r || (r.left >= 0 && r.right <= document.documentElement.clientWidth + 1),
              uniform: document.querySelector('.profile-chart .chart-state')?.textContent ?? '',
              wide: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            }
          })
          const where = `${label}, ${width} px${zoom === 100 ? '' : ` à ${zoom} %`}`
          if (got.n !== (want ? 1 : 0)) issues.push(`${where} : ${got.n} phrase(s), ${want ? 'une' : 'aucune'} attendue`)
          if (want) {
            if (norm(got.text) !== want.text) issues.push(`${where} : « ${norm(got.text)} » au lieu de « ${want.text} »`)
            if (!got.afterFamilies || !got.beforeNote || got.titled) issues.push(`${where} : place ${JSON.stringify(got)}`)
            if (label.startsWith('clone') && got.card !== 'après la phrase') issues.push(`${where} : la fiche ${got.card}`)
            if (label.includes('rapide') && got.card !== 'sous le compte') issues.push(`${where} : la fiche ${got.card}`)
          }
          if (label === 'avis uniformes' && norm(got.uniform) !== norm(C.UNIFORM)) issues.push(`${where} : pas l’état des avis uniformes (« ${norm(got.uniform).slice(0, 60)} »)`)
          if (got.wide > 0 || !got.inside) issues.push(`${where} : ${got.wide} px de trop, phrase dans la page ${got.inside}`)
          if (width === 390) seen.push(`${label} ${want ? `(« ${want.near ? 'proche' : 'éloigné'} », fiche ${got.card})` : '(aucune phrase)'}`)
          await fctx.close()
        }
      }
      check(issues.length === 0, `mon profil politique (lot 4, votre façon de répondre) : ${seen.join(', ')}, à 390 px et à 320 px texte à 200 %${issues.length ? ` : ${[...new Set(issues)].slice(0, 6).join(' ; ')}` : ''}`)
    }

    // Une page lourde sur un téléphone lent (processeur bridé dix fois : bien plus de 300 ms de calcul) : tout noté sur
    // la banque entière, d'accord, pas d'accord et sans avis en rotation. Le statut « Lecture en cours » paraît (au-delà
    // de 300 ms), puis « Lecture prête. » : le calcul laisse passer la minuterie de la page, que les reprises de
    // scheduler.yield, sous Chromium, feraient attendre jusqu'à la fin (contre-vérification du 15 octobre 2026)
    {
      const { STATUS_BUSY, STATUS_READY } = await importSite('src/core/echiquierCopy.ts')
      const heavyAnswers = {}
      pack.bank.questions.forEach((q, qi) => {
        const ratings = Object.fromEntries(q.approaches.flatMap((a, i) => ([1, -1, 0][(qi + i) % 3] ? [[a.id, [1, -1, 0][(qi + i) % 3]]] : [])))
        heavyAnswers[q.id] = { ratings, redLines: [], ...(q.rev ? { rev: q.rev } : {}) }
      })
      const heavy = sanitizeState({ ...freshState(pack.election.id, pack.election.dataVersion), answers: heavyAnswers, essentialDoneAt: new Date().toISOString() }, pack)
      const hctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true })
      await hctx.addInitScript(s => {
        Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v))
        window.__statuses = []
        const watch = () =>
          new MutationObserver(() => {
            const text = document.querySelector('main [role="status"]')?.textContent ?? ''
            if (text && window.__statuses.at(-1) !== text) window.__statuses.push(text)
          }).observe(document, { subtree: true, childList: true, characterData: true })
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch)
        else watch()
      }, { [STORAGE]: JSON.stringify(heavy) })
      const hp = await hctx.newPage()
      await hp.goto(HOME)
      await hp.waitForLoadState('networkidle')
      const cdp = await hctx.newCDPSession(hp)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 10 })
      // Le statut de l'accueil (en ligne, hors ligne) ne compte pas
      await hp.evaluate(() => (window.__statuses = []))
      const t0 = Date.now()
      await hp.goto(U('/profil'))
      await hp.locator('[role="status"]', { hasText: STATUS_READY }).waitFor({ timeout: 30000 }).catch(() => null)
      const ms = Date.now() - t0
      const statuses = await hp.evaluate(() => window.__statuses)
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
      check(
        statuses.join(' → ') === `${STATUS_BUSY} → ${STATUS_READY}`,
        `mon profil politique, page lourde, processeur bridé dix fois : « ${statuses.join(' » → « ')} » en ${ms} ms (« Lecture en cours » attendu avant « Lecture prête. »)`,
      )
      await hctx.close()
    }

    // Mise en page : rien en largeur à 320, 390 et 1 280 px, ni au texte agrandi à 200 % (une ligne ouverte et le détail
    // ouvert) ; aucun nom de sujet ni mot de case rogné, ni coupé sur deux lignes ; l'indication au doigt sur un téléphone. Au clavier, en remontant
    // depuis « La méthode en détail » à travers le graphique (puis le détail ouvert, à 390 px), aucun élément qui reçoit
    // le focus ne passe sous l'en-tête du site, l'axe collant, son rappel ou l'en-tête des colonnes (WCAG 2.4.11)
    const state = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])))
    const layoutIssues = []
    const focusIssues = []
    const miniRuns = []
    const covered = () => {
      const a = document.activeElement
      if (!a || !a.closest('.profile-chart, .profile-detail')) return null
      const r = a.getBoundingClientRect()
      const site = document.querySelector('.form-header').getBoundingClientRect().bottom + 5
      let cover = site
      // Dans la barre des domaines, collée ou non, seul l'en-tête du site peut couvrir le focus : le rappel des blocs et
      // l'axe collant sont dessous (depuis le 17 octobre 2026, le focus n'y fait plus défiler la page)
      if (a.closest('.profile-nav')) return r.top < site - 2 ? `${(a.textContent ?? '').trim().slice(0, 30)} (${Math.round(r.top)}-${Math.round(r.bottom)}, sous l’en-tête jusqu’à ${Math.round(site)})` : null
      // La barre des domaines, collée sous l'en-tête ; puis, dessous, le rappel des blocs ou l'axe collant
      const nav = document.querySelector('.profile-nav')
      const nr = nav?.getBoundingClientRect()
      if (nav && getComputedStyle(nav).position === 'sticky' && nr.top <= site + 1 && nr.bottom > site) cover = nr.bottom
      const mini = document.querySelector('.axis-mini.is-on')
      if (mini) cover = Math.max(cover, mini.getBoundingClientRect().bottom)
      const axis = document.querySelector('.profile-chart .axis')
      const ar = axis.getBoundingClientRect()
      if (getComputedStyle(axis).position === 'sticky' && ar.top <= cover + 1 && ar.bottom > cover && !a.closest('.axis')) cover = Math.max(cover, ar.bottom)
      const head = a.closest('.profile-all') ? document.querySelector('table.echiquier > thead')?.getBoundingClientRect() : null
      if (head && head.height > 0 && head.top <= site + 1 && !a.closest('thead')) cover = Math.max(cover, head.bottom)
      return r.top < cover - 2 ? `${(a.textContent ?? '').trim().slice(0, 30)} (${Math.round(r.top)}-${Math.round(r.bottom)}, couvert jusqu’à ${Math.round(cover)})` : null
    }
    const runs = [
      [320, 100, 'parcours'],
      [390, 200, 'parcours'],
      [320, 200, readOk ? 'lectures' : 'parcours'],
      ...(readOk ? [[320, 100, 'lectures'], [390, 100, 'lectures'], [390, 200, 'lectures'], [1280, 100, 'lectures'], [1280, 200, 'lectures']] : [[390, 100, 'parcours'], [1280, 100, 'parcours'], [1280, 200, 'parcours']]),
    ]
    for (const [width, zoom, which] of runs) {
      const phone = width < 600
      const lctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce', hasTouch: phone, isMobile: phone })
      await lctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), which === 'lectures' ? readStorage : state)
      if (zoom !== 100) await lctx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
      const lp = await lctx.newPage()
      await lp.goto(U('/profil'))
      await lp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => layoutIssues.push(`${width} px (${which}) : pas de lecture`))
      if (phone && zoom === 100) {
        const touch = await lp.evaluate(() => [document.querySelector('.hint-touch')?.checkVisibility(), document.querySelector('.hint-click')?.checkVisibility()])
        if (!touch[0] || touch[1]) layoutIssues.push(`${width} px : l’indication n’est pas « Touchez… »`)
      }
      if (width === 390 && zoom === 100) {
        // En remontant de « La méthode en détail » jusqu'au haut du graphique : c'est en remontant que l'axe collant ou son
        // rappel peuvent couvrir l'élément qui reçoit le focus
        for (const detail of [false, true]) {
          if (detail) {
            await lp.locator('main .profile-all > summary').click()
            await lp.locator('main .unit-detail summary').first().click()
            await lp.evaluate(() => document.querySelector('.profile-detail .detail-q a')?.scrollIntoView())
          }
          await lp.evaluate(d => (d ? document.querySelector('.profile-detail .detail-q a') : document.querySelector('.profile-keep a'))?.focus(), detail)
          for (let k = 0; k < 45; k++) {
            await lp.keyboard.press('Shift+Tab')
            const stop = await lp.evaluate(covered)
            if (stop) focusIssues.push(`${width} px : ${stop}`)
          }
          if (detail) await lp.locator('main .profile-all > summary').click()
        }
      }
      if (width === 1280 && zoom === 100) {
        await lp.evaluate(() => document.querySelector('.profile-keep a')?.focus())
        for (let k = 0; k < 30; k++) {
          await lp.keyboard.press('Shift+Tab')
          const stop = await lp.evaluate(covered)
          if (stop) focusIssues.push(`${width} px : ${stop}`)
        }
      }
      // Au téléphone, texte à 200 %, chaque ligne ouverte tour à tour (elles s'ouvrent une à une) : la liste des blocs, leurs
      // noms et leurs croix ne sortent ni de leur ligne de bloc, ni de la page, et aucun mot ne s'y coupe, sinon après un
      // trait d'union (« Dupont-Aignan », « franchissent » et « nettement » sortaient de leur colonne à 320 px :
      // contre-vérification du lot 2)
      if (phone && zoom === 200 && which === 'lectures') {
        const ids = await lp.locator('.profile-chart .row').evaluateAll(bs => bs.map(b => b.id))
        const spill = new Set()
        let opened = 0
        for (const id of ids) {
          if ((await lp.locator(`#${id}`).getAttribute('aria-expanded')) !== 'true') await lp.locator(`#${id}`).click()
          const x = await lp.evaluate(bid => {
            const ex = document.getElementById(document.getElementById(bid)?.getAttribute('aria-controls') ?? '')
            const out = { wide: document.documentElement.scrollWidth - document.documentElement.clientWidth, spill: [], cut: [], blocs: 0 }
            for (const li of ex?.querySelectorAll('.explain-blocs li') ?? []) {
              if (!li.checkVisibility()) continue
              out.blocs++
              const right = li.getBoundingClientRect().right
              const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT)
              for (let n = walker.nextNode(); n; n = walker.nextNode())
                for (const m of n.data.matchAll(/[^\s-]+-?/g)) {
                  const r = document.createRange()
                  r.setStart(n, m.index)
                  r.setEnd(n, m.index + m[0].length)
                  const rects = [...r.getClientRects()].filter(q => q.width > 0)
                  if (rects.some(q => q.right > right + 1)) out.spill.push(m[0])
                  if (new Set(rects.map(q => Math.round(q.top))).size > 1) out.cut.push(m[0])
                }
            }
            return out
          }, id)
          if (x.blocs) opened++
          if (x.wide > 0) spill.add(`${id} : ${x.wide} px de trop`)
          for (const w of x.spill) spill.add(`${id} : « ${w} » sort de sa ligne`)
          for (const w of x.cut) spill.add(`${id} : « ${w} » coupé`)
        }
        if (!opened) layoutIssues.push(`${width} px à ${zoom} % (${which}) : aucune ligne ouverte`)
        if (spill.size) layoutIssues.push(`${width} px à ${zoom} % (${which}), lignes ouvertes une à une (${opened}) : ${[...spill].slice(0, 6).join(', ')}`)
      }
      // Une ligne ouverte et le détail ouvert
      await lp.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))
      await lp.locator('.profile-chart .row').first().click().catch(() => null)
      await lp.evaluate(() => {
        const d = document.querySelector('main .profile-all')
        if (d) d.open = true
      })
      await lp.locator('main .unit-detail summary').first().click().catch(() => null)
      await lp.waitForTimeout(100)
      const wide = await lp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (wide > 0) layoutIssues.push(`${width} px à ${zoom} % (${which}) : ${wide} px de trop`)
      const clipped = await lp.evaluate(() =>
        [...document.querySelectorAll('.profile-chart .row-name, .profile-chart .zone-bloc, .profile-chart .tile, main .echiquier .tile, .profile-nav .pn-link')]
          .filter(e => e.checkVisibility() && (e.scrollWidth > e.clientWidth + 1 || (e.classList.contains('tile') && e.scrollHeight > e.clientHeight + 1)))
          .map(e => e.textContent.trim().slice(0, 24)),
      )
      if (clipped.length) layoutIssues.push(`${width} px à ${zoom} % (${which}) : rogné ${clipped.slice(0, 3).join(', ')}`)
      // Aucun mot du palier, ni de la lecture nette, ni de la liste d'une ligne ouverte coupé sur deux lignes : une coupure
      // dans la case ne déborde pas, il faut la chercher mot par mot (les rectangles d'un mot sur deux hauteurs). Seule
      // permise : après le trait d'union d'un nom composé, au texte très agrandi (« Dupont- / Aignan »)
      const cut = await lp.evaluate(() => {
        const out = new Set()
        for (const el of document.querySelectorAll('main .tile-word, main .tile-net, main .explain-blocs li')) {
          if (!el.checkVisibility()) continue
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
          for (let n = walker.nextNode(); n; n = walker.nextNode())
            for (const m of n.data.matchAll(/[^\s-]+-?/g)) {
              const r = document.createRange()
              r.setStart(n, m.index)
              r.setEnd(n, m.index + m[0].length)
              if (new Set([...r.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))).size > 1) out.add(m[0])
            }
        }
        return [...out]
      })
      if (cut.length) layoutIssues.push(`${width} px à ${zoom} % (${which}) : mot coupé ${cut.slice(0, 4).join(', ')}`)
      // Au téléphone, le rappel collant des blocs, une fois l'axe sorti de l'écran : ses libellés passent à la ligne,
      // jamais rognés
      if (phone) {
        await lp.locator('.profile-chart .row[aria-expanded="true"]').evaluateAll(bs => bs.forEach(b => b.click()))
        await lp.evaluate(() => {
          const top = document.querySelector('.form-header').getBoundingClientRect().bottom
          window.scrollTo(0, document.querySelector('.profile-chart .rows-wrap').getBoundingClientRect().top + scrollY - top + 8)
        })
        await lp.waitForTimeout(150)
        const mini = await lp.evaluate(() => {
          const spans = [...document.querySelectorAll('.axis-mini.is-on .axis-mini-inner > span')]
          return { on: spans.length > 0, clipped: spans.filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).map(e => e.textContent.trim()) }
        })
        miniRuns.push(mini.on)
        if (mini.clipped.length) layoutIssues.push(`${width} px à ${zoom} % (${which}) : rappel des blocs rogné ${mini.clipped.join(', ')}`)
      }
      await lctx.close()
    }
    check(layoutIssues.length === 0 && miniRuns.some(Boolean), `mon profil politique : rien en largeur, ni rogné, ni mot coupé à 320, 390 et 1 280 px, au texte normal et à 200 % (rappel des blocs vu ${miniRuns.filter(Boolean).length} fois sur ${miniRuns.length}), « Touchez… » au doigt${layoutIssues.length ? ` : ${layoutIssues.join(' ; ')}` : ''}`)
    check(focusIssues.length === 0, `mon profil politique, au clavier à 390 et 1 280 px : aucun focus caché sous l’en-tête, la barre des domaines, l’axe collant ou son rappel, ni l’en-tête des colonnes du détail${focusIssues.length ? ` : ${focusIssues.slice(0, 3).join(' ; ')}` : ''}`)

    // La barre collante des domaines, puis des sujets du domaine en cours (demande du propriétaire du 17 octobre 2026),
    // à 375 × 812 au doigt, sur la feuille la plus longue : les domaines de la page dans leur ordre, des noms seulement ;
    // la hauteur de tout ce qui colle (en-tête, barre, rappel des blocs), mesurée au milieu des lignes ; le domaine et le
    // sujet en cours, ceux qui passent sous la ligne du focus, marqués et dans la vue de leur rangée ; un toucher sur un
    // domaine, puis sur chaque sujet, y mène et donne le focus à son titre, jamais sous les éléments collants, l'intertitre
    // du groupe en vue ; au clavier, une tabulation par rangée qui suit le focus, les flèches, sans que la page défile, et
    // le focus gardé quand elle défile ; « Le détail » ouvert, la barre suit encore ; en contraste forcé, le trait de
    // l'élément en cours ; la règle de la moitié de l'écran (texte à 200 %, 320 × 568, 1 024 × 600, 1 024 × 768) ; à
    // la souris, la rangée qui déborde garde sa barre de défilement ; à 1 280 px, tous les domaines sur une rangée
    {
      const navIssues = []
      const said = []
      const nctx = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true })
      await nctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), readOk ? readStorage : state)
      const np = await nctx.newPage()
      await np.goto(U('/profil'))
      await np.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => navIssues.push('pas de lecture'))
      /** La barre, la page et ce qui colle, tels qu'ils sont à l'écran */
      const navState = () =>
        np.evaluate(() => {
          const text = el => (el?.textContent ?? '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim()
          const nav = document.querySelector('.profile-nav')
          const [domains, subjects] = [...(nav?.querySelectorAll('.pn-list') ?? [])]
          const links = ul => [...(ul?.querySelectorAll('a') ?? [])]
          const header = document.querySelector('.form-header').getBoundingClientRect()
          const nr = nav?.getBoundingClientRect()
          const mini = document.querySelector('.axis-mini.is-on')?.getBoundingClientRect()
          const line = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 2
          // Le domaine et la ligne sous la ligne du focus, lus sur la page
          const groups = [...document.querySelectorAll('.profile-chart .fam-group')]
          const group = groups.find(g => g.getBoundingClientRect().top <= line && g.getBoundingClientRect().bottom > line)
          // La ligne sous la ligne du focus, ou celle qui suit l'intertitre qui y passe
          const lines = group ? [...group.querySelectorAll('.row-item')] : []
          const at = lines.findIndex(r => r.getBoundingClientRect().bottom > line)
          const current = ul => links(ul).findIndex(a => a.getAttribute('aria-current') === 'location')
          const inView = (ul, i) => {
            const a = links(ul)[i]?.getBoundingClientRect()
            const u = ul?.getBoundingClientRect()
            return !!a && !!u && a.left >= u.left - 1 && a.right <= u.right + 1
          }
          return {
            label: nav?.getAttribute('aria-label') ?? '',
            sticky: nav ? getComputedStyle(nav).position : '',
            domainLabels: links(domains).map(text),
            pageDomains: groups.map(g => g.id.replace(/^fam-/, '')),
            familyLabels: groups.map(g => text(g.querySelector('.fam-name')) || null),
            heights: { header: Math.round(header.height), navTop: nr ? Math.round(nr.top) : null, nav: nr ? Math.round(nr.height) : 0, mini: mini ? Math.round(mini.height) : 0, bottom: Math.round(Math.max(nr?.bottom ?? 0, mini?.bottom ?? 0, header.bottom)) },
            want: group ? groups.indexOf(group) : -1,
            wantSubject: group ? (at < 0 ? lines.length - 1 : at) : -1,
            curD: current(domains),
            curS: current(subjects),
            seenD: inView(domains, current(domains)),
            seenS: inView(subjects, current(subjects)),
            tabbable: [...(nav?.querySelectorAll('a') ?? [])].filter(a => a.tabIndex === 0).length,
            currents: [...(nav?.querySelectorAll('[aria-current]') ?? [])].length,
            // Rien d'une lecture : ni case, ni marque nette, ni couleur d'un bloc
            reading: !!nav?.querySelector('.tile, [data-net], .key-tile'),
            subjectsLabel: subjects?.getAttribute('aria-label') ?? '',
            subjectLabels: links(subjects).map(text),
            wide: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }
        })
      const flatStr = s => s.replace(/[  ]/g, ' ')
      const groupLabel = new Map(groups.map(g => [g.id, g.label]))
      const s0 = await navState()
      if (s0.label !== 'Aller à un domaine ou à un sujet') navIssues.push(`nom de la barre « ${s0.label} »`)
      if (s0.domainLabels.join('|') !== s0.pageDomains.map(id => groupLabel.get(id)).join('|')) navIssues.push(`domaines « ${s0.domainLabels.join(', ')} » au lieu de ceux de la page`)
      if (s0.pageDomains.join() !== groups.map(g => g.id).filter(id => s0.pageDomains.includes(id)).join()) navIssues.push('domaines hors de l’ordre des familles')
      if (s0.reading) navIssues.push('une lecture dans la barre')
      // Au milieu des lignes : le domaine du milieu de la page sous la ligne du focus
      const mid = Math.floor(s0.pageDomains.length / 2)
      await np.evaluate(i => {
        const g = document.querySelectorAll('.profile-chart .fam-group')[i]
        const row = g.querySelectorAll('.row-item')[Math.min(1, g.querySelectorAll('.row-item').length - 1)]
        window.scrollTo(0, row.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 6)
      }, mid)
      await np.waitForTimeout(400)
      const s1 = await navState()
      const stack = s1.heights.bottom
      said.push(`hauteur collée à 375 × 812 : en-tête ${s1.heights.header} + barre ${s1.heights.nav} + rappel ${s1.heights.mini} = ${stack} px (${Math.round((100 * stack) / 812)} %)`)
      if (s1.sticky !== 'sticky' || s1.heights.navTop === null || Math.abs(s1.heights.navTop - (s1.heights.header + 5)) > 2) navIssues.push(`barre pas collée sous l’en-tête (${s1.sticky}, ${s1.heights.navTop})`)
      if (!s1.heights.mini) navIssues.push('rappel des blocs absent sous la barre')
      if (stack > 0.25 * 812) navIssues.push(`ce qui colle prend ${stack} px, plus du quart de l’écran`)
      if (s1.curD !== s1.want || s1.curS !== s1.wantSubject) navIssues.push(`en cours ${s1.curD}/${s1.curS}, sous la ligne ${s1.want}/${s1.wantSubject}`)
      if (!s1.seenD || !s1.seenS) navIssues.push(`en cours hors de la vue de sa rangée (domaine ${s1.seenD}, sujet ${s1.seenS})`)
      if (s1.tabbable !== 2 || s1.currents !== 2) navIssues.push(`${s1.tabbable} élément(s) au clavier, ${s1.currents} marqué(s)`)
      if (flatStr(s1.subjectsLabel) !== `Sujets du domaine « ${s1.domainLabels[s1.curD]} »`) navIssues.push(`rangée des sujets nommée « ${s1.subjectsLabel} »`)
      // Un saut qui pose la ligne du focus entre deux domaines : celui du dessus est en cours, jamais un domaine ancien
      if (s0.pageDomains.length > mid + 3) {
        await np.evaluate(i => {
          const gs = document.querySelectorAll('.profile-chart .fam-group')
          const gap = (gs[i].getBoundingClientRect().bottom + gs[i + 1].getBoundingClientRect().top) / 2
          window.scrollTo(0, gap + scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) - 2)
        }, mid + 2)
        await np.waitForTimeout(400)
        const sg = await navState()
        if (sg.want !== -1 || sg.curD !== mid + 2) navIssues.push(`entre les domaines ${mid + 2} et ${mid + 3} : en cours ${sg.curD} (sous la ligne ${sg.want})`)
      }
      /**
       * Ce qui a le focus, et s'il passe sous ce qui colle ; sub : l'intertitre du groupe de sa ligne, visible sous ce qui
       * colle, ou trop loin au-dessus d'elle pour tenir avec elle dans la vue
       */
      const focusOf = () =>
        np.evaluate(() => {
          const a = document.activeElement
          const r = a.getBoundingClientRect()
          const nav = document.querySelector('.profile-nav').getBoundingClientRect()
          const mini = document.querySelector('.axis-mini.is-on')?.getBoundingClientRect()
          const cover = Math.max(nav.bottom, mini?.bottom ?? 0)
          const sub = a.closest('.fam-part')?.querySelector('.fam-sub')?.getBoundingClientRect()
          const pad = getComputedStyle(document.documentElement)
          const room = innerHeight - parseFloat(pad.scrollPaddingTop) - parseFloat(pad.scrollPaddingBottom)
          return {
            id: a.id,
            tag: a.tagName,
            top: Math.round(r.top),
            cover: Math.round(cover),
            hidden: r.top < cover - 2 || r.bottom > innerHeight,
            sub: !sub || sub.top >= cover - 2 || r.bottom - sub.top >= room,
          }
        })
      // Un toucher sur le dernier domaine, puis sur le premier : le titre reçoit le focus, sous ce qui colle
      for (const i of [s0.pageDomains.length - 1, 0]) {
        await np.locator('.profile-nav .pn-list').first().locator('a').nth(i).tap()
        await np.waitForTimeout(500)
        const f = await focusOf()
        const st = await navState()
        const id = s0.pageDomains[i]
        const want = s0.familyLabels[i] ? `fam-${id}-h` : null
        if ((want && f.id !== want) || (!want && !/^sj-.+-b$/.test(f.id)) || f.hidden || st.curD !== i)
          navIssues.push(`toucher « ${s0.domainLabels[i]} » : focus ${f.tag}#${f.id} à ${f.top} (collé jusqu’à ${f.cover}), en cours ${st.curD}`)
        else said.push(`« ${s0.domainLabels[i]} » atteint (focus sur ${f.tag.toLowerCase()}#${f.id}, à ${f.top} px sous ${f.cover} px collés)`)
      }
      // Puis chaque sujet de chaque domaine : sa ligne reçoit le focus, sous ce qui colle, avec l'intertitre de son groupe
      // au-dessus d'elle tant qu'ils tiennent ensemble dans la vue (contre-vérification du 17 octobre 2026 : 9 sujets sur
      // 22 arrivaient sans lui, « Rien de net » ou « Sur une seule question » caché sous la barre)
      {
        let n = 0
        for (let d = 0; d < s0.pageDomains.length; d++) {
          await np.locator('.profile-nav .pn-list').first().locator('a').nth(d).tap()
          await np.waitForTimeout(250)
          const st = await navState()
          for (let k = 0; k < st.subjectLabels.length; k++) {
            await np.locator('.profile-nav .pn-subjects a').nth(k).tap()
            await np.waitForTimeout(250)
            const f = await focusOf()
            const after = await navState()
            n++
            if (!/^sj-.+-b$/.test(f.id) || f.hidden || !f.sub || after.curS !== k)
              navIssues.push(`toucher le sujet « ${st.subjectLabels[k]} » : focus ${f.tag}#${f.id} à ${f.top} (collé jusqu’à ${f.cover}), intertitre de son groupe en vue ${f.sub}, en cours ${after.curS}`)
          }
        }
        said.push(`${n} sujets atteints, chacun sous l’intertitre de son groupe`)
      }
      // Au clavier, la barre collée au milieu des lignes : l'élément en cours de la rangée des domaines, flèche droite, bas
      // vers les sujets, haut retour, Fin. Ni le focus ni les flèches ne font défiler la page (contre-vérification du 17
      // octobre 2026 : 365 px par touche, le scroll-padding couvrant la barre elle-même), et l'élément qui a le focus reste
      // dans la vue de sa rangée
      await np.evaluate(i => {
        const g = document.querySelectorAll('.profile-chart .fam-group')[i]
        window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 150)
      }, mid)
      await np.waitForTimeout(400)
      /** L'élément qui a le focus : sa rangée (0, 1, ou -1 hors de la barre), son rang, dans la vue de sa rangée ; la page */
      const keyState = () =>
        np.evaluate(() => {
          const a = document.activeElement
          const ul = a?.closest('.profile-nav .pn-list')
          const r = a.getBoundingClientRect()
          const u = ul?.getBoundingClientRect()
          return {
            row: ul ? (ul.classList.contains('pn-subjects') ? 1 : 0) : -1,
            i: ul ? [...ul.querySelectorAll('a')].indexOf(a) : -1,
            tab: a.tabIndex,
            seen: !!u && r.left >= u.left - 1 && r.right <= u.right + 1,
            y: Math.round(scrollY),
            sticky: getComputedStyle(document.querySelector('.profile-nav')).position === 'sticky' && document.querySelector('.profile-nav').getBoundingClientRect().top <= document.querySelector('.form-header').getBoundingClientRect().bottom + 6,
          }
        })
      const k = [await keyState()]
      await np.locator('.profile-nav .pn-list').first().locator('a[tabindex="0"]').focus()
      k.push(await keyState())
      for (const key of ['ArrowRight', 'ArrowDown', 'ArrowUp', 'End']) {
        await np.keyboard.press(key)
        k.push(await keyState())
      }
      const [k_, k0, k1, k2, k3, k4] = k
      if (!k_.sticky || k1.i !== k0.i + 1 || k2.row !== 1 || k2.tab !== 0 || k3.row !== 0 || k3.tab !== 0 || k4.i !== s0.pageDomains.length - 1 || k.some(x => x.y !== k_.y) || k.slice(1).some(x => !x.seen))
        navIssues.push(`clavier dans la barre collée (${k_.sticky}) : ${k.map(x => `${x.row}/${x.i} y ${x.y}${x.seen ? '' : ' hors de vue'}`).join(' → ')}`)
      else said.push(`clavier : focus et flèches sans défilement de la page (y ${k_.y}), l’élément en vue dans sa rangée`)
      // La tabulation suit le focus : après Début puis flèche droite, Maj+Tab sort de la rangée des domaines, et Tab
      // depuis la rangée des domaines va à celle des sujets, jamais à un autre domaine
      await np.keyboard.press('Home')
      await np.keyboard.press('ArrowRight')
      await np.keyboard.press('Tab')
      const t1 = await keyState()
      await np.keyboard.press('ArrowRight')
      await np.keyboard.press('Shift+Tab')
      const t2 = await keyState()
      await np.keyboard.press('Shift+Tab')
      const t3 = await keyState()
      if (t1.row !== 1 || t2.row !== 0 || t3.row !== -1) navIssues.push(`tabulation : Tab ${t1.row}/${t1.i}, Maj+Tab ${t2.row}/${t2.i}, encore ${t3.row}`)
      // Entrer dans la barre par Maj+Tab depuis la première ligne de la page (barre collée) : la page ne bouge pas
      await np.locator('.profile-chart .row').first().focus()
      await np.waitForTimeout(300)
      const e1 = await keyState()
      await np.keyboard.press('Shift+Tab')
      await np.waitForTimeout(200)
      const e2 = await keyState()
      if (!e1.sticky || e2.row < 0 || e2.y !== e1.y || !e2.seen) navIssues.push(`Maj+Tab de la première ligne vers la barre (collée ${e1.sticky}) : y ${e1.y} → ${e2.y}, rangée ${e2.row}, en vue ${e2.seen}`)
      // Le focus dans la rangée des sujets, la page défile au-delà de plusieurs domaines : il reste dans la barre, en vue
      await np.evaluate(() => document.querySelector('.profile-nav .pn-subjects a[tabindex="0"]').focus())
      const g0 = (await navState()).curD
      for (let i = 0; i < 6; i++) {
        await np.evaluate(() => scrollBy(0, 400))
        await np.waitForTimeout(120)
      }
      await np.waitForTimeout(400)
      const g1 = await keyState()
      const g1d = (await navState()).curD
      if (g1d === g0 || g1.row < 0 || !g1.seen) navIssues.push(`focus dans la barre, la page défile (domaine ${g0} → ${g1d}) : focus ${g1.row < 0 ? 'perdu' : `rangée ${g1.row}`}, en vue ${g1.seen}`)
      else said.push(`focus gardé dans la barre quand la page défile (domaine ${g0} → ${g1d})`)
      // Mais seulement quand le domaine change : la page défile dans un même domaine, la barre relit ce que l'on lit, puis
      // le focus quitte la barre ; il n'y revient pas de lui-même
      {
        const toRow = i =>
          np.evaluate(i => {
            const g = [...document.querySelectorAll('.profile-chart .fam-group')].find(x => x.querySelectorAll('.row-item').length > 1)
            const r = g.querySelectorAll('.row-item')[i]
            window.scrollTo(0, r.getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 6)
          }, i)
        await toRow(0)
        await np.waitForTimeout(300)
        await np.evaluate(() => document.querySelector('.profile-nav .pn-subjects a[tabindex="0"]').focus())
        await toRow(1)
        await np.waitForTimeout(300)
        // Une hauteur collante qui change refait la ligne suivie : la barre relit ce que l'on lit, sans rien changer
        await np.evaluate(() => document.documentElement.style.setProperty('--e2e-relire', '1'))
        await np.waitForTimeout(300)
        await np.evaluate(() => document.activeElement.blur())
        await np.waitForTimeout(400)
        const back = await np.evaluate(() => !!document.activeElement?.closest('.profile-nav'))
        if (back) navIssues.push('le focus, sorti de la barre, y revient de lui-même')
      }
      // Contraste forcé : l'élément en cours garde son trait
      await np.emulateMedia({ forcedColors: 'active' })
      const forced = await np.evaluate(() =>
        [...document.querySelectorAll('.profile-nav a')].map(a => ({ on: a.hasAttribute('aria-current'), w: parseFloat(getComputedStyle(a).borderBottomWidth), style: getComputedStyle(a).borderBottomStyle })),
      )
      await np.emulateMedia({ forcedColors: 'none' })
      if (!forced.every(x => (x.on ? x.w >= 2 && x.style === 'solid' : x.w === 0))) navIssues.push(`contraste forcé : ${JSON.stringify(forced.filter(x => x.on))}`)
      if (s1.wide > 0) navIssues.push(`${s1.wide} px de trop en largeur`)
      // « Le détail » ouvert : l'en-tête de ses colonnes s'ajoute au scroll-padding, la barre suit la nouvelle ligne du focus
      await np.locator('.profile-all > summary').click()
      await np.locator('table.echiquier > thead').waitFor({ timeout: 8000 }).catch(() => navIssues.push('détail : pas de tableau'))
      await np.waitForTimeout(300)
      for (const i of [1, 3]) {
        await np.evaluate(i => {
          const rows = document.querySelectorAll('.profile-chart .row-item')
          const line = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 2
          window.scrollTo(0, rows[i].getBoundingClientRect().top + scrollY - line + 2)
        }, i)
        await np.waitForTimeout(300)
        const d = await navState()
        if (d.curD !== d.want || d.curS !== d.wantSubject) navIssues.push(`détail ouvert, ligne ${i} : en cours ${d.curD}/${d.curS}, sous la ligne ${d.want}/${d.wantSubject}`)
      }
      await nctx.close()
      // La barre colle si l'en-tête, elle, ce qui colle sous elle (l'axe collant en grand écran, le rappel des blocs au
      // téléphone) et la barre du bas tiennent dans la moitié de l'écran, sinon elle suit la page : texte à 200 %, petits
      // écrans (contre-vérification du 17 octobre 2026 : 62 % de l'écran collé à 1 024 × 600, la barre restant collée).
      // stick : elle doit coller. « Pleine » et « Atténuée » hors de l'axe collant, à l'ordinateur (décision du
      // propriétaire du 17 octobre 2026), elle colle de nouveau à 1 024 × 768 et dans la fenêtre d'un navigateur d'un
      // portable 1 366 × 768 (657 px de haut), comme avant les couleurs ; l'axe collant n'y porte aucune paire
      for (const [width, zoom, height = 812, touch = true, stick = false] of [
        [375, 200],
        [320, 200],
        [320, 100, 568],
        [1024, 100, 600, false],
        [1024, 100, 768, false, true],
        [1366, 100, 657, false, true],
      ]) {
        const zctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', hasTouch: touch, isMobile: touch })
        await zctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), readOk ? readStorage : state)
        await zctx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
        const zp = await zctx.newPage()
        await zp.goto(U('/profil'))
        await zp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => navIssues.push(`${width} px à ${zoom} % : pas de lecture`))
        // La barre se mesure à la première image (ResizeObserver de useStickyFilters)
        await zp.waitForTimeout(300)
        const z = await zp.evaluate(() => {
          const nav = document.querySelector('.profile-nav')
          // Ce que compte useStickyFilters : l'en-tête, la barre, ce qui colle sous elle, la barre du bas
          const axis = document.querySelector('.profile-chart .axis')
          const under = getComputedStyle(axis).position === 'sticky' ? axis.offsetHeight : document.querySelector('.profile-chart .zones')?.getClientRects().length ? document.querySelector('.axis-mini').offsetHeight : 0
          const chrome = ['.form-header', '.profile-nav', '.action-bar'].reduce((t, s) => t + (document.querySelector(s)?.offsetHeight ?? 0), under)
          const inAxis = [...axis.querySelectorAll('.key-pair')].some(x => x.checkVisibility())
          return { sticky: getComputedStyle(nav).position, chrome, half: innerHeight / 2, wide: document.documentElement.scrollWidth - document.documentElement.clientWidth, axisStuck: getComputedStyle(axis).position === 'sticky', inAxis }
        })
        const where = `${width} × ${height}${zoom !== 100 ? ` à ${zoom} %` : ''}`
        if ((z.chrome > z.half) !== (z.sticky === 'static') || z.wide > 0) navIssues.push(`${where} : barre ${z.sticky}, ${z.chrome} px collés pour ${z.half} px, ${z.wide} px de trop`)
        else if (stick && (z.sticky === 'static' || (z.axisStuck && z.inAxis))) navIssues.push(`${where} : barre ${z.sticky}, ${z.chrome} px pour ${z.half} px, pleine et atténuée ${z.inAxis ? 'dans' : 'hors de'} l’axe collant`)
        else said.push(`${where} : barre ${z.sticky === 'static' ? 'dans la page' : 'collée'} (${z.chrome} px pour ${Math.round(z.half)} px${stick ? ', pleine et atténuée hors de l’axe collant' : ''})`)
        // À la souris, la rangée des domaines qui déborde garde une barre de défilement fine (scrollbar-width: thin, ou
        // dessinée par ::-webkit-scrollbar, scrollbar-width: auto)
        if (!touch) {
          const o = await zp.evaluate(() => {
            const d = document.querySelector('.profile-nav .pn-list')
            return { over: d.scrollWidth - d.clientWidth, bar: getComputedStyle(d).scrollbarWidth }
          })
          if (o.over > 1 && o.bar === 'none') navIssues.push(`${where} : ${o.over} px de domaines hors de la rangée, sans barre de défilement`)
        }
        await zctx.close()
      }
      // En grand écran : la rangée des domaines entière, sans défilement ; pas de rangée des sujets
      const wctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
      await wctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), readOk ? readStorage : state)
      const wp = await wctx.newPage()
      await wp.goto(U('/profil'))
      await wp.locator('[role="status"]', { hasText: 'Lecture prête.' }).waitFor({ timeout: 8000 }).catch(() => navIssues.push('1 280 px : pas de lecture'))
      const w = await wp.evaluate(() => {
        const [d, s] = document.querySelectorAll('.profile-nav .pn-list')
        const nav = document.querySelector('.profile-nav').getBoundingClientRect()
        return { overflow: d.scrollWidth - d.clientWidth, subjects: s?.checkVisibility() ?? false, height: Math.round(nav.height) }
      })
      if (w.overflow > 1 || w.subjects) navIssues.push(`1 280 px : ${w.overflow} px de domaines hors de la rangée, rangée des sujets ${w.subjects}`)
      else said.push(`1 280 px : tous les domaines sur ${w.height} px, sans rangée des sujets`)
      // Un saut depuis le haut de la page jusqu'entre deux domaines : celui du dessus est en cours
      const jump = await wp.evaluate(async () => {
        const gs = document.querySelectorAll('.profile-chart .fam-group')
        const i = Math.min(3, gs.length - 2)
        const gap = (gs[i].getBoundingClientRect().bottom + gs[i + 1].getBoundingClientRect().top) / 2
        window.scrollTo(0, gap + scrollY - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) - 2)
        await new Promise(r => setTimeout(r, 400))
        return { i, cur: [...document.querySelectorAll('.profile-nav .pn-list:first-child a')].findIndex(a => a.hasAttribute('aria-current')) }
      })
      if (jump.cur !== jump.i) navIssues.push(`1 280 px, saut du haut de la page entre les domaines ${jump.i} et ${jump.i + 1} : en cours ${jump.cur}`)
      await wctx.close()
      check(navIssues.length === 0, `mon profil politique, la barre des domaines : ${said.join(' ; ')}${navIssues.length ? ` : ${navIssues.join(' ; ')}` : ''}`)
    }

    // Ses entrées et sa page d'attente, au texte agrandi (320 px à 200 %, 390 px à 125 %) : l'accueil vierge et prêt, le
    // dépouillement, la page d'attente d'une feuille en cours ; rien en largeur, aucun mot coupé hors des titres (qui
    // peuvent se couper, The Long Word Rule), aucune case rognée
    const going = JSON.parse(state[STORAGE])
    for (const q of quickQs.slice(0, Math.ceil(QUICK / 2))) delete going.answers[q.id]
    const goingState = { ...state, [STORAGE]: JSON.stringify({ ...going, essentialDoneAt: null }) }
    const entryIssues = []
    const TEXTS = '.pb-text, .pb-axis, .hp-text, .hp-when, .hp-go, .hp-tag, .hp-word, .trend-next, .profile-wait .trend-text, .profile-wait .trend-where, .profile-example .ex-note, .ex-name, .ex-head, .ex-grid .tile, .profile-example .key-pair li, .ex-key, .wait-deepen'
    for (const [width, zoom] of [[320, 200], [390, 125]])
      for (const [label, storage, path, sel] of [
        ['accueil vierge', {}, '/', '.home-profile'],
        ['accueil prêt', state, '/', '.home-profile'],
        ['dépouillement', state, '/resultats', '.results-profile'],
        ['page d’attente', goingState, '/profil', '.profile-wait'],
      ]) {
        const ectx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce', hasTouch: true, isMobile: true })
        await ectx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), storage)
        await ectx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
        const ep = await ectx.newPage()
        await ep.goto(U(path))
        const shown = await ep.locator(sel).first().waitFor({ timeout: 8000 }).then(() => true, () => false)
        await ep.waitForTimeout(100)
        const wide = await ep.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        const cut = await cutWords(ep, TEXTS)
        const clipped = await ep.evaluate(() => [...document.querySelectorAll('.ex-grid .tile, .hp-tiles .tile')].filter(t => t.checkVisibility() && (t.scrollWidth > t.clientWidth + 1 || t.scrollHeight > t.clientHeight + 1)).map(t => t.textContent.trim()))
        if (!shown) entryIssues.push(`${label}, ${width} px à ${zoom} % : ${sel} absent`)
        if (wide > 0) entryIssues.push(`${label}, ${width} px à ${zoom} % : ${wide} px de trop`)
        if (cut.length) entryIssues.push(`${label}, ${width} px à ${zoom} % : mot coupé ${cut.slice(0, 4).join(', ')}`)
        if (clipped.length) entryIssues.push(`${label}, ${width} px à ${zoom} % : case rognée ${clipped.slice(0, 3).join(', ')}`)
        await ectx.close()
      }
    check(entryIssues.length === 0, `mon profil politique, entrées et page d’attente au texte agrandi (320 px à 200 %, 390 px à 125 %) : rien en largeur, aucun mot coupé ni case rognée${entryIssues.length ? ` : ${entryIssues.join(' ; ')}` : ''}`)

    // Sa rubrique de la Méthode (#/methode/profil), page rechargée hors ligne depuis la copie hors ligne : son fichier à
    // part (MethodSection-*.js) arrive sous le titre, avec son schéma, ses chiffres et sa fin (« Vie privée »), sans la
    // page ni son calcul (ni Profile-*.js, ni sa feuille de style)
    {
      const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
      const mp = await mctx.newPage()
      await mp.goto(U('/methode/profil'))
      await mp.evaluate(() => navigator.serviceWorker.ready)
      await mp.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
      await mctx.setOffline(true)
      await mp.reload()
      const shown = await mp.locator('main strong', { hasText: 'Vie privée' }).first().waitFor({ timeout: 8000 }).then(() => true, () => false)
      const rub = await mp.evaluate(() => {
        const h = document.getElementById('profil')
        const parts = []
        for (let el = h?.nextElementSibling; el && el.tagName !== 'H2'; el = el.nextElementSibling) parts.push(el)
        const files = performance.getEntriesByType('resource').map(e => new URL(e.name).pathname.split('/').pop())
        return {
          diagram: parts.some(el => el.matches('svg.diagram') && el.querySelector('title')?.textContent === 'Comment se lit un bloc de la grille'),
          heads: parts.flatMap(el => [...el.querySelectorAll(':scope > strong')].map(s => s.textContent.trim())),
          // La mesure de neutralité de la croix (D5, lot 2), publiée en deux paragraphes : la croix, puis « pourrait franchir »
          cross: parts.filter(el => {
            const t = (el.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ')
            return (t.includes('quand ces lignes rouges ne visent personne') && t.includes('qui n’est pas établi')) || (t.startsWith('« Pourrait franchir » fait de') && t.includes('Ces écarts ne sont pas établis non plus.'))
          }).length,
          // La mesure de « Ce qui pèse le plus » (D5, lot 3), un paragraphe après sa règle
          weigh: parts.filter(el => {
            const t = (el.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ')
            return t.startsWith('Pour éprouver cette fiche') && t.includes('ne sont établis ni avec ni sans le candidat')
          }).length,
          failed: (document.querySelector('main')?.textContent ?? '').includes('n’a pas pu être chargée'),
          section: files.filter(f => /^MethodSection-[\w-]+\.js$/.test(f)).length,
          page: files.filter(f => /^Profile-[\w-]+\.(?:js|css)$/.test(f)),
        }
      })
      const HEADS = ['Qui compte.', 'Le calcul.', 'La comparaison.', 'Compter, sinon calculer.', 'Les couleurs.', 'Quand on ne lit pas.', 'Pourquoi ni moyenne ni point.', 'Ce que valent ces lectures.', 'Avant et après.', 'Lignes rouges et priorités.', 'Ce qui pèse le plus.', 'Limites.', 'Vie privée.']
      check(
        shown && rub.diagram && HEADS.every(t => rub.heads.includes(t)) && rub.cross === 2 && rub.weigh === 1 && !rub.failed && rub.section === 1 && rub.page.length === 0,
        `mon profil politique, rubrique de la Méthode hors ligne (page rechargée) : schéma ${rub.diagram}, ${rub.heads.length} intertitres sur ${HEADS.length}, mesure de la croix en ${rub.cross} paragraphe(s) sur 2, de « Ce qui pèse le plus » en ${rub.weigh} sur 1, son fichier à part chargé (${rub.section}), sans la page${rub.page.length ? ` (chargée : ${rub.page.join(', ')})` : ''}${rub.failed ? ', « n’a pas pu être chargée »' : ''}`,
      )
      await mctx.close()
    }
  } else console.log('– mon profil politique : pas d’axe pour cette élection, contrôles sautés')

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
  // L'affiche des plus éloignés : une autre image, un autre texte de remplacement, un autre nom de fichier
  const topAlt = await page.locator('.share-preview img').getAttribute('alt')
  const flopButton = page.getByRole('button', { name: 'Les plus éloignés' })
  if (await flopButton.count()) {
    await flopButton.click()
    await page.waitForFunction(() => /les classés les plus éloignés de mes idées/.test(document.querySelector('.share-preview img')?.getAttribute('alt') ?? ''), null, { timeout: 5000 }).catch(() => null)
    const flopAlt = (await page.locator('.share-preview img').getAttribute('alt')) ?? ''
    const pressed = await flopButton.getAttribute('aria-pressed')
    check(
      pressed === 'true' && flopAlt !== topAlt && /les classés les plus éloignés de mes idées/.test(flopAlt) && /\d+\. /.test(flopAlt),
      `affiche des plus éloignés : bouton enfoncé (${pressed}), texte de remplacement propre et numéroté`,
    )
    await page.getByRole('button', { name: 'Les plus proches' }).click()
  }
  // L'image « Accords et désaccords », chargée à la demande (ici sans réseau, depuis la copie hors ligne) : chaque portée
  // fabrique une image, avec un texte de remplacement propre (numéros, deux barres comptées, notes de pied) et un nom de
  // fichier à elle ; « Tous » peut être plus haute que l'affiche, jamais plus de 1080 × 1920
  const agreeButton = page.getByRole('button', { name: 'Accords et désaccords' })
  if (await agreeButton.count()) {
    const shareImg = page.locator('.share-preview img')
    const newImage = (before, re) =>
      page
        .waitForFunction(
          ([before, source]) => {
            const img = document.querySelector('.share-preview img')
            return !!img && img.getAttribute('src') !== before && new RegExp(source).test(img.getAttribute('alt') ?? '')
          },
          [before, re.source],
          { timeout: 8000 },
        )
        .then(
          () => true,
          () => false,
        )
    const agreeHead = /^Image « Accords et désaccords », /
    let before = await shareImg.getAttribute('src')
    await agreeButton.click()
    const agreeShown = await newImage(before, agreeHead)
    const agreePressed = await agreeButton.getAttribute('aria-pressed')
    check(agreeShown && agreePressed === 'true', `image « Accords et désaccords » fabriquée hors ligne, chargée à la demande (bouton enfoncé : ${agreePressed})`)
    const scopes = [
      ['Les 5 plus proches', /^Image « Accords et désaccords », les 5 classés les plus proches, /, '-accords-plus-proches.jpg'],
      ['Les 5 plus éloignés', /^Image « Accords et désaccords », les 5 classés les plus éloignés, /, '-accords-plus-eloignes.jpg'],
      ['Tous', /^Image « Accords et désaccords », (les \d+ candidats|le candidat)/, '-accords-tous.jpg'],
    ]
    const hasScopes = (await page.getByRole('button', { name: 'Tous', exact: true }).count()) > 0
    for (const [label, re, suffix] of hasScopes ? scopes : scopes.slice(2)) {
      const button = page.getByRole('button', { name: label, exact: true })
      // La première portée est celle par défaut : l'image est déjà là
      if (label !== scopes[0][0] && hasScopes) {
        before = await shareImg.getAttribute('src')
        await button.click()
      }
      const made = await newImage(label === scopes[0][0] || !hasScopes ? null : before, re)
      const alt = ((await shareImg.getAttribute('alt')) ?? '').replace(/\u00a0/g, ' ')
      const [w, h] = [Number(await shareImg.getAttribute('width')), Number(await shareImg.getAttribute('height'))]
      const pressed = hasScopes ? await button.getAttribute('aria-pressed') : 'true'
      const rows = alt.match(/\d+\. [^:]+ (\d+|–) % (\(croix\) )?: ses approches principales, \d+ accords? et \d+ désaccords? ; ses autres positions, \d+ accords? et \d+ désaccords?\./g) ?? []
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        page.getByRole('button', { name: /^Télécharger/ }).first().click(),
      ])
      const name = download?.suggestedFilename() ?? ''
      check(
        made && pressed === 'true' && re.test(alt) && (hasScopes && label !== 'Tous' ? rows.length === 5 : rows.length > (hasScopes ? 5 : 0)) && /Ordre et numéros par affinité seule/.test(alt) && w === 1080 && h >= 1350 && h <= 1920 && name.endsWith(suffix),
        `accords et désaccords, « ${label} » : image ${w} × ${h}, ${rows.length} lignes au texte de remplacement, fichier ${name}`,
      )
    }
    before = await shareImg.getAttribute('src')
    await page.getByRole('button', { name: 'Mon dépouillement' }).click()
    check(await newImage(before, /^Affiche « Mon dépouillement »/), 'retour à l’affiche « Mon dépouillement »')
  }
  await page.goto(U('/resultats'))
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Télécharger mon double (JSON)' }).click(),
  ])
  const file = JSON.parse(readFileSync(await download.path(), 'utf8'))
  const rated = file.readable.filter(r => r.avis.length >= 2 && !r.passee).length // la question 3 en a un de plus (test clavier)
  check(file.format === 3 && file.readable.length === QUICK && rated === QUICK, `le double JSON contient les ${QUICK} réponses, chacune avec ses deux avis (${rated})`)
  if (EXCLUDED.size) {
    const offFile = file.nonClasses?.candidats ?? []
    const offNames = new Set(pack.candidates.filter(c => EXCLUDED.has(c.id)).map(c => c.name))
    check(
      offFile.length === EXCLUDED.size &&
        offFile.every(x => !('rang' in x) && (x.questionsConnues > 0 ? Number.isInteger(x.affiniteIndicative) : x.affiniteIndicative === null)) &&
        file.results.every(x => !offNames.has(x.candidat)),
      `le double JSON : ${offFile.length} non classés à part, avec leur score indicatif et sans rang, aucun parmi les résultats`,
    )
  }
  // Le dépouillement en PDF, fabriqué sur l'appareil, toujours hors ligne : le morceau du rapport est dans la copie
  // hors ligne. Relu par tools/pdf-text.mjs (structure, xref, texte)
  const [pdf] = await Promise.all([
    page.waitForEvent('download', { timeout: 5000 }),
    page.getByRole('button', { name: 'Télécharger mon dépouillement (PDF)' }).click(),
  ])
  const pdfBytes = readFileSync(await pdf.path())
  let doc = null
  try {
    doc = readPdf(pdfBytes)
  } catch (err) {
    console.log(`  (PDF illisible : ${err.message})`)
  }
  const pdfFirst = (doc?.pages[0]?.text ?? '').replace(/\s+/g, ' ')
  await page.waitForFunction(() => /PDF fabriqué/.test(document.querySelector('.report-status')?.textContent ?? ''), null, { timeout: 2000 }).catch(() => null)
  const pdfStatus = ((await page.locator('.report-status').textContent().catch(() => '')) ?? '').trim()
  const pdfIssues = [
    /^isoloir-[a-z0-9-]+-depouillement-\d{4}-\d\d-\d\d\.pdf$/.test(pdf.suggestedFilename()) ? '' : `nom ${pdf.suggestedFilename()}`,
    pdfBytes.subarray(0, 5).toString('latin1') === '%PDF-' ? '' : 'ne commence pas par %PDF-',
    doc?.version === '1.4' && doc.pages.length >= 2 ? '' : `version ${doc?.version}, ${doc?.pages.length ?? 0} pages`,
    pdfFirst.includes('Votre dépouillement') && pdfFirst.includes('Textes rédigés par IA') ? '' : 'page 1 sans titre ni étiquette IA',
    doc?.pages.some(p => p.text.includes('Le classement')) ? '' : 'pas de « Le classement »',
    !entry.archived || /\bArchive\b/.test(pdfFirst) ? '' : 'pas de mention « Archive » en page 1',
    pdfStatus.startsWith('PDF fabriqué sur cet appareil') ? '' : `statut « ${pdfStatus} »`,
    // Non classés : leur score indicatif suit leur titre (décision du propriétaire du 14 octobre 2026), autant que sur
    // la page, seulement à partir de EXCLUDED_MIN_KNOWN réponses connues (décision du propriétaire du 2026-10-15)
    !EXCLUDED.size ||
    (() => {
      const all = (doc?.pages ?? []).map(p => p.text).join('\n')
      const at = all.search(/ne sont pas classés/)
      const block = at < 0 ? '' : all.slice(at, ['Vos lignes rouges franchies', 'Accords et désaccords', 'À garder en tête'].map(n => all.indexOf(n, at)).filter(i => i > 0).reduce((a, b) => Math.min(a, b), all.length))
      return /pas de rang/.test(block) && (block.match(/Score indicatif\s*:\s*\d+\s*%/g)?.length ?? 0) === offScored
    })()
      ? ''
      : `non classés : ${offScored} scores indicatifs attendus`,
  ].filter(Boolean)
  check(
    pdfIssues.length === 0,
    `le dépouillement PDF se télécharge hors ligne (${pdf.suggestedFilename()}, ${doc?.pages.length ?? 0} pages, ${pdfBytes.length} octets${entry.archived ? ', mention « Archive » en page 1' : ''})${pdfIssues.length ? ` : ${pdfIssues.join(' ; ')}` : ''}`,
  )

  // 6 bis. « Transférez vos réponses » (#/autre-appareil), hors ligne des deux côtés : le QR code derrière le rideau,
  // le code en texte, l'image du QR code et la copie par e-mail (sans menu de partage : image téléchargée, messagerie
  // ouverte) ; puis un second appareil, hors ligne lui aussi, importe le code collé en vrac, l'image exacte, une
  // « photo » de l'écran, et refuse une faute de frappe ou une image sans QR code. Jamais de requête hors du site ni
  // de violation de la CSP ; une seule clé « isoloir: » de chaque côté
  {
    const sent = JSON.parse((await page.evaluate(key => localStorage.getItem(key), STORAGE)) ?? '{}')
    await page.goto(U('/autre-appareil'))
    await page.locator('.transfer-send').waitFor()
    const sendTab = await page.locator('.transfer-switch button').first().getAttribute('aria-pressed')
    const masked = await page.locator('.code-text.is-masked').count()
    await page.getByRole('button', { name: 'Montrer le QR code' }).click()
    await page.locator('svg.qr').waitFor({ timeout: 2000 })
    const code = (await page.locator('.code-text .code-group').allTextContents()).join(' ')
    check(sendTab === 'true' && masked === 1 && /^[0-9A-Z]{4}( [0-9A-Z]{1,4})+$/.test(code), `transfert : l’onglet « Transférer » ouvert, le code masqué avant le rideau, puis montré (${code.length} caractères)`)

    const [png] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page.getByRole('button', { name: 'Télécharger le QR code (image)' }).click(),
    ])
    const pngPath = join(transferDir, 'code.png')
    await png.saveAs(pngPath)
    const pngBytes = readFileSync(pngPath)
    check(
      /^isoloir-[a-z0-9-]+-reprise-\d{4}-\d\d-\d\d\.png$/.test(png.suggestedFilename()) && pngBytes.subarray(1, 4).toString('latin1') === 'PNG',
      `transfert : l’image du QR code se télécharge hors ligne (${png.suggestedFilename()}, ${pngBytes.length} octets)`,
    )
    const [mailPng] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }),
      page.getByRole('button', { name: 'M’envoyer une copie' }).click(),
    ])
    await page.waitForTimeout(300)
    const mailStatus = flat(await page.locator('.transfer-status').textContent())
    check(/^Image téléchargée/.test(mailStatus) && /\.png$/.test(mailPng.suggestedFilename()), `transfert : copie par e-mail sans menu de partage, l’image à joindre est téléchargée (« ${mailStatus.slice(0, 60)}… »)`)
    const sentKeys = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir')))
    check(sentKeys.length === 1 && sentKeys[0] === STORAGE, `transfert : aucune nouvelle clé de stockage côté envoi (${sentKeys.join(', ')})`)

    /** Un second appareil : chargé en ligne (sa copie hors ligne s'installe), puis coupé du réseau */
    const device = async () => {
      const c = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, reducedMotion: 'reduce' })
      await c.addInitScript(() => {
        window.__csp = []
        addEventListener('securitypolicyviolation', e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
      })
      const p = await c.newPage()
      const out = []
      p.on('request', r => {
        const u = r.url()
        if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) out.push(u)
      })
      await p.goto(HOME)
      await p.evaluate(() => navigator.serviceWorker.ready)
      await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
      await c.setOffline(true)
      return { c, p, out }
    }
    const received = p => p.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE)
    // Comparées sans tenir compte de l'ordre : le code range les réponses par question et les avis par lettre, quand
    // l'appareil d'origine les garde dans l'ordre où ils ont été donnés
    const canon = v =>
      JSON.stringify(v, (_, x) =>
        Array.isArray(x) ? [...x].sort() : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).sort(([m], [n]) => m.localeCompare(n))) : x,
      )
    const same = got =>
      canon(got.answers) === canon(sent.answers) &&
      canon(got.weights) === canon(sent.weights) &&
      canon(got.deepTopics) === canon(sent.deepTopics) &&
      got.seed === sent.seed &&
      (got.essentialDoneAt ?? '').slice(0, 19) === (sent.essentialDoneAt ?? '').slice(0, 19)

    // Le code collé en vrac : minuscules, tirets, retours à la ligne, O pour 0
    const b = await device()
    await b.p.goto(U('/autre-appareil/importer'))
    await b.p.locator('#transfer-code').waitFor()
    const importTab = await b.p.locator('.transfer-switch button').nth(1).getAttribute('aria-pressed')
    const typo = code.replace(/[0-9A-Z]/, ch => (ch === '7' ? '8' : '7'))
    await b.p.locator('#transfer-code').fill(typo)
    await b.p.getByRole('button', { name: 'Lire ce code' }).click()
    const typoError = flat(await b.p.locator('#transfer-error').textContent({ timeout: 2000 }).catch(() => ''))
    const messy = code.toLowerCase().replace(/0/g, 'o').replace(/ /g, (_, i) => (i % 3 ? ' - ' : '\n'))
    await b.p.locator('#transfer-code').fill(messy)
    await b.p.getByRole('button', { name: 'Lire ce code' }).click()
    const found = await heading(b.p, 'Réponses trouvées')
    await b.p.getByRole('button', { name: 'Importer ces réponses' }).click()
    await b.p.waitForFunction(h => location.hash === h, L('/resultats'), { timeout: 3000 }).catch(() => null)
    await b.p.waitForFunction(key => !!localStorage.getItem(key), STORAGE, { timeout: 3000 }).catch(() => null)
    const gotB = await received(b.p)
    const keysB = await b.p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir')))
    check(importTab === 'true' && /vérifiez chaque groupe/.test(typoError), `transfert : #/autre-appareil/importer ouvre « Importer », une faute de frappe est refusée (« ${typoError.slice(0, 50)}… »)`)
    check(found && hashOf(b.p) === L('/resultats') && same(gotB) && keysB.length === 1, `transfert : le code collé en vrac, hors ligne, donne les mêmes réponses, priorités, thèmes et graine (${Object.keys(gotB.answers ?? {}).length} réponses, ${keysB.length} clé)`)
    const cspB = await b.p.evaluate(() => window.__csp)
    check(b.out.length === 0 && cspB.length === 0, `transfert : second appareil sans requête hors du site ni violation de la CSP (${[...b.out, ...cspB].slice(0, 3).join(', ') || 'aucune'})`)
    await b.c.close()

    // L'image : une « photo » de l'écran (tournée, réduite, floue, en JPEG) puis une image sans QR code, par « Choisir une
    // image » ; enfin l'image exacte, par « Reprendre depuis un fichier » de l'accueil, sur un appareil vierge
    const c = await device()
    await c.p.goto(U('/autre-appareil/importer'))
    await c.p.locator('.transfer-ways input[type=file]').waitFor({ state: 'attached' })
    const photo = await c.p.evaluate(async b64 => {
      const img = new Image()
      img.src = URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))], { type: 'image/png' }))
      await img.decode()
      const cv = document.createElement('canvas')
      cv.width = 900
      cv.height = 1200
      const ctx = cv.getContext('2d')
      ctx.fillStyle = '#6b6f75'
      ctx.fillRect(0, 0, cv.width, cv.height)
      ctx.filter = 'blur(1px)'
      ctx.translate(450, 600)
      ctx.rotate((7 * Math.PI) / 180)
      ctx.drawImage(img, -img.width * 0.35, -img.height * 0.35, img.width * 0.7, img.height * 0.7)
      const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.7))
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let s = ''
      for (const x of bytes) s += String.fromCharCode(x)
      return btoa(s)
    }, pngBytes.toString('base64'))
    await c.p.locator('.transfer-ways input[type=file]').setInputFiles({ name: 'photo.jpg', mimeType: '', buffer: Buffer.from(photo, 'base64') })
    const photoRead = await heading(c.p, 'Réponses trouvées')
    if (photoRead) await c.p.getByRole('button', { name: 'Annuler' }).click()
    const blank = await c.p.evaluate(async () => {
      const cv = document.createElement('canvas')
      cv.width = 300
      cv.height = 300
      cv.getContext('2d').fillRect(40, 40, 60, 60)
      const bytes = new Uint8Array(await (await new Promise(r => cv.toBlob(r, 'image/png'))).arrayBuffer())
      let s = ''
      for (const x of bytes) s += String.fromCharCode(x)
      return btoa(s)
    })
    await c.p.locator('.transfer-ways input[type=file]').setInputFiles({ name: 'vide.png', mimeType: 'image/png', buffer: Buffer.from(blank, 'base64') })
    await c.p.waitForFunction(() => /Aucun QR code/.test(document.querySelector('.transfer-ways .transfer-note:not(:empty)')?.textContent ?? ''), null, { timeout: 5000 }).catch(() => null)
    const blankNote = flat(await c.p.locator('.transfer-ways .transfer-note').nth(1).textContent())
    check(photoRead && /^Aucun QR code/.test(blankNote), `transfert : une photo de l’écran (tournée, floue, JPEG) se lit ; une image sans QR code est refusée (« ${blankNote.slice(0, 40)}… »)`)
    await c.p.goto(U('/'))
    await c.p.locator('.home-foot input[type=file]').waitFor({ state: 'attached' })
    await c.p.locator('.home-foot input[type=file]').setInputFiles(pngPath)
    await c.p.waitForFunction(h => location.hash === h, L('/resultats'), { timeout: 8000 }).catch(() => null)
    await c.p.waitForFunction(key => !!localStorage.getItem(key), STORAGE, { timeout: 3000 }).catch(() => null)
    const gotC = await received(c.p)
    check(hashOf(c.p) === L('/resultats') && same(gotC), `transfert : l’image exacte, choisie dans « Reprendre depuis un fichier » de l’accueil, importe les mêmes réponses`)
    // Le double (JSON) passe toujours par le même bouton : la feuille commencée, il demande s'il faut la remplacer
    await c.p.goto(U('/'))
    await c.p.locator('.home-foot input[type=file]').setInputFiles(await download.path())
    const asked = await c.p.locator('.home-foot .notice[role=alert]').waitFor({ timeout: 3000 }).then(() => true).catch(() => false)
    const cspC = await c.p.evaluate(() => window.__csp)
    check(asked && c.out.length === 0 && cspC.length === 0, `transfert : le double JSON s’importe toujours depuis l’accueil (demande de remplacer ${asked}) ; aucune requête hors du site ni violation de la CSP`)
    await c.c.close()

    // La caméra, simulée par Chromium (une vidéo du QR code) : rien n'est demandé avant le geste ; le code est lu en
    // moins de 8 s, avec le détecteur du navigateur s'il en a un, puis avec le décodeur JavaScript ; la caméra s'arrête
    const modules = encodeQR(code.replace(/ /g, ''), 'raw', { ecc: 'medium', encoding: 'alphanumeric', border: 4 })
    const W = 1280
    const H = 720
    const px = Math.floor(600 / modules.length)
    const side = modules.length * px
    const y = Buffer.alloc(W * H, 235)
    for (let r = 0; r < side; r++) {
      for (let col = 0; col < side; col++) {
        if (modules[Math.floor(r / px)][Math.floor(col / px)]) y[(r + Math.floor((H - side) / 2)) * W + col + Math.floor((W - side) / 2)] = 16
      }
    }
    const y4m = join(transferDir, 'qr.y4m')
    writeFileSync(y4m, Buffer.concat([Buffer.from(`YUV4MPEG2 W${W} H${H} F15:1 Ip A1:1 C420jpeg\nFRAME\n`), y, Buffer.alloc((W / 2) * (H / 2) * 2, 128)]))
    const cam = await chromium.launch({
      args: ['--mute-audio', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${y4m}`],
    })
    try {
      for (const forceJs of [false, true]) {
        const cc = await cam.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', permissions: ['camera'] })
        await cc.addInitScript(js => {
          window.__gum = 0
          const md = navigator.mediaDevices
          if (md?.getUserMedia) {
            const real = md.getUserMedia.bind(md)
            md.getUserMedia = c => {
              window.__gum++
              return real(c).then(s => ((window.__stream = s), s))
            }
          }
          if (js) delete window.BarcodeDetector
        }, forceJs)
        const cp = await cc.newPage()
        const camOut = []
        cp.on('request', r => {
          const u = r.url()
          if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) camOut.push(u)
        })
        await cp.goto(U('/autre-appareil/importer'))
        await cp.locator('#transfer-code').waitFor()
        const native = await cp.evaluate(async () => !!window.BarcodeDetector && (await window.BarcodeDetector.getSupportedFormats()).includes('qr_code'))
        const before = await cp.evaluate(() => window.__gum)
        const t0 = Date.now()
        await cp.getByRole('button', { name: 'Ouvrir la caméra' }).click()
        const read = await cp.getByRole('heading', { name: 'Réponses trouvées', exact: true }).waitFor({ timeout: 8000 }).then(() => true).catch(() => false)
        const ms = Date.now() - t0
        const stopped = await cp.evaluate(() => !document.querySelector('.viewfinder video')?.srcObject && (window.__stream?.getTracks() ?? []).every(t => t.readyState === 'ended'))
        check(
          before === 0 && read && stopped && camOut.length === 0,
          `transfert : la caméra (${native ? 'détecteur du navigateur' : 'décodeur JavaScript'}) lit le QR code en ${(ms / 1000).toFixed(1)} s, rien demandé avant le geste, caméra arrêtée ensuite`,
        )
        await cc.close()
      }
    } finally {
      await cam.close()
    }
    await page.goto(U('/resultats'))
  }

  // 7. Recharger la page sans réseau
  await page.reload()
  await page.waitForTimeout(400)
  check(await heading(page, 'Votre dépouillement'), 'rechargement hors ligne : la page et les réponses reviennent')
  check(await page.evaluate(() => document.fonts.check('1em "Archivo Variable"', 'œ’')), 'la police est disponible hors ligne')

  // 7 bis. Accueil : la date des réponses ; fiche candidat : familles de thèmes et « Mes réponses »
  await page.goto(U('/'))
  // L'accueil de retour (demande du 14/10/2026) : le titre, la date où le questionnaire rapide a été terminé (heure
  // aux espaces insécables, lue telle quelle), l'affiche du plus proche, les panneaux de « Et maintenant », puis le film
  // plus bas
  const back = await page.evaluate(() => {
    const t = sel => (document.querySelector(sel)?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
    const before = (a, b) => !!a && !!b && !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    return {
      title: t('main h1'),
      lede: t('.welcome-back .lede'),
      time: document.querySelector('.welcome-back .lede time')?.textContent ?? '',
      leader: t('.back-leader .leader-name'),
      lead: t('.back-leader .leader-lead'),
      panels: [...document.querySelectorAll('.welcome-back .next-panel .next-title')].map(e => e.textContent.trim()),
      filmAfter: before(document.querySelector('.welcome-back'), document.querySelector('.home-film')),
    }
  })
  check(
    back.title === 'Votre dépouillement vous attend' &&
      back.lede.startsWith(`Vous avez répondu aux ${QUICK} questions du questionnaire rapide le `) &&
      /^\d+(er)?\s\S+\s20\d\d à \d+\u00a0h\u00a0\d\d$/.test(back.time) &&
      !!back.leader &&
      back.lead === leadWant.replace(/[\u00a0\u202f]/g, ' ') &&
      back.panels[0] === 'Qui porte quoi' &&
      back.filmAfter,
    `accueil de retour : « ${back.title} », « ${back.lede} », « ${back.lead} » ${back.leader || 'personne'}, panneaux ${back.panels.join(', ')}, film plus bas ${back.filmAfter}`,
  )
  // La carte des questions à revoir : une réponse d'une autre révision de sa question la met sur l'accueil, puis en
  // tête du dépouillement ; la feuille est rendue telle quelle ensuite
  if (pack.election.revisionTracking) {
    const kept = await page.evaluate(key => localStorage.getItem(key), STORAGE)
    const st = JSON.parse(kept)
    const qid = quickQs.map(q => q.id).find(id => st.answers[id] && !st.answers[id].skipped)
    st.answers[qid] = { ...st.answers[qid], rev: 999 }
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE, JSON.stringify(st)])
    await page.reload()
    await page.locator('.welcome-back .changed').waitFor({ timeout: 5000 }).catch(() => null)
    const card = await page.evaluate(() => {
      const c = document.querySelector('.welcome-back .changed')
      const t = e => (e?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
      return c
        ? { count: t(c.querySelector('.changed-count')), title: t(c.querySelector('h2')), items: c.querySelectorAll('.changed-list > li').length, href: c.querySelector('.changed-cta')?.getAttribute('href') }
        : null
    })
    await page.goto(U('/resultats'))
    await heading(page, 'Votre dépouillement')
    const onResults = await page.locator('.results-intro .changed').count()
    // Feuille de révision : une approche apparue depuis la réponse (Approach.since) vient en tête, sous le tampon
    // « Nouvelle », et l'avis le dit
    const withNew = pack.bank.questions.find(q => q.approaches.some(x => x.since))
    let fresh = null
    if (withNew) {
      const newIds = withNew.approaches.filter(x => x.since).map(x => x.id)
      const older = Math.min(...withNew.approaches.filter(x => x.since).map(x => x.since)) - 1
      const st2 = JSON.parse(kept)
      st2.answers[withNew.id] = { ratings: {}, redLines: [], skipped: true, rev: older }
      // Un contexte à part, sa feuille posée avant le chargement : la page en cours garde la sienne en mémoire et
      // l'enregistre encore (classement vu), elle écraserait celle-ci
      const rctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
      await rctx.addInitScript(([k, v]) => localStorage.setItem(k, v), [STORAGE, JSON.stringify(st2)])
      const rp = await rctx.newPage()
      await rp.goto(U('/revision'))
      await rp.locator('.approaches > li').first().waitFor({ timeout: 8000 }).catch(() => null)
      fresh = await rp.evaluate(n => {
        const rows = [...document.querySelectorAll('.approaches > li')]
        const t = e => (e?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
        return {
          head: rows.slice(0, n).every(r => r.classList.contains('is-fresh') && t(r.querySelector('.approach-stamp')) === 'Nouvelle'),
          others: rows.slice(n).every(r => !r.classList.contains('is-fresh') && !r.querySelector('.approach-stamp')),
          sr: t(rows[0]?.querySelector('.approach-text .sr-only')),
          notice: t(document.querySelector('.revision-notice')),
        }
      }, newIds.length)
      await rctx.close()
    }
    // La feuille d'avant, relue au rechargement (l'application garde la sienne en mémoire jusque-là). Le dépouillement
    // vient d'enregistrer son classement vu, un peu après l'affichage : on le laisse finir avant de rendre la feuille,
    // et on vérifie après le rechargement que c'est bien elle qui est relue
    let restored = false
    for (let k = 0; k < 3 && !restored; k++) {
      await page.waitForTimeout(400)
      await page.evaluate(([key, v]) => localStorage.setItem(key, v), [STORAGE, kept])
      await page.reload()
      await page.waitForTimeout(200)
      restored = await page.evaluate(key => !/"rev":999\b/.test(localStorage.getItem(key) ?? ''), STORAGE)
    }
    await page.goto(U('/'))
    await page.locator('.welcome-back').waitFor({ timeout: 5000 }).catch(() => null)
    const gone = await page.locator('.changed').count()
    check(
      card?.count === '1' && card.title === 'Une question a changé depuis vos réponses' && card.items === 1 && card.href === L('/revision') && onResults === 1 && restored && gone === 0,
      `questions à revoir : carte sur l’accueil (${card ? `« ${card.count} », « ${card.title} », ${card.items} question, vers ${card.href}` : 'absente'}), en tête du dépouillement (${onResults}), partie une fois la feuille rendue (relue ${restored}, ${gone} carte)`,
    )
    check(
      !withNew || (!!fresh && fresh.head && fresh.others && fresh.sr.includes('nouvelle approche') && /nouvelle/.test(fresh.notice) && fresh.notice.includes('« Nouvelle »')),
      `feuille de révision : l’approche apparue depuis la réponse en tête, sous le tampon « Nouvelle » (${fresh ? `en tête ${fresh.head}, les autres sans ${fresh.others}, « ${fresh.sr} », « ${fresh.notice.slice(0, 80)}… »` : 'aucune question avec une approche nouvelle'})`,
    )
  }
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
        // Son titre (« Vos priorités ») n'est plus imprimé, comme celui des questions
        ['priorités', '/priorites', '.approaches.is-topics > li'],
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
  const pageNames = ['Les questions', 'Questions complémentaires', 'Questions à revoir', 'Résultats', 'Notice', 'Méthode', 'Mentions légales', 'Confidentialité', 'Essai vidéos', 'Les vidéos', 'Qui porte quoi', 'Partager', 'Priorités', 'Vos priorités', 'Les sujets', 'Les candidats']
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
  // 7 ter. L'appel aux questions des barres du bas, le même sur chaque page de consultation (components/QuestionsCta.tsx) :
  // appareil vierge, « Répondre aux questions » vers la question 1 ; en cours, « Reprendre mes réponses » vers la
  // première question pas encore vue ; questionnaire rapide fini, « Voir mon dépouillement ». Texte à 200 % sur 320 px :
  // « Répondre » ou « Reprendre » seul, sur une ligne, le libellé entier restant le nom du lien
  const ctaPages = [
    ['sujets', '/sujets'],
    ...(VIDEOS_SHOWN ? [['vidéos', '/videos']] : []),
    ['candidats', '/candidats'],
    ['fiche candidat', `/candidat/${FICHE.id}`],
    ['comparer', `/comparer/${pack.candidates.slice(0, 2).map(c => c.id).join(',')}`],
  ]
  const trendState = JSON.parse(trendSaved[STORAGE])
  const nextOpen = orderedQuestions(pack.bank, 'essentiel', trendState.seed).findIndex(q => !trendState.answers[q.id])
  const ctaStates = [
    ['vierge', null, 'Répondre aux questions', 'Répondre', L('/feuille/1')],
    ['en cours', trendSaved, 'Reprendre mes réponses', 'Reprendre', L(`/feuille/${nextOpen + 1}`)],
    ['fini', saved, 'Voir mon dépouillement', null, L('/resultats')],
  ]
  const ctaIssues = []
  for (const [what, st, long, short, href] of ctaStates) {
    for (const zoom of [100, 200]) {
      const cctx = await browser.newContext({ viewport: { width: zoom === 100 ? 390 : 320, height: 740 }, reducedMotion: 'reduce' })
      if (st) await cctx.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), st)
      if (zoom !== 100) await cctx.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
      const cp = await cctx.newPage()
      for (const [where, path] of ctaPages) {
        await cp.goto(U(path))
        const cta = cp.locator('nav.action-bar .action-bar-inner > a.btn-primary')
        await cta.first().waitFor()
        await cp.waitForTimeout(60)
        // Ce qui se voit (les morceaux du libellé qui ont une taille) et ses lignes ; le nom du lien, par son rôle
        const got = await cta.first().evaluate(a => {
          const parts = [...a.childNodes].filter(n => (n.nodeType === 3 ? n.textContent.trim() : n.matches?.('span')))
          // Un morceau rogné (le libellé entier, gardé pour les lecteurs d'écran) n'a qu'un pixel de large
          const shown = parts.filter(n => {
            if (n.nodeType !== 3) return n.getBoundingClientRect().width > 2
            const r = document.createRange()
            r.selectNodeContents(n)
            return [...r.getClientRects()].some(x => x.width > 2 && x.height > 2)
          })
          const r = document.createRange()
          r.selectNodeContents(shown[0] ?? a)
          return {
            shown: shown.map(n => n.textContent.trim()).join(' '),
            lines: new Set([...r.getClientRects()].filter(x => x.width > 2).map(x => Math.round(x.top))).size,
            href: a.getAttribute('href'),
            out: a.scrollWidth > a.clientWidth + 1,
          }
        })
        const named = await cp.locator('nav.action-bar').getByRole('link', { name: long, exact: true }).count()
        const visible = zoom === 200 && short ? short : long
        const count = await cta.count()
        if (count !== 1 || got.href !== href || named !== 1 || got.shown !== visible) ctaIssues.push(`${where}, ${what}, ${zoom} % : « ${got.shown} » vers ${got.href}, nom « ${long} » ${named} fois (${count} appel)`)
        // Le libellé court tient sur une ligne ; « Voir mon dépouillement » n'a pas de libellé court : « dépouillement »,
        // qui ne tient pas seul sur la ligne d'un téléphone de 320 px à 200 %, s'y coupe sans déborder
        if (got.out || (zoom === 200 && short && got.lines !== 1)) ctaIssues.push(`${where}, ${what}, ${zoom} % : ${got.lines} ligne(s)${got.out ? ', déborde' : ''}`)
      }
      await cctx.close()
    }
  }
  check(
    ctaIssues.length === 0,
    `barres du bas (${ctaPages.map(([w]) => w).join(', ')}) : « Répondre aux questions », « Reprendre mes réponses » vers la question ${nextOpen + 1}, « Voir mon dépouillement » selon les réponses ; à 200 % sur 320 px, « Répondre » ou « Reprendre » sur une ligne, le libellé entier pour nom${ctaIssues.length ? ` : ${ctaIssues.join(' ; ')}` : ''}`,
  )
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
  // Ces trois liens et rien d'autre (l'ancien lien « Élections passées » vers #/archives est retiré).
  // Le même pied partout (demande du propriétaire du 2026-10-15) : pleine largeur sur fond d'encre, avec les actions sur
  // la feuille (« Importer mes réponses », « Reprendre depuis un fichier »…), sauf pendant une table (section 10)
  // Le journal des données, entre la Méthode et la Confidentialité, depuis le 17 octobre 2026 (élections qui ont la page)
  // « Installer l'application » (17 octobre 2026) : le même pied, et aucun texte qui dise « feuille »
  const JOURNAL = pack.election.changelog.some(e => e.n)
  const footScreens = ['/', '/feuille/2', '/resultats', '/proximite', '/candidats', `/candidat/${FICHE.id}`, '/sujets', '/methode', ...(JOURNAL ? ['/journal'] : []), '/confidentialite', '/mentions-legales', '/priorites', '/approfondir', '/partager', '/autre-appareil', '/installer', ...(PROFILE ? ['/profil', '/a-table'] : []), ...(COMPTES ? ['/comptes/objectif', '/comptes/methode'] : [])]
  const notices = [L('/methode'), ...(JOURNAL ? [L('/journal')] : []), L('/confidentialite'), L('/mentions-legales')]
  const footIssues = []
  for (const path of footScreens) {
    const titleBefore = await page.title()
    await page.goto(U(path))
    await page.waitForFunction(t => document.title !== t, titleBefore, { timeout: 3000 }).catch(() => null)
    await page.locator('main h1').first().waitFor()
    // Les écrans chargés à la demande : la hauteur de leur barre (--bar-real, app.tsx) est relevée juste après
    await page.waitForTimeout(300)
    const landmarks = await page.getByRole('contentinfo').count()
    const f = await page.evaluate(sel => {
      window.scrollTo(0, document.documentElement.scrollHeight)
      const foot = document.querySelectorAll('footer.site-foot.home-foot')
      const links = [...(foot[0]?.querySelectorAll('.site-foot-links a') ?? [])]
      const bar = document.querySelector('.action-bar')
      const last = links.at(-1)?.getBoundingClientRect()
      return {
        count: foot.length,
        hrefs: links.map(a => a.getAttribute('href')),
        current: links.filter(a => a.getAttribute('aria-current') === 'page').map(a => a.getAttribute('href')),
        inHeader: document.querySelectorAll(sel).length,
        masked: !last || (!!bar && last.bottom > bar.getBoundingClientRect().top + 0.5),
        dark: !!foot[0] && getComputedStyle(foot[0]).backgroundColor !== getComputedStyle(document.body).backgroundColor,
        full: !!foot[0] && Math.round(foot[0].getBoundingClientRect().width) >= document.documentElement.clientWidth - 1,
        actions: [...(foot[0]?.querySelectorAll('.home-foot-actions a, .home-foot-actions button') ?? [])].map(a => a.textContent.trim()),
        // « Réponses » et « questions », jamais « feuille » (17/10/2026) : le texte de la page et l'aide des lecteurs d'écran
        sheet: [document.body.innerText, ...[...document.querySelectorAll('[aria-label], [title], [alt]')].map(e => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''} ${e.getAttribute('alt') ?? ''}`)]
          .join(' ')
          .match(/\bfeuilles?\b[^.\n]{0,40}/gi) ?? [],
      }
    }, notices.map(h => `.form-header a[href="${h}"]`).join(', '))
    const expected = notices.includes(L(path)) ? L(path) : ''
    const ok =
      f.count === 1 && landmarks === 1 && f.hrefs.join(' ') === notices.join(' ') && f.current.join(' ') === expected && f.inHeader === 0 && !f.masked &&
      f.dark && f.full && f.actions.includes('Importer mes réponses') && f.actions.includes('Reprendre depuis un fichier') && f.actions.includes('Transférer mes réponses') &&
      f.sheet.length === 0
    if (!ok) footIssues.push(`${path} (${f.count} pied, ${landmarks} repère, liens ${f.hrefs.join(' ')}, courant ${f.current.join(' ') || '-'}, ${f.inHeader} dans l’en-tête${f.masked ? ', masqué par la barre' : ''}, sombre ${f.dark}, pleine largeur ${f.full}, actions ${f.actions.join(' · ')}${f.sheet.length ? `, « ${f.sheet.join(' », « ')} »` : ''})`)
  }
  check(
    footIssues.length === 0,
    `pied de page sur ${footScreens.length} écrans : le même partout (fond d’encre, pleine largeur, actions sur les réponses), aucun texte qui dise « feuille », méthode, ${JOURNAL ? 'journal des données, ' : ''}confidentialité et mentions légales en bas, pas dans l’en-tête${footIssues.length ? ` : ${footIssues.join(' ; ')}` : ''}`,
  )

  check(foreign.length === 0, `aucune requête vers un autre site${foreign.length ? ` : ${foreign.join(', ')}` : ''}`)
  await ctx.close()

  // 7 bis ter. Journal des données (#/journal, décision du propriétaire du 17 octobre 2026, sur maquette) : la page,
  // chargée à la demande ; au téléphone, les filtres dans une feuille modale (titre, focus gardé dedans, Échap, retour du
  // focus, « Effacer les filtres », « Voir N entrées ») ; l'adresse suit les filtres, jamais les choix calculés sur
  // l'appareil ; une entrée par son numéro ; l'ancienne rubrique de la Méthode ; aucune entrée ; l'avis du dépouillement,
  // qui dit ce qui a bougé et ouvre le journal sur « après votre dernier passage » ; sur ordinateur, les filtres sur la
  // page, en pastilles, et la ligne collée ; rien en largeur à 320, 375 et 1 280 px. Le focus ne tombe jamais sur la page
  // quand le bouton touché disparaît, se désactive ou se cache (contre-vérification du 17 octobre 2026)
  if (JOURNAL) {
    const { journalItems, newerVersion } = await importSite('src/core/journal.ts')
    const items = journalItems(pack)
    const TOTAL = items.length
    const entries = n => `${n}\u00a0entrée${n > 1 ? 's' : ''}`
    const of = id => items.filter(i => i.people.some(p => p.id === id) || i.named.includes(id)).length
    // Le candidat de la plus récente entrée « Positions »
    const who = items.find(i => i.people.length)?.people[0]?.id
    const jc = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce', isMobile: true, hasTouch: true })
    await jc.addInitScript(st => Object.entries(st).forEach(([k, v]) => localStorage.setItem(k, v)), saved)
    const jp = await jc.newPage()
    await jp.goto(U('/journal'))
    await jp.locator('.jr-entry').first().waitFor()
    const phone = await jp.evaluate(() => ({
      entries: document.querySelectorAll('.jr-entry').length,
      inline: getComputedStyle(document.querySelector('.jr-tools')).display,
      button: !!document.querySelector('.jr-open')?.offsetParent,
      aiFirst: !!(document.querySelector('main .ai-label')?.compareDocumentPosition(document.querySelector('.jr-title')) & Node.DOCUMENT_POSITION_FOLLOWING),
      wide: document.documentElement.scrollWidth > innerWidth,
    }))
    check(
      phone.entries === TOTAL && phone.inline === 'none' && phone.button && phone.aiFirst && !phone.wide,
      `journal au téléphone : ${phone.entries} entrées sur ${TOTAL}, les filtres derrière « Filtres », la mention IA avant le premier titre, rien en largeur`,
    )
    await jp.locator('.jr-open').click()
    const opened = await jp.evaluate(() => {
      const d = document.querySelector('dialog.jr-sheet')
      return { open: d.open, modal: d.matches(':modal'), focus: document.activeElement?.id, title: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent }
    })
    const stops = []
    for (let i = 0; i < 9; i++) {
      await jp.keyboard.press('Tab')
      stops.push(await jp.evaluate(() => !!document.activeElement?.closest('dialog.jr-sheet')))
    }
    check(opened.open && opened.modal && opened.focus === 'jr-sheet-title' && opened.title === 'Filtres' && stops.every(Boolean), `feuille des filtres : modale, titrée « ${opened.title} », le focus sur son titre puis gardé dedans (${stops.filter(Boolean).length} Tab sur ${stops.length})`)
    await jp.locator('.jr-sheet .is-candidat select').selectOption(who)
    const picked = await jp.evaluate(() => ({
      hash: decodeURI(location.hash),
      see: document.querySelector('.jr-sheet .btn-primary')?.textContent ?? '',
      n: document.querySelector('.jr-open .chip-n')?.textContent ?? '',
      set: document.querySelector('.jr-open')?.classList.contains('is-set'),
    }))
    await jp.keyboard.press('Escape')
    const closed = await jp.evaluate(() => ({ open: document.querySelector('dialog.jr-sheet').open, back: document.activeElement?.classList.contains('jr-open'), shown: document.querySelectorAll('.jr-entry').length }))
    check(
      picked.hash === L(`/journal?candidat=${who}`) && flat(picked.see) === flat(`Voir ${entries(of(who))}`) && /^,?\s*1/.test(flat(picked.n)) && picked.set && !closed.open && closed.back && closed.shown === of(who),
      `filtre posé dans la feuille : l’adresse le porte (${picked.hash}), « ${flat(picked.see)} », « Filtres » le compte ; Échap la referme, le focus revient au bouton, ${closed.shown} entrées`,
    )
    await jp.locator('.jr-open').click()
    // « Effacer les filtres », au clavier : il s'éteint de lui-même, le focus passe à « Voir N entrées »
    await jp.locator('.jr-sheet-foot .btn-text').focus()
    await jp.keyboard.press('Enter')
    const cleared = await jp.evaluate(() => ({
      hash: decodeURI(location.hash),
      see: document.querySelector('.jr-sheet .btn-primary')?.textContent ?? '',
      focus: document.activeElement === document.querySelector('.jr-sheet .btn-primary'),
    }))
    await jp.locator('.jr-sheet-foot .btn-primary').click()
    const seen = await jp.evaluate(() => ({ open: document.querySelector('dialog.jr-sheet').open, back: document.activeElement?.classList.contains('jr-open'), shown: document.querySelectorAll('.jr-entry').length }))
    check(
      cleared.hash === L('/journal') && flat(cleared.see) === flat(`Voir ${entries(TOTAL)}`) && cleared.focus && !seen.open && seen.back && seen.shown === TOTAL,
      `« Effacer les filtres » remet l’adresse à ${cleared.hash} et passe le focus à « ${flat(cleared.see)} », qui referme la feuille sur les ${seen.shown} entrées`,
    )
    // Un toucher sur la bande haute de la feuille (son double filet) la laisse ouverte ; sur le fond, au-dessus, la referme
    await jp.locator('.jr-open').click()
    const band = await jp.evaluate(() => document.querySelector('dialog.jr-sheet').getBoundingClientRect().top)
    await jp.mouse.click(60, band + 2)
    const onBand = await jp.evaluate(() => document.querySelector('dialog.jr-sheet').open)
    await jp.mouse.click(60, Math.max(4, band - 40))
    const onBackdrop = await jp.evaluate(() => ({ open: document.querySelector('dialog.jr-sheet').open, back: document.activeElement?.classList.contains('jr-open') }))
    check(onBand && !onBackdrop.open && onBackdrop.back, `feuille des filtres : un toucher sur sa bande haute la laisse ouverte, sur le fond la referme (focus rendu à « Filtres »)`)
    // La fenêtre élargie la feuille ouverte (téléphone tourné) : la feuille se referme, le focus va au premier filtre de la
    // page, le bouton « Filtres » n'étant plus affiché
    await jp.locator('.jr-open').click()
    await jp.setViewportSize({ width: 1024, height: 700 })
    await jp.waitForTimeout(200)
    const widened = await jp.evaluate(() => ({ open: document.querySelector('dialog.jr-sheet').open, focus: !!document.activeElement?.closest('#filtres .is-candidat') }))
    check(!widened.open && widened.focus, `la feuille ouverte, la fenêtre passe à 1 024 px : elle se referme, le focus au premier filtre de la page`)
    await jp.setViewportSize({ width: 375, height: 812 })
    // 320 px, la feuille ouverte : rien en largeur, ni dans la page ni dans la feuille
    await jp.setViewportSize({ width: 320, height: 640 })
    await jp.locator('.jr-open').click()
    const narrow = await jp.evaluate(() => {
      const d = document.querySelector('dialog.jr-sheet')
      return { page: document.documentElement.scrollWidth > innerWidth, sheet: d.scrollWidth > d.clientWidth + 1, see: d.querySelector('.btn-primary').getBoundingClientRect().right <= innerWidth }
    })
    await jp.keyboard.press('Escape')
    check(!narrow.page && !narrow.sheet && narrow.see, `journal à 320 px, la feuille ouverte : rien en largeur`)
    await jp.setViewportSize({ width: 375, height: 812 })
    // Une entrée par son numéro (l'accueil de retour y mène) : ouverte, son titre au focus, la page défilée jusqu'à elle,
    // sous la ligne collante et dans la moitié haute de l'écran. La plus ancienne qui peut changer le classement : loin
    // du haut de la page
    const one = items.findLast(i => i.effect === 'peut-changer') ?? items.at(-1)
    await jp.goto(U(`/journal/${one.n}`))
    await jp.waitForTimeout(500)
    const opened1 = await jp.evaluate(n => {
      const t = document.getElementById(`entree-${n}`)
      const bar = document.querySelector('.jr-summary').getBoundingClientRect()
      return { open: !!t?.closest('.jr-entry')?.querySelector('.jr-more')?.open, focus: document.activeElement?.id, top: t?.getBoundingClientRect().top ?? -1, below: bar.bottom, scrolled: scrollY, half: innerHeight / 2 }
    }, one.n)
    check(
      opened1.open && opened1.focus === `entree-${one.n}` && opened1.scrolled > 0 && opened1.top >= opened1.below - 1 && opened1.top < opened1.half,
      `#/journal/${one.n} : l’entrée ouverte, son titre au focus, la page défilée (${Math.round(opened1.scrolled)} px), sous la ligne collante et dans la moitié haute (${Math.round(opened1.below)} ≤ ${Math.round(opened1.top)} < ${Math.round(opened1.half)})`,
    )
    // L'ancienne rubrique de la Méthode mène à la page
    await jp.goto(U('/methode/journal'))
    await jp.locator('.jr-entry').first().waitFor()
    check(hashOf(jp) === L('/journal') && (await jp.locator('main h1').textContent()) === 'Journal des données', `l’ancienne adresse #/methode/journal mène au journal (${hashOf(jp)})`)
    // Aucune entrée : un candidat sans rien depuis le dernier jour ; de quoi en sortir, chacun avec son nombre
    const last = [...new Set(items.map(i => i.date))].sort().at(-1)
    const quiet = pack.candidates.find(c => of(c.id) && !items.some(i => i.date >= last && (i.people.some(p => p.id === c.id) || i.named.includes(c.id))))
    if (quiet) {
      await jp.goto(U(`/journal?candidat=${quiet.id}&depuis=${last}`))
      await jp.locator('.jr-empty').waitFor()
      const none = await jp.evaluate(() => ({ entries: document.querySelectorAll('.jr-entry').length, ways: [...document.querySelectorAll('.jr-empty-actions button')].map(b => b.textContent) }))
      // Un bouton de « Aucune entrée », au clavier : le bloc disparaît, le focus passe à la ligne du compte
      await jp.locator('.jr-empty-actions button').first().focus()
      await jp.keyboard.press('Enter')
      const out = await jp.evaluate(() => ({ focus: document.activeElement?.classList.contains('jr-count'), shown: document.querySelectorAll('.jr-entry').length }))
      check(
        none.entries === 0 && none.ways.length === 3 && none.ways.every(w => /\(\d+/.test(w)) && out.focus && out.shown > 0,
        `aucune entrée : ${none.ways.map(flat).join(' · ')} ; le premier lève son filtre (${out.shown} entrées) et passe le focus à la ligne du compte`,
      )
    }
    await jc.close()

    // L'avis du dépouillement, données mises à jour depuis la visite du 9 octobre : ce qui a bougé pour la personne,
    // d'après le classement de cette visite (un score y est baissé de 3 points, pour l'exemple), dit une fois et figé
    // jusqu'à « Compris » ; le repère des « +3 pts depuis votre dernier passage » suit, lui, chaque visite.
    // « Voir ce qui a changé » ouvre le journal sur « après votre dernier passage », passé en mémoire pour un clic simple
    // seulement, jamais dans l'adresse
    const { inputsKey } = await importSite('src/core/storage.ts')
    const oldest = items.at(-1).versions[0]
    const visitedAt = '2026-10-09T10:00:00.000Z'
    const was = JSON.parse(saved[STORAGE])
    const lower = (was.lastSeenRanking ?? []).findIndex(r => r.score !== null && r.score >= 3)
    const before = {
      ...was,
      dataVersion: oldest,
      dataUpdatedFrom: null,
      beforeUpdate: null,
      lastSeenRanking: (was.lastSeenRanking ?? []).map((r, i) => (i === lower ? { ...r, score: r.score - 3 } : r)),
      lastSeenBasis: { inputs: inputsKey(was.answers, was.weights), at: visitedAt },
    }
    const pc = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    // Une seule fois : les rechargements gardent ce que la page a écrit
    await pc.addInitScript(
      ([st, key]) => localStorage.getItem(key) || Object.entries(st).forEach(([k, v]) => localStorage.setItem(k, v)),
      [{ ...saved, [STORAGE]: JSON.stringify(before) }, STORAGE],
    )
    const pp = await pc.newPage()
    // Une visite : la page chargée de nouveau (une adresse qui ne change que par le fragment ne la recharge pas)
    const visit = async () => {
      if (pp.url().startsWith('http') && hashOf(pp) === L('/resultats')) await pp.reload()
      else await pp.goto(U('/resultats'))
      await pp.locator('.notice a').first().waitFor()
      await pp.waitForTimeout(300)
      return pp.evaluate(() => ({
        said: document.querySelector('.notice p')?.textContent ?? '',
        deltas: [...document.querySelectorAll('.board-row')].filter(r => /depuis votre dernier passage/.test(r.textContent ?? '')).length,
      }))
    }
    const first = await visit()
    // Une étoile touchée l'avis ouvert : la phrase ne change pas. Celle d'un thème déjà prioritaire s'il y en a (la
    // retirer n'est jamais refusé), sinon la première
    const starAt = await pp.evaluate(() => Math.max(0, [...document.querySelectorAll('.pv-grid .star-toggle')].findIndex(b => b.closest('tr')?.classList.contains('is-priority'))))
    const star = pp.locator('.pv-grid .star-toggle').nth(starAt)
    await star.click()
    await pp.waitForTimeout(300)
    const starred = flat(await pp.locator('.notice p').first().textContent())
    await star.click()
    await pp.waitForTimeout(300)
    // Seconde visite sans « Compris », sans rien changer : la même phrase, plus d'écart « depuis votre dernier passage »
    const second = await visit()
    check(
      lower >= 0 && /Pour vous\s*:.*un score a bougé/.test(flat(first.said)) && first.deltas >= 1 && starred === flat(first.said) && flat(second.said) === flat(first.said) && second.deltas === 0,
      `l’avis du dépouillement : « ${flat(first.said)} », ${first.deltas} écart(s) « depuis votre dernier passage » ; la même phrase une étoile posée, et à la visite suivante, sans plus d’écart (${second.deltas})`,
    )
    // Cmd ou Ctrl+clic sur « Voir ce qui a changé » : le journal s'ouvre ailleurs, et ne règle pas le journal ouvert
    // ensuite dans cet onglet
    const link = pp.locator(`.notice a[href="${L('/journal')}"]`)
    const popup = pc.waitForEvent('page', { timeout: 3000 }).catch(() => null)
    await link.click({ modifiers: ['ControlOrMeta'] })
    await (await popup)?.close()
    const stayed = hashOf(pp)
    await pp.evaluate(path => (location.hash = path), L('/journal'))
    await pp.locator('.jr-entry').first().waitFor()
    const plainLater = await pp.evaluate(() => ({ words: document.querySelector('.jr-words')?.textContent ?? '', shown: document.querySelectorAll('.jr-entry').length }))
    // Un clic simple : le journal sur « après votre dernier passage », versions plus récentes que celle vue, ou publiées
    // après le jour de la visite
    await pp.evaluate(path => (location.hash = path), L('/resultats'))
    await link.waitFor()
    await link.click()
    await pp.locator('.jr-entry').first().waitFor()
    const passage = await pp.evaluate(() => ({ hash: decodeURI(location.hash), words: document.querySelector('.jr-words')?.textContent ?? '', shown: document.querySelectorAll('.jr-entry').length }))
    const seenDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(visitedAt))
    const expected = items.filter(i => i.versions.some(v => newerVersion(v, oldest)) || i.date > seenDay).length
    check(
      stayed === L('/resultats') && plainLater.shown === TOTAL && !flat(plainLater.words).includes('passage'),
      `Cmd ou Ctrl+clic sur « Voir ce qui a changé » : l’onglet reste sur ${stayed}, et le journal ouvert ensuite ici n’est pas filtré (${plainLater.shown} entrées)`,
    )
    check(
      passage.hash === L('/journal') && flat(passage.words).includes('après votre dernier passage') && passage.shown === expected,
      `l’avis du dépouillement ouvre le journal sur « après votre dernier passage » : ${passage.shown} entrées, adresse ${passage.hash}`,
    )
    // Les réponses changées depuis (une étoile gardée) : l'avis ne dit plus rien de précis
    await pp.evaluate(path => (location.hash = path), L('/resultats'))
    await star.waitFor()
    await star.click()
    await pp.waitForTimeout(300)
    const changed = await visit()
    check(/Votre résultat a pu changer\./.test(flat(changed.said)), `une priorité changée depuis la mise à jour : l’avis dit « ${flat(changed.said)} »`)
    await pc.close()

    // Ordinateur : les filtres sur la page, « Ce qui change » en pastilles avec leur nombre ; la ligne collée
    const dc = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
    await dc.addInitScript(st => Object.entries(st).forEach(([k, v]) => localStorage.setItem(k, v)), saved)
    const dp = await dc.newPage()
    await dp.goto(U('/journal'))
    await dp.locator('.jr-entry').first().waitFor()
    const desk = await dp.evaluate(() => ({
      inline: getComputedStyle(document.querySelector('.jr-tools')).display,
      chips: document.querySelectorAll('.jr-chips .filter-chip').length,
      button: !!document.querySelector('.jr-open')?.offsetParent,
    }))
    // Au clavier, les filtres suivent la grille : du thème à la période (même rangée), puis aux pastilles
    await dp.locator('.jr-tools .is-theme select').focus()
    await dp.keyboard.press('Tab')
    const afterTheme = await dp.evaluate(() => !!document.activeElement?.closest('.jr-tools .is-depuis'))
    await dp.keyboard.press('Tab')
    const afterPeriod = await dp.evaluate(() => !!document.activeElement?.closest('.jr-tools .is-change'))
    check(afterTheme && afterPeriod, `journal sur ordinateur : au clavier, le thème, la période, puis « Ce qui change », dans l’ordre de la grille`)
    await dp.locator('.jr-chips .filter-chip', { hasText: 'Positions' }).click()
    const chip = await dp.evaluate(() => ({ hash: decodeURI(location.hash), pressed: document.querySelector('.jr-chips .filter-chip[aria-pressed="true"]')?.textContent ?? '' }))
    // « Tout afficher », au clavier : le bouton disparaît, le focus passe à la ligne du compte
    await dp.locator('.jr-reset').focus()
    await dp.keyboard.press('Enter')
    const reset = await dp.evaluate(() => ({ focus: document.activeElement?.classList.contains('jr-count'), shown: document.querySelectorAll('.jr-entry').length, hash: decodeURI(location.hash) }))
    check(reset.focus && reset.shown === TOTAL && reset.hash === L('/journal'), `« Tout afficher » : ${reset.shown} entrées, le focus à la ligne du compte`)
    await dp.locator('.jr-chips .filter-chip', { hasText: 'Positions' }).click()
    await dp.evaluate(() => window.scrollTo(0, document.querySelector('.jr-day:last-of-type')?.getBoundingClientRect().top + scrollY))
    await dp.waitForTimeout(300)
    const stuck = await dp.evaluate(() => ({ stuck: document.querySelector('.jr-summary').classList.contains('is-stuck'), up: !!document.querySelector('.jr-up')?.offsetParent, wide: document.documentElement.scrollWidth > innerWidth }))
    check(
      desk.inline === 'block' && desk.chips === 6 && !desk.button && chip.hash === L('/journal?change=positions') && /^Positions/.test(flat(chip.pressed)) && stuck.stuck && stuck.up && !stuck.wide,
      `journal sur ordinateur : les filtres sur la page, ${desk.chips} pastilles, « ${flat(chip.pressed)} » enfoncée (${chip.hash}) ; défilée, la ligne collée propose « Filtres »`,
    )
    // Le lien « Journal des données » du pied de page, le journal filtré : les filtres suivent l'adresse
    await dp.locator(`.site-foot a[href="${L('/journal')}"]`).click()
    await dp.waitForTimeout(200)
    const footed = await dp.evaluate(() => ({ hash: decodeURI(location.hash), shown: document.querySelectorAll('.jr-entry').length, pressed: document.querySelector('.jr-chips .filter-chip[aria-pressed="true"]')?.textContent ?? '' }))
    check(footed.hash === L('/journal') && footed.shown === TOTAL && /^Tout/.test(flat(footed.pressed)), `le pied de page sur le journal filtré : ${footed.hash}, ${footed.shown} entrées, aucun filtre`)
    await dc.close()
  }

  // 7 ter. Grand écran : le menu en ligne dans l'en-tête, le lien courant marqué, sans bouton « Menu »
  const wide = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  // La hauteur de l'en-tête du site posée sur <html> (--header-real), relevée à chaque changement : l'en-tête démonté
  // en changeant d'écran ne la remet jamais à zéro (tout ce qui colle dessous passerait derrière lui ; le contrôle de
  // l'en-tête collant de la comparaison, plus bas, tombait parfois dans ce laps). Observé depuis le document : <html>
  // n'existe pas encore quand le script s'exécute
  await wide.addInitScript(() => {
    window.__headerZero = 0
    new MutationObserver(() => {
      if (document.documentElement?.style.getPropertyValue('--header-real') === '0px') window.__headerZero++
    }).observe(document, { attributes: true, attributeFilter: ['style'], subtree: true })
  })
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
    inlineLinks.join(' | ') === [...(VIDEOS_SHOWN ? ['Les sujets page', 'Les vidéos -', 'Les candidats -'] : ['Les sujets page', 'Les candidats -']), ...(PROFILE ? ['À table -'] : []), ...(COMPTES ? ['Faire les comptes -'] : [])].join(' | ') && !toggleShown && hashOf(wp) === L('/candidats'),
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
      return { top: Math.round((ths[0]?.top ?? 0) - (bar?.bottom ?? 0)), off: Math.round(off), zero: window.__headerZero }
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
      / is-table/.test(layout ?? '') && side && Math.abs(aligned.top) <= 6 && aligned.off <= 1 && aligned.zero === 0 && (opp.rows ? opp.marked && opp.open : opp.none),
      `grand écran, comparaison de ${ids.length} : tableau complet ${/ is-table/.test(layout ?? '')}, question à gauche de ses cases ${side} ; en-tête collant à ${aligned.top}px, décalage des colonnes ${aligned.off}px, en-tête du site mesuré à 0 px ${aligned.zero} fois en changeant d’écran ; « Seulement les oppositions radicales » : ${opp.rows} lignes marquées ${opp.marked}, thèmes dépliés ${opp.open}`,
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

  // 8 bis. Texte agrandi à toutes les largeurs (réglage du navigateur, taille du texte de Safari sur iPad) : aucune
  // page principale ne défile sur le côté (mesuré le 15 octobre 2026 : à 1024 px et 200 %, « À vous d'essayer » et le
  // classement poussaient la page de 96 et 30 px ; « Qui porte quoi » et les notices aussi, et cinq pages à 320 px)
  {
    const pagesWide = [
      '/', '/resultats', '/proximite', '/candidats', `/candidat/${FICHE.id}`, `/comparer/${pack.candidates.slice(0, 4).map(c => c.id).join(',')}`,
      '/partager', '/profil', '/sujets', ...(VIDEOS_SHOWN ? ['/videos'] : []), '/feuille/1', '/approfondir', '/priorites',
      ...(PROFILE ? ['/a-table'] : []), ...(COMPTES ? ['/comptes/objectif', '/comptes', '/comptes/effectifs-publics', '/comptes/age-legal-retraite', '/comptes/depenses', '/comptes/budget', '/comptes/methode'] : []), '/autre-appareil', '/autre-appareil/importer', '/methode', '/confidentialite', '/mentions-legales',
      ...(pack.election.changelog.some(e => e.n) ? ['/journal'] : []),
    ]
    const sizesWide = [[1920, 200], [1280, 200], [1024, 200], [768, 200], [390, 200], [320, 200]]
    const wideIssues = []
    // « Faire les comptes » : un seul titre pour l'objectif et les rayons, et la fiche ouverte en est un autre : chaque
    // écran se reconnaît à ce qu'il montre (une fiche par emplois, une par options, la grille d'une famille)
    const READY = {
      '/comptes/objectif': '.cpt-goals',
      '/comptes': '.cpt-rail',
      '/comptes/effectifs-publics': '.cpt-card .cpt-steps',
      '/comptes/age-legal-retraite': '.cpt-card .cpt-options',
      '/comptes/depenses': '.cpt-grid',
      '/comptes/budget': '.cpt-verdict',
      '/comptes/methode': '.cpt-method',
    }
    for (const [width, scale] of sizesWide) {
      const c = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce' })
      await c.addInitScript(s => Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)), saved)
      await c.addInitScript(sc => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${sc}%`)), scale)
      const p = await c.newPage()
      let shown = ''
      for (const path of pagesWide) {
        await p.goto(U(path))
        // La page est là quand son titre a remplacé celui de la précédente (les écrans chargés à la demande arrivent après)
        if (READY[path]) {
          const there = await p.locator(READY[path]).first().waitFor({ timeout: 8000 }).then(() => true, () => false)
          if (!there) wideIssues.push(`${path} à ${width} px : écran absent (${READY[path]})`)
        } else
          await p
            .waitForFunction(prev => { const h = document.querySelector('main h1'); return !!h && h.textContent !== prev }, shown, { timeout: 8000 })
            .catch(() => null)
        shown = await p.evaluate(() => document.querySelector('main h1')?.textContent ?? '')
        await p.waitForTimeout(300)
        const extra = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        if (extra > 0) wideIssues.push(`${path} à ${width} px et ${scale} % : ${extra} px`)
        // « Faire les comptes » : un objectif choisi, pour que les leviers et le budget se montrent au lieu de ramener à
        // l'objectif (les adresses suivantes ne changent que le « # », la page garde son état)
        if (path === '/comptes/objectif') await p.locator('.cpt-goal-row input').first().check().catch(() => null)
      }
      await c.close()
    }
    check(
      wideIssues.length === 0,
      `texte agrandi : aucune page ne défile sur le côté (${pagesWide.length} pages, ${sizesWide.map(([w]) => w).join(', ')} px à 200 %)${wideIssues.length ? ` : ${wideIssues.join(' ; ')}` : ''}`,
    )
  }

  // 9. Adresses retirées du site (RETIRED_PREFIXES du registre : la primaire « Choisir 2027 », son alias
  // #/primaire, l'ancienne page #/archives) et anciens liens vers un candidat masqué (hiddenCandidateIds) : chaque
  // adresse est corrigée sur-le-champ, sans entrée d'historique, vers l'accueil, la même notice ou la même fiche sans
  // préfixe, ou la page des candidats pour un candidat masqué ; une comparaison perd ses candidats masqués, sans avis
  // « inconnu » ; jamais « Candidat introuvable ». Puis l'accueil, même
  // avec une feuille de la primaire gardée sur l'appareil : ni archive, ni « Élections passées », ni encart, ni lien
  // ni mot de la primaire ; la feuille gardée n'est ni effacée ni reprise (« Tout effacer » la couvre).
  if (entry.slug === '') {
    const hidden = defaultEntry.hiddenCandidateIds ?? []
    const textOf = p => p.evaluate(() => (document.body.innerText ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '))
    const cases = [
      ...RETIRED_PREFIXES.flatMap(p => [
        [`#/${p}`, '#/', 'home'],
        [`#/${p}/resultats`, '#/', 'home'],
        [`#/${p}/feuille/3`, '#/', 'home'],
        [`#/${p}/comparer/${FICHE.id}`, '#/', 'home'],
        [`#/${p}/candidat/${FICHE.id}`, `#/candidat/${FICHE.id}`, 'fiche'],
        [`#/${p}/methode/hors-classement`, '#/methode/hors-classement', 'methode'],
        [`#/${p}/confidentialite`, '#/confidentialite', 'notice'],
        [`#/${p}/candidats`, '#/candidats', 'candidats'],
      ]),
      ...hidden.flatMap(id => [[`#/candidat/${id}`, '#/candidats', 'candidats'], ...RETIRED_PREFIXES.map(p => [`#/${p}/candidat/${id}`, '#/candidats', 'candidats'])]),
      // Une comparaison partagée avant le masquage : les masqués en sont retirés, sans avis « inconnu »
      ...(hidden.length
        ? [
            [`#/comparer/${FICHE.id},${hidden.join(',')}`, `#/comparer/${FICHE.id}`, 'comparer'],
            [`#/comparer/${hidden.join(',')}`, '#/comparer', 'comparer'],
          ]
        : []),
    ]
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    // La longueur de l'historique à l'ouverture de chaque page, avant le code du site : une correction d'adresse
    // la remplace (replaceState) sans l'allonger
    await c.addInitScript(() => {
      window.__historyAtLoad = history.length
    })
    const p = await c.newPage()
    const issues = []
    for (const [from, to, kind] of cases) {
      await p.goto('about:blank')
      await p.goto(base + from)
      await p.waitForFunction(h => decodeURI(location.hash) === h, to, { timeout: 3000 }).catch(() => null)
      await p.locator('main h1').first().waitFor({ timeout: 6000 }).catch(() => null)
      const landed = hashOf(p)
      const t = await textOf(p)
      // L'adresse est remplacée, pas ajoutée : l'historique a la longueur qu'il avait à l'ouverture de la page
      const added = await p.evaluate(() => history.length - window.__historyAtLoad)
      const shown =
        kind === 'fiche' ? await p.locator('.bristol').first().isVisible().catch(() => false)
        : kind === 'candidats' ? (await p.locator('.people-panel').count()) === N
        : kind === 'home' ? (await p.locator('.home-sheet').count()) === 1
        : (await p.locator('main h1').count()) > 0
      const unknown = kind === 'comparer' && /inconnu/i.test(t)
      if (landed !== to || !shown || unknown || /introuvable/i.test(t) || added !== 0) issues.push(`${from} → ${landed} (attendu ${to}, ${kind} ${shown ? 'affiché' : 'absent'}, ${added} entrée(s) d’historique ajoutée(s)${unknown ? ', avis « inconnu »' : ''})`)
    }
    check(issues.length === 0, `adresses retirées (${RETIRED_PREFIXES.join(', ')}) et candidats masqués (${hidden.join(', ') || 'aucun'}) : ${cases.length} anciennes adresses corrigées${issues.length ? ` : ${issues.join(' ; ')}` : ''}`)
    await c.close()

    // L'accueil, avec une feuille de la primaire gardée sur cet appareil
    const kept = JSON.stringify({ format: 3, electionId: 'choisir-2027', dataVersion: '2026-10-03.1', seed: '0123456789abcdef', answers: {}, weights: {}, deepTopics: [], lastSeenRanking: null, dataUpdatedFrom: null, essentialDoneAt: null, updatedAt: '2026-10-10T12:00:00.000Z' })
    const hc = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    await hc.addInitScript(v => localStorage.setItem('isoloir:choisir-2027', v), kept)
    const hp = await hc.newPage()
    await hp.goto(base)
    await hp.locator('main h1').first().waitFor()
    await hp.waitForTimeout(150)
    const home = await textOf(hp)
    const homeIssues = []
    if (/\bArchives?\b/.test(home)) homeIssues.push('mention « Archive »')
    if (/Élections passées/.test(home)) homeIssues.push('« Élections passées »')
    if (/primaire|Choisir 2027/i.test(home)) homeIssues.push('la primaire est nommée')
    if (await hp.locator('.archive-callout, .archive-banner').count()) homeIssues.push('encart ou bandeau d’archive')
    const retiredLinks = await hp.evaluate(prefixes => [...document.querySelectorAll('a[href^="#/"]')].map(a => a.getAttribute('href')).filter(h => prefixes.some(p => h === `#/${p}` || h.startsWith(`#/${p}/`))), [...RETIRED_PREFIXES])
    if (retiredLinks.length) homeIssues.push(`liens ${retiredLinks.join(' ')}`)
    const keys = await hp.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('isoloir:')).sort())
    if (!keys.includes('isoloir:choisir-2027')) homeIssues.push('la feuille de la primaire a été effacée')
    if (keys.includes(STORAGE)) homeIssues.push(`une feuille ${STORAGE} a été créée`)
    check(homeIssues.length === 0, `accueil avec une feuille de la primaire sur l’appareil : rien de la primaire (ni archive, ni encart, ni lien), feuille gardée telle quelle${homeIssues.length ? ` : ${homeIssues.join(' ; ')}` : ''}`)
    await hc.close()
  }

  // 10. « À table » (#/a-table), hors ligne : une table de 4 vote en secret sur un seul téléphone. Rien n'est écrit sur
  // l'appareil, aucun nom de candidat n'apparaît avant la révélation, une adresse tapée ramène à la table, le
  // dépouillement se lit à voix haute, l'image se fabrique sur place, et un rechargement montre la table interrompue,
  // jamais la feuille du propriétaire ; le déverrouillage confirmé ramène à l'accueil
  if (PROFILE) {
    const tc = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const tp = await tc.newPage()
    const tableForeign = []
    tp.on('request', r => {
      const u = r.url()
      if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) tableForeign.push(u)
      if (r.method() !== 'GET') tableForeign.push(`${r.method()} ${u}`)
    })
    await tp.goto(HOME)
    await tp.evaluate(() => navigator.serviceWorker.ready)
    await tp.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
    await tc.setOffline(true)
    const keysBefore = await tp.evaluate(() => Object.keys(localStorage).sort().join(','))
    await tp.goto(U('/a-table'))
    await tp.locator('main h1').first().waitFor()
    const pressT = async label => {
      await tp.evaluate(t => {
        const b = [...document.querySelectorAll('main button, .action-bar-inner > button, main a')].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(t))
        if (!b) throw new Error(`introuvable : ${t} (${document.querySelector('main h1')?.textContent})`)
        b.click()
      }, label)
      await tp.waitForTimeout(120)
    }
    const rateT = async (suffix, v) => {
      await tp.evaluate(([s, val]) => [...document.querySelectorAll('input[type=radio]')].find(x => x.name.endsWith(s) && x.value === String(val))?.click(), [suffix, v])
      await tp.waitForTimeout(80)
    }
    const redT = async suffix => {
      await tp.evaluate(s => [...document.querySelectorAll('button.approach-reject')].find(x => x.getAttribute('aria-describedby')?.endsWith(s))?.click(), suffix)
      await tp.waitForTimeout(80)
    }
    const names = pack.candidates.map(c => c.name)
    const namesShown = () => tp.evaluate(ns => ns.filter(n => document.body.innerText.includes(n)), names)
    await pressT('Préparer la table')
    await tp.evaluate(() => document.querySelector('button[aria-label="Une personne de moins"]')?.click())
    await tp.waitForTimeout(60)
    await tp.evaluate(() => document.querySelector('button[aria-label="Une personne de moins"]')?.click())
    await tp.waitForTimeout(60)
    await pressT('Ouvrir l’urne')
    const leaks = []
    // Un bulletin entamé puis abandonné (« Retour » à la première question) n'est jamais montré à la personne suivante
    await pressT('J’ai le téléphone')
    await rateT('-a', 1)
    await tp.evaluate(() => [...document.querySelectorAll('.action-bar-inner > button')].find(b => b.textContent.includes('Retour'))?.click())
    await tp.waitForTimeout(150)
    const abandoned = await tp.evaluate(() => [...document.querySelectorAll('input[type=radio]:checked')].filter(i => i.value !== '0').length)
    if (abandoned === 0) await pressT('J’ai le téléphone')
    const leftover = await tp.evaluate(() => [...document.querySelectorAll('input[type=radio]:checked')].filter(i => i.value !== '0').length)
    check(leftover === 0, `à table : un bulletin abandonné n’est pas montré au suivant (${leftover} avis restés)`)
    for (let v = 0; v < 4; v++) {
      if (v > 0) {
        await pressT('Passer le téléphone')
        await pressT('J’ai le téléphone')
      }
      const closed = await tp.evaluate(() => ({ menu: !!document.querySelector('.menu-toggle, .main-nav'), links: document.querySelectorAll('.form-header a, main a[href^="#"]').length, videos: !!document.querySelector('.q-video') }))
      if (closed.menu || closed.links || closed.videos) leaks.push(`mode fermé incomplet au vote ${v + 1} (${JSON.stringify(closed)})`)
      for (let q = 0; q < 2; q++) {
        leaks.push(...(await namesShown()).map(n => `nom « ${n} » sur le bulletin`))
        await rateT('-a', 1)
        await rateT('-b', -1)
        if (v < 2) await redT('-b')
        await rateT('-c', v < 2 ? 1 : -1)
        await tp.evaluate(() => document.querySelector('.action-bar-inner > .btn-primary')?.click())
        await tp.waitForTimeout(150)
      }
      if (v === 1) {
        await tp.evaluate(h => (location.hash = h), L('/resultats'))
        await tp.waitForTimeout(500)
        if (hashOf(tp) !== L('/a-table')) leaks.push(`adresse tapée pendant la table : ${hashOf(tp)}`)
      }
    }
    await pressT('Dépouiller ensemble')
    const verdicts = []
    for (let i = 0; i < 12; i++) {
      const band = await tp.locator('.aloud-verdict').textContent().catch(() => null)
      if (!band) break
      verdicts.push(flat(band))
      leaks.push(...(await namesShown()).map(n => `nom « ${n} » au dépouillement`))
      await tp.evaluate(() => document.querySelector('.action-bar-inner > .btn-primary')?.click())
      await tp.waitForTimeout(150)
    }
    const keysDuring = await tp.evaluate(() => Object.keys(localStorage).sort().join(','))
    await pressT('Qui porte ces idées')
    await pressT('Découvrir qui porte ces idées')
    const revealed = (await namesShown()).length
    await pressT('Image de la table')
    await pressT('Oui, toute la table est d’accord')
    await tp.locator('.table-picture-preview img').waitFor({ timeout: 5000 }).catch(() => null)
    const picture = await tp.evaluate(() => {
      const img = document.querySelector('.table-picture-preview img')
      return img ? { w: img.naturalWidth, alt: img.alt } : null
    })
    await pressT('Terminer')
    await pressT('Effacer la table')
    const ended = flat(await tp.locator('main h1').textContent())
    await tp.reload()
    await tp.locator('main h1').first().waitFor()
    const afterReload = flat(await tp.locator('main h1').textContent())
    await pressT('C’est mon téléphone')
    await pressT('Oui, c’est mon téléphone')
    await tp.waitForTimeout(400)
    const keysAfter = await tp.evaluate(() => Object.keys(localStorage).sort().join(','))
    const unlockedAt = hashOf(tp)
    // Après le déverrouillage, un retour arrière ne remet pas le site sous verrou
    await tp.goBack().catch(() => null)
    await tp.waitForTimeout(500)
    const relocked = await tp.evaluate(() => ({ h1: document.querySelector('main h1')?.textContent ?? '', closed: !!document.querySelector('.form-header.is-closed') }))
    check(!relocked.closed && !/interrompue/.test(relocked.h1), `à table : retour arrière après le déverrouillage, pas de nouveau verrou (« ${relocked.h1} »)`)
    check(leaks.length === 0, `à table : mode fermé, aucun nom avant la révélation, adresse tapée ramenée à la table${leaks.length ? ` : ${leaks.slice(0, 5).join(' ; ')}` : ''}`)
    const want = ['Toute la table ou presque est d’accord', 'Toute la table ou presque n’est pas d’accord', 'Certains sont d’accord, d’autres non']
    check(want.every(w => verdicts.some(v => v.includes(w))), `à table : dépouillement à voix haute, ${verdicts.length} idées (${[...new Set(verdicts)].join(' · ')})`)
    check(keysBefore === keysDuring && keysBefore === keysAfter, `à table : rien d’écrit sur l’appareil (clés avant « ${keysBefore} », pendant « ${keysDuring} », après « ${keysAfter} »)`)
    check(revealed >= 1 && !!picture && picture.w === 1080 && /sans valeur statistique/.test(picture.alt) && !names.some(n => picture.alt.includes(n)), `à table : révélation (${revealed} noms), image fabriquée hors ligne (${picture?.w ?? 'aucune'} px de large, sans nom de candidat)`)
    check(ended === 'C’est effacé.' && afterReload === 'La table a été interrompue.' && unlockedAt === L('/'), `à table : « ${ended} », puis après rechargement « ${afterReload} », puis déverrouillage vers ${unlockedAt}`)
    check(tableForeign.length === 0, `à table : aucune requête hors du site ni envoi (${tableForeign.slice(0, 3).join(', ') || 'aucune'})`)
    await tc.close()
  }
  // 10 bis. « Faire les comptes » (#/comptes), hors ligne : l'objectif, une fiche, un cran, le curseur ; le déficit de la
  // bande suit, rien n'est écrit sur l'appareil, rien ne part ; « Votre budget 2027 » garde le levier réglé
  if (COMPTES) {
    const cc = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
    const cp = await cc.newPage()
    const foreign = []
    const errors = []
    cp.on('request', r => {
      const u = r.url()
      if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) foreign.push(u)
      if (r.method() !== 'GET') foreign.push(`${r.method()} ${u}`)
    })
    cp.on('pageerror', e => errors.push(e.message))
    await cp.goto(HOME)
    await cp.evaluate(() => navigator.serviceWorker.ready)
    await cp.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
    await cc.setOffline(true)
    const keysBefore = await cp.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))
    await cp.goto(U('/comptes'))
    await cp.locator('.cpt-goals').waitFor({ timeout: 8000 })
    const firstGoal = hashOf(cp) === L('/comptes/objectif')
    // La redirection vers l'objectif remplace l'adresse demandée : le retour arrière ramène d'où l'on vient, pas à une
    // redirection qui renverrait aussitôt à l'objectif
    await cp.goBack().catch(() => null)
    await cp.waitForTimeout(300)
    const backOut = !hashOf(cp).startsWith(L('/comptes'))
    await cp.goForward().catch(() => null)
    await cp.locator('.cpt-goals').waitFor({ timeout: 8000 })
    await cp.locator('.cpt-goal-row').nth(2).click()
    await cp.locator('.action-bar .btn-primary').click()
    await cp.locator('.cpt-rail').first().waitFor()
    const before = (await cp.locator('.cpt-fig').innerText()).replace(/\s+/g, ' ')
    await cp.locator('.cpt-row .cpt-tile:not(.cpt-tile-more) .cpt-tile-btn').first().click()
    await cp.locator('.cpt-card').waitFor()
    await cp.locator('.cpt-steps button').last().click()
    const afterNotch = (await cp.locator('.cpt-fig').innerText()).replace(/\s+/g, ' ')
    const range = cp.locator('.cpt-range')
    let slid = true
    if (await range.count()) {
      const v0 = await range.inputValue()
      await range.focus()
      await cp.keyboard.press('ArrowLeft')
      slid = (await range.inputValue()) !== v0
    }
    await cp.goto(U('/comptes/budget'))
    await cp.locator('.cpt-lines').waitFor()
    const recapRows = await cp.locator('.cpt-lines li:not(.fam)').count()
    const keysAfter = await cp.evaluate(() => JSON.stringify(Object.entries(localStorage).sort()))
    check(
      firstGoal && backOut && before !== afterNotch && slid && recapRows >= 1 && keysBefore === keysAfter && foreign.length === 0 && errors.length === 0,
      `« Faire les comptes » hors ligne : objectif d’abord ${firstGoal}, le retour arrière en sort ${backOut}, la bande suit le cran (${before} → ${afterNotch}), curseur au clavier ${slid}, levier au récapitulatif ${recapRows}, rien d’écrit ${keysBefore === keysAfter}, rien d’envoyé ${foreign.length === 0 ? 'oui' : foreign.join(', ')}${errors.length ? `, erreurs : ${errors.join(' ; ')}` : ''}`,
    )
    await cc.close()
  }

  // 11. « Installer l'application » (#/installer), hors ligne, en imitant chaque appareil (navigateur, système, mode
  // installé) : iPhone avec Safari d'iOS 26 (copier d'abord, 7 gestes, « Copier le code » dans le geste même), d'iOS 18
  // (6 gestes), sans réponse (ni copie ni aplat bleu) ; Android avec Chrome (le bouton « Installer Isoloir » à l'annonce
  // du navigateur, jamais d'invite de lui-même, l'installation suivie, acceptée ou annulée : le statut dit ce qu'il en est
  // et reçoit le focus) ; ordinateur (deux colonnes, QR code de la seule adresse de la page ; un texte collé puis effacé
  // laisse le presse-papiers intact) ; Windows avec Firefox (le code collé dans le champ, comme l'import de son
  // application le montre) ; Instagram (ouvrir d'abord le navigateur) ; appareil non reconnu (la liste ouverte). Puis
  // l'application installée sur iPhone : l'avis de l'accueil (l'appel de l'en-tête au trait, « Je n'avais pas répondu »
  // retenu, ses mots entiers à 320 px texte à 200 %), ni la ligne du pied ni le lien de « Et maintenant », l'import qui
  // ouvre sur « Coller le code » (un presse-papiers sans code le dit), le code copié dans le navigateur collé, le focus sur
  // « Réponses trouvées », les mêmes réponses, le presse-papiers vidé. « Autre appareil ? » ne change pas d'adresse ;
  // rien ne défile sur le côté (320 px à 200 %, 375, 1 280) ; le texte des schémas fait 12 px au moins à 375 px ; aucun
  // symbole de menu (« ⋮ », « ≡ »…) sans son nom en mots ; la feuille de la page vient avec elle, hors ligne ; le
  // manifeste est gardé hors ligne ; aucune requête hors du site ni violation de la CSP
  {
    const IPHONE = token => `Mozilla/5.0 (iPhone; CPU iPhone OS ${token} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko)`
    const UA = {
      ios26: `${IPHONE('18_6')} Version/26.0 Mobile/15E148 Safari/604.1`,
      ios18: `${IPHONE('18_5')} Version/18.5 Mobile/15E148 Safari/604.1`,
      // L'application de l'écran d'accueil : le même moteur, sans « Safari/ »
      iosApp: `${IPHONE('18_6')} Mobile/15E148`,
      android: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
      opera: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36 OPR/90.0.0.0',
      desk: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0',
      instagram: `${IPHONE('18_6')} Mobile/15E148 Instagram 350.0.0.0 (iPhone15,2; iOS 18_6; fr_FR; fr; scale=3.00; 1179x2556)`,
    }
    /** Le mode installé, imité : navigator.standalone et display-mode: standalone */
    const STANDALONE = () => {
      Object.defineProperty(Navigator.prototype, 'standalone', { get: () => true, configurable: true })
      const mm = window.matchMedia.bind(window)
      window.matchMedia = q =>
        /display-mode:\s*standalone/.test(q)
          ? { matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }
          : mm(q)
    }
    /** L'annonce d'installation de Chrome, imitée : compte les fenêtres d'installation ouvertes, puis l'installation (ou son refus) */
    const OFFER = outcome => {
      window.__prompts = 0
      addEventListener('load', () =>
        setTimeout(() => {
          let choose
          const e = new Event('beforeinstallprompt', { cancelable: true })
          e.userChoice = new Promise(r => (choose = r))
          e.prompt = async () => {
            window.__prompts++
            choose({ outcome })
            if (outcome === 'accepted') setTimeout(() => dispatchEvent(new Event('appinstalled')), 50)
          }
          dispatchEvent(e)
          window.__prevented = e.defaultPrevented
        }, 30),
      )
    }
    // 22 réponses rapides (une approche d'accord par question), la feuille d'un visiteur ordinaire
    const instAnswers = Object.fromEntries(
      pack.bank.questions.filter(q => q.tier === 'essentiel').map((q, i) => [q.id, { ratings: { [q.approaches[i % q.approaches.length].id]: 1 }, redLines: [] }]),
    )
    const now = new Date().toISOString()
    const instState = JSON.stringify({ format: 3, electionId: entry.id, dataVersion: pack.election.dataVersion, seed: '0123456789abcdef', answers: instAnswers, weights: {}, deepTopics: [], lastSeenRanking: null, dataUpdatedFrom: null, essentialDoneAt: now, updatedAt: now })
    const N_ANSWERS = Object.keys(instAnswers).length
    const instForeign = []
    const instCsp = []
    const contexts = []
    /** Un appareil imité, chargé en ligne (sa copie hors ligne s'installe), puis coupé du réseau */
    const imitate = async (ua, { width = 375, height = 812, standalone = false, offer = false, filled = false, zoom = 100, mobile = width < 768, offline = true } = {}) => {
      const c = await browser.newContext({ viewport: { width, height }, userAgent: ua, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', permissions: ['clipboard-read', 'clipboard-write'] })
      contexts.push(c)
      await c.addInitScript(() => {
        window.__csp = []
        addEventListener('securitypolicyviolation', e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
      })
      if (standalone) await c.addInitScript(STANDALONE)
      if (offer) await c.addInitScript(OFFER, offer === true ? 'accepted' : offer)
      if (filled) await c.addInitScript(([k, s]) => localStorage.getItem(k) || localStorage.setItem(k, s), [STORAGE, instState])
      if (zoom !== 100) await c.addInitScript(z => document.addEventListener('DOMContentLoaded', () => (document.documentElement.style.fontSize = `${z}%`)), zoom)
      const p = await c.newPage()
      p.on('request', r => {
        const u = r.url()
        if (!u.startsWith(base) && !u.startsWith('blob:') && !u.startsWith('data:')) instForeign.push(u)
      })
      await p.goto(HOME)
      await p.evaluate(() => navigator.serviceWorker.ready)
      await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 5000 }).catch(() => null)
      if (offline) await c.setOffline(true)
      return p
    }
    const visit = async (p, path) => {
      await p.goto(U(path))
      await p.locator('main h1').first().waitFor()
      await p.evaluate(() => document.fonts.ready)
      await p.waitForTimeout(250)
    }
    /** Ce que montre la page « Installer l'application » */
    const installInfo = p =>
      p.evaluate(() => {
        const t = el => (el?.textContent ?? '').replace(/\u00ad/g, '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim()
        const first = document.querySelector('.install-main > .install-section')
        const visible = el => el.checkVisibility()
        return {
          h1: t(document.querySelector('main h1')),
          // innerText : la version du système, sur sa ligne, se lit séparée du nom
          device: (document.querySelector('.install-device-value')?.innerText ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim(),
          other: !!document.querySelector('.install-device button'),
          steps: first?.querySelectorAll('.install-steps > li').length ?? 0,
          say: t(first?.querySelector('.install-say')),
          copy: [...(first?.querySelectorAll('.btn-primary') ?? [])].map(t).join(' | '),
          primaries: [...document.querySelectorAll('main .btn-primary:not(.is-outline)')].filter(visible).length,
          native: t(document.querySelector('.install-native .btn-primary')),
          noTransfer: [...document.querySelectorAll('.how-to summary')].some(s => /Ne rien transf/.test(s.textContent)),
          why: !!document.getElementById('pourquoi-t'),
          others: [...document.querySelectorAll('.install-others .other-name')].map(t),
          open: [...document.querySelectorAll('.install-others details[open] .other-name')].map(t),
          othersTitle: t(document.getElementById('autres-t')),
          foot: document.querySelector(`.site-foot a[href$="/installer"]`)?.getAttribute('aria-current') ?? (document.querySelector('.site-foot a[href$="/installer"]') ? 'lien' : 'aucun'),
          wide: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          // Les symboles des menus (« ⋮ », « ≡ », « ••• », « … ») lus tels quels par un lecteur d'écran : hors d'un aria-hidden
          // et d'un schéma (titré et décrit en mots) ; et leurs noms en mots, dits aux lecteurs d'écran
          bareSymbols: (() => {
            const out = []
            const w = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT)
            for (let n = w.nextNode(); n; n = w.nextNode()) {
              if (!/[•⋮≡]|«\u00a0…\u00a0»/.test(n.data) || n.parentElement.closest('svg, [aria-hidden="true"]')) continue
              out.push(n.data.trim().slice(0, 30))
            }
            return out
          })(),
          spokenSymbols: [...document.querySelectorAll('main .sr-only')].filter(x => /^le bouton à trois/.test(x.textContent)).length,
          // La feuille de la page (chargée avec elle) : les gestes ont leurs filets
          styled: !!first?.querySelector('.install-steps') && parseFloat(getComputedStyle(first.querySelector('.install-steps')).borderTopWidth) > 0,
          // Le texte des schémas, à sa taille réelle (le schéma rétrécit avec sa colonne)
          dgMin: Math.min(
            ...[...document.querySelectorAll('.step-dg text, .install-figure .diagram text')].map(x => {
              const svg = x.ownerSVGElement
              return parseFloat(getComputedStyle(x).fontSize) * (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width)
            }),
          ),
        }
      })
    const ALL_GUIDES = 13

    // iPhone, Safari d'iOS 26, 22 réponses : copier d'abord
    const sp = await imitate(UA.ios26, { filled: true })
    await visit(sp, '/installer')
    const a = await installInfo(sp)
    check(
      a.h1 === 'Installer l’application' && a.device === 'iPhone, avec Safari iOS 26' && a.steps === 7 && a.copy === 'Copier le code' && a.primaries === 1 && !a.native && a.noTransfer && a.why,
      `installer, iPhone avec Safari d’iOS 26 : « ${a.device} », ${a.steps} gestes dont « ${a.copy} » d’abord (le seul aplat bleu : ${a.primaries}), « Ne rien transférer ? », « Pourquoi copier d’abord ? »`,
    )
    check(a.others.length === ALL_GUIDES - 1 && !a.others.includes('iPhone ou iPad, avec Safari (iOS 26)') && a.foot === 'page', `installer : la liste des autres appareils sans le sien (${a.others.length}), la ligne du pied marquée (${a.foot})`)
    check(a.wide <= 0 && a.dgMin >= 11.9, `installer, 375 px : rien sur le côté (${a.wide} px), texte des schémas à ${a.dgMin.toFixed(1)} px au moins`)
    check(a.styled, 'installer : la feuille de la page vient avec elle, hors ligne (les gestes ont leurs filets)')
    check(a.bareSymbols.length === 0 && a.spokenSymbols >= 3, `installer, iPhone : aucun symbole de menu sans son nom en mots (${a.bareSymbols.join(' | ') || 'aucun'}), ${a.spokenSymbols} noms dits aux lecteurs d’écran`)
    // « Autre appareil ? » : la liste, sans changer d'adresse
    const hashBefore = hashOf(sp)
    await sp.getByRole('button', { name: 'Autre appareil ?' }).click()
    await sp.waitForTimeout(200)
    const jumped = await sp.evaluate(() => ({ id: document.activeElement?.id, top: Math.round(document.getElementById('autres').getBoundingClientRect().top) }))
    check(hashOf(sp) === hashBefore && jumped.id === 'autres' && jumped.top >= 0 && jumped.top < 200, `installer : « Autre appareil ? » mène à la liste (focus ${jumped.id}, à ${jumped.top} px du haut) sans changer d’adresse (${hashOf(sp)})`)
    // « Copier le code », dans le geste même
    await sp.getByRole('button', { name: 'Copier le code' }).click()
    await sp.locator('.step-status').filter({ hasText: 'Code copié' }).waitFor({ timeout: 2000 }).catch(() => null)
    const copied = flat(await sp.locator('.step-status').first().textContent())
    const code = await sp.evaluate(() => navigator.clipboard.readText())
    check(copied === 'Code copié. Passez au geste 2.' && /^[0-9A-Z]{30,}$/.test(code), `installer : « Copier le code » met le code dans le presse-papiers hors ligne (« ${copied} », ${code.length} caractères)`)
    // Le lien discret sous « Et maintenant », et le manifeste gardé hors ligne
    await visit(sp, '/resultats')
    const nextInstall = await sp.locator('.next-block .next-install a').getAttribute('href').catch(() => null)
    const manifest = await sp.evaluate(async () => {
      const r = await caches.match('./manifest.webmanifest')
      return r ? r.json() : null
    })
    check(nextInstall === L('/installer'), `installer : un lien discret sous « Et maintenant » (${nextInstall})`)
    check(manifest?.display === 'standalone' && manifest?.start_url === './' && manifest?.icons?.some(i => i.purpose === 'maskable'), `installer : le manifeste est dans la copie hors ligne (display ${manifest?.display}, start_url ${manifest?.start_url}, icône maskable)`)

    // 320 px, texte à 200 % : rien ne défile sur le côté. En ligne : hors ligne, le rideau « Isoloir fermé » de l'en-tête
    // dépasse lui-même à cette taille, sur toutes les pages (à reprendre à part)
    const zp = await imitate(UA.ios26, { width: 320, height: 740, filled: true, zoom: 200, offline: false })
    await visit(zp, '/installer')
    const z = await installInfo(zp)
    check(z.wide <= 0 && z.steps === 7, `installer, 320 px texte à 200 % : rien sur le côté (${z.wide} px)`)

    // iPhone, Safari d'iOS 18 : sa propre suite, sans le réglage d'iOS 26
    const s18 = await imitate(UA.ios18, { filled: true })
    await visit(s18, '/installer')
    const b18 = await installInfo(s18)
    check(b18.device === 'iPhone, avec Safari iOS 18' && b18.steps === 6 && !b18.noTransfer && b18.why, `installer, iPhone avec Safari d’iOS 18 : ${b18.steps} gestes, sans « Ne rien transférer ? » (« ${b18.device} »)`)

    // iPhone, sans réponse : ni copie, ni aplat bleu (rien ne s'installe par un bouton sur iPhone)
    const se = await imitate(UA.ios26)
    await visit(se, '/installer')
    const e0 = await installInfo(se)
    check(e0.steps === 5 && !e0.copy && e0.primaries === 0 && !e0.why && /^Pas encore de réponses ici/.test(e0.say), `installer, iPhone sans réponse : ${e0.steps} gestes, aucun aplat bleu, « ${e0.say.slice(0, 40)}… »`)

    // Android, Chrome : le bouton à l'annonce du navigateur, jamais d'invite de lui-même
    const ap = await imitate(UA.android, { filled: true, offer: true })
    await visit(ap, '/installer')
    await ap.locator('.install-native .btn-primary').waitFor({ timeout: 3000 }).catch(() => null)
    const an = await installInfo(ap)
    const before = await ap.evaluate(() => ({ prompts: window.__prompts, prevented: window.__prevented }))
    // Au clavier : le bouton s'en va après la fenêtre du navigateur, le focus passe au statut (jamais à la page entière)
    await ap.locator('.install-native .btn-primary').focus().catch(() => null)
    await ap.keyboard.press('Enter')
    await ap.locator('.install-native-done').waitFor({ timeout: 3000 }).catch(() => null)
    await ap.waitForTimeout(150)
    const after = await ap.evaluate(() => ({
      prompts: window.__prompts,
      done: (document.querySelector('.install-native-done')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      status: !!document.querySelector('.install-native [role="status"] .install-native-done'),
      focus: !!document.activeElement?.classList.contains('install-native-done'),
    }))
    const follow = flat(await ap.locator('#reponses-t + .install-say').textContent().catch(() => ''))
    check(an.device === 'Android, avec Chrome' && an.native === 'Installer Isoloir' && an.steps === 3 && !an.copy.includes('Copier') && an.primaries === 1, `installer, Android avec Chrome : le bouton « ${an.native} », le menu en ${an.steps} gestes, pas de copie`)
    check(before.prevented === true && before.prompts === 0 && after.prompts === 1 && /^Isoloir est installé/.test(after.done), `installer, Android : aucune invite du navigateur avant le geste (${before.prompts}), une au toucher (${after.prompts}), puis « ${after.done} »`)
    check(after.status && after.focus, `installer, Android : « Isoloir est installé » dans le statut toujours présent, et le focus y passe (${after.focus})`)
    // Installation annulée : le statut le dit, le focus y passe, le chemin par le menu reste
    const ad = await imitate(UA.android, { filled: true, offer: 'dismissed' })
    await visit(ad, '/installer')
    await ad.locator('.install-native .btn-primary').waitFor({ timeout: 3000 }).catch(() => null)
    await ad.locator('.install-native .btn-primary').focus().catch(() => null)
    await ad.keyboard.press('Enter')
    await ad.locator('.install-native-status').waitFor({ timeout: 3000 }).catch(() => null)
    await ad.waitForTimeout(150)
    const dismissed = await ad.evaluate(() => ({
      status: (document.querySelector('.install-native [role="status"]')?.textContent ?? '').trim(),
      focus: !!document.activeElement?.classList.contains('install-native-status'),
      button: !!document.querySelector('.install-native .btn-primary'),
      menu: document.querySelectorAll('.install-main .install-steps > li').length,
    }))
    check(/^Installation annulée/.test(dismissed.status) && dismissed.focus && !dismissed.button && dismissed.menu === 3, `installer, Android, installation annulée : « ${dismissed.status} », le focus sur le statut (${dismissed.focus}), le menu en ${dismissed.menu} gestes`)
    check(follow.includes(`vos ${N_ANSWERS} réponses y sont`), `installer, Android : « Vos réponses vous suivent » (« ${follow.slice(-40)} »)`)

    // Ordinateur, Chrome, 1 280 px : deux colonnes, et le QR code de la seule adresse de la page
    const dp = await imitate(UA.desk, { width: 1280, height: 900, filled: true, offer: true })
    await visit(dp, '/installer')
    await dp.locator('.install-phone svg.qr path').waitFor({ timeout: 3000 }).catch(() => null)
    const dk = await installInfo(dp)
    const desk = await dp.evaluate(() => {
      const intro = document.querySelector('.install-intro').getBoundingClientRect()
      const main = document.querySelector('.install-main').getBoundingClientRect()
      return { columns: intro.right <= main.left + 1 && Math.abs(intro.top - main.top) < 80, d: document.querySelector('.install-phone svg.qr path')?.getAttribute('d') ?? '' }
    })
    // Le même dessin que la page, fait ici à partir de l'adresse attendue (et d'elle seule)
    const rows = encodeQR(`${base}${L('/installer')}`, 'raw', { ecc: 'medium', border: 2 })
    let wantD = ''
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (!row[x]) continue
        const start = x
        while (row[x + 1]) x++
        wantD += `M${start} ${y}h${x + 1 - start}v1h${start - x - 1}z`
      }
    })
    check(dk.device === 'Ordinateur, avec Chrome' && desk.columns && dk.native === 'Installer Isoloir' && dk.wide <= 0, `installer, ordinateur avec Chrome à 1 280 px : deux colonnes (${desk.columns}), « ${dk.native} », rien sur le côté (${dk.wide} px)`)
    check(!!desk.d && desk.d === wantD, `installer, ordinateur : le QR code porte l’adresse de la page, ${base}${L('/installer')}, et rien d’autre`)
    check(dk.bareSymbols.length === 0 && dk.spokenSymbols >= 3, `installer, ordinateur : aucun symbole de menu sans son nom en mots (${dk.bareSymbols.join(' | ') || 'aucun'})`)
    // Un texte sans rapport collé dans le champ, effacé, puis le code tapé : Isoloir ne vide pas le presse-papiers
    await dp.goto(U('/autre-appareil/importer'))
    await dp.locator('#transfer-code').waitFor()
    await dp.evaluate(() => navigator.clipboard.writeText('mon mot de passe'))
    await dp.locator('#transfer-code').focus()
    await dp.keyboard.press('ControlOrMeta+V')
    await dp.keyboard.press('ControlOrMeta+A')
    await dp.keyboard.press('Backspace')
    await dp.locator('#transfer-code').fill(code)
    await dp.getByRole('button', { name: 'Lire ce code' }).click()
    const foundDesk = await heading(dp, 'Réponses trouvées')
    const deskClear = await dp.locator('.notice').filter({ hasText: 'Isoloir videra aussi le presse-papiers.' }).count()
    await dp.getByRole('button', { name: 'Remplacer mes réponses' }).click()
    await dp.waitForTimeout(200)
    const deskClip = await dp.evaluate(() => navigator.clipboard.readText())
    check(foundDesk && deskClear === 0 && deskClip === 'mon mot de passe', `installer, import : un texte collé puis effacé, le code tapé, le presse-papiers reste intact (« ${deskClip} »)`)

    // Windows, Firefox : son application n'a pas « Coller le code » ; la page dit de coller le code dans le champ, et son
    // import l'a bien (« Coller ou taper le code », « Lire ce code ») ; ouverte vide, elle dit comment les faire passer
    const wf = await imitate(UA.winFirefox, { width: 1280, height: 900, filled: true })
    await visit(wf, '/installer')
    const wfInfo = await installInfo(wf)
    const wfApp = await imitate(UA.winFirefox, { width: 1280, height: 900, standalone: true })
    await visit(wfApp, '/installer')
    const wfEmpty = await wfApp.evaluate(() => ({
      title: (document.getElementById('reponses-t')?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').trim(),
      link: document.querySelector('.install-main .btn-primary')?.getAttribute('href') ?? null,
    }))
    await wfApp.goto(U('/autre-appareil/importer'))
    await wfApp.locator('.transfer-ways').waitFor()
    const wfImport = await wfApp.evaluate(() => ({
      ways: [...document.querySelectorAll('.transfer-ways .way h3')].map(h => h.textContent.trim()),
      buttons: [...document.querySelectorAll('.transfer-ways button')].map(b => b.textContent.trim()),
    }))
    const wfSteps = flat(await wf.locator('.install-main .install-steps').first().textContent())
    check(
      wfInfo.steps === 3 && wfSteps.includes('« Coller ou taper le code »') && wfSteps.includes('« Lire ce code »') && !wfSteps.includes('« Coller le code »') && wfImport.ways.includes('Coller ou taper le code') && wfImport.buttons.includes('Lire ce code') && !wfImport.buttons.includes('Coller le code'),
      `installer, Windows avec Firefox : la page dit de coller le code dans « Coller ou taper le code », puis « Lire ce code », comme son application les montre (${wfImport.ways.join(', ')})`,
    )
    check(wfEmpty.title === 'Vos réponses sont restées dans Firefox ?' && wfEmpty.link === L('/autre-appareil/importer'), `installer, Windows avec Firefox, application ouverte vide : « ${wfEmpty.title} », « Importer mes réponses » (${wfEmpty.link})`)
    // Instagram : cette fenêtre ne sait pas installer, le chapeau le dit comme la section
    const ig = await imitate(UA.instagram)
    await visit(ig, '/installer')
    const igLede = flat(await ig.locator('.install-intro .lede').textContent())
    check(/^Cette fenêtre ne sait pas installer/.test(igLede) && !/depuis cette page/.test(igLede), `installer, Instagram : « ${igLede.slice(0, 60)}… »`)

    // Appareil non reconnu : la liste ouverte sur « Autre navigateur »
    const op = await imitate(UA.opera)
    await visit(op, '/installer')
    const o = await installInfo(op)
    check(/^Non reconnu\b/.test(o.device) && !o.other && o.othersTitle === 'Choisissez votre appareil' && o.others.length === ALL_GUIDES && o.open.length === 1 && /^Autre navigateur/.test(o.open[0]), `installer, appareil non reconnu : « ${o.othersTitle} », ${o.others.length} appareils, « ${o.open[0]} » ouvert`)

    // L'application installée sur iPhone, ouverte vide, hors ligne
    const app = await imitate(UA.iosApp, { standalone: true })
    await app.goto(HOME)
    await app.locator('main h1').first().waitFor({ state: 'attached' })
    await app.waitForTimeout(300)
    const welcome = await app.evaluate(() => ({
      shown: !!document.querySelector('.app-welcome'),
      title: (document.querySelector('.app-welcome-title')?.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').trim(),
      primary: document.querySelector('.app-welcome .btn-primary')?.getAttribute('href') ?? null,
      how: [...document.querySelectorAll('.app-welcome a.btn-text')].map(x => x.getAttribute('href')),
      quiet: !!document.querySelector('.header-cta.is-outline'),
      foot: !!document.querySelector('.site-foot a[href$="/installer"]'),
    }))
    check(
      welcome.shown && welcome.title === 'Vous aviez déjà répondu ?' && welcome.primary === L('/autre-appareil/importer') && welcome.how.includes(L('/installer')) && welcome.quiet,
      `installer, application ouverte vide : l’avis « ${welcome.title} », « Importer mes réponses » (${welcome.primary}), « Comment faire », l’appel de l’en-tête au trait (${welcome.quiet})`,
    )
    check(!welcome.foot, `installer, application : pas de ligne « Installer l’application » au pied`)
    await visit(app, '/installer')
    const inApp = await installInfo(app)
    check(inApp.h1 === 'Isoloir est installé' && inApp.device === 'iPhone, dans l’application' && inApp.steps === 2 && inApp.others.length === ALL_GUIDES && inApp.foot === 'aucun', `installer, dans l’application : « ${inApp.h1} », « ${inApp.device} », ${inApp.steps} gestes pour faire passer les réponses`)
    // L'import ouvre sur « Coller le code » ; le code copié dans Safari donne les mêmes réponses ; le presse-papiers est vidé
    await app.goto(U('/autre-appareil/importer'))
    await app.locator('.transfer-ways').waitFor()
    const ways = await app.evaluate(() => ({
      first: document.querySelector('.transfer-ways > li .way h3')?.textContent ?? '',
      firstPrimary: !!document.querySelector('.transfer-ways > li:first-child .btn-primary'),
      camera: document.querySelector('.transfer-ways > li:nth-child(2) button')?.className ?? '',
    }))
    // Un presse-papiers sans code (une adresse, un mot) : la page le dit, sans parler d'un code mal tapé
    await app.evaluate(() => navigator.clipboard.writeText('https://exemple.fr/'))
    await app.getByRole('button', { name: 'Coller le code' }).click()
    await app.waitForTimeout(200)
    const notCode = flat(await app.locator('.transfer-ways > li:first-child [role="status"]').textContent())
    check(/^Le presse-papiers ne contient pas de code Isoloir\. Dans le navigateur où vous aviez répondu/.test(notCode), `installer, application : un presse-papiers sans code, « ${notCode.slice(0, 60)}… »`)
    await app.evaluate(t => navigator.clipboard.writeText(t), code)
    await app.getByRole('button', { name: 'Coller le code' }).focus()
    await app.keyboard.press('Enter')
    const foundApp = await heading(app, 'Réponses trouvées')
    const foundFocus = await app.waitForFunction(() => document.activeElement?.id === 'receive-title', null, { timeout: 1000 }).then(() => true, () => false)
    check(foundFocus, 'installer, application : le focus passe à « Réponses trouvées » (le bouton qui a lu le code n’est plus là)')
    const willClear = await app.locator('.notice').filter({ hasText: 'Isoloir videra aussi le presse-papiers.' }).count()
    await app.getByRole('button', { name: 'Importer ces réponses' }).click()
    await app.waitForFunction(h => location.hash === h, L('/resultats'), { timeout: 3000 }).catch(() => null)
    await app.waitForTimeout(200)
    const gotApp = await app.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE)
    const clip = await app.evaluate(() => navigator.clipboard.readText())
    const sameAnswers = JSON.stringify(Object.keys(gotApp.answers ?? {}).sort()) === JSON.stringify(Object.keys(instAnswers).sort())
    check(ways.first === 'Coller le code' && ways.firstPrimary && ways.camera === 'btn-text', `installer, import dans l’application : « ${ways.first} » d’abord, en aplat bleu ; la caméra au trait`)
    check(foundApp && willClear === 1 && hashOf(app) === L('/resultats') && sameAnswers && clip === '', `installer, application : le code collé, ${Object.keys(gotApp.answers ?? {}).length} réponses importées hors ligne, presse-papiers vidé (« ${clip} »)`)
    await app.goto(HOME)
    await app.waitForTimeout(300)
    check((await app.locator('.app-welcome').count()) === 0, 'installer, application : l’avis disparaît une fois les réponses importées')
    // L'avis à 320 px, texte à 200 % : « Importer mes réponses » garde ses mots entiers (en ligne, comme plus haut)
    const az = await imitate(UA.iosApp, { standalone: true, width: 320, height: 740, zoom: 200, offline: false })
    await az.goto(HOME)
    await az.locator('.app-welcome').waitFor({ timeout: 3000 }).catch(() => null)
    const azCut = await az.evaluate(() => {
      const out = []
      const b = document.querySelector('.app-welcome .btn-primary')
      if (!b) return ['(absent)']
      const w = document.createTreeWalker(b, NodeFilter.SHOW_TEXT)
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        for (const m of n.data.matchAll(/\S+/g)) {
          const r = document.createRange()
          r.setStart(n, m.index)
          r.setEnd(n, m.index + m[0].length)
          if (new Set([...r.getClientRects()].filter(x => x.width > 0).map(x => Math.round(x.top))).size > 1) out.push(m[0])
        }
      }
      return out
    })
    check(azCut.length === 0, `installer, avis de l’application à 320 px texte à 200 % : « Importer mes réponses » sans mot coupé (${azCut.join(', ') || 'aucun'})`)
    // « Je n'avais pas répondu » : l'avis se ferme, l'appel de l'en-tête reprend l'aplat, et c'est retenu
    const fresh = await imitate(UA.iosApp, { standalone: true })
    await fresh.goto(HOME)
    await fresh.locator('.app-welcome').waitFor({ timeout: 3000 }).catch(() => null)
    await fresh.getByRole('button', { name: 'Je n’avais pas répondu' }).click()
    await fresh.waitForTimeout(200)
    const closedNow = await fresh.evaluate(() => ({ gone: !document.querySelector('.app-welcome'), quiet: !!document.querySelector('.header-cta.is-outline'), focus: !!document.activeElement?.classList.contains('header-cta'), kept: localStorage.getItem('isoloir:accueil-application') }))
    await fresh.reload()
    await fresh.waitForTimeout(400)
    const stillClosed = (await fresh.locator('.app-welcome').count()) === 0
    check(closedNow.gone && !closedNow.quiet && closedNow.focus && closedNow.kept === 'ferme' && stillClosed, `installer, « Je n’avais pas répondu » : l’avis se ferme, l’appel de l’en-tête reprend l’aplat et le focus, retenu après rechargement (${closedNow.kept})`)
    // Un navigateur ordinaire, sans réponse : ni avis, la ligne du pied
    const plain = await imitate(UA.android)
    await plain.goto(HOME)
    await plain.locator('main h1').first().waitFor({ state: 'attached' })
    await plain.waitForTimeout(300)
    check((await plain.locator('.app-welcome').count()) === 0 && (await plain.locator('.site-foot a[href$="/installer"]').count()) === 1, 'installer, navigateur sans réponse : pas d’avis, la ligne « Installer l’application » au pied')

    for (const c of contexts) for (const pg of c.pages()) instCsp.push(...((await pg.evaluate(() => window.__csp).catch(() => [])) ?? []))
    check(instForeign.length === 0 && instCsp.length === 0, `installer : aucune requête hors du site ni violation de la CSP, sur ${contexts.length} appareils imités (${[...instForeign, ...instCsp].slice(0, 3).join(', ') || 'aucune'})`)
    for (const c of contexts) await c.close()
  }
} finally {
  await browser?.close()
  stopServer()
}
if (failures.length) {
  console.error(`\n${failures.length} échec(s)`)
  process.exitCode = 1
} else console.log(`\nFermez l’isoloir : tout marche hors ligne (${entry.id}${prefix ? `, #/${prefix}/…` : ''}).`)
