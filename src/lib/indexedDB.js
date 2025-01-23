importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const DB_NAME = 'expenses-offline-db';
const STORE_NAME = 'offline-mutations';
const DB_VERSION = 1;

// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('retryCount', 'retryCount', { unique: false });
            }
        };
    });
};

// Add your existing service worker event listeners
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(clients.claim()));

// Update sync function to use your IndexedDB implementation
async function syncExpenses() {
    try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const mutations = await store.index('synced').getAll(false);

        for (const mutation of mutations) {
            try {
                const response = await fetch(mutation.url, {
                    method: mutation.method,
                    headers: Object.fromEntries(mutation.headers),
                    body: mutation.body,
                    credentials: 'same-origin',
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                await deleteMutation(mutation.id);

                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SYNC_COMPLETED',
                        mutation: {
                            id: mutation.id,
                            method: mutation.method,
                        },
                    });
                });
            } catch (error) {
                console.error('Sync failed for mutation:', mutation.id, error);
            }
        }
    } catch (error) {
        console.error('Sync process failed:', error);
    }
}

self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncExpenses());
    }
});

self.addEventListener('message', event => {
    if (event.data?.type === 'TRIGGER_SYNC') {
        event.waitUntil(syncExpenses());
    }
});
