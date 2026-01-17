import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function testTriggerLogic() {
    const client = await pool.connect();
    try {
        const testEmail = 'debug_test_' + Date.now() + '@test.com';
        const testId = '00000000-0000-0000-0000-000000000001'; // Fake UUID
        const duplicateId = '00000000-0000-0000-0000-000000000002';

        console.log(`🧪 Testing Trigger Logic with email: ${testEmail}`);

        // 1. Manually insert a "Zombie" into public.users
        console.log('1. Creating Zombie user in public.users...');
        await client.query(`
      INSERT INTO public.users (id, email, full_name) 
      VALUES ($1, $2, 'Zombie User') 
      ON CONFLICT (id) DO NOTHING
    `, [duplicateId, testEmail]);

        // 2. Simulate what the Trigger does (The logic from fix-db-trigger.js)
        console.log('2. Simulating Trigger Execution...');

        // Logic from PL/PGSQL function:
        // SELECT id INTO old_user_id FROM public.users WHERE email = new.email;
        const res = await client.query(`SELECT id FROM public.users WHERE email = $1`, [testEmail]);
        const old_user_id = res.rows[0]?.id;

        console.log(`   Found conflicting user_id: ${old_user_id}`);

        if (old_user_id && old_user_id !== testId) {
            console.log('   Conflict detected! Attempting cleanup...');
            try {
                await client.query(`DELETE FROM public.subscriptions WHERE user_id = $1`, [old_user_id]);
                await client.query(`DELETE FROM public.ai_usage_logs WHERE user_id = $1`, [old_user_id]);
                await client.query(`DELETE FROM public.users WHERE id = $1`, [old_user_id]);
                console.log('   Cleanup Successful.');
            } catch (e) {
                console.error('   ❌ Cleanup FAILED:', e.message);
                throw e;
            }
        }

        // 3. Insert new user
        console.log('3. Attempting Insert of New User...');
        await client.query(`
      INSERT INTO public.users (id, email, full_name)
      VALUES ($1, $2, 'New Real User')
    `, [testId, testEmail]);

        console.log('✅ Success! Trigger logic is sound.');

        // Cleanup
        await client.query('DELETE FROM public.users WHERE email = $1', [testEmail]);

    } catch (err) {
        console.error('❌ SIMULATION FAILED:', err);
    } finally {
        client.release();
        pool.end();
    }
}

testTriggerLogic();
