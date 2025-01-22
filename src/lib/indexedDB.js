const DB_NAME = 'expenses-offline-db';
const STORE_NAME = 'offline-mutations';

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

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
            }
        };
    });
};

export const addOfflineExpense = async expense => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const serializedExpense = {
        url: '/api/expenses/add',
        method: 'POST',
        headers: [
            ['Content-Type', 'application/json'],
            ['Authorization', `Bearer ${expense.token}`],
        ],
        body: JSON.stringify(expense),
        timestamp: Date.now(),
        synced: false,
    };

    return new Promise((resolve, reject) => {
        const request = store.add(serializedExpense);

        request.onsuccess = async () => {
            // Try to trigger sync after adding
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.sync.register('sync-expenses');
                } catch (error) {
                    console.error('Failed to register sync:', error);
                }
            } else if (navigator.serviceWorker?.controller) {
                // Fallback for browsers that don't support background sync
                navigator.serviceWorker.controller.postMessage({
                    type: 'TRIGGER_SYNC',
                });
            }
            resolve(request.result);
        };

        request.onerror = () => reject(request.error);

        // Commit the transaction
        transaction.oncomplete = () => {
            console.log('Transaction completed');
        };

        transaction.onerror = () => {
            console.error('Transaction failed:', transaction.error);
        };
    });
};

export const getOfflineMutations = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.index('synced').getAll(false);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const markMutationAsSynced = async id => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = () => {
            const mutation = request.result;
            if (mutation) {
                mutation.synced = true;
                const updateRequest = store.put(mutation);
                updateRequest.onsuccess = () => resolve();
                updateRequest.onerror = () => reject(updateRequest.error);
            } else {
                resolve(); // Mutation might have been deleted
            }
        };

        request.onerror = () => reject(request.error);
    });
};

export const deleteMutation = async id => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
