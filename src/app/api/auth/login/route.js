import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        // Log the start of the request
        console.log('Login request received');

        const { email, password } = await request.json();
        console.log('Email received:', email);
        // Don't log the password for security reasons

        // Find user by email
        console.log('Finding user in database...');
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Log user found status (without sensitive details)
        console.log('User found:', !!user);

        // Check if user exists
        if (!user) {
            console.log('User not found');
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Compare passwords
        console.log('Comparing passwords...');
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            console.log('Password does not match');
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Verify JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            throw new Error('JWT_SECRET is not configured');
        }

        // Create JWT token
        console.log('Creating JWT token...');
        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        console.log('Login successful');
        return NextResponse.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        // Log the detailed error
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack,
        });

        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
