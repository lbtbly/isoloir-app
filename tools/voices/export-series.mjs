// Exporte les séries de vidéos (src/ui/videos/series.ts) en JSON sur la sortie standard, pour le générateur
// des voix (tools/voices/generate.py). Node 24 lit directement ce TypeScript simple (types effacés).
// Les séries sont rangées une par fichier (src/ui/videos/series/<thème>.ts, assemblées par series/index.ts) et
// s'importent sans extension, comme le veut Vite : un crochet de résolution (registerHooks) essaie « .ts » puis
// « /index.ts » quand Node ne trouve pas un chemin relatif tel quel.
//
// Pour chaque passage : son identifiant, son « say » (sous-titre), son « spoken » s'il existe (texte écrit pour
// la voix), et « print », l'empreinte du texte dit calculée par les fonctions textPrint() et spokenOf() de
// src/ui/videos/audio.ts elles-mêmes (extraites du fichier et exécutées ici) : l'inventaire écrit par le
// générateur reste ainsi identique à ce que le lecteur vérifie, même si l'empreinte change un jour.
//
// Usage : node tools/voices/export-series.mjs > series.json
import { readFileSync } from 'node:fs'
import { registerHooks, stripTypeScriptTypes } from 'node:module'

// Imports relatifs sans extension (« ./series/index », « ../types ») : résolus comme par Vite, « .ts » d'abord
// (« ./series » est series.ts, pas le dossier series/), puis « /index.ts »
const RELATIVE = /^\.{1,2}\//
const MISSING = new Set(['ERR_MODULE_NOT_FOUND', 'ERR_UNSUPPORTED_DIR_IMPORT'])
registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (!RELATIVE.test(specifier) || !MISSING.has(error?.code) || /\.[cm]?[jt]sx?$/.test(specifier)) throw error
      for (const suffix of ['.ts', '/index.ts']) {
        try {
          return nextResolve(specifier + suffix, context)
        } catch {
          // suffixe suivant
        }
      }
      throw error
    }
  },
})
// Après le crochet : un import statique serait résolu avant lui
const { VIDEO_SERIES } = await import('../../src/ui/videos/series.ts')

const audioTs = readFileSync(new URL('../../src/ui/videos/audio.ts', import.meta.url), 'utf8')
// L'avertissement « expérimental » de stripTypeScriptTypes ne doit pas polluer la sortie JSON
process.removeAllListeners('warning')
/** Une fonction de audio.ts, reprise telle quelle (types effacés) */
function fromAudioTs(name, pattern) {
  const source = audioTs.match(pattern)?.[0]
  if (!source) throw new Error(`${name}() introuvable dans src/ui/videos/audio.ts`)
  return new Function(`${stripTypeScriptTypes(source.replace(/^export /, ''))}; return ${name}`)()
}
const textPrint = fromAudioTs('textPrint', /^export function textPrint\([\s\S]*?^}$/m)
// Le texte dont l'inventaire prend l'empreinte : son « spoken » s'il en a un, sinon son « say »
const spokenOf = fromAudioTs('spokenOf', /^export const spokenOf = [\s\S]*?(?=\n\n)/m)

const out = {
  series: VIDEO_SERIES.map(s => ({
    topicId: s.topicId,
    label: s.label,
    videos: s.videos.map(v => ({
      id: v.id,
      title: v.title,
      segments: v.segments.map(seg => ({
        id: seg.id,
        say: seg.say,
        ...(seg.spoken ? { spoken: seg.spoken } : {}),
        print: textPrint(spokenOf(seg)),
      })),
    })),
  })),
}
process.stdout.write(JSON.stringify(out, null, 1))
