/*
 * Service Worker: strona działa offline po pierwszym otwarciu.
 * Strategia „stale-while-revalidate”: od razu kopia z pamięci (szybko także przy słabym zasięgu),
 * a w tle pobranie nowej wersji na następne otwarcie.
 * Podbij VERSION przy każdej zmianie plików.
 */
var VERSION = 'husa-2026-v11';
// Zdjęcia butelek i logo (img/wina, img/logo) trafiają do pamięci przy pierwszym obejrzeniu.
var FILES = [
  './', 'index.html', 'css/style.css', 'js/data.js', 'js/wines.js', 'js/wine-media.js', 'js/venue-media.js', 'js/wine-map.js', 'js/aroma.js', 'js/wine-notes.js', 'js/routes.js', 'js/route-maps.js', 'js/app.js', 'manifest.webmanifest',
  'trasy/zamek-park.gpx', 'trasy/kraluv-stolec.gpx', 'trasy/saldorf.gpx', 'trasy/cizov-hardegg.gpx',
  'img/icon.svg', 'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png', 'img/parking.webp', 'img/parking-mapa.webp',
  'img/kinderwelt-brama.webp', 'img/excalibur-smok.webp', 'img/fc-autka.webp', 'img/fc-osiolki.webp', 'img/fc-kucyk.webp', 'img/fc-nandu.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === location.origin;
  var fonts = /^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return; // linki zewnętrzne, Mapy itd. — bez ingerencji

  e.respondWith(caches.open(VERSION).then(function (cache) {
    var key = req.mode === 'navigate' ? 'index.html' : req;
    return cache.match(key, { ignoreSearch: true }).then(function (hit) {
      var update = fetch(req).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
        return res;
      }).catch(function () { return hit; });
      if (hit) { try { e.waitUntil(update); } catch (err) { /* aktualizacja i tak trwa */ } return hit; }
      return update.then(function (res) { return res || Response.error(); });
    });
  }));
});
