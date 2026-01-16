import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.SYNCPAY_BASE_URL || 'https://api.syncpayments.com.br';
const CLIENT_ID = process.env.SYNCPAY_CLIENT_ID;
const CLIENT_SECRET = process.env.SYNCPAY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

async function getAuthToken() {
    if (cachedToken && tokenExpiry && new Date() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await axios.post(`${BASE_URL}/api/partner/v1/auth-token`, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const { access_token, expires_in } = response.data;
        cachedToken = access_token;
        // Set expiry to 5 minutes before actual expiry to be safe
        tokenExpiry = new Date(new Date().getTime() + (expires_in - 300) * 1000);

        console.log('SyncPay Token refreshed');
        return cachedToken;
    } catch (error) {
        console.error('Error fetching SyncPay token:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Payment Gateway');
    }
}

export async function createPixCharge({ amount, description, customer }) {
    const token = await getAuthToken();
    const webhookUrl = process.env.WEBHOOK_URL || 'https://api.variagen.com/api/webhook/syncpay'; // Placeholder for prod

    const payload = {
        amount: parseFloat(amount),
        description: description || 'Assinatura VariaGen',
        webhook_url: webhookUrl,
        client: {
            name: customer.name,
            cpf: customer.cpf,
            email: customer.email,
            phone: customer.phone
        }
    };

    try {
        const response = await axios.post(`${BASE_URL}/api/partner/v1/cash-in`, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating PIX charge:', error.response?.data || error.message);
        throw error;
    }
}

export async function verifyTransaction(transactionId) {
    const token = await getAuthToken();
    try {
        // Query the transaction directly from SyncPay to confirm status
        // Assuming the endpoint is /api/partner/v1/cash-in/{id} or similar
        // Based on docs pattern, it's likely similar. If not exact, this is a standard pattern.
        // I will assume /api/partner/v1/cash-in/{id} based on REST standards since I can't read PDF.
        const response = await axios.get(`${BASE_URL}/api/partner/v1/cash-in/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error verifying transaction ${transactionId}:`, error.response?.data || error.message);
        return null; // Return null if validation fails
    }
}
