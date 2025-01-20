import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Create a single PrismaClient instance with logging and connection config
const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

export async function POST(request) {
    try {
        // Log the start of the request
        console.log('Login request received');

        // Test database connection
        console.log('Attempting database connection...');
        await prisma.$connect();
        console.log('Database connection successful');

        // Parse request body
        const { email, password } = await request.json();
        console.log('Email received:', email);
        // Don't log password for security

        // Validate input
        if (!email || !password) {
            console.log('Missing required fields');
            return NextResponse.json(
                {
                    error: 'Email and password are required',
                },
                { status: 400 }
            );
        }

        // Find user by email
        console.log('Finding user in database...');
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
            },
        });

        // Log user found status (without sensitive details)
        console.log('User found:', !!user);

        // Check if user exists
        if (!user) {
            console.log('User not found');
            return NextResponse.json(
                {
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        // Compare passwords
        console.log('Comparing passwords...');
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('Password does not match');
            return NextResponse.json(
                {
                    error: 'Invalid email or password',
                },
                { status: 401 }
            );
        }

        // Verify JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            throw new Error('JWT_SECRET is not configured');
        }

        // Create JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('Login successful');

        // Return success response
        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        // Log detailed error information
        console.error('Login error:', {
            message: error.message,
            name: error.name,
            code: error.code,
            meta: error?.meta,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });

        // Determine if error is related to database connection
        const isConnectionError = error.message?.includes("Can't reach database server");

        // Return appropriate error response
        return NextResponse.json(
            {
                error: isConnectionError ? 'Database connection failed' : 'Internal server error',
                details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
                code: error?.code || 'UNKNOWN',
            },
            {
                status: isConnectionError ? 503 : 500,
            }
        );
    } finally {
        // Ensure database connection is properly closed
        try {
            console.log('Disconnecting from database...');
            await prisma.$disconnect();
            console.log('Database disconnection successful');
        } catch (e) {
            console.error('Error disconnecting from database:', e);
        }
    }
}
