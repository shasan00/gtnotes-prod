"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("../db/pool");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function promoteUser(email) {
    const pool = (0, pool_1.getPool)();
    try {
        const res = await pool.query('UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role', ['admin', email]);
        if (res.rowCount === 0) {
            console.log(`No user found with email: ${email}`);
        }
        else {
            console.log('User promoted to admin:', res.rows[0]);
        }
    }
    catch (err) {
        console.error('Error promoting user:', err);
    }
    finally {
        await pool.end();
    }
}
const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
}
promoteUser(email);
