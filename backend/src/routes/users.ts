import { Router } from 'express';
import { getPool } from '../db/pool';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/me', authenticate, async (req: any, res) => {
  try {
    const result = await getPool().query(
      'SELECT id, first_name, last_name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/me', authenticate, async (req: any, res) => {
  try {
    const result = await getPool().query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
