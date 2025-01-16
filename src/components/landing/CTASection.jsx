import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
    return (
        <section className='px-4 py-12 text-center border-t border-gray-800/50'>
            <h2 className='text-xl font-semibold mb-2'>Ready to Start?</h2>
            <p className='text-gray-400 mb-6 text-sm'>Join thousands of users managing their finances better</p>
            <Link href='/signup'>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white'>Create Free Account</Button>
            </Link>
        </section>
    );
}
