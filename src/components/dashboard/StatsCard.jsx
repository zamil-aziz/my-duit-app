import { ArrowDown, ArrowUp, Wallet, Calendar, Tag } from 'lucide-react';

const ICONS = {
    Wallet,
    Calendar,
    Tag,
};

export const StatsCard = ({
    title = 'Total Revenue',
    value = '12,345',
    trend,
    trendText,
    iconName = 'Wallet',
    gradient = 'from-blue-500 to-purple-500',
}) => {
    const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400';
    const Icon = trend === 'up' ? ArrowUp : ArrowDown;
    const IconComponent = ICONS[iconName] || Wallet;

    return (
        <div className='flex-1 relative overflow-hidden rounded-lg bg-gray-900/50 shadow-sm border border-gray-800/50 min-w-[180px]'>
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />

            {/* Content container */}
            <div className='relative p-3'>
                {/* Top Row: Icon and Trend */}
                <div className='flex items-center justify-between mb-2'>
                    <div className='p-1 rounded-md bg-gray-800/50'>
                        <IconComponent className='w-3.5 h-3.5 text-blue-400' />
                    </div>
                    {trend && trendText && (
                        <div className={`flex items-center gap-0.5 ${trendColor} text-xs`}>
                            <Icon className='w-3 h-3' />
                            <span>{trendText}</span>
                        </div>
                    )}
                </div>

                {/* Bottom Row: Value and Title */}
                <div>
                    <div className='text-sm font-semibold text-white mb-0.5'>${value}</div>
                    <div className='text-xs text-gray-400'>{title}</div>
                </div>
            </div>
        </div>
    );
};
