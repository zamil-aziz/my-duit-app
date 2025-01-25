'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export function AddExpense({ onSubmit }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAmountChange = e => {
        const value = e.target.value.replace(/\D/g, '');
        const formattedValue = (parseInt(value) / 100).toFixed(2);
        setAmount(value ? formattedValue : '');
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!amount || !description) return;

        setIsSubmitting(true);
        try {
            await onSubmit?.({ amount: parseFloat(amount), description });
            setAmount('');
            setDescription('');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
                <Label htmlFor='amount' className='text-gray-300'>
                    Amount (RM)
                </Label>
                <Input
                    id='amount'
                    type='text'
                    placeholder='0.00'
                    value={amount}
                    onChange={handleAmountChange}
                    className='mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    required
                />
            </div>
            <div>
                <Label htmlFor='description' className='text-gray-300'>
                    Description
                </Label>
                <Input
                    id='description'
                    placeholder='What did you spend on?'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className='mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    required
                />
            </div>
            <Button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white' disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Adding...
                    </>
                ) : (
                    'Add Expense'
                )}
            </Button>
        </form>
    );
}
