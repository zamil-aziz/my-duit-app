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

// Viewport configuration
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
        title: 'My Duit App',
        // Add startup images configuration
        startupImage: ['/splash/launch.png'],
    },
    icons: {
        apple: '/icons/icon-192x192.png',
    },
    formatDetection: {
        telephone: true,
        date: true,
        address: true,
        email: true,
        url: true,
    },
    // Add meta tags for Microsoft
    other: {
        'msapplication-TileColor': '#000000',
        'msapplication-tap-highlight': 'no',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
        </html>
    );
}
