const DB_NAME = 'expenses-offline-db';
const STORE_NAME = 'offline-mutations';
const DB_VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        if (!indexedDB) {
            reject(new Error('IndexedDB is not supported'));
            return;
        }

        console.log('Initializing IndexedDB...');
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = event => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = event => {
            const db = event.target.result;
            console.log('Database opened successfully');
            console.log('Database name:', db.name);
            console.log('Object stores:', db.objectStoreNames);
            resolve(db);
        };

        request.onupgradeneeded = event => {
            console.log('Database upgrade needed');
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.log('Creating object store:', STORE_NAME);
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true,
                });

                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('synced', 'synced', { unique: false });
                store.createIndex('retryCount', 'retryCount', { unique: false });

                console.log('Object store created successfully');
            }
        };

        request.onblocked = event => {
            console.warn('Database upgrade blocked. Please close other tabs.');
        };
    });
};

export const addOfflineExpense = async expense => {
    console.log('Adding offline expense:', expense);
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const serializedExpense = {
            url: '/api/expenses/add',
            method: 'POST',
            headers: [
                ['Content-Type', 'application/json'],
                ['Authorization', `Bearer ${expense.token}`],
            ],
            body: JSON.stringify({
                ...expense,
                amount: parseFloat(expense.amount),
                timestamp: Date.now(),
                offlineId: crypto.randomUUID(),
            }),
            timestamp: Date.now(),
            synced: false,
            retryCount: 0,
        };

        const request = store.add(serializedExpense);

        request.onsuccess = () => {
            console.log('Expense saved successfully:', request.result);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error saving expense:', request.error);
            reject(request.error);
        };

        transaction.oncomplete = () => {
            console.log('Transaction completed successfully');
        };

        transaction.onerror = () => {
            console.error('Transaction failed:', transaction.error);
        };
    });
};

export const getAllStoredExpenses = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
            const expenses = request.result;
            console.log('All stored expenses:', expenses);
            resolve(expenses);
        };

        request.onerror = () => {
            console.error('Error reading expenses:', request.error);
            reject(request.error);
        };
    });
};

export const getExpenseById = async id => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.get(id);

        request.onsuccess = () => {
            console.log(`Expense ${id}:`, request.result);
            resolve(request.result);
        };

        request.onerror = () => {
            console.error('Error reading expense:', request.error);
            reject(request.error);
        };
    });
};

export const deleteMutation = async id => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const syncOfflineExpenses = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    try {
        const mutations = await store.index('synced').getAll(false);
        console.log('Found unsynced mutations:', mutations);

        for (const mutation of mutations) {
            try {
                const expenseData = JSON.parse(mutation.body);
                console.log('Syncing expense:', expenseData);

                const response = await fetch(mutation.url, {
                    method: mutation.method,
                    headers: Object.fromEntries(mutation.headers),
                    body: mutation.body,
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                await deleteMutation(mutation.id);
                console.log('Successfully synced expense:', mutation.id);

                if (navigator.serviceWorker?.controller) {
                    navigator.serviceWorker.controller.postMessage({
                        type: 'SYNC_COMPLETED',
                        success: true,
                        data: expenseData,
                    });
                }
            } catch (error) {
                console.error('Error syncing mutation:', error);
                const updateTx = db.transaction([STORE_NAME], 'readwrite');
                const updateStore = updateTx.objectStore(STORE_NAME);
                mutation.retryCount = (mutation.retryCount || 0) + 1;
                if (mutation.retryCount >= 3) {
                    mutation.syncFailed = true;
                    mutation.failureReason = error.message;
                }
                await updateStore.put(mutation);
            }
        }
    } catch (error) {
        console.error('Fatal sync error:', error);
        throw error;
    }
};

export const checkDatabaseStatus = async () => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const countRequest = store.count();

        return new Promise(resolve => {
            countRequest.onsuccess = () => {
                resolve({
                    status: 'ok',
                    count: countRequest.result,
                    dbName: db.name,
                    dbVersion: db.version,
                    stores: Array.from(db.objectStoreNames),
                });
            };
        });
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
        };
    }
};

export const clearSyncedExpenses = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
        const request = store.index('synced').getAll(true);

        request.onsuccess = async () => {
            const syncedExpenses = request.result;
            console.log('Found synced expenses to clear:', syncedExpenses.length);

            for (const expense of syncedExpenses) {
                await store.delete(expense.id);
            }

            resolve(syncedExpenses.length);
        };

        request.onerror = () => {
            console.error('Error clearing synced expenses:', request.error);
            reject(request.error);
        };
    });
};

export const cleanupDatabase = async () => {
    try {
        const clearedCount = await clearSyncedExpenses();
        console.log(`Cleared ${clearedCount} synced expenses`);

        const status = await checkDatabaseStatus();
        console.log('Database status after cleanup:', status);
    } catch (error) {
        console.error('Error during database cleanup:', error);
    }
};
