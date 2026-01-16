import { createClient } from '@supabase/supabase-js';

// Define window interface for runtime injection
declare global {
    interface Window {
        _env_: {
            VITE_SUPABASE_URL: string;
            VITE_SUPABASE_KEY: string;
        }
    }
}

// Runtime config (Hostinger) OR Build config (Local)
const supabaseUrl = window._env_?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = window._env_?.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️  Supabase credenciais não encontradas. Verifique o .env ou injeção runtime.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
