
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
    // Get user
    const { data: users } = await supabase.from('users').select('id').limit(1);
    if (!users || users.length === 0) {
        console.error('No users found');
        return;
    }

    const TEST_ID = 'debug_final_test_' + Date.now();

    // Insert
    const { data, error } = await supabase
        .from('subscriptions')
        .insert({
            user_id: users[0].id,
            status: 'past_due',
            plan_id: 'debug_plan',
            stripe_customer_id: TEST_ID,
            created_at: new Date()
        })
        .select()
        .single();

    if (error) {
        console.error('Insert Failed:', error);
    } else {
        console.log('✅ Created Persistent Sub:', data.id);
        console.log('SyncPay ID:', TEST_ID);
    }
}

run();
