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
const EXPENSES_CACHE = 'expenses-cache';

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('synced', 'synced', { unique: false });
            }
        };
    });
};

// Helper function to serialize request data
const serializeRequest = async request => {
    const serialized = {
        url: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
        timestamp: Date.now(),
        synced: false,
    };

    if (request.method !== 'GET') {
        serialized.body = await request.clone().text();
    }

    return serialized;
};

// Handle API routes with offline support
registerRoute(
    ({ url }) => url.pathname.startsWith('/api/expenses'),
    async ({ event }) => {
        const request = event.request;

        // Check if we're offline and it's a mutation request
        if (!self.navigator.onLine && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
            try {
                const db = await initDB();
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                // Store the serialized request
                const serializedRequest = await serializeRequest(request);
                await store.add(serializedRequest);

                // Schedule a sync
                if ('sync' in self.registration) {
                    await self.registration.sync.register('sync-expenses');
                }

                // Return a "queued" response
                return new Response(
                    JSON.stringify({
                        status: 'offline',
                        message: 'Operation queued for sync',
                        timestamp: Date.now(),
                    }),
                    {
                        status: 202,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            } catch (error) {
                console.error('Error queuing offline operation:', error);
                return new Response(
                    JSON.stringify({
                        status: 'error',
                        message: 'Failed to queue offline operation',
                    }),
                    {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        }

        // Online behavior using NetworkFirst strategy
        return new NetworkFirst({
            cacheName: EXPENSES_CACHE,
            networkTimeoutSeconds: 3,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 300, // 5 minutes
                }),
            ],
        }).handle({ event });
    }
);

// Background sync handler
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncOfflineMutations());
    }
});

// Periodic sync handler (if supported)
self.addEventListener('periodicsync', event => {
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
        if (mutation.synced) continue;

        try {
            // Reconstruct the request
            const request = new Request(mutation.url, {
                method: mutation.method,
                headers: new Headers(mutation.headers),
                body: mutation.body,
                mode: mutation.mode,
                credentials: mutation.credentials,
                cache: mutation.cache,
                redirect: mutation.redirect,
                referrer: mutation.referrer,
                integrity: mutation.integrity,
            });

            const response = await fetch(request);

            if (response.ok) {
                // Mark as synced
                const updateTx = db.transaction(STORE_NAME, 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                mutation.synced = true;
                await updateStore.put(mutation);

                // Clear the cached data to force a refresh
                const cache = await caches.open(EXPENSES_CACHE);
                const cachedRequests = await cache.keys();
                for (const cachedRequest of cachedRequests) {
                    if (cachedRequest.url.includes('/api/expenses')) {
                        await cache.delete(cachedRequest);
                    }
                }

                // Notify all clients
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETED',
                        mutation: {
                            url: mutation.url,
                            method: mutation.method,
                            timestamp: mutation.timestamp,
                        },
                    });
                });
            }
        } catch (error) {
            console.error('Sync failed for mutation:', error);
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

// Default handler for other requests
registerRoute(
    ({ url }) => !url.pathname.startsWith('/api/'),
    new NetworkFirst({
        cacheName: 'pages',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 32,
                maxAgeSeconds: 86400, // 24 hours
            }),
        ],
    })
);

// Listen for messages from clients
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
