// Cache do app para funcionar offline
const CACHE='lunar-patrol-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  // fonte do Google: guarda na primeira vez
  if(url.hostname.endsWith('googleapis.com')||url.hostname.endsWith('gstatic.com')){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(r=>r||fetch(req).then(res=>{c.put(req,res.clone());return res}))));return}
  if(url.origin!==location.origin)return;
  // página: rede primeiro (pega atualizações), cache se offline
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(res=>{caches.open(CACHE).then(c=>c.put('index.html',res.clone()));return res}).catch(()=>caches.match('index.html')));return}
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
