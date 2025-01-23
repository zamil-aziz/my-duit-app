import { openDB } from 'idb';

export async function syncOfflineExpenses() {
    try {
        const db = await openDB('expenses-offline-db', 1);
        const offlineData = await db.getAll('offline-mutations');

        const results = await Promise.allSettled(
            offlineData.map(async item => {
                try {
                    const response = await fetch(item.url, {
                        method: item.method,
                        headers: new Headers(item.headers),
                        body: item.body,
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

        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return { succeeded, failed };
    } catch (error) {
        console.error('Sync error:', error);
        throw error;
    }
}
