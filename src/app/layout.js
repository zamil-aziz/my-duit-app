import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

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
    title: 'My Duit App',
    description: 'Track your daily expenses easily',
    manifest: '/manifest.json',
    icons: {
        icon: '/image.png',
        shortcut: '/image.png',
        apple: '/image.png',
        other: {
            rel: 'apple-touch-icon',
            url: '/image.png',
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'My Duit App',
        startupImage: ['/splash/launch.png'],
    },
    formatDetection: {
        telephone: true,
        date: true,
        address: true,
        email: true,
        url: true,
    },
    other: {
        'msapplication-TileColor': '#000000',
        'msapplication-tap-highlight': 'no',
        'msapplication-TileImage': '/image.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ServiceWorkerRegistration />
                <main>{children}</main>
                <Toaster />
            </body>
        </html>
    );
}
