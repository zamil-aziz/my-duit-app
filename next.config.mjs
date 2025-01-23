import withPWAInit from '@ducanh2912/next-pwa';
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from 'next/constants.js';

/** @type {import("next").NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

const nextConfigFunction = async phase => {
    if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
        const withPWA = await withPWAInit({
            dest: 'public',
            cacheOnFrontendNav: true,
            aggressiveFrontEndNavCaching: true,
            reloadOnOnline: true,
            // disable: process.env.NODE_ENV === 'development',
            disable: false,
            customWorkerSrc: 'public/custom-sw.js',
            customWorkerDest: 'public',
            sw: 'sw.js',
            register: true,
            fallbacks: {
                document: '/offline',
            },
            buildExcludes: [/middleware-manifest\.json$/], // Add this to exclude middleware manifest
            workboxOptions: {
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /\/_next\/static\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-assets',
                            expiration: {
                                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                                maxEntries: 100,
                            },
                        },
                    },
                    {
                        urlPattern: /(.*?)\/(api\/expenses|_next\/data\/.*)/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            networkTimeoutSeconds: 10,
                            expiration: {
                                maxEntries: 50,
                            },
                        },
                    },
                    {
                        urlPattern: ({ request, url }) => {
                            const isSameOrigin = self.origin === url.origin;
                            return isSameOrigin && request.destination === 'document';
                        },
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'pages-cache',
                            networkTimeoutSeconds: 3,
                        },
                    },
                    {
                        urlPattern: /\.(png|svg|jpg|jpeg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 50,
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\./,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts',
                        },
                    },
                ],
            },
        });
        return withPWA(nextConfig);
    }
    return nextConfig;
};

export default nextConfigFunction;
