import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            var decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const expenses = await prisma.expense.findMany({
            where: {
                userId: decoded.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const transformedExpenses = expenses.map(expense => ({
            id: expense.id,
            amount: expense.amount,
            description: expense.description,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
        }));

        const totalSpent = transformedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        const monthlyExpenses = transformedExpenses.reduce((acc, expense) => {
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

        const largestExpense = transformedExpenses.length ? Math.max(...transformedExpenses.map(exp => exp.amount)) : 0;

        const response = {
            expenses: transformedExpenses,
            summary: {
                totalSpent,
                monthlyAverage,
                largestExpense,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
