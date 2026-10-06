// Service worker d'Isoloir, généré au build par vite.config.ts à partir de ce modèle.
// Il garde une copie des fichiers du site pour que l'application marche hors ligne, en mode avion.
// Il ne fait que servir ces fichiers : aucune requête vers un autre site, aucune donnée envoyée,
// aucun accès aux réponses, qui restent dans la page. tools/check-dist.mjs le vérifie à chaque build.
const CACHE = 'isoloir-__VERSION__'
const FILES = /* __FILES__ */ []

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(cache => Promise.all(FILES.map(file => cache.add(file).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('isoloir-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Réseau d'abord, pour recevoir les mises à jour ; la copie locale quand le réseau est coupé
self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request, { ignoreSearch: true, ignoreVary: true }).then(hit => {
        if (hit) return hit
        if (request.mode === 'navigate') return caches.match('./').then(page => page ?? caches.match('./index.html'))
        return Response.error()
      }),
    ),
  )
})
