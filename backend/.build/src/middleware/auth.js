"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.isAuthenticated = isAuthenticated;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const pool_1 = require("../db/pool");
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ error: "Missing token" });
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ error: "Server misconfigured" });
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        const result = await (0, pool_1.getPool)().query("SELECT * FROM users WHERE id = $1", [payload.sub]);
        if (result.rowCount === 0) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = result.rows[0];
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
// Middleware for checking if user is authenticated (using both session and JWT)
function isAuthenticated(req, res, next) {
    // Check if user is authenticated via session (from Passport)
    if (req.user) {
        return next();
    }
    // Check if user is authenticated via JWT token
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: 'Server misconfigured' });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = { id: payload.sub, role: payload.role };
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
// Middleware for checking if user is admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ error: 'Admin access required' });
    }
}
