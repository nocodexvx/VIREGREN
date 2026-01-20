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

const subId = 'a4019ab1-fdda-4737-93ca-253640fd1b12';

async function activateSub() {
    const client = await pool.connect();
    try {
        console.log(`Activating subscription ${subId}...`);

        // Update status AND current_period_end (give 24h as per tester plan)
        const res = await client.query(`
            UPDATE subscriptions 
            SET status = 'active', 
                current_period_end = NOW() + INTERVAL '1 day'
            WHERE id = $1
            RETURNING *
        `, [subId]);

        if (res.rows.length > 0) {
            console.log('✅ Subscription activated:', res.rows[0]);
        } else {
            console.error('❌ Subscription not found');
        }

    } catch (err) {
        console.error('Error activating sub:', err);
    } finally {
        client.release();
        pool.end();
    }
}

activateSub();
