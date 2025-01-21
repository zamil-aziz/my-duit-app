// Custom service worker logic for handling offline deletions
import { indexedDB } from 'idb';

// Database setup
const DB_NAME = 'ExpensesOfflineDB';
const STORE_NAME = 'pendingDeletions';

// Initialize IndexedDB
const initDB = async () => {
    const db = await indexedDB.open(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        },
    });
    return db;
};

// Listen for sync events
self.addEventListener('sync', async event => {
    if (event.tag === 'sync-deletions') {
        try {
            const db = await initDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const pendingDeletions = await store.getAll();

            for (const deletion of pendingDeletions) {
                try {
                    const response = await fetch(`/api/expenses/${deletion.id}`, {
                        method: 'DELETE',
                        headers: {
                            Authorization: deletion.token,
                        },
                    });

                    if (response.ok) {
                        // Remove from pending deletions if successful
                        const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                        const deleteStore = deleteTx.objectStore(STORE_NAME);
                        await deleteStore.delete(deletion.id);
                    }
                } catch (error) {
                    console.error('Error syncing deletion:', error);
                }
            }
        } catch (error) {
            console.error('Error in sync event:', error);
        }
    }
});

// Handle offline deletion requests
self.addEventListener('fetch', event => {
    if (event.request.method === 'DELETE' && event.request.url.includes('/api/expenses/')) {
        event.respondWith(
            (async () => {
                if (!navigator.onLine) {
                    const expenseId = event.request.url.split('/').pop();
                    const token = event.request.headers.get('Authorization');

                    try {
                        const db = await initDB();
                        const tx = db.transaction(STORE_NAME, 'readwrite');
                        const store = tx.objectStore(STORE_NAME);

                        await store.add({
                            id: expenseId,
                            token: token,
                            timestamp: Date.now(),
                        });

                        return new Response(JSON.stringify({ status: 'queued' }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    } catch (error) {
                        return new Response(JSON.stringify({ error: 'Failed to queue deletion' }), {
                            status: 500,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }
                }

                // If online, proceed with normal fetch
                return fetch(event.request);
            })()
        );
    }
});
