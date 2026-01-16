import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DIRECT_URL) dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function fixConstraint() {
    const client = await pool.connect();
    try {
        console.log('Fixing constraints...');

        // Drop old constraint
        await client.query(`ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;`);

        // Add new constraint with 'pending'
        await client.query(`
      ALTER TABLE subscriptions 
      ADD CONSTRAINT subscriptions_status_check 
      CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'pending'));
    `);

        console.log('✅ Constraint updated successfully!');
    } catch (err) {
        console.error('❌ Error fixing constraint:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fixConstraint();
