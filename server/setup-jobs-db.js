import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we load .env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

console.log('Connecting to:', process.env.DIRECT_URL || process.env.DATABASE_URL);

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const schema = `
-- Video Jobs Table for Persistence
create table if not exists video_jobs (
  job_id text primary key,
  user_id uuid references auth.users(id),
  status text not null default 'pending', 
  progress integer default 0,
  variations integer default 1,
  settings jsonb,
  outputs jsonb, 
  zip_path text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS (Allow users to see their own jobs)
alter table video_jobs enable row level security;

create policy "Users can select their own jobs"
  on video_jobs for select
  using ( auth.uid() = user_id );
  
create policy "Service role has full access"
  on video_jobs for all
  using ( true )
  with check ( true );
`;

async function setupDatabase() {
    const client = await pool.connect();
    try {
        console.log('Running schema migration...');
        await client.query(schema);
        console.log('Video Jobs table created successfully!');
    } catch (err) {
        console.error('Error creating video jobs table:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupDatabase();
