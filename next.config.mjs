/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
});

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // PWA and mobile optimizations
    experimental: {
        optimizeFonts: true,
        scrollRestoration: true,
    },
    images: {
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp'],
    },
    // Add headers for PWA
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                ],
            },
        ];
    },
    // Cache optimization
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 4,
    },
};

export default pwaConfig(nextConfig);
