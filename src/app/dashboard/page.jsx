'use client';
import React, { useState } from 'react';
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    // Quick summary data - in a real app, this would come from your backend
    const summaryData = {
        totalSpent: '2,547.63',
        monthlyAverage: '849.21',
        largestExpense: '520.00',
    };

    // Recent transactions - in a real app, this would come from your backend
    const recentTransactions = [
        { id: 1, description: 'Grocery Shopping', amount: '156.32', date: 'Today', category: 'Food' },
        { id: 2, description: 'Netflix Subscription', amount: '15.99', date: 'Yesterday', category: 'Entertainment' },
        { id: 3, description: 'Gas Station', amount: '45.00', date: '2 days ago', category: 'Transport' },
    ];

    return (
        <div className='p-6 space-y-6 max-w-6xl mx-auto'>
            {/* Header Section */}
            <div className='flex justify-between items-center'>
                <h1 className='text-3xl font-bold'>Expense Tracker</h1>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Expense
                </Button>
            </div>

            {/* Quick Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-sm font-medium text-gray-500'>Total Spent</CardTitle>
                        <Wallet className='w-4 h-4 text-gray-500' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${summaryData.totalSpent}</div>
                        <p className='text-xs text-gray-500 mt-1'>
                            <ArrowUpCircle className='w-3 h-3 inline mr-1 text-red-500' />
                            12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-sm font-medium text-gray-500'>Monthly Average</CardTitle>
                        <Calendar className='w-4 h-4 text-gray-500' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${summaryData.monthlyAverage}</div>
                        <p className='text-xs text-gray-500 mt-1'>
                            <ArrowDownCircle className='w-3 h-3 inline mr-1 text-green-500' />
                            5% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-sm font-medium text-gray-500'>Largest Expense</CardTitle>
                        <Tag className='w-4 h-4 text-gray-500' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>${summaryData.largestExpense}</div>
                        <p className='text-xs text-gray-500 mt-1'>This month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Add Expense Form */}
            <Card className='bg-white'>
                <CardHeader>
                    <CardTitle>Quick Add Expense</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex flex-col md:flex-row gap-4'>
                        <div className='flex-1'>
                            <Label htmlFor='amount'>Amount ($)</Label>
                            <Input
                                id='amount'
                                type='number'
                                placeholder='0.00'
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className='mt-1'
                            />
                        </div>
                        <div className='flex-[2]'>
                            <Label htmlFor='description'>Description</Label>
                            <Input
                                id='description'
                                placeholder='What did you spend on?'
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className='mt-1'
                            />
                        </div>
                        <Button className='mt-6 bg-blue-600 hover:bg-blue-700'>Add Expense</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        {recentTransactions.map(transaction => (
                            <div
                                key={transaction.id}
                                className='flex items-center justify-between p-4 rounded-lg bg-gray-50'
                            >
                                <div className='flex items-center space-x-4'>
                                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                                        <Tag className='w-5 h-5 text-blue-600' />
                                    </div>
                                    <div>
                                        <p className='font-medium'>{transaction.description}</p>
                                        <p className='text-sm text-gray-500'>{transaction.date}</p>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='font-medium'>${transaction.amount}</p>
                                    <p className='text-sm text-gray-500'>{transaction.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
