import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Debug logging
    console.log('Node ENV:', process.env.NODE_ENV);
    console.log('Database URL (masked):', process.env.DATABASE_URL?.replace(/:[^:@]{1,}@/, ':****@'));

    const client = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    return client;
};

const globalForPrisma = global.prisma || {};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Test connection on startup
prisma
    .$connect()
    .then(() => console.log('Initial database connection test successful'))
    .catch(error => {
        console.error('Initial database connection test failed:', {
            message: error.message,
            code: error.code,
            meta: error?.meta,
        });
    });
