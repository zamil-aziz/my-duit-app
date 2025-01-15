import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart2, PieChart, Wallet, ArrowRight, Shield, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    // Feature section data for reusability and maintainability
    const features = [
        {
            icon: <PieChart className='w-6 h-6 text-blue-500' />,
            title: 'Expense Analytics',
            description: 'Get detailed insights into your spending patterns with beautiful visualizations',
        },
        {
            icon: <Wallet className='w-6 h-6 text-emerald-500' />,
            title: 'Quick Expense Entry',
            description: 'Add expenses on the go with our streamlined input system',
        },
        {
            icon: <Shield className='w-6 h-6 text-purple-500' />,
            title: 'Secure & Private',
            description: 'Your financial data is encrypted and stored securely',
        },
    ];

    return (
        <div className='min-h-screen bg-gray-950 text-white'>
            {/* Hero Section */}
            <header className='relative overflow-hidden'>
                {/* Gradient background */}
                <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none' />

                {/* Navigation */}
                <nav className='relative z-10 flex items-center justify-between p-4 border-b border-gray-800/50'>
                    <div className='flex items-center space-x-2'>
                        <BarChart2 className='w-6 h-6 text-blue-500' />
                        <span className='text-lg font-bold'>Expence Tracker</span>
                    </div>
                    <Link href='/dashboard'>
                        <Button variant='ghost' className='text-sm'>
                            Sign In
                        </Button>
                    </Link>
                </nav>

                {/* Hero Content */}
                <div className='relative px-4 pt-12 pb-16 md:pt-16 md:pb-20 text-center'>
                    <h1 className='text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                        Track Every Ringgit, Make It Count
                    </h1>
                    <p className='text-gray-400 mb-8 max-w-md mx-auto'>
                        Simplify your financial life with our intuitive expense tracking app. Perfect for individuals
                        and small businesses.
                    </p>
                    <Link href='/dashboard'>
                        <Button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg'>
                            Get Started Free
                            <ArrowRight className='ml-2 w-4 h-4' />
                        </Button>
                    </Link>

                    {/* Mobile App Preview */}
                    <div className='mt-12 relative'>
                        <div className='absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent bottom-[-20px] pointer-events-none' />
                        <div className='relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] p-4 border-4 border-gray-800'>
                            <div className='h-full bg-gray-800 rounded-[2.3rem] overflow-hidden'>
                                <div className='p-4'>
                                    <div className='flex items-center space-x-2 mb-6'>
                                        <Smartphone className='w-5 h-5 text-blue-500' />
                                        <span className='text-sm font-medium'>Mobile Experience</span>
                                    </div>
                                    <div className='space-y-4'>
                                        {[1, 2, 3].map(item => (
                                            <div key={item} className='h-16 bg-gray-700/50 rounded-lg animate-pulse' />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className='px-4 py-12 border-t border-gray-800/50'>
                <h2 className='text-xl font-semibold mb-8 text-center'>Why Choose Us?</h2>
                <div className='space-y-6 max-w-md mx-auto'>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className='p-4 rounded-xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm'
                        >
                            <div className='flex items-start space-x-4'>
                                <div className='p-2 bg-gray-800/50 rounded-lg'>{feature.icon}</div>
                                <div>
                                    <h3 className='font-medium mb-1'>{feature.title}</h3>
                                    <p className='text-sm text-gray-400'>{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className='px-4 py-12 text-center border-t border-gray-800/50'>
                <h2 className='text-xl font-semibold mb-2'>Ready to Start?</h2>
                <p className='text-gray-400 mb-6 text-sm'>Join thousands of users managing their finances better</p>
                <Link href='/dashboard'>
                    <Button className='bg-blue-600 hover:bg-blue-700 text-white'>Create Free Account</Button>
                </Link>
            </section>

            {/* Footer */}
            <footer className='px-4 py-6 text-center border-t border-gray-800/50'>
                <p className='text-sm text-gray-500'>© 2025 Expence Tracker. All rights reserved.</p>
            </footer>
        </div>
    );
}
