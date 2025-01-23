import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export async function checkDatabaseStatus() {
    try {
        const response = await fetch('/api/offline-status');
        return await response.json();
    } catch (error) {
        return { isConnected: false, count: 0 };
    }
}
