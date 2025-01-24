import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const token = request.cookies.get('token');
    console.log('Token:', token);

    if (!token) {
        return NextResponse.next();
    }

    try {
        const verified = await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
        console.log('Verified:', verified);

        if (verified && request.nextUrl.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } catch (error) {
        console.error('JWT verification failed:', error);
        return NextResponse.next();
    }

    return NextResponse.next();
}
