import withPWAInit from '@ducanh2912/next-pwa';

const pwaConfig = {
    dest: 'public',
    register: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: false,
    swcMinify: true,
    fallbacks: {
        document: '/~offline',
    },
    workboxOptions: {
        runtimeCaching: [
            {
                urlPattern: /\/api\/expenses/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    networkTimeoutSeconds: 10,
                    backgroundSync: {
                        name: 'expenses-queue',
                        options: {
                            maxRetentionTime: 24 * 60,
                        },
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
                urlPattern: /\/_next\/image/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'image-cache',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 7 * 24 * 60 * 60,
                    },
                },
            },
        ],
    },
};

const withPWA = withPWAInit(pwaConfig);

export default withPWA({
    reactStrictMode: true,
});
