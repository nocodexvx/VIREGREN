import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Fallback if not loaded
if (!process.env.DATABASE_URL) dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function listUsers() {
    const client = await pool.connect();
    try {
        console.log('Fetching last 10 users...');
        const res = await client.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 10');
        console.table(res.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
    } finally {
        client.release();
        pool.end();
    }
}

listUsers();
