const STORE_NAME = 'expenses-offline-db';

// Install event - set up any caching needed
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

// Listen for sync events
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(syncExpenses());
    }
});

// Listen for messages from the client
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'TRIGGER_SYNC') {
        event.waitUntil(syncExpenses());
    }
});

// Function to handle syncing expenses
async function syncExpenses() {
    try {
        const db = await openDB();
        const mutations = await getOfflineMutations(db);

        if (!mutations.length) return;

        const successfulSyncs = [];

        for (const mutation of mutations) {
            try {
                if (mutation.synced) continue;

                const response = await fetch(mutation.url, {
                    method: mutation.method,
                    headers: Object.fromEntries(mutation.headers),
                    body: mutation.body,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Add to successful syncs
                successfulSyncs.push(mutation.id);

                // Notify clients
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

        // Delete all successfully synced mutations
        for (const id of successfulSyncs) {
            await deleteMutation(db, id);
        }

        // If any syncs were successful, notify clients to refresh data
        if (successfulSyncs.length > 0) {
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'REFRESH_DATA',
                });
            });
        }
    } catch (error) {
        console.error('Sync process failed:', error);
    }
}

// ... rest of your IndexedDB helper functions remain the same
