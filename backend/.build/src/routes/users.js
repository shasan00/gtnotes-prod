"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pool_1 = require("../db/pool");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const result = await (0, pool_1.getPool)().query('SELECT id, first_name, last_name, email, role FROM users WHERE id = $1', [req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/me', auth_1.authenticate, async (req, res) => {
    try {
        const result = await (0, pool_1.getPool)().query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send(); // No Content
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
