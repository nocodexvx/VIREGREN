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

async function checkAndFixSchema() {
    const client = await pool.connect();
    try {
        console.log('🕵️ Checking public.users table schema...');

        // Check if 'role' column exists
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'role';
    `);

        if (res.rows.length === 0) {
            console.log('⚠️ Column "role" MISSING in public.users. Adding it now...');
            await client.query(`ALTER TABLE public.users ADD COLUMN role text DEFAULT 'user'`);
            console.log('✅ Column "role" added successfully.');
        } else {
            console.log('✅ Column "role" already exists.');
        }

        // Verify other columns if needed
        console.log('🔍 Current columns in public.users:');
        const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users';
    `);
        cols.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));

    } catch (err) {
        console.error('❌ Schema Check Failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

checkAndFixSchema();
