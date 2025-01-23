'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddExpense } from './AddExpense';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { checkDatabaseStatus } from '@/lib/db';

export function AddExpenseSection({ onExpenseAdded }) {
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isOnline, setIsOnline] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        let isMounted = true;

        const checkDB = async () => {
            try {
                const status = await checkDatabaseStatus();
                if (isMounted) {
                    console.log('Database status:', status);
                    setStatus({
                        type: status.isConnected ? 'success' : 'error',
                        message: status.isConnected ? 'Connected' : 'Disconnected',
                    });
                }
            } catch (error) {
                if (isMounted) {
                    setStatus({
                        type: 'error',
                        message: 'Connection failed',
                    });
                }
            }
        };

        checkDB();
        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = async () => {
            try {
                setIsOnline(true);
                console.log('Device went online, starting sync process...');

                // First, check database status
                const dbStatus = await checkDatabaseStatus();
                console.log('Database status before sync:', dbStatus);

                if (dbStatus.count > 0) {
                    toast({
                        title: "You're back online",
                        description: 'Syncing your data...',
                    });

                    // Try direct sync first with error logging
                    try {
                        console.log('Starting direct sync...');
                        const syncResult = await syncOfflineExpenses();
                        console.log('Direct sync completed, result:', syncResult);

                        // Only trigger refresh if sync was successful
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        onExpenseAdded?.();
                    } catch (syncError) {
                        console.error('Direct sync failed with error:', syncError);

                        // Don't auto-refresh on error, let user retry
                        toast({
                            variant: 'destructive',
                            title: 'Sync Failed',
                            description: 'Failed to sync offline changes. Tap to retry.',
                            action: async () => {
                                try {
                                    await syncOfflineExpenses();
                                    onExpenseAdded?.();
                                } catch (retryError) {
                                    console.error('Retry sync failed:', retryError);
                                }
                            },
                        });

                        // Still try background sync as fallback
                        try {
                            const registration = await navigator.serviceWorker.ready;
                            await registration.sync.register('sync-expenses');
                            console.log('Background sync registered as fallback');
                        } catch (regError) {
                            console.error('Failed to register background sync:', regError);
                        }
                    }
                } else {
                    console.log('No offline data to sync');
                }
            } catch (error) {
                console.error('Error during online transition:', error);
                // Prevent auto-refresh on error
                toast({
                    variant: 'destructive',
                    title: 'Sync Error',
                    description: error.message || 'Failed to sync changes',
                    duration: 5000, // Keep the message visible longer
                });
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
            switch (event.data?.type) {
                case 'SYNC_COMPLETED':
                    onExpenseAdded?.();
                    toast({
                        title: 'Sync complete',
                        description: 'Your changes have been synchronized.',
                    });
                    break;

                case 'SYNC_FAILED':
                    toast({
                        variant: 'destructive',
                        title: 'Sync failed',
                        description: `Failed to sync: ${event.data.error}`,
                    });
                    break;

                case 'SYNC_STATUS':
                    if (event.data.failureCount > 0) {
                        toast({
                            variant: 'warning',
                            title: 'Sync completed with errors',
                            description: `${event.data.successCount} succeeded, ${event.data.failureCount} failed`,
                        });
                    }
                    break;
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker?.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
        };
    }, [onExpenseAdded, toast]);

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

            if (!navigator.onLine) {
                try {
                    if (navigator.serviceWorker?.controller) {
                        navigator.serviceWorker.controller.postMessage({
                            type: 'STORE_OFFLINE_EXPENSE',
                            expense,
                        });

                        setStatus({
                            type: 'info',
                            message: "You're offline. Expense saved and will sync when you're back online.",
                        });

                        toast({
                            title: 'Expense Saved Offline',
                            description: "Your expense has been saved locally and will sync when you're back online.",
                        });

                        onExpenseAdded?.();
                        return;
                    }
                    throw new Error('Service worker not available');
                } catch (offlineError) {
                    console.error('Failed to save offline:', offlineError);
                    throw new Error('Failed to save expense offline');
                }
            }

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
