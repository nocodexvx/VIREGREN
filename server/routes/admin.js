import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { requireAdmin } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// SERVICE ROLE CLIENT (Required for Admin User Actions & Bypassing RLS)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// LIST USERS
router.get('/users', requireAdmin, async (req, res) => {
    try {
        // Use Admin Client to bypass RLS policies
        const { data: users, error } = await supabaseAdmin
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
        const { role, plan } = req.body;
        const email = req.body.email?.trim();
        const password = req.body.password?.trim();
        const fullName = req.body.fullName?.trim();

        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
        }

        console.log(`[Admin] Creating user: ${email}`);

        // 1. Create Auth User (Supabase Auth)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            console.error("Auth Create Error:", authError);
            if (authError.message.includes("already registered") || authError.status === 422) {
                return res.status(409).json({ error: 'Este email já está cadastrado.' });
            }
            return res.status(400).json({ error: `Erro no Auth: ${authError.message}` });
        }

        const userId = authData.user.id;
        console.log(`[Admin] Auth user created: ${userId}`);

        // 2. Insert into 'users' table (Public Schema)
        // CRITICAL: Use supabaseAdmin to bypass RLS policies
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email,
                full_name: fullName,
                role: role || 'user',
                created_at: new Date()
            });

        if (dbError) {
            console.error("DB Insert Error:", dbError);
            // Attempt to cleanup Auth user if DB fails ensuring consistency
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(500).json({ error: `Erro ao salvar no banco: ${dbError.message}` });
        }

        // 3. Insert Subscription (if plan selected)
        // 3. Insert Subscription (if plan selected)
        let createdSubscription = null;
        if (plan && plan !== 'none') {
            const { data: subData, error: subError } = await supabaseAdmin
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    status: 'active', // Admin granted access
                    plan_id: plan,
                    current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year free
                    created_at: new Date()
                })
                .select()
                .single();

            if (subError) {
                console.error("Error creating manual subscription:", subError);
                // NOT blocking user creation, but logging it.
            } else {
                createdSubscription = subData;
                console.log(`[Admin] Manual subscription created: ${subData.id}`);
            }
        }

        res.json({ message: 'Usuário criado com sucesso!', user: authData.user });

    } catch (e) {
        console.error("Critical Error in create user:", e);
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

// DELETE USER
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete from Supabase Auth (This is the master record)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (authError) {
            console.error("Auth Delete Error:", authError);
            return res.status(400).json({ error: 'Falha ao excluir usuário do Auth.' });
        }

        // 2. Delete from Public Table (If cascade not set up, though usually it is. We do it to be safe)
        const { error: dbError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.warn("DB Delete Warning (might have cascaded already):", dbError);
        }

        res.json({ message: 'Usuário excluído permanentemente.' });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
