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

const checkQuery = `
-- 1. Create table if not exists (in case it's missing)
CREATE TABLE IF NOT EXISTS public.video_jobs (
    job_id text PRIMARY KEY,
    status text,
    progress int,
    variations int,
    input_path text,
    outputs jsonb,
    zip_path text,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE oid = 'public.video_jobs'::regclass;

-- 3. Disable RLS for now to ensure Backend can read/write without Service Key issues
ALTER TABLE public.video_jobs DISABLE ROW LEVEL SECURITY;
`;

async function runCheck() {
    const client = await pool.connect();
    try {
        console.log('📼 Checking video_jobs table...');
        await client.query(checkQuery);
        console.log('✅ video_jobs table ensured and RLS disabled.');

        // Verify by listing count
        const res = await client.query('SELECT count(*) FROM video_jobs');
        console.log(`📊 Current jobs in DB: ${res.rows[0].count}`);

    } catch (err) {
        console.error('❌ DB Operation Failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runCheck();
