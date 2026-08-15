const CACHE_NAME = "senior-cat-care-v2";
const APP_SHELL = ["/senior-cat/index.html", "/manifest.webmanifest", "/icons/cat-care.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === "navigate" ? caches.match("/senior-cat/index.html") : undefined))));
});

self.addEventListener("push", event => {
  const payload = event.data?.json?.() ?? {};
  event.waitUntil(self.registration.showNotification(payload.title || "고양이 돌봄 알림", {
    body: payload.body || "오늘 돌봄 일정을 확인해 주세요.",
    tag: payload.tag || "cat-care-reminder",
    icon: "/icons/cat-care.svg",
    data: { url: payload.url || "/senior-cat/" },
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => client.url.includes("/senior-cat/"));
    return existing ? existing.focus() : self.clients.openWindow(event.notification.data?.url || "/senior-cat/");
  }));
});
