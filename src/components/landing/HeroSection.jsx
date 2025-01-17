import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MobilePreview } from '@/components/landing/MobilePreview';

export function HeroSection() {
    return (
        <div className='relative px-4 pt-12 pb-16 md:pt-16 md:pb-20 text-center'>
            <h1 className='text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
                Track Every Ringgit, Make It Count
            </h1>
            <p className='text-gray-400 mb-8 max-w-md mx-auto'>
                Simplify your financial life with our intuitive expense tracking app. Perfect for individuals and small
                businesses.
            </p>
            <Link href='/signup'>
                <Button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-lg'>
                    Get Started Free
                    <ArrowRight className='ml-2 w-4 h-4' />
                </Button>
            </Link>

            {/* Mobile Preview */}
            <MobilePreview />
        </div>
    );
}
