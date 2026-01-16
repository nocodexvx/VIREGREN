import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DIRECT_URL) dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function setupAdmin() {
    const client = await pool.connect();
    try {
        console.log('🔧 1. Verificando Schema (Coluna Role)...');

        // Add role column if strictly not exists
        await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role text DEFAULT 'user';
          RAISE NOTICE 'Coluna role adicionada!';
        END IF;
      END $$;
    `);

        console.log('✅ Schema OK.');

        // Identify user
        const email = 'yurigabriel160218@gmail.com';
        console.log(`👑 2. Promovendo usuário ${email} para ADMIN...`);

        const { data: users, error } = await supabase.from('users').select('id').eq('email', email);

        if (error || !users.length) {
            console.error('❌ Usuário não encontrado no banco público. Rode o sync novamente ou faça login.');
            return;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', email);

        if (updateError) {
            console.error('❌ Erro ao atualizar role:', updateError);
        } else {
            console.log('🎉 SUCESSO! Você agora é o DONO (Admin).');
            console.log('👉 Acesse: http://localhost:8082/admin');
        }

    } catch (err) {
        console.error('Crash:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

setupAdmin();
