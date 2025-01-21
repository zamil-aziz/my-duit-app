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

// Separate viewport configuration
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: '#000000',
};

// Metadata configuration
export const metadata = {
    title: 'Expense Tracker',
    description: 'Track your daily expenses easily',
    manifest: '/manifest.json',
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
                <link rel='apple-touch-startup-image' href='/splash/launch.png' />

                {/* MS specific tags */}
                <meta name='msapplication-TileColor' content='#000000' />
                <meta name='msapplication-tap-highlight' content='no' />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
