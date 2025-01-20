import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    console.log('Node ENV:', process.env.NODE_ENV);

    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }

    const client = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Remove connectionTimeout and pool settings as they're not supported
    });

    return client;
};

const globalForPrisma = global.prisma || {};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

// Enhanced connection test
const testConnection = async () => {
    try {
        await prisma.$connect();
        console.log('Database connection test successful');
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database query test successful');
    } catch (error) {
        console.error('Database connection/query test failed:', {
            message: error.message,
            code: error.code,
            meta: error?.meta,
            stack: error.stack,
        });
    }
};

testConnection();
