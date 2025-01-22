'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddExpense } from './AddExpense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { addOfflineExpense } from '@/lib/indexedDB';

export function AddExpenseSection({ onExpenseAdded }) {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial online status
        setIsOnline(navigator.onLine);

        // Listen for online/offline events
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Listen for sync completion messages from service worker
        const handleSyncComplete = event => {
            if (event.data && event.data.type === 'SYNC_COMPLETED') {
                if (event.data.mutation.method === 'POST') {
                    setStatus({
                        type: 'success',
                        message: 'Offline expense successfully synced!',
                    });
                    onExpenseAdded?.();

                    // Clear success message after 3 seconds
                    setTimeout(() => {
                        setStatus({ type: '', message: '' });
                    }, 3000);
                }
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker?.addEventListener('message', handleSyncComplete);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker?.removeEventListener('message', handleSyncComplete);
        };
    }, [onExpenseAdded]);

    const handleAddExpense = async expenseData => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Check if we're offline first
            if (!navigator.onLine) {
                try {
                    await addOfflineExpense({
                        ...expenseData,
                        token, // Store the token with the expense for later sync
                        timestamp: Date.now(),
                    });

                    setStatus({
                        type: 'info',
                        message: "You're offline. Expense saved and will sync when you're back online.",
                    });

                    // Trigger sync if service worker is available
                    if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker.controller) {
                        const registration = await navigator.serviceWorker.ready;
                        await registration.sync.register('sync-expenses');
                    }

                    onExpenseAdded?.();
                    return;
                } catch (offlineError) {
                    console.error('Failed to save offline:', offlineError);
                    throw new Error('Failed to save expense offline');
                }
            }

            // Online flow
            const response = await fetch('/api/expenses/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(expenseData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }

            setStatus({
                type: 'success',
                message: 'Expense added successfully!',
            });

            // Clear success/info message after 3 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);

            // Trigger refresh of expense data
            onExpenseAdded?.();
        } catch (error) {
            console.error('Error adding expense:', error);

            if (!navigator.onLine) {
                setStatus({
                    type: 'error',
                    message: 'Failed to save expense offline. Please try again.',
                });
            } else {
                setStatus({
                    type: 'error',
                    message: error.message || 'Failed to add expense',
                });
            }
        }
    };

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm h-full'>
            <CardHeader>
                <CardTitle className='text-lg font-semibold text-white flex items-center justify-between'>
                    <span>Add Expense</span>
                    {!isOnline && (
                        <div className='flex items-center text-yellow-500 text-sm'>
                            <WifiOff className='h-4 w-4 mr-1' />
                            <span>Offline Mode</span>
                        </div>
                    )}
                </CardTitle>
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
                {status.type === 'info' && (
                    <Alert className='mb-4 bg-blue-900/50 border-blue-900 text-blue-300'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertDescription>{status.message}</AlertDescription>
                    </Alert>
                )}
                <AddExpense onSubmit={handleAddExpense} />
            </CardContent>
        </Card>
    );
}
