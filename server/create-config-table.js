import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Fix dotenv path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const schema = `
-- System Config Table (Key-Value Store)
create table if not exists system_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Insert default config if not exists
insert into system_config (key, value)
values (
  'general', 
  '{"maintenanceMode": false, "allowSignup": true}'::jsonb
)
on conflict (key) do nothing;

insert into system_config (key, value)
values (
  'limits', 
  '{"free": {"daily": 10, "tokens": 50000}, "pro": {"daily": 100, "tokens": 500000}}'::jsonb
)
on conflict (key) do nothing;
`;

async function setupConfigTable() {
    const client = await pool.connect();
    try {
        console.log('Creating system_config table...');
        await client.query(schema);
        console.log('✅ system_config table created successfully!');
    } catch (err) {
        console.error('❌ Error creating table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupConfigTable();
