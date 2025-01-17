'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function FullTransactionList({ transactions, onBack }) {
    const formatDate = dateString => {
        const date = new Date(dateString);

        // Format date like "17 Jan 2025"
        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        // Format time like "3:57 PM"
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return `${formattedDate}, ${formattedTime}`;
    };

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <div className='flex items-center space-x-2'>
                    <Button variant='ghost' size='sm' className='text-gray-400 hover:text-white' onClick={onBack}>
                        <ChevronLeft className='w-4 h-4 mr-1' />
                        Back
                    </Button>
                    <CardTitle className='text-lg font-semibold text-white'>All Transactions</CardTitle>
                </div>
            </CardHeader>
            <CardContent className='px-0'>
                <div>
                    <div className='sticky top-0 grid grid-cols-12 gap-1 sm:gap-3 py-1 px-2 sm:px-3 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800'>
                        <p className='text-[10px] font-medium text-gray-500 col-span-6'>DATE</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-4'>DESCRIPTION</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-2'>AMOUNT</p>
                    </div>
                    <div className='max-h-[32rem] overflow-y-auto'>
                        {transactions.map(transaction => (
                            <div
                                key={transaction.id}
                                className='grid grid-cols-12 items-center gap-1 sm:gap-3 py-1 px-2 sm:px-3 hover:bg-gray-800/50 transition-colors duration-200'
                            >
                                <p className='text-[11px] text-gray-400 col-span-6 truncate'>
                                    {formatDate(transaction.createdAt)}
                                </p>
                                <p className='text-[11px] text-white col-span-4 truncate leading-relaxed'>
                                    {transaction.description}
                                </p>
                                <p className='text-[11px] text-white col-span-2'>RM {transaction.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
