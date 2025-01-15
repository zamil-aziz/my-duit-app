import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className='bg-gray-800 border-gray-700'>
            <CardHeader>
                <CardTitle className='text-white'>Quick Add Expense</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='flex flex-col md:flex-row gap-4'>
                    <div className='flex-1'>
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
                    <div className='flex-[2]'>
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
                    <Button type='submit' className='mt-6 bg-blue-600 hover:bg-blue-700 text-white'>
                        Add Expense
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
