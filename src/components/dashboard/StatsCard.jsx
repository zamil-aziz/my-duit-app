import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export function StatsCard({ title, value, icon: Icon, trend, trendText }) {
    // A reusable card component for displaying statistics
    return (
        <Card className='bg-gray-800 border-gray-700'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
                <CardTitle className='text-sm font-medium text-gray-400'>{title}</CardTitle>
                <Icon className='w-4 h-4 text-gray-400' />
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold text-white'>RM{value}</div>
                {trend && (
                    <p className='text-xs text-gray-400 mt-1'>
                        {trend === 'up' ? (
                            <ArrowUpCircle className='w-3 h-3 inline mr-1 text-red-400' />
                        ) : (
                            <ArrowDownCircle className='w-3 h-3 inline mr-1 text-green-400' />
                        )}
                        {trendText}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
