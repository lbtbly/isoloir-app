// Lire le code du site (TypeScript) depuis un outil Node, sans compilation ni Vite : le registre des élections,
// un pack, les séries vidéo. Node exécute le TypeScript simple (types effacés) ; ces crochets de module
// complètent ce qui manque :
// - les imports sans extension (« ./bank ») et de dossier (« ./choisir-2027 ») ;
// - les fichiers média et les feuilles de style, remplacés par un module qui exporte leur adresse ;
// - import.meta.env (Vite) : les valeurs du build par défaut (on teste dist/), celles du serveur de
//   développement avec { dev: true } (l'élection factice #/essai-20/ n'existe que là).
// Utilisé par tools/e2e-offline.mjs et tools/capture.mjs (tools/audit-pack.mjs a ses propres crochets).
// Il faut Node 22.18+ (module.registerHooks, TypeScript sans option).

import * as nodeModule from 'node:module'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Racine du dépôt */
export const ROOT = fileURLToPath(new URL('..', import.meta.url))

const MEDIA = /\.(jpe?g|png|webp|avif|gif|svg|mp3|mp4|m4a|webm|ogg|woff2?|css)$/i
let mode = null

/** Installe les crochets (une fois par processus) ; dev : import.meta.env du serveur de développement */
export function useSiteModules({ dev = false } = {}) {
  if (mode !== null) {
    if (mode !== dev) throw new Error('useSiteModules : déjà installé dans l’autre mode')
    return
  }
  if (typeof nodeModule.registerHooks !== 'function') {
    console.error(`Node ${process.version} : il faut Node 22.18+ (module.registerHooks et TypeScript).`)
    process.exit(2)
  }
  mode = dev
  const env = JSON.stringify(dev ? { DEV: true, PROD: false, SSR: false, MODE: 'development', BASE_URL: './' } : { DEV: false, PROD: true, SSR: false, MODE: 'production', BASE_URL: './' })
  nodeModule.registerHooks({
    resolve(specifier, context, next) {
      const bare = specifier.split('?')[0]
      if (MEDIA.test(bare) && /^\.{0,2}\//.test(bare)) return { url: new URL(bare, context.parentURL).href, format: 'module', shortCircuit: true }
      try {
        return next(specifier, context)
      } catch (err) {
        if (!specifier.startsWith('.')) throw err
        for (const ext of ['.ts', '.tsx', '/index.ts']) {
          try {
            return next(specifier + ext, context)
          } catch {
            // essai suivant
          }
        }
        throw err
      }
    },
    load(url, context, next) {
      if (url.startsWith('file:') && MEDIA.test(new URL(url).pathname)) return { format: 'module', source: `export default ${JSON.stringify(url)}`, shortCircuit: true }
      const loaded = next(url, context)
      if (url.startsWith('file:') && /\.tsx?$/.test(new URL(url).pathname) && loaded.source && String(loaded.source).includes('import.meta.env')) {
        return { ...loaded, source: String(loaded.source).replaceAll('import.meta.env', `(${env})`) }
      }
      return loaded
    },
  })
}

/** Importe un module du dépôt par son chemin depuis la racine (« src/elections/index.ts ») */
export const importSite = rel => import(pathToFileURL(join(ROOT, rel)).href)

/**
 * Le registre, l'élection demandée (par défaut, celle des adresses sans préfixe) et son pack.
 * prefix : le préfixe tapé dans les adresses (slug, identifiant ou alias), par défaut le slug du registre.
 */
export async function loadElection(packId, prefixOpt) {
  const { ELECTIONS, defaultEntry } = await importSite('src/elections/index.ts')
  const entry = ELECTIONS.find(e => e.id === (packId ?? defaultEntry.id))
  if (!entry) throw new Error(`élection « ${packId} » absente du registre (${ELECTIONS.map(e => e.id).join(', ')})`)
  const prefix = prefixOpt ?? entry.slug
  if (![entry.slug, entry.id, ...(entry.aliases ?? [])].includes(prefix)) {
    throw new Error(`préfixe « ${prefix} » : ni le slug (« ${entry.slug} »), ni l'identifiant, ni un alias de ${entry.id}`)
  }
  return { ELECTIONS, defaultEntry, entry, prefix, pack: await entry.load() }
}
