import { openDB } from 'idb';

export async function syncOfflineExpenses() {
    try {
        const db = await openDB('expenses-offline-db', 1);
        const offlineData = await db.getAll('offline-mutations');

        console.log('Offline data to sync:', offlineData); // Debug log

        const results = await Promise.allSettled(
            offlineData.map(async item => {
                try {
                    const expenseData = JSON.parse(item.body);
                    console.log('Parsed expense data:', expenseData); // Debug log

                    const response = await fetch('/api/expenses/add', {
                        method: 'POST',
                        headers: item.headers,
                        body: JSON.stringify({
                            amount: Number(expenseData.amount),
                            description: expenseData.description,
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('API Error:', errorData); // Debug log
                        throw new Error(JSON.stringify(errorData));
                    }

                    await db.delete('offline-mutations', item.id);
                    return true;
                } catch (error) {
                    console.error('Sync failed for item:', item, error);
                    throw error;
                }
            })
        );

        return {
            succeeded: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
        };
    } catch (error) {
        console.error('Sync error:', error);
        throw error;
    }
}
