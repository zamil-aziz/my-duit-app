import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET));
        return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
