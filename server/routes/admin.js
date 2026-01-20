import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { requireAdmin } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// SERVICE ROLE CLIENT (Required for Admin User Actions & Bypassing RLS)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Admin actions (create/delete users) may fail with '400 Bad Request'.");
}

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// LIST USERS (Paginated & Filtered)
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Base query
        let query = supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' });

        // Apply filters
        if (role && role !== 'Todos' && role !== 'all') {
            query = query.eq('role', role);
        }

        if (search) {
            // ILIKE for case-insensitive search on email or full_name
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        // Apply pagination & ordering
        query = query.order('created_at', { ascending: false })
            .range(from, to);

        const { data: users, error, count } = await query;

        if (error) throw error;

        res.json({
            users,
            total: count,
            page,
            pages: Math.ceil(count / limit)
        });
    } catch (e) {
        console.error("Error fetching users:", e);
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

        // 0. ANTIGRAVITY FIX: Check for "Zombie" users in public DB
        // If a user exists in public.users but NOT in Auth (zombie), the trigger will fail on unique email constraint.
        const { data: zombieUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (zombieUser) {
            console.warn(`[Admin] Found zombie user ${zombieUser.id} with email ${email}. Cleaning up...`);
            await supabaseAdmin.from('users').delete().eq('id', zombieUser.id);
            // Also clean subscriptions to be safe
            await supabaseAdmin.from('subscriptions').delete().eq('user_id', zombieUser.id);
        }

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

        // 2. UPDATE User Role (Public Schema)
        // trigger 'on_auth_user_created' already created the public.users row.
        // We just need to update the role if it was set to something other than 'user'
        if (role && role !== 'user') {
            const { error: dbError } = await supabaseAdmin
                .from('users')
                .update({ role })
                .eq('id', userId);

            if (dbError) {
                console.error("DB Update Role Error:", dbError);
                // Non-critical: user is created, just role is wrong.
            }
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
        const { error: dbError } = await supabaseAdmin
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
            // Ignore "User not found" error to allow cleaning up public table
            if (!authError.message.includes("User not found") && authError.status !== 404) {
                return res.status(400).json({ error: `Falha ao excluir usuário do Auth: ${authError.message}` });
            }
            console.warn("User not found in Auth, proceeding to delete from DB.");
        }

        // 2. Delete from Public Table (If cascade not set up, though usually it is. We do it to be safe)
        // 1.5. FORCE DELETE Dependencies manually (In case Cascade is missing in DB)
        // This prevents FK violation errors
        await supabaseAdmin.from('subscriptions').delete().eq('user_id', id);
        await supabaseAdmin.from('ai_usage_logs').delete().eq('user_id', id);
        await supabaseAdmin.from('video_jobs').delete().eq('user_id', id);

        // 2. Delete from Public Table (Use Admin client to bypass RLS)
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error("DB Delete Error:", dbError);
            return res.status(500).json({ error: `Erro ao excluir do banco de dados: ${dbError.message} (Verifique constraints)` });
        }

        res.json({ message: 'Usuário excluído permanentemente.' });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 1. STATS & DASHBOARD
// ==========================================
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        // Busca real de contagens
        const { count: userCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });

        // Buscar assinaturas ativas
        const { data: subs, error } = await supabaseAdmin.from('subscriptions').select('plan_id').eq('status', 'active');

        console.log('[Stats Debug] Subs found:', subs?.length);
        console.log('[Stats Debug] Subs Error:', error);
        console.log('[Stats Debug] User Count:', userCount);

        if (error) throw error;

        // Calcular MRR real
        const mrr = subs.reduce((total, sub) => {
            let price = 0;
            switch (sub.plan_id) {
                case 'business_monthly': price = 99; break;
                case 'business_yearly': price = 990 / 12; break; // Monthly equivalent
                case 'pro_monthly': price = 29; break;
                case 'pro_yearly': price = 290 / 12; break; // Monthly equivalent
                case 'tester': price = 5; break;
                default: price = 0;
            }
            return total + price;
        }, 0);

        res.json({
            mrr,
            activeSubscribers: subs.length,
            totalUsers: userCount || 0,
            churnRate: 0 // Mock por enquanto
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 2. LOGS
// ==========================================
router.get('/logs', requireAdmin, async (req, res) => {
    try {
        const { data: logs, error } = await supabaseAdmin
            .from('ai_usage_logs')
            .select('*, users(email)')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        res.json({ logs: logs || [] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 3. SUBSCRIPTIONS MANAGEMENT
// ==========================================
router.get('/subscriptions', requireAdmin, async (req, res) => {
    try {
        const { data: subs, error } = await supabaseAdmin
            .from('subscriptions')
            .select('*, users(email, full_name, avatar_url)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ subscriptions: subs || [] });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/subscriptions/:id/cancel', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled', current_period_end: new Date() })
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Assinatura cancelada com sucesso.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.delete('/subscriptions/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from('subscriptions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Assinatura removida com sucesso.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 4. SYSTEM CONFIG
// ==========================================
router.get('/config', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from('system_config').select('*');

        // Convert array to object key-value
        const config = {};
        if (data) {
            data.forEach(item => {
                config[item.key] = item.value;
            });
        }

        res.json(config);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/config/status', requireAdmin, async (req, res) => {
    // Testar conexão real
    const { error } = await supabaseAdmin.from('users').select('id').limit(1);

    // Verificar API Key do Google
    const googleKey = process.env.GOOGLE_AI_API_KEY;

    res.json({
        googleAi: { // Changed to match frontend expectation (camelCase)
            configured: !!googleKey
        },
        database: {
            type: 'supabase (production)',
            status: error ? 'error' : 'connected'
        }
    });
});

router.post('/config', requireAdmin, async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || !value) return res.status(400).json({ error: 'Key and Value required' });

        const { error } = await supabaseAdmin
            .from('system_config')
            .upsert({ key, value, updated_at: new Date() });

        if (error) throw error;
        res.json({ message: 'Configuração salva.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/admin/subscriptions/:id/refund
router.post('/subscriptions/:id/refund', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Mark as Refunded in DB (Revoke Access)
        const { error } = await supabaseAdmin
            .from('subscriptions')
            .update({
                status: 'refunded',
                current_period_end: new Date() // Expire immediately
            })
            .eq('id', id);

        if (error) throw error;

        // TODO: Call SyncPay Refund API here if docs available
        // e.g., await syncPay.refund(stripe_customer_id)

        res.json({ message: 'Assinatura marcada como reembolsada.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
