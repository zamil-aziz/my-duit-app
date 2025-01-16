import { PieChart, Wallet, Shield } from 'lucide-react';
import { FeatureCard } from '@/components/landing/features/FeatureCard';

export function FeaturesSection() {
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
        <section className='px-4 py-12 border-t border-gray-800/50'>
            <h2 className='text-xl font-semibold mb-8 text-center'>Why Choose Us?</h2>
            <div className='space-y-6 max-w-md mx-auto'>
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </section>
    );
}
