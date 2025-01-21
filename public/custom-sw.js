// Import the existing workbox functionalities
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Use workbox
const { registerRoute } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { clientsClaim } = workbox.core;

// Take control immediately
self.skipWaiting();
clientsClaim();

// Pre-cache all assets
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Initialize IndexedDB for offline operations
const DB_NAME = 'expenses-offline-db';
const STORE_NAME = 'offline-mutations';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
};

// Handle API routes with offline support
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/expenses'),
    async ({ request }) => {
        // Handle offline mutations (DELETE, POST, PUT)
        if (!navigator.onLine && ['DELETE', 'POST', 'PUT'].includes(request.method)) {
            try {
                const db = await initDB();
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                // Store the request for later
                await store.add({
                    url: request.url,
                    method: request.method,
                    headers: Array.from(request.headers.entries()),
                    body: request.method !== 'GET' ? await request.clone().text() : null,
                    timestamp: Date.now(),
                });

                return new Response(
                    JSON.stringify({
                        status: 'queued',
                        message: 'Operation queued for sync',
                    }),
                    {
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            } catch (error) {
                console.error('Error storing offline mutation:', error);
            }
        }

        // Online behavior
        return new NetworkFirst({
            cacheName: 'api-cache',
            networkTimeoutSeconds: 3,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 300, // 5 minutes
                }),
            ],
        }).handle({ request });
    }
);

// Background sync
self.addEventListener('sync', async event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncOfflineMutations());
    }
});

async function syncOfflineMutations() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const mutations = await store.getAll();

    for (const mutation of mutations) {
        try {
            const response = await fetch(mutation.url, {
                method: mutation.method,
                headers: new Headers(mutation.headers),
                body: mutation.method !== 'DELETE' ? mutation.body : undefined,
            });

            if (response.ok) {
                // Remove the mutation after successful sync
                const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                const deleteStore = deleteTx.objectStore(STORE_NAME);
                await deleteStore.delete(mutation.id);

                // Notify the client about successful sync
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETED',
                        mutation: mutation,
                    });
                });
            }
        } catch (error) {
            console.error('Failed to sync mutation:', error);
        }
    }
}

// Cache static resources
registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

// Cache images
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// Default route handler for other requests
registerRoute(
    ({ url }) => !url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'pages',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 86400,
            }),
        ],
    })
);
