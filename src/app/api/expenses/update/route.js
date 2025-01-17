import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function PUT(request) {
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
        const { id, amount, description } = await request.json();

        if (!id || (!amount && !description)) {
            return NextResponse.json({ error: 'Invalid update data provided' }, { status: 400 });
        }

        // Find the expense and verify ownership
        const existingExpense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existingExpense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        if (existingExpense.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update the expense
        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                description: description || undefined,
            },
        });

        return NextResponse.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
