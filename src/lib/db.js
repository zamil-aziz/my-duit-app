import { PrismaClient } from '@prisma/client';

const globalForPrisma = global.prisma || {};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
    });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
