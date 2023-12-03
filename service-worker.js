const a = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), u = [
  a + "/_app/immutable/entry/app.6ec1b8f1.js",
  a + "/_app/immutable/assets/0.254b6b5d.css",
  a + "/_app/immutable/nodes/0.337d9992.js",
  a + "/_app/immutable/assets/1.b20769a5.css",
  a + "/_app/immutable/nodes/1.d2233f5b.js",
  a + "/_app/immutable/nodes/2.1c4cc4b4.js",
  a + "/_app/immutable/nodes/3.784ff847.js",
  a + "/_app/immutable/assets/4.a8067485.css",
  a + "/_app/immutable/nodes/4.d8e244ec.js",
  a + "/_app/immutable/nodes/5.bcde6345.js",
  a + "/_app/immutable/nodes/6.aff24a2f.js",
  a + "/_app/immutable/nodes/7.cfb208c7.js",
  a + "/_app/immutable/nodes/8.50689da2.js",
  a + "/_app/immutable/chunks/common.37e246a8.js",
  a + "/_app/immutable/chunks/debounce.972b80ae.js",
  a + "/_app/immutable/chunks/footer.4bf0f568.js",
  a + "/_app/immutable/chunks/ga.d84d4cc0.js",
  a + "/_app/immutable/chunks/index.6063bb9a.js",
  a + "/_app/immutable/chunks/index.6267134c.js",
  a + "/_app/immutable/chunks/index.b6d01173.js",
  a + "/_app/immutable/chunks/loader.71521e64.js",
  a + "/_app/immutable/chunks/markmap.eeeaca16.js",
  a + "/_app/immutable/chunks/navigation.9f7229da.js",
  a + "/_app/immutable/chunks/preload-helper.cf010ec4.js",
  a + "/_app/immutable/chunks/scheduler.4813dac0.js",
  a + "/_app/immutable/chunks/singletons.55a8e8a3.js",
  a + "/_app/immutable/chunks/stores.eb563214.js",
  a + "/_app/immutable/chunks/toast.ba9d61ec.js",
  a + "/_app/immutable/chunks/toolbar.8e7a62ef.js",
  a + "/_app/immutable/assets/toolbar.a340aa30.css",
  a + "/_app/immutable/entry/start.e3d1895d.js",
  a + "/_app/immutable/chunks/buttons.esm.48f94bc9.js",
  a + "/_app/immutable/chunks/index.ac19ab55.js",
  a + "/_app/immutable/chunks/faq.853276a1.js",
  a + "/_app/immutable/chunks/json-options.c3daaed6.js",
  a + "/_app/immutable/chunks/markmap.ef13e9c4.js",
  a + "/_app/immutable/chunks/packages--coc-markmap.10bd7856.js",
  a + "/_app/immutable/chunks/packages--markmap-cli.b2e4fcc9.js",
  a + "/_app/immutable/chunks/packages--markmap-lib.f3b9bd2d.js",
  a + "/_app/immutable/chunks/packages--markmap-toolbar.31bde5d9.js",
  a + "/_app/immutable/chunks/packages--markmap-view.692c7aee.js",
  a + "/_app/immutable/assets/codemirror.8a3c1e84.css",
  a + "/_app/immutable/chunks/codemirror.a7c356ed.js"
], l = [
  a + "/.nojekyll",
  a + "/.well-known/brave-rewards-verification.txt",
  a + "/favicon.png",
  a + "/logo-192.png",
  a + "/logo-512.png",
  a + "/manifest.json"
], n = "1701579632078", m = `cache${n}`, i = u.concat(l), o = new Set(i);
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(m).then((s) => s.addAll(i)).then(() => {
      self.skipWaiting();
    })
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(async (s) => {
      for (const t of s)
        t !== m && await caches.delete(t);
      self.clients.claim();
    })
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.headers.has("range"))
    return;
  const s = new URL(e.request.url);
  if (s.protocol.startsWith("http") && !(s.hostname === self.location.hostname && s.port !== self.location.port)) {
    if (s.host === self.location.host && o.has(s.pathname)) {
      e.respondWith(caches.match(e.request, { ignoreSearch: !0 }));
      return;
    }
    e.request.cache !== "only-if-cached" && [self.location.host, "cdn.jsdelivr.net"].includes(s.host) && e.respondWith(
      caches.open(`offline${n}`).then(async (t) => {
        try {
          const c = await fetch(e.request);
          return t.put(e.request, c.clone()), c;
        } catch (c) {
          const p = await t.match(e.request);
          if (p)
            return p;
          throw c;
        }
      })
    );
  }
});
