import { prisma } from '@/lib/db';
import { hash } from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Log the start of the request
        console.log('Signup request received');

        const body = await request.json();
        const { email, password, name } = body;
        console.log('Email received:', email);
        console.log('Name received:', name);
        // Don't log password for security

        // Validate input
        if (!email || !password || !name) {
            console.log('Missing required fields');
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        console.log('Checking for existing user...');
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log('User already exists with this email');
            return NextResponse.json(
                {
                    error: 'Email already registered',
                },
                { status: 400 }
            );
        }

        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await hash(password, 10);

        // Create user
        console.log('Creating new user...');
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const { password: _, ...userWithoutPassword } = user;

        console.log('User created successfully');
        return NextResponse.json(
            {
                message: 'User created successfully',
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        // Log detailed error information
        console.error('Signup error:', {
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
    }
}
