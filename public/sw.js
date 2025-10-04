const version = "1.3.11";
const CACHE_NAME = `bb21coy-cache-v${version}`;

// These are the known root files and folders
const STATIC_ASSETS = [
    "/",
    "/index.html"
];

// Regex patterns for runtime caching
const ASSETS_PATTERN = /^\/assets\//;      // built CSS/JS
const IMAGES_PATTERN = /^\/[^/]+\.(png|jpg|jpeg|webp|gif|svg|ico|woff2|ttf|css|xml)$/; // direct children of /public

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            for (const file of STATIC_ASSETS) {
                try {
                    await cache.add(file);
                } catch (err) {
                    console.warn("Failed to cache", file, err);
                }
            }
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)));
            await self.clients.claim();  // 👈 immediately control open tabs
        })()
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    const url = new URL(req.url);

    if (url.origin !== location.origin) return;

    event.respondWith((async () => {
        try {
            // SPA navigation → always serve cached index.html
            if (req.mode === "navigate") {
                const cached = await caches.match("/index.html");
                // Try network if online, but fall back to cache
                try {
                    const fresh = await fetch("/index.html");
                    const cache = await caches.open(CACHE_NAME);
                    cache.put("/index.html", fresh.clone());
                    return fresh;
                } catch {
                    return cached;
                }
            }

            // Cache-first for assets/images
            if (ASSETS_PATTERN.test(url.pathname) || IMAGES_PATTERN.test(url.pathname)) {
                const cached = await caches.match(req);
                if (cached) return cached;

                const res = await fetch(req);
                const cache = await caches.open(CACHE_NAME);
                cache.put(req, res.clone());
                return res;
            }

            // Default: network with cache fallback
            return await fetch(req);

        } catch (err) {
            // Only notify update if online
            if (navigator.onLine) {
                console.warn("Likely update issue:", req.url, err);
                self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({ type: "SW_UPDATE_AVAILABLE" });
                    });
                });
            } else {
                console.warn("Offline mode:", req.url);
            }

            // Fallback to index.html for SPA
            return caches.match("/index.html");
        }
    })());
});