import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { createPixCharge } from '../services/syncpay.js';

const router = express.Router();

// Initialize Supabase (reusing env vars from index.js context or process.env)
// ideally passed from index.js, but let's create a client here for simplicity or middleware
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Service Role Key preferably for admin writes

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/payments/subscribe
router.post('/subscribe', async (req, res) => {
    try {
        const { userId, plan, customer } = req.body;

        if (!userId || !plan || !customer) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Determine amount based on plan (can be fetched from DB or hardcoded for MVP)
        let amount = 0;
        if (plan === 'pro_monthly') amount = 29.00;
        else if (plan === 'pro_yearly') amount = 290.00; // 12 * 29 saving?
        else if (plan === 'business_monthly') amount = 99.00;
        else if (plan === 'business_yearly') amount = 990.00;

        if (amount === 0) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        // Create PIX Charge
        console.log(`Creating PIX for user ${userId} amount ${amount}`);
        const pixData = await createPixCharge({
            amount,
            description: `VariaGen ${plan}`,
            customer
        });

        // Save to Subscriptions Table
        // We store the SyncPay identifier to match webhooks later
        const { data, error } = await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                user_id: userId,
                status: 'past_due', // 'pending' not in DB constraint. 'past_due' ensures no access until paid.
                plan_id: plan,
                stripe_customer_id: pixData.identifier, // storing SyncPay ID here to avoid schema change
                created_at: new Date()
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to save subscription' });
        }

        res.json({
            success: true,
            pix_code: pixData.pix_code,
            subscription_id: data.id,
            syncpay_id: pixData.identifier
        });

    } catch (error) {
        console.error('Subscribe error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
    try {
        const payload = req.body;
        console.log('Webhook received:', JSON.stringify(payload, null, 2));

        // Payload structure: { data: { id: "...", status: "completed", ... } }
        const transaction = payload.data;

        if (!transaction) {
            return res.status(400).send('Invalid payload');
        }

        const { id, status } = transaction;

        if (status === 'completed' || status === 'paid') {

            // SECURITY CHECK: Verify if this is real by asking SyncPay directly
            console.log(`Verifying transaction ${id} with SyncPay API...`);
            const realTransaction = await verifyTransaction(id);

            if (!realTransaction || (realTransaction.status !== 'completed' && realTransaction.status !== 'paid')) {
                console.warn(`🚨 FRAUD ALERT: Webhook says PAID but API says ${realTransaction?.status || 'NOT FOUND'}`);
                return res.status(400).send('Verification Failed');
            }

            console.log('✅ Transaction Verified via API');

            // Find subscription by syncpay_id (stored in stripe_customer_id column)
            const { data: sub, error: findError } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('stripe_customer_id', id) // or check externalreference if we set it
                .single();

            // NOTE: We rely on 'id' matching 'identifier' returned by cash-in.
            // Based on docs "identifier": "uuid..."
            // Webhook "id": "uuid..." and "idtransaction": "uuid..."
            // We assume "id" in webhook matches "identifier" in response.

            if (sub) {
                // Update subscription
                await supabase
                    .from('subscriptions')
                    .update({
                        status: 'active',
                        current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Mock 1 month
                    })
                    .eq('id', sub.id);

                console.log(`Subscription ${sub.id} activated!`);
            } else {
                console.warn(`No subscription found for SyncPay ID: ${id}`);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;
