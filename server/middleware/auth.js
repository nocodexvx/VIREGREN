import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const verifyToken = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) throw new Error('Invalid token');
    return user;
};

export const requireAuth = async (req, res, next) => {
    try {
        const user = await verifyToken(req);
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
};

export const requireAdmin = async (req, res, next) => {
    try {
        const user = await verifyToken(req);

        // BYPASS: Allow Owner directly via Environment Variable
        const envAdmins = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
        const adminEmails = ['admin@variagen.com', 'suporte@variagen.com', ...envAdmins];

        console.log(`[AuthMiddleware] Checking Admin access for: ${user.email}`);

        if (user.email && adminEmails.some(email => email.trim().toLowerCase() === user.email.toLowerCase())) {
            console.log('[AuthMiddleware] Access GRANTED via Email Bypass');
            req.user = user;
            return next();
        }

        // Standard Role Check (Will fail if column missing, but owner is safe now)
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (dbError || userData?.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied: Props only' });
        }

        // Attach user to request for further use
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({ error: err.message });
    }
};
