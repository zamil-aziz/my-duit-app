import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    return new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        // Add connection retry logic
        connectionTimeout: 60000,
        maxRetries: 3,
    });
};

const globalForPrisma = global.prisma || {};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
