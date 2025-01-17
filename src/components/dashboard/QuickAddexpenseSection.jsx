'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickAddExpense } from './QuickAddExpense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function QuickAddExpenseSection({ onExpenseAdded }) {
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleAddExpense = async expenseData => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const response = await fetch('/api/expenses/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(expenseData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add expense');
            }

            // Show success message
            setStatus({
                type: 'success',
                message: 'Expense added successfully!',
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);

            // Trigger refresh of expense data
            onExpenseAdded?.();
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.message || 'Failed to add expense',
            });
        }
    };

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm h-full'>
            <CardHeader>
                <CardTitle className='text-lg font-semibold text-white'>Quick Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
                {status.type === 'error' && (
                    <Alert variant='destructive' className='mb-4 bg-red-900/50 border-red-900 text-red-300'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}
                {status.type === 'success' && (
                    <Alert className='mb-4 bg-green-900/50 border-green-900 text-green-300'>
                        <CheckCircle className='h-4 w-4' />
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}
                <QuickAddExpense onSubmit={handleAddExpense} />
            </CardContent>
        </Card>
    );
}
