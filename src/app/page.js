import { Navigation } from '@/components/landing/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/features/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <div className='min-h-screen bg-gray-950 text-white'>
            {/* Gradient background */}
            <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 pointer-events-none' />

            <header className='relative overflow-hidden'>
                <Navigation />
                <HeroSection />
            </header>

            <FeaturesSection />
            <CTASection />
            <Footer />
        </div>
    );
}
