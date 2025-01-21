/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = withPWA({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    // disable: process.env.NODE_ENV === 'development',
    disable: false,
    customWorkerSrc: 'custom-sw',
    register: true,
    skipWaiting: true,
    workboxOptions: {
        disableDevLogs: true,
    },
    runtimeCaching: [
        {
            urlPattern: /\/api\/expenses/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 0, // Don't cache API responses
                },
                matchOptions: {
                    ignoreSearch: false,
                },
            },
        },
        // Remove the duplicate /api/expenses pattern
        {
            urlPattern: /\.(css|js)$/,
            handler: 'StaleWhileRevalidate',
            options: {
                cacheName: 'static-resources',
            },
        },
        {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|ico)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
            },
        },
    ],
})({
    reactStrictMode: true,
    experimental: {
        scrollRestoration: true,
    },
    images: {
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp', 'image/avif'],
    },
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
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
});

export default nextConfig;
