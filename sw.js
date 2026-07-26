const CACHE_NAME = 'ataol-ai-v14';
const ASSETS = [
  // v1 varliklari (gunluk kullanilan surum)
  './',
  './index.html',
  './styles.css',
  './app.js',
  './heroes_list.js',
  './logo.png',
  './manifest.json',
  // v2
  './v2.html',
  './styles-v2.css',
  './src/main.js',
  './src/core/crypto.js',
  './src/core/profile.js',
  './src/core/state.js',
  './src/core/storage.js',
  './src/data/defaults.js',
  './src/data/themes.js',
  './src/engines/ai.js',
  './src/engines/battleship.js',
  './src/engines/chessgame.js',
  './src/engines/calendar.js',
  './src/engines/chess.js',
  './src/engines/chesspuzzle.js',
  './src/engines/diary.js',
  './src/engines/drill.js',
  './src/engines/leitner.js',
  './src/engines/migrate.js',
  './src/engines/problems.js',
  './src/engines/rewards.js',
  './src/engines/routine.js',
  './src/engines/timequiz.js',
  './src/ui/dom.js',
  './src/views/chess.js',
  './src/views/clock.js',
  './src/views/drill.js',
  './src/views/games.js',
  './src/views/parent.js',
  './src/views/routine.js',
  './src/views/settings.js',
  // PWA ikonlari
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
