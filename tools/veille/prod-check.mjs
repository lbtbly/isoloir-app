// Contrôle de la production (contrat : tools/veille/CONTRACT.md §d.13) : l'asset assets/index-*.js que sert
// https://isoloir.vercel.app/ (policy.ship.prodUrl) est-il celui du dernier envoi (<état local>/last-ship.json, écrit
// par ship.mjs) ? Une seule requête GET par essai, sur <prodUrl>?v=<horodatage> (contre les caches), avec le User-Agent
// générique « IsoloirBot/1.0 » et rien d'autre : aucune donnée personnelle, aucun cookie. Lecture seule.
//
// Usage : node <WT>/tools/veille/prod-check.mjs [--attempts 3] [--delay <secondes>] [--now ISO] [--root <abs>]
//   --attempts  essais, à --delay secondes d'écart (par défaut policy.ship.checkDelaySeconds, 20)
//   ISOLOIR_VEILLE_PROD_HTML  (tests) fichier HTML lu à la place de la production : aucun réseau
// Une autre session peut publier depuis main (vercel deploy à la main) : si la production sert un autre asset que le
// dernier envoi (déployé et contrôlé) et qu'origin/main a avancé depuis ce dernier envoi (git merge-base --is-ancestor,
// après le fetch de l'exécution), c'est une publication hors veille : 0 avec outside: true et une note.
// Sortie : une ligne JSON { known, outside?, expected, served, attempts, url, note?, reason? }. Codes : 0 (bon asset, pas
// encore de last-ship.json : known false, ou publication hors veille), 41 (la production ne sert pas le bon asset, ou ne
// répond pas), 2.
// Il faut Node 22.18+.

import { readFileSync } from 'node:fs'
import { EXIT, PROD_URL, USER_AGENT, exit, fail, git, parseArgs, parseNow, paths, readJson, rootFrom, runMain } from './lib/common.mjs'
import { prodCheck } from './lib/persist.mjs'
import { loadPolicy } from './lib/state.mjs'

/** Lecture de la page : User-Agent générique, sans cache, 20 s au plus */
async function fetchProd(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Cache-Control': 'no-cache' }, redirect: 'follow', signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

runMain(async () => {
  const o = parseArgs(process.argv.slice(2), { attempts: { type: 'number' }, delay: { type: 'number' }, now: { type: 'string' }, root: { type: 'string' } })
  if (o._.length) fail(EXIT.USAGE, `argument inattendu : ${o._.join(' ')}`)
  const root = rootFrom(o)
  const L = paths(root).local
  if (!L) fail(EXIT.USAGE, `état local introuvable depuis ${root}`)
  const policy = loadPolicy(root)
  const attempts = o.attempts ?? policy.ship?.checkAttempts ?? 3
  if (!Number.isInteger(attempts) || attempts < 1) fail(EXIT.USAGE, '--attempts : entier ≥ 1 attendu')
  const html = process.env.ISOLOIR_VEILLE_PROD_HTML
  const fetchText = html ? async () => readFileSync(html, 'utf8') : fetchProd
  const delayMs = (o.delay ?? (html ? 0 : policy.ship?.checkDelaySeconds ?? 20)) * 1000
  // origin/main (suivi local, avancé par le fetch de l'exécution) : pour reconnaître une publication faite depuis main
  const head = git(['rev-parse', '--verify', '--quiet', 'origin/main'], { cwd: root })
  const mainInfo = head.code === 0
    ? {
        head: head.stdout.trim(),
        isAncestor: sha => {
          const r = git(['merge-base', '--is-ancestor', String(sha), 'origin/main'], { cwd: root })
          return r.code === 0 ? true : r.code === 1 ? false : null
        },
      }
    : null
  const { code, reason, note, ...rest } = await prodCheck({
    mainInfo,
    lastShip: readJson(L.lastShip, null),
    fetchText,
    prodUrl: policy.ship?.prodUrl ?? PROD_URL,
    now: parseNow(o.now),
    attempts,
    delayMs,
  })
  if (reason) process.stderr.write(`${reason}\n`)
  exit(code, { ...rest, ...(note ? { note } : {}), ...(reason ? { reason } : {}) }, { root })
})
