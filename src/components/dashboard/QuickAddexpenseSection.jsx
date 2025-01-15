'use client';
import { QuickAddExpense } from '@/components/dashboard/QuickAddExpense';

export function QuickAddExpenseSection() {
    const handleAddExpense = expenseData => {
        // Handle the expense submission
        console.log('New expense:', expenseData);
    };

    return <QuickAddExpense onSubmit={handleAddExpense} />;
}
