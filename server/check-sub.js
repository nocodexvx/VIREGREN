
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('stripe_customer_id', 'debug_final_test_1768544260195')
        .maybeSingle();

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (!data) {
        console.log("❌ Subscription debug_final_test_1768544260195 not found");
    } else {
        console.log(`✅ Subscription Found:`);
        console.log(`- ID: ${data.id}`);
        console.log(`- Status: ${data.status}`);
        console.log(`- Plan: ${data.plan_id}`);
    }
}

check();
