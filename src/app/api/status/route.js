import { checkDatabaseStatus } from '@/lib/db';

export default async function handler(req, res) {
    try {
        const status = await checkDatabaseStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
