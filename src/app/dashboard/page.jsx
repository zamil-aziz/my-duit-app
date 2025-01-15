import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickAddExpenseSection } from '@/components/dashboard/QuickAddExpenseSection';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { BarChart2, Menu } from 'lucide-react';

export default function DashboardPage() {
    // Define the data inside the component
    const summaryData = {
        totalSpent: '2,547.63',
        monthlyAverage: '849.21',
        largestExpense: '520.00',
    };

    const recentTransactions = [
        { id: 1, description: 'Grocery Shopping', amount: '156.32', date: 'Today', category: 'Food' },
        { id: 2, description: 'Netflix Subscription', amount: '15.99', date: 'Yesterday', category: 'Entertainment' },
        { id: 3, description: 'Gas Station', amount: '45.00', date: '2 days ago', category: 'Transport' },
    ];

    return (
        <div className='flex flex-col lg:flex-row min-h-screen bg-gray-950'>
            {/* Mobile Header */}
            <div className='lg:hidden bg-gray-900 p-4 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                    <BarChart2 className='w-6 h-6 text-blue-500' />
                    <span className='text-lg font-bold text-white'>Finance</span>
                </div>
                <Button variant='ghost' size='icon' className='text-gray-400'>
                    <Menu className='w-5 h-5' />
                </Button>
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
                </nav>
            </div>

            {/* Main Content */}
            <div className='flex-1 p-4 lg:p-8'>
                {/* Header Section */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 lg:mb-8'>
                    <div>
                        <h1 className='text-2xl lg:text-3xl font-bold text-white mb-1'>Welcome back, Alex</h1>
                        <p className='text-sm lg:text-base text-gray-400'>Track your expenses and manage your budget</p>
                    </div>
                </div>

                {/* Stats Scroll Container for Mobile */}
                <div className='overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0'>
                    <div className='flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-[640px] sm:min-w-0'>
                        <StatsCard
                            title='Total Spent'
                            value={summaryData.totalSpent}
                            iconName='Wallet'
                            trend='up'
                            trendText='12% from last month'
                            gradient='from-purple-500 to-blue-500'
                        />
                        <StatsCard
                            title='Monthly Average'
                            value={summaryData.monthlyAverage}
                            iconName='Calendar'
                            trend='down'
                            trendText='5% from last month'
                            gradient='from-emerald-500 to-teal-500'
                        />
                        <StatsCard
                            title='Largest Expense'
                            value={summaryData.largestExpense}
                            iconName='Tag'
                            gradient='from-orange-500 to-red-500'
                        />
                    </div>
                </div>

                {/* Main Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8'>
                    <div className='lg:col-span-2'>
                        <QuickAddExpenseSection />
                    </div>
                    <div className='lg:col-span-3'>
                        <TransactionList transactions={recentTransactions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
