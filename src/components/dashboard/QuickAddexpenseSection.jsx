'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickAddExpense } from './QuickAddExpense';

export function QuickAddExpenseSection() {
    const handleAddExpense = expenseData => {
        console.log('New expense:', expenseData);
        // Here you would typically make an API call to save the expense
    };

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm h-full'>
            <CardHeader>
                <CardTitle className='text-lg font-semibold text-white'>Quick Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
                <QuickAddExpense onSubmit={handleAddExpense} />
            </CardContent>
        </Card>
    );
}
