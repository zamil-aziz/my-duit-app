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
                store.createIndex('retryCount', 'retryCount', { unique: false });
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
        retryCount: 0,
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
                console.log('Stored offline request:', serializedRequest);

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

async function syncOfflineMutations() {
    console.log('Starting offline mutations sync');
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    try {
        const mutations = await store.index('synced').getAll(false);
        console.log('Found mutations to sync:', mutations.length);
        let syncedCount = 0;

        for (const mutation of mutations) {
            try {
                // Parse the stored data
                const expenseData = JSON.parse(mutation.body);
                console.log('Processing mutation:', expenseData);

                // Reconstruct the request with proper headers
                const headers = new Headers();
                mutation.headers.forEach(([key, value]) => headers.append(key, value));

                // Ensure the Authorization header is present
                const token = headers.get('Authorization');
                if (!token) {
                    console.error('No authorization token found for mutation:', mutation.id);
                    continue;
                }

                const request = new Request(mutation.url, {
                    method: mutation.method,
                    headers: headers,
                    body: mutation.body,
                    mode: 'cors',
                    credentials: 'same-origin',
                });

                console.log('Sending sync request:', {
                    url: mutation.url,
                    method: mutation.method,
                    headers: Object.fromEntries(headers.entries()),
                    body: mutation.body,
                });

                const response = await fetch(request);
                console.log('Sync response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const responseData = await response.json();
                console.log('Sync response data:', responseData);

                // If sync successful, delete the mutation
                const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                const deleteStore = deleteTx.objectStore(STORE_NAME);
                await deleteStore.delete(mutation.id);
                console.log('Deleted synced mutation:', mutation.id);

                syncedCount++;

                // Clear relevant caches
                const cache = await caches.open(EXPENSES_CACHE);
                const cachedRequests = await cache.keys();
                for (const cachedRequest of cachedRequests) {
                    if (cachedRequest.url.includes('/api/expenses')) {
                        await cache.delete(cachedRequest);
                    }
                }

                // Notify all clients
                const clients = await self.clients.matchAll();
                for (const client of clients) {
                    client.postMessage({
                        type: 'SYNC_COMPLETED',
                        success: true,
                        data: expenseData,
                        response: responseData,
                    });
                }
            } catch (error) {
                console.error('Error syncing mutation:', error);

                // Update retry count
                const updateTx = db.transaction(STORE_NAME, 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                mutation.retryCount = (mutation.retryCount || 0) + 1;

                if (mutation.retryCount >= 3) {
                    mutation.syncFailed = true;
                    mutation.failureReason = error.message;

                    // Notify clients of permanent failure
                    const clients = await self.clients.matchAll();
                    for (const client of clients) {
                        client.postMessage({
                            type: 'SYNC_FAILED',
                            error: error.message,
                            mutation: JSON.parse(mutation.body),
                        });
                    }
                }

                await updateStore.put(mutation);
            }
        }

        // Final sync status notification
        const clients = await self.clients.matchAll();
        for (const client of clients) {
            client.postMessage({
                type: 'SYNC_STATUS',
                totalProcessed: mutations.length,
                successCount: syncedCount,
                failureCount: mutations.length - syncedCount,
            });
        }

        return syncedCount > 0;
    } catch (error) {
        console.error('Fatal sync error:', error);
        throw error;
    }
}

// Background sync handler
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        console.log('Background sync triggered');
        event.waitUntil(
            syncOfflineMutations()
                .then(hasSync => {
                    console.log('Sync completed, changes synced:', hasSync);
                })
                .catch(error => {
                    console.error('Background sync failed:', error);
                    // Only retry if we haven't exceeded the retry limit
                    return self.registration.sync.register('sync-expenses');
                })
        );
    }
});

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
self.addEventListener('message', async event => {
    if (event.data?.type === 'TRIGGER_SYNC') {
        console.log('Manual sync triggered');
        event.waitUntil(
            syncOfflineMutations()
                .then(hasSync => {
                    console.log('Manual sync completed, changes synced:', hasSync);
                    // Notify the client that triggered the sync
                    event.source?.postMessage({
                        type: 'MANUAL_SYNC_COMPLETED',
                        success: true,
                    });
                })
                .catch(error => {
                    console.error('Manual sync failed:', error);
                    event.source?.postMessage({
                        type: 'MANUAL_SYNC_COMPLETED',
                        success: false,
                        error: error.message,
                    });
                })
        );
    } else if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
