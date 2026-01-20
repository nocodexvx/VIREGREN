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

const keepSubId = 'a4019ab1-fdda-4737-93ca-253640fd1b12';

async function cleanup() {
    const client = await pool.connect();
    try {
        console.log(`Keeping subscription ${keepSubId}, deleting others...`);

        const res = await client.query(`
            DELETE FROM subscriptions 
            WHERE id != $1
        `, [keepSubId]);

        console.log(`Deleted ${res.rowCount} old subscriptions.`);

    } catch (err) {
        console.error('Error cleaning up:', err);
    } finally {
        client.release();
        pool.end();
    }
}

cleanup();
