import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function DELETE(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get expense ID from the URL
        const url = new URL(request.url);
        const expenseId = url.searchParams.get('id');

        if (!expenseId) {
            return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
        }

        // Find the expense and verify ownership
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
        });

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        if (expense.userId !== decoded.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete the expense
        await prisma.expense.delete({
            where: { id: expenseId },
        });

        return NextResponse.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
