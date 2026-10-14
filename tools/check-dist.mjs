// Vérifie le build : CSP présente et stricte, aucune API d'envoi réseau dans le code livré, rien de la primaire
// « Choisir 2027 » (retirée du site) ni portrait d'un candidat masqué, voix des vidéos servies par le site et hors de
// la copie hors ligne.
// Lancé automatiquement après `pnpm build`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = 'dist'
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const fail = msg => {
  console.error(`✗ ${msg}`)
  process.exitCode = 1
}
const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1]
if (!csp) fail('CSP absente de dist/index.html')
else {
  for (const d of ["default-src 'none'", "connect-src 'none'", "script-src 'self'", "worker-src 'self'", "base-uri 'none'", "form-action 'none'"]) {
    if (!csp.includes(d)) fail(`directive manquante : ${d}`)
  }
  // Les sons (voix des vidéos) ne viennent que du site : media-src 'self', et rien d'autre
  const media = csp.split(';').map(d => d.trim()).find(d => d.startsWith('media-src'))
  if (media && media !== "media-src 'self'") fail(`media-src trop large : ${media}`)
}
if (/https?:\/\/(?!www\.w3\.org)/.test(html.replace(/<meta[^>]+>/g, ''))) fail('URL externe dans index.html')

const FORBIDDEN = [/navigator\.sendBeacon/, /RTCPeerConnection/, /new WebSocket/, /XMLHttpRequest/, /EventSource/, /\bfetch\(/, /importScripts/]
for (const f of readdirSync(join(dist, 'assets')).filter(f => f.endsWith('.js'))) {
  const js = readFileSync(join(dist, 'assets', f), 'utf8')
  for (const re of FORBIDDEN) if (re.test(js)) fail(`${f} contient ${re}`)
  // L'élection factice de 20 candidats (tests/fixtures/many-candidates.ts, #/essai-20/) ne sert qu'au serveur de
  // développement : ni son entrée de registre ni ses données n'entrent dans le build
  if (/many-candidates|['"`]essai-20['"`]|Esquisse-Montclar/.test(js)) fail(`${f} contient l’élection factice de développement (#/essai-20/)`)
  // La primaire « Choisir 2027 », retirée du site le 12 octobre 2026 : ni son pack (une note qui n'est qu'à elle),
  // ni la page des archives, ni le lien « Élections passées », ni l'encart de l'accueil
  if (/Le troisième débat télévisé|Élections passées|archive-callout/.test(js)) fail(`${f} contient la primaire « Choisir 2027 » ou ses pages (archives, encart de l’accueil)`)
}
// Son fichier à part (src/elections/choisir-2027) n'est plus produit, ni gardé par le service worker
for (const f of readdirSync(join(dist, 'assets'))) if (/choisir-2027/.test(f)) fail(`assets/${f} : fichier de la primaire « Choisir 2027 », retirée du site`)
for (const f of readdirSync(join(dist, 'assets')).filter(f => f.endsWith('.css'))) {
  const css = readFileSync(join(dist, 'assets', f), 'utf8')
  if (/url\(\s*['"]?https?:/.test(css)) fail(`${f} charge une ressource externe`)
  if (/archive-callout/.test(css)) fail(`${f} garde le style de l’encart de la primaire (.archive-callout)`)
}
// Le service worker ne doit que servir les fichiers du site : aucune adresse, aucun envoi, aucun stockage
const sw = readFileSync(join(dist, 'sw.js'), 'utf8')
const swCode = sw.replace(/^\s*\/\/.*$/gm, '')
if (/https?:|\/\/\w/.test(swCode)) fail('sw.js contient une adresse')
for (const re of [/sendBeacon/, /XMLHttpRequest/, /WebSocket/, /EventSource/, /importScripts/, /postMessage/, /RTCPeerConnection/, /indexedDB/, /localStorage/, /cache\.put/]) {
  if (re.test(swCode)) fail(`sw.js contient ${re}`)
}
const fetches = swCode.match(/\bfetch\([^)]*\)/g) ?? []
if (fetches.length !== 1 || fetches[0] !== 'fetch(request)') fail(`sw.js : seul fetch(request), la requête de la page elle-même, est permis (${fetches.join(', ')})`)
if (!/request\.method !== 'GET' \|\| new URL\(request\.url\)\.origin !== self\.location\.origin/.test(swCode)) fail('sw.js ne se limite pas aux requêtes GET du site')
const listed = JSON.parse(sw.match(/const FILES = (\[.*\])/)?.[1] ?? '[]')
if (listed.some(f => /choisir-2027/.test(f))) fail('sw.js garde un fichier de la primaire « Choisir 2027 »')
for (const f of readdirSync(join(dist, 'assets'))) if (!listed.includes(`./assets/${f}`)) fail(`sw.js ne garde pas assets/${f} pour le hors-ligne`)

// Voix des vidéos (public/videos/audio/<voix>/<vidéo>/<passage>.m4a, <voix> : aigue, la voix aiguë, la seule
// depuis le retrait de la voix grave, comme VOICE_IDS et audioPath() de src/ui/videos/audio.ts) : des fichiers AAC dans un conteneur
// MP4 seulement, jamais dans la copie hors ligne (trop lourds) ; chaque fichier inscrit à l'inventaire (src/ui/videos/audio-files.json,
// { voices: { <voix>: { <vidéo>: { <passage>: { file, duration, hash } } } } }) est livré, à sa place
const VOICES = ['aigue']
const audioDir = join(dist, 'videos', 'audio')
const audioFiles = existsSync(audioDir)
  ? readdirSync(audioDir, { recursive: true })
      .map(f => String(f).split('\\').join('/'))
      .filter(f => !f.split('/').pop().startsWith('.') && statSync(join(audioDir, f)).isFile())
  : []
const AUDIO_PATH = new RegExp(`^(?:${VOICES.join('|')})/[a-z0-9-]+/[a-z0-9-]+\\.m4a$`)
for (const f of audioFiles) {
  if (!AUDIO_PATH.test(f)) {
    fail(`videos/audio/${f} : seuls des fichiers <voix>/<vidéo>/<passage>.m4a sont attendus (voix : ${VOICES.join(', ')})`)
    continue
  }
  // Conteneur MP4 : la boîte « ftyp » ouvre le fichier (octets 4 à 8)
  const head = readFileSync(join(audioDir, f)).subarray(4, 8).toString('latin1')
  if (head !== 'ftyp') fail(`videos/audio/${f} : pas un fichier MP4/AAC (en-tête « ${head} »)`)
}
if (listed.some(f => f.startsWith('./videos/'))) fail('sw.js garde des fichiers de public/videos/ dans la copie hors ligne')
const inventory = JSON.parse(readFileSync('src/ui/videos/audio-files.json', 'utf8'))
const shipped = new Set(audioFiles.map(f => f.replace(/\.m4a$/, '')))
const inscribed = new Set()
for (const [voice, videos] of Object.entries(inventory.voices ?? {})) {
  if (!VOICES.includes(voice)) fail(`audio-files.json : voix inconnue « ${voice} »`)
  for (const [video, segments] of Object.entries(videos ?? {})) {
    for (const [segment, entry] of Object.entries(segments ?? {})) {
      const key = `${voice}/${video}/${segment}`
      inscribed.add(key)
      if (entry?.file !== `videos/audio/${key}.m4a`) fail(`audio-files.json : ${key} inscrit ailleurs que sa place (${entry?.file})`)
      if (!shipped.has(key)) fail(`voix inscrite mais absente du build : videos/audio/${key}.m4a`)
    }
  }
}

// JS initial : le code que toute visite exécute à l'ouverture (le script de la page et ce qu'il importe
// statiquement). Les données des élections (questions, positions, candidats) n'y sont pas : chacune est un
// fichier à part, chargé à la demande (src/elections/index.ts) ; celle de l'élection par défaut est
// préchargée par la page (modulepreload), en parallèle.
// Budget : 241,7 ko mesurés le 6 octobre 2026, après la sortie des données (909 ko avant), plus 15 % de marge.
// Le 14 octobre 2026, la sortie des notices et de « Partager » (src/ui/screens/load.ts) l'a ramené de 276,7 à 206,6 ko.
// Le dépasser, c'est d'abord se demander ce qui est entré dans le code de toutes les visites, avant de relever le plafond.
const INITIAL_JS_BUDGET = 278_000
const entry = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/)?.[1]
const initial = []
const visitJs = file => {
  if (initial.includes(file) || !existsSync(join(dist, file))) return
  initial.push(file)
  const code = readFileSync(join(dist, file), 'utf8')
  // Imports statiques seulement (« from"./x.js" », « import"./x.js" ») : un import() est chargé à la demande
  for (const m of code.matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)) visitJs(join('assets', m[1]))
}
if (!entry) fail('script principal introuvable dans dist/index.html')
else visitJs(entry)
const initialBytes = initial.reduce((t, f) => t + statSync(join(dist, f)).size, 0)
if (initialBytes > INITIAL_JS_BUDGET) {
  fail(`JS initial de ${(initialBytes / 1000).toFixed(1)} ko (${initial.join(', ')}) : budget de ${INITIAL_JS_BUDGET / 1000} ko dépassé`)
}
// Le dépouillement en PDF (src/core/reportPdf.ts et son moteur, src/core/pdf/) : un fichier à part, chargé à la
// demande par import() (src/ui/report/load.ts), jamais dans le JS initial ; écrivain, largeurs et textes tiennent
// dans un plafond raisonnable
const REPORT_BUDGET = 80_000
const reportChunks = readdirSync(join(dist, 'assets')).filter(f => /^reportPdf-[\w-]+\.js$/.test(f))
if (reportChunks.length !== 1) fail(`dépouillement en PDF : ${reportChunks.length} fichier(s) assets/reportPdf-*.js, un attendu`)
for (const f of reportChunks) {
  if (initial.includes(join('assets', f))) fail(`dépouillement en PDF : assets/${f} est dans le JS initial (il doit n'être chargé que par import())`)
  const size = statSync(join(dist, 'assets', f)).size
  if (size > REPORT_BUDGET) fail(`dépouillement en PDF : assets/${f} pèse ${(size / 1000).toFixed(1)} ko, plafond de ${REPORT_BUDGET / 1000} ko`)
}
// L'image « Accords et désaccords » de « Partager » (src/core/agreeImage.ts) : un fichier à part, chargé à la demande
// par import() (src/ui/share/load.ts) quand on la choisit, jamais dans le JS initial ; elle reprend les aides de
// l'affiche, qui sont dans le fichier de « Partager »
const AGREE_BUDGET = 12_000
const agreeChunks = readdirSync(join(dist, 'assets')).filter(f => /^agreeImage-[\w-]+\.js$/.test(f))
if (agreeChunks.length !== 1) fail(`image « Accords et désaccords » : ${agreeChunks.length} fichier(s) assets/agreeImage-*.js, un attendu`)
for (const f of agreeChunks) {
  if (initial.includes(join('assets', f))) fail(`image « Accords et désaccords » : assets/${f} est dans le JS initial (il doit n'être chargé que par import())`)
  const size = statSync(join(dist, 'assets', f)).size
  if (size > AGREE_BUDGET) fail(`image « Accords et désaccords » : assets/${f} pèse ${(size / 1000).toFixed(1)} ko, plafond de ${AGREE_BUDGET / 1000} ko`)
}
// « Mon profil politique » (src/ui/screens/Profile.tsx, avec son calcul, src/core/echiquier.ts, ses mots,
// src/core/echiquierCopy.ts, et la rubrique de la Méthode qui l'explique) : un fichier à part, chargé à la demande par
// import() (src/ui/profile/load.ts), jamais dans le JS initial ni préchargé par la page. Plafond relevé de 38 à 54 ko le
// 12 octobre 2026 : la présentation « une ligne par sujet » validée par le propriétaire (src/ui/profile/Chart.tsx et
// rows.ts : l'axe, ses lignes et leurs sections, le clavier, les cases aux couleurs d'affinité) s'ajoute au tableau
// détaillé, gardé replié dessous, et à la rubrique de la Méthode, rangée là pour ne rien ajouter au code de toutes les
// visites ; le tout pèse environ 48 ko (les barres, les plis et la mise en évidence de l'axe ont disparu avec les
// symboles ▲ ▽, le 12 octobre 2026 au soir). Rien de cela ne pèse sur le JS initial, ni sur une visite qui n'ouvre pas la page
const PROFILE_BUDGET = 54_000
const profileChunks = readdirSync(join(dist, 'assets')).filter(f => /^Profile-[\w-]+\.js$/.test(f))
if (profileChunks.length !== 1) fail(`« Mon profil politique » : ${profileChunks.length} fichier(s) assets/Profile-*.js, un attendu`)
const modulePreloads = [...html.matchAll(/<link rel="modulepreload"[^>]*href="\.\/(assets\/[^"]+)"/g)].map(m => m[1])
for (const f of profileChunks) {
  if (initial.includes(join('assets', f))) fail(`« Mon profil politique » : assets/${f} est dans le JS initial (il doit n'être chargé que par import())`)
  if (modulePreloads.includes(`assets/${f}`)) fail(`« Mon profil politique » : assets/${f} est préchargé par dist/index.html`)
  const size = statSync(join(dist, 'assets', f)).size
  if (size > PROFILE_BUDGET) fail(`« Mon profil politique » : assets/${f} pèse ${(size / 1000).toFixed(1)} ko, plafond de ${PROFILE_BUDGET / 1000} ko`)
}
// Les notices (la Méthode, la Confidentialité, les Mentions légales) et « Partager » : chacun un fichier à part, chargé
// à la demande par import() (src/ui/screens/load.ts), jamais dans le JS initial ni préchargé par la page
for (const name of ['Method', 'Privacy', 'Legal', 'Share']) {
  const chunks = readdirSync(join(dist, 'assets')).filter(f => new RegExp(`^${name}-[\\w-]+\\.js$`).test(f))
  if (chunks.length !== 1) fail(`écran ${name} : ${chunks.length} fichier(s) assets/${name}-*.js, un attendu (chargé à la demande, src/ui/screens/load.ts)`)
  for (const f of chunks) {
    if (initial.includes(join('assets', f))) fail(`écran ${name} : assets/${f} est dans le JS initial (il doit n'être chargé que par import())`)
    if (modulePreloads.includes(`assets/${f}`)) fail(`écran ${name} : assets/${f} est préchargé par dist/index.html`)
  }
}
// Une seule feuille de style chargée par la page : un fichier commun que le build sortirait du script principal (en
// chargeant à part un écran qui partage avec lui des composants) emporterait leur style dans une feuille à part, posée
// avant celle de la page, et changerait l'ordre des règles
const sheets = [...html.matchAll(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/g)].map(m => m[1])
if (sheets.length !== 1) fail(`dist/index.html charge ${sheets.length} feuille(s) de style (${sheets.join(', ')}), une attendue`)
// Aucun texte de la banque dans le JS initial : ni énoncé ni approche, de chaque élection du site
// (src/elections/<id>/bank.ts) ou en préparation (research/<id>/bank.json, écrit par tools/build-pack.mjs)
const initialCode = initial.map(f => readFileSync(join(dist, f), 'utf8')).join('\n')
// « Mon profil politique » : ses entrées (l'accueil, le dépouillement, la tendance) n'emportent dans le JS initial que
// des liens, des comptes et leurs textes (core/profileAccess.ts, core/resultsCopy.ts) ; ni le calcul de la page, ni ses
// mots (core/echiquierCopy.ts), qui restent dans son fichier. Des extraits en ASCII, que la minification ne touche pas
for (const text of ['Lecture en cours, sur cet appareil', 'Pour lire plus de th', 'Pas encore assez de r', 'Choisir les th']) {
  if (initialCode.includes(text)) fail(`« Mon profil politique » : « ${text}… », un texte de la page, est dans le JS initial`)
}
const dirsOf = root => (existsSync(root) ? readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) : [])
const bankTexts = new Map() // texte → élection
for (const id of dirsOf('src/elections')) {
  const bankFile = join('src/elections', id, 'bank.ts')
  if (!existsSync(bankFile)) continue
  for (const m of readFileSync(bankFile, 'utf8').matchAll(/"(prompt|text)": ("(?:[^"\\]|\\.)*")/g)) bankTexts.set(JSON.parse(m[2]), id)
}
for (const id of dirsOf('research')) {
  const file = join('research', id, 'bank.json')
  if (!existsSync(file)) continue
  try {
    for (const q of JSON.parse(readFileSync(file, 'utf8')).bank?.questions ?? []) {
      bankTexts.set(q.prompt, id)
      for (const a of q.approaches ?? []) bankTexts.set(a.text, id)
    }
  } catch {
    console.warn(`⚠ ${file} illisible : ses textes ne sont pas cherchés dans le JS initial`)
  }
}
let prompts = 0
for (const [text, id] of bankTexts) {
  // Les textes courts (« Oui », « Non ») peuvent se trouver ailleurs dans le code : seules les phrases comptent
  if (typeof text !== 'string' || text.length < 25) continue
  prompts++
  if (initialCode.includes(text)) fail(`JS initial : contient « ${text} » (banque de ${id}), qui doit rester dans le fichier de l'élection`)
}
if (!prompts) fail('aucun texte de question trouvé dans src/elections/*/bank.ts ni research/*/bank.json : contrôle du JS initial impossible')
// L'élection par défaut (registre : « id: '…', slug: '' ») : ses données sont préchargées par la page, et la
// description de partage de la page est la sienne (copy.shareDescription de son election.ts)
const registry = readFileSync('src/elections/index.ts', 'utf8')
const defaults = [...registry.matchAll(/\bid: '([a-z0-9-]+)',\s*slug: '([^']*)'/g)].filter(m => m[2] === '').map(m => m[1])
if (defaults.length !== 1) fail(`src/elections/index.ts : ${defaults.length} élection(s) par défaut trouvée(s), une attendue`)
else {
  const id = defaults[0]
  const preloaded = [...html.matchAll(/<link rel="modulepreload"[^>]*href="\.\/(assets\/[^"]+)"/g)].map(m => m[1])
  if (!preloaded.some(f => new RegExp(`^assets/${id}-[\\w-]+\\.js$`).test(f))) fail(`les données de l’élection par défaut (${id}) ne sont pas préchargées par dist/index.html`)
  // Vite annonce lui-même les fichiers que le script principal importe directement (un fichier commun à lui et à
  // un écran chargé à la demande, comme la comparaison) : ce préchargement-là les fait venir en même temps que lui.
  // Le préchargement des données, lui, ne doit rien reprendre de ce que charge déjà le script principal.
  const direct = entry ? [...readFileSync(join(dist, entry), 'utf8').matchAll(/(?:from|import)\s*["']\.\/([^"']+\.js)["']/g)].map(m => join('assets', m[1])) : []
  if (preloaded.some(f => initial.includes(f) && !direct.includes(f))) fail('dist/index.html précharge un fichier déjà chargé par le script principal')
  // election.ts n'importe que des types : Node l'exécute tel quel (comme vite.config.ts, qui pose ces textes)
  let election = null
  try {
    ;({ election } = await import(pathToFileURL(join('src/elections', id, 'election.ts')).href))
  } catch (e) {
    fail(`${id}/election.ts illisible par Node (il ne doit importer que des types) : ${e.message}`)
  }
  // Candidats masqués (election.hidden) : leur portrait n'est pas livré (candidates.ts ne l'importe plus), sinon le
  // service worker le préchargerait chez chaque visiteur sans que rien ne le montre ni que les mentions légales le créditent
  for (const h of election?.hidden ?? []) {
    for (const f of readdirSync(join(dist, 'assets'))) if (new RegExp(`^${h}-[\\w-]+\\.(?:jpe?g|png|webp)$`).test(f)) fail(`assets/${f} : portrait de ${h}, candidat masqué (election.hidden)`)
  }
  const share = election?.copy?.shareDescription
  if (election && !share) fail(`${id}/election.ts : copy.shareDescription absente`)
  else if (share) {
    const decode = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    for (const name of ['property="og:description"', 'name="twitter:description"']) {
      const content = html.match(new RegExp(`<meta ${name} content="([^"]*)"`))?.[1]
      if (content === undefined) fail(`dist/index.html : balise ${name} absente`)
      else if (decode(content) !== share) fail(`dist/index.html : ${name} diffère de la description de partage de ${id} (copy.shareDescription)`)
    }
    // La description de l'image d'aperçu nomme la même élection que public/og.png (tools/build-og.mjs)
    for (const name of ['property="og:image:alt"', 'name="twitter:image:alt"']) {
      const content = html.match(new RegExp(`<meta ${name} content="([^"]*)"`))?.[1]
      if (content === undefined) fail(`dist/index.html : balise ${name} absente`)
      else if (!decode(content).includes(`${election.name}\u00a0:`)) fail(`dist/index.html : ${name} ne nomme pas l’élection par défaut (${election.name})`)
    }
  }
}
// Aucun texte d'élection laissé à poser dans la page (index.html : {{…}}, remplacés par vite.config.ts)
for (const m of html.matchAll(/\{\{(\w+)\}\}/g)) fail(`dist/index.html : {{${m[1]}}} n’a pas été remplacé`)

if (!process.exitCode) console.log('✓ dist vérifié : CSP stricte, aucune API d’envoi, aucune ressource externe, service worker limité aux fichiers du site')
if (initialBytes) console.log(`  JS initial : ${(initialBytes / 1000).toFixed(1)} ko sur ${INITIAL_JS_BUDGET / 1000} ko permis (${initial.join(', ')}), sans aucun des ${prompts} textes des banques`)
for (const f of reportChunks) console.log(`  dépouillement en PDF : assets/${f}, ${(statSync(join(dist, 'assets', f)).size / 1000).toFixed(1)} ko sur ${REPORT_BUDGET / 1000} ko permis, chargé à la demande`)
for (const f of agreeChunks) console.log(`  image « Accords et désaccords » : assets/${f}, ${(statSync(join(dist, 'assets', f)).size / 1000).toFixed(1)} ko sur ${AGREE_BUDGET / 1000} ko permis, chargée à la demande`)
for (const f of profileChunks) console.log(`  « Mon profil politique » : assets/${f}, ${(statSync(join(dist, 'assets', f)).size / 1000).toFixed(1)} ko sur ${PROFILE_BUDGET / 1000} ko permis, chargé à la demande`)

// Voix des vidéos : un avertissement pour un fichier livré mais pas inscrit (jamais lu, poids inutile)
const unlisted = [...shipped].filter(k => !inscribed.has(k))
if (unlisted.length) console.warn(`⚠ voix livrées mais absentes de src/ui/videos/audio-files.json (jamais lues) : ${unlisted.join(', ')}`)
if (audioFiles.length) {
  const mb = audioFiles.reduce((t, f) => t + statSync(join(audioDir, f)).size, 0) / 1e6
  const perVoice = VOICES.map(v => `${v} ${audioFiles.filter(f => f.startsWith(`${v}/`)).length}`).join(', ')
  console.log(`  voix des vidéos : ${audioFiles.length} fichier(s) (${perVoice}), ${mb.toFixed(1)} Mo, hors copie hors ligne`)
}

// Mentions légales : un avertissement (pas un échec) tant qu'une information de src/core/legal.ts reste à compléter
const pending = [join(dist, 'index.html'), ...readdirSync(join(dist, 'assets')).filter(f => f.endsWith('.js')).map(f => join(dist, 'assets', f))]
  .flatMap(f => [...new Set(readFileSync(f, 'utf8').match(/\[à(?: |\u00a0|\\u00a0)compléter[^\]'"`]*\]/g) ?? [])])
if (pending.length) {
  console.warn(`⚠ mentions légales incomplètes (src/core/legal.ts) : ${[...new Set(pending)].join(' ; ')}`)
}
