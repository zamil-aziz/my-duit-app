import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

export function TransactionList({ transactions }) {
    return (
        <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
                <CardTitle className='text-white'>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    {transactions.map(transaction => (
                        <div
                            key={transaction.id}
                            className='flex items-center justify-between p-4 rounded-lg bg-gray-700'
                        >
                            <div className='flex items-center space-x-4'>
                                <div className='w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center'>
                                    <Tag className='w-5 h-5 text-blue-400' />
                                </div>
                                <div>
                                    <p className='font-medium text-white'>{transaction.description}</p>
                                    <p className='text-sm text-gray-400'>{transaction.date}</p>
                                </div>
                            </div>
                            <div className='text-right'>
                                <p className='font-medium text-white'>RM{transaction.amount}</p>
                                <p className='text-sm text-gray-400'>{transaction.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
