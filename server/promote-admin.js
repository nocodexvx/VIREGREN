import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!process.env.DATABASE_URL) dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('Usage: node server/promote-admin.js <email>');
    process.exit(1);
}

async function promoteUser() {
    const client = await pool.connect();
    try {
        console.log(`Promoting ${targetEmail} to admin...`);
        const res = await client.query(
            `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role`,
            [targetEmail]
        );

        if (res.rows.length === 0) {
            console.log('❌ User not found!');
        } else {
            console.log('✅ User promoted successfully:', res.rows[0]);
        }
    } catch (err) {
        console.error('Error promoting user:', err);
    } finally {
        client.release();
        pool.end();
    }
}

promoteUser();
