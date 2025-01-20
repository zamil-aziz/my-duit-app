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
        // Add connection timeout settings
        connectionTimeout: 60000,
        pool: {
            min: 0,
            max: 1,
        },
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

        // Optional: Test a simple query
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database query test successful');
    } catch (error) {
        console.error('Database connection/query test failed:', {
            message: error.message,
            code: error.code,
            meta: error?.meta,
            stack: error.stack,
        });
        // Optionally force exit if connection fails
        // process.exit(1);
    }
};

testConnection();
