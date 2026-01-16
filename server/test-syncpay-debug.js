import { createPixCharge } from './services/syncpay.js';

// Mock Data
const mockCustomer = {
    name: "Debug User",
    cpf: "12345678900", // Invalid CPF might be rejected, let's hope for sandbox or use a generator if needed
    email: "debug@test.com",
    phone: "11999999999"
};

async function testPix() {
    try {
        console.log('Testing SyncPay PIX Creation...');
        const result = await createPixCharge({
            amount: 10.00,
            description: "Debug Charge",
            customer: mockCustomer
        });

        console.log('\n--- SYNC PAY API RESPONSE ---');
        console.log(JSON.stringify(result, null, 2));
        console.log('-----------------------------\n');

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPix();
