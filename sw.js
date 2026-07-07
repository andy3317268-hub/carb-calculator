// 碳循環計算機 — Service Worker
// 版本號:每次更新內容時改這個數字,使用者就會自動拿到新版
const CACHE_NAME = 'carb-calc-v1';

// 要預先快取的核心檔案
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 安裝:預快取核心檔案
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('SW install cache failed:', err))
  );
});

// 啟用:清掉舊版快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// 抓取策略:
// - 對 Firebase / Google / 第三方 API:一律走網路(不快取,避免登入和資料同步出問題)
// - 對自己的靜態檔案:network-first,失敗才用快取(確保拿到最新版,離線時可用)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 只處理 GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 第三方網域(Firebase、Google、CDN 等)直接走網路,不攔截
  const isThirdParty = url.origin !== self.location.origin;
  if (isThirdParty) {
    return; // 讓瀏覽器正常處理,不快取
  }

  // 自家檔案:network-first
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // 成功:複製一份存快取(複製動作要在 body 被讀取前做)
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resClone).catch(() => {});
        });
        return networkRes;
      })
      .catch(() => {
        // 網路失敗(離線):回快取
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // 連快取都沒有,且是頁面請求 → 回首頁
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('離線中,且此資源未被快取。', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
      })
  );
});
