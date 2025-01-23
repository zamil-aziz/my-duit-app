export async function syncOfflineExpenses() {
    try {
        const db = await openDB('expenses-offline-db', 1);
        const offlineData = await db.getAll('offline-mutations');

        const results = await Promise.allSettled(
            offlineData.map(async item => {
                try {
                    // Extract just the required fields for the API
                    const expenseData = JSON.parse(item.body);
                    const response = await fetch('/api/expenses/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${item.headers.Authorization}`,
                        },
                        body: JSON.stringify({
                            amount: expenseData.amount,
                            description: expenseData.description,
                        }),
                    });

                    if (!response.ok) throw new Error(await response.text());
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
