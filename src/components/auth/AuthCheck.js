'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthCheck() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check');
                if (response.ok) {
                    router.replace('/dashboard');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            }
        };
        checkAuth();
    }, [router]);

    return null;
}
