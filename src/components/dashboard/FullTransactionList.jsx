'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function FullTransactionList({ transactions, onBack, onTransactionDeleted }) {
    const [deletingId, setDeletingId] = useState(null);
    const [status, setStatus] = useState({ type: '', message: '' });

    const formatDate = dateString => {
        const date = new Date(dateString);

        const formattedDate = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return `${formattedDate}, ${formattedTime}`;
    };

    const handleDelete = async id => {
        try {
            setDeletingId(id);
            const token = localStorage.getItem('token');

            if (!token) {
                setStatus({
                    type: 'error',
                    message: 'You need to be logged in to delete transactions.',
                });
                return;
            }

            // Updated URL to match the new API route
            const response = await fetch(`/api/expenses/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete expense');
            }

            setStatus({
                type: 'success',
                message: 'Transaction deleted successfully!',
            });

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);

            if (onTransactionDeleted) {
                onTransactionDeleted(id);
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
            setStatus({
                type: 'error',
                message: error.message || 'Failed to delete transaction. Please try again.',
            });
        } finally {
            setDeletingId(null);
        }
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
                    {status.type === 'error' && (
                        <Alert variant='destructive' className='mb-4 mx-2 bg-red-900/50 border-red-900 text-red-300'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}
                    {status.type === 'success' && (
                        <Alert className='mb-4 mx-2 bg-green-900/50 border-green-900 text-green-300'>
                            <CheckCircle className='h-4 w-4' />
                            <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                    )}
                    <div className='sticky top-0 grid grid-cols-12 gap-1 sm:gap-3 py-1 px-2 sm:px-3 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800'>
                        <p className='text-[10px] font-medium text-gray-500 col-span-5'>DATE</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-4'>DESCRIPTION</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-2'>AMOUNT</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-1'>ACTION</p>
                    </div>
                    <div className='max-h-[32rem] overflow-y-auto'>
                        {transactions.map(transaction => (
                            <div
                                key={transaction.id}
                                className='grid grid-cols-12 items-center gap-1 sm:gap-3 py-1 px-2 sm:px-3 hover:bg-gray-800/50 transition-colors duration-200'
                            >
                                <p className='text-[11px] text-gray-400 col-span-5 truncate'>
                                    {formatDate(transaction.createdAt)}
                                </p>
                                <p className='text-[11px] text-white col-span-4 truncate leading-relaxed'>
                                    {transaction.description}
                                </p>
                                <p className='text-[11px] text-white col-span-2'>RM {transaction.amount}</p>
                                <div className='col-span-1'>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                className='text-gray-400 hover:text-red-500 p-1 h-auto'
                                                disabled={deletingId === transaction.id}
                                            >
                                                <Trash2 className='w-3 h-3' />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='bg-gray-900 text-white border-gray-800'>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                                                <AlertDialogDescription className='text-gray-400'>
                                                    Are you sure you want to delete this transaction? This action cannot
                                                    be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className='bg-gray-800 text-white hover:bg-gray-700'>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className='bg-red-600 text-white hover:bg-red-700'
                                                    onClick={() => handleDelete(transaction.id)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
