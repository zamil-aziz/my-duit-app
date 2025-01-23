import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export async function checkDatabaseStatus() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { isConnected: true, count: await getOfflineCount() };
    } catch (error) {
        console.error('Database check failed:', error);
        return { isConnected: false, count: 0 };
    }
}
