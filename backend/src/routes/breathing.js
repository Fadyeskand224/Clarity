import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const SESSION_TYPES = new Set(['craving_sos', 'box_breathing', 'urge_surfing', 'wind_down']);

router.post('/', async (req, res) => {
  const { sessionType, durationSeconds, preUrgeRating, postUrgeRating } = req.body || {};
  if (!SESSION_TYPES.has(sessionType)) {
    return res.status(400).json({ error: `sessionType must be one of ${[...SESSION_TYPES].join(', ')}` });
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return res.status(400).json({ error: 'durationSeconds must be a positive number' });
  }

  const result = await pool.query(
    `INSERT INTO breathing_sessions (user_id, session_type, duration_seconds, pre_urge_rating, post_urge_rating)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, sessionType, Math.round(durationSeconds), preUrgeRating ?? null, postUrgeRating ?? null]
  );
  res.status(201).json({ session: result.rows[0] });
});

router.get('/history', async (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const result = await pool.query(
    'SELECT * FROM breathing_sessions WHERE user_id = $1 ORDER BY completed_at DESC LIMIT $2',
    [req.userId, limit]
  );
  const countResult = await pool.query('SELECT COUNT(*)::int AS count FROM breathing_sessions WHERE user_id = $1', [
    req.userId,
  ]);
  res.json({ sessions: result.rows, totalCompleted: countResult.rows[0].count });
});

export default router;
