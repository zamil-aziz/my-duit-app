import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });
};

const globalForPrisma = global.prisma || {};
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export async function checkDatabaseStatus() {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));

    try {
        const result = await Promise.race([prisma.$queryRaw`SELECT 1`, timeout]);

        return {
            isConnected: true,
            count: 0,
        };
    } catch (error) {
        console.error('Database check failed:', error);
        return {
            isConnected: false,
            count: 0,
        };
    }
}
