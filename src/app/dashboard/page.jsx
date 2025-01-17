'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickAddExpenseSection } from '@/components/dashboard/AddExpenseSection';
import { TransactionSection } from '@/components/dashboard/TransactionSection';
import { BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [data, setData] = useState({
        expenses: [],
        summary: {
            totalSpent: 0,
            monthlyAverage: 0,
            largestExpense: 0,
        },
    });

    // Move fetchData outside useEffect so it can be used elsewhere
    const fetchData = async () => {
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
            setData(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error appropriately
        }
    };

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

    if (!user) {
        return null; // or loading spinner
    }

    return (
        <div className='flex flex-col lg:flex-row min-h-screen bg-gray-950'>
            {/* Mobile Header */}
            <div className='lg:hidden bg-gray-900 p-4 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                    <BarChart2 className='w-6 h-6 text-blue-500' />
                    <span className='text-lg font-bold text-white'>MyDuitApp</span>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className='hidden lg:block w-64 bg-gray-900 p-6'>
                <div className='flex items-center space-x-2 mb-8'>
                    <BarChart2 className='w-8 h-8 text-blue-500' />
                    <span className='text-xl font-bold text-white'>Finance</span>
                </div>
                <nav className='space-y-2'>
                    <Button variant='ghost' className='w-full justify-start text-white hover:bg-gray-800'>
                        Dashboard
                    </Button>
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
                {/* Header Section */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
                    <div>
                        <h1 className='text-2xl lg:text-3xl font-bold text-white mb-1'>Welcome back, {user.name}</h1>
                        <p className='text-sm lg:text-base text-gray-400'>Track your expenses and manage your budget</p>
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
                        <QuickAddExpenseSection
                            userId={user.id}
                            onExpenseAdded={fetchData} // Pass the fetchData function here
                        />
                    </div>
                    <div className='lg:col-span-3'>
                        <TransactionSection transactions={data.expenses} />
                    </div>
                </div>
            </div>
        </div>
    );
}
