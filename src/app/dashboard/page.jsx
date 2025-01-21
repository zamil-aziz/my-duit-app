'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AddExpenseSection } from '@/components/dashboard/AddExpenseSection';
import { TransactionSection } from '@/components/dashboard/TransactionSection';
import { BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster, toast } from '@/components/ui/toaster';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(true);
    const [data, setData] = useState({
        expenses: [],
        summary: {
            totalSpent: 0,
            monthlyAverage: 0,
            largestExpense: 0,
        },
    });

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/expenses', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch expenses');
            }

            const responseData = await response.json();
            setData({
                expenses: responseData.expenses,
                summary: responseData.summary,
            });
            setUser(responseData.user);
        } catch (error) {
            console.error('Error fetching data:', error);
            if (!navigator.onLine) {
                toast({
                    title: "You're offline",
                    description: "Using cached data. Updates will sync when you're back online.",
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch expenses',
                    variant: 'destructive',
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const updateOnlineStatus = () => {
            const online = navigator.onLine;
            setIsOnline(online);
            if (online) {
                toast({
                    title: "You're back online",
                    description: 'Syncing your data...',
                });
                // Updated service worker registration
                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    navigator.serviceWorker
                        .register('/sw.js')
                        .then(registration => {
                            registration.sync.register('sync-expenses');
                        })
                        .catch(error => {
                            console.error('ServiceWorker registration failed:', error);
                        });
                }
                fetchData();
            } else {
                toast({
                    title: "You're offline",
                    description: "You can still add expenses. They'll sync when you're back online.",
                });
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Set initial online status and register service worker
        setIsOnline(navigator.onLine);
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(registration => {
                    registration.sync.register('sync-expenses');
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(storedUser));
        fetchData(); // Initial data fetch
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const handleTransactionDeleted = async deletedId => {
        if (!isOnline) {
            toast({
                title: "You're offline",
                description: "Delete operation will sync when you're back online.",
            });
        }
        await fetchData(); // Refresh all data after deletion
    };

    const handleTransactionUpdated = async updatedTransaction => {
        if (!isOnline) {
            toast({
                title: "You're offline",
                description: "Update will sync when you're back online.",
            });
        }
        await fetchData(); // Refresh all data after update
    };

    const handleExpenseAdded = async () => {
        if (!isOnline) {
            toast({
                title: "You're offline",
                description: "Expense saved locally. Will sync when you're back online.",
            });
        }
        await fetchData(); // Refresh all data after adding new expense
    };

    if (!user || isLoading) {
        return (
            <div className='min-h-screen bg-gray-950 flex items-center justify-center'>
                <LoadingSpinner size='large' />
            </div>
        );
    }

    return (
        <>
            <div className='flex flex-col lg:flex-row min-h-screen bg-gray-950'>
                {/* Mobile Header */}
                <div className='lg:hidden bg-gray-900 p-4 flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                        <BarChart2 className='w-6 h-6 text-blue-500' />
                        <span className='text-lg font-bold text-white'>MyDuitApp</span>
                    </div>
                    <div className='flex'>
                        <Button
                            variant='ghost'
                            className='w-full justify-start text-white hover:bg-gray-800'
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Desktop Sidebar */}
                <div className='hidden lg:block w-64 bg-gray-900 p-6'>
                    <div className='flex items-center space-x-2 mb-8'>
                        <BarChart2 className='w-8 h-8 text-blue-500' />
                        <span className='text-xl font-bold text-white'>Finance</span>
                    </div>
                    <nav className='space-y-2'>
                        <Button
                            variant='ghost'
                            className='w-full justify-start text-white hover:bg-gray-800'
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className='flex-1 p-4 lg:p-8'>
                    {/* Online/Offline Status */}
                    {!isOnline && (
                        <div className='bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg mb-4 text-sm flex items-center justify-between'>
                            <span>You're currently offline. Changes will sync when you're back online.</span>
                        </div>
                    )}

                    {/* Header Section */}
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                        <div>
                            <h1 className='text-2xl lg:text-3xl font-bold text-white mb-1'>
                                Welcome back, {user.name}
                            </h1>
                            <p className='text-sm lg:text-base text-gray-400'>
                                Track your expenses and manage your budget
                            </p>
                        </div>
                    </div>

                    {/* Stats Container */}
                    <div className='overflow-x-auto pb-4 -mx-4 px-4 mb-6'>
                        <div className='flex gap-3 min-w-max'>
                            <StatsCard
                                title='Total Spent'
                                value={`RM ${data.summary.totalSpent.toFixed(2)}`}
                                iconName='Wallet'
                                gradient='from-purple-500 to-blue-500'
                            />
                            <StatsCard
                                title='Monthly Average'
                                value={`RM ${data.summary.monthlyAverage.toFixed(2)}`}
                                iconName='Calendar'
                                gradient='from-emerald-500 to-teal-500'
                            />
                            <StatsCard
                                title='Largest Expense'
                                value={`RM ${data.summary.largestExpense.toFixed(2)}`}
                                iconName='Tag'
                                gradient='from-orange-500 to-red-500'
                            />
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8'>
                        <div className='lg:col-span-2'>
                            <AddExpenseSection userId={user.id} onExpenseAdded={handleExpenseAdded} />
                        </div>
                        <div className='lg:col-span-3'>
                            <TransactionSection
                                transactions={data.expenses}
                                onTransactionDeleted={handleTransactionDeleted}
                                onTransactionUpdated={handleTransactionUpdated}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
}
