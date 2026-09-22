// 앱을 수정해서 다시 올릴 때는 아래 버전 숫자를 올려주세요 (v1 -> v2)
const CACHE = 'golflog-v5';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 저장된 화면을 먼저 보여주고(오프라인에서도 동작), 연결되면 뒤에서 새 버전을 받아둡니다
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(cache =>
    cache.match(req, {ignoreSearch: true}).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit || cache.match('./index.html'));
      return hit || net;
    })
  ));
});
