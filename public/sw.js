/* 个人工作台 Service Worker（v13 PWA 离线支持）
   策略：页面外壳 cache-first —— 装过一次后，即使电脑/服务器没开也能打开；
   /api/data network-only —— 离线时应用自动用 localStorage 本地数据，
   联网/服务器恢复后由应用层自动补同步。 */
const CACHE='wb-v19-custom-cats-1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  if(url.pathname==='/api/data'){
    e.respondWith(fetch(e.request).catch(()=>new Response('{"ts":0}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  if(e.request.mode==='navigate'){
    e.respondWith(caches.match('./index.html').then(m=>m||fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request)));
});
