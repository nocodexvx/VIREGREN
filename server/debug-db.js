import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from root (assuming we run from root or server, let's try to be smart)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Fallback to parent .env if running from server dir
if (!process.env.SUPABASE_URL) {
    dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key (start):', supabaseKey ? supabaseKey.substring(0, 10) : 'MISSING');

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    try {
        console.log('1. Checking Users...');
        const { data: users, error: userError } = await supabase.from('users').select('id, email').limit(1);

        if (userError) {
            console.error('❌ User Fetch Error:', userError);
            return;
        }

        if (!users || users.length === 0) {
            console.error('❌ No users found in DB. Cannot test subscription without userId.');
            return;
        }

        const user = users[0];
        console.log('✅ Found User:', user.email);

        console.log('2. Attempting Insert Subscription...');
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: user.id,
                status: 'past_due',
                plan_id: 'debug_test',
                stripe_customer_id: 'debug_123',
                created_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Insert Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Insert Success:', data);
            // Cleanup
            await supabase.from('subscriptions').delete().eq('id', data.id);
        }

    } catch (e) {
        console.error('Crash:', e);
    }
}

debug();
