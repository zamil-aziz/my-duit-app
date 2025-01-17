import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        console.log('Auth header exists:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Invalid auth header format');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        try {
            var decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully. User ID:', decoded.userId);
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch user's expenses
        console.log('Fetching expenses for user:', decoded.userId);
        const expenses = await prisma.expense.findMany({
            where: {
                userId: decoded.userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log('Found expenses count:', expenses.length);
        console.log('Raw expense example:', expenses[0]);

        // Transform the data to match the expected format
        const transformedExpenses = expenses.map(expense => {
            console.log('Raw expense:', expense);
            // Transform to camelCase
            const transformed = {
                id: expense.id,
                amount: expense.amount,
                description: expense.description,
                createdAt: expense.createdAt, // Fix the casing
                updatedAt: expense.updatedAt, // Fix the casing
            };
            console.log('Transformed expense:', transformed);
            return transformed;
        });

        // Calculate summary data
        const totalSpent = transformedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        console.log('Total spent calculated:', totalSpent);

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

        console.log('Sending response with expenses count:', transformedExpenses.length);
        console.log('First expense (if any):', transformedExpenses[0] || 'No expenses');

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in GET /api/expenses:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
