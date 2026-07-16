import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Relapses are logged as dated data points, not a shame-reset (BRD Section 6).
router.post('/', async (req, res) => {
  const { occurredAt, trigger, mood, note } = req.body || {};
  const result = await pool.query(
    `INSERT INTO smoking_events (user_id, occurred_at, trigger, mood, note)
     VALUES ($1, COALESCE($2, now()), $3, $4, $5)
     RETURNING *`,
    [req.userId, occurredAt || null, trigger || null, mood || null, note || null]
  );
  res.status(201).json({ event: result.rows[0] });
});

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM smoking_events WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT 100',
    [req.userId]
  );
  res.json({ events: result.rows });
});

export default router;
