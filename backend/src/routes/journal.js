import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const result = await pool.query(
    'SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT $2',
    [req.userId, limit]
  );
  res.json({ entries: result.rows });
});

router.post('/', async (req, res) => {
  const { trigger, mood, note, occurredAt } = req.body || {};
  if (!trigger && !mood && !note) {
    return res.status(400).json({ error: 'At least one of trigger, mood, or note is required' });
  }
  const result = await pool.query(
    `INSERT INTO journal_entries (user_id, trigger, mood, note, occurred_at)
     VALUES ($1, $2, $3, $4, COALESCE($5, now()))
     RETURNING *`,
    [req.userId, trigger || null, mood || null, note || null, occurredAt || null]
  );
  res.status(201).json({ entry: result.rows[0] });
});

export default router;
