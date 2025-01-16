import { BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navigation() {
    return (
        <nav className='relative z-10 flex items-center justify-between p-4 border-b border-gray-800/50'>
            <div className='flex items-center space-x-2'>
                <BarChart2 className='w-6 h-6 text-blue-500' />
                <span className='text-lg font-bold'>MyDuitApp</span>
            </div>
            <Link href='/login'>
                <Button variant='ghost' className='text-sm'>
                    Sign In
                </Button>
            </Link>
        </nav>
    );
}
