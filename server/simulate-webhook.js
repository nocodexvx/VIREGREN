import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.SUPABASE_URL) dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function simulatePayment() {
    console.log('🕵️‍♂️ Procurando assinatura pendente...');

    // 1. Get the latest pending/past_due subscription
    const { data: sub, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'past_due') // The status we set in payments.js
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !sub) {
        console.error('❌ Nenhuma assinatura pendente encontrada.');
        return;
    }

    console.log(`✅ Assinatura encontrada: ${sub.id} (SyncPay ID: ${sub.stripe_customer_id})`);

    // 2. Simulate Webhook Payload
    const payload = {
        data: {
            id: sub.stripe_customer_id,
            status: 'paid',
            amount: 29.00,
            paid_at: new Date().toISOString()
        }
    };

    console.log('🔄 Enviando Webhook Simulado para o Servidor...');

    try {
        await axios.post('http://localhost:3000/api/payments/webhook', payload);
        console.log('🎉 SUCESSO! O servidor recebeu o pagamento.');
        console.log('👉 Seu plano deve estar ATIVO agora (Verifique no Banco ou Painel).');
    } catch (err) {
        console.error('❌ Erro ao chamar webhook:', err.message);
    }
}

simulatePayment();
