import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/features/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { AuthCheck } from '@/components/auth/AuthCheck';

export default function LandingPage() {
    return (
        <div className='relative min-h-screen bg-gray-950 text-white'>
            <AuthCheck />
            <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none' />
            <div className='relative z-10'>
                <header className='relative overflow-hidden'>
                    <Navigation />
                    <HeroSection />
                </header>
                <FeaturesSection />
                <CTASection />
                <Footer />
            </div>
        </div>
    );
}
