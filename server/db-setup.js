import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) dotenv.config(); // fallback

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const schema = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Subscriptions Table
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')),
  plan_id text,
  current_period_end timestamp with time zone,
  stripe_customer_id text,
  created_at timestamp with time zone default now()
);

-- AI Usage Logs Table
create table if not exists ai_usage_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  feature text,
  provider text,
  cost_tokens int,
  status text default 'success', 
  created_at timestamp with time zone default now()
);

-- Migrations (Idempotent)
alter table users add column if not exists role text default 'user';

-- Trigger to sync auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
  end if;
end $$;

-- Backfill existing users (Fix for current error)
insert into public.users (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;


`;

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');
    await client.query(schema);
    console.log('Database schema created successfully!');
  } catch (err) {
    console.error('Error creating database schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
