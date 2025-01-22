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
            disable: process.env.NODE_ENV === 'development',
            disable: false,
            workboxOptions: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\./,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts',
                        },
                    },
                    {
                        urlPattern: /\.(png|svg|jpg|jpeg|gif|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'image-cache',
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
