import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user's expenses
        const expenses = await prisma.expense.findMany({
            where: {
                userId: decoded.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate summary data
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const monthlyExpenses = expenses.reduce((acc, expense) => {
            const month = new Date(expense.createdAt).getMonth();
            if (!acc[month]) acc[month] = [];
            acc[month].push(expense);
            return acc;
        }, {});

        const monthlyAverages = Object.values(monthlyExpenses).map(monthExp =>
            monthExp.reduce((sum, exp) => sum + exp.amount, 0)
        );
        const monthlyAverage = monthlyAverages.length
            ? monthlyAverages.reduce((sum, val) => sum + val, 0) / monthlyAverages.length
            : 0;

        const largestExpense = expenses.length ? Math.max(...expenses.map(exp => exp.amount)) : 0;

        return NextResponse.json({
            expenses,
            summary: {
                totalSpent,
                monthlyAverage,
                largestExpense,
            },
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
