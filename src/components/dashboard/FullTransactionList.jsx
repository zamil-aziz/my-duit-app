import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FullTransactionList({ transactions, onBack, onTransactionDeleted, onTransactionUpdated }) {
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
    });

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

    const handleEdit = async () => {
        if (!navigator.onLine) {
            toast({
                variant: 'destructive',
                title: 'Offline Mode',
                description: 'Edit function is not available while offline. Please try again when connected.',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    variant: 'destructive',
                    title: 'Authentication Error',
                    description: 'You need to be logged in to update transactions.',
                });
                return;
            }

            const response = await fetch(`/api/expenses/update`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingTransaction.id,
                    amount: editForm.amount,
                    description: editForm.description,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to update expense');

            toast({
                title: 'Success',
                description: 'Transaction updated successfully!',
            });

            if (onTransactionUpdated) onTransactionUpdated(data);
            setEditingTransaction(null);
        } catch (error) {
            console.error('Error updating expense:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update transaction. Please try again.',
            });
        }
    };

    const handleDelete = async id => {
        if (!navigator.onLine) {
            toast({
                variant: 'destructive',
                title: 'Offline Mode',
                description: 'Delete function is not available while offline. Please try again when connected.',
            });
            return;
        }

        try {
            setDeletingId(id);
            const token = localStorage.getItem('token');
            if (!token) {
                toast({
                    variant: 'destructive',
                    title: 'Authentication Error',
                    description: 'You need to be logged in to delete transactions.',
                });
                return;
            }

            const response = await fetch(`/api/expenses/delete?id=${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete expense');

            toast({
                title: 'Success',
                description: 'Transaction deleted successfully!',
            });

            if (onTransactionDeleted) onTransactionDeleted(id);
        } catch (error) {
            console.error('Error deleting expense:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to delete transaction. Please try again.',
            });
        } finally {
            setDeletingId(null);
        }
    };

    const openEditDialog = transaction => {
        setEditingTransaction(transaction);
        setEditForm({
            amount: transaction.amount.toString(),
            description: transaction.description,
        });
    };

    return (
        <Card className='border-0 bg-gray-900/50 backdrop-blur-sm'>
            <CardHeader className='flex flex-row items-center justify-center pb-2 relative'>
                <div className='absolute left-0'>
                    <Button variant='ghost' size='sm' className='text-gray-400 hover:text-white' onClick={onBack}>
                        <ChevronLeft className='w-4 h-4 mr-1' />
                        Back
                    </Button>
                </div>
                <div className='text-center'>
                    <CardTitle className='text-lg font-semibold text-white'>All Transactions</CardTitle>
                </div>
            </CardHeader>
            <CardContent className='px-0'>
                <div>
                    <div className='sticky top-0 grid grid-cols-12 gap-1 sm:gap-3 py-1 px-2 sm:px-3 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800'>
                        <p className='text-[10px] font-medium text-gray-500 col-span-5'>DATE</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-3'>DESCRIPTION</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-2'>AMOUNT</p>
                        <p className='text-[10px] font-medium text-gray-500 col-span-2'>ACTIONS</p>
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
                                <p className='text-[11px] text-white col-span-3 truncate leading-relaxed'>
                                    {transaction.description}
                                </p>
                                <p className='text-[11px] text-white col-span-2'>RM {transaction.amount}</p>
                                <div className='col-span-2 flex space-x-1'>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        className='text-gray-400 hover:text-blue-500 p-1 h-auto'
                                        onClick={() => openEditDialog(transaction)}
                                    >
                                        <Edit2 className='w-3 h-3' />
                                    </Button>
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
                    <Dialog
                        open={editingTransaction !== null}
                        onOpenChange={open => !open && setEditingTransaction(null)}
                    >
                        <DialogContent className='bg-gray-900 text-white border-gray-800'>
                            <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                                <DialogDescription className='text-gray-400'>
                                    Make changes to your transaction here.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4 py-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='amount'>Amount</Label>
                                    <Input
                                        id='amount'
                                        type='number'
                                        step='0.01'
                                        value={editForm.amount}
                                        onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                                        className='bg-gray-800 border-gray-700 text-white'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='description'>Description</Label>
                                    <Input
                                        id='description'
                                        value={editForm.description}
                                        onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                        className='bg-gray-800 border-gray-700 text-white'
                                    />
                                </div>
                            </div>
                            <DialogFooter className='flex gap-1'>
                                <Button
                                    variant='outline'
                                    onClick={() => setEditingTransaction(null)}
                                    className='bg-gray-800 text-white hover:bg-gray-700'
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleEdit} className='bg-blue-600 text-white hover:bg-blue-700'>
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
