/** @type {import('next').NextConfig} */
import withPWA from '@ducanh2912/next-pwa';

const nextConfig = withPWA({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: false,
    workboxOptions: {
        disableDevLogs: true,
    },
    sw: 'src/app/worker/index.js', // Add this line
    runtimeCaching: [
        {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'offlineCache',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
                networkTimeoutSeconds: 10,
            },
        },
        {
            urlPattern: /\/api\/expenses/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
                },
            },
        },
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
