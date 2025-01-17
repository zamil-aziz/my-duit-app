'use client';
import { Smartphone } from 'lucide-react';

export function MobilePreview() {
    return (
        <div className='mt-12 relative'>
            <div className='absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none' />
            <div className='relative mx-auto w-64 h-[500px] bg-gray-900 rounded-[3rem] p-4 border-4 border-gray-800 animate-[gentleBounce_4s_ease-in-out_infinite]'>
                <div className='h-full bg-gray-800 rounded-[2.3rem] overflow-hidden'>
                    <div className='p-4'>
                        <div className='flex items-center space-x-2 mb-6'>
                            <Smartphone className='w-5 h-5 text-blue-500' />
                            <span className='text-sm font-medium'>Your Expenses</span>
                        </div>
                        <div className='space-y-4'>
                            {[1, 2, 3].map(item => (
                                <div key={item} className='h-16 bg-gray-700/50 rounded-lg animate-pulse' />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes gentleBounce {
                    0%,
                    100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
            `}</style>
        </div>
    );
}
