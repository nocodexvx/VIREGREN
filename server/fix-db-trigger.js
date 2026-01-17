import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const fixTriggerQuery = `
-- Drop old trigger to be safe (optional, but good practice)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the Handler Function to handle "Zombie Users" (Same email, diff ID)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  old_user_id uuid;
BEGIN
  -- Check if email already exists in public.users
  SELECT id INTO old_user_id FROM public.users WHERE email = new.email;

  IF old_user_id IS NOT NULL AND old_user_id <> new.id THEN
      -- Found a zombie record! (User deleted from Auth but not Public)
      -- Clean up dependencies so we can delete the old user
      DELETE FROM public.subscriptions WHERE user_id = old_user_id;
      DELETE FROM public.ai_usage_logs WHERE user_id = old_user_id;
      DELETE FROM public.users WHERE id = old_user_id;
  END IF;

  -- Insert the new user
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE
  SET email = excluded.email,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url;
      
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Also Fix RLS just in case that's blocking
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Allow system/service_role to do anything (optional, usually implied)
`;

async function runFix() {
    console.log('🔌 Connecting to DB to fix Triggers...');
    const client = await pool.connect();
    try {
        await client.query(fixTriggerQuery);
        console.log('✅ Trigger Fixed! "Zombie User" 422 Error should be gone.');
    } catch (err) {
        console.error('❌ Error fixing trigger:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runFix();
