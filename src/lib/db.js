import { PrismaClient } from '@prisma/client';
import { openDB } from 'idb';

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export async function checkDatabaseStatus() {
    try {
        const db = await openDB('expenses-offline-db', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('offline-mutations')) {
                    db.createObjectStore('offline-mutations', { keyPath: 'id' });
                }
            },
        });
        const count = await db.count('offline-mutations');
        console.log('IndexedDB count:', count);
        return { isConnected: true, count };
    } catch (error) {
        console.error('DB Status check error:', error);
        return { isConnected: false, count: 0 };
    }
}
