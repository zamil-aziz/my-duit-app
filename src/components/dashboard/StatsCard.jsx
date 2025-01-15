'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Calendar, Tag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const IconMap = {
    Wallet,
    Calendar,
    Tag,
};

export function StatsCard({ title, value, iconName, trend, trendText, gradient }) {
    const Icon = IconMap[iconName];

    return (
        <Card className='relative overflow-hidden border-0 bg-gray-900/50 backdrop-blur-sm'>
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${gradient}`} />

            <CardContent className='p-3 flex items-center gap-3'>
                {/* Icon Section */}
                <div className='p-2 rounded-lg bg-gray-800/50'>
                    {Icon && <Icon className='w-4 h-4 text-gray-300' />}
                </div>

                {/* Main Content */}
                <div className='flex-1'>
                    <p className='text-xs font-medium text-gray-400 mb-0.5'>{title}</p>
                    <div className='text-base font-semibold text-white'>RM{value}</div>
                </div>

                {/* Trend Section */}
                {trend && (
                    <div className='flex items-center'>
                        <div
                            className={`flex items-center text-[10px] font-medium px-2 py-1 rounded-full ${
                                trend === 'up' ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'
                            }`}
                        >
                            {trend === 'up' ? (
                                <ArrowUpCircle className='w-3 h-3 mr-0.5' />
                            ) : (
                                <ArrowDownCircle className='w-3 h-3 mr-0.5' />
                            )}
                            {trendText}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
