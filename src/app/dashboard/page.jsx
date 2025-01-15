import { Wallet, Calendar, Tag } from 'lucide-react';

import { StatsCard } from '@/components/dashboard/StatsCard';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { QuickAddExpenseSection } from '@/components/dashboard/QuickAddexpenseSection';

export default function DashboardPage() {
    // In a real application, this would likely come from an API or state management
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

    const handleAddExpense = expenseData => {
        // In a real application, this would likely make an API call
        console.log('New expense:', expenseData);
        // You might want to update the transactions list or summary data here
    };

    return (
        <div className='p-6 space-y-6 max-w-6xl mx-auto bg-gray-900 text-gray-100 min-h-screen'>
            {/* Header Section */}
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold text-white'>Expense Tracker</h1>
            </div>

            {/* Stats Cards Section */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <StatsCard
                    title='Total Spent'
                    value={summaryData.totalSpent}
                    icon={Wallet}
                    trend='up'
                    trendText='12% from last month'
                />
                <StatsCard
                    title='Monthly Average'
                    value={summaryData.monthlyAverage}
                    icon={Calendar}
                    trend='down'
                    trendText='5% from last month'
                />
                <StatsCard title='Largest Expense' value={summaryData.largestExpense} icon={Tag} />
            </div>

            {/* Quick Add Form Section */}
            <QuickAddExpenseSection />

            {/* Transactions List Section */}
            <TransactionList transactions={recentTransactions} />
        </div>
    );
}
