const CACHE_NAME = "bb21coy-cache-v1"; // bump this to invalidate old cache

// These are the known root files and folders
const STATIC_ASSETS = [
    "/",
    "/index.html"
];

// Regex patterns for runtime caching
const ASSETS_PATTERN = /^\/assets\//;      // built CSS/JS
const IMAGES_PATTERN = /^\/[^/]+\.(png|jpg|jpeg|webp|gif|svg|ico)$/; // direct children of /public

self.addEventListener("install", (event) => {
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
        caches.keys().then((keys) =>
            Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }))
        )
    );
});

// Cache-first strategy for known files, network fallback for everything else
self.addEventListener("fetch", (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // only cache same-origin requests
    if (url.origin !== location.origin) return;

    if (ASSETS_PATTERN.test(url.pathname) || IMAGES_PATTERN.test(url.pathname)) {
        event.respondWith(
            caches.match(req).then((cached) => {
                return cached || fetch(req).then((res) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(req, res.clone());
                        return res;
                    });
                });
            })
        );
    } else if (STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(req).then((cached) => cached || fetch(req))
        );
    }
});
