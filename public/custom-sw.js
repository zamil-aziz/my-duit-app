importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { clientsClaim } = workbox.core;

self.skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

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
                store.createIndex('retryCount', 'retryCount', { unique: false });
            }
        };
    });
};

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
        retryCount: 0,
    };

    if (request.method !== 'GET') {
        serialized.body = await request.clone().text();
    }

    return serialized;
};

registerRoute(
    ({ url }) => url.pathname.startsWith('/api/expenses'),
    async ({ event }) => {
        const request = event.request;

        if (!self.navigator.onLine && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
            try {
                const db = await initDB();
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                const serializedRequest = await serializeRequest(request);
                await store.add(serializedRequest);

                if ('sync' in self.registration) {
                    await self.registration.sync.register('sync-expenses');
                }

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

        return new NetworkFirst({
            cacheName: EXPENSES_CACHE,
            networkTimeoutSeconds: 3,
            plugins: [
                new ExpirationPlugin({
                    maxEntries: 50,
                    maxAgeSeconds: 300,
                }),
            ],
        }).handle({ event });
    }
);

async function syncOfflineMutations() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const mutations = await store.index('synced').getAll(false);

    let syncedCount = 0;

    for (const mutation of mutations) {
        try {
            const headers = new Headers();
            mutation.headers.forEach(([key, value]) => headers.append(key, value));

            const token = headers.get('Authorization');
            if (!token) {
                console.error('No authorization token found for mutation:', mutation.id);
                continue;
            }

            const response = await fetch(mutation.url, {
                method: mutation.method,
                headers: headers,
                body: mutation.body,
                mode: 'cors',
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const deleteTx = db.transaction(STORE_NAME, 'readwrite');
            await deleteTx.objectStore(STORE_NAME).delete(mutation.id);

            syncedCount++;

            const cache = await caches.open(EXPENSES_CACHE);
            const cachedRequests = await cache.keys();
            for (const cachedRequest of cachedRequests) {
                if (cachedRequest.url.includes('/api/expenses')) {
                    await cache.delete(cachedRequest);
                }
            }

            const clients = await self.clients.matchAll();
            for (const client of clients) {
                client.postMessage({
                    type: 'SYNC_COMPLETED',
                    success: true,
                    data: JSON.parse(mutation.body),
                });
            }
        } catch (error) {
            console.error('Sync failed:', error);

            const updateTx = db.transaction(STORE_NAME, 'readwrite');
            mutation.retryCount = (mutation.retryCount || 0) + 1;

            if (mutation.retryCount >= 3) {
                mutation.syncFailed = true;
                mutation.failureReason = error.message;

                const clients = await self.clients.matchAll();
                for (const client of clients) {
                    client.postMessage({
                        type: 'SYNC_FAILED',
                        error: error.message,
                        mutation: JSON.parse(mutation.body),
                    });
                }
            }

            await updateTx.objectStore(STORE_NAME).put(mutation);
        }
    }

    return syncedCount > 0;
}

self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncOfflineMutations());
    }
});

self.addEventListener('message', event => {
    if (event.data?.type === 'TRIGGER_SYNC') {
        event.waitUntil(syncOfflineMutations());
    }
});

registerRoute(
    ({ request }) => request.destination === 'style' || request.destination === 'script',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
    })
);

registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
            }),
        ],
    })
);

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
