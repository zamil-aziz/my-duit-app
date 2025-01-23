let db;

self.addEventListener('install', event => {
    event.waitUntil(
        openDB().then(database => {
            db = database;
        })
    );
});

self.addEventListener('message', event => {
    if (event.data.type === 'STORE_OFFLINE_EXPENSE') {
        event.waitUntil(
            db.add('expenses', event.data.expense).then(() => self.registration.sync.register('sync-expenses'))
        );
    }
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(
            db.getAll('expenses').then(expenses => {
                return Promise.all(
                    expenses.map(expense =>
                        fetch('/api/expenses/add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${expense.token}`,
                            },
                            body: JSON.stringify(expense),
                        }).then(() => db.delete('expenses', expense.id))
                    )
                );
            })
        );
    }
});

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ExpensesDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = event => {
            const db = event.target.result;
            db.createObjectStore('expenses', { keyPath: 'id' });
        };
    });
}
