import { openDB } from 'idb';

export async function GET() {
    try {
        const db = await openDB('expenses-offline-db', 1);
        const count = await db.count('offline-mutations');
        return Response.json({ isConnected: true, count });
    } catch (error) {
        return Response.json({ isConnected: false, count: 0 });
    }
}
