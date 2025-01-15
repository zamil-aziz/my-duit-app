'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { FullTransactionList } from './FullTransactionList';

export function TransactionSection({ transactions }) {
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    if (showAllTransactions) {
        return <FullTransactionList transactions={transactions} onBack={() => setShowAllTransactions(false)} />;
    }

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='text-lg font-semibold text-white'>Recent Transactions</CardTitle>
                <Button
                    variant='ghost'
                    className='text-gray-400 hover:text-white hidden sm:inline-flex'
                    onClick={() => setShowAllTransactions(true)}
                >
                    View All
                </Button>
            </CardHeader>
            <CardContent className='-mx-4 sm:mx-0'>
                <div className='space-y-3'>
                    {transactions.slice(0, 3).map(transaction => (
                        <div
                            key={transaction.id}
                            className='flex items-center justify-between p-4 rounded-none sm:rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200'
                        >
                            <div className='flex items-center space-x-3 sm:space-x-4'>
                                <div className='p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600'>
                                    <Tag className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                                </div>
                                <div>
                                    <p className='font-medium text-white text-sm sm:text-base'>
                                        {transaction.description}
                                    </p>
                                    <p className='text-xs sm:text-sm text-gray-400'>{transaction.date}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant='ghost'
                    className='w-full text-gray-400 hover:text-white mt-4 sm:hidden'
                    onClick={() => setShowAllTransactions(true)}
                >
                    View All Transactions
                </Button>
            </CardContent>
        </Card>
    );
}
