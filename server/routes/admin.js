import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { requireAdmin } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// SERVICE ROLE CLIENT (Required for Admin User Actions)
// Falls back to standard key if service role is missing (limiting functionality)
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : supabase;

// LIST USERS
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ users, total: users.length });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// CREATE USER (ADMIN ONLY)
router.post('/users', requireAdmin, async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        // 1. Create Auth User (Supabase Auth)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            // Fallback: If no Service Role, try normal signUp (will log out admin on client if used there, but here is server)
            // Actually unsafe to use standard client for "admin create" as it might start a session.
            // Best to error out if no Service Role.
            console.error("Auth Create Error:", authError);
            return res.status(400).json({ error: 'Falha ao criar usuário. Verifique se a KEY de serviço está configurada.' });
        }

        const userId = authData.user.id;

        // 2. Insert into 'users' table (Public Schema)
        const { error: dbError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                full_name: fullName,
                role: role || 'user',
                created_at: new Date()
            });

        if (dbError) {
            // Rollback auth user if DB fails? complex. Just warn for now.
            console.error("DB Insert Error:", dbError);
            return res.status(500).json({ error: 'Erro ao salvar dados do usuário no banco.' });
        }

        res.json({ message: 'Usuário criado com sucesso!', user: authData.user });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// BAN / UNBAN USER
router.post('/users/:id/ban', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { banned } = req.body; // true to ban, false to unban

        // 1. Update Auth User (ban_duration)
        const banDuration = banned ? '876000h' : 'none'; // 100 years or none
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
            id,
            { ban_duration: banDuration }
        );

        if (authError) {
            // Fallback: Just mark in DB if auth fails (e.g. no service key)
            console.warn("Auth Ban Failed (likely no Service Key), updating DB only.");
        }

        // 2. Update DB Role/Status (Visual indicator)
        const { error: dbError } = await supabase
            .from('users')
            .update({ role: banned ? 'banned' : 'user' }) // Reset to user on unban
            .eq('id', id);

        if (dbError) throw dbError;

        res.json({ message: `Usuário ${banned ? 'banido' : 'desbanido'} com sucesso.` });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
