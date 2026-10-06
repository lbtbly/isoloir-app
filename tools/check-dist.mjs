// Vérifie le build : CSP présente et stricte, aucune API d'envoi réseau dans le code livré, voix des vidéos
// servies par le site et hors de la copie hors ligne.
// Lancé automatiquement après `pnpm build`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

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
}
for (const f of readdirSync(join(dist, 'assets')).filter(f => f.endsWith('.css'))) {
  const css = readFileSync(join(dist, 'assets', f), 'utf8')
  if (/url\(\s*['"]?https?:/.test(css)) fail(`${f} charge une ressource externe`)
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

if (!process.exitCode) console.log('✓ dist vérifié : CSP stricte, aucune API d’envoi, aucune ressource externe, service worker limité aux fichiers du site')

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
