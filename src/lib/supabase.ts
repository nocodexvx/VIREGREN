import { createClient } from '@supabase/supabase-js';

// As chaves devem estar no .env.local do Vite
// VITE_SUPABASE_URL e VITE_SUPABASE_KEY

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️  Supabase credenciais não encontradas. Verifique o .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
