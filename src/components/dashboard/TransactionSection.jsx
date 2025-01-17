'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from 'lucide-react';
import { FullTransactionList } from './FullTransactionList';

export function TransactionSection({ transactions }) {
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    const formatDate = dateString => {
        const date = new Date(dateString);

        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return `${formattedDate}, ${formattedTime}`;
    };

    if (showAllTransactions) {
        return <FullTransactionList transactions={transactions} onBack={() => setShowAllTransactions(false)} />;
    }

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-base font-medium text-white'>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className='-mx-4 sm:mx-0'>
                <div className='space-y-2'>
                    {transactions.slice(0, 3).map(transaction => (
                        <div
                            key={transaction.id}
                            className='flex items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200'
                        >
                            <div className='flex-1 grid grid-cols-12 items-center'>
                                <span className='text-sm font-medium text-white col-span-4 text-left'>
                                    {transaction.description}
                                </span>
                                <span className='text-sm text-white col-span-4 text-left'>{`RM${transaction.amount}`}</span>
                                <span className='text-sm text-gray-400 col-span-4 text-left'>
                                    {formatDate(transaction.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='pt-3 text-center'>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='text-sm text-gray-400 hover:text-white'
                        onClick={() => setShowAllTransactions(true)}
                    >
                        View All Transactions
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
