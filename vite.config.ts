import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'

/** Hors de la copie hors ligne */
const OFFLINE_SKIP = new Set(['og.png'])

// Politique de sécurité stricte : aucune connexion réseau sortante n'est possible
// depuis la page (connect-src 'none'), donc aucune réponse ne peut quitter l'appareil.
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob:",
  "font-src 'self'",
  // Voix des vidéos : fichiers audio servis par le site lui-même (public/videos/audio/), rien d'ailleurs
  "media-src 'self'",
  "connect-src 'none'",
  "worker-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "manifest-src 'self'",
].join('; ')

// Injectée au build seulement : le serveur de dev de Vite a besoin de scripts inline.
function contentSecurityPolicy(): Plugin {
  return {
    name: 'isoloir-csp',
    apply: 'build',
    transformIndexHtml(html) {
      if (!html.includes('<!-- CSP -->')) throw new Error('Marqueur <!-- CSP --> absent de index.html : la CSP ne serait pas injectée')
      return html.replace(
        '<!-- CSP -->',
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      )
    },
  }
}

// Copie hors ligne : un service worker qui ne sert que les fichiers du site (mode avion).
// La liste des fichiers et la version sont calculées sur le build, pour tout précharger dès la première visite.
function offlineCopy(): Plugin {
  return {
    name: 'isoloir-offline',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const items = Object.values(bundle)
      if (!items.some(i => i.fileName === 'index.html')) throw new Error('index.html absent du bundle : copie hors ligne incomplète')
      // Fichiers à la racine de public seulement : les SVG de public/brand/ ne servent pas à la page (le logo
      // est dessiné en ligne), l'image d'aperçu og.png ne sert qu'aux robots des messageries, et les voix des
      // vidéos (public/videos/audio/, plusieurs mégaoctets) ne se téléchargent que si on les écoute : hors
      // ligne, les vidéos passent en sous-titres seuls
      const publicFiles = readdirSync('public', { withFileTypes: true })
        .filter(d => d.isFile() && !OFFLINE_SKIP.has(d.name))
        .map(d => `./${d.name}`)
      const files = ['./', ...items.map(i => `./${i.fileName}`), ...publicFiles]
      const hash = createHash('sha256')
      for (const i of items) hash.update(i.fileName).update(i.type === 'chunk' ? i.code : i.source)
      const source = readFileSync('src/service-worker.template.js', 'utf8')
        .replace('__VERSION__', hash.digest('hex').slice(0, 12))
        .replace('/* __FILES__ */ []', JSON.stringify(files))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [preact(), contentSecurityPolicy(), offlineCopy()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // Pas de polyfill de préchargement : il ferait des fetch(), bloqués par la CSP et inutiles ici
    modulePreload: { polyfill: false },
  },
})
