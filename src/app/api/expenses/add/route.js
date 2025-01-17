import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get request body
        const { amount, description } = await request.json();

        // Validate input
        if (!amount || !description) {
            return NextResponse.json({ error: 'Amount and description are required' }, { status: 400 });
        }

        // Create new expense
        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                description,
                userId: decoded.userId,
            },
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error adding expense:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
