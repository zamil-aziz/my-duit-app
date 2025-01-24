import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
};

export default withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    workboxOptions: {
        runtimeCaching: [
            {
                urlPattern: '/',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'start-url',
                    networkTimeoutSeconds: 10,
                },
            },
            {
                urlPattern: /\/dashboard/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'dashboard-pages',
                    networkTimeoutSeconds: 10,
                },
            },
            {
                urlPattern: /^https?.*/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'offline-cache',
                    networkTimeoutSeconds: 10,
                },
            },
            {
                urlPattern: /\.(?:js|css)$/i,
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-resources',
                },
            },
            {
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'static-images',
                },
            },
        ],
    },
})(nextConfig);
