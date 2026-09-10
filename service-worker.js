// Shell completo por revisão de cache, sem misturar assets de publicações diferentes.
const CACHE='painel-saude-shell-20260909-1';
const ASSETS=['./guia-mob.html','./mob-mobilidade.png','./mob-alongamentos.png','./','./index.html','./painel-saude.html','./app.js','./core.js','./protocol.js','./storage.js','./style.css','./painel-saude.webmanifest','./icone-180.png','./icone-192.png','./icone-512.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Falha em qualquer asset impede a ativação de uma instalação incompleta.
 await cache.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})));
})())});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('painel-saude-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),scope=new URL(self.registration.scope);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);const cached=await cache.match(req,{ignoreSearch:true});if(cached)return cached;
  try{return await fetch(req)}catch(error){if(req.mode==='navigate')return await cache.match('./index.html');throw error}
 })());
});
