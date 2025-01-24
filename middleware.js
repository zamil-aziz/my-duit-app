import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const token = request.cookies.get('token');

    if (!token) {
        return NextResponse.next();
    }

    try {
        const verified = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));

        if (request.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } catch {
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard'],
};
