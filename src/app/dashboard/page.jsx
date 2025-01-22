'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddExpense } from '@/components/dashboard/AddExpense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { addOfflineExpense } from '@/lib/indexedDB';
import { toast } from '@/components/ui/toast';

export function AddExpenseSection({ onExpenseAdded }) {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial online status and register service worker
        setIsOnline(navigator.onLine);

        // Enhanced online handler
        const handleOnline = async () => {
            setIsOnline(true);
            toast({
                title: "You're back online",
                description: 'Syncing your data...',
            });
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-expenses');
                setTimeout(() => {
                    onExpenseAdded?.();
                }, 1000);
            } catch (error) {
                console.error('Error triggering sync:', error);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast({
                title: "You're offline",
                description: "Changes will be saved locally and synced when you're back online.",
            });
        };

        const handleMessage = event => {
            if (event.data?.type === 'SYNC_COMPLETED') {
                console.log('Sync completed:', event.data);
                onExpenseAdded?.();
                toast({
                    title: 'Sync complete',
                    description: 'Your offline changes have been synchronized.',
                });
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker?.addEventListener('message', handleMessage);

        // Register service worker if needed
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(async registration => {
                    if (navigator.onLine) {
                        try {
                            await registration.sync.register('sync-expenses');
                        } catch (error) {
                            console.error('Failed to register sync:', error);
                        }
                    }
                })
                .catch(console.error);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
        };
    }, [onExpenseAdded]);

    const handleAddExpense = async expenseData => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            const expense = {
                ...expenseData,
                token,
                timestamp: Date.now(),
                id: crypto.randomUUID(),
            };

            // Check if we're offline first
            if (!navigator.onLine) {
                try {
                    await addOfflineExpense(expense);

                    setStatus({
                        type: 'info',
                        message: "You're offline. Expense saved and will sync when you're back online.",
                    });

                    toast({
                        title: 'Expense Saved Offline',
                        description: "Your expense has been saved locally and will sync when you're back online.",
                    });

                    // Request sync if available
                    if (navigator.serviceWorker?.controller) {
                        navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
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
                body: JSON.stringify(expense),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add expense');
            }

            setStatus({
                type: 'success',
                message: 'Expense added successfully!',
            });

            toast({
                title: 'Success',
                description: 'Expense added successfully!',
            });

            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);

            onExpenseAdded?.();
        } catch (error) {
            console.error('Error adding expense:', error);

            setStatus({
                type: 'error',
                message: !navigator.onLine
                    ? 'Failed to save expense offline. Please try again.'
                    : error.message || 'Failed to add expense',
            });

            toast({
                variant: 'destructive',
                title: 'Error',
                description: !navigator.onLine
                    ? 'Failed to save expense offline. Please try again.'
                    : error.message || 'Failed to add expense',
            });
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
