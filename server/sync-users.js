import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.SUPABASE_URL) dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Must be SERVICE ROLE key

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncUsers() {
    console.log('🔄 Syncing Auth Users to Public Table...');

    // 1. Fetch all users from Auth API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('❌ Failed to list users:', error);
        return;
    }

    console.log(`found ${users.length} users in Auth.`);

    // 2. Upsert into public.users
    for (const user of users) {
        const { id, email, user_metadata } = user;
        const fullName = user_metadata?.full_name || email?.split('@')[0];
        const avatarUrl = user_metadata?.avatar_url || '';

        const { error: upsertError } = await supabase
            .from('users')
            .upsert({
                id,
                email,
                full_name: fullName,
                avatar_url: avatarUrl
                // role: 'user' // Column missing, skip for now
            }, { onConflict: 'id' });

        if (upsertError) {
            console.error(`❌ Failed to sync user ${email}:`, upsertError);
        } else {
            console.log(`✅ Synced user: ${email}`);
        }
    }

    console.log('🎉 Sync Complete!');
}

syncUsers();
