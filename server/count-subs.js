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

async function countSubs() {
    const client = await pool.connect();
    try {
        console.log('Counting active subscriptions...');
        const res = await client.query(`
            SELECT plan_id, COUNT(*) as count, SUM(
                CASE 
                    WHEN plan_id = 'pro_monthly' THEN 29
                    WHEN plan_id = 'business_monthly' THEN 99
                    WHEN plan_id = 'tester' THEN 5
                    ELSE 0
                END
            ) as mrr
            FROM subscriptions 
            WHERE status = 'active'
            GROUP BY plan_id
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error counting subs:', err);
    } finally {
        client.release();
        pool.end();
    }
}

countSubs();
