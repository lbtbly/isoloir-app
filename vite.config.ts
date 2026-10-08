import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import preact from '@preact/preset-vite'
import type { ElectionInfo } from './src/core/types'

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

/** L'élection par défaut du registre (src/elections/index.ts) : l'entrée dont « slug: '' » suit « id » */
function defaultElectionId(registry = readFileSync('src/elections/index.ts', 'utf8')): string {
  const ids = [...registry.matchAll(/\bid: '([a-z0-9-]+)',\s*slug: '([^']*)'/g)].filter(m => m[2] === '').map(m => m[1]!)
  if (ids.length !== 1) throw new Error(`src/elections/index.ts : ${ids.length} élection(s) par défaut trouvée(s), une attendue (« id: '…', slug: '' » à la suite)`)
  return ids[0]!
}

// Les données de chaque élection sont un fichier à part (chargé par import() depuis le registre). Celles de
// l'élection par défaut servent à presque toutes les visites : la page les précharge dès son ouverture
// (modulepreload), en même temps que le code, au lieu d'attendre que celui-ci les demande.
function preloadDefaultElection(): Plugin {
  return {
    name: 'isoloir-election-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html
        const id = defaultElectionId()
        const chunks = Object.values(bundle).filter(c => c.type === 'chunk')
        const pack = chunks.find(c => c.facadeModuleId?.endsWith(`/src/elections/${id}/index.ts`))
        if (!pack) throw new Error(`Données de l'élection par défaut (${id}) introuvables dans le build`)
        const entry = chunks.find(c => c.isEntry)
        // Le fichier de l'élection et ceux qu'il importe, sauf ceux que la page charge déjà
        const files: string[] = []
        const visit = (fileName: string) => {
          if (files.includes(fileName) || entry?.fileName === fileName || entry?.imports.includes(fileName)) return
          files.push(fileName)
          const c = chunks.find(x => x.fileName === fileName)
          c?.imports.forEach(visit)
        }
        visit(pack.fileName)
        const links = files.map(f => `<link rel="modulepreload" crossorigin href="./${f}">`).join('\n    ')
        return html.replace(/\s*<\/head>/, `\n    ${links}\n  </head>`)
      },
    },
  }
}

/**
 * Les informations de l'élection par défaut (src/elections/<id>/election.ts), lues par Node, qui efface les types :
 * ce fichier n'importe que des types. Relu à chaque appel s'il a changé (serveur de dev).
 */
async function defaultElectionInfo(): Promise<ElectionInfo> {
  const file = resolve(`src/elections/${defaultElectionId()}/election.ts`)
  const url = `${pathToFileURL(file).href}?v=${statSync(file).mtimeMs}`
  try {
    const { election } = (await import(/* @vite-ignore */ url)) as { election: ElectionInfo }
    return election
  } catch (e) {
    throw new Error(`${file} illisible par Node (il ne doit importer que des types) : ${(e as Error).message}`, { cause: e })
  }
}

/** Texte pour la valeur d'un attribut HTML entre guillemets droits */
const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Aperçu des liens partagés : les balises de index.html qui parlent de l'élection ({{…}}) prennent les textes de
// l'élection par défaut. La description est la sienne (copy.shareDescription, vérifiée par tools/check-dist.mjs) ;
// la description de l'image dit ce qu'imprime public/og.png (tools/build-og.mjs, à refaire si l'élection change).
function shareMeta(): Plugin {
  return {
    name: 'isoloir-share-meta',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        const election = await defaultElectionInfo()
        const values: Record<string, string> = {
          shareDescription: election.copy.shareDescription,
          shareImageAlt: `Isoloir. «\u00a0Pointez les idées qui vous ressemblent.\u00a0» ${election.name}\u00a0: des idées présentées sans le nom des candidats. Vos réponses restent chez vous.`,
        }
        return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
          const value = values[key]
          if (value === undefined) throw new Error(`index.html : {{${key}}} inconnu (connus : ${Object.keys(values).join(', ')})`)
          return attr(value)
        })
      },
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [preact(), shareMeta(), contentSecurityPolicy(), preloadDefaultElection(), offlineCopy()],
  build: {
    target: 'es2022',
    sourcemap: false,
    // Pas de polyfill de préchargement : il ferait des fetch(), bloqués par la CSP et inutiles ici
    modulePreload: { polyfill: false },
  },
})
