'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function QuickAddExpense({ onSubmit }) {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        onSubmit?.({ amount, description });
        setAmount('');
        setDescription('');
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
                <Label htmlFor='amount' className='text-gray-300'>
                    Amount (RM)
                </Label>
                <Input
                    id='amount'
                    type='number'
                    placeholder='0.00'
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className='mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400'
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
                />
            </div>
            <Button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 text-white'>
                Add Expense
            </Button>
        </form>
    );
}
