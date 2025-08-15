import { getPool } from '../db/pool';
import dotenv from 'dotenv';

dotenv.config();

async function promoteUser(email: string) {
  const pool = getPool();
  try {
    const res = await pool.query('UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role', ['admin', email]);
    if (res.rowCount === 0) {
      console.log(`No user found with email: ${email}`);
    } else {
      console.log('User promoted to admin:', res.rows[0]);
    }
  } catch (err) {
    console.error('Error promoting user:', err);
  } finally {
    await pool.end();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address.');
  process.exit(1);
}

promoteUser(email);
