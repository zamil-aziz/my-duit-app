import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Log the environment
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Initializing PrismaClient...');

    const client = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

    // Test the connection
    client
        .$connect()
        .then(() => console.log('Database connection successful'))
        .catch(e => console.error('Database connection failed:', e));

    return client;
};

const globalForPrisma = global.prisma || {};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
