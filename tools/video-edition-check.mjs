// Contrôle d'une édition des séries vidéo (src/ui/videos/editions/<édition>/<thème>.ts) : applique la correction
// du thème à sa série d'origine et liste ce qui ne se retrouve pas (vidéo ou passage inconnu, identifiant inséré
// sans le suffixe ou en double), puis les passages changés, avant / après.
// Usage : node tools/video-edition-check.mjs <thème> [édition]   (édition par défaut : presidentielle-2027)
import { registerHooks } from 'node:module'
const RELATIVE = /^\.{1,2}\//
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (error) {
      if (!RELATIVE.test(specifier) || /\.[cm]?[jt]sx?$/.test(specifier)) throw error
      for (const suffix of ['.ts', '/index.ts']) {
        try {
          return next(specifier + suffix, context)
        } catch {
          // suivant
        }
      }
      throw error
    }
  },
})
process.removeAllListeners('warning')
const [theme, editionId = 'presidentielle-2027'] = process.argv.slice(2)
if (!theme) {
  console.error('usage : node tools/video-edition-check.mjs <thème> [édition]')
  process.exit(2)
}
const { SERIES_BY_TOPIC } = await import('../src/ui/videos/series/index.ts')
const { applyEdition } = await import('../src/ui/videos/editions/apply.ts')
const mod = await import(`../src/ui/videos/editions/${editionId}/${theme}.ts`)
const patch = Object.values(mod).find(v => v && typeof v === 'object' && 'videos' in v)
const base = SERIES_BY_TOPIC[theme]
if (!base || !patch) throw new Error(`série ou correction introuvable pour ${theme}`)
const suffix = '-p27'
const problems = []
const vids = new Map(base.videos.map(v => [v.id, v]))
for (const [vid, vp] of Object.entries(patch.videos ?? {})) {
  const v = vids.get(vid)
  if (!v) { problems.push(`vidéo inconnue : ${vid}`); continue }
  const segs = new Set(v.segments.map(s => s.id))
  for (const sid of Object.keys(vp.segments ?? {})) if (!segs.has(sid)) problems.push(`passage inconnu : ${vid} / ${sid}`)
  for (const ins of vp.insert ?? []) {
    if (ins.after !== null && !segs.has(ins.after)) problems.push(`insertion après un passage inconnu : ${vid} / ${ins.after}`)
    if (!ins.segment.id.endsWith(suffix)) problems.push(`passage inséré sans le suffixe ${suffix} : ${ins.segment.id}`)
  }
}
const edited = applyEdition(base, { id: editionId, suffix, patches: { [theme]: patch } })
const ids = edited.videos.flatMap(v => v.segments.map(s => s.id))
const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
if (dup.length) problems.push(`identifiants en double : ${[...new Set(dup)].join(', ')}`)
for (const v of edited.videos) for (const s of v.segments) {
  if (s.spoken && /\d/.test(s.spoken)) problems.push(`chiffre dans le spoken : ${s.id}`)
  for (const e of s.emphasis ?? []) if (!s.say.includes(e)) problems.push(`mot mis en valeur absent du say : ${s.id} « ${e} »`)
  if (s.figure && !(s.figure.sourceIndex >= 0 && s.figure.sourceIndex < v.sources.length)) problems.push(`figure.sourceIndex hors des sources : ${s.id}`)
}
console.log(problems.length ? `PROBLÈMES (${problems.length}) :\n- ${problems.join('\n- ')}` : 'OK : aucune référence cassée')
for (const v of edited.videos) {
  const o = vids.get(v.id)
  for (const s of v.segments) {
    const before = o?.segments.find(x => x.id === s.id || `${x.id}${suffix}` === s.id)
    if (!before || JSON.stringify(before) !== JSON.stringify({ ...s, id: before.id })) {
      console.log(`\n${v.id} / ${s.id}${before ? '' : ' (nouveau)'}\n  say : ${s.say}${s.spoken ? `\n  spoken : ${s.spoken}` : ''}`)
    }
  }
}
const omitted = base.videos.filter(v => !edited.videos.some(x => x.id === v.id)).map(v => v.id)
if (omitted.length) console.log(`\nvidéos retirées : ${omitted.join(', ')}`)
