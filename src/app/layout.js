import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Expense Tracker',
    description: 'Track your daily expenses easily',
    manifest: '/manifest.json',
    themeColor: '#000000',
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
        viewportFit: 'cover',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Expense Tracker',
    },
    formatDetection: {
        telephone: true,
        date: true,
        address: true,
        email: true,
        url: true,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <head>
                <link rel='manifest' href='/manifest.json' />
                <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />

                {/* Apple specific tags */}
                <link rel='apple-touch-startup-image' href='/splash/launch.png' />
                <meta name='apple-mobile-web-app-capable' content='yes' />
                <meta name='apple-mobile-web-app-status-bar-style' content='default' />

                {/* MS specific tags */}
                <meta name='msapplication-TileColor' content='#000000' />
                <meta name='msapplication-tap-highlight' content='no' />

                {/* Service Worker Registration */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
                    }}
                />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
