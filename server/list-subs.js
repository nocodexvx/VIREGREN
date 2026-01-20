import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listSubs() {
    const client = await pool.connect();
    try {
        console.log('Fetching last 5 subscriptions...');
        const res = await client.query(`
            SELECT s.id, s.user_id, s.status, s.plan_id, s.created_at, u.email 
            FROM subscriptions s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC 
            LIMIT 5
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error fetching subs:', err);
    } finally {
        client.release();
        pool.end();
    }
}

listSubs();
